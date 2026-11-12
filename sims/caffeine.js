(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Time is in hours relative to bedtime (10 PM = 0). Each drink decays as d·(1/2)^((t − t_i)/h); drinks add. */
const drinks=sim=>{const L=[{d:sim.p.dose,t:-sim.p.t1}];if(sim.p.two)L.push({d:sim.p.dose2,t:-sim.p.t2});return L;};
const hl=sim=>sim.p.half;
const amt=(sim,t)=>drinks(sim).reduce((s,q)=>s+(t>=q.t?q.d*Math.pow(0.5,(t-q.t)/hl(sim)):0),0);
const atBed=sim=>amt(sim,0);
const cpend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g))&&!cpend(sim);
const clock=t=>{let h=((22+t)%24+24)%24;const m=Math.round((h-Math.floor(h))*60);h=Math.floor(h);const ap=h<12?'AM':'PM',h12=h%12===0?12:h%12;return h12+(m?':'+String(m).padStart(2,'0'):'')+' '+ap;};
const mg=v=>Math.round(v)+' mg';
const XMIN=-14,XMAX=10,R0=780,T0=40,B0=376;let L0=70;

/* walkthrough and "Your turn" pictures */
function bar(ctx,x,y0,y1,c,lbl,k,ghost){ctx.fillStyle=c;ctx.globalAlpha=ghost?0.22:0.9;ctx.fillRect(x-14,y1,28,y0-y1);ctx.globalAlpha=1;if(lbl)txt(ctx,lbl,x,y1-8,{s:13*Math.min(k,1.4),w:800,c:ghost?PAL['cv-soft']:c,a:'center'});}
function brace(ctx,x1,x2,y,lbl,k,c){ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y-6);ctx.lineTo(x1,y);ctx.lineTo(x2,y);ctx.lineTo(x2,y-6);ctx.stroke();txt(ctx,lbl,(x1+x2)/2,y+16*Math.min(k,1.4),{s:12*Math.min(k,1.4),w:800,c,a:'center'});}
function cfOverlay(sim,ctx,k,X,Y,ymax){const tv=(sim.tour&&sim.tour.on)?sim.cfv:null,cp=cpend(sim),B=Y(0),kk=Math.min(k,1.4),d=sim.p.dose,h=hl(sim),q0=-sim.p.t1,A=t=>amt(sim,t);
 if(cp){const lv=atLeast('ap')?'ap':atLeast('honors')?'honors':'bio';bar(ctx,X(q0),B,Y(d),PAL['s2'],d+' mg',k);
  const tq=lv==='bio'?q0+h:lv==='honors'?0:9;ctx.strokeStyle=PAL['rj'];ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.strokeRect(X(tq)-14,Y(d*0.55),28,B-Y(d*0.55));ctx.setLineDash([]);
  txt(ctx,'?',X(tq),Y(d*0.55)-10,{s:30*kk,w:800,c:PAL['rj'],a:'center'});brace(ctx,X(q0),X(tq),B-44,fmtNum(tq-q0,1)+' hours = '+fmtNum((tq-q0)/h,2)+' half-lives',k,PAL['s4']);return;}
 if(!tv)return;
 if(tv==='drink'){bar(ctx,X(q0),B,Y(d),PAL['s2'],d+' mg',k);/* a cup */const cx=X(q0)-44,cy=B-60;ctx.fillStyle='#fff';ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx-14,cy-20);ctx.lineTo(cx+14,cy-20);ctx.lineTo(cx+10,cy+18);ctx.lineTo(cx-10,cy+18);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#6b3e1f';ctx.fillRect(cx-12,cy-14,24,6);ctx.beginPath();ctx.arc(cx+17,cy-2,6,-1.4,1.4);ctx.stroke();return;}
 if(tv==='half'){bar(ctx,X(q0),B,Y(d),PAL['s2'],d+' mg',k,true);bar(ctx,X(q0+h),B,Y(A(q0+h)),PAL['rj'],mg(A(q0+h)),k);brace(ctx,X(q0),X(q0+h),B-44,'5 hours: half gone',k,PAL['s4']);return;}
 if(tv==='bed'){bar(ctx,X(q0),B,Y(d),PAL['s2'],'',k,true);bar(ctx,X(q0+h),B,Y(A(q0+h)),PAL['rj'],'',k,true);bar(ctx,X(0),B,Y(A(0)),PAL['rj'],'',k);
  brace(ctx,X(q0),X(q0+h),B-44,'1 half-life',k,PAL['s4']);brace(ctx,X(q0+h),X(0),B-44,'+ 0.4',k,PAL['s4']);return;}
 if(tv==='night'){for(let n=0;n<4;n++){const t=q0+n*h;if(t>10)break;bar(ctx,X(t),B,Y(A(t)),n?PAL['rj']:PAL['s2'],mg(A(t)),k,n===0);}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(9),Y(A(9)),7,0,7);ctx.fill();pill(ctx,'7 AM: '+mg(A(9)),X(9)-10,Y(A(9))-40,PAL['rj'],'#fff',13*kk);return;}
 if(tv==='ratio'){const bw=X(q0+1)-X(q0)-8;for(let n=0;n<4;n++){const t=q0+n,x=X(t);ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.9;ctx.fillRect(x-bw/2,Y(A(t)),bw,B-Y(A(t)));ctx.globalAlpha=1;txt(ctx,fmtNum(A(t),0),x,Y(A(t))+16*kk,{s:11*kk,w:800,c:'#fff',a:'center'});
   if(n)txt(ctx,'×0.87',X(t-0.5),Y(185)+(n%2)*14*kk,{s:12*kk,w:800,c:PAL['s2'],a:'center'});}txt(ctx,'Each hour keeps 87%',X(q0+2),Y(185)-18*kk,{s:12*kk,w:700,c:PAL['s2'],a:'center'});return;}
 if(tv==='zoom'){const x0=X(1),y0=Y(ymax*0.85),w=X(10)-x0-6,hh=Y(ymax*0.45)-y0;ctx.fillStyle=PAL['card'];ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.fillRect(x0,y0,w,hh);ctx.strokeRect(x0,y0,w,hh);
  const zx=t=>x0+8+(t-0)/(48)*(w-16),zy=v=>y0+hh-14-v/A(0)*(hh-34);ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(x0+8,zy(0));ctx.lineTo(x0+w-8,zy(0));ctx.stroke();
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=0;t<=48;t+=0.25){const x=zx(t),y=zy(A(t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  txt(ctx,'Zoom: the next 2 days',x0+10,y0+16*kk,{s:12*kk,w:700});txt(ctx,'closer and closer to 0, never 0',x0+w-10,zy(0)-8,{s:12*kk,w:700,c:PAL['rj'],a:'right'});return;}
 if(tv==='shift'){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.beginPath();for(let t=q0-2;t<=10;t+=0.05){const v=d*Math.pow(0.5,(t-(q0-2))/h);const x=X(t),y=Y(v);t===q0-2?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();ctx.setLineDash([]);
  [0,5].forEach(t=>{const a=A(t),b=a*Math.pow(0.5,2/h);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(t)+12,Y(a));ctx.lineTo(X(t)+12,Y(b));ctx.stroke();txt(ctx,'× 0.758',X(t)+18,(Y(a)+Y(b))/2+4,{s:12*kk,w:800,c:PAL['s5']});});
  pill(ctx,'Dashed: the same drink 2 hours earlier',X(-7),Y(ymax*0.9),PAL['s5'],'#fff',12*kk);return;}
 if(tv==='people'){[[2,PAL['s3']],[10,PAL['s5']]].forEach(([hh,c])=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();for(let t=q0;t<=10;t+=0.05){const x=X(t),y=Y(d*Math.pow(0.5,(t-q0)/hh));t===q0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
   const v=d*Math.pow(0.5,-q0/hh);ctx.fillStyle=c;ctx.beginPath();ctx.arc(X(0),Y(v),6,0,7);ctx.fill();txt(ctx,'half-life '+hh+' h: '+mg(v),X(0)+12,Y(v)+(hh===2?-6:-10),{s:12*kk,w:800,c});});return;}
 if(tv==='two'){drinks(sim).forEach((q,i)=>{ctx.strokeStyle=i?PAL['s2']:PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();for(let t=q.t;t<=10;t+=0.05){const x=X(t),y=Y(q.d*Math.pow(0.5,(t-q.t)/h));t===q.t?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();ctx.setLineDash([]);
   const v=q.d*Math.pow(0.5,-q.t/h);txt(ctx,mg(v),X(0)-10,Y(v)+4,{s:12*kk,w:800,c:i?PAL['s2']:PAL['s4'],a:'right'});});return;}
 if(tv==='solve'){const T=h*Math.log2(d/25),tt=q0+T;ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(X(-14),Y(25));ctx.lineTo(X(10),Y(25));ctx.moveTo(X(tt),Y(25));ctx.lineTo(X(tt),B);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(tt),Y(25),7,0,7);ctx.fill();pill(ctx,'25 mg at '+clock(tt)+': t = '+fmtNum(T,1)+' h',X(tt),Y(25)-30,PAL['s5'],'#fff',13*kk);}
}

const SIM={
 id:'caffeine',hash:'caffeine',apUnit:4,order:4,tab:'Caffeine at bedtime',kind:'Simulation',
 card:'Guess how much of an afternoon drink’s caffeine is still in you at bedtime, then let the half-life model tell you.',
 title:'How much caffeine is left at bedtime?',
 lede:{bio:'Your body clears caffeine a fraction at a time, not all at once. In many adults, half of it is gone after about 5 hours, half of what is left after 5 more, and so on.',
  honors:'Caffeine follows exponential decay: A(t) = A₀(1/2)^(t/h), where h is the half-life. Over equal stretches of time it loses the same fraction, never the same number of milligrams. So the curve always decreases, is concave up (it falls fastest right after the drink, then more and more slowly), and gets closer and closer to 0 without ever reaching it. A second drink simply adds its own decay curve on top of the first.',
  ap:'The same model has many equivalent forms: A₀(1/2)^(t/h) = A₀((1/2)^(1/h))ᵗ, one factor per hour, or A₀e^(−kt) with the natural base e and k = ln 2 / h. As t → ∞, A(t) → 0. Shifting the drink k hours earlier is a vertical dilation by (1/2)^(k/h). Solving A₀(1/2)^(t/h) = A for t takes a logarithm: t = h · log₂(A₀/A).'},
 scale:'One day, from 8 AM to 8 AM the next morning. Bedtime is 10 PM. Caffeine is in milligrams (mg).',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your drink',
 controls:[
  {id:'dose',label:'Caffeine in the drink (mg)',type:'range',min:20,max:300,step:5,def:150,unit:' mg',noGut:true,help:'Caffeine content varies a lot by drink and by size. The label or the maker’s website gives the real number.'},
  {id:'t1',label:'You drink it this many hours before bedtime',type:'range',min:0.5,max:14,step:0.5,def:7,unit:' h',noGut:true},
  {id:'guess',label:'Your guess: caffeine left at 10 PM',type:'range',min:0,max:400,step:5,def:0,unit:' mg'},
  {id:'half',label:'Half-life',type:'range',min:2,max:10,step:0.5,def:5,unit:' h',lvl:'honors',noGut:true,help:'About 5 hours in many adults, but it varies widely, from roughly 2 to 10 hours, from person to person. Pregnancy, smoking and some medicines change it.'},
  {id:'two',label:'Add a second drink',type:'toggle',def:false,lvl:'honors',noGut:true},
  {id:'dose2',label:'Second drink (mg)',type:'range',min:20,max:300,step:5,def:80,unit:' mg',lvl:'honors',noGut:true},
  {id:'t2',label:'Second drink: hours before bedtime',type:'range',min:0.5,max:14,step:0.5,def:4,unit:' h',lvl:'honors',noGut:true}
 ],
 actions:[{id:'show',label:'Skip the guess and show the curve',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'bed',label:'Caffeine in you at 10 PM',unit:'mg',d:0,min:0,max:null,get:sim=>shown(sim)?atBed(sim):null},
  {id:'pct',label:'Share of what you drank',unit:'%',d:0,min:0,max:100,get:sim=>{if(!shown(sim))return null;const tot=drinks(sim).reduce((s,q)=>s+q.d,0);return 100*atBed(sim)/tot;}},
  {id:'morn',label:'Still in you at 7 AM',unit:'mg',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?amt(sim,9):null},
  {id:'halves',label:'Half-lives from first drink to bed',unit:'',d:2,lvl:'honors',min:0,max:null,get:sim=>Math.max(sim.p.t1,sim.p.two?sim.p.t2:0)/hl(sim)},
  {id:'hour',label:'Fraction left after each hour',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>100*Math.pow(0.5,1/hl(sim))}
 ],
 graphs:[{id:'when',label:'Bedtime caffeine vs. when you drink it',custom:true}],defaultGraph:'when',
 plot(sim,ctx,box){const d=sim.p.dose,h=hl(sim),f=x=>d*Math.pow(0.5,x/h);
  const ax=axes(ctx,box,{xmin:0,xmax:14,ymin:0,ymax:Math.ceil(d/50)*50,xl:'Hours between this drink and 10 PM',yl:'mg left at bedtime'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this curve.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let x=0;x<=14.001;x+=0.1){const px=ax.X(x),py=ax.Y(f(x));x?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  for(let n=1;n*h<=14;n++){ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(ax.X(n*h),ax.Y(f(n*h)),4,0,7);ctx.fill();}
  const x=sim.p.t1;ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(x),ax.Y(f(x)),6,0,7);ctx.fill();txt(ctx,'This drink: '+mg(f(x)),ax.X(x)+(x>9?-10:10),ax.Y(f(x))-10,{s:12,w:700,c:PAL['rj'],a:x>9?'right':'left'});
  legend(ctx,box.L+box.W-190,box.T+10,[{label:'Blue dots: each half-life',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=sim.gutS,D=drinks(sim),tot=D.reduce((s,q)=>s+q.d,0);
  const kk=k;L0=Math.round(36+32*k);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const ymax=Math.max(100,Math.ceil(Math.max(tot,sim.p.guess,G&&G.g?G.g.mg:0)*1.12/50)*50);
  const X=t=>L0+(t-XMIN)/(XMAX-XMIN)*(R0-L0),Y=v=>B0-v/ymax*(B0-T0);
  /* night */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X(0),T0,X(9)-X(0),B0-T0);txt(ctx,'Asleep',X(9)-6,T0+14*kk,{s:12*kk,c:PAL['cv-soft'],a:'right'});
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const step=kk>1.25?4:2;
  for(let t=XMIN;t<=XMAX;t+=step){const x=X(t);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(x,T0);ctx.lineTo(x,B0);ctx.stroke();ctx.globalAlpha=1;txt(ctx,clock(t),x,B0+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
  const ys=ymax>250?100:50;for(let v=0;v<=ymax;v+=ys){const y=Y(v);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,v+' mg',L0-8,y+4,{s:12*kk,c:PAL['cv-soft'],a:'right'});}
  /* bedtime line */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(0),T0);ctx.lineTo(X(0),B0);ctx.stroke();txt(ctx,'Bedtime, 10 PM',X(0)+6,T0+14*kk,{s:12*kk,w:700});
  /* drinks */
  D.forEach((q,i)=>{const x=X(q.t);ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.moveTo(x-7,B0+2);ctx.lineTo(x+7,B0+2);ctx.lineTo(x,B0-10);ctx.closePath();ctx.fill();
   const lab=(i?'Drink 2: ':'Drink: ')+q.d+' mg at '+clock(q.t),right=x>X(-3);txt(ctx,lab,x+(right?-8:8),Y(q.d)-8-(i?16*kk:0)*(D.length>1&&Math.abs(D[0].t-D[1].t)<4?1:0),{s:12*kk,w:700,c:PAL['s2'],a:right?'right':'left'});
   ctx.strokeStyle=PAL['s2'];ctx.setLineDash([2,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,B0);ctx.lineTo(x,Y(q.d));ctx.stroke();ctx.setLineDash([]);});
  if(sh){/* half-life guides for the first drink */
   if(atLeast('honors')&&!sim.p.two){const q=D[0];ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,5]);ctx.lineWidth=1;for(let n=1;n<=3;n++){const t=q.t+n*hl(sim);if(t>XMAX)break;const v=q.d/Math.pow(2,n);ctx.beginPath();ctx.moveTo(X(t),B0);ctx.lineTo(X(t),Y(v));ctx.lineTo(X(q.t),Y(v));ctx.stroke();}ctx.setLineDash([]);}
   const tv=(sim.tour&&sim.tour.on)?sim.cfv:null,tLim=tv==='drink'?-7:tv==='half'?-2:tv==='bed'?0:XMAX;
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();let first=true;const t0=Math.min(...D.map(q=>q.t));
   for(let t=t0;t<=Math.min(XMAX,tLim)+1e-9;t+=0.05){const x=X(t),y=Y(amt(sim,t));first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}ctx.stroke();
   const v=atBed(sim);if(tLim>=0){ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(0),Y(v),7,0,7);ctx.fill();}
   if(tLim>=0&&tv!=='zoom')pill(ctx,mg(v)+' at bedtime',X(0)+90*Math.min(k,1.5),Y(v)-6,PAL['rj'],'#fff',13*Math.min(k,1.5));}
  else if(!cpend(sim)){txt(ctx,'?',X(0)+20,Y(ymax*0.6),{s:34*kk,w:700,c:PAL['rj']});}
  /* gut */
  const gv=G&&G.g?G.g.mg:sim.p.guess,gy=Y(gv);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(0),gy,9,0,7);ctx.stroke();
  const close=sh&&Math.abs(gy-Y(atBed(sim)))<22*kk;txt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+mg(gv),X(0)-14,gy+(close?(gy<Y(atBed(sim))?-12:22):5),{s:12*kk,w:700,c:PAL['s4'],a:'right'});
  cfOverlay(sim,ctx,k,X,Y,ymax);},
 narrate(sim){const h=hl(sim);
  if(cpend(sim))return `Work out the caffeine from the picture. Each half-life cuts what is left in half.`;
  if(!shown(sim))return `Your body clears caffeine by halves. With a half-life of ${fmtNum(h,1)} hours, <b>half of the drink is still in you ${fmtNum(h,1)} hours after you finish it</b>. Lock in your guess for bedtime to see the curve.`;
  const v=atBed(sim),D=drinks(sim);
  if(D.length>1)return `Each drink decays on its own, and the amounts add: <b>${mg(v)} at bedtime</b> in all. The later drink matters most, because it has had less time to decay.`;
  const n=sim.p.t1/h;return `From ${clock(-sim.p.t1)} to 10 PM is ${fmtNum(sim.p.t1,1)} hours, or ${fmtNum(n,2)} half-lives. ${sim.p.dose} mg × (1/2)^${fmtNum(n,2)} = <b>${mg(v)} still in you at bedtime</b>.`;},
 gut:{better:'lower',
  calc:{unit:'mg',d:1,tol:a=>Math.max(0.5,a*0.01),
   prompt:{bio:sim=>`From the picture: you drink <b>${sim.p.dose} mg</b> (the blue bar). The half-life is <b>${fmtNum(hl(sim),1)} hours</b>, so after ${fmtNum(hl(sim),1)} hours half of it is gone. How many mg are left at the red “?”`,
    honors:sim=>`${sim.p.dose} mg, half-life ${fmtNum(hl(sim),1)} hours, and bedtime is ${fmtNum(sim.p.t1,1)} hours later. Use A = A₀(1/2)^(t/h). How many mg are left at 10 PM?`,
    ap:sim=>`${sim.p.dose} mg at ${clock(-sim.p.t1)}, half-life ${fmtNum(hl(sim),1)} hours. How many mg are still in you at <b>7 AM</b> the next morning?`},
   answer:sim=>{const d=sim.p.dose,h=hl(sim),t1=sim.p.t1;return atLeast('ap')?d*Math.pow(0.5,(t1+9)/h):atLeast('honors')?d*Math.pow(0.5,t1/h):d/2;},
   hint:{bio:'One half-life cuts the amount in half.',honors:'Count half-lives: t ÷ h. Then multiply the drink by (1/2) to that power.',ap:'7 AM is 9 hours after 10 PM. Add that to the time before bed.'},
   steps(sim){const d=sim.p.dose,h=hl(sim),t1=sim.p.t1;
    if(atLeast('ap')){const t=t1+9,n=t/h;return [`From ${clock(-t1)} to 7 AM is ${fmtNum(t,1)} hours: ${fmtNum(n,2)} half-lives.`,`${d} × (1/2)^${fmtNum(n,2)} ≈ <b>${fmtNum(d*Math.pow(0.5,n),1)} mg</b>.`,'Still there when your alarm goes off.'];}
    if(atLeast('honors')){const n=t1/h;return [`${fmtNum(t1,1)} hours ÷ ${fmtNum(h,1)} hours = ${fmtNum(n,2)} half-lives.`,`${d} × (1/2)^${fmtNum(n,2)} ≈ <b>${fmtNum(d*Math.pow(0.5,n),1)} mg</b> at bedtime.`];}
    return [`One half-life cuts the drink in half.`,`${d} ÷ 2 = <b>${fmtNum(d/2,1)} mg</b> still in you.`];}},
  controls:['guess'],
  ask:{bio:'Drag the slider here up to the number of milligrams (mg) you think are still in you at 10 PM. The orange ring on the bedtime line moves with it. Then lock it in.',honors:'Before you see the curve: drag the slider here to how many milligrams are still in you at 10 PM, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-atBed(sim)),mg:g,label:mg(g)+' at bedtime'};},
  solve(sim){const v=atBed(sim);sim.p.guess=Math.round(v/5)*5;return {v:0,mg:v,label:mg(v)+' still in you at 10 PM'};},
  how:{bio:'The math counts half-lives. Every 5 hours, half of what is left is gone. From the drink to bedtime is a number of half-lives, so the math halves the drink that many times, even a fraction of a time.',
   honors:'A(t) = A₀(1/2)^(t/h). With t hours since the drink and half-life h, t/h counts the half-lives. A second drink adds its own term.',
   ap:'A(t) = Σ Aᵢ(1/2)^((t − tᵢ)/h), one term per drink. Each hour multiplies what is left by (1/2)^(1/h).'},
  compare(sim,g,m){const v=m.mg,tot=drinks(sim).reduce((s,q)=>s+q.d,0),off=g.mg-v,pct=Math.round(100*v/tot);
   const tip=` To have half as much at bedtime, you would need this drink one half-life (${fmtNum(hl(sim),1)} hours) earlier.`;
   if(Math.abs(off)<=10)return `Your gut was right on: within ${Math.round(Math.abs(off))} mg. <b>${mg(v)}</b> is still active at 10 PM, ${pct}% of what you drank.`+tip;
   return `You guessed ${mg(g.mg)}, but <b>${mg(v)} is still in you at 10 PM</b>: ${pct}% of what you drank, so you were off by <b>${Math.round(Math.abs(off))} mg</b>. ${off<0?'Many people think caffeine is gone in a few hours. Exponential decay never drops all at once.':'Caffeine fades faster than you expected at the start, when there is the most to clear.'}`+tip;},
  again(sim){sim.peek=false;sim.p.dose=[60,80,100,120,150,180,200,250][Math.floor(Math.random()*8)];sim.p.t1=[3,4,5,6,7,8,9,10][Math.floor(Math.random()*8)];sim.p.guess=0;
   if(atLeast('honors'))sim.p.half=[3,4,5,5,6,7][Math.floor(Math.random()*6)];}
 },
 onTourExit(sim){sim.peek=false;sim.cfv=null;},
 challenges:[
  {lvl:'bio',instant:true,q:'You have 200 mg of caffeine at 5 PM. Your half-life is 5 hours. About how much is still in you at 10 PM?',choices:['None','50 mg','100 mg','150 mg'],correct:2,explain:'5 PM to 10 PM is 5 hours: exactly one half-life. Half of 200 mg is 100 mg.'},
  {lvl:'bio',instant:true,q:'After two half-lives, how much of the caffeine is left?',choices:['None: two halves make a whole','A quarter','Half'],correct:1,explain:'The first half-life leaves 1/2. The second halves what is left: 1/2 × 1/2 = 1/4. Exponential decay never takes it all at once.'},
  {lvl:'honors',instant:true,q:'Half-life 5 hours. You drink 100 mg at noon and another 100 mg at 5 PM. How much is in you at 10 PM?',choices:['50 mg','75 mg','100 mg','200 mg'],correct:1,explain:'The noon drink has had 10 hours (2 half-lives): 100 × 1/4 = 25 mg. The 5 PM drink has had 5 hours (1 half-life): 50 mg. The amounts add: 25 + 50 = 75 mg.'},
  {lvl:'honors',instant:true,q:'Half-life 5 hours, 150 mg at 3 PM. Hour by hour the amounts are 150, 130.6, 113.7 and 99.0 mg. What stays the same each hour?',choices:['The milligrams cleared: about 19 mg every hour','The fraction kept: about 87% of the hour before','Nothing stays the same','The amount drops by 10% of the original each hour'],correct:1,explain:'The drops are 19.4, 16.9 and 14.7 mg: they shrink. The ratio is (1/2)^(1/5) ≈ 0.871 every hour. Over equal time steps, a constant ratio is the sign of an exponential function; a constant difference would be linear.'},
  {lvl:'honors',instant:true,q:'You and a friend each drink 160 mg at 2 PM. Your half-life is 4 hours; your friend’s is 8 hours. At 10 PM, how do you compare?',choices:['You both have the same','Your friend has twice as much','Your friend has four times as much'],correct:1,explain:'8 hours is 2 of your half-lives: 160 × 1/4 = 40 mg. It is 1 of your friend’s: 160 × 1/2 = 80 mg. Same drink, twice the caffeine at bedtime.'},
  {lvl:'ap',instant:true,q:'Unit 2B preview: half-life 5 hours. You drink 200 mg. To the nearest tenth of an hour, how long until only 30 mg is left?',choices:['8.5 h','11.3 h','13.7 h','16.7 h'],correct:2,explain:'200(1/2)^(t/5) = 30, so (1/2)^(t/5) = 0.15 and t = 5 · log₂(200/30) = 5 · log₂(6.67) ≈ 5 × 2.737 ≈ 13.7 h.'},
  {lvl:'ap',instant:true,q:'For t ≥ 0, which describes A(t) = 150(1/2)^(t/5)?',choices:['Decreasing and concave down; it reaches 0 at t = 10','Decreasing and concave up; lim (t → ∞) A(t) = 0, but A(t) is never 0','Decreasing at a constant rate of 15 mg per hour','Decreasing, then increasing'],correct:1,explain:'The base 1/2 is between 0 and 1 and the coefficient is positive, so A always decreases. The drops get smaller each hour (19.4, 16.9, 14.7 mg), so it is concave up. Each hour keeps 87% of what was there, so it approaches 0 as t grows but never gets there: the x-axis is a horizontal asymptote.'},
  {lvl:'ap',instant:true,q:'Half-life 5 hours. You move your 150 mg drink from 3 PM to 1 PM, 2 hours earlier. What happens to the caffeine left at 10 PM?',choices:['It drops by 2 × 10% = 20%','It is multiplied by (1/2)^(2/5) ≈ 0.758','It drops by 2 mg','It is cut in half'],correct:1,explain:'A(t + 2) = A₀(1/2)^((t + 2)/5) = (1/2)^(2/5) · A(t). Shifting the input is the same as multiplying the output: 56.8 mg becomes about 43.1 mg. That is the product property, b^(x + k) = b^k · bˣ.'},
  {lvl:'ap',instant:true,q:'With a 5-hour half-life, what fraction of the caffeine leaves your body each hour?',choices:['10%','About 12.9%','20%','50% ÷ 5 = 10% every hour, then less'],correct:1,explain:'Each hour keeps (1/2)^(1/5) ≈ 0.871 of what was there, so about 12.9% leaves. It is the same fraction every hour: that is what makes it exponential.'}
 ],
 tour:[
  {title:'The drink',text:'At <b>3 PM</b> you drink <b>150 mg</b> of caffeine, about a 16 oz coffee. The blue bar is all of it, in your body.',pause:true,setup:sim=>{sim.peek=true;sim.cfv='drink';BioLab.setValues(sim,{dose:150,t1:7,half:5,two:false,guess:0});}},
  {title:'One half-life',text:'Follow the red curve for <b>5 hours</b>. At 8 PM the bar is <b>half</b> as tall: 75 mg. Half is gone; half is still working.',pause:true,setup:sim=>{sim.cfv='half';}},
  {title:'Bedtime',text:'10 PM is 7 hours after the drink: <b>one half-life plus 0.4 more</b>. The bar at bedtime: 150 × (1/2)^1.4 ≈ <b>57 mg</b>, more than a third of the drink.',pause:true,setup:sim=>{sim.cfv='bed';}},
  {title:'Overnight',text:'Every 5 hours the bar halves again: 150, 75, 37.5, 19. It never drops all at once. At <b>7 AM</b>, about <b>16 mg</b> is still in you.',pause:true,setup:sim=>{sim.cfv='night';}},
  {lvl:'honors',title:'Equal hours, equal ratios',text:'Hour by hour: 150, 130.6, 113.7, 99.0 mg. The drops shrink, but every bar is <b>× 0.87</b> of the one before. Same ratio over equal steps: exponential, not linear.',pause:true,setup:sim=>{sim.cfv='ratio';}},
  {lvl:'honors',title:'Always falling, never zero',text:'Zoom out to two days. The curve keeps falling, fast at first, then slower (concave up). It gets closer and closer to 0 but never reaches it: as t → ∞, A(t) → 0.',pause:true,setup:sim=>{sim.cfv='zoom';}},
  {lvl:'ap',title:'Same model, other forms',text:'150(1/2)^(t/5) = 150(0.8706)ᵗ = 150e^(−0.1386t). The dashed curve is the same drink 2 hours earlier: a horizontal shift. Every later amount is <b>× 0.758</b>, a vertical dilation by (1/2)^(2/5).',pause:true,setup:sim=>{sim.cfv='shift';}},
  {lvl:'honors',title:'People differ',text:'Half-life varies from about 2 to 10 hours. Green (2 h): <b>13 mg</b> at bedtime. Red (5 h): 57 mg. Purple (10 h): <b>92 mg</b>. Same drink, very different nights.',pause:true,setup:sim=>{sim.cfv='people';BioLab.setValues(sim,{half:5});}},
  {lvl:'honors',title:'A second drink adds',text:'Add an 80 mg drink at 6 PM. Each drink fades on its own dashed curve, and the red total is their sum: about <b>103 mg</b> at bedtime.',pause:true,setup:sim=>{sim.cfv='two';BioLab.setValues(sim,{half:5,two:true,dose2:80,t2:4});}},
  {lvl:'ap',title:'Solve for time (Unit 2B preview)',text:'When is a 150 mg drink down to 25 mg? Where the curve meets the dashed line: 150(1/2)^(t/5) = 25, so t = 5 · log₂(6) ≈ <b>12.9 hours</b>. Logarithms undo the exponent.',pause:true,setup:sim=>{sim.cfv='solve';BioLab.setValues(sim,{two:false});}}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the time of your drink change your bedtime caffeine?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Keep 150 mg. Set the drink to 2, 4, 6, 8 and 10 hours before bed. Record a trial each time.</li><li>Graph <b>Trials</b> with hours on x and bedtime caffeine on y.</li></ol><p>Write one sentence: what happens each time you add 5 hours?</p>',
  honors:'<p><b>Question:</b> How much does your half-life matter?</p><ol><li>Keep 150 mg at 7 hours before bed. Set the half-life to 2, 4, 6, 8 and 10 hours and record each.</li><li>Then add a second drink and record how the total changes.</li></ol><p>Explain why the amounts from two drinks simply add.</p>',
  ap:'<p><b>Question:</b> When is the caffeine down to a set amount?</p><ol><li>For 150 mg and three half-lives, solve A₀(1/2)^(t/h) = 30 for t with logarithms.</li><li>Check each answer with the curve.</li></ol><p><b>CER:</b> Show why each extra half-life adds the same time but removes a smaller amount.</p>'},
 terms:[
  {t:'Half-life',d:'The time it takes for half of a substance to be gone. For caffeine, about 5 hours in many adults, but roughly 2 to 10 hours depending on the person.'},
  {t:'Exponential decay',d:'A quantity that loses the same fraction in each equal time step: A(t) = A₀(1/2)^(t/h).',lvl:'honors'},
  {t:'Superposition',d:'When doses add: each one decays on its own, and the total is the sum.',lvl:'honors'},
  {t:'Constant ratio',d:'Over equal time steps, an exponential function keeps the same fraction each step. A linear function would lose the same amount instead.',lvl:'honors'},
  {t:'Concave up',d:'A curve that bends upward: here the drops get smaller over equal time steps, so the curve flattens out as it falls.',lvl:'honors'},
  {t:'Natural base e',d:'e ≈ 2.718. Any exponential can be written with base e: (1/2)^(t/h) = e^(−kt) with k = ln 2 / h.',lvl:'ap'},
  {t:'Logarithm',d:'The inverse of an exponent. To solve (1/2)^(t/h) = A/A₀ for t, use t = h · log₂(A₀/A).',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not medical advice.</b> It uses A(t) = A₀(1/2)^(t/h) for each drink and adds the drinks together. It treats each drink as taken in all at once; in real life caffeine reaches its highest level in the blood within about an hour or so, then decays.</p><p><b>The half-life is an assumption.</b> About 5 hours is typical for many adults, but it varies widely, from roughly 2 to 10 hours, and things like pregnancy, smoking and some medicines change it. Caffeine content also varies a lot by drink and size, so check the label rather than guessing. The model says how much caffeine is in your body, not how it will affect you.</p>'
};
BioLab.register(SIM);
})();
