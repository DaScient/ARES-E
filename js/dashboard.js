/* ==========================================================================
 * ARES-E Dashboard Controller — Main Application Logic
 * ==========================================================================
 *
 * PURPOSE:
 *   Orchestrates all dashboard modules: SyntheticDataEngine, ChartManager,
 *   AlertEngine, and ForecastEngine. Manages the real-time update loop,
 *   DOM updates, and user interactions.
 *
 * EDUCATIONAL NOTES:
 *
 *   APPLICATION ARCHITECTURE — MVC-ish Pattern:
 *   While this isn't a full MVC framework, we follow the same separation:
 *     - Model:      SyntheticDataEngine (data) + AlertEngine (rules)
 *     - View:       ChartManager (charts) + DOM elements (KPIs, tables)
 *     - Controller: This file (DashboardController) — wires them together
 *
 *   REAL-TIME UPDATE LOOP:
 *   We use `setInterval` for the primary data tick. For production dashboards,
 *   you'd replace this with WebSocket or Server-Sent Events (SSE) connected
 *   to a real telemetry backend. The architecture of this controller makes
 *   swapping the data source straightforward — just replace the `tick()` call.
 *
 *   requestAnimationFrame vs setInterval:
 *   We DON'T use rAF here because our data generation isn't tied to rendering.
 *   rAF is ideal for smooth visual animations; setInterval is fine for
 *   periodic data-driven updates at a fixed frequency.
 *
 * LIFECYCLE:
 *   1. DOM loaded → init() called
 *   2. Backfill historical data → populate charts
 *   3. Start real-time tick loop (every 2 seconds)
 *   4. Each tick: generate data → evaluate alerts → update charts & DOM
 *
 * ========================================================================== */

class DashboardController {

  /* -----------------------------------------------------------------------
   * CONSTRUCTOR
   * ----------------------------------------------------------------------- */
  constructor() {
    /* Module instances — created in init() after DOM is ready */
    this.dataEngine = null;
    this.chartManager = null;
    this.alertEngine = null;
    this.forecastEngine = null;

    /* Update loop handle */
    this._tickInterval = null;
    this.TICK_RATE_MS = 2000;  // 2 seconds between data points

    /* Latest data snapshot (used by DOM updaters) */
    this.latestData = null;

    /* Audio alert bleep (optional — can be disabled) */
    this.audioEnabled = false;
  }


  /* -----------------------------------------------------------------------
   * INIT — Bootstrap the Dashboard
   * -----------------------------------------------------------------------
   * Called once when the DOM is fully loaded. Sets up all modules,
   * generates initial history, and starts the live update loop.
   * ----------------------------------------------------------------------- */
  init() {
    console.log('[ARES-E] Dashboard initializing...');

    /* ----- 1. Instantiate core modules ----- */
    this.dataEngine = new SyntheticDataEngine({
      seed: 42,           // Reproducible initial state
      anomalyRate: 0.015, // ~1.5% chance of anomaly per tick
      noiseScale: 1.0,
    });

    this.chartManager = new ChartManager();

    this.alertEngine = new AlertEngine({
      maxAlerts: 50,
      cooldownMs: 15000,
      onAlert: (alert) => this._onNewAlert(alert),
    });

    this.forecastEngine = new ForecastEngine();

    /* ----- 2. Backfill historical data for chart population ----- */
    const history = this.dataEngine.backfill(60, 2000);

    /* ----- 3. Initialize all charts with historical data ----- */
    this.chartManager.initEWISPrimary(history.ewis);
    this.chartManager.initEWISSecondary(history.ewis);
    this.chartManager.initWOIKPrimary(history.woik);
    this.chartManager.initWOIKSecondary(history.woik);
    this.chartManager.initPHIAKPrimary(history.phiak);
    this.chartManager.initPHIAKSecondary(history.phiak);
    this.chartManager.initLOERadar();

    /* ----- 4. Initialize forecast chart ----- */
    const loeForecast = this.forecastEngine.generateLOEForecast();
    this.chartManager.initForecastChart(
      loeForecast.historicalLabels,
      loeForecast.historicalData,
      loeForecast.forecastLabels,
      loeForecast.forecastData,
      loeForecast.upperBound,
      loeForecast.lowerBound
    );

    /* ----- 5. Populate initial KPIs and DOM elements ----- */
    const lastEwis = history.ewis[history.ewis.length - 1];
    const lastWoik = history.woik[history.woik.length - 1];
    const lastPhiak = history.phiak[history.phiak.length - 1];
    this.latestData = { ewis: lastEwis, woik: lastWoik, phiak: lastPhiak };

    this._updateKPIs(this.latestData);
    this._updateGauges(this.latestData);
    this._updateForecastTable(this.latestData);
    this._updateSimTable();

    /* ----- 6. Start the clock ----- */
    this._startClock();

    /* ----- 7. Start real-time update loop ----- */
    this._startTicking();

    console.log('[ARES-E] Dashboard ready. Tick rate:', this.TICK_RATE_MS, 'ms');
  }


