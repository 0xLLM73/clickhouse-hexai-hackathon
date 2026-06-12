# Frontend Implementation Path

Frontend implementation is paused for the current **Trading Strategy Evaluation
Lab** direction.

Hex is the primary demo surface. This repository should prioritize the
ClickHouse schema, deterministic synthetic seed/load flow, canonical drawdown
attribution SQL, and Hex handoff docs before any app work resumes.

## Current Decision

Do not extend the retired Usage Signal Desk app.

The existing Vite app remains in the repo as a possible fallback shell, but it
is not the active demo path. Its product-usage copy, metrics, prompts, and
`usage_events` examples are obsolete for the trading evaluation scope.

## Resume Criteria

Only resume frontend work after PM/CTO explicitly asks for a minimal fallback
wrapper and Backend has published the trading outputs to display.

Required inputs before code changes:

- ClickHouse schema for `signals`, `orders`, `fills`, `portfolio_snapshots`, and
  `market_candles`.
- Deterministic synthetic seed/load path.
- Canonical SQL for drawdown window detection and strategy contribution
  ranking.
- Expected Hex outputs or a Hex project URL/handoff.
- Confirmation that the app should support Hex as a fallback viewer, not replace
  Hex.

## Fallback Direction

If rescoped, adapt the existing shell behind `src/api/demoClient.ts` to show:

- the question "Which strategy caused the drawdown?"
- drawdown summary cards
- portfolio value or drawdown chart
- strategy contribution table
- visible ClickHouse attribution SQL
- Hex-style narrative grounded only in synthetic query outputs
- optional Hex project link or handoff status

See `docs/frontend-integration.md` for the fallback shape and privacy gate.
