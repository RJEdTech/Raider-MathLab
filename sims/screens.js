(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,bars,atLeast,fmtNum}=BioLab.h;
const f1=v=>fmtNum(v,1),f0=v=>fmtNum(v,0),fx=v=>String(+(+v).toFixed(1));
/* Aspect ratios: width and height per inch of diagonal. 16:9 uses 16/sqrt(337) and 9/sqrt(337). */
const ASP={'169':{w:16,h:9,name:'16:9'},'43':{w:4,h:3,name:'4:3'}};
const rat=sim=>{const a=ASP[sim.p.asp]||ASP['169'],c=Math.hypot(a.w,a.h);return {w:a.w/c,h:a.h/c,name:a.name};};
const dims=(sim,d)=>{const r=rat(sim);return {w:d*r.w,h:d*r.h};};
const dmax=sim=>{const r=rat(sim);return Math.min(sim.p.W/r.w,sim.p.H/r.h);};
const best=sim=>clamp(Math.floor(dmax(sim)+1e-9),30,100);
const fits=(sim,d)=>{const s=dims(sim,d);return s.w<=sim.p.W+1e-9&&s.h<=sim.p.H+1e-9;};
/* Drone vs. truck: coordinates in miles. Speeds are assumptions for illustration. */
const VD=30,VT=20;
const dx=sim=>Math.abs(sim.p.bx-sim.p.ax),dy=sim=>Math.abs(sim.p.by-sim.p.ay);
const fly=sim=>Math.hypot(dx(sim),dy(sim)),drive=sim=>dx(sim)+dy(sim);
const minsD=sim=>fly(sim)/VD*60,minsT=sim=>drive(sim)/VT*60;
const ptxt=(x,y)=>`(${+x.toFixed(2)}, ${+y.toFixed(2)})`;
const MODEC={tv:['W','H','asp','diag'],drone:['ax','ay','bx','by','guess']};
const MODEM={tv:['sw','sh','fit','dmax'],drone:['fly','drive','save','mid']};
let CUR='tv';
/* Guided, before the gut is locked: show the opening and the student's pick, but not the screen to scale or whether it fits. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
function sync(sim){CUR=sim.p.mode;const ui=sim.ui;if(!ui||!ui.ctlW)return;const other=sim.p.mode==='tv'?'drone':'tv';
 MODEC[other].forEach(id=>{const w=ui.ctlW[id];if(w)w.hidden=true;});
 MODEC[sim.p.mode].forEach(id=>{const w=ui.ctlW[id],c=SIM.controls.find(c=>c.id===id);if(w)w.hidden=!atLeast(c.lvl);});
 if(ui.actB&&ui.actB.best)ui.actB.best.hidden=sim.p.mode!=='tv'||!atLeast('honors');
 MODEM[other].forEach(id=>{const t=ui.tiles&&ui.tiles[id];if(t)t.num.closest('.tile').hidden=true;});
 MODEM[sim.p.mode].forEach(id=>{const t=ui.tiles&&ui.tiles[id],m=SIM.metrics.find(m=>m.id===id);if(t)t.num.closest('.tile').hidden=!atLeast(m.lvl);});}
const HOW={tv:{bio:'Width and height are the legs of a right triangle, and the diagonal is the hypotenuse. A 16:9 screen has legs of 16 and 9 parts, so its diagonal is √(16² + 9²) = √337 ≈ 18.36 parts. Width = diagonal × 16 ÷ 18.36, height = diagonal × 9 ÷ 18.36. The math finds the biggest diagonal that keeps both inside the opening.',
  ap:'Width = d·16/√337 and height = d·9/√337, so the biggest diagonal is the smaller of W·√337/16 and H·√337/9, rounded down to a whole inch.'},
 drone:{bio:'The miles across (Δx) and the miles up (Δy) are the legs of a right triangle, and the drone flies the hypotenuse: √(Δx² + Δy²). The truck has to drive both legs: |Δx| + |Δy|.'}};
const ASK={tv:{bio:'Drag the slider here to the biggest TV size you think fits the opening in the picture. Go by feel, then lock it in.'},
 drone:{bio:'How far does the drone fly, straight from the store to the home? Drag the slider here to your guess by eye, then lock it in.'}};
/* map: 78 px per mile, origin at (80, 415) */
const MS=78,MX=x=>80+x*MS,MY=y=>415-y*MS;

