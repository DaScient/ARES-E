/* ==========================================================================
 * ARES-E Synthetic Data Engine
 * ==========================================================================
 *
 * PURPOSE:
 *   Generates realistic, time-series telemetry data for all three ARES-E
 *   modules (EWIS, WOIK, PHIAK) without requiring any real data sources.
 *   The data mimics real-world patterns including:
 *
 *     - Diurnal cycles     (day/night variation in energy load, ED visits)
 *     - Seasonal trends    (winter heating loads, summer ILI dips)
 *     - Noise & jitter     (Gaussian noise on all sensor readings)
 *     - Anomaly injection  (random events: grid faults, pipe bursts, surges)
 *     - Correlated metrics (PUE rises when ambient temp rises)
 *
 * EDUCATIONAL NOTES:
 *   This module demonstrates several important data engineering concepts:
 *
 *   1. SEEDED RANDOMNESS — We use a seedable PRNG (Mulberry32) so that
 *      synthetic data is reproducible across sessions when desired.
 *
 *   2. SIGNAL COMPOSITION — Real telemetry is a sum of deterministic
 *      components (trend, seasonality) + stochastic noise. We build
 *      each signal from these layers, which mirrors how time-series
 *      decomposition (STL, Prophet) models real data.
 *
 *   3. ANOMALY INJECTION — Anomalies are modeled as transient step/spike
 *      functions overlaid on the base signal. This mimics how fault
 *      detection systems see real-world events.
 *
 * ARCHITECTURE:
 *   SyntheticDataEngine (class)
 *     ├── PRNG core (mulberry32)
 *     ├── Signal generators (sine, noise, step, spike)
 *     ├── EWIS data generator
 *     ├── WOIK data generator
 *     ├── PHIAK data generator
 *     └── Anomaly scheduler
 *
 * USAGE:
 *   const engine = new SyntheticDataEngine({ seed: 42 });
 *   const ewisPoint = engine.generateEWIS(timestamp);
 *   const woikPoint = engine.generateWOIK(timestamp);
 *   const phiakPoint = engine.generatePHIAK(timestamp);
 *
 * ========================================================================== */

class SyntheticDataEngine {

  /* -----------------------------------------------------------------------
   * CONSTRUCTOR
   * -----------------------------------------------------------------------
   * Accepts an optional configuration object. Key options:
   *   seed (number)       — PRNG seed for reproducibility. Default: Date.now()
   *   anomalyRate (float) — Probability of an anomaly per tick (0-1). Default: 0.02
   *   noiseScale (float)  — Global multiplier on noise amplitude. Default: 1.0
   * ----------------------------------------------------------------------- */
  constructor(config = {}) {
    this.seed = config.seed ?? Date.now();
    this.anomalyRate = config.anomalyRate ?? 0.02;
    this.noiseScale = config.noiseScale ?? 1.0;

    /* Initialize the PRNG state from the seed */
    this._prngState = this.seed;

    /* Active anomaly tracking
     * Each anomaly is { module, type, startTime, duration, magnitude }
     * We track them so charts can highlight anomaly windows. */
    this.activeAnomalies = [];

    /* Historical ring buffers for each module (last N data points).
     * EDUCATIONAL TIP — Ring Buffers:
     *   A ring buffer (circular buffer) provides O(1) append and bounded
     *   memory. When the buffer is full, the oldest entry is overwritten.
     *   This is the standard approach for streaming telemetry storage. */
    this.BUFFER_SIZE = 120;  // 2 minutes at 1Hz, or 2 hours at 1/min
    this.ewisHistory  = [];
    this.woikHistory  = [];
    this.phiakHistory = [];
  }


