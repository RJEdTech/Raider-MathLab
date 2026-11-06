(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* You start at the door (0, 0). The sidewalk runs along the top edge of the field. The car is D m along and W m across.
   Walk x m on the sidewalk at v1, then straight to the car at v2: T(x) = x/v1 + √((D − x)² + W²)/v2.
   T′(x) = 1/v1 − (D − x)/(v2·√((D − x)² + W²)) = 0 gives D − x* = W·r/√(1 − r²), r = v2/v1. If that puts x* below 0, the best is x = 0. */
const V1=1.4;
const FIELD={snow:{l:'Ankle-deep snow',v:0.8},mud:{l:'Muddy grass',v:1.0},grass:{l:'Dry grass',v:1.3}};
const v2=sim=>FIELD[sim.p.field].v;
const Dd=sim=>sim.p.D,Ww=sim=>sim.p.W;
const diag=(sim,x)=>Math.hypot(Dd(sim)-x,Ww(sim));
const T=(sim,x)=>x/V1+diag(sim,x)/v2(sim);
const xCrit=sim=>{const r=v2(sim)/V1;return Dd(sim)-Ww(sim)*r/Math.sqrt(1-r*r);};
const xBest=sim=>Math.max(0,xCrit(sim));
const tBest=sim=>T(sim,xBest(sim));
/* Zoom so the car and both routes fit, keeping one scale for both directions so angles stay true. */
const scaleOf=(sim,gx)=>Math.min(720/Math.max(Dd(sim)+30,sim.p.x+20,gx+20),290/Ww(sim));
const shown=sim=>!!(sim.st.peek||(sim.gutS&&sim.gutS.g));
const f0=v=>fmtNum(v,0),f1=v=>fmtNum(v,1);
const mmss=s=>{s=Math.round(s);const m=Math.floor(s/60);return m+':'+String(s-60*m).padStart(2,'0');};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)&&!(sim.guide&&sim.guide.keep)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'shortcut',hash:'shortcut',apUnit:16,order:4,tab:'Fastest way to the car',kind:'Simulation',prereq:['runpace'],next:['viewcurve'],
 card:'Pick where to leave the sidewalk and cut across a snowy field to your car, then let the derivative find the fastest route.',
 title:'What is the fastest way to the car?',
 lede:{bio:'Walking the sidewalk is fast but long. Cutting across the snow is short but slow. The fastest route is somewhere in between, and it is not where most people guess.',
  honors:'Total time T(x) is a function of where you leave the sidewalk. Its minimum is where T′(x) = 0: one more meter of sidewalk saves exactly as much time in the snow as it costs on the pavement.',
  ap:'Check a minimum with T″(x) > 0, or compare the critical point with the endpoints of the closed interval. At the best route, sin φ = field speed ÷ sidewalk speed: the same rule as the critical angle in Snell’s law.'},
 scale:'Seen from above. One grid square is 10 m. You walk 1.4 m/s on the sidewalk; field speeds are assumptions for illustration.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your walk',
 controls:[
  {id:'x',label:'Your gut: leave the sidewalk after',type:'range',min:0,max:200,step:1,def:20,unit:' m',help:'How far along the sidewalk you walk before you turn and head straight for the car.'},
  {id:'field',label:'The field is',type:'seg',def:'snow',noGut:true,onChange:clearGut,options:[{v:'snow',l:'Snow: 0.8 m/s'},{v:'mud',l:'Mud: 1.0 m/s'},{v:'grass',l:'Dry grass: 1.3 m/s',lvl:'honors'}]},
  {id:'D',label:'The car is this far along the sidewalk',type:'range',min:40,max:200,step:5,def:120,unit:' m',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'W',label:'The car is this far across the field',type:'range',min:20,max:70,step:5,def:40,unit:' m',lvl:'honors',noGut:true,onChange:clearGut}
 ],
 actions:[
  {id:'peek',label:'Skip the guess and show the math',run(sim){sim.st.peek=true;}},
  {id:'best',label:'Leave at the best spot',lvl:'honors',run(sim){sim.st.peek=true;BioLab.setValues(sim,{x:Math.round(xBest(sim))});}}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'t',label:'Your walk takes',unit:'s',d:1,min:0,max:null,get:sim=>shown(sim)?T(sim,sim.p.x):null},
  {id:'tbest',label:'Fastest possible',unit:'s',d:1,min:0,max:null,get:sim=>shown(sim)?tBest(sim):null},
  {id:'lost',label:'Seconds lost vs. the best route',unit:'s',d:1,min:0,max:null,get:sim=>shown(sim)?T(sim,sim.p.x)-tBest(sim):null},
  {id:'xstar',label:'Best place to leave the sidewalk',unit:'m',d:1,lvl:'honors',min:0,max:200,get:sim=>shown(sim)?xBest(sim):null},
  {id:'t0',label:'Cut across right away',unit:'s',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?T(sim,0):null},
  {id:'tD',label:'Sidewalk until straight across, then cut',unit:'s',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?T(sim,Dd(sim)):null},
  {id:'sin',label:'sin φ of your path in the field',unit:'',d:3,lvl:'ap',min:0,max:1,get:sim=>shown(sim)?(Dd(sim)-sim.p.x)/diag(sim,sim.p.x):null},
  {id:'ratio',label:'Speed ratio, field ÷ sidewalk',unit:'',d:3,lvl:'ap',min:0,max:1,get:sim=>v2(sim)/V1}
 ],
 graphs:[{id:'tx',label:'Total time vs. where you leave the sidewalk',custom:true}],defaultGraph:'tx',
 plot(sim,ctx,box){const D=Dd(sim),xm=Math.max(D,sim.p.x)+10;let hi=0,lo=1e9;for(let x=0;x<=xm;x+=1){const t=T(sim,x);hi=Math.max(hi,t);lo=Math.min(lo,t);}
  const ax=axes(ctx,box,{xmin:0,xmax:xm,ymin:Math.floor(lo*0.9/10)*10,ymax:Math.ceil(hi*1.05/10)*10,xl:'Meters along the sidewalk before you turn',yl:'Total time (s)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let x=0;x<=xm;x+=0.5){const px=ax.X(x),py=ax.Y(T(sim,x));x?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  const dot=(x,c,r)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(ax.X(x),ax.Y(T(sim,x)),r,0,7);ctx.fill();};
  if(atLeast('ap')){dot(0,PAL['s5'],5);dot(D,PAL['s5'],5);}
  const G=sim.gutS;if(G&&G.g)dot(G.g.x,PAL['s4'],6);dot(xBest(sim),PAL['s3'],6);dot(sim.p.x,PAL['rj'],4.5);
  legend(ctx,box.L+10,box.T+12,[{label:'Best',color:PAL['s3']},{label:'Your gut',color:PAL['s4']},{label:'Now',color:PAL['rj']}]);},
 draw(sim,ctx,vdt,k){const fs=12*k,G=sim.gutS,sh=shown(sim),D=Dd(sim),W=Ww(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const gx=G&&G.g?G.g.x:sim.p.x,S=scaleOf(sim,gx),X0=40,Y0=Math.round(66+20*k),PX=x=>X0+x*S,PY=y=>Y0+y*S;sim._S=S;
  /* field, sidewalk, lot */
  ctx.fillStyle=sim.p.field==='snow'?PAL['cv-glass']:sim.p.field==='mud'?PAL['cv-ims']:PAL['cv-leaf2'];ctx.globalAlpha=sim.p.field==='grass'?.35:1;ctx.fillRect(0,Y0,800,W*S);ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.5;for(let x=0;x<=220;x+=10){ctx.beginPath();ctx.moveTo(PX(x),Y0);ctx.lineTo(PX(x),PY(W));ctx.stroke();}for(let y=10;y<W;y+=10){ctx.beginPath();ctx.moveTo(0,PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  ctx.fillStyle=PAL['card2'];ctx.fillRect(0,PY(W),800,450-PY(W));
  ctx.fillStyle=PAL['muted'];ctx.globalAlpha=.55;ctx.fillRect(0,Y0-12,800,12);ctx.globalAlpha=1;
  ctx.font='700 '+fs+'px '+BioLab.h.FONT;const yw=ctx.measureText('You').width;txt(ctx,'Sidewalk: 1.4 m/s',PX(0)+12+yw+14,Y0-18,{s:fs,c:PAL['cv-soft']});
  txt(ctx,FIELD[sim.p.field].l+': '+FIELD[sim.p.field].v+' m/s',8,PY(W)-8,{s:fs,w:700,c:PAL['cv-soft']});
  txt(ctx,'Parking lot',8,PY(W)+18*k,{s:fs,c:PAL['cv-soft']});
  /* door and car */
  ctx.fillStyle=PAL['cv-ink'];ctx.fillRect(PX(0)-6,Y0-30,12,18);txt(ctx,'You',PX(0)+12,Y0-18,{s:fs,w:700});
  const cx=PX(D),cy=PY(W);ctx.fillStyle='#3f6fb0';BioLab.h.rr(ctx,cx-14,cy+2,28,40,6);ctx.fill();ctx.fillStyle='#cfe0f5';ctx.fillRect(cx-10,cy+8,20,8);
  txt(ctx,'Car',cx+20,cy+26,{s:fs,w:700});
  /* dimension lines */
  if(atLeast('honors')){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,4]);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(cx,Y0);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);txt(ctx,W+' m',cx+6,(Y0+cy)/2,{s:fs,c:PAL['cv-soft']});
   txt(ctx,D+' m along',cx,Y0-18,{s:fs,c:PAL['cv-soft'],a:'center'});}
  const route=(x,col,w,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash?[8,6]:[]);ctx.beginPath();ctx.moveTo(PX(0),Y0-6);ctx.lineTo(PX(x),Y0-6);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=col;ctx.beginPath();ctx.arc(PX(x),Y0-6,5,0,7);ctx.fill();};
  if(sh){const xb=xBest(sim);route(xb,PAL['s3'],4,false);
   if(atLeast('honors')){/* the angle with the perpendicular at the best turn */const px=PX(xb),py=Y0-6,a=Math.atan2(cy-py,cx-px);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+60);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(px,py,30,Math.min(a,Math.PI/2),Math.max(a,Math.PI/2));ctx.stroke();
    const phi=Math.asin(clamp((D-xb)/diag(sim,xb),0,1))*180/Math.PI;txt(ctx,'φ = '+f1(phi)+'°',px+(xb<D?-6:6),py+50+8*k,{s:fs,w:700,c:PAL['s3'],a:xb<D?'right':'left'});}}
  route(gx,PAL['s4'],3,!!sh);
  if(sim.p.x!==gx&&G&&G.g)route(sim.p.x,PAL['rj'],2.5,false);
  /* pills */
  const ps=Math.min(13*k,20);ctx.font='700 '+ps+'px '+BioLab.h.FONT;const items=[[(G&&G.g?'Your gut: ':'Your route: ')+'turn at '+f0(gx)+' m'+(sh?', '+f1(T(sim,gx))+' s':''),PAL['s4']]];
  if(sh)items.push(['Best: turn at '+f0(xBest(sim))+' m, '+f1(tBest(sim))+' s',PAL['s3']]);
  let px=790,row=0;const y0=Math.round(8+ps);items.forEach(([s2,c])=>{const w=ctx.measureText(s2).width+ps*1.1;if(px-w<8){row++;px=790;}pill(ctx,s2,px-w/2,y0+row*ps*1.9,c,'#fff',ps);px-=w+8;});},
 onClick(sim,x,y){const S=sim._S||3.4;BioLab.setValues(sim,{x:clamp(Math.round((x-40)/S),0,200)});},
 narrate(sim){const x=sim.p.x,D=Dd(sim),xb=xBest(sim);
  if(!shown(sim))return `The sidewalk is ${V1/v2(sim)>1.6?'much ':''}faster, but the snow is shorter. <b>Pick where you would turn off the sidewalk</b> by dragging the slider or clicking along the sidewalk, then lock it in.`;
  const lost=T(sim,x)-tBest(sim);
  if(lost<0.3)return `<b>This is the fastest route: ${f1(T(sim,x))} s.</b> Turn a little earlier or later and you lose time, but only a little: the time curve is flat at its minimum.`;
  if(x<xb)return `You turn ${f0(xb-x)} m too early and spend too long in the ${sim.p.field==='snow'?'snow':'field'}: ${f1(T(sim,x))} s, <b>${f1(lost)} s slower</b> than the best route.`;
  return `You stay on the sidewalk ${f0(x-xb)} m too long${x>D?', even past the car,':''}: ${f1(T(sim,x))} s, <b>${f1(lost)} s slower</b> than the best route.`;},
 gut:{better:'lower',controls:['x'],
  ask:{bio:'Where would you leave the sidewalk and cut across to the car? Drag the slider here, or click along the sidewalk. The orange line shows your route. Then lock it in.',honors:'Before you see the math: drag the slider here to where you would turn off the sidewalk, then lock it in.'},
  lock(sim){const x=sim.p.x;return {v:T(sim,x)-tBest(sim),x,label:`turn at ${f0(x)} m: ${f1(T(sim,x))} s`};},
  solve(sim){const xb=xBest(sim);sim.st.peek=true;return {v:T(sim,xb)-tBest(sim),x:xb,label:`turn at ${f1(xb)} m: ${f1(tBest(sim))} s`};},
  how:{bio:'The math writes your total time as sidewalk time plus field time, for every possible turning spot, and finds the lowest one. At that spot, walking one more meter on the sidewalk costs exactly as much time as it saves in the field.',
   honors:'T(x) = x/1.4 + √((D − x)² + W²)/v. Set T′(x) = 0: 1/1.4 = (D − x) / (v·√((D − x)² + W²)), then solve for x.',
   ap:'T′(x) = 0 gives sin φ = v/1.4, where φ is the angle between your field path and the line straight across. Then D − x* = W·tan φ. If that puts x* below 0, compare the endpoints: the best route cuts across right away.'},
  compare(sim,g,m){const lost=g.v,tg=T(sim,g.x),tb=tBest(sim);
   if(lost<1)return `Your gut was right on: within ${f1(lost)} s of the fastest route (${f1(tb)} s, or ${mmss(tb)}). The time curve is flat near its minimum, so being a few meters off barely costs anything.`;
   return `Your route takes ${f1(tg)} s; the best takes ${f1(tb)} s. <b>You lose ${f1(lost)} s</b>${lost>=10?', about '+Math.round(lost/tb*100)+'% longer,':''} out in the ${sim.p.field==='snow'?'cold':'field'}. You turned ${f0(Math.abs(g.x-m.x))} m ${g.x<m.x?'too early: the slow field costs more than the sidewalk you skipped':'too late: you walked past the point where cutting across starts to pay'}.`;},
  again(sim){sim.st.peek=false;sim.p.x=20;const r=Math.random();sim.p.field=r<0.6?'snow':'mud';if(atLeast('honors')){sim.p.D=[60,80,100,120,140,160,180][Math.floor(Math.random()*7)];sim.p.W=[20,30,40,50,60][Math.floor(Math.random()*5)];if(Math.random()<0.25)sim.p.field='grass';}}
 },
 onTourExit(sim){sim.st.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'The snow is slow, so should you stay on the sidewalk until you are straight across from the car, then cut over?',choices:['Yes: spend as little time in the snow as possible','No: cutting across a bit earlier is faster','It makes no difference'],correct:1,explain:'Walking the sidewalk to the point straight across from the car, then 40 m of snow, takes 135.7 s. Turning at about 92 m takes 126.7 s, 9 s faster. Near that corner, a little diagonal adds almost no snow distance but cuts a lot of sidewalk.'},
  {lvl:'bio',instant:true,q:'What about cutting straight across from the door, the shortest path?',choices:['Fastest: it is the shortest distance','Slower than the best route by about half a minute','Exactly as fast as the best route'],correct:1,explain:'The straight line is 126.5 m, all of it in snow at 0.8 m/s: 158.1 s. The best route is longer, 140.9 m, but takes only 126.7 s. Shortest is not fastest when the speeds differ.'},
  {lvl:'honors',instant:true,q:'The field turns from snow (0.8 m/s) to mud (1.0 m/s). Should you leave the sidewalk earlier or later?',choices:['Earlier','Later','At the same spot'],correct:0,explain:'A faster field makes cutting across cost less, so you start sooner: at about 79 m instead of 92 m. The ratio of the speeds sets the angle you cut at.'},
  {lvl:'honors',instant:true,q:'At the best turning point, T′(x) = 0. What does that mean in words?',choices:['The total time is zero','One more meter of sidewalk saves exactly as much field time as it costs','You walk the same distance on both surfaces'],correct:1,explain:'T′(x) is the change in total time per extra meter of sidewalk. Before the best spot it is negative (walking farther helps), after it is positive (it hurts), and at the best spot the gain and the cost balance.'},
  {lvl:'ap',instant:true,q:'The car is only 60 m along and 40 m across, and the field is dry grass at 1.3 m/s. Where should you leave the sidewalk?',choices:['At 20 m','Right away, at 0 m','At 60 m, straight across from the car'],correct:1,explain:'D − x* = W·tan φ with sin φ = 1.3/1.4 gives 40 × 2.50 ≈ 100 m, so x* = 60 − 100 = −40 m: outside the closed interval [0, 60]. Check the endpoints: T(0) = 55.5 s and T(60) = 73.6 s. Cut across right away.'},
  {lvl:'ap',instant:true,q:'At the best route, sin φ = v_field / v_sidewalk, where φ is the angle between your field path and the line straight across. How does this connect to Snell’s law?',choices:['It is Snell’s law with the path in the faster medium running along the boundary (90°), the critical-angle case','It has nothing to do with light','It is Snell’s law, but only for mirrors'],correct:0,explain:'Light takes the fastest path, and that gives Snell’s law: sin θ₁ / v₁ = sin θ₂ / v₂. Your sidewalk path runs along the boundary, so θ₁ = 90° and sin θ₂ = v₂/v₁: the formula for the critical angle.'}
 ],
 tour:[
  {title:'The problem',text:'You come out of the school door at the top left. The sidewalk runs along the top of a snowy field. Your car is in the lot, 120 m along and 40 m across. You walk 1.4 m/s on the sidewalk but only 0.8 m/s in ankle-deep snow.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{field:'snow',D:120,W:40,x:0});}},
  {title:'Shortest is not fastest',text:'Cutting straight across from the door is the shortest route, 126.5 m. But all of it is snow: 158.1 s.',pause:true,setup:sim=>BioLab.setValues(sim,{x:0})},
  {title:'Avoiding the snow is not fastest either',text:'Walk the sidewalk until you are straight across from the car, then 40 m of snow: 85.7 s + 50.0 s = 135.7 s. Better, but you can do better still.',pause:true,setup:sim=>BioLab.setValues(sim,{x:120})},
  {title:'Somewhere in between',text:'Turn at 92 m and the walk takes 126.7 s, the fastest of all. The graph below the stage shows total time for every turning point. Its lowest point is this route.',pause:true,setup:sim=>BioLab.setValues(sim,{x:92})},
  {title:'Why there?',text:'Before this spot, one more meter of sidewalk saves more snow time than it costs. After it, the opposite. Here they balance: the curve of total time is flat at its bottom.',pause:true},
  {lvl:'honors',title:'The derivative',text:'T(x) = x/1.4 + √((120 − x)² + 40²)/0.8. Setting T′(x) = 0 gives (120 − x)/√((120 − x)² + 1600) = 0.8/1.4, so 120 − x ≈ 27.9 and x ≈ 92.1 m.',pause:true},
  {lvl:'ap',title:'Snell’s law',text:'The left side of that equation is sin φ, where φ is your angle from straight across. So sin φ = 0.8/1.4 ≈ 0.571 and φ ≈ 34.8°. Light obeys the same rule, sin θ₁/v₁ = sin θ₂/v₂, because it also takes the fastest path. Your sidewalk is the case θ₁ = 90°.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the turning spot matter?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Turn at 0, 30, 60, 80, 90, 100 and 120 m. Record a trial each time.</li><li>Graph <b>Trials</b> with the turning spot on x and the walk time on y.</li></ol><p>Write one sentence: near the best spot, why does a few meters barely matter?</p>',
  honors:'<p><b>Question:</b> How does the car’s distance across the field change the best spot?</p><ol><li>Keep the car 120 m along. For W = 20, 30, 40, 50 and 60 m, press <b>Leave at the best spot</b> and record.</li><li>Compute D − x* for each and divide by W.</li></ol><p>Explain why that ratio stays the same.</p>',
  ap:'<p><b>Question:</b> When is the best route at an endpoint?</p><ol><li>Choose dry grass. Lower D from 200 m to 40 m and record x*, T(0) and T(D).</li><li>Find the D where x* first hits 0.</li></ol><p><b>CER:</b> Use the closed interval method and W·tan φ to explain the switch.</p>'},
 terms:[
  {t:'Optimization',d:'Finding the input that gives the best output: here, the turning spot with the least total time.'},
  {t:'Critical point',d:'Where T′(x) = 0 or does not exist. Minimums and maximums inside an interval happen there.',lvl:'honors'},
  {t:'Second derivative test',d:'If T′(c) = 0 and T″(c) > 0, the curve is concave up there and c is a local minimum.',lvl:'honors'},
  {t:'Closed interval method',d:'On [a, b], the minimum is the smallest of T at the critical points and at the endpoints a and b.',lvl:'ap'},
  {t:'Snell’s law',d:'For light crossing a boundary, sin θ₁ / v₁ = sin θ₂ / v₂, with angles measured from the line perpendicular to the boundary. It follows from light taking the fastest path (Fermat’s principle).',lvl:'ap'}
 ],
 about:'<p>T(x) = x/1.4 + √((D − x)² + W²)/v for a turning point x meters along the sidewalk, with the car D m along and W m across. Walking 1.4 m/s on pavement is a typical adult pace. <b>The field speeds are assumptions for illustration:</b> ankle-deep snow 0.8 m/s, muddy grass 1.0 m/s, dry grass 1.3 m/s. Real speeds depend on depth, footwear and slope.</p><p>The model assumes you walk at a steady speed on each surface and that the field is open, with no fences or ice. T″(x) = W²/(v·((D − x)² + W²)<sup>3/2</sup>) > 0 everywhere, so the critical point is always a minimum; when it falls before x = 0, the best route cuts across right away.</p>'
};
SIM._m={T,xBest,xCrit,tBest,diag,V1,FIELD};
BioLab.register(SIM);
})();
