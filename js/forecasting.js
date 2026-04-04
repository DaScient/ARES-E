/* ==========================================================================
 * ARES-E Forecasting Engine
 * ==========================================================================
 *
 * PURPOSE:
 *   Implements lightweight forecasting models for the ARES-E dashboard.
 *   Generates trend projections and confidence intervals for key metrics
 *   across all three modules.
 *
 * EDUCATIONAL NOTES:
 *
 *   TIME SERIES FORECASTING — A Quick Primer:
 *   Real-world forecasting uses techniques like:
 *     - ARIMA (Auto-Regressive Integrated Moving Average)
 *     - Prophet (Facebook/Meta's additive decomposition model)
 *     - Exponential Smoothing (Holt-Winters)
 *     - LSTM (Long Short-Term Memory neural networks)
 *
 *   For a browser-based dashboard without heavy ML libraries, we implement:
 *     1. LINEAR REGRESSION — Simple trend extraction (y = mx + b)
 *     2. EXPONENTIAL MOVING AVERAGE (EMA) — Smoothing with recency bias
 *     3. SIMPLE MOVING AVERAGE (SMA) — Baseline smoothing
 *     4. CONFIDENCE BANDS — Gaussian uncertainty estimates
 *
 *   These are practical, interpretable, and computationally cheap. In a
 *   production ARES-E deployment, you'd connect to a forecasting service
 *   (e.g., Amazon Forecast, Azure ML) for more sophisticated models.
 *
 *   LINEAR REGRESSION MATH:
 *   Given n data points (x_i, y_i), the least-squares fit is:
 *     slope m = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
 *     intercept b = (Σy - m·Σx) / n
 *   This is the "normal equation" — analytically optimal for linear models.
 *
 * ========================================================================== */

class ForecastEngine {

  constructor() {
    /* No configuration needed — stateless utility class
     * EDUCATIONAL TIP: Stateless classes are easy to test and reason about.
     * Each method takes input and returns output with no side effects. */
  }


