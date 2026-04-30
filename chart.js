// chart.js — orchestrator: wires all modules, owns the RAF animation loop
import { readTheme }    from './theme.js';
import { HttpClient }   from './http-client.js';
import { WsClient }     from './ws-client.js';
import { DataStore }    from './data-store.js';
import { Viewport }     from './viewport.js';
import { Interaction, getLeftPrefetchParams } from './interaction.js';
import { SymbolPicker } from './symbol-picker.js';
import {
    PRICE_AXIS_W, TIME_AXIS_H,
    drawBackground, drawGrid, drawCandles, drawVolume, drawVolumeSeparator,
    drawTimeAxis, drawPriceAxis, drawCurrentPriceAxisLabel, drawVolumeAxis, drawCrosshair, drawLiveIndicator, drawNoDataMarker,
    rowIndexByRef,
} from './renderer.js';

const CANDLE_MS = { '1m': 60e3, '5m': 300e3, '30m': 1800e3, '1h': 3600e3, '1d': 86400e3, '1w': 604800e3 };
const RESOLUTIONS = Object.keys(CANDLE_MS);
const RESOLUTION_SET = new Set(RESOLUTIONS);
const RESOLUTION_STORAGE_KEY = 'rigoview.resolution';

function readStoredResolution() {
    try {
        const s = localStorage.getItem(RESOLUTION_STORAGE_KEY);
        if (s && RESOLUTION_SET.has(s)) return s;
    } catch (_) { /* private mode / quota */ }
    return null;
}

function writeStoredResolution(resolution) {
    try {
        localStorage.setItem(RESOLUTION_STORAGE_KEY, resolution);
    } catch (_) { /* private mode / quota */ }
}

function resolveInitialResolution(explicit) {
    if (explicit && RESOLUTION_SET.has(explicit)) return explicit;
    return readStoredResolution() ?? '1h';
}

function resolveResolutionForMeta(currentResolution, meta) {
    const supported = Array.isArray(meta?.supportedResolutions)
        ? meta.supportedResolutions.filter((r) => RESOLUTION_SET.has(r))
        : null;
    if (supported && supported.includes(currentResolution)) return currentResolution;
    const minResolution = typeof meta?.minResolution === 'string' && RESOLUTION_SET.has(meta.minResolution)
        ? meta.minResolution
        : null;
    if (minResolution && (!supported || supported.includes(minResolution))) return minResolution;
    if (supported && supported.length) return supported[0];
    return currentResolution;
}

function getUnsupportedResolutionFallback(err) {
    const payload = err && typeof err === 'object' && err.error && typeof err.error === 'object'
        ? err.error
        : err;
    if (!payload || payload.error !== 'unsupported_resolution') return null;
    const fallback = typeof payload.minResolution === 'string' ? payload.minResolution : null;
    return fallback && RESOLUTION_SET.has(fallback) ? fallback : null;
}

const RIGHT_GUTTER_PX = 20;

export class Chart {
    constructor(container, options) {
        this._container  = container;
        this._options    = options;
        this._symbol     = options.symbol     ?? null;
        this._resolution = resolveInitialResolution(options.resolution);
        this._meta       = null;
        this._destroyed  = false;
        this._hoverPos   = null;
        this._hoverCandle = null;
        this._barWidthPx = options.barWidthPx ?? null;
        this._ignoreGaps = options.ignoreGaps !== false;
        this._disableTopBar = options.disableTopBar === true;
        this._readOnly = options.readOnly === true;
        this._displayName = options.displayName ?? null;
        /** Serializes left-history pagination so it runs without relying on wheel/pan. */
        this._backfillLeftRunning = false;

        /** Ordered symbol navigation history (toolbar back/forward). */
        this._symbolHistory = [];
        this._symbolHistoryIdx = -1;
        this._navigatingHistory = false;
        if (this._symbol) {
            this._symbolHistory.push(this._symbol);
            this._symbolHistoryIdx = 0;
        }

        // RAF dirty flags
        this._staticDirty  = true;
        this._overlayDirty = false;
        this._rafScheduled = false;

        this._buildDOM();
        this._dpr = window.devicePixelRatio || 1;
        this._resize();

        this._theme = readTheme(container);
        this._http  = new HttpClient(options.apiBase);
        this._ws    = new WsClient(options.wsBase);
        this._ds    = new DataStore(this._http);
        this._vp    = new Viewport(this._chartW(), this._chartH(), {
            priceLogScale:  options.priceLogScale === true,
            priceYInverted: options.priceYInverted === true,
        });
        this._updateLogBtnStyle();
        this._updateInvBtnStyle();

        this._interaction = new Interaction(this._overlayCanvas, this._vp, this._ds);
        this._picker = new SymbolPicker(container, this._http, (id) => this.setSymbol(id));

        this._wireEvents();

        this._resizeObserver = new ResizeObserver(() => this._onResize());
        this._resizeObserver.observe(this._canvasWrap);

        this._updateToolbar();

        if (this._symbol) this._load();
        else this.invalidate('static'); // draw empty state
    }

