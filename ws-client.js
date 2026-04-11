// ws-client.js — WebSocket manager: subscribe/unsubscribe, ping/pong, reconnect
export class WsClient extends EventTarget {
    constructor(wsBase) {
        super();
        this._base      = wsBase;
        this._ws        = null;
        this._subs      = new Set();   // "symbol::resolution" keys
        this._msgId     = 0;
        this._delay     = 500;
        this._destroyed = false;
        this._connect();
    }

    _connect() {
        if (this._destroyed) return;
        try {
            this._ws = new WebSocket(this._base);
        } catch {
            this._scheduleReconnect();
            return;
        }

        this._ws.onopen = () => {
            this._delay = 500; // reset backoff on success
            // Replay all active subscriptions after reconnect
            for (const key of this._subs) {
                const [symbol, resolution] = key.split('::');
                this._send({ op: 'subscribe', id: ++this._msgId, symbol, resolution });
            }
        };

        this._ws.onmessage = ({ data }) => {
            try { this._handle(JSON.parse(data)); } catch {}
        };

        this._ws.onclose = () => this._scheduleReconnect();
        this._ws.onerror = () => this._ws?.close();
    }

    _scheduleReconnect() {
        if (this._destroyed) return;
        setTimeout(() => this._connect(), this._delay);
        this._delay = Math.min(this._delay * 2, 30000); // exponential backoff, 30s cap
    }

    _send(msg) {
        if (this._ws?.readyState === WebSocket.OPEN) {
            this._ws.send(JSON.stringify(msg));
        }
    }

    _handle(msg) {
        if (msg.type === 'ping') {
            this._send({ op: 'pong', t: msg.t });
            return;
        }
        if (msg.type === 'partial' || msg.type === 'close') {
            this.dispatchEvent(new CustomEvent(msg.type, { detail: msg }));
        }
    }

    subscribe(symbol, resolution) {
        const key = `${symbol}::${resolution}`;
        this._subs.add(key);
        this._send({ op: 'subscribe', id: ++this._msgId, symbol, resolution });
    }

    unsubscribe(symbol, resolution) {
        const key = `${symbol}::${resolution}`;
        this._subs.delete(key);
        this._send({ op: 'unsubscribe', id: ++this._msgId, symbol, resolution });
    }

    destroy() {
        this._destroyed = true;
        this._ws?.close();
    }
}
