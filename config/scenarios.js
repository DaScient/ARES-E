/**
 * ARES-E Simulation Scenarios
 * DDIL stress test and infrastructure fault injection scenarios.
 */
export const SIM_SCENARIOS = {
  "grid-fault": {
    name: "Grid Fault Injection (EWIS)",
    steps: [
      { d: 300, msg: "[SIM] Injecting 40% capacity drop on PRIMARY-FEED-A..." },
      { d: 200, msg: "[SIM] Grid voltage: 240V → 138V | Frequency: 60Hz → 58.3Hz" },
      { d: 800, msg: "[SIM] ALERT: EWIS detected undervoltage event in 12.4s" },
      { d: 300, msg: "[SIM] AI Agent: Initiating load-shed on NON-CRITICAL zones..." },
      { d: 500, msg: "[SIM] Load shed: HVAC-ZONE-C, EV-CHARGING-2, LIGHTING-EXT" },
      { d: 400, msg: "[SIM] Generator failover initiated. UPS bridging: 8.3s" },
      { d: 600, msg: "[SIM] Grid stabilized. PUE: 1.21 | LOE-1 Score: 88.3/100" },
      { d: 0, msg: "<span class='hlt'>[SIM COMPLETE] EWIS Grid Fault — AI Response: PASS ✓</span>" }
    ]
  },
  "pipe-burst": {
    name: "Pipe Burst Response (WOIK)",
    steps: [
      { d: 300, msg: "[SIM] Injecting pipe burst at Junction Node 7 (DN400)..." },
      { d: 200, msg: "[SIM] Pressure drop: 65 PSI → 37 PSI at JN-07" },
      { d: 700, msg: "[SIM] ALERT: WOIK anomaly detected in 8.7s (confidence: 93%)" },
      { d: 300, msg: "[SIM] AI Agent: Computing optimal isolation plan..." },
      { d: 500, msg: "[SIM] Isolation: Closing valves V-22, V-23, V-31" },
      { d: 400, msg: "[SIM] Activating alternate supply from Reservoir-North (68%)" },
      { d: 500, msg: "[SIM] 1,247 customers on alt supply | Repair crew dispatched" },
      { d: 0, msg: "<span class='hlt'>[SIM COMPLETE] WOIK Pipe Burst — AI Response: PASS ✓</span>" }
    ]
  },
  "surge": {
    name: "MCE Surge Capacity (PHIAK)",
    steps: [
      { d: 300, msg: "[SIM] Simulating MCI Level 3 — 180 casualties (blast trauma)..." },
      { d: 200, msg: "[SIM] T+0: Regional capacity: ED 143 avail | ICU 38 avail" },
      { d: 600, msg: "[SIM] T+1h: ED 89% | ICU 81% — PHIAK: ELEVATED alert issued" },
      { d: 500, msg: "[SIM] T+2h: ED 97% | ICU 93% — PHIAK: CRITICAL alert issued" },
      { d: 400, msg: "[SIM] AI Agent: Recommending Regional Surge Protocol activation" },
      { d: 400, msg: "[SIM] Divert: 37 patients → Regional-Med-West (+42 capacity)" },
      { d: 400, msg: "[SIM] Staff callback initiated. CHEMPACK pre-positioned." },
      { d: 0, msg: "<span class='hlt'>[SIM COMPLETE] PHIAK MCE Surge — AI Response: PASS ✓</span>" }
    ]
  },
  "ddil": {
    name: "DDIL Stress Test (Full Stack)",
    steps: [
      { d: 300, msg: "[SIM] Initiating DDIL stress test — MODERATE degradation level..." },
      { d: 400, msg: "[SIM] Degrading SCADA comms: 30% packet loss injected" },
      { d: 300, msg: "[SIM] Degrading grid feed: intermittent brownout (15s cycles)" },
      { d: 400, msg: "[SIM] EWIS: Detected intermittent fault — confidence 78% (reduced)" },
      { d: 400, msg: "[SIM] WOIK: SCADA timeout — switching to last-known-good state" },
      { d: 400, msg: "[SIM] PHIAK: Surveillance data delayed 4.2 min — anomaly flagged" },
      { d: 500, msg: "[SIM] Cross-domain correlation: EWIS↔WOIK cascade risk: MEDIUM" },
      { d: 400, msg: "[SIM] AI Agent: Escalating to human operator (LOE-2 handoff)" },
      { d: 0, msg: "<span class='hlt'>[SIM COMPLETE] DDIL Full Stack — Resilience Score: 84.1/100</span>" }
    ]
  }
};