    // ---- DOM setup ----

    _buildDOM() {
        this._container.style.cssText += ';position:relative;overflow:hidden';

        // Toolbar
        this._toolbar = document.createElement('div');
        this._toolbar.style.cssText = [
            'display:flex;align-items:center;gap:4px;flex-shrink:0',
            'height:36px;padding:0 10px;box-sizing:border-box',
            'background:var(--widget-bg-color,#141722)',
            'border-bottom:1px solid var(--widget-border-color,#252836)',
            'color:var(--text-color,#a0a8b8);font:13px monospace',
        ].join(';');

        this._symbolBtn = document.createElement('button');
        this._symbolBtn.style.cssText = [
            'background:rgba(255,255,255,0.08);border:none;border-radius:3px',
            'color:var(--text-bright-color,#e0e8f0);font:600 13px monospace',
            'padding:3px 10px;cursor:pointer;margin-right:8px;white-space:nowrap',
        ].join(';');
        this._symbolBtn.textContent = this._displayName ?? this._symbol ?? 'Select symbol';
        this._symbolBtn.addEventListener('click', () => { if (!this._readOnly) this._picker.open(); });
        if (this._readOnly) {
            this._symbolBtn.style.cursor = 'default';
            this._symbolBtn.style.pointerEvents = 'none';
        }
        this._toolbar.appendChild(this._symbolBtn);

        const navBtnStyle = [
            'background:none;border:none;border-radius:3px',
            'padding:3px 8px;cursor:pointer;font:14px monospace',
            'color:var(--text-dim-color,#505870)',
            'flex-shrink:0;min-width:28px',
        ].join(';');

        this._backBtn = document.createElement('button');
        this._backBtn.type = 'button';
        this._backBtn.textContent = '\u2190';
        this._backBtn.title = 'Previous symbol';
        this._backBtn.setAttribute('aria-label', 'Previous symbol');
        this._backBtn.style.cssText = navBtnStyle;
        this._backBtn.addEventListener('click', () => void this._goBack());
        this._toolbar.appendChild(this._backBtn);

        this._fwdBtn = document.createElement('button');
        this._fwdBtn.type = 'button';
        this._fwdBtn.textContent = '\u2192';
        this._fwdBtn.title = 'Next symbol';
        this._fwdBtn.setAttribute('aria-label', 'Next symbol');
        this._fwdBtn.style.cssText = navBtnStyle;
        this._fwdBtn.addEventListener('click', () => void this._goForward());
        this._toolbar.appendChild(this._fwdBtn);

        if (this._readOnly) {
            this._backBtn.style.display = 'none';
            this._fwdBtn.style.display  = 'none';
        }

        // Resolution buttons
        this._resBtns = {};
        for (const r of RESOLUTIONS) {
            const btn = document.createElement('button');
            btn.textContent = r;
            btn.dataset.res = r;
            btn.style.cssText = [
                'background:none;border:none;border-radius:3px',
                'padding:3px 8px;cursor:pointer;font:12px monospace',
                'color:var(--text-dim-color,#505870)',
                'flex-shrink:0',
            ].join(';');
            btn.addEventListener('click', () => this.setResolution(r));
            this._resBtns[r] = btn;
            this._toolbar.appendChild(btn);
        }

        // Canvas wrapper — takes remaining height
        this._canvasWrap = document.createElement('div');
        this._canvasWrap.style.cssText = 'position:relative;flex:1;min-height:0;overflow:hidden';

        this._staticCanvas  = document.createElement('canvas');
        this._overlayCanvas = document.createElement('canvas');
        for (const c of [this._staticCanvas, this._overlayCanvas]) {
            c.style.cssText = 'position:absolute;top:0;left:0;display:block';
        }
        this._overlayCanvas.style.cursor = 'crosshair';

        this._canvasWrap.appendChild(this._staticCanvas);
        this._canvasWrap.appendChild(this._overlayCanvas);

        const axisCornerBtn = (extra) =>
            [
                'position:absolute',
                'bottom:0',
                `height:${TIME_AXIS_H}px`,
                'padding:0',
                'margin:0',
                'box-sizing:border-box',
                'border:none',
                'border-left:1px solid var(--widget-border-color,#252836)',
                'display:flex',
                'align-items:center',
                'justify-content:center',
                'background:transparent',
                'color:var(--text-dim-color,#505870)',
                'font:600 9px monospace',
                'letter-spacing:0.03em',
                'cursor:pointer',
                'z-index:2',
                ...extra,
            ].join(';');

        const btnHalfW = Math.floor(PRICE_AXIS_W / 2);
        this._invBtn = document.createElement('button');
        this._invBtn.type = 'button';
        this._invBtn.textContent = 'INV';
        this._invBtn.title = 'Invert vertical price axis';
        this._invBtn.setAttribute('aria-label', 'Invert vertical price axis');
        this._invBtn.style.cssText = axisCornerBtn([
            `right:${btnHalfW}px`,
            `width:${btnHalfW}px`,
            'border-right:1px solid var(--widget-border-color,#252836)',
        ]);
        this._invBtn.addEventListener('click', () => this._toggleInvertY());

        this._logBtn = document.createElement('button');
        this._logBtn.type = 'button';
        this._logBtn.textContent = 'LOG';
        this._logBtn.title = 'Toggle logarithmic price scale';
        this._logBtn.setAttribute('aria-label', 'Toggle logarithmic price scale');
        this._logBtn.style.cssText = axisCornerBtn([`right:0`, `width:${btnHalfW}px`]);
        this._logBtn.addEventListener('click', () => this._toggleLogScale());
        this._canvasWrap.appendChild(this._invBtn);
        this._canvasWrap.appendChild(this._logBtn);

        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%';
        wrapper.appendChild(this._toolbar);
        wrapper.appendChild(this._canvasWrap);
        this._container.appendChild(wrapper);
        if (this._disableTopBar) this._toolbar.style.display = 'none';
    }

