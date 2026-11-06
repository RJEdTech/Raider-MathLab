(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,atLeast,fmtNum}=BioLab.h;
const G=20,OX=400,OY=225,PX=x=>OX+x*G,PY=y=>OY-y*G;     /* 20 px per grid square; origin at the center */
const XM=19,YM=10;
/* The character: unit squares given by their lower-left corners, relative to the antenna tip at (0, 0). Kind 1 = body, 2 = eye, 3 = antenna. */
const CELLS=[[-2,-3,1],[-1,-3,1],[0,-3,1],[-2,-2,1],[-1,-2,2],[0,-2,1],[0,-1,3],[1,-3,1],[-2,-4,1],[0,-4,1]];
/* w: the move in plain words, for Big picture. */
const T={tr:{l:'Translate: (x, y) → (x + 7, y − 3)',w:'The move: slide 7 squares right and 3 squares down',o:'Slide 7 right, 3 down',f:p=>[p[0]+7,p[1]-3]},
 ry:{l:'Reflect across the y-axis: (x, y) → (−x, y)',w:'The move: flip across the y-axis, the up-down line through the center',o:'Flip across the up-down axis',f:p=>[-p[0],p[1]],line:'y'},
 rx:{l:'Reflect across the x-axis: (x, y) → (x, −y)',w:'The move: flip across the x-axis, the left-right line through the center',o:'Flip across the left-right axis',f:p=>[p[0],-p[1]],line:'x'},
 r180:{l:'Rotate 180° about the origin: (x, y) → (−x, −y)',w:'The move: turn halfway around the center point',o:'Turn halfway around the center',f:p=>[-p[0],-p[1]]},
 r90:{l:'Rotate 90° counterclockwise: (x, y) → (−y, x)',f:p=>[-p[1],p[0]]},
 r270:{l:'Rotate 90° clockwise: (x, y) → (y, −x)',f:p=>[p[1],-p[0]]},
 yx:{l:'Reflect across y = x: (x, y) → (y, x)',f:p=>[p[1],p[0]],line:'yx'},
 dil:{l:'Dilate by 2 about the origin: (x, y) → (2x, 2y)',f:p=>[2*p[0],2*p[1]]},
 half:{l:'Dilate by ½ about the origin: (x, y) → (x/2, y/2)',f:p=>[p[0]/2,p[1]/2]}};
/* Two-step moves: [first, second]. "Swap the order" runs them the other way round. */
const COMBO={c1:{a:'rx',b:'tr5',l:'Reflect across the x-axis, then translate (x + 5, y + 1)'},
 c2:{a:'r90',b:'ry',l:'Rotate 90° counterclockwise, then reflect across the y-axis'},
 c3:{a:'trm',b:'dil',l:'Translate (x − 2, y + 1), then dilate by 2'}};
T.tr5={l:'Translate: (x, y) → (x + 5, y + 1)',f:p=>[p[0]+5,p[1]+1]};
T.trm={l:'Translate: (x, y) → (x − 2, y + 1)',f:p=>[p[0]-2,p[1]+1]};
const steps=sim=>{const m=sim.p.move;if(COMBO[m]){const c=COMBO[m];return atLeast('honors')&&sim.p.swap?[c.b,c.a]:[c.a,c.b];}return [m];};
const apply=(sim,p,n)=>{const s=steps(sim);let q=p;for(let i=0;i<(n===undefined?s.length:n);i++)q=T[s[i]].f(q);return q;};
const tip=sim=>[sim.p.sx,sim.p.sy];
const img=sim=>apply(sim,tip(sim));
const moveLabel=sim=>{const m=sim.p.move;if(!COMBO[m])return !atLeast('honors')&&T[m].w?T[m].w:T[m].l;const s=steps(sim);return COMBO[m].l.replace(/^(.*), then (.*)$/,(z,a,b)=>atLeast('honors')&&sim.p.swap?b.charAt(0).toUpperCase()+b.slice(1)+', then '+a.charAt(0).toLowerCase()+a.slice(1):z);};
const PXSQ=16;                                   /* assumed screen pixels per grid square */
const cellsOf=(sim,n)=>CELLS.map(c=>{const pts=[[c[0],c[1]],[c[0]+1,c[1]],[c[0]+1,c[1]+1],[c[0],c[1]+1]].map(q=>apply(sim,[sim.p.sx+q[0],sim.p.sy+q[1]],n));return {pts,kind:c[2]};});
const fits=(sim)=>{for(let n=0;n<=steps(sim).length;n++)for(const c of cellsOf(sim,n))for(const p of c.pts)if(Math.abs(p[0])>XM||Math.abs(p[1])>YM)return false;return true;};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const shown=sim=>sim.st.shown||!!(sim.gutS&&sim.gutS.m);
const n1=v=>Number.isInteger(v)?String(v):fmtNum(v,1);
const pt=p=>`(${n1(p[0])}, ${n1(p[1])})`;
const sq=v=>Math.abs(v-Math.round(v))<1e-9?String(Math.round(v)):fmtNum(v,1);
const clearGut=sim=>{sim.st.shown=false;if(sim.gutS&&sim.gutS.g){sim.gutS.g=null;sim.gutS.m=null;BioLab.gutRender(sim);}};

