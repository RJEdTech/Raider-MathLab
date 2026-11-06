(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* The inside of the bottle is the solid made by spinning its side profile r(x) around the center line.
   x = height from the inside bottom, in cm. Body: a quadratic through the bottom, middle and top radii.
   Then a 3 cm shoulder that narrows in a straight line to a 1.9 cm neck radius, and a 2 cm neck. 1 mL = 1 cm³. */
const RN=1.9,SH=3,NK=2;
const PRE={A:{R1:3.2,Rm:3.2,R2:3.2,H:20},B:{R1:3.7,Rm:4.3,R2:4.0,H:19}};
const Ltot=sim=>sim.p.H+SH+NK;
function rIn(p,x){const H=p.H;if(x<=H){const u=x/H;return p.R1*(1-u)*(1-2*u)+p.Rm*4*u*(1-u)+p.R2*u*(2*u-1);}if(x<=H+SH)return p.R2+(RN-p.R2)*(x-H)/SH;return RN;}
function bodyMax(p){let m=Math.max(p.R1,p.R2);const a=2*p.R1-4*p.Rm+2*p.R2,b=-3*p.R1+4*p.Rm-p.R2;if(Math.abs(a)>1e-12){const u=-b/(2*a);if(u>0&&u<1)m=Math.max(m,rIn(p,u*p.H));}return m;}
const Ro=sim=>bodyMax(sim.p)+sim.p.gap;
function rOut(sim,x){const p=sim.p,H=p.H,ro=Ro(sim);if(x<=H)return ro;if(x<=H+SH)return ro+(RN+p.gap-ro)*(x-H)/SH;return RN+p.gap;}
/* Gauss–Legendre, 5 points per piece: exact for these polynomial pieces. */
const GX=[-0.9061798459386640,-0.5384693101056831,0,0.5384693101056831,0.9061798459386640],GW=[0.2369268850561891,0.4786286704993665,0.5688888888888889,0.4786286704993665,0.2369268850561891];
function integ(f,a,b){let s=0;const m=(a+b)/2,h=(b-a)/2;for(let i=0;i<5;i++)s+=GW[i]*f(m+h*GX[i]);return s*h;}
function pieces(sim,f){const H=sim.p.H;return integ(f,0,H)+integ(f,H,H+SH)+integ(f,H+SH,H+SH+NK);}
const Vin=sim=>pieces(sim,x=>Math.PI*Math.pow(rIn(sim.p,x),2));
const Vout=sim=>pieces(sim,x=>Math.PI*Math.pow(rOut(sim,x),2));
const wallArea=sim=>pieces(sim,x=>rOut(sim,x)-rIn(sim.p,x));
function disks(sim){const n=sim.p.n,L=Ltot(sim),dx=L/n;let s=0;for(let i=0;i<n;i++)s+=Math.PI*Math.pow(rIn(sim.p,(i+.5)*dx),2)*dx;return s;}
/* exact body volume from the polynomial: r(x) = a0 + a1 x + a2 x² */
function bodyPoly(p){const H=p.H,a0=p.R1,a1=(-3*p.R1+4*p.Rm-p.R2)/H,a2=(2*p.R1-4*p.Rm+2*p.R2)/(H*H);
  return {a0,a1,a2,V:Math.PI*(a0*a0*H+a0*a1*H*H+(a1*a1+2*a0*a2)*H*H*H/3+a1*a2*Math.pow(H,4)/2+a2*a2*Math.pow(H,5)/5)};}
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
const ml=v=>Math.round(v).toLocaleString('en-US')+' mL';
const wallOn=sim=>atLeast('honors')&&sim.p.wall;
let quiet=false;
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function pickPreset(sim){const P=PRE[sim.p.bottle];if(P){quiet=true;try{BioLab.setValues(sim,P);}finally{quiet=false;}}clearGut(sim);}
function shaped(sim){if(quiet)return;const P=PRE[sim.p.bottle];if(P&&['H','R1','Rm','R2'].every(q=>Math.abs(sim.p[q]-P[q])<1e-9)){clearGut(sim);return;}if(sim.p.bottle!=='mine'){sim.p.bottle='mine';if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.bottle)sim.ui.ctl.bottle.set('mine');}clearGut(sim);}
function htxt(ctx,s,x,y,o){ctx.save();ctx.font=(o.w||400)+' '+(o.s||13)+'px '+BioLab.h.FONT;ctx.textAlign=o.a||'left';ctx.textBaseline=o.b||'alphabetic';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle=PAL['cv-bg'];ctx.strokeText(s,x,y);ctx.restore();txt(ctx,s,x,y,o);}

