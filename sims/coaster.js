(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,bars,legend,atLeast,fmtNum}=BioLab.h;
/* Site plans: the track passes H ft up at x = 0 (on the first drop), enters a tunnel at r1, leaves it at r2, and dives into a second tunnel at r3. */
const DESIGNS={A:{H:80,r:[30,75,150]},B:{H:72,r:[30,60,150]},C:{H:100,r:[30,70,160]}};
const S=3.9,OX=60,GY=434;                       /* 3.9 px per foot, same scale both ways */
const PX=x=>OX+x*S,PY=y=>GY-y*S;
const f1=v=>fmtNum(v,1),f0=v=>fmtNum(v,0);
const des=sim=>DESIGNS[sim.p.design];
/* While the student is still shaping by eye in Guided, the picture shows the marks but not the miss in feet. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const aOf=D=>-D.H/(D.r[0]*D.r[1]*D.r[2]);
const target=(D,x)=>aOf(D)*(x-D.r[0])*(x-D.r[1])*(x-D.r[2]);
/* The track: the cubic whose turning points are the dip (x1, y1) and the hill (x2, y2): y = y1 + (y2 − y1)(3u² − 2u³), u = (x − x1)/(x2 − x1). */
function track(p,x){const u=(x-p.x1)/(p.x2-p.x1);return p.y1+(p.y2-p.y1)*(3*u*u-2*u*u*u);}
/* turning points of the target, from y′ = a(3x² − 2Σr·x + Σrr) = 0 */
function turns(D){const [r1,r2,r3]=D.r,s=r1+r2+r3,ss=r1*r2+r1*r3+r2*r3,q=Math.sqrt(4*s*s-12*ss),xa=(2*s-q)/6,xb=(2*s+q)/6;return {x1:xa,y1:target(D,xa),x2:xb,y2:target(D,xb)};}
const NAMES=['the drop (x = 0)','the tunnel entrance','the tunnel exit','the second tunnel'];
function misses(sim,p){p=p||sim.p;const D=des(sim);return [Math.abs(track(p,0)-D.H),...D.r.map(r=>Math.abs(track(p,r)))];}
const worst=(sim,p)=>{const m=misses(sim,p);return Math.round(Math.max(...m)*1e6)/1e6;};
/* polynomial helpers (coefficients low → high) */
const pmul=(A,B)=>{const o=new Array(A.length+B.length-1).fill(0);A.forEach((a,i)=>B.forEach((b,j)=>{o[i+j]+=a*b;}));return o;};
function coeffs(p){const D=p.x2-p.x1,u=[-p.x1/D,1/D],u2=pmul(u,u),u3=pmul(u2,u),d=p.y2-p.y1;return [p.y1+3*d*u2[0]-2*d*u3[0],3*d*u2[1]-2*d*u3[1],3*d*u2[2]-2*d*u3[2],-2*d*u3[3]];}
const slope=(p,x)=>{const c=coeffs(p);return c[1]+2*c[2]*x+3*c[3]*x*x;};
function zeros(p){const out=[];let px=-40,py=track(p,px);for(let x=-39.5;x<=230;x+=0.5){const y=track(p,x);if(py===0)out.push(px);else if(py*y<0){let a=px,b=x;for(let i=0;i<50;i++){const m=(a+b)/2;(track(p,a)*track(p,m)<=0)?b=m:a=m;}out.push((a+b)/2);}px=x;py=y;}return out;}
function steepest(sim,p){p=p||sim.p;const D=des(sim);let best=0;for(let x=0;x<=D.r[2]+1e-9;x+=0.25)best=Math.max(best,-slope(p,x));return Math.atan(Math.max(0,best))*180/Math.PI;}
const cubicText=c=>{const t=(v,pw)=>{const s=Math.abs(v)<1?String(+Math.abs(v).toPrecision(3)):Math.abs(v).toFixed(2);return (v<0?' − ':' + ')+s+(pw?pw:'');};return ('y ='+t(c[3],'x³')+t(c[2],'x²')+t(c[1],'x')+t(c[0],'')).replace('= − ','= −').replace('= + ','= ');};

