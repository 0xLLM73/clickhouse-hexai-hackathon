# ClickHouse + Hex AI Hackathon

Public hackathon project for building with ClickHouse and Hex AI.

## Sprint Principles

- Keep secrets out of git. Use `.env` locally and document required values in `.env.example`.
- Prefer small, working commits over large rewrites.
- Ship useful demos first, then harden what matters.
- Avoid adding process gates that block fast iteration during the hackathon.

## Getting Started

The repo currently contains a Vite + React + TypeScript demo workspace from the
earlier fallback path, but the active scope is Hex-first. Treat app setup as
optional fallback support unless PM/CTO explicitly reopens frontend work.

1. Clone the repo.
2. Copy `.env.example` to `.env`.
3. Fill in local credentials and API keys.
4. Apply `clickhouse/schema.sql` to a ClickHouse database.
5. Load deterministic synthetic demo data from `clickhouse/seed.sql`.
6. Run the canonical analysis SQL from `clickhouse/queries.sql`.
7. Build the Hex project from `docs/trading-hex-handoff.md`.
8. If a fallback wrapper is later approved, install app dependencies with
   `npm install`, start the API with `npm run api`, and start the Vite app with
   `npm run dev`.

## App Direction

- Hex is the primary demo surface for Trading Strategy Evaluation Lab.
- Backend/Research should focus on ClickHouse schema, deterministic synthetic
  data, canonical drawdown attribution SQL, and Hex handoff docs.
- `clickhouse/schema.sql`, `clickhouse/seed.sql`, and `clickhouse/queries.sql`
  are the backend-owned Trading Strategy Evaluation Lab artifacts.
- `src/App.tsx` and `src/api/demoClient.ts` are fallback app assets only unless
  app work is separately approved.
- Any existing product-analytics route contract is retired for the active scope
  unless PM/CTO explicitly revives it.
- Frontend pause, fallback shape, and privacy gates are documented in
  `docs/frontend-implementation-path.md` and `docs/frontend-integration.md`.

## Current Demo Decision

As of `2026-06-11`, build the Hex-first **Trading Strategy Evaluation Lab** scope unless PM/CTO explicitly reopens app fallback work.

- Dataset/story: synthetic trading strategy evaluation data that answers "which strategy caused the drawdown?"
- Approved tables: `signals`, `orders`, `fills`, `portfolio_snapshots`, and `market_candles`.
- Seeded answer: `momentum_breakout` caused the drawdown through `BETA_SYN` in the `2026-01-14` to `2026-01-18` window.
- ClickHouse status: schema, deterministic seed/load flow, and canonical drawdown attribution SQL are in scope.
- Hex status: Hex is the primary demo surface for charts, tables, drilldowns, and AI-assisted explanation.
- Privacy boundary: no Trading-Boy access or references, no private strategy logic or prompts, no private keys/accounts, and no real trades, positions, PnL, or account identifiers.
- Team default: Backend and Research work only from the five approved synthetic entities; Frontend remains paused unless a fallback wrapper is separately approved.

## Submission

Published Hex App URL: `https://app.hex.tech/019eb827-2a68-72b8-a46d-dba6bc46cd2e/app/Trading-Strategy-Evaluation-Lab-033WhiRrYfY6YugmSpdB8W/latest`

Use the published app link from Hex publish/App Builder for submission, not the
draft `/draft/logic` URL.

Final app status:

- Presenter tabs confirmed: Answer, Attribution, Evidence, SQL.
- Backing data confirmed: only `signals`, `orders`, `fills`,
  `portfolio_snapshots`, and `market_candles`.
- Final summary/disclaimer confirmed: synthetic ClickHouse data, not live
  trading, not investment or trading advice.
- Expected answer confirmed: `momentum_breakout` caused the drawdown,
  concentrated in `BETA_SYN` during the `2026-01-14` to `2026-01-18`
  `risk_off` window.

## Security Notes

- Do not commit API keys, database credentials, service tokens, exported datasets with private data, or local `.env` files.
- Rotate any secret immediately if it is accidentally committed or shared.
- Use least-privilege ClickHouse credentials where practical during the sprint.
- Keep public demo data synthetic or approved for public release.

## Hackathon Workflow

- Commit directly to `main` when speed matters.
- Use pull requests for risky changes, shared interfaces, or anything touching deployment/security.
- Record setup decisions in this README as they become real.

## MVP Direction

The current demo direction is **Trading Strategy Evaluation Lab**: a Hex-first ClickHouse analytics workflow for synthetic trading strategy drawdown attribution.

See [docs/mvp-demo-plan.md](docs/mvp-demo-plan.md) for target user, demo storyline, must-have scope, nice-to-have scope, and first implementation tasks.
See [docs/demo-decision.md](docs/demo-decision.md) for the timestamped dataset and credential decision.

See [docs/backend-integration.md](docs/backend-integration.md) for schema, seed/load, and canonical SQL coverage.
See [docs/trading-hex-handoff.md](docs/trading-hex-handoff.md) for Hex project layout and safe AI prompt guidance.
See [docs/hex-setup.md](docs/hex-setup.md) for the exact Hex connection and project setup steps.
See [docs/demo-script.md](docs/demo-script.md) for the final presenter script.
See [docs/hex-final-polish.md](docs/hex-final-polish.md) for manual no-AI-credit polish cells and copy.
See [docs/fallback-outputs.md](docs/fallback-outputs.md) for saved demo-continuity outputs.