function drawSprite(ctx,cells,body,eye,alpha,outline){ctx.globalAlpha=alpha;cells.forEach(c=>{ctx.beginPath();c.pts.forEach((p,i)=>i?ctx.lineTo(PX(p[0]),PY(p[1])):ctx.moveTo(PX(p[0]),PY(p[1])));ctx.closePath();
 if(outline){ctx.strokeStyle=body;ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);}else{ctx.fillStyle=c.kind===2?eye:(c.kind===3?'#d9a521':body);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.stroke();}});ctx.globalAlpha=1;}
function dot(ctx,p,col,r){ctx.fillStyle=col;ctx.beginPath();ctx.arc(PX(p[0]),PY(p[1]),r,0,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}

const SIM={
 id:'sprites',hash:'sprites',apUnit:12,order:3,tab:'Moving a game sprite',kind:'Simulation',
 card:'Predict where a game character lands after a move, then use coordinate rules to place it exactly.',
 title:'Where does the sprite land?',
 lede:{bio:'A video game moves a character by changing the coordinates of every point in it. Slides, flips and turns each have a simple rule. Predict where the antenna tip lands, then let the rule place it.',
  honors:'Translations, reflections and rotations are rules on coordinates, like (x, y) → (−y, x). Doing two in a row is a composition, and the order usually changes where the sprite ends up.',
  ap:'A dilation by k about the origin multiplies every coordinate by k, so lengths scale by k and areas by k². Compositions of these rules are what a game engine applies to every point of every object, every frame.'},
 scale:'A coordinate grid with the origin at the center. Each square is 1 unit; the antenna tip is the red dot.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The move',
 controls:[
  {id:'gx',label:'Your prediction: x of the tip',type:'range',min:-XM,max:XM,step:1,def:0,help:'Or just click the grid.'},
  {id:'gy',label:'Your prediction: y of the tip',type:'range',min:-YM,max:YM,step:1,def:0},
  {id:'move',label:'The move',type:'select',def:'tr',noGut:true,onChange:clearGut,options:[{v:'tr',l:'Translate (x + 7, y − 3)'},{v:'ry',l:'Reflect across the y-axis'},{v:'rx',l:'Reflect across the x-axis'},{v:'r180',l:'Rotate 180°'},
   {v:'r90',l:'Rotate 90° counterclockwise',lvl:'honors'},{v:'r270',l:'Rotate 90° clockwise',lvl:'honors'},{v:'yx',l:'Reflect across y = x',lvl:'honors'},{v:'c1',l:'Reflect across x-axis, then translate',lvl:'honors'},{v:'c2',l:'Rotate 90°, then reflect across y-axis',lvl:'honors'},
   {v:'dil',l:'Dilate by 2',lvl:'ap'},{v:'half',l:'Dilate by ½',lvl:'ap'},{v:'c3',l:'Translate, then dilate by 2',lvl:'ap'}]},
  {id:'sx',label:'Start: x of the tip',type:'range',min:-8,max:8,step:1,def:-6,noGut:true,onChange:clearGut},
  {id:'sy',label:'Start: y of the tip',type:'range',min:-4,max:8,step:1,def:6,noGut:true,onChange:clearGut},
  {id:'swap',label:'Swap the order',type:'toggle',def:false,lvl:'honors',onChange:clearGut,help:'For two-step moves: do the second step first.'}
 ],
 actions:[{id:'show',label:'Apply the rule',run(sim){const p=img(sim);sim.st.shown=true;BioLab.setValues(sim,{gx:Math.round(clamp(p[0],-XM,XM)),gy:Math.round(clamp(p[1],-YM,YM))});sim.st.shown=true;}}],
 init(){return {shown:false};},step(){},
 onLevel(sim){const w=sim.ui.ctlW&&sim.ui.ctlW.move;if(!w)return;const b=!atLeast('honors'),O={tr:'Translate (x + 7, y − 3)',ry:'Reflect across the y-axis',rx:'Reflect across the x-axis',r180:'Rotate 180°'};
  w.querySelectorAll('option').forEach(o=>{if(O[o.value])o.textContent=b?T[o.value].o:O[o.value];});},
 metrics:[
  {id:'ix',label:'Tip lands at x',unit:'',d:1,min:null,max:null,get:sim=>shown(sim)?img(sim)[0]:NaN},
  {id:'iy',label:'Tip lands at y',unit:'',d:1,min:null,max:null,get:sim=>shown(sim)?img(sim)[1]:NaN},
  {id:'off',label:'Your pin is off by',unit:'squares',d:1,min:0,max:null,get:sim=>shown(sim)?dist([sim.p.gx,sim.p.gy],img(sim)):NaN},
  {id:'px',label:'On screen, at 16 px per square',unit:'px',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?PXSQ*dist([sim.p.gx,sim.p.gy],img(sim)):NaN},
  {id:'r0',label:'Tip’s distance from the origin, before',unit:'',d:2,lvl:'ap',min:0,max:null,get:sim=>Math.hypot(sim.p.sx,sim.p.sy)},
  {id:'r1',label:'Tip’s distance from the origin, after',unit:'',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?Math.hypot(...img(sim)):NaN}
 ],
 draw(sim,ctx,vdt,k){const Gs=sim.gutS||{},sh=shown(sim),s=steps(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.7;ctx.beginPath();for(let x=-XM;x<=XM;x++){ctx.moveTo(PX(x)+.5,PY(YM)-5);ctx.lineTo(PX(x)+.5,PY(-YM)+5);}for(let y=-YM;y<=YM;y++){ctx.moveTo(PX(-XM)-5,PY(y)+.5);ctx.lineTo(PX(XM)+5,PY(y)+.5);}ctx.stroke();ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(-XM)-5,OY);ctx.lineTo(PX(XM)+5,OY);ctx.moveTo(OX,PY(YM)-5);ctx.lineTo(OX,PY(-YM)+5);ctx.stroke();
  const ts=12*Math.min(k,1.5);[-15,-10,-5,5,10,15].forEach(v=>txt(ctx,String(v),PX(v),OY+ts+4,{s:ts,c:PAL['cv-soft'],a:'center'}));[-5,5].forEach(v=>txt(ctx,String(v),OX-6,PY(v)+4,{s:ts,c:PAL['cv-soft'],a:'right'}));
  /* reflection lines */
  const lines=s.map(id=>T[id].line).filter(Boolean);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2.5;ctx.setLineDash([8,6]);
  lines.forEach(l=>{ctx.beginPath();if(l==='y'){ctx.moveTo(OX,PY(YM));ctx.lineTo(OX,PY(-YM));}else if(l==='x'){ctx.moveTo(PX(-XM),OY);ctx.lineTo(PX(XM),OY);}else{ctx.moveTo(PX(-YM),PY(-YM));ctx.lineTo(PX(YM),PY(YM));}ctx.stroke();});ctx.setLineDash([]);
  /* the character before, the step in between, and after */
  drawSprite(ctx,cellsOf(sim,0),'#3f6fb0','#14213d',1,false);dot(ctx,tip(sim),'#d1293d',5);
  if(sh){if(s.length>1)drawSprite(ctx,cellsOf(sim,1),PAL['cv-soft'],null,0.9,true);drawSprite(ctx,cellsOf(sim,s.length),'#2f8f5b','#10331f',1,false);dot(ctx,img(sim),'#d1293d',5);}
  /* pins */
  const cross=(p,col)=>{const X=PX(p[0]),Y=PY(p[1]);ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(X,Y,9,0,7);ctx.moveTo(X-13,Y);ctx.lineTo(X+13,Y);ctx.moveTo(X,Y-13);ctx.lineTo(X,Y+13);ctx.stroke();};
  if(Gs.g&&(Gs.g.x!==sim.p.gx||Gs.g.y!==sim.p.gy)){cross([Gs.g.x,Gs.g.y],PAL['s4']);if(sh){ctx.strokeStyle=PAL['s4'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PX(Gs.g.x),PY(Gs.g.y));const q=img(sim);ctx.lineTo(PX(q[0]),PY(q[1]));ctx.stroke();ctx.setLineDash([]);}}
  if(!sh||dist([sim.p.gx,sim.p.gy],img(sim))>0.01)cross([sim.p.gx,sim.p.gy],PAL['rj']);
  /* the rule */
  const fs=13*k,lab=moveLabel(sim);ctx.font='700 '+fs+'px sans-serif';const tw=Math.min(780,ctx.measureText(lab).width+20);
  ctx.fillStyle=PAL['card'];ctx.globalAlpha=.92;rr(ctx,10,8,tw,fs+14,8);ctx.fill();ctx.globalAlpha=1;txt(ctx,lab,20,8+fs+3,{s:fs,w:700});
  const ls=12*k;let y=450-10;
  if(sh&&Gs.g)pill(ctx,'Your gut: '+sq(dist([Gs.g.x,Gs.g.y],img(sim)))+' squares off',790-ls*7.5,y-ls*0.4,PAL['s4'],'#000',ls);
  else if(!sh)txt(ctx,'Red cross: your prediction',790,y,{s:ls,w:700,c:PAL['rj'],a:'right'});},
 onClick(sim,x,y){BioLab.setValues(sim,{gx:Math.round(clamp((x-OX)/G,-XM,XM)),gy:Math.round(clamp((OY-y)/G,-YM,YM))});},
 narrate(sim){const s=steps(sim),p=tip(sim),q=img(sim);
  if(!shown(sim))return `The antenna tip starts at <b>${pt(p)}</b>. Apply the rule to those coordinates to find where it lands${s.length>1?': do the first step, then use its result in the second.':'.'}`;
  if(s.length>1){const mid=apply(sim,p,1);return `Step one takes the tip from ${pt(p)} to ${pt(mid)} (dashed outline). Step two takes it to <b>${pt(q)}</b>. ${atLeast('honors')?'Try <b>Swap the order</b>: the same two steps can land somewhere else.':''}`;}
  const m=sim.p.move;let why='';if(m==='ry'||m==='rx'||m==='yx')why=' A reflection flips the sprite, so the arm now points the other way.';else if(m==='r90'||m==='r270'||m==='r180')why=' A rotation turns the sprite without flipping it: the arm is still on its right-hand side.';else if(m==='dil'||m==='half')why=` Every length changed by the same factor, so the sprite keeps its shape.`;
  return `The rule sends ${pt(p)} to <b>${pt(q)}</b>.${why}`;},
 gut:{better:'lower',
  controls:['gx','gy'],
  ask:{bio:'Read the move at the top of the grid. Where will the red dot on the antenna land? Click that spot on the grid, use the two sliders here to fine-tune, then lock it in.',
   honors:'Predict where the tip lands without writing anything down. Click the grid or use the sliders here, then lock it in.'},
  lockLabel:'Lock in my prediction',
  lock(sim){const e=dist([sim.p.gx,sim.p.gy],img(sim));return {v:e,x:sim.p.gx,y:sim.p.gy,label:pt([sim.p.gx,sim.p.gy])};},
  solve(sim){const q=img(sim);sim.p.gx=q[0];sim.p.gy=q[1];sim.st.shown=true;return {v:0,label:pt(q)};},
  how:{bio:'The rule says exactly what happens to any point (x, y). Put in the tip’s coordinates and the rule gives the new ones. The game does the same thing to every corner of every square in the sprite.',
   honors:'For a two-step move, apply the first rule, then feed its result into the second. In general, f(g(p)) is not the same as g(f(p)), so order matters.',
   ap:'Each rule here is a function on points. Rotations, reflections and dilations about the origin are linear, so a game engine can store them as 2 × 2 matrices and combine a whole chain of moves into one matrix by multiplying.'},
  compare(sim,g,m){const e=g.v,px=Math.round(PXSQ*e);
   if(e<0.01)return `Your gut was right on: the tip lands at ${m.label}. You already ran the rule in your head. The math makes sure it works for every point, every frame, without a slip.`;
   return `The tip lands at <b>${m.label}</b>. Your prediction was <b>${sq(e)} squares off</b>: about <b>${px} pixels</b> if each square is ${PXSQ} px on screen. In a game, the character would be drawn in the wrong spot, maybe inside a wall.`;},
  again(sim){const pool=['tr','ry','rx','r180'].concat(atLeast('honors')?['r90','r270','yx','c1','c2']:[],atLeast('ap')?['dil','half','c3']:[]);
   for(let t=0;t<60;t++){sim.p.move=pool[Math.floor(Math.random()*pool.length)];sim.p.swap=atLeast('honors')&&Math.random()<0.3;sim.p.sx=Math.round(-8+16*Math.random());sim.p.sy=Math.round(-4+12*Math.random());if(sim.p.move==='half'){sim.p.sx=2*Math.round(sim.p.sx/2);sim.p.sy=2*Math.round(sim.p.sy/2);}if(fits(sim))break;}
   if(!fits(sim)){sim.p.move='ry';sim.p.swap=false;sim.p.sx=-6;sim.p.sy=6;}sim.p.gx=0;sim.p.gy=0;sim.st.shown=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The point (3, 5) is reflected across the y-axis. Where does it land?',choices:['(3, −5)','(−3, 5)','(−3, −5)','(5, 3)'],correct:1,explain:'Reflecting across the y-axis keeps y and flips the sign of x: (x, y) → (−x, y). So (3, 5) → (−3, 5), the same height on the other side of the y-axis.'},
  {lvl:'bio',instant:true,q:'A game slides a character with the rule (x + 4, y − 2). Its tip starts at (−1, 3). Where does it end up?',choices:['(3, 1)','(5, 1)','(3, 5)','(−5, 5)'],correct:0,explain:'Add 4 to x and subtract 2 from y: (−1 + 4, 3 − 2) = (3, 1). A translation moves every point by the same amount.'},
  {lvl:'honors',instant:true,q:'Rotate (2, 5) by 90° counterclockwise about the origin. Where does it land?',choices:['(5, −2)','(−5, 2)','(−2, −5)','(5, 2)'],correct:1,explain:'The rule is (x, y) → (−y, x): (2, 5) → (−5, 2). Check: it is still √29 from the origin, and it moved a quarter turn counterclockwise.'},
  {lvl:'honors',instant:true,q:'Point (2, 1). Plan A: reflect across the y-axis, then translate right 3. Plan B: translate right 3, then reflect across the y-axis. How far apart do they land?',choices:['They land in the same place','3 squares apart','6 squares apart','10 squares apart'],correct:2,explain:'Plan A: (−2, 1), then (1, 1). Plan B: (5, 1), then (−5, 1). They are 6 squares apart. Order matters.'},
  {lvl:'ap',instant:true,q:'Rotating 90° counterclockwise and then reflecting across the y-axis is the same as which single move?',choices:['Rotate 90° clockwise','Reflect across y = x','Reflect across the x-axis','Rotate 180°'],correct:1,explain:'(x, y) → (−y, x) → (y, x). That is the rule for reflecting across y = x. Two moves collapsed into one, which is exactly what a game engine does when it multiplies transformation matrices.'},
  {lvl:'ap',instant:true,q:'A sprite is dilated by 2 about the origin. How do its area and its distance from the origin change?',choices:['Both double','Area × 4, distance × 2','Area × 2, distance × 4','Both × 4'],correct:1,explain:'Every length doubles, including the distance from the origin. Area is length × length, so it grows by 2² = 4. The character here covers 10 squares before and 40 after.'}
 ],
 tour:[
  {title:'A sprite on a grid',text:'Games place characters with coordinates. This one’s antenna tip, the red dot, starts at (−6, 6). Every square in the sprite has coordinates too.',pause:true,setup:sim=>{BioLab.setValues(sim,{move:'tr',sx:-6,sy:6,swap:false,gx:0,gy:0});sim.st.shown=false;}},
  {title:'A translation',text:'The rule (x + 7, y − 3) slides every point 7 right and 3 down. The tip goes from (−6, 6) to (1, 3), and the whole sprite moves with it, unchanged.',pause:true,setup:sim=>SIM.actions[0].run(sim)},
  {title:'A reflection',text:'Reflecting across the y-axis keeps y and flips the sign of x: (−6, 6) goes to (6, 6). Look at the arm: the sprite is now a mirror image.',pause:true,setup:sim=>{BioLab.setValues(sim,{move:'ry'});SIM.actions[0].run(sim);}},
  {title:'A rotation',text:'Rotating 180° about the origin flips the sign of both coordinates: (−6, 6) goes to (6, −6). The sprite is upside down but not mirrored.',pause:true,setup:sim=>{BioLab.setValues(sim,{move:'r180'});SIM.actions[0].run(sim);}},
  {lvl:'honors',title:'Two steps',text:'Reflect across the x-axis, then translate (x + 5, y + 1). The dashed outline is the halfway point: (−6, −6). Then (−1, −5).',pause:true,setup:sim=>{BioLab.setValues(sim,{move:'c1'});SIM.actions[0].run(sim);}},
  {lvl:'honors',title:'Order matters',text:'Swap the order: translate first to (−1, 7), then reflect to (−1, −7). Same two steps, a different landing spot, 2 squares away.',pause:true,setup:sim=>{BioLab.setValues(sim,{swap:true});SIM.actions[0].run(sim);}},
  {lvl:'ap',title:'Dilation',text:'Dilating by ½ about the origin halves every coordinate: (−6, 6) goes to (−3, 3). The sprite keeps its shape, but each side is half as long and it covers a quarter of the area.',pause:true,setup:sim=>{BioLab.setValues(sim,{move:'half',swap:false});SIM.actions[0].run(sim);}}
 ],
 onTourExit(sim){sim.st.shown=false;},
 lab:{bio:'<p><b>Question:</b> Which moves are you best at predicting?</p><ol><li>For each of the four moves, lock in a prediction, then press <b>Apply the rule</b>. Record a trial.</li><li>Repeat with two different starting points.</li></ol><p>Write one sentence: which move fooled you most, and why?</p>',
  honors:'<p><b>Question:</b> When does the order of two moves matter?</p><ol><li>For each two-step move, find the landing spot in both orders.</li><li>Write each composition as one rule, like (x, y) → (y, x).</li><li>Find a pair of moves where the order does <i>not</i> matter, and explain why.</li></ol>',
  ap:'<p><b>Question:</b> How do dilations combine with other moves?</p><ol><li>For “Translate, then dilate by 2,” write the rule in both orders.</li><li>Show that the two results differ by a translation, and find it.</li></ol><p><b>CER:</b> Claim, evidence from your coordinates, and reasoning from the rules.</p>'},
 terms:[
  {t:'Translation',d:'A slide. Every point moves by the same amount: (x, y) → (x + a, y + b).'},
  {t:'Reflection',d:'A flip across a line. Across the y-axis: (x, y) → (−x, y). The image is a mirror image.'},
  {t:'Rotation',d:'A turn about a fixed point. 90° counterclockwise about the origin: (x, y) → (−y, x).'},
  {t:'Composition',d:'Doing one transformation, then another. The order usually changes the result.',lvl:'honors'},
  {t:'Dilation',d:'Scaling about a center. By k about the origin: (x, y) → (kx, ky). Lengths scale by k, areas by k².',lvl:'ap'}
 ],
 about:'<p>The tool applies each rule to every corner of every square in the sprite, then draws the result. Rotations are about the origin, and counterclockwise is the positive direction. For two-step moves, the dashed outline shows the result of the first step.</p><p><b>Pixels:</b> the conversion assumes each grid square is 16 pixels on screen, a common size for small game art. The character is original art made for this tool.</p>'
};
BioLab.register(SIM);
})();
