(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Club hoodie order: 120 hoodies in five sizes, chosen by chest measurement (an illustrative unisex chart).
   Chest sizes are modeled as normal (default mean 39 in, SD 4 in). The expected count in each size is 120 × the area of its slice. */
const N=120,PRICE=30;
const SIZES=['S','M','L','XL','2XL'],CUT=[37,41,45,49];
const RANGE=['under 37 in','37 to 41 in','41 to 45 in','45 to 49 in','49 in and up'];
const PLANS={even:[24,24,24,24,24],ml:[20,40,40,15,5],hill:[30,45,30,12,3],big:[10,30,40,30,10]};
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2));
const probs=sim=>{const m=sim.p.mu,s=sim.p.sd,c=[-Infinity,...CUT,Infinity];return SIZES.map((_,i)=>(c[i+1]===Infinity?1:Phi((c[i+1]-m)/s))-(c[i]===-Infinity?0:Phi((c[i]-m)/s)));};
const expd=sim=>probs(sim).map(p=>N*p);
/* Round the expected counts so they add to 120: floor each, then give the leftovers to the largest remainders. */
function mathPlan(sim){const e=expd(sim),f=e.map(Math.floor);let r=N-f.reduce((a,b)=>a+b,0);e.map((v,i)=>[v-f[i],i]).sort((a,b)=>b[0]-a[0]).slice(0,r).forEach(x=>f[x[1]]++);return f;}
const plan=sim=>sim.st&&sim.st.math?mathPlan(sim):PLANS[sim.p.plan];
/* Members who cannot get their size, if the club's sizes follow the model exactly: the total shortfall across sizes. */
const shortBy=(sim,pl)=>expd(sim).map((e,i)=>Math.max(0,e-pl[i]));
const wrong=(sim,pl)=>shortBy(sim,pl).reduce((a,b)=>a+b,0);
const about=v=>v<0.5?'fewer than 1':String(Math.round(v));
const f1=v=>fmtNum(v,1),g1=v=>String(+v.toFixed(1));
const TOUR=sim=>!!(sim.tour&&sim.tour.on);
const GS=sim=>TOUR(sim)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const C0=24,C1=56,XL0=60,XR0=770,X=c=>XL0+(c-C0)/(C1-C0)*(XR0-XL0);
const BASE=226;
const SCOL=['s2','s3','s4','s1','s5'];