const SIM={
 id:'bottle',hash:'bottle',apUnit:17,order:4,tab:'How much does my bottle hold?',kind:'Simulation',
 card:'Guess how many mL a water bottle holds from its shape, then stack thin disks inside it until they give the exact volume.',
 title:'How much does my bottle hold?',
 lede:{bio:'A bottle is round in every slice. Cut it into thin coins (disks), find each one’s volume from its radius, and add them up. Thinner coins fit the curved sides better.',
  honors:'This is the disk method: each slice is a cylinder with volume πr²Δx. An insulated bottle has two walls, and the space between them is a washer: π(R² − r²)Δx per slice. Its side cross-section is the area between the two wall curves.',
  ap:'As the disks get thinner, the sum becomes the integral V = ∫ π r(x)² dx. With a polynomial profile you can find it exactly.'},
 scale:'Side view of the inside of the bottle, actual proportions. The ruler is in centimeters. 1 mL = 1 cm³.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The bottle',
 controls:[
  {id:'bottle',label:'Which bottle',type:'seg',def:'B',noGut:true,onChange:pickPreset,options:[{v:'A',l:'Bottle A (slim)'},{v:'B',l:'Bottle B (wide)'},{v:'mine',l:'My design'}]},
  {id:'guess',label:'Your gut: how much it holds',type:'range',min:0,max:2000,step:10,def:0,unit:' mL',help:'1,000 mL is 1 liter, a bit more than a quart.'},
  {id:'n',label:'Number of disks',type:'range',min:2,max:60,step:1,def:6,unit:'',noGut:true},
  {id:'H',label:'Body height (inside)',type:'range',min:12,max:28,step:0.5,def:19,unit:' cm',noGut:true,onChange:shaped,help:'The shoulder (3 cm) and neck (2 cm) sit on top of the body.'},
  {id:'R1',label:'Inside radius at the bottom',type:'range',min:2.5,max:5,step:0.1,def:3.7,unit:' cm',noGut:true,onChange:shaped},
  {id:'Rm',label:'Inside radius halfway up the body',type:'range',min:2.5,max:5,step:0.1,def:4.3,unit:' cm',noGut:true,onChange:shaped},
  {id:'R2',label:'Inside radius at the top of the body',type:'range',min:2.5,max:5,step:0.1,def:4.0,unit:' cm',noGut:true,onChange:shaped},
  {id:'wall',label:'Insulated double wall',type:'toggle',def:false,lvl:'honors',onChange:clearGut,help:'A straight outer wall around the inner bottle, with a gap (vacuum) between them.'},
  {id:'gap',label:'Extra width of the outer wall',type:'range',min:0.2,max:1,step:0.1,def:0.5,unit:' cm',lvl:'honors',noGut:true,onChange:clearGut,help:'How far the outer wall sits beyond the widest part of the inside.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the disks',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'disks',label:'Disks add up to',unit:'mL',d:0,min:0,max:null,get:sim=>shown(sim)?disks(sim):null},
  {id:'V',label:'Holds (exact)',unit:'mL',d:0,min:0,max:null,get:sim=>shown(sim)?Vin(sim):null},
  {id:'L',label:'Inside height',unit:'cm',d:1,min:0,max:null,get:Ltot},
  {id:'out',label:'Space inside the outer wall',unit:'mL',d:0,lvl:'honors',min:0,max:null,get:sim=>wallOn(sim)&&shown(sim)?Vout(sim):null},
  {id:'wallV',label:'The double wall takes up',unit:'mL',d:0,lvl:'honors',min:0,max:null,get:sim=>wallOn(sim)&&shown(sim)?Vout(sim)-Vin(sim):null},
  {id:'area',label:'Wall cross-section, one side',unit:'cm²',d:1,lvl:'honors',min:0,max:null,get:sim=>wallOn(sim)?wallArea(sim):null},
  {id:'body',label:'Body only: ∫₀ᴴ πr² dx',unit:'mL',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?bodyPoly(sim.p).V:null}
 ],
 graphs:[{id:'conv',label:'Disk total vs. number of disks',custom:true}],defaultGraph:'conv',
 plot(sim,ctx,box){const ns=[2,3,4,6,8,10,15,20,30,40,60],sv=sim.p.n;
  if(!shown(sim)){axes(ctx,box,{xmin:0,xmax:60,ymin:0,ymax:1,xl:'Number of disks',yl:'mL'});txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const v=Vin(sim),vals=ns.map(n=>{sim.p.n=n;return disks(sim);});sim.p.n=sv;
  const lo=Math.floor(Math.min(v,...vals)*0.97/50)*50,hi=Math.ceil(Math.max(v,...vals)*1.02/50)*50;
  const ax=axes(ctx,box,{xmin:0,xmax:60,ymin:lo,ymax:hi,xl:'Number of disks',yl:'mL'});
  ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(box.L,ax.Y(v));ctx.lineTo(box.L+box.W,ax.Y(v));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Exact: '+ml(v),box.L+box.W-6,ax.Y(v)-6,{s:12,w:700,c:PAL['s3'],a:'right'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2;ctx.beginPath();ns.forEach((n,i)=>{const x=ax.X(n),y=ax.Y(vals[i]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
  ns.forEach((n,i)=>{ctx.fillStyle=PAL['g-dot'];ctx.beginPath();ctx.arc(ax.X(n),ax.Y(vals[i]),4,0,7);ctx.fill();});
  const cur=disks(sim);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sv),ax.Y(cur),7,0,7);ctx.fill();},
 draw(sim,ctx,vdt,k){const p=sim.p,sh=shown(sim),G=sim.gutS,L=Ltot(sim),fs=12*k,W=wallOn(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* bottle, actual proportions: 10.5 px per cm */
  const S=10.5,cx=Math.round(150+40*Math.min(k,1.5)),yb=410,Yx=x=>yb-x*S;
  /* ruler */
  const rx=cx-82;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(rx,yb);ctx.lineTo(rx,Yx(35));ctx.stroke();
  for(let c=0;c<=35;c++){const y=Yx(c),big=c%5===0;ctx.beginPath();ctx.moveTo(rx,y);ctx.lineTo(rx-(big?10:5),y);ctx.stroke();if(big)txt(ctx,String(c),rx-14,y+4*k,{s:fs,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'cm',rx+6,Yx(35)+4*k,{s:fs,w:700,c:PAL['cv-soft']});
  const N=160,side=(f,sg)=>{for(let i=0;i<=N;i++){const x=i/N*L;ctx.lineTo(cx+sg*f(x)*S,Yx(x));}};
  /* outer wall */
  if(W){ctx.fillStyle=PAL['cv-glass'];ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-rOut(sim,0)*S,yb+5);side(x=>rOut(sim,x),-1);for(let i=N;i>=0;i--){const x=i/N*L;ctx.lineTo(cx+rOut(sim,x)*S,Yx(x));}ctx.lineTo(cx+rOut(sim,0)*S,yb+5);ctx.closePath();ctx.fill();ctx.stroke();}
  /* inside */
  ctx.fillStyle=PAL['cv-water'];ctx.beginPath();ctx.moveTo(cx-rIn(p,0)*S,yb);side(x=>rIn(p,x),-1);for(let i=N;i>=0;i--){const x=i/N*L;ctx.lineTo(cx+rIn(p,x)*S,Yx(x));}ctx.closePath();ctx.globalAlpha=W?1:.55;ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2.5;ctx.stroke();
  /* cap */
  ctx.fillStyle=PAL['cv-soft'];ctx.fillRect(cx-(RN+(W?p.gap:0)+0.4)*S,Yx(L)-16,(RN+(W?p.gap:0)+0.4)*2*S,16);
  /* disks */
  if(sh){const n=p.n,dx=L/n;for(let i=0;i<n;i++){const r=rIn(p,(i+.5)*dx),y0=Yx(i*dx),y1=Yx((i+1)*dx);ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.28;ctx.fillRect(cx-r*S,y1,2*r*S,y0-y1);ctx.globalAlpha=1;
    ctx.strokeStyle=PAL['s2'];ctx.lineWidth=n>30?0.8:1.5;ctx.strokeRect(cx-r*S,y1,2*r*S,y0-y1);
    if(n<=20){ctx.beginPath();ctx.ellipse(cx,y1,r*S,Math.min(4,(y0-y1)/3),0,0,7);ctx.stroke();}}}
  /* radius marker at the widest point */
  if(!sh||p.n>12){const xm=p.H/2,rm=rIn(p,xm);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,Yx(xm));ctx.lineTo(cx+rm*S,Yx(xm));ctx.stroke();htxt(ctx,'r = '+fmtNum(rm,1)+' cm',cx+4,Yx(xm)-6,{s:fs,w:700,c:PAL['rj']});}
  if(W)htxt(ctx,'Double wall',cx+(rOut(sim,p.H*0.3))*S+12,Yx(p.H*0.3),{s:fs,w:700,c:PAL['cv-soft']});
  /* right panel: cross-section area A(x) = πr² against height */
  const gx0=Math.round(400+20*Math.min(k,1.5)),gx1=780,gy0=60,gy1=Math.round(400-20*k),AM=Math.PI*36,HM=34;
  const GX=x=>gx0+x/HM*(gx1-gx0),GY=a=>gy1-a/AM*(gy1-gy0);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let a=0;a<=100;a+=25){const y=GY(a);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(gx0,y);ctx.lineTo(gx1,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(a),gx0-6,y+4*k,{s:fs,c:PAL['cv-soft'],a:'right'});}
  for(let x=0;x<=30;x+=10)txt(ctx,String(x),GX(x),gy1+16*k,{s:fs,c:PAL['cv-soft'],a:'center'});
  txt(ctx,'Height (cm)',(gx0+gx1)/2,gy1+34*k,{s:fs,w:700,c:PAL['cv-soft'],a:'center'});
  txt(ctx,'Area of each slice, πr² (cm²)',gx0,gy0-12,{s:fs,w:700,c:PAL['cv-soft']});
  if(sh){const n=p.n,dx=L/n;for(let i=0;i<n;i++){const a=Math.PI*Math.pow(rIn(p,(i+.5)*dx),2);ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.25;ctx.fillRect(GX(i*dx),GY(a),GX((i+1)*dx)-GX(i*dx),GY(0)-GY(a));ctx.globalAlpha=.9;ctx.strokeStyle=PAL['s2'];ctx.lineWidth=1;ctx.strokeRect(GX(i*dx),GY(a),GX((i+1)*dx)-GX(i*dx),GY(0)-GY(a));ctx.globalAlpha=1;}}
  if(W){ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();for(let i=0;i<=N;i++){const x=i/N*L,y=GY(Math.PI*Math.pow(rOut(sim,x),2));i?ctx.lineTo(GX(x),y):ctx.moveTo(GX(x),y);}ctx.stroke();ctx.setLineDash([]);htxt(ctx,'Outer wall: πR²',GX(1),GY(Math.PI*Math.pow(Ro(sim),2))-8,{s:fs,w:700,c:PAL['cv-soft']});}
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=N;i++){const x=i/N*L,y=GY(Math.PI*Math.pow(rIn(p,x),2));i?ctx.lineTo(GX(x),y):ctx.moveTo(GX(x),y);}ctx.stroke();
  ctx.strokeStyle=PAL['g-axis'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx0,gy0);ctx.lineTo(gx0,gy1);ctx.lineTo(gx1,gy1);ctx.stroke();
  /* totals */
  const gv=G&&G.g?G.g.ml:p.guess;
  htxt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+ml(gv),gx1,gy0+8*k,{s:13*Math.min(k,1.4),w:700,c:PAL['s4'],a:'right'});
  if(sh){const lab=p.n+' disks add up to '+ml(disks(sim));pill(ctx,lab,(gx0+gx1)/2,gy0+34*k,PAL['s2'],'#fff',13*Math.min(k,1.4));
   if(G&&G.m||sim.peek||atLeast('honors'))htxt(ctx,'Exact: '+ml(Vin(sim)),gx1,gy0+60*k,{s:13*Math.min(k,1.4),w:700,c:PAL['s3'],a:'right'});}
  else txt(ctx,'?',(gx0+gx1)/2,gy0+40*k,{s:28*k,w:700,c:PAL['s2'],a:'center'});},
 narrate(sim){const p=sim.p,n=p.n,L=Ltot(sim),dx=L/n;
  if(!shown(sim))return `This bottle is ${fmtNum(L,1)} cm tall inside and up to ${fmtNum(2*bodyMax(p),1)} cm across. <b>Every slice across it is a circle</b>, so a thin slice is a coin with volume π × radius² × thickness. Lock in your guess first.`;
  const d=disks(sim),v=Vin(sim);
  return `${n} disks, each ${fmtNum(dx,2)} cm thick, add up to ${ml(d)}: ${Math.abs(d-v)<1?'<b>essentially exact</b>':(d>v?'over':'under')+' by '+ml(Math.abs(d-v))}. <b>The exact volume is ${ml(v)}.</b>${wallOn(sim)?` The double wall takes another ${ml(Vout(sim)-v)} of the space you see from outside.`:''}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Look at the bottle and its ruler. Drag the slider here to how many milliliters (mL) you think it holds. (A liter is 1,000 mL.) Then lock it in.',honors:'Before any disks: drag the slider here to how many mL you think the inside holds, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-Vin(sim)),ml:g,label:ml(g)};},
  solve(sim){const v=Vin(sim);sim.p.n=60;sim.p.guess=clamp(Math.round(v/10)*10,0,2000);return {v:0,ml:v,label:ml(v)+' (exact)'};},
  how:{bio:'The math slices the bottle into thin coins. Each coin’s volume is the area of its circle (π × radius²) times its thickness. Adding the coins gives the volume, and thinner coins fit the curved sides better until the total stops changing.',
   honors:'Disk method: V ≈ Σ π r(xᵢ)² Δx. With a double wall, the space between walls is a stack of washers: Σ π(R² − r²) Δx.',
   ap:'V = ∫₀ᴸ π r(x)² dx, found exactly piece by piece: the body’s r(x) is a quadratic, so r² is a polynomial you can integrate term by term.'},
  compare(sim,g,m){const off=g.ml-m.ml,pct=Math.round(Math.abs(off)/m.ml*100),cups=Math.abs(off)/236.6;
   const w=wallOn(sim)?` From outside it looks like ${ml(Vout(sim))}, but the double wall takes ${ml(Vout(sim)-m.ml)} of that.`:'';
   if(Math.abs(off)<=30)return `Your gut was right on: within ${ml(Math.abs(off))} of the true ${ml(m.ml)}. Your eye for volume is good, and the disks show why it works.`+w;
   return `It holds <b>${ml(m.ml)}</b>. You were <b>${ml(Math.abs(off))} ${off>0?'over':'under'}</b> (${pct}%), about ${fmtNum(cups,1)} cup${Math.abs(cups-1)<0.05?'':'s'} of water.${m.ml<1000&&g.ml>=1000?' You would have counted on a full liter and come up short.':''}${w}`;},
  again(sim){sim.peek=false;const nb=sim.p.bottle==='A'?'B':'A';sim.p.bottle=nb;Object.assign(sim.p,PRE[nb]);sim.p.guess=0;sim.p.n=6;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'One thin disk in the bottle has a radius of 4 cm and is 1 cm thick. About how many mL is it?',choices:['About 13 mL','About 25 mL','About 50 mL','About 16 mL'],correct:2,explain:'Volume = π × 4² × 1 = 16π ≈ 50.3 cm³, and 1 cm³ = 1 mL. The area of the circle (π r²) is what matters, not the diameter.'},
  {lvl:'bio',instant:true,q:'Bottle B: 2 thick disks add up to 1,286 mL. What happens with 20 thin disks?',choices:['The total moves close to the true 1,138 mL','The total doubles','The total stays at 1,286 mL'],correct:0,explain:'Two thick disks miss the narrow shoulder and neck badly. 20 disks add up to 1,137 mL, within about 1 mL of the exact 1,138 mL.'},
  {lvl:'honors',instant:true,q:'Bottle B with a straight outer wall 0.5 cm beyond its widest point. Each slice of the wall space is a washer. Which gives its volume?',choices:['π(R − r)² Δx','π(R² − r²) Δx','2π(R − r) Δx','π R² Δx − r Δx'],correct:1,explain:'A washer is a big disk with a small disk removed: πR²Δx − πr²Δx = π(R² − r²)Δx. Note that π(R − r)² is much smaller, a common mistake.'},
  {lvl:'honors',instant:true,q:'Two bottles have the same outside size. One is a single wall; one has an insulated double wall. Which holds more?',choices:['The single wall','The double wall','They hold the same'],correct:0,explain:'The double wall’s gap takes up space you can see from outside but can’t fill. For bottle B with a 0.5 cm gap, the outer wall encloses 1,546 mL but the bottle holds 1,138 mL: the wall takes 408 mL.'},
  {lvl:'ap',instant:true,q:'A straight-sided (cylindrical) inside has r(x) = 3.2 for 0 ≤ x ≤ 20. What is ∫₀²⁰ π r(x)² dx?',choices:['About 201 mL','About 643 mL','About 2,011 mL','About 64 mL'],correct:1,explain:'∫₀²⁰ π(3.2)² dx = π × 10.24 × 20 = 204.8π ≈ 643.4 cm³. That is bottle A’s body; its shoulder and neck add 85 mL more, for 729 mL.'},
  {lvl:'ap',instant:true,q:'Bottle B’s body has r(x) = a₀ + a₁x + a₂x². What kind of function do you integrate to get its volume?',choices:['A quadratic','A polynomial of degree 4','An exponential','A linear function'],correct:1,explain:'V = ∫ π r(x)² dx, and squaring a quadratic gives a degree-4 polynomial: π(a₀² + 2a₀a₁x + (a₁² + 2a₀a₂)x² + 2a₁a₂x³ + a₂²x⁴). Integrate term by term.'}
 ],
 tour:[
  {title:'The bottle',text:'This is bottle B, drawn to scale from the side. Inside, it is 24 cm tall: a 19 cm body that bulges slightly, a 3 cm shoulder and a 2 cm neck. Every slice across it is a circle.',pause:true,setup:sim=>{BioLab.setValues(sim,{bottle:'B',n:2,wall:false});sim.peek=false;}},
  {title:'Two fat disks',text:'Replace the inside with 2 disks (short cylinders), each 12 cm tall, using the radius at the middle of each. Each disk holds π × r² × 12. Together: 1,286 mL. Too much: the second disk fills the shoulder and neck as if they were as wide as the body.',pause:true,setup:sim=>{sim.peek=true;BioLab.setValues(sim,{n:2});}},
  {title:'Six disks',text:'With 6 disks, each 4 cm thick, the stack follows the shape better: 1,127 mL.',pause:true,setup:sim=>BioLab.setValues(sim,{n:6})},
  {title:'Thin disks',text:'With 60 thin disks, 0.4 cm each, the total is 1,138 mL, and it hardly changes if you add more. On the right, each disk is a rectangle under the curve of slice area πr²: the volume is the area under that curve.',pause:true,setup:sim=>BioLab.setValues(sim,{n:60})},
  {title:'Compare bottle A',text:'Bottle A is slimmer and straight: radius 3.2 cm, 25 cm tall inside. It holds 729 mL, about 409 mL less than bottle B, even though it is a centimeter taller.',pause:true,setup:sim=>BioLab.setValues(sim,{bottle:'A',n:60})},
  {lvl:'honors',title:'The double wall',text:'Back to B, now with a straight outer wall 0.5 cm beyond the widest part. The space between the walls is a stack of washers, π(R² − r²)Δx each: 408 mL that you see from outside but can’t fill. On one side, the wall’s cross-section is the area between the curves R(x) and r(x): 15.6 cm².',pause:true,setup:sim=>BioLab.setValues(sim,{bottle:'B',wall:true,gap:0.5,n:60})},
  {lvl:'ap',title:'The integral',text:'Bottle B’s body is r(x) = 3.7 + 0.1105x − 0.004986x² (x in cm, 0 ≤ x ≤ 19). ∫₀¹⁹ π r(x)² dx = 1,029.5 mL. The shoulder (a cone piece) adds 85.5 mL and the neck 22.7 mL: 1,137.7 mL in all.',pause:true,setup:sim=>BioLab.setValues(sim,{wall:false})}
 ],
 lab:{bio:'<p><b>Question:</b> How many disks do you need?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Set the disks to 2, 4, 6, 10, 20 and 60, and record a trial each time.</li><li>Graph <b>Trials</b> with disks on x and “Disks add up to” on y.</li></ol><p>Write one sentence: when are the disks “close enough”?</p>',
  honors:'<p><b>Question:</b> How much does insulation cost you?</p><ol><li>Turn on the double wall. For gaps of 0.2 to 1.0 cm, record the wall volume.</li><li>Is the wall volume proportional to the gap? Explain with π(R² − r²).</li></ol><p>Then design a bottle that holds 1,000 mL inside a 9 cm wide outer wall.</p>',
  ap:'<p><b>Question:</b> Find a bottle’s volume exactly.</p><ol><li>Pick a design. Write r(x) for the body from the three radii.</li><li>Expand π r(x)² and integrate from 0 to H. Add the shoulder (a frustum) and the neck.</li></ol><p><b>CER:</b> Compare your exact answer with the 60-disk total and explain the difference.</p>'},
 terms:[
  {t:'Volume of revolution',d:'The solid you get by spinning a region around a line. Round bottles, cups and vases are volumes of revolution.'},
  {t:'Disk method',d:'Slice the solid into thin disks: each has volume π r² Δx. Add them up.'},
  {t:'Washer method',d:'For a solid with a hole (or a wall between two surfaces), each slice is a washer: π(R² − r²) Δx.',lvl:'honors'},
  {t:'Area between curves',d:'∫ (top curve − bottom curve) dx. Here, the outer wall R(x) minus the inner wall r(x) gives the wall’s side cross-section.',lvl:'honors'},
  {t:'Definite integral',d:'The limit of the sums as the slices get thinner: V = ∫ π r(x)² dx.',lvl:'ap'}
 ],
 about:'<p>The inside of each bottle is the shape you get by spinning its side profile r(x) around the center line. The body’s radius follows the quadratic through the bottom, middle and top radii you set. A 3 cm shoulder narrows in a straight line to a 1.9 cm neck radius, and the neck is 2 cm tall. Volumes are in cm³, and 1 cm³ = 1 mL.</p><p>Bottles A and B are made-up designs with realistic sizes, not real products. The disks use the radius at the middle of each slice. The double wall is a straight outer wall a set distance beyond the widest part of the inside; the model ignores the thickness of the metal itself and the bottom of the outer shell. Real bottles also have rounded bottoms and threads, so a measuring cup is the final word.</p>'
};
BioLab.register(SIM);
})();