  /* -----------------------------------------------------------------------
   * PRNG — Mulberry32
   * -----------------------------------------------------------------------
   * A simple, fast 32-bit PRNG. Produces values in [0, 1).
   *
   * EDUCATIONAL TIP — Why not Math.random()?
   *   Math.random() is not seedable. For reproducible synthetic data
   *   (e.g., for testing or demos), we need a deterministic PRNG.
   *   Mulberry32 is lightweight and has good statistical properties
   *   for non-cryptographic use. Never use it for security purposes.
   *
   * Reference: https://gist.github.com/tommyettinger/46a874533244883189143505d203312c
   * ----------------------------------------------------------------------- */
  _mulberry32() {
    this._prngState |= 0;
    this._prngState = (this._prngState + 0x6D2B79F5) | 0;
    let t = Math.imul(this._prngState ^ (this._prngState >>> 15), 1 | this._prngState);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /* Convenience: random float in [min, max) */
  _rand(min = 0, max = 1) {
    return min + this._mulberry32() * (max - min);
  }

  /* Convenience: random integer in [min, max] inclusive */
  _randInt(min, max) {
    return Math.floor(this._rand(min, max + 1));
  }

  /* -----------------------------------------------------------------------
   * GAUSSIAN NOISE (Box-Muller Transform)
   * -----------------------------------------------------------------------
   * Generates normally-distributed random values with given mean and stddev.
   *
   * EDUCATIONAL TIP — Box-Muller Transform:
   *   Converts two uniform random numbers into two independent standard
   *   normal random variables. This is the classic technique for generating
   *   Gaussian noise from a uniform PRNG. The formula:
   *     z = sqrt(-2 * ln(u1)) * cos(2π * u2)
   *   produces z ~ N(0, 1). Then scale: result = mean + z * stddev.
   *
   * Reference: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
   * ----------------------------------------------------------------------- */
  _gaussian(mean = 0, stddev = 1) {
    const u1 = this._mulberry32() || 1e-10;  // Avoid log(0)
    const u2 = this._mulberry32();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * stddev;
  }


  /* -----------------------------------------------------------------------
   * SIGNAL PRIMITIVES
   * -----------------------------------------------------------------------
   * Building blocks for composing realistic time-series signals.
   * Real sensor data ≈ trend + seasonality + noise + anomalies.
   * ----------------------------------------------------------------------- */

  /**
   * Diurnal (24-hour) sine wave.
   * @param {number} t       — Timestamp in milliseconds
   * @param {number} amplitude — Peak deviation from 0
   * @param {number} phaseHours — Hour of day for the peak (e.g., 14 = 2 PM)
   * @returns {number} Value in [-amplitude, +amplitude]
   *
   * EDUCATIONAL TIP — Sine Waves for Periodicity:
   *   Many real-world signals (temperature, energy demand, traffic) follow
   *   roughly sinusoidal daily patterns. This is the simplest way to model
   *   the "diurnal cycle" component of a time series.
   */
  _diurnal(t, amplitude = 1, phaseHours = 14) {
    const hoursInDay = 24;
    const hourOfDay = (t / 3600000) % hoursInDay;
    return amplitude * Math.sin(((hourOfDay - phaseHours) / hoursInDay) * 2 * Math.PI);
  }

  /**
   * Weekly cycle (7-day periodicity).
   * Some metrics vary by day of week (e.g., lower ED visits on weekdays).
   */
  _weekly(t, amplitude = 1, phaseDays = 2) {
    const daysInWeek = 7;
    const dayOfWeek = (t / 86400000) % daysInWeek;
    return amplitude * Math.sin(((dayOfWeek - phaseDays) / daysInWeek) * 2 * Math.PI);
  }

  /**
   * Clamp a value within [min, max].
   * Prevents generated data from producing physically impossible values
   * (e.g., negative pressure, PUE below 1.0).
   */
  _clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }


