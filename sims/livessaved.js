(function(){
'use strict';
const {clamp,rng,txt,pill,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* ---------- the model ----------
   Estimated lives saved = deaths in a counterfactual world (no vaccine) − deaths in the world we have.
   Three ways to build the counterfactual:
   1. Before and after: (pre-vaccine deaths a year × today's population ÷ 1960 population − deaths observed now) × (1 − share that would have fallen anyway).
   2. Static: people who meet the disease × coverage × effectiveness × risk of infection with no vaccine × deaths per infection. Direct protection only.
   3. Transmission (dynamic): an SIR final-size model run twice, with no vaccine and with the vaccine, deaths subtracted.
      Same math as HealthLab's herd tool: protected share q = coverage × effectiveness, s0 = 1 − q, i0 = 1/N,
      and the share still susceptible at the end, s∞, solves ln(s0/s∞) = R0(s0 + i0 − s∞). Infected share = s0 − s∞.
   Measles, U.S., per year: CDC's pre-vaccine figures (3 to 4 million infected, 400 to 500 deaths a year), scaled from the
   1960 census population to the Census Bureau's 2025 estimate. Deaths per infection = deaths ÷ infections. */
const CDC={D0:450,I0:3.5e6,obs:4};
const POP60=179323175,POPNOW=341.8e6,RATIO=POPNOW/POP60;
const PRE={measles:{r0:15,ve:97,cov:92.4},covid:{r0:3,ve:60,cov:70,cfr:50,pop:100000},own:{r0:2,ve:70,cov:50,cfr:10,pop:100000}};
/* share of the whole group infected, from the final-size equation (bisection, as in herd.js) */
function fsz(r0,s0,i0){if(s0<=0)return 0;let lo=1e-300,hi=s0;
 for(let i=0;i<200;i++){const m=(lo+hi)/2;if(Math.log(s0/m)-r0*(s0+i0-m)>0)lo=m;else hi=m;}
 return Math.max(0,s0-(lo+hi)/2);}
const CASE=sim=>atLeast('ap')?(sim.p.case||'measles'):'measles';
function prm(sim){const c=CASE(sim),h=atLeast('honors'),o={c,r0:h?sim.p.r0:15,ve:h?sim.p.ve:97,cov:h?sim.p.cov:92.4};
 if(c==='measles'){o.D0=CDC.D0;o.I0=CDC.I0;}else{o.cfr=sim.p.cfr;o.pop=sim.p.pop;}return o;}
function model(o){const ve=o.ve/100,cov=o.cov/100,q=cov*ve,me=o.c==='measles';
 const N=me?o.I0*RATIO:o.pop,ifr=me?o.D0/o.I0:o.cfr/1e4;
 const a0=fsz(o.r0,1,1/N),A=fsz(o.r0,1-q,1/N),cf=N*a0*ifr,act=N*A*ifr,m2=N*cov*ve*a0*ifr,m3=cf-act;
 return {N,ifr,a0,A,q,cf,act,m2,m3,herd:m3-m2,re:o.r0*(1-q),thr:ve>0?100*(1-1/o.r0)/ve:Infinity,cf1:me?o.D0*RATIO:null};}
let memo={};
function M(sim){const o=prm(sim),k=JSON.stringify(o);if(!memo[k]){if(Object.keys(memo).length>300)memo={};memo[k]=model(o);}return memo[k];}
const M1=sim=>{const m=M(sim);return m.cf1===null?null:(1-sim.p.f/100)*(m.cf1-CDC.obs);};
/* the ranges each uncertain input is drawn from (Deep dive) */
function ranges(sim){const o=prm(sim);
 if(o.c==='measles')return [
  {k:'D0',l:'Deaths a year before the vaccine',s:'Deaths before',lo:400,hi:500,fmt:v=>n0(v),src:'CDC: 400 to 500'},
  {k:'I0',l:'People infected a year before the vaccine',s:'Infections before',lo:3e6,hi:4e6,fmt:v=>(v/1e6).toFixed(1)+' million',src:'CDC: 3 to 4 million'},
  {k:'r0',l:'R₀',s:'R₀',lo:12,hi:18,fmt:v=>f1(v),src:'textbook range'},
  {k:'ve',l:'Vaccine effectiveness',s:'Effectiveness',lo:95,hi:99,fmt:v=>f1(v)+'%',src:'assumption around the textbook 97%'}];
 if(o.c==='covid')return [
  {k:'r0',l:'R₀',s:'R₀',lo:2,hi:4,fmt:v=>f1(v),src:'illustrative'},
  {k:'ve',l:'Vaccine effectiveness',s:'Effectiveness',lo:40,hi:80,fmt:v=>f1(v)+'%',src:'illustrative'},
  {k:'cfr',l:'Deaths per 10,000 infections',s:'Deaths per infection',lo:20,hi:100,fmt:v=>f1(v),src:'illustrative'}];
 return [
  {k:'r0',l:'R₀',s:'R₀',lo:Math.max(1,o.r0*0.75),hi:o.r0*1.25,fmt:v=>f1(v),src:'your value ± 25%'},
  {k:'ve',l:'Vaccine effectiveness',s:'Effectiveness',lo:o.ve*0.75,hi:Math.min(100,o.ve*1.25),fmt:v=>f1(v)+'%',src:'your value ± 25%'},
  {k:'cfr',l:'Deaths per 10,000 infections',s:'Deaths per infection',lo:o.cfr*0.75,hi:o.cfr*1.25,fmt:v=>f1(v),src:'your value ± 25%'}];}
function tornado(sim){const o=prm(sim),base=model(o).m3;return {base,rows:ranges(sim).map(r=>{const a=model(Object.assign({},o,{[r.k]:r.lo})).m3,b=model(Object.assign({},o,{[r.k]:r.hi})).m3;return Object.assign({},r,{a,b,sw:Math.abs(b-a)});})};}
function runMC(sim){const o=prm(sim),R=rng(20261107),rs=ranges(sim),v=[];
 for(let i=0;i<1000;i++){const p=Object.assign({},o);rs.forEach(r=>{p[r.k]=r.lo+(r.hi-r.lo)*R();});v.push(model(p).m3);}
 v.sort((a,b)=>a-b);const q=p=>v[Math.round(p*(v.length-1))];return {key:JSON.stringify(o),v,lo:q(0.025),med:q(0.5),hi:q(0.975)};}
const MC=sim=>{const s=sim.st&&sim.st.mc;return s&&s.key===JSON.stringify(prm(sim))?s:null;};
/* ---------- display helpers ---------- */
const n0=v=>Math.round(v).toLocaleString('en-US');
const f1=v=>(Math.round(v*10)/10).toFixed(1);
const f2=v=>(Math.round(v*100)/100).toFixed(2);
const pct=v=>f1(v)+'%';
/* Estimates stay hidden while the student works out the before-and-after number ("Your turn"). */
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.gutS&&sim.gutS.g&&!pending(sim))||(sim.tour&&sim.tour.on));

const hid=(sim,v)=>shown(sim)?v:null;
const GS=sim=>sim.gutS&&sim.gutS.g?sim.gutS.g:null;
const per=sim=>CASE(sim)==='measles'?'a year in the U.S.':'in '+n0(sim.p.pop)+' people';
const perS=sim=>CASE(sim)==='measles'?'a year':'in '+n0(sim.p.pop)+' people';
function clearGut(sim){if(BioLab.gutClear)BioLab.gutClear(sim);}
const COL={1:'s2',2:'s5',3:'s3'};
/* text on a background-colored patch, so the gut line never cuts through it */
function tb(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x0-2,y-o.s*0.85,w+4,o.s*1.15);txt(ctx,s,x,y,o);}
const NAME={1:'Before and after',2:'Static model',3:'Transmission model'},SHORT={1:'Before/after',2:'Static',3:'Transmission'};
function niceUp(v){if(!(v>0))return 10;const p=Math.pow(10,Math.floor(Math.log10(v))),r=v/p;return (r<=1?1:r<=2?2:r<=2.5?2.5:r<=5?5:10)*p;}
/* controls that only make sense for one case are hidden for the others; the gut slider is relabeled */
function vis(sim){const W=sim.ui&&sim.ui.ctlW;if(!W)return;const c=CASE(sim),h=atLeast('ap');
 if(W.f)W.f.hidden=c!=='measles';
 ['cfr','pop'].forEach(id=>{if(W[id])W[id].hidden=!h||c==='measles';});
 const L=W.guess&&W.guess.querySelector('label');if(L)L.textContent=c==='measles'?'Your estimate: lives saved a year in the U.S.':'Your estimate: lives saved in these '+n0(sim.p.pop)+' people';}
function setCase(sim){const c=sim.p.case;BioLab.setValues(sim,Object.assign({},PRE[c]));clearGut(sim);vis(sim);
 if(c!=='measles'&&sim.gMetric==='drop'&&sim.ui&&sim.ui.gm){sim.gMetric='covc';sim.ui.gm.value='covc';}}

const SIM={
 id:'livessaved',hash:'livessaved',apUnit:20,order:3,tab:'Estimating lives saved',kind:'Simulation',
 skills:{bio:'Proportional scaling and subtraction · Algebra 1 (Unit 2)',honors:'Proportions, products of rates and an SIR model run twice · Algebra 1 (Unit 2)',ap:'Monte Carlo ranges and sensitivity analysis · Algebra 1 (Unit 2), Statistics'},
 card:'Guess how many lives the measles vaccine saves each year, then build the world without it three ways and see why every answer is an estimate.',
 title:'Lives saved: an estimate, not a count',
 lede:{bio:'Headlines say vaccines have saved millions of lives. But no one can count deaths that didn’t happen. Every “lives saved” figure is an estimate: deaths in a world without the vaccine, which has to be modeled, minus deaths that really happened. So it depends on assumptions, and it comes with a range.',
  honors:'Estimated lives saved = counterfactual deaths − observed deaths. Before-and-after builds the counterfactual from old data. A static model multiplies people vaccinated × effectiveness × risk × death rate, so it counts only direct protection. A transmission model runs the disease with and without the vaccine, so it also counts the herd effect.',
  ap:'Each method is a model of a world that didn’t happen, so each input is uncertain. Draw the inputs from their ranges 1,000 times (a Monte Carlo analysis) and the estimate becomes an interval. A sensitivity analysis shows which assumption moves it most.'},
 scale:{bio:'Measles in the U.S., estimated per year. Before the vaccine: 179.3 million Americans (1960 census). Now: 341.8 million (Census Bureau estimate, July 2025).',
  ap:'Measles: estimated U.S. lives saved per year. COVID-19 and your own illness: one epidemic wave in a population you choose (up to 100,000 people).'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your estimate',
 controls:[
  {id:'guess',label:'Your estimate: lives saved a year in the U.S.',type:'range',min:0,max:2000,step:5,def:200,unit:' lives'},
  {id:'f',label:'Share of the drop in deaths that would have happened anyway',type:'range',min:0,max:90,step:5,def:0,unit:'%',noGut:true,help:'Better nutrition and medical care also cut deaths after 1963. Before-and-after can’t measure this, so you have to assume a share. It changes only estimate 1.'},
  {id:'reveal',label:'Show the estimates now',type:'toggle',def:false,noGut:true,help:'Normally the estimates appear once you lock in your gut answer.'},
  {id:'case',label:'Illness',type:'seg',def:'measles',lvl:'ap',noGut:true,onChange:setCase,options:[{v:'measles',l:'Measles, U.S.'},{v:'covid',l:'COVID-19 (teaching model)'},{v:'own',l:'Your own illness'}],help:'COVID-19 uses illustrative numbers. For your own illness, set every slider yourself: flu, COVID-19 with numbers from a source, or a made-up disease. Your numbers stay in this browser tab.'},
  {id:'r0',label:'How contagious: R₀ (people one case infects if no one is immune)',type:'range',min:1,max:20,step:0.5,def:15,lvl:'honors',noGut:true,onChange:clearGut,help:'Measles: 12 to 18 is the commonly cited textbook range.'},
  {id:'ve',label:'Vaccine effectiveness (share of vaccinated people protected from infection)',type:'range',min:0,max:100,step:1,def:97,unit:'%',lvl:'honors',noGut:true,onChange:clearGut,help:'Two doses of MMR: about 97% is the commonly cited textbook figure.'},
  {id:'cov',label:'Vaccination coverage',type:'range',min:0,max:100,step:0.1,def:92.4,unit:'%',lvl:'honors',noGut:true,onChange:clearGut,help:'Measles: 92.4% of U.S. kindergartners had MMR vaccine in 2025–26 (CDC).'},
  {id:'cfr',label:'Deaths per 10,000 infections',type:'range',min:0.1,max:200,step:0.1,def:50,d:1,lvl:'ap',noGut:true,onChange:clearGut,help:'50 per 10,000 is 0.5%. A death rate per infection, not per reported case.'},
  {id:'pop',label:'Population',type:'range',min:1000,max:100000,step:1000,def:100000,unit:' people',lvl:'ap',noGut:true,onChange:sim=>{clearGut(sim);vis(sim);}}
 ],
 actions:[{id:'mc',label:'Run 1,000 what-if worlds',lvl:'ap',run(sim){sim.st.mc=runMC(sim);sim.p.reveal=true;if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.reveal)sim.ui.ctl.reveal.set(true);}}],
 init(){return {mc:null};},step(){},
 onLevel(sim){vis(sim);},
 metrics:[
  {id:'m1',label:'Estimate 1, before and after: lives saved',unit:'lives',d:0,min:0,max:null,get:sim=>hid(sim,M1(sim))},
  {id:'m2',label:'Estimate 2, static model: lives saved',unit:'lives',d:0,lvl:'honors',min:0,max:null,get:sim=>hid(sim,M(sim).m2)},
  {id:'m3',label:'Estimate 3, transmission model: lives saved',unit:'lives',d:0,min:0,max:null,get:sim=>hid(sim,M(sim).m3)},
  {id:'cf',label:'Deaths in the no-vaccine world (model)',unit:'deaths',d:0,min:0,max:null,get:sim=>hid(sim,M(sim).cf)},
  {id:'act',label:'Deaths in the with-vaccine world (model)',unit:'deaths',d:0,min:0,max:null,get:sim=>hid(sim,M(sim).act)},
  {id:'herd',label:'Extra lives from the herd effect (3 − 2)',unit:'lives',d:0,lvl:'honors',min:0,max:null,get:sim=>hid(sim,M(sim).herd)},
  {id:'re',label:'Each case infects, with the vaccine (Rₑ)',unit:'people',d:2,lvl:'honors',min:0,max:20,get:sim=>M(sim).re},
  {id:'lo',label:'Estimate 3, low end of the 95% range',unit:'lives',d:0,lvl:'ap',min:0,max:null,get:sim=>{const s=MC(sim);return s?s.lo:null;}},
  {id:'hi',label:'Estimate 3, high end of the 95% range',unit:'lives',d:0,lvl:'ap',min:0,max:null,get:sim=>{const s=MC(sim);return s?s.hi:null;}},
  {id:'top',label:'The assumption that moves estimate 3 most',text:true,lvl:'ap',get:sim=>{if(!shown(sim))return 'Lock in your gut answer to see this.';const t=tornado(sim),r=t.rows.slice().sort((a,b)=>b.sw-a.sw)[0];return `${r.l} (${r.src}): ${n0(Math.min(r.a,r.b))} to ${n0(Math.max(r.a,r.b))} lives`;}}
 ],
 graphs:[{id:'drop',label:'Estimate 1 vs. how much would have happened anyway',custom:true},
  {id:'covc',label:'Estimates 2 and 3 vs. coverage',lvl:'honors',custom:true},
  {id:'mc',label:'1,000 what-if worlds (Monte Carlo)',lvl:'ap',custom:true},
  {id:'tor',label:'Which assumption moves estimate 3 most',lvl:'ap',custom:true}],
 defaultGraph:'drop',
 plot(sim,ctx,box,id){const W=box.cw,H=box.ch,msg=s=>txt(ctx,s,W/2,H/2,{s:15,c:PAL['muted'],a:'center',b:'middle'});
  if(!shown(sim)){msg(pending(sim)?'Work out estimate 1 first.':'Lock in your gut answer to see the graph.');return;}
  const m=M(sim),G=GS(sim),b=Object.assign({},box,{T:34,H:box.H-22});
  if(id==='drop'){if(CASE(sim)!=='measles'){txt(ctx,'Before-and-after needs years of data from before a vaccine.',W/2,H/2-10,{s:14,c:PAL['muted'],a:'center'});txt(ctx,'Pick Measles, U.S., or plot estimates 2 and 3.',W/2,H/2+12,{s:14,c:PAL['muted'],a:'center'});return;}
   const top=niceUp(Math.max(m.cf1,G?G.guess:0)*1.05),ax=axes(ctx,b,{xmin:0,xmax:90,ymin:0,ymax:top,xl:'Share of the drop that would have happened anyway (%)',yl:'Estimated lives saved a year'});
   ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(m.cf1-CDC.obs));ctx.lineTo(ax.X(90),ax.Y(0.1*(m.cf1-CDC.obs)));ctx.stroke();
   ctx.strokeStyle=PAL['s3'];ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(m.m3));ctx.lineTo(ax.X(90),ax.Y(m.m3));ctx.stroke();
   const it=[{label:'1: Before and after',color:PAL['s2']},{label:'3: Transmission model',color:PAL['s3']}];
   if(G){ctx.strokeStyle=PAL['s4'];ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(G.guess));ctx.lineTo(ax.X(90),ax.Y(G.guess));ctx.stroke();ctx.setLineDash([]);it.push({label:'Your gut',color:PAL['s4'],dash:true});}
   ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(ax.X(sim.p.f),ax.Y(M1(sim)),6,0,7);ctx.fill();
   legend(ctx,box.L,14,it);return;}
  if(id==='covc'){const o=prm(sim),k='c'+JSON.stringify(Object.assign({},o,{cov:0}));sim._cc=sim._cc||{};
   if(!sim._cc[k]){const pts=[];for(let c=0;c<=100;c+=1){const r=model(Object.assign({},o,{cov:c}));pts.push([c,r.m2,r.m3]);}sim._cc={[k]:pts};}
   const pts=sim._cc[k],top=niceUp(Math.max(m.cf,G?G.guess:0)*1.05),ax=axes(ctx,b,{xmin:0,xmax:100,ymin:0,ymax:top,xl:'Vaccination coverage (%)',yl:'Estimated lives saved'});
   [[1,'s5'],[2,'s3']].forEach(([j,cl])=>{ctx.strokeStyle=PAL[cl];ctx.lineWidth=2.5;ctx.beginPath();pts.forEach((p,i)=>{i?ctx.lineTo(ax.X(p[0]),ax.Y(p[j])):ctx.moveTo(ax.X(p[0]),ax.Y(p[j]));});ctx.stroke();});
   if(m.thr<=100){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(ax.X(m.thr),b.T);ctx.lineTo(ax.X(m.thr),b.T+b.H);ctx.stroke();ctx.setLineDash([]);txt(ctx,'Herd threshold '+pct(m.thr),ax.X(m.thr)-6,b.T+14,{s:12,w:700,c:PAL['s3'],a:'right'});}
   [[m.m2,'s5'],[m.m3,'s3']].forEach(([v,cl])=>{ctx.fillStyle=PAL[cl];ctx.beginPath();ctx.arc(ax.X(prm(sim).cov),ax.Y(v),5.5,0,7);ctx.fill();});
   legend(ctx,box.L,14,[{label:'2: Static model',color:PAL['s5']},{label:'3: Transmission model',color:PAL['s3']}]);return;}
  if(id==='mc'){const s=MC(sim);if(!s){msg('Press “Run 1,000 what-if worlds” to see the spread.');return;}
   const lo=s.v[0],hi=s.v[s.v.length-1],span=Math.max(hi-lo,1e-9),nb=30,cnt=new Array(nb).fill(0);s.v.forEach(x=>{cnt[Math.min(nb-1,Math.floor((x-lo)/span*nb))]++;});
   const ax=axes(ctx,b,{xmin:lo,xmax:hi,ymin:0,ymax:Math.max(...cnt)*1.15,xl:'Estimate 3: lives saved',yl:'Runs out of 1,000'});
   cnt.forEach((c,i)=>{const x0=ax.X(lo+i*span/nb),x1=ax.X(lo+(i+1)*span/nb),mid=lo+(i+0.5)*span/nb;ctx.fillStyle=PAL[mid>=s.lo&&mid<=s.hi?'s3':'cv-soft'];ctx.globalAlpha=.8;ctx.fillRect(x0+1,ax.Y(c),Math.max(1,x1-x0-2),ax.Y(0)-ax.Y(c));ctx.globalAlpha=1;});
   [[s.lo,'2.5%'],[s.hi,'97.5%']].forEach(([v])=>{ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(ax.X(v),b.T);ctx.lineTo(ax.X(v),b.T+b.H);ctx.stroke();ctx.setLineDash([]);});
   txt(ctx,`95% of runs: ${n0(s.lo)} to ${n0(s.hi)} (middle ${n0(s.med)})`,box.L,16,{s:13,w:700,c:PAL['fg']});return;}
  if(id==='tor'){const t=tornado(sim),rs=t.rows,all=[t.base].concat(...rs.map(r=>[r.a,r.b])),mn=Math.min(...all),mx=Math.max(...all),pad=Math.max((mx-mn)*0.15,1);
   const ax=axes(ctx,b,{xmin:0,xmax:rs.length,ymin:Math.max(0,mn-pad),ymax:mx+pad,xcats:rs.map(r=>r.s),yl:'Estimate 3: lives saved'});
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(b.L,ax.Y(t.base));ctx.lineTo(b.L+b.W,ax.Y(t.base));ctx.stroke();ctx.setLineDash([]);
   rs.forEach((r,i)=>{const x0=ax.X(i+0.2),x1=ax.X(i+0.8),y0=ax.Y(Math.max(r.a,r.b)),y1=ax.Y(Math.min(r.a,r.b));ctx.fillStyle=PAL['s3'];ctx.fillRect(x0,y0,x1-x0,Math.max(2,y1-y0));
    txt(ctx,n0(Math.max(r.a,r.b)),(x0+x1)/2,y0-5,{s:12,w:600,c:PAL['fg'],a:'center'});txt(ctx,n0(Math.min(r.a,r.b)),(x0+x1)/2,y1+14,{s:12,w:600,c:PAL['fg'],a:'center'});});
   txt(ctx,'Each bar: one input across its range. Dashed: your settings ('+n0(t.base)+')',box.L,16,{s:13,c:PAL['muted']});}},
 draw(sim,ctx,vdt,k){const big=k>1.3,c=CASE(sim),m=M(sim),sh=shown(sim),G=GS(sim),hon=atLeast('honors'),mc=atLeast('ap')?MC(sim):null;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const title=c==='measles'?(big?'Measles, U.S., per year':'Measles in the U.S., per year'):c==='covid'?(big?'COVID-19 teaching model':'COVID-19 teaching model: one wave'):(big?'Your own illness':'Your own illness: one outbreak');
  txt(ctx,title,20,26*k,{s:14*k,w:700});
  txt(ctx,big?'Saved = no-vaccine deaths − real deaths':'Estimated lives saved = deaths in a world without the vaccine − deaths in the world we have',20,46*k,{s:12*k,c:PAL['cv-soft']});
  const L=big?250:262,R=772-(big?50:46),AX=450-52*k,y0=58*k+10,rows=hon?[1,2,3]:[1,3],rh=(AX-10-y0)/rows.length,bh=Math.min(20,14*k);
  if(!big){/* legend: outline = no-vaccine deaths, fill = estimate */
   const lx=560,ly=26*k-4;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.strokeRect(lx,ly-6,18,10);txt(ctx,'No-vaccine deaths',lx+24,ly+4,{s:12*k,c:PAL['cv-soft']});}
  const v1=M1(sim),vals={1:v1,2:m.m2,3:m.m3},cfs={1:m.cf1,2:m.cf,3:m.cf};
  const top=niceUp(Math.max(m.cf,m.cf1||0,G?G.guess:0,mc?mc.hi:0)*1.04),X=v=>L+clamp(v/top,0,1.02)*(R-L);
  if(G){const gx=X(G.guess);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(gx,y0-2);ctx.lineTo(gx,AX);ctx.stroke();ctx.setLineDash([]);}
  rows.forEach((j,i)=>{const ry=y0+i*rh,cy=ry+rh*0.42,col=PAL[COL[j]];
   txt(ctx,(big?j+' '+SHORT[j]:j+'. '+NAME[j]),20,cy+5*k-(big?0:8),{s:13*k,w:700,c:col});
   if(!big)txt(ctx,j===1?'Old death rate × today’s population':j===2?'Counts only people vaccinated':'Runs the disease twice and subtracts',20,cy+14,{s:12*k,c:PAL['cv-soft']});
   if(!sh)return;
   const v=vals[j];
   if(v===null){txt(ctx,big?'Not possible here':'Not possible here: no years of data from before a vaccine',L,cy+5,{s:12*k,c:PAL['cv-soft']});return;}
   /* outline: deaths in the no-vaccine world; fill: the estimate */
   ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(L,cy-bh/2,X(cfs[j])-L,bh);
   ctx.fillStyle=col;ctx.fillRect(L,cy-bh/2,Math.max(1,X(v)-L),bh);
   const ps=13*Math.min(k,1.3),lab=n0(v);ctx.font='700 '+ps+'px '+FONT;const pw=ctx.measureText(lab).width+ps*1.1;
   const px=Math.max(X(cfs[j]),X(v))+pw/2+8;pill(ctx,lab,px,cy,col,'#fff',ps);
   if(!big){let s='';
    if(j===1)s=`(${n0(m.cf1)} − ${CDC.obs} counted now) × (1 − ${n0(sim.p.f)}% anyway) ≈ ${n0(v)}`;
    else if(j===2)s=`${c==='measles'?(m.N/1e6).toFixed(2)+' million':n0(m.N)} × ${pct(prm(sim).cov)} × ${n0(prm(sim).ve)}% × ${n0(m.a0*100)}% risk × ${m.ifr*1e4<10?f2(m.ifr*1e4):f1(m.ifr*1e4)} per 10,000 ≈ ${n0(v)}`;
    else s=`${n0(m.cf)} deaths with no vaccine − ${n0(m.act)} with it ≈ ${n0(v)}`;
    tb(ctx,s,L,cy+bh/2+16,{s:12*k,c:PAL['cv-soft']});}
   if(j===3&&mc){const wy=cy-bh/2-9;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(mc.lo),wy);ctx.lineTo(X(mc.hi),wy);[mc.lo,mc.hi].forEach(x=>{ctx.moveTo(X(x),wy-5);ctx.lineTo(X(x),wy+5);});ctx.stroke();
    if(!big)tb(ctx,`95% of 1,000 runs: ${n0(mc.lo)} to ${n0(mc.hi)}`,X(mc.hi),wy-8,{s:12*k,w:700,c:PAL['cv-ink'],a:'right'});}});
  if(!sh){txt(ctx,'?',(L+R)/2,(y0+AX)/2,{s:40*k,w:700,c:PAL['cv-soft'],a:'center'});txt(ctx,G?(big?'Work it out first.':'Work out estimate 1 first, then see the estimates.'):(big?'Lock in your gut.':'Lock in your gut answer to see the estimates.'),(L+R)/2,(y0+AX)/2+30*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  /* axis */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,AX);ctx.lineTo(R,AX);ctx.stroke();
  const nt=big?2:4;for(let t=0;t<=nt;t++){const v=top*t/nt,x=X(v);ctx.beginPath();ctx.moveTo(x,AX);ctx.lineTo(x,AX+5);ctx.stroke();txt(ctx,n0(v),x,AX+18*k,{s:12*k,c:PAL['cv-soft'],a:t===0?'left':t===nt?'right':'center'});}
  txt(ctx,c==='measles'?(big?'Lives saved a year':'Estimated lives saved a year (U.S.)'):(big?'Lives saved':'Estimated lives saved in '+n0(sim.p.pop)+' people'),(L+R)/2,AX+38*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  /* the student's gut answer */
  if(G){const gx=X(G.guess);
   const right=gx>R-130*k;txt(ctx,(big?'Gut ':'Your gut: ')+n0(G.guess),gx+(right?-6:6),y0+8*k,{s:12*k,w:700,c:PAL['s4'],a:right?'right':'left'});}},
 narrate(sim){const c=CASE(sim),m=M(sim),o=prm(sim),hon=atLeast('honors');
  if(c==='measles'){
   if(!shown(sim))return 'Before the 1963 vaccine, CDC estimates 400 to 500 Americans died of measles each year. The country now has about 1.9 times as many people. <b>No one can count the deaths that didn’t happen, so how would you estimate them?</b>';
   const v1=M1(sim),f=sim.p.f;
   let s=`Before and after: about <b>${n0(v1)}</b> lives a year${f>0?`, if ${f}% of the drop would have happened anyway`:''}. Transmission model: about <b>${n0(m.m3)}</b>.`;
   if(hon)s+=` Static model: about <b>${n0(m.m2)}</b>; the ${n0(m.herd)} more in the transmission model are unvaccinated people who didn’t catch measles because it spread less.`;
   else s+=f===0?' Before-and-after gives the vaccine credit for the whole drop since 1963, as if nothing else had changed.':' <b>All of these are estimates of a world that didn’t happen</b>, so each depends on what it assumes.';
   if(m.thr<=o.cov+1e-9)s+=` At ${pct(o.cov)} coverage, each case infects ${f2(m.re)} others: fewer than 1, so spread stops.`;
   return s;}
  const nm=c==='covid'?'COVID-19 (teaching model)':'your illness';
  if(!shown(sim))return `With no vaccine, ${nm} would infect about ${pct(m.a0*100)} of these ${n0(o.pop)} people in one wave. <b>How many deaths would the vaccine prevent?</b>`;
  const thr=m.thr>100?'out of reach, even at 100% coverage':pct(m.thr);
  return `With no vaccine: about ${n0(m.cf)} deaths. With ${pct(o.cov)} coverage, each case infects ${f2(m.re)} others and the model gives about ${n0(m.act)}. <b>Static: ${n0(m.m2)}. Transmission: ${n0(m.m3)}.</b> The gap of ${n0(m.herd)} is the herd effect. The herd immunity threshold here is ${thr}.`;},
 infoPanel(sim){const c=CASE(sim);
  if(c==='covid')return `<p class="p-h"><b>COVID-19 teaching model</b></p><p style="font-size:14px">R₀ 3, 60% effective against infection, 70% coverage, 50 deaths per 10,000 infections: illustrative numbers, not any study’s inputs. Published estimates of COVID-19 deaths averted cover different places, years and kinds of deaths; they are listed with their methods in <b>About this model</b>.</p>`;
  if(c==='own')return `<p class="p-h"><b>Your own illness</b></p><p style="font-size:14px">Set R₀, effectiveness, coverage, deaths per 10,000 infections and the population. Your numbers stay in this browser tab: nothing is sent or saved.</p><p style="font-size:14px">Try it with values from a source your teacher gives you, or make up a disease. Then ask: which method gives the biggest number, and why?</p>`;
  return `<p class="p-h"><b>The numbers you need</b></p><ul style="font-size:14px;margin:0;padding-left:18px"><li>Measles deaths a year before the 1963 vaccine: about 450 (CDC: 400 to 500).</li><li>U.S. population: 179.3 million in 1960, 341.8 million in 2025.</li><li>Measles deaths counted in 2026: 4, as of November 5 (CDC).</li></ul><p style="font-size:13px;margin:6px 0 0">Sources and assumptions are in <b>About this model</b>.</p>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Before the 1963 vaccine, about 400 to 500 Americans died of measles each year (CDC). The country now has about 342 million people, 1.9 times as many as in 1960. Drag the slider here to your estimate of how many U.S. lives a year the measles vaccine saves now. Then lock it in.',
   honors:'Before you see the methods: drag the slider here to your estimate of the lives the vaccine saves for the illness named in the picture (measles in the U.S., to start). Then lock it in.'},
  hint:{bio:'Lock in your gut answer. Then you will work out the before-and-after estimate yourself from four numbers.'},
  lock(sim){const g=sim.p.guess,e=M(sim).m3;return {v:Math.abs(g-e),guess:g,label:`${n0(g)} lives ${perS(sim)}`};},
  solve(sim){const e=M(sim).m3;sim.p.guess=e;return {v:0,est:e,label:`about ${n0(e)} lives ${perS(sim)} (transmission model)`};},
  calc:{d:0,unit:'lives',tol:a=>Math.max(3,0.006*a),
   prompt(sim){const f=sim.p.f;
    if(CASE(sim)!=='measles'){const m=M(sim),o=prm(sim);return `Static model for these ${n0(o.pop)} people: coverage <b>${pct(o.cov)}</b>, effectiveness <b>${n0(o.ve)}%</b>, risk of infection with no vaccine <b>${pct(m.a0*100)}</b>, and <b>${f1(o.cfr)}</b> deaths per 10,000 infections. Multiply people × coverage × effectiveness × risk × deaths per infection. How many lives does it estimate are saved?`;}
    return `Before the vaccine, about <b>450</b> Americans died of measles each year, out of <b>179.3 million</b> people (1960). Today there are <b>341.8 million</b>. CDC counted <b>4</b> measles deaths in 2026 (as of November 5). Scale the old deaths to today’s population, then subtract the deaths that really happened.${f>0?` Then give the vaccine credit for only <b>${100-f}%</b> of that drop, since you set ${f}% to have happened anyway.`:''} About how many lives a year does the vaccine save?`;},
   answer(sim){return CASE(sim)==='measles'?M1(sim):M(sim).m2;},
   hint:'Divide today’s population by the 1960 population, multiply the old deaths by that, then subtract today’s deaths.',
   steps(sim){if(CASE(sim)!=='measles'){const m=M(sim),o=prm(sim);return [`${n0(o.pop)} × ${f1(o.cov/100*100)}% × ${n0(o.ve)}% × ${pct(m.a0*100)} × ${f1(o.cfr)} ÷ 10,000 ≈ <b>${n0(m.m2)}</b> lives.`,'It counts only the people the vaccine protected directly.'];}
    const m=M(sim),f=sim.p.f,d=m.cf1-CDC.obs,out=[`Population ratio: 341.8 ÷ 179.3 ≈ 1.906. There are about 1.9 times as many Americans now.`,`No-vaccine deaths today: 450 × 1.906 ≈ ${n0(m.cf1)} a year.`,`Subtract the deaths that really happened: ${n0(m.cf1)} − 4 ≈ ${f>0?n0(d):'<b>'+n0(d)+'</b>'} lives a year.`];
    if(f>0)out.push(`Keep ${100-f}% of it: ${n0(d)} × ${(1-f/100).toFixed(2)} ≈ <b>${n0(M1(sim))}</b> lives a year.`);
    return out;}},
  formula(sim){const m=M(sim),o=prm(sim),f=sim.p.f,hon=atLeast('honors');
   if(CASE(sim)!=='measles')return `Static: ${n0(o.pop)} × ${pct(o.cov)} × ${n0(o.ve)}% × ${pct(m.a0*100)} × ${f1(o.cfr)} per 10,000 ≈ ${n0(m.m2)}<br>Transmission: ${n0(m.cf)} − ${n0(m.act)} ≈ ${n0(m.m3)}`;
   return `Before and after: 450 × (341.8 ÷ 179.3) − 4 ≈ ${n0(m.cf1-CDC.obs)}${f>0?` × ${(1-f/100).toFixed(2)} ≈ ${n0(M1(sim))}`:''} lives a year`+(hon?`<br>Static: 6.67 million × ${pct(o.cov)} × ${n0(o.ve)}% × ${n0(m.a0*100)}% × 1.29 per 10,000 ≈ ${n0(m.m2)}`:'')+`<br>Transmission: ${n0(m.cf)} − ${n0(m.act)} ≈ ${n0(m.m3)} lives a year`;},
  how:{bio:'The math builds the world without a vaccine, two ways. Before and after: take the old death rate, scale it up to today’s population, and subtract the deaths CDC counts now. Transmission model: let measles spread through the people who would meet it each year, once with no vaccine and once with 92.4% vaccinated, and subtract the deaths. Neither is a count. Both are estimates.',
   honors:'Static model: people vaccinated × effectiveness × risk of infection × deaths per infection. Transmission model: run an SIR model with and without the vaccine and subtract the deaths. It also counts people protected because the disease spread less.',
   ap:'Transmission model: final size from ln(s₀/s∞) = R₀(s₀ + i₀ − s∞), with s₀ = 1 for no vaccine and s₀ = 1 − coverage × effectiveness with it. Deaths = people × (s₀ − s∞) × deaths per infection. Then draw the uncertain inputs 1,000 times for a range.'},
  compare(sim,g,mm){const m=M(sim),c=CASE(sim),e=m.m3,d=g.guess-e,hon=atLeast('honors'),u=perS(sim);
   const others=c==='measles'?` Before-and-after gives ${n0(M1(sim))}${hon?` and the static model ${n0(m.m2)}`:''}.`:` The static model gives ${n0(m.m2)}; before-and-after isn’t possible here.`;
   const tail=' Different methods, different numbers: each is an estimate of a world that didn’t happen.';
   if(Math.abs(d)<=Math.max(10,0.05*e))return `Your gut was right on: ${n0(g.guess)} against the transmission model’s ${n0(e)} lives ${u}. Your intuition already does this math.${others}${tail}`;
   let s=`Your estimate was <b>${n0(Math.abs(d))} lives ${u} ${d<0?'too low':'too high'}</b> next to the transmission model’s ${n0(e)}.${others}`;
   if(c==='measles'&&g.guess<=500)s+=` If you anchored on the old yearly count of about 450, remember there are about 1.9 times as many Americans now, so a world without the vaccine would have about ${n0(m.cf1)} measles deaths a year.`;
   return s+tail;},
  again(sim){sim.p.guess=200;sim.p.reveal=false;sim.p.f=0;
   if(atLeast('honors')){sim.p.case='measles';Object.assign(sim.p,PRE.measles);sim.p.f=[10,20,25,30,40][Math.floor(Math.random()*5)];}
   vis(sim);}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A made-up example: before a vaccine, an illness killed about 12 people a year in a county of 50,000. The county now has 80,000 people, and 1 person died of the illness last year. Using before and after, about how many lives a year does the vaccine save there?',answer:18.2,tol:0.3,unit:'lives',d:1,hint:'Scale 12 by 80,000 ÷ 50,000, then subtract the 1 death.',explain:'80,000 ÷ 50,000 = 1.6, so a world without the vaccine would have 12 × 1.6 = 19.2 deaths a year. Subtract the 1 that happened: about 18 lives a year.'},
  {lvl:'bio',instant:true,q:'Before-and-after gives the measles vaccine credit for the whole drop in deaths since 1963. What is the problem with that?',choices:['Nothing: the vaccine is the only thing that changed','Nutrition and medical care also improved, so some of the drop might have happened anyway','Measles deaths go up over time no matter what'],correct:1,explain:'Before-and-after can’t tell the vaccine apart from everything else that changed. If you assume 25% of the drop would have happened anyway, the estimate falls from 854 to about 640 lives a year. The data alone can’t tell you the right share: it is an assumption.'},
  {lvl:'bio',instant:true,q:'Why is every “lives saved” figure an estimate and not a count?',choices:['Hospitals lose their records','No one can count deaths that didn’t happen, so the world without the vaccine has to be modeled','The real numbers are kept secret'],correct:1,explain:'Estimated lives saved = deaths in a world without the vaccine − deaths that happened. The second part can be counted. The first part never happened, so it has to be built from assumptions, and different assumptions give different answers. That is why careful estimates come with a range.'},
  {lvl:'honors',instant:true,q:'Which method counts the people who were never vaccinated but didn’t catch measles because it spread less?',choices:['Before and after','Static model','Transmission model'],correct:2,explain:'The static model multiplies people vaccinated × effectiveness × risk × death rate, so it counts only direct protection. The transmission model lets the disease spread, so fewer cases among vaccinated people also means fewer among the unvaccinated: the herd effect. For U.S. measles at 92.4% coverage, that adds about 34 lives a year (769 → 803).'},
  {lvl:'honors',kind:'num',q:'Measles has R₀ = 15. Coverage is 92.4%, and the vaccine protects 97% of the people who get it. On average, how many people does each case infect? Round to two decimal places.',answer:1.56,tol:0.01,unit:'people',d:2,hint:'Protected share = coverage × effectiveness. Rₑ = R₀ × (1 − protected share).',explain:'0.924 × 0.97 = 0.896 protected, so Rₑ = 15 × 0.104 ≈ 1.56. Above 1, so in this evenly mixed model measles can still spread.'},
  {lvl:'honors',kind:'num',q:'For U.S. measles, the static model estimates about 769 lives saved a year and the transmission model about 803. How many lives a year come from the herd effect?',answer:34,tol:1,unit:'lives',d:0,hint:'Herd effect = transmission estimate − static estimate.',explain:'803 − 769 = 34 lives a year (34.1 before rounding). These are unvaccinated people who didn’t catch measles because it spread less.'},
  {lvl:'ap',instant:true,q:'COVID-19 teaching model: R₀ 3, 60% effective against infection, 70% coverage, 50 deaths per 10,000 infections, 100,000 people. The static model estimates about 198 lives saved. What does the transmission model estimate?',choices:['About 198, the same','About 265','About 470'],correct:1,explain:'With the vaccine, each case infects 3 × (1 − 0.7 × 0.6) = 1.74 others, so the wave is smaller for everyone. The transmission model gives about 265: about 67 more than the static model. That gap is a third of the static estimate, against about 4% for measles, because 58% of people here are still unprotected and less spread shields many of them. (470 is the deaths with no vaccine.)'},
  {lvl:'ap',instant:true,q:'You draw R₀, effectiveness and CDC’s figures at random from their ranges 1,000 times and rerun the measles model each time. What do the 1,000 answers tell you?',choices:['The exact number of lives saved','How much the estimate could vary given what we don’t know: a range like the ones published studies report','Nothing, because random numbers are meaningless'],correct:1,explain:'This is a Monte Carlo analysis. For U.S. measles, 95% of the 1,000 runs land between about 714 and 899 lives a year. Published estimates report ranges for the same reason: Watson et al. give 13.7 to 15.9 million around their 14.4 million.'},
  {lvl:'ap',instant:true,q:'In the measles transmission model, moving CDC’s infections from 3 million to 4 million a year doesn’t change the estimate at all. Why?',choices:['The model ignores infections','Infections cancel: more infections means a lower death rate per infection (deaths ÷ infections), so deaths come out the same','3 and 4 million are too close to matter'],correct:1,explain:'Deaths per infection = 450 ÷ infections, and the people meeting measles = infections × 1.906. Multiply them and infections cancel: 450 × 1.906 ≈ 858 deaths with no vaccine either way. The estimate rests on the deaths figure, and 400 to 500 deaths moves it from about 714 to about 892.'},
  {lvl:'ap',instant:true,q:'Which assumption moves the measles transmission estimate the most?',choices:['Deaths a year before the vaccine (400 to 500)','R₀ (12 to 18)','Effectiveness (95% to 99%)'],correct:0,explain:'Holding the others where they are: deaths before the vaccine moves the estimate from about 714 to 892 (a swing of 178), effectiveness from about 780 to 828 (49), and R₀ from about 825 to 790 (35). The inputs about deaths matter most, which is also where published COVID-19 estimates differ most.'}
 ],
 tour:[
  {title:'Two worlds',text:'Estimated lives saved = deaths in a world without the vaccine − deaths in the world we have. On each bar, the outline is the world without the vaccine and the filled part is the estimate. No one can count the first world, so each method builds it a different way.',pause:true,setup:sim=>BioLab.setValues(sim,{case:'measles',r0:15,ve:97,cov:92.4,f:0})},
  {title:'Method 1: before and after',text:'In 1960, about 450 measles deaths a year among 179.3 million people. Scale that to today’s 341.8 million: about 858 deaths a year. CDC counted 4 in 2026, as of November 5. Estimate: 858 − 4 ≈ 854 lives a year.',pause:true,focus:sim=>rowRect(sim,1)},
  {title:'The problem: other things changed',text:'Nutrition and medical care improved after 1963 too, and before-and-after can’t separate them from the vaccine. If 25% of the drop would have happened anyway, the estimate falls to about 640. The data can’t tell you the share, so it is an assumption.',pause:true,setup:sim=>BioLab.setValues(sim,{f:25}),focus:sim=>rowRect(sim,1)},
  {title:'Method 3: run the disease twice',text:'The transmission model takes the 6.7 million people a year who would meet measles for the first time (CDC’s 3.5 million, scaled to today). With no vaccine, nearly all catch it: about 858 deaths. With 92.4% vaccinated, each case infects about 1.56 others and the model gives about 55 deaths. Estimate: about 803.',pause:true,setup:sim=>BioLab.setValues(sim,{f:0}),focus:sim=>rowRect(sim,3)},
  {title:'Check the model against the data',text:'This simple model puts 55 deaths in the with-vaccine world, but CDC counted 4 in 2026. It assumes everyone mixes evenly in one season, and real people don’t. Real models are fitted to case counts. Every estimate is only as good as its assumptions.',pause:true,focus:sim=>rowRect(sim,3)},
  {lvl:'honors',title:'Method 2: the static model',text:'People vaccinated × effectiveness × risk of infection × deaths per infection: 6.67 million × 92.4% × 97% × 100% × 1.29 per 10,000 ≈ 769. It counts only people the vaccine protected directly.',pause:true,focus:sim=>rowRect(sim,2)},
  {lvl:'honors',title:'The herd effect',text:'Transmission minus static: about 34 lives a year. These are unvaccinated people who didn’t catch measles because it spread less. Coverage is below the threshold of 96.2%, so the herd effect is partial. At 97%, estimate 3 reaches about 858.',pause:true},
  {lvl:'ap',title:'A range, not a number',text:'Draw the uncertain inputs from their ranges 1,000 times: deaths before the vaccine 400 to 500, infections 3 to 4 million, R₀ 12 to 18, effectiveness 95% to 99%. 95% of the runs give about 714 to 899 lives a year. That is why published estimates come with intervals.',pause:true,setup:sim=>{sim.st.mc=runMC(sim);}}
 ],
 onTourExit(sim){vis(sim);},
 lab:{bio:'<p><b>Question:</b> How much does the before-and-after estimate depend on what you assume?</p><ol><li>Turn on <b>Show the estimates now</b>.</li><li>Record a trial with the share that would have happened anyway at 0%, 10%, 25% and 50%.</li><li>Graph <b>Trials</b> with that share on x and <b>Estimate 1</b> on y.</li></ol><p>Write one sentence: which estimate would you report, and what would you say about its assumption?</p>',
  honors:'<p><b>Question:</b> How big is the herd effect, and when does it matter most?</p><ol><li>For measles, record estimates 2 and 3 at coverage 50%, 80%, 90%, 92.4%, 95% and 97%.</li><li>Compute 3 − 2 for each. Where is the gap biggest?</li></ol><p>Explain why a static model always gives the smaller number.</p>',
  ap:'<p><b>Question:</b> How sure can anyone be about “lives saved”?</p><ol><li>Press <b>Run 1,000 what-if worlds</b> and record the 95% range.</li><li>Open the sensitivity graph. Which input swings estimate 3 most?</li><li>Pick the COVID-19 teaching model and repeat. Then use <b>Your own illness</b> to model a disease of your choice.</li><li>Compare with the published COVID-19 estimates: what does each one assume about which deaths count and what infections would have happened?</li></ol><p><b>CER:</b> Claim how wide an honest range is, with evidence from your runs and reasoning about which assumptions drive it.</p>'},
 terms:[
  {t:'Estimate',d:'A number worked out from a model and assumptions, not counted directly. Honest estimates say what they assume and give a range.'},
  {t:'Counterfactual',d:'What would have happened if something had been different: here, a world without the vaccine. It never happened, so it has to be modeled.'},
  {t:'Confounding',d:'When something else changes at the same time as the thing you are studying, so you can’t tell which one caused the result.'},
  {t:'Herd effect (indirect protection)',d:'Unvaccinated people are protected because the disease spreads less when many others are immune.',lvl:'honors'},
  {t:'Static model',d:'Estimates lives saved as people vaccinated × effectiveness × risk of infection × death rate. It ignores spread, so it counts only direct protection.',lvl:'honors'},
  {t:'Transmission (dynamic) model',d:'A model of how a disease spreads from person to person, run with and without the vaccine. It captures the herd effect.',lvl:'honors'},
  {t:'R₀ and Rₑ',d:'R₀: people one case infects where no one is immune. Rₑ: people one case infects given the immunity present, R₀ × (1 − share protected).',lvl:'honors'},
  {t:'Infection fatality rate',d:'Deaths per infection, counting infections that were never reported. A case fatality rate divides by reported cases instead.',lvl:'ap'},
  {t:'Excess deaths',d:'All deaths above the number expected in normal times. They include deaths never officially reported as caused by the disease.',lvl:'ap'},
  {t:'SIR model',d:'Splits people into Susceptible, Infected and Recovered and tracks how they move between the groups.',lvl:'ap'},
  {t:'Monte Carlo analysis',d:'Running a model many times with inputs drawn at random from their ranges, to see the spread of answers.',lvl:'ap'},
  {t:'Sensitivity analysis',d:'Changing one input at a time across its range to see which assumption moves the answer most.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Estimated lives saved = deaths in a world without the vaccine − deaths in the world we have. (1) Before and after: (pre-vaccine deaths a year × today’s population ÷ the 1960 population − deaths counted now) × (1 − the share of the drop you assume would have happened anyway). (2) Static: people who meet the disease × coverage × effectiveness × risk of infection with no vaccine × deaths per infection. (3) Transmission: the SIR final-size model from HealthLab’s <a href="https://rjedtech.github.io/Raider-HealthLab/#herd" target="_blank" rel="noopener">herd immunity tool</a>, run twice. Protected share q = coverage × effectiveness, s₀ = 1 − q, i₀ = 1/N, and the share still susceptible at the end, s∞, solves ln(s₀/s∞) = R₀(s₀ + i₀ − s∞). Deaths = N × (s₀ − s∞) × deaths per infection. Deep dive draws the uncertain inputs uniformly from their ranges 1,000 times (fixed random seed) and reports the middle 95% of results; the sensitivity graph moves one input at a time.</p><p><b>Measles assumptions.</b> About 6.7 million people a year would meet measles with no vaccine: CDC’s 3.5 million (the middle of 3 to 4 million) scaled by today’s population. Deaths per infection = 450 ÷ 3.5 million, about 1.29 per 10,000, so methods 2 and 3 assume care hasn’t improved since the early 1960s, and scaling by population assumes the same share of people meets measles each year as then. Everyone mixes evenly in one season, and protection is all or nothing and does not fade. That is why the with-vaccine world has about 55 deaths a year while CDC counted 4 in 2026: real outbreaks stay in pockets, and real models are fitted to case counts. R₀ 12 to 18 and about 97% effectiveness for two doses are commonly cited textbook figures, not re-verified for this tool; the 95% to 99% effectiveness range for the Monte Carlo runs is an assumption for illustration.</p><p><b>COVID-19 teaching model.</b> R₀ 3, 60% effectiveness against infection, 70% coverage and 50 deaths per 10,000 infections (and the Monte Carlo ranges R₀ 2 to 4, 40% to 80%, 20 to 100 per 10,000) are illustrative, not measured values or any study’s inputs. Real COVID-19 vaccines protected more against death than against infection, immunity faded, the virus changed and people changed their behavior; this one-wave model leaves all of that out. Your own illness uses ± 25% of your values for its ranges.</p><p><b>Sources.</b> Measles before the 1963 vaccine: an estimated 3 to 4 million infected each year in the U.S.; among reported cases, an estimated 48,000 hospitalized and 400 to 500 deaths a year; eliminated in 2000 (<a href="https://www.cdc.gov/measles/about/history.html" target="_blank" rel="noopener">CDC, History of Measles</a>). U.S. measles in 2026: 5,182 confirmed cases and 4 deaths as of November 5, subject to change (<a href="https://www.cdc.gov/measles/data-research/index.html" target="_blank" rel="noopener">CDC Measles Cases and Outbreaks</a>). Kindergarten MMR coverage 92.4% in 2025–26 (<a href="https://www.cdc.gov/schoolvaxview/data/index.html" target="_blank" rel="noopener">CDC SchoolVaxView</a>). U.S. population 179,323,175 in 1960 (<a href="https://www.census.gov/library/publications/1960/dec/population-pc-a1.html" target="_blank" rel="noopener">1960 Census</a>) and 341.8 million on July 1, 2025 (<a href="https://www.census.gov/newsroom/press-releases/2026/population-growth-slows.html" target="_blank" rel="noopener">Census Bureau, Jan 2026</a>). At least 154 million lives saved by immunization over 50 years, 101 million of them infants (modeled; <a href="https://www.who.int/news/item/24-04-2024-global-immunization-efforts-have-saved-at-least-154-million-lives-over-the-past-50-years" target="_blank" rel="noopener">WHO, 24 Apr 2024</a>, on Shattock et al., <i>The Lancet</i>, 2024). COVID-19: Watson et al., <i>Lancet Infectious Diseases</i> 2022, 14.4 million deaths averted (95% credible interval 13.7 to 15.9 million) using reported deaths and 19.8 million (19.1 to 20.4 million) using excess deaths, 185 countries and territories, Dec 8, 2020 to Dec 8, 2021 (<a href="https://pubmed.ncbi.nlm.nih.gov/35753318/" target="_blank" rel="noopener">PubMed</a>). Meslé et al., <i>Lancet Respiratory Medicine</i> 2024, more than 1.6 million lives directly saved in the WHO European Region, Dec 2020 to Mar 2023, deaths cut by at least 59%, most saved aged 60 or older (<a href="https://www.who.int/europe/news/item/02-08-2024-amid-a-summer-wave-of-covid-19--a-new-who-europe-study-confirms-the-lifesaving-impact-of-vaccines" target="_blank" rel="noopener">WHO/Europe, 2 Aug 2024</a>); an earlier version reported more than 1.4 million and at least 57% (<a href="https://www.who.int/europe/news/item/16-01-2024-covid-19-vaccinations-have-saved-more-than-1.4-million-lives-in-the-who-european-region--a-new-study-finds" target="_blank" rel="noopener">WHO/Europe, 16 Jan 2024</a>). Ioannidis et al., <i>JAMA Health Forum</i> 2025, about 2.5 million deaths averted worldwide in 2020 to 2024 (sensitivity range 1.4 to 4.0 million), 90% of them in people 60 or older; it assumes that without vaccines everyone would have been infected during Omicron, uses effectiveness against death of 75% before Omicron and 50% during it, and does not estimate excess deaths (<a href="https://jamanetwork.com/journals/jama-health-forum/fullarticle/10.1001/jamahealthforum.2025.2223" target="_blank" rel="noopener">JAMA Health Forum</a>). The three COVID-19 studies cover different places, years and kinds of deaths, so their numbers are not directly comparable.</p><p><b>Not medical advice.</b> This is a simplified teaching model. For questions about your own vaccines or health, talk with a parent, your doctor or the school nurse.</p>'
};
/* tour focus: one method row, laid out as at desktop size */
function rowRect(sim,j){const hon=atLeast('honors'),rows=hon?[1,2,3]:[1,3],i=rows.indexOf(j);if(i<0)return [0,0,800,450];const y0=68,AX=398,rh=(AX-10-y0)/rows.length;return [10,y0+i*rh-4,780,rh+4];}
BioLab.register(SIM);
})();