  /* -----------------------------------------------------------------------
   * MAIN TICK — Called Every TICK_RATE_MS
   * -----------------------------------------------------------------------
   * This is the heartbeat of the dashboard. Each tick:
   *   1. Generates new synthetic telemetry
   *   2. Evaluates alert rules against the new data
   *   3. Pushes new data to charts (streaming update)
   *   4. Updates KPI cards, gauges, and other DOM elements
   * ----------------------------------------------------------------------- */
  _tick() {
    const snapshot = this.dataEngine.tick();
    this.latestData = snapshot;

    /* --- Evaluate alerts --- */
    this.alertEngine.evaluate(snapshot);

    /* --- Update charts with new data points --- */
    const label = new Date(snapshot.ewis.timestamp).toLocaleTimeString(
      'en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }
    );

    /* EWIS charts */
    this.chartManager.pushData('chart-ewis-primary', label,
      [snapshot.ewis.pue, snapshot.ewis.gridStability]);
    this.chartManager.pushData('chart-ewis-secondary', label,
      [snapshot.ewis.gpuUtil, snapshot.ewis.energyPerToken]);

    /* WOIK charts */
    this.chartManager.pushData('chart-woik-primary', label,
      [snapshot.woik.pressurePSI, snapshot.woik.flowRateGPM]);
    this.chartManager.pushData('chart-woik-secondary', label,
      [snapshot.woik.turbidityNTU, snapshot.woik.pH]);

    /* PHIAK charts */
    this.chartManager.pushData('chart-phiak-primary', label,
      [snapshot.phiak.edOccupancy, snapshot.phiak.icuOccupancy]);
    this.chartManager.pushData('chart-phiak-secondary', label,
      [snapshot.phiak.iliSignal, snapshot.phiak.respSignal, snapshot.phiak.giSignal, 3.0]);

    /* --- Update DOM elements --- */
    this._updateKPIs(snapshot);
    this._updateGauges(snapshot);
    this._updateAlertCount();
  }


  /* -----------------------------------------------------------------------
   * START/STOP TICK LOOP
   * ----------------------------------------------------------------------- */
  _startTicking() {
    if (this._tickInterval) clearInterval(this._tickInterval);
    this._tickInterval = setInterval(() => this._tick(), this.TICK_RATE_MS);
  }

  stop() {
    if (this._tickInterval) {
      clearInterval(this._tickInterval);
      this._tickInterval = null;
    }
  }


  /* -----------------------------------------------------------------------
   * CLOCK — Updates the topbar timestamp every second
   * ----------------------------------------------------------------------- */
  _startClock() {
    const clockEl = document.getElementById('topbar-clock');
    if (!clockEl) return;
    const updateClock = () => {
      const now = new Date();
      clockEl.textContent = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
    };
    updateClock();
    setInterval(updateClock, 1000);
  }


  /* -----------------------------------------------------------------------
   * KPI UPDATES
   * -----------------------------------------------------------------------
   * Updates the top-row KPI cards with latest values and trend arrows.
   *
   * EDUCATIONAL TIP — DOM Updates & Performance:
   *   We use direct `textContent` assignment rather than `innerHTML` for
   *   simple text updates. This is faster (no HTML parsing) and safer
   *   (no XSS risk from data injection). Only use innerHTML when you
   *   need to render actual HTML markup.
   * ----------------------------------------------------------------------- */
  _updateKPIs(data) {
    const { ewis, woik, phiak } = data;

    /* Helper: safely set text content of an element by ID */
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };

