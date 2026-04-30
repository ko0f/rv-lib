// renderer.js — all canvas draw calls; stateless functions, no side effects
import { VOL_RATIO } from './viewport.js';
import dayjs from './dayjs.min.js';

/** Space below the candle/volume divider before volume bars may start (px). */
const VOL_TOP_GAP_PX = 12;

export const PRICE_AXIS_W = 70;
export const TIME_AXIS_H  = 30;

const FONT = '11px monospace';

// Resolution → candle duration in ms
const CANDLE_MS = { '1m': 60e3, '5m': 300e3, '30m': 1800e3, '1h': 3600e3, '1d': 86400e3, '1w': 604800e3 };

/** Row index by object identity (duplicate `t` timestamps do not collapse). */
export function rowIndexByRef(allCandles) {
    return new Map(allCandles.map((row, i) => [row, i]));
}

/**
 * Bullish (green-path) styling when close plots at or above open on screen.
 * Matches `close >= open` when Y is normal; swaps when `viewport.priceYInverted`.
 */
export function candleVisualUp(viewport, c) {
    return viewport.priceToY(c.c) <= viewport.priceToY(c.o);
}

// ---- Grid interval helpers ----

function niceNumber(value) {
    if (!value) return 1;
    const exp  = Math.floor(Math.log10(Math.abs(value)));
    const base = Math.pow(10, exp);
    const frac = value / base;
    let nice;
    if (frac <= 1)      nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 5) nice = 5;
    else                nice = 10;
    return nice * base;
}

function nicePriceInterval(range) {
    return niceNumber(range / 6);
}

/** Tick prices for logarithmic scale (geometric 1–2–5 per decade). */
function logPriceTicks(pmin, pmax, maxTicks = 12) {
    const lo = Math.log10(pmin);
    const hi = Math.log10(pmax);
    if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return [pmin, pmax];

    const ticks = [];
    const minE = Math.floor(lo - 1e-12);
    const maxE = Math.ceil(hi + 1e-12);
    for (let e = minE; e <= maxE; e++) {
        for (const m of [1, 2, 5]) {
            const v = m * 10 ** e;
            if (v >= pmin * (1 - 1e-15) && v <= pmax * (1 + 1e-15)) ticks.push(v);
        }
    }
    ticks.sort((a, b) => a - b);
    if (!ticks.length) {
        const n = 5;
        for (let i = 0; i <= n; i++) {
            const u = lo + ((hi - lo) * i) / n;
            ticks.push(10 ** u);
        }
        return ticks;
    }
    if (ticks.length > maxTicks) {
        const step = Math.ceil(ticks.length / maxTicks);
        return ticks.filter((_, i) => i % step === 0);
    }
    return ticks;
}

// Candidate time grid steps (ms), smallest to largest
const TIME_STEPS = [
    60e3, 5 * 60e3, 15 * 60e3, 30 * 60e3,
    3600e3, 4 * 3600e3, 12 * 3600e3,
    86400e3, 7 * 86400e3,
];

function niceTimeStep(msPerPixel, targetSpacingPx = 100) {
    const target = msPerPixel * targetSpacingPx;
    const preset = TIME_STEPS.find(s => s >= target);
    if (preset) return preset;
    // When zoomed far out, continue scaling so step always respects target spacing.
    let step = TIME_STEPS[TIME_STEPS.length - 1];
    while (step < target) step *= 2;
    return step;
}

function firstGridT(fromT, step) {
    return Math.ceil(fromT / step) * step;
}

function formatTimeLabel(t, step) {
    const d = dayjs(t);
    if (step >= 86400e3) return d.format('MMM D');
    if (d.hour() === 0 && d.minute() === 0 && step >= 3600e3) return d.format('MMM D');
    return d.format('HH:mm');
}

/** Jan 1 00:00:00 label for the time axis (local timezone). */
function formatYearBoundaryLabel(t) {
    return dayjs(t).format('YYYY');
}

