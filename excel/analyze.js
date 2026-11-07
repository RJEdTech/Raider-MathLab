/* excel/analyze.js: "Analyze your lab data", the science track of Excel from zero.
   A student brings real lab data three ways (paste it, type it, or arrive from a science Raider Labs site through the
   hand-off), or practices on a sample lab. Then one action at a time, on the grid: check the data, name the columns and
   units, AVERAGE the trials (fill down when there are several conditions), STDEV.S, percent error against an accepted
   value, SLOPE / INTERCEPT / RSQ, a scatter chart with its trendline, and the .xlsx download.
   Every check and every number in the messages is computed from the student's own data at run time.
   Routes: #analyze (start here), #analyze-paste, #analyze-type, #analyze-sample, #analyze-sample-<id>,
           #analyze-in (hand-off: localStorage 'rjlabs-analyze'), #analyze-in=<base64url JSON> (small tables), #analyze-run.
   The hand-off contract is in HANDOFF.md; excel/handoff.js is the sender the science sites copy.
   Copy rules: plain words, active voice, no em dashes, nothing named before it is needed. */
(function () {
  'use strict';
  var R = window.RJSheet, XL = window.XL, Coach = window.XLCoach, KINDS = XL.KINDS, words = XL.words;
  var LIM = { rows: 500, cols: 12, hash: 6000, age: 864e5, skew: 3e5, name: 60, unit: 20, text: 40, site: 60, tool: 100, url: 300, typeRows: 100, typeCols: 8 };
  var KEY = 'rjlabs-analyze', SKEY = 'rjlabs-analyze-session';
  var local = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    del: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* storage blocked */ } }
  };
  var session = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* storage blocked: a reload starts over */ } }
  };

  /* ===================== text and numbers ===================== */
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  /* every string from outside (paste, hand-off) goes through clean() before it reaches the sheet or the page */
  function clean(s, max) {
    s = String(s == null ? '' : s).replace(/[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028-\u202E\u2060-\u2069\uFEFF]/g, ' ').replace(/\u00A0/g, ' ')
      .replace(/\s+[—–]\s+/g, ': ').replace(/—/g, '-').replace(/\s+/g, ' ').trim();
    if (max && s.length > max) s = s.slice(0, max).trim();
    return s;
  }
  var NUMRE = /^([+-])?\s*(\$)?\s*([+-])?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?\s*(%)?$/;
  function isNumText(s) { var m = NUMRE.exec(String(s).trim()); return !!m && !((m[1] && m[3]) || (m[2] && m[6])); }
  var UNITRE = /^([+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+))\s*([A-Za-zµμ°Ω℃][A-Za-z0-9µμ°Ω℃\/²³·^*.\- ]{0,15})$/;
  var DECCOMMA = /^[+-]?\d+,\d+$/;
  var DASH = /^[-–—]+$/;
  function splitHead(h) {
    var s = String(h || '').trim(), m = /^(.*?)\s*[(\[]([^()\[\]]*)[)\]]\s*$/.exec(s);
    return m ? { name: m[1].trim() || s, unit: m[2].trim() } : { name: s, unit: '' };
  }
  function lower(s) { return /^[A-Z][a-z]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s; }
  function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function L(c) { return R.colName(c); }
  function A(c, r) { return R.colName(c) + r; }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); }
  function plural(n, w, ws) { return n + ' ' + (n === 1 ? w : (ws || w + 's')); }
  function rel(a, b) { return typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)); }
  function near(a, b) { return typeof a === 'number' && typeof b === 'number' && isFinite(b) && Math.abs(a - b) <= 1e-6 * Math.max(1e-9, Math.abs(b)) + 1e-12; }

  /* ===================== statistics (independent of the engine) ===================== */
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }
  function sdS(a) { if (a.length < 2) return NaN; var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / (a.length - 1)); }
  function sdP(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return Math.sqrt(s / a.length); }
  function fit(x, y) {
    var n = x.length; if (n < 2) return null;
    var xm = mean(x), ym = mean(y), sxx = 0, syy = 0, sxy = 0;
    for (var i = 0; i < n; i++) { sxx += (x[i] - xm) * (x[i] - xm); syy += (y[i] - ym) * (y[i] - ym); sxy += (x[i] - xm) * (y[i] - ym); }
    if (!sxx) return null;
    var m = sxy / sxx;
    return { slope: m, icpt: ym - m * xm, rsq: syy ? sxy * sxy / (sxx * syy) : NaN, r: syy ? sxy / Math.sqrt(sxx * syy) : NaN, n: n };
  }
  XL.azStats = { mean: mean, sdS: sdS, fit: fit };

  /* ===================== reading a pasted table ===================== */
  function csvRows(t, d) {
    var rows = [], row = [], f = '', q = false, i = 0;
    for (; i < t.length; i++) {
      var ch = t[i];
      if (q) { if (ch === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; continue; }
      if (ch === '"' && !f.trim()) { q = true; f = ''; }
      else if (ch === d) { row.push(f); f = ''; }
      else if (ch === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else f += ch;
    }
    row.push(f); rows.push(row);
    return rows;
  }
  function numish(s) { s = String(s).trim(); return isNumText(s) || UNITRE.test(s) || DECCOMMA.test(s); }
  /* returns {headers, rows, notes, warn} or {error, n} */
  function parsePaste(text) {
    var notes = [], warn = [], t = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    var lines = t.split('\n');
    while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
    while (lines.length && !lines[0].trim()) lines.shift();
    if (!lines.length) return { error: 'empty' };
    var body = lines.join('\n'), rows;
    /* commas or semicolons: pick the one that splits the lines most evenly (a decimal comma is not a column break) */
    function score(d) { var n = lines.map(function (l) { return l.split(d).length; }), c = {}; n.forEach(function (k) { if (k > 1) c[k] = (c[k] || 0) + 1; }); var best = 0; for (var k in c) best = Math.max(best, c[k]); return best; }
    var sc = score(','), ss = score(';');
    if (/\t/.test(body)) rows = lines.map(function (l) { return l.split('\t'); });
    else if (sc && sc >= ss) rows = csvRows(body, ',');
    else if (ss) rows = csvRows(body, ';');
    else {
      /* a table copied from a handout: columns split by spaces */
      var toks = lines.map(function (l) { return l.trim().split(/\s+/); }), counts = {};
      toks.forEach(function (tk) { if (tk.every(numish)) counts[tk.length] = (counts[tk.length] || 0) + 1; });
      var k = +Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0] || toks[0].length;
      rows = toks.map(function (tk, i) {
        if (tk.length === k || tk.every(numish)) return tk;
        var wide = lines[i].trim().split(/\s{2,}/);
        if (wide.length === k) return wide;
        if (i === 0) { warn.push('I could not tell where your header row splits into columns, so row 1 is empty. Type your column names there.'); return new Array(k).fill(''); }
        return tk;
      });
    }
    var trimmed = false, dashes = 0;
    rows = rows.map(function (r) { return r.map(function (c) { var raw = String(c), v = clean(raw, 200); if (v !== raw) trimmed = true; if (DASH.test(v)) { dashes++; v = ''; } return v; }); });
    var before = rows.length;
    rows = rows.filter(function (r) { return r.some(function (c) { return c !== ''; }); });
    if (rows.length < before) notes.push('I skipped ' + plural(before - rows.length, 'empty row') + '.');
    var lens = rows.map(function (r) { return r.length; }), C = Math.max.apply(null, lens);
    while (C > 0 && rows.every(function (r) { return !r[C - 1]; })) C--;
    if (!C) return { error: 'empty' };
    if (sc && sc >= ss && !/\t/.test(body)) {
      var bad = lens.filter(function (n) { return n !== lens[0]; }).length;
      if (bad) warn.push('Some rows have more commas than the others. If a number has a comma in it, like 1,200, the comma split it in two. Take those commas out, or copy from a spreadsheet instead.');
    }
    rows = rows.map(function (r) { r = r.slice(0, C); while (r.length < C) r.push(''); return r; });
    if (C > LIM.cols) return { error: 'cols', n: C };
    /* is the first row headers? yes if it has words where the rows below have numbers */
    var first = rows[0], rest = rows.slice(1), head = false;
    if (rest.length) for (var j = 0; j < C; j++) if (first[j] && !numish(first[j]) && rest.some(function (r) { return numish(r[j]); })) head = true;
    if (!rest.length && first.every(function (c) { return !c || !numish(c); })) return { error: 'norows' };
    if (!head && rest.length && first.every(function (c) { return !c || !numish(c); }) && first.some(function (c) { return c; })) head = true;
    var headers;
    if (head) { headers = first.map(function (c) { return clean(c, LIM.name); }); rows = rest; }
    else { headers = new Array(C).fill(''); notes.push('Your first row is numbers, so row 1 is empty for your column names.'); }
    if (rows.length > LIM.rows) return { error: 'rows', n: rows.length };
    if (!rows.length) return { error: 'norows' };
    if (trimmed) notes.push('I removed extra spaces.');
    if (dashes) notes.push(plural(dashes, 'cell') + ' held only a dash, so ' + (dashes === 1 ? 'it is' : 'they are') + ' empty now.');
    return { headers: headers, rows: rows, notes: notes, warn: warn };
  }
  XL.azParse = parsePaste;

  /* ===================== the hand-off from a science site ===================== */
  function b64dec(s) {
    s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '=';
    var bin = atob(s), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return window.TextDecoder ? new TextDecoder('utf-8', { fatal: true }).decode(u) : decodeURIComponent(escape(bin));
  }
  function safeUrl(u) { u = String(u || ''); return u.length <= LIM.url && /^https:\/\/rjedtech\.github\.io\/[A-Za-z0-9\-._~\/%?#=&+]*$/.test(u) ? u : ''; }
  var WHY = {
    none: 'No lab data was waiting for this page. Go back to the lab and press <b>Analyze in a spreadsheet</b> again, or copy your table there (<b>Copy as CSV</b>) and paste it below.',
    old: 'The lab data waiting here is more than a day old, so it did not load. Go back to the lab and press <b>Analyze in a spreadsheet</b> again, or paste your table below.',
    broken: 'The lab data could not be read. On the lab page, press <b>Copy as CSV</b>, then paste it below.',
    big: 'That table is bigger than this page can take (500 rows and 12 columns). Paste fewer rows below, or open your data in Excel directly.',
    nonum: 'The lab data had no numbers in it. Record some trials in the lab first, then press <b>Analyze in a spreadsheet</b> again.'
  };
  /* validate a payload; returns {ds} or {error: key} */
  function fromPayload(p, origin) {
    if (!p || typeof p !== 'object' || Array.isArray(p)) return { error: 'broken' };
    if (p.v !== 1) return { error: 'broken' };
    if (origin === 'handoff') {
      if (typeof p.created !== 'number' || !isFinite(p.created)) return { error: 'broken' };
      var age = Date.now() - p.created;
      if (age > LIM.age) return { error: 'old' };
      if (age < -LIM.skew) return { error: 'broken' };
    }
    if (!Array.isArray(p.columns) || !p.columns.length || !Array.isArray(p.rows) || !p.rows.length) return { error: 'broken' };
    if (p.columns.length > LIM.cols || p.rows.length > LIM.rows) return { error: 'big' };
    var cols = [], seen = {};
    for (var j = 0; j < p.columns.length; j++) {
      var c = p.columns[j];
      if (!c || typeof c !== 'object' || typeof c.name !== 'string') return { error: 'broken' };
      var nm = clean(c.name, LIM.name), un = typeof c.unit === 'string' ? clean(c.unit, LIM.unit) : '';
      if (!nm) nm = 'Column ' + L(j + 1);
      var sh = splitHead(nm); if (sh.unit && !un) { nm = sh.name; un = sh.unit; }
      var hd = un ? nm + ' (' + un + ')' : nm;
      if (seen[hd.toLowerCase()]) hd = hd + ' ' + (j + 1);
      seen[hd.toLowerCase()] = 1;
      cols.push({ name: nm, unit: un, head: hd });
    }
    var rows = [], nums = 0;
    for (var i = 0; i < p.rows.length; i++) {
      var r = p.rows[i];
      if (!Array.isArray(r) || r.length > cols.length) return { error: 'broken' };
      var out = [];
      for (j = 0; j < cols.length; j++) {
        var v = r[j];
        if (v === undefined || v === null || v === '') out.push(null);
        else if (typeof v === 'number') { if (!isFinite(v)) out.push(null); else { out.push(v); nums++; } }
        else if (typeof v === 'string') { var s = clean(v, LIM.text); if (DASH.test(s) || !s) out.push(null); else { out.push(s); if (isNumText(s)) nums++; } }
        else return { error: 'broken' };
      }
      rows.push(out);
    }
    if (!nums) return { error: 'nonum' };
    var src = p.source && typeof p.source === 'object' ? p.source : {};
    var ds = {
      origin: origin, headers: cols.map(function (c) { return c.head; }), rows: rows, notes: [], warn: [],
      source: { site: clean(src.site, LIM.site) || (origin === 'handoff' ? 'a Raider Labs site' : ''), tool: clean(src.tool, LIM.tool), url: safeUrl(src.url) },
      accepted: null, suggest: null, locked: true
    };
    var ac = p.accepted;
    if (ac && typeof ac === 'object' && typeof ac.value === 'number' && isFinite(ac.value) && ac.value !== 0)
      ds.accepted = { column: typeof ac.column === 'string' ? clean(ac.column, LIM.name) : '', value: ac.value, unit: typeof ac.unit === 'string' ? clean(ac.unit, LIM.unit) : '' };
    var sg = p.suggest;
    if (sg && typeof sg === 'object') {
      var y = Array.isArray(sg.y) ? sg.y.filter(function (s) { return typeof s === 'string'; }).map(function (s) { return clean(s, LIM.name); }) : typeof sg.y === 'string' ? [clean(sg.y, LIM.name)] : [];
      ds.suggest = { x: typeof sg.x === 'string' ? clean(sg.x, LIM.name) : null, y: y.slice(0, LIM.cols) };
    }
    ds.file = slug(ds.source.tool || ds.source.site || 'lab') + '-analysis';
    return { ds: ds };
  }
  /* read what a science site left for this page: localStorage first, then the URL hash. The key is cleared either way.
     After a load the address becomes #analyze-run, so a reload restores the data from this tab's sessionStorage. */
  function readHandoff(h) {
    var raw = local.get(KEY), how = 'storage', err = null, res;
    local.del(KEY);
    var m = /^analyze-in=(.*)$/.exec(h);
    if (raw == null && m) {
      how = 'hash';
      if (m[1].length > LIM.hash) return { error: 'big' };
      try { raw = b64dec(m[1]); } catch (e) { return { error: 'broken' }; }
    }
    if (raw == null) return { error: 'none' };
    try { res = fromPayload(JSON.parse(raw), 'handoff'); } catch (e) { res = { error: 'broken' }; }
    if (res.ds) res.how = how;
    return res;
  }

  /* ===================== sample labs (numbers checked by scratch/excel-test.js and scratch/az_numbers.py) ===================== */
  var SAMPLES = [
    { id: 'spring', title: 'Spring stretch', kind: 'Five masses, three trials each',
      blurb: 'A spring hangs from a clamp. Your group hung five masses on it, from 50 g to 250 g, and measured the stretch three times for each mass.',
      payload: { v: 1, source: { site: 'Sample lab', tool: 'Spring stretch' },
        columns: [{ name: 'Mass', unit: 'g' }, { name: 'Stretch trial 1', unit: 'cm' }, { name: 'Stretch trial 2', unit: 'cm' }, { name: 'Stretch trial 3', unit: 'cm' }],
        rows: [[50, 2.3, 2.5, 2.4], [100, 5.0, 4.8, 4.9], [150, 7.5, 7.2, 7.4], [200, 9.6, 10.0, 9.8], [250, 12.0, 12.3, 12.1]],
        accepted: null, suggest: { x: 'Mass', y: ['Stretch trial 1', 'Stretch trial 2', 'Stretch trial 3'] } } },
    { id: 'density', title: 'Density of copper', kind: 'Six trials and an accepted value',
      blurb: 'Your group measured a copper cylinder six times: its mass on a balance and its volume by water displacement, then worked out its density. The accepted density of copper is 8.96 g/cm³.',
      payload: { v: 1, source: { site: 'Sample lab', tool: 'Density of copper' },
        columns: [{ name: 'Trial', unit: '' }, { name: 'Mass', unit: 'g' }, { name: 'Volume', unit: 'cm³' }, { name: 'Density', unit: 'g/cm³' }],
        rows: [[1, 44.8, 5.0, 8.96], [2, 44.7, 5.1, 8.76], [3, 44.8, 4.9, 9.14], [4, 44.9, 5.0, 8.98], [5, 44.8, 5.2, 8.62], [6, 44.7, 4.9, 9.12]],
        accepted: { column: 'Density', value: 8.96, unit: 'g/cm³' }, suggest: { x: null, y: 'Density' } } },
    { id: 'ramp', title: 'Cart on a ramp', kind: 'Speed vs. time, with a predicted slope',
      blurb: 'A cart rolls down a ramp tilted 5°. A motion sensor recorded its speed every 0.2 s. With no friction, physics predicts an acceleration of 0.854 m/s² (that is 9.8 × sin 5°). The slope of speed vs. time is the acceleration.',
      payload: { v: 1, source: { site: 'Sample lab', tool: 'Cart on a ramp' },
        columns: [{ name: 'Time', unit: 's' }, { name: 'Speed', unit: 'm/s' }],
        rows: [[0.2, 0.17], [0.4, 0.35], [0.6, 0.51], [0.8, 0.69], [1.0, 0.84], [1.2, 1.02], [1.4, 1.17], [1.6, 1.35]],
        accepted: { column: 'slope', value: 0.854, unit: 'm/s²' }, suggest: { x: 'Time', y: 'Speed' } } }
  ];
  var SAMPLE = {}; SAMPLES.forEach(function (s) { SAMPLE[s.id] = s; });
  XL.azSamples = SAMPLES;
  function sampleData(s) {
    var r = fromPayload(s.payload, 'sample'), ds = r.ds;
    ds.sample = s; ds.file = s.id + '-lab-analysis';
    return ds;
  }

  /* ===================== putting the data in the sheet ===================== */
  function putVal(sh, a, v) {
    if (v === null || v === undefined || v === '') { sh.setValue(a, null); return; }
    if (typeof v === 'number') { sh.setValue(a, v); return; }
    var s = String(v).trim();
    if (s[0] !== '=' && s[0] !== "'" && isNumText(s)) sh.set(a, s); else sh.setValue(a, s);
  }
  function setupSheet(sh, ds) {
    var C = ds.headers.length, N = ds.rows.length;
    ds.headers.forEach(function (h, j) { sh.setValue(A(j + 1, 1), h || null); });
    sh.bold('A1:' + A(C, 1));
    ds.rows.forEach(function (row, i) { row.forEach(function (v, j) { putVal(sh, A(j + 1, i + 2), v); }); });
    /* keep the decimals the data came with: 5.0 stays 5.0 */
    for (var j = 0; j < C; j++) {
      var dp = 0, nums = 0;
      ds.rows.forEach(function (r) { var v = r[j]; if (v == null || v === '') return; var t = String(v).trim(); if (typeof v === 'number' || isNumText(t)) { nums++; var m = /\.(\d+)(?:[eE]|$)/.exec(t.replace(/%$/, '')); if (m && !/%$/.test(t)) dp = Math.max(dp, m[1].length); } });
      if (nums && dp && dp <= 6) sh.format(A(j + 1, 2) + ':' + A(j + 1, N + 1), 'fixed:' + dp);
    }
    if (ds.locked) sh.lock('A1:' + A(C, 1));
    if (ds.trialCol) sh.lock(A(ds.trialCol, 2) + ':' + A(ds.trialCol, N + 1));
  }
  /* the data as the sheet holds it now (after typing and fixes), so "Start over" keeps the student's data */
  function captureData(ctx) {
    var ds = ctx.flow.dataset, sh = ctx.sheet, C = ds.headers.length, N = ds.rows.length;
    for (var j = 1; j <= C; j++) ds.headers[j - 1] = String(sh.get(A(j, 1)) == null ? '' : sh.display(A(j, 1)));
    for (var i = 0; i < N; i++) for (j = 1; j <= C; j++) { var v = sh.get(A(j, i + 2)); ds.rows[i][j - 1] = v == null ? null : typeof v === 'number' ? v : R.isError(v) ? v.code : String(v); }
    session.set(SKEY, JSON.stringify({ ds: ds }));
  }

  /* ===================== looking at the data ===================== */
  function decimals(v) { if (typeof v !== 'number' || !isFinite(v)) return 0; var s = String(+v.toPrecision(12)); if (/e/.test(s)) return 0; var p = s.split('.')[1]; return p ? Math.min(6, p.length) : 0; }
  function colNums(sh, c, r1, r2) { var out = []; for (var r = r1; r <= r2; r++) { var v = sh.get(A(c, r)); if (typeof v === 'number') out.push(v); } return out; }
  function colDp(sh, c, r1, r2) { var d = 0; for (var r = r1; r <= r2; r++) { var i = sh.info(A(c, r)); d = Math.max(d, decimals(i.value), i.type === 'number' && i.fmt && i.fmt.type === 'fixed' ? i.fmt.dp : 0); } return d; }
  /* hygiene: what in the number columns is not a plain number */
  function scan(sh, D) {
    var cols = [], issues = [], blanks = [];
    for (var c = 1; c <= D.C; c++) {
      var nums = 0, fixable = 0, text = 0, list = [], bl = [];
      for (var r = 2; r <= D.N + 1; r++) {
        var a = A(c, r), i = sh.info(a);
        if (i.type === 'blank') { bl.push(a); continue; }
        if (i.type === 'number') { nums++; continue; }
        var raw = i.type === 'error' ? i.error : String(i.value), t = raw.trim(), m;
        if (i.type === 'error') list.push({ a: a, kind: 'error', raw: raw });
        else if ((m = UNITRE.exec(t))) { fixable++; list.push({ a: a, kind: 'unit', raw: raw, num: m[1].replace(/,/g, ''), unit: m[2].trim() }); }
        else if (DECCOMMA.test(t)) { fixable++; list.push({ a: a, kind: 'comma', raw: raw, num: t.replace(',', '.') }); }
        else { text++; list.push({ a: a, kind: 'text', raw: raw }); }
      }
      var numeric = nums + fixable > 0 && nums + fixable >= text;
      cols[c] = { numeric: numeric, nums: nums, text: text };
      if (numeric) { issues = issues.concat(list); blanks = blanks.concat(bl); }
    }
    return { cols: cols, issues: issues, blanks: blanks };
  }
  function issueText(it) {
    var q = '“' + esc(it.raw) + '”';
    if (it.kind === 'unit') return 'Cell ' + it.a + ' has ' + q + '. Put the unit in the header and just the number in the cell: click ' + it.a + ' and type ' + esc(it.num) + '.';
    if (it.kind === 'comma') return 'Cell ' + it.a + ' has ' + q + '. Use a decimal point: ' + esc(it.num) + '. (A comma inside a number means thousands, like 1,200.)';
    if (it.kind === 'error') return 'Cell ' + it.a + ' shows ' + esc(it.raw) + ', an error that came with your data. Click ' + it.a + ' and type the number, or press Delete to leave it empty.';
    return 'Cell ' + it.a + ' has ' + q + ', a word in a number column. If that trial did not happen, click ' + it.a + ' and press Delete to leave it empty. Otherwise type the number.';
  }
  function fixAll(sh, D, issues) {
    var addUnit = {};
    sh.batch(function () {
      issues.forEach(function (it) {
        if (it.kind === 'unit' || it.kind === 'comma') sh.setValue(it.a, +it.num); else sh.setValue(it.a, null);
        if (it.kind === 'unit') { var c = R.parseA1(it.a).c; addUnit[c] = addUnit[c] || it.unit; }
      });
      Object.keys(addUnit).forEach(function (c) {
        var h = A(+c, 1), t = sh.get(h) == null ? '' : String(sh.get(h));
        if (!splitHead(t).unit) sh.setValue(h, (t ? t + ' ' : '') + '(' + addUnit[c] + ')');
      });
    });
  }
  function isTrialName(n) { return /^(trial|run|attempt|test|try|reading|sample|#|n|no\.?|number)\s*(#|no\.?|number)?$/i.test(String(n).trim()); }
  function numbered(n) { return /(trial|run|attempt|test|try|#)\s*\d+|\b[tr]\s?\d+\b|\s\d+$/i.test(n); }
  function baseName(n) { return String(n).replace(/(trial|run|attempt|test|try|#)\s*\d+/ig, '').replace(/\b[tr]\s?\d+\b/ig, '').replace(/\s\d+$/, '').replace(/\s+/g, ' ').trim(); }
  /* what each column is: header, name, unit, numbers, a trial-number column, groups of repeated-trial columns */
  function describe(sh, D) {
    var sc = scan(sh, D), cols = [];
    for (var c = 1; c <= D.C; c++) {
      var h = sh.get(A(c, 1)) == null ? '' : String(sh.display(A(c, 1))), hp = splitHead(h), nums = colNums(sh, c, 2, D.N + 1);
      var seq = nums.length === D.N && nums.every(function (v, i) { return v === i + 1; });
      cols[c] = { c: c, head: h || 'Column ' + L(c), name: hp.name || 'column ' + L(c), unit: hp.unit, numeric: sc.cols[c].numeric && nums.length > 0, n: nums.length,
        trial: (isTrialName(hp.name) && sc.cols[c].numeric) || (seq && D.N > 1 && !hp.unit && /trial|run|#|^n$|number/i.test(hp.name || 'trial')) };
    }
    var groups = [], c0 = 1;
    while (c0 <= D.C) {
      var c1 = c0;
      if (cols[c0].numeric && !cols[c0].trial && numbered(cols[c0].name)) {
        while (c1 + 1 <= D.C && cols[c1 + 1].numeric && numbered(cols[c1 + 1].name) && baseName(cols[c1 + 1].name).toLowerCase() === baseName(cols[c0].name).toLowerCase() && cols[c1 + 1].unit === cols[c0].unit) c1++;
        if (c1 > c0) groups.push({ c1: c0, c2: c1 });
      }
      c0 = c1 + 1;
    }
    return { cols: cols, groups: groups };
  }
  function findCol(info, name) {
    if (!name) return null;
    var n = String(name).toLowerCase().trim(), hit = null;
    info.cols.forEach(function (c) { if (c && !hit && (c.name.toLowerCase() === n || c.head.toLowerCase() === n)) hit = c.c; });
    return hit;
  }

  /* ===================== the plan: what the student chose to find ===================== */
  function defaultPlan(ctx) {
    var ds = ctx.flow.dataset, info = describe(ctx.sheet, ctx.data.D), sg = ds.suggest, plan = { x: null, ys: null, acc: 'no' };
    var usable = info.cols.filter(function (c) { return c && c.numeric && !c.trial; });
    if (sg && sg.y.length) {
      var ys = sg.y.map(function (n) { return findCol(info, n); }).filter(function (c) { return c && info.cols[c].numeric; }).sort(function (a, b) { return a - b; });
      if (ys.length && ys[ys.length - 1] - ys[0] === ys.length - 1) plan.ys = ys;
      var xc = findCol(info, sg.x); if (xc && info.cols[xc].numeric && (!plan.ys || plan.ys.indexOf(xc) < 0)) plan.x = xc;
    }
    if (!plan.ys) {
      if (info.groups.length) { var g = info.groups[0]; plan.ys = []; for (var c = g.c1; c <= g.c2; c++) plan.ys.push(c); var xs = usable.filter(function (u) { return u.c < g.c1 || u.c > g.c2; }); plan.x = xs.length ? xs[0].c : null; }
      else if (usable.length >= 2) { plan.x = usable[0].c; plan.ys = [usable[1].c]; }
      else if (usable.length === 1) plan.ys = [usable[0].c];
      else { var any = info.cols.filter(function (c) { return c && c.numeric; }); plan.ys = any.length ? [any[any.length - 1].c] : [1]; }
    }
    if (ds.accepted) {
      if (/^slope$/i.test(ds.accepted.column) && plan.x) plan.acc = 'slope';
      else { var ac = findCol(info, ds.accepted.column); if (ac && plan.ys.length === 1 && plan.ys[0] === ac) plan.acc = 'mean'; else if (ac && info.cols[ac].numeric && plan.ys.length === 1 && !plan.x) { plan.ys = [ac]; plan.acc = 'mean'; } else if (plan.x) plan.acc = 'slope'; }
    }
    return withMode(plan, info);
  }
  function withMode(plan, info) {
    plan.mode = plan.ys.length > 1 ? 'wide' : plan.x ? 'pairs' : 'single';
    var single = plan.mode === 'single', wide = plan.mode === 'wide';
    plan.avg = single || wide; plan.spread = single || wide; plan.rel = !!plan.x; plan.chart = !!plan.x;
    if (plan.acc === 'mean' && wide) plan.acc = 'no';
    if (plan.acc === 'mean' && !single) plan.avg = true;
    if (plan.acc === 'slope' && !plan.x) plan.acc = 'no';
    plan.info = info;
    return plan;
  }

  /* lay the plan out on the sheet: where each result goes, its label and number format */
  function layout(ctx, plan) {
    var sh = ctx.sheet, D = ctx.data.D, info = plan.info, C = D.C, N = D.N, top = 2, bot = N + 1;
    var y0 = info.cols[plan.ys[0]], P = { mode: plan.mode, plan: plan, N: N, top: top, bot: bot, cells: {} };
    P.yName = plan.mode === 'wide' ? (baseName(y0.name) || 'Measurement') : y0.name; P.yUnit = y0.unit;
    if (plan.x) { var xc = info.cols[plan.x]; P.xName = xc.name; P.xUnit = xc.unit; P.xc = plan.x; P.xR = A(plan.x, top) + ':' + A(plan.x, bot); P.dpX = colDp(sh, plan.x, top, bot); }
    var dpY = 0; plan.ys.forEach(function (c) { dpY = Math.max(dpY, colDp(sh, c, top, bot)); }); P.dpY = dpY;
    var dpM = Math.max(1, Math.min(5, dpY + 1));
    var next = C + 2;
    if (plan.mode === 'wide') {
      P.k1 = plan.ys[0]; P.k2 = plan.ys[plan.ys.length - 1];
      P.meanCol = C + 1; P.sdCol = plan.spread ? C + 2 : null;
      P.yRel = A(P.meanCol, top) + ':' + A(P.meanCol, bot);
      next = (plan.spread ? C + 2 : C + 1) + 2;
    } else { P.yc = plan.ys[0]; P.yR = A(P.yc, top) + ':' + A(P.yc, bot); P.yRel = P.yR; }
    P.RL = next; P.RV = next + 1;
    var rows = [], r = 2;
    function add(key, label, fmt) { P.cells[key] = A(P.RV, r); rows.push({ key: key, r: r, label: label, fmt: fmt }); r++; }
    var u = P.yUnit ? ' (' + P.yUnit + ')' : '';
    if (plan.mode !== 'wide' && plan.avg) add('mean', 'Mean' + u, 'fixed:' + dpM);
    if (plan.mode !== 'wide' && plan.spread) add('sd', 'Spread, STDEV.S' + u, 'fixed:' + dpM);
    if (plan.rel) {
      var yv = relY(sh, P), f = fit(yv.x, yv.y), su = slopeUnit(P);
      var sig = f && f.slope ? Math.max(0, Math.min(6, 2 - Math.floor(Math.log(Math.abs(f.slope)) / Math.LN10))) : 3;
      add('slope', 'Slope' + (su ? ' (' + su + ')' : ''), 'fixed:' + sig);
      add('icpt', 'Intercept' + u, 'fixed:' + Math.max(dpM, 1));
      add('rsq', 'R²', 'fixed:4');
    }
    if (plan.acc !== 'no') {
      var au = plan.acc === 'slope' ? slopeUnit(P) : P.yUnit, ds = ctx.flow.dataset;
      if (ds.accepted && ds.accepted.unit) au = ds.accepted.unit;
      P.accUnit = au;
      add('acc', 'Accepted value' + (au ? ' (' + au + ')' : ''), null);
      add('pe', 'Percent error', { type: 'percent', dp: 2 });
    }
    P.rows = rows;
    /* grow the grid to fit, then write the labels */
    sh.rows = Math.max(N + 2, r + 1, 10); sh.cols = P.RV + 1;
    /* headers may have changed since the grid was drawn: fit each data column to its header and numbers again */
    for (var cw = 1; cw <= C; cw++) { var len = String(sh.display(A(cw, 1))).length; for (var rr = 2; rr <= bot; rr++) len = Math.max(len, String(sh.display(A(cw, rr))).length); sh.setColWidth(cw, colW(len)); }
    sh.setColWidth(P.RL, Math.round(Math.min(236, Math.max(120, 24 + 8.4 * rows.reduce(function (m, x) { return Math.max(m, x.label.length); }, 7))))); sh.setColWidth(P.RV, 104); sh.setColWidth(P.RL - 1, 28);
    sh.batch(function () {
      sh.setValue(A(P.RL, 1), 'Results'); sh.bold(A(P.RL, 1));
      rows.forEach(function (x) { sh.setValue(A(P.RL, x.r), x.label); if (x.fmt) sh.format(A(P.RV, x.r), x.fmt); });
      sh.lock(A(P.RL, 1) + ':' + A(P.RL, r - 1));
      if (plan.mode === 'wide') {
        sh.setValue(A(P.meanCol, 1), 'Mean ' + lower(P.yName) + u); sh.setColWidth(P.meanCol, colW(('Mean ' + P.yName + u).length)); sh.format(P.yRel, 'fixed:' + dpM);
        if (P.sdCol) { sh.setValue(A(P.sdCol, 1), 'Spread' + u); sh.setColWidth(P.sdCol, 112); sh.format(A(P.sdCol, top) + ':' + A(P.sdCol, bot), 'fixed:' + dpM); }
        sh.bold(A(P.meanCol, 1) + ':' + A(P.sdCol || P.meanCol, 1)); sh.lock(A(P.meanCol, 1) + ':' + A(P.sdCol || P.meanCol, 1));
      }
    });
    return P;
  }
  function slopeUnit(P) {
    if (!P.yUnit || !P.xUnit) return '';
    return (/\//.test(P.yUnit) ? '(' + P.yUnit + ')' : P.yUnit) + '/' + P.xUnit;
  }
  /* the y values the relationship uses: the y column, or each row's mean of the trials (computed here, not read from the student's cells) */
  function rowMean(sh, P, r) { var v = []; for (var c = P.k1; c <= P.k2; c++) { var x = sh.get(A(c, r)); if (typeof x === 'number') v.push(x); } return v.length ? mean(v) : null; }
  function relY(sh, P) {
    var xs = [], ys = [];
    for (var r = P.top; r <= P.bot; r++) {
      var x = sh.get(A(P.xc, r)), y = P.mode === 'wide' ? rowMean(sh, P, r) : sh.get(A(P.yc, r));
      if (typeof x === 'number' && typeof y === 'number') { xs.push(x); ys.push(y); }
    }
    return { x: xs, y: ys };
  }
  function yVals(sh, P) { return colNums(sh, P.yc, P.top, P.bot); }

  /* ===================== formula coaching, from the student's own data ===================== */
  function parsed(c) { if (!c.info.formula) return null; var p = R.parseFormula(c.text); return p.error ? null : p; }
  function rg(g) { return R.rangeText(g); }
  /* a column range like B2:B7: say what is off about the ranges in the formula */
  function colCoach(p, col, top, bot, label, sh, avoid) {
    var want = A(col, top) + ':' + A(col, bot), inCol = p.ranges.filter(function (g) { return g.c1 === col && g.c2 === col; });
    if (!inCol.length) {
      var multi = p.ranges.filter(function (g) { return g.c1 <= col && g.c2 >= col && g.c2 > g.c1; })[0];
      if (multi) return 'Your range ' + rg(multi) + ' covers more than one column. ' + cap(label) + ' ' + (/s$/.test(label) ? 'are' : 'is') + ' in column ' + L(col) + ' only: use ' + want + '.';
      var other = p.ranges.filter(function (g) { return g.c1 === g.c2 && g.r2 > g.r1 && g.c1 !== avoid; })[0];
      if (other) { var hd = sh.get(A(other.c1, 1)); return 'That range is in column ' + L(other.c1) + (hd ? ' (' + esc(String(hd)) + ')' : '') + '. ' + cap(label) + ' ' + (/s$/.test(label) ? 'are' : 'is') + ' in column ' + L(col) + ': use ' + want + '.'; }
      var refs = p.refs.filter(function (x) { return x.c === col; });
      if (refs.length >= 2) return 'The comma means just those cells. Use a colon for everything from ' + A(col, top) + ' to ' + A(col, bot) + ': ' + want + '.';
      return 'Your formula does not use ' + label + '. Use the range ' + want + '.';
    }
    var g = inCol[0];
    if (g.r1 > top) return 'Your range starts at ' + A(col, g.r1) + ', so it leaves out ' + A(col, top) + (g.r1 - top > 1 ? ' to ' + A(col, g.r1 - 1) : '') + '. Start at ' + A(col, top) + ': ' + want + '.';
    if (g.r2 < bot) return 'Your range stops at ' + A(col, g.r2) + ', but your data goes down to ' + A(col, bot) + '. End at ' + A(col, bot) + ': ' + want + '.';
    return null;
  }
  /* a row range like B2:D2 (repeated trials across a row) */
  function rowCoach(p, P, r) {
    var want = A(P.k1, r) + ':' + A(P.k2, r), g = p.ranges.filter(function (x) { return x.r1 === r && x.r2 === r; })[0];
    if (!g) {
      var down = p.ranges.filter(function (x) { return x.c1 === x.c2 && x.r2 > x.r1; })[0];
      if (down) return 'That range runs down column ' + L(down.c1) + ', across different ' + lower(P.xName ? P.xName + ' values' : 'rows') + '. Each row is one condition, so go across the row: ' + want + '.';
      var refs = p.refs.filter(function (x) { return x.r === r; });
      if (refs.length >= 2) return 'The comma means just those cells. Use a colon for everything from ' + A(P.k1, r) + ' to ' + A(P.k2, r) + ': ' + want + '.';
      return 'Use the trials in row ' + r + ': ' + want + '.';
    }
    if (g.c1 > P.k1) return 'Your range starts at ' + A(g.c1, r) + ', so it leaves out ' + A(P.k1, r) + '. Use all the trials: ' + want + '.';
    if (g.c2 < P.k2) return 'Your range stops at ' + A(g.c2, r) + ', so it leaves out ' + A(P.k2, r) + '. Use all the trials: ' + want + '.';
    if (g.c1 < P.k1 || g.c2 > P.k2) return 'Your range ' + rg(g) + ' runs past the trials. Use just ' + want + '.';
    return null;
  }
  /* after a demo: say whose turn it is, without wiping the message from the step before */
  function yourTurn(cx, text) {
    var fb = cx.run.fb, prev = fb.hidden ? '' : fb.innerHTML, k = /xl-fb-(\w+)/.exec(fb.className);
    if (/Your turn/.test(prev)) return;
    cx.run.feedback(prev ? prev + ' <span class="xl-az-turn">' + text + '</span>' : text, prev && k ? k[1] : 'info');
  }
  function usesCells(p) { return p && (p.refs.length || p.ranges.length); }
  /* the test every result formula passes: it uses cells, and if it uses a range, the range is the whole data
     (a range that leaves out a trial can match the right number by coincidence) */
  function cellsTest(coach) { return function (cc) { var p = parsed(cc); if (!usesCells(p)) return TYPED; return p.ranges.length ? coach(p, cc) || true : true; }; }
  var TYPED = 'Use the cells, not the numbers, so the answer updates when your data changes.';

  /* ===================== plain words about the results ===================== */
  function show(sh, a) { return sh.display(a); }
  function fmtAbs(sh, a) { var v = sh.get(a), i = sh.info(a); return typeof v === 'number' ? R.formatValue(Math.abs(v), i.fmt) : sh.display(a); }
  function withUnit(s, u) { return u ? s + ' ' + u : s; }
  function pct1(v) { return (v < 1 ? (Math.round(v * 10) / 10).toFixed(1) : (Math.round(v * 10) / 10).toFixed(1)) + '%'; }
  function consistency(sd, m) {
    if (!isFinite(sd) || !isFinite(m) || !m) return null;
    var cv = Math.abs(sd / m) * 100;
    return { cv: cv, text: pct1(cv), word: cv < 1 ? 'very consistent' : cv < 5 ? 'fairly consistent' : cv < 10 ? 'somewhat spread out' : 'quite spread out' };
  }
  XL.azConsistency = consistency;
  function rsqWords(v) {
    return v >= 0.99 ? 'Your points sit very close to a straight line.' : v >= 0.95 ? 'Your points sit close to a straight line.' :
      v >= 0.8 ? 'Your points follow a clear straight-line trend, with some scatter.' : v >= 0.5 ? 'Your points follow a weak straight-line trend, with a lot of scatter.' :
      'Your points barely follow a straight line. The relationship may be curved, or there may be no relationship at all.';
  }

  /* ===================== step kinds for this track ===================== */
  function chartBtn(ctx, on) { var b = ctx.ui && ctx.ui.parts().buttons.chart; if (b) b.hidden = !(on || ctx.data.chartOn); }
  function region(D) { return 'A2:' + A(D.C, D.N + 1); }
  function inData(D, a) { var p = R.parseA1(a); return p.r >= 2 && p.r <= D.N + 1 && p.c >= 1 && p.c <= D.C; }

  /* azdata: type the numbers into a labeled empty table */
  KINDS.azdata = {
    start: function (s) {
      var D = this.ctx.data.D; this.glow(dataCols(this.ctx), 'yourturn');
      var self = this;
      this.addBtn('I typed all my numbers', function () { KINDS.azdata.done.call(self, s, true); }, 'xl-next primary');
      KINDS.azdata.point.call(this, s);
    },
    first: function () { var D = this.ctx.data.D, ds = this.ctx.flow.dataset, sh = this.sheet; for (var r = 2; r <= D.N + 1; r++) for (var c = 1; c <= D.C; c++) { if (c === ds.trialCol) continue; if (sh.info(A(c, r)).type === 'blank') return A(c, r); } return null; },
    point: function (s) {
      var f = KINDS.azdata.first.call(this);
      if (f) { this.ui.scrollTo(f); this.coach.pointer('cell:' + f, this.ui.active() === f ? (this.ui.isEditing() ? 'Press Enter' : 'Type here') : XL.words('Click here')); }
      else this.coach.clearPointer();
    },
    done: function (s, pressed) {
      var sh = this.sheet, D = this.ctx.data.D, sc = scan(sh, D), n = 0, f = KINDS.azdata.first.call(this);
      sc.cols.forEach(function (c) { if (c) n += c.nums; });
      var ds = this.ctx.flow.dataset; if (ds.trialCol) n -= colNums(sh, ds.trialCol, 2, D.N + 1).length;
      if (!f) { this.success('Every cell has a number. Your table is in.'); return; }
      if (!pressed) return;
      if (n < 2) { this.feedback('Type at least two numbers first. ' + f + ' is the next empty cell.', 'info'); this.ui.select(f); return; }
      this.success('Your table is in. The empty cells stay empty.');
    },
    on: function (s, ev) {
      if (ev.type === 'commit' && ev.changed && inData(this.ctx.data.D, ev.addr)) {
        var i = this.sheet.info(ev.addr), t = i.type === 'text' ? String(i.value).trim() : '', m;
        if (t && (m = UNITRE.exec(t))) this.feedback('Type just the number, ' + esc(m[1]) + '. The unit goes in the header: it already says what the column is.', 'bad');
        else if (t && DECCOMMA.test(t)) this.feedback('Use a decimal point: ' + esc(t.replace(',', '.')) + '. A comma inside a number means thousands.', 'bad');
        else if (t) this.feedback(ev.addr + ' holds a word. Type a number, or press Delete to leave the cell empty.', 'bad');
        else if (i.type === 'number') this.feedback(ev.addr + ' holds ' + this.sheet.display(ev.addr) + '. Enter moved you down to the next trial.', 'good');
        if (i.type === 'number') { KINDS.azdata.done.call(this, s, false); if (this.step() !== s) return; }
      }
      if (ev.type === 'select' || ev.type === 'commit' || ev.type === 'editstart' || ev.type === 'input' || ev.type === 'clear' || ev.type === 'undo' || ev.type === 'paste') KINDS.azdata.point.call(this, s);
    }
  };
  function dataCols(ctx) { var D = ctx.data.D, ds = ctx.flow.dataset, c1 = ds.trialCol === 1 ? 2 : 1; return A(c1, 2) + ':' + A(D.C, D.N + 1); }

  /* azcheck: every cell in a number column holds just a number */
  KINDS.azcheck = {
    start: function (s) { KINDS.azcheck.draw.call(this, s); },
    draw: function (s) {
      var self = this, D = this.ctx.data.D, sc = scan(this.sheet, D);
      this.unglow();
      if (!sc.issues.length) { this.success(s.okText(sc)); return; }
      sc.issues.forEach(function (it) { self.glow(it.a, 'yourturn'); });
      var box = this.extra.querySelector('.xl-az-issues') || this.extra.appendChild(el('div', 'xl-az-issues'));
      var show = sc.issues.slice(0, 6);
      box.innerHTML = '<p class="xl-az-ih">' + plural(sc.issues.length, 'cell needs', 'cells need') + ' a fix:</p><ul>' + show.map(function (it) { return '<li><button type="button" class="xl-az-go" data-a="' + it.a + '">' + it.a + '</button> ' + issueText(it) + '</li>'; }).join('') + '</ul>' +
        (sc.issues.length > show.length ? '<p class="xl-az-more">And ' + plural(sc.issues.length - show.length, 'more cell') + ' like these.</p>' : '');
      box.querySelectorAll('.xl-az-go').forEach(function (b) { b.addEventListener('click', function () { self.ui.select(b.getAttribute('data-a')); self.coach.pointer('cell:' + b.getAttribute('data-a'), XL.words('Fix this one')); }); });
      if (!this.acts.querySelector('.xl-az-fix')) this.addBtn('Fix them all for me', function () { fixAll(self.sheet, D, scan(self.sheet, D).issues); self.ui.render(); KINDS.azcheck.draw.call(self, s); }, 'xl-az-fix');
      var first = sc.issues[0].a; this.ui.scrollTo(first); this.coach.pointer('cell:' + first, XL.words('Fix this one'));
    },
    on: function (s, ev) {
      if (ev.type === 'commit' || ev.type === 'clear' || ev.type === 'paste' || ev.type === 'undo') {
        var before = this.extra.querySelectorAll('.xl-az-go').length;
        KINDS.azcheck.draw.call(this, s);
        if (this.step() === s && ev.type === 'commit' && ev.changed) this.feedback('Better. ' + (this.extra.querySelectorAll('.xl-az-go').length < before ? 'One down.' : 'That cell still needs a fix.'), 'info');
      }
    }
  };

  /* azhead: row 1 says what each column is, with its unit */
  KINDS.azhead = {
    start: function (s) {
      var self = this, ds = this.ctx.flow.dataset, D = this.ctx.data.D;
      this.glow('A1:' + A(D.C, 1), ds.locked ? 'highlight' : 'yourturn');
      this.addBtn(ds.locked ? 'Next' : 'My headers are right', function () { KINDS.azhead.check.call(self, s); }, 'xl-next primary');
      KINDS.azhead.draw.call(this, s);
    },
    draw: function (s) {
      var sh = this.sheet, D = this.ctx.data.D, info = describe(sh, D), box = this.extra.querySelector('.xl-az-heads') || this.extra.appendChild(el('ul', 'xl-az-heads'));
      box.innerHTML = info.cols.filter(Boolean).map(function (c) {
        var h = sh.get(A(c.c, 1));
        return '<li><b>' + A(c.c, 1) + '</b> ' + (h == null || h === '' ? '<span class="xl-az-miss">empty</span>' : esc(String(h))) + (c.trial ? ' <small>(trial numbers)</small>' : !c.numeric ? ' <small>(words)</small>' : !c.unit ? ' <small class="xl-az-miss">no unit</small>' : '') + '</li>';
      }).join('');
      var empty = null; for (var c = 1; c <= D.C; c++) if (sh.get(A(c, 1)) == null || sh.get(A(c, 1)) === '') { empty = A(c, 1); break; }
      if (empty) { this.ui.scrollTo(empty); this.coach.pointer('cell:' + empty, XL.words('Click here')); } else this.coach.clearPointer();
    },
    check: function (s) {
      var sh = this.sheet, D = this.ctx.data.D, info = describe(sh, D), seen = {}, dup = null, empty = null, noUnit = [];
      info.cols.forEach(function (c) {
        if (!c) return; var h = sh.get(A(c.c, 1));
        if (h == null || String(h).trim() === '') { empty = empty || A(c.c, 1); return; }
        var k = String(h).trim().toLowerCase(); if (seen[k]) dup = dup || [seen[k], A(c.c, 1), String(h)]; seen[k] = A(c.c, 1);
        if (c.numeric && !c.trial && !c.unit) noUnit.push(A(c.c, 1));
      });
      if (empty) { this.feedback(empty + ' is empty. Click it and type what column ' + empty.replace(/\d+$/, '') + ' is, with its unit in parentheses, like Time (s).', 'bad'); this.ui.select(empty); this.coach.pointer('cell:' + empty, XL.words('Click here')); return; }
      if (dup) { this.feedback(dup[0] + ' and ' + dup[1] + ' are both called “' + esc(dup[2]) + '”. Give each column its own name, like Trial 1 (s) and Trial 2 (s).', 'bad'); this.ui.select(dup[1]); return; }
      if (noUnit.length && !this.state.unitWarned && !this.ctx.flow.dataset.locked) {
        this.state.unitWarned = true;
        this.feedback(noUnit.join(', ') + (noUnit.length > 1 ? ' have' : ' has') + ' no unit. Add it in parentheses, like Time (s): click the cell and type the whole header again. If a column truly has no unit (a count, or pH), press the button again.', 'info');
        this.ui.select(noUnit[0]); return;
      }
      this.success(this.text(s.ok));
    },
    on: function (s, ev) { if (ev.type === 'commit' || ev.type === 'undo' || ev.type === 'clear') { this.state.unitWarned = false; KINDS.azhead.draw.call(this, s); } }
  };

  /* azplan: the student picks what they measured, what they changed, the accepted value and the steps */
  var pid = 0;
  KINDS.azplan = {
    start: function (s) {
      var self = this, ctx = this.ctx, plan = ctx.data.plan || defaultPlan(ctx), info = describe(ctx.sheet, ctx.data.D), id = 'azp' + (++pid);
      plan = withKeep(plan, info); ctx.data.plan = plan;
      var nums = info.cols.filter(function (c) { return c && c.numeric; });
      var box = el('div', 'xl-az-plan');
      function opt(v, t, on) { return '<option value="' + v + '"' + (on ? ' selected' : '') + '>' + esc(t) + '</option>'; }
      var yo = '', yv = plan.ys.length > 1 ? 'g:' + plan.ys[0] + '-' + plan.ys[plan.ys.length - 1] : 'c:' + plan.ys[0];
      info.groups.forEach(function (g) { var v = 'g:' + g.c1 + '-' + g.c2; yo += opt(v, 'Columns ' + L(g.c1) + ' to ' + L(g.c2) + ' together: repeated trials of ' + (baseName(info.cols[g.c1].name) || 'one measurement'), v === yv); });
      nums.forEach(function (c) { yo += opt('c:' + c.c, 'Column ' + L(c.c) + ': ' + c.head + (c.trial ? ' (trial numbers)' : ''), 'c:' + c.c === yv); });
      if (yv.indexOf('g:') === 0 && !info.groups.some(function (g) { return 'g:' + g.c1 + '-' + g.c2 === yv; })) yo = opt(yv, 'Columns ' + L(plan.ys[0]) + ' to ' + L(plan.ys[plan.ys.length - 1]) + ' together: repeated trials', true) + yo;
      var xo = opt('', 'Nothing: I measured the same thing again and again', !plan.x);
      nums.forEach(function (c) { xo += opt('c:' + c.c, 'Column ' + L(c.c) + ': ' + c.head + (c.trial ? ' (trial numbers)' : ''), plan.x === c.c); });
      box.innerHTML =
        '<div class="xl-az-q"><label for="' + id + '-y">1. What did you measure? <small>Your results: the y.</small></label><select id="' + id + '-y" data-autofocus="1">' + yo + '</select></div>' +
        '<div class="xl-az-q"><label for="' + id + '-x">2. What did you change on purpose? <small>The x, also called the independent variable.</small></label><select id="' + id + '-x">' + xo + '</select></div>' +
        '<fieldset class="xl-az-q xl-az-acc"><legend>3. Is there an accepted value to compare with?</legend><div class="xl-az-radios"></div></fieldset>' +
        '<fieldset class="xl-az-q xl-az-do"><legend>4. What to find <small>Leave these checked unless your teacher says otherwise.</small></legend><div class="xl-az-checks"></div></fieldset>';
      this.extra.appendChild(box);
      var ySel = box.querySelector('#' + id + '-y'), xSel = box.querySelector('#' + id + '-x');
      function pick() {
        var yv2 = ySel.value, m = /^g:(\d+)-(\d+)$/.exec(yv2), ys = [];
        if (m) for (var c = +m[1]; c <= +m[2]; c++) ys.push(c); else ys = [+yv2.slice(2)];
        var x = xSel.value ? +xSel.value.slice(2) : null;
        var keepAcc = plan.acc;
        plan = withMode({ x: x, ys: ys, acc: keepAcc }, info); ctx.data.plan = plan;
        draw(true);
      }
      function draw(changed) {
        var mode = plan.mode, ds = ctx.flow.dataset, rad = box.querySelector('.xl-az-radios'), chk = box.querySelector('.xl-az-checks');
        var accs = [['no', 'No']];
        if (mode !== 'wide') accs.push(['mean', 'Yes: compare it with my mean']);
        if (plan.x) accs.push(['slope', 'Yes: compare it with my slope']);
        if (!accs.some(function (a) { return a[0] === plan.acc; })) plan.acc = 'no';
        rad.innerHTML = accs.map(function (a) { return '<label class="xl-az-opt"><input type="radio" name="' + id + '-acc" value="' + a[0] + '"' + (plan.acc === a[0] ? ' checked' : '') + '> ' + a[1] + '</label>'; }).join('') +
          (ds.accepted ? '<p class="xl-az-hintp">' + esc(ds.source.site || 'The lab') + ' gave an accepted value: ' + esc(fmtNum(ds.accepted.value)) + (ds.accepted.unit ? ' ' + esc(ds.accepted.unit) : '') + '.</p>' : '');
        var items = [];
        var yN = info.cols[plan.ys[0]];
        if (mode === 'wide') {
          items.push(['avg', 'The mean of each row’s trials, with AVERAGE, filled down']);
          items.push(['spread', 'How consistent each row’s trials are, with STDEV.S']);
        } else {
          items.push(['avg', 'The mean of ' + (yN ? lower(yN.name) : 'your trials') + ', with AVERAGE']);
          items.push(['spread', 'How consistent ' + (mode === 'single' ? 'your trials are' : 'that column is') + ', with STDEV.S']);
        }
        if (plan.x) { items.push(['rel', 'The relationship: SLOPE, INTERCEPT and R²']); items.push(['chart', 'A scatter chart with a trendline']); }
        chk.innerHTML = items.map(function (it) { return '<label class="xl-az-opt"><input type="checkbox" value="' + it[0] + '"' + (plan[it[0]] ? ' checked' : '') + '> ' + it[1] + '</label>'; }).join('') +
          (!plan.x ? '<p class="xl-az-hintp">To find a slope and make a scatter chart, pick what you changed in question 2.</p>' : '');
        rad.querySelectorAll('input').forEach(function (r) { r.addEventListener('change', function () { plan.acc = r.value; if (r.value === 'mean') plan.avg = true; if (r.value === 'slope') plan.rel = true; draw(true); }); });
        chk.querySelectorAll('input').forEach(function (k) { k.addEventListener('change', function () { plan[k.value] = k.checked; if (!plan.avg && plan.acc === 'mean') plan.acc = 'no'; if (!plan.rel && plan.acc === 'slope') plan.acc = 'no'; draw(true); }); });
        if (changed) self.feedback('', '');
      }
      ySel.addEventListener('change', pick); xSel.addEventListener('change', pick);
      draw();
      this.addBtn('Start my analysis', function () { KINDS.azplan.go.call(self, s); }, 'xl-next primary');
    },
    go: function (s) {
      var ctx = this.ctx, plan = ctx.data.plan, sh = this.sheet, D = ctx.data.D, info = plan.info, why = null;
      var yc = plan.ys, top = 2, bot = D.N + 1;
      if (plan.x && yc.indexOf(plan.x) >= 0) why = 'What you changed and what you measured have to be different columns. Pick a different column in question 2, or Nothing.';
      else if (!plan.avg && !plan.spread && !plan.rel && !plan.chart && plan.acc === 'no') why = 'Check at least one thing to find in question 4.';
      else if (plan.mode !== 'wide' && (plan.avg || plan.spread) && colNums(sh, yc[0], top, bot).length < (plan.spread ? 2 : 1)) why = 'Column ' + L(yc[0]) + ' needs at least ' + (plan.spread ? 'two numbers to find a spread' : 'one number') + '.';
      else if (plan.x && (plan.rel || plan.chart)) {
        var P0 = { mode: plan.mode, top: top, bot: bot, xc: plan.x, yc: yc[0], k1: yc[0], k2: yc[yc.length - 1] }, v = relY(sh, P0), dx = {};
        v.x.forEach(function (x) { dx[x] = 1; });
        if (plan.mode === 'wide') { for (var r = top; r <= bot; r++) if (rowMean(sh, P0, r) === null) { why = 'Row ' + r + ' has no trial numbers, so it has no mean, and the slope cannot be found. Fill in that row, or uncheck the relationship and the chart.'; break; } }
        if (!why && v.x.length < 2) why = 'To find a slope you need at least two rows with numbers in both columns.';
        else if (!why && Object.keys(dx).length < 2) why = 'Every row has the same ' + lower(info.cols[plan.x].name) + ', so there is no slope to find. Pick what you changed in question 2.';
      }
      if (why) { this.feedback(why, 'bad'); return; }
      if (plan.mode === 'wide' && plan.spread && plan.ys.length < 2) plan.spread = false;
      var P = layout(ctx, plan); ctx.data.P = P;
      this.mount(true);
      ctx.flow.steps = ctx.flow.steps.slice(0, this.i + 1).concat(analysisSteps(ctx, P));
      chartBtn(ctx, false);
      var list = [];
      if (plan.mode === 'wide' && plan.avg) list.push('each row’s mean');
      else if (plan.avg) list.push('the mean');
      if (plan.spread) list.push('the spread');
      if (plan.rel) list.push('the slope, intercept and R²');
      if (plan.chart) list.push('a scatter chart');
      if (plan.acc !== 'no') list.push('the percent error');
      this.success('Your plan: ' + joinList(list) + '. Your results go in the Results column' + (plan.mode === 'wide' ? ' and the new columns next to your data' : '') + '.');
    }
  };
  function withKeep(plan, info) { plan.info = info; return plan; }
  function joinList(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function fmtNum(v) { return String(+(+v).toPrecision(10)); }

  /* azwatch: the payoff. Change one trial for the student, watch the results update, then put the real number back. */
  KINDS.azwatch = {
    start: function (s) {
      var self = this;
      this.addBtn('Watch again', function () { KINDS.azwatch.play.call(self, s); }, 'xl-again');
      this.addBtn('Next', function () { self.advance(); }, 'xl-next primary');
      this.watchT = setTimeout(function () { KINDS.azwatch.play.call(self, s); }, Coach.reduced() ? 0 : 700);
    },
    play: function (s) {
      var self = this, sh = this.sheet, w = s.pick(this.ctx);
      if (!w || this.coach.busy) return;
      sh.setValue(w.cell, w.from); this.ui.render();
      var before = s.show.map(function (a) { return show(sh, a); });
      this.coach.demo([{ click: w.cell, say: 'Click ' + w.cell }, { type: w.toText, say: 'Type ' + w.toText }, { enter: true, say: 'Press Enter' }]).then(function () {
        if (self.dead || self.step() !== s) return;
        var after = s.show.map(function (a) { return show(sh, a); });
        s.show.forEach(function (a) { self.ui.flash(a, 'good'); });
        self.ui.scrollTo(s.show[0]); self.coach.pointer('cell:' + s.show[0], 'It updated');
        var res = self.extra.querySelector('.xl-watchres') || self.extra.appendChild(el('p', 'xl-watchres'));
        res.setAttribute('role', 'status');
        var parts = s.show.map(function (a, i) { return s.names[i] + ' went from ' + before[i] + ' to ' + after[i]; });
        res.innerHTML = '<b>Watch:</b> ' + w.cell + ' changed from ' + esc(w.fromText) + ' to ' + esc(w.toText) + ', and ' + joinList(parts) + '. You did not retype a formula.';
        var back = function () {
          if (self.dead || self.step() !== s) return;
          sh.setValue(w.cell, w.from); self.ui.render();
          res.innerHTML += ' Then ' + w.cell + ' went back to your real number, ' + esc(w.fromText) + ', and the results followed it back.';
          self.refocus();
        };
        if (Coach.reduced()) back(); else self.watchT = setTimeout(back, 1600);
      });
    }
  };

  /* ===================== the generated analysis steps ===================== */
  function analysisSteps(ctx, P) {
    var plan = P.plan, steps = [], sh = function () { return ctx.sheet; }, ds = ctx.flow.dataset, c = P.cells, yU = P.yUnit;
    var yLabel = plan.mode === 'single' ? 'your trials' : lower(P.yName) + ' values';
    function wrapEnter(s, onChart) { var e = s.enter; s.enter = function (cx) { chartBtn(cx, onChart); if (e) e.call(s, cx); }; return s; }

    /* ---- AVERAGE ---- */
    if (plan.mode === 'wide' && plan.avg) {
      var mc = P.meanCol, r2 = P.top, rowR = A(P.k1, r2) + ':' + A(P.k2, r2), mCell = A(mc, r2);
      steps.push({ kind: 'type', cell: mCell, say: 'Each row is one ' + (P.xName ? lower(P.xName) : 'condition') + ', with its trials across the row. Watch: the mean of row 2’s trials is <b>=AVERAGE(' + rowR + ')</b>. Then your turn: click <b>' + mCell + '</b> and type the same formula.',
        demo: [{ click: mCell, say: 'Click ' + mCell }, { type: '=AVERAGE(' + rowR + ')', say: 'Type =AVERAGE(' + rowR + ')' }, { enter: true, say: 'Press Enter' }], demoArea: mCell,
        afterDemo: function (cx) { cx.sheet.setValue(mCell, null); cx.ui.render(); cx.ui.select(mCell); yourTurn(cx, 'Your turn: click ' + mCell + ' and type =AVERAGE(' + rowR + '), then press Enter.'); },
        expect: function (cx) { var m = rowMean(cx.sheet, P, r2); return { value: m === null ? R.errors['#DIV/0!'] : m }; },
        wrong: [
          { when: function (cc) { var p = parsed(cc); return !!p && !near(cc.value, rowMean(cc.sheet, P, r2)) && !!rowCoach(p, P, r2); }, msg: function (cc) { return rowCoach(parsed(cc), P, r2); } },
          { when: function (cc) { var p = parsed(cc), v = []; for (var k = P.k1; k <= P.k2; k++) { var x = cc.sheet.get(A(k, r2)); if (typeof x === 'number') v.push(x); } return !!p && v.length && near(cc.value, v.reduce(function (a, b) { return a + b; }, 0)) && v.length > 1; }, msg: 'That adds the trials up. For the mean, use AVERAGE: =AVERAGE(' + rowR + ').' }
        ],
        test: cellsTest(function (p) { return rowCoach(p, P, r2); }),
        ok: function (cx) { return mCell + ' shows ' + withUnit(show(cx.sheet, mCell), yU) + ', the mean of row 2’s trials.'; } });
      if (P.N > 1) {
        var full = A(mc, P.top) + ':' + A(mc, P.bot);
        steps.push({ kind: 'fill', src: mCell, range: full, say: 'One formula, every row. Click <b>' + mCell + '</b>, then press <b>Fill down</b>. The formula copies down, and each copy averages its own row.',
          targets: function (cx) { return [{ range: full, value: function (s2, a) { var m = rowMean(s2, P, R.parseA1(a).r); return m === null ? R.errors['#DIV/0!'] : m; } }]; },
          callouts: [{ at: 'btn:fill', title: 'Fill down', text: 'Copies the formula in the selected cell into the cells below it, all the way down your data.' }],
          bad: function (res) { return XL.friendly(res) + ' Fix ' + mCell + ', then fill down again.'; },
          ok: function (cx) { return 'Every row has its mean now, in ' + full + '. Click ' + A(mc, P.bot) + ': its formula is =AVERAGE(' + A(P.k1, P.bot) + ':' + A(P.k2, P.bot) + '). The row number moved with it.' + emptyRows(cx, mc); } });
      }
      steps.push(watchStep(P, [mCell], ['the mean in ' + mCell], function (cx) { return firstNum(cx.sheet, P.k1, P.k2, r2, r2); }, 'Watch: the formula keeps working when a number changes.'));
    } else if (plan.avg) {
      var yR = P.yR, me = c.mean;
      steps.push({ kind: 'type', cell: me, say: 'Your ' + lower(P.yName) + ' trials are in ' + yR + '. Watch: the mean is <b>=AVERAGE(' + yR + ')</b>. Then your turn: click <b>' + me + '</b> and type the same formula.',
        demo: [{ click: me, say: 'Click ' + me }, { type: '=AVERAGE(' + yR + ')', say: 'Type =AVERAGE(' + yR + ')' }, { enter: true, say: 'Press Enter' }], demoArea: me,
        afterDemo: function (cx) { cx.sheet.setValue(me, null); cx.ui.render(); cx.ui.select(me); yourTurn(cx, 'Your turn: click ' + me + ' and type =AVERAGE(' + yR + '), then press Enter.'); },
        expect: function (cx) { return { value: mean(yVals(cx.sheet, P)) }; },
        wrong: avgWrongs(P, 'AVERAGE'),
        test: cellsTest(function (p, cc) { return colCoach(p, P.yc, P.top, P.bot, 'your ' + lower(P.yName) + ' trials', cc.sheet); }),
        ok: function (cx) { return me + ' shows ' + withUnit(show(cx.sheet, me), yU) + ', the mean of your ' + plural(yVals(cx.sheet, P).length, 'trial') + '.' + headNote(ctx, me); } });
      steps.push(watchStep(P, [me], ['the mean'], function (cx) { return firstNum(cx.sheet, P.yc, P.yc, P.top, P.bot); }, 'Watch: the formula keeps working when a number changes.'));
    }

    /* ---- STDEV.S ---- */
    if (plan.mode === 'wide' && plan.spread && P.sdCol) {
      var sc = P.sdCol, sCell = A(sc, P.top), rowR2 = A(P.k1, P.top) + ':' + A(P.k2, P.top), fullS = A(sc, P.top) + ':' + A(sc, P.bot);
      var rowSd = function (s2, r) { var v = []; for (var k = P.k1; k <= P.k2; k++) { var x = s2.get(A(k, r)); if (typeof x === 'number') v.push(x); } return v.length < 2 ? R.errors['#DIV/0!'] : sdS(v); };
      steps.push({ kind: 'type', cell: sCell, say: 'How consistent are each row’s trials? In <b>' + sCell + '</b>, type <b>=STDEV.S(' + rowR2 + ')</b>, the standard deviation of the trials. Same range, new name.',
        expect: function (cx) { return { value: rowSd(cx.sheet, P.top) }; },
        wrong: [
          { when: function (cc) { var v = []; for (var k = P.k1; k <= P.k2; k++) { var x = cc.sheet.get(A(k, P.top)); if (typeof x === 'number') v.push(x); } return v.length > 1 && near(cc.value, sdP(v)) && !near(sdP(v), sdS(v)); }, msg: 'That is STDEV.P, the spread of a whole population. For a few lab trials, use STDEV.S (S for sample): =STDEV.S(' + rowR2 + ').' },
          { when: function (cc) { var p = parsed(cc), t = rowSd(cc.sheet, P.top); return !!p && !near(cc.value, t) && !!rowCoach(p, P, P.top); }, msg: function (cc) { return rowCoach(parsed(cc), P, P.top); } }
        ],
        test: cellsTest(function (p) { return rowCoach(p, P, P.top); }),
        ok: function (cx) { return sCell + ' shows ' + withUnit(show(cx.sheet, sCell), yU) + ': a typical trial in row 2 is about that far from the row’s mean.'; } });
      if (P.N > 1) steps.push({ kind: 'fill', src: sCell, range: fullS, say: 'Click <b>' + sCell + '</b> and press <b>Fill down</b>.',
        targets: function () { return [{ range: fullS, value: function (s2, a) { return rowSd(s2, R.parseA1(a).r); } }]; },
        bad: function (res) { return XL.friendly(res) + ' Fix ' + sCell + ', then fill down again.'; },
        ok: function (cx) { return spreadRows(cx, P, sc); } });
    } else if (plan.spread && plan.mode !== 'wide') {
      var sd = c.sd, yR3 = P.yR;
      steps.push({ kind: 'type', cell: sd, say: 'How consistent are your trials? In <b>' + sd + '</b>, type <b>=STDEV.S(' + yR3 + ')</b>, the standard deviation of a sample. Same range as AVERAGE, new name.',
        expect: function (cx) { return { value: sdS(yVals(cx.sheet, P)) }; },
        wrong: [{ when: function (cc) { var v = yVals(cc.sheet, P); return v.length > 1 && near(cc.value, sdP(v)) && !near(sdP(v), sdS(v)); }, msg: 'That is STDEV.P, the spread of a whole population. For a few lab trials, use STDEV.S (S for sample): =STDEV.S(' + yR3 + ').' }].concat(avgWrongs(P, 'STDEV.S')),
        test: cellsTest(function (p, cc) { return colCoach(p, P.yc, P.top, P.bot, 'your ' + lower(P.yName) + ' trials', cc.sheet); }),
        ok: function (cx) {
          var s2 = cx.sheet, v = yVals(s2, P), k = consistency(sdS(v), mean(v));
          return sd + ' shows ' + withUnit(show(s2, sd), yU) + ': a typical trial is about ' + withUnit(show(s2, sd), yU) + ' from the mean.' + (k ? ' That is ' + k.text + ' of the mean, so your trials are ' + k.word + '.' + (k.cv >= 10 ? ' Look for a trial that went wrong, or ask your teacher how much spread is normal for this lab.' : '') : '');
        } });
    }

    /* ---- SLOPE, INTERCEPT, RSQ ---- */
    if (plan.rel) {
      var yRel = P.yRel, xR = P.xR, sl = c.slope, ic = c.icpt, rq = c.rsq;
      var F = function (cx) { var v = relY(cx.sheet, P); return fit(v.x, v.y); };
      var yWhat = plan.mode === 'wide' ? 'the means' : lower(P.yName);
      var relTest = function (fn) { return cellsTest(function (p) { var m = rangesOff(p, P, plan.mode === 'wide' ? P.meanCol : P.yc); return m ? m + ' Type =' + fn + '(' + yRel + ',' + xR + ').' : null; }); };
      steps.push({ kind: 'type', cell: sl, say: (plan.mode === 'wide' ? 'Now the relationship between ' + lower(P.xName) + ' and the means. ' : 'Now the relationship between ' + lower(P.xName) + ' and ' + lower(P.yName) + '. ') + 'Watch: <b>=SLOPE(' + yRel + ',' + xR + ')</b> finds how fast ' + yWhat + ' change' + (plan.mode === 'wide' ? '' : 's') + ' as ' + lower(P.xName) + ' changes. SLOPE takes the y values (what you measured) first, then the x values. Then your turn: type it in <b>' + sl + '</b>.',
        demo: [{ click: sl, say: 'Click ' + sl }, { type: '=SLOPE(' + yRel + ',' + xR + ')', say: 'Type =SLOPE(' + yRel + ',' + xR + ')' }, { enter: true, say: 'Press Enter' }], demoArea: sl,
        afterDemo: function (cx) { cx.sheet.setValue(sl, null); cx.ui.render(); cx.ui.select(sl); yourTurn(cx, 'Your turn: click ' + sl + ' and type =SLOPE(' + yRel + ',' + xR + '), then press Enter.'); },
        expect: function (cx) { return { value: F(cx).slope }; },
        wrong: relWrongs(P, 'SLOPE', function (f) { return f.slope; }),
        test: relTest('SLOPE'),
        ok: function (cx) {
          var s2 = cx.sheet, v = s2.get(sl), su = slopeUnit(P);
          return sl + ' shows ' + withUnit(show(s2, sl), su) + '. For every 1' + (P.xUnit ? ' ' + P.xUnit : '') + ' increase in ' + lower(P.xName) + ', ' + yWhat + ' ' + (v >= 0 ? 'go' + (plan.mode === 'wide' ? '' : 'es') + ' up' : 'go' + (plan.mode === 'wide' ? '' : 'es') + ' down') + ' by about ' + withUnit(fmtAbs(s2, sl), P.yUnit) + '.' +
            (su ? ' A slope has units: ' + su + ', or ' + P.yUnit + ' per ' + P.xUnit + '.' : ' A slope has units: the y unit per the x unit. Add units to your headers to see them here.');
        } });
      steps.push({ kind: 'type', cell: ic, say: 'Where does your line cross the y axis? In <b>' + ic + '</b>, type <b>=INTERCEPT(' + yRel + ',' + xR + ')</b>. Same two ranges, same order.',
        expect: function (cx) { return { value: F(cx).icpt }; },
        wrong: relWrongs(P, 'INTERCEPT', function (f) { return f.icpt; }),
        test: relTest('INTERCEPT'),
        ok: function (cx) { return ic + ' shows ' + withUnit(show(cx.sheet, ic), P.yUnit) + ': what the line predicts for ' + yWhat + ' when ' + lower(P.xName) + ' is 0' + (P.xUnit ? ' ' + P.xUnit : '') + '.'; } });
      steps.push({ kind: 'type', cell: rq, say: 'How well do your points fit a straight line? In <b>' + rq + '</b>, type <b>=RSQ(' + yRel + ',' + xR + ')</b>. RSQ finds R², a number from 0 to 1.',
        expect: function (cx) { return { value: F(cx).rsq }; },
        wrong: [{ when: function (cc) { var f = F(cc.ctx); return f && near(cc.value, f.r) && !near(f.r, f.rsq); }, msg: 'That is CORREL, the correlation r. RSQ gives r squared, R²: =RSQ(' + yRel + ',' + xR + ').' }].concat(relWrongs(P, 'RSQ', function (f) { return f.rsq; })),
        test: relTest('RSQ'),
        ok: function (cx) { var v = cx.sheet.get(rq); return rq + ' shows R² = ' + show(cx.sheet, rq) + '. ' + rsqWords(v) + ' R² near 1 means the points line up. It does not prove that changing ' + lower(P.xName) + ' causes the change: a pattern in data is not proof of a cause.'; } });
      if (plan.mode === 'pairs' && !plan.avg) steps.push(watchStep(P, [sl, rq], ['the slope', 'R²'], function (cx) { return firstNum(cx.sheet, P.yc, P.yc, P.top + Math.floor((P.bot - P.top) / 2), P.bot); }, 'Watch: change one data point and the slope and R² follow.'));
    }

    /* ---- chart ---- */
    if (plan.chart) {
      steps.push(wrapEnter({ kind: 'chart', say: 'Press <b>Insert chart</b>. It draws a scatter chart: one dot per row, with ' + lower(P.xName) + ' across and ' + (plan.mode === 'wide' ? 'the means' : lower(P.yName)) + ' up the side, plus a trendline: the straight line ' + (plan.rel ? 'that SLOPE and INTERCEPT describe' : 'that fits your points best') + '.',
        after: function (cx) { cx.data.chartOn = true; excelChartNote(cx, P); },
        ok: 'There is your chart. The dots are your data; the line is the trendline. It redraws itself if a number changes.' }, true));
    }

    /* ---- percent error ---- */
    if (plan.acc !== 'no') {
      var ac = c.acc, pe = c.pe, meas = plan.acc === 'slope' ? c.slope : c.mean, known = ds.accepted ? ds.accepted.value : null, au = P.accUnit;
      var who = ds.origin === 'sample' ? 'The lab says' : ds.origin === 'handoff' ? esc(ds.source.site) + ' says' : '';
      steps.push({ kind: 'type', cell: ac, say: (known !== null && who ? who + ' the accepted value is <b>' + esc(fmtNum(known)) + (au ? ' ' + esc(au) : '') + '</b>. ' : 'Type the accepted value from your lab handout or textbook. ') + 'Click <b>' + ac + '</b> and type just the number' + (known !== null && who ? ', ' + esc(fmtNum(known)) : '') + '. The unit is already in its label.',
        test: function (cc) {
          var i = cc.info, t = i.type === 'text' ? String(i.value).trim() : '', m;
          if (i.formula) return 'Type the accepted value as a plain number, with no = sign.';
          if (t && (m = UNITRE.exec(t))) return 'Type just the number, ' + esc(m[1]) + '. The unit is already in the label, ' + A(P.RL, R.parseA1(ac).r) + '.';
          if (typeof cc.value !== 'number') return ac + ' needs a number: the accepted value.';
          if (cc.value === 0) return 'The accepted value cannot be 0: percent error divides by it.';
          if (known !== null && !rel(cc.value, known)) return 'The accepted value here is ' + esc(fmtNum(known)) + '. Type ' + esc(fmtNum(known)) + ' in ' + ac + '.';
          return true;
        },
        ok: function (cx) { return ac + ' holds the accepted value, ' + withUnit(show(cx.sheet, ac), au) + '.'; } });
      var M = function (s2) { return s2.get(meas); }, Ac = function (s2) { return s2.get(ac); };
      var peF = '=ABS(' + meas + '-' + ac + ')/' + ac;
      steps.push({ kind: 'type', cell: pe, say: 'How far is your ' + (plan.acc === 'slope' ? 'slope' : 'mean') + ' from the accepted value? <b>Percent error</b> = |' + (plan.acc === 'slope' ? 'slope' : 'mean') + ' − accepted| ÷ accepted. In <b>' + pe + '</b>, type <b>' + peF + '</b>. ABS drops any minus sign, and ' + pe + ' already shows a percent.',
        test: function (cc) {
          var s2 = cc.sheet, m = M(s2), a = Ac(s2), want = Math.abs(m - a) / Math.abs(a), p = parsed(cc), v = cc.value;
          var res = R.check(s2, [{ cell: pe, value: want, tol: 1e-9 * Math.max(1, want) }]);
          if (res.ok) {
            if (!p || !refsCell(p, meas)) return 'Use your ' + (plan.acc === 'slope' ? 'slope' : 'mean') + '’s cell, ' + meas + ', not the number, so the answer updates when your data changes.';
            if (!refsCell(p, ac)) return 'Use the accepted value’s cell, ' + ac + ', not the number, so the answer updates if it changes.';
            return true;
          }
          if (p && near(v, want * 100)) {
            if (!refsCell(p, meas) || !refsCell(p, ac)) return 'Use the cells ' + meas + ' and ' + ac + ', not the numbers.';
            s2.format(pe, 'fixed:2'); s2.setValue(A(P.RL, R.parseA1(pe).r), 'Percent error (%)'); cc.ctx.ui.render(); cc.ctx.data.pe100 = true; return true;
          }
          if (p && near(v, -want) && want) return pe + ' shows a negative percent. Wrap the difference in ABS( ) so it is never negative: ' + peF + '.';
          if (p && near(v, (m - a) / a) && (m - a) / a < 0) return pe + ' shows a negative percent. Wrap the difference in ABS( ) so it is never negative: ' + peF + '.';
          if (p && near(v, Math.abs(m - a / a)) || p && near(v, m - a / a)) return 'Excel divided before it subtracted. Put the subtraction inside ABS( ): ' + peF + '.';
          if (p && m && near(v, Math.abs(m - a) / Math.abs(m))) return 'You divided by your ' + (plan.acc === 'slope' ? 'slope' : 'mean') + '. Percent error divides by the accepted value: /' + ac + '.';
          if (p && near(v, Math.abs(m - a))) return 'That is the difference. Divide it by the accepted value to make it a percent: ' + peF + '.';
          return XL.friendly(res);
        },
        ok: function (cx) { var s2 = cx.sheet; return pe + ' shows ' + show(s2, pe) + (cx.data.pe100 ? '%. Your formula multiplies by 100, so the cell shows the percent as a plain number. Lesson 10’s way, without the *100, shows it with a % sign. Both work.' : '.') + ' Your ' + (plan.acc === 'slope' ? 'slope' : 'mean') + ' is that far from the accepted value. Your teacher will tell you how close counts as good for this lab.'; } });
    }

    /* ---- download, Excel, done ---- */
    steps.push(wrapEnter({ kind: 'download', say: 'Press <b>Download as Excel file</b>. Your data, your formulas and your results come with it.', ok: function (cx) { return 'Downloaded. The file is called <b>' + esc(cx.data.downloaded || 'your file') + '</b>.'; } }));
    steps.push(wrapEnter({ kind: 'card', say: 'Open it in real Excel, then turn it in. Pick the Excel you will use and follow each picture.', next: 'Done',
      render: function (box, cx) { XL.openCard(box, { file: cx.data.downloaded || (ctx.flow.filename + '.xlsx') }); } }));
    steps.push(wrapEnter({ kind: 'done', say: ds.origin === 'sample' ? '<b>You analyzed a lab data set.</b> Now try it with your own data: paste it, type it, or send it here from a Raider Labs site.' : '<b>You analyzed your own lab data.</b> The formulas are in your Excel file, so they keep working there.',
      enter: function (cx) { this.learned = learned(cx, P); if (!cx.run.after.querySelector('.xl-az-further')) cx.run.after.appendChild(goingFurther()); } }));
    return steps.map(function (s) { return s.kind === 'chart' ? s : wrapEnter(s, false); });
  }
  function refsCell(p, a) { var q = R.parseA1(a); return p.refs.some(function (x) { return x.r === q.r && x.c === q.c; }) || p.ranges.some(function (g) { return q.r >= g.r1 && q.r <= g.r2 && q.c >= g.c1 && q.c <= g.c2; }); }
  function headNote(ctx, a) { var p = R.parseFormula(ctx.sheet.input(a)); return !p.error && p.ranges.some(function (g) { return g.r1 === 1; }) ? ' (Your range starts at the header in row 1. AVERAGE skips words, so it works, but start at row 2, where the numbers start.)' : ''; }
  function avgWrongs(P, fn) {
    var label = 'your ' + lower(P.yName) + ' trials';
    return [
      { when: function (cc) { var p = parsed(cc), v = yVals(cc.sheet, P), t = fn === 'AVERAGE' ? mean(v) : sdS(v); return !!p && !near(cc.value, t) && !!colCoach(p, P.yc, P.top, P.bot, label, cc.sheet); }, msg: function (cc) { return colCoach(parsed(cc), P.yc, P.top, P.bot, label, cc.sheet); } },
      { when: function (cc) { var v = yVals(cc.sheet, P); return fn === 'AVERAGE' && v.length > 1 && near(cc.value, v.reduce(function (a, b) { return a + b; }, 0)); }, msg: 'That adds the trials up (SUM). For the mean, use AVERAGE: =AVERAGE(' + P.yR + ').' },
      { when: function (cc) { var p = parsed(cc), v = yVals(cc.sheet, P).slice().sort(function (a, b) { return a - b; }), h = v.length >> 1, md = v.length % 2 ? v[h] : (v[h - 1] + v[h]) / 2; return fn === 'AVERAGE' && !!p && p.fns.indexOf('MEDIAN') >= 0 && near(cc.value, md); }, msg: 'MEDIAN finds the middle trial. For the mean, use AVERAGE: =AVERAGE(' + P.yR + ').' }
    ];
  }
  function relWrongs(P, fn, pick) {
    var yRel = P.yRel, xR = P.xR, want = '=' + fn + '(' + yRel + ',' + xR + ')';
    var yc = P.mode === 'wide' ? P.meanCol : P.yc;
    return [
      { when: function (cc) { var v = relY(cc.sheet, P), f = fit(v.y, v.x), g = fit(v.x, v.y); return fn !== 'RSQ' && f && g && near(cc.value, pick(f)) && !near(pick(f), pick(g)); }, msg: 'Those ranges are swapped. ' + fn + ' takes the y values (what you measured) first, then the x values: ' + want + '.' },
      { when: function (cc) { var p = parsed(cc), g = fitOf(cc); return !!p && !(g && near(cc.value, pick(g))) && rangesOff(p, P, yc) !== null; }, msg: function (cc) { return rangesOff(parsed(cc), P, yc) + ' Type ' + want + '.'; } }
    ];
    function fitOf(cc) { var v = relY(cc.sheet, P); return fit(v.x, v.y); }
  }
  /* SLOPE-style ranges: both columns, rows top to bottom */
  function rangesOff(p, P, yc) {
    var a = colCoach(p, yc, P.top, P.bot, P.mode === 'wide' ? 'the means' : 'your ' + lower(P.yName) + ' values', null2(P), P.xc);
    if (a) return a;
    return colCoach(p, P.xc, P.top, P.bot, 'your ' + lower(P.xName) + ' values', null2(P), yc);
  }
  function null2() { return { get: function () { return null; } }; }
  function firstNum(sh, c1, c2, r1, r2) {
    for (var r = r1; r <= r2; r++) for (var c = c1; c <= c2; c++) { var v = sh.get(A(c, r)); if (typeof v === 'number') return { cell: A(c, r), v: v }; }
    return null;
  }
  function watchStep(P, showCells, names, pickFn, say) {
    return { kind: 'azwatch', say: say + ' The lesson changes one of your numbers for a moment, then puts it back.', show: showCells, names: names,
      pick: function (cx) {
        var f = pickFn(cx); if (!f) return null;
        var dp = decimals(f.v), info = cx.sheet.info(f.cell), to = f.v ? +(f.v * 1.2).toFixed(Math.max(dp, 1)) : 1;
        if (to === f.v) to = +(f.v + Math.pow(10, -Math.max(dp, 1))).toFixed(Math.max(dp, 1));
        var toText = String(to), fromText = info.fmt ? R.formatValue(f.v, info.fmt) : String(f.v);
        return { cell: f.cell, from: f.v, to: to, toText: toText, fromText: fromText };
      } };
  }
  function emptyRows(cx, mc) { var P = cx.data.P, bad = []; for (var r = P.top; r <= P.bot; r++) if (R.isError(cx.sheet.get(A(mc, r)))) bad.push(r); return bad.length ? ' Row ' + bad.join(', ') + ' shows #DIV/0! because it has no trials to average. That is expected.' : ''; }
  function spreadRows(cx, P, sc) {
    var s2 = cx.sheet, big = null;
    for (var r = P.top; r <= P.bot; r++) { var v = s2.get(A(sc, r)); if (typeof v === 'number' && (!big || v > big.v)) big = { r: r, v: v }; }
    if (!big) return 'Every row has its spread now.';
    var xv = P.xc ? s2.display(A(P.xc, big.r)) : null;
    return 'Every row has its spread now. The biggest is ' + withUnit(s2.display(A(sc, big.r)), P.yUnit) + ', in row ' + big.r + (xv ? ' (' + lower(P.xName) + ' ' + withUnit(xv, P.xUnit) + ')' : '') + ': the trials in that row agree the least. A small spread means the trials agree.';
  }
  function excelChartNote(cx, P) {
    var box = el('div', 'xl-az-note');
    box.innerHTML = '<h3>Make this chart in Excel</h3><p>The chart stays on this page. Your Excel file keeps your numbers and formulas, but not the chart. In Excel:</p><ol>' +
      '<li>Select your ' + esc(lower(P.xName)) + ' column (' + esc(P.xR) + '). Then hold <b>Ctrl</b> (on a Mac, <b>Cmd</b>) and select ' + (P.mode === 'wide' ? 'your means' : 'your ' + esc(lower(P.yName)) + ' column') + ' (' + esc(P.yRel) + ').</li>' +
      '<li>On the <b>Insert</b> tab, choose a <b>Scatter</b> chart.</li>' +
      '<li>Select the chart and add a <b>Trendline</b>. In the desktop app, it is under the <b>+</b> button beside the chart. Can’t find it in Excel for the web? Choose <b>Editing &gt; Open in Desktop</b>.</li></ol>';
    cx.run.after.innerHTML = ''; cx.run.after.appendChild(box);
  }
  function goingFurther() {
    var box = el('div', 'xl-az-note xl-az-further');
    box.innerHTML = '<h3>Going further <span class="xl-az-tag">Desktop Excel</span></h3><p>The desktop app has a <b>Data Analysis</b> button that can run a full regression report or a t-test. Excel for the web does not have it. The formulas you used here, AVERAGE, STDEV.S, SLOPE, INTERCEPT and RSQ, work the same in both Excels.</p>';
    return box;
  }
  function learned(cx, P) {
    var s = cx.sheet, plan = P.plan, out = [], c = P.cells;
    if (plan.mode === 'wide' && plan.avg) out.push('<b>AVERAGE</b> across a row found each condition’s mean, and <b>Fill down</b> did every row.');
    else if (plan.avg) out.push('<b>AVERAGE</b> found the mean of your trials: ' + esc(withUnit(show(s, c.mean), P.yUnit)) + '.');
    if (plan.spread) out.push('<b>STDEV.S</b> found how spread out your trials are. Small spread, consistent trials.');
    if (plan.rel) out.push('<b>SLOPE</b>, <b>INTERCEPT</b> and <b>RSQ</b> took the y values first: your slope is ' + esc(withUnit(show(s, c.slope), slopeUnit(P))) + ', with R² = ' + esc(show(s, c.rsq)) + '.');
    if (plan.chart) out.push('A <b>scatter chart</b> with a trendline shows the relationship. In Excel: Insert, then Scatter.');
    if (plan.acc !== 'no') out.push('Percent error: <b>=ABS(measured - accepted)/accepted</b>. Yours: ' + esc(show(s, c.pe)) + (cx.data.pe100 ? '%' : '') + '.');
    out.push('<b>Download as Excel file</b> keeps your data, formulas and results.');
    return out;
  }

  /* ===================== the flow for one data set ===================== */
  function makeFlow(ds) {
    var C = ds.headers.length, N = ds.rows.length, widths = {};
    for (var j = 0; j < C; j++) {
      var len = String(ds.headers[j] || '').length;
      ds.rows.forEach(function (r) { var v = r[j]; len = Math.max(len, v == null ? 0 : String(v).length); });
      widths[L(j + 1)] = colW(len);
    }
    var base = [];
    if (ds.origin === 'type') base.push({ kind: 'azdata', say: 'Type your numbers into the glowing cells. Click a cell, type one number, and press <b>Enter</b>. Enter moves you down to the next trial. Just the number: the unit is already in the header.',
      skipIf: function (cx) { return ds.typed; }, after: function (cx) { ds.typed = true; captureData(cx); }, ok: 'Your numbers are in.' });
    base.push({ kind: 'azcheck', say: 'Before the math, check your data. Every cell in a number column should hold just a number, so the formulas can use it.',
      skipIf: function (cx) { return !scan(cx.sheet, cx.data.D).issues.length; },
      okText: function (sc) { return 'Your data is clean: every cell in your number columns holds a number.' + blankNote(sc); },
      ok: function (cx) { return 'Your data is clean: every cell in your number columns holds a number.' + blankNote(scan(cx.sheet, cx.data.D)); },
      after: function (cx) { cx.sheet.lock(region(cx.data.D)); cx.ui.render(); captureData(cx); } });
    base.push({ kind: 'azhead', say: function (cx) { return ds.locked ? 'Row 1 holds your <b>headers</b>: what each column is, with its unit in parentheses. These came with your data. Check that they make sense, then press Next.' : 'Row 1 holds your <b>headers</b>: what each column is, with its unit in parentheses, like Time (s). Check each one. To change one, click it and type the whole header.'; },
      after: function (cx) { cx.sheet.lock('A1:' + A(cx.data.D.C, 1)); cx.ui.render(); captureData(cx); },
      ok: 'Your columns have names and units. That is what makes a graph or a lab report readable.',
      callouts: [{ at: 'row:1', title: 'Headers', text: 'Row 1 names each column, with its unit. Every number below it is in that unit.' }] });
    base.push({ kind: 'azplan', say: 'What do you want to find? Answer these four questions about your lab. Your data stays in the grid below.' });
    return {
      id: 'analyze', key: 'analyze', title: 'Analyze your lab data', gridLabel: 'Your lab data', filename: ds.file || 'lab-data-analysis', dataset: ds,
      sheet: { name: (ds.source && ds.source.tool ? ds.source.tool : 'Lab data').slice(0, 31), rows: Math.max(N + 2, 10), cols: C + 1, widths: widths, start: 'A1', maxHeight: '440px',
        setup: function (sh, ctx) { setupSheet(sh, ds); ctx.data.D = { N: N, C: C }; } },
      ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['chart'] },
      chartTypes: ['scatter'],
      chart: function (ctx) {
        var P = ctx.data.P; if (!P || !P.xc) return 'A scatter chart needs two number columns: pick what you changed in the plan.';
        return { type: 'scatter', x: P.xR, y: P.yRel, title: (P.mode === 'wide' ? 'Mean ' + lower(P.yName) : P.yName) + ' vs. ' + lower(P.xName), trend: P.plan.rel ? { slope: P.cells.slope, intercept: P.cells.icpt } : true };
      },
      nextHref: '#analyze', nextLabel: 'Analyze another data set', againLabel: 'Start this analysis over',
      setupSteps: base.length,
      steps: base.map(function (s) { var e = s.enter; s.enter = function (cx) { chartBtn(cx, false); if (e) e.call(s, cx); }; return s; })
    };
  }
  function colW(len) { return Math.round(Math.max(72, Math.min(184, 24 + len * 8.4))); }
  function blankNote(sc) { return sc.blanks.length ? ' ' + listCells(sc.blanks) + (sc.blanks.length > 1 ? ' are' : ' is') + ' empty. That is OK if a trial did not happen: AVERAGE, STDEV.S and SLOPE skip empty cells.' : ''; }
  function listCells(a) { return a.length > 4 ? a.slice(0, 4).join(', ') + ' and ' + (a.length - 4) + ' more' : joinList(a); }

  /* ===================== pages ===================== */
  var pending = null, notice = null;
  function shell(title, lede, crumb) {
    var v = el('section', 'xl-view xl-az');
    v.appendChild(el('p', 'xl-crumb', crumb || '<a href="#home">← All lessons</a>'));
    v.appendChild(el('p', 'xl-kicker', 'Science · Analyze your lab data' + (XL.isDone('analyze') ? ' · <span class="xl-donetag">Done once</span>' : '')));
    v.appendChild(el('h2', 'xl-title', esc(title)));
    if (lede) v.appendChild(el('p', 'xl-scen', words(lede)));
    return v;
  }
  function msgBox(v, html, kind) { var p = el('p', 'xl-fb xl-fb-' + (kind || 'info') + ' xl-az-msg', html); p.setAttribute('role', 'alert'); v.appendChild(p); }
  function startView() {
    var v = shell('Analyze your lab data', 'Bring the data from your own lab. One step at a time, you find what your lab report needs: the mean of your trials, how consistent they are, your percent error and the slope. Then you download it as an Excel file.');
    if (notice) { msgBox(v, notice); notice = null; }
    var box = el('div', 'xl-start xl-az-start');
    box.innerHTML = '<p class="xl-badge">Start here</p><h3>Where is your data?</h3>';
    var grid = el('div', 'xl-az-ways');
    [['analyze-paste', 'Paste it', 'It is in a spreadsheet, Google Sheets, a Raider Labs data table or a lab handout.'],
     ['analyze-type', 'Type it', 'It is on paper. Type it into a table, one number at a time.'],
     ['analyze-sample', 'Try it with sample data', 'No data yet? Practice on a sample lab first.']].forEach(function (w, k) {
      var a = el('a', 'xl-az-way' + (k === 0 ? ' xl-az-first' : ''), '<b>' + esc(w[1]) + '</b><small>' + esc(words(w[2])) + '</small>'); a.href = '#' + w[0]; grid.appendChild(a);
    });
    box.appendChild(grid);
    box.appendChild(el('p', 'xl-az-lab', 'Coming from a Raider Labs simulation? Press <b>Analyze in a spreadsheet</b> there, and your table lands here by itself.'));
    v.appendChild(box);
    v.appendChild(pagerEl());
    return { v: v, title: 'Analyze your lab data' };
  }
  function pagerEl() { var p = el('nav', 'xl-pager'); p.setAttribute('aria-label', 'Related lessons'); p.innerHTML = '<a href="#lesson-10">New to lab formulas? Lesson 10: Science basics</a><a href="#lesson-11">Need help opening the file? Lesson 11</a>'; return p; }
  function pasteView() {
    var v = shell('Paste your lab data', null, '<a href="#analyze">← Analyze your lab data</a>');
    if (notice) { msgBox(v, notice); notice = null; }
    var id = 'azpaste', card = el('div', 'xl-card xl-az-paste');
    card.innerHTML = '<ol class="xl-az-how">' +
      '<li>In your spreadsheet, Google Sheets or lab handout, select your whole table, headers too. On a Raider Labs page, press <b>Copy as CSV</b> and skip to step 3.</li>' +
      '<li>Copy it: press <b>Ctrl+C</b> (on a Mac, <b>Cmd+C</b>).</li>' +
      '<li>Click in the box below and paste: <b>Ctrl+V</b> (on a Mac, <b>Cmd+V</b>). On a phone or tablet, press and hold in the box, then choose Paste.</li></ol>' +
      '<label class="xl-az-l" for="' + id + '">Paste your table here</label><textarea id="' + id + '" class="xl-az-ta" rows="8" spellcheck="false" autocomplete="off" placeholder="Trial&#9;Time (s)&#10;1&#9;2.31&#10;2&#9;2.45"></textarea>' +
      '<p class="xl-fb" hidden></p><div class="xl-acts"><button type="button" class="xl-btn primary xl-next">Use this data</button></div>';
    card.innerHTML = words(card.innerHTML);
    v.appendChild(card);
    var ta = card.querySelector('textarea'), fb = card.querySelector('.xl-fb');
    card.querySelector('.xl-next').addEventListener('click', function () {
      var r = parsePaste(ta.value), why = null;
      if (r.error === 'empty') why = 'The box is empty. Copy your table, click in the box, and paste it.';
      else if (r.error === 'cols') why = 'That table has ' + r.n + ' columns. This page takes up to ' + LIM.cols + '. Copy just the columns you need for the analysis.';
      else if (r.error === 'rows') why = 'That table has ' + r.n + ' rows. This page takes up to ' + LIM.rows + '. Paste fewer rows, or analyze it in Excel directly.';
      else if (r.error === 'norows') why = 'I only found a header row. Copy the rows of numbers under it too.';
      if (why) { fb.hidden = false; fb.className = 'xl-fb xl-fb-bad'; fb.innerHTML = why; ta.focus(); return; }
      var ds = { origin: 'paste', headers: r.headers, rows: r.rows, notes: r.notes, warn: r.warn, source: null, accepted: null, suggest: null, locked: false, file: 'lab-data-analysis' };
      openRun(ds);
    });
    return { v: v, title: 'Paste your lab data', focus: ta };
  }
  function typeView() {
    var v = shell('Type your lab data', null, '<a href="#analyze">← Analyze your lab data</a>');
    var card = el('div', 'xl-card xl-az-type'), id = 'aztype';
    card.innerHTML = '<p class="xl-say">What did you measure? Name each column and its unit. Next you type your numbers into a table with these headers.</p>' +
      '<div class="xl-az-cols"></div><div class="xl-acts xl-az-add"><button type="button" class="xl-btn xl-az-plus">+ Add a column</button></div>' +
      '<label class="xl-az-opt"><input type="checkbox" class="xl-az-trial" checked> Number my rows with a Trial column</label>' +
      '<div class="xl-az-q xl-az-n"><label for="' + id + '-n">How many rows? <small>One row for each trial (up to ' + LIM.typeRows + ').</small></label><input id="' + id + '-n" type="number" inputmode="numeric" min="1" max="' + LIM.typeRows + '" value="5"></div>' +
      '<p class="xl-fb" hidden></p><div class="xl-acts"><button type="button" class="xl-btn primary xl-next">Make my table</button></div>';
    v.appendChild(card);
    var list = card.querySelector('.xl-az-cols'), fb = card.querySelector('.xl-fb'), k = 0;
    function addCol(name, unit) {
      var n = ++k, row = el('div', 'xl-az-colrow');
      row.innerHTML = '<div class="xl-az-q"><label for="' + id + '-c' + n + '">Column name</label><input id="' + id + '-c' + n + '" type="text" maxlength="' + LIM.name + '" autocomplete="off" placeholder="Like Time" value="' + esc(name || '') + '"></div>' +
        '<div class="xl-az-q xl-az-u"><label for="' + id + '-u' + n + '">Unit</label><input id="' + id + '-u' + n + '" type="text" maxlength="' + LIM.unit + '" autocomplete="off" placeholder="Like s" value="' + esc(unit || '') + '"></div>' +
        '<button type="button" class="xl-btn xl-az-rm" aria-label="Remove this column">Remove</button>';
      row.querySelector('.xl-az-rm').addEventListener('click', function () { if (list.children.length > 1) { row.remove(); sync(); } });
      list.appendChild(row); sync();
      return row;
    }
    function sync() { card.querySelector('.xl-az-plus').disabled = list.children.length >= LIM.typeCols; list.querySelectorAll('.xl-az-rm').forEach(function (b) { b.hidden = list.children.length < 2; }); }
    addCol();
    card.querySelector('.xl-az-plus').addEventListener('click', function () { addCol().querySelector('input').focus(); });
    card.querySelector('.xl-next').addEventListener('click', function () {
      var cols = [], bad = null;
      list.querySelectorAll('.xl-az-colrow').forEach(function (r, i) {
        var ins = r.querySelectorAll('input'), nm = clean(ins[0].value, LIM.name), un = clean(ins[1].value, LIM.unit).replace(/^\((.*)\)$/, '$1');
        if (!nm && !bad) bad = { el: ins[0], msg: 'Column ' + (i + 1) + ' needs a name, like Time or Mass.' };
        cols.push(un ? nm + ' (' + un + ')' : nm);
      });
      var nIn = card.querySelector('#' + id + '-n'), n = Math.round(+nIn.value);
      if (!bad && !(n >= 1 && n <= LIM.typeRows)) bad = { el: nIn, msg: 'Pick a number of rows from 1 to ' + LIM.typeRows + '.' };
      var seen = {}; cols.forEach(function (c) { var q = c.toLowerCase(); if (!bad && seen[q]) bad = { el: list.querySelector('input'), msg: 'Two columns are both called “' + esc(c) + '”. Give each its own name, like Trial 1 and Trial 2.' }; seen[q] = 1; });
      if (bad) { fb.hidden = false; fb.className = 'xl-fb xl-fb-bad'; fb.innerHTML = bad.msg; bad.el.focus(); return; }
      var trial = card.querySelector('.xl-az-trial').checked, headers = (trial ? ['Trial'] : []).concat(cols), rows = [];
      for (var i = 0; i < n; i++) { var r = trial ? [i + 1] : []; cols.forEach(function () { r.push(null); }); rows.push(r); }
      openRun({ origin: 'type', headers: headers, rows: rows, notes: [], warn: [], source: null, accepted: null, suggest: null, locked: false, trialCol: trial ? 1 : null, file: 'lab-data-analysis' });
    });
    return { v: v, title: 'Type your lab data', focus: list.querySelector('input') };
  }
  function sampleView() {
    var v = shell('Try it with sample data', 'Practice on a sample lab. The numbers are made up, but they look like real class data. Pick one.', '<a href="#analyze">← Analyze your lab data</a>');
    var g = el('div', 'xl-builds xl-az-samples');
    SAMPLES.forEach(function (s) {
      var c = el('div', 'xl-az-sample');
      c.innerHTML = '<h4>' + esc(s.title) + '</h4><p class="xl-az-kind">' + esc(s.kind) + '</p><p>' + esc(s.blurb) + '</p>';
      var a = el('a', 'xl-btn primary', 'Use this sample'); a.href = '#analyze-sample-' + s.id; a.setAttribute('aria-label', 'Use the sample: ' + s.title);
      c.appendChild(a); g.appendChild(c);
    });
    v.appendChild(g);
    return { v: v, title: 'Try it with sample data' };
  }
  function openRun(ds) { pending = ds; session.set(SKEY, JSON.stringify({ ds: ds })); if (location.hash === '#analyze-run') window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = '#analyze-run'; }
  function runView(ds, how) {
    var title = ds.origin === 'sample' ? ds.sample.title : 'Analyze your lab data';
    var v = shell(title, null, '<a href="#analyze">← Analyze your lab data</a>');
    var src = el('div', 'xl-az-src');
    if (ds.origin === 'handoff') src.innerHTML = '<p><b>From ' + esc(ds.source.site) + (ds.source.tool ? ':</b> ' + esc(ds.source.tool) : '</b>') + '. ' + plural(ds.rows.length, 'row') + ' of data, with the column names and units from the lab.' + (ds.source.url ? ' <a href="' + esc(ds.source.url) + '">Back to the lab</a>' : '') + '</p>';
    else if (ds.origin === 'sample') src.innerHTML = '<p><b>Sample lab:</b> ' + esc(ds.sample.blurb) + ' <small>These numbers are made up for practice.</small></p>';
    else if (ds.origin === 'paste') src.innerHTML = '<p><b>Your pasted data:</b> ' + plural(ds.rows.length, 'row') + ' and ' + plural(ds.headers.length, 'column') + '.' + (ds.headers.some(Boolean) ? ' Row 1 is your headers.' : '') + ' ' + ds.notes.map(esc).join(' ') + '</p>' + ds.warn.map(function (w) { return '<p class="xl-az-warn">' + esc(w) + '</p>'; }).join('');
    else src.innerHTML = '<p><b>Your table:</b> ' + plural(ds.rows.length, 'row') + ', with the headers you named.</p>';
    if (how === 'reload') src.innerHTML += '<p class="xl-az-warn">This page was reloaded, so the analysis starts over with the same data.</p>';
    v.appendChild(src);
    var body = el('div', 'xl-body'); v.appendChild(body);
    v.appendChild(pagerEl());
    return { v: v, body: body, flow: makeFlow(ds) };
  }
  function route(h) {
    var m;
    if (h === 'analyze') return startView();
    if (h === 'analyze-paste') return pasteView();
    if (h === 'analyze-type') return typeView();
    if (h === 'analyze-sample') return sampleView();
    if ((m = /^analyze-sample-([a-z]+)$/.exec(h)) && SAMPLE[m[1]]) return runView(sampleData(SAMPLE[m[1]]));
    if (/^analyze-in(=|$)/.test(h)) {
      var r = readHandoff(h);
      if (r.ds) {
        session.set(SKEY, JSON.stringify({ ds: r.ds }));
        try { history.replaceState(null, '', location.pathname + location.search + '#analyze-run'); } catch (e) { /* file: pages */ }
        return runView(r.ds, r.how === 'reload' ? 'reload' : null);
      }
      notice = WHY[r.error] || WHY.broken;
      try { history.replaceState(null, '', location.pathname + location.search + '#analyze-paste'); } catch (e) { /* ignore */ }
      return pasteView();
    }
    if (h === 'analyze-run') {
      var ds = pending; pending = null;
      if (!ds) { var k = session.get(SKEY); if (k) { try { ds = JSON.parse(k).ds; } catch (e) { ds = null; } } if (ds) return runView(ds, 'reload'); }
      if (ds) return runView(ds);
      notice = 'Your data is not saved on this page after a reload. Paste it or type it again.';
      return startView();
    }
    return startView();
  }
  function homeBlock(done) {
    var w = el('div', 'xl-az-home');
    w.appendChild(el('h3', 'xl-group-h', 'Analyze your lab data <span class="xl-count">' + (done.analyze ? 'Done once' : 'Science') + '</span>'));
    w.appendChild(el('p', 'xl-group-p', 'Bring your own data from a class lab: paste it, type it, or send it here from a Raider Labs simulation. Get the mean, the spread, your percent error and the slope, one step at a time, then download it for Excel.'));
    var c = el('div', 'xl-az-homecard');
    c.innerHTML = '<a class="xl-btn primary" href="#analyze">Start: analyze my lab data</a><a class="xl-btn" href="#analyze-sample">Try it with sample data</a>';
    w.appendChild(c);
    return w;
  }
  XL.analyze = { route: route, homeBlock: homeBlock, parse: parsePaste, fromPayload: fromPayload, limits: LIM, key: KEY };
})();
