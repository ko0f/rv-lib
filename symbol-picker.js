// symbol-picker.js — search overlay: debounced input, results list, keyboard nav
export class SymbolPicker {
    constructor(container, httpClient, onSelect) {
        this._http     = httpClient;
        this._onSelect = onSelect;
        this._timer    = null;
        this._results  = [];
        this._idx      = -1;

        // Backdrop
        this._el = document.createElement('div');
        this._el.style.cssText = [
            'position:absolute;inset:0;z-index:20',
            'display:none;align-items:flex-start;justify-content:center',
            'padding-top:50px;background:rgba(0,0,0,0.55)',
        ].join(';');

        // Box
        const box = document.createElement('div');
        box.style.cssText = [
            'background:var(--widget-bg-color,#141722)',
            'border:1px solid var(--widget-border-color,#252836)',
            'border-radius:6px;width:380px;overflow:hidden',
            'box-shadow:0 8px 32px rgba(0,0,0,0.6)',
        ].join(';');

        // Input
        this._input = document.createElement('input');
        this._input.placeholder = 'Search symbol…';
        this._input.style.cssText = [
            'width:100%;box-sizing:border-box;padding:12px 16px',
            'background:transparent;border:none;outline:none',
            'border-bottom:1px solid var(--widget-border-color,#252836)',
            'color:var(--text-bright-color,#e0e8f0);font:14px monospace',
        ].join(';');

        // Results list
        this._list = document.createElement('div');
        this._list.style.cssText = 'max-height:300px;overflow-y:auto';

        box.appendChild(this._input);
        box.appendChild(this._list);
        this._el.appendChild(box);
        container.appendChild(this._el);

        this._input.addEventListener('input', () => {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => this._search(this._input.value), 200);
        });
        this._input.addEventListener('keydown', (e) => this._onKey(e));
        this._input.addEventListener('click', (e) => e.stopPropagation());
        this._el.addEventListener('click', (e) => { if (e.target === this._el) this.close(); });
    }

    async _search(q) {
        q = q.trim();
        if (!q) { this._list.innerHTML = ''; return; }
        try {
            const { results } = await this._http.searchSymbols(q, 20);
            this._results = results;
            this._idx     = -1;
            this._render();
        } catch {}
    }

    _render() {
        this._list.innerHTML = '';
        this._results.forEach((r, i) => {
            const el = document.createElement('div');
            el.style.cssText = [
                'padding:9px 16px;cursor:pointer;display:flex;gap:12px;align-items:center',
                'font-size:13px;font-family:monospace',
                `color:var(--text-color,#a0a8b8)`,
                i === this._idx ? 'background:rgba(255,255,255,0.08)' : '',
            ].join(';');
            el.innerHTML = [
                `<span style="font-weight:600;color:var(--text-bright-color,#e0e8f0);min-width:130px">${r.id}</span>`,
                `<span>${r.description ?? ''}</span>`,
            ].join('');
            // Use mousedown so selection still works if focus/overlay handlers
            // interfere before a click event is emitted.
            el.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._select(r.id);
            });
            el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._select(r.id);
            });
            el.addEventListener('mouseenter', () => { this._idx = i; this._render(); });
            this._list.appendChild(el);
        });
    }

    _onKey(e) {
        if (e.key === 'Escape')    { this.close(); return; }
        if (e.key === 'ArrowDown') { this._idx = Math.min(this._idx + 1, this._results.length - 1); this._render(); e.preventDefault(); }
        if (e.key === 'ArrowUp')   { this._idx = Math.max(this._idx - 1, 0); this._render(); e.preventDefault(); }
        if (e.key === 'Enter' && this._idx >= 0) this._select(this._results[this._idx].id);
    }

    _select(id) {
        this.close();
        this._onSelect(id);
    }

    open() {
        this._el.style.display = 'flex';
        this._results  = [];
        this._idx      = -1;
        this._input.value = '';
        this._list.innerHTML = '';
        requestAnimationFrame(() => this._input.focus());
    }

    close() {
        this._el.style.display = 'none';
        clearTimeout(this._timer);
    }

    destroy() {
        clearTimeout(this._timer);
        this._el.remove();
    }
}