/** Each local-timezone year start in [fromT, toT] inclusive. */
function localYearStartsInRange(fromT, toT) {
    const out = [];
    let y = dayjs(fromT).year();
    const yEnd = dayjs(toT).year();
    for (; y <= yEnd; y++) {
        const t = dayjs().year(y).startOf('year').valueOf();
        if (t >= fromT && t <= toT) out.push(t);
    }
    return out;
}

/**
 * Grid tick times plus forced year labels at UTC Jan 1 00:00.
 * Any grid tick within half a step of a year boundary is dropped in favor of the year label.
 */
function buildTimeAxisLabelItems(from, to, step) {
    const gridTs = [];
    for (let t = firstGridT(from, step); t <= to; t += step) gridTs.push(t);
    const yearTs = localYearStartsInRange(from, to);
    const replaceRad = step * 0.51;
    const nearYear = (g) => yearTs.some((yt) => Math.abs(g - yt) <= replaceRad);
    const items = [
        ...gridTs.filter((g) => !nearYear(g)).map((t) => ({ t, label: formatTimeLabel(t, step), isYear: false })),
        ...yearTs.map((t) => ({ t, label: formatYearBoundaryLabel(t), isYear: true })),
    ];
    items.sort((a, b) => a.t - b.t);
    return items;
}

/** Bottom crosshair strip: date always; time only for intraday resolutions (local timezone). */
function formatCrosshairTimeLabel(t, resolution) {
    const d = dayjs(t);
    const candleMs = CANDLE_MS[resolution] ?? CANDLE_MS['1h'];
    if (candleMs >= 86400e3) return d.format('MMM D, YYYY');
    return d.format('MMM D, YYYY HH:mm');
}

function formatPrice(p, priceScale) {
    const decimals = p >= 100 ? 0 : (priceScale ? Math.max(0, Math.round(Math.log10(priceScale))) : 2);
    return p.toLocaleString('en-US', { minimumFractionDigits: Math.min(decimals, 8), maximumFractionDigits: Math.min(decimals, 8) });
}

function formatVolumeAxis(v) {
    if (!Number.isFinite(v) || v <= 0) return '0';
    const a = Math.abs(v);
    const trim = (x) => {
        const s = x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2);
        return s.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1');
    };
    if (a >= 1e12) return `${trim(v / 1e12)}T`;
    if (a >= 1e9) return `${trim(v / 1e9)}B`;
    if (a >= 1e6) return `${trim(v / 1e6)}M`;
    if (a >= 1e3) return `${trim(v / 1e3)}K`;
    if (a >= 1) return Math.round(v).toLocaleString('en-US');
    return String(v);
}

const VOLUME_AXIS_LABEL_COUNT = 4;

/** `count` strictly increasing volume levels from `maxVol/count` … `maxVol`. */
function volumeAxisTicks(maxVol, count = VOLUME_AXIS_LABEL_COUNT) {
    if (!Number.isFinite(maxVol) || maxVol <= 0) return [];
    const ticks = [];
    for (let i = 1; i <= count; i++) ticks.push((maxVol * i) / count);
    return ticks.sort((a, b) => b - a);
}

// ---- Public draw functions ----

export function drawBackground(ctx, viewport, theme) {
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, viewport.width + PRICE_AXIS_W, viewport.height + TIME_AXIS_H);
}

