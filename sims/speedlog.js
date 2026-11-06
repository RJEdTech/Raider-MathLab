(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Each drive is a list of knots (minute, mph). Between knots the speed eases along a half cosine, so the curve is smooth
   and the exact area of each piece is (v1 + v2)/2 × its width. Distance in miles = area (mph × min) ÷ 60. */
const DRIVES={
 trip:{name:'Tournament drive',T:40,k:[[0,0],[1.5,28],[4.6,33],[7.3,67],[18.4,71],[20.9,47],[25.7,44],[28.4,72],[34.8,70],[36.9,38],[38.6,26],[40,14]]},
 mtn:{name:'Mountain trip, first 30 minutes',T:30,k:[[0,0],[1.2,24],[4.1,27],[5.3,0],[6.1,0],[7.6,34],[11.4,37],[13.1,56],[17.8,58],[19.4,45],[22.9,44],[25.4,66],[30,68]]}
};
const D=sim=>DRIVES[sim.p.drive];
function speed(dr,t){const K=dr.k;for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(t<=b[0]+1e-12){const u=clamp((t-a[0])/(b[0]-a[0]),0,1);return a[1]+(b[1]-a[1])*(1-Math.cos(Math.PI*u))/2;}}return K[K.length-1][1];}
/* exact area from t=0 to t=x (miles) */
function distTo(dr,x){const K=dr.k;let s=0;for(let i=0;i<K.length-1;i++){const a=K[i],b=K[i+1];if(x>=b[0]){s+=(a[1]+b[1])/2*(b[0]-a[0]);continue;}
  if(x>a[0]){const w=b[0]-a[0],u=(x-a[0])/w;s+=w*(a[1]*u+(b[1]-a[1])*(u/2-Math.sin(Math.PI*u)/(2*Math.PI)));}break;}return s/60;}
const exact=dr=>distTo(dr,dr.T);
const hgt=(dr,m,a,w)=>m==='left'?speed(dr,a):m==='right'?speed(dr,a+w):m==='mid'?speed(dr,a+w/2):(speed(dr,a)+speed(dr,a+w))/2;
function rsum(dr,m,w){const n=Math.round(dr.T/w);let s=0;for(let i=0;i<n;i++)s+=hgt(dr,m,i*w,w)*w;return s/60;}
const meth=sim=>atLeast('honors')?sim.p.method:'left';
const est=sim=>rsum(D(sim),meth(sim),sim.p.w);
const nRect=sim=>Math.round(D(sim).T/sim.p.w);
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
const MNAME={left:'left',right:'right',mid:'midpoint',trap:'trapezoid'};
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const mi=v=>f1(v)+' mi';
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
let L0=70,B0=300;const R0=780,T0=46;
/* text with a halo in the background color, so it stays readable over rectangles */
function htxt(ctx,s,x,y,o){ctx.save();ctx.font=(o.w||400)+' '+(o.s||13)+'px '+BioLab.h.FONT;ctx.textAlign=o.a||'left';ctx.textBaseline=o.b||'alphabetic';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle=PAL['cv-bg'];ctx.strokeText(s,x,y);ctx.restore();txt(ctx,s,x,y,o);}

