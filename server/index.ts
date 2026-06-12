import express from 'express';
import { backendMode, boundedLimit, hasClickHouseConfig, queryClickHouse } from '../src/lib/server/clickhouse';
import { buildHexHandoff, buildHexInsight, hasHexConfig, type QuestionId } from '../src/lib/server/hex-insights';
import {
  anomaliesResponse,
  breakdownResponse,
  defaultFrom,
  defaultTo,
  drilldownResponse,
  summaryResponse,
  timeseriesResponse,
} from '../src/lib/server/mock-metrics';

const app = express();
const port = Number(process.env.API_PORT ?? 8787);

app.use(express.json({ limit: '256kb' }));

const questions: Array<{ id: QuestionId; label: string; prompt: string }> = [
  {
    id: 'funnel',
    label: 'Usage funnel',
    prompt: 'What changed in product usage over the last 7 days, and which event types contributed most?',
  },
  {
    id: 'retention',
    label: 'Segment retention',
    prompt: 'Break down the anomaly by source and plan. Which segment should we inspect first?',
  },
  {
    id: 'anomaly',
    label: 'Launch review',
    prompt: 'Write a launch-review summary with the likely cause, supporting evidence, and next action.',
  },
];

function dateParam(value: unknown, fallback: string) {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function liveMode() {
  return backendMode() === 'clickhouse' ? 'live' : 'mock';
}

function questionId(value: unknown): QuestionId {
  return value === 'retention' || value === 'anomaly' || value === 'funnel' ? value : 'funnel';
}

app.get('/api/health', async (_request, response) => {
  const clickhouseConfigured = hasClickHouseConfig();
  const hexConfigured = hasHexConfig();

  if (backendMode() !== 'clickhouse') {
    response.json({
      ok: true,
      mode: 'mock',
      clickhouse: {
        configured: clickhouseConfigured,
        ok: false,
        database: process.env.CLICKHOUSE_DATABASE || null,
      },
      hex: {
        configured: hexConfigured,
        projectId: process.env.HEX_PROJECT_ID || null,
        projectUrl: process.env.HEX_PROJECT_URL || null,
      },
    });
    return;
  }

  try {
    const rows = await queryClickHouse<{ ok: number }>('SELECT 1 AS ok');
    response.json({
      ok: rows[0]?.ok === 1,
      mode: 'live',
      clickhouse: {
        configured: clickhouseConfigured,
        ok: rows[0]?.ok === 1,
        database: process.env.CLICKHOUSE_DATABASE || null,
      },
      hex: {
        configured: hexConfigured,
        projectId: process.env.HEX_PROJECT_ID || null,
        projectUrl: process.env.HEX_PROJECT_URL || null,
      },
    });
  } catch (error) {
    response.status(503).json({ error: error instanceof Error ? error.message : 'ClickHouse health check failed' });
  }
});

app.get('/api/metrics/summary', async (request, response) => {
  const from = dateParam(request.query.from, defaultFrom);
  const to = dateParam(request.query.to, defaultTo);

  if (backendMode() !== 'clickhouse') {
    response.json(summaryResponse(from, to));
    return;
  }

  try {
    const rows = await queryClickHouse(
      `
        SELECT
          round(avgIf(success, event_name = 'activation'), 4) AS activationRate,
          uniqExact(account_id) AS activeAccounts,
          count() AS eventVolume,
          quantile(0.95)(latency_ms) AS latencyP95
        FROM usage_events
        WHERE event_date >= toDate({from:String})
          AND event_date <= toDate({to:String})
      `,
      { from, to }
    );
    response.json({ ...summaryResponse(from, to), mode: 'live', liveRows: rows });
  } catch (error) {
    response.status(500).json({ error: error instanceof Error ? error.message : 'Summary query failed' });
  }
});

app.get('/api/metrics/timeseries', (_request, response) => {
  response.json(timeseriesResponse());
});

app.get('/api/metrics/breakdown', (request, response) => {
  const from = dateParam(request.query.from, defaultFrom);
  const to = dateParam(request.query.to, defaultTo);
  const dimension = dateParam(request.query.dimension, 'platform');
  const limit = boundedLimit(String(request.query.limit ?? ''), 10, 25);
  response.json(breakdownResponse(dimension, from, to, limit));
});

app.get('/api/anomalies', (request, response) => {
  const from = dateParam(request.query.from, defaultFrom);
  const to = dateParam(request.query.to, defaultTo);
  const limit = boundedLimit(String(request.query.limit ?? ''), 5, 25);
  response.json(anomaliesResponse(from, to, limit));
});

app.get('/api/drilldown', (request, response) => {
  const from = dateParam(request.query.from, defaultFrom);
  const to = dateParam(request.query.to, defaultTo);
  response.json(drilldownResponse(from, to));
});

app.post('/api/hex/handoff', (request, response) => {
  const metric = typeof request.body?.metric === 'string' ? request.body.metric : 'activation';
  const from = typeof request.body?.from === 'string' ? request.body.from : defaultFrom;
  const to = typeof request.body?.to === 'string' ? request.body.to : defaultTo;
  const filters = request.body?.filters && typeof request.body.filters === 'object'
    ? request.body.filters
    : { platform: 'mobile', releaseVersion: 'v2.8.0' };
  const question = typeof request.body?.question === 'string' ? request.body.question : undefined;

  response.json(buildHexHandoff({ metric, from, to, filters, question }));
});

app.get('/api/questions', (_request, response) => {
  response.json({ questions });
});

app.post('/api/query', (request, response) => {
  const id = questionId(request.body?.questionId);
  const from = typeof request.body?.from === 'string' ? request.body.from : defaultFrom;
  const to = typeof request.body?.to === 'string' ? request.body.to : defaultTo;

  if (id === 'anomaly') {
    const breakdown = breakdownResponse('release_version', from, to, 10);
    response.json({
      questionId: id,
      mode: liveMode(),
      sql: 'SELECT platform, release_version, country, avg(success) AS success_rate, quantile(0.95)(latency_ms) AS latency_p95 FROM usage_events WHERE event_name = activation GROUP BY platform, release_version, country ORDER BY success_rate ASC',
      columns: [
        { key: 'key', label: 'Release', type: 'string' },
        { key: 'value', label: 'Activation rate', type: 'number' },
        { key: 'deltaPct', label: 'Delta %', type: 'number' },
        { key: 'eventCount', label: 'Events', type: 'number' },
      ],
      rows: breakdown.segments,
      chart: { type: 'bar', xKey: 'key', yKey: 'value', title: 'Activation by release' },
      summaryMetric: { label: 'Weakest activation segment', value: '47%', delta: '-35.6%', trend: 'down' },
    });
    return;
  }

  const dimension = id === 'retention' ? 'plan' : 'platform';
  const breakdown = breakdownResponse(dimension, from, to, 10);
  response.json({
    questionId: id,
    mode: liveMode(),
    sql: 'SELECT dimension, avg(success) AS activation_rate, count() AS events FROM usage_events WHERE event_date BETWEEN {from} AND {to} GROUP BY dimension ORDER BY activation_rate ASC',
    columns: [
      { key: 'key', label: dimension, type: 'string' },
      { key: 'value', label: 'Activation rate', type: 'number' },
      { key: 'baseline', label: 'Baseline', type: 'number' },
      { key: 'eventCount', label: 'Events', type: 'number' },
    ],
    rows: breakdown.segments,
    chart: { type: 'bar', xKey: 'key', yKey: 'value', title: id === 'retention' ? 'Activation by plan' : 'Activation by platform' },
    summaryMetric: { label: 'Events scanned', value: '18,420', delta: '+4.2%', trend: 'up' },
  });
});

app.post('/api/insight', (request, response) => {
  const id = questionId(request.body?.questionId);
  const from = typeof request.body?.from === 'string' ? request.body.from : defaultFrom;
  const to = typeof request.body?.to === 'string' ? request.body.to : defaultTo;

  response.json(buildHexInsight({ questionId: id, from, to }));
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
