# MVP Demo Plan

## Decision

Build a **Hex-first ClickHouse analytics project** for synthetic trading strategy evaluation.

Working title: **Trading Strategy Evaluation Lab**.

The demo answers one core question:

- Which strategy caused the drawdown?

Hex is the primary demo surface. The repo should support the ClickHouse schema, synthetic seed/load flow, canonical analysis SQL, and short demo handoff docs. App/frontend work is paused unless PM/CTO explicitly asks for a minimal fallback wrapper after the Hex path is defined.

## Privacy Boundary

This project must not access, request, reference, copy from, or expose the human's private AI trading tool or any private trading assets.

Strict exclusions:

- No Trading-Boy repo access or references.
- No private strategy logic.
- No private prompts.
- No private keys, accounts, credentials, broker data, or exchange data.
- No real trades, real positions, real PnL, or real account identifiers.
- No reverse engineering of the private tool's behavior.

All data must be synthetic or anonymized demo data created specifically for this repo.

## Target User

The primary user is a trading operations, research, or risk reviewer who needs to investigate a drawdown across multiple synthetic strategies.

The pain point is attribution. Portfolio-level drawdowns are visible, but it is harder to identify which strategy, symbol, signal family, execution behavior, or market regime contributed most.

## Demo Storyline

1. A reviewer opens a Hex project connected to ClickHouse.
2. The reviewer sees a portfolio equity curve and a highlighted drawdown window.
3. Hex runs ClickHouse-backed attribution queries over synthetic strategy evaluation data.
4. The analysis ranks strategy contribution to drawdown, then drills into signals, orders, fills, and market candles.
5. Hex AI helps summarize the likely cause using only query outputs from synthetic data.
6. The final view gives a decision-ready answer: which synthetic strategy contributed most, what evidence supports it, and what follow-up check should happen next.

## Synthetic Data Contract

Backend and Research should derive work only from these synthetic entities. Field names may be tightened by Backend in the ClickHouse contract, but the data model should stay within this shape unless PM/CTO approves a change.

### `signals`

Synthetic model decisions emitted before orders.

Required concepts:

- `signal_id`
- `strategy_id`
- `symbol`
- `signal_time`
- `side`
- `confidence`
- `intended_quantity`
- `reference_price`
- `signal_family`
- `market_regime`

### `orders`

Synthetic orders created from signals.

Required concepts:

- `order_id`
- `signal_id`
- `strategy_id`
- `symbol`
- `order_time`
- `side`
- `order_type`
- `quantity`
- `limit_price`
- `status`

### `fills`

Synthetic executions for orders.

Required concepts:

- `fill_id`
- `order_id`
- `strategy_id`
- `symbol`
- `fill_time`
- `side`
- `quantity`
- `fill_price`
- `fees`
- `slippage_bps`
- `liquidity_flag`

### `portfolio_snapshots`

Synthetic portfolio state over time.

Required concepts:

- `snapshot_time`
- `strategy_id`
- `portfolio_value`
- `cash`
- `gross_exposure`
- `net_exposure`
- `realized_pnl`
- `unrealized_pnl`
- `drawdown_pct`
- `benchmark_return`

### `market_candles`

Synthetic market context for symbols.

Required concepts:

- `candle_time`
- `symbol`
- `open`
- `high`
- `low`
- `close`
- `volume`
- `volatility`
- `market_regime`

## Demo Data Requirements

Synthetic data must include:

- Multiple strategies with stable IDs, for example `mean_reversion_alpha`, `momentum_breakout`, and `volatility_carry`.
- Multiple symbols and market regimes.
- One deterministic drawdown window.
- One primary culprit strategy that is clearly attributable through portfolio, fill, and market context.
- Secondary contributors that make the analysis realistic without making the answer ambiguous.
- No names, keys, prompts, holdings, or events that imply real private trading activity.

## Expected Hex Outputs

The Hex project should produce:

- Portfolio equity curve with highlighted drawdown window.
- Strategy contribution ranking for the drawdown.
- Drawdown attribution table by strategy, symbol, and market regime.
- Fill/execution quality view with slippage and fees.
- Signal quality view comparing confidence, direction, and realized outcome.
- Market context view using candles and volatility/regime fields.
- AI-assisted explanation that cites synthetic query outputs, not private strategy logic.

## Must-Have Scope

- ClickHouse schema for the five approved synthetic entities.
- Deterministic synthetic seed/load path.
- Canonical SQL that identifies the drawdown window and ranks strategy contribution.
- Hex-first demo handoff describing the project pages, queries, and expected outputs.
- Privacy note in the handoff stating that all data is synthetic and not derived from private trading systems.

## Nice-To-Have Scope

- Minimal local helper scripts for generating or loading synthetic data.
- Optional lightweight fallback view only after the Hex path is stable and PM/CTO asks for it.
- Additional risk metrics such as max drawdown, volatility, Sharpe-like ratio, hit rate, turnover, and slippage distribution.
- Parameterized date/strategy filters in Hex.

## Non-Goals

- Connecting to the private trading tool.
- Importing real trade history.
- Recreating private strategy logic or prompts.
- Building a production trading dashboard.
- Building an order-management, backtesting, or live trading system.
- Migrating the Vite app or expanding app routes unless explicitly rescoped.

## First Implementation Tasks After Unpause

1. Researcher: produce a bundled Hex + ClickHouse handoff for drawdown attribution patterns, risk metrics, and safe Hex AI prompt patterns over synthetic data.
2. Backend: define ClickHouse schema, deterministic synthetic seed/load flow, and canonical drawdown attribution SQL for the five approved entities.
3. PM: review Backend/Research outputs against privacy and demo acceptance criteria.
4. Fullstack: stay paused unless PM/CTO asks for a minimal fallback/demo wrapper after the Hex path is defined.

## Demo Acceptance Criteria

- The demo can answer "which strategy caused the drawdown?" from synthetic ClickHouse data in Hex.
- The answer is supported by strategy contribution, fill/execution, signal quality, and market context outputs.
- The synthetic drawdown is deterministic and reproducible from the seed/load path.
- The ClickHouse schema and canonical SQL do not require access to private repos, prompts, keys, real trades, or strategy logic.
- The Hex handoff is understandable without inspecting app code.
- Any AI-generated explanation is grounded in visible synthetic query outputs and includes no private trading claims.
- Frontend/app work remains out of scope unless separately approved.
