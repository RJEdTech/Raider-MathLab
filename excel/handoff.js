/* RJAnalyzeHandoff v1: send a Raider Labs data table to "Analyze your lab data" in Raider MathLab's Excel from zero.
   Copy this whole block into a science site (no dependencies). Call it from a button click:
     RJAnalyzeHandoff.send({
       source: { site: 'Raider PhysLab', tool: 'Springs and Hooke’s law', url: location.href },
       columns: [{ name: 'Mass', unit: 'kg' }, { name: 'Stretch', unit: 'm' }],
       rows: [[0.05, 0.024], [0.10, 0.049]],
       accepted: null,                      // or { column: 'g', value: 9.8, unit: 'm/s²' }; column 'slope' compares with the slope
       suggest: { x: 'Mass', y: 'Stretch' } // or null; y may be a list of repeated-trial columns
     });
   It saves the table in localStorage ('rjlabs-analyze') and opens excel.html#analyze-in in a new tab.
   If localStorage is blocked, a small table goes in the address instead (#analyze-in=<base64url JSON>, at most 6000 characters).
   Returns { ok: true, via: 'storage' | 'hash', url } or { ok: false, reason: 'empty' | 'too-big' }. Contract: HANDOFF.md. */
(function (root) {
  'use strict';
  var BASE = 'https://rjedtech.github.io/Raider-MathLab/excel.html', KEY = 'rjlabs-analyze', HASH_MAX = 6000, MAX_ROWS = 500, MAX_COLS = 12;
  function str(s, max) { return String(s == null ? '' : s).slice(0, max); }
  function cell(v) {
    if (typeof v === 'number') return isFinite(v) ? v : null;
    if (v == null || v === '' || v === '—') return null;
    return str(v, 40);
  }
  function build(p) {
    p = p || {};
    var cols = (p.columns || []).slice(0, MAX_COLS).map(function (c) { return { name: str(c && c.name, 60), unit: str(c && c.unit, 20) }; });
    var rows = (p.rows || []).slice(0, MAX_ROWS).map(function (r) { return (r || []).slice(0, cols.length).map(cell); });
    var src = p.source || {};
    return {
      v: 1,
      source: { site: str(src.site, 60), tool: str(src.tool, 100), url: str(src.url, 300) },
      columns: cols, rows: rows,
      accepted: p.accepted && typeof p.accepted.value === 'number' ? { column: str(p.accepted.column, 60), value: p.accepted.value, unit: str(p.accepted.unit, 20) } : null,
      suggest: p.suggest ? { x: p.suggest.x == null ? null : str(p.suggest.x, 60), y: Array.isArray(p.suggest.y) ? p.suggest.y.map(function (y) { return str(y, 60); }) : str(p.suggest.y, 60) } : null,
      created: Date.now()
    };
  }
  function b64url(text) {
    var bytes = root.TextEncoder ? new TextEncoder().encode(text) : unescape(encodeURIComponent(text)).split('').map(function (c) { return c.charCodeAt(0); }), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function send(p, o) {
    o = o || {};
    var payload = build(p), base = o.base || BASE, url = null, via = null;
    if (!payload.columns.length || !payload.rows.length) return { ok: false, reason: 'empty' };
    var json = JSON.stringify(payload);
    try { root.localStorage.setItem(KEY, json); if (root.localStorage.getItem(KEY) === json) { url = base + '#analyze-in'; via = 'storage'; } } catch (e) { /* storage blocked: try the address */ }
    if (!url) { var h = b64url(json); if (h.length <= HASH_MAX) { url = base + '#analyze-in=' + h; via = 'hash'; } }
    if (!url) return { ok: false, reason: 'too-big' };
    if (o.open !== false) {
      var w = root.open(url, o.target || '_blank');
      if (w) { try { w.opener = null; } catch (e) { /* ignore */ } } else root.location.href = url;
    }
    return { ok: true, via: via, url: url };
  }
  root.RJAnalyzeHandoff = { send: send, build: build, version: 1 };
})(window);
