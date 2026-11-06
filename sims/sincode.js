(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Your game places a pendulum bob at x = arm · sin(angle). With no math library, sin comes from the Maclaurin polynomial
   Pₙ(x) = x − x³/3! + x⁵/5! − … (n terms, degree 2n − 1), with x in radians. Error in pixels = arm · |sin x − Pₙ(x)|,
   worst over every angle from 0 to the widest angle the code is fed (sin is odd, so negative angles mirror it).
   Folding: sin(x) = sin(π − x) and sin(x + 2π) = sin(x), so any angle can be moved into −90°…90° before the polynomial. */
const RAD=Math.PI/180,NMAX=12;
function Pn(x,n){let s=0,t=x;for(let k=0;k<n;k++){s+=t;t*=-x*x/((2*k+2)*(2*k+3));}return s;}
function fold(x){let y=((x+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;/* now −π…π */if(y>Math.PI/2)y=Math.PI-y;else if(y<-Math.PI/2)y=-Math.PI-y;return y;}
const red=sim=>atLeast('honors')&&sim.p.reduce;
const arm=sim=>atLeast('honors')?sim.p.arm:200;
const evalAt=(sim,x,n)=>Pn(red(sim)?fold(x):x,n);
/* worst error (px) and where it happens, from 0 to the widest angle */
function worst(sim,n){const X=sim.p.widest*RAD,A=arm(sim);let m=0,wx=0;for(let i=0;i<=1200;i++){const x=X*i/1200,e=A*Math.abs(Math.sin(x)-evalAt(sim,x,n));if(e>m){m=e;wx=x;}}return {px:m,x:wx};}
function need(sim){for(let n=1;n<=NMAX;n++)if(worst(sim,n).px<0.5)return n;return NMAX;}
const fact=k=>{let f=1;for(let i=2;i<=k;i++)f*=i;return f;};
/* alternating series (and Lagrange) bound: the first term left out, at the largest x the polynomial sees */
function bound(sim,n){const xm=red(sim)?Math.min(sim.p.widest,90)*RAD:sim.p.widest*RAD;return arm(sim)*Math.pow(xm,2*n+1)/fact(2*n+1);}
const mults=n=>n===1?0:n+1;
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on&&sim.tshow));
const pxT=v=>v<0.05?'under 0.05 px':(v<10?fmtNum(v,2):Math.round(v).toLocaleString('en-US'))+' px';
const termsT=n=>n+' term'+(n===1?'':'s');
function polyText(n){const L=['x','x³/6','x⁵/120','x⁷/5040','x⁹/362880'];let s='';for(let i=0;i<Math.min(n,5);i++)s+=(i?(i%2?' − ':' + '):'')+L[i];if(n>5)s+=' ± …';return s;}
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'sincode',hash:'sincode',apUnit:18,order:4,tab:'Code sin(x) yourself',kind:'Simulation',
 card:'Build sin(x) from plus, minus, times and divide for a game. Guess how many polynomial terms you need, then let the error bound decide.',
 title:'Code sin(x) yourself',
 lede:{bio:'Your game needs sin to swing a pendulum, but the device has no math library: only +, −, × and ÷. The fix is a polynomial that copies sin: x − x³/6 + x⁵/120 − … . Each term you add makes it closer, and costs a little more work every frame.',
  honors:'That polynomial is the Maclaurin polynomial for sin x. Near 0 it matches sin almost exactly, and it drifts away as the angle grows. Folding the angle into −90° to 90° first means a few terms cover every angle.',
  ap:'For an alternating series whose terms shrink, the error is less than the first term left out: |sin x − Pₙ(x)| ≤ |x|^(2n+1)/(2n+1)!. The Lagrange error bound gives the same number here, because every derivative of sin is at most 1.'},
 scale:'Your pendulum’s arm is 200 pixels long, so the bob sits at x = 200 · sin(angle) pixels from the pivot. The goal: never more than half a pixel off.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your code',
 controls:[
  {id:'terms',label:'Terms in your polynomial',type:'range',min:1,max:NMAX,step:1,def:1,help:'1 term is just x. 2 terms: x − x³/6. 3 terms: x − x³/6 + x⁵/120. Each term is the next odd power of x divided by its factorial, with alternating signs.'},
  {id:'widest',label:'Widest angle your code is fed',type:'range',min:10,max:360,step:5,def:60,unit:'°',noGut:true,onChange:clearGut,help:'A pendulum that swings 60° each way only ever needs angles up to 60°. A spinning wheel, or anything moved by sin(time), can be fed any angle.'},
  {id:'arm',label:'Arm length on screen',type:'range',min:100,max:800,step:50,def:200,unit:' px',lvl:'honors',noGut:true,onChange:clearGut,help:'A bigger drawing magnifies the same error. A 200 px swing drawn at 400 px shows every error twice as large.'},
  {id:'reduce',label:'Fold the angle into −90° to 90° first',type:'toggle',def:false,lvl:'honors',noGut:true,onChange:clearGut,help:'Uses sin(x + 360°) = sin x and sin(180° − x) = sin x, which take only a few additions and subtractions.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the error',run(sim){sim.peek=true;sim.infoDirty=true;}},
  {id:'best',label:'Use the fewest terms that work',lvl:'honors',run(sim){sim.peek=true;BioLab.setValues(sim,{terms:need(sim)});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'err',label:'Worst error on screen',unit:'px',d:2,min:0,max:null,get:sim=>shown(sim)?worst(sim,sim.p.terms).px:null},
  {id:'need',label:'Fewest terms for under 0.5 px',unit:'terms',d:0,lvl:'honors',min:0,max:NMAX,get:sim=>shown(sim)?need(sim):null},
  {id:'degree',label:'Polynomial degree',unit:'',d:0,min:0,max:null,get:sim=>2*sim.p.terms-1},
  {id:'mult',label:'Multiplications per call',unit:'',d:0,lvl:'honors',min:0,max:null,get:sim=>mults(sim.p.terms)},
  {id:'bound',label:'Error bound: first term left out',unit:'px',d:3,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?bound(sim,sim.p.terms):null}
 ],
 graphs:[{id:'byterms',label:'Worst error vs. number of terms',custom:true}],defaultGraph:'byterms',
 plot(sim,ctx,box){if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const lg=v=>Math.log10(Math.max(v,1e-6));const ax=axes(ctx,box,{xmin:0.5,xmax:NMAX+0.5,ymin:-6,ymax:4,xl:'Terms',yl:'Worst error, px (powers of 10)'});
  ctx.strokeStyle=PAL['s1'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0.5),ax.Y(lg(0.5)));ctx.lineTo(ax.X(NMAX+0.5),ax.Y(lg(0.5)));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Half a pixel',ax.X(NMAX+0.5)-6,ax.Y(lg(0.5))-6,{s:12,w:700,c:PAL['s1'],a:'right'});
  const nn=need(sim),bw=(ax.X(1.5)-ax.X(0.5))*0.6;for(let n=1;n<=NMAX;n++){const e=worst(sim,n).px,y=ax.Y(clamp(lg(e),-6,4));ctx.fillStyle=n===nn?PAL['s3']:(n===sim.p.terms?PAL['rj']:PAL['g-line']);ctx.fillRect(ax.X(n)-bw/2,y,bw,ax.Y(-6)-y);txt(ctx,String(n),ax.X(n),box.T+box.H+16,{s:12,c:PAL['g-axis'],a:'center'});}
  legend(ctx,box.L+box.W-190,box.T+8,[{label:'Fewest that work',color:PAL['s3']},{label:'Your setting',color:PAL['rj']}]);},
 draw(sim,ctx,vdt,k,tv){const n=sim.p.terms,sh=shown(sim),S=sim.gutS,W=sim.p.widest,A=arm(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* left: the game screen */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(14,40,370,396);ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.strokeRect(14,40,370,396);
  txt(ctx,'Your game',24,32,{s:12*k,w:700,c:PAL['cv-soft']});
  const pvx=199,pvy=W>90?236:70,L=W>90?165:Math.min(320,170/Math.sin(Math.max(W,30)*RAD)),ds=L/A;/* display px per game px */
  const th=W*RAD*Math.sin((tv||0)*2*Math.PI/3.2);
  const bx=pvx+L*Math.sin(th),by=pvy+L*Math.cos(th);
  ctx.strokeStyle=PAL['cv-soft'];ctx.globalAlpha=.5;ctx.lineWidth=1;ctx.beginPath();ctx.arc(pvx,pvy,L,Math.PI/2-W*RAD,Math.PI/2+W*RAD,false);ctx.stroke();ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pvx,pvy);ctx.lineTo(bx,by);ctx.stroke();
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(pvx,pvy,5,0,7);ctx.fill();
  ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(bx,by,13,0,7);ctx.fill();
  if(sh){const e=A*(evalAt(sim,th,n)-Math.sin(th)),gx=clamp(bx+e*ds,20,378);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(gx,by,13,0,7);ctx.stroke();
   txt(ctx,'Blue: true sin',24,422,{s:12*k,w:700,c:PAL['s2']});txt(ctx,'Orange ring: your code',376,422,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
  else txt(ctx,'Lock in to see your code’s bob',199,422,{s:12*k,w:700,c:PAL['cv-soft'],a:'center'});
  /* right: sin and the polynomial */
  const GL=448,GR=784,GT=58,GB=372,ymn=-1.4,ymx=1.4,XG=x=>GL+x/(W*RAD)*(GR-GL),YG=y=>GB-(clamp(y,ymn,ymx)-ymn)/(ymx-ymn)*(GB-GT);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[-1,0,1].forEach(v=>{ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(GL,YG(v));ctx.lineTo(GR,YG(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(v),GL-8,YG(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});});
  const tstep=W<=60?(W<=30?5:15):(W<=180?45:90);for(let d=0;d<=W+1e-9;d+=tstep){ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(XG(d*RAD),GT);ctx.lineTo(XG(d*RAD),GB);ctx.stroke();ctx.globalAlpha=1;txt(ctx,d+'°',XG(d*RAD),GB+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'Angle fed to your code',(GL+GR)/2,GB+36*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=300;i++){const x=W*RAD*i/300;i?ctx.lineTo(XG(x),YG(Math.sin(x))):ctx.moveTo(XG(x),YG(Math.sin(x)));}ctx.stroke();
  if(sh){ctx.save();ctx.beginPath();ctx.rect(GL,GT-4,GR-GL,GB-GT+8);ctx.clip();ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([7,4]);ctx.beginPath();for(let i=0;i<=300;i++){const x=W*RAD*i/300,y=evalAt(sim,x,n);i?ctx.lineTo(XG(x),YG(y)):ctx.moveTo(XG(x),YG(y));}ctx.stroke();ctx.setLineDash([]);ctx.restore();
   const w=worst(sim,n),wy=YG(Math.sin(w.x));ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(XG(w.x),wy,5,0,7);ctx.fill();
   pill(ctx,'Worst: '+pxT(w.px)+' off',clamp(XG(w.x),GL+90,GR-90),wy<GT+60?wy+30:wy-26,w.px<0.5?PAL['s3']:PAL['s1'],'#fff',13*Math.min(k,1.3));}
  txt(ctx,'sin(x) ≈ '+polyText(n),790,16+12*k,{s:12*k,w:700,c:PAL['s4'],a:'right'});
  if(red(sim))txt(ctx,'Folded into −90° to 90° first',GR,GT-4,{s:12*k,c:PAL['cv-soft'],a:'right'});},
 narrate(sim){const n=sim.p.terms;
  if(!shown(sim))return `Your code uses <b>${termsT(n)}</b>: sin(x) ≈ ${polyText(n)}, with x in radians. Will that keep the bob within half a pixel at every angle up to ${sim.p.widest}°? Lock in your guess to see.`;
  const w=worst(sim,n),nn=need(sim);
  if(n===nn)return `<b>${termsT(n)} is exactly enough.</b> The worst error is ${pxT(w.px)}, at ${Math.round(w.x/RAD)}°. One fewer term would be off by ${n>1?pxT(worst(sim,n-1).px):'more'}.`;
  if(n<nn)return `With ${termsT(n)}, the bob is off by up to <b>${pxT(w.px)}</b> near ${Math.round(w.x/RAD)}°, where the angle is biggest. The polynomial copies sin well near 0 and drifts as the angle grows. You need ${termsT(nn)}.`;
  return `${termsT(n)} is more than you need: ${termsT(nn)} already keeps the error under half a pixel. <b>The extra ${termsT(n-nn)} cost work every frame</b> and change nothing you can see.`;},
 gut:{better:'lower',controls:['terms'],
  ask:{bio:'Drag <b>Terms</b> here to how many terms you think your code needs so the bob is never more than half a pixel from where true sin would put it. Fewer terms run faster. Then lock it in.',
   honors:'Pick the number of terms by feel for this widest angle and arm length, then lock it in. Do not use the button yet.'},
  lock(sim){const n=sim.p.terms,nn=need(sim),w=worst(sim,n);return {v:Math.abs(n-nn),n,px:w.px,label:`${termsT(n)}, worst error ${pxT(w.px)}`};},
  solve(sim){const nn=need(sim);sim.p.terms=nn;sim.peek=true;const w=worst(sim,nn);return {v:0,n:nn,px:w.px,label:`${termsT(nn)}, worst error ${pxT(w.px)}`};},
  how:{bio:'The math checks every angle your code could be fed, finds where the polynomial is farthest from sin (that is at the widest angle), and turns that gap into pixels. Then it picks the fewest terms that keep the gap under half a pixel.',
   honors:'Worst error = arm × max |sin x − Pₙ(x)| over 0 ≤ x ≤ the widest angle. Each term the polynomial adds is the next one in the Maclaurin series, so the gap shrinks quickly once the terms start getting smaller.',
   ap:'The error is at most the first term left out: arm × x^(2n+1)/(2n+1)! at the widest x. The math takes the smallest n that keeps the true worst error below 0.5 px.'},
  compare(sim,g,m){const d=g.n-m.n;
   if(d===0)return `Your gut was right on: ${termsT(m.n)} is the fewest that keeps the bob within half a pixel (worst error ${pxT(m.px)}). You did not waste a single term.`;
   if(d<0)return `With ${termsT(g.n)}, the bob is drawn up to <b>${pxT(g.px)} away</b> from where it belongs, at the ends of the swing. ${g.px>=2?'Players would see it jump.':'It would flicker by a pixel.'} The math adds ${termsT(-d)} to get the error down to ${pxT(m.px)}.`;
   return `Your ${termsT(g.n)} work, but ${termsT(m.n)} already does: <b>${termsT(d)} wasted</b>, about ${d} extra multiplication${d===1?'':'s'} and ${d} extra addition${d===1?'':'s'} every call. A game at 60 frames per second with 100 swinging objects does about ${(6000*d).toLocaleString('en-US')} extra multiplications and as many extra additions every second, for no change you can see.`;},
  again(sim){sim.peek=false;const W=[15,30,45,60,75,90,120,180];sim.p.widest=W[Math.floor(Math.random()*W.length)];sim.p.terms=1;
   if(atLeast('honors')){sim.p.arm=[200,200,400,800][Math.floor(Math.random()*4)];sim.p.reduce=false;}}
 },
 onTourExit(sim){sim.peek=false;sim.tshow=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'Your pendulum swings 30° each way. With just 1 term (sin x ≈ x), where is the bob drawn farthest from where it belongs?',choices:['At the bottom, at 0°','At the ends of the swing, at 30°','The same everywhere'],correct:1,explain:'Near 0, sin x and x are almost equal. The gap grows as the angle grows: at 30° it is 0.524 − 0.5 = 0.024, or about 4.7 px on a 200 px arm.'},
  {lvl:'bio',instant:true,q:'Your pendulum used to swing 30° each way. Now it swings 90°. What happens to the number of terms you need?',choices:['It stays at 2','It goes up, to 4','It goes down'],correct:1,explain:'Bigger angles are farther from 0, where the polynomial is best. At 30°, 2 terms keep the error at 0.07 px. At 90°, 2 terms are off by 15 px and 3 by 0.9 px, so you need 4 (0.03 px).'},
  {lvl:'honors',instant:true,q:'What is the next term after x − x³/6 + x⁵/120?',choices:['+ x⁶/720','− x⁷/5040','− x⁷/720','+ x⁷/5040'],correct:1,explain:'The Maclaurin series for sin x uses only odd powers, with factorials below and alternating signs: the 4th term is −x⁷/7!, and 7! = 5040.'},
  {lvl:'honors',instant:true,q:'A spinning wheel feeds your code angles up to 360°. Folding the angle into −90° to 90° first changes the terms you need from 10 to how many?',choices:['10: folding does not help','4','1'],correct:1,explain:'After folding, the polynomial only ever sees angles up to 90°, and 4 terms keep that within 0.03 px. Without folding, it has to handle 2π ≈ 6.28 radians, which takes 10 terms.'},
  {lvl:'ap',instant:true,q:'You use 3 terms for angles up to 60° (π/3) on a 200 px arm. What does the alternating series error bound guarantee?',choices:['Error ≤ 200 × (π/3)⁵/120 ≈ 2.1 px','Error ≤ 200 × (π/3)⁷/5040 ≈ 0.055 px','Error ≤ 200 × (π/3)⁶/720 ≈ 0.37 px','No bound is possible'],correct:1,explain:'With terms through x⁵, the first term left out is x⁷/7!. At x = π/3 ≈ 1.047 that is 1.380/5040 ≈ 0.000274, or about 0.055 px on a 200 px arm. The true worst error is 0.054 px.'},
  {lvl:'ap',instant:true,q:'Why does the Lagrange error bound for sin x give the same number as the alternating series bound here?',choices:['Every derivative of sin x is between −1 and 1, so M = 1','Because sin x is a polynomial','Because the series has only odd powers','They give different numbers'],correct:0,explain:'Lagrange: |Rₖ(x)| ≤ M|x|^(k+1)/(k+1)!, where M bounds the (k+1)th derivative. Every derivative of sin is ±sin or ±cos, so M = 1. Using k = 2n (the x^(2n) term is 0) gives |x|^(2n+1)/(2n+1)!.'}
 ],
 tour:[
  {title:'The pendulum',text:'Your game swings a pendulum 60° each way. The bob’s sideways position is 200 × sin(angle) pixels, so your code needs sin, built only from +, −, × and ÷.',pause:true,setup:sim=>{sim.tshow=false;BioLab.setValues(sim,{widest:60,terms:1,arm:200,reduce:false});}},
  {title:'One term: sin x ≈ x',text:'The simplest guess is sin x ≈ x, with x in radians. Near the bottom of the swing it is close. At 60° it is off by 36 px: the orange ring flies past the blue bob.',pause:true,setup:sim=>{sim.tshow=true;}},
  {title:'Two terms',text:'Subtract x³/6. Now the worst error at 60° is 2.0 px. Much better, but still a visible wobble.',pause:true,setup:sim=>BioLab.setValues(sim,{terms:2})},
  {title:'Three terms',text:'Add x⁵/120. The worst error drops to 0.05 px, well under half a pixel. Three terms are enough for this swing.',pause:true,setup:sim=>BioLab.setValues(sim,{terms:3})},
  {title:'Wider angles need more',text:'Feed the same 3 terms angles up to 180° and the error near 180° is 105 px. Far from 0, the polynomial drifts away from sin.',pause:true,setup:sim=>{BioLab.setValues(sim,{widest:180});sim.tshow=true;}},
  {lvl:'honors',title:'Fold the angle first',text:'sin(180° − x) = sin x, so any angle can be folded into −90° to 90° with a subtraction. Now 3 terms are off by only 0.9 px, and 4 terms by 0.03 px, for every angle.',pause:true,setup:sim=>{BioLab.setValues(sim,{reduce:true});sim.tshow=true;}},
  {lvl:'ap',title:'The error bound',text:'With 4 terms the first term left out is x⁹/9!. At x = π/2 that is 0.000160, or 0.032 px on a 200 px arm. The bound is a guarantee you can check before you run any code.',pause:true,setup:sim=>BioLab.setValues(sim,{terms:4})}
 ],
 lab:{bio:'<p><b>Question:</b> How does the widest angle change the terms you need?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>For widest angles of 15°, 30°, 60°, 90° and 120°, find the fewest terms that keep the worst error under 0.5 px. Record a trial each time.</li></ol><p>Write one sentence: why do bigger angles need more terms?</p>',
  honors:'<p><b>Question:</b> How much does folding the angle save?</p><ol><li>Set the widest angle to 360°. Press <b>Use the fewest terms that work</b> with folding off, then on.</li><li>Repeat with arm lengths of 200, 400 and 800 px.</li></ol><p>Explain why the folded code needs so few terms, and why a bigger drawing needs more.</p>',
  ap:'<p><b>Question:</b> How close is the error bound to the real error?</p><ol><li>For a 90° swing, record the worst error and the error bound for 2 to 6 terms.</li><li>Compute each bound by hand: 200 × (π/2)^(2n+1)/(2n+1)!.</li></ol><p><b>CER:</b> Is the bound ever smaller than the true error? Use the alternating series error bound to explain.</p>'},
 terms:[
  {t:'Term',d:'One piece of the polynomial, like x³/6. Each one is an odd power of the angle divided by a factorial, with the sign switching each time.'},
  {t:'Radian',d:'The angle unit the polynomial needs. 180° = π radians, so 60° is about 1.047.'},
  {t:'Maclaurin polynomial',d:'A Taylor polynomial centered at 0. For sin x: x − x³/3! + x⁵/5! − … .',lvl:'honors'},
  {t:'Range reduction',d:'Moving the input into a small interval first, using identities like sin(x + 2π) = sin x and sin(π − x) = sin x.',lvl:'honors'},
  {t:'Alternating series error bound',d:'For an alternating series whose terms shrink toward 0, the error after stopping is at most the first term left out.',lvl:'ap'},
  {t:'Lagrange error bound',d:'|Rₖ(x)| ≤ M|x − a|^(k+1)/(k+1)!, where M bounds the (k+1)th derivative between a and x.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> The bob’s sideways position is arm × sin(angle). Your code replaces sin with the Maclaurin polynomial Pₙ(x) = x − x³/3! + x⁵/5! − … with n terms (degree 2n − 1), x in radians. The worst error is arm × the largest |sin x − Pₙ(x)| for angles from 0 up to the widest angle, checked at 1,201 angles. Folding uses sin(x + 360°) = sin x and sin(180° − x) = sin x to move the angle into −90° to 90° first.</p><p><b>What it leaves out.</b> Real code also needs cos for the bob’s height, and rounds to whole pixels when it draws. Multiplications per call assume Horner’s method with the coefficients stored ahead of time: x² once, one multiply and one add per extra term, and a final multiply by x. Real math libraries also use polynomials, often with coefficients tuned to beat the Taylor ones over a small range; many calculators use CORDIC, a method built from additions and bit shifts, instead.</p>'
};
BioLab.register(SIM);
})();