const SIM={
 id:'speedlog',hash:'speedlog',apUnit:17,order:1,tab:'How far did we drive?',kind:'Simulation',
 card:'Guess how far the car went from its speed log, then stack rectangles under the speed graph until they give the distance.',
 title:'How far did we drive?',
 lede:{bio:'Speed times time is distance. When the speed keeps changing, cut the drive into short slices, treat each slice as a rectangle on the speed graph, and add up their areas.',
  honors:'Those rectangle totals are Riemann sums. Left, right, midpoint and trapezoid sums pick the height of each slice differently, and all of them close in on the same number as the slices get thinner.',
  ap:'The limit of the Riemann sums is the definite integral: distance = ∫ v(t) dt. Whether a sum lands over or under depends on whether v is increasing or decreasing, and on its concavity.'},
 scale:'Speed in miles per hour (mph) against time in minutes. A rectangle 2 minutes wide and 60 mph tall stands for 2 miles.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The drive',
 controls:[
  {id:'drive',label:'Which drive',type:'seg',def:'trip',noGut:true,onChange:clearGut,options:[{v:'trip',l:'Tournament drive (40 min)'},{v:'mtn',l:'Mountain trip (30 min)'}]},
  {id:'guess',label:'Your gut: miles driven',type:'range',min:0,max:60,step:0.5,def:0,unit:' mi',help:'The dashed orange line shows the steady speed that would cover your guess in the same time.'},
  {id:'w',label:'Rectangle width',type:'seg',def:10,options:[{v:10,l:'10 min'},{v:5,l:'5 min'},{v:2,l:'2 min (the log)'},{v:1,l:'1 min'},{v:0.5,l:'30 s'}],help:'Rectangles narrower than the 2-minute log, and midpoint rectangles, read the speed curve between log readings.'},
  {id:'method',label:'Height of each rectangle',type:'seg',def:'left',lvl:'honors',options:[{v:'left',l:'Left'},{v:'right',l:'Right'},{v:'mid',l:'Midpoint'},{v:'trap',l:'Trapezoid'}],help:'Left uses the speed at the start of each slice, right the speed at the end, midpoint the speed halfway through. A trapezoid joins the two ends with a slanted top.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the rectangles',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'n',label:'Rectangles',unit:'',d:0,min:0,max:null,get:nRect},
  {id:'est',label:'Rectangles add up to',unit:'mi',d:2,min:0,max:null,get:sim=>shown(sim)?est(sim):null},
  {id:'true',label:'Distance (area under the curve)',unit:'mi',d:2,min:0,max:null,get:sim=>shown(sim)?exact(D(sim)):null},
  {id:'err',label:'Rectangles over (+) or under (−)',unit:'mi',d:2,lvl:'honors',min:null,max:null,get:sim=>shown(sim)?est(sim)-exact(D(sim)):null},
  {id:'avg',label:'Average speed',unit:'mph',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?exact(D(sim))/(D(sim).T/60):null}
 ],
 graphs:[{id:'conv',label:'Estimate vs. number of rectangles',custom:true}],defaultGraph:'conv',
 plot(sim,ctx,box){const dr=D(sim),ex=exact(dr),m=meth(sim),ws=[10,5,2,1,0.5],vals=ws.map(w=>rsum(dr,m,w));
  if(!shown(sim)){axes(ctx,box,{xmin:0,xmax:5,ymin:0,ymax:1,xticks:false,xl:'Rectangle width',yl:'Miles'});txt(ctx,'Lock in your gut answer to see the sums.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const lo=Math.floor(Math.min(ex,...vals)/2)*2-2,hi=Math.ceil(Math.max(ex,...vals)/2)*2+2;
  const ax=axes(ctx,box,{xmin:0,xmax:5,ymin:lo,ymax:hi,xcats:ws.map(w=>w===0.5?'30 s':w+' min'),xl:'Rectangle width (narrower to the right)',yl:'Miles'});
  ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(box.L,ax.Y(ex));ctx.lineTo(box.L+box.W,ax.Y(ex));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Exact: '+f2(ex)+' mi',box.L+box.W-6,ax.Y(ex)-6,{s:12,w:700,c:PAL['s3'],a:'right'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2;ctx.beginPath();vals.forEach((v,i)=>{const x=ax.X(i+.5),y=ax.Y(v);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
  vals.forEach((v,i)=>{const on=ws[i]===sim.p.w;ctx.fillStyle=on?PAL['rj']:PAL['g-dot'];ctx.beginPath();ctx.arc(ax.X(i+.5),ax.Y(v),on?7:5,0,7);ctx.fill();});
  legend(ctx,box.L+12,box.T+12,[{label:MNAME[m]+' sums',color:PAL['g-line']}]);},
 draw(sim,ctx,vdt,k){const dr=D(sim),T=dr.T,sh=shown(sim),G=sim.gutS,m=meth(sim),w=sim.p.w,ap=atLeast('ap');
  L0=Math.round(40+24*k);B0=Math.round(440-80*k);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const VMAX=80,X=t=>L0+t/T*(R0-L0),Y=v=>B0-v/VMAX*(B0-T0),fs=12*k;
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let v=0;v<=VMAX;v+=20){const y=Y(v);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(v),L0-8,y+4*k,{s:fs,c:PAL['cv-soft'],a:'right'});}
  const tick=k>1.3?(T>30?10:5):(T>30?4:2);
  for(let t=0;t<=T;t+=tick){const x=X(t);ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(x,T0);ctx.lineTo(x,B0);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(t),x,B0+16*k,{s:fs,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'mph',L0-8,T0-12,{s:fs,w:700,c:PAL['cv-soft'],a:'right'});txt(ctx,'Time (minutes)',(L0+R0)/2,B0+34*k,{s:fs,w:700,c:PAL['cv-soft'],a:'center'});
  /* rectangles */
  if(sh){const n=Math.round(T/w);
   for(let i=0;i<n;i++){const a=i*w,b=a+w;let col=PAL['rj'];
    if(ap){const piece=hgt(dr,m,a,w)*w/60,tru=distTo(dr,b)-distTo(dr,a);col=piece>tru+1e-9?PAL['s1']:PAL['s2'];}
    ctx.fillStyle=col;ctx.globalAlpha=.22;ctx.beginPath();
    if(m==='trap'){ctx.moveTo(X(a),Y(0));ctx.lineTo(X(a),Y(speed(dr,a)));ctx.lineTo(X(b),Y(speed(dr,b)));ctx.lineTo(X(b),Y(0));}
    else{const h=hgt(dr,m,a,w);ctx.rect(X(a),Y(h),X(b)-X(a),Y(0)-Y(h));}
    ctx.fill();ctx.globalAlpha=n>40?.5:.9;ctx.strokeStyle=col;ctx.lineWidth=n>40?1:1.5;ctx.stroke();ctx.globalAlpha=1;}}
  /* speed curve */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=0;t<=T+1e-9;t+=T/400){const x=X(t),y=Y(speed(dr,t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  /* log readings */
  ctx.fillStyle=PAL['s2'];for(let t=0;t<=T;t+=2){ctx.beginPath();ctx.arc(X(t),Y(speed(dr,t)),3.5,0,7);ctx.fill();}
  /* gut line: steady speed that covers the guess in the same time */
  const gmi=G&&G.g?G.g.mi:sim.p.guess,gv=gmi/(T/60);
  if(gmi>0||(G&&G.g)){const y=Y(Math.min(gv,VMAX));ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.setLineDash([]);
   htxt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+mi(gmi)+' = a steady '+Math.round(gv)+' mph',L0+8,y-6,{s:fs,w:700,c:PAL['s4']});}
  if(sh&&G&&G.m){const ex=exact(dr),y=Y(ex/(T/60));ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.setLineDash([]);
   const gy=Y(Math.min(gv,VMAX)),off=Math.abs(gy-y)<18*k?(y>gy?18*k:-18*k):0;htxt(ctx,'Math: '+f2(ex)+' mi'+' = a steady '+f1(ex/(T/60))+' mph',R0-6,y-6+off,{s:fs,w:700,c:PAL['s3'],a:'right'});}
  /* the log, as a row of numbers */
  const ry=B0+70*k;txt(ctx,'Speed log, every 2 minutes (mph):',L0,ry-18*k,{s:fs,w:700,c:PAL['s2']});
  const every=(X(2)-X(0))<fs*1.7?2:1;
  for(let i=0,t=0;t<=T;t+=2,i++){if(i%every)continue;txt(ctx,String(Math.round(speed(dr,t))),X(t),ry+6*k,{s:fs,c:PAL['cv-ink'],a:'center'});}
  /* total */
  if(sh){const n=Math.round(T/w),lab=n+' '+(m==='trap'?'trapezoid':(atLeast('honors')?MNAME[m]+' ':'')+'rectangle')+(n>1?'s':'')+' add up to '+f2(est(sim))+' mi';
   pill(ctx,lab,(L0+R0)/2,T0-22,PAL['rj'],'#fff',13*Math.min(k,1.4));}
  else txt(ctx,'Lock in your gut to see the rectangles',(L0+R0)/2,T0-18,{s:13*Math.min(k,1.4),w:700,c:PAL['cv-soft'],a:'center'});},
 narrate(sim){const dr=D(sim),w=sim.p.w,n=nRect(sim),m=meth(sim);
  if(!shown(sim))return `Every 2 minutes the car logged its speed. <b>Speed × time = distance</b>, so a steady 60 mph for 2 minutes covers 2 miles. Drag your guess, watch the dashed line, and lock it in.`;
  const e=est(sim),ex=exact(dr),off=e-ex;
  if(Math.abs(off)<0.05)return `${n} slices of ${w===0.5?'30 seconds':w+' minutes'}: the ${m==='trap'?'trapezoids':'rectangles'} add up to ${f2(e)} mi, within 0.05 mi of the true ${f2(ex)} mi. <b>Thin enough slices make the speed almost constant in each one.</b>`;
  return `${n} slice${n>1?'s':''} of ${w===0.5?'30 seconds':w+' minutes'}: the ${m==='trap'?'trapezoids':'rectangles'} add up to ${f2(e)} mi, ${f2(Math.abs(off))} mi ${off>0?'over':'under'} the true ${f2(ex)} mi. <b>${w>2?'Wide slices miss the speed changes inside them.':'Thinner slices would get closer still.'}</b>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Look at the speed graph and the log under it. Drag the slider here to how many miles you think the car went. The dashed orange line shows the steady speed your guess means. Then lock it in.',honors:'Before any rectangles: drag the slider here to the miles you think the car went, then lock it in.'},
  lock(sim){const g=sim.p.guess,ex=exact(D(sim));return {v:Math.abs(g-ex),mi:g,label:mi(g)};},
  solve(sim){const ex=exact(D(sim));sim.p.w=0.5;if(atLeast('honors'))sim.p.method='trap';sim.p.guess=Math.round(ex*2)/2;return {v:0,mi:ex,label:f2(ex)+' mi, the area under the speed curve'};},
  how:{bio:'The math slices the drive into thin strips. In each strip the speed hardly changes, so speed × time gives that strip’s miles: the area of a thin rectangle. Adding the strips gives the area under the speed curve, which is the distance.',
   honors:'Riemann sums: Σ v(tᵢ) Δt over thinner and thinner slices. Every method (left, right, midpoint, trapezoid) closes in on the same area.',
   ap:'Distance = ∫₀ᵀ v(t) dt, the limit of the Riemann sums as Δt → 0. (Divide by 60 to turn mph × minutes into miles.)'},
  compare(sim,g,m){const dr=D(sim),ex=m.mi,off=g.mi-ex,avg=ex/(dr.T/60),mins=Math.abs(off)/avg*60,log=rsum(dr,'trap',2),le=Math.abs(log-ex);
   if(Math.abs(off)<=0.5)return `Your gut was right on: within ${f1(Math.abs(off))} mi of the true ${f2(ex)} mi. You already sense that distance is speed times time. The rectangles show why it works.`;
   return `You guessed ${mi(g.mi)}; the car went <b>${f2(ex)} mi</b>. You were <b>${f1(Math.abs(off))} mi ${off>0?'over':'under'}</b>, about ${Math.round(mins)} minute${Math.round(mins)===1?'':'s'} of driving at this trip’s average speed of ${f1(avg)} mph. Just the 2-minute log, added as trapezoids, lands within ${f2(le)} mi.`;},
  again(sim){sim.peek=false;sim.p.drive=sim.p.drive==='trip'?'mtn':'trip';sim.p.guess=0;sim.p.w=10;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'A car holds a steady 60 mph for 2 minutes. How far does it go?',choices:['1 mile','2 miles','30 miles','120 miles'],correct:1,explain:'2 minutes is 2/60 of an hour. 60 mph × 2/60 h = 2 miles. On the graph, that is a rectangle 2 minutes wide and 60 mph tall.'},
  {lvl:'bio',instant:true,q:'On the tournament drive, you switch from 10-minute rectangles to 2-minute rectangles (using the speed at the start of each slice). What happens to the total?',choices:['It moves closer to the true distance','It moves farther from the true distance','It stays exactly the same'],correct:0,explain:'With 10-minute slices the rectangles add up to 32.19 mi, 4.29 mi under the true 36.49 mi. With 2-minute slices they add up to 35.97 mi, only 0.51 mi under. Thinner slices follow the speed changes.'},
  {lvl:'honors',instant:true,q:'During one 2-minute slice the car is speeding up the whole time. The left rectangle uses the speed at the start. Is it an overestimate or an underestimate for that slice?',choices:['Overestimate','Underestimate','Exact'],correct:1,explain:'The speed at the start is the lowest speed in that slice, so the rectangle sits below the curve. When speed is increasing, left sums run low and right sums run high.'},
  {lvl:'honors',instant:true,q:'From the tournament drive’s 2-minute log, the left sum is 35.97 mi and the right sum is 36.44 mi. What is the trapezoid sum?',choices:['35.97 mi','36.21 mi','36.44 mi','72.41 mi'],correct:1,explain:'Each trapezoid is the average of its left and right rectangles, so the trapezoid sum is the average of the two sums: (35.97 + 36.44) ÷ 2 ≈ 36.21 mi. The true distance is 36.49 mi.'},
  {lvl:'ap',instant:true,q:'For the tournament drive with 2-minute slices, how much bigger is the right sum than the left sum?',choices:['0 mi','About 0.47 mi','About 2.3 mi','It depends on every reading'],correct:1,explain:'The right and left sums share every reading except the ends. Right − left = Δt × (v(40) − v(0)) = (2/60 h) × (14 − 0) mph ≈ 0.47 mi. Only the first and last readings matter.'},
  {lvl:'ap',instant:true,q:'Where the speed curve is concave down (rounding over the top of a hill in the graph), how do trapezoids compare with the true area there?',choices:['Trapezoids overestimate','Trapezoids underestimate','Trapezoids are exact'],correct:1,explain:'A concave-down curve bulges above the straight chord, so the trapezoid’s slanted top sits under it: an underestimate. The midpoint rectangle overestimates there instead. Concave up flips both.'}
 ],
 tour:[
  {title:'The speed graph',text:'This is the tournament drive. The black curve is the car’s speed for 40 minutes. The blue dots are the readings the car saved every 2 minutes, listed under the graph. Nobody wrote down the odometer.',pause:true,setup:sim=>{BioLab.setValues(sim,{drive:'trip',w:10,method:'left'});sim.peek=true;},focus:[[20,30,770,290],[20,320,770,110]]},
  {title:'Speed × time = distance',text:'At a steady 60 mph, 2 minutes covers 60 × 2/60 = 2 miles. On this graph, that is a rectangle 2 minutes wide and 60 mph tall. <b>Area on a speed graph is distance.</b>',pause:true},
  {title:'Four big rectangles',text:'Cut the drive into four 10-minute slices. Use the speed at the start of each slice as its height. The four rectangles add up to 32.19 mi. They miss a lot, because the speed changes inside each slice.',pause:true,setup:sim=>BioLab.setValues(sim,{w:10})},
  {title:'One rectangle per reading',text:'Now use every 2-minute reading: 20 rectangles add up to 35.97 mi. Much closer, because the speed changes less inside each thin slice.',pause:true,setup:sim=>BioLab.setValues(sim,{w:2})},
  {title:'Thinner still',text:'With 30-second slices, 80 rectangles add up to 36.43 mi. They hug the curve. As the slices get thinner, the total settles on the area under the curve: <b>36.49 miles</b>.',pause:true,setup:sim=>BioLab.setValues(sim,{w:0.5})},
  {lvl:'honors',title:'Other heights',text:'With the 2-minute log, right rectangles give 36.44 mi and trapezoids, which average the two ends of each slice, give 36.21 mi. Every method closes in on the same 36.49 mi as the slices shrink.',pause:true,setup:sim=>BioLab.setValues(sim,{w:2,method:'trap'})},
  {lvl:'ap',title:'Over or under',text:'Red pieces overestimate, blue pieces underestimate. Left rectangles run low where the speed rises and high where it falls. Trapezoids run low where the curve is concave down and high where it is concave up. The limit of every sum is ∫₀⁴⁰ v(t) dt ÷ 60 = 36.49 mi.',pause:true,setup:sim=>BioLab.setValues(sim,{w:5,method:'left'})}
 ],
 lab:{bio:'<p><b>Question:</b> How thin do the slices need to be?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>For each rectangle width, from 10 min down to 30 s, record a trial.</li><li>Graph <b>Trials</b> with rectangles on x and “Rectangles add up to” on y.</li></ol><p>Write one sentence: what number do the totals settle on?</p>',
  honors:'<p><b>Question:</b> Which method gets closest with only the 2-minute log?</p><ol><li>Set the width to 2 min. Record a trial for left, right, midpoint and trapezoid.</li><li>Repeat for the mountain trip.</li></ol><p>Explain why the left sum on the mountain trip is so far under.</p>',
  ap:'<p><b>Question:</b> Can you predict over or under before you add?</p><ol><li>With 5-minute left rectangles, find the slices where the speed is increasing. Check that they are blue (under).</li><li>Switch to trapezoids. Find where the curve is concave down, and check which pieces are under.</li></ol><p><b>CER:</b> Claim which sums over- and underestimate on each drive, with evidence from the colors and reasoning from monotonicity and concavity.</p>'},
 terms:[
  {t:'Riemann sum',d:'An estimate of the area under a curve made by adding thin rectangles: Σ f(tᵢ) Δt.'},
  {t:'Left, right and midpoint sums',d:'Riemann sums that take each rectangle’s height at the left end, right end or middle of its slice.',lvl:'honors'},
  {t:'Trapezoid sum',d:'Joins the two ends of each slice with a straight line. It equals the average of the left and right sums.',lvl:'honors'},
  {t:'Definite integral',d:'∫ₐᵇ f(t) dt: the limit of the Riemann sums as the slices get thinner. For speed, it is the distance traveled.',lvl:'ap'},
  {t:'Concavity',d:'Concave up curves bend upward (like a cup) and concave down curves bend downward. It decides whether trapezoids and midpoints run over or under.',lvl:'ap'}
 ],
 about:'<p>Each drive’s speed is a smooth made-up curve with realistic highway (about 70 mph) and town (25 to 35 mph) speeds, a stoplight and a slowdown. Between its turning points the speed eases along half a cosine wave, so the exact area under each piece is the average of its end speeds times its width. Distance in miles = (mph × minutes) ÷ 60.</p><p>The log is the curve read every 2 minutes. Rectangles narrower than 2 minutes, and midpoint rectangles, read the curve between those readings: a real car or phone only has what it logged. Speed here is always positive, so distance and the area under the curve match. With a car that backs up, the integral of velocity gives the change in position instead.</p>'
};
BioLab.register(SIM);
})();
