(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,bars,legend,atLeast,fmtNum}=BioLab.h;
/* Site plans: the track leaves H ft up, partway down the first drop, at x = 0, enters a tunnel at r1 and leaves it at r2,
   climbs a hill, then swoops down to skim a pond at s: it must touch the water and rise again without going in. */
const DESIGNS={A:{H:90,r:[20,60,140]},B:{H:80,r:[20,55,130]},C:{H:100,r:[25,70,155]}};
const POND=15;                                  /* the pond runs 15 ft either side of the skim mark */
const S=3.9,OX=60,GY=434;                       /* 3.9 px per foot, same scale both ways */
const PX=x=>OX+x*S,PY=y=>GY-y*S;
const f1=v=>fmtNum(v,1);
const des=sim=>DESIGNS[sim.p.design];
/* While the student is still shaping by eye in Guided, the picture shows the marks but not the miss in feet. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
/* The plan's own curve, built from its zeros: y = a(x − r1)(x − r2)(x − s)². With sk = false, the "what if it crossed" curve a(x − r1)(x − r2)(x − s). */
const aOf=(D,sk)=>sk?D.H/(D.r[0]*D.r[1]*D.r[2]*D.r[2]):-D.H/(D.r[0]*D.r[1]*D.r[2]);
const target=(D,sk,x)=>{const [r1,r2,s]=D.r;return aOf(D,sk)*(x-r1)*(x-r2)*(x-s)*(sk?(x-s):1);};
/* polynomial helpers (coefficients low → high) */
const pmul=(A,B)=>{const o=new Array(A.length+B.length-1).fill(0);A.forEach((a,i)=>B.forEach((b,j)=>{o[i+j]+=a*b;}));return o;};
const pev=(c,x)=>c.reduceRight((s,v)=>s*x+v,0);
const pder=c=>c.slice(1).map((v,i)=>v*(i+1));
function targetC(D,sk){const [r1,r2,s]=D.r;let c=pmul(pmul([-r1,1],[-r2,1]),[-s,1]);if(sk)c=pmul(c,[-s,1]);const a=aOf(D,sk);return c.map(v=>v*a);}
/* The plan's turning points. y′ = a(x − s)[(x − s)(2x − r1 − r2) + 2(x − r1)(x − r2)], so the skim s is one and the dip and hill solve
   4x² − (3r1 + 3r2 + 2s)x + (2r1r2 + s(r1 + r2)) = 0. */
function plan(D){const [r1,r2,s]=D.r,A=4,B=-(3*r1+3*r2+2*s),C=2*r1*r2+s*(r1+r2),q=Math.sqrt(B*B-4*A*C),dip=(-B-q)/(2*A),hill=(-B+q)/(2*A);
 return {dip,dipY:target(D,true,dip),hill,hillY:target(D,true,hill),s};}
const turns=D=>{const P=plan(D);return {x1:P.dip,y1:P.dipY,x2:P.s,y2:0};};
/* Your track: the polynomial that leaves (0, H) and has turning points at your dip (x1, y1) and the bottom of your swoop (x2, y2).
   Its slope is y′ = (x − x1)(x − x2)(px + q); p and q are fixed by the two heights. p = 0 makes it a cubic. */
function coeffs(sim,P){P=P||sim.p;const H=des(sim).H,x1=P.x1,x2=P.x2,Sm=x1+x2,Pr=x1*x2;
 const A=x=>x*x*x*x/4-Sm*x*x*x/3+Pr*x*x/2,B=x=>x*x*x/3-Sm*x*x/2+Pr*x;
 const a1=A(x1),b1=B(x1),a2=A(x2),b2=B(x2),det=a1*b2-a2*b1,u=P.y1-H,v=P.y2-H;
 let p,q;if(Math.abs(det)<1e-9){p=0;q=u/b1;}else{p=(u*b2-v*b1)/det;q=(a1*v-a2*u)/det;}
 const c=[H,q*Pr,(p*Pr-q*Sm)/2,(q-p*Sm)/3,p/4];if(Math.abs(c[4])<1e-9*Math.abs(c[3]))c[4]=0;return c;}
const track=(sim,x,P)=>pev(coeffs(sim,P),x);
const slope=(sim,x,P)=>pev(pder(coeffs(sim,P)),x);
const NAMES=['the tunnel entrance','the tunnel exit','the pond'];
/* Miss at each mark, in feet. At the pond: how far the track is above the water at the mark, or how deep it dips into the pond, whichever is worse. */
function misses(sim,P){const D=des(sim),[r1,r2,s]=D.r,c=coeffs(sim,P);let u=0;for(let x=s-POND;x<=s+POND+1e-9;x+=0.25)u=Math.max(u,-pev(c,x));
 return [Math.abs(pev(c,r1)),Math.abs(pev(c,r2)),Math.max(Math.abs(pev(c,s)),u)];}
