(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* A cafe open 6 am to 9 pm, Monday to Sunday. Forecast customers per hour -> baristas needed = ceil(customers / rate), at least 1.
   Shifts: an opener (5 am to 1 pm, with 1 h of prep), a closer (1 pm to 10 pm, with 1 h of cleanup), and helper shifts stacked
   in layers wherever more baristas are needed (4 to 8 h; anyone working the last hour stays to clean until 10 pm).
   The optimizer assigns shifts to the team (one shift per person per day), paying the wage, 1.5x past 40 h a week,
   and 1.5x for a fill-in borrowed from another store when no one on the team can take a shift. It searches for the cheapest
   assignment with random restarts and local improvement. */
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WK=[18,40,50,35,25,30,38,30,20,28,30,24,18,14,10],SAT=[14,42,58,62,58,48,40,34,28,26,22,18,15,12,8],SUN=[8,18,32,46,50,44,36,28,22,20,18,14,12,10,6];
const RAINORDER=[2,5,1,3],FOOT=40,RAINX=1.3;
const NAMES=['Ana','Ben','Cam','Dev','Eli','Fay','Gus','Hal','Ivy','Jo'],WANT=[40,40,30,25,20,20,30,15,25,20];
function mrng(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const P=sim=>({rate:atLeast('ap')?sim.p.rate:20,wage:atLeast('ap')?sim.p.wage:16,staff:atLeast('honors')?sim.p.staff:7,rainDays:atLeast('honors')?sim.p.rainDays:3,foot:!!sim.p.foot,
 posted:!!sim.p.posted,min20:atLeast('honors')&&!!sim.p.min20,ban:!!sim.p.noclop});
const rainActual=p=>new Set(p.rainDays>0?[RAINORDER[0]]:[]),rainPosted=p=>new Set(RAINORDER.slice(0,p.rainDays));
function demand(p,d,rain){const base=d<5?WK:d===5?SAT:SUN;return base.map((c,i)=>{let v=c;if(p.foot&&d===4&&6+i>=17)v+=FOOT;if(rain.has(d))v=Math.round(v*RAINX);return v;});}
const mk=(d,a,b,type)=>{const st=a===6?5:a,en=b===21?22:b;return {d,start:st,end:en,hrs:en-st,type};};
function shiftsFor(p,rain){const out=[];for(let d=0;d<7;d++){const n=demand(p,d,rain).map(c=>Math.max(1,Math.ceil(c/p.rate)));
  out.push(mk(d,6,13,'open'));out.push(mk(d,13,21,'close'));const top=Math.max(...n);
  for(let j=2;j<=top;j++){let i=0;while(i<15){if(n[i]>=j){let q=i;while(q<15&&n[q]>=j)q++;let a=6+i,b=6+q;if(b-a<4){b=Math.min(21,a+4);a=b-4;}
     if(b-a>8){const m=a+Math.ceil((b-a)/2);out.push(mk(d,a,m,'help'));out.push(mk(d,m,b,'help'));}else out.push(mk(d,a,b,'help'));i=q;}else i++;}}}
 return out;}
function solve(p,shifts,o){const N=p.staff,w=p.wage,byDay=[0,1,2,3,4,5,6].map(d=>shifts.filter(s=>s.d===d));
 const R=mrng(9001+N*31+(o.ban?7:0)+(o.min20?3:0)+shifts.length*17);
 const pay=h=>w*Math.min(h,40)+1.5*w*Math.max(0,h-40);
 function total(A){const h=new Array(N).fill(0);let fill=0;A.forEach((day,d)=>day.forEach((x,i)=>{if(x<0)fill+=byDay[d][i].hrs;else h[x]+=byDay[d][i].hrs;}));
  let pad=0;if(o.min20)h.forEach((v,i)=>{if(WANT[i]>=20&&v<20)pad+=20-v;});return {c:h.reduce((a,v)=>a+pay(v),0)+1.5*w*fill+w*pad,h,fill,pad};}
 const ok=(A,d,i,x)=>{if(x<0)return true;for(let j=0;j<A[d].length;j++)if(j!==i&&A[d][j]===x)return false;if(!o.ban)return true;const s=byDay[d][i];
   if(d>0){const j=A[d-1].indexOf(x);if(j>=0&&24-byDay[d-1][j].end+s.start<10)return false;}
   if(d<6){const j=A[d+1].indexOf(x);if(j>=0&&24-s.end+byDay[d+1][j].start<10)return false;}return true;};
 let best=null;
 for(let it=0;it<12;it++){const A=byDay.map(day=>new Array(day.length).fill(-1));
  for(let d=0;d<7;d++){const order=byDay[d].map((_,i)=>i);for(let a=order.length-1;a>0;a--){const b=Math.floor(R()*(a+1)),t=order[a];order[a]=order[b];order[b]=t;}order.forEach(i=>{const c=[];for(let x=0;x<N;x++)if(ok(A,d,i,x))c.push(x);if(c.length)A[d][i]=c[Math.floor(R()*c.length)];});}
  let cur=total(A).c,imp=true;
  while(imp){imp=false;
   for(let d=0;d<7;d++)for(let i=0;i<A[d].length;i++)for(let x=-1;x<N;x++){if(x===A[d][i])continue;const old=A[d][i],j=x<0?-1:A[d].indexOf(x);
    if(j>=0){A[d][i]=x;A[d][j]=old;if(ok(A,d,i,x)&&ok(A,d,j,old)){const c=total(A).c;if(c<cur-1e-9){cur=c;imp=true;continue;}}A[d][i]=old;A[d][j]=x;}
    else{A[d][i]=x;if(ok(A,d,i,x)){const c=total(A).c;if(c<cur-1e-9){cur=c;imp=true;continue;}}A[d][i]=old;}}}
  const T=total(A);if(!best||T.c<best.c-1e-9)best=Object.assign(T,{A:A.map(r=>r.slice()),byDay});}
 /* rest gaps between shifts on back-to-back days */
 let clop=0,minGap=99;const pairs=[];
 for(let d=1;d<7;d++)best.A[d].forEach((x,i)=>{if(x<0)return;const j=best.A[d-1].indexOf(x);if(j<0)return;const g=24-best.byDay[d-1][j].end+best.byDay[d][i].start;minGap=Math.min(minGap,g);if(g<10){clop++;pairs.push([x,d,g]);}});
 best.clop=clop;best.minGap=minGap===99?null:minGap;best.pairs=pairs;return best;}
const CACHE={};
function model(sim){const p=P(sim),key=JSON.stringify(p);if(CACHE[key])return CACHE[key];
 const A=shiftsFor(p,rainActual(p)),PS=shiftsFor(p,rainPosted(p));
 const run=(sh,o,tag)=>{const k2=key.replace(/"(ban|posted|min20)":(true|false),?/g,'')+tag;if(CACHE[k2])return CACHE[k2];return CACHE[k2]=solve(p,sh,o);};
 const none=run(A,{},'n'),ban=run(A,{ban:true},'b'),min=run(A,{min20:true},'m'),post=run(PS,{},'p'),cur=run(p.posted?PS:A,{ban:p.ban,min20:p.min20},'c'+(+p.ban)+(+p.posted)+(+p.min20));
 const runs=[none,ban,min,post,cur],base=Math.min(...runs.map(r=>r.c)),baseRun=runs.find(r=>r.c===base);
 const out={p,shifts:p.posted?PS:A,cur,none,post,baseRun,dayHrs:[A,PS].map(sh=>[0,1,2,3,4,5,6].map(d=>sh.filter(s=>s.d===d).reduce((a,s)=>a+s.hrs,0))),base,price:{ban:ban.c-base,post:post.c-base,min:min.c-base},cost:Math.max(cur.c,base),hours:(p.posted?PS:A).reduce((a,s)=>a+s.hrs,0)};
 const ks=Object.keys(CACHE);if(ks.length>400)ks.slice(0,200).forEach(x=>delete CACHE[x]);
 return CACHE[key]=out;}
const banPrice=sim=>model(sim).price.ban;
/* Cost of a run = wage × (hours worked + fill-in hours + paid floor hours) + half the wage × (overtime hours + fill-in hours).
   So the price of posting ahead splits into extra hours at the wage plus extra overtime or fill-in hours at half the wage. */
const HX=R=>({H:R.h.reduce((a,v)=>a+v,0)+R.fill+R.pad,X:R.h.reduce((a,v)=>a+Math.max(0,v-40),0)+R.fill});
function postParts(sim){const M=model(sim),w=M.p.wage,a=HX(M.post),b=HX(M.baseRun),dH=a.H-b.H,dX=a.X-b.X;
 const days=[0,1,2,3,4,5,6].map(d=>M.dayHrs[1][d]-M.dayHrs[0][d]),list=days.map((h,d)=>[DAYS[d],h]).filter(x=>x[1]>0);
 return {w,dH,dX,list,price:w*dH+0.5*w*dX,posted:[...rainPosted(M.p)].sort().map(d=>DAYS[d]),actual:[...rainActual(M.p)].map(d=>DAYS[d])};}
const postPrice=sim=>model(sim).price.post;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* Dollars stay hidden while the student works out the price of posting ahead ("Your turn"). */
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g&&!(BioLab.calcPending&&BioLab.calcPending(sim))));
const need=(p,d,rain)=>demand(p,d,rain).map(c=>Math.max(1,Math.ceil(c/p.rate)));
const FULL={Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'};
const days=a=>{const f=a.map(d=>FULL[d]);return f.length<2?f.join(''):f.slice(0,-1).join(', ')+(f.length>2?',':'')+' and '+f[f.length-1];};
const hrsList=q=>q.list.map((x,i)=>x[1]+(i?'':' barista-hours')+' on '+FULL[x[0]]).join(' and ');
const plus=q=>q.list.map(x=>x[1]).join(' + ');
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const hh=h=>h===12?'12p':h===24?'12a':h>12?(h-12)+'p':h+'a';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function drop(ctx,x,y,s,col,dash){ctx.beginPath();ctx.moveTo(x,y-s);ctx.quadraticCurveTo(x+s*0.85,y+s*0.1,x,y+s*0.6);ctx.quadraticCurveTo(x-s*0.85,y+s*0.1,x,y-s);ctx.closePath();
 if(dash){ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.setLineDash([3,2]);ctx.stroke();ctx.setLineDash([]);}else{ctx.fillStyle=col;ctx.fill();}}
function ball(ctx,x,y,s,col){ctx.save();ctx.translate(x,y);ctx.rotate(-0.5);ctx.beginPath();ctx.ellipse(0,0,s,s*0.6,0,0,7);ctx.fillStyle=col;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-s*0.4,0);ctx.lineTo(s*0.4,0);for(let i=-1;i<=1;i++){ctx.moveTo(i*s*0.2,-s*0.15);ctx.lineTo(i*s*0.2,s*0.15);}ctx.stroke();ctx.restore();}

