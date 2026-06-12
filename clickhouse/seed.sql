-- Deterministic synthetic seed for Trading Strategy Evaluation Lab.
-- The seeded drawdown is intentionally attributable to:
-- strategy_id = 'momentum_breakout'
-- symbol = 'BETA_SYN'
-- window = 2026-01-14 through 2026-01-18
--
-- Safe for public demos: no real trades, accounts, broker data, credentials,
-- private strategy logic, or private trading-system references.

TRUNCATE TABLE signals;
TRUNCATE TABLE orders;
TRUNCATE TABLE fills;
TRUNCATE TABLE portfolio_snapshots;
TRUNCATE TABLE market_candles;

INSERT INTO market_candles
    (candle_time, symbol, open, high, low, close, volume, volatility, market_regime)
SELECT
    candle_time,
    symbol,
    base_price + drift AS open,
    base_price + drift + 1.35 + (number % 5) * 0.08 AS high,
    base_price + drift - if(symbol = 'BETA_SYN'
        AND candle_time >= toDateTime('2026-01-14 00:00:00')
        AND candle_time < toDateTime('2026-01-19 00:00:00'), 3.60, 1.10) - (number % 3) * 0.07 AS low,
    base_price + drift + close_offset AS close,
    toUInt64(900000 + (number % 240) * 3500 + symbol_index * 25000) AS volume,
    if(candle_time >= toDateTime('2026-01-14 00:00:00')
        AND candle_time < toDateTime('2026-01-19 00:00:00')
        AND symbol = 'BETA_SYN', 0.046, 0.018 + (number % 7) * 0.001) AS volatility,
    if(candle_time >= toDateTime('2026-01-14 00:00:00')
        AND candle_time < toDateTime('2026-01-19 00:00:00')
        AND symbol = 'BETA_SYN', 'risk_off', 'trend') AS market_regime
FROM
(
    SELECT
        number,
        intDiv(number, 3) AS hour_index,
        number % 3 AS symbol_index,
        toDateTime('2026-01-01 09:30:00') + toIntervalHour(hour_index) AS candle_time,
        multiIf(symbol_index = 0, 'ALPHA_SYN', symbol_index = 1, 'BETA_SYN', 'GAMMA_SYN') AS symbol,
        multiIf(symbol_index = 0, 82.0, symbol_index = 1, 118.0, 54.0) AS base_price,
        multiIf(
            symbol_index = 1
                AND candle_time >= toDateTime('2026-01-14 00:00:00')
                AND candle_time < toDateTime('2026-01-19 00:00:00'),
            -18.0 + (hour_index % 12) * -0.18,
            (hour_index % 96) * 0.045
        ) AS drift,
        multiIf(symbol_index = 1
                AND candle_time >= toDateTime('2026-01-14 00:00:00')
                AND candle_time < toDateTime('2026-01-19 00:00:00'),
                -2.80,
                number % 2 = 0,
                0.65,
                -0.35) AS close_offset
    FROM numbers(1440)
);

INSERT INTO signals
    (
        signal_id,
        strategy_id,
        symbol,
        signal_time,
        side,
        confidence,
        intended_quantity,
        reference_price,
        signal_family,
        market_regime
    )
SELECT
    concat('sig_', leftPad(toString(number + 1), 5, '0')) AS signal_id,
    strategy_id,
    symbol,
    signal_time,
    side,
    confidence,
    intended_quantity,
    reference_price,
    signal_family,
    market_regime
FROM
(
    SELECT
        number,
        toDateTime('2026-01-01 10:00:00') + toIntervalHour(number) AS signal_time,
        multiIf(number % 3 = 0, 'mean_reversion_alpha',
                number % 3 = 1, 'momentum_breakout',
                'volatility_carry') AS strategy_id,
        multiIf(number % 3 = 0, 'ALPHA_SYN',
                number % 3 = 1, 'BETA_SYN',
                'GAMMA_SYN') AS symbol,
        multiIf(number % 4 IN (0, 1), 'buy', 'sell') AS side,
        if(strategy_id = 'momentum_breakout'
            AND symbol = 'BETA_SYN'
            AND signal_time >= toDateTime('2026-01-14 00:00:00')
            AND signal_time < toDateTime('2026-01-19 00:00:00'), 0.88, 0.58 + (number % 29) / 100) AS confidence,
        toUInt32(multiIf(strategy_id = 'momentum_breakout', 1400 + (number % 9) * 75,
                         strategy_id = 'mean_reversion_alpha', 850 + (number % 7) * 45,
                         700 + (number % 5) * 40)) AS intended_quantity,
        multiIf(symbol = 'ALPHA_SYN', 82.0, symbol = 'BETA_SYN', 118.0, 54.0) + (number % 20) * 0.12 AS reference_price,
        multiIf(strategy_id = 'momentum_breakout', 'trend_following',
                strategy_id = 'mean_reversion_alpha', 'mean_reversion',
                'volatility_harvest') AS signal_family,
        if(signal_time >= toDateTime('2026-01-14 00:00:00')
            AND signal_time < toDateTime('2026-01-19 00:00:00')
            AND symbol = 'BETA_SYN', 'risk_off', 'trend') AS market_regime
    FROM numbers(720)
);

INSERT INTO orders
    (order_id, signal_id, strategy_id, symbol, order_time, side, order_type, quantity, limit_price, status)
