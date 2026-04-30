// viewport.js — logical coordinate system: time scale + price scale
export const VOL_RATIO = 0.2; // bottom fraction reserved for volume bars

const MIN_MS_PER_PX = 1000;          // max zoom-in: 1s per pixel
const MAX_MS_PER_PX = 30 * 86400e3; // max zoom-out: 30 days per pixel
const MIN_PRICE_RANGE = 1e-8;
const MIN_POSITIVE_PRICE = 1e-12;
const MIN_LOG10_RANGE = 1e-6;
const MAX_LOG10_RANGE = 24;

const CANDLE_MS = { '1m': 60e3, '5m': 300e3, '30m': 1800e3, '1h': 3600e3, '1d': 86400e3, '1w': 604800e3 };

export class Viewport {
    /**
     * @param {number} width
     * @param {number} height
     * @param {{ priceLogScale?: boolean, priceYInverted?: boolean }} [opts]
     */
    constructor(width, height, opts = {}) {
        this.width  = Math.max(1, width);
        this.height = Math.max(1, height);
        this.rightEdgeT  = Date.now();
        this.msPerPixel  = CANDLE_MS['1h'] * 200 / this.width;
        this.priceMin    = 0;
        this.priceMax    = 1;
        this.priceLocked = false;
        /** When true, price ↔ Y mapping uses log10 (requires strictly positive prices). */
        this.priceLogScale = opts.priceLogScale === true;
        /** When true, low prices render toward top (Y axis flipped vs default). */
        this.priceYInverted = opts.priceYInverted === true;
        this._listeners  = new Map();
    }

    on(event, fn) {
        if (!this._listeners.has(event)) this._listeners.set(event, []);
        this._listeners.get(event).push(fn);
    }

    _emit(event) {
        for (const fn of (this._listeners.get(event) ?? [])) fn();
    }

    // ---- TimeScale ----

    timeToX(t) {
        return this.width - (this.rightEdgeT - t) / this.msPerPixel;
    }

    xToTime(x) {
        return this.rightEdgeT - (this.width - x) * this.msPerPixel;
    }

    visibleRange() {
        return { from: this.xToTime(0), to: this.xToTime(this.width) };
    }

    visibleCenter() {
        return this.xToTime(this.width / 2);
    }

    zoom(factor, anchorX) {
        const anchorT = this.xToTime(anchorX);
        this.msPerPixel = Math.max(MIN_MS_PER_PX, Math.min(MAX_MS_PER_PX, this.msPerPixel * factor));
        this.rightEdgeT = anchorT + (this.width - anchorX) * this.msPerPixel;
        this._emit('viewport:changed');
    }

    pan(deltaX) {
        this.rightEdgeT -= deltaX * this.msPerPixel;
        this._emit('viewport:changed');
    }

    adjustZoomForResolution(resolution) {
        const ms = CANDLE_MS[resolution] ?? CANDLE_MS['1h'];
        this.msPerPixel = ms * 200 / Math.max(this.width, 1);
        // Do not emit viewport:changed here: Chart.setResolution / _load align the
        // time axis and refit price after HTTP load. Emitting here runs fitToCandles
        // on the new resolution key before data/rightEdge are ready and can leave a
        // bad Y scale until the next interaction.
    }

