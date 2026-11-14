(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Height from an angle: stand a measured distance d from the base, read the angle of elevation θ to the top
   with a phone level app, and add your eye height: H = eye + d·tan θ. The common mistakes are forgetting
   the eye height and using sin instead of tan. Heights are realistic illustrations. */
const OBJ={flag:{l:'the school flagpole',s:'Flagpole',H:12.2},tree:{l:'the big cottonwood by the parking lot',s:'Cottonwood',H:17.5},
  lights:{l:'a stadium light tower',s:'Light tower',H:24.4},gym:{l:'the gym wall where the banner will hang',s:'Gym wall',H:9.8}};
const D2R=Math.PI/180;
const ob=sim=>OBJ[sim.p.obj]||OBJ.flag;
const eye=sim=>atLeast('honors')?sim.p.eye:1.6;
const H=sim=>ob(sim).H;
const theta=sim=>Math.atan((H(sim)-eye(sim))/sim.p.d)/D2R;           /* what the phone reads */
const thR=sim=>Math.round(theta(sim)*10)/10;                          /* shown to one decimal */
const mathH=sim=>eye(sim)+sim.p.d*Math.tan(thR(sim)*D2R);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g&&!(BioLab.calcPending&&BioLab.calcPending(sim))));
const m1=v=>(Math.round(v*10)/10).toFixed(1)+' m';
const m2=v=>(Math.round(v*100)/100).toFixed(2)+' m';
const ft=v=>Math.round(v*3.28084)+' ft';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const calcAns=sim=>Math.round(mathH(sim)*10)/10;

