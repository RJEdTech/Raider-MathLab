(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Club service day. Need at least NEED volunteers; the venue takes at most CAP. Each of n invitees shows up
   independently with probability p, so the turnout X is binomial(n, p). A bad day: X < NEED or X > CAP. */
const NEED=20,CAP=26,NMIN=20,NMAX=50,SEED=20261106;
const lch=[0];for(let i=1;i<=200;i++)lch[i]=lch[i-1]+Math.log(i);
const pmf=(n,p,k)=>k<0||k>n?0:Math.exp(lch[n]-lch[k]-lch[n-k]+k*Math.log(p)+(n-k)*Math.log(1-p));
function parts(n,p){let lo=0,hi=0;for(let k=0;k<=n;k++){const q=pmf(n,p,k);if(k<NEED)lo+=q;else if(k>CAP)hi+=q;}return {lo:100*lo,hi:100*hi,bad:100*(lo+hi),good:100*(1-lo-hi)};}
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2));
/* normal approximation with continuity correction: P(19.5 < X < 26.5) */
function normGood(n,p){const m=n*p,s=Math.sqrt(n*p*(1-p));return 100*(Phi((CAP+0.5-m)/s)-Phi((NEED-0.5-m)/s));}
const P=sim=>sim.p.p/100;
function bestN(p){let b=NMIN,bv=1e9;for(let n=NMIN;n<=NMAX;n++){const v=parts(n,p).bad;if(v<bv-1e-9){bv=v;b=n;}}return b;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g));
const f1=v=>v.toFixed(1),r0=v=>Math.round(v);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const lab=(n,p)=>{const r=parts(n,p);return `invite ${n}: about ${r0(r.good)} good days out of 100`;};
const ans=(sim,n)=>{const r=parts(n,P(sim));return {v:r.bad,n,p:sim.p.p,good:r.good,lo:r.lo,hi:r.hi,label:lab(n,P(sim))};};

