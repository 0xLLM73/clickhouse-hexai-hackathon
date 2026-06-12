import { createClient, type ClickHouseClient } from "@clickhouse/client";

export type BackendMode = "mock" | "clickhouse";

type QueryParams = Record<string, string | number | boolean>;

let cachedClient: ClickHouseClient | null = null;

export function hasClickHouseConfig() {
  return Boolean(
    process.env.CLICKHOUSE_HOST &&
      process.env.CLICKHOUSE_USER &&
      process.env.CLICKHOUSE_PASSWORD &&
      process.env.CLICKHOUSE_DATABASE
  );
}

export function backendMode(): BackendMode {
  if (process.env.DEMO_DATA_MODE === "live" && hasClickHouseConfig()) {
    return "clickhouse";
  }

  return "mock";
}

export function clickhouseClient() {
  if (!hasClickHouseConfig()) {
    throw new Error("ClickHouse credentials are not configured");
  }

  if (!cachedClient) {
    const protocol = process.env.CLICKHOUSE_PROTOCOL ?? "https";
    const host = process.env.CLICKHOUSE_HOST;
    const port = process.env.CLICKHOUSE_PORT ?? "8443";

    cachedClient = createClient({
      url: `${protocol}://${host}:${port}`,
      username: process.env.CLICKHOUSE_USER,
      password: process.env.CLICKHOUSE_PASSWORD,
      database: process.env.CLICKHOUSE_DATABASE
    });
  }

  return cachedClient;
}

export async function queryClickHouse<T>(
  query: string,
  queryParams: QueryParams = {}
) {
  const result = await clickhouseClient().query({
    query,
    format: "JSONEachRow",
    query_params: queryParams
  });

  return result.json<T[]>();
}

export function boundedLimit(value: string | null, fallback = 20, max = 100) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), max);
}

export function dateWindow(searchParams: URLSearchParams) {
  return {
    from: searchParams.get("from") ?? null,
    to: searchParams.get("to") ?? null
  };
}

export function optionalWorkspace(searchParams: URLSearchParams) {
  return searchParams.get("workspaceId") ?? null;
}

export function jsonError(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}
