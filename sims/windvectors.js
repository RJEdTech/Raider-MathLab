(function(){
'use strict';
const {clamp,txt,pill,PAL,atLeast,fmtNum,axes,RM}=BioLab.h;
/* Each craft: its own speed A (km/h through the air or water) and trip length D (km). The course always points straight up (north). */
const CRAFT={
 drone:{l:'Club drone',A:54,D:0.6,thing:'drone',medium:'wind',speedWord:'airspeed',dest:'the landing pad'},
 plane:{l:'Small plane',A:200,D:150,thing:'plane',medium:'wind',speedWord:'airspeed',dest:'the airport'},
 boat:{l:'River ferry',A:18,D:1.5,thing:'ferry',medium:'current',speedWord:'speed through the water',dest:'the far dock'}};
const BATT_MIN=30,FUEL_LPH=32;   /* assumptions: a drone battery lasts 30 min of flying; a small plane burns 32 L of fuel an hour */
/* The drone's test course runs up the middle of a park 200 m wide, with a street along each side and houses beyond. */
const PARK=0.1,STREET=0.02;
const spot=km=>{const m=Math.abs(km)*1000;return m<5?'right over the pad':m<30?'close, but off the pad':m<PARK*1000?'still over the park, but well off the pad':m<(PARK+STREET)*1000?'over the street at the edge of the park':'past the street, over the yards beyond the park';};
const secs=min=>fmtNum(min*60,0)+' s';
const dur=(sim,min)=>sim.p.craft==='drone'?secs(min):fmtNum(min,1)+' min';
const DEG=Math.PI/180;
const C_=sim=>CRAFT[sim.p.craft];
const wdir=sim=>sim.p.craft==='boat'?270:sim.p.wdir;   /* a river current runs along the banks: from the west, toward the east */
const wspd=sim=>C_(sim).A*sim.p.wpct/100;
/* wind (or current) vector, in km/h: x east, y north. It blows toward wdir + 180°. */
const W=sim=>{const w=wspd(sim),f=wdir(sim)*DEG;return [-w*Math.sin(f),-w*Math.cos(f)];};
/* Correct heading: sin(WCA) = −(crosswind toward the right) / A. Negative means turn left. */
const wca=sim=>Math.asin(clamp(-W(sim)[0]/C_(sim).A,-1,1))/DEG;
function legSpeed(A,w,u){const along=w[0]*u[0]+w[1]*u[1],cross=w[0]*u[1]-w[1]*u[0];return along+Math.sqrt(Math.max(0,A*A-cross*cross));}
/* Fly heading h until level with the target, then turn straight for the target. */
function trip(sim,h){const C=C_(sim),w=W(sim),A=C.A,vx=A*Math.sin(h*DEG)+w[0],vy=A*Math.cos(h*DEG)+w[1];
 const t1=C.D/vy,miss=vx*t1;let t2=0;if(Math.abs(miss)>1e-9)t2=Math.abs(miss)/legSpeed(A,w,[-Math.sign(miss),0]);
 return {t1,t2,miss,min:(t1+t2)*60,vx,vy};}
const best=sim=>trip(sim,wca(sim));
const gsBest=sim=>C_(sim).A*Math.cos(wca(sim)*DEG)+W(sim)[1];
const dir8=d=>['north','northeast','east','southeast','south','southwest','west','northwest'][Math.round(((d%360)+360)%360/45)%8];
const sideWord=h=>Math.abs(h)<0.5?'straight at the target':(fmtNum(Math.abs(h),1)+'° '+(h<0?'left':'right'));
const cost=(sim,min)=>{const k=sim.p.craft;return k==='drone'?fmtNum(min/BATT_MIN*100,0)+'% of the battery':k==='plane'?fmtNum(min/60*FUEL_LPH,0)+' L of fuel':fmtNum(min,1)+' min of engine time';};
const distTxt=(sim,km)=>sim.p.craft!=='plane'?fmtNum(Math.abs(km)*1000,0)+' m':fmtNum(Math.abs(km),Math.abs(km)<10?2:0)+' km';
const keyOf=sim=>[sim.p.craft,sim.p.wpct,wdir(sim)].join('|');
const gutG=sim=>{const G=sim.gutS;return G&&G.g&&G.g.key===keyOf(sim)?G.g:null;};
const solved=sim=>{const G=sim.gutS;return !!(G&&G.m&&G.m.key===keyOf(sim));};
/* Guided, before the gut is locked: show the heading but not where it leads, so the answer stays the student's call. */
const pre=sim=>sim.mode==='guided'&&!(sim.gutS&&sim.gutS.g);
const clearGut=sim=>{if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}};

/* map: start at the bottom center, target straight up */
const SX=400,SY=400,TY=60,SC=(SY-TY);
const MX=(sim,x)=>SX+x/C_(sim).D*SC,MY=(sim,y)=>SY-y/C_(sim).D*SC;
function craftIcon(ctx,kind,x,y,h,col,s){ctx.save();ctx.translate(x,y);ctx.rotate(h*DEG);ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=2;
 if(kind==='drone'){ctx.fillRect(-5*s,-5*s,10*s,10*s);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(a*10*s,b*10*s);ctx.stroke();ctx.beginPath();ctx.arc(a*10*s,b*10*s,4.5*s,0,7);ctx.stroke();});ctx.beginPath();ctx.moveTo(0,-13*s);ctx.lineTo(-4*s,-7*s);ctx.lineTo(4*s,-7*s);ctx.closePath();ctx.fill();}
 else if(kind==='plane'){ctx.beginPath();ctx.moveTo(0,-14*s);ctx.lineTo(2.5*s,-8*s);ctx.lineTo(2.5*s,8*s);ctx.lineTo(0,12*s);ctx.lineTo(-2.5*s,8*s);ctx.lineTo(-2.5*s,-8*s);ctx.closePath();ctx.fill();ctx.fillRect(-14*s,-4*s,28*s,4*s);ctx.fillRect(-6*s,7*s,12*s,3*s);}
 else{ctx.beginPath();ctx.moveTo(0,-14*s);ctx.quadraticCurveTo(7*s,-4*s,6*s,11*s);ctx.lineTo(-6*s,11*s);ctx.quadraticCurveTo(-7*s,-4*s,0,-14*s);ctx.closePath();ctx.fill();}
 ctx.restore();}
