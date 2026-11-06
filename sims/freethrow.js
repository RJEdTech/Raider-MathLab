(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,randn}=BioLab.h;
/* Free throw, side view. Release at the free-throw line (x = 0) at height R; rim center at (13.75, 10) ft.
   Path h(x) = a(x − h)² + k with a = (R − k)/h². No air drag, no spin. */
const XR=13.75,RIM=10,RR=9/12,BR=4.7/12,G=32.17;
const S=20,X0=110,FL=420,PX=x=>X0+x*S,PY=y=>FL-y*S;
const relH=sim=>atLeast('honors')?sim.p.R:7;
const sdV=sim=>atLeast('ap')?sim.p.sv/100:0.01, sdA=sim=>atLeast('ap')?sim.p.sa:1;
const coef=(h,k,R)=>(R-k)/(h*h);
/* where the path comes down through rim height (descending side) */
const crossX=(h,k,R)=>h+Math.sqrt((k-RIM)/(-coef(h,k,R)));
const aimH=(k,R)=>XR/(1+Math.sqrt((k-RIM)/(k-R)));
function launch(h,k,R){const a=coef(h,k,R),t=-2*a*h,th=Math.atan(t),v=Math.sqrt(-G/(2*a*Math.cos(th)*Math.cos(th)));return {a,th,v};}
function land(th,v,R){const a=-G/(2*v*v*Math.cos(th)*Math.cos(th)),t=Math.tan(th),disc=t*t-4*a*(R-RIM);if(disc<0)return null;const x=(-t-Math.sqrt(disc))/(2*a);return {x,ang:Math.atan(Math.abs(t+2*a*x))};}
const winFt=ang=>ang>0?RR-BR/Math.sin(ang):-1;
const entry=(h,k,R)=>{const a=coef(h,k,R),x=crossX(h,k,R);return Math.atan(Math.abs(2*a*(x-h)));};
/* swishes per 100: release speed and angle each vary by a normal error; a swish clears the rim without touching it */
const memo=new Map();
function swish(h,k,R,sv,sa){const key=[h,k,R,sv,sa].map(v=>v.toFixed(4)).join('|');if(memo.has(key))return memo.get(key);
 const L=launch(h,k,R),N=37;let tot=0,ok=0;
 for(let i=0;i<N;i++){const e=-3.5+7*i/(N-1),we=Math.exp(-.5*e*e);for(let j=0;j<N;j++){const f=-3.5+7*j/(N-1),w=we*Math.exp(-.5*f*f);tot+=w;
  const r=land(L.th+sa*f*Math.PI/180,L.v*(1+sv*e),R);if(!r)continue;const wn=winFt(r.ang);if(wn>0&&Math.abs(r.x-XR)<=wn)ok+=w;}}
 const out=100*ok/tot;if(memo.size>4000)memo.clear();memo.set(key,out);return out;}
const cur=sim=>{const R=relH(sim);return {h:sim.p.h,k:sim.p.k,R};};
const missFt=sim=>{const c=cur(sim);return crossX(c.h,c.k,c.R)-XR;};
const swNow=sim=>{const c=cur(sim);return swish(c.h,c.k,c.R,sdV(sim),sdA(sim));};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.full||(GS(sim)&&GS(sim).g));
const f1=v=>v.toFixed(1),f0=v=>Math.round(v).toString();
function missWords(mi){const a=Math.abs(mi);if(a<1)return 'drops through the center';
 const side=mi>0?'long':'short';if(a<=RR*12+4.7)return `comes down ${f0(a)} in ${side} and hits the ${mi>0?'back':'front'} of the rim`;
 return mi>0?`comes down ${f0(a)} in long, past the rim`:`comes down ${f0(a)} in short of the rim center and misses everything`;}
function bestArc(sim){const R=relH(sim),sv=sdV(sim),sa=sdA(sim);let bk=13,bs=-1;for(let k=10.6;k<=20.001;k+=0.1){const s=swish(aimH(k,R),k,R,sv,sa);if(s>bs+1e-9){bs=s;bk=k;}}return +bk.toFixed(1);}

