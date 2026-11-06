(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* A sprinkler's wet area as a polar curve r(θ), in feet, with the head at the origin and θ = 0 pointing right.
   circle: r = R (a rotary head).  wind: r = a + b cos θ with a + b = R (a limaçon: a simple model of wind pushing the spray right).
   wall: r = (R/2)(1 + cos θ) (a cardioid: a head set near a wall that throws far straight out and little to the sides).
   Area = ½∫ r² dθ. Slices: n equal sectors; "inside" uses the smallest r in each slice, "outside" the largest. */
const TAU=Math.PI*2,GAL=0.5/12*7.48052;/* gallons per square foot for half an inch of water */
const wind=sim=>atLeast('honors')?sim.p.wind/100:0.2;
function shape(sim){const R=sim.p.reach,p=sim.p.pattern;
 if(p==='wind'){const b=wind(sim)*R,a=R-b;return {r:t=>a+b*Math.cos(t),A:Math.PI*(a*a+b*b/2),a,b,name:'limaçon'};}
 if(p==='wall'){const a=R/2;return {r:t=>a*(1+Math.cos(t)),A:1.5*Math.PI*a*a,a,b:a,name:'cardioid'};}
 return {r:()=>R,A:Math.PI*R*R,a:R,b:0,name:'circle'};}
function slices(sim,n){const s=shape(sim),d=TAU/n,out=[];let lo=0,hi=0;
 for(let i=0;i<n;i++){let mn=1e9,mx=0;for(let j=0;j<=24;j++){const v=s.r(i*d+j*d/24);mn=Math.min(mn,v);mx=Math.max(mx,v);}out.push({t0:i*d,t1:(i+1)*d,mn,mx});lo+=0.5*mn*mn*d;hi+=0.5*mx*mx*d;}
 return {lo,hi,list:out};}
/* Spray that lands past a straight sidewalk edge x = c: ½∫(r² − (c/cos θ)²) dθ over the angles where r cos θ > c. */
function waste(sim){const s=shape(sim),c=sim.p.edge,n=4000;let A=0;
 for(let i=0;i<n;i++){const t=-Math.PI/2+(i+0.5)*Math.PI/n,r=s.r(t),rc=c/Math.cos(t);if(r>rc)A+=0.5*(r*r-rc*rc)*Math.PI/n;}return A;}
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on&&sim.tshow));
const sq=v=>Math.round(v).toLocaleString('en-US')+' sq ft';
const galT=v=>Math.round(v).toLocaleString('en-US')+' gal';
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const PNAME={circle:'Rotary head, full circle',wind:'Same head, windy day',wall:'Head next to the house'};

