/* sheet-ui.js: RJSheetUI, the grid for an RJSheet. Needs sheet-core.js and sheet.css.
   RJSheetUI.mount(hostElement, sheet, options) returns a controller. Options:
     label        accessible name of the grid ("Order total spreadsheet")
     filename     download name without .xlsx (defaults to the sheet name)
     buttons      extra toolbar buttons: [{label, primary, onClick(ui)}]
     download     false hides the "Download as Excel file" button
     maxHeight    CSS max-height of the scrolling grid (default 520px)
     start        cell to select first (defaults to the first "your turn" cell)
     onChange     called after every change the student makes
     onEvent      called with {type, ...} for lessons: select, editstart, input, commit, cancel, fill, dollar,
                  locked, undo, paste, clear, download (the second argument is the controller)
     tools        which built-in buttons to show: any of ['fill', 'dollar', 'undo'] (default all three)
     enterButton  true adds a visible Enter button to the formula bar (saves and moves down, like the Enter key)
     tapEdit      true: on a touch screen, one tap on a white cell opens it for typing (default: tap twice)
     xlsx         options passed to RJSheet.toXlsx by the download button
   Keyboard: arrows, Shift+arrows, Enter, Tab, F2, Esc, F4 (cycle $ in a reference), Delete,
   Ctrl+D fill down, Ctrl+R fill right, Ctrl+C / Ctrl+V, Ctrl+Z / Ctrl+Y. */