const SIM={
 id:'screens',hash:'screens',apUnit:8,order:1,tab:'Screens and shortcuts',kind:'Simulation',
 card:'Guess whether a TV will fit and how far a drone flies, then let the Pythagorean theorem settle it.',
 title:'Will it fit? Diagonals, distance and shortcuts',
 lede:{bio:'A TV’s size is its diagonal, not its width. The width, the height and the diagonal make a right triangle, so the Pythagorean theorem turns one number on the box into the two numbers you need.',
  honors:'On a coordinate grid, the distance formula is the Pythagorean theorem with the legs read off the coordinates: Δx across and Δy up. A truck on a street grid has to drive both legs; a drone flies the hypotenuse.',
  ap:'For an a:b screen with diagonal d, width = d·a/√(a² + b²) and height = d·b/√(a² + b²). For points (x₁, y₁) and (x₂, y₂), the flight is √((x₂ − x₁)² + (y₂ − y₁)²) and the street route is |x₂ − x₁| + |y₂ − y₁|.'},
 scale:{bio:'TV fit: front view, sizes in inches. Drone: a map of a town with streets every half mile; one grid square is 0.5 mi.'},
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'Your setup',
 controls:[
  {id:'mode',label:'Problem',type:'seg',def:'tv',options:[{v:'tv',l:'TV fit'},{v:'drone',l:'Drone vs. drive'}],onChange(sim){/* a new problem drops old answers, except mid-walkthrough in Guided, where the student's locked gut must survive */
   if(!(sim.guide&&sim.guide.keep)){if(sim.gutS){sim.gutS.g=null;sim.gutS.m=null;}else sim.gutS={g:null,m:null};}sync(sim);BioLab.gutRender(sim);}},
  {id:'W',label:'Opening width',type:'range',min:30,max:90,step:0.5,def:58,unit:' in',noGut:true,help:'The space in the cabinet or on the wall.'},
  {id:'H',label:'Opening height',type:'range',min:20,max:50,step:0.5,def:34,unit:' in',noGut:true},
  {id:'asp',label:'Screen shape (aspect ratio)',type:'seg',def:'169',lvl:'honors',options:[{v:'169',l:'16:9 (TVs today)'},{v:'43',l:'4:3 (older TVs)'}]},
  {id:'diag',label:'Your pick: screen size (diagonal)',type:'range',min:30,max:100,step:1,def:50,unit:' in'},
  {id:'ax',label:'Store: x (miles east)',type:'range',min:0,max:8,step:0.5,def:1,unit:' mi',noGut:true},
  {id:'ay',label:'Store: y (miles north)',type:'range',min:0,max:5,step:0.5,def:1,unit:' mi',noGut:true},
  {id:'bx',label:'Home: x (miles east)',type:'range',min:0,max:8,step:0.5,def:5,unit:' mi',noGut:true,help:'You can also click the map to move the home.'},
  {id:'by',label:'Home: y (miles north)',type:'range',min:0,max:5,step:0.5,def:4,unit:' mi',noGut:true},
  {id:'guess',label:'Your guess: drone flight',type:'range',min:0.5,max:12,step:0.1,def:3,unit:' mi'}
 ],
 actions:[{id:'best',label:'Biggest screen that fits',lvl:'honors',run(sim){if(sim.p.mode!=='tv')BioLab.setValues(sim,{mode:'tv'});BioLab.setValues(sim,{diag:best(sim)});}}],
 init(sim){sync(sim);return {};},step(){},
 onLevel(sim){sync(sim);},
 metrics:[
  {id:'sw',label:'Screen width',unit:'in',d:1,min:0,max:100,get:sim=>dims(sim,sim.p.diag).w},
  {id:'sh',label:'Screen height',unit:'in',d:1,min:0,max:60,get:sim=>dims(sim,sim.p.diag).h},
  {id:'fit',label:'Does it fit?',text:true,get:sim=>{const s=dims(sim,sim.p.diag),ow=s.w-sim.p.W,oh=s.h-sim.p.H;
    if(ow>1e-9&&ow>=oh)return 'No: '+f1(ow)+' in too wide';if(oh>1e-9)return 'No: '+f1(oh)+' in too tall';return 'Yes: '+f1(-ow)+' in to spare across';}},
  {id:'dmax',label:'Biggest diagonal that fits',unit:'in',d:1,lvl:'honors',min:0,max:null,get:dmax},
  {id:'fly',label:'Drone flight (straight line)',unit:'mi',d:2,min:0,max:null,get:fly},
  {id:'drive',label:'Truck route (on streets)',unit:'mi',d:2,min:0,max:null,get:drive},
  {id:'save',label:'Minutes the drone saves',unit:'min',d:1,lvl:'honors',min:0,max:null,get:sim=>minsT(sim)-minsD(sim)},
  {id:'mid',label:'Halfway point (midpoint)',text:true,lvl:'honors',get:sim=>ptxt((sim.p.ax+sim.p.bx)/2,(sim.p.ay+sim.p.by)/2)}
 ],
 graphs:[{id:'g',label:'The numbers',custom:true}],defaultGraph:'g',
 plot(sim,ctx,box){const G=sim.gutS;
  if(sim.p.mode==='drone'){const ax=axes(ctx,box,{xmin:0,xmax:2,ymin:0,ymax:Math.max(10,Math.ceil(minsT(sim)/10)*10),xcats:['Drone (30 mph)','Truck (20 mph)'],yl:'Trip time (min)'});
   bars(ctx,ax,[minsD(sim),minsT(sim)],{colors:[PAL['s2'],PAL['s4']],d:1});return;}
  const r=rat(sim),top=Math.max(60,Math.ceil(Math.max(sim.p.W,sim.p.H)/10)*10+10);
  const ax=axes(ctx,box,{xmin:30,xmax:100,ymin:0,ymax:top,xl:'Screen size, diagonal (in)',yl:'Inches'});
  const line=(fn,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,5]:[]);ctx.beginPath();ctx.moveTo(ax.X(30),ax.Y(fn(30)));ctx.lineTo(ax.X(100),ax.Y(fn(100)));ctx.stroke();ctx.setLineDash([]);};
  line(d=>d*r.w,PAL['s2']);line(d=>d*r.h,PAL['s5']);line(()=>sim.p.W,PAL['s2'],true);line(()=>sim.p.H,PAL['s5'],true);
  txt(ctx,'screen width',ax.X(96),ax.Y(96*r.w)-8,{s:12,w:700,c:PAL['s2'],a:'right'});txt(ctx,'screen height',ax.X(96),ax.Y(96*r.h)+16,{s:12,w:700,c:PAL['s5'],a:'right'});
  txt(ctx,'opening width',ax.X(32),ax.Y(sim.p.W)-6,{s:12,c:PAL['s2']});txt(ctx,'opening height',ax.X(32),ax.Y(sim.p.H)-6,{s:12,c:PAL['s5']});
  const dm=dmax(sim);if(dm<=100){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(dm),box.T);ctx.lineTo(ax.X(dm),box.T+box.H);ctx.stroke();txt(ctx,'biggest fit',ax.X(dm)+5,box.T+box.H-8,{s:12,w:700,c:PAL['s3']});}
  if(G&&G.g&&G.g.mode==='tv'&&G.g.d!==sim.p.diag){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(G.g.d),ax.Y(G.g.d*r.w),6,0,7);ctx.fill();}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.diag),ax.Y(sim.p.diag*r.w),6,0,7);ctx.fill();},
 draw(sim,ctx,vdt,k){CUR=sim.p.mode;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(sim.p.mode==='drone'){drawDrone(sim,ctx,k);return;}
  const d=sim.p.diag,s=dims(sim,d),W=sim.p.W,H=sim.p.H,ok=fits(sim,d);
  if(gutPhase(sim)){const sc=Math.min(520/W,300/H),cx=400,base=392,oL=cx-W*sc/2,oT=base-H*sc;
   ctx.fillStyle=PAL['cv-bench'];rr(ctx,oL-18,oT-18,W*sc+36,H*sc+18+30,8);ctx.fill();
   ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(oL,oT,W*sc,H*sc);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(oL,oT,W*sc,H*sc);
   txt(ctx,'Opening '+fx(W)+' in wide',cx,oT-28,{s:13*k,w:700,c:PAL['cv-ink'],a:'center'});
   txt(ctx,'Opening',oL-26,(oT+base)/2-8,{s:12*k,c:PAL['cv-soft'],a:'right'});txt(ctx,fx(H)+' in tall',oL-26,(oT+base)/2+10,{s:12*k,w:700,a:'right'});
   pill(ctx,'Your pick: a '+f0(d)+'-inch TV',cx,(oT+base)/2-14*k,PAL['s4'],'#111',15*Math.min(k,1.3));
   txt(ctx,'The size is measured corner to corner.',cx,(oT+base)/2+16*k,{s:13*k,c:PAL['cv-soft'],a:'center'});
   txt(ctx,'Lock it in to see it in the cabinet.',cx,(oT+base)/2+36*k,{s:13*k,c:PAL['cv-soft'],a:'center'});return;}
  const sc=Math.min(520/Math.max(W,s.w),300/Math.max(H,s.h)),cx=400,base=392;
  const oL=cx-W*sc/2,oT=base-H*sc,tL=cx-s.w*sc/2,tT=base-s.h*sc;
  /* cabinet */
  ctx.fillStyle=PAL['cv-bench'];rr(ctx,oL-18,oT-18,W*sc+36,H*sc+18+30,8);ctx.fill();
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(oL,oT,W*sc,H*sc);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(oL,oT,W*sc,H*sc);
  /* TV */
  ctx.fillStyle='#1b2230';ctx.globalAlpha=ok?1:.82;ctx.fillRect(tL,tT,s.w*sc,s.h*sc);ctx.globalAlpha=1;
  ctx.strokeStyle=ok?PAL['s3']:PAL['s1'];ctx.lineWidth=3;ctx.strokeRect(tL,tT,s.w*sc,s.h*sc);
  /* diagonal */
  ctx.strokeStyle='#f2b24c';ctx.lineWidth=2.5;ctx.setLineDash([8,5]);ctx.beginPath();ctx.moveTo(tL,base);ctx.lineTo(tL+s.w*sc,tT);ctx.stroke();ctx.setLineDash([]);
  pill(ctx,f0(d)+' in diagonal',cx,(base+tT)/2,'#9a5d00','#fff',13*Math.min(k,1.3));
  /* dimension labels */
  const topY=Math.min(oT-18,tT)-10;
  txt(ctx,'Opening '+fx(W)+' in wide',cx,topY,{s:13*k,w:700,c:PAL['cv-ink'],a:'center'});
  txt(ctx,'Screen '+f1(s.w)+' in wide',cx,base+44,{s:13*k,w:700,c:ok?PAL['s3']:PAL['s1'],a:'center'});
  const lx=Math.min(oL,tL)-26;txt(ctx,'Opening',lx,(oT+base)/2-8,{s:12*k,c:PAL['cv-soft'],a:'right'});txt(ctx,fx(H)+' in tall',lx,(oT+base)/2+10,{s:12*k,w:700,a:'right'});
  const rx=Math.max(oL+W*sc,tL+s.w*sc)+26;txt(ctx,'Screen',rx,(tT+base)/2-8,{s:12*k,c:PAL['cv-soft']});txt(ctx,f1(s.h)+' in tall',rx,(tT+base)/2+10,{s:12*k,w:700,c:ok?PAL['s3']:PAL['s1']});
  if(!ok)txt(ctx,'Does not fit',tL+8,tT+20,{s:13*k,w:700,c:'#ff9aa8'});
  const G=sim.gutS;if(G&&G.g&&G.g.mode==='tv'&&G.g.d!==d){const g=dims(sim,G.g.d);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.strokeRect(cx-g.w*sc/2,base-g.h*sc,g.w*sc,g.h*sc);ctx.setLineDash([]);
   txt(ctx,'Your gut: '+G.g.d+' in',cx-g.w*sc/2+6,base-g.h*sc-6,{s:12*k,w:700,c:PAL['s4']});}},
 onClick(sim,x,y){if(sim.p.mode!=='drone')return;BioLab.setValues(sim,{bx:clamp(Math.round((x-80)/MS*2)/2,0,8),by:clamp(Math.round((415-y)/MS*2)/2,0,5)});},
 narrate(sim){if(gutPhase(sim)&&sim.p.mode==='tv')return `Your pick: a ${f0(sim.p.diag)}-inch TV. The opening is ${fx(sim.p.W)} in wide and ${fx(sim.p.H)} in tall. <b>Will it fit, and how big can you go?</b>`;
  if(sim.p.mode==='drone'){const a=dx(sim),b=dy(sim);
   if(a===0||b===0)return `The home is straight ${a===0?'north or south':'east or west'} of the store, so the drone and the truck travel the same ${f1(fly(sim))} mi. <b>A shortcut needs two legs to cut across.</b>`;
   return `The truck drives ${f1(a)} mi across and ${f1(b)} mi up: ${f1(drive(sim))} mi. The drone flies the hypotenuse, √(${f1(a)}² + ${f1(b)}²) = <b>${f1(fly(sim))} mi</b>, ${Math.round((1-fly(sim)/drive(sim))*100)}% shorter.`;}
  const s=dims(sim,sim.p.diag),dm=dmax(sim);
  if(!fits(sim,sim.p.diag))return `A ${f0(sim.p.diag)}-inch screen is ${f1(s.w)} in wide and ${f1(s.h)} in tall. <b>It does not fit.</b> The biggest that fits here is about ${f1(dm)} in.`;
  return `A ${f0(sim.p.diag)}-inch screen is ${f1(s.w)} in wide and ${f1(s.h)} in tall, so <b>it fits</b>. ${dm-sim.p.diag>=1?`You could go up to about ${f1(dm)} in.`:'That is as big as this opening allows.'}`;},
 gut:{better:'lower',controls:['diag','guess'],
  get ask(){return ASK[CUR];},
  lock(sim){if(sim.p.mode==='drone'){const e=Math.abs(sim.p.guess-fly(sim));return {mode:'drone',v:e,guess:sim.p.guess,label:`${f1(sim.p.guess)} mi`};}
   const d=sim.p.diag,s=dims(sim,d);return {mode:'tv',v:Math.abs(d-best(sim)),d,ok:fits(sim,d),label:`a ${d}-inch screen (${f1(s.w)} by ${f1(s.h)} in)`};},
  solve(sim){if(sim.p.mode==='drone'){const f=fly(sim);sim.p.guess=clamp(+f.toFixed(1),0.5,12);return {mode:'drone',v:0,label:`${f1(f)} mi, from √(${f1(dx(sim))}² + ${f1(dy(sim))}²)`};}
   const b=best(sim),s=dims(sim,b);sim.p.diag=b;return {mode:'tv',v:0,d:b,label:`a ${b}-inch screen (${f1(s.w)} by ${f1(s.h)} in)`};},
  get how(){return HOW[CUR];},
  compare(sim,g,m){if(g.mode==='drone'){const f=fly(sim),save=minsT(sim)-minsD(sim);if(f<0.01)return `The store and the home are at the same spot, so there is no trip to make. Your guess was ${f1(g.guess)} mi too long. Move the home or press Try another one.`;const pct=Math.round(Math.abs(g.guess-f)/f*100);
    const tail=` The truck drives ${f1(drive(sim))} mi on the streets, so at our assumed speeds (drone 30 mph, truck 20 mph) the drone gets there in ${f0(minsD(sim))} min instead of ${f0(minsT(sim))}: <b>${f0(save)} minutes sooner</b>.`;
    if(g.v<0.15)return `Your gut was right on: ${f1(g.guess)} mi against ${f1(f)} mi. Your eye already does the Pythagorean theorem.`+tail;
    const sumd=Math.abs(g.guess-drive(sim))<0.15&&dx(sim)>0&&dy(sim)>0;
    return `You guessed ${f1(g.guess)} mi; the drone really flies <b>${f1(f)} mi</b>, so your gut was ${f1(g.v)} mi ${g.guess>f?'too long':'too short'} (${pct}% off).${sumd?' You added the two legs, which is the truck’s route, not the flight.':''} A battery planned on your guess would ${g.guess<f?'come up short':'carry more charge than it needs'}.`+tail;}
   const b=m.d,bs=dims(sim,b);
   if(g.v===0)return `Your gut was right on: ${b} in is the biggest that fits, with ${f1(sim.p.W-bs.w)} in to spare across. Your eye already knows the diagonal is longer than the width.`;
   if(!g.ok){const s=dims(sim,g.d),ow=s.w-sim.p.W,oh=s.h-sim.p.H;
    return `A ${g.d}-inch screen is ${f1(s.w)} in wide and ${f1(s.h)} in tall: <b>${f1(Math.max(ow,oh))} in too ${ow>=oh?'wide':'tall'}</b> for this opening. That is a TV you would haul back to the store. The math says ${b} in is the biggest that fits, with ${f1(sim.p.W-bs.w)} in to spare across.`;}
   return `Your ${g.d}-inch screen fits, but the math found room for a <b>${b}-inch</b>: ${Math.round(((b/g.d)**2-1)*100)}% more screen area in the same space. Your gut left ${b-g.d} in of diagonal on the table.`;},
  again(sim){if(sim.p.mode==='drone'){const r=()=>Math.round(Math.random()*16)/2,r5=()=>Math.round(Math.random()*10)/2;let a,b,c,d;do{a=r();b=r5();c=r();d=r5();}while(Math.abs(a-c)<1.5||Math.abs(b-d)<1.5);Object.assign(sim.p,{ax:a,ay:b,bx:c,by:d,guess:0.5});return;}
   sim.p.W=Math.round((40+Math.random()*45)*2)/2;sim.p.H=Math.round((sim.p.W*(0.5+Math.random()*0.25))*2)/2;sim.p.H=clamp(sim.p.H,20,50);sim.p.diag=40;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A box says “65-inch TV.” What does the 65 inches measure?',choices:['The width of the screen','The diagonal of the screen, corner to corner','The width plus the height'],correct:1,explain:'TV sizes are diagonals. A 65-inch 16:9 screen is only about 56.7 in wide and 31.9 in tall. The diagonal is the hypotenuse, so it is always longer than the width.'},
  {lvl:'bio',instant:true,q:'The home is 4 mi east and 3 mi north of the store. The truck drives the streets; the drone flies straight. How far does the drone fly?',choices:['7 mi','5 mi','3.5 mi'],correct:1,explain:'The legs are 4 and 3, so the flight is √(4² + 3²) = √25 = 5 mi. The truck drives 4 + 3 = 7 mi. Adding the legs gives the street route, not the shortcut.'},
  {lvl:'honors',instant:true,q:'Two screens are both sold as 65-inch: one is 16:9, the other is 4:3. Which has more screen area?',choices:['The 16:9 screen','The 4:3 screen','They are the same: both are 65 in'],correct:1,explain:'Same diagonal, different triangles. The 4:3 screen is 52 by 39 in, about 2,028 square inches. The 16:9 screen is 56.7 by 31.9 in, about 1,805 square inches. The squarer shape holds more area for the same diagonal.'},
  {lvl:'honors',instant:true,q:'The store is at (1, 1) and the home is at (7, 5). You and a friend at the other end walk straight toward each other at the same speed. Where do you meet?',choices:['(3, 2)','(4, 3)','(6, 4)','(8, 6)'],correct:1,explain:'You meet at the midpoint: ((1 + 7) ÷ 2, (1 + 5) ÷ 2) = (4, 3). Each of you walks half of the √52 ≈ 7.21 mi between the points, about 3.61 mi.'},
  {lvl:'ap',instant:true,q:'A 16:9 monitor is 48 in wide. About what diagonal size is it?',choices:['About 51 in','About 55 in','About 57 in','About 64 in'],correct:1,explain:'Width = d·16/√337, so d = 48·√337/16 = 3√337 ≈ 55.1 in. Check: 55.1 × 9/√337 ≈ 27.0 in tall, and √(48² + 27²) ≈ 55.1.'},
  {lvl:'ap',instant:true,q:'On a street grid, when is the truck’s route the most longer than the drone’s flight?',choices:['When the home is straight east of the store','When the trip goes as far across as it goes up (Δx = Δy)','It is always √2 times longer'],correct:1,explain:'The ratio is (|Δx| + |Δy|) ÷ √(Δx² + Δy²). It is 1 when one leg is 0, and it peaks at √2 ≈ 1.41 when the legs are equal, the 45° diagonal.'}
 ],
 tour:[
  {title:'Sizes are diagonals',text:'This opening in a TV cabinet is 58 in wide and 34 in tall. The box for a 65-inch TV does not tell you its width or height. The 65 is the diagonal, the yellow dashed line, corner to corner.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'tv',W:58,H:34,diag:65,asp:'169'})},
  {title:'A right triangle in every screen',text:'The width, the height and the diagonal make a right triangle. A 16:9 screen has legs of 16 and 9 parts, so its diagonal is √(16² + 9²) = √337 ≈ 18.36 parts. A 65-inch screen is 65 × 16 ÷ 18.36 ≈ 56.7 in wide and 31.9 in tall. It fits, with 1.3 in to spare.',focus:[220,40,360,370],pause:true},
  {title:'Bigger looks fine, until it doesn’t',text:'Try 75 in. The width is 75 × 16 ÷ 18.36 ≈ 65.4 in: 7.4 in too wide for this 58 in opening. That is a return trip to the store.',pause:true,setup:sim=>BioLab.setValues(sim,{diag:75})},
  {title:'The biggest that fits',text:'Work backward: 58 in wide allows a diagonal of 58 × 18.36 ÷ 16 ≈ 66.5 in, and 34 in tall allows 34 × 18.36 ÷ 9 ≈ 69.4 in. The smaller limit wins, so 66 in is the biggest whole size that fits.',pause:true,setup:sim=>BioLab.setValues(sim,{diag:66})},
  {title:'Drone vs. drive',text:'Same triangle, new job. The home is 4 mi east and 3 mi north of the store. The truck must drive the streets: 4 + 3 = 7 mi. The drone flies the hypotenuse: √(4² + 3²) = 5 mi.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'drone',ax:1,ay:1,bx:5,by:4})},
  {lvl:'honors',title:'Meeting halfway',text:'The midpoint averages the coordinates: ((1 + 5) ÷ 2, (1 + 4) ÷ 2) = (3, 2.5). If you and a friend start at the two ends and walk straight toward each other at the same speed, that is where you meet.',pause:true,focus:[[MX(3)-40,MY(2.5)-40,80,80]]},
  {lvl:'ap',title:'The distance formula',text:'For any two points, the legs are Δx = x₂ − x₁ and Δy = y₂ − y₁, so the flight is √(Δx² + Δy²). The street route is |Δx| + |Δy|. The drone saves the most, a factor of √2, when Δx = Δy.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does the biggest TV that fits change with the opening?</p><ol><li>Set the opening to 40, 50, 60 and 70 in wide, keeping it 40 in tall.</li><li>For each, find the biggest screen size that fits. Record a trial.</li><li>Graph <b>Trials</b>: opening width on x, screen size on y.</li></ol><p>Write one sentence: about how many inches of diagonal does each extra inch of width buy you?</p>',
  honors:'<p><b>Question:</b> How much shorter is the drone than the truck?</p><ol><li>Keep the store at (0, 0). Put the home at (4, 0), (4, 1), (4, 2), (4, 4).</li><li>Record the flight, the truck route and the minutes saved each time.</li></ol><p>Which trip gives the drone the biggest advantage, and why?</p>',
  ap:'<p><b>Question:</b> Which limit, width or height, decides the biggest screen?</p><ol><li>Show that a 16:9 screen is limited by width when the opening’s width ÷ height is less than 16/9.</li><li>Test three openings on each side of that ratio.</li></ol><p><b>CER:</b> Claim, evidence from your trials, reasoning from the formulas.</p>'},
 terms:[
  {t:'Pythagorean theorem',d:'In a right triangle with legs a and b and hypotenuse c, a² + b² = c².'},
  {t:'Hypotenuse',d:'The side across from the right angle, always the longest side. On a screen it is the diagonal.'},
  {t:'Aspect ratio',d:'Width to height. 16:9 means 16 units wide for every 9 units tall.',lvl:'honors'},
  {t:'Distance formula',d:'d = √((x₂ − x₁)² + (y₂ − y₁)²): the Pythagorean theorem on a coordinate grid.',lvl:'honors'},
  {t:'Midpoint',d:'((x₁ + x₂)/2, (y₁ + y₂)/2): the point halfway between two points.',lvl:'honors'},
  {t:'Taxicab distance',d:'|x₂ − x₁| + |y₂ − y₁|: the distance when you can only travel along grid lines, like a car on city streets.',lvl:'ap'}
 ],
 about:'<p><b>TV fit:</b> width = d·a/√(a² + b²) and height = d·b/√(a² + b²) for an a:b screen with diagonal d. This compares the screen only. A real TV’s body and stand are a little bigger than its screen, so check the outside dimensions on the spec sheet before you buy. Leave room for air to flow around it, too.</p><p><b>Drone vs. drive:</b> the town is a perfect grid of streets, and the truck drives only along them. The drone flies in a straight line. The speeds (drone 30 mph, truck 20 mph average with stops) are assumptions for illustration, not measured values. Real drones also have to climb, avoid no-fly areas and handle wind, and real streets are not perfect grids.</p>'
};
BioLab.register(SIM);
function drawDrone(sim,ctx,k){const G=sim.gutS;
 for(let x=0;x<=8;x+=0.5){ctx.strokeStyle=PAL['line'];ctx.lineWidth=x%1?1:2;ctx.beginPath();ctx.moveTo(MX(x),MY(0));ctx.lineTo(MX(x),MY(5));ctx.stroke();}
 for(let y=0;y<=5;y+=0.5){ctx.strokeStyle=PAL['line'];ctx.lineWidth=y%1?1:2;ctx.beginPath();ctx.moveTo(MX(0),MY(y));ctx.lineTo(MX(8),MY(y));ctx.stroke();}
 for(let x=0;x<=8;x+=2)txt(ctx,x===8?'8 mi':String(x),MX(x),MY(5)-8,{s:12*k,c:PAL['cv-soft'],a:'center'});
 for(let y=1;y<=5;y+=2)txt(ctx,String(y),MX(0)-10,MY(y)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});
 const A=[MX(sim.p.ax),MY(sim.p.ay)],B=[MX(sim.p.bx),MY(sim.p.by)],C=[B[0],A[1]];
 if(G&&G.g&&G.g.mode==='drone'){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(A[0],A[1],G.g.guess*MS,0,7);ctx.stroke();ctx.setLineDash([]);}
 /* truck route along the streets */
 ctx.strokeStyle=PAL['s4'];ctx.lineWidth=5;ctx.globalAlpha=.85;ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(C[0],C[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();ctx.globalAlpha=1;
 /* drone */
 ctx.strokeStyle=PAL['s2'];ctx.lineWidth=3;ctx.setLineDash([10,6]);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();ctx.setLineDash([]);
 if(dx(sim)>0&&dy(sim)>0){const sx=Math.sign(A[0]-C[0])*12,sy=Math.sign(B[1]-C[1])*12;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(C[0]+sx,C[1]);ctx.lineTo(C[0]+sx,C[1]+sy);ctx.lineTo(C[0],C[1]+sy);ctx.stroke();
  txt(ctx,'Δx = '+f1(dx(sim))+' mi',(A[0]+C[0])/2,C[1]+(B[1]<C[1]?22:-10)*Math.min(k,1.3),{s:12*k,w:700,c:PAL['s4'],a:'center'});
  txt(ctx,'Δy = '+f1(dy(sim))+' mi',C[0]+(A[0]<C[0]?10:-10),(B[1]+C[1])/2+4,{s:12*k,w:700,c:PAL['s4'],a:A[0]<C[0]?'left':'right'});}
 const mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2,kk=Math.min(k,1.3);
 if(fly(sim)>0){const t=fly(sim)>2.5?0.3:0.5,px=A[0]+(B[0]-A[0])*t,py=A[1]+(B[1]-A[1])*t-(fly(sim)>2.5?0:26*kk);pill(ctx,'Drone '+f1(fly(sim))+' mi',clamp(px,80,720),py,PAL['s2'],'#fff',13*kk);}
 if(atLeast('honors')&&fly(sim)>2.5){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.moveTo(mx,my-7);ctx.lineTo(mx+7,my);ctx.lineTo(mx,my+7);ctx.lineTo(mx-7,my);ctx.closePath();ctx.fill();
  const upR=(B[0]-A[0])*(B[1]-A[1])<0;txt(ctx,'midpoint '+ptxt((sim.p.ax+sim.p.bx)/2,(sim.p.ay+sim.p.by)/2),clamp(mx+12,0,560),upR?my+22*kk:my-12,{s:12*k,w:700,c:PAL['s3']});}
 const pin=(p,col,lab,up)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(p[0],p[1],9,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
  txt(ctx,lab,clamp(p[0],70,730),p[1]+(up?-16:28)*kk,{s:13*k,w:700,c:col,a:'center'});};
 const hiB=sim.p.by>=sim.p.ay,upFor=(y,isHigh)=>isHigh?y<4.6:y<0.6;
 pin(A,PAL['s5'],'Store '+ptxt(sim.p.ax,sim.p.ay),upFor(sim.p.ay,!hiB||sim.p.ay===sim.p.by));pin(B,PAL['rj'],'Home '+ptxt(sim.p.bx,sim.p.by),upFor(sim.p.by,hiB));
}
})();
