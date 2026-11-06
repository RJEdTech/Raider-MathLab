(function(){
'use strict';
const {clamp,txt,pill,PAL,atLeast,fmtNum}=BioLab.h;
/* An original blocky F: no symmetry, so every rotation and flip shows. Area 8 squares. Its tip is the top-right corner (3, 5). */
const SHAPE=[[0,0],[1,0],[1,2],[2,2],[2,3],[1,3],[1,4],[3,4],[3,5],[0,5]];
const TIP=[3,5],AREA=8;
const S=20,OX=232,OY=225;                 /* 20 px per grid square; origin at (232, 225) */
const PX=x=>OX+x*S,PY=y=>OY-y*S;
const TR={
 rot90:{l:'Rotate 90° counterclockwise',m:()=>[[0,-1],[1,0]]},
 rot180:{l:'Rotate 180°',m:()=>[[-1,0],[0,-1]]},
 refY:{l:'Reflect across the y-axis',m:()=>[[-1,0],[0,1]]},
 refX:{l:'Reflect across the x-axis',m:()=>[[1,0],[0,-1]]},
 refD:{l:'Reflect across y = x',m:()=>[[0,1],[1,0]]},
 wide:{l:'Stretch 2× sideways',m:()=>[[2,0],[0,1]]},
 half:{l:'Squash to half height',m:()=>[[1,0],[0,0.5]]},
 shear:{l:'Shear: slide right by y',m:()=>[[1,1],[0,1]]},
 rotT:{l:'Rotate by θ',m:sim=>{const a=sim.p.theta*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return [[c,-s],[s,c]];}},
 none:{l:'Nothing',m:()=>[[1,0],[0,1]]}};
const mm=(A,B)=>[[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]];
const mv=(M,v)=>[M[0][0]*v[0]+M[0][1]*v[1],M[1][0]*v[0]+M[1][1]*v[1]];
const det=M=>M[0][0]*M[1][1]-M[0][1]*M[1][0];
const thenOn=sim=>atLeast('honors')&&sim.p.then!=='none';
const mA=sim=>TR[sim.p.first].m(sim),mB=sim=>thenOn(sim)?TR[sim.p.then].m(sim):TR.none.m();
const mat=sim=>mm(mB(sim),mA(sim));          /* first A, then B: the combined matrix is B·A */
const tip=sim=>mv(mat(sim),TIP);
const fm=v=>{if(Math.abs(v-Math.round(v))<1e-9)v=Math.round(v);const s=Number.isInteger(v)?String(v):v.toFixed(2);return (s==='-0'?'0':s).replace('-','−');};
const pt=p=>`(${fm(p[0])}, ${fm(p[1])})`;
const keyOf=sim=>sim.p.first+'|'+(thenOn(sim)?sim.p.then:'none')+'|'+(sim.p.first==='rotT'?sim.p.theta:'');
const gutG=sim=>{const G=sim.gutS;return G&&G.g&&G.g.key===keyOf(sim)?G.g:null;};
const solved=sim=>{const G=sim.gutS;return !!(G&&G.m&&G.m.key===keyOf(sim));};
const clearGut=sim=>{if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}};
const shown=sim=>sim.p.show||solved(sim);
const missOf=(sim,x,y)=>{const t=tip(sim);return Math.hypot(x-t[0],y-t[1]);};
const PXSQ=40;                               /* screen pixels per grid square, for the game-screen comparison */

function poly(ctx,pts,fill,stroke,alpha,dash){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(PX(p[0]),PY(p[1])):ctx.moveTo(PX(p[0]),PY(p[1])));ctx.closePath();
 if(fill){ctx.globalAlpha=alpha;ctx.fillStyle=fill;ctx.fill();ctx.globalAlpha=1;}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.setLineDash(dash||[]);ctx.stroke();ctx.setLineDash([]);}}
function arrow(ctx,x0,y0,x1,y1,col,w){const a=Math.atan2(y1-y0,x1-x0),h=9;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||3;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1-h*0.7*Math.cos(a),y1-h*0.7*Math.sin(a));ctx.stroke();
 ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-h*Math.cos(a-0.45),y1-h*Math.sin(a-0.45));ctx.lineTo(x1-h*Math.cos(a+0.45),y1-h*Math.sin(a+0.45));ctx.closePath();ctx.fill();}
