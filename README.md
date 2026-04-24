# rv-lib (RigoView)

A self-contained, dependency-free JavaScript charting widget for financial candles. Native ES modules, two `<canvas>` layers, live updates over WebSocket. Framework-agnostic — drop it into Angular, React, Vue, or plain HTML.

## Requirements

- A modern browser with ES module support.
- A chart provider implementing the REST + WebSocket API described in **[CHART-PROVIDER-API.md](CHART-PROVIDER-API.md)**.

No build step. No runtime npm dependencies.

## Installation

### Option A — from the npm registry

After [publishing](#publishing-to-npm) (or if the name is published by you under another scope), install like any other package:

```sh
npm install rv-lib
```

```js
import { RigoView } from 'rv-lib';
```

If the bare name `rv-lib` is taken on npm, publish under a [scope](https://docs.npmjs.com/cli/v10/using-npm/scope) (e.g. `@your-org/rv-lib`) and change the `"name"` field in `package.json` before `npm publish`.

### Option B — serve the files directly

Because rv-lib is plain ES modules with no bundling, you can copy the `*.js` files to a static directory your app already serves (e.g. `public/assets/rigoview/`) and load `rigoview.js` as a module. Framework bundlers sometimes need a **dynamic** `import()` so the module is resolved at runtime from that URL rather than bundled.

### Option C — git submodule

```sh
git submodule add <repo-url> vendor/rv-lib
```

Then serve or import from `vendor/rv-lib/rigoview.js`.

## Usage

The only public entry point is [rigoview.js](rigoview.js), which exports the `RigoView` class.

### Plain HTML

```html
<div id="chart" style="width: 100%; height: 600px;"></div>

<script type="module">
  import { RigoView } from './rv-lib/rigoview.js';

  const chart = new RigoView(document.getElementById('chart'), {
    apiBase: '/api/charts',
    wsBase:  `ws://${location.host}/api/charts/stream`,
    symbol:  'Binance:BTCUSDT',
    resolution: '1h',
    onSymbolChange: (id) => console.log('symbol changed', id),
  });
</script>
```

### Angular (dynamic import)

```ts
// Bypass webpack so the file is loaded at runtime from /assets/
const load = new Function('url', 'return import(url)');
const { RigoView } = await load('/assets/rigoview/rigoview.js');

this.chart = new RigoView(this.chartContainer.nativeElement, {
  apiBase: '/api/charts',
  wsBase:  `ws://${location.host}/api/charts/stream`,
  symbol:  'Binance:BTCUSDT',
  onSymbolChange: (id) => this.router.navigate(['/chart', id]),
});
```

### React

```jsx
import { useEffect, useRef } from 'react';
import { RigoView } from 'rv-lib';

export function Chart({ symbol }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    chartRef.current = new RigoView(containerRef.current, {
      apiBase: '/api/charts',
      wsBase:  `ws://${location.host}/api/charts/stream`,
      symbol,
    });
    return () => chartRef.current?.destroy();
  }, []);

  useEffect(() => {
    chartRef.current?.setSymbol(symbol);
  }, [symbol]);

  return <div ref={containerRef} style={{ width: '100%', height: 600 }} />;
}
```

## Constructor options

```js
new RigoView(container, options)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `apiBase` | `string` | `'/api/charts'` | REST base URL for symbol/candle queries. |
| `wsBase` | `string` | `ws://{host}/api/charts/stream` | WebSocket URL for live updates. |
| `symbol` | `string \| null` | `null` | Initial symbol id (e.g. `'Binance:BTCUSDT'`). |
| `resolution` | `string` | last used or `'1h'` | One of `1m`, `5m`, `30m`, `1h`, `1d`, `1w`. Persisted in `localStorage`. |
| `onSymbolChange` | `(id: string) => void` | `null` | Fired when the user picks a new symbol via the built-in picker. |
| `ignoreGaps` | `boolean` | compact (default) | Omit the option or pass any value except `false` to collapse gaps (weekends, missing buckets) so bars are evenly spaced. Pass **`false` exactly** to use each bar’s real open time (empty space where nothing traded). |
| `disableTopBar` | `boolean` | `false` | When **`true`**, hides the top toolbar (symbol picker, history arrows, resolution buttons) so the chart uses the full height. Symbol and resolution can still be controlled via `setSymbol` / `setResolution`. |
| `readOnly` | `boolean` | `false` | When **`true`**, the user cannot change the symbol (picker button is non-interactive) and the back/forward history navigation buttons are hidden. Programmatic calls to `setSymbol` / `setResolution` still work. |

`container` must be an `HTMLElement` that has a non-zero size. The chart fills it and observes size changes.

## Instance methods

```js
chart.setSymbol('Binance:ETHUSDT');
chart.setResolution('5m');
chart.jumpTo(timestamp);   // ms since epoch
chart.destroy();           // close WS, remove DOM, drop listeners
```

Always call `destroy()` on unmount to release the WebSocket and event listeners.

## Interaction

| Input | Action |
|---|---|
| Mouse wheel | Zoom around cursor |
| Click + drag | Pan time axis |
| Drag price axis | Lock manual price scale |
| Double click | Open symbol picker |
| Keys `1` `5` `3` `h` `d` `w` | Resolution shortcuts |

## Theming

Colors are read from CSS custom properties on the container element at construction time — see [theme.js](theme.js). Override them by setting variables like `--rv-bg`, `--rv-up`, `--rv-down`, etc. on (or above) your container.

## Publishing to npm

From this directory, with an npm login that can publish `rv-lib`:

```sh
npm run pack:dry   # optional: inspect tarball contents
npm publish        # publishes the version in package.json
```

Bump `"version"` in `package.json` (and `package-lock.json` if present) before each release. Tag the same version in git if you track releases in the standalone [rv-lib](https://github.com/ko0f/rv-lib) repo.
