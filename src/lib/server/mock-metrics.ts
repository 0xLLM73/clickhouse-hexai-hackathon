export const dataset = 'usage_signal_desk_synthetic_events';
export const defaultFrom = '2026-06-01';
export const defaultTo = '2026-06-11';

export function summaryResponse(from = defaultFrom, to = defaultTo) {
  return {
    mode: 'mock',
    dataset,
    from,
    to,
    cards: {
      activationRate: {
        label: 'Activation rate',
        value: 0.47,
        baseline: 0.72,
        deltaPct: -34.7,
        eventCount: 9240,
        status: 'warning',
      },
      activeAccounts: {
        label: 'Active accounts',
        value: 1284,
        baseline: 1240,
        deltaPct: 3.5,
        eventCount: 18420,
        status: 'neutral',
      },
      eventVolume: {
        label: 'Event volume',
        value: 18420,
        baseline: 17680,
        deltaPct: 4.2,
        eventCount: 18420,
        status: 'neutral',
      },
      latencyP95: {
        label: 'P95 latency',
        value: 1240,
        baseline: 710,
        deltaPct: 74.6,
        eventCount: 9240,
        status: 'warning',
      },
      anomalyCount: {
        label: 'Open anomalies',
        value: 1,
        baseline: 0,
        deltaPct: null,
        eventCount: 9240,
        status: 'warning',
      },
    },
    primaryAnomaly: {
      metric: 'activation',
      platform: 'mobile',
      releaseVersion: 'v2.8.0',
      country: 'US',
      summary: 'Mobile activation dropped after release v2.8.0 while latency increased.',
    },
  };
}

export function timeseriesResponse(metric = 'activation', from = defaultFrom, to = defaultTo) {
  return {
    metric,
    grain: 'day',
    from,
    to,
    baselineWindow: { from: '2026-06-01', to: '2026-06-06' },
    anomalyWindow: { from: '2026-06-07', to: '2026-06-11' },
    points: [
      { date: '2026-06-01', value: 0.73, baseline: 0.72, deltaPct: 1.4, eventCount: 1660, anomaly: false },
      { date: '2026-06-02', value: 0.72, baseline: 0.72, deltaPct: 0, eventCount: 1710, anomaly: false },
      { date: '2026-06-03', value: 0.71, baseline: 0.72, deltaPct: -1.4, eventCount: 1690, anomaly: false },
      { date: '2026-06-04', value: 0.74, baseline: 0.72, deltaPct: 2.8, eventCount: 1740, anomaly: false },
      { date: '2026-06-05', value: 0.72, baseline: 0.72, deltaPct: 0, eventCount: 1700, anomaly: false },
      { date: '2026-06-06', value: 0.71, baseline: 0.72, deltaPct: -1.4, eventCount: 1680, anomaly: false },
      { date: '2026-06-07', value: 0.47, baseline: 0.72, deltaPct: -34.7, eventCount: 1840, anomaly: true },
      { date: '2026-06-08', value: 0.46, baseline: 0.72, deltaPct: -36.1, eventCount: 1860, anomaly: true },
      { date: '2026-06-09', value: 0.48, baseline: 0.72, deltaPct: -33.3, eventCount: 1830, anomaly: true },
      { date: '2026-06-10', value: 0.45, baseline: 0.72, deltaPct: -37.5, eventCount: 1870, anomaly: true },
      { date: '2026-06-11', value: 0.47, baseline: 0.72, deltaPct: -34.7, eventCount: 1840, anomaly: true },
    ],
  };
}

export function breakdownResponse(dimension = 'platform', from = defaultFrom, to = defaultTo, limit = 10) {
  const byDimension: Record<string, Array<{ key: string; value: number; baseline: number; deltaPct: number; eventCount: number }>> = {
    platform: [
      { key: 'mobile', value: 0.47, baseline: 0.73, deltaPct: -35.6, eventCount: 9240 },
      { key: 'web', value: 0.71, baseline: 0.72, deltaPct: -1.4, eventCount: 8125 },
      { key: 'desktop', value: 0.74, baseline: 0.72, deltaPct: 2.8, eventCount: 1055 },
    ],
    plan: [
      { key: 'pro', value: 0.45, baseline: 0.72, deltaPct: -37.5, eventCount: 3920 },
      { key: 'enterprise', value: 0.5, baseline: 0.73, deltaPct: -31.5, eventCount: 3180 },
      { key: 'free', value: 0.62, baseline: 0.7, deltaPct: -11.4, eventCount: 2140 },
    ],
    country: [
      { key: 'US', value: 0.45, baseline: 0.74, deltaPct: -39.2, eventCount: 4260 },
      { key: 'CA', value: 0.49, baseline: 0.72, deltaPct: -31.9, eventCount: 2010 },
      { key: 'GB', value: 0.68, baseline: 0.71, deltaPct: -4.2, eventCount: 1840 },
    ],
    release_version: [
      { key: 'v2.8.0', value: 0.47, baseline: 0.73, deltaPct: -35.6, eventCount: 9240 },
      { key: 'v2.7.1', value: 0.72, baseline: 0.72, deltaPct: 0, eventCount: 5210 },
      { key: 'v2.7.0', value: 0.71, baseline: 0.7, deltaPct: 1.4, eventCount: 3970 },
    ],
  };

  return {
    metric: 'activation',
    dimension,
    from,
    to,
    segments: (byDimension[dimension] ?? byDimension.platform).slice(0, limit).map((segment, index) => ({
      rank: index + 1,
      ...segment,
    })),
  };
}

export function anomaliesResponse(from = defaultFrom, to = defaultTo, limit = 5) {
  return {
    from,
    to,
    anomalies: [
      {
        id: 'activation-mobile-v2.8.0',
        metric: 'activation',
        severity: 'high',
        window: { from: '2026-06-07', to: '2026-06-11' },
        dimensions: {
          platform: 'mobile',
          releaseVersion: 'v2.8.0',
          country: 'US',
        },
        value: 0.47,
        baseline: 0.73,
        deltaPct: -35.6,
        eventCount: 9240,
        likelyCause: 'Release v2.8.0 mobile activation path shows elevated latency and lower success rate.',
      },
    ].slice(0, limit),
  };
}

export function drilldownResponse(from = defaultFrom, to = defaultTo) {
  return {
    metric: 'activation',
    filters: {
      platform: 'mobile',
      releaseVersion: 'v2.8.0',
      plan: null,
      country: null,
    },
    summary: {
      value: 0.47,
      baseline: 0.73,
      deltaPct: -35.6,
      eventCount: 9240,
    },
    rows: [
      {
        date: '2026-06-07',
        platform: 'mobile',
        releaseVersion: 'v2.8.0',
        plan: 'pro',
        country: 'US',
        value: 0.45,
        baseline: 0.74,
        deltaPct: -39.2,
        eventCount: 1260,
        latencyP95: 1240,
        successRate: 0.81,
      },
      {
        date: '2026-06-08',
        platform: 'mobile',
        releaseVersion: 'v2.8.0',
        plan: 'enterprise',
        country: 'CA',
        value: 0.49,
        baseline: 0.72,
        deltaPct: -31.9,
        eventCount: 980,
        latencyP95: 1180,
        successRate: 0.83,
      },
    ],
    from,
    to,
  };
}