const SIM={
 id:'clinometer',hash:'clinometer',apUnit:8,order:7,tab:'How tall is it?',kind:'Simulation',
 skills:{bio:'Tangent of an angle in a right triangle · Geometry (right-triangle trigonometry)',honors:'Angles of elevation, tan θ = opposite ÷ adjacent · Honors Geometry (Unit 8)',ap:'Right-triangle trig and measurement error · Precalculus (Unit 3)'},
 card:'Your club needs to know how tall the flagpole is. Stand 20 m back, read the angle on your phone, guess the height, then let tangent find it.',
 title:'How tall is it? Angles of elevation and tangent',
 lede:{bio:'You can find the height of something you can’t climb. Walk a measured distance away, point a phone level app at the top to read the angle, and use tangent: height above your eyes = distance × tan(angle).',
  honors:'In the right triangle from your eye to the top, the distance is the adjacent side and the height above your eye is the opposite side, so tan θ = opposite ÷ adjacent. Add your eye height to get the whole height.',
  ap:'H = h_eye + d·tan θ. Because tan grows faster at steep angles, a 1° error in the reading matters more up close: ΔH ≈ d·sec²θ·Δθ (Δθ in radians).'},
 scale:'Drawn to scale: the ground line is in meters. Heights are realistic illustrations, not measurements of any real school.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The measurement',
 controls:[
  {id:'guess',label:'Your gut: how tall is it?',type:'range',min:3,max:35,step:0.5,def:10,unit:' m',d:1},
  {id:'obj',label:'What you’re measuring',type:'seg',def:'flag',noGut:true,onChange:clearGut,options:[{v:'flag',l:'Flagpole'},{v:'tree',l:'Tree'},{v:'lights',l:'Light tower'},{v:'gym',l:'Gym wall'}]},
  {id:'d',label:'Your distance from the base',type:'range',min:5,max:40,step:1,def:20,unit:' m',noGut:true,onChange:clearGut,help:'Measure it with a tape or by pacing it off.'},
  {id:'eye',label:'Your eye height',type:'range',min:1.2,max:1.9,step:0.05,def:1.6,unit:' m',d:2,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut guess.'}
 ],
 actions:[{id:'close',label:'Try: stand only 8 m away',run(sim){BioLab.setValues(sim,{d:8});clearGut(sim);}}],
 init(){return {};},step(){},
 metrics:[
  {id:'ang',label:'Angle of elevation (phone)',unit:'°',d:1,min:0,max:90,get:thR},
  {id:'dist',label:'Distance from the base',unit:'m',d:0,min:0,max:null,get:sim=>sim.p.d},
  {id:'opp',label:'Height above your eyes, d × tan θ',unit:'m',d:2,min:0,max:null,get:sim=>shown(sim)?sim.p.d*Math.tan(thR(sim)*D2R):null},
  {id:'H',label:'Total height',unit:'m',d:2,min:0,max:null,get:sim=>shown(sim)?mathH(sim):null},
  {id:'off',label:'Your gut is off by',unit:'m',d:2,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-mathH(sim)):null},
  {id:'noeye',label:'Answer if you forget your eye height',unit:'m',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?sim.p.d*Math.tan(thR(sim)*D2R):null},
  {id:'err1',label:'Height change from a 1° misreading',unit:'m',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?sim.p.d*D2R/Math.pow(Math.cos(thR(sim)*D2R),2):null}
 ],
 graphs:[{id:'curve',label:'Height vs. angle at this distance',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const d=sim.p.d,e=eye(sim),sh=shown(sim);
  const ax=axes(ctx,box,{xmin:0,xmax:80,ymin:0,ymax:40,xl:'Angle of elevation (°)',yl:'Height (m)'});
  if(!sh){txt(ctx,'Lock in your gut to see the curve',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();let first=true;
  for(let a=0;a<=80;a+=0.5){const h=e+d*Math.tan(a*D2R);if(h>40)break;const X=ax.X(a),Y=ax.Y(h);first?ctx.moveTo(X,Y):ctx.lineTo(X,Y);first=false;}ctx.stroke();
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(thR(sim)),ax.Y(mathH(sim)),6,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+8,[{label:'H = '+e.toFixed(2)+' + '+d+' × tan θ',color:PAL['g-line']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),O=ob(sim),d=sim.p.d,e=eye(sim),h=H(sim),th=thR(sim),tst=(sim.tour&&sim.tour.on)?(sim.tst||1):99;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const G0=392,S=Math.min(300/Math.max(h,G&&G.g?G.g.guess:0,12),590/(d+2)),bx=650,sx=bx-d*S;
  txt(ctx,O.s+': how tall is it?',24,34*Math.min(k,1.2),{s:16*k,w:700});
  txt(ctx,'You stand '+d+' m from the base. Your phone reads '+th.toFixed(1)+'° to the top.',24,58*Math.min(k,1.2),{s:12.5*k,c:PAL['cv-soft']});
  /* ground */
  ctx.fillStyle=PAL['cv-bench']||'#d9cdb8';ctx.fillRect(0,G0,800,450-G0);
  /* object */
  const top=G0-h*S;
  if(sim.p.obj==='tree'){ctx.fillStyle='#7a5a3a';ctx.fillRect(bx-7,G0-h*S*0.45,14,h*S*0.45);ctx.fillStyle='#4f8a3c';ctx.beginPath();ctx.ellipse(bx,top+h*S*0.32,h*S*0.24,h*S*0.33,0,0,7);ctx.fill();}
  else if(sim.p.obj==='lights'){ctx.strokeStyle='#8a9099';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(bx,G0);ctx.lineTo(bx,top+16);ctx.stroke();ctx.fillStyle='#5b616b';rr(ctx,bx-26,top,52,18,3);ctx.fill();ctx.fillStyle='#fff6c9';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(bx-18+i*12,top+9,4,0,7);ctx.fill();}}
  else if(sim.p.obj==='gym'){ctx.fillStyle='#b9a58c';ctx.fillRect(bx-10,top,50,h*S);ctx.strokeStyle='#8e7b64';ctx.lineWidth=1;for(let y=top+10;y<G0;y+=12){ctx.beginPath();ctx.moveTo(bx-10,y);ctx.lineTo(bx+40,y);ctx.stroke();}}
  else{ctx.strokeStyle='#9aa1aa';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(bx,G0);ctx.lineTo(bx,top);ctx.stroke();ctx.fillStyle='#c8102e';ctx.fillRect(bx+2,top+4,34,20);ctx.fillStyle='#ffffff';ctx.fillRect(bx+2,top+11,34,6);ctx.fillStyle='#9aa1aa';ctx.beginPath();ctx.arc(bx,top,4,0,7);ctx.fill();}
  /* student (simple figure, eye at eye height) */
  const ey=G0-e*S;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(sx,G0);ctx.lineTo(sx,ey+e*S*0.45);ctx.moveTo(sx,ey+e*S*0.45);ctx.lineTo(sx-6,G0);ctx.moveTo(sx,ey+e*S*0.45);ctx.lineTo(sx+6,G0);ctx.moveTo(sx,ey+e*S*0.12);ctx.lineTo(sx,ey+e*S*0.45);ctx.stroke();
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(sx,ey,Math.max(4,e*S*0.07),0,7);ctx.fill();
  ctx.fillStyle='#2a2f36';rr(ctx,sx+5,ey-6,10,14,2);ctx.fill();
  /* distance */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,G0+16);ctx.lineTo(bx,G0+16);ctx.stroke();
  [sx,bx].forEach(x=>{ctx.beginPath();ctx.moveTo(x,G0+10);ctx.lineTo(x,G0+22);ctx.stroke();});
  txt(ctx,'d = '+d+' m',(sx+bx)/2,G0+38*Math.min(k,1.2),{s:13*k,w:700,a:'center'});
  /* sight line, horizontal, angle */
  ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx+10,ey);ctx.lineTo(bx,ey);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx+10,ey);ctx.lineTo(bx,top);ctx.stroke();
  const R=Math.min(60,(bx-sx)*0.35);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx+10,ey,R,-th*D2R,0);ctx.stroke();
  if(th>50)txt(ctx,'θ = '+th.toFixed(1)+'°',sx-12,ey-12,{s:13*k,w:700,c:PAL['rj'],a:'right'});else txt(ctx,'θ = '+th.toFixed(1)+'°',sx+14+R,ey-10,{s:13*k,w:700,c:PAL['rj']});
  /* right-angle box and eye-height bracket */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.2;ctx.strokeRect(bx-10,ey-10,10,10);
  const rx=bx+(sim.p.obj==='gym'?48:sim.p.obj==='lights'?30:14);
  if(tst>=3||(sh&&atLeast('honors'))){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(rx,ey);ctx.lineTo(rx,G0);ctx.stroke();txt(ctx,'eye '+e.toFixed(2)+' m',rx+6,(ey+G0)/2+4,{s:12*k,w:700,c:PAL['s4']});}
  if(sh){/* opposite side */
   ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(bx+6,ey);ctx.lineTo(bx+6,top);ctx.stroke();
   if(tst>=2){const lab='d × tan θ = '+m2(d*Math.tan(th*D2R));if(th>50)txt(ctx,lab,sx-14,(ey+top)/2,{s:12.5*k,w:700,c:PAL['s1'],a:'right'});else txt(ctx,lab,bx-16,ey-0.22*(ey-top),{s:12.5*k,w:700,c:PAL['s1'],a:'right'});}
   if(tst>=3)pill(ctx,'H = '+e.toFixed(2)+' + '+d+' × tan '+th.toFixed(1)+'° = '+m2(mathH(sim))+' ('+ft(mathH(sim))+')',400,96*Math.min(k,1.15),PAL['card2'],PAL['s1'],13*Math.min(k,1.3));}
  else txt(ctx,'?',bx+22,(top+G0)/2,{s:30*k,w:700,c:PAL['cv-soft']});
  if(G&&G.g){const gy=G0-G.g.guess*S;ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx-40,gy);ctx.lineTo(bx+44,gy);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'your gut: '+m1(G.g.guess),bx-44,gy-6,{s:12*k,w:700,c:PAL['s4'],a:'right'});}},
 narrate(sim){const O=ob(sim),d=sim.p.d,th=thR(sim),e=eye(sim);
  if(!shown(sim))return `You want the height of <b>${O.l}</b>. You stand <b>${d} m</b> from its base, and your phone level reads <b>${th.toFixed(1)}°</b> up to the top. How tall is it?`;
  return `The distance is the side next to θ (adjacent) and the height above your eyes is the side across from θ (opposite), so opposite = ${d} × tan ${th.toFixed(1)}° = ${m2(d*Math.tan(th*D2R))}. Add your eye height, ${e.toFixed(2)} m: <b>${m2(mathH(sim))}</b>.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Look at the picture and drag the slider here to how tall you think it is, in meters. Then lock it in.',
   honors:'Before any trig: drag the slider here to your gut estimate of the height, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-mathH(sim)),guess:sim.p.guess,label:`about ${m1(sim.p.guess)}`};},
  solve(sim){const hm=mathH(sim);sim.p.guess=Math.round(hm*2)/2;return {v:Math.abs(sim.p.guess-hm),guess:hm,label:`${m2(hm)} (${ft(hm)})`};},
  hint:{bio:'Lock in your gut. Then you will find the height yourself with tangent.'},
  calc:{unit:'m',d:1,tol:a=>0.15,
   prompt:{bio:sim=>`You stand <b>${sim.p.d} m</b> from the base. Your phone reads <b>${thR(sim).toFixed(1)}°</b> to the top, and your eyes are <b>${eye(sim).toFixed(2)} m</b> above the ground. Multiply the distance by tan(angle), then add your eye height. How tall is it, in meters?`,
    honors:sim=>`Find H = h_eye + d·tan θ with d = ${sim.p.d} m, θ = ${thR(sim).toFixed(1)}° and h_eye = ${eye(sim).toFixed(2)} m. Round to 0.1 m.`},
   answer:calcAns,
   hint:'Make sure your calculator is in degree mode. Then type distance × tan(angle) and add the eye height.',
   steps(sim){const d=sim.p.d,th=thR(sim),e=eye(sim),t=Math.tan(th*D2R);return [
    `The distance (${d} m) is the side next to the angle; the height above your eyes is across from it. So tan θ = opposite ÷ adjacent.`,
    `Opposite = ${d} × tan ${th.toFixed(1)}° = ${d} × ${t.toFixed(4)} = ${m2(d*t)}.`,
    `Add your eye height: ${m2(d*t)} + ${e.toFixed(2)} m = <b>${m2(e+d*t)}</b>.`,
    `Check: tan⁻¹(${(d*t).toFixed(2)} ÷ ${d}) = ${th.toFixed(1)}°. ✓`];}},
  formula(sim){return `H = h_eye + d·tan θ = ${eye(sim).toFixed(2)} + ${sim.p.d} × tan ${thR(sim).toFixed(1)}° = ${m2(mathH(sim))}`;},
  how:{bio:'The line from your eye to the top, the level line from your eye to the pole, and the pole make a right triangle. Tangent connects the angle to the two legs: height above your eyes = distance × tan(angle).',
   honors:'tan θ = opposite ÷ adjacent, so opposite = adjacent × tan θ. The triangle starts at your eye, so add h_eye.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),e=eye(sim);
   const K=sim.ui.calc,self=K&&K.done&&K.correct?' You also found it yourself with tangent, so you can measure anything tall with just a phone and a tape.':'';
   if(off<=0.4)return `Your gut was right on: within ${m2(off)} of ${m2(m.guess)}. Tangent shows why your eye could judge it.`+self;
   const banner=sim.p.obj==='gym'?` For a banner hung from the top, that is ${m2(off)} of rope you would have bought wrong.`:'';
   return `Your gut was off by <b>${m2(off)}</b> (about ${Math.round(off*3.28084)} ft): you guessed ${m1(g.guess)}, and tangent gives <b>${m2(m.guess)}</b>.${Math.abs(g.guess-(m.guess-e))<0.4?' Your guess is close to the answer without your eye height. The triangle starts at your eyes, not the ground.':''}${banner}`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.obj=R(['flag','tree','lights','gym']);sim.p.d=R([10,12,15,18,20,25,30]);sim.p.guess=10;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You stand 20 m from a flagpole. Your phone reads 30° to the top, and your eyes are 1.6 m up. How tall is the flagpole, in meters? (One decimal place.)',answer:13.1,tol:0.1,unit:'m',d:1,hint:'20 × tan 30°, then add 1.6.',explain:'20 × tan 30° = 20 × 0.5774 = 11.55 m above your eyes. Add 1.6 m: about 13.1 m, or 43 ft.'},
  {lvl:'bio',instant:true,q:'A friend measures 25 m back and reads 30°, then calls the height 25 × tan 30° = 14.4 m. What did they forget?',choices:['Nothing: 14.4 m is right','Their eye height: the triangle starts at their eyes, not the ground','They should have used sin 30°'],correct:1,explain:'25 × tan 30° = 14.4 m is the height above their eyes. Add about 1.6 m: roughly 16.0 m.'},
  {lvl:'bio',instant:true,q:'You walk closer to the same tree. What happens to the angle your phone reads?',choices:['It gets bigger','It gets smaller','It stays the same'],correct:0,explain:'Closer means the same height over a shorter distance, so the sight line tilts up more: tan θ = height ÷ distance gets bigger.'},
  {lvl:'honors',kind:'num',q:'A ladder rule says the base should be one fourth of the ladder’s length out from the wall. What angle does the ladder make with the ground, to the nearest tenth of a degree?',answer:75.5,tol:0.1,unit:'°',d:1,hint:'The ladder is the hypotenuse and the base is the adjacent side: cos θ = 1/4.',explain:'cos θ = adjacent ÷ hypotenuse = 1/4, so θ = cos⁻¹(0.25) = 75.5°. Safety guidance for leaning ladders uses this 4-to-1 rule.'},
  {lvl:'honors',instant:true,q:'At 20 m back, 30° gives 11.5 m above your eyes. What does 60° from the same spot give?',choices:['23.1 m: twice the angle, twice the height','34.6 m: three times as high, because tan 60° = 3 × tan 30°','17.3 m'],correct:1,explain:'tan 60° = 1.732 and tan 30° = 0.577, a ratio of 3. Height is not proportional to angle: tan grows faster and faster as the angle gets steep.'},
  {lvl:'ap',kind:'num',q:'From 20 m away at 30°, about how much does the height change if your reading is off by 1°? (ΔH ≈ d·sec²θ·Δθ, Δθ in radians; two decimals.)',answer:0.47,tol:0.02,unit:'m',d:2,hint:'sec²30° = 1/cos²30° = 4/3, and 1° = 0.01745 rad.',explain:'ΔH ≈ 20 × (4/3) × 0.01745 = 0.47 m. From 8 m at a steep angle the same 1° error is bigger, which is why surveyors stand back where θ is near 45° or less.'},
  {lvl:'ap',instant:true,q:'Which distance gives the most reliable height for a 15 m pole (smallest effect of a 1° misreading)?',choices:['3 m back, about 77°','15 m back, about 42°','100 m back, about 8°'],correct:1,explain:'With 13.4 m of pole above your eyes, d·sec²θ = d + 13.4²/d: about 63 m per radian at 3 m, 27 at 15 m and 102 at 100 m. It is smallest when d equals the height, at 45°. Too close, tan is steep; too far, the distance multiplies the error.'}
 ],
 tour:[
  {title:'The problem',text:'You need the height of the school flagpole. You can’t climb it, but you can pace 20 m from its base and point a phone level app at the top: it reads 27.9°.',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{obj:'flag',d:20,eye:1.6,reveal:true});}},
  {title:'Find the right triangle',text:'Your eye, a level line to the pole, and the pole make a right triangle. The 20 m distance is the side next to the angle (adjacent). The part of the pole above your eyes is across from it (opposite).',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Tangent links them',text:'tan θ = opposite ÷ adjacent, so opposite = 20 × tan 27.9° = 10.6 m. That is the height above your eyes.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Add your eye height',text:'The triangle starts at your eyes, 1.6 m up. Total: 10.6 + 1.6 = 12.2 m, about 40 ft. Forgetting this is the most common mistake.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Up close the angle gets steep',text:'From 8 m back the phone reads much higher, but tangent gives the same height. Steep angles are touchy, though: a small misreading changes the answer a lot.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{d:8});}},
  {lvl:'honors',title:'Any tall thing',text:'The same method measures a tree before a crew trims it, or the gym wall where the club banner will hang: distance × tan(angle) + eye height.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{obj:'gym',d:15});}},
  {lvl:'ap',title:'How much a 1° error costs',text:'ΔH ≈ d·sec²θ·Δθ. At 20 m and 30°, a 1° slip changes the height by about 0.47 m. Read the <b>Height change from a 1° misreading</b> readout as you move.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{obj:'flag',d:20});}}
 ],
 onTourExit(sim){sim.tst=99;BioLab.setValues(sim,{reveal:false});},
 lab:{bio:'<p><b>Question:</b> Does it matter where you stand?</p><ol><li>Turn on <b>Show the answer now</b> and pick the light tower.</li><li>Record a trial at 10, 20, 30 and 40 m.</li><li>Compare the angle and the total height each time.</li></ol><p>Write one sentence: why does the angle change while the height doesn’t?</p>',
  honors:'<p><b>Question:</b> How big is the eye-height mistake?</p><ol><li>Pick the gym wall. Record a trial at 5, 10 and 20 m.</li><li>Compare <b>Total height</b> with <b>Answer if you forget your eye height</b>.</li></ol><p>Does the mistake change with distance? Explain.</p>',
  ap:'<p><b>Question:</b> Where should a surveyor stand?</p><ol><li>Pick the flagpole. Record <b>Height change from a 1° misreading</b> at every distance from 5 to 40 m.</li><li>Plot it against distance.</li></ol><p><b>CER:</b> Use d·sec²θ to explain the shape of your graph and where the best spot is.</p>'},
 terms:[
  {t:'Angle of elevation',d:'The angle between a level line from your eye and your line of sight up to an object.'},
  {t:'Tangent (tan)',d:'In a right triangle, tan θ = opposite side ÷ adjacent side.'},
  {t:'Opposite and adjacent',d:'The leg across from the angle, and the leg next to it (not the hypotenuse).'},
  {t:'Clinometer',d:'A tool that measures an angle of elevation. Many phone level apps do this.',lvl:'honors'},
  {t:'Measurement error',d:'How much an answer changes when an input is a little off. For heights, ΔH ≈ d·sec²θ·Δθ.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Level ground, a vertical object, and the angle read from eye height: H = h_eye + d·tan θ. The angle shown is rounded to 0.1°, like a phone app, and the answer uses that rounded value. Heights are realistic illustrations, not measurements of any real school. The 1° sensitivity uses the derivative of tan: d(tan θ)/dθ = sec²θ.</p>'
};
BioLab.register(SIM);
})();
