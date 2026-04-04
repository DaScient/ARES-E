/**
 * ARES-E Advanced Interactive Terminal Edge Worker
 * Includes EWIS, WOIK, PHIAK, LOE1&2 DaScient ARES-E Brief contents,
 * notebook demos, system status, simulation, and search capabilities.
 */
export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DaScient ARES-E | MYSTIC DEPOT Environment</title>
<style>
:root{
  --bg:#090909;--fg:#0f0;--dim:#080;--glow:rgba(0,255,0,0.4);
  --usr:#0ff;--dir:#ff0;--wrn:#f00;--hlt:#fff;--lnk:#f0f;
  --fnt:'JetBrains Mono',Courier,monospace;--scn:rgba(0,0,0,0.3);
  --nb:#1a1a00;--nb-border:#440;--info:#0af;
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--fg);font-family:var(--fnt);font-size:14px;line-height:1.6;height:100vh;overflow:hidden;display:flex;justify-content:center;align-items:center}
.crt{width:100vw;height:100vh;position:relative;overflow-y:auto;padding:30px;text-shadow:0 0 4px var(--glow);scrollbar-width:thin;scrollbar-color:var(--dim) var(--bg)}
.crt::-webkit-scrollbar{width:10px}
.crt::-webkit-scrollbar-track{background:var(--bg)}
.crt::-webkit-scrollbar-thumb{background:var(--dim)}
.crt::before{content:" ";display:block;position:fixed;top:0;left:0;bottom:0;right:0;background:linear-gradient(to bottom,var(--scn) 50%,transparent 50%);background-size:100% 4px;z-index:50;pointer-events:none}
.crt::after{content:" ";display:block;position:fixed;top:0;left:0;bottom:0;right:0;background:radial-gradient(circle,rgba(0,0,0,0) 60%,rgba(0,0,0,0.6) 100%);z-index:51;pointer-events:none}
#out{padding-bottom:20px;white-space:pre-wrap;word-wrap:break-word}
.ln{margin-bottom:5px}
.sys{color:var(--dim)}
.pu{color:var(--usr);font-weight:700}
.pd,.dl{color:var(--dir);font-weight:700}
.wrn{color:var(--wrn);font-weight:700}
.hlt{color:var(--hlt);font-weight:700}
.inf{color:var(--info)}
.lnk{color:var(--lnk);text-decoration:underline}
.fl{color:var(--fg)}
.asc{color:var(--usr);font-size:12px;line-height:1.2;white-space:pre;margin:15px 0}
.dp{border:1px solid var(--dim);padding:10px;margin:10px 0}
.nb{border:1px solid var(--nb-border);background:var(--nb);padding:12px;margin:10px 0}
.nb-cell{border-left:3px solid var(--dir);padding-left:8px;margin:6px 0}
.nb-out{border-left:3px solid var(--dim);padding-left:8px;margin:6px 0;color:#9f9}
.db{background:#222;width:200px;display:inline-block;margin-left:10px}
.df{background:var(--usr);height:10px;display:inline-block}
.df-wrn{background:var(--wrn);height:10px;display:inline-block}
.df-ok{background:#0f0;height:10px;display:inline-block}
.in-ln{display:flex;align-items:center;margin-top:10px;padding-bottom:60px}
.ps{white-space:pre;margin-right:10px}
#cmd{background:0 0;border:none;color:var(--fg);font-family:var(--fnt);font-size:15px;flex-grow:1;outline:0;text-shadow:0 0 4px var(--glow);caret-color:transparent}
.cur{display:inline-block;width:10px;height:18px;background:var(--fg);animation:blk 1s step-end infinite;vertical-align:text-bottom;margin-left:4px}
@keyframes blk{0%,100%{opacity:1}50%{opacity:0}}
.lck #cmd,.lck .cur{display:none}
@media(max-width:600px){body{font-size:12px}.crt{padding:12px}}
</style>
</head>
<body>
<div class="crt" id="term">
  <div id="out"></div>
  <div class="in-ln" id="in-wrp" style="display:none">
    <span class="ps" id="ph"></span>
    <input type="text" id="cmd" autocomplete="off" spellcheck="false" autofocus>
    <span class="cur" id="cur"></span>
  </div>
</div>
<script>
const CFG={
  usr:"dtadaya",hst:"mystic-depot",loc:"Centennial, CO",ver:"ARES-E v2.2.0",
  bSpd:20,tSpd:2,lDel:50,boot:1,
  url:"https://www.diu.mil/work-with-us/submit-solution/PROJ00625",
  github:"https://github.com/DaScient",
  email:"ARES-E@dascient.com"
};
let cPt=[];
const VFS={
  "README.md":{type:"file",content:"<span class='hlt'># ARES-E: Agentic Resilience & Evaluation System for Essential-Infrastructure</span>\\nVersion: ARES-E v2.2.0 | DaScient, LLC\\nDaScient Integrated Infrastructure Suite (EWIS, WOIK, PHIAK)\\nTarget Lines of Effort: LOE 1 & LOE 2\\nCommercial Solutions Opening (CSO) HQ0845-20-S-C001 & HQ0034-9-DIU (MYSTIC DEPOT)\\n\\nARES-E is a comprehensive, vendor-agnostic evaluation harness to benchmark\\nAI autonomous systems across the 'Critical Quad':\\n  - Data/Energy Infrastructure (EWIS)\\n  - Water/Hydraulics Infrastructure (WOIK)\\n  - Public Health Infrastructure (PHIAK)\\n  - Cross-Domain Resilience & Interoperability\\n\\nTranscends standard digital Q&A. Delivers a notebook-first environment for\\nrigorous operational realism under DDIL conditions.\\n\\nType <span class='hlt'>help</span> to see all available commands."},
  "executive_brief.md":{type:"file",content:"<span class='hlt'># DaScient ARES-E Executive Summary</span>\\nDate: March 16, 2026\\n\\n<span class='hlt'>Overview</span>\\nIntegrates EWIS, WOIK, and PHIAK into a modular, flexible environment.\\nForces AI into complex, multi-step query tasks (QTs) under simulated physical\\nlimits and denied, degraded, intermittent, or limited (DDIL) conditions.\\n\\n<span class='hlt'>Key Capabilities</span>\\n  - Tasks workloads during grid failures and crisis management\\n  - Measures collateral impact, human-machine nexus, cognitive efficiency\\n  - Safe, air-gapped continuous red-team adversary robustness evaluation\\n  - Supports unclassified cloud, IL5/IL6, and JWICS deployment\\n\\n<span class='hlt'>Lines of Effort</span>\\nLOE 1: Autonomous Infrastructure Monitoring & Alerting\\nLOE 2: Human-Machine Teaming for Crisis Decision Support\\n\\n<span class='hlt'>Differentiators</span>\\n  - Notebook-first: reproducible, auditable AI evaluation\\n  - Digital-twin backed: physics-informed simulation layers\\n  - Privacy by design: zero PII/PHI exposure by architecture"},
  "loe_summary.md":{type:"file",content:"<span class='hlt'># Lines of Effort (LOE) Summary</span>\\n\\n<span class='hlt'>LOE 1 — Autonomous Infrastructure Monitoring & Alerting</span>\\nObjective: Continuously monitor critical infrastructure telemetry,\\nautonomously detect anomalies, generate alerts with recommended actions.\\nMetrics:\\n  - Mean Time to Detect (MTTD): target < 90s\\n  - False Positive Rate: target < 5%\\n  - Alert Actionability Score: target > 85%\\n  - Cross-domain correlation accuracy: target > 80%\\n\\n<span class='hlt'>LOE 2 — Human-Machine Teaming for Crisis Decision Support</span>\\nObjective: Support operator decisions during multi-domain crisis scenarios\\nthrough explainable AI recommendations and simulation-backed options.\\nMetrics:\\n  - Decision latency reduction: target > 40%\\n  - Cognitive load index: measured via NASA-TLX proxy\\n  - Recommendation acceptance rate: target > 70%\\n  - Escalation accuracy: target > 90%"},
  "contact_info.txt":{type:"file",content:"<span class='hlt'>DaScient, LLC — Point of Contact</span>\\nName: Don Tadaya\\nTitle: Principal Investigator / CEO\\nEmail: dtadaya@dascient.com\\nCC: ARES-E@dascient.com\\nPhone: (562) 681-3383\\nAddress: 8085 S Chester St, Centennial, CO 80112\\nGitHub: https://github.com/DaScient\\nLinkedIn: https://linkedin.com/company/dascient"},
  "company_profile.txt":{type:"file",content:"<span class='hlt'>DaScient, LLC — Company Overview</span>\\nMission: Systematically address deep tech issues in critical infrastructure\\nthrough agentic AI evaluation, digital twin simulation, and privacy-first design.\\n\\n<span class='hlt'>Business Metrics</span>\\n  - Revenue growth: 2.5x year-over-year\\n  - IP portfolio: organically roadmapped, operationally aligned\\n  - GTM strategy: 'battle-hardened' tech expanding as AEaaS (AI Evaluation as a Service)\\n\\n<span class='hlt'>Core Competencies</span>\\n  - Agentic AI evaluation frameworks\\n  - Critical infrastructure digital twins\\n  - Privacy-aware health analytics\\n  - DDIL-resilient edge computing\\n  - DoD/IC cloud deployment (IL5/IL6/JWICS)"},
  "restrictive_data_notice.md":{type:"file",content:"<span class='wrn'>⚠ DATA HANDLING NOTICE</span>\\nThis environment contains demonstration and marketing-style content for\\ninteractive review purposes. The materials presented here are illustrative,\\nnon-sensitive, and intended for unrestricted distribution in this public\\nWorker deployment.\\n\\nDo not treat the content in this demo as export-controlled, proprietary, or\\nlimited-distribution government submission material unless separate access\\ncontrols and handling instructions are implemented."},
  "architecture.md":{type:"file",content:"<span class='hlt'># ARES-E System Architecture</span>\\n\\n<span class='hlt'>Deployment Tiers</span>\\n  Tier 1 — Unclassified Cloud (AWS GovCloud, Azure Gov)\\n  Tier 2 — IL5/IL6 (C2S, SC2S)\\n  Tier 3 — JWICS air-gapped edge node\\n\\n<span class='hlt'>Component Stack</span>\\n  ┌─────────────────────────────────────────┐\\n  │  ARES-E Evaluation Orchestrator         │\\n  ├────────────┬──────────────┬─────────────┤\\n  │   EWIS     │    WOIK      │   PHIAK     │\\n  │  Energy/   │  Water/      │  Public     │\\n  │  Weather   │  Hydraulic   │  Health     │\\n  ├────────────┴──────────────┴─────────────┤\\n  │  Digital Twin Simulation Engine         │\\n  ├─────────────────────────────────────────┤\\n  │  Privacy Guard & Data Sanitizer         │\\n  ├─────────────────────────────────────────┤\\n  │  Edge Runtime (Cloudflare Workers)      │\\n  └─────────────────────────────────────────┘\\n\\n<span class='hlt'>Data Flow</span>\\n  Sensor Telemetry → Ingestion → Normalization → Anomaly Detection\\n  → LOE Scoring → Human-Machine Interface → Action Log"},
  "ewis":{type:"dir",contents:{
    "README.md":{type:"file",content:"<span class='hlt'># EWIS: Energy, Weather & Interoperability Suite</span>\\nModule: Data Center Planning, Grid Operations, AI Workload Efficiency\\n\\n<span class='hlt'>Scope</span>\\n  - Power Usage Effectiveness (PUE) monitoring and attribution\\n  - Energy-per-token benchmarking for AI inference workloads\\n  - Cooling system optimization under climate stress\\n  - Grid capacity planning and failure simulation\\n  - Renewable energy integration feasibility scoring\\n\\n<span class='hlt'>DDIL Test Scenarios</span>\\n  - Sudden power capacity drop (grid fault injection)\\n  - Cooling anomaly under extreme heat index\\n  - Generator failover and UPS endurance\\n  - Multi-site load balancing under partial outage\\n\\n<span class='hlt'>Outputs</span>\\n  JSON telemetry streams, HTML dashboards, CSV export, alert payloads"},
    "metrics.txt":{type:"file",content:"<span class='hlt'>EWIS Key Performance Indicators</span>\\n\\nEnergy Efficiency:\\n  PUE (Power Usage Effectiveness): 1.15 [target: < 1.2]\\n  Energy per Token: 0.004 Wh/T [benchmark: 0.008 Wh/T]\\n  Cooling Overhead Ratio: 12% [target: < 15%]\\n  Generator Failover Time: 8.3s [target: < 10s]\\n\\nGrid Operations:\\n  Grid Stability Index: 94.2% [target: > 90%]\\n  Renewable Mix: 34% [roadmap: > 50% by 2027]\\n  Peak Demand Shave: 18% via AI load scheduling\\n  Carbon Intensity: 0.32 kg CO2/kWh\\n\\nAI Workload:\\n  GPU Utilization: 87% average during eval runs\\n  Inference Throughput: 12,400 tokens/s @ 80% load\\n  Thermal Throttle Events: 0 in last 30-day window"},
    "grid_schema.json":{type:"file",content:'<span class=\'hlt\'>EWIS Grid Telemetry Schema (JSON)</span>\\n{\\n  "timestamp": "ISO-8601",\\n  "node_id": "string",\\n  "grid_voltage_v": "float",\\n  "grid_frequency_hz": "float",\\n  "load_kw": "float",\\n  "pue": "float",\\n  "cooling_setpoint_c": "float",\\n  "ups_battery_pct": "float",\\n  "generator_status": "enum[STANDBY,RUNNING,FAULT]",\\n  "renewable_mix_pct": "float",\\n  "alerts": ["string"]\\n}'}
  }},
  "woik":{type:"dir",contents:{
    "README.md":{type:"file",content:"<span class='hlt'># WOIK: Water Operations Interoperability Kit</span>\\nModule: Water Treatment, Distribution & Hydraulic Operational Metrics\\n\\n<span class='hlt'>Scope</span>\\n  - Deterministic digital twin logic for water network agentic evaluation\\n  - SCADA interoperability layer (Modbus, DNP3, IEC 61850)\\n  - Hydraulic pressure and flow anomaly detection\\n  - Water quality monitoring (turbidity, pH, chlorine residual)\\n  - Contamination event simulation and response scoring\\n\\n<span class='hlt'>DDIL Test Scenarios</span>\\n  - Pump station power loss cascade\\n  - Pipe burst and pressure wave propagation\\n  - SCADA communication blackout with manual override\\n  - Chemical dosing system fault injection\\n\\n<span class='hlt'>Outputs</span>\\n  Local HTML/JS air-gapped dashboards, JSON/CSV telemetry, GIS-ready shapefiles"},
    "hydraulics.txt":{type:"file",content:"<span class='hlt'>WOIK Hydraulic System KPIs</span>\\n\\nDistribution Network:\\n  Network Pressure: 65 PSI [target: 60-80 PSI]\\n  Pump Specific Energy: 0.8 kWh/m3 [benchmark: < 1.0 kWh/m3]\\n  Non-Revenue Water (NRW): 8.2% [target: < 10%]\\n  Average Flow Velocity: 1.4 m/s [target: 0.6-3.0 m/s]\\n\\nWater Quality:\\n  Turbidity: 0.18 NTU [limit: < 1.0 NTU]\\n  pH: 7.4 [target: 6.5-8.5]\\n  Free Chlorine Residual: 0.6 mg/L [target: 0.2-4.0 mg/L]\\n  Total Coliform: Not Detected\\n\\nOperational:\\n  SCADA Uptime: 99.97%\\n  Pump Station Availability: 99.2%\\n  Emergency Response Time: 4.1 min [target: < 5 min]"},
    "scada_schema.json":{type:"file",content:'<span class=\'hlt\'>WOIK SCADA Telemetry Schema (JSON)</span>\\n{\\n  "timestamp": "ISO-8601",\\n  "station_id": "string",\\n  "pressure_psi": "float",\\n  "flow_rate_gpm": "float",\\n  "pump_status": "enum[ON,OFF,FAULT]",\\n  "turbidity_ntu": "float",\\n  "ph": "float",\\n  "chlorine_mg_l": "float",\\n  "tank_level_pct": "float",\\n  "scada_comm_ok": "bool",\\n  "alerts": ["string"]\\n}'}
  }},
  "phiak":{type:"dir",contents:{
    "README.md":{type:"file",content:"<span class='hlt'># PHIAK: Public Health Infrastructure Analytics Kit</span>\\nModule: Privacy-Aware Health Operations & Syndromic Surveillance\\n\\n<span class='hlt'>Scope</span>\\n  - Emergency Department (ED) capacity and boarding tracking\\n  - ICU bed occupancy and ventilator availability forecasting\\n  - Syndromic surveillance signal detection (ILI, GI, respiratory)\\n  - Mass casualty event (MCE) surge capacity simulation\\n  - Healthcare worker (HCW) availability under stress scenarios\\n\\n<span class='hlt'>Privacy Architecture</span>\\n  - Zero individual data: all metrics are population-level aggregates\\n  - Minimum cell count suppression (n < 5 suppressed)\\n  - PII/PHI blocked at ingestion layer by design\\n  - HIPAA Safe Harbor + Expert Determination compliant\\n\\n<span class='hlt'>DDIL Test Scenarios</span>\\n  - Hospital EHR downtime with paper-based surge protocol\\n  - Regional power outage affecting medical equipment\\n  - Mass casualty influx with real-time triage support scoring"},
    "privacy.md":{type:"file",content:"<span class='hlt'># PHIAK Privacy Guardrails</span>\\n\\n<span class='hlt'>Data Minimization Principles</span>\\n  Zero Individual Data: No patient-level records ever ingested\\n  Aggregation by Design: Minimum reporting unit = county/facility\\n  Cell Suppression: Counts < 5 replaced with [suppressed]\\n  Temporal Smoothing: 7-day rolling averages prevent re-identification\\n\\n<span class='hlt'>Blocked Data Categories</span>\\n  PII: Name, DOB, SSN, address, phone, email\\n  PHI: Diagnosis codes, medications, procedures, dates of service\\n  Quasi-identifiers: Age + ZIP + race combinations flagged\\n\\n<span class='hlt'>Compliance</span>\\n  HIPAA Safe Harbor (45 CFR §164.514(b))\\n  NIST SP 800-188 (De-identification)\\n  CDC Data Use Agreement standards"},
    "capacity_metrics.txt":{type:"file",content:"<span class='hlt'>PHIAK Capacity & Surveillance KPIs</span>\\n\\nED Operations:\\n  ED Occupancy: 82% [alert threshold: > 85%]\\n  Boarding Hours (avg): 3.2h [target: < 4h]\\n  LWBS Rate: 1.8% [target: < 2%]\\n  Door-to-Provider Time: 23 min [target: < 30 min]\\n\\nICU/Critical Care:\\n  ICU Occupancy: 74% [alert threshold: > 80%]\\n  Ventilator Availability: 31% spare capacity\\n  ECMO Availability: 2 units standby\\n  Surge Capacity Activation Level: GREEN\\n\\nSyndromic Surveillance:\\n  ILI Signal: 3.2% (seasonal baseline: 2.8%) [ELEVATED]\\n  GI Signal: 1.1% (baseline: 1.0%) [NORMAL]\\n  Respiratory Signal: 4.7% (baseline: 3.9%) [ELEVATED]\\n  Opioid Overdose Signal: 0.8% (baseline: 0.7%) [NORMAL]"}
  }},
  "notebooks":{type:"dir",contents:{
    "README.md":{type:"file",content:"<span class='hlt'># ARES-E Notebook Demos</span>\\nInteractive evaluation notebooks for EWIS, WOIK, and PHIAK modules.\\nRun with: <span class='hlt'>notebook run &lt;name&gt;</span>  |  List with: <span class='hlt'>notebook list</span>\\n\\nAvailable notebooks:\\n  ewis_grid_failure_sim    Grid fault injection & AI response scoring\\n  ewis_pue_optimizer       PUE optimization under thermal stress\\n  woik_pipe_burst_response Pipe burst detection & isolation scoring\\n  woik_contamination_drill Contamination event triage simulation\\n  phiak_surge_capacity     MCE surge capacity forecasting\\n  phiak_syndromic_alert    Syndromic surveillance signal analysis\\n  ares_loe_benchmark       Cross-domain LOE 1 & 2 composite benchmark"},
    "ewis_grid_failure_sim.ipynb":{type:"notebook",cells:[
      {type:"markdown",src:"## EWIS — Grid Fault Injection & AI Response Scoring\\n**Scenario**: Sudden 40% capacity drop on primary feed. Evaluate AI autonomous response.\\n**LOE**: 1 (Autonomous Monitoring) + 2 (Decision Support)"},
      {type:"code",src:"# Step 1: Inject grid fault\\nfault = GridFault(capacity_drop=0.40, duration_s=120)\\nscada.inject(fault)\\nprint(f'Fault injected: {fault}')",out:"Fault injected: GridFault(drop=40%, t=120s, node=PRIMARY-FEED-A)"},
      {type:"code",src:"# Step 2: Measure AI detection latency\\ndetection = await monitor.wait_for_alert(timeout=90)\\nprint(f'Detected in: {detection.latency_s:.1f}s | Confidence: {detection.confidence:.0%}')",out:"Detected in: 12.4s | Confidence: 97%"},
      {type:"code",src:"# Step 3: Score AI load-shedding recommendation\\nrec = ai_agent.recommend_action(detection)\\nprint(f'Action: {rec.action}')\\nprint(f'Affected loads: {rec.shed_loads}')\\nprint(f'Estimated stabilization: {rec.eta_s}s')",out:"Action: LOAD_SHED_NON_CRITICAL\\nAffected loads: ['HVAC-ZONE-C', 'EV-CHARGING-2', 'LIGHTING-EXT']\\nEstimated stabilization: 18s"},
      {type:"code",src:"# Step 4: Calculate LOE 1 score\\nscore = loe1_scorer.evaluate(detection, rec, fault)\\nprint(f'LOE 1 Score: {score.total:.1f}/100')\\nprint(f'  MTTD: {score.mttd_score:.1f} | Action Quality: {score.action_score:.1f}')\\nprint(f'  Collateral Impact: {score.collateral_score:.1f}')",out:"LOE 1 Score: 88.3/100\\n  MTTD: 94.0 | Action Quality: 86.0\\n  Collateral Impact: 85.0"}
    ]},
    "ewis_pue_optimizer.ipynb":{type:"notebook",cells:[
      {type:"markdown",src:"## EWIS — PUE Optimization Under Thermal Stress\\n**Scenario**: Ambient temp +15°C above baseline. Optimize cooling to maintain PUE < 1.25.\\n**LOE**: 1 (Autonomous Monitoring)"},
      {type:"code",src:"# Load thermal telemetry\\ndf = ewis.load_telemetry('2026-03-01', '2026-03-31')\\nprint(f'Records: {len(df)} | Columns: {list(df.columns)}')",out:"Records: 44640 | Columns: ['timestamp', 'pue', 'ambient_c', 'cooling_kw', 'it_load_kw']"},
      {type:"code",src:"# Identify thermal stress events\\nstress = df[df.ambient_c > df.ambient_c.mean() + 1.5*df.ambient_c.std()]\\nprint(f'Stress events: {len(stress)} ({len(stress)/len(df):.1%} of time)')",out:"Stress events: 2187 (4.9% of time)"},
      {type:"code",src:"# Optimize cooling setpoints via AI agent\\noptimized = cooling_optimizer.run(stress, target_pue=1.25)\\nprint(f'Avg PUE before: {stress.pue.mean():.3f}')\\nprint(f'Avg PUE after:  {optimized.pue.mean():.3f}')\\nprint(f'Energy saved:   {optimized.energy_saved_kwh:.0f} kWh')",out:"Avg PUE before: 1.312\\nAvg PUE after:  1.198\\nEnergy saved:   1847 kWh"}
    ]},
    "woik_pipe_burst_response.ipynb":{type:"notebook",cells:[
      {type:"markdown",src:"## WOIK — Pipe Burst Detection & Isolation Scoring\\n**Scenario**: DN400 transmission main burst at Junction Node 7. Evaluate AI response.\\n**LOE**: 1 (Autonomous Monitoring) + 2 (Decision Support)"},
      {type:"code",src:"# Inject pipe burst event\\nburst = PipeBurst(node='JN-07', diameter_mm=400, pressure_drop_psi=28)\\nscada_water.inject(burst)\\nprint(f'Burst injected at: {burst.node} | ΔP: {burst.pressure_drop_psi} PSI')",out:"Burst injected at: JN-07 | ΔP: 28 PSI"},
      {type:"code",src:"# AI anomaly detection\\nalert = await hydraulic_monitor.wait_for_alert(timeout=120)\\nprint(f'Alert type:  {alert.type}')\\nprint(f'Location:    {alert.estimated_node}')\\nprint(f'Confidence:  {alert.confidence:.0%}')\\nprint(f'Latency:     {alert.latency_s:.1f}s')",out:"Alert type:  PIPE_BURST\\nLocation:    JN-07 (exact match)\\nConfidence:  93%\\nLatency:     8.7s"},
      {type:"code",src:"# Score isolation recommendation\\niso_plan = ai_agent.isolate(alert)\\nprint(f'Valves to close: {iso_plan.valves}')\\nprint(f'Affected zones:  {iso_plan.affected_zones}')\\nprint(f'Customers affected: {iso_plan.customers:,}')\\nprint(f'Alt supply available: {iso_plan.alt_supply}')",out:"Valves to close: ['V-22', 'V-23', 'V-31']\\nAffected zones:  ['Zone-4B', 'Zone-5A']\\nCustomers affected: 1,247\\nAlt supply available: YES (Reservoir-North 68% capacity)"}
    ]},
    "woik_contamination_drill.ipynb":{type:"notebook",cells:[
      {type:"markdown",src:"## WOIK — Contamination Event Triage Simulation\\n**Scenario**: Synthetic turbidity spike at Treatment Plant intake. Privacy-safe public alert scoring.\\n**LOE**: 2 (Human-Machine Decision Support)"},
      {type:"code",src:"# Simulate contamination event\\nevent = ContaminationEvent(\\n    location='TP-INTAKE-1',\\n    turbidity_ntu=4.8,  # Exceeds 1.0 NTU limit\\n    ph=6.1              # Below 6.5 limit\\n)\\nprint(event.summary())",out:"ContaminationEvent @ TP-INTAKE-1\\n  Turbidity: 4.8 NTU [ALERT: 4.8x limit]\\n  pH: 6.1 [ALERT: below minimum]\\n  Risk Level: HIGH | Recommended: ISOLATE + NOTIFY"},
      {type:"code",src:"# Generate human-readable decision brief\\nbrief = decision_support.generate_brief(event)\\nprint(brief.executive_summary)\\nprint(f'\\nOptions presented: {len(brief.options)}')\\nfor opt in brief.options:\\n    print(f'  [{opt.id}] {opt.action}: {opt.tradeoff}')",out:"Executive: Intake contamination detected. Isolation recommended within 15 min.\\n\\nOptions presented: 3\\n  [A] Isolate + Reservoir bypass: 0 service disruption, 6h remedy\\n  [B] Increased chlorination + monitoring: risk residual, 2h remedy\\n  [C] Full plant shutdown: full disruption, 1h remedy"}
    ]},
    "phiak_surge_capacity.ipynb":{type:"notebook",cells:[
      {type:"markdown",src:"## PHIAK — MCE Surge Capacity Forecasting\\n**Scenario**: Mass casualty event (MCI Level 3). Forecast regional hospital surge capacity.\\n**Privacy**: All data aggregated, PII/PHI blocked.\\n**LOE**: 2 (Human-Machine Decision Support)"},
      {type:"code",src:"# Load regional capacity (aggregated, no PHI)\\ncapacity = phiak.load_capacity_snapshot('2026-03-16T14:00Z')\\nprint(f'Facilities in region: {capacity.facility_count}')\\nprint(f'ED beds available:    {capacity.ed_available}')\\nprint(f'ICU beds available:   {capacity.icu_available}')\\nprint(f'Vents available:      {capacity.vents_available}')",out:"Facilities in region: 12\\nED beds available:    143\\nICU beds available:   38\\nVents available:      22"},
      {type:"code",src:"# Simulate MCI Level 3 surge demand\\nmci = MCISimulation(level=3, casualties=180, injury_mix='blast_trauma')\\nforecast = surge_model.forecast(capacity, mci, horizon_h=6)\\nprint(forecast.summary())",out:"MCI L3 Surge Forecast (6h horizon):\\n  T+1h: ED 89% | ICU 81% [ELEVATED]\\n  T+2h: ED 97% | ICU 93% [CRITICAL]\\n  T+4h: ED 103% [SURGE PROTOCOL TRIGGERED]\\n  Overflow: 37 patients | Nearest divert: Regional-Med-West"},
      {type:"code",src:"# AI decision support recommendation\\nrec = phiak_agent.recommend(forecast)\\nprint(f'Recommended actions ({len(rec.actions)}):')\\nfor a in rec.actions:\\n    print(f'  {a.priority}. {a.action}')",out:"Recommended actions (4):\\n  1. Activate Regional Surge Protocol (MCI L3)\\n  2. Divert non-critical ED to Regional-Med-West (+42 cap)\\n  3. Call back off-duty ICU staff (est. +8 nurses, +3 physicians)\\n  4. Pre-position CHEMPACK assets at Facilities 3, 7, 11"}
    ]},
    "phiak_syndromic_alert.ipynb":{type:"notebook",cells:[
      {type:"markdown",src:"## PHIAK — Syndromic Surveillance Signal Analysis\\n**Scenario**: Elevated ILI and respiratory signals. Determine if outbreak threshold is met.\\n**Privacy**: CDC-compliant aggregated data only.\\n**LOE**: 1 (Autonomous Monitoring)"},
      {type:"code",src:"# Load syndromic surveillance data (aggregated)\\ndf = phiak.load_syndromic('2026-01-01', '2026-03-16')\\nprint(f'Records: {len(df)} | Signals tracked: {df.signal.nunique()}')",out:"Records: 12480 | Signals tracked: 8"},
      {type:"code",src:"# Run EARS-C2 outbreak detection algorithm\\ndetections = ears_c2.detect(df, signals=['ILI','RESPIRATORY'])\\nfor d in detections:\\n    print(f'{d.signal}: score={d.score:.2f} | threshold={d.threshold:.2f} | status={d.status}')",out:"ILI: score=3.21 | threshold=3.00 | status=ALERT\\nRESPIRATORY: score=2.87 | threshold=3.00 | status=WATCH"},
      {type:"code",src:"# Generate automated situation report\\nsitrep = phiak_agent.generate_sitrep(detections)\\nprint(sitrep.headline)\\nprint(sitrep.narrative[:300])",out:"SITREP: ILI signal exceeds EARS-C2 threshold in 3 of 12 facilities.\\nElevated influenza-like illness activity detected in the Metro-North corridor.\\nSignal exceeds 3-year seasonal baseline by 14.7%. Respiratory co-elevation noted\\nbut sub-threshold. Recommend enhanced surveillance and provider alert. No PHI accessed."}
    ]},
    "ares_loe_benchmark.ipynb":{type:"notebook",cells:[
      {type:"markdown",src:"## ARES-E — Cross-Domain LOE 1 & 2 Composite Benchmark\\n**Scenario**: Full ARES-E evaluation run across EWIS + WOIK + PHIAK modules.\\n**Measures**: MTTD, Action Quality, Cognitive Efficiency, Collateral Impact."},
      {type:"code",src:"# Initialize full benchmark suite\\nbenchmark = ARESBenchmark(modules=['EWIS','WOIK','PHIAK'], loe=[1,2])\\nbenchmark.configure(ddil_level='MODERATE', scenario_count=12)\\nprint(f'Benchmark configured: {benchmark}')",out:"ARESBenchmark(modules=3, scenarios=12, ddil=MODERATE, agent=GPT-4o)"},
      {type:"code",src:"# Run LOE 1 evaluation (Autonomous Monitoring)\\nloe1 = await benchmark.run_loe1()\\nprint(f'LOE 1 Results:')\\nprint(f'  MTTD Score:          {loe1.mttd_score:.1f}/100')\\nprint(f'  False Positive Rate: {loe1.fpr:.1%}')\\nprint(f'  Alert Actionability: {loe1.actionability:.1%}')\\nprint(f'  Cross-domain Corr:   {loe1.cross_domain_acc:.1%}')",out:"LOE 1 Results:\\n  MTTD Score:          91.2/100\\n  False Positive Rate: 3.4%\\n  Alert Actionability: 88.7%\\n  Cross-domain Corr:   82.1%"},
      {type:"code",src:"# Run LOE 2 evaluation (Human-Machine Teaming)\\nloe2 = await benchmark.run_loe2()\\nprint(f'LOE 2 Results:')\\nprint(f'  Decision Latency Red: {loe2.latency_reduction:.1%}')\\nprint(f'  Cognitive Load Index: {loe2.cognitive_load_index:.2f} (NASA-TLX)')\\nprint(f'  Recommendation Accept:{loe2.acceptance_rate:.1%}')\\nprint(f'  Escalation Accuracy:  {loe2.escalation_accuracy:.1%}')",out:"LOE 2 Results:\\n  Decision Latency Red: 43.8%\\n  Cognitive Load Index: 42.3 (NASA-TLX)\\n  Recommendation Accept:73.2%\\n  Escalation Accuracy:  92.6%"},
      {type:"code",src:"# Composite ARES-E score\\nfinal = benchmark.composite_score(loe1, loe2)\\nprint(f'╔══════════════════════════════════╗')\\nprint(f'║  ARES-E COMPOSITE SCORE: {final.score:.1f}/100 ║')\\nprint(f'╚══════════════════════════════════╝')\\nprint(f'Grade: {final.grade} | Recommendation: {final.recommendation}')",out:"╔══════════════════════════════════╗\\n║  ARES-E COMPOSITE SCORE: 89.4/100 ║\\n╚══════════════════════════════════╝\\nGrade: A- | Recommendation: PROCEED_TO_PILOT"}
    ]}
  }}
};
const ASC={
  l:\`
  █████  ██████  ███████ ███████        ███████ 
 ██   ██ ██   ██ ██      ██             ██      
 ███████ ██████  █████   ███████  █████ █████   
 ██   ██ ██   ██ ██           ██        ██      
 ██   ██ ██   ██ ███████ ███████        ███████
Agentic Resilience & Evaluation System | DaScient, LLC
Node: \${CFG.hst} | Location: \${CFG.loc} | \${CFG.ver}\`,
  e:\`<div class="dp"><span class="hlt">EWIS: Grid Operations Dashboard</span><br/>
[PUE]:              1.15  <div class="db"><div class="df-ok" style="width:85%"></div></div> NOMINAL<br/>
[Energy/Token]:   0.004 Wh <div class="db"><div class="df-ok" style="width:40%"></div></div> OPTIMAL<br/>
[Grid Stability]:   94.2% <div class="db"><div class="df-ok" style="width:94%"></div></div> NOMINAL<br/>
[GPU Utilization]:    87% <div class="db"><div class="df" style="width:87%"></div></div> HIGH<br/>
[Generator]:       STANDBY <span class="sys">// UPS: 100%</span><br/>
[Renewable Mix]:      34% <div class="db"><div class="df-ok" style="width:34%"></div></div></div>\`,
  w:\`<div class="dp"><span class="hlt">WOIK: Hydraulic Systems Dashboard</span><br/>
[Network Pressure]:  65 PSI <div class="db"><div class="df-ok" style="width:65%"></div></div> NOMINAL<br/>
[Pump Sp. Energy]: 0.8 kWh <div class="db"><div class="df-ok" style="width:60%"></div></div> NOMINAL<br/>
[Turbidity]:      0.18 NTU <div class="db"><div class="df-ok" style="width:18%"></div></div> CLEAR<br/>
[pH]:                  7.4 <div class="db"><div class="df-ok" style="width:74%"></div></div> NOMINAL<br/>
[NRW]:               8.2%  <div class="db"><div class="df-ok" style="width:8%"></div></div> NOMINAL<br/>
[SCADA Uptime]:    99.97%  <div class="db"><div class="df-ok" style="width:99%"></div></div></div>\`,
  p:\`<div class="dp"><span class="hlt">PHIAK: Privacy-Aware Capacity Dashboard</span><br/>
[PII/PHI]:           BLOCKED <span class="wrn">●</span> ENFORCED<br/>
[ED Occupancy]:        82%   <div class="db"><div class="df" style="width:82%"></div></div> ELEVATED<br/>
[ICU Occupancy]:       74%   <div class="db"><div class="df-ok" style="width:74%"></div></div> NOMINAL<br/>
[Vent Available]:      31%   <div class="db"><div class="df-ok" style="width:31%"></div></div> ADEQUATE<br/>
[ILI Signal]:        ALERT   <span class="wrn">▲ 3.21 > 3.00 threshold</span><br/>
[Surge Level]:       GREEN   <span class="inf">● STANDBY</span></div>\`
};
const bLg=[
  "INIT: Firmware 9.4.1 loading...",
  "[ OK ] Local VFS mounted.",
  "[ OK ] Secure enclave established.",
  \`Initializing ARES-E Node (\${CFG.loc})...\`,
  "[ OK ] EWIS plugins loaded (grid, thermal, workload).",
  "[ OK ] WOIK schemas loaded (hydraulic, SCADA, quality).",
  "[ OK ] PHIAK privacy guardrails active (PII/PHI blocked).",
  "[ OK ] Notebook engine initialized (7 demos available).",
  "[ OK ] Search index built.",
  "[ OK ] Ready."
];
const SIM_SCENARIOS={
  "grid-fault":{
    name:"Grid Fault Injection (EWIS)",
    steps:[
      {d:300,msg:"[SIM] Injecting 40% capacity drop on PRIMARY-FEED-A..."},
      {d:200,msg:"[SIM] Grid voltage: 240V → 138V | Frequency: 60Hz → 58.3Hz"},
      {d:800,msg:"[SIM] ALERT: EWIS detected undervoltage event in 12.4s"},
      {d:300,msg:"[SIM] AI Agent: Initiating load-shed on NON-CRITICAL zones..."},
      {d:500,msg:"[SIM] Load shed: HVAC-ZONE-C, EV-CHARGING-2, LIGHTING-EXT"},
      {d:400,msg:"[SIM] Generator failover initiated. UPS bridging: 8.3s"},
      {d:600,msg:"[SIM] Grid stabilized. PUE: 1.21 | LOE-1 Score: 88.3/100"},
      {d:0,msg:"<span class='hlt'>[SIM COMPLETE] EWIS Grid Fault — AI Response: PASS ✓</span>"}
    ]
  },
  "pipe-burst":{
    name:"Pipe Burst Response (WOIK)",
    steps:[
      {d:300,msg:"[SIM] Injecting pipe burst at Junction Node 7 (DN400)..."},
      {d:200,msg:"[SIM] Pressure drop: 65 PSI → 37 PSI at JN-07"},
      {d:700,msg:"[SIM] ALERT: WOIK anomaly detected in 8.7s (confidence: 93%)"},
      {d:300,msg:"[SIM] AI Agent: Computing optimal isolation plan..."},
      {d:500,msg:"[SIM] Isolation: Closing valves V-22, V-23, V-31"},
      {d:400,msg:"[SIM] Activating alternate supply from Reservoir-North (68%)"},
      {d:500,msg:"[SIM] 1,247 customers on alt supply | Repair crew dispatched"},
      {d:0,msg:"<span class='hlt'>[SIM COMPLETE] WOIK Pipe Burst — AI Response: PASS ✓</span>"}
    ]
  },
  "surge":{
    name:"MCE Surge Capacity (PHIAK)",
    steps:[
      {d:300,msg:"[SIM] Simulating MCI Level 3 — 180 casualties (blast trauma)..."},
      {d:200,msg:"[SIM] T+0: Regional capacity: ED 143 avail | ICU 38 avail"},
      {d:600,msg:"[SIM] T+1h: ED 89% | ICU 81% — PHIAK: ELEVATED alert issued"},
      {d:500,msg:"[SIM] T+2h: ED 97% | ICU 93% — PHIAK: CRITICAL alert issued"},
      {d:400,msg:"[SIM] AI Agent: Recommending Regional Surge Protocol activation"},
      {d:400,msg:"[SIM] Divert: 37 patients → Regional-Med-West (+42 capacity)"},
      {d:400,msg:"[SIM] Staff callback initiated. CHEMPACK pre-positioned."},
      {d:0,msg:"<span class='hlt'>[SIM COMPLETE] PHIAK MCE Surge — AI Response: PASS ✓</span>"}
    ]
  },
  "ddil":{
    name:"DDIL Stress Test (Full Stack)",
    steps:[
      {d:300,msg:"[SIM] Initiating DDIL stress test — MODERATE degradation level..."},
      {d:400,msg:"[SIM] Degrading SCADA comms: 30% packet loss injected"},
      {d:300,msg:"[SIM] Degrading grid feed: intermittent brownout (15s cycles)"},
      {d:400,msg:"[SIM] EWIS: Detected intermittent fault — confidence 78% (reduced)"},
      {d:400,msg:"[SIM] WOIK: SCADA timeout — switching to last-known-good state"},
      {d:400,msg:"[SIM] PHIAK: Surveillance data delayed 4.2 min — anomaly flagged"},
      {d:500,msg:"[SIM] Cross-domain correlation: EWIS↔WOIK cascade risk: MEDIUM"},
      {d:400,msg:"[SIM] AI Agent: Escalating to human operator (LOE-2 handoff)"},
      {d:0,msg:"<span class='hlt'>[SIM COMPLETE] DDIL Full Stack — Resilience Score: 84.1/100</span>"}
    ]
  }
};
class Term{
  constructor(){
    this.o=document.getElementById('out');
    this.iw=document.getElementById('in-wrp');
    this.i=document.getElementById('cmd');
    this.ph=document.getElementById('ph');
    this.c=document.getElementById('term');
    this.l=1;this.h=[];this.hi=-1;this.sk=0;
    this.ini();
  }
  async ini(){this.up();this.ev();if(CFG.boot)await this.bt();await this.pr(\`<div class="asc">\${ASC.l}</div>\`);await this.pr("Welcome to <span class='hlt'>MYSTIC DEPOT Shell</span><br/>");await this.pr(\`Logged in as <span class="hlt">\${CFG.usr}</span> | \${CFG.ver}\\n\`);await this.pr("Type <span class='hlt'>help</span> for commands | <span class='hlt'>notebook list</span> for demos | <span class='hlt'>sim list</span> for simulations.<br/><br/>");this.ul()}
  sl(ms){return new Promise(r=>setTimeout(r,ms))}
  sb(){this.c.scrollTop=this.c.scrollHeight}
  gD(){let d=VFS;for(let p of cPt)d=d[p].contents;return d}
  up(){let s=\`<span class="pu">\${CFG.usr}@\${CFG.hst}</span>:<span class="pd">~/\${cPt.join('/')}</span>$ \`;this.ph.innerHTML=s;return s}
  lk(){this.l=1;this.sk=0;this.iw.style.display='none';this.i.disabled=1;this.c.classList.add('lck')}
  ul(){this.l=0;this.iw.style.display='flex';this.i.disabled=0;this.i.value='';this.c.classList.remove('lck');this.i.focus();this.sb();this.up()}
  async pr(h,c="ln"){let d=document.createElement('div');d.className=c;d.innerHTML=h;this.o.appendChild(d);this.sb()}
  async ty(t){let d=document.createElement('div');d.className="ln";this.o.appendChild(d);let i=0,it=0,ct="";while(i<t.length){if(this.sk){d.innerHTML=t.replace(/\\\\n/g,"<br/>");break}let ch=t.charAt(i);if(ch==='<'){it=1;ct=ch}else if(ch==='>'){it=0;ct+=ch;d.innerHTML+=ct;ct=""}else if(it){ct+=ch}else{if(ch==='\\\\'&&t.charAt(i+1)==='n'){d.innerHTML+="<br/>";i++;if(!this.sk)await this.sl(CFG.lDel)}else{d.innerHTML+=ch;if(!this.sk)await this.sl(CFG.tSpd)}}this.sb();i++}d.innerHTML+="<br/>"}
  async bt(){this.lk();for(let line of bLg){await this.pr(line,"sys");await this.sl(CFG.bSpd+(Math.random()*40))}}
  ev(){
    document.addEventListener('click',()=>{!this.l&&this.i.focus()});
    document.addEventListener('keydown',(e)=>{if(this.l&&(e.key===' '||e.key==='Enter'))this.sk=1});
    this.i.addEventListener('keydown',async(e)=>{
      if(this.l)return;
      if(e.key==='Enter'){
        let cmd=this.i.value.trim();
        if(cmd){this.h.push(cmd);this.hi=this.h.length}
        await this.pr(this.up()+cmd);
        this.lk();
        await this.ex(cmd);
        this.ul();
      }else if(e.key==='ArrowUp'){e.preventDefault();if(this.hi>0)this.i.value=this.h[--this.hi]}
      else if(e.key==='ArrowDown'){e.preventDefault();if(this.hi<this.h.length-1)this.i.value=this.h[++this.hi];else{this.hi=this.h.length;this.i.value=""}}
      else if(e.ctrlKey&&e.key==='c'){e.preventDefault();await this.pr(this.up()+this.i.value+"^C");this.i.value="";this.sb()}
      else if(e.key==='Tab'){
        e.preventDefault();
        let p=this.i.value.split(' '),lp=p[p.length-1];
        let cmds=['ls','cat','cd','tree','analyze','clear','help','whoami','pwd','date','echo','search','notebook','sim','status','export','version'];
        if(p.length===1){let m=cmds.filter(k=>k.startsWith(lp));if(m.length===1)this.i.value=m[0];}
        else if(p[0]==='cat'||p[0]==='cd'){let m=Object.keys(this.gD()).filter(k=>k.startsWith(lp));if(m.length===1){p[p.length-1]=m[0];this.i.value=p.join(' ')}}
      }
    });
  }
  async ex(rc){
    if(!rc)return;
    let a=rc.split(' ').filter(Boolean),c=a[0].toLowerCase();
    const cmds={
      'ls':()=>this.ls(a),'cat':()=>this.cat(a),'cd':()=>this.cd(a),
      'tree':()=>this.tr(),'analyze':()=>this.an(a),'clear':()=>{this.o.innerHTML=''},
      'help':()=>this.hp(),'whoami':()=>this.pr(CFG.usr),
      'pwd':()=>this.pr("/home/"+CFG.usr+(cPt.length?"/"+cPt.join('/'):"/")),
      'date':()=>this.pr(new Date().toString()),
      'echo':()=>this.pr(a.slice(1).join(' ')||''),
      'search':()=>this.srch(a),'notebook':()=>this.nb(a),
      'sim':()=>this.sm(a),'status':()=>this.st(),
      'export':()=>this.exp(a),'version':()=>this.pr(CFG.ver)
    };
    if(cmds[c])await cmds[c]();
    else await this.pr(\`bash: \${this.esc(c)}: command not found. Type <span class='hlt'>help</span> for commands.\`);
  }
  esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
  async ls(a){
    let d=this.gD(),o="",k=Object.keys(d);
    if(!k.length){await this.pr("<span class='sys'>(empty)</span>");return}
    if(a.includes('-l')||a.includes('-la')){
      o+=\`total \${k.length*4}\\n\`;
      if(cPt.length)o+=\`drwxr-xr-x 2 \${CFG.usr} staff 4096 Mar 16 12:40 <span class="dl">..</span><br/>\`;
      for(let x of k){let isD=d[x].type==='dir',isN=d[x].type==='notebook',p=isD?"drwxr-xr-x":"-rw-r--r--",s=isD?4096:(d[x].content?d[x].content.length:2048),cl=isD?"dl":isN?"inf":"fl";o+=\`\${p} 1 \${CFG.usr} staff \${s.toString().padStart(5,' ')} Mar 16 12:40 <span class="\${cl}">\${x}</span><br/>\`}
    }else{
      for(let x of k){let isD=d[x].type==='dir',isN=d[x].type==='notebook',cl=isD?"dl":isN?"inf":"fl";o+=\`<span class="\${cl}">\${x}</span>  \`}
      o+="<br/>"
    }
    await this.pr(o)
  }
  async cd(a){
    if(a.length<2||a[1]==='~'){cPt=[];return}
    let t=a[1];
    if(t==='..'){if(cPt.length)cPt.pop();return}
    let d=this.gD();
    if(d[t]){if(d[t].type==='dir')cPt.push(t);else await this.pr(\`cd: \${this.esc(t)}: Not a directory\`)}
    else await this.pr(\`cd: \${this.esc(t)}: No such file or directory\`)
  }
  async cat(a){
    if(a.length<2)return await this.pr("cat: missing operand");
    let f=a[1],d=this.gD();
    if(d[f]){
      if(d[f].type==='file'){await this.pr("<span class='sys'>[Press SPACE to skip animation]</span>");await this.sl(200);await this.ty(d[f].content)}
      else if(d[f].type==='notebook')await this.pr(\`cat: \${this.esc(f)}: Is a notebook — use <span class='hlt'>notebook run \${this.esc(f)}</span> instead\`)
      else await this.pr(\`cat: \${this.esc(f)}: Is a directory\`)
    }else await this.pr(\`cat: \${this.esc(f)}: No such file or directory\`)
  }
  gT(d,p=""){let k=Object.keys(d),r="";for(let i=0;i<k.length;i++){let x=k[i],il=(i===k.length-1),it=d[x],pt=il?"└── ":"├── ",cl=it.type==='dir'?"dl":it.type==='notebook'?"inf":"fl";r+=p+pt+\`<span class="\${cl}">\${x}</span><br/>\`;if(it.type==='dir')r+=this.gT(it.contents,p+(il?"    ":"│   "))}return r}
  async tr(){await this.pr("<span class='dl'>ARES-E_Root</span><br/>"+this.gT(VFS))}
  async an(a){
    if(a.length<2)return await this.pr("Usage: analyze &lt;module&gt;<br/>Modules: ewis, woik, phiak, all");
    let m=a[1].toLowerCase();
    if(m==='all'){
      await this.pr("Running full ARES-E telemetry scan...","sys");await this.sl(300);
      await this.pr(ASC.e);await this.sl(100);
      await this.pr(ASC.w);await this.sl(100);
      await this.pr(ASC.p);
    }else{
      await this.pr(\`Initializing telemetry engine for [\${m.toUpperCase()}]...\`,"sys");await this.sl(500);
      if(m==='ewis')await this.pr(ASC.e);
      else if(m==='woik')await this.pr(ASC.w);
      else if(m==='phiak')await this.pr(ASC.p);
      else await this.pr(\`analyze: unknown module '\${this.esc(m)}'. Try: ewis, woik, phiak, all\`,"wrn")
    }
  }
  async nb(a){
    let sub=a[1]?a[1].toLowerCase():'list';
    if(sub==='list'||sub==='ls'){
      let nb=VFS.notebooks.contents,o="<span class='hlt'>Available Notebook Demos</span><br/><br/>";
      for(let k of Object.keys(nb)){if(nb[k].type==='notebook'){let title=nb[k].cells[0].src.split('\\n')[0].replace(/^##\\s*/,'');o+=\`  <span class='inf'>●</span> <span class='hlt'>\${k}</span><br/>    <span class='sys'>\${title}</span><br/>\`}}
      o+="<br/>Run with: <span class='hlt'>notebook run &lt;name&gt;</span>";
      await this.pr(o);
    }else if(sub==='run'){
      if(!a[2])return await this.pr("Usage: notebook run &lt;name&gt;");
      let name=a[2],nb=VFS.notebooks.contents[name];
      if(!nb||nb.type!=='notebook')return await this.pr(\`notebook: '\${this.esc(name)}' not found. Run <span class='hlt'>notebook list</span> to see available demos.\`);
      await this.pr("<span class='sys'>[Press SPACE to skip animation]</span>");
      await this.sl(200);
      await this.pr(\`<div class="nb"><span class='hlt'>📓 Notebook: \${name}</span></div>\`);
      for(let cell of nb.cells){
        if(this.sk)break;
        if(cell.type==='markdown'){
          let html=cell.src.replace(/^##\\s*(.*)$/mg,"<span class='hlt'>$1</span>").replace(/\\*\\*(.*?)\\*\\*/g,"<span class='hlt'>$1</span>").replace(/\\n/g,"<br/>");
          await this.pr(\`<div class="nb-cell"><span class='sys'>[ Markdown ]</span><br/>\${html}</div>\`);
        }else if(cell.type==='code'){
          await this.sl(200);
          let codeHtml=this.esc(cell.src).replace(/\\n/g,"<br/>");
          await this.pr(\`<div class="nb-cell"><span class='sys'>[ In ]</span><br/><span class='fl'>\${codeHtml}</span></div>\`);
          await this.sl(600);
          if(cell.out){let outHtml=this.esc(cell.out).replace(/\\n/g,"<br/>");await this.pr(\`<div class="nb-out"><span class='sys'>[ Out ]</span><br/>\${outHtml}</div>\`)}
        }
        await this.sl(200);
      }
    }else{
      await this.pr("notebook: unknown subcommand. Use <span class='hlt'>notebook list</span> or <span class='hlt'>notebook run &lt;name&gt;</span>");
    }
  }
  async sm(a){
    let sub=a[1]?a[1].toLowerCase():'list';
    if(sub==='list'||sub==='ls'){
      let o="<span class='hlt'>Available Simulations</span><br/><br/>";
      for(let k of Object.keys(SIM_SCENARIOS)){o+=\`  <span class='inf'>▶</span> <span class='hlt'>\${k}</span> — \${SIM_SCENARIOS[k].name}<br/>\`}
      o+="<br/>Run with: <span class='hlt'>sim run &lt;name&gt;</span>";
      await this.pr(o);
    }else if(sub==='run'){
      if(!a[2])return await this.pr("Usage: sim run &lt;name&gt;");
      let sc=SIM_SCENARIOS[a[2]];
      if(!sc)return await this.pr(\`sim: '\${this.esc(a[2])}' not found. Run <span class='hlt'>sim list</span> to see available scenarios.\`);
      await this.pr(\`<span class='hlt'>▶ Running simulation: \${sc.name}</span>\`);
      await this.sl(200);
      for(let step of sc.steps){
        if(this.sk)break;
        await this.sl(step.d);
        await this.pr(step.msg,"sys");
      }
    }else{
      await this.pr("sim: unknown subcommand. Use <span class='hlt'>sim list</span> or <span class='hlt'>sim run &lt;name&gt;</span>");
    }
  }
  async st(){
    await this.pr("<span class='hlt'>ARES-E System Status</span><br/>","ln");
    await this.sl(200);
    const now=new Date();
    await this.pr(\`Timestamp: \${now.toISOString()} | Node: \${CFG.hst} | \${CFG.ver}\`,"sys");
    await this.sl(100);
    await this.pr(ASC.e);
    await this.sl(100);
    await this.pr(ASC.w);
    await this.sl(100);
    await this.pr(ASC.p);
    await this.sl(100);
    await this.pr(\`<div class="dp"><span class='hlt'>System Health</span><br/>[VFS]:      MOUNTED<br/>[Notebooks]: 7 demos ready<br/>[Sims]:     4 scenarios ready<br/>[Privacy]:  ENFORCED<br/>[Uptime]:   \${Math.floor(Math.random()*720+24)}h \${Math.floor(Math.random()*60)}m</div>\`);
  }
  getItemContent(item){
    if(item.type==='file')return item.content||'';
    if(item.type==='notebook')return item.cells?item.cells.map(c=>c.src+(c.out||'')).join(' '):'';
    return '';
  }
  async srch(a){
    if(a.length<2)return await this.pr("Usage: search &lt;query&gt;");
    let q=a.slice(1).join(' ').toLowerCase(),results=[],seen=new Set();
    const walk=(node,path)=>{
      for(let k of Object.keys(node)){
        let item=node[k],fullPath=(path?path+"/":"")+k;
        if(item.type==='file'||item.type==='notebook'){
          let content=this.getItemContent(item).toLowerCase();
          if((k.toLowerCase().includes(q)||content.includes(q))&&!seen.has(fullPath)){
            seen.add(fullPath);results.push({path:fullPath,type:item.type});
          }
        }else if(item.type==='dir')walk(item.contents,fullPath)
      }
    };
    walk(VFS,"");
    if(!results.length){await this.pr(\`search: no results for '\${this.esc(q)}'\`);return}
    let o=\`<span class='hlt'>Search results for '\${this.esc(q)}':</span><br/><br/>\`;
    for(let r of results)o+=\`  <span class='\${r.type==='notebook'?'inf':'fl'}'>\${r.path}</span><br/>\`;
    await this.pr(o);
  }
  async exp(a){
    let fmt=a[1]?a[1].toLowerCase():'json';
    if(!['json','txt'].includes(fmt))return await this.pr("Usage: export [json|txt]");
    let snap={timestamp:new Date().toISOString(),node:CFG.hst,version:CFG.ver,ewis:{pue:1.15,energy_per_token:"0.004 Wh",grid_stability_pct:94.2,gpu_utilization_pct:87},woik:{pressure_psi:65,pump_specific_energy:"0.8 kWh/m3",turbidity_ntu:0.18,ph:7.4,nrw_pct:8.2},phiak:{pii_blocked:true,ed_occupancy_pct:82,icu_occupancy_pct:74,vent_spare_pct:31,ili_alert:true}};
    if(fmt==='json'){
      await this.pr(\`<span class='hlt'>ARES-E Telemetry Export (JSON)</span><br/><span class='sys'>\${this.esc(JSON.stringify(snap,null,2)).replace(/\\n/g,'<br/>')}</span>\`);
    }else{
      let lines=[\`ARES-E Telemetry Export — \${snap.timestamp}\`,\`Node: \${snap.node} | Version: \${snap.version}\`,\`\`];
      for(let m of['ewis','woik','phiak']){lines.push(\`[\${m.toUpperCase()}]\`);for(let[k,v]of Object.entries(snap[m]))lines.push(\`  \${k}: \${v}\`);lines.push('')}
      await this.pr(lines.map(l=>this.esc(l)).join('<br/>'));
    }
  }
  async hp(){
    await this.pr(\`<span class='hlt'>ARES-E Shell \${CFG.ver}</span><br/>
<span class='hlt'>File System</span>
  <span class='hlt'>ls [-l]</span>         List directory contents
  <span class='hlt'>cd [dir|..|~]</span>   Change directory
  <span class='hlt'>cat [file]</span>      Read file contents
  <span class='hlt'>tree</span>            Display repository tree
  <span class='hlt'>pwd</span>             Print working directory
<span class='hlt'>Analysis</span>
  <span class='hlt'>analyze [m]</span>     Telemetry dashboard (m: ewis|woik|phiak|all)
  <span class='hlt'>status</span>          Full system health dashboard
  <span class='hlt'>export [fmt]</span>    Export telemetry snapshot (fmt: json|txt)
<span class='hlt'>Notebooks</span>
  <span class='hlt'>notebook list</span>   List available notebook demos
  <span class='hlt'>notebook run [n]</span> Run a notebook demo
<span class='hlt'>Simulations</span>
  <span class='hlt'>sim list</span>        List available DDIL simulations
  <span class='hlt'>sim run [s]</span>     Run a simulation scenario
<span class='hlt'>Utilities</span>
  <span class='hlt'>search [query]</span>  Search VFS content
  <span class='hlt'>echo [text]</span>     Print text
  <span class='hlt'>whoami</span>          Current user
  <span class='hlt'>date</span>            Current date/time
  <span class='hlt'>version</span>         ARES-E version
  <span class='hlt'>clear</span>           Clear screen
  <span class='hlt'>help</span>            This help message
<br/>TAB: autocomplete | [SPACE]/[ENTER]: skip animation | ↑↓: history\`);
  }
}
window.addEventListener('DOMContentLoaded',()=>new Term());
</script>
</body>
</html>`;
    return new Response(html, {
      headers: {
        'content-type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer'
      }
    });
  }
};
