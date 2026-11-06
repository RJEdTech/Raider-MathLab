/* excel/coach.js: the first-timer layer that sits on top of an RJSheetUI grid.
   - pointer(target, text): a short label ("Click here", "Type here", "Press Enter") on a cell or a part
   - callout(target, title, text): names a part of the grid once, on the real part; fades when dismissed
   - demo(script): the "show me" animation: a cursor moves, clicks, types and presses Enter on the real grid
   Targets: 'cell:B4', 'col:B', 'row:3', 'addr' (Name Box), 'fbar', 'enter', 'handle', 'editor', 'btn:<id>'
   (btn ids: fill, dollar, undo, download, or a lesson button id like chart / check).
   Respects prefers-reduced-motion: demos then apply at once and the steps show as a still list. */
(function () {
  'use strict';
  var RM = false;
  try { RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { RM = false; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }

  function Coach(stage, ui) {
    this.stage = stage; this.ui = ui; this.busy = false; this.stopped = false;
    this.layer = el('div', 'xl-layer'); this.layer.setAttribute('aria-hidden', 'true');
    stage.appendChild(this.layer);
    this.calls = el('div', 'xl-calls'); stage.appendChild(this.calls);
    this.ptr = null; this.ptrTarget = null; this.cur = null; this.callList = [];
    var self = this;
    this._re = function () { self.reflow(); };
    /* a note never gets in the way of a drag or a click on the grid: it goes as soon as the student presses there */
    this._pd = function () { self.clearCalls(); };
    ui.parts().scroll.addEventListener('pointerdown', this._pd, true);
    window.addEventListener('resize', this._re);
    ui.parts().scroll.addEventListener('scroll', this._re);
    this._ro = window.ResizeObserver ? new ResizeObserver(this._re) : null;
    if (this._ro) this._ro.observe(stage);
  }
  Coach.reduced = function () { return RM; };
  Coach.setReduced = function (v) { RM = !!v; };
  var C = Coach.prototype;

  /* find the element for a target name */
  C.find = function (t) {
    var ui = this.ui, P = ui.parts(), m;
    if (!t) return null;
    if (t.nodeType) return t;
    if ((m = /^cell:(.+)$/.exec(t))) return ui.cellEl(m[1]);
    if ((m = /^col:(.+)$/.exec(t))) return ui.colHead(m[1]);
    if ((m = /^row:(\d+)$/.exec(t))) return ui.rowHead(+m[1]);
    if ((m = /^btn:(.+)$/.exec(t))) return P.buttons[m[1]] || null;
    if (t === 'addr') return P.addr;
    if (t === 'fbar') return P.fbar;
    if (t === 'enter') return P.enter;
    if (t === 'handle') return P.handle.hidden ? null : P.handle;
    if (t === 'editor') return P.root.querySelector('.rjs-editor:not([hidden])') || P.fbar;
    if (t === 'chart') return P.charts.firstChild;
    return null;
  };
  /* rectangle of an element inside the stage; visible=false when a cell is scrolled out of the grid's view */
  C.rect = function (t) {
    var e = this.find(t); if (!e) return null;
    var s = this.stage.getBoundingClientRect(), r = e.getBoundingClientRect(), vis = true;
    if (/^cell:|^handle$/.test(typeof t === 'string' ? t : '')) {
      var sc = this.ui.parts().scroll.getBoundingClientRect(), head = this.ui.parts().table.tHead.getBoundingClientRect().height, rh = this.ui.rowHead(1).getBoundingClientRect().width;
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      vis = cx > sc.left + rh - 2 && cx < sc.right && cy > sc.top + head - 2 && cy < sc.bottom;
    }
    if (!r.width && !r.height) vis = false;
    return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height, visible: vis };
  };

  /* ---------- pointer label ---------- */
  C.pointer = function (target, text) {
    if (!target) { this.clearPointer(); return; }
    if (!this.ptr) { this.ptr = el('div', 'xl-ptr'); this.ptr.appendChild(el('span', 'xl-ptr-t')); this.layer.appendChild(this.ptr); }
    this.ptrTarget = target; this.ptr.firstChild.textContent = text;
    this.ptr.hidden = false; this.placePointer();
  };
  C.clearPointer = function () { this.ptrTarget = null; if (this.ptr) this.ptr.hidden = true; };
  C.placePointer = function () {
    if (!this.ptr || !this.ptrTarget) return;
    var r = this.rect(this.ptrTarget);
    if (!r || !r.visible) { this.ptr.style.visibility = 'hidden'; return; }
    this.ptr.style.visibility = '';
    var p = this.ptr, pw = p.offsetWidth, ph = p.offsetHeight, W = this.stage.clientWidth;
    var below = r.top - ph - 10 < 0 || (typeof this.ptrTarget === 'string' && /^cell:[A-Z]+[12]$/.test(this.ptrTarget) && r.top - ph - 10 < 34);
    var x = Math.max(4, Math.min(W - pw - 4, r.left + r.width / 2 - pw / 2));
    var y = below ? r.top + r.height + 9 : r.top - ph - 9;
    p.classList.toggle('xl-below', below);
    p.style.left = x + 'px'; p.style.top = y + 'px';
    p.style.setProperty('--ax', Math.max(12, Math.min(pw - 12, r.left + r.width / 2 - x)) + 'px');
  };

  /* ---------- callouts that name a part ---------- */
  C.callout = function (target, title, text, o) {
    o = o || {};
    var self = this, box = el('div', 'xl-call');
    box.setAttribute('role', 'note');
    var h = el('p', 'xl-call-h', title), b = el('p', 'xl-call-b', text), ok = el('button', 'xl-call-ok', 'Got it');
    ok.type = 'button';
    box.appendChild(h); box.appendChild(b); box.appendChild(ok);
    var item = { box: box, target: target };
    ok.addEventListener('click', function () { self.dismiss(item); if (o.onDismiss) o.onDismiss(); });
    this.calls.appendChild(box); this.callList.push(item);
    this.placeCall(item);
    requestAnimationFrame(function () { box.classList.add('xl-in'); });
    return item;
  };
  C.dismiss = function (item) {
    var i = this.callList.indexOf(item); if (i < 0) return;
    this.callList.splice(i, 1);
    item.box.classList.remove('xl-in'); item.box.classList.add('xl-out');
    var b = item.box; setTimeout(function () { b.remove(); }, RM ? 0 : 400);
  };
  C.clearCalls = function () { this.callList.slice().forEach(this.dismiss, this); };
  C.placeCall = function (item) {
    var r = this.rect(item.target), box = item.box, W = this.stage.clientWidth;
    if (!r || !r.visible) { box.style.visibility = 'hidden'; return; }
    box.style.visibility = '';
    var bw = Math.min(290, W - 16); box.style.width = bw + 'px';
    var bh = box.offsetHeight;
    /* prefer the side that does not cover the pointer label: below for headers and bar parts, above or below cells */
    var spaceAbove = r.top, spaceBelow = this.stage.clientHeight - (r.top + r.height);
    var below = item.below != null ? item.below : (spaceAbove < bh + 14 || spaceBelow > bh + 14);
    var x = Math.max(8, Math.min(W - bw - 8, r.left + r.width / 2 - bw / 2));
    var y = below ? r.top + r.height + 12 : r.top - bh - 12;
    box.classList.toggle('xl-below', below);
    box.style.left = x + 'px'; box.style.top = Math.max(0, y) + 'px';
    box.style.setProperty('--ax', Math.max(14, Math.min(bw - 14, r.left + r.width / 2 - x)) + 'px');
  };
  C.reflow = function () { this.placePointer(); this.callList.forEach(this.placeCall, this); if (this.cur && this.curAt) this.moveCursor(this.curAt, true); };

  /* ---------- the show-me demo ---------- */
  C.cursor = function () {
    if (!this.cur) {
      this.cur = el('div', 'xl-cursor');
      this.cur.innerHTML = '<svg viewBox="0 0 24 30" width="26" height="32" aria-hidden="true"><path d="M3 2 L3 24 L9 18.5 L13 28 L17 26.3 L13 17 L21 17 Z" fill="#fff" stroke="#1c1c1f" stroke-width="2" stroke-linejoin="round"/></svg>';
      this.layer.appendChild(this.cur);
      this.cap = el('div', 'xl-cap'); this.layer.appendChild(this.cap);
    }
    return this.cur;
  };
  C.moveCursor = function (t, now) {
    var r = this.rect(t); if (!r) return;
    this.curAt = t;
    var x = r.left + Math.min(r.width * 0.55, r.width - 6), y = r.top + r.height * 0.55;
    var c = this.cursor();
    c.style.transition = now || RM ? 'none' : '';
    c.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    this.cap.style.transform = 'translate(' + Math.max(4, Math.min(this.stage.clientWidth - 200, x + 22)) + 'px,' + (y + 26) + 'px)';
  };
  C.caption = function (text) { this.cursor(); this.cap.textContent = text; this.cap.hidden = !text; };
  C.click = function () { var c = this.cursor(); c.classList.remove('xl-clk'); void c.offsetWidth; c.classList.add('xl-clk'); };
  C.stopDemo = function () { this.stopped = true; };
  C.endDemo = function () {
    this.busy = false; this.curAt = null;
    if (this.cur) { this.cur.remove(); this.cap.remove(); this.cur = null; this.cap = null; }
    this.stage.classList.remove('xl-demoing');
  };
  /* script: [{click:'B4', say:'Click B4'}, {type:'=B2+B3', say:'Type =B2+B3'}, {enter:true, say:'Press Enter'},
              {press:'fill', say:'Press Fill down'}, {dollar:true}, {drag:{from:'F2', to:'F6'}}, {select:['A1','B6']}, {wait:600}, {run: fn}] */
  C.demo = async function (script, o) {
    o = o || {};
    var self = this, ui = this.ui, reduced = RM || o.instant;
    this.busy = true; this.stopped = false;
    this.stage.classList.add('xl-demoing');
    this.clearPointer();
    var typing = null;
    try {
      for (var i = 0; i < script.length; i++) {
        if (this.stopped) break;
        var a = script[i];
        if (!reduced && a.say) this.caption(a.say);
        if (a.click) {
          ui.scrollTo(a.click);
          if (!reduced) { this.moveCursor('cell:' + a.click); await wait(700); this.click(); await wait(180); }
          ui.select(a.click); typing = a.click;
          if (!reduced) await wait(350);
        } else if (a.select) {
          if (!reduced) { this.moveCursor('cell:' + a.select[0]); await wait(650); this.click(); }
          ui.select(a.select[0]);
          if (!reduced) { await wait(250); this.moveCursor('cell:' + a.select[1]); await wait(700); }
          ui.select(a.select[0], a.select[1]);
          if (!reduced) await wait(400);
        } else if (a.type != null) {
          var cell = a.cell || typing || ui.active();
          if (!ui.isEditing()) ui.edit(cell, '', { force: true });
          if (reduced) ui.setText(a.type);
          else {
            for (var k = 1; k <= a.type.length; k++) { if (this.stopped) break; ui.setText(a.type.slice(0, k)); await wait(a.type[k - 1] === '=' ? 420 : 120); }
            await wait(450);
          }
        } else if (a.enter) {
          if (!reduced) { this.moveCursor(ui.parts().enter ? 'enter' : 'fbar'); await wait(650); this.click(); await wait(200); }
          ui.commit(1, 0);
          if (!reduced) await wait(700);
        } else if (a.press) {
          if (!reduced) { this.moveCursor('btn:' + a.press); await wait(750); this.click(); await wait(200); }
          if (a.press === 'fill') ui.fillDown('demo'); else if (a.press === 'dollar') ui.dollar(); else if (a.fn) a.fn();
          if (!reduced) await wait(800);
        } else if (a.dollar) {
          if (!reduced) { this.moveCursor('btn:dollar'); await wait(700); this.click(); await wait(200); }
          ui.dollar();
          if (!reduced) await wait(700);
        } else if (a.drag) {
          var fromBox = null;
          ui.select(a.drag.from);
          if (!reduced) {
            await wait(200); this.moveCursor('handle'); await wait(750); this.click();
            fromBox = this.ghostBox(a.drag.from, a.drag.from);
            var g = RJSheet.parseRange(a.drag.from + ':' + a.drag.to);
            for (var rr = g.r1 + 1; rr <= g.r2; rr++) { var ad = RJSheet.A1(rr, g.c2); this.moveCursor('cell:' + ad); this.ghostBox(a.drag.from, ad, fromBox); await wait(260); }
            await wait(500);
          }
          if (fromBox) fromBox.remove();
          if (a.drag.apply) ui.fillTo(a.drag.from, a.drag.from + ':' + a.drag.to);
          if (!reduced) await wait(600);
        } else if (a.cancel) { if (ui.isEditing()) ui.cancel();
        } else if (a.wait) { if (!reduced) await wait(a.wait); }
        if (a.run) a.run();
      }
    } finally {
      if (ui.isEditing() && !o.keepEditing) ui.commit(0, 0);
      this.endDemo();
    }
  };
  /* a dashed box over a block of cells (the fill handle preview) */
  C.ghostBox = function (a, b, box) {
    var r1 = this.rect('cell:' + a), r2 = this.rect('cell:' + b);
    if (!r1 || !r2) return box;
    if (!box) { box = el('div', 'xl-ghost'); this.layer.appendChild(box); }
    box.style.left = r1.left + 'px'; box.style.top = r1.top + 'px';
    box.style.width = (r2.left + r2.width - r1.left) + 'px'; box.style.height = (r2.top + r2.height - r1.top) + 'px';
    return box;
  };
  C.destroy = function () {
    this.stopped = true;
    window.removeEventListener('resize', this._re);
    if (this._ro) this._ro.disconnect();
    try { this.ui.parts().scroll.removeEventListener('scroll', this._re); } catch (e) { }
    this.layer.remove(); this.calls.remove();
  };
  window.XLCoach = Coach;
})();