  /* -----------------------------------------------------------------------
   * ANOMALY SCHEDULER
   * -----------------------------------------------------------------------
   * Randomly injects anomaly events based on the configured anomalyRate.
   * Active anomalies modify the output of the signal generators.
   *
   * EDUCATIONAL TIP — Event-Driven Anomalies:
   *   Real anomaly detection systems deal with events that have a start
   *   time, duration, and magnitude. By modeling anomalies as discrete
   *   events with these properties, our synthetic data closely matches
   *   what a real detection system would see.
   * ----------------------------------------------------------------------- */
  _tickAnomalies(t) {
    /* Remove expired anomalies */
    this.activeAnomalies = this.activeAnomalies.filter(
      a => t < a.startTime + a.duration
    );

    /* Possibly inject a new anomaly */
    if (this._mulberry32() < this.anomalyRate && this.activeAnomalies.length < 3) {
      const modules = ['EWIS', 'WOIK', 'PHIAK'];
      const module = modules[this._randInt(0, 2)];

      const anomalyTypes = {
        EWIS:  ['GRID_FAULT', 'PUE_SPIKE', 'THERMAL_THROTTLE', 'UPS_DRAIN'],
        WOIK:  ['PRESSURE_DROP', 'TURBIDITY_SPIKE', 'SCADA_TIMEOUT', 'PUMP_FAULT'],
        PHIAK: ['ED_SURGE', 'ICU_CAPACITY', 'ILI_OUTBREAK', 'VENT_SHORTAGE']
      };

      const type = anomalyTypes[module][this._randInt(0, 3)];

      this.activeAnomalies.push({
        module,
        type,
        startTime: t,
        duration: this._rand(5000, 30000),   // 5–30 seconds in dashboard time
        magnitude: this._rand(0.3, 1.0),
        id: `ANM-${Date.now().toString(36).toUpperCase()}`
      });
    }
  }

  /**
   * Check if a specific module currently has an active anomaly.
   * @returns {object|null} The active anomaly, or null.
   */
  getActiveAnomaly(module) {
    return this.activeAnomalies.find(a => a.module === module) || null;
  }


