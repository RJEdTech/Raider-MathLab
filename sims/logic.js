(function(){
'use strict';
const {clamp,txt,rr,PAL,axes,bars,atLeast}=BioLab.h;
/* A fictional sample inbox. scam = ground truth; unk = sender not in your contacts; link = asks you to click a link; urg = says urgent or act now. */
const MAIL=[
 {n:1,from:'Coach Ramirez',subj:'Practice moved to 4:00 today',scam:0,unk:0,link:0,urg:0},
 {n:2,from:'Mom',subj:'Can you grab milk on the way home?',scam:0,unk:0,link:0,urg:0},
 {n:3,from:'Ms. Patel (Chemistry)',subj:'Lab report rubric: click to view',scam:0,unk:0,link:1,urg:0},
 {n:4,from:'Package Desk',subj:'URGENT: your package is on hold, pay a $1.99 fee',scam:1,unk:1,link:1,urg:1},
 {n:5,from:'Account Security Team',subj:'Act now: your password expires today',scam:1,unk:1,link:1,urg:1},
 {n:6,from:'Prize Center',subj:'You won a $500 gift card! Claim it here',scam:1,unk:1,link:1,urg:1},
 {n:7,from:'Northfield College Admissions',subj:'Your campus visit is confirmed',scam:0,unk:1,link:1,urg:0},
 {n:8,from:'Riverside Pool summer jobs',subj:'Pick a time for your interview',scam:0,unk:1,link:1,urg:0},
 {n:9,from:'Grandpa',subj:'Photos from the lake',scam:0,unk:0,link:1,urg:0},
 {n:10,from:'Loan Relief Office',subj:'See if your balance can be forgiven',scam:1,unk:1,link:1,urg:0},
 {n:11,from:'Jordan’s dad (new number)',subj:'Urgent: carpool sign-up closes tonight',scam:0,unk:1,link:1,urg:1},
 {n:12,from:'School Office',subj:'Urgent: snow day, school closed tomorrow',scam:0,unk:0,link:0,urg:1},
 {n:13,from:'Library',subj:'Your book is due tomorrow',scam:0,unk:0,link:1,urg:0},
 {n:14,from:'Delivery Notice',subj:'Missed delivery: reschedule now',scam:1,unk:1,link:1,urg:1},
 {n:15,from:'Sam (teammate)',subj:'Who has my water bottle?',scam:0,unk:0,link:0,urg:0}];
const HACK={n:16,from:'Alex (account hacked)',subj:'Is this you in this video?',scam:1,unk:0,link:1,urg:0};
const FEAT={unk:{q:'it comes from a sender who is not in your contacts',nq:'it comes from a sender in your contacts',short:'Unknown sender',nshort:'In your contacts'},
 link:{q:'it asks you to click a link',nq:'it does not ask you to click a link',short:'Asks you to click a link',nshort:'No link'},
 urg:{q:'it says urgent or act now',nq:'it does not say urgent or act now',short:'Says urgent',nshort:'Not urgent'}};
const FORMS={none:'No filter',conv:'Converse',inv:'Inverse',contra:'Contrapositive'};
const inbox=sim=>sim.p.hack&&atLeast('ap')?MAIL.concat([HACK]):MAIL;
/* where an email lands: 'in' (trusted inbox), 'warn' (inbox with a warning banner), 'spam' */
function land(e,f,form){const q=!!e[f];if(form==='conv'||form==='inv')return q?'spam':'in';if(form==='contra')return q?'warn':'in';return 'in';}
const wrong=(e,where)=>(!e.scam&&where==='spam')||(e.scam&&where==='in');
function score(sim,f,form){f=f||sim.p.cond;form=form||sim.p.use;const r={blocked:0,missed:0,warned:0,list:[]};
 inbox(sim).forEach(e=>{const w=land(e,f,form);if(!e.scam&&w==='spam'){r.blocked++;r.list.push(e);}if(e.scam&&w==='in'){r.missed++;r.list.push(e);}if(w==='warn')r.warned++;});r.mist=r.blocked+r.missed;return r;}
const counter=(sim,f)=>inbox(sim).filter(e=>e.scam&&!e[f||sim.p.cond]);
let CURC='unk';
const factTxt=f=>`If an email is a scam, then ${FEAT[f].q}.`;
const stmt=(f,form)=>({conv:`If ${FEAT[f].q}, then it is a scam.`,inv:`If an email is not a scam, then ${FEAT[f].nq}.`,contra:`If ${FEAT[f].nq}, then it is not a scam.`,none:'No rule: every email goes to your inbox.'}[form]);
const ruleTxt=(f,form)=>({conv:`If ${FEAT[f].q}, move it to Spam.`,inv:`Real emails never match “${FEAT[f].short.toLowerCase()}”, so if one matches, move it to Spam.`,contra:`If ${FEAT[f].nq}, deliver it as trusted. Otherwise, deliver it with a warning.`,none:'Deliver everything with no warning.'}[form]);
/* layout: Euler diagram on the left, folders on the right */
const QC=[230,262],QR=165,R=15;
const pCirc=bad=>bad?{x:332,y:352,r:84}:{x:230,y:300,r:84};
function slots(bad){const P=pCirc(bad),out={A:[],X:[],B:[],C:[]};
 for(let y=58;y<=430;y+=8.5)for(let x=26;x<=424;x+=8.5){const dq=Math.hypot(x-QC[0],y-QC[1]),dp=Math.hypot(x-P.x,y-P.y);
  const inQ=dq<=QR-R-3,outQ=dq>=QR+R+3,inP=dp<=P.r-R-3,outP=dp>=P.r+R+3;
  if(x>110&&x<350&&y>82&&y<172)continue;if(x<200&&y>405)continue;
  if(inP&&inQ)out.A.push([x,y]);else if(inP&&outQ){if(y<=398)out.X.push([x,y]);}else if(inQ&&outP)out.B.push([x,y]);else if(outQ&&outP)out.C.push([x,y]);}
 const cen={A:[P.x-20,P.y-10],X:[P.x+60,P.y+50],B:[QC[0],QC[1]-52],C:[QC[0],60]};
 Object.keys(out).forEach(k=>{const c=out[k].sort((a,b)=>Math.hypot(a[0]-cen[k][0],a[1]-cen[k][1])-Math.hypot(b[0]-cen[k][0],b[1]-cen[k][1])),pick=[];
  c.forEach(p=>{if(pick.every(q=>Math.hypot(p[0]-q[0],p[1]-q[1])>=34))pick.push(p);});out[k]=pick;});return out;}
const SLOT={true:slots(true),false:slots(false)};
function place(sim){const f=sim.p.cond,bad=counter(sim,f).length>0,S=SLOT[bad],used={A:0,X:0,B:0,C:0},pos={};
 inbox(sim).forEach(e=>{const reg=e.scam?(e[f]?'A':'X'):(e[f]?'B':'C');const s=S[reg][used[reg]++]||[20+e.n*4,440];pos[e.n]=s;});return {pos,bad};}

const ASK=()=>({bio:`The fact: <b>${factTxt(CURC)}</b> Tap the rule you would trust for your filter, then lock it in.`,honors:`The fact: <b>${factTxt(CURC)}</b> Tap the rewrite of it you would build your filter on, then lock it in.`});
/* Guided, before the gut is locked: hide which emails are scams, so the picture does not grade the rules in advance. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
/* Big picture names each choice by what it does; Closer look names the logic. */
const plain=(f,form)=>({none:'No filter: everything goes to my inbox',conv:`If ${FEAT[f].q}, send it to Spam`,inv:`If it is real, it never matches; so if ${FEAT[f].q}, send it to Spam`,contra:`If ${FEAT[f].nq}, trust it. If not, deliver it with a warning`}[form]);
/* What to call a filter in results: plain words at Big picture, the logic name at Closer look. */
const nm=(form,f)=>atLeast('honors')?(form==='none'?'no filter':`the ${FORMS[form].toLowerCase()} filter`):({none:'no filter',conv:`the rule “${FEAT[f].short.toLowerCase()}: send to Spam”`,inv:`the rule “${FEAT[f].short.toLowerCase()}: send to Spam”`,contra:`the rule “${FEAT[f].nshort.toLowerCase()}: trust it; the rest: warn”`}[form]);
function useLabels(sim){const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW.use;if(!w)return;const h=atLeast('honors');const L=w.querySelector('.lbl,label');if(L)L.textContent=h?'Build the filter from':'Your filter rule';
 w.querySelectorAll('button[data-v]').forEach(b=>{const v=b.dataset.v;b.textContent=h?FORMS[v]:plain(sim.p.cond,v);});
 const sg=w.querySelector('.seg');if(sg)sg.classList.toggle('stack',!h);}
const SIM={
 id:'logic',hash:'logic',apUnit:7,order:1,tab:'If-then rules in software',kind:'Simulation',
 card:'Build a spam filter from an if-then fact, test it on a sample inbox, and see which rewrites of the rule you can trust.',
 title:'If-then rules: build a spam filter that does not lie',
 lede:{bio:'Every email filter and smart-home routine is a list of if-then rules. Flip a true rule around and it can turn false. Build a filter from a fact about scams and count how many real emails it throws away.',
  honors:'A conditional P → Q has three rewrites: the converse Q → P, the inverse not P → not Q, and the contrapositive not Q → not P. Only the contrapositive is guaranteed to be true when the original is. One counterexample is enough to make any of them false.',
  ap:'P → Q is false only when P is true and Q is false. The contrapositive has the same truth table as the original; the converse and the inverse match each other but not the original. The truth table below the stage counts the emails in each row.'},
 scale:'A fictional sample inbox of 15 emails (16 with the hacked-account email at Deep dive). Red dots are scams, blue dots are real emails. A ring marks a mistake.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'Your filter',
 controls:[
  {id:'cond',label:'The fact: if an email is a scam, then it…',type:'select',def:'unk',lvl:'honors',options:[{v:'unk',l:'comes from an unknown sender'},{v:'link',l:'asks you to click a link'},{v:'urg',l:'says urgent or act now'}],
   onChange(sim){CURC=sim.p.cond;useLabels(sim);if(!(sim.guide&&sim.guide.keep)){if(sim.gutS){sim.gutS.g=null;sim.gutS.m=null;}else sim.gutS={g:null,m:null};}BioLab.gutRender(sim);},help:'Before you build on a fact, check it for counterexamples.'},
  {id:'use',label:'Build the filter from',type:'seg',def:'none',options:[{v:'none',l:'No filter'},{v:'conv',l:'Converse'},{v:'inv',l:'Inverse',lvl:'honors'},{v:'contra',l:'Contrapositive'}]},
  {id:'hack',label:'Add an email from a hacked friend’s account',type:'toggle',def:false,lvl:'ap',help:'A scammer who takes over a friend’s account sends from a sender in your contacts.'}
 ],
 init(sim){CURC=sim.p.cond;return {};},step(){},
 onLevel(sim){CURC=sim.p.cond;useLabels(sim);},
 metrics:[
  {id:'blocked',label:'Real emails sent to Spam',unit:'',d:0,min:0,max:10,get:sim=>score(sim).blocked},
  {id:'missed',label:'Scams delivered with no warning',unit:'',d:0,min:0,max:6,get:sim=>score(sim).missed},
  {id:'mist',label:'Total mistakes',unit:'',d:0,min:0,max:16,get:sim=>score(sim).mist},
  {id:'warned',label:'Emails delivered with a warning',unit:'',d:0,lvl:'honors',min:0,max:16,get:sim=>score(sim).warned},
  {id:'cx',label:'Counterexamples to the fact',unit:'',d:0,lvl:'honors',min:0,max:6,get:sim=>counter(sim).length}
 ],
 graphs:[{id:'g',label:'Mistakes by filter',custom:true}],defaultGraph:'g',
 plot(sim,ctx,box){const forms=atLeast('honors')?['none','conv','inv','contra']:['none','conv','contra'];const vals=forms.map(fm=>score(sim,null,fm).mist);
  const ax=axes(ctx,box,{xmin:0,xmax:forms.length,ymin:0,ymax:Math.max(6,Math.max(...vals)+1),xcats:forms.map(fm=>FORMS[fm]),yl:'Mistakes in this inbox'});
  bars(ctx,ax,vals,{colors:forms.map(fm=>fm===sim.p.use?PAL['rj']:PAL['cv-soft'])});},
 draw(sim,ctx,vdt,k){const f=sim.p.cond,form=sim.p.use,{pos,bad}=place(sim),P=pCirc(bad),kk=Math.min(k,1.4),hide=gutPhase(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* zone shading for the filter */
  const tint=(col,a,fn)=>{ctx.save();ctx.globalAlpha=a;ctx.fillStyle=col;fn();ctx.restore();};
  ctx.save();ctx.beginPath();ctx.rect(8,40,432,404);ctx.clip();
  if(form==='conv'||form==='inv'){tint(PAL['s1'],.16,()=>{ctx.beginPath();ctx.arc(QC[0],QC[1],QR,0,7);ctx.fill();});}
  if(form==='contra'){tint(PAL['s3'],.14,()=>{ctx.beginPath();ctx.rect(8,40,432,404);ctx.moveTo(QC[0]+QR,QC[1]);ctx.arc(QC[0],QC[1],QR,0,Math.PI*2);ctx.fill('evenodd');});tint(PAL['s4'],.16,()=>{ctx.beginPath();ctx.arc(QC[0],QC[1],QR,0,7);ctx.fill();});}
  ctx.restore();
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;rr(ctx,8,40,432,404,10);ctx.stroke();
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(QC[0],QC[1],QR,0,7);ctx.stroke();
  if(!hide){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.setLineDash(bad?[7,5]:[]);ctx.beginPath();ctx.arc(P.x,P.y,P.r,0,7);ctx.stroke();ctx.setLineDash([]);}
  txt(ctx,FEAT[f].short,QC[0],QC[1]-QR+22*kk,{s:13*k,w:700,a:'center'});
  if(!hide)txt(ctx,'Scams',P.x,P.y-P.r+18*kk,{s:13*k,w:700,c:PAL['s1'],a:'center'});
  else{txt(ctx,'Where are the scams?',QC[0],QC[1]+8,{s:15*k,w:700,c:PAL['cv-ink'],a:'center'});txt(ctx,'Lock in your rule to see.',QC[0],QC[1]+8+22*k,{s:13*k,c:PAL['cv-soft'],a:'center'});}
  if(bad&&!hide)txt(ctx,'Counterexample!',436,438,{s:12*k,w:700,c:PAL['s1'],a:'right'});
  const zone=form==='conv'||form==='inv'?['Inbox','Spam']:form==='contra'?['Trusted','Warning']:null;
  if(zone){txt(ctx,'Outside: '+zone[0],16,436,{s:12*k,w:700,c:PAL['cv-soft']});txt(ctx,'Inside: '+zone[1],QC[0],QC[1]-QR+22*kk+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  /* legend */
  const dot=(x,y,e,ring)=>{if(hide)ring=false;ctx.fillStyle=hide?PAL['cv-soft']:e.scam?PAL['s1']:PAL['s2'];ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
   if(ring){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=4;ctx.beginPath();ctx.arc(x,y,R+4,0,7);ctx.stroke();}
   txt(ctx,String(e.n),x,y+1,{s:Math.min(13*k,17),w:700,c:'#fff',a:'center',b:'middle'});};
  if(hide){ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.arc(18,20,7,0,7);ctx.fill();txt(ctx,'One email, sorted by your rule',30,25,{s:13*k,w:700});}
  else{ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(18,20,7,0,7);ctx.fill();txt(ctx,'Scam',30,25,{s:13*k,w:700});
  const lx=30+ctx.measureText('Scam').width+18;ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(lx,20,7,0,7);ctx.fill();txt(ctx,'Real email',lx+12,25,{s:13*k,w:700});
  const lx2=lx+12+ctx.measureText('Real email').width+18;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(lx2,20,8,0,7);ctx.stroke();txt(ctx,'Mistake',lx2+13,25,{s:13*k,w:700});}
  if(!hide)inbox(sim).forEach(e=>{const p=pos[e.n];dot(p[0],p[1],e,wrong(e,land(e,f,form)));});
  /* folders */
  const F=[['in','Inbox (trusted)',PAL['s3']],['warn','Inbox with a warning',PAL['s4']],['spam','Spam',PAL['s1']]];
  F.forEach(([id,lab,col],i)=>{const y0=40+i*138,list=inbox(sim).filter(e=>land(e,f,form)===id),bx=456,bw=336;
   ctx.fillStyle=PAL['card'];rr(ctx,bx,y0,bw,126,10);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
   const nm=hide?0:list.filter(e=>wrong(e,id)).length;
   txt(ctx,lab+': '+list.length,bx+12,y0+22*kk,{s:13*k,w:700,c:PAL['cv-ink']});
   if(nm)txt(ctx,nm+' wrong',bx+bw-12,y0+22*kk,{s:13*k,w:700,c:PAL['s1'],a:'right'});
   list.forEach((e,j)=>{const cx=bx+24+(j%9)*35,cy=y0+(j<9?62:100)+(kk-1)*6;dot(cx,cy,e,wrong(e,id));});});},
 narrate(sim){const f=sim.p.cond,form=sim.p.use,s=score(sim),cx=counter(sim);
  if(gutPhase(sim))return `Your rule: ${ruleTxt(f,form)} <b>Can you trust it with every email?</b> Lock it in to test it on the inbox.`;
  const cxt=cx.length?` Careful: “${cx[0].subj}” is a scam where ${FEAT[f].nq}, so <b>the fact itself is false</b>.`:'';
  if(form==='none')return `No filter: all ${s.missed} scams land in your inbox with no warning.`+cxt;
  if(form==='contra')return `Rule: ${ruleTxt(f,form)} ${s.mist?`<b>${s.mist} mistake${s.mist>1?'s':''}</b>: a scam got trusted.`:'<b>0 mistakes.</b> The contrapositive never trusts a scam, because every scam is inside the circle.'}`+cxt;
  return `Rule: ${ruleTxt(f,form)} <b>${s.blocked} real email${s.blocked===1?'':'s'} went to Spam</b>${s.missed?` and ${s.missed} scam${s.missed>1?'s':''} slipped through`:''}. The ${FORMS[form].toLowerCase()} is not guaranteed by the fact.`+cxt;},
 infoPanel(sim){const f=sim.p.cond,form=sim.p.use,L=inbox(sim);
  let h=`<h3>The fact and your filter</h3><p><b>Fact:</b> ${factTxt(f)}</p><p><b>${FORMS[form]}:</b> ${stmt(f,form)}</p>`;
  if(atLeast('ap')){const rows=[[1,1],[1,0],[0,1],[0,0]],T=v=>v?'T':'F',imp=(a,b)=>!a||b;
   h+=`<p style="font-size:14px">P: the email is a scam. Q: ${FEAT[f].q}.</p><div style="overflow-x:auto"><table style="min-width:0;font-size:13px"><thead><tr><th>P</th><th>Q</th><th>P → Q</th><th>Q → P</th><th>¬P → ¬Q</th><th>¬Q → ¬P</th><th>Emails</th></tr></thead><tbody>${rows.map(([p,q])=>`<tr><td>${T(p)}</td><td>${T(q)}</td><td>${T(imp(p,q))}</td><td>${T(imp(q,p))}</td><td>${T(imp(!p,!q))}</td><td>${T(imp(!q,!p))}</td><td>${L.filter(e=>e.scam===p&&e[f]===q).length}</td></tr>`).join('')}</tbody></table></div><p></p>`;}
  h+=`<p><b>The inbox</b> (✗ = mistake)</p><div style="font-size:14px;line-height:1.4">${L.map(e=>{const w=land(e,f,form),bad=wrong(e,w);
   return `<div style="margin:0 0 4px"><b>${e.n}.</b> ${e.from}: ${e.subj} <span style="white-space:nowrap">→ <b>${{in:'Inbox',warn:'Warning',spam:'Spam'}[w]}</b>${bad?' ✗':''}${e.scam?' (scam)':''}</span></div>`;}).join('')}</div>`;
  return h;},
 gut:{better:'lower',controls:['use'],lockLabel:'Lock in my rule',
  get ask(){return ASK();},
  lock(sim){const s=score(sim);return {v:s.mist,form:sim.p.use,cond:sim.p.cond,s,label:`${nm(sim.p.use,sim.p.cond)}: ${s.mist} mistake${s.mist===1?'':'s'}`};},
  solve(sim){const was=sim.p.cond;let f=was;if(counter(sim,f).length){f=['unk','link','urg'].find(x=>!counter(sim,x).length)||f;}
   sim.p.cond=f;CURC=f;sim.p.use='contra';const s=score(sim);return {v:s.mist,form:'contra',cond:f,switched:f!==was,from:was,s,label:`${nm('contra',f)}: ${s.mist} mistake${s.mist===1?'':'s'}`};},
  how:{bio:'The fact says every scam is inside the circle. That guarantees anything outside the circle is not a scam: that is the contrapositive. It says nothing about what is inside the circle, so the math trusts the outside and puts a warning on the inside instead of throwing it away.',
   honors:'First check the fact for counterexamples: one scam outside the circle makes it false. Then use only the contrapositive, not Q → not P, which is true exactly when the original is. The converse and the inverse can be false even when the fact is true.'},
  compare(sim,g,m){const n=inbox(sim).length,sw=m.switched?` First, the math checked the fact you started with and found a counterexample (“${counter(sim,m.from)[0].subj}”), so it switched to the fact that every scam ${FEAT[m.cond].q.replace(/^it /,'')}.`:'';
   if(g.v<=m.v)return `Your gut was right on: ${g.v} mistakes in this ${n}-email inbox. You already sense that flipping a rule around can make it false. The math explains why: ${atLeast('honors')?'the contrapositive is the only rewrite that is always as true as the fact':'only one way of turning the fact around is always as true as the fact itself'}.`+sw;
   const ex=g.s.list.find(e=>!e.scam),parts=[];if(g.s.blocked)parts.push(`<b>${g.s.blocked} real email${g.s.blocked>1?'s':''} sent to Spam</b>${ex?` (like “${ex.subj}” from ${ex.from})`:''}`);if(g.s.missed)parts.push(`<b>${g.s.missed} scam${g.s.missed>1?'s':''} delivered with no warning</b>`);
   const N=nm(g.form,g.cond);return `${N.charAt(0).toUpperCase()+N.slice(1)} made ${g.v} mistake${g.v>1?'s':''} in this ${n}-email inbox: ${parts.join(' and ')}. ${atLeast('honors')?'The contrapositive filter':'The math’s rule'} made ${m.v}: it trusts only what the fact guarantees and warns you about the rest.`+sw;},
  again(sim){const opts=atLeast('honors')?['unk','link','urg']:['unk','link'];let f;do{f=opts[Math.floor(Math.random()*opts.length)];}while(f===sim.p.cond&&opts.length>1);sim.p.cond=f;CURC=f;sim.p.use='none';}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Fact: if an email is a scam, then it asks you to click a link. A new email asks you to click a link. Must it be a scam?',choices:['Yes: the fact says so','No: that is the converse, and the fact does not guarantee it','Only if it also says urgent'],correct:1,explain:'The fact only says scams are inside the “link” circle. Lots of real emails are in there too: in this inbox, 6 real emails ask you to click a link, like your chemistry teacher’s rubric.'},
  {lvl:'bio',instant:true,q:'Same fact: if an email is a scam, then it asks you to click a link. An email has no link at all. What can you conclude?',choices:['It is not a scam','It might still be a scam','Nothing at all'],correct:0,explain:'That is the contrapositive: if it does not ask you to click a link, then it is not a scam. Every scam is inside the circle, so anything outside the circle cannot be a scam.'},
  {lvl:'honors',instant:true,q:'Which statement is logically equivalent to “If P, then Q”?',choices:['If Q, then P','If not P, then not Q','If not Q, then not P'],correct:2,explain:'The contrapositive, not Q → not P, is true in exactly the same cases as P → Q. The converse (Q → P) and the inverse (not P → not Q) are equivalent to each other, but not to the original.'},
  {lvl:'honors',instant:true,q:'Fact to test: if an email is a scam, then it says urgent or act now. One scam in the inbox, from the Loan Relief Office, is calm and never says urgent. What does that one email do?',choices:['Nothing: one exception does not matter','It is a counterexample, so the fact is false','It proves the converse'],correct:1,explain:'A conditional claims something about every case. One scam that is not urgent is a counterexample, so the fact is false, and a filter built on its contrapositive trusts that scam. Check a rule for counterexamples before you build on it.'},
  {lvl:'ap',instant:true,q:'When is the conditional P → Q false?',choices:['When P is true and Q is false','When P is false and Q is true','When both are false'],correct:0,explain:'P → Q only promises Q when P happens. It is broken only by a case where P is true and Q is false. In the truth table, that row has 0 emails exactly when the fact is true.'},
  {lvl:'ap',instant:true,q:'The converse and the inverse of a conditional always…',choices:['have the same truth value as each other','have the same truth value as the original','are both false'],correct:0,explain:'The inverse (not P → not Q) is the contrapositive of the converse (Q → P), so they always agree. That is why the Converse and Inverse filters land every email in the same place.'}
 ],
 tour:[
  {title:'The fact',text:'Your security team checked last month’s scams and found a fact: if an email is a scam, then it comes from a sender who is not in your contacts. In the picture, the red Scams circle sits completely inside the Unknown sender circle.',pause:true,setup:sim=>BioLab.setValues(sim,{cond:'unk',use:'none',hack:false}),focus:[[8,40,432,404]]},
  {title:'The inbox',text:'Each dot is one email in this sample inbox. Red dots are scams, blue dots are real. With no filter, all 5 scams land in your inbox with no warning: 5 mistakes.',pause:true},
  {title:'The converse',text:'Flip the fact around: if a sender is unknown, then it is a scam. As a filter, everything inside the big circle goes to Spam. But 3 real emails are in there, including a college confirming your campus visit. The converse is false.',pause:true,setup:sim=>BioLab.setValues(sim,{use:'conv'})},
  {title:'The contrapositive',text:'Now negate and flip: if a sender is in your contacts, then it is not a scam. That is guaranteed, because every scam is inside the circle. Trust the outside, add a warning to the inside: 0 mistakes, and nothing real goes to Spam.',pause:true,setup:sim=>BioLab.setValues(sim,{use:'contra'})},
  {lvl:'honors',title:'The inverse',text:'The inverse says: if an email is not a scam, then its sender is in your contacts. As a filter it does exactly what the converse does, because the inverse is the contrapositive of the converse.',pause:true,setup:sim=>BioLab.setValues(sim,{use:'inv'})},
  {lvl:'honors',title:'One counterexample',text:'Try a different fact: if an email is a scam, then it says urgent. The Loan Relief scam is calm, so it pokes out of the circle. One counterexample makes the fact false, and the contrapositive filter now trusts a scam.',pause:true,setup:sim=>BioLab.setValues(sim,{cond:'urg',use:'contra'})},
  {lvl:'ap',title:'Truth table',text:'P → Q is false only in the row where P is true and Q is false. Below the stage, the truth table counts emails in each row. When that row is empty, the fact holds, and so does its contrapositive.',pause:true,setup:sim=>BioLab.setValues(sim,{cond:'unk',use:'contra'})}
 ],
 lab:{bio:'<p><b>Question:</b> Which way of using the fact makes the fewest mistakes?</p><ol><li>Try <b>No filter</b>, <b>Converse</b> and <b>Contrapositive</b>. Record a trial for each.</li><li>For each, write down which real emails went to Spam.</li></ol><p>Write one sentence: why does the converse throw away real email?</p>',
  honors:'<p><b>Question:</b> Which facts can you build on?</p><ol><li>For each of the three facts, record the number of counterexamples and the mistakes for every filter.</li><li>Which facts are true? For a false fact, which email is the counterexample?</li></ol><p>Explain why the contrapositive only works when the fact has no counterexamples.</p>',
  ap:'<p><b>Question:</b> How does one hacked account change things?</p><ol><li>Turn on the hacked-friend email. Check each fact for counterexamples.</li><li>Find the fact and filter with 0 mistakes. Use the truth table to explain.</li></ol><p><b>CER:</b> Claim, evidence from the inbox, reasoning from the truth table.</p>'},
 terms:[
  {t:'Conditional statement',d:'An if-then statement, P → Q. P is the hypothesis and Q is the conclusion.'},
  {t:'Converse',d:'Swap the parts: Q → P. It can be false even when the original is true.'},
  {t:'Contrapositive',d:'Swap and negate: not Q → not P. It is always true exactly when the original is.'},
  {t:'Inverse',d:'Negate both parts: not P → not Q. It is equivalent to the converse.',lvl:'honors'},
  {t:'Counterexample',d:'One case where the hypothesis is true and the conclusion is false. One is enough to prove a conditional false.',lvl:'honors'},
  {t:'Logically equivalent',d:'Two statements with the same truth value in every case, such as a conditional and its contrapositive.',lvl:'ap'}
 ],
 about:'<p>The inbox is a small fictional sample, so the counts are for illustration, not real spam rates. Each email has four yes-or-no facts: is it a scam, is the sender in your contacts, does it ask you to click a link, does it say urgent or act now.</p><p>Each filter turns one statement into a rule. <b>Converse</b> and <b>Inverse</b>: emails that match the feature go to Spam. <b>Contrapositive</b>: emails that do not match are trusted; the rest are delivered with a warning banner. A mistake is a real email sent to Spam or a scam delivered with no warning.</p><p>Real spam filters combine many signals and learn from data, and real scammers adapt. The logic is the same, though: a rule is only as good as its counterexamples.</p>'
};
BioLab.register(SIM);
})();
