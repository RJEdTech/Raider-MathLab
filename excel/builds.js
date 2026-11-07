/* excel/builds.js: the Build it projects. Each matches its MathLab tool's scenario and numbers:
   Order total  = sims/formulas.js   (40 shirts at $12, $35 setup fee, 8% tax on everything: $556.20)
   Credit card  = sims/creditcard.js ($1,500 at 24% APR; minimum = interest + 1% of the balance, at least $25: 114 months, $1,886.90)
   Living wage  = sims/livingwage.js  (MIT 2026, Arapahoe County: 1 adult + 1 child $103,964 a year ÷ 2,080 = $49.98 an hour;
                  2 adults both working + 2 children $144,282 ÷ 2 ÷ 2,080 = $34.68 each; Colorado minimum $15.16)
   Three levels each: Big picture (one formula, fully walked through), Closer look (fill a formula down with $),
   Deep dive (build from a mostly blank sheet and chart it). Every level: gut guess, build, check against the model, download.
   The model's answers are computed here in plain JavaScript, separately from the spreadsheet engine. */
(function () {
  'use strict';
  var R = window.RJSheet, XL = window.XL, money = XL.money, esc = XL.util.esc;
  function r2(v) { return Math.round(v * 100) / 100; }
  function cash(v) { return money(r2(v)); }
  function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

  /* ===================== Order total ===================== */
  var OT = { p: 12, n: 40, F: 35, r: 0.08 };
  function orderTotal(p, n, F, r) { return (p * n + F) * (1 + r); }
  var SIZES = [10, 25, 50, 100, 150];
  function gutLine(g, real, unit) {
    var d = Math.abs(g - real);
    if (unit === '$') return d < 1 ? 'Your gut said ' + cash(g) + ': right on.' : 'Your gut said ' + cash(g) + ', ' + cash(d) + ' too ' + (g < real ? 'low' : 'high') + '.';
    if (d < 0.5) return 'Your gut said ' + g + ' ' + unit + ': right on.';
    return 'Your gut said ' + g + ' ' + unit + ', ' + (Math.round(d * 10) / 10) + ' ' + unit + ' too ' + (g < real ? 'low' : 'high') + '.';
  }
  function inputs(s) { s.set('A1', 'Price per shirt'); s.set('A2', 'Shirts'); s.set('A3', 'Setup fee'); s.set('A4', 'Sales tax'); s.set('A5', 'Total'); s.bold('A5'); }
  function givenInputs(s) { inputs(s); s.set('B1', '$12'); s.set('B2', 40); s.set('B3', '$35'); s.set('B4', '8%'); s.format('B5', 'currency'); s.lock('A1:B4'); s.lock('A5'); }
  function sheetIn(sh) { return { p: sh.get('B1'), n: sh.get('B2'), F: sh.get('B3'), r: sh.get('B4') }; }
  function openStep(name) {
    return { kind: 'card', say: 'Finish in real Excel: open the file you just downloaded. Need the steps? Here they are.', next: 'Done',
      render: function (box, ctx) { XL.openCard(box, { file: ctx.data.downloaded || name + '.xlsx' }); } };
  }
  function dlStep() { return { kind: 'download', say: 'Press <b>Download as Excel file</b>. Your formulas come with it.', ok: function (ctx) { return 'Downloaded <b>' + esc(ctx.data.downloaded || 'the file') + '</b>.'; } }; }
  var LOCKS = ['B$1', 'B$3', 'B$4'];
  function tableBad(res, ctx) {
    var f = ctx.sheet.formula(res.cell) || '';
    if (/\$?A\$\d/.test(f)) return res.cell + ' still uses A8. The shirt count has to move to each row, so take the $ off A8: use A8, not $A$8 or A$8. Fix B8, then fill down again.';
    return XL.friendly(res) + ' Fix B8, then fill down again.';
  }

  XL.addBuild({
    id: 'build-formulas', title: 'Order total', tool: 'from the MathLab tool “The right total for every order”', filename: 'order-total',
    blurb: 'Forty club T-shirts, a setup fee and sales tax. Build the sheet that totals any order.',
    problem: 'Your club is ordering 40 custom T-shirts at $12 each. The shop adds a $35 setup fee, then 8% sales tax on the whole order, fee included.',
    levels: [
      { key: 'big', name: 'Big picture', hint: 'Fill one missing formula, step by step',
        problem: 'Your club is ordering 40 custom T-shirts at $12 each. The shop adds a $35 setup fee, then 8% sales tax on the whole order, fee included. What will the order cost? Build the one formula that answers it.',
        sheet: { name: 'Order total', rows: 8, cols: 2, widths: { A: 150, B: 116 }, start: 'A1', setup: givenInputs },
        ui: { tools: ['undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b> No math yet: just your gut.', label: 'Your gut: what will the 40 shirts cost, with the fee and the tax?', prefix: '$',
            ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + '. Now build it.'; } },
          { kind: 'info', say: '<b>Your sheet.</b> Cells B1 to B4 hold the order: price, shirts, fee and tax. The gray cells are given, so they stay the same. B5 will hold the total, as a formula.',
            callouts: [{ at: 'cell:B5', title: 'Your cell', text: 'The total goes here. It glows when it is your turn.' }] },
          { kind: 'type', cell: 'B5', say: 'Click <b>B5</b> and type <b>=(B1*B2+B3)*(1+B4)</b>, then press Enter. Read it as (price × shirts + fee) × (1 + tax). The parentheses make Excel add the fee before it taxes the order.',
            expect: { value: orderTotal(12, 40, 35, 0.08), tol: 0.005 }, wrong: XL.orderWrongs('B5', 'B1', 'B2', 'B3', 'B4'),
            ok: 'B5 shows $556.20.' },
          { kind: 'check', say: 'Press <b>Check my work</b>. It compares your sheet with the MathLab model’s answer.',
            targets: function (ctx) { var x = sheetIn(ctx.sheet); return [{ cell: 'B5', value: orderTotal(x.p, x.n, x.F, x.r), tol: 0.005, mustUse: ['B4'] }]; },
            ok: function (ctx) { var real = orderTotal(12, 40, 35, 0.08); return 'It checks out: ' + cash(real) + ', the same answer the MathLab model gives. ' + gutLine(ctx.data.gut, real, '$'); } },
          { kind: 'watch', say: 'Watch: the club decides to order 100 shirts.', changes: [{ cell: 'B2', from: 40, to: 100 }], show: ['B5'],
            done: function (ctx) { return 'Same formula, new order: ' + ctx.sheet.display('B5') + ' for 100 shirts. You did not retype anything.'; } },
          dlStep(), openStep('order-total'),
          { kind: 'done', say: '<b>You built the order total.</b> Try Closer look: one formula for every order size.',
            learned: ['One formula, =(B1*B2+B3)*(1+B4), is right for every order.', 'Parentheses decide what happens first.', 'Check my work compares your sheet with the model’s answer.'] }
        ] },
      { key: 'closer', name: 'Closer look', hint: 'Fill a formula down a column and lock what must stay fixed',
        problem: 'The club wants a price list: what does the order cost at 10, 25, 50, 100 and 150 shirts? Write one formula and fill it down the column. Decide which cells must stay fixed with $.',
        sheet: { name: 'Order sizes', rows: 14, cols: 2, widths: { A: 150, B: 116 }, start: 'A1',
          setup: function (s) { givenInputs(s); s.set('B5', '=(B1*B2+B3)*(1+B4)'); s.lock('B5'); s.set('A7', 'Shirts'); s.set('B7', 'Total'); s.bold('A7:B7'); SIZES.forEach(function (n, i) { s.set('A' + (8 + i), n); }); s.format('B8:B12', 'currency'); s.lock('A7:B7'); s.lock('A8:A12'); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: what will 150 shirts cost, with the fee and the tax?', prefix: '$', ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + '.'; } },
          { kind: 'type', cell: 'B8', say: 'In <b>B8</b>, write the total for the number of shirts in <b>A8</b>. The price, fee and tax are the same for every row, so they must stay fixed: lock them with $. The shirt count changes from row to row, so A8 has no $. Type <b>=($B$1*A8+$B$3)*(1+$B$4)</b>, or type it without $ and press $ Lock ref (or F4) next to each one.',
            expect: { value: orderTotal(12, 10, 35, 0.08), tol: 0.005, mustUse: LOCKS },
            wrong: [{ when: function (c) { return c.info.formula && /B2/.test(c.f); }, msg: 'B2 is the 40-shirt order. This table uses the shirt count in its own row: A8.' }],
            ok: 'B8 shows $167.40 for 10 shirts.' },
          { kind: 'fill', src: 'B8', range: 'B8:B12', allow: 'B8:B12', lockTyping: false, say: 'Fill it down: click <b>B8</b>, then press <b>Fill down</b>.',
            targets: function (ctx) { var x = sheetIn(ctx.sheet); return [{ range: 'B8:B12', values: SIZES.map(function (n) { return orderTotal(x.p, n, x.F, x.r); }), tol: 0.005, mustUse: LOCKS }]; },
            bad: tableBad, ok: 'All five totals are in.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function (ctx) { var x = sheetIn(ctx.sheet); return [{ range: 'B8:B12', values: SIZES.map(function (n) { return orderTotal(x.p, n, x.F, x.r); }), tol: 0.005, mustUse: LOCKS }]; },
            ok: function (ctx) { var real = orderTotal(12, 150, 35, 0.08); return 'All five match the MathLab model. 150 shirts cost ' + cash(real) + '. ' + gutLine(ctx.data.gut, real, '$') + ' Click B9: it says =($B$1*A9+$B$3)*(1+$B$4). Only the shirt count moved.'; } },
          dlStep(), openStep('order-total-closer'),
          { kind: 'done', say: '<b>One formula, every order size.</b> Try Deep dive: build it all from a blank sheet.',
            learned: ['Lock the cells that stay the same for every row: $B$1, $B$3, $B$4.', 'Leave the cell that changes row to row unlocked: A8.', 'Fill down copies the pattern to every row.'] }
        ] },
      { key: 'deep', name: 'Deep dive', hint: 'Build the model from a mostly blank sheet and chart it',
        problem: 'Build the whole order model yourself, from a mostly blank sheet: the inputs, the total, a price table, a chart and the cost of each extra shirt. Then use it: with $1,000, what is the biggest order the club can afford?',
        sheet: { name: 'Order model', rows: 16, cols: 2, widths: { A: 170, B: 116 }, start: 'A1',
          setup: function (s) { inputs(s); s.lock('A1:A5'); s.set('A7', 'Shirts'); s.set('B7', 'Total'); s.bold('A7:B7'); s.lock('A7:B7'); s.set('A16', 'Cost per extra shirt'); s.lock('A16');
            s.format('B1', 'currency'); s.format('B3', 'currency'); s.format('B5', 'currency'); s.format('B8:B14', 'currency'); s.format('B16', 'currency'); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['chart', 'check'] },
        chartTypes: ['line', 'column'],
        chart: function (ctx, sel) {
          var g = R.parseRange(sel);
          if (!(g.r1 >= 7 && g.r2 <= 14 && g.c1 >= 1 && g.c2 <= 2)) return 'Select the table first: drag from A7 to B12, then press Insert chart.';
          return { type: 'line', x: 'A8:A14', y: 'B8:B14', title: 'Order total by number of shirts', xLabel: 'Shirts', yLabel: 'Total ($)' };
        },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: with $1,000, how many shirts can the club afford?', suffix: 'shirts', ok: function (ctx) { return 'Locked in: ' + plural(ctx.data.gut, 'shirt') + '.'; } },
          { kind: 'free', allow: 'B1:B4', glowRange: 'B1:B4', say: 'Type the order into <b>B1</b> to <b>B4</b>: <b>12</b>, <b>40</b>, <b>35</b> and <b>8%</b>. Type the % sign: Excel stores 8% as 0.08.',
            first: function (ctx) { var want = [12, 40, 35, 0.08]; for (var i = 0; i < 4; i++) if (ctx.sheet.get('B' + (i + 1)) !== want[i]) return 'B' + (i + 1); return null; },
            test: function (ctx) {
              var s = ctx.sheet, want = [12, 40, 35, 0.08], names = ['the price, 12', 'the shirts, 40', 'the setup fee, 35', 'the tax, 8%'];
              if (s.get('B4') === 8) return 'B4 holds 8, which Excel reads as 800%. Click B4 and type 8% with the % sign.';
              for (var i = 0; i < 4; i++) { var v = s.get('B' + (i + 1)); if (v !== null && typeof v !== 'number') return 'B' + (i + 1) + ' holds words. Type just the number: ' + names[i] + '.'; if (v !== null && Math.abs(v - want[i]) > 1e-12) return 'B' + (i + 1) + ' should hold ' + names[i] + '.'; }
              for (i = 0; i < 4; i++) if (s.get('B' + (i + 1)) === null) return '';
              return true;
            }, ok: 'The inputs are in.' },
          { kind: 'type', cell: 'B5', say: 'In <b>B5</b>, write the formula for the total: price times shirts, plus the fee, all times (1 + tax).',
            expect: { value: orderTotal(12, 40, 35, 0.08), tol: 0.005, mustUse: ['B4'] }, wrong: XL.orderWrongs('B5', 'B1', 'B2', 'B3', 'B4'), ok: 'B5 shows $556.20.' },
          { kind: 'free', allow: 'A8:A12', glowRange: 'A8:A12', say: 'Make a price table. Type the order sizes <b>10</b>, <b>25</b>, <b>50</b>, <b>100</b> and <b>150</b> into <b>A8</b> to <b>A12</b>.',
            first: function (ctx) { for (var i = 0; i < 5; i++) if (ctx.sheet.get('A' + (8 + i)) !== SIZES[i]) return 'A' + (8 + i); return null; },
            test: function (ctx) { for (var i = 0; i < 5; i++) { var v = ctx.sheet.get('A' + (8 + i)); if (v === null) return ''; if (v !== SIZES[i]) return 'A' + (8 + i) + ' should hold ' + SIZES[i] + '.'; } return true; }, ok: 'The order sizes are in.' },
          { kind: 'type', cell: 'B8', say: 'In <b>B8</b>, write the total for the shirts in A8, using the price, fee and tax in B1, B3 and B4. Lock what must stay fixed when you fill.',
            expect: { value: orderTotal(12, 10, 35, 0.08), tol: 0.005, mustUse: LOCKS }, ok: 'B8 shows $167.40.' },
          { kind: 'fill', src: 'B8', range: 'B8:B12', allow: 'B8:B12', lockTyping: false, say: 'Fill B8 down to B12.',
            targets: function (ctx) { var x = sheetIn(ctx.sheet); return [{ range: 'B8:B12', values: SIZES.map(function (n) { return orderTotal(x.p, n, x.F, x.r); }), tol: 0.005, mustUse: LOCKS }]; },
            bad: tableBad, ok: 'Your price table is done.' },
          { kind: 'select', from: 'A7', glow2: 'A7:B12', say: 'Select the table for a chart: drag from <b>A7</b> to <b>B12</b> (or click A7 and Shift+click B12; on a touch screen, tap any cell in the table).',
            test: function (sel) { var g = R.parseRange(sel); if (g.r1 >= 7 && g.r2 >= 12 && g.r2 <= 14 && g.c1 === 1 && g.c2 === 2) return true; if (XL.coarse() && g.r1 >= 7 && g.r2 <= 12 && g.c2 <= 2) return true; if (g.r1 === g.r2 && g.c1 === g.c2) return null; return 'You selected ' + sel + '. Drag from A7 to B12.'; },
            ok: 'Selected.' },
          { kind: 'chart', say: 'Press <b>Insert chart</b>.', ok: 'The totals sit on a straight line: every extra shirt adds the same amount.' },
          { kind: 'free', allow: 'A13:B14', glowRange: 'A13:A14', say: 'Now use your model. Try two more order sizes near the $1,000 budget: type any two shirt counts into <b>A13</b> and <b>A14</b>, like 70 and 80.',
            first: function (ctx) { return ctx.sheet.get('A13') === null ? 'A13' : ctx.sheet.get('A14') === null ? 'A14' : null; },
            test: function (ctx) { var a = ctx.sheet.get('A13'), b = ctx.sheet.get('A14'); if (a === null || b === null) return ''; if (typeof a !== 'number' || typeof b !== 'number' || a < 1 || b < 1) return 'Type whole numbers of shirts, like 70 and 80.'; return true; }, ok: 'Now give them totals.' },
          { kind: 'fill', src: 'B12', range: 'B12:B14', allow: 'A13:B14', lockTyping: false, trim: false, say: 'Click <b>B12</b> and press <b>Fill down</b>. It fills as far as the shirt counts go, to B14.',
            targets: function (ctx) { var x = sheetIn(ctx.sheet); return [{ range: 'B12:B14', value: function (sh, a) { return orderTotal(x.p, sh.get('A' + a.slice(1)), x.F, x.r); }, tol: 0.005, mustUse: LOCKS }]; },
            bad: tableBad, ok: function (ctx) { return 'Your new rows: ' + ctx.sheet.display('A13') + ' shirts cost ' + ctx.sheet.display('B13') + ', and ' + ctx.sheet.display('A14') + ' cost ' + ctx.sheet.display('B14') + '. Change A13 or A14 to try other sizes.'; } },
          { kind: 'choice', say: 'With $1,000, what is the biggest order the club can afford? Change A13 and A14 to test sizes until you are sure.',
            choices: [
              { t: '74 shirts', ok: true, why: '74 shirts cost $996.84, and 75 would cost $1,009.80. So 74 is the most.' },
              { t: '77 shirts', why: 'Test it: type 77 in A13. 77 shirts cost $1,035.72, over the budget.' },
              { t: '80 shirts', why: 'Test it: 80 shirts cost $1,074.60. Dividing the $965 left after the fee by $12 forgets the tax.' },
              { t: '83 shirts', why: 'Test it: 83 shirts cost $1,113.48. 1,000 ÷ 12 forgets both the fee and the tax.' }
            ] },
          { kind: 'type', cell: 'B16', say: 'Each extra shirt adds the same amount: the slope of the line. In <b>B16</b>, type <b>=SLOPE(B8:B12,A8:A12)</b>: totals (y) first, then shirts (x).',
            expect: { value: 12 * 1.08, tol: 1e-6 },
            wrong: [{ when: function (c) { return XL.util.near(c.value, 1 / 12.96, 1e-6); }, msg: 'Those ranges are swapped. SLOPE takes the y values (the totals) first: =SLOPE(B8:B12,A8:A12).' }],
            ok: 'B16 shows $12.96: one shirt’s $12 price plus its 8% tax. The total is a line, T(n) = 12.96n + 37.80, where 37.80 is the taxed setup fee.' },
          { kind: 'check', say: 'Press <b>Check my work</b> to check the whole model against the MathLab model.',
            targets: function (ctx) { var x = sheetIn(ctx.sheet); return [
              { cell: 'B1', value: 12, formula: false }, { cell: 'B2', value: 40, formula: false }, { cell: 'B3', value: 35, formula: false }, { cell: 'B4', value: 0.08, formula: false },
              { cell: 'B5', value: orderTotal(x.p, x.n, x.F, x.r), tol: 0.005, mustUse: ['B4'] },
              { range: 'B8:B12', values: SIZES.map(function (n) { return orderTotal(x.p, n, x.F, x.r); }), tol: 0.005, mustUse: LOCKS },
              { cell: 'B16', value: x.p * (1 + x.r), tol: 1e-6 }]; },
            ok: function (ctx) { return 'Your whole model matches. With $1,000 the club can afford 74 shirts. ' + gutLine(ctx.data.gut, 74, 'shirts'); } },
          dlStep(), openStep('order-total-deep'),
          { kind: 'done', say: '<b>You built a model from scratch.</b> Next: the credit card project.',
            learned: ['Inputs in their own cells, so one change updates everything.', 'A table plus Fill down tests many cases at once.', 'SLOPE finds the cost of one more shirt: $12.96.', 'In Excel, make the chart again with Insert: the download has your formulas, not the chart.'] }
        ] }
    ]
  });

  /* ===================== Credit card payoff ===================== */
  var MONTHS = 150, FIRST = 6, LAST = FIRST + MONTHS - 1;
  /* the MathLab model, row by row: interest = balance × APR/12; payment = max($25, interest + 1% of balance, your fixed payment), never more than you owe */
  function card(B0, apr, fixed) {
    var rows = [], B = B0, months = 0, I = 0;
    for (var m = 1; m <= MONTHS; m++) {
      var i = B * apr / 12, pay = Math.min(Math.max(25, i + 0.01 * B, fixed || 0), B + i), E = B + i - pay;
      if (B <= 0) { i = 0; pay = 0; E = 0; }
      rows.push({ B: B, i: i, pay: pay, E: E }); if (pay > 0) months++; I += i; B = E;
    }
    return { rows: rows, months: months, interest: I };
  }
  XL.cardModel = card;
  function cardInputs(s) {
    s.set('A1', 'Balance'); s.set('A2', 'APR (yearly)'); s.set('A3', 'Fixed payment');
    s.set('D1', 'Months to pay off'); s.set('D2', 'Interest paid'); s.set('D3', 'Years');
    ['Month', 'Start balance', 'Interest', 'Payment', 'End balance'].forEach(function (h, j) { s.set(R.A1(5, j + 1), h); }); s.bold('A5:E5');
    s.format('B1', 'currency'); s.format('B3', 'currency'); s.format('B' + FIRST + ':E' + LAST, 'currency'); s.format('E2', 'currency'); s.format('E3', 'fixed:1');
    s.lock('A1:A3'); s.lock('D1:D3'); s.lock('A5:E5');
  }
  function givenCard(s, fixed) { cardInputs(s); s.set('B1', '$1500'); s.set('B2', '24%'); s.setValue('B3', fixed || 0); s.lock('B1:B3'); }
  function monthCol(s) { for (var r = FIRST; r <= LAST; r++) s.set('A' + r, r - FIRST + 1); s.lock('A' + FIRST + ':A' + LAST); }
  function rowF(s, r, which) {
    if (which.B) s.set('B' + r, r === FIRST ? '=B1' : '=E' + (r - 1));
    if (which.C) s.set('C' + r, '=B' + r + '*$B$2/12');
    if (which.D) s.set('D' + r, '=MIN(MAX(25,C' + r + '+0.01*B' + r + ',$B$3),B' + r + '+C' + r + ')');
    if (which.E) s.set('E' + r, '=B' + r + '+C' + r + '-D' + r);
  }
  function summary(s, guard) {
    s.set('E1', guard ? '=IF(C6="","",COUNTIF(D6:D' + LAST + ',">0"))' : '=COUNTIF(D6:D' + LAST + ',">0")');
    s.set('E2', guard ? '=IF(C6="","",SUM(C6:C' + LAST + '))' : '=SUM(C6:C' + LAST + ')');
    s.set('E3', guard ? '=IF(C6="","",E1/12)' : '=E1/12'); s.lock('E1:E3');
  }
  function cardIn(sh) { return { B: sh.get('B1'), apr: sh.get('B2'), fixed: sh.get('B3') || 0 }; }
  function colTargets(ctx, cols) {
    var x = cardIn(ctx.sheet), m = card(x.B, x.apr, x.fixed), key = { B: 'B', C: 'i', D: 'pay', E: 'E' }, out = [];
    cols.forEach(function (c) { out.push({ range: c + FIRST + ':' + c + LAST, values: m.rows.map(function (row) { return row[key[c]]; }), tol: 0.005, mustUse: c === 'C' ? ['B$2'] : c === 'D' ? ['B$3'] : undefined }); });
    return out;
  }
  function results(m) { return plural(m.months, 'month') + ' (' + (Math.round(m.months / 12 * 10) / 10) + ' years) and ' + cash(m.interest) + ' in interest'; }
  var MIN0 = card(1500, 0.24, 0), FIX100 = card(1500, 0.24, 100);
  var interestWrongs = [
    { when: function (c) { return XL.util.near(c.value, 360); }, msg: 'That is a whole year of interest. Divide by 12 for one month: =B6*B2/12.' },
    { when: function (c) { return XL.util.near(c.value, 3.6); }, msg: 'Close: 24% is already stored as 0.24, so do not divide by 100. Balance times APR, divided by 12: =B6*B2/12.' },
    { when: function (c) { return c.info.formula && XL.util.near(c.value, 30) && c.f.indexOf('B2') < 0; }, msg: 'That works for 24%, but use the APR cell B2 so it updates if the rate changes: =B6*B2/12.' }
  ];
  var chartCard = function (ctx, sel) {
    var g = R.parseRange(sel);
    if (g.c1 === 5 && g.c2 === 5 && g.r1 >= 5) return { type: 'line', x: 'A' + FIRST + ':A' + LAST, y: 'E' + FIRST + ':E' + LAST, title: 'What you still owe, month by month', xLabel: 'Month', yLabel: 'End balance ($)' };
    if (g.c1 === 3 && g.c2 === 3 && g.r1 >= 5) return { type: 'line', x: 'A' + FIRST + ':A' + LAST, y: 'C' + FIRST + ':C' + LAST, title: 'Interest each month', xLabel: 'Month', yLabel: 'Interest ($)' };
    return 'Click E5, the End balance heading, then press Insert chart.';
  };
  XL.addBuild({
    id: 'build-creditcard', title: 'Credit card payoff', tool: 'from the MathLab tool “Paying off a credit card”', filename: 'credit-card-payoff',
    blurb: '$1,500 on a card at 24% APR. Build the month-by-month model and see what the minimum payment really costs.',
    problem: 'You have $1,500 on your first credit card. It charges 24% interest a year (its APR), which is 2% of what you owe every month, and it asks for only a small minimum payment each month.',
    levels: [
      { key: 'big', name: 'Big picture', hint: 'Fill one missing formula, step by step',
        problem: 'You have $1,500 on your first credit card at 24% APR: 2% of what you owe, every month. If you pay just the minimum, how long until you are free of it, and how much extra will it cost? The sheet below runs it month by month. One formula is missing.',
        sheet: { name: 'Credit card', rows: LAST, cols: 5, widths: { A: 132, B: 122, C: 92, D: 150, E: 112 }, start: 'A1', maxHeight: '420px',
          setup: function (s) { givenCard(s, 0); monthCol(s); for (var r = FIRST; r <= LAST; r++) rowF(s, r, { B: 1, C: r > FIRST, D: 1, E: 1 }); s.lock('B' + FIRST + ':E' + LAST); s.unlock('C6'); summary(s, true); } },
        ui: { tools: ['undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: paying only the minimum, how many years until the $1,500 is paid off?', suffix: 'years', ok: function (ctx) { return 'Locked in: ' + ctx.data.gut + ' years.'; } },
          { kind: 'info', say: '<b>Your sheet.</b> Each row is one month. The month’s interest is added, then you pay. The card’s minimum payment is the interest plus 1% of what you owe, or $25, whichever is more. Every formula is here except one: month 1’s interest, in <b>C6</b>.',
            callouts: [{ at: 'cell:C6', title: 'The missing formula', text: 'Month 1’s interest goes here. The rows below already have theirs.' }] },
          { kind: 'type', cell: 'C6', say: 'One month’s interest is the balance times the APR, divided by 12: 24% a year is 2% a month. Click <b>C6</b> and type <b>=B6*B2/12</b>.',
            expect: { value: 30, tol: 0.005 }, wrong: interestWrongs,
            ok: function (ctx) { var s = ctx.sheet; return 'C6 shows $30.00. Look along row 6: the payment is ' + s.display('D6') + ' and the balance drops only to ' + s.display('E6') + '. Month 2 starts from there.'; } },
          { kind: 'check', say: 'The sheet ran all the months. Press <b>Check my work</b> to compare with the MathLab model.',
            targets: function () { return [{ cell: 'C6', value: 30, tol: 0.005, mustUse: ['B2'] }, { cell: 'E1', value: MIN0.months, formula: false }, { cell: 'E2', value: MIN0.interest, tol: 0.005, formula: false }]; },
            ok: function (ctx) { return 'It checks out. Paying only the minimum takes ' + results(MIN0) + ', more than the $1,500 you borrowed. The MathLab model says the same. ' + gutLine(ctx.data.gut, MIN0.months / 12, 'years'); },
            after: function (ctx) { ctx.ui.scrollTo('E1'); } },
          { kind: 'watch', say: 'Watch: you pay a fixed $100 a month instead of the minimum.', changes: [{ cell: 'B3', from: 0, to: 100 }], show: ['E1', 'E2'], showLabel: 'Updated',
            done: function (ctx) { return 'Now it takes ' + results(FIX100) + '. Paying $100 a month saves you ' + cash(MIN0.interest - FIX100.interest) + '.'; } },
          dlStep(), openStep('credit-card-payoff'),
          { kind: 'done', say: '<b>You found what the minimum really costs.</b> Try Closer look: build the whole interest column.',
            learned: ['Interest each month = balance × APR ÷ 12.', 'Paying only the minimum: ' + results(MIN0) + '.', 'A fixed $100 a month: ' + results(FIX100) + '.'] }
        ] },
      { key: 'closer', name: 'Closer look', hint: 'Fill the interest formula down 150 months with a locked APR',
        problem: 'Same card: $1,500 at 24% APR. This time you pay a fixed $100 a month. The interest column is empty: write month 1’s interest with the APR locked, then fill it down all 150 months.',
        sheet: { name: 'Credit card', rows: LAST, cols: 5, widths: { A: 132, B: 122, C: 92, D: 150, E: 112 }, start: 'A1', maxHeight: '420px',
          setup: function (s) { givenCard(s, 100); monthCol(s); for (var r = FIRST; r <= LAST; r++) rowF(s, r, { B: 1, D: 1, E: 1 }); s.lock('B' + FIRST + ':B' + LAST); s.lock('D' + FIRST + ':E' + LAST); summary(s, true); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: paying $100 a month, how many months until the card is paid off?', suffix: 'months', ok: function (ctx) { return 'Locked in: ' + plural(ctx.data.gut, 'month') + '.'; } },
          { kind: 'type', cell: 'C6', say: 'In <b>C6</b>, write month 1’s interest: the balance in B6 times the APR in B2, divided by 12. Every month uses the same APR, so lock it: <b>=B6*$B$2/12</b>.',
            expect: { value: 30, tol: 0.005, mustUse: ['B$2'] }, wrong: interestWrongs, ok: 'C6 shows $30.00.' },
          { kind: 'fill', src: 'C6', range: 'C6:C' + LAST, allow: 'C6:C' + LAST, lockTyping: false, say: 'Fill it down: click <b>C6</b>, then press <b>Fill down</b>. It fills all 150 months.',
            targets: function (ctx) { return colTargets(ctx, ['C']); },
            bad: function (res, ctx) { var f = ctx.sheet.formula(res.cell) || ''; if (/B[3-9]\b|B\d\d/.test(f.replace(/\$B\$2|B\$2/g, '')) && !/\$2/.test(f)) return res.cell + ' says ' + esc(f) + ': the APR reference moved off B2. Lock it in C6 with $B$2, then fill down again.'; return XL.friendly(res) + ' Fix C6, then fill down again.'; },
            ok: 'All 150 months have their interest.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function (ctx) { return colTargets(ctx, ['C']); },
            ok: function (ctx) { return 'Every month matches the MathLab model. At $100 a month the card is paid off in ' + results(FIX100) + '. ' + gutLine(ctx.data.gut, FIX100.months, 'months'); },
            after: function (ctx) { ctx.ui.scrollTo('E1'); } },
          { kind: 'watch', say: 'Watch: what if you paid only the minimum? Set the fixed payment to 0.', changes: [{ cell: 'B3', from: 100, to: 0 }], show: ['E1', 'E2'], showLabel: 'Updated',
            done: function () { return 'Minimum only: ' + results(MIN0) + '. The $100 plan saves ' + cash(MIN0.interest - FIX100.interest) + '.'; } },
          dlStep(), openStep('credit-card-payoff-closer'),
          { kind: 'done', say: '<b>You built the interest column.</b> Try Deep dive: build every column and chart the balance.',
            learned: ['$B$2 keeps every month on the same APR.', 'B6 has no $, so each row uses its own balance.', 'Fill down copied one formula into 150 months.'] }
        ] },
      { key: 'deep', name: 'Deep dive', hint: 'Build every column from a mostly blank sheet and chart it',
        problem: 'Build the whole payoff model: the inputs, month 1, month 2, then fill all 150 months. Count the months, add up the interest, and chart what you still owe.',
        sheet: { name: 'Credit card model', rows: LAST, cols: 5, widths: { A: 132, B: 122, C: 92, D: 150, E: 112 }, start: 'A1', maxHeight: '420px',
          setup: function (s) { cardInputs(s); monthCol(s); s.set('E3', '=IF(E1="","",E1/12)'); s.lock('E3'); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['chart', 'check'] },
        chart: chartCard, chartTypes: ['line', 'column'],
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: paying only the minimum, how much interest will you pay in all?', prefix: '$', ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + '.'; } },
          { kind: 'free', allow: 'B1:B3', glowRange: 'B1:B3', say: 'Type the card into <b>B1</b> to <b>B3</b>: balance <b>1500</b>, APR <b>24%</b>, and fixed payment <b>0</b> (0 means you pay only the minimum).',
            first: function (ctx) { var w = [1500, 0.24, 0]; for (var i = 0; i < 3; i++) if (ctx.sheet.get('B' + (i + 1)) !== w[i]) return 'B' + (i + 1); return null; },
            test: function (ctx) {
              var s = ctx.sheet, w = [1500, 0.24, 0], nm = ['the balance, 1500', 'the APR, 24%', 'the fixed payment, 0'];
              if (s.get('B2') === 24) return 'B2 holds 24, which Excel reads as 2400%. Type 24% with the % sign.';
              for (var i = 0; i < 3; i++) { var v = s.get('B' + (i + 1)); if (v !== null && typeof v !== 'number') return 'B' + (i + 1) + ' holds words. Type just the number: ' + nm[i] + '.'; if (v !== null && Math.abs(v - w[i]) > 1e-9) return 'B' + (i + 1) + ' should hold ' + nm[i] + '.'; }
              for (i = 0; i < 3; i++) if (s.get('B' + (i + 1)) === null) return '';
              return true;
            }, ok: 'The card is in.' },
          { kind: 'type', cell: 'B6', say: 'Month 1 starts with the whole balance. In <b>B6</b>, type <b>=B1</b>.', expect: { value: 1500, tol: 0.005 }, ok: 'B6 shows $1,500.00.' },
          { kind: 'type', cell: 'C6', say: 'In <b>C6</b>, write month 1’s interest. Lock the APR so every month uses B2.', expect: { value: 30, tol: 0.005, mustUse: ['B$2'] }, wrong: interestWrongs, ok: 'C6 shows $30.00.' },
          { kind: 'type', cell: 'D6', say: 'In <b>D6</b>, write the payment. You pay the biggest of $25, the minimum (interest plus 1% of the balance) and your fixed payment in B3, but never more than you owe. <b>MAX</b> picks the biggest number in its list and <b>MIN</b> the smallest: <b>=MIN(MAX(25,C6+0.01*B6,$B$3),B6+C6)</b>.',
            expect: { value: 45, tol: 0.005, mustUse: ['B$3'] }, ok: 'D6 shows $45.00: $30 interest plus $15, 1% of the balance.' },
          { kind: 'type', cell: 'E6', say: 'In <b>E6</b>, the end balance: the start balance, plus interest, minus the payment.', expect: { value: 1485, tol: 0.005 },
            wrong: [{ when: function (c) { return XL.util.near(c.value, 1575); }, msg: 'That adds the payment. The payment comes off what you owe: =B6+C6-D6.' }], ok: 'E6 shows $1,485.00.' },
          { kind: 'type', cell: 'B7', say: 'Month 2 starts where month 1 ended. In <b>B7</b>, type <b>=E6</b>.', expect: { value: 1485, tol: 0.005 }, ok: 'B7 shows $1,485.00.' },
          { kind: 'fill', src: 'B7', range: 'B7:B' + LAST, allow: 'B6:E7', lockTyping: false, say: 'Fill B7 down: click <b>B7</b>, then press <b>Fill down</b>. It fills to the last month, using the month numbers in column A.',
            targets: function () { return [{ range: 'B7:B' + LAST }]; }, ok: 'Column B is filled. The balances show $0.00 for now, because columns C to E are empty below row 6.' },
          { kind: 'fill', src: 'C6:E6', range: 'C6:E' + LAST, byColumn: true, allow: 'B6:E7', lockTyping: false, allowSelect: true,
            say: 'Now fill C6, D6 and E6 down. Select all three (drag from <b>C6</b> to <b>E6</b>, or click C6 and Shift+click E6), then press <b>Fill down</b>. On a touch screen, fill them one at a time.',
            targets: function (ctx) { return colTargets(ctx, ['B', 'C', 'D', 'E']); },
            bad: function (res, ctx) { return XL.friendly(res) + ' Fix row 6, then fill down again.'; },
            ok: 'All 150 months are built.' },
          { kind: 'type', cell: 'E1', say: 'Count the months with a payment. In <b>E1</b>, type <b>=COUNTIF(D6:D' + LAST + ',"&gt;0")</b>: it counts the cells in D6 to D' + LAST + ' that are more than 0.',
            enter: function (ctx) { ctx.sheet.unlock('E1:E2'); ctx.ui.scrollTo('E1'); ctx.ui.render(); },
            expect: { value: MIN0.months }, ok: function () { return 'E1 shows ' + MIN0.months + ' months.'; } },
          { kind: 'type', cell: 'E2', say: 'In <b>E2</b>, add up all the interest: <b>=SUM(C6:C' + LAST + ')</b>.', expect: { value: MIN0.interest, tol: 0.005 },
            ok: function (ctx) { return 'E2 shows ' + cash(MIN0.interest) + ' in interest. ' + gutLine(ctx.data.gut, MIN0.interest, '$'); } },
          { kind: 'chart', cell: 'E5', say: 'Chart what you owe: click <b>E5</b>, the End balance heading, then press <b>Insert chart</b>.', ok: 'The line falls slowly: each month you pay off only a little of what is left.' },
          { kind: 'check', say: 'Press <b>Check my work</b> to check the whole model against the MathLab model.',
            targets: function (ctx) { return [{ cell: 'B1', value: 1500, formula: false }, { cell: 'B2', value: 0.24, formula: false }, { cell: 'B3', value: 0, formula: false }].concat(colTargets(ctx, ['B', 'C', 'D', 'E'])).concat([{ cell: 'E1', value: MIN0.months }, { cell: 'E2', value: MIN0.interest, tol: 0.005 }]); },
            ok: function () { return 'Your model matches the MathLab model: ' + results(MIN0) + '.'; } },
          { kind: 'watch', say: 'Watch the chart: pay a fixed $100 a month instead.', changes: [{ cell: 'B3', from: 0, to: 100 }], show: ['E1', 'E2'], showLabel: 'Updated',
            done: function () { return 'Now it is ' + results(FIX100) + ', and the line drops to zero in under two years. That saves ' + cash(MIN0.interest - FIX100.interest) + '.'; } },
          dlStep(), openStep('credit-card-payoff-deep'),
          { kind: 'done', say: '<b>You built the whole payoff model.</b>',
            learned: ['Each row is a month; each month starts where the last one ended.', 'MAX and MIN build the card’s payment rule.', 'COUNTIF counts months; SUM adds the interest.', 'In Excel, make the chart again with Insert: the download has your formulas, not the chart.'] }
        ] }
    ]
  });
  /* ===================== Living wage ===================== */
  /* MIT Living Wage Calculator, 2026 estimates (county pages updated Feb 15, 2026), the same numbers as sims/livingwage.js.
     "Other necessities" = MIT's civic + internet & mobile + other. Living wage = (budget + taxes) ÷ earners ÷ 2,080 hours. */
  var LW_H = 2080, LW_MIN = 15.16;
  var LW_CATS = ['Food', 'Housing', 'Child care', 'Transportation', 'Health care', 'Other necessities', 'Taxes'];
  var LW_1A1 = [6685, 25109, 19448, 9302, 8272, 17471, 17677];   /* Arapahoe County: 1 adult, 1 child */
  var LW_2A2 = [13336, 25109, 36208, 13482, 9538, 23104, 23505]; /* Arapahoe County: 2 adults (both working), 2 children */
  var LW_TYPES = [
    { l: '1 adult, no children', e: 1, y: 56342 }, { l: '1 adult, 1 child', e: 1, y: 103964 }, { l: '1 adult, 2 children', e: 1, y: 139519 },
    { l: '2 adults (1 working), 2 children', e: 1, y: 94680 }, { l: '2 adults (both working), no children', e: 2, y: 74245 }, { l: '2 adults (both working), 2 children', e: 2, y: 144282 }];
  function lwSum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  function livingWage(perYear, earners, hours) { return perYear / earners / hours; }
  function lwBudget(sh) { var a = []; for (var r = 2; r <= 8; r++) a.push(sh.get('B' + r)); return a; }
  function cents(v) { return money(Math.round(v * 100) / 100); }
  function lwCats(s, vals) {
    s.set('A1', 'Basic need'); s.set('B1', 'Per year'); s.bold('A1:B1');
    LW_CATS.forEach(function (c, i) { s.set('A' + (i + 2), c); s.set('B' + (i + 2), vals[i]); });
    s.format('B2:B8', 'currency:0'); s.lock('A1:B8');
  }
  var LW_BIG = livingWage(lwSum(LW_1A1), 1, LW_H), LW_FAM = livingWage(lwSum(LW_2A2), 2, LW_H);
  var lwBigWrongs = [
    { when: function (c) { return XL.util.near(c.value, lwSum(LW_1A1), 0.5); }, msg: 'That is the whole year, $103,964. Now spread it over the hours: divide by B9. =SUM(B2:B8)/B9.' },
    { when: function (c) { return XL.util.near(c.value, lwSum(LW_1A1.slice(0, 6)) / LW_H, 0.005); }, msg: 'Close, but that leaves out the taxes in B8. The pay has to cover them too: =SUM(B2:B8)/B9.' },
    { when: function (c) { return XL.util.near(c.value, LW_1A1[0] / LW_H, 0.005); }, msg: 'That divides only the food. Add the whole budget first with SUM: =SUM(B2:B8)/B9.' },
    { when: function (c) { return XL.util.near(c.value, lwSum(LW_1A1) / 12, 0.5); }, msg: 'That is the amount per month. A living wage is per hour: divide by the 2,080 hours in B9.' }
  ];
  var lwChart = function (ctx, sel) {
    var g = R.parseRange(sel);
    if (!(g.r1 >= 1 && g.r2 <= 8 && g.c1 >= 1 && g.c2 <= 2)) return 'Select the budget first: drag from A1 to B8, then press Insert chart.';
    return { type: 'column', x: 'A2:A8', y: 'B2:B8', title: 'One year of basic needs, family of four', xLabel: 'Basic need', yLabel: 'Dollars per year' };
  };
  function lwTypeVals(sh) { var h = sh.get('B1'); return LW_TYPES.map(function (t) { return livingWage(t.y, t.e, h); }); }

  XL.addBuild({
    id: 'build-livingwage', title: 'Living wage', tool: 'from the MathLab tool “Build a living wage”', filename: 'living-wage',
    blurb: 'One year of basic needs for a family in Aurora’s county, from MIT’s calculator. Build the sheet that turns it into an hourly wage.',
    problem: 'One adult and one child live in Arapahoe County, Colorado, where Aurora is. MIT’s living wage calculator prices one year of their basic needs. What hourly pay, at one full-time job, covers it?',
    levels: [
      { key: 'big', name: 'Big picture', hint: 'Fill one missing formula, step by step',
        problem: 'One adult and one child live in Arapahoe County, where Aurora is. MIT’s living wage calculator prices one year of their basic needs, plus the taxes on the pay that covers them. What hourly wage, at one full-time job, covers it all? Build the one formula that answers it.',
        sheet: { name: 'Living wage', rows: 12, cols: 2, widths: { A: 190, B: 120 }, start: 'A1',
          setup: function (s) { lwCats(s, LW_1A1); s.set('A9', 'Full-time hours a year'); s.set('B9', LW_H); s.set('A10', 'Living wage per hour'); s.bold('A10'); s.format('B10', 'currency');
            s.set('A11', 'Colorado minimum'); s.set('B11', '$15.16'); s.lock('A9:B9'); s.lock('A10'); s.lock('A11:B11'); } },
        ui: { tools: ['undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b> No math yet: just your gut.', label: 'Your gut: what hourly wage covers this family’s basic needs?', prefix: '$',
            ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + ' an hour. Now build it.'; } },
          { kind: 'info', say: '<b>Your sheet.</b> B2 to B8 hold one year of basic needs for one adult and one child, from MIT’s living wage calculator. Taxes are in B8: the paycheck has to cover them too. B9 holds the hours in one full-time year: 40 hours × 52 weeks = 2,080. The gray cells are given, so they stay the same.',
            callouts: [{ at: 'cell:B10', title: 'Your cell', text: 'The living wage goes here. It glows when it is your turn.' }] },
          { kind: 'type', cell: 'B10', say: 'Click <b>B10</b> and type <b>=SUM(B2:B8)/B9</b>, then press Enter. SUM adds up the whole year’s budget. Dividing by B9 spreads it over every hour of a full-time year.',
            expect: { value: LW_BIG, tol: 0.005, mustUse: ['B9'] }, wrong: lwBigWrongs, ok: 'B10 shows $49.98 an hour.' },
          { kind: 'check', say: 'Press <b>Check my work</b>. It compares your sheet with the MathLab model’s answer.',
            targets: function (ctx) { return [{ cell: 'B10', value: livingWage(lwSum(lwBudget(ctx.sheet)), 1, ctx.sheet.get('B9')), tol: 0.005, mustUse: ['B9'] }]; },
            ok: function (ctx) { return 'It checks out: ' + cents(LW_BIG) + ' an hour, the same answer as the MathLab model and MIT. ' + gutLine(ctx.data.gut, LW_BIG, '$') + ' Colorado’s minimum wage, in B11, is $15.16: earning the same at that wage would take ' + (Math.round(LW_BIG * 40 / LW_MIN * 10) / 10) + ' hours a week.'; } },
          { kind: 'watch', say: 'Watch: the rent goes up $200 a month, so housing rises by $2,400 a year.', changes: [{ cell: 'B3', from: LW_1A1[1], to: LW_1A1[1] + 2400 }], show: ['B10'],
            done: function (ctx) { return 'Same formula, new rent: B10 now says ' + ctx.sheet.display('B10') + '. Every $2,400 a year adds about $1.15 an hour. (MIT’s tax model would also raise the taxes a little. This sheet keeps them the same.)'; } },
          dlStep(), openStep('living-wage'),
          { kind: 'done', say: '<b>You built a living wage.</b> Try Closer look: one formula for every kind of household.',
            learned: ['A living wage is built: a year of basic needs plus taxes, divided by full-time hours.', '=SUM(B2:B8)/B9 adds the budget, then divides by 2,080 hours.', 'Change one cost and the wage updates itself.'] }
        ] },
      { key: 'closer', name: 'Closer look', hint: 'Fill a formula down six households and lock what must stay fixed',
        problem: 'MIT prices different households in Arapahoe County. Some have one earner, some two. Write one formula for the living wage per earner, fill it down all six households, then compare each with Colorado’s minimum wage. Decide which cells must stay fixed with $.',
        sheet: { name: 'Households', rows: 11, cols: 5, widths: { A: 290, B: 84, C: 140, D: 132, E: 150 }, start: 'A1',
          setup: function (s) {
            s.set('A1', 'Full-time hours a year'); s.set('B1', LW_H); s.set('A2', 'Colorado minimum wage'); s.set('B2', '$15.16'); s.lock('A1:B2');
            ['Household', 'Earners', 'Per year', 'Wage per hour', 'Times minimum'].forEach(function (h, j) { s.set(R.A1(4, j + 1), h); }); s.bold('A4:E4'); s.lock('A4:E4');
            LW_TYPES.forEach(function (t, i) { s.set('A' + (5 + i), t.l); s.set('B' + (5 + i), t.e); s.set('C' + (5 + i), t.y); });
            s.format('C5:C10', 'currency:0'); s.format('D5:D10', 'currency'); s.format('E5:E10', 'fixed:2'); s.lock('A5:C10'); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['check'] },
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: in a family of four with both parents working, what hourly wage does each parent need?', prefix: '$', ok: function (ctx) { return 'Locked in: ' + cash(ctx.data.gut) + ' an hour.'; } },
          { kind: 'type', cell: 'D5', say: 'In <b>D5</b>, divide the year in <b>C5</b> by the earners in <b>B5</b> and by the hours in <b>B1</b>. The hours are the same for every household, so lock them with $. C5 and B5 change from row to row, so they get no $. Type <b>=C5/B5/$B$1</b>, or type it without $ and press $ Lock ref (or F4) next to B1.',
            expect: { value: livingWage(LW_TYPES[0].y, 1, LW_H), tol: 0.005, mustUse: ['B$1', 'B5'] },
            wrong: [{ when: function (c) { return /A\d/.test(c.f); }, msg: 'Column A holds words, not numbers. Use the year in C5 and the earners in B5.' }],
            ok: 'D5 shows $27.09 for one adult.' },
          { kind: 'fill', src: 'D5', range: 'D5:D10', allow: 'D5:E10', lockTyping: false, say: 'Fill it down: click <b>D5</b>, then press <b>Fill down</b>.',
            targets: function (ctx) { return [{ range: 'D5:D10', values: lwTypeVals(ctx.sheet), tol: 0.005, mustUse: ['B$1', 'B5'] }]; },
            bad: function (res, ctx) { var f = ctx.sheet.formula(res.cell) || ''; if (!/\$1/.test(f)) return res.cell + ' says ' + esc(f) + ': the hours reference moved off B1. Lock it in D5 with $B$1, then fill down again.'; return XL.friendly(res) + ' Fix D5, then fill down again.'; },
            ok: 'All six living wages are in.' },
          { kind: 'type', cell: 'E5', say: 'Now compare with the minimum wage. In <b>E5</b>, divide the living wage in D5 by the minimum wage in B2. Every row uses the same minimum, so lock it: <b>=D5/$B$2</b>.',
            expect: { value: livingWage(LW_TYPES[0].y, 1, LW_H) / LW_MIN, tol: 0.0005, mustUse: ['B$2'] }, ok: 'E5 shows 1.79: one adult needs 1.79 times the minimum wage.' },
          { kind: 'fill', src: 'E5', range: 'E5:E10', allow: 'D5:E10', lockTyping: false, say: 'Fill E5 down: click <b>E5</b>, then press <b>Fill down</b>.',
            targets: function (ctx) { var m = ctx.sheet.get('B2'); return [{ range: 'E5:E10', values: lwTypeVals(ctx.sheet).map(function (v) { return v / m; }), tol: 0.0005, mustUse: ['B$2'] }]; },
            bad: function (res, ctx) { var f = ctx.sheet.formula(res.cell) || ''; if (!/\$2/.test(f)) return res.cell + ' says ' + esc(f) + ': the minimum wage reference moved off B2. Lock it in E5 with $B$2, then fill down again.'; return XL.friendly(res) + ' Fix E5, then fill down again.'; },
            ok: 'Every household is compared with the minimum wage.' },
          { kind: 'check', say: 'Press <b>Check my work</b>.',
            targets: function (ctx) { var m = ctx.sheet.get('B2'), v = lwTypeVals(ctx.sheet); return [{ range: 'D5:D10', values: v, tol: 0.005, mustUse: ['B$1', 'B5'] }, { range: 'E5:E10', values: v.map(function (x) { return x / m; }), tol: 0.0005, mustUse: ['B$2'] }]; },
            ok: function (ctx) { return 'All six match the MathLab model. Each parent in the family of four needs ' + cents(LW_FAM) + ', ' + (Math.round(LW_FAM / LW_MIN * 100) / 100) + ' times the minimum wage. ' + gutLine(ctx.data.gut, LW_FAM, '$') + ' Click D6: it says =C6/B6/$B$1. Only the row moved.'; } },
          { kind: 'watch', say: 'Watch: what if each earner can find only 30 hours of work a week? That is 30 × 52 = 1,560 hours a year.', changes: [{ cell: 'B1', from: LW_H, to: 1560 }], show: ['D10'], showLabel: 'Updated',
            done: function (ctx) { return 'Every living wage rose by a third: each parent in the family of four now needs ' + ctx.sheet.display('D10') + ' an hour. One locked cell, B1, updated all six rows.'; } },
          dlStep(), openStep('living-wage-closer'),
          { kind: 'done', say: '<b>One formula, every household.</b> Try Deep dive: build the family of four from a mostly blank sheet and chart it.',
            learned: ['Lock the cells every row shares: $B$1 for the hours, $B$2 for the minimum wage.', 'Leave the cells that change row to row unlocked: C5 and B5.', 'Living wage ÷ minimum wage is a multiple: it has no units.'] }
        ] },
      { key: 'deep', name: 'Deep dive', hint: 'Build the model from a mostly blank sheet and chart it',
        problem: 'Two adults, both working, with two children in Arapahoe County. MIT’s budget for one year is in the sheet. Build everything else yourself: the inputs, the total, each parent’s living wage, the comparison with the minimum wage, and a chart of where the money goes. Then find which cost drives the wage most.',
        sheet: { name: 'Family of four', rows: 16, cols: 2, widths: { A: 210, B: 110 }, start: 'A1',
          setup: function (s) { lwCats(s, LW_2A2);
            ['Per year, before taxes', 'Full-time hours a year', 'Earners', 'Minimum wage', 'Wage per hour, each', 'Times the minimum', 'Hours a week at minimum'].forEach(function (l, i) { s.set('A' + (9 + i), l); });
            s.lock('A9:A15'); s.format('B9', 'currency:0'); s.format('B12', 'currency'); s.format('B13', 'currency'); s.format('B14', 'fixed:2'); s.format('B15', 'fixed:1'); } },
        ui: { tools: ['fill', 'dollar', 'undo'], download: true, buttons: ['chart', 'check'] },
        chart: lwChart, chartTypes: ['column'],
        steps: [
          { kind: 'gut', say: '<b>Guess first.</b>', label: 'Your gut: at Colorado’s $15.16 minimum wage, how many hours a week would each parent have to work?', suffix: 'hours', ok: function (ctx) { return 'Locked in: ' + plural(ctx.data.gut, 'hour') + ' a week.'; } },
          { kind: 'free', allow: 'B10:B12', glowRange: 'B10:B12', say: 'Type the inputs into <b>B10</b> to <b>B12</b>: <b>2080</b> hours, <b>2</b> earners and the minimum wage, <b>15.16</b>.',
            first: function (ctx) { var w = [LW_H, 2, LW_MIN]; for (var i = 0; i < 3; i++) if (ctx.sheet.get('B' + (10 + i)) !== w[i]) return 'B' + (10 + i); return null; },
            test: function (ctx) {
              var s = ctx.sheet, w = [LW_H, 2, LW_MIN], nm = ['the hours, 2080', 'the earners, 2', 'the minimum wage, 15.16'];
              if (s.get('B10') === 40) return 'B10 holds 40, the hours in one week. A living wage uses the hours in a year: 40 × 52 = 2080.';
              for (var i = 0; i < 3; i++) { var v = s.get('B' + (10 + i)); if (v !== null && typeof v !== 'number') return 'B' + (10 + i) + ' holds words. Type just the number: ' + nm[i] + '.'; if (v !== null && Math.abs(v - w[i]) > 1e-9) return 'B' + (10 + i) + ' should hold ' + nm[i] + '.'; }
              for (i = 0; i < 3; i++) if (s.get('B' + (10 + i)) === null) return '';
              return true;
            }, ok: 'The inputs are in.' },
          { kind: 'type', cell: 'B9', say: 'In <b>B9</b>, add up the whole budget, taxes included, with SUM.', expect: { value: lwSum(LW_2A2), tol: 0.5 },
            wrong: [{ when: function (c) { return XL.util.near(c.value, lwSum(LW_2A2.slice(0, 6)), 0.5); }, msg: 'That leaves out the taxes in B8. The pay has to cover them too: =SUM(B2:B8).' }],
            ok: 'B9 shows $144,282 a year.' },
          { kind: 'type', cell: 'B13', say: 'In <b>B13</b>, find each parent’s living wage: the year in B9, divided by the earners in B11, divided by the hours in B10.',
            expect: { value: LW_FAM, tol: 0.005, mustUse: ['B9', 'B10', 'B11'] },
            wrong: [{ when: function (c) { return XL.util.near(c.value, LW_FAM * 2, 0.005); }, msg: 'That is what one earner would need to cover everything. Two parents share it: divide by the earners in B11 too.' },
              { when: function (c) { return XL.util.near(c.value, lwSum(LW_2A2) / 4 / LW_H, 0.005); }, msg: 'That divides by 4 people. Only the earners work: divide by B11.' }],
            ok: 'B13 shows $34.68 an hour for each parent.' },
          { kind: 'type', cell: 'B14', say: 'In <b>B14</b>, compare with the minimum wage: divide the living wage in B13 by the minimum wage in B12.', expect: { value: LW_FAM / LW_MIN, tol: 0.0005, mustUse: ['B12', 'B13'] }, ok: 'B14 shows 2.29: each parent needs 2.29 times the minimum wage.' },
          { kind: 'type', cell: 'B15', say: 'In <b>B15</b>, find the hours a week each parent would need at minimum wage to earn what the living wage pays in 40 hours: 40 times B13, divided by B12.',
            expect: { value: LW_FAM * 40 / LW_MIN, tol: 0.005, mustUse: ['B12', 'B13'] },
            wrong: [{ when: function (c) { return XL.util.near(c.value, LW_FAM * 40 / LW_MIN - 40, 0.05); }, msg: 'That is the extra hours beyond 40. This cell asks for all of them: =40*B13/B12.' }],
            ok: function (ctx) { return 'B15 shows ' + ctx.sheet.display('B15') + ' hours a week, for each parent. ' + gutLine(ctx.data.gut, LW_FAM * 40 / LW_MIN, 'hours'); } },
          { kind: 'select', from: 'A1', glow2: 'A1:B8', say: 'Chart where the money goes. Select the budget: drag from <b>A1</b> to <b>B8</b> (or click A1 and Shift+click B8; on a touch screen, tap any cell in the budget).',
            test: function (sel) { var g = R.parseRange(sel); if (g.r1 <= 2 && g.r2 === 8 && g.c1 === 1 && g.c2 === 2) return true; if (XL.coarse() && g.r1 >= 1 && g.r2 <= 8 && g.c2 <= 2) return true; if (g.r1 === g.r2 && g.c1 === g.c2) return null; return 'You selected ' + sel + '. Drag from A1 to B8.'; },
            ok: 'Selected.' },
          { kind: 'chart', say: 'Press <b>Insert chart</b>.', ok: 'Each column is one year of one basic need. The tallest is child care, because both parents work.' },
          { kind: 'choice', say: 'Which one line, if it cost 10% more, would raise each parent’s wage the most? Use the chart.',
            choices: [
              { t: 'Housing', why: 'Housing is $25,109. 10% more is $2,511 a year: $2,511 ÷ 2 earners ÷ 2,080 hours ≈ $0.60 an hour each. Another line is bigger.' },
              { t: 'Child care', ok: true, why: 'Child care is the tallest column, $36,208. 10% more is $3,621 a year: ÷ 2 earners ÷ 2,080 hours ≈ $0.87 an hour each. In the MathLab tool, where the taxes rise too, it is about $1.04. The biggest line carries the most weight.' },
              { t: 'Food', why: 'Food is $13,336. 10% more is $1,334 a year: about $0.32 an hour each. The tallest column matters most.' },
              { t: 'All the same', why: 'A 10% rise adds 10% of that line, so a bigger line adds more dollars. Compare the column heights.' }
            ] },
          { kind: 'check', say: 'Press <b>Check my work</b> to check the whole model against the MathLab model.',
            targets: function (ctx) { var s = ctx.sheet, y = lwSum(lwBudget(s)), h = s.get('B10'), e = s.get('B11'), mn = s.get('B12'), v = livingWage(y, e, h); return [
              { cell: 'B10', value: LW_H, formula: false }, { cell: 'B11', value: 2, formula: false }, { cell: 'B12', value: LW_MIN, formula: false },
              { cell: 'B9', value: y, tol: 0.5 }, { cell: 'B13', value: v, tol: 0.005, mustUse: ['B9', 'B10', 'B11'] },
              { cell: 'B14', value: v / mn, tol: 0.0005 }, { cell: 'B15', value: v * 40 / mn, tol: 0.005 }]; },
            ok: function () { return 'Your whole model matches: ' + cents(LW_FAM) + ' an hour for each parent, ' + (Math.round(LW_FAM / LW_MIN * 100) / 100) + ' times the minimum wage, or ' + (Math.round(LW_FAM * 40 / LW_MIN * 10) / 10) + ' hours a week each at minimum wage.'; } },
          { kind: 'watch', say: 'Watch: what if only one parent works? Change the earners to 1.', changes: [{ cell: 'B11', from: 2, to: 1 }], show: ['B13'], showLabel: 'Updated',
            done: function (ctx) { return 'The sheet now says ' + ctx.sheet.display('B13') + ': one earner paying for everything, child care included. But if one parent stays home, the family needs no child care. MIT’s one-earner family of four drops child care to $0 and pays less tax: $45.52 an hour. A formula is only as good as the budget behind it.'; } },
          dlStep(), openStep('living-wage-deep'),
          { kind: 'done', say: '<b>You built a living wage model from scratch.</b>',
            learned: ['Inputs in their own cells: hours, earners and the minimum wage.', 'Living wage = SUM of the budget ÷ earners ÷ hours.', 'The tallest column (child care here) moves the wage most.', 'In Excel, make the chart again with Insert: the download has your formulas, not the chart.'] }
        ] }
    ]
  });
})();