  /* -----------------------------------------------------------------------
   * EWIS DATA GENERATOR
   * -----------------------------------------------------------------------
   * Generates one telemetry point for the Energy/Weather module.
   *
   * Metrics generated:
   *   pue           — Power Usage Effectiveness (1.0 = perfect, typical: 1.1–1.6)
   *   energyPerToken — Wh consumed per AI inference token
   *   gridStability  — Grid stability index (%)
   *   gpuUtil        — GPU utilization (%)
   *   ambientTemp    — Ambient temperature (°C)
   *   coolingKW      — Cooling power draw (kW)
   *   renewableMix   — Percentage of power from renewables
   *   upsCharge      — UPS battery charge level (%)
   *   gridVoltage    — Grid voltage (V)
   *   gridFrequency  — Grid frequency (Hz)
   *
   * Signal composition:
   *   PUE = base + diurnal(temperature correlation) + noise + anomaly
   *   GPU = base + workload_pattern + noise
   *   etc.
   * ----------------------------------------------------------------------- */
  generateEWIS(t) {
    const anomaly = this.getActiveAnomaly('EWIS');
    const am = anomaly ? anomaly.magnitude : 0;

    /* Ambient temperature: base 25°C, peaks in afternoon, ±5°C swing */
    const ambientTemp = this._clamp(
      25 + this._diurnal(t, 5, 15) + this._gaussian(0, 0.5 * this.noiseScale),
      10, 45
    );

    /* PUE: base 1.15, rises with temperature, anomaly spikes it
     * EDUCATIONAL: PUE is IT load / total facility power. Real data centers
     * target PUE < 1.2. Values > 1.5 indicate cooling inefficiency. */
    const pueBase = 1.15;
    const pueThermal = Math.max(0, (ambientTemp - 25) * 0.015);
    const pueAnomaly = (anomaly?.type === 'PUE_SPIKE') ? am * 0.3 : 0;
    const pue = this._clamp(
      pueBase + pueThermal + pueAnomaly + this._gaussian(0, 0.008 * this.noiseScale),
      1.02, 2.0
    );

    /* GPU utilization: higher during work hours (diurnal pattern) */
    const gpuBase = 75;
    const gpuDiurnal = this._diurnal(t, 12, 14);  // Peak at 2 PM
    const gpuUtil = this._clamp(
      gpuBase + gpuDiurnal + this._gaussian(0, 3 * this.noiseScale),
      15, 99
    );

    /* Grid stability: normally ~94%, drops during faults */
    const gridFault = (anomaly?.type === 'GRID_FAULT') ? am * 20 : 0;
    const gridStability = this._clamp(
      94.2 - gridFault + this._gaussian(0, 0.8 * this.noiseScale),
      60, 99.9
    );

    /* Energy per token: inversely related to GPU efficiency */
    const energyPerToken = this._clamp(
      0.004 + (1 - gpuUtil / 100) * 0.002 + this._gaussian(0, 0.0003 * this.noiseScale),
      0.001, 0.02
    );

    /* UPS charge: drains during anomalies */
    const upsDrain = (anomaly?.type === 'UPS_DRAIN') ? am * 40 : 0;
    const upsCharge = this._clamp(
      100 - upsDrain + this._gaussian(0, 0.5 * this.noiseScale),
      5, 100
    );

    /* Cooling power: correlated with ambient temp and PUE */
    const coolingKW = this._clamp(
      120 + (ambientTemp - 20) * 8 + (pue - 1.1) * 200 + this._gaussian(0, 5 * this.noiseScale),
      40, 800
    );

    /* Renewable mix: higher during midday (solar), lower at night */
    const solarContrib = this._clamp(this._diurnal(t, 25, 12), 0, 25);
    const renewableMix = this._clamp(
      34 + solarContrib + this._gaussian(0, 2 * this.noiseScale),
      8, 70
    );

    /* Grid voltage and frequency: nominal with occasional sag */
    const voltSag = (anomaly?.type === 'GRID_FAULT') ? am * 60 : 0;
    const gridVoltage = this._clamp(
      240 - voltSag + this._gaussian(0, 1 * this.noiseScale),
      140, 250
    );
    const gridFrequency = this._clamp(
      60 - (anomaly?.type === 'GRID_FAULT' ? am * 1.5 : 0) + this._gaussian(0, 0.05),
      57, 61
    );

    const point = {
      timestamp: t,
      pue: Math.round(pue * 1000) / 1000,
      energyPerToken: Math.round(energyPerToken * 10000) / 10000,
      gridStability: Math.round(gridStability * 10) / 10,
      gpuUtil: Math.round(gpuUtil * 10) / 10,
      ambientTemp: Math.round(ambientTemp * 10) / 10,
      coolingKW: Math.round(coolingKW),
      renewableMix: Math.round(renewableMix * 10) / 10,
      upsCharge: Math.round(upsCharge * 10) / 10,
      gridVoltage: Math.round(gridVoltage * 10) / 10,
      gridFrequency: Math.round(gridFrequency * 100) / 100,
      anomaly: anomaly ? { type: anomaly.type, magnitude: am } : null
    };

    /* Push to ring buffer */
    this.ewisHistory.push(point);
    if (this.ewisHistory.length > this.BUFFER_SIZE) this.ewisHistory.shift();

    return point;
  }


