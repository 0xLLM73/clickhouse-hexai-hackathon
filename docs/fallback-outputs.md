# Fallback Outputs

Use these saved outputs if Hex, ClickHouse, or the network is slow during the
live demo. They come from live ClickHouse validation of `clickhouse/queries.sql`
on `2026-06-11`.

## Expected Answer

```text
momentum_breakout caused the synthetic drawdown, concentrated in BETA_SYN
during the 2026-01-14 to 2026-01-18 risk_off window.
```

## Max Drawdown By Strategy

| strategy_id | max_drawdown_pct | trough_date | peak_value_before_trough | trough_value | drawdown_amount |
| --- | ---: | --- | ---: | ---: | ---: |
| momentum_breakout | -15.48 | 2026-01-18 | 1074400 | 908100 | -166300 |
| mean_reversion_alpha | -0.11 | 2026-01-14 | 1040800 | 1039700 | -1100 |
| volatility_carry | -0.03 | 2026-01-14 | 1022800 | 1022500 | -300 |

## Drawdown Attribution

| strategy_id | start_value | end_value | pnl_change | drawdown_contribution_pct |
| --- | ---: | ---: | ---: | ---: |
| momentum_breakout | 1074400 | 908100 | -166300 | -89.36 |
| volatility_carry | 1022800 | 1030100 | 7300 | 3.92 |
| mean_reversion_alpha | 1040800 | 1053300 | 12500 | 6.72 |

## Strategy / Symbol / Regime Evidence

| strategy_id | symbol | market_regime | fill_count | realized_pnl | avg_slippage_bps | fees | taker_fill_rate |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| momentum_breakout | BETA_SYN | risk_off | 40 | -86740 | 18.5 | 1462.96 | 1 |
| volatility_carry | GAMMA_SYN | trend | 40 | 9040 | 5.02 | 309.76 | 0 |
| mean_reversion_alpha | ALPHA_SYN | trend | 40 | 22400 | 5.4 | 587.43 | 0 |

## PnL By Symbol

| symbol | fill_count | gross_realized_pnl | total_fees | avg_slippage_bps | net_pnl_after_fees |
| --- | ---: | ---: | ---: | ---: | ---: |
| BETA_SYN | 240 | -67740 | 8749.6 | 7.41 | -76489.6 |
| GAMMA_SYN | 238 | 53810 | 1844.29 | 5 | 51965.71 |
| ALPHA_SYN | 240 | 134400 | 3535.92 | 5.4 | 130864.08 |

## Judge Summary

| culprit_strategy | concentrated_symbol | market_regime | window_start | window_end | trough_date | max_drawdown_pct | realized_pnl | avg_slippage_bps | taker_fill_rate |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: |
| momentum_breakout | BETA_SYN | risk_off | 2026-01-14 | 2026-01-18 | 2026-01-18 | -15.48 | -86740 | 18.5 | 1 |

Recommended action:

```text
Review or pause synthetic momentum_breakout exposure to BETA_SYN before
expanding the strategy.
```

## Waterfall Attribution

| strategy_id | pnl_change | contribution_type | absolute_share_pct | signed_share_pct |
| --- | ---: | --- | ---: | ---: |
| momentum_breakout | -166300 | loss | 89.36 | -89.36 |
| volatility_carry | 7300 | offset | 3.92 | 3.92 |
| mean_reversion_alpha | 12500 | offset | 6.72 | 6.72 |

## Why-Not Comparison

| strategy_id | max_drawdown_pct | pnl_change | drawdown_contribution_pct | realized_pnl | avg_slippage_bps | taker_fill_rate | avg_gross_exposure_ratio | avg_net_exposure_ratio | interpretation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| momentum_breakout | -15.48 | -166300 | -89.36 | -86740 | 18.5 | 1 | 1.75 | 1.18 | Primary culprit: largest drawdown, largest negative contribution, elevated slippage and taker fills. |
| volatility_carry | -0.03 | 7300 | 3.92 | 9040 | 5.02 | 0 | 0.78 | 0.08 | Secondary contributor or offset: smaller drawdown contribution and weaker execution-risk evidence. |
| mean_reversion_alpha | -0.11 | 12500 | 6.72 | 22400 | 5.4 | 0 | 0.92 | -0.12 | Secondary contributor or offset: smaller drawdown contribution and weaker execution-risk evidence. |

## Reproducibility Counts

| table_name | row_count | min_time | max_time |
| --- | ---: | --- | --- |
| fills | 718 | 2026-01-01 10:05:00 | 2026-01-31 09:05:00 |
| market_candles | 1440 | 2026-01-01 09:30:00 | 2026-01-21 08:30:00 |
| orders | 720 | 2026-01-01 10:03:00 | 2026-01-31 09:03:00 |
| portfolio_snapshots | 63 | 2026-01-01 16:00:00 | 2026-01-21 16:00:00 |
| signals | 720 | 2026-01-01 10:00:00 | 2026-01-31 09:00:00 |
