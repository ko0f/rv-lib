# Chart provider API

This document describes the HTTP and WebSocket contract expected by **rv-lib** (RigoView). Implement a server that matches it, or adapt an existing backend behind a proxy.

Reference implementations in this package: [http-client.js](http-client.js), [ws-client.js](ws-client.js), [data-store.js](data-store.js).

---

`RigoView` is configured with:

- **`apiBase`** — HTTP origin + path prefix for the REST API (no trailing slash), e.g. `/api/charts` or `https://host/api/charts`.
- **`wsBase`** — **Full** WebSocket URL to the stream endpoint (scheme `ws:` or `wss:`), e.g. `wss://host/api/charts/stream`.

All REST responses must be JSON. The [http client](http-client.js) treats the body as failed unless `res.ok` **and** `body.ok === true`; otherwise it throws the parsed body.

## REST — `GET {apiBase}/time`

Optional helper (exposed by the client; the widget does not require it for painting).

**Response:** `{ "ok": true, "now": <number> }` — `now` is server time in **milliseconds** since epoch.

## REST — `GET {apiBase}/symbols/search`

Used by the symbol picker.

| Query | Required | Description |
|--------|----------|-------------|
| `q` | yes | Search string (non-empty). |
| `limit` | no | Max results (client defaults to `20`). |

**Response:** `{ "ok": true, "results": [ { "id": "<chartSymbol>", "description": "...", ... } ] }`

Each result **must** include `id` (opaque symbol id, e.g. `Binance:BTCUSDT`). `description` is optional; the picker shows it when present.

## REST — `GET {apiBase}/symbols/{id}`

`id` is the chart symbol string, URL-encoded (e.g. `Binance%3ABTCUSDT`).

**Response:** JSON with `"ok": true` and metadata for the symbol. The widget uses **`priceScale`** (number) for price-axis formatting when present; other fields may be ignored.

## REST — `GET {apiBase}/candles`

Primary history endpoint: initial load, pan/zoom prefetch, and resolution changes.

| Query | Required | Description |
|--------|----------|-------------|
| `symbol` | yes | Same opaque id as in search / meta (e.g. `Binance:BTCUSDT`). |
| `resolution` | yes | One of: `1m`, `5m`, `30m`, `1h`, `1d`, `1w`. |
| `count` | yes | Number of candles to return (client uses `500` on first load; provider may cap, e.g. max 5000). |
| `before` | no | If set, return a window **ending strictly before** this open time (**milliseconds**). Mutually exclusive with `after` and `anchor`. |
| `after` | no | If set, return data **after** this time (ms); semantics are provider-defined but must extend the series to the right. At most one of `before` / `after` / `anchor`. |
| `anchor` | no | If set, window anchored on this time (ms). At most one modifier. |
| `include_live` | no | If exactly the string `false`, provider may omit treating the last bucket as “live”. Otherwise client expects normal live handling. |

**Response — success:**

```json
{
  "ok": true,
  "symbol": "Binance:BTCUSDT",
  "resolution": "1h",
  "candles": {
    "t": [1700000000000],
    "o": [100.0],
    "h": [101.0],
    "l": [99.0],
    "c": [100.5],
    "v": [1234.5],
    "vb": [600.0],
    "vs": [634.5]
  },
  "availability": { "earliest": 1600000000000, "latest": 1700000000000 },
  "live": true
}
```

- **`candles`** — **Columnar** OHLCV: parallel arrays of equal length, sorted by `t` ascending. Each index `i` is one candle; `t[i]` is candle **open time in ms**. `v` is total volume; `vb` / `vs` are optional buy/sell components (client uses them when present).
- **`availability`** — Optional but recommended: `earliest` and `latest` (ms) bound how far the user can pan; used to stop left prefetch when `cachedLeft <= earliest`.
- **`live`** — If true, the client marks the **last** row as the forming candle (`live: true`) for UI.

## REST — `GET {apiBase}/candles/batch`

Batch fetch for dashboards (implemented in [http-client.js](http-client.js); the default `RigoView` chart does not call it).

| Query | Required | Description |
|--------|----------|-------------|
| `q` | yes | JSON stringified array of objects `{ "symbol", "resolution", "count" }`, length 1–20 (per typical provider limits). |

**Response:** `{ "ok": true, "results": [ /* same shape as single /candles body per query, or per-item error */ ] }`

## WebSocket — `{wsBase}`

Native **WebSocket** (not Socket.IO). Messages are UTF-8 JSON text frames.

### Client → server

| Message | Description |
|---------|-------------|
| `{ "op": "subscribe", "id": <number>, "symbol": "<id>", "resolution": "1h" }` | Subscribe to live updates for one `(symbol, resolution)`. |
| `{ "op": "unsubscribe", "id": <number>, "symbol": "<id>", "resolution": "1h" }` | Remove subscription. |
| `{ "op": "pong", "t": <number> }` | Reply to server `ping` with the same `t` (client does this automatically). |

### Server → client

| Message | Description |
|---------|-------------|
| `{ "type": "ping", "t": <number> }` | Keepalive; client must respond with `{ "op": "pong", "t" }`. |
| `{ "type": "partial", "symbol", "resolution", "t", "o", "h", "l", "c", "v" }` | Update the **forming** candle for bucket `t` (ms open time). |
| `{ "type": "close", "symbol", "resolution", "t", "o", "h", "l", "c", "v" }` | A bucket has **finished**; same field meanings as `partial`. |

The chart subscribes over WS **before** the matching HTTP candle load so partial/close events during fetch are buffered and merged ([data-store.js](data-store.js)). Implementations may also send `{ "type": "subscribed" | "unsubscribed" | "error", ... }`; the client ignores types other than `ping`, `partial`, and `close` for data merge.
