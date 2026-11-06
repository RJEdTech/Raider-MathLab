(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* Two lookout towers: A at (0,0), B at (d,0) km, north is up. Each reads the angle between the line to the other tower and the smoke.
   ASA: the angle at the fire is 180° − α − β, and the law of sines gives AF = d·sin β / sin(α + β). */
const R=Math.PI/180,HT=560;
/* The map scales with the tower spacing d: it covers x from −0.7d to 1.7d and y from −0.15d up. */
let S=800/(2.4*12),X0=0.7*12,Y0=0.15*12;
const setScale=d=>{S=800/(2.4*d);X0=0.7*d;Y0=0.15*d;};
const PX=x=>(x+X0)*S,PY=y=>HT-(y+Y0)*S;
const HELI=5;                                      /* helibase 5 km east of tower B, on the same road */
/* Your family's cabin sits at a fixed spot on the map. "Near" means within 5 km: a line chosen for this tool, not an official rule. */
const CAB={x:10,y:11},NEAR=5;
const cabD=(x,y)=>Math.hypot(x-CAB.x,y-CAB.y);
const nearTxt=km=>km<NEAR?'within 5 km':'more than 5 km away';
function fire(d,a,b){const af=d*Math.sin(b*R)/Math.sin((a+b)*R);return {x:af*Math.cos(a*R),y:af*Math.sin(a*R),af,bf:d*Math.sin(a*R)/Math.sin((a+b)*R)};}
const F=sim=>fire(sim.p.d,sim.p.al,sim.p.be);
const off=sim=>{const f=F(sim);return Math.hypot(sim.p.gx-f.x,sim.p.gy-f.y);};
function spread(d,a,b){const f=fire(d,a,b);let m=0;[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([u,v])=>{const g=fire(d,a+u,b+v);m=Math.max(m,Math.hypot(g.x-f.x,g.y-f.y));});return m*1000;}
const heli=sim=>{const f=F(sim),ah=sim.p.d+HELI;return Math.sqrt(ah*ah+f.af*f.af-2*ah*f.af*Math.cos(sim.p.al*R));};
const scKey=sim=>[sim.p.d,sim.p.al,sim.p.be].join(',');
const solved=sim=>sim.gutS&&sim.gutS.m&&sim.gutS.m.key===scKey(sim);
const revealed=sim=>sim.p.lines||solved(sim)||(sim.gutS&&sim.gutS.g&&sim.gutS.g.key===scKey(sim));
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2),f0=v=>fmtNum(v,0);
const kmTxt=km=>km<1?f0(Math.round(km*1000/10)*10)+' m':f1(km)+' km';

