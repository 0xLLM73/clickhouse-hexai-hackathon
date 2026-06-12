# Frontend Integration

Frontend/app work is currently paused. Hex is the primary demo surface for
**Trading Strategy Evaluation Lab**.

Do not extend the retired Usage Signal Desk UI unless PM/CTO explicitly asks
for a lightweight fallback wrapper after the Hex path is stable.

## Current Scope

The active demo asks:

- Which strategy caused the drawdown?

All fallback work must stay inside the synthetic data contract in
`docs/mvp-demo-plan.md`:

- `signals`
- `orders`
- `fills`
- `portfolio_snapshots`
- `market_candles`

The frontend must not access, reference, or imply private trading systems,
private strategy logic, prompts, credentials, real trades, real PnL, or real
accounts.

## Salvageable App Pieces

The existing Vite app can be reused later as a small fallback shell, but its
current labels and mock data are tied to the retired product-usage story.

Salvageable:

- `src/App.tsx` layout structure: prompt panel, result cards, SQL panel,
  narrative panel, simple chart, and ranked table.
- `src/api/demoClient.ts` as the seam for deterministic fixture data or future
  fallback fetch calls.
- `src/styles.css` for the compact dashboard layout, with copy/color tweaks as
  needed.
- `npm run dev` and `npm run build` as the local Vite workflow.

Not salvageable without rewriting:

- Usage Signal Desk copy.
- Activation, release, platform, and onboarding metrics.
- `usage_events` query examples.
- Golden prompts about product usage or launch review.
- Any API contract based on `/api/metrics/*` usage analytics.

## Optional Fallback Shape

If PM/CTO asks for a frontend fallback, keep it Hex-supporting rather than a
replacement analytics app.

Recommended first screen:

- Header: "Trading Strategy Evaluation Lab".
- Primary question: "Which strategy caused the drawdown?"
- Cards: max drawdown, culprit strategy, drawdown window, ClickHouse query time.
- Chart: portfolio value or drawdown percent over time.
- Table: strategy contribution ranked by drawdown impact.
- SQL panel: canonical drawdown attribution query from Backend.
- Narrative panel: Hex-style explanation grounded in visible synthetic query
  outputs.
- Link or callout: open the primary Hex project/handoff when available.

Recommended fallback data seam:

```ts
type TradingEvaluationResult = {
  question: string;
  generatedSql: string;
  narrative: string;
  summary: Array<{
    label: string;
    value: string;
    delta?: string;
    tone: "good" | "warn" | "neutral";
  }>;
  equityCurve: Array<{
    timestamp: string;
    portfolioValue: number;
    drawdownPct: number;
  }>;
  contributors: Array<{
    rank: number;
    strategyId: string;
    symbol: string;
    marketRegime: string;
    contributionPct: number;
    realizedPnl: number;
    slippageBps: number;
    evidence: string;
  }>;
  connection: {
    mode: "sample" | "connected";
    label: string;
    latencyMs: number;
    rowsScanned: string;
    hexProjectUrl?: string;
  };
};
```

## Implementation Gate

Before editing app code, confirm all of the following:

- PM/CTO explicitly asks for a fallback wrapper.
- Backend has landed the trading schema, deterministic seed/load path, and
  canonical drawdown attribution SQL.
- The fallback uses only the five approved synthetic entities.
- Hex remains the primary demo surface.
- The app is framed as a backup viewer for synthetic outputs, not as a trading
  dashboard or replacement for Hex.
