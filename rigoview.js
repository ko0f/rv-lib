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
            readOnly:            options.readOnly            === true,
            /** When true, toolbar shows only the active resolution label; switching disabled. */
            lockTimeframe:       options.lockTimeframe       === true,
            displayName:         options.displayName         ?? null,
            /** Initial logarithmic price scale (LOG); requires strictly positive prices. */
            priceLogScale:       options.priceLogScale       === true,
            /** Initial vertical price axis direction (low at top when true). */
            priceYInverted:      options.priceYInverted      === true,
        });
    }

    setSymbol(symbol) {
        return this._chart.setSymbol(symbol);
    }

    setLockTimeframe(locked) {
        return this._chart.setLockTimeframe(locked);
    }

    setResolution(resolution, opts) {
        return this._chart.setResolution(resolution, opts);
    }

    jumpTo(timestamp) {
        this._chart.jumpTo(timestamp);
    }

    destroy() {
        this._chart.destroy();
    }
}
