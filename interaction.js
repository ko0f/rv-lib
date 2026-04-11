// interaction.js — mouse/keyboard event handling; drives viewport and fires high-level events
import { VOL_RATIO } from './viewport.js';

const LEFT_PREFETCH_EDGE_RATIO = 0.2; // keep in sync with chart backfill (visible / cache edge)

/**
 * When more history should be loaded to the left: visible range is near or past the
 * oldest cached bar, and server may still have older data.
 * @returns {{ before: number } | null}
 */
export function getLeftPrefetchParams(dataStore, symbol, resolution, viewport) {
    const all = dataStore.getAll(symbol, resolution);
    if (!all.length) return null;

    const cachedLeft  = all[0].t;
    const cachedRight = all[all.length - 1].t;
    const cachedRange = cachedRight - cachedLeft;
    if (cachedRange <= 0) return null;

    const avail = dataStore.getAvailability(symbol, resolution);
    if (avail && cachedLeft <= avail.earliest) return null;

    const { from } = viewport.visibleRange();
    if ((from - cachedLeft) / cachedRange < LEFT_PREFETCH_EDGE_RATIO) {
        return { before: cachedLeft };
    }
    return null;
}

const TRACKPAD_ZOOM_SENSITIVITY = 0.009;
const MOUSE_WHEEL_ZOOM_SENSITIVITY = 0.001;

export class Interaction {
    constructor(canvas, viewport, dataStore) {
        this._canvas   = canvas;
        this._vp       = viewport;
        this._ds       = dataStore;
        this._dragging = false;
        this._dragMode = null; // 'pan' | 'price-scale'
        this._lastX    = 0;
        this._lastY    = 0;
        this._symbol   = null;
        this._resolution  = null;
        this._prefetching = false;
        this._cbs      = new Map();
        this._attached = [];

        this._attach(canvas, 'wheel',      this._onWheel,      { passive: false });
        this._attach(canvas, 'mousedown',  this._onMouseDown);
        this._attach(canvas, 'mousemove',  this._onMouseMove);
        this._attach(canvas, 'mouseup',    this._onMouseUp);
        this._attach(canvas, 'mouseleave', this._onMouseLeave);
        this._attach(canvas, 'dblclick',   this._onDblClick);
        this._attach(window, 'keydown',    this._onKeyDown);
    }

    _attach(target, event, fn, opts) {
        const bound = fn.bind(this);
        target.addEventListener(event, bound, opts);
        this._attached.push([target, event, bound]);
    }

    on(event, fn) {
        if (!this._cbs.has(event)) this._cbs.set(event, []);
        this._cbs.get(event).push(fn);
    }

    _emit(event, data) {
        for (const fn of (this._cbs.get(event) ?? [])) fn(data);
    }

    setContext(symbol, resolution) {
        this._symbol     = symbol;
        this._resolution = resolution;
        this._prefetching = false;
    }

    resetPrefetch() {
        this._prefetching = false;
    }

    _onWheel(e) {
        e.preventDefault();
        // Normalize wheel delta so trackpad zoom is smooth and less jumpy.
        const lineHeightPx = 16;
        const pageHeightPx = this._vp.height || 800;
        const deltaXpx =
            e.deltaMode === 1 ? e.deltaX * lineHeightPx :
            e.deltaMode === 2 ? e.deltaX * pageHeightPx :
            e.deltaX;
        const deltaYpx =
            e.deltaMode === 1 ? e.deltaY * lineHeightPx :
            e.deltaMode === 2 ? e.deltaY * pageHeightPx :
            e.deltaY;
        const absX = Math.abs(deltaXpx);
        const absY = Math.abs(deltaYpx);
        const isHorizontalPan = !e.ctrlKey && absX > 0.5 && absX > absY * 1.2;

        if (isHorizontalPan) {
            this._vp.pan(-deltaXpx);
            this._checkPrefetch();
            return;
        }

        const clampedDelta = Math.max(-120, Math.min(120, deltaYpx));
        // deltaMode line/page is usually mouse wheel; in pixel mode, large jumps
        // are typically a physical wheel while small deltas are trackpad.
        const isMouseWheel = e.deltaMode !== 0 || Math.abs(e.deltaY) >= 40;
        const sensitivity = isMouseWheel ? MOUSE_WHEEL_ZOOM_SENSITIVITY : TRACKPAD_ZOOM_SENSITIVITY;
        const factor = Math.exp(clampedDelta * sensitivity);
        this._vp.zoom(factor, this._vp.width);
        this._checkPrefetch();
    }

    _onMouseDown(e) {
        const rect = this._canvas.getBoundingClientRect();
        const x    = e.clientX - rect.left;
        const y    = e.clientY - rect.top;
        const priceH = this._vp.height * (1 - VOL_RATIO);

        this._dragging = true;
        this._lastX    = e.clientX;
        this._lastY    = e.clientY;
        if (x >= this._vp.width && y >= 0 && y <= priceH) {
            this._dragMode = 'price-scale';
            this._canvas.style.cursor = 'ns-resize';
        } else {
            this._dragMode = 'pan';
            this._canvas.style.cursor = 'grabbing';
        }
    }

    _onMouseMove(e) {
        const rect = this._canvas.getBoundingClientRect();
        const x    = e.clientX - rect.left;
        const y    = e.clientY - rect.top;
        if (this._dragging) {
            if (this._dragMode === 'price-scale') {
                const dy = e.clientY - this._lastY;
                this._lastY = e.clientY;
                const factor = Math.exp(dy * 0.01);
                this._vp.zoomPrice(factor, y);
            } else {
                const dx = e.clientX - this._lastX;
                this._lastX = e.clientX;
                this._vp.pan(dx);
                this._checkPrefetch();
            }
        } else {
            const priceH = this._vp.height * (1 - VOL_RATIO);
            this._canvas.style.cursor = (x >= this._vp.width && y >= 0 && y <= priceH) ? 'ns-resize' : 'crosshair';
            this._emit('hover', { x, y });
        }
    }

    _onMouseUp() {
        this._dragging = false;
        this._dragMode = null;
        this._canvas.style.cursor = 'crosshair';
        this._checkPrefetch();
    }

    _onMouseLeave() {
        this._dragging = false;
        this._dragMode = null;
        this._canvas.style.cursor = 'crosshair';
        this._emit('hover', null);
    }

    _onDblClick() {
        this._emit('open-symbol-picker');
    }

    _onKeyDown(e) {
        // Only fire if focus is not inside an input
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (e.key === 'Enter') {
            e.preventDefault();
            this._emit('open-symbol-picker');
            return;
        }
        const map = { '1': '1m', '5': '5m', '3': '30m', h: '1h', d: '1d', w: '1w' };
        if (map[e.key]) {
            e.preventDefault();
            this._emit('resolution-change', map[e.key]);
        }
    }

    _checkPrefetch() {
        if (!this._symbol || !this._resolution || this._prefetching) return;
        const params = getLeftPrefetchParams(this._ds, this._symbol, this._resolution, this._vp);
        if (!params) return;
        this._prefetching = true;
        this._emit('prefetch-left', params);
    }

    destroy() {
        for (const [target, event, fn] of this._attached) {
            target.removeEventListener(event, fn);
        }
    }
}
