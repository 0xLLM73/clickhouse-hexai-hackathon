# Hex-First Trading Analytics App Guide

Date: `2026-06-11`

## Scope

This guide turns the current sprint decision into a compact Hex implementation path for **Trading Strategy Evaluation Lab**.

Core demo question:

- Which strategy caused the drawdown?

Authoritative local scope:

- `docs/demo-decision.md`
- `docs/mvp-demo-plan.md`

Privacy boundary:

- Use only synthetic/anonymized demo data.
- Use only `signals`, `orders`, `fills`, `portfolio_snapshots`, and `market_candles`.
- Do not access, reference, copy from, or infer anything from Trading-Boy or any private trading system.
- Do not include private strategy logic, private prompts, real trades, broker data, exchange data, credentials, account identifiers, real positions, or real PnL.

## Recommended Hex Project Flow

Build a single Hex project with Notebook view as the implementation surface and App view as the presenter surface.

1. **Overview**
   - Inputs: analysis date range, strategy selector, symbol selector, optional benchmark toggle.
   - Output cards: portfolio value, max drawdown, drawdown start, drawdown trough, peak-to-trough loss, recovery gap.
   - Chart: portfolio equity curve with selected drawdown window highlighted.

2. **Drawdown Window**
   - SQL cell computes portfolio running peak, drawdown percentage, drawdown start/trough/recovery candidates from `portfolio_snapshots`.
   - Table: one selected drawdown window with `window_start`, `trough_time`, `window_end`, `peak_value`, `trough_value`, `drawdown_pct`, and `drawdown_value`.
   - App behavior: users see the time window before any attribution claim is made.

3. **Strategy Attribution**
   - SQL cell ranks synthetic strategies by PnL change during the selected drawdown.
   - Table: `strategy_id`, `pnl_delta`, `drawdown_share_pct`, `rank`, `gross_exposure`, `net_exposure`.
   - Chart: horizontal bar chart sorted by largest negative contribution.
   - Expected demo answer: one culprit strategy ranks first with a clear loss share, while secondary contributors remain plausible but smaller.

4. **Execution Quality**
   - SQL cell joins `orders` and `fills` inside the drawdown window.
   - Table/chart: fees, average slippage bps, p95 slippage bps, fill count, total quantity, liquidity mix, adverse-fill count.
   - Purpose: show whether the culprit strategy lost because of execution drag, not just signal direction.

5. **Signal Quality**
   - SQL cell groups `signals` by `strategy_id`, `signal_family`, `side`, confidence bucket, and market regime.
   - Table: signal count, average confidence, realized contribution proxy, hit-rate proxy, losing-signal share.
   - Purpose: show whether high-confidence synthetic signals were wrong during the drawdown.

6. **Market Context**
   - SQL cell summarizes `market_candles` across the drawdown by symbol and market regime.
   - Chart/table: volatility, return over window, volume, regime label, affected symbols.
   - Purpose: separate strategy-specific failure from broad synthetic market stress.

7. **AI Summary**
   - Hex AI summarizes only visible query outputs from the project.
   - Output: concise answer naming the culprit strategy, evidence from the attribution/execution/signal/market tables, confidence level, and next check.
   - The AI cell must include a visible privacy note that the analysis is synthetic and not derived from real trades or private systems.

## Recommended App Layout

Publish the Hex App with tabs rather than a separate frontend.

Tab 1: **Answer**

- Top cards: max drawdown, culprit strategy, loss share, trough date.
- Equity curve with drawdown band.
- AI summary box grounded in the visible output tables.

Tab 2: **Attribution**

- Strategy contribution ranking.
- Symbol/regime contribution table.
- Toggle or filter for date range and strategy.

Tab 3: **Evidence**

- Execution quality table.
- Signal quality table.
- Market context table.

Tab 4: **SQL**

- Collapsed but accessible SQL cells for the drawdown window and attribution queries.
- This is useful for judges/devs who want to see ClickHouse doing the analytical work.

## Chart And Table Checklist

Must-have:

- Portfolio equity curve with highlighted drawdown window.
- Strategy contribution bar chart.
- Attribution table by strategy, symbol, and market regime.
- Execution quality table with slippage and fee drag.
- Signal quality table by confidence bucket and signal family.
- Market context table with volatility and regime fields.
- AI summary that cites the output tables/cells.

Nice-to-have:

- Drawdown duration/recovery timeline.
- Waterfall chart from peak value to trough value by strategy.
- Strategy filter parameter.
- Symbol filter parameter.
- Benchmark-relative drawdown card.
- Sharpe-like or volatility-adjusted return card for synthetic data only.

Avoid:

- Live trading controls.
- Order-management language.
- Claims about real account performance.
- Explanations that imply private strategy internals.

## ClickHouse Connection Setup

Primary path:

