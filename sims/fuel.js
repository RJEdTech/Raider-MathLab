(function(){
'use strict';
const {clamp,txt,pill,PAL,atLeast,fmtNum}=BioLab.h;
/* Fuel before a test or a game (Nov 18, 2026, for Colin Downs's AP Precalculus exponential unit).
   Two tanks, each draining at a rate proportional to what it holds:
   stomach (or mouth, for a pouch) S(t) = e^(−ka t) of the dose; blood gets ka·S and loses ke·B.
   Extra level in the blood: C(t) = A (e^(−k1 t) − e^(−k2 t)), k1 the slower rate, k2 the faster, A > 0.
   Half-times are illustrative, chosen to match typical published shapes (see about). */
const FOODS={
 candy:{name:'Candy bar',ta:15,tc:30,peak:45,base:90,unit:'mg/dL',what:'blood sugar',tank1:'Stomach',out:'Cells use it',gl:true},
 meal:{name:'Balanced meal',ta:45,tc:30,peak:25,base:90,unit:'mg/dL',what:'blood sugar',tank1:'Stomach',out:'Cells use it',gl:true},
 pouch:{name:'Nicotine pouch',ta:Math.LN2/0.08,tc:120,peak:6,base:0,unit:'ng/mL',what:'blood nicotine',tank1:'Mouth (pouch)',out:'Liver clears it',gl:false}
};
const F=sim=>FOODS[sim.p.food]||FOODS.candy;
const ks=f=>({ka:Math.LN2/f.ta,ke:Math.LN2/f.tc});
const tpk=f=>{const {ka,ke}=ks(f);return Math.log(ka/ke)/(ka-ke);};
const g=(f,t)=>{const {ka,ke}=ks(f);return (Math.exp(-ke*t)-Math.exp(-ka*t))/(ka-ke)*ka;};   /* fraction of the dose in the blood */
const extra=(f,t)=>f.peak*g(f,t)/g(f,tpk(f));
const pctLeft=(f,t)=>100*g(f,t)/g(f,tpk(f));
const A=f=>{const {ka,ke}=ks(f);return Math.abs(f.peak/(Math.exp(-ke*tpk(f))-Math.exp(-ka*tpk(f))));};
const k1=f=>{const {ka,ke}=ks(f);return Math.min(ka,ke);},k2=f=>{const {ka,ke}=ks(f);return Math.max(ka,ke);};
const cpend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g))&&!cpend(sim);
const lvl=(f,v)=>f.gl?fmtNum(f.base+v,0)+' mg/dL':fmtNum(v,1)+' ng/mL';
const plus=(f,v)=>f.gl?'+'+fmtNum(v,1)+' mg/dL':fmtNum(v,2)+' ng/mL';
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const viewT=sim=>(sim.tour&&sim.tour.on&&sim.tv!=null)?sim.tv:(shown(sim)?sim.p.test:0);

function tanks(sim,ctx,k,t){const f=F(sim),{ka,ke}=ks(f),kk=Math.min(k,1.4),S=Math.exp(-ka*t),Bm=g(f,t),Bmax=g(f,tpk(f));
 const inR=ka*S,outR=ke*Bm,mx=ka,x0=28,w=170;
 const tank=(y,h,fill,c,label)=>{ctx.fillStyle=PAL['card'];ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.fillRect(x0,y,w,h);ctx.fillStyle=c;ctx.globalAlpha=.85;ctx.fillRect(x0+2,y+h-(h-4)*fill-2,w-4,(h-4)*fill);ctx.globalAlpha=1;ctx.strokeRect(x0,y,w,h);txt(ctx,label,x0+w/2,y-8,{s:13*kk,w:800,a:'center'});};
 tank(58,90,S,f.gl?'#c98a3a':'#8a8f98',f.tank1);
 tank(228,84,clamp(0.9*Bm/Bmax,0,1),f.gl?'#d2574a':'#7d63b8','Blood');
 const arrow=(y1,y2,r,label,c)=>{const wd=3+34*r/mx;ctx.fillStyle=c;ctx.globalAlpha=.9;ctx.fillRect(x0+w/2-wd/2,y1,wd,y2-y1-10);ctx.beginPath();ctx.moveTo(x0+w/2-wd/2-8,y2-10);ctx.lineTo(x0+w/2+wd/2+8,y2-10);ctx.lineTo(x0+w/2,y2);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  txt(ctx,label,x0+w/2+wd/2+12,(y1+y2)/2+4,{s:12*kk,w:700,c});};
 const honors=atLeast('honors');
 arrow(150,212,inR,honors?'in '+fmtNum(100*inR,2)+'%/min':'in',PAL['s2']);
 arrow(314,374,outR,honors?'out '+fmtNum(100*outR,2)+'%/min':'out',PAL['s1']);
 txt(ctx,f.out,x0+w/2,392,{s:12*kk,w:700,c:PAL['cv-soft'],a:'center'});
 txt(ctx,'at '+Math.round(t)+' min',x0+w/2,20,{s:12*kk,w:800,c:PAL['cv-soft'],a:'center'});
 if(Math.abs(inR-outR)<0.06*mx&&t>5)pill(ctx,'in = out: the peak',x0+w/2+40,182,PAL['s4'],'#fff',12*kk);}