    /* EWIS KPIs */
    set('kpi-pue', ewis.pue?.toFixed(3) ?? '--');
    set('kpi-grid', (ewis.gridStability?.toFixed(1) ?? '--') + '%');
    set('kpi-gpu', (ewis.gpuUtil?.toFixed(0) ?? '--') + '%');
    set('kpi-renewable', (ewis.renewableMix?.toFixed(0) ?? '--') + '%');

    /* WOIK KPIs */
    set('kpi-pressure', (woik.pressurePSI?.toFixed(1) ?? '--') + ' PSI');
    set('kpi-turbidity', (woik.turbidityNTU?.toFixed(2) ?? '--') + ' NTU');
    set('kpi-scada', (woik.scadaUptime?.toFixed(2) ?? '--') + '%');

    /* PHIAK KPIs */
    set('kpi-ed', (phiak.edOccupancy?.toFixed(0) ?? '--') + '%');
    set('kpi-icu', (phiak.icuOccupancy?.toFixed(0) ?? '--') + '%');
    set('kpi-ili', phiak.iliSignal?.toFixed(2) ?? '--');

    /* LOE KPI — composite (static placeholder, updated from forecast) */
    set('kpi-loe-score', '89.4');

    /* Surge level badge */
    const surgeBadge = document.getElementById('kpi-surge-badge');
    if (surgeBadge && phiak.surgeLevel) {
      surgeBadge.textContent = phiak.surgeLevel;
      surgeBadge.className = 'card__badge';
      if (phiak.surgeLevel === 'RED') surgeBadge.classList.add('card__badge--alert');
      else if (phiak.surgeLevel === 'YELLOW') surgeBadge.classList.add('card__badge--warn');
      else surgeBadge.classList.add('card__badge--ok');
    }

