(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,atLeast,fmtNum}=BioLab.h;
/* MIT Living Wage Calculator (Dr. Amy K. Glasmeier, MIT), county pages last updated Feb 15, 2026 (2026 estimates).
   Each household: [food, child care, health care, housing, transportation, civic, internet & mobile, other], annual taxes,
   MIT's poverty wage per hour, earners. "Other necessities" in this tool = MIT's civic + internet & mobile + other. */
const PLACES={
 arap:{name:'Arapahoe County, CO',short:'Arapahoe County',state:'Colorado',min:15.16,url:'https://livingwage.mit.edu/counties/08005',hh:{
  '1a0':[[4557,0,3199,19748,8038,3876,1851,4992],10081,7.67,1],
  '1a1':[[6685,19448,8272,25109,9302,6543,1851,9077],17677,10.40,1],
  '1a2':[[10015,36208,8424,25109,11717,8629,1851,9923],27643,13.13,1],
  '2a1w2':[[13336,0,9538,25109,13482,9827,2473,10804],10111,15.87,1],
  '2a2w0':[[8354,0,6731,21083,9302,6543,2473,9077],10682,5.20,2],
  '2a2w2':[[13336,36208,9538,25109,13482,9827,2473,10804],23505,7.93,2]}},
 dal:{name:'Dallas County, TX',short:'Dallas County',state:'Texas',min:7.25,url:'https://livingwage.mit.edu/counties/48113',hh:{
  '1a0':[[4019,0,3032,17805,8440,2583,1454,4067],7090,7.67,1],
  '1a1':[[5896,10755,8759,21732,9767,4360,1454,7395],8715,10.40,1],
  '1a2':[[8834,21211,8906,21732,12303,5749,1454,8083],10966,13.13,1],
  '2a1w2':[[11763,0,9986,21732,14156,6547,2027,8801],5852,15.87,1],
  '2a2w0':[[7369,0,7214,18547,9767,4360,2027,7395],7356,5.20,2],
  '2a2w2':[[11763,21211,9986,21732,14156,6547,2027,8801],11026,7.93,2]}}};
const HH=[{v:'1a0',l:'1 adult, no children',c:'1A',s:'1 adult'},{v:'1a1',l:'1 adult, 1 child',c:'1A 1C',s:'1 adult, 1 child'},{v:'1a2',l:'1 adult, 2 children',c:'1A 2C',s:'1 adult, 2 kids'},
 {v:'2a1w2',l:'2 adults (1 working), 2 children',c:'2A·1W 2C',s:'2 adults, 1 works, 2 kids'},{v:'2a2w0',l:'2 adults (both working), no children',c:'2A·2W',s:'2 adults, both work'},{v:'2a2w2',l:'2 adults (both working), 2 children',c:'2A·2W 2C',s:'2 adults, both work, 2 kids'}];
const HHL={};HH.forEach(h=>HHL[h.v]=h);
/* the six budget lines the tool shows, in MIT's order of the source array */
const CATS=[{id:'food',l:'Food',i:[0],c:'s3'},{id:'house',l:'Housing',i:[3],c:'s2'},{id:'care',l:'Child care',i:[1],c:'s5'},{id:'trans',l:'Transportation',i:[4],c:'s4'},{id:'med',l:'Health care',i:[2],c:'s6'},{id:'other',l:'Other necessities',i:[5,6,7],c:'s1'}];
/* Global Living Wage Coalition benchmarks (Anker methodology), 2025 estimates, gross per month in local currency,
   with the legal minimum compared, and the US$ figure GLWC shows on each benchmark page. */
const WORLD=[
 {id:'ec',l:'Rural Ecuador, coast',yr:'Anker 2025',cur:'$',lw:503,min:470,minTxt:'$470',lwTxt:'$503',usd:503,minUsd:470,fam:'family of 4, 1.61 workers',inf:68.45,infYr:2025},
 {id:'gt',l:'Rural Guatemala',yr:'Anker 2025',lw:3859,min:3686.86,lwTxt:'Q3,859',minTxt:'Q3,687',usd:502,minUsd:3686.86*502/3859,fam:'family of 5, 1.53 workers',inf:75.93,infYr:2024},
 {id:'bd',l:'Dhaka, Bangladesh',yr:'Anker 2025',lw:30459,min:12500,lwTxt:'৳30,459',minTxt:'৳12,500',usd:248,minUsd:12500*248/30459,fam:'family of 4, 1.58 workers',inf:84.04,infYr:2024},
 {id:'vn',l:'Vietnam, Region 1',yr:'Anker 2025',lw:9294701,min:4960000,lwTxt:'₫9.29 million',minTxt:'₫4.96 million',usd:356,minUsd:4960000*356/9294701,fam:'family of 4, 1.76 workers',inf:67.03,infYr:2024}];
