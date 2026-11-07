# Adds "Analyze in a spreadsheet" to a Raider Labs science engine.js (idempotent).
# Usage: python3 patch_engine.py <repo>
import sys, os
p = os.path.join(sys.argv[1], 'engine.js'); s = open(p, encoding='utf-8').read()
if 'rjAnalyzeSend' in s:
    print('already patched', p); sys.exit(0)

def rep(a, b):
    global s
    assert s.count(a) == 1, ('expected once', a[:80], s.count(a))
    s = s.replace(a, b)

# 1. button next to Copy as CSV on the Full lab trials table
rep('data-act="copy">Copy as CSV</button>',
    'data-act="copy">Copy as CSV</button><button type="button" class="btn" data-act="analyze" title="Open this table in a guided spreadsheet: average, spread, slope and a graph, then download it for Excel">Analyze in a spreadsheet</button>')

# 2. its click handler, registered right before the Copy as CSV handler
rep("    sec.querySelector('[data-act=copy]').addEventListener('click',()=>{",
    "    {const ab=sec.querySelector('[data-act=analyze]');if(ab)ab.addEventListener('click',()=>analyzeTrials(sim));}\n    sec.querySelector('[data-act=copy]').addEventListener('click',()=>{")

# 3. notebook tables: a button under each table, handled by delegation on the notebook
rep('<ul class="vl-notes" data-nt="${tb.id}" hidden></ul></div>`;};',
    '<ul class="vl-notes" data-nt="${tb.id}" hidden></ul><p class="vl-an"><button type="button" class="btn" data-an="${tb.id}">Analyze this table in a spreadsheet</button></p></div>`;};')
rep("ui.nb=el('div',{class:'vlab-nb'});ui.nb.hidden=true;",
    "ui.nb=el('div',{class:'vlab-nb'});ui.nb.hidden=true;{const anB=e=>e.target.closest&&e.target.closest('[data-an]');ui.nb.addEventListener('mousedown',e=>{if(anB(e))e.preventDefault();});ui.nb.addEventListener('click',e=>{const b=anB(e);if(!b)return;const tid=b.getAttribute('data-an'),f=document.activeElement;if(f&&ui.nb.contains(f)&&/^(INPUT|TEXTAREA|SELECT)$/.test(f.tagName))f.dispatchEvent(new Event('change',{bubbles:true}));analyzeNotebookTable(sim,tid,[...ui.nb.querySelectorAll('[data-an]')].find(x=>x.getAttribute('data-an')===tid)||b);});}")

# 4. the senders (contract: /home/claude/builds/SCI/HANDOFF.md, payload v1)
helpers = r'''
/* ---------- Analyze in a spreadsheet: hand a table to Raider MathLab's "Analyze your lab data" ---------- */
const RJ_ANALYZE_URL='https://rjedtech.github.io/Raider-MathLab/excel.html';
function rjNum(t){const s=String(t===undefined||t===null?'':t).trim().replace(/,/g,'');if(s==='')return '';const n=Number(s);return isFinite(n)?n:String(t).trim();}
function rjSplitUnit(label){const s=stripTags(label).trim(),m=/^(.*?)\s*\(([^()]*)\)\s*$/.exec(s);return m?{name:m[1].trim(),unit:m[2].trim()}:{name:s,unit:''};}
function rjNote(sim,el,msg){if(!el){flash(sim,msg);return;}let m=el.parentNode.querySelector('.vl-an-msg');if(!m){m=document.createElement('span');m.className='vl-an-msg';m.setAttribute('role','status');el.after(m);}m.textContent=msg;}
function rjAnalyzeSend(sim,payload,el){payload.v=1;payload.created=Date.now();
  payload.source=Object.assign({site:LAB_NAME,tool:stripTags(sim.def.title||sim.def.id),url:location.href.split('#')[0]+'#'+sim.def.id},payload.source||{});
  if(payload.columns.length>12){payload.columns=payload.columns.slice(0,12);payload.rows=payload.rows.map(r=>r.slice(0,12));}
  const j=JSON.stringify(payload);let url=null;
  try{localStorage.setItem('rjlabs-analyze',j);if(localStorage.getItem('rjlabs-analyze')===j)url=RJ_ANALYZE_URL+'#analyze-in';}catch(e){}
  if(!url){const h=btoa(unescape(encodeURIComponent(j))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    if(h.length>6000){rjNote(sim,el,'This table is too big to send. Use Copy as CSV, then paste it on the Analyze page.');return;}
    url=RJ_ANALYZE_URL+'#analyze-in='+h;}
  const w=window.open(url,'_blank');if(w){try{w.opener=null;}catch(e){}rjNote(sim,el,'Opened your data in a new tab.');}else location.href=url;}
function analyzeTrials(sim){if(!sim.trials.length){flash(sim,'Record a trial first');return;}
  const cols=trialCols(sim),nm=c=>stripTags(c.ctl?c.ctl.label:c.m.label),un=c=>stripTags(c.ctl?(c.ctl.unit||'').trim():(c.m.unit||'')).trim();
  const columns=[{name:'Trial',unit:''},...cols.map(c=>({name:nm(c),unit:un(c)}))];
  const rows=sim.trials.slice(0,500).map(r=>[r._n!==undefined?r._n:r.n,...cols.map(c=>{const t=cellText(c,r[c.id]);return c.num?rjNum(t):String(t);})]);
  const xc=cols.find(c=>c.ctl&&c.num),yc=cols.find(c=>c.m&&c.num);
  rjAnalyzeSend(sim,{columns,rows,accepted:null,suggest:xc&&yc?{x:nm(xc),y:nm(yc)}:null});}
function analyzeNotebookTable(sim,tid,el){const V=sim.vlab;if(!V)return;const tb=(V.lab.tables||[]).find(t=>t.id===tid);if(!tb)return;
  const heads=tb.cols.map(c=>rjSplitUnit(c.label)),rows=vlRows(tb).map((_,r)=>tb.cols.map(c=>c.rows?rjNum(vlRowLabel(c,r)):rjNum(V.raw('c:'+tb.id+':'+c.id+':'+r))));
  if(!rows.some(rw=>tb.cols.some((c,i)=>!c.rows&&rw[i]!==''))){rjNote(sim,el,'Fill in some of the table first.');return;}
  let suggest=null;try{const s=vlGs(V.lab).flatMap(g=>g.series||[]).find(x=>x.table===tb.id);if(s){const xi=tb.cols.findIndex(c=>c.id===s.x),yi=tb.cols.findIndex(c=>c.id===s.y);if(xi>=0&&yi>=0)suggest={x:heads[xi].name,y:heads[yi].name};}}catch(e){}
  rjAnalyzeSend(sim,{source:{tool:stripTags(sim.def.title||sim.def.id)+': '+stripTags(V.lab.title||tb.title||'notebook')},columns:heads,rows,accepted:null,suggest},el);}
'''
rep('function toCSV(sim){', helpers.lstrip('\n') + 'function toCSV(sim){')
open(p, 'w', encoding='utf-8').write(s)

# small style for the notebook button row
c = os.path.join(sys.argv[1], 'biolab.css')
if os.path.exists(c):
    C = open(c, encoding='utf-8').read()
    if '.vl-an' not in C:
        C += '\n.vl-an{margin:8px 0 4px}\n.vl-an-msg{margin-left:10px;color:var(--muted);font-size:14px}\n'
        open(c, 'w', encoding='utf-8').write(C)
print('patched', p)
