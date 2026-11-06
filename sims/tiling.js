(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,bars,atLeast,fmtNum}=BioLab.h;
const SH={tri:{n:3,name:'triangles',one:'triangle'},sq:{n:4,name:'squares',one:'square'},hex:{n:6,name:'hexagons',one:'hexagon'}};
const JOB={patio:{name:'patio',total:20,tile:0.01,stuff:'grout',line:'grout lines',lab:'20 m² patio, 100 cm² tiles'},
 comb:{name:'honeycomb',total:0.1,tile:0.000025,stuff:'wax wall',line:'wax walls',lab:'4,000 cells of 0.25 cm²'}};
const D2R=Math.PI/180;
const interior=n=>180*(n-2)/n;
/* Perimeter of a regular n-gon with area a: P = 2√(n·a·tan(180°/n)). */
const perim=(n,a)=>2*Math.sqrt(n*a*Math.tan(Math.PI/n));
const sideOf=(n,a)=>perim(n,a)/n;
/* In a tiling every edge is shared by two tiles, so edge length per unit area = P/(2a). Edge material for the job, in m. */
const edge=(job,n)=>{const J=JOB[job];return J.total*perim(n,J.tile)/(2*J.tile);};
const jobOf=sim=>atLeast('honors')?sim.p.job:'patio';
const f1=v=>fmtNum(v,1);
/* While the student is still picking in Guided, the floor does not show how much grout each shape needs. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const nm=n=>({3:'triangle',4:'square',5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon',9:'nonagon',10:'decagon',11:'11-gon',12:'dodecagon'})[n];

/* Polygon with one vertex at (cx,cy), first edge in direction phi (radians, screen y down handled by caller), side s. */
function polyAt(cx,cy,n,s,phi){const pts=[[cx,cy]];let x=cx,y=cy,d=phi;const e=2*Math.PI/n;for(let i=0;i<n-1;i++){x+=s*Math.cos(d);y-=s*Math.sin(d);pts.push([x,y]);d+=e;}return pts;}
function path(ctx,pts){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();}

function drawFloor(ctx,shape,box,fill,line,lw){const A=1500,{x0,y0,x1,y1}=box;
 ctx.save();ctx.beginPath();ctx.rect(x0,y0,x1-x0,y1-y0);ctx.clip();ctx.fillStyle=fill;ctx.fillRect(x0,y0,x1-x0,y1-y0);
 ctx.strokeStyle=line;ctx.lineWidth=lw;ctx.lineJoin='round';
 if(shape==='sq'){const s=Math.sqrt(A);ctx.beginPath();for(let x=x0;x<=x1+s;x+=s){ctx.moveTo(x,y0);ctx.lineTo(x,y1);}for(let y=y0;y<=y1+s;y+=s){ctx.moveTo(x0,y);ctx.lineTo(x1,y);}ctx.stroke();}
 else if(shape==='tri'){const s=Math.sqrt(4*A/Math.sqrt(3)),h=s*Math.sqrt(3)/2;for(let r=0;y0+r*h<=y1+h;r++){const y=y0+r*h,off=(r%2)*s/2;for(let x=x0-s+off;x<=x1+s;x+=s){path(ctx,[[x,y+h],[x+s,y+h],[x+s/2,y]]);ctx.stroke();}}}
 else{const s=Math.sqrt(2*A/(3*Math.sqrt(3))),h=Math.sqrt(3)*s;for(let c=0;x0+c*1.5*s<=x1+2*s;c++){const cx=x0+c*1.5*s,off=(c%2)*h/2;for(let cy=y0-h+off;cy<=y1+h;cy+=h){const pts=[];for(let i=0;i<6;i++)pts.push([cx+s*Math.cos(i*Math.PI/3),cy+s*Math.sin(i*Math.PI/3)]);path(ctx,pts);ctx.stroke();}}}
 ctx.restore();}