const worst=(sim,P)=>{const m=misses(sim,P);return Math.round(Math.max(...m)*1e6)/1e6;};
function under(sim,P){const s=des(sim).r[2],c=coeffs(sim,P);let u=0;for(let x=s-POND;x<=s+POND+1e-9;x+=0.25)u=Math.max(u,-pev(c,x));return u;}
/* where the track meets ground level: crossings (sign changes) and touches (|y| has a tiny local minimum with no sign change) */
function zeros(sim,P){const c=coeffs(sim,P);const f=x=>pev(c,x);let px=-20.03,py=f(px),raw=[];
 for(let x=-19.53;x<=200;x+=0.5){const y=f(x);if(py*y<0){let a=px,b=x;for(let i=0;i<60;i++){const m=(a+b)/2;(f(a)*f(m)<=0)?b=m:a=m;}raw.push((a+b)/2);}px=x;py=y;}
 /* two crossings within 2 ft are one touch that rounding split in two */
 const out=[];for(let i=0;i<raw.length;i++){if(i+1<raw.length&&raw[i+1]-raw[i]<2){out.push({x:(raw[i]+raw[i+1])/2,k:'touches'});i++;}else out.push({x:raw[i],k:'crosses'});}
 /* touches with no sign change: a local minimum of |y| below 0.05 ft */
 const g=x=>Math.abs(f(x));for(let x=-19.53;x<=199.5;x+=0.5){if(g(x)<0.05&&g(x)<=g(x-0.5)&&g(x)<=g(x+0.5)&&!out.some(z=>Math.abs(z.x-x)<2)){let a=x-0.5,b=x+0.5;for(let i=0;i<60;i++){const m1=a+(b-a)/3,m2=b-(b-a)/3;g(m1)<g(m2)?b=m2:a=m1;}out.push({x:(a+b)/2,k:'touches'});}}
 return out.sort((a,b)=>a.x-b.x);}
function steepest(sim,P){const D=des(sim);let best=0;for(let x=0;x<=D.r[2]+1e-9;x+=0.25)best=Math.max(best,-slope(sim,x,P));return Math.atan(Math.max(0,best))*180/Math.PI;}
const deg=c=>c[4]!==0?4:3;
const lead=c=>c[4]!==0?c[4]:c[3];
const polyText=c=>{const t=(v,pw)=>{const a=Math.abs(v);const s=a<1?String(+a.toPrecision(3)):a.toFixed(2);return (v<0?' − ':' + ')+s+(pw?pw:'');};let o='y =';[[4,'x⁴'],[3,'x³'],[2,'x²'],[1,'x'],[0,'']].forEach(([i,pw])=>{if(c[i]!==0||i===0)o+=t(c[i],pw);});return o.replace('= − ','= −').replace('= + ','= ');};
const endText=c=>{const n=deg(c),a=lead(c),even=n%2===0;return `Degree ${n}, leading coefficient ${a>0?'positive':'negative'}: `+(even?(a>0?'both ends rise':'both ends fall'):(a>0?'falls on the left, rises on the right':'rises on the left, falls on the right'));};
const factText=(D,sk)=>`y = a(x − ${D.r[0]})(x − ${D.r[1]})(x − ${D.r[2]})${sk?'²':''}`;
const sameGut=sim=>{const G=sim.gutS;return G&&G.g&&G.g.key===key(sim);};
const key=sim=>sim.p.design;
const clearGut=sim=>{if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}};