function arrow(ctx,x0,y0,x1,y1,col,w){const a=Math.atan2(y1-y0,x1-x0),h=10,L=Math.hypot(x1-x0,y1-y0);if(L<2)return;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w||3;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1-h*0.7*Math.cos(a),y1-h*0.7*Math.sin(a));ctx.stroke();
 ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-h*Math.cos(a-0.45),y1-h*Math.sin(a-0.45));ctx.lineTo(x1-h*Math.cos(a+0.45),y1-h*Math.sin(a+0.45));ctx.closePath();ctx.fill();}
/* where the craft is, a fraction f of the way through the gut-style trip */
function pathPos(sim,h,f){const T=trip(sim,h),tt=T.t1+T.t2,t=f*tt;
 if(t<=T.t1)return [MX(sim,T.vx*t),MY(sim,T.vy*t),h];
 const g=(t-T.t1)/T.t2,x=T.miss*(1-g);const w=W(sim),u=[-Math.sign(T.miss),0],A=C_(sim).A;
 /* heading on the way back: aim so the ground track runs along u */
 const cross=w[0]*u[1]-w[1]*u[0],ang=Math.atan2(u[0],u[1])/DEG+Math.asin(clamp(cross/A,-1,1))/DEG;return [MX(sim,x),MY(sim,C_(sim).D),ang];}

