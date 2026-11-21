/* Story-page helpers for MathLab story versions (Nov 21, 2026). The same supports students get on every Raider Labs tool:
   1. Read aloud: natural-sounding voices only (never a robotic one). With none, it shows how to use Edge's own Read aloud.
      Once on, it reads each new step until it is turned off. Nothing leaves the device.
   2. Easier reading: more space between lines, letters and words in the story column. Saved per browser (shared key).
   3. "This confused me", help first: what the step is asking, another way to see it, Show this step again, Back a step,
      Read it to me. Then, optionally, one tap says what kind of confusing (anonymous).
   4. GoatCounter events, path only (nothing about the student): story/MathLab/<id>/step-NN the first time each step is
      reached, .../copy when the story is copied, and confused/MathLab/<id>-story/step-NN(/why-<reason>).
   A page calls StoryHelp.init({id, title, beat:()=>index, total, go, help:[{ask, another}, ...one per step]}) and
   StoryHelp.step() at the end of its own go(). The page needs #shbar and #shhelp beside its panel. */
(function(){
'use strict';
const LAB='MathLab',KEY_RA='raider-labs-readaloud',KEY_ER='raider-labs-easyread';
const get=k=>{try{return localStorage.getItem(k)==='on';}catch(e){return false;}},put=(k,v)=>{try{localStorage.setItem(k,v?'on':'off');}catch(e){}};
const SS=window.speechSynthesis,CAN=!!(SS&&typeof SpeechSynthesisUtterance!=='undefined');
let C=null,on=false,easy=get(KEY_ER),voice=null,open=false,lastBeat=-1;const seen=new Set(),conf=new Set();
const $=id=>document.getElementById(id),pad=n=>String(n).padStart(2,'0');
function pick(){if(!CAN)return null;try{const vs=SS.getVoices()||[],en=vs.filter(x=>/^en(-|_)?US/i.test(x.lang)),pool=en.length?en:vs.filter(x=>/^en/i.test(x.lang));
  voice=pool.find(x=>/natural|online|neural|premium|enhanced/i.test(x.name))||null;}catch(e){voice=null;}return voice;}
if(CAN){pick();try{SS.addEventListener('voiceschanged',pick);}catch(e){}}
/* GoatCounter loads late (and only on github.io), so wait for it a little. */
function send(path,title){(function go(n){const g=window.goatcounter;if(g&&typeof g.count==='function'){try{g.count({path,title,event:true});}catch(e){}}else if(n<40)setTimeout(()=>go(n+1),250);})(0);}
/* Say math the way a teacher would. */
function speakable(s){return s.replace(/\s+/g,' ').replace(/√\s*\(/g,'the square root of (').replace(/√\s*(\d+)/g,'the square root of $1').replace(/√/g,'square root')
  .replace(/²/g,' squared').replace(/³/g,' cubed').replace(/(\d)\s*×\s*/g,'$1 times ').replace(/×/g,' times ').replace(/÷/g,' divided by ').replace(/−/g,' minus ').replace(/≈/g,' about ')
  .replace(/(\d)\s*in\b/g,'$1 inches').replace(/·/g,' times ').replace(/[✓→↑]/g,' ').replace(/\s+/g,' ').trim();}
function say(t){if(!CAN||!voice)return;SS.cancel();if(!t)return;(speakable(t).match(/[^.!?]+[.!?]*/g)||[t]).forEach(p=>{const u=new SpeechSynthesisUtterance(p.trim());u.voice=voice;u.lang=voice.lang;u.rate=.95;SS.speak(u);});}
function text(el){if(!el)return '';const c=el.cloneNode(true);c.querySelectorAll('button,svg,form,.nav,.chips,input,select').forEach(x=>x.remove());c.querySelectorAll('p,li,div').forEach(x=>x.append(document.createTextNode('. ')));
  return (c.textContent||'').replace(/\s+/g,' ').replace(/(\.\s*){2,}/g,'. ').replace(/^\.\s*/,'').trim();}
function stepText(){const p=$('panel');if(!p)return '';return [text(p.querySelector('.cap')),text(p.querySelector('.sub'))].filter(Boolean).join('. ');}
function how(){let d=$('sh-how');if(!d){d=document.createElement('dialog');d.id='sh-how';d.setAttribute('aria-labelledby','sh-how-h');const edge=/Edg\//.test(navigator.userAgent);
  const steps=[[!edge,'Open this page in Microsoft Edge','Edge has natural-sounding voices built in. Copy the link from the address bar and paste it into Edge.'],
   [1,'Select the words you want to hear','Drag across the text, then right-click it and choose <b>Read aloud selection</b>. To hear the whole page, press <b>Ctrl + Shift + U</b>.'],
   [1,'Pick a natural voice','In the Read aloud bar at the top, click <b>Voice options</b> and choose a voice with <b>Natural</b> in its name.'],
   [1,'Want fewer distractions? Use Immersive Reader','Select the text, right-click, and choose <b>Open in Immersive Reader</b>.']].filter(s=>s[0]);
  d.innerHTML='<h2 id="sh-how-h">Hear it read aloud in Microsoft Edge</h2><p>'+(edge?'Edge’s natural voices haven’t loaded yet. Wait a few seconds and try again, or use Edge’s own Read aloud:':'This browser doesn’t have a natural-sounding voice, so use Edge’s Read aloud.')+'</p><ol>'+steps.map(s=>'<li><b>'+s[1]+'</b><br>'+s[2]+'</li>').join('')+'</ol><button type="button" class="btn">Got it</button>';
  d.querySelector('button').addEventListener('click',()=>d.close());d.addEventListener('click',e=>{if(e.target===d)d.close();});document.body.appendChild(d);}
  if(d.showModal)d.showModal();else d.setAttribute('open','');}
const WHY=[['reading','Too much to read'],['see','Couldn’t see what changed'],['words','Words I don’t know'],['fast','Went too fast'],['question','The question was confusing']];
const TIP={reading:'Thanks. Try 🔊 Read aloud or Aa Easier reading.',see:'Thanks. Press Show this step again and watch only the part that moves.',words:'Thanks. Each new word is explained the first time it appears. Ask your teacher, too.',fast:'Thanks. Go Back a step and take your time: nothing moves until you do it.',question:'Thanks. That helps us rewrite it. Ask your teacher, too.'};
function confPath(){return 'confused/'+LAB+'/'+C.id+'-story/step-'+pad(C.beat()+1);}
function renderHelp(){const box=$('shhelp');if(!box)return;box.hidden=!open;const b=$('sh-cf');if(b){b.textContent=open?'😕 Close help':'😕 This confused me';b.setAttribute('aria-expanded',String(open));}
  if(!open){box.innerHTML='';return;}const h=(C.help&&C.help[C.beat()])||{};const i=C.beat();
  box.innerHTML=`<b>Let’s try it another way.</b>${h.ask?`<p><b>What it’s asking:</b> ${h.ask}</p>`:''}${h.another?`<p><b>Another way to see it:</b> ${h.another}</p>`:''}
   <div class="sh-acts"><button type="button" class="btn sm" data-sh="again">🔁 Show this step again</button>${i>0?'<button type="button" class="btn sm" data-sh="back">← Back a step</button>':''}<button type="button" class="btn sm" data-sh="say">🔊 Read it to me</button></div>
   <div class="sh-why"><span>Still confused? Tell us what kind (anonymous):</span>${WHY.map(([k,l])=>`<button type="button" class="btn sm sh-chip" data-why="${k}">${l}</button>`).join('')}</div>`;}
function toggleHelp(){open=!open;if(open){const p=confPath();if(!conf.has(p)){conf.add(p);send(p,C.title+': confusing step');}}renderHelp();if(open){try{$('shhelp').scrollIntoView({block:'nearest',behavior:'smooth'});}catch(e){}}if(open&&on)say(text($('shhelp')).replace(/Still confused\?.*$/,''));}
function bar(){const el=$('shbar');if(!el)return;
  el.innerHTML=`<button type="button" class="btn sm" id="sh-ra"></button><button type="button" class="btn sm" id="sh-er"></button><button type="button" class="btn sm" id="sh-cf" aria-expanded="false" title="Get help with this step (and tell us, anonymously, that it was confusing)">😕 This confused me</button>`;
  $('sh-ra').onclick=()=>{if(!on){if(!pick()){how();return;}on=true;put(KEY_RA,true);say(stepText());}else{on=false;put(KEY_RA,false);if(CAN)SS.cancel();}sync();};
  $('sh-er').onclick=()=>{easy=!easy;put(KEY_ER,easy);sync();};$('sh-cf').onclick=toggleHelp;
  $('shhelp').addEventListener('click',e=>{const w=e.target.closest('[data-why]');if(w){send(confPath()+'/why-'+w.dataset.why,C.title+': '+w.dataset.why);const box=$('shhelp').querySelector('.sh-why');box.innerHTML='<span>'+TIP[w.dataset.why]+'</span>';return;}
    const a=e.target.closest('[data-sh]');if(!a)return;const k=a.dataset.sh,keep=open;
    if(k==='again'){C.go(C.beat());open=keep;renderHelp();}else if(k==='back'){C.go(C.beat()-1);}else if(k==='say'){if(!pick()){how();return;}say(text($('shhelp')).replace(/Still confused\?.*$/,'').replace(/Show this step again.*$/,''));}});
  sync();}
function sync(){const a=$('sh-ra'),b=$('sh-er');if(a){a.textContent=on?'🔊 Read aloud: on':'🔊 Read aloud';a.setAttribute('aria-pressed',String(on));}
  if(b){b.textContent=easy?'Aa Easier reading: on':'Aa Easier reading';b.setAttribute('aria-pressed',String(easy));}document.documentElement.classList.toggle('sh-easy',easy);}
const StoryHelp={
  init(cfg){C=cfg;on=CAN&&get(KEY_RA)&&!!pick();bar();
    document.addEventListener('click',e=>{if(e.target.closest('#copyBtn'))send('story/'+LAB+'/'+C.id+'/copy',C.title+': copied story');},true);
    if(CAN&&get(KEY_RA)&&!voice)setTimeout(()=>{if(pick()){on=true;sync();}},1500);},
  /* call after every go(): counts the step once, closes help on a new step, reads the new step if Read aloud is on */
  step(){if(!C)return;const i=C.beat();if(i!==lastBeat){lastBeat=i;open=false;renderHelp();
      const p='story/'+LAB+'/'+C.id+'/step-'+pad(i+1);if(!seen.has(p)){seen.add(p);send(p,C.title+': step '+(i+1));}
      if(on)setTimeout(()=>say(stepText()),60);}}};
window.StoryHelp=StoryHelp;
window.addEventListener('pagehide',()=>{if(CAN)SS.cancel();});
const st=document.createElement('style');st.textContent=
`.sh-bar{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px}.sh-bar .btn[aria-pressed="true"]{background:var(--rj);border-color:var(--rj);color:#fff}
.sh-help{margin-top:10px;border:1.5px solid var(--rj);background:var(--card);border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;font-size:15.5px;line-height:1.5}.sh-help p{margin:0}
.sh-acts,.sh-why{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.sh-why{border-top:1px dashed var(--line);padding-top:8px;font-size:14px;color:var(--muted)}.sh-chip{border-radius:999px!important;font-size:13px!important}
#sh-how{max-width:min(540px,92vw);border:0;border-radius:14px;padding:20px 24px;line-height:1.55;font-size:16px;background:var(--card);color:var(--fg)}#sh-how::backdrop{background:rgba(0,0,0,.45)}#sh-how h2{margin:0 0 6px;font-size:20px}#sh-how ol{padding-left:22px;margin:10px 0 14px}#sh-how li{margin:0 0 10px}
html.sh-easy :is(.panel,.sh-help,.story) :is(p,li,.sub,.cap){line-height:1.75!important;letter-spacing:.035em!important;word-spacing:.14em!important}
html.sh-easy :is(.panel,.sh-help) .sub,html.sh-easy .sh-help p{font-size:17.5px!important}
html.sh-easy :is(.kicker,.eyebrow,.frame .no){text-transform:none!important;letter-spacing:.02em!important}
html.sh-easy :is(.panel,.sh-help,.story) :is(em,i,q){font-style:normal!important;font-weight:600}`;
document.head.appendChild(st);
})();