(function (root) {
  'use strict';
  var R = root.RJSheet;
  var uid = 0;

  function el(tag, cls, attrs, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function slug(s) { return String(s || 'sheet').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sheet'; }
  function rect(a, b) { return { r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) }; }
  var POINT_BEFORE = /[=(,+\-*\/^&<>:]\s*$/;

  function mount(host, sheet, opts) {
    opts = opts || {};
    var id = 'rjs' + (++uid), nR = opts.rows || sheet.rows, nC = opts.cols || sheet.cols;
    var act = { r: 1, c: 1 }, anchor = { r: 1, c: 1 }, editing = null, undo = [], redo = [], clip = null, drag = null, fillDrag = null;
    var touchWasActive = false, lastPointer = 'mouse', api = null;
    function emit(type, d) {
      if (!opts.onEvent) return;
      var ev = { type: type }; if (d) for (var k in d) ev[k] = d[k];
      try { opts.onEvent(ev, api); } catch (err) { if (root.console) console.error(err); }
    }

    /* ---------- build the DOM ---------- */
    var rootEl = el('div', 'rjs', { role: 'region', 'aria-label': opts.label || 'Spreadsheet' });
    var bar = el('div', 'rjs-bar');
    var addrBox = el('div', 'rjs-addr', { 'aria-hidden': 'true' }, 'A1');
    var fx = el('span', 'rjs-fx', { 'aria-hidden': 'true' }, 'fx');
    var fbar = el('input', 'rjs-fbar', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Formula bar for cell A1' });
    bar.appendChild(addrBox); bar.appendChild(fx); bar.appendChild(fbar);
    var enterBtn = null;
    if (opts.enterButton) {
      enterBtn = el('button', 'rjs-btn rjs-enter', { type: 'button', title: 'Save what you typed and move down (Enter)', 'aria-label': 'Enter: save and move down' }, 'Enter');
      enterBtn.addEventListener('mousedown', function (e) { if (editing) e.preventDefault(); });
      enterBtn.addEventListener('click', function () { if (editing) { editing.via = 'enter-button'; commit(1, 0); } else move(1, 0); });
      bar.appendChild(enterBtn);
    }
    var tools = el('div', 'rjs-tools', { role: 'toolbar', 'aria-label': 'Spreadsheet tools' });
    function tool(label, title, fn, cls) {
      var b = el('button', 'rjs-btn' + (cls ? ' ' + cls : ''), { type: 'button', title: title || label }, label);
      /* Keep focus in the cell editor when a tool is pressed mid-edit. */
      b.addEventListener('mousedown', function (e) { if (editing) e.preventDefault(); });
      b.addEventListener('click', function () { fn(); });
      tools.appendChild(b); return b;
    }
    var TOOLS = opts.tools || ['fill', 'dollar', 'undo'], toolBtns = {};
    if (TOOLS.indexOf('fill') >= 0) toolBtns.fill = tool('Fill down', 'Copy the formula into the cells below (Ctrl+D)', function () { fillDownCmd('button'); });
    if (TOOLS.indexOf('dollar') >= 0) toolBtns.dollar = tool('$ Lock ref', 'Add $ signs to the reference at the cursor (F4)', function () { dollarCmd('button'); });
    if (TOOLS.indexOf('undo') >= 0) toolBtns.undo = tool('Undo', 'Undo (Ctrl+Z)', function () { doUndo(); });
    (opts.buttons || []).forEach(function (b, i) { toolBtns[b.id || ('b' + i)] = tool(b.label, b.title, function () { commitIfEditing(); b.onClick(api); }, b.primary ? 'primary' : ''); });
    if (opts.download !== false) toolBtns.download = tool('Download as Excel file', 'Save this sheet as an .xlsx file', function () { download(); }, 'rjs-dl');

    var scroll = el('div', 'rjs-scroll');
    if (opts.maxHeight) scroll.style.maxHeight = opts.maxHeight;
    var table = el('table', 'rjs-grid', { role: 'grid', 'aria-label': opts.label || 'Spreadsheet', 'aria-rowcount': nR + 1, 'aria-colcount': nC + 1, 'aria-multiselectable': 'true' });
    var colgroup = el('colgroup'), thead = el('thead'), htr = el('tr', null, { role: 'row', 'aria-rowindex': 1 }), tbody = el('tbody');
    colgroup.appendChild(el('col', 'rjs-col-rh'));
    var corner = el('th', 'rjs-corner', { role: 'columnheader', 'aria-label': 'Row and column headers' });
    htr.appendChild(corner);
    var colHeads = [], rowHeads = [], tds = [], totalW = 44;
    for (var c = 1; c <= nC; c++) {
      var w = sheet.colWidth(c), col = el('col'); col.style.width = w + 'px'; colgroup.appendChild(col); totalW += w;
      var th = el('th', 'rjs-ch', { role: 'columnheader', scope: 'col', 'aria-colindex': c + 1 }, R.colName(c));
      htr.appendChild(th); colHeads[c] = th;
    }
    table.style.width = totalW + 'px';
    thead.appendChild(htr);
    for (var r = 1; r <= nR; r++) {
      var tr = el('tr', null, { role: 'row', 'aria-rowindex': r + 1 }), rh = el('th', 'rjs-rh', { role: 'rowheader', scope: 'row', 'aria-colindex': 1 }, String(r));
      tr.appendChild(rh); rowHeads[r] = rh; tds[r] = [];
      for (c = 1; c <= nC; c++) {
        var td = el('td', 'rjs-c', { role: 'gridcell', tabindex: '-1', 'aria-colindex': c + 1, 'data-r': r, 'data-c': c });
        tr.appendChild(td); tds[r][c] = td;
      }
      tbody.appendChild(tr);
    }
    table.appendChild(colgroup); table.appendChild(thead); table.appendChild(tbody);
    var editor = el('input', 'rjs-editor', { type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Edit cell' });
    editor.hidden = true;
    var handle = el('div', 'rjs-handle', { 'aria-hidden': 'true', title: 'Drag to fill. Double-click to fill down.' });
    var fillBox = el('div', 'rjs-fillbox', { 'aria-hidden': 'true' }); fillBox.hidden = true;
    scroll.appendChild(table); scroll.appendChild(editor); scroll.appendChild(handle); scroll.appendChild(fillBox);
    var msg = el('p', 'rjs-msg', { role: 'status', 'aria-live': 'polite' });
    var tip = el('div', 'rjs-tip', { role: 'tooltip', id: id + '-tip' }); tip.hidden = true;
    var charts = el('div', 'rjs-charts'); charts.hidden = true;
    rootEl.appendChild(bar); rootEl.appendChild(tools); rootEl.appendChild(scroll); rootEl.appendChild(msg); rootEl.appendChild(charts); rootEl.appendChild(tip);
    host.appendChild(rootEl);

    /* ---------- rendering ---------- */
    var refMarks = [];
    function cellLabel(i) {
      var s = i.addr + ', ' + (i.display !== '' ? i.display : 'empty');
      if (i.error) s += ' error. ' + i.explain;
      if (i.formula) s += ', formula ' + i.input;
      if (i.locked) s += ', given data, locked';
      if (i.mark === 'yourturn') s += ', your turn';
      return s;
    }
    function renderCell(r, c) {
      var td = tds[r][c], i = sheet.info(R.A1(r, c)), cl = 'rjs-c';
      cl += i.type === 'number' ? ' rjs-num' : i.type === 'boolean' ? ' rjs-bool' : i.type === 'error' ? ' rjs-err' : ' rjs-txt';
      if (i.locked) cl += ' rjs-lock';
      if (i.bold) cl += ' rjs-b';
      if (i.mark === 'highlight') cl += ' rjs-hl';
      if (i.mark === 'yourturn') cl += ' rjs-yt';
      if (i.display === '') cl += ' rjs-empty';
      if (td.className.indexOf('rjs-flash-good') >= 0) cl += ' rjs-flash-good';
      if (td.className.indexOf('rjs-flash-bad') >= 0) cl += ' rjs-flash-bad';
      td.className = cl;
      if (td.textContent !== i.display) td.textContent = i.display;
      td.setAttribute('aria-label', cellLabel(i));
      if (i.locked) td.setAttribute('aria-readonly', 'true'); else td.removeAttribute('aria-readonly');
      if (i.error) td.setAttribute('aria-describedby', id + '-tip'); else td.removeAttribute('aria-describedby');
    }
    function renderAll() { for (var r = 1; r <= nR; r++) for (var c = 1; c <= nC; c++) renderCell(r, c); renderSel(); renderCharts(); }
    function sel() { return rect(anchor, act); }
    function renderSel() {
      var g = sel();
      for (var r = 1; r <= nR; r++) for (var c = 1; c <= nC; c++) {
        var td = tds[r][c], inS = r >= g.r1 && r <= g.r2 && c >= g.c1 && c <= g.c2, isA = r === act.r && c === act.c;
        td.classList.toggle('rjs-sel', inS && !(g.r1 === g.r2 && g.c1 === g.c2));
        td.classList.toggle('rjs-act', isA);
        td.setAttribute('aria-selected', inS ? 'true' : 'false');
        td.tabIndex = isA ? 0 : -1;
      }
      for (var c2 = 1; c2 <= nC; c2++) colHeads[c2].classList.toggle('rjs-hd-on', c2 >= g.c1 && c2 <= g.c2);
      for (var r2 = 1; r2 <= nR; r2++) rowHeads[r2].classList.toggle('rjs-hd-on', r2 >= g.r1 && r2 <= g.r2);
      var a = R.A1(act.r, act.c);
      addrBox.textContent = g.r1 === g.r2 && g.c1 === g.c2 ? a : R.rangeText(g);
      fbar.setAttribute('aria-label', 'Formula bar for cell ' + a);
      if (!editing) fbar.value = sheet.input(a);
      fbar.readOnly = sheet.isLocked(a);
      placeHandle();
      var i = sheet.info(a);
      if (i.error && !editing) showTip(tds[act.r][act.c], i); else if (!hoverTip) hideTip();
    }
    function cellBox(r, c) {
      var td = tds[r][c], sr = scroll.getBoundingClientRect(), tr = td.getBoundingClientRect();
      return { left: tr.left - sr.left + scroll.scrollLeft - scroll.clientLeft, top: tr.top - sr.top + scroll.scrollTop - scroll.clientTop, width: tr.width, height: tr.height };
    }
    function placeHandle() {
      var g = sel(), b = cellBox(g.r2, g.c2);
      handle.style.left = (b.left + b.width - 5) + 'px'; handle.style.top = (b.top + b.height - 5) + 'px';
      handle.hidden = !!editing || sheet.isLocked(R.A1(g.r1, g.c1));
    }
    function renderCharts() {
      var fn = RJSheetUI.chartRenderer;
      if (!fn || !sheet.charts.length) { charts.hidden = true; return; }
      charts.hidden = false;
      sheet.charts.forEach(function (spec, i) {
        var box = charts.children[i] || charts.appendChild(el('div', 'rjs-chart'));
        fn(box, R.chartData(sheet, spec), spec, sheet);
      });
    }

    /* ---------- tooltip for error cells ---------- */
    var hoverTip = false;
    function showTip(td, i) {
      tip.textContent = i.error + ': ' + i.explain;
      tip.hidden = false;
      var rr = rootEl.getBoundingClientRect(), tr = td.getBoundingClientRect();
      var left = Math.max(0, Math.min(tr.left - rr.left, rr.width - Math.min(320, rr.width)));
      tip.style.left = left + 'px'; tip.style.top = (tr.bottom - rr.top + 6) + 'px';
    }
    function hideTip() { tip.hidden = true; }
    table.addEventListener('pointerover', function (e) {
      var td = e.target.closest && e.target.closest('td.rjs-c'); if (!td) return;
      var i = sheet.info(R.A1(+td.dataset.r, +td.dataset.c));
      if (i.error) { hoverTip = true; showTip(td, i); }
    });
    table.addEventListener('pointerout', function (e) {
      var td = e.target.closest && e.target.closest('td.rjs-c'); if (!td || !hoverTip) return;
      hoverTip = false; hideTip();
      var i = sheet.info(R.A1(act.r, act.c)); if (i.error && !editing) showTip(tds[act.r][act.c], i);
    });

    /* ---------- messages ---------- */
    function say(text, kind) { msg.textContent = text || ''; msg.className = 'rjs-msg' + (kind ? ' rjs-msg-' + kind : ''); }
    var LOCKED_MSG = 'That cell holds given data, so it stays the same. Pick a white cell to type in.';

    /* ---------- selection ---------- */
    function clampR(r) { return Math.max(1, Math.min(nR, r)); }
    function clampC(c) { return Math.max(1, Math.min(nC, c)); }
    function select(r, c, extend, noFocus) {
      act = { r: clampR(r), c: clampC(c) };
      if (!extend) anchor = { r: act.r, c: act.c };
      renderSel();
      if (!noFocus) tds[act.r][act.c].focus({ preventScroll: false });
      keepVisible();
      emit('select', { addr: R.A1(act.r, act.c), range: R.rangeText(sel()) });
    }
    function keepVisible() {
      var b = cellBox(act.r, act.c), headH = thead.offsetHeight, headW = rowHeads[1].offsetWidth;
      /* keep a little room past the cell, so its fill handle is not cut off at the edge */
      var pad = 14;
      if (b.top - headH < scroll.scrollTop) scroll.scrollTop = Math.max(0, b.top - headH);
      else if (b.top + b.height + pad > scroll.scrollTop + scroll.clientHeight) scroll.scrollTop = b.top + b.height + pad - scroll.clientHeight;
      if (b.left - headW < scroll.scrollLeft) scroll.scrollLeft = Math.max(0, b.left - headW);
      else if (b.left + b.width + pad > scroll.scrollLeft + scroll.clientWidth) scroll.scrollLeft = b.left + b.width + pad - scroll.clientWidth;
    }
    function move(dr, dc, extend) { select(act.r + dr, act.c + dc, extend); }
    /* select a block with the active cell at its top-left, like Excel after a fill */
    function selectRange(g) { anchor = { r: g.r2, c: g.c2 }; select(g.r1, g.c1, true); }

    /* ---------- editing ---------- */
    function input() { return editing && editing.mode === 'bar' ? fbar : editor; }
    function startEdit(mode, text, r, c, force) {
      r = r || act.r; c = c || act.c;
      var a = R.A1(r, c);
      if (sheet.isLocked(a) && !force) { say(LOCKED_MSG, 'info'); if (mode === 'bar') fbar.blur(); emit('locked', { addr: a }); return false; }
      editing = { a: a, r: r, c: c, mode: mode, orig: sheet.input(a), point: null, pc: null };
      hideTip();
      if (mode !== 'bar') {
        var b = cellBox(r, c);
        editor.style.left = b.left + 'px'; editor.style.top = b.top + 'px';
        editor.style.minWidth = b.width + 'px'; editor.style.height = b.height + 'px'; editor.style.width = b.width + 'px';
        editor.className = 'rjs-editor' + (tds[r][c].classList.contains('rjs-num') && mode === 'edit' && editing.orig[0] !== '=' ? ' rjs-ed-num' : '');
        editor.hidden = false;
        editor.value = text != null ? text : editing.orig;
        editor.focus({ preventScroll: true });
        var n = editor.value.length; editor.setSelectionRange(n, n);
        fbar.value = editor.value;
        autosize();
      }
      handle.hidden = true;
      showRefs();
      emit('editstart', { addr: a, mode: mode, text: input().value });
      return true;
    }
    function autosize() {
      var b = cellBox(editing.r, editing.c);
      editor.style.width = b.width + 'px';
      if (editor.scrollWidth > editor.clientWidth) editor.style.width = Math.min(editor.scrollWidth + 12, scroll.scrollWidth - b.left) + 'px';
    }
    function commit(dr, dc, noFocus) {
      if (!editing) return;
      var e = editing, text = input().value;
      editing = null; editor.hidden = true; clearRefs();
      var did = false;
      if (text !== e.orig) {
        var snap = sheet.snapshot(e.a);
        if (e.force) sheet.set(e.a, text);
        if (e.force || sheet.edit(e.a, text)) { did = true; pushUndo(snap); var i = sheet.info(e.a); say(i.parseError ? e.a + ': ' + i.parseError : '', i.parseError ? 'bad' : ''); changed(); }
      }
      select(e.r + (dr || 0), e.c + (dc || 0), false, noFocus);
      emit('commit', { addr: e.a, text: text, changed: did, via: e.via || 'key' });
    }
    function cancel() {
      if (!editing) return;
      var e = editing; editing = null; editor.hidden = true; clearRefs(); fbar.value = e.orig;
      select(e.r, e.c);
      emit('cancel', { addr: e.a });
    }
    function commitIfEditing() { if (editing) commit(0, 0); }
    function syncFromEditor() { if (editing && editing.mode !== 'bar') fbar.value = editor.value; }

    /* references in the formula being typed get colored outlines, like Excel */
    function clearRefs() { refMarks.forEach(function (td) { td.classList.remove('rjs-ref0', 'rjs-ref1', 'rjs-ref2', 'rjs-ref3'); }); refMarks = []; }
    function showRefs() {
      clearRefs();
      var text = input().value; if (!editing || text[0] !== '=') return;
      var toks; try { toks = R.tokenize(text.slice(1)); } catch (e) { return; }
      var k = 0;
      toks.forEach(function (t) {
        var g = t.t === 'ref' ? { r1: t.ref.r, c1: t.ref.c, r2: t.ref.r, c2: t.ref.c } : t.t === 'range' ? rect(t.a, t.b) : null;
        if (!g) return;
        var cls = 'rjs-ref' + (k++ % 4);
        for (var r = g.r1; r <= Math.min(g.r2, nR); r++) for (var c = g.c1; c <= Math.min(g.c2, nC); c++) { tds[r][c].classList.add(cls); refMarks.push(tds[r][c]); }
      });
    }
    /* point mode: while a formula expects a value, clicking or arrowing to a cell types its address */
    function canPoint() {
      if (!editing) return false;
      var inp = input(), text = inp.value, pos = inp.selectionStart;
      if (text[0] !== '=') return false;
      if (editing.point && pos === editing.point.end) return true;
      return POINT_BEFORE.test(text.slice(0, pos));
    }
    function insertRef(ref) {
      var inp = input(), text = inp.value, pos = inp.selectionStart, p = editing.point, start, end;
      if (p && pos === p.end) { start = p.start; end = p.end; } else { start = pos; end = inp.selectionEnd; }
      inp.value = text.slice(0, start) + ref + text.slice(end);
      editing.point = { start: start, end: start + ref.length };
      inp.setSelectionRange(editing.point.end, editing.point.end);
      if (inp === editor) { syncFromEditor(); autosize(); }
      showRefs();
      emit('input', { addr: editing.a, text: inp.value, point: ref });
    }
    /* F4: cycle A1 -> $A$1 -> A$1 -> $A1 -> A1 for the reference at the cursor */
    function toggleDollar() {
      if (!editing) return false;
      var inp = input(), text = inp.value, pos = inp.selectionStart;
      if (text[0] !== '=') return false;
      var toks; try { toks = R.tokenize(text.slice(1)); } catch (e) { return false; }
      var hit = null;
      toks.forEach(function (t) { if ((t.t === 'ref' || t.t === 'range') && t.start + 1 <= pos && pos <= t.end + 1) hit = t; });
      if (!hit) toks.forEach(function (t) { if ((t.t === 'ref' || t.t === 'range') && t.end + 1 <= pos) hit = t; });
      if (!hit) return false;
      function next(x) { var s = (x.ac ? 2 : 0) + (x.ar ? 1 : 0), n = { 0: 3, 3: 1, 1: 2, 2: 0 }[s]; return { r: x.r, c: x.c, ac: !!(n & 2), ar: !!(n & 1) }; }
      var rep;
      if (hit.t === 'ref') rep = R.refText(next(hit.ref));
      else { var a = next(hit.a), b = { r: hit.b.r, c: hit.b.c, ac: a.ac, ar: a.ar }; rep = R.refText(a) + ':' + R.refText(b); }
      inp.value = text.slice(0, hit.start + 1) + rep + text.slice(hit.end + 1);
      var end = hit.start + 1 + rep.length;
      inp.setSelectionRange(end, end);
      if (editing.point && editing.point.start === hit.start + 1) editing.point.end = end;
      if (inp === editor) { syncFromEditor(); autosize(); }
      showRefs();
      emit('dollar', { addr: editing.a, text: inp.value, via: toggleDollar.via || 'key' });
      return true;
    }

    /* ---------- undo ---------- */
    function pushUndo(snap) { undo.push(snap); if (undo.length > 100) undo.shift(); redo = []; }
    function swap(from, to) {
      var snap = from.pop(); if (!snap) { say('Nothing to undo.', 'info'); return; }
      var addrs = snap.map(function (s) { return s.a; }), now = [];
      addrs.forEach(function (a) { now = now.concat(sheet.snapshot(a)); });
      to.push(now); sheet.restore(snap); changed();
    }
    function doUndo() { commitIfEditing(); swap(undo, redo); emit('undo'); }
    function doRedo() { commitIfEditing(); swap(redo, undo); }

    /* ---------- fill, copy, paste, clear ---------- */
    function snapRange(g) { return sheet.snapshot(g); }
    function lockedSay(list) { say('Some of those cells hold given data (' + list.slice(0, 3).join(', ') + (list.length > 3 ? ', ...' : '') + '), so nothing changed. Fill only the white cells.', 'bad'); }
    function doFill(kind, g, target, via) {
      var tg = target || g, snap = snapRange(tg), res;
      res = kind === 'down' ? sheet.fillDown(tg, { respectLocks: true }) : kind === 'right' ? sheet.fillRight(tg, { respectLocks: true }) : sheet.fill(g, tg, { respectLocks: true });
      if (!res.ok) { lockedSay(res.locked); return false; }
      pushUndo(snap); changed();
      selectRange(tg);
      say('Filled ' + R.rangeText(tg) + '. References without $ moved with each cell.', 'good');
      emit('fill', { range: R.rangeText(tg), source: R.rangeText(kind === 'pattern' ? g : { r1: tg.r1, c1: tg.c1, r2: tg.r1, c2: tg.c2 }), kind: kind, via: via || 'api' });
      return true;
    }
    /* Fill down with one row selected: like double-clicking Excel's fill handle, go as far as the column beside it has data. */
    function fillDownCmd(via) {
      commitIfEditing();
      var g = sel();
      if (g.r2 > g.r1) return doFill('down', g, null, via);
      var a = R.A1(g.r1, g.c1);
      if (!sheet.isFormula(a) && sheet.get(a) === null) { say('Fill down copies a cell into the cells below it. Click the cell with your formula first.', 'info'); return false; }
      var end = g.r1;
      [g.c1 - 1, g.c2 + 1].forEach(function (c) { if (c < 1 || c > nC) return; var r = g.r1; while (r < nR && sheet.get(R.A1(r + 1, c)) !== null) r++; end = Math.max(end, r); });
      if (end <= g.r1) { say('Select the formula cell and the cells below it (drag, or hold Shift and press the down arrow), then press Fill down.', 'info'); return false; }
      return doFill('down', { r1: g.r1, c1: g.c1, r2: end, c2: g.c2 }, null, via);
    }
    function dollarCmd(via) {
      toggleDollar.via = via || 'button';
      if (!editing) {
        var a = R.A1(act.r, act.c);
        if (!sheet.isFormula(a) || !startEdit('edit')) { say('Click inside a formula, next to a cell reference like B2, then press $ Lock ref or F4.', 'info'); return; }
      }
      if (!toggleDollar()) say('Put the cursor next to a cell reference like B2, then press $ Lock ref or F4.', 'info');
      toggleDollar.via = null;
    }
    function clearSel() {
      var g = sel(), snap = snapRange(g), skipped = 0, any = false;
      sheet.batch(function () {
        for (var r = g.r1; r <= g.r2; r++) for (var c = g.c1; c <= g.c2; c++) {
          var a = R.A1(r, c);
          if (sheet.isLocked(a)) { skipped++; continue; }
          if (sheet.get(a) !== null || sheet.isFormula(a)) { sheet.set(a, ''); any = true; }
        }
      });
      if (any) { pushUndo(snap); changed(); emit('clear', { range: R.rangeText(g) }); }
      say(skipped ? 'Given cells stay the same.' : '', 'info');
    }
    function tsv(g) {
      var lines = [];
      for (var r = g.r1; r <= g.r2; r++) { var row = []; for (var c = g.c1; c <= g.c2; c++) row.push(sheet.display(R.A1(r, c))); lines.push(row.join('\t')); }
      return lines.join('\n');
    }
    function onCopy(e) {
      if (editing || !rootEl.contains(document.activeElement) || document.activeElement === fbar) return;
      var g = sel(); clip = { g: g, text: tsv(g) };
      if (e.clipboardData) { e.clipboardData.setData('text/plain', clip.text); e.preventDefault(); }
      say('Copied ' + R.rangeText(g) + '. Click where it should go and press Ctrl+V.', 'info');
    }
    function onPaste(e) {
      if (editing || !rootEl.contains(document.activeElement) || document.activeElement === fbar) return;
      var text = e.clipboardData ? e.clipboardData.getData('text/plain') : null;
      e.preventDefault();
      if (clip && (text === null || text.replace(/\r/g, '') === clip.text)) {
        var h = clip.g.r2 - clip.g.r1, w = clip.g.c2 - clip.g.c1, g = sel();
        var tg = (g.r2 - g.r1 >= h && g.c2 - g.c1 >= w && (g.r2 - g.r1 + 1) % (h + 1) === 0 && (g.c2 - g.c1 + 1) % (w + 1) === 0) ? g : { r1: act.r, c1: act.c, r2: act.r + h, c2: act.c + w };
        if (tg.r2 > nR || tg.c2 > nC) { say('That paste would run off the grid. Pick a cell with more room.', 'bad'); return; }
        var lk = sheet.lockedIn(tg); if (lk.length) { lockedSay(lk); return; }
        var snap = snapRange(tg); sheet._tile(clip.g, tg, {}); pushUndo(snap); changed();
        selectRange(tg);
        say('Pasted into ' + R.rangeText(tg) + '.', 'good');
        emit('paste', { range: R.rangeText(tg) });
        return;
      }
      if (!text) return;
      var rows = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map(function (l) { return l.split('\t'); });
      var tg2 = { r1: act.r, c1: act.c, r2: act.r + rows.length - 1, c2: act.c + Math.max.apply(null, rows.map(function (x) { return x.length; })) - 1 };
      if (tg2.r2 > nR || tg2.c2 > nC) { say('That paste would run off the grid. Pick a cell with more room.', 'bad'); return; }
      var lk2 = sheet.lockedIn(tg2); if (lk2.length) { lockedSay(lk2); return; }
      var snap2 = snapRange(tg2);
      sheet.batch(function () { rows.forEach(function (row, i) { row.forEach(function (v, j) { sheet.set(R.A1(tg2.r1 + i, tg2.c1 + j), v); }); }); });
      pushUndo(snap2); changed(); say('Pasted ' + rows.length + ' row' + (rows.length > 1 ? 's' : '') + '.', 'good');
    }
    document.addEventListener('copy', onCopy);
    document.addEventListener('paste', onPaste);

    function changed() { renderAll(); if (opts.onChange) opts.onChange(api); }
    var unsub = sheet.on(function () { if (!editing) renderAll(); else { for (var r = 1; r <= nR; r++) for (var c = 1; c <= nC; c++) renderCell(r, c); } });

    /* ---------- keyboard ---------- */
    table.addEventListener('keydown', function (e) {
      if (editing) return;
      var k = e.key, mod = e.ctrlKey || e.metaKey;
      if (mod && !e.altKey) {
        var lk = k.toLowerCase();
        if (lk === 'd') { e.preventDefault(); fillDownCmd('key'); return; }
        if (lk === 'r') { e.preventDefault(); var g = sel(); if (g.c2 > g.c1) doFill('right', g); else say('Select the formula cell and the cells to its right, then press Ctrl+R.', 'info'); return; }
        if (lk === 'z') { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); return; }
        if (lk === 'y') { e.preventDefault(); doRedo(); return; }
        if (k === 'Home') { e.preventDefault(); select(1, 1); return; }
        if (k === 'ArrowDown') { e.preventDefault(); select(nR, act.c, e.shiftKey); return; }
        if (k === 'ArrowUp') { e.preventDefault(); select(1, act.c, e.shiftKey); return; }
        if (k === 'ArrowLeft') { e.preventDefault(); select(act.r, 1, e.shiftKey); return; }
        if (k === 'ArrowRight') { e.preventDefault(); select(act.r, nC, e.shiftKey); return; }
        return; // let Ctrl+C / Ctrl+V reach the copy and paste events
      }
      switch (k) {
        case 'ArrowDown': e.preventDefault(); move(1, 0, e.shiftKey); return;
        case 'ArrowUp': e.preventDefault(); move(-1, 0, e.shiftKey); return;
        case 'ArrowLeft': e.preventDefault(); move(0, -1, e.shiftKey); return;
        case 'ArrowRight': e.preventDefault(); move(0, 1, e.shiftKey); return;
        case 'Enter': e.preventDefault(); move(e.shiftKey ? -1 : 1, 0); return;
        case 'Tab':
          if ((!e.shiftKey && act.c === nC) || (e.shiftKey && act.c === 1)) return; // leave the grid
          e.preventDefault(); move(0, e.shiftKey ? -1 : 1); return;
        case 'Home': e.preventDefault(); select(act.r, 1); return;
        case 'End': e.preventDefault(); select(act.r, nC); return;
        case 'PageDown': e.preventDefault(); move(10, 0, e.shiftKey); return;
        case 'PageUp': e.preventDefault(); move(-10, 0, e.shiftKey); return;
        case 'F2': e.preventDefault(); startEdit('edit'); return;
        case 'Delete': case 'Backspace': e.preventDefault(); clearSel(); return;
        case 'Escape': clip = null; say(''); return;
      }
      if (k.length === 1 && !e.altKey) { e.preventDefault(); anchor = { r: act.r, c: act.c }; renderSel(); startEdit('enter', k); }
    });
    function editorKey(e, inp) {
      var k = e.key;
      if (k === 'Enter') { e.preventDefault(); editing.via = 'enter'; commit(e.shiftKey ? -1 : 1, 0); return; }
      if (k === 'Tab') { e.preventDefault(); editing.via = 'tab'; commit(0, e.shiftKey ? -1 : 1); return; }
      if (k === 'Escape') { e.preventDefault(); cancel(); return; }
      if (k === 'F4') { e.preventDefault(); toggleDollar.via = 'key'; toggleDollar(); toggleDollar.via = null; return; }
      var dir = { ArrowDown: [1, 0], ArrowUp: [-1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[k];
      if (dir && editing.mode === 'enter' && !e.shiftKey) {
        e.preventDefault();
        if (canPoint()) {
          var pc = editing.point && editing.pc ? editing.pc : { r: editing.r, c: editing.c };
          pc = { r: clampR(pc.r + dir[0]), c: clampC(pc.c + dir[1]) };
          insertRef(R.A1(pc.r, pc.c));
          editing.pc = pc;
          return;
        }
        commit(dir[0], dir[1]);
      }
    }
    editor.addEventListener('keydown', function (e) { if (editing) editorKey(e, editor); });
    editor.addEventListener('input', function () { if (!editing) return; editing.point = null; editing.pc = null; syncFromEditor(); autosize(); showRefs(); emit('input', { addr: editing.a, text: editor.value }); });
    editor.addEventListener('blur', function () {
      setTimeout(function () { if (editing && editing.mode !== 'bar' && document.activeElement !== editor && !rootEl.contains(document.activeElement)) commit(0, 0, true); }, 0);
    });
    fbar.addEventListener('focus', function () {
      if (editing && editing.mode !== 'bar') { var v = editor.value; editing.mode = 'bar'; editor.hidden = true; fbar.value = v; return; }
      if (!editing) { if (!startEdit('bar')) return; }
    });
    fbar.addEventListener('keydown', function (e) { if (editing && editing.mode === 'bar') editorKey(e, fbar); });
    fbar.addEventListener('input', function () { if (editing) { editing.point = null; showRefs(); emit('input', { addr: editing.a, text: fbar.value }); } });
    fbar.addEventListener('blur', function () {
      setTimeout(function () { if (editing && editing.mode === 'bar' && document.activeElement !== fbar) commit(0, 0, !rootEl.contains(document.activeElement)); }, 0);
    });

    /* ---------- mouse and touch ---------- */
    function cellAt(x, y) {
      var t = document.elementFromPoint(x, y), td = t && t.closest && t.closest('td.rjs-c');
      return td && table.contains(td) ? { r: +td.dataset.r, c: +td.dataset.c } : null;
    }
    table.addEventListener('pointerdown', function (e) {
      var td = e.target.closest && e.target.closest('td.rjs-c');
      if (!td || e.button > 0) return;
      lastPointer = e.pointerType;
      var r = +td.dataset.r, c = +td.dataset.c;
      if (editing && canPoint() && !(r === editing.r && c === editing.c)) {
        e.preventDefault();
        insertRef(R.A1(r, c)); editing.pc = { r: r, c: c };
        drag = { point: true, start: { r: r, c: c } };
        return;
      }
      touchWasActive = r === act.r && c === act.c && !editing;
      if (editing) commit(0, 0);
      if (e.shiftKey) select(r, c, true); else select(r, c);
      if (e.pointerType === 'mouse') drag = { point: false };
    });
    document.addEventListener('pointermove', function (e) {
      if (fillDrag) return onFillMove(e);
      if (!drag) return;
      var p = cellAt(e.clientX, e.clientY); if (!p) return;
      if (drag.point) {
        if (!editing) return;
        var g = rect(drag.start, p), ref = g.r1 === g.r2 && g.c1 === g.c2 ? R.A1(g.r1, g.c1) : R.rangeText(g);
        insertRef(ref);
      } else if (p.r !== act.r || p.c !== act.c) select(p.r, p.c, true);
    });
    document.addEventListener('pointerup', function (e) { if (fillDrag) onFillUp(e); drag = null; });
    table.addEventListener('click', function (e) {
      var td = e.target.closest && e.target.closest('td.rjs-c');
      if (!td || lastPointer === 'mouse' || editing) return;
      if (touchWasActive) startEdit('edit');
      else if (opts.tapEdit && !sheet.isLocked(R.A1(+td.dataset.r, +td.dataset.c))) startEdit('edit');
    });
    table.addEventListener('dblclick', function (e) {
      var td = e.target.closest && e.target.closest('td.rjs-c');
      if (td && !editing) { select(+td.dataset.r, +td.dataset.c); startEdit('edit'); }
    });
    /* fill handle */
    handle.addEventListener('pointerdown', function (e) {
      e.preventDefault(); e.stopPropagation(); commitIfEditing();
      fillDrag = { src: sel(), target: sel() };
      try { handle.setPointerCapture(e.pointerId); } catch (x) { }
    });
    handle.addEventListener('dblclick', function (e) { e.preventDefault(); fillDownCmd('handle'); });
    function onFillMove(e) {
      var p = cellAt(e.clientX, e.clientY); if (!p) return;
      var s = fillDrag.src, t;
      if (p.r > s.r2 && (p.r - s.r2) >= (p.c - s.c2)) t = { r1: s.r1, c1: s.c1, r2: p.r, c2: s.c2 };
      else if (p.c > s.c2) t = { r1: s.r1, c1: s.c1, r2: s.r2, c2: p.c };
      else t = s;
      fillDrag.target = t;
      var a = cellBox(t.r1, t.c1), b = cellBox(t.r2, t.c2);
      fillBox.hidden = false;
      fillBox.style.left = a.left + 'px'; fillBox.style.top = a.top + 'px';
      fillBox.style.width = (b.left + b.width - a.left) + 'px'; fillBox.style.height = (b.top + b.height - a.top) + 'px';
    }
    function onFillUp() {
      var f = fillDrag; fillDrag = null; fillBox.hidden = true;
      var s = f.src, t = f.target;
      if (t.r2 === s.r2 && t.c2 === s.c2) return;
      doFill('pattern', s, t, 'handle');
    }
    scroll.addEventListener('scroll', function () { if (!tip.hidden) hideTip(); });
    var onResize = function () { placeHandle(); if (editing && editing.mode !== 'bar') { var b = cellBox(editing.r, editing.c); editor.style.left = b.left + 'px'; editor.style.top = b.top + 'px'; } };
    window.addEventListener('resize', onResize);

    /* ---------- download ---------- */
    function download() {
      commitIfEditing();
      var name = (opts.filename ? slug(opts.filename) : slug(sheet.name)) + '.xlsx';
      var bytes = R.toXlsx(sheet, opts.xlsx || {}), blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      var url = URL.createObjectURL(blob), a = el('a', null, { href: url, download: name });
      a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
      say('Downloaded ' + name + '. Open it in Excel to keep working. Your formulas came with it.', 'good');
      emit('download', { filename: name });
      return bytes;
    }

    /* ---------- public controller ---------- */
    function flash(rg, kind) {
      var g = R.parseRange(rg); if (!g) return;
      var cls = 'rjs-flash-' + (kind === 'good' ? 'good' : 'bad'), list = [];
      for (var r = g.r1; r <= Math.min(g.r2, nR); r++) for (var c = g.c1; c <= Math.min(g.c2, nC); c++) { tds[r][c].classList.add(cls); list.push(tds[r][c]); }
      setTimeout(function () { list.forEach(function (td) { td.classList.remove(cls); }); }, 2400);
    }
    api = {
      sheet: sheet, element: rootEl,
      /* the real parts of the grid, so a lesson can point at them */
      parts: function () { return { root: rootEl, bar: bar, addr: addrBox, fx: fx, fbar: fbar, enter: enterBtn, tools: tools, scroll: scroll, table: table, handle: handle, msg: msg, charts: charts, buttons: toolBtns }; },
      colHead: function (c) { return colHeads[typeof c === 'number' ? c : R.colNum(c)]; },
      rowHead: function (r) { return rowHeads[r]; },
      cellEl: function (a) { var p = R.parseA1(a); return p && tds[p.r] ? tds[p.r][p.c] : null; },
      /* position of a cell inside the scrolling grid (scroll content coordinates) */
      cellBox: function (a) { var p = R.parseA1(a); return cellBox(p.r, p.c); },
      scrollTo: function (a) { var p = R.parseA1(a), keep = act; act = { r: p.r, c: p.c }; keepVisible(); act = keep; return api; },
      isEditing: function () { return !!editing; },
      editingCell: function () { return editing ? editing.a : null; },
      editText: function () { return editing ? input().value : null; },
      /* replace the text being typed (used by the show-me demos) */
      setText: function (t) {
        if (!editing) return api;
        var inp = input(); inp.value = t; inp.setSelectionRange(t.length, t.length); editing.point = null;
        if (inp === editor) { syncFromEditor(); autosize(); } showRefs();
        emit('input', { addr: editing.a, text: t, demo: true });
        return api;
      },
      dollar: function () { dollarCmd('api'); return api; },
      fillTo: function (src, target) { var s0 = R.parseRange(src), t0 = R.parseRange(target); return doFill('pattern', s0, t0, 'api'); },
      select: function (a, b) { var p = R.parseA1(a); if (b) { var q = R.parseA1(b); anchor = { r: q.r, c: q.c }; select(p.r, p.c, true); } else select(p.r, p.c); return api; },
      selection: function () { return R.rangeText(sel()); },
      active: function () { return R.A1(act.r, act.c); },
      focus: function () { tds[act.r][act.c].focus(); return api; },
      edit: function (a, text, o) {
        if (a) api.select(a);
        var ok = startEdit(text != null ? 'enter' : 'edit', text, null, null, !!(o && o.force));
        if (ok && o && o.force) editing.force = true;
        if (ok && o && o.via) editing.via = o.via;
        return ok;
      },
      commit: function (dr, dc) { if (editing && arguments.length) editing.via = 'api'; commit(dr || 0, dc || 0); return api; },
      cancel: function () { cancel(); return api; },
      say: function (t, k) { say(t, k); return api; },
      flash: flash,
      fillDown: function (via) { return fillDownCmd(via || 'api'); },
      undo: doUndo, redo: doRedo,
      download: download,
      render: renderAll,
      /* Show a check() result: select the first wrong cell and explain, or celebrate. */
      showCheck: function (res, okText) {
        commitIfEditing();
        tbody.querySelectorAll('.rjs-flash-bad,.rjs-flash-good').forEach(function (td) { td.classList.remove('rjs-flash-bad', 'rjs-flash-good'); });
        if (res.ok) { say(okText || res.message, 'good'); return res; }
        var p = R.parseA1(res.cell); select(p.r, p.c); flash(res.cell, 'bad');
        say(res.message + (res.hint ? ' Hint: ' + res.hint : ''), 'bad');
        return res;
      },
      destroy: function () {
        unsub(); document.removeEventListener('copy', onCopy); document.removeEventListener('paste', onPaste);
        window.removeEventListener('resize', onResize); rootEl.remove();
      }
    };
    renderAll();
    var first = null;
    Object.keys(sheet._cells).forEach(function (a) { if (sheet._cells[a].mark === 'yourturn') { var p = R.parseA1(a); if (!first || p.r < first.r || (p.r === first.r && p.c < first.c)) first = p; } });
    if (opts.start) first = R.parseA1(opts.start);
    if (first) { act = { r: first.r, c: first.c }; anchor = { r: first.r, c: first.c }; }
    renderSel(); keepVisible();
    return api;
  }

  var RJSheetUI = { mount: mount, chartRenderer: null };
  root.RJSheetUI = RJSheetUI;
})(window);
