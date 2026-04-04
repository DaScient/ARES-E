/* ==========================================================================
 * ARES-E Alert Engine
 * ==========================================================================
 *
 * PURPOSE:
 *   Evaluates incoming telemetry against defined threshold rules and
 *   generates actionable alerts with severity, module attribution, and
 *   recommended actions. Maintains a rolling alert log for the dashboard.
 *
 * EDUCATIONAL NOTES:
 *
 *   RULE-BASED ALERTING:
 *   This engine uses declarative threshold rules — a common pattern in
 *   infrastructure monitoring (Prometheus Alertmanager, PagerDuty, etc.).
 *   Each rule specifies:
 *     - metric:    Which field to evaluate
 *     - condition: Comparison operator + threshold value
 *     - severity:  critical | warning | info
 *     - message:   Human-readable alert description
 *     - action:    Recommended response
 *
 *   ALERT DEDUPLICATION:
 *   In production systems, repeated alerts for the same condition are
 *   "deduplicated" — only the first occurrence fires, then the alert
 *   enters a "cooldown" period. We implement this with a TTL-based
 *   cooldown cache to prevent alert fatigue.
 *
 *   ALERT FATIGUE:
 *   Too many alerts desensitize operators. Real systems combat this via:
 *     - Deduplication (implemented here)
 *     - Alert grouping / correlation
 *     - Escalation tiers (info → warning → critical)
 *     - Suppression during maintenance windows
 *
 * ARCHITECTURE:
 *   AlertEngine
 *     ├── Rule definitions (per module)
 *     ├── Evaluator (runs rules against data)
 *     ├── Cooldown cache (deduplication)
 *     └── Alert log (ring buffer of recent alerts)
 *
 * ========================================================================== */

class AlertEngine {

