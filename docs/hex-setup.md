# Hex Setup

Use this to build the Hex project for **Trading Strategy Evaluation Lab**.

The hackathon submission is a complete data project in Hex using ClickHouse.
Hex API automation is not required for the primary submission path.

## ClickHouse Connection

Create a ClickHouse data connection in Hex.

Use these fields from the hackathon ClickHouse service:

- Host: `apa4k68ccy.us-west-2.aws.clickhouse.cloud`
- Database: `default`
- Username: `default`
- Password: use the current ClickHouse database password from local `.env`
- SSL/TLS: enabled

Port depends on the Hex connector UI:

- Try `9440` if Hex asks for the native secure ClickHouse port.
- Try `8443` if Hex asks for HTTPS/HTTP interface settings.

After connection succeeds, refresh schema metadata and limit Hex AI context to
these five synthetic tables:

- `signals`
- `orders`
- `fills`
- `portfolio_snapshots`
- `market_candles`

Do not include private trading data, Trading-Boy references, exchange accounts,
broker data, keys, real positions, or real PnL.

## Project Structure

Create one Hex project named:

```text
Trading Strategy Evaluation Lab
```

Recommended App tabs:

1. **Answer**
   - Portfolio equity curve.
   - Max drawdown summary.
   - Final AI answer.

2. **Attribution**
   - Strategy contribution ranking.
   - Strategy/symbol/regime contribution table.

3. **Evidence**
   - Execution quality table.
   - Signal quality table.
   - Risk exposure table.

4. **SQL**
   - Collapsed or visible SQL cells copied from `clickhouse/queries.sql`.

## SQL Cells

Copy the canonical cells from:

```text
clickhouse/queries.sql
```

Use the cells in this order:

1. Portfolio equity curve.
2. Max drawdown by strategy.
3. Drawdown attribution by strategy.
4. Strategy/symbol/regime attribution from fills.
5. PnL by symbol.
6. Risk exposure during the drawdown window.
7. Signal quality for `momentum_breakout` / `BETA_SYN`.

Expected deterministic answer:

```text
momentum_breakout caused the synthetic drawdown, concentrated in BETA_SYN
during the 2026-01-14 through 2026-01-18 risk_off window.
```

## Hex AI Prompt

Use this prompt in Hex Notebook Agent or the Generative Data App builder after
the ClickHouse connection is available:

```text
Build a complete Hex data project called Trading Strategy Evaluation Lab.

Goal:
Use ClickHouse data to answer: Which strategy caused the drawdown?

Use only these ClickHouse tables:
- signals
- orders
- fills
- portfolio_snapshots
- market_candles

Privacy boundary:
All data is synthetic. Do not reference private trading systems, real trades,
real accounts, private strategy logic, private prompts, broker data, exchange
data, credentials, production systems, or investment advice.

Expected deterministic answer:
momentum_breakout caused the drawdown. The loss is concentrated in BETA_SYN
during the 2026-01-14 through 2026-01-18 risk_off window, supported by max
drawdown, negative realized PnL, elevated slippage/taker fills, and higher
exposure.

Create a notebook and app with these sections:
1. Answer: portfolio equity curve, max drawdown summary, culprit strategy, and
   final AI summary.
2. Attribution: strategy contribution ranking plus strategy/symbol/regime
   attribution.
3. Evidence: execution quality, signal quality, market context, and risk
   exposure tables.
4. SQL: visible or collapsible SQL cells so reviewers can see ClickHouse as the
   evidence layer.

Use SQL cells against ClickHouse. Prefer concise charts and tables:
- line chart for portfolio equity curve
- ranked table for max drawdown by strategy
- bar chart for drawdown contribution by strategy
- table for strategy/symbol/regime attribution
- table for execution quality
- table for signal quality
- table for risk exposure

Final AI summary prompt:
Using only visible synthetic query outputs in this Hex project, answer which
strategy caused the drawdown. Cite the strategy, symbol, time window,
drawdown/PnL evidence, exposure evidence, and execution-quality evidence.
```

Use this shorter prompt after query outputs are visible:

```text
Using only the synthetic query outputs shown in this Hex project, answer:
which strategy caused the drawdown? Cite the strategy, symbol, time window,
drawdown/PnL evidence, exposure evidence, and execution-quality evidence.
Do not reference private trading systems, real trades, real accounts, private
strategy logic, or anything outside these synthetic ClickHouse tables.
```

## Local Env After Project Creation

Once the Hex project exists, update local `.env`:

```env
HEX_PROJECT_URL=https://app.hex.tech/019eb827-2a68-72b8-a46d-dba6bc46cd2e/app/Trading-Strategy-Evaluation-Lab-033WhiRrYfY6YugmSpdB8W/latest
HEX_PROJECT_ID=019eb848-2e32-77f8-991b-aaa5018c75b4
HEX_API_KEY=
```

`HEX_PROJECT_URL` is the only required value for the demo link. `HEX_API_KEY`
and `HEX_PROJECT_ID` are optional unless we add API automation. If API access is
not available in the workspace, continue manually in Hex; the hackathon scope
does not require a Hex API key.

Hex ID reference:

- `019eb827-2a68-72b8-a46d-dba6bc46cd2e`: workspace/org ID from the URL.
- `Trading-Strategy-Evaluation-Lab-033WhiRrYfY6YugmSpdB8W`: project URL slug.
- `019eb848-2e32-77f8-991b-aaa5018c75b4`: API project ID.
