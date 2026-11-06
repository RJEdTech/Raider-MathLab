/* excel/lessons.js: the 12 Spreadsheet basics lessons for "Excel from zero".
   Each lesson is a list of one-action steps (kinds in excel/runner.js). Every number a student reads is either
   typed here as given data or computed from the live sheet at run time; scratch/excel-test.js checks them
   against independent math. Copy rules: plain words, active voice, no em dashes, nothing named before it is needed. */
(function () {
  'use strict';
  var R = window.RJSheet, XL = window.XL, money = XL.money;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function near(a, b, t) { return typeof a === 'number' && Math.abs(a - b) <= (t || 0.005); }
  function shown(sh, a) { return sh.display(a); }
  function colOf(a) { return /^[A-Z]+/.exec(a)[0]; }
  function rowOf(a) { return +/\d+$/.exec(a)[0]; }
  /* the formula uses a range that runs past the last row of the data */
  function pastRow(f, col, last) {
    var re = new RegExp(col + '\\d+:' + col + '(\\d+)', 'g'), m, out = false;
    while ((m = re.exec(f))) if (+m[1] > last) out = true;
    return out;
  }
  XL.util = { esc: esc, near: near, pastRow: pastRow };

  /* The order-total mistakes, shared with the Build it project (cell = the total cell; refs are price, shirts, fee, tax). */
  XL.orderWrongs = function (cell, P, N, F, T) {
    return [
      { when: function (c) { return near(c.value, 517.8); }, msg: cell + ' shows $517.80. Excel did the * before the +, so only the $35 fee got taxed. Put parentheses around ' + P + '*' + N + '+' + F + ' so the whole order is taxed: =(' + P + '*' + N + '+' + F + ')*(1+' + T + ').' },
      { when: function (c) { return near(c.value, 515.08); }, msg: 'Close. Put parentheses around 1+' + T + ' too. Without them, Excel multiplies by 1 and then adds 0.08.' },
      { when: function (c) { return near(c.value, 41.2); }, msg: cell + ' shows $41.20, which is only the tax. Multiply by (1+' + T + '), not by ' + T + ', to get the order plus its tax.' },
      { when: function (c) { return near(c.value, 515); }, msg: cell + ' shows $515.00, the order before tax. Now multiply it all by (1+' + T + ') to add the 8% tax.' },
      { when: function (c) { return near(c.value, 2030.4); }, msg: cell + ' shows $2,030.40: that charges the $35 fee for every shirt. The shop charges it once, so add it after price times shirts: (' + P + '*' + N + '+' + F + ').' },
      { when: function (c) { return near(c.value, 553.4); }, msg: cell + ' taxed the shirts but not the $35 fee. Put the fee inside the parentheses with the shirts: (' + P + '*' + N + '+' + F + ')*(1+' + T + ').' },
      { when: function (c) { return c.info.formula && near(c.value, 556.2) && c.f.indexOf(T) < 0 && c.f.indexOf('B5') < 0; }, msg: 'That works for 8%, but use the tax cell ' + T + ' so the total updates if the tax rate changes: =(' + P + '*' + N + '+' + F + ')*(1+' + T + ').' },
      { when: function (c) { return c.info.formula && /X/.test(c.f.replace(/MAX|EXP|INDEX/g, '')) && c.info.error; }, msg: 'Use * to multiply in a formula, not x.' }
    ];
  };

  /* ===================== 1 ===================== */
  XL.add({
    id: 'lesson-1', n: 1, title: 'What a spreadsheet is', blurb: 'Cells, column letters, row numbers and the address of a cell. You click; nothing to type yet.',
    scenario: 'This is the club’s T-shirt order, in a spreadsheet. Before you change anything, learn how to find your way around it.',
    sheet: { name: 'T-shirt order', rows: 6, cols: 4, widths: { A: 128, B: 92, C: 84, D: 84 }, start: 'A1',
      setup: function (s) { s.set('A1', 'T-shirt order'); s.bold('A1'); s.set('A2', 'Price per shirt'); s.set('B2', '$12'); s.set('A3', 'Shirts'); s.set('B3', 40); s.set('A4', 'Setup fee'); s.set('B4', '$35'); s.lock('A1:B4'); } },
    ui: { tools: [], enter: false },
    steps: [
      { kind: 'info', say: '<b>A spreadsheet is a grid of boxes.</b> Each box is called a <b>cell</b>. A cell holds one thing: a number, a word, or a formula that works out an answer for you.',
        callouts: [{ at: 'cell:B3', title: 'Cell', text: 'One box in the grid. This cell holds the number 40.' }] },
      { kind: 'click', say: 'Each column has a <b>letter</b> at the top. Click any cell in <b>column B</b>.', glow: 'B1:B6', pointAt: 'col:B', label: 'Column B',
        test: function (a) { return colOf(a) === 'B'; }, wrong: function (a) { return 'That cell is in column ' + colOf(a) + '. Look up at the letters: you want a cell under the B.'; },
        ok: 'Yes. Every cell under the B is in column B.',
        callouts: [{ at: 'col:B', title: 'Column letter', text: 'Columns run up and down. Each one has a letter. This is column B.' }] },
      { kind: 'click', say: 'Each row has a <b>number</b> on the left. Click any cell in <b>row 3</b>.', glow: 'A3:D3', pointAt: 'row:3', label: 'Row 3',
        test: function (a) { return rowOf(a) === 3; }, wrong: function (a) { return 'That cell is in row ' + rowOf(a) + '. Look at the numbers on the left: you want the row next to the 3.'; },
        ok: 'Yes. Every cell beside the 3 is in row 3.',
        callouts: [{ at: 'row:3', title: 'Row number', text: 'Rows run side to side. Each one has a number. This is row 3.' }] },
      { kind: 'click', say: 'Every cell has an <b>address</b>: its column letter, then its row number. Watch: the cell in column C and row 2 is <b>C2</b>, and the <b>Name Box</b> shows it. Then your turn: click cell <b>C4</b>.',
        demo: [{ click: 'C2', say: 'Click C2' }, { wait: 1100, say: 'The Name Box says C2' }],
        cell: 'C4', ok: 'Yes: C4. Column C, row 4. Look at the Name Box above the grid: it says C4 too.',
        callouts: [{ at: 'addr', title: 'Name Box', text: 'Shows the address of the cell you clicked: column letter, then row number.' }] },
      { kind: 'choice', cell: 'D2', say: 'What is the address of the glowing cell?',
        choices: [
          { t: '2D', why: 'Close. The letter always comes first, then the number.' },
          { t: 'D2', ok: true, why: 'Right: column D, row 2. Letter first, then number.' },
          { t: 'C2', why: 'Look again at the letter above the glowing cell.' },
          { t: 'D3', why: 'Look again at the number on the left of the glowing cell.' }
        ] },
      { kind: 'click', say: 'Now read the sheet. Find the cell that holds the <b>price of one shirt</b>, and click it. The labels in column A tell you what each number is.',
        test: function (a) { return a === 'B2'; },
        wrong: function (a, ctx) { if (a === 'A2') return 'A2 is the label. The price is in the cell to its right.'; var d = ctx.sheet.display(a); return a + (d ? ' holds ' + d + '.' : ' is empty.') + ' Read the labels in column A to find the price.'; },
        ok: 'Yes: B2 holds $12.00, the price of one shirt. You found it by reading the label next to it.' },
      { kind: 'done', say: '<b>You can find your way around a spreadsheet.</b> Next you type in one.',
        learned: ['A <b>cell</b> is one box in the grid.', 'Columns have <b>letters</b>. Rows have <b>numbers</b>.', 'A cell’s <b>address</b> is its column letter, then its row number, like C4.', 'The <b>Name Box</b> shows the address of the cell you clicked.'] }
    ]
  });

  /* ===================== 2 ===================== */
  function isXXL(v) { return typeof v === 'string' && /^\s*(xx[\s-]*large|xxl|2xl|2x[\s-]*large)\s*$/i.test(v); }
  XL.add({
    id: 'lesson-2', n: 2, title: 'Type a number, press Enter', blurb: 'Type into a cell, press Enter, and see where Enter moves you.',
    scenario: 'The club is ordering T-shirts. Fill in how many of each size people asked for.',
    sheet: { name: 'Shirt sizes', rows: 8, cols: 3, widths: { A: 110, B: 88, C: 80 }, start: 'A1',
      setup: function (s) { s.set('A1', 'Size'); s.set('B1', 'Shirts'); s.bold('A1:B1'); ['Small', 'Medium', 'Large', 'X-Large'].forEach(function (z, i) { s.set('A' + (i + 2), z); }); s.lock('A1:B1'); s.lock('A2:A5'); } },
    ui: { tools: ['undo'] },
    steps: [
      { kind: 'type', cell: 'B3', say: 'Watch first: the cursor clicks <b>B2</b>, types <b>8</b> and presses Enter. The 8 goes into B2, and the selected cell moves down to B3. Then your turn: type <b>12</b> in B3 and press <b>Enter</b>.',
        demo: [{ click: 'B2', say: 'Click B2' }, { type: '8', say: 'Type 8' }, { enter: true, say: 'Press Enter' }], demoArea: 'B2',
        expect: { value: 12, formula: false },
        wrong: [
          { when: function (c) { return c.info.type === 'text' && /\d/.test(c.text); }, msg: function (c) { return 'B3 now holds the words “' + esc(c.text) + '”, not a number. Type just the number 12. The heading already says Shirts.'; } },
          { when: function (c) { return c.info.type === 'number' && c.value !== 12; }, msg: function (c) { return 'B3 shows ' + esc(c.info.display) + '. Medium needs 12. Click B3 and type 12: typing replaces what is there.'; } }
        ],
        ok: 'There it is. Enter saved 12 in B3 and moved you down to B4.',
        callouts: [{ at: 'enter', title: 'Enter', text: 'Saves what you typed and moves you down one cell. Press the Enter key on your keyboard, or this button.' }] },
      { kind: 'type', cell: 'B4', say: 'You are on B4 now. Type <b>15</b> for Large, then press Enter.', expect: { value: 15, formula: false },
        wrong: [{ when: function (c) { return c.info.type === 'text'; }, msg: 'Type just the number 15, with no words.' }], ok: 'Saved. Enter moved you down again.' },
      { kind: 'type', cell: 'B5', say: 'Type <b>5</b> for X-Large, then press Enter.', expect: { value: 5, formula: false },
        wrong: [{ when: function (c) { return c.info.type === 'text'; }, msg: 'Type just the number 5, with no words.' }], ok: 'Saved.' },
      { kind: 'type', cell: 'A6', say: 'Cells hold words too. Someone asked for a bigger size. Click <b>A6</b> and type <b>XX-Large</b>. Then press <b>Tab</b> instead of Enter: Tab saves and moves you one cell to the right.',
        test: function (c) { return isXXL(c.value) ? true : (typeof c.value === 'number' ? 'A6 is for the size name. Type the word XX-Large.' : 'A6 says ' + esc(c.info.display) + '. Type XX-Large.'); },
        ok: 'Words line up on the left side of a cell. Numbers line up on the right.' },
      { kind: 'type', cell: 'B6', say: 'Now <b>B6</b>: type <b>2</b> for XX-Large, then press Enter.', expect: { value: 2, formula: false },
        wrong: [{ when: function (c) { return c.info.type === 'text'; }, msg: 'Type just the number 2.' }], ok: 'Saved.' },
      { kind: 'type', cell: 'B3', say: 'Two more people want Medium. Click <b>B3</b> and type <b>14</b>, then press Enter. Typing in a cell that already has a number replaces it.',
        expect: { value: 14, formula: false }, wrong: [{ when: function (c) { return c.value === 1214; }, msg: 'B3 shows 1214: the 14 went on the end of the 12. Click B3 once (not twice) and type 14. It replaces the 12.' }, { when: function (c) { return c.info.type === 'text'; }, msg: 'Type just the number 14.' }],
        ok: 'B3 says 14 now. Made a mistake anywhere? Press <b>Undo</b> to take back your last change.' },
      { kind: 'done', say: '<b>You can type into a spreadsheet.</b> Next you make it do math.',
        learned: ['Click a cell, then type.', '<b>Enter</b> saves and moves you down. <b>Tab</b> saves and moves you right.', 'Numbers line up on the right. Words line up on the left.', 'Typing in a full cell replaces what was there. Undo takes it back.'] }
    ]
  });

  /* ===================== 3 ===================== */
  XL.add({
    id: 'lesson-3', n: 3, title: 'Your first formula', blurb: 'Type =B2+B3, press Enter and the answer appears. Then watch it update itself.',
    scenario: 'The club sold T-shirts and hoodies at two games. How many of each did it sell in all? Let the spreadsheet add them.',
    sheet: { name: 'Game sales', rows: 7, cols: 3, widths: { A: 100, B: 96, C: 96 }, start: 'A1',
      setup: function (s) { s.set('A1', 'Game'); s.set('B1', 'T-shirts'); s.set('C1', 'Hoodies'); s.bold('A1:C1'); s.set('A2', 'Friday'); s.set('B2', 40); s.set('C2', 12); s.set('A3', 'Saturday'); s.set('B3', 25); s.set('C3', 9); s.set('A4', 'Total'); s.bold('A4'); s.lock('A1:C3'); s.lock('A4'); } },
    ui: { tools: ['undo'] },
    steps: [
      { kind: 'type', cell: 'C4', say: 'A <b>formula</b> tells the spreadsheet to work out an answer. Watch: the cursor clicks <b>B4</b>, types <b>=B2+B3</b> and presses Enter. That means: add the number in B2 to the number in B3. Then your turn: in <b>C4</b>, add the hoodies. Type <b>=C2+C3</b> and press Enter.',
        demo: [{ click: 'B4', say: 'Click B4' }, { type: '=B2+B3', say: 'Type =B2+B3' }, { enter: true, say: 'Press Enter: the answer appears' }], demoArea: 'B4',
        expect: { value: 21 },
        wrong: [{ when: function (c) { return c.f === '=B2+B3'; }, msg: 'That adds B2 and B3: the T-shirts. The hoodies are in column C, so use C2 and C3: =C2+C3.' }],
        inputCallouts: [{ when: function (t) { return t === '='; }, at: 'editor', title: 'The = sign', text: 'Tells the spreadsheet: this is a formula, so work it out.' }],
        ok: 'C4 shows 21. Click C4 and look at the formula bar: it still says =C2+C3. The cell shows the answer; the formula stays inside.',
        callouts: [{ at: 'fbar', title: 'Formula bar', text: 'Shows what is really inside the selected cell. The cell shows the answer; the formula bar shows the formula.' }] },
      { kind: 'watch', say: 'Here is why formulas matter. Watch: a late count comes in, and Saturday’s hoodies change from 9 to 30.',
        changes: [{ cell: 'C3', from: 9, to: 30 }], show: ['C4'],
        done: function (ctx) { return 'C4 changed to ' + shown(ctx.sheet, 'C4') + ' by itself. You did not retype anything: the formula did the work.'; } },
      { kind: 'type', cell: 'C2', say: 'Now you change an input. Click <b>C2</b> and type <b>20</b>, then press Enter. Keep your eye on C4.',
        enter: function (ctx) { ctx.sheet.unlock('C2'); ctx.ui.render(); }, expect: { value: 20, formula: false }, stay: true,
        wrong: [{ when: function (c) { return c.info.type === 'text'; }, msg: 'Type just the number 20.' }],
        ok: function (ctx) { return 'C4 is now ' + shown(ctx.sheet, 'C4') + ': 20 + 30. Change any number and every formula that uses it updates.'; } },
      { kind: 'done', say: '<b>You wrote your first formula.</b> Next: formulas with more than one step.',
        learned: ['A formula starts with <b>=</b>.', '<b>=B2+B3</b> adds the numbers in B2 and B3.', 'The cell shows the answer. The <b>formula bar</b> shows the formula.', 'When an input changes, the formula updates itself.'] }
    ]
  });

  /* ===================== 4 ===================== */
  XL.add({
    id: 'lesson-4', n: 4, title: 'Order of operations in a formula', blurb: 'Price times shirts, plus a fee, plus tax: the parentheses decide the total.',
    scenario: 'The club is ordering 40 T-shirts at $12 each. The shop adds a $35 setup fee, then 8% sales tax on the whole order, fee included. What is the total?',
    sheet: { name: 'Order total', rows: 8, cols: 2, widths: { A: 150, B: 112 }, start: 'A1',
      setup: function (s) { s.set('A1', 'Price per shirt'); s.set('B1', '$12'); s.set('A2', 'Shirts'); s.set('B2', 40); s.set('A3', 'Setup fee'); s.set('B3', '$35'); s.set('A4', 'Sales tax'); s.set('B4', '8%');
        s.set('A5', 'Shirts + fee'); s.set('A6', 'Total with tax'); s.bold('A6'); s.format('B5:B6', 'currency'); s.lock('A1:B4'); s.lock('A5:A6'); } },
    ui: { tools: ['undo'] },
    steps: [
      { kind: 'info', say: 'In a formula, <b>*</b> means times. Watch: the cursor types <b>=B1*B2+B3</b> in B5: price times shirts, plus the fee. Excel does * before +, like math class: 12 × 40 = 480, then 480 + 35 = $515.00.',
        demo: [{ click: 'B5', say: 'Click B5' }, { type: '=B1*B2+B3', say: 'Type =B1*B2+B3' }, { enter: true, say: 'Press Enter' }], demoArea: 'B5' },
      { kind: 'type', cell: 'B6', say: 'Now the tax. The shop taxes the whole order, fee included: (shirts + fee) × (1 + tax). Click <b>B6</b> and type <b>=(B1*B2+B3)*(1+B4)</b>. The parentheses tell Excel what to do first. Tip: while you type, you can click a cell, like B1, to put its address in your formula.',
        expect: { value: 556.2, tol: 0.005 }, wrong: XL.orderWrongs('B6', 'B1', 'B2', 'B3', 'B4'),
        ok: 'B6 shows $556.20. The parentheses made Excel add the shirts and the fee before it added the tax.' },
      { kind: 'watch', say: 'Watch: the club’s order grows from 40 shirts to 100.', changes: [{ cell: 'B2', from: 40, to: 100 }], show: ['B6', 'B5'],
        done: function (ctx) { return 'The total is now ' + shown(ctx.sheet, 'B6') + ' for 100 shirts. Same formula, new order: one formula is right for every order size.'; } },
      { kind: 'choice', say: 'Quick check: what does Excel get for <b>=2+3*4</b>?',
        choices: [
          { t: '20', why: 'That adds first. Excel multiplies first: 3*4 = 12, then 2 + 12 = 14.' },
          { t: '14', ok: true, why: 'Right: * before +. 3*4 = 12, then 2 + 12 = 14. To add first, use parentheses: =(2+3)*4 is 20.' },
          { t: '24', why: 'Excel multiplies first: 3*4 = 12, then adds 2, so the answer is 14.' }
        ] },
      { kind: 'done', say: '<b>You can control the order of a formula.</b> Next: copy one formula down a whole column.',
        learned: ['<b>*</b> means times. Excel does * and / before + and -.', 'Parentheses go first: <b>=(B1*B2+B3)*(1+B4)</b> taxes the whole order.', 'A percent cell like 8% holds 0.08, so 1+B4 is 1.08.', 'One formula is right for every order size.'] }
    ]
  });

  /* ===================== 5 ===================== */
  var SNACKS = [['Water', 1, 48, 62], ['Granola bar', 1.5, 30, 41], ['Popcorn', 2, 26, 35], ['Hot chocolate', 2.5, 34, 52], ['Cookie', 0.75, 40, 55]];
  XL.SNACKS = SNACKS;
  XL.add({
    id: 'lesson-5', n: 5, title: 'Fill down', blurb: 'Write a formula once and copy it down a column: first with the button, then with the fill handle.',
    scenario: 'The club ran a snack stand at Friday’s and Saturday’s games. How much money did each snack bring in each night?',
    sheet: { name: 'Snack stand', rows: 8, cols: 6, widths: { A: 116, B: 66, C: 76, D: 98, E: 82, F: 104 }, start: 'A1',
      setup: function (s) {
        ['Snack', 'Price', 'Fri sold', 'Fri money', 'Sat sold', 'Sat money'].forEach(function (h, j) { s.set(R.A1(1, j + 1), h); }); s.bold('A1:F1');
        SNACKS.forEach(function (x, i) { var r = i + 2; s.set('A' + r, x[0]); s.setValue('B' + r, x[1]); s.set('C' + r, x[2]); s.set('E' + r, x[3]); });
        s.format('B2:B6', 'currency'); s.format('D2:D6', 'currency'); s.format('F2:F6', 'currency');
        s.lock('A1:F1'); s.lock('A2:C6'); s.lock('E2:E6');
      } },
    ui: { tools: ['fill', 'undo'] },
    steps: [
      { kind: 'info', say: 'Watch: the cursor types <b>=B2*C2</b> in D2: water’s price times how many sold on Friday. Typing that again for every snack would take a while. A spreadsheet can copy it for you.',
        demo: [{ click: 'D2', say: 'Click D2' }, { type: '=B2*C2', say: 'Type =B2*C2' }, { enter: true, say: 'Press Enter' }], demoArea: 'D2:D6' },
      { kind: 'fill', src: 'D2', range: 'D2:D6', say: 'Copy it down: click <b>D2</b>, the cell with the formula, then press <b>Fill down</b>. It copies D2 into the cells below, as far as the table goes.',
        targets: function () { return [{ range: 'D2:D6', values: SNACKS.map(function (x) { return x[1] * x[2]; }), tol: 0.005 }]; },
        ok: 'Fill down filled D3 to D6 in one step.',
        callouts: [{ at: 'btn:fill', title: 'Fill down', text: 'Copies the top cell of a selection into the cells below it.' }] },
      { kind: 'click', cell: 'D4', say: 'Click <b>D4</b> and look at the formula bar.',
        ok: 'D4 says =B4*C4. When the formula moved down two rows, its row numbers moved with it. That is why one formula works for every row.' },
      { kind: 'type', cell: 'F2', say: 'Now Saturday. Click <b>F2</b> and type the formula for water’s Saturday money: price times Saturday sold, <b>=B2*E2</b>.',
        expect: { value: 62, tol: 0.005 },
        wrong: [{ when: function (c) { return /C2/.test(c.f); }, msg: 'That uses C2, Friday’s count. Saturday’s count is in E2: =B2*E2.' }],
        ok: 'F2 shows $62.00.' },
      { kind: 'fill', via: 'handle', src: 'F2', range: 'F2:F6', say: 'This time use the <b>fill handle</b>: the small square at the bottom right corner of the selected cell. Watch, then click F2 and drag its fill handle down to <b>F6</b>.',
        demo: [{ click: 'F2', say: 'Click F2' }, { drag: { from: 'F2', to: 'F6' }, say: 'Drag the fill handle down to F6' }],
        targets: function () { return [{ range: 'F2:F6', values: SNACKS.map(function (x) { return x[1] * x[3]; }), tol: 0.005 }]; },
        ok: 'Every snack has its Saturday money. In Excel, you can also double-click the fill handle to fill down as far as the table goes.',
        callouts: [{ at: 'handle', title: 'Fill handle', text: 'Drag this small square down to copy the cell into the cells you drag over.' }] },
      { kind: 'done', say: '<b>You can fill a formula down a column.</b> Next: what to do when part of a formula must not move.',
        learned: ['<b>Fill down</b> copies a formula into the cells below.', 'The <b>fill handle</b>, the small square at the corner, does the same when you drag it.', 'References like B2 move with the formula: in row 4, B2 becomes B4.', 'Shortcut for Fill down: select the cells and press <b>Ctrl+D</b>.'] }
    ]
  });

  /* ===================== 6 ===================== */
  var HOURS = [12, 15, 9, 18];
  XL.HOURS = HOURS;
  XL.add({
    id: 'lesson-6', n: 6, title: 'Lock a reference with $', blurb: 'Some cells must stay put when you fill. The $ Lock ref button first, then the F4 shortcut.',
    scenario: 'You work weekends for $15.50 an hour, and you save 20% of every paycheck. Work out each week’s pay and how much you save.',
    sheet: { name: 'Paycheck', rows: 10, cols: 4, widths: { A: 140, B: 78, C: 96, D: 96 }, start: 'A1',
      setup: function (s) {
        s.set('A1', 'Hourly wage'); s.set('B1', '$15.50'); s.set('A2', 'Save this much'); s.set('B2', '20%');
        ['Week', 'Hours', 'Pay', 'Save'].forEach(function (h, j) { s.set(R.A1(4, j + 1), h); }); s.bold('A4:D4');
        HOURS.forEach(function (h, i) { s.set('A' + (i + 5), 'Week ' + (i + 1)); s.set('B' + (i + 5), h); });
        s.format('C5:D8', 'currency'); s.lock('A1:B2'); s.lock('A4:D4'); s.lock('A5:B8');
      } },
    ui: { tools: ['fill', 'dollar', 'undo'] },
    steps: [
      { kind: 'type', cell: 'C5', say: 'Pay is hours times your wage. Click <b>C5</b> and type <b>=B5*B1</b>, then press Enter.', expect: { value: 186, tol: 0.005 },
        wrong: [{ when: function (c) { return near(c.value, 3); }, msg: 'That multiplies by B2, the 20%. The wage is in B1: =B5*B1.' }],
        ok: 'C5 shows $186.00: 12 hours × $15.50.' },
      { kind: 'fill', src: 'C5', range: 'C5:C8', say: 'Copy it down for the other weeks: click <b>C5</b>, then press <b>Fill down</b>.',
        ok: function (ctx) { return 'Hmm. Look at C6 to C8: ' + ['C6', 'C7', 'C8'].map(function (a) { return shown(ctx.sheet, a); }).join(', ') + '. Something went wrong.'; } },
      { kind: 'click', cell: 'C6', say: 'Click <b>C6</b> and read its formula in the formula bar.',
        ok: 'C6 says =B6*B2. The hours moved down to B6, which is right. But the wage moved down too, from B1 to B2, and B2 is not the wage. Every week needs the wage in B1.' },
      { kind: 'dollar', cell: 'C5', want: '$B$1', say: 'The fix: lock B1 with $ signs. <b>$B$1</b> means “always B1”, even when the formula moves. Watch: the cursor clicks C5 and presses <b>$ Lock ref</b>, and B1 becomes $B$1. Then you do it: click <b>C5</b> and press <b>$ Lock ref</b>.',
        demo: [{ click: 'C5', say: 'Click C5' }, { dollar: true, say: 'Press $ Lock ref: B1 becomes $B$1' }, { wait: 1300 }, { cancel: true }],
        ok: 'The formula bar says =B5*$B$1 now. Next, save it.',
        callouts: [{ at: 'btn:dollar', title: '$ Lock ref', text: 'Adds $ signs to the cell reference next to the cursor, so it stays put when the formula moves.' }] },
      { kind: 'type', cell: 'C5', say: 'Press <b>Enter</b> to save the locked formula.', typeLabel: 'Press Enter',
        skipIf: function (ctx) { return !ctx.ui.isEditing() && /\$B\$1/.test(ctx.sheet.formula('C5') || ''); },
        expect: { value: 186, tol: 0.005, mustUse: ['$B$1'] },
        ok: 'Saved. C5 still shows $186.00: the $ signs do not change this answer. They matter when you fill.' },
      { kind: 'fill', src: 'C5', range: 'C5:C8', say: 'Fill it down again: click <b>C5</b>, then press <b>Fill down</b>.',
        targets: function () { return [{ range: 'C5:C8', values: HOURS.map(function (h) { return h * 15.5; }), tol: 0.005, mustUse: ['$B$1'] }]; },
        ok: function (ctx) { return 'Every week is right now: ' + ['C5', 'C6', 'C7', 'C8'].map(function (a) { return shown(ctx.sheet, a); }).join(', ') + '. C6 says =B6*$B$1: the hours moved, the wage stayed locked.'; } },
      { kind: 'type', cell: 'D5', say: 'Now the savings: pay times 20%. Click <b>D5</b> and type <b>=C5*B2</b>. Before you press Enter, press <b>F4</b>: it is the keyboard shortcut for $ Lock ref, so B2 becomes $B$2. No F4 key, or it does something else? Press $ Lock ref instead.',
        expect: { value: 37.2, tol: 0.005, mustUse: ['B$2'] },
        ok: 'D5 shows $37.20, and its formula says =C5*$B$2.' },
      { kind: 'fill', src: 'D5', range: 'D5:D8', say: 'Fill it down: click <b>D5</b>, then press <b>Fill down</b>. (Shortcut: Ctrl+D.)',
        targets: function () { return [{ range: 'D5:D8', values: HOURS.map(function (h) { return h * 15.5 * 0.2; }), tol: 0.005, mustUse: ['B$2'] }]; },
        ok: 'Each week saves 20% of its pay.' },
      { kind: 'watch', say: 'Watch: you get a raise to $16.25 an hour.', changes: [{ cell: 'B1', from: '$15.50', to: '$16.25' }], show: ['C5', 'C6', 'C7', 'C8', 'D5', 'D6', 'D7', 'D8'], showLabel: 'All updated',
        done: function (ctx) { return 'Every pay and every saving updated, because every formula points at B1 and B2. Week 1 pays ' + shown(ctx.sheet, 'C5') + ' now.'; } },
      { kind: 'done', say: '<b>You can lock a reference.</b> Next: functions that add up a whole column.',
        learned: ['A reference like B1 moves when you fill a formula.', 'A $ locks it: <b>$B$1</b> always means B1.', 'Press <b>$ Lock ref</b>, or the shortcut <b>F4</b>, to add the $ signs.', 'Lock the cells that hold one value for every row, like a wage or a tax rate.'] }
    ]
  });

  /* ===================== 7 ===================== */
  var PAY = HOURS.map(function (h) { return h * 15.5; });
  XL.PAY = PAY;
  var rangeWrongs = function (cell, fn) {
    return [
      { when: function (c) { return pastRow(c.f, 'B', 5); }, msg: 'Your range runs past B5. Use only the four paychecks: B2:B5.' },
      { when: function (c) { return /B2,B5\)/.test(c.f); }, msg: 'A comma means just those two cells. A colon means every cell from B2 to B5: =' + fn + '(B2:B5).' }
    ];
  };
  XL.add({
    id: 'lesson-7', n: 7, title: 'SUM, AVERAGE, MIN and MAX', blurb: 'Functions that add up, average and find the smallest and biggest numbers in a column.',
    scenario: 'Here are your four weekend paychecks this month. What did you earn in all, on average, and in your smallest and biggest weeks?',
    sheet: { name: 'Paychecks', rows: 11, cols: 2, widths: { A: 120, B: 112 }, start: 'A1',
      setup: function (s) {
        s.set('A1', 'Paycheck'); s.set('B1', 'Amount'); s.bold('A1:B1');
        PAY.forEach(function (p, i) { s.set('A' + (i + 2), 'Week ' + (i + 1)); s.setValue('B' + (i + 2), p); });
        s.set('A7', 'Total'); s.set('A8', 'Average'); s.set('A9', 'Smallest'); s.set('A10', 'Biggest'); s.bold('A7');
        s.format('B2:B10', 'currency'); s.lock('A1:B5'); s.lock('A7:A10');
      } },
    ui: { tools: ['fill', 'dollar', 'undo'] },
    steps: [
      { kind: 'type', cell: 'B8', say: 'A <b>function</b> is a built-in formula with a name. Watch: the cursor types <b>=SUM(B2:B5)</b> in B7. <b>B2:B5</b> means every cell from B2 to B5. Then your turn: in <b>B8</b>, type <b>=AVERAGE(B2:B5)</b>. You can type B2:B5, or drag over B2 to B5 while you type.',
        demo: [{ click: 'B7', say: 'Click B7' }, { type: '=SUM(B2:B5)', say: 'Type =SUM(B2:B5)' }, { enter: true, say: 'Press Enter' }], demoArea: 'B7',
        expect: { value: 209.25, tol: 0.005 }, wrong: rangeWrongs('B8', 'AVERAGE'),
        ok: 'B8 shows $209.25, your average paycheck.' },
      { kind: 'type', cell: 'B9', say: 'In <b>B9</b>, find the smallest paycheck: <b>=MIN(B2:B5)</b>.', expect: { value: 139.5, tol: 0.005 }, wrong: rangeWrongs('B9', 'MIN'), ok: 'B9 shows $139.50: week 3.' },
      { kind: 'type', cell: 'B10', say: 'In <b>B10</b>, find the biggest: <b>=MAX(B2:B5)</b>.', expect: { value: 279, tol: 0.005 }, wrong: rangeWrongs('B10', 'MAX'), ok: 'B10 shows $279.00: week 4.' },
      { kind: 'watch', say: 'Watch: your boss adds a shift in week 3, so that paycheck grows from $139.50 to $201.50.', changes: [{ cell: 'B4', from: 139.5, to: '$201.50' }], show: ['B7', 'B8', 'B9', 'B10'], showLabel: 'All updated',
        done: function (ctx) { return 'All four answers updated. The total is now ' + shown(ctx.sheet, 'B7') + ', and the smallest paycheck is week 1’s, ' + shown(ctx.sheet, 'B9') + '.'; } },
      { kind: 'done', say: '<b>You can sum and average a column.</b> Next: let the sheet make a decision with IF.',
        learned: ['<b>=SUM(B2:B5)</b> adds every cell from B2 to B5.', '<b>AVERAGE</b>, <b>MIN</b> and <b>MAX</b> work the same way.', 'A colon means a range: B2:B5. A comma means just those cells.', 'Change any paycheck and all four answers update.'] }
    ]
  });

  /* ===================== 8 ===================== */
  var BUDGET = [['Food', 60, 72], ['Gas', 40, 35], ['Fun', 50, 50], ['Clothes', 45, 58]];
  XL.BUDGET = BUDGET;
  XL.add({
    id: 'lesson-8', n: 8, title: 'IF: let the sheet decide', blurb: 'Over budget or OK? IF checks a test and picks one of two answers.',
    scenario: 'You set a budget for each kind of spending this month. Which ones did you go over?',
    sheet: { name: 'Budget check', rows: 7, cols: 4, widths: { A: 96, B: 84, C: 84, D: 124 }, start: 'A1',
      setup: function (s) {
        ['Category', 'Budget', 'Spent', 'Status'].forEach(function (h, j) { s.set(R.A1(1, j + 1), h); }); s.bold('A1:D1');
        BUDGET.forEach(function (b, i) { var r = i + 2; s.set('A' + r, b[0]); s.setValue('B' + r, b[1]); s.setValue('C' + r, b[2]); });
        s.format('B2:C5', 'currency'); s.lock('A1:D1'); s.lock('A2:C5');
      } },
    ui: { tools: ['fill', 'dollar', 'undo'] },
    steps: [
      { kind: 'type', cell: 'D3', say: '<b>IF</b> checks something, then picks one of two answers. Watch: in D2 the cursor types <b>=IF(C2&gt;B2,"Over budget","OK")</b>. It means: if spent is more than the budget, show Over budget; if not, show OK. Then your turn: in <b>D3</b>, do the same for gas, using row 3: <b>=IF(C3&gt;B3,"Over budget","OK")</b>.',
        demo: [{ click: 'D2', say: 'Click D2' }, { type: '=IF(C2>B2,"Over budget","OK")', say: 'Type the IF formula' }, { enter: true, say: 'Press Enter' }], demoArea: 'D2',
        expect: { value: 'OK' },
        wrong: [
          { when: function (c) { return c.info.formula && !/"/.test(c.text) && /OVER|OK/.test(c.f) && !!(c.info.error || c.info.parseError); }, msg: 'Words inside a formula need double quotes around them: "Over budget" and "OK".' },
          { when: function (c) { return c.info.formula && /C2|B2/.test(c.f); }, msg: 'That formula uses row 2, the food row. For gas, use row 3: C3 and B3.' },
          { when: function (c) { return c.info.formula && /B3>C3/.test(c.f); }, msg: 'Your formula says Over budget when you spent less. Check which way the &gt; points: spent (C3) &gt; budget (B3).' }
        ],
        ok: 'D3 shows OK: you spent $35 of your $40 gas budget.' },
      { kind: 'fill', src: 'D3', range: 'D3:D5', allow: 'D2:D5', lockTyping: false, say: 'Copy it down to the last row: click <b>D3</b>, then press <b>Fill down</b>.',
        targets: function () { return [{ range: 'D3:D5', values: ['OK', 'OK', 'Over budget'] }]; },
        bad: function (res, ctx) {
          if (res.cell === 'D4' && res.actual === 'Over budget') return 'D4 says Over budget, but you spent exactly your $50 budget, and that is OK. Your formula uses &gt;= (at least). Use &gt; (more than): click D3, fix it, press Enter, then fill down again.';
          return XL.friendly(res) + ' Fix D3, then fill down again.';
        },
        ok: 'Clothes says Over budget: $58 spent on a $45 budget. Fun says OK: $50 is not more than $50.' },
      { kind: 'watch', say: 'Watch: you buy $8 more gas, so gas spending goes from $35 to $43.', changes: [{ cell: 'C3', from: 35, to: '$43' }], show: ['D3'],
        done: 'D3 switched to Over budget by itself. IF checks again every time a number changes.' },
      { kind: 'done', say: '<b>Your sheet can make decisions.</b> Next: turn numbers into a chart.',
        learned: ['<b>=IF(test, answer if true, answer if false)</b>', 'Put words in double quotes: "OK".', '<b>&gt;</b> means more than. <b>&gt;=</b> means more than or equal to.', 'IF updates itself when the numbers change.'] }
    ]
  });

  /* ===================== 9 ===================== */
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  XL.add({
    id: 'lesson-9', n: 9, title: 'Make a chart', blurb: 'Type your own numbers, select them and insert a column chart. Then switch it to a line chart.',
    scenario: 'How many minutes did you practice, study or exercise each day this week? Use your own numbers, or make some up, and chart them.',
    sheet: { name: 'My week', rows: 8, cols: 2, widths: { A: 90, B: 150 }, start: 'A1',
      setup: function (s) { s.set('A1', 'Day'); s.set('B1', 'Minutes'); s.bold('A1:B1'); DAYS.forEach(function (d, i) { s.set('A' + (i + 2), d); }); s.lock('A1:B1'); s.lock('A2:A6'); } },
    ui: { tools: ['undo'], buttons: ['chart'] },
    chart: function (ctx, sel) {
      var g = R.parseRange(sel);
      var inside = g.r1 >= 1 && g.r2 <= 6 && g.c1 >= 1 && g.c2 <= 2;
      if (!inside) return 'Select your table first: drag from A1 to B6, then press Insert chart.';
      return { type: 'column', x: 'A2:A6', y: 'B2:B6', title: 'Minutes each day' };
    },
    steps: [
      { kind: 'free', allow: 'B2:B6', glowRange: 'B2:B6', say: 'Type a number of minutes for each day, Monday to Friday, in <b>B2</b> to <b>B6</b>. Press Enter after each one: Enter moves you down to the next day.',
        first: function (ctx) { for (var r = 2; r <= 6; r++) if (typeof ctx.sheet.get('B' + r) !== 'number') return 'B' + r; return null; },
        test: function (ctx) {
          var n = 0, bad = null;
          for (var r = 2; r <= 6; r++) { var v = ctx.sheet.get('B' + r); if (typeof v === 'number') { if (v < 0 && !bad) bad = 'B' + r + ' is below zero. Minutes start at 0.'; else n++; } else if (typeof v === 'string' && !bad) bad = 'B' + r + ' holds the words “' + esc(v) + '”. Type just the number, like 30. The heading already says Minutes.'; }
          if (bad) return bad;
          return n === 5 ? true : (n ? n + ' of 5 days done.' : '');
        },
        ok: 'Your week is in the sheet.' },
      { kind: 'select', from: 'A1', glow2: 'A1:B6', say: 'Select your table: point at <b>A1</b>, hold the mouse button down and drag to <b>B6</b>. Or click A1, hold Shift and click B6. On a touch screen, just tap any cell in the table.',
        test: function (sel) {
          var g = R.parseRange(sel);
          if (sel === 'A1:B6' || sel === 'A2:B6') return true;
          if (XL.coarse() && g.r1 >= 1 && g.r2 <= 6 && g.c2 <= 2) return true;
          if (g.r1 === g.r2 && g.c1 === g.c2) return null;
          return 'You selected ' + sel + '. Drag from A1 to B6 so the whole table is inside.';
        },
        ok: 'Your table is selected.' },
      { kind: 'chart', say: 'Press <b>Insert chart</b>.', ok: 'There is your chart. Each column is one day.', callouts: [{ at: 'btn:chart', title: 'Insert chart', text: 'Makes a chart from the cells you selected.' }] },
      { kind: 'type', cell: 'B4', say: 'Change one number: click <b>B4</b> (Wednesday) and type a different number of minutes. Then press Enter and watch the chart.',
        enter: function (ctx) { ctx.data.wed = ctx.sheet.get('B4'); },
        test: function (c) { return typeof c.value !== 'number' ? 'Type just a number of minutes.' : c.value === c.ctx.data.wed ? 'That is the same number. Type a different one.' : c.value < 0 ? 'Minutes start at 0.' : true; },
        ok: 'The Wednesday column moved by itself. A chart reads its cells again every time they change.' },
      { kind: 'charttype', want: 'line', say: 'Try a line chart: press <b>Line</b> above the chart.',
        ok: 'A line chart shows change from day to day. Column charts compare amounts; line charts show a trend over time.' },
      { kind: 'info', say: '<b>One honest note:</b> this chart stays on this page. The Excel file you download has your numbers and formulas, but not the chart. In Excel, select the same cells, open the <b>Insert</b> tab and pick a chart.' },
      { kind: 'done', say: '<b>You made a chart.</b> Next: the math a science lab report needs.',
        learned: ['Select the cells, then insert a chart.', 'The chart redraws itself when a number changes.', 'Column charts compare amounts. Line charts show change over time.', 'In Excel: select the cells, then Insert, then pick a chart.'] }
    ]
  });

  /* ===================== 10 ===================== */
  var DENS = [2.62, 2.75, 2.68, 2.71, 2.66], VOL = [5, 10, 15, 20, 25], MASS = [13.4, 27.1, 40.2, 54.3, 67.4];
  function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / a.length; }
  function sdS(a) { var m = mean(a); return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / (a.length - 1)); }
  function sdP(a) { var m = mean(a); return Math.sqrt(a.reduce(function (s, x) { return s + (x - m) * (x - m); }, 0) / a.length); }
  function slope(x, y) { var xm = mean(x), ym = mean(y), sxy = 0, sxx = 0; x.forEach(function (v, i) { sxy += (v - xm) * (y[i] - ym); sxx += (v - xm) * (v - xm); }); return sxy / sxx; }
  XL.LAB = { DENS: DENS, VOL: VOL, MASS: MASS, mean: mean, sdS: sdS, slope: slope };
  XL.add({
    id: 'lesson-10', n: 10, title: 'Science basics: lab data', blurb: 'AVERAGE of trials, STDEV.S, percent error and SLOPE, on real-looking lab data.',
    scenario: 'Your lab group measured the density of aluminum five times, then massed five aluminum blocks of different sizes. How good is your data? The accepted density of aluminum is 2.70 g/cm³.',
    sheet: { name: 'Density lab', rows: 12, cols: 5, widths: { A: 132, B: 116, C: 18, D: 112, E: 92 }, start: 'A1',
      setup: function (s) {
        s.set('A1', 'Trial'); s.set('B1', 'Density (g/cm³)'); s.set('D1', 'Volume (cm³)'); s.set('E1', 'Mass (g)'); s.bold('A1:E1');
        DENS.forEach(function (d, i) { s.set('A' + (i + 2), i + 1); s.setValue('B' + (i + 2), d); s.setValue('D' + (i + 2), VOL[i]); s.setValue('E' + (i + 2), MASS[i]); });
        s.format('B2:B6', 'fixed:2'); s.format('E2:E6', 'fixed:1');
        s.set('A8', 'Accepted'); s.setValue('B8', 2.7); s.format('B8', 'fixed:2');
        s.set('A9', 'Mean'); s.set('A10', 'Spread (STDEV.S)'); s.set('A11', '% error'); s.format('B9:B10', 'fixed:3'); s.format('B11', { type: 'percent', dp: 2 });
        s.set('D8', 'Slope'); s.format('E8', 'fixed:3');
        s.lock('A1:E1'); s.lock('A2:B6'); s.lock('D2:E6'); s.lock('A8:B8'); s.lock('A9:A11'); s.lock('D8');
      } },
    ui: { tools: ['fill', 'dollar', 'undo'] },
    steps: [
      { kind: 'type', cell: 'B10', say: 'Lab data goes in a column, one row per trial. Watch: the cursor finds the mean with <b>=AVERAGE(B2:B6)</b> in B9. Then your turn: in <b>B10</b>, find how spread out your trials are with <b>=STDEV.S(B2:B6)</b>, the sample standard deviation. Same shape, new name.',
        demo: [{ click: 'B9', say: 'Click B9' }, { type: '=AVERAGE(B2:B6)', say: 'Type =AVERAGE(B2:B6)' }, { enter: true, say: 'Press Enter' }], demoArea: 'B9',
        expect: { value: sdS(DENS), tol: 1e-9 },
        wrong: [
          { when: function (c) { return near(c.value, sdP(DENS), 1e-9); }, msg: 'That is STDEV.P, the spread of a whole population. For a handful of lab trials, use STDEV.S (S for sample): =STDEV.S(B2:B6).' },
          { when: function (c) { return pastRow(c.f, 'B', 6); }, msg: 'Your range runs past B6. Use only the five trials: B2:B6.' }
        ],
        ok: function (ctx) { return 'B10 shows ' + shown(ctx.sheet, 'B10') + ' g/cm³. A small spread means your trials agree with each other.'; } },
      { kind: 'type', cell: 'B11', say: 'How close is your mean to the accepted 2.70? <b>Percent error</b> = |mean − accepted| ÷ accepted. In <b>B11</b>, type <b>=ABS(B9-B8)/B8</b>. ABS drops any minus sign, so the error is never negative. B11 already shows a percent.',
        expect: { value: Math.abs(mean(DENS) - 2.7) / 2.7, tol: 1e-9 },
        wrong: [
          { when: function (c) { return near(c.value, -Math.abs(mean(DENS) - 2.7) / 2.7, 1e-9); }, msg: 'B11 shows a negative percent. Wrap the difference in ABS( ) so it is never negative: =ABS(B9-B8)/B8.' },
          { when: function (c) { return near(c.value, mean(DENS) - 1, 1e-9); }, msg: 'Excel divided before it subtracted. Put the subtraction inside parentheses: =ABS(B9-B8)/B8.' }
        ],
        ok: function (ctx) { return 'B11 shows ' + shown(ctx.sheet, 'B11') + '. Your mean is within 1% of the accepted value.'; } },
      { kind: 'type', cell: 'E8', say: 'Now the blocks. Mass grows with volume, and the <b>slope</b> of mass against volume is the density. In <b>E8</b>, type <b>=SLOPE(E2:E6,D2:D6)</b>. SLOPE takes the y values (mass) first, then the x values (volume).',
        expect: { value: slope(VOL, MASS), tol: 1e-9 },
        wrong: [{ when: function (c) { return near(c.value, slope(MASS, VOL), 1e-6); }, msg: 'Those ranges are swapped. SLOPE takes the y values (mass) first: =SLOPE(E2:E6,D2:D6).' }],
        ok: function (ctx) { return 'E8 shows ' + shown(ctx.sheet, 'E8') + ' g/cm³: the density from your blocks, close to 2.70.'; } },
      { kind: 'watch', say: 'Watch: you find a copying mistake. Trial 1 was really 2.68, not 2.62.', changes: [{ cell: 'B2', from: 2.62, to: 2.68 }], show: ['B9', 'B10', 'B11'], showLabel: 'All updated',
        done: function (ctx) { var s = ctx.sheet; return 'The mean is now ' + shown(s, 'B9') + ', the spread shrank to ' + shown(s, 'B10') + ', and the percent error fell to ' + shown(s, 'B11') + '. Fix the data once and every result follows.'; } },
      { kind: 'done', say: '<b>You can analyze lab data.</b> Next: download a sheet and open it in real Excel.',
        learned: ['<b>AVERAGE</b> finds the mean of your trials.', '<b>STDEV.S</b> finds their spread (S for a sample).', 'Percent error: <b>=ABS(mean - accepted)/accepted</b>.', '<b>SLOPE(y values, x values)</b> finds a rate, like grams per cm³.'] }
    ]
  });

  /* ===================== 11 ===================== */
  var SPEND = [['Food', 72], ['Gas', 35], ['Fun', 50], ['Clothes', 58], ['Phone', 35]];
  XL.SPEND = SPEND;
  XL.add({
    id: 'lesson-11', n: 11, title: 'Open it in Excel', blurb: 'Finish a budget, download it, open it in real Excel, save it and turn it in on Canvas.',
    scenario: 'Finish your monthly budget, download it, and open it in real Excel. Then save it and turn it in on Canvas.',
    filename: 'monthly-budget',
    sheet: { name: 'Monthly budget', rows: 11, cols: 2, widths: { A: 140, B: 112 }, start: 'A1',
      setup: function (s) {
        s.set('A1', 'Monthly budget'); s.bold('A1'); s.set('A2', 'Paychecks'); s.setValue('B2', 837);
        s.set('A3', 'Spending'); s.bold('A3');
        SPEND.forEach(function (x, i) { s.set('A' + (i + 4), x[0]); s.setValue('B' + (i + 4), x[1]); });
        s.set('A9', 'Total spent'); s.set('A10', 'Left to save'); s.bold('A9:A10');
        s.format('B2', 'currency'); s.format('B4:B10', 'currency'); s.lock('A1:B8'); s.lock('A9:A10');
      } },
    ui: { tools: ['fill', 'dollar', 'undo'], download: true },
    steps: [
      { kind: 'type', cell: 'B9', say: 'Add up your spending: in <b>B9</b>, type <b>=SUM(B4:B8)</b>.', expect: { value: 250, tol: 0.005 },
        wrong: [{ when: function (c) { return /B[23]:/.test(c.f); }, msg: 'Your range starts above the spending and includes your paychecks. Spending is B4 to B8: =SUM(B4:B8).' }, { when: function (c) { return pastRow(c.f, 'B', 8); }, msg: 'Your range runs past B8. Spending is B4 to B8.' }],
        ok: 'B9 shows $250.00 spent.' },
      { kind: 'type', cell: 'B10', say: 'What is left to save? In <b>B10</b>, type <b>=B2-B9</b>: paychecks minus spending.', expect: { value: 587, tol: 0.005 }, ok: 'B10 shows $587.00 left to save. Your budget is done.' },
      { kind: 'download', say: 'Press <b>Download as Excel file</b>. Your browser saves a copy of this sheet, with your formulas, as an Excel file.',
        ok: function (ctx) { return 'Downloaded. The file is called <b>' + esc(ctx.data.downloaded || 'monthly-budget.xlsx') + '</b>.'; },
        callouts: [{ at: 'btn:download', title: 'Download as Excel file', text: 'Saves this sheet as an .xlsx file, the kind Excel opens.' }] },
      { kind: 'card', say: 'Now open it in real Excel. Pick the Excel you will use, then follow each picture.', next: 'I turned it in',
        render: function (box, ctx) { XL.openCard(box, { file: ctx.data.downloaded || 'monthly-budget.xlsx' }); } },
      { kind: 'done', say: '<b>Your work is in real Excel.</b> Last lesson: the two kinds of Excel, and when to use which.',
        learned: ['<b>Download as Excel file</b> saves an .xlsx file with your formulas.', 'Excel for the web: excel.office.com, signed in with your RJ account.', 'The desktop app: open the file, then click <b>Enable Editing</b>.', 'Turn it in: attach the .xlsx file to the Canvas assignment.'] }
    ]
  });

  /* ===================== 12 ===================== */
  XL.add({
    id: 'lesson-12', n: 12, title: 'Two Excels: web and desktop', blurb: 'Excel for the web and the desktop app: same file, same formulas. When to use which.',
    scenario: 'Excel comes two ways: in your browser and as an app on your laptop. Same file, same formulas. Here is when to use which.',
    sheet: null,
    steps: [
      { kind: 'card', say: 'Read the card, then answer three quick questions.', next: 'Next: 3 questions', render: function (box) { XL.twoExcelsCard(box); } },
      { kind: 'choice', say: '<b>Question 1 of 3.</b> You need a t-Test from the Data Analysis button. Which Excel?',
        choices: [
          { t: 'Excel for the web', why: 'Not this time. The Data Analysis button is only in the desktop app. In Excel for the web, choose Editing &gt; Open in Desktop App and keep going in the same file.' },
          { t: 'The desktop app', ok: true, why: 'Right. The Data Analysis button, with Regression, t-Test and Histogram, is only in the desktop app.' },
          { t: 'Either one', why: 'The Data Analysis button is only in the desktop app.' }
        ] },
      { kind: 'choice', say: '<b>Question 2 of 3.</b> You and your lab partner are writing one lab report at the same time. Which Excel?',
        choices: [
          { t: 'Excel for the web', ok: true, why: 'Best answer. Excel for the web is built for it: you both open the same file and see each other’s changes, on any device with nothing to install. (The desktop app can also share a file saved in OneDrive, but the web is the easy choice.)' },
          { t: 'The desktop app', why: 'It can share a file saved in OneDrive, but Excel for the web is built for this: any device, nothing to install, and you both edit at once. The best answer is Excel for the web.' },
          { t: 'Neither: email the file back and forth', why: 'That makes two copies that do not match. You can both edit one file at the same time in Excel for the web.' }
        ] },
      { kind: 'choice', say: '<b>Question 3 of 3.</b> Can you use <b>=STDEV.S</b> in Excel for the web?',
        choices: [
          { t: 'Yes', ok: true, why: 'Yes. Everyday formulas like STDEV.S, AVERAGE and SLOPE work in both. Only the heavy tools are desktop only.' },
          { t: 'No, only in the desktop app', why: 'It works in both. Excel for the web supports most formulas, including STDEV.S.' }
        ] },
      { kind: 'done', say: '<b>You finished Spreadsheet basics.</b> Now build a real model: try Build it.',
        learned: ['Same .xlsx file and same formulas in both.', 'Excel for the web: any device, saves itself to OneDrive, edit with a partner at once. Needs internet.', 'The desktop app: the Data Analysis button, Power Pivot, macros, more chart options, very big files, no internet needed.', 'Button missing? Choose <b>Editing &gt; Open in Desktop App</b>.'] }
    ]
  });
})();