  /* -----------------------------------------------------------------------
   * CONSTRUCTOR
   * -----------------------------------------------------------------------
   * @param {object} config
   *   maxAlerts (number)      — Max alerts to store in the log. Default: 50
   *   cooldownMs (number)     — Dedup cooldown per rule (ms). Default: 15000
   *   onAlert (function)      — Callback when a new alert fires
   * ----------------------------------------------------------------------- */
  constructor(config = {}) {
    this.maxAlerts = config.maxAlerts ?? 50;
    this.cooldownMs = config.cooldownMs ?? 15000;
    this.onAlert = config.onAlert ?? null;

    /* Rolling alert log (newest first) */
    this.alerts = [];

    /* Cooldown cache: { ruleId: lastFiredTimestamp }
     * EDUCATIONAL TIP — TTL Caches:
     *   A Time-To-Live cache automatically "expires" entries after a set
     *   duration. Here we check `now - lastFired > cooldownMs` instead
     *   of actively purging, which is simpler and cache-friendly. */
    this._cooldowns = {};

    /* Alert counter for generating unique IDs */
    this._counter = 0;

    /* ------------------------------------------------------------------
     * THRESHOLD RULES
     * ------------------------------------------------------------------
     * Each rule is a declarative object describing one alertable condition.
     * This approach makes it easy to add/modify rules without changing
     * the evaluation logic.
     *
     * Structure:
     *   {
     *     id:       Unique rule identifier
     *     module:   'EWIS' | 'WOIK' | 'PHIAK'
     *     metric:   Property name in the telemetry point
     *     op:       '>' | '<' | '>=' | '<=' | '==' | '!='
     *     threshold: Numeric threshold value
     *     severity: 'critical' | 'warning' | 'info'
     *     message:  Alert description (can use {{value}} placeholder)
     *     action:   Recommended operator action
     *   }
     * ------------------------------------------------------------------ */
    this.rules = [
      /* =================== EWIS Rules =================== */
      {
        id: 'EWIS_PUE_WARN',
        module: 'EWIS',
        metric: 'pue',
        op: '>',
        threshold: 1.25,
        severity: 'warning',
        message: 'PUE elevated at {{value}} (threshold: 1.25)',
        action: 'Check cooling systems. Consider load redistribution.',
      },
      {
        id: 'EWIS_PUE_CRIT',
        module: 'EWIS',
        metric: 'pue',
        op: '>',
        threshold: 1.45,
        severity: 'critical',
        message: 'PUE critical at {{value}} — cooling insufficient',
        action: 'IMMEDIATE: Activate emergency cooling. Shed non-critical loads.',
      },
      {
        id: 'EWIS_GRID_WARN',
        module: 'EWIS',
        metric: 'gridStability',
        op: '<',
        threshold: 90,
        severity: 'warning',
        message: 'Grid stability degraded to {{value}}%',
        action: 'Monitor grid feeds. Prepare generator failover.',
      },
      {
        id: 'EWIS_GRID_CRIT',
        module: 'EWIS',
        metric: 'gridStability',
        op: '<',
        threshold: 80,
        severity: 'critical',
        message: 'Grid stability critical at {{value}}% — fault detected',
        action: 'IMMEDIATE: Initiate generator failover. Isolate faulty feed.',
      },
      {
        id: 'EWIS_UPS_WARN',
        module: 'EWIS',
        metric: 'upsCharge',
        op: '<',
        threshold: 70,
        severity: 'warning',
        message: 'UPS battery at {{value}}% — draining',
        action: 'Verify generator status. Reduce non-critical loads.',
      },
      {
        id: 'EWIS_VOLTAGE_CRIT',
        module: 'EWIS',
        metric: 'gridVoltage',
        op: '<',
        threshold: 200,
        severity: 'critical',
        message: 'Grid undervoltage: {{value}}V (nominal: 240V)',
        action: 'IMMEDIATE: Equipment at risk. Switch to UPS/generator.',
      },

      /* =================== WOIK Rules =================== */
      {
        id: 'WOIK_PRESS_WARN',
        module: 'WOIK',
        metric: 'pressurePSI',
        op: '<',
        threshold: 55,
        severity: 'warning',
        message: 'Network pressure low at {{value}} PSI (min: 60 PSI)',
        action: 'Check pump stations. Monitor for potential pipe burst.',
      },
      {
        id: 'WOIK_PRESS_CRIT',
        module: 'WOIK',
        metric: 'pressurePSI',
        op: '<',
        threshold: 40,
        severity: 'critical',
        message: 'Critical pressure drop: {{value}} PSI — possible pipe burst',
        action: 'IMMEDIATE: Dispatch field crew. Isolate affected zone valves.',
      },
      {
        id: 'WOIK_TURB_WARN',
        module: 'WOIK',
        metric: 'turbidityNTU',
        op: '>',
        threshold: 0.5,
        severity: 'warning',
        message: 'Turbidity elevated at {{value}} NTU (limit: 1.0 NTU)',
        action: 'Increase monitoring frequency. Check treatment processes.',
      },
      {
        id: 'WOIK_TURB_CRIT',
        module: 'WOIK',
        metric: 'turbidityNTU',
        op: '>',
        threshold: 1.0,
        severity: 'critical',
        message: 'Turbidity exceeds regulatory limit: {{value}} NTU',
        action: 'IMMEDIATE: Isolate intake. Activate backup supply. Notify regulators.',
      },
      {
        id: 'WOIK_PH_WARN',
        module: 'WOIK',
        metric: 'pH',
        op: '<',
        threshold: 6.5,
        severity: 'warning',
        message: 'pH below safe range: {{value}} (min: 6.5)',
        action: 'Check chemical dosing system. Sample for confirmation.',
      },
      {
        id: 'WOIK_SCADA_CRIT',
        module: 'WOIK',
        metric: 'scadaUptime',
        op: '<',
        threshold: 95,
        severity: 'critical',
        message: 'SCADA communications degraded: {{value}}% uptime',
        action: 'IMMEDIATE: Switch to manual monitoring. Investigate comms link.',
      },

      /* =================== PHIAK Rules =================== */
      {
        id: 'PHIAK_ED_WARN',
        module: 'PHIAK',
        metric: 'edOccupancy',
        op: '>',
        threshold: 85,
        severity: 'warning',
        message: 'ED occupancy elevated at {{value}}% (threshold: 85%)',
        action: 'Consider diversion. Expedite discharges. Alert bed management.',
      },
      {
        id: 'PHIAK_ED_CRIT',
        module: 'PHIAK',
        metric: 'edOccupancy',
        op: '>',
        threshold: 95,
        severity: 'critical',
        message: 'ED at {{value}}% capacity — surge protocol recommended',
        action: 'IMMEDIATE: Activate surge protocol. Divert ambulances. Call back staff.',
      },
      {
        id: 'PHIAK_ICU_WARN',
        module: 'PHIAK',
        metric: 'icuOccupancy',
        op: '>',
        threshold: 80,
        severity: 'warning',
        message: 'ICU occupancy elevated at {{value}}%',
        action: 'Review pending discharges. Prepare step-down transfers.',
      },
      {
        id: 'PHIAK_ILI_WARN',
        module: 'PHIAK',
        metric: 'iliSignal',
        op: '>',
        threshold: 3.0,
        severity: 'warning',
        message: 'ILI syndromic signal exceeds EARS-C2 threshold: {{value}}',
        action: 'Enhance surveillance. Issue provider advisory. No PHI accessed.',
      },
      {
        id: 'PHIAK_VENT_CRIT',
        module: 'PHIAK',
        metric: 'ventAvailable',
        op: '<',
        threshold: 15,
        severity: 'critical',
        message: 'Ventilator spare capacity critically low: {{value}}%',
        action: 'IMMEDIATE: Request ventilators from regional stockpile.',
      },
    ];
  }


