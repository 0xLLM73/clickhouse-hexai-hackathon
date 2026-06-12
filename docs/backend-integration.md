# ClickHouse Trading Backend Contract

This is the backend-owned data contract for **Trading Strategy Evaluation Lab**.
The demo is Hex-first: this repo supplies ClickHouse schema, deterministic
synthetic load data, canonical SQL, and handoff notes. Runtime/app work remains
paused unless PM/CTO explicitly rescope it.

## Privacy Boundary

All data and analysis in this contract is synthetic demo material.

Do not access, request, reference, copy from, or expose:

- Trading-Boy or any private trading repo.
- Private strategy logic, prompts, keys, accounts, credentials, broker data, or exchange data.
- Real trades, real positions, real PnL, or real account identifiers.

## Approved Entities

The ClickHouse contract uses exactly these synthetic entities:

- `signals`: synthetic model decisions emitted before orders.
- `orders`: synthetic orders created from signals.
- `fills`: synthetic executions for orders.
- `portfolio_snapshots`: synthetic strategy portfolio state over time.
- `market_candles`: synthetic market context for demo symbols.

The deterministic seed makes one drawdown intentionally attributable to:

- strategy: `momentum_breakout`
- symbol: `BETA_SYN`
- window: `2026-01-14` through `2026-01-18`

Secondary contributors exist for realism, but the expected answer remains clear:
`momentum_breakout` caused the drawdown, with `BETA_SYN` risk-off market context,
higher slippage, and negative realized PnL as supporting evidence.

## Environment Variables

Live credentials are optional. Mock/planning work does not require secrets.

- `CLICKHOUSE_PROTOCOL`: `https` for ClickHouse Cloud, `http` for local non-TLS.
- `CLICKHOUSE_HOST`: ClickHouse hostname without protocol.
- `CLICKHOUSE_PORT`: `8443` for ClickHouse Cloud HTTPS, `8123` for local HTTP.
- `CLICKHOUSE_USER`: Least-privilege demo user.
- `CLICKHOUSE_PASSWORD`: Demo user password.
- `CLICKHOUSE_DATABASE`: Demo database name.
- `CLICKHOUSE_SECURE`: `true` for TLS endpoints.
- `HEX_PROJECT_URL`: optional link to the Hex project once created.

## Files

- `clickhouse/schema.sql`: creates the five approved ClickHouse tables.
- `clickhouse/seed.sql`: truncates and reloads deterministic synthetic demo data.
- `clickhouse/queries.sql`: canonical analysis SQL for Hex and reviewer validation.
- `docs/trading-hex-handoff.md`: recommended Hex page/query layout and demo flow.

## Load Steps

1. Create a local `.env` from `.env.example` if using a live or local ClickHouse service.
2. Create the target ClickHouse database if it does not already exist.
3. Apply schema:

```sh
clickhouse client --host "$CLICKHOUSE_HOST" --secure --port "$CLICKHOUSE_PORT" \
  --user "$CLICKHOUSE_USER" --password "$CLICKHOUSE_PASSWORD" \
  --database "$CLICKHOUSE_DATABASE" --multiquery < clickhouse/schema.sql
```

4. Load synthetic data:

```sh
clickhouse client --host "$CLICKHOUSE_HOST" --secure --port "$CLICKHOUSE_PORT" \
  --user "$CLICKHOUSE_USER" --password "$CLICKHOUSE_PASSWORD" \
  --database "$CLICKHOUSE_DATABASE" --multiquery < clickhouse/seed.sql
```

5. Run canonical queries:

```sh
clickhouse client --host "$CLICKHOUSE_HOST" --secure --port "$CLICKHOUSE_PORT" \
  --user "$CLICKHOUSE_USER" --password "$CLICKHOUSE_PASSWORD" \
  --database "$CLICKHOUSE_DATABASE" --multiquery < clickhouse/queries.sql
```

For local non-TLS ClickHouse, use `CLICKHOUSE_PROTOCOL=http`,
`CLICKHOUSE_PORT=8123`, `CLICKHOUSE_SECURE=false`, and remove `--secure` from
the client commands.

## Canonical SQL Coverage

`clickhouse/queries.sql` includes:

- Portfolio equity curve for Hex line charts.
- Max drawdown by strategy.
- Drawdown attribution by strategy for the deterministic window.
- Drawdown attribution by strategy, symbol, and market regime using fills.
- PnL by symbol.
- Risk exposure by strategy during the drawdown window.
- Signal quality drilldown for `momentum_breakout` and `BETA_SYN`.
- Judge summary values for the Answer tab.
- Waterfall-style drawdown attribution.
- Why-not comparison across strategies.
- Reproducibility row counts for the SQL tab.

## Expected Hex Answer

The Hex project should answer:

> Which strategy caused the drawdown?

Expected response, grounded only in synthetic query outputs:

`momentum_breakout` is the primary drawdown contributor. The evidence is the
largest max drawdown and negative PnL change in the 2026-01-14 to 2026-01-18
window, concentrated in `BETA_SYN` fills during a synthetic `risk_off` market
regime with elevated slippage and increased gross/net exposure.
