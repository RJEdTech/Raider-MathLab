(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Side view of a pass. The ball leaves your hand and is caught at the same height (H m), so it is in the air T = 2v·sin(θ)/g.
   Ball: x(t) = v·cos(θ)·t, y(t) = H + v·sin(θ)·t − g·t²/2. Receiver: starts x0 m downfield and runs straight away at u m/s: R(t) = x0 + u·t.
   Gap = x(T) − R(T): positive means the ball comes down ahead of him (long), negative means behind him (short). No air resistance. */
const G=9.8,H=1.8,RAD=Math.PI/180;
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const T=(v,a)=>2*v*Math.sin(a*RAD)/G;
const gapAt=(v,u,x0,a)=>{const t=T(v,a);return v*Math.cos(a*RAD)*t-(x0+u*t);};
const P=sim=>({v:sim.p.arm,u:sim.p.run,x0:sim.p.start,a:sim.p.angle});
const tof=sim=>T(sim.p.arm,sim.p.angle);
const land=sim=>sim.p.arm*Math.cos(sim.p.angle*RAD)*tof(sim);
const recvAt=sim=>sim.p.start+sim.p.run*tof(sim);
const gap=sim=>land(sim)-recvAt(sim);
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on&&sim.tshow));
const mph=ms=>ms*2.23694;
/* All angles (0–89.99°) where the gap is zero, lowest first; or, if he is out of reach, the angle with the smallest miss. */
function solveAngle(v,u,x0){const roots=[];let a=0.05,pg=gapAt(v,u,x0,a);
 for(let b=0.1;b<=89.95;b+=0.05){const g=gapAt(v,u,x0,b);if((pg<0)!==(g<0)){let l=b-0.05,h=b;for(let i=0;i<70;i++){const m=(l+h)/2;if((gapAt(v,u,x0,m)<0)===(pg<0))l=m;else h=m;}roots.push((l+h)/2);}pg=g;}
 if(roots.length)return {a:roots[0],roots,reach:true};
 let best=1,bv=-1e9;for(let b=0.5;b<=89.5;b+=0.01){const g=gapAt(v,u,x0,b);if(g>bv){bv=g;best=b;}}return {a:best,roots:[],reach:false};}
/* Length of the ball's path: ∫₀ᵀ √(x′² + y′²) dt, by Simpson's rule. */
function arcLen(v,a){const t1=T(v,a),c=v*Math.cos(a*RAD),s=v*Math.sin(a*RAD),n=200,h=t1/n;let S=0;
 for(let i=0;i<=n;i++){const t=i*h,w=i===0||i===n?1:(i%2?4:2);S+=w*Math.hypot(c,s-G*t);}return S*h/3;}
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const missWords=g=>Math.abs(g)<0.05?'right on him':`${f1(Math.abs(g))} m ${g>0?'ahead of him (long)':'behind him (short)'}`;

