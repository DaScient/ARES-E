/* ==========================================================================
 * ARES-E Chart Manager — Visualization Layer
 * ==========================================================================
 *
 * PURPOSE:
 *   Creates, configures, and updates all Chart.js chart instances used in
 *   the ARES-E dashboard. This module encapsulates chart lifecycle management
 *   so the main dashboard controller only needs to pass data — not worry
 *   about rendering details.
 *
 * EDUCATIONAL NOTES:
 *
 *   CHART.JS ARCHITECTURE:
 *   Chart.js works by rendering to an HTML <canvas> element. Each chart is
 *   an instance of `new Chart(ctx, config)` where:
 *     - `ctx`    = a 2D canvas rendering context (canvas.getContext('2d'))
 *     - `config` = { type, data, options } configuration object
 *
 *   STREAMING / REAL-TIME UPDATES:
 *   For real-time charts, we push new data to `chart.data.datasets[0].data`
 *   and call `chart.update('none')` (the 'none' mode skips animations for
 *   smoother streaming). We also shift out old data to keep a fixed window.
 *
 *   COLOR & STYLING:
 *   We use translucent fills (rgba with low alpha) under line charts to
 *   create "area charts." This is standard practice for telemetry dashboards
 *   because it helps users visually estimate the magnitude of values.
 *
 * DEPENDS ON:
 *   - Chart.js (loaded via CDN in index.html)
 *   - CSS custom properties from dashboard.css (colors are read at init time)
 *
 * ========================================================================== */

class ChartManager {

  /* -----------------------------------------------------------------------
   * CONSTRUCTOR
   * -----------------------------------------------------------------------
   * Initializes the chart manager and reads CSS custom property colors
   * from the document so that chart colors stay synchronized with the theme.
   *
   * EDUCATIONAL TIP — Reading CSS Variables in JavaScript:
   *   `getComputedStyle(document.documentElement).getPropertyValue('--var')`
   *   returns the computed value of a CSS custom property. This lets JS
   *   and CSS share a single source of truth for colors.
   * ----------------------------------------------------------------------- */
  constructor() {
    const root = getComputedStyle(document.documentElement);
    this.colors = {
      ewis:     root.getPropertyValue('--ewis-color').trim()   || '#facc15',
      woik:     root.getPropertyValue('--woik-color').trim()    || '#06b6d4',
      phiak:    root.getPropertyValue('--phiak-color').trim()   || '#a78bfa',
      ok:       root.getPropertyValue('--status-ok').trim()     || '#10b981',
      warn:     root.getPropertyValue('--status-warn').trim()   || '#f59e0b',
      alert:    root.getPropertyValue('--status-alert').trim()  || '#ef4444',
      info:     root.getPropertyValue('--status-info').trim()   || '#3b82f6',
      indigo:   root.getPropertyValue('--accent-indigo').trim() || '#6366f1',
      textDim:  root.getPropertyValue('--text-dimmed').trim()   || '#6b7280',
      gridLine: 'rgba(255, 255, 255, 0.05)',
    };

    /* Store all chart instances by ID for later update/destroy */
    this.charts = {};
  }


