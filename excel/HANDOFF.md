# Hand-off contract: science Raider Labs site -> "Analyze your lab data"

Version 1, Nov 7, 2026. Receiving end: `Raider-MathLab/excel/analyze.js` (`excel.html#analyze-in`). Sender: `Raider-MathLab/excel/handoff.js` (copy it into each science site; it is reproduced below).

## What the student sees
1. On BioLab, ChemLab, PhysLab, ForensicsLab, AnatomyLab or SportsMedLab, the student records trials in the Data table and presses **Analyze in a spreadsheet** (put it next to **Copy as CSV** in the Data table header).
2. A new tab opens `https://rjedtech.github.io/Raider-MathLab/excel.html#analyze-in`. The table is already in the grid, with its headers and units, locked, with a line naming the lab it came from ("From Raider PhysLab: Springs and Hooke's law. 12 rows of data ...") and a **Back to the lab** link.
3. The student is walked through the analysis on that data (check data, headers, plan, AVERAGE / STDEV.S / percent error / SLOPE / INTERCEPT / RSQ / scatter chart) and downloads the .xlsx.

If anything is wrong (nothing waiting, older than a day, unreadable, too big, no numbers), the student lands on the paste screen with a kind message telling them to press **Copy as CSV** in the lab and paste.

## The call
```js
RJAnalyzeHandoff.send(payload [, options])
```
Call it from the button's click handler (a new tab can only open from a click).

Returns `{ ok: true, via: 'storage' | 'hash', url }` or `{ ok: false, reason: 'empty' | 'too-big' }`. On `ok: false`, show the site's usual toast, e.g. "That table is too big to send. Press Copy as CSV and paste it instead."

Options (all optional): `target` (default `'_blank'`; `'_self'` opens it in the same tab), `open: false` (just store it and return the URL), `base` (a different excel.html address, for testing).

## Payload
```js
{
  v: 1,                                  // added by send()
  source: { site: 'Raider PhysLab', tool: 'Springs and Hooke’s law', url: location.href },
  columns: [{ name: 'Mass', unit: 'kg' }, { name: 'Stretch', unit: 'm' }],
  rows: [[0.05, 0.024], [0.10, 0.049]], // one array per recorded trial, same order as columns
  accepted: { column: 'g', value: 9.8, unit: 'm/s²' } | null,
  suggest: { x: 'Mass', y: 'Stretch' } | null,
  created: 1794020000000                 // added by send(): Date.now()
}
```

| Field | Rules on the receiving end |
|---|---|
| `v` | Must be `1`. Anything else: "could not be read". |
| `created` | ms since 1970. Older than 24 hours: not loaded ("more than a day old"). More than 5 minutes in the future: not loaded. |
| `columns` | 1 to 12 items. `name`: text, up to 60 characters (required; an empty name becomes "Column B"). `unit`: text, up to 20, or `''`. A name like `'Mass (kg)'` with no `unit` is split into name and unit. The header shown is `Name (unit)`. Duplicate headers get a number added. |
| `rows` | 1 to 500 rows. Each row has at most as many cells as `columns` (shorter rows are padded with empty cells). A cell is a finite number, `null` / `''` (empty), or text up to 40 characters (a word column like Material, or a number as text like `'2.50'`). A cell that is only a dash (`—`, `-`) is empty. Objects, arrays and booleans: "could not be read". At least one number overall, or "had no numbers". |
| `source.site` | Up to 60 characters. Shown as "From <site>". |
| `source.tool` | Up to 100 characters. Shown after the site and used for the file name (`<tool>-analysis.xlsx`). |
| `source.url` | Shown as a **Back to the lab** link only if it starts with `https://rjedtech.github.io/` and is up to 300 characters. Anything else is dropped. |
| `accepted` | Optional. `value` must be a finite, non-zero number (otherwise the accepted value is ignored). `unit` up to 20. `column`: the name of the column whose **mean** is compared with the accepted value, or `'slope'` to compare with the **slope** of y against x (for example g from a pendulum, k from a spring, an acceleration). The student still types the accepted value into its cell; the page tells them the number and checks it. |
| `suggest` | Optional. `x`: the column the student changed (or `null`). `y`: the column they measured, or a list of column names for repeated trials of one measurement in adjacent columns (`['Trial 1', 'Trial 2', 'Trial 3']`). Names match `columns[].name` (or the full `Name (unit)` header). These only preset the plan; the student can change them. |