const SIM={
 id:'schedule',hash:'schedule',apUnit:19,order:8,tab:'What does a fair schedule cost?',kind:'Simulation',
 skills:{bio:'Rounding up a rate, and cost = hours × wage · Algebra 1 (Unit 5)',honors:'The price of a constraint: cheapest cost with a rule − cheapest cost without it · Algebra 1 (Unit 5, systems of inequalities)',ap:'Linear programming: minimizing cost over a feasible set · Algebra 1 (Unit 5)'},
 card:'Price two scheduling rules for a cafe: posting the week ahead and banning “clopening.” Work out the cost in barista-hours and dollars.',
 title:'What does it cost to schedule people fairly?',
 lede:{bio:'You manage a small cafe. Each hour needs customers ÷ 20 baristas, rounded up, and every hour of work costs the wage. A week out, the forecast says rain (and a rush) is possible on three days. If you post the schedule now, you staff all three. What does that promise cost?',
  honors:'An optimizer minimizes cost subject to constraints. Every rule is a new constraint, and its price is how much the cheapest schedule rises when you add it: C(with) − C(without). Some rules cost nothing; posting ahead costs real money because it takes away re-planning after the forecast changes.',
  ap:'The price of a constraint is C(with) − C(without), where C is the minimum cost over all feasible schedules. Adding a constraint can only shrink the feasible set, so the price is never negative; it is zero whenever a cheapest schedule already satisfies it.'},
 scale:'One cafe, one week, open 6 am to 9 pm. Forecasts, wages and team sizes are illustrations, not data from any real store.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your cafe',
 controls:[
  {id:'guess',label:'Your gut: what posting the schedule a week ahead costs per week',type:'range',min:0,max:600,step:10,def:100,unit:' dollars'},
  {id:'noclop',label:'No clopening: at least 10 hours between a closing shift and the next opening',type:'toggle',def:false,noGut:true},
  {id:'foot',label:'Friday home football game (busy from 5 pm to close)',type:'toggle',def:true,noGut:true,onChange:clearGut},
  {id:'posted',label:'Post the schedule 7 days ahead (no last-minute changes)',type:'toggle',def:false,noGut:true,help:'A week out, the forecast only says rain is possible. A posted schedule has to cover rain on every day it might fall.'},
  {id:'min20',label:'At least 20 hours for every barista who wants that many',type:'toggle',def:false,lvl:'honors',noGut:true},
  {id:'rainDays',label:'Days a week-ahead forecast says rain is possible',type:'range',min:0,max:4,step:1,def:3,lvl:'honors',noGut:true,onChange:clearGut,help:'Rain brings about 30% more customers (an assumption). It actually rains on Wednesday only.'},
  {id:'staff',label:'Baristas on your team',type:'range',min:6,max:10,step:1,def:7,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'rate',label:'Customers one barista can serve per hour',type:'range',min:15,max:30,step:1,def:20,lvl:'ap',noGut:true,onChange:clearGut},
  {id:'wage',label:'Hourly wage',type:'range',min:12,max:25,step:0.5,def:16,unit:' dollars',d:2,lvl:'ap',noGut:true,onChange:clearGut},
  {id:'reveal',label:'Show the dollar amounts now',type:'toggle',def:false,help:'Normally the dollars appear once you lock in your gut answer.'}
 ],
 actions:[{id:'fair',label:'Turn on all three rules',lvl:'honors',run(sim){BioLab.setValues(sim,{noclop:true,posted:true,min20:true,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'cost',label:'Weekly labor cost, with the rules you chose',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim).cost:null},
  {id:'ppost',label:'Price of posting 7 days ahead',unit:'dollars/week',d:0,min:0,max:null,get:sim=>shown(sim)?postPrice(sim):null},
  {id:'pban',label:'Price of no clopening',unit:'dollars/week',d:0,min:0,max:null,get:sim=>shown(sim)?banPrice(sim):null},
  {id:'pmin',label:'Price of the 20-hour floor',unit:'dollars/week',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?model(sim).price.min:null},
  {id:'clop',label:'Clopenings this week',unit:'',d:0,min:0,max:10,get:sim=>model(sim).cur.clop},
  {id:'gap',label:'Shortest rest between two shifts',unit:'hours',d:0,min:0,max:24,get:sim=>{const g=model(sim).cur.minGap;return g===null?null:g;}},
  {id:'hours',label:'Labor hours scheduled',unit:'hours',d:0,lvl:'honors',min:0,max:null,get:sim=>model(sim).hours+model(sim).cur.pad},
  {id:'extra',label:'Overtime and fill-in hours',unit:'hours',d:0,lvl:'ap',min:0,max:null,get:sim=>{const c=model(sim).cur;return c.h.reduce((a,v)=>a+Math.max(0,v-40),0)+c.fill;}},
  {id:'off',label:'Your gut is off by',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-postPrice(sim)):null}
 ],
 graphs:[{id:'price',label:'Weekly cost under each rule',custom:true}],defaultGraph:'price',
 plot(sim,ctx,box){const M=model(sim),sh=shown(sim),hon=atLeast('honors');
  const items=[['Cheapest',M.base],['Posted ahead',M.base+M.price.post],['No clopening',M.base+M.price.ban]];if(hon){items.push(['20-hour floor',M.base+M.price.min],['Your rules',M.cost]);}
  const top=Math.ceil(Math.max(...items.map(x=>x[1]))/500)*500+500;
  const ax=axes(ctx,box,{xmin:0,xmax:items.length,ymin:0,ymax:top,xl:'',yl:'Weekly labor cost ($)',xcats:items.map(x=>x[0])});
  if(!sh){txt(ctx,'Lock in your gut to see the dollars',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  items.forEach(([l,v],i)=>{const x0=ax.X(i+0.2),x1=ax.X(i+0.8);ctx.fillStyle=i?PAL['s5']:PAL['s3'];ctx.fillRect(x0,ax.Y(v),x1-x0,ax.Y(0)-ax.Y(v));
   txt(ctx,i?'+'+$(v-M.base):$(v),(x0+x1)/2,ax.Y(v)-6,{s:12,w:700,c:PAL['fg'],a:'center'});});},
 draw(sim,ctx,vdt,k){const M=model(sim),p=M.p,S=M.cur,N=p.staff,sh=shown(sim),big=k>1.3,G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const LX=big?70:100,CW=(792-LX)/7,T=34*Math.min(k,1.25),bottom=big?338:350,SH=big?74:62,gb=bottom-SH,rows=N+(S.fill>0?1:0),RH=Math.min(34,(gb-T-4)/rows);
  /* day headers with weather and game icons */
  const ra=rainActual(p),rp=rainPosted(p);
  DAYS.forEach((d,i)=>{const cx=LX+CW*(i+0.5),ix=big?cx+CW/2-10:cx+16*Math.min(k,1.3);txt(ctx,d,cx-(big?10:10),T-10,{s:13*k,w:700,a:'center'});
   if(ra.has(i))drop(ctx,ix,T-15,7*Math.min(k,1.3),PAL['s2']);else if(rp.has(i))drop(ctx,ix,T-15,7*Math.min(k,1.3),PAL['s2'],true);
   if(i===4&&p.foot)ball(ctx,ix,T-15,8*Math.min(k,1.3),PAL['s4']);});
  /* worker rows */
  const tcol={open:PAL['s2'],close:PAL['s5'],help:PAL['s6']};
  for(let w=0;w<N;w++){const y=T+w*RH;if(w%2){ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,y,800,RH);}
   const h=S.h[w],low=p.min20&&WANT[w]>=20&&h<20;
   txt(ctx,big?NAMES[w]:NAMES[w]+' '+h+'h',8,y+RH/2+4*k,{s:12*k,w:700,c:low?PAL['s1']:PAL['cv-ink']});}
  if(S.fill>0){const y=T+N*RH;txt(ctx,'Fill-in',8,y+RH/2+4*k,{s:12*k,w:700,c:PAL['s4']});}
  const clopSet=new Set(),gapAt={};S.pairs.forEach(([x,d,g])=>{clopSet.add(x+'_'+d);clopSet.add(x+'_'+(d-1));gapAt[x+'_'+d]=g;});
  const fillCount=new Array(7).fill(0);
  S.byDay.forEach((day,d)=>day.forEach((s,i)=>{const x=S.A[d][i],row=x<0?N:x,y=T+row*RH+2,cx=LX+CW*d+3,cw=CW-6,ch=RH-4;
   let lab=hh(s.start)+'–'+hh(s.end);
   if(x<0){fillCount[d]++;if(fillCount[d]>1)return;const more=S.byDay[d].filter((_,j)=>S.A[d][j]<0).length;if(more>1)lab=more+' shifts';}
   rr(ctx,cx,y,cw,ch,5);ctx.fillStyle=x<0?PAL['s4']:tcol[s.type];ctx.fill();
   if(x>=0&&clopSet.has(x+'_'+d)){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;rr(ctx,cx,y,cw,ch,5);ctx.stroke();}
   txt(ctx,lab,cx+cw/2,y+ch/2+4*Math.min(k,1.4),{s:Math.min(12*k,ch-4),w:700,c:'#fff',a:'center'});
   if(!big&&gapAt[x+'_'+d]!==undefined){const g=gapAt[x+'_'+d];pill(ctx,g+'h',cx-1,y+ch/2,PAL['s1'],'#fff',Math.min(11*k,ch*0.55));}}));
  /* baristas needed each hour = customers ÷ rate, rounded up; dashed tops = rain the week-ahead forecast allows for but that never comes */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,gb);ctx.lineTo(800,gb);ctx.stroke();
  const capY=gb+14*Math.min(k,1.5);
  txt(ctx,big?'Baristas needed = customers ÷ '+p.rate+', rounded up':'Baristas needed each hour = customers ÷ '+p.rate+', rounded up'+(rp.size>ra.size?'. Dashed: rain that might come.':''),LX,capY,{s:12*k,w:700,c:PAL['cv-soft']});
  if(!big)txt(ctx,'Needed',8,gb+SH/2+10,{s:12*k,w:700,c:PAL['cv-ink']});
  const bt=capY+6*Math.min(k,1.4),bb=bottom-2,nA=[],nP=[];for(let d=0;d<7;d++){nA.push(need(p,d,ra));nP.push(need(p,d,rp));}
  const top=Math.max(...nP.map(a=>Math.max(...a))),u=(bb-bt)/top,bw=(CW-8)/15;
  for(let d=0;d<7;d++){for(let i=0;i<15;i++){const x=LX+CW*d+4+i*bw,a=nA[d][i],q=nP[d][i];
    ctx.fillStyle=PAL['s6'];ctx.globalAlpha=.75;ctx.fillRect(x+0.5,bb-a*u,bw-1,a*u);ctx.globalAlpha=1;
    if(q>a){ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.25;ctx.fillRect(x+0.5,bb-q*u,bw-1,(q-a)*u);ctx.globalAlpha=1;ctx.strokeStyle=PAL['s2'];ctx.lineWidth=1.3;ctx.setLineDash([3,2]);ctx.strokeRect(x+0.5,bb-q*u,bw-1,(q-a)*u);ctx.setLineDash([]);}}}
  /* summary */
  const by=bottom+(big?16:22)*k;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,bottom+4);ctx.lineTo(800,bottom+4);ctx.stroke();
  const items=[[(big?'Labor: ':'Labor this week: ')+(sh?$(M.cost):'?'),PAL['cv-ink']],[(big?'Clopenings: ':'Clopenings: ')+S.clop+(S.minGap!==null?(big?'':' (shortest rest '+S.minGap+' h)'):''),S.clop?PAL['s1']:PAL['s3']]];
  txt(ctx,items[0][0],12,by,{s:14*k,w:700,c:items[0][1]});txt(ctx,items[1][0],big?400:300,by,{s:14*k,w:700,c:items[1][1]});
  const cy=by+30*k;
  if(G&&G.m){/* the reveal: the math with this case's numbers */const q=postParts(sim);
   txt(ctx,(big?'Posting: ':'Price of posting ahead = ')+q.dH+' h × '+$(q.w)+(q.dX?' + '+q.dX+' h × '+$(q.w/2):'')+' = '+$(q.price),12,cy,{s:13*Math.min(k,1.5),w:700,c:PAL['s4']});}
  else{const chips=[['Posted ahead',M.price.post],['No clopening',M.price.ban]];if(atLeast('honors'))chips.push(['20-hour floor',M.price.min]);
   let cx=12;chips.forEach(([l,v])=>{const s=l+': '+(sh?'+'+$(v):'?');ctx.font='700 '+(12*Math.min(k,1.5))+'px '+FONT;const w=ctx.measureText(s).width+16;
    if(cx+w>792)return;rr(ctx,cx,cy-14*Math.min(k,1.5),w,20*Math.min(k,1.5),8);ctx.fillStyle=PAL['card2'];ctx.fill();txt(ctx,s,cx+8,cy,{s:12*Math.min(k,1.5),w:700,c:PAL['cv-ink']});cx+=w+10;});
   if(!big&&cx<560){const lx=Math.max(cx+10,560);[['open',PAL['s2']],['close',PAL['s5']],['helper',PAL['s6']]].forEach(([l,c],i)=>{ctx.fillStyle=c;ctx.fillRect(lx+i*78,cy-10,11,11);txt(ctx,l,lx+i*78+15,cy,{s:12,c:PAL['cv-soft']});});}}
  if(G&&G.g&&!big)txt(ctx,'Your gut: '+$(G.g.guess)+' a week',788,by,{s:12*k,w:700,c:PAL['s4'],a:'right'});},
 narrate(sim){const M=model(sim),S=M.cur,p=M.p,sh=shown(sim),q=postParts(sim);
  const rest=S.minGap!==null?`The shortest rest between two shifts is ${S.minGap} hours.`:'';
  if(p.ban)return `No one closes and then opens within 10 hours. ${rest} ${sh?(M.price.ban<1?`<b>The ban costs $0 here:</b> the optimizer just changed who opens.`:`<b>The ban costs ${$(M.price.ban)} a week</b>, because the team is too small to keep everyone rested without overtime or fill-ins.`):'<b>What did the ban cost?</b>'}`;
  if(!sh)return q.posted.length>q.actual.length?`A week out, rain is possible on ${days(q.posted)}. A posted schedule staffs all of them; the dashed bars are the extra baristas that rain would need. It rains only on ${days(q.actual)}. <b>What does posting ahead cost?</b>`:`This week’s forecast has no uncertain days, so posting ahead adds no extra shifts. Add rain days to see what a posted schedule must cover.`;
  if(p.posted)return `The posted week covers rain on ${days(q.posted)} and costs <b>${$(M.post.c)}</b>. Re-planned after the real forecast, it costs ${$(M.base)}. The difference, <b>${$(M.price.post)} a week</b>, is ${q.dH} barista-hours of pay for rain that did not come.`;
  if(S.clop)return `The optimizer covered the real forecast as cheaply as it could and scheduled <b>${S.clop} clopening${S.clop>1?'s':''}</b>: a barista closes at 10 pm and is back before 8 am. ${rest} Turn on <b>Post the schedule 7 days ahead</b> to see the posted week.`;
  return `This week’s cheapest schedule happens to have no clopenings. ${rest}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Rain is possible on three days, so a posted schedule staffs all three. It rains only on Wednesday. Drag the slider here to what you think posting ahead costs the cafe per week. Then lock it in.',
   honors:'Before you see any dollars: drag the slider here to your gut price of the posting-ahead constraint, in dollars per week, then lock it in.'},
  hint:{bio:'Lock in your gut answer. Then you will work out the real price yourself from the extra hours and the wage.'},
  lock(sim){const v=Math.abs(sim.p.guess-postPrice(sim));return {v,guess:sim.p.guess,label:`${$(sim.p.guess)} a week`};},
  solve(sim){const b=postPrice(sim);sim.p.guess=Math.round(b);sim.p.posted=true;return {v:Math.abs(sim.p.guess-b),guess:b,label:`${$(b)} a week`};},
  calc:{unit:'$',d:0,tol:1,
   prompt:{bio:sim=>{const q=postParts(sim);return q.dH>0?`The posted schedule covers rain on ${days(q.posted)}. It rains only on ${days(q.actual)}. Staffing for the rain that never came adds <b>${hrsList(q)}</b>. Each hour costs <b>${$(q.w)}</b>.${q.dX?` With a short team, <b>${q.dX}</b> of the hours become overtime or fill-in hours, which cost half the wage more: <b>${$(q.w/2)}</b> each.`:''} What does posting ahead cost the cafe this week?`:`The forecast has no uncertain days this week, so the posted schedule adds 0 barista-hours. Each hour costs ${$(q.w)}. What does posting ahead cost this week?`;},
    ap:sim=>{const q=postParts(sim);return `Price of a constraint = C(with) − C(without). The posted schedule adds ${q.dH>0?hrsList(q):'0 barista-hours'} to the cheapest re-planned week${q.dX?`, and the posted week has ${q.dX} more overtime or fill-in hours, each costing half the wage on top of the wage`:''}. The wage is ${$(q.w)} an hour. Find C(posted) − C(re-planned).`;}},
   answer:postPrice,
   hint:'Add the extra hours, then multiply by the wage.',
   steps(sim){const q=postParts(sim),M=model(sim),out=[];
    out.push(q.list.length>1?`Extra hours: ${plus(q)} = ${q.dH} barista-hours.`:`Extra hours: ${q.dH} barista-hours.`);
    out.push(`At the wage: ${q.dH} × ${$(q.w)} = ${$(q.dH*q.w)}.`);
    if(q.dX)out.push(`Overtime and fill-ins cost half the wage more: ${q.dX} × ${$(q.w/2)} = ${$(q.dX*q.w/2)}. Total: ${$(q.dH*q.w)} + ${$(q.dX*q.w/2)} = <b>${$(q.price)}</b> a week.`);
    else out.push(`Posting ahead costs <b>${$(q.price)}</b> a week.`);
    out.push(`Check it with the two weekly totals: ${$(M.post.c)} posted − ${$(M.base)} re-planned = ${$(M.price.post)}.`);
    return out;}},
  formula(sim){const q=postParts(sim),M=model(sim);
   return `Price of posting = ${q.dH} extra hours × ${$(q.w)}${q.dX?` + ${q.dX} overtime hours × ${$(q.w/2)}`:''} = ${$(q.price)} a week`+(atLeast('honors')?`<br>C(posted) − C(re-planned) = ${$(M.post.c)} − ${$(M.base)} = ${$(M.price.post)}`:'');},
  how:{bio:'The optimizer builds the cheapest week twice: once posted a week ahead, covering every day rain might fall, and once re-planned after the real forecast. The price of posting is the difference: the extra barista-hours times the wage.',
   ap:'Price = C(posted) − C(re-planned), each the minimum over feasible assignments found by restarts plus local swaps. A posted schedule must meet every hour’s need on every possible rain day, so its feasible set is smaller and the price is at least 0.'},
  compare(sim,g,m){const M=model(sim),q=postParts(sim),off=Math.abs(g.guess-m.guess),K=sim.ui.calc;
   const real=`In real terms: ${$(m.guess)} a week is ${q.dH} barista-hours of pay for rain that did not come, about ${(100*m.guess/M.base).toFixed(1)}% of the ${$(M.base)} labor bill.`;
   const self=K&&K.done&&K.correct?' You worked it out yourself from the hours and the wage.':'';
   if(off<=10)return `Your gut was right on, within ${$(off)}. `+real+self;
   return `Your gut was off by <b>${$(off)}</b>: you guessed ${$(g.guess)}, and the price is <b>${$(m.guess)}</b>. `+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.foot=Math.random()<0.6;sim.p.guess=100;sim.p.noclop=false;sim.p.posted=false;sim.p.reveal=false;if(atLeast('honors')){sim.p.staff=R([6,7,8]);sim.p.rainDays=R([2,3,4]);}if(atLeast('ap'))sim.p.wage=R([15,16,17,18,20]);}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different cafe pays $17 an hour. A week out, rain is possible on Monday and Thursday, and its posted schedule covers both. Neither day gets rain. The extra rain shifts add 9 barista-hours on Monday and 8 on Thursday. What did posting ahead cost that week?',answer:289,tol:1,unit:'$',d:0,hint:'Add the extra hours, then multiply by the hourly wage.',explain:'9 + 8 = 17 barista-hours, and 17 × $17 = $289 for rain that never came.'},
  {lvl:'bio',kind:'num',q:'9 am on a rainy Saturday: the forecast is 81 customers, and one barista can serve 20 an hour. How many baristas does that hour need?',answer:5,tol:0,unit:'baristas',d:0,hint:'Divide, then round up: you can’t schedule part of a person.',explain:'81 ÷ 20 = 4.05. Four baristas could serve only 80, so the hour needs 5. Rounding to the nearest whole number (4) would leave one customer an hour unserved.'},
  {lvl:'bio',instant:true,q:'With 7 baristas, banning clopening (at least 10 hours between shifts) costs $0: the optimizer finds an equally cheap week. Why did its first schedule clopen at all?',choices:['Clopening saves money','Nothing in its goal said rest mattered, so it picked any cheapest schedule, clopenings included','The baristas asked for it'],correct:1,explain:'An optimizer only cares about what is in its objective. Many schedules tie for cheapest; without a rule about rest, it has no reason to avoid the ones that clopen.'},
  {lvl:'honors',instant:true,q:'At the default settings (7 baristas, rain possible on 3 days, real rain only Wednesday), which rule costs the cafe the most per week?',choices:['No clopening','Posting 7 days ahead','The 20-hour floor'],correct:1,explain:'Posting ahead costs $288 a week: the schedule has to cover rain on Tuesday and Saturday too, and those shifts turn out not to be needed. No clopening and the 20-hour floor cost $0 with 7 baristas.'},
  {lvl:'honors',instant:true,q:'Drop the team to 6 baristas. What happens to the price of no clopening?',choices:['It stays $0','It rises a little, because the people who closed Friday after the game can’t open Saturday, and the team runs out of rested people','It becomes the biggest cost of all'],correct:1,explain:'With a short team, the busy Friday night and busy Saturday morning compete for the same people. The ban then forces some overtime. Here it costs $8 a week: one more overtime hour at half the $16 wage.'},
  {lvl:'ap',instant:true,q:'Why can adding a constraint never make the cheapest possible schedule cheaper?',choices:['Constraints always add hours','Every schedule that obeys the new rule was already allowed before, so the minimum over a smaller set can’t be lower','Because the wage goes up'],correct:1,explain:'min over a subset ≥ min over the whole set. The price of a constraint is C(with) − C(without) ≥ 0, and it is exactly 0 when some cheapest schedule already obeys it.'},
  {lvl:'ap',instant:true,q:'With 6 baristas, posting ahead costs $432 a week, not the $288 it costs with 7. The extra hours are the same 18. Where do the other $144 come from?',choices:['A higher wage for posted shifts','18 hours that now fall into overtime or fill-ins, each costing half the $16 wage more','A penalty for posting'],correct:1,explain:'C = wage × hours + ½ wage × (overtime + fill-in hours). With 6 people, the 18 extra hours push people past 40: 18 × $8 = $144, and $288 + $144 = $432.'}
 ],
 tour:[
  {title:'Your cafe’s week',text:'Each row is one barista; each colored block is a shift. Blue opens at 5 am, purple closes at 10 pm, and teal helpers cover the rushes. The optimizer built the cheapest week that covers the forecast.',pause:true,setup:sim=>BioLab.setValues(sim,{noclop:false,posted:false,min20:false,foot:true,rainDays:3,staff:7,reveal:true})},
  {title:'How many baristas each hour',text:'The bars under the schedule show baristas needed each hour: customers ÷ 20, rounded up. 8 am on rainy Wednesday: 65 customers ÷ 20 = 3.25, rounded up to 4 baristas.',pause:true,focus:[0,262,800,92]},
  {title:'Posting a week ahead',text:'A week out, rain is possible Tuesday, Wednesday and Saturday. A posted schedule must cover all three: the dashed bars. It rains only Wednesday.',pause:true,setup:sim=>BioLab.setValues(sim,{posted:true,reveal:true})},
  {title:'The price of posting',text:'Posted, the week costs $4,256. Re-planned after the real forecast, $3,968. $4,256 − $3,968 = $288, and $288 ÷ $16 = 18 barista-hours of rain coverage the cafe did not need.',pause:true},
  {title:'Clopenings',text:'Back to the re-planned week. Red outlines mark a clopening: the same barista closes at 10 pm and opens the next morning. The red tag is the hours of rest in between, as little as 7.',pause:true,setup:sim=>BioLab.setValues(sim,{posted:false,noclop:false,reveal:true})},
  {title:'Ban it',text:'Turn on the 10-hour rule. The optimizer rebuilds the week. Look at the price: $0. Same hours, same cost; it just swaps who opens.',pause:true,setup:sim=>BioLab.setValues(sim,{noclop:true,reveal:true})},
  {lvl:'honors',title:'A short-staffed team',text:'With 6 baristas instead of 7, the people who close after Friday’s game are the ones Saturday needs early. Now the ban costs $8 a week, in overtime.',pause:true,setup:sim=>BioLab.setValues(sim,{noclop:true,posted:false,rainDays:3,staff:6,reveal:true})}
 ],
 lab:{bio:'<p><b>Question:</b> Which rule costs the cafe money: posting ahead or banning clopening?</p><ol><li>Turn on <b>Show the dollar amounts now</b>.</li><li>Record the price of posting ahead and the price of no clopening, with the football game on and off.</li><li>For posting ahead, divide the price by the $16 wage to get the extra barista-hours.</li></ol><p>Write one sentence for each rule: what did it change for the baristas, and what did it cost the cafe?</p>',
  honors:'<p><b>Question:</b> Which fairness rule is expensive, and why?</p><ol><li>For teams of 6, 7, 8 and 10 baristas, record the price of each rule.</li><li>Then set 7 baristas and record the price of posting ahead for 0 to 4 possible rain days.</li></ol><p>Explain which rule depends on team size and which depends on forecast uncertainty.</p>',
  ap:'<p><b>Question:</b> Is the price of two rules the sum of their prices?</p><ol><li>With 6 baristas and 3 possible rain days, record the cost with no rules, each rule alone, and pairs of rules.</li><li>Compare the price of each pair with the sum of the single prices.</li></ol><p><b>CER:</b> Use the idea of a feasible set to explain when prices add and when they do not.</p>'},
 terms:[
  {t:'Clopening',d:'Closing a store late and opening it early the next morning, with little rest in between.'},
  {t:'Optimizer',d:'Software that searches for the choice with the best value of a goal (here, the lowest labor cost) while following rules (constraints).'},
  {t:'Constraint',d:'A rule every acceptable answer must follow, like “at least 10 hours between shifts.”',lvl:'honors'},
  {t:'Price of a constraint',d:'How much the best possible cost rises when you add the rule. Sometimes it is zero.',lvl:'honors'},
  {t:'Feasible set',d:'All the answers that follow every constraint. More constraints make it smaller, so the best cost can only stay the same or get worse.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Forecast customers per hour come from typical weekday and weekend shapes (illustrations). Baristas needed each hour = customers ÷ customers per barista, rounded up, at least 1. Every day has an opener (5 am to 1 pm) and a closer (1 pm to 10 pm); helper shifts of 4 to 8 hours are stacked where more baristas are needed, and anyone working the last hour stays to clean until 10 pm. The optimizer assigns at most one shift per person per day, pays time-and-a-half past 40 hours, and pays time-and-a-half for a fill-in from another store when no one on the team can take a shift (an assumption). It searches with 12 random starts and local swaps, so it finds the cheapest schedule it can, not a proven minimum; prices compare against the cheapest schedule found under any rule. Rain adds 30% (an assumption) and actually falls Wednesday; a posted schedule covers every day rain was possible. The 20-hour floor pays the missing hours to baristas who want 20 or more. Real stores also deal with availability, call-outs and training, which this model leaves out.</p><p><b>From the book.</b> In <i>Weapons of Math Destruction</i> (Ch. 7), Cathy O’Neil describes clopening at Starbucks, McDonald’s and Walmart, and a 2014 <i>New York Times</i> story about Jannette Navarro, a single mother working as a barista. Starbucks then promised to end clopening and to post schedules at least a week ahead. A year later, O’Neil reports, managers were still clopening, because their pay depended on revenue per labor hour. Seattle passed a scheduling ordinance in 2017; research by the Shift Project found that afterward more workers got two weeks’ notice of their schedules and their sleep quality improved.</p><p><b>What the goal leaves out.</b> This optimizer’s goal is labor cost only. Rest between shifts and notice ahead of time enter only as rules you add, and each rule has a price you can read off. Another design could put rest and notice into the goal itself, with a dollar weight on each. Choosing those weights is a question about values, not math: what would you set them to, and who should decide? This is a simplified model, not workplace or legal advice.</p>'
};
SIM._t={model,postParts};BioLab.register(SIM);
})();