const HOURS=2080;
const money=v=>'$'+Math.round(v).toLocaleString('en-US');
const cents=v=>'$'+(Math.round(v*100)/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const P=sim=>PLACES[sim.p.place]||PLACES.arap;
const H=sim=>P(sim).hh[sim.p.hh]||P(sim).hh['1a1'];
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
/* The model. Category amounts (annual), the Deep dive change to one category and the margin, then taxes.
   Taxes: MIT computes them with a tax model. Here, when you change the budget, taxes stay the same share of
   pre-tax income as in MIT's figures (a simplification). With no change, the total is MIT's to the dollar. */
function model(sim,o){o=o||{};const pl=PLACES[o.place||sim.p.place],h=pl.hh[o.hh||sim.p.hh],src=h[0],tax0=h[1],earners=h[3];
 const deep=o.deep!==undefined?o.deep:atLeast('ap'),cat=o.cat||sim.p.cat,pct=deep?(o.pct!==undefined?o.pct:sim.p.pct):0,mg=deep?(o.margin!==undefined?o.margin:sim.p.margin):0;
 const lines=CATS.map(c=>{let a=c.i.reduce((s,i)=>s+src[i],0);if(c.id===cat)a*=1+pct/100;return {id:c.id,l:c.l,c:c.c,a};});
 const base=src.reduce((s,v)=>s+v,0),need=lines.reduce((s,x)=>s+x.a,0),marg=need*mg/100,after=need+marg;
 const t=tax0/(base+tax0),tax=(pct||mg)?after/(1-t)-after:tax0,gross=after+tax;
 return {lines,need,marg,after,tax,gross,earners,lw:gross/earners/HOURS,min:pl.min,pov:h[2],t,pl,hh:o.hh||sim.p.hh};}
const lw=sim=>model(sim).lw;
/* change in each earner's hourly wage if one category rises 10% (taxes scale as above) */
function sens(sim){const b=model(sim,{deep:true,pct:0,margin:atLeast('ap')?sim.p.margin:0});
 return CATS.map(c=>({c,d:model(sim,{deep:true,cat:c.id,pct:10,margin:atLeast('ap')?sim.p.margin:0}).lw-b.lw}));}
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function hhName(sim){return HHL[sim.p.hh].l;}
/* text on a soft background box so it stays readable over lines */
function htxt(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.88;ctx.fillRect(x0-3,y-o.s*0.85,w+6,o.s*1.15);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}
function tw(ctx,s,size,w){ctx.font=(w||400)+' '+size+'px '+FONT;return ctx.measureText(s).width;}
function worldRows(sim){const m=model(sim),rows=[];
 ['arap','dal'].forEach(p=>{const x=model(sim,{place:p,deep:false});rows.push({l:PLACES[p].short+', '+(p==='arap'?'CO':'TX'),yr:'MIT 2026',mult:x.lw/x.min,sub:cents(x.lw)+' vs '+cents(x.min)+' an hour ('+HHL[sim.p.hh].s+')',inf:'U.S.: 1.0% of hourly workers earn $7.25 or less (BLS 2024)',infS:'1% at $7.25 or less',us:true,on:p===sim.p.place});});
 WORLD.forEach(w=>rows.push({l:w.l,yr:w.yr,mult:w.lw/w.min,sub:w.lwTxt+' vs '+w.minTxt+' a month'+(w.cur==='$'?'':' (about '+money(w.usd)+' vs '+money(w.minUsd)+')'),inf:Math.round(w.inf)+'% of jobs are informal (ILO '+w.infYr+')',infS:Math.round(w.inf)+'% informal'}));
 return rows;}

const SIM={
 id:'livingwage',hash:'livingwage',apUnit:20,order:5,tab:'Build a living wage',kind:'Simulation',
 card:'Guess the hourly wage a family needs to cover the basics, then build it the way a living wage calculator does: a budget, taxes, ÷ earners ÷ 2,080 hours.',
 title:'Build a living wage',
 lede:{bio:'A living wage is the hourly pay one full-time job needs to cover a household’s basic needs with no outside help. Nobody counts it. It is built: pick a household, price each basic need, add taxes, then divide by the hours worked.',
  honors:'The same household needs a different wage in a different county, and two earners split the bill. Comparing a living wage with the local minimum wage, as a multiple, works in any currency, but only for workers the minimum actually covers. Where most jobs are informal, many people earn less than the minimum.',
  ap:'Every living wage is an estimate resting on choices: which items count as basic, what quality of housing, how big a margin for the unexpected. Change one assumption and watch which ones move the answer most.'},
 scale:'One household, one year of basic needs, priced by MIT for a U.S. county (2026 estimates). Full time = 40 hours × 52 weeks = 2,080 hours a year.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your household',
 controls:[
  {id:'guess',label:'Your guess: the hourly wage each earner needs',type:'range',min:5,max:100,step:0.5,def:20,unit:'',help:'Dollars per hour, before taxes, working full time. This is your gut pick: the orange line on the picture moves with it.'},
  {id:'place',label:'Place',type:'seg',def:'arap',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'arap',l:'Arapahoe County, CO'},{v:'dal',l:'Dallas County, TX'}],help:'Regis Jesuit is in Aurora, in Arapahoe County. Dallas County is the second U.S. place.'},
  {id:'hh',label:'Household',type:'select',def:'1a1',lvl:'honors',noGut:true,onChange:clearGut,options:HH.map(h=>({v:h.v,l:h.l}))},
  {id:'view',label:'Picture',type:'seg',def:'budget',lvl:'honors',noGut:true,options:[{v:'budget',l:'This household'},{v:'world',l:'Around the world'}]},
  {id:'cat',label:'Change one budget line',type:'select',def:'house',lvl:'ap',noGut:true,options:CATS.map(c=>({v:c.id,l:c.l}))},
  {id:'pct',label:'by this much',type:'range',min:-50,max:50,step:5,def:0,unit:'%',lvl:'ap',noGut:true,help:'A what-if: cheaper housing, pricier child care. Taxes are kept at the same share of income.'},
  {id:'margin',label:'Margin for unexpected events',type:'range',min:0,max:10,step:1,def:0,unit:'%',lvl:'ap',noGut:true,help:'The Anker method adds “a small margin” for illness, accidents and emergencies. MIT adds none. The size here is your choice.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the numbers',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'lw',label:'Living wage, each earner',unit:'$ per hour',d:2,min:0,max:null,get:sim=>shown(sim)?lw(sim):null},
  {id:'year',label:'Needed per year, before taxes',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim).gross:null},
  {id:'minw',label:'Minimum wage here',unit:'$ per hour',d:2,min:0,max:null,get:sim=>P(sim).min},
  {id:'short',label:'Short each month at minimum wage, full time',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?Math.max(0,(lw(sim)-P(sim).min)*HOURS/12):null},
  {id:'hours',label:'Hours a week at minimum wage to earn it',unit:'hours',d:1,min:0,max:null,get:sim=>shown(sim)?lw(sim)*40/P(sim).min:null},
  {id:'mult',label:'Living wage ÷ minimum wage',unit:'×',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?lw(sim)/P(sim).min:null},
  {id:'povx',label:'Living wage ÷ poverty wage',unit:'×',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?lw(sim)/H(sim)[2]:null},
  {id:'tax',label:'Taxes, share of pre-tax income',unit:'%',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?100*model(sim).t:null},
  {id:'driver',label:'Biggest driver: +10% on one line',lvl:'ap',text:true,get:sim=>{if(!shown(sim))return 'Lock in your guess first';const s=sens(sim).sort((a,b)=>b.d-a.d)[0];return s.c.l+': +'+cents(s.d)+' an hour';}}
 ],
 graphs:[{id:'types',label:'Living wage by household',custom:true},{id:'sens',label:'Which line drives it? (+10% each)',lvl:'ap',custom:true}],defaultGraph:'types',
 plot(sim,ctx,box,id){
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  if(id==='sens'){const s=sens(sim),top=Math.max(0.2,...s.map(x=>x.d))*1.3;
   const ax=axes(ctx,box,{xmin:0,xmax:s.length,ymin:0,ymax:top,xcats:['Food','Housing','Child care','Transport','Health','Other'],yl:'+ $ per hour',xl:'If this line costs 10% more'});
   s.forEach((x,i)=>{const x0=ax.X(i+.2),x1=ax.X(i+.8);ctx.fillStyle=PAL[x.c.c];ctx.fillRect(x0,ax.Y(x.d),x1-x0,ax.Y(0)-ax.Y(x.d));txt(ctx,'+'+cents(x.d),(x0+x1)/2,ax.Y(x.d)-6,{s:12,w:700,c:PAL['fg'],a:'center'});});return;}
  const pl=P(sim),vals=HH.map(h=>model(sim,{hh:h.v}).lw),top=Math.max(...vals,pl.min)*1.18;
  const ax=axes(ctx,box,{xmin:0,xmax:HH.length,ymin:0,ymax:top,xcats:HH.map(h=>h.c),yl:'$ per hour, each earner',xl:'A = adults, C = children, W = working adults'});
  vals.forEach((v,i)=>{const x0=ax.X(i+.2),x1=ax.X(i+.8);ctx.fillStyle=HH[i].v===sim.p.hh?PAL['rj']:PAL['s2'];ctx.globalAlpha=HH[i].v===sim.p.hh?1:.7;ctx.fillRect(x0,ax.Y(v),x1-x0,ax.Y(0)-ax.Y(v));ctx.globalAlpha=1;txt(ctx,cents(v),(x0+x1)/2,ax.Y(v)-6,{s:12,w:700,c:PAL['fg'],a:'center'});});
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(box.L,ax.Y(pl.min));ctx.lineTo(box.L+box.W,ax.Y(pl.min));ctx.stroke();ctx.setLineDash([]);
  htxt(ctx,pl.state+' minimum wage '+cents(pl.min),box.L+box.W-6,ax.Y(pl.min)-7,{s:12,w:700,c:PAL['s4'],a:'right'});},
 draw(sim,ctx,vdt,k){const W=800,Hh=450;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,Hh);
  if(sim.p.view==='world'&&atLeast('honors'))return drawWorld(sim,ctx,k);
  const m=model(sim),sh=shown(sim),G=sim.gutS,kk=Math.min(k,1.8);
  /* title */
  txt(ctx,hhName(sim),16,28,{s:14*kk,w:700});
  txt(ctx,P(sim).name+' · per year',16,28+18*kk,{s:12*kk,c:PAL['cv-soft']});
  /* budget rows */
  const lines=m.lines.slice();if(m.marg>0)lines.push({id:'marg',l:'Margin',c:'s5',a:m.marg});lines.push({id:'tax',l:'Taxes',c:'muted',a:m.tax});
  const y0=Math.round(72+22*kk),y1=352,rh=(y1-y0)/lines.length,fs=Math.min(13*kk,rh*0.62);
  const lw0=Math.max(...lines.map(x=>tw(ctx,x.l,fs,600)))+14,bx=16+lw0,bmax=470-bx-tw(ctx,'$36,208',fs,700)-10,amax=Math.max(...lines.map(x=>x.a),1);
  lines.forEach((x,i)=>{const y=y0+rh*(i+.5);txt(ctx,x.l,16,y,{s:fs,w:600,b:'middle'});
   const w=Math.max(2,x.a/amax*bmax);ctx.fillStyle=PAL[x.c]||PAL['muted'];ctx.globalAlpha=sh?1:.35;ctx.fillRect(bx,y-rh*0.3,w,rh*0.6);ctx.globalAlpha=1;
   txt(ctx,sh?money(x.a):'?',bx+w+8,y,{s:fs,w:700,b:'middle',c:sh?PAL['cv-ink']:PAL['cv-soft']});});
  /* total and the division */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(16,y1+4);ctx.lineTo(470,y1+4);ctx.stroke();
  txt(ctx,'Before taxes: '+(sh?money(m.gross):'?')+' a year',16,y1+24*kk,{s:13*kk,w:700});
  const eq=sh?money(m.gross)+' ÷ '+m.earners+' earner'+(m.earners>1?'s':'')+' ÷ 2,080 hours = '+cents(m.lw)+' an hour':'Total ÷ earners ÷ 2,080 hours = ? an hour';
  pill(ctx,eq,400,Hh-22,sh?PAL['rj']:PAL['cv-soft'],'#fff',Math.min(13*kk,19));
  /* right panel: dollars per hour */
  const L=500,R=790,B=318,T=96,cols=[{l:['Poverty','wage'],v:m.pov,c:PAL['s6']},{l:['Minimum','wage'],v:m.min,c:PAL['s4']},{l:['Living','wage'],v:sh?m.lw:null,c:PAL['rj']}];
  const gv=G&&G.g?G.g.guess:sim.p.guess,top=Math.max(sh?m.lw:0,gv,m.min,20)*1.12,Y=v=>B-v/top*(B-T);
  txt(ctx,'Per hour, each earner',(L+R)/2,72,{s:13*kk,w:700,a:'center'});
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  const cw=(R-L)/3,boxes=[],vs=12*kk;cols.forEach((c,i)=>{const cx=L+cw*(i+.5),bw=Math.min(64,cw*0.62);
   if(c.v==null){ctx.strokeStyle=c.c;ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.strokeRect(cx-bw/2,T+30,bw,B-T-30);ctx.setLineDash([]);txt(ctx,'?',cx,(T+B)/2+10,{s:26*Math.min(kk,1.4),w:700,c:c.c,a:'center'});boxes.push([cx-bw/2,T+30,cx+bw/2,B]);}
   else{ctx.fillStyle=c.c;ctx.fillRect(cx-bw/2,Y(c.v),bw,B-Y(c.v));const s=cents(c.v),w=tw(ctx,s,vs,700);txt(ctx,s,cx,Y(c.v)-8,{s:vs,w:700,c:PAL['cv-ink'],a:'center'});boxes.push([cx-w/2,Y(c.v)-8-vs,cx+w/2,Y(c.v)-4]);}
   txt(ctx,c.l[0],cx,B+16*kk,{s:12*kk,c:PAL['cv-ink'],a:'center',w:600});txt(ctx,c.l[1],cx,B+30*kk,{s:12*kk,c:PAL['cv-ink'],a:'center',w:600});});
  /* gut line, with its label placed where it covers no value label */
  {const gy=Y(gv),locked=!!(G&&G.g);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(L,gy);ctx.lineTo(R,gy);ctx.stroke();ctx.setLineDash([]);
   const lab=(locked?'Your gut: ':'Your guess: ')+cents(gv),ls=12*kk,lw2=tw(ctx,lab,ls,700)+6;
   const hit=(x0,y0)=>boxes.some(b=>!(x0+lw2<b[0]||x0>b[2]||y0+ls*1.1<b[1]||y0>b[3]));
   const opts=[[L+2,gy-6-ls],[R-lw2-2,gy-6-ls],[L+2,gy+5],[R-lw2-2,gy+5],[L+(R-L-lw2)/2,gy-6-ls],[L+(R-L-lw2)/2,gy+5]].filter(o=>o[1]>T-30&&o[1]+ls<B);
   const at=opts.find(o=>!hit(o[0],o[1]))||opts[0]||[L+2,gy-6-ls];
   htxt(ctx,lab,at[0]+3,at[1]+ls*0.9,{s:ls,w:700,c:PAL['s4']});}},
 narrate(sim){const m=model(sim),pl=P(sim);
  if(!shown(sim))return `MIT priced six kinds of basic needs for <b>${hhName(sim).toLowerCase()}</b> in ${pl.name}. The minimum wage here is ${cents(pl.min)} an hour. <b>Lock in your guess</b> to see what one full year of basics costs.`;
  const hrs=m.lw*40/m.min,extra=m.marg>0?` That includes a ${sim.p.margin}% margin for the unexpected.`:'';
  if(sim.p.view==='world'&&atLeast('honors'))return `Divide each living wage by the local minimum wage and the currency drops out. <b>Here, ${HHL[sim.p.hh].l.toLowerCase()} needs ${f2(m.lw/m.min)} times the minimum wage.</b> Rural Ecuador’s is 1.07 times, Dhaka’s 2.44 times, for workers the minimum actually covers. But 84% of jobs in Bangladesh are informal: <b>many workers earn less than the minimum</b>, on irregular days, without social security, so their gap to a living wage is bigger than the multiple shows.`;
  const big=m.lines.slice().sort((a,b)=>b.a-a.a)[0];
  return `The basics come to ${money(m.after)} a year, and taxes add ${money(m.tax)}.${extra} Split over ${m.earners} earner${m.earners>1?'s':''} and 2,080 hours, that is <b>${cents(m.lw)} an hour</b>. The biggest line is ${big.l.toLowerCase()}. At ${cents(m.min)}, ${m.earners>1?'each earner':'the earner'} would need <b>${f1(hrs)} hours a week</b>${hrs>84?', more than 12 hours a day, every day':''}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'One adult and one child live in Arapahoe County, where Aurora is. What hourly wage, at one full-time job, covers their basic needs with no outside help? Drag the slider here to your guess, then lock it in.',
   honors:'What hourly wage does each earner in this household need to cover the basics, working full time? Drag the slider here to your guess, then lock it in.'},
  lockLabel:'Lock in my guess',
  lock(sim){const v=lw(sim);return {v:Math.abs(sim.p.guess-v),guess:sim.p.guess,label:cents(sim.p.guess)+' an hour'};},
  solve(sim){const v=lw(sim);sim.p.guess=clamp(Math.round(v*2)/2,5,100);return {v:0,guess:v,label:cents(v)+' an hour ('+money(model(sim).gross)+' a year)'};},
  how:{bio:'The math builds a budget for one year: food, housing, child care, transportation, health care and other necessities. It adds the taxes on the pay that covers them. Then it divides by the hours one full-time job works in a year: 40 × 52 = 2,080.',
   honors:'Living wage = (basic-needs budget + taxes) ÷ earners ÷ 2,080. The budget lines come from public data: MIT uses the USDA low-cost food plan, HUD fair market rents and federal surveys of what families spend.',
   ap:'MIT sums the budget, then uses a tax model to find the pre-tax income whose take-home pay covers it. This tool keeps taxes at MIT’s share of income when you change a line: gross = budget ÷ (1 − tax share).'},
  compare(sim,g,m){const v=lw(sim),mn=P(sim).min,diff=v-g.guess,mo=Math.abs(diff)*HOURS/12,hrs=v*40/mn,gapMo=Math.max(0,(v-mn)*HOURS/12),earn=model(sim).earners;
   const tail=v>mn?` The minimum wage here is ${cents(mn)}: full time, that leaves each earner <b>${money(gapMo)} a month short</b>, or needing <b>${f1(hrs-40)} extra hours a week</b> (${f1(hrs)} in all${hrs>168?', more hours than a week has':''}).`:` Here the minimum wage of ${cents(mn)} already covers it.`;
   if(Math.abs(diff)<1)return `Your gut was right on: within ${cents(Math.abs(diff))} an hour of the model’s ${cents(v)}.`+tail;
   return `You guessed ${cents(g.guess)}; the budget says <b>${cents(v)} an hour</b>. ${diff>0?'Paid your guess, '+(earn>1?'each earner':'the earner')+' would come up':'Your guess is'} <b>${money(mo)} a month ${diff>0?'short':'over'}</b>${diff>0?'':' what the budget needs'}.`+tail;},
  again(sim){sim.peek=false;sim.p.place=Math.random()<0.5?'arap':'dal';sim.p.hh=HH[Math.floor(Math.random()*HH.length)].v;sim.p.guess=20;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'MIT’s budget for one adult and one child in Arapahoe County comes to $103,964 a year before taxes. What hourly wage is that for one full-time earner?',choices:['$8,664 an hour','$49.98 an hour','$41.48 an hour','$24.99 an hour'],correct:1,explain:'$103,964 ÷ 2,080 hours = $49.98. ($8,664 is the amount per month. $41.48 forgets the taxes: $86,287 ÷ 2,080. $24.99 splits it between two earners, but this household has one.)'},
  {lvl:'bio',instant:true,q:'Why does the calculator divide by 2,080?',choices:['40 hours a week × 52 weeks: one full-time job for a year','The number of working days in a year','It is the minimum wage in cents'],correct:0,explain:'40 × 52 = 2,080 hours. The living wage is the hourly pay that covers the year’s budget if you work full time, every week, with no overtime.'},
  {lvl:'bio',instant:true,q:'That parent earns Colorado’s minimum wage, $15.16 an hour. How many hours a week would it take to earn what $49.98 an hour pays in 40?',choices:['About 52 hours','About 92 hours','About 132 hours'],correct:2,explain:'$49.98 × 40 = $1,999 a week. $1,999 ÷ $15.16 ≈ 132 hours, which is 92 hours more than full time and more than 18 hours a day, every day.'},
  {lvl:'honors',instant:true,q:'Two adults, both working, with two children in Arapahoe County need $144,282 a year before taxes. What is each parent’s living wage?',choices:['$69.37 an hour','$34.68 an hour','$17.34 an hour'],correct:1,explain:'$144,282 ÷ 2 earners ÷ 2,080 hours = $34.68 each. $69.37 is what one earner would need to cover all of it. $17.34 divides by 4 people instead of 2 earners.'},
  {lvl:'honors',instant:true,q:'With two children in Arapahoe County, one earner needs $45.52 an hour and each of two earners needs $34.68. Why isn’t two earners’ wage simply half of $45.52?',choices:['With both parents working, the budget adds $36,208 of child care, and taxes rise too','Two earners always pay less tax','MIT made a rounding error'],correct:0,explain:'MIT assumes the second parent stays home in the one-earner household, so child care is $0. When both work, child care ($36,208) joins the budget and taxes rise from $10,111 to $23,505. The total grows from $94,680 to $144,282.'},
  {lvl:'honors',instant:true,q:'In Dhaka, the 2025 living wage is ৳30,459 a month and the garment minimum wage is ৳12,500. For a worker the minimum covers, what is the living wage as a multiple of the minimum?',choices:['About 0.41×','About 1.4×','About 2.4×','You need the exchange rate first'],correct:2,explain:'30,459 ÷ 12,500 ≈ 2.44. Both numbers are in taka, so the units cancel: a multiple needs no exchange rate. 0.41 is the ratio upside down.'},
  {lvl:'honors',instant:true,q:'In Bangladesh, 84% of employed people work in informal jobs (ILO, 2024). Dhaka’s living wage is 2.44 times the garment minimum. For a typical worker there, what does that multiple leave out?',choices:['Nothing: everyone earns at least the minimum','Many informal workers earn less than the minimum, on irregular days, so their gap to a living wage is bigger than 2.44×','Informal workers earn more, so the gap is smaller'],correct:1,explain:'A minimum wage protects the workers it actually covers. Informal jobs are, in the ILO’s words, “not covered by formal arrangements” in law or in practice, so many pay less than the minimum, with irregular days and no social security. That is why living wage researchers compare a living wage with prevailing wages, what workers are really paid, not only with the minimum.'},
  {lvl:'ap',instant:true,q:'Two adults, both working, two children, Arapahoe County. One budget line rises 10%. Which one raises each parent’s wage the most?',choices:['Housing ($25,109)','Child care ($36,208)','Food ($13,336)','They all raise it the same'],correct:1,explain:'The biggest line moves the total most. Child care +10% is $3,621 more a year; with taxes kept at 16.3% of income that is $4,325 before taxes, or about $1.04 an hour for each parent. Housing +10% adds about $0.72.'},
  {lvl:'ap',instant:true,q:'The Anker estimate for Dhaka: a basic but decent living costs ৳48,022 a month for a family of 4 with 1.58 full-time workers. What is the take-home (net) living wage?',choices:['৳12,006','৳30,394','৳48,022','৳75,875'],correct:1,explain:'48,022 ÷ 1.58 ≈ ৳30,394 take-home. Add payroll deductions and you reach the published gross living wage of ৳30,459. ৳12,006 divides by people, not workers; ৳75,875 multiplies.'},
  {lvl:'ap',instant:true,q:'Why does an Anker living wage divide by 1.58 workers while MIT divides by 1 or 2?',choices:['Anker uses the typical number of full-time-equivalent workers per family in that place; MIT picks a household type with whole earners','Anker counts children as workers','They are the same number written differently'],correct:0,explain:'Anker estimates how many full-time-equivalent workers a typical local family has (1.58 in Dhaka, 1.61 in rural Ecuador). MIT lets you choose a household with 1 or 2 full-time earners. Both are modeling choices.'}
 ],
 tour:[
  {title:'Pick a household',text:'A living wage is built for one household in one place. Start with one adult and one child in Arapahoe County, where Aurora is. One adult works full time.',pause:true,focus:[[0,0,480,70]],setup:sim=>{sim.peek=true;BioLab.setValues(sim,{place:'arap',hh:'1a1',guess:20,view:'budget',pct:0,margin:0});}},
  {title:'Price each basic need',text:'Each bar is one year of one basic need. Housing is $25,109 and child care $19,448. MIT prices them from public data: a low-cost food plan, local rents, local child care prices.',pause:true,focus:[[0,80,480,280]]},
  {title:'Add it up, then add taxes',text:'The basics come to $86,287 a year. But a paycheck is taxed, so the pay has to cover the taxes too: $17,677. Before taxes, she needs $103,964.',pause:true,focus:[[0,300,480,90]]},
  {title:'Divide by the hours',text:'One full-time job is 40 hours × 52 weeks = 2,080 hours a year. $103,964 ÷ 1 earner ÷ 2,080 = $49.98 an hour.',pause:true,focus:[[0,400,800,50]]},
  {title:'Compare',text:'Colorado’s minimum wage is $15.16. At that pay she would come up $6,036 a month short. Earning $103,964 would take about 132 hours of work a week.',pause:true,focus:[[490,50,310,350]]},
  {lvl:'honors',title:'Two earners split the bill',text:'Two adults, both working, two children: $144,282 ÷ 2 earners ÷ 2,080 = $34.68 each. Child care is now the biggest line, because nobody is home with the kids.',pause:true,setup:sim=>BioLab.setValues(sim,{hh:'2a2w2'})},
  {lvl:'honors',title:'Around the world',text:'Divide a living wage by the local minimum wage and the currency cancels. Rural Ecuador’s living wage is 1.07 times its minimum; Dhaka’s is 2.44 times; Vietnam’s Region 1, 1.87 times. That is for workers the minimum covers. In Bangladesh 84% of jobs are informal (ILO, 2024), so many people earn less than the minimum and the real gap is bigger.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'world'})},
  {lvl:'ap',title:'Which assumption matters?',text:'Back to the family of four. Make child care 10% more expensive and each parent’s wage rises about $1.04 an hour; housing +10% adds about $0.72. The biggest lines carry the most weight.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'budget',cat:'care',pct:10})}
 ],
 lab:{bio:'<p><b>Question:</b> Which basic need costs this household the most, and how much of the hourly wage does it explain?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Read each budget line. Divide the biggest one by 2,080.</li><li>Divide the whole pre-tax total by 2,080 and check it against the living wage.</li></ol><p>Write one sentence: what share of the living wage pays for that one need?</p>',
  honors:'<p><b>Question:</b> How does the living wage change with the household and the place?</p><ol><li>For each household type, record a trial in Arapahoe County, then in Dallas County.</li><li>Compare <b>Living wage ÷ minimum wage</b> for the two places.</li><li>Switch the picture to <b>Around the world</b> and compare the multiples.</li></ol><p>Explain why a multiple can be compared across currencies but a wage cannot.</p>',
  ap:'<p><b>Question:</b> Which modeling choice moves the living wage most?</p><ol><li>Pick one household. For each budget line, set it to +10% and record the living wage.</li><li>Set the lines back to 0% and add margins of 0%, 5% and 10%.</li><li>Compare one line +10% with a 5% margin on everything.</li></ol><p><b>CER:</b> Claim which assumption a calculator most needs to get right, with evidence from your trials and reasoning about why.</p>'},
 terms:[
  {t:'Living wage',d:'The pay one full-time worker needs to cover a household’s basic needs in one place, with no outside help. It is an estimate built on stated assumptions.'},
  {t:'Basic-needs budget',d:'One year of the costs a calculator counts as basic: food, housing, child care, transportation, health care and other necessities.'},
  {t:'Full time',d:'40 hours a week for 52 weeks: 2,080 hours a year.'},
  {t:'Minimum wage',d:'The lowest hourly pay the law allows. Colorado’s was $15.16 in January 2026; Texas uses the federal $7.25.'},
  {t:'Poverty wage',d:'The federal poverty guideline for the household’s size, divided by 2,080 hours and the number of earners. It is a much lower bar than a living wage.',lvl:'honors'},
  {t:'Multiple',d:'One quantity divided by another in the same units, like living wage ÷ minimum wage. The units cancel, so it needs no exchange rate.',lvl:'honors'},
  {t:'Informal employment',d:'Work that, in law or in practice, is not covered by formal arrangements such as labor law and social security. Many informal workers earn less than the minimum wage. The ILO measures it as a share of all employed people.',lvl:'honors'},
  {t:'Prevailing wage',d:'What workers in a place and job are actually paid. Living wage researchers measure the gap between prevailing wages and the living wage.',lvl:'honors'},
  {t:'Exchange rate',d:'How many units of one currency buy one U.S. dollar on a given date. Converting with it adds a second estimate on top of the first.',lvl:'honors'},
  {t:'Sensitivity',d:'How much an output changes when one input changes. Here: the change in the hourly wage when one budget line rises 10%.',lvl:'ap'},
  {t:'Gross and net',d:'Gross pay is before taxes and payroll deductions; net (take-home) pay is after. A living wage must be gross enough that the net covers the budget.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not financial advice.</b> Living wage = (basic-needs budget + taxes) ÷ earners ÷ 2,080 hours. Every living wage is an estimate built on assumptions about which costs are basic and what quality of housing, food and care is decent. It is not a count of anything.</p>'+
  '<p><b>U.S. figures: MIT Living Wage Calculator</b> (Dr. Amy K. Glasmeier, MIT), 2026 estimates, county pages last updated February 15, 2026: <a href="https://livingwage.mit.edu/counties/08005" target="_blank" rel="noopener">Arapahoe County, CO</a> and <a href="https://livingwage.mit.edu/counties/48113" target="_blank" rel="noopener">Dallas County, TX</a>. Method: <a href="https://livingwage.mit.edu/pages/methodology" target="_blank" rel="noopener">MIT methodology</a>. MIT prices food with the USDA low-cost food plan, housing with HUD fair market rents, child care from the Department of Labor’s child care price data, and the other lines from federal spending surveys; then it finds the pre-tax income whose take-home pay covers the budget, and divides by working adults and 2,080 hours. It leaves out savings, eating out and vacations. “Other necessities” here combines MIT’s civic, internet and mobile, and other lines. MIT rounds each line to the dollar, so totals here can differ from MIT’s by $1 or $2; every hourly figure matches MIT’s to the cent. Minimum wages are as MIT lists them (state minimums as of January 2026: Colorado $15.16, Texas $7.25); a city can set a higher local minimum. Poverty wages are MIT’s, from the 2026 HHS poverty guidelines.</p>'+
  '<p><b>Changing a line (Deep dive).</b> MIT computes taxes with a full tax model. When you change a line or add a margin, this tool keeps taxes at the same share of pre-tax income as MIT’s figures for that household (for example 17.0% for one adult and one child in Arapahoe County). That is an assumption, not tax law. The margin control imitates the Anker method’s “small margin” for unexpected events; MIT adds none, and the size you set is your own choice.</p>'+
  '<p><b>Around the world: Global Living Wage Coalition benchmarks (Anker methodology),</b> 2025 estimates, gross per month, for the reference family of each place. The <a href="https://globallivingwage.org/about/anker-methodology/" target="_blank" rel="noopener">Anker methodology</a> (Richard and Martha Anker) costs a low-cost nutritious model diet with local prices, prices housing that meets decency standards by visiting local housing, adds other essentials and a small margin for unexpected events, scales to a typical local family, and divides by the typical number of full-time-equivalent workers per family. Taxes and payroll deductions are added to reach the gross wage.</p>'+
  '<ul><li>Rural Ecuador, coastal banana-growing region: US$503 a month (2025 update, Sept 2, 2025; family of 4, 1.61 workers): <a href="https://globallivingwage.org/living-wage-benchmarks/living-wage-for-rural-ecuador/" target="_blank" rel="noopener">GLWC</a>. Minimum: Ecuador’s 2025 basic unified wage, US$470 a month (<a href="https://www.trabajo.gob.ec/wp-content/uploads/2024/12/ACUERDO-MINISTERIAL-NRO.-MDT-2024-300-signed.pdf" target="_blank" rel="noopener">Acuerdo Ministerial MDT-2024-300</a>). Multiple: 1.07. Ecuador uses the U.S. dollar, so no conversion is needed. The 2026 minimum is $482 (used in <a href="#costofliving">Cost of living</a>); this tool pairs the 2025 benchmark with the 2025 minimum.</li>'+
  '<li>Rural Guatemala, central valley banana-growing region: Q3,859 a month (2025 update, Sept 7, 2025; family of 5, 1.53 workers): <a href="https://www.globallivingwage.org/living-wage-benchmarks/rural-guatemala/" target="_blank" rel="noopener">GLWC</a>. Minimum: 2025 agricultural minimum outside Guatemala department, Q3,436.86 a month plus the required Q250 incentive bonus, Q3,686.86 (Acuerdo Gubernativo 264-2024, as summarized by <a href="https://pwc.com/ia/es/publicaciones/Noticias-Tax-Legal/Tax-and-Legal-2024/Rectificacion-Salario-minimo-vigente-para-2025.pdf" target="_blank" rel="noopener">PwC</a>). Multiple: 1.05.</li>'+
  '<li>Dhaka, Bangladesh: ৳30,459 a month (2025 update, Nov 22, 2025; family of 4, 1.58 workers; cost of a basic but decent living ৳48,022): <a href="https://globallivingwage.org/living-wage-benchmarks/urban-bangladesh/" target="_blank" rel="noopener">GLWC</a>. Minimum: ready-made garment workers, ৳12,500 a month from Dec 1, 2023 (<a href="https://wageindicator.org/salary/minimum-wage/minimum-wages-news/2023/minimum-wage-increased-for-ready-made-garment-workers-in-bangladesh-from-01-december-2023-december-11-2023" target="_blank" rel="noopener">WageIndicator Foundation</a>). Multiple: 2.44.</li>'+
  '<li>Vietnam, Minimum Wage Region 1: ₫9,294,701 a month (2025 update, Oct 6, 2025; family of 4, 1.76 workers): <a href="https://globallivingwage.org/living-wage-benchmarks/living-wage-for-minimum-wage-region-1-vietnam/" target="_blank" rel="noopener">GLWC</a>. Minimum: Region 1, ₫4,960,000 a month from July 1, 2024 (Decree 74/2024/NĐ-CP, as summarized by <a href="https://crowe.com/vn/news/increases-in-regional-minimum-wages" target="_blank" rel="noopener">Crowe Vietnam</a>). Multiple: 1.87.</li></ul>'+
  '<p><b>Who the minimum wage covers.</b> A living wage ÷ minimum wage multiple describes a worker the minimum actually covers. Where most work is informal, many workers earn less than the minimum, work irregular days and have no social security, so the gap between a living wage and real earnings can be far bigger than the multiple shows. The ILO describes informal activities as those that, in law or in practice, are “not covered by formal arrangements” (<a href="https://ilostat.ilo.org/topics/informality/" target="_blank" rel="noopener">ILOSTAT</a>). That is why the Anker manual measures “the gap between prevailing wages and the living wage” (<a href="https://globallivingwage.org/announcements/anker-methodology-for-estimating-living-wages-published/" target="_blank" rel="noopener">GLWC</a>), not only the gap to the minimum. Share of employed people in informal employment (ILO data for SDG indicator 8.3.1, 13th ICLS definition, from the UN SDG Global Database): Ecuador 68.45% in 2025 (<a href="https://unstats.un.org/sdgapi/v1/sdg/Series/Data?seriesCode=SL_ISV_IFEM&amp;areaCode=218&amp;pageSize=500" target="_blank" rel="noopener">data</a>), Guatemala 75.93% in 2024 (<a href="https://unstats.un.org/sdgapi/v1/sdg/Series/Data?seriesCode=SL_ISV_IFEM&amp;areaCode=320&amp;pageSize=500" target="_blank" rel="noopener">data</a>), Bangladesh 84.04% in 2024 (<a href="https://unstats.un.org/sdgapi/v1/sdg/Series/Data?seriesCode=SL_ISV_IFEM&amp;areaCode=50&amp;pageSize=500" target="_blank" rel="noopener">data</a>), Vietnam 67.03% in 2024 (<a href="https://unstats.un.org/sdgapi/v1/sdg/Series/Data?seriesCode=SL_ISV_IFEM&amp;areaCode=704&amp;pageSize=500" target="_blank" rel="noopener">data</a>). In the United States few workers earn exactly the minimum: in 2024, 1.0% of workers paid by the hour earned the federal $7.25 or less (82,000 at exactly $7.25 and 760,000 below it), so most low-wage workers are paid somewhat more than the minimum but can still fall short of a living wage (<a href="https://www.bls.gov/opub/reports/minimum-wage/2024" target="_blank" rel="noopener">BLS, Characteristics of minimum wage workers, 2024</a>).</p>'+
  '<p><b>Exchange rates.</b> U.S. dollar amounts for Guatemala, Bangladesh and Vietnam use the rate implied by the U.S. dollar figure GLWC shows on each 2025 benchmark page: about Q7.69 (Sept 2025), ৳122.8 (Nov 2025) and ₫26,100 (Oct 2025) per U.S. dollar. Rates move every day, so the multiples of the minimum wage, which need no conversion, are the safer comparison. Monthly minimums leave out annual bonuses (such as Ecuador’s 13th and 14th month pay). Comparing an MIT household with an Anker reference family is itself a choice: they differ in family size, number of workers and what counts as basic.</p>'+
  '<p><b>The just wage.</b> Catholic social teaching has long asked what a fair wage must cover. Pope Leo XIII wrote that wages “ought not to be insufficient to support a frugal and well-behaved wage-earner” (<a href="https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html" target="_blank" rel="noopener"><i>Rerum Novarum</i></a>, 1891, §45). Pope John Paul II described a family wage as “remuneration which will suffice for establishing and properly maintaining a family” (<a href="https://www.vatican.va/content/john-paul-ii/en/encyclicals/documents/hf_jp-ii_enc_14091981_laborem-exercens.html" target="_blank" rel="noopener"><i>Laborem Exercens</i></a>, 1981, §19). What a wage <i>should</i> be is a question of values, and this tool does not score it or take a position on minimum-wage laws. The math question, what wage a given budget requires, has an answer.</p>'+
  '<p><b>See also:</b> <a href="#costofliving">Cost of living</a> compares what a basket of goods costs in hours of work in Quito, Dallas and Aurora. This tool builds the calculator itself.</p>'
};
BioLab.register(SIM);

function drawWorld(sim,ctx,k){const rows=worldRows(sim),kk=Math.min(k,1.8),compact=kk>1.25,W=800;
 txt(ctx,'Living wage ÷ minimum wage, for workers the minimum covers',16,28,{s:14*kk,w:700});
 const top=64,bot=compact?398:404,rh=(bot-top)/rows.length,f1s=Math.min(13*kk,rh*(compact?0.42:0.25)),f2s=compact?12*kk:12;
 const lab=r=>r.l+' ('+r.yr+')';
 const x0=16+Math.max(...rows.map(r=>Math.max(tw(ctx,lab(r),f1s,700),compact?tw(ctx,r.infS,f2s,400):Math.max(tw(ctx,r.sub,f2s,400),tw(ctx,r.inf,f2s,400)))))+16,x1=W-16-tw(ctx,'6.58×',13*kk,700)-8;
 const mx=Math.max(3,Math.ceil(Math.max(...rows.map(r=>r.mult))));const X=v=>x0+v/mx*(x1-x0);
 /* 1x line */
 ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(X(1),top-6);ctx.lineTo(X(1),bot+(compact?2:0));ctx.stroke();ctx.setLineDash([]);
 if(compact)htxt(ctx,'1× = minimum wage',X(1)+6,bot+12*kk,{s:12*kk,w:700,c:PAL['s4']});else htxt(ctx,'1× = minimum wage',X(1)+6,top-10,{s:12*kk,w:700,c:PAL['s4']});
 rows.forEach((r,i)=>{const y=top+rh*(i+.5);
  if(compact){txt(ctx,lab(r),16,y-f2s*0.55,{s:f1s,w:700,b:'middle'});txt(ctx,r.infS,16,y+f1s*0.55,{s:f2s,c:PAL['cv-soft'],b:'middle'});}
  else{txt(ctx,lab(r),16,y-15,{s:f1s,w:700,b:'middle'});txt(ctx,r.sub,16,y+1,{s:f2s,c:PAL['cv-soft'],b:'middle'});txt(ctx,r.inf,16,y+16,{s:f2s,c:PAL['cv-soft'],b:'middle'});}
  ctx.fillStyle=r.us?(r.on?PAL['rj']:PAL['s2']):PAL['s3'];ctx.fillRect(x0,y-rh*0.26,X(r.mult)-x0,rh*0.52);
  txt(ctx,f2(r.mult)+'×',X(r.mult)+8,y,{s:13*kk,w:700,b:'middle'});});
 if(!compact)txt(ctx,'Where most jobs are informal, many workers earn less than the minimum: the real gap can be far bigger.',16,442,{s:12*kk,c:PAL['cv-soft']});}
})();
