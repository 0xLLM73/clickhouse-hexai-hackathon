# ClickHouse + Hex AI Research Brief

## Recommended Demo Path

MVP: build **Trading Strategy Evaluation Lab** as a Hex-first ClickHouse analytics project.

The demo answers one question:

- Which strategy caused the drawdown?

Use only deterministic synthetic data from this repo. Do not access or reference
Trading-Boy, private trading logic, private prompts, real trades, accounts,
positions, keys, or exchange/broker data.

## Live Flow

1. Load the five synthetic tables into ClickHouse:
   - `signals`
   - `orders`
   - `fills`
   - `portfolio_snapshots`
   - `market_candles`
2. Connect Hex directly to the ClickHouse database with a read-only demo user.
3. In Hex, curate the data connection/table context so AI sees only the five
   approved synthetic tables.
4. Build one Hex project/app with:
   - portfolio equity curve
   - max drawdown table
   - strategy attribution ranking
   - strategy/symbol/market-regime drilldown
   - execution quality table
   - signal quality table
   - market context table
   - final AI summary
5. Close with the deterministic expected answer:
   - `momentum_breakout` caused the synthetic drawdown
   - the loss is concentrated in `BETA_SYN`
   - the drawdown window is `2026-01-14` through `2026-01-18`
   - supporting evidence includes `risk_off` market regime, elevated slippage,
     taker fills, and increased exposure.

## Hex Context Setup

Use concise descriptions in Hex's data browser or connection metadata.

Connection description:

```text
Synthetic ClickHouse dataset for a hackathon trading strategy evaluation demo.
Use only these tables to answer which strategy caused a deterministic drawdown.
No table contains real trades, accounts, positions, keys, or private strategy logic.
```

Table descriptions:

```text
signals: Synthetic strategy signals before order creation. Use for signal quality, confidence, side, signal family, and market-regime analysis.
orders: Synthetic orders generated from signals. Use for order status, order type, quantity, and signal-to-execution joins.
fills: Synthetic fills for executed orders. Use for realized PnL, fees, slippage, liquidity flag, and execution-quality analysis.
portfolio_snapshots: Synthetic daily strategy portfolio state. Use for equity curve, max drawdown, strategy attribution, gross exposure, net exposure, realized PnL, and unrealized PnL.
market_candles: Synthetic market context by symbol. Use for volatility, market regime, volume, and price movement during the drawdown window.
```

Column context to emphasize:

- `strategy_id`: synthetic strategy label, not a private strategy name.
- `symbol`: synthetic instrument label such as `ALPHA_SYN`, `BETA_SYN`, or `GAMMA_SYN`.
- `market_regime`: synthetic market condition label such as `trend` or `risk_off`.
- `realized_pnl` / `unrealized_pnl`: synthetic demo values only.
- `slippage_bps`: synthetic execution-quality signal.
- `gross_exposure` / `net_exposure`: synthetic risk exposure metrics.

## Golden Hex AI Prompt

Use this after the ClickHouse-backed tables/charts are visible in Hex:

```text
Using only the synthetic ClickHouse query outputs visible in this Hex project,
answer: which strategy caused the drawdown?

Cite the strategy, symbol, drawdown window, PnL/drawdown evidence, exposure
evidence, execution-quality evidence, and market-regime evidence.

Do not reference private trading systems, real trades, accounts, keys, positions,
private prompts, or private strategy logic.
```

## Technical Hooks

### 1. Direct ClickHouse + Hex SQL Analytics

Status: MVP.

What we show live:

- Hex connected to ClickHouse.
- SQL cells copied from `clickhouse/queries.sql`.
- Charts and tables grounded in synthetic ClickHouse outputs.
- Hex AI summary constrained to visible outputs.

Build guidance:

- Keep only the five approved tables in Hex AI context.
- Prefer prepared SQL cells and narrow prompts over open-ended exploration.
- Keep the SQL visible in at least one tab or collapsed section for judge review.

### 2. Curated AI Context In Hex

Status: MVP.

What we show live:

- Hex AI understands the synthetic tables because they are named, described,
  and scoped tightly.
- The AI answer cites visible outputs instead of inventing strategy logic.

Build guidance:

- Refresh Hex schema metadata after loading the ClickHouse tables.
- Endorse/include only the five approved tables if the workspace supports it.
- Exclude unrelated schemas/tables from AI context.

### 3. chDB-In-Hex Follow-Up

Status: stretch.

What we show live if available:

- A Python cell uses chDB/DataStore-style analysis for a filtered, already
  aggregated result.

Build guidance:

- Keep the MVP in ClickHouse SQL cells.
- Use chDB only if the Hex workspace supports it cleanly before demo rehearsal.
- Do not materialize large results into Pandas.

### 4. ClickHouse MCP

Status: stretch.

What we show live if already configured:

- An external AI client queries the same synthetic ClickHouse tables through
  ClickHouse MCP.

Build guidance:

- Do not put MCP on the critical path.
- Use the same privacy boundary and synthetic tables only.

## Risks And Constraints

- Live ClickHouse and Hex credentials must stay in local `.env` or provider UI,
  never in git or chat.
- Hex AI quality depends on narrow schema context. Exposing unrelated tables will
  weaken the answer.
- The demo is analytics only. It is not live trading, investment advice,
  portfolio management, or production risk tooling.
- The current Vite app is optional fallback work only; the primary submission is
  the Hex project plus ClickHouse artifacts.

## Source Docs

- Hex ClickHouse integration: https://hex.tech/product/integrations/clickhouse/
- Hex data connections: https://learn.hex.tech/docs/connect-to-data/data-connections/data-connections-introduction
- Hex SQL cells: https://learn.hex.tech/docs/explore-data/cells/sql-cells/sql-cells-introduction
- Hex App builder: https://learn.hex.tech/docs/share-insights/apps/app-builder
- Hex AI overview: https://learn.hex.tech/docs/getting-started/ai-overview
- ClickHouse window functions: https://clickhouse.com/docs/sql-reference/window-functions
- ClickHouse HTTP interface: https://clickhouse.com/docs/interfaces/http
- ClickHouse network ports: https://clickhouse.com/docs/guides/sre/network-ports