    _chartW() { return Math.max(1, this._canvasWrap.clientWidth  - PRICE_AXIS_W); }
    _chartH() { return Math.max(1, this._canvasWrap.clientHeight - TIME_AXIS_H);  }

    _toggleLogScale() {
        this._vp.priceLogScale = !this._vp.priceLogScale;
        this._vp.priceLocked = false;
        const candles = this._visibleCandles();
        if (candles.length) this._vp.fitToCandles(candles);
        this._updateLogBtnStyle();
        this.invalidate('static');
    }

    _toggleInvertY() {
        this._vp.priceYInverted = !this._vp.priceYInverted;
        this._vp.priceLocked = false;
        const candles = this._visibleCandles();
        if (candles.length) this._vp.fitToCandles(candles);
        this._updateInvBtnStyle();
        this.invalidate('static');
    }

    _updateLogBtnStyle() {
        const on = this._vp.priceLogScale;
        this._logBtn.style.color = on ? 'var(--text-bright-color,#e0e8f0)' : 'var(--text-dim-color,#505870)';
        this._logBtn.style.background = on ? 'rgba(255,255,255,0.14)' : 'transparent';
    }

    _updateInvBtnStyle() {
        const on = this._vp.priceYInverted;
        this._invBtn.style.color = on ? 'var(--text-bright-color,#e0e8f0)' : 'var(--text-dim-color,#505870)';
        this._invBtn.style.background = on ? 'rgba(255,255,255,0.14)' : 'transparent';
    }

    _resize() {
        const dpr = this._dpr;
        const w   = Math.max(1, this._canvasWrap.clientWidth);
        const h   = Math.max(1, this._canvasWrap.clientHeight);
        for (const canvas of [this._staticCanvas, this._overlayCanvas]) {
            canvas.width        = w * dpr;
            canvas.height       = h * dpr;
            canvas.style.width  = w + 'px';
            canvas.style.height = h + 'px';
        }
    }