  /* -----------------------------------------------------------------------
   * EVALUATE
   * -----------------------------------------------------------------------
   * Run all rules against a telemetry snapshot and generate alerts.
   *
   * @param {object} data — { ewis: {...}, woik: {...}, phiak: {...} }
   * @returns {Array<object>} — Array of newly fired alerts (may be empty)
   *
   * EDUCATIONAL TIP — Rule Engine Pattern:
   *   This is a simple forward-chaining rule engine: for each rule, check
   *   the condition against the data and fire if true. Production systems
   *   (Drools, OPA) support much more complex rule graphs, but the core
   *   concept is the same.
   * ----------------------------------------------------------------------- */
  evaluate(data) {
    const now = Date.now();
    const newAlerts = [];

    for (const rule of this.rules) {
      /* Get the data source for this rule's module */
      const moduleKey = rule.module.toLowerCase();
      const moduleData = data[moduleKey];
      if (!moduleData) continue;

      /* Get the metric value */
      const value = moduleData[rule.metric];
      if (value === undefined || value === null) continue;

      /* Evaluate the condition */
      let fired = false;
      switch (rule.op) {
        case '>':   fired = value > rule.threshold;  break;
        case '<':   fired = value < rule.threshold;  break;
        case '>=':  fired = value >= rule.threshold; break;
        case '<=':  fired = value <= rule.threshold; break;
        case '==':  fired = value === rule.threshold; break;
        case '!=':  fired = value !== rule.threshold; break;
      }

      if (!fired) continue;

      /* Check cooldown — deduplicate rapid-fire alerts */
      if (this._cooldowns[rule.id] && (now - this._cooldowns[rule.id]) < this.cooldownMs) {
        continue;
      }
      this._cooldowns[rule.id] = now;

      /* Build the alert object */
      const alert = {
        id: `ALR-${(++this._counter).toString().padStart(4, '0')}`,
        ruleId: rule.id,
        module: rule.module,
        metric: rule.metric,
        value: value,
        threshold: rule.threshold,
        severity: rule.severity,
        message: rule.message.replace('{{value}}', typeof value === 'number' ? value.toFixed(1) : value),
        action: rule.action,
        timestamp: now,
        timeStr: new Date(now).toLocaleTimeString('en-US', { hour12: false }),
      };

      /* Add to the log (newest first) */
      this.alerts.unshift(alert);
      if (this.alerts.length > this.maxAlerts) this.alerts.pop();

      newAlerts.push(alert);

      /* Fire the callback if registered */
      if (this.onAlert) {
        this.onAlert(alert);
      }
    }

    return newAlerts;
  }


  /* -----------------------------------------------------------------------
   * GET ALERTS BY SEVERITY
   * ----------------------------------------------------------------------- */
  getAlertsBySeverity(severity) {
    return this.alerts.filter(a => a.severity === severity);
  }

  /* -----------------------------------------------------------------------
   * GET ALERT COUNTS (for KPI display)
   * ----------------------------------------------------------------------- */
  getCounts() {
    const counts = { critical: 0, warning: 0, info: 0, total: 0 };
    for (const a of this.alerts) {
      counts[a.severity] = (counts[a.severity] || 0) + 1;
      counts.total++;
    }
    return counts;
  }

  /* -----------------------------------------------------------------------
   * CLEAR ALL ALERTS
   * ----------------------------------------------------------------------- */
  clearAll() {
    this.alerts = [];
    this._cooldowns = {};
    this._counter = 0;
  }
}


/* -----------------------------------------------------------------------
 * MODULE EXPORT
 * ----------------------------------------------------------------------- */
window.AlertEngine = AlertEngine;
