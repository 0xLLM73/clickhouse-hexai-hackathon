# Hex Agent Prompt

Paste this into Hex Notebook Agent or the Generative Data App builder.

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

If Hex needs explicit SQL, copy the canonical cells from
`clickhouse/queries.sql` in this repo.
