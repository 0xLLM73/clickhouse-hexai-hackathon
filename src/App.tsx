import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AnalysisResult, demoClient, SegmentRow, TrendPoint } from './api/demoClient';

const formatPercent = (value: number) => `${value.toFixed(0)}%`;

function SparkChart({ points }: { points: TrendPoint[] }) {
  const max = Math.max(...points.flatMap((point) => [point.mobileActivation, point.desktopActivation]));
  const min = Math.min(...points.flatMap((point) => [point.mobileActivation, point.desktopActivation]));
  const range = max - min || 1;

  const linePath = (key: 'mobileActivation' | 'desktopActivation') =>
    points
      .map((point, index) => {
        const x = (index / (points.length - 1)) * 100;
        const y = 100 - ((point[key] - min) / range) * 82 - 8;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');

  return (
    <div className="chart-panel" aria-label="Activation trend chart">
      <svg viewBox="0 0 100 100" role="img">
        <path className="grid-line" d="M 0 18 L 100 18" />
        <path className="grid-line" d="M 0 50 L 100 50" />
        <path className="grid-line" d="M 0 82 L 100 82" />
        <path className="line line-desktop" d={linePath('desktopActivation')} />
        <path className="line line-mobile" d={linePath('mobileActivation')} />
      </svg>
      <div className="chart-days">
        {points.map((point) => (
          <span key={point.day}>{point.day}</span>
        ))}
      </div>
    </div>
  );
}

function SegmentTable({ rows }: { rows: SegmentRow[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Segment</th>
            <th>Activation</th>
            <th>Change</th>
            <th>Users</th>
            <th>Likely driver</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.segment}>
              <td>{row.segment}</td>
              <td>{formatPercent(row.activationRate)}</td>
              <td className="negative">{row.delta}</td>
              <td>{row.users}</td>
              <td>{row.likelyDriver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function App() {
  const [question, setQuestion] = useState('Why did activation drop for mobile users yesterday?');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [runState, setRunState] = useState<'idle' | 'loading' | 'running'>('loading');

  useEffect(() => {
    demoClient.loadSample().then((sample) => {
      setResult(sample);
      setRunState('idle');
    });
  }, []);

  const chartLabel = useMemo(() => {
    if (!result) return 'Loading sample trend';
    const latest = result.trend[result.trend.length - 1];
    return `Mobile ${formatPercent(latest.mobileActivation)} vs desktop ${formatPercent(latest.desktopActivation)}`;
  }, [result]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRunState('running');
    const nextResult = await demoClient.askQuestion(question);
    setResult(nextResult);
    setRunState('idle');
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="topbar">
          <div>
            <p className="eyebrow">ClickHouse + Hex AI Hackathon</p>
            <h1>Usage Signal Desk</h1>
          </div>
          <div className="connection-pill" data-mode={result?.connection.mode ?? 'sample'}>
            <span className="status-dot" />
            {result?.connection.label ?? 'Loading sample'}
          </div>
        </div>

        <div className="hero-grid">
          <section className="query-panel">
            <div className="panel-heading">
              <p className="eyebrow">Ask Hex AI</p>
              <h2>Investigate the usage anomaly</h2>
            </div>
            <form onSubmit={onSubmit}>
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} />
              <div className="button-row">
                <button type="button" onClick={() => setQuestion('Which segment caused the activation drop?')}>
                  Segment driver
                </button>
                <button type="button" onClick={() => setQuestion('Did release v2.8.0 affect mobile activation?')}>
                  Release impact
                </button>
                <button type="submit" disabled={runState !== 'idle'}>
                  {runState === 'running' ? 'Running query...' : 'Generate SQL + run'}
                </button>
              </div>
            </form>
          </section>

          <section className="summary-panel">
            <p className="eyebrow">Run result</p>
            <div className="metric-grid">
              {(result?.summary ?? []).map((metric) => (
                <article className="metric-card" data-tone={metric.tone} key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <small>{metric.delta}</small>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="analysis-grid">
          <section className="sql-panel">
            <div className="panel-heading inline">
              <div>
                <p className="eyebrow">Generated ClickHouse SQL</p>
                <h2>{result?.question ?? 'Loading question'}</h2>
              </div>
              <span>{result ? `${result.connection.latencyMs}ms` : '--'}</span>
            </div>
            <pre>{result?.generatedSql ?? 'Loading sample query...'}</pre>
          </section>

          <section className="insight-panel">
            <p className="eyebrow">Answer</p>
            <p>{result?.narrative ?? 'Loading sample analysis...'}</p>
            <div className="chart-header">
              <h2>Activation trend</h2>
              <span>{chartLabel}</span>
            </div>
            {result && <SparkChart points={result.trend} />}
          </section>
        </div>

        <section className="drivers-panel">
          <div className="panel-heading inline">
            <div>
              <p className="eyebrow">Top contributors</p>
              <h2>Segments to investigate next</h2>
            </div>
            <span>{result?.connection.rowsScanned ?? 'Sample rows'}</span>
          </div>
          {result && <SegmentTable rows={result.segments} />}
        </section>
      </section>
    </main>
  );
}
