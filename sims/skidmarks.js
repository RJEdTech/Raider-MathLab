(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,legend,atLeast,niceStep}=BioLab.h;
/* Stopping distance = reaction distance + braking distance.
   Reaction: v (ft/s) × t, with v = 1.4667 × S (S in mph). Braking: d = S²/(30f) ft, f = drag factor.
   Skid marks: S = √(30 d f). */
const SURF={dry:{f:0.7,l:'Dry pavement'},wet:{f:0.5,l:'Wet pavement'},snow:{f:0.3,l:'Packed snow'}};
const FPS=5280/3600,BALL=120;
const fOf=sim=>SURF[sim.p.surf].f;
const rt=sim=>atLeast('honors')?sim.p.react:1.5;
const reactD=(S,t)=>S*FPS*t, brakeD=(S,f)=>S*S/(30*f);
const totalD=sim=>reactD(sim.p.speed,rt(sim))+brakeD(sim.p.speed,fOf(sim));
const skidS=sim=>Math.sqrt(30*sim.p.skid*fOf(sim));
const isStop=sim=>sim.p.mode==='stop';
/* speed still left after covering D ft */
function speedAt(S,t,f,D){const r=reactD(S,t);if(D<=r)return S;return Math.sqrt(Math.max(0,S*S-30*f*(D-r)));}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).m));
function vis(sim){const W=sim.ui&&sim.ui.ctlW;if(!W)return;SIM.controls.forEach(c=>{if(!c.only||!W[c.id])return;W[c.id].hidden=!atLeast(c.lvl||'bio')||c.only!==sim.p.mode;});}
const n0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>v.toFixed(1);

