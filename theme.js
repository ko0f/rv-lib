// theme.js — reads CSS variables from the host document at mount time
export function readTheme(el) {
    const s = getComputedStyle(el ?? document.documentElement);
    const v = (name) => s.getPropertyValue(name).trim();
    const volSepParsed = parseFloat(v('--rigoview-volume-separator-width'));
    const volumeSeparatorLineWidth =
        Number.isFinite(volSepParsed) && volSepParsed > 0 ? volSepParsed : 1;
    return {
        bg:         v('--widget-bg-color')     || '#141722',
        gridLine:   v('--widget-border-color') || '#252836',
        text:       v('--text-color')          || '#a0a8b8',
        textBright: v('--text-bright-color')   || '#e0e8f0',
        textDim:    v('--text-dim-color')      || '#505870',
        candleUp:   '#3ac18a',
        candleDown: '#e06e46',
        wickUp:     '#016944',
        wickDown:   '#8d0f23',
        volUp:      'rgba(58,193,138,0.25)',
        volDown:    'rgba(224,110,70,0.25)',
        /** Stacked volume: dominant side + gray cap (min vb/vs). */
        volBuyDom:   '#A6D45B',
        volSellDom:  '#C05A7D',
        volStackGray: '#3C3C3C',
        /** Volume when no sell-side data (no positive `vs` in series). */
        volNoSellSide: '#1f63bd',
        crosshair:  'rgba(200,200,200,0.35)',
        livePrice:  v('--text-profit') || '#3ac18a',
        /** Candle/volume pane divider; `--rigoview-volume-separator-width`, `--rigoview-volume-separator-color`. */
        volumeSeparatorLineWidth,
        volumeSeparatorColor: v('--rigoview-volume-separator-color') || '#67686e',
    };
}