    _onResize() {
        if (this._destroyed) return;
        this._resize();
        this._vp.resize(this._chartW(), this._chartH());
        const candles = this._visibleCandles();
        if (candles.length) this._vp.fitToCandles(candles);
        this.invalidate('static');
        void this._backfillLeftHistory();
    }

    // ---- Event wiring ----

    _wireEvents() {
        this._vp.on('viewport:changed', () => {
            if (this._symbol) {
                const candles = this._visibleCandles();
                if (candles.length) this._vp.fitToCandles(candles);
            }
            this.invalidate('static');
        });

        this._ds.addEventListener('data:loaded', (e) => {
            const { symbol, resolution } = e.detail;
            if (symbol !== this._symbol || resolution !== this._resolution) return;
            const candles = this._visibleCandles();
            if (candles.length) this._vp.fitToCandles(candles);
            this.invalidate('static');
        });

        this._ds.addEventListener('data:live-tick', (e) => {
            const { symbol, resolution } = e.detail;
            if (symbol !== this._symbol || resolution !== this._resolution) return;
            this.invalidate('static');
        });

        this._ds.addEventListener('data:close', (e) => {
            const { symbol, resolution } = e.detail;
            if (symbol !== this._symbol || resolution !== this._resolution) return;
            this.invalidate('static');
        });

        // WS events — route to buffer or directly to DataStore
        this._ws.addEventListener('partial', (e) => {
            const d = e.detail;
            if (this._ds.isBuffering(d.symbol, d.resolution)) {
                this._ds.bufferWsEvent(d.symbol, d.resolution, d);
            } else {
                this._ds.applyPartial(d.symbol, d.resolution, d);
            }
        });

        this._ws.addEventListener('close', (e) => {
            const d = e.detail;
            if (this._ds.isBuffering(d.symbol, d.resolution)) {
                this._ds.bufferWsEvent(d.symbol, d.resolution, d);
            } else {
                this._ds.applyClose(d.symbol, d.resolution, d);
            }
        });

        this._interaction.on('hover', (pos) => {
            this._hoverPos = pos;
            if (pos) {
                const { from, to } = this._vp.visibleRange();
                const candles    = this._ds.getWindow(this._symbol, this._resolution, from, to, this._ignoreGaps);
                const allCandles = this._ds.getAll(this._symbol, this._resolution);
                this._hoverCandle = this._findCandleAtX(candles, allCandles, pos.x);
            } else {
                this._hoverCandle = null;
            }
            this.invalidate('overlay');
        });

        this._interaction.on('open-symbol-picker', () => this._picker.open());

        this._interaction.on('resolution-change', (res) => this.setResolution(res));

        this._interaction.on('prefetch-left', async ({ before }) => {
            if (!this._symbol) return;
            try {
                await this._ds.load(this._symbol, this._resolution, { before });
                await this._backfillLeftHistory();
            } finally {
                this._interaction.resetPrefetch();
            }
        });
    }

    /**
     * Keeps requesting older bars until the visible window is no longer in the left-prefetch
     * zone (same rule as wheel/pan prefetch) or the store/API cannot move the oldest bar left.
     */
    async _backfillLeftHistory() {
        if (!this._symbol || this._destroyed || this._backfillLeftRunning) return;
        this._backfillLeftRunning = true;
        const maxRounds = 200;
        try {
            for (let round = 0; round < maxRounds && !this._destroyed; round++) {
                const params = getLeftPrefetchParams(this._ds, this._symbol, this._resolution, this._vp);
                if (!params) break;

                const prevOldest = this._ds.getOldest(this._symbol, this._resolution);
                if (prevOldest == null) break;

                try {
                    await this._ds.load(this._symbol, this._resolution, params);
                } catch (err) {
                    console.error('[RigoView] Left history backfill failed', err);
                    break;
                }

                const newOldest = this._ds.getOldest(this._symbol, this._resolution);
                if (newOldest == null || newOldest >= prevOldest) break;

                const visible = this._visibleCandles();
                if (visible.length) this._vp.fitToCandles(visible);
                this.invalidate('static');
            }
        } finally {
            this._backfillLeftRunning = false;
        }
    }

