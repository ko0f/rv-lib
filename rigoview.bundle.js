var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../rv-lib/dayjs.min.cjs
var require_dayjs_min = __commonJS({
  "../rv-lib/dayjs.min.cjs"(exports, module) {
    !function(t, e) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
    }(exports, function() {
      "use strict";
      var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
        var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
        return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
      } }, m = function(t2, e2, n2) {
        var r2 = String(t2);
        return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
      }, v = { s: m, z: function(t2) {
        var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
      }, m: function t2(e2, n2) {
        if (e2.date() < n2.date()) return -t2(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t2) {
        return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
      }, p: function(t2) {
        return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t2) {
        return void 0 === t2;
      } }, g = "en", D = {};
      D[g] = M;
      var p = "$isDayjsObject", S = function(t2) {
        return t2 instanceof _ || !(!t2 || !t2[p]);
      }, w = function t2(e2, n2, r2) {
        var i2;
        if (!e2) return g;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
          var u2 = e2.split("-");
          if (!i2 && u2.length > 1) return t2(u2[0]);
        } else {
          var a2 = e2.name;
          D[a2] = e2, i2 = a2;
        }
        return !r2 && i2 && (g = i2), i2 || !r2 && g;
      }, O = function(t2, e2) {
        if (S(t2)) return t2.clone();
        var n2 = "object" == typeof e2 ? e2 : {};
        return n2.date = t2, n2.args = arguments, new _(n2);
      }, b = v;
      b.l = w, b.i = S, b.w = function(t2, e2) {
        return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = function() {
        function M2(t2) {
          this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
        }
        var m2 = M2.prototype;
        return m2.parse = function(t2) {
          this.$d = function(t3) {
            var e2 = t3.date, n2 = t3.utc;
            if (null === e2) return /* @__PURE__ */ new Date(NaN);
            if (b.u(e2)) return /* @__PURE__ */ new Date();
            if (e2 instanceof Date) return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          }(t2), this.init();
        }, m2.init = function() {
          var t2 = this.$d;
          this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
        }, m2.$utils = function() {
          return b;
        }, m2.isValid = function() {
          return !(this.$d.toString() === l);
        }, m2.isSame = function(t2, e2) {
          var n2 = O(t2);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m2.isAfter = function(t2, e2) {
          return O(t2) < this.startOf(e2);
        }, m2.isBefore = function(t2, e2) {
          return this.endOf(e2) < O(t2);
        }, m2.$g = function(t2, e2, n2) {
          return b.u(t2) ? this[e2] : this.set(n2, t2);
        }, m2.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m2.valueOf = function() {
          return this.$d.getTime();
        }, m2.startOf = function(t2, e2) {
          var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
            var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
            return r2 ? i2 : i2.endOf(a);
          }, $2 = function(t3, e3) {
            return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f2) {
            case h:
              return r2 ? l2(1, 0) : l2(31, 11);
            case c:
              return r2 ? l2(1, M3) : l2(0, M3 + 1);
            case o:
              var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
              return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
            case a:
            case d:
              return $2(v2 + "Hours", 0);
            case u:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m2.endOf = function(t2) {
          return this.startOf(t2, false);
        }, m2.$set = function(t2, e2) {
          var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === c || o2 === h) {
            var y2 = this.clone().set(d, 1);
            y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else l2 && this.$d[l2]($2);
          return this.init(), this;
        }, m2.set = function(t2, e2) {
          return this.clone().$set(t2, e2);
        }, m2.get = function(t2) {
          return this[b.p(t2)]();
        }, m2.add = function(r2, f2) {
          var d2, l2 = this;
          r2 = Number(r2);
          var $2 = b.p(f2), y2 = function(t2) {
            var e2 = O(l2);
            return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
          };
          if ($2 === c) return this.set(c, this.$M + r2);
          if ($2 === h) return this.set(h, this.$y + r2);
          if ($2 === a) return y2(1);
          if ($2 === o) return y2(7);
          var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
          return b.w(m3, this);
        }, m2.subtract = function(t2, e2) {
          return this.add(-1 * t2, e2);
        }, m2.format = function(t2) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid()) return n2.invalidDate || l;
          var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
            return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
          }, d2 = function(t3) {
            return b.s(s2 % 12 || 12, t3, "0");
          }, $2 = f2 || function(t3, e3, n3) {
            var r3 = t3 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, function(t3, r3) {
            return r3 || function(t4) {
              switch (t4) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b.s(a2 + 1, 2, "0");
                case "MMM":
                  return h2(n2.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h2(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h2(n2.weekdaysMin, e2.$W, o2, 2);
                case "ddd":
                  return h2(n2.weekdaysShort, e2.$W, o2, 3);
                case "dddd":
                  return o2[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b.s(s2, 2, "0");
                case "h":
                  return d2(1);
                case "hh":
                  return d2(2);
                case "a":
                  return $2(s2, u2, true);
                case "A":
                  return $2(s2, u2, false);
                case "m":
                  return String(u2);
                case "mm":
                  return b.s(u2, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b.s(e2.$s, 2, "0");
                case "SSS":
                  return b.s(e2.$ms, 3, "0");
                case "Z":
                  return i2;
              }
              return null;
            }(t3) || i2.replace(":", "");
          });
        }, m2.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m2.diff = function(r2, d2, l2) {
          var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
            return b.m(y2, m3);
          };
          switch (M3) {
            case h:
              $2 = D2() / 12;
              break;
            case c:
              $2 = D2();
              break;
            case f:
              $2 = D2() / 3;
              break;
            case o:
              $2 = (g2 - v2) / 6048e5;
              break;
            case a:
              $2 = (g2 - v2) / 864e5;
              break;
            case u:
              $2 = g2 / n;
              break;
            case s:
              $2 = g2 / e;
              break;
            case i:
              $2 = g2 / t;
              break;
            default:
              $2 = g2;
          }
          return l2 ? $2 : b.a($2);
        }, m2.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m2.$locale = function() {
          return D[this.$L];
        }, m2.locale = function(t2, e2) {
          if (!t2) return this.$L;
          var n2 = this.clone(), r2 = w(t2, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m2.clone = function() {
          return b.w(this.$d, this);
        }, m2.toDate = function() {
          return new Date(this.valueOf());
        }, m2.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m2.toISOString = function() {
          return this.$d.toISOString();
        }, m2.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      }(), k = _.prototype;
      return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t2) {
        k[t2[1]] = function(e2) {
          return this.$g(e2, t2[0], t2[1]);
        };
      }), O.extend = function(t2, e2) {
        return t2.$i || (t2(e2, _, O), t2.$i = true), O;
      }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
        return O(1e3 * t2);
      }, O.en = D[g], O.Ls = D, O.p = {}, O;
    });
  }
});

// ../rv-lib/theme.js
function readTheme(el) {
  const s = getComputedStyle(el ?? document.documentElement);
  const v = (name) => s.getPropertyValue(name).trim();
  const volSepParsed = parseFloat(v("--rigoview-volume-separator-width"));
  const volumeSeparatorLineWidth = Number.isFinite(volSepParsed) && volSepParsed > 0 ? volSepParsed : 1;
  return {
    bg: v("--widget-bg-color") || "#141722",
    gridLine: v("--widget-border-color") || "#252836",
    text: v("--text-color") || "#a0a8b8",
    textBright: v("--text-bright-color") || "#e0e8f0",
    textDim: v("--text-dim-color") || "#505870",
    candleUp: "#3ac18a",
    candleDown: "#e06e46",
    wickUp: "#016944",
    wickDown: "#8d0f23",
    volUp: "rgba(58,193,138,0.25)",
    volDown: "rgba(224,110,70,0.25)",
    /** Stacked volume: dominant side + gray cap (min vb/vs). */
    volBuyDom: "#A6D45B",
    volSellDom: "#C05A7D",
    volStackGray: "#3C3C3C",
    /** Volume when no sell-side data (no positive `vs` in series). */
    volNoSellSide: "#1f63bd",
    crosshair: "rgba(200,200,200,0.35)",
    livePrice: v("--text-profit") || "#3ac18a",
    /** Candle/volume pane divider; `--rigoview-volume-separator-width`, `--rigoview-volume-separator-color`. */
    volumeSeparatorLineWidth,
    volumeSeparatorColor: v("--rigoview-volume-separator-color") || "#67686e"
  };
}