const SIM={
 id:'hoodies',hash:'hoodies',apUnit:13,order:4,tab:'How many of each size?',kind:'Simulation',
 card:'Pick a hoodie order for your club by feel, then let the normal curve split the 120 hoodies by size.',
 title:'How many hoodies of each size?',
 lede:{bio:'Your club is ordering 120 hoodies, and you have to say how many of each size before anyone tries one on. Chest sizes pile up near the middle and thin out toward the edges. The bell curve tells you how fast.',
  honors:'A normal model with mean μ and standard deviation σ gives the share of members in each size range as an area under the curve. Standardize each cut point with z = (x − μ)/σ to read the area from a table.',
  ap:'The share in a size range [a, b] is normalcdf(a, b, μ, σ). Multiplying by 120 gives the expected count; rounding those so they add to 120 leaves the fewest members without their size.'},
 scale:'Chest measurement in inches. Size chart (illustrative): S under 37, M 37 to 41, L 41 to 45, XL 45 to 49, 2XL 49 and up.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your order',
 controls:[
  {id:'plan',label:'Your order (S, M, L, XL, 2XL)',type:'seg',def:'even',onChange:sim=>{if(sim.st)sim.st.math=false;clearGut(sim);},options:[
   {v:'even',l:'The same of every size: 24, 24, 24, 24, 24'},
   {v:'ml',l:'Mostly M and L: 20, 40, 40, 15, 5'},
   {v:'hill',l:'Most in M, fewer each way: 30, 45, 30, 12, 3'},
   {v:'big',l:'Size up, hoodies run small: 10, 30, 40, 30, 10'}]},
  {id:'show',label:'Show the bell curve',type:'toggle',def:false,noGut:true},
  {id:'mu',label:'Average chest size in your club',type:'range',min:35,max:43,step:0.5,def:39,unit:' in',lvl:'honors',noGut:true,onChange:clearGut,help:'An illustrative value. A club with more younger students would have a smaller average.'},
  {id:'sd',label:'Standard deviation of chest sizes',type:'range',min:2.5,max:6,step:0.5,def:4,unit:' in',lvl:'honors',noGut:true,onChange:clearGut}
 ],
 actions:[{id:'model',label:'Use the normal model’s order',lvl:'honors',run(sim){sim.st.math=true;BioLab.setValues(sim,{show:true});}}],
 init(){return {math:false};},step(){},
 metrics:[
  {id:'wrong',label:'Members without their size',unit:'of 120',d:1,min:0,max:120,get:sim=>shown(sim)?wrong(sim,plan(sim)):null},
  {id:'waste',label:'Spent on hoodies in the wrong size',unit:'$',d:0,min:0,max:null,get:sim=>shown(sim)?PRICE*wrong(sim,plan(sim)):null},
  {id:'in1',label:'Members within 1 SD of the average',unit:'of 120',d:1,min:0,max:120,get:sim=>shown(sim)?N*(Phi(1)-Phi(-1)):null},
  {id:'eS',label:'Model count: S',unit:'',d:1,lvl:'honors',min:0,max:120,get:sim=>expd(sim)[0]},
  {id:'eM',label:'Model count: M',unit:'',d:1,lvl:'honors',min:0,max:120,get:sim=>expd(sim)[1]},
  {id:'eL',label:'Model count: L',unit:'',d:1,lvl:'honors',min:0,max:120,get:sim=>expd(sim)[2]},
  {id:'eXL',label:'Model count: XL',unit:'',d:1,lvl:'honors',min:0,max:120,get:sim=>expd(sim)[3]},
  {id:'e2X',label:'Model count: 2XL',unit:'',d:1,lvl:'honors',min:0,max:120,get:sim=>expd(sim)[4]},
  {id:'zcut',label:'z-scores of the cut points',text:true,lvl:'ap',get:sim=>CUT.map(c=>`${c} in: z = ${fmtNum((c-sim.p.mu)/sim.p.sd,2)}`).join(' · ')}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),hon=atLeast('honors'),kk=k,m=sim.p.mu,s=sim.p.sd,pl=plan(sim),e=expd(sim),G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const edges=[C0,...CUT,C1],H=150,yv=c=>BASE-H*Math.exp(-0.5*((c-m)/s)**2);
  /* size bands */
  for(let i=0;i<5;i++){const x0=X(edges[i]),x1=X(edges[i+1]);ctx.fillStyle=PAL[SCOL[i]];ctx.globalAlpha=.08;ctx.fillRect(x0,40,x1-x0,BASE-40);ctx.globalAlpha=1;
   txt(ctx,SIZES[i],(x0+x1)/2,58,{s:15*kk,w:700,c:PAL[SCOL[i]],a:'center'});}
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;CUT.forEach(c=>{ctx.beginPath();ctx.moveTo(X(c),40);ctx.lineTo(X(c),BASE);ctx.stroke();});
  /* axis */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(XL0,BASE);ctx.lineTo(XR0,BASE);ctx.stroke();
  for(let c=C0;c<=C1;c+=2){const x=X(c);ctx.beginPath();ctx.moveTo(x,BASE);ctx.lineTo(x,BASE+5);ctx.stroke();if(c%4===0||kk<1.3)txt(ctx,String(c),x,BASE+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'Chest measurement (inches)',400,BASE+34*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  if(sh){/* the curve, shaded by size */
   for(let i=0;i<5;i++){const a=Math.max(edges[i],C0),b=Math.min(edges[i+1],C1);ctx.fillStyle=PAL[SCOL[i]];ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(X(a),BASE);for(let c=a;c<=b+1e-9;c+=0.1)ctx.lineTo(X(c),yv(c));ctx.lineTo(X(b),BASE);ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2.5;ctx.beginPath();for(let c=C0;c<=C1+1e-9;c+=0.1){c<C0+0.05?ctx.moveTo(X(c),yv(c)):ctx.lineTo(X(c),yv(c));}ctx.stroke();
   /* expected count in each size */
   for(let i=0;i<5;i++){const a=edges[i],b=edges[i+1],cx=(X(a)+X(b))/2;txt(ctx,f1(e[i]),cx,82*kk,{s:13*kk,w:700,c:PAL['cv-ink'],a:'center'});}
   txt(ctx,'expected',X(C0)+6,82*kk,{s:12*kk,c:PAL['cv-soft']});
   /* 68 and 95 brackets */
   const br=(lo,hi,y,lab)=>{if(X(lo)<XL0||X(hi)>XR0)return;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(lo),y-5);ctx.lineTo(X(lo),y);ctx.lineTo(X(hi),y);ctx.lineTo(X(hi),y-5);ctx.stroke();txt(ctx,lab,X(m),y-5,{s:12*kk,w:700,a:'center',c:PAL['cv-ink']});};
   br(m-s,m+s,BASE-H*0.3,`68%: ${g1(m-s)} to ${g1(m+s)} in`);br(m-2*s,m+2*s,BASE-H*0.08,`95%: ${g1(m-2*s)} to ${g1(m+2*s)} in`);}
  else{txt(ctx,'How are chest sizes spread out in your club?',400,130,{s:15*kk,w:700,a:'center',c:PAL['cv-soft']});txt(ctx,'Lock in your order to see the curve.',400,130+22*kk,{s:13*kk,a:'center',c:PAL['cv-soft']});}
  /* the order, as bars */
  const top=BASE+48*kk,bot=430-14*kk,bh=bot-top,mx=Math.max(60,...pl,...(sh?e:[0])),gw=140;
  txt(ctx,G&&G.m&&sim.st.math?'The math’s order':(sim.st.math?'The normal model’s order':'Your order'),20,top+2,{s:13*kk,w:700,c:PAL['rj']});
  for(let i=0;i<5;i++){const cx=60+gw*i+gw/2+40,w=34,h=bh*pl[i]/mx;
   ctx.fillStyle=PAL['rj'];ctx.fillRect(cx-w-2,bot-h,w,h);txt(ctx,String(pl[i]),cx-w/2-2,bot-h-4,{s:12*kk,w:700,c:PAL['rj'],a:'center'});
   if(sh){const he=bh*e[i]/mx;ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([4,3]);ctx.lineWidth=1.5;ctx.strokeRect(cx+2,bot-he,w,he);ctx.setLineDash([]);txt(ctx,f1(e[i]),cx+2+w/2,bot-he-4,{s:12*kk,c:PAL['cv-soft'],a:'center'});
    const sh2=e[i]-pl[i];if(sh2>0.5&&kk<1.3)txt(ctx,`${Math.round(sh2)} short`,cx,bot+30*kk,{s:12*kk,w:700,c:PAL['s1'],a:'center'});}
   txt(ctx,SIZES[i],cx,bot+15*kk,{s:13*kk,w:700,c:PAL[SCOL[i]],a:'center'});}
  if(sh)txt(ctx,'dashed: what the curve expects',780,top+2,{s:12*kk,c:PAL['cv-soft'],a:'right'});
  if(sh)pill(ctx,`${about(wrong(sim,pl))} without their size`,800-110*kk,110*kk,PAL['s1'],'#fff',13*kk);},
 narrate(sim){const m=sim.p.mu,s=sim.p.sd,pl=plan(sim),e=expd(sim),w=wrong(sim,pl);
  if(!shown(sim))return `Chest sizes in your club average about ${f1(m)} in, and a typical student is within about ${f1(s)} in of that. <b>How many of 120 fall in each size?</b> Pick an order that feels right.`;
  const sb=shortBy(sim,pl),worst=sb.indexOf(Math.max(...sb));
  if(w<1)return `<b>This order matches the curve.</b> Each size gets 120 × its share of the area: ${SIZES.map((z,i)=>z+' '+pl[i]).join(', ')}. Fewer than 1 member is left without a size.`;
  return `If the club follows the curve, about <b>${about(w)} members can’t get their size</b>, mostly in ${SIZES[worst]}: the curve expects ${f1(e[worst])} and you ordered ${pl[worst]}. Sizes near the middle hold most of the area.`;},
 gut:{better:'lower',controls:['plan'],lockLabel:'Lock in my order',
  ask:{bio:'You have 120 hoodies to split across five sizes. Pick the order here that you think fits your club best. Then lock it in.',
   honors:'Before you see the curve: pick the order here that you think fits your club best. Then lock it in.'},
  lock(sim){const pl=plan(sim),w=wrong(sim,pl);return {v:w,pl:pl.slice(),label:`${pl.join(', ')} (about ${about(w)} members without their size)`};},
  solve(sim){sim.st.math=true;sim.p.show=true;const pl=mathPlan(sim),w=wrong(sim,pl);return {v:w,pl,label:`${pl.join(', ')} (${about(w)} without their size)`};},
  how:{bio:'The math draws the bell curve of chest sizes and cuts it at the size-chart lines. Each slice’s share of the area is the share of members in that size, so 120 × that share is how many hoodies to order.',
   honors:'For each size, standardize its cut points with z = (x − μ)/σ, read the area between them from a z-table, and multiply by 120. Round so the counts add to 120.',
   ap:'Count for a size = 120 × normalcdf(a, b, μ, σ). Rounding to the largest remainders keeps the total at 120 and leaves the smallest shortfall.'},
  compare(sim,g,m){const d=g.v-m.v;
   if(d<0.5)return `Your gut was right on: your order matches the curve to within a hoodie. That is the normal model at work in your head: most people near the middle, fewer toward the edges.`;
   const sb=g.pl.map((c,i)=>Math.max(0,expd(sim)[i]-c)),wi=sb.indexOf(Math.max(...sb));
   return `With your order, about <b>${about(g.v)} members can’t get their size</b> (the biggest gap is ${SIZES[wi]}: ${Math.round(sb[wi])} short). With the curve’s order, ${about(m.v)}. That is about <b>${Math.round(d)} more people in a hoodie that fits</b>, and about <b>$${Math.round(d*PRICE)}</b> not spent on wrong sizes at $${PRICE} a hoodie.`;},
  again(sim){sim.p.mu=37+0.5*Math.floor(Math.random()*9);sim.p.sd=3+0.5*Math.floor(Math.random()*5);const L=Object.keys(PLANS);sim.p.plan=L[Math.floor(Math.random()*L.length)];sim.p.show=false;sim.st.math=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Chest sizes in your club average 39 in with a typical spread of 4 in. About what share of members have a chest between 35 and 43 in?',choices:['About 34%','About 50%','About 68%','About 95%'],correct:2,explain:'35 to 43 in is within one standard deviation (4 in) of the average. For a bell-shaped distribution that holds about 68% of the values: about 82 of your 120 members.'},
  {lvl:'bio',instant:true,q:'Why does ordering 24 of every size go badly?',choices:['Sizes near the middle (M and S here) hold far more members than the edges','Nobody wears 2XL','It does not add up to 120'],correct:0,explain:'The curve expects about 46 mediums and 37 smalls but fewer than 1 member in 2XL. With 24 of each, about 40 members can’t get their size, while about 17 extra XL and 23 extra 2XL hoodies go unused.'},
  {lvl:'honors',instant:true,q:'With mean 39 in and SD 4 in, what is the z-score of the M/L cut point, 41 in?',choices:['0.5','1','2','−0.5'],correct:0,explain:'z = (41 − 39)/4 = 0.5. The cut points 37, 41, 45 and 49 in sit at z = −0.5, 0.5, 1.5 and 2.5.'},
  {lvl:'honors',instant:true,q:'The area under the standard normal curve between z = −0.5 and z = 0.5 is 0.383. How many mediums should you order?',choices:['About 38','About 46','About 60','About 82'],correct:1,explain:'0.383 × 120 ≈ 46 mediums. (38 is the percent, not the count; 82 is the one-SD share, 68% of 120.)'},
  {lvl:'ap',instant:true,q:'Which command gives the share of members who need a 2XL (49 in and up) when μ = 39 and σ = 4?',choices:['normalcdf(49, 1E99, 39, 4) ≈ 0.006','normalcdf(−1E99, 49, 39, 4) ≈ 0.994','normalpdf(49, 39, 4)','invNorm(0.49, 39, 4)'],correct:0,explain:'The share at or above 49 in is the area to the right: normalcdf(49, 1E99, 39, 4) ≈ 0.0062, so 120 × 0.0062 ≈ 0.7: order about 1.'},
  {lvl:'ap',instant:true,q:'The club adds more freshmen, and the average chest size drops to 37 in with the same SD. Which size gains the most hoodies?',choices:['S','M','L','XL'],correct:0,explain:'With μ = 37, everything below 37 in is now half the curve: 120 × 0.5 = 60 smalls, up from about 37. Mediums go from about 46 to 41, and larges from 29 to 16.'}
 ],
 tour:[
  {title:'The order',text:'Your club needs 120 hoodies in five sizes. The size chart sorts people by chest measurement: S under 37 in, M 37 to 41, L 41 to 45, XL 45 to 49, 2XL 49 and up.',pause:true,setup:sim=>{sim.st.math=false;BioLab.setValues(sim,{plan:'even',show:false,mu:39,sd:4});},focus:[[50,36,730,220]]},
  {title:'Your plan',text:'The red bars are an order with the same number of each size: 24 S, 24 M, 24 L, 24 XL and 24 2XL. Is that how a club is built?',pause:true,focus:[[10,250,780,200]]},
  {title:'The bell curve',text:'Chest sizes in a big group pile up near the average and thin out toward both edges, in a bell shape. In this model the average is 39 in and the typical spread (standard deviation) is 4 in.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'The 68-95-99.7 rule',text:'About 68% of members are within 1 SD of the average: 35 to 43 in. About 95% are within 2 SD: 31 to 47 in. About 99.7% are within 3 SD: 27 to 51 in. So very few people need a 2XL, at 49 in and up.',pause:true},
  {title:'Area is a share of people',text:'The area of each slice is the share of members in that size. The M slice holds 38.3% of the area, and 0.383 × 120 ≈ 46, so the curve expects about 46 mediums.',pause:true,focus:[[X(37)-4,40,X(41)-X(37)+8,190]]},
  {title:'The curve’s order',text:'Do that for every size: about 37 S, 46 M, 29 L, 7 XL and 1 2XL, which adds to 120. The even order leaves about 40 members without their size. The curve’s order leaves fewer than 1.',pause:true,setup:sim=>{sim.st.math=true;BioLab.setValues(sim,{show:true});}},
  {lvl:'honors',title:'z-scores of the cut points',text:'Standardize each cut point: z = (x − 39)/4. The cuts at 37, 41, 45 and 49 in become z = −0.5, 0.5, 1.5 and 2.5. A z-table gives the area between them: 0.309, 0.383, 0.242, 0.061 and 0.006.',pause:true},
  {lvl:'ap',title:'normalcdf',text:'On a calculator: normalcdf(37, 41, 39, 4) ≈ 0.383 for M, normalcdf(−1E99, 37, 39, 4) ≈ 0.309 for S, and normalcdf(49, 1E99, 39, 4) ≈ 0.006 for 2XL. Each times 120 gives the count.',pause:true}
 ],
 onTourExit(sim){if(sim.st)sim.st.math=false;},
 lab:{bio:'<p><b>Question:</b> Which order leaves the fewest members without their size?</p><ol><li>Turn on <b>Show the bell curve</b>.</li><li>Try each of the four orders and record a trial for each.</li><li>For the best one, note which size is still short.</li></ol><p>Write one sentence: why do sizes near the middle need the most hoodies?</p>',
  honors:'<p><b>Question:</b> How does the best order change when the club changes?</p><ol><li>Press <b>Use the normal model’s order</b> and record the five model counts.</li><li>Change the average chest size to 37 and then 41 in, and record the counts again.</li><li>Return to 39 in and change the SD to 3 and then 5 in.</li></ol><p>Explain how the center and the spread each change the order.</p>',
  ap:'<p><b>Question:</b> Can you reproduce the model counts by hand?</p><ol><li>Write the z-score of each cut point from the readout.</li><li>Use normalcdf to find each size’s share, and multiply by 120.</li><li>Round so the counts add to 120, then compare with <b>Use the normal model’s order</b>.</li></ol><p><b>CER:</b> Claim whether a normal model is reasonable for chest sizes in a club, and explain what a real club’s sizes might do differently.</p>'},
 terms:[
  {t:'Normal distribution',d:'A bell-shaped, symmetric distribution. Most values sit near the mean, and fewer appear farther out.'},
  {t:'Standard deviation',d:'A typical distance from the mean. In a normal model, about 68% of values are within 1 SD of the mean.'},
  {t:'68-95-99.7 rule',d:'In a normal distribution, about 68%, 95% and 99.7% of values fall within 1, 2 and 3 SD of the mean.'},
  {t:'Area under the curve',d:'The share of the group in a range of values. The whole curve has area 1, or 100%.'},
  {t:'z-score',d:'z = (x − μ)/σ: how many SDs a value is from the mean.',lvl:'honors'},
  {t:'normalcdf',d:'normalcdf(lower, upper, μ, σ): the area under a normal curve between two values.',lvl:'ap'}
 ],
 about:'<p>The chest sizes are a normal model with mean 39 in and standard deviation 4 in. Those values are <b>illustrative</b>, not measured: a real club depends on its members’ ages and builds. The size chart (S under 37 in, M 37 to 41, L 41 to 45, XL 45 to 49, 2XL 49 and up) is also illustrative; real brands differ, and some people pick a size for fit, not chest size.</p><p><b>Members without their size</b> assumes the club’s sizes follow the model exactly, so the count in each size is 120 × its area. For each size, any members beyond the hoodies you ordered are counted as short. A real club of 120 will scatter around these counts by a few people in each size, so even the best order may leave a few people swapping. Real teen chest sizes also tend to skew toward the larger end, so a real club often needs more XL and 2XL than this normal model says. The $30 price per hoodie is an assumption for illustration.</p>'
};
BioLab.register(SIM);
})();
