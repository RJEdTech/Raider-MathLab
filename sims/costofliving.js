(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* ---------- the data (monthly, one adult) ----------
   Dallas County, TX and Arapahoe County, CO (Aurora): MIT Living Wage Calculator, 1 adult, 0 children,
   annual typical expenses divided by 12 (data updated Feb 15, 2026). Housing there is rent plus utilities.
   Quito: transport uses the official $0.35 bus fare; every other Quito price is a labeled assumption (see about). */
const HRS=40*52/12;                                  /* full-time month: 40 h a week x 52 weeks / 12 = 173.33 h */
const CITY=['quito','dallas','aurora'];
const NAME={quito:'Quito',dallas:'Dallas',aurora:'Aurora'};
const LONG={quito:'Quito, Ecuador',dallas:'Dallas, Texas',aurora:'Aurora, Colorado'};
const US={dallas:{housing:17805/12,food:4019/12,trans:8440/12,phone:1454/12,health:3032/12,bus:126},
 aurora:{housing:19748/12,food:4557/12,trans:8038/12,phone:1851/12,health:3199/12,bus:88}};
const Q={util:35,trans:50*0.35,phone:30,health:30};  /* Quito: utilities, 50 bus rides at $0.35, phone and internet, health (assumptions except the fare) */
const ITEMS=[['housing','Housing'],['food','Food'],['trans','Transport'],['phone','Phone/net'],['health','Health']];
const ICOL=['s2','s3','s4','s5','s6'];
const SBU=482,TX=7.25,CO=15.16;
const HH={one:{s:1,l:'1 adult'},two:{s:1.5,l:'2 adults'},fam:{s:2.1,l:'2 adults, 2 children'}};

/* Controls hidden at the current level fall back to the sourced defaults. */
const ap=()=>atLeast('ap'),hon=()=>atLeast('honors');
const P=(sim,id,d)=>ap()?sim.p[id]:d;
function hh(sim){return hon()?(HH[sim.p.hh]||HH.one):HH.one;}
function earners(sim){return hon()&&sim.p.hh!=='one'?(+sim.p.earn||1):1;}
function prices(sim){const bus=P(sim,'commute','car')==='bus';const c={quito:{housing:P(sim,'qrent',300)+Q.util,food:P(sim,'qfood',150),trans:Q.trans,phone:Q.phone,health:Q.health}};
 ['dallas','aurora'].forEach(k=>{const u=US[k];c[k]={housing:u.housing,food:u.food,trans:bus?u.bus:u.trans,phone:u.phone,health:u.health};});return c;}
function wages(sim){const m=P(sim,'wq',SBU)*(P(sim,'bonus','with')==='with'?14/12:1);return {quito:m/HRS,dallas:P(sim,'wd',TX),aurora:P(sim,'wa',CO)};}
function model(sim){const c=prices(sim),w=wages(sim),s=hh(sim).s,e=earners(sim),base=P(sim,'base','aurora');const r={};
 CITY.forEach(k=>{const items={};let tot=0;ITEMS.forEach(([id])=>{items[id]=c[k][id]*s;tot+=items[id];});
  const pay=w[k]*HRS,hrs=tot/w[k];r[k]={items,tot,wage:w[k],pay,hrs,jobs:hrs/HRS,share:tot/(e*pay)*100,food:items.food/(e*pay)*100};});
 const b=r[base].tot;CITY.forEach(k=>{r[k].idx=r[k].tot/b*100;r[k].ppp=r[k].tot/b;r[k].real=r[k].pay/r[k].ppp;});
 r.base=base;r.e=e;r.s=s;return r;}
const hardest=R=>CITY.reduce((a,k)=>R[k].hrs>R[a].hrs?k:a,'quito');
const easiest=R=>CITY.reduce((a,k)=>R[k].hrs<R[a].hrs?k:a,'quito');
const cheapest=R=>CITY.reduce((a,k)=>R[k].tot<R[a].tot?k:a,'quito');
const usd=v=>'$'+Math.round(v).toLocaleString('en-US');
const usd2=v=>'$'+(Math.round(v*100)/100).toFixed(2);
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(Math.round(v*10)/10).toFixed(1);
const shown=sim=>!!sim.p.hours||!!(sim.gutS&&sim.gutS.m);
const own=sim=>ap()&&(sim.p.qrent!==300||sim.p.qfood!==150||sim.p.wq!==SBU||sim.p.wd!==TX||sim.p.wa!==CO);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* Fit a label into a width by shrinking the font, never below 12 px. */
function fit(ctx,s,max,size,w){ctx.font=(w||700)+' '+size+'px '+FONT;const m=ctx.measureText(s).width;return m>max?Math.max(12,size*max/m):size;}

const SIM={
 id:'costofliving',hash:'costofliving',apUnit:20,order:4,tab:'Cost of living',kind:'Simulation',
 card:'Guess where a month of basics is hardest to afford on minimum wage, then turn dollars into hours of work in Quito, Dallas and Aurora.',
 title:'Cheaper in dollars, harder in hours',
 lede:{bio:'A price only means something next to what people earn. Here the same month of basics, in three cities, turns into hours of minimum-wage work. Ecuador uses the U.S. dollar, so there is no exchange rate to get in the way.',
  honors:'Affordability is a ratio: basket cost ÷ pay. It changes with who is in the household and how many people earn, and averages can hide the workers it matters most to. Poorer households spend a bigger share on food (Engel’s law).',
  ap:'A Laspeyres price index prices one fixed basket at local prices: a weighted average of price relatives. Divide two cities’ basket costs and you have a purchasing power parity (PPP) factor for this basket. Then test which assumption flips the ranking.'},
 scale:'One month of basics for one adult who rents alone. Dollars are U.S. dollars in all three cities. A full-time month is 40 hours a week, about 173 hours.',
 aspect:16/9,timeless:true,trials:false,graph:true,
 controlsTitle:'The comparison',
 controls:[
  {id:'pick',label:'Your gut: where does a month of basics take the most hours of minimum-wage work?',type:'seg',def:'quito',options:[{v:'quito',l:'Quito'},{v:'dallas',l:'Dallas'},{v:'aurora',l:'Aurora'}]},
  {id:'hours',label:'Show hours of work',type:'toggle',def:false,noGut:true,help:'Lock in your gut first. Hours = basket cost ÷ hourly pay.'},
  {id:'hh',label:'Household',type:'seg',def:'one',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'one',l:'1 adult'},{v:'two',l:'2 adults'},{v:'fam',l:'2 adults + 2 kids'}],help:'Bigger households cost more, but not twice as much: they share rent and utilities. Scaled with the OECD-modified equivalence scale.'},
  {id:'earn',label:'Earners (full-time, minimum wage)',type:'seg',def:'1',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'1',l:'1 earner'},{v:'2',l:'2 earners'}],help:'Only counts when the household has 2 adults.'},
  {id:'base',label:'Base city for the price index (= 100)',type:'seg',def:'aurora',lvl:'ap',noGut:true,options:[{v:'quito',l:'Quito'},{v:'dallas',l:'Dallas'},{v:'aurora',l:'Aurora'}]},
  {id:'bonus',label:'Ecuador pay counted',type:'seg',def:'with',lvl:'ap',noGut:true,onChange:clearGut,options:[{v:'with',l:'With 13th and 14th pay'},{v:'without',l:'Monthly salary only'}],help:'Ecuador’s minimum-wage workers also get a 13th and a 14th payment each year. INEC counts each as 1/12 of a month’s pay per month.'},
  {id:'commute',label:'Getting to work in Dallas and Aurora',type:'seg',def:'car',lvl:'ap',noGut:true,onChange:clearGut,options:[{v:'car',l:'Car (MIT budget)'},{v:'bus',l:'Bus or train pass'}],help:'Bus pass: DART local monthly pass $126; RTD monthly pass $88. Quito always uses the bus.'},
  {id:'qrent',label:'Quito rent for a modest one-bedroom ($ a month)',type:'range',min:150,max:700,step:5,def:300,unit:'',d:0,lvl:'ap',noGut:true,onChange:clearGut,help:'An assumption. Your numbers stay in this tab’s memory only.'},
  {id:'qfood',label:'Quito food for one adult ($ a month)',type:'range',min:80,max:300,step:5,def:150,unit:'',d:0,lvl:'ap',noGut:true,onChange:clearGut,help:'An assumption. Your numbers stay in this tab’s memory only.'},
  {id:'wq',label:'Quito monthly salary ($)',type:'range',min:300,max:1500,step:1,def:482,unit:'',d:0,lvl:'ap',noGut:true,onChange:clearGut,help:'Ecuador’s 2026 minimum is $482. Try your own numbers: they stay in this tab’s memory only.'},
  {id:'wd',label:'Dallas pay ($ an hour)',type:'range',min:5,max:30,step:0.05,def:7.25,unit:'',d:2,lvl:'ap',noGut:true,onChange:clearGut,help:'Texas uses the federal minimum, $7.25.'},
  {id:'wa',label:'Aurora pay ($ an hour)',type:'range',min:5,max:40,step:0.01,def:15.16,unit:'',d:2,lvl:'ap',noGut:true,onChange:clearGut,help:'Colorado’s 2026 minimum is $15.16. Aurora has no separate local minimum.'}
 ],
 actions:[{id:'sourced',label:'Go back to the sourced numbers',lvl:'ap',run(sim){BioLab.setValues(sim,{qrent:300,qfood:150,wq:SBU,wd:TX,wa:CO,bonus:'with',commute:'car'});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'cost_q',label:'Quito basket',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim).quito.tot},
  {id:'cost_d',label:'Dallas basket',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim).dallas.tot},
  {id:'cost_a',label:'Aurora basket',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim).aurora.tot},
  {id:'hrs_q',label:'Quito: hours of work',unit:'hours',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim).quito.hrs:null},
  {id:'hrs_d',label:'Dallas: hours of work',unit:'hours',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim).dallas.hrs:null},
  {id:'hrs_a',label:'Aurora: hours of work',unit:'hours',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim).aurora.hrs:null},
  {id:'share_q',label:'Quito: share of pay',unit:'%',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?model(sim).quito.share:null},
  {id:'share_d',label:'Dallas: share of pay',unit:'%',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?model(sim).dallas.share:null},
  {id:'share_a',label:'Aurora: share of pay',unit:'%',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?model(sim).aurora.share:null},
  {id:'food',label:'Food as a share of pay (Engel’s law)',lvl:'honors',text:true,get:sim=>{const R=model(sim);return CITY.map(k=>`${NAME[k]} ${Math.round(R[k].food)}%`).join(' · ');}},
  {id:'idx_q',label:'Price index: Quito',unit:'',d:1,lvl:'ap',min:0,max:null,get:sim=>model(sim).quito.idx},
  {id:'idx_d',label:'Price index: Dallas',unit:'',d:1,lvl:'ap',min:0,max:null,get:sim=>model(sim).dallas.idx},
  {id:'idx_a',label:'Price index: Aurora',unit:'',d:1,lvl:'ap',min:0,max:null,get:sim=>model(sim).aurora.idx},
  {id:'real',label:'A full-time month of pay, in base-city dollars (PPP)',lvl:'ap',text:true,get:sim=>{const R=model(sim);return CITY.map(k=>`${NAME[k]} ${usd(R[k].real)}`).join(' · ');}}
 ],
 graphs:[{id:'rent',label:'Hours of work if Quito rent were different',custom:true}],defaultGraph:'rent',
 plot(sim,ctx,box){const pts={quito:[],dallas:[],aurora:[]};
  for(let r=150;r<=700;r+=10){const M=modelRent(sim,r);CITY.forEach(k=>pts[k].push([r,M[k].hrs]));}
  const top=Math.max(...CITY.map(k=>Math.max(...pts[k].map(p=>p[1])))),ymax=Math.ceil(top*1.1/50)*50;
  const ax=axes(ctx,box,{xmin:150,xmax:700,ymin:0,ymax,xl:'Quito rent ($ a month)',yl:'Hours of work a month'});
  if(!shown(sim)){txt(ctx,'Show hours of work to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:13,c:PAL['muted'],a:'center'});return;}
  const col={quito:PAL['g-line'],dallas:PAL['s2'],aurora:PAL['s3']};
  CITY.forEach(k=>{ctx.strokeStyle=col[k];ctx.lineWidth=2.5;ctx.beginPath();pts[k].forEach((p,i)=>i?ctx.lineTo(ax.X(p[0]),ax.Y(p[1])):ctx.moveTo(ax.X(p[0]),ax.Y(p[1])));ctx.stroke();});
  const cur=ap()?sim.p.qrent:300,R=model(sim);ctx.fillStyle=PAL['g-line'];ctx.beginPath();ctx.arc(ax.X(cur),ax.Y(R.quito.hrs),5,0,7);ctx.fill();
  txt(ctx,'Quito now',ax.X(cur)+8,ax.Y(R.quito.hrs)+16,{s:12,w:700,c:PAL['g-line'],a:cur>560?'right':'left'});
  legend(ctx,box.L+10,box.T+12,CITY.map(k=>({label:NAME[k],color:col[k]})));},
 draw(sim,ctx,vdt,k){const R=model(sim),G=sim.gutS||{},sh=shown(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(400,12);ctx.lineTo(400,438);ctx.stroke();
  const legY=450-8-7*k,subY=legY-12-12*k,nameY=subY-17*k,baseY=nameY-12*k-6;
  const titY=8+13*k,keyY=titY+8+12*k,topY=keyY+10+16*k;
  const panels=[[20,385],[415,780]];
  /* titles */
  const t1='A month of basics, in dollars',t2=sh?(R.e>1?'Hours of minimum-wage work (both earners)':'Hours of minimum-wage work'):'Hours of work: lock in your gut first';
  [[t1,panels[0]],[t2,panels[1]]].forEach(([s,p])=>{const z=fit(ctx,s,p[1]-p[0],13*k);txt(ctx,s,p[0],titY,{s:z,w:700});});
  const colX=(p,i)=>p[0]+(i+0.5)*(p[1]-p[0])/3,bw=Math.min(66,(365/3)-36);
  /* left: stacked dollar bars */
  const dmax=Math.max(...CITY.map(c=>R[c].tot))*1.04,DY=v=>baseY-(baseY-topY)*v/dmax;
  const lkey=ap()?`Index: ${NAME[R.base]} = 100`:'Each color is one need';txt(ctx,lkey,panels[0][0],keyY,{s:fit(ctx,lkey,365,12*k,400),c:PAL['cv-soft']});
  CITY.forEach((c,i)=>{const x=colX(panels[0],i);let y=baseY;
   ITEMS.forEach(([id],j)=>{const h=(baseY-topY)*R[c].items[id]/dmax;ctx.fillStyle=PAL[ICOL[j]];ctx.fillRect(x-bw/2,y-h,bw,h);y-=h;});
   ctx.strokeStyle=PAL['card'];ctx.lineWidth=1;ctx.strokeRect(x-bw/2,DY(R[c].tot),bw,baseY-DY(R[c].tot));
   txt(ctx,usd(R[c].tot),x,DY(R[c].tot)-6,{s:fit(ctx,usd(R[c].tot),115,12*k),w:700,a:'center'});
   txt(ctx,NAME[c],x,nameY,{s:13*k,w:700,a:'center'});
   const sub=ap()?`Index ${f0(R[c].idx)}`:`${usd2(R[c].wage)}/h`;txt(ctx,sub,x,subY,{s:fit(ctx,sub,115,12*k,400),c:PAL['cv-soft'],a:'center'});});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(panels[0][0],baseY);ctx.lineTo(panels[0][1],baseY);ctx.stroke();
  /* right: hours bars */
  const lines=R.e,full=HRS*lines,hmax=Math.max(full,...CITY.map(c=>R[c].hrs))*1.06,HY=v=>baseY-(baseY-topY)*v/hmax;
  const hc=hardest(R);
  if(sh){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([7,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(panels[1][0],HY(full));ctx.lineTo(panels[1][1],HY(full));ctx.stroke();ctx.setLineDash([]);
   const kx=panels[1][0];ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(kx,keyY-4*k);ctx.lineTo(kx+26,keyY-4*k);ctx.stroke();ctx.setLineDash([]);
   const ks=lines>1?`= 2 full-time jobs (${f0(full)} h)`:`= 1 full-time job (${f0(full)} h)`;txt(ctx,ks,kx+32,keyY,{s:fit(ctx,ks,330,12*k,400),c:PAL['cv-soft']});}
  else{const ks='Hours = dollars ÷ pay per hour';txt(ctx,ks,panels[1][0],keyY,{s:fit(ctx,ks,365,12*k,400),c:PAL['cv-soft']});}
  CITY.forEach((c,i)=>{const x=colX(panels[1],i);
   if(sh){const y=HY(R[c].hrs);ctx.fillStyle=c===hc?PAL['g-line']:PAL['cv-soft'];ctx.globalAlpha=c===hc?1:.7;ctx.fillRect(x-bw/2,y,bw,baseY-y);ctx.globalAlpha=1;
    const s=f0(R[c].hrs)+' h',z=fit(ctx,s,115,12*k),tw=ctx.measureText(s).width;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x-tw/2-4,y-6-z,tw+8,z+4);txt(ctx,s,x,y-6,{s:z,w:700,a:'center',c:c===hc?PAL['g-line']:PAL['cv-ink']});
    const sub=`${f0(R[c].share)}% of pay`;txt(ctx,sub,x,subY,{s:fit(ctx,sub,115,12*k,400),c:PAL['cv-soft'],a:'center'});}
   else{ctx.strokeStyle=PAL['line'];ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.strokeRect(x-bw/2,topY+(baseY-topY)*0.35,bw,(baseY-topY)*0.65);ctx.setLineDash([]);txt(ctx,'?',x,topY+(baseY-topY)*0.7,{s:24*k,w:700,c:PAL['cv-soft'],a:'center',b:'middle'});}
   const g=G.g&&G.g.city===c,m=G.m&&G.m.city===c;
   if(g||m){ctx.font='700 '+(13*k)+'px '+FONT;const w=ctx.measureText(NAME[c]).width+14*k,h=20*k;rr(ctx,x-w/2,nameY-h*0.72,w,h,h/2);ctx.fillStyle=m?PAL['g-line']:PAL['cv-ink'];ctx.fill();if(g&&m){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.stroke();}
    txt(ctx,NAME[c],x,nameY,{s:13*k,w:700,a:'center',c:m?'#fff':PAL['cv-bg']});}
   else txt(ctx,NAME[c],x,nameY,{s:13*k,w:700,a:'center'});});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(panels[1][0],baseY);ctx.lineTo(panels[1][1],baseY);ctx.stroke();
  /* legend row across the bottom: items, then gut and math tags when they exist */
  const tags=[];ITEMS.forEach(([id,l],j)=>tags.push([l,PAL[ICOL[j]]]));
  if(G.g)tags.push(['Your gut',PAL['cv-ink']]);if(G.m)tags.push(['Math: most hours',PAL['g-line']]);
  let z=12*k;ctx.font='400 '+z+'px '+FONT;let tw=tags.reduce((a,[l])=>a+ctx.measureText(l).width+z+18,0);if(tw>770){z=Math.max(12,z*770/tw);ctx.font='400 '+z+'px '+FONT;tw=tags.reduce((a,[l])=>a+ctx.measureText(l).width+z+18,0);}
  let x=Math.max(10,400-tw/2);tags.forEach(([l,c])=>{ctx.fillStyle=c;rr(ctx,x,legY-z*0.45,z*0.9,z*0.9,2);ctx.fill();txt(ctx,l,x+z+4,legY,{s:z,c:PAL['cv-ink'],b:'middle'});x+=ctx.measureText(l).width+z+18;});},
 onClick(sim,x){if(x>400&&!(sim.gutS&&sim.gutS.g)){const i=clamp(Math.floor((x-415)/(365/3)),0,2);BioLab.setValues(sim,{pick:CITY[i]});}},
 narrate(sim){const R=model(sim),hc=hardest(R),cc=cheapest(R),sh=shown(sim);let s;
  if(!sh)s=`In dollars, <b>${NAME[cc]}</b> is cheapest: ${usd(R[cc].tot)} a month, against ${usd(R.dallas.tot)} in Dallas and ${usd(R.aurora.tot)} in Aurora. <b>But dollars are only half the ratio.</b> Pay is ${usd2(R.quito.wage)} an hour in Quito, ${usd2(R.dallas.wage)} in Dallas and ${usd2(R.aurora.wage)} in Aurora.`;
  else{s=`<b>${NAME[hc]} is hardest:</b> ${f0(R[hc].hrs)} hours of work a month, ${f1(R[hc].jobs)} full-time jobs. `;
   if(hc!==cc&&R[hc].tot<Math.max(...CITY.map(c=>R[c].tot)))s+=`Its basket is not the most expensive in dollars, but its pay is low next to its prices.`;
   else if(hc===cc)s+=`Its basket is the cheapest in dollars, but pay there is lower still.`;
   else s+=`Its basket is also the most expensive in dollars.`;
   if(hon()&&R.e>1)s+=` With two earners, the household has ${f0(2*HRS)} hours of full-time work a month to give.`;}
  if(own(sim))s+=' <i>You are using your own numbers. They stay in this tab’s memory only.</i>';
  return s;},
 gut:{better:'higher',controls:['pick'],
  ask:{bio:'Three friends each take a full-time minimum-wage job and rent alone: one in Quito, one in Dallas, one in Aurora. Look at the dollars on the left. Then pick one here: where does a month of basics take the <b>most hours of work</b>? Lock it in.',
   honors:'Pick one here: for this household, where does a month of basics take the <b>most hours of minimum-wage work</b>? Lock it in before you look at hours.'},
  lock(sim){const R=model(sim),c=sim.p.pick;return {v:R[c].hrs,city:c,label:`${NAME[c]}`};},
  solve(sim){const R=model(sim),c=hardest(R);sim.p.pick=c;sim.p.hours=true;return {v:R[c].hrs,city:c,label:`${NAME[c]}: ${f0(R[c].hrs)} hours of work for one month of basics`};},
  how:{bio:'The math divides each basket by the pay for one hour of work in that city. Dollars ÷ (dollars per hour) = hours. A cheap basket can still take many hours if pay is low.',
   honors:'Hours = basket cost ÷ hourly pay, and share of pay = basket cost ÷ (earners × monthly pay). A bigger household changes the hours in every city by the same factor here, so it changes how many jobs you need, not which city is hardest.',
   ap:'Hours = C ÷ w. Comparing two cities, C₁/C₂ is this basket’s PPP factor and w₁/w₂ is the pay ratio. The city with the larger (C ÷ w) is harder, so the ranking flips exactly when the price ratio crosses the pay ratio.'},
  compare(sim,g,m){const R=model(sim),d=m.v-g.v;
   if(g.city===m.city)return `Your gut was right on: <b>${NAME[m.city]}</b> takes the most work, ${f0(m.v)} hours a month (${f1(m.v/HRS)} full-time jobs). You already sensed that a price means little until you set it next to pay. The math shows why: ${usd(R[m.city].tot)} ÷ ${usd2(R[m.city].wage)} an hour.`;
   return `You picked <b>${NAME[g.city]}</b>: ${f0(g.v)} hours of work. <b>${NAME[m.city]}</b> takes ${f0(m.v)} hours, <b>${f0(d)} more hours of work every month</b>, about ${f1(d/40)} extra 40-hour weeks. ${R[g.city].tot>R[m.city].tot?`${NAME[m.city]} is cheaper in dollars than ${NAME[g.city]}, but its pay is lower still next to its prices.`:`${NAME[g.city]} is cheaper in dollars, but what decides it is prices ÷ pay: ${usd(R[g.city].tot)} ÷ ${usd2(R[g.city].wage)} an hour in ${NAME[g.city]}, against ${usd(R[m.city].tot)} ÷ ${usd2(R[m.city].wage)} in ${NAME[m.city]}.`}`;},
  again(sim){sim.p.pick='quito';sim.p.hours=false;if(ap()){const r=Math.random();sim.p.qrent=150+5*Math.floor(Math.random()*111);sim.p.commute=r<0.5?'bus':'car';sim.p.bonus=Math.random()<0.5?'with':'without';}
   else if(hon()){const o=['one','two','fam'];sim.p.hh=o[Math.floor(Math.random()*3)];sim.p.earn=Math.random()<0.5?'1':'2';}}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The Dallas basket ($2,896 a month) costs less than the Aurora basket ($3,116). For a full-time minimum-wage worker, which one is easier to pay for?',choices:['Dallas: it costs less','Aurora: it takes fewer hours of work','They are about the same'],correct:1,explain:'Dallas takes 2,896 ÷ 7.25 ≈ 399 hours of work. Aurora takes 3,116 ÷ 15.16 ≈ 206 hours. Dallas is about 7% cheaper in dollars but takes almost twice the work, because Colorado’s minimum wage is more than twice the Texas one.'},
  {lvl:'bio',instant:true,q:'Quito’s basket costs about $563, under a fifth of Aurora’s $3,116. Does that make it about five times easier to pay for on minimum wage?',choices:['Yes, about five times easier','No: Quito pay is much lower too, so it takes nearly as many hours','No: it is harder than Dallas'],correct:1,explain:'Quito’s minimum pay works out to about $3.24 an hour, so the basket takes 562.50 ÷ 3.244 ≈ 173 hours, almost a full-time month. Aurora takes about 206 hours. Prices are about 5.5 times higher in Aurora, but pay is about 4.7 times higher, so the gap in hours is small.'},
  {lvl:'honors',instant:true,q:'Engel’s law says poorer households spend a bigger share of income on food. A minimum-wage worker in Dallas spends $335 a month on food; one in Aurora spends $380. Who spends the bigger share of pay on food?',choices:['Aurora: the food costs more','Dallas: about 27% of pay against about 14%','About the same share'],correct:1,explain:'Dallas: 335 ÷ 1,257 ≈ 27% of a full-time minimum-wage month. Aurora: 380 ÷ 2,628 ≈ 14%. More dollars on food in Aurora, but a smaller share of pay. In 2024 U.S. data, the lowest-income fifth of households spent about 33% of income on food; the highest fifth, about 6%.'},
  {lvl:'honors',instant:true,q:'A family of two adults and two children in Dallas has both parents working full time at minimum wage. Does their pay cover the basket?',choices:['Yes, with a little left over','No: the basket is about 242% of their pay','No, but it is only a few dollars short'],correct:1,explain:'The family basket is 2,896 × 2.1 ≈ $6,081 a month. Two full-time minimum-wage jobs pay 2 × $1,257 ≈ $2,513, so the basket is about 242% of their pay, about 4.8 full-time jobs’ worth. This model leaves out child care, which would add more.'},
  {lvl:'honors',instant:true,q:'INEC reports that Ecuador’s average labor income in April 2026 was $513 a month. A full-time minimum-wage job pays about $562 a month with the 13th and 14th payments. How can the average be below the minimum?',choices:['It cannot: one of the numbers must be wrong','Many workers do not have full-time jobs that pay the legal minimum','The average leaves out the highest earners'],correct:1,explain:'In April 2026 only 34.3% of Ecuador’s workers had adequate employment. Part-time and informal work pulls the average below the legal minimum. An average can hide exactly the workers this comparison is about.'},
  {lvl:'ap',instant:true,q:'With Aurora as the base (= 100), what is Quito’s Laspeyres price index for this basket?',choices:['About 18','About 55','About 82','About 554'],correct:0,explain:'With weights equal to Aurora’s spending shares, Σ wᵢ(pᵢ,Quito / pᵢ,Aurora) = Σ pᵢ,Quito ÷ Σ pᵢ,Aurora = 562.50 ÷ 3,116.08 ≈ 0.181, so the index is about 18.'},
  {lvl:'ap',instant:true,q:'For this basket, Quito’s PPP factor against Aurora is about 0.181. What is a full-time minimum-wage month in Quito ($562.33) worth in Aurora dollars?',choices:['About $102','About $562','About $3,115, more than Aurora’s $2,628','About $5,540'],correct:2,explain:'Divide by the PPP factor: 562.33 ÷ 0.1805 ≈ $3,115. In this basket, Quito’s minimum pay buys about one full basket, and Aurora’s buys 2,628 ÷ 3,116 ≈ 0.84 of one. That result rests on the Quito assumptions, so test them.'},
  {lvl:'ap',instant:true,q:'Which one change, by itself, makes Quito take more hours of work than Aurora?',choices:['Quito rent of $350 instead of $300','A bus or train pass in Dallas and Aurora instead of a car','Two earners in every household'],correct:1,explain:'A pass costs $88 a month in Aurora against $670 for the MIT car budget, so Aurora drops to 2,534.25 ÷ 15.16 ≈ 167 hours, below Quito’s 173. Quito rent of $350 gives about 189 hours, still under Aurora’s 206; the tie is near $404. Two earners change the hours in every city by the same factor, so the ranking stays the same.'}
 ],
 tour:[
  {title:'One month of basics',text:'Each bar on the left is one month of basics for one adult who rents alone: housing (rent and utilities), food, getting around, a phone and internet, and health care. Dallas and Aurora use MIT Living Wage Calculator budgets; Quito uses the official bus fare and labeled assumptions.',focus:[[10,0,385,450]],pause:true,setup:sim=>BioLab.setValues(sim,{hours:false,hh:'one',earn:'1'})},
  {title:'Same currency',text:'Ecuador has used the U.S. dollar since 2000, so a dollar in Quito is a dollar in Dallas. No exchange rate. In dollars, Quito’s basket (about $563) is under a fifth of Aurora’s ($3,116).',focus:[[10,0,385,450]],pause:true},
  {title:'Now the pay',text:'The other half of the ratio is pay. Ecuador’s 2026 minimum is $482 a month; with the 13th and 14th payments it averages $562.33, about $3.24 an hour. Texas uses the federal $7.25. Colorado’s 2026 minimum is $15.16, and Aurora has no separate local minimum.',focus:[[10,330,385,120]],pause:true},
  {title:'Turn dollars into hours',text:'Divide: dollars ÷ (dollars per hour) = hours. Quito: 562.50 ÷ 3.24 ≈ 173 hours. Dallas: 2,895.83 ÷ 7.25 ≈ 399 hours. Aurora: 3,116.08 ÷ 15.16 ≈ 206 hours. The dashed line is one full-time job.',focus:[[400,0,400,450]],pause:true,setup:sim=>BioLab.setValues(sim,{hours:true})},
  {title:'Cheaper in dollars, harder in hours',text:'Dallas costs about $220 less than Aurora each month but takes about 194 more hours of work: 2.3 full-time jobs. Quito is the cheapest by far in dollars, and still takes almost a full-time month. Share of pay tells the same story: 100%, 230% and 119%.',focus:[[10,0,780,450]],pause:true},
  {lvl:'honors',title:'Households and food',text:'Switch to 2 adults and 2 children with 2 earners. Costs grow by 2.1 times, not 4, because a family shares rent. Even so, two minimum-wage jobs cover only part of the Dallas basket (242%). Food takes about 28% of the family’s pay in Quito and Dallas, but about 15% in Aurora: Engel’s law.',pause:true,setup:sim=>BioLab.setValues(sim,{hours:true,hh:'fam',earn:'2'})},
  {lvl:'ap',title:'Index, PPP and sensitivity',text:'With Aurora = 100, Quito’s index is 18 and Dallas’s is 93. Now raise Quito rent: at about $404, Quito takes as many hours as Aurora. Try a bus pass in the U.S., or Ecuador pay without the 13th and 14th payments, and watch the ranking move.',pause:true,setup:sim=>BioLab.setValues(sim,{hours:true,hh:'one',earn:'1',qrent:405})}
 ],
 lab:{bio:'<p><b>Question:</b> Does the cheapest place in dollars take the fewest hours of work?</p><ol><li>Write down each basket’s cost in dollars.</li><li>Turn on <b>Show hours of work</b>. Write down the hours for each city.</li><li>Rank the cities both ways.</li></ol><p>Write one sentence: why do the two rankings disagree?</p>',
  honors:'<p><b>Question:</b> How do household size and the number of earners change affordability?</p><ol><li>For each household type, record the share of pay in all three cities with 1 earner, then 2 earners.</li><li>Record the food share of pay each time.</li><li>Find the cheapest household setup in which every city’s basket is under 100% of pay, if there is one.</li></ol><p>Write two sentences: one on households, one on Engel’s law.</p>',
  ap:'<p><b>Question:</b> Which assumption decides the ranking?</p><ol><li>Record each city’s price index with Aurora, then Dallas, then Quito as the base. Check that the hours ranking does not change with the base.</li><li>Find the Quito rent at which Quito and Aurora take the same hours, with and without the 13th and 14th payments, and with the bus pass.</li><li>Use the Dallas pay slider to find the hourly pay at which Dallas takes the same hours as Aurora.</li></ol><p><b>CER:</b> Claim which city is hardest to afford, evidence from your table, and reasoning about which inputs are sourced and which are assumptions.</p>'},
 terms:[
  {t:'Basket',d:'A fixed list of goods and services, priced in each place. Here: housing, food, transport, phone and internet, and health care for one month.'},
  {t:'Affordability',d:'Cost compared with income. Hours of work = cost ÷ hourly pay. Share of pay = cost ÷ monthly pay.'},
  {t:'Minimum wage',d:'The lowest pay an employer may legally pay. 2026: $482 a month in Ecuador, $7.25 an hour in Texas, $15.16 an hour in Colorado.'},
  {t:'Weighted average',d:'An average in which each part counts by its weight. A price index weights each item by its share of the basket.',lvl:'honors'},
  {t:'Equivalence scale',d:'A rule for how much more a bigger household needs. The OECD-modified scale counts the first adult as 1, each other adult as 0.5 and each child as 0.3.',lvl:'honors'},
  {t:'Engel’s law',d:'As income rises, the share of it spent on food falls, even though the dollars spent on food rise.',lvl:'honors'},
  {t:'Poverty line',d:'An income cutoff below which a person or household is counted as poor. Ecuador’s INEC line was $92.40 per person a month (December 2025).',lvl:'honors'},
  {t:'Laspeyres price index',d:'Prices a fixed basket, with base-place quantities, at another place’s or time’s prices: 100 × Σ pᵢ,new qᵢ ÷ Σ pᵢ,base qᵢ.',lvl:'ap'},
  {t:'Purchasing power parity (PPP)',d:'Comparing what money buys. A PPP factor for a basket is its cost in one place ÷ its cost in another. Dividing pay by it gives pay in base-place dollars.',lvl:'ap'},
  {t:'Sensitivity analysis',d:'Changing one assumption at a time to see whether the conclusion changes.',lvl:'ap'}
 ],
 about:'<p><b>The math.</b> For each city, basket cost C = the sum of the five monthly items, times the household scale. Hours of work = C ÷ hourly pay. Share of pay = C ÷ (earners × monthly pay). A full-time month is 40 hours × 52 weeks ÷ 12 ≈ 173.33 hours in all three places (Ecuador’s labor code, Article 47, caps the work week at 40 hours: <a href="https://www.bloomberglinea.com/latinoamerica/ecuador/ecuador-el-pionero-en-fijar-40-horas-semanales-de-trabajo-en-latinoamerica/" target="_blank" rel="noopener">Bloomberg Línea</a>). Price index = 100 × C<sub>city</sub> ÷ C<sub>base</sub>, which equals the weighted average of price relatives with the base city’s spending shares as weights (Laspeyres). PPP factor = C<sub>city</sub> ÷ C<sub>base</sub>; pay in base-city dollars = monthly pay ÷ PPP factor.</p><p><b>Sourced figures.</b></p><ul><li>Ecuador’s 2026 minimum wage (salario básico unificado): $482 a month, Acuerdo Ministerial MDT-2025-195 of Dec 15, 2025, effective Jan 1, 2026 (<a href="https://nmslaw.com.ec/blog/2025/12/22/ecuador-salario-basico-unificado-2026/" target="_blank" rel="noopener">summary by NMS Law</a>). With the 13th and 14th payments, INEC counts $40.17 more for each, $562.33 a month.</li><li>INEC, Canastas Analíticas, June 2026: national basic family basket (canasta familiar básica) $824.85 for a household of 4; household income of 1.6 minimum-wage earners $899.73, covering 109.08% of it (<a href="https://www.ecuadorencifras.gob.ec/documentos/web-inec/Inflacion/canastas/2026/junio/1.Informe_Ejecutivo_Canastas_Analiticas_jun_2026.pdf" target="_blank" rel="noopener">INEC report</a>). Quito’s basket in June 2026: $847.61 (INEC, reported by <a href="https://www.eldiario.ec/centro/estas-son-las-cinco-ciudades-mas-caras-de-ecuador-14072026/" target="_blank" rel="noopener">El Diario</a>).</li><li>Ecuador’s poverty line: $92.40 per person a month, December 2025 (INEC, reported by <a href="https://www.primicias.ec/economia/pobreza-ecuador-ingresos-urbana-rural-desigualdad-diciembre2025-113335/" target="_blank" rel="noopener">Primicias</a>). Average labor income $513 a month and adequate employment 34.3%, April 2026 (INEC ENEMDU, reported by <a href="https://www.extra.ec/noticia/economia/cuanto-dinero-viven-ecuatorianos-mes-dato-inec-revela-dura-realidad-154594.html" target="_blank" rel="noopener">Extra</a>).</li><li>Quito bus fare: $0.35 in 2026; the city council approved $0.40 from Jan 1, 2027 (<a href="https://elmercurio.com.ec/nacional/2026/09/08/aprueban-alza-del-precio-del-pasaje-en-quito/" target="_blank" rel="noopener">El Mercurio, Sep 8, 2026</a>). The basket counts 50 rides a month: $17.50.</li><li>Minimum wages: Texas adopts the federal $7.25; Colorado’s is $15.16 (<a href="https://www.dol.gov/agencies/whd/minimum-wage/state" target="_blank" rel="noopener">U.S. Department of Labor</a>), up from $14.81 in 2025 (<a href="https://www.axios.com/local/denver/2025/12/17/minimum-wage-2026-colorado-denver" target="_blank" rel="noopener">Axios</a>). Colorado’s labor department lists local minimums only for Denver, Edgewater, the City of Boulder and unincorporated Boulder County, so the state rate applies in Aurora (<a href="https://cdle.colorado.gov/dlss" target="_blank" rel="noopener">CDLE</a>).</li><li>Dallas and Aurora baskets: MIT Living Wage Calculator, 1 adult with no children, data updated Feb 15, 2026, annual figures ÷ 12. Dallas County: food $4,019, housing $17,805, transportation $8,440, internet and mobile $1,454, medical $3,032 a year (<a href="https://livingwage.mit.edu/counties/48113" target="_blank" rel="noopener">MIT, Dallas County</a>). Arapahoe County, which includes much of Aurora: $4,557, $19,748, $8,038, $1,851 and $3,199 (<a href="https://livingwage.mit.edu/counties/08005" target="_blank" rel="noopener">MIT, Arapahoe County</a>). MIT housing includes utilities, and its transportation assumes a car. MIT also lists Dallas child care for two children at $21,211 a year, which this model leaves out.</li><li>Bus or train passes: DART local monthly pass $126 (fare change of Mar 1, 2025, <a href="https://dart.org/fare/general-fares-and-overview/2025-fare-restructure" target="_blank" rel="noopener">DART</a>); RTD monthly pass $88 (<a href="https://www.rtd-denver.com/fares-passes/fares" target="_blank" rel="noopener">RTD</a>).</li><li>Engel’s law in U.S. data: in 2024 the lowest-income fifth of households spent about 33.0% of before-tax income on food, the highest fifth about 6.4% (<a href="https://www.ers.usda.gov/data-products/chart-gallery/58372" target="_blank" rel="noopener">USDA Economic Research Service</a>).</li><li>Typical pay to try with your own numbers: MIT lists typical food preparation and serving salaries of $31,040 a year in Texas and $42,130 in Colorado, about $14.92 and $20.25 an hour at 2,080 hours.</li></ul><p><b>Assumptions for illustration (not sourced prices).</b> Quito rent $300 a month for a modest one-bedroom; utilities $35; food for one adult $150; phone and internet $30; health care $30 out of pocket. For context on rent: the Quito Cómo Vamos 2025 report, using 2024 listings on the Plusvalía portal, found an average of $503 for a 70 m² apartment and averages of $257 to $274 in the cheapest northern parishes, with no data for the south of the city (<a href="https://www.expreso.ec/quito/donde-es-mas-caro-arrendar-en-quito-y-en-que-zonas-el-metro-cuadrado-cuesta-mas-269203.html" target="_blank" rel="noopener">Expreso</a>); Properati listings for early 2024 averaged $447 citywide for 1 to 3 bedrooms (<a href="https://www.eluniverso.com/noticias/economia/arriendos-viviendas-quito-salario-basico-informe-nota" target="_blank" rel="noopener">El Universo</a>). Listing averages run above what many workers pay, so treat Quito rent and food as the inputs to test at Deep dive. The ranking of Quito and Aurora depends on them.</p><p><b>What is simplified.</b> The three baskets are similar, not identical: a U.S. car against a Quito bus, MIT’s health budget (insurance plus out-of-pocket) against a small Quito out-of-pocket amount. International price comparisons face this same problem. Pay is before payroll deductions in both countries, and taxes and public benefits are left out. Bigger households use the OECD-modified equivalence scale (first adult 1, other adults 0.5, children 0.3), which is a standard approximation; real costs scale differently item by item. Many workers in all three cities earn more or less than the minimum. This is a simplified math model, not financial advice. Any numbers you type stay in this browser tab’s memory only and are never saved or sent.</p><p><b>Why this matters.</b> Catholic social teaching holds that work has dignity and that a just wage should let a worker live. Pope Leo XIII wrote in <i>Rerum Novarum</i> (1891, §45) that “wages ought not to be insufficient to support a frugal and well-behaved wage-earner” (<a href="https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html" target="_blank" rel="noopener">Vatican</a>). Real people in all three cities do this math every month. The tool compares numbers, not countries or the people in them.</p>'
};
/* The rent graph below Deep dive uses the default rent model, so it reads the same way at every level. */
function modelRent(sim,r){const c=prices(sim);c.quito.housing=r+Q.util;const w=wages(sim),s=hh(sim).s,o={};CITY.forEach(k=>{let tot=0;ITEMS.forEach(([id])=>tot+=c[k][id]*s);o[k]={hrs:tot/w[k]};});return o;}
BioLab.register(SIM);
})();