const SIM={
 id:'freethrow',hash:'freethrow',apUnit:3,order:2,tab:'Free-throw arcs',kind:'Simulation',
 card:'Set the arc of a free throw by feel, then use vertex form to send it through the center of the rim.',
 title:'The arc of a free throw',
 lede:{bio:'A free throw follows a parabola. You set where the top of the arc is, and the way down mirrors the way up. Can you place the top so the ball comes down through the rim?',
  honors:'The path is h(x) = a(x − h)² + k: the vertex (h, k) is the top of the arc, and x = h is the axis of symmetry. Two points, the release and the rim center, fix a once you pick the arc height.',
  ap:'For release height R and arc height k, the path through the rim center at (13.75, 10) has its vertex at h = 13.75 / (1 + √((k − 10)/(k − R))). Higher arcs come in steeper, so the rim looks wider to the ball.'},
 scale:'Side view, drawn to scale. One grid square is 1 ft. Rim 10 ft high; rim center 13.75 ft from the free-throw line.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your shot',
 controls:[
  {id:'k',label:'Arc height: top of the arc',type:'range',min:10.5,max:20,step:0.1,def:13,unit:' ft'},
  {id:'h',label:'Your aim: top of the arc, feet past the line',type:'range',min:3,max:11,step:0.1,def:5.5,unit:' ft'},
  {id:'R',label:'Release height',type:'range',min:6,max:8.5,step:0.1,def:7,unit:' ft',lvl:'honors',noGut:true,help:'Where the ball leaves your hands. Taller players and jump shots release higher.'},
  {id:'full',label:'Show the whole path',type:'toggle',def:false,help:'Off: you see only the way up, like a shooter before the ball comes down.'},
  {id:'sv',label:'Release speed varies (1 standard deviation)',type:'range',min:0.5,max:2,step:0.1,def:1,unit:'%',lvl:'ap',noGut:true,help:'An assumption for illustration, not a measured value.'},
  {id:'sa',label:'Release angle varies (1 standard deviation)',type:'range',min:0.5,max:2,step:0.1,def:1,unit:'°',lvl:'ap',noGut:true}
 ],
 actions:[
  {id:'shoot',label:'Shoot 10',run(sim){const c=cur(sim),L=launch(c.h,c.k,c.R),sv=sdV(sim),sa=sdA(sim),shots=[];let n=0;
   for(let i=0;i<10;i++){const th=L.th+sa*randn()*Math.PI/180,v=L.v*(1+sv*randn()),r=land(th,v,c.R);const ok=!!r&&winFt(r.ang)>0&&Math.abs(r.x-XR)<=winFt(r.ang);if(ok)n++;shots.push({th,v,ok,x:r?r.x:XR});}
   sim.st.shots={list:shots,n,R:c.R};}},
  {id:'aim',label:'Aim at the rim center',lvl:'honors',run(sim){const c=cur(sim);BioLab.setValues(sim,{h:+aimH(c.k,c.R).toFixed(2),full:true});sim.st.shots=null;}},
  {id:'best',label:'Find the best arc',lvl:'ap',run(sim){const R=relH(sim),k=bestArc(sim);BioLab.setValues(sim,{k,h:+aimH(k,R).toFixed(2),full:true});sim.st.shots=null;}}
 ],
 init(){return {shots:null};},step(){},
 metrics:[
  {id:'miss',label:'Miss at rim height (+ long, − short)',unit:'in',d:0,min:-60,max:60,get:sim=>{if(!shown(sim))return null;const v=missFt(sim)*12;return Math.abs(v)<0.5?0:v;}},
  {id:'swish',label:'Swishes per 100',unit:'',d:0,min:0,max:100,get:sim=>shown(sim)?swNow(sim):null},
  {id:'entry',label:'Entry angle',unit:'°',d:1,min:0,max:90,lvl:'honors',get:sim=>{if(!shown(sim))return null;const c=cur(sim);return entry(c.h,c.k,c.R)*180/Math.PI;}},
  {id:'launch',label:'Launch angle',unit:'°',d:1,min:0,max:90,lvl:'honors',get:sim=>{const c=cur(sim);return launch(c.h,c.k,c.R).th*180/Math.PI;}},
  {id:'a',label:'a in vertex form',unit:'',d:3,min:-1,max:0,lvl:'ap',get:sim=>{const c=cur(sim);return coef(c.h,c.k,c.R);}},
  {id:'speed',label:'Release speed',unit:'ft/s',d:1,min:0,max:40,lvl:'ap',get:sim=>{const c=cur(sim);return launch(c.h,c.k,c.R).v;}},
  {id:'eq',label:'The path',text:true,lvl:'honors',get:sim=>{const c=cur(sim),a=coef(c.h,c.k,c.R);return `h(x) = −${Math.abs(a).toFixed(3)}(x − ${c.h.toFixed(2)})² + ${c.k.toFixed(1)}, released at (0, ${c.R.toFixed(1)})`;}}
 ],
 graphs:[{id:'arcs',label:'Swishes vs. arc height',custom:true}],defaultGraph:'arcs',
 plot(sim,ctx,box){const R=relH(sim),sv=sdV(sim),sa=sdA(sim);
  const ax=axes(ctx,box,{xmin:10.5,xmax:20,ymin:0,ymax:100,xl:'Arc height (ft), aimed at the rim center',yl:'Swishes per 100'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let k=10.6;k<=20.001;k+=0.2){const y=swish(aimH(k,R),k,R,sv,sa);k<10.7?ctx.moveTo(ax.X(k),ax.Y(y)):ctx.lineTo(ax.X(k),ax.Y(y));}ctx.stroke();
  const dot=(k,y,col,lab,dy)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(k),ax.Y(y),6,0,7);ctx.fill();txt(ctx,lab,ax.X(k),ax.Y(y)+dy,{s:12,w:700,c:col,a:'center'});};
  const Gs=GS(sim);if(Gs&&Gs.g)dot(Gs.g.k,Gs.g.sw,PAL['s4'],'Your gut',20);
  if(shown(sim))dot(sim.p.k,swNow(sim),PAL['rj'],'You',-12);
  legend(ctx,box.L+10,box.T+8,[{label:'Every arc aimed at the rim center',color:PAL['g-line']}]);},
 draw(sim,ctx,vdt,k0){const k=Math.max(k0,1.3),c=cur(sim),a=coef(c.h,c.k,c.R),sh=shown(sim),hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* 1 ft grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.35;for(let x=-5;x<=34;x++){ctx.beginPath();ctx.moveTo(PX(x),0);ctx.lineTo(PX(x),FL);ctx.stroke();}for(let y=0;y<=21;y++){ctx.beginPath();ctx.moveTo(0,PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  /* floor */
  ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(0,FL,800,30);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,FL);ctx.lineTo(800,FL);ctx.stroke();
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(PX(0),FL-1);ctx.lineTo(PX(0),FL+8);ctx.stroke();
  /* rim-height line */
  ctx.setLineDash([6,6]);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,PY(RIM));ctx.lineTo(PX(XR)-20,PY(RIM));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'10 ft',6,PY(RIM)-6,{s:12*k,c:PAL['cv-soft']});
  /* backboard, rim, net, support */
  ctx.fillStyle=PAL['cv-ink'];ctx.fillRect(PX(15),PY(13.5),5,PY(9.5)-PY(13.5));
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(PX(15)+5,PY(11));ctx.lineTo(PX(17),PY(11));ctx.lineTo(PX(17),FL);ctx.stroke();
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(PX(XR-0.75),PY(RIM));ctx.lineTo(PX(15),PY(RIM));ctx.stroke();
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(PX(XR-0.75),PY(RIM));ctx.lineTo(PX(XR-0.5),PY(RIM-1.3));ctx.lineTo(PX(XR+0.5),PY(RIM-1.3));ctx.lineTo(PX(XR+0.75),PY(RIM));ctx.stroke();
  /* shooter (simple figure) */
  const R=c.R,hx=PX(-0.6);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=5;ctx.lineCap='round';
  const hip=R*0.45,sh2=R*0.72;ctx.beginPath();ctx.moveTo(hx-8,FL);ctx.lineTo(hx,PY(hip));ctx.lineTo(hx+8,FL);ctx.moveTo(hx,PY(hip));ctx.lineTo(hx,PY(sh2));ctx.lineTo(PX(0),PY(R));ctx.stroke();
  ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.arc(hx-2,PY(sh2+0.55),9,0,7);ctx.fill();ctx.lineCap='butt';
  txt(ctx,'Free-throw line',6,FL+22,{s:12*k,w:700,c:PAL['rj']});
  txt(ctx,'13.75 ft to rim center',PX(XR)+8,FL+22,{s:12*k,c:PAL['cv-ink'],a:'right'});
  /* ten shots */
  const T=sim.st&&sim.st.shots;
  if(T&&Math.abs(T.R-R)<1e-9){T.list.forEach(s=>{const aa=-G/(2*s.v*s.v*Math.cos(s.th)**2),t=Math.tan(s.th);ctx.strokeStyle=s.ok?PAL['s3']:PAL['cv-soft'];ctx.globalAlpha=.55;ctx.lineWidth=1.5;ctx.beginPath();
    for(let x=0;x<=Math.min(s.x,15);x+=0.1){const y=R+t*x+aa*x*x;x<0.05?ctx.moveTo(PX(x),PY(y)):ctx.lineTo(PX(x),PY(y));}ctx.stroke();ctx.globalAlpha=1;});
   pill(ctx,`${T.n} of 10 swished`,640,40,PAL['s3'],'#fff',14*Math.min(k,1.3));}
  /* gut path */
  const Gs=GS(sim);let gutLab=null;if(Gs&&Gs.g&&(Math.abs(Gs.g.h-c.h)>0.02||Math.abs(Gs.g.k-c.k)>0.02)&&Math.abs(Gs.g.R-R)<1e-9){const g=Gs.g,ag=coef(g.h,g.k,R),xe=Math.min(crossX(g.h,g.k,R),15);
   ctx.setLineDash([7,5]);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();for(let x=0;x<=xe+1e-9;x+=0.1){const y=ag*(x-g.h)**2+g.k;x<0.05?ctx.moveTo(PX(x),PY(y)):ctx.lineTo(PX(x),PY(y));}ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Your gut',PX(g.h),PY(g.k)-12,{s:12*k,w:700,c:PAL['s4'],a:'center'});gutLab=[PX(g.h),PY(g.k)];}
  /* the path: the way up always, the way down once revealed */
  const xc=crossX(c.h,c.k,R),xend=sh?Math.min(xc,15):c.h;
  if(hon){ctx.setLineDash([3,5]);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PX(c.h),PY(c.k));ctx.lineTo(PX(c.h),FL);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,`x = ${c.h.toFixed(1)}`,PX(c.h)+5,FL-8,{s:12*k,c:PAL['s5']});}
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=xend+1e-9;x+=0.05){const y=a*(x-c.h)**2+c.k;x<0.02?ctx.moveTo(PX(x),PY(y)):ctx.lineTo(PX(x),PY(y));}ctx.stroke();
  if(!sh){ctx.setLineDash([2,6]);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(c.h),PY(c.k));ctx.lineTo(PX(c.h+1.2),PY(c.k-0.4));ctx.stroke();ctx.setLineDash([]);}
  ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(PX(c.h),PY(c.k),6,0,7);ctx.fill();
  const who=Gs&&Gs.m?'The math: ':Gs&&Gs.g?'':'Your ',lab=hon?`${who==='The math: '?who:''}Vertex (${c.h.toFixed(1)}, ${c.k.toFixed(1)})`:`${who}${who==='Your '?'top: ':who?'top ':'Top: '}${c.k.toFixed(1)} ft high, ${c.h.toFixed(1)} ft out`;
  ctx.font='700 '+(13*k)+'px '+FONT;const lw=ctx.measureText(lab).width,ly=gutLab&&Math.abs(gutLab[1]-PY(c.k))<22*k&&Math.abs(gutLab[0]-PX(c.h))<lw/2+40*k?PY(c.k)-12-20*k:PY(c.k)-12;
  txt(ctx,lab,clamp(PX(c.h),lw/2+6,794-lw/2),ly,{s:13*k,w:700,c:PAL['cv-ink'],a:'center'});
  /* the ball where it comes down through rim height */
  if(sh){const bx=Math.min(xc,15-BR);ctx.fillStyle='#d9771f';ctx.beginPath();ctx.arc(PX(bx),PY(RIM),BR*S,0,7);ctx.fill();ctx.strokeStyle='#5a2d0c';ctx.lineWidth=1.2;ctx.stroke();
   const mi=(xc-XR)*12,ok=winFt(entry(c.h,c.k,R))>0&&Math.abs(xc-XR)<=winFt(entry(c.h,c.k,R));
   pill(ctx,Math.abs(mi)<1?'Through the center':`${f0(Math.abs(mi))} in ${mi>0?'long':'short'}`,625,PY(RIM),ok?PAL['s3']:PAL['s1'],'#fff',13*Math.min(k,1.3));}
  else{txt(ctx,'Lock in to see the way down',625,PY(RIM)+5,{s:13*k,c:PAL['cv-soft'],a:'center'});}},
 narrate(sim){const c=cur(sim);
  if(!shown(sim))return `Your arc tops out ${f1(c.k)} ft high, ${f1(c.h)} ft past the line. <b>A parabola is symmetric about its top</b>, so the way down mirrors the way up. Will it come down through the rim?`;
  const mi=missFt(sim)*12,e=entry(c.h,c.k,c.R)*180/Math.PI;
  if(Math.abs(mi)<1)return `<b>Through the center.</b> The ball comes down at ${f1(e)}° and about ${f0(swNow(sim))} of 100 shots like this swish. ${e<35?'The arc is flat, so the rim looks narrow to the ball.':'A steeper arc makes the rim look wider to the ball.'}`;
  return `The ball ${missWords(mi)}. <b>${mi>0?'Move the top of the arc closer to you':'Move the top of the arc farther out'}</b>, or change its height, to center it.`;},
 gut:{better:'lower',controls:['h'],lockLabel:'Shoot: lock in my arc',
  ask:{bio:'Drag the slider here to move the top of your arc closer or farther; the gold dot in the picture moves with it. You only see the way up, like a real shooter. Shoot when it looks right.',honors:'Drag the slider here to set the vertex’s distance past the line by feel, then lock in your shot. The arc height stays where it is.'},
  lock(sim){const c=cur(sim),mi=missFt(sim)*12;return {v:Math.abs(mi),h:c.h,k:c.k,R:c.R,miss:mi,sw:swNow(sim),label:`top of the arc ${f1(c.k)} ft high, ${f1(c.h)} ft out. It ${missWords(mi)}`};},
  solve(sim){const c=cur(sim);sim.p.h=aimH(c.k,c.R);sim.p.full=true;sim.st.shots=null;const mi=missFt(sim)*12;return {v:Math.abs(mi),h:sim.p.h,k:c.k,R:c.R,miss:mi,sw:swNow(sim),label:`same height, top of the arc ${sim.p.h.toFixed(2)} ft out: it drops through the center`};},
  how:{bio:'The way down mirrors the way up. The ball leaves your hands below the rim, so the top of the arc must sit a bit past halfway to the rim. The math finds exactly where.',
   honors:'Keep your arc height k. The release (0, R) and the rim center (13.75, 10) must both fit h(x) = a(x − h)² + k. Setting the two values of a equal gives (13.75 − h)/h = √((k − 10)/(k − R)).',
   ap:'From R = ah² + k and 10 = a(13.75 − h)² + k: h = 13.75 / (1 + √((k − 10)/(k − R))), then a = (R − k)/h².'},
  compare(sim,g,m){if(Math.abs(g.miss)<1)return `Your gut was right on: your shot comes down within an inch of the rim center. Shooters build this feel with thousands of shots; vertex form is the same idea written down.`;
   const sv=sdV(sim)*100,sa=sdA(sim),gs=Math.round(g.sw),ms=Math.round(m.sw);
   let t=`Your shot ${missWords(g.miss)}. Same arc height, top of the arc moved ${Math.abs(m.h-g.h).toFixed(1)} ft ${m.h>g.h?'farther out':'closer'}, and it drops through the center.`;
   if(ms>gs)t+=` With your release varying a little from shot to shot (speed ±${f1(sv)}%, angle ±${f1(sa)}°), that is about <b>${ms} swishes per 100</b> against <b>${gs}</b> for your arc${atLeast('honors')?'':' (a swish drops in without touching the rim)'}.`;
   else t+=` At this arc height the ball comes in so flat that even a centered shot rarely swishes (${ms} per 100): try a higher arc.`;
   return t;},
  again(sim){if(atLeast('honors'))sim.p.R=+(6.4+Math.random()*1.6).toFixed(1);sim.p.k=13;sim.p.h=5.5;sim.p.full=false;sim.st.shots=null;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A shot leaves the hands 7 ft high at the free-throw line, and the top of its arc is 6 ft past the line. How far past the line is the ball 7 ft high again?',choices:['6 ft','12 ft','13.75 ft','You cannot tell'],correct:1,explain:'A parabola is symmetric about its top. The release is 6 ft before the top, so the ball is back at 7 ft high 6 ft after it: 12 ft past the line.'},
  {lvl:'bio',instant:true,q:'Your shot comes down short of the rim. You keep the same arc height. Where should the top of the arc go?',choices:['Closer to you','Farther out, toward the rim','It does not matter where the top is'],correct:1,explain:'Moving the top of the arc out moves the whole way down out with it, by the symmetry of the parabola, so the ball comes down farther from you.'},
  {lvl:'honors',instant:true,q:'A shot’s path is h(x) = −0.2(x − 6)² + 14. Where is the top of the arc?',choices:['14 ft high, 6 ft past the line','6 ft high, 14 ft past the line','14 ft high, −6 ft past the line','0.2 ft high'],correct:0,explain:'In vertex form a(x − h)² + k, the vertex is (h, k) = (6, 14): 6 ft out, 14 ft high.'},
  {lvl:'honors',instant:true,q:'Same path, h(x) = −0.2(x − 6)² + 14. Where does it come down through rim height, 10 ft?',choices:['At the rim center, 13.75 ft','About 10.5 ft out: 3.3 ft short','About 16 ft out: off the backboard'],correct:1,explain:'Solve −0.2(x − 6)² + 14 = 10: (x − 6)² = 20, so x = 6 + 4.47 ≈ 10.47 ft. That is about 3.3 ft short of the rim center.'},
  {lvl:'ap',instant:true,q:'Release at (0, 7), arc height 15 ft. To pass through the rim center (13.75, 10), where must the top of the arc be?',choices:['About 6.0 ft out','About 7.7 ft out','About 8.4 ft out','Exactly halfway, 6.9 ft out, for every arc'],correct:1,explain:'h = 13.75 / (1 + √((15 − 10)/(15 − 7))) = 13.75 / (1 + 0.791) ≈ 7.68 ft. The top sits past halfway because the release is lower than the rim.'},
  {lvl:'ap',instant:true,q:'A flat shot aimed at the rim center tops out just 11 ft high. In this model, why does it never swish?',choices:['It is moving too slowly','It comes in at about 24°, so the rim looks narrower than the ball','Flat shots always fall short'],correct:1,explain:'Seen along the ball’s path, the 18-inch rim looks only about 18 × sin(entry angle) inches wide. At 24° that is about 7.2 inches, less than the 9.4-inch ball. The ball needs an entry angle above about 31.5° just to fit.'}
 ],
 tour:[
  {title:'The free throw',text:'The rim is 10 ft high, and its center is 13.75 ft from the free-throw line. The shooter releases the ball about 7 ft up, right above the line.',pause:true,setup:sim=>{BioLab.setValues(sim,{k:13,h:5.5,R:7,full:false});sim.st.shots=null;}},
  {title:'You set the top of the arc',text:'The orange dot is the top of the arc. You only see the way up, like a shooter before the ball comes down. Where will it land?',pause:true},
  {title:'The way down mirrors the way up',text:'A parabola is symmetric about its top. This one tops out 5.5 ft past the line, so the way down is the way up flipped. It comes through rim height about 52 in short: the ball started 3 ft below the rim, so it needs more room on the way down.',pause:true,setup:sim=>BioLab.setValues(sim,{full:true})},
  {title:'Aim it',text:'Keep the same 13 ft arc height but move the top of the arc out to 8.05 ft. Now the path passes through the rim center.',pause:true,setup:sim=>{BioLab.setValues(sim,{h:8.05,full:true});sim.st.shots=null;}},
  {title:'A flat arc',text:'Now a flat shot, topping out at 11.5 ft and aimed at the center. It reaches the rim at only about 31°, so the ball barely fits through: about 1 swish per 100.',pause:true,setup:sim=>BioLab.setValues(sim,{k:11.5,h:8.72,full:true})},
  {title:'A higher arc',text:'Aimed at the center with a 14 ft top, the ball comes in at about 54° and about 48 of 100 shots swish. Same aim, much more room for error.',pause:true,setup:sim=>BioLab.setValues(sim,{k:14,h:7.83,full:true})},
  {lvl:'honors',title:'Vertex form',text:'The path is h(x) = a(x − h)² + k with vertex (h, k). The release point fixes a = (R − k)/h². For this shot: a = (7 − 14)/7.83² ≈ −0.114.',pause:true},
  {lvl:'ap',title:'The best arc',text:'Higher arcs come in steeper but need more speed and travel farther, so small release errors grow. With speed varying 1% and angle 1°, this model’s best arc tops out near 14.2 ft.',pause:true,setup:sim=>{const a=sim.def.actions.find(x=>x.id==='best');BioLab.setValues(sim,{R:7,sv:1,sa:1});a.run(sim);}}
 ],
 lab:{bio:'<p><b>Question:</b> How does arc height change your chances?</p><ol><li>Turn on <b>Show the whole path</b>.</li><li>Set the arc height to 11 ft. Move <b>Top of the arc</b> until the miss is 0 in. Press <b>Shoot 10</b> three times and record a trial.</li><li>Repeat for arc heights of 12, 13, 14, 16 and 18 ft.</li></ol><p>Write one sentence: is higher always better?</p>',
  honors:'<p><b>Question:</b> Does the vertex sit exactly halfway to the rim?</p><ol><li>For three release heights (6, 7 and 8 ft), press <b>Aim at the rim center</b> at an arc height of 14 ft.</li><li>Record the vertex for each and compare it with 13.75 ÷ 2 = 6.875 ft.</li></ol><p>Explain using symmetry why a lower release moves the vertex farther out.</p>',
  ap:'<p><b>Question:</b> Which arc gives the most swishes, and why is there a best one?</p><ol><li>Record swishes per 100 for arcs from 11 to 20 ft, each aimed at the rim center.</li><li>Change the speed and angle spreads and press <b>Find the best arc</b> each time.</li></ol><p><b>CER:</b> Explain the trade-off between entry angle and sensitivity to release errors.</p>'},
 terms:[
  {t:'Parabola',d:'The U-shaped (here, upside-down U) graph of a quadratic function. Without air drag, a thrown ball follows one.'},
  {t:'Vertex',d:'The top (or bottom) point of a parabola. Here, the top of the arc.'},
  {t:'Axis of symmetry',d:'The vertical line through the vertex, x = h. The parabola is the same on both sides of it.'},
  {t:'Vertex form',d:'h(x) = a(x − h)² + k, with vertex (h, k). a < 0 opens downward.',lvl:'honors'},
  {t:'Zeros',d:'Where the function equals 0. Here, solving h(x) = 10 finds where the ball crosses rim height, going up and coming down.',lvl:'honors'},
  {t:'Entry angle',d:'How steeply the ball comes down at the rim. Steeper means the rim looks wider to the ball.',lvl:'ap'}
 ],
 about:'<p>Regulation numbers: the rim is 10 ft high and 18 in across, and the free-throw line is 15 ft from the face of the backboard. The rim’s center sits 15 in out from the backboard, so it is <b>13.75 ft from the free-throw line</b>. The ball is about 9.4 in across.</p><p>The model is physics-light: no air drag, no spin, and the ball is released right above the line. The path is h(x) = a(x − h)² + k through the release point (0, R). A <b>swish</b> means the ball’s center comes down within 9 − 4.7/sin(entry angle) inches of the rim center, so it clears the rim without touching it. Real shooters also make shots that touch the rim or the backboard, so their make rates are higher than the swish rates here.</p><p><b>Swishes per 100</b> assume the release speed and angle each vary by a normal error, 1% and 1° unless you change them at Deep dive. Those spreads are assumptions for illustration, not measured values.</p>'
};
BioLab.register(SIM);
})();