const SIM={
 id:'tiling',hash:'tiling',apUnit:12,order:1,tab:'Tiles and honeycombs',kind:'Simulation',
 card:'Guess which tile shape needs the least grout, then use interior angles and perimeter to see why bees build hexagons.',
 title:'Which shapes tile, and which one wastes the least?',
 lede:{bio:'A floor needs tiles that fit with no gaps. Only three regular shapes can do it alone: triangles, squares and hexagons. For the same area per tile, one of them needs the least grout.',
  honors:'Regular polygons tile alone only when their interior angle, 180(n − 2)/n, divides 360° evenly. Among the three that do, the hexagon has the least perimeter for its area.',
  ap:'For area a, a regular n-gon has perimeter P = 2√(n·a·tan(180°/n)). In a tiling each edge is shared by two tiles, so the edge material per unit area is P ÷ 2a, smallest for the hexagon.'},
 scale:'Left: copies of one shape meeting at a corner. Right: a patch of floor where every tile has the same area.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your tiles',
 controls:[
  {id:'shape',label:'Your pick: tile shape',type:'seg',def:'sq',options:[{v:'tri',l:'Triangles'},{v:'sq',l:'Squares'},{v:'hex',l:'Hexagons'}],onChange(sim){sim.p.n=SH[sim.p.shape].n;if(sim.ui.ctl&&sim.ui.ctl.n)sim.ui.ctl.n.set(sim.p.n);}},
  {id:'n',label:'Corner test: number of sides',type:'range',min:3,max:12,step:1,def:4,noGut:true,help:'Try any regular polygon. Do copies fit around one corner with no gap?'},
  {id:'job',label:'The job',type:'select',lvl:'honors',def:'patio',onChange(sim){if(sim.gutS&&sim.gutS.g){sim.gutS.g=null;sim.gutS.m=null;BioLab.gutRender(sim);}},options:[{v:'patio',l:'Patio: 20 m² of 100 cm² tiles (grout)'},{v:'comb',l:'Honeycomb: 4,000 cells of 0.25 cm² (wax)'}]}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'ang',label:'Interior angle (corner test)',unit:'°',d:1,min:0,max:180,get:sim=>interior(sim.p.n)},
  {id:'fit',label:'Copies that fit at a corner',unit:'',d:2,min:0,max:6,get:sim=>360/interior(sim.p.n)},
  {id:'edge',label:'Edge material for the job',unit:'m',d:1,min:0,max:null,get:sim=>edge(jobOf(sim),SH[sim.p.shape].n)},
  {id:'save',label:'Saved compared with squares',unit:'%',d:1,lvl:'honors',min:-20,max:20,get:sim=>{const j=jobOf(sim);return 100*(1-edge(j,SH[sim.p.shape].n)/edge(j,4));}},
  {id:'side',label:'Side of one tile',unit:'cm',d:2,lvl:'ap',min:0,max:null,get:sim=>100*sideOf(SH[sim.p.shape].n,JOB[jobOf(sim)].tile)},
  {id:'per',label:'Perimeter of one tile',unit:'cm',d:2,lvl:'ap',min:0,max:null,get:sim=>100*perim(SH[sim.p.shape].n,JOB[jobOf(sim)].tile)}
 ],
 graphs:[{id:'cmp',label:'Edge material by shape',custom:true}],defaultGraph:'cmp',
 plot(sim,ctx,box){const j=jobOf(sim),keys=['tri','sq','hex'],vals=keys.map(k=>edge(j,SH[k].n));
  const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:Math.ceil(vals[0]*1.25/10)*10,xcats:['Triangles','Squares','Hexagons'],yl:'Edge material (m)'});
  const G=sim.gutS||{};bars(ctx,ax,vals,{colors:keys.map(k=>k===sim.p.shape?PAL['rj']:PAL['cv-soft']),d:1});
  keys.forEach((k,i)=>{const tags=[];if(G.g&&G.g.shape===k&&G.g.job===j)tags.push('Your gut');if(G.m&&G.g&&G.g.job===j&&k==='hex')tags.push('Math');if(tags.length)txt(ctx,tags.join(' · '),ax.X(i+.5),ax.Y(vals[i])-22,{s:12,w:700,c:PAL['s4'],a:'center'});});},
 draw(sim,ctx,vdt,k){const n=sim.p.n,th=interior(n),j=jobOf(sim),J=JOB[j],sh=sim.p.shape;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* left: corner test */
  const cx=168,cy=232,s=134*Math.sin(Math.PI/n),fits=Math.floor(360/th+1e-9),exact=Math.abs(360/th-Math.round(360/th))<1e-9;
  txt(ctx,'Corner test: regular '+nm(n),cx,30,{s:14*Math.min(k,1.6),w:700,a:'center'});
  for(let i=0;i<fits;i++){const pts=polyAt(cx,cy,n,s,i*th*D2R);path(ctx,pts);ctx.fillStyle=PAL['s2'];ctx.globalAlpha=i%2?.35:.55;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.stroke();}
  const gap=360-fits*th;
  if(gap>1e-6){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,60,-(fits*th)*D2R,-360*D2R,true);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   const mid=(fits*th+gap/2)*D2R;txt(ctx,f1(gap)+'° gap',cx+80*Math.cos(mid),cy-80*Math.sin(mid)+5,{s:13*Math.min(k,1.6),w:700,c:PAL['s1'],a:'center'});}
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(cx,cy,4,0,7);ctx.fill();
  pill(ctx,exact?`${fits} × ${f1(th)}° = 360°: it tiles`:`${fits} × ${f1(th)}° = ${f1(fits*th)}°: no tiling`,cx,418,exact?PAL['s3']:PAL['s1'],'#fff',12*Math.min(k,1.6));
  /* right: the floor */
  const box={x0:350,y0:48,x1:786,y1:388},comb=j==='comb';
  drawFloor(ctx,sh,box,comb?'#e3a72f':'#c27a5a',comb?'#7a4b0c':'#efe8dc',comb?3:3.5);
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.strokeRect(box.x0,box.y0,box.x1-box.x0,box.y1-box.y0);
  txt(ctx,(comb?'Comb walls: ':sim.gutS&&sim.gutS.m?'The math’s floor: ':'Your floor: ')+SH[sh].name,box.x0,32,{s:14*Math.min(k,1.6),w:700});
  if(!atLeast('honors')||k<1.3)txt(ctx,'Every tile has the same area',box.x1,32,{s:12*Math.min(k,1.2),c:PAL['cv-soft'],a:'right'});
  if(gutPhase(sim))pill(ctx,`Your pick: ${SH[sh].name}. Least grout? Lock in to find out.`,(box.x0+box.x1)/2,418,PAL['s2'],'#fff',13*Math.min(k,1.4));
  else pill(ctx,`${f1(edge(j,SH[sh].n))} m of ${J.stuff}`,(box.x0+box.x1)/2,418,PAL['rj'],'#fff',14*Math.min(k,1.6));
  const G=sim.gutS;if(G&&G.g&&G.m&&G.g.shape!==sh&&G.g.job===j&&k<1.3)txt(ctx,'Your gut, '+SH[G.g.shape].name+': '+f1(G.g.v)+' m',box.x1,444,{s:12,w:700,c:PAL['s4'],a:'right'});},
 narrate(sim){const n=sim.p.n,th=interior(n),q=360/th,j=jobOf(sim),sh=sim.p.shape,e=edge(j,SH[sh].n);
  let a;if(Math.abs(q-Math.round(q))<1e-9)a=`A regular ${nm(n)} has ${f1(th)}° corners, and ${Math.round(q)} of them make exactly 360°, so <b>it tiles with no gaps</b>.`;
  else if(n===5)a=`A regular pentagon has 108° corners. Three make 324°, leaving a 36° gap, and a fourth will not fit. <b>Regular pentagons cannot tile alone.</b>`;
  else a=`A regular ${nm(n)} has ${f1(th)}° corners. Two make ${f1(2*th)}°, and a third would overlap. <b>It cannot tile alone.</b>`;
  return a+` On the floor, ${SH[sh].name} need ${f1(e)} m of ${JOB[j].stuff}${sh==='hex'?', the least of the three.':'.'}`;},
 gut:{better:'lower',controls:['shape'],
  ask:{bio:'Every tile covers the same area. Which shape needs the <b>least grout</b>, the cement that fills the lines between tiles? Click a shape here to see it on the floor, then lock in your pick.',
   honors:'Every tile has the same area. Which shape uses the least edge material for this job? Click a shape here, then lock in your pick before you compare.'},
  lockLabel:'Lock in my shape',
  lock(sim){const j=jobOf(sim),v=edge(j,SH[sim.p.shape].n);return {v,shape:sim.p.shape,job:j,label:`${SH[sim.p.shape].name}: ${f1(v)} m of ${JOB[j].stuff}`};},
  solve(sim){const j=jobOf(sim);sim.p.shape='hex';sim.p.n=6;const v=edge(j,6);return {v,shape:'hex',label:`hexagons: ${f1(v)} m of ${JOB[j].stuff}`};},
  how:{bio:'First the corner test: only triangles (6 × 60°), squares (4 × 90°) and hexagons (3 × 120°) fit around a point with no gap. Then the math compares their perimeters for the same area. The more sides, the rounder the shape, and round shapes wrap an area with less edge. The hexagon is the roundest shape that still tiles.',
   ap:'Perimeter for area a: P = 2√(n·a·tan(180°/n)), so P² ∝ n·tan(180°/n): 5.20 for triangles, 4.00 for squares, 3.46 for hexagons. Each edge is shared, so edge material = total area × P ÷ 2a. In 1999 Thomas Hales proved the honeycomb conjecture: no way of dividing a plane into equal areas uses less total edge than the hexagon grid, even with curved walls.'},
  compare(sim,g,m){const J=JOB[g.job||jobOf(sim)];if(g.shape==='hex')return `Your gut was right on. Hexagons need the least ${J.stuff}: ${f1(m.v)} m. You already sense that rounder shapes wrap an area with less edge, and the hexagon is the roundest shape that still tiles.`;
   const d=g.v-m.v,pc=100*d/g.v;return `Hexagons need <b>${f1(d)} m less ${J.stuff}</b> than ${SH[g.shape].name} (${f1(g.v)} m → ${f1(m.v)} m). That is <b>${f1(pc)}% less material</b> for exactly the same area covered.`;},
  again(sim){if(atLeast('honors'))sim.p.job=Math.random()<0.5?'patio':'comb';sim.p.shape=Math.random()<0.5?'sq':'tri';sim.p.n=SH[sim.p.shape].n;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Which of these regular polygons can tile a floor all by itself, with no gaps?',choices:['Pentagon','Hexagon','Octagon'],correct:1,explain:'A hexagon’s corners are 120°, and 3 × 120° = 360° exactly. A pentagon’s 108° corners leave a 36° gap (3 × 108° = 324°). An octagon’s 135° corners leave 90°, which is why octagon floors need small square tiles in the gaps.'},
  {lvl:'bio',instant:true,q:'Squares and hexagons with the same area each. Which needs less grout around it?',choices:['The square','The hexagon','They need the same'],correct:1,explain:'For the patio, squares need 400.0 m of grout and hexagons 372.2 m, about 6.9% less. The hexagon is closer to a circle, and a circle wraps an area with the least possible edge.'},
  {lvl:'honors',instant:true,q:'What is the interior angle of a regular octagon?',choices:['120°','135°','144°','150°'],correct:1,explain:'180(n − 2)/n = 180 × 6 ÷ 8 = 135°. Two octagons use 270° at a corner, leaving exactly 90°: room for a square. That is the classic octagon-and-square floor pattern.'},
  {lvl:'honors',instant:true,q:'Why does a regular dodecagon (12 sides) fail the corner test?',choices:['Its 150° angle does not divide 360° evenly','It has too many sides to draw','Its sides are too short'],correct:0,explain:'180 × 10 ÷ 12 = 150°. Two make 300°, leaving 60°, and a third would overlap. Only angles of 60°, 90° and 120° divide 360° among regular polygons.'},
  {lvl:'ap',instant:true,q:'As the number of sides grows, the perimeter of a regular polygon with area 1 approaches what value?',choices:['0','2√π ≈ 3.54','4','It keeps growing'],correct:1,explain:'P = 2√(n·tan(180°/n)) for area 1, and n·tan(180°/n) → π as n grows, so P → 2√π ≈ 3.545, the circumference of a circle with area 1. Hexagons get to 3.722, squares 4, triangles 4.559. Circles cannot tile, so the hexagon is the best that fits.'},
  {lvl:'ap',instant:true,q:'For the same area per tile, hexagon grout is what percent less than triangle grout?',choices:['About 7%','About 18%','About 30%','About 50%'],correct:1,explain:'The ratio is √(6 tan 30°) ÷ √(3 tan 60°) = √3.464 ÷ √5.196 = 0.8165, so hexagons use about 18.4% less. Against squares they save about 6.9%.'}
 ],
 tour:[
  {title:'Two questions',text:'Left: the corner test, where copies of one regular shape meet at a point. Right: a patch of floor where every tile has exactly the same area. You will find which shapes tile, then which one uses the least grout.',pause:true,setup:sim=>BioLab.setValues(sim,{shape:'sq',n:4,job:'patio'})},
  {title:'Squares pass the corner test',text:'A square’s corners are 90°. Four of them meet at a point and make exactly 360°, so squares cover a floor with no gaps.',focus:[10,10,320,430],pause:true},
  {title:'Pentagons fail',text:'A regular pentagon’s corners are 108°. Three make 324°, leaving a 36° gap, and a fourth will not fit. No arrangement of regular pentagons covers a floor.',focus:[10,10,320,430],pause:true,setup:sim=>BioLab.setValues(sim,{n:5})},
  {title:'The formula for one corner',text:'Any regular n-gon has interior angles of 180(n − 2)/n. It tiles alone only if 360 divided by that angle is a whole number. That happens for n = 3, 4 and 6 only.',focus:[10,10,320,430],pause:true,setup:sim=>BioLab.setValues(sim,{n:6})},
  {title:'Same area, different edge',text:'Now the floor. These triangles each cover the same area as the squares did, but their grout lines total 455.9 m for the patio, against 400.0 m for squares.',focus:[340,10,455,430],pause:true,setup:sim=>BioLab.setValues(sim,{shape:'tri'})},
  {title:'Hexagons win',text:'Hexagons need only 372.2 m. A hexagon is the roundest of the three, and round shapes wrap an area with less edge. Honeycomb cells are hexagons too, and a hexagon comb uses the least wall for cells of equal area.',focus:[340,10,455,430],pause:true,setup:sim=>BioLab.setValues(sim,{shape:'hex'})},
  {lvl:'ap',title:'Why it works',text:'Area a, n sides: P = 2√(n·a·tan(180°/n)). Each edge is shared by two tiles, so edge per unit area is P ÷ 2a. Thomas Hales proved in 1999 that no division of the plane into equal areas does better than hexagons.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Which regular polygons tile a floor alone?</p><ol><li>Set <b>Corner test</b> to each value from 3 to 12. Record a trial each time.</li><li>Graph <b>Trials</b> with sides on x and copies that fit on y.</li></ol><p>Write one sentence: which shapes gave a whole number, and why does that matter?</p>',
  honors:'<p><b>Question:</b> How much material does the best tile shape save?</p><ol><li>For each job, record the edge material for triangles, squares and hexagons.</li><li>Find the percent saved by hexagons compared with each of the others.</li><li>Does the percent change between the patio and the honeycomb? Explain why.</li></ol>',
  ap:'<p><b>Question:</b> Why does the hexagon win?</p><ol><li>Derive P = 2√(n·a·tan(180°/n)) from the area of a regular polygon, A = n·s² ÷ (4 tan(180°/n)).</li><li>Compute P for area 1 and n = 3, 4, 6, 8, 12, then the limit as n grows.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning about why the circle is the limit but cannot tile.</p>'},
 terms:[
  {t:'Regular polygon',d:'A polygon whose sides are all the same length and whose angles are all equal.'},
  {t:'Tessellation (tiling)',d:'Covering a flat surface with shapes that leave no gaps and do not overlap.'},
  {t:'Interior angle',d:'The angle inside a polygon at one corner. For a regular n-gon it is 180(n − 2)/n.'},
  {t:'Perimeter',d:'The total length around a shape. Here it measures how much grout, wax or fence one tile needs.',lvl:'honors'},
  {t:'Isoperimetric idea',d:'Of all shapes with the same area, the circle has the least perimeter. Regular polygons with more sides get closer to it.',lvl:'ap'}
 ],
 about:'<p><b>Corner test:</b> a regular n-gon tiles alone exactly when 360 ÷ [180(n − 2)/n] is a whole number, which happens only for n = 3, 4 and 6.</p><p><b>Edge material:</b> a regular n-gon with area a has perimeter P = 2√(n·a·tan(180°/n)). Each edge is shared by two tiles, so the total edge length is (total area) × P ÷ (2a). The model ignores the extra edge along the outer border and any cut tiles there, which matter less the bigger the floor. Grout is treated as a line: real grout joints also have a width and depth.</p><p>The jobs are examples: a 20 m² patio laid with 100 cm² tiles, and 4,000 cells of 0.25 cm² each. Real honeycomb cells are 3D, with walls of real thickness and a pointed base; this tool looks only at the hexagon pattern in the flat cross section.</p>'
};
BioLab.register(SIM);
})();
