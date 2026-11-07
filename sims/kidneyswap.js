(function(){
'use strict';
const {clamp,rng,txt,pill,rr,PAL,FONT,axes,bars,legend,atLeast,fmtNum}=BioLab.h;
/* ---------- the model ----------
   8 patient-donor pairs. In each pair the donor cannot give to their own patient (blood types don't fit,
   or the patient has antibodies against that donor). Edge i -> j means pair i's donor can give to pair j's patient.
   A loop (2-way swap or 3-way loop) is a directed cycle; a chain starts at an altruistic donor and runs pair to pair.
   The math is an exhaustive search: every chain the altruist could start, then the best packing of loops among the
   pairs left (memoized over subsets: 2^8 = 256 states). */
const N=8;
const TYPES=['O','A','B','AB'];
const can=(d,p)=>d==='O'||p==='AB'||d===p;
/* Set 0: the walkthrough set. xm = donors (pair indexes) this patient has antibodies against, used when the crossmatch check is on. */
const SET0=[{p:'AB',d:'O',ab:1},{p:'B',d:'A'},{p:'O',d:'AB'},{p:'A',d:'B'},{p:'A',d:'O',ab:1},{p:'O',d:'A',xm:[4]},{p:'A',d:'B'},{p:'B',d:'AB'}];
const cache={};
function makeSet(seed){if(cache['s'+seed])return cache['s'+seed];let P;
 if(!seed)P=SET0.map(x=>Object.assign({},x));
 else{const R=rng(seed*7919+13);
  for(let tries=0;tries<500;tries++){P=[];let nAb=0;
   for(let i=0;i<N;i++){let p,d,ab=0;for(;;){p=TYPES[Math.floor(R()*4)];d=TYPES[Math.floor(R()*4)];if(!can(d,p))break;if(nAb<2&&R()<0.35){ab=1;nAb++;break;}}P.push({p,d,ab});}
   const nO=P.filter(x=>x.p==='O').length;if(nO<1||nO>3||nAb<1)continue;
   const E=edges(P,false);const b2=bestPlan(P,E,2,null).v;if(b2<2)continue;
   /* one patient is highly sensitized: with the crossmatch on, she keeps only her first compatible donor */
   const inc=[];for(let j=0;j<N;j++){const from=[];for(let i=0;i<N;i++)if(E[i].includes(j))from.push(i);if(from.length>=2)inc.push([j,from]);}
   if(inc.length){const [j,from]=inc[Math.floor(R()*inc.length)];P[j].xm=from.slice(1);}
   break;}}
 cache['s'+seed]=P;return P;}
function edges(P,xm){const E=[];for(let i=0;i<N;i++){E[i]=[];for(let j=0;j<N;j++)if(i!==j&&can(P[i].d,P[j].p)&&!(xm&&(P[j].xm||[]).includes(i)))E[i].push(j);}return E;}
function cycles(E,L){const out=[];const has=(a,b)=>E[a].includes(b);
 for(let s=0;s<N;s++)for(const b of E[s]){if(b<=s)continue;if(has(b,s))out.push([s,b]);if(L>=3)for(const c of E[b]){if(c<=s||c===b)continue;if(has(c,s))out.push([s,b,c]);}}return out;}
const altCan=(t,P,j)=>t&&t!=='none'&&can(t,P[j].p);
function bestPlan(P,E,L,alt){const C=cycles(E,L),byMin=[];for(let i=0;i<N;i++)byMin[i]=[];C.forEach(c=>byMin[Math.min(...c)].push(c));
 const memo=new Map();let plans=0;
 function pack(mask){if(memo.has(mask))return memo.get(mask);let i=0;while(i<N&&(mask>>i&1))i++;let r;
  if(i>=N)r={v:0,s:[]};else{const q0=pack(mask|1<<i);r={v:q0.v,s:q0.s};
   for(const c of byMin[i]){let m=0,ok=true;for(const x of c){if(mask>>x&1){ok=false;break;}m|=1<<x;}if(!ok)continue;const q=pack(mask|m);if(q.v+c.length>r.v)r={v:q.v+c.length,s:[c].concat(q.s)};}}
  memo.set(mask,r);return r;}
 let best={v:pack(0).v,loops:pack(0).s,chain:null};
 if(alt&&alt!=='none'){const st=[];const rec=(last,mask)=>{const nx=last<0?[...Array(N).keys()].filter(j=>altCan(alt,P,j)):E[last];
   for(const j of nx){if(mask>>j&1)continue;st.push(j);const m2=mask|1<<j,q=pack(m2);
    if(q.v+st.length>best.v)best={v:q.v+st.length,loops:q.s,chain:st.slice()};rec(j,m2);st.pop();}};rec(-1,0);}
 return best;}
/* Count every possible plan (sets of loops that share no pair), for the walkthrough. */
function countPlans(E,L){const C=cycles(E,L);let n=0;const rec=(i,mask)=>{if(i===C.length){n++;return;}rec(i+1,mask);let m=0;for(const x of C[i]){if(mask>>x&1)return;m|=1<<x;}rec(i+1,mask|m);};rec(0,0);return n;}

/* ---------- rules in force (hidden controls fall back to Big picture rules) ---------- */
const loopMax=sim=>atLeast('honors')&&String(sim.p.loops)==='3'?3:2;
const altT=sim=>atLeast('ap')?sim.p.alt:'none';
const xmOn=sim=>atLeast('ap')&&!!sim.p.xm;
function M(sim){const seed=sim.p.seed|0,L=loopMax(sim),a=altT(sim),x=xmOn(sim),key=seed+'|'+L+'|'+a+'|'+x;
 if(cache[key])return cache[key];const P=makeSet(seed),E=edges(P,x),B=bestPlan(P,E,L,a);
 const r={key,P,E,L,alt:a,xm:x,best:B,nLoops:cycles(E,L).length};cache[key]=r;return r;}
function bestFor(sim,L,a){const seed=sim.p.seed|0,x=xmOn(sim),P=makeSet(seed),E=edges(P,x);return bestPlan(P,E,L,a).v;}
/* The student's plan lives in sim.st: loops (arrays of pair indexes), chain (array), path (a loop being built), msg. */
function S(sim){const m=M(sim),st=sim.st;if(st.key!==m.key){st.key=m.key;st.loops=[];st.chain=null;st.path=[];st.building=false;st.msg='';}return st;}
const inPlan=(st,j)=>st.loops.some(c=>c.includes(j))||(st.chain&&st.chain.includes(j));
const helped=st=>st.loops.reduce((a,c)=>a+c.length,0)+(st.chain?st.chain.length:0);
const waitList=st=>[...Array(N).keys()].filter(j=>!inPlan(st,j));
const nm=j=>'Pair '+(j+1);
const listNames=a=>a.length===0?'none':a.length===1?nm(a[0]):a.length===2?nm(a[0])+' and '+nm(a[1]):a.slice(0,-1).map(nm).join(', ')+' and '+nm(a[a.length-1]);
const pl=(n,w)=>n+' '+w+(n===1?'':'s');
/* While the student counts the possible swaps ("Your turn"), the dashed swap lines and the loop count stay hidden. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const swaps=sim=>cycles(M(sim).E,2);
const giveList=sim=>{const E=M(sim).E;return E.map((e,j)=>`Pair ${j+1} → ${e.length?e.map(i=>i+1).join(', '):'nobody'}`).join('<br>');};
const plansChecked=sim=>{const m=M(sim);return countPlans(m.E,m.L);};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function newRules(sim){if(sim.st){sim.st.key=null;S(sim);}clearGut(sim);}
function setPlan(sim,B){const st=S(sim);st.loops=B.loops.map(c=>c.slice());st.chain=B.chain?B.chain.slice():null;st.path=[];st.building=false;st.msg='';}
/* One pick: a click on the stage or a number button. j = pair index, or -1 for the altruistic donor. */
function pick(sim,j){const m=M(sim),st=S(sim),E=m.E,P=m.P;
 if(j===-1&&m.alt==='none')return;st.msg='';
 if(j===-1){
  if(st.building){st.building=false;st.msg=st.chain?`Chain finished: it helps ${pl(st.chain.length,'patient')}.`:'';if(st.chain&&!st.chain.length)st.chain=null;return;}
  st.path=[];st.chain=null;st.building=true;st.msg=`The altruistic donor (type ${m.alt}) starts a chain. Click the first patient she gives to.`;return;}
 if(st.building){const last=st.chain&&st.chain.length?st.chain[st.chain.length-1]:-1;
  if(st.chain&&st.chain.includes(j)){st.chain=st.chain.slice(0,st.chain.indexOf(j));if(!st.chain.length)st.chain=null;st.msg=`Chain cut back to before ${nm(j)}.`;return;}
  if(inPlan(st,j)){st.msg=`${nm(j)} is already in a swap. Click it again after you finish the chain to undo that swap.`;return;}
  const ok=last<0?altCan(m.alt,P,j):E[last].includes(j);
  if(!ok){st.msg=last<0?`The altruistic donor (type ${m.alt}) can’t give to ${nm(j)}’s patient (type ${P[j].p}).`:`${nm(last)}’s donor (type ${P[last].d}) can’t give to ${nm(j)}’s patient (type ${P[j].p}${m.xm&&(P[j].xm||[]).includes(last)?', antibodies':''}).`;return;}
  st.chain=(st.chain||[]).concat([j]);st.msg=`${nm(j)}’s patient gets a kidney. Now ${nm(j)}’s donor (type ${P[j].d}) can give to the next patient, or click the donor in the middle to end the chain.`;return;}
 if(!st.path.length){
  if(inPlan(st,j)){const c=st.loops.find(c=>c.includes(j));if(c){st.loops=st.loops.filter(x=>x!==c);st.msg=`Undone: the swap with ${listNames(c)}.`;}else{st.chain=st.chain.slice(0,st.chain.indexOf(j));if(!st.chain.length)st.chain=null;st.msg=`Chain cut back to before ${nm(j)}.`;}return;}
  st.path=[j];const to=E[j].filter(x=>!inPlan(st,x));st.msg=to.length?`${nm(j)}’s donor (type ${P[j].d}) can give to ${listNames(to)}. Click the pair that gets this kidney.`:`${nm(j)}’s donor (type ${P[j].d}) can’t give to any pair that is still free.`;return;}
 const s0=st.path[0],last=st.path[st.path.length-1];
 if(j===s0){if(st.path.length===1){st.path=[];st.msg='Cancelled.';return;}
  if(E[last].includes(s0)){st.loops.push(st.path.slice());st.msg=`Swap made: ${listNames(st.path)}.`;st.path=[];return;}
  st.msg=`${nm(last)}’s donor (type ${P[last].d}) can’t give back to ${nm(s0)}’s patient (type ${P[s0].p}).`;return;}
 if(st.path.includes(j)){st.path=[];st.msg='Cancelled.';return;}
 if(inPlan(st,j)){st.msg=`${nm(j)} is already in a swap.`;return;}
 if(!E[last].includes(j)){st.msg=`${nm(last)}’s donor (type ${P[last].d}) can’t give to ${nm(j)}’s patient (type ${P[j].p}${m.xm&&(P[j].xm||[]).includes(last)?', antibodies':''}). Try another pair, or click ${nm(s0)} to cancel.`;return;}
 const L=m.L;
 if(L===2||st.path.length===2){if(E[j].includes(s0)){const c=st.path.concat([j]);st.loops.push(c);st.path=[];st.msg=`Swap made: ${listNames(c)}. ${pl(c.length,'patient')} get a kidney.`;return;}
  st.msg=L===2?`${nm(j)}’s donor (type ${P[j].d}) can’t give back to ${nm(s0)}’s patient (type ${P[s0].p}), so these two can’t swap.`:`${nm(j)}’s donor can’t give back to ${nm(s0)}, and loops stop at 3 pairs. Try another pair.`;return;}
 st.path.push(j);st.msg=`${nm(j)}’s patient would get ${nm(last)}’s kidney. Now pick who gets ${nm(j)}’s donor’s kidney: ${nm(s0)} to close a 2-way swap, or a third pair.`;}
function canAddLoop(sim){const m=M(sim),st=S(sim);const free=waitList(st);return cycles(m.E,m.L).some(c=>c.every(x=>free.includes(x)));}
function surgeries(st){let mx=0;st.loops.forEach(c=>mx=Math.max(mx,2*c.length));if(st.chain&&st.chain.length)mx=Math.max(mx,2);return mx;}

/* ---------- layout ---------- */
const CX=400,CY=232,RX=305,RY=158;
const pos=j=>{const a=-Math.PI/2+j*Math.PI/4;return {x:CX+RX*Math.cos(a),y:CY+RY*Math.sin(a)};};
const dims=k=>{const r=11*k+2;return {r,w:118,h:14*k+2*r+14};};
const TC={O:'s3',A:'s2',B:'s4',AB:'s5'};
function trim(x1,y1,x2,y2,hw,hh){const dx=x2-x1,dy=y2-y1;const t=Math.min(dx?hw/Math.abs(dx):1e9,dy?hh/Math.abs(dy):1e9);return t>=1?null:{x:x1+dx*t,y:y1+dy*t};}
function arrow(ctx,a,b,col,w,dash,off,k){const d=dims(k),ha=a.alt?{w:2*d.r+8,h:2*d.r+8}:{w:d.w,h:d.h};
 let x1=a.x,y1=a.y,x2=b.x,y2=b.y;const L=Math.hypot(x2-x1,y2-y1)||1,nx=-(y2-y1)/L,ny=(x2-x1)/L;x1+=nx*off;y1+=ny*off;x2+=nx*off;y2+=ny*off;
 const s=trim(x1,y1,x2,y2,ha.w/2+3,ha.h/2+3)||{x:x1,y:y1},e=trim(x2,y2,x1,y1,d.w/2+5,d.h/2+5)||{x:x2,y:y2};
 ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(e.x,e.y);ctx.stroke();ctx.setLineDash([]);
 const ang=Math.atan2(e.y-s.y,e.x-s.x),hl=7+w*1.5;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x-hl*Math.cos(ang-0.45),e.y-hl*Math.sin(ang-0.45));ctx.lineTo(e.x-hl*Math.cos(ang+0.45),e.y-hl*Math.sin(ang+0.45));ctx.closePath();ctx.fill();}
const LOOPC=['s2','s3','s4','s6'];
function hit(sim,x,y,k){const d=dims(k);for(let j=0;j<N;j++){const p=pos(j);if(Math.abs(x-p.x)<=d.w/2&&Math.abs(y-p.y)<=d.h/2)return j;}
 if(altT(sim)!=='none'&&Math.hypot(x-CX,y-CY)<d.r+12)return -1;return null;}

const SIM={
 id:'kidneyswap',hash:'kidneyswap',apUnit:20,order:1,tab:'Kidney swap',kind:'Simulation',
 skills:{bio:'Counting cases and an exhaustive search: list every plan, keep the best · Geometry (Unit 2, Logic and reasoning)',honors:'Directed graphs, cycles and exhaustive search · Geometry (Unit 2, Logic and reasoning)',ap:'Paths, cycles and an exhaustive search over a graph · Geometry (Unit 2, Logic and reasoning)'},
 card:'Arrange kidney swaps between patients whose own donors can’t give to them, then let an exhaustive search find the plan that helps the most people.',
 title:'Kidney swap: getting the most patients a kidney',
 lede:{bio:'Each pair is a patient who needs a kidney and a family member or friend who wants to give one, but can’t give to their own patient. Swap donors between pairs and more people get a kidney.',
  honors:'Draw each pair as a point and draw an arrow from pair i to pair j when i’s donor can give to j’s patient. A swap is a cycle in this directed graph. Allowing 3-way cycles, not just 2-way swaps, can reach patients no 2-way swap can.',
  ap:'An altruistic donor gives to a stranger and asks nothing back, so her gift starts a chain: a path in the graph, not a cycle. The math searches every chain and every packing of cycles that share no pair, and keeps the one with the most transplants.'},
 scale:'One hospital exchange with 8 patient-donor pairs. Blood type (ABO) decides who can give to whom; at Deep dive, a crossmatch check adds antibodies. Labels are generic: no real patients.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The exchange',
 controls:[
  {id:'pick',label:'Or pick a pair from this list (same as clicking it)',type:'select',def:'none',noTrial:true,
   options:[{v:'none',l:'Choose a pair…'},{v:'1',l:'Pair 1'},{v:'2',l:'Pair 2'},{v:'3',l:'Pair 3'},{v:'4',l:'Pair 4'},{v:'5',l:'Pair 5'},{v:'6',l:'Pair 6'},{v:'7',l:'Pair 7'},{v:'8',l:'Pair 8'},{v:'D',l:'Altruistic donor',lvl:'ap'}],
   help:'Pick a pair, then the pair that gets its donor’s kidney. Pick a pair that is already in a swap to undo that swap.',
   onChange(sim){const v=sim.p.pick;if(v&&v!=='none'){pick(sim,v==='D'?-1:(+v)-1);}sim.p.pick='none';if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.pick)sim.ui.ctl.pick.set('none');}},
  {id:'loops',label:'Loops may have',type:'seg',def:'2',lvl:'honors',noGut:true,options:[{v:'2',l:'2 pairs (swaps)'},{v:'3',l:'up to 3 pairs'}],onChange:newRules,help:'Every surgery in a loop happens at the same time, so a 3-way loop needs 6 operating teams at once.'},
  {id:'alt',label:'Altruistic donor joins (blood type)',type:'seg',def:'none',lvl:'ap',noGut:true,options:[{v:'none',l:'None'},{v:'O',l:'O'},{v:'A',l:'A'},{v:'B',l:'B'},{v:'AB',l:'AB'}],onChange:newRules,help:'Someone who gives a kidney to a stranger and has no patient of their own.'},
  {id:'xm',label:'Check antibodies (crossmatch)',type:'toggle',def:false,lvl:'ap',noGut:true,onChange:newRules,help:'One patient is highly sensitized: her antibodies would attack most donors’ kidneys, even when blood types fit.'},
  {id:'seed',label:'Which set of 8 pairs',type:'range',min:0,max:99,step:1,def:0,noGut:true,onChange:newRules,help:'Set 0 is the one in the walkthrough. Every other number is a different random set.'}
 ],
 actions:[
  {id:'best',label:'Show the best plan',primary:true,run(sim){setPlan(sim,M(sim).best);sim.st.msg='This is the best plan the search found.';}},
  {id:'clear',label:'Clear my plan',run(sim){const st=S(sim);st.loops=[];st.chain=null;st.path=[];st.building=false;st.msg='Plan cleared.';}},
  {id:'newset',label:'New set of pairs',run(sim){BioLab.setValues(sim,{seed:1+Math.floor(Math.random()*99)});}}
 ],
 init(sim){const st={key:null,loops:[],chain:null,path:[],building:false,msg:''};sim.st=st;S(sim);return st;},step(){},
 metrics:[
  {id:'tx',label:'Patients who get a kidney',unit:'of 8',d:0,min:0,max:8,get:sim=>helped(S(sim))},
  {id:'wait',label:'Patients still waiting',unit:'',d:0,min:0,max:8,get:sim=>N-helped(S(sim))},
  {id:'opts',label:'Possible loops with these rules',unit:'',d:0,lvl:'honors',min:0,max:null,get:sim=>pend(sim)?null:M(sim).nLoops},
  {id:'surg',label:'Most operations at the same time',unit:'',d:0,lvl:'honors',min:0,max:8,get:sim=>surgeries(S(sim))}
 ],
 graphs:[{id:'cmp',label:'Most patients helped, by rule',custom:true}],defaultGraph:'cmp',
 plot(sim,ctx,box){const cats=[],vals=[],cols=[];const G=sim.gutS;
  if(G&&G.g){cats.push('Your gut');vals.push(G.g.v);cols.push(PAL['s4']);}
  cats.push('Your plan');vals.push(helped(S(sim)));cols.push(PAL['rj']);
  cats.push('2-way best');vals.push(bestFor(sim,2,'none'));cols.push(PAL['s2']);
  if(atLeast('honors')){cats.push('3-way best');vals.push(bestFor(sim,3,'none'));cols.push(PAL['s3']);}
  if(atLeast('ap')){const a=altT(sim)==='none'?'O':altT(sim);cats.push('+ donor '+a);vals.push(bestFor(sim,3,a));cols.push(PAL['s5']);}
  const ax=axes(ctx,box,{xmin:0,xmax:cats.length,ymin:0,ymax:8,xcats:cats,yl:'Patients who get a kidney',xticks:false});bars(ctx,ax,vals,{colors:cols});},
 draw(sim,ctx,vdt,k){const m=M(sim),st=S(sim),P=m.P,E=m.E,d=dims(k);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const tour=sim.tour&&sim.tour.on;
  /* faint lines: every possible loop among free pairs (2-way only, to keep the picture readable) */
  if(!st.path.length&&!st.building&&!pend(sim)){ctx.globalAlpha=.4;cycles(E,2).forEach(c=>{if(c.some(x=>inPlan(st,x)))return;const a=pos(c[0]),b=pos(c[1]);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);});ctx.globalAlpha=1;}
  /* candidates from the pair (or donor) being built from */
  const from=st.building?(st.chain&&st.chain.length?st.chain[st.chain.length-1]:-1):(st.path.length?st.path[st.path.length-1]:null);
  const cand=from===null?[]:(from===-1?[...Array(N).keys()].filter(j=>altCan(m.alt,P,j)):E[from]).filter(j=>!inPlan(st,j)&&!st.path.includes(j)||(st.path.length>1&&j===st.path[0]));
  const ptOf=j=>j===-1?{x:CX,y:CY,alt:true}:pos(j);
  cand.forEach(j=>arrow(ctx,ptOf(from),pos(j),PAL['rj'],2,[6,5],0,k));
  /* the plan: loops, then the chain */
  st.loops.forEach((c,i)=>{const col=PAL[LOOPC[i%LOOPC.length]];for(let q=0;q<c.length;q++){const a=c[q],b=c[(q+1)%c.length];arrow(ctx,pos(a),pos(b),col,3.5,null,c.length===2?7:0,k);}});
  if(st.chain&&st.chain.length){const col=PAL['s5'];let a={x:CX,y:CY,alt:true};st.chain.forEach(j=>{arrow(ctx,a,pos(j),col,3.5,null,0,k);a=pos(j);});}
  st.path.forEach((j,q)=>{if(q>0)arrow(ctx,pos(st.path[q-1]),pos(j),PAL['rj'],3.5,null,0,k);});
  /* altruistic donor */
  if(m.alt!=='none'){ctx.fillStyle=PAL['card'];ctx.beginPath();ctx.arc(CX,CY,d.r+6,0,7);ctx.fill();ctx.strokeStyle=st.building?PAL['rj']:PAL[TC[m.alt]];ctx.lineWidth=st.building?4:3;ctx.stroke();
   ctx.fillStyle=PAL[TC[m.alt]];ctx.beginPath();ctx.arc(CX,CY,d.r-2,0,7);ctx.fill();txt(ctx,m.alt,CX,CY+1,{s:13*k,w:800,c:'#fff',a:'center',b:'middle'});
   txt(ctx,'Altruistic donor',CX,CY+d.r+8+12*k,{s:12*k,w:700,c:PAL['cv-ink'],a:'center'});}
  /* pair cards */
  for(let j=0;j<N;j++){const p=pos(j),x=p.x-d.w/2,y=p.y-d.h/2,got=inPlan(st,j),cur=st.path.includes(j),isC=cand.includes(j);
   rr(ctx,x,y,d.w,d.h,10);ctx.fillStyle=PAL['card'];ctx.fill();if(got){ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.16;ctx.fill();ctx.globalAlpha=1;}
   ctx.strokeStyle=cur?PAL['rj']:(isC?PAL['rj']:(got?PAL['s3']:PAL['line']));ctx.lineWidth=cur?4:(isC||got?2.5:1.5);ctx.setLineDash(isC&&!cur?[5,4]:[]);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Pair '+(j+1),p.x,y+13*k,{s:13*k,w:700,c:PAL['cv-ink'],a:'center'});
   const cy=y+14*k+8+d.r,lx=p.x-d.r-6,dx=p.x+d.r+6;
   /* patient: ring; donor: filled dot */
   ctx.strokeStyle=PAL[TC[P[j].p]];ctx.lineWidth=3;ctx.fillStyle=PAL['card'];ctx.beginPath();ctx.arc(lx,cy,d.r-1.5,0,7);ctx.fill();ctx.stroke();
   txt(ctx,P[j].p,lx,cy+1,{s:12*k,w:800,c:PAL['cv-ink'],a:'center',b:'middle'});
   ctx.fillStyle=PAL[TC[P[j].d]];ctx.beginPath();ctx.arc(dx,cy,d.r-1,0,7);ctx.fill();
   txt(ctx,P[j].d,dx,cy+1,{s:12*k,w:800,c:'#fff',a:'center',b:'middle'});
   if(P[j].ab||(m.xm&&P[j].xm)){ctx.fillStyle=PAL['cv-inc'];ctx.beginPath();ctx.arc(x+d.w-9,y+9,5,0,7);ctx.fill();}}
  /* header (bottom left) and key (top corners) */
  const G=sim.gutS,n=helped(st);sim._k=k;
  txt(ctx,`${n} of 8 patients get a kidney`,14,440,{s:15*Math.min(k,1.25),w:800,c:PAL['cv-ink']});
  if(G&&G.g&&G.m&&!tour)txt(ctx,`Your gut plan: ${G.g.v}   Best: ${G.m.v}   Plans checked: ${plansChecked(sim).toLocaleString('en-US')}${m.alt!=='none'?' per chain':''}`,14,440-22*Math.min(k,1.25),{s:12*k,w:700,c:PAL['cv-soft']});
  const ky=20*Math.min(k,1.3);
  txt(ctx,'Ring = patient’s type',14,ky,{s:12*k,c:PAL['cv-soft']});
  txt(ctx,'Dot = donor’s type',14,ky+16*k,{s:12*k,c:PAL['cv-soft']});
  ctx.fillStyle=PAL['cv-inc'];ctx.beginPath();ctx.arc(786-5,ky-4*k,5,0,7);ctx.fill();
  txt(ctx,'Red mark = antibodies',786-16,ky,{s:12*k,c:PAL['cv-soft'],a:'right'});},
 onClick(sim,x,y){const k=sim._k||1;let j=hit(sim,x,y,k);if(j===null)j=hit(sim,x,y,1);if(j===null)return;pick(sim,j);sim.infoDirty=true;},
 infoPanel(sim){const m=M(sim),P=m.P;
  const why=j=>P[j].ab?'Blood types fit, but the patient has antibodies against this donor':`Type ${P[j].d} can’t give to type ${P[j].p}`;
  return `<p class="p-h"><b>The 8 pairs</b></p><div style="overflow-x:auto"><table style="font-size:13px"><thead><tr><th>Pair</th><th>Patient</th><th>Donor</th><th>Why they can’t match</th><th>This donor can give to</th></tr></thead><tbody>${P.map((x,j)=>`<tr><td>${j+1}</td><td>${x.p}</td><td>${x.d}</td><td>${why(j)}${m.xm&&x.xm?`. With the crossmatch: also antibodies against Pair ${x.xm.map(i=>i+1).join(', ')}’s donor`:''}</td><td>${m.E[j].map(i=>i+1).join(', ')||'nobody here'}</td></tr>`).join('')}</tbody></table></div><p style="font-size:13px">Blood type rules: O gives to everyone. A gives to A and AB. B gives to B and AB. AB gives only to AB.</p>`;},
 narrate(sim){const st=S(sim),n=helped(st),w=waitList(st);
  if(st.path.length||st.building)return st.msg||(st.building?'You are building a chain. Click the next patient, or click the donor in the middle to end it.':`You picked ${listNames(st.path)}. Click the pair that gets the next kidney, or click ${nm(st.path[0])} to close the loop or cancel.`);
  const sum=n===0?'':n===8?'<b>Every patient gets a kidney.</b> No pair is left out.':`<b>${n} of 8 patients</b> get a kidney. Still waiting: ${listNames(w)}. ${n>=M(sim).best.v?'No plan can help more patients with these rules.':canAddLoop(sim)?'Another loop still fits among the waiting pairs.':'No more loops fit among the waiting pairs: to help more, you would have to undo a swap and rearrange.'}`;
  if(n===0)return (st.msg?st.msg+' ':'')+'Each donor can’t give to their own patient. <b>Click a pair</b> to see which other patients its donor could give to.';
  return (st.msg?st.msg+' ':'')+sum;},
 gut:{better:'higher',controls:['pick'],lockLabel:'Lock in my plan',mathLabel:'Let the math search every plan',
  ask:{bio:'Make the swaps yourself. <b>Click a pair</b> in the picture (or choose it from the list here), then click the pair that gets its donor’s kidney. If the two can trade, the swap is made. Click a pair again to undo its swap. Help as many patients as you can, then lock in your plan.'},
  lock(sim){const st=S(sim),v=helped(st);return {v,full:!canAddLoop(sim),loops:st.loops.map(c=>c.slice()),chain:st.chain?st.chain.slice():null,wait:waitList(st),label:`${v} of 8 patients get a kidney`};},
  solve(sim){const B=M(sim).best;setPlan(sim,B);const st=S(sim);return {v:B.v,wait:waitList(st),label:`${B.v} of 8 patients get a kidney`};},
  hint:{bio:'Lock in your plan. Then you will count the possible swaps yourself, the first step of the search.'},
  calc:{unit:'swaps',d:0,tol:0,
   prompt:sim=>`The search starts by listing every possible 2-way swap. Where each donor’s kidney can go:<br>${giveList(sim)}<br>Two pairs can swap only if each donor can give to the other’s patient, so check both directions. With 8 pairs there are 8 × 7 ÷ 2 = 28 pairs of pairs to check. How many 2-way swaps are possible?`,
   answer:sim=>swaps(sim).length,
   hint:'Take each pair of pairs, like 2 and 4: is 4 in Pair 2’s list, and 2 in Pair 4’s list? Count the ones where both are true.',
   steps(sim){const C=swaps(sim),by=[];for(let i=0;i<N;i++){const w=C.filter(c=>c[0]===i);if(w.length)by.push(`Pair ${i+1}: ${w.map(c=>`${c[0]+1} ⇄ ${c[1]+1}`).join(', ')}`);}
    return [`There are 8 × 7 ÷ 2 = 28 pairs of pairs. Each counts only if the arrows go both ways.`,`The ones that work, by the lower pair number: ${by.length?by.join('; '):'none'}.`,`In all, <b>${C.length}</b> possible swap${C.length===1?'':'s'}. A plan is a set of these that share no pair.`];}},
  formula(sim){const m=M(sim),B=m.best,n=plansChecked(sim),parts=B.loops.map(c=>c.map(x=>x+1).join(c.length===2?' ⇄ ':' → ')+(c.length>2?' → '+(c[0]+1):''));if(B.chain)parts.push('donor → '+B.chain.map(x=>x+1).join(' → '));
   return `Possible ${m.L===2?'2-way swaps':'loops (2- and 3-way)'}: ${m.nLoops}. Plans checked: ${n.toLocaleString('en-US')} sets of loops that share no pair${m.alt!=='none'?', for every chain the donor could start':''}.<br>Best = the plan with the most transplants = ${B.v} of 8${parts.length?': '+parts.join(', '):''}.`;},
  how:{bio:'The math lists every set of swaps that don’t share a pair, counts the transplants in each one, and keeps the biggest. With 8 pairs there are few enough sets for a computer to check them all in a blink. That is an exhaustive search: it can’t miss the best plan.',
   honors:'The math lists every 2-way and 3-way cycle in the directed graph, then checks every way to pack cycles that share no pair, and keeps the packing with the most transplants.',
   ap:'The math tries every chain the altruistic donor could start (every path out of her node), and for each one finds the best packing of cycles among the pairs left. It keeps the overall best: an exhaustive search over a small graph.'},
  compare(sim,g,m){const gain=m.v-g.v,pc=` The search checked ${plansChecked(sim).toLocaleString('en-US')} plans${M(sim).alt!=='none'?' for each chain':''}.`;
   if(gain<=0)return `Your gut was right on: your plan gets <b>${g.v} of 8 patients</b> a kidney, and the search proves no plan does better with these rules. ${g.wait.length?`${listNames(g.wait)} still can’t be helped by any plan here.`:'Every patient is helped.'}`+pc;
   return `The best plan gets <b>${pl(gain,'more patient')} a kidney</b>: ${g.v} → ${m.v} of 8. ${gain===1?'That is one more person who gets':'Those are '+gain+' more people who get'} a transplant this month instead of still waiting. Your plan left ${listNames(g.wait)} waiting; the best plan leaves ${m.wait.length?listNames(m.wait):'nobody'} waiting. ${g.full?'No more loops fit in your plan, yet a different arrangement helps more: a swap that works can still block others.':'Your plan still had room for more loops among the waiting pairs.'}`+pc;},
  again(sim){sim.p.seed=1+Math.floor(Math.random()*99);newRules(sim);}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A new exchange with 5 pairs. Where each donor’s kidney can go: Pair 1 → 2, 3; Pair 2 → 1, 4; Pair 3 → 4; Pair 4 → 2, 3; Pair 5 → 1. How many 2-way swaps are possible?',answer:3,tol:0,unit:'swaps',hint:'A swap needs arrows both ways. Check each pair of pairs: is each one in the other’s list?',explain:'1 ⇄ 2 works (1 → 2 and 2 → 1). 2 ⇄ 4 works, and 3 ⇄ 4 works. 1 ⇄ 3 fails (3 cannot give to 1), and Pair 5 can give to 1 but nobody gives to 5. That is 3 swaps out of 5 × 4 ÷ 2 = 10 pairs of pairs.'},
  {lvl:'bio',instant:true,q:'Pair 1’s donor has type O blood. Why is an O donor so valuable in an exchange?',choices:['Type O blood can be given to a patient of any type','Type O is the rarest blood type','Type O patients can receive from anyone'],correct:0,explain:'An O donor can give to O, A, B and AB patients. In this set, Pair 1’s O donor could give to any of the other 7 patients, so where you spend that kidney matters.'},
  {lvl:'bio',instant:true,q:'Pair 6’s patient has type O blood. Which donors could give her a kidney?',choices:['Only type O donors','Any donor except type AB','Any donor at all'],correct:0,explain:'A type O patient can receive only from a type O donor. Here that means Pair 1’s or Pair 5’s donor. Type O patients are the hardest to match in an exchange.'},
  {lvl:'bio',instant:true,q:'You swap Pair 1 with Pair 2 first, because it works. With 2-way swaps only, what is the most patients you can now help?',choices:['6, the same as the best plan','4','2'],correct:1,explain:'After 1 ⇄ 2, the only swap left among the other pairs is 5 ⇄ 6, so you reach 4. The best plan uses Pair 1’s O donor for a pair nobody else can help and reaches 6. A swap that works can still block others.'},
  {lvl:'honors',instant:true,q:'Allow loops of up to 3 pairs. What is the most patients who can now get a kidney?',choices:['6, the same as with swaps','7','8'],correct:1,explain:'A 3-way loop like 1 → 4 → 8 → 1 reaches Pair 8, whose AB donor can only give to an AB patient. The best plan goes from 6 to 7 patients.'},
  {lvl:'honors',instant:true,q:'Why do exchanges keep loops short, usually 2 or 3 pairs?',choices:['All surgeries in a loop happen at the same time, so a 3-way loop already needs 6 operations at once','Blood type rules stop working in long loops','Longer loops always help fewer patients'],correct:0,explain:'Every donor in a loop gives at the same time, so nobody can back out after their own patient has received. Each pair adds two operations (a donor and a patient), and hospitals can only run so many at once.'},
  {lvl:'ap',instant:true,q:'Why can a chain from an altruistic donor run one step at a time, weeks apart, when a loop can’t?',choices:['In a chain, each pair’s donor gives only after their own patient has received, so if someone backs out, no pair has given without getting','Altruistic donors match everyone','Chains are always shorter than loops'],correct:0,explain:'In a loop, a donor who backs out after their patient received would leave another pair with nothing, so it all happens at once. In a chain, a pair gives only after receiving. If the chain stops, the next pair has lost nothing.'},
  {lvl:'ap',instant:true,q:'Turn on the crossmatch check: Pair 6’s patient has antibodies against Pair 5’s donor. With 2-way swaps only and no altruistic donor, what is the most patients helped?',choices:['6','5','4'],correct:2,explain:'Without 5 ⇄ 6, Pair 6 can only swap with Pair 1, and Pairs 4, 5 and 7 all compete for Pair 2. The best drops from 6 to 4. Highly sensitized patients are hard to match.'}
 ],
 tour:[
  {title:'The pairs',text:'Each card is a pair: a patient who needs a kidney (the ring shows her blood type) and someone who wants to give her one (the dot shows the donor’s type). In every pair, the donor can’t give to their own patient.',pause:true,setup:sim=>{BioLab.setValues(sim,{seed:0,loops:'2',alt:'none',xm:false});BioLab.reset(sim);}},
  {title:'Who can give to whom',text:'Blood type rules: O gives to everyone, A gives to A and AB, B gives to B and AB, and AB gives only to AB. Pair 1’s donor is type O, so her kidney could go to any of the other 7 patients. The dashed arrows show where.',pause:true,setup:sim=>{BioLab.reset(sim);pick(sim,0);}},
  {title:'A 2-way swap',text:'Pair 2’s donor (A) gives to Pair 4’s patient (A), and Pair 4’s donor (B) gives to Pair 2’s patient (B). Two patients who could not be helped alone both get a kidney.',pause:true,setup:sim=>{BioLab.reset(sim);pick(sim,1);pick(sim,3);}},
  {title:'The trap',text:'Swapping Pair 1 with Pair 2 works too. But it uses up the O donor. Now only Pairs 5 and 6 can still swap, and this plan stops at 4 patients. Pairs 3, 4, 7 and 8 are stuck.',pause:true,setup:sim=>{BioLab.reset(sim);pick(sim,0);pick(sim,1);pick(sim,4);pick(sim,5);}},
  {title:'Check every plan',text:'The math does not guess. It lists every set of swaps that share no pair, counts the patients each one helps, and keeps the best. Here the best is 6 of 8: Pair 1’s O donor goes to a pair nobody else can help.',pause:true,setup:sim=>{BioLab.reset(sim);setPlan(sim,M(sim).best);}},
  {lvl:'honors',title:'3-way loops',text:'Now let loops have 3 pairs: 1 gives to 4, 4 gives to 8, and 8 gives back to 1. Pair 8’s AB donor can only give to an AB patient, so no 2-way swap could reach it. The best plan rises to 7.',pause:true,setup:sim=>{BioLab.setValues(sim,{loops:'3'});BioLab.reset(sim);setPlan(sim,M(sim).best);}},
  {lvl:'ap',title:'An altruistic donor starts a chain',text:'A type O altruistic donor joins. Her kidney goes to Pair 3’s type O patient, whom no loop could reach, and now all 8 patients get a kidney. A chain can keep going: the next pair’s donor gives only after their own patient has received, so each step can happen on a different day.',pause:true,setup:sim=>{BioLab.setValues(sim,{loops:'3',alt:'O'});BioLab.reset(sim);setPlan(sim,M(sim).best);}}
 ],
 onTourExit(sim){BioLab.reset(sim);},
 lab:{bio:'<p><b>Question:</b> Does the first swap you find decide how many patients you can help?</p><ol><li>Press <b>Clear my plan</b>. Build a plan starting with the swap 1 ⇄ 2. Record a trial.</li><li>Clear it and build a plan that starts with Pair 1 swapping with Pair 3. Record a trial.</li><li>Press <b>Show the best plan</b> and record it.</li></ol><p>Write one sentence: why does the order you make swaps matter?</p>',
  honors:'<p><b>Question:</b> How much do 3-way loops add?</p><ol><li>For sets 0, 1, 2, 3 and 4, record the best plan with <b>2 pairs</b> and with <b>up to 3 pairs</b> (use <b>Show the best plan</b>).</li><li>Also record <b>Possible loops</b> each time.</li></ol><p>Which sets gained the most, and what do their pairs have in common?</p>',
  ap:'<p><b>Question:</b> Which altruistic donor helps the most?</p><ol><li>With loops up to 3, try the altruistic donor as type O, A, B and AB. Record the best plan for each.</li><li>Turn on the crossmatch check and repeat.</li></ol><p><b>CER:</b> Claim which donor type unlocks the most transplants, evidence from your table, and reasoning from the blood type rules and the chain.</p>'},
 terms:[
  {t:'Kidney paired donation',d:'A swap between patient-donor pairs who can’t match each other: each donor gives to another pair’s patient.'},
  {t:'Exhaustive search',d:'Checking every possible option and keeping the best. It can’t miss the best answer, but it only works when the options are few enough to list.'},
  {t:'Directed graph',d:'Points joined by arrows. Here an arrow from pair i to pair j means i’s donor can give to j’s patient.',lvl:'honors'},
  {t:'Cycle',d:'A path of arrows that returns to where it started. A 2-way swap is a 2-cycle; a 3-way loop is a 3-cycle.',lvl:'honors'},
  {t:'Chain',d:'A path that starts at an altruistic donor and runs from pair to pair without returning.',lvl:'ap'},
  {t:'Crossmatch',d:'A lab test that checks whether a patient’s antibodies would attack a particular donor’s kidney.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Pair i can give to pair j when i’s donor’s blood type fits j’s patient (O gives to all, A to A and AB, B to B and AB, AB only to AB). With the crossmatch check on, one highly sensitized patient also refuses donors her antibodies would attack. The search lists every 2-cycle (and 3-cycle, if allowed), every chain from the altruistic donor, and every way to combine them without sharing a pair, and keeps the plan with the most transplants. Ties keep the first plan found. A chain’s last donor is not counted.</p><p><b>What is simplified.</b> Real matching also weighs tissue type, age, distance and how long each patient has waited, and real exchanges have hundreds of pairs, so they use integer programming instead of listing every plan. The sets of pairs here are made up for illustration, and the blood-type mix is not the real one. This is a simplified model, not medical advice.</p><p><b>Why this counts as a good algorithm.</b> Unlike the hidden scores in “Who’s scoring you?”, the rules here are public. The goal is the real one (transplants), the rules can be published and checked, and no pair is made worse off: a pair that isn’t matched is right where it started. Compare <a href="#valueadded">Can 25 students’ test scores rate a teacher?</a>, where a noisy stand-in for the real goal decides who gets fired.</p><p><b>Real numbers.</b> The National Kidney Registry, one U.S. kidney exchange, facilitated its first transplant in 2008, its 5,000th in June 2021 and its 10,000th living-donor transplant by January 2025, with 1,744 in 2024. These counts are company-reported and may include some directed donations, not only swaps (<a href="https://kidneyregistry.com/news/national-kidney-registry-facilitates-10000th-living-donor-kidney-transplant" target="_blank" rel="noopener">NKR, January 2025</a>). Alvin Roth and Lloyd Shapley shared the 2012 Nobel Prize in Economic Sciences for the theory and practice of market design, which includes kidney exchange (<a href="https://www.nobelprize.org/prizes/economic-sciences/2012/popular-information/" target="_blank" rel="noopener">Nobel Prize, 2012</a>).</p>'
};
BioLab.register(SIM);
})();
