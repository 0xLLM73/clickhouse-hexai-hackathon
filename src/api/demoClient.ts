export type ConnectionState = {
  mode: 'sample' | 'connected';
  label: string;
  latencyMs: number;
  rowsScanned: string;
};

export type SummaryMetric = {
  label: string;
  value: string;
  delta: string;
  tone: 'good' | 'warn' | 'neutral';
};

export type TrendPoint = {
  day: string;
  mobileActivation: number;
  desktopActivation: number;
};

export type SegmentRow = {
  segment: string;
  activationRate: number;
  delta: string;
  users: string;
  likelyDriver: string;
};

export type AnalysisResult = {
  question: string;
  generatedSql: string;
  narrative: string;
  summary: SummaryMetric[];
  trend: TrendPoint[];
  segments: SegmentRow[];
  connection: ConnectionState;
};

export type DemoClient = {
  loadSample(): Promise<AnalysisResult>;
  askQuestion(question: string): Promise<AnalysisResult>;
};

const defaultQuestion = 'Why did activation drop for mobile users yesterday?';

const baseResult: AnalysisResult = {
  question: defaultQuestion,
  connection: {
    mode: 'sample',
    label: 'Sample dataset loaded',
    latencyMs: 42,
    rowsScanned: '500 demo events',
  },
  generatedSql: `SELECT
  toDate(event_time) AS day,
  platform,
  countIf(event_name = 'activation_completed' AND success) / countIf(event_name = 'activation_started') AS activation_rate,
  avgIf(latency_ms, event_name = 'activation_completed') AS avg_latency_ms
FROM demo_events
WHERE event_time >= now() - INTERVAL 7 DAY
  AND release_version IN ('v2.7.4', 'v2.8.0')
GROUP BY day, platform
ORDER BY day ASC, platform ASC;`,
  narrative:
    'Mobile activation fell after release v2.8.0 while desktop stayed flat. The highest-loss slice is mobile users in the US on the onboarding checklist, where average activation latency rose above 900ms.',
  summary: [
    { label: 'Activation', value: '41.8%', delta: '-12.4 pts', tone: 'warn' },
    { label: 'Impacted users', value: '8.7k', delta: '+31%', tone: 'warn' },
    { label: 'Avg latency', value: '934ms', delta: '+286ms', tone: 'warn' },
    { label: 'ClickHouse time', value: '42ms', delta: '500 rows', tone: 'good' },
  ],
  trend: [
    { day: 'Jun 4', mobileActivation: 56, desktopActivation: 61 },
    { day: 'Jun 5', mobileActivation: 55, desktopActivation: 62 },
    { day: 'Jun 6', mobileActivation: 54, desktopActivation: 60 },
    { day: 'Jun 7', mobileActivation: 52, desktopActivation: 61 },
    { day: 'Jun 8', mobileActivation: 45, desktopActivation: 60 },
    { day: 'Jun 9', mobileActivation: 42, desktopActivation: 59 },
    { day: 'Jun 10', mobileActivation: 41, desktopActivation: 60 },
  ],
  segments: [
    {
      segment: 'Mobile / US / onboarding_checklist',
      activationRate: 38,
      delta: '-18.6 pts',
      users: '3.1k',
      likelyDriver: 'Release v2.8.0 latency spike',
    },
    {
      segment: 'Mobile / CA / onboarding_checklist',
      activationRate: 43,
      delta: '-9.2 pts',
      users: '1.4k',
      likelyDriver: 'Slower checklist completion',
    },
    {
      segment: 'Desktop / US / dashboard_invite',
      activationRate: 60,
      delta: '+0.8 pts',
      users: '2.7k',
      likelyDriver: 'Stable control segment',
    },
  ],
};

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const demoClient: DemoClient = {
  async loadSample() {
    await wait(240);
    return baseResult;
  },

  async askQuestion(question: string) {
    await wait(520);

    return {
      ...baseResult,
      question,
      connection: {
        ...baseResult.connection,
        latencyMs: 39,
      },
    };
  },
};
