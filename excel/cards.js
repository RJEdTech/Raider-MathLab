/* excel/cards.js: the "Open it in Excel" card (lesson 11 and every Build it project) and the "Two Excels" card (lesson 12).
   Every step has a plain instruction and a picture (Jason's rule: humans are visual). The pictures are simple
   original drawings in SVG: no Microsoft logos or icons, just the word Excel on a plain green tile.
   SCREENSHOT TODO: each figure carries data-replace="..." naming the real screenshot of an ordinary student
   view (not an upgraded Copilot license) that should replace it later. Swap the <svg> for an <img> with the same alt text.
   Microsoft facts used here are the verified list in excel-spec.md (Microsoft Support, checked Nov 6, 2026). */
(function () {
  'use strict';
  var XL = window.XL;
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var W = 320, H = 196;

  /* ---------- drawing helpers (SVG strings, colors from the page's theme tokens via CSS classes) ---------- */
  function r(x, y, w, h, cls, rx) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (rx == null ? 4 : rx) + '" class="' + cls + '"/>'; }
  function t(x, y, s, cls, anchor) { return '<text x="' + x + '" y="' + y + '" class="' + (cls || 'f-t') + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + esc(s) + '</text>'; }
  function btn(x, y, w, label, cls) { return r(x, y, w, 24, cls || 'f-btn', 5) + t(x + w / 2, y + 16, label, cls === 'f-btn-p' ? 'f-t f-tw' : 'f-t f-tb', 'middle'); }
  /* the red outline that marks the one thing to click, with a number badge */
  function hl(x, y, w, h, n) {
    return '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="' + (w + 8) + '" height="' + (h + 8) + '" rx="7" class="f-hl"/>' +
      (n ? '<circle cx="' + (x + w + 4) + '" cy="' + (y - 4) + '" r="10" class="f-badge"/>' + t(x + w + 4, y, String(n), 'f-t f-tw f-sm', 'middle') : '');
  }
  function tile(x, y, w, h) { return r(x, y, w, h, 'f-xl', 5) + t(x + w / 2, y + h / 2 + 4, 'Excel', 'f-t f-tw f-sm', 'middle'); }
  function grid(x, y, cols, rows, cw, rh) {
    var s = '';
    for (var i = 0; i <= rows; i++) s += '<line x1="' + x + '" x2="' + (x + cols * cw) + '" y1="' + (y + i * rh) + '" y2="' + (y + i * rh) + '" class="f-line"/>';
    for (var j = 0; j <= cols; j++) s += '<line x1="' + (x + j * cw) + '" x2="' + (x + j * cw) + '" y1="' + y + '" y2="' + (y + rows * rh) + '" class="f-line"/>';
    return s;
  }
  /* a plain browser window */
  function browser(url, inner) {
    return r(1, 1, W - 2, H - 2, 'f-win', 8) + r(1, 1, W - 2, 30, 'f-chrome', 8) + r(1, 22, W - 2, 10, 'f-chrome', 0) +
      '<circle cx="14" cy="15" r="4" class="f-dot"/><circle cx="26" cy="15" r="4" class="f-dot"/><circle cx="38" cy="15" r="4" class="f-dot"/>' +
      r(52, 7, 214, 17, 'f-url', 8) + t(62, 19, url, 'f-t f-sm f-mut') + inner;
  }
  /* a plain desktop app window */
  function appWin(title, inner) {
    return r(1, 1, W - 2, H - 2, 'f-win', 8) + r(1, 1, W - 2, 28, 'f-xlbar', 8) + r(1, 20, W - 2, 9, 'f-xlbar', 0) +
      t(12, 19, 'Excel', 'f-t f-tw f-b') + t(W / 2, 19, title, 'f-t f-tw f-sm', 'middle') + inner;
  }
  function ribbon(y, tabs) { var s = r(1, y, W - 2, 22, 'f-chrome', 0), x = 12; tabs.forEach(function (tb) { s += t(x, y + 15, tb, 'f-t f-sm'); x += tb.length * 6.4 + 14; }); return s; }
  function fig(svg, alt, replace) {
    return '<figure class="xl-fig" data-replace="' + esc(replace) + '"><svg viewBox="-6 -14 ' + (W + 14) + ' ' + (H + 20) + '" role="img" aria-label="' + esc(alt) + '">' + svg + '</svg></figure>';
  }
  var F = {};
  F.downloads = function (file) {
    return fig(browser('rjedtech.github.io/Raider-MathLab/excel.html',
      '<path d="M296 10 v8 m-4 -4 l4 4 l4 -4 M290 21 h12" class="f-stroke"/>' + hl(286, 6, 20, 20, 1) +
      r(150, 34, 164, 70, 'f-panel', 6) + t(160, 52, 'Recent downloads', 'f-t f-sm f-b') +
      r(160, 60, 22, 26, 'f-file', 3) + t(171, 77, 'xlsx', 'f-t f-xs f-tw', 'middle') + t(190, 72, file, 'f-t f-sm') + t(190, 86, 'Open file', 'f-t f-xs f-link') +
      hl(158, 58, 148, 30, 2) +
      r(14, 44, 120, 10, 'f-ph', 3) + r(14, 62, 100, 10, 'f-ph', 3) + grid(14, 116, 4, 3, 38, 18)),
      'A browser window. Its download arrow, at the top right, is outlined and marked 1. Under it, the recent downloads list shows ' + file + ', outlined and marked 2.',
      'Screenshot: Edge or Chrome on an RJ laptop, downloads panel open, showing the .xlsx file');
  };
  F.signin = function () {
    return fig(browser('excel.office.com',
      tile(20, 46, 52, 30) + t(84, 66, 'Sign in to use Excel', 'f-t f-b') +
      r(84, 84, 200, 26, 'f-field', 5) + t(94, 101, 'Your RJ email', 'f-t f-sm f-mut') + hl(84, 84, 200, 26, 1) +
      btn(204, 124, 80, 'Next', 'f-btn-p') + hl(204, 124, 80, 24, 2)),
      'The Excel for the web sign-in page at excel.office.com. The email box is outlined and marked 1 (type your RJ email), and the Next button is marked 2.',
      'Screenshot: excel.office.com sign-in page as a student sees it');
  };
  F.upload = function (file) {
    return fig(browser('excel.office.com',
      tile(14, 40, 42, 24) + t(64, 57, 'Excel', 'f-t f-b') +
      r(14, 76, 70, 50, 'f-panel', 5) + t(49, 140, 'Blank workbook', 'f-t f-xs', 'middle') +
      btn(232, 40, 74, 'Upload') + hl(232, 40, 74, 24, 1) +
      t(100, 92, 'Recent', 'f-t f-sm f-b') + r(100, 100, 206, 16, 'f-ph', 3) + r(100, 122, 206, 16, 'f-ph', 3) +
      t(14, 176, 'Then pick ' + file + ' from Downloads', 'f-t f-sm f-mut')),
      'The Excel for the web start page. The Upload button at the top right is outlined and marked 1.',
      'Screenshot: Excel for the web start page with the Upload button, student account');
  };
  F.webOpen = function (file) {
    var name = file.replace(/\.xlsx$/, '');
    return fig(browser('excel.office.com',
      r(1, 32, W - 2, 22, 'f-xlbar', 0) + t(12, 47, 'Excel', 'f-t f-tw f-b') + t(64, 47, name + ' · Saved', 'f-t f-tw f-sm') + hl(62, 35, 132, 16, 1) +
      ribbon(54, ['File', 'Home', 'Insert', 'Formulas', 'Data']) +
      r(1, 76, W - 2, 18, 'f-panel', 0) + t(10, 89, 'fx', 'f-t f-sm f-mut') + t(30, 89, '=SUM(B4:B8)', 'f-t f-sm f-mono') +
      grid(10, 100, 5, 4, 60, 20)),
      'Your workbook open in Excel for the web. Next to its name, the word Saved is outlined and marked 1: it saves itself to OneDrive.',
      'Screenshot: the downloaded budget open in Excel for the web, showing the Saved status next to the file name');
  };
  F.webCopy = function () {
    return fig(browser('excel.office.com',
      r(1, 32, 130, 162, 'f-panel', 0) + t(14, 52, 'File', 'f-t f-b') +
      t(14, 78, 'New', 'f-t f-sm') + t(14, 100, 'Open', 'f-t f-sm') + t(14, 122, 'Create a Copy', 'f-t f-sm f-b') + hl(10, 110, 112, 18, 1) +
      r(140, 108, 160, 34, 'f-win', 5) + t(152, 129, 'Download a Copy', 'f-t f-sm') + hl(146, 112, 148, 26, 2)),
      'The File menu in Excel for the web. Create a Copy is outlined and marked 1, and Download a Copy is marked 2.',
      'Screenshot: Excel for the web File menu showing Download a Copy');
  };
  F.folder = function (file) {
    return fig(r(1, 1, W - 2, H - 2, 'f-win', 8) + r(1, 1, W - 2, 28, 'f-chrome', 8) + r(1, 20, W - 2, 9, 'f-chrome', 0) + t(12, 19, 'Downloads', 'f-t f-b') +
      r(1, 29, 86, H - 30, 'f-panel', 0) + t(12, 52, 'Desktop', 'f-t f-sm f-mut') + t(12, 74, 'Documents', 'f-t f-sm f-mut') + t(12, 96, 'Downloads', 'f-t f-sm f-b') + t(12, 118, 'OneDrive', 'f-t f-sm f-mut') +
      r(108, 46, 34, 42, 'f-file', 4) + t(125, 72, 'xlsx', 'f-t f-xs f-tw', 'middle') + t(125, 104, file, 'f-t f-xs', 'middle') + hl(102, 42, 46, 70, 1) +
      t(170, 72, 'Double-click it', 'f-t f-sm f-mut'),
      'Your Downloads folder. The ' + file + ' file is outlined and marked 1: double-click it.',
      'Screenshot: File Explorer (or Finder) Downloads folder on an RJ laptop with the .xlsx file');
  };
  F.protected = function (file) {
    return fig(appWin(file,
      ribbon(29, ['File', 'Home', 'Insert', 'Data']) +
      r(1, 51, W - 2, 34, 'f-warn', 0) + t(10, 66, 'PROTECTED VIEW', 'f-t f-sm f-b') + t(10, 79, 'Be careful: files from the internet...', 'f-t f-xs') +
      btn(222, 56, 88, 'Enable Editing') + hl(222, 56, 88, 24, 1) +
      grid(10, 96, 5, 4, 60, 22)),
      'The Excel desktop app with a yellow Protected View bar across the top. The Enable Editing button is outlined and marked 1.',
      'Screenshot: desktop Excel Protected View bar on a downloaded file, ordinary student license');
  };
  F.save = function () {
    function key(x, label, w) { return r(x, 92, w, 40, 'f-key', 7) + t(x + w / 2, 117, label, 'f-t f-b', 'middle'); }
    return fig(appWin('monthly budget', ribbon(29, ['File', 'Home', 'Insert', 'Data']) + key(70, 'Ctrl', 70) + t(160, 118, '+', 'f-t f-b', 'middle') + key(180, 'S', 50) + hl(70, 92, 160, 40, 1) +
      t(160, 160, 'On a Mac: Cmd + S', 'f-t f-sm f-mut', 'middle')),
      'The keys Ctrl and S, outlined and marked 1. Press them together to save. On a Mac, Cmd and S.',
      'Screenshot: desktop Excel with the Save button or the Save As window');
  };
  F.install = function () {
    return fig(browser('microsoft365.com',
      t(14, 56, 'Welcome', 'f-t f-b') + r(14, 66, 160, 10, 'f-ph', 3) + r(14, 84, 120, 10, 'f-ph', 3) +
      btn(214, 40, 92, 'Install apps') + hl(214, 40, 92, 24, 1) +
      tile(14, 110, 52, 30) + r(76, 110, 52, 30, 'f-ph', 5) + r(138, 110, 52, 30, 'f-ph', 5)),
      'The Microsoft 365 home page at microsoft365.com, signed in. The Install apps button at the top right is outlined and marked 1.',
      'Screenshot: microsoft365.com home page with Install apps, signed in with a student RJ account');
  };
  F.openDesktop = function () {
    return fig(browser('excel.office.com',
      r(1, 32, W - 2, 22, 'f-xlbar', 0) + t(12, 47, 'Excel', 'f-t f-tw f-b') + t(64, 47, 'lab data · Saved', 'f-t f-tw f-sm') +
      ribbon(54, ['File', 'Home', 'Insert', 'Data']) + btn(232, 56, 74, 'Editing ▾') + hl(232, 56, 74, 18, 1) +
      r(150, 82, 160, 64, 'f-win', 5) + t(162, 102, 'Editing', 'f-t f-sm') + t(162, 120, 'Viewing', 'f-t f-sm f-mut') + t(162, 138, 'Open in Desktop App', 'f-t f-sm f-b') + hl(156, 126, 148, 18, 2) +
      grid(10, 84, 2, 4, 60, 22)),
      'Excel for the web. The Editing button at the right of the ribbon is outlined and marked 1. Its menu shows Open in Desktop App, marked 2.',
      'Screenshot: Excel for the web, Editing menu open, showing Open in Desktop App');
  };
  F.canvasStart = function () {
    return fig(browser('canvas: your course',
      r(1, 32, 70, H - 33, 'f-rjband', 0) + t(12, 56, 'Home', 'f-t f-tw f-xs') + t(12, 74, 'Modules', 'f-t f-tw f-xs') + t(12, 92, 'Assignments', 'f-t f-tw f-xs') +
      t(86, 58, 'Monthly budget', 'f-t f-b') + r(86, 68, 150, 9, 'f-ph', 3) + r(86, 84, 120, 9, 'f-ph', 3) +
      btn(196, 104, 110, 'Start Assignment', 'f-btn-p') + hl(196, 104, 110, 24, 1)),
      'A Canvas assignment page. The Start Assignment button is outlined and marked 1.',
      'Screenshot: the Canvas assignment page with Start Assignment, student view');
  };
  F.canvasUpload = function (file, mark) {
    return fig(browser('canvas: your course',
      r(1, 32, 70, H - 33, 'f-rjband', 0) +
      t(86, 56, 'File Upload', 'f-t f-sm f-b') + '<line x1="86" x2="152" y1="61" y2="61" class="f-uline"/>' + (mark === 'upload' ? hl(84, 44, 70, 20, 1) : '') +
      btn(86, 72, 92, 'Upload File') + (mark === 'upload' ? hl(86, 72, 92, 24, 2) : '') +
      r(86, 108, 22, 26, 'f-file', 3) + t(97, 125, 'xlsx', 'f-t f-xs f-tw', 'middle') + t(116, 125, file, 'f-t f-sm') +
      btn(196, 150, 110, 'Submit Assignment', 'f-btn-p') + (mark === 'submit' ? hl(196, 150, 110, 24, 1) : '')),
      mark === 'upload' ? 'The Canvas submission box. The File Upload tab is marked 1 and the Upload File button is marked 2.' : 'The Canvas submission box with ' + file + ' attached. The Submit Assignment button is outlined and marked 1.',
      mark === 'upload' ? 'Screenshot: Canvas File Upload tab with Upload File, student view' : 'Screenshot: Canvas submission with the file attached and Submit Assignment');
  };
  XL.figures = F;

  function step(n, title, html, figure) {
    return '<li class="xl-ostep"><div class="xl-otext"><p class="xl-on">Step ' + n + '</p><h4>' + title + '</h4><p>' + html + '</p></div>' + figure + '</li>';
  }
  /* tabs with arrow-key support */
  function tabs(box, names) {
    var list = box.querySelector('[role=tablist]'), btns = list.querySelectorAll('[role=tab]'), panels = box.querySelectorAll('[role=tabpanel]');
    function pick(i, focus) {
      btns.forEach(function (b, k) { b.setAttribute('aria-selected', k === i ? 'true' : 'false'); b.tabIndex = k === i ? 0 : -1; panels[k].hidden = k !== i; });
      if (focus) btns[i].focus();
      XL.store.set('rjmathlab-excel-which', names[i]);
    }
    btns.forEach(function (b, k) {
      b.addEventListener('click', function () { pick(k); });
      b.addEventListener('keydown', function (e) {
        var n = btns.length;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); pick((k + 1) % n, true); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); pick((k + n - 1) % n, true); }
        else if (e.key === 'Home') { e.preventDefault(); pick(0, true); } else if (e.key === 'End') { e.preventDefault(); pick(n - 1, true); }
      });
    });
    var last = XL.store.get('rjmathlab-excel-which'), i0 = Math.max(0, names.indexOf(last));
    pick(i0);
  }
  var uid = 0;
  /* The Open it in Excel card. o.file: the downloaded file name. */
  XL.openCard = function (box, o) {
    o = o || {}; var file = o.file || 'your-file.xlsx', id = 'xo' + (++uid);
    box.innerHTML = '<div class="xl-open">' +
      '<h3>Open it in Excel</h3>' +
      '<ol class="xl-osteps">' + step(1, 'Find the file', 'Your browser saved <b>' + esc(file) + '</b> in your <b>Downloads</b> folder. Most browsers also list it under the download arrow at the top right of the window.', F.downloads(file)) + '</ol>' +
      '<p class="xl-which">Step 2: open it. Pick the Excel you will use:</p>' +
      '<div class="xl-tabs" role="tablist" aria-label="Which Excel">' +
      '<button type="button" role="tab" id="' + id + '-tw" aria-controls="' + id + '-pw">Excel for the web</button>' +
      '<button type="button" role="tab" id="' + id + '-td" aria-controls="' + id + '-pd">Excel desktop app</button></div>' +
      '<div role="tabpanel" id="' + id + '-pw" aria-labelledby="' + id + '-tw" class="xl-panel"><ol class="xl-osteps">' +
      step('2a', 'Sign in', 'Go to <b>excel.office.com</b> and sign in with your <b>RJ account</b>. It works on any computer with a browser: nothing to install.', F.signin()) +
      step('2b', 'Upload the file', 'Choose <b>Upload</b>, then pick <b>' + esc(file) + '</b> from your Downloads folder. (If the file is already in your OneDrive, open it from there instead.)', F.upload(file)) +
      step('2c', 'It saves itself', 'Your sheet opens in the browser with all your formulas. Excel for the web saves to your OneDrive as you go, so there is no Save button to press.', F.webOpen(file)) +
      '</ol></div>' +
      '<div role="tabpanel" id="' + id + '-pd" aria-labelledby="' + id + '-td" class="xl-panel" hidden><ol class="xl-osteps">' +
      step('2a', 'Open the file', 'Open your <b>Downloads</b> folder and double-click <b>' + esc(file) + '</b>. It opens in the Excel desktop app.', F.folder(file)) +
      step('2b', 'Click Enable Editing', 'See a yellow bar that says <b>Protected View</b>? Excel opens files that came from the internet as read-only at first, to keep you safe. You made this file, so click <b>Enable Editing</b>.', F.protected(file)) +
      step('2c', 'Save it', 'Press <b>Ctrl+S</b> to save (on a Mac, <b>Cmd+S</b>). To keep it somewhere safe, choose <b>File &gt; Save As</b> and pick your OneDrive.', F.save()) +
      step('If you need it', 'Don’t have the desktop app yet?', 'Every RJ student can install it with their RJ account: sign in at <b>microsoft365.com</b> and choose <b>Install apps</b>. Until then, use Excel for the web: everything in these lessons works there.', F.install()) +
      '</ol></div>' +
      '<h3 class="xl-canvas-h">Turn it in on Canvas</h3>' +
      '<ol class="xl-osteps">' +
      step(3, 'Start the assignment', 'Open the assignment in Canvas and press <b>Start Assignment</b>.', F.canvasStart()) +
      step(4, 'Attach your file', 'Choose <b>File Upload</b>, press <b>Upload File</b>, and pick your saved .xlsx file. Used Excel for the web? Canvas needs the file itself: in Excel, choose <b>File &gt; Create a Copy &gt; Download a Copy</b>, then upload that copy.', F.canvasUpload(file, 'upload')) +
      step(5, 'Submit', 'Press <b>Submit Assignment</b>. Done.', F.canvasUpload(file, 'submit')) +
      '</ol>' +
      '<details class="xl-webcopy"><summary>Picture: Download a Copy in Excel for the web</summary>' + F.webCopy() + '</details>' +
      '</div>';
    tabs(box, ['web', 'desktop']);
  };

  /* The Two Excels card: the student card text from the spec, word for word where it can be. */
  XL.twoExcelsCard = function (box) {
    box.innerHTML = '<div class="xl-two">' +
      '<h3>Two Excels. Same file. Pick the right one.</h3>' +
      '<div class="xl-two-cols">' +
      '<section class="xl-two-c"><h4>Excel for the web</h4><p class="xl-two-sub">excel.office.com, signed in with your RJ account</p><ul>' +
      '<li>Works on any computer with a browser. Nothing to install.</li>' +
      '<li>Saves itself to your OneDrive as you go.</li>' +
      '<li>Your lab partner can work in the same file at the same time.</li>' +
      '<li>Everything in MathLab and your lab data analysis works here.</li>' +
      '<li>Needs internet. A very big workbook (over 100 MB) saved in OneDrive or SharePoint will not open in the browser.</li></ul></section>' +
      '<section class="xl-two-c"><h4>Excel desktop app</h4><p class="xl-two-sub">The green Excel icon on your laptop. Every RJ student can install it with their RJ account.</p><ul>' +
      '<li>Has extra power tools the web version doesn’t: the Data Analysis button (regression, t-tests, histograms), Power Pivot, macros, and more chart options.</li>' +
      '<li>Works without internet.</li>' +
      '<li>Handles very big files.</li></ul></section>' +
      '</div>' +
      '<p class="xl-two-same"><b>The same in both:</b> the same .xlsx file and the same formulas. Everything in Spreadsheet basics and Build it works in either one. (Macros: the desktop app runs VBA macros; the web version uses Office Scripts instead.)</p>' +
      '<div class="xl-rule"><p><b>Rule of thumb:</b> start in either one. If a button you need is missing, you’re probably in the web version: choose <b>Editing &gt; Open in Desktop App</b> and keep going in the same file.</p>' + F.openDesktop() + '</div>' +
      '</div>';
  };
})();