  /* -----------------------------------------------------------------------
   * SIMPLE MOVING AVERAGE (SMA)
   * -----------------------------------------------------------------------
   * Computes the simple moving average with a given window size.
   *
   * @param {Array<number>} data   — Input time series
   * @param {number} window        — Window size (e.g., 5)
   * @returns {Array<number>}      — SMA values (first `window-1` are NaN)
   *
   * EDUCATIONAL TIP — SMA vs EMA:
   *   SMA treats all points in the window equally. EMA gives exponentially
   *   more weight to recent points. SMA is better for detecting level shifts;
   *   EMA is better for detecting trend changes.
   *
   * Formula: SMA_t = (1/w) · Σ(y_{t-w+1} ... y_t)
   * ----------------------------------------------------------------------- */
  sma(data, window = 5) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(NaN);
      } else {
        let sum = 0;
        for (let j = i - window + 1; j <= i; j++) {
          sum += data[j];
        }
        result.push(sum / window);
      }
    }
    return result;
  }


  /* -----------------------------------------------------------------------
   * EXPONENTIAL MOVING AVERAGE (EMA)
   * -----------------------------------------------------------------------
   * @param {Array<number>} data   — Input time series
   * @param {number} alpha         — Smoothing factor (0 < α < 1). Default: 0.3
   * @returns {Array<number>}      — EMA values
   *
   * EDUCATIONAL TIP — Choosing Alpha:
   *   α close to 1 → very responsive, follows data closely (more noise)
   *   α close to 0 → very smooth, slow to react (more lag)
   *   A common choice: α = 2/(N+1) where N is the "equivalent window size."
   *
   * Formula: EMA_t = α · y_t + (1-α) · EMA_{t-1}
   * ----------------------------------------------------------------------- */
  ema(data, alpha = 0.3) {
    if (data.length === 0) return [];
    const result = [data[0]];  // Seed with first value
    for (let i = 1; i < data.length; i++) {
      result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
    }
    return result;
  }


  /* -----------------------------------------------------------------------
   * LINEAR REGRESSION
   * -----------------------------------------------------------------------
   * Fits a line y = mx + b to the data using ordinary least squares (OLS).
   *
   * @param {Array<number>} data — Y-values (x is assumed to be 0, 1, 2, ...)
   * @returns {{ slope: number, intercept: number, r2: number }}
   *
   * EDUCATIONAL TIP — R² (Coefficient of Determination):
   *   R² measures how much of the variance in y is explained by the linear
   *   model. R² = 1 means perfect fit; R² = 0 means the model explains
   *   nothing. Negative R² means the model is worse than a flat line.
   *
   * Normal equations:
   *   m = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²)
   *   b = ȳ - m·x̄
   *   R² = 1 - SS_res / SS_tot
   * ----------------------------------------------------------------------- */
  linearRegression(data) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      sumX  += i;
      sumY  += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
      sumY2 += data[i] * data[i];
    }

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    /* Calculate R² */
    const yMean = sumY / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * i + intercept;
      ssTot += (data[i] - yMean) ** 2;
      ssRes += (data[i] - predicted) ** 2;
    }
    const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    return { slope, intercept, r2 };
  }


  /* -----------------------------------------------------------------------
   * STANDARD DEVIATION
   * -----------------------------------------------------------------------
   * Population standard deviation of an array of numbers.
   * Used for confidence interval calculations.
   *
   * Formula: σ = sqrt( (1/n) · Σ(x_i - μ)² )
   * ----------------------------------------------------------------------- */
  stddev(data) {
    if (data.length === 0) return 0;
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / data.length;
    return Math.sqrt(variance);
  }


  /* -----------------------------------------------------------------------
   * FORECAST — Generate Future Projections
   * -----------------------------------------------------------------------
   * Uses linear regression on recent history to project forward, with
   * expanding confidence intervals.
   *
   * @param {Array<number>} history       — Historical data points
   * @param {number} horizon              — Number of future points to forecast
   * @param {number} confidenceMultiplier — Width of confidence band (default: 1.96 = 95% CI)
   * @returns {{ forecast, upper, lower, trend }}
   *
   * EDUCATIONAL TIP — Confidence Intervals:
   *   In real forecasting, CIs come from the model's error distribution.
   *   A 95% CI means "we expect the true value to fall within this range
   *   95% of the time." The interval widens as we project further into
   *   the future because uncertainty compounds.
   *
   *   Our expanding CI formula: width = σ · z · √(t/n)
   *   where t = forecast step, n = history length, z = 1.96 for 95%.
   * ----------------------------------------------------------------------- */
  forecast(history, horizon = 12, confidenceMultiplier = 1.96) {
    const reg = this.linearRegression(history);
    const sigma = this.stddev(history);
    const n = history.length;

    const forecast = [];
    const upper = [];
    const lower = [];

    for (let t = 1; t <= horizon; t++) {
      /* Point forecast: extend the trend line */
      const point = reg.slope * (n + t - 1) + reg.intercept;

      /* Confidence interval: expands with forecast horizon
       * The sqrt(t/n) factor makes the band widen over time */
      const ciWidth = sigma * confidenceMultiplier * Math.sqrt(t / n);

      forecast.push(Math.round(point * 100) / 100);
      upper.push(Math.round((point + ciWidth) * 100) / 100);
      lower.push(Math.round((point - ciWidth) * 100) / 100);
    }

    return {
      forecast,
      upper,
      lower,
      trend: {
        slope: reg.slope,
        intercept: reg.intercept,
        r2: reg.r2,
        direction: reg.slope > 0.01 ? 'IMPROVING' : reg.slope < -0.01 ? 'DEGRADING' : 'STABLE'
      }
    };
  }


  /* -----------------------------------------------------------------------
   * GENERATE LOE FORECAST DATA
   * -----------------------------------------------------------------------
   * Creates synthetic historical + forecast data for the ARES-E composite
   * score. Used to populate the forecast chart on the dashboard.
   *
   * @returns {object} { historicalLabels, historicalData, forecastLabels,
   *                      forecastData, upperBound, lowerBound, trend }
   * ----------------------------------------------------------------------- */
  generateLOEForecast() {
    /* Generate 24 "weekly" historical composite scores
     * Simulates an ARES-E evaluation campaign over ~6 months */
    const baseDate = new Date('2025-10-01');
    const historicalLabels = [];
    const historicalData = [];

    /* Start around 78 and trend upward to ~89 (improvement trajectory) */
    for (let week = 0; week < 24; week++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + week * 7);
      historicalLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      /* Base trend + noise */
      const trend = 78 + (week / 24) * 11;
      const noise = (Math.sin(week * 0.8) * 2) + (Math.random() - 0.5) * 3;
      historicalData.push(Math.round((trend + noise) * 10) / 10);
    }

    /* Forecast next 12 weeks */
    const result = this.forecast(historicalData, 12);

    /* Generate forecast date labels */
    const forecastLabels = [];
    const lastDate = new Date(baseDate);
    lastDate.setDate(lastDate.getDate() + 24 * 7);
    for (let i = 0; i < 12; i++) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i * 7);
      forecastLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    return {
      historicalLabels,
      historicalData,
      forecastLabels,
      forecastData: result.forecast,
      upperBound: result.upper,
      lowerBound: result.lower,
      trend: result.trend,
    };
  }


  /* -----------------------------------------------------------------------
   * GENERATE MODULE FORECAST SUMMARIES
   * -----------------------------------------------------------------------
   * Produces forecasted values for key metrics across all modules.
   * Used to populate the forecast summary table on the dashboard.
   *
   * @param {object} currentData — { ewis: {...}, woik: {...}, phiak: {...} }
   * @returns {Array<object>} — Table rows for forecast display
   * ----------------------------------------------------------------------- */
  generateModuleForecasts(currentData) {
    const rows = [];

    /* EWIS — PUE forecast */
    if (currentData.ewis) {
      const pueCurrent = currentData.ewis.pue || 1.15;
      rows.push({
        module: 'EWIS',
        metric: 'PUE',
        current: pueCurrent.toFixed(3),
        forecast24h: (pueCurrent + (Math.random() - 0.5) * 0.04).toFixed(3),
        forecast7d: (pueCurrent - 0.01 + (Math.random() - 0.5) * 0.06).toFixed(3),
        trend: pueCurrent < 1.2 ? '↓ Improving' : '↑ Degrading',
        trendClass: pueCurrent < 1.2 ? 'text-ok' : 'text-warn',
      });

      /* EWIS — GPU Utilization */
      const gpuCurrent = currentData.ewis.gpuUtil || 87;
      rows.push({
        module: 'EWIS',
        metric: 'GPU Util %',
        current: gpuCurrent.toFixed(1),
        forecast24h: (gpuCurrent + (Math.random() - 0.3) * 4).toFixed(1),
        forecast7d: (gpuCurrent + (Math.random() - 0.4) * 6).toFixed(1),
        trend: '→ Stable',
        trendClass: 'text-dim',
      });
    }

    /* WOIK — Pressure */
    if (currentData.woik) {
      const pressCurrent = currentData.woik.pressurePSI || 65;
      rows.push({
        module: 'WOIK',
        metric: 'Pressure PSI',
        current: pressCurrent.toFixed(1),
        forecast24h: (pressCurrent + (Math.random() - 0.5) * 3).toFixed(1),
        forecast7d: (pressCurrent + (Math.random() - 0.5) * 5).toFixed(1),
        trend: pressCurrent >= 60 ? '→ Stable' : '↓ Low',
        trendClass: pressCurrent >= 60 ? 'text-dim' : 'text-warn',
      });

      /* WOIK — Tank Level */
      const tankCurrent = currentData.woik.tankLevelPct || 72;
      rows.push({
        module: 'WOIK',
        metric: 'Tank Level %',
        current: tankCurrent.toFixed(1),
        forecast24h: (tankCurrent + (Math.random() - 0.4) * 5).toFixed(1),
        forecast7d: (tankCurrent + 2 + (Math.random() - 0.5) * 8).toFixed(1),
        trend: '↑ Filling',
        trendClass: 'text-ok',
      });
    }

    /* PHIAK — ED Occupancy */
    if (currentData.phiak) {
      const edCurrent = currentData.phiak.edOccupancy || 82;
      rows.push({
        module: 'PHIAK',
        metric: 'ED Occ %',
        current: edCurrent.toFixed(1),
        forecast24h: (edCurrent + (Math.random() - 0.3) * 5).toFixed(1),
        forecast7d: (edCurrent + (Math.random() - 0.5) * 8).toFixed(1),
        trend: edCurrent > 85 ? '↑ Rising' : '→ Stable',
        trendClass: edCurrent > 85 ? 'text-warn' : 'text-dim',
      });

      /* PHIAK — ILI Signal */
      const iliCurrent = currentData.phiak.iliSignal || 3.2;
      rows.push({
        module: 'PHIAK',
        metric: 'ILI Signal',
        current: iliCurrent.toFixed(2),
        forecast24h: (iliCurrent + (Math.random() - 0.5) * 0.3).toFixed(2),
        forecast7d: (iliCurrent - 0.1 + (Math.random() - 0.5) * 0.5).toFixed(2),
        trend: iliCurrent > 3.0 ? '▲ ELEVATED' : '→ Baseline',
        trendClass: iliCurrent > 3.0 ? 'text-alert' : 'text-ok',
      });
    }

    return rows;
  }
}


/* -----------------------------------------------------------------------
 * MODULE EXPORT
 * ----------------------------------------------------------------------- */
window.ForecastEngine = ForecastEngine;