// ../rv-lib/http-client.js
var HttpClient = class {
  constructor(baseUrl) {
    this._base = baseUrl.replace(/\/$/, "");
  }
  async _get(path, params = {}) {
    const url = new URL(this._base + path, location.href);
    for (const [k, v] of Object.entries(params)) {
      if (v !== void 0 && v !== null) url.searchParams.set(k, String(v));
    }
    const res = await fetch(url.toString());
    const body = await res.json();
    if (!res.ok || !body.ok) throw body;
    return body;
  }
  getServerTime() {
    return this._get("/time");
  }
  searchSymbols(q, limit = 20) {
    return this._get("/symbols/search", { q, limit });
  }
  getSymbolMeta(id) {
    return this._get(`/symbols/${encodeURIComponent(id)}`);
  }
  getCandles({ symbol, resolution, count, before, after, anchor, includeLive }) {
    return this._get("/candles", { symbol, resolution, count, before, after, anchor, include_live: includeLive });
  }
  getCandlesBatch(queries) {
    return this._get("/candles/batch", { q: JSON.stringify(queries) });
  }
};

// ../rv-lib/ws-client.js
var WsClient = class extends EventTarget {
  constructor(wsBase) {
    super();
    this._base = wsBase;
    this._ws = null;
    this._subs = /* @__PURE__ */ new Set();
    this._msgId = 0;
    this._delay = 500;
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
      this._delay = 500;
      for (const key of this._subs) {
        const [symbol, resolution] = key.split("::");
        this._send({ op: "subscribe", id: ++this._msgId, symbol, resolution });
      }
    };
    this._ws.onmessage = ({ data }) => {
      try {
        this._handle(JSON.parse(data));
      } catch {
      }
    };
    this._ws.onclose = () => this._scheduleReconnect();
    this._ws.onerror = () => this._ws?.close();
  }
  _scheduleReconnect() {
    if (this._destroyed) return;
    setTimeout(() => this._connect(), this._delay);
    this._delay = Math.min(this._delay * 2, 3e4);
  }
  _send(msg) {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify(msg));
    }
  }
  _handle(msg) {
    if (msg.type === "ping") {
      this._send({ op: "pong", t: msg.t });
      return;
    }
    if (msg.type === "partial" || msg.type === "close") {
      this.dispatchEvent(new CustomEvent(msg.type, { detail: msg }));
    }
  }
  subscribe(symbol, resolution) {
    const key = `${symbol}::${resolution}`;
    this._subs.add(key);
    this._send({ op: "subscribe", id: ++this._msgId, symbol, resolution });
  }
  unsubscribe(symbol, resolution) {
    const key = `${symbol}::${resolution}`;
    this._subs.delete(key);
    this._send({ op: "unsubscribe", id: ++this._msgId, symbol, resolution });
  }
  destroy() {
    this._destroyed = true;
    this._ws?.close();
  }
};

// ../rv-lib/data-store.js
var CANDLE_MS = { "1m": 6e4, "5m": 3e5, "30m": 18e5, "1h": 36e5, "1d": 864e5, "1w": 6048e5 };
var DataStore = class extends EventTarget {
  constructor(httpClient) {
    super();
    this._http = httpClient;
    this._cache = {};
    this._buffered = {};
    this._loading = {};
  }
  _key(symbol, resolution) {
    return `${symbol}::${resolution}`;
  }
  _entry(symbol, resolution) {
    this._cache[symbol] ??= {};
    this._cache[symbol][resolution] ??= { candles: [], availability: null };
    return this._cache[symbol][resolution];
  }
  _unpack(columnar) {
    const { t, o, h, l, c, v, vb, vs } = columnar;
    return t.map((ts, i) => ({
      t: ts,
      o: o[i],
      h: h[i],
      l: l[i],
      c: c[i],
      v: v[i],
      vb: vb?.[i],
      vs: vs?.[i],
      live: false
    }));
  }
  // Call before subscribing WS so events received before HTTP completes are buffered
  startBuffering(symbol, resolution) {
    this._buffered[this._key(symbol, resolution)] = [];
  }
  isBuffering(symbol, resolution) {
    return this._buffered[this._key(symbol, resolution)] !== void 0;
  }
  bufferWsEvent(symbol, resolution, event) {
    const buf = this._buffered[this._key(symbol, resolution)];
    if (buf) buf.push(event);
  }
  async load(symbol, resolution, params = {}) {
    const key = this._key(symbol, resolution);
    if (this._loading[key]) return this._loading[key];
    const p = this._doLoad(symbol, resolution, params).finally(() => {
      delete this._loading[key];
    });
    this._loading[key] = p;
    return p;
  }
  async _doLoad(symbol, resolution, params) {
    const resp = await this._http.getCandles({ symbol, resolution, count: params.count ?? 500, ...params });
    const newCandles = this._unpack(resp.candles);
    if (resp.live && newCandles.length) newCandles[newCandles.length - 1].live = true;
    const entry = this._entry(symbol, resolution);
    entry.availability = resp.availability;
    const map = new Map(entry.candles.map((c) => [c.t, c]));
    for (const c of newCandles) map.set(c.t, c);
    entry.candles = [...map.values()].sort((a, b) => a.t - b.t);
    const key = this._key(symbol, resolution);
    const buffered = this._buffered[key] ?? [];
    delete this._buffered[key];
    const httpTs = new Set(newCandles.map((c) => c.t));
    for (const ev of buffered) {
      if (ev.type === "close" && !httpTs.has(ev.t)) {
        this._mergeClose(entry, ev);
      } else if (ev.type === "partial") {
        this._mergePartial(entry, ev);
      }
    }
    this.dispatchEvent(new CustomEvent("data:loaded", { detail: { symbol, resolution } }));
    return entry;
  }
  _mergePartial(entry, tick) {
    const candles = entry.candles;
    const last = candles[candles.length - 1];
    if (last?.t === tick.t) {
      Object.assign(last, { o: tick.o, h: tick.h, l: tick.l, c: tick.c, v: tick.v, live: true });
    } else {
      candles.push({ t: tick.t, o: tick.o, h: tick.h, l: tick.l, c: tick.c, v: tick.v, live: true });
    }
  }
  _mergeClose(entry, candle) {
    const candles = entry.candles;
    const closed = { t: candle.t, o: candle.o, h: candle.h, l: candle.l, c: candle.c, v: candle.v, live: false };
    const last = candles[candles.length - 1];
    if (last?.t === candle.t) {
      candles[candles.length - 1] = closed;
    } else {
      candles.push(closed);
      entry.candles.sort((a, b) => a.t - b.t);
    }
  }
  applyPartial(symbol, resolution, tick) {
    this._mergePartial(this._entry(symbol, resolution), tick);
    this.dispatchEvent(new CustomEvent("data:live-tick", { detail: { symbol, resolution } }));
  }
  applyClose(symbol, resolution, candle) {
    this._mergeClose(this._entry(symbol, resolution), candle);
    this.dispatchEvent(new CustomEvent("data:close", { detail: { symbol, resolution } }));
  }
  getWindow(symbol, resolution, fromT, toT, ignoreGaps = true) {
    const candles = this._cache[symbol]?.[resolution]?.candles ?? [];
    if (!candles.length) return [];
    const candleMs = CANDLE_MS[resolution] ?? CANDLE_MS["1h"];
    const n = candles.length;
    const compact = ignoreGaps !== false;
    if (!compact) {
      const margin = candleMs;
      const fromBound = fromT - margin;
      const toBound = toT + margin;
      let lo = 0;
      let hi = n - 1;
      let start = n;
      while (lo <= hi) {
        const mid = lo + hi >> 1;
        if (candles[mid].t >= fromBound) {
          start = mid;
          hi = mid - 1;
        } else {
          lo = mid + 1;
        }
      }
      lo = 0;
      hi = n - 1;
      let end = -1;
      while (lo <= hi) {
        const mid = lo + hi >> 1;
        if (candles[mid].t <= toBound) {
          end = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      if (start > end) return [];
      return candles.slice(start, end + 1);
    }
    const lastT = candles[n - 1].t;
    const baseCompactT = lastT - (n - 1) * candleMs;
    const fromIdx = Math.max(0, Math.floor((fromT - baseCompactT) / candleMs) - 1);
    const toIdx = Math.min(n - 1, Math.ceil((toT - baseCompactT) / candleMs) + 1);
    if (toIdx < 0 || fromIdx >= n) return [];
    return candles.slice(fromIdx, toIdx + 1);
  }
  getAll(symbol, resolution) {
    return this._cache[symbol]?.[resolution]?.candles ?? [];
  }
  getOldest(symbol, resolution) {
    const all = this.getAll(symbol, resolution);
    return all.length ? all[0].t : null;
  }
  getAvailability(symbol, resolution) {
    return this._cache[symbol]?.[resolution]?.availability ?? null;
  }
};

// ../rv-lib/viewport.js
var VOL_RATIO = 0.2;
var MIN_MS_PER_PX = 1e3;
var MAX_MS_PER_PX = 30 * 864e5;
var MIN_PRICE_RANGE = 1e-8;
var MIN_POSITIVE_PRICE = 1e-12;
var MIN_LOG10_RANGE = 1e-6;
var MAX_LOG10_RANGE = 24;
var CANDLE_MS2 = { "1m": 6e4, "5m": 3e5, "30m": 18e5, "1h": 36e5, "1d": 864e5, "1w": 6048e5 };
var Viewport = class {
  constructor(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.rightEdgeT = Date.now();
    this.msPerPixel = CANDLE_MS2["1h"] * 200 / this.width;
    this.priceMin = 0;
    this.priceMax = 1;
    this.priceLocked = false;
    this.priceLogScale = false;
    this._listeners = /* @__PURE__ */ new Map();
  }
  on(event, fn) {
    if (!this._listeners.has(event)) this._listeners.set(event, []);
    this._listeners.get(event).push(fn);
  }
  _emit(event) {
    for (const fn of this._listeners.get(event) ?? []) fn();
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
    this._emit("viewport:changed");
  }
  pan(deltaX) {
    this.rightEdgeT -= deltaX * this.msPerPixel;
    this._emit("viewport:changed");
  }
  adjustZoomForResolution(resolution) {
    const ms = CANDLE_MS2[resolution] ?? CANDLE_MS2["1h"];
    this.msPerPixel = ms * 200 / Math.max(this.width, 1);
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
      const t = 1 - clampedY / h;
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
      const k = 1 - clampedY / h;
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
    this._emit("viewport:changed");
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
      return h * (1 - (p - this.priceMin) / range);
    }
    const lo = Math.log10(Math.max(this.priceMin, MIN_POSITIVE_PRICE));
    const hi = Math.log10(Math.max(this.priceMax, MIN_POSITIVE_PRICE));
    const lp = Math.log10(Math.max(p, MIN_POSITIVE_PRICE));
    const Lrange = hi - lo;
    if (!Number.isFinite(Lrange) || Lrange <= 0) return h / 2;
    return h * (1 - (lp - lo) / Lrange);
  }
  yToPrice(y) {
    const h = this.height * (1 - VOL_RATIO);
    if (!this.priceLogScale) {
      const range = this.priceMax - this.priceMin;
      return this.priceMin + (1 - y / h) * range;
    }
    const lo = Math.log10(Math.max(this.priceMin, MIN_POSITIVE_PRICE));
    const hi = Math.log10(Math.max(this.priceMax, MIN_POSITIVE_PRICE));
    const Lrange = hi - lo;
    if (!Number.isFinite(Lrange) || Lrange <= 0) return Math.sqrt(this.priceMin * this.priceMax);
    const lp = lo + (1 - y / h) * Lrange;
    return Math.pow(10, lp);
  }
  resize(width, height) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
  }
};

