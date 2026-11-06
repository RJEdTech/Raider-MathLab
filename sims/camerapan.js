(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* The runner: v(t) = vmax(1 − e^(−t/τ)), x(t) = vmax(t − τ(1 − e^(−t/τ))) meters from the start, t in seconds after the gun.
   You stand d meters from the lane, level with the s-meter mark. u = x − s. Camera angle θ = arctan(u/d) from straight across.
   Chain rule: dθ/dt = d·v / (d² + u²) radians per second. */
const VMAX=9.0,TAU=1.2,FOV=38,DEG=180/Math.PI;
const xAt=t=>t<=0?0:VMAX*(t-TAU*(1-Math.exp(-t/TAU)));
const vAt=t=>t<=0?0:VMAX*(1-Math.exp(-t/TAU));
function tAt(x){let lo=0,hi=30;for(let i=0;i<70;i++){const m=(lo+hi)/2;xAt(m)<x?lo=m:hi=m;}return (lo+hi)/2;}
const TFIN=tAt(100);
const d=sim=>sim.p.dist,spot=sim=>sim.p.spot;
const ang=(sim,t)=>Math.atan((xAt(t)-spot(sim))/d(sim))*DEG;
const rate=(sim,t)=>{const u=xAt(t)-spot(sim);return d(sim)*vAt(t)/(d(sim)*d(sim)+u*u)*DEG;};
const tPass=sim=>tAt(spot(sim));
const passRate=sim=>rate(sim,tPass(sim));
function peak(sim){let bt=0,bv=0;for(let t=0;t<=TFIN;t+=0.005){const r=rate(sim,t);if(r>bv){bv=r;bt=t;}}return {t:bt,v:bv};}
/* How fast the spot your camera points at slides along the track as she passes: d·ω (ω in rad/s). Her speed minus that is the drift. */
const drift=(sim,w)=>vAt(tPass(sim))-d(sim)*w/DEG;
const halfFrame=sim=>d(sim)*Math.tan(FOV/2/DEG);
const shown=sim=>!!(sim.st.peek||(sim.gutS&&sim.gutS.g));
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)&&!(sim.guide&&sim.guide.keep)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'camerapan',hash:'camerapan',apUnit:16,order:3,tab:'Filming the 100 m',kind:'Simulation',prereq:['runpace'],next:['shortcut'],
 card:'Guess how fast to turn your phone to keep a sprinter in frame as she passes you, then let related rates give the exact pan speed.',
 title:'How fast do I turn the camera?',
 lede:{bio:'Film a sprinter from the side of the track and you have to turn your camera to follow her. When she is far away you barely move. As she passes right in front of you, you have to swing fast.',
  honors:'The camera angle depends on her position, and her position depends on time. The chain rule links the two rates: how fast the angle changes equals how fast it changes per meter times how many meters she covers per second.',
  ap:'With θ = arctan(u/d), where u is how far she is past your spot, dθ/dt = [d / (d² + u²)] · du/dt. As she passes, u = 0 and the pan rate is v/d radians per second.'},
 scale:'Seen from above. The lane is 100 m long; one grid square is 10 m. You stand to the side of the lane, level with one of the distance marks.',
 aspect:16/9,timeless:true,animated:true,trials:true,graph:true,
 controlsTitle:'Your shot',
 controls:[
  {id:'guess',label:'Your gut: how fast to turn as she passes you',type:'range',min:0,max:80,step:0.5,def:8,unit:'°/s',help:'Degrees per second. For a feel: a quarter turn (90°) in one second is very fast; turning 10° in one second is slow.'},
  {id:'race',label:'Race clock',type:'range',min:0,max:13,step:0.1,def:5,unit:' s',noGut:true,help:'Seconds after the start. Drag it, or press Run the race.'},
  {id:'dist',label:'How far you stand from the lane',type:'range',min:5,max:40,step:1,def:20,unit:' m',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'spot',label:'You stand level with this mark',type:'range',min:10,max:90,step:5,def:50,unit:' m',lvl:'ap',noGut:true,onChange:clearGut}
 ],
 actions:[
  {id:'run',label:'Run the race',primary:true,run(sim){sim.st.play=true;BioLab.setValues(sim,{race:0});}},
  {id:'peek',label:'Skip the guess and show the math',run(sim){sim.st.peek=true;}}
 ],
 init(){return {play:false};},
 step(sim,dt){if(!sim.st.play)return;let t=sim.p.race+dt;if(t>=13){t=13;sim.st.play=false;}sim.p.race=Math.round(t*100)/100;if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.race)sim.ui.ctl.race.set(+sim.p.race.toFixed(1));},
 metrics:[
  {id:'pos',label:'Runner’s position',unit:'m',d:1,min:0,max:100,get:sim=>Math.min(100,xAt(sim.p.race))},
  {id:'vel',label:'Runner’s speed',unit:'m/s',d:2,min:0,max:10,get:sim=>vAt(sim.p.race)},
  {id:'ang',label:'Camera angle from straight across',unit:'°',d:1,min:-90,max:90,get:sim=>ang(sim,sim.p.race)},
  {id:'pan',label:'Pan rate right now',unit:'°/s',d:1,min:0,max:null,get:sim=>shown(sim)?rate(sim,sim.p.race):null},
  {id:'pass',label:'Pan rate as she passes you',unit:'°/s',d:1,min:0,max:null,get:sim=>shown(sim)?passRate(sim):null},
  {id:'vpass',label:'Her speed as she passes you',unit:'m/s',d:2,lvl:'honors',min:0,max:10,get:sim=>shown(sim)?vAt(tPass(sim)):null},
  {id:'peak',label:'Fastest pan in the race',unit:'°/s',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?peak(sim).v:null},
  {id:'peakt',label:'Fastest pan happens at',unit:'s',d:2,lvl:'ap',min:0,max:13,get:sim=>shown(sim)?peak(sim).t:null}
 ],
 graphs:[{id:'panr',label:'Pan rate through the race',custom:true}],defaultGraph:'panr',
 plot(sim,ctx,box){const pk=peak(sim),G=sim.gutS,gv=G&&G.g?G.g.w:null,top=Math.max(10,Math.ceil(Math.max(pk.v,gv||0,sim.p.guess)*1.15/10)*10);
  const ax=axes(ctx,box,{xmin:0,xmax:13,ymin:0,ymax:top,xl:'Seconds after the start',yl:'Pan rate (°/s)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=0;t<=13;t+=0.02){const x=ax.X(t),y=ax.Y(rate(sim,Math.min(t,TFIN)));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  if(gv!==null){ctx.strokeStyle=PAL['s4'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(gv));ctx.lineTo(ax.X(13),ax.Y(gv));ctx.stroke();ctx.setLineDash([]);}
  const tp=tPass(sim);ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(ax.X(tp),ax.Y(passRate(sim)),6,0,7);ctx.fill();
  const tr=Math.min(sim.p.race,TFIN);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(tr),ax.Y(rate(sim,tr)),5,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+12,[{label:'Pan rate',color:PAL['g-line']},{label:'Your gut',color:PAL['s4'],dash:true}]);},
 draw(sim,ctx,vdt,k){const fs=12*k,G=sim.gutS,sh=shown(sim),t=sim.p.race,dd=d(sim),s=spot(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const S=7,X0=50,TY=Math.round(70+30*k),PX=x=>X0+x*S,PY=y=>TY+y*S;
  /* infield grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.4;for(let x=0;x<=100;x+=10){ctx.beginPath();ctx.moveTo(PX(x),TY-30);ctx.lineTo(PX(x),450);ctx.stroke();}for(let y=0;y<=48;y+=10){ctx.beginPath();ctx.moveTo(0,PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  /* lane */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(PX(0),TY-9,100*S,18);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(0),TY-9);ctx.lineTo(PX(100),TY-9);ctx.moveTo(PX(0),TY+9);ctx.lineTo(PX(100),TY+9);ctx.stroke();
  ctx.lineWidth=3;[0,100].forEach(x=>{ctx.beginPath();ctx.moveTo(PX(x),TY-14);ctx.lineTo(PX(x),TY+14);ctx.stroke();});
  for(let x=0;x<=100;x+=(k>1.3?20:10))txt(ctx,x===0?'Start':x===100?'Finish':x+' m',PX(x),TY-18,{s:fs,c:PAL['cv-soft'],a:'center'});
  const cx=PX(s),cy=PY(dd);
  /* distance d */
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,TY+9);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,dd+' m',cx+6,(TY+cy)/2+4,{s:fs,c:PAL['cv-soft']});
  /* camera view wedge, aimed at the runner */
  const x=Math.min(100,xAt(t)),rx=PX(x),a0=Math.atan2(TY-cy,rx-cx),h=FOV/2/DEG,L=Math.hypot(rx-cx,TY-cy)+30;
  ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.16;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+L*Math.cos(a0-h),cy+L*Math.sin(a0-h));ctx.lineTo(cx+L*Math.cos(a0+h),cy+L*Math.sin(a0+h));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(rx,TY);ctx.stroke();
  /* runner */
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(rx,TY,8,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
  /* camera */
  ctx.save();ctx.translate(cx,cy);ctx.rotate(a0+Math.PI/2);ctx.fillStyle=PAL['cv-ink'];ctx.fillRect(-11,-7,22,14);ctx.beginPath();ctx.moveTo(-5,-7);ctx.lineTo(5,-7);ctx.lineTo(7,-13);ctx.lineTo(-7,-13);ctx.closePath();ctx.fill();ctx.restore();
  txt(ctx,'You',cx,cy+22+6*k,{s:fs,w:700,a:'center'});
  /* angle label */
  const an=ang(sim,t);txt(ctx,(an<0?'Turned ':'Turned ')+f1(Math.abs(an))+'° '+(Math.abs(an)<0.05?'':an<0?'toward the start':'toward the finish'),cx+(s>50?-16:16),cy-14,{s:fs,w:700,c:PAL['s2'],a:s>50?'right':'left'});
  /* pan-rate dial on the side away from the camera */
  const gx=s>=50?150:650,gy=392,r=Math.round(66+6*(k-1)),maxR=80,ang2=v=>Math.PI+clamp(v,0,maxR)/maxR*Math.PI;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=10;ctx.beginPath();ctx.arc(gx,gy,r,Math.PI,2*Math.PI);ctx.stroke();
  for(let v=0;v<=80;v+=20){const a=ang2(v);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx+(r-9)*Math.cos(a),gy+(r-9)*Math.sin(a));ctx.lineTo(gx+(r+6)*Math.cos(a),gy+(r+6)*Math.sin(a));ctx.stroke();if(k<1.3||v%40===0)txt(ctx,String(v),gx+(r+16+4*k)*Math.cos(a),gy+(r+16+4*k)*Math.sin(a)+4,{s:fs*0.9,c:PAL['cv-soft'],a:'center'});}
  const needle=(v,col,w,len)=>{const a=ang2(v);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(gx,gy);ctx.lineTo(gx+len*Math.cos(a),gy+len*Math.sin(a));ctx.stroke();};
  const gv=G&&G.g?G.g.w:sim.p.guess;needle(gv,PAL['s4'],4,r-4);
  if(sh)needle(rate(sim,Math.min(t,TFIN)),PAL['rj'],3,r+2);
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(gx,gy,5,0,7);ctx.fill();
  txt(ctx,'Pan rate (°/s)',gx,gy+20*k,{s:fs,w:700,a:'center'});
  /* key pills */
  const ps=Math.min(13*k,20);ctx.font='700 '+ps+'px '+BioLab.h.FONT;const items=[[(G&&G.g?'Your gut: ':'Your guess: ')+f1(gv)+'°/s as she passes',PAL['s4']]];
  if(sh)items.push(['Right now: '+f1(rate(sim,Math.min(t,TFIN)))+'°/s',PAL['rj']]);
  if(sh&&(atLeast('honors')||(G&&G.m)))items.push(['As she passes: '+f1(passRate(sim))+'°/s',PAL['s3']]);
  let px=790,row=0;const y0=Math.round(8+ps);items.forEach(([s2,c])=>{const w=ctx.measureText(s2).width+ps*1.1;if(px-w<8){row++;px=790;}pill(ctx,s2,px-w/2,y0+row*ps*1.9,c,'#fff',ps);px-=w+8;});
  txt(ctx,f1(t)+' s',8,y0+5,{s:fs+2,w:700,c:PAL['cv-soft']});},
 narrate(sim){const t=sim.p.race,u=xAt(t)-spot(sim);
  if(!shown(sim))return `As she runs past, every meter she covers swings your camera through an angle. <b>A meter right in front of you is a much bigger angle than a meter far away.</b> Set your gut pan rate for the moment she passes, then lock it in.`;
  const r=rate(sim,Math.min(t,TFIN));
  if(t>=TFIN)return `She finished in ${f2(TFIN)} s. Your fastest pan was ${f1(peak(sim).v)}°/s, <b>right around when she passed you</b>.`;
  if(Math.abs(u)<3)return `She is right in front of you at ${f2(vAt(t))} m/s. <b>This is where you pan fastest: ${f1(r)}°/s.</b> Each meter she runs is a big angle from this close.`;
  return `She is ${f1(Math.abs(u))} m ${u<0?'before':'past'} your spot at ${f2(vAt(t))} m/s, so you pan ${f1(r)}°/s. <b>Far off to the side, each meter is a small angle</b>, so you turn slowly even though she is fast.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'How fast will you have to turn your camera, in degrees per second, at the moment she runs past you? Drag the slider here; the orange needle on the dial shows your answer. Then lock it in.',honors:'Before you see the math: drag the slider here to the pan rate you need as she passes, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(drift(sim,g)),w:g,label:f1(g)+'°/s'};},
  solve(sim){const w=passRate(sim);sim.st.peek=true;sim.st.play=false;sim.p.race=+tPass(sim).toFixed(1);return {v:Math.abs(drift(sim,w)),w,label:f1(w)+'°/s'};},
  how:{bio:'The math links two rates. She runs a certain number of meters per second. Right in front of you, each meter she runs turns your camera by a certain angle, and that angle is biggest when she is closest. Multiply the two and you get degrees per second: her speed divided by your distance, turned into degrees.',
   honors:'Chain rule: dθ/dt = (dθ/du)(du/dt). With θ = arctan(u/d), dθ/du = d / (d² + u²), and du/dt is her speed. As she passes, u = 0, so dθ/dt = v/d.',
   ap:'dθ/dt = d·v / (d² + u²) rad/s. At u = 0 that is v/d; multiply by 180/π for degrees per second.'},
  compare(sim,g,m){const dr=drift(sim,g.w),hf=halfFrame(sim),off=Math.abs(dr)*0.5;
   if(Math.abs(g.w-m.w)<1.5)return `Your gut was right on: ${f1(g.w)}°/s against the math’s ${f1(m.w)}°/s. Your shot stays on her as she passes.`;
   return `At ${f1(g.w)}°/s, the spot your camera points at slides along the track at ${f2(d(sim)*g.w/DEG)} m/s while she runs ${f2(vAt(tPass(sim)))} m/s. <b>Your shot ${dr>0?'falls behind her':'runs ahead of her'} by ${f2(Math.abs(dr))} m every second.</b> In half a second she is about ${f1(off)} m off center, ${Math.round(off/hf*100)}% of the way to the edge of your shot${off>hf?': out of frame':''}. At ${f1(m.w)}°/s you stay with her.`;},
  again(sim){sim.st.peek=false;sim.st.play=false;sim.p.guess=8;sim.p.race=5;if(atLeast('honors'))sim.p.dist=[8,10,12,15,20,25,30][Math.floor(Math.random()*7)];if(atLeast('ap'))sim.p.spot=[20,30,40,50,60,70,80][Math.floor(Math.random()*7)];}
 },
 onTourExit(sim){sim.st.peek=false;sim.st.play=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'You stand level with the 50 m mark, 20 m from the lane. During the race, when do you have to turn the camera fastest?',choices:['Right after the start, when she accelerates hardest','Right as she passes in front of you','Near the finish, when she is fastest'],correct:1,explain:'Pan rate depends on her speed and on how close she is. As she passes you she is only 20 m away, so each meter swings the camera the most: about 25.7°/s. Far from you, even at full speed, you turn slowly: about 3.6°/s as she crosses the finish.'},
  {lvl:'bio',instant:true,q:'You step back from 20 m to 40 m from the lane. How fast do you have to turn as she passes now?',choices:['About twice as fast','About the same','About half as fast'],correct:2,explain:'From twice as far, each meter she runs is about half the angle. As she passes, the pan rate drops from about 25.7°/s to about 12.8°/s. That is why sideline camera operators who want smooth shots often stand farther back and zoom in.'},
  {lvl:'honors',instant:true,q:'She passes in front of you at 9.0 m/s and you are 20 m from the lane. About how fast must you pan, in degrees per second?',choices:['0.45°/s','9°/s','25.8°/s','45°/s'],correct:2,explain:'As she passes, dθ/dt = v/d = 9.0 / 20 = 0.45 radians per second. Times 180/π ≈ 57.3 gives about 25.8°/s.'},
  {lvl:'honors',instant:true,q:'θ = arctan(u/d), where u is how far she is past your spot. Which is dθ/dt?',choices:['1 / (1 + u²) · du/dt','d / (d² + u²) · du/dt','u / (d² + u²) · du/dt'],correct:1,explain:'Chain rule: d/dt arctan(u/d) = [1 / (1 + (u/d)²)] · (1/d) · du/dt = d / (d² + u²) · du/dt.'},
  {lvl:'ap',instant:true,q:'You are 20 m from the lane. She is 20 m past your spot, running 9 m/s. What is your pan rate?',choices:['About 6.4°/s','About 12.9°/s','About 25.8°/s','About 36.5°/s'],correct:1,explain:'dθ/dt = d·v / (d² + u²) = 20 · 9 / (400 + 400) = 0.225 rad/s ≈ 12.9°/s: half the rate as she passes, because d² + u² doubled.'},
  {lvl:'ap',instant:true,q:'Now you stand level with the 20 m mark, where she is still speeding up. When is your pan rate fastest?',choices:['A little before she reaches you','Exactly as she passes you','A little after she passes you'],correct:2,explain:'At the 20 m mark her speed is still rising, so just past you she is a bit faster while still close. The peak, about 24.3°/s, comes at about 3.48 s, 0.13 s after she passes you at 3.35 s.'}
 ],
 tour:[
  {title:'The shot',text:'You are filming a teammate’s 100 m from 20 m beside the lane, level with the 50 m mark. The blue line is where your camera points; the shaded wedge is what your shot sees.',pause:true,setup:sim=>{sim.st.peek=true;sim.st.play=false;BioLab.setValues(sim,{race:2,dist:20,spot:50});}},
  {title:'Far away: slow turning',text:'Two seconds in, she is at 9.2 m, running 7.3 m/s. She is far off to the side, so each meter she runs turns your camera only a little: about 4.1°/s.',pause:true},
  {title:'Right in front of you: fast turning',text:'At 6.75 s she passes you at 8.97 m/s. From 20 m away, each meter is a big angle, so you pan about 25.7°/s: more than six times faster than at 2 s, though she is only 23% faster.',pause:true,setup:sim=>BioLab.setValues(sim,{race:6.8})},
  {title:'Slowing down again',text:'At 11.2 s she is a touch faster, 9.0 m/s, but 40 m past you. Your pan rate falls to about 5.2°/s. The red needle shows the pan rate right now.',pause:true,setup:sim=>BioLab.setValues(sim,{race:11.2})},
  {title:'The rule',text:'Pan rate as she passes = her speed ÷ your distance, in radians per second: 8.97 ÷ 20 ≈ 0.448. Times 57.3 to get degrees: about 25.7°/s. The graph below the stage shows the whole race.',pause:true,setup:sim=>BioLab.setValues(sim,{race:6.8})},
  {lvl:'honors',title:'Related rates and the chain rule',text:'The angle is θ = arctan(u/d), where u is how far she is past your spot. Her position changes with time, so dθ/dt = [d / (d² + u²)] · du/dt. As she passes, u = 0 and that is v/d.',pause:true},
  {lvl:'ap',title:'Stand somewhere else',text:'Stand level with the 20 m mark. She is still speeding up there, so the fastest pan comes just after she passes you at 3.35 s: about 24.3°/s at 3.48 s.',pause:true,setup:sim=>BioLab.setValues(sim,{spot:20,race:3.5})}
 ],
 lab:{bio:'<p><b>Question:</b> When during the race do you turn fastest?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Set the race clock to 2, 4, 6, 7, 8, 10 and 12 s. Record a trial each time.</li><li>Graph <b>Trials</b> with the race clock on x and the pan rate on y.</li></ol><p>Write one sentence: where is the peak, and why there?</p>',
  honors:'<p><b>Question:</b> How does your distance from the lane change the pan?</p><ol><li>Set the race clock to when she passes you. Record the pan rate for distances of 5, 10, 20 and 40 m.</li><li>Compare each to her speed ÷ your distance, times 57.3.</li></ol><p>Explain why doubling your distance halves the pan rate as she passes.</p>',
  ap:'<p><b>Question:</b> Is the fastest pan always as she passes you?</p><ol><li>Stand at the 20, 50 and 80 m marks. Record <b>Fastest pan in the race</b> and when it happens, and when she passes you.</li></ol><p><b>CER:</b> Use dθ/dt = d·v / (d² + u²) and the fact that v is still changing early in the race to explain what you find.</p>'},
 terms:[
  {t:'Pan rate',d:'How fast you turn the camera, in degrees per second.'},
  {t:'Rate of change',d:'How fast one quantity changes per unit of another: meters per second, degrees per second.'},
  {t:'Related rates',d:'Two quantities linked by an equation change at linked rates. Differentiating the equation with respect to time links the rates.',lvl:'honors'},
  {t:'Chain rule',d:'If θ depends on u and u depends on t, then dθ/dt = (dθ/du)(du/dt).',lvl:'honors'},
  {t:'Radian',d:'The angle unit calculus uses. 1 radian ≈ 57.3°, so rad/s × 180/π = °/s.',lvl:'ap'}
 ],
 about:'<p>The runner’s speed is v(t) = 9.0(1 − e<sup>−t/1.2</sup>) m/s and her position is its integral. That is a standard simple model of a sprint; it ignores reaction time and the small slowdown many sprinters have in the last 20 m. She finishes in 12.31 s, a solid high school time.</p><p>The pan rate is dθ/dt = d·v / (d² + u²), converted to degrees per second. <b>Your gut score</b> is how fast the spot your camera points at would slide along the track away from her, at the moment she passes, if you panned at your gut rate: |v − d·ω|. The shot is assumed to be 38° wide, roughly a phone camera zoomed in 2× (an assumption; phones differ).</p>'
};
SIM._m={xAt,vAt,tAt,TFIN,ang,rate,tPass,passRate,peak,drift,halfFrame};
BioLab.register(SIM);
})();
