// http-client.js — typed wrappers around the charting REST API
export class HttpClient {
    constructor(baseUrl) {
        this._base = baseUrl.replace(/\/$/, '');
    }

    async _get(path, params = {}) {
        const url = new URL(this._base + path, location.href);
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
        }
        const res = await fetch(url.toString());
        const body = await res.json();
        if (!res.ok || !body.ok) throw body;
        return body;
    }

    getServerTime() {
        return this._get('/time');
    }

    searchSymbols(q, limit = 20) {
        return this._get('/symbols/search', { q, limit });
    }

    getSymbolMeta(id) {
        return this._get(`/symbols/${encodeURIComponent(id)}`);
    }

    getCandles({ symbol, resolution, count, before, after, anchor, includeLive }) {
        return this._get('/candles', { symbol, resolution, count, before, after, anchor, include_live: includeLive });
    }

    getCandlesBatch(queries) {
        return this._get('/candles/batch', { q: JSON.stringify(queries) });
    }
}