const SIM={
 id:'fuel',hash:'fuel',apUnit:4,order:4.5,tab:'Fuel before a test or game',kind:'Simulation',
 skills:{bio:'Exponential decay and half-life · Precalculus Unit 6, AP Precalculus 2A',honors:'Combining exponential functions: a difference of two exponentials · AP Precalculus 2A',ap:'Modeling with exponentials: rate proportional to amount, maxima, and solving with logarithms · AP Precalculus 2A–2B'},
 prereq:['caffeine'],next:['lnbase','caffeinedaily'],
 card:'Compare what is still in your blood at test time after a candy bar, a balanced meal or a nicotine pouch, using two tanks that each drain in proportion to what they hold.',
 title:'Fuel before a test or a game',
 lede:{bio:'Your stomach (or your mouth, for a pouch) passes what you took into your blood, and your body clears it from your blood. <b>Each tank drains in proportion to how much it holds.</b> That one rule makes the rise, the peak and the fall.',
  honors:'With S the share still in the stomach, S(t) = e^(−kₐt). The blood gains kₐS and loses kₑB. The extra level is a difference of two exponentials: C(t) = A(e^(−k₁t) − e^(−k₂t)), with k₁ the slower rate and k₂ the faster. The tail after the peak follows the slower tank.',
  ap:'C′(t) = 0 where k₁e^(−k₁t) = k₂e^(−k₂t), so the peak is at t* = ln(k₂/k₁) ÷ (k₂ − k₁). Solving C(t) = c for t needs logarithms (or a graph); far from the peak, C(t) ≈ Ae^(−k₁t).'},
 scale:'One person, four hours after eating or after one pouch. Blood sugar in milligrams per deciliter (mg/dL), nicotine in nanograms per milliliter (ng/mL).',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Before the test',
 controls:[
  {id:'food',label:'What do you have?',type:'seg',def:'candy',noGut:true,onChange:clearGut,options:[{v:'candy',l:'Candy bar'},{v:'meal',l:'Balanced meal'},{v:'pouch',l:'Nicotine pouch'}]},
  {id:'test',label:'The test or game starts this long after',type:'range',min:30,max:240,step:15,def:90,unit:' min',noGut:true,onChange:clearGut},
  {id:'guess',label:'Your guess: share of the peak still there',type:'range',min:0,max:100,step:1,def:50,unit:'%'},
  {id:'all',label:'Show candy and meal together',type:'toggle',def:false,lvl:'honors',noGut:true}
 ],
 actions:[{id:'show',label:'Skip the guess and show the curve',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'left',label:'Share of the peak at test time',unit:'%',d:0,min:0,max:100,get:sim=>shown(sim)?pctLeft(F(sim),sim.p.test):null},
  {id:'level',label:'Extra in your blood at test time',text:true,get:sim=>shown(sim)?plus(F(sim),extra(F(sim),sim.p.test)):'—'},
  {id:'tpk',label:'Peak comes at',unit:'min',d:0,min:0,max:240,get:sim=>shown(sim)?tpk(F(sim)):null},
  {id:'tail',label:'Tail halves every (slower tank)',unit:'min',d:0,lvl:'honors',min:0,max:200,get:sim=>Math.max(F(sim).ta,F(sim).tc)},
  {id:'k1',label:'k₁ (slower rate)',unit:'per min',d:4,lvl:'ap',min:0,max:0.1,get:sim=>k1(F(sim))},
  {id:'k2',label:'k₂ (faster rate)',unit:'per min',d:4,lvl:'ap',min:0,max:0.1,get:sim=>k2(F(sim))}
 ],
 draw(sim,ctx,vdt,k){const f=F(sim),sh=shown(sim),kk=Math.min(k,1.5),G=sim.gutS,stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,t=viewT(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  tanks(sim,ctx,k,t);
  const L0=Math.round(270+22*kk),R0=780,T0=40,B0=392;
  const ymin=f.gl?80:0,ymax=f.gl?150:8;
  const X=x=>L0+x/240*(R0-L0),Y=v=>B0-(v-ymin)/(ymax-ymin)*(B0-T0);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let x=0;x<=240;x+=30){ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(X(x),T0);ctx.lineTo(X(x),B0);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(x),X(x),B0+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
  const ys=f.gl?10:1;for(let v=ymin;v<=ymax;v+=ys){if(f.gl&&(v-ymin)%20)continue;ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(L0,Y(v));ctx.lineTo(R0,Y(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(v),L0-8,Y(v)+4,{s:12*kk,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'Minutes after',R0,B0+36*kk,{s:12*kk,w:700,c:PAL['cv-soft'],a:'right'});
  txt(ctx,(f.gl?'Blood sugar (mg/dL)':'Blood nicotine (ng/mL)'),L0,T0-14,{s:12*kk,w:700,c:PAL['cv-soft']});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L0,T0);ctx.lineTo(L0,B0);ctx.lineTo(R0,B0);ctx.stroke();
  if(f.gl){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(L0,Y(90));ctx.lineTo(R0,Y(90));ctx.moveTo(L0,Y(140));ctx.lineTo(R0,Y(140));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'before eating',R0-4,Y(90)+15*kk,{s:12*kk,c:PAL['cv-soft'],a:'right'});txt(ctx,'140: usual top after a meal',R0-4,Y(140)-6,{s:12*kk,c:PAL['cv-soft'],a:'right'});}
  /* test time */
  const tx=X(sim.p.test);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx,T0);ctx.lineTo(tx,B0);ctx.stroke();txt(ctx,'Test starts',tx+(tx>R0-90?-6:6),T0+12*kk,{s:12*kk,w:800,a:tx>R0-90?'right':'left'});
  const curve=(ff,c,w,lim,dash)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();for(let x=0;x<=lim+1e-9;x+=1){const px=X(x),py=Y(ff.base+extra(ff,x));x?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();ctx.setLineDash([]);};
  if(sh){const lim=(sim.tour&&sim.tour.on&&sim.tv!=null)?Math.max(sim.tv,0):240;
   if(atLeast('honors')&&sim.p.all&&f.gl){curve(FOODS.candy,PAL['s1'],2.5,240);curve(FOODS.meal,PAL['s3'],2.5,240);
    txt(ctx,'Candy bar',X(tpk(FOODS.candy))+10,Y(90+45)-4,{s:12*kk,w:800,c:PAL['s1']});txt(ctx,'Balanced meal',X(110),Y(90+FOODS.meal.peak*0.85)-10,{s:12*kk,w:800,c:PAL['s3']});}
   else curve(f,PAL['rj'],3,lim);
   if(stg===5){curve(FOODS.candy,PAL['s1'],2,240,[6,5]);curve(FOODS.meal,PAL['s3'],3,240);}
   const p=tpk(f);if(lim>=p){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(X(p),Y(f.base+f.peak),6,0,7);ctx.fill();pill(ctx,'peak '+lvl(f,f.peak)+' at '+Math.round(p)+' min',X(p)+66*kk,Y(f.base+f.peak)-18*kk,PAL['s4'],'#fff',12*kk);}
   if(!(sim.tour&&sim.tour.on&&sim.tv!=null)){const v=extra(f,sim.p.test);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(tx,Y(f.base+v),7,0,7);ctx.fill();
    pill(ctx,Math.round(pctLeft(f,sim.p.test))+'% of the peak',Math.min(tx+70*kk,R0-70*kk),Y(f.base+v)+(v>f.peak*0.7?34:-24)*kk,PAL['rj'],'#fff',13*kk);}
   if(stg===8||(stg===99&&atLeast('ap'))){const p2=tpk(f);ctx.strokeStyle=PAL['s4'];ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(X(p2),Y(f.base+f.peak));ctx.lineTo(X(p2),B0);ctx.stroke();ctx.setLineDash([]);txt(ctx,'t* = '+fmtNum(p2,1)+' min',X(p2)+6,B0-8,{s:12*kk,w:800,c:PAL['s4']});}
  }else if(!cpend(sim)){txt(ctx,'?',tx+16,Y(f.base+f.peak*0.6),{s:34*kk,w:800,c:PAL['rj']});txt(ctx,'Peak: '+lvl(f,f.peak)+(f.gl?' (+'+f.peak+')':''),L0+12,T0+34*kk,{s:13*kk,w:700,c:PAL['s4']});}
  /* gut */
  const gv=G&&G.g?G.g.p:sim.p.guess,gy=Y(f.base+f.peak*gv/100);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(tx,gy,9,0,7);ctx.stroke();
  txt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+Math.round(gv)+'%',tx-14,gy+5,{s:12*kk,w:800,c:PAL['s4'],a:'right'});
 },
 narrate(sim){const f=F(sim),t=sim.p.test;
  if(cpend(sim))return 'Work it out: after the peak, the level halves about every '+Math.round(Math.max(f.ta,f.tc))+' minutes.';
  if(!shown(sim))return `The ${f.tank1.toLowerCase()} starts full and the blood starts at its normal level. <b>Each tank drains in proportion to what it holds.</b> Guess how much of the peak is still in your blood when the test starts.`;
  const p=tpk(f),v=extra(f,t);
  if(t<p)return `At ${t} minutes the ${f.tank1.toLowerCase()} is still pouring in faster than the blood drains, so the level is still rising: <b>${Math.round(pctLeft(f,t))}% of the peak</b>, which comes at ${Math.round(p)} minutes.`;
  return `The peak came at ${Math.round(p)} minutes, when in = out. Since then the outflow has won. <b>At ${t} minutes, ${Math.round(pctLeft(f,t))}% of the peak is left</b> (${plus(f,v)}${f.gl?' above where you started':''}).`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to how much of the peak you think is still in your blood when the test starts. The orange ring on the test line moves with it. Then lock it in.',honors:'Before you see the curve: drag the slider here to the share of the peak left at test time, then lock it in.'},
  hint:'Lock your gut answer, then you will estimate it yourself.',
  lock(sim){const g0=sim.p.guess;return {v:Math.abs(g0-pctLeft(F(sim),sim.p.test)),p:g0,label:Math.round(g0)+'% of the peak'};},
  solve(sim){const v=pctLeft(F(sim),sim.p.test);sim.p.guess=Math.round(v);return {v:0,p:v,label:Math.round(v)+'% of the peak'};},
  how:{bio:'The math follows both tanks minute by minute. Each one loses the same fraction of what it holds every minute, so the blood rises while the inflow is bigger, peaks when in = out, then falls by halves.',
   honors:'C(t) = A(e^(−k₁t) − e^(−k₂t)): the blood level is the difference of two exponential decays.',
   ap:'C(t) = A(e^(−k₁t) − e^(−k₂t)), peak at t* = ln(k₂/k₁)/(k₂ − k₁), and C(t)/C(t*) at the test time.'},
  formula(sim){const f=F(sim),t=sim.p.test;return `C(${t}) = ${fmtNum(A(f),2)}(e^(−${fmtNum(k1(f),4)} · ${t}) − e^(−${fmtNum(k2(f),4)} · ${t})) = ${fmtNum(extra(f,t),2)}, which is ${Math.round(pctLeft(f,t))}% of the ${fmtNum(f.peak,f.gl?0:1)} peak`;},
  calc:{unit:'',d:2,tol:a=>Math.max(0.05,Math.abs(a)*0.02),
   prompt:{bio:sim=>{const f=F(sim),h=Math.max(f.ta,f.tc);return `After the peak, the ${f.gl?'extra sugar':'nicotine'} halves about every <b>${Math.round(h)} minutes</b>. The peak is <b>${plus(f,f.peak)}</b>. About how much is left <b>60 minutes after the peak</b>?`;},
    honors:sim=>{const f=F(sim),t=sim.p.test;return `C(t) = ${fmtNum(A(f),2)}(e^(−${fmtNum(k1(f),4)}t) − e^(−${fmtNum(k2(f),4)}t)), t in minutes. Find the extra level at test time, t = ${t}.`;},
    ap:sim=>{const f=F(sim);return `For k₁ = ${fmtNum(k1(f),4)} and k₂ = ${fmtNum(k2(f),4)} per minute, when is the peak? Use t* = ln(k₂/k₁) ÷ (k₂ − k₁).`;}},
   answer:sim=>{const f=F(sim);if(atLeast('ap'))return tpk(f);if(atLeast('honors'))return extra(f,sim.p.test);return f.peak*Math.pow(0.5,60/Math.max(f.ta,f.tc));},
   hint:{bio:'60 minutes is how many half-lives? Multiply the peak by (1/2) to that power.',honors:'Compute each exponential first, subtract, then multiply by A.',ap:'k₂/k₁ first, then its natural log.'},
   steps(sim){const f=F(sim),t=sim.p.test;
    if(atLeast('ap')){const a=k1(f),b=k2(f);return [`k₂/k₁ = ${fmtNum(b/a,3)}, and ln ${fmtNum(b/a,3)} = ${fmtNum(Math.log(b/a),4)}.`,`k₂ − k₁ = ${fmtNum(b-a,4)} per minute.`,`t* = ${fmtNum(Math.log(b/a),4)} ÷ ${fmtNum(b-a,4)} ≈ <b>${fmtNum(tpk(f),2)} minutes</b>.`];}
    if(atLeast('honors')){const e1=Math.exp(-k1(f)*t),e2=Math.exp(-k2(f)*t);return [`e^(−${fmtNum(k1(f),4)} · ${t}) ≈ ${fmtNum(e1,4)} and e^(−${fmtNum(k2(f),4)} · ${t}) ≈ ${fmtNum(e2,4)}.`,`Difference: ${fmtNum(e1-e2,4)}.`,`× ${fmtNum(A(f),2)} ≈ <b>${fmtNum(extra(f,t),2)}</b> ${f.gl?'mg/dL above where you started':'ng/mL'}.`];}
    const h=Math.max(f.ta,f.tc),n=60/h,v=f.peak*Math.pow(0.5,n);return [`60 ÷ ${Math.round(h)} = ${fmtNum(n,2)} half-lives.`,`${fmtNum(f.peak,f.gl?0:1)} × (1/2)^${fmtNum(n,2)} ≈ <b>${fmtNum(v,2)}</b> ${f.gl?'mg/dL extra':'ng/mL'}.`,`The real curve is a little higher, because the ${f.tank1.toLowerCase()} is still sending some in.`];}},
  compare(sim,g0,m){const f=F(sim),off=Math.abs(g0.p-m.p),v=extra(f,sim.p.test);
   const real=f.gl?` That is ${plus(f,v)} above where you started, ${f.name==='Candy bar'?'on the way down from a quick spike':'still near its broad, low top'}.`:` That is about ${fmtNum(v,1)} ng/mL, and it keeps halving every 2 hours or so.`;
   if(off<=5)return `Your gut was right on: <b>${Math.round(m.p)}% of the peak</b> is left at ${sim.p.test} minutes.`+real;
   return `You guessed ${Math.round(g0.p)}%; the two-tank model says <b>${Math.round(m.p)}% of the peak</b> is still there at ${sim.p.test} minutes, so you were off by ${Math.round(off)} points.`+real;},
  again(sim){sim.peek=false;sim.p.food=['candy','meal','pouch'][Math.floor(Math.random()*3)];sim.p.test=[45,60,90,120,150,180][Math.floor(Math.random()*6)];sim.p.guess=50;}
 },
 onTourExit(sim){sim.peek=false;sim.tv=null;sim.tst=null;},
 challenges:[
  {kind:'num',lvl:'bio',q:'After its peak, a level halves every 30 minutes. The peak is 40 above normal. About how much is left 90 minutes after the peak (ignore anything still coming in)?',answer:5,tol:0.05,unit:'',hint:'90 minutes is 3 half-lives.',explain:'40 → 20 → 10 → 5. Three halvings: 40 × (1/2)³ = 5.'},
  {lvl:'bio',instant:true,q:'When is the level in your blood highest?',choices:['Right when you eat','When the inflow from your stomach equals the outflow from your blood','When your stomach is empty','At the test'],correct:1,explain:'Before that moment more comes in than goes out, so the level rises. After it, more goes out than comes in, so it falls. In = out is the peak.'},
  {lvl:'bio',instant:true,q:'Why does a balanced meal give a lower, later and longer bump than a candy bar?',choices:['It has no sugar at all','Fiber, protein and fat slow how fast the stomach empties, so sugar trickles in','Your blood clears meal sugar faster','It goes straight to your muscles'],correct:1,explain:'A slower inflow tank means a lower peak that comes later and lasts longer. Same rule, different rate.'},
  {lvl:'honors',instant:true,q:'For a balanced meal, the stomach half-time (45 min) is longer than the blood’s (30 min). Which half-time sets how fast the level falls an hour or more after the peak?',choices:['30 minutes, the blood','45 minutes, the stomach: the slower tank','The average, 37.5 minutes','Neither'],correct:1,explain:'Far from the peak, the faster exponential has died out and C(t) ≈ Ae^(−k₁t), with k₁ the slower rate. Here that is the stomach, still trickling sugar in.'},
  {kind:'num',lvl:'honors',q:'C(t) = 180(e^(−0.0231t) − e^(−0.0462t)) mg/dL above normal (candy bar, t in minutes). Find C(60), to 1 decimal place.',answer:180*(Math.exp(-0.0231*60)-Math.exp(-0.0462*60)),tol:0.2,unit:'mg/dL',hint:'e^(−1.386) and e^(−2.772).',explain:'e^(−1.386) ≈ 0.250 and e^(−2.772) ≈ 0.0626. 180 × 0.1875 ≈ 33.7 mg/dL.'},
  {kind:'num',lvl:'ap',q:'For k₁ = 0.0231 and k₂ = 0.0462 per minute, find the time of the peak, t* = ln(k₂/k₁)/(k₂ − k₁), to the nearest minute.',answer:Math.log(2)/0.0231,tol:0.6,unit:'minutes',hint:'k₂/k₁ = 2.',explain:'ln 2 ÷ 0.0231 ≈ 0.6931 ÷ 0.0231 ≈ 30 minutes.'},
  {lvl:'ap',instant:true,q:'Nicotine clears with a half-life of about 2 hours. Far from the peak, which model fits best?',choices:['C(t) ≈ Ae^(−0.00578t), t in minutes','C(t) ≈ A − 0.05t','C(t) ≈ At²','C(t) is constant'],correct:0,explain:'k = ln 2 ÷ 120 ≈ 0.00578 per minute. After the absorption term dies out, a single exponential decay is left.'}
 ],
 tour:[
  {title:'Two tanks',text:'You eat a candy bar. Your stomach (top) starts full; your blood (bottom) is at its usual level. <b>Each tank drains in proportion to how much it holds</b>: the fuller it is, the thicker its arrow.',pause:true,setup:sim=>{sim.tst=1;sim.peek=true;sim.tv=0;BioLab.setValues(sim,{food:'candy',test:90,all:false});}},
  {title:'The rise',text:'At 10 minutes the stomach arrow is thick and the blood arrow thin. More comes in than goes out, so blood sugar climbs.',pause:true,setup:sim=>{sim.tst=2;sim.tv=10;}},
  {title:'The peak',text:'At <b>30 minutes</b> the two arrows match: in = out. That is the top of the curve, about 135 mg/dL.',pause:true,setup:sim=>{sim.tst=3;sim.tv=30;}},
  {title:'The fall',text:'Now the blood holds more, so it drains faster, while the stomach is nearly empty. By the test at 90 minutes, <b>44% of the spike</b> is left, and it keeps halving about every 30 minutes.',pause:true,setup:sim=>{sim.tst=4;sim.tv=null;}},
  {title:'Candy bar vs. a balanced meal',text:'Fiber, protein and fat slow the stomach. Same rule, slower inflow: the meal (green) peaks <b>lower and later</b> and is still at <b>84% of its top</b> at test time. Steadier fuel.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{food:'meal'});}},
  {title:'A nicotine pouch',text:'Nicotine from a pouch peaks in about 35 minutes, then clears with a half-life of about 2 hours. For someone who uses it regularly, <b>the falling level is when withdrawal can show up</b>: restlessness, irritability, trouble focusing.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{food:'pouch',test:180});}},
  {lvl:'honors',title:'A difference of two exponentials',text:'The blood level is C(t) = A(e^(−k₁t) − e^(−k₂t)). At t = 0 the two cancel; the faster one dies out first, so the slower one (k₁) is left in the tail.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{food:'candy',test:90});}},
  {lvl:'ap',title:'Find the peak',text:'C′(t) = 0 when k₁e^(−k₁t) = k₂e^(−k₂t). Take logs: <b>t* = ln(k₂/k₁) ÷ (k₂ − k₁)</b>. For the candy bar, ln 2 ÷ 0.0231 ≈ 30 minutes.',pause:true,setup:sim=>{sim.tst=8;}},
  {title:'Stop and wonder',text:'No sugar molecule and no nicotine molecule knows the half-life. Each one just has the same small chance of being taken out each minute. Billions of them together trace this smooth curve, the same law radioactive atoms follow. It even fits attention: if every viewer has the same chance of leaving each minute, the most leave in the first minute, when the most are watching. MrBeast’s company guide says exactly that about the first minute of a video.',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{food:'candy',test:90});}}
 ],
 lab:{bio:'<p><b>Question:</b> Which choice leaves the steadiest fuel at test time?</p><ol><li>Press <b>Skip the guess</b>.</li><li>For each of the three choices, set the test to 60, 120 and 180 minutes and record the share of the peak.</li><li>Make a table: choice, time, share of the peak.</li></ol><p>Write two sentences: which choice changes the least between 60 and 180 minutes, and why?</p>',
  honors:'<p><b>Question:</b> Why does the meal’s tail follow the stomach?</p><ol><li>Turn on <b>Show candy and meal together</b>.</li><li>Record both levels every 30 minutes from 30 to 240.</li><li>For each, divide each value after 120 minutes by the one before.</li></ol><p>Explain which half-time the ratios match for each food, and why.</p>',
  ap:'<p><b>Question:</b> When is the peak, and when is the level back to 10% of it?</p><ol><li>Derive t* = ln(k₂/k₁)/(k₂ − k₁) from C′(t) = 0.</li><li>For the pouch, estimate when C(t) = 0.1 C(t*) using C(t) ≈ Ae^(−k₁t), then check it on the graph.</li></ol><p><b>CER:</b> Explain why the one-exponential estimate is good late and poor early.</p>'},
 terms:[
  {t:'Half-life',d:'The time for half of something to be gone. Nicotine in the blood: about 2 hours.'},
  {t:'Rate proportional to amount',d:'The fuller the tank, the faster it drains. This is what makes the curves exponential.'},
  {t:'Peak',d:'The highest level, where what comes in equals what goes out.'},
  {t:'Glycemic response',d:'How much and how fast blood sugar rises after you eat. Fiber, protein and fat slow it.',lvl:'honors'},
  {t:'Difference of exponentials',d:'C(t) = A(e^(−k₁t) − e^(−k₂t)): an inflow decay minus an outflow decay.',lvl:'honors'},
  {t:'First-order kinetics',d:'Clearing a fixed fraction per minute, not a fixed amount. Most drugs at normal doses behave this way.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not medical or nutrition advice.</b> Each tank drains a fixed fraction of what it holds each minute. The half-times are illustrative: candy bar 15 minutes in, 30 out; balanced meal 45 in, 30 out; pouch about 9 minutes in, 120 out. They are chosen so the shapes match published patterns: in people without diabetes, blood sugar usually peaks within about an hour of eating, stays under about 140 mg/dL and returns near its starting level within 2 to 3 hours; a lower-glycemic breakfast gives a lower rise (Cooper and colleagues, British Journal of Nutrition, 2012). Nicotine from pouches peaks in roughly 25 to 65 minutes in published studies, at about 5 to 8 ng/mL, and nicotine’s half-life averages about 2 hours.</p><p><b>What is left out.</b> Real blood sugar is controlled by insulin and the liver, not one simple drain, and people differ a lot. Nicotine’s effects depend on dose and on how often someone uses it. For how nicotine cravings cycle, see HealthLab’s <a href="https://rjedtech.github.io/Raider-HealthLab/#hooked" target="_blank" rel="noopener">Hooked</a>; for caffeine, see <a href="#caffeine">Caffeine at bedtime</a>.</p>'
};
BioLab.register(SIM);
})();