    _findCandleAtX(candles, allCandles, x) {
        if (!candles.length || !allCandles.length) return null;
        const candleMs = CANDLE_MS[this._resolution] ?? CANDLE_MS['1h'];
        let best = null, bestDist = Infinity;
        if (this._ignoreGaps) {
            const n            = allCandles.length;
            const baseCompactT = allCandles[n - 1].t - (n - 1) * candleMs;
            const rowIdx       = rowIndexByRef(allCandles);
            for (const c of candles) {
                const fullIdx = rowIdx.get(c);
                if (fullIdx === undefined) continue;
                const compactT = baseCompactT + fullIdx * candleMs;
                const dist = Math.abs(this._vp.timeToX(compactT) - x);
                if (dist < bestDist) { bestDist = dist; best = c; }
            }
        } else {
            for (const c of candles) {
                const dist = Math.abs(this._vp.timeToX(c.t) - x);
                if (dist < bestDist) { bestDist = dist; best = c; }
            }
        }
        return bestDist < 60 ? best : null;
    }

    _visibleCandles() {
        if (!this._symbol) return [];
        const { from, to } = this._vp.visibleRange();
        return this._ds.getWindow(this._symbol, this._resolution, from, to, this._ignoreGaps);
    }

    _maxRightEdgeT(latestTs, resolution = this._resolution) {
        if (!Number.isFinite(latestTs)) return null;
        const candleMs = CANDLE_MS[resolution] ?? CANDLE_MS['1h'];
        return latestTs + candleMs * 0.5 + this._vp.msPerPixel * RIGHT_GUTTER_PX;
    }

    _clampRightEdgeToLatest() {
        if (!this._symbol) return;
        const allCandles = this._ds.getAll(this._symbol, this._resolution);
        if (!allCandles.length) return;
        const latestTs = allCandles[allCandles.length - 1].t;
        const maxRightEdgeT = this._maxRightEdgeT(latestTs, this._resolution);
        if (maxRightEdgeT === null) return;
        if (this._vp.rightEdgeT > maxRightEdgeT) this._vp.rightEdgeT = maxRightEdgeT;
    }

    _alignRightEdgeToLatest(candles, resolution) {
        if (!candles.length) return;
        const last = candles[candles.length - 1];
        const maxRightEdgeT = this._maxRightEdgeT(last.t, resolution);
        if (maxRightEdgeT !== null) this._vp.rightEdgeT = maxRightEdgeT;
    }

    // ---- RAF loop ----

    invalidate(layer) {
        if (layer === 'static') { this._staticDirty = true; this._overlayDirty = true; }
        if (layer === 'overlay') this._overlayDirty = true;
        if (!this._rafScheduled) {
            this._rafScheduled = true;
            requestAnimationFrame(() => this._frame());
        }
    }

    _frame() {
        if (this._destroyed) return;
        this._rafScheduled = false;
        if (this._staticDirty)  this._drawStatic();
        if (this._overlayDirty) this._drawOverlay();
        this._staticDirty  = false;
        this._overlayDirty = false;
    }

    _drawStatic() {
        const dpr  = this._dpr;
        const ctx  = this._staticCanvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, this._staticCanvas.width / dpr, this._staticCanvas.height / dpr);

        this._clampRightEdgeToLatest();

        const vp         = this._vp;
        const theme      = this._theme;
        const resolution = this._resolution;
        const { from, to } = vp.visibleRange();
        const allCandles = this._symbol ? this._ds.getAll(this._symbol, resolution) : [];
        const candles    = this._symbol ? this._ds.getWindow(this._symbol, resolution, from, to, this._ignoreGaps) : [];
        const avail      = this._symbol ? this._ds.getAvailability(this._symbol, resolution) : null;
        const priceScale = this._meta?.priceScale;

        drawBackground(ctx, vp, theme);
        drawGrid(ctx, vp, theme);
        drawVolume(ctx, candles, allCandles, vp, resolution, theme, this._ignoreGaps);
        drawCandles(ctx, candles, allCandles, vp, resolution, theme, this._ignoreGaps);

        // No-data marker when panned past availability boundary
        if (avail && candles.length === 0 && this._ds.getAll(this._symbol, resolution).length > 0) {
            const all = this._ds.getAll(this._symbol, resolution);
            if (from < all[0].t)            drawNoDataMarker(ctx, vp, theme, 'left');
            if (to   > all[all.length - 1].t) drawNoDataMarker(ctx, vp, theme, 'right');
        }

