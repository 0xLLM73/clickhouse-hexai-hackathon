import { defaultFrom, defaultTo, drilldownResponse } from './mock-metrics';

export type QuestionId = 'funnel' | 'retention' | 'anomaly';

type InsightSource = 'approved_mock' | 'hex_project_link' | 'hex_api_configured_mock';

type InsightInput = {
  questionId?: QuestionId;
  question?: string;
  metric?: string;
  from?: string;
  to?: string;
  filters?: Record<string, unknown>;
};

type InsightTemplate = {
  insight: string;
  confidence: number;
  drivers: string[];
  suggestedNextAction: string;
};

const templates: Record<QuestionId, InsightTemplate> = {
  funnel: {
    insight:
      'Product usage remains healthy overall, but the activation step diverged from the baseline after the v2.8.0 release. The event mix still has enough volume to trust the signal.',
    confidence: 0.86,
    drivers: [
      'Event volume is stable, so the activation drop is unlikely to be caused by missing ingestion.',
      'The baseline window stays near 72% activation before the drop begins on 2026-06-07.',
      'The suspicious window overlaps the v2.8.0 mobile release segment.',
    ],
    suggestedNextAction:
      'Keep the funnel in the launch review, then inspect mobile activation and latency before widening the release.',
  },
  retention: {
    insight:
      'The first segment to inspect is mobile users on paid plans, especially pro accounts in the US. That segment combines the largest activation decline with elevated latency.',
    confidence: 0.89,
    drivers: [
      'The pro plan has the steepest activation delta in the mock breakdown.',
      'US mobile rows carry the largest event count among suspicious drilldown rows.',
      'Latency and success-rate movement happen in the same v2.8.0 segment.',
    ],
    suggestedNextAction:
      'Assign engineering to reproduce the v2.8.0 mobile pro activation path and compare it with the stable desktop control segment.',
  },
  anomaly: {
    insight:
      'Mobile activation on release v2.8.0 is the likely driver of the launch-review anomaly. Activation fell sharply while p95 latency increased and success rate dropped in the same segment.',
    confidence: 0.92,
    drivers: [
      'Mobile activation success rate is lower than desktop for the same period.',
      'Release v2.8.0 has elevated p95 latency in the suspicious segment.',
      'Country-level impact is most visible in the US and CA cohorts.',
    ],
    suggestedNextAction: 'Inspect the v2.8.0 mobile activation path before expanding the release.',
  },
};

export function hasHexConfig() {
  return Boolean(process.env.HEX_API_KEY && process.env.HEX_PROJECT_ID);
}

function insightSource(): InsightSource {
  if (hasHexConfig()) {
    return 'hex_api_configured_mock';
  }

  if (process.env.HEX_PROJECT_URL) {
    return 'hex_project_link';
  }

  return 'approved_mock';
}

function normalizeQuestionId(value: unknown): QuestionId {
  return value === 'retention' || value === 'anomaly' || value === 'funnel' ? value : 'anomaly';
}

function sourceNote(source: InsightSource) {
  if (source === 'hex_api_configured_mock') {
    return 'Hex credentials are configured, but this sprint adapter still returns the approved deterministic insight shape until live project-run automation is explicitly enabled.';
  }

  if (source === 'hex_project_link') {
    return 'Using the configured Hex project URL as the handoff target; the insight text is the approved deterministic mock.';
  }

  return 'No Hex credentials are configured; returning the approved deterministic mock insight so the frontend happy path never blocks.';
}

export function buildHexInsight(input: InsightInput = {}) {
  const questionId = normalizeQuestionId(input.questionId);
  const template = templates[questionId];
  const source = insightSource();
  const from = input.from ?? defaultFrom;
  const to = input.to ?? defaultTo;
  const metric = input.metric ?? 'activation';
  const drilldown = drilldownResponse(from, to);

  return {
    questionId,
    mode: 'mock',
    source,
    insight: template.insight,
    confidence: template.confidence,
    notes: [sourceNote(source)],
    narrative: template.insight,
    drivers: template.drivers,
    suggestedNextAction: template.suggestedNextAction,
    hexProjectId: process.env.HEX_PROJECT_ID || null,
    hexProjectUrl: process.env.HEX_PROJECT_URL || null,
    handoffUrl: process.env.HEX_PROJECT_URL || null,
    context: {
      metric,
      from,
      to,
      filters: input.filters ?? {
        platform: 'mobile',
        releaseVersion: 'v2.8.0',
      },
      summary: drilldown.summary,
    },
  };
}

export function buildHexHandoff(input: InsightInput = {}) {
  const from = input.from ?? defaultFrom;
  const to = input.to ?? defaultTo;
  const metric = input.metric ?? 'activation';
  const filters = input.filters ?? {
    platform: 'mobile',
    releaseVersion: 'v2.8.0',
  };
  const insight = buildHexInsight({
    ...input,
    metric,
    from,
    to,
    filters,
  });
  const drilldown = drilldownResponse(from, to);

  return {
    mode: insight.mode,
    source: insight.source,
    prompt:
      input.question ??
      `Investigate ${metric} from ${from} to ${to} for platform=mobile and release_version=v2.8.0.`,
    context: insight.context,
    hexProjectId: insight.hexProjectId,
    insight: insight.insight,
    answer: insight.insight,
    confidence: insight.confidence,
    notes: insight.notes,
    exportRows: drilldown.rows.map((row) => ({
      date: row.date,
      platform: row.platform,
      releaseVersion: row.releaseVersion,
      plan: row.plan,
      country: row.country,
      activationRate: row.value,
      latencyP95: row.latencyP95,
      successRate: row.successRate,
    })),
    handoffUrl: insight.handoffUrl,
  };
}
