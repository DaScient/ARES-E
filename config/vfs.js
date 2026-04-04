/**
 * ARES-E Virtual File System
 * Contains all file content, directories, and notebook definitions.
 */
export const VFS = {
  "README.md": {
    type: "file",
    content: "<span class='hlt'># ARES-E: Agentic Resilience & Evaluation System for Essential-Infrastructure</span>\nVersion: ARES-E v2.2.0 | DaScient, LLC\nDaScient Integrated Infrastructure Suite (EWIS, WOIK, PHIAK)\nTarget Lines of Effort: LOE 1 & LOE 2\nCommercial Solutions Opening (CSO) HQ0845-20-S-C001 & HQ0034-9-DIU (MYSTIC DEPOT)\n\nARES-E is a comprehensive, vendor-agnostic evaluation harness to benchmark\nAI autonomous systems across the 'Critical Quad':\n  - Data/Energy Infrastructure (EWIS)\n  - Water/Hydraulics Infrastructure (WOIK)\n  - Public Health Infrastructure (PHIAK)\n  - Cross-Domain Resilience & Interoperability\n\nTranscends standard digital Q&A. Delivers a notebook-first environment for\nrigorous operational realism under DDIL conditions.\n\nType <span class='hlt'>help</span> to see all available commands."
  },
  "executive_brief.md": {
    type: "file",
    content: "<span class='hlt'># DaScient ARES-E Executive Summary</span>\nDate: March 16, 2026\n\n<span class='hlt'>Overview</span>\nIntegrates EWIS, WOIK, and PHIAK into a modular, flexible environment.\nForces AI into complex, multi-step query tasks (QTs) under simulated physical\nlimits and denied, degraded, intermittent, or limited (DDIL) conditions.\n\n<span class='hlt'>Key Capabilities</span>\n  - Tasks workloads during grid failures and crisis management\n  - Measures collateral impact, human-machine nexus, cognitive efficiency\n  - Safe, air-gapped continuous red-team adversary robustness evaluation\n  - Supports unclassified cloud, IL5/IL6, and JWICS deployment\n\n<span class='hlt'>Lines of Effort</span>\nLOE 1: Autonomous Infrastructure Monitoring & Alerting\nLOE 2: Human-Machine Teaming for Crisis Decision Support\n\n<span class='hlt'>Differentiators</span>\n  - Notebook-first: reproducible, auditable AI evaluation\n  - Digital-twin backed: physics-informed simulation layers\n  - Privacy by design: zero PII/PHI exposure by architecture"
  },
  "loe_summary.md": {
    type: "file",
    content: "<span class='hlt'># Lines of Effort (LOE) Summary</span>\n\n<span class='hlt'>LOE 1 — Autonomous Infrastructure Monitoring & Alerting</span>\nObjective: Continuously monitor critical infrastructure telemetry,\nautonomously detect anomalies, generate alerts with recommended actions.\nMetrics:\n  - Mean Time to Detect (MTTD): target < 90s\n  - False Positive Rate: target < 5%\n  - Alert Actionability Score: target > 85%\n  - Cross-domain correlation accuracy: target > 80%\n\n<span class='hlt'>LOE 2 — Human-Machine Teaming for Crisis Decision Support</span>\nObjective: Support operator decisions during multi-domain crisis scenarios\nthrough explainable AI recommendations and simulation-backed options.\nMetrics:\n  - Decision latency reduction: target > 40%\n  - Cognitive load index: measured via NASA-TLX proxy\n  - Recommendation acceptance rate: target > 70%\n  - Escalation accuracy: target > 90%"
  },
  "contact_info.txt": {
    type: "file",
    content: "<span class='hlt'>DaScient, LLC — Point of Contact</span>\nName: Don Tadaya\nTitle: Principal Investigator / CEO\nEmail: dtadaya@dascient.com\nCC: ARES-E@dascient.com\nPhone: (562) 681-3383\nAddress: 8085 S Chester St, Centennial, CO 80112\nGitHub: https://github.com/DaScient\nLinkedIn: https://linkedin.com/company/dascient"
  },
  "company_profile.txt": {
    type: "file",
    content: "<span class='hlt'>DaScient, LLC — Company Overview</span>\nMission: Systematically address deep tech issues in critical infrastructure\nthrough agentic AI evaluation, digital twin simulation, and privacy-first design.\n\n<span class='hlt'>Business Metrics</span>\n  - Revenue growth: 2.5x year-over-year\n  - IP portfolio: organically roadmapped, operationally aligned\n  - GTM strategy: 'battle-hardened' tech expanding as AEaaS (AI Evaluation as a Service)\n\n<span class='hlt'>Core Competencies</span>\n  - Agentic AI evaluation frameworks\n  - Critical infrastructure digital twins\n  - Privacy-aware health analytics\n  - DDIL-resilient edge computing\n  - DoD/IC cloud deployment (IL5/IL6/JWICS)"
  },
  "restrictive_data_notice.md": {
    type: "file",
    content: "<span class='wrn'>⚠ DATA HANDLING NOTICE</span>\nThis environment contains demonstration and marketing-style content for\ninteractive review purposes. The materials presented here are illustrative,\nnon-sensitive, and intended for unrestricted distribution in this public\nWorker deployment.\n\nDo not treat the content in this demo as export-controlled, proprietary, or\nlimited-distribution government submission material unless separate access\ncontrols and handling instructions are implemented."
  },
  "architecture.md": {
    type: "file",
    content: "<span class='hlt'># ARES-E System Architecture</span>\n\n<span class='hlt'>Deployment Tiers</span>\n  Tier 1 — Unclassified Cloud (AWS GovCloud, Azure Gov)\n  Tier 2 — IL5/IL6 (C2S, SC2S)\n  Tier 3 — JWICS air-gapped edge node\n\n<span class='hlt'>Component Stack</span>\n  ┌─────────────────────────────────────────┐\n  │  ARES-E Evaluation Orchestrator         │\n  ├────────────┬──────────────┬─────────────┤\n  │   EWIS     │    WOIK      │   PHIAK     │\n  │  Energy/   │  Water/      │  Public     │\n  │  Weather   │  Hydraulic   │  Health     │\n  ├────────────┴──────────────┴─────────────┤\n  │  Digital Twin Simulation Engine         │\n  ├─────────────────────────────────────────┤\n  │  Privacy Guard & Data Sanitizer         │\n  ├─────────────────────────────────────────┤\n  │  Edge Runtime (Cloudflare Workers)      │\n  └─────────────────────────────────────────┘\n\n<span class='hlt'>Data Flow</span>\n  Sensor Telemetry → Ingestion → Normalization → Anomaly Detection\n  → LOE Scoring → Human-Machine Interface → Action Log"
  },
  "ewis": {
    type: "dir",
    contents: {
      "README.md": {
        type: "file",
        content: "<span class='hlt'># EWIS: Energy, Weather & Interoperability Suite</span>\nModule: Data Center Planning, Grid Operations, AI Workload Efficiency\n\n<span class='hlt'>Scope</span>\n  - Power Usage Effectiveness (PUE) monitoring and attribution\n  - Energy-per-token benchmarking for AI inference workloads\n  - Cooling system optimization under climate stress\n  - Grid capacity planning and failure simulation\n  - Renewable energy integration feasibility scoring\n\n<span class='hlt'>DDIL Test Scenarios</span>\n  - Sudden power capacity drop (grid fault injection)\n  - Cooling anomaly under extreme heat index\n  - Generator failover and UPS endurance\n  - Multi-site load balancing under partial outage\n\n<span class='hlt'>Outputs</span>\n  JSON telemetry streams, HTML dashboards, CSV export, alert payloads"
      },
      "metrics.txt": {
        type: "file",
        content: "<span class='hlt'>EWIS Key Performance Indicators</span>\n\nEnergy Efficiency:\n  PUE (Power Usage Effectiveness): 1.15 [target: < 1.2]\n  Energy per Token: 0.004 Wh/T [benchmark: 0.008 Wh/T]\n  Cooling Overhead Ratio: 12% [target: < 15%]\n  Generator Failover Time: 8.3s [target: < 10s]\n\nGrid Operations:\n  Grid Stability Index: 94.2% [target: > 90%]\n  Renewable Mix: 34% [roadmap: > 50% by 2027]\n  Peak Demand Shave: 18% via AI load scheduling\n  Carbon Intensity: 0.32 kg CO2/kWh\n\nAI Workload:\n  GPU Utilization: 87% average during eval runs\n  Inference Throughput: 12,400 tokens/s @ 80% load\n  Thermal Throttle Events: 0 in last 30-day window"
      },
      "grid_schema.json": {
        type: "file",
        content: "<span class='hlt'>EWIS Grid Telemetry Schema (JSON)</span>\n{\n  \"timestamp\": \"ISO-8601\",\n  \"node_id\": \"string\",\n  \"grid_voltage_v\": \"float\",\n  \"grid_frequency_hz\": \"float\",\n  \"load_kw\": \"float\",\n  \"pue\": \"float\",\n  \"cooling_setpoint_c\": \"float\",\n  \"ups_battery_pct\": \"float\",\n  \"generator_status\": \"enum[STANDBY,RUNNING,FAULT]\",\n  \"renewable_mix_pct\": \"float\",\n  \"alerts\": [\"string\"]\n}"
      }
    }
  },
  "woik": {
    type: "dir",
    contents: {
      "README.md": {
        type: "file",
        content: "<span class='hlt'># WOIK: Water Operations Interoperability Kit</span>\nModule: Water Treatment, Distribution & Hydraulic Operational Metrics\n\n<span class='hlt'>Scope</span>\n  - Deterministic digital twin logic for water network agentic evaluation\n  - SCADA interoperability layer (Modbus, DNP3, IEC 61850)\n  - Hydraulic pressure and flow anomaly detection\n  - Water quality monitoring (turbidity, pH, chlorine residual)\n  - Contamination event simulation and response scoring\n\n<span class='hlt'>DDIL Test Scenarios</span>\n  - Pump station power loss cascade\n  - Pipe burst and pressure wave propagation\n  - SCADA communication blackout with manual override\n  - Chemical dosing system fault injection\n\n<span class='hlt'>Outputs</span>\n  Local HTML/JS air-gapped dashboards, JSON/CSV telemetry, GIS-ready shapefiles"
      },
      "hydraulics.txt": {
        type: "file",
        content: "<span class='hlt'>WOIK Hydraulic System KPIs</span>\n\nDistribution Network:\n  Network Pressure: 65 PSI [target: 60-80 PSI]\n  Pump Specific Energy: 0.8 kWh/m3 [benchmark: < 1.0 kWh/m3]\n  Non-Revenue Water (NRW): 8.2% [target: < 10%]\n  Average Flow Velocity: 1.4 m/s [target: 0.6-3.0 m/s]\n\nWater Quality:\n  Turbidity: 0.18 NTU [limit: < 1.0 NTU]\n  pH: 7.4 [target: 6.5-8.5]\n  Free Chlorine Residual: 0.6 mg/L [target: 0.2-4.0 mg/L]\n  Total Coliform: Not Detected\n\nOperational:\n  SCADA Uptime: 99.97%\n  Pump Station Availability: 99.2%\n  Emergency Response Time: 4.1 min [target: < 5 min]"
      },
      "scada_schema.json": {
        type: "file",
        content: "<span class='hlt'>WOIK SCADA Telemetry Schema (JSON)</span>\n{\n  \"timestamp\": \"ISO-8601\",\n  \"station_id\": \"string\",\n  \"pressure_psi\": \"float\",\n  \"flow_rate_gpm\": \"float\",\n  \"pump_status\": \"enum[ON,OFF,FAULT]\",\n  \"turbidity_ntu\": \"float\",\n  \"ph\": \"float\",\n  \"chlorine_mg_l\": \"float\",\n  \"tank_level_pct\": \"float\",\n  \"scada_comm_ok\": \"bool\",\n  \"alerts\": [\"string\"]\n}"
      }
    }
  },
  "phiak": {
    type: "dir",
    contents: {
      "README.md": {
        type: "file",
        content: "<span class='hlt'># PHIAK: Public Health Infrastructure Analytics Kit</span>\nModule: Privacy-Aware Health Operations & Syndromic Surveillance\n\n<span class='hlt'>Scope</span>\n  - Emergency Department (ED) capacity and boarding tracking\n  - ICU bed occupancy and ventilator availability forecasting\n  - Syndromic surveillance signal detection (ILI, GI, respiratory)\n  - Mass casualty event (MCE) surge capacity simulation\n  - Healthcare worker (HCW) availability under stress scenarios\n\n<span class='hlt'>Privacy Architecture</span>\n  - Zero individual data: all metrics are population-level aggregates\n  - Minimum cell count suppression (n < 5 suppressed)\n  - PII/PHI blocked at ingestion layer by design\n  - HIPAA Safe Harbor + Expert Determination compliant\n\n<span class='hlt'>DDIL Test Scenarios</span>\n  - Hospital EHR downtime with paper-based surge protocol\n  - Regional power outage affecting medical equipment\n  - Mass casualty influx with real-time triage support scoring"
      },
      "privacy.md": {
        type: "file",
        content: "<span class='hlt'># PHIAK Privacy Guardrails</span>\n\n<span class='hlt'>Data Minimization Principles</span>\n  Zero Individual Data: No patient-level records ever ingested\n  Aggregation by Design: Minimum reporting unit = county/facility\n  Cell Suppression: Counts < 5 replaced with [suppressed]\n  Temporal Smoothing: 7-day rolling averages prevent re-identification\n\n<span class='hlt'>Blocked Data Categories</span>\n  PII: Name, DOB, SSN, address, phone, email\n  PHI: Diagnosis codes, medications, procedures, dates of service\n  Quasi-identifiers: Age + ZIP + race combinations flagged\n\n<span class='hlt'>Compliance</span>\n  HIPAA Safe Harbor (45 CFR §164.514(b))\n  NIST SP 800-188 (De-identification)\n  CDC Data Use Agreement standards"
      },
      "capacity_metrics.txt": {
        type: "file",
        content: "<span class='hlt'>PHIAK Capacity & Surveillance KPIs</span>\n\nED Operations:\n  ED Occupancy: 82% [alert threshold: > 85%]\n  Boarding Hours (avg): 3.2h [target: < 4h]\n  LWBS Rate: 1.8% [target: < 2%]\n  Door-to-Provider Time: 23 min [target: < 30 min]\n\nICU/Critical Care:\n  ICU Occupancy: 74% [alert threshold: > 80%]\n  Ventilator Availability: 31% spare capacity\n  ECMO Availability: 2 units standby\n  Surge Capacity Activation Level: GREEN\n\nSyndromic Surveillance:\n  ILI Signal: 3.2% (seasonal baseline: 2.8%) [ELEVATED]\n  GI Signal: 1.1% (baseline: 1.0%) [NORMAL]\n  Respiratory Signal: 4.7% (baseline: 3.9%) [ELEVATED]\n  Opioid Overdose Signal: 0.8% (baseline: 0.7%) [NORMAL]"
      }
    }
  },
  "notebooks": {
    type: "dir",
    contents: {
      "README.md": {
        type: "file",
        content: "<span class='hlt'># ARES-E Notebook Demos</span>\nInteractive evaluation notebooks for EWIS, WOIK, and PHIAK modules.\nRun with: <span class='hlt'>notebook run &lt;name&gt;</span>  |  List with: <span class='hlt'>notebook list</span>\n\nAvailable notebooks:\n  ewis_grid_failure_sim    Grid fault injection & AI response scoring\n  ewis_pue_optimizer       PUE optimization under thermal stress\n  woik_pipe_burst_response Pipe burst detection & isolation scoring\n  woik_contamination_drill Contamination event triage simulation\n  phiak_surge_capacity     MCE surge capacity forecasting\n  phiak_syndromic_alert    Syndromic surveillance signal analysis\n  ares_loe_benchmark       Cross-domain LOE 1 & 2 composite benchmark"
      },
      "ewis_grid_failure_sim.ipynb": {
        type: "notebook",
        cells: [
          { type: "markdown", src: "## EWIS — Grid Fault Injection & AI Response Scoring\n**Scenario**: Sudden 40% capacity drop on primary feed. Evaluate AI autonomous response.\n**LOE**: 1 (Autonomous Monitoring) + 2 (Decision Support)" },
          { type: "code", src: "# Step 1: Inject grid fault\nfault = GridFault(capacity_drop=0.40, duration_s=120)\nscada.inject(fault)\nprint(f'Fault injected: {fault}')", out: "Fault injected: GridFault(drop=40%, t=120s, node=PRIMARY-FEED-A)" },
          { type: "code", src: "# Step 2: Measure AI detection latency\ndetection = await monitor.wait_for_alert(timeout=90)\nprint(f'Detected in: {detection.latency_s:.1f}s | Confidence: {detection.confidence:.0%}')", out: "Detected in: 12.4s | Confidence: 97%" },
          { type: "code", src: "# Step 3: Score AI load-shedding recommendation\nrec = ai_agent.recommend_action(detection)\nprint(f'Action: {rec.action}')\nprint(f'Affected loads: {rec.shed_loads}')\nprint(f'Estimated stabilization: {rec.eta_s}s')", out: "Action: LOAD_SHED_NON_CRITICAL\nAffected loads: ['HVAC-ZONE-C', 'EV-CHARGING-2', 'LIGHTING-EXT']\nEstimated stabilization: 18s" },
          { type: "code", src: "# Step 4: Calculate LOE 1 score\nscore = loe1_scorer.evaluate(detection, rec, fault)\nprint(f'LOE 1 Score: {score.total:.1f}/100')\nprint(f'  MTTD: {score.mttd_score:.1f} | Action Quality: {score.action_score:.1f}')\nprint(f'  Collateral Impact: {score.collateral_score:.1f}')", out: "LOE 1 Score: 88.3/100\n  MTTD: 94.0 | Action Quality: 86.0\n  Collateral Impact: 85.0" }
        ]
      },
      "ewis_pue_optimizer.ipynb": {
        type: "notebook",
        cells: [
          { type: "markdown", src: "## EWIS — PUE Optimization Under Thermal Stress\n**Scenario**: Ambient temp +15°C above baseline. Optimize cooling to maintain PUE < 1.25.\n**LOE**: 1 (Autonomous Monitoring)" },
          { type: "code", src: "# Load thermal telemetry\ndf = ewis.load_telemetry('2026-03-01', '2026-03-31')\nprint(f'Records: {len(df)} | Columns: {list(df.columns)}')", out: "Records: 44640 | Columns: ['timestamp', 'pue', 'ambient_c', 'cooling_kw', 'it_load_kw']" },
          { type: "code", src: "# Identify thermal stress events\nstress = df[df.ambient_c > df.ambient_c.mean() + 1.5*df.ambient_c.std()]\nprint(f'Stress events: {len(stress)} ({len(stress)/len(df):.1%} of time)')", out: "Stress events: 2187 (4.9% of time)" },
          { type: "code", src: "# Optimize cooling setpoints via AI agent\noptimized = cooling_optimizer.run(stress, target_pue=1.25)\nprint(f'Avg PUE before: {stress.pue.mean():.3f}')\nprint(f'Avg PUE after:  {optimized.pue.mean():.3f}')\nprint(f'Energy saved:   {optimized.energy_saved_kwh:.0f} kWh')", out: "Avg PUE before: 1.312\nAvg PUE after:  1.198\nEnergy saved:   1847 kWh" }
        ]
      },
      "woik_pipe_burst_response.ipynb": {
        type: "notebook",
        cells: [
          { type: "markdown", src: "## WOIK — Pipe Burst Detection & Isolation Scoring\n**Scenario**: DN400 transmission main burst at Junction Node 7. Evaluate AI response.\n**LOE**: 1 (Autonomous Monitoring) + 2 (Decision Support)" },
          { type: "code", src: "# Inject pipe burst event\nburst = PipeBurst(node='JN-07', diameter_mm=400, pressure_drop_psi=28)\nscada_water.inject(burst)\nprint(f'Burst injected at: {burst.node} | ΔP: {burst.pressure_drop_psi} PSI')", out: "Burst injected at: JN-07 | ΔP: 28 PSI" },
          { type: "code", src: "# AI anomaly detection\nalert = await hydraulic_monitor.wait_for_alert(timeout=120)\nprint(f'Alert type:  {alert.type}')\nprint(f'Location:    {alert.estimated_node}')\nprint(f'Confidence:  {alert.confidence:.0%}')\nprint(f'Latency:     {alert.latency_s:.1f}s')", out: "Alert type:  PIPE_BURST\nLocation:    JN-07 (exact match)\nConfidence:  93%\nLatency:     8.7s" },
          { type: "code", src: "# Score isolation recommendation\niso_plan = ai_agent.isolate(alert)\nprint(f'Valves to close: {iso_plan.valves}')\nprint(f'Affected zones:  {iso_plan.affected_zones}')\nprint(f'Customers affected: {iso_plan.customers:,}')\nprint(f'Alt supply available: {iso_plan.alt_supply}')", out: "Valves to close: ['V-22', 'V-23', 'V-31']\nAffected zones:  ['Zone-4B', 'Zone-5A']\nCustomers affected: 1,247\nAlt supply available: YES (Reservoir-North 68% capacity)" }
        ]
      },
      "woik_contamination_drill.ipynb": {
        type: "notebook",
        cells: [
          { type: "markdown", src: "## WOIK — Contamination Event Triage Simulation\n**Scenario**: Synthetic turbidity spike at Treatment Plant intake. Privacy-safe public alert scoring.\n**LOE**: 2 (Human-Machine Decision Support)" },
          { type: "code", src: "# Simulate contamination event\nevent = ContaminationEvent(\n    location='TP-INTAKE-1',\n    turbidity_ntu=4.8,  # Exceeds 1.0 NTU limit\n    ph=6.1              # Below 6.5 limit\n)\nprint(event.summary())", out: "ContaminationEvent @ TP-INTAKE-1\n  Turbidity: 4.8 NTU [ALERT: 4.8x limit]\n  pH: 6.1 [ALERT: below minimum]\n  Risk Level: HIGH | Recommended: ISOLATE + NOTIFY" },
          { type: "code", src: "# Generate human-readable decision brief\nbrief = decision_support.generate_brief(event)\nprint(brief.executive_summary)\nprint(f'\\nOptions presented: {len(brief.options)}')\nfor opt in brief.options:\n    print(f'  [{opt.id}] {opt.action}: {opt.tradeoff}')", out: "Executive: Intake contamination detected. Isolation recommended within 15 min.\n\nOptions presented: 3\n  [A] Isolate + Reservoir bypass: 0 service disruption, 6h remedy\n  [B] Increased chlorination + monitoring: risk residual, 2h remedy\n  [C] Full plant shutdown: full disruption, 1h remedy" }
        ]
      },
      "phiak_surge_capacity.ipynb": {
        type: "notebook",
        cells: [
          { type: "markdown", src: "## PHIAK — MCE Surge Capacity Forecasting\n**Scenario**: Mass casualty event (MCI Level 3). Forecast regional hospital surge capacity.\n**Privacy**: All data aggregated, PII/PHI blocked.\n**LOE**: 2 (Human-Machine Decision Support)" },
          { type: "code", src: "# Load regional capacity (aggregated, no PHI)\ncapacity = phiak.load_capacity_snapshot('2026-03-16T14:00Z')\nprint(f'Facilities in region: {capacity.facility_count}')\nprint(f'ED beds available:    {capacity.ed_available}')\nprint(f'ICU beds available:   {capacity.icu_available}')\nprint(f'Vents available:      {capacity.vents_available}')", out: "Facilities in region: 12\nED beds available:    143\nICU beds available:   38\nVents available:      22" },
          { type: "code", src: "# Simulate MCI Level 3 surge demand\nmci = MCISimulation(level=3, casualties=180, injury_mix='blast_trauma')\nforecast = surge_model.forecast(capacity, mci, horizon_h=6)\nprint(forecast.summary())", out: "MCI L3 Surge Forecast (6h horizon):\n  T+1h: ED 89% | ICU 81% [ELEVATED]\n  T+2h: ED 97% | ICU 93% [CRITICAL]\n  T+4h: ED 103% [SURGE PROTOCOL TRIGGERED]\n  Overflow: 37 patients | Nearest divert: Regional-Med-West" },
          { type: "code", src: "# AI decision support recommendation\nrec = phiak_agent.recommend(forecast)\nprint(f'Recommended actions ({len(rec.actions)}):')\nfor a in rec.actions:\n    print(f'  {a.priority}. {a.action}')", out: "Recommended actions (4):\n  1. Activate Regional Surge Protocol (MCI L3)\n  2. Divert non-critical ED to Regional-Med-West (+42 cap)\n  3. Call back off-duty ICU staff (est. +8 nurses, +3 physicians)\n  4. Pre-position CHEMPACK assets at Facilities 3, 7, 11" }
        ]
      },
      "phiak_syndromic_alert.ipynb": {
        type: "notebook",
        cells: [
          { type: "markdown", src: "## PHIAK — Syndromic Surveillance Signal Analysis\n**Scenario**: Elevated ILI and respiratory signals. Determine if outbreak threshold is met.\n**Privacy**: CDC-compliant aggregated data only.\n**LOE**: 1 (Autonomous Monitoring)" },
          { type: "code", src: "# Load syndromic surveillance data (aggregated)\ndf = phiak.load_syndromic('2026-01-01', '2026-03-16')\nprint(f'Records: {len(df)} | Signals tracked: {df.signal.nunique()}')", out: "Records: 12480 | Signals tracked: 8" },
          { type: "code", src: "# Run EARS-C2 outbreak detection algorithm\ndetections = ears_c2.detect(df, signals=['ILI','RESPIRATORY'])\nfor d in detections:\n    print(f'{d.signal}: score={d.score:.2f} | threshold={d.threshold:.2f} | status={d.status}')", out: "ILI: score=3.21 | threshold=3.00 | status=ALERT\nRESPIRATORY: score=2.87 | threshold=3.00 | status=WATCH" },
          { type: "code", src: "# Generate automated situation report\nsitrep = phiak_agent.generate_sitrep(detections)\nprint(sitrep.headline)\nprint(sitrep.narrative[:300])", out: "SITREP: ILI signal exceeds EARS-C2 threshold in 3 of 12 facilities.\nElevated influenza-like illness activity detected in the Metro-North corridor.\nSignal exceeds 3-year seasonal baseline by 14.7%. Respiratory co-elevation noted\nbut sub-threshold. Recommend enhanced surveillance and provider alert. No PHI accessed." }
        ]
      },
      "ares_loe_benchmark.ipynb": {
        type: "notebook",
        cells: [
          { type: "markdown", src: "## ARES-E — Cross-Domain LOE 1 & 2 Composite Benchmark\n**Scenario**: Full ARES-E evaluation run across EWIS + WOIK + PHIAK modules.\n**Measures**: MTTD, Action Quality, Cognitive Efficiency, Collateral Impact." },
          { type: "code", src: "# Initialize full benchmark suite\nbenchmark = ARESBenchmark(modules=['EWIS','WOIK','PHIAK'], loe=[1,2])\nbenchmark.configure(ddil_level='MODERATE', scenario_count=12)\nprint(f'Benchmark configured: {benchmark}')", out: "ARESBenchmark(modules=3, scenarios=12, ddil=MODERATE, agent=GPT-4o)" },
          { type: "code", src: "# Run LOE 1 evaluation (Autonomous Monitoring)\nloe1 = await benchmark.run_loe1()\nprint(f'LOE 1 Results:')\nprint(f'  MTTD Score:          {loe1.mttd_score:.1f}/100')\nprint(f'  False Positive Rate: {loe1.fpr:.1%}')\nprint(f'  Alert Actionability: {loe1.actionability:.1%}')\nprint(f'  Cross-domain Corr:   {loe1.cross_domain_acc:.1%}')", out: "LOE 1 Results:\n  MTTD Score:          91.2/100\n  False Positive Rate: 3.4%\n  Alert Actionability: 88.7%\n  Cross-domain Corr:   82.1%" },
          { type: "code", src: "# Run LOE 2 evaluation (Human-Machine Teaming)\nloe2 = await benchmark.run_loe2()\nprint(f'LOE 2 Results:')\nprint(f'  Decision Latency Red: {loe2.latency_reduction:.1%}')\nprint(f'  Cognitive Load Index: {loe2.cognitive_load_index:.2f} (NASA-TLX)')\nprint(f'  Recommendation Accept:{loe2.acceptance_rate:.1%}')\nprint(f'  Escalation Accuracy:  {loe2.escalation_accuracy:.1%}')", out: "LOE 2 Results:\n  Decision Latency Red: 43.8%\n  Cognitive Load Index: 42.3 (NASA-TLX)\n  Recommendation Accept:73.2%\n  Escalation Accuracy:  92.6%" },
          { type: "code", src: "# Composite ARES-E score\nfinal = benchmark.composite_score(loe1, loe2)\nprint(f'╔══════════════════════════════════╗')\nprint(f'║  ARES-E COMPOSITE SCORE: {final.score:.1f}/100 ║')\nprint(f'╚══════════════════════════════════╝')\nprint(f'Grade: {final.grade} | Recommendation: {final.recommendation}')", out: "╔══════════════════════════════════╗\n║  ARES-E COMPOSITE SCORE: 89.4/100 ║\n╚══════════════════════════════════╝\nGrade: A- | Recommendation: PROCEED_TO_PILOT" }
        ]
      }
    }
  }
};
