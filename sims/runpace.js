(function(){
'use strict';
const {clamp,rng,randn,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* A 5K run. Time t is in seconds, position s(t) in meters along the course, speed v(t) = s'(t) in m/s.
   v(t) = a − f·t/1500 − hill(t) − water(t) + w·sin(2πt/per + ph); hill and water are raised-cosine dips.
   s(t) is the exact antiderivative, so the tool knows the true speed at every instant. */
const MILE=1609.344,TWO=2*Math.PI;
const dip=(t,c,wd,dp)=>Math.abs(t-c)<=wd/2?dp*(1+Math.cos(TWO*(t-c)/wd))/2:0;
const dipInt=(t,c,wd,dp)=>{const a=c-wd/2;if(t<=a)return 0;if(t>=c+wd/2)return dp*wd/2;const u=t-a;return dp/2*(u-wd/(TWO)*Math.sin(TWO*u/wd));};
/* The plain run without the water stop, used to find where 3 km falls. */
function base(q,t){return q.a*t-q.f*t*t/3000-dipInt(t,q.hc,q.hw,q.hd)+q.w*q.per/TWO*(Math.cos(q.ph)-Math.cos(TWO*t/q.per+q.ph));}
function solveT(f,target){let lo=0,hi=4000;for(let i=0;i<80;i++){const m=(lo+hi)/2;f(m)<target?lo=m:hi=m;}return (lo+hi)/2;}
function makeRun(seed){let q;
  if(seed===1)q={a:3.55,f:0.15,hc:540,hw:240,hd:0.7,w:0.08,per:300,ph:0,wd:30,wdp:1.2};
  else{const r=rng(seed*7919+13),u=(a,b)=>a+(b-a)*r();const hw=u(180,300);
   q={a:u(3.05,3.85),f:u(0,0.3),hw,hc:540+u(-0.35,0.35)*hw,hd:u(0.4,0.9),w:u(0,0.12),per:u(200,400),ph:u(0,TWO),wd:30,wdp:u(0.8,1.4)};}
  q.seed=seed;q.wc=solveT(t=>base(q,t),3000);
  q.T5=solveT(t=>pos(q,t),5000);
  /* GPS noise: one reading per second, each off by a normal error with a 3 m standard deviation (seeded). */
  const r2=rng(seed*104729+7),n=Math.ceil(q.T5)+400;q.noise=new Float64Array(n);for(let i=0;i<n;i++)q.noise[i]=3*randn(r2);
  return q;}
function pos(q,t){return base(q,t)-dipInt(t,q.wc,q.wd,q.wdp);}
function spd(q,t){return q.a-q.f*t/1500-dip(t,q.hc,q.hw,q.hd)-dip(t,q.wc,q.wd,q.wdp)+q.w*Math.sin(TWO*t/q.per+q.ph);}
const R=sim=>sim.st.run;
const t0=sim=>sim.p.when==='water'?R(sim).wc:540;
/* What the app records: exact positions, or (Deep dive) positions with GPS error at whole seconds. */
function reading(sim,t){const q=R(sim);if(!(atLeast('ap')&&sim.p.noise))return pos(q,t);const i=clamp(Math.round(t),0,q.noise.length-1);return pos(q,t)+q.noise[i];}
function secant(sim,h){const a=t0(sim);return (reading(sim,a+h)-reading(sim,a))/h;}
const now=sim=>spd(R(sim),t0(sim));
const shown=sim=>!!(sim.st.peek||(sim.gutS&&sim.gutS.g));
const pace=v=>{if(!(v>0.3))return '?';let s=Math.round(MILE/v);const m=Math.floor(s/60);s-=m*60;return m+':'+String(s).padStart(2,'0');};
const clock=t=>{t=Math.round(t);const m=Math.floor(t/60),s=t-m*60;return m+':'+String(s).padStart(2,'0');};
const f2=v=>fmtNum(v,2);
const where=sim=>sim.p.when==='water'?'the water stop':'9:00';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)&&!(sim.guide&&sim.guide.keep)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function relabel(sim){const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW.guess;if(!w)return;const o=w.querySelector('output');if(!o)return;const s=f2(sim.p.guess)+' m/s ('+pace(sim.p.guess)+' per mile)';if(o.textContent!==s)o.textContent=s;}

const SIM={
 id:'runpace',hash:'runpace',apUnit:16,order:1,tab:'How fast right now?',kind:'Simulation',next:['battery'],
 card:'Guess your speed at one moment of a 5K from your running app’s position log, then shrink the time interval until the math pins it down.',
 title:'How fast am I going right now?',
 lede:{bio:'Your running app only knows where you are. To show your speed “right now,” it has to compare two positions a short time apart. The shorter the gap, the closer it gets to your speed at that instant.',
  honors:'Average speed over an interval is the slope of a secant line on the position graph. As the interval shrinks, the secant slopes approach one number: the slope of the tangent line, your instantaneous speed.',
  ap:'Instantaneous speed is the derivative s′(t) = lim (h → 0) [s(t + h) − s(t)] / h. Real GPS readings carry a few meters of error, so an app cannot actually let h shrink to zero; it averages over a few seconds instead.'},
 scale:'One community 5K (5,000 m). The app logs your position along the course once per second; dots show every 15th reading on the left and every 5th in the close-up.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your run',
 controls:[
  {id:'when',label:'Which moment?',type:'seg',def:'t9',noGut:true,onChange:clearGut,options:[{v:'t9',l:'The 9:00 mark'},{v:'water',l:'The water stop'}],help:'At 9:00 you are partway up the course’s one hill. The water stop is a table about 3 km in, where you slow down to grab a cup.'},
  {id:'guess',label:'Your gut: your speed at that moment',type:'range',min:1.5,max:5.5,step:0.05,def:4.5,unit:' m/s',help:'Tilt the orange line until it is as steep as your position curve right at that moment. For reference, 3.0 m/s is a pace of 8:56 per mile.'},
  {id:'win',label:'Interval for the average (seconds after the moment)',type:'range',min:1,max:240,step:1,def:240,unit:' s',noGut:true,help:'The app divides the distance you covered in this interval by its length. Drag it toward 1 s.'},
  {id:'noise',label:'Add real GPS error',type:'toggle',def:false,lvl:'ap',noGut:true,help:'Each one-second reading is off by a random amount, about 3 m typically (an assumption for illustration).'}
 ],
 actions:[
  {id:'peek',label:'Skip the guess and show the math',run(sim){sim.st.peek=true;}},
  {id:'newrun',label:'New run',run(sim){sim.st={run:makeRun(2+Math.floor(Math.random()*1e6))};sim.st.peek=false;clearGut(sim);}}
 ],
 init(){return {run:makeRun(1)};},step(){},
 metrics:[
  {id:'sec',label:'Average speed over the interval',unit:'m/s',d:2,min:0,max:6,get:sim=>shown(sim)?secant(sim,sim.p.win):null},
  {id:'secpace',label:'That average as a pace',unit:'per mile',text:true,get:sim=>shown(sim)?pace(secant(sim,sim.p.win)):'?'},
  {id:'now',label:'Speed right at that moment',unit:'m/s',d:2,lvl:'honors',min:0,max:6,get:sim=>shown(sim)?now(sim):null},
  {id:'avg',label:'Average speed for the whole 5K',unit:'m/s',d:2,min:0,max:6,get:sim=>5000/R(sim).T5},
  {id:'fin',label:'Finish time',unit:'min:s',text:true,get:sim=>clock(R(sim).T5)},
  {id:'err',label:'Interval average minus speed right now',unit:'m/s',d:3,lvl:'ap',min:-3,max:3,get:sim=>shown(sim)?secant(sim,sim.p.win)-now(sim):null}
 ],
 graphs:[{id:'shrink',label:'Average speed as the interval shrinks',custom:true}],defaultGraph:'shrink',
 plot(sim,ctx,box){const tr=now(sim);
  if(!shown(sim)){axes(ctx,box,{xmin:0,xmax:240,ymin:0,ymax:5,xl:'Interval length (s)',yl:'Average speed (m/s)'});txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const pts=[];for(let h=1;h<=240;h++)pts.push([h,secant(sim,h)]);let lo=Math.min(tr,...pts.map(p=>p[1])),hi=Math.max(tr,...pts.map(p=>p[1]));const pad=Math.max(0.1,(hi-lo)*0.15);lo=Math.max(0,lo-pad);hi=hi+pad;
  const ax=axes(ctx,box,{xmin:0,xmax:240,ymin:lo,ymax:hi,xl:'Interval length (s): shrink it toward 0',yl:'Average speed (m/s)'});
  ctx.strokeStyle=PAL['s3'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(tr));ctx.lineTo(ax.X(240),ax.Y(tr));ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(ax.X(p[0]),ax.Y(p[1])):ctx.moveTo(ax.X(p[0]),ax.Y(p[1])));ctx.stroke();
  const h=sim.p.win;ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(h),ax.Y(secant(sim,h)),6,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+12,[{label:'Average over the interval',color:PAL['rj']},{label:'Speed right now',color:PAL['s3'],dash:true}]);},
 draw(sim,ctx,vdt,k){relabel(sim);const q=R(sim),a=t0(sim),sh=shown(sim),G=sim.gutS,noisy=atLeast('ap')&&sim.p.noise;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const fs=12*k,T=Math.round(44+34*k),B=Math.round(450-26-22*k);
  /* panels */
  const P1={L:Math.round(30+34*k),R:372},P2={L:Math.round(410+44*k),R:786};
  const tmax=Math.ceil(q.T5/300)*300;
  const X1=t=>P1.L+t/tmax*(P1.R-P1.L),Y1=s=>B-s/5000*(B-T);
  const w0=a-120,w1=a+300;let s0=pos(q,w0),s1=pos(q,w1);const sp=(s1-s0)*0.08;s0-=sp;s1+=sp;
  const X2=t=>P2.L+(t-w0)/(w1-w0)*(P2.R-P2.L),Y2=s=>B-(s-s0)/(s1-s0)*(B-T);
  [P1,P2].forEach(P=>{ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(P.L,T,P.R-P.L,B-T);});
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  /* left grid */
  for(let m=0;m*60<=tmax;m+=5){const x=X1(m*60);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,B);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(m),x,B+fs+4,{s:fs,c:PAL['cv-soft'],a:'center'});}
  for(let km=0;km<=5;km++){const y=Y1(km*1000);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(P1.L,y);ctx.lineTo(P1.R,y);ctx.stroke();ctx.globalAlpha=1;if(k<1.3||km%2===1||km===0)txt(ctx,km+' km',P1.L-6,y+4,{s:fs,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'Time since the start (minutes)',(P1.L+P1.R)/2,B+2*fs+10,{s:fs,c:PAL['cv-soft'],a:'center'});
  /* right grid: clock ticks every 60 s (120 s on small screens) */
  const tick=k>1.3?120:60;for(let t=Math.ceil(w0/tick)*tick;t<=w1;t+=tick){const x=X2(t);if(x>P2.R-22*k)continue;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,B);ctx.stroke();ctx.globalAlpha=1;txt(ctx,clock(t),x,B+fs+4,{s:fs,c:PAL['cv-soft'],a:'center'});}
  const ystep=(s1-s0)>900?400:(s1-s0)>450?200:100;for(let s=Math.ceil(s0/ystep)*ystep;s<=s1;s+=ystep){const y=Y2(s);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(P2.L,y);ctx.lineTo(P2.R,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,s+' m',P2.L-6,y+4,{s:fs,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'Race clock (min:s)',(P2.L+P2.R)/2,B+2*fs+10,{s:fs,c:PAL['cv-soft'],a:'center'});
  txt(ctx,'Your whole 5K',P1.L,T-8,{s:fs,w:700});txt(ctx,'Close-up around '+where(sim),P2.L,T-8,{s:fs,w:700});
  /* the close-up window on the left panel */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.strokeRect(X1(w0),Y1(s1),X1(w1)-X1(w0),Y1(s0)-Y1(s1));ctx.setLineDash([]);
  /* position curve and GPS dots */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.beginPath();for(let t=0;t<=q.T5;t+=5){const x=X1(t),y=Y1(pos(q,t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.fillStyle=PAL['s2'];for(let t=0;t<=q.T5;t+=15){ctx.beginPath();ctx.arc(X1(t),Y1(reading(sim,t)),2.2,0,7);ctx.fill();}
  ctx.save();ctx.beginPath();ctx.rect(P2.L,T,P2.R-P2.L,B-T);ctx.clip();
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.globalAlpha=noisy?.45:1;ctx.beginPath();for(let t=w0;t<=w1;t+=1){const x=X2(t),y=Y2(pos(q,t));t>w0?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.globalAlpha=1;
  for(let t=Math.ceil(w0/5)*5;t<=w1;t+=5){ctx.beginPath();ctx.arc(X2(t),Y2(reading(sim,t)),2.6,0,7);ctx.fill();}
  /* moment marker */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X2(a),T);ctx.lineTo(X2(a),B);ctx.stroke();ctx.setLineDash([]);
  const sa=pos(q,a),line=(m,col,dash,wd)=>{ctx.strokeStyle=col;ctx.lineWidth=wd||3;ctx.setLineDash(dash?[8,6]:[]);ctx.beginPath();ctx.moveTo(X2(w0),Y2(sa+m*(w0-a)));ctx.lineTo(X2(w1),Y2(sa+m*(w1-a)));ctx.stroke();ctx.setLineDash([]);};
  const gv=G&&G.g?G.g.mv:sim.p.guess;
  if(sh){const h=sim.p.win,m=secant(sim,h),ra=reading(sim,a);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X2(w0),Y2(ra+m*(w0-a)));ctx.lineTo(X2(w1),Y2(ra+m*(w1-a)));ctx.stroke();
   ctx.fillStyle=PAL['rj'];[a,a+h].forEach(t=>{ctx.beginPath();ctx.arc(X2(t),Y2(reading(sim,t)),5.5,0,7);ctx.fill();});
   if(atLeast('honors')||(G&&G.m))line(now(sim),PAL['s3'],true,2.5);}
  line(gv,PAL['s4'],false,3);
  ctx.restore();
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(X2(a),Y2(sa),5,0,7);ctx.fill();
  /* left panel marker and gut line */
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X1(a-240),Y1(sa-gv*240));ctx.lineTo(X1(a+240),Y1(sa+gv*240));ctx.stroke();
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(X1(a),Y1(sa),4.5,0,7);ctx.fill();
  /* key: pills along the top */
  const ps=Math.min(13*k,20);let x=P2.R;const items=[[ (G&&G.g?'Your gut ':'Your line ')+f2(gv)+' m/s',PAL['s4']]];
  if(sh)items.push(['Average over '+sim.p.win+' s: '+f2(secant(sim,sim.p.win)),PAL['rj']]);
  if(sh&&(atLeast('honors')||(G&&G.m)))items.push(['Right now: '+f2(now(sim)),PAL['s3']]);
  ctx.font='700 '+ps+'px '+BioLab.h.FONT;const y0=Math.round(10+ps);
  let row=0;items.forEach(([s,c])=>{const w=ctx.measureText(s).width+ps*1.1;if(x-w<8){row++;x=P2.R;}pill(ctx,s,x-w/2,y0+row*ps*1.9,c,'#fff',ps);x-=w+8;});
  if(!sh)txt(ctx,'Steeper means faster',P1.L+8,T+fs+6,{s:fs,c:PAL['cv-soft']});},
 narrate(sim){const h=sim.p.win,w=where(sim);
  if(!shown(sim))return `On a position graph, <b>steeper means faster</b>. Tilt the orange line until it is as steep as your position curve right at ${w}, then lock it in.`;
  const m=secant(sim,h),tr=now(sim);
  if(atLeast('ap')&&sim.p.noise&&h<=10)return `With GPS error, the average over just ${h} s is ${f2(m)} m/s against a true ${f2(tr)} m/s. <b>A few meters of error divided by a tiny interval is a big speed error</b>, so apps average over several seconds.`;
  if(Math.abs(m-tr)<0.01)return `Over ${h} s you averaged ${f2(m)} m/s. <b>Shrinking the interval further barely changes it</b>: the averages have settled on your speed right at ${w}, ${f2(tr)} m/s (${pace(tr)} per mile).`;
  return `Over the ${h} s after ${w} you averaged ${f2(m)} m/s, but your speed was changing inside that interval. <b>Shrink the interval</b> and the average closes in on your speed right at that moment.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'How fast were you going right at 9:00? Drag the slider here to tilt the orange line until it is as steep as your position curve right at that moment. Then lock it in.',honors:'Before you see any averages: set your speed right at that moment by feel, tilting the orange line to match the curve, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-now(sim)),mv:g,label:`${f2(g)} m/s (${pace(g)} per mile)`};},
  solve(sim){const tr=now(sim);sim.p.win=1;sim.st.peek=true;return {v:0,mv:tr,label:`${f2(tr)} m/s (${pace(tr)} per mile)`};},
  how:{bio:'The math averages your speed over shorter and shorter intervals starting at that moment: distance covered divided by time. Over 4 minutes the average mixes in the rest of the course. Over 1 second it barely has time to change, so the averages settle on one number: your speed right then.',
   honors:'Each average is the slope of a secant line through two points on the position curve. As the interval h shrinks, the secant slopes approach the slope of the tangent line: the instantaneous rate of change.',
   ap:'s′(t) = lim (h → 0) [s(t + h) − s(t)] / h. The tool knows the smooth position function s(t), so it can take the limit exactly. An app with noisy readings has to stop at a few seconds.'},
  compare(sim,g,m){const d=g.mv-m.mv,ps=Math.abs(MILE/g.mv-MILE/m.mv),five=Math.abs(d)*300;
   if(Math.abs(d)<0.05)return `Your gut was right on: within ${f2(Math.abs(d))} m/s of your true speed, ${f2(m.mv)} m/s (${pace(m.mv)} per mile). Your eye already found the tangent line, and the shrinking intervals show why it works.`;
   return `Your gut was <b>${f2(Math.abs(d))} m/s too ${d>0?'fast':'slow'}</b>: a pace of ${pace(g.mv)} per mile instead of ${pace(m.mv)}, which is <b>${Math.round(ps)} seconds per mile off</b>. Hold that speed for 5 minutes and you would be ${Math.round(five)} m ${d>0?'short of':'past'} where you expected to be.`;},
  again(sim){sim.st={run:makeRun(2+Math.floor(Math.random()*1e6))};sim.st.peek=false;sim.p.guess=4.5;sim.p.win=240;sim.p.noise=false;sim.p.when=Math.random()<0.5?'t9':'water';}
 },
 onTourExit(sim){sim.st.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'Over the 4 minutes starting at 9:00, you averaged 3.33 m/s. Right at 9:00 you were partway up the hill. Was your speed right at 9:00 faster or slower than 3.33 m/s?',choices:['Faster','Slower','The same: an average is the speed'],correct:1,explain:'Slower: 2.72 m/s. The 4-minute average mixes in the top of the hill and the flat stretch after it, where you sped back up. An average over a long interval hides what happened at one moment.'},
  {lvl:'bio',instant:true,q:'On a graph of your position against time, what shows your speed right at one moment?',choices:['How high the curve is at that moment','How steep the curve is at that moment','How far the curve is from the start'],correct:1,explain:'Height is how far you have gone. Steepness is how fast that distance is growing: meters per second. A flat stretch would mean you stopped.'},
  {lvl:'honors',instant:true,q:'Starting at 9:00, your averages are 2.88 m/s over 60 s, 2.73 m/s over 10 s and 2.72 m/s over 1 s. Your best estimate of your speed right at 9:00?',choices:['2.88 m/s, the longest interval has the most data','About 2.72 m/s, where the averages settle','The mean of the three, 2.78 m/s'],correct:1,explain:'As the interval shrinks, the secant slopes close in on the tangent slope. They settle at 2.72 m/s, so that is the instantaneous speed. Averaging the averages just mixes in the worst one.'},
  {lvl:'honors',instant:true,q:'Why can’t the app find your speed from a single GPS reading?',choices:['One reading has no change in position or time, and speed is change in position divided by change in time','GPS can’t measure position accurately','It can: one reading is enough'],correct:0,explain:'A rate needs two points: Δs/Δt. One reading gives 0/0. That is exactly why the derivative is defined as a limit of averages instead of a single division.'},
  {lvl:'ap',instant:true,q:'A runner’s position is s(t) = 3.5t − 0.001t² meters, t in seconds. Use the limit definition to find the speed at t = 300 s.',choices:['2.6 m/s','2.9 m/s','3.2 m/s','3.5 m/s'],correct:1,explain:'[s(300 + h) − s(300)] / h = 3.5 − 0.001(600 + h) = 2.9 − 0.001h. As h → 0 this goes to 2.9 m/s. The same comes from s′(t) = 3.5 − 0.002t.'},
  {lvl:'ap',instant:true,q:'Each GPS reading can be off by as much as 3 m. The app averages over 2 s. In the worst case, how far off could its speed be?',choices:['0.2 m/s','1.5 m/s','3 m/s','6 m/s'],correct:2,explain:'Worst case, one end reads 3 m short and the other 3 m long: 6 m of error over 2 s is 3 m/s. Over 30 s the same error is only 6 ÷ 30 = 0.2 m/s. That is why apps smooth over several seconds instead of shrinking h toward 0.'}
 ],
 tour:[
  {title:'Your run, the way the app sees it',text:'Each dot is a GPS reading: how far along the course you were at that time. The curve climbs because you keep moving. Where it is steeper, you were moving faster. The close-up on the right zooms in around 9:00, partway up the hill.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{when:'t9',win:240,noise:false});},focus:[[20,30,375,420]]},
  {title:'Average speed over 4 minutes',text:'The app can divide distance by time. From 9:00 to 13:00 you covered 798 m in 240 s: an average of 3.33 m/s. That is the slope of the red line through those two points. But it includes the top of the hill and the flat after it.',pause:true,setup:sim=>BioLab.setValues(sim,{win:240})},
  {title:'Shrink the interval to 1 minute',text:'Over just the 60 s after 9:00, you averaged 2.88 m/s. The red line tilts toward the curve’s steepness right at 9:00.',pause:true,setup:sim=>BioLab.setValues(sim,{win:60})},
  {title:'Shrink it to 10 seconds',text:'Over 10 s: 2.73 m/s. In 10 seconds your speed barely has time to change, so the average is close to your speed at 9:00.',pause:true,setup:sim=>BioLab.setValues(sim,{win:10})},
  {title:'Speed right now',text:'Over 1 s: 2.72 m/s, and shorter intervals give the same answer to two decimals. The averages have settled on one number. That is your speed at the instant 9:00, a pace of 9:52 per mile, much slower than your 3.41 m/s for the whole race.',pause:true,setup:sim=>BioLab.setValues(sim,{win:1})},
  {lvl:'honors',title:'Secant lines approach the tangent line',text:'Each red line is a secant line, and its slope is the average rate of change [s(9:00 + h) − s(9:00)] / h. As h shrinks, the secants approach the green dashed tangent line. Its slope is the instantaneous rate of change.',pause:true},
  {lvl:'ap',title:'Why apps don’t shrink all the way',text:'Turn on real GPS error, about 3 m per reading. Now the average over 2 s comes out 3.93 m/s instead of 2.72 m/s: a few meters of error divided by 2 s is a big speed error. The derivative is the limit of the smooth curve; an app averages over several seconds to get close to it.',pause:true,setup:sim=>BioLab.setValues(sim,{win:2,noise:true})}
 ],
 lab:{bio:'<p><b>Question:</b> How short does the interval need to be?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Set the interval to 240, 120, 60, 30, 10, 5 and 1 s. Record a trial each time.</li><li>Graph <b>Trials</b> with the interval on x and the average speed on y.</li></ol><p>Write one sentence: at what interval does the average stop changing in the second decimal place?</p>',
  honors:'<p><b>Question:</b> Does the water stop behave like the hill?</p><ol><li>Switch to <b>The water stop</b>. Record the average over 240, 60, 10 and 1 s.</li><li>Compare with the speed right at that moment.</li></ol><p>Explain why a 4-minute average almost completely hides a 30-second slowdown.</p>',
  ap:'<p><b>Question:</b> What interval should an app use?</p><ol><li>Turn on GPS error. Record the average for intervals of 1, 2, 5, 10, 30 and 60 s, and the error against the true speed.</li><li>Press <b>New run</b> and repeat.</li></ol><p><b>CER:</b> Claim the best interval. Use your table, and reason about two errors: noise divided by h, and the speed changing during h.</p>'},
 terms:[
  {t:'Average speed',d:'Distance covered divided by the time it took. On a position graph, the slope of the line through two points.'},
  {t:'Instantaneous speed',d:'Your speed at one instant: the number the averages settle on as the interval shrinks toward zero.'},
  {t:'Secant line',d:'A line through two points on a curve. Its slope is the average rate of change between them.',lvl:'honors'},
  {t:'Tangent line',d:'The line that just touches the curve at one point and has the curve’s steepness there. Its slope is the instantaneous rate of change.',lvl:'honors'},
  {t:'Derivative',d:'s′(t) = lim (h → 0) [s(t + h) − s(t)] / h: the instantaneous rate of change of s at t.',lvl:'ap'},
  {t:'Limit',d:'The value an expression gets as close to as you like by taking h close enough to 0, without setting h = 0.',lvl:'ap'}
 ],
 about:'<p>Your speed is v(t) = a − f·t/1500 − (hill dip) − (water-stop dip) + (small wobble), in m/s, and your position s(t) is its exact antiderivative, so the tool knows your true speed at every instant. On the default run you start at 3.55 m/s, fade slowly, slow by up to 0.7 m/s on a 4-minute hill centered on 9:00, and slow by up to 1.2 m/s for 30 s at the water stop about 3 km in. <b>New run</b> picks different numbers from a seeded random generator.</p><p><b>GPS error</b> (Deep dive) adds an independent normal error with a 3 m standard deviation to each one-second reading. That size is an assumption for illustration. Real GPS error depends on the device, sky view and buildings, and consecutive errors are usually related rather than independent, so real apps use smarter filters than a plain average.</p><p>1 mile = 1,609.344 m. Pace is shown in minutes per mile.</p>'
};
SIM._m={makeRun,pos,spd,secant,now,pace,clock,t0,reading};
BioLab.register(SIM);
})();
