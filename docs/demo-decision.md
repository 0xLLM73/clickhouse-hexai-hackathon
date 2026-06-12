# Demo Dataset And Privacy Decision

Decision timestamp: `2026-06-11`

## Dataset And Story

Use **Trading Strategy Evaluation Lab** as the current sprint story: a Hex-first ClickHouse analytics workflow for synthetic trading strategy evaluation.

The demo question is:

- Which strategy caused the drawdown?

The build dataset is synthetic/anonymized trading evaluation data only, organized around:

- `signals`
- `orders`
- `fills`
- `portfolio_snapshots`
- `market_candles`

## Privacy Boundary

This repo must not access or reference the human's private AI trading tool.

Explicitly prohibited:

- Trading-Boy repo access or references.
- Private strategy logic.
- Private prompts.
- Private keys, account identifiers, broker data, exchange data, or credentials.
- Real trades, real positions, real PnL, or real account data.
- Code copied from private trading systems.

All demo data and analysis must be synthetic or anonymized and generated for this repo.

## Service Status

Hex is the primary demo surface. ClickHouse supplies the analytical data store.

Live external credentials are not required for the scope brief. Backend and Research should design for a synthetic seed/load path and document any optional live ClickHouse/Hex setup separately. Secrets stay out of git.

## Team Direction

PM owns this scope brief and acceptance criteria.

Research should identify Hex + ClickHouse analysis patterns for drawdown attribution, risk metrics, and safe AI prompt patterns using synthetic data only.

Backend should derive the ClickHouse schema, deterministic seed/load flow, and canonical drawdown attribution SQL only from the explicit synthetic entities and privacy boundary in `docs/mvp-demo-plan.md`.

Frontend remains paused unless PM/CTO explicitly asks for a minimal fallback wrapper after the Hex-first path is defined.
