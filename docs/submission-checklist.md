# Submission Checklist

Use this as the final readiness checklist for **Trading Strategy Evaluation Lab**.

## Scope

- [x] Demo title is **Trading Strategy Evaluation Lab**.
- [x] Core question is "Which strategy caused the drawdown?"
- [x] Demo is Hex-first with ClickHouse as the analytical store.
- [x] The Vite app is not required for the primary submission.
- [x] No Trading-Boy repo access, references, code, prompts, or private strategy
  logic are included.
- [x] No real trades, accounts, positions, keys, broker data, exchange data, or
  real PnL are included.

## ClickHouse

- [x] `clickhouse/schema.sql` creates exactly:
  - `signals`
  - `orders`
  - `fills`
  - `portfolio_snapshots`
  - `market_candles`
- [x] `clickhouse/seed.sql` loads deterministic synthetic data.
- [x] `clickhouse/queries.sql` runs without errors against the loaded database.
- [x] Max drawdown query ranks `momentum_breakout` as the culprit strategy.
- [x] Attribution query shows `BETA_SYN` and `risk_off` as supporting evidence.
- [x] Execution quality query shows elevated slippage/taker fills for the culprit.

## Hex

- [x] Hex API key is not required for the primary hackathon submission path.
- [x] Hex connects to ClickHouse.
- [x] Hex AI context is limited to the five approved synthetic tables.
- [x] Hex project includes:
  - portfolio equity curve
  - max drawdown table
  - strategy attribution ranking
  - strategy/symbol/regime drilldown
  - execution quality table
  - signal quality table
  - market context table
  - final AI summary
- [x] The Hex App has presenter-friendly tabs for Answer, Attribution, Evidence,
  and SQL.
- [x] `HEX_PROJECT_URL` is available locally for README/runbook updates.
- [x] Final published Hex App URL has replaced the draft `/draft/logic` URL in submission materials.

## Demo

- [x] Presenter can complete the run in under five minutes.
- [x] The privacy boundary is stated in the first 30 seconds.
- [x] The golden prompt cites only visible synthetic query outputs.
- [x] Fallback saved outputs or screenshots are ready in case Hex or ClickHouse
  is slow.
- [x] Closing decision: review or pause synthetic `momentum_breakout` exposure
  to `BETA_SYN` before expanding the strategy.

## Verification

- [x] `npm run typecheck` passes for the repo.
- [x] `npm run build` passes for the repo.
- [x] ClickHouse schema/seed/query validation has been run with live/local
  credentials.

Validation note: live ClickHouse validation passed on `2026-06-11` against the
configured hackathon service. The expected synthetic culprit is
`momentum_breakout`, concentrated in `BETA_SYN` during the `risk_off` window.

Final polish note: the expanded canonical query suite now includes judge
summary, waterfall attribution, why-not comparison, and reproducibility cells.
All 12 queries passed live ClickHouse validation on `2026-06-11`.