export function drawGrid(ctx, viewport, theme) {
    const { width, height, priceMin, priceMax, msPerPixel, priceLogScale } = viewport;
    const priceH = height * (1 - VOL_RATIO);

    ctx.save();
    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth   = 1;

    // Horizontal price lines
    const priceLevels = priceLogScale
        ? logPriceTicks(priceMin, priceMax)
        : (() => {
            const priceInterval = nicePriceInterval(priceMax - priceMin);
            const firstP = Math.ceil(priceMin / priceInterval) * priceInterval;
            const arr = [];
            for (let p = firstP; p <= priceMax; p += priceInterval) arr.push(p);
            return arr;
        })();
    for (const p of priceLevels) {
        const y = Math.round(viewport.priceToY(p)) + 0.5;
        if (y < 0 || y > priceH) continue;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Vertical time lines
    const { from, to } = viewport.visibleRange();
    const step = niceTimeStep(msPerPixel);
    for (let t = firstGridT(from, step); t <= to; t += step) {
        const x = Math.round(viewport.timeToX(t)) + 0.5;
        if (x < 0 || x > width) continue;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    ctx.restore();
}

export function drawCandles(ctx, candles, allCandles, viewport, resolution, theme, ignoreGaps = true) {
    if (!candles.length || !allCandles.length) return;
    const compact      = ignoreGaps !== false;
    const candleMs     = CANDLE_MS[resolution] ?? CANDLE_MS['1h'];
    const cw           = candleMs / viewport.msPerPixel;
    const bw           = Math.max(1, cw - Math.max(1, cw * 0.15));
    const priceH = viewport.height * (1 - VOL_RATIO);
    const n        = allCandles.length;
    let baseCompactT;
    let rowIdx;
    if (compact) {
        baseCompactT = allCandles[n - 1].t - (n - 1) * candleMs;
        rowIdx = rowIndexByRef(allCandles);
    }

    ctx.save();
    for (const c of candles) {
        let plotT;
        if (compact) {
            const i = rowIdx.get(c);
            if (i === undefined) continue;
            plotT = baseCompactT + i * candleMs;
        } else {
            plotT = c.t;
        }
        const cx = viewport.timeToX(plotT) + cw / 2;
        if (cx < -cw || cx > viewport.width + cw) continue;

        const isUp     = candleVisualUp(viewport, c);
        const upColor  = theme.candleUp;
        const dnColor  = theme.candleDown;
        const bodyColor = isUp ? upColor : dnColor;
        const wickColor = isUp ? theme.wickUp : theme.wickDown;

        const bodyTop = Math.min(viewport.priceToY(c.o), viewport.priceToY(c.c));
        const bodyBot = Math.max(viewport.priceToY(c.o), viewport.priceToY(c.c));
        const bodyH   = Math.max(1, bodyBot - bodyTop);
        const wickTop = Math.max(0, viewport.priceToY(c.h));
        const wickBot = Math.min(priceH, viewport.priceToY(c.l));

        // Wick
        ctx.strokeStyle = cw < 2 ? bodyColor : wickColor;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(cx) + 0.5, wickTop);
        ctx.lineTo(Math.round(cx) + 0.5, wickBot);
        ctx.stroke();

        // Body (skip if sub-pixel wide — wick already drawn)
        if (cw >= 2) {
            const bx = Math.round(cx - bw / 2);
            const by = Math.round(bodyTop);
            const bh = Math.round(bodyH);
            if (c.live) {
                ctx.strokeStyle = bodyColor;
                ctx.lineWidth   = 1;
                ctx.strokeRect(bx + 0.5, by + 0.5, Math.round(bw) - 1, bh);
            } else {
                ctx.fillStyle = bodyColor;
                ctx.fillRect(bx, by, Math.round(bw), bh);
            }
        }
    }
    ctx.restore();
}

function candleVolumeTotal(c) {
    if (c.vb != null && c.vs != null) return (Number(c.vb) || 0) + (Number(c.vs) || 0);
    return c.v ?? 0;
}

export function drawVolume(ctx, candles, allCandles, viewport, resolution, theme, ignoreGaps = true) {
    if (!candles.length || !allCandles.length) return;

    const compact      = ignoreGaps !== false;
    const candleMs     = CANDLE_MS[resolution] ?? CANDLE_MS['1h'];
    const cw           = candleMs / viewport.msPerPixel;
    const bw           = Math.max(1, cw - Math.max(1, cw * 0.15));
    const priceH       = viewport.height * (1 - VOL_RATIO);
    const volH         = viewport.height * VOL_RATIO;
    const volDrawH     = Math.max(0, volH - VOL_TOP_GAP_PX);
    const maxVol       = candles.reduce((m, c) => Math.max(m, candleVolumeTotal(c)), 0);
    if (!maxVol || volDrawH <= 0) return;
    const n = allCandles.length;
    let baseCompactT;
    let rowIdx;
    if (compact) {
        baseCompactT = allCandles[n - 1].t - (n - 1) * candleMs;
        rowIdx = rowIndexByRef(allCandles);
    }
    const Y_base       = priceH + volH;
    const hasAnyPositiveVs = candles.some((c) => c.vs != null && Number(c.vs) > 0);

    ctx.save();
    for (const c of candles) {
        const vtot = candleVolumeTotal(c);
        if (!vtot) continue;
        let plotT;
        if (compact) {
            const i = rowIdx.get(c);
            if (i === undefined) continue;
            plotT = baseCompactT + i * candleMs;
        } else {
            plotT = c.t;
        }
        const cx = viewport.timeToX(plotT) + cw / 2;
        if (cx < -cw || cx > viewport.width + cw) continue;

        const bx = Math.round(cx - bw / 2);
        const bwR = Math.round(bw);
        const H = (vtot / maxVol) * volDrawH;

        const hasSplit = c.vb != null && c.vs != null;
        if (hasSplit && hasAnyPositiveVs) {
            const vb = Number(c.vb) || 0;
            const vs = Number(c.vs) || 0;
            const big = Math.max(vb, vs);
            const small = Math.min(vb, vs);
            const H_big = (big / maxVol) * volDrawH;
            const H_small = (small / maxVol) * volDrawH;
            const yTop = Y_base - H;
            ctx.fillStyle = theme.volStackGray;
            ctx.fillRect(bx, Math.round(yTop), bwR, Math.round(H_small));
            ctx.fillStyle = vs > vb ? theme.volSellDom : theme.volBuyDom;
            ctx.fillRect(bx, Math.round(yTop + H_small), bwR, Math.round(H_big));
        } else {
            ctx.fillStyle = !hasAnyPositiveVs ? theme.volNoSellSide : (candleVisualUp(viewport, c) ? theme.volUp : theme.volDown);
            ctx.fillRect(bx, Math.round(Y_base - H), bwR, Math.round(H));
        }
    }
    ctx.restore();
}

/** Horizontal rule between the candle/price pane and the volume pane. */
export function drawVolumeSeparator(ctx, viewport, theme) {
    const priceH = viewport.height * (1 - VOL_RATIO);
    const lw     = theme.volumeSeparatorLineWidth ?? 1;
    const y      = Math.round(priceH) + (lw % 2 === 1 ? 0.5 : 0);
    ctx.save();
    ctx.strokeStyle = theme.volumeSeparatorColor ?? theme.gridLine;
    ctx.lineWidth   = lw;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewport.width + PRICE_AXIS_W, y);
    ctx.stroke();
    ctx.restore();
}