  /* -----------------------------------------------------------------------
   * SHARED DEFAULTS
   * -----------------------------------------------------------------------
   * Base configuration options applied to every chart. Reduces duplication
   * and ensures visual consistency across the dashboard.
   *
   * EDUCATIONAL TIP — Chart.js Defaults:
   *   You can also set Chart.defaults globally, but per-chart overrides
   *   give finer control. We use a merge approach here.
   * ----------------------------------------------------------------------- */
  _baseOptions(overrides = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,     /* Disable animation for real-time streaming  */
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: overrides.showLegend ?? false,
          labels: {
            color: this.colors.textDim,
            font: { size: 11, family: "'Inter', sans-serif" },
            boxWidth: 12,
            boxHeight: 12,
            useBorderRadius: true,
            borderRadius: 2,
            padding: 12,
          }
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#e5e7eb',
          bodyColor: '#9ca3af',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          titleFont: { family: "'Inter', sans-serif", size: 12, weight: 600 },
          cornerRadius: 6,
          displayColors: true,
        },
      },
      scales: {
        x: {
          display: overrides.showXAxis ?? true,
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: {
            color: this.colors.textDim,
            font: { size: 10, family: "'JetBrains Mono', monospace" },
            maxTicksLimit: overrides.maxXTicks ?? 8,
            maxRotation: 0,
          },
        },
        y: {
          display: true,
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: {
            color: this.colors.textDim,
            font: { size: 10, family: "'JetBrains Mono', monospace" },
            maxTicksLimit: 6,
          },
          min: overrides.yMin,
          max: overrides.yMax,
        },
      },
      ...overrides.extra,
    };
  }


  /* -----------------------------------------------------------------------
   * HELPER: Create semi-transparent fill color from a hex/CSS color
   * -----------------------------------------------------------------------
   * EDUCATIONAL TIP — Canvas Gradients:
   *   For area charts, a vertical gradient that fades to transparent gives
   *   a professional "glow" effect. We create the gradient lazily when the
   *   chart first renders using a Chart.js plugin-friendly approach.
   * ----------------------------------------------------------------------- */
  _alpha(color, a = 0.15) {
    /* If it's already rgba, adjust alpha; otherwise convert hex */
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1,3), 16);
      const g = parseInt(color.slice(3,5), 16);
      const b = parseInt(color.slice(5,7), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return color.replace(/[\d.]+\)$/, `${a})`);
  }


  /* -----------------------------------------------------------------------
   * HELPER: Format timestamp as HH:MM:SS for chart labels
   * ----------------------------------------------------------------------- */
  _timeLabel(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }


  /* -----------------------------------------------------------------------
   * CREATE or GET a chart by ID
   * -----------------------------------------------------------------------
   * If the chart already exists, returns it. Otherwise creates a new one.
   * This pattern prevents duplicate chart instances on the same canvas,
   * which would cause memory leaks and rendering glitches.
   * ----------------------------------------------------------------------- */
  _getOrCreate(canvasId, type, data, options) {
    if (this.charts[canvasId]) {
      return this.charts[canvasId];
    }
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      console.warn(`ChartManager: canvas #${canvasId} not found`);
      return null;
    }
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, { type, data, options });
    this.charts[canvasId] = chart;
    return chart;
  }


  /* =======================================================================
   * EWIS CHARTS
   * ======================================================================= */

  /**
   * EWIS — PUE & Grid Stability (dual-axis line chart)
   *
   * EDUCATIONAL TIP — Dual Y-Axis Charts:
   *   When two metrics have different scales (PUE: 1.0–2.0, Grid: 60–100%),
   *   a dual y-axis lets viewers compare trends without confusion.
   *   Use Chart.js `yAxisID` on datasets and define two y-scales.
   */
  initEWISPrimary(history) {
    const labels = history.map(d => this._timeLabel(d.timestamp));
    const chart = this._getOrCreate('chart-ewis-primary', 'line', {
      labels,
      datasets: [
        {
          label: 'PUE',
          data: history.map(d => d.pue),
          borderColor: this.colors.ewis,
          backgroundColor: this._alpha(this.colors.ewis, 0.1),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'yPUE',
        },
        {
          label: 'Grid Stability %',
          data: history.map(d => d.gridStability),
          borderColor: this.colors.ok,
          backgroundColor: this._alpha(this.colors.ok, 0.08),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'yGrid',
        }
      ]
    }, {
      ...this._baseOptions({ showLegend: true }),
      scales: {
        x: {
          display: true,
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.textDim, font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
        },
        yPUE: {
          position: 'left',
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.ewis, font: { size: 10 }, maxTicksLimit: 6 },
          min: 1.0, max: 1.8,
          title: { display: true, text: 'PUE', color: this.colors.ewis, font: { size: 10 } },
        },
        yGrid: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: this.colors.ok, font: { size: 10 }, maxTicksLimit: 6 },
          min: 60, max: 100,
          title: { display: true, text: 'Grid %', color: this.colors.ok, font: { size: 10 } },
        },
      },
    });
    return chart;
  }

  /**
   * EWIS — GPU Utilization & Energy/Token (bar + line combo)
   */
  initEWISSecondary(history) {
    const labels = history.map(d => this._timeLabel(d.timestamp));
    return this._getOrCreate('chart-ewis-secondary', 'bar', {
      labels,
      datasets: [
        {
          label: 'GPU %',
          data: history.map(d => d.gpuUtil),
          backgroundColor: this._alpha(this.colors.info, 0.5),
          borderColor: this.colors.info,
          borderWidth: 1,
          borderRadius: 2,
          yAxisID: 'yGPU',
          order: 2,
        },
        {
          label: 'Energy/Token (Wh)',
          data: history.map(d => d.energyPerToken),
          type: 'line',
          borderColor: this.colors.ewis,
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'yEnergy',
          order: 1,
        }
      ]
    }, {
      ...this._baseOptions({ showLegend: true }),
      scales: {
        x: {
          display: true,
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.textDim, font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
        },
        yGPU: {
          position: 'left',
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.info, font: { size: 10 } },
          min: 0, max: 100,
        },
        yEnergy: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: this.colors.ewis, font: { size: 10 } },
          min: 0, max: 0.015,
        },
      },
    });
  }


  /* =======================================================================
   * WOIK CHARTS
   * ======================================================================= */

  /**
   * WOIK — Pressure & Flow Rate (dual line)
   */
  initWOIKPrimary(history) {
    const labels = history.map(d => this._timeLabel(d.timestamp));
    return this._getOrCreate('chart-woik-primary', 'line', {
      labels,
      datasets: [
        {
          label: 'Pressure (PSI)',
          data: history.map(d => d.pressurePSI),
          borderColor: this.colors.woik,
          backgroundColor: this._alpha(this.colors.woik, 0.1),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'yPSI',
        },
        {
          label: 'Flow Rate (GPM)',
          data: history.map(d => d.flowRateGPM),
          borderColor: this.colors.ok,
          backgroundColor: this._alpha(this.colors.ok, 0.08),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'yGPM',
        }
      ]
    }, {
      ...this._baseOptions({ showLegend: true }),
      scales: {
        x: {
          display: true,
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.textDim, font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
        },
        yPSI: {
          position: 'left',
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.woik, font: { size: 10 } },
          min: 20, max: 90,
          title: { display: true, text: 'PSI', color: this.colors.woik, font: { size: 10 } },
        },
        yGPM: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: this.colors.ok, font: { size: 10 } },
          min: 200, max: 2000,
          title: { display: true, text: 'GPM', color: this.colors.ok, font: { size: 10 } },
        },
      },
    });
  }

  /**
   * WOIK — Water Quality (turbidity + pH)
   */
  initWOIKSecondary(history) {
    const labels = history.map(d => this._timeLabel(d.timestamp));
    return this._getOrCreate('chart-woik-secondary', 'line', {
      labels,
      datasets: [
        {
          label: 'Turbidity (NTU)',
          data: history.map(d => d.turbidityNTU),
          borderColor: this.colors.warn,
          backgroundColor: this._alpha(this.colors.warn, 0.1),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'yNTU',
        },
        {
          label: 'pH',
          data: history.map(d => d.pH),
          borderColor: this.colors.indigo,
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'ypH',
        }
      ]
    }, {
      ...this._baseOptions({ showLegend: true }),
      scales: {
        x: {
          display: true,
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.textDim, font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
        },
        yNTU: {
          position: 'left',
          grid: { color: this.colors.gridLine, drawBorder: false },
          ticks: { color: this.colors.warn, font: { size: 10 } },
          min: 0, max: 5,
          title: { display: true, text: 'NTU', color: this.colors.warn, font: { size: 10 } },
        },
        ypH: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { color: this.colors.indigo, font: { size: 10 } },
          min: 5.5, max: 9.5,
          title: { display: true, text: 'pH', color: this.colors.indigo, font: { size: 10 } },
        },
      },
    });
  }


  /* =======================================================================
   * PHIAK CHARTS
   * ======================================================================= */

  /**
   * PHIAK — ED & ICU Occupancy (stacked area)
   */
  initPHIAKPrimary(history) {
    const labels = history.map(d => this._timeLabel(d.timestamp));
    return this._getOrCreate('chart-phiak-primary', 'line', {
      labels,
      datasets: [
        {
          label: 'ED Occupancy %',
          data: history.map(d => d.edOccupancy),
          borderColor: this.colors.phiak,
          backgroundColor: this._alpha(this.colors.phiak, 0.15),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'ICU Occupancy %',
          data: history.map(d => d.icuOccupancy),
          borderColor: this.colors.alert,
          backgroundColor: this._alpha(this.colors.alert, 0.1),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        }
      ]
    }, this._baseOptions({ showLegend: true, yMin: 30, yMax: 110 }));
  }

  /**
   * PHIAK — Syndromic Surveillance (ILI, Respiratory, GI signals)
   *
   * EDUCATIONAL TIP — Threshold Lines:
   *   We add an "annotation" dataset as a flat line at the EARS-C2
   *   threshold (3.0). This helps operators instantly see which signals
   *   are above the outbreak threshold.
   */
  initPHIAKSecondary(history) {
    const labels = history.map(d => this._timeLabel(d.timestamp));
    const thresholdData = new Array(history.length).fill(3.0);

    return this._getOrCreate('chart-phiak-secondary', 'line', {
      labels,
      datasets: [
        {
          label: 'ILI Signal',
          data: history.map(d => d.iliSignal),
          borderColor: this.colors.alert,
          backgroundColor: this._alpha(this.colors.alert, 0.1),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'Respiratory',
          data: history.map(d => d.respSignal),
          borderColor: this.colors.warn,
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'GI',
          data: history.map(d => d.giSignal),
          borderColor: this.colors.ok,
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'EARS-C2 Threshold',
          data: thresholdData,
          borderColor: this.colors.textDim,
          borderDash: [6, 4],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        }
      ]
    }, this._baseOptions({ showLegend: true, yMin: 0, yMax: 8 }));
  }


  /* =======================================================================
   * LOE COMPOSITE CHART (Radar)
   * ======================================================================= */

  /**
   * LOE — Radar chart for cross-domain benchmark scoring.
   *
   * EDUCATIONAL TIP — Radar Charts:
   *   Radar (spider) charts are ideal for comparing multiple metrics on a
   *   common scale. Each axis represents one metric, and the filled polygon
   *   gives an intuitive "shape" of system performance.
   *   Caution: radar charts can mislead if metrics aren't comparable.
   */
  initLOERadar() {
    return this._getOrCreate('chart-loe-radar', 'radar', {
      labels: ['MTTD', 'FPR (inv)', 'Actionability', 'Cross-Domain', 'Latency Red.', 'Rec. Accept', 'Escalation'],
      datasets: [
        {
          label: 'LOE 1 — Autonomous Monitoring',
          data: [91.2, 96.6, 88.7, 82.1, 0, 0, 0],
          borderColor: this.colors.woik,
          backgroundColor: this._alpha(this.colors.woik, 0.15),
          borderWidth: 2,
          pointBackgroundColor: this.colors.woik,
          pointRadius: 3,
        },
        {
          label: 'LOE 2 — Human-Machine Teaming',
          data: [0, 0, 0, 0, 87.6, 73.2, 92.6],
          borderColor: this.colors.phiak,
          backgroundColor: this._alpha(this.colors.phiak, 0.15),
          borderWidth: 2,
          pointBackgroundColor: this.colors.phiak,
          pointRadius: 3,
        }
      ]
    }, {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: this.colors.textDim, font: { size: 11 }, padding: 12 },
        },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#e5e7eb',
          bodyColor: '#9ca3af',
        },
      },
      scales: {
        r: {
          grid: { color: this.colors.gridLine },
          angleLines: { color: this.colors.gridLine },
          pointLabels: { color: this.colors.textDim, font: { size: 10 } },
          ticks: { color: this.colors.textDim, backdropColor: 'transparent', font: { size: 9 } },
          min: 0,
          max: 100,
        }
      }
    });
  }


  /* =======================================================================
   * FORECAST CHART (Line with projection zone)
   * ======================================================================= */

  /**
   * Forecast chart showing historical data + projected trend + confidence band.
   *
   * EDUCATIONAL TIP — Confidence Bands:
   *   The shaded "confidence interval" around the forecast line shows the
   *   uncertainty range. Wider bands = more uncertainty. In real forecasting
   *   (Prophet, ARIMA), these bands come from the model's prediction intervals.
   *   Here we synthesize them for demonstration purposes.
   */
  initForecastChart(historicalLabels, historicalData, forecastLabels, forecastData, upperBound, lowerBound) {
    const allLabels = [...historicalLabels, ...forecastLabels];
    const nullPad = new Array(historicalLabels.length).fill(null);

    return this._getOrCreate('chart-forecast', 'line', {
      labels: allLabels,
      datasets: [
        {
          label: 'Historical (ARES-E Score)',
          data: [...historicalData, ...new Array(forecastLabels.length).fill(null)],
          borderColor: this.colors.indigo,
          backgroundColor: this._alpha(this.colors.indigo, 0.1),
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          pointBackgroundColor: this.colors.indigo,
        },
        {
          label: 'Forecast',
          data: [...nullPad, ...forecastData],
          borderColor: this.colors.ewis,
          borderDash: [6, 4],
          backgroundColor: 'transparent',
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          pointBackgroundColor: this.colors.ewis,
        },
        {
          label: 'Upper Bound (95%)',
          data: [...nullPad, ...upperBound],
          borderColor: 'transparent',
          backgroundColor: this._alpha(this.colors.ewis, 0.08),
          fill: '+1',
          tension: 0.3,
          borderWidth: 0,
          pointRadius: 0,
        },
        {
          label: 'Lower Bound (95%)',
          data: [...nullPad, ...lowerBound],
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.3,
          borderWidth: 0,
          pointRadius: 0,
        },
      ]
    }, {
      ...this._baseOptions({ showLegend: true, yMin: 50, yMax: 100 }),
    });
  }


  /* =======================================================================
   * UNIVERSAL UPDATE METHOD
   * =======================================================================
   * Push new data points to an existing chart's datasets and refresh.
   *
   * @param {string} chartId   — Canvas element ID
   * @param {string} label     — New x-axis label (e.g., timestamp string)
   * @param {Array<number>} values — Array of values, one per dataset
   * @param {number} maxPoints — Max points to keep in the chart window
   *
   * EDUCATIONAL TIP — Chart.js update modes:
   *   chart.update('none')  — No animation (best for streaming)
   *   chart.update('active') — Animate only the changed data
   *   chart.update()         — Full animation (can be janky at high frequency)
   * ----------------------------------------------------------------------- */
  pushData(chartId, label, values, maxPoints = 60) {
    const chart = this.charts[chartId];
    if (!chart) return;

    chart.data.labels.push(label);
    if (chart.data.labels.length > maxPoints) {
      chart.data.labels.shift();
    }

    chart.data.datasets.forEach((dataset, i) => {
      if (values[i] !== undefined) {
        dataset.data.push(values[i]);
        if (dataset.data.length > maxPoints) {
          dataset.data.shift();
        }
      }
    });

    chart.update('none');
  }


  /* -----------------------------------------------------------------------
   * DESTROY ALL CHARTS
   * -----------------------------------------------------------------------
   * Clean up all chart instances. Important if the dashboard is
   * re-initialized (e.g., SPA navigation or hot-reload during development).
   * ----------------------------------------------------------------------- */
  destroyAll() {
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
  }
}


/* -----------------------------------------------------------------------
 * MODULE EXPORT
 * ----------------------------------------------------------------------- */
window.ChartManager = ChartManager;
