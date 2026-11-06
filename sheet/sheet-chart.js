/* sheet-chart.js: draws the charts a sheet asks for (sheet.addChart) as SVG under the grid.
   Needs sheet-core.js and sheet-ui.js. Sets RJSheetUI.chartRenderer.
   Types: 'column' (categories), 'line' (categories or numbers), 'scatter' (numbers, optional trendline).
   Colors come from the site's theme tokens, so light and dark mode follow the page.
   Charts stay on the page: RJSheet.toXlsx does not export them yet. */
(function (root) {
  'use strict';
  var R = root.RJSheet, UI = root.RJSheetUI;
  if (!R || !UI) return;
  var NS = 'http://www.w3.org/2000/svg';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  /* "Nice" axis ticks: 1, 2 or 5 times a power of ten. */
  function ticks(lo, hi, n) {
    if (!(hi > lo)) { hi = lo + 1; }
    var span = hi - lo, raw = span / (n || 5), mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / mag;
    var step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag, a = Math.floor(lo / step) * step, b = Math.ceil(hi / step) * step, out = [];
    for (var v = a; v <= b + step / 2; v += step) out.push(+v.toPrecision(12));
    return { list: out, lo: a, hi: b, step: step };
  }
  function tickText(v, step) {
    var dp = step >= 1 ? 0 : Math.min(6, Math.ceil(-Math.log(step) / Math.LN10));
    return v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function fitLabel(s, max) { s = String(s); return s.length > max ? s.slice(0, max - 1) + '…' : s; }

  function render(box, d, spec, sheet) {
    /* draw at the box's real width, so text stays at its real size in a narrow column or on a phone */
    var W = Math.round(Math.max(300, Math.min(760, (box.clientWidth || 656) - 16))), H = Math.round(Math.max(250, Math.min(360, W * 0.56))), L = 64, Rm = 18, T = d.title ? 40 : 18, B = 62;
    var pw = W - L - Rm, ph = H - T - B, pts = d.points, type = d.type, cat = !!d.categories;
    var yLabel = d.yLabel || '', xLabel = d.xLabel || '';
    var parts = [];
    var label = (type === 'column' ? 'Column chart' : type === 'line' ? 'Line chart' : 'Scatter chart') + (yLabel ? ' of ' + yLabel : '') + (xLabel ? ' by ' + xLabel : '');
    if (!pts.length) {
      box.innerHTML = '<p class="rjs-chart-empty">' + esc(label) + ': type numbers in ' + esc(d.y) + ' and the chart draws itself.</p>';
      return;
    }
    var ys = pts.map(function (p) { return p.y; }), xs = pts.map(function (p) { return p.x; });
    var ylo = Math.min.apply(null, ys), yhi = Math.max.apply(null, ys);
    if (d.trend) { ylo = Math.min(ylo, d.trend.from.y, d.trend.to.y); yhi = Math.max(yhi, d.trend.from.y, d.trend.to.y); }
    if (type === 'column' || ylo > 0) ylo = Math.min(0, ylo);
    if (yhi < 0) yhi = 0;
    /* headroom so the value labels above the bars never touch the title */
    if (type === 'column' && yhi > 0) yhi = yhi * 1.12;
    var yt = ticks(ylo, yhi === ylo ? ylo + 1 : yhi, 5);
    var Y = function (v) { return T + ph - (v - yt.lo) / (yt.hi - yt.lo) * ph; };
    var X, xt = null, n = pts.length, slot = pw / Math.max(1, cat ? pts.length : 1);
    if (cat) X = function (i) { return L + slot * (i + 0.5); };
    else {
      var xlo = Math.min.apply(null, xs), xhi = Math.max.apply(null, xs);
      if (xlo > 0 && type !== 'line') xlo = Math.min(0, xlo);
      xt = ticks(xlo, xhi === xlo ? xlo + 1 : xhi, 6);
      X = function (v) { return L + (v - xt.lo) / (xt.hi - xt.lo) * pw; };
    }
    if (d.title) parts.push('<text x="' + (W / 2) + '" y="24" text-anchor="middle" class="rjs-cht-title">' + esc(d.title) + '</text>');
    /* grid and y axis */
    yt.list.forEach(function (v) {
      var y = Y(v);
      parts.push('<line x1="' + L + '" x2="' + (W - Rm) + '" y1="' + y + '" y2="' + y + '" class="rjs-cht-grid"/>');
      parts.push('<text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end" class="rjs-cht-tick">' + tickText(v, yt.step) + '</text>');
    });
    parts.push('<line x1="' + L + '" x2="' + L + '" y1="' + T + '" y2="' + (T + ph) + '" class="rjs-cht-axis"/>');
    parts.push('<line x1="' + L + '" x2="' + (W - Rm) + '" y1="' + Y(Math.max(yt.lo, Math.min(0, yt.hi))) + '" y2="' + Y(Math.max(yt.lo, Math.min(0, yt.hi))) + '" class="rjs-cht-axis"/>');
    /* x axis labels */
    if (cat) {
      var every = Math.max(1, Math.ceil(n / 12)), maxCh = Math.max(3, Math.floor(slot * every / 8));
      pts.forEach(function (p, i) { if (i % every === 0) parts.push('<text x="' + X(i) + '" y="' + (T + ph + 20) + '" text-anchor="middle" class="rjs-cht-tick">' + esc(fitLabel(p.label, maxCh)) + '</text>'); });
    } else xt.list.forEach(function (v) { parts.push('<text x="' + X(v) + '" y="' + (T + ph + 20) + '" text-anchor="middle" class="rjs-cht-tick">' + tickText(v, xt.step) + '</text>'); });
    if (xLabel) parts.push('<text x="' + (L + pw / 2) + '" y="' + (H - 14) + '" text-anchor="middle" class="rjs-cht-lab">' + esc(xLabel) + '</text>');
    if (yLabel) parts.push('<text transform="translate(16 ' + (T + ph / 2) + ') rotate(-90)" text-anchor="middle" class="rjs-cht-lab">' + esc(yLabel) + '</text>');
    /* marks */
    if (type === 'column') {
      var bw = Math.max(4, slot * 0.62), y0 = Y(0);
      pts.forEach(function (p, i) {
        var y = Y(p.y), top = Math.min(y, y0), h = Math.max(1, Math.abs(y0 - y));
        parts.push('<rect x="' + (X(i) - bw / 2) + '" y="' + top + '" width="' + bw + '" height="' + h + '" rx="3" class="rjs-cht-bar"><title>' + esc(p.label + ': ' + sheet.display(p.cellY)) + '</title></rect>');
        if (n <= 12) parts.push('<text x="' + X(i) + '" y="' + (p.y >= 0 ? top - 6 : top + h + 15) + '" text-anchor="middle" class="rjs-cht-val">' + esc(sheet.display(p.cellY)) + '</text>');
      });
    } else {
      var at = function (p, i) { return (cat ? X(i) : X(p.x)) + ',' + Y(p.y); };
      if (type === 'line') parts.push('<polyline points="' + pts.map(at).join(' ') + '" class="rjs-cht-line"/>');
      if (type === 'scatter' || n <= 40) pts.forEach(function (p, i) { var q = at(p, i).split(','); parts.push('<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + (type === 'scatter' ? 5 : 4) + '" class="rjs-cht-dot"><title>' + esc((cat ? p.label : sheet.display(p.cellX)) + ', ' + sheet.display(p.cellY)) + '</title></circle>'); });
      if (d.trend && !cat) parts.push('<line x1="' + X(d.trend.from.x) + '" y1="' + Y(d.trend.from.y) + '" x2="' + X(d.trend.to.x) + '" y2="' + Y(d.trend.to.y) + '" class="rjs-cht-trend"/>');
    }
    var summary = label + ': ' + pts.slice(0, 12).map(function (p) { return (cat ? p.label : sheet.display(p.cellX)) + ' ' + sheet.display(p.cellY); }).join(', ') + (pts.length > 12 ? ', and ' + (pts.length - 12) + ' more points' : '') + '.';
    box.innerHTML = '<svg xmlns="' + NS + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(summary) + '" class="rjs-cht">' + parts.join('') + '</svg>';
  }
  UI.chartRenderer = render;
  UI.chartTicks = ticks;
})(window);
