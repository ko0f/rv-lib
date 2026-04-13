// rigoview.js — public entry point; exports the RigoView class
import { Chart } from './chart.js';

export class RigoView {
    constructor(container, options = {}) {
        this._chart = new Chart(container, {
            apiBase:          options.apiBase          ?? '/api/charts',
            wsBase:           options.wsBase           ?? `ws://${location.host}/api/charts/stream`,
            symbol:           options.symbol           ?? null,
            // Omit default so Chart can restore last resolution from storage.
            resolution:          options.resolution,
            onSymbolChange:      options.onSymbolChange      ?? null,
            barWidthPx:          options.barWidthPx          ?? null,
            ignoreGaps:          options.ignoreGaps          !== false,
            disableTopBar:       options.disableTopBar       === true,
        });
    }

    setSymbol(symbol) {
        return this._chart.setSymbol(symbol);
    }

    setResolution(resolution) {
        return this._chart.setResolution(resolution);
    }

    jumpTo(timestamp) {
        this._chart.jumpTo(timestamp);
    }

    destroy() {
        this._chart.destroy();
    }
}