const SIM={
 id:'skidmarks',hash:'skidmarks',apUnit:4,order:2,tab:'Stopping distance',kind:'Simulation',
 card:'Guess how far a car needs to stop, then see why doubling the speed far more than doubles the distance, and how square roots read speed from skid marks.',
 title:'How far to stop?',
 lede:{bio:'Stopping takes two parts: the distance you travel while you react, and the distance you skid while braking. The first grows with speed. The second grows with the square of speed, so double the speed means four times the braking.',
  honors:'Braking distance is d = S²/(30f). Run it backward and a square root gives the speed from the skid marks: S = √(30df).',
  ap:'Total stopping distance D(S) = 1.467tS + S²/(30f) is a quadratic in the speed. Solving D(S) = distance available for S tells you the fastest safe speed.'},
 scale:'Seen from above. Distances in feet; speeds in miles per hour (mph).',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The road',
 controls:[
  {id:'mode',label:'Question',type:'seg',def:'stop',options:[{v:'stop',l:'How far to stop?'},{v:'skid',l:'Speed from skid marks',lvl:'honors'}],onChange:vis},
  {id:'speed',label:'Speed',type:'range',min:10,max:70,step:5,def:40,unit:' mph',noGut:true,only:'stop'},
  {id:'surf',label:'Road surface',type:'seg',def:'dry',options:[{v:'dry',l:'Dry'},{v:'wet',l:'Wet'},{v:'snow',l:'Packed snow'}],help:'Drag factor f: dry 0.7, wet 0.5, packed snow 0.3. Typical values for illustration; real roads and tires vary.'},
  {id:'react',label:'Reaction time',type:'range',min:0.5,max:2.5,step:0.1,def:1.5,unit:' s',lvl:'honors',noGut:true,only:'stop',help:'Time from seeing the danger to pressing the brake. 1.5 s is a common assumption; a distracted driver takes longer.'},
  {id:'gstop',label:'Your guess: feet to stop, from seeing the ball',type:'range',min:0,max:850,step:5,def:80,unit:' ft',only:'stop'},
  {id:'skid',label:'Length of the skid marks',type:'range',min:10,max:250,step:5,def:60,unit:' ft',noGut:true,only:'skid'},
  {id:'gspd',label:'Your guess: speed when the brakes locked',type:'range',min:5,max:80,step:1,def:25,unit:' mph',only:'skid'},
  {id:'show',label:'Show the math',type:'toggle',def:false,help:'Leave it off until you have locked in your guess.'}
 ],
 onLevel(sim){vis(sim);const w=sim.ui.ctlW&&sim.ui.ctlW.surf,h=w&&w.querySelector('.help');if(h)h.textContent=atLeast('honors')?'Drag factor f: dry 0.7, wet 0.5, packed snow 0.3. Typical values for illustration; real roads and tires vary.':'A slicker road lets the tires slide farther before the car stops.';
  const g=sim.ui.ctlW&&sim.ui.ctlW.gstop,L=g&&g.querySelector('.lbl,label');if(L)L.textContent=atLeast('honors')?'Your guess: total distance to stop':'Your guess: feet to stop, from seeing the ball';},
 init(){return {};},step(){},
 metrics:[
  {id:'react',label:'Reaction distance',unit:'ft',d:1,min:0,max:null,get:sim=>shown(sim)&&isStop(sim)?reactD(sim.p.speed,rt(sim)):null},
  {id:'brake',label:'Braking distance',unit:'ft',d:1,min:0,max:null,get:sim=>shown(sim)&&isStop(sim)?brakeD(sim.p.speed,fOf(sim)):null},
  {id:'total',label:'Total stopping distance',unit:'ft',d:1,min:0,max:null,get:sim=>shown(sim)&&isStop(sim)?totalD(sim):null},
  {id:'skidspd',label:'Speed from the skid marks',unit:'mph',d:1,min:0,max:null,lvl:'honors',get:sim=>shown(sim)&&!isStop(sim)?skidS(sim):null},
  {id:'f',label:'Drag factor f',unit:'',d:1,min:0,max:1,lvl:'honors',get:fOf}
 ],
 graphs:[{id:'curve',label:'Distance vs. speed',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const f=fOf(sim),t=rt(sim),Gs=GS(sim),sh=shown(sim);
  if(isStop(sim)){const top=Math.ceil((reactD(70,t)+brakeD(70,f))*1.08/50)*50;
   const ax=axes(ctx,box,{xmin:0,xmax:70,ymin:0,ymax:top,xl:'Speed (mph)',yl:'Distance (ft)'});
   if(!sh){txt(ctx,'Lock in your guess, or turn on Show the math',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
   const line=(fn,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,4]:[]);ctx.beginPath();for(let S=0;S<=70;S+=1){S?ctx.lineTo(ax.X(S),ax.Y(fn(S))):ctx.moveTo(ax.X(S),ax.Y(fn(S)));}ctx.stroke();ctx.setLineDash([]);};
   line(S=>reactD(S,t),PAL['s2'],true);line(S=>brakeD(S,f),PAL['s1'],true);line(S=>reactD(S,t)+brakeD(S,f),PAL['g-line'],false);
   legend(ctx,box.L+10,box.T+8,[{label:'Reaction',color:PAL['s2'],dash:true},{label:'Braking',color:PAL['s1'],dash:true},{label:'Total',color:PAL['g-line']}]);
   const S=sim.p.speed,D=totalD(sim);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(S),ax.Y(D),6,0,7);ctx.fill();txt(ctx,'You',ax.X(S)-10,ax.Y(D)-10,{s:12,w:700,c:PAL['rj'],a:'right'});
   if(Gs&&Gs.g&&Gs.g.mode==='stop'&&Gs.g.S===S){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(S),ax.Y(Math.min(Gs.g.ans,top)),6,0,7);ctx.fill();txt(ctx,'Your gut',ax.X(S)+10,ax.Y(Math.min(Gs.g.ans,top))+16,{s:12,w:700,c:PAL['s4']});}
  }else{const ax=axes(ctx,box,{xmin:0,xmax:250,ymin:0,ymax:80,xl:'Skid marks (ft)',yl:'Speed (mph)'});
   if(!sh){txt(ctx,'Lock in your guess, or turn on Show the math',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
   ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let d=0;d<=250;d+=2){const y=Math.sqrt(30*d*f);d?ctx.lineTo(ax.X(d),ax.Y(y)):ctx.moveTo(ax.X(d),ax.Y(y));}ctx.stroke();
   legend(ctx,box.L+10,box.T+8,[{label:'S = √(30 × d × '+f+')',color:PAL['g-line']}]);
   const d=sim.p.skid;ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(d),ax.Y(skidS(sim)),6,0,7);ctx.fill();txt(ctx,'You',ax.X(d)-10,ax.Y(skidS(sim))-10,{s:12,w:700,c:PAL['rj'],a:'right'});
   if(Gs&&Gs.g&&Gs.g.mode==='skid'&&Gs.g.d===d){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(d),ax.Y(Gs.g.ans),6,0,7);ctx.fill();txt(ctx,'Your gut',ax.X(d)+10,ax.Y(Gs.g.ans)+16,{s:12,w:700,c:PAL['s4']});}}},
 draw(sim,ctx,vdt,k){const sh=shown(sim),stop=isStop(sim),f=fOf(sim),Gs=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=110,R=770,RT=150,RB=250;
  const S=sim.p.speed,t=rt(sim),rd=reactD(S,t),bd=brakeD(S,f),D=rd+bd;
  const gutG=Gs&&Gs.g&&Gs.g.mode===sim.p.mode&&(stop?Gs.g.S===S:Gs.g.d===sim.p.skid)?Gs.g.ans:null,g=gutG!==null?gutG:stop?sim.p.gstop:sim.p.gspd,gw=gutG!==null?'Your gut':'Your guess';
  const span=stop?Math.max(sh?D:0,g,BALL*1.25)*1.08:Math.max(sim.p.skid*1.3,60);
  const st=niceStep(span,6),mx=Math.ceil(span/st)*st,X=v=>L+(R-L)*v/mx;
  /* header */
  txt(ctx,stop?`${S} mph, ${SURF[sim.p.surf].l.toLowerCase()}${atLeast('honors')?`, ${f1(t)} s to react`:''}`:`${sim.p.skid} ft of skid marks on ${SURF[sim.p.surf].l.toLowerCase()}`,24,34,{s:16*k,w:800});
  /* road */
  ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(0,RT,800,RB-RT);
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;[RT,RB].forEach(y=>{ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(800,y);ctx.stroke();});
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([18,14]);ctx.beginPath();ctx.moveTo(0,(RT+RB)/2);ctx.lineTo(800,(RT+RB)/2);ctx.stroke();ctx.setLineDash([]);
  /* ruler */
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,RB+18);ctx.lineTo(R,RB+18);ctx.stroke();
  for(let v=0;v<=mx+1e-9;v+=st){ctx.beginPath();ctx.moveTo(X(v),RB+12);ctx.lineTo(X(v),RB+24);ctx.stroke();txt(ctx,n0(v),X(v),RB+24+14*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'feet',R,RB+24+30*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  const car=(x,col,ghost)=>{ctx.globalAlpha=ghost?.45:1;ctx.fillStyle=col;rr(ctx,x-56,(RT+RB)/2+8,56,30,7);ctx.fill();ctx.fillStyle='rgba(255,255,255,.65)';ctx.fillRect(x-20,(RT+RB)/2+12,10,22);ctx.globalAlpha=1;};
  const yL=(RT+RB)/2+23;
  if(stop){
   /* reaction and braking segments */
   if(sh){ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.35;ctx.fillRect(L,yL-16,X(rd)-L,32);ctx.fillStyle=PAL['s1'];ctx.fillRect(X(rd),yL-16,X(D)-X(rd),32);ctx.globalAlpha=1;
    ctx.strokeStyle='#222';ctx.lineWidth=4;ctx.globalAlpha=.6;[yL-10,yL+10].forEach(y=>{ctx.beginPath();ctx.moveTo(X(rd),y);ctx.lineTo(X(D)-56,y);ctx.stroke();});ctx.globalAlpha=1;
    car(L,PAL['s2'],true);car(X(D),PAL['rj'],false);
    txt(ctx,`Reacting: ${n0(rd)} ft`,L,RB+70+12*k,{s:14*k,w:700,c:PAL['s2']});
    txt(ctx,`Braking: ${n0(bd)} ft`,L,RB+70+34*k,{s:14*k,w:700,c:PAL['s1']});
    txt(ctx,`Total: ${n0(D)} ft`,L,RB+70+58*k,{s:16*k,w:800,c:PAL['cv-ink']});}
   else car(L,PAL['rj'],false);
   /* the ball from the question, 120 ft ahead */
   if(BALL<=mx){const bx=X(BALL),by=RT+22;ctx.fillStyle='#d9771f';ctx.beginPath();ctx.arc(bx,by,9,0,7);ctx.fill();ctx.strokeStyle='#5a2d0c';ctx.lineWidth=1.2;ctx.stroke();
    const bl=`Ball: ${BALL} ft`,right=Math.abs(X(g)-bx)>110*k||X(g)<bx;txt(ctx,bl,right?bx+14:bx-14,by+5,{s:13*k,w:700,c:PAL['cv-ink'],a:right?'left':'right'});}
   /* gut line */
   const gx=X(g);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,RT-8);ctx.lineTo(gx,RB+4);ctx.stroke();
   txt(ctx,`${gw}: ${n0(g)} ft`,clamp(gx,L+70,R-70),RT-16,{s:14*k,w:700,c:PAL['s4'],a:'center'});
   if(sh&&g<D-2){const v=speedAt(S,t,f,g);txt(ctx,`At ${gutG!==null?'your gut spot':'your guess'} you are still going ${n0(v)} mph`,R,RB+70+58*k,{s:14*k,w:700,c:PAL['s1'],a:'right'});}
   else if(sh&&g>=D-2)txt(ctx,gutG!==null?'You stop before your gut spot':'You stop before your guess',R,RB+70+58*k,{s:14*k,w:700,c:PAL['s3'],a:'right'});
  }else{const d=sim.p.skid;
   ctx.strokeStyle='#222';ctx.lineWidth=4;ctx.globalAlpha=.7;[yL-10,yL+10].forEach(y=>{ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(X(d)-56,y);ctx.stroke();});ctx.globalAlpha=1;car(X(d),PAL['rj'],false);
   txt(ctx,`Skid marks: ${d} ft`,(L+X(d))/2,RT-16,{s:14*k,w:700,c:PAL['cv-ink'],a:'center'});
   txt(ctx,`${gw}: ${n0(g)} mph`,L,RB+70+12*k,{s:15*k,w:700,c:PAL['s4']});
   if(sh){const s=skidS(sim);txt(ctx,`The math: √(30 × ${d} × ${f}) = ${f1(s)} mph`,L,RB+70+38*k,{s:15*k,w:800,c:PAL['s3']});
    txt(ctx,`At ${n0(g)} mph the marks would be only ${n0(brakeD(g,f))} ft`,L,RB+70+62*k,{s:13*k,c:PAL['cv-soft']});}}},
 narrate(sim){const f=fOf(sim);
  if(isStop(sim)){const S=sim.p.speed,t=rt(sim);
   if(!shown(sim))return `You are driving ${S} mph and something appears ahead. <b>How far do you travel before you stop?</b> Set your guess, then lock it in.`;
   const rd=reactD(S,t),bd=brakeD(S,f);return `At ${S} mph you cover ${n0(rd)} ft before your foot even reaches the brake, then ${n0(bd)} ft more while braking. ${S<=35?`<b>Double the speed and the braking distance is four times as long:</b> ${n0(brakeD(2*S,f))} ft at ${2*S} mph.`:`<b>Half the speed means a quarter of the braking:</b> ${n0(brakeD(S/2,f))} ft at ${S/2} mph.`}`;}
  if(!shown(sim))return `The skid marks are ${sim.p.skid} ft long. <b>How fast was the car going when the brakes locked?</b> Set your guess, then lock it in.`;
  return `<b>${f1(skidS(sim))} mph.</b> Braking distance grows with the square of speed, so speed is the square root: S = √(30 × ${sim.p.skid} × ${f}). Twice the skid length means only about 1.41 times the speed.`;},
 gut:{better:'lower',controls:['gstop','gspd'],
  ask:{bio:'From the moment you see the ball, how many feet does the car travel before it stops? Drag the slider here; the orange line on the road moves with it. Then lock it in.',honors:'Drag the <b>Your guess</b> slider here by feel, then lock it in. Leave <b>Show the math</b> off.'},
  lock(sim){if(isStop(sim)){const D=totalD(sim),g=sim.p.gstop;return {v:Math.abs(g-D),mode:'stop',S:sim.p.speed,ans:g,label:`${n0(g)} ft to stop`};}
   const s=skidS(sim),g=sim.p.gspd;return {v:Math.abs(g-s),mode:'skid',d:sim.p.skid,ans:g,label:`${n0(g)} mph`};},
  solve(sim){sim.p.show=true;if(isStop(sim)){const D=totalD(sim);sim.p.gstop=D;return {v:0,mode:'stop',S:sim.p.speed,ans:D,label:`${n0(D)} ft to stop`};}
   const s=skidS(sim);sim.p.gspd=s;return {v:0,mode:'skid',d:sim.p.skid,ans:s,label:`${f1(s)} mph`};},
  how:{bio:'Add the two parts. Reacting: the car keeps going at full speed for your reaction time. Braking: the distance grows with the square of the speed, d = S²/(30f).',
   honors:'Total = 1.467 × S × t + S²/(30f). For skid marks, undo the square: S = √(30df).',
   ap:'D(S) is linear plus quadratic in S. Inverting the braking part needs a square root; inverting the total needs the quadratic formula.'},
  compare(sim,g,m){const f=fOf(sim);
   if(g.mode!==sim.p.mode)return 'You switched questions after locking in. Press Try another one to start fresh.';
   if(g.mode==='stop'){const D=m.ans,S=g.S,t=rt(sim),d=g.ans-D,ball=D>BALL?` The ball is ${BALL} ft ahead: you would reach it still going about <b>${n0(speedAt(S,t,f,BALL))} mph</b>.`:` The ball is ${BALL} ft ahead, so you stop in time.`;
    if(Math.abs(d)<=Math.max(3,0.03*D))return `Your gut was right on: about ${n0(D)} ft, reaction distance included. The math shows where that number comes from: ${n0(reactD(S,t))} ft reacting plus ${n0(brakeD(S,f))} ft braking.`;
    if(d<0){const v=speedAt(S,t,f,g.ans);return `You guessed ${n0(g.ans)} ft, but the car needs <b>${n0(D)} ft</b>: <b>${n0(-d)} ft more</b> than you thought. At the spot where you expected to stop, you would still be going <b>${n0(v)} mph</b>.${ball}`;}
    return `You guessed ${n0(g.ans)} ft; the car needs only <b>${n0(D)} ft</b>, ${n0(d)} ft less. Overestimating is the safe direction, but now you know the real number: ${n0(reactD(S,t))} ft reacting and ${n0(brakeD(S,f))} ft braking.${ball}`;}
   const s=m.ans,d=g.ans-s;
   if(Math.abs(d)<1)return `Your gut was right on: about ${f1(s)} mph.`;
   return `You guessed ${n0(g.ans)} mph; the skid marks say <b>${f1(s)} mph</b>, ${f1(Math.abs(d))} mph ${d<0?'faster':'slower'} than your guess. At ${n0(g.ans)} mph the marks would be ${n0(brakeD(g.ans,f))} ft, not ${g.d} ft: <b>skid length grows with the square of the speed</b>.`;},
  again(sim){const sk=atLeast('honors')&&Math.random()<0.4;sim.p.mode=sk?'skid':'stop';const ks=Object.keys(SURF);sim.p.surf=ks[Math.floor(Math.random()*3)];
   if(sk){sim.p.skid=5*(4+Math.floor(Math.random()*35));sim.p.gspd=25;}else{sim.p.speed=5*(3+Math.floor(Math.random()*12));sim.p.gstop=80;}sim.p.show=false;vis(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'On dry pavement a car going 20 mph needs about 19 ft of braking distance. About how much does it need at 40 mph?',choices:['38 ft','57 ft','76 ft','19 ft'],correct:2,explain:'Braking distance grows with the square of the speed. Twice the speed means 2² = 4 times the distance: 4 × 19 ≈ 76 ft (exactly 1600/21 ≈ 76.2 ft).'},
  {lvl:'bio',instant:true,q:'At 40 mph on dry pavement, with 1.5 s to react, about how far does the car travel from the moment you see danger until it stops?',choices:['76 ft','88 ft','164 ft','250 ft'],correct:2,explain:'Reacting: 40 mph is about 58.7 ft per second, so 1.5 s covers 88 ft. Braking: 76 ft more. Total: about 164 ft, more than half a football field.'},
  {lvl:'honors',instant:true,q:'Skid marks are 75 ft long on dry pavement (f = 0.7). About how fast was the car going when the brakes locked?',choices:['39.7 mph','52.5 mph','28 mph','1,575 mph'],correct:0,explain:'S = √(30 × 75 × 0.7) = √1575 ≈ 39.7 mph. 1,575 is what you get if you forget the square root.'},
  {lvl:'honors',instant:true,q:'One car leaves skid marks twice as long as another on the same road. How did their speeds compare?',choices:['Twice as fast','About 1.41 times as fast','4 times as fast'],correct:1,explain:'S = √(30df), so doubling d multiplies S by √2 ≈ 1.41. The square root undoes the square: it takes 4 times the skid length to mean twice the speed.'},
  {lvl:'ap',instant:true,q:'Solve the braking formula d = S²/(30f) for S.',choices:['S = √(30fd)','S = 30fd²','S = √(d/(30f))','S = (30fd)/2'],correct:0,explain:'Multiply both sides by 30f: S² = 30fd. Take the positive square root (speed is positive): S = √(30fd).'},
  {lvl:'ap',instant:true,q:'A school zone drops the limit from 35 mph to 20 mph. With a 1.5 s reaction on dry pavement, about how much shorter is the total stopping distance?',choices:['About 72 ft','About 22 ft','About 44 ft','About 135 ft'],correct:0,explain:'At 35 mph: 77 ft reacting + 58.3 ft braking ≈ 135.3 ft. At 20 mph: 44 ft + 19.0 ft ≈ 63.0 ft. The difference is about 72 ft: more than four car lengths.'}
 ],
 tour:[
  {title:'The situation',text:'You are driving 40 mph on a dry road and something appears ahead. The orange line is a guess of 80 ft to stop. Is that enough?',pause:true,setup:sim=>{BioLab.setValues(sim,{mode:'stop',speed:40,surf:'dry',react:1.5,gstop:80,show:false});vis(sim);}},
  {title:'Part 1: reacting',text:'Before your foot even reaches the brake, about 1.5 s goes by. At 40 mph (58.7 ft every second) that is 88 ft, already past the 80 ft guess.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'Part 2: braking',text:'Then the car brakes for another 76 ft. Total: 164 ft, about twice the guess. At the guessed spot the car is still going 40 mph.',pause:true},
  {title:'Half the speed',text:'At 20 mph: 44 ft reacting and only 19 ft braking, 63 ft in all. Half the speed cut the braking distance to a quarter.',pause:true,setup:sim=>BioLab.setValues(sim,{speed:20,gstop:63})},
  {title:'Wet road',text:{bio:'Back to 40 mph, but on a wet road, where the tires grip less. Braking grows to 107 ft, and the total to about 195 ft.',honors:'Back to 40 mph, but on a wet road (f = 0.5). Braking grows to 107 ft, and the total to about 195 ft.'},pause:true,setup:sim=>BioLab.setValues(sim,{speed:40,surf:'wet',gstop:195})},
  {title:'The graph',text:'The graph shows why. Reaction distance is a straight line in the speed. Braking distance is a parabola, S²/(30f), so it pulls away fast at high speeds.',pause:true,setup:sim=>BioLab.setValues(sim,{surf:'dry',gstop:164})},
  {lvl:'honors',title:'Read the skid marks',text:'Crash investigators run it backward. 60 ft of skid marks on dry pavement: S = √(30 × 60 × 0.7) = √1260 ≈ 35.5 mph.',pause:true,setup:sim=>{BioLab.setValues(sim,{mode:'skid',skid:60,surf:'dry',gspd:35,show:true});vis(sim);}},
  {lvl:'ap',title:'The square root',text:'Double the skid marks to 120 ft and the speed is only √2 ≈ 1.41 times as large: √2520 ≈ 50.2 mph.',pause:true,setup:sim=>BioLab.setValues(sim,{skid:120,gspd:50})}
 ],
 onTourExit(sim){vis(sim);},
 lab:{bio:'<p><b>Question:</b> How does stopping distance change with speed?</p><ol><li>Turn on <b>Show the math</b> and choose dry pavement.</li><li>Record trials at 10, 20, 30, 40, 50, 60 and 70 mph.</li><li>Graph <b>Trials</b> with speed on x and braking distance on y, then total distance on y.</li></ol><p>Write one sentence: why do school zones have low speed limits?</p>',
  honors:'<p><b>Question:</b> How do reaction time and road surface compare?</p><ol><li>At 40 mph, record the total distance for reaction times of 0.5, 1.5 and 2.5 s.</li><li>Then, at 1.5 s, record it on dry, wet and snowy roads.</li></ol><p>Explain which part of the distance each one changes, and why.</p>',
  ap:'<p><b>Question:</b> What is the fastest speed that still stops within a given distance?</p><ol><li>Pick a distance, say 150 ft, and a surface.</li><li>Solve 1.467tS + S²/(30f) = 150 with the quadratic formula.</li><li>Check your answer by setting the speed near it.</li></ol><p><b>CER:</b> Claim, evidence and reasoning about why the answer is not proportional to the distance.</p>'},
 terms:[
  {t:'Reaction distance',d:'How far the car travels at full speed between seeing danger and pressing the brake. Speed × reaction time.'},
  {t:'Braking distance',d:'How far the car skids or slows after the brakes go on. It grows with the square of the speed.'},
  {t:'Drag factor (f)',d:'How grippy the road is, from about 0.7 on dry pavement down to much less on snow or ice.',lvl:'honors'},
  {t:'Square root',d:'The inverse of squaring. If d grows with S², then S grows with √d.',lvl:'honors'},
  {t:'Radical equation',d:'An equation with the variable under a root, like S = √(30df).',lvl:'ap'}
 ],
 about:'<p>Reaction distance = 1.467 × S × t (S in mph, t in seconds; 1 mph = 1.467 ft/s). Braking distance = S²/(30f) feet, the standard formula used in crash reconstruction, and run backward as S = √(30df).</p><p>The reaction time (1.5 s unless you change it at Closer look) and the drag factors (dry 0.7, wet 0.5, packed snow 0.3) are typical values for illustration. Real values depend on the driver, the tires, the brakes and the road. Cars with anti-lock brakes often leave lighter marks than locked wheels do. This is a simplified model for learning, not a tool for judging a real crash.</p>'
};
BioLab.register(SIM);
})();