1. Create or use a ClickHouse database containing only the five synthetic tables.
2. Create a dedicated read-only user for Hex.
3. In Hex, create a workspace data connection if available; otherwise use a project-level connection.
4. Select the ClickHouse connection in SQL cells.
5. Refresh schema metadata after loading tables.
6. Filter or endorse only the five approved tables so Hex AI has a small, high-quality context.

Port guidance:

- Browser/server HTTP clients commonly use ClickHouse HTTPS on `8443`.
- Hex's ClickHouse integration asks for the secure native protocol port, typically `9440`.
- Do not reuse the repo's `CLICKHOUSE_PORT=8443` value for Hex unless the specific client path supports HTTP.

Current source links:

- ClickHouse + Hex integration: https://clickhouse.com/integrations/hex
- Hex data connections: https://learn.hex.tech/docs/connect-to-data/data-connections/data-connections-introduction
- Hex SQL cells: https://learn.hex.tech/docs/explore-data/cells/sql-cells/sql-cells-introduction
- Hex App builder: https://learn.hex.tech/docs/share-insights/apps/app-builder
- Hex AI overview: https://learn.hex.tech/docs/getting-started/ai-overview
- Hex Threads: https://learn.hex.tech/docs/explore-data/threads
- Hex Chat with App: https://learn.hex.tech/docs/explore-data/chat-with-app
- ClickHouse window functions: https://clickhouse.com/docs/sql-reference/window-functions
- ClickHouse HTTP interface: https://clickhouse.com/docs/interfaces/http
- ClickHouse network ports: https://clickhouse.com/docs/guides/sre/network-ports

## Minimum Repo Project Structure

Keep repo work planning-first unless PM/CTO explicitly re-scope runtime work.

Minimum useful structure:

```text
clickhouse/
  schema.sql          # five synthetic trading tables
  seed.sql            # deterministic synthetic drawdown dataset
  queries.sql         # canonical drawdown/attribution SQL for Hex
docs/
  demo-decision.md
  mvp-demo-plan.md
  hex-first-trading-analytics-guide.md
  demo-runbook.md    # update only after PM accepts the Hex flow
```

Optional only after the Hex path is stable:

```text
scripts/
  run_hex_project.*   # trigger/poll a Hex project run using HEX_API_KEY and HEX_PROJECT_ID
```

Do not add a separate dashboard or app route unless PM/CTO explicitly asks for a fallback wrapper.

## Canonical SQL Cells

### Drawdown Window

Use `portfolio_snapshots` as the source of truth for the selected drawdown. The exact field names may be tightened by Backend, but the cell should follow this shape:

```sql
WITH portfolio_daily AS (
    SELECT
        snapshot_time,
        sum(portfolio_value) AS portfolio_value,
        sum(realized_pnl) AS realized_pnl,
        sum(unrealized_pnl) AS unrealized_pnl
    FROM portfolio_snapshots
    GROUP BY snapshot_time
),
drawdowns AS (
    SELECT
        snapshot_time,
        portfolio_value,
        max(portfolio_value) OVER (
            ORDER BY snapshot_time
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_peak,
        portfolio_value - running_peak AS drawdown_value,
        round((portfolio_value - running_peak) / nullIf(running_peak, 0), 6) AS drawdown_pct
    FROM portfolio_daily
)
SELECT
    minIf(snapshot_time, drawdown_value < 0) AS window_start,
    argMin(snapshot_time, drawdown_pct) AS trough_time,
    min(drawdown_pct) AS max_drawdown_pct,
    min(drawdown_value) AS peak_to_trough_loss
FROM drawdowns;
```

### Strategy Attribution

```sql
WITH selected_window AS (
    SELECT
        toDateTime({{ window_start }}) AS window_start,
        toDateTime({{ trough_time }}) AS trough_time
),
strategy_pnl AS (
    SELECT
        strategy_id,
        min(snapshot_time) AS first_snapshot,
        max(snapshot_time) AS last_snapshot,
        argMin(realized_pnl + unrealized_pnl, snapshot_time) AS pnl_at_start,
        argMax(realized_pnl + unrealized_pnl, snapshot_time) AS pnl_at_trough,
        avg(gross_exposure) AS avg_gross_exposure,
        avg(net_exposure) AS avg_net_exposure
    FROM portfolio_snapshots
    CROSS JOIN selected_window
    WHERE snapshot_time BETWEEN window_start AND trough_time
    GROUP BY strategy_id
),
ranked AS (
    SELECT
        strategy_id,
        pnl_at_trough - pnl_at_start AS pnl_delta,
        avg_gross_exposure,
        avg_net_exposure
    FROM strategy_pnl
)
SELECT
    strategy_id,
    pnl_delta,
    round(abs(pnl_delta) / nullIf(sumIf(abs(pnl_delta), pnl_delta < 0) OVER (), 0), 4) AS drawdown_share_pct,
    avg_gross_exposure,
    avg_net_exposure,
    row_number() OVER (ORDER BY pnl_delta ASC) AS rank
FROM ranked
ORDER BY pnl_delta ASC;
```