  /* -----------------------------------------------------------------------
   * WOIK DATA GENERATOR
   * -----------------------------------------------------------------------
   * Generates one telemetry point for the Water Operations module.
   *
   * Metrics:
   *   pressurePSI    — Network water pressure (PSI)
   *   flowRateGPM    — Flow rate (gallons per minute)
   *   turbidityNTU   — Turbidity (Nephelometric Turbidity Units)
   *   pH             — Water pH level
   *   chlorineMgL    — Free chlorine residual (mg/L)
   *   tankLevelPct   — Reservoir tank level (%)
   *   pumpStatus     — Pump operational status
   *   scadaUptime    — SCADA system uptime (%)
   *   nrwPct         — Non-Revenue Water loss (%)
   *   pumpEnergy     — Pump specific energy (kWh/m³)
   * ----------------------------------------------------------------------- */
  generateWOIK(t) {
    const anomaly = this.getActiveAnomaly('WOIK');
    const am = anomaly ? anomaly.magnitude : 0;

    /* Pressure: diurnal demand pattern (lower during peak use hours)
     * EDUCATIONAL: Water pressure follows inverse demand — high demand
     * at 7 AM (showers) and 6 PM (dinner) causes pressure drops. */
    const demandDrop = this._diurnal(t, 8, 7) + this._diurnal(t, 5, 18);
    const burstDrop = (anomaly?.type === 'PRESSURE_DROP') ? am * 28 : 0;
    const pressurePSI = this._clamp(
      65 - demandDrop - burstDrop + this._gaussian(0, 1.5 * this.noiseScale),
      20, 85
    );

    /* Flow rate: correlated with pressure and demand */
    const flowRateGPM = this._clamp(
      850 + this._diurnal(t, 200, 14) + (burstDrop > 0 ? am * 400 : 0) +
        this._gaussian(0, 30 * this.noiseScale),
      300, 2000
    );

    /* Turbidity: normally very low, spikes during contamination events
     * EDUCATIONAL: Turbidity > 1.0 NTU triggers regulatory alerts in
     * drinking water systems. Real treatment plants monitor continuously. */
    const turbiditySpike = (anomaly?.type === 'TURBIDITY_SPIKE') ? am * 4.5 : 0;
    const turbidityNTU = this._clamp(
      0.18 + turbiditySpike + Math.abs(this._gaussian(0, 0.02 * this.noiseScale)),
      0.01, 10.0
    );

    /* pH: normally stable around 7.4, shifts during contamination */
    const phShift = (anomaly?.type === 'TURBIDITY_SPIKE') ? -am * 1.3 : 0;
    const pH = this._clamp(
      7.4 + phShift + this._gaussian(0, 0.05 * this.noiseScale),
      5.5, 9.5
    );

    /* Chlorine residual: maintained by dosing system */
    const chlorineMgL = this._clamp(
      0.6 + this._gaussian(0, 0.03 * this.noiseScale),
      0.1, 4.0
    );

    /* Tank level: slow daily cycle (fills at night, draws during day) */
    const tankLevelPct = this._clamp(
      72 + this._diurnal(t, 12, 4) + this._gaussian(0, 1.5 * this.noiseScale),
      15, 100
    );

    /* SCADA uptime: normally 99.97%, drops during timeout events */
    const scadaTimeout = (anomaly?.type === 'SCADA_TIMEOUT') ? am * 15 : 0;
    const scadaUptime = this._clamp(
      99.97 - scadaTimeout + this._gaussian(0, 0.005 * this.noiseScale),
      80, 100
    );

    /* Pump status: normally ON, faults cause issues */
    const pumpFault = anomaly?.type === 'PUMP_FAULT';
    const pumpStatus = pumpFault ? 'FAULT' : 'ON';

    /* Non-revenue water: stable around 8.2% */
    const nrwPct = this._clamp(
      8.2 + (burstDrop > 0 ? am * 5 : 0) + this._gaussian(0, 0.3 * this.noiseScale),
      2, 25
    );

    /* Pump specific energy */
    const pumpEnergy = this._clamp(
      0.8 + (pumpFault ? am * 0.4 : 0) + this._gaussian(0, 0.02 * this.noiseScale),
      0.3, 2.0
    );

    const point = {
      timestamp: t,
      pressurePSI: Math.round(pressurePSI * 10) / 10,
      flowRateGPM: Math.round(flowRateGPM),
      turbidityNTU: Math.round(turbidityNTU * 100) / 100,
      pH: Math.round(pH * 100) / 100,
      chlorineMgL: Math.round(chlorineMgL * 100) / 100,
      tankLevelPct: Math.round(tankLevelPct * 10) / 10,
      pumpStatus,
      scadaUptime: Math.round(scadaUptime * 100) / 100,
      nrwPct: Math.round(nrwPct * 10) / 10,
      pumpEnergy: Math.round(pumpEnergy * 100) / 100,
      anomaly: anomaly ? { type: anomaly.type, magnitude: am } : null
    };

    this.woikHistory.push(point);
    if (this.woikHistory.length > this.BUFFER_SIZE) this.woikHistory.shift();

    return point;
  }


