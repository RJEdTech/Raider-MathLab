(function(){
'use strict';
const {clamp,txt,pill,PAL,atLeast,fmtNum,RM}=BioLab.h;
/* Three uses of one ellipse. a = half the long axis, in each mode's own unit. r = how close a reflected ray must pass to count as reaching the spot. */
const MODES={
 room:{l:'Whispering gallery',a:15,u:'m',r:0.5,thing:'sound'},
 litho:{l:'Kidney stone machine',a:10,u:'cm',r:0.4,thing:'shock wave'},
 orbit:{l:'Satellite orbit',a:30000,u:'km',thing:'orbit'}};
const R_EARTH=6371,NRAY=720;
let cur=null;
const M_=sim=>MODES[sim.p.mode];
const A=sim=>M_(sim).a,Bm=sim=>A(sim)*Math.sqrt(1-sim.p.e*sim.p.e),Cf=sim=>A(sim)*sim.p.e;
/* the student's spot, kept just inside the ellipse */
function spot(sim,gx,gy){const a=A(sim),b=Bm(sim);let x=(gx===undefined?sim.p.gx:gx)/100*a,y=(gy===undefined?sim.p.gy:gy)/100*b;const q=x*x/(a*a)+y*y/(b*b);if(q>0.96){const s=Math.sqrt(0.96/q);x*=s;y*=s;}return [x,y];}
/* the right answer: the other focus for waves, the near focus (perigee on the left) for the planet */
const target=sim=>sim.p.mode==='orbit'?[-Cf(sim),0]:[Cf(sim),0];
const missOf=(sim,p)=>{const t=target(sim);return Math.hypot(p[0]-t[0],p[1]-t[1]);};
/* Rays from the left focus, one reflection off the wall. Returns the % of all rays that pass within r of p. The kidney-stone reflector is only the half of the ellipse around the spark (x ≤ 0). */
function pct(sim,p){const m=M_(sim);if(sim.p.mode==='orbit')return NaN;const a=A(sim),b=Bm(sim),fx=-Cf(sim);let n=0;
 for(let i=0;i<NRAY;i++){const th=(i+0.5)/NRAY*2*Math.PI,dx=Math.cos(th),dy=Math.sin(th);const qa=dx*dx/(a*a)+dy*dy/(b*b),qb=2*fx*dx/(a*a),qc=fx*fx/(a*a)-1;const t=(-qb+Math.sqrt(qb*qb-4*qa*qc))/(2*qa);
  const hx=fx+t*dx,hy=t*dy;if(sim.p.mode==='litho'&&hx>0)continue;let nx=hx/(a*a),ny=hy/(b*b);const nl=Math.hypot(nx,ny);nx/=nl;ny/=nl;const dn=dx*nx+dy*ny,rx=dx-2*dn*nx,ry=dy-2*dn*ny;
  const s=Math.max(0,(p[0]-hx)*rx+(p[1]-hy)*ry),ex=p[0]-hx-s*rx,ey=p[1]-hy-s*ry;if(Math.hypot(ex,ey)<=m.r)n++;}
 return n/NRAY*100;}
/* lowest point of the orbit if the planet's center were at p (closest point of the ellipse), as an altitude */
function lowAlt(sim,p){if(sim.p.mode!=='orbit')return NaN;const a=A(sim),b=Bm(sim);let d=1e12;for(let i=0;i<1440;i++){const t=i/1440*2*Math.PI;d=Math.min(d,Math.hypot(a*Math.cos(t)-p[0],b*Math.sin(t)-p[1]));}return d-R_EARTH;}
const u=sim=>M_(sim).u;
const num=(sim,v)=>sim.p.mode==='orbit'?Math.round(v).toLocaleString('en-US'):fmtNum(v,1);
const keyOf=sim=>sim.p.mode+'|'+sim.p.e;
const gutG=sim=>{const G=sim.gutS;return G&&G.g&&G.g.key===keyOf(sim)?G.g:null;};
const solved=sim=>{const G=sim.gutS;return !!(G&&G.m&&G.m.key===keyOf(sim));};
const clearGut=sim=>{if(sim.gutS){sim.gutS.g=null;sim.gutS.m=null;}if(BioLab.gutRender)BioLab.gutRender(sim);};
/* Guided, before the gut is locked: no live score at the student's spot, so the answer stays their call. */
const pre=sim=>sim.mode==='guided'&&!(sim.gutS&&sim.gutS.g);
const big=()=>!atLeast('honors');
const showMath=sim=>sim.p.rays||solved(sim);

/* stage geometry: ellipse centered at (400, 238) */
const CX=400,CY=238;
const scl=sim=>Math.min(330/A(sim),170/Bm(sim));
const SXp=(sim,x)=>CX+x*scl(sim),SYp=(sim,y)=>CY-y*scl(sim);
function kepler(e,M){let E=M;for(let i=0;i<8;i++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return E;}

const SIM={
 id:'orbits',hash:'orbits',apUnit:11,order:4,tab:'Ellipses at work',kind:'Go further',
 card:'Guess where a whisper gathers, where a kidney stone must sit, or where a planet hides inside an orbit; then find the foci.',
 title:'Ellipses at work: foci that focus',
 lede:{bio:'An ellipse is a stretched circle with two special points inside it, called foci. Sound bouncing off an elliptical wall and a satellite circling Earth both follow rules set by those two points.',
  honors:'For an ellipse with half-length a and half-width b, the foci sit c from the center on the long axis, where c² = a² − b². Any wave leaving one focus reflects off the ellipse through the other focus.',
  ap:'With c² = a² − b² and eccentricity e = c/a, an orbit with its planet at one focus comes closest at a(1 − e) and farthest at a(1 + e) from the planet’s center.'},
 scale:{bio:'Seen from above (the room and the machine) or from far out in space (the orbit). Drawn to scale.'},
 aspect:16/9,timeless:true,animated:true,trials:true,graph:false,
 controlsTitle:'The ellipse',
 controls:[
  {id:'mode',label:'Where the ellipse is',type:'seg',def:'room',onChange:clearGut,options:[{v:'room',l:'Whispering room'},{v:'litho',l:'Kidney stone'},{v:'orbit',l:'Orbit'}],help:'Room: 30 m long. Kidney stone machine: a reflector 20 cm long. Orbit: 60,000 km long, around Earth.'},
  {id:'e',label:'How stretched (eccentricity e)',type:'range',min:0.2,max:0.75,step:0.05,def:0.6,unit:'',lvl:'honors',noGut:true,onChange:clearGut,help:'e = c/a. At 0 the ellipse is a circle; close to 1 it is long and thin.'},
  {id:'gx',label:'Your spot: left (−) or right (+), % of the way to the end',type:'range',min:-100,max:100,step:1,def:0,unit:'%',help:'Or click inside the ellipse.'},
  {id:'gy',label:'Your spot: down (−) or up (+), % of the way to the side',type:'range',min:-100,max:100,step:1,def:0,unit:'%',help:' '},
  {id:'rays',label:'Show the foci and wave paths',type:'toggle',def:false,help:'Draws the foci and, for the room and the machine, the paths the waves take.'}
 ],
 onLevel(sim){const b=big(),W=sim.ui.ctlW||{};
  const set=(id,l,h)=>{const w=W[id];if(!w)return;const L=w.querySelector('label');if(L)L.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('gx',b?'Your spot: left or right of center':'Your spot: left (−) or right (+), % of the way to the end',b?'Minus is left, plus is right; 100% reaches the end. Or click inside the ellipse.':'Or click inside the ellipse.');
  set('gy',b?'Your spot: below or above center':'Your spot: down (−) or up (+), % of the way to the side',b?'Minus is down, plus is up.':' ');},
 init(){return {};},step(){},
 metrics:[
  {id:'size',label:'Size',text:true,get:sim=>{const a=A(sim),b=Bm(sim);return `${num(sim,2*a)} × ${num(sim,2*b)} ${u(sim)}`+(big()?'':`: a = ${num(sim,a)}, b = ${num(sim,b)}`);}},
  {id:'foc',label:'Each focus is this far from the center',text:true,lvl:'honors',get:sim=>`c = √(a² − b²) = ${num(sim,Cf(sim))} ${u(sim)}`},
  {id:'e',label:'Eccentricity e = c/a',unit:'',d:2,lvl:'honors',min:0,max:1,get:sim=>sim.p.e},
  {id:'pct',label:'Reflected wave reaching your spot',unit:'%',d:0,min:0,max:100,get:sim=>pct(sim,spot(sim))},
  {id:'alt',label:'Lowest point, if the planet were at your spot',unit:'km up',d:0,min:null,max:null,get:sim=>lowAlt(sim,spot(sim))}
 ],
 draw(sim,ctx,vdt,k){cur=sim;const md=sim.p.mode,a=A(sim),b=Bm(sim),c=Cf(sim),s=scl(sim),fs=12*k,G=sim.gutS,GG=gutG(sim),sol=solved(sim),sm=showMath(sim);
  const X=x=>SXp(sim,x),Y=y=>SYp(sim,y);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const V=sim.vis;V.ph=(V.ph||0)+(RM?0:vdt);
  const ell=()=>{ctx.beginPath();ctx.ellipse(CX,CY,a*s,b*s,0,0,2*Math.PI);};
  if(md==='room'){ell();ctx.fillStyle=PAL['cv-bench'];ctx.fill();ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=7;ctx.stroke();}
  else if(md==='litho'){/* patient's body on the right, reflector bowl on the left */
   ctx.fillStyle=PAL['cv-ims'];ctx.beginPath();ctx.ellipse(X(a*0.55),CY,a*0.62*s,b*1.18*s,0,0,2*Math.PI);ctx.fill();ctx.strokeStyle=PAL['cv-head'];ctx.lineWidth=2;ctx.stroke();
   txt(ctx,'Patient',X(a*0.55),Y(b*1.18)-8,{s:fs,w:700,c:PAL['cv-soft'],a:'center'});
   ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,6]);ctx.lineWidth=1.5;ell();ctx.stroke();ctx.setLineDash([]);
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(CX,CY,a*s,b*s,0,Math.PI/2,Math.PI*1.5);ctx.stroke();
   txt(ctx,'Reflector',X(-a)-6,Y(b*0.75),{s:fs,w:700,c:PAL['cv-ink'],a:'right'});}
  else{ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ell();ctx.stroke();}
  /* axes of the ellipse, with a and b */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(X(-a),CY);ctx.lineTo(X(a),CY);ctx.moveTo(CX,Y(b));ctx.lineTo(CX,Y(-b));ctx.stroke();ctx.setLineDash([]);
  {const yd=Y(-b)+5;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(CX,yd-4);ctx.lineTo(CX,yd+4);ctx.moveTo(CX,yd);ctx.lineTo(X(a),yd);ctx.moveTo(X(a),yd-4);ctx.lineTo(X(a),yd+4);ctx.stroke();txt(ctx,(big()?'half the length: ':'a = ')+num(sim,a)+' '+u(sim),X(a/2),Math.min(446,yd+15*k),{s:fs,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,(big()?'half the width: ':'b = ')+num(sim,b)+' '+u(sim),CX+6,Y(b/2),{s:fs,c:PAL['cv-soft']});
  /* wave paths */
  const t2=target(sim);
  if(sm&&md!=='orbit'){const fx=-c;ctx.lineWidth=1.3;for(let i=0;i<40;i++){const th=(i+0.5)/40*2*Math.PI,dx=Math.cos(th),dy=Math.sin(th);const qa=dx*dx/(a*a)+dy*dy/(b*b),qb=2*fx*dx/(a*a),qc=fx*fx/(a*a)-1;const t=(-qb+Math.sqrt(qb*qb-4*qa*qc))/(2*qa),hx=fx+t*dx,hy=t*dy;
    if(md==='litho'&&hx>0)continue;ctx.strokeStyle=PAL['s2'];ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(X(fx),Y(0));ctx.lineTo(X(hx),Y(hy));ctx.lineTo(X(c),Y(0));ctx.stroke();}ctx.globalAlpha=1;
   /* one bright pulse moving along a path */
   const ph=(V.ph/3)%1,th=0.9+Math.floor(V.ph/3)%5*0.55,dx=Math.cos(th),dy=Math.sin(th),qa=dx*dx/(a*a)+dy*dy/(b*b),qb=2*fx*dx/(a*a),qc=fx*fx/(a*a)-1,tt=(-qb+Math.sqrt(qb*qb-4*qa*qc))/(2*qa),hx=fx+tt*dx,hy=tt*dy;
   if(!(md==='litho'&&hx>0)){const l1=Math.hypot(hx-fx,hy),l2=Math.hypot(c-hx,hy),d=ph*(l1+l2);const p=d<l1?[fx+dx*d,dy*d]:[hx+(c-hx)*(d-l1)/l2,hy+(0-hy)*(d-l1)/l2];ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(X(p[0]),Y(p[1]),5,0,7);ctx.fill();}}
  /* foci */
  if(sm){[[-c,0],[c,0]].forEach(f=>{ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(X(f[0]),Y(f[1]),5,0,7);ctx.fill();});
   ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(CX,CY+30*k);ctx.lineTo(X(c),CY+30*k);ctx.stroke();txt(ctx,(big()?'':'c = ')+num(sim,c)+' '+u(sim)+(big()?' from center':''),X(c/2),CY+46*k,{s:fs,w:700,c:PAL['s3'],a:'center'});}
  /* sources */
  if(md==='room'){ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(-c),Y(0),8,0,7);ctx.fill();txt(ctx,'Singer here',X(-c),Y(0)+24*k,{s:fs,w:700,c:PAL['s5'],a:'center'});}
  if(md==='litho'){ctx.fillStyle=PAL['cv-e'];ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?4:10,an=i*Math.PI/5;ctx.lineTo(X(-c)+r*Math.cos(an),Y(0)+r*Math.sin(an));}ctx.closePath();ctx.fill();txt(ctx,'Spark',X(-c),Y(0)+26*k,{s:fs,w:700,c:PAL['cv-ink'],a:'center'});}
  /* the student's spot */
  const gp=GG?spot(sim,GG.gx,GG.gy):spot(sim),gpx=X(gp[0]),gpy=Y(gp[1]);
  if(md==='orbit'){/* planet at the guess; the real Earth once solved */
   if(sol||sim.p.rays){ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(X(t2[0]),Y(0),R_EARTH*s,0,7);ctx.fill();ctx.globalAlpha=1;txt(ctx,'Earth',X(t2[0]),Y(0)+4,{s:fs,w:700,c:'#fff',a:'center',b:'middle'});}
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(gpx,gpy,R_EARTH*s,0,7);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(gpx,gpy,4,0,7);ctx.fill();
   txt(ctx,GG?'Your gut':'Your planet',gpx,gpy-R_EARTH*s-8,{s:fs,w:700,c:PAL['s4'],a:'center'});
   /* satellite, moving by Kepler's laws around the near (left) focus */
   const e=sim.p.e,Mn=RM?2.2:(V.ph/8%1)*2*Math.PI,E=kepler(e,Mn),sx=-a*Math.cos(E),sy=b*Math.sin(E);
   ctx.fillStyle=PAL['rj'];ctx.fillRect(X(sx)-5,Y(sy)-5,10,10);ctx.fillRect(X(sx)-14,Y(sy)-2,28,4);
   txt(ctx,'Satellite',X(sx),Y(sy)+(sy>0?22*k:-12),{s:fs,w:700,c:PAL['rj'],a:'center'});}
  else{ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(gpx,gpy,10,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(gpx-15,gpy);ctx.lineTo(gpx+15,gpy);ctx.moveTo(gpx,gpy-15);ctx.lineTo(gpx,gpy+15);ctx.lineWidth=1.5;ctx.stroke();
   const lab=(GG?'Your gut':md==='room'?'Your mic':'Stone')+(pre(sim)?'':': '+fmtNum(pct(sim,gp),0)+'%');ctx.font='700 '+fs+'px '+BioLab.h.FONT;const w=ctx.measureText(lab).width;
   const lx=clamp(gpx-w/2,6,794-w),ly=gpy>CY-20&&gpy<CY+60?gpy-20:gpy+30;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.8;ctx.fillRect(lx-3,ly-fs,w+6,fs*1.35);ctx.globalAlpha=1;txt(ctx,lab,lx,ly,{s:fs,w:700,c:PAL['s4']});
   if(sol){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(X(c),Y(0),9,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();}}
  /* title strip */
  txt(ctx,md==='room'?'An elliptical room, seen from above':md==='litho'?'Shock wave machine, seen from the side (simplified)':'A satellite orbiting Earth, seen from far above',12,20*k,{s:13*k,w:700,c:PAL['cv-ink']});},
 onClick(sim,x,y){const a=A(sim),b=Bm(sim),s=scl(sim);BioLab.setValues(sim,{gx:Math.round(clamp((x-CX)/s/a*100,-100,100)),gy:Math.round(clamp((CY-y)/s/b*100,-100,100))});},
 narrate(sim){const md=sim.p.mode,p=spot(sim),c=Cf(sim);
  if(pre(sim))return md==='orbit'?'The satellite speeds up and slows down as it goes around. Place the planet where you think it is, then lock it in.':`Sound from the ${md==='room'?'singer':'spark'} spreads out in every direction and bounces off the curved ${md==='room'?'wall':'reflector'}. Place your ${md==='room'?'mic':'stone'} where you think the most bounced sound arrives, then lock it in.`;
  if(md==='orbit'){const al=lowAlt(sim,p),tr=A(sim)-c-R_EARTH;return `If Earth’s center were at your spot, the satellite’s lowest point would be ${al<0?'<b>inside the planet</b>':Math.round(al).toLocaleString('en-US')+' km up'}. <b>Kepler’s first law:</b> the planet sits at a focus, ${num(sim,c)} km from the center, which puts the lowest point ${Math.round(tr).toLocaleString('en-US')} km up.`;}
  const P=pct(sim,p),w=md==='room'?'sound':'shock wave';
  if(P>=99)return `<b>Every reflected path meets here.</b> This is the second focus, ${num(sim,c)} ${u(sim)} from the center: the ${w} from the first focus bounces off the ${md==='room'?'wall':'reflector'} and arrives all at once.`;
  return `About ${fmtNum(P,0)}% of the reflected ${w} passes within ${md==='room'?'0.5 m':'0.4 cm'} of your spot. ${P<20?'<b>The reflections are spread out here.</b> ':''}The paths gather at one special point.`;},
 gut:{better:'lower',
  controls:['gx','gy'],
  get ask(){const md=cur?cur.p.mode:'room';return md==='orbit'?'Tracking stations measured this satellite’s path. Where is the center of the planet it orbits? Hint: the satellite moves fastest when it is closest. Click there, or set the two sliders here, then lock it in.':md==='litho'?'A spark makes a shock wave at the marked spot. Where must the kidney stone sit so the reflected waves hit it hardest? Click there, or set the two sliders here, then lock it in.':'The singer stands at the purple spot. Click inside the room where you would put the mic, or set the two sliders here. Go by feel, then lock it in.';},
  lock(sim){const p=spot(sim);return {v:missOf(sim,p),gx:sim.p.gx,gy:sim.p.gy,p,key:keyOf(sim),mode:sim.p.mode,pc:pct(sim,p),al:lowAlt(sim,p),label:sim.p.mode==='orbit'?`${num(sim,missOf(sim,p))} km from the right spot`:`a spot ${num(sim,missOf(sim,p))} ${u(sim)} from the answer`};},
  solve(sim){const t=target(sim),a=A(sim);sim.p.gx=t[0]/a*100;sim.p.gy=0;sim.p.rays=true;const p=spot(sim);
   return {v:missOf(sim,p),p,key:keyOf(sim),pc:pct(sim,p),al:lowAlt(sim,p),label:`the ${sim.p.mode==='orbit'?'near':'other'} focus, ${num(sim,Cf(sim))} ${u(sim)} ${t[0]<0?'left':'right'} of the center`};},
  how:{bio:'The math finds the foci: two points on the long axis, the same distance c from the center. Waves from one focus reflect to the other, and a planet sits at one focus of its orbit.',
   honors:'c² = a² − b², so c = √(a² − b²). For the room, a = 15 m and b = 12 m give c = √(225 − 144) = 9 m when e = 0.6.',
   ap:'c = √(a² − b²) = ae. The reflection property comes from the equal-angle law at the wall: the normal bisects the angle between the lines to the two foci.'},
  compare(sim,g,m){const md=sim.p.mode,un=u(sim);
   if(g.v<(md==='orbit'?600:M_(sim).r))return md==='orbit'?`Your gut was right on: you put the planet within ${num(sim,g.v)} km of the focus. You read the satellite’s speed-up correctly, which is Kepler’s second law at work.`:`Your gut was right on: your spot already catches ${fmtNum(g.pc,0)}% of the reflected ${M_(sim).thing}. The math names that spot: the second focus.`;
   if(md==='orbit'){const ga=g.al,ta=m.al;if(Math.abs(ga-ta)<100)return `You found a focus, but the wrong one: your planet is ${num(sim,g.v)} km from Earth’s real center. The satellite speeds up at the left end, so Earth sits at the left focus. With your spot, mission control would expect the lowest point on the <b>wrong side of the orbit</b>, ${num(sim,g.v)} km from where it really happens.`;return `You placed the planet ${num(sim,g.v)} km from where it really is. Planning with your spot, mission control would predict the satellite’s lowest point at ${ga<0?'<b>below the ground</b>':'<b>'+Math.round(ga).toLocaleString('en-US')+' km up</b>'}; it is really ${Math.round(ta).toLocaleString('en-US')} km up. That is <b>${Math.round(Math.abs(ga-ta)).toLocaleString('en-US')} km off</b> at the most important point of the orbit.`;}
   return `Your spot was ${num(sim,g.v)} ${un} from the focus and caught <b>${fmtNum(g.pc,0)}%</b> of the reflected ${M_(sim).thing}. At the focus, <b>${fmtNum(m.pc,0)}%</b> arrives${md==='litho'?' (every wave that hits the reflector)':''}: ${g.pc>0.5?'about <b>'+fmtNum(m.pc/g.pc,0)+' times as much</b>':'<b>all of it, instead of almost none</b>'}.${md==='litho'?' That is why the machine lines the stone up on the focus with X-rays or ultrasound.':''}`;},
  again(sim){const r=Math.random();sim.p.mode=r<0.4?'room':r<0.7?'litho':'orbit';sim.p.e=Math.round((0.3+Math.random()*0.45)*20)/20;sim.p.gx=0;sim.p.gy=0;sim.p.rays=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'In an elliptical room, a friend whispers at one focus. Where is the whisper loudest?',choices:['At the center of the room','At the other focus','Right next to the wall','Everywhere equally'],correct:1,explain:'Every path from one focus bounces off the wall and passes through the other focus, so the sound arrives there all at once. Turn on “Show the foci and wave paths” to see them meet.'},
  {lvl:'bio',instant:true,q:'A satellite orbits Earth on an ellipse. Where is Earth?',choices:['At the center of the ellipse','At one focus of the ellipse','On the ellipse itself','It moves around inside'],correct:1,explain:'Kepler’s first law: an orbit is an ellipse with the body it circles at one focus. So the satellite comes closer on one side than the other, and it moves fastest at that closest point.'},
  {lvl:'honors',instant:true,q:'An elliptical room is 30 m long and 24 m wide. How far from the center is each focus?',choices:['6 m','9 m','12 m','15 m'],correct:1,explain:'a = 15 m and b = 12 m. c = √(a² − b²) = √(225 − 144) = √81 = 9 m. Set e = 0.6 in Room mode to check.'},
  {lvl:'honors',instant:true,q:'Lower the eccentricity toward 0. What happens to the foci?',choices:['They move toward the ends','They move together toward the center','They stay put','They leave the ellipse'],correct:1,explain:'c = ae, so as e shrinks, c shrinks and both foci slide toward the center. At e = 0 they meet there and the ellipse is a circle, which focuses a wave from the center straight back to the center.'},
  {lvl:'ap',instant:true,q:'An orbit around Earth has a = 30,000 km and e = 0.6. Earth’s radius is 6,371 km. How high is the satellite at its lowest point?',choices:['5,629 km','12,000 km','17,629 km','23,629 km'],correct:0,explain:'The closest distance to Earth’s center is a(1 − e) = 30,000 × 0.4 = 12,000 km. Subtract the radius: 12,000 − 6,371 = 5,629 km. Putting Earth at the center instead would give b − 6,371 = 24,000 − 6,371 = 17,629 km: way off.'},
  {lvl:'ap',instant:true,q:'A shock wave reflector is half of an ellipse with a = 10 cm and b = 8 cm, and the spark is at one focus. How far from the spark must the stone be?',choices:['6 cm','10 cm','12 cm','16 cm'],correct:2,explain:'c = √(100 − 64) = 6 cm, so the foci are 2c = 12 cm apart. The stone must sit 12 cm from the spark, along the long axis.'}
 ],
 tour:[
  {title:'An elliptical room',text:'This room is an ellipse, 30 m long and 24 m wide. The singer stands at the purple spot. Where in the room should the mic go to catch the most sound?',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'room',e:0.6,gx:0,gy:0,rays:false})},
  {title:'Follow the sound',text:'Sound spreads out in every direction and bounces off the curved wall. Each blue line is one path. Watch where the bounced paths go.',pause:true,setup:sim=>BioLab.setValues(sim,{rays:true})},
  {title:'They all meet',text:'Every bounced path passes through one spot: the other focus. Put the mic there and all the bounced sound arrives at once. At the center of the room, only about 8% of it passes near the mic.',focus:sim=>[SXp(sim,Cf(sim))-50,CY-50,100,100],pause:true,setup:sim=>BioLab.setValues(sim,{rays:true,gx:60,gy:0})},
  {lvl:'honors',title:'Finding the foci',text:'The foci sit on the long axis, c from the center, where c² = a² − b². Here a = 15 m and b = 12 m, so c = √(225 − 144) = 9 m.',pause:true},
  {title:'Breaking kidney stones',text:'A kidney stone machine uses the same idea. A spark makes a shock wave at one focus of a bowl-shaped reflector. The patient is placed so the stone sits at the other focus, where the waves gather and break it.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'litho',e:0.6,rays:true,gx:60,gy:0})},
  {title:'Orbits are ellipses too',text:'A satellite moves on an ellipse, and Earth is not at the center: it sits at one focus. Watch the satellite speed up as it swings close to Earth and slow down far away.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'orbit',e:0.6,rays:true,gx:-60,gy:0})},
  {lvl:'ap',title:'Closest and farthest',text:'With e = c/a, the satellite comes as close as a(1 − e) = 12,000 km from Earth’s center and goes as far as a(1 + e) = 48,000 km. Its lowest altitude is 12,000 − 6,371 = 5,629 km.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much of the bounced sound reaches your mic at different spots?</p><ol><li>In Room mode, put your spot at the center and record a trial.</li><li>Move it to five other spots, including one right next to the wall, and record each.</li><li>Find the spot where the reading is highest.</li></ol><p>Write one sentence: where is the best spot, and why?</p>',
  honors:'<p><b>Question:</b> How does the shape change where the focus is?</p><ol><li>For e = 0.3, 0.45, 0.6 and 0.75, find the spot that catches the most sound.</li><li>Record its % to the right (gx) each time.</li><li>Compare gx with 100·e.</li></ol><p>Explain the match using c = ae.</p>',
  ap:'<p><b>Question:</b> How does eccentricity change a satellite’s lowest and highest points?</p><ol><li>In Orbit mode, for four values of e, place the planet at the focus and record the lowest altitude.</li><li>Compute a(1 − e) − 6,371 and a(1 + e) − 6,371 for each.</li></ol><p><b>CER:</b> Claim about how e affects the orbit, evidence from your table, and reasoning from c = ae.</p>'},
 terms:[
  {t:'Ellipse',d:'An oval where the sum of the distances to two fixed points (the foci) is the same for every point on the curve.'},
  {t:'Focus (plural: foci)',d:'One of the two special points inside an ellipse. A wave from one focus reflects off the ellipse to the other.'},
  {t:'Semi-major and semi-minor axes',d:'a is half the long axis; b is half the short axis.',lvl:'honors'},
  {t:'c² = a² − b²',d:'Locates the foci: each is c from the center along the long axis.',lvl:'honors'},
  {t:'Eccentricity',d:'e = c/a. It measures how stretched the ellipse is: 0 is a circle, close to 1 is long and thin.',lvl:'ap'},
  {t:'Kepler’s first law',d:'A planet or satellite moves on an ellipse with the body it orbits at one focus.',lvl:'ap'}
 ],
 about:'<p>The ellipse is x²/a² + y²/b² = 1 with b = a√(1 − e²) and foci at (±c, 0), c = ae. For the room and the machine, 720 rays leave the left focus and reflect once off the wall (angle in equals angle out). The reading counts the share of all rays that pass within 0.5 m of your spot (the room) or 0.4 cm (the stone). Only the left half of the machine’s ellipse is a reflector, so rays that miss it do not count. This is a flat, two-dimensional picture: real rooms and reflectors are three-dimensional, sound also reaches you directly and by other bounces, and real lithotripsy needs careful aiming, imaging and medical judgment.</p><p>The orbit has a = 30,000 km around Earth (radius 6,371 km). The satellite’s motion follows Kepler’s second law (Kepler’s equation). “Lowest point” is the closest the orbit comes to your spot, minus Earth’s radius. Sizes are illustrative, not a specific real machine, room or satellite.</p>'
};
BioLab.register(SIM);
})();
