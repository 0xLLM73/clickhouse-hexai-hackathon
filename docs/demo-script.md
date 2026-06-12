# Demo Script

Use this as the short presenter script for the published Hex App.

## Title

Trading Strategy Evaluation Lab

## Submission Link

Published Hex App URL: `https://app.hex.tech/019eb827-2a68-72b8-a46d-dba6bc46cd2e/app/Trading-Strategy-Evaluation-Lab-033WhiRrYfY6YugmSpdB8W/latest`

Use the published app link from Hex publish/App Builder, not the `/draft/logic`
URL.

## Opening

"This is a synthetic trading strategy evaluation project built in Hex on top of
ClickHouse. It does not use live trading data, private strategy logic, real
accounts, broker data, exchange data, or investment advice. The question is:
which strategy caused the drawdown?"

## Walkthrough

1. Open the **Answer** tab.
   - Show the portfolio equity curve.
   - Point out the `2026-01-14` to `2026-01-18` drawdown window.
   - State that the answer is backed by ClickHouse tables, not static slides.

2. Open the **Attribution** tab.
   - Show max drawdown by strategy.
   - Identify `momentum_breakout` as the top contributor.
   - Show the strategy/symbol/regime drilldown.
   - Call out `BETA_SYN` during `risk_off`.

3. Open the **Evidence** tab.
   - Show execution quality: negative PnL, elevated slippage, and taker fills.
   - Show signal quality and risk exposure.
   - Explain that the conclusion is supported by multiple independent outputs.

4. Open the **SQL** tab.
   - Show that the app is backed by SQL over ClickHouse tables:
     `signals`, `orders`, `fills`, `portfolio_snapshots`, and
     `market_candles`.

5. Return to **Answer**.
   - Read or summarize the final AI summary.
   - Confirm it says the data is synthetic and not live trading or investment
     advice.

## Close

"The synthetic drawdown is primarily attributable to `momentum_breakout`, with
loss concentrated in `BETA_SYN` during the `risk_off` window. The next action is
to review or pause that synthetic exposure before expanding the strategy."