        // Live indicator (forming candle's close price)
        const all = this._symbol ? this._ds.getAll(this._symbol, resolution) : [];
        if (all.length) {
            const last = all[all.length - 1];
            if (last.live) drawLiveIndicator(ctx, last.c, vp, theme);
        }

        drawTimeAxis(ctx, vp, theme);
        drawPriceAxis(ctx, vp, theme, priceScale);
        if (all.length) drawCurrentPriceAxisLabel(ctx, vp, theme, priceScale, all[all.length - 1]);
        drawVolumeAxis(ctx, candles, vp, theme);
        drawVolumeSeparator(ctx, vp, theme);
    }

    _drawOverlay() {
        const dpr = this._dpr;
        const ctx = this._overlayCanvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, this._overlayCanvas.width / dpr, this._overlayCanvas.height / dpr);

        drawCrosshair(ctx, this._hoverPos, this._hoverCandle, this._vp, this._theme, this._meta?.priceScale, this._resolution);
    }

    // ---- Public commands ----

    async _load() {
        if (!this._symbol) return;

        this._updateToolbar();

        try {
            this._meta = await this._http.getSymbolMeta(this._symbol);
        } catch {
            this._meta = null;
        }

        const effectiveResolution = resolveResolutionForMeta(this._resolution, this._meta);
        if (effectiveResolution !== this._resolution) {
            this._resolution = effectiveResolution;
            writeStoredResolution(effectiveResolution);
        }

        // §4.4 sync contract: subscribe first, buffer WS events, then HTTP fetch
        this._ds.startBuffering(this._symbol, this._resolution);
        this._ws.subscribe(this._symbol, this._resolution);
        this._interaction.setContext(this._symbol, this._resolution);
        this._vp.adjustZoomForResolution(this._resolution);
        if (this._barWidthPx) {
            const candleMs = CANDLE_MS[this._resolution] ?? CANDLE_MS['1h'];
            this._vp.msPerPixel = candleMs / this._barWidthPx;
        }
        this._updateToolbar();

        try {
            const loadParams = this._barWidthPx
                ? { count: Math.ceil((this._vp.width / this._barWidthPx) * 1.1) }
                : {};
            await this._ds.load(this._symbol, this._resolution, loadParams);
            const candles = this._ds.getAll(this._symbol, this._resolution);
            this._alignRightEdgeToLatest(candles, this._resolution);
            const visible = this._visibleCandles();
            if (visible.length) this._vp.fitToCandles(visible);
            else if (candles.length) this._vp.fitToCandles(candles);
            this.invalidate('static');
            await this._backfillLeftHistory();
        } catch (err) {
            const fallback = getUnsupportedResolutionFallback(err);
            if (fallback && fallback !== this._resolution) {
                await this.setResolution(fallback);
                return;
            }
            console.error('[RigoView] Failed to load candles', err);
        }
    }

    _updateToolbar() {
        this._symbolBtn.textContent = this._displayName ?? this._symbol ?? 'Select symbol';
        const supported = Array.isArray(this._meta?.supportedResolutions)
            ? new Set(this._meta.supportedResolutions.filter((r) => RESOLUTION_SET.has(r)))
            : null;
        for (const [r, btn] of Object.entries(this._resBtns)) {
            const active = r === this._resolution;
            // Without constraints (!supported), only treat as "all enabled" when no symbol is
            // selected. If we have a symbol but meta is missing or omits supportedResolutions,
            // enabling every bar size wrongly allows 1h on daily-only feeds (see resolveResolutionForMeta).
            const enabled = !this._symbol ? !supported || supported.has(r) : supported !== null && supported.has(r);
            btn.style.color      = active ? 'var(--text-bright-color,#e0e8f0)' : 'var(--text-dim-color,#505870)';
            btn.style.background = active ? 'rgba(255,255,255,0.1)' : 'none';
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.35';
            btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        }
        this._updateNavButtons();
    }

    _updateNavButtons() {
        const canBack = this._symbolHistoryIdx > 0;
        const canFwd  = this._symbolHistoryIdx < this._symbolHistory.length - 1;
        this._backBtn.disabled = !canBack;
        this._fwdBtn.disabled  = !canFwd;
        this._backBtn.style.opacity = canBack ? '1' : '0.3';
        this._fwdBtn.style.opacity  = canFwd  ? '1' : '0.3';
        this._backBtn.style.pointerEvents = canBack ? 'auto' : 'none';
        this._fwdBtn.style.pointerEvents  = canFwd  ? 'auto' : 'none';
        this._backBtn.style.cursor = canBack ? 'pointer' : 'default';
        this._fwdBtn.style.cursor  = canFwd  ? 'pointer' : 'default';
    }

    async _goBack() {
        if (this._symbolHistoryIdx <= 0) return;
        this._navigatingHistory = true;
        try {
            this._symbolHistoryIdx--;
            await this.setSymbol(this._symbolHistory[this._symbolHistoryIdx]);
        } finally {
            this._navigatingHistory = false;
        }
    }

    async _goForward() {
        if (this._symbolHistoryIdx >= this._symbolHistory.length - 1) return;
        this._navigatingHistory = true;
        try {
            this._symbolHistoryIdx++;
            await this.setSymbol(this._symbolHistory[this._symbolHistoryIdx]);
        } finally {
            this._navigatingHistory = false;
        }
    }

    async setSymbol(symbol) {
        if (symbol === this._symbol) return;
        if (!this._navigatingHistory) {
            this._symbolHistory.splice(this._symbolHistoryIdx + 1);
            this._symbolHistory.push(symbol);
            this._symbolHistoryIdx = this._symbolHistory.length - 1;
        }
        if (this._symbol) this._ws.unsubscribe(this._symbol, this._resolution);
        this._symbol      = symbol;
        this._options.onSymbolChange?.(symbol);
        this._meta        = null;
        this._updateToolbar();
        this._hoverPos    = null;
        this._hoverCandle = null;
        this._vp.priceLocked = false;
        await this._load();
    }

    async setResolution(resolution) {
        if (resolution === this._resolution) return;
        if (Array.isArray(this._meta?.supportedResolutions) && !this._meta.supportedResolutions.includes(resolution)) {
            const fallback = resolveResolutionForMeta(this._resolution, this._meta);
            if (fallback === this._resolution) return;
            resolution = fallback;
        }
        if (this._symbol) this._ws.unsubscribe(this._symbol, this._resolution);
        this._resolution   = resolution;
        writeStoredResolution(resolution);
        this._updateToolbar();
        this._vp.adjustZoomForResolution(resolution);
        if (this._barWidthPx) {
            const candleMs = CANDLE_MS[resolution] ?? CANDLE_MS['1h'];
            this._vp.msPerPixel = candleMs / this._barWidthPx;
        }

        if (this._symbol) {
            this._ds.startBuffering(this._symbol, resolution);
            this._ws.subscribe(this._symbol, resolution);
            this._interaction.setContext(this._symbol, resolution);
            try {
                await this._ds.load(this._symbol, resolution);
                const candles = this._ds.getAll(this._symbol, resolution);
                this._alignRightEdgeToLatest(candles, resolution);
                // Match initial _load / data:loaded: scale Y to the on-screen window so
                // off-screen history (bad ticks, wide ranges) does not squash candles.
                const visible = this._visibleCandles();
                if (visible.length) this._vp.fitToCandles(visible);
                else if (candles.length) this._vp.fitToCandles(candles);
                this.invalidate('static');
                await this._backfillLeftHistory();
            } catch (err) {
                const fallback = getUnsupportedResolutionFallback(err);
                if (fallback && fallback !== resolution) {
                    await this.setResolution(fallback);
                    return;
                }
                console.error('[RigoView] Failed to load candles', err);
            }
        }
    }

    jumpTo(timestamp) {
        this._vp.rightEdgeT = timestamp + this._vp.width * this._vp.msPerPixel * 0.5;
        this.invalidate('static');
        void this._backfillLeftHistory();
    }

    destroy() {
        this._destroyed = true;
        this._resizeObserver?.disconnect();
        this._interaction?.destroy();
        this._ws?.destroy();
        this._picker?.destroy();
        // Clear container
        while (this._container.firstChild) this._container.removeChild(this._container.firstChild);
        this._container.style.position = '';
    }
}
