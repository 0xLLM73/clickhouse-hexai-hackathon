# Hex Final Polish

Use this file to add the final low-credit improvements manually in Hex. No Hex
AI credits are required; paste the text and SQL into the Hex editor.

## Answer Tab Banner

Paste this near the top of the **Answer** tab:

```text
Synthetic ClickHouse data only. This app does not use live trading data,
private strategy logic, real accounts, broker data, exchange data, or
investment/trading advice.
```

## Judge Summary Tile

Paste this as a text tile or markdown cell in the **Answer** tab:

```text
Finding: momentum_breakout caused the synthetic drawdown.

Window: 2026-01-14 to 2026-01-18
Concentration: BETA_SYN
Regime: risk_off
Evidence: largest max drawdown, largest negative PnL contribution, elevated
slippage/taker fills, and higher exposure during the drawdown window.
Decision: review or pause synthetic momentum_breakout exposure to BETA_SYN
before expanding the strategy.
```

Optional SQL-backed version: add query 8 from `clickhouse/queries.sql` and show
it as a compact table/card group.

## Waterfall Attribution

Add query 9 from `clickhouse/queries.sql`.

Recommended chart:

- Type: bar or waterfall-style bar chart.
- X axis: `strategy_id`
- Y axis: `pnl_change`
- Color: `contribution_type`
- Sort: ascending `pnl_change`

Expected result: `momentum_breakout` is the large negative bar; the other
strategies are small offsets.

## Why Not The Other Strategies?

Add query 10 from `clickhouse/queries.sql`.

Recommended table columns:

- `strategy_id`
- `max_drawdown_pct`
- `pnl_change`
- `drawdown_contribution_pct`
- `realized_pnl`
- `avg_slippage_bps`
- `taker_fill_rate`
- `avg_gross_exposure_ratio`
- `interpretation`

Expected result: the table explains why `momentum_breakout` is the culprit and
why `mean_reversion_alpha` / `volatility_carry` are secondary or offsetting.

## Reproducibility Section

Add query 11 from `clickhouse/queries.sql` to the **SQL** tab.

Recommended display:

- Table name.
- Row count.
- Minimum timestamp.
- Maximum timestamp.

Add this note above the table:

```text
These row counts prove the published app is backed by the five approved
synthetic ClickHouse tables. The expected answer remains deterministic:
momentum_breakout caused the drawdown, concentrated in BETA_SYN during the
2026-01-14 to 2026-01-18 risk_off window.
```

## Fallback Screenshots

Take screenshots after adding the polish:

- Answer tab with the banner, judge summary, equity curve, and final AI summary.
- Attribution tab with strategy contribution/waterfall evidence.
- Evidence tab with execution quality and why-not comparison.
- SQL tab with the reproducibility table.

Save them outside git unless the hackathon submission asks for attachments.