SELECT
    concat('ord_', substring(signal_id, 5)) AS order_id,
    signal_id,
    strategy_id,
    symbol,
    signal_time + toIntervalMinute(3) AS order_time,
    side,
    if(strategy_id = 'momentum_breakout', 'limit', 'market') AS order_type,
    intended_quantity AS quantity,
    reference_price + if(side = 'buy', 0.08, -0.08) AS limit_price,
    if(signal_id IN ('sig_00177', 'sig_00261'), 'canceled', 'filled') AS status
FROM signals;

INSERT INTO fills
    (
        fill_id,
        order_id,
        strategy_id,
        symbol,
        fill_time,
        side,
        quantity,
        fill_price,
        fees,
        slippage_bps,
        liquidity_flag,
        realized_pnl
    )
SELECT
    concat('fill_', substring(order_id, 5)) AS fill_id,
    order_id,
    strategy_id,
    symbol,
    order_time + toIntervalMinute(2) AS fill_time,
    side,
    quantity,
    limit_price + if(side = 'buy', slippage_bps / 10000 * limit_price, -slippage_bps / 10000 * limit_price) AS fill_price,
    round(quantity * limit_price * 0.00018, 2) AS fees,
    slippage_bps,
    liquidity_flag,
    realized_pnl
FROM
(
    SELECT
        *,
        if(strategy_id = 'momentum_breakout'
            AND symbol = 'BETA_SYN'
            AND order_time >= toDateTime('2026-01-14 00:00:00')
            AND order_time < toDateTime('2026-01-19 00:00:00'), 18.5, 3.2 + (quantity % 13) * 0.35) AS slippage_bps,
        if(strategy_id = 'momentum_breakout'
            AND symbol = 'BETA_SYN'
            AND order_time >= toDateTime('2026-01-14 00:00:00')
            AND order_time < toDateTime('2026-01-19 00:00:00'), 'taker', 'maker') AS liquidity_flag,
        round(
            multiIf(
                strategy_id = 'momentum_breakout'
                    AND symbol = 'BETA_SYN'
                    AND order_time >= toDateTime('2026-01-14 00:00:00')
                    AND order_time < toDateTime('2026-01-19 00:00:00'),
                -1 * (1850 + (quantity % 11) * 140),
                strategy_id = 'mean_reversion_alpha',
                420 + (quantity % 9) * 35,
                strategy_id = 'volatility_carry',
                160 + (quantity % 7) * 22,
                95
            ), 2
        ) AS realized_pnl
    FROM orders
    WHERE status = 'filled'
);

INSERT INTO portfolio_snapshots
    (
        snapshot_time,
        strategy_id,
        portfolio_value,
        cash,
        gross_exposure,
        net_exposure,
        realized_pnl,
        unrealized_pnl,
        drawdown_pct,
        benchmark_return
    )
SELECT
    toDateTime('2026-01-01 16:00:00') + toIntervalDay(day_index) AS snapshot_time,
    strategy_id,
    portfolio_value,
    cash,
    gross_exposure,
    net_exposure,
    realized_pnl,
    unrealized_pnl,
    round((portfolio_value / max(portfolio_value) OVER (PARTITION BY strategy_id ORDER BY day_index ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) - 1) * 100, 2) AS drawdown_pct,
    round(0.0015 * day_index - if(day_index BETWEEN 13 AND 17, 0.015, 0), 4) AS benchmark_return
FROM
(
    SELECT
        toInt32(intDiv(number, 3)) AS day_index,
        toInt32(number % 3) AS strategy_index,
        multiIf(strategy_index = 0, 'mean_reversion_alpha',
                strategy_index = 1, 'momentum_breakout',
                'volatility_carry') AS strategy_id,
        multiIf(
            strategy_id = 'momentum_breakout' AND day_index < 13, 1000000 + day_index * 6200,
            strategy_id = 'momentum_breakout' AND day_index BETWEEN 13 AND 17, 1080600 - (day_index - 12) * 34500,
            strategy_id = 'momentum_breakout', 908100 + (day_index - 17) * 8600,
            strategy_id = 'mean_reversion_alpha', 1000000 + day_index * 3400 - if(day_index BETWEEN 13 AND 17, 4500, 0),
            1000000 + day_index * 1900 - if(day_index BETWEEN 13 AND 17, 2200, 0)
        ) AS portfolio_value,
        round(portfolio_value * multiIf(strategy_id = 'momentum_breakout', 0.18, strategy_id = 'mean_reversion_alpha', 0.36, 0.42), 2) AS cash,
        round(portfolio_value * multiIf(strategy_id = 'momentum_breakout', if(day_index BETWEEN 13 AND 17, 1.75, 1.35), strategy_id = 'mean_reversion_alpha', 0.92, 0.78), 2) AS gross_exposure,
        round(portfolio_value * multiIf(strategy_id = 'momentum_breakout', if(day_index BETWEEN 13 AND 17, 1.18, 0.72), strategy_id = 'mean_reversion_alpha', -0.12, 0.08), 2) AS net_exposure,
        round(portfolio_value - 1000000, 2) AS realized_pnl,
        round(multiIf(strategy_id = 'momentum_breakout' AND day_index BETWEEN 13 AND 17, -42000 - (day_index - 13) * 8700,
                      strategy_id = 'mean_reversion_alpha', 8500 + day_index * 170,
                      6200 + day_index * 120), 2) AS unrealized_pnl
    FROM numbers(63)
);
