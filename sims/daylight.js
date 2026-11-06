(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast,fmtNum,axes,legend}=BioLab.h;
/* Sinusoidal models y = A sin(B(t − C)) + D for three cases:
   day:   hours of daylight over a year, from the CBM model (Forsythe et al., 1995) with sunrise/sunset at the top of the Sun's disk (p = 0.8333°);
   wheel: a Ferris wheel rider's height, boarding at the bottom at t = 0;
   tide:  a simplified single-cycle tide with period 12.42 h. */
const R=Math.PI/180;
const f0=v=>fmtNum(v,0),f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const CITY={denver:{n:'Denver',lat:39.74},miami:{n:'Miami',lat:25.76},seattle:{n:'Seattle',lat:47.61}};
function cbm(J,L){const th=0.2163108+2*Math.atan(0.9671396*Math.tan(0.00860*(J-186)));const ph=Math.asin(0.39795*Math.cos(th));
  const x=(Math.sin(0.8333*R)+Math.sin(L*R)*Math.sin(ph))/(Math.cos(L*R)*Math.cos(ph));return 24-24/Math.PI*Math.acos(clamp(x,-1,1));}
const DAYS={};function days(c){if(!DAYS[c]){const a=[];for(let j=1;j<=365;j++)a.push(cbm(j,CITY[c].lat));DAYS[c]=a;}return DAYS[c];}
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],ML=[31,28,31,30,31,30,31,31,30,31,30,31];
function dateOf(j){j=Math.round(j);j=((j-1)%365+365)%365+1;let m=0;while(j>ML[m]){j-=ML[m];m++;}return MON[m]+' '+j;}
const MSTART=(()=>{const a=[1];for(let i=0;i<11;i++)a.push(a[i]+ML[i]);return a;})();
const hm=h=>{let H=Math.floor(h),M=Math.round((h-H)*60);if(M===60){H++;M=0;}return H+' h '+String(M).padStart(2,'0')+' min';};
const clock=h=>{h=((h%24)+24)%24;let H=Math.floor(h),M=Math.round((h-H)*60);if(M===60){H=(H+1)%24;M=0;}const ap=H<12?'a.m.':'p.m.';const h12=H%12===0?12:H%12;return h12+':'+String(M).padStart(2,'0')+' '+ap;};
const DEF_WHEEL={dia:50,plat:3,T:10},DEF_TIDE={mean:1.6,amp:1.1,th:3,P:12.42,need:2.0};
/* gut controls per case */
const GC={day:['dA','dD','dC','dP'],wheel:['wA','wD','wC','wP'],tide:['tA','tD','tC','tP']};
const caseOf=sim=>atLeast('honors')?sim.p.case:'day';
/* the true model for the current case: f(t), time window, sampling, and the max/min/period the math uses */
function model(sim){const c=caseOf(sim);
  if(c==='day'){const a=days(sim.p.city);let mx=-1,mn=99,jx=1,jn=1;a.forEach((v,i)=>{if(v>mx){mx=v;jx=i+1;}if(v<mn){mn=v;jn=i+1;}});
   return {c,f:t=>a[clamp(Math.round(t),1,365)-1],t0:1,t1:365,n:365,dots:MSTART.map(s=>s+14),max:mx,min:mn,tmax:jx,tmin:jn,P:365,ymin:6,ymax:18,unit:'h',xl:'Day of the year',yl:'Hours of daylight'};}
  if(c==='wheel'){const w=sim.st.wheel,r=w.dia/2,hub=r+w.plat;const top=Math.ceil((hub+r+6)/10)*10;
   return {c,f:t=>hub-r*Math.cos(2*Math.PI*t/w.T),t0:0,t1:2*w.T,n:400,dots:Array.from({length:17},(_,i)=>i*w.T/8),max:hub+r,min:w.plat,tmax:w.T/2,tmin:0,P:w.T,ymin:0,ymax:top,unit:'m',xl:'Minutes after you board',yl:'Your height (m)'};}
  const d=sim.st.tide;
  return {c,f:t=>d.mean+d.amp*Math.cos(2*Math.PI*(t-d.th)/d.P),t0:0,t1:25,n:500,dots:Array.from({length:26},(_,i)=>i),max:d.mean+d.amp,min:d.mean-d.amp,tmax:d.th,tmin:d.th+d.P/2,P:d.P,ymin:-0.5,ymax:4.5,unit:'m',xl:'Hours after midnight',yl:'Tide height (m)'};}
