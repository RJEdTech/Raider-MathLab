(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast,fmtNum,rr}=BioLab.h;
/* The unit circle, through a robotics arm. The shoulder pivots; the arm of length L points at angle θ,
   measured counterclockwise from straight ahead. The gripper sits at (L cos θ, L sin θ): the unit circle scaled by L.
   The student sets θ to reach a game piece whose (x, y) is given. */
const R=Math.PI/180,f0=v=>fmtNum(v,0),f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const sgn=v=>(Math.abs(v)<0.05?'0':v<0?'−':'+');
const neg=s=>String(s).replace(/^-/,'−');
const ANG=[30,45,60,90,120,135,150,180,210,225,240,300,315,330];
const EXACT={0:['1','0'],30:['√3/2','1/2'],45:['√2/2','√2/2'],60:['1/2','√3/2'],90:['0','1']};
/* exact cos and sin for special angles, by reference angle and quadrant */
function exact(deg){deg=((Math.round(deg)%360)+360)%360;let ref=deg<=90?deg:deg<=180?180-deg:deg<=270?deg-180:360-deg;const e=EXACT[ref];if(!e||(deg%15&&deg%45))return null;
  const c=Math.cos(deg*R),s=Math.sin(deg*R),fx=(v,t)=>Math.abs(v)<1e-9?'0':(v<0?'−':'')+t;return [fx(c,e[0]),fx(s,e[1])];}
const RADN={30:'π/6',45:'π/4',60:'π/3',90:'π/2',120:'2π/3',135:'3π/4',150:'5π/6',180:'π',210:'7π/6',225:'5π/4',240:'4π/3',270:'3π/2',300:'5π/3',315:'7π/4',330:'11π/6',0:'0',360:'2π'};
const radTxt=d=>{const k=((Math.round(d)%360)+360)%360;return RADN[k]&&Math.abs(d-Math.round(d))<1e-6?RADN[k]+' ≈ '+f2(d*R):f2(d*R);};
const Lof=sim=>atLeast('honors')?sim.p.arm:50;
const tgt=sim=>sim.st.tgt;
const tgtXY=sim=>{const L=Lof(sim),a=tgt(sim)*R;return [L*Math.cos(a),L*Math.sin(a)];};
const grip=(sim,deg)=>{const L=Lof(sim),a=deg*R;return [L*Math.cos(a),L*Math.sin(a)];};
const missAt=(sim,deg)=>{const [gx,gy]=grip(sim,deg),[tx,ty]=tgtXY(sim);return Math.hypot(gx-tx,gy-ty);};
const refAng=d=>{d=((d%360)+360)%360;return d<=90?d:d<=180?180-d:d<=270?d-180:360-d;};
const quad=d=>{d=((d%360)+360)%360;return d<90?'I':d<180?'II':d<270?'III':'IV';};
const where=(x,y)=>(Math.abs(x)<0.05?'':x>0?'in front of':'behind')+(Math.abs(x)<0.05||Math.abs(y)<0.05?'':' and ')+(Math.abs(y)<0.05?'':y>0?'above':'below');
const stage=sim=>(sim.tour&&sim.tour.on)?(sim.tst||1):99;
const pend=sim=>BioLab.calcPending&&BioLab.calcPending(sim);
const solvedNow=sim=>sim.gutS&&sim.gutS.m&&sim.gutS.m.key===key(sim);
const key=sim=>tgt(sim)+'|'+Lof(sim);

/* the stage */
const S={x:205,y:262},PX=2.9; // shoulder on screen, px per cm
const U={x:612,y:238,r:128};    // the unit circle panel
function arm(ctx,deg,L,col,w,dash){const a=deg*R,ex=S.x+L*PX*Math.cos(a),ey=S.y-L*PX*Math.sin(a);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(S.x,S.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);
  // gripper claws
  const ux=Math.cos(a),uy=-Math.sin(a),nx=-uy,ny=ux;ctx.lineWidth=Math.max(2,w*0.45);ctx.beginPath();[-1,1].forEach(s=>{ctx.moveTo(ex+nx*7*s,ey+ny*7*s);ctx.lineTo(ex+nx*7*s+ux*10,ey+ny*7*s+uy*10);});ctx.moveTo(ex-nx*7,ey-ny*7);ctx.lineTo(ex+nx*7,ey+ny*7);ctx.stroke();ctx.restore();return [ex,ey];}