  /* -----------------------------------------------------------------------
   * PHIAK DATA GENERATOR
   * -----------------------------------------------------------------------
   * Generates one telemetry point for the Public Health Infrastructure module.
   * All values are population-level aggregates — zero individual data.
   *
   * EDUCATIONAL TIP — Privacy by Design:
   *   PHIAK never generates or stores individual patient data. Even in
   *   synthetic data, we model only facility-level aggregates. This aligns
   *   with HIPAA Safe Harbor and NIST SP 800-188 de-identification standards.
   *
   * Metrics:
   *   edOccupancy     — Emergency Dept occupancy (%)
   *   icuOccupancy    — ICU occupancy (%)
   *   ventAvailable   — Ventilator spare capacity (%)
   *   boardingHours   — Avg ED boarding time (hours)
   *   iliSignal       — ILI (Influenza-Like Illness) surveillance signal (%)
   *   respSignal      — Respiratory syndrome signal (%)
   *   giSignal        — Gastrointestinal signal (%)
   *   surgeLevel      — Surge protocol activation level
   *   doorToProvider  — Door-to-provider time (minutes)
   *   hcwAvailability — Healthcare worker availability index (%)
   * ----------------------------------------------------------------------- */
  generatePHIAK(t) {
    const anomaly = this.getActiveAnomaly('PHIAK');
    const am = anomaly ? anomaly.magnitude : 0;

    /* ED occupancy: diurnal pattern (peaks late afternoon/evening) */
    const edSurge = (anomaly?.type === 'ED_SURGE') ? am * 18 : 0;
    const edOccupancy = this._clamp(
      78 + this._diurnal(t, 8, 17) + edSurge +
        this._weekly(t, 3, 0) + this._gaussian(0, 2 * this.noiseScale),
      40, 110   // >100% = boarding overflow
    );

    /* ICU occupancy: more stable, affected by surge events */
    const icuSurge = (anomaly?.type === 'ICU_CAPACITY') ? am * 20 : 0;
    const icuOccupancy = this._clamp(
      74 + icuSurge + this._gaussian(0, 2 * this.noiseScale),
      30, 102
    );

    /* Ventilator availability: inverse of ICU load */
    const ventShortage = (anomaly?.type === 'VENT_SHORTAGE') ? am * 20 : 0;
    const ventAvailable = this._clamp(
      31 - ventShortage - (icuOccupancy - 74) * 0.3 + this._gaussian(0, 1.5 * this.noiseScale),
      0, 60
    );

    /* Boarding hours: rises as ED fills up
     * EDUCATIONAL: "Boarding" is when admitted patients wait in the ED for
     * an inpatient bed. It's a key quality metric — longer boarding times
     * correlate with worse patient outcomes and ED overcrowding. */
    const boardingHours = this._clamp(
      3.2 + (edOccupancy - 80) * 0.1 + this._gaussian(0, 0.3 * this.noiseScale),
      0.5, 12
    );

    /* Syndromic surveillance signals
     * EDUCATIONAL: The EARS-C2 algorithm (Early Aberration Reporting System)
     * uses a 7-day rolling baseline to detect statistically significant
     * increases in syndrome counts. A C2 score > 3.0 triggers an alert. */
    const iliBase = 3.2;  // Currently elevated per the scenario
    const iliOutbreak = (anomaly?.type === 'ILI_OUTBREAK') ? am * 2.5 : 0;
    const iliSignal = this._clamp(
      iliBase + iliOutbreak + this._gaussian(0, 0.15 * this.noiseScale),
      0.5, 12
    );

    const respSignal = this._clamp(
      4.7 + this._gaussian(0, 0.2 * this.noiseScale),
      1, 15
    );

    const giSignal = this._clamp(
      1.1 + this._gaussian(0, 0.08 * this.noiseScale),
      0.2, 5
    );

    /* Surge level: derived from occupancy thresholds */
    let surgeLevel = 'GREEN';
    if (edOccupancy > 95 || icuOccupancy > 90) surgeLevel = 'RED';
    else if (edOccupancy > 85 || icuOccupancy > 80) surgeLevel = 'YELLOW';

    /* Door-to-provider time: rises with ED congestion */
    const doorToProvider = this._clamp(
      23 + (edOccupancy - 75) * 0.5 + this._gaussian(0, 2 * this.noiseScale),
      8, 90
    );

    /* HCW availability: drops during surge events */
    const hcwAvailability = this._clamp(
      92 - (edSurge > 0 ? am * 15 : 0) + this._gaussian(0, 1.5 * this.noiseScale),
      50, 100
    );

    const point = {
      timestamp: t,
      edOccupancy: Math.round(edOccupancy * 10) / 10,
      icuOccupancy: Math.round(icuOccupancy * 10) / 10,
      ventAvailable: Math.round(ventAvailable * 10) / 10,
      boardingHours: Math.round(boardingHours * 10) / 10,
      iliSignal: Math.round(iliSignal * 100) / 100,
      respSignal: Math.round(respSignal * 100) / 100,
      giSignal: Math.round(giSignal * 100) / 100,
      surgeLevel,
      doorToProvider: Math.round(doorToProvider),
      hcwAvailability: Math.round(hcwAvailability * 10) / 10,
      anomaly: anomaly ? { type: anomaly.type, magnitude: am } : null
    };

    this.phiakHistory.push(point);
    if (this.phiakHistory.length > this.BUFFER_SIZE) this.phiakHistory.shift();

    return point;
  }


