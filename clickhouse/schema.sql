-- ClickHouse schema for Trading Strategy Evaluation Lab.
-- All entities are deterministic synthetic demo data. No private trading
-- systems, broker data, account identifiers, real trades, or live credentials
-- are required or referenced.
--
-- Run with:
-- clickhouse client --host "$CLICKHOUSE_HOST" --secure --port "$CLICKHOUSE_PORT" \
--   --user "$CLICKHOUSE_USER" --password "$CLICKHOUSE_PASSWORD" \
--   --database "$CLICKHOUSE_DATABASE" --multiquery < clickhouse/schema.sql

CREATE TABLE IF NOT EXISTS signals
(
    signal_id String,
    strategy_id LowCardinality(String),
    symbol LowCardinality(String),
    signal_time DateTime,
    signal_date Date MATERIALIZED toDate(signal_time),
    side LowCardinality(String),
    confidence Float32,
    intended_quantity UInt32,
    reference_price Float64,
    signal_family LowCardinality(String),
    market_regime LowCardinality(String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(signal_date)
ORDER BY (strategy_id, symbol, signal_time, signal_id);

CREATE TABLE IF NOT EXISTS orders
(
    order_id String,
    signal_id String,
    strategy_id LowCardinality(String),
    symbol LowCardinality(String),
    order_time DateTime,
    order_date Date MATERIALIZED toDate(order_time),
    side LowCardinality(String),
    order_type LowCardinality(String),
    quantity UInt32,
    limit_price Float64,
    status LowCardinality(String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(order_date)
ORDER BY (strategy_id, symbol, order_time, order_id);

CREATE TABLE IF NOT EXISTS fills
(
    fill_id String,
    order_id String,
    strategy_id LowCardinality(String),
    symbol LowCardinality(String),
    fill_time DateTime,
    fill_date Date MATERIALIZED toDate(fill_time),
    side LowCardinality(String),
    quantity UInt32,
    fill_price Float64,
    fees Float64,
    slippage_bps Float32,
    liquidity_flag LowCardinality(String),
    realized_pnl Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(fill_date)
ORDER BY (strategy_id, symbol, fill_time, fill_id);

CREATE TABLE IF NOT EXISTS portfolio_snapshots
(
    snapshot_time DateTime,
    snapshot_date Date MATERIALIZED toDate(snapshot_time),
    strategy_id LowCardinality(String),
    portfolio_value Float64,
    cash Float64,
    gross_exposure Float64,
    net_exposure Float64,
    realized_pnl Float64,
    unrealized_pnl Float64,
    drawdown_pct Float64,
    benchmark_return Float64
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(snapshot_date)
ORDER BY (strategy_id, snapshot_time);

CREATE TABLE IF NOT EXISTS market_candles
(
    candle_time DateTime,
    candle_date Date MATERIALIZED toDate(candle_time),
    symbol LowCardinality(String),
    open Float64,
    high Float64,
    low Float64,
    close Float64,
    volume UInt64,
    volatility Float64,
    market_regime LowCardinality(String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(candle_date)
ORDER BY (symbol, candle_time);