const SIM={
 id:'rsvp',hash:'rsvp',apUnit:14,order:5,tab:'Invite how many?',kind:'Simulation',
 card:'Pick by feel how many people to invite to a service day, then let the binomial distribution show how often you hit the sweet spot.',
 title:'How many people should you invite?',
 lede:{bio:'Not everyone you invite shows up. Invite too few and you come up short; invite too many and the venue overflows. The math counts how often each number of invites lands in the sweet spot.',
  honors:'If each invitee decides independently with the same chance p, the number who show up is a binomial random variable. Its mean is np and its standard deviation is √(np(1 − p)).',
  ap:'P(20 ≤ X ≤ 26) for X ~ B(n, p). Choose n to make it as large as possible. When np ≥ 10 and n(1 − p) ≥ 10, a normal curve with continuity correction gives a close estimate.'},
 scale:'One club service day. You need 20 to 26 volunteers. Each bar is one possible turnout.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your invite list',
 controls:[
  {id:'n',label:'People you invite',type:'range',min:NMIN,max:NMAX,step:1,def:26,unit:' people'},
  {id:'p',label:'Chance each person shows up',type:'range',min:50,max:90,step:5,def:65,unit:'%',noGut:true,onChange:clearGut,help:'From past events: the share of invited people who actually came.'},
  {id:'show',label:'Show the chances',type:'toggle',def:false,help:'Off: you decide by feel first.'},
  {id:'normal',label:'Show the normal approximation',type:'toggle',def:false,lvl:'ap'}
 ],
 actions:[
  {id:'day',label:'Simulate one day',run(sim){const st=sim.st,n=sim.p.n,p=P(sim),came=[];for(let i=0;i<n;i++)came.push(st.r()<p);st.day={n,came,x:came.filter(Boolean).length};}},
  {id:'best',label:'Find the best number',lvl:'honors',run(sim){BioLab.setValues(sim,{n:bestN(P(sim)),show:true});}}
 ],
 init(sim){return {r:rng(SEED),day:null};},step(){},
 metrics:[
  {id:'good',label:'Good days per 100 (20 to 26 show up)',unit:'',d:1,min:0,max:100,get:sim=>shown(sim)?parts(sim.p.n,P(sim)).good:null},
  {id:'short',label:'Too few show up, per 100 days',unit:'',d:1,min:0,max:100,get:sim=>shown(sim)?parts(sim.p.n,P(sim)).lo:null},
  {id:'over',label:'Too many show up, per 100 days',unit:'',d:1,min:0,max:100,get:sim=>shown(sim)?parts(sim.p.n,P(sim)).hi:null},
  {id:'mean',label:'Expected turnout, np',unit:'people',d:2,lvl:'honors',min:0,max:50,get:sim=>shown(sim)?sim.p.n*P(sim):null},
  {id:'sd',label:'Standard deviation, √(np(1 − p))',unit:'people',d:2,lvl:'honors',min:0,max:5,get:sim=>shown(sim)?Math.sqrt(sim.p.n*P(sim)*(1-P(sim))):null},
  {id:'napprox',label:'Normal approximation: good days per 100',unit:'',d:1,lvl:'ap',min:0,max:100,get:sim=>shown(sim)?normGood(sim.p.n,P(sim)):null}
 ],
 graphs:[{id:'curve',label:'Good days vs. people invited',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const p=P(sim),ax=axes(ctx,box,{xmin:NMIN,xmax:NMAX,ymin:0,ymax:100,xl:'People you invite',yl:'Good days per 100'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the chances',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let n=NMIN;n<=NMAX;n++){const y=ax.Y(parts(n,p).good);n===NMIN?ctx.moveTo(ax.X(n),y):ctx.lineTo(ax.X(n),y);}ctx.stroke();
  const dot=(n,col,lab,dy)=>{const v=parts(n,p).good;ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(n),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,ax.X(n),ax.Y(v)+dy,{s:12,w:700,c:col,a:'center'});};
  const G=GS(sim);if(G&&G.g&&G.g.p===sim.p.p)dot(G.g.n,PAL['s4'],'Your gut',20);
  if(atLeast('honors')||(G&&G.m)){const b=bestN(p);dot(b,PAL['s3'],'Best',-12);}
  dot(sim.p.n,PAL['rj'],'You',(G&&G.g&&Math.abs(G.g.n-sim.p.n)<3)?-26:-12);},
 draw(sim,ctx,vdt,k){const n=sim.p.n,p=P(sim),sh=shown(sim),G=GS(sim),day=sim.st.day&&sim.st.day.n===n?sim.st.day:null;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the invite list: one figure per person */
  const per=25,cw=28,x0=50,y0=40;
  txt(ctx,`You invite ${n} people`,x0-26,24,{s:13*k,w:700});
  if(day)pill(ctx,`This day: ${day.x} showed up${day.x<NEED?', too few':day.x>CAP?', too many':', a good day'}`,560,24,day.x<NEED?PAL['s1']:day.x>CAP?PAL['s4']:PAL['s3'],'#fff',12*Math.min(k,1.4));
  for(let i=0;i<n;i++){const r=Math.floor(i/per),c=i%per,x=x0+c*cw,y=y0+r*42;const came=day?day.came[i]:true;
   ctx.globalAlpha=day&&!came?0.25:1;ctx.fillStyle=day?(came?PAL['s3']:PAL['cv-soft']):PAL['s2'];
   ctx.beginPath();ctx.arc(x,y+8,6,0,7);ctx.fill();rr(ctx,x-8,y+16,16,18,6);ctx.fill();ctx.globalAlpha=1;}
  /* the distribution */
  const L=60,R=780,T=150,B=400,kx=v=>L+(v+0.5)/(NMAX+1)*(R-L),bw=(R-L)/(NMAX+1);
  const fill=(a,b,col)=>{ctx.fillStyle=PAL[col];ctx.globalAlpha=0.10;ctx.fillRect(kx(a-0.5),T,kx(b+0.5)-kx(a-0.5),B-T);ctx.globalAlpha=1;};
  fill(0,NEED-1,'s1');fill(NEED,CAP,'s3');fill(CAP+1,NMAX,'s4');
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  for(let v=0;v<=NMAX;v+=5)txt(ctx,String(v),kx(v),B+16*Math.min(k,1.4),{s:12*k,c:PAL['cv-soft'],a:'center'});
  txt(ctx,'People who show up',R,B+38*Math.min(k,1.2),{s:12*k,c:PAL['cv-soft'],a:'right'});
  [[NEED-0.5,'Need 20','s1','right'],[CAP+0.5,'Cap 26','s4','left']].forEach(([v,l,c,a])=>{ctx.strokeStyle=PAL[c];ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(kx(v),T-4);ctx.lineTo(kx(v),B);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,l,kx(v)+(a==='right'?-6:6),T+10,{s:12*k,w:700,c:PAL[c],a,b:'top'});});
  if(!sh){txt(ctx,'Lock in your gut to see how often each turnout happens.',400,(T+B)/2,{s:13*k,c:PAL['cv-soft'],a:'center'});return;}
  let mx=0;for(let v=0;v<=n;v++)mx=Math.max(mx,pmf(n,p,v));const top=mx*1.5,Y=q=>B-(q/top)*(B-T);
  for(let v=0;v<=n;v++){const q=pmf(n,p,v);if(q<1e-5)continue;ctx.fillStyle=PAL[v<NEED?'s1':v>CAP?'s4':'s3'];ctx.fillRect(kx(v)-bw*0.4,Y(q),bw*0.8,B-Y(q));}
  if(sim.p.normal&&atLeast('ap')){const m=n*p,s=Math.sqrt(n*p*(1-p));ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();
   for(let x=0;x<=NMAX;x+=0.1){const d=Math.exp(-0.5*((x-m)/s)**2)/(s*Math.sqrt(2*Math.PI)),px=kx(x),py=Y(d);x===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();}
  const r=parts(n,p),cy=T+46*Math.min(k,1.3);
  txt(ctx,`${r0(r.lo)} in 100`,kx(NEED-0.5)-8,cy,{s:12*k,w:700,c:PAL['s1'],a:'right'});
  txt(ctx,`${r0(r.hi)} in 100`,kx(CAP+0.5)+8,cy,{s:12*k,w:700,c:PAL['s4'],a:'left'});
  pill(ctx,`Good days: ${r0(r.good)} out of 100`,kx((NEED+CAP)/2),T-18,PAL['s3'],'#fff',12*Math.min(k,1.4));
  if(G&&G.g&&G.g.p===sim.p.p&&G.g.n!==n)txt(ctx,`Your gut (${G.g.n} invited): ${r0(G.g.good)} good days`,L,T-14,{s:12*k,w:700,c:PAL['s4']});},
 narrate(sim){const n=sim.p.n,p=P(sim),m=n*p;
  if(!shown(sim))return `You invite ${n}. If each person shows up ${sim.p.p}% of the time, <b>about ${f1(m)} come on an average day</b>, but any one day can land above or below that.`;
  const r=parts(n,p);
  if(r.lo>r.hi+15)return `Inviting ${n}, about ${f1(m)} show up on average. <b>You come up short on ${r0(r.lo)} days out of 100.</b> Invite more people.`;
  if(r.hi>r.lo+15)return `Inviting ${n}, about ${f1(m)} show up on average. <b>The venue overflows on ${r0(r.hi)} days out of 100.</b> Invite fewer people.`;
  return `Inviting ${n}, about ${f1(m)} show up on average. <b>${r0(r.good)} days out of 100 land between 20 and 26.</b> Short days (${r0(r.lo)}) and overflow days (${r0(r.hi)}) are roughly balanced.`;},
 gut:{better:'lower',controls:['n'],
  ask:{bio:'Drag <b>People you invite</b> here to how many you would invite. Remember: not everyone you invite comes. Lock it in when it feels right.',honors:'Set <b>People you invite</b> by feel, then lock it in before you look at the distribution.'},
  lock(sim){return ans(sim,sim.p.n);},
  solve(sim){const b=bestN(P(sim));sim.p.n=b;return ans(sim,b);},
  how:{bio:'For each possible number of invites, the math works out the chance of every possible turnout, then adds up the chances of 20 to 26. It picks the number of invites where that total is biggest.',
   honors:'X ~ B(n, p). For each n from 20 to 50, add P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ for k = 20 to 26, and keep the n with the biggest total.',
   ap:'Maximize P(20 ≤ X ≤ 26) over n. A quick start: put the mean np near the middle of 20 to 26, so n ≈ 23/p; then check the neighbors exactly.'},
  compare(sim,g,m){const d=g.v-m.v;
   if(g.n===m.n)return `Your gut was right on: inviting ${m.n} gives the most good days, about ${r0(m.good)} out of 100. Your sense of how many people flake already matches the binomial distribution.`;
   if(d<0.5)return `Your gut was practically right: inviting ${g.n} gives ${f1(g.good)} good days out of 100, and the best, ${m.n}, gives ${f1(m.good)}. Less than one day in 100 apart.`;
   const why=g.n<m.n?`you come up short on ${r0(g.lo)} days out of 100`:`the venue overflows on ${r0(g.hi)} days out of 100`;
   return `Inviting ${g.n}, ${why}. Inviting ${m.n} gives <b>${r0(m.good)} good days out of 100 instead of ${r0(g.good)}</b>: about ${Math.max(1,r0(m.good)-r0(g.good))} more service days that work, for every 100 you run.`;},
  again(sim){sim.p.p=50+5*Math.floor(Math.random()*9);sim.p.n=26;sim.p.show=false;sim.st.day=null;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You invite 26 people and each shows up 65% of the time. About how many come on a typical day?',choices:['About 26','About 17','About 20'],correct:1,explain:'On average 26 × 0.65 = 16.9 people come. You fall short of 20 on about 86 days out of 100.'},
  {lvl:'bio',instant:true,q:'Why not just invite 50 people to be safe?',choices:['It is safe: more people is always better','About 32 would come on average, so the venue overflows almost every time','Nobody would come'],correct:1,explain:'50 × 0.65 = 32.5 on average, well over the cap of 26. With 50 invites, the venue overflows on about 96 days out of 100, and 20 to 26 show up on only about 4.'},
  {lvl:'honors',instant:true,q:'Which of these breaks the binomial model for your turnout?',choices:['Each person either comes or does not','Friends decide together: if one skips, the whole group skips','You invite a fixed number of people'],correct:1,explain:'Binomial needs BINS: Binary outcomes, Independent trials, a fixed Number of trials, and the Same chance each time. Friends who decide as a group are not independent, so turnout swings more than the binomial model predicts.'},
  {lvl:'honors',instant:true,q:'You invite 35 people, each with a 65% chance of coming. What are the mean and standard deviation of the turnout?',choices:['Mean 22.75, SD 2.82','Mean 22.75, SD 7.96','Mean 35, SD 2.82'],correct:0,explain:'Mean np = 35 × 0.65 = 22.75. SD = √(np(1 − p)) = √(35 × 0.65 × 0.35) = √7.96 ≈ 2.82.'},
  {lvl:'ap',instant:true,q:'For n = 35 and p = 0.65, the normal approximation with continuity correction estimates P(20 ≤ X ≤ 26) as P(19.5 < Y < 26.5). About how big is it?',choices:['About 0.62','About 0.78','About 0.91'],correct:1,explain:'z = (19.5 − 22.75)/2.82 ≈ −1.15 and z = (26.5 − 22.75)/2.82 ≈ 1.33. Φ(1.33) − Φ(−1.15) ≈ 0.908 − 0.125 ≈ 0.78. The exact binomial answer is 0.785.'},
  {lvl:'ap',instant:true,q:'Is the normal approximation reasonable for n = 35, p = 0.65?',choices:['Yes: np = 22.75 and n(1 − p) = 12.25 are both at least 10','No: n must be at least 100','No: p must be exactly 0.5'],correct:0,explain:'The Large Counts condition asks for at least 10 expected successes and 10 expected failures. Here 22.75 and 12.25 both pass, and the estimate (0.78) is close to the exact 0.785.'}
 ],
 tour:[
  {title:'The service day',text:'You need at least 20 volunteers, and the food bank takes at most 26. From past events, each person you invite shows up 65% of the time.',pause:true,focus:[10,4,780,130],setup:sim=>BioLab.setValues(sim,{n:26,p:65,show:false})},
  {title:'Invite exactly 26?',text:'Each bar is one possible turnout; taller bars happen more often. Invite 26 and about 16.9 people come on average. Most of the bars sit left of the 20 line: you come up short on about 86 days out of 100.',pause:true,setup:sim=>BioLab.setValues(sim,{n:26,show:true})},
  {title:'Invite more',text:'Invite 35. The whole distribution slides right: the average is now 22.75 people, and about 79 days out of 100 land between 20 and 26.',pause:true,setup:sim=>BioLab.setValues(sim,{n:35,show:true}),focus:[40,120,750,320]},
  {title:'Too many',text:'Invite 42 and the average turnout is 27.3: the venue overflows on about 61 days out of 100. Somewhere in between is the best number.',pause:true,setup:sim=>BioLab.setValues(sim,{n:42,show:true})},
  {title:'You cannot win every day',text:'Even the best number, 35, fails on about 21 days out of 100: 13 short and 9 over. Chance spreads the turnout over about ±3 people, and the window from 20 to 26 is only 7 people wide.',pause:true,setup:sim=>BioLab.setValues(sim,{n:35,show:true})},
  {lvl:'honors',title:'The binomial setting',text:'BINS: each invitee comes or not (Binary), decides on their own (Independent), you invite a fixed Number, and each has the Same 65% chance. Then X ~ B(35, 0.65), with mean np = 22.75 and SD √(np(1 − p)) ≈ 2.82.',pause:true},
  {lvl:'ap',title:'The normal approximation',text:'np = 22.75 and n(1 − p) = 12.25 are both at least 10, so a normal curve fits well. With continuity correction, P(19.5 < Y < 26.5) ≈ 0.78, close to the exact 0.785.',pause:true,setup:sim=>BioLab.setValues(sim,{n:35,show:true,normal:true})}
 ],
 lab:{bio:'<p><b>Question:</b> How does the best number of invites depend on how reliable people are?</p><ol><li>Turn on <b>Show the chances</b>.</li><li>Set the show-up chance to 65%. Move <b>People you invite</b> until good days are as high as you can get them. Record a trial.</li><li>Repeat for 50%, 75% and 90%.</li></ol><p>Write one sentence: what happens to the best number, and to the good days, as people get more reliable?</p>',
  honors:'<p><b>Question:</b> Does the best number put the mean in the middle of the window?</p><ol><li>For four show-up chances, press <b>Find the best number</b>.</li><li>Record n, the mean np and the SD.</li></ol><p>Compare each mean with 23, the middle of 20 to 26, and explain why reliable groups have more good days.</p>',
  ap:'<p><b>Question:</b> When is the normal approximation good enough?</p><ol><li>Turn on the normal curve. Record the exact and approximate good days for p = 50%, 65% and 90% at the best n.</li><li>Check np ≥ 10 and n(1 − p) ≥ 10 each time.</li></ol><p><b>CER:</b> Claim when the approximation works, with evidence from your table and reasoning from the Large Counts condition.</p>'},
 terms:[
  {t:'Binomial distribution',d:'The chances of each possible number of successes in n independent tries that each succeed with the same probability p.'},
  {t:'Expected value (mean)',d:'The long-run average turnout. For a binomial, μ = np.'},
  {t:'BINS',d:'The binomial conditions: Binary outcomes, Independent trials, fixed Number of trials, Same probability each trial.',lvl:'honors'},
  {t:'Standard deviation',d:'How far turnout typically lands from the mean. For a binomial, σ = √(np(1 − p)).',lvl:'honors'},
  {t:'Binomial probability',d:'P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ.',lvl:'honors'},
  {t:'Normal approximation',d:'When np ≥ 10 and n(1 − p) ≥ 10, a normal curve with the same mean and SD estimates binomial probabilities. Widen each whole number by 0.5 on each side (continuity correction).',lvl:'ap'}
 ],
 about:'<p>The turnout X is binomial: X ~ B(n, p), so P(X = k) = C(n, k)pᵏ(1 − p)ⁿ⁻ᵏ. A good day means 20 ≤ X ≤ 26. The tool adds the exact binomial probabilities; nothing here is simulated except <b>Simulate one day</b>, which uses a fixed random seed so it repeats after Reset.</p><p><b>Assumptions:</b> every invitee decides independently and has the same chance of coming. Real groups break both: friends tend to come or skip together, and some people are much more reliable than others. Both make turnout swing more than this model says, so a real organizer would want some slack, such as a waitlist or a few backups to call.</p><p>The normal approximation at Deep dive uses mean np, SD √(np(1 − p)) and a continuity correction: P(19.5 < Y < 26.5).</p>'
};
BioLab.register(SIM);
})();
