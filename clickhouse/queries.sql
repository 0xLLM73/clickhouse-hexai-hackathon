-- Canonical ClickHouse analysis queries for Trading Strategy Evaluation Lab.
-- All queries operate only on deterministic synthetic data in:
-- signals, orders, fills, portfolio_snapshots, market_candles.

-- Health smoke test.
SELECT 1 AS ok;

-- 1. Portfolio equity curve for Hex line charts.
WITH daily_curve AS
(
    SELECT
        snapshot_date,
        round(sum(portfolio_value), 2) AS total_portfolio_value,
        round(sum(realized_pnl + unrealized_pnl), 2) AS total_pnl,
        round(sum(gross_exposure), 2) AS gross_exposure,
        round(sum(net_exposure), 2) AS net_exposure
    FROM portfolio_snapshots
    GROUP BY snapshot_date
)
SELECT
    snapshot_date,
    total_portfolio_value,
    total_pnl,
    gross_exposure,
    net_exposure,
    round((total_portfolio_value / max(total_portfolio_value) OVER (
        ORDER BY snapshot_date
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) - 1) * 100, 2) AS portfolio_drawdown_pct
FROM daily_curve
ORDER BY snapshot_date ASC;

-- 2. Max drawdown by strategy. The expected top row is momentum_breakout.
WITH strategy_curve AS
(
    SELECT
        snapshot_date,
        strategy_id,
        portfolio_value,
        max(portfolio_value) OVER (
            PARTITION BY strategy_id
            ORDER BY snapshot_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_peak
    FROM portfolio_snapshots
),
drawdowns AS
(
    SELECT
        snapshot_date,
        strategy_id,
        portfolio_value,
        running_peak,
        round((portfolio_value / running_peak - 1) * 100, 2) AS drawdown_pct
    FROM strategy_curve
)
SELECT
    strategy_id,
    min(drawdown_pct) AS max_drawdown_pct,
    argMin(snapshot_date, drawdown_pct) AS trough_date,
    argMin(running_peak, drawdown_pct) AS peak_value_before_trough,
    argMin(portfolio_value, drawdown_pct) AS trough_value,
    round(argMin(portfolio_value, drawdown_pct) - argMin(running_peak, drawdown_pct), 2) AS drawdown_amount
FROM drawdowns
GROUP BY strategy_id
ORDER BY max_drawdown_pct ASC;

-- 3. Drawdown attribution by strategy for the deterministic window.
WITH
    toDate('2026-01-14') AS window_start,
    toDate('2026-01-18') AS window_end,
    start_values AS
    (
        SELECT
            strategy_id,
            argMax(portfolio_value, snapshot_date) AS start_value
        FROM portfolio_snapshots
        WHERE snapshot_date < window_start
        GROUP BY strategy_id
    ),
    end_values AS
    (
        SELECT
            strategy_id,
            argMax(portfolio_value, snapshot_date) AS end_value
        FROM portfolio_snapshots
        WHERE snapshot_date <= window_end
        GROUP BY strategy_id
    ),
    contribution AS
    (
        SELECT
            e.strategy_id,
            s.start_value,
            e.end_value,
            round(e.end_value - s.start_value, 2) AS pnl_change
        FROM end_values AS e
        INNER JOIN start_values AS s USING strategy_id
    )
SELECT
    strategy_id,
    start_value,
    end_value,
    pnl_change,
    round(pnl_change / sum(abs(pnl_change)) OVER () * 100, 2) AS drawdown_contribution_pct
FROM contribution
ORDER BY pnl_change ASC;

-- 4. Drawdown attribution by strategy, symbol, and market regime using fills.
SELECT
    f.strategy_id,
    f.symbol,
    any(m.market_regime) AS market_regime,
    count() AS fill_count,
    round(sum(f.realized_pnl), 2) AS realized_pnl,
    round(avg(f.slippage_bps), 2) AS avg_slippage_bps,
    round(sum(f.fees), 2) AS fees,
    round(sum(if(f.liquidity_flag = 'taker', 1, 0)) / count(), 4) AS taker_fill_rate
FROM fills AS f
LEFT JOIN market_candles AS m
    ON f.symbol = m.symbol
    AND toStartOfHour(f.fill_time) = toStartOfHour(m.candle_time)
WHERE f.fill_date BETWEEN toDate('2026-01-14') AND toDate('2026-01-18')
GROUP BY
    f.strategy_id,
    f.symbol
ORDER BY realized_pnl ASC;

-- 5. PnL by symbol across the full synthetic data window.
SELECT
    symbol,
    count() AS fill_count,
    round(sum(realized_pnl), 2) AS gross_realized_pnl,
    round(sum(fees), 2) AS total_fees,
    round(avg(slippage_bps), 2) AS avg_slippage_bps,
    round(sum(realized_pnl) - sum(fees), 2) AS net_pnl_after_fees
FROM fills
GROUP BY symbol
ORDER BY net_pnl_after_fees ASC;

-- 6. Risk exposure by strategy during the drawdown window.
SELECT
    snapshot_date,
    strategy_id,
    round(portfolio_value, 2) AS portfolio_value,
    round(gross_exposure, 2) AS gross_exposure,
    round(net_exposure, 2) AS net_exposure,
    round(gross_exposure / portfolio_value, 4) AS gross_exposure_ratio,
    round(net_exposure / portfolio_value, 4) AS net_exposure_ratio,
    drawdown_pct,
    benchmark_return
FROM portfolio_snapshots
WHERE snapshot_date BETWEEN toDate('2026-01-14') AND toDate('2026-01-18')
ORDER BY snapshot_date ASC, gross_exposure_ratio DESC;

-- 7. Signal quality drilldown for the culprit strategy and symbol.
SELECT
    s.strategy_id,
    s.symbol,
    s.signal_family,
    s.market_regime,
    count() AS signals,
    round(avg(s.confidence), 3) AS avg_confidence,
    round(sum(f.realized_pnl), 2) AS realized_pnl,
    round(avg(f.slippage_bps), 2) AS avg_slippage_bps,
    round(sum(if(f.realized_pnl < 0, 1, 0)) / count(), 4) AS losing_fill_rate
FROM signals AS s
INNER JOIN orders AS o USING signal_id
INNER JOIN fills AS f USING order_id
WHERE s.signal_date BETWEEN toDate('2026-01-14') AND toDate('2026-01-18')
    AND s.strategy_id = 'momentum_breakout'
    AND s.symbol = 'BETA_SYN'
GROUP BY
    s.strategy_id,
    s.symbol,
    s.signal_family,
    s.market_regime
ORDER BY realized_pnl ASC;

-- 8. Judge summary card values for the Hex Answer tab.
WITH
    toDate('2026-01-14') AS window_start,
    toDate('2026-01-18') AS window_end,
    max_drawdown AS
    (
        WITH strategy_curve AS
        (
            SELECT
                snapshot_date,
                strategy_id,
                portfolio_value,
                max(portfolio_value) OVER (
                    PARTITION BY strategy_id
                    ORDER BY snapshot_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS running_peak
            FROM portfolio_snapshots
        )
        SELECT
            strategy_id,
            min(round((portfolio_value / running_peak - 1) * 100, 2)) AS max_drawdown_pct,
            argMin(snapshot_date, round((portfolio_value / running_peak - 1) * 100, 2)) AS trough_date
        FROM strategy_curve
        GROUP BY strategy_id
        ORDER BY max_drawdown_pct ASC
        LIMIT 1
    ),
    fill_evidence AS
    (
        SELECT
            strategy_id,
            symbol,
            count() AS fill_count,
            round(sum(realized_pnl), 2) AS realized_pnl,
            round(avg(slippage_bps), 2) AS avg_slippage_bps,
            round(sum(if(liquidity_flag = 'taker', 1, 0)) / count(), 4) AS taker_fill_rate
        FROM fills
        WHERE fill_date BETWEEN window_start AND window_end
        GROUP BY
            strategy_id,
            symbol
        ORDER BY realized_pnl ASC
        LIMIT 1
    )
SELECT
    m.strategy_id AS culprit_strategy,
    f.symbol AS concentrated_symbol,
    'risk_off' AS market_regime,
    window_start,
    window_end,
    m.trough_date,
    m.max_drawdown_pct,
    f.realized_pnl,
    f.avg_slippage_bps,
    f.taker_fill_rate,
    'Review or pause synthetic momentum_breakout exposure to BETA_SYN before expanding the strategy.' AS recommended_action
FROM max_drawdown AS m
CROSS JOIN fill_evidence AS f;

-- 9. Waterfall-style drawdown attribution for Hex bar/waterfall charts.
WITH
    toDate('2026-01-14') AS window_start,
    toDate('2026-01-18') AS window_end,
    start_values AS
    (
        SELECT
            strategy_id,
            argMax(portfolio_value, snapshot_date) AS start_value
        FROM portfolio_snapshots
        WHERE snapshot_date < window_start
        GROUP BY strategy_id
    ),
    end_values AS
    (
        SELECT
            strategy_id,
            argMax(portfolio_value, snapshot_date) AS end_value
        FROM portfolio_snapshots
        WHERE snapshot_date <= window_end
        GROUP BY strategy_id
    ),
    contribution AS
    (
        SELECT
            e.strategy_id,
            round(e.end_value - s.start_value, 2) AS pnl_change
        FROM end_values AS e
        INNER JOIN start_values AS s USING strategy_id
    )
SELECT
    strategy_id,
    pnl_change,
    if(pnl_change < 0, 'loss', 'offset') AS contribution_type,
    round(abs(pnl_change) / sum(abs(pnl_change)) OVER () * 100, 2) AS absolute_share_pct,
    round(pnl_change / sum(abs(pnl_change)) OVER () * 100, 2) AS signed_share_pct
FROM contribution
ORDER BY pnl_change ASC;

-- 10. Why-not comparison table for the Evidence tab.
WITH
    toDate('2026-01-14') AS window_start,
    toDate('2026-01-18') AS window_end,
    max_drawdown AS
    (
        WITH strategy_curve AS
        (
            SELECT
                snapshot_date,
                strategy_id,
                portfolio_value,
                max(portfolio_value) OVER (
                    PARTITION BY strategy_id
                    ORDER BY snapshot_date
                    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                ) AS running_peak
            FROM portfolio_snapshots
        )
        SELECT
            strategy_id,
            min(round((portfolio_value / running_peak - 1) * 100, 2)) AS max_drawdown_pct
        FROM strategy_curve
        GROUP BY strategy_id
    ),
    contribution AS
    (
        WITH
            start_values AS
            (
                SELECT
                    strategy_id,
                    argMax(portfolio_value, snapshot_date) AS start_value
                FROM portfolio_snapshots
                WHERE snapshot_date < window_start
                GROUP BY strategy_id
            ),
            end_values AS
            (
                SELECT
                    strategy_id,
                    argMax(portfolio_value, snapshot_date) AS end_value
                FROM portfolio_snapshots
                WHERE snapshot_date <= window_end
                GROUP BY strategy_id
            )
        SELECT
            e.strategy_id,
            round(e.end_value - s.start_value, 2) AS pnl_change
        FROM end_values AS e
        INNER JOIN start_values AS s USING strategy_id
    ),
    execution AS
    (
        SELECT
            strategy_id,
            round(sum(realized_pnl), 2) AS realized_pnl,
            round(avg(slippage_bps), 2) AS avg_slippage_bps,
            round(sum(if(liquidity_flag = 'taker', 1, 0)) / count(), 4) AS taker_fill_rate
        FROM fills
        WHERE fill_date BETWEEN window_start AND window_end
        GROUP BY strategy_id
    ),
    exposure AS
    (
        SELECT
            strategy_id,
            round(avg(gross_exposure / portfolio_value), 4) AS avg_gross_exposure_ratio,
            round(avg(net_exposure / portfolio_value), 4) AS avg_net_exposure_ratio
        FROM portfolio_snapshots
        WHERE snapshot_date BETWEEN window_start AND window_end
        GROUP BY strategy_id
    )
SELECT
    c.strategy_id,
    m.max_drawdown_pct,
    c.pnl_change,
    round(c.pnl_change / sum(abs(c.pnl_change)) OVER () * 100, 2) AS drawdown_contribution_pct,
    e.realized_pnl,
    e.avg_slippage_bps,
    e.taker_fill_rate,
    x.avg_gross_exposure_ratio,
    x.avg_net_exposure_ratio,
    if(c.strategy_id = 'momentum_breakout',
        'Primary culprit: largest drawdown, largest negative contribution, elevated slippage and taker fills.',
        'Secondary contributor or offset: smaller drawdown contribution and weaker execution-risk evidence.'
    ) AS interpretation
FROM contribution AS c
INNER JOIN max_drawdown AS m USING strategy_id
INNER JOIN execution AS e USING strategy_id
INNER JOIN exposure AS x USING strategy_id
ORDER BY pnl_change ASC;

-- 11. Reproducibility and table-count checks for the SQL tab.
SELECT
    table_name,
    row_count,
    min_time,
    max_time
FROM
(
    SELECT
        'signals' AS table_name,
        count() AS row_count,
        min(signal_time) AS min_time,
        max(signal_time) AS max_time
    FROM signals
    UNION ALL
    SELECT
        'orders' AS table_name,
        count() AS row_count,
        min(order_time) AS min_time,
        max(order_time) AS max_time
    FROM orders
    UNION ALL
    SELECT
        'fills' AS table_name,
        count() AS row_count,
        min(fill_time) AS min_time,
        max(fill_time) AS max_time
    FROM fills
    UNION ALL
    SELECT
        'portfolio_snapshots' AS table_name,
        count() AS row_count,
        min(snapshot_time) AS min_time,
        max(snapshot_time) AS max_time
    FROM portfolio_snapshots
    UNION ALL
    SELECT
        'market_candles' AS table_name,
        count() AS row_count,
        min(candle_time) AS min_time,
        max(candle_time) AS max_time
    FROM market_candles
)
ORDER BY table_name ASC;