Every string goes through one cleaner before it reaches the page or the sheet: control and invisible characters (including bidirectional overrides) are removed, spaces are collapsed, a spaced em dash becomes ": ", and the text is cut to its limit. Strings are always shown as text (never HTML) and stored in cells as text (a name that starts with `=` stays text, never a formula).

## Transport
- **localStorage (normal path).** `send()` writes `JSON.stringify(payload)` to `localStorage['rjlabs-analyze']` and opens `excel.html#analyze-in`. All Raider Labs sites share the origin `https://rjedtech.github.io`, so the MathLab page can read it. The receiving page removes the key as soon as it reads it (valid or not), so the data is used once.
- **URL hash (fallback when localStorage is blocked).** `send()` opens `excel.html#analyze-in=<base64url of the UTF-8 JSON>`. base64url = standard base64 with `+` -> `-`, `/` -> `_`, no `=` padding. Cap: **6,000 characters** after encoding (about 4,500 characters of JSON: roughly 200 rows of 3 short numbers). `send()` will not build a longer address (it returns `reason: 'too-big'`), and the page rejects a longer one.
- After loading, the page replaces the address with `#analyze-run` (the data does not stay in the address or in history) and keeps a copy in this tab's sessionStorage (`rjlabs-analyze-session`), so a reload restores the same data. Nothing is sent anywhere; there are no network calls.

## The sender (copy this into each science site)
```js
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
```

### Wiring it to the shared Raider Labs engine (example; check against each site's engine.js)
The sites' `engine.js` already builds the Data table from `trialCols(sim)` and `sim.trials` (see `toCSV`). Send raw numbers, not the display strings:
```js
function analyzePayload(sim, d) {
  const cols = trialCols(sim);
  return {
    source: { site: 'Raider PhysLab', tool: d.title, url: location.href },
    columns: [{ name: 'Trial', unit: '' }].concat(cols.map(c => c.ctl
      ? { name: c.ctl.label, unit: c.ctl.type === 'range' ? (c.ctl.unit || '').trim() : '' }
      : { name: c.m.label, unit: c.m.unit || '' })),
    rows: sim.trials.map(r => [r._n !== undefined ? r._n : r.n].concat(cols.map(c => c.num ? r[c.id] : cellText(c, r[c.id])))),
    accepted: d.accepted || null,   // e.g. { column: 'slope', value: 9.8, unit: 'm/s²' } on a tool that has one
    suggest: d.analyze || null      // e.g. { x: 'Length', y: 'Period' }
  };
}
// in the Data table header, next to Copy as CSV:
// <button type="button" class="btn" data-act="analyze">Analyze in a spreadsheet</button>
sec.querySelector('[data-act=analyze]').addEventListener('click', () => {
  if (!sim.trials.length) { flash(sim, 'Record a trial first'); return; }
  const r = RJAnalyzeHandoff.send(analyzePayload(sim, d));
  if (!r.ok) flash(sim, 'Too big to send. Use Copy as CSV, then paste it in Excel from zero');
});
```
Notes: `c.ctl.unit` sometimes has a leading space (the engine trims it in `trialCols`); `cellText` already turns toggles and selects into words. Metric columns with `m.text` are words, which is fine (they become label columns).

## Links the sites can use
- `excel.html#analyze-in`: receive a hand-off (the button).
- `excel.html#analyze`: start screen (paste, type or sample).
- `excel.html#analyze-paste`, `#analyze-type`, `#analyze-sample`: one way in.
- `excel.html#analyze-sample-spring`, `#analyze-sample-density`, `#analyze-sample-ramp`: practice labs.

## How it was tested
`scratch/excel-test.js` (Playwright) serves MathLab and a stand-in science page from one local origin and checks, at laptop and phone widths in light and dark: the localStorage hand-off in the same tab and in a new tab (key cleared, address becomes `#analyze-run`, lab named, link shown, data locked); the hash fallback with localStorage blocked on both pages; reload; and the failure cases (nothing waiting, two days old, broken JSON, `v: 2`, 501 rows, no numbers, a 6,001-character hash, a bad hash). An injection payload (HTML in every string, a `javascript:` link, a header starting with `=`) shows as plain text, runs nothing, drops the link and stays text in the sheet.