function tag(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,x0=o.a==='right'?x-w:o.a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s,w+6,o.s*1.3);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}
const SIM={
 id:'coaster',hash:'coaster',apUnit:3,order:5,tab:'Coaster track',kind:'Simulation',
 card:'Shape a roller-coaster track by eye to hit four required marks, then build it exactly from its zeros.',
 title:'Build a coaster track from its zeros',
 lede:{bio:'The plan says where the track must be: 80 ft up on the first drop, then down into a tunnel and back out, over a hill, and into a second tunnel. One smooth polynomial curve can hit all four marks.',
  honors:'The three places the track crosses ground level are zeros, so the track is y = a(x − r₁)(x − r₂)(x − r₃). The starting height fixes a. A cubic has at most two turning points, here one dip and one hill.',
  ap:'For y = a(x − r₁)(x − r₂)(x − r₃), the turning points solve y′ = a(3x² − 2Σr·x + Σrᵢrⱼ) = 0, and the slope tells you how steep each drop is: angle = arctan|y′|.'},
 scale:'Side view of one track section. Distances and heights in feet, drawn to the same scale. The ground is at height 0.',
 aspect:4/3,timeless:true,trials:true,graph:true,
 controlsTitle:'Your track',
 controls:[
  {id:'design',label:'Site plan',type:'seg',def:'A',options:[{v:'A',l:'Plan A'},{v:'B',l:'Plan B'},{v:'C',l:'Plan C'}],help:'Each plan fixes the drop height and where the track meets the ground.'},
  {id:'x1',label:'Your dip: distance along the track',type:'range',min:10,max:95,step:0.5,def:60,unit:' ft'},
  {id:'y1',label:'Your dip: height (below 0 is underground)',type:'range',min:-30,max:20,step:0.5,def:0,unit:' ft',help:'Or click the picture near the dip.'},
  {id:'x2',label:'Your hill: distance along the track',type:'range',min:100,max:170,step:0.5,def:135,unit:' ft'},
  {id:'y2',label:'Your hill: height',type:'range',min:0,max:60,step:0.5,def:45,unit:' ft',help:'Or click the picture near the hill.'},
  {id:'probe',label:'Read the height at',type:'range',min:0,max:160,step:1,def:100,unit:' ft along',lvl:'honors',noGut:true}
 ],
 actions:[{id:'build',label:'Build it from the zeros',lvl:'honors',run(sim){BioLab.setValues(sim,turns(des(sim)));}}],
 init(){return {};},step(){},
 metrics:[
  {id:'miss',label:'Worst miss at a required mark',unit:'ft',d:1,min:0,max:30,get:sim=>worst(sim)},
  {id:'start',label:'Track height at x = 0',unit:'ft',d:1,min:0,max:null,get:sim=>track(sim.p,0)},
  {id:'hprobe',label:'Height at the reading point',unit:'ft',d:1,lvl:'honors',min:-40,max:null,get:sim=>track(sim.p,sim.p.probe)},
  {id:'zeros',label:'Crosses ground level at x =',text:true,lvl:'honors',get:sim=>{const z=zeros(sim.p).filter(x=>x>=-20&&x<=200);return z.length?z.map(x=>f1(x)).join(', ')+' ft':'nowhere';}},
  {id:'steep',label:'Steepest drop',unit:'°',d:1,lvl:'ap',min:0,max:90,get:sim=>steepest(sim)},
  {id:'eq',label:'Your track in standard form',text:true,lvl:'ap',get:sim=>cubicText(coeffs(sim.p))}
 ],
 graphs:[{id:'misses',label:'Miss at each required mark',custom:true}],defaultGraph:'misses',
 plot(sim,ctx,box){const m=misses(sim),G=sim.gutS,same=G&&G.g&&G.g.design===sim.p.design,top=Math.max(10,Math.ceil(Math.max(...m,same?Math.max(...misses(sim,G.g.p)):0)/5)*5);
  const ax=axes(ctx,box,{xmin:0,xmax:4,ymin:0,ymax:top,xcats:['Drop','Tunnel in','Tunnel out','Tunnel 2'],yl:'Miss (ft)'});
  if(same){const g=misses(sim,G.g.p),bw=(ax.X(1)-ax.X(0))*0.3;g.forEach((v,i)=>{ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.85;ctx.fillRect(ax.X(i+0.5)-bw-2,ax.Y(Math.min(v,top)),bw,ax.Y(0)-ax.Y(Math.min(v,top)));});ctx.globalAlpha=1;
   m.forEach((v,i)=>{ctx.fillStyle=PAL['rj'];ctx.fillRect(ax.X(i+0.5)+2,ax.Y(Math.min(v,top)),bw,ax.Y(0)-ax.Y(Math.min(v,top)));txt(ctx,f1(v),ax.X(i+0.5)+2+bw/2,ax.Y(Math.min(v,top))-5,{s:12,w:600,c:PAL['fg'],a:'center'});});
   legend(ctx,box.L+10,box.T+8,[{label:'Your gut',color:PAL['s4']},{label:'Now',color:PAL['rj']}]);}
  else bars(ctx,ax,m.map(v=>Math.min(v,top)),{colors:m.map(()=>PAL['rj']),d:1});},
 draw(sim,ctx,vdt,k){const D=des(sim),p=sim.p,G=sim.gutS,same=G&&G.g&&G.g.design===sim.p.design,hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,600);
  /* grid every 10 ft */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.35;for(let x=-10;x<=190;x+=10){ctx.beginPath();ctx.moveTo(PX(x),PY(105));ctx.lineTo(PX(x),PY(-40));ctx.stroke();}for(let y=-30;y<=100;y+=10){ctx.beginPath();ctx.moveTo(PX(-15),PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  /* ground */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,PY(0),800,600-PY(0));ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,PY(0));ctx.lineTo(800,PY(0));ctx.stroke();
  txt(ctx,'Ground level',PX(-14),PY(0)-6,{s:12*k,c:PAL['cv-soft']});
  /* supports under the current track */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;for(let x=0;x<=D.r[2];x+=10){const y=track(p,x);if(y>2){ctx.beginPath();ctx.moveTo(PX(x),PY(0));ctx.lineTo(PX(x),PY(y));ctx.stroke();}}
  const path=(fn,col,lw,dash,from,to)=>{ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.setLineDash(dash||[]);ctx.beginPath();let st=false;for(let x=from;x<=to+1e-9;x+=1){const y=fn(x);if(y>110||y<-45){st=false;continue;}st?ctx.lineTo(PX(x),PY(y)):ctx.moveTo(PX(x),PY(y));st=true;}ctx.stroke();ctx.setLineDash([]);};
  /* extended curve faintly (end behavior) at honors */
  if(hon){ctx.globalAlpha=.4;path(x=>track(p,x),PAL['rj'],2,[4,5],-14,D.r[2]+30);ctx.globalAlpha=1;}
  if(same)path(x=>track(G.g.p,x),PAL['s4'],2.5,[8,5],0,D.r[2]);
  if(G&&G.m&&G.m.design===sim.p.design)path(x=>target(D,x),PAL['s3'],3,[2,4],0,D.r[2]);
  /* tunnel walls where the track is underground */
  ctx.fillStyle=PAL['cv-bg'];for(let x=0;x<D.r[2];x+=1){const y=track(p,x);if(y<0){ctx.globalAlpha=.9;ctx.fillRect(PX(x),PY(0),S+0.5,PY(y)-PY(0)+8);}}ctx.globalAlpha=1;
  path(x=>track(p,x),PAL['rj'],4.5,null,0,D.r[2]);
  /* required marks */
  const mk=[[0,D.H,'Drop: '+D.H+' ft up'],[D.r[0],0,'Tunnel in'],[D.r[1],0,'Tunnel out'],[D.r[2],0,'Tunnel 2']];
  const blind=gutPhase(sim);
  mk.forEach(([x,y,l],i)=>{const miss=Math.abs(track(p,x)-y),hit=miss<0.5&&!blind;ctx.strokeStyle=hit?PAL['s3']:PAL['s2'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(x),PY(y),9,0,7);ctx.stroke();
   if(i===0){tag(ctx,l,PX(x)+14,PY(y)-12,{s:12*k,w:700,c:hit?PAL['s3']:PAL['s2']});if(!hit&&!blind)tag(ctx,f1(miss)+' ft off',PX(x)+14,PY(y)+6+12*k,{s:12*k,c:PAL['cv-soft']});return;}
   const right=track(p,x+6)>track(p,x-6),lx=right?PX(x)+8:PX(x)-8,al=right?'left':'right',ly=PY(0)+12+12*k;
   tag(ctx,l,lx,ly,{s:12*k,w:700,c:hit?PAL['s3']:PAL['s2'],a:al});if(!hit&&!blind)tag(ctx,f1(miss)+' ft off',lx,ly+16*k,{s:12*k,c:PAL['cv-soft'],a:al});});
  /* handles */
  [[p.x1,p.y1,'dip'],[p.x2,p.y2,'hill']].forEach(([x,y,l],i)=>{ctx.fillStyle=PAL['card'];ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(x),PY(y),8,0,7);ctx.fill();ctx.stroke();
   tag(ctx,(blind?'your ':'')+l,PX(x),i===0?PY(y)+12+13*k:PY(y)-14,{s:13*k,w:700,c:PAL['rj'],a:'center'});});
  if(hon){const yv=track(p,p.probe);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(PX(p.probe),PY(0));ctx.lineTo(PX(p.probe),PY(yv));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(PX(p.probe),PY(yv),4,0,7);ctx.fill();}
  if(blind)pill(ctx,'Aim for all 4 blue circles',640,PY(96),PAL['s2'],'#fff',14*Math.min(k,1.3));
  else pill(ctx,'Worst miss: '+f1(worst(sim))+' ft',640,PY(96),worst(sim)<0.05?PAL['s3']:PAL['rj'],'#fff',14*k);
  if(same)txt(ctx,'Your gut: dashed orange',640,PY(96)+26*k,{s:12*k,w:700,c:PAL['s4'],a:'center'});},
 onClick(sim,x,y){const fx=(x-OX)/S,fy=(GY-y)/S,p=sim.p;const d1=Math.hypot(fx-p.x1,fy-p.y1),d2=Math.hypot(fx-p.x2,fy-p.y2);
  const r=v=>Math.round(v*2)/2;if(d1<=d2)BioLab.setValues(sim,{x1:clamp(r(fx),10,95),y1:clamp(r(fy),-30,20)});else BioLab.setValues(sim,{x2:clamp(r(fx),100,170),y2:clamp(r(fy),0,60)});},
 narrate(sim){const D=des(sim),m=misses(sim),w=Math.max(...m),i=m.indexOf(w);
  if(w<0.05)return `<b>All four marks hit.</b> The track passes ${D.H} ft up at the start and meets the ground exactly at ${D.r.join(', ')} ft. One cubic does it, because a cubic has room for three zeros and two turns.`;
  const p=sim.p,y=i===0?track(p,0):track(p,D.r[i-1]);
  if(i===0)return `The worst miss is at ${NAMES[0]}: the track is ${f1(y)} ft up instead of ${D.H} ft, <b>${f1(w)} ft ${y>D.H?'too high':'too low'}</b>. Moving the dip or hill changes the whole curve, including its far ends.`;
  return `The worst miss is at ${NAMES[i]} (x = ${D.r[i-1]} ft): the track is <b>${f1(Math.abs(y))} ft ${y>0?'above':'below'} ground</b> there instead of at ground level. Every support and the tunnel mouth would have to be rebuilt to fit.`;},
 gut:{better:'lower',
  controls:['y1','y2'],
  ask:{bio:'Shape the red track so it passes through all four blue circles. Click the picture where you want the bottom of the dip, then where you want the top of the hill: the nearer handle jumps to each click. Use the two sliders here to fine-tune their heights, then lock it in.',honors:'Before you build from the zeros: shape the track by eye. Click the picture to move the dip and hill, fine-tune their heights with the sliders here, then lock it in.'},
  lockLabel:'Lock in my track',
  lock(sim){const w=worst(sim);return {v:w,p:{x1:sim.p.x1,y1:sim.p.y1,x2:sim.p.x2,y2:sim.p.y2},design:sim.p.design,label:`a track whose worst miss is ${f1(w)} ft`};},
  solve(sim){const T=turns(des(sim));Object.assign(sim.p,T);const w=worst(sim);return {v:w,p:T,design:sim.p.design,label:atLeast('honors')?`y = a(x − ${des(sim).r.join(')(x − ')}), missing every mark by ${f1(w)} ft`:`a curve built from the three ground crossings, missing every mark by ${f1(w)} ft`};},
  how:{bio:'The track meets the ground at three known places, so the math writes it as a product: y = a(x − 30)(x − 75)(x − 150) for Plan A. Each factor is 0 at one crossing. Then it picks a to make the start height right: at x = 0, a(−30)(−75)(−150) = 80.',
   honors:'Zeros r₁, r₂, r₃ give the factors (x − r₁)(x − r₂)(x − r₃). Plugging in the start point (0, H) gives a = −H/(r₁r₂r₃). Then the dip and hill are wherever this cubic turns.',
   ap:'Build y = a(x − r₁)(x − r₂)(x − r₃) with a = −H/(r₁r₂r₃), then solve y′ = 0 for the turning points: 3x² − 2(r₁ + r₂ + r₃)x + (r₁r₂ + r₁r₃ + r₂r₃) = 0.'},
  compare(sim,g,m){const D=des(sim),gm=misses(sim,g.p),w=Math.max(...gm),i=gm.indexOf(w);
   if(g.v<0.5)return `Your gut was right on: your track misses no mark by more than ${f1(g.v)} ft. The factored form hits them all exactly, and it explains why your shape worked: three zeros and a start height pin down one cubic.`;
   const bad=gm.filter(x=>x>=1).length,y=i===0?track(g.p,0):track(g.p,D.r[i-1]);
   const where=i===0?`at the drop your track is ${f1(y)} ft up instead of ${D.H} ft`:`at ${NAMES[i]} (x = ${D.r[i-1]} ft) your track is ${f1(Math.abs(y))} ft ${y>0?'above':'below'} ground instead of at ground level`;
   return `The ${atLeast('honors')?'factored-form':'math'} track hits all four marks exactly. Yours misses ${bad} of them by a foot or more, and the worst: <b>${where}</b>. That is <b>${f1(w)} ft</b> of track in the wrong place: ${i===0?'the first drop would not line up with the lift hill':'the track would not meet the tunnel mouth'}. In a real park, every support near it would be built to the wrong height.`;},
  again(sim){const ks=Object.keys(DESIGNS);sim.p.design=ks[Math.floor(Math.random()*ks.length)];Object.assign(sim.p,{x1:60,y1:0,x2:135,y2:45});}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The track must meet ground level at three different places. What is the lowest degree polynomial that can do that?',choices:['1 (a line)','2 (a parabola)','3 (a cubic)','4'],correct:2,explain:'Each place the track meets ground level is a zero, and a polynomial of degree n has at most n real zeros. Three zeros need at least degree 3.'},
  {lvl:'bio',instant:true,q:'A track is y = a(x − 30)(x − 75)(x − 150). Where is it at ground level?',choices:['x = −30, −75 and −150','x = 30, 75 and 150','Only at x = 0','Nowhere'],correct:1,explain:'A product is 0 when one of its factors is 0: x − 30 = 0, x − 75 = 0 or x − 150 = 0. That is why factored form is the fastest way to build a curve through known zeros.'},
  {lvl:'honors',instant:true,q:'For Plan A, a is negative. If you kept the cubic going past x = 150, what would the track do?',choices:['Level off at ground level','Keep diving deeper forever','Turn back up into another hill','Repeat the same pattern'],correct:1,explain:'End behavior: the leading term is ax³ with a < 0, so y → −∞ as x → ∞ (and y → +∞ as x → −∞). A cubic has at most two turning points, and this one has used both. Turn on Closer look to see the faint extension.'},
  {lvl:'honors',instant:true,q:'A different track needs three hills and two dips (five turning points). What is the lowest possible degree?',choices:['4','5','6','10'],correct:2,explain:'A polynomial of degree n has at most n − 1 turning points. Five turning points need n − 1 ≥ 5, so degree 6. That is one reason designers chain short pieces (splines) instead of using one huge polynomial.'},
  {lvl:'ap',instant:true,q:'Plan A: zeros at 30, 75 and 150, and the track is 80 ft up at x = 0. What is a?',choices:['a = 80/337,500 ≈ 0.000237','a = −80/337,500 ≈ −0.000237','a = −80/255 ≈ −0.314','a = −1'],correct:1,explain:'y(0) = a(−30)(−75)(−150) = −337,500a = 80, so a = −80/337,500 ≈ −0.000237. It is negative because the product of three negative factors is negative.'},
  {lvl:'ap',instant:true,q:'For Plan A, y′(x) = a(3x² − 510x + 18,000). Where are the dip and the hill?',choices:['x = 30 and x = 75','x = 50 and x = 120','x = 85 and x = 170','x = 0 and x = 150'],correct:1,explain:'3x² − 510x + 18,000 = 0 means x² − 170x + 6,000 = 0, which factors as (x − 50)(x − 120). The dip is at x = 50 (about 11.9 ft underground) and the hill at x = 120 (about 28.8 ft up).'}
 ],
 tour:[
  {title:'The four marks',text:{bio:'This is one section of your coaster, seen from the side. The level fixes four marks: the track passes 80 ft up on the first drop at the start, enters a tunnel 30 ft along, comes out at 75 ft, and dives into a second tunnel at 150 ft.',honors:'This is one section of your coaster, seen from the side. The level fixes four marks: the track passes 80 ft up on the first drop at x = 0, enters a tunnel at 30 ft, comes out at 75 ft, and dives into a second tunnel at 150 ft.'},focus:[10,40,780,520],pause:true,setup:sim=>BioLab.setValues(sim,{design:'A',x1:60,y1:0,x2:135,y2:45})},
  {title:'Shape it with a dip and a hill',text:'The red track is one smooth curve. You shape it with two handles: the bottom of the dip and the top of the hill. Right now it misses most of the marks.',pause:true,focus:sim=>[PX(sim.p.x1)-40,PY(sim.p.y2)-40,PX(sim.p.x2)-PX(sim.p.x1)+80,PY(sim.p.y1)-PY(sim.p.y2)+80]},
  {title:'Close, but not exact',text:'Here is a good eyeball try: the dip 11 ft down at 51 ft along, the hill 29 ft up at 121 ft. It looks right, but its worst miss is still 3.6 ft. In steel and concrete, that is a lot.',pause:true,setup:sim=>BioLab.setValues(sim,{x1:51,y1:-11,x2:121,y2:29})},
  {title:'Zeros give the factors',text:'The track is at ground level (height 0) at x = 30, 75 and 150. Those are zeros, so the track is y = a(x − 30)(x − 75)(x − 150). Each factor is 0 at one crossing.',pause:true},
  {title:'The start height gives a',text:'At x = 0 the track must be 80 ft up: a(−30)(−75)(−150) = 80, so a = −80/337,500 ≈ −0.000237. Now every mark is hit exactly.',pause:true,setup:sim=>BioLab.setValues(sim,turns(DESIGNS.A))},
  {lvl:'honors',title:'Degree, turns and end behavior',text:'A cubic has at most 2 turning points: here, the dip and the hill. With a < 0 it rises to the left and falls to the right forever, as the faint extension shows.',pause:true},
  {lvl:'ap',title:'Slopes from the derivative',text:'y′ = a(3x² − 510x + 18,000) is 0 at x = 50 and x = 120. The steepest drop on this section is at x = 0, where y′ ≈ −4.27, an angle of about 76.8°.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How close can you get by eye?</p><ol><li>For Plan A, shape the track by eye. Record a trial with your worst miss.</li><li>Try two more times and record each.</li><li>Then do the same for Plan B.</li></ol><p>Write one sentence: why is it so hard to hit all four marks at once by moving only the dip and hill?</p>',
  honors:'<p><b>Question:</b> Does the factored form always hit the marks?</p><ol><li>For each plan, write y = a(x − r₁)(x − r₂)(x − r₃) and solve for a from the start height.</li><li>Use <b>Read the height at</b> to check your equation at two other points.</li><li>Press <b>Build it from the zeros</b> and compare.</li></ol>',
  ap:'<p><b>Question:</b> Where is each plan steepest?</p><ol><li>For each plan, find y′(x) and its zeros (the dip and the hill).</li><li>Find the steepest drop on 0 ≤ x ≤ r₃ and its angle, arctan|y′|.</li><li>Check against <b>Steepest drop</b>.</li></ol><p><b>CER:</b> Claim, evidence from your calculations, and reasoning about where a downward-opening y′ is most negative on an interval.</p>'},
 terms:[
  {t:'Zero (root)',d:'An x-value where the polynomial equals 0. Here, where the track is at ground level.'},
  {t:'Factored form',d:'y = a(x − r₁)(x − r₂)(x − r₃): it shows the zeros r₁, r₂, r₃ directly.'},
  {t:'Turning point',d:'Where the graph switches between rising and falling: the dip and the hill.'},
  {t:'Degree',d:'The highest power of x. A degree-n polynomial has at most n zeros and at most n − 1 turning points.',lvl:'honors'},
  {t:'End behavior',d:'What y does as x → ±∞. For a cubic with a < 0: up on the left, down on the right.',lvl:'honors'},
  {t:'Spline',d:'A chain of short polynomial pieces joined smoothly. Real tracks, roads and fonts are built from splines.',lvl:'honors'},
  {t:'Derivative',d:'The slope function y′(x). Turning points are where y′ = 0; the drop angle is arctan|y′|.',lvl:'ap'}
 ],
 about:'<p>Your track is the cubic with its turning points at your dip (x₁, y₁) and hill (x₂, y₂): y = y₁ + (y₂ − y₁)(3u² − 2u³) with u = (x − x₁)/(x₂ − x₁). The math track is y = a(x − r₁)(x − r₂)(x − r₃) with a = −H/(r₁r₂r₃). <b>Worst miss</b> is the largest vertical gap at the four required marks.</p><p>The site plans are made up for practice. Real coaster tracks are designed in software as chains of curves and checked for the forces riders feel, the track’s banking and the train’s speed, none of which this model includes. One cubic for a whole section is a simplification.</p>'
};
BioLab.register(SIM);
})();