// ../rv-lib/interaction.js
var LEFT_PREFETCH_EDGE_RATIO = 0.2;
function getLeftPrefetchParams(dataStore, symbol, resolution, viewport) {
  const all = dataStore.getAll(symbol, resolution);
  if (!all.length) return null;
  const cachedLeft = all[0].t;
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
var TRACKPAD_ZOOM_SENSITIVITY = 9e-3;
var MOUSE_WHEEL_ZOOM_SENSITIVITY = 1e-3;
var Interaction = class {
  constructor(canvas, viewport, dataStore) {
    this._canvas = canvas;
    this._vp = viewport;
    this._ds = dataStore;
    this._dragging = false;
    this._dragMode = null;
    this._lastX = 0;
    this._lastY = 0;
    this._symbol = null;
    this._resolution = null;
    this._prefetching = false;
    this._cbs = /* @__PURE__ */ new Map();
    this._attached = [];
    this._attach(canvas, "wheel", this._onWheel, { passive: false });
    this._attach(canvas, "mousedown", this._onMouseDown);
    this._attach(canvas, "mousemove", this._onMouseMove);
    this._attach(canvas, "mouseup", this._onMouseUp);
    this._attach(canvas, "mouseleave", this._onMouseLeave);
    this._attach(canvas, "dblclick", this._onDblClick);
    this._attach(window, "keydown", this._onKeyDown);
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
    for (const fn of this._cbs.get(event) ?? []) fn(data);
  }
  setContext(symbol, resolution) {
    this._symbol = symbol;
    this._resolution = resolution;
    this._prefetching = false;
  }
  resetPrefetch() {
    this._prefetching = false;
  }
  _onWheel(e) {
    e.preventDefault();
    const lineHeightPx = 16;
    const pageHeightPx = this._vp.height || 800;
    const deltaXpx = e.deltaMode === 1 ? e.deltaX * lineHeightPx : e.deltaMode === 2 ? e.deltaX * pageHeightPx : e.deltaX;
    const deltaYpx = e.deltaMode === 1 ? e.deltaY * lineHeightPx : e.deltaMode === 2 ? e.deltaY * pageHeightPx : e.deltaY;
    const absX = Math.abs(deltaXpx);
    const absY = Math.abs(deltaYpx);
    const isHorizontalPan = !e.ctrlKey && absX > 0.5 && absX > absY * 1.2;
    if (isHorizontalPan) {
      this._vp.pan(-deltaXpx);
      this._checkPrefetch();
      return;
    }
    const clampedDelta = Math.max(-120, Math.min(120, deltaYpx));
    const isMouseWheel = e.deltaMode !== 0 || Math.abs(e.deltaY) >= 40;
    const sensitivity = isMouseWheel ? MOUSE_WHEEL_ZOOM_SENSITIVITY : TRACKPAD_ZOOM_SENSITIVITY;
    const factor = Math.exp(clampedDelta * sensitivity);
    this._vp.zoom(factor, this._vp.width);
    this._checkPrefetch();
  }
  _onMouseDown(e) {
    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const priceH = this._vp.height * (1 - VOL_RATIO);
    this._dragging = true;
    this._lastX = e.clientX;
    this._lastY = e.clientY;
    if (x >= this._vp.width && y >= 0 && y <= priceH) {
      this._dragMode = "price-scale";
      this._canvas.style.cursor = "ns-resize";
    } else {
      this._dragMode = "pan";
      this._canvas.style.cursor = "grabbing";
    }
  }
  _onMouseMove(e) {
    const rect = this._canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (this._dragging) {
      if (this._dragMode === "price-scale") {
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
      this._canvas.style.cursor = x >= this._vp.width && y >= 0 && y <= priceH ? "ns-resize" : "crosshair";
      this._emit("hover", { x, y });
    }
  }
  _onMouseUp() {
    this._dragging = false;
    this._dragMode = null;
    this._canvas.style.cursor = "crosshair";
    this._checkPrefetch();
  }
  _onMouseLeave() {
    this._dragging = false;
    this._dragMode = null;
    this._canvas.style.cursor = "crosshair";
    this._emit("hover", null);
  }
  _onDblClick() {
    this._emit("open-symbol-picker");
  }
  _onKeyDown(e) {
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "Enter") {
      e.preventDefault();
      this._emit("open-symbol-picker");
      return;
    }
    const map = { "1": "1m", "5": "5m", "3": "30m", h: "1h", d: "1d", w: "1w" };
    if (map[e.key]) {
      e.preventDefault();
      this._emit("resolution-change", map[e.key]);
    }
  }
  _checkPrefetch() {
    if (!this._symbol || !this._resolution || this._prefetching) return;
    const params = getLeftPrefetchParams(this._ds, this._symbol, this._resolution, this._vp);
    if (!params) return;
    this._prefetching = true;
    this._emit("prefetch-left", params);
  }
  destroy() {
    for (const [target, event, fn] of this._attached) {
      target.removeEventListener(event, fn);
    }
  }
};

// ../rv-lib/symbol-picker.js
var SymbolPicker = class {
  constructor(container, httpClient, onSelect) {
    this._http = httpClient;
    this._onSelect = onSelect;
    this._timer = null;
    this._results = [];
    this._idx = -1;
    this._el = document.createElement("div");
    this._el.style.cssText = [
      "position:absolute;inset:0;z-index:20",
      "display:none;align-items:flex-start;justify-content:center",
      "padding-top:50px;background:rgba(0,0,0,0.55)"
    ].join(";");
    const box = document.createElement("div");
    box.style.cssText = [
      "background:var(--widget-bg-color,#141722)",
      "border:1px solid var(--widget-border-color,#252836)",
      "border-radius:6px;width:380px;overflow:hidden",
      "box-shadow:0 8px 32px rgba(0,0,0,0.6)"
    ].join(";");
    this._input = document.createElement("input");
    this._input.placeholder = "Search symbol\u2026";
    this._input.style.cssText = [
      "width:100%;box-sizing:border-box;padding:12px 16px",
      "background:transparent;border:none;outline:none",
      "border-bottom:1px solid var(--widget-border-color,#252836)",
      "color:var(--text-bright-color,#e0e8f0);font:14px monospace"
    ].join(";");
    this._list = document.createElement("div");
    this._list.style.cssText = "max-height:300px;overflow-y:auto";
    box.appendChild(this._input);
    box.appendChild(this._list);
    this._el.appendChild(box);
    container.appendChild(this._el);
    this._input.addEventListener("input", () => {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this._search(this._input.value), 200);
    });
    this._input.addEventListener("keydown", (e) => this._onKey(e));
    this._input.addEventListener("click", (e) => e.stopPropagation());
    this._el.addEventListener("click", (e) => {
      if (e.target === this._el) this.close();
    });
  }
  async _search(q) {
    q = q.trim();
    if (!q) {
      this._list.innerHTML = "";
      return;
    }
    try {
      const { results } = await this._http.searchSymbols(q, 20);
      this._results = results;
      this._idx = -1;
      this._render();
    } catch {
    }
  }
  _render() {
    this._list.innerHTML = "";
    this._results.forEach((r, i) => {
      const el = document.createElement("div");
      el.style.cssText = [
        "padding:9px 16px;cursor:pointer;display:flex;gap:12px;align-items:center",
        "font-size:13px;font-family:monospace",
        `color:var(--text-color,#a0a8b8)`,
        i === this._idx ? "background:rgba(255,255,255,0.08)" : ""
      ].join(";");
      el.innerHTML = [
        `<span style="font-weight:600;color:var(--text-bright-color,#e0e8f0);min-width:130px">${r.id}</span>`,
        `<span>${r.description ?? ""}</span>`
      ].join("");
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._select(r.id);
      });
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._select(r.id);
      });
      el.addEventListener("mouseenter", () => {
        this._idx = i;
        this._render();
      });
      this._list.appendChild(el);
    });
  }
  _onKey(e) {
    if (e.key === "Escape") {
      this.close();
      return;
    }
    if (e.key === "ArrowDown") {
      this._idx = Math.min(this._idx + 1, this._results.length - 1);
      this._render();
      e.preventDefault();
    }
    if (e.key === "ArrowUp") {
      this._idx = Math.max(this._idx - 1, 0);
      this._render();
      e.preventDefault();
    }
    if (e.key === "Enter" && this._idx >= 0) this._select(this._results[this._idx].id);
  }
  _select(id) {
    this.close();
    this._onSelect(id);
  }
  open() {
    this._el.style.display = "flex";
    this._results = [];
    this._idx = -1;
    this._input.value = "";
    this._list.innerHTML = "";
    requestAnimationFrame(() => this._input.focus());
  }
  close() {
    this._el.style.display = "none";
    clearTimeout(this._timer);
  }
  destroy() {
    clearTimeout(this._timer);
    this._el.remove();
  }
};

