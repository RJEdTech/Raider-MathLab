/* excel/runner.js: "Excel from zero" for Raider MathLab.
   Routes (#home, #lesson-3, #build-formulas, #build-creditcard, plus -closer / -deep for the other levels),
   remembers finished lessons in localStorage (every access wrapped; the page works without it),
   draws the lesson list, and runs each lesson as a list of one-action steps on a real RJSheetUI grid.
   Lessons live in excel/lessons.js (XL.add) and excel/builds.js (XL.addBuild). */
(function () {
  'use strict';
  var R = window.RJSheet, U = window.RJSheetUI, Coach = window.XLCoach;
  var KEY = 'rjmathlab-excel';
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* private mode: progress is not saved */ } }
  };
  function loadDone() { try { var d = JSON.parse(store.get(KEY + '-done') || '{}'); return d && typeof d === 'object' ? d : {}; } catch (e) { return {}; } }
  function markDone(id) { var d = loadDone(); if (!d[id]) { d[id] = Date.now(); store.set(KEY + '-done', JSON.stringify(d)); } }
  function isDone(id) { return !!loadDone()[id]; }

  var COARSE = false;
  try { COARSE = window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches; } catch (e) { COARSE = false; }
  /* On a touch screen the words say Tap instead of Click. */
  function words(s) { return COARSE ? String(s).replace(/\bClick\b/g, 'Tap').replace(/\bclick\b/g, 'tap').replace(/\bClicking\b/g, 'Tapping').replace(/\bclicking\b/g, 'tapping') : String(s); }
  var CLICK = function () { return COARSE ? 'Tap here' : 'Click here'; };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function norm(t) { return String(t || '').toUpperCase().replace(/\s+/g, '').replace(/\$/g, ''); }
  function money(v) { return R.formatValue(v, 'currency'); }
  function inRange(rg, a) { var g = R.parseRange(rg), p = R.parseA1(a); return !!(g && p && p.r >= g.r1 && p.r <= g.r2 && p.c >= g.c1 && p.c <= g.c2); }
  function covers(big, small) { var a = R.parseRange(big), b = R.parseRange(small); return !!(a && b && a.r1 <= b.r1 && a.c1 <= b.c1 && a.r2 >= b.r2 && a.c2 >= b.c2); }

  var XL = window.XL = {
    lessons: [], byId: {}, builds: [], buildById: {}, words: words, money: money, norm: norm, store: store, isDone: isDone, markDone: markDone, coarse: function () { return COARSE; },
    add: function (l) { XL.lessons.push(l); XL.byId[l.id] = l; },
    addBuild: function (b) { XL.builds.push(b); XL.buildById[b.id] = b; }
  };

  /* ===================== the step machine ===================== */
  function Run(view, flow, opts) {
    this.view = view; this.flow = flow; this.opts = opts || {};
    this.i = -1; this.ctx = { run: this, flow: flow, data: {} };
    this.build();
  }
  var P = Run.prototype;

  P.build = function () {
    var f = this.flow, v = this.view, self = this;
    this.card = el('div', 'xl-card');
    this.prog = el('div', 'xl-prog');
    this.live = el('div', 'xl-live'); this.live.setAttribute('role', 'status'); this.live.setAttribute('aria-live', 'polite');
    this.fb = el('p', 'xl-fb'); this.say = el('div', 'xl-say');
    this.live.appendChild(this.fb); this.live.appendChild(this.say);
    this.extra = el('div', 'xl-extra');
    this.acts = el('div', 'xl-acts');
    this.card.appendChild(this.prog); this.card.appendChild(this.live); this.card.appendChild(this.extra); this.card.appendChild(this.acts);
    v.appendChild(this.card);
    this.stage = el('div', 'xl-stage'); this.host = el('div', 'xl-grid'); this.stage.appendChild(this.host);
    v.appendChild(this.stage);
    this.after = el('div', 'xl-after'); v.appendChild(this.after);
    if (f.sheet) this.mount(); else this.stage.hidden = true;
    this.go(0);
  };
  /* keep=true re-draws the grid around the same sheet (the science track grows the grid once the student picks an analysis) */
  P.mount = function (keep) {
    var f = this.flow, self = this, sd = f.sheet;
    if (this.ui) { this.coach.destroy(); this.ui.destroy(); }
    var sh = keep && this.sheet ? this.sheet : null;
    if (!sh) { sh = R.create({ name: sd.name || f.title, rows: sd.rows || 10, cols: sd.cols || 4, colWidths: sd.widths }); sh.batch(function () { sd.setup(sh, self.ctx); }); }
    this.sheet = sh; this.ctx.sheet = sh;
    var u = f.ui || {}, btns = [];
    (u.buttons || []).forEach(function (b) {
      if (b === 'chart') btns.push({ id: 'chart', label: 'Insert chart', title: 'Make a chart from the selected cells', onClick: function () { self.chartCmd(); } });
      else if (b === 'check') btns.push({ id: 'check', label: 'Check my work', primary: true, onClick: function () { self.checkCmd(); } });
      else btns.push(b);
    });
    this.ui = U.mount(this.host, sh, {
      label: (f.gridLabel || f.title) + ' spreadsheet', filename: f.filename || f.id, tools: u.tools || ['fill', 'dollar', 'undo'],
      download: !!u.download, buttons: btns, enterButton: u.enter !== false, tapEdit: true, start: sd.start || 'A1', maxHeight: sd.maxHeight || '440px',
      xlsx: { marks: false },
      onEvent: function (ev) { self.onEvent(ev); }
    });
    this.ctx.ui = this.ui;
    this.coach = new Coach(this.stage, this.ui); this.ctx.coach = this.coach;
    this.marks = {};
  };
  P.restart = function () { this.ctx.data = {}; this.after.innerHTML = ''; if (this.flow.sheet) this.mount(); this.go(0); };
  P.destroy = function () { this.dead = true; if (this.coach) { this.coach.stopDemo(); this.coach.destroy(); } if (this.ui) this.ui.destroy(); clearTimeout(this.selT); clearTimeout(this.demoT); clearTimeout(this.watchT); };

  P.step = function () { return this.flow.steps[this.i]; };
  P.feedback = function (text, kind) {
    this.fb.innerHTML = text ? words(text) : '';
    this.fb.className = 'xl-fb' + (kind ? ' xl-fb-' + kind : '');
    this.fb.hidden = !text;
  };
  P.text = function (s) { return typeof s === 'function' ? s(this.ctx) : s; };

  /* glow a cell ("Your turn" mark), remembering the mark it had */
  P.glow = function (a, kind) {
    if (!this.sheet || !a) return;
    var g = R.parseRange(a), self = this;
    for (var r = g.r1; r <= g.r2; r++) for (var c = g.c1; c <= g.c2; c++) { var ad = R.A1(r, c); if (!(ad in self.marks)) self.marks[ad] = self.sheet.info(ad).mark; }
    this.sheet.mark(a, kind || 'yourturn');
    this.ui.render();
  };
  P.unglow = function () {
    if (!this.sheet) return;
    var self = this, m = this.marks; this.marks = {};
    Object.keys(m).forEach(function (a) { self.sheet.mark(a, m[a]); });
    if (this.ui) this.ui.render();
  };

  P.go = function (i, carry) {
    var self = this, prev = this.step();
    if (prev && prev.leave) prev.leave(this.ctx);
    clearTimeout(this.selT); clearTimeout(this.demoT); clearTimeout(this.watchT);
    if (this.coach) { this.coach.stopDemo(); this.coach.clearPointer(); this.coach.clearCalls(); }
    this.unglow();
    this.i = i;
    var s = this.step(), n = this.flow.steps.length;
    if (!s) return;
    if (s.skipIf && s.skipIf(this.ctx)) { if (s.after) s.after(this.ctx); return this.go(i + 1, { text: this.text(s.ok) || (carry && carry.text) || '', kind: 'good' }); }
    this.state = {};
    var getting = this.flow.setupSteps && i < this.flow.setupSteps;
    this.prog.innerHTML = '<span>' + (getting ? 'Getting started: step ' + (i + 1) + ' of ' + this.flow.setupSteps : 'Step ' + (i + 1) + ' of ' + n) + '</span><span class="xl-pbar" aria-hidden="true"><i style="width:' + Math.round((i + 1) / n * 100) + '%"></i></span>';
    this.feedback(carry ? carry.text : '', carry ? carry.kind : '');
    this.say.innerHTML = words(this.text(s.say) || '');
    this.extra.innerHTML = ''; this.acts.innerHTML = '';
    if (s.enter) s.enter(this.ctx);
    var K = KINDS[s.kind];
    if (!K) throw new Error('Unknown step kind ' + s.kind);
    if (s.glow) this.glow(s.glow, s.glowKind || 'highlight');
    K.start.call(this, s);
    if (s.callouts && this.coach) {
      var list = s.callouts.slice();
      this.state.showCalls = function () {
        var c = list.shift(); if (!c || self.step() !== s || self.dead) return;
        var t = self.text(c.at);
        if (/^cell:/.test(t)) self.ui.scrollTo(t.slice(5));
        self.coach.callout(t, c.title, words(c.text), { onDismiss: self.state.showCalls });
      };
      /* in a step with a demo, the names appear after the demo, on the parts it just used */
      if (!s.demo) setTimeout(this.state.showCalls, 60);
    }
    if (s.demo && this.coach) {
      this.addBtn(s.demoLabel || 'Show me again', function () { self.playDemo(s, true); }, 'xl-again');
      this.demoT = setTimeout(function () { self.playDemo(s, false); }, Coach.reduced() ? 0 : 650);
    }
    if (s.next) this.addBtn(this.text(s.next), function () { self.advance(); }, 'xl-next primary', true);
    this.afterStart(s);
    /* bring a new instruction into view if it scrolled away (the card does not stick, so it never hides the formula bar) */
    if (this.opts.shown && !(this.ui && this.ui.isEditing())) {
      var cr = this.card.getBoundingClientRect();
      if (cr.top < 0 || cr.top > window.innerHeight - 80) { try { this.card.scrollIntoView({ block: 'start', behavior: Coach.reduced() ? 'auto' : 'smooth' }); } catch (e) { } }
    }
    this.opts.shown = true;
  };
  /* keyboard focus: a step whose action is a button in the card gets that button; otherwise the grid keeps focus.
     Never pull focus out of a cell the student is typing in. */
  P.refocus = function () {
    if (this.dead) return;
    var b = this.extra.querySelector('[data-autofocus]') || this.acts.querySelector('.xl-next');
    var s = this.step();
    if (s && s.noFocus) return;
    if (this.ui && this.ui.isEditing()) return;
    if (b && (!s || s.kind !== 'type')) b.focus({ preventScroll: true });
    else if (this.ui) { var ae = document.activeElement; if (!ae || ae === document.body || this.view.contains(ae)) this.ui.focus(); }
  };
  P.afterStart = function (s) {
    var self = this;
    if (this.opts.started && !(s.demo && !Coach.reduced())) setTimeout(function () { if (self.step() === s) self.refocus(); }, 30);
    this.opts.started = true;
  };
  P.addBtn = function (label, fn, cls, isNext) {
    var b = el('button', 'xl-btn ' + (cls || ''));
    b.type = 'button'; b.textContent = words(label);
    b.addEventListener('click', fn);
    this.acts.appendChild(b); return b;
  };
  P.advance = function (carry) {
    if (this.i + 1 < this.flow.steps.length) this.go(this.i + 1, carry);
  };
  P.success = function (msg) {
    var s = this.step();
    if (s.after) s.after(this.ctx);
    var t = msg || this.text(s.ok) || 'Nice.';
    this.advance({ text: t, kind: 'good' });
  };
  P.playDemo = function (s, again) {
    var self = this;
    if (!this.coach || this.dead) return;
    if (again && s.demoArea) this.sheet.restore(this.state.demoSnap || this.sheet.snapshot(s.demoArea));
    if (!this.state.demoSnap && s.demoArea) this.state.demoSnap = this.sheet.snapshot(s.demoArea);
    if (again && s.demoReset) s.demoReset(this.ctx);
    this.coach.clearPointer();
    var list = this.extra.querySelector('.xl-still');
    if (Coach.reduced() && !list) {
      /* still sequence: the same steps as a numbered list */
      list = el('ol', 'xl-still');
      s.demo.filter(function (a) { return a.say; }).forEach(function (a) { list.appendChild(el('li', null, esc(words(a.say)))); });
      var cap = el('p', 'xl-still-h', 'What the demo does:');
      this.extra.insertBefore(list, this.extra.firstChild); this.extra.insertBefore(cap, list);
    }
    this.coach.demo(s.demo).then(function () {
      if (self.dead || self.step() !== s) return;
      self.state.demoDone = true;
      if (s.afterDemo) s.afterDemo(self.ctx);
      var K = KINDS[s.kind]; if (K.refresh) K.refresh.call(self, s);
      if (self.state.showCalls && !self.state.calledOut) { self.state.calledOut = true; self.state.showCalls(); }
      self.refocus();
    });
  };

  P.onEvent = function (ev) {
    if (this.dead) return;
    var s = this.step(); if (!s) return;
    if (this.coach && this.coach.busy) return;
    var K = KINDS[s.kind];
    /* a part's name fades as soon as the student acts on the grid */
    if ((ev.type === 'select' || ev.type === 'editstart' || ev.type === 'fill' || ev.type === 'dollar') && this.coach && this.state.calledOut !== 'keep') this.coach.clearCalls();
    if (ev.type === 'select' || ev.type === 'editstart' || ev.type === 'commit' || ev.type === 'cancel' || ev.type === 'fill' || ev.type === 'undo') {
      var self = this; requestAnimationFrame(function () { if (self.coach) self.coach.reflow(); });
    }
    /* the lesson's own feedback explains fills and downloads; clear the grid's generic line so nothing is named before it is taught */
    if (ev.type === 'fill' || ev.type === 'download') this.ui.say('');
    if (K.on) K.on.call(this, s, ev);
  };

  /* ---------- toolbar buttons owned by the lesson ---------- */
  P.chartCmd = function () {
    var f = this.flow, sel = this.ui.selection(), spec = f.chart ? f.chart(this.ctx, sel) : null;
    if (typeof spec === 'string') { this.feedback(spec, 'bad'); return; }
    if (!spec) { this.feedback('Select the cells to chart first.', 'bad'); return; }
    this.sheet.charts.length = 0;
    this.sheet.addChart(spec); this.ui.render();
    this.ctx.data.chart = spec;
    this.chartTypes(spec);
    this.stage.classList.add('xl-has-chart');
    if (this.coach) this.coach.reflow();
    var s = this.step();
    if (s && s.kind === 'chart') this.success();
    else this.feedback('Your chart is under the grid. It redraws itself when a number changes.', 'good');
  };
  P.chartTypes = function (spec) {
    var self = this, P2 = this.ui.parts(), box = P2.root.querySelector('.xl-ctype');
    if (!box) { box = el('div', 'xl-ctype'); P2.charts.parentNode.insertBefore(box, P2.charts); }
    var types = this.flow.chartTypes || ['column', 'line'];
    if (types.length < 2) { box.remove(); return; }
    box.innerHTML = '<span class="xl-ctype-l" id="xl-ct-l">Chart type</span>';
    var seg = el('div', 'seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-labelledby', 'xl-ct-l');
    types.forEach(function (t) {
      var b = el('button'); b.type = 'button'; b.textContent = t === 'column' ? 'Column' : t === 'line' ? 'Line' : 'Scatter';
      b.setAttribute('aria-pressed', spec.type === t ? 'true' : 'false');
      b.addEventListener('click', function () { spec.type = t; self.ui.render(); seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); self.onEvent({ type: 'charttype', chartType: t }); });
      seg.appendChild(b);
    });
    box.appendChild(seg);
  };
  P.checkCmd = function () {
    var s = this.step(), f = this.flow;
    var targets = (s && s.kind === 'check' && s.targets) ? s.targets(this.ctx) : f.targets ? f.targets(this.ctx) : [];
    var res = R.check(this.sheet, targets);
    this.ui.showCheck(res, ' ');
    this.ui.say('');
    if (res.ok) {
      if (s && s.kind === 'check') this.success(this.text(s.ok));
      else this.feedback('Everything checks out.', 'good');
    } else {
      this.feedback(friendly(res, this.sheet), 'bad');
      this.pointCell(res.cell, 'Fix this one');
    }
  };
  P.pointCell = function (a, label) { if (!this.coach) return; this.ui.scrollTo(a); this.coach.pointer('cell:' + a, label); };

  /* check() result, plus a hint, in student words */
  function friendly(res, sheet) {
    var m = esc(res.message || '');
    if (res.hint) m += ' <span class="xl-hint">Hint: ' + esc(res.hint) + '</span>';
    return m;
  }
  XL.friendly = friendly;

  /* is the text in the cell ready for Enter? */
  function readyText(t) {
    t = String(t || '');
    if (!t.trim()) return false;
    if (t[0] !== '=') return true;
    if (t.length < 2 || /[(+\-*\/,:^&<>=]\s*$/.test(t)) return false;
    var p = R.parseFormula(t);
    return !p.error;
  }

  /* ===================== step kinds ===================== */
  var KINDS = {};
  /* info: read, then press Next */
  KINDS.info = { start: function (s) { if (!s.next) this.addBtn('Next', this.advance.bind(this), 'xl-next primary'); } };
  /* done: the end of a lesson */
  KINDS.done = {
    start: function (s) {
      var f = this.flow, self = this;
      markDone(f.key || f.id);
      this.prog.innerHTML = '<span>Done</span><span class="xl-pbar" aria-hidden="true"><i style="width:100%"></i></span>';
      if (s.learned) this.extra.appendChild(el('ul', 'xl-learned', s.learned.map(function (x) { return '<li>' + words(x) + '</li>'; }).join('')));
      if (f.nextHref) { var a = el('a', 'xl-btn primary xl-next', esc(f.nextLabel || 'Next lesson')); a.href = f.nextHref; this.acts.appendChild(a); }
      var h = el('a', 'xl-btn', 'All lessons'); h.href = '#home'; this.acts.appendChild(h);
      this.addBtn(f.againLabel || 'Do this lesson again', function () { self.restart(); }, '');
      if (this.opts.onDone) this.opts.onDone();
    }
  };
  /* click: select one cell (or any cell that passes test) */
  KINDS.click = {
    start: function (s) {
      if (s.cell) { this.glow(s.cell, s.cellMark || 'yourturn'); this.ui.scrollTo(s.cell); }
      KINDS.click.refresh.call(this, s);
    },
    refresh: function (s) {
      if (!this.coach || this.coach.busy) return;
      if (s.cell) this.coach.pointer('cell:' + s.cell, s.label || CLICK());
      else if (s.pointAt) this.coach.pointer(this.text(s.pointAt), s.label || CLICK());
    },
    on: function (s, ev) {
      if (ev.type !== 'select') return;
      var a = ev.addr;
      if (s.cell ? a === s.cell : s.test(a)) { this.success(this.text(s.ok)); return; }
      var why = s.wrong ? s.wrong(a, this.ctx) : null;
      this.feedback(why || ('That is ' + a + '. ' + (s.cell ? 'Look for the glowing cell, ' + s.cell + '.' : '')), 'info');
    }
  };
  /* choice: pick one answer */
  KINDS.choice = {
    start: function (s) {
      var self = this, box = el('div', 'xl-choices'); box.setAttribute('role', 'group');
      if (s.cell) { this.glow(s.cell, 'highlight'); this.ui.scrollTo(s.cell); this.coach.pointer('cell:' + s.cell, s.label || 'This one'); }
      s.choices.forEach(function (c, k) {
        var b = el('button', 'xl-choice'); b.type = 'button'; b.innerHTML = c.t;
        if (k === 0) b.setAttribute('data-autofocus', '1');
        b.addEventListener('click', function () {
          if (c.ok) { b.classList.add('xl-right'); self.success(words(c.why || s.ok || 'Right.')); }
          else { b.classList.add('xl-wrong'); b.setAttribute('aria-disabled', 'true'); self.feedback(c.why, 'bad'); }
        });
        box.appendChild(b);
      });
      this.extra.appendChild(box);
    }
  };
  /* type: type into one cell and press Enter; checked with RJSheet.check plus lesson-specific mistakes */
  KINDS.type = {
    start: function (s) {
      this.glow(s.cell, 'yourturn');
      this.ui.scrollTo(s.cell);
      KINDS.type.refresh.call(this, s);
    },
    refresh: function (s) {
      if (!this.coach || this.coach.busy) return;
      var ed = this.ui.isEditing() && this.ui.editingCell() === s.cell;
      if (ed) this.coach.pointer('cell:' + s.cell, readyText(this.ui.editText()) ? 'Press Enter' : 'Type here');
      else if (this.ui.active() === s.cell) this.coach.pointer('cell:' + s.cell, s.typeLabel || 'Type here');
      else this.coach.pointer('cell:' + s.cell, CLICK());
      this.enterGlow(ed && readyText(this.ui.editText()));
    },
    on: function (s, ev) {
      var self = this;
      if (ev.type === 'select' || ev.type === 'editstart' || ev.type === 'cancel') { KINDS.type.refresh.call(this, s); return; }
      if (ev.type === 'input') {
        KINDS.type.refresh.call(this, s);
        var self2 = this;
        (s.inputCallouts || []).forEach(function (ic, k) {
          var key = 'ic' + k;
          if (!self2.state[key] && ic.when(ev.text)) { self2.state[key] = self2.coach.callout(ic.at, ic.title, words(ic.text)); }
        });
        if (s.onInput) s.onInput(this.ctx, ev.text);
        return;
      }
      if (ev.type === 'locked') {
        if (ev.addr !== s.cell) this.feedback(ev.addr + ' holds given data, so it stays the same. This step is about ' + s.cell + ': click the glowing cell.', 'info');
        return;
      }
      if (ev.type !== 'commit') return;
      this.enterGlow(false);
      if (ev.addr !== s.cell) {
        if (ev.changed && !(s.allow && inRange(s.allow, ev.addr))) {
          this.ui.undo();
          this.feedback('That went into ' + ev.addr + ', but this step is about ' + s.cell + '. I took it back out. Click the glowing cell, ' + s.cell + ', and type there.', 'bad');
          this.ui.select(s.cell);
        }
        KINDS.type.refresh.call(this, s);
        return;
      }
      var info = this.sheet.info(s.cell);
      if (info.type === 'blank' && !info.formula) {
        this.feedback(s.cell + ' is still empty. Type first, then press Enter.', 'info');
        this.ui.select(s.cell); KINDS.type.refresh.call(this, s); return;
      }
      var c = { text: info.input, f: norm(info.input), info: info, sheet: this.sheet, value: info.value, ctx: this.ctx };
      var bad = null;
      (s.wrong || []).some(function (w) { if (w.when(c)) { bad = typeof w.msg === 'function' ? w.msg(c) : w.msg; return true; } return false; });
      if (!bad && s.expect) {
        var res = R.check(this.sheet, [Object.assign({ cell: s.cell }, typeof s.expect === 'function' ? s.expect(this.ctx) : s.expect)]);
        if (!res.ok) bad = friendly(res, this.sheet);
      }
      if (!bad && s.test) { var tr = s.test(c); if (tr !== true) bad = tr || (s.cell + ' does not match yet.'); }
      if (bad) {
        this.feedback(bad, 'bad'); this.ui.flash(s.cell, 'bad');
        this.ui.select(s.cell);
        KINDS.type.refresh.call(this, s);
        return;
      }
      this.ui.flash(s.cell, 'good');
      if (s.stay) this.ui.select(s.cell);
      this.success(this.text(s.ok));
    }
  };
  P.enterGlow = function (on) { var e = this.ui && this.ui.parts().enter; if (e) e.classList.toggle('xl-glow', !!on); };
  /* free: type several values; done when test(ctx) is true */
  KINDS.free = {
    start: function (s) {
      if (s.glowRange) this.glow(s.glowRange, 'yourturn');
      var first = s.first ? s.first(this.ctx) : null;
      if (first) { this.ui.scrollTo(first); this.coach.pointer('cell:' + first, this.ui.active() === first ? 'Type here' : CLICK()); }
    },
    on: function (s, ev) {
      if (ev.type === 'commit' && ev.changed && s.allow && !inRange(s.allow, ev.addr)) {
        this.ui.undo(); this.feedback('That went into ' + ev.addr + '. This step uses ' + s.allow + ' only, so I took it back out.', 'bad'); return;
      }
      if (ev.type === 'commit' || ev.type === 'clear' || ev.type === 'paste' || ev.type === 'undo') {
        var r = s.test(this.ctx);
        if (r === true) { this.success(this.text(s.ok)); return; }
        if (r) this.feedback(r, r.indexOf('Type just') >= 0 ? 'bad' : 'info');
      }
      var first = s.first ? s.first(this.ctx) : null;
      if (first) this.coach.pointer('cell:' + first, this.ui.active() === first ? (this.ui.isEditing() ? (readyText(this.ui.editText()) ? 'Press Enter' : 'Type here') : 'Type here') : CLICK());
      else this.coach.clearPointer();
    }
  };
  /* fill: press Fill down (or drag the fill handle) to copy a formula into a range */
  KINDS.fill = {
    start: function (s) { this.glow(s.range, 'highlight'); KINDS.fill.refresh.call(this, s); },
    refresh: function (s) {
      if (!this.coach || this.coach.busy) return;
      var src = s.src, act = this.ui.selection();
      if (s.byColumn) {
        var sg = R.parseRange(src), ag = R.parseRange(act), on = ag.r1 === sg.r1 && ag.r2 === sg.r1 && ag.c1 >= sg.c1 && ag.c2 <= sg.c2;
        if (on) this.coach.pointer('btn:fill', 'Press here'); else this.coach.pointer('cell:' + R.A1(sg.r1, sg.c1), CLICK());
        return;
      }
      if (s.via === 'handle') {
        if (act !== src) this.coach.pointer('cell:' + src, CLICK());
        else this.coach.pointer('handle', COARSE ? 'Drag this down' : 'Drag this down');
      } else if (act !== src && !(s.allowSelect && covers(act, src) && R.parseRange(act).r1 === R.parseA1(src).r)) this.coach.pointer('cell:' + src, CLICK());
      else this.coach.pointer('btn:fill', 'Press here');
    },
    on: function (s, ev) {
      if (ev.type === 'select') { KINDS.fill.refresh.call(this, s); return; }
      if (ev.type === 'commit' && ev.changed && s.lockTyping !== false && !(s.allow && inRange(s.allow, ev.addr))) {
        this.ui.undo(); this.feedback('This step does not need typing. ' + (s.via === 'handle' ? 'Drag the fill handle down from ' + s.src + '.' : 'Click ' + s.src + ', then press Fill down.'), 'info'); KINDS.fill.refresh.call(this, s); return;
      }
      if (ev.type !== 'fill') return;
      var tg = R.parseRange(ev.range), want = R.parseRange(s.range);
      if (s.byColumn) {
        var srcG = R.parseRange(s.src), st = this.state, okCol = tg.r1 === srcG.r1 && tg.c1 >= srcG.c1 && tg.c2 <= srcG.c2;
        if (!okCol) { this.ui.undo(); this.feedback('That filled ' + ev.range + '. This step fills from row ' + srcG.r1 + ', ' + s.src + ', so I undid it.', 'bad'); return; }
        if (tg.r2 < want.r2) { this.feedback('You filled down to ' + R.A1(tg.r2, tg.c2) + '. Keep going: the table ends at row ' + want.r2 + '.', 'info'); return; }
        st.cols = st.cols || {};
        for (var cc = tg.c1; cc <= tg.c2; cc++) st.cols[cc] = true;
        var left = [];
        for (cc = srcG.c1; cc <= srcG.c2; cc++) if (!st.cols[cc]) left.push(R.colName(cc));
        if (left.length) { this.feedback('Column' + (tg.c1 === tg.c2 ? ' ' + R.colName(tg.c1) + ' is' : 's ' + R.colName(tg.c1) + ' to ' + R.colName(tg.c2) + ' are') + ' filled. Now fill column' + (left.length > 1 ? 's ' : ' ') + left.join(' and ') + ' the same way.', 'good'); this.coach.pointer('cell:' + left[0] + srcG.r1, CLICK()); return; }
      } else if (!covers(ev.range, s.src)) { this.ui.undo(); this.feedback('That filled ' + ev.range + '. This step fills from ' + s.src + ', so I undid it. Click ' + s.src + ' first.', 'bad'); KINDS.fill.refresh.call(this, s); return; }
      if (tg.r2 < want.r2) { this.feedback('You filled down to ' + R.A1(tg.r2, tg.c2) + '. Keep going: the table ends at row ' + want.r2 + '.', 'info'); KINDS.fill.refresh.call(this, s); return; }
      if (tg.r2 > want.r2 && s.trim !== false) {
        var extra = R.A1(want.r2 + 1, want.c1) + ':' + R.A1(tg.r2, tg.c2), self = this;
        this.sheet.clear(extra); this.ui.render();
      }
      if (s.targets) {
        var res = R.check(this.sheet, s.targets(this.ctx));
        if (!res.ok) { this.ui.showCheck(res, ' '); this.ui.say(''); this.feedback(s.bad ? s.bad(res, this.ctx) : friendly(res), 'bad'); this.pointCell(res.cell, 'Look here'); if (s.onBad) s.onBad(res, this.ctx); return; }
      }
      var note = s.via === 'handle' && ev.via === 'button' ? ' The Fill down button works too. In Excel, the fill handle works the same way.' : '';
      this.success((this.text(s.ok) || 'Filled.') + note);
    }
  };
  /* dollar: press $ Lock ref (or F4) until the reference reads the wanted way */
  KINDS.dollar = {
    start: function (s) { this.glow(s.cell, 'yourturn'); KINDS.dollar.refresh.call(this, s); },
    refresh: function (s) {
      if (!this.coach || this.coach.busy) return;
      if (this.ui.active() !== s.cell && this.ui.editingCell() !== s.cell) this.coach.pointer('cell:' + s.cell, CLICK());
      else this.coach.pointer(s.key ? 'cell:' + s.cell : 'btn:dollar', s.key ? 'Press F4' : 'Press here');
    },
    on: function (s, ev) {
      if (ev.type === 'select' || ev.type === 'editstart' || ev.type === 'cancel') { KINDS.dollar.refresh.call(this, s); return; }
      if (ev.type === 'input' && s.typing) { KINDS.dollar.refresh.call(this, s); return; }
      if (ev.type === 'commit' && ev.addr === s.cell && s.typing) { KINDS.dollar.refresh.call(this, s); return; }
      if (ev.type !== 'dollar') return;
      var t = String(ev.text).toUpperCase();
      if (t.indexOf(s.want) >= 0 && (!s.whole || norm(t) === norm(s.whole))) { this.success(this.text(s.ok)); return; }
      var plain = s.want.replace(/\$/g, '');
      var m = new RegExp('\\$?' + plain.replace(/(\d)/, '\\$?$1')).exec(t);
      var now = m ? m[0] : plain;
      this.feedback('Now it reads ' + now + '. ' + (now === plain ? 'No $ yet.' : now.indexOf('$') === 0 ? 'Only the column is locked.' : 'Only the row is locked.') + ' Press ' + (ev.via === 'key' ? 'F4' : '$ Lock ref') + ' again until it reads ' + s.want + '.', 'info');
    }
  };
  /* select: select a block of cells */
  KINDS.select = {
    start: function (s) { if (s.glow2) this.glow(s.glow2, 'highlight'); this.coach.pointer('cell:' + s.from, s.label || (COARSE ? 'Tap here' : 'Drag from here')); },
    on: function (s, ev) {
      if (ev.type !== 'select') return;
      var self = this; clearTimeout(this.selT);
      this.selT = setTimeout(function () {
        if (self.dead || self.step() !== s) return;
        var r = s.test(self.ui.selection(), self.ctx);
        if (r === true) self.success(self.text(s.ok));
        else if (r) self.feedback(r, 'info');
      }, 450);
    }
  };
  /* chart: press Insert chart */
  KINDS.chart = {
    start: function (s) { if (s.cell) this.glow(s.cell, 'yourturn'); KINDS.chart.refresh.call(this, s); },
    refresh: function (s) {
      if (s.cell && this.ui.active() !== s.cell) this.coach.pointer('cell:' + s.cell, CLICK());
      else this.coach.pointer('btn:chart', 'Press here');
    },
    on: function (s, ev) { if (ev.type === 'select') KINDS.chart.refresh.call(this, s); }
  };
  /* charttype: switch the chart type */
  KINDS.charttype = {
    start: function (s) {
      var bs = this.ui.parts().root.querySelectorAll('.xl-ctype button'), want = s.want === 'line' ? 'Line' : s.want === 'column' ? 'Column' : 'Scatter';
      for (var i = 0; i < bs.length; i++) if (bs[i].textContent === want) this.coach.pointer(bs[i], 'Press here');
    },
    on: function (s, ev) { if (ev.type === 'charttype' && ev.chartType === s.want) this.success(this.text(s.ok)); }
  };
  /* check: press Check my work */
  KINDS.check = { start: function (s) { this.coach.pointer('btn:check', 'Press here'); } };
  /* download: press Download as Excel file */
  KINDS.download = {
    start: function (s) { this.coach.pointer('btn:download', 'Press here'); },
    on: function (s, ev) { if (ev.type === 'download') { this.ctx.data.downloaded = ev.filename; this.success(this.text(s.ok)); } }
  };
  /* watch: the lesson changes an input for the student, so they see the formula update itself */
  KINDS.watch = {
    start: function (s) {
      var self = this;
      this.addBtn('Watch again', function () { KINDS.watch.play.call(self, s, true); }, 'xl-again');
      this.addBtn(this.text(s.nextLabel) || 'Next', function () { self.advance(); }, 'xl-next primary');
      this.watchT = setTimeout(function () { KINDS.watch.play.call(self, s, false); }, Coach.reduced() ? 0 : 700);
    },
    play: function (s, again) {
      var self = this;
      if (this.coach.busy) return;
      if (again) { this.sheet.batch(function (sh) { s.changes.forEach(function (c) { sh.set(c.cell, c.from); }); }); this.ui.render(); }
      var script = [];
      s.changes.forEach(function (c) { script.push({ click: c.cell, say: 'Click ' + c.cell }); script.push({ type: String(c.typed || c.to), say: 'Type ' + (c.typed || c.to) }); script.push({ enter: true, say: 'Press Enter' }); });
      this.coach.demo(script).then(function () {
        if (self.dead || self.step() !== s) return;
        (s.show || []).forEach(function (a) { self.ui.flash(a, 'good'); });
        if (s.show && s.show[0]) { self.ui.scrollTo(s.show[0]); self.coach.pointer('cell:' + s.show[0], s.showLabel || 'It updated'); }
        /* the result gets its own line, so the message before it (often the check result) stays readable */
        if (s.done) {
          var res = self.extra.querySelector('.xl-watchres');
          if (!res) { res = el('p', 'xl-watchres'); res.setAttribute('role', 'status'); self.extra.appendChild(res); }
          res.innerHTML = '<b>Watch:</b> ' + words(self.text(s.done));
        }
        self.refocus();
      });
    }
  };
  /* gut: a gut guess before the math (Build it) */
  KINDS.gut = {
    start: function (s) {
      var self = this, box = el('div', 'xl-gut'), id = 'xl-gut-' + Math.random().toString(36).slice(2, 7);
      box.innerHTML = '<label for="' + id + '">' + esc(s.label) + '</label><div class="xl-gut-row">' + (s.prefix ? '<span class="xl-gut-pre">' + esc(s.prefix) + '</span>' : '') +
        '<input id="' + id + '" type="text" inputmode="decimal" autocomplete="off" data-autofocus="1">' + (s.suffix ? '<span class="xl-gut-suf">' + esc(s.suffix) + '</span>' : '') + '</div>';
      this.extra.appendChild(box);
      var inp = box.querySelector('input');
      var lock = function () {
        var v = parseFloat(String(inp.value).replace(/[$,\s]/g, ''));
        if (!isFinite(v) || v < 0) { self.feedback('Type a number for your guess. Any guess is fine: it is a gut answer.', 'info'); inp.focus(); return; }
        self.ctx.data.gut = v;
        self.success(self.text(s.ok));
      };
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); lock(); } });
      this.addBtn(s.lockLabel || 'Lock in my guess', lock, 'xl-next primary');
    }
  };
  /* card: rich content (the Open it in Excel card, the Two Excels card) */
  KINDS.card = {
    start: function (s) {
      var box = el('div', 'xl-cardbox'); this.extra.appendChild(box);
      s.render(box, this.ctx);
      if (!s.next) this.addBtn('Next', this.advance.bind(this), 'xl-next primary');
    }
  };

  XL.Run = Run; XL.KINDS = KINDS; XL.readyText = readyText;

  /* ===================== pages ===================== */
  var app, current = null;
  function totalBuildLevels() { var n = 0; XL.builds.forEach(function (b) { n += b.levels.length; }); return n; }
  function homeView() {
    var v = el('section', 'xl-home'), done = loadDone();
    var first = XL.lessons[0], nextL = null;
    XL.lessons.forEach(function (l) { if (!nextL && !done[l.id]) nextL = l; });
    var anyDone = XL.lessons.some(function (l) { return done[l.id]; });
    var head = el('div', 'home-head');
    head.innerHTML = '<h2>Excel from zero</h2><p class="lede">You have never opened a spreadsheet? Start here. One small step at a time, you learn what a cell is, type your first formula, and by the end you build a real budget and open it in Excel.</p>';
    v.appendChild(head);
    var start = el('div', 'xl-start');
    start.innerHTML = '<p class="xl-badge">Start here</p><h3>Lesson 1: ' + esc(first.title) + '</h3><p>' + esc(words(first.blurb)) + ' No Excel needed yet: everything happens right on this page.</p>';
    var sb = el('a', 'xl-big', done[first.id] ? 'Start lesson 1 again' : 'Start'); sb.href = '#' + first.id; sb.setAttribute('aria-label', (done[first.id] ? 'Start lesson 1 again: ' : 'Start lesson 1: ') + first.title);
    start.appendChild(sb);
    if (anyDone && nextL && nextL !== first) { var kb = el('a', 'xl-btn xl-keep', 'Keep going: lesson ' + nextL.n + ', ' + esc(nextL.title)); kb.href = '#' + nextL.id; start.appendChild(kb); }
    v.appendChild(start);
    var nDone = XL.lessons.filter(function (l) { return done[l.id]; }).length;
    var h = el('h3', 'xl-group-h', 'Spreadsheet basics <span class="xl-count">' + nDone + ' of ' + XL.lessons.length + ' done</span>'); v.appendChild(h);
    v.appendChild(el('p', 'xl-group-p', 'Twelve short lessons, in order. Each one stands on its own, so you can come back to any of them.'));
    var ol = el('ol', 'xl-list');
    XL.lessons.forEach(function (l) {
      var li = el('li', 'xl-item' + (done[l.id] ? ' xl-done' : '') + (l === first ? ' xl-first' : ''));
      li.innerHTML = '<a href="#' + l.id + '"><span class="xl-n" aria-hidden="true">' + (done[l.id] ? '✓' : l.n) + '</span><span class="xl-t"><b>' + (l === first ? '<span class="xl-tag">Start here</span> ' : '') + esc(l.title) + '</b><small>' + esc(words(l.blurb)) + '</small></span>' +
        '<span class="xl-sr">' + (done[l.id] ? 'Done. ' : '') + 'Lesson ' + l.n + '</span></a>';
      ol.appendChild(li);
    });
    v.appendChild(ol);
    var bd = 0; XL.builds.forEach(function (b) { b.levels.forEach(function (lv) { if (done[b.id + '-' + lv.key]) bd++; }); });
    v.appendChild(el('h3', 'xl-group-h', 'Build it <span class="xl-count">' + bd + ' of ' + totalBuildLevels() + ' done</span>'));
    v.appendChild(el('p', 'xl-group-p', 'Real models from MathLab tools. Guess first, build the sheet, check it against the model, then download it and finish in Excel. Big picture walks you through every step; Deep dive starts from a mostly blank sheet.'));
    var bl = el('div', 'xl-builds');
    XL.builds.forEach(function (b) {
      var c = el('div', 'xl-build');
      c.innerHTML = '<h4>' + esc(b.title) + '</h4><p>' + esc(b.blurb) + '</p>';
      var row = el('div', 'xl-lvls');
      b.levels.forEach(function (lv, k) {
        var a = el('a', 'xl-lvl' + (done[b.id + '-' + lv.key] ? ' xl-done' : ''), (done[b.id + '-' + lv.key] ? '✓ ' : '') + esc(lv.name));
        a.href = '#' + b.id + (k ? '-' + lv.key : ''); a.setAttribute('aria-label', b.title + ': ' + lv.name + (done[b.id + '-' + lv.key] ? ', done' : ''));
        row.appendChild(a);
      });
      c.appendChild(row); bl.appendChild(c);
    });
    v.appendChild(bl);
    if (XL.analyze) v.appendChild(XL.analyze.homeBlock(done));
    return v;
  }
  function lessonView(l) {
    var v = el('section', 'xl-view'), k = XL.lessons.indexOf(l), prev = XL.lessons[k - 1], next = XL.lessons[k + 1];
    v.appendChild(el('p', 'xl-crumb', '<a href="#home">← All lessons</a>'));
    v.appendChild(el('p', 'xl-kicker', 'Lesson ' + l.n + ' of ' + XL.lessons.length + ' · Spreadsheet basics' + (isDone(l.id) ? ' · <span class="xl-donetag">Done</span>' : '')));
    v.appendChild(el('h2', 'xl-title', esc(l.title)));
    if (l.scenario) v.appendChild(el('p', 'xl-scen', words(l.scenario)));
    var flow = Object.assign({}, l, { key: l.id, nextHref: next ? '#' + next.id : (XL.builds[0] ? '#' + XL.builds[0].id : '#home'), nextLabel: next ? 'Next: lesson ' + next.n + ', ' + next.title : 'Next: Build it' });
    var body = el('div', 'xl-body'); v.appendChild(body);
    var pager = el('nav', 'xl-pager'); pager.setAttribute('aria-label', 'Lessons');
    pager.innerHTML = (prev ? '<a href="#' + prev.id + '">← Lesson ' + prev.n + '</a>' : '<span></span>') + (next ? '<a href="#' + next.id + '">Lesson ' + next.n + ' →</a>' : '<a href="#' + (XL.builds[0] ? XL.builds[0].id : 'home') + '">Build it →</a>');
    v.appendChild(pager);
    return { v: v, body: body, flow: flow };
  }
  function buildView(b, lvKey) {
    var v = el('section', 'xl-view'), lv = b.levels.filter(function (x) { return x.key === lvKey; })[0] || b.levels[0];
    v.appendChild(el('p', 'xl-crumb', '<a href="#home">← All lessons</a>'));
    v.appendChild(el('p', 'xl-kicker', 'Build it · ' + esc(b.tool) + (isDone(b.id + '-' + lv.key) ? ' · <span class="xl-donetag">Done</span>' : '')));
    v.appendChild(el('h2', 'xl-title', esc(b.title)));
    var nav = el('div', 'xl-lvlbar');
    nav.innerHTML = '<span class="lvl-l" id="xl-lv-l">Level</span>';
    var seg = el('div', 'seg'); seg.setAttribute('role', 'group'); seg.setAttribute('aria-labelledby', 'xl-lv-l');
    b.levels.forEach(function (x, k) {
      var a = el('a', null, esc(x.name)); a.href = '#' + b.id + (k ? '-' + x.key : '');
      a.setAttribute('aria-current', x === lv ? 'page' : 'false'); a.title = x.hint || '';
      seg.appendChild(a);
    });
    nav.appendChild(seg); v.appendChild(nav);
    v.appendChild(el('p', 'xl-scen', words(lv.problem || b.problem)));
    var body = el('div', 'xl-body'); v.appendChild(body);
    var li = b.levels.indexOf(lv), nextLv = b.levels[li + 1], bi = XL.builds.indexOf(b), nextB = XL.builds[bi + 1];
    var flow = Object.assign({ title: b.title + ': ' + lv.name, filename: b.filename + (li ? '-' + lv.key : '') },
      lv, { id: b.id + '-' + lv.key, key: b.id + '-' + lv.key, level: lv.key, nextHref: nextLv ? '#' + b.id + '-' + nextLv.key : nextB ? '#' + nextB.id : '#home', nextLabel: nextLv ? 'Next: ' + nextLv.name : nextB ? 'Next: ' + nextB.title : 'All lessons' });
    var pager = el('nav', 'xl-pager'); pager.setAttribute('aria-label', 'Build it');
    pager.innerHTML = '<a href="#lesson-11">Need help opening the file? Lesson 11</a>' + (nextLv ? '<a href="' + flow.nextHref + '">' + esc(nextLv.name) + ' →</a>' : nextB ? '<a href="#' + nextB.id + '">' + esc(nextB.title) + ' →</a>' : '<span></span>');
    v.appendChild(pager);
    return { v: v, body: body, flow: flow };
  }
  function route() {
    var h = (location.hash || '').replace(/^#/, '') || 'home', m;
    if (current) { current.destroy(); current = null; }
    app.innerHTML = '';
    var made = null;
    if ((m = /^lesson-(\d+)$/.exec(h)) && XL.byId[h]) made = lessonView(XL.byId[h]);
    else if ((m = /^(build-[a-z]+?)(?:-(closer|deep|big))?$/.exec(h)) && XL.buildById[m[1]]) made = buildView(XL.buildById[m[1]], m[2] || 'big');
    else if (/^analyze(?:$|[-=])/.test(h) && XL.analyze) made = XL.analyze.route(h);
    if (made) {
      app.appendChild(made.v);
      if (made.flow) current = new Run(made.body, made.flow, {});
      document.title = (made.flow ? made.flow.title : made.title) + ' | Excel from zero | Raider MathLab';
      window.scrollTo(0, 0);
      var h2 = made.v.querySelector('h2'); if (h2) { h2.tabIndex = -1; h2.focus({ preventScroll: true }); }
    } else {
      app.appendChild(homeView());
      document.title = 'Excel from zero | Raider MathLab';
      if (h !== 'home' && h) { /* unknown hash: show the list */ }
    }
    XL.current = current;
    /* like the MathLab home: the Raider Labs nav and the site back link show on the lesson list only */
    document.body.classList.toggle('xl-inlesson', !!made);
  }
  XL.start = function (root) {
    app = root;
    window.addEventListener('hashchange', route);
    route();
  };
})();
