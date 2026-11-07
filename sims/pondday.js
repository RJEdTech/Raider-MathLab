(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
/* Parent functions. A square root of a negative number does not exist, so it returns NaN there. */
const PAR={line:u=>u,abs:u=>Math.abs(u),quad:u=>u*u,sqrt:u=>u>=0?Math.sqrt(u):NaN,cube:u=>u*u*u};
const PNAME={line:'line',abs:'absolute-value V',quad:'parabola',sqrt:'square-root curve',cube:'cubic curve'};
const PSYM={line:'x',abs:'|x|',quad:'x²',sqrt:'√x',cube:'x³'};
const LAND=2.1+Math.sqrt(12.5);               /* where the jump path y = −0.1(x − 2.1)² + 1.25 meets the snow */
/* Three real paths. Each one is exactly a transformed parent: the math reads the vertex and one point. */
const CASES={
 ice:{tab:'Pond ice',shape:'sqrt',h:4,k:0,a:1.3,x0:0,x1:21,y0:0,y1:6,dom:[4,20],unit:'in',sc:1,start:[2,1],xs:2,ys:1,
  xl:'Date in December (each evening)',yl:'Ice thickness (in)',seen:[5,6,7,8]},
 bank:{tab:'Bank pass',shape:'abs',h:9.4,k:12,a:-1.25,x0:0,x1:24,y0:0,y1:12,dom:[3,17],unit:'cm',sc:100,start:[6,5],xs:2,ys:2,
  xl:'Meters along the boards',yl:'Meters out from the near boards',seen:Array.from({length:15},(_,i)=>3+i*6.4/12)},
 jump:{tab:'Sled jump',shape:'quad',h:2.1,k:1.25,a:-0.1,x0:-2.5,x1:8.5,y0:0,y1:3,dom:[0,LAND],unit:'cm',sc:100,start:[0,0.5],xs:1,ys:0.5,
  xl:'Meters past the lip of the jump',yl:'Height above the snow (m)',seen:Array.from({length:9},(_,i)=>i*0.35)}
};
const C=sim=>CASES[sim.p.case]||CASES.ice;
const yOf=(sh,a,b,h,k,x)=>{const f=PAR[sh](b*(x-h));return Number.isFinite(f)?a*f+k:NaN;};
const truth=(c,x)=>yOf(c.shape,c.a,1,c.h,c.k,x);
const bOf=sim=>atLeast('honors')?sim.p.b:1;
const P=sim=>({sh:sim.p.shape,a:sim.p.a,b:bOf(sim),h:sim.p.h,k:sim.p.k});
const yP=(Q,x)=>yOf(Q.sh,Q.a,Q.b,Q.h,Q.k,x);
/* Average vertical gap between a curve and the real path, over the stretch of x where the real path exists.
   Where the curve does not exist (left of a square root's starting point), the gap is measured to its starting height k. */
function gapOf(c,Q){const n=160;let s=0;for(let i=0;i<=n;i++){const x=c.dom[0]+(c.dom[1]-c.dom[0])*i/n;let y=yP(Q,x);if(!Number.isFinite(y))y=Q.k;s+=Math.abs(y-truth(c,x));}return s/(n+1)*c.sc;}
/* The key point each path is for: the day the ice reaches 4 in, where the puck crosses your teammate's lane, where the rider lands. */
function keyOf(cs,Q){
 if(cs==='ice'){for(let x=4;x<=60;x+=0.005){const y=yP(Q,x);if(Number.isFinite(y)&&y>=4)return x;}return null;}
 if(cs==='bank'){const y=yP(Q,17);return Number.isFinite(y)?y:null;}
 const y0=yP(Q,0);if(Number.isFinite(y0)&&y0<=0)return 0;for(let x=0;x<=20;x+=0.002){const y=yP(Q,x);if(Number.isFinite(y)&&y<=0)return x;}return null;}
const TRUEKEY={ice:4+Math.pow(4/1.3,2),bank:2.5,jump:LAND};
function memo(sim){const Q=P(sim),key=sim.p.case+'|'+Q.sh+'|'+Q.a+'|'+Q.b+'|'+Q.h+'|'+Q.k;if(sim._m&&sim._m.key===key)return sim._m;
 const c=C(sim);return (sim._m={key,gap:gapOf(c,Q),kp:keyOf(sim.p.case,Q)});}
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const mathOn=sim=>{const S=sim.gutS;return !!(S&&S.m&&S.m.cs===sim.p.case);};
const sgnTerm=(v,pre)=>Math.abs(v)<0.005?'':(v<0?' + '+f2(-v):' − '+f2(v));
function eqText(Q,wantB){const inner=(wantB&&Math.abs(Q.b-1)>0.001?f2(Q.b)+'(x'+sgnTerm(Q.h)+')':(Math.abs(Q.h)<0.005?'x':'x'+sgnTerm(Q.h)));
 const body=Q.sh==='abs'?'|'+inner+'|':Q.sh==='sqrt'?'√('+inner+')':Q.sh==='quad'?'('+inner+')²':Q.sh==='cube'?'('+inner+')³':'('+inner+')';
 const kk=Math.abs(Q.k)<0.005?'':(Q.k<0?' − '+f2(-Q.k):' + '+f2(Q.k));return 'y = '+f2(Q.a)+body+kk;}
const shiftWords=(v,pos,neg,u)=>Math.abs(v)<0.005?'':(v>0?pos:neg)+' '+f2(Math.abs(v))+(u?' '+u:'');
function words(Q,c,plain){const parts=[];const hs=shiftWords(Q.h,'right','left'),vs=shiftWords(Q.k,'up','down');
 if(hs)parts.push('moved '+hs);if(vs)parts.push((hs?'':'moved ')+vs);
 const A=Math.abs(Q.a);if(A<0.005)parts.push('flattened to a level line');else{if(Math.abs(A-1)>0.005)parts.push((A>1?'stretched':'squashed')+' vertically by a factor of '+f2(A));if(Q.a<0)parts.push(plain?'flipped upside down':'reflected over the x-axis');}
 if(!plain&&Math.abs(Q.b-1)>0.001){const B=Math.abs(Q.b);if(B<0.001)parts.push('with b = 0, so it is a level line');else{if(Math.abs(B-1)>0.001)parts.push((B>1?'squeezed':'stretched')+' horizontally by a factor of '+f2(1/B));if(Q.b<0)parts.push('reflected over the vertical line through its vertex');}}
 const nm=plain?PNAME[Q.sh]:'y = '+PSYM[Q.sh];return 'The '+nm+(parts.length?', '+parts.join(', '):', unchanged')+'.';}
function domRange(Q){const a=Q.a,b=Q.b,k=f2(Q.k),h=f2(Q.h);
 if(Math.abs(a)<1e-9||Math.abs(b)<1e-9)return 'Domain: all real x. Range: only y = '+(Math.abs(a)<1e-9?k:f2(Q.a*PAR[Q.sh](0)+Q.k))+'.';
 if(Q.sh==='line'||Q.sh==='cube')return 'Domain: all real x. Range: all real y.';
 const rg=a>0?'y ≥ '+k:'y ≤ '+k;if(Q.sh==='sqrt')return 'Domain: x '+(b>0?'≥ ':'≤ ')+h+'. Range: '+rg+'.';return 'Domain: all real x. Range: '+rg+'.';}
/* x counts evenings, so a fractional date falls overnight between two evenings */
const whenTxt=x=>{const d=Math.floor(x+1e-9),fr=x-d;return fr<0.1?'the evening of Dec '+d:fr>0.9?'the evening of Dec '+(d+1):'overnight between Dec '+d+' and Dec '+(d+1);};
const dateTxt=x=>{const d=Math.floor(x+1e-9);return 'Dec '+(x-d>0.02?f1(x):d);};
function setStart(sim){const c=C(sim);sim.p.h=c.start[0];sim.p.k=c.start[1];sim.p.a=1;sim.p.b=1;}
function caseChange(sim){setStart(sim);sim.p.shape='line';if(sim.ui&&sim.ui.ctl)['h','k','a','b','shape'].forEach(id=>{if(sim.ui.ctl[id])sim.ui.ctl[id].set(sim.p[id]);});
 if(sim.gutS&&(sim.gutS.g||sim.gutS.m)&&!sim._gutBusy&&!(sim.guide&&sim.guide.keep)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function truthVals(c){return {shape:c.shape,h:c.h,k:c.k,a:c.a,b:1};}
/* plot box on the stage */
const L=66,R=786,T=20,B=398;
function map(c){return {X:x=>L+(x-c.x0)/(c.x1-c.x0)*(R-L),Y:y=>B-(y-c.y0)/(c.y1-c.y0)*(B-T),ix:px=>c.x0+(px-L)/(R-L)*(c.x1-c.x0),dy:py=>py/(B-T)*(c.y1-c.y0),dx:px=>px/(R-L)*(c.x1-c.x0)};}
function curve(ctx,c,M,Q,col,lw,dash){ctx.save();ctx.beginPath();ctx.rect(L,T,R-L,B-T);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.setLineDash(dash||[]);ctx.beginPath();let pen=false;
 for(let i=0;i<=480;i++){const x=c.x0+(c.x1-c.x0)*i/480,y=yP(Q,x);if(!Number.isFinite(y)){pen=false;continue;}const py=clamp(M.Y(y),-2000,3000);pen?ctx.lineTo(M.X(x),py):ctx.moveTo(M.X(x),py);pen=true;}
 ctx.stroke();ctx.setLineDash([]);ctx.restore();}
const snap=(v,s)=>Math.round(v/s)*s;
function nudge(sim,dh,dk){const h=clamp(snap(sim.p.h+dh,0.05),-5,25),k=clamp(snap(sim.p.k+dk,0.05),-5,15);BioLab.setValues(sim,{h:+h.toFixed(2),k:+k.toFixed(2)});BioLab.refresh(sim);}

const SIM={
 id:'pondday',hash:'pondday',apUnit:6,order:1.5,tab:'Pond day: fit the curve',kind:'Simulation',next:['photofilter'],
 card:'Slide and stretch a parent function onto real ice measurements, a bank pass and a sled jump by eye, then let vertex form write the exact equation and see how far off your eye was.',
 title:'Pond day: slide, stretch, predict',
 lede:{bio:'A few measurements only tell you about the past. If you know the right shape, you can slide it and stretch it until it fits the dots, and then it tells you what happens next: when the ice reaches a target thickness, where a pass ends up, where a rider lands.',
  honors:'Every curve here is a parent function moved by y = a·f(x − h) + k. The shift (h, k) moves the vertex or starting point, a stretches and flips, and reading the vertex plus one more point gives the exact equation.',
  ap:'For y = a·f(b(x − h)) + k: h and k shift, a stretches vertically (and reflects when negative), and b stretches horizontally by 1/b (and reflects when negative). Domain and range move with the shift and flip with the signs.'},
 scale:'Three real paths, each in real units: ice thickness in inches by date, a hockey rink seen from above in meters, and a sled jump seen from the side in meters (heights drawn taller than lengths).',
 aspect:16/9,timeless:true,trials:false,graph:true,
 controlsTitle:'Your curve',
 controls:[
  {id:'case',label:'The job',type:'seg',def:'ice',noGut:true,onChange:caseChange,options:[{v:'ice',l:'Pond ice'},{v:'bank',l:'Bank pass'},{v:'jump',l:'Sled jump'}]},
  {id:'shape',label:'Which shape (parent function)?',type:'seg',def:'line',options:[{v:'line',l:'Line'},{v:'abs',l:'Absolute value'},{v:'quad',l:'Parabola'},{v:'sqrt',l:'Square root'},{v:'cube',l:'Cubic'}]},
  {id:'a',label:'Vertical stretch a',type:'range',min:-3,max:3,step:0.01,def:1,unit:'',help:'Multiplies every height. Negative flips the curve upside down.'},
  {id:'h',label:'Horizontal shift h',type:'range',min:-5,max:25,step:0.05,def:2,unit:'',help:'Or drag the curve on the picture.'},
  {id:'k',label:'Vertical shift k',type:'range',min:-5,max:15,step:0.05,def:1,unit:'',help:'Or drag the curve on the picture.'},
  {id:'b',label:'Horizontal stretch b',type:'range',min:-3,max:3,step:0.05,def:1,unit:'',lvl:'honors',help:'f(b(x − h)): squeezes the curve sideways by a factor of 1/b. Negative flips it left to right.'}
 ],
 actions:[{id:'fit',label:'Fit it exactly',lvl:'honors',run(sim){BioLab.setValues(sim,truthVals(C(sim)));}},
  {id:'restart',label:'Start over from the parent',run(sim){const c=C(sim);BioLab.setValues(sim,{shape:sim.p.shape,h:c.start[0],k:c.start[1],a:1,b:1});}}],
 init(){return {};},step(){},
 onLevel(sim){const b=!atLeast('honors'),U=sim.ui.ctlW;if(!U)return;
  const set=(id,l,h)=>{const w=U[id];if(!w)return;const Lb=w.querySelector('label');if(Lb)Lb.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('shape',b?'Which shape matches the dots?':'Which shape (parent function)?','');
  set('a',b?'Stretch (negative flips it)':'Vertical stretch a',b?'Bigger stretches it taller. Below 0 turns it upside down.':'Multiplies every height. Negative reflects it over the x-axis.');
  set('h',b?'Slide left or right':'Horizontal shift h','Or drag the curve on the picture.');set('k',b?'Slide up or down':'Vertical shift k','Or drag the curve on the picture.');},
 initVis(sim){const cv=sim.ui&&sim.ui.stage;if(!cv||cv._pd)return;cv._pd=true;cv.style.touchAction='none';cv.style.cursor='grab';if(!cv.hasAttribute('tabindex'))cv.tabIndex=0;
  cv.setAttribute('aria-label','Your curve. Drag it, or use the arrow keys, to slide it.');
  const pos=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*800,(e.clientY-r.top)/r.height*450];};
  cv.addEventListener('pointerdown',e=>{const [x,y]=pos(e);sim._drag={x,y,h:sim.p.h,k:sim.p.k};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';e.preventDefault();});
  cv.addEventListener('pointermove',e=>{const D=sim._drag;if(!D)return;const [x,y]=pos(e),M=map(C(sim));const h=clamp(snap(D.h+M.dx(x-D.x),0.05),-5,25),k=clamp(snap(D.k-M.dy(y-D.y),0.05),-5,15);
   if(h!==sim.p.h||k!==sim.p.k){BioLab.setValues(sim,{h:+h.toFixed(2),k:+k.toFixed(2)});BioLab.refresh(sim);}});
  const up=()=>{sim._drag=null;cv.style.cursor='grab';};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('keydown',e=>{const c=C(sim),sx=(c.x1-c.x0)/100,sy=(c.y1-c.y0)/100,m=e.shiftKey?5:1;
   const d={ArrowLeft:[-sx,0],ArrowRight:[sx,0],ArrowUp:[0,sy],ArrowDown:[0,-sy]}[e.key];if(!d)return;e.preventDefault();nudge(sim,d[0]*m,d[1]*m);});},
 metrics:[
  {id:'gap',label:'Average gap from the real path',unit:'in',d:2,min:0,max:null,get:sim=>memo(sim).gap},
  {id:'key',label:'Your curve reaches 4 in on Dec',unit:'',d:1,min:0,max:null,get:sim=>memo(sim).kp},
  {id:'hv',label:'Vertex or starting point: x',unit:'',d:2,lvl:'honors',min:null,max:null,get:sim=>sim.p.h},
  {id:'kv',label:'Vertex or starting point: y',unit:'',d:2,lvl:'honors',min:null,max:null,get:sim=>sim.p.k},
  {id:'av',label:'Stretch a',unit:'',d:2,lvl:'honors',min:null,max:null,get:sim=>sim.p.a},
  {id:'eq',label:'Your equation',text:true,lvl:'honors',get:sim=>eqText(P(sim),atLeast('ap'))},
  {id:'words',label:'Your curve in words',text:true,get:sim=>words(P(sim),C(sim),!atLeast('honors'))},
  {id:'dr',label:'Your function’s domain and range',text:true,lvl:'honors',get:sim=>domRange(P(sim))}
 ],
 graphs:[{id:'gapplot',label:'Gap along the real path',custom:true}],defaultGraph:'gapplot',
 plot(sim,ctx,box){const c=C(sim),Q=P(sim),n=80,xs=[],gs=[];let mx=0;
  for(let i=0;i<=n;i++){const x=c.dom[0]+(c.dom[1]-c.dom[0])*i/n;let y=yP(Q,x);if(!Number.isFinite(y))y=Q.k;const g=(y-truth(c,x))*c.sc;xs.push(x);gs.push(g);mx=Math.max(mx,Math.abs(g));}
  const top=Math.max(1,Math.ceil(mx/(c.sc===1?0.5:10))*(c.sc===1?0.5:10));
  const ax=axes(ctx,box,{xmin:c.dom[0],xmax:c.dom[1],ymin:-top,ymax:top,xl:c.xl,yl:'Your curve minus the real path ('+c.unit+')'});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax.X(c.dom[0]),ax.Y(0));ctx.lineTo(ax.X(c.dom[1]),ax.Y(0));ctx.stroke();
  ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(ax.X(xs[0]),ax.Y(0));xs.forEach((x,i)=>ctx.lineTo(ax.X(x),ax.Y(gs[i])));ctx.lineTo(ax.X(xs[n]),ax.Y(0));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.beginPath();xs.forEach((x,i)=>i?ctx.lineTo(ax.X(x),ax.Y(gs[i])):ctx.moveTo(ax.X(x),ax.Y(gs[i])));ctx.stroke();
  legend(ctx,box.L+10,box.T+8,[{label:'Above 0: your curve is too high. Below 0: too low.',color:PAL['s1']}]);},
 draw(sim,ctx,vdt,k){const c=C(sim),M=map(c),cs=sim.p.case,Q=P(sim),G=sim.gutS,gp=gutPhase(sim),mo=mathOn(sim);
  /* tile labels follow the job */
  const tl=sim.ui&&sim.ui.tiles;if(tl&&sim._tl!==cs){sim._tl=cs;const setT=(id,l,u)=>{const t=tl[id];if(!t)return;const w=t.num.closest('.tile');if(!w)return;const a=w.querySelector('.t-l'),b=w.querySelector('.u');if(a)a.textContent=l;if(b)b.textContent=u;};
   setT('gap','Average gap from the real path',c.unit);setT('key',cs==='ice'?'Your curve reaches 4 in on Dec':cs==='bank'?'Your curve at your teammate’s lane':'Your curve lands at',cs==='ice'?'':cs==='bank'?'m out':'m past the lip');}
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* scene */
  if(cs==='bank'){ctx.fillStyle=PAL['cv-glass']||PAL['cv-bg2'];ctx.globalAlpha=.35;ctx.fillRect(M.X(0),M.Y(12),M.X(24)-M.X(0),M.Y(0)-M.Y(12));ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(M.X(12),M.Y(0));ctx.lineTo(M.X(12),M.Y(12));ctx.stroke();ctx.globalAlpha=1;}
  else if(cs==='ice'){ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(M.X(8),T,M.X(21)-M.X(8),B-T);}
  else{ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(M.X(2.8),T,R-M.X(2.8),B-T);}
  /* grid and ticks */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;ctx.font=(12*k)+'px '+FONT;
  for(let x=Math.ceil(c.x0/c.xs)*c.xs;x<=c.x1+1e-9;x+=c.xs){ctx.beginPath();ctx.moveTo(M.X(x),T);ctx.lineTo(M.X(x),B);ctx.stroke();}
  for(let y=Math.ceil(c.y0/c.ys)*c.ys;y<=c.y1+1e-9;y+=c.ys){ctx.beginPath();ctx.moveTo(L,M.Y(y));ctx.lineTo(R,M.Y(y));ctx.stroke();}ctx.globalAlpha=1;
  const xstep=c.xs*(k>1.3?2:1);for(let x=Math.ceil(c.x0/xstep)*xstep;x<=c.x1+1e-9;x+=xstep)txt(ctx,String(+x.toFixed(2)),M.X(x),B+15*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  const ystep=c.ys*(k>1.3?2:1);for(let y=Math.ceil(c.y0/ystep)*ystep;y<=c.y1+1e-9;y+=ystep)txt(ctx,String(+y.toFixed(2)),L-6,M.Y(y)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});
  txt(ctx,c.xl,(L+R)/2,B+32*k>448?446:B+32*k,{s:12*k,c:PAL['cv-soft'],a:'center',w:700});
  ctx.save();ctx.translate(14,(T+B)/2);ctx.rotate(-Math.PI/2);txt(ctx,c.yl,0,0,{s:12*k,c:PAL['cv-soft'],a:'center',w:700});ctx.restore();
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  /* case art */
  const dotC=PAL['s2'];
  if(cs==='ice'){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(L,M.Y(4));ctx.lineTo(R,M.Y(4));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'4 in: the least for walking on new, clear ice',M.X(0.4),M.Y(4)-8,{s:12*k,w:700,c:PAL['s1']});
   txt(ctx,'Today: Dec 8',M.X(8)+6,T+16*k,{s:12*k,w:700,c:PAL['cv-ink']});txt(ctx,'The future',M.X(8)+6,T+32*k,{s:12*k,c:PAL['cv-soft']});
   ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(M.X(4),B);ctx.lineTo(M.X(4)-7,B+9);ctx.lineTo(M.X(4)+7,B+9);ctx.closePath();ctx.fill();
   txt(ctx,'Froze over Dec 4',M.X(4)+8,B-8,{s:12*k,w:700,c:PAL['cv-ink']});
   c.seen.forEach(x=>{const y=truth(c,x);ctx.fillStyle=dotC;ctx.beginPath();ctx.arc(M.X(x),M.Y(y),6,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=1.5;ctx.stroke();});
   if(atLeast('honors')&&!gp)c.seen.forEach((x,i)=>{if(i%2===0||i===3)txt(ctx,f2(truth(c,x)),M.X(x)+(i===3?10:-10),M.Y(truth(c,x))-10,{s:12*k,c:dotC,a:i===3?'left':'right',w:700});});}
  else if(cs==='bank'){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(L,M.Y(12));ctx.lineTo(R,M.Y(12));ctx.stroke();
   txt(ctx,'Far boards',M.X(20),M.Y(12)-8,{s:12*k,w:700,c:PAL['cv-ink'],a:'center'});
   ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(M.X(17),M.Y(0));ctx.lineTo(M.X(17),M.Y(11.6));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Teammate’s lane',M.X(17)+6,M.Y(10.6),{s:12*k,w:700,c:PAL['s3']});
   const ppl=[[3,4,'You',PAL['rj']],[17,2.5,'Teammate',PAL['s3']],[10,3.25,'Defender',PAL['cv-soft']]];
   ppl.forEach(([x,y,l,col])=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(M.X(x),M.Y(y),11,0,7);ctx.fill();txt(ctx,l,M.X(x),M.Y(y)+26*k,{s:12*k,w:700,c:col,a:'center'});});
   txt(ctx,'Clip ends here',M.X(c.seen[14])+10,M.Y(truth(c,c.seen[14]))+18,{s:12*k,c:PAL['cv-soft']});
   c.seen.forEach(x=>{ctx.fillStyle=dotC;ctx.beginPath();ctx.arc(M.X(x),M.Y(truth(c,x)),4.5,0,7);ctx.fill();});}
  else{ctx.fillStyle=PAL['cv-ink'];ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(M.X(-0.809/0.42),M.Y(0));ctx.lineTo(M.X(0),M.Y(0.809));ctx.lineTo(M.X(0),M.Y(0));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   txt(ctx,'Snow kicker',M.X(-0.15),M.Y(1.0),{s:12*k,w:700,c:PAL['cv-ink'],a:'right'});
   ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(M.X(2.8),T);ctx.lineTo(M.X(2.8),B);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Clip ends here',M.X(2.8)+6,T+16*k,{s:12*k,w:700,c:PAL['cv-ink']});
   c.seen.forEach(x=>{ctx.fillStyle=dotC;ctx.beginPath();ctx.arc(M.X(x),M.Y(truth(c,x)),5.5,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=1.5;ctx.stroke();});}
  /* the real path, once the math has had its turn */
  const Tq={sh:c.shape,a:c.a,b:1,h:c.h,k:c.k};
  const onTruth=memo(sim).gap<(c.sc===1?0.005:0.5);
  if(mo&&!onTruth)curve(ctx,c,M,Tq,PAL['s3'],3,[3,4]);
  /* the gut answer */
  const gq=G&&G.g&&G.g.cs===cs?G.g.q:null;
  const same=gq&&gq.sh===Q.sh&&Math.abs(gq.a-Q.a)<1e-6&&Math.abs(gq.h-Q.h)<1e-6&&Math.abs(gq.k-Q.k)<1e-6&&Math.abs(gq.b-Q.b)<1e-6;
  if(gq&&!same)curve(ctx,c,M,gq,PAL['s4'],2.5,[8,5]);
  /* your curve */
  const myC=mo&&onTruth?PAL['s3']:PAL['rj'];curve(ctx,c,M,Q,myC,3);
  const vx=M.X(Q.h),vy=M.Y(Q.k);if(vx>L-1&&vx<R+1&&vy>T-1&&vy<B+1){ctx.fillStyle=myC;ctx.beginPath();ctx.arc(vx,vy,7,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();}
  /* key points */
  if(mo){const tk=TRUEKEY[cs],mk=(x,y,col,lab,up)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(M.X(x),M.Y(y),7,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();if(lab)txt(ctx,lab,M.X(x)+(up?0:10),M.Y(y)+(up?-14:-10),{s:12*k,w:700,c:col,a:up?'center':'left'});};
   const gk=G.g.kp;
   if(cs==='ice'){mk(tk,4,PAL['s3'],'Math: Dec 13 to 14',false);if(gk!==null&&gk!==undefined&&Math.abs(gk-tk)>0.05&&gk<=21)mk(gk,4,PAL['s4'],'',false);}
   else if(cs==='bank'){mk(17,tk,PAL['s3'],'',false);if(gk!==null&&gk!==undefined&&gk>=0&&gk<=12&&Math.abs(gk-tk)>0.03)mk(17,gk,PAL['s4'],'',false);}
   else{mk(tk,0,PAL['s3'],'Lands '+f2(tk)+' m',true);if(gk!==null&&gk!==undefined&&gk<=8.5&&Math.abs(gk-tk)>0.03)mk(gk,0,PAL['s4'],'',false);}}
  /* labels at the top right */
  const lines=[];const tag=(s,col)=>lines.push([s,col]);
  if(mo&&onTruth)tag('The math: '+(atLeast('honors')?eqText(Q,atLeast('ap')):PNAME[Q.sh]),PAL['s3']);
  else tag(atLeast('honors')?eqText(Q,atLeast('ap')):'Your curve: '+PNAME[Q.sh],PAL['rj']);
  if(gq&&!same)tag('Your gut: dashed orange',PAL['s4']);
  if(mo&&!onTruth)tag('The math: dotted green',PAL['s3']);
  else if(gp)tag('How close is it? Lock in to find out.',PAL['cv-soft']);
  else if(!(mo&&onTruth))tag('Off by '+fmtNum(memo(sim).gap,c.sc===1?2:0)+' '+c.unit+' on average',PAL['cv-soft']);
  /* ice: bottom right is empty; the others: top right */
  const lx=R-8,lh=18*k;let ly=cs==='ice'?B-10-(lines.length-1)*lh:T+18*k;lines.forEach(([s0,col])=>{txt(ctx,s0,lx,ly,{s:13*k,w:700,c:col,a:'right'});ly+=lh;});},
 narrate(sim){const c=C(sim),Q=P(sim),cs=sim.p.case,g=memo(sim).gap,close=c.sc===1?g<0.05:g<3;
  if(close)return `<b>That is the real path.</b> ${PNAME[c.shape][0].toUpperCase()+PNAME[c.shape].slice(1)}, vertex or starting point at (${f2(c.h)}, ${f2(c.k)}), stretched by ${f2(c.a)}. Now the curve can tell you what the dots could not.`;
  if(Q.sh!==c.shape){const why={line:'a line rises by the same amount every step',abs:'a V is two straight lines that meet at a sharp point',quad:'a parabola is a smooth U that turns around at its vertex',sqrt:'a square root starts at a corner point and rises more and more slowly',cube:'a cubic is an S curve that flattens in the middle'}[Q.sh];
   const need={ice:'The ice grows fast at first, then slower every day.',bank:'The puck slides straight to the boards and straight back out, with a sharp turn at the bounce.',jump:'The rider rises, slows, turns around at the top and comes back down.'}[cs];
   return `<b>Wrong shape?</b> ${why[0].toUpperCase()+why.slice(1)}. ${need} Try another parent function.`;}
  if(Math.abs(Q.a)<0.005)return `With a stretch of 0 the curve is flattened to a level line. <b>Stretch it</b> until it bends like the dots.`;
  if(cs!=='ice'&&Q.a>0)return `The right shape, but it opens <b>upward</b>. The real path turns ${cs==='bank'?'back at the boards':'back down at the top'}, so it needs a negative stretch: a flip.`;
  return `The right shape, about ${fmtNum(g,c.sc===1?2:0)} ${c.unit} off on average. <b>${cs==='ice'?'Put the corner point where the ice started':cs==='bank'?'Put the tip of the V where the puck hit the boards':'Put the vertex at the top of the jump'}</b>, then stretch until the curve passes through one more dot.`;},
 gut:{better:'lower',controls:['shape','a'],
  ask:{bio:'Make your red curve fit the blue dots. Pick the shape here first. Then drag the curve on the picture to slide it into place, and use the stretch slider here to bend it. Lock it in when it looks right.',
   honors:'Fit the dots by eye, without <b>Fit it exactly</b>: pick the parent function here, drag the curve to slide it, and set the stretch. Then lock it in.'},
  lockLabel:'Lock in my curve',
  lock(sim){const m=memo(sim),c=C(sim),Q=P(sim);return {v:m.gap,cs:sim.p.case,q:Q,kp:m.kp,label:`a ${PNAME[Q.sh]}${atLeast('honors')?' ('+eqText(Q,atLeast('ap'))+')':''}, ${fmtNum(m.gap,c.sc===1?2:0)} ${c.unit} off on average`};},
  solve(sim){const c=C(sim);Object.assign(sim.p,truthVals(c));const m=memo(sim);return {v:m.gap,cs:sim.p.case,kp:m.kp,label:`a ${PNAME[c.shape]}, ${eqText(P(sim),false)}, 0 ${c.unit} off`};},
  how:{bio:'The math reads two things off the dots. First the special point: where the ice started, where the puck hit the boards, or the top of the jump. It slides the parent there. Then it takes one more dot and works out how much to stretch so the curve passes right through it. Every other dot then lands on the curve too.',
   honors:'Read the vertex (h, k) from the picture, then plug one more point (x, y) into y = a·f(x − h) + k and solve for a = (y − k)/f(x − h).',
   ap:'With the vertex (h, k) and b = 1, any other point (x₁, y₁) gives a = (y₁ − k)/f(x₁ − h). A second point checks the fit. If you keep b, only the product matters for these parents: a·|b| for the V, a·b² for the parabola, a·√b for the square root.'},
  compare(sim,g,m){const cs=g.cs,c=CASES[cs],gap=fmtNum(g.v,c.sc===1?2:0),tk=TRUEKEY[cs],gk=g.kp;
   if(g.v<(c.sc===1?0.05:2))return `Your gut was right on: your curve is within ${gap} ${c.unit} of the real path everywhere. Your eye already found the vertex and the stretch, and the equation just writes down what you saw.`;
   let key='';
   if(cs==='ice'){if(gk===null||gk===undefined)key=`Your curve never reaches 4 in. The math says <b>${whenTxt(tk)}</b>.`;
    else{const real=truth(c,Math.max(4,gk)),d=gk-tk;key=Math.abs(d)<0.1?`You both say the ice reaches 4 in ${whenTxt(tk)}.`:d<0?`Your curve says the ice reaches 4 in by ${whenTxt(gk)}. <b>The measurements’ curve says it is really only ${f1(real)} in thick then</b>: your curve is ${f1(-d)} days too early.`:`Your curve says the ice reaches 4 in by ${whenTxt(gk)}, but the measurements’ curve gets there ${whenTxt(tk)}: ${f1(d)} days sooner.`;}}
   else if(cs==='bank'){if(gk===null||gk===undefined)key='Your curve does not even reach your teammate’s lane.';
    else{const off=Math.abs(gk-tk)*100;key=off<15?`At your teammate’s lane you are only ${Math.round(off)} cm off: on the stick blade, which is about 30 cm long.`:`At your teammate’s lane your curve is <b>${Math.round(off)} cm ${gk>tk?'too far out':'too close to the near boards'}</b>. A stick blade is only about 30 cm long, so you would expect the pass to miss.`;}}
   else{if(gk===null||gk===undefined)key=`Your curve never comes back down, so it can’t say where to pack the landing. The rider lands ${f2(tk)} m past the lip.`;
    else{const off=Math.abs(gk-tk)*100;key=`Your curve lands the rider ${f2(gk)} m past the lip; the real landing is <b>${f2(tk)} m</b>. Pack the landing where your gut says and you are ${Math.round(off)} cm ${gk<tk?'short of where they really come down':'past it'}.`;}}
   return `The math’s curve passes through every dot: 0 ${c.unit} off. Yours is off by <b>${gap} ${c.unit} on average</b> along the whole path. ${key}`;},
  again(sim){const order=['ice','bank','jump'],i=order.indexOf(sim.p.case);sim.p.case=order[(i+1)%3];setStart(sim);sim.p.shape='line';}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The ice was 1.3 in thick one day after the pond froze, and it grows like a square root. About how thick is it 4 days after it froze?',choices:['5.2 in: four days, four times as thick','2.6 in: four times the time, twice the ice','1.3 in: it stops growing'],correct:1,explain:'Square root of 4 is 2, so the ice is 1.3 × 2 = 2.6 in, matching the Dec 8 dot. A straight line through the first two dots would keep climbing just as fast and say the ice reaches 4 in days too early.'},
  {lvl:'bio',instant:true,q:'You slide the bank pass V 2 m to the right without stretching it. What changes?',choices:['Where the puck hits the boards moves 2 m right; the angle stays the same','The V gets steeper','The V flips upside down'],correct:0,explain:'Sliding moves every point the same distance, so the bounce point moves 2 m along the boards. Only the stretch changes how steep the V is, and only a negative stretch flips it.'},
  {lvl:'honors',instant:true,q:'The jump’s path is y = −0.1(x − 2.1)² + 1.25. Where is the rider highest, and how high?',choices:['2.1 m high, 1.25 m past the lip','1.25 m high, 2.1 m past the lip','1.25 m high, 2.1 m before the lip','0.1 m high'],correct:1,explain:'In vertex form y = a(x − h)² + k, the vertex is (h, k) = (2.1, 1.25). Note the sign: x − 2.1 means a shift right 2.1. The negative a flips the parabola so the vertex is a maximum.'},
  {lvl:'honors',instant:true,q:'Compared with y = |x|, how is y = −2|x + 3| + 5 transformed?',choices:['Left 3, up 5, reflected over the x-axis, stretched vertically by 2','Right 3, up 5, reflected, stretched vertically by 2','Left 3, down 5, stretched vertically by 2','Right 3, up 5, squashed vertically by a factor of 0.5'],correct:0,explain:'x + 3 = x − (−3), so h = −3: left 3. k = 5: up 5. a = −2: reflected over the x-axis and stretched by 2. Its vertex is (−3, 5) and its range is y ≤ 5.'},
  {lvl:'ap',instant:true,q:'What are the domain and range of y = −1.3√(−(x − 4)) + 2?',choices:['x ≤ 4 and y ≤ 2','x ≥ 4 and y ≤ 2','x ≤ 4 and y ≥ 2','All real x and y ≤ 2'],correct:0,explain:'b = −1 reflects the square root left to right, so it needs −(x − 4) ≥ 0: x ≤ 4. a = −1.3 flips it downward from the starting point (4, 2), so y ≤ 2.'},
  {lvl:'ap',instant:true,q:'Which of these equals √(9(x − 4))?',choices:['3√(x − 4)','9√(x − 4)','√(9x) − 4','√(x − 36)'],correct:0,explain:'√(9u) = √9·√u = 3√u for u ≥ 0. A horizontal squeeze by a factor of 1/9 looks exactly like a vertical stretch by 3. That is why the math can always set b = 1 for these parents and put all the stretch into a.'}
 ],
 tour:[
  {title:'Ice you can measure',text:'The pond froze over on the evening of Dec 4. Every evening since, you drilled a test hole and measured the ice: the blue dots. Today is Dec 8. Your friends want to know when it reaches 4 inches, the minimum guideline for walking on new, clear ice.',focus:[[L,T,M0('ice').X(8.6)-L,B-T]],pause:true,setup:sim=>BioLab.setValues(sim,{case:'ice',shape:'line',h:2,k:1,a:1,b:1})},
  {title:'Pick the shape',text:{bio:'The ice grew 1.3 in the first day but only 0.35 in from Dec 7 to Dec 8. It grows fast, then slower and slower. A line can’t do that. The square-root shape can: it starts at a corner point, rises fast, then flattens.',honors:'The ice grew 1.3 in the first day but only 0.35 in from Dec 7 to Dec 8. A line has the same rise every day, so it can’t fit. The parent y = √x starts at (0, 0), rises fast, then flattens.'},pause:true,setup:sim=>BioLab.setValues(sim,{shape:'sqrt',h:0,k:0,a:1,b:1})},
  {title:'Slide it to the start',text:{bio:'The square root’s corner point should sit where the ice started: Dec 4, at 0 inches. Slide the whole curve 4 to the right. Nothing changes shape; every point just moves over 4 days.',honors:'Move the starting point from (0, 0) to (4, 0): y = √(x − 4). Subtracting 4 inside shifts the graph right 4. Its domain is now x ≥ 4: no ice before the pond froze.'},pause:true,setup:sim=>BioLab.setValues(sim,{h:4,k:0,a:1})},
  {title:'Stretch it through one dot',text:{bio:'One day after the start, the plain square root is only 1 high. The ice was 1.3 in. So stretch the curve: multiply every height by 1.3.',honors:'One more point fixes the stretch: on Dec 5, √(5 − 4) = 1, but the ice was 1.3 in. So a = 1.3/1 = 1.3, and y = 1.3√(x − 4).'},pause:true,setup:sim=>BioLab.setValues(sim,{a:1.3}),focus:sim=>{const M=M0('ice');return [M.X(4)-20,M.Y(2.9),M.X(8.6)-M.X(4)+20,M.Y(0)-M.Y(2.9)+10];}},
  {title:'Check the other dots',text:'Dec 8 is 4 days after the start: 1.3 × √4 = 2.6 in, right on the dot. Dec 6: 1.3 × √2 = 1.84 in. One equation matches every measurement, so you can trust it to look ahead.',pause:true},
  {title:'Look ahead',text:{bio:'Follow the curve to the 4 in line: it gets there overnight between Dec 13 and Dec 14. On Saturday, Dec 12, the ice is still only 3.7 in. A straight line through the first two dots says Dec 10, when the ice is really only 3.2 in.',honors:'Solve 1.3√(x − 4) = 4: √(x − 4) = 3.08, so x − 4 = 9.47 and x ≈ 13.47: overnight between the evenings of Dec 13 and Dec 14. On Saturday, Dec 12, the ice is 1.3√8 = 3.7 in. The line through the first two dots says Dec 10, when it is really 3.2 in.'},pause:true,focus:sim=>{const M=M0('ice');return [M.X(9),M.Y(4.6),M.X(15)-M.X(9),M.Y(3)-M.Y(4.6)];}},
  {lvl:'honors',title:'Same moves, other shapes',text:'The bank pass is a V: y = a|x − h| + k. The vertex (9.4, 12) is where the puck hit the boards. a = −1.25 flips the V and sets how steep it is, and the range y ≤ 12 says the puck never goes through the boards.',pause:true,setup:sim=>BioLab.setValues(sim,{case:'bank',shape:'abs',h:9.4,k:12,a:-1.25,b:1})},
  {lvl:'ap',title:'The horizontal stretch b',text:'In y = a·f(b(x − h)) + k, b squeezes the graph sideways by 1/b. For these parents it can be traded for a vertical stretch: |2u| = 2|u|, (2u)² = 4u², √(4u) = 2√u. So the math sets b = 1. A negative b flips a square root to open left.',pause:true,setup:sim=>BioLab.setValues(sim,{case:'jump',shape:'quad',h:2.1,k:1.25,a:-0.1,b:1})}
 ],
 lab:{bio:'<p><b>Question:</b> How does each slider change the curve?</p><ol><li>Pick <b>Parabola</b> on the <b>Sled jump</b>. Move only <b>Slide left or right</b>. What moves, and what stays the same?</li><li>Now move only <b>Stretch</b>, through 1, 0.5, 0 and −1. Describe each.</li><li>Fit the jump by eye and write down where your curve says the rider lands.</li></ol><p>Write one sentence for each slider: what does it do to the picture?</p>',
  honors:'<p><b>Question:</b> Can you write each equation from the picture alone?</p><ol><li>For each job, read the vertex or starting point (h, k) from the dots.</li><li>Pick one more dot and solve for a.</li><li>Enter your equation with the sliders and check the gap. Then press <b>Fit it exactly</b>.</li><li>Write the domain and range of each function, and the domain and range that make sense in real life.</li></ol>',
  ap:'<p><b>Question:</b> How do a and b trade off?</p><ol><li>On the <b>Sled jump</b>, set b = 2. Find the a that fits exactly. Repeat for b = 0.5 and b = −1.</li><li>Do the same for the <b>Pond ice</b> with b = 4.</li><li>Explain why b < 0 works for the parabola and the V but not for the square root.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the algebra of each parent.</p>'},
 terms:[
  {t:'Parent function',d:'The simplest member of a family: y = x, y = |x|, y = x², y = √x, y = x³. Every curve here is one of these, moved and stretched.'},
  {t:'Transformation',d:'A slide, stretch or flip that changes a graph into another one in the same family.'},
  {t:'Vertex',d:'The turning point of a V or a parabola, or the starting point of a square root. The math reads it first.'},
  {t:'Domain and range',d:'Domain: the x values the function accepts. Range: the y values it gives back. In a real problem they are often smaller, like the ice only existing after Dec 4.'},
  {t:'Horizontal shift',d:'f(x − h) moves the graph h to the right. The minus sign is why x − 4 means right 4.',lvl:'honors'},
  {t:'Vertical shift',d:'f(x) + k moves the graph up k.',lvl:'honors'},
  {t:'Vertical stretch and reflection',d:'a·f(x) multiplies every height by a. |a| > 1 stretches, |a| < 1 squashes, and a < 0 reflects over the x-axis.',lvl:'honors'},
  {t:'Horizontal stretch',d:'f(b·x) squeezes the graph sideways by a factor of 1/b. b < 0 reflects it over the y-axis.',lvl:'ap'}
 ],
 about:'<p>Your curve is y = a·f(b(x − h)) + k for the parent f you pick (b = 1 below Deep dive). The <b>average gap</b> is the average vertical distance between your curve and the real path, measured at 161 evenly spaced points over the part of x where the real thing exists: Dec 4 to Dec 20 for the ice, 3 m to 17 m along the boards for the pass, and from the lip to the landing for the jump. Where a square root does not exist, the gap is measured to its starting height k.</p><p><b>Pond ice</b> follows y = 1.3√(x − 4). Under steady cold, ice thickness grows with the square root of time (Stefan’s law). The 1.3 in per √day rate is made up but realistic for a small pond. Real ice grows slower under snow, faster in deep cold, and varies across a pond. 4 inches of new, clear ice is the Minnesota DNR’s minimum for walking. <b>This is a simplified model, not safety advice.</b> No model can tell you ice is safe, and the Minnesota DNR says no ice is ever completely safe: thickness varies across a pond, and white or snow ice is weaker than clear ice.</p><p><b>Bank pass</b> follows y = −1.25|x − 9.4| + 12. The puck slides straight and bounces at the same angle it comes in, ignoring friction, spin and how the boards give. <b>Sled jump</b> follows y = −0.1(x − 2.1)² + 1.25: a rider moving 7 m/s across, with gravity only (a = −4.9/7² = −0.1). Air drag would shorten the real flight a little. <b>Jumps are a simplified example, not safety advice:</b> a rider leaving a 0.8 m kicker at 7 m/s is going about 25 km/h, so a real landing has to be long, soft, sloped and well packed, and the model cannot tell you that. The positions are made up but follow these rules exactly, so the math’s curve fits them with no gap; real tracked data would scatter a little around it.</p>'
};
function M0(cs){return map(CASES[cs]);}
SIM.thumbSetup=sim=>{BioLab.setValues(sim,{case:'ice',shape:'sqrt',h:4.6,k:0,a:1.15,b:1});};
BioLab.register(SIM);
})();
