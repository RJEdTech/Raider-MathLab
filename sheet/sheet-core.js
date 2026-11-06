/* sheet-core.js: RJSheet, a small Excel-correct spreadsheet engine for Raider MathLab
   and the Raider Labs science sites. Pure logic, no DOM.
   Browser: window.RJSheet.  Node: module.exports.
   Sections: errors, addresses, numbers, tokenizer, parser, functions, evaluator,
   sheet (cells, recalculation, fill/copy), formats, check(), loadTable(), chart data,
   toXlsx() with a store-method ZIP writer. */
(function (root) {
  'use strict';

  var MAXR = 1048576, MAXC = 16384;

  /* ===================== error values ===================== */
  function XErr(code) { this.code = code; }
  XErr.prototype.toString = function () { return this.code; };
  var ERR = {};
  ['#DIV/0!', '#VALUE!', '#REF!', '#NAME?', '#NUM!', '#N/A', '#NULL!', '#CIRC!', '#ERROR!'].forEach(function (c) { ERR[c] = new XErr(c); });
  var DIV0 = ERR['#DIV/0!'], VALUE = ERR['#VALUE!'], NAME = ERR['#NAME?'], NUM = ERR['#NUM!'], NA = ERR['#N/A'],
    CIRC = ERR['#CIRC!'], PERR = ERR['#ERROR!'];
  function isErr(v) { return v instanceof XErr; }

  /* Plain-language explanations for students. */
  var EXPLAIN = {
    '#DIV/0!': 'This formula divides by zero or by an empty cell. Check the cell you divide by. For AVERAGE, SLOPE and STDEV.S, check that the range holds enough numbers.',
    '#VALUE!': 'This formula tries to do math with something that is not a number, like a word. Check that every cell it uses holds a number.',
    '#REF!': 'This formula points to a cell that does not exist. That happens when a reference moves off the edge of the sheet during a fill or paste.',
    '#NAME?': 'Excel does not recognize a word in this formula. Check the spelling of the function name, use * to multiply (not x), and put text inside double quotes.',
    '#NUM!': 'The math has no answer here, like the square root of a negative number, or the result is too big to store.',
    '#N/A': 'A value is not available. For SLOPE, INTERCEPT, RSQ, CORREL and FORECAST, both ranges must hold the same number of cells.',
    '#NULL!': 'Two ranges in this formula do not overlap. Use a comma between ranges.',
    '#CIRC!': 'This formula uses its own answer, either directly or through other cells. Excel calls this a circular reference. Change the formula so it does not point back to this cell.',
    '#ERROR!': 'Excel would not accept this formula as written.'
  };
  function explain(code) { return EXPLAIN[code && code.code ? code.code : code] || ''; }

  /* ===================== addresses ===================== */
  function colName(c) { var s = ''; while (c > 0) { var m = (c - 1) % 26; s = String.fromCharCode(65 + m) + s; c = (c - 1 - m) / 26; } return s; }
  function colNum(s) { s = String(s).toUpperCase(); var n = 0; for (var i = 0; i < s.length; i++) n = n * 26 + (s.charCodeAt(i) - 64); return n; }
  function A1(r, c) { return colName(c) + r; }
  function parseA1(a) {
    var m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(String(a).trim()); if (!m) return null;
    var c = colNum(m[1]), r = +m[2]; if (r < 1 || r > MAXR || c > MAXC) return null; return { r: r, c: c };
  }
  function parseRange(s) {
    if (s && typeof s === 'object' && s.r1) return s;
    var p = String(s).trim().split(':'), a, b;
    if (p.length === 1) { a = parseA1(p[0]); return a && { r1: a.r, c1: a.c, r2: a.r, c2: a.c }; }
    if (p.length !== 2) return null; a = parseA1(p[0]); b = parseA1(p[1]); if (!a || !b) return null;
    return { r1: Math.min(a.r, b.r), c1: Math.min(a.c, b.c), r2: Math.max(a.r, b.r), c2: Math.max(a.c, b.c) };
  }
  function rangeText(g) { var a = A1(g.r1, g.c1), b = A1(g.r2, g.c2); return a === b ? a : a + ':' + b; }
  function eachCell(g, fn) { for (var r = g.r1; r <= g.r2; r++) for (var c = g.c1; c <= g.c2; c++) fn(r, c, A1(r, c)); }
  function inRange(g, r, c) { return r >= g.r1 && r <= g.r2 && c >= g.c1 && c <= g.c2; }

  /* ===================== numbers ===================== */
  function shiftDec(x, k) { if (x === 0) return 0; var p = x.toExponential().split('e'); return +(p[0] + 'e' + (+p[1] + k)); }
  function r15(x) { return x === 0 || !isFinite(x) ? x : +x.toPrecision(15); }
  /* mode 'half' = Excel ROUND (half away from zero), 'up' = ROUNDUP (away from zero), 'down' = ROUNDDOWN (toward zero) */
  function roundMode(x, d, mode) {
    if (x === 0 || !isFinite(x)) return x;
    var s = x < 0 ? -1 : 1, a = r15(Math.abs(x)), y = shiftDec(a, d), z;
    z = mode === 'half' ? Math.floor(y + 0.5) : mode === 'up' ? Math.ceil(y) : Math.floor(y);
    var out = z === 0 ? 0 : shiftDec(z, -d) * s;
    return out === 0 ? 0 : out;
  }
  function fin(r) { return typeof r === 'number' ? (isFinite(r) ? (r === 0 ? 0 : r) : NUM) : r; }
  /* Excel's text form of a number (15 significant digits). */
  function numText(x) {
    if (x === 0) return '0';
    var s = String(r15(x)), m = /^(-?[\d.]+)e([+-])(\d+)$/.exec(s);
    if (m) s = m[1] + 'E' + m[2] + (m[3].length < 2 ? '0' : '') + m[3];
    return s;
  }
  var NUMRE = /^([+-])?\s*(\$)?\s*([+-])?((?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?\s*(%)?$/;
  /* Parse text the way Excel reads a typed number: 12, -3.5, 1e3, .5, 1,200, $12.50, 8% */
  function parseNumText(s) {
    var m = NUMRE.exec(String(s).trim()); if (!m) return null;
    if ((m[1] && m[3]) || (m[2] && m[6])) return null;
    var body = m[4].replace(/,/g, ''), v = +(body + (m[5] ? 'e' + m[5] : '')), dec = (body.split('.')[1] || '').length, fmt = null;
    if (!isFinite(v)) return null;
    if (m[1] === '-' || m[3] === '-') v = -v;
    if (m[6]) { v = shiftDec(v, -2); fmt = { type: 'percent', dp: dec ? 2 : 0 }; }
    else if (m[2]) fmt = { type: 'currency', dp: 2 };
    return { v: v === 0 ? 0 : v, fmt: fmt };
  }

  /* ===================== tokenizer ===================== */
  function PErr(msg, eofParen) { this.message = msg; this.eofParen = !!eofParen; }
  var ERR_LIT = /^#(DIV\/0!|VALUE!|REF!|NAME\?|NUM!|N\/A|NULL!)/i;
  function mkRef(dc, col, dr, row) {
    var c = colNum(col), r = +row; if (c > MAXC || r < 1 || r > MAXR) return null;
    return { r: r, c: c, ac: !!dc, ar: !!dr };
  }
  function refStr(x) { return (x.ac ? '$' : '') + colName(x.c) + (x.ar ? '$' : '') + x.r; }
  function colStr(x) { return (x.ac ? '$' : '') + colName(x.c); }
  /* Tokenize formula text (without the leading =). Every token keeps start/end offsets so the UI can find a ref at the caret. */
  function tokenize(src) {
    var toks = [], i = 0, m, s, a, b;
    function push(t, text, extra) { var k = { t: t, text: text, start: i, end: i + text.length }; if (extra) for (var p in extra) k[p] = extra[p]; toks.push(k); i += text.length; }
    while (i < src.length) {
      s = src.slice(i); var ch = s[0];
      if (/\s/.test(ch)) { push('ws', /^\s+/.exec(s)[0]); continue; }
      if (ch === '"') {
        var j = 1, out = '';
        for (;;) {
          if (j >= s.length) throw new PErr('A piece of text is missing its closing double quote (").');
          if (s[j] === '"') { if (s[j + 1] === '"') { out += '"'; j += 2; continue; } break; }
          out += s[j++];
        }
        push('str', s.slice(0, j + 1), { v: out }); continue;
      }
      if (ch === '#') {
        m = ERR_LIT.exec(s); if (!m) throw new PErr('A # sign only belongs in an error value like #N/A.');
        push('err', m[0], { v: m[0].toUpperCase() }); continue;
      }
      if (/[0-9.]/.test(ch)) {
        m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s); if (!m) throw new PErr('A decimal point needs a digit next to it, like 0.5.');
        push('num', m[0], { v: +m[0] }); continue;
      }
      if (/[A-Za-z_$]/.test(ch)) {
        if ((m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+):(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_.(])/.exec(s)) &&
          (a = mkRef(m[1], m[2], m[3], m[4])) && (b = mkRef(m[5], m[6], m[7], m[8]))) { push('range', m[0], { a: a, b: b }); continue; }
        if ((m = /^(\$?)([A-Za-z]{1,3}):(\$?)([A-Za-z]{1,3})(?![A-Za-z0-9_.(])/.exec(s)) && colNum(m[2]) <= MAXC && colNum(m[4]) <= MAXC) {
          push('cols', m[0], { a: { c: colNum(m[2]), ac: !!m[1] }, b: { c: colNum(m[4]), ac: !!m[3] } }); continue;
        }
        if ((m = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_.(])/.exec(s)) && (a = mkRef(m[1], m[2], m[3], m[4]))) { push('ref', m[0], { ref: a }); continue; }
        m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(s);
        if (!m) throw new PErr('A $ sign belongs inside a cell reference, like $B$2.');
        if (/^\s*\(/.test(s.slice(m[0].length))) push('func', m[0], { name: m[0].toUpperCase() });
        else if (/^(TRUE|FALSE)$/i.test(m[0])) push('bool', m[0], { v: m[0].toUpperCase() === 'TRUE' });
        else push('name', m[0]);
        continue;
      }
      if ((m = /^(<=|>=|<>)/.exec(s))) { push('op', m[0]); continue; }
      if ('+-*/^&=<>%'.indexOf(ch) >= 0) { push('op', ch); continue; }
      if (ch === '(') { push('lp', ch); continue; }
      if (ch === ')') { push('rp', ch); continue; }
      if (ch === ',') { push('comma', ch); continue; }
      if (ch === ':') throw new PErr('Write a range as two cells joined by a colon, like A1:B5, with no spaces.');
      if (ch === ';') throw new PErr('Separate the values inside a function with commas, not semicolons.');
      if (ch === '{') throw new PErr('Curly-brace lists are not available here. Put the numbers in cells and use a range like A1:A5.');
      throw new PErr('Excel does not understand the character "' + ch + '" in a formula.');
    }
    return toks;
  }
  function tokText(k) {
    switch (k.t) {
      case 'ref': return refStr(k.ref);
      case 'range': return refStr(k.a) + ':' + refStr(k.b);
      case 'cols': return colStr(k.a) + ':' + colStr(k.b);
      case 'func': return k.name;
      case 'bool': return k.v ? 'TRUE' : 'FALSE';
      case 'err': return k.v;
      default: return k.text;
    }
  }

  /* ===================== parser ===================== */
  /* Excel precedence, lowest first: comparison, &, + -, * /, ^, %, unary - +.
     Unary minus binds tighter than ^, so =-2^2 is 4. ^ is left-associative, so =2^3^2 is 64. */
  var LEVELS = [['=', '<>', '<', '>', '<=', '>='], ['&'], ['+', '-'], ['*', '/'], ['^']];
  function Parser(toks) { this.t = toks.filter(function (x) { return x.t !== 'ws'; }); this.i = 0; this.refs = []; this.ranges = []; this.fns = []; }
  Parser.prototype.peek = function () { return this.t[this.i]; };
  Parser.prototype.next = function () { return this.t[this.i++]; };
  Parser.prototype.isOp = function (ops) { var k = this.t[this.i]; return !!k && k.t === 'op' && ops.indexOf(k.text) >= 0; };
  Parser.prototype.level = function (n) {
    if (n === LEVELS.length) return this.pct();
    var x = this.level(n + 1);
    while (this.isOp(LEVELS[n])) { var op = this.next().text; x = { t: 'bin', op: op, a: x, b: this.level(n + 1) }; }
    return x;
  };
  Parser.prototype.pct = function () { var x = this.unary(); while (this.isOp(['%'])) { this.next(); x = { t: 'pct', a: x }; } return x; };
  Parser.prototype.unary = function () {
    if (this.isOp(['+', '-'])) { var op = this.next().text; return { t: op === '-' ? 'neg' : 'pos', a: this.unary() }; }
    return this.primary();
  };
  Parser.prototype.primary = function () {
    var k = this.next();
    if (!k) throw new PErr('The formula ends too soon. Add a number or a cell after the last sign.');
    switch (k.t) {
      case 'num': return { t: 'num', v: k.v };
      case 'str': return { t: 'str', v: k.v };
      case 'bool': return { t: 'bool', v: k.v };
      case 'err': return { t: 'err', v: k.v };
      case 'name': return { t: 'name', name: k.text };
      case 'ref': this.refs.push(k.ref); return { t: 'ref', r: k.ref.r, c: k.ref.c };
      case 'range': {
        var g = { r1: Math.min(k.a.r, k.b.r), c1: Math.min(k.a.c, k.b.c), r2: Math.max(k.a.r, k.b.r), c2: Math.max(k.a.c, k.b.c) };
        this.ranges.push(g); return { t: 'range', r1: g.r1, c1: g.c1, r2: g.r2, c2: g.c2 };
      }
      case 'cols': {
        var h = { r1: 1, r2: MAXR, c1: Math.min(k.a.c, k.b.c), c2: Math.max(k.a.c, k.b.c), cols: true };
        this.ranges.push(h); return { t: 'range', r1: 1, r2: MAXR, c1: h.c1, c2: h.c2, cols: true };
      }
      case 'lp': {
        var e = this.level(0), z = this.next();
        if (!z) throw new PErr('A ( is missing its closing ).', true);
        if (z.t !== 'rp') throw new PErr('Excel expected a ) before "' + z.text + '".');
        return e;
      }
      case 'func': return this.call(k);
      default:
        if (k.t === 'rp') throw new PErr('There is an extra ) or a missing value before a ).');
        if (k.t === 'comma') throw new PErr('A comma only belongs inside a function, between its values.');
        throw new PErr('Excel did not expect "' + k.text + '" here. Put a number or a cell between two signs.');
    }
  };
  Parser.prototype.call = function (k) {
    var name = k.name, spec = FN[name], args = [];
    this.next(); // the (
    if (this.peek() && this.peek().t === 'rp') this.next();
    else {
      for (;;) {
        var p = this.peek();
        if (!p) throw new PErr(name + '( is missing its closing ).', true);
        args.push(p.t === 'comma' || p.t === 'rp' ? { t: 'missing' } : this.level(0));
        var z = this.next();
        if (!z) throw new PErr(name + '( is missing its closing ).', true);
        if (z.t === 'comma') continue;
        if (z.t === 'rp') break;
        throw new PErr('Inside ' + name + '( ), put a comma between values. Excel did not expect "' + z.text + '".');
      }
    }
    if (spec) {
      var ex = ' Example: =' + spec.ex;
      if (spec.max === 0 && args.length) throw new PErr(name + ' takes no values. Write ' + name + '() with nothing inside.');
      if (spec.min === spec.max && args.length !== spec.min) throw new PErr(name + ' needs exactly ' + spec.min + (spec.min === 1 ? ' value' : ' values, separated by commas,') + ' inside its parentheses.' + ex);
      if (args.length < spec.min) throw new PErr(name + ' needs at least ' + spec.min + (spec.min === 1 ? ' value' : ' values') + ' inside its parentheses.' + ex);
      if (args.length > spec.max) throw new PErr(name + ' takes at most ' + spec.max + ' values.' + ex);
    }
    this.fns.push(name);
    return { t: 'fn', name: name, args: args, spec: spec || null };
  };
  /* Parse "=..." into {ast, refs, ranges, text(normalized)} or {error}. Like Excel, adds missing closing parentheses. */
  function parseFormula(text) {
    var body = String(text).replace(/^\s*=/, ''), toks, ast, p, fixes = 0;
    for (;;) {
      try {
        toks = tokenize(body); p = new Parser(toks);
        if (!p.t.length) throw new PErr('Type something after the = sign, like =B2*B3.');
        ast = p.level(0);
        if (p.peek()) {
          var x = p.peek();
          throw new PErr(x.t === 'rp' ? 'This formula has an extra ). Remove it or add a ( where it belongs.' :
            'Excel expected a sign like + or * before "' + x.text + '". Use * to multiply.');
        }
        break;
      } catch (e) {
        if (!(e instanceof PErr)) throw e;
        if (e.eofParen && fixes < 30) { body += ')'; fixes++; continue; }
        return { error: e.message, text: '=' + String(text).replace(/^\s*=/, '') };
      }
    }
    return { ast: ast, refs: p.refs, ranges: p.ranges, fns: p.fns, text: '=' + toks.map(tokText).join(''), fixed: fixes > 0 };
  }
  /* Shift relative parts of every reference by (dr, dc), like Excel's fill and paste. Off-sheet refs become #REF!. */
  function shiftFormula(text, dr, dc) {
    var body = String(text).replace(/^\s*=/, ''), toks;
    try { toks = tokenize(body); } catch (e) { return text; }
    function sh(x) { var r = x.ar ? x.r : x.r + dr, c = x.ac ? x.c : x.c + dc; if (r < 1 || r > MAXR || c < 1 || c > MAXC) return null; return { r: r, c: c, ar: x.ar, ac: x.ac }; }
    function shc(x) { var c = x.ac ? x.c : x.c + dc; if (c < 1 || c > MAXC) return null; return { c: c, ac: x.ac }; }
    return '=' + toks.map(function (k) {
      if (k.t === 'ref') { var a = sh(k.ref); return a ? refStr(a) : '#REF!'; }
      if (k.t === 'range') { var x = sh(k.a), y = sh(k.b); return x && y ? refStr(x) + ':' + refStr(y) : '#REF!'; }
      if (k.t === 'cols') { var p = shc(k.a), q = shc(k.b); return p && q ? colStr(p) + ':' + colStr(q) : '#REF!'; }
      return tokText(k);
    }).join('');
  }

  /* ===================== values and coercion ===================== */
  function Rng(sh, r1, c1, r2, c2, cols) {
    this.sh = sh; this.r1 = r1; this.c1 = c1; this.c2 = c2;
    this.r2 = cols ? Math.max(r1, Math.min(r2, sh._maxRow || 1)) : r2;
  }
  Rng.prototype.nrows = function () { return this.r2 - this.r1 + 1; };
  Rng.prototype.ncols = function () { return this.c2 - this.c1 + 1; };
  Rng.prototype.values = function () {
    var out = [];
    for (var r = this.r1; r <= this.r2; r++) for (var c = this.c1; c <= this.c2; c++) out.push(this.sh._val(r, c));
    return out;
  };
  function sv(x) { if (x instanceof Rng) return x.r1 === x.r2 && x.c1 === x.c2 ? x.sh._val(x.r1, x.c1) : VALUE; return x; }
  function toNum(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'string') { var p = parseNumText(v); return p ? p.v : VALUE; }
    return v; // error
  }
  function toText(v) {
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return numText(v);
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    return v;
  }
  function toBool(v) {
    if (v === null || v === undefined) return false;
    if (typeof v === 'boolean') return v;
    if (typeof v === 'number') return v !== 0;
    if (typeof v === 'string') { var u = v.toUpperCase(); return u === 'TRUE' ? true : u === 'FALSE' ? false : VALUE; }
    return v;
  }
  function rank(v) { return typeof v === 'number' ? 1 : typeof v === 'string' ? 2 : 3; }
  function cmpVals(a, b) {
    if (isErr(a)) return a; if (isErr(b)) return b;
    if (a === null) a = typeof b === 'string' ? '' : typeof b === 'boolean' ? false : 0;
    if (b === null) b = typeof a === 'string' ? '' : typeof a === 'boolean' ? false : 0;
    var ta = rank(a), tb = rank(b);
    if (ta !== tb) return ta < tb ? -1 : 1;
    if (ta === 1) { a = r15(a); b = r15(b); } else if (ta === 2) { a = a.toLowerCase(); b = b.toLowerCase(); } else { a = +a; b = +b; }
    return a < b ? -1 : a > b ? 1 : 0;
  }
  function power(a, b) {
    if (a === 0 && b === 0) return NUM;
    if (a === 0 && b < 0) return DIV0;
    if (a < 0 && b !== Math.floor(b)) return NUM;
    return fin(Math.pow(a, b));
  }
  function arith(op, a, b) {
    a = toNum(a); if (isErr(a)) return a; b = toNum(b); if (isErr(b)) return b;
    var r;
    switch (op) {
      case '+': case '-':
        r = op === '+' ? a + b : a - b;
        /* Excel snaps a sum or difference that is only floating-point noise to 0 (=0.5-0.4-0.1 shows 0). */
        if (r !== 0 && Math.abs(r) < 1e-15 * Math.max(Math.abs(a), Math.abs(b))) r = 0;
        break;
      case '*': r = a * b; break;
      case '/': if (b === 0) return DIV0; r = a / b; break;
      case '^': return power(a, b);
    }
    return fin(r);
  }

  /* ===================== evaluator ===================== */
  function ev(n, cx) {
    switch (n.t) {
      case 'num': case 'str': case 'bool': return n.v;
      case 'err': return ERR[n.v];
      case 'missing': return null;
      case 'name': return NAME;
      case 'ref': return new Rng(cx.sh, n.r, n.c, n.r, n.c);
      case 'range': return new Rng(cx.sh, n.r1, n.c1, n.r2, n.c2, n.cols);
      case 'neg': { var v = toNum(sv(ev(n.a, cx))); return isErr(v) ? v : (v === 0 ? 0 : -v); }
      case 'pos': return sv(ev(n.a, cx));
      case 'pct': { var p = toNum(sv(ev(n.a, cx))); return isErr(p) ? p : p / 100; }
      case 'bin': {
        var a = sv(ev(n.a, cx)), b = sv(ev(n.b, cx));
        if (n.op === '&') { a = toText(a); if (isErr(a)) return a; b = toText(b); if (isErr(b)) return b; return a + b; }
        if ('+-*/^'.indexOf(n.op) >= 0) return arith(n.op, a, b);
        var c = cmpVals(a, b); if (isErr(c)) return c;
        switch (n.op) { case '=': return c === 0; case '<>': return c !== 0; case '<': return c < 0; case '>': return c > 0; case '<=': return c <= 0; default: return c >= 0; }
      }
      case 'fn': {
        if (!n.spec) return NAME;
        if (n.spec.lazy) return n.spec.fn(n.args, cx);
        var args = [];
        for (var i = 0; i < n.args.length; i++) args.push(ev(n.args[i], cx));
        return fin(n.spec.fn(args, cx));
      }
    }
    return VALUE;
  }

  /* ===================== functions ===================== */
  var FN = {};
  function def(names, min, max, ex, fn, lazy) { names.split(' ').forEach(function (nm) { FN[nm] = { name: nm, min: min, max: max, ex: ex, fn: fn, lazy: !!lazy }; }); }
  function num1(a) { return toNum(sv(a)); }
  function flat(x) { if (x instanceof Rng) return { vals: x.values(), ref: true, rows: x.nrows(), cols: x.ncols(), rng: x }; return { vals: [x], ref: false, rows: 1, cols: 1 }; }
  /* Numbers for SUM/AVERAGE/MIN/MAX/MEDIAN/STDEV: references skip text, TRUE/FALSE and blanks; values typed into the
     function count (TRUE is 1, "3" is 3, other text is #VALUE!). Errors propagate. */
  function collect(args) {
    var out = [];
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a instanceof Rng) {
        var vs = a.values();
        for (var j = 0; j < vs.length; j++) { var v = vs[j]; if (isErr(v)) return v; if (typeof v === 'number') out.push(v); }
      } else { if (isErr(a)) return a; var n = toNum(a); if (isErr(n)) return n; out.push(n); }
    }
    return out;
  }
  function wrap1(f) { return function (args) { var x = num1(args[0]); return isErr(x) ? x : f(x); }; }
  function wrap2(f) { return function (args) { var x = num1(args[0]); if (isErr(x)) return x; var y = num1(args[1]); return isErr(y) ? y : f(x, y); }; }
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function mean(a) { return sum(a) / a.length; }
  function sqDev(a) { var m = mean(a), s = 0; for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m); return s; }

  def('SUM', 1, 255, 'SUM(B2:B6)', function (args) { var a = collect(args); return isErr(a) ? a : sum(a); });
  def('AVERAGE', 1, 255, 'AVERAGE(B2:B6)', function (args) { var a = collect(args); return isErr(a) ? a : a.length ? mean(a) : DIV0; });
  def('MIN', 1, 255, 'MIN(B2:B6)', function (args) { var a = collect(args); return isErr(a) ? a : a.length ? Math.min.apply(null, a) : 0; });
  def('MAX', 1, 255, 'MAX(B2:B6)', function (args) { var a = collect(args); return isErr(a) ? a : a.length ? Math.max.apply(null, a) : 0; });
  def('MEDIAN', 1, 255, 'MEDIAN(B2:B6)', function (args) {
    var a = collect(args); if (isErr(a)) return a; if (!a.length) return NUM;
    a.sort(function (x, y) { return x - y; }); var h = a.length >> 1;
    return a.length % 2 ? a[h] : (a[h - 1] + a[h]) / 2;
  });
  def('STDEV.S STDEV', 1, 255, 'STDEV.S(B2:B6)', function (args) { var a = collect(args); if (isErr(a)) return a; return a.length < 2 ? DIV0 : Math.sqrt(sqDev(a) / (a.length - 1)); });
  def('STDEV.P', 1, 255, 'STDEV.P(B2:B6)', function (args) { var a = collect(args); if (isErr(a)) return a; return a.length < 1 ? DIV0 : Math.sqrt(sqDev(a) / a.length); });
  def('COUNT', 1, 255, 'COUNT(B2:B6)', function (args) {
    var n = 0;
    args.forEach(function (a) {
      if (a instanceof Rng) a.values().forEach(function (v) { if (typeof v === 'number') n++; });
      else if (typeof a === 'number' || typeof a === 'boolean' || a === null || (typeof a === 'string' && parseNumText(a))) n++;
    });
    return n;
  });
  def('COUNTA', 1, 255, 'COUNTA(A2:A6)', function (args) {
    var n = 0;
    args.forEach(function (a) { if (a instanceof Rng) a.values().forEach(function (v) { if (v !== null) n++; }); else n++; });
    return n;
  });
  function rounder(mode) {
    return function (args) {
      var x = num1(args[0]); if (isErr(x)) return x; var d = num1(args[1]); if (isErr(d)) return d;
      return roundMode(x, d < 0 ? Math.ceil(d) : Math.floor(d), mode);
    };
  }
  def('ROUND', 2, 2, 'ROUND(B4, 2)', rounder('half'));
  def('ROUNDUP', 2, 2, 'ROUNDUP(B4, 0)', rounder('up'));
  def('ROUNDDOWN', 2, 2, 'ROUNDDOWN(B4, 0)', rounder('down'));
  def('ABS', 1, 1, 'ABS(B2-B3)', wrap1(Math.abs));
  def('SQRT', 1, 1, 'SQRT(B2)', wrap1(function (x) { return x < 0 ? NUM : Math.sqrt(x); }));
  def('POWER', 2, 2, 'POWER(B2, 2)', wrap2(power));
  def('EXP', 1, 1, 'EXP(1)', wrap1(Math.exp));
  def('LN', 1, 1, 'LN(B2)', wrap1(function (x) { return x <= 0 ? NUM : Math.log(x); }));
  def('LOG10', 1, 1, 'LOG10(B2)', wrap1(function (x) { return x <= 0 ? NUM : Math.log10(x); }));
  def('LOG', 1, 2, 'LOG(8, 2)', function (args) {
    var x = num1(args[0]); if (isErr(x)) return x;
    var b = args.length > 1 && args[1] !== null ? num1(args[1]) : 10; if (isErr(b)) return b;
    if (x <= 0 || b <= 0) return NUM; if (b === 1) return DIV0;
    var r = b === 10 ? Math.log10(x) : b === 2 ? Math.log2(x) : Math.log(x) / Math.log(b), k = Math.round(r);
    return Math.abs(r - k) < 1e-14 * Math.max(1, Math.abs(k)) ? k : r;
  });
  def('PI', 0, 0, 'PI()', function () { return Math.PI; });
  def('SIN', 1, 1, 'SIN(RADIANS(30))', wrap1(Math.sin));
  def('COS', 1, 1, 'COS(RADIANS(60))', wrap1(Math.cos));
  def('TAN', 1, 1, 'TAN(RADIANS(45))', wrap1(Math.tan));
  def('ASIN', 1, 1, 'ASIN(0.5)', wrap1(function (x) { return x < -1 || x > 1 ? NUM : Math.asin(x); }));
  def('ACOS', 1, 1, 'ACOS(0.5)', wrap1(function (x) { return x < -1 || x > 1 ? NUM : Math.acos(x); }));
  def('ATAN', 1, 1, 'ATAN(1)', wrap1(Math.atan));
  def('RADIANS', 1, 1, 'RADIANS(180)', wrap1(function (x) { return x * Math.PI / 180; }));
  def('DEGREES', 1, 1, 'DEGREES(PI())', wrap1(function (x) { return x * 180 / Math.PI; }));
  def('INT', 1, 1, 'INT(B2)', wrap1(Math.floor));
  def('MOD', 2, 2, 'MOD(B2, 2)', wrap2(function (n, d) {
    if (d === 0) return DIV0;
    var r = n - d * Math.floor(n / d);
    if (Math.abs(r) < 1e-15 * Math.abs(n) || Math.abs(r - d) < 1e-15 * Math.abs(n)) r = 0;
    return r;
  }));
  def('IF', 2, 3, 'IF(B2>10, "big", "small")', function (a, cx) {
    var c = toBool(sv(ev(a[0], cx))); if (isErr(c)) return c;
    if (c) return a[1].t === 'missing' ? 0 : ev(a[1], cx);
    if (a.length < 3) return false;
    return a[2].t === 'missing' ? 0 : ev(a[2], cx);
  }, true);
  function logicals(args) {
    var out = [];
    for (var i = 0; i < args.length; i++) {
      var a = args[i];
      if (a instanceof Rng) {
        var vs = a.values();
        for (var j = 0; j < vs.length; j++) { var v = vs[j]; if (isErr(v)) return v; if (typeof v === 'boolean') out.push(v); else if (typeof v === 'number') out.push(v !== 0); }
      } else { var b = toBool(a); if (isErr(b)) return b; out.push(b); }
    }
    return out.length ? out : VALUE;
  }
  def('AND', 1, 255, 'AND(B2>0, B3>0)', function (args) { var l = logicals(args); return isErr(l) ? l : l.every(Boolean); });
  def('OR', 1, 255, 'OR(B2>0, B3>0)', function (args) { var l = logicals(args); return isErr(l) ? l : l.some(Boolean); });
  def('NOT', 1, 1, 'NOT(B2>0)', function (args) { var b = toBool(sv(args[0])); return isErr(b) ? b : !b; });

  /* COUNTIF-style criteria: 5, ">5", "<=2", "<>0", "apple", "a*" (wildcards * ? ~), "" (blank). */
  function wild(pat) {
    var re = '';
    for (var i = 0; i < pat.length; i++) {
      var ch = pat[i];
      if (ch === '~' && i + 1 < pat.length && '*?~'.indexOf(pat[i + 1]) >= 0) { re += '\\' + pat[++i]; continue; }
      re += ch === '*' ? '[\\s\\S]*' : ch === '?' ? '[\\s\\S]' : ch.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    }
    return new RegExp('^' + re + '$', 'i');
  }
  function numIs(v, n) {
    if (typeof v === 'number') return r15(v) === r15(n);
    if (typeof v === 'string') { var p = parseNumText(v); return !!p && r15(p.v) === r15(n); }
    return false;
  }
  function cmpOp(op, c) { return op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0; }
  function makeCrit(c) {
    if (isErr(c)) return function (v) { return v === c; };
    if (c === null) c = 0; // a blank criteria cell counts as 0, as in Excel
    if (typeof c === 'number') return function (v) { return numIs(v, c); };
    if (typeof c === 'boolean') return function (v) { return v === c; };
    var m = /^(<=|>=|<>|<|>|=)?([\s\S]*)$/.exec(c), op = m[1] || '=', rest = m[2], n = parseNumText(rest), u = rest.toUpperCase();
    if (n) {
      var x = n.v;
      if (op === '=') return function (v) { return numIs(v, x); };
      if (op === '<>') return function (v) { return !numIs(v, x); };
      return function (v) { return typeof v === 'number' && cmpOp(op, r15(v) < r15(x) ? -1 : r15(v) > r15(x) ? 1 : 0); };
    }
    if (u === 'TRUE' || u === 'FALSE') {
      var b = u === 'TRUE';
      if (op === '=') return function (v) { return v === b; };
      if (op === '<>') return function (v) { return v !== b; };
      return function (v) { return typeof v === 'boolean' && cmpOp(op, +v - +b); };
    }
    if (ERR[u] && ERR_LIT.test(u)) { var e = ERR[u]; return op === '<>' ? function (v) { return v !== e; } : function (v) { return v === e; }; }
    if (rest === '') {
      if (op === '=') return function (v) { return v === null || v === ''; };
      if (op === '<>') return function (v) { return v !== null && v !== ''; };
    }
    if (op === '=' || op === '<>') {
      var re = wild(rest), neg = op === '<>';
      return function (v) { var hit = typeof v === 'string' && re.test(v); return neg ? !hit : hit; };
    }
    var lo = rest.toLowerCase();
    return function (v) { if (typeof v !== 'string') return false; var t = v.toLowerCase(); return cmpOp(op, t < lo ? -1 : t > lo ? 1 : 0); };
  }
  function resized(r, base) { return new Rng(base.sh, r.r1, r.c1, r.r1 + base.nrows() - 1, r.c1 + base.ncols() - 1); }
  function ifAgg(args, kind) {
    var rg = args[0]; if (!(rg instanceof Rng)) return VALUE;
    var crit = sv(args[1]), test = makeCrit(crit), vals = rg.values();
    var tgt = args.length > 2 && args[2] !== null ? args[2] : rg;
    if (!(tgt instanceof Rng)) return VALUE;
    var tv = resized(tgt, rg).values(), s = 0, n = 0;
    for (var i = 0; i < vals.length; i++) {
      if (!test(vals[i])) continue;
      if (kind === 'count') { n++; continue; }
      var v = tv[i]; if (isErr(v)) return v; if (typeof v === 'number') { s += v; n++; }
    }
    return kind === 'count' ? n : kind === 'sum' ? s : n ? s / n : DIV0;
  }
  def('COUNTIF', 2, 2, 'COUNTIF(B2:B6, ">5")', function (a) { return ifAgg(a, 'count'); });
  def('SUMIF', 2, 3, 'SUMIF(A2:A6, ">5", B2:B6)', function (a) { return ifAgg(a, 'sum'); });
  def('AVERAGEIF', 2, 3, 'AVERAGEIF(A2:A6, ">5", B2:B6)', function (a) { return ifAgg(a, 'avg'); });
  def('SUMPRODUCT', 1, 255, 'SUMPRODUCT(B2:B6, C2:C6)', function (args) {
    var arrs = args.map(flat), rows = arrs[0].rows, cols = arrs[0].cols, s = 0;
    for (var k = 0; k < arrs.length; k++) { if (arrs[k].rows !== rows || arrs[k].cols !== cols) return VALUE; if (!arrs[k].ref && isErr(arrs[k].vals[0])) return arrs[k].vals[0]; }
    for (var i = 0; i < arrs[0].vals.length; i++) {
      var p = 1;
      for (var j = 0; j < arrs.length; j++) { var v = arrs[j].vals[i]; if (isErr(v)) return v; p *= typeof v === 'number' ? v : 0; }
      s += p;
    }
    return s;
  });
  /* Paired statistics: pairs where both cells hold numbers count; text, blanks and TRUE/FALSE drop the pair.
     Different numbers of cells give #N/A; fewer than 2 points or no spread give #DIV/0!. */
  function pairs(ya, xa) {
    var y = flat(ya).vals, x = flat(xa).vals, xs = [], ys = [];
    if (y.length !== x.length || !y.length) return NA;
    for (var i = 0; i < y.length; i++) {
      if (isErr(y[i])) return y[i]; if (isErr(x[i])) return x[i];
      if (typeof y[i] === 'number' && typeof x[i] === 'number') { xs.push(x[i]); ys.push(y[i]); }
    }
    return { x: xs, y: ys };
  }
  function linreg(p) {
    var n = p.x.length; if (n < 2) return null;
    var xm = mean(p.x), ym = mean(p.y), sxx = 0, syy = 0, sxy = 0;
    for (var i = 0; i < n; i++) { var dx = p.x[i] - xm, dy = p.y[i] - ym; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; }
    return { xm: xm, ym: ym, sxx: sxx, syy: syy, sxy: sxy, n: n };
  }
  function stat2(kind) {
    return function (args) {
      var p = pairs(args[0], args[1]); if (isErr(p)) return p;
      var L = linreg(p); if (!L || L.sxx === 0) return DIV0;
      if (kind === 'slope') return L.sxy / L.sxx;
      if (kind === 'intercept') return L.ym - (L.sxy / L.sxx) * L.xm;
      if (L.syy === 0) return DIV0;
      var r = L.sxy / Math.sqrt(L.sxx * L.syy);
      return kind === 'rsq' ? r * r : r;
    };
  }
  def('SLOPE', 2, 2, 'SLOPE(B2:B6, A2:A6)', stat2('slope'));
  def('INTERCEPT', 2, 2, 'INTERCEPT(B2:B6, A2:A6)', stat2('intercept'));
  def('RSQ', 2, 2, 'RSQ(B2:B6, A2:A6)', stat2('rsq'));
  def('CORREL', 2, 2, 'CORREL(A2:A6, B2:B6)', stat2('correl'));
  def('FORECAST.LINEAR FORECAST', 3, 3, 'FORECAST.LINEAR(10, B2:B6, A2:A6)', function (args) {
    var x = num1(args[0]); if (isErr(x)) return x;
    var p = pairs(args[1], args[2]); if (isErr(p)) return p;
    var L = linreg(p); if (!L || L.sxx === 0) return DIV0;
    var m = L.sxy / L.sxx; return L.ym - m * L.xm + m * x;
  });
  /* Functions saved with an _xlfn. prefix inside .xlsx files (added to Excel after 2007). */
  var XLFN = { 'STDEV.S': 1, 'STDEV.P': 1, 'FORECAST.LINEAR': 1 };

  /* ===================== formats ===================== */
  function normFmt(f) {
    if (!f) return null;
    if (typeof f === 'string') {
      var m = /^(general|currency|percent|fixed|number)(?::(\d+))?$/.exec(f.trim().toLowerCase()); if (!m) return null;
      f = { type: m[1], dp: m[2] !== undefined ? +m[2] : undefined };
    }
    var t = f.type === 'number' ? 'fixed' : f.type;
    if (t !== 'currency' && t !== 'percent' && t !== 'fixed') return null;
    var dp = f.dp != null ? Math.max(0, Math.min(10, f.dp | 0)) : (t === 'percent' ? 0 : 2);
    return { type: t, dp: dp, comma: !!f.comma };
  }
  function group(s) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); return p.join('.'); }
  function fixedStr(x, dp, comma) {
    var y = roundMode(x, dp, 'half'), s = Math.abs(y).toFixed(dp);
    if (comma) s = group(s);
    return (y < 0 ? '-' : '') + s;
  }
  /* Excel "General" in a standard-width column: at most 11 characters, then scientific (1.23457E+11). */
  function general(x) {
    if (x === 0) return '0';
    var neg = x < 0, a = Math.abs(x), w = 11 - (neg ? 1 : 0), s;
    function sci() {
      var md = Math.max(0, w - 6), t = a.toExponential(md).split('e'), mant = t[0];
      if (mant.indexOf('.') >= 0) mant = mant.replace(/0+$/, '').replace(/\.$/, '');
      var ex = +t[1]; return (neg ? '-' : '') + mant + 'E' + (ex < 0 ? '-' : '+') + (Math.abs(ex) < 10 ? '0' : '') + Math.abs(ex);
    }
    if (a < 1e-5) return sci();
    var intDigits = a >= 1 ? Math.floor(Math.log10(a)) + 1 : 1;
    if (intDigits > w) return sci();
    var dec = Math.max(0, w - intDigits - 1), y = roundMode(a, dec, 'half');
    s = y.toFixed(dec);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s.replace('.', '').length > w) return sci();
    if (s === '0') return '0';
    return (neg ? '-' : '') + s;
  }
  function fmtNum(x, f) {
    if (!f) return general(x);
    if (f.type === 'percent') { var p = fixedStr(shiftDec(x, 2), f.dp, false); return (p.replace(/[-0.]/g, '') ? p : p.replace('-', '')) + '%'; }
    if (f.type === 'currency') { var y = roundMode(x, f.dp, 'half'); return (y < 0 ? '-' : '') + '$' + fixedStr(Math.abs(x), f.dp, true); }
    return fixedStr(x, f.dp, f.comma);
  }
  function formatValue(v, f) {
    if (v === null || v === undefined) return '';
    if (isErr(v)) return v.code;
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (typeof v === 'number') return fmtNum(v, normFmt(f));
    return String(v);
  }

  /* ===================== the sheet ===================== */
  function Sheet(o) {
    o = o || {};
    this.name = o.name || 'Sheet1';
    this.rows = o.rows || 20; this.cols = o.cols || 8;
    this.colWidths = {};
    this.charts = [];
    this._cells = {}; this._rev = {}; this._rdeps = {}; this._circ = {};
    this._maxRow = 0; this._ls = []; this._batch = 0; this._pend = [];
    if (Array.isArray(o.colWidths)) { for (var ci = 0; ci < o.colWidths.length; ci++) if (o.colWidths[ci] != null) this.setColWidth(ci + 1, o.colWidths[ci]); }
    else if (o.colWidths) for (var k in o.colWidths) this.setColWidth(k, o.colWidths[k]);
  }
  var S = Sheet.prototype;
  function key(a) { if (typeof a === 'object') return A1(a.r, a.c); var p = parseA1(a); if (!p) throw new Error('Bad cell address: ' + a); return A1(p.r, p.c); }
  S._val = function (r, c) { var k = this._cells[A1(r, c)]; return k ? k.v : null; };
  S._cell = function (a, make) { var k = this._cells[a]; if (!k && make) k = this._cells[a] = { f: null, v: null, fmt: null, locked: false, bold: false, mark: null }; return k; };
  S.on = function (fn) { this._ls.push(fn); var ls = this._ls; return function () { var i = ls.indexOf(fn); if (i >= 0) ls.splice(i, 1); }; };
  S._emit = function (info) { for (var i = 0; i < this._ls.length; i++) this._ls[i](info); };
  /* Group many changes into one recalculation. */
  S.batch = function (fn) {
    this._batch++;
    try { fn.call(this, this); } finally { if (--this._batch === 0 && this._pend.length) { var p = this._pend; this._pend = []; this._recalc(p); } }
    return this;
  };
  function contentOf(raw) {
    if (raw === null || raw === undefined) return { f: null, v: null };
    if (typeof raw === 'number') return { f: null, v: isFinite(raw) ? raw : NUM };
    if (typeof raw === 'boolean') return { f: null, v: raw };
    if (isErr(raw)) return { f: null, v: raw };
    var s = String(raw);
    if (s === '') return { f: null, v: null };
    if (s[0] === "'") return { f: null, v: s.slice(1) };
    if (s[0] === '=') return { f: s };
    if (/^(true|false)$/i.test(s.trim())) return { f: null, v: s.trim().toUpperCase() === 'TRUE' };
    var e = s.trim().toUpperCase(); if (ERR_LIT.test(e) && ERR[e]) return { f: null, v: ERR[e] };
    var n = parseNumText(s); if (n) return { f: null, v: n.v, autoFmt: n.fmt };
    return { f: null, v: s };
  }
  /* set(addr, input): input as a student would type it: 12, "8%", "$12", "=B2*B3", "'007" (text), "" (clear). */
  S.set = function (a, input) { a = key(a); var c = contentOf(input); this._put(a, c); return this; };
  /* setValue(addr, value): store a constant exactly as given; strings are never read as formulas. */
  S.setValue = function (a, v) { a = key(a); this._put(a, { f: null, v: v === undefined || v === '' ? null : (typeof v === 'number' && !isFinite(v) ? NUM : v) }); return this; };
  S.clear = function (rg) { var self = this; this.batch(function () { eachCell(parseRange(rg), function (r, c, a) { if (self._cells[a]) self._put(a, { f: null, v: null }); }); }); return this; };
  S._put = function (a, ct) {
    var cell = this._cell(a, true);
    this._unlink(a, cell);
    cell.f = null; cell.ast = null; cell.perr = null; cell.fixed = false;
    if (ct.f) {
      var p = parseFormula(ct.f);
      if (p.error) { cell.f = p.text; cell.perr = p.error; }
      else { cell.f = p.text; cell.ast = p.ast; cell.refs = p.refs; cell.ranges = p.ranges; cell.fixed = p.fixed; this._link(a, cell); }
      cell.v = null;
    } else cell.v = ct.v;
    if (ct.autoFmt && !cell.fmt) cell.fmt = ct.autoFmt;
    if (ct.fmt !== undefined) cell.fmt = ct.fmt;
    if (ct.bold !== undefined) cell.bold = ct.bold;
    if (cell.f || cell.v !== null) { var r = +/\d+$/.exec(a)[0]; if (r > this._maxRow) this._maxRow = r; }
    if (this._batch) this._pend.push(a); else this._recalc([a]);
  };
  S._unlink = function (a, cell) {
    if (cell.refs) cell.refs.forEach(function (x) { var k = A1(x.r, x.c), s = this._rev[k]; if (s) delete s[a]; }, this);
    delete this._rdeps[a]; cell.refs = null; cell.ranges = null;
  };
  S._link = function (a, cell) {
    cell.refs.forEach(function (x) { var k = A1(x.r, x.c); (this._rev[k] || (this._rev[k] = {}))[a] = true; }, this);
    if (cell.ranges.length) this._rdeps[a] = cell.ranges;
  };
  /* Formula cells that read cell a directly. */
  S._dependents = function (a) {
    var out = [], s = this._rev[a], k;
    if (s) for (k in s) out.push(k);
    var p = parseA1(a);
    for (k in this._rdeps) { var gs = this._rdeps[k]; for (var i = 0; i < gs.length; i++) if (inRange(gs[i], p.r, p.c)) { if (!s || !s[k]) out.push(k); break; } }
    return out;
  };
  /* Recalculate everything downstream of the changed cells, in dependency order. Cycles get #CIRC!. */
  S._recalc = function (changed) {
    var self = this, aff = {}, list = [], queue = [], seen = {}, i, a;
    changed.forEach(function (x) { delete self._circ[x]; if (self._cells[x]) self._cells[x].cycle = null; });
    changed.forEach(function (x) { var c = self._cells[x]; if (c && c.f && !aff[x]) { aff[x] = 1; list.push(x); } if (!seen[x]) { seen[x] = 1; queue.push(x); } });
    while (queue.length) {
      a = queue.pop();
      var ds = this._dependents(a);
      for (i = 0; i < ds.length; i++) if (!aff[ds[i]]) { aff[ds[i]] = 1; list.push(ds[i]); if (!seen[ds[i]]) { seen[ds[i]] = 1; queue.push(ds[i]); } }
    }
    var succ = {}, indeg = {};
    list.forEach(function (n) { indeg[n] = 0; });
    list.forEach(function (n) { succ[n] = self._dependents(n).filter(function (d) { return aff[d]; }); succ[n].forEach(function (d) { indeg[d]++; }); });
    var order = kahn(list, succ, indeg, null);
    var done = {}; order.forEach(function (n) { done[n] = 1; });
    var rest = list.filter(function (n) { return !done[n]; }), inCycle = {};
    list.forEach(function (n) { delete self._circ[n]; self._cells[n].cycle = null; });
    if (rest.length) {
      var comps = tarjan(rest, succ);
      comps.forEach(function (cp) {
        if (cp.length > 1 || succ[cp[0]].indexOf(cp[0]) >= 0) {
          cp.sort(addrSort);
          cp.forEach(function (n) { inCycle[n] = 1; self._circ[n] = cp; self._cells[n].cycle = cp; self._cells[n].v = CIRC; });
        }
      });
      var rest2 = rest.filter(function (n) { return !inCycle[n]; }), indeg2 = {};
      rest2.forEach(function (n) { indeg2[n] = 0; });
      rest2.forEach(function (n) { succ[n].forEach(function (d) { if (d in indeg2) indeg2[d]++; }); });
      order = order.concat(kahn(rest2, succ, indeg2, indeg2));
    }
    order.forEach(function (n) { var c = self._cells[n]; c.v = evalCell(self, c, n); });
    this._emit({ changed: changed.slice(), recalculated: order.concat(Object.keys(inCycle)) });
  };
  function kahn(nodes, succ, indeg, only) {
    var q = nodes.filter(function (n) { return indeg[n] === 0; }), out = [], d = {};
    for (var k in indeg) d[k] = indeg[k];
    while (q.length) {
      var n = q.shift(); out.push(n);
      succ[n].forEach(function (m) { if (only && !(m in only)) return; if (m in d && --d[m] === 0) q.push(m); });
    }
    return out;
  }
  function tarjan(nodes, succ) {
    var idx = 0, st = [], on = {}, ix = {}, low = {}, comps = [], set = {};
    nodes.forEach(function (n) { set[n] = 1; });
    function sc(v) {
      ix[v] = low[v] = idx++; st.push(v); on[v] = 1;
      succ[v].forEach(function (w) {
        if (!set[w]) return;
        if (!(w in ix)) { sc(w); low[v] = Math.min(low[v], low[w]); } else if (on[w]) low[v] = Math.min(low[v], ix[w]);
      });
      if (low[v] === ix[v]) { var cp = [], w; do { w = st.pop(); on[w] = 0; cp.push(w); } while (w !== v); comps.push(cp); }
    }
    nodes.forEach(function (n) { if (!(n in ix)) sc(n); });
    return comps;
  }
  function addrSort(x, y) { var a = parseA1(x), b = parseA1(y); return a.r - b.r || a.c - b.c; }
  function evalCell(sh, cell, a) {
    if (cell.perr) return PERR;
    var p = parseA1(a), v;
    try { v = ev(cell.ast, { sh: sh, r: p.r, c: p.c }); } catch (e) { v = VALUE; }
    if (v instanceof Rng) v = sv(v);
    if (v === null || v === undefined) v = 0;
    return fin(v);
  }
  S.recalcAll = function () { this._recalc(Object.keys(this._cells)); return this; };

  /* ----- reading ----- */
  S.get = function (a) { var c = this._cells[key(a)]; return c ? c.v : null; };
  S.display = function (a) { var c = this._cells[key(a)]; return c ? formatValue(c.v, c.fmt) : ''; };
  S.isFormula = function (a) { var c = this._cells[key(a)]; return !!(c && c.f); };
  S.formula = function (a) { var c = this._cells[key(a)]; return c && c.f ? c.f : null; };
  /* What the formula bar shows: the formula, or the constant as Excel would show it. */
  S.input = function (a) {
    var c = this._cells[key(a)]; if (!c) return '';
    if (c.f) return c.f;
    var v = c.v;
    if (v === null) return '';
    if (typeof v === 'number') { var f = normFmt(c.fmt); return f && f.type === 'percent' ? numText(shiftDec(v, 2)) + '%' : numText(v); }
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
    if (isErr(v)) return v.code;
    var t = contentOf(v); return t.f || t.v !== v ? "'" + v : v;
  };
  S.info = function (a) {
    a = key(a); var c = this._cells[a] || { f: null, v: null }, v = c.v, e = isErr(v) ? v.code : null;
    var ex = c.perr || (e ? explain(e) : '');
    if (e === '#CIRC!' && c.cycle) ex += ' Cells in the loop: ' + c.cycle.join(', ') + '.';
    return {
      addr: a, value: v, display: formatValue(v, c.fmt), input: this.input(a), formula: !!c.f, error: e, explain: ex,
      parseError: c.perr || null, cycle: c.cycle || null, locked: !!c.locked, bold: !!c.bold, mark: c.mark || null,
      fmt: normFmt(c.fmt), type: v === null ? 'blank' : e ? 'error' : typeof v === 'number' ? 'number' : typeof v === 'boolean' ? 'boolean' : 'text'
    };
  };
  S.circular = function () { return Object.keys(this._circ).sort(addrSort); };
  S.usedRange = function () {
    var r1 = Infinity, c1 = Infinity, r2 = 0, c2 = 0;
    for (var a in this._cells) { var c = this._cells[a]; if (!c.f && c.v === null && !c.fmt && !c.bold && !c.locked && !c.mark) continue; var p = parseA1(a); r1 = Math.min(r1, p.r); c1 = Math.min(c1, p.c); r2 = Math.max(r2, p.r); c2 = Math.max(c2, p.c); }
    return r2 ? { r1: r1, c1: c1, r2: r2, c2: c2 } : null;
  };

  /* ----- appearance and locking ----- */
  S._each = function (rg, fn) { var self = this; eachCell(parseRange(rg), function (r, c, a) { fn(self._cell(a, true), a); }); this._emit({ style: true }); return this; };
  S.lock = function (rg, on) { return this._each(rg, function (c) { c.locked = on !== false; }); };
  S.unlock = function (rg) { return this.lock(rg, false); };
  S.isLocked = function (a) { var c = this._cells[key(a)]; return !!(c && c.locked); };
  S.format = function (rg, f) { var nf = normFmt(f); return this._each(rg, function (c) { c.fmt = nf; }); };
  S.bold = function (rg, on) { return this._each(rg, function (c) { c.bold = on !== false; }); };
  /* mark(range, 'yourturn' | 'highlight' | null) */
  S.mark = function (rg, m) { return this._each(rg, function (c) { c.mark = m || null; }); };
  S.setColWidth = function (col, px) { var c = typeof col === 'number' ? col : (/^\d+$/.test(String(col)) ? Number(col) : colNum(String(col).toUpperCase()));
    if (!(c >= 1 && c <= 16384) || !(px > 0)) return this; this.colWidths[c] = px; return this; };
  S.colWidth = function (c) { return this.colWidths[c] || 96; };

  /* ----- user edits (respect locks) ----- */
  S.edit = function (a, input) { if (this.isLocked(a)) return false; this.set(a, input); return true; };
  S.lockedIn = function (rg, skip) {
    var out = [], self = this, sk = skip ? parseRange(skip) : null;
    eachCell(parseRange(rg), function (r, c, a) { if (sk && inRange(sk, r, c)) return; if (self.isLocked(a)) out.push(a); });
    return out;
  };

  /* ----- copy, paste, fill ----- */
  S._grab = function (a) { var c = this._cells[a]; return c ? { f: c.f, v: c.v, fmt: c.fmt, bold: c.bold } : { f: null, v: null, fmt: null, bold: false }; };
  S._drop = function (a, g, dr, dc) {
    this._put(a, { f: g.f ? shiftFormula(g.f, dr, dc) : null, v: g.f ? null : g.v, fmt: g.fmt, bold: g.bold });
  };
  /* Copy src block to the block whose top-left is dest, shifting relative references. */
  S.paste = function (src, dest, opt) {
    var s = parseRange(src), d = parseA1(dest), h = s.r2 - s.r1, w = s.c2 - s.c1;
    var tg = { r1: d.r, c1: d.c, r2: d.r + h, c2: d.c + w };
    return this._tile(s, tg, opt);
  };
  /* Tile the source block over the target block (Excel fill copies the pattern). */
  S._tile = function (s, tg, opt) {
    opt = opt || {};
    if (opt.respectLocks) { var lk = this.lockedIn(tg, opt.skipSource ? s : null); if (lk.length) return { ok: false, locked: lk }; }
    var self = this, grabs = {}, h = s.r2 - s.r1 + 1, w = s.c2 - s.c1 + 1;
    eachCell(s, function (r, c, a) { grabs[a] = self._grab(a); });
    this.batch(function () {
      eachCell(tg, function (r, c, a) {
        var sr = s.r1 + (((r - tg.r1) % h) + h) % h, sc = s.c1 + (((c - tg.c1) % w) + w) % w;
        if (opt.skipSource && inRange(s, r, c)) return;
        self._drop(a, grabs[A1(sr, sc)], r - sr, c - sc);
      });
    });
    return { ok: true, range: rangeText(tg) };
  };
  /* Excel Ctrl+D: copy the top row of the range into the rows below it. */
  S.fillDown = function (rg, opt) { var g = parseRange(rg); return this._tile({ r1: g.r1, c1: g.c1, r2: g.r1, c2: g.c2 }, g, merge(opt, { skipSource: true })); };
  /* Excel Ctrl+R: copy the left column of the range into the columns to its right. */
  S.fillRight = function (rg, opt) { var g = parseRange(rg); return this._tile({ r1: g.r1, c1: g.c1, r2: g.r2, c2: g.c1 }, g, merge(opt, { skipSource: true })); };
  /* Fill a source block into a larger target that contains it (the drag fill handle). */
  S.fill = function (src, target, opt) { return this._tile(parseRange(src), parseRange(target), merge(opt, { skipSource: true })); };
  /* Like double-clicking Excel's fill handle: fill down as far as the column beside it has data. */
  S.fillDownAuto = function (a, opt) {
    var p = parseA1(a), self = this;
    function extent(c) { if (c < 1) return 0; var r = p.r; while (self._val(r + 1, c) !== null) r++; return r; }
    var end = Math.max(extent(p.c - 1), extent(p.c + 1));
    if (end <= p.r) return { ok: false, reason: 'no-extent' };
    return this.fillDown({ r1: p.r, c1: p.c, r2: end, c2: p.c }, opt);
  };
  function merge(a, b) { var o = {}, k; for (k in a || {}) o[k] = a[k]; for (k in b) o[k] = b[k]; return o; }

  /* ----- undo support ----- */
  S.snapshot = function (rg) {
    var self = this, out = [];
    eachCell(parseRange(rg), function (r, c, a) { out.push({ a: a, g: self._grab(a) }); });
    return out;
  };
  S.restore = function (snap) {
    var self = this;
    this.batch(function () { snap.forEach(function (s) { self._put(s.a, { f: s.g.f, v: s.g.f ? null : s.g.v, fmt: s.g.fmt, bold: s.g.bold }); }); });
    return this;
  };

  /* ----- charts (hook only; a chart module renders these later) ----- */
  /* addChart({type:'scatter'|'line', x:'A2:A6', y:'B2:B6', title, trend:{slope:'E8', intercept:'E9'} | true}) */
  S.addChart = function (spec) { this.charts.push(spec); this._emit({ chart: spec }); return spec; };

  /* ===================== data import ===================== */
  /* loadTable(sheet, {at:'A1', headers:[...], rows:[[...]], lock:true, formats:[...], widths:[...]}) */
  function loadTable(sh, o) {
    o = o || {};
    var at = parseA1(o.at || 'A1'), heads = o.headers || [], rows = o.rows || [], ncol = heads.length;
    rows.forEach(function (r) { ncol = Math.max(ncol, r.length); });
    var r0 = at.r, c0 = at.c, dataTop = heads.length ? r0 + 1 : r0, lock = o.lock !== false;
    sh.batch(function () {
      heads.forEach(function (h, j) { var a = A1(r0, c0 + j); sh.setValue(a, h == null ? null : String(h)); var c = sh._cell(a, true); c.bold = true; c.locked = true; });
      rows.forEach(function (row, i) {
        for (var j = 0; j < ncol; j++) {
          var v = row[j], a = A1(dataTop + i, c0 + j);
          if (typeof v === 'string') { var n = parseNumText(v); if (n && !n.fmt) v = n.v; }
          sh.setValue(a, v === undefined ? null : v);
          var c = sh._cell(a, true); c.locked = lock;
          if (o.formats && o.formats[j]) c.fmt = normFmt(o.formats[j]);
        }
      });
      if (o.widths) o.widths.forEach(function (w, j) { if (w) sh.setColWidth(c0 + j, w); });
    });
    var last = dataTop + rows.length - 1, out = {
      header: heads.length ? rangeText({ r1: r0, c1: c0, r2: r0, c2: c0 + ncol - 1 }) : null,
      data: rows.length ? rangeText({ r1: dataTop, c1: c0, r2: last, c2: c0 + ncol - 1 }) : null,
      all: rangeText({ r1: r0, c1: c0, r2: Math.max(last, r0), c2: c0 + Math.max(ncol, 1) - 1 }),
      columns: [], byHeader: {}, rows: rows.length, cols: ncol, nextRow: last + 1
    };
    for (var j = 0; j < ncol; j++) {
      var cr = rows.length ? rangeText({ r1: dataTop, c1: c0 + j, r2: last, c2: c0 + j }) : null;
      out.columns.push(cr); if (heads[j] != null) out.byHeader[String(heads[j])] = cr;
    }
    sh._emit({ style: true });
    return out;
  }

  /* ===================== chart data ===================== */
  /* series(sheet, xRange, yRange): numeric pairs, with the cell addresses they came from. */
  function series(sh, xr, yr) {
    var gx = parseRange(xr), gy = parseRange(yr), xs = [], ys = [], out = { x: [], y: [], points: [] };
    eachCell(gx, function (r, c, a) { xs.push(a); }); eachCell(gy, function (r, c, a) { ys.push(a); });
    for (var i = 0; i < Math.min(xs.length, ys.length); i++) {
      var x = sh.get(xs[i]), y = sh.get(ys[i]);
      if (typeof x === 'number' && typeof y === 'number') { out.x.push(x); out.y.push(y); out.points.push({ x: x, y: y, cellX: xs[i], cellY: ys[i] }); }
    }
    return out;
  }
  function headerAbove(sh, g) { if (g.r1 < 2) return null; var v = sh.get(A1(g.r1 - 1, g.c1)); return typeof v === 'string' ? v : null; }
  /* chartData(sheet, spec): everything a chart module needs, resolved from the live sheet. */
  /* Category points for column charts (and line charts with text labels): one point per y cell that holds a number. */
  function catSeries(sh, gx, gy) {
    var xs = [], ys = [], pts = [];
    eachCell(gx, function (r, c, a) { xs.push(a); }); eachCell(gy, function (r, c, a) { ys.push(a); });
    for (var i = 0; i < ys.length; i++) {
      var y = sh.get(ys[i]); if (typeof y !== 'number') continue;
      pts.push({ x: i + 1, y: y, label: xs[i] ? sh.display(xs[i]) : String(i + 1), cellX: xs[i] || null, cellY: ys[i] });
    }
    return pts;
  }
  function chartData(sh, spec) {
    var s = series(sh, spec.x, spec.y), gx = parseRange(spec.x), gy = parseRange(spec.y), out = {
      type: spec.type || 'scatter', title: spec.title || null, x: rangeText(gx), y: rangeText(gy),
      xLabel: spec.xLabel || headerAbove(sh, gx), yLabel: spec.yLabel || headerAbove(sh, gy), points: s.points, trend: null, categories: false
    };
    var anyText = false; eachCell(gx, function (r, c, a) { var v = sh.get(a); if (typeof v === 'string') anyText = true; });
    if (out.type === 'column' || (out.type === 'line' && anyText)) { out.categories = true; out.points = catSeries(sh, gx, gy); }
    if (spec.trend && s.x.length) {
      var m, b;
      if (spec.trend === true) { var L = linreg(s); if (L && L.sxx) { m = L.sxy / L.sxx; b = L.ym - m * L.xm; } }
      else { m = sh.get(spec.trend.slope); b = sh.get(spec.trend.intercept); }
      if (typeof m === 'number' && typeof b === 'number') {
        var x0 = Math.min.apply(null, s.x), x1 = Math.max.apply(null, s.x);
        out.trend = { slope: m, intercept: b, from: { x: x0, y: m * x0 + b }, to: { x: x1, y: m * x1 + b } };
      }
    }
    return out;
  }

  /* ===================== check() ===================== */
  /* targets: [{cell:'B6' | range:'B9:B13', value: v | fn(sheet, addr, i), values:[...], tol, formula:true,
                mustUse:['B$2'], test: fn(value, sheet, addr) -> true | 'message', hint:'...'}]
     Returns {ok:true, passed, total} or {ok:false, cell, expected, actual, reason, message, hint, target}. */
  function check(sh, targets) {
    var total = 0, passed = 0;
    targets.forEach(function (t) { var g = parseRange(t.cell || t.range); total += (g.r2 - g.r1 + 1) * (g.c2 - g.c1 + 1); });
    for (var ti = 0; ti < targets.length; ti++) {
      var t = targets[ti], g = parseRange(t.cell || t.range), cells = [];
      eachCell(g, function (r, c, a) { cells.push(a); });
      for (var i = 0; i < cells.length; i++) {
        var a = cells[i], bad = checkCell(sh, t, a, i);
        if (bad) { bad.cell = a; bad.target = ti; bad.passed = passed; bad.total = total; bad.ok = false; if (t.hint && !bad.hint) bad.hint = t.hint; return bad; }
        passed++;
      }
    }
    return { ok: true, passed: passed, total: total, message: total === 1 ? 'That cell checks out.' : 'All ' + total + ' cells check out.' };
  }
  function expectedFor(sh, t, a, i) {
    var e = t.values ? t.values[i] : t.value;
    return typeof e === 'function' ? e(sh, a, i) : e;
  }
  function sameValue(act, exp, tol) {
    if (typeof exp === 'number') {
      if (typeof act !== 'number') return false;
      var tl = tol != null ? tol : 1e-9 * Math.max(1, Math.abs(exp));
      return Math.abs(act - exp) <= tl;
    }
    if (typeof exp === 'string') return typeof act === 'string' && act.trim().toLowerCase() === exp.trim().toLowerCase();
    if (typeof exp === 'boolean') return act === exp;
    if (isErr(exp)) return act === exp;
    return act === exp;
  }
  function checkCell(sh, t, a, i) {
    var c = sh._cells[a], exp = expectedFor(sh, t, a, i), act = c ? c.v : null, needF = t.formula !== false;
    var res = { expected: exp, actual: act, expectedText: formatValue(exp, c && c.fmt), actualText: formatValue(act, c && c.fmt) };
    function fail(reason, msg) { res.reason = reason; res.message = msg; return res; }
    if (!c || (!c.f && act === null)) return fail('empty', a + ' is still empty. Click it and type a formula that starts with =.');
    if (c.perr) return fail('formula-error', a + ': ' + c.perr);
    if (needF && !c.f) {
      /* First-timer cases: the formula typed without its = sign, or the right answer typed as a number. */
      if (typeof act === 'string' && /[A-Za-z]{1,3}\d|[+\-*\/(]/.test(act)) {
        var pf = parseFormula('=' + act);
        if (!pf.error && (pf.refs.length || pf.fns.length)) { res.sub = 'forgot-equals'; return fail('not-formula', a + ': you typed the words, not a formula. Start with =, like =' + act.replace(/^\s+/, '') + '.'); }
      }
      if (exp !== undefined && exp !== null && sameValue(act, exp, t.tol)) { res.sub = 'typed-answer'; return fail('not-formula', a + ': that is the right ' + (typeof exp === 'number' ? 'number' : 'answer') + ', but type it as a formula that starts with = so it updates when the inputs change.'); }
      return fail('not-formula', a + ' holds a typed value. Type a formula that starts with = so the answer updates when the inputs change.');
    }
    if (isErr(act) && !isErr(exp)) {
      var m = a + ' shows ' + act.code + '. ' + explain(act);
      if (act === DIV0) {
        var dz = (c.refs || []).filter(function (x) { return sh._val(x.r, x.c) === null; }).map(refStr);
        if (dz.length) { res.sub = 'div-blank'; m = a + ' shows #DIV/0!. You divided by an empty cell: ' + dz.join(', ') + '. Point the formula at the cell that holds the number.'; }
      }
      if (act === CIRC && c.cycle) m += ' Cells in the loop: ' + c.cycle.join(', ') + '.';
      return fail('error', m);
    }
    if (exp !== undefined && !sameValue(act, exp, t.tol)) {
      var msg = a + ' does not match yet.', blanks = (c.refs || []).filter(function (x) { return sh._val(x.r, x.c) === null; }).map(refStr);
      if (blanks.length) msg += ' Its formula uses ' + blanks.join(', ') + (blanks.length > 1 ? ', which are empty.' : ', which is empty.') +
        ' When you fill a formula, its references move with it. Add $ signs to a reference that must stay put, like $B$2.';
      else if (typeof exp === 'number' && typeof act === 'number' && exp !== 0 && Math.abs(act / exp - 100) < 1e-6) msg += ' Your answer is 100 times too big. A percent cell already stores 8% as 0.08, so do not multiply by 100.';
      else if (typeof exp === 'number' && typeof act === 'number' && exp !== 0 && Math.abs(act / exp - 0.01) < 1e-8) msg += ' Your answer is 100 times too small. Check how you used the percent.';
      else if (typeof exp === 'number' && typeof act === 'number' && Math.abs(act + exp) <= (t.tol || 1e-9 * Math.max(1, Math.abs(exp)))) msg += ' The sign is flipped. Check the order of a subtraction.';
      else msg += ' Check which cells your formula uses and the order of operations. Excel does ^ first, then * and /, then + and -.';
      return fail('wrong-value', msg);
    }
    if (t.mustUse && c.f) {
      for (var k = 0; k < t.mustUse.length; k++) {
        var want = t.mustUse[k], wm = /^(\$?)([A-Za-z]{1,3})(\$?)(\d+)$/.exec(want), wr, wc;
        if (!wm) continue;
        var wantShift = { r: +wm[4], c: colNum(wm[2]), ar: !!wm[3], ac: !!wm[1] };
        /* In a filled range, the relative parts of the required ref move with the cell. */
        var p = parseA1(a), g0 = parseRange(t.cell || t.range);
        wr = wantShift.ar ? wantShift.r : wantShift.r + (p.r - g0.r1); wc = wantShift.ac ? wantShift.c : wantShift.c + (p.c - g0.c1);
        var hit = (c.refs || []).some(function (x) { return x.r === wr && x.c === wc && (!wantShift.ar || x.ar) && (!wantShift.ac || x.ac); });
        if (!hit) {
          var plain = colName(wantShift.c) + wantShift.r, uses = (c.refs || []).some(function (x) { return x.r === wr && x.c === wc; });
          return fail('missing-ref', uses ?
            a + ' gets the right answer here, but its reference to ' + plain + ' will move when you fill. Lock it with $ signs: ' + want + ' or $' + colName(wantShift.c) + '$' + wantShift.r + '. Click the reference in your formula and press F4, or use the $ Lock ref button.' :
            a + ' should use the value in ' + plain + '. Point your formula at that cell.');
        }
      }
    }
    if (t.test) { var tr = t.test(act, sh, a); if (tr !== true && tr !== undefined) return fail('custom', typeof tr === 'string' ? tr : a + ' does not match yet.'); }
    return null;
  }

  /* ===================== .xlsx export ===================== */
  var CRC_T = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function utf8(s) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s);
    var b = unescape(encodeURIComponent(s)), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u;
  }
  /* Store-method (uncompressed) ZIP. files: [{name, data: Uint8Array}] */
  function zip(files, when) {
    var d = when || new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
      date = ((Math.max(1980, d.getFullYear()) - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    var parts = [], central = [], off = 0;
    files.forEach(function (f) {
      var name = utf8(f.name), data = f.data, crc = crc32(data), h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0, true); h.setUint16(8, 0, true);
      h.setUint16(10, time, true); h.setUint16(12, date, true); h.setUint32(14, crc, true);
      h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
      parts.push(new Uint8Array(h.buffer), name, data);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0, true); c.setUint16(10, 0, true);
      c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
      c.setUint16(28, name.length, true); c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true);
      c.setUint32(38, 0, true); c.setUint32(42, off, true);
      central.push(new Uint8Array(c.buffer), name);
      off += 30 + name.length + data.length;
    });
    var cdSize = central.reduce(function (s, p) { return s + p.length; }, 0), e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(4, 0, true); e.setUint16(6, 0, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, cdSize, true); e.setUint32(16, off, true); e.setUint16(20, 0, true);
    var all = parts.concat(central, [new Uint8Array(e.buffer)]), len = all.reduce(function (s, p) { return s + p.length; }, 0), out = new Uint8Array(len), o = 0;
    all.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }
  function xmlEsc(s) { return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function xlsxFormula(f) {
    var toks = tokenize(f.replace(/^=/, ''));
    return toks.filter(function (k) { return k.t !== 'ws'; }).map(function (k) { return k.t === 'func' && XLFN[k.name] ? '_xlfn.' + k.name : tokText(k); }).join('');
  }
  function numFmtCode(f) {
    if (!f) return null;
    var z = f.dp ? '.' + new Array(f.dp + 1).join('0') : '';
    if (f.type === 'percent') return '0' + z + '%';
    if (f.type === 'currency') return '"$"#,##0' + z;
    return (f.comma ? '#,##0' : '0') + z;
  }
  var BUILTIN_FMT = { '0': 1, '0.00': 2, '#,##0': 3, '#,##0.00': 4, '0%': 9, '0.00%': 10 };
  function sheetName(n) { var s = String(n || 'Sheet1').replace(/[\[\]:*?\/\\]/g, ' ').replace(/^'+|'+$/g, '').trim().slice(0, 31); return s || 'Sheet1'; }
  var XHEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n', NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships', NS_PR = 'http://schemas.openxmlformats.org/package/2006/relationships';
  /* toXlsx(sheet, {given:true, marks:true}): bytes of a one-sheet .xlsx with formulas, cached values, number formats,
     bold, column widths, a gray fill on given (locked) cells and a yellow fill on "your turn" cells. */
  function toXlsx(sh, opt) {
    opt = opt || {};
    var strings = [], sidx = {}, fmts = [], fmtIdx = {}, xfs = ['0|0|0'], xfIdx = { '0|0|0': 0 }, rowsMap = {};
    function sst(s) { if (!(s in sidx)) { sidx[s] = strings.length; strings.push(s); } return sidx[s]; }
    function styleOf(c) {
      var nf = 0, code = numFmtCode(normFmt(c.fmt));
      if (code) { if (BUILTIN_FMT[code]) nf = BUILTIN_FMT[code]; else { if (!(code in fmtIdx)) { fmtIdx[code] = 164 + fmts.length; fmts.push(code); } nf = fmtIdx[code]; } }
      var fill = c.locked && opt.given !== false ? 2 : (c.mark === 'yourturn' || c.mark === 'highlight') && opt.marks !== false ? 3 : 0;
      var k = nf + '|' + (c.bold ? 1 : 0) + '|' + fill;
      if (!(k in xfIdx)) { xfIdx[k] = xfs.length; xfs.push(k); }
      return xfIdx[k];
    }
    var r1 = Infinity, c1 = Infinity, r2 = 0, c2 = 0;
    Object.keys(sh._cells).forEach(function (a) {
      var c = sh._cells[a], s = styleOf(c);
      if (!c.f && c.v === null && s === 0) return;
      var p = parseA1(a), x = '<c r="' + a + '"' + (s ? ' s="' + s + '"' : ''), v = c.v;
      r1 = Math.min(r1, p.r); c1 = Math.min(c1, p.c); r2 = Math.max(r2, p.r); c2 = Math.max(c2, p.c);
      if (c.f && !c.perr) {
        var fx = '<f>' + xmlEsc(xlsxFormula(c.f)) + '</f>';
        if (v === CIRC || opt.cache === false) x += '>' + fx + '</c>';
        else if (isErr(v)) x += ' t="e">' + fx + '<v>' + xmlEsc(v.code) + '</v></c>';
        else if (typeof v === 'string') x += ' t="str">' + fx + '<v>' + xmlEsc(v) + '</v></c>';
        else if (typeof v === 'boolean') x += ' t="b">' + fx + '<v>' + (v ? 1 : 0) + '</v></c>';
        else x += '>' + fx + '<v>' + String(v) + '</v></c>';
      } else if (c.perr) x += ' t="s"><v>' + sst(c.f) + '</v></c>';
      else if (v === null) x += '/>';
      else if (typeof v === 'number') x += '><v>' + String(v) + '</v></c>';
      else if (typeof v === 'boolean') x += ' t="b"><v>' + (v ? 1 : 0) + '</v></c>';
      else if (isErr(v)) x += ' t="e"><v>' + xmlEsc(v.code) + '</v></c>';
      else x += ' t="s"><v>' + sst(v) + '</v></c>';
      (rowsMap[p.r] || (rowsMap[p.r] = [])).push({ c: p.c, x: x });
    });
    var sheetData = Object.keys(rowsMap).map(Number).sort(function (a, b) { return a - b; }).map(function (r) {
      return '<row r="' + r + '">' + rowsMap[r].sort(function (a, b) { return a.c - b.c; }).map(function (k) { return k.x; }).join('') + '</row>';
    }).join('');
    var cols = Object.keys(sh.colWidths).map(Number).sort(function (a, b) { return a - b; }).map(function (c) {
      var w = Math.max(1, Math.round((sh.colWidths[c] - 5) / 7 * 100) / 100);
      return '<col min="' + c + '" max="' + c + '" width="' + w + '" customWidth="1"/>';
    }).join('');
    var dim = r2 ? rangeText({ r1: r1, c1: c1, r2: r2, c2: c2 }) : 'A1';
    var sheetXml = XHEAD + '<worksheet xmlns="' + NS_MAIN + '" xmlns:r="' + NS_R + '"><dimension ref="' + dim + '"/>' +
      '<sheetViews><sheetView tabSelected="1" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>' +
      (cols ? '<cols>' + cols + '</cols>' : '') + '<sheetData>' + sheetData + '</sheetData>' +
      '<pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>';
    var styles = XHEAD + '<styleSheet xmlns="' + NS_MAIN + '">' +
      (fmts.length ? '<numFmts count="' + fmts.length + '">' + fmts.map(function (f, i) { return '<numFmt numFmtId="' + (164 + i) + '" formatCode="' + xmlEsc(f) + '"/>'; }).join('') + '</numFmts>' : '') +
      '<fonts count="2"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font>' +
      '<font><b/><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>' +
      '<fills count="4"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFEDEDED"/><bgColor indexed="64"/></patternFill></fill>' +
      '<fill><patternFill patternType="solid"><fgColor rgb="FFFFF2CC"/><bgColor indexed="64"/></patternFill></fill></fills>' +
      '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
      '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
      '<cellXfs count="' + xfs.length + '">' + xfs.map(function (k) {
        var p = k.split('|'), nf = +p[0], b = +p[1], fl = +p[2];
        return '<xf numFmtId="' + nf + '" fontId="' + b + '" fillId="' + fl + '" borderId="0" xfId="0"' +
          (nf ? ' applyNumberFormat="1"' : '') + (b ? ' applyFont="1"' : '') + (fl ? ' applyFill="1"' : '') + '/>';
      }).join('') + '</cellXfs>' +
      '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0"/></styleSheet>';
    var sstXml = XHEAD + '<sst xmlns="' + NS_MAIN + '" count="' + strings.length + '" uniqueCount="' + strings.length + '">' +
      strings.map(function (s) { return '<si><t' + (/^\s|\s$|\n/.test(s) ? ' xml:space="preserve"' : '') + '>' + xmlEsc(s) + '</t></si>'; }).join('') + '</sst>';
    var workbook = XHEAD + '<workbook xmlns="' + NS_MAIN + '" xmlns:r="' + NS_R + '"><bookViews><workbookView/></bookViews>' +
      '<sheets><sheet name="' + xmlEsc(sheetName(sh.name)) + '" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>';
    var wbRels = XHEAD + '<Relationships xmlns="' + NS_PR + '">' +
      '<Relationship Id="rId1" Type="' + NS_R + '/worksheet" Target="worksheets/sheet1.xml"/>' +
      '<Relationship Id="rId2" Type="' + NS_R + '/styles" Target="styles.xml"/>' +
      '<Relationship Id="rId3" Type="' + NS_R + '/sharedStrings" Target="sharedStrings.xml"/></Relationships>';
    var rels = XHEAD + '<Relationships xmlns="' + NS_PR + '"><Relationship Id="rId1" Type="' + NS_R + '/officeDocument" Target="xl/workbook.xml"/>' +
      '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
      '<Relationship Id="rId3" Type="' + NS_R + '/extended-properties" Target="docProps/app.xml"/></Relationships>';
    var ct = XHEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
      '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
      '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>' +
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>';
    var now = (opt.date || new Date()).toISOString().replace(/\.\d+Z$/, 'Z');
    var core = XHEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
      '<dc:title>' + xmlEsc(sh.name) + '</dc:title><dc:creator>Raider MathLab</dc:creator>' +
      '<dcterms:created xsi:type="dcterms:W3CDTF">' + now + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + now + '</dcterms:modified></cp:coreProperties>';
    var app = XHEAD + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Raider MathLab</Application></Properties>';
    return zip([
      { name: '[Content_Types].xml', data: utf8(ct) }, { name: '_rels/.rels', data: utf8(rels) },
      { name: 'docProps/core.xml', data: utf8(core) }, { name: 'docProps/app.xml', data: utf8(app) },
      { name: 'xl/workbook.xml', data: utf8(workbook) }, { name: 'xl/_rels/workbook.xml.rels', data: utf8(wbRels) },
      { name: 'xl/worksheets/sheet1.xml', data: utf8(sheetXml) }, { name: 'xl/styles.xml', data: utf8(styles) },
      { name: 'xl/sharedStrings.xml', data: utf8(sstXml) }
    ], opt.date);
  }

  /* ===================== public API ===================== */
  function create(o) { return new Sheet(o); }
  /* evaluate('=1+2', {A1: 5}): quick one-off evaluation on a scratch sheet. */
  function evaluate(formula, cells) {
    var sh = new Sheet({ rows: 50, cols: 26 });
    sh.batch(function () { for (var a in cells || {}) sh.set(a, cells[a]); sh.set('ZZ1', formula); });
    return sh.get('ZZ1');
  }
  var RJSheet = {
    version: '1.0.0',
    create: create, Sheet: Sheet, check: check, toXlsx: toXlsx, loadTable: loadTable, series: series, chartData: chartData,
    evaluate: evaluate, explain: explain, formatValue: formatValue, shiftFormula: shiftFormula, tokenize: tokenize,
    parseFormula: parseFormula, parseRange: parseRange, parseA1: parseA1, rangeText: rangeText, A1: A1, colName: colName, colNum: colNum,
    isError: isErr, errors: ERR, functions: Object.keys(FN).sort(), crc32: crc32, zip: zip, refText: refStr,
    PErr: PErr, MAXR: MAXR, MAXC: MAXC
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = RJSheet;
  if (root) root.RJSheet = RJSheet;
})(typeof window !== 'undefined' ? window : typeof globalThis !== 'undefined' ? globalThis : this);