    zoomPrice(factor, anchorY) {
        const h = this.height * (1 - VOL_RATIO);
        if (!Number.isFinite(factor) || factor <= 0 || h <= 0) return;

        const clampedY = Math.max(0, Math.min(anchorY, h));

        if (this.priceLogScale) {
            const lo = Math.log10(Math.max(this.priceMin, MIN_POSITIVE_PRICE));
            const hi = Math.log10(Math.max(this.priceMax, MIN_POSITIVE_PRICE));
            if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return;
            const Lrange = hi - lo;
            const t = this.priceYInverted ? clampedY / h : (1 - clampedY / h);
            const anchorL = lo + t * Lrange;
            let newLrange = Lrange * factor;
            newLrange = Math.max(MIN_LOG10_RANGE, Math.min(MAX_LOG10_RANGE, newLrange));
            const newLo = anchorL - t * newLrange;
            const newHi = newLo + newLrange;
            const newMin = Math.pow(10, newLo);
            const newMax = Math.pow(10, newHi);
            if (!Number.isFinite(newMin) || !Number.isFinite(newMax) || newMax <= newMin) return;
            this.priceMin = newMin;
            this.priceMax = newMax;
        } else {
            const oldRange = this.priceMax - this.priceMin;
            if (!Number.isFinite(oldRange) || oldRange <= 0) return;

            const k = this.priceYInverted ? clampedY / h : (1 - clampedY / h);
            const anchorPrice = this.priceMin + k * oldRange;

            const minRange = Math.max(MIN_PRICE_RANGE, Math.abs(anchorPrice) * 1e-8);
            const maxRange = Math.max(1, Math.abs(anchorPrice) * 1e6);
            const newRange = Math.max(minRange, Math.min(maxRange, oldRange * factor));

            const newMin = anchorPrice - k * newRange;
            const newMax = newMin + newRange;
            if (!Number.isFinite(newMin) || !Number.isFinite(newMax) || newMax <= newMin) return;

            this.priceMin = newMin;
            this.priceMax = newMax;
        }
        this.priceLocked = true;
        this._emit('viewport:changed');
    }

    // ---- PriceScale ----

    fitToCandles(candles) {
        if (!candles.length || this.priceLocked) return;
        let min = Infinity, max = -Infinity;
        for (const c of candles) {
            const values = [c.o, c.h, c.l, c.c];
            for (const p of values) {
                if (!Number.isFinite(p) || p <= 0) continue;
                if (p < min) min = p;
                if (p > max) max = p;
            }
        }
        if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return;

        if (this.priceLogScale) {
            const logMin = Math.log10(min);
            const logMax = Math.log10(max);
            const pad = (logMax - logMin) * 0.05 || 0.02;
            this.priceMin = Math.pow(10, logMin - pad);
            this.priceMax = Math.pow(10, logMax + pad);
        } else {
            const pad = (max - min) * 0.05 || Math.abs(max) * 0.05 || 1;
            this.priceMin = min - pad;
            this.priceMax = max + pad;
        }
    }

    // Maps price to y within the price area (top (1-VOL_RATIO) of chartH)
    priceToY(p) {
        const h = this.height * (1 - VOL_RATIO);
        if (!this.priceLogScale) {
            const range = this.priceMax - this.priceMin;
            if (!Number.isFinite(range) || range <= 0) return h / 2;
            const frac = (p - this.priceMin) / range;
            return this.priceYInverted ? h * frac : h * (1 - frac);
        }
        const lo = Math.log10(Math.max(this.priceMin, MIN_POSITIVE_PRICE));
        const hi = Math.log10(Math.max(this.priceMax, MIN_POSITIVE_PRICE));
        const lp = Math.log10(Math.max(p, MIN_POSITIVE_PRICE));
        const Lrange = hi - lo;
        if (!Number.isFinite(Lrange) || Lrange <= 0) return h / 2;
        const frac = (lp - lo) / Lrange;
        return this.priceYInverted ? h * frac : h * (1 - frac);
    }

    yToPrice(y) {
        const h = this.height * (1 - VOL_RATIO);
        if (!this.priceLogScale) {
            const range = this.priceMax - this.priceMin;
            const u = this.priceYInverted ? y / h : (1 - y / h);
            return this.priceMin + u * range;
        }
        const lo = Math.log10(Math.max(this.priceMin, MIN_POSITIVE_PRICE));
        const hi = Math.log10(Math.max(this.priceMax, MIN_POSITIVE_PRICE));
        const Lrange = hi - lo;
        if (!Number.isFinite(Lrange) || Lrange <= 0) return Math.sqrt(this.priceMin * this.priceMax);
        const u = this.priceYInverted ? y / h : (1 - y / h);
        const lp = lo + u * Lrange;
        return Math.pow(10, lp);
    }

    resize(width, height) {
        this.width  = Math.max(1, width);
        this.height = Math.max(1, height);
    }
}