const SIM={
 id:'windvectors',hash:'windvectors',apUnit:11,order:3,tab:'Flying in a crosswind',kind:'Go further',
 card:'Pick a heading by eye to beat a crosswind, then let vector components find the angle that lands right on target.',
 title:'Flying through a crosswind',
 lede:{bio:'Point a drone straight at its landing pad in a crosswind and the wind carries it sideways the whole way. To fly a straight line you have to aim a little into the wind. How much? Vectors tell you exactly.',
  honors:'Your motion over the ground is your own velocity plus the wind’s: ground = air + wind. Aim so the sideways parts cancel, and the leftover points straight at the target.',
  ap:'With the course straight ahead, the wind correction angle satisfies sin(WCA) = (crosswind component) / airspeed, and the ground speed is airspeed·cos(WCA) minus the headwind component.'},
 scale:{bio:'Seen from above. The target is straight up the map from the start.',honors:'Seen from above, with north up. The target is due north of the start.'},
 aspect:16/9,timeless:true,animated:true,trials:true,graph:true,
 controlsTitle:'The trip',
 controls:[
  {id:'craft',label:'What is traveling',type:'seg',def:'drone',onChange:clearGut,options:[{v:'drone',l:'Drone'},{v:'plane',l:'Small plane'},{v:'boat',l:'River ferry'}],help:'Drone: 54 km/h, 600 m across a park, kept in sight. Plane: 200 km/h (about 108 knots), 150 km trip. Ferry: 18 km/h across a 1.5 km river.'},
  {id:'wpct',label:'Wind or current strength, as a % of your own speed',type:'range',min:0,max:40,step:5,def:30,unit:'%',noGut:true,onChange:clearGut},
  {id:'wdir',label:'Wind comes from (compass direction)',type:'range',min:0,max:355,step:5,def:270,unit:'°',lvl:'honors',noGut:true,onChange:clearGut,help:'270° is a wind from the west, blowing east. A river current always runs along the banks, so the ferry ignores this.'},
  {id:'hdg',label:'Your heading: degrees left (−) or right (+) of the target',type:'range',min:-45,max:45,step:1,def:0,unit:'°',help:'Where the nose points. 0° points straight at the target.'}
 ],
 onLevel(sim){const b=!atLeast('honors'),w=sim.ui.ctlW&&sim.ui.ctlW.hdg;if(!w)return;const L=w.querySelector('label');if(L)L.textContent=b?'Where you point the nose':'Your heading: degrees left (−) or right (+) of the target';
  const H=w.querySelector('.help');if(H)H.textContent=b?'0° points straight at the target. Minus turns the nose left, plus turns it right. Or click the map.':'Where the nose points. 0° points straight at the target.';},
 init(){return {};},step(){},
 metrics:[
  {id:'miss',label:'Your heading misses the target by',unit:'km',d:2,min:0,max:null,get:sim=>Math.abs(trip(sim,sim.p.hdg).miss)},
  {id:'time',label:'Trip time with your heading',unit:'min',d:2,min:0,max:null,get:sim=>trip(sim,sim.p.hdg).min},
  {id:'tbest',label:'Trip time with the right heading',unit:'min',d:2,lvl:'honors',min:0,max:null,get:sim=>best(sim).min},
  {id:'wca',label:'Wind correction angle (− = left)',unit:'°',d:1,lvl:'honors',min:-30,max:30,get:wca},
  {id:'cross',label:'Crosswind component (+ = pushes right)',unit:'km/h',d:1,lvl:'ap',min:-80,max:80,get:sim=>W(sim)[0]},
  {id:'gs',label:'Ground speed on the right heading',unit:'km/h',d:1,lvl:'ap',min:0,max:null,get:gsBest},
  {id:'cost',label:'What your heading costs',text:true,get:sim=>{const T=trip(sim,sim.p.hdg);return cost(sim,T.min)+(sim.p.craft==='drone'?(Math.abs(T.miss)<0.005?', reaching the pad on course':', reaching the end of the park '+distTxt(sim,T.miss)+(T.miss>=0?' right':' left')+' of the pad'):'')+(sim.p.craft==='boat'?(Math.abs(T.miss)<0.0005?', landing right at the dock':', landing '+distTxt(sim,T.miss)+(T.miss>=0?' downstream':' upstream')):'');}}
 ],
 graphs:[{id:'curve',label:'Trip time vs. heading',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const tb=best(sim).min;let top=tb;for(let h=-45;h<=45;h++)top=Math.max(top,trip(sim,h).min);
  const ax=axes(ctx,box,{xmin:-45,xmax:45,ymin:Math.floor(tb*0.9),ymax:top*1.05,xl:'Heading: degrees left (−) or right (+) of the target',yl:'Trip time (min)'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let h=-45;h<=45;h+=0.5){const p=[ax.X(h),ax.Y(trip(sim,h).min)];h>-45?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();
  const dot=(h,col,lab,up)=>{const v=trip(sim,h).min;ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(h),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,clamp(ax.X(h),box.L+30,box.L+box.W-30),ax.Y(v)+(up?-12:20),{s:12,w:700,c:col,a:'center'});};
  const GG=gutG(sim);if(GG)dot(GG.h,PAL['s4'],'Your gut',true);
  if(atLeast('honors')||solved(sim))dot(wca(sim),PAL['s3'],'Best',false);
  dot(sim.p.hdg,PAL['rj'],'You',!(GG&&Math.abs(GG.h-sim.p.hdg)<6));},
 draw(sim,ctx,vdt,k){const C=C_(sim),fs=12*k,w=W(sim),boat=sim.p.craft==='boat',G=sim.gutS,GG=gutG(sim),sol=solved(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(boat){ctx.fillStyle=PAL['cv-water'];ctx.fillRect(0,TY,800,SY-TY);ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(0,0,800,TY);ctx.fillRect(0,SY,800,50);}
  else{ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.5;for(let x=0;x<=800;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,450);ctx.stroke();}for(let y=10;y<=450;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(800,y);ctx.stroke();}ctx.globalAlpha=1;}
  if(sim.p.craft==='drone'){/* the park, a street on each side, and houses beyond */
   const p0=MX(sim,-PARK),p1=MX(sim,PARK),sw=MX(sim,PARK+STREET)-p1;ctx.fillStyle=PAL['cv-leaf'];ctx.globalAlpha=.22;ctx.fillRect(p0,0,p1-p0,450);ctx.globalAlpha=1;
   [p0-sw,p1].forEach(x=>{ctx.fillStyle=PAL['cv-bench'];ctx.globalAlpha=.85;ctx.fillRect(x,0,sw,450);ctx.globalAlpha=1;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(x+sw/2,0);ctx.lineTo(x+sw/2,450);ctx.stroke();ctx.setLineDash([]);
   });
   /* two rows of houses behind each street */
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.fillStyle=PAL['cv-bg2'];ctx.globalAlpha=.8;for(let y=100;y<380;y+=70)[p1+sw+12,p1+sw+62].forEach(x=>{[x,2*SX-x-34].forEach(hx=>{ctx.fillRect(hx,y,34,26);ctx.strokeRect(hx,y,34,26);});});ctx.globalAlpha=1;
   txt(ctx,'Park',SX-12,SY+30,{s:fs,w:700,c:PAL['cv-soft'],a:'right'});txt(ctx,'Street',p1+sw+6,SY+30,{s:fs,w:700,c:PAL['cv-soft']});}
  /* wind streaks drifting with the wind */
  const V=sim.vis;V.ph=(V.ph||0)+(RM?0:vdt);const ws=Math.hypot(w[0],w[1]);
  if(ws>0.01){const ux=w[0]/ws,uy=-w[1]/ws;ctx.strokeStyle=boat?PAL['cv-sub']:PAL['cv-soft'];ctx.globalAlpha=.35;ctx.lineWidth=2;
   for(let i=0;i<34;i++){const sx=(i*137.5)%840-20,sy=(i*71.3)%460-5,off=((V.ph*60*sim.p.wpct/30)+i*23)%100;const x=((sx+ux*off)%840+840)%840-20,y=((sy+uy*off)%460+460)%460-5;
    if(boat&&(y<TY||y>SY))continue;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+ux*18,y+uy*18);ctx.stroke();}ctx.globalAlpha=1;}
  /* start and target */
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,6]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(SX,SY);ctx.lineTo(SX,TY);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(SX,TY,9,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
  {const gh=gutG(sim),lf=!pre(sim)&&trip(sim,gh?gh.h:sim.p.hdg).miss>0.0005*C.D;txt(ctx,boat?'Far dock':sim.p.craft==='drone'?'Landing pad':'Target',SX+(lf?-16:16),TY-2,{s:fs,w:700,c:PAL['cv-ink'],b:'middle',a:lf?'right':'left'});}
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(SX,SY,6,0,7);ctx.fill();txt(ctx,boat?'Dock':'Start',SX+14,SY+2,{s:fs,w:700,c:PAL['cv-ink'],b:'middle'});
  /* the track for the current heading, clipped to the map */
  const drawTrack=(h,col,dash,lw)=>{const T=trip(sim,h),p1=[MX(sim,T.miss),TY];ctx.save();ctx.beginPath();ctx.rect(0,0,800,450);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=lw||3;ctx.setLineDash(dash||[]);
   ctx.beginPath();ctx.moveTo(SX,SY);ctx.lineTo(p1[0],p1[1]);ctx.stroke();ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(SX,TY);ctx.stroke();ctx.setLineDash([]);ctx.restore();return {T,p1};};
  const showHdg=GG?GG.h:sim.p.hdg;
  if(pre(sim)){const nl2=150,hx=SX+nl2*Math.sin(sim.p.hdg*DEG),hy=SY-nl2*Math.cos(sim.p.hdg*DEG);arrow(ctx,SX,SY,hx,hy,PAL['s2'],3);txt(ctx,'Nose points here',hx+(sim.p.hdg<0?-8:8),hy-6,{s:fs,w:700,c:PAL['s2'],a:sim.p.hdg<0?'right':'left'});
   craftIcon(ctx,sim.p.craft,SX,SY,sim.p.hdg,PAL['rj'],1.05);txt(ctx,'Lock in your heading to see where it goes.',SX+20,(SY+TY)/2-30,{s:fs,w:700,c:PAL['cv-soft']});}
  else{
  if(GG&&Math.abs(GG.h-sim.p.hdg)>0.5)drawTrack(GG.h,PAL['s4'],[8,5],2.5);
  const cur=drawTrack(sim.p.hdg,GG&&Math.abs(GG.h-sim.p.hdg)<=0.5?PAL['s4']:PAL['rj'],[],3);
  /* miss label */
  if(Math.abs(cur.T.miss)/C.D*SC>14){const x=clamp(cur.p1[0],70,730);const right=cur.p1[0]>SX;const lab=(cur.p1[0]<0||cur.p1[0]>800?'Off the map: ':'Misses by ')+distTxt(sim,cur.T.miss);
   ctx.font='700 '+fs+'px '+BioLab.h.FONT;const tw=ctx.measureText(lab).width;const lx=right?clamp(x-tw-6,SX+80,800-tw-8):clamp(x+6,8,SX-80-tw);txt(ctx,lab,lx,TY+22*k,{s:fs,w:700,c:PAL['rj']});}
  /* moving craft */
  const f=RM?0.55:((V.ph/5)%1);const p=pathPos(sim,sim.p.hdg,f);craftIcon(ctx,sim.p.craft,p[0],p[1],p[2],PAL['rj'],1.05);
  if(sol){const hb=wca(sim),Tb=best(sim),fb=RM?0.55:((V.ph/5*(cur.T.t1+cur.T.t2)/(Tb.t1)))%1;ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.setLineDash([12,6]);ctx.beginPath();ctx.moveTo(SX,SY);ctx.lineTo(SX,TY);ctx.stroke();ctx.setLineDash([]);
   craftIcon(ctx,sim.p.craft,SX,MY(sim,C.D*fb),hb,PAL['s3'],1.05);}
  }
  /* nose line from the start, so the heading is visible */
  const nl=70;ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(SX,SY);ctx.lineTo(SX+nl*Math.sin(sim.p.hdg*DEG),SY-nl*Math.cos(sim.p.hdg*DEG));ctx.stroke();ctx.setLineDash([]);
  /* wind label */
  const wl=boat?`Current: ${fmtNum(wspd(sim),1)} km/h, flowing east`:atLeast('honors')?`Wind: ${fmtNum(wspd(sim),0)} km/h from ${wdir(sim)}° (the ${dir8(wdir(sim))})`:`Wind: ${fmtNum(wspd(sim),0)} km/h from the ${dir8(wdir(sim))}${Math.abs(w[0])>0.01?', pushing '+(w[0]>0?'right':'left'):''}`;
  ctx.font='700 '+12*k+'px '+BioLab.h.FONT;const pw=ctx.measureText(wl).width+12*k*1.1;
  pill(ctx,wl,10+pw/2,boat?TY/2:18*k,PAL['card'],PAL['cv-ink'],12*k);
  /* vector triangle inset */
  if(atLeast('honors')||sol){const bx=10,bw=150+70*k,bh=130+50*k,by=450-bh-8;ctx.fillStyle=PAL['card'];ctx.globalAlpha=.94;ctx.fillRect(bx,by,bw,bh);ctx.globalAlpha=1;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(bx,by,bw,bh);
   const h=sim.p.hdg,s=(bh-30*k-24)/(1.15*C.A),o=[bx+bw*0.68,by+bh-14],a=[o[0]+C.A*Math.sin(h*DEG)*s,o[1]-C.A*Math.cos(h*DEG)*s],g=[a[0]+w[0]*s,a[1]-w[1]*s];
   arrow(ctx,o[0],o[1],a[0],a[1],PAL['s2'],3);arrow(ctx,a[0],a[1],g[0],g[1],PAL['s6'],3);arrow(ctx,o[0],o[1],g[0],g[1],PAL['rj'],3);
   txt(ctx,'Vectors',bx+8,by+15*k,{s:fs,w:700,c:PAL['cv-ink']});
   txt(ctx,'own',bx+8,by+bh-46*k,{s:fs,w:700,c:PAL['s2']});txt(ctx,boat?'current':'wind',bx+8,by+bh-30*k,{s:fs,w:700,c:PAL['s6']});txt(ctx,'= ground',bx+8,by+bh-14*k,{s:fs,w:700,c:PAL['rj']});}},
 onClick(sim,x,y){if(y>SY-10)return;const h=Math.atan2(x-SX,SY-y)/DEG;BioLab.setValues(sim,{hdg:Math.round(clamp(h,-45,45))});},
 narrate(sim){const C=C_(sim),T=trip(sim,sim.p.hdg),h=sim.p.hdg,a=wca(sim),med=C.medium;
  if(pre(sim))return `The ${med} pushes on the ${C.thing} the whole trip. The blue arrow shows where its nose points: ${sideWord(h)}. Lock in the heading you think gets there fastest.`;
  if(sim.p.wpct===0)return `No ${med}, so pointing straight at the target is right: ground velocity equals your own velocity.`;
  if(Math.abs(h-a)<0.6)return `<b>On track.</b> Pointing ${sideWord(h)} cancels the sideways push of the ${med}, so the ${C.thing} travels in a straight line and arrives in ${dur(sim,T.min)}.`;
  if(Math.abs(h)<0.5)return `Pointing straight at the target, the ${med} pushes the ${C.thing} sideways the whole way. It arrives level with the target <b>${distTxt(sim,T.miss)} off course</b>${sim.p.craft==='drone'?', '+spot(T.miss)+',':''} and needs ${sim.p.craft==='drone'?secs(T.t2*60):fmtNum(T.t2*60,1)+' more minutes'}${sim.p.craft==='drone'?' more':''} to get back.`;
  return `Pointing ${sideWord(h)}, the ${C.thing} ends up ${distTxt(sim,T.miss)} ${T.miss>0?'right':'left'} of the target. <b>${(T.miss>0)===(a<h)?'Turn more into the '+med:'You have turned too far into the '+med}.</b>`;},
 gut:{better:'lower',
  controls:['hdg'],
  ask:{bio:'Drag the slider here, or click the map, to point the nose. The blue arrow shows where it points. Pick the heading you think gets to the target fastest, then lock it in.',
   honors:'Before you look at the vector readouts: set your heading with the slider here, or click the map, by eye. Then lock it in.'},
  lock(sim){const h=sim.p.hdg,T=trip(sim,h);return {v:T.min,h,key:keyOf(sim),T,label:`${sideWord(h)}: ${dur(sim,T.min)}`};},
  solve(sim){const a=wca(sim);sim.p.hdg=a;const T=trip(sim,a);return {v:T.min,h:a,key:keyOf(sim),T,label:`${sideWord(a)}: ${dur(sim,T.min)}`};},
  how:{bio:'The math splits the wind into a sideways part and a front-to-back part, then turns the nose into the wind just enough that the craft’s own sideways speed cancels the wind’s.',
   honors:'Ground velocity = own velocity + wind. Choose the heading whose sideways component exactly cancels the crosswind; then the ground velocity points straight at the target.',
   ap:'Crosswind component c = (wind speed)·sin(angle between wind and course). sin(WCA) = c / airspeed, and ground speed = airspeed·cos(WCA) − headwind component.'},
  compare(sim,g,m){const C=C_(sim),extra=g.v-m.v,dr=sim.p.craft==='drone';
   if(extra<(dr?0.005:0.05))return `Your gut was right on: ${g.label}. You aimed into the ${C.medium} by just the right amount, which is exactly what the vector sum says.`;
   if(dr)return `Held on your heading, the drone reaches the end of the park <b>${distTxt(sim,g.T.miss)} ${g.T.miss>0?'right':'left'} of the landing pad</b>: ${spot(g.T.miss)}. Flying back to the pad makes the trip ${secs(g.v)}. The math heading flies a straight line up the park to the pad in ${secs(m.v)}: <b>${secs(extra)} (${Math.round(extra/m.v*100)}%) faster</b>, and about ${fmtNum(extra/BATT_MIN*100,1)}% of a battery saved.`;
   const res=sim.p.craft==='drone'?` and <b>${fmtNum(extra/BATT_MIN*100,1)}% of a battery</b>`:sim.p.craft==='plane'?` and <b>${fmtNum(extra/60*FUEL_LPH,1)} liters of fuel</b>`:'';
   return `Your heading arrives level with ${C.dest} <b>${distTxt(sim,g.T.miss)} off target</b>${sim.p.craft==='boat'?(g.T.miss>0?' downstream':' upstream'):''}, so the trip takes ${fmtNum(g.v,1)} min. The math heading flies a straight line in ${fmtNum(m.v,1)} min. That is <b>${fmtNum(extra,1)} min (${Math.round(extra/m.v*100)}%)</b>${res} saved.`;},
  again(sim){const r=Math.random();sim.p.craft=r<0.4?'drone':r<0.7?'plane':'boat';sim.p.wpct=15+5*Math.floor(Math.random()*6);sim.p.wdir=atLeast('honors')?5*Math.floor(Math.random()*72):[240,250,260,270,280,290,300,90,100,110,120][Math.floor(Math.random()*11)];sim.p.hdg=0;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A drone points its nose straight at the landing pad while a wind blows from the west (from the left). What happens?',choices:['It flies straight to the pad, just slower','It drifts east and ends up to the right of the pad','It drifts west, into the wind'],correct:1,explain:'The wind adds an eastward velocity the whole trip. With the default settings (54 km/h drone, 16.2 km/h wind, 600 m course) it reaches the end of the park 180 m east of the pad, past the street, and needs about 17 more seconds to fly back against the wind.'},
  {lvl:'bio',instant:true,q:'To fly a straight line to the target with a wind from the left, which way should the nose point?',choices:['Straight at the target','A little to the left, into the wind','A little to the right, with the wind'],correct:1,explain:'Aiming into the wind gives the drone a leftward velocity of its own that cancels the wind’s push to the right. With a 30% crosswind, the right angle is about 17.5° left.'},
  {lvl:'honors',instant:true,q:'The wind gets twice as strong (still straight across). What happens to the correction angle?',choices:['It exactly doubles','It more than doubles','It less than doubles','It stays the same'],correct:1,explain:'sin(WCA) = crosswind / airspeed, and arcsine curves upward. For the drone, a 15% crosswind needs 8.6°, while 30% needs 17.5°: slightly more than double. At small angles it is close to doubling.'},
  {lvl:'honors',instant:true,q:'With the right heading in a pure crosswind, is the drone’s speed over the ground faster, slower or the same as its airspeed?',choices:['Faster','Slower','The same'],correct:1,explain:'Part of the drone’s own velocity goes into fighting the crosswind, so only airspeed × cos(WCA) is left to move it forward. With 54 km/h and a 30% crosswind: 54 × cos 17.5° ≈ 51.5 km/h.'},
  {lvl:'ap',instant:true,q:'A plane flies at 200 km/h toward the north. The wind is 40 km/h from 300°. To the nearest degree, what is the wind correction angle?',choices:['10° left','12° left','10° right','12° right'],correct:0,explain:'The wind blows toward 120°, so its east component is 40 sin 120° ≈ 34.6 km/h (pushing right). sin(WCA) = 34.6 / 200 = 0.173, so WCA ≈ 10.0°. Turn left, into the wind.'},
  {lvl:'ap',instant:true,q:'Same plane and wind (200 km/h, wind 40 km/h from 300°). On the right heading, about what is its ground speed?',choices:['About 177 km/h','About 197 km/h','About 217 km/h','About 160 km/h'],correct:0,explain:'The wind’s north component is 40 cos 120° = −20 km/h: a 20 km/h headwind. Ground speed = 200 cos 10.0° − 20 ≈ 197.0 − 20 ≈ 177 km/h.'}
 ],
 tour:[
  {title:'The trip',text:'Your club’s drone starts at the bottom of the park and must reach the landing pad 600 m away at the top. A 16.2 km/h wind blows from the west, which is from the left on this map.',focus:[[SX-60,TY-30,120,SY-TY+60]],pause:true,setup:sim=>BioLab.setValues(sim,{craft:'drone',wpct:30,wdir:270,hdg:0})},
  {title:'Point straight at it',text:'With the nose pointed straight at the pad, the wind pushes the drone sideways the whole way. It reaches the end of the park 180 m east of the pad, past the street and over the yards, and has to fly back into the wind.',pause:true,setup:sim=>BioLab.setValues(sim,{hdg:0})},
  {title:'Vectors add',text:'The drone’s motion over the ground is its own velocity (blue) plus the wind (teal). Head to tail, they add up to the red ground velocity. Right now that red arrow leans right.',focus:[[12,272,220,170]],pause:true,setup:sim=>BioLab.setValues(sim,{hdg:0})},
  {title:'Too much',text:'Turn 35° left and the drone overcorrects: now it ends up left of the target.',pause:true,setup:sim=>BioLab.setValues(sim,{hdg:-35})},
  {title:'Just right',text:'At about 17.5° left, the drone’s own sideways speed cancels the wind exactly. The red ground arrow points straight at the pad, and the trip takes 42 seconds instead of 57.',pause:true,setup:sim=>BioLab.setValues(sim,{hdg:-17.46})},
  {lvl:'honors',title:'The correction angle',text:'The drone must make 16.2 km/h of sideways speed out of its 54 km/h airspeed: sin(WCA) = 16.2 / 54 = 0.3, so WCA = 17.5°.',pause:true},
  {title:'Same math on water',text:'A ferry crossing a river is the same problem: the current is the wind. Aim upstream so you land at the dock across the river, not downstream of it.',pause:true,setup:sim=>BioLab.setValues(sim,{craft:'boat',wpct:30,hdg:-17.46})}
 ],
 lab:{bio:'<p><b>Question:</b> How does a stronger wind change the best heading?</p><ol><li>Set the wind strength to 10%. Find the heading that makes the miss distance 0 and record a trial.</li><li>Repeat at 20%, 30% and 40%.</li><li>Graph <b>Trials</b>: wind strength on x, your heading on y.</li></ol><p>Write one sentence: how does the angle grow as the wind grows?</p>',
  honors:'<p><b>Question:</b> Which wind directions need the biggest correction?</p><ol><li>Keep the wind at 30%. Set it to come from 270°, 300°, 330° and 0°.</li><li>For each, record the wind correction angle and the trip time with the right heading.</li></ol><p>Explain why a headwind costs time but needs no correction.</p>',
  ap:'<p><b>Question:</b> Check sin(WCA) = crosswind / airspeed.</p><ol><li>For four wind directions, record the crosswind component and the wind correction angle.</li><li>Compute arcsin(crosswind / airspeed) by hand and compare.</li><li>Use the components to predict the ground speed and check it.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the vector triangle.</p>'},
 terms:[
  {t:'Vector',d:'A quantity with a size and a direction, drawn as an arrow. Velocity is a vector.'},
  {t:'Heading',d:'The direction the nose points. In a crosswind it is not the direction you actually travel.'},
  {t:'Ground velocity',d:'Your actual motion over the ground: your own velocity plus the wind’s (or current’s).',lvl:'honors'},
  {t:'Components',d:'The parts of a vector along two perpendicular directions, here sideways and straight ahead.',lvl:'honors'},
  {t:'Wind correction angle (WCA)',d:'How far to turn into the wind so the track goes straight to the target: sin(WCA) = crosswind / airspeed.',lvl:'ap'}
 ],
 about:'<p>Ground velocity = own velocity + wind (or current), with the wind steady over the whole trip. “Your heading” is held until the craft is level with the target; then it turns and flies straight to the target, correcting for the wind on that leg. The math heading uses sin(WCA) = (crosswind component) / (own speed), which flies a straight line. With a steady wind, that straight line is the fastest possible route.</p><p>Speeds and distances are illustrative: drone 54 km/h over a 600 m course up the middle of a park 200 m wide, with a street along each side, small plane 200 km/h over 150 km, ferry 18 km/h across a 1.5 km river. Battery and fuel figures assume a drone battery lasts 30 minutes of flying and a small plane burns 32 liters of fuel an hour. These are assumptions for illustration. Real flights also deal with gusts, wind that changes with height, and climbing and descending.</p>'
};
BioLab.register(SIM);
})();
