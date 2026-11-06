(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,bars,atLeast,fmtNum}=BioLab.h;
const f1=v=>fmtNum(v,1),fx=v=>String(+(+v).toFixed(1));
const RAD=Math.PI/180,LEN=18;
/* Typical aisle widths (ft) used as assumptions: 90° with a two-way aisle, 60° and 45° with one-way aisles. */
const AISLE={90:24,60:18,45:13};
const ANG=[45,60,90];
const W=sim=>atLeast('ap')?sim.p.w:9;
const cps=(sim,a)=>W(sim)/Math.sin(a*RAD);                              /* curb per stall */
const dep=(sim,a)=>LEN*Math.sin(a*RAD)+W(sim)*Math.cos(a*RAD);          /* row depth, perpendicular to the curb */
const lean=(sim,a)=>a===90?0:dep(sim,a)/Math.tan(a*RAD);                 /* curb lost to the slant at the end of a row */
const perRow=(sim,a)=>Math.max(0,Math.floor((sim.p.L-lean(sim,a))/cps(sim,a)+1e-9));
const rows=(sim,a)=>{const D=dep(sim,a),A=AISLE[a];return 2*D+A<=sim.p.depth+1e-9?2:(D+A<=sim.p.depth+1e-9?1:0);};
const total=(sim,a)=>rows(sim,a)*perRow(sim,a);
/* Guided, before the gut is locked: show the empty lot and one sample stall, not the filled lot or its count. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const bestA=sim=>ANG.reduce((b,a)=>total(sim,a)>total(sim,b)?a:b,90);
const SIM={
 id:'parking',hash:'parking',apUnit:8,order:3,tab:'Angled parking',kind:'Simulation',
 card:'Pick the stall angle you think fits the most cars in a lot, then let parallel lines and angles count them.',
 title:'How many cars fit? Parallel lines in a parking lot',
 lede:{bio:'Parking stall lines are parallel, and the curb cuts across all of them. Straight-in stalls use the least curb each, but angled stalls let cars use a narrower one-way aisle. Which wins depends on the lot.',
  honors:'The stall lines are parallel lines and the curb is a transversal, so every stall line meets the curb at the same angle (corresponding angles). The curb and the aisle edge are parallel too, so each stall line makes alternate interior angles that match.',
  ap:'A stall of width w at angle θ uses w ÷ sin θ of curb. A row of 18 ft stalls is 18 sin θ + w cos θ deep, and its slanted ends cost (row depth) ÷ tan θ of curb. Rows plus aisle must fit the lot depth.'},
 scale:'Seen from above. Stalls are 9 ft wide and 18 ft long. The lot is drawn to scale.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'Your lot',
 controls:[
  {id:'ang',label:'Your pick: stall angle',type:'seg',def:90,options:[{v:45,l:'45°'},{v:60,l:'60°'},{v:90,l:'90°'}],help:'The angle between the stall lines and the curb.'},
  {id:'L',label:'Curb length',type:'range',min:100,max:300,step:10,def:180,unit:' ft',noGut:true},
  {id:'depth',label:'Lot depth',type:'range',min:34,max:64,step:1,def:52,unit:' ft',noGut:true,help:'From the curb at the bottom to the far edge of the lot.'},
  {id:'w',label:'Stall width',type:'range',min:8.5,max:10,step:0.5,def:9,unit:' ft',lvl:'ap',noGut:true}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'total',label:'Parking spaces',unit:'',d:0,min:0,max:null,get:sim=>total(sim,sim.p.ang)},
  {id:'perrow',label:'Stalls per row',unit:'',d:0,min:0,max:null,get:sim=>perRow(sim,sim.p.ang)},
  {id:'rows',label:'Rows that fit',unit:'',d:0,min:0,max:2,get:sim=>rows(sim,sim.p.ang)},
  {id:'cps',label:'Curb per stall',unit:'ft',d:1,lvl:'honors',min:0,max:20,get:sim=>cps(sim,sim.p.ang)},
  {id:'dep',label:'Row depth',unit:'ft',d:1,lvl:'honors',min:0,max:25,get:sim=>dep(sim,sim.p.ang)}
 ],
 graphs:[{id:'g',label:'Spaces by angle',custom:true}],defaultGraph:'g',
 plot(sim,ctx,box){const v=ANG.map(a=>total(sim,a));const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:Math.max(10,Math.ceil(Math.max(...v)*1.2/10)*10),xcats:ANG.map(a=>a+'°'),yl:'Parking spaces'});
  bars(ctx,ax,v,{colors:ANG.map(a=>a===sim.p.ang?PAL['rj']:PAL['cv-soft'])});
  const G=sim.gutS;if(G&&G.g){const i=ANG.indexOf(G.g.a);txt(ctx,'Your gut',ax.X(i+.5),box.T+box.H+30,{s:12,w:700,c:PAL['s4'],a:'center'});}},
 draw(sim,ctx,vdt,k){const a=sim.p.ang,L=sim.p.L,Dl=sim.p.depth,D=dep(sim,a),A=AISLE[a],R=rows(sim,a),n=perRow(sim,a),c=cps(sim,a),sh=lean(sim,a),kk=Math.min(k,1.4);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const s=Math.min(700/L,300/Dl),x0=400-L*s/2,yb=372,yt=yb-Dl*s,X=f=>x0+f*s;
  /* lot and curb */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(x0,yt,L*s,Dl*s);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(x0,yt,L*s,Dl*s);
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x0-10,yb);ctx.lineTo(X(L)+10,yb);ctx.stroke();
  txt(ctx,(atLeast('honors')?'Curb (a transversal): ':'Curb: ')+L+' ft',400,yb+24*kk,{s:13*k,w:700,a:'center'});
  txt(ctx,'Lot depth '+Dl+' ft',x0-8,yt-10,{s:12*k,c:PAL['cv-soft']});
  if(gutPhase(sim)){const cot0=a===90?0:1/Math.tan(a*RAD),xb=40,w=W(sim)/Math.sin(a*RAD);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.25;
    ctx.beginPath();ctx.moveTo(X(xb),yb);ctx.lineTo(X(xb+w),yb);ctx.lineTo(X(xb+w-D*cot0),yb-D*s);ctx.lineTo(X(xb-D*cot0),yb-D*s);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.stroke();
    txt(ctx,'One stall',X(xb+w)+10,yb-D*s/2,{s:13*k,w:700,c:PAL['s4']});
    pill(ctx,'Your pick: '+a+'° stalls',X(L/2)+40,(yt+yb)/2-16*kk,PAL['s4'],'#111',15*kk);
    txt(ctx,'Which angle fits the most cars?',X(L/2)+40,(yt+yb)/2+14*kk,{s:13*k,c:PAL['cv-soft'],a:'center'});
    txt(ctx,'Lock it in to see the lot striped.',X(L/2)+40,(yt+yb)/2+32*kk,{s:13*k,c:PAL['cv-soft'],a:'center'});return;}
  if(!R){const need=D+A;txt(ctx,`At ${a}°, one row plus its aisle needs ${f1(need)} ft of depth.`,400,(yt+yb)/2-6,{s:14*k,w:700,c:PAL['s1'],a:'center'});txt(ctx,'Nothing fits in this lot.',400,(yt+yb)/2+18*kk,{s:13*k,c:PAL['s1'],a:'center'});return;}
  const cot=a===90?0:1/Math.tan(a*RAD);
  /* one row: base y (curb or far edge), direction +1 = stalls go up from base, -1 = down */
  const row=(base,dir)=>{const yA=base-dir*D*s;
   for(let i=0;i<=n;i++){const xb=sh+i*c;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(xb),base);ctx.lineTo(X(xb-D*cot),yA);ctx.stroke();}
   for(let i=0;i<n;i++){const xm=sh+(i+.5)*c-D*cot/2,ym=base-dir*D*s/2;
    if((i*7+(dir>0?3:5))%4===0||(dir>0&&a!==90&&i<2))continue;
    ctx.save();ctx.translate(X(xm),ym);ctx.rotate(dir>0?a*RAD:-a*RAD);ctx.fillStyle=['#3f6fb0','#8a4fbf','#2f8a5a','#b5562f','#5b6470'][(i+(dir>0?0:2))%5];
    rr(ctx,-LEN*0.43*s,-W(sim)*0.36*s,LEN*0.86*s,W(sim)*0.72*s,4);ctx.fill();ctx.restore();}
   return yA;};
  const top1=row(yb,1);let aisleTop=top1-A*s;if(R===2)row(yt,-1);
  /* aisle */
  const ay=(top1+aisleTop)/2;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(X(4),ay);ctx.lineTo(X(L-4),ay);ctx.stroke();ctx.setLineDash([]);
  const arrow=(x,dirx)=>{ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(x+dirx*10,ay);ctx.lineTo(x-dirx*4,ay-7);ctx.lineTo(x-dirx*4,ay+7);ctx.closePath();ctx.fill();};
  if(a===90){arrow(X(L*0.3),1);arrow(X(L*0.7),-1);}else{arrow(X(L*0.3),1);arrow(X(L*0.7),1);}
  pill(ctx,`Aisle ${A} ft, ${a===90?'two-way':'one-way'}`,400,ay,PAL['card'],PAL['cv-ink'],12*kk);
  /* angle marks at the first stall line of the curb row: corresponding and alternate interior angles */
  if(a!==90){const r=20,p1=[X(sh+c),yb],p2=[X(sh+2*c),yb],top=[X(sh+c-D*cot),top1];
   ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2.5;
   [p1,p2].forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],r,Math.PI+0,Math.PI+a*RAD);ctx.stroke();});
   ctx.beginPath();ctx.arc(top[0],top[1],r,0,a*RAD);ctx.stroke();
   txt(ctx,a+'°',p1[0]-r-4,p1[1]-6,{s:12*k,w:700,c:PAL['s5'],a:'right'});
   if(atLeast('honors'))txt(ctx,a+'°',top[0]+r+4,top[1]+14*kk,{s:12*k,w:700,c:PAL['s5']});}
  else{const p=[X(c),yb];ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.strokeRect(p[0],p[1]-12,12,12);}
  pill(ctx,total(sim,a)+' spaces',400,Math.max(24,yt-28*kk),PAL['rj'],'#fff',14*kk);
  const G=sim.gutS;if(G&&G.g&&G.g.a!==a)txt(ctx,`Your gut (${G.g.a}°): ${G.g.v}`,X(L),Math.max(24,yt-28*kk)+5,{s:12*k,w:700,c:PAL['s4'],a:'right'});},
 narrate(sim){const a=sim.p.ang,R=rows(sim,a),D=dep(sim,a),A=AISLE[a];
  if(gutPhase(sim))return `Your pick: ${a}° stalls. Straight-in stalls use the least curb, but cars need a wide two-way lane to back out. Angled stalls take more curb but work with a narrow one-way lane. <b>Which angle fits the most cars?</b>`;
  if(!R)return `At ${a}°, a row is ${f1(D)} ft deep and the aisle is ${A} ft, so you need ${f1(D+A)} ft. <b>This lot is only ${sim.p.depth} ft deep.</b>`;
  const two=R===2?`Two rows and the aisle use ${f1(2*D+A)} of the ${sim.p.depth} ft.`:`A second row would need ${f1(2*D+A)} ft of depth, more than the ${sim.p.depth} ft you have.`;
  return `At ${a}°, each stall uses ${f1(cps(sim,a))} ft of curb, so ${perRow(sim,a)} fit per row. ${two} <b>Total: ${total(sim,a)} spaces.</b>`;},
 gut:{better:'higher',controls:['ang'],
  ask:{bio:'Tap the stall angle here that you think fits the most cars in this lot, then lock it in.'},
  lock(sim){const a=sim.p.ang,t=total(sim,a);return {a,v:t,label:`${a}° stalls: ${t} spaces`};},
  solve(sim){const b=bestA(sim);sim.p.ang=b;const t=total(sim,b);return {a:b,v:t,label:`${b}° stalls: ${t} spaces`};},
  how:{bio:'The math counts both limits. Along the curb: each stall uses 9 ft at 90°, 10.4 ft at 60° and 12.7 ft at 45°. Across the lot: a row plus its aisle needs 42 ft at 90°, 38.1 ft at 60° and 32.1 ft at 45°, and a second row needs 18, 20.1 or 19.1 ft more. It tries all three angles and keeps the winner.',
   ap:'Curb per stall = w ÷ sin θ; row depth D = 18 sin θ + w cos θ; stalls per row = ⌊(L − D ÷ tan θ) ÷ (w ÷ sin θ)⌋; rows = 2 if 2D + aisle ≤ depth, else 1 if D + aisle ≤ depth. Total = rows × stalls per row, checked at each angle.'},
  compare(sim,g,m){const t=ANG.map(a=>`${a}°: ${total(sim,a)}`).join(', ');
   if(g.v>=m.v)return `Your gut was right on: ${g.a}° fits ${g.v} spaces, the most this lot allows (${t}). You traded curb against aisle width just like a parking designer.`;
   const d=m.v-g.v;return `The math’s ${m.a}° layout fits <b>${m.v} spaces</b>, ${d} more than your ${g.a}° pick (${t}). That is <b>${d} more car${d>1?'s':''}</b> parked in the same space, and ${d} fewer families circling to find a spot. ${rows(sim,m.a)>rows(sim,g.a)?`The narrower aisle at ${m.a}° made room for a second row.`:`Here the curb is what limits you, and ${m.a}° uses it best.`}`;},
  again(sim){const p=sim.p;p.L=Math.round(12+Math.random()*18)*10;p.depth=Math.round(36+Math.random()*28);p.ang=90;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Stalls are 9 ft wide. Which stall angle uses more curb for each car?',choices:['90° (straight in)','45°','They use the same curb'],correct:1,explain:'A 45° stall is 9 ft wide measured straight across, but it hits the curb on a slant: 9 ÷ sin 45° ≈ 12.7 ft of curb. At 90° it uses exactly 9 ft. Angled stalls cost curb; they make up for it with a narrower aisle.'},
  {lvl:'bio',instant:true,q:'A wide lot is 200 ft long and 60 ft deep. Which angle fits the most cars?',choices:['45°','60°','90°'],correct:2,explain:'At 90°, two rows of 18 ft plus a 24 ft aisle fit exactly in 60 ft: 2 × 22 = 44 spaces. At 60° two rows also fit (58.2 ft), but only 18 per row: 36. At 45°, 2 × 14 = 28. When the lot is deep enough, straight-in stalls win.'},
  {lvl:'honors',instant:true,q:'All the stall lines are parallel. The first one meets the curb at 60°. What angle does the tenth one make with the curb?',choices:['60°','120°','It depends on how far along the curb it is'],correct:0,explain:'The curb is a transversal across parallel lines, so the corresponding angles are equal: every stall line meets the curb at 60°. That is why one angle setting stripes the whole row.'},
  {lvl:'honors',instant:true,q:'A stall line meets the curb at 60°. The aisle edge is parallel to the curb. At the aisle edge, what is the alternate interior angle, on the other side of the stall line?',choices:['30°','60°','120°'],correct:1,explain:'Parallel lines cut by a transversal make equal alternate interior angles: 60° at the curb and 60° at the aisle edge, on opposite sides of the stall line. The angle next to it on the same side is 180° − 60° = 120°.'},
  {lvl:'ap',instant:true,q:'Stalls are 9 ft wide and angled at 30° to the curb. How much curb does each stall use?',choices:['4.5 ft','10.4 ft','18 ft','31.2 ft'],correct:2,explain:'Curb per stall = w ÷ sin θ = 9 ÷ sin 30° = 9 ÷ 0.5 = 18 ft, twice the 90° value. Shallow angles waste a lot of curb, which is why real lots rarely go below 45°.'},
  {lvl:'ap',instant:true,q:'A stall is 9 ft wide and 18 ft long, angled at 60°. How deep is the row, measured straight out from the curb?',choices:['15.6 ft','18.0 ft','20.1 ft','22.5 ft'],correct:2,explain:'Depth = 18 sin 60° + 9 cos 60° = 15.6 + 4.5 ≈ 20.1 ft. The car’s length contributes 18 sin θ, and its width sticks out by 9 cos θ because the rectangle is tilted.'}
 ],
 tour:[
  {title:'The lot',text:'This strip of land is 180 ft along the curb and 52 ft deep. Stalls are 9 ft wide and 18 ft long. Straight in (90°), each car uses 9 ft of curb: 20 stalls in one row.',pause:true,setup:sim=>BioLab.setValues(sim,{ang:90,L:180,depth:52})},
  {title:'Why only one row?',text:'Straight-in stalls need a 24 ft two-way aisle so cars can back out. One row plus the aisle is 18 + 24 = 42 ft. A second row would need 60 ft, and this lot is 52 ft deep.',pause:true,focus:[[20,40,760,345]]},
  {title:'Tilt the lines',text:'At 60°, the stall lines are still parallel, and the curb crosses all of them at the same angle. Each stall now uses 9 ÷ sin 60° ≈ 10.4 ft of curb, and the aisle can be one-way, 18 ft. Two rows would need 58.2 ft, so it is still one row: 16 spaces.',pause:true,setup:sim=>BioLab.setValues(sim,{ang:60})},
  {title:'45° wins here',text:'At 45°, each stall uses 12.7 ft of curb, so only 12 fit in a row. But the one-way aisle shrinks to 13 ft, and two rows fit in 51.2 ft. Total: 24 spaces, 4 more than straight in.',pause:true,setup:sim=>BioLab.setValues(sim,{ang:45})},
  {lvl:'honors',title:'Corresponding and alternate interior angles',text:'The purple arcs mark 45° where two stall lines meet the curb: corresponding angles, equal because the lines are parallel. The curb and the aisle edge are parallel too, so the stall line makes a matching 45° alternate interior angle at the aisle edge.',pause:true},
  {lvl:'ap',title:'The formulas',text:'Curb per stall is w ÷ sin θ. Row depth is 18 sin θ + w cos θ. The slanted lines also waste a triangle at the end of the row, (row depth) ÷ tan θ of curb. Try a deeper lot: at 60 ft, 90° stalls fit two rows and win again.',pause:true,setup:sim=>BioLab.setValues(sim,{ang:90,depth:60})}
 ],
 lab:{bio:'<p><b>Question:</b> When do angled stalls beat straight-in stalls?</p><ol><li>Keep the curb at 180 ft. Set the depth to 40, 46, 52, 58 and 64 ft.</li><li>At each depth, try all three angles and record the best one.</li></ol><p>Write one sentence: what kind of lot favors angled stalls?</p>',
  honors:'<p><b>Question:</b> How does curb per stall change with the angle?</p><ol><li>Record <b>Curb per stall</b> and <b>Row depth</b> at 45°, 60° and 90°.</li><li>Explain why the curb used goes up as the angle goes down.</li></ol>',
  ap:'<p><b>Question:</b> For a 200 ft curb, at what lot depth does 45° stop beating 90°?</p><ol><li>Vary the depth one foot at a time and record the spaces at both angles.</li><li>Use the formulas to explain each jump.</li></ol><p><b>CER:</b> Claim, evidence from your trials, reasoning from the geometry.</p>'},
 terms:[
  {t:'Parallel lines',d:'Lines in the same plane that never meet. Stall lines are painted parallel.'},
  {t:'Transversal',d:'A line that crosses two or more other lines. The curb crosses every stall line.'},
  {t:'Corresponding angles',d:'Angles in matching positions where a transversal crosses parallel lines. They are equal.',lvl:'honors'},
  {t:'Alternate interior angles',d:'Angles between two parallel lines, on opposite sides of the transversal. They are equal.',lvl:'honors'},
  {t:'Sine',d:'In a right triangle, opposite ÷ hypotenuse. A stall of width w meets the curb along a slant of w ÷ sin θ.',lvl:'ap'}
 ],
 about:'<p>Stalls are rectangles 9 ft wide (adjustable at Deep dive) and 18 ft long. Curb per stall = w ÷ sin θ. Row depth = 18 sin θ + w cos θ. The stripes lean, so an angled row loses (row depth) ÷ tan θ of curb at its end. Rows: two if 2 × row depth + aisle fits the lot depth, else one if row depth + aisle fits.</p><p><b>Assumptions:</b> 9 by 18 ft stalls and aisles of 24 ft (90°, two-way), 18 ft (60°, one-way) and 13 ft (45°, one-way) are typical design values used for illustration. Cities set their own minimums, and real layouts also need room for driveways, accessible spaces, landscaping and turning at the ends of aisles.</p>'
};
BioLab.register(SIM);
})();