// ../rv-lib/renderer.js
var import_dayjs_min = __toESM(require_dayjs_min(), 1);
var VOL_TOP_GAP_PX = 12;
var PRICE_AXIS_W = 70;
var TIME_AXIS_H = 30;
var FONT = "11px monospace";
var CANDLE_MS3 = { "1m": 6e4, "5m": 3e5, "30m": 18e5, "1h": 36e5, "1d": 864e5, "1w": 6048e5 };
function rowIndexByRef(allCandles) {
  return new Map(allCandles.map((row, i) => [row, i]));
}
function niceNumber(value) {
  if (!value) return 1;
  const exp = Math.floor(Math.log10(Math.abs(value)));
  const base = Math.pow(10, exp);
  const frac = value / base;
  let nice;
  if (frac <= 1) nice = 1;
  else if (frac <= 2) nice = 2;
  else if (frac <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}
function nicePriceInterval(range) {
  return niceNumber(range / 6);
}
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
      const u = lo + (hi - lo) * i / n;
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
var TIME_STEPS = [
  6e4,
  5 * 6e4,
  15 * 6e4,
  30 * 6e4,
  36e5,
  4 * 36e5,
  12 * 36e5,
  864e5,
  7 * 864e5
];
function niceTimeStep(msPerPixel, targetSpacingPx = 100) {
  const target = msPerPixel * targetSpacingPx;
  const preset = TIME_STEPS.find((s) => s >= target);
  if (preset) return preset;
  let step = TIME_STEPS[TIME_STEPS.length - 1];
  while (step < target) step *= 2;
  return step;
}
function firstGridT(fromT, step) {
  return Math.ceil(fromT / step) * step;
}
function formatTimeLabel(t, step) {
  const d = (0, import_dayjs_min.default)(t);
  if (step >= 864e5) return d.format("MMM D");
  if (d.hour() === 0 && d.minute() === 0 && step >= 36e5) return d.format("MMM D");
  return d.format("HH:mm");
}
function formatYearBoundaryLabel(t) {
  return (0, import_dayjs_min.default)(t).format("YYYY");
}
function localYearStartsInRange(fromT, toT) {
  const out = [];
  let y = (0, import_dayjs_min.default)(fromT).year();
  const yEnd = (0, import_dayjs_min.default)(toT).year();
  for (; y <= yEnd; y++) {
    const t = (0, import_dayjs_min.default)().year(y).startOf("year").valueOf();
    if (t >= fromT && t <= toT) out.push(t);
  }
  return out;
}
function buildTimeAxisLabelItems(from, to, step) {
  const gridTs = [];
  for (let t = firstGridT(from, step); t <= to; t += step) gridTs.push(t);
  const yearTs = localYearStartsInRange(from, to);
  const replaceRad = step * 0.51;
  const nearYear = (g) => yearTs.some((yt) => Math.abs(g - yt) <= replaceRad);
  const items = [
    ...gridTs.filter((g) => !nearYear(g)).map((t) => ({ t, label: formatTimeLabel(t, step), isYear: false })),
    ...yearTs.map((t) => ({ t, label: formatYearBoundaryLabel(t), isYear: true }))
  ];
  items.sort((a, b) => a.t - b.t);
  return items;
}
function formatCrosshairTimeLabel(t, resolution) {
  const d = (0, import_dayjs_min.default)(t);
  const candleMs = CANDLE_MS3[resolution] ?? CANDLE_MS3["1h"];
  if (candleMs >= 864e5) return d.format("MMM D, YYYY");
  return d.format("MMM D, YYYY HH:mm");
}
function formatPrice(p, priceScale) {
  const decimals = p >= 100 ? 0 : priceScale ? Math.max(0, Math.round(Math.log10(priceScale))) : 2;
  return p.toLocaleString("en-US", { minimumFractionDigits: Math.min(decimals, 8), maximumFractionDigits: Math.min(decimals, 8) });
}
function formatVolumeAxis(v) {
  if (!Number.isFinite(v) || v <= 0) return "0";
  const a = Math.abs(v);
  const trim = (x) => {
    const s = x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2);
    return s.replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1");
  };
  if (a >= 1e12) return `${trim(v / 1e12)}T`;
  if (a >= 1e9) return `${trim(v / 1e9)}B`;
  if (a >= 1e6) return `${trim(v / 1e6)}M`;
  if (a >= 1e3) return `${trim(v / 1e3)}K`;
  if (a >= 1) return Math.round(v).toLocaleString("en-US");
  return String(v);
}
var VOLUME_AXIS_LABEL_COUNT = 4;
function volumeAxisTicks(maxVol, count = VOLUME_AXIS_LABEL_COUNT) {
  if (!Number.isFinite(maxVol) || maxVol <= 0) return [];
  const ticks = [];
  for (let i = 1; i <= count; i++) ticks.push(maxVol * i / count);
  return ticks.sort((a, b) => b - a);
}
function drawBackground(ctx, viewport, theme) {
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, viewport.width + PRICE_AXIS_W, viewport.height + TIME_AXIS_H);
}
function drawGrid(ctx, viewport, theme) {
  const { width, height, priceMin, priceMax, msPerPixel, priceLogScale } = viewport;
  const priceH = height * (1 - VOL_RATIO);
  ctx.save();
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1;
  const priceLevels = priceLogScale ? logPriceTicks(priceMin, priceMax) : (() => {
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
function drawCandles(ctx, candles, allCandles, viewport, resolution, theme, ignoreGaps = true) {
  if (!candles.length || !allCandles.length) return;
  const compact = ignoreGaps !== false;
  const candleMs = CANDLE_MS3[resolution] ?? CANDLE_MS3["1h"];
  const cw = candleMs / viewport.msPerPixel;
  const bw = Math.max(1, cw - Math.max(1, cw * 0.15));
  const priceH = viewport.height * (1 - VOL_RATIO);
  const n = allCandles.length;
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
      if (i === void 0) continue;
      plotT = baseCompactT + i * candleMs;
    } else {
      plotT = c.t;
    }
    const cx = viewport.timeToX(plotT) + cw / 2;
    if (cx < -cw || cx > viewport.width + cw) continue;
    const isUp = c.c >= c.o;
    const upColor = theme.candleUp;
    const dnColor = theme.candleDown;
    const bodyColor = isUp ? upColor : dnColor;
    const wickColor = isUp ? theme.wickUp : theme.wickDown;
    const bodyTop = Math.min(viewport.priceToY(c.o), viewport.priceToY(c.c));
    const bodyBot = Math.max(viewport.priceToY(c.o), viewport.priceToY(c.c));
    const bodyH = Math.max(1, bodyBot - bodyTop);
    const wickTop = Math.max(0, viewport.priceToY(c.h));
    const wickBot = Math.min(priceH, viewport.priceToY(c.l));
    ctx.strokeStyle = cw < 2 ? bodyColor : wickColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.round(cx) + 0.5, wickTop);
    ctx.lineTo(Math.round(cx) + 0.5, wickBot);
    ctx.stroke();
    if (cw >= 2) {
      const bx = Math.round(cx - bw / 2);
      const by = Math.round(bodyTop);
      const bh = Math.round(bodyH);
      if (c.live) {
        ctx.strokeStyle = bodyColor;
        ctx.lineWidth = 1;
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
function drawVolume(ctx, candles, allCandles, viewport, resolution, theme, ignoreGaps = true) {
  if (!candles.length || !allCandles.length) return;
  const compact = ignoreGaps !== false;
  const candleMs = CANDLE_MS3[resolution] ?? CANDLE_MS3["1h"];
  const cw = candleMs / viewport.msPerPixel;
  const bw = Math.max(1, cw - Math.max(1, cw * 0.15));
  const priceH = viewport.height * (1 - VOL_RATIO);
  const volH = viewport.height * VOL_RATIO;
  const volDrawH = Math.max(0, volH - VOL_TOP_GAP_PX);
  const maxVol = candles.reduce((m, c) => Math.max(m, candleVolumeTotal(c)), 0);
  if (!maxVol || volDrawH <= 0) return;
  const n = allCandles.length;
  let baseCompactT;
  let rowIdx;
  if (compact) {
    baseCompactT = allCandles[n - 1].t - (n - 1) * candleMs;
    rowIdx = rowIndexByRef(allCandles);
  }
  const Y_base = priceH + volH;
  const hasAnyPositiveVs = candles.some((c) => c.vs != null && Number(c.vs) > 0);
  ctx.save();
  for (const c of candles) {
    const vtot = candleVolumeTotal(c);
    if (!vtot) continue;
    let plotT;
    if (compact) {
      const i = rowIdx.get(c);
      if (i === void 0) continue;
      plotT = baseCompactT + i * candleMs;
    } else {
      plotT = c.t;
    }
    const cx = viewport.timeToX(plotT) + cw / 2;
    if (cx < -cw || cx > viewport.width + cw) continue;
    const bx = Math.round(cx - bw / 2);
    const bwR = Math.round(bw);
    const H = vtot / maxVol * volDrawH;
    const hasSplit = c.vb != null && c.vs != null;
    if (hasSplit && hasAnyPositiveVs) {
      const vb = Number(c.vb) || 0;
      const vs = Number(c.vs) || 0;
      const big = Math.max(vb, vs);
      const small = Math.min(vb, vs);
      const H_big = big / maxVol * volDrawH;
      const H_small = small / maxVol * volDrawH;
      const yTop = Y_base - H;
      ctx.fillStyle = theme.volStackGray;
      ctx.fillRect(bx, Math.round(yTop), bwR, Math.round(H_small));
      ctx.fillStyle = vs > vb ? theme.volSellDom : theme.volBuyDom;
      ctx.fillRect(bx, Math.round(yTop + H_small), bwR, Math.round(H_big));
    } else {
      ctx.fillStyle = !hasAnyPositiveVs ? theme.volNoSellSide : c.c >= c.o ? theme.volUp : theme.volDown;
      ctx.fillRect(bx, Math.round(Y_base - H), bwR, Math.round(H));
    }
  }
  ctx.restore();
}
function drawVolumeSeparator(ctx, viewport, theme) {
  const priceH = viewport.height * (1 - VOL_RATIO);
  const lw = theme.volumeSeparatorLineWidth ?? 1;
  const y = Math.round(priceH) + (lw % 2 === 1 ? 0.5 : 0);
  ctx.save();
  ctx.strokeStyle = theme.volumeSeparatorColor ?? theme.gridLine;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(viewport.width + PRICE_AXIS_W, y);
  ctx.stroke();
  ctx.restore();
}
function drawTimeAxis(ctx, viewport, theme) {
  const { width, height, msPerPixel } = viewport;
  const y0 = height;
  const { from, to } = viewport.visibleRange();
  const step = niceTimeStep(msPerPixel);
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, y0, width, TIME_AXIS_H);
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y0 + 0.5);
  ctx.lineTo(width, y0 + 0.5);
  ctx.stroke();
  ctx.font = FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const labelItems = buildTimeAxisLabelItems(from, to, step);
  let lastLabelRight = -Infinity;
  for (const { t, label, isYear } of labelItems) {
    const x = viewport.timeToX(t);
    if (x < 20 || x > width - 20) continue;
    ctx.fillStyle = isYear ? "#ffffff" : theme.textDim;
    const w = ctx.measureText(label).width;
    const left = x - w / 2;
    const right = x + w / 2;
    if (left <= lastLabelRight + 8) continue;
    ctx.fillText(label, x, y0 + TIME_AXIS_H / 2);
    lastLabelRight = right;
  }
}
function drawPriceAxis(ctx, viewport, theme, priceScale) {
  const { width, height, priceMin, priceMax, priceLogScale } = viewport;
  const priceH = height * (1 - VOL_RATIO);
  const x0 = width;
  ctx.fillStyle = theme.bg;
  ctx.fillRect(x0, 0, PRICE_AXIS_W, height + TIME_AXIS_H);
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x0 + 0.5, 0);
  ctx.lineTo(x0 + 0.5, height);
  ctx.stroke();
  ctx.fillStyle = theme.textDim;
  ctx.font = FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const priceLevels = priceLogScale ? logPriceTicks(priceMin, priceMax) : (() => {
    const interval = nicePriceInterval(priceMax - priceMin);
    const firstP = Math.ceil(priceMin / interval) * interval;
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
function drawVolumeAxis(ctx, candles, viewport, theme) {
  if (!candles.length) return;
  const maxVol = candles.reduce((m, c) => Math.max(m, candleVolumeTotal(c)), 0);
  if (!Number.isFinite(maxVol) || maxVol <= 0) return;
  const { width, height } = viewport;
  const priceH = height * (1 - VOL_RATIO);
  const volH = height * VOL_RATIO;
  const volDrawH = Math.max(0, volH - VOL_TOP_GAP_PX);
  if (volDrawH <= 0) return;
  const x0 = width;
  const ticks = volumeAxisTicks(maxVol);
  if (!ticks.length) return;
  ctx.save();
  ctx.fillStyle = theme.textDim;
  ctx.font = FONT;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const sepY = Math.round(priceH);
  const axisTop = sepY + VOL_TOP_GAP_PX;
  const axisBot = height;
  const axisSpan = Math.max(1, axisBot - axisTop);
  for (const vol of ticks) {
    const y = axisBot - vol / maxVol * axisSpan;
    if (y < axisTop - 0.5 || y > axisBot) continue;
    ctx.fillText(formatVolumeAxis(vol), x0 + 6, y);
  }
  ctx.restore();
}
function drawCrosshair(ctx, pos, candle, viewport, theme, priceScale, resolution) {
  if (!pos) return;
  const { x, y } = pos;
  const { width, height } = viewport;
  const priceH = height * (1 - VOL_RATIO);
  ctx.save();
  ctx.strokeStyle = theme.crosshair;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + 0.5, 0);
  ctx.lineTo(Math.round(x) + 0.5, height + TIME_AXIS_H);
  ctx.stroke();
  if (y >= 0 && y <= priceH) {
    ctx.beginPath();
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(width, Math.round(y) + 0.5);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
  if (y >= 0 && y <= priceH) {
    const price = viewport.yToPrice(y);
    const label = formatPrice(price, priceScale);
    ctx.fillStyle = theme.textBright;
    ctx.fillRect(width + 1, Math.round(y) - 9, PRICE_AXIS_W - 2, 18);
    ctx.fillStyle = theme.bg;
    ctx.font = FONT;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, width + 5, y);
  }
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
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, boxLeft + boxW / 2, yMid);
  }
  if (candle) {
    const fmt = (v) => formatPrice(v, priceScale);
    const parts = [
      `O ${fmt(candle.o)}`,
      `H ${fmt(candle.h)}`,
      `L ${fmt(candle.l)}`,
      `C ${fmt(candle.c)}`,
      `V ${candle.v != null ? candle.v.toLocaleString("en-US", { minimumFractionDigits: candle.v >= 100 ? 0 : 2, maximumFractionDigits: candle.v >= 100 ? 0 : 2 }) : "\u2014"}`
    ];
    ctx.font = FONT;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme.text;
    const gap = 12;
    let cx = 8;
    const cy = 14;
    for (const part of parts) {
      ctx.fillText(part, cx, cy);
      cx += ctx.measureText(part).width + gap;
    }
  }
}
function drawLiveIndicator(ctx, price, viewport, theme) {
  const y = viewport.priceToY(price);
  const priceH = viewport.height * (1 - VOL_RATIO);
  if (y < 0 || y > priceH) return;
  ctx.save();
  ctx.strokeStyle = theme.livePrice;
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(viewport.width, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = theme.livePrice;
  ctx.beginPath();
  ctx.arc(viewport.width - 8, y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
function drawNoDataMarker(ctx, viewport, theme, side = "left") {
  ctx.save();
  ctx.fillStyle = theme.textDim;
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const x = side === "left" ? 80 : viewport.width - 80;
  ctx.fillText("No data", x, viewport.height * 0.4);
  ctx.restore();
}

// ../rv-lib/chart.js
var CANDLE_MS4 = { "1m": 6e4, "5m": 3e5, "30m": 18e5, "1h": 36e5, "1d": 864e5, "1w": 6048e5 };
var RESOLUTIONS = Object.keys(CANDLE_MS4);
var RESOLUTION_SET = new Set(RESOLUTIONS);
var RESOLUTION_STORAGE_KEY = "rigoview.resolution";
function readStoredResolution() {
  try {
    const s = localStorage.getItem(RESOLUTION_STORAGE_KEY);
    if (s && RESOLUTION_SET.has(s)) return s;
  } catch (_) {
  }
  return null;
}
function writeStoredResolution(resolution) {
  try {
    localStorage.setItem(RESOLUTION_STORAGE_KEY, resolution);
  } catch (_) {
  }
}
function resolveInitialResolution(explicit) {
  if (explicit && RESOLUTION_SET.has(explicit)) return explicit;
  return readStoredResolution() ?? "1h";
}
var RIGHT_GUTTER_PX = 20;
var Chart = class {
  constructor(container, options) {
    this._container = container;
    this._options = options;
    this._symbol = options.symbol ?? null;
    this._resolution = resolveInitialResolution(options.resolution);
    this._meta = null;
    this._destroyed = false;
    this._hoverPos = null;
    this._hoverCandle = null;
    this._barWidthPx = options.barWidthPx ?? null;
    this._ignoreGaps = options.ignoreGaps !== false;
    this._backfillLeftRunning = false;
    this._symbolHistory = [];
    this._symbolHistoryIdx = -1;
    this._navigatingHistory = false;
    if (this._symbol) {
      this._symbolHistory.push(this._symbol);
      this._symbolHistoryIdx = 0;
    }
    this._staticDirty = true;
    this._overlayDirty = false;
    this._rafScheduled = false;
    this._buildDOM();
    this._dpr = window.devicePixelRatio || 1;
    this._resize();
    this._theme = readTheme(container);
    this._http = new HttpClient(options.apiBase);
    this._ws = new WsClient(options.wsBase);
    this._ds = new DataStore(this._http);
    this._vp = new Viewport(this._chartW(), this._chartH());
    this._updateLogBtnStyle();
    this._interaction = new Interaction(this._overlayCanvas, this._vp, this._ds);
    this._picker = new SymbolPicker(container, this._http, (id) => this.setSymbol(id));
    this._wireEvents();
    this._resizeObserver = new ResizeObserver(() => this._onResize());
    this._resizeObserver.observe(this._canvasWrap);
    this._updateToolbar();
    if (this._symbol) this._load();
    else this.invalidate("static");
  }
  // ---- DOM setup ----
  _buildDOM() {
    this._container.style.cssText += ";position:relative;overflow:hidden";
    this._toolbar = document.createElement("div");
    this._toolbar.style.cssText = [
      "display:flex;align-items:center;gap:4px;flex-shrink:0",
      "height:36px;padding:0 10px;box-sizing:border-box",
      "background:var(--widget-bg-color,#141722)",
      "border-bottom:1px solid var(--widget-border-color,#252836)",
      "color:var(--text-color,#a0a8b8);font:13px monospace"
    ].join(";");
    this._symbolBtn = document.createElement("button");
    this._symbolBtn.style.cssText = [
      "background:rgba(255,255,255,0.08);border:none;border-radius:3px",
      "color:var(--text-bright-color,#e0e8f0);font:600 13px monospace",
      "padding:3px 10px;cursor:pointer;margin-right:8px;white-space:nowrap"
    ].join(";");
    this._symbolBtn.textContent = this._symbol ?? "Select symbol";
    this._symbolBtn.addEventListener("click", () => this._picker.open());
    this._toolbar.appendChild(this._symbolBtn);
    const navBtnStyle = [
      "background:none;border:none;border-radius:3px",
      "padding:3px 8px;cursor:pointer;font:14px monospace",
      "color:var(--text-dim-color,#505870)",
      "flex-shrink:0;min-width:28px"
    ].join(";");
    this._backBtn = document.createElement("button");
    this._backBtn.type = "button";
    this._backBtn.textContent = "\u2190";
    this._backBtn.title = "Previous symbol";
    this._backBtn.setAttribute("aria-label", "Previous symbol");
    this._backBtn.style.cssText = navBtnStyle;
    this._backBtn.addEventListener("click", () => void this._goBack());
    this._toolbar.appendChild(this._backBtn);
    this._fwdBtn = document.createElement("button");
    this._fwdBtn.type = "button";
    this._fwdBtn.textContent = "\u2192";
    this._fwdBtn.title = "Next symbol";
    this._fwdBtn.setAttribute("aria-label", "Next symbol");
    this._fwdBtn.style.cssText = navBtnStyle;
    this._fwdBtn.addEventListener("click", () => void this._goForward());
    this._toolbar.appendChild(this._fwdBtn);
    this._resBtns = {};
    for (const r of RESOLUTIONS) {
      const btn = document.createElement("button");
      btn.textContent = r;
      btn.dataset.res = r;
      btn.style.cssText = [
        "background:none;border:none;border-radius:3px",
        "padding:3px 8px;cursor:pointer;font:12px monospace",
        "color:var(--text-dim-color,#505870)",
        "flex-shrink:0"
      ].join(";");
      btn.addEventListener("click", () => this.setResolution(r));
      this._resBtns[r] = btn;
      this._toolbar.appendChild(btn);
    }
    this._canvasWrap = document.createElement("div");
    this._canvasWrap.style.cssText = "position:relative;flex:1;min-height:0;overflow:hidden";
    this._staticCanvas = document.createElement("canvas");
    this._overlayCanvas = document.createElement("canvas");
    for (const c of [this._staticCanvas, this._overlayCanvas]) {
      c.style.cssText = "position:absolute;top:0;left:0;display:block";
    }
    this._overlayCanvas.style.cursor = "crosshair";
    this._canvasWrap.appendChild(this._staticCanvas);
    this._canvasWrap.appendChild(this._overlayCanvas);
    this._logBtn = document.createElement("button");
    this._logBtn.type = "button";
    this._logBtn.textContent = "LOG";
    this._logBtn.title = "Toggle logarithmic price scale";
    this._logBtn.style.cssText = [
      "position:absolute",
      "right:0",
      "bottom:0",
      `width:${PRICE_AXIS_W}px`,
      `height:${TIME_AXIS_H}px`,
      "padding:0",
      "margin:0",
      "box-sizing:border-box",
      "border:none",
      "border-left:1px solid var(--widget-border-color,#252836)",
      "display:flex",
      "align-items:center",
      "justify-content:center",
      "background:transparent",
      "color:var(--text-dim-color,#505870)",
      "font:600 10px monospace",
      "letter-spacing:0.04em",
      "cursor:pointer",
      "z-index:2"
    ].join(";");
    this._logBtn.addEventListener("click", () => this._toggleLogScale());
    this._canvasWrap.appendChild(this._logBtn);
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display:flex;flex-direction:column;width:100%;height:100%";
    wrapper.appendChild(this._toolbar);
    wrapper.appendChild(this._canvasWrap);
    this._container.appendChild(wrapper);
  }
  _chartW() {
    return Math.max(1, this._canvasWrap.clientWidth - PRICE_AXIS_W);
  }
  _chartH() {
    return Math.max(1, this._canvasWrap.clientHeight - TIME_AXIS_H);
  }
  _toggleLogScale() {
    this._vp.priceLogScale = !this._vp.priceLogScale;
    this._vp.priceLocked = false;
    const candles = this._visibleCandles();
    if (candles.length) this._vp.fitToCandles(candles);
    this._updateLogBtnStyle();
    this.invalidate("static");
  }
  _updateLogBtnStyle() {
    const on = this._vp.priceLogScale;
    this._logBtn.style.color = on ? "var(--text-bright-color,#e0e8f0)" : "var(--text-dim-color,#505870)";
    this._logBtn.style.background = on ? "rgba(255,255,255,0.14)" : "transparent";
  }
  _resize() {
    const dpr = this._dpr;
    const w = Math.max(1, this._canvasWrap.clientWidth);
    const h = Math.max(1, this._canvasWrap.clientHeight);
    for (const canvas of [this._staticCanvas, this._overlayCanvas]) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
    }
  }
  _onResize() {
    if (this._destroyed) return;
    this._resize();
    this._vp.resize(this._chartW(), this._chartH());
    const candles = this._visibleCandles();
    if (candles.length) this._vp.fitToCandles(candles);
    this.invalidate("static");
    void this._backfillLeftHistory();
  }
  // ---- Event wiring ----
  _wireEvents() {
    this._vp.on("viewport:changed", () => {
      if (this._symbol) {
        const candles = this._visibleCandles();
        if (candles.length) this._vp.fitToCandles(candles);
      }
      this.invalidate("static");
    });
    this._ds.addEventListener("data:loaded", (e) => {
      const { symbol, resolution } = e.detail;
      if (symbol !== this._symbol || resolution !== this._resolution) return;
      const candles = this._visibleCandles();
      if (candles.length) this._vp.fitToCandles(candles);
      this.invalidate("static");
    });
    this._ds.addEventListener("data:live-tick", (e) => {
      const { symbol, resolution } = e.detail;
      if (symbol !== this._symbol || resolution !== this._resolution) return;
      this.invalidate("static");
    });
    this._ds.addEventListener("data:close", (e) => {
      const { symbol, resolution } = e.detail;
      if (symbol !== this._symbol || resolution !== this._resolution) return;
      this.invalidate("static");
    });
    this._ws.addEventListener("partial", (e) => {
      const d = e.detail;
      if (this._ds.isBuffering(d.symbol, d.resolution)) {
        this._ds.bufferWsEvent(d.symbol, d.resolution, d);
      } else {
        this._ds.applyPartial(d.symbol, d.resolution, d);
      }
    });
    this._ws.addEventListener("close", (e) => {
      const d = e.detail;
      if (this._ds.isBuffering(d.symbol, d.resolution)) {
        this._ds.bufferWsEvent(d.symbol, d.resolution, d);
      } else {
        this._ds.applyClose(d.symbol, d.resolution, d);
      }
    });
    this._interaction.on("hover", (pos) => {
      this._hoverPos = pos;
      if (pos) {
        const { from, to } = this._vp.visibleRange();
        const candles = this._ds.getWindow(this._symbol, this._resolution, from, to, this._ignoreGaps);
        const allCandles = this._ds.getAll(this._symbol, this._resolution);
        this._hoverCandle = this._findCandleAtX(candles, allCandles, pos.x);
      } else {
        this._hoverCandle = null;
      }
      this.invalidate("overlay");
    });
    this._interaction.on("open-symbol-picker", () => this._picker.open());
    this._interaction.on("resolution-change", (res) => this.setResolution(res));
    this._interaction.on("prefetch-left", async ({ before }) => {
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
          console.error("[RigoView] Left history backfill failed", err);
          break;
        }
        const newOldest = this._ds.getOldest(this._symbol, this._resolution);
        if (newOldest == null || newOldest >= prevOldest) break;
        const visible = this._visibleCandles();
        if (visible.length) this._vp.fitToCandles(visible);
        this.invalidate("static");
      }
    } finally {
      this._backfillLeftRunning = false;
    }
  }
  _findCandleAtX(candles, allCandles, x) {
    if (!candles.length || !allCandles.length) return null;
    const candleMs = CANDLE_MS4[this._resolution] ?? CANDLE_MS4["1h"];
    let best = null, bestDist = Infinity;
    if (this._ignoreGaps) {
      const n = allCandles.length;
      const baseCompactT = allCandles[n - 1].t - (n - 1) * candleMs;
      const rowIdx = rowIndexByRef(allCandles);
      for (const c of candles) {
        const fullIdx = rowIdx.get(c);
        if (fullIdx === void 0) continue;
        const compactT = baseCompactT + fullIdx * candleMs;
        const dist = Math.abs(this._vp.timeToX(compactT) - x);
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }
    } else {
      for (const c of candles) {
        const dist = Math.abs(this._vp.timeToX(c.t) - x);
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
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
    const candleMs = CANDLE_MS4[resolution] ?? CANDLE_MS4["1h"];
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
    if (layer === "static") {
      this._staticDirty = true;
      this._overlayDirty = true;
    }
    if (layer === "overlay") this._overlayDirty = true;
    if (!this._rafScheduled) {
      this._rafScheduled = true;
      requestAnimationFrame(() => this._frame());
    }
  }
  _frame() {
    if (this._destroyed) return;
    this._rafScheduled = false;
    if (this._staticDirty) this._drawStatic();
    if (this._overlayDirty) this._drawOverlay();
    this._staticDirty = false;
    this._overlayDirty = false;
  }
  _drawStatic() {
    const dpr = this._dpr;
    const ctx = this._staticCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._clampRightEdgeToLatest();
    const vp = this._vp;
    const theme = this._theme;
    const resolution = this._resolution;
    const { from, to } = vp.visibleRange();
    const allCandles = this._symbol ? this._ds.getAll(this._symbol, resolution) : [];
    const candles = this._symbol ? this._ds.getWindow(this._symbol, resolution, from, to, this._ignoreGaps) : [];
    const avail = this._symbol ? this._ds.getAvailability(this._symbol, resolution) : null;
    const priceScale = this._meta?.priceScale;
    drawBackground(ctx, vp, theme);
    drawGrid(ctx, vp, theme);
    drawVolume(ctx, candles, allCandles, vp, resolution, theme, this._ignoreGaps);
    drawCandles(ctx, candles, allCandles, vp, resolution, theme, this._ignoreGaps);
    if (avail && candles.length === 0 && this._ds.getAll(this._symbol, resolution).length > 0) {
      const all2 = this._ds.getAll(this._symbol, resolution);
      if (from < all2[0].t) drawNoDataMarker(ctx, vp, theme, "left");
      if (to > all2[all2.length - 1].t) drawNoDataMarker(ctx, vp, theme, "right");
    }
    const all = this._symbol ? this._ds.getAll(this._symbol, resolution) : [];
    if (all.length) {
      const last = all[all.length - 1];
      if (last.live) drawLiveIndicator(ctx, last.c, vp, theme);
    }
    drawTimeAxis(ctx, vp, theme);
    drawPriceAxis(ctx, vp, theme, priceScale);
    drawVolumeAxis(ctx, candles, vp, theme);
    drawVolumeSeparator(ctx, vp, theme);
  }
  _drawOverlay() {
    const dpr = this._dpr;
    const ctx = this._overlayCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this._overlayCanvas.width / dpr, this._overlayCanvas.height / dpr);
    drawCrosshair(ctx, this._hoverPos, this._hoverCandle, this._vp, this._theme, this._meta?.priceScale, this._resolution);
  }
  // ---- Public commands ----
  async _load() {
    if (!this._symbol) return;
    this._ds.startBuffering(this._symbol, this._resolution);
    this._ws.subscribe(this._symbol, this._resolution);
    this._interaction.setContext(this._symbol, this._resolution);
    this._vp.adjustZoomForResolution(this._resolution);
    if (this._barWidthPx) {
      const candleMs = CANDLE_MS4[this._resolution] ?? CANDLE_MS4["1h"];
      this._vp.msPerPixel = candleMs / this._barWidthPx;
    }
    this._updateToolbar();
    try {
      this._meta = await this._http.getSymbolMeta(this._symbol);
    } catch {
      this._meta = null;
    }
    try {
      const loadParams = this._barWidthPx ? { count: Math.ceil(this._vp.width / this._barWidthPx * 1.1) } : {};
      await this._ds.load(this._symbol, this._resolution, loadParams);
      const candles = this._ds.getAll(this._symbol, this._resolution);
      this._alignRightEdgeToLatest(candles, this._resolution);
      const visible = this._visibleCandles();
      if (visible.length) this._vp.fitToCandles(visible);
      else if (candles.length) this._vp.fitToCandles(candles);
      this.invalidate("static");
      await this._backfillLeftHistory();
    } catch (err) {
      console.error("[RigoView] Failed to load candles", err);
    }
  }
  _updateToolbar() {
    this._symbolBtn.textContent = this._symbol ?? "Select symbol";
    for (const [r, btn] of Object.entries(this._resBtns)) {
      const active = r === this._resolution;
      btn.style.color = active ? "var(--text-bright-color,#e0e8f0)" : "var(--text-dim-color,#505870)";
      btn.style.background = active ? "rgba(255,255,255,0.1)" : "none";
    }
    this._updateNavButtons();
  }
  _updateNavButtons() {
    const canBack = this._symbolHistoryIdx > 0;
    const canFwd = this._symbolHistoryIdx < this._symbolHistory.length - 1;
    this._backBtn.disabled = !canBack;
    this._fwdBtn.disabled = !canFwd;
    this._backBtn.style.opacity = canBack ? "1" : "0.3";
    this._fwdBtn.style.opacity = canFwd ? "1" : "0.3";
    this._backBtn.style.pointerEvents = canBack ? "auto" : "none";
    this._fwdBtn.style.pointerEvents = canFwd ? "auto" : "none";
    this._backBtn.style.cursor = canBack ? "pointer" : "default";
    this._fwdBtn.style.cursor = canFwd ? "pointer" : "default";
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
    this._symbol = symbol;
    this._options.onSymbolChange?.(symbol);
    this._meta = null;
    this._hoverPos = null;
    this._hoverCandle = null;
    this._vp.priceLocked = false;
    await this._load();
  }
  async setResolution(resolution) {
    if (resolution === this._resolution) return;
    if (this._symbol) this._ws.unsubscribe(this._symbol, this._resolution);
    this._resolution = resolution;
    writeStoredResolution(resolution);
    this._updateToolbar();
    this._vp.adjustZoomForResolution(resolution);
    if (this._barWidthPx) {
      const candleMs = CANDLE_MS4[resolution] ?? CANDLE_MS4["1h"];
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
        const visible = this._visibleCandles();
        if (visible.length) this._vp.fitToCandles(visible);
        else if (candles.length) this._vp.fitToCandles(candles);
        this.invalidate("static");
        await this._backfillLeftHistory();
      } catch (err) {
        console.error("[RigoView] Failed to load candles", err);
      }
    }
  }
  jumpTo(timestamp) {
    this._vp.rightEdgeT = timestamp + this._vp.width * this._vp.msPerPixel * 0.5;
    this.invalidate("static");
    void this._backfillLeftHistory();
  }
  destroy() {
    this._destroyed = true;
    this._resizeObserver?.disconnect();
    this._interaction?.destroy();
    this._ws?.destroy();
    this._picker?.destroy();
    while (this._container.firstChild) this._container.removeChild(this._container.firstChild);
    this._container.style.position = "";
  }
};

// ../rv-lib/rigoview.js
var RigoView = class {
  constructor(container, options = {}) {
    this._chart = new Chart(container, {
      apiBase: options.apiBase ?? "/api/charts",
      wsBase: options.wsBase ?? `ws://${location.host}/api/charts/stream`,
      symbol: options.symbol ?? null,
      // Omit default so Chart can restore last resolution from storage.
      resolution: options.resolution,
      onSymbolChange: options.onSymbolChange ?? null,
      barWidthPx: options.barWidthPx ?? null,
      ignoreGaps: options.ignoreGaps !== false
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
};
export {
  RigoView
};
