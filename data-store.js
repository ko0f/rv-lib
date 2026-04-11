// data-store.js — in-memory candle cache keyed by (symbol, resolution)
const CANDLE_MS = { '1m': 60e3, '5m': 300e3, '30m': 1800e3, '1h': 3600e3, '1d': 86400e3, '1w': 604800e3 };

export class DataStore extends EventTarget {
    constructor(httpClient) {
        super();
        this._http     = httpClient;
        this._cache    = {};   // { [symbol]: { [resolution]: { candles, availability } } }
        this._buffered = {};   // { [key]: WsEvent[] }  — filled between subscribe and HTTP load
        this._loading  = {};   // { [key]: Promise }
    }

    _key(symbol, resolution) {
        return `${symbol}::${resolution}`;
    }

    _entry(symbol, resolution) {
        (this._cache[symbol]                ??= {});
        (this._cache[symbol][resolution]    ??= { candles: [], availability: null });
        return this._cache[symbol][resolution];
    }

    _unpack(columnar) {
        const { t, o, h, l, c, v, vb, vs } = columnar;
        return t.map((ts, i) => ({
            t:  ts,
            o:  o[i], h: h[i], l: l[i], c: c[i],
            v:  v[i],
            vb: vb?.[i],
            vs: vs?.[i],
            live: false,
        }));
    }

    // Call before subscribing WS so events received before HTTP completes are buffered
    startBuffering(symbol, resolution) {
        this._buffered[this._key(symbol, resolution)] = [];
    }

    isBuffering(symbol, resolution) {
        return this._buffered[this._key(symbol, resolution)] !== undefined;
    }

    bufferWsEvent(symbol, resolution, event) {
        const buf = this._buffered[this._key(symbol, resolution)];
        if (buf) buf.push(event);
    }

    async load(symbol, resolution, params = {}) {
        const key = this._key(symbol, resolution);
        // Deduplicate concurrent loads for the same key
        if (this._loading[key]) return this._loading[key];
        const p = this._doLoad(symbol, resolution, params).finally(() => { delete this._loading[key]; });
        this._loading[key] = p;
        return p;
    }

    async _doLoad(symbol, resolution, params) {
        const resp       = await this._http.getCandles({ symbol, resolution, count: params.count ?? 500, ...params });
        const newCandles = this._unpack(resp.candles);
        if (resp.live && newCandles.length) newCandles[newCandles.length - 1].live = true;

        const entry = this._entry(symbol, resolution);
        entry.availability = resp.availability;

        // Merge existing cache + new candles (dedupe by t, preserve newer data)
        const map = new Map(entry.candles.map(c => [c.t, c]));
        for (const c of newCandles) map.set(c.t, c);
        entry.candles = [...map.values()].sort((a, b) => a.t - b.t);

        // §4.4 sync contract: replay buffered WS events that arrived during HTTP fetch
        const key      = this._key(symbol, resolution);
        const buffered = this._buffered[key] ?? [];
        delete this._buffered[key];

        const httpTs = new Set(newCandles.map(c => c.t));
        for (const ev of buffered) {
            if (ev.type === 'close' && !httpTs.has(ev.t)) {
                this._mergeClose(entry, ev);
            } else if (ev.type === 'partial') {
                this._mergePartial(entry, ev);
            }
        }

        this.dispatchEvent(new CustomEvent('data:loaded', { detail: { symbol, resolution } }));
        return entry;
    }

    _mergePartial(entry, tick) {
        const candles = entry.candles;
        const last    = candles[candles.length - 1];
        if (last?.t === tick.t) {
            Object.assign(last, { o: tick.o, h: tick.h, l: tick.l, c: tick.c, v: tick.v, live: true });
        } else {
            candles.push({ t: tick.t, o: tick.o, h: tick.h, l: tick.l, c: tick.c, v: tick.v, live: true });
        }
    }

    _mergeClose(entry, candle) {
        const candles = entry.candles;
        const closed  = { t: candle.t, o: candle.o, h: candle.h, l: candle.l, c: candle.c, v: candle.v, live: false };
        const last    = candles[candles.length - 1];
        if (last?.t === candle.t) {
            candles[candles.length - 1] = closed;
        } else {
            candles.push(closed);
            entry.candles.sort((a, b) => a.t - b.t);
        }
    }

    applyPartial(symbol, resolution, tick) {
        this._mergePartial(this._entry(symbol, resolution), tick);
        this.dispatchEvent(new CustomEvent('data:live-tick', { detail: { symbol, resolution } }));
    }

    applyClose(symbol, resolution, candle) {
        this._mergeClose(this._entry(symbol, resolution), candle);
        this.dispatchEvent(new CustomEvent('data:close', { detail: { symbol, resolution } }));
    }

    getWindow(symbol, resolution, fromT, toT) {
        const candles = this._cache[symbol]?.[resolution]?.candles ?? [];
        if (!candles.length) return [];
        // Compact time is anchored to the last candle: compactT[i] = lastT - (n-1-i)*candleMs.
        // This ensures the last candle's compact time equals its real time, keeping the
        // viewport (which uses real time for rightEdgeT) aligned with compact positions.
        const candleMs     = CANDLE_MS[resolution] ?? CANDLE_MS['1h'];
        const n            = candles.length;
        const lastT        = candles[n - 1].t;
        const baseCompactT = lastT - (n - 1) * candleMs;
        const fromIdx = Math.max(0, Math.floor((fromT - baseCompactT) / candleMs) - 1);
        const toIdx   = Math.min(n - 1, Math.ceil((toT - baseCompactT) / candleMs) + 1);
        if (toIdx < 0 || fromIdx >= n) return [];
        return candles.slice(fromIdx, toIdx + 1);
    }

    getAll(symbol, resolution) {
        return this._cache[symbol]?.[resolution]?.candles ?? [];
    }

    getOldest(symbol, resolution) {
        const all = this.getAll(symbol, resolution);
        return all.length ? all[0].t : null;
    }

    getAvailability(symbol, resolution) {
        return this._cache[symbol]?.[resolution]?.availability ?? null;
    }
}