const SIM={
 id:'leadpass',hash:'leadpass',apUnit:18,order:1,tab:'Lead the receiver',kind:'Simulation',
 card:'Throw a pass to a receiver who keeps running. Pick your launch angle by feel, then let the parametric equations find the one that drops the ball on him.',
 title:'Lead the receiver',
 lede:{bio:'Throw the ball to where your receiver is now and it lands behind him, because he keeps running while the ball is in the air. The trick is to throw to where he will be.',
  honors:'The ball’s path is a pair of parametric equations, x(t) and y(t), and the receiver has his own position R(t). A completed pass means one thing: at the moment the ball comes down, x(T) = R(T).',
  ap:'The ball is a vector-valued function r(t) = ⟨v cos θ · t, H + v sin θ · t − ½gt²⟩. Its velocity r′(t) sets the speed √(x′² + y′²), and the length of the throw is the arc length ∫₀ᵀ √(x′² + y′²) dt.'},
 scale:'Side view of the field, drawn to scale. Distances are in meters (1 m is about 1.1 yards). The dots on the ball’s path and on the ground are 0.25 s apart.',
 aspect:16/9,timeless:true,animated:false,trials:true,graph:true,
 controlsTitle:'Your pass',
 controls:[
  {id:'angle',label:'Launch angle (how steeply you throw)',type:'range',min:5,max:60,step:0.5,def:30,unit:'°',help:'0° would be a throw straight ahead, level with the ground. Bigger angles throw higher and keep the ball in the air longer.'},
  {id:'arm',label:'Your throw speed',type:'range',min:16,max:26,step:0.5,def:20,unit:' m/s',noGut:true,onChange:clearGut,help:'20 m/s is about 45 mph. 16 to 26 m/s is about 36 to 58 mph.'},
  {id:'run',label:'Receiver’s running speed',type:'range',min:5,max:8.5,step:0.5,def:7,unit:' m/s',noGut:true,onChange:clearGut,help:'7 m/s is about 15.7 mph. A receiver who runs 40 yards in 5.0 seconds averages about 7.3 m/s.'},
  {id:'start',label:'Receiver is this far downfield when you let go',type:'range',min:4,max:20,step:0.5,def:15,unit:' m',noGut:true,onChange:clearGut},
  {id:'vec',label:'Show velocity vectors',type:'toggle',def:false,lvl:'honors',help:'Arrows show the ball’s velocity ⟨x′(t), y′(t)⟩ at the start, the top and the catch.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the receiver',run(sim){sim.peek=true;sim.infoDirty=true;}},
  {id:'best',label:'Throw at the math angle',lvl:'honors',run(sim){const s=solveAngle(sim.p.arm,sim.p.run,sim.p.start);sim.peek=true;BioLab.setValues(sim,{angle:+s.a.toFixed(1)});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'tof',label:'Time in the air',unit:'s',d:2,min:0,max:null,get:tof},
  {id:'land',label:'Ball comes down at',unit:'m downfield',d:1,min:0,max:null,get:land},
  {id:'recv',label:'Receiver is then at',unit:'m downfield',d:1,min:0,max:null,get:sim=>shown(sim)?recvAt(sim):null},
  {id:'miss',label:'Miss',unit:'m',d:1,min:0,max:null,get:sim=>shown(sim)?Math.abs(gap(sim)):null},
  {id:'top',label:'Highest point',unit:'m up',d:1,lvl:'honors',min:0,max:null,get:sim=>{const s=sim.p.arm*Math.sin(sim.p.angle*RAD);return H+s*s/(2*G);}},
  {id:'vtop',label:'Speed at the top',unit:'m/s',d:1,lvl:'honors',min:0,max:null,get:sim=>sim.p.arm*Math.cos(sim.p.angle*RAD)},
  {id:'arc',label:'Length of the ball’s path',unit:'m',d:1,lvl:'ap',min:0,max:null,get:sim=>arcLen(sim.p.arm,sim.p.angle)},
  {id:'angleNow',label:'Launch angle',unit:'°',d:1,lvl:'ap',min:0,max:90,get:sim=>sim.p.angle}
 ],
 graphs:[{id:'gapcurve',label:'Miss vs. launch angle',custom:true}],defaultGraph:'gapcurve',
 plot(sim,ctx,box){const {v,u,x0}=P(sim);
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this curve.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  let lo=0,hi=0;for(let a=5;a<=60;a+=0.5){const g=gapAt(v,u,x0,a);lo=Math.min(lo,g);hi=Math.max(hi,g);}
  const ax=axes(ctx,box,{xmin:5,xmax:60,ymin:Math.floor(lo/5)*5,ymax:Math.ceil(hi/5)*5||5,xl:'Launch angle (°)',yl:'Ball lands ahead (+) or behind (−) him, m'});
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(5),ax.Y(0));ctx.lineTo(ax.X(60),ax.Y(0));ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let a=5;a<=60.001;a+=0.25){const px=ax.X(a),py=ax.Y(gapAt(v,u,x0,a));a===5?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
  const dot=(a,col,lab,up)=>{const y=gapAt(v,u,x0,a);ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(a),ax.Y(y),6,0,7);ctx.fill();txt(ctx,lab,ax.X(a),ax.Y(y)+(up?-12:22),{s:12,w:700,c:col,a:'center'});};
  const S=sim.gutS;if(S&&S.g)dot(S.g.a,PAL['s4'],'Your gut',false);
  const s=solveAngle(v,u,x0);if(S&&S.m||atLeast('honors'))s.roots.filter(a=>a>=5&&a<=60).forEach((a,i)=>dot(a,PAL['s3'],i?'Lob':'Math',true));
  dot(sim.p.angle,PAL['rj'],'Now',S&&S.g&&Math.abs(S.g.a-sim.p.angle)<3?true:false);},
 draw(sim,ctx,vdt,k,tv){const {v,u,x0,a}=P(sim),t1=tof(sim),c=v*Math.cos(a*RAD),s=v*Math.sin(a*RAD),sh=shown(sim),S=sim.gutS;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const GY=392,X0=58,lx=land(sim),rx=recvAt(sim),ym=H+s*s/(2*G);
  const nL=atLeast('honors')?4:2,lh=19*k,xM=Math.max(28,lx,rx,x0+u*3)+3,yM=Math.max(8,ym+2);const SC=Math.min((780-X0)/xM,(GY-40-nL*lh)/yM);
  const PX=x=>X0+x*SC,PY=y=>GY-y*SC;
  /* field */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,GY,800,450-GY);
  const st=SC*5<34*k?10:5;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let m=0;PX(m)<800;m+=st){ctx.globalAlpha=.55;ctx.beginPath();ctx.moveTo(PX(m),PY(yM));ctx.lineTo(PX(m),GY);ctx.stroke();ctx.globalAlpha=1;txt(ctx,m+' m',PX(m),GY+20*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,GY);ctx.lineTo(800,GY);ctx.stroke();
  /* thrower */
  const fig=(x,col,lab,ghost)=>{const px=PX(x),hh=28;ctx.globalAlpha=ghost?.45:1;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=3;
   ctx.beginPath();ctx.arc(px,GY-hh-7,6,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(px,GY-hh);ctx.lineTo(px,GY-12);ctx.lineTo(px-6,GY);ctx.moveTo(px,GY-12);ctx.lineTo(px+6,GY);ctx.stroke();ctx.globalAlpha=1;
   if(lab)txt(ctx,lab,px,GY-hh-20,{s:12*k,w:700,c:col,a:'center'});};
  fig(0,PAL['rj'],'',false);
  /* receiver: start, path along the ground, and (once shown) where he is when the ball comes down */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(PX(x0),GY-4);ctx.lineTo(PX(sh?rx:x0+u*1),GY-4);ctx.stroke();ctx.setLineDash([]);
  if(!sh){const ax0=PX(x0+u*1);ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.moveTo(ax0+10,GY-4);ctx.lineTo(ax0,GY-10);ctx.lineTo(ax0,GY+2);ctx.closePath();ctx.fill();}
  fig(x0,PAL['s2'],sh?'':'Receiver',sh);
  if(!sh)txt(ctx,f1(u)+' m/s →',PX(x0)+12,GY-24,{s:12*k,w:700,c:PAL['s2']});
  /* time ticks every 0.25 s */
  const ticks=[];for(let t=0.25;t<t1-0.02;t+=0.25)ticks.push(t);
  if(sh){ticks.forEach(t=>{ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(PX(x0+u*t),GY-4,3,0,7);ctx.fill();
    if(atLeast('honors')){ctx.strokeStyle=PAL['cv-soft'];ctx.globalAlpha=.35;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(PX(c*t),PY(H+s*t-G*t*t/2));ctx.lineTo(PX(x0+u*t),GY-4);ctx.stroke();ctx.globalAlpha=1;}});
   fig(rx,PAL['s2'],'Receiver at catch time',false);}
  /* gut throw, if different */
  if(S&&S.g&&Math.abs(S.g.a-a)>0.4){const tg=T(v,S.g.a),cg=v*Math.cos(S.g.a*RAD),sg=v*Math.sin(S.g.a*RAD);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ctx.beginPath();
   for(let i=0;i<=60;i++){const t=tg*i/60,px=PX(cg*t),py=PY(H+sg*t-G*t*t/2);i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();ctx.setLineDash([]);
   const tp=tg/2;txt(ctx,'Your gut: '+f1(S.g.a)+'°',PX(cg*tp),PY(H+sg*sg/(2*G))-10,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  /* ball path */
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=80;i++){const t=t1*i/80,px=PX(c*t),py=PY(H+s*t-G*t*t/2);i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  ticks.forEach(t=>{ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(PX(c*t),PY(H+s*t-G*t*t/2),3.2,0,7);ctx.fill();});
  /* moving ball */
  const per=t1+1.2,ph=((tv||0)%per+per)%per,tb=Math.min(ph,t1);ctx.fillStyle='#a0522d';ctx.strokeStyle=PAL['card'];ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(PX(c*tb),PY(H+s*tb-G*tb*tb/2),7,4.5,-Math.atan2(s-G*tb,c),0,7);ctx.fill();ctx.stroke();
  /* landing mark */
  const lpx=PX(lx),lpy=PY(H);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(lpx-6,lpy-6);ctx.lineTo(lpx+6,lpy+6);ctx.moveTo(lpx+6,lpy-6);ctx.lineTo(lpx-6,lpy+6);ctx.stroke();
  /* velocity vectors */
  if(sim.p.vec&&atLeast('honors')){const vs=1.6;[[0,'start'],[t1/2,'top'],[t1,'catch']].forEach(([t,lab])=>{const bx=PX(c*t),by=PY(H+s*t-G*t*t/2),vx=c,vy=s-G*t,ex=bx+vx*vs*SC/6,ey=by-vy*vs*SC/6;
    ctx.strokeStyle=PAL['s5'];ctx.fillStyle=PAL['s5'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ex,ey);ctx.stroke();const an=Math.atan2(ey-by,ex-bx);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-9*Math.cos(an-0.4),ey-9*Math.sin(an-0.4));ctx.lineTo(ex-9*Math.cos(an+0.4),ey-9*Math.sin(an+0.4));ctx.closePath();ctx.fill();
    if(lab==='top')txt(ctx,'⟨'+f1(vx)+', 0⟩ m/s',ex+6,ey-6,{s:12*k,w:700,c:PAL['s5']});});}
  /* the result */
  if(sh){const g=gap(sim),my=GY-74*Math.min(k,1.25);
   if(Math.abs(g)>0.3){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(lx),my);ctx.lineTo(PX(rx),my);ctx.moveTo(PX(lx),my-6);ctx.lineTo(PX(lx),my+6);ctx.moveTo(PX(rx),my-6);ctx.lineTo(PX(rx),my+6);ctx.stroke();}
   const lab=Math.abs(g)<0.3?'Caught!':'Miss: '+f1(Math.abs(g))+' m '+(g>0?'long':'short');
   pill(ctx,lab,clamp(PX((lx+rx)/2),90,710),my-22*Math.min(k,1.3),Math.abs(g)<0.3?PAL['s3']:PAL['s1'],'#fff',13*Math.min(k,1.3));}
  /* what the equations say, in the open sky */
  const L=[[`Ball: ${f1(a)}°, in the air ${f2(t1)} s, comes down at ${f1(lx)} m`,PAL['rj']],
   [sh?`Receiver: ${f1(x0)} + ${f1(u)} × ${f2(t1)} = ${f1(rx)} m`:`Receiver: ${f1(x0)} m out, running ${f1(u)} m/s. Where will he be?`,PAL['s2']]];
  if(atLeast('honors')){L.push([`x(t) = ${f1(v)} cos ${f1(a)}° · t,  y(t) = 1.8 + ${f1(v)} sin ${f1(a)}° · t − 4.9t²`,PAL['cv-soft']]);L.push([`R(t) = ${f1(x0)} + ${f1(u)}t`,PAL['cv-soft']]);}
  ctx.font='700 '+(12*k)+'px '+BioLab.h.FONT;const bw=Math.max(...L.map(q=>ctx.measureText(q[0]).width))+20;
  ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(10,10,bw,L.length*lh+12);ctx.globalAlpha=1;
  L.forEach((q,i)=>txt(ctx,q[0],20,12+lh*(i+0.8),{s:12*k,w:i<2?700:400,c:q[1]}));},
 narrate(sim){const {v,u,x0}=P(sim),t1=tof(sim),g=gap(sim);
  if(!shown(sim))return `At ${f1(sim.p.angle)}°, the ball is in the air <b>${f2(t1)} s</b> and comes down ${f1(land(sim))} m downfield. Your receiver is ${f1(x0)} m out and running. Lock in your angle to see where he is by then.`;
  const s=solveAngle(v,u,x0);if(!s.reach)return `<b>He is out of reach.</b> At ${f1(v)} m/s, no angle gets the ball to him before he runs past it. Throw harder, or throw sooner.`;
  if(Math.abs(g)<0.3)return `<b>Caught.</b> In ${f2(t1)} s the receiver runs ${f1(u*t1)} m, from ${f1(x0)} m to ${f1(recvAt(sim))} m, and the ball comes down right there.`;
  return `The ball is in the air ${f2(t1)} s, so he runs ${f1(u*t1)} m and is at ${f1(recvAt(sim))} m when it comes down at ${f1(land(sim))} m. <b>${g>0?'Too high: more air time carries the ball past him.':'Too flat: the ball comes down before it reaches him.'}</b>`;},
 gut:{better:'lower',controls:['angle'],
  ask:{bio:'Drag <b>Launch angle</b> here to how steeply you would throw so the ball comes down right on your receiver. The red arc is your throw. He keeps running while it flies, so lead him. Then lock it in.',
   honors:'Set <b>Launch angle</b> by feel so x(T) lands on the receiver, then lock it in. Do not use the math button yet.'},
  lock(sim){const g=gap(sim);return {v:Math.abs(g),a:sim.p.angle,gap:g,label:`${f1(sim.p.angle)}°, ball comes down ${missWords(g)}`};},
  solve(sim){const s=solveAngle(sim.p.arm,sim.p.run,sim.p.start);sim.p.angle=s.a;sim.peek=true;const g=gap(sim);
   return {v:Math.abs(g),a:s.a,gap:g,reach:s.reach,label:s.reach?`${f1(s.a)}°: ${f2(tof(sim))} s in the air, caught at ${f1(recvAt(sim))} m`:`${f1(s.a)}°, the closest any throw gets: ${f1(Math.abs(g))} m short`};},
  how:{bio:'The math writes where the ball is and where the receiver is at the same time t. The ball comes down after a time that depends on the angle. The math finds the angle where, at that moment, the ball and the receiver are at the same spot.',
   honors:'x(t) = v cos θ · t and y(t) = 1.8 + v sin θ · t − 4.9t². The ball is back at catch height when y(T) = 1.8, so T = 2v sin θ / 9.8. The receiver is at R(T) = x₀ + uT. Solve x(T) = R(T) for θ.',
   ap:'Setting x(T) = R(T) with T = 2v sin θ / g gives (2v sin θ / g)(v cos θ − u) = x₀. The math solves it numerically and takes the flatter of the two roots: less hang time for a defender to close.'},
  compare(sim,g,m){const u=sim.p.run;
   if(!m.reach)return `No throw at this speed reaches him: the best angle still comes down ${f1(m.v)} m short. Your throw missed by ${f1(g.v)} m. Throw harder, or get rid of the ball sooner.`;
   if(g.v<0.5)return `Your gut was right on: your pass comes down within ${f1(g.v)} m of him. That is the same lead the math finds by matching x(T) to R(T). ${Math.abs(g.a-m.a)>10?'You chose the high lob; the math picks the flatter throw because it is in the air less time.':''}`;
   const sec=g.v/u;return `Your pass comes down <b>${f1(g.v)} m ${g.gap>0?'ahead of':'behind'} your receiver</b>. At ${f1(u)} m/s, that is <b>${f2(sec)} s of running</b> he would need to ${g.gap>0?'catch up to it':'stop and come back for it'}, plenty of time for a defender. The math angle, ${f1(m.a)}°, drops it right on him.`;},
  again(sim){const L=[[20,7,15],[18,6,10],[22,7.5,16],[24,8,18],[19,6.5,8],[21,8,12],[23,6,14],[17,5.5,9]];const c=L[Math.floor(Math.random()*L.length)];sim.p.arm=c[0];sim.p.run=c[1];sim.p.start=c[2];sim.p.angle=30;sim.peek=false;}
 },
 onTourExit(sim){sim.peek=false;sim.tshow=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'Your receiver is 15 m downfield, running away at 7 m/s. You throw so the ball would come down at exactly 15 m, where he is right now. What happens?',choices:['He catches it','It comes down behind him','It comes down ahead of him'],correct:1,explain:'At 20 m/s, a throw that comes down at 15 m (about 10.8°) is in the air about 0.76 s. In that time he runs about 5.3 m, so the ball lands about 5.3 m behind him. You have to throw to where he will be.'},
  {lvl:'bio',instant:true,q:'Two passes both reach the same receiver: a flat 17.8° throw and a high 54.9° lob. Which one gives a defender more time to get there?',choices:['The flat throw','The lob','They take the same time'],correct:1,explain:'The flat throw is in the air about 1.25 s; the lob hangs about 3.34 s, more than two seconds longer. The receiver has to be leading by a lot more for the lob, too: 23.4 m of running instead of 8.7 m.'},
  {lvl:'honors',instant:true,q:'Ignoring air resistance, how fast is the ball moving at the very top of its arc?',choices:['0 m/s: it stops for an instant','v cos θ, its horizontal speed','v, the same as at release'],correct:1,explain:'At the top, y′(t) = 0, but x′(t) = v cos θ never changes. The velocity vector is ⟨v cos θ, 0⟩, so the speed is v cos θ: about 19.0 m/s for a 20 m/s throw at 17.8°.'},
  {lvl:'honors',instant:true,q:'The ball leaves your hand and is caught at the same height. Ignoring air resistance, how does its speed at the catch compare with its speed at release?',choices:['Slower','The same','Faster'],correct:1,explain:'At the catch, x′ = v cos θ and y′ = v sin θ − gT = −v sin θ. Speed = √(v²cos²θ + v²sin²θ) = v. Same speed, pointing down instead of up.'},
  {lvl:'ap',instant:true,q:'You throw at 20 m/s and 30°, with g = 9.8 m/s². The ball is caught at the height it was thrown from. To the nearest hundredth of a second, how long is it in the air?',choices:['1.02 s','2.04 s','3.53 s','4.08 s'],correct:1,explain:'y(T) = y(0) when v sin θ · T − 4.9T² = 0, so T = 2v sin θ / g = 2(20)(0.5)/9.8 ≈ 2.04 s.'},
  {lvl:'ap',instant:true,q:'Which integral gives the length of the ball’s path from release to catch?',choices:['∫₀ᵀ (v cos θ) dt','∫₀ᵀ √((v cos θ)² + (v sin θ − gt)²) dt','∫₀ᵀ (v sin θ · t − ½gt²) dt','√(x(T)² + y(T)²)'],correct:1,explain:'Arc length of a parametric curve is ∫ √(x′(t)² + y′(t)²) dt, the integral of the speed. The first choice is only the distance downfield, the third integrates height, and the last is a straight line.'}
 ],
 tour:[
  {title:'The pass',text:'You are the passer on the left. Your receiver starts 15 m downfield and is sprinting away at 7 m/s. You throw at 20 m/s, about 45 mph.',pause:true,setup:sim=>{sim.tshow=false;BioLab.setValues(sim,{arm:20,run:7,start:15,angle:10.8,vec:false});}},
  {title:'Throw to where he is now',text:'At 10.8°, the ball comes down at 15 m, right where he is now. It is in the air 0.76 s.',pause:true},
  {title:'But he keeps running',text:'In those 0.76 s he runs 7 × 0.76 ≈ 5.3 m. The ball lands 5.3 m behind him. Each blue dot is where he is every 0.25 s; each red dot is where the ball is at the same moment.',pause:true,setup:sim=>{sim.tshow=true;}},
  {title:'Too high carries it past him',text:'At 30° the ball hangs 2.04 s and comes down at 35.3 m. He has only run to 29.3 m, so it sails 6.1 m over him.',pause:true,setup:sim=>BioLab.setValues(sim,{angle:30})},
  {title:'Match the same moment',text:'The pass works when, at the moment the ball comes down, it is where he is. At 17.8° the ball is in the air 1.25 s, he runs 8.7 m to 23.7 m, and the ball comes down at 23.7 m.',pause:true,setup:sim=>BioLab.setValues(sim,{angle:solveAngle(20,7,15).a})},
  {lvl:'honors',title:'The parametric equations',text:'Ball: x(t) = 20 cos θ · t and y(t) = 1.8 + 20 sin θ · t − 4.9t². Receiver: R(t) = 15 + 7t. The ball is back at catch height at T = 2(20) sin θ / 9.8. Solve x(T) = R(T) for θ.',pause:true,setup:sim=>BioLab.setValues(sim,{vec:true})},
  {lvl:'honors',title:'Velocity vectors',text:'The purple arrows are the velocity ⟨x′(t), y′(t)⟩. The sideways part, 20 cos 17.8° ≈ 19.0 m/s, never changes. Gravity only changes the up-and-down part.',pause:true},
  {lvl:'ap',title:'Arc length',text:'The ball travels farther than 23.7 m: it goes up and comes down. The length of its path is ∫₀ᵀ √(x′² + y′²) dt ≈ 24.1 m.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much do you have to lead a faster receiver?</p><ol><li>Keep your throw speed at 20 m/s and the receiver 15 m out.</li><li>For receiver speeds of 5, 6, 7 and 8 m/s, find the angle that completes the pass. Record a trial each time.</li><li>Write down the time in the air for each.</li></ol><p>Write one sentence: why does a faster receiver need a higher throw?</p>',
  honors:'<p><b>Question:</b> Does the formula T = 2v sin θ / g match the tool?</p><ol><li>Pick three angles. Predict the time in the air with the formula.</li><li>Check each against <b>Time in the air</b>, and check the landing spot against x(T) = v cos θ · T.</li><li>Then press <b>Throw at the math angle</b> and show that x(T) = R(T).</li></ol>',
  ap:'<p><b>Question:</b> How long is the path of a completed pass?</p><ol><li>Throw at the math angle for the default case. Write r(t) and r′(t).</li><li>Set up the arc length integral ∫₀ᵀ |r′(t)| dt and estimate it with a calculator.</li><li>Compare with <b>Length of the ball’s path</b>.</li></ol><p><b>CER:</b> Is the path length closer to the distance downfield for a flat pass or for a lob? Use your data.</p>'},
 terms:[
  {t:'Lead',d:'Throwing to where a moving target will be, not where it is now.'},
  {t:'Parametric equations',d:'A pair of equations x(t), y(t) that give a point’s position at each time t.',lvl:'honors'},
  {t:'Velocity vector',d:'⟨x′(t), y′(t)⟩: how fast the ball moves sideways and up or down. Its length √(x′² + y′²) is the speed.',lvl:'honors'},
  {t:'Vector-valued function',d:'r(t) = ⟨x(t), y(t)⟩, one position vector for each time t.',lvl:'ap'},
  {t:'Arc length',d:'The length of a curve: ∫ₐᵇ √(x′(t)² + y′(t)²) dt for a parametric curve.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> The ball moves as x(t) = v cos θ · t and y(t) = 1.8 + v sin θ · t − ½gt² with g = 9.8 m/s², and is caught at the height it was thrown from (1.8 m), so it is in the air T = 2v sin θ / g. The receiver starts x₀ m downfield and runs straight away at a steady speed u, so he is at x₀ + uT when the ball comes down.</p><p><b>What it leaves out.</b> There is no air resistance: a real football slows down in the air, so real throws come down somewhat shorter and steeper than this. Real receivers speed up, slow down, cut and reach for the ball, and real passes are often thrown on a line rather than caught at release height. The 16 to 26 m/s range of throw speeds is chosen to cover typical high school passes, not a measured value.</p>'
};
BioLab.register(SIM);
})();
