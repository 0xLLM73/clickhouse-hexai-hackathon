# Trading Strategy Evaluation Lab Hex Handoff

Hex is the primary demo surface. This repo provides the ClickHouse artifacts
needed for the project; it does not require app/runtime work or private trading
system access.

## Privacy Statement

All tables, symbols, strategies, PnL values, and market regimes are synthetic.
The project must not reference Trading-Boy, private strategy logic, private
prompts, private keys, real accounts, broker data, exchange data, real trades,
real positions, or real PnL.

## Recommended Hex Pages

1. **Overview**
   - Query: portfolio equity curve from `clickhouse/queries.sql`.
   - Visual: line chart of `total_portfolio_value` by `snapshot_date`.
   - Highlight: drawdown window from `2026-01-14` through `2026-01-18`.

2. **Max Drawdown**
   - Query: max drawdown by strategy.
   - Visual: ranked table.
   - Expected top row: `momentum_breakout`.

3. **Attribution**
   - Query: drawdown attribution by strategy and by strategy/symbol/regime.
   - Visuals: contribution table and bar chart by `realized_pnl`.
   - Expected culprit: `momentum_breakout` / `BETA_SYN` / `risk_off`.

4. **Execution Quality**
   - Query: fills-based attribution and symbol PnL.
   - Visuals: slippage/fee table and PnL by symbol.
   - Expected evidence: elevated `avg_slippage_bps`, taker fills, and negative
     realized PnL for `BETA_SYN`.

5. **Risk Exposure**
   - Query: exposure during the drawdown window.
   - Visuals: gross and net exposure ratios by strategy.
   - Expected evidence: `momentum_breakout` carries the highest synthetic
     exposure during the drawdown window.

6. **AI Summary**
   - Prompt Hex AI only with visible query outputs from the synthetic tables.
   - The summary should cite strategy, symbol, window, PnL, exposure, slippage,
     and market regime. It must not infer private strategy logic.

## Safe AI Prompt

Use this prompt in Hex after the tables/charts above are visible:

```text
Using only the synthetic query outputs shown in this Hex project, answer:
which strategy caused the drawdown? Cite the strategy, symbol, time window,
drawdown/PnL evidence, exposure evidence, and execution-quality evidence.
Do not reference private trading systems, real trades, real accounts, private
strategy logic, or anything outside these synthetic ClickHouse tables.
```

## Expected Narrative

`momentum_breakout` caused the synthetic drawdown. The drawdown is concentrated
from `2026-01-14` through `2026-01-18`, with the weakest PnL and largest max
drawdown for that strategy. The supporting evidence is concentrated in
`BETA_SYN` fills during a `risk_off` regime, where slippage and taker fill rate
are elevated and risk exposure is higher than the other synthetic strategies.

## Presenter Close

The decision is to review or pause the synthetic `momentum_breakout` exposure to
`BETA_SYN` before expanding the strategy. The demo answer comes only from
ClickHouse-backed synthetic tables and Hex-visible outputs.
