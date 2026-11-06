(function(){
'use strict';
const {clamp,txt,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* Complex-number rotations: a robot arm's gripper sits at z on the complex plane (base at the origin, 1 square = 10 cm).
   The controller moves it with one multiplication: z -> z*w. Lengths multiply, angles add. */
const CM=10;                                   /* cm per grid square */
const PRE={i:[0,1],mi:[0,-1],'1i':[1,1],m1:[-1,0]};
const keyOf=(c,d)=>{for(const k in PRE)if(PRE[k][0]===c&&PRE[k][1]===d)return k;return 'custom';};
const mul=(a,b,c,d)=>[a*c-b*d,a*d+b*c];
const mod=(a,b)=>Math.hypot(a,b);
const argD=(a,b)=>{if(Math.abs(a)<1e-12&&Math.abs(b)<1e-12)return 0;let t=Math.atan2(b,a)*180/Math.PI;if(t<=-180+1e-9)t+=360;return t;};
const arg360=(a,b)=>{let t=argD(a,b);if(t<0)t+=360;return t;};
const W=sim=>[sim.p.wc,sim.p.wd];
const target=sim=>mul(sim.p.za,sim.p.zb,sim.p.wc,sim.p.wd);
const miss=sim=>{const t=target(sim);return mod(sim.p.gx-t[0],sim.p.gy-t[1])*CM;};
const scKey=sim=>[sim.p.za,sim.p.zb,sim.p.wc,sim.p.wd].join(',');
const tr=x=>{const r=Math.round(x*100)/100;return (Math.abs(r)<1e-9?0:r).toString();};
const neg=s=>s.replace('-','−');
/* 2 + 4i, −1 + 3i, 3i, −i, 1 − 0.5i */
function fmtC(a,b){a=Math.round(a*100)/100;b=Math.round(b*100)/100;if(Math.abs(a)<1e-9)a=0;if(Math.abs(b)<1e-9)b=0;
  const im=v=>Math.abs(v)===1?'i':tr(Math.abs(v))+'i';
  if(b===0)return neg(tr(a));if(a===0)return (b<0?'−':'')+im(b);return neg(tr(a))+(b<0?' − ':' + ')+im(b);}
const wName=sim=>{const [c,d]=W(sim);const s=fmtC(c,d);return /[ ]/.test(s)?'('+s+')':s;};
const f1=v=>fmtNum(v,1),f0=v=>fmtNum(v,0);
/* plane geometry: square plot at the left of the stage */
const CX=232,CY=225,HP=206;
function range(sim){const z=mod(sim.p.za,sim.p.zb),t=target(sim);const m=Math.max(z,mod(t[0],t[1]));return clamp(Math.ceil(m+1.2),5,13);}
const geo=sim=>{const R=range(sim),s=HP/R;return {R,s,X:x=>CX+x*s,Y:y=>CY-y*s};};

const SIM={
 id:'rotations',hash:'rotations',apUnit:6,order:3,tab:'Rotating with complex numbers',kind:'Simulation',
 card:'Program your robotics team’s arm: guess where the gripper lands when the controller multiplies by i or 1 + i, then let polar form find the exact spot.',
 title:'Steering with complex numbers',
 lede:{bio:'A robot arm’s gripper sits at a point on a grid, written like 3 + i: 3 squares right of the base and 1 square up. The arm’s controller moves it with one multiplication. Multiply by i and the gripper swings a quarter turn counterclockwise around the base, staying the same distance away.',
  honors:'Multiplying by a complex number w does two things at once: it stretches every distance from the origin by |w| and turns every point by w’s angle. For 1 + i, that is a stretch of √2 ≈ 1.41 and a turn of 45°.',
  ap:'In polar form, r₁(cos θ₁ + i sin θ₁) · r₂(cos θ₂ + i sin θ₂) = r₁r₂(cos(θ₁ + θ₂) + i sin(θ₁ + θ₂)). Moduli multiply and arguments add, so repeating a multiplication traces a spiral.'},
 scale:'Seen from above. The arm’s base is at the origin. One grid square is 10 cm.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The arm',
 controls:[
  {id:'za',label:'Gripper starts at: real part',type:'range',min:-4,max:4,step:1,def:3,noGut:true},
  {id:'zb',label:'Gripper starts at: imaginary part',type:'range',min:-4,max:4,step:1,def:1,noGut:true},
  {id:'w',label:'Command: multiply by',type:'seg',def:'1i',options:[{v:'i',l:'i'},{v:'mi',l:'−i'},{v:'1i',l:'1 + i'},{v:'m1',l:'−1'}],
   onChange(sim){const p=PRE[sim.p.w];if(p)BioLab.setValues(sim,{wc:p[0],wd:p[1]});}},
  {id:'wc',label:'Command w: real part',type:'range',min:-1.5,max:1.5,step:0.5,def:1,lvl:'honors',noGut:true,
   onChange(sim){sim.p.w=keyOf(sim.p.wc,sim.p.wd);if(sim.ui.ctl&&sim.ui.ctl.w)sim.ui.ctl.w.set(sim.p.w);}},
  {id:'wd',label:'Command w: imaginary part',type:'range',min:-1.5,max:1.5,step:0.5,def:1,lvl:'honors',noGut:true,
   onChange(sim){sim.p.w=keyOf(sim.p.wc,sim.p.wd);if(sim.ui.ctl&&sim.ui.ctl.w)sim.ui.ctl.w.set(sim.p.w);}},
  {id:'gx',label:'Your pick: real part',type:'range',min:-12,max:12,step:0.5,def:0,help:'Or click the plane.'},
  {id:'gy',label:'Your pick: imaginary part',type:'range',min:-12,max:12,step:0.5,def:0,help:' '},
  {id:'show',label:'Show where it lands',type:'toggle',def:false,lvl:'honors',help:'Draws z·w and the turn between z and z·w.'},
  {id:'spiral',label:'Repeat the command 6 times',type:'toggle',def:false,lvl:'ap',help:'Plots z, zw, zw², … zw⁶.'}
 ],
 onLevel(sim){const b=!atLeast('honors'),W=sim.ui.ctlW||{};
  const set=(id,l,h)=>{const w=W[id];if(!w)return;const L=w.querySelector('label');if(L)L.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('gx',b?'Your pick: squares right':'Your pick: real part',b?'Negative means left. Or click the grid.':'Or click the plane.');
  set('gy',b?'Your pick: squares up':'Your pick: imaginary part',b?'Negative means down.':'');},
 actions:[{id:'land',label:'Move my pick to z·w',lvl:'honors',run(sim){const t=target(sim);BioLab.setValues(sim,{gx:t[0],gy:t[1],show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'miss',label:'Your pick is off by',unit:'cm',d:0,min:0,max:120,get:miss},
  {id:'stretch',label:'Stretch |w|',unit:'×',d:2,lvl:'honors',min:0,max:2.2,get:sim=>mod(sim.p.wc,sim.p.wd)},
  {id:'turn',label:'Turn: angle of w',unit:'°',d:1,lvl:'honors',min:-180,max:180,get:sim=>argD(sim.p.wc,sim.p.wd)},
  {id:'zr',label:'Gripper reach |z|',unit:'cm',d:1,lvl:'ap',min:0,max:60,get:sim=>mod(sim.p.za,sim.p.zb)*CM},
  {id:'zt',label:'Gripper angle',unit:'°',d:1,lvl:'ap',min:0,max:360,get:sim=>arg360(sim.p.za,sim.p.zb)}
 ],
 draw(sim,ctx,vdt,k){const g=geo(sim),{R,s,X,Y}=g,p=sim.p,t=target(sim),G=sim.gutS;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(CX-HP,CY-HP,2*HP,2*HP);
  ctx.save();ctx.beginPath();ctx.rect(CX-HP,CY-HP,2*HP,2*HP);ctx.clip();
  /* grid: every square, with a tick label every 2 or 4 squares */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;
  for(let v=-R;v<=R;v++){ctx.beginPath();ctx.moveTo(X(v),CY-HP);ctx.lineTo(X(v),CY+HP);ctx.stroke();ctx.beginPath();ctx.moveTo(CX-HP,Y(v));ctx.lineTo(CX+HP,Y(v));ctx.stroke();}
  ctx.globalAlpha=1;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(CX-HP,CY);ctx.lineTo(CX+HP,CY);ctx.moveTo(CX,CY-HP);ctx.lineTo(CX,CY+HP);ctx.stroke();
  const tk=R<=6?2:4;for(let v=-R+1;v<R;v++){if(!v||v%tk)continue;txt(ctx,neg(String(v)),X(v),CY+15*k,{s:12*k,c:PAL['cv-soft'],a:'center'});txt(ctx,neg(String(v))+'i',CX-6,Y(v)+4*k,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  /* reach circle of z (honors) */
  const zr=mod(p.za,p.zb),tr2=mod(t[0],t[1]);
  if(atLeast('honors')){ctx.setLineDash([5,5]);ctx.strokeStyle=PAL['s2'];ctx.globalAlpha=.45;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(CX,CY,zr*s,0,7);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
  /* repeated command: z, zw, zw^2 ... */
  if(p.spiral&&atLeast('ap')){let a=p.za,b=p.zb;const pts=[[a,b]];for(let n=0;n<6;n++){[a,b]=mul(a,b,p.wc,p.wd);pts.push([a,b]);}
   ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();pts.forEach((q,i)=>{i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1]));});ctx.stroke();
   pts.forEach((q,i)=>{ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),4,0,7);ctx.fill();if(i>1&&Math.abs(q[0])<R-0.6&&Math.abs(q[1])<R-0.6)txt(ctx,'zw'+'⁰¹²³⁴⁵⁶'[i],X(q[0])+7,Y(q[1])-7,{s:12*k,w:700,c:PAL['s5']});});}
  /* landing spot (after the math, or with Show where it lands) */
  const shown=(G&&G.m&&G.m.key===scKey(sim))||p.show;
  if(shown){const th1=Math.atan2(p.zb,p.za),th2=Math.atan2(t[1],t[0]);let dth=argD(p.wc,p.wd)*Math.PI/180;
   const ar=Math.max(22,Math.min(zr,tr2)*s*0.45);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(CX,CY,ar,-th1,-(th1+dth),dth>0);ctx.stroke();
   ctx.setLineDash([7,5]);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(X(t[0]),Y(t[1]));ctx.stroke();ctx.setLineDash([]);
   ctx.beginPath();ctx.arc(X(t[0]),Y(t[1]),11,0,7);ctx.stroke();ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(X(t[0]),Y(t[1]),4,0,7);ctx.fill();
   const mid=th1+dth/2,lx=CX+Math.cos(mid)*(ar+16*k),ly=CY-Math.sin(mid)*(ar+16*k);
   if(atLeast('honors')&&Math.abs(dth)>0.05)txt(ctx,(dth>0?'+':'−')+f0(Math.abs(dth*180/Math.PI))+'°',lx,ly,{s:12*k,w:700,c:PAL['s3'],a:'center',b:'middle'});}
  /* arm */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(CX,CY);ctx.lineTo(X(p.za),Y(p.zb));ctx.stroke();ctx.lineCap='butt';
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(CX,CY,8,0,7);ctx.fill();
  /* gripper claws */
  const ang=Math.atan2(-(Y(p.zb)-CY),X(p.za)-CX);ctx.save();ctx.translate(X(p.za),Y(p.zb));ctx.rotate(-ang);ctx.strokeStyle=PAL['s2'];ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(8,-8);ctx.lineTo(16,-6);ctx.moveTo(0,0);ctx.lineTo(8,8);ctx.lineTo(16,6);ctx.stroke();ctx.restore();
  /* gut marker */
  if(G&&G.g&&G.g.key===scKey(sim)&&(Math.abs(G.g.x-p.gx)>0.01||Math.abs(G.g.y-p.gy)>0.01)){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(G.g.x),Y(G.g.y),10,0,7);ctx.stroke();}
  /* your pick crosshair */
  const px=X(clamp(p.gx,-R,R)),py=Y(clamp(p.gy,-R,R));ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(px-12,py);ctx.lineTo(px+12,py);ctx.moveTo(px,py-12);ctx.lineTo(px,py+12);ctx.stroke();ctx.beginPath();ctx.arc(px,py,7,0,7);ctx.stroke();
  ctx.restore();
  /* labels outside the clip so they never vanish; nudge them away from each other */
  const lab=[];const put=(text,x,y,col,wt)=>{x=clamp(x,CX-HP+4,CX+HP-4);y=clamp(y,CY-HP+16*k,CY+HP-6);for(const q of lab){if(Math.abs(q[1]-y)<15*k&&Math.abs(q[0]-x)<110)y=q[1]+(y>=q[1]?16*k:-16*k);}lab.push([x,y]);
   ctx.font=(wt||700)+' '+(12*k)+'px '+FONT;const w=ctx.measureText(text).width;const xx=clamp(x,CX-HP+4,CX+HP-4-w);txt(ctx,text,xx,y,{s:12*k,w:wt||700,c:col});};
  put('Real',CX+HP-40*k,CY-6,PAL['cv-soft'],400);put('Imaginary',CX+6,CY-HP+14*k,PAL['cv-soft'],400);
  const out=(a,b,d)=>{const m=mod(a,b)||1;return [X(a)+a/m*d,Y(b)-b/m*d];};
  let q=out(p.za,p.zb,16);put(atLeast('honors')?'Gripper z':'Gripper',q[0]-(p.za<0?70:0),q[1]+(p.zb<0?12:0),PAL['s2']);
  if(shown){q=out(t[0],t[1],18);put('Lands here',q[0]-(t[0]<0?72:0),q[1]+(t[1]<0?12:0),PAL['s3']);}
  if(G&&G.g&&G.g.key===scKey(sim)&&(Math.abs(G.g.x-p.gx)>0.01||Math.abs(G.g.y-p.gy)>0.01))put('Your gut',X(G.g.x)+13,Y(G.g.y)+(Math.abs(G.g.y)<1.2?-12:18*k),PAL['s4']);
  put(G&&G.m&&G.m.key===scKey(sim)&&miss(sim)<0.01?'The math':'Your pick',px+13,py+(Math.abs(p.gy)<1.2?-12:18*k),PAL['rj']);
  /* right-hand panel */
  const x0=456;let y=34+16*k;const line=(a,b,col)=>{txt(ctx,a,x0,y,{s:16*k,w:700,c:col||PAL['cv-ink']});if(b)txt(ctx,b,x0,y+18*k,{s:13*k,c:PAL['cv-soft']});y+=(b?46:30)*k;};
  const B=!atLeast('honors');
  line((B?'Gripper: ':'z = ')+fmtC(p.za,p.zb),atLeast('honors')?'reach '+f1(zr*CM)+' cm, angle '+f1(arg360(p.za,p.zb))+'°':'where the gripper is now',PAL['s2']);
  line((B?'Command: × ':'× w = ')+(B?wName(sim):fmtC(p.wc,p.wd)),atLeast('honors')?'stretch '+fmtNum(mod(p.wc,p.wd),2)+'×, turn '+neg(f1(argD(p.wc,p.wd)))+'°':(p.w==='i'?'a quarter turn counterclockwise':p.w==='mi'?'a quarter turn clockwise':p.w==='m1'?'a half turn':'turn and stretch'));
  if(shown)line((B?'Lands at: ':'z·w = ')+fmtC(t[0],t[1]),atLeast('honors')?'reach '+f1(tr2*CM)+' cm, angle '+f1(arg360(t[0],t[1]))+'°':'where it lands',PAL['s3']);
  else line(B?'Lands at: ?':'z·w = ?','lock in your gut first',PAL['cv-soft']);
  line('Your pick: '+fmtC(p.gx,p.gy),null,PAL['rj']);
  if(atLeast('honors'))txt(ctx,'Lengths multiply. Angles add.',x0,Math.min(440,y),{s:13*k,w:700,c:PAL['cv-soft']});},
 onClick(sim,x,y){const g=geo(sim);if(Math.abs(x-CX)>HP||Math.abs(y-CY)>HP)return;const r=v=>clamp(Math.round(v*2)/2,-12,12);BioLab.setValues(sim,{gx:r((x-CX)/g.s),gy:r((CY-y)/g.s)});},
 narrate(sim){const p=sim.p,t=target(sim),m=miss(sim),zr=mod(p.za,p.zb),wr=mod(p.wc,p.wd),wa=argD(p.wc,p.wd);
  if(wr<1e-9)return 'Multiplying by 0 sends every point to the base. <b>A command of 0 has no turn and no length</b>, so the gripper collapses onto the origin.';
  if(m<0.01)return `<b>Your pick is exactly z·w = ${fmtC(t[0],t[1])}.</b> The reach went from ${f1(zr*CM)} cm to ${f1(zr*wr*CM)} cm (×${fmtNum(wr,2)}), and the angle turned ${neg(f1(wa))}°.`;
  if(!atLeast('honors')){if(p.w==='i')return `Multiplying by i turns the gripper <b>90° counterclockwise</b> around the base and keeps it ${f1(zr*CM)} cm away. Where does ${fmtC(p.za,p.zb)} end up?`;
   if(p.w==='mi')return `Multiplying by −i turns the gripper <b>90° clockwise</b> and keeps it ${f1(zr*CM)} cm away.`;
   if(p.w==='m1')return `Multiplying by −1 turns the gripper <b>halfway around</b>, to the opposite side of the base.`;
   if(!(sim.gutS&&sim.gutS.g)&&!p.show)return `Multiplying by ${wName(sim)} moves the gripper to a new spot around the base. Where does ${fmtC(p.za,p.zb)} end up? Lock in your pick to see.`;
   return `Multiplying by 1 + i <b>turns the gripper and stretches the arm</b>. Your pick is ${f0(m)} cm from where it really lands.`;}
  return `w = ${fmtC(p.wc,p.wd)} stretches by <b>${fmtNum(wr,2)}×</b> and turns by <b>${neg(f1(wa))}°</b>, so the gripper should land ${f1(zr*wr*CM)} cm from the base. Your pick is ${f0(m)} cm away from that spot.`;},
 gut:{better:'lower',
  controls:['gx','gy'],
  ask:{bio:'Click the grid where you think the gripper lands after the command, or set the two sliders here. The red crosshair marks your pick. Go by feel, then lock it in.',honors:'Without multiplying it out: where does z·w land? Click the plane or set your pick with the sliders here, then lock it in.'},
  lock(sim){const z=Math.abs(sim.p.gx)<1e-9&&Math.abs(sim.p.gy)<1e-9;return {v:miss(sim),x:sim.p.gx,y:sim.p.gy,key:scKey(sim),label:fmtC(sim.p.gx,sim.p.gy)+(z?', still on the base':'')};},
  solve(sim){const t=target(sim);sim.p.gx=t[0];sim.p.gy=t[1];if(atLeast('honors'))sim.p.show=true;return {v:miss(sim),x:t[0],y:t[1],key:scKey(sim),label:(atLeast('honors')?'z·w = ':'lands at ')+fmtC(t[0],t[1])};},
  how:{bio:'Multiply it out like any two binomials, then use i² = −1. For (3 + i)(1 + i): 3 + 3i + i + i² = 3 + 4i − 1 = 2 + 4i.',
   honors:'Polar form: |w| tells the stretch and w’s angle tells the turn. The gripper’s reach is multiplied by |w| and its angle grows by w’s angle. Multiplying out with i² = −1 lands on the same point.'},
  compare(sim,g,m){const p=sim.p,t=[m.x,m.y],gm=mod(g.x,g.y),tm=mod(t[0],t[1]);
   const reach=Math.abs(gm-tm)*CM;let da=Math.abs(arg360(g.x,g.y)-arg360(t[0],t[1]));if(da>180)da=360-da;
   if(g.v<0.01)return `Your gut was right on: you put the gripper exactly at ${fmtC(t[0],t[1])}. You already think of multiplying as turning and stretching. The math explains why that works.`;
   const tail=gm<1e-9?'You left your pick on the base, so the angle was anyone’s guess.':`Your angle was off by <b>${f0(da)}°</b> and your reach by <b>${f0(reach)} cm</b>.`;
   if(g.v<=5.01)return `Close. Your gut put the gripper <b>${f0(g.v)} cm</b> from the target, and the math puts it exactly on it. ${tail}`;
   return `Your gut put the gripper <b>${f0(g.v)} cm</b> from where it really lands: the arm would close on empty air. The math lands it exactly on ${fmtC(t[0],t[1])}, 0 cm off. ${tail}`;},
  again(sim){let a,b;do{a=Math.round(Math.random()*8)-4;b=Math.round(Math.random()*8)-4;}while(mod(a,b)<2);
   let c,d;if(atLeast('honors')&&Math.random()<0.6){do{c=(Math.round(Math.random()*6)-3)/2;d=(Math.round(Math.random()*6)-3)/2;}while(mod(c,d)<0.7||(c===1&&d===0));}
   else{const ks=['i','1i','mi','m1','1i'];const kk=ks[Math.floor(Math.random()*ks.length)];[c,d]=PRE[kk];}
   Object.assign(sim.p,{za:a,zb:b,wc:c,wd:d,w:keyOf(c,d),gx:0,gy:0,show:false});}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The gripper is at 3 (straight out to the right, 30 cm from the base). The controller multiplies by i. Where does the gripper go?',choices:['3 + i: it moves up one square','3i: straight up, still 30 cm away','−3: straight to the left','It stays at 3'],correct:1,explain:'3 · i = 3i. Multiplying by i turns a point 90° counterclockwise around the base and keeps its distance. Adding i would slide it up one square; multiplying turns it.'},
  {lvl:'bio',instant:true,q:'The controller multiplies by i, then by i again. Which single command does the same thing?',choices:['Multiply by 2i','Multiply by −1','Multiply by 1, so nothing changes'],correct:1,explain:'i · i = i² = −1. Two quarter turns make a half turn, so the gripper ends up on the opposite side of the base, the same distance away.'},
  {lvl:'honors',instant:true,q:'The controller multiplies by 1 + i. What happens to the gripper’s distance from the base?',choices:['It stays the same','It grows by one square (10 cm)','It is multiplied by √2, about 1.41','It doubles'],correct:2,explain:'|1 + i| = √(1² + 1²) = √2 ≈ 1.41. Multiplying by w multiplies every distance from the base by |w| and turns every point by w’s angle, which is 45° here. A gripper 31.6 cm out ends up 44.7 cm out.'},
  {lvl:'honors',instant:true,q:'The gripper is at 2 + i. The command is multiply by 1 + i. Where does it land?',choices:['3 + 2i','1 + 3i','2 + i','3 + i'],correct:1,explain:'(2 + i)(1 + i) = 2 + 2i + i + i² = 2 + 3i − 1 = 1 + 3i. Check with polar form: the reach goes from √5 ≈ 2.24 to √10 ≈ 3.16 squares (×√2), and the angle goes from 26.6° to 71.6° (+45°).'},
  {lvl:'ap',instant:true,q:'z = 4(cos 30° + i sin 30°) and w = 0.5(cos 120° + i sin 120°). What is z·w?',choices:['2(cos 150° + i sin 150°)','4.5(cos 150° + i sin 150°)','2(cos 90° + i sin 90°)','8(cos 150° + i sin 150°)'],correct:0,explain:'Moduli multiply: 4 × 0.5 = 2. Arguments add: 30° + 120° = 150°. So z·w = 2(cos 150° + i sin 150°) ≈ −1.73 + i.'},
  {lvl:'ap',instant:true,q:'The controller repeats “multiply by 1 + i” eight times. What does that do to a point?',choices:['Multiplies it by 16','Multiplies it by 8i','Multiplies it by −16','Multiplies it by 16i'],correct:0,explain:'(1 + i)⁸ has modulus (√2)⁸ = 16 and argument 8 × 45° = 360°, a full turn. So it is just 16: the point ends up 16 times as far out, in its starting direction. Turn on the spiral to watch the first six steps.'}
 ],
 tour:[
  {title:'The arm on the complex plane',text:'The robot arm’s base is at the origin. Its gripper is at z = 3 + i: three squares right and one square up. Each square is 10 cm, so the gripper is about 31.6 cm from the base.',focus:[[CX-HP,CY-HP,2*HP,2*HP]],pause:true,setup:sim=>BioLab.setValues(sim,{za:3,zb:1,w:'i',wc:0,wd:1,gx:0,gy:0,show:false,spiral:false})},
  {title:'Multiply by i',text:'The controller multiplies by i: (3 + i) · i = 3i + i² = −1 + 3i. The green spot shows where it lands. Same distance from the base, turned a quarter turn (90°) counterclockwise.',pause:true,setup:sim=>BioLab.setValues(sim,{w:'i',wc:0,wd:1,gx:-1,gy:3,show:true})},
  {title:'Twice makes a half turn',text:'Multiply by i twice and the gripper turns 180°. That is the same as multiplying by −1, which is why i² = −1. Here the command is −1: 3 + i goes to −3 − i.',pause:true,setup:sim=>BioLab.setValues(sim,{w:'m1',wc:-1,wd:0,gx:-3,gy:-1,show:true})},
  {title:'Multiply by 1 + i',text:'Now multiply by 1 + i: (3 + i)(1 + i) = 3 + 3i + i + i² = 2 + 4i. This time the gripper turned 45° and the arm got longer.',pause:true,setup:sim=>BioLab.setValues(sim,{w:'1i',wc:1,wd:1,gx:2,gy:4,show:true})},
  {lvl:'honors',title:'Lengths multiply, angles add',text:'|1 + i| = √2 ≈ 1.41 and its angle is 45°. The gripper’s reach went from 31.6 cm to 44.7 cm (×1.41), and its angle went from 18.4° to 63.4° (+45°). Every complex multiplication works this way.',focus:[[450,20,345,250]],pause:true},
  {lvl:'ap',title:'Polar form and repeats',text:'With z = r₁(cos θ₁ + i sin θ₁) and w = r₂(cos θ₂ + i sin θ₂), z·w = r₁r₂(cos(θ₁ + θ₂) + i sin(θ₁ + θ₂)). Repeat the command and the points spiral out: zwⁿ has reach r₁r₂ⁿ and angle θ₁ + nθ₂.',pause:true,setup:sim=>BioLab.setValues(sim,{za:1,zb:0,w:'1i',wc:1,wd:1,gx:1,gy:1,show:true,spiral:true})},
  {title:'Your turn',text:'Close this walkthrough and try the Gut vs. math box at the top: guess where the gripper lands, then let the math take its turn.',pause:true,setup:sim=>BioLab.setValues(sim,{za:3,zb:1,w:'1i',wc:1,wd:1,gx:0,gy:0,show:false,spiral:false})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{spiral:false});},
 lab:{bio:'<p><b>Question:</b> What does multiplying by i do to any point?</p><ol><li>Choose the command <b>i</b>. Put the gripper at 3 + i and predict where it lands. Record a trial with your pick on the answer (the miss reads 0 cm).</li><li>Repeat for 2 − 3i, −4 + 1i and one point of your own.</li><li>Compare each starting point with its landing point.</li></ol><p>Write one sentence: what pattern turns a + bi into its landing spot?</p>',
  honors:'<p><b>Question:</b> How do |w| and w’s angle predict where z·w lands?</p><ol><li>Pick four commands with different stretches and turns.</li><li>For each, predict the landing reach (|z|·|w|) and angle, then check with <b>Show where it lands</b>.</li><li>Record each trial.</li></ol><p>Explain why |z·w| = |z|·|w|.</p>',
  ap:'<p><b>Question:</b> When does repeating a command close into a loop instead of a spiral?</p><ol><li>Turn on <b>Repeat the command</b>. Try commands with |w| = 1, |w| &lt; 1 and |w| &gt; 1.</li><li>Find a command that returns to the start after exactly 4 steps.</li></ol><p><b>CER:</b> Use polar form to explain what |w| and w’s angle must be for wⁿ = 1.</p>'},
 terms:[
  {t:'Complex plane',d:'A plane where the point a + bi sits a units along the real (horizontal) axis and b units along the imaginary (vertical) axis.'},
  {t:'i',d:'The number with i² = −1. Multiplying by i turns a point 90° counterclockwise about the origin.'},
  {t:'Modulus |z|',d:'The distance from the origin to z: |a + bi| = √(a² + b²).',lvl:'honors'},
  {t:'Argument',d:'The angle from the positive real axis to z, measured counterclockwise.',lvl:'honors'},
  {t:'Polar form',d:'z = r(cos θ + i sin θ), with r = |z| and θ the argument. Products multiply the r’s and add the θ’s.',lvl:'ap'},
  {t:'De Moivre’s theorem',d:'[r(cos θ + i sin θ)]ⁿ = rⁿ(cos nθ + i sin nθ).',lvl:'ap'}
 ],
 about:'<p>The gripper’s position is the complex number z = a + bi, with the arm’s base at the origin and one grid square = 10 cm. The command multiplies the position by w = c + di: z·w = (ac − bd) + (ad + bc)i. Its distance from the base becomes |z|·|w| and its angle becomes arg z + arg w.</p><p><b>Simplified:</b> a real arm has joints, reach limits and a vertical axis. Here the arm is a single segment that can stretch and swing about the base, which is exactly what one complex multiplication does. “Off by” is the straight-line distance from your pick to the true landing spot.</p>'
};
BioLab.register(SIM);
})();