/* At Big picture the student sets only the middle level and the swing; the timing (C) is lined up for them. */
const gutPar=sim=>{const c=caseOf(sim),k=GC[c],p=sim.p,m=model(sim);return {A:p[k[0]],D:p[k[1]],C:atLeast('honors')?p[k[2]]:mathPar(m).C,P:atLeast('ap')?p[k[3]]:m.P};};
const big=()=>!atLeast('honors');
const parLabel=q=>big()?`middle ${f2(q.D)} h, swing ${f2(q.A)} h`:`A = ${f2(q.A)}, D = ${f2(q.D)}, C = ${f1(q.C)}`;
const curve=(q,t)=>q.A*Math.sin(2*Math.PI/q.P*(t-q.C))+q.D;
function mathPar(m){const P=m.P;let C=m.tmax-P/4;C=((C%P)+P)%P;return {A:(m.max-m.min)/2,D:(m.max+m.min)/2,C,P};}
function errs(sim,q){const m=model(sim);let s=0,w=0,wt=m.t0,N=0;for(let i=0;i<m.n;i++){const t=m.c==='day'?i+1:m.t0+(m.t1-m.t0)*i/(m.n-1);const e=Math.abs(curve(q,t)-m.f(t));s+=e;N++;if(e>w){w=e;wt=t;}}
  const u=m.c==='day'?60:1;return {mae:s/N*u,worst:w*u,wt};}
/* tide: hours in the window where the curve's go/no-go call for the boat is wrong */
function badHours(sim,q){const m=model(sim),need=sim.st.tide.need;let bad=0;const dt=0.05;for(let t=0;t<25;t+=dt){if((curve(q,t)>=need)!==(m.f(t)>=need))bad+=dt;}return bad;}
const scKey=sim=>{const c=caseOf(sim);return c+'|'+(c==='day'?sim.p.city:c==='wheel'?JSON.stringify(sim.st.wheel):JSON.stringify(sim.st.tide));};
const solved=sim=>sim.gutS&&sim.gutS.m&&sim.gutS.m.key===scKey(sim);
function vis(sim){const c=caseOf(sim),ui=sim.ui;if(!ui||!ui.ctlW)return;
  (sim.def.controls||[]).forEach(ct=>{const w=ui.ctlW[ct.id];if(!w)return;let on=atLeast(ct.lvl);
   if(ct.cs)on=on&&ct.cs===c;w.hidden=!on;});
  sim.def.metrics.forEach(m=>{const t=ui.tiles&&ui.tiles[m.id];if(!t)return;const el=t.num.closest('.tile');let on=atLeast(m.lvl);if(m.cs)on=on&&m.cs.includes(c);el.hidden=!on;});}
const setGut=(sim,q)=>{const k=GC[caseOf(sim)];sim.p[k[0]]=q.A;sim.p[k[1]]=q.D;sim.p[k[2]]=q.C;sim.p[k[3]]=q.P;};
const ctl=(id,label,cs,min,max,step,def,unit,lvl,help)=>({id,label,type:'range',min,max,step,def,unit,cs,lvl:lvl||(cs==='day'?undefined:'honors'),noTrial:true,help});

