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

const SIM={
 id:'dish',hash:'dish',apUnit:3,order:4,tab:'Satellite dish',kind:'Simulation',
 card:'Place the receiver where you think a dish focuses the signal, then let the parabola’s focus show you the spot.',
 title:'Why dishes are parabolas',
 lede:{bio:'A satellite’s signal arrives as parallel rays, far too weak to use where they land. A dish shaped like a parabola bounces every one of them to the same point. Put the receiver anywhere else and you lose signal.',
  honors:'For y = ax², every ray parallel to the axis reflects through the focus, 1/(4a) above the vertex. From a dish’s width w and depth d, a = 4d/w², so the focus is p = w²/(16d) up.',
  ap:'At the point (x₀, ax₀²) the tangent has slope 2ax₀. Reflecting a vertical ray across the normal there sends it through (0, 1/(4a)) for every x₀: that equal-angle property is what makes the focus a single point.'},
 scale:'A slice through the middle of a round dish, seen from the side. Lengths in centimeters; one grid square is 10 cm.',
 aspect:16/9,timeless:true,animated:true,trials:true,graph:true,
 controlsTitle:'Your dish',
 controls:[
  {id:'mode',label:'Use it as',type:'seg',def:'dish',options:[{v:'dish',l:'Dish (catch signal)'},{v:'head',l:'Headlight (send light)',lvl:'honors'}],help:'A headlight runs the dish backward: a bulb sends light out from the inside.'},
  {id:'h',label:'Your receiver: height above the dish’s center',type:'range',min:0,max:60,step:0.5,def:50,unit:' cm',help:'Or click above the dish.'},
  {id:'w',label:'Dish width',type:'range',min:40,max:80,step:1,def:60,unit:' cm',lvl:'honors',noGut:true},
  {id:'d',label:'Dish depth',type:'range',min:8,max:18,step:0.5,def:8,unit:' cm',lvl:'honors',noGut:true},
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
   honors:'The dish’s rim is at (w/2, d), so d = a(w/2)² and a = 4d/w². Then the focus is p = 1/(4a) = w²/(16d) above the center.',
   ap:'With a = 4d/w², p = 1/(4a) = w²/(16d). The reflection law (angle in = angle out, measured from the normal) sends every vertical ray through (0, p), which is why one small receiver there catches it all.'},
  compare(sim,g,m){const head=sim.p.mode==='head';
   if(m.v-g.v<1)return `Your gut was right on: your spot ${head?'sends':'catches'} ${Math.round(g.v)}%, the same as the focus. You placed it within ${f1(Math.abs(g.h-m.h))} cm. Your eye found where the rays meet, and the formula p = w²/(16d) says why they meet there.`;
   if(head){const wd=2*50*Math.tan(BEAM*Math.PI/180);return `At the focus, <b>${Math.round(m.v)}% of the light</b> heads straight down the road instead of ${Math.round(g.v)}%. A beam that stays within 2° of straight ahead is only about ${f1(wd)} m wide 50 m away, so that light lands on the road ahead instead of spilling sideways. Your bulb was ${f1(Math.abs(g.h-m.h))} cm ${g.h>m.h?'too far from':'too close to'} the reflector.`;}
   const ratio=m.v/Math.max(g.v,0.01);
   return (g.v<0.5?`Your spot catches <b>almost none</b> of the signal the dish collects. The focus catches <b>${Math.round(m.v)}%</b>.`:`The focus catches <b>${Math.round(m.v)}%</b> of the signal the dish collects, against ${Math.round(g.v)}% at your spot: <b>${ratio>=10?Math.round(ratio):f1(ratio)} times as much signal</b> from the same dish.`)+` Your receiver was ${f1(Math.abs(g.h-m.h))} cm ${g.h>m.h?'too high':'too low'}.`;},
  again(sim){sim.p.w=Math.round(45+Math.random()*35);sim.p.d=Math.round((8+Math.random()*7)*2)/2;sim.p.h=Math.random()<0.5?6:55;sim.p.trace=false;sim.p.showF=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'One ray hits the dish near its center, and another hits near the rim. Where do the two bounced rays go?',choices:['The rim ray goes higher','Both pass through the same point, the focus','The center ray goes higher'],correct:1,explain:'That is the whole point of a parabola: every ray parallel to the axis reflects through the focus, wherever it lands. Trace every ray in the tool and move the receiver to the focus to see them all meet.'},
  {lvl:'bio',instant:true,q:'Two dishes are both 60 cm wide. One is 12 cm deep; the other is only 6 cm deep. Which one has its focus farther from the dish?',choices:['The deeper dish','The shallower dish','They are the same'],correct:1,explain:'p = w²/(16d): the 12 cm deep dish focuses 18.8 cm up, the 6 cm deep dish 37.5 cm up. Halving the depth doubles the focal distance, which is why shallow dishes hold their receiver out on a long arm.'},
  {lvl:'honors',instant:true,q:'A reflector has the shape y = 0.02x², in centimeters. How far above the vertex is its focus?',choices:['0.08 cm','12.5 cm','25 cm','50 cm'],correct:1,explain:'p = 1/(4a) = 1/(4 × 0.02) = 1/0.08 = 12.5 cm.'},
  {lvl:'honors',instant:true,q:'A dish is 60 cm wide and 8 cm deep. Where does the receiver belong?',choices:['8 cm up, level with the rim','About 28.1 cm up','About 60 cm up','About 112.5 cm up'],correct:1,explain:'a = 4d/w² = 32/3600 ≈ 0.00889, and p = w²/(16d) = 3600/128 ≈ 28.1 cm. The receiver sits well above the rim.'},
  {lvl:'ap',instant:true,q:'In a headlight, the bulb sits 3 cm farther from the reflector than the focus. What does the beam do?',choices:['It stays parallel','Its rays tip inward, cross, and then spread apart','Its rays spread outward right away','It goes back into the reflector'],correct:1,explain:'Past the focus, each ray reflects tipped toward the axis, so the rays cross in front of the lamp and fan out after that. Try it: Headlight mode, then raise the bulb above the focus and watch the colors change.'},
  {lvl:'ap',instant:true,q:'A dish is 2.4 m wide and 0.3 m deep. How far above the vertex is its focus?',choices:['0.3 m','1.2 m','2.4 m','4.8 m'],correct:1,explain:'p = w²/(16d) = 2.4²/(16 × 0.3) = 5.76/4.8 = 1.2 m. Equivalently a = 4d/w² = 1.2/5.76 ≈ 0.208 per meter and p = 1/(4a) = 1.2 m.'}
 ],
 tour:[
  {title:'A slice through the dish',text:'This is a slice through the middle of your family’s dish, 60 cm wide and 8 cm deep. The signal from a satellite tens of thousands of kilometers away arrives as parallel rays, straight down onto it.',focus:[PX(-34),4,68*B,VY-4+14],pause:true,setup:sim=>BioLab.setValues(sim,{w:60,d:8,h:50,trace:false,showF:false,mode:'dish'})},
  {title:'Bounce, then where?',text:'Each ray bounces off the dish. With the receiver 50 cm up, the bounced rays have crossed and spread apart before they reach it. Orange rays miss; green rays hit.',pause:true,setup:sim=>BioLab.setValues(sim,{trace:true,h:50})},
  {title:'Too low',text:'Move the receiver down to 15 cm. Now the rays have not come together yet, so most of them still miss.',pause:true,setup:sim=>BioLab.setValues(sim,{h:15})},
  {title:'The focus',text:'At 28.1 cm up every ray passes through one point, the focus, and the receiver catches all of the signal the dish collects.',pause:true,setup:sim=>BioLab.setValues(sim,{h:28.125}),focus:sim=>[PX(-16),PY(28.125)-36,32*B,72]},
  {lvl:'honors',title:'Finding the focus',text:'The rim is at (30, 8), so 8 = a × 30² and a = 8/900 ≈ 0.00889. The focus is 1/(4a) = 28.1 cm up. In one step: p = w²/(16d) = 3600/128.',pause:true,setup:sim=>BioLab.setValues(sim,{showF:true})},
  {lvl:'honors',title:'Run it backward',text:'Put a bulb at the focus and the same reflector sends every ray out parallel: a beam. That is a flashlight or a headlight.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'head',h:28.125})},
  {lvl:'ap',title:'A little off',text:'Raise the bulb 4 cm past the focus. The reflected rays tip inward and cross, and the share of light within 2° of straight ahead drops sharply.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'head',h:32})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{mode:'dish'});},
 lab:{bio:'<p><b>Question:</b> How does the depth of a dish change where the receiver goes?</p><ol><li>Turn on <b>Trace every ray</b>. Find the receiver height that catches the most signal. Record a trial.</li><li>At <b>Closer look</b>, change the depth to 6, 9, 12 and 15 cm and repeat.</li></ol><p>Write one sentence: what happens to the best height as the dish gets deeper?</p>',
  honors:'<p><b>Question:</b> Does p = w²/(16d) predict the best spot?</p><ol><li>Pick four width and depth pairs. For each, predict p with the formula.</li><li>Find the best height by eye, then press <b>Move it to the focus</b>. Record both.</li><li>Switch to Headlight and check that the same point makes a straight beam.</li></ol>',
  ap:'<p><b>Question:</b> How precisely must a receiver be placed?</p><ol><li>For a 60 × 8 dish, record the signal caught at 1 cm steps from 24 to 32 cm.</li><li>Repeat with a 3 cm and a 9 cm receiver opening.</li><li>Explain why a bigger opening is more forgiving, using where the rays cross the receiver’s height.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the reflection property.</p>'},
 terms:[
  {t:'Parabola',d:'The graph of y = ax². Every point on it is the same distance from the focus as from a line called the directrix.'},
  {t:'Focus',d:'The point 1/(4a) above the vertex of y = ax². Rays parallel to the axis reflect through it.'},
  {t:'Vertex',d:'The lowest point of y = ax² (for a > 0): the center of the dish.'},
  {t:'Axis of symmetry',d:'The vertical line through the vertex and focus.',lvl:'honors'},
  {t:'Directrix',d:'The line y = −1/(4a), as far below the vertex as the focus is above it.',lvl:'honors'},
  {t:'Law of reflection',d:'A ray leaves a surface at the same angle to the normal (the perpendicular) as it arrived.',lvl:'ap'}
 ],
 about:'<p>The dish is y = ax² with a = 4d/w² (width w, depth d), focus p = w²/(16d). Rays arrive parallel to the axis. <b>Signal caught</b> is the share of the dish’s area whose reflected ray passes through a receiver opening 5 cm wide (an assumption, adjustable at Deep dive) centered on the axis. Rays are weighted by radius, because a round dish has more area near its rim. <b>Headlight</b> mode counts the share of the reflector’s area whose reflected ray leaves within 2° of the axis.</p><p>Simplified: real signals are waves, so even at the focus they blur into a small spot; the receiver and its supports block a little signal; and many home dishes are “offset” dishes, cut from one side of a larger paraboloid so the receiver sits out of the way. The focus works the same way in all of them.</p>'
};
function tag(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,x0=o.a==='right'?x-w:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s,w+6,o.s*1.3);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}
function key(sim){return sim.p.mode+'|'+sim.p.w+'|'+sim.p.d+'|'+sim.p.rs;}
BioLab.register(SIM);
})();