export function drawTimeAxis(ctx, viewport, theme) {
    const { width, height, msPerPixel } = viewport;
    const y0   = height;
    const { from, to } = viewport.visibleRange();
    const step = niceTimeStep(msPerPixel);

    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, y0, width, TIME_AXIS_H);

    ctx.strokeStyle = theme.gridLine;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(0, y0 + 0.5);
    ctx.lineTo(width, y0 + 0.5);
    ctx.stroke();

    ctx.font         = FONT;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    const labelItems = buildTimeAxisLabelItems(from, to, step);
    let lastLabelRight = -Infinity;
    for (const { t, label, isYear } of labelItems) {
        const x = viewport.timeToX(t);
        if (x < 20 || x > width - 20) continue;
        ctx.fillStyle = isYear ? '#ffffff' : theme.textDim;
        const w = ctx.measureText(label).width;
        const left = x - w / 2;
        const right = x + w / 2;
        if (left <= lastLabelRight + 8) continue;
        ctx.fillText(label, x, y0 + TIME_AXIS_H / 2);
        lastLabelRight = right;
    }
}

export function drawPriceAxis(ctx, viewport, theme, priceScale) {
    const { width, height, priceMin, priceMax, priceLogScale } = viewport;
    const priceH = height * (1 - VOL_RATIO);
    const x0     = width;

    ctx.fillStyle = theme.bg;
    ctx.fillRect(x0, 0, PRICE_AXIS_W, height + TIME_AXIS_H);

    ctx.strokeStyle = theme.priceAxisSeparatorColor;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(x0 + 0.5, 0);
    ctx.lineTo(x0 + 0.5, height);
    ctx.stroke();

    ctx.fillStyle    = theme.textDim;
    ctx.font         = FONT;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';

    const priceLevels = priceLogScale
        ? logPriceTicks(priceMin, priceMax)
        : (() => {
            const interval = nicePriceInterval(priceMax - priceMin);
            const firstP   = Math.ceil(priceMin / interval) * interval;
            const arr = [];
            for (let p = firstP; p <= priceMax; p += interval) arr.push(p);
            return arr;
        })();
    for (const p of priceLevels) {
        const y = viewport.priceToY(p);
        if (y < 6 || y > priceH - 6) continue;
        ctx.fillText(formatPrice(p, priceScale), x0 + 6, y);
    }
}