function tag(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,x0=o.a==='right'?x-w:o.a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s,w+6,o.s*1.3);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}
const SIM={
 id:'coaster',hash:'coaster',apUnit:3,order:5,tab:'Coaster track',kind:'Simulation',
 card:'Shape a coaster track by eye to hit a tunnel and skim a pond, then build it exactly from its zeros.',
 title:'Build a coaster track from its zeros',
 lede:{bio:'Your level fixes where the track must go: down the first drop, through a tunnel, over a hill, and down to skim a pond without falling in. One smooth polynomial curve can do all of it, if you know how each kind of mark shapes the curve.',
  honors:'Each place the track meets ground level is a zero. A zero the track passes through (a tunnel mouth) gives a factor (x − r). A zero it only touches and leaves (the pond) gives a squared factor (x − s)²: even multiplicity bounces, odd multiplicity crosses. The degree and the sign of the leading coefficient tell you what the track does past both ends.',
  ap:'For y = a(x − r₁)(x − r₂)(x − s)², one point fixes a, and y′ = 0 gives the turning points. Change (x − s)² to (x − s) and the degree drops from 4 to 3, a changes sign, and the right end turns from rising to falling.'},
 scale:'Side view of one track section in a theme-park building game. Distances and heights in feet, drawn to the same scale. Ground level and the pond’s surface are height 0.',
 aspect:4/3,timeless:true,trials:true,graph:true,
 controlsTitle:'Your track',
 controls:[
  {id:'design',label:'Site plan',type:'seg',def:'A',noGut:true,onChange:clearGut,options:[{v:'A',l:'Plan A'},{v:'B',l:'Plan B'},{v:'C',l:'Plan C'}],help:'Each plan fixes the drop height, the tunnel and the pond.'},
  {id:'x1',label:'Your dip: distance along the track',type:'range',min:10,max:80,step:0.5,def:50,unit:' ft',help:'The low point inside the tunnel. Or click the picture near it.'},
  {id:'y1',label:'Your dip: height (below 0 is underground)',type:'range',min:-30,max:20,step:0.5,def:-5,unit:' ft'},
  {id:'x2',label:'Your swoop: distance along the track',type:'range',min:90,max:170,step:0.5,def:125,unit:' ft',help:'The low point at the end of the section, near the pond. Or click the picture near it.'},
  {id:'y2',label:'Your swoop: height of its low point',type:'range',min:-10,max:30,step:0.5,def:10,unit:' ft'},
  {id:'probe',label:'Read the height at',type:'range',min:0,max:160,step:1,def:100,unit:' ft along',lvl:'honors',noGut:true},
  {id:'alt',label:'Compare: cross at the pond instead of touching',type:'toggle',def:false,lvl:'honors',help:'Draws the curve with (x − s) in place of (x − s)², through the same start and zeros.'}
 ],
 actions:[{id:'build',label:'Build it from the zeros',lvl:'honors',run(sim){BioLab.setValues(sim,turns(des(sim)));}}],
 init(){return {};},step(){},
 metrics:[
  {id:'miss',label:'Worst miss at a required mark',unit:'ft',d:1,min:0,max:30,get:sim=>worst(sim)},
  {id:'start',label:'Track height at x = 0',unit:'ft',d:1,min:0,max:null,get:sim=>track(sim,0)},
  {id:'hprobe',label:'Height at the reading point',unit:'ft',d:1,lvl:'honors',min:-40,max:null,get:sim=>track(sim,sim.p.probe)},
  {id:'zeros',label:'Meets ground level at x =',text:true,lvl:'honors',get:sim=>{const z=zeros(sim).filter(o=>o.x>=-20&&o.x<=200);return z.length?z.map(o=>f1(o.x)+' ('+o.k+')').join(', '):'nowhere';}},
  {id:'endb',label:'End behavior of your track',text:true,lvl:'honors',get:sim=>endText(coeffs(sim))},
  {id:'steep',label:'Steepest drop',unit:'°',d:1,lvl:'ap',min:0,max:90,get:sim=>steepest(sim)},
  {id:'eq',label:'Your track in standard form',text:true,lvl:'ap',get:sim=>polyText(coeffs(sim))}
 ],
 graphs:[{id:'misses',label:'Miss at each required mark',custom:true}],defaultGraph:'misses',
 plot(sim,ctx,box){const m=misses(sim),same=sameGut(sim),G=sim.gutS,top=Math.max(10,Math.ceil(Math.min(60,Math.max(...m,same?Math.max(...misses(sim,G.g.p)):0))/5)*5);
  const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:top,xcats:['Tunnel in','Tunnel out','Pond'],yl:'Miss (ft)'});
  if(same){const g=misses(sim,G.g.p),bw=(ax.X(1)-ax.X(0))*0.3;g.forEach((v,i)=>{ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.85;ctx.fillRect(ax.X(i+0.5)-bw-2,ax.Y(Math.min(v,top)),bw,ax.Y(0)-ax.Y(Math.min(v,top)));});ctx.globalAlpha=1;
   m.forEach((v,i)=>{ctx.fillStyle=PAL['rj'];ctx.fillRect(ax.X(i+0.5)+2,ax.Y(Math.min(v,top)),bw,ax.Y(0)-ax.Y(Math.min(v,top)));txt(ctx,f1(v),ax.X(i+0.5)+2+bw/2,ax.Y(Math.min(v,top))-5,{s:12,w:600,c:PAL['fg'],a:'center'});});
   legend(ctx,box.L+10,box.T+8,[{label:'Your gut',color:PAL['s4']},{label:'Now',color:PAL['rj']}]);}
  else bars(ctx,ax,m.map(v=>Math.min(v,top)),{colors:m.map(()=>PAL['rj']),d:1});},
 draw(sim,ctx,vdt,k){const D=des(sim),p=sim.p,G=sim.gutS,same=sameGut(sim),hon=atLeast('honors'),s=D.r[2],END=Math.min(186,s+28);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,600);
  /* grid every 10 ft */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.35;for(let x=-10;x<=190;x+=10){ctx.beginPath();ctx.moveTo(PX(x),PY(105));ctx.lineTo(PX(x),PY(-40));ctx.stroke();}for(let y=-30;y<=100;y+=10){ctx.beginPath();ctx.moveTo(PX(-15),PY(y));ctx.lineTo(800,PY(y));ctx.stroke();}ctx.globalAlpha=1;
  /* ground, and the pond */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,PY(0),800,600-PY(0));
  ctx.fillStyle=PAL['cv-water'];ctx.fillRect(PX(s-POND),PY(0),2*POND*S,34);
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,PY(0));ctx.lineTo(PX(s-POND),PY(0));ctx.moveTo(PX(s+POND),PY(0));ctx.lineTo(800,PY(0));ctx.stroke();
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(s-POND),PY(0));ctx.lineTo(PX(s+POND),PY(0));ctx.stroke();
  txt(ctx,'Ground level',PX(-14),PY(0)-6,{s:12*k,c:PAL['cv-soft']});
  /* supports under the current track */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;for(let x=0;x<=END;x+=10){const y=track(sim,x);if(y>2&&y<110){ctx.beginPath();ctx.moveTo(PX(x),PY(0));ctx.lineTo(PX(x),PY(y));ctx.stroke();}}
  const path=(fn,col,lw,dash,from,to)=>{ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.setLineDash(dash||[]);ctx.beginPath();let st=false;for(let x=from;x<=to+1e-9;x+=1){const y=fn(x);if(y>110||y<-45){st=false;continue;}st?ctx.lineTo(PX(x),PY(y)):ctx.moveTo(PX(x),PY(y));st=true;}ctx.stroke();ctx.setLineDash([]);};
  /* the curve kept going past both ends (end behavior), faintly, at Closer look */
  if(hon){ctx.globalAlpha=.4;path(x=>track(sim,x),PAL['rj'],2,[4,5],-14,190);ctx.globalAlpha=1;}
  if(hon&&p.alt){path(x=>target(D,false,x),PAL['s5'],2.5,[6,4],0,190);const ax=Math.min(184,s+22),ay=Math.max(-40,target(D,false,ax));tag(ctx,'With (x − '+s+'): it crosses and dives',PX(ax)-4,PY(ay)+(ay<-30?-8:18),{s:12*k,w:700,c:PAL['s5'],a:'right'});}
  if(same)path(x=>track(sim,x,G.g.p),PAL['s4'],2.5,[8,5],0,END);
  if(G&&G.m&&G.m.key===key(sim))path(x=>target(D,true,x),PAL['s3'],3,[2,4],0,END);
  /* tunnel cuts where the track is underground (not in the pond) */
  ctx.fillStyle=PAL['cv-bg'];for(let x=0;x<END;x+=1){if(x>=s-POND-1&&x<=s+POND)continue;const y=track(sim,x);if(y<0){ctx.globalAlpha=.9;ctx.fillRect(PX(x),PY(0),S+0.5,Math.min(PY(y)-PY(0)+8,170));}}ctx.globalAlpha=1;
  path(x=>track(sim,x),PAL['rj'],4.5,null,0,END);
  /* required marks */
  const blind=gutPhase(sim),mm=misses(sim);
  ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(0),PY(D.H),9,0,7);ctx.stroke();tag(ctx,'Section starts: '+D.H+' ft up',PX(0)+14,PY(D.H)-12,{s:12*k,w:700,c:PAL['s3']});
  [[D.r[0],'Tunnel in'],[D.r[1],'Tunnel out'],[s,'Skim the pond']].forEach(([x,l],i)=>{const miss=mm[i],hit=miss<0.5&&!blind;ctx.strokeStyle=hit?PAL['s3']:PAL['s2'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(x),PY(0),9,0,7);ctx.stroke();
   const right=i===2?false:track(sim,x+6)>track(sim,x-6),lx=i===2?PX(x):right?PX(x)+8:PX(x)-8,al=i===2?'center':right?'left':'right',ly=PY(0)+(i===2?40:12)+12*k;
   tag(ctx,l,lx,ly,{s:12*k,w:700,c:hit?PAL['s3']:PAL['s2'],a:al});
   if(!hit&&!blind){let why=f1(miss)+' ft off';if(i===2){const u=under(sim),y=track(sim,s);why=u>Math.abs(y)&&u>0.05?f1(u)+' ft into the pond':f1(Math.abs(y))+' ft '+(y>=0?'above':'below')+' the water';}tag(ctx,why,lx,ly+16*k,{s:12*k,c:PAL['cv-soft'],a:al});}});
  /* handles */
  [[p.x1,p.y1,'dip'],[p.x2,p.y2,'swoop']].forEach(([x,y,l])=>{ctx.fillStyle=PAL['card'];ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(x),PY(y),8,0,7);ctx.fill();ctx.stroke();
   tag(ctx,(blind?'your ':'')+l,PX(x),PY(y)-14,{s:13*k,w:700,c:PAL['rj'],a:'center'});});
  if(hon){const yv=track(sim,p.probe);if(yv>-45&&yv<110){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(PX(p.probe),PY(0));ctx.lineTo(PX(p.probe),PY(yv));ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(PX(p.probe),PY(yv),4,0,7);ctx.fill();}}
  if(blind)pill(ctx,'Aim for all 3 blue circles',600,PY(96),PAL['s2'],'#fff',14*Math.min(k,1.3));
  else pill(ctx,'Worst miss: '+f1(worst(sim))+' ft',600,PY(96),worst(sim)<0.05?PAL['s3']:PAL['rj'],'#fff',14*k);
  if(same)txt(ctx,'Your gut: dashed orange',600,PY(96)+26*k,{s:12*k,w:700,c:PAL['s4'],a:'center'});
  /* Walkthrough layers: steps that explain the formula draw what they name, outlined in red. */
  const stg=(sim.tour&&sim.tour.on)?(sim.tst||0):0,rg=(x,y,w,h)=>{ctx.save();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;rr(ctx,x,y,w,h,8);ctx.stroke();ctx.restore();};
  if(stg===4)D.r.slice(0,2).forEach(x=>{rg(PX(x)-26*k,PY(0)-20*k,52*k,40*k);pill(ctx,'(x − '+x+')',PX(x),PY(0)-34*k,PAL['rj'],'#fff',13*k);});
  if(stg===5){const x=D.r[2],y0=PY(0);rg(PX(x)-70*k,y0-58*k,140*k,74*k);pill(ctx,'(x − '+x+')²',PX(x),y0-74*k,PAL['rj'],'#fff',13*k);
   txt(ctx,'+',PX(x)-46*k,y0-24*k,{s:20*k,w:800,c:PAL['rj'],a:'center'});txt(ctx,'+',PX(x)+46*k,y0-24*k,{s:20*k,w:800,c:PAL['rj'],a:'center'});txt(ctx,'0',PX(x),y0+6*k,{s:13*k,w:800,c:PAL['rj'],a:'center'});}
  if(stg===7){/* both ends rise, and the 3 turning points */
   [[2,track(sim,2)],[END,track(sim,END)]].forEach(([x,y],i)=>{const X0=PX(x),Y0=clamp(PY(y),PY(118),PY(-40));ctx.strokeStyle=PAL['rj'];ctx.fillStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X0,Y0+34*k);ctx.lineTo(X0,Y0);ctx.stroke();ctx.beginPath();ctx.moveTo(X0-8,Y0+8);ctx.lineTo(X0,Y0-4);ctx.lineTo(X0+8,Y0+8);ctx.closePath();ctx.fill();});
   pill(ctx,'ax⁴ with a > 0: both ends rise',400,PY(-34),PAL['rj'],'#fff',13*k);
   const tp=[];let prev=null;for(let x=1;x<=Math.min(END,170);x+=0.5){const d=track(sim,x+0.25)-track(sim,x-0.25);if(prev!==null&&Math.sign(d)!==Math.sign(prev)&&d!==0)tp.push(x);prev=d;}
   tp.slice(0,3).forEach((x,i)=>{rg(PX(x)-16*k,PY(track(sim,x))-16*k,32*k,32*k);txt(ctx,'turn '+(i+1),PX(x),PY(track(sim,x))+(i===1?-24:34)*k,{s:12*k,w:800,c:PAL['rj'],a:'center'});});}},
 onClick(sim,x,y){const fx=(x-OX)/S,fy=(GY-y)/S,p=sim.p;const d1=Math.hypot(fx-p.x1,fy-p.y1),d2=Math.hypot(fx-p.x2,fy-p.y2);
  const r=v=>Math.round(v*2)/2;if(d1<=d2)BioLab.setValues(sim,{x1:clamp(r(fx),10,80),y1:clamp(r(fy),-30,20)});else BioLab.setValues(sim,{x2:clamp(r(fx),90,170),y2:clamp(r(fy),-10,30)});},
 narrate(sim){const D=des(sim),m=misses(sim),w=Math.max(...m),i=m.indexOf(w),s=D.r[2];
  if(w<0.05)return `<b>Every mark hit.</b> The track goes through ground level at ${D.r[0]} and ${D.r[1]} ft (the tunnel) but only <b>touches</b> the water at ${s} ft and rises again. Touching without crossing is what a squared factor does.`;
  if(i===2){const u=under(sim),y=track(sim,s);if(u>Math.abs(y)&&u>0.05)return `The track <b>dips ${f1(u)} ft into the pond</b>: it goes through the water level instead of just touching it. To skim, the curve has to come down to 0 and turn back up right at ${s} ft.`;
   return `The track is <b>${f1(Math.abs(y))} ft above the water</b> at ${s} ft, so it never skims the pond. Moving the dip or the swoop changes the whole curve, including its far ends.`;}
  const x=D.r[i],y=track(sim,x);
  return `The worst miss is at ${NAMES[i]} (x = ${x} ft): the track is <b>${f1(Math.abs(y))} ft ${y>0?'above':'below'} ground</b> there instead of at ground level, so it would not meet the tunnel mouth.`;},
 gut:{better:'lower',
  controls:['y1','y2'],
  ask:{bio:'Shape the red track so it goes through both tunnel circles and, at the pond, just touches the water and rises again. Click the picture where you want the bottom of the tunnel dip, then where you want the low point of the swoop: the nearer handle jumps to each click. Fine-tune their heights with the two sliders here, then lock it in.',honors:'Before you build from the zeros: shape the track by eye. Click the picture to move the dip and the swoop, fine-tune their heights with the sliders here, then lock it in.'},
  lockLabel:'Lock in my track',
  lock(sim){const w=worst(sim);return {v:w,p:{x1:sim.p.x1,y1:sim.p.y1,x2:sim.p.x2,y2:sim.p.y2},key:key(sim),label:`a track whose worst miss is ${f1(w)} ft`};},
  solve(sim){const D=des(sim),T=turns(D);Object.assign(sim.p,T);const w=worst(sim);return {v:w,p:T,key:key(sim),label:atLeast('honors')?`${factText(D,true)}, missing every mark by ${f1(w)} ft`:`a curve built from where it meets ground level, missing every mark by ${f1(w)} ft`};},
  how:{bio:'The math writes the track as a product, with one factor for each place it meets ground level. A factor like (x − 20) makes the track pass through ground level at 20 ft. At the pond the factor is squared, (x − 140)², so the track only touches the water there and turns back up. Then one number, a, is set so the track starts 90 ft up, where the section begins.',
   honors:'Tunnel mouths r₁, r₂ are crossings (odd multiplicity): factors (x − r₁)(x − r₂). The pond s is a touch (even multiplicity): (x − s)². The point (0, H) gives a = H/(r₁r₂s²). Degree 4 with a > 0, so both ends rise: after the pond the track climbs again.',
   ap:'y = a(x − r₁)(x − r₂)(x − s)², a = H/(r₁r₂s²). By the product rule, y′ = a(x − s)[(x − s)(2x − r₁ − r₂) + 2(x − r₁)(x − r₂)]. So y′ = 0 at s itself (the skim) and at the two roots of the quadratic in brackets: the dip and the hill.'},
  compare(sim,g,m){const D=des(sim),gm=misses(sim,g.p),w=Math.max(...gm),i=gm.indexOf(w),s=D.r[2];
   if(g.v<0.5)return `Your gut was right on: your track misses no mark by more than ${f1(g.v)} ft. The factored form hits them all exactly, and it explains why your shape worked: two crossings, one touch and a start height pin down one quartic.`;
   const bad=gm.filter(x=>x>=1).length;let where;
   if(i===2){const u=under(sim,g.p),y=track(sim,s,g.p);where=u>Math.abs(y)&&u>0.05?`your track dips <b>${f1(u)} ft into the pond</b>, so the train would plunge into the water instead of skimming it`:`your track passes <b>${f1(Math.abs(y))} ft above the water</b>, so it never skims the pond`;}
   else{const x=D.r[i],y=track(sim,x,g.p);where=`at ${NAMES[i]} (x = ${x} ft) your track is <b>${f1(Math.abs(y))} ft ${y>0?'above':'below'} ground</b>, so it would not meet the tunnel mouth`;}
   return `The ${atLeast('honors')?'factored-form':'math'} track hits every mark exactly. Yours misses ${bad} of the 3 marks by a foot or more. The worst: ${where}. That is <b>${f1(w)} ft</b> of track in the wrong place.`;},
  again(sim){const ks=Object.keys(DESIGNS);sim.p.design=ks[Math.floor(Math.random()*ks.length)];sim.p.alt=false;Object.assign(sim.p,{x1:50,y1:-5,x2:125,y2:10});}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'At the pond, the track must come down to the water, just touch it and rise again. Near that mark, what does the graph look like?',choices:['It passes through ground level, like a tunnel mouth','It touches ground level and turns back up (a bounce)','It stays above ground level the whole way'],correct:1,explain:'Touching without crossing is a bounce. In the equation it comes from a squared factor, (x − 140)²: a square is never negative, so the track cannot go below the water on either side.'},
  {lvl:'bio',instant:true,q:'A track is y = a(x − 20)(x − 60)(x − 140)². Where is it at ground level?',choices:['Only at x = 140','x = 20, 60 and 140','x = −20, −60 and −140','x = 0'],correct:1,explain:'A product is 0 when one factor is 0: x = 20, x = 60 or x = 140. It passes through ground level at 20 and 60 (the tunnel), and only touches it at 140 (the pond), because that factor is squared.'},
  {lvl:'honors',instant:true,q:'Plan A: y = a(x − 20)(x − 60)(x − 140)² with a > 0. If you kept the curve going past the pond, what would the track do?',choices:['Dive underground forever','Climb higher and higher forever','Level off at ground level','Turn back down into another tunnel'],correct:1,explain:'Multiply out the x’s: the leading term is ax⁴, degree 4 with a > 0. Even degree with a positive leading coefficient: both ends rise. The faint extension on the picture climbs on both sides.'},
  {lvl:'honors',instant:true,q:'Change the pond factor to (x − 140), so y = a(x − 20)(x − 60)(x − 140), still 90 ft up at x = 0. What happens to a and the right end?',choices:['a stays positive; the right end still rises','a turns negative; the right end falls','a turns negative; the right end rises','Nothing changes'],correct:1,explain:'At x = 0, (−20)(−60)(−140) = −168,000, so a = 90/(−168,000) < 0. Now it is degree 3 with a < 0: up on the left, down on the right, so at the pond it crosses the water level and dives. Turn on the Compare toggle to see it.'},
  {lvl:'honors',instant:true,q:'A zero has multiplicity 3, like the factor (x − 140)³. What does the graph do there?',choices:['Bounces off the axis','Crosses straight through at an angle','Flattens out and crosses (a wiggle)','Never reaches the axis'],correct:2,explain:'Odd multiplicity crosses; even multiplicity bounces. Multiplicity 1 crosses at an angle; multiplicity 3 flattens out as it crosses, like y = x³ at 0.'},
  {lvl:'ap',instant:true,q:'Plan A: crossings at 20 and 60, a touch at 140, and 90 ft up at x = 0. What is a?',choices:['a = 90/23,520,000 ≈ 3.83 × 10⁻⁶','a = −90/168,000 ≈ −5.36 × 10⁻⁴','a = 90/168,000 ≈ 5.36 × 10⁻⁴','a = −90/23,520,000 ≈ −3.83 × 10⁻⁶'],correct:0,explain:'y(0) = a(−20)(−60)(−140)² = a(1,200)(19,600) = 23,520,000a = 90, so a = 90/23,520,000 ≈ 3.83 × 10⁻⁶. It is positive: the squared factor is positive and the other two negatives multiply to a positive.'},
  {lvl:'ap',instant:true,q:'What is the lowest degree of a polynomial that crosses the x-axis at two places and touches it at one more?',choices:['3','4','5','6'],correct:1,explain:'Two crossings give two factors and a touch gives a squared factor: 1 + 1 + 2 = 4. A degree 4 polynomial also has room for the 3 turning points the track needs: the dip, the hill and the skim.'}
 ],
 tour:[
  {title:'The marks',text:{bio:'This is one section of your coaster, seen from the side. The level fixes the marks: the section starts 90 ft up, partway down the first drop, goes into a tunnel 20 ft along, comes out at 60 ft, then swoops down to skim the pond at 140 ft.',honors:'This is one section of your coaster, seen from the side. The level fixes the marks: (0, 90) where the section starts, partway down the first drop, a tunnel from x = 20 to x = 60, and a skim of the pond at x = 140.'},focus:[10,40,780,520],pause:true,setup:sim=>{sim.tst=1;return BioLab.setValues(sim,{design:'A',alt:false,x1:50,y1:-5,x2:125,y2:10});}},
  {title:'Shape it with two low points',text:'The red track is one smooth curve that always starts at the section’s first mark, 90 ft up. You shape the rest with two handles: the bottom of the dip in the tunnel, and the low point of the swoop at the end. Right now it misses the marks.',pause:true,focus:sim=>[PX(sim.p.x1)-40,PY(30)-20,PX(sim.p.x2)-PX(sim.p.x1)+80,PY(sim.p.y1)-PY(30)+60],setup:sim=>{sim.tst=2;}},
  {title:'Close, but not exact',text:'Here is a good eyeball try: the swoop right on the pond at 140 ft, and the dip 15 ft down at 35 ft along. It looks right, but the track misses the tunnel exit by 3.6 ft. In steel and concrete, that is a lot.',pause:true,setup:sim=>{sim.tst=3;return BioLab.setValues(sim,{x1:35,y1:-15,x2:140,y2:0});}},
  {title:'Crossings give factors',text:'The track passes through ground level at x = 20 and x = 60. Each crossing is a zero with a factor of its own: (x − 20) and (x − 60).',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'A touch gives a squared factor',text:'At the pond the track must touch the water and rise again. A squared factor, (x − 140)², does that: it is 0 at 140 and positive on both sides. So the track is y = a(x − 20)(x − 60)(x − 140)².',pause:true,setup:sim=>{sim.tst=5;}},
  {title:'The start height gives a',text:'At x = 0 the track must be 90 ft up: a(−20)(−60)(−140)² = 23,520,000a = 90, so a ≈ 0.00000383. Now every mark is hit exactly.',pause:true,setup:sim=>{sim.tst=6;return BioLab.setValues(sim,turns(DESIGNS.A));}},
  {lvl:'honors',title:'Degree and end behavior',text:'Multiply it out and the leading term is ax⁴: degree 4 with a > 0, so both ends rise, as the faint extension shows. Past the pond the track climbs again. A degree 4 curve has at most 3 turning points: here the dip, the hill and the skim.',pause:true,setup:sim=>{sim.tst=7;}},
  {lvl:'honors',title:'Cross instead of touch',text:'The purple curve uses (x − 140) instead of (x − 140)², through the same start and zeros. It is degree 3, and to start 90 ft up its a must be negative. So it crosses the water level at 140 and dives: the train ends up in the pond.',pause:true,setup:sim=>{sim.tst=8;return BioLab.setValues(sim,{alt:true});}},
  {lvl:'ap',title:'Turning points from the derivative',text:'For Plan A, y′ = a(x − 140)(4x² − 520x + 13,600). It is 0 at x = 140 (the skim) and where x² − 130x + 3,400 = 0: x = (130 ± √3,300)/2. So the dip is at x ≈ 36.3 (15.9 ft underground) and the hill at x ≈ 93.7 (20.4 ft up).',pause:true,setup:sim=>{sim.tst=9;return BioLab.setValues(sim,{alt:false});}}
 ],
 onTourExit(sim){BioLab.setValues(sim,{alt:false});},
 lab:{bio:'<p><b>Question:</b> How close can you get by eye?</p><ol><li>For Plan A, shape the track by eye. Record a trial with your worst miss.</li><li>Try two more times and record each.</li><li>Then do the same for Plan B.</li></ol><p>Write one sentence: how does the track have to behave differently at the pond than at a tunnel mouth?</p>',
  honors:'<p><b>Question:</b> How do the zeros, their multiplicity and one point fix the track?</p><ol><li>For each plan, write y = a(x − r₁)(x − r₂)(x − s)² and solve for a from the start height.</li><li>Use <b>Read the height at</b> to check your equation at two other points.</li><li>Press <b>Build it from the zeros</b> and compare.</li><li>Turn on <b>Compare: cross at the pond</b>. For both curves, write the degree, the sign of a and the end behavior.</li></ol>',
  ap:'<p><b>Question:</b> Where is each plan steepest, and where does it turn?</p><ol><li>For each plan, find y′(x) and its zeros: the dip, the hill and the skim.</li><li>Find the steepest drop on 0 ≤ x ≤ s and its angle, arctan|y′|.</li><li>Check against <b>Steepest drop</b>.</li></ol><p><b>CER:</b> Claim, evidence from your calculations, and reasoning about why a squared factor always makes a turning point at its zero.</p>'},
 terms:[
  {t:'Zero (root)',d:'An x-value where the polynomial equals 0. Here, where the track is at ground level or the pond’s surface.'},
  {t:'Factored form',d:'y = a(x − r₁)(x − r₂)…: it shows the zeros directly. One known point then fixes a.'},
  {t:'Bounce and cross',d:'At a zero the graph either passes through the axis (cross) or touches it and turns back (bounce).'},
  {t:'Turning point',d:'Where the graph switches between rising and falling: the dip, the hill and the skim.'},
  {t:'Multiplicity',d:'How many times a factor repeats. Odd multiplicity crosses the axis; even multiplicity bounces. Multiplicity 3 crosses while flattening out (a wiggle).',lvl:'honors'},
  {t:'Degree',d:'The highest power of x. When the polynomial factors completely into linear factors, it is the sum of the multiplicities. A degree-n polynomial has at most n zeros and at most n − 1 turning points.',lvl:'honors'},
  {t:'End behavior',d:'What y does as x → ±∞. Even degree: both ends go the same way. Odd degree: opposite ways. The sign of the leading coefficient says which.',lvl:'honors'},
  {t:'Leading coefficient',d:'The number in front of the highest power of x. In factored form it is a.',lvl:'honors'},
  {t:'Derivative',d:'The slope function y′(x). Turning points are where y′ = 0; the drop angle is arctan|y′|.',lvl:'ap'}
 ],
 about:'<p>Your track is the polynomial that starts where the section begins, (0, H), partway down the first drop, and has turning points at your dip (x₁, y₁) and your swoop (x₂, y₂): its slope is y′ = (x − x₁)(x − x₂)(px + q), with p and q set so it passes through both handles. That makes it a quartic (or a cubic when p = 0). The math track is y = a(x − r₁)(x − r₂)(x − s)² with a = H/(r₁r₂s²). The Compare curve is y = a(x − r₁)(x − r₂)(x − s) with a = −H/(r₁r₂s).</p><p><b>Worst miss</b> is the largest gap at the three marks: the vertical gap at each tunnel mouth, and at the pond the larger of the gap between the track and the water at the mark and the deepest the track goes into the pond (which runs 15 ft either side of the mark).</p><p>The site plans are made up for practice. Real coaster tracks are designed in software as chains of curves and checked for the forces riders feel, the track’s banking and the train’s speed, none of which this model includes. One polynomial for a whole section is a simplification.</p>'
};
BioLab.register(SIM);
})();
