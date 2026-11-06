(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Newton's law of cooling: dT/dt = −k(T − Tr), so T(t) = Tr + (T0 − Tr)e^(−kt). Time is in minutes inside the model. */
const FOOD={
 pizza:{T0:190,Tr:70,where:'the kitchen',env:'Room',xmax:20,unit:'min',ymin:60,ymax:200,H:{s:0.5,m:1,l:2}},
 left:{T0:150,Tr:37,where:'the fridge',env:'Fridge',xmax:720,unit:'h',ymin:30,ymax:160,tg:40,H:{s:15,m:30,l:60}}
};
const KBOX={shallow:0.02,deep:0.006};
const F=sim=>FOOD[sim.p.food];
const kOf=sim=>sim.p.food==='pizza'?0.10:KBOX[sim.p.box];
const tgOf=sim=>sim.p.food==='pizza'?(atLeast('honors')?sim.p.target:130):40;
const Tat=(sim,t)=>{const f=F(sim);return f.Tr+(f.T0-f.Tr)*Math.exp(-kOf(sim)*t);};
const tstar=sim=>{const f=F(sim);return Math.log((f.T0-f.Tr)/(tgOf(sim)-f.Tr))/kOf(sim);};
const hOf=sim=>F(sim).H[sim.p.eh];
/* Euler's method from t = 0 until the estimate drops to the target; the crossing is found along the last straight step. */
function euler(sim){const f=F(sim),k=kOf(sim),h=hOf(sim),tg=tgOf(sim),pts=[[0,f.T0]];let t=0,T=f.T0,cross=null;
  for(let i=0;i<400;i++){const s=-k*(T-f.Tr),Tn=T+s*h;pts.push([t+h,Tn]);if(cross===null&&Tn<=tg)cross=t+h*(T-tg)/(T-Tn);t+=h;T=Tn;if(t>f.xmax+1e-9)break;}
  return {pts,cross};}
const isP=sim=>sim.p.food==='pizza';
/* minutes ↔ the unit the student answers in */
const toDisp=(sim,m)=>isP(sim)?m:m/60;
const fromDisp=(sim,v)=>isP(sim)?v:v*60;
const tLab=(sim,m)=>isP(sim)?fmtNum(m,1)+' min':fmtNum(m/60,1)+' h';
const deg=v=>Math.round(v)+' °F';
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function htxt(ctx,s,x,y,o){ctx.save();ctx.font=(o.w||400)+' '+(o.s||13)+'px '+BioLab.h.FONT;ctx.textAlign=o.a||'left';ctx.textBaseline=o.b||'alphabetic';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle=PAL['cv-bg'];ctx.strokeText(s,x,y);ctx.restore();txt(ctx,s,x,y,o);}
/* The answer slider counts minutes for pizza and hours for leftovers; show only the controls that apply to this food. */
function syncFood(sim){const W=sim.ui&&sim.ui.ctlW;if(!W)return;const p=isP(sim),c=SIM.controls.find(c=>c.id==='guess');
  const unit=p?' min':' h',lab=p?'Your gut: minutes until it is ready to eat':'Your gut: hours until it is down to 40 °F';
  if(c.unit!==unit){c.unit=unit;if(sim.ui.ctl.guess)sim.ui.ctl.guess.set(sim.p.guess);}
  const l=W.guess&&W.guess.querySelector('label');if(l&&l.textContent!==lab)l.textContent=lab;
  const vis=(id,on)=>{const w=W[id];if(!w)return;const lv=(SIM.controls.find(c=>c.id===id).lvl)||'bio',h=!on||!atLeast(lv);if(w.hidden!==h)w.hidden=h;};
  vis('box',!p);vis('target',p);}
let L0=70,B0=380;const R0=780,T0=44;

const SIM={
 id:'cooling',hash:'cooling',apUnit:17,order:3,tab:'When can I eat it?',kind:'Simulation',
 card:'Guess when a hot slice is cool enough to eat, or when leftovers are fridge-cold, then let Newton’s law of cooling answer.',
 title:'When can I eat it?',
 lede:{bio:'Hot food cools fastest when it is much hotter than the air around it, and slower and slower as it gets close. So it never cools at a steady number of degrees per minute.',
  honors:'Newton’s law of cooling is a differential equation: dT/dt = −k(T − T_room). It says the cooling rate is proportional to the gap between the food and its surroundings. A slope field shows that rule at every point.',
  ap:'Separating variables gives T(t) = T_room + (T₀ − T_room)e^(−kt), so the time to reach a target is t = (1/k) ln((T₀ − T_room)/(T_target − T_room)). Euler’s method gets close with straight steps when you can’t solve it.'},
 scale:'Temperature in °F against time: minutes for a pizza slice, hours for leftovers in the fridge.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The food',
 controls:[
  {id:'food',label:'What is cooling',type:'seg',def:'pizza',noGut:true,onChange(sim){sim.p.guess=0;clearGut(sim);syncFood(sim);},options:[{v:'pizza',l:'Pizza slice on the counter'},{v:'left',l:'Leftovers in the fridge'}]},
  {id:'guess',label:'Your gut: minutes until it is ready to eat',type:'range',min:0,max:20,step:0.1,def:0,unit:' min',help:'Minutes for the pizza slice, hours for the leftovers.'},
  {id:'box',label:'Leftover container',type:'seg',def:'shallow',noGut:true,onChange:clearGut,options:[{v:'shallow',l:'Shallow container'},{v:'deep',l:'Deep pot'}],help:'Food in a shallow container has more surface for its size, so it cools faster. In this model k = 0.02 per minute (shallow) or 0.006 per minute (deep pot).'},
  {id:'target',label:'Ready to eat at',type:'range',min:110,max:150,step:5,def:130,unit:' °F',lvl:'honors',noGut:true,onChange:clearGut,help:'130 °F is our assumption for “hot but won’t burn your mouth.” People differ.'},
  {id:'field',label:'Show the slope field',type:'toggle',def:false,lvl:'honors',help:'Each short segment has the slope dT/dt = −k(T − T_room) at that point.'},
  {id:'euler',label:'Show Euler’s method',type:'toggle',def:false,lvl:'ap'},
  {id:'eh',label:'Euler step size',type:'seg',def:'m',lvl:'ap',options:[{v:'s',l:'Small'},{v:'m',l:'Medium'},{v:'l',l:'Big'}],help:'Pizza: 0.5, 1 or 2 minutes. Leftovers: 15, 30 or 60 minutes.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the curve',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 onLevel:syncFood,
 metrics:[
  {id:'tstar',label:'Reaches the target after',text:true,get:sim=>shown(sim)?tLab(sim,tstar(sim)):'?'},
  {id:'tmin',label:'Minutes to the target',unit:'min',d:1,min:0,max:null,get:sim=>shown(sim)?tstar(sim):null},
  {id:'tgut',label:'Temperature at your gut time',unit:'°F',d:0,min:0,max:null,get:sim=>shown(sim)?Tat(sim,fromDisp(sim,sim.p.guess)):null},
  {id:'k',label:'Cooling constant k',unit:'per min',d:3,lvl:'honors',min:0,max:null,get:kOf},
  {id:'half',label:'The gap halves every',unit:'min',d:1,lvl:'honors',min:0,max:null,get:sim=>Math.LN2/kOf(sim)},
  {id:'eul',label:'Euler’s method says (min)',unit:'min',d:1,lvl:'ap',min:0,max:null,get:sim=>{const e=euler(sim).cross;return e===null?null:e;}}
 ],
 graphs:[{id:'rate',label:'Cooling rate vs. temperature gap',custom:true}],defaultGraph:'rate',
 plot(sim,ctx,box){const f=F(sim),k=kOf(sim),gmax=f.T0-f.Tr;
  const ax=axes(ctx,box,{xmin:0,xmax:gmax,ymin:0,ymax:k*gmax*1.1,xl:'Gap between food and '+f.env.toLowerCase()+' (°F)',yl:'Cooling (°F per min)'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(gmax),ax.Y(k*gmax));ctx.stroke();
  txt(ctx,'Twice the gap, twice as fast: rate = k × gap',box.L+12,box.T+16,{s:12,w:700,c:PAL['g-line']});},
 draw(sim,ctx,vdt,k){syncFood(sim);const f=F(sim),sh=shown(sim),G=sim.gutS,tg=tgOf(sim),kk=kOf(sim),fs=12*k,p=isP(sim);
  L0=Math.round(44+22*k);B0=Math.round(420-26*k);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const X=t=>L0+t/f.xmax*(R0-L0),Y=v=>B0-(v-f.ymin)/(f.ymax-f.ymin)*(B0-T0);
  if(!p){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.08;ctx.fillRect(L0,Y(140),R0-L0,Y(40)-Y(140));ctx.globalAlpha=1;htxt(ctx,'40 to 140 °F: bacteria grow fastest (USDA)',R0-6,Y(140)+fs+6,{s:fs,w:700,c:PAL['s1'],a:'right'});}
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let v=Math.ceil(f.ymin/20)*20;v<=f.ymax;v+=20){const y=Y(v);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,v+'°',L0-6,y+4*k,{s:fs,c:PAL['cv-soft'],a:'right'});}
  const tick=p?(k>1.35?5:2):(k>1.35?180:60);
  for(let t=0;t<=f.xmax+1e-9;t+=tick){const x=X(t);ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(x,T0);ctx.lineTo(x,B0);ctx.stroke();ctx.globalAlpha=1;txt(ctx,p?String(t):String(t/60),x,B0+16*k,{s:fs,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,p?'Minutes on the counter':'Hours in the fridge',(L0+R0)/2,B0+34*k,{s:fs,w:700,c:PAL['cv-soft'],a:'center'});
  /* slope field */
  if(sim.p.field&&atLeast('honors')){ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.3;ctx.globalAlpha=.7;const nx=16,ny=9;
   for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){const t=(i+.5)*f.xmax/nx,T=f.ymin+(j+.5)*(f.ymax-f.ymin)/ny,s=-kk*(T-f.Tr),dx=X(1)-X(0),dy=Y(T+s)-Y(T),len=Math.hypot(dx,dy),ux=dx/len*13,uy=dy/len*13;
    ctx.beginPath();ctx.moveTo(X(t)-ux,Y(T)-uy);ctx.lineTo(X(t)+ux,Y(T)+uy);ctx.stroke();}ctx.globalAlpha=1;}
  /* surroundings and target */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(L0,Y(f.Tr));ctx.lineTo(R0,Y(f.Tr));ctx.stroke();ctx.setLineDash([]);
  htxt(ctx,f.env+': '+f.Tr+' °F',L0+6,Y(f.Tr)+(p?-6:16*k),{s:fs,w:700,c:PAL['s2']});
  ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L0,Y(tg));ctx.lineTo(R0,Y(tg));ctx.stroke();
  htxt(ctx,(p?'Ready to eat: ':'Target: ')+tg+' °F',R0-6,Y(tg)-6,{s:fs,w:700,c:PAL['s3'],a:'right'});
  /* the food */
  const ix=R0-70,iy=p?T0+56*Math.min(k,1.3):Y(97);
  if(p){ctx.fillStyle='#d9a441';ctx.beginPath();ctx.moveTo(ix-40,iy-28);ctx.lineTo(ix+40,iy-28);ctx.lineTo(ix,iy+34);ctx.closePath();ctx.fill();ctx.fillStyle='#b5651d';ctx.fillRect(ix-42,iy-34,84,9);
   ctx.fillStyle='#a8302a';[[-18,-14],[12,-12],[-2,4],[0,-20]].forEach(q=>{ctx.beginPath();ctx.arc(ix+q[0],iy+q[1],5,0,7);ctx.fill();});}
  else{const deep=sim.p.box==='deep',w=deep?56:96,h=deep?60:24;ctx.fillStyle='#4a7fb5';rrect(ctx,ix-w/2,iy-h/2+10,w,h,6);ctx.fill();ctx.fillStyle='#c46a2d';ctx.fillRect(ix-w/2+5,iy-h/2+14,w-10,h-10);
   txt(ctx,deep?'Deep pot':'Shallow container',ix,iy+h/2+28*Math.min(k,1.3),{s:fs,w:700,c:PAL['cv-soft'],a:'center'});}
  /* start */
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(0),Y(f.T0),6,0,7);ctx.fill();htxt(ctx,'Starts at '+f.T0+' °F',X(0)+12,Y(f.T0)+5,{s:fs,w:700,c:PAL['rj']});
  /* the cooling curve */
  if(sh){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=300;i++){const t=i*f.xmax/300,x=X(t),y=Y(Tat(sim,t));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  else txt(ctx,'?',X(f.xmax*0.42),Y((f.T0+tg)/2),{s:30*k,w:700,c:PAL['rj'],a:'center'});
  /* Euler */
  if(sim.p.euler&&atLeast('ap')){const E=euler(sim),pts=E.pts.filter(q=>q[0]<=f.xmax+1e-9);ctx.save();ctx.beginPath();ctx.rect(L0,T0-10,R0-L0,B0-T0+10);ctx.clip();
   ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();pts.forEach((q,i)=>{const x=X(q[0]),y=Y(q[1]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
   ctx.fillStyle=PAL['s5'];pts.forEach(q=>{ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),3.5,0,7);ctx.fill();});ctx.restore();
   htxt(ctx,'Euler, h = '+(p?hOf(sim)+' min':hOf(sim)+' min')+(E.cross!==null?': '+tLab(sim,E.cross):''),R0-6,p?Y(tg)+20*k:Y(56),{s:fs,w:700,c:PAL['s5'],a:'right'});}
  /* gut and math */
  const gm=G&&G.g?G.g.m:fromDisp(sim,sim.p.guess),gx=X(Math.min(gm,f.xmax));
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(gx,T0);ctx.lineTo(gx,B0);ctx.stroke();ctx.setLineDash([]);
  const ts=tstar(sim),mx=X(ts),mShow=sh&&(G&&G.m||sim.peek||atLeast('honors'));
  const gRight=gx<(L0+R0)/2,glab=(G&&G.g?'Your gut: ':'Your guess: ')+tLab(sim,gm);
  htxt(ctx,glab,gx+(gRight?8:-8),T0-8,{s:fs,w:700,c:PAL['s4'],a:gRight?'left':'right'});
  if(mShow&&ts<=f.xmax){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(mx,Y(tg),7,0,7);ctx.fill();
   htxt(ctx,tg+' °F at '+tLab(sim,ts),mx+8,Y(tg)-(p?12:24)*k,{s:fs,w:700,c:PAL['s3']});}},
 infoPanel(sim){if(!atLeast('ap')||!sim.p.euler)return '<p><b>Euler’s method</b> (Deep dive): turn it on to see each straight step.</p>';
  const f=F(sim),k=kOf(sim),h=hOf(sim),E=euler(sim),rows=E.pts.slice(0,7);let s=`<p><b>Euler’s method, h = ${h} min.</b> Each step: slope = −${k}(T − ${f.Tr}); next T = T + h × slope.</p><table class="tbl-mini"><tr><th>t (min)</th><th>T (°F)</th><th>slope (°F/min)</th></tr>`;
  rows.forEach(q=>{s+=`<tr><td>${fmtNum(q[0],1)}</td><td>${fmtNum(q[1],2)}</td><td>${fmtNum(-k*(q[1]-f.Tr),3)}</td></tr>`;});
  return s+`</table><p>Euler reaches ${tgOf(sim)} °F ${E.cross===null?'not within this run':'at about '+fmtNum(E.cross,1)+' min'}; the exact answer is ${fmtNum(tstar(sim),1)} min.</p>`;},
 narrate(sim){const f=F(sim),k=kOf(sim),tg=tgOf(sim),p=isP(sim);
  if(!shown(sim))return p?`The slice starts at ${f.T0} °F in a ${f.Tr} °F kitchen. At first it is ${f.T0-f.Tr} °F hotter than the room and cools about ${fmtNum(k*(f.T0-f.Tr),0)} °F per minute. <b>The cooling slows as the gap shrinks.</b> Lock in your guess.`
   :`The leftovers go into a ${f.Tr} °F fridge at ${f.T0} °F. They cool fast at first, but the last few degrees above ${f.Tr} °F take a long time. <b>The target, ${tg} °F, is only ${tg-f.Tr} °F above the fridge.</b> Lock in your guess.`;
  const ts=tstar(sim),hh=Math.LN2/k;
  return `The gap to ${f.env.toLowerCase()} temperature halves every ${tLab(sim,hh)}. <b>It reaches ${tg} °F after ${tLab(sim,ts)}.</b> ${p?'':'A deep pot takes more than three times as long as a shallow container.'}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to how long you think it takes to reach the green target line: minutes for the pizza slice (ready to eat at 130 °F), hours for leftovers (down to 40 °F). The dashed orange line moves on the graph. Then lock it in.',honors:'Before you see the curve: drag the slider here to when the food reaches the target, then lock it in.'},
  lock(sim){const m=fromDisp(sim,sim.p.guess);return {v:Math.abs(m-tstar(sim)),m,label:tLab(sim,m)};},
  solve(sim){const ts=tstar(sim);sim.p.guess=Math.round(toDisp(sim,ts)*10)/10;if(atLeast('honors'))sim.p.field=true;return {v:0,m:ts,label:tLab(sim,ts)+' to reach '+tgOf(sim)+' °F'};},
  how:{bio:'The math uses one rule: food cools in proportion to how much hotter it is than its surroundings. Twice the gap, twice the cooling. So the gap shrinks by the same fraction every minute, and the curve bends flatter and flatter as it nears room or fridge temperature.',
   honors:'dT/dt = −k(T − T_room). The slope field shows that slope everywhere; the solution curve follows it from the starting temperature.',
   ap:'Separate variables: dT/(T − T_room) = −k dt, so ln|T − T_room| = −kt + C and T = T_room + (T₀ − T_room)e^(−kt). Set T = target and solve: t = (1/k) ln((T₀ − T_room)/(T_target − T_room)).'},
  compare(sim,g,m){const off=g.m-m.m,p=isP(sim),T=Tat(sim,g.m),tg=tgOf(sim);
   if(Math.abs(off)<=(p?0.5:15))return `Your gut was right on: within ${tLab(sim,Math.abs(off))} of ${tLab(sim,m.m)}. You already have a feel for how cooling slows down; the curve shows why.`;
   if(p)return off<0?`At your time the slice is still <b>${deg(T)}</b>, ${Math.round(T-tg)} °F above ${tg} °F: you would bite in ${tLab(sim,-off)} too soon. The math says wait <b>${tLab(sim,m.m)}</b>.`
    :`At your time the slice has cooled to <b>${deg(T)}</b>. You waited ${tLab(sim,off)} longer than you needed; it was ready at <b>${tLab(sim,m.m)}</b>.`;
   return off<0?`At your time the leftovers are still <b>${deg(T)}</b>, above 40 °F. They actually need <b>${tLab(sim,m.m)}</b>, ${tLab(sim,-off)} more than your gut said. That last stretch near the fridge temperature is the slow part.`
    :`At your time they are already ${deg(T)}. They reach 40 °F at <b>${tLab(sim,m.m)}</b>, ${tLab(sim,off)} sooner than your gut said.`;},
  again(sim){sim.peek=false;const seq=[['left','shallow'],['left','deep'],['pizza','shallow']];const i=seq.findIndex(q=>q[0]===sim.p.food&&(q[0]==='pizza'||q[1]===sim.p.box));const n=seq[(i+1)%seq.length];sim.p.food=n[0];sim.p.box=n[1];sim.p.guess=0;syncFood(sim);}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'A slice comes out at 190 °F in a 70 °F kitchen. When does it cool faster: right away, or once it is down to 130 °F?',choices:['Right away','At 130 °F','It cools at the same speed the whole time'],correct:0,explain:'At first it is 120 °F hotter than the room and cools about 12 °F per minute. At 130 °F the gap is 60 °F, so it cools about 6 °F per minute: half as fast. The bigger the gap, the faster the cooling.'},
  {lvl:'bio',instant:true,q:'Leftovers go into a 37 °F fridge at 150 °F in a shallow container. About how long until they are down to 40 °F?',choices:['About 20 minutes','About 1 hour','About 3 hours','They never get below 40 °F'],correct:2,explain:'They drop to about 71 °F in the first hour, but the last few degrees are slow: 40 °F takes about 3.0 hours. In a deep pot it would take about 10 hours.'},
  {lvl:'honors',instant:true,q:'In the slope field for dT/dt = −k(T − T_room), what do the segments look like along the line T = T_room?',choices:['Steep and pointing down','Flat','Steep and pointing up'],correct:1,explain:'When T = T_room the gap is zero, so dT/dt = 0: flat segments. Food already at room temperature stays there. Above that line the slopes point down, and they get steeper the farther above you go.'},
  {lvl:'honors',instant:true,q:'With k = 0.10 per minute, the slice’s temperature gap halves every 6.9 minutes. It starts 120 °F above the room. How far above the room is it after 13.9 minutes?',choices:['60 °F','30 °F','0 °F','40 °F'],correct:1,explain:'13.9 minutes is two halvings: 120 → 60 → 30 °F above the room, so the slice is at 100 °F. Each halving takes the same time, no matter how big the gap is.'},
  {lvl:'ap',instant:true,q:'T(t) = 70 + 120e^(−0.1t). To the nearest tenth of a minute, when is T = 110 °F?',choices:['4.1 min','8.8 min','11.0 min','40.0 min'],correct:2,explain:'120e^(−0.1t) = 40, so e^(−0.1t) = 1/3 and t = 10 ln 3 ≈ 11.0 min.'},
  {lvl:'ap',instant:true,q:'For the pizza, Euler’s method with 1-minute steps says the slice reaches 130 °F at about 6.6 minutes. The exact answer is 6.9 minutes. Why does Euler arrive early?',choices:['The step is too small','The curve is concave up, so each tangent step dips below it','Euler always overestimates time','Rounding error in the exponent'],correct:1,explain:'T(t) is decreasing and concave up. Each Euler step follows the tangent line, which lies below the curve, so the estimates run too cold and the target comes too soon. Smaller steps shrink the gap: 0.5-minute steps give 6.8 minutes.'}
 ],
 tour:[
  {title:'The slice',text:'A slice comes out of the oven at 190 °F into a 70 °F kitchen. Bite before it is down to about 130 °F (our assumption) and you burn your mouth.',pause:true,setup:sim=>{BioLab.setValues(sim,{food:'pizza',target:130,field:false,euler:false});sim.peek=false;}},
  {title:'Fast at first',text:'The slice is 120 °F hotter than the room, so it loses heat quickly: about 12 °F in the first minute. After 3 minutes it is already down to about 159 °F.',pause:true,setup:sim=>{sim.peek=true;BioLab.setValues(sim,{guess:3});}},
  {title:'Slower and slower',text:'The cooling rate is proportional to the gap. When the gap is half as big, the slice cools half as fast. So the curve bends flatter as it nears 70 °F, and never quite reaches it.',pause:true,setup:sim=>BioLab.setValues(sim,{guess:10})},
  {title:'Ready to eat',text:'Here the gap halves every 6.9 minutes. 130 °F is exactly halfway from 190 °F down to 70 °F, so the slice is ready at <b>6.9 minutes</b>.',pause:true,setup:sim=>BioLab.setValues(sim,{guess:6.9})},
  {title:'Leftovers in the fridge',text:'Now the leftovers: 150 °F food in a 37 °F fridge, shallow container. They are down to about 71 °F in the first hour, but 40 °F, just 3 °F above the fridge, takes about 3.0 hours.',pause:true,setup:sim=>BioLab.setValues(sim,{food:'left',box:'shallow',guess:3})},
  {title:'Shallow beats deep',text:'The same food in a deep pot cools much more slowly: about 10.1 hours to reach 40 °F, and it spends far longer between 40 and 140 °F, where bacteria grow fastest. That is why food-safety guidance says to divide big batches into shallow containers.',pause:true,setup:sim=>BioLab.setValues(sim,{box:'deep',guess:10.1})},
  {lvl:'honors',title:'The slope field',text:'Back to the pizza. Each segment shows dT/dt = −k(T − 70) at that point: steep high up, flat at 70 °F. The cooling curve follows the segments from 190 °F.',pause:true,setup:sim=>BioLab.setValues(sim,{food:'pizza',field:true,guess:6.9})},
  {lvl:'ap',title:'Euler’s method',text:'Euler takes straight steps along the slope. With h = 1 min: slope at 190 °F is −12, so 178 °F at 1 min; slope −10.8 gives 167.2 °F at 2 min; then 157.48 °F at 3 min. Euler reaches 130 °F at about 6.6 min, a little early, because the curve is concave up.',pause:true,setup:sim=>BioLab.setValues(sim,{euler:true,eh:'m',field:false})}
 ],
 lab:{bio:'<p><b>Question:</b> Does the slice cool the same number of degrees every minute?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Set your guess to 0, 2, 4, 6, 8 and 10 minutes, and record the temperature at each.</li></ol><p>Write one sentence: how does the drop per 2 minutes change?</p>',
  honors:'<p><b>Question:</b> How does the target change the wait?</p><ol><li>Set the target to 150, 140, 130, 120 and 110 °F and record the time for each.</li><li>Then compare the shallow container and the deep pot for leftovers.</li></ol><p>Explain with the slope field why the last degrees take the longest.</p>',
  ap:'<p><b>Question:</b> How good is Euler’s method?</p><ol><li>Turn on Euler. For each step size, record Euler’s time to 130 °F.</li><li>Compare with the exact time from T(t) = 70 + 120e^(−0.1t).</li></ol><p><b>CER:</b> Explain, using concavity, why Euler arrives early, and what happens to the error as h halves.</p>'},
 terms:[
  {t:'Newton’s law of cooling',d:'An object cools at a rate proportional to the difference between its temperature and its surroundings’ temperature.'},
  {t:'Differential equation',d:'An equation that involves a rate of change, like dT/dt = −k(T − T_room).',lvl:'honors'},
  {t:'Slope field',d:'Short segments drawn at many points, each with the slope the differential equation gives there. Solutions follow them.',lvl:'honors'},
  {t:'Separation of variables',d:'Moving every T to one side and every t to the other, then integrating both sides.',lvl:'ap'},
  {t:'Euler’s method',d:'A step-by-step estimate: from (t, T), move h along the tangent line: T_new = T + h × (dT/dt).',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not food-safety advice.</b> It uses Newton’s law of cooling, T(t) = T_room + (T₀ − T_room)e^(−kt), with one temperature for the whole food. Real food cools from the outside in, so the center stays hotter than the surface.</p><p><b>Assumed numbers:</b> the slice starts at 190 °F in a 70 °F kitchen with k = 0.10 per minute, and 130 °F as “ready to eat.” Leftovers start at 150 °F in a 37 °F fridge, with k = 0.02 per minute in a shallow container and 0.006 per minute in a deep pot. These are made-up values chosen to be reasonable, not measurements.</p><p><b>What USDA guidance says:</b> refrigerate leftovers within 2 hours of cooking (1 hour if it is above 90 °F), keep the fridge at 40 °F or below, and divide large amounts into shallow containers so they cool quickly. Hot food can go straight into the fridge. Bacteria grow rapidly between 40 °F and 140 °F. For real food safety, follow USDA and FDA guidance, not this model.</p>'
};
function rrect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
BioLab.register(SIM);
})();