/* a 2×2 matrix in brackets; returns its height */
function drawMat(ctx,M,x,y,fs,col){ctx.font='700 '+fs+'px '+BioLab.h.FONT;const cw=Math.max(...M.flat().map(v=>ctx.measureText(fm(v)).width))+fs*0.6,h=fs*2.5,w=cw*2+fs*0.4;
 ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+6,y);ctx.lineTo(x,y);ctx.lineTo(x,y+h);ctx.lineTo(x+6,y+h);ctx.moveTo(x+w-6,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h);ctx.lineTo(x+w-6,y+h);ctx.stroke();
 for(let r=0;r<2;r++)for(let c=0;c<2;c++)txt(ctx,fm(M[r][c]),x+fs*0.2+cw*(c+0.5)+fs*0.1,y+h*(r===0?0.3:0.75),{s:fs,w:700,c:col,a:'center',b:'middle'});return {w,h};}

const SIM={
 id:'matrices',hash:'matrices',apUnit:11,order:2,tab:'Matrices move shapes',kind:'Go further',prereq:[],
 card:'Predict where a matrix sends a shape’s corner, then multiply to see how far off your eye was.',
 title:'How a matrix moves a shape',
 lede:{bio:'Every time a game turns a character or a photo app rotates a picture, a computer multiplies each corner by a small grid of numbers called a matrix. Predict where a corner goes by eye, then let the multiplication put it there exactly.',
  honors:'A 2×2 matrix sends (1, 0) to its first column and (0, 1) to its second, and everything else follows. Doing one transformation and then another is matrix multiplication, and the order matters.',
  ap:'For M = [a b; c d], M·(x, y) = (ax + by, cx + dy). Doing A first and then B is the single matrix B·A. det M = ad − bc is the area scale factor; a negative determinant means the shape is flipped.'},
 scale:'One grid square is 1 unit. The F covers 8 squares, and its tip is the corner at (3, 5).',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The transformation',
 controls:[
  {id:'first',label:'Transformation',type:'select',def:'rot90',onChange:clearGut,options:[
   {v:'rot90',l:TR.rot90.l},{v:'rot180',l:TR.rot180.l},{v:'refY',l:TR.refY.l},{v:'refX',l:TR.refX.l},{v:'refD',l:TR.refD.l,lvl:'honors'},
   {v:'wide',l:TR.wide.l},{v:'half',l:TR.half.l},{v:'shear',l:TR.shear.l,lvl:'honors'},{v:'rotT',l:TR.rotT.l,lvl:'ap'}]},
  {id:'then',label:'Then do this second',type:'select',def:'none',lvl:'honors',onChange:clearGut,options:[{v:'none',l:'Nothing'},{v:'rot90',l:TR.rot90.l},{v:'rot180',l:TR.rot180.l},{v:'refY',l:TR.refY.l},{v:'refX',l:TR.refX.l},{v:'refD',l:TR.refD.l}]},
  {id:'theta',label:'θ for “Rotate by θ”',type:'range',min:0,max:360,step:15,def:30,unit:'°',lvl:'ap',noGut:true,onChange:clearGut,help:'Counterclockwise. Only used when the transformation is Rotate by θ.'},
  {id:'gx',label:'Your guess: tip lands at x =',type:'range',min:-10,max:10,step:0.5,def:0,unit:'',help:'Or click the grid.'},
  {id:'gy',label:'Your guess: tip lands at y =',type:'range',min:-10,max:10,step:0.5,def:0,unit:''},
  {id:'show',label:'Show the image',type:'toggle',def:false,help:'Multiply every corner by the matrix and draw the result.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'area',label:'Area of the image',unit:'squares',d:1,min:0,max:16,get:sim=>Math.abs(det(mat(sim)))*AREA},
  {id:'det',label:'Determinant',unit:'',d:2,lvl:'honors',min:-2,max:2,get:sim=>det(mat(sim))},
  {id:'flip',label:'Flipped over?',text:true,lvl:'honors',get:sim=>{const d=det(mat(sim));return Math.abs(d)<1e-9?'Squashed flat':d<0?'Yes: mirror image (det < 0)':'No (det > 0)';}}
 ],
 draw(sim,ctx,vdt,k){const fs=12*k,M=mat(sim),G=sim.gutS,GG=gutG(sim),sh=shown(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* grid */
  ctx.lineWidth=1;for(let i=-10;i<=10;i++){ctx.strokeStyle=PAL['line'];ctx.globalAlpha=i%5?0.6:1;ctx.beginPath();ctx.moveTo(PX(i),PY(-10.5));ctx.lineTo(PX(i),PY(10.5));ctx.stroke();ctx.beginPath();ctx.moveTo(PX(-10.5),PY(i));ctx.lineTo(PX(10.5),PY(i));ctx.stroke();}ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PX(-10.5),PY(0));ctx.lineTo(PX(10.5),PY(0));ctx.moveTo(PX(0),PY(-10.5));ctx.lineTo(PX(0),PY(10.5));ctx.stroke();
  [-10,-5,5,10].forEach(i=>{txt(ctx,String(i).replace('-','−'),PX(i),PY(0)+14*k,{s:fs*0.9,c:PAL['cv-soft'],a:'center'});txt(ctx,String(i).replace('-','−'),PX(0)-5,PY(i),{s:fs*0.9,c:PAL['cv-soft'],a:'right',b:'middle'});});
  txt(ctx,'x',PX(10.5)-2,PY(0)-6,{s:fs,w:700,c:PAL['cv-soft'],a:'right'});txt(ctx,'y',PX(0)+6,PY(10.5)+fs,{s:fs,w:700,c:PAL['cv-soft']});
  /* original F */
  poly(ctx,SHAPE,PAL['s2'],PAL['s2'],0.28);
  ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(PX(TIP[0]),PY(TIP[1]),5,0,7);ctx.fill();
  /* image */
  if(sh){if(thenOn(sim)){const A=mA(sim);poly(ctx,SHAPE.map(p=>mv(A,p)),null,PAL['cv-soft'],0,[6,5]);}
   poly(ctx,SHAPE.map(p=>mv(M,p)),PAL['rj'],PAL['rj'],0.3);
   if(atLeast('honors')){const e1=[M[0][0],M[1][0]],e2=[M[0][1],M[1][1]];arrow(ctx,PX(0),PY(0),PX(e1[0]),PY(e1[1]),PAL['s3'],3);arrow(ctx,PX(0),PY(0),PX(e2[0]),PY(e2[1]),PAL['s5'],3);}
   const t=tip(sim);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(PX(t[0]),PY(t[1]),6,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();}
  /* gut guess */
  const gx=GG?GG.x:sim.p.gx,gy=GG?GG.y:sim.p.gy;
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(gx),PY(gy),10,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(PX(gx)-14,PY(gy));ctx.lineTo(PX(gx)+14,PY(gy));ctx.moveTo(PX(gx),PY(gy)-14);ctx.lineTo(PX(gx),PY(gy)+14);ctx.lineWidth=1.5;ctx.stroke();
  /* labels: put each on the side away from the other */
  const t=tip(sim),lab=[];
  lab.push({x:PX(TIP[0]),y:PY(TIP[1]),s:'Tip (3, 5)',c:PAL['s2']});
  if(!(sh&&Math.hypot(gx-t[0],gy-t[1])<0.6)&&!(Math.hypot(gx-TIP[0],gy-TIP[1])<0.6))lab.push({x:PX(gx),y:PY(gy),s:GG?'Your gut':'Your guess',c:PAL['s4']});
  if(sh)lab.push({x:PX(t[0]),y:PY(t[1]),s:'Tip lands at '+pt(t),c:PAL['rj']});
  const placed=[];ctx.font='700 '+fs+'px '+BioLab.h.FONT;
  lab.forEach(L=>{const w=ctx.measureText(L.s).width+8,h=fs*1.4;const cand=[[L.x+12,L.y-h-4],[L.x+12,L.y+6],[L.x-12-w,L.y-h-4],[L.x-12-w,L.y+6],[L.x-w/2,L.y-h-16],[L.x-w/2,L.y+16]];
   let best=cand[0],bs=1e9;cand.forEach(c=>{let s=0;if(c[0]<4||c[0]+w>450||c[1]<2||c[1]+h>448)s+=1000;placed.forEach(p=>{const ox=Math.max(0,Math.min(c[0]+w,p[0]+p[2])-Math.max(c[0],p[0])),oy=Math.max(0,Math.min(c[1]+h,p[1]+p[3])-Math.max(c[1],p[1]));s+=ox*oy;});if(s<bs){bs=s;best=c;}});
   placed.push([best[0],best[1],w,h]);ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(best[0],best[1],w,h);ctx.globalAlpha=1;txt(ctx,L.s,best[0]+4,best[1]+h/2,{s:fs,w:700,c:L.c,b:'middle'});});
  /* right panel: the matrices */
  const x0=470,pf=Math.max(fs,Math.min(fs*1.4,17));ctx.fillStyle=PAL['card'];ctx.globalAlpha=.9;ctx.fillRect(x0-12,6,800-x0+6,438);ctx.globalAlpha=1;
  let y=12;const row=(s,c,w)=>{ctx.font=(w||600)+' '+pf+'px '+BioLab.h.FONT;const f2=Math.min(pf,pf*(800-x0-10)/ctx.measureText(s).width);txt(ctx,s,x0,y+pf,{s:f2,w:w||600,c:c||PAL['cv-ink']});y+=pf*1.45;};
  if(thenOn(sim)){row('1st: '+TR[sim.p.first].l+(sim.p.first==='rotT'?' ('+sim.p.theta+'°)':''),PAL['cv-soft']);row('2nd: '+TR[sim.p.then].l,PAL['cv-soft']);
   const b=drawMat(ctx,mB(sim),x0,y+4,pf,PAL['cv-ink']);txt(ctx,'·',x0+b.w+9,y+4+b.h/2,{s:pf*1.3,w:700,c:PAL['cv-ink'],a:'center',b:'middle'});const a=drawMat(ctx,mA(sim),x0+b.w+18,y+4,pf,PAL['cv-ink']);
   {ctx.font=(pf*0.9)+'px '+BioLab.h.FONT;if(x0+b.w+18+a.w+10+ctx.measureText('2nd · 1st').width<796)txt(ctx,'2nd · 1st',x0+b.w+18+a.w+10,y+4+a.h/2,{s:pf*0.9,c:PAL['cv-soft'],b:'middle'});}y+=a.h+10;
   txt(ctx,'=',x0+4,y+pf*1.6,{s:pf*1.3,w:700,c:PAL['rj'],b:'middle'});const mh=drawMat(ctx,M,x0+24,y+2,pf*1.2,PAL['rj']);txt(ctx,'M',x0+24+mh.w+10,y+2+mh.h/2,{s:pf*1.2,w:700,c:PAL['rj'],b:'middle'});y+=mh.h+12;}
  else if(!atLeast('honors')&&!(G&&G.g)&&!sh){const T=(t,sz,c,w)=>{ctx.font=(w||700)+' '+sz+'px '+BioLab.h.FONT;const f2=Math.min(sz,sz*(800-x0-14)/ctx.measureText(t).width);y+=f2*1.25;txt(ctx,t,x0,y,{s:f2,w:w||700,c});y+=f2*0.35;};
   y=24;T('The move',15*k,PAL['cv-soft'],600);T(TR[sim.p.first].l,19*k,PAL['cv-ink']);T('around the origin, (0, 0)',15*k,PAL['cv-soft'],500);y+=18*k;T('The tip at (3, 5) lands at',15*k,PAL['cv-soft'],600);T('?',34*k,PAL['rj']);y+=6*k;T('Lock in your guess to see the math.',14*k,PAL['cv-soft'],500);return;}
  else{row(TR[sim.p.first].l+(sim.p.first==='rotT'?' = '+sim.p.theta+'°':''),PAL['cv-soft']);
   const mh=drawMat(ctx,M,x0,y+2,pf*1.25,PAL['rj']);txt(ctx,'M',x0+mh.w+10,y+2+mh.h/2,{s:pf*1.25,w:700,c:PAL['rj'],b:'middle'});y+=mh.h+14;}
  row('M·(3, 5) = '+(sh?pt(t):'?'),sh?PAL['rj']:PAL['cv-ink'],700);
  if(sh&&atLeast('honors')){row(`= 3·${pt([M[0][0],M[1][0]])} + 5·${pt([M[0][1],M[1][1]])}`,PAL['cv-soft'],500);}
  y+=6;
  if(atLeast('honors')){const d=det(M);row('det M = '+fm(d),PAL['cv-ink'],700);row('Area: 8 → '+fm(Math.abs(d)*AREA)+' squares'+(d<0?', flipped':''),PAL['cv-soft'],500);
   if(sh&&y+pf*2.9<440){y+=4;ctx.fillStyle=PAL['s3'];ctx.fillRect(x0,y+pf*0.35,14,4);txt(ctx,'where (1, 0) lands',x0+20,y+pf*0.6,{s:pf*0.95,c:PAL['s3'],b:'middle'});y+=pf*1.4;ctx.fillStyle=PAL['s5'];ctx.fillRect(x0,y+pf*0.35,14,4);txt(ctx,'where (0, 1) lands',x0+20,y+pf*0.6,{s:pf*0.95,c:PAL['s5'],b:'middle'});}}
  else row('Area: 8 → '+fm(Math.abs(det(M))*AREA)+' squares',PAL['cv-soft'],500);},
 onClick(sim,x,y){if(x>455)return;BioLab.setValues(sim,{gx:clamp(Math.round((x-OX)/S*2)/2,-10,10),gy:clamp(Math.round((OY-y)/S*2)/2,-10,10)});},
 narrate(sim){const M=mat(sim),d=det(M),t=tip(sim);
  if(!shown(sim)&&!atLeast('honors')&&!(sim.gutS&&sim.gutS.g))return `The game applies <b>${TR[sim.p.first].l.toLowerCase()}</b> around the origin, (0, 0). <b>Where does the tip at (3, 5) end up?</b> Place your guess, then lock it in.`;
  if(!shown(sim))return `The matrix sends (1, 0) to ${pt([M[0][0],M[1][0]])} and (0, 1) to ${pt([M[0][1],M[1][1]])}. <b>Where does the tip at (3, 5) end up?</b> Place your guess, then turn on the image.`;
  const fl=d<0?' The determinant is negative, so the F is a mirror image now.':Math.abs(Math.abs(d)-1)<1e-9?' The area stays 8 squares.':` The area becomes ${fm(Math.abs(d)*AREA)} squares: the determinant is ${fm(d)}.`;
  return `<b>The tip lands at ${pt(t)}</b>: 3 times the first column plus 5 times the second. Every other corner of the F is multiplied the same way.${fl}`;},
 gut:{better:'lower',
  controls:['gx','gy'],
  ask:{bio:'Click the grid where you think the tip of the F lands after the move, or set the two sliders here. The orange crosshair is your guess. Go by eye, then lock it in.',
   honors:'Before you show the image: where will the tip land? Click the grid or set the sliders here by eye, then lock it in.'},
  lock(sim){const x=sim.p.gx,y=sim.p.gy;return {v:missOf(sim,x,y),x,y,key:keyOf(sim),label:`(${fm(x)}, ${fm(y)})`};},
  solve(sim){const t=tip(sim);sim.p.gx=t[0];sim.p.gy=t[1];sim.p.show=true;return {v:missOf(sim,t[0],t[1]),x:t[0],y:t[1],key:keyOf(sim),label:pt(t)};},
  how:{bio:'The matrix’s columns say where (1, 0) and (0, 1) go. The tip is 3 steps of (1, 0) and 5 steps of (0, 1), so it lands at 3 × (first column) + 5 × (second column).',
   ap:'M·(x, y) = (ax + by, cx + dy). With two steps, the combined matrix is (second)·(first), and you multiply it by the tip.'},
  compare(sim,g,m){const e=g.v;if(e<0.25)return `Your gut was right on: you put the tip at ${g.label}. Your eye already did this multiplication. The math shows why it works: 3 of the first column plus 5 of the second.`;
   const px=Math.round(e*PXSQ);return `Your guess was <b>${fmtNum(e,1)} grid squares</b> from where the tip really lands, ${m.label}. If one grid square were ${PXSQ} pixels on a game screen, the character’s corner would be drawn <b>${px} pixels</b> from where it belongs. The multiplication puts every corner in exactly the right place, every frame.`;},
  again(sim){const pool=atLeast('ap')?['rot90','rot180','refY','refX','refD','wide','half','shear','rotT']:atLeast('honors')?['rot90','rot180','refY','refX','refD','wide','half','shear']:['rot90','rot180','refY','refX','wide','half'];
   sim.p.first=pool[Math.floor(Math.random()*pool.length)];sim.p.then=atLeast('honors')&&Math.random()<0.5?['rot90','rot180','refY','refX','refD'][Math.floor(Math.random()*5)]:'none';
   sim.p.theta=15*(1+Math.floor(Math.random()*23));sim.p.gx=0;sim.p.gy=0;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Which matrix rotates a shape 90° counterclockwise? (Read each as top row; bottom row.)',choices:['0, −1; 1, 0','0, 1; 1, 0','−1, 0; 0, −1','1, 0; 0, −1'],correct:0,explain:'Its first column (0, 1) is where (1, 0) goes, and its second column (−1, 0) is where (0, 1) goes. Turning a quarter turn counterclockwise does exactly that. The second choice reflects across y = x, the third rotates 180°, and the fourth reflects across the x-axis.'},
  {lvl:'bio',instant:true,q:'The F covers 8 squares. A matrix stretches everything 2× sideways (top row 2, 0; bottom row 0, 1). How many squares does the image cover?',choices:['8','10','16','32'],correct:2,explain:'Stretching one direction by 2 doubles every area: 8 × 2 = 16 squares. The determinant, 2 × 1 − 0 × 0 = 2, is that area scale factor.'},
  {lvl:'honors',instant:true,q:'You rotate the F 90° counterclockwise and then reflect it across the x-axis. Your friend reflects first and then rotates. Do you get the same picture?',choices:['Yes, the order never matters','No: the two orders give different pictures','Only if the F is centered at the origin'],correct:1,explain:'Rotate then reflect is (reflect)·(rotate) = top row 0, −1; bottom row −1, 0: a reflection across y = −x. Reflect then rotate is (rotate)·(reflect) = top row 0, 1; bottom row 1, 0: a reflection across y = x. Matrix multiplication is not commutative. Try both with “Then do this second.”'},
  {lvl:'honors',instant:true,q:'A matrix has determinant −1. What does it do to the F?',choices:['Shrinks it to nothing','Keeps its area but flips it into a mirror image','Turns it upside down without flipping','Doubles its area'],correct:1,explain:'|det| = 1 means the area stays 8 squares. The negative sign means orientation reverses: the F reads backward. Every reflection has determinant −1; every rotation has determinant 1.'},
  {lvl:'ap',instant:true,q:'Rotate the F by θ = 30°. To two decimal places, where does the tip (3, 5) land?',choices:['(0.10, 5.83)','(5.10, 2.83)','(−0.10, 5.83)','(2.60, 4.33)'],correct:0,explain:'(3 cos 30° − 5 sin 30°, 3 sin 30° + 5 cos 30°) = (2.598 − 2.5, 1.5 + 4.330) = (0.10, 5.83). Its distance from the origin is still √34 ≈ 5.83, as it must be for a rotation.'},
  {lvl:'ap',instant:true,q:'The shear (top row 1, 1; bottom row 0, 1) slants the F to the right. What happens to its area?',choices:['It grows, because the shape gets wider','It stays 8 squares','It shrinks, because the shape leans','It depends on the shape'],correct:1,explain:'det = 1 × 1 − 1 × 0 = 1. Each horizontal strip slides sideways without changing length or thickness, so the area stays 8 squares (Cavalieri’s principle).'}
 ],
 tour:[
  {title:'The F and its tip',text:'This blue F covers 8 grid squares. Its tip, the top-right corner, is at (3, 5). The matrix on the right will move every point of the F.',focus:[[PX(-1),PY(6.5),PX(4.5)-PX(-1),PY(-1)-PY(6.5)]],pause:true,setup:sim=>BioLab.setValues(sim,{first:'rot90',then:'none',show:false,gx:3,gy:5})},
  {title:'Read the columns',text:'The first column of the matrix, (0, 1), is where the point (1, 0) goes. The second column, (−1, 0), is where (0, 1) goes. So this matrix turns everything a quarter turn counterclockwise.',focus:[[458,6,336,150]],pause:true},
  {title:'Multiply the tip',text:'The tip is 3 steps right and 5 steps up. After the matrix, that is 3 × (0, 1) + 5 × (−1, 0) = (−5, 3).',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,gx:-5,gy:3})},
  {title:'Every corner, same rule',text:'The computer multiplies every corner of the F the same way and connects the dots. That is the whole trick behind turning a character in a game.',pause:true},
  {title:'Area and the determinant',text:'Switch to “Stretch 2× sideways.” The F now covers 16 squares. The determinant, 2 × 1 − 0 × 0 = 2, is exactly that area scale factor.',pause:true,setup:sim=>BioLab.setValues(sim,{first:'wide',show:true,gx:6,gy:5})},
  {title:'Flipped',text:'A reflection across the y-axis keeps the area at 8 squares but turns the F into a mirror image. Its determinant is −1: the minus sign means flipped.',pause:true,setup:sim=>BioLab.setValues(sim,{first:'refY',show:true,gx:-3,gy:5})},
  {lvl:'honors',title:'Order matters',text:'Rotate 90° and then reflect across the x-axis. The dashed outline is the halfway point. The combined matrix is (second)·(first), and swapping the order gives a different picture.',pause:true,setup:sim=>BioLab.setValues(sim,{first:'rot90',then:'refX',show:true,gx:-5,gy:-3})},
  {lvl:'ap',title:'Any angle',text:'Rotation by θ uses top row cos θ, −sin θ and bottom row sin θ, cos θ. At 30°, the tip lands at (0.10, 5.83), still √34 ≈ 5.83 from the origin.',pause:true,setup:sim=>BioLab.setValues(sim,{first:'rotT',then:'none',theta:30,show:true,gx:0,gy:6})}
 ],
 lab:{bio:'<p><b>Question:</b> Which transformations change the area of the F?</p><ol><li>Choose each transformation in turn and turn on the image.</li><li>Record a trial for each, with the area of the image.</li></ol><p>Write one sentence: which ones change the area, and which ones keep it?</p>',
  honors:'<p><b>Question:</b> Does the order of two transformations matter?</p><ol><li>Set the first transformation to Rotate 90° and the second to Reflect across the x-axis. Record the tip’s landing spot.</li><li>Swap them and record again.</li><li>Repeat with Rotate 180° and Reflect across the y-axis.</li></ol><p>Which pairs give the same picture either way? Explain with matrix multiplication.</p>',
  ap:'<p><b>Question:</b> How is the determinant connected to area and to flipping?</p><ol><li>Record the determinant and the image area for six different transformations and pairs.</li><li>Find det = ad − bc by hand for two of them and compare.</li><li>For Rotate by θ, record the determinant at three angles.</li></ol><p><b>CER:</b> Claim about what the determinant measures, evidence from your table, and reasoning from where the unit square goes.</p>'},
 terms:[
  {t:'Matrix',d:'A rectangle of numbers. A 2×2 matrix moves every point of the plane by M·(x, y) = (ax + by, cx + dy).'},
  {t:'Image',d:'Where a shape ends up after a transformation.'},
  {t:'Columns of a matrix',d:'The first column is where (1, 0) lands; the second is where (0, 1) lands.',lvl:'honors'},
  {t:'Composition',d:'Doing one transformation and then another. A first, then B, is the single matrix B·A.',lvl:'honors'},
  {t:'Determinant',d:'det [a b; c d] = ad − bc. Its absolute value is the area scale factor; a negative value means the shape is flipped.',lvl:'honors'},
  {t:'Rotation matrix',d:'Top row cos θ, −sin θ; bottom row sin θ, cos θ. It turns the plane θ counterclockwise about the origin.',lvl:'ap'}
 ],
 about:'<p>The F is a polygon with corners on whole-number grid points and an area of 8 squares. Each transformation is a 2×2 matrix applied to every corner: M·(x, y) = (ax + by, cx + dy). With two steps, the combined matrix is (second)·(first). The area of the image is |det M| × 8.</p><p>These matrices fix the origin, so they cannot slide a shape. Real graphics systems use 3×3 matrices in 2D (and 4×4 in 3D) so that one multiplication can also move the shape. The “40 pixels per grid square” comparison is an assumption for illustration. On most computer screens, y counts down from the top; here y counts up, as in math class.</p>'
};
BioLab.register(SIM);
})();
