(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
const VX=280,VY=420,B=6.1;                  /* dish vertex on screen; 6.1 px per cm */
const PX=x=>VX+x*B,PY=y=>VY-y*B;
const f1=v=>fmtNum(v,1);
const foc=sim=>sim.p.w*sim.p.w/(16*sim.p.d);          /* p = w²/(16d) */
const aOf=sim=>4*sim.p.d/(sim.p.w*sim.p.w);            /* y = ax², a = 4d/w² */
const rad=sim=>(atLeast('ap')?sim.p.rs:5)/2;           /* receiver radius, cm */
const BEAM=2;                                          /* headlight: "straight ahead" means within 2° */
/* Dish mode: a ray parallel to the axis hits the dish at radius q and reflects through the focus.
   Where does it cross the receiver's plane y = h? Returns the radial distance, or Infinity if it never gets there. */
function cross(q,p,h){const y0=q*q/(4*p),den=p-y0;
 if(Math.abs(den)<1e-9)return Math.abs(h-y0)<1e-6?0:Infinity;
 const t=(h-y0)/den;if(t<=0)return Infinity;return Math.abs(q*(p-h)/den);}
/* Headlight mode: light from a bulb at (0,h) hits the dish at radius q. Angle (deg) of the reflected ray from straight ahead, or 180 if it heads back down. */
function outAngle(q,p,h){const y0=q*q/(4*p),m=q/(2*p),nl=Math.hypot(m,1),nx=-m/nl,ny=1/nl;
 let dx=q,dy=y0-h;const dl=Math.hypot(dx,dy);if(dl<1e-12)return 180;dx/=dl;dy/=dl;
 const dn=dx*nx+dy*ny,rx=dx-2*dn*nx,ry=dy-2*dn*ny;if(ry<=0)return 180;return Math.atan2(Math.abs(rx),ry)*180/Math.PI;}
/* Share of the dish's area (a circular dish, so weight by radius) whose ray succeeds. */
function score(sim,h,N){const p=foc(sim),R=sim.p.w/2,r=rad(sim),head=sim.p.mode==='head';N=N||500;let hit=0,tot=0;
 for(let i=0;i<N;i++){const q=(i+0.5)/N*R,wt=q;tot+=wt;const ok=head?outAngle(q,p,h)<=BEAM+1e-9:cross(q,p,h)<=r+1e-9;if(ok)hit+=wt;}
 return 100*hit/tot;}
const cur=sim=>score(sim,sim.p.h);
const NR=13;
/* While the student is still placing the receiver in Guided, the picture does not show which rays it catches. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const rayX=(sim,i)=>(-0.5+(i+0.5)/NR)*sim.p.w*0.97;
/* Your measurements. A meter stick laid across the rim touches it at the 4 cm mark and at 4 + w. x = the meter stick reading,
   y = height relative to the meter stick (negative is below it). The dish is y = a(x − 4)(x − 4 − w) = a(x − m)² − d, m = 4 + w/2. */
const RIM0=4;
const mid=sim=>RIM0+sim.p.w/2;
const g3=v=>{const a=Math.abs(v);return String(+a.toPrecision(3));};
const sgn=(v,first)=>first?(v<0?'−':''):(v<0?' − ':' + ');
const fForm=sim=>`y = ${g3(aOf(sim))}(x − ${g3(RIM0)})(x − ${g3(RIM0+sim.p.w)})`;
const vForm=sim=>`y = ${g3(aOf(sim))}(x − ${g3(mid(sim))})² − ${g3(sim.p.d)}`;
const sCoef=sim=>{const a=aOf(sim),m=mid(sim);return [a,-2*a*m,a*m*m-sim.p.d];};
const sForm=sim=>{const [a,b,c]=sCoef(sim);return `y = ${g3(a)}x²${sgn(b)}${g3(b)}x${sgn(c)}${g3(c)}`;};
/* three readings, for when you cannot find the exact middle */
const MARKS=sim=>[RIM0+10,RIM0+20,RIM0+0.75*sim.p.w];
const depthAt=(sim,x)=>-aOf(sim)*(x-RIM0)*(x-RIM0-sim.p.w);

const SIM={
 id:'dish',hash:'dish',apUnit:3,order:4,tab:'Satellite dish',kind:'Simulation',
 card:'Place the receiver where you think a dish focuses the signal, then measure the dish, write its equation and let the focus show you the spot.',
 title:'Why dishes are parabolas',
 lede:{bio:'A satellite’s signal arrives as parallel rays, far too weak to use where they land. A dish shaped like a parabola bounces every one of them to the same point. Put the receiver anywhere else and you lose signal. A meter stick and three numbers are enough to find that point.',
  honors:'Lay a meter stick across the rim. Where it touches the rim are the zeros, so the dish is y = a(x − 4)(x − 64). The depth of the middle gives the vertex, so it is also y = a(x − 34)² − 9. Either way a = 0.01, and every ray parallel to the axis reflects through the focus, 1/(4a) = 25 cm above the vertex.',
  ap:'At the point (x₀, ax₀²) the tangent has slope 2ax₀. Reflecting a vertical ray across the normal there sends it through (0, 1/(4a)) for every x₀: that equal-angle property is what makes the focus a single point.'},
 scale:'A slice through the middle of a round, center-fed dish, seen from the side. Lengths in centimeters; one grid square is 10 cm.',
 aspect:16/9,timeless:true,animated:true,trials:true,graph:true,
 controlsTitle:'Your dish',
 controls:[
  {id:'mode',label:'Use it as',type:'seg',def:'dish',options:[{v:'dish',l:'Dish (catch signal)'},{v:'head',l:'Headlight (send light)',lvl:'honors'}],help:'A headlight runs the dish backward: a bulb sends light out from the inside.'},
  {id:'h',label:'Your receiver: height above the dish’s center',type:'range',min:0,max:60,step:0.5,def:50,unit:' cm',help:'Or click above the dish.'},
  {id:'w',label:'Dish width',type:'range',min:40,max:80,step:1,def:60,unit:' cm',lvl:'honors',noGut:true},
  {id:'d',label:'Dish depth',type:'range',min:8,max:18,step:0.5,def:9,unit:' cm',lvl:'honors',noGut:true},
  {id:'meas',label:'How you measured it',type:'seg',def:'rim',lvl:'honors',noGut:true,options:[{v:'rim',l:'Rim and middle'},{v:'three',l:'Three marks'}],help:'Rim and middle: where the meter stick touches the rim, and how deep the middle is. Three marks: the depth at any three marks, when you cannot find the exact middle.'},
  {id:'rs',label:'Receiver opening',type:'range',min:2,max:10,step:0.5,def:5,unit:' cm',lvl:'ap',noGut:true,help:'How wide the receiver’s opening is. 5 cm is an assumption, about the size of a home dish’s receiver.'},
  {id:'trace',label:'Trace every ray all the way',type:'toggle',def:false,help:'Before you lock in a guess, the bounced rays are only shown leaving the dish.'},
  {id:'showF',label:'Mark the focus',type:'toggle',def:false,lvl:'honors'}
 ],
 actions:[{id:'focus',label:'Move it to the focus',lvl:'honors',run(sim){BioLab.setValues(sim,{h:foc(sim)});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'cap',label:'Signal caught',unit:'%',d:0,min:0,max:100,get:sim=>sim.p.mode==='head'?NaN:cur(sim)},
  {id:'beam',label:'Light within 2° of straight ahead',unit:'%',d:0,min:0,max:100,lvl:'honors',get:sim=>sim.p.mode==='head'?cur(sim):NaN},
  {id:'pf',label:'Focus height',unit:'cm',d:1,lvl:'honors',min:0,max:null,get:foc},
  {id:'above',label:'Focus above the meter stick',unit:'cm',d:1,lvl:'honors',min:0,max:null,get:sim=>foc(sim)-sim.p.d},
  {id:'fform',label:'Factored form (from where the rim meets the meter stick)',text:true,lvl:'honors',get:fForm},
  {id:'vform',label:'Vertex form (from the middle)',text:true,lvl:'honors',get:vForm},
  {id:'sform',label:'Standard form',text:true,lvl:'honors',get:sForm},
  {id:'a',label:'a in y = ax² (x, y in cm)',unit:'',d:4,lvl:'ap',min:0,max:null,get:aOf}
 ],
 graphs:[{id:'curve',label:'Signal caught vs. receiver height',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const head=sim.p.mode==='head';
  const ax=axes(ctx,box,{xmin:0,xmax:60,ymin:0,ymax:100,xl:(head?'Bulb':'Receiver')+' height above the center (cm)',yl:head?'Light in the beam (%)':'Signal caught (%)'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let h=0;h<=60.001;h+=0.2){const px=ax.X(h),py=ax.Y(score(sim,h,240));h===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
  const dot=(h,col,lab,up)=>{const v=score(sim,h);ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(h),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,ax.X(h)+(up?0:0),ax.Y(v)+(up?-12:20),{s:12,w:700,c:col,a:'center'});};
  const G=sim.gutS,same=G&&G.g&&G.g.key===key(sim);
  if(same)dot(G.g.h,PAL['s4'],'Your gut',false);
  if(atLeast('honors')||(G&&G.m))dot(foc(sim),PAL['s3'],'Focus',true);
  dot(sim.p.h,PAL['rj'],'You',same&&Math.abs(G.g.h-sim.p.h)<4?true:Math.abs(sim.p.h-foc(sim))<4?false:score(sim,sim.p.h)>85);},
 draw(sim,ctx,vdt,k,T){const p=foc(sim),w=sim.p.w,R=w/2,d=sim.p.d,h=sim.p.h,r=rad(sim),head=sim.p.mode==='head',kk=k;
  const G=sim.gutS,full=sim.p.trace||!!(G&&G.g),showF=(sim.p.showF&&atLeast('honors'))||!!(G&&G.m);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.4;for(let x=-50;x<=90;x+=10){ctx.beginPath();ctx.moveTo(PX(x),0);ctx.lineTo(PX(x),450);ctx.stroke();}for(let y=0;y<=70;y+=10){ctx.beginPath();ctx.moveTo(0,PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  /* axis */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(VX,VY+10);ctx.lineTo(VX,8);ctx.stroke();ctx.setLineDash([]);
  /* rays */
  const ok0=PAL['s3'],bad=PAL['s4'],sp=(T||0)*160,blind=gutPhase(sim);
  const dash=(pts,col,alpha,lw)=>{ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.stroke();ctx.globalAlpha=1;};
  const pulse=(pts,col,off)=>{let L=0;const seg=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);seg.push(l);L+=l;}if(L<1)return;
   for(let s=(sp+off)%90;s<L;s+=90){let a=s,i=0;while(i<seg.length&&a>seg[i]){a-=seg[i];i++;}if(i>=seg.length)break;const f=a/seg[i];const x=pts[i][0]+(pts[i+1][0]-pts[i][0])*f,y=pts[i][1]+(pts[i+1][1]-pts[i][1])*f;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,3,0,7);ctx.fill();}};
  for(let i=0;i<NR;i++){const q=rayX(sim,i),y0=q*q/(4*p),P0=[PX(q),PY(y0)],aq=Math.abs(q);
   if(!head){const c=cross(aq,p,h),hit=c<=r+1e-9,col=blind?PAL['s2']:hit?ok0:bad;
    const inc=[[PX(q),12],P0];let out;const den=p-y0;
    let ex,ey;if(Math.abs(den)<1e-9){ex=-Math.sign(q);ey=0;}else{ex=-q/Math.hypot(q,den)*Math.sign(den);ey=den/Math.hypot(q,den)*Math.sign(den);}
    const tH=Math.abs(den)<1e-9?Infinity:(h-y0)/den;
    let len;if(!full)len=13;else if(Number.isFinite(tH)&&tH>0)len=Math.hypot(q*tH,(h-y0))+(hit?0:10);else len=90;
    out=[P0,[PX(q+ex*len),PY(y0+ey*len)]];
    dash(inc,PAL['cv-soft'],.55,1.5);dash(out,col,full?.9:.6,2);pulse(inc,PAL['cv-soft'],i*37);if(full)pulse(out,col,i*37);}
   else{const B0=[PX(0),PY(h)],ang=outAngle(aq,p,h),good=ang<=BEAM+1e-9,col=good?ok0:bad;
    const yv=q*q/(4*p),m=q/(2*p),nl=Math.hypot(m,1),nx=-m/nl,ny=1/nl;let dx=q,dy=yv-h;const dl=Math.hypot(dx,dy)||1;dx/=dl;dy/=dl;const dn=dx*nx+dy*ny,rx=dx-2*dn*nx,ry=dy-2*dn*ny;
    const len=ry>0?Math.min(120,(100-yv)/Math.max(ry,0.05)):30;const out=[P0,[PX(q+rx*len),PY(yv+ry*len)]];
    dash([B0,P0],PAL['cv-e'],.55,1.5);dash(out,col,.9,2);pulse([B0,P0],PAL['cv-e'],i*37);pulse(out,col,i*37);}}
  /* dish */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();for(let x=-R;x<=R+1e-9;x+=R/40){const px=PX(x),py=PY(x*x/(4*p));x===-R?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.lineCap='butt';
  /* your meter stick across the rim, and what you measured with it */
  {const ys=PY(d),x0=PX(-R-RIM0),xr=PX(R+6),three=atLeast('honors')&&sim.p.meas==='three',kk2=Math.min(kk,1.4);
   ctx.fillStyle=PAL['cv-ruler'];ctx.globalAlpha=.85;ctx.fillRect(x0,ys-8,xr-x0,8);ctx.globalAlpha=1;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1;ctx.strokeRect(x0,ys-8,xr-x0,8);
   for(let c=0;c<=w+RIM0+6+1e-9;c+=10){const x=PX(c-RIM0-R);ctx.beginPath();ctx.moveTo(x,ys-8);ctx.lineTo(x,ys-3);ctx.stroke();}
   tag(ctx,'Rim at '+RIM0+' cm',PX(-R)-4,ys+16*kk2,{s:12*kk2,w:700,c:PAL['cv-ink'],a:'right'});
   tag(ctx,'Rim at '+g3(RIM0+w)+' cm',PX(R)+4,ys+16*kk2,{s:12*kk2,w:700,c:PAL['cv-ink']});
   if(!three){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(PX(0)+3,ys);ctx.lineTo(PX(0)+3,VY);ctx.stroke();ctx.setLineDash([]);
    tag(ctx,g3(d)+' cm deep',PX(0)+8,(ys+VY)/2+5,{s:12*kk2,w:700,c:PAL['cv-ink']});}
   else MARKS(sim).forEach((m,i)=>{const x=PX(m-RIM0-R),dep=depthAt(sim,m);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,ys);ctx.lineTo(x,ys+dep*B);ctx.stroke();
    tag(ctx,g3(dep)+' cm',x+3,ys+dep*B+14*kk2,{s:12*kk2,w:700,c:PAL['s5'],a:i===2?'right':'left'});});}
  /* receiver or bulb on its support */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PX(-R),PY(d));ctx.lineTo(PX(-r),PY(h));ctx.moveTo(PX(R),PY(d));ctx.lineTo(PX(r),PY(h));ctx.stroke();
  if(!head){ctx.fillStyle=PAL['rj'];ctx.fillRect(PX(-r),PY(h)-4,2*r*B,8);}
  else{ctx.fillStyle=PAL['cv-e'];ctx.beginPath();ctx.arc(PX(0),PY(h),6,0,7);ctx.fill();ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.stroke();}
  /* gut ghost */
  if(G&&G.g&&G.g.key===key(sim)&&Math.abs(G.g.h-h)>0.6){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([4,3]);ctx.strokeRect(PX(-r)-3,PY(G.g.h)-6,2*r*B+6,12);ctx.setLineDash([]);
   tag(ctx,'Your gut',PX(-r)-10,PY(G.g.h)+4,{s:12*kk,w:700,c:PAL['s4'],a:'right'});}
  if(showF){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;const fx=PX(0),fy=PY(p);ctx.beginPath();ctx.moveTo(fx-7,fy-7);ctx.lineTo(fx+7,fy+7);ctx.moveTo(fx+7,fy-7);ctx.lineTo(fx-7,fy+7);ctx.stroke();
   tag(ctx,'Focus, '+f1(p)+' cm up',fx-14,fy-12,{s:12*kk,w:700,c:PAL['s3'],a:'right'});}
  /* labels */
  const sc=cur(sim);
  tag(ctx,head?'Bulb':'Receiver',PX(r)+10,PY(h)-8,{s:12*kk,w:700,c:head?PAL['cv-ink']:PAL['rj']});
  if(blind&&!head)pill(ctx,'Signal caught? Lock in to find out.',665,52,PAL['s2'],'#fff',13*Math.min(kk,1.3));
  else pill(ctx,head?Math.round(sc)+'% in the beam':Math.round(sc)+'% of signal caught',665,52,PAL['rj'],'#fff',13*kk);
  txt(ctx,head?'Light from the bulb':'Signal: parallel rays',665,52+24*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  txt(ctx,f1(d)+' cm deep',665,VY+2,{s:12*kk,c:PAL['cv-soft'],a:'center'});txt(ctx,'Dish '+Math.round(w)+' cm wide',665,VY+2-17*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  txt(ctx,(head?'Bulb ':blind?'Your receiver: ':'Receiver ')+f1(h)+' cm up',665,VY+2-40*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});},
 onClick(sim,x,y){const hh=clamp((VY-y)/B,0,60);BioLab.setValues(sim,{h:Math.round(hh*2)/2});},
 narrate(sim){const p=foc(sim),h=sim.p.h,sc=cur(sim),head=sim.p.mode==='head';
  if(Math.abs(h-p)<0.3)return head?`<b>The bulb is at the focus.</b> Every ray that hits the reflector leaves parallel to the axis, so ${Math.round(sc)}% of the light goes straight down the road.`:`<b>The receiver is at the focus.</b> Every ray bounces through this one point, so it catches ${Math.round(sc)}% of the signal the dish collects.`;
  if(head)return h>p?`The bulb is ${f1(h-p)} cm past the focus. <b>The reflected rays tip inward and cross,</b> so only ${Math.round(sc)}% of the light stays within 2° of straight ahead.`:`The bulb is ${f1(p-h)} cm inside the focus. <b>The reflected rays spread outward,</b> so only ${Math.round(sc)}% of the light stays within 2° of straight ahead.`;
  return h>p?`The receiver is ${f1(h-p)} cm above the focus. <b>The bounced rays have already crossed and spread apart</b> by the time they get there, so it catches ${Math.round(sc)}% of the signal.`:`The receiver is ${f1(p-h)} cm below the focus. <b>The bounced rays have not come together yet,</b> so it catches ${Math.round(sc)}% of the signal.`;},
 gut:{better:'higher',
  controls:['h'],
  ask:{bio:'The signal comes straight down and bounces off the dish. Where do the bounced rays all come together? Drag the slider here, or click above the dish, to put the red receiver where you think it catches the most signal. Then lock it in.',honors:'Before you mark the focus: where should the receiver go? Drag the slider here or click above the dish, then lock it in.'},
  lockLabel:'Lock in my spot',
  lock(sim){const v=cur(sim);return {v,h:sim.p.h,key:key(sim),label:`${f1(sim.p.h)} cm up, ${sim.p.mode==='head'?'sending':'catching'} ${Math.round(v)}%`};},
  solve(sim){const p=foc(sim);sim.p.h=p;const v=cur(sim);return {v,h:p,label:`the focus, ${f1(p)} cm up, ${sim.p.mode==='head'?'sending':'catching'} ${Math.round(v)}%`};},
  how:{bio:'Every parabola has one special point, the focus. Any ray that comes in parallel to the axis bounces off and passes through it. For y = ax², the focus is 1/(4a) above the vertex.',
   honors:'Your meter stick readings give the zeros, 4 and 64, so y = a(x − 4)(x − 64). The middle, (34, −9), gives −9 = a(30)(−30), so a = 0.01. In vertex form that is y = 0.01(x − 34)² − 9. The focus is 1/(4a) = 25 cm above the vertex. In general a = 4d/w² and the focus is w²/(16d) up.',
   ap:'With a = 4d/w², p = 1/(4a) = w²/(16d). The reflection law (angle in = angle out, measured from the normal) sends every vertical ray through (0, p), which is why one small receiver there catches it all.'},
  compare(sim,g,m){const head=sim.p.mode==='head';
   if(m.v-g.v<1)return `Your gut was right on: your spot ${head?'sends':'catches'} ${Math.round(g.v)}%, the same as the focus. You placed it within ${f1(Math.abs(g.h-m.h))} cm. Your eye found where the rays meet, and the formula p = w²/(16d) says why they meet there.`;
   if(head){const wd=2*50*Math.tan(BEAM*Math.PI/180);return `At the focus, <b>${Math.round(m.v)}% of the light</b> heads straight down the road instead of ${Math.round(g.v)}%. A beam that stays within 2° of straight ahead is only about ${f1(wd)} m wide 50 m away, so that light lands on the road ahead instead of spilling sideways. Your bulb was ${f1(Math.abs(g.h-m.h))} cm ${g.h>m.h?'too far from':'too close to'} the reflector.`;}
   const ratio=m.v/Math.max(g.v,0.01);
   return (g.v<0.5?`Your spot catches <b>almost none</b> of the signal the dish collects. The focus catches <b>${Math.round(m.v)}%</b>.`:`The focus catches <b>${Math.round(m.v)}%</b> of the signal the dish collects, against ${Math.round(g.v)}% at your spot: <b>${ratio>=10?Math.round(ratio):f1(ratio)} times as much signal</b> from the same dish.`)+` Your receiver was ${f1(Math.abs(g.h-m.h))} cm ${g.h>m.h?'too high':'too low'}.`;},
  again(sim){sim.p.meas='rim';sim.p.w=Math.round(45+Math.random()*35);sim.p.d=Math.round((8+Math.random()*7)*2)/2;sim.p.h=Math.random()<0.5?6:55;sim.p.trace=false;sim.p.showF=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'One ray hits the dish near its center, and another hits near the rim. Where do the two bounced rays go?',choices:['The rim ray goes higher','Both pass through the same point, the focus','The center ray goes higher'],correct:1,explain:'That is the whole point of a parabola: every ray parallel to the axis reflects through the focus, wherever it lands. Trace every ray in the tool and move the receiver to the focus to see them all meet.'},
  {lvl:'bio',instant:true,q:'Two dishes are both 60 cm wide. One is 12 cm deep; the other is only 6 cm deep. Which one has its focus farther from the dish?',choices:['The deeper dish','The shallower dish','They are the same'],correct:1,explain:'p = w²/(16d): the 12 cm deep dish focuses 18.8 cm up, the 6 cm deep dish 37.5 cm up. Halving the depth doubles the focal distance, which is why shallow dishes hold their receiver out on a long arm.'},
  {lvl:'honors',instant:true,q:'A reflector has the shape y = 0.02x², in centimeters. How far above the vertex is its focus?',choices:['0.08 cm','12.5 cm','25 cm','50 cm'],correct:1,explain:'p = 1/(4a) = 1/(4 × 0.02) = 1/0.08 = 12.5 cm.'},
  {lvl:'bio',instant:true,q:'Your meter stick touches the rim at the 4 cm mark and the 64 cm mark. At which mark is the dish deepest?',choices:['4 cm','30 cm','34 cm','64 cm'],correct:2,explain:'A parabola is symmetric, so the bottom is halfway between the two rim marks: (4 + 64) ÷ 2 = 34 cm. That is the vertex, and the focus is straight above it.'},
  {lvl:'honors',instant:true,q:'From the rim marks you wrote y = 0.01(x − 4)(x − 64). Which is the same dish in vertex form?',choices:['y = 0.01(x − 34)² − 9','y = 0.01(x − 34)² + 9','y = 0.01(x + 34)² − 9','y = 0.01(x − 30)² − 9'],correct:0,explain:'The vertex is halfway between the zeros, at x = 34. There y = 0.01(30)(−30) = −9. So y = 0.01(x − 34)² − 9: the middle of the dish is 9 cm below the meter stick. Expand both and you get the same standard form, 0.01x² − 0.68x + 2.56.'},
  {lvl:'honors',instant:true,q:'In standard form the dish is y = 0.01x² − 0.68x + 2.56. What does the 2.56 tell you?',choices:['The dish is 2.56 cm deep','The receiver goes 2.56 cm up','Where the curve would cross the meter stick’s 0 mark, which is off the dish: nothing useful here','The dish is 2.56 times wider than it is deep'],correct:2,explain:'c is the value at x = 0, and the meter stick’s 0 mark is 4 cm outside the rim. Each form shows different things: factored form shows the rim marks, vertex form shows the middle and the depth, and standard form is the one you solve with the quadratic formula.'},
  {lvl:'ap',instant:true,q:'In a headlight, the bulb sits 3 cm farther from the reflector than the focus. What does the beam do?',choices:['It stays parallel','Its rays tip inward, cross, and then spread apart','Its rays spread outward right away','It goes back into the reflector'],correct:1,explain:'Past the focus, each ray reflects tipped toward the axis, so the rays cross in front of the lamp and fan out after that. Try it: Headlight mode, then raise the bulb above the focus and watch the colors change.'},
  {lvl:'ap',instant:true,q:'You cannot find the exact middle, so you measure the depth below the meter stick at three marks: 5 cm at 14, 8 cm at 24 and 6.75 cm at 49. Fit y = ax² + bx + c through (14, −5), (24, −8) and (49, −6.75). What is a?',choices:['0.001','0.01','0.1','−0.01'],correct:1,explain:'Subtract the equations in pairs: 380a + 10b = −3 and 1,825a + 25b = 1.25. Multiply the first by 2.5 and subtract: 875a = 8.75, so a = 0.01, then b = −0.68 and c = 2.56. Same dish, same focus: 1/(4a) = 25 cm.'},
  {lvl:'ap',instant:true,q:'A dish is 2.4 m wide and 0.3 m deep. How far above the vertex is its focus?',choices:['0.3 m','1.2 m','2.4 m','4.8 m'],correct:1,explain:'p = w²/(16d) = 2.4²/(16 × 0.3) = 5.76/4.8 = 1.2 m. Equivalently a = 4d/w² = 1.2/5.76 ≈ 0.208 per meter and p = 1/(4a) = 1.2 m.'}
 ],
 tour:[
  {title:'A slice through the dish',text:'This is a slice through the middle of your family’s round, center-fed dish. You laid a meter stick across it: the rim touches the 4 cm and 64 cm marks, and the middle is 9 cm below the meter stick. The signal from a satellite tens of thousands of kilometers away arrives as parallel rays, straight down onto it.',focus:[PX(-34),4,68*B,VY-4+14],pause:true,setup:sim=>BioLab.setValues(sim,{w:60,d:9,h:50,trace:false,showF:false,mode:'dish',meas:'rim'})},
  {title:'Bounce, then where?',text:'Each ray bounces off the dish. With the receiver 50 cm up, the bounced rays have crossed and spread apart before they reach it. Orange rays miss; green rays hit.',pause:true,setup:sim=>BioLab.setValues(sim,{trace:true,h:50})},
  {title:'Too low',text:'Move the receiver down to 15 cm. Now the rays have not come together yet, so most of them still miss.',pause:true,setup:sim=>BioLab.setValues(sim,{h:15})},
  {title:'The focus',text:'At 25 cm above the bottom of the dish (16 cm above the meter stick), every ray passes through one point, the focus, and the receiver catches all of the signal the dish collects.',pause:true,setup:sim=>BioLab.setValues(sim,{h:25}),focus:sim=>[PX(-16),PY(25)-36,32*B,72]},
  {lvl:'honors',title:'Zeros give factored form',text:'Read x along the meter stick and y up from it. The dish meets the meter stick (y = 0) at the rim marks, x = 4 and x = 64. Those are the zeros, so the dish is y = a(x − 4)(x − 64).',pause:true,setup:sim=>BioLab.setValues(sim,{showF:false,meas:'rim'})},
  {lvl:'honors',title:'One more point gives a',text:'The middle is at x = 34, 9 cm down: −9 = a(34 − 4)(34 − 64) = −900a, so a = 0.01. In vertex form the dish is y = 0.01(x − 34)² − 9, and in standard form y = 0.01x² − 0.68x + 2.56. The focus is 1/(4a) = 25 cm above the vertex.',pause:true,setup:sim=>BioLab.setValues(sim,{showF:true})},
  {lvl:'honors',title:'Three marks work too',text:'If you cannot find the exact middle, measure the depth at any three marks: here 5 cm at 14, 8 cm at 24 and 6.75 cm at 49. Plug the three points into y = ax² + bx + c and solve the system: a = 0.01 again.',pause:true,setup:sim=>BioLab.setValues(sim,{meas:'three'})},
  {lvl:'honors',title:'Run it backward',text:'Put a bulb at the focus and the same reflector sends every ray out parallel: a beam. That is a flashlight or a headlight.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'head',h:25,meas:'rim'})},
  {lvl:'ap',title:'A little off',text:'Raise the bulb 4 cm past the focus. The reflected rays tip inward and cross, and the share of light within 2° of straight ahead drops sharply.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'head',h:29})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{mode:'dish',meas:'rim'});},
 lab:{bio:'<p><b>Question:</b> How does the depth of a dish change where the receiver goes?</p><ol><li>Turn on <b>Trace every ray</b>. Find the receiver height that catches the most signal. Record a trial.</li><li>At <b>Closer look</b>, change the depth to 6, 9, 12 and 15 cm and repeat.</li></ol><p>Write one sentence: what happens to the best height as the dish gets deeper?</p>',
  honors:'<p><b>Question:</b> Do your measurements predict the best spot?</p><ol><li>Pick four width and depth pairs. For each, write the dish in factored form from the rim marks and in vertex form from the middle, then find a and the focus 1/(4a). Check your forms against the readouts.</li><li>Find the best height by eye, then press <b>Move it to the focus</b>. Record both.</li><li>Switch to Headlight and check that the same point makes a straight beam.</li></ol>',
  ap:'<p><b>Question:</b> How precisely must a receiver be placed?</p><ol><li>For a 60 × 9 dish, record the signal caught at 1 cm steps from 20 to 30 cm.</li><li>Repeat with a 3 cm and a 9 cm receiver opening.</li><li>Explain why a bigger opening is more forgiving, using where the rays cross the receiver’s height.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the reflection property.</p>'},
 terms:[
  {t:'Parabola',d:'The graph of y = ax². Every point on it is the same distance from the focus as from a line called the directrix.'},
  {t:'Focus',d:'The point 1/(4a) above the vertex of y = ax². Rays parallel to the axis reflect through it.'},
  {t:'Vertex',d:'The lowest point of the parabola (for a > 0): the center of the dish.'},
  {t:'Zeros',d:'Where y = 0. With y measured from your meter stick, the zeros are the two rim marks.'},
  {t:'Vertex, factored and standard form',d:'Three ways to write the same parabola: a(x − h)² + k shows the vertex, a(x − r)(x − s) shows the zeros, ax² + bx + c is the one to use with the quadratic formula.',lvl:'honors'},
  {t:'Axis of symmetry',d:'The vertical line through the vertex and focus.',lvl:'honors'},
  {t:'Directrix',d:'The line y = −1/(4a), as far below the vertex as the focus is above it.',lvl:'honors'},
  {t:'Law of reflection',d:'A ray leaves a surface at the same angle to the normal (the perpendicular) as it arrived.',lvl:'ap'}
 ],
 about:'<p>The dish is y = ax² with a = 4d/w² (width w, depth d), focus p = w²/(16d). Measured from a meter stick across the rim, with the rim at the 4 cm mark, the same dish is y = a(x − 4)(x − 4 − w) = a(x − 4 − w/2)² − d. Rays arrive parallel to the axis. <b>Signal caught</b> is the share of the dish’s area whose reflected ray passes through a receiver opening 5 cm wide (an assumption, adjustable at Deep dive) centered on the axis. Rays are weighted by radius, because a round dish has more area near its rim. <b>Headlight</b> mode counts the share of the reflector’s area whose reflected ray leaves within 2° of the axis.</p><p>Simplified: real signals are waves, so even at the focus they blur into a small spot; the receiver and its supports block a little signal; and most home TV dishes today are “offset” dishes, cut from one side of a larger paraboloid. On an offset dish the focus sits off to one side, not above the center of the rim, so this tool’s measure-the-middle method applies only to round, center-fed (prime-focus) dishes like the one here. The reflection property works the same way in all of them.</p>'
};
function tag(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,x0=o.a==='right'?x-w:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s,w+6,o.s*1.3);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}
function key(sim){return sim.p.mode+'|'+sim.p.w+'|'+sim.p.d+'|'+sim.p.rs;}
BioLab.register(SIM);
})();