const SIM={
 id:'sprinkler',hash:'sprinkler',apUnit:18,order:2,tab:'Sprinkler coverage',kind:'Simulation',
 card:'Guess how many square feet a sprinkler waters, then slice its spray pattern like a pie to find out.',
 title:'How much lawn does the sprinkler water?',
 lede:{bio:'A sprinkler’s spray reaches a different distance in each direction. Cut the pattern into thin pie slices, add up the slices, and you have the area it waters. That number tells you how much water the lawn really gets.',
  honors:'A spray pattern is a polar curve r(θ): the throw distance in each direction θ. Each thin slice is nearly a sector with area ½r²Δθ, so the area is about Σ ½r(θᵢ)²Δθ, a polar Riemann sum.',
  ap:'As the slices get thinner, the sum becomes the integral A = ½∫ r(θ)² dθ. The area between two polar curves, like the spray and a sidewalk edge, is ½∫ (r_outer² − r_inner²) dθ.'},
 scale:'Seen from above. One grid square is 5 ft × 5 ft = 25 sq ft. The sprinkler head is the dot at the center.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your sprinkler',
 controls:[
  {id:'guess',label:'Your estimate: area it waters',type:'range',min:0,max:5200,step:25,def:0,unit:' sq ft',help:'Count grid squares if you like: each one is 25 sq ft.'},
  {id:'pattern',label:'Spray pattern',type:'seg',def:'wall',noGut:true,onChange:clearGut,options:[{v:'circle',l:'Full circle'},{v:'wind',l:'Windy day'},{v:'wall',l:'Next to the house'}]},
  {id:'reach',label:'Farthest throw',type:'range',min:15,max:40,step:1,def:25,unit:' ft',noGut:true,onChange:clearGut,help:'How far the spray reaches in its longest direction. Many hose-end and rotor sprinklers throw somewhere in this range; the box or the setting dial tells you yours.'},
  {id:'n',label:'Pie slices',type:'range',min:4,max:72,step:1,def:12,noGut:true},
  {id:'wind',label:'Wind push (share of the throw)',type:'range',min:0,max:40,step:5,def:20,unit:'%',lvl:'honors',noGut:true,onChange:clearGut,help:'Windy day only. The pattern is r = a + b cos θ with a + b = the farthest throw; b is this share of it.'},
  {id:'outer',label:'Show outside slices too',type:'toggle',def:false,lvl:'honors',noGut:true},
  {id:'walk',label:'Sidewalk on the right',type:'toggle',def:false,lvl:'ap',noGut:true},
  {id:'edge',label:'Sidewalk edge: feet from the head',type:'range',min:8,max:40,step:1,def:20,unit:' ft',lvl:'ap',noGut:true}
 ],
 actions:[{id:'show',label:'Skip the guess and show the slices',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'area',label:'Area it waters',unit:'sq ft',d:0,min:0,max:null,get:sim=>shown(sim)?shape(sim).A:null},
  {id:'inner',label:'Inside-slice estimate',unit:'sq ft',d:0,min:0,max:null,get:sim=>shown(sim)?slices(sim,sim.p.n).lo:null},
  {id:'outerA',label:'Outside-slice estimate',unit:'sq ft',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?slices(sim,sim.p.n).hi:null},
  {id:'water',label:'Water for half an inch',unit:'gal',d:0,min:0,max:null,get:sim=>shown(sim)?shape(sim).A*GAL:null},
  {id:'reachM',label:'Farthest throw',unit:'ft',d:0,min:0,max:null,get:sim=>sim.p.reach},
  {id:'waste',label:'Spray on the sidewalk',unit:'sq ft',d:0,lvl:'ap',min:0,max:null,get:sim=>sim.p.walk?waste(sim):0}
 ],
 graphs:[{id:'conv',label:'Slice estimates vs. number of slices',custom:true}],defaultGraph:'conv',
 plot(sim,ctx,box){const s=shape(sim);
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const S=sim.gutS,top=Math.ceil(Math.max(slices(sim,4).hi,S&&S.g?S.g.A:0)*1.05/500)*500,ax=axes(ctx,box,{xmin:4,xmax:72,ymin:0,ymax:Math.max(top,500),xl:'Number of slices',yl:'Area (sq ft)'});
  ctx.strokeStyle=PAL['s3'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(4),ax.Y(s.A));ctx.lineTo(ax.X(72),ax.Y(s.A));ctx.stroke();ctx.setLineDash([]);
  const line=(key,col)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let n=4;n<=72;n++){const v=slices(sim,n)[key],px=ax.X(n),py=ax.Y(v);n===4?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();};
  line('lo',PAL['s2']);if(atLeast('honors'))line('hi',PAL['s1']);
  const L=[{label:'Inside slices',color:PAL['s2']},{label:'Exact area',color:PAL['s3'],dash:true}];if(atLeast('honors'))L.splice(1,0,{label:'Outside slices',color:PAL['s1']});
  legend(ctx,box.L+box.W-170,box.T+box.H-18*L.length-6,L);
  if(S&&S.g){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(4),ax.Y(S.g.A));ctx.lineTo(ax.X(72),ax.Y(S.g.A));ctx.stroke();txt(ctx,'Your gut',ax.X(5),ax.Y(S.g.A)-6,{s:12,w:700,c:PAL['s4']});}},
 draw(sim,ctx,vdt,k){const s=shape(sim),R=sim.p.reach,p=sim.p.pattern,sh=shown(sim),S=sim.gutS;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* view box in feet */
  let x0=-R,x1=R,y0=-R,y1=R;if(p==='wind'){x0=-(s.a-s.b);let ym=0;for(let t=0;t<Math.PI;t+=0.01)ym=Math.max(ym,s.r(t)*Math.sin(t));y0=-ym;y1=ym;}
  if(p==='wall'){x0=-R/8-2;y0=-0.66*R;y1=0.66*R;}
  if(sim.p.walk&&atLeast('ap'))x1=Math.max(x1,sim.p.edge+4);
  const PW=545,SC=Math.min((PW-30)/(x1-x0),420/(y1-y0)),CX=15+(PW-30-(x1-x0)*SC)/2-x0*SC,CY=225+(y0+y1)/2*SC;
  const PX=x=>CX+x*SC,PY=y=>CY-y*SC;
  /* lawn and grid */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,0,PW+10,450);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;
  for(let x=Math.ceil(-CX/SC/5)*5;PX(x)<=PW+10;x+=5){ctx.beginPath();ctx.moveTo(PX(x),0);ctx.lineTo(PX(x),450);ctx.stroke();}
  for(let y=Math.floor(CY/SC/5)*5;PY(y)<=450;y-=5){ctx.beginPath();ctx.moveTo(0,PY(y));ctx.lineTo(PW+10,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  /* house wall */
  if(p==='wall'){const wx=PX(-R/8-1);ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(0,0,wx,450);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(wx,0);ctx.lineTo(wx,450);ctx.stroke();
   ctx.save();ctx.translate(wx-8,225);ctx.rotate(-Math.PI/2);txt(ctx,'House wall',0,0,{s:12*k,w:700,a:'center'});ctx.restore();}
  /* sidewalk */
  if(sim.p.walk&&atLeast('ap')){const ex=PX(sim.p.edge);ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(ex,0,4*SC,450);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(ex,0,4*SC,450);
   txt(ctx,'Sidewalk',ex+4,18*k,{s:12*k,w:700});}
  /* spray pattern */
  const path=()=>{ctx.beginPath();for(let i=0;i<=240;i++){const t=i/240*TAU,r=s.r(t);i?ctx.lineTo(PX(r*Math.cos(t)),PY(r*Math.sin(t))):ctx.moveTo(PX(r*Math.cos(t)),PY(r*Math.sin(t)));}ctx.closePath();};
  path();ctx.fillStyle=PAL['cv-water'];ctx.globalAlpha=.42;ctx.fill();ctx.globalAlpha=1;
  /* wasted spray past the sidewalk edge */
  if(sim.p.walk&&atLeast('ap')){ctx.save();path();ctx.clip();ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.45;ctx.fillRect(PX(sim.p.edge),0,800,450);ctx.restore();ctx.globalAlpha=1;}
  /* slices */
  if(sh){const sl=slices(sim,sim.p.n);
   if(sim.p.outer&&atLeast('honors')){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.2;sl.list.forEach(q=>{ctx.beginPath();ctx.moveTo(PX(0),PY(0));ctx.arc(PX(0),PY(0),q.mx*SC,-q.t0,-q.t1,true);ctx.closePath();ctx.stroke();});}
   ctx.fillStyle=PAL['s2'];ctx.strokeStyle=PAL['card'];ctx.lineWidth=1;sl.list.forEach((q,i)=>{ctx.globalAlpha=i%2?.35:.5;ctx.beginPath();ctx.moveTo(PX(0),PY(0));ctx.arc(PX(0),PY(0),q.mn*SC,-q.t0,-q.t1,true);ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.stroke();});}
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=3;path();ctx.stroke();
  /* head */
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(PX(0),PY(0),5,0,7);ctx.fill();
  /* reach marker */
  const rt=0,rx=PX(s.r(rt));ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([3,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PX(0),PY(0));ctx.lineTo(rx,PY(0));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,R+' ft',(PX(0)+rx)/2,PY(0)-7,{s:12*k,w:700,a:'center'});
  if(p==='wind'){const wy=24*k;ctx.strokeStyle=PAL['cv-soft'];ctx.fillStyle=PAL['cv-soft'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(30,wy);ctx.lineTo(100,wy);ctx.stroke();ctx.beginPath();ctx.moveTo(108,wy);ctx.lineTo(98,wy-6);ctx.lineTo(98,wy+6);ctx.closePath();ctx.fill();txt(ctx,'Wind',116,wy+4,{s:12*k,w:700,c:PAL['cv-soft']});}
  /* right panel: area bars */
  const BL=600,BW=70,BT=60,BB=380,amax=Math.max(500,Math.ceil(Math.max(s.A,slices(sim,4).hi,sim.p.guess,S&&S.g?S.g.A:0)*1.08/500)*500),BY=v=>BB-v/amax*(BB-BT);
  txt(ctx,'Area (sq ft)',BL+BW+5,BT-26,{s:12*k,w:700,a:'center'});
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const stp=amax>3000?1000:500;for(let v=0;v<=amax;v+=stp){ctx.beginPath();ctx.moveTo(BL-6,BY(v));ctx.lineTo(BL+2*BW+20,BY(v));ctx.stroke();txt(ctx,v.toLocaleString('en-US'),BL-10,BY(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  const gv=S&&S.g?S.g.A:sim.p.guess;ctx.fillStyle=PAL['s4'];ctx.fillRect(BL,BY(gv),BW,BB-BY(gv));txt(ctx,S&&S.g?'Your gut':'Your guess',BL+BW/2,BB+18*k,{s:12*k,w:700,c:PAL['s4'],a:'center'});
  txt(ctx,Math.round(gv).toLocaleString('en-US'),BL+BW/2,BY(gv)-6,{s:12*k,w:700,c:PAL['s4'],a:'center'});
  if(sh){ctx.fillStyle=PAL['s3'];ctx.fillRect(BL+BW+20,BY(s.A),BW,BB-BY(s.A));txt(ctx,'Real area',BL+BW*1.5+20,BB+18*k,{s:12*k,w:700,c:PAL['s3'],a:'center'});txt(ctx,Math.round(s.A).toLocaleString('en-US'),BL+BW*1.5+20,BY(s.A)-6,{s:12*k,w:700,c:PAL['s3'],a:'center'});}
  else txt(ctx,'?',BL+BW*1.5+20,BB-30,{s:34*k,w:700,c:PAL['s3'],a:'center'});
  if(sh)pill(ctx,sim.p.n+' slices: '+sq(slices(sim,sim.p.n).lo),PW/2,438-12*k,PAL['s2'],'#fff',13*Math.min(k,1.3));},
 narrate(sim){const s=shape(sim),n=sim.p.n;
  if(!shown(sim))return `The blue outline is where the spray lands. Each grid square is 25 sq ft. <b>How many square feet does it water?</b> Lock in your estimate to see the slices.`;
  const sl=slices(sim,n);if(sim.p.pattern==='circle')return `A full circle is one radius in every direction, so every slice is a perfect sector and they add to exactly <b>${sq(s.A)}</b>: π × ${sim.p.reach}².`;
  return `${n} inside slices add to ${sq(sl.lo)}${atLeast('honors')?` and ${n} outside slices to ${sq(sl.hi)}`:''}. <b>The real area, ${sq(s.A)}, is squeezed between them</b>, and thinner slices close the gap.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag <b>Your estimate</b> here to the number of square feet you think the blue spray pattern covers. Each grid square is 25 sq ft. Then lock it in.',
   honors:'Estimate the area inside the polar curve by feel, set <b>Your estimate</b>, then lock it in.'},
  lock(sim){const A=shape(sim).A,g=sim.p.guess;return {v:Math.abs(g-A),A:g,label:sq(g)};},
  solve(sim){const A=shape(sim).A;sim.peek=true;sim.p.n=Math.max(sim.p.n,36);sim.p.guess=Math.round(A/25)*25;return {v:0,A,label:sq(A)};},
  how:{bio:'The math cuts the pattern into thin pie slices. Each slice is almost a wedge of a circle, and a wedge’s area is easy to find. Add up all the wedges, make them thinner, and the total closes in on the real area.',
   honors:'Each slice is about a sector: ½r(θᵢ)²Δθ. Inside slices use the shortest r in each slice and come up short; outside slices use the longest and come up long. The true area is squeezed between them.',
   ap:'The limit of the polar Riemann sum is A = ½∫₀^{2π} r(θ)² dθ. For a limaçon r = a + b cos θ that is π(a² + b²/2); for a cardioid r = a(1 + cos θ) it is (3/2)πa².'},
  compare(sim,g,m){const off=g.A-m.A,pct=Math.round(Math.abs(off)/m.A*100),gal=Math.abs(off)*GAL,dep=m.A>0?0.5*g.A/m.A:0;
   if(pct<=5)return `Your gut was right on: within ${sq(Math.abs(off))} (${pct}%). Plan half an inch of water from your estimate and the lawn gets almost exactly that.`;
   return `You were off by <b>${sq(Math.abs(off))}</b> (${pct}%). Half an inch of water on ${sq(m.A)} takes ${galT(m.A*GAL)}. Plan it from your guess and you would put down <b>${galT(gal)} too ${off>0?'much':'little'}</b>: ${g.A>0?`the lawn would get ${fmtNum(dep,2)} inch instead of 0.5 inch`:'you would not plan any water at all'}${off>0?', and the rest runs off or soaks in too deep to help':', and the grass dries out'}.`;},
  again(sim){const P=['circle','wind','wall'];sim.p.pattern=P[Math.floor(Math.random()*3)];sim.p.reach=[18,20,22,25,28,30,35][Math.floor(Math.random()*7)];sim.p.guess=0;sim.peek=false;if(atLeast('honors'))sim.p.wind=[10,15,20,25,30][Math.floor(Math.random()*5)];}
 },
 onTourExit(sim){sim.peek=false;sim.tshow=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'Sprinkler A throws 20 ft in every direction. Sprinkler B throws 40 ft. How much more area does B water?',choices:['Twice as much','Three times as much','Four times as much'],correct:2,explain:'Area grows with the square of the radius: π(40)² ≈ 5,027 sq ft against π(20)² ≈ 1,257 sq ft. Doubling the throw quadruples the area, so B needs about four times the water for the same depth.'},
  {lvl:'bio',instant:true,q:'You estimate the area with 12 slices that each fit just inside the spray. What do you get compared with the real area?',choices:['A little too small','Exactly right','A little too big'],correct:0,explain:'Each inside slice leaves a sliver of wet lawn outside it, so the total comes up short, unless the pattern is a perfect circle. For the house pattern at 25 ft, 12 inside slices give about 573 sq ft against a real 736 sq ft.'},
  {lvl:'honors',instant:true,q:'One slice has a radius of 20 ft and an angle of 0.1 radian. About what is its area?',choices:['2 sq ft','20 sq ft','40 sq ft','200 sq ft'],correct:1,explain:'A sector has area ½r²Δθ = ½ × 400 × 0.1 = 20 sq ft. That is what each term in the polar Riemann sum adds.'},
  {lvl:'honors',instant:true,q:'On a windy day the same head throws 25 ft downwind but only 15 ft upwind (r = 20 + 5 cos θ). Compared with the calm 25 ft circle, how much area does it water?',choices:['The same, 1,963 sq ft','About 1,296 sq ft','About 982 sq ft'],correct:1,explain:'A = π(a² + b²/2) = π(400 + 12.5) ≈ 1,296 sq ft, about two-thirds of the calm-day 1,963 sq ft. The farthest throw alone does not tell you the area.'},
  {lvl:'ap',instant:true,q:'Which integral gives the area inside r = 12.5(1 + cos θ)?',choices:['∫₀^{2π} 12.5(1 + cos θ) dθ','½∫₀^{2π} [12.5(1 + cos θ)]² dθ','½∫₀^{π} 12.5(1 + cos θ) dθ','π[12.5(1 + cos θ)]²'],correct:1,explain:'Polar area is ½∫ r² dθ over one full trip around the curve, 0 to 2π. It works out to (3/2)π(12.5)² ≈ 736 sq ft.'},
  {lvl:'ap',instant:true,q:'A 25 ft full-circle head sits 20 ft from a straight sidewalk edge. In polar form the edge is r = 20 sec θ. About how much spray lands past the edge?',choices:['About 21 sq ft','About 102 sq ft','About 402 sq ft','About 750 sq ft'],correct:1,explain:'The curves cross where 20 sec θ = 25, at θ = ±0.6435. A = ½∫ (25² − 400 sec²θ) dθ over that range = 625(0.6435) − 400(0.75) ≈ 402.2 − 300 ≈ 102 sq ft.'}
 ],
 tour:[
  {title:'The spray pattern',text:'This head sits next to the house. It throws 25 ft straight out but only a little to the sides, so its wet area is a heart shape. Each grid square is 25 sq ft.',pause:true,setup:sim=>{sim.tshow=false;BioLab.setValues(sim,{pattern:'wall',reach:25,n:6,outer:false,walk:false});}},
  {title:'Cut it into slices',text:'Cut the pattern into 6 pie slices from the head. Each blue slice is a wedge of a circle that fits inside the spray. Together they cover 409 sq ft.',pause:true,setup:sim=>{sim.tshow=true;}},
  {title:'Thinner slices',text:'With 12 slices, the wedges hug the outline better: 573 sq ft. The gaps between the wedges and the outline are lawn the slices miss.',pause:true,setup:sim=>BioLab.setValues(sim,{n:12})},
  {title:'Thinner still',text:'With 72 slices the total is 709 sq ft and still climbing. It closes in on the real area, 736 sq ft.',pause:true,setup:sim=>BioLab.setValues(sim,{n:72})},
  {lvl:'honors',title:'Squeeze it from both sides',text:'Outside slices use the longest throw in each slice, so they overshoot: 764 sq ft with 72 slices. The real area sits between the inside and outside sums.',pause:true,setup:sim=>BioLab.setValues(sim,{outer:true})},
  {lvl:'honors',title:'One slice',text:'A slice with radius r and angle Δθ (in radians) has area ½r²Δθ. The polar Riemann sum adds ½r(θᵢ)²Δθ over every slice.',pause:true,setup:sim=>BioLab.setValues(sim,{n:12})},
  {lvl:'ap',title:'The integral',text:'Let the slices get infinitely thin: A = ½∫₀^{2π} (12.5(1 + cos θ))² dθ = (3/2)π(12.5)² ≈ 736 sq ft.',pause:true,setup:sim=>BioLab.setValues(sim,{n:72,outer:false})},
  {lvl:'ap',title:'Area between curves',text:'Now a full 25 ft circle next to a sidewalk 20 ft away. The red part lands on concrete: ½∫ (25² − (20 sec θ)²) dθ ≈ 102 sq ft of wasted spray.',pause:true,setup:sim=>BioLab.setValues(sim,{pattern:'circle',walk:true,edge:20})}
 ],
 lab:{bio:'<p><b>Question:</b> How many slices do you need to get within 5% of the real area?</p><ol><li>Choose <b>Next to the house</b> with a 25 ft throw. Press <b>Skip the guess</b> if you have not locked in an estimate.</li><li>Set the slices to 6, 12, 24, 48 and 72. Record a trial each time.</li><li>Compare each inside-slice estimate with the real area.</li></ol><p>Write one sentence: what happens to the gap each time you double the slices?</p>',
  honors:'<p><b>Question:</b> How does wind change the watered area?</p><ol><li>Choose <b>Windy day</b> with a 25 ft throw.</li><li>Set the wind push to 0, 10, 20, 30 and 40%. Record the area each time.</li><li>Check one value with A = π(a² + b²/2).</li></ol><p>Explain why the same farthest throw can water very different areas.</p>',
  ap:'<p><b>Question:</b> Where should the head go so little spray lands on the sidewalk?</p><ol><li>Choose <b>Full circle</b>, 25 ft, and turn on the sidewalk.</li><li>Record the wasted area for edges at 10, 15, 20 and 24 ft.</li><li>Check one value with ½∫ (r_outer² − r_inner²) dθ.</li></ol><p><b>CER:</b> How far from the sidewalk should this head sit to waste under 50 sq ft? Use your data and the integral.</p>'},
 terms:[
  {t:'Sector',d:'A pie-slice piece of a circle. With radius r and angle Δθ in radians, its area is ½r²Δθ.'},
  {t:'Polar curve',d:'A curve given by r(θ): the distance from a center point in each direction θ.',lvl:'honors'},
  {t:'Polar Riemann sum',d:'Σ ½r(θᵢ)²Δθ: the area estimated by adding thin sectors.',lvl:'honors'},
  {t:'Limaçon and cardioid',d:'r = a + b cos θ is a limaçon. When a = b it is a cardioid, a heart shape that just reaches the center.',lvl:'honors'},
  {t:'Polar area integral',d:'A = ½∫ r(θ)² dθ; between two curves, ½∫ (r_outer² − r_inner²) dθ.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model.</b> The full circle is a rotary head throwing the same distance in every direction. The windy-day pattern uses a limaçon, r = a + b cos θ, as a simple stand-in for spray pushed one way by wind. The house pattern uses a cardioid, r = (R/2)(1 + cos θ). Real spray patterns are less tidy, and real sprinklers water unevenly: more lands near some parts of the pattern than others.</p><p><b>Water.</b> Half an inch of water on one square foot is 0.5/12 cubic feet, or about 0.31 gallons (7.48 gallons per cubic foot). Half an inch is an example amount for one watering, not a recommendation; how much a lawn needs depends on the grass, the soil and the weather.</p>'
};
BioLab.register(SIM);
})();