const SIM={
 id:'triangulate',hash:'triangulate',apUnit:8,order:7,tab:'Locating a wildfire',kind:'Simulation',
 card:'Two lookout towers each report one angle to the smoke. Guess where the fire is, then let the law of sines place it and check how close it is to your cabin.',
 title:'Two towers, one fire',
 lede:{bio:'Two lookout towers spot the same smoke. Each one can only tell you a direction, not a distance. Put the two directions together, though, and there is only one place the fire can be.',
  honors:'Two angles and the side between them (ASA) fix exactly one triangle. The law of sines turns the towers’ angles and the distance between them into the distance from each tower to the fire.',
  ap:'With the towers d apart and readings α and β, the angle at the fire is 180° − α − β, and AF = d·sin β / sin(α + β). The law of cosines then gives the distance from any other known point, like a helibase.'},
 scale:'A map seen from above, north at the top. One grid square is 2 km (1 km when the towers are 10 km apart or closer).',
 aspect:800/HT,timeless:true,trials:true,graph:false,
 controlsTitle:'The readings',
 controls:[
  {id:'al',label:'Tower A’s angle to the smoke',type:'range',min:30,max:70,step:1,def:48,unit:'°',noGut:true,help:'Measured from the line toward tower B.'},
  {id:'be',label:'Tower B’s angle to the smoke',type:'range',min:30,max:70,step:1,def:63,unit:'°',noGut:true,help:'Measured from the line toward tower A.'},
  {id:'d',label:'Distance between the towers',type:'range',min:8,max:20,step:1,def:12,unit:' km',lvl:'honors',noGut:true},
  {id:'gx',label:'Your pin: km east of tower A',type:'range',min:-8,max:32,step:0.1,def:6,unit:' km',help:'Or click the map.'},
  {id:'gy',label:'Your pin: km north of the towers',type:'range',min:0,max:26,step:0.1,def:4,unit:' km'},
  {id:'lines',label:'Draw both sight lines',type:'toggle',def:false,help:'Lookouts once did this with string on a paper map.'},
  {id:'err',label:'Show a 1° reading error',type:'toggle',def:false,lvl:'honors',help:'Each tower’s angle could be off by 1° either way.'}
 ],
 actions:[{id:'fix',label:'Move my pin to the math’s spot',lvl:'honors',run(sim){const f=F(sim);BioLab.setValues(sim,{gx:f.x,gy:f.y,lines:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'off',label:'Your pin is this far from the fire',unit:'km',d:2,min:0,max:20,get:off},
  {id:'cabin',label:'Fire to your cabin',unit:'km',d:2,min:0,max:null,get:sim=>{if(!revealed(sim))return null;const f=F(sim);return cabD(f.x,f.y);}},
  {id:'fang',label:'Angle at the fire',unit:'°',d:0,min:0,max:180,get:sim=>180-sim.p.al-sim.p.be},
  {id:'af',label:'Tower A to the fire',unit:'km',d:2,lvl:'honors',min:0,max:null,get:sim=>revealed(sim)?F(sim).af:null},
  {id:'bf',label:'Tower B to the fire',unit:'km',d:2,lvl:'honors',min:0,max:null,get:sim=>revealed(sim)?F(sim).bf:null},
  {id:'north',label:'Fire is this far north of the towers',unit:'km',d:2,lvl:'honors',min:0,max:null,get:sim=>revealed(sim)?F(sim).y:null},
  {id:'spread',label:'A 1° error moves the fix up to',unit:'m',d:0,lvl:'honors',min:0,max:null,get:sim=>spread(sim.p.d,sim.p.al,sim.p.be)},
  {id:'heli',label:'Helicopter flight from the helibase',unit:'km',d:2,lvl:'ap',min:0,max:null,get:sim=>revealed(sim)?heli(sim):null}
 ],
 draw(sim,ctx,vdt,k){setScale(sim.p.d);const p=sim.p,d=p.d,f=F(sim),G=sim.gutS,sv=solved(sim),showL=p.lines||sv;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,HT);
  /* soft terrain bands and a 2 km grid */
  ctx.fillStyle=PAL['cv-bg2'];for(let i=0;i<7;i++){ctx.beginPath();const y0=60+i*70;ctx.moveTo(0,y0);for(let x=0;x<=800;x+=40)ctx.lineTo(x,y0+14*Math.sin(x/90+i*1.7));ctx.lineTo(800,y0+30);for(let x=800;x>=0;x-=40)ctx.lineTo(x,y0+30+14*Math.sin(x/90+i*1.7));ctx.closePath();ctx.fill();}
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.45;const gs=d<=10?1:2;for(let x=Math.ceil(-X0/gs)*gs;PX(x)<=800;x+=gs){ctx.beginPath();ctx.moveTo(PX(x),0);ctx.lineTo(PX(x),HT);ctx.stroke();}for(let y=Math.ceil(-Y0/gs)*gs;PY(y)>=0;y+=gs){ctx.beginPath();ctx.moveTo(0,PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  /* road between the towers */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=3;ctx.setLineDash([12,8]);ctx.beginPath();ctx.moveTo(0,PY(0));ctx.lineTo(800,PY(0));ctx.stroke();ctx.setLineDash([]);
  const A=[PX(0),PY(0)],B=[PX(d),PY(0)],Fp=[PX(f.x),PY(f.y)];
  const ray=(o,deg,len,col,w,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(o[0],o[1]);ctx.lineTo(o[0]+Math.cos(deg*R)*len,o[1]-Math.sin(deg*R)*len);ctx.stroke();ctx.setLineDash([]);};
  /* 1° error wedges */
  if(p.err&&atLeast('honors')){ctx.globalAlpha=.6;[-1,1].forEach(u=>{ray(A,p.al+u,1200,PAL['s4'],1.5,[3,4]);ray(B,180-p.be-u,1200,PAL['s4'],1.5,[3,4]);});ctx.globalAlpha=1;}
  /* sight lines: short stubs, or full lines once drawn */
  const L=showL?1200:90;ray(A,p.al,L,PAL['s2'],showL?2:4,showL?[9,6]:null);ray(B,180-p.be,L,PAL['s2'],showL?2:4,showL?[9,6]:null);
  /* angle arcs */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(A[0],A[1],40,-p.al*R,0);ctx.stroke();ctx.beginPath();ctx.arc(B[0],B[1],40,Math.PI,Math.PI+p.be*R);ctx.stroke();
  const rl=48+12*k;txt(ctx,p.al+'°',A[0]+Math.cos(p.al/2*R)*rl,A[1]-Math.sin(p.al/2*R)*rl,{s:14*k,w:700,c:PAL['s2'],a:'center',b:'middle'});txt(ctx,p.be+'°',B[0]-Math.cos(p.be/2*R)*rl,B[1]-Math.sin(p.be/2*R)*rl,{s:14*k,w:700,c:PAL['s2'],a:'center',b:'middle'});
  /* the triangle and the fire */
  if(sv){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.08;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.lineTo(Fp[0],Fp[1]);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   const side=(P,Q,lab,dx)=>{const mx=(P[0]+Q[0])/2,my=(P[1]+Q[1])/2;pill(ctx,lab,mx+dx,my,PAL['card'],PAL['cv-ink'],12*Math.min(k,1.4));};
   if(atLeast('honors')){side(A,Fp,kmTxt(f.af),-34*k);side(B,Fp,kmTxt(f.bf),34*k);}}
  if(sv||p.lines){/* smoke and flame where the lines cross */
   if(sv){ctx.fillStyle=PAL['muted'];ctx.globalAlpha=.35;[[0,-26,12],[8,-40,10],[-4,-52,8]].forEach(c=>{ctx.beginPath();ctx.arc(Fp[0]+c[0],Fp[1]+c[1],c[2],0,7);ctx.fill();});ctx.globalAlpha=1;
    ctx.fillStyle='#e0632a';ctx.beginPath();ctx.moveTo(Fp[0],Fp[1]-20);ctx.quadraticCurveTo(Fp[0]+12,Fp[1]-4,Fp[0]+8,Fp[1]+6);ctx.lineTo(Fp[0]-8,Fp[1]+6);ctx.quadraticCurveTo(Fp[0]-12,Fp[1]-4,Fp[0],Fp[1]-20);ctx.fill();
    ctx.fillStyle='#f5c242';ctx.beginPath();ctx.arc(Fp[0],Fp[1]+1,4,0,7);ctx.fill();
    txt(ctx,'Fire',Fp[0]+16,Fp[1]-10,{s:13*k,w:700,c:PAL['s1']});
    if(atLeast('honors'))txt(ctx,f0(180-p.al-p.be)+'°',Fp[0],Fp[1]+24*k,{s:12*k,w:700,c:PAL['s2'],a:'center'});}
   else{ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(Fp[0],Fp[1],7,0,7);ctx.stroke();}}
  /* helibase (AP) */
  if(atLeast('ap')){const H=[PX(d+HELI),PY(0)];ctx.fillStyle=PAL['s5'];ctx.fillRect(H[0]-9,H[1]-9,18,18);txt(ctx,'H',H[0],H[1]+1,{s:12,w:700,c:'#fff',a:'center',b:'middle'});txt(ctx,'Helibase',Math.min(H[0],796-30*k),H[1]+24*k,{s:12*k,w:700,c:PAL['s5'],a:'center'});
   if(sv){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(H[0],H[1]);ctx.lineTo(Fp[0],Fp[1]);ctx.stroke();ctx.setLineDash([]);}}
  /* your cabin and the 5 km circle around it */
  {const C=[PX(CAB.x),PY(CAB.y)],r=NEAR*S;ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(C[0],C[1],r,0,7);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'5 km',Math.max(C[0]-r-6,40*k),C[1]+4,{s:12*k,w:700,c:PAL['s5'],a:'right'});
   ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.moveTo(C[0]-10,C[1]+8);ctx.lineTo(C[0]-10,C[1]-2);ctx.lineTo(C[0],C[1]-11);ctx.lineTo(C[0]+10,C[1]-2);ctx.lineTo(C[0]+10,C[1]+8);ctx.closePath();ctx.fill();
   txt(ctx,'Your cabin',C[0]+14,C[1]+5,{s:13*k,w:700,c:PAL['s5']});}
  /* towers */
  [[A,'Tower A'],[B,'Tower B']].forEach(([T,lab])=>{ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(T[0],T[1]-14);ctx.lineTo(T[0]+9,T[1]+6);ctx.lineTo(T[0]-9,T[1]+6);ctx.closePath();ctx.fill();txt(ctx,lab,T[0],T[1]+24*k,{s:14*k,w:700,a:'center'});});
  if(atLeast('honors'))txt(ctx,d+' km',(A[0]+B[0])/2,PY(0)+24*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  /* gut and current pick */
  const gk=G&&G.g&&G.g.key===scKey(sim);
  if(gk&&Math.hypot(G.g.x-p.gx,G.g.y-p.gy)>0.05){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(G.g.x),PY(G.g.y),10,0,7);ctx.stroke();txt(ctx,'Your gut',PX(G.g.x)-14,PY(G.g.y)+5,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
  const cx=PX(p.gx),cy=PY(p.gy);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx-12,cy);ctx.lineTo(cx+12,cy);ctx.moveTo(cx,cy-12);ctx.lineTo(cx,cy+12);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,7,0,7);ctx.stroke();
  if(!(sv&&off(sim)<0.05))txt(ctx,gk||sv?'Your pin':'Your pin: the fire is here?',cx+12,cy+20*k,{s:13*k,w:700,c:PAL['rj']});
  /* radio report box */
  const bx=12,by=12,kk=Math.min(k,1.5);ctx.font='700 '+(14*kk)+'px '+FONT;const l1='Fire update: Tower A reads '+p.al+'°, Tower B reads '+p.be+'°';const bw=ctx.measureText(l1).width+20;
  ctx.fillStyle=PAL['card'];ctx.globalAlpha=.92;ctx.fillRect(bx,by,bw,30*kk);ctx.globalAlpha=1;ctx.strokeStyle=PAL['line'];ctx.strokeRect(bx,by,bw,30*kk);txt(ctx,l1,bx+10,by+15*kk,{s:14*kk,w:700,b:'middle'});
  /* scale bar */
  const sb=d<=10?2:5;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(16,HT-12);ctx.lineTo(16+sb*S,HT-12);ctx.stroke();txt(ctx,sb+' km',16+sb*S/2,HT-20,{s:12*k,c:PAL['cv-ink'],a:'center'});},
 onClick(sim,x,y){setScale(sim.p.d);BioLab.setValues(sim,{gx:+clamp(x/S-X0,-8,32).toFixed(1),gy:+clamp((HT-y)/S-Y0,0,26).toFixed(1)});},
 narrate(sim){const p=sim.p,f=F(sim),fa=180-p.al-p.be,o=off(sim),sp=spread(p.d,p.al,p.be);
  if(solved(sim)&&o<0.05)return atLeast('honors')?`<b>Law of sines:</b> AF = ${p.d} · sin ${p.be}° ÷ sin ${fa}° = ${f2(f.af)} km. A 1° error in either reading would move this fix by up to ${f0(sp)} m.`:`<b>Your pin is on the fire.</b> It is ${kmTxt(f.af)} from tower A and ${kmTxt(f.bf)} from tower B, where the two sight lines cross, and ${kmTxt(cabD(f.x,f.y))} from your cabin.`;
  if(fa<50)return `The sight lines meet at only ${fa}° at the fire. <b>Narrow crossings are touchy:</b> a small error in either reading slides the crossing point a long way.`;
  return `Tower A’s line and tower B’s line can only cross at one point. The angles of the triangle add to 180°, so <b>the angle at the fire is 180° − ${p.al}° − ${p.be}° = ${fa}°</b>.`;},
 gut:{better:'lower',
  controls:['gx','gy'],
  ask:{bio:'Click the map where you think the fire is, or set the two sliders here. The red crosshair is your pin. Go by feel, then lock it in.',honors:'Before you draw the lines or use any trig: where is the fire? Click the map, or set the sliders here, by feel. Then lock it in.'},
  lockLabel:'Lock in my pin',
  lock(sim){return {v:off(sim),x:sim.p.gx,y:sim.p.gy,key:scKey(sim),label:`${f1(sim.p.gx)} km east, ${f1(sim.p.gy)} km north of tower A`};},
  solve(sim){const f=F(sim);sim.p.gx=f.x;sim.p.gy=f.y;return {v:off(sim),x:f.x,y:f.y,key:scKey(sim),sp:spread(sim.p.d,sim.p.al,sim.p.be),label:`${f1(f.x)} km east, ${f1(f.y)} km north of tower A`};},
  how:{bio:'The two sight lines and the road between the towers make a triangle. Its angles add to 180°, so the angle at the fire is 180° minus the two readings. With two angles and the side between them, there is only one triangle that fits.',
   honors:'Law of sines: AF / sin B = AB / sin F. So AF = AB · sin B ÷ sin F, with F = 180° − A − B. Then walk AF kilometers from tower A along its sight line: east AF·cos A, north AF·sin A.'},
  compare(sim,g,m){const sp=m.sp,gc=cabD(g.x,g.y),mc=cabD(m.x,m.y),gn=gc<NEAR,mn=mc<NEAR;
   const head=g.v<0.3?`Your gut was right on: your pin is within ${kmTxt(g.v)} of the fire. Your eyes already crossed the two lines. The law of sines does it on paper, from three numbers in a fire update.`:`Your gut pin was <b>${kmTxt(g.v)}</b> from the fire.`;
   const cab=` Your pin puts the fire ${kmTxt(gc)} from your cabin, ${nearTxt(gc)}. The math puts it <b>${kmTxt(mc)}</b> from the cabin, ${nearTxt(mc)}.`;
   const vd=gn!==mn?` <b>So your gut would have said the fire is ${gn?'close to':'well away from'} the cabin, and the math says ${mn?'it is close':'it is not'}.</b>`:` On that question your gut and the math agree, but only the math gives the real distance.`;
   const er=atLeast('honors')&&g.v>=0.3?` Even if each tower’s reading were off by 1°, the math’s spot would move at most ${f0(sp)} m.`:'';
   return head+cab+vd+er;},
  again(sim){let a,b;do{a=32+Math.floor(Math.random()*37);b=32+Math.floor(Math.random()*37);}while(a+b>128);Object.assign(sim.p,{al:a,be:b,gx:sim.p.d/2,gy:4,lines:false});}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Both towers read 60°. Where is the fire?',choices:['Closer to tower A','Straight north of the point halfway between the towers, as far from each tower as the towers are from each other','Exactly halfway between the towers, on the road'],correct:1,explain:'The angle at the fire is 180° − 60° − 60° = 60°, so all three angles are equal: an equilateral triangle. Each tower is exactly as far from the fire as the towers are from each other, and the fire sits straight north of the midpoint.'},
  {lvl:'bio',instant:true,q:'Tower A reads 50° and tower B reads 70°. What angle do the two sight lines make where they meet at the fire?',choices:['60°','120°','70°','180°'],correct:0,explain:'The three angles of a triangle add to 180°: 180° − 50° − 70° = 60°.'},
  {lvl:'honors',instant:true,q:'The towers are 10 km apart. Tower A reads 40° and tower B reads 60°. How far is the fire from tower A?',choices:['About 6.5 km','About 8.8 km','About 10 km','About 13.5 km'],correct:1,explain:'The angle at the fire is 80°. Law of sines: AF = 10 · sin 60° ÷ sin 80° = 10 × 0.866 ÷ 0.985 ≈ 8.79 km. The side across from the bigger angle is longer, and B’s 60° is bigger than A’s 40°, so AF is longer than BF (6.53 km).'},
  {lvl:'honors',instant:true,q:'Each tower’s reading could be off by 1°. Which situation pinpoints the fire better?',choices:['Sight lines that meet at about 90° at the fire','Sight lines that meet at a narrow 40° at the fire','It makes no difference'],correct:0,explain:'With the towers 12 km apart, readings of 45° and 45° (lines meeting at 90°) put the fire within about 210 m. Readings of 70° and 70° (meeting at 40°) can be off by up to about 940 m. Shallow crossings let a small turn of either line slide the crossing far along the other line.'},
  {lvl:'ap',instant:true,q:'Towers 12 km apart read 48° and 63°, so the fire is 11.45 km from tower A. The helibase is on the road 17 km east of tower A. Using the law of cosines, how far is the flight from the helibase to the fire?',choices:['About 5.6 km','About 12.6 km','About 17.0 km','About 28.5 km'],correct:1,explain:'The angle at tower A between the road and the sight line is 48°. HF² = 17² + 11.45² − 2 · 17 · 11.45 · cos 48° ≈ 289 + 131.2 − 260.6 = 159.6, so HF ≈ 12.63 km. Check it with the helibase readout.'},
  {lvl:'ap',instant:true,q:'What happens to the fix as α + β gets close to 180°?',choices:['The fire gets closer to the towers','The sight lines become nearly parallel, the fire is very far away, and tiny reading errors move the fix enormously','Nothing: the law of sines works the same'],correct:1,explain:'sin(α + β) heads toward 0, so AF = d·sin β / sin(α + β) blows up. The lines barely converge, so a 1° error slides the crossing point a huge distance. Lookouts get the best fixes when the lines cross near 90°.'}
 ],
 tour:[
  {title:'Two towers',text:'Two lookout towers stand 12 km apart on a ridge road. Smoke rises somewhere to the north. Each lookout can measure only a direction, not how far away the smoke is. Your family’s cabin is the house on the map, 10 km east and 11 km north of tower A.',focus:[[PX(-2),PY(0)-30,PX(14)-PX(-2),70]],pause:true,setup:sim=>BioLab.setValues(sim,{al:48,be:63,gx:6,gy:4,lines:false,err:false})},
  {title:'The readings',text:'Tower A reports that the smoke is 48° from the line toward tower B. Tower B reports 63° from the line toward tower A. Those two angles are all the fire update gives you, so you work out the spot.',focus:[[8,8,380,44],[PX(-1),PY(0)-110,PX(13)-PX(-1),140]],pause:true},
  {title:'Cross the lines',text:'Extend each sight line. The fire is the one point on both of them. Paper maps did this with string pinned at each tower.',pause:true,setup:sim=>BioLab.setValues(sim,{lines:true})},
  {title:'A triangle with known angles',text:'The road and the two sight lines make a triangle. Its angles add to 180°, so the angle at the fire is 180° − 48° − 63° = 69°. Two angles and the side between them (ASA) allow only one triangle.',pause:true},
  {lvl:'honors',title:'The law of sines',text:'Each side over the sine of the angle across from it is the same for the whole triangle: AF / sin 63° = 12 / sin 69°. So AF = 12 · sin 63° ÷ sin 69° ≈ 11.45 km, and the fire is 11.45 · cos 48° ≈ 7.66 km east and 11.45 · sin 48° ≈ 8.51 km north of tower A.',pause:true,setup:sim=>BioLab.setValues(sim,{gx:7.66,gy:8.51})},
  {lvl:'honors',title:'How good is the fix?',text:'Readings are only as good as the instrument. The orange wedges show each line turned 1° either way. Where the wedges overlap, the fire could be: here, up to about 330 m from the fix.',pause:true,setup:sim=>BioLab.setValues(sim,{err:true})},
  {lvl:'ap',title:'Law of cosines to the helibase',text:'The helibase H is 17 km east of tower A. In triangle A-H-fire you know two sides (17 and 11.45 km) and the angle between them (48°), so HF² = 17² + 11.45² − 2·17·11.45·cos 48°, and HF ≈ 12.63 km.',pause:true,setup:sim=>BioLab.setValues(sim,{err:false,gx:7.66,gy:8.51})},
  {title:'How close to the cabin?',text:'Where the lines cross, the fire is about 7.66 km east and 8.51 km north of tower A. The cabin is 2.34 km farther east and 2.49 km farther north, so the fire is √(2.34² + 2.49²) ≈ 3.4 km from the cabin: inside the dashed 5 km circle.',pause:true,setup:sim=>BioLab.setValues(sim,{lines:true,err:false,gx:7.66,gy:8.51})},
  {title:'Your turn',text:'Close this walkthrough and try the Gut vs. math box at the top: click where you think the fire is, then let the math place it.',pause:true,setup:sim=>BioLab.setValues(sim,{lines:false,err:false,gx:6,gy:4})}
 ],
 lab:{bio:'<p><b>Question:</b> How does the fire’s distance change as the readings change?</p><ol><li>Turn on <b>Draw both sight lines</b>. Keep tower B at 60° and set tower A to 35°, 45°, 55° and 65°.</li><li>Each time, click where the lines cross and record a trial.</li></ol><p>Write one sentence: what happens to the fire’s distance north as tower A’s angle grows?</p>',
  honors:'<p><b>Question:</b> Which readings give the most reliable fix?</p><ol><li>Turn on <b>Show a 1° reading error</b>.</li><li>Try readings whose sum is 70°, 90°, 110° and 130°. Record <b>A 1° error moves the fix up to</b> each time.</li></ol><p>Explain, using the angle at the fire, why some fixes are more reliable than others.</p>',
  ap:'<p><b>Question:</b> Do the law of sines and the law of cosines agree?</p><ol><li>For three sets of readings, record AF and BF.</li><li>Check that BF² = AF² + d² − 2·AF·d·cos α for each.</li></ol><p><b>CER:</b> Explain why ASA gives a unique triangle, using your data.</p>'},
 terms:[
  {t:'Triangulation',d:'Finding a location by measuring angles to it from two known points.'},
  {t:'Angle sum',d:'The three angles of any triangle add to 180°.'},
  {t:'ASA',d:'Two angles and the side between them. They fix exactly one triangle.',lvl:'honors'},
  {t:'Law of sines',d:'a / sin A = b / sin B = c / sin C: each side divided by the sine of the angle across from it gives the same number.',lvl:'honors'},
  {t:'Law of cosines',d:'c² = a² + b² − 2ab·cos C. Use it when you know two sides and the angle between them (SAS), or all three sides.',lvl:'ap'}
 ],
 about:'<p>Tower A is at the origin and tower B is d km east of it. The readings α and β are measured from the road between the towers. The fire is at distance AF = d·sin β / sin(α + β) from tower A, so it sits AF·cos α km east and AF·sin α km north of tower A. The helibase is 5 km east of tower B, and its distance to the fire comes from the law of cosines. Your cabin is fixed at 10 km east and 11 km north of tower A, and its distance to the fire is the straight-line distance on the map. The 5 km circle is a line chosen for this tool, not an official rule for when to leave. In a real fire, follow official alerts.</p><p><b>Simplified:</b> real lookouts read compass bearings (degrees from north) with a sighting instrument, and the map is flat here. The ±1° wedges are an assumption for illustration, not the accuracy of any particular instrument. “Your pin is this far from the fire” is the straight-line distance on the map.</p>'
};
BioLab.register(SIM);
})();
