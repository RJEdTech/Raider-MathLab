(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
/* Original letter shapes, drawn as a centerline of strokes. One cubic in each is the target; P0 and P3 are fixed, you place P1 and P2. */
const L=(a,b)=>({line:[a,b]}),C=(a,b,c,d)=>({cub:[a,b,c,d]});
const GLYPHS={
 D:{name:'the bowl of a D',parts:[L([140,60],[140,400])],target:[[140,60],[370,55],[370,405],[140,400]]},
 S:{name:'the spine of an S',parts:[C([335,105],[300,58],[140,48],[130,135]),C([340,310],[350,405],[170,425],[118,350])],target:[[130,135],[125,215],[345,215],[340,310]]},
 J:{name:'the hook of a J',parts:[L([300,60],[300,300]),L([250,60],[350,60])],target:[[300,300],[300,425],[128,432],[120,330]]}
};
const CAP=360,SIGN=60;                          /* letters here are about 360 px tall; a shop-sign letter might be 60 cm tall */
const gl=sim=>GLYPHS[sim.p.glyph];
const pts=sim=>{const T=gl(sim).target;return [T[0],[sim.p.p1x,sim.p.p1y],[sim.p.p2x,sim.p.p2y],T[3]];};
function bez(P,t){const u=1-t,a=u*u*u,b=3*u*u*t,c=3*u*t*t,d=t*t*t;return [a*P[0][0]+b*P[1][0]+c*P[2][0]+d*P[3][0],a*P[0][1]+b*P[1][1]+c*P[2][1]+d*P[3][1]];}
const W=t=>{const u=1-t;return [u*u*u,3*u*u*t,3*u*t*t,t*t*t];};
function poly(P,N){const o=[];for(let i=0;i<=N;i++)o.push(bez(P,i/N));return o;}
function dSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;let t=l2?((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2:0;t=clamp(t,0,1);return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
function oneWay(A,Bp){let s=0;A.forEach(p=>{let m=1e9;for(let i=1;i<Bp.length;i++)m=Math.min(m,dSeg(p,Bp[i-1],Bp[i]));s+=m;});return s/A.length;}
/* Average gap (px): mean distance from points on the target to your curve, and from points on your curve to the target, averaged. */
function gapOf(sim,P){P=P||pts(sim);const key=sim.p.glyph+P.map(q=>q.join(',')).join('|');if(sim._g&&sim._g.key===key)return sim._g.v;
 const T=gl(sim).target,v=0.5*(oneWay(poly(T,60),poly(P,240))+oneWay(poly(P,60),poly(T,240)));const r=Math.round(v*1e6)/1e6;sim._g={key,v:r};return r;}
/* Solve for P1, P2 from the target’s points at t = 1/3 and t = 2/3: 27B(1/3) = 8P0 + 12P1 + 6P2 + P3 and 27B(2/3) = P0 + 6P1 + 12P2 + 8P3. */
function fit(T){const Q1=bez(T,1/3),Q2=bez(T,2/3),out=[[0,0],[0,0]];for(let c=0;c<2;c++){const A=27*Q1[c]-8*T[0][c]-T[3][c],B=27*Q2[c]-T[0][c]-8*T[3][c];out[0][c]=(2*A-B)/18;out[1][c]=(2*B-A)/18;}return out;}
const coef=(a0,a1,a2,a3)=>[a0,3*(a1-a0),3*(a0-2*a1+a2),a3-3*a2+3*a1-a0];
function polyText(c,v){const term=(x,pw,first)=>{const s=Math.abs(x)<0.05?null:(first?(x<0?'−':''):(x<0?' − ':' + '))+Math.abs(x).toFixed(1)+pw;return s;};
 const parts=[[c[0],''],[c[1],'t'],[c[2],'t²'],[c[3],'t³']];let out='',first=true;parts.forEach(([x,pw])=>{const s=term(x,pw,first);if(s){out+=s;first=false;}});return v+'(t) = '+(out||'0');}
const key=sim=>sim.p.glyph;
/* While the student is still matching by eye in Guided, the picture does not score the gap. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
/* At Big picture the points have plain names instead of P₀ to P₃. */
const PN=()=>atLeast('honors')?['P₀','P₁','P₂','P₃']:['start','handle 1','handle 2','end'];
function strokeCub(ctx,P){ctx.beginPath();ctx.moveTo(P[0][0],P[0][1]);ctx.bezierCurveTo(P[1][0],P[1][1],P[2][0],P[2][1],P[3][0],P[3][1]);}

const SIM={
 id:'fontcurves',hash:'fontcurves',apUnit:11,order:1,tab:'Font curves',kind:'Go further',prereq:['coaster'],
 card:'Drag two control points to match a letter’s curve by eye, then solve for them exactly: the cubic Bézier behind every font.',
 title:'The curves inside every letter',
 lede:{bio:'Every letter in the fonts on your screen is stored as curves, and each curve is just four points. The curve starts at the first and ends at the last. The two middle points pull it into shape without touching it.',
  honors:'A cubic Bézier is B(t) = (1 − t)³P₀ + 3(1 − t)²t P₁ + 3(1 − t)t² P₂ + t³P₃ for 0 ≤ t ≤ 1. The four weights always add to 1, so the curve is a moving weighted average of the four points.',
  ap:'Expanded, x(t) and y(t) are each a cubic polynomial in t. Because B(t) is linear in P₁ and P₂, two points on the target, at t = 1/3 and t = 2/3, give a 2 × 2 linear system that pins down both control points.'},
 scale:'A letter about 360 px tall on a grid of screen pixels (y counts down from the top, as on every screen). The target is the dashed line inside the gray letter.',
 aspect:16/9,timeless:true,animated:true,trials:true,graph:true,
 controlsTitle:'Your curve',
 controls:[
  {id:'glyph',label:'Curve to match',type:'seg',def:'D',options:[{v:'D',l:'D bowl'},{v:'S',l:'S spine'},{v:'J',l:'J hook'}]},
  {id:'p1x',label:'P₁ across (x)',type:'range',min:20,max:450,step:1,def:250,unit:' px',help:'Or drag P₁ on the stage.'},
  {id:'p1y',label:'P₁ down (y)',type:'range',min:10,max:440,step:1,def:150,unit:' px'},
  {id:'p2x',label:'P₂ across (x)',type:'range',min:20,max:450,step:1,def:250,unit:' px'},
  {id:'p2y',label:'P₂ down (y)',type:'range',min:10,max:440,step:1,def:310,unit:' px'},
  {id:'marks',label:'Show the target’s points at t = 1/3 and t = 2/3',type:'toggle',def:false,lvl:'honors'}
 ],
 actions:[{id:'fit',label:'Solve for P₁ and P₂',lvl:'honors',run(sim){const F=fit(gl(sim).target);BioLab.setValues(sim,{p1x:F[0][0],p1y:F[0][1],p2x:F[1][0],p2y:F[1][1],marks:true});}}],
 init(){return {};},step(){},
 onLevel(sim){const b=!atLeast('honors'),U=sim.ui.ctlW;if(!U)return;
  const set=(id,l,h)=>{const w=U[id];if(!w)return;const L=w.querySelector('label');if(L)L.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('p1x',b?'Your handle 1: how far right':'P₁ across (x)',b?'Or drag the purple dots on the picture.':'Or drag P₁ on the stage.');
  set('p1y',b?'Your handle 1: how far down':'P₁ down (y)','');set('p2x',b?'Your handle 2: how far right':'P₂ across (x)','');set('p2y',b?'Your handle 2: how far down':'P₂ down (y)','');},
 initVis(sim){const cv=sim.ui&&sim.ui.stage;if(!cv||cv._fc)return;cv._fc=true;cv.style.touchAction='none';cv.style.cursor='grab';
  const pos=e=>{const r=cv.getBoundingClientRect();return [(e.clientX-r.left)/r.width*800,(e.clientY-r.top)/r.height*450];};
  cv.addEventListener('pointerdown',e=>{const [x,y]=pos(e),P=pts(sim),d1=Math.hypot(x-P[1][0],y-P[1][1]),d2=Math.hypot(x-P[2][0],y-P[2][1]);if(Math.min(d1,d2)>45)return;sim._drag=d1<=d2?1:2;cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing';e.preventDefault();});
  cv.addEventListener('pointermove',e=>{if(!sim._drag)return;const [x,y]=pos(e),cx=Math.round(clamp(x,20,450)),cy=Math.round(clamp(y,10,440));BioLab.setValues(sim,sim._drag===1?{p1x:cx,p1y:cy}:{p2x:cx,p2y:cy});BioLab.refresh&&BioLab.refresh(sim);});
  const up=()=>{sim._drag=0;cv.style.cursor='grab';};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);},
 metrics:[
  {id:'gap',label:'Average gap from the target',unit:'px',d:1,min:0,max:60,get:sim=>gapOf(sim)},
  {id:'sign',label:'On a 60 cm tall banner letter, that is',unit:'cm',d:1,min:0,max:10,get:sim=>gapOf(sim)*SIGN/CAP},
  {id:'xt',label:'Your curve’s x(t)',text:true,lvl:'ap',get:sim=>{const P=pts(sim);return polyText(coef(P[0][0],P[1][0],P[2][0],P[3][0]),'x');}},
  {id:'yt',label:'Your curve’s y(t)',text:true,lvl:'ap',get:sim=>{const P=pts(sim);return polyText(coef(P[0][1],P[1][1],P[2][1],P[3][1]),'y');}},
  {id:'xhalf',label:'Your curve’s x at t = 0.5',unit:'px',d:1,lvl:'honors',min:0,max:null,noTrial:true,get:sim=>bez(pts(sim),0.5)[0]}
 ],
 graphs:[{id:'xy',label:'x(t) and y(t): two cubics in t',custom:true}],defaultGraph:'xy',
 plot(sim,ctx,box){const P=pts(sim),T=gl(sim).target;box.T=34;box.H=box.ch-34-40;
  const ax=axes(ctx,box,{xmin:0,xmax:1,ymin:0,ymax:450,xl:'t (0 at the start, 1 at the end)',yl:'Pixels'});
  const ln=(Q,c,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash||[]);ctx.beginPath();for(let i=0;i<=100;i++){const b=bez(Q,i/100);i?ctx.lineTo(ax.X(i/100),ax.Y(b[c])):ctx.moveTo(ax.X(0),ax.Y(b[c]));}ctx.stroke();ctx.setLineDash([]);};
  ln(T,0,PAL['s2'],[6,5]);ln(T,1,PAL['s1'],[6,5]);ln(P,0,PAL['s2']);ln(P,1,PAL['s1']);
  legend(ctx,box.L,14,[{label:'Your x(t)',color:PAL['s2']},{label:'Your y(t)',color:PAL['s1']},{label:'Target (dashed)',color:PAL['muted'],dash:true}]);},
 draw(sim,ctx,vdt,k,Tm){const G=gl(sim),T=G.target,P=pts(sim),Gs=sim.gutS,same=Gs&&Gs.g&&Gs.g.glyph===sim.p.glyph,hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.35;for(let x=20;x<=460;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,450);ctx.stroke();}for(let y=10;y<=450;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(460,y);ctx.stroke();}ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(468,10);ctx.lineTo(468,440);ctx.stroke();
  /* the letter: a thick gray stroke */
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=PAL['cv-soft'];ctx.globalAlpha=.28;ctx.lineWidth=44;
  G.parts.forEach(s=>{if(s.line){ctx.beginPath();ctx.moveTo(...s.line[0]);ctx.lineTo(...s.line[1]);ctx.stroke();}else{strokeCub(ctx,s.cub);ctx.stroke();}});strokeCub(ctx,T);ctx.stroke();ctx.globalAlpha=1;
  /* target centerline */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.setLineDash([7,6]);strokeCub(ctx,T);ctx.stroke();ctx.setLineDash([]);
  if(same){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([3,4]);strokeCub(ctx,[T[0],Gs.g.P1,Gs.g.P2,T[3]]);ctx.stroke();ctx.setLineDash([]);}
  /* control polygon */
  ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(...P[0]);ctx.lineTo(...P[1]);ctx.moveTo(...P[3]);ctx.lineTo(...P[2]);ctx.stroke();
  if(hon){ctx.globalAlpha=.4;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(...P[1]);ctx.lineTo(...P[2]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
  /* your curve */
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=4;strokeCub(ctx,P);ctx.stroke();ctx.lineCap='butt';
  if(sim.p.marks&&hon){[1/3,2/3].forEach((t,i)=>{const q=bez(T,t);ctx.fillStyle=PAL['s3'];ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(Math.PI/4);ctx.fillRect(-6,-6,12,12);ctx.restore();txt(ctx,i?'t = 2/3':'t = 1/3',q[0]+12,q[1]-10,{s:12*k,w:700,c:PAL['s3']});});}
  /* tracer: a point moving along your curve as t runs from 0 to 1 */
  const ph=((Tm||0)*0.18)%2,t=ph<1?ph:2-ph,B=bez(P,t);ctx.fillStyle=PAL['s6'];ctx.beginPath();ctx.arc(B[0],B[1],7,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
  /* points */
  const nm=PN();[[P[0],nm[0],false],[P[3],nm[3],false],[P[1],nm[1],true],[P[2],nm[2],true]].forEach(([q,l,mv])=>{ctx.fillStyle=mv?PAL['s5']:PAL['cv-ink'];ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(q[0],q[1],mv?10:6,0,7);ctx.fill();ctx.stroke();
   txt(ctx,l,q[0]+(q[0]>400?-14:14),q[1]+(q[1]<30?18:-12),{s:13*k,w:700,c:mv?PAL['s5']:PAL['cv-ink'],a:q[0]>400?'right':'left'});});
  /* right panel: how hard each point pulls at this t */
  const g=gapOf(sim);if(gutPhase(sim))pill(ctx,'How close? Lock in to find out.',630,34,PAL['s2'],'#fff',13*Math.min(k,1.3));else pill(ctx,'Average gap: '+f1(g)+' px',630,34,g<0.5?PAL['s3']:PAL['rj'],'#fff',14*k);
  txt(ctx,hon?'t = '+f2(t):'Teal dot: '+Math.round(t*100)+'% of the way',630,34+28*k,{s:14*k,w:700,c:PAL['s6'],a:'center'});
  txt(ctx,hon?'How hard each point pulls':'How hard each point pulls on it',630,34+50*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  const w=W(t),bx=500,bw=260/4,by=400,bh=Math.min(250,by-(34+64*k));
  w.forEach((v,i)=>{const h=v*bh,x=bx+i*bw;ctx.fillStyle=i===1||i===2?PAL['s5']:PAL['cv-ink'];ctx.globalAlpha=i===1||i===2?.85:.55;ctx.fillRect(x+8,by-h,bw-16,h);ctx.globalAlpha=1;
   txt(ctx,hon?'P'+'₀₁₂₃'[i]:['start','1','2','end'][i],x+bw/2,by+16*k,{s:13*k,w:700,a:'center'});if(hon||k<1.3)txt(ctx,f2(v),x+bw/2,by-h-6,{s:12*k,c:PAL['cv-soft'],a:'center'});});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+260,by);ctx.stroke();},
 narrate(sim){const g=gapOf(sim),G=gl(sim);
  if(g<0.5)return `<b>A perfect match.</b> Your curve lies right on ${G.name}. Notice that it does not pass through P₁ or P₂: they only pull the curve toward them.`;
  if(g<4)return `Very close: on average your curve is ${f1(g)} px from ${G.name}. <b>Small moves of P₁ and P₂ now shift the curve only a little,</b> because each one pulls with at most 4/9 of the weight.`;
  return `Your curve is on average ${f1(g)} px from ${G.name}. <b>The curve leaves P₀ heading straight toward P₁</b> and arrives at P₃ coming from the direction of P₂, so aim the handles along the letter’s edges.`;},
 gut:{better:'lower',
  controls:['p1x','p2x'],
  ask:{bio:'Make your red curve lie on the dashed line inside the letter. Drag the two purple handles on the picture, then use the two sliders here to fine-tune how far right each one sits. Lock it in when the curves match.',honors:'Match the target by eye first, without the t = 1/3 and 2/3 marks or the solve button. Drag P₁ and P₂ on the picture or use the sliders here, then lock it in.'},
  lockLabel:'Lock in my curve',
  lock(sim){const g=gapOf(sim);return {v:g,P1:[sim.p.p1x,sim.p.p1y],P2:[sim.p.p2x,sim.p.p2y],glyph:sim.p.glyph,label:atLeast('honors')?`P₁ = (${Math.round(sim.p.p1x)}, ${Math.round(sim.p.p1y)}) and P₂ = (${Math.round(sim.p.p2x)}, ${Math.round(sim.p.p2y)}), an average gap of ${f1(g)} px`:`your handles, an average gap of ${f1(g)} px from the letter`};},
  solve(sim){const F=fit(gl(sim).target);Object.assign(sim.p,{p1x:F[0][0],p1y:F[0][1],p2x:F[1][0],p2y:F[1][1],marks:true});const g=gapOf(sim);return {v:g,glyph:sim.p.glyph,label:atLeast('honors')?`P₁ = (${Math.round(F[0][0])}, ${Math.round(F[0][1])}) and P₂ = (${Math.round(F[1][0])}, ${Math.round(F[1][1])}), an average gap of ${f1(g)} px`:`handles at (${Math.round(F[0][0])}, ${Math.round(F[0][1])}) and (${Math.round(F[1][0])}, ${Math.round(F[1][1])}), an average gap of ${f1(g)} px`};},
  how:{bio:'The math does not guess. It reads two points on the target, a third and two thirds of the way along, and uses the Bézier formula to work backward to the only control points that put the curve through them.',
   honors:'B(t) is a weighted average of P₀, P₁, P₂, P₃. At t = 1/3 the weights are 8/27, 12/27, 6/27, 1/27, and at t = 2/3 they are 1/27, 6/27, 12/27, 8/27. Knowing B at those two times gives two equations in the two unknown points.',
   ap:'Let A = 27B(1/3) − 8P₀ − P₃ and B′ = 27B(2/3) − P₀ − 8P₃. Then 12P₁ + 6P₂ = A and 6P₁ + 12P₂ = B′, so P₁ = (2A − B′)/18 and P₂ = (2B′ − A)/18, for x and y separately.'},
  compare(sim,g,m){const cm=g.v*SIGN/CAP;
   if(g.v<1.5)return `Your gut was right on: an average gap of only ${f1(g.v)} px, which would hardly show. Your eye already treats P₁ and P₂ as handles that set the curve’s direction, which is exactly what the formula says they do.`;
   return `The solved control points put the curve exactly on the letter: a gap of ${f1(m.v)} px against your ${f1(g.v)} px. On a letter this size that is a visible wobble. Printed on a banner where this letter stands 60 cm (about 2 ft) tall, it would be <b>about ${f1(cm)} cm (${f1(cm/2.54)} in)</b> off the designer’s shape, in every copy of that letter.`;},
  again(sim){const ks=Object.keys(GLYPHS),cur=sim.p.glyph;let n=cur;while(n===cur)n=ks[Math.floor(Math.random()*ks.length)];sim.p.glyph=n;sim.p.p1x=250;sim.p.p1y=150;sim.p.p2x=250;sim.p.p2y=310;sim.p.marks=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Which of the four points does a cubic Bézier curve always pass through?',choices:['All four','Only P₀ and P₃, the two ends','Only P₁ and P₂','None of them'],correct:1,explain:'At t = 0 the weights are 1, 0, 0, 0, so B(0) = P₀, and at t = 1 they are 0, 0, 0, 1, so B(1) = P₃. In between, P₁ and P₂ each pull with at most 4/9 of the weight, so the curve bends toward them but (except in special cases) never reaches them.'},
  {lvl:'bio',instant:true,q:'You drag P₁ farther away from P₀, in the same direction. What happens near the start of the curve?',choices:['The curve leaves P₀ in a new direction','The curve leaves P₀ in the same direction but follows it farther before turning','The curve stops passing through P₀'],correct:1,explain:'The curve always leaves P₀ heading toward P₁, so the direction does not change. Moving P₁ farther out strengthens its pull, so the curve hugs that direction longer before bending toward P₃.'},
  {lvl:'honors',instant:true,q:'At t = 1/2, what are the four weights in B(t) = (1 − t)³P₀ + 3(1 − t)²t P₁ + 3(1 − t)t² P₂ + t³P₃?',choices:['1/4 each','1/8, 3/8, 3/8, 1/8','1/2, 0, 0, 1/2','0, 1/2, 1/2, 0'],correct:1,explain:'(1/2)³ = 1/8 and 3(1/2)³ = 3/8. They add to 1, as the weights always do. The two control points together get 3/4 of the pull at the middle of the curve.'},
  {lvl:'honors',instant:true,q:'The D bowl’s points are P₀ = (140, 60), P₁ = (370, 55), P₂ = (370, 405) and P₃ = (140, 400). How far right does the curve reach, at t = 1/2?',choices:['x = 370','x = 312.5','x = 255','x = 140'],correct:1,explain:'x(1/2) = (140 + 3 × 370 + 3 × 370 + 140)/8 = 2500/8 = 312.5. The curve only gets 3/4 of the way from the stem toward the control points, which is why the handles sit outside the letter.'},
  {lvl:'ap',instant:true,q:'If P₀, P₁, P₂, P₃ are evenly spaced along one straight line, what is the degree of x(t)?',choices:['3','2','1','0'],correct:2,explain:'With x₁ = x₀ + d, x₂ = x₀ + 2d, x₃ = x₀ + 3d, the t² coefficient 3(x₀ − 2x₁ + x₂) and the t³ coefficient x₃ − 3x₂ + 3x₁ − x₀ are both 0. So x(t) = x₀ + 3dt: linear, and the point moves at constant speed.'},
  {lvl:'ap',instant:true,q:'Expanded, x(t) = x₀ + 3(x₁ − x₀)t + 3(x₀ − 2x₁ + x₂)t² + (x₃ − 3x₂ + 3x₁ − x₀)t³. What is x′(0), the starting horizontal speed?',choices:['x₁','3(x₁ − x₀)','x₁ − x₀','0'],correct:1,explain:'x′(t) = 3(x₁ − x₀) + 6(x₀ − 2x₁ + x₂)t + 3(…)t², so x′(0) = 3(x₁ − x₀). The same holds for y, so the curve starts out heading straight at P₁, three times as fast as the distance to it.'}
 ],
 tour:[
  {title:'A letter is a few curves',text:'This gray shape is an original letter D. A font stores its outline as curves. The dashed line is one curve, the bowl, and it is your target.',focus:[20,20,440,420],pause:true,setup:sim=>BioLab.setValues(sim,{glyph:'D',p1x:250,p1y:150,p2x:250,p2y:310,marks:false})},
  {title:'Four points make one curve',text:'Your red curve is set by four points. It starts at P₀ and ends at P₃, which sit on the letter. The two purple points, P₁ and P₂, pull the curve toward them.',pause:true},
  {title:'Watch t run',text:'The teal dot moves along your curve as t goes from 0 to 1. The bars on the right show how hard each point pulls at that moment: P₀ wins at the start, P₃ at the end, P₁ and P₂ in between.',focus:[470,10,320,430],pause:false,speed:0.6},
  {title:'Pull the handles out',text:'Drag P₁ and P₂ out to the right and the bowl swells. The curve leaves P₀ heading straight toward P₁ and arrives at P₃ from the direction of P₂.',pause:true,setup:sim=>BioLab.setValues(sim,{p1x:330,p1y:70,p2x:330,p2y:390})},
  {title:'The exact answer',text:'The math puts P₁ at (370, 55) and P₂ at (370, 405). The curve now lies exactly on the target, yet it never touches either handle: at its widest it reaches only x = 312.5.',pause:true,setup:sim=>BioLab.setValues(sim,{p1x:370,p1y:55,p2x:370,p2y:405})},
  {lvl:'honors',title:'Two points pin it down',text:'The green marks are the target at t = 1/3 and t = 2/3. Since B(t) is a weighted average, knowing B at two times gives two equations for the two unknown control points.',pause:true,setup:sim=>BioLab.setValues(sim,{marks:true})},
  {lvl:'ap',title:'A polynomial in t',text:'Expand the formula and x(t) and y(t) are each cubics in t. For this bowl, x(t) = 140 + 690t − 690t² and y(t) = 60 − 15t + 1065t² − 710t³. Check the graph below.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Where do the control points have to go?</p><ol><li>Match the D bowl by eye. Record a trial.</li><li>Do the same for the S spine and the J hook.</li><li>For each, compare where P₁ and P₂ ended up with where the curve itself goes.</li></ol><p>Write one sentence: are the control points on the curve, inside it or outside it?</p>',
  honors:'<p><b>Question:</b> How much does each control point pull?</p><ol><li>Solve the D bowl. Read <b>Your curve’s x at t = 0.5</b>.</li><li>Check it with B(1/2) = (P₀ + 3P₁ + 3P₂ + P₃)/8.</li><li>Move P₁ right by 40 px. Predict how far the point at t = 0.5 moves, then check.</li></ol>',
  ap:'<p><b>Question:</b> Can you recover the control points from the curve?</p><ol><li>Read two points on the S spine with the t = 1/3 and 2/3 marks.</li><li>Set up and solve the 2 × 2 system for P₁ and P₂ by hand.</li><li>Compare with <b>Solve for P₁ and P₂</b> and with x(t), y(t).</li></ol><p><b>CER:</b> Claim, evidence from your calculation, and reasoning about why the system always has exactly one solution.</p>'},
 terms:[
  {t:'Bézier curve',d:'A curve set by control points. A cubic Bézier has four: two ends and two that pull the curve.'},
  {t:'Control point',d:'A point that pulls the curve toward it. P₁ and P₂ shape the curve but usually do not lie on it.'},
  {t:'Parameter t',d:'A number from 0 to 1 that says how far along the curve you are. x and y are both functions of t.'},
  {t:'Weighted average',d:'Each point times a weight, with weights adding to 1. B(t) is a weighted average of P₀ to P₃.',lvl:'honors'},
  {t:'Parametric equations',d:'Describing a curve with x(t) and y(t) instead of y as a function of x. That is how a curve can loop or turn back.',lvl:'honors'},
  {t:'Bernstein polynomials',d:'The weights (1 − t)³, 3(1 − t)²t, 3(1 − t)t², t³. They come from expanding ((1 − t) + t)³.',lvl:'ap'}
 ],
 about:'<p>B(t) = (1 − t)³P₀ + 3(1 − t)²t P₁ + 3(1 − t)t² P₂ + t³P₃. <b>Average gap</b> averages two distances: from 61 points along the target to your curve, and from 61 points along your curve to the target. The 60 cm sign conversion assumes the letter, about 360 px tall here, is printed 60 cm tall.</p><p>The letters are original shapes drawn for this tool. Real fonts trace a letter’s outline, not its centerline, and use many curves per letter, but each curve works exactly like this one.</p>'
};
BioLab.register(SIM);
})();