/** Last bar’s close on the Y axis: white text on green/red to match the candle body. */
export function drawCurrentPriceAxisLabel(ctx, viewport, theme, priceScale, candle) {
    if (!candle || !Number.isFinite(candle.c) || !Number.isFinite(candle.o)) return;
    const y = viewport.priceToY(candle.c);
    const priceH = viewport.height * (1 - VOL_RATIO);
    if (y < 0 || y > priceH) return;

    const { width } = viewport;
    const isUp   = candleVisualUp(viewport, candle);
    const bg     = isUp ? theme.candleUp : theme.candleDown;
    const label  = formatPrice(candle.c, priceScale);
    const x0     = width;
    const boxH   = 18;

    ctx.save();
    ctx.fillStyle = bg;
    ctx.fillRect(x0 + 1, Math.round(y) - 9, PRICE_AXIS_W - 2, boxH);
    ctx.fillStyle = '#ffffff';
    ctx.font         = FONT;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x0 + 5, y);
    ctx.restore();
}

/** Volume scale labels in the right gutter (same strip as the price axis). */
export function drawVolumeAxis(ctx, candles, viewport, theme) {
    if (!candles.length) return;

    const maxVol = candles.reduce((m, c) => Math.max(m, candleVolumeTotal(c)), 0);
    if (!Number.isFinite(maxVol) || maxVol <= 0) return;

    const { width, height } = viewport;
    const priceH   = height * (1 - VOL_RATIO);
    const volH     = height * VOL_RATIO;
    const volDrawH = Math.max(0, volH - VOL_TOP_GAP_PX);
    if (volDrawH <= 0) return;

    const x0 = width;
    const ticks = volumeAxisTicks(maxVol);
    if (!ticks.length) return;

    ctx.save();
    ctx.fillStyle    = theme.textDim;
    ctx.font         = FONT;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';

    // Top tick: same gap below the separator as the bar strip (`VOL_TOP_GAP_PX`), using rounded
    // price edge to match `drawVolumeSeparator`.
    const sepY   = Math.round(priceH);
    const axisTop = sepY + VOL_TOP_GAP_PX;
    const axisBot = height;
    const axisSpan = Math.max(1, axisBot - axisTop);
    for (const vol of ticks) {
        const y = axisBot - (vol / maxVol) * axisSpan;
        if (y < axisTop - 0.5 || y > axisBot) continue;
        ctx.fillText(formatVolumeAxis(vol), x0 + 6, y);
    }
    ctx.restore();
}

