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

**Response:** JSON with `"ok": true` plus metadata fields below. Unknown fields are ignored by the client.

### Resolution tokens

rv-lib only recognizes these strings anywhere a **resolution** appears (query params, `supportedResolutions`, `minResolution`, WebSocket messages). Other strings in `supportedResolutions` are **filtered out** and not shown as selectable timeframes.

| Token | Typical use |
|--------|-------------|
| `1m`, `5m`, `30m`, `1h`, `1d`, `1w` | OHLC candle series |
| `1mo`, `1q`, `1y` | Longer buckets (often point / macro-style series) |

### Symbol metadata fields

| Field | Type | Description |
|--------|------|-------------|
| `kind` | `string` (optional) | If exactly `"point"`, the chart loads history with `GET /points` and does **not** subscribe on the WebSocket for that symbol. Omit or use any other value for standard OHLC mode (`GET /candles` + live WS). |
| `supportedResolutions` | `string[]` (optional) | Subset of [resolution tokens](#resolution-tokens) this symbol supports. Drives the resolution toolbar: only listed tokens are shown. If **omitted** while a symbol is already selected, rv-lib hides every resolution button until metadata arrives (then you should return this array whenever the feed is constrained). |
| `minResolution` | `string` (optional) | Must be a known resolution token. Used when the user’s current resolution (from the widget or `localStorage`) is not in `supportedResolutions`: rv-lib switches to `minResolution` when that value is allowed, otherwise to the first entry of `supportedResolutions`. |
| `priceScale` | `number` (optional) | Passed to the renderer for price-axis / crosshair numeric formatting when present. |

**Example — daily-only point indicator**

```json
{
  "ok": true,
  "kind": "point",
  "supportedResolutions": ["1d"],
  "minResolution": "1d",
  "priceScale": 2
}
```

### Client behavior (driven by metadata)

- **Initial resolution:** After `GET /symbols/{id}` returns, rv-lib may change the active resolution to match `supportedResolutions` / `minResolution` (see field table above).
- **Single timeframe:** If, after filtering to known tokens, `supportedResolutions` contains **exactly one** value, RigoView **auto-locks** the resolution UI (label only; no toolbar switching or resolution hotkeys). Constructor `lockTimeframe: true` forces that locked UI for **every** symbol. `setLockTimeframe(true)` sets the same explicit lock flag; `setLockTimeframe(false)` clears it, but **auto-lock still applies** whenever metadata lists exactly one supported resolution.
- **Candle vs point:** `kind: "point"` selects the `/points` loader; otherwise candles + WebSocket live path is used.

## REST — `GET {apiBase}/candles`

Primary history endpoint: initial load, pan/zoom prefetch, and resolution changes.

| Query | Required | Description |
|--------|----------|-------------|
| `symbol` | yes | Same opaque id as in search / meta (e.g. `Binance:BTCUSDT`). |
| `resolution` | yes | A [resolution token](#resolution-tokens) supported for this symbol (see `/symbols/{id}`). |
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

If the requested `resolution` is not valid for the symbol, the server should respond with `ok: false` and a body the client can use to recover (see [Unsupported resolution](#unsupported-resolution)).

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
| `{ "op": "subscribe", "id": <number>, "symbol": "<id>", "resolution": "<token>" }` | Subscribe to live updates for one `(symbol, resolution)` pair. `resolution` must be a [resolution token](#resolution-tokens). |
| `{ "op": "unsubscribe", "id": <number>, "symbol": "<id>", "resolution": "<token>" }` | Remove subscription. |
| `{ "op": "pong", "t": <number> }` | Reply to server `ping` with the same `t` (client does this automatically). |

### Server → client

| Message | Description |
|---------|-------------|
| `{ "type": "ping", "t": <number> }` | Keepalive; client must respond with `{ "op": "pong", "t" }`. |
| `{ "type": "partial", "symbol", "resolution", "t", "o", "h", "l", "c", "v" }` | Update the **forming** candle for bucket `t` (ms open time). `resolution` is a [resolution token](#resolution-tokens). |
| `{ "type": "close", "symbol", "resolution", "t", "o", "h", "l", "c", "v" }` | A bucket has **finished**; same field meanings as `partial`. |

The chart subscribes over WS **before** the matching HTTP candle load so partial/close events during fetch are buffered and merged ([data-store.js](data-store.js)). Implementations may also send `{ "type": "subscribed" | "unsubscribed" | "error", ... }`; the client ignores types other than `ping`, `partial`, and `close` for data merge.

## REST — `GET {apiBase}/points`

Point-series endpoint for non-OHLC assets (for example macro indicators). The symbol metadata should declare `kind: "point"` in `/symbols/{id}` so rv-lib routes here.

| Query | Required | Description |
|--------|----------|-------------|
| `symbol` | yes | Opaque symbol id for point series (for example `MACRO:mexico:USURTOT`). |
| `resolution` | yes | A [resolution token](#resolution-tokens) supported for this symbol (typically `1d` … `1y` for point series). |
| `count` | yes | Number of points to return. |
| `before` | no | Return points strictly before this timestamp (ms). |
| `after` | no | Return points after this timestamp (ms). |
| `anchor` | no | Return points centered around this timestamp (ms). |

**Response — success:**

```json
{
  "ok": true,
  "symbol": "MACRO:mexico:USURTOT",
  "resolution": "1mo",
  "kind": "point",
  "points": {
    "t": [1700000000000],
    "v": [5.2]
  },
  "availability": { "earliest": 1600000000000, "latest": 1700000000000 },
  "live": false
}
```

For point symbols rv-lib skips WS subscribe/live handling.

Invalid `resolution` on this route should use the same error convention as [`/candles`](#unsupported-resolution).

## REST — `GET {apiBase}/points/batch`

Same pattern as **GET `{apiBase}/candles/batch`**: query `q` is a JSON-stringified array of `{ "symbol", "resolution", "count", ... }` objects. **Response:** `{ "ok": true, "results": [ ... ] }` with per-query shapes matching a single **`/points`** success body or per-item errors.

## Unsupported resolution

When `GET /candles` or `GET /points` rejects a `resolution`, return `ok: false`. If the JSON body includes a nested object describing the error, rv-lib may retry with a fallback resolution.

**Recommended shape** (thrown by [http-client.js](http-client.js) as the parsed body):

```json
{
  "ok": false,
  "error": {
    "error": "unsupported_resolution",
    "minResolution": "1mo"
  }
}
```

`minResolution` must be a [resolution token](#resolution-tokens) the client understands; it is used as the new resolution when present.