const SIM={
 id:'daylight',hash:'daylight',apUnit:9,order:1,tab:'Daylight, wheels and tides',kind:'Simulation',
 card:'Fit a sine curve to Denver’s daylight by eye, then build it from the longest day, the shortest day and the period, and see how many minutes the math saves.',
 title:'Fitting the seasons with a sine curve',
 lede:{bio:'Denver’s days stretch to about 15 hours in June and shrink to about 9 hours 20 minutes in December, then repeat every year. A sine curve can capture that whole pattern with four numbers.',
  honors:'For y = A sin(B(t − C)) + D, the amplitude A is half the distance from max to min, the midline D is their average, the period is 2π/B, and the phase shift C is when the curve crosses the midline going up. The same four numbers describe a Ferris wheel and a tide.',
  ap:'From the max, the min and the period: A = (max − min)/2, D = (max + min)/2, B = 2π/period, and C = (time of the max) − period/4. Real daylight is not a perfect sinusoid, so even the best sine curve misses by a few minutes.'},
 scale:{bio:'Hours of daylight in Denver (39.74° N) for every day of a 365-day year.',honors:'Daylight: hours per day over a year. Ferris wheel: meters above the ground over two turns. Tide: meters above the harbor’s reference level over 25 hours.'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your curve',
 controls:[
  {id:'case',label:'What repeats',type:'seg',def:'day',options:[{v:'day',l:'Daylight'},{v:'wheel',l:'Ferris wheel',lvl:'honors'},{v:'tide',l:'Tide',lvl:'honors'}],onChange(sim){vis(sim);}},
  {id:'city',label:'City',type:'seg',def:'denver',cs:'day',noTrial:true,options:[{v:'denver',l:'Denver'},{v:'miami',l:'Miami'},{v:'seattle',l:'Seattle'}]},
  ctl('dA','Amplitude A: swing above and below the middle','day',0,5,0.05,1,' h','',' '),
  ctl('dD','Midline D: the middle level','day',8,16,0.05,11,' h','',' '),
  ctl('dC','Phase shift C: day the curve crosses the middle going up','day',0,365,1,0,' days','honors'),
  ctl('dP','Period: days for one full cycle','day',300,430,1,365,' days','ap'),
  ctl('wA','Amplitude A','wheel',0,45,0.5,10,' m'),
  ctl('wD','Midline D','wheel',0,60,0.5,20,' m'),
  ctl('wC','Phase shift C','wheel',0,20,0.1,0,' min'),
  ctl('wP','Period','wheel',2,20,0.1,10,' min','ap'),
  ctl('tA','Amplitude A','tide',0,3,0.05,0.5,' m'),
  ctl('tD','Midline D','tide',0,4,0.05,1,' m'),
  ctl('tC','Phase shift C','tide',0,13,0.05,0,' h'),
  ctl('tP','Period','tide',6,18,0.05,12,' h','ap'),
  {id:'parts',label:'Label the parts of my curve',type:'toggle',def:false,lvl:'honors',help:'Marks the midline, amplitude, phase shift and period.'}
 ],
 actions:[{id:'fit',label:'Fit from the max, min and period',lvl:'honors',run(sim){setGut(sim,mathPar(model(sim)));(sim.def.controls||[]).forEach(c=>{if(sim.ui.ctl[c.id])sim.ui.ctl[c.id].set(sim.p[c.id]);});}}],
 init(){return {wheel:Object.assign({},DEF_WHEEL),tide:Object.assign({},DEF_TIDE)};},step(){},
 onLevel(sim){vis(sim);const W=sim.ui.ctlW||{},b=big();
  const set=(id,l,h)=>{const w=W[id];if(!w)return;const L=w.querySelector('label');if(L)L.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('dD',b?'Middle level: hours of daylight':'Midline D: the middle level',b?'Where the curve sits halfway between its top and bottom.':' ');
  set('dA',b?'Swing: hours above and below the middle':'Amplitude A: swing above and below the middle',b?'How far the curve rises above the middle and dips below it.':' ');},
 metrics:[
  {id:'errMin',label:'Your curve’s average error',unit:'min',d:1,min:0,max:120,cs:['day'],get:sim=>caseOf(sim)==='day'?errs(sim,gutPar(sim)).mae:null},
  {id:'worstMin',label:'Your curve’s worst day',unit:'min',d:0,min:0,max:240,cs:['day'],get:sim=>caseOf(sim)==='day'?errs(sim,gutPar(sim)).worst:null},
  {id:'errM',label:'Your curve’s average error',unit:'m',d:2,lvl:'honors',min:0,max:null,cs:['wheel','tide'],get:sim=>caseOf(sim)!=='day'?errs(sim,gutPar(sim)).mae:null},
  {id:'worstM',label:'Your curve’s worst miss',unit:'m',d:2,lvl:'honors',min:0,max:null,cs:['wheel','tide'],get:sim=>caseOf(sim)!=='day'?errs(sim,gutPar(sim)).worst:null},
  {id:'bad',label:'Hours your curve gets the boat call wrong',unit:'h',d:1,lvl:'honors',min:0,max:25,cs:['tide'],get:sim=>caseOf(sim)==='tide'?badHours(sim,gutPar(sim)):null},
  {id:'B',label:'B = 2π ÷ your period',unit:'',d:4,lvl:'ap',min:0,max:null,get:sim=>2*Math.PI/gutPar(sim).P}
 ],
 graphs:[{id:'err',label:'Your curve minus the real values',custom:true}],defaultGraph:'err',
 plot(sim,ctx,box){const m=model(sim),u=m.c==='day'?60:1,g=gutPar(sim),G=sim.gutS,sv=solved(sim),mp=mathPar(m);
  const pts=q=>{const a=[];for(let i=0;i<=200;i++){const t=m.t0+(m.t1-m.t0)*i/200;a.push([t,(curve(q,t)-m.f(t))*u]);}return a;};
  const P1=pts(g),P2=sv?pts(mp):[],all=P1.concat(P2).map(p=>Math.abs(p[1]));let top=Math.max(m.c==='day'?10:0.5,...all)*1.1;top=Math.ceil(top/(m.c==='day'?10:0.5))*(m.c==='day'?10:0.5);
  box.T=30;box.H=box.ch-30-40;
  const ax=axes(ctx,box,{xmin:m.t0,xmax:m.t1,ymin:-top,ymax:top,xl:m.xl,yl:'Error ('+(m.c==='day'?'min':'m')+')'});
  const ln=(P,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash||[]);ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(ax.X(p[0]),ax.Y(p[1])):ctx.moveTo(ax.X(p[0]),ax.Y(p[1])));ctx.stroke();ctx.setLineDash([]);};
  ln(P1,PAL['rj']);if(sv)ln(P2,PAL['s3']);legend(ctx,box.L,14,sv?[{label:'Your curve',color:PAL['rj']},{label:'Math fit',color:PAL['s3']}]:[{label:'Your curve',color:PAL['rj']}]);},
 draw(sim,ctx,vdt,k){const m=model(sim),g=gutPar(sim),G=sim.gutS,sv=solved(sim),mp=mathPar(m),kk=Math.min(k,1.6);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=58+8*kk,T=44+10*kk,Wd=800-L-18,H=450-T-34-14*kk;const X=t=>L+(t-m.t0)/(m.t1-m.t0)*Wd,Y=y=>T+H-(y-m.ymin)/(m.ymax-m.ymin)*H;
  /* title */
  const ttl=m.c==='day'?CITY[sim.p.city].n+': hours of daylight':m.c==='wheel'?'Ferris wheel: rider’s height':'Harbor tide height';
  txt(ctx,ttl,L,24+6*kk,{s:16*kk,w:700});
  /* grid and axes */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const ys=m.c==='day'?2:m.c==='wheel'?(m.ymax>60?20:10):1;
  for(let y=Math.ceil(m.ymin/ys)*ys;y<=m.ymax+1e-9;y+=ys){ctx.beginPath();ctx.moveTo(L,Y(y));ctx.lineTo(L+Wd,Y(y));ctx.stroke();txt(ctx,String(y),L-8,Y(y),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});}
  if(m.c==='day'){MSTART.forEach((s,i)=>{ctx.beginPath();ctx.moveTo(X(s),T);ctx.lineTo(X(s),T+H);ctx.stroke();if(k<1.5||i%2===0)txt(ctx,MON[i],X(s+15),T+H+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});});}
  else{const st=m.c==='wheel'?(m.t1>24?5:m.t1>12?2:1):2;for(let t=0;t<=m.t1+1e-9;t+=st){ctx.beginPath();ctx.moveTo(X(t),T);ctx.lineTo(X(t),T+H);ctx.stroke();if(k<1.5||(t/st)%2===0)txt(ctx,String(t),X(t),T+H+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}}
  ctx.strokeStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,T+H);ctx.lineTo(L+Wd,T+H);ctx.stroke();
  txt(ctx,m.yl,L,T-8,{s:12*k,c:PAL['cv-soft']});
  ctx.save();ctx.beginPath();ctx.rect(L,T,Wd,H);ctx.clip();
  /* tide: boat threshold and the safe windows */
  if(m.c==='tide'){const need=sim.st.tide.need;ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.12;let s=null;for(let t=0;t<=25.001;t+=0.05){const ok=m.f(t)>=need;if(ok&&s===null)s=t;if((!ok||t>24.97)&&s!==null){ctx.fillRect(X(s),T,X(t)-X(s),H);s=null;}}ctx.globalAlpha=1;
   ctx.setLineDash([8,6]);ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L,Y(need));ctx.lineTo(L+Wd,Y(need));ctx.stroke();ctx.setLineDash([]);}
  /* math fit */
  const path=(q,col,w,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();for(let i=0;i<=300;i++){const t=m.t0+(m.t1-m.t0)*i/300;const y=Y(curve(q,t));i?ctx.lineTo(X(t),y):ctx.moveTo(X(t),y);}ctx.stroke();ctx.setLineDash([]);};
  if(sv)path(mp,PAL['s3'],3);
  /* the gut curve, if the student has moved on from it */
  const gk=G&&G.g&&G.g.key===scKey(sim);
  if(gk&&(Math.abs(G.g.q.A-g.A)+Math.abs(G.g.q.D-g.D)+Math.abs(G.g.q.C-g.C)+Math.abs(G.g.q.P-g.P))>1e-6)path(G.g.q,PAL['s4'],2.5,[7,5]);
  /* parts of the current curve */
  if(sim.p.parts&&atLeast('honors')){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(L,Y(g.D));ctx.lineTo(L+Wd,Y(g.D));ctx.stroke();ctx.setLineDash([]);}
  const same=sv&&Math.abs(g.A-mp.A)+Math.abs(g.D-mp.D)+Math.abs(g.C-mp.C)+Math.abs(g.P-mp.P)<1e-6;if(!same)path(g,PAL['rj'],3);
  /* data dots */
  ctx.fillStyle=PAL['cv-ink'];m.dots.forEach(t=>{if(t<m.t0||t>m.t1)return;ctx.beginPath();ctx.arc(X(t),Y(m.f(t)),4.5,0,7);ctx.fill();});
  ctx.restore();
  /* labeled parts */
  if(sim.p.parts&&atLeast('honors')){const P=g.P,tc=g.C,tpk=tc+P/4;const u=m.unit;
   const inR=t=>t>=m.t0&&t<=m.t1;let t1=tc;while(t1<m.t0)t1+=P;while(t1-P>=m.t0)t1-=P;
   txt(ctx,'midline D = '+f2(g.D)+' '+u,L+Wd-6,Y(g.D)-8,{s:12*k,w:700,c:PAL['s5'],a:'right'});
   let tp=t1+P/4;if(!inR(tp))tp-=P;if(inR(tp)){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(tp),Y(g.D));ctx.lineTo(X(tp),Y(g.D+g.A));ctx.stroke();txt(ctx,'A = '+f2(g.A),X(tp)+6,(Y(g.D)+Y(g.D+g.A))/2,{s:12*k,w:700,c:PAL['s5'],b:'middle'});}
   if(inR(t1)){ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(t1),Y(g.D),5,0,7);ctx.fill();txt(ctx,'C',X(t1),Y(g.D)+18*k,{s:12*k,w:700,c:PAL['s5'],a:'center'});}
   if(inR(t1)&&inR(t1+P)){const yb=T+12;ctx.strokeStyle=PAL['s5'];ctx.beginPath();ctx.moveTo(X(t1),yb);ctx.lineTo(X(t1+P),yb);ctx.stroke();txt(ctx,'one period = '+f1(P)+(m.c==='day'?' days':m.c==='wheel'?' min':' h'),(X(t1)+X(t1+P))/2,yb+14*k,{s:12*k,w:700,c:PAL['s5'],a:'center'});}}
  /* legend line under the title */
  let lx=L+300*kk;const leg=(label,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash(dash?[6,4]:[]);ctx.beginPath();ctx.moveTo(lx,22+6*kk);ctx.lineTo(lx+18,22+6*kk);ctx.stroke();ctx.setLineDash([]);ctx.font='700 '+(12*k)+'px '+FONT;txt(ctx,label,lx+24,22+6*kk,{s:12*k,w:700,c:col,b:'middle'});lx+=ctx.measureText(label).width+44;};
  if(k<1.5){ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(lx+6,22+6*kk,4.5,0,7);ctx.fill();const rl=m.c==='tide'?'Measured':'Real';txt(ctx,rl,lx+16,22+6*kk,{s:12*k,w:700,c:PAL['cv-ink'],b:'middle'});ctx.font='700 '+(12*k)+'px '+FONT;lx+=ctx.measureText(rl).width+40;
   if(!(sv&&Math.abs(g.A-mp.A)+Math.abs(g.D-mp.D)+Math.abs(g.C-mp.C)+Math.abs(g.P-mp.P)<1e-6))leg('Your curve',PAL['rj']);if(sv)leg('Math fit',PAL['s3']);if(gk&&(Math.abs(G.g.q.A-g.A)+Math.abs(G.g.q.D-g.D)+Math.abs(G.g.q.C-g.C)+Math.abs(G.g.q.P-g.P))>1e-6)leg('Your gut',PAL['s4'],true);}
  if(m.c==='tide'){ctx.font='700 '+(12*k)+'px '+FONT;const bl='Boat needs '+f1(sim.st.tide.need)+' m',bw=ctx.measureText(bl).width;pill(ctx,bl,L+Wd-bw/2-14,Y(sim.st.tide.need),PAL['card'],PAL['s2'],12*k);}},
 narrate(sim){const m=model(sim),g=gutPar(sim),e=errs(sim,g),sv=solved(sim),mp=mathPar(m);
  if(m.c==='day'){if(e.mae<5)return `<b>Your curve hugs the real values.</b> It misses by ${f1(e.mae)} min on an average day. Real daylight is not a perfect sine wave, so no sine curve gets every day exactly.`;
   return `The real values swing from ${hm(m.min)} (${dateOf(m.tmin)}) to ${hm(m.max)} (${dateOf(m.tmax)}). Your curve misses by <b>${f0(e.mae)} min</b> on an average day and by ${f0(e.worst)} min around ${dateOf(e.wt)}.`;}
  if(m.c==='wheel'){const w=sim.st.wheel;return `The wheel is ${w.dia} m across with the bottom ${w.plat} m up, and one turn takes ${w.T} min. <b>The middle of the wheel is the midline</b> and its radius is the amplitude. Your curve misses by ${f2(e.mae)} m on average.`;}
  const b=badHours(sim,g);return `The tide rises above the ${f1(sim.st.tide.need)} m the boat needs during the green windows. Your curve gets the go/no-go call wrong for <b>${f1(b)} of the next 25 hours</b>.`;},
 gut:{better:'lower',
  controls:['dD','dA'],
  ask:{bio:'The dots are Denver’s real daylight, one per month. Drag the two sliders here until your red curve runs through the dots: first its middle level, then how far it swings up and down. Go by eye, then lock it in.',honors:'Set your curve by eye so it runs through the dots. No calculating yet. Then lock it in.'},
  lockLabel:'Lock in my curve',
  lock(sim){const q=gutPar(sim),e=errs(sim,q);return {v:e.mae,worst:e.worst,wt:e.wt,q,key:scKey(sim),c:caseOf(sim),T:sim.st.wheel.T,bad:caseOf(sim)==='tide'?badHours(sim,q):0,label:parLabel(q)+(atLeast('ap')?`, period ${f1(q.P)}`:'')};},
  solve(sim){const m=model(sim),q=mathPar(m);setGut(sim,q);const e=errs(sim,q);return {v:e.mae,worst:e.worst,wt:e.wt,q,key:scKey(sim),c:caseOf(sim),T:sim.st.wheel.T,bad:caseOf(sim)==='tide'?badHours(sim,q):0,label:parLabel(q)+(big()?'':`, period ${f2(q.P)}`)};},
  how:{bio:'The middle level is the average of the longest and shortest days: (longest + shortest) ÷ 2. The swing is half the gap between them: (longest − shortest) ÷ 2. Those two numbers, plus the date of the longest day and the 365-day year, build the whole curve.',
   honors:'Amplitude = (max − min) ÷ 2. Midline = (max + min) ÷ 2. The curve crosses the midline going up a quarter period before its peak, so C = (time of the max) − period ÷ 4.',
   ap:'A = (max − min)/2, D = (max + min)/2, B = 2π/period, C = t(max) − period/4. For daylight, with a period of 365 days, B = 2π/365 ≈ 0.0172 per day.'},
  compare(sim,g,m){const c=g.c,u=c==='day'?'min':'m',fmt=v=>c==='day'?f0(v)+' min':f2(v)+' m';
   if(g.v<=m.v+(c==='day'?1:0.02))return `Your gut was right on: your curve is as close as the math’s (${fmt(g.v)} average error against ${fmt(m.v)}). Your eye already found the max, the min and the timing. The formulas show why those four numbers are all a sine curve needs.`;
   if(c==='day')return `Your curve was off by <b>${f0(g.v)} min a day</b> on average, and by ${f0(g.worst)} min around ${dateOf(g.wt)}. The math’s curve, built from just the longest day, the shortest day and the 365-day period, is off by <b>${f1(m.v)} min</b> on average and ${f0(m.worst)} min at worst. That is ${f0(g.v-m.v)} minutes a day closer, with four numbers instead of a 365-row table.`;
   if(c==='wheel'){const P=g.q.P,topT=((g.q.C+P/4)%P+P)%P,real=g.T/2,dd=((topT-real+P/2)%P+P)%P-P/2,ds=dd*60;
    return `Your curve was off by <b>${f2(g.v)} m</b> on average and ${f1(g.worst)} m at its worst. The math’s curve matches the wheel exactly. A ride photo timed from your curve would snap ${Math.abs(ds)<1?'right at the top':`<b>${f0(Math.abs(ds))} s ${ds<0?'early':'late'}</b>`}; the math’s curve times it to the top, ${f1(real)} min after you board.`;}
   return `Your curve gets the boat’s go/no-go call wrong for <b>${f1(g.bad)} of the next 25 hours</b>, and misses the water level by ${f2(g.v)} m on average. The math’s curve, built from the high tide, the low tide and the 12.42-hour period, gets the call right all ${m.bad<0.05?'25 hours':f1(25-m.bad)+' hours'}.`;},
  again(sim){const hon=atLeast('honors'),r=Math.random();let c=hon?(r<0.34?'day':r<0.67?'wheel':'tide'):'day';
   sim.p.case=c;
   if(c==='day'){const cs=Object.keys(CITY).filter(x=>x!==sim.p.city);sim.p.city=Math.random()<0.4?sim.p.city:cs[Math.floor(Math.random()*cs.length)];}
   if(c==='wheel'){const dias=[40,50,60,70,80],Ts=[6,8,10,12,15];sim.st.wheel={dia:dias[Math.floor(Math.random()*5)],plat:2+Math.floor(Math.random()*3),T:Ts[Math.floor(Math.random()*5)]};}
   if(c==='tide'){sim.st.tide={mean:+(1.2+Math.random()*1.2).toFixed(1),amp:+(0.6+Math.random()*1.0).toFixed(1),th:+(Math.random()*12).toFixed(1),P:12.42,need:2.0};}
   const d={day:[1,11,0,365],wheel:[10,20,0,10],tide:[0.5,1,0,12]}[c],k=GC[c];k.forEach((id,i)=>sim.p[id]=d[i]);
   vis(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'When do Denver’s days get longer the fastest?',choices:['Near the June solstice, when days are longest','Near the March equinox, when the curve crosses its midline','Near the December solstice, when days are shortest'],correct:1,explain:'A sine curve is steepest where it crosses its midline and flat at its peaks. Around March 21, Denver gains about 2.6 minutes of daylight per day. Around June 21 the change is under a tenth of a minute per day.'},
  {lvl:'bio',instant:true,q:'Denver’s longest day is about 14 h 59 min and its shortest is about 9 h 21 min. What is the midline of the daylight curve?',choices:['About 12 h 10 min','About 5 h 38 min','About 2 h 49 min','About 24 h 20 min'],correct:0,explain:'The midline is the average of the max and min: (14.99 + 9.35) ÷ 2 ≈ 12.17 h, about 12 h 10 min. Half the difference, (14.99 − 9.35) ÷ 2 ≈ 2.82 h, is the amplitude.'},
  {lvl:'honors',instant:true,q:'A Ferris wheel is 50 m across, and its lowest seat is 3 m off the ground. What are the amplitude and midline of a rider’s height?',choices:['A = 50 m, D = 25 m','A = 25 m, D = 28 m','A = 25 m, D = 25 m','A = 28 m, D = 53 m'],correct:1,explain:'The amplitude is the radius, 25 m. The midline is the height of the wheel’s center: 3 m + 25 m = 28 m. The rider swings from 3 m up to 53 m.'},
  {lvl:'honors',instant:true,q:'High tide is at 3:00 a.m. and the tide’s period is 12.42 hours. When is the next high tide?',choices:['3:00 p.m.','About 3:25 p.m.','About 9:13 a.m.','About 4:00 p.m.'],correct:1,explain:'One period later: 3:00 + 12.42 h = 15.42 h, which is 3:25 p.m. (0.42 h ≈ 25 min). That extra 25 minutes is why high tide comes later each day. Low tide falls halfway between, around 9:13 a.m.'},
  {lvl:'ap',instant:true,q:'Daylight repeats every 365 days. What is B in y = A sin(B(t − C)) + D, with t in days?',choices:['365','2π × 365','2π ÷ 365 ≈ 0.0172','365 ÷ 2π ≈ 58.1'],correct:2,explain:'The period is 2π/B, so B = 2π/period = 2π/365 ≈ 0.0172 radians per day.'},
  {lvl:'ap',instant:true,q:'A rider boards a 50 m Ferris wheel at the bottom at t = 0, and one turn takes 10 min. In y = 25 sin((2π/10)(t − C)) + 28, what is C?',choices:['0 min','2.5 min','5 min','10 min'],correct:1,explain:'The rider reaches the top at t = 5 min. A sine curve peaks a quarter period after it crosses the midline going up, so C = 5 − 10/4 = 2.5 min. Check: at t = 0, 25 sin(−π/2) + 28 = 3 m, the bottom seat.'}
 ],
 tour:[
  {title:'A year of daylight',text:'Each dot is Denver’s daylight on the 15th of a month. Days stretch to about 15 hours in late June and shrink to about 9 hours 20 minutes in late December, every year.',pause:true,setup:sim=>BioLab.setValues(sim,{case:'day',city:'denver',dA:0,dD:8,dC:0,dP:365,parts:false})},
  {title:'The midline',text:'Start with the middle level. The middle level, or midline, is the average of the longest and shortest days: (14.99 + 9.35) ÷ 2 ≈ 12.17 hours. A flat line there misses most dots, but it is centered.',pause:true,setup:sim=>BioLab.setValues(sim,{dA:0,dD:12.15})},
  {title:'The amplitude',text:{bio:'The swing, or amplitude, is how far the curve rises above the middle and dips below it: (14.99 − 9.35) ÷ 2 ≈ 2.82 hours. The curve now has the right height.',honors:'The amplitude is how far the curve swings above and below the midline: (14.99 − 9.35) ÷ 2 ≈ 2.82 hours. The curve now has the right height, but its timing is off.'},pause:true,setup:sim=>BioLab.setValues(sim,{dA:2.8,dD:12.15,dC:0})},
  {title:{bio:'The timing',honors:'The phase shift'},text:{bio:'The curve must peak on the longest day, June 22 (day 173 of the year). It crosses its middle going up a quarter year earlier, about March 22. At this level the tool lines up that timing for you; at Closer look you slide it yourself.',honors:'Slide the curve sideways. The longest day is June 22, day 173. A sine curve peaks a quarter period after it crosses the midline going up, so C = 173 − 365 ÷ 4 ≈ 82: about March 22.'},pause:true,setup:sim=>BioLab.setValues(sim,{dA:2.8,dD:12.15,dC:82})},
  {lvl:'ap',title:'The period and B',text:'One cycle takes 365 days, so B = 2π ÷ 365 ≈ 0.0172 radians per day. The whole model is y = 2.82 sin(0.0172(t − 81.75)) + 12.17.',pause:true,setup:sim=>BioLab.setValues(sim,{dA:2.82,dD:12.17,dC:82,dP:365,parts:true})},
  {title:'How close is close?',text:'The fitted curve misses Denver’s real daylight by about 4 minutes on an average day and about 12 minutes on its worst. Real daylight is not a perfect sine wave, but four numbers get remarkably close.',pause:true,setup:sim=>BioLab.setValues(sim,{dA:2.82,dD:12.17,dC:82,dP:365,parts:false})},
  {lvl:'honors',title:'Same math, different ride',text:'A Ferris wheel 50 m across, with its lowest seat 3 m up and one turn every 10 minutes: amplitude 25 m, midline 28 m, period 10 min, and C = 2.5 min because you board at the bottom.',pause:true,setup:sim=>BioLab.setValues(sim,{case:'wheel',wA:25,wD:28,wC:2.5,wP:10})},
  {title:'Your turn',text:'Close this walkthrough and try the Gut vs. math box at the top: fit the curve by eye, lock it in, then let the formulas take a turn.',pause:true,setup:sim=>BioLab.setValues(sim,{case:'day',city:'denver',dA:1,dD:11,dC:0,dP:365,parts:false})}
 ],
 onTourExit(sim){vis(sim);},
 lab:{bio:'<p><b>Question:</b> How does a city’s distance from the equator change its daylight curve?</p><ol><li>For Miami, Denver and Seattle, fit the curve by eye and record a trial with your error.</li><li>Write down the amplitude and midline you used for each city.</li></ol><p>Write one sentence: which part of the curve changes most as you go north, and which barely changes?</p>',
  honors:'<p><b>Question:</b> Do the max-and-min formulas work for every repeating pattern?</p><ol><li>For each case (daylight, Ferris wheel, tide), fit by eye, record a trial, then press <b>Fit from the max, min and period</b> and record again.</li><li>Turn on <b>Label the parts</b> and explain what each number means in that situation.</li></ol>',
  ap:'<p><b>Question:</b> Why does the daylight fit miss by a few minutes while the Ferris wheel fit is exact?</p><ol><li>Fit both. Use the graph below to see where the daylight fit’s error is biggest.</li><li>Try nudging the period or phase shift to lower the daylight error.</li></ol><p><b>CER:</b> Explain, using the error graph, why a sine curve is an exact model for one case and an approximation for the other.</p>'},
 terms:[
  {t:'Sinusoid',d:'A curve shaped like y = A sin(B(t − C)) + D: a smooth wave that repeats.'},
  {t:'Amplitude',d:'How far the wave swings above and below its midline: (max − min) ÷ 2.'},
  {t:'Midline',d:'The middle level of the wave: (max + min) ÷ 2.'},
  {t:'Period',d:'How long one full cycle takes. For y = A sin(B(t − C)) + D, the period is 2π/B.',lvl:'honors'},
  {t:'Phase shift',d:'C: how far the wave slides sideways. Here it is the time the curve crosses its midline going up.',lvl:'honors'},
  {t:'Solstice and equinox',d:'Solstices are the longest and shortest days (around June 21 and December 21). Equinoxes (around March 20 and September 22) are when daylight changes fastest.',lvl:'honors'}
 ],
 about:'<p><b>Daylight</b> comes from the CBM model (Forsythe and others, 1995): for day J of a 365-day year, θ = 0.2163108 + 2 atan(0.9671396 tan(0.00860(J − 186))), the Sun’s declination is φ = asin(0.39795 cos θ), and daylight = 24 − (24/π) acos[(sin 0.8333° + sin L sin φ)/(cos L cos φ)] hours at latitude L. The 0.8333° counts sunrise and sunset when the top of the Sun meets a flat horizon, including the bending of light by the air. Latitudes: Denver 39.74° N, Miami 25.76° N, Seattle 47.61° N. Mountains, leap years and time zones are ignored.</p><p><b>Ferris wheel</b> and <b>tide</b> are made-up examples, not a real ride or a real harbor. Real tides mix several cycles; this one uses a single 12.42-hour cycle, the main tide in many places. The boat’s 2.0 m need is an example. The “math fit” uses only the max, the min and the period, as you would in class. It is not a least-squares fit, so a careful hand fit of the daylight data can come out a hair better.</p>'
};
BioLab.register(SIM);
})();