    /* Color-code KPI values based on thresholds */
    this._colorKPI('kpi-pue', ewis.pue, v => v > 1.45 ? 'text-alert' : v > 1.25 ? 'text-warn' : 'text-ok');
    this._colorKPI('kpi-grid', ewis.gridStability, v => v < 80 ? 'text-alert' : v < 90 ? 'text-warn' : 'text-ok');
    this._colorKPI('kpi-pressure', woik.pressurePSI, v => v < 40 ? 'text-alert' : v < 55 ? 'text-warn' : 'text-ok');
    this._colorKPI('kpi-turbidity', woik.turbidityNTU, v => v > 1.0 ? 'text-alert' : v > 0.5 ? 'text-warn' : 'text-ok');
    this._colorKPI('kpi-ed', phiak.edOccupancy, v => v > 95 ? 'text-alert' : v > 85 ? 'text-warn' : 'text-ok');
    this._colorKPI('kpi-ili', phiak.iliSignal, v => v > 3.0 ? 'text-alert' : v > 2.5 ? 'text-warn' : 'text-ok');
  }

  /**
   * Helper: Apply color class to a KPI element based on a threshold function.
   */
  _colorKPI(id, value, classifierFn) {
    const el = document.getElementById(id);
    if (!el || value === undefined) return;
    el.classList.remove('text-ok', 'text-warn', 'text-alert');
    el.classList.add(classifierFn(value));
  }


  /* -----------------------------------------------------------------------
   * GAUGE UPDATES
   * -----------------------------------------------------------------------
   * Updates the horizontal gauge bars in module detail cards.
   * ----------------------------------------------------------------------- */
  _updateGauges(data) {
    const { ewis, woik, phiak } = data;

    const setGauge = (id, pct, thresholds) => {
      const el = document.getElementById(id);
      if (!el) return;
      const clampedPct = Math.min(100, Math.max(0, pct));
      el.style.width = clampedPct + '%';
      el.className = 'gauge__fill';
      if (thresholds) {
        if (thresholds.alertAbove && pct > thresholds.alertAbove) el.classList.add('gauge__fill--alert');
        else if (thresholds.warnAbove && pct > thresholds.warnAbove) el.classList.add('gauge__fill--warn');
        else if (thresholds.alertBelow && pct < thresholds.alertBelow) el.classList.add('gauge__fill--alert');
        else if (thresholds.warnBelow && pct < thresholds.warnBelow) el.classList.add('gauge__fill--warn');
        else el.classList.add('gauge__fill--ok');
      } else {
        el.classList.add('gauge__fill--ok');
      }
    };

    /* EWIS gauges */
    setGauge('gauge-pue', ((ewis.pue - 1.0) / 1.0) * 100, { warnAbove: 25, alertAbove: 45 });
    setGauge('gauge-ups', ewis.upsCharge, { warnBelow: 70, alertBelow: 40 });
    setGauge('gauge-cooling', (ewis.coolingKW / 800) * 100, { warnAbove: 60, alertAbove: 80 });

    /* WOIK gauges */
    setGauge('gauge-pressure', (woik.pressurePSI / 85) * 100, { warnBelow: 65, alertBelow: 47 });
    setGauge('gauge-tank', woik.tankLevelPct, { warnBelow: 30, alertBelow: 15 });

    /* PHIAK gauges */
    setGauge('gauge-ed', phiak.edOccupancy, { warnAbove: 85, alertAbove: 95 });
    setGauge('gauge-icu', phiak.icuOccupancy, { warnAbove: 80, alertAbove: 90 });
    setGauge('gauge-vent', phiak.ventAvailable, { warnBelow: 20, alertBelow: 15 });
  }


  /* -----------------------------------------------------------------------
   * ALERT PANEL UPDATES
   * -----------------------------------------------------------------------
   * Renders new alerts into the right-rail alert panel.
   * ----------------------------------------------------------------------- */
  _onNewAlert(alert) {
    const list = document.getElementById('alert-list');
    if (!list) return;

    /* Create alert item DOM element */
    const item = document.createElement('li');
    item.className = `alert-item alert-item--${alert.severity}`;

    /* Use textContent for user-visible text to prevent XSS
     * EDUCATIONAL: Never use innerHTML with dynamic data from untrusted
     * sources. Even synthetic data should be treated as untrusted for
     * good security hygiene. We use textContent and DOM methods. */
    const timeEl = document.createElement('div');
    timeEl.className = 'alert-item__time';
    timeEl.textContent = alert.timeStr;

    const bodyEl = document.createElement('div');
    const moduleSpan = document.createElement('span');
    moduleSpan.className = `alert-item__module alert-item__module--${alert.module.toLowerCase()}`;
    moduleSpan.textContent = alert.module;
    bodyEl.appendChild(moduleSpan);
    bodyEl.appendChild(document.createTextNode(' ' + alert.message));

    const actionEl = document.createElement('div');
    actionEl.className = 'text-dim text-sm mt-2';
    actionEl.textContent = '→ ' + alert.action;

    item.appendChild(timeEl);
    item.appendChild(bodyEl);
    item.appendChild(actionEl);

    /* Insert at top (newest first) */
    list.insertBefore(item, list.firstChild);

    /* Remove old alerts if exceeding max */
    while (list.children.length > this.alertEngine.maxAlerts) {
      list.removeChild(list.lastChild);
    }
  }

  _updateAlertCount() {
    const counts = this.alertEngine.getCounts();
    const el = document.getElementById('alert-count');
    if (el) {
      el.textContent = counts.total;
      el.className = 'card__badge';
      if (counts.critical > 0) el.classList.add('card__badge--alert');
      else if (counts.warning > 0) el.classList.add('card__badge--warn');
      else el.classList.add('card__badge--ok');
    }
  }


  /* -----------------------------------------------------------------------
   * FORECAST TABLE UPDATE
   * ----------------------------------------------------------------------- */
  _updateForecastTable(data) {
    const tbody = document.getElementById('forecast-tbody');
    if (!tbody) return;

    const rows = this.forecastEngine.generateModuleForecasts(data);

    /* Clear existing rows */
    tbody.innerHTML = '';

    for (const row of rows) {
      const tr = document.createElement('tr');

      const cells = [
        { text: row.module, cls: `alert-item__module--${row.module.toLowerCase()}` },
        { text: row.metric },
        { text: row.current },
        { text: row.forecast24h },
        { text: row.forecast7d },
        { text: row.trend, cls: row.trendClass },
      ];

      for (const cell of cells) {
        const td = document.createElement('td');
        td.textContent = cell.text;
        if (cell.cls) td.className = cell.cls;
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }
  }


  /* -----------------------------------------------------------------------
   * SIMULATION STATUS TABLE
   * -----------------------------------------------------------------------
   * Populates the DDIL simulation results table with static synthetic data.
   * In a real deployment, this would pull from actual simulation run logs.
   * ----------------------------------------------------------------------- */
  _updateSimTable() {
    const tbody = document.getElementById('sim-tbody');
    if (!tbody) return;

    const sims = [
      { name: 'Grid Fault Injection',   module: 'EWIS',  score: 88.3, status: 'PASS', time: '12.4s MTTD' },
      { name: 'PUE Thermal Stress',     module: 'EWIS',  score: 91.7, status: 'PASS', time: '1.2s detect' },
      { name: 'Pipe Burst Response',    module: 'WOIK',  score: 86.1, status: 'PASS', time: '8.7s MTTD' },
      { name: 'Contamination Triage',   module: 'WOIK',  score: 83.4, status: 'PASS', time: '2.1s detect' },
      { name: 'MCE Surge Capacity',     module: 'PHIAK', score: 79.8, status: 'PASS', time: '4.2s forecast' },
      { name: 'Syndromic Surveillance', module: 'PHIAK', score: 90.2, status: 'PASS', time: '1.8s detect' },
      { name: 'DDIL Full Stack Stress', module: 'ALL',   score: 84.1, status: 'PASS', time: '18.6s total' },
    ];

    tbody.innerHTML = '';
    for (const sim of sims) {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = sim.name;
      tr.appendChild(tdName);

      const tdModule = document.createElement('td');
      tdModule.textContent = sim.module;
      tdModule.className = sim.module === 'ALL' ? '' : `alert-item__module--${sim.module.toLowerCase()}`;
      tr.appendChild(tdModule);

      const tdScore = document.createElement('td');
      tdScore.textContent = sim.score.toFixed(1) + '/100';
      tdScore.className = 'text-mono';
      tr.appendChild(tdScore);

      const tdStatus = document.createElement('td');
      const statusSpan = document.createElement('span');
      statusSpan.className = `sim-status sim-status--${sim.status.toLowerCase()}`;
      statusSpan.textContent = sim.status === 'PASS' ? '● PASS' : '✗ FAIL';
      tdStatus.appendChild(statusSpan);
      tr.appendChild(tdStatus);

      const tdTime = document.createElement('td');
      tdTime.textContent = sim.time;
      tdTime.className = 'text-dim';
      tr.appendChild(tdTime);

      tbody.appendChild(tr);
    }
  }
}


/* ==========================================================================
 * APPLICATION ENTRY POINT
 * ==========================================================================
 * Initialize the dashboard once the DOM is fully loaded.
 *
 * EDUCATIONAL TIP — DOMContentLoaded vs load:
 *   'DOMContentLoaded' fires when the HTML is fully parsed (but images
 *   and stylesheets may still be loading). 'load' fires when everything
 *   is fully loaded. We use DOMContentLoaded because we don't need to
 *   wait for images — our charts render to <canvas> elements.
 * ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DashboardController();
  dashboard.init();

  /* Expose to console for debugging / educational exploration
   * EDUCATIONAL: In production, you'd remove this. For a demo/educational
   * dashboard, exposing the controller lets curious developers explore
   * the system via browser DevTools:
   *   > window.areseDashboard.dataEngine.tick()
   *   > window.areseDashboard.alertEngine.alerts
   *   > window.areseDashboard.forecastEngine.linearRegression([1,2,3,4,5]) */
  window.areseDashboard = dashboard;
});
