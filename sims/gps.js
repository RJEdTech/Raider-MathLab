(function(){
'use strict';
const {clamp,rng,txt,pill,PAL,atLeast,fmtNum}=BioLab.h;
const S=80,PX=x=>x*S,PY=y=>450-y*S;          /* 80 px per km; map is 10 km × 5.625 km */
const C=0.299792458;                          /* km per microsecond */
const NAMES=['A','B','C','D'];
const RING=['s2','s5','s6','cv-soft'];
/* Maps: map 1 is fixed; the rest come from a seeded generator so a map number always gives the same towers and phone. */
const MAPS={};
function mapOf(m){if(MAPS[m])return MAPS[m];let M;
 if(m===1)M={T:[[1.0,1.0],[8.6,4.9],[7.2,0.7],[2.8,5.1]],P:[3.6,3.4]};
 else{const r=rng(m*7919+13),u=(a,b)=>a+(b-a)*r(),q=v=>Math.round(v*10)/10;
  M={T:[[q(u(0.6,2.6)),q(u(3.2,5.1))],[q(u(7.4,9.4)),q(u(3.0,5.1))],[q(u(3.0,7.0)),q(u(0.4,1.2))],[q(u(4.0,6.0)),q(u(4.7,5.3))]],P:[q(u(2.5,7.5)),q(u(1.5,4.2))]};}
 return MAPS[m]=M;}
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const M=sim=>mapOf(sim.p.map);
const clk=sim=>atLeast('ap')?sim.p.clk:0;
/* Measured distance = signal travel time × speed of light. A phone clock that runs ahead by b µs adds C·b km to every one. */
const rho=(sim,i)=>dist(M(sim).T[i],M(sim).P)+C*clk(sim);
/* Three circles: subtract circle A's equation from B's and C's to get two linear equations, then solve. */
function fix3(T,r){const [a,b,c]=T,[ra,rb,rc]=r;
 const a1=2*(b[0]-a[0]),b1=2*(b[1]-a[1]),c1=ra*ra-rb*rb+b[0]*b[0]-a[0]*a[0]+b[1]*b[1]-a[1]*a[1];
 const a2=2*(c[0]-a[0]),b2=2*(c[1]-a[1]),c2=ra*ra-rc*rc+c[0]*c[0]-a[0]*a[0]+c[1]*c[1]-a[1]*a[1];
 const det=a1*b2-a2*b1;return [(c1*b2-c2*b1)/det,(a1*c2-a2*c1)/det];}
/* Four towers and an unknown clock offset β (as a distance): three linear equations in x, y, β. */
function fix4(T,r){const rows=[];for(let i=1;i<4;i++){const [xi,yi]=T[i],[xa,ya]=T[0];rows.push([2*(xi-xa),2*(yi-ya),-2*(r[i]-r[0]),(xi*xi+yi*yi-xa*xa-ya*ya)-(r[i]*r[i]-r[0]*r[0])]);}
 const d3=(m)=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
 const A=rows.map(r=>r.slice(0,3)),bb=rows.map(r=>r[3]),D=d3(A);
 const sub=j=>A.map((r,i)=>r.map((v,k)=>k===j?bb[i]:v));return [d3(sub(0))/D,d3(sub(1))/D,d3(sub(2))/D];}
function mathFix(sim){const m=M(sim),r=[0,1,2,3].map(i=>rho(sim,i));if(clk(sim)>0){const f=fix4(m.T,r);return [f[0],f[1]];}return fix3(m.T.slice(0,3),r.slice(0,3));}
const naive=sim=>{const m=M(sim),r=[0,1,2].map(i=>rho(sim,i));return dist(fix3(m.T.slice(0,3),r),m.P)*1000;};
/* Where circles A and B cross (two points). */
function crossAB(sim){const m=M(sim),[a,b]=m.T,ra=rho(sim,0),rb=rho(sim,1),d=dist(a,b);if(d>ra+rb||d<Math.abs(ra-rb))return [];
 const l=(ra*ra-rb*rb+d*d)/(2*d),h=Math.sqrt(Math.max(0,ra*ra-l*l)),ux=(b[0]-a[0])/d,uy=(b[1]-a[1])/d,mx=a[0]+l*ux,my=a[1]+l*uy;return [[mx-h*uy,my+h*ux],[mx+h*uy,my-h*ux]];}
const gerr=(sim,x,y)=>dist([x,y],M(sim).P)*1000;
const f2=v=>fmtNum(v,2),f1=v=>fmtNum(v,1);
const mStr=v=>v<1?'0 m':(v>=1000?f2(v/1000)+' km':Math.round(v)+' m');
const clearGut=sim=>{sim.st.fixed=false;if(sim.gutS&&sim.gutS.g){sim.gutS.g=null;sim.gutS.m=null;BioLab.gutRender(sim);}};
const nRings=sim=>sim.st.rings!==undefined?sim.st.rings:(clk(sim)>0?4:3);

const SIM={
 id:'gps',hash:'gps',apUnit:10,order:1,tab:'Find the phone (GPS)',kind:'Simulation',
 card:'Drop a pin where you think the phone is, then let three circle equations find it exactly.',
 title:'Three circles find your phone',
 lede:{bio:'Your phone hears timing signals from towers at known spots. Each travel time gives a distance, and a distance from a known point puts you somewhere on a circle. Three circles meet at only one point.',
  honors:'Each tower gives a circle: (x − h)² + (y − k)² = r². Subtracting one circle’s equation from another cancels the x² and y² terms and leaves a straight line. Two such lines cross at the phone.',
  ap:'Real receivers do not have perfect clocks. A clock that is off by b microseconds stretches every distance by about 300b meters, so the circles no longer meet. A fourth signal adds the equation needed to solve for b too.'},
 scale:'A map seen from above, 10 km wide. Grid squares are 1 km. Radio covers about 300 m every microsecond.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your search',
 controls:[
  {id:'gx',label:'Your pin: km east',type:'range',min:0,max:10,step:0.01,def:5,unit:' km',help:'Or just click the map.'},
  {id:'gy',label:'Your pin: km north',type:'range',min:0,max:5.6,step:0.01,def:2.8,unit:' km'},
  {id:'map',label:'Map number',type:'range',min:1,max:12,step:1,def:1,noGut:true,help:'Each map has its own towers and a different hidden phone.',onChange:sim=>clearGut(sim)},
  {id:'two',label:'Use only towers A and B',type:'toggle',def:false,lvl:'honors',help:'See why two circles are not enough.'},
  {id:'clk',label:'Phone clock error',type:'range',min:0,max:1,step:0.05,def:0,unit:' µs',lvl:'ap',noGut:true,help:'How far the phone’s clock is off. It adds the same extra time to every signal. A fourth tower, D, appears so the math can solve for it.',onChange:sim=>clearGut(sim)}
 ],
 actions:[{id:'fix',label:'Find it with the circles',run(sim){const f=mathFix(sim);sim.st.fixed=true;BioLab.setValues(sim,{gx:+clamp(f[0],0,10).toFixed(2),gy:+clamp(f[1],0,5.6).toFixed(2),two:false});}}],
 init(){return {fixed:false};},step(){},
 metrics:[
  {id:'dA',label:'Distance to tower A',unit:'km',d:2,min:0,max:null,get:sim=>rho(sim,0)},
  {id:'dB',label:'Distance to tower B',unit:'km',d:2,min:0,max:null,get:sim=>rho(sim,1)},
  {id:'dC',label:'Distance to tower C',unit:'km',d:2,min:0,max:null,get:sim=>rho(sim,2)},
  {id:'tA',label:'Signal time from A',unit:'µs',d:1,lvl:'honors',min:0,max:null,get:sim=>rho(sim,0)/C},
  {id:'miss',label:'Your pin misses the rings by',unit:'m',d:0,lvl:'honors',min:0,max:null,get:sim=>{const n=3;let s=0;for(let i=0;i<n;i++){const e=dist([sim.p.gx,sim.p.gy],M(sim).T[i])-rho(sim,i);s+=e*e;}return 1000*Math.sqrt(s/n);}},
  {id:'fx',label:'Math fix: km east',unit:'km',d:2,lvl:'honors',min:0,max:null,get:sim=>sim.st.fixed?mathFix(sim)[0]:NaN},
  {id:'fy',label:'Math fix: km north',unit:'km',d:2,lvl:'honors',min:0,max:null,get:sim=>sim.st.fixed?mathFix(sim)[1]:NaN},
  {id:'bias',label:'Clock error as distance',unit:'m',d:1,lvl:'ap',min:0,max:null,get:sim=>1000*C*clk(sim)},
  {id:'naive',label:'Three-circle fix is off by',unit:'m',d:0,lvl:'ap',min:0,max:null,get:naive}
 ],
 draw(sim,ctx,vdt,k){const m=M(sim),G=sim.gutS||{},two=atLeast('honors')&&sim.p.two,nr=two?2:nRings(sim),shown=sim.st.fixed||!!G.m;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* a 1 km grid, like city blocks */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;for(let x=1;x<10;x++){ctx.beginPath();ctx.moveTo(PX(x),0);ctx.lineTo(PX(x),450);ctx.stroke();}for(let y=1;y<6;y++){ctx.beginPath();ctx.moveTo(0,PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(PX(0.25),PY(0.25));ctx.lineTo(PX(1.25),PY(0.25));ctx.stroke();txt(ctx,'1 km',PX(0.75),PY(0.25)-8,{s:12*k,w:700,a:'center'});
  /* rings */
  for(let i=0;i<nr;i++){const t=m.T[i],r=rho(sim,i);ctx.strokeStyle=PAL[RING[i]];ctx.lineWidth=i===3?2:2.5;if(i===3)ctx.setLineDash([8,6]);ctx.beginPath();ctx.arc(PX(t[0]),PY(t[1]),r*S,0,7);ctx.stroke();ctx.setLineDash([]);}
  if(two){crossAB(sim).forEach(p=>{if(p[0]<0||p[0]>10||p[1]<0||p[1]>5.625)return;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(PX(p[0]),PY(p[1]),11,0,7);ctx.stroke();txt(ctx,'?',PX(p[0]),PY(p[1])+5,{s:15,w:800,a:'center'});});}
  /* towers */
  const nt=two?2:(clk(sim)>0?4:3);for(let i=0;i<nt;i++){const t=m.T[i],x=PX(t[0]),y=PY(t[1]);
   ctx.fillStyle=PAL[RING[i]];ctx.beginPath();ctx.moveTo(x,y-14);ctx.lineTo(x-9,y+8);ctx.lineTo(x+9,y+8);ctx.closePath();ctx.fill();
   const lab=NAMES[i]+': '+f2(rho(sim,i))+' km',right=t[0]<5;txt(ctx,lab,x+(right?14:-14),y+(t[1]>4.6?20:-12),{s:12*k,w:700,c:PAL[RING[i]],a:right?'left':'right'});}
  /* gut pin, current pin, phone */
  const pin=(x,y,col,lab,dy)=>{const X=PX(x),Y=PY(y);ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X-9,Y);ctx.lineTo(X+9,Y);ctx.moveTo(X,Y-9);ctx.lineTo(X,Y+9);ctx.stroke();ctx.beginPath();ctx.arc(X,Y,6,0,7);ctx.stroke();if(lab)txt(ctx,lab,X+(x>8?-12:12),Y+dy,{s:12*k,w:700,c:col,a:x>8?'right':'left'});};
  if(shown){const p=m.P,X=PX(p[0]),Y=PY(p[1]);
   if(G.g){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(PX(G.g.x),PY(G.g.y));ctx.lineTo(X,Y);ctx.stroke();ctx.setLineDash([]);}
   ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.roundRect?ctx.roundRect(X-7,Y-12,14,24,3):ctx.rect(X-7,Y-12,14,24);ctx.fill();ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(X-4,Y-8,8,14);
   txt(ctx,'Phone',X+(p[0]>8?-14:14),Y-14,{s:12*k,w:700,c:PAL['s3'],a:p[0]>8?'right':'left'});}
  if(G.g&&(Math.abs(G.g.x-sim.p.gx)>0.03||Math.abs(G.g.y-sim.p.gy)>0.03))pin(G.g.x,G.g.y,PAL['s4'],'Your gut',18);
  const nearPhone=shown&&dist([sim.p.gx,sim.p.gy],m.P)<0.05;pin(sim.p.gx,sim.p.gy,PAL['rj'],nearPhone?'':'Your pin',-12);
  if(shown&&G.g){const e=gerr(sim,G.g.x,G.g.y);pill(ctx,'Your gut was '+mStr(e)+' off',800-12-130*Math.min(k,1.8),428,PAL['s4'],'#000',12*k);}},
 onClick(sim,x,y){BioLab.setValues(sim,{gx:+clamp(x/S,0,10).toFixed(2),gy:+clamp((450-y)/S,0,5.6).toFixed(2)});},
 narrate(sim){const m=M(sim),n=atLeast('honors')&&sim.p.two?2:Math.min(3,nRings(sim)),pinD=[0,1,2].map(i=>dist([sim.p.gx,sim.p.gy],m.T[i]));
  if(atLeast('honors')&&sim.p.two)return `With only towers A and B, the two circles cross at <b>two points</b>, marked ?. The phone could be at either one. A third circle decides.`;
  if(clk(sim)>0)return `The phone’s clock is off by ${f2(sim.p.clk)} µs, so every distance is ${Math.round(1000*C*clk(sim))} m too long and <b>the circles no longer meet at one point</b>. Tower D’s fourth equation lets the math solve for the clock error too.`;
  const off=[0,1,2].map(i=>Math.abs(pinD[i]-rho(sim,i))*1000),worst=Math.max(...off),wi=off.indexOf(worst);
  if(worst<30)return `Your pin is on all ${n} rings, within ${Math.round(worst)} m. <b>Only one point lies on all three circles</b>, so that is where the phone is.`;
  return `Your pin is ${Math.round(pinD[wi]*1000)} m from tower ${NAMES[wi]}, but the signal says the phone is ${Math.round(rho(sim,wi)*1000)} m away. <b>The phone must be on every ring at once.</b>`;},
 gut:{better:'lower',controls:['gx','gy'],
  ask:{bio:'Each colored ring shows how far the phone is from one tower, so the phone sits on all three rings at once. Click the map where you think the three rings cross. Use the two sliders here to nudge your pin, then lock it in.',
   honors:'Before you use any equations: click the map where you think the three circles meet, or set your pin with the sliders here. Then lock it in.'},
  lockLabel:'Lock in my pin',
  lock(sim){const e=gerr(sim,sim.p.gx,sim.p.gy);return {v:e,x:sim.p.gx,y:sim.p.gy,label:`(${f2(sim.p.gx)}, ${f2(sim.p.gy)}) km`};},
  solve(sim){const f=mathFix(sim);sim.p.gx=f[0];sim.p.gy=f[1];sim.p.two=false;sim.st.fixed=true;const e=gerr(sim,f[0],f[1]);return {v:e,label:`(${f2(f[0])}, ${f2(f[1])}) km, ${mStr(e)} from the phone`};},
  how:{bio:'Each tower’s circle has an equation, (x − h)² + (y − k)² = r², using the tower’s position (h, k) and the distance r. The phone’s coordinates make all three equations true at once, and the math solves for that one point exactly.',
   honors:'Subtract circle A’s equation from circle B’s: the x² and y² terms cancel, leaving a line. Do the same with A and C. The two lines cross at the one point on all three circles.',
   ap:'With a clock offset β (as a distance), each equation becomes (x − h)² + (y − k)² = (r − β)². Subtracting A’s from the others still gives linear equations, now in x, y and β, so four towers give three equations for three unknowns. GPS does this in 3D with x, y, z and the clock, which is why it needs four satellites.'},
  compare(sim,g,m){const e=g.v;
   if(e<25)return `Your gut was right on: ${Math.round(e)} m from the phone. Your eye found the one point on all three rings, which is exactly what the equations do. The math just does it to the meter, every time, even when the rings are hard to read.`;
   const extra=clk(sim)>0?` A plain three-circle fix would have been ${mStr(naive(sim))} off because of the clock error; the fourth tower removes it.`:'';
   return `The math puts the pin <b>${mStr(m.v)} from the phone</b>. Your gut was <b>${mStr(e)} off</b>. A friend meeting you at your pin would end up <b>${mStr(e)} away</b>, about ${(n=>(/^8/.test(String(n))||n===11||n===18?'an ':'a ')+n)(Math.max(1,Math.round(e/1000*12)))}-minute walk from where you really are.${extra}`;},
  again(sim){let m=sim.p.map;while(m===sim.p.map)m=1+Math.floor(Math.random()*12);sim.p.map=m;sim.p.gx=5;sim.p.gy=2.8;sim.p.two=false;sim.st.fixed=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You know your distance to just two towers. How many places could you be?',choices:['Exactly one','Usually two','Anywhere on a line'],correct:1,explain:'Each distance puts you on a circle around a tower. Two circles usually cross at two points, so you could be at either one. A third circle tells them apart. Turn on “Use only towers A and B” at Closer look to see the two choices.'},
  {lvl:'bio',instant:true,q:'A tower’s signal takes 10 microseconds to reach your phone. Radio covers about 300 m per microsecond. How far is the tower?',choices:['About 300 m','About 3 km','About 30 km'],correct:1,explain:'Distance = time × speed = 10 µs × 0.3 km/µs ≈ 3.0 km. Radio is so fast that timing has to be precise to a tiny fraction of a microsecond.'},
  {lvl:'honors',instant:true,q:'You subtract one circle’s equation from another’s. What kind of equation is left?',choices:['Another circle','A straight line','A parabola'],correct:1,explain:'Both equations contain x² + y², so those terms cancel. What is left has only x and y to the first power: a line. It passes through both points where the circles cross.'},
  {lvl:'honors',instant:true,q:'Your pin sits exactly on rings A and B, but 900 m from ring C. What went wrong?',choices:['Tower C’s distance must be wrong','You picked the wrong one of the two points where A and B cross','Nothing: two rings out of three is close enough'],correct:1,explain:'Rings A and B cross at two points. Only one of them is also on ring C, and that is the phone. The third ring exists to make this choice.'},
  {lvl:'ap',instant:true,q:'Your phone’s clock is off by 1 microsecond. About how much does that change every distance?',choices:['About 3 m','About 30 m','About 300 m','About 3 km'],correct:2,explain:'Light travels 299,792,458 m/s, so in 1 µs it goes about 300 m. That is why GPS satellites carry atomic clocks, and why receivers solve for their own clock error instead of trusting it.'},
  {lvl:'ap',instant:true,q:'Why does GPS need signals from at least four satellites?',choices:['Three for x, y and z, plus one to solve for the receiver’s clock error','One for each direction, plus a spare','Satellites move, so one is always lost'],correct:0,explain:'The receiver has four unknowns: x, y, z and its clock offset. Each satellite gives one equation, so it needs four. On this flat map there are three unknowns (x, y and the clock), so three towers are the bare minimum. The tool uses a fourth so that subtracting equations leaves three straight-line equations it can solve directly.'}
 ],
 tour:[
  {title:'Three towers',text:'Three towers sit at known spots on the map. Each one sends a timing signal. The phone measures how long each signal took to arrive.',pause:true,setup:sim=>{BioLab.setValues(sim,{map:1,gx:5,gy:2.8,two:false,clk:0});sim.st.rings=0;sim.st.fixed=false;}},
  {title:'Time becomes distance',text:'Radio travels at the speed of light, about 0.3 km per microsecond. Tower A’s signal took 11.8 µs, so A is 3.54 km away. The phone could be anywhere on a circle of that radius around A.',pause:true,setup:sim=>{sim.st.rings=1;}},
  {title:'Two circles, two spots',text:'Tower B is 5.22 km away, so the phone is also on B’s circle. Two circles cross at two points. The phone is at one of them, but which?',pause:true,setup:sim=>{sim.st.rings=2;}},
  {title:'The third circle decides',text:'Tower C is 4.50 km away. Only one of the two crossing points is also on C’s circle. Find it by eye: that is your gut answer.',pause:true,setup:sim=>{sim.st.rings=3;}},
  {title:'The equations find it exactly',text:'Each circle is (x − h)² + (y − k)² = r². Subtracting the equations in pairs leaves two lines, and they cross at (3.60, 3.40) km: the phone.',pause:true,setup:sim=>{sim.st.rings=3;SIM.actions[0].run(sim);}},
  {lvl:'ap',title:'A clock that is off',text:'Now the phone’s clock is off by 0.5 µs, which stretches every distance by about 150 m. The three circles no longer meet, and a plain three-circle fix misses by about 30 m. Tower D gives a fourth equation, enough to solve for the clock error too.',pause:true,setup:sim=>{sim.st.rings=undefined;BioLab.setValues(sim,{clk:0.5});SIM.actions[0].run(sim);}}
 ],
 onTourExit(sim){sim.st.rings=undefined;},
 lab:{bio:'<p><b>Question:</b> How close can you get by eye?</p><ol><li>On map 1, place your pin where the three rings meet. Record a trial.</li><li>Press <b>Find it with the circles</b> and record again.</li><li>Repeat on maps 2 and 3.</li></ol><p>Write one sentence: where was your eye least accurate, and why?</p>',
  honors:'<p><b>Question:</b> Can you find the phone with algebra alone?</p><ol><li>On map 1, write the three circle equations using the tower positions and distances.</li><li>Subtract A’s equation from B’s and from C’s. Solve the two lines.</li><li>Check with <b>Find it with the circles</b>.</li></ol>',
  ap:'<p><b>Question:</b> How does clock error affect a fix?</p><ol><li>Set the clock error to 0, 0.25, 0.5, 0.75 and 1 µs. Record <b>Three-circle fix is off by</b> each time.</li><li>Graph Trials with clock error on x.</li></ol><p><b>CER:</b> Is the error proportional to the clock error? Use the linear equations to explain.</p>'},
 terms:[
  {t:'Trilateration',d:'Finding a position from distances to known points. Each distance gives a circle (or a sphere in 3D), and the position is where they meet.'},
  {t:'Equation of a circle',d:'(x − h)² + (y − k)² = r², for a circle with center (h, k) and radius r.'},
  {t:'Radical axis',d:'The line you get by subtracting two circles’ equations. When the circles cross, it passes through both crossing points.',lvl:'honors'},
  {t:'Clock bias',d:'How far a receiver’s clock is off. Multiplied by the speed of light, it adds the same distance to every measurement.',lvl:'ap'}
 ],
 about:'<p>Distances come from travel time × the speed of light, 299,792,458 m/s (about 0.3 km per microsecond). The math subtracts circle A’s equation from B’s and C’s to get two linear equations and solves them. With clock error on, it uses four towers and solves for x, y and the clock offset together.</p><p>This is a flat, 2D model. Real GPS uses satellites about 20,000 km up and solves in 3D, and real signals also bend and slow slightly in the atmosphere and bounce off buildings. The maps and the phone positions are made up for practice; map numbers 2 to 12 are generated from a fixed pattern so the same number always gives the same map.</p>'
};
BioLab.register(SIM);
})();
