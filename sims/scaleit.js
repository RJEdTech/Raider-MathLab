(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const fm=v=>{const r=Math.round(v*100)/100;return r.toLocaleString('en-US',{maximumFractionDigits:2});};
const fm3=v=>(Math.round(v*1000)/1000).toLocaleString('en-US',{maximumFractionDigits:3});
const one=(v,u)=>Math.abs(v-1)<1e-9?u.replace(/s$/,''):u;
const usd=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
/* Each case: a known pair (a1 <-> b1) and a new amount a on the top line; the answer is b = b1 * a / a1. */
const SC={
 map:{a1:1.5,b1:4,ua:'in',ub:'mi',ta:'Map distance (in)',tb:'Real distance (mi)',known:'Map scale: 1.5 in = 4 mi',
  A:{min:0.5,max:9,step:0.25,def:5.25,unit:' in on the map',d:2},G:{min:0,max:30,step:0.5,def:8,unit:' mi',d:1},
  q:a=>`The trail measures ${fm(a)} in on the map. How many miles is it?`,
  cost(g,b){const e=Math.abs(g-b),min=Math.round(e/3*60);return `Plan water and daylight for ${fm(g)} mi and you would be <b>${fm(e)} mi off</b>, about <b>${min} minutes</b> of hiking at 3 mph${g<b?' still to go when you expected to be done':' of daylight you planned for and did not need'}.`;}},
 recipe:{a1:6,b1:1.5,ua:'servings',ub:'lb',ta:'Servings',tb:'Pasta (lb)',known:'Recipe: 6 servings use 1.5 lb of pasta',
  A:{min:2,max:80,step:1,def:40,unit:' servings',d:0},G:{min:0,max:25,step:0.25,def:5,unit:' lb',d:2},
  q:a=>`The team dinner needs ${a} servings. How many pounds of pasta?`,
  cost(g,b){const s=Math.round(Math.abs(g-b)*4);return g<b?`Cook ${fm(g)} lb and you come up <b>${s} serving${s===1?'':'s'} short</b>: ${s} teammate${s===1?'':'s'} with no dinner.`:`Cook ${fm(g)} lb and you make <b>${s} extra serving${s===1?'':'s'}</b> of pasta to store or throw out.`;}},
 money:{a1:18.5,b1:1,ua:'pesos',ub:'dollars',ta:'Mexican pesos',tb:'US dollars',known:'Example rate: 18.50 pesos = $1.00',
  A:{min:50,max:3000,step:10,def:740,unit:' pesos',d:0},G:{min:0,max:200,step:1,def:60,unit:' dollars',d:0},
  q:a=>`A jacket in a market costs ${a.toLocaleString('en-US')} pesos. How many dollars is that?`,
  cost(g,b){return `You would think the jacket costs ${usd(g)}, but it costs <b>${usd(b)}</b>, ${usd(Math.abs(g-b))} ${g<b?'more':'less'} than you thought. ${g<b?'Buy on that guess and you overspend your budget.':'Pass on it because of that guess and you miss a good deal.'}`;}},
 dose:{a1:20,b1:5,ua:'kg',ub:'mL',ta:'Body weight (kg)',tb:'Fictorex dose (mL)',known:'Fictorex (made up): 5 mL per 20 kg of body weight',
  A:{min:30,max:110,step:1,def:68,unit:' kg',d:0},G:{min:0,max:30,step:0.5,def:10,unit:' mL',d:1},
  q:a=>`The patient weighs ${a} kg. How many mL of Fictorex?`,
  cost(g,b){const pc=Math.round(Math.abs(g-b)/b*100);return `A dose of ${fm(g)} mL is <b>${fm(Math.abs(g-b))} mL ${g<b?'too little':'too much'}</b>, a ${pc}% ${g<b?'underdose':'overdose'}. That is why nurses and pharmacists calculate weight-based doses instead of estimating them.`;}}
};
const cs=sim=>SC[sim.p.sc]||SC.map;
const ans=sim=>{const c=cs(sim);return c.b1*sim.p.a/c.a1;};
const shown=sim=>!!sim.p.show;
/* Before the gut is locked, hide the scale factor so the picture does not hand over the method. */
const pre=sim=>!shown(sim)&&!(sim.gutS&&sim.gutS.g);
/* Swap the ranges, units and readout units when the case changes. */
function setRanges(sim){const c=cs(sim),D=sim.def.controls;
 [['a',c.A],['g',c.G]].forEach(([id,R])=>{const ctl=D.find(x=>x.id===id);Object.assign(ctl,{min:R.min,max:R.max,step:R.step,unit:R.unit,d:R.d});
  const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW[id];if(w){const i=w.querySelector('input');i.min=R.min;i.max=R.max;i.step=R.step;}
  sim.p[id]=clamp(sim.p[id],R.min,R.max);if(sim.ui&&sim.ui.ctl&&sim.ui.ctl[id])sim.ui.ctl[id].set(sim.p[id]);});
 const T=sim.ui&&sim.ui.tiles;if(T){const u={rate:c.ub+' per '+c.ua.replace(/s$/,''),ans:c.ub,off:c.ub};for(const id in u){const t=T[id];if(t&&t.num&&t.num.parentNode){const s=t.num.parentNode.querySelector('.u');if(s)s.textContent=u[id];}}}}
function useCase(sim,key,a){sim.p.sc=key;const c=SC[key];sim.p.a=a===undefined?c.A.def:a;sim.p.g=c.G.def;sim.p.show=false;setRanges(sim);if(sim.ui&&sim.ui.ctl){['sc','show'].forEach(id=>sim.ui.ctl[id]&&sim.ui.ctl[id].set(sim.p[id]));}}
/* tick step on the top line: a multiple of a1 so at most 8 ticks fit */
function tickMult(a1,amax){for(const m of [1,2,5,10,20,50,100]){if(amax/(a1*m)<=8)return m;}return 200;}

const SIM={
 id:'scaleit',hash:'scaleit',apUnit:1,order:2,tab:'Scale it up',kind:'Simulation',
 card:'Guess a map distance, a recipe, a price in pesos or a dose by feel, then let a proportion get it exactly.',
 title:'Scale it up: proportions',
 lede:{bio:'When two amounts grow together at the same rate, one known pair tells you every other pair. Line the two number lines up and the answer falls out.',
  honors:'A proportion says two ratios are equal: a₁/b₁ = a/x. Cross-multiplying turns it into a one-step equation, a₁·x = b₁·a.',
  ap:'Divide once to get the unit rate, b₁/a₁, then multiply. Writing the units as a fraction (dimensional analysis) makes the wrong setup impossible: the units you do not want cancel out.'},
 scale:'Two number lines that grow together. The blue tick pair is what you know; the red tick is the new amount.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The case',
 controls:[
  {id:'sc',label:'Case',type:'select',def:'map',noGut:true,options:[{v:'map',l:'Map scale: trail length'},{v:'recipe',l:'Recipe: pasta for the team'},{v:'money',l:'Money: pesos to dollars'},{v:'dose',l:'Dose by body weight (made-up medicine)'}],onChange(sim){useCase(sim,sim.p.sc);}},
  {id:'a',label:'The new amount',type:'range',min:0.5,max:9,step:0.25,def:5.25,unit:' in on the map',d:2,noGut:true,onChange(sim){setRanges(sim);}},
  {id:'g',label:'Your guess',type:'range',min:0,max:30,step:0.5,def:8,unit:' mi',d:1,onChange(sim){setRanges(sim);},help:'The orange arrow on the bottom line moves with it.'},
  {id:'show',label:'Show the math',type:'toggle',def:false,help:'Reveals the answer on the number lines and in the readouts.'}
 ],
 init(sim){setRanges(sim);return {};},step(){},
 metrics:[
  {id:'sf',label:'Scale factor (new ÷ known)',unit:'times',d:2,min:0,max:null,get:sim=>pre(sim)?NaN:sim.p.a/cs(sim).a1},
  {id:'rate',label:'Unit rate',unit:'mi per in',d:3,lvl:'honors',min:0,max:null,get:sim=>cs(sim).b1/cs(sim).a1},
  {id:'ans',label:'The math says',unit:'mi',d:2,min:0,max:null,get:sim=>shown(sim)?ans(sim):NaN},
  {id:'off',label:'Your guess is off by',unit:'mi',d:2,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.g-ans(sim)):NaN},
  {id:'pct',label:'Your guess is off by',unit:'%',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.g-ans(sim))/ans(sim)*100:NaN}
 ],
 graphs:[{id:'line',label:'Answer vs. new amount',custom:true}],defaultGraph:'line',
 plot(sim,ctx,box){const c=cs(sim),A=c.A,ymax=c.b1*A.max/c.a1;
  const ax=axes(ctx,box,{xmin:0,xmax:A.max,ymin:0,ymax:Math.max(ymax,c.G.max),xl:c.ta,yl:c.tb});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(A.max),ax.Y(ymax));ctx.stroke();
  const dot=(x,y,col,lab,up)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(x),ax.Y(y),6,0,7);ctx.fill();txt(ctx,lab,ax.X(x)+(up?-10:10),ax.Y(y)+(up?-10:16),{s:12,w:700,c:col,a:up?'right':'left'});};
  dot(c.a1,c.b1,PAL['s2'],'Known',false);
  const G=sim.gutS;if(G&&G.g&&G.g.sc===sim.p.sc)dot(sim.p.a,G.g.v0,PAL['s4'],'Your gut',G.g.v0>ans(sim));
  else dot(sim.p.a,sim.p.g,PAL['s4'],'Your guess',sim.p.g>ans(sim));
  if(shown(sim))dot(sim.p.a,ans(sim),PAL['s3'],'The math',!(sim.p.g>ans(sim)));
  txt(ctx,'Every proportion is a straight line through 0',box.L+10,box.T+14,{s:12,c:PAL['cv-soft']});},
 draw(sim,ctx,vdt,k0){const k=Math.max(k0,1.45),c=cs(sim),a=sim.p.a,b=ans(sim),sh=shown(sim),G=sim.gutS||{};
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  pill(ctx,c.known,400,12+12*k,PAL['s2'],'#fff',13*k);
  const x0=40,x1=760,amax=Math.max(a,c.a1)*1.18,X=v=>x0+(x1-x0)*v/amax,Xb=v=>X(v*c.a1/c.b1);
  const y1=Math.round(64+42*k),y2=Math.round(y1+44+22*k);
  /* line names, placed on the side away from the question marker */
  const nameLeft=X(a)>360;
  txt(ctx,c.ta,nameLeft?x0:x1,y1-14-24*k,{s:12*k,w:700,c:PAL['cv-soft'],a:nameLeft?'left':'right'});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;[y1,y2].forEach(y=>{ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();});
  /* matching ticks: every m*a1 on top is m*b1 below */
  const m=tickMult(c.a1,amax),minGap=46*k;let last=-1e9;
  for(let i=0;i*m*c.a1<=amax+1e-9;i++){const av=i*m*c.a1,x=X(av);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(x,y1-6);ctx.lineTo(x,y1+6);ctx.moveTo(x,y2-6);ctx.lineTo(x,y2+6);ctx.stroke();
   ctx.setLineDash([3,4]);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(x,y1+6);ctx.lineTo(x,y2-6);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
   const nearQ=Math.abs(x-X(a))<70*k;
   if(x-last>=minGap&&!nearQ){txt(ctx,fm(av),x,y1-10,{s:12*k,c:PAL['cv-soft'],a:'center'});txt(ctx,fm(i*m*c.b1),x,y2+8+12*k,{s:12*k,c:PAL['cv-soft'],a:'center'});last=x;}}
  /* known pair */
  const xk=X(c.a1);ctx.strokeStyle=PAL['s2'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xk,y1-9);ctx.lineTo(xk,y2+9);ctx.stroke();
  /* the new amount and its answer */
  const xa=X(a);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xa,y1-10);ctx.lineTo(xa,y1+10);ctx.stroke();
  ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xa,y1+10);ctx.lineTo(xa,y2);ctx.stroke();ctx.setLineDash([]);
  const qx=clamp(xa,90*k,800-90*k);
  pill(ctx,fm(a)+' '+c.ua,qx,y1-14-12*k,PAL['rj'],'#fff',13*k);
  {ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(c.tb).width,lx=nameLeft?x0:x1-w;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.9;ctx.fillRect(lx-4,y2-12-13*k,w+8,15*k+4);ctx.globalAlpha=1;
   txt(ctx,c.tb,nameLeft?x0:x1,y2-10,{s:12*k,w:700,c:PAL['cv-soft'],a:nameLeft?'left':'right'});}
  /* gut and math on the bottom line */
  const gv=G.g&&G.g.sc===sim.p.sc&&Math.abs(G.g.a-a)<1e-9?G.g.v0:sim.p.g,gx=clamp(Xb(gv),x0,x1),py=y2+24+20*k;
  ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(gx,y2-3);ctx.lineTo(gx-8,y2-15);ctx.lineTo(gx+8,y2-15);ctx.closePath();ctx.fill();
  const gl=(G.g?'Your gut: ':'Your guess: ')+fm(gv)+' '+c.ub+(Xb(gv)>x1?' →':'');
  const mx=Xb(b),ml='The math: '+fm(b)+' '+c.ub;ctx.font='700 '+(12*k)+'px '+FONT;
  const wg=ctx.measureText(gl).width+14*k,wm=ctx.measureText(ml).width+14*k;
  let pg=gx,pm=mx;
  if(sh){const mid=(gx+mx)/2;if(Math.abs(gx-mx)<(wg+wm)/2+8){if(gv>b){pm=mid-wm/2-4;pg=mid+wg/2+4;}else{pg=mid-wg/2-4;pm=mid+wm/2+4;}}
   const lo=Math.min(pg-wg/2,pm-wm/2),hi=Math.max(pg+wg/2,pm+wm/2),sh1=lo<6?6-lo:hi>794?794-hi:0;pg+=sh1;pm+=sh1;}
  else pg=clamp(pg,wg/2+6,794-wg/2);
  pill(ctx,gl,pg,py,PAL['s4'],'#111',12*k);
  if(sh){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(mx,y2,7,0,7);ctx.fill();pill(ctx,ml,pm,py,PAL['s3'],'#fff',12*k);}
  else txt(ctx,'?',xa+10,y2-10,{s:16*k,w:700,c:PAL['rj']});
  /* the level's method */
  const top=py+Math.round(18+10*k),lh=Math.round(6+14*k),X0=40,big=k>=1.5,L=i=>top+lh*(i+0.8)-(big?lh:0);
  const sf=a/c.a1,A1=fm(c.a1),B1=fm(c.b1),AA=fm(a),BB=sh?fm(b)+' '+c.ub:'?';
  sim.vis.panel=[20,top-6,760,450-top];
  if(atLeast('ap')){if(!big)txt(ctx,'Unit rate, then units cancel',X0,L(0),{s:12*k,w:700,c:PAL['cv-soft']});
   txt(ctx,`Unit rate: ${B1} ${one(c.b1,c.ub)} ÷ ${A1} ${c.ua} = ${fm3(c.b1/c.a1)} ${c.ub} per ${c.ua.replace(/s$/,'')}`,X0,L(1),{s:13*k});
   txt(ctx,`${AA} ${c.ua} × (${B1} ${one(c.b1,c.ub)} / ${A1} ${c.ua}) = ${BB}`,X0,L(2),{s:13*k,w:700});
   if(!big)txt(ctx,`The ${c.ua} on top and bottom cancel, so the answer comes out in ${c.ub}.`,X0,L(3),{s:12*k,c:PAL['cv-soft']});}
  else if(atLeast('honors')){if(!big)txt(ctx,'Cross-multiply',X0,L(0),{s:12*k,w:700,c:PAL['cv-soft']});
   txt(ctx,`${A1} / ${B1} = ${AA} / x`,X0,L(1),{s:14*k,w:700});
   txt(ctx,`${A1} · x = ${B1} · ${AA} = ${fm(c.b1*a)}`,X0,L(2),{s:13*k});
   txt(ctx,sh?`x = ${fm(c.b1*a)} ÷ ${A1} = ${BB}`:'x = ?',X0,L(3),{s:13*k,w:700,c:sh?PAL['s3']:PAL['cv-ink']});}
  else{/* ratio table */const cw=[X0,X0+230*Math.min(k,1.3),X0+330*Math.min(k,1.3),X0+480*Math.min(k,1.3)];
   if(!big)txt(ctx,'Ratio table',X0,L(0),{s:12*k,w:700,c:PAL['cv-soft']});
   [[c.ta,A1,AA],[c.tb,B1,BB]].forEach((r,i)=>{const y=L(1+i);txt(ctx,r[0],cw[0],y,{s:13*k});txt(ctx,r[1],cw[1],y,{s:14*k,w:700,c:PAL['s2']});
    txt(ctx,'× '+(pre(sim)?'?':fm(sf))+' →',cw[2],y,{s:13*k,c:PAL['cv-soft']});txt(ctx,r[2],cw[3],y,{s:14*k,w:700,c:i&&sh?PAL['s3']:PAL['rj']});});}
 },
 narrate(sim){const c=cs(sim),a=sim.p.a,b=ans(sim),sf=a/c.a1;
  const q=c.q(a);
  if(!shown(sim))return `${q} <b>Every ${fm(c.a1)} ${c.ua} is another ${fm(c.b1)} ${c.ub}</b>, so the ticks on both lines march together.${pre(sim)?'':` ${fm(a)} is ${fm(sf)} times ${fm(c.a1)}.`}`;
  return `${q} ${fm(a)} ÷ ${fm(c.a1)} = ${fm(sf)}, and ${fm(c.b1)} × ${fm(sf)} = <b>${fm(b)} ${c.ub}</b>. Multiply both sides of the known pair by the same scale factor.`;},
 gut:{better:'lower',controls:['g'],
  ask:{bio:'Drag the <b>Your guess</b> slider here to the answer you think is right. Go by the known pair at the top only, then lock it in.',honors:'Before you set up the proportion, drag the <b>Your guess</b> slider here to the answer you expect, then lock it in.'},
  lock(sim){const c=cs(sim),b=ans(sim);return {v:Math.abs(sim.p.g-b),v0:sim.p.g,a:sim.p.a,sc:sim.p.sc,label:`${fm(sim.p.g)} ${c.ub}`};},
  solve(sim){const c=cs(sim),b=ans(sim);sim.p.show=true;return {v:Math.abs(b-b),label:`${fm(b)} ${c.ub}`};},
  how:{bio:'Find the scale factor: how many times bigger the new amount is than the known one. Then multiply the other amount by that same factor.',
   honors:'Set up a proportion with matching units in the same place: known top / known bottom = new top / x. Cross-multiply and divide.',
   ap:'Multiply the new amount by the rate written as a fraction, with the unit you want on top. The unit you started with cancels.'},
  compare(sim,g,m){const c=SC[g.sc],b=c.b1*g.a/c.a1,e=Math.abs(g.v0-b);
   if(e<=Math.max(0.02*b,c.G.step/2+1e-9))return `Your gut was right on: ${fm(g.v0)} ${c.ub} against an exact ${fm(b)} ${c.ub}. Your sense of the scale factor is good. The proportion is how you check it when the numbers get awkward or the stakes are high.`;
   return `The math says <b>${fm(b)} ${c.ub}</b>; your gut said ${fm(g.v0)}, off by ${Math.round(e/b*100)}%. `+c.cost(g.v0,b);},
  again(sim){const keys=Object.keys(SC),key=keys[Math.floor(Math.random()*keys.length)],A=SC[key].A;
   const steps=Math.round((A.max-A.min)/A.step),a=+(A.min+A.step*Math.round(steps*(0.15+0.7*Math.random()))).toFixed(2);useCase(sim,key,a);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'On a map, 1.5 in stands for 4 mi. A trail is 3 in on the map. How long is it?',choices:['5.5 mi','6 mi','8 mi'],correct:2,explain:'3 in is 2 times 1.5 in, so the trail is 2 times 4 mi = 8 mi. The answer 5.5 mi comes from adding the 1.5 extra inches to the miles. Proportions multiply; they do not add.'},
  {lvl:'bio',instant:true,q:'A recipe for 6 servings uses 1.5 lb of pasta. How much pasta for 40 servings?',choices:['6.7 lb','10 lb','60 lb'],correct:1,explain:'The scale factor is 40 ÷ 6 ≈ 6.67. Multiply the pasta by it: 1.5 × 6.67 = 10 lb. The answer 6.7 lb is the scale factor itself, and 60 lb treats 1.5 lb as the amount for one serving.'},
  {lvl:'honors',instant:true,q:'Fictorex (a made-up medicine) is 5 mL per 20 kg of body weight. Which setup is right for a 68 kg patient?',choices:['20 / 5 = 68 / x, so x = 17 mL','5 / 20 = 68 / x, so x = 272 mL','20 / 5 = x / 68, so x = 272 mL'],correct:0,explain:'Keep the same units in the same place: kg over mL on both sides. 20x = 5 × 68 = 340, so x = 17 mL. Flipping one ratio gives 272 mL, sixteen times the right dose.'},
  {lvl:'honors',instant:true,q:'At an example rate of 18.50 pesos = $1, which proportion finds the dollar price of 740 pesos?',choices:['18.50 / 1 = 740 / x','18.50 / 1 = x / 740','1 / 18.50 = 740 / x'],correct:0,explain:'Pesos over dollars on both sides: 18.50x = 740, so x = $40. The other two mix up which unit goes on top, and both give x = 13,690: thousands of dollars for something that costs 740 pesos.'},
  {lvl:'ap',instant:true,q:'The map says 1.5 in = 4 mi. What is the unit rate, and how long is a 5.25 in trail?',choices:['2.67 mi per in, so 14 mi','0.375 mi per in, so about 2 mi','5.5 mi per in, so about 29 mi'],correct:0,explain:'4 mi ÷ 1.5 in ≈ 2.67 mi per in. Then 5.25 in × (4 mi / 1.5 in) = 14 mi. 0.375 is in per mi, the rate upside down, and 5.5 comes from adding 4 + 1.5.'},
  {lvl:'ap',instant:true,q:'A patient weighs 150 lb (1 kg ≈ 2.205 lb). Someone plugs 150 straight into Fictorex’s 5 mL per 20 kg rate. What happens?',choices:['They get 37.5 mL, about 2.2 times the right dose','They get the right dose, 17 mL','They get 7.7 mL, about half the right dose'],correct:0,explain:'150 × 5 / 20 = 37.5 mL. The right chain is 150 lb × (1 kg / 2.205 lb) × (5 mL / 20 kg) ≈ 17.0 mL. Writing the units shows the mistake: lb never cancels unless you convert it.'}
 ],
 tour:[
  {title:'Two number lines',text:'The top line is distance on the map. The bottom line is real distance. The blue tick pairs what you know: 1.5 in on the map is 4 mi on the ground.',pause:true,setup:sim=>{useCase(sim,'map',5.25);}},
  {title:'They grow together',text:'Every 1.5 in on the map is another 4 mi. So 3 in pairs with 8 mi, 4.5 in with 12 mi and 6 in with 16 mi. The tick marks march together on both lines.',pause:true},
  {title:'Where the trail lands',text:'The trail is 5.25 in on the map. That red tick sits between 4.5 in and 6 in, so the trail is between 12 and 16 mi. That is already a good estimate.',pause:true},
  {title:'The scale factor',text:'5.25 ÷ 1.5 = 3.5, so the trail is 3.5 times the known distance. Multiply the miles by the same factor: 4 × 3.5 = 14 mi.',pause:true,setup:sim=>{BioLab.setValues(sim,{show:true});},focus:sim=>sim.vis.panel},
  {title:'Same method, any case',text:'Fictorex is a made-up medicine dosed at 5 mL for every 20 kg of body weight. A 68 kg patient is 68 ÷ 20 = 3.4 times the known weight, so the dose is 3.4 × 5 = 17 mL.',pause:true,setup:sim=>{useCase(sim,'dose',68);BioLab.setValues(sim,{show:true});}},
  {lvl:'honors',title:'Cross-multiplying',text:'Write kg over mL on both sides: 20 / 5 = 68 / x. Cross-multiply: 20x = 5 × 68 = 340. Divide: x = 17 mL.',pause:true,focus:sim=>sim.vis.panel},
  {lvl:'ap',title:'Unit rate and units',text:'5 mL ÷ 20 kg = 0.25 mL per kg. Then 68 kg × (5 mL / 20 kg) = 17 mL. The kg on top and bottom cancel, so the answer can only come out in mL.',pause:true,focus:sim=>sim.vis.panel}
 ],
 onTourExit(sim){},
 lab:{bio:'<p><b>Question:</b> How far off is a gut estimate, and does it get worse as the numbers get bigger?</p><ol><li>Pick a case. Set a new amount, make a guess, then turn on <b>Show the math</b>. Record a trial.</li><li>Repeat with a small, a medium and a large new amount.</li></ol><p>Write one sentence: when was your gut closest?</p>',
  honors:'<p><b>Question:</b> Is the answer always proportional to the new amount?</p><ol><li>For one case, record the answer for five new amounts.</li><li>Graph Trials with the new amount on x and <b>The math says</b> on y.</li></ol><p>Explain why the points make a straight line through 0, and what its slope means.</p>',
  ap:'<p><b>Question:</b> Which setups always work?</p><ol><li>For two cases, write the unit rate both ways (for example mi per in and in per mi).</li><li>Show which one you multiply by, using the units to decide.</li></ol><p><b>CER:</b> Claim, evidence from your trials, and reasoning from dimensional analysis.</p>'},
 terms:[
  {t:'Ratio',d:'A comparison of two amounts, like 1.5 in to 4 mi.'},
  {t:'Proportion',d:'An equation that says two ratios are equal: 1.5 / 4 = 5.25 / x.'},
  {t:'Scale factor',d:'How many times bigger (or smaller) the new amount is than the known one. Multiply both amounts by it.'},
  {t:'Double number line',d:'Two number lines lined up so each tick on top pairs with the matching amount below.'},
  {t:'Cross-multiplying',d:'If a/b = c/d, then a·d = b·c. It turns a proportion into a one-step equation.',lvl:'honors'},
  {t:'Unit rate',d:'A rate for one unit, like 2.67 mi per in or 0.25 mL per kg.',lvl:'ap'},
  {t:'Dimensional analysis',d:'Multiplying by rates written as fractions so the units you do not want cancel out.',lvl:'ap'}
 ],
 about:'<p>Every case is a proportion: answer = b₁ × (new amount) ÷ a₁, for a known pair a₁ ↔ b₁.</p><ul><li><b>Map:</b> a scale of 1.5 in = 4 mi, made up for illustration. Hiking time uses an assumed pace of 3 mph on flat ground.</li><li><b>Recipe:</b> 6 servings per 1.5 lb of pasta, made up for illustration.</li><li><b>Money:</b> 18.50 pesos = $1 is an example rate. Real exchange rates change every day, and banks and card companies may add fees.</li><li><b>Dose:</b> Fictorex is a made-up medicine with a made-up rate of 5 mL per 20 kg. <b>This is not medical advice.</b> Real doses come from the label, a pharmacist or a doctor, and many real medicines have maximum doses and other rules that a simple proportion does not capture.</li></ul>'
};
BioLab.register(SIM);
})();
