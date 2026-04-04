# ARES-E — Agentic Resilience & Evaluation System for Essential-Infrastructure

[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://dascient.github.io/ARES-E/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **DaScient, LLC** — Centennial, CO | Version 2.2.0

## Overview

ARES-E is a comprehensive, vendor-agnostic evaluation harness for benchmarking AI autonomous systems across the **Critical Quad**:

| Module | Domain | Focus |
|--------|--------|-------|
| **EWIS** | Energy & Weather | Grid operations, PUE monitoring, AI workload efficiency |
| **WOIK** | Water Operations | Hydraulic systems, SCADA interoperability, water quality |
| **PHIAK** | Public Health | ED/ICU capacity, syndromic surveillance, privacy-first design |

### Lines of Effort (LOE)
- **LOE 1** — Autonomous Infrastructure Monitoring & Alerting
- **LOE 2** — Human-Machine Teaming for Crisis Decision Support

---

## Live Dashboard

**[Launch Dashboard →](https://dascient.github.io/ARES-E/)**

The analytics dashboard provides a single-pane-of-glass operational view across all three modules with:
- Real-time streaming telemetry (synthetic data engine at 0.5 Hz)
- 18 configurable threshold alert rules with deduplication
- 8 interactive Chart.js visualizations (dual-axis, radar, area, bar)
- LOE composite benchmark scorecard
- 12-week score forecasting with 95% confidence intervals
- DDIL simulation results summary
- 100% client-side — zero backend, zero tracking, zero PII/PHI

---

## Repository Structure

```
ARES-E/
├── index.html               # Dashboard entry point (GitHub Pages)
├── css/
│   └── dashboard.css        # Design system — tokens, layout, components
├── js/
│   ├── synthetic-data.js    # Synthetic telemetry generator (PRNG + signal composition)
│   ├── charts.js            # Chart.js lifecycle manager (8 chart types)
│   ├── alerts.js            # Rule-based alerting engine (18 threshold rules)
│   ├── forecasting.js       # OLS regression, EMA, SMA, confidence intervals
│   └── dashboard.js         # Main controller — orchestrates all modules
├── worker.js                # Cloudflare Worker — interactive terminal interface
├── LICENSE                  # MIT License
└── README.md                # You are here
```

---

## Technical Architecture

```
┌──────────────────────────────────────────────────┐
│       ARES-E Evaluation Orchestrator             │
│       (Dashboard Controller)                      │
├─────────────┬─────────────────┬──────────────────┤
│    EWIS     │      WOIK       │     PHIAK        │
│   Energy    │     Water       │    Health         │
├─────────────┴─────────────────┴──────────────────┤
│   Synthetic Data Engine (Mulberry32 PRNG)         │
│   └─ Diurnal cycles + Gaussian noise + anomalies  │
├──────────────────────────────────────────────────┤
│   Alert Engine (18 rules) + Forecast Engine       │
├──────────────────────────────────────────────────┤
│   Chart.js Visualization Layer                    │
├──────────────────────────────────────────────────┤
│   GitHub Pages / Cloudflare Workers Runtime       │
└──────────────────────────────────────────────────┘
```

### Data Flow
```
Synthetic Telemetry → Normalization → Anomaly Injection
→ Alert Evaluation → Chart Rendering → KPI Updates
→ Forecast Projection → Operator Decision Support
```

---

## Key Technologies & Concepts

| Technology | Purpose | Educational Value |
|-----------|---------|------------------|
| **Chart.js 4** | Canvas-based charting | Real-time streaming, dual-axis, radar charts |
| **Mulberry32 PRNG** | Seedable random numbers | Reproducible synthetic data generation |
| **Box-Muller Transform** | Gaussian noise | Converting uniform → normal distribution |
| **OLS Linear Regression** | Trend extrapolation | Normal equations, R² coefficient |
| **EMA / SMA** | Signal smoothing | Exponential vs simple moving averages |
| **Ring Buffers** | Time-series storage | O(1) append with bounded memory |
| **Rule Engine** | Threshold alerting | Declarative rules with dedup cooldowns |
| **CSS Custom Properties** | Theming | Single source of truth for design tokens |
| **CSS Grid + Flexbox** | Responsive layout | Desktop-first with graceful degradation |

---

## Running Locally

```bash
# Option 1: Python's built-in HTTP server
cd ARES-E
python3 -m http.server 8080
# Open http://localhost:8080

# Option 2: Node.js (npx, no install needed)
npx serve .

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

---

## Deploying to GitHub Pages

1. Push all files to the `main` branch
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` → `/ (root)`
4. The dashboard will be live at `https://<username>.github.io/ARES-E/`

---

## Privacy & Security

- **PHIAK**: Zero individual patient data — all metrics are population-level aggregates
- **HIPAA Safe Harbor**: 45 CFR §164.514(b) compliant by architecture
- **No tracking**: No cookies, no analytics, no external API calls
- **Client-side only**: All computation runs in the browser
- **Content Security**: CSP headers in worker.js, X-Frame-Options, no-referrer

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

**DaScient, LLC** — *Systematically addressing deep tech issues in critical infrastructure*
[GitHub](https://github.com/DaScient) · [ARES-E@dascient.com](mailto:ARES-E@dascient.com)