  /* -----------------------------------------------------------------------
   * MASTER TICK
   * -----------------------------------------------------------------------
   * Call this every update interval to generate one data point for all
   * modules simultaneously and manage the anomaly lifecycle.
   *
   * @param {number} t — Current timestamp (ms). Defaults to Date.now().
   * @returns {object} { ewis, woik, phiak, anomalies }
   * ----------------------------------------------------------------------- */
  tick(t = Date.now()) {
    this._tickAnomalies(t);

    return {
      ewis: this.generateEWIS(t),
      woik: this.generateWOIK(t),
      phiak: this.generatePHIAK(t),
      anomalies: [...this.activeAnomalies]
    };
  }


  /* -----------------------------------------------------------------------
   * HISTORICAL BACKFILL
   * -----------------------------------------------------------------------
   * Generates `count` historical data points stepping backwards from `endTime`.
   * Useful for populating charts on initial load.
   *
   * @param {number} count    — Number of points to generate
   * @param {number} stepMs   — Time between points (ms). Default: 1000 (1s)
   * @param {number} endTime  — End timestamp (ms). Default: Date.now()
   * @returns {object} { ewis: [], woik: [], phiak: [] }
   *
   * EDUCATIONAL TIP — Backfill patterns:
   *   Real dashboards often need to render 2–24 hours of history on load.
   *   Backfill generates that data synthetically so the charts aren't empty
   *   when the user first opens the page.
   * ----------------------------------------------------------------------- */
  backfill(count = 60, stepMs = 2000, endTime = Date.now()) {
    /* Save current state so backfill doesn't pollute the live buffers */
    const savedEwis = [...this.ewisHistory];
    const savedWoik = [...this.woikHistory];
    const savedPhiak = [...this.phiakHistory];
    const savedAnomalies = [...this.activeAnomalies];

    this.ewisHistory = [];
    this.woikHistory = [];
    this.phiakHistory = [];
    this.activeAnomalies = [];

    const startTime = endTime - (count * stepMs);
    for (let i = 0; i < count; i++) {
      this.tick(startTime + i * stepMs);
    }

    const result = {
      ewis: [...this.ewisHistory],
      woik: [...this.woikHistory],
      phiak: [...this.phiakHistory]
    };

    /* Restore original state + append backfill data */
    this.ewisHistory = [...result.ewis, ...savedEwis].slice(-this.BUFFER_SIZE);
    this.woikHistory = [...result.woik, ...savedWoik].slice(-this.BUFFER_SIZE);
    this.phiakHistory = [...result.phiak, ...savedPhiak].slice(-this.BUFFER_SIZE);
    this.activeAnomalies = savedAnomalies;

    return result;
  }
}


/* -----------------------------------------------------------------------
 * MODULE EXPORT
 * -----------------------------------------------------------------------
 * We attach to `window` for vanilla JS usage (GitHub Pages / no bundler).
 * In a Node.js/bundler environment, you'd instead use:
 *   export default SyntheticDataEngine;
 * ----------------------------------------------------------------------- */
window.SyntheticDataEngine = SyntheticDataEngine;