### Execution Quality

```sql
SELECT
    f.strategy_id,
    f.symbol,
    count() AS fill_count,
    sum(f.quantity) AS filled_quantity,
    round(sum(f.fees), 2) AS total_fees,
    round(avg(f.slippage_bps), 2) AS avg_slippage_bps,
    round(quantile(0.95)(f.slippage_bps), 2) AS p95_slippage_bps,
    countIf(f.slippage_bps > 15) AS adverse_fill_count,
    anyHeavy(f.liquidity_flag) AS dominant_liquidity_flag
FROM fills f
WHERE f.fill_time BETWEEN toDateTime({{ window_start }}) AND toDateTime({{ trough_time }})
GROUP BY f.strategy_id, f.symbol
ORDER BY total_fees DESC, p95_slippage_bps DESC;
```

### Signal Quality

```sql
SELECT
    s.strategy_id,
    s.signal_family,
    s.market_regime,
    s.side,
    multiIf(
        s.confidence >= 0.8, 'high',
        s.confidence >= 0.55, 'medium',
        'low'
    ) AS confidence_bucket,
    count() AS signal_count,
    round(avg(s.confidence), 3) AS avg_confidence,
    sumIf(f.quantity, f.fill_id != '') AS filled_quantity_proxy,
    round(avg(f.slippage_bps), 2) AS avg_followthrough_slippage_bps
FROM signals s
LEFT JOIN orders o ON o.signal_id = s.signal_id
LEFT JOIN fills f ON f.order_id = o.order_id
WHERE s.signal_time BETWEEN toDateTime({{ window_start }}) AND toDateTime({{ trough_time }})
GROUP BY
    s.strategy_id,
    s.signal_family,
    s.market_regime,
    s.side,
    confidence_bucket
ORDER BY signal_count DESC;
```

## Safe Hex AI Prompts

Use prompts that force grounding in visible synthetic outputs.

Primary prompt:

```text
Using only the visible synthetic query outputs in this Hex project, answer:
which strategy caused the selected drawdown?

Reference the Strategy Attribution, Execution Quality, Signal Quality, and Market Context outputs by name.
Do not infer private strategy logic.
Do not mention real trades, real accounts, broker data, exchange data, or any private trading system.
If the evidence is ambiguous, say what additional synthetic output would be needed.
Return: culprit strategy, supporting evidence, confidence, and next check.
```

Reviewer follow-up:

```text
Summarize the drawdown for a risk reviewer in five bullets.
Use only the synthetic tables and visible outputs in this project.
Include one bullet each for strategy attribution, execution drag, signal quality, market context, and recommended follow-up.
```

Judge-facing prompt:

```text
Explain how ClickHouse and Hex work together in this demo.
Mention that ClickHouse runs the drawdown and attribution queries over synthetic data, while Hex provides the notebook, app, charts, and AI summary layer.
Do not describe this as live trading or production investment advice.
```

## Implementation Order

1. Backend updates `clickhouse/schema.sql` to the five synthetic trading tables.
2. Backend updates `clickhouse/seed.sql` with a deterministic drawdown and one clear culprit strategy.
3. Backend updates `clickhouse/queries.sql` with the drawdown, attribution, execution, signal, and market-context cells.
4. Research/PM builds the Hex notebook using those SQL cells against a read-only ClickHouse connection.
5. PM validates the App tabs and AI prompts against the privacy boundary.
6. Validate `docs/demo-runbook.md` against the built Hex project and keep it as
   the live presenter script.

## Risks And Constraints

- The Vite app remains optional fallback work only; treat
  `docs/demo-decision.md`, `docs/mvp-demo-plan.md`, `docs/demo-runbook.md`, and
  `docs/trading-hex-handoff.md` as the active source of truth.
- Hex AI quality depends on schema metadata and a narrow endorsed context. Exposing extra tables will weaken answers.
- Live Hex/ClickHouse credentials are optional and must stay outside git.
- chDB 4 in Hex is useful for Pythonic follow-up analysis, but it is stretch; keep the MVP in SQL cells and Hex App charts.
- Do not convert large ClickHouse results into Pandas unless the result is already filtered/aggregated.
- This demo is analytics only, not backtesting, order management, trading advice, or production risk tooling.

## Acceptance Checklist

- The Hex App answers "which strategy caused the drawdown?"
- The answer is supported by at least four outputs: attribution, execution quality, signal quality, and market context.
- The culprit strategy is deterministic from synthetic seed data.
- The AI summary cites visible synthetic outputs and respects the privacy boundary.
- The ClickHouse SQL can be copied from `clickhouse/queries.sql` into Hex SQL cells.
- The app can be presented entirely in Hex without frontend/runtime work.