const SIM={
 id:'unitcircle',hash:'unitcircle',apUnit:9,order:0,tab:'Unit circle: robot arm',kind:'Simulation',
 skills:{bio:'The unit circle: sine and cosine as coordinates · Precalculus (Unit 4), Algebra 2/Trig',honors:'The unit circle: special angles, reference angles and radians · Precalculus (Unit 4), Honors Algebra 2/Trig',ap:'The unit circle, radians and the sine and cosine functions · AP Precalculus (Unit 3A)'},
 card:'Program a robot arm to reach a game piece: guess the angle, then use the unit circle to find it exactly, including when the piece is behind or below the arm.',
 title:'The unit circle: aiming a robot arm',
 lede:{bio:'A robot arm swings around its shoulder, so its gripper always stays on a circle. Shrink that circle to radius 1 and you have the unit circle: the point at angle θ is (cos θ, sin θ).',
  honors:'Special angles (30°, 45°, 60° and their partners in every quadrant) have exact sines and cosines. The reference angle plus the signs in each quadrant give any of them. Radians measure an angle by the arc it sweeps on the unit circle.',
  ap:'Unroll the unit circle and the y-coordinate traces y = sin θ, the x-coordinate y = cos θ, both with period 2π. Going from coordinates back to an angle takes the quadrant into account, which is what atan2 does.'},
 scale:{bio:'The arm is 50 cm from the shoulder pivot to the gripper. x is forward (+) or behind (−); y is up (+) or down (−). Angles are measured counterclockwise from straight ahead.',honors:'Arm lengths of 40, 50 or 60 cm. x is forward (+) or behind (−); y is up (+) or down (−). Angles are measured counterclockwise from straight ahead.'},
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The arm',
 controls:[
  {id:'guess',label:'Arm angle (counterclockwise from straight ahead)',type:'range',min:0,max:359,step:1,def:45,unit:'°',help:'0° points straight ahead, 90° straight up, 180° straight back.'},
  {id:'arm',label:'Arm length',type:'seg',def:50,lvl:'honors',noGut:true,noTrial:true,options:[{v:40,l:'40 cm'},{v:50,l:'50 cm'},{v:60,l:'60 cm'}],onChange(sim){clearGut(sim);}},
  {id:'rad',label:'Show radians',type:'toggle',def:false,lvl:'honors',noGut:true,noTrial:true},
  {id:'unwrap',label:'Unroll the circle into sine and cosine graphs',type:'toggle',def:false,lvl:'ap',noGut:true,noTrial:true}
 ],
 actions:[{id:'newcube',label:'New game piece position',noGut:true,run(sim){newTarget(sim);}}],
 init(){return {tgt:120};},step(){},
 metrics:[
  {id:'gx',label:'Gripper x (forward + / behind −)',unit:'cm',d:1,min:-60,max:60,get:sim=>grip(sim,sim.p.guess)[0]},
  {id:'gy',label:'Gripper y (up + / down −)',unit:'cm',d:1,min:-60,max:60,get:sim=>grip(sim,sim.p.guess)[1]},
  {id:'miss',label:'Gripper misses the piece by',unit:'cm',d:1,min:0,max:120,get:sim=>pend(sim)?null:missAt(sim,sim.p.guess)},
  {id:'cos',label:'cos θ (x on the unit circle)',unit:'',d:3,lvl:'honors',min:-1,max:1,get:sim=>Math.cos(sim.p.guess*R)},
  {id:'sin',label:'sin θ (y on the unit circle)',unit:'',d:3,lvl:'honors',min:-1,max:1,get:sim=>Math.sin(sim.p.guess*R)},
  {id:'radv',label:'θ in radians',unit:'rad',d:3,lvl:'honors',min:0,max:6.3,get:sim=>sim.p.guess*R},
  {id:'arc',label:'Gripper’s path from 0° (arc length Lθ)',unit:'cm',d:1,lvl:'ap',min:0,max:380,get:sim=>Lof(sim)*sim.p.guess*R}
 ],
 draw(sim,ctx,vdt,k){const p=sim.p,stg=stage(sim),kk=Math.min(k,1.5),L=Lof(sim),hon=atLeast('honors'),ap=atLeast('ap'),[tx,ty]=tgtXY(sim),G=sim.gutS,sv=solvedNow(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* ---- left: the robot ---- */
  txt(ctx,'Robot arm, side view',20,24,{s:14*kk,w:700});
  ctx.save();ctx.beginPath();ctx.rect(14,36,396,408);ctx.clip();
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let c=-70;c<=70;c+=10){const x=S.x+c*PX,y=S.y-c*PX;ctx.beginPath();ctx.moveTo(x,36);ctx.lineTo(x,444);ctx.stroke();ctx.beginPath();ctx.moveTo(14,y);ctx.lineTo(410,y);ctx.stroke();}
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(14,S.y);ctx.lineTo(408,S.y);ctx.moveTo(S.x,40);ctx.lineTo(S.x,440);ctx.stroke();
  ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(S.x,S.y,L*PX,0,7);ctx.stroke();ctx.setLineDash([]);ctx.restore();
  txt(ctx,'straight ahead (0°)',404,S.y-8,{s:11.5*k,c:PAL['cv-soft'],a:'right'});txt(ctx,'up (90°)',S.x+6,48,{s:11.5*k,c:PAL['cv-soft']});txt(ctx,'behind (180°)',20,S.y-8,{s:11.5*k,c:PAL['cv-soft']});
  // robot body
  ctx.fillStyle='#4b5563';rr(ctx,S.x-62,404,124,26,6);ctx.fill();ctx.fillStyle='#2b3039';[S.x-42,S.x+42].forEach(x=>{ctx.beginPath();ctx.arc(x,432,10,0,7);ctx.fill();});ctx.fillStyle='#6b7280';ctx.fillRect(S.x-7,S.y,14,404-S.y);
  // game piece
  const cx=S.x+tx*PX,cy=S.y-ty*PX,cs=10*PX;ctx.fillStyle='#f0a020';rr(ctx,cx-cs/2,cy-cs/2,cs,cs,4);ctx.fill();ctx.strokeStyle='#a86a00';ctx.lineWidth=2;rr(ctx,cx-cs/2,cy-cs/2,cs,cs,4);ctx.stroke();
  // the given coordinates
  ctx.setLineDash([4,4]);ctx.strokeStyle='#a86a00';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx,S.y);ctx.moveTo(cx,cy);ctx.lineTo(S.x,cy);ctx.stroke();ctx.setLineDash([]);
  const cl='('+neg(f1(tx))+', '+neg(f1(ty))+') cm';ctx.font='700 '+(12.5*k)+'px '+FONT;const cw=ctx.measureText(cl).width;
  const lx=clamp(cx+(tx>=0?cs/2+8:-cs/2-8-cw),20,400-cw),ly=cy+(ty>=0?-cs/2-18:cs/2+20);ctx.font='700 '+(12*k)+'px '+FONT;const pw=ctx.measureText('Piece at '+cl).width+20;pill(ctx,'Piece at '+cl,clamp(cx,16+pw/2,404-pw/2),ly,PAL['card'],'#a86a00',12*k);
  // gut arm (locked) and the current arm
  if(G&&G.g&&G.g.key===key(sim)&&Math.abs(G.g.deg-p.guess)>0.5)arm(ctx,G.g.deg,L,PAL['s4'],5,[8,6]);
  const tip=arm(ctx,p.guess,L,sv&&Math.abs(p.guess-tgt(sim))<0.5?PAL['s3']:PAL['rj'],8);
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(S.x,S.y,7,0,7);ctx.fill();
  // angle arc
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(S.x,S.y,34,0,-p.guess*R,true);ctx.stroke();
  const ma=p.guess/2*R;txt(ctx,'θ = '+f0(p.guess)+'°',S.x+54*Math.cos(ma),S.y-54*Math.sin(ma),{s:12.5*k,w:700,c:PAL['rj'],a:'center',b:'middle'});
  // miss
  const ms=missAt(sim,p.guess);if(!pend(sim)&&ms>2){ctx.setLineDash([3,4]);ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(tip[0],tip[1]);ctx.lineTo(cx,cy);ctx.stroke();ctx.setLineDash([]);}
  /* ---- right: the unit circle ---- */
  if(stg<2&&stg!==99){return;}
  const unw=ap&&(p.unwrap||stg===9);
  if(unw)drawUnwrap(sim,ctx,k);else drawCircle(sim,ctx,k,stg);}
 ,narrate(sim){const p=sim.p,L=Lof(sim),[tx,ty]=tgtXY(sim),[gx,gy]=grip(sim,p.guess),ms=missAt(sim,p.guess);
  const q=quad(tgt(sim)),r=refAng(tgt(sim));
  if(pend(sim))return `The piece is ${where(tx,ty)} the shoulder: (${neg(f1(tx))}, ${neg(f1(ty))}) cm. Work out the angle in the box: find the reference angle, then use the quadrant.`;
  if(ms<0.5)return `<b>The gripper reaches the piece.</b> At θ = ${f0(p.guess)}°, the gripper sits at (${L} cos θ, ${L} sin θ) = (${neg(f1(gx))}, ${neg(f1(gy))}) cm. ${atLeast('honors')?`On the unit circle that is (${neg(f2(Math.cos(p.guess*R)))}, ${neg(f2(Math.sin(p.guess*R)))}), in quadrant ${q}, with reference angle ${f0(r)}°.`:''}`;
  return `At θ = ${f0(p.guess)}° the gripper is at (${neg(f1(gx))}, ${neg(f1(gy))}) cm, but the piece is at (${neg(f1(tx))}, ${neg(f1(ty))}). It misses by <b>${f1(ms)} cm</b>. ${ms>10?'The game piece is 10 cm wide, so the gripper would close on air.':'Close, but a 10 cm game piece needs the gripper right on it.'}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'The orange game piece sits where the label says. Drag the slider here to swing the arm to where you think it reaches the piece. Go by eye, then lock it in.',
   honors:'Swing the arm by eye so the gripper lands on the piece: no calculating yet. Then lock it in.'},
  hint:{bio:'Lock in your gut angle. Then you will work out the exact angle from the piece’s position.'},
  lock(sim){return {v:missAt(sim,sim.p.guess),deg:sim.p.guess,key:key(sim),label:f0(sim.p.guess)+'°'};},
  solve(sim){const d=tgt(sim);sim.p.guess=d;return {v:0,deg:d,key:key(sim),label:f0(d)+'°'+(atLeast('honors')?' = '+(RADN[d]||f2(d*R))+' rad':'')};},
  calc:{unit:'°',d:0,tol:1,
   prompt:{bio:sim=>{const [tx,ty]=tgtXY(sim),L=Lof(sim),r=refAng(tgt(sim));return `The piece is at x = ${neg(f1(tx))} cm, y = ${neg(f1(ty))} cm, and the arm is ${L} cm long. Its <b>reference angle</b>, the angle the arm makes with the nearest horizontal line, is ${f0(r)}°, because ${r===90?'it points straight up or down':`cos ${f0(r)}° = ${f1(Math.abs(tx))} ÷ ${L}`}. The piece is ${where(tx,ty)} the shoulder. What angle, counterclockwise from straight ahead, should the arm be set to?`;},
    honors:sim=>{const [tx,ty]=tgtXY(sim),L=Lof(sim);return `The piece is at (${neg(f1(tx))}, ${neg(f1(ty))}) cm and the arm is ${L} cm long. Use cos θ = x ÷ ${L} and sin θ = y ÷ ${L} to find the reference angle, then use the signs to pick the quadrant. What angle θ, in degrees from 0° to 360°, reaches the piece?`;}},
   answer:sim=>tgt(sim),
   hint:'Find the reference angle first (an angle from 0° to 90°). Then: quadrant I keeps it, II is 180° − ref, III is 180° + ref, IV is 360° − ref.',
   steps(sim){const [tx,ty]=tgtXY(sim),L=Lof(sim),d=tgt(sim),r=refAng(d),q=quad(d),out=[];
    out.push(`On the unit circle the piece is at (x ÷ ${L}, y ÷ ${L}) = (${neg(f2(tx/L))}, ${neg(f2(ty/L))}). Those are cos θ and sin θ.`);
    out.push(r===90?'cos θ = 0, so the arm points straight up or down: the reference angle is 90°.':`Ignore the signs: cos ${f0(r)}° = ${f2(Math.cos(r*R))} and sin ${f0(r)}° = ${f2(Math.sin(r*R))}, so the reference angle is ${f0(r)}°.`);
    out.push(`x is ${sgn(tx)} and y is ${sgn(ty)}, so the piece is ${where(tx,ty)} the shoulder: quadrant ${q}${Math.abs(tx)<0.05||Math.abs(ty)<0.05?' (on an axis)':''}.`);
    out.push(`θ = ${q==='I'?f0(r)+'°':q==='II'?'180° − '+f0(r)+'°':q==='III'?'180° + '+f0(r)+'°':'360° − '+f0(r)+'°'} = <b>${f0(d)}°</b>${atLeast('honors')?' = '+(RADN[d]||f2(d*R))+' radians':''}.`);
    return out;}},
  formula(sim){const d=tgt(sim),L=Lof(sim),[tx,ty]=tgtXY(sim);return `(x, y) = (${L} cos ${f0(d)}°, ${L} sin ${f0(d)}°) = (${neg(f1(tx))}, ${neg(f1(ty))}) cm`+(atLeast('ap')?`<br>θ = atan2(y, x) = atan2(${neg(f1(ty))}, ${neg(f1(tx))}) = ${f0(d)}° = ${RADN[d]||f2(d*R)} rad`:'');},
  how:{bio:'The math divides the piece’s position by the arm length to land on the unit circle at (cos θ, sin θ). The sizes of those numbers give the reference angle; their signs give the quadrant.',
   ap:'θ = atan2(y, x): the arctangent of y/x, corrected for the quadrant using the signs of x and y. Then x = L cos θ and y = L sin θ check it.'},
  compare(sim,g,m){const off=Math.abs(((g.deg-m.deg+540)%360)-180),ms=g.v,L=Lof(sim);const K=sim.ui.calc,self=K&&K.done&&K.correct?' You also worked out the exact angle yourself, which is what the robot’s code has to do.':'';
   if(ms<2)return `Your gut was right on: the gripper landed within ${f1(ms)} cm of the piece. Your eye already reads the circle. The unit circle turns that feel into an exact number the motor can use.`+self;
   return `Your gut set the arm to ${f0(g.deg)}°, ${f0(off)}° from the right angle, ${f0(m.deg)}°. The gripper missed the piece by <b>${f1(ms)} cm</b>${ms>10?', more than the piece is wide, so it closes on air':''}. At ${L} cm, every degree moves the gripper ${f2(L*R)} cm along its circle, so ${f0(off)}° is ${f1(L*off*R)} cm of travel. The unit circle gets it exactly.`+self;},
  again(sim){newTarget(sim);if(atLeast('honors'))sim.p.arm=[40,50,60][Math.floor(Math.random()*3)];sim.p.guess=45;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A 60 cm arm is set to 150°. How far forward (+) or behind (−) the shoulder is the gripper? Use cos 150° = −√3/2 ≈ −0.866.',answer:-51.96,tol:0.3,unit:'cm',d:1,hint:'x = arm length × cos θ.',explain:'x = 60 × cos 150° = 60 × (−0.866) ≈ −52.0 cm: 52 cm behind the shoulder. The negative sign is the point: cosine is negative in quadrant II.'},
  {lvl:'bio',instant:true,q:'The arm points at 210°. Where is the gripper?',choices:['Behind the shoulder and below it','In front and above','Behind and above','In front and below'],correct:0,explain:'210° is past 180° (straight back) and before 270° (straight down): quadrant III, where both cos and sin are negative. So x < 0 (behind) and y < 0 (below).'},
  {lvl:'bio',instant:true,q:'On the unit circle, what is cos 60°?',choices:['1/2','√3/2','√2/2','1'],correct:0,explain:'The 30-60-90 triangle with hypotenuse 1 has legs 1/2 and √3/2. At 60° the horizontal leg is the short one, so cos 60° = 1/2 and sin 60° = √3/2.'},
  {lvl:'honors',instant:true,q:'A piece sits at (25.0, −43.3) cm from the shoulder of a 50 cm arm. What angle reaches it?',choices:['300°','60°','120°','240°'],correct:0,explain:'cos θ = 25/50 = 1/2 and sin θ = −43.3/50 ≈ −√3/2. Reference angle 60°, x positive and y negative: quadrant IV, so θ = 360° − 60° = 300° (or −60°).'},
  {lvl:'honors',instant:true,q:'Your Python code says math.cos(90) and gets −0.448, not 0. Why?',choices:['Python’s math.cos expects radians, so 90 means 90 radians','Python rounds badly','cos 90° really is −0.448','The arm length is missing'],correct:0,explain:'math.cos takes radians. 90 radians is about 14.3 full turns plus 116.6°, where the cosine is −0.448. Write math.cos(math.radians(90)) or math.cos(math.pi/2), which gives 0 (up to rounding).'},
  {lvl:'honors',kind:'num',q:'Convert 225° to radians, to two decimal places.',answer:3.93,tol:0.01,unit:'rad',d:2,hint:'Multiply degrees by π/180.',explain:'225 × π/180 = 5π/4 ≈ 3.93 radians.'},
  {lvl:'ap',instant:true,q:'Plain arctangent gives tan⁻¹(43.3 ÷ −25.0) = −60°. The piece is at (−25.0, 43.3). What angle is right, and why?',choices:['120°: tan⁻¹ only returns −90° to 90°, so add 180° when x is negative','−60°: the calculator is always right','60°: drop the negative sign','240°: add 300°'],correct:0,explain:'tan θ = y/x can’t tell (−25, 43.3) from (25, −43.3): both give −1.732. Arctangent returns an angle between −90° and 90°, which is the right half of the circle. For x < 0, add 180°: −60° + 180° = 120°. atan2(y, x) does this for you.'},
  {lvl:'ap',kind:'num',q:'A 50 cm arm swings from 0° to 120°. How far does the gripper travel along its circle, in cm?',answer:104.72,tol:0.5,unit:'cm',d:1,hint:'Arc length s = rθ, with θ in radians.',explain:'120° = 2π/3 radians, so s = 50 × 2π/3 ≈ 104.7 cm. Radians make arc length simple: s = rθ.'}
 ],
 tour:[
  {title:'Standard position',text:'Angles start at straight ahead (0°) and turn counterclockwise: straight up is 90°, straight back 180°, straight down 270°. Watch the arm at 50°.',pause:true,setup:sim=>{sim.tst=1;sim.st.tgt=120;BioLab.setValues(sim,{guess:50,rad:false,unwrap:false});}},
  {title:'Shrink the circle to radius 1',text:'The gripper always stays on a circle around the shoulder. Divide every length by the arm length and that circle becomes the unit circle, radius 1. The point at angle θ is (cos θ, sin θ).',pause:true,setup:sim=>{sim.tst=2;BioLab.setValues(sim,{guess:50});}},
  {title:'cos θ is x, sin θ is y',text:'Drop lines from the point to the axes. The horizontal distance is cos θ, the vertical one is sin θ. Multiply by the arm length to get the gripper’s position in cm: x = L cos θ, y = L sin θ.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{guess:50});}},
  {title:'Special angles',text:'At 30°, 45° and 60° the triangle inside the circle is a 30-60-90 or a 45-45-90 triangle, so the coordinates are exact: 60° gives (1/2, √3/2), 45° gives (√2/2, √2/2), 30° gives (√3/2, 1/2).',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{guess:60});}},
  {title:'The other quadrants',text:'Past 90° the same triangles repeat, flipped. 120° has the same 60° triangle as 60°, but behind the shoulder, so cos is negative: (−1/2, √3/2). The 60° is the reference angle; the quadrant sets the signs.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{guess:120});}},
  {title:'Back to the game piece',text:'The piece is at (−25.0, 43.3) cm and the arm is 50 cm: on the unit circle, (−0.5, 0.866). Reference angle 60°, behind and above: quadrant II. So θ = 180° − 60° = 120°.',pause:true,setup:sim=>{sim.tst=6;sim.st.tgt=120;BioLab.setValues(sim,{guess:120});}},
  {lvl:'honors',title:'Radians',text:'A radian is the angle that sweeps an arc as long as the radius. Half a turn sweeps π radii, so 180° = π radians and 120° = 2π/3 ≈ 2.09. On an arm of length L, the gripper travels s = Lθ.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{guess:120,rad:true});}},
  {lvl:'honors',title:'Tangent is the slope',text:'tan θ = sin θ ÷ cos θ = y ÷ x: the slope of the arm. At 120° it is (√3/2) ÷ (−1/2) = −√3. At 90° x = 0, so the tangent is undefined: a vertical arm has no slope.',pause:true,setup:sim=>{sim.tst=8;BioLab.setValues(sim,{guess:120,rad:true});}},
  {lvl:'ap',title:'Unroll the circle',text:'Spread the angles out along a line. The height of the point traces y = sin θ and its horizontal position traces y = cos θ, each repeating every 2π. These are the sine and cosine functions.',pause:true,setup:sim=>{sim.tst=9;BioLab.setValues(sim,{guess:120,rad:true});}}
 ],
 onTourExit(sim){sim.tst=0;},
 lab:{bio:'<p><b>Question:</b> How do the signs of x and y tell you where the arm points?</p><ol><li>Set the arm to 30°, 120°, 210° and 300°, and record a trial at each.</li><li>For each one, write the signs of the gripper’s x and y.</li></ol><p>Write one sentence for each quadrant: which signs go with in front, behind, above and below?</p>',
  honors:'<p><b>Question:</b> Do angles with the same reference angle share coordinates?</p><ol><li>Turn on <b>Show radians</b>. Record trials at 45°, 135°, 225° and 315°.</li><li>Compare cos θ and sin θ in each.</li></ol><p>Explain the pattern with reference angles and quadrant signs, and give each angle in radians.</p>',
  ap:'<p><b>Question:</b> How do the unit circle and the sine graph show the same thing?</p><ol><li>Turn on <b>Unroll the circle</b>. Move the arm from 0° to 359° and watch the point on each graph.</li><li>Record sin θ at 30°, 150°, 210° and 330°.</li></ol><p><b>CER:</b> Use symmetry on the circle to explain why sin 30° = sin 150° and sin 210° = −sin 30°.</p>'},
 terms:[
  {t:'Standard position',d:'An angle measured from the positive x-axis (straight ahead), counterclockwise.'},
  {t:'Unit circle',d:'A circle of radius 1 centered at the origin. The point at angle θ is (cos θ, sin θ).'},
  {t:'Cosine and sine',d:'cos θ is the x-coordinate and sin θ the y-coordinate of the point at angle θ on the unit circle.'},
  {t:'Quadrant',d:'One of the four quarters made by the axes, numbered I to IV counterclockwise from the upper right.'},
  {t:'Reference angle',d:'The acute angle between the terminal side and the x-axis; it sets the size of cos and sin, and the quadrant sets their signs.',lvl:'honors'},
  {t:'Radian',d:'The angle that sweeps an arc as long as the radius. 180° = π radians.',lvl:'honors'},
  {t:'Tangent',d:'tan θ = sin θ ÷ cos θ: the slope of the line from the origin to the point.',lvl:'honors'},
  {t:'atan2',d:'A function that returns the angle of the point (x, y) in the correct quadrant, unlike plain arctangent.',lvl:'ap'}
 ],
 about:'<p><b>Model:</b> a rigid arm of length L pivots at the shoulder. At angle θ (counterclockwise from straight ahead) the gripper is at x = L cos θ, y = L sin θ, measured from the shoulder in cm. The miss is the straight-line distance from the gripper to the center of the game piece.</p><p>Game pieces sit on the arm’s circle at special angles (multiples of 30° and 45°), skipping straight ahead and straight down. A real arm also has joint limits, a wrist and gravity to hold against; those are left out.</p>'
};

function newTarget(sim){const cur=sim.st.tgt;let d=cur;while(d===cur)d=ANG[Math.floor(Math.random()*ANG.length)];sim.st.tgt=d;clearGut(sim);}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

function drawCircle(sim,ctx,k,stg){const p=sim.p,hon=atLeast('honors'),deg=p.guess,a=deg*R,c=Math.cos(a),s=Math.sin(a),X=v=>U.x+v*U.r,Y=v=>U.y-v*U.r,showRad=hon&&(p.rad||stg===7||stg===8);
  const all=stg===99,lay=n=>all||stg>=n,isNew=n=>stg===n;
  txt(ctx,'The unit circle (radius 1)',U.x,28,{s:14*Math.min(k,1.5),w:700,a:'center'});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(-1.18),U.y);ctx.lineTo(X(1.18),U.y);ctx.moveTo(U.x,Y(1.18));ctx.lineTo(U.x,Y(-1.18));ctx.stroke();
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(U.x,U.y,U.r,0,7);ctx.stroke();
  [[1,0,'1'],[-1,0,'−1'],[0,1,'1'],[0,-1,'−1']].forEach(([x,y,l])=>txt(ctx,l,X(x)+(x>0?8:x<0?-8:8),Y(y)+(y>0?-4:y<0?14:16),{s:11.5*k,c:PAL['cv-soft'],a:x<0?'right':'left'}));
  if(isNew(2)){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(U.x,U.y,U.r+6,0,7);ctx.stroke();}
  // special-angle ticks
  if(lay(4)){[0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330].forEach(d=>{const t=d*R,x1=X(Math.cos(t)*0.95),y1=Y(Math.sin(t)*0.95),x2=X(Math.cos(t)*1.05),y2=Y(Math.sin(t)*1.05);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
     if(k<1.4||d%90===0)txt(ctx,showRad?(RADN[d]||''):d+'°',X(Math.cos(t)*1.2),Y(Math.sin(t)*1.2)+4,{s:10.5*k,c:PAL['cv-soft'],a:'center'});});}
  // quadrant signs
  if(lay(5)&&(hon||!all)){[[0.42,0.4,'I','(+, +)'],[-0.42,0.4,'II','(−, +)'],[-0.42,-0.4,'III','(−, −)'],[0.42,-0.4,'IV','(+, −)']].forEach(([x,y,n,sg])=>{txt(ctx,n,X(x),Y(y)-6,{s:13*k,w:700,a:'center',c:PAL['cv-soft']});txt(ctx,sg,X(x),Y(y)+10,{s:11*k,a:'center',c:PAL['cv-soft']});});
    if(isNew(5)){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.strokeRect(X(-1)+6,Y(1)+6,U.r-12,U.r-12);}}
  // target on the unit circle (hollow)
  const [tx,ty]=tgtXY(sim),L=Lof(sim);ctx.strokeStyle='#a86a00';ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(tx/L),Y(ty/L),8,0,7);ctx.stroke();
  // radian arc
  if(showRad&&lay(7)){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=6;ctx.globalAlpha=0.7;ctx.beginPath();ctx.arc(U.x,U.y,U.r,0,-a,true);ctx.stroke();ctx.globalAlpha=1;
    txt(ctx,'arc = '+radTxt(deg)+' (radius lengths)',U.x,Y(-1)+30,{s:12*k,w:700,a:'center',c:PAL['s5']});}
  // the point and its projections
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(U.x,U.y);ctx.lineTo(X(c),Y(s));ctx.stroke();
  if(lay(3)){ctx.lineWidth=4;ctx.strokeStyle=PAL['s2'];ctx.beginPath();ctx.moveTo(U.x,Y(s));ctx.lineTo(X(c),Y(s));ctx.stroke();ctx.strokeStyle=PAL['s3'];ctx.beginPath();ctx.moveTo(X(c),U.y);ctx.lineTo(X(c),Y(s));ctx.stroke();
    const ex=exact(deg),cs=ex&&lay(4)?ex[0]+(ex[0].includes('√')?' ≈ '+neg(f2(c)):''):neg(f2(c)),sn=ex&&lay(4)?ex[1]+(ex[1].includes('√')?' ≈ '+neg(f2(s)):''):neg(f2(s));
    txt(ctx,'cos θ = '+cs,X(c/2),Y(s)+(s>=0.25?20:s>=0?-10:-10),{s:12.5*k,w:700,a:'center',c:PAL['s2']});
    txt(ctx,'sin θ = '+sn,X(c)+(c>=0?-10:10),Y(s/2)+4,{s:12.5*k,w:700,a:c>=0?'right':'left',c:PAL['s3']});
    if(isNew(3)){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.strokeRect(Math.min(U.x,X(c))-6,Math.min(U.y,Y(s))-6,Math.abs(X(c)-U.x)+12,Math.abs(Y(s)-U.y)+12);ctx.setLineDash([]);}}
  // reference angle wedge
  if(lay(5)&&!all||(all&&hon)){const r=refAng(deg),q=quad(deg),base=q==='I'?0:q==='II'?180:q==='III'?180:360;if(r>1&&r<89){ctx.fillStyle='rgba(123,63,228,0.18)';ctx.beginPath();ctx.moveTo(U.x,U.y);ctx.arc(U.x,U.y,40,-base*R,-deg*R,deg>base);ctx.closePath();ctx.fill();
      const mid=(base+deg)/2*R;txt(ctx,'ref '+f0(r)+'°',U.x+60*Math.cos(mid),U.y-60*Math.sin(mid)+4,{s:11*k,w:700,a:'center',c:PAL['s5']});}}
  // tangent
  if(hon&&(stg===8)&&Math.abs(c)>0.05){const t=s/c;txt(ctx,'tan θ = y ÷ x = '+neg(f2(t))+(Math.abs(Math.abs(t)-Math.sqrt(3))<0.01?' = '+(t<0?'−':'')+'√3':''),U.x+U.r+40,52,{s:12.5*k,w:700,a:'right',c:PAL['rj']});
    ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X(-1.15*Math.sign(c)*0),Y(0));ctx.lineTo(X(c*1.2),Y(s*1.2));ctx.stroke();ctx.setLineDash([]);}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(c),Y(s),7,0,7);ctx.fill();
  txt(ctx,'● your arm   ○ the piece',U.x,Y(-1)+(showRad&&lay(7)?50:32),{s:11*k,c:PAL['cv-soft'],a:'center'});}

function drawUnwrap(sim,ctx,k){const p=sim.p,deg=p.guess,a=deg*R,cx=478,cy=110,r=52,GX0=440,GX1=785,X=d=>GX0+(d/360)*(GX1-GX0);
  txt(ctx,'Unrolled: y = sin θ and y = cos θ',612,26,{s:13.5*Math.min(k,1.5),w:700,a:'center'});
  // small circle
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.stroke();ctx.strokeStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(cx-r-6,cy);ctx.lineTo(cx+r+6,cy);ctx.moveTo(cx,cy-r-6);ctx.lineTo(cx,cy+r+6);ctx.stroke();
  const px=cx+r*Math.cos(a),py=cy-r*Math.sin(a);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.stroke();ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(px,py,5,0,7);ctx.fill();
  // graphs
  const graph=(top,fn,col,lab)=>{const mid=top+55,A=45,Y=v=>mid-v*A;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(GX0,mid);ctx.lineTo(GX1,mid);ctx.stroke();
    [0,90,180,270,360].forEach(d=>{ctx.beginPath();ctx.moveTo(X(d),mid-A-4);ctx.lineTo(X(d),mid+A+4);ctx.stroke();txt(ctx,p.rad?(RADN[d]||''):d+'°',X(d),mid+A+16,{s:10.5*k,c:PAL['cv-soft'],a:'center'});});
    txt(ctx,'1',GX0-6,Y(1)+4,{s:10.5*k,c:PAL['cv-soft'],a:'right'});txt(ctx,'−1',GX0-6,Y(-1)+4,{s:10.5*k,c:PAL['cv-soft'],a:'right'});
    ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let d=0;d<=360;d+=3){const y=Y(fn(d*R));d?ctx.lineTo(X(d),y):ctx.moveTo(X(d),y);}ctx.stroke();
    ctx.strokeStyle=col;ctx.lineWidth=5;ctx.globalAlpha=0.35;ctx.beginPath();for(let d=0;d<=deg;d+=3){const y=Y(fn(d*R));d?ctx.lineTo(X(d),y):ctx.moveTo(X(d),y);}ctx.stroke();ctx.globalAlpha=1;
    ctx.fillStyle=col;ctx.beginPath();ctx.arc(X(deg),Y(fn(a)),6,0,7);ctx.fill();txt(ctx,lab+' = '+neg(f2(fn(a))),GX1,top+6,{s:12*k,w:700,a:'right',c:col});return Y;};
  const Ys=graph(150,Math.sin,PAL['s3'],'sin θ');graph(285,Math.cos,PAL['s2'],'cos θ');
  ctx.setLineDash([4,4]);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(X(deg),Ys(Math.sin(a)));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'period 360° = 2π',GX1,438,{s:11*k,c:PAL['cv-soft'],a:'right'});}

BioLab.register(SIM);
})();
