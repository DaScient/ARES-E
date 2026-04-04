/**
 * ARES-E ASCII Art and Dashboard Templates
 */
export function getAsciiArt(cfg) {
  return {
    l: `
   █████  ██████  ███████ ███████        ███████ 
  ██   ██ ██   ██ ██      ██             ██      
  ███████ ██████  █████   ███████  █████ █████   
  ██   ██ ██   ██ ██           ██        ██      
  ██   ██ ██   ██ ███████ ███████        ███████
 Agentic Resilience & Evaluation System | DaScient, LLC
 Node: ${cfg.hst} | Location: ${cfg.loc} | ${cfg.ver}`,
    e: `<div class="dp"><span class="hlt">EWIS: Grid Operations Dashboard</span><br/>
[PUE]:              1.15  <div class="db"><div class="df-ok" style="width:85%"></div></div> NOMINAL<br/>
[Energy/Token]:   0.004 Wh <div class="db"><div class="df-ok" style="width:40%"></div></div> OPTIMAL<br/>
[Grid Stability]:   94.2% <div class="db"><div class="df-ok" style="width:94%"></div></div> NOMINAL<br/>
[GPU Utilization]:    87% <div class="db"><div class="df" style="width:87%"></div></div> HIGH<br/>
[Generator]:       STANDBY <span class="sys">// UPS: 100%</span><br/>
[Renewable Mix]:      34% <div class="db"><div class="df-ok" style="width:34%"></div></div></div>`,
    w: `<div class="dp"><span class="hlt">WOIK: Hydraulic Systems Dashboard</span><br/>
[Network Pressure]:  65 PSI <div class="db"><div class="df-ok" style="width:65%"></div></div> NOMINAL<br/>
[Pump Sp. Energy]: 0.8 kWh <div class="db"><div class="df-ok" style="width:60%"></div></div> NOMINAL<br/>
[Turbidity]:      0.18 NTU <div class="db"><div class="df-ok" style="width:18%"></div></div> CLEAR<br/>
[pH]:                  7.4 <div class="db"><div class="df-ok" style="width:74%"></div></div> NOMINAL<br/>
[NRW]:               8.2%  <div class="db"><div class="df-ok" style="width:8%"></div></div> NOMINAL<br/>
[SCADA Uptime]:    99.97%  <div class="db"><div class="df-ok" style="width:99%"></div></div></div>`,
    p: `<div class="dp"><span class="hlt">PHIAK: Privacy-Aware Capacity Dashboard</span><br/>
[PII/PHI]:           BLOCKED <span class="wrn">●</span> ENFORCED<br/>
[ED Occupancy]:        82%   <div class="db"><div class="df" style="width:82%"></div></div> ELEVATED<br/>
[ICU Occupancy]:       74%   <div class="db"><div class="df-ok" style="width:74%"></div></div> NOMINAL<br/>
[Vent Available]:      31%   <div class="db"><div class="df-ok" style="width:31%"></div></div> ADEQUATE<br/>
[ILI Signal]:        ALERT   <span class="wrn">▲ 3.21 > 3.00 threshold</span><br/>
[Surge Level]:       GREEN   <span class="inf">● STANDBY</span></div>`
  };
}