export function drawCrosshair(ctx, pos, candle, viewport, theme, priceScale, resolution) {
    if (!pos) return;

    const { x, y } = pos;
    const { width, height } = viewport;
    const priceH = height * (1 - VOL_RATIO);

    ctx.save();
    ctx.strokeStyle = theme.crosshair;
    ctx.lineWidth   = 1;
    ctx.setLineDash([4, 4]);

    // Vertical line (chart + time axis strip, same visual span as the time label)
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, 0);
    ctx.lineTo(Math.round(x) + 0.5, height + TIME_AXIS_H);
    ctx.stroke();

    // Horizontal line (price area only)
    if (y >= 0 && y <= priceH) {
        ctx.beginPath();
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
        ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.restore();

    // Price label on axis
    if (y >= 0 && y <= priceH) {
        const price = viewport.yToPrice(y);
        const label = formatPrice(price, priceScale);
        ctx.fillStyle = theme.textBright;
        ctx.fillRect(width + 1, Math.round(y) - 9, PRICE_AXIS_W - 2, 18);
        ctx.fillStyle    = theme.bg;
        ctx.font         = FONT;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, width + 5, y);
    }

    // Time label on axis (same treatment as price label: bright box, dark text)
    {
        const chartX = Math.max(0, Math.min(width, x));
        const t = candle ? candle.t : viewport.xToTime(chartX);
        const label = formatCrosshairTimeLabel(t, resolution);
        ctx.font = FONT;
        const padX = 5;
        const labelW = ctx.measureText(label).width;
        const boxW = Math.ceil(labelW + padX * 2);
        let boxLeft = Math.round(chartX - boxW / 2);
        if (boxLeft < 2) boxLeft = 2;
        if (boxLeft + boxW > width - 2) boxLeft = width - 2 - boxW;
        const yMid = height + TIME_AXIS_H / 2;
        ctx.fillStyle = theme.textBright;
        ctx.fillRect(boxLeft, Math.round(yMid) - 9, boxW, 18);
        ctx.fillStyle = theme.bg;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, boxLeft + boxW / 2, yMid);
    }

    // OHLCV info panel — fixed at top-left of chart area, single row
    if (candle) {
        const fmt   = (v) => formatPrice(v, priceScale);
        const parts = [
            `O ${fmt(candle.o)}`,
            `H ${fmt(candle.h)}`,
            `L ${fmt(candle.l)}`,
            `C ${fmt(candle.c)}`,
            `V ${candle.v != null ? candle.v.toLocaleString('en-US', { minimumFractionDigits: candle.v >= 100 ? 0 : 2, maximumFractionDigits: candle.v >= 100 ? 0 : 2 }) : '—'}`,
        ];
        ctx.font         = FONT;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle    = theme.text;
        const gap = 12;
        let cx = 8;
        const cy = 14;
        for (const part of parts) {
            ctx.fillText(part, cx, cy);
            cx += ctx.measureText(part).width + gap;
        }
    }
}

export function drawLiveIndicator(ctx, price, viewport, theme) {
    const y      = viewport.priceToY(price);
    const priceH = viewport.height * (1 - VOL_RATIO);
    if (y < 0 || y > priceH) return;

    ctx.save();
    ctx.strokeStyle = theme.livePrice;
    ctx.lineWidth   = 1;
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewport.width, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Pulsing dot
    ctx.fillStyle = theme.livePrice;
    ctx.beginPath();
    ctx.arc(viewport.width - 8, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

export function drawNoDataMarker(ctx, viewport, theme, side = 'left') {
    ctx.save();
    ctx.fillStyle    = theme.textDim;
    ctx.font         = '12px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const x = side === 'left' ? 80 : viewport.width - 80;
    ctx.fillText('No data', x, viewport.height * 0.4);
    ctx.restore();
}
