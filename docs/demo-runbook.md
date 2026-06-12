# Demo Runbook

Working title: **Trading Strategy Evaluation Lab**

This runbook is the concise live demo path for the ClickHouse + Hex AI hackathon. Hex is the primary surface. ClickHouse is the analytical store. The repo supports schema, synthetic data, canonical SQL, and handoff docs only unless PM/CTO separately approve a fallback app wrapper.

## Demo Goal

Answer one question from synthetic ClickHouse data in Hex:

- Which strategy caused the drawdown?

The demo is successful if the presenter can show:

- a deterministic portfolio drawdown window
- strategy contribution ranking for that window
- supporting evidence from fills, signals, and market context
- a visible ClickHouse query/result or Hex cell backed by ClickHouse
- a Hex AI summary grounded only in synthetic query outputs
- a clear decision about which synthetic strategy to inspect next

## Privacy Boundary

This demo must not access, request, reference, copy from, or expose the human's private AI trading tool or private trading assets.

Strict exclusions:

- No Trading-Boy repo access or references.
- No private strategy logic or prompts.
- No private keys, accounts, credentials, broker data, or exchange data.
- No real trades, positions, PnL, holdings, or account identifiers.
- No reverse engineering of private trading behavior.

All data must be synthetic or anonymized demo data created for this repo.

## Required Artifacts

The pod should build and present only these first-pass artifacts:

- ClickHouse schema for `signals`, `orders`, `fills`, `portfolio_snapshots`, and `market_candles`.
- Deterministic synthetic seed/load path with one known drawdown window.
- Canonical SQL that identifies the drawdown and ranks strategy contribution.
- Hex project with pages/cells for portfolio curve, attribution ranking, execution quality, signal quality, market context, and final explanation.
- Short handoff notes explaining setup, expected outputs, and the privacy boundary.

## Opening Script

"We are reviewing a synthetic multi-strategy portfolio after a drawdown. The question is not whether the portfolio fell; the question is which strategy caused the loss and what evidence supports that conclusion. We are using ClickHouse to run fast attribution queries across synthetic signals, orders, fills, portfolio snapshots, and market candles, then using Hex AI to summarize the visible query outputs into a review-ready explanation."

## Run-Of-Show

| Time | Action | Presenter notes |
| --- | --- | --- |
| 0:00-0:30 | State the privacy boundary and demo question. | Synthetic data only; no private trading tool access; core question is "which strategy caused the drawdown?" |
| 0:30-1:15 | Show portfolio equity curve and drawdown window in Hex. | Point to the deterministic window and baseline/low-watermark dates. |
| 1:15-2:00 | Run or show strategy contribution ranking. | Identify the primary culprit strategy and secondary contributors. |
| 2:00-2:45 | Drill into fills and execution quality. | Show slippage, fees, liquidity flag, or execution timing evidence. |
| 2:45-3:30 | Drill into signals and market context. | Compare confidence, side, market regime, and candle volatility around the window. |
| 3:30-4:15 | Generate the Hex AI explanation. | The explanation must cite visible synthetic outputs, not hidden logic. |
| 4:15-5:00 | Close with decision and next check. | Name the strategy to inspect and the concrete follow-up analysis. |

## Golden Prompts

Use these exactly for the live demo. They are intentionally narrow so the answers stay deterministic.

1. "Which strategy contributed most to the drawdown window, and how large was its contribution?"
   - Expected result: a ranked strategy contribution table where one synthetic strategy is the clear primary contributor.
   - Talking point: ClickHouse attributes the portfolio move by strategy over the selected window.

2. "For the top contributing strategy, which symbols and market regimes explain the loss?"
   - Expected result: a breakdown by `symbol` and `market_regime`, with one or two rows explaining most of the drawdown.
   - Talking point: the workflow moves from portfolio-level loss to a targeted investigation path.

3. "Summarize the drawdown review with supporting evidence and the next risk check."
   - Expected result: a concise Hex AI explanation citing strategy contribution, fill quality, signal quality, and market context outputs.
   - Talking point: Hex AI turns visible query results into review language while ClickHouse remains the evidence layer.

## ClickHouse Talking Points

- ClickHouse is the analytical engine over synthetic high-volume trading evaluation data.
- The approved entities are `signals`, `orders`, `fills`, `portfolio_snapshots`, and `market_candles`.
- The canonical query path should identify the drawdown window, rank strategy contribution, then support drilldowns by symbol, market regime, execution quality, and signal quality.
- Keep SQL or result tables visible so the audience sees that the answer comes from ClickHouse-backed synthetic data.

## Hex AI Talking Points

- Hex is the primary demo surface for analysis, visualization, and explanation.
- Hex AI may summarize, label, and explain visible query outputs.
- Hex AI must not infer or invent private strategy logic.
- Prompts should stay constrained to the synthetic dataset and visible result tables.

## Fallback Plan

The preferred fallback is saved Hex outputs or cached synthetic ClickHouse query results. Switch to fallback mode immediately if any live step takes more than 30 seconds or fails twice.

| Failure | Trigger | Fallback |
| --- | --- | --- |
| ClickHouse connection fails | Hex or local client cannot reach ClickHouse. | Use saved query outputs or screenshots from the synthetic dataset. Say: "For demo continuity, we are showing the same synthetic query contract from cached results." |
| Query is slow or errors | Any golden prompt query exceeds 30 seconds or returns an error. | Show the canonical SQL and the saved result table for the drawdown window. |
| Hex project is unavailable | Hex login, connection, project run, or AI feature fails twice. | Demo from saved screenshots/query outputs and read the scripted explanation below. |
| Data ambiguity appears | Strategy ranking does not show a clear culprit. | Use the deterministic seed expected-output notes and flag this as a seed/regression issue, not a product behavior question. |

## Mock AI Answers

Use these if Hex AI is unavailable.

Prompt 1 answer:

"The primary synthetic contributor to the drawdown is the top-ranked strategy in the drawdown attribution table. Its contribution is materially larger than the secondary contributors, which makes it the first strategy to inspect."

Prompt 2 answer:

"The loss is concentrated in the top strategy's largest symbol and market-regime rows during the drawdown window. The supporting evidence is the combination of negative portfolio contribution, worse fill quality, and adverse market candle context."

Prompt 3 answer:

"Drawdown review: the portfolio decline is primarily attributable to one synthetic strategy during the highlighted window. Evidence comes from the strategy contribution ranking, execution-quality drilldown, signal-quality comparison, and market-regime context. Next action: inspect risk limits and execution assumptions for that strategy before expanding the analysis to secondary contributors."

## Presenter Checklist

- Confirm the demo uses only synthetic/anonymized data.
- Confirm no private trading repo, prompt, key, trade, position, or account information is referenced.
- Confirm ClickHouse schema and seed/load path are ready or saved outputs are available.
- Confirm canonical drawdown attribution SQL returns a deterministic culprit strategy.
- Confirm Hex has pages/cells for portfolio curve, attribution ranking, fill quality, signal quality, market context, and final explanation.
- Keep this runbook open with the saved fallback outputs.

## Close

"The decision is not just that the portfolio drew down. We identified which synthetic strategy caused most of the loss, showed the supporting execution, signal, and market evidence in ClickHouse-backed analysis, and used Hex AI to produce a review-ready next action without touching any private trading system."
