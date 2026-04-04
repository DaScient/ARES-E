/**
 * ARES-E Boot Sequence Messages
 */
export function getBootLog(cfg) {
  return [
    "INIT: Firmware 9.4.1 loading...",
    "[ OK ] Local VFS mounted.",
    "[ OK ] Secure enclave established.",
    `Initializing ARES-E Node (${cfg.loc})...`,
    "[ OK ] EWIS plugins loaded (grid, thermal, workload).",
    "[ OK ] WOIK schemas loaded (hydraulic, SCADA, quality).",
    "[ OK ] PHIAK privacy guardrails active (PII/PHI blocked).",
    "[ OK ] Notebook engine initialized (7 demos available).",
    "[ OK ] Search index built.",
    "[ OK ] Ready."
  ];
}
