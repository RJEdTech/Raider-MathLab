(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,atLeast,fmtNum}=BioLab.h;
const f1=v=>fmtNum(v,1),fx=v=>String(+(+v).toFixed(1)),com=v=>Math.round(v).toLocaleString('en-US');
const DEG=180/Math.PI;
/* ADA ramp rules used here: running slope no steeper than 1:12; one run rises at most 30 in; landings at least 60 in (5 ft) long. */
const runs=sim=>Math.max(1,Math.ceil(sim.p.rise/30-1e-9));
const landings=sim=>runs(sim)-1;
const need=sim=>sim.p.rise+5*landings(sim);                 /* ft: 1 ft of run per inch of rise, plus 5 ft per landing */
const slopeRun=sim=>Math.max(0.5,sim.p.run-5*landings(sim)); /* ft of sloped ramp in the student's plan */
const rSlope=sim=>sim.p.rise/(slopeRun(sim)*12);            /* rise ÷ run */
/* roof */
const rafter=sim=>sim.p.span/2*Math.hypot(1,sim.p.pitch/12);
const board=ft=>Math.max(8,Math.ceil(ft/2-1e-9)*2);
/* road: distance measured along the road */
const drop=sim=>sim.p.dist*5280*Math.sin(Math.atan(sim.p.grade/100));
const MODEC={ramp:['rise','run'],roof:['span','pitch','raft'],road:['grade','dist','drop']};
const MODEM={ramp:['rpct','rdeg','rlegal','rneed'],roof:['angle','rafter','boards'],road:['gdeg','gdrop']};
let CUR='ramp';
function sync(sim){CUR=sim.p.mode;const ui=sim.ui;if(!ui||!ui.ctlW)return;
 const pc=SIM.controls.find(c=>c.id==='pitch'),pw=ui.ctlW.pitch,b=!atLeast('honors');pc.unit=b?' in per ft':'/12';
 if(pw){const L=pw.querySelector('label');if(L)L.textContent=b?'Steepness: inches the roof climbs per foot across':'Roof pitch: inches of rise per 12 in of run';if(ui.ctl.pitch)ui.ctl.pitch.set(sim.p.pitch);}
 Object.keys(MODEC).forEach(md=>{MODEC[md].forEach(id=>{const w=ui.ctlW[id],c=SIM.controls.find(c=>c.id===id);if(w)w.hidden=md!==CUR||!atLeast(c.lvl);});
  MODEM[md].forEach(id=>{const t=ui.tiles&&ui.tiles[id],m=SIM.metrics.find(m=>m.id===id);if(t)t.num.closest('.tile').hidden=md!==CUR||!atLeast(m.lvl);});});}
const ASK={ramp:{bio:'How long must the ramp be, measured along the ground, so it is not too steep? Drag the slider here to your guess in feet. The picture stretches your ramp out to the door as you drag. Then lock it in.'},
 roof:{bio:'How long is each rafter, the board that runs from the top of the wall up to the peak? Drag the slider here to your guess in feet, then lock it in.'},
 road:{bio:'The sign tells you how steep the road is: 6% means it drops 6 ft for every 100 ft you drive. How many feet does it drop over this whole stretch? Drag the slider here to your guess, then lock it in.',honors:'How many feet does the road drop over this stretch? Drag the slider here to your guess, then lock it in.'}};
const GUTC={ramp:'run',roof:'raft',road:'drop'};
/* While the student is still guessing in Guided, the picture does not say whether the ramp is legal. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const locked=sim=>!!((sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on));
const lockMsg='Lock in your gut first';
const an=g=>/^(8|11|18)/.test(fx(g))?'An':'A';
const one=v=>'1 : '+f1(1/v);
/* At Big picture the ratio is said in words. */
const oneW=v=>atLeast('honors')?one(v):'1 in up per '+f1(1/v)+' in';
const aft=v=>an(v).toLowerCase()+' '+fx(v)+' ft';

const SIM={
 id:'ramp',hash:'ramp',apUnit:8,order:6,tab:'Ramps, roofs and road grades',kind:'Simulation',
 card:'Guess how long a wheelchair ramp must be, then let rise over run and the tangent check it against the ADA rules.',
 title:'Rise over run: ramps, roofs and road grades',
 lede:{bio:'A slope is rise ÷ run. Wheelchair ramps at public buildings may rise at most 1 inch for every 12 inches of run, so a ramp is much longer than most people guess.',
  honors:'Rise ÷ run is the tangent of the slope angle. A 1:12 ramp, a 6/12 roof and a 6% road grade are all ratios of the legs of a right triangle; tan⁻¹ turns each one into an angle.',
  ap:'With slope m = rise ÷ run, the angle is θ = tan⁻¹ m and the sloped length is run · √(1 + m²) = run ÷ cos θ. For small angles, tan θ ≈ sin θ ≈ θ in radians, which is why grade × distance is a good estimate of the drop.'},
 scale:{bio:'Side views drawn to scale. Ramp: rise in inches, lengths in feet. Roof: a cross-section of a house. Road: one stretch of highway.'},
 aspect:16/9,timeless:true,trials:true,graph:false,controlsTitle:'The job',
 controls:[
  {id:'mode',label:'Problem',type:'seg',def:'ramp',options:[{v:'ramp',l:'Ramp'},{v:'roof',l:'Roof'},{v:'road',l:'Road grade'}],onChange(sim){sync(sim);if(sim.guide&&sim.guide.keep)return;if(sim.gutS){sim.gutS.g=null;sim.gutS.m=null;}BioLab.gutRender(sim);}},
  {id:'rise',label:'Rise to the door',type:'range',min:6,max:60,step:1,def:21,unit:' in',noGut:true,help:'Three steps of 7 in each is 21 in.'},
  {id:'run',label:'Your ramp length (along the ground)',type:'range',min:2,max:70,step:0.5,def:8,unit:' ft',help:'This is your pick.'},
  {id:'span',label:'House width',type:'range',min:16,max:40,step:1,def:24,unit:' ft',noGut:true},
  {id:'pitch',label:'Roof pitch: inches of rise per 12 in of run',type:'range',min:2,max:12,step:1,def:6,unit:'/12',noGut:true},
  {id:'raft',label:'Your rafter length',type:'range',min:6,max:30,step:0.5,def:10,unit:' ft',help:'This is your pick.'},
  {id:'grade',label:'Grade on the sign',type:'range',min:2,max:10,step:0.5,def:6,unit:'%',noGut:true,help:'6% means the road drops 6 ft for every 100 ft you drive.'},
  {id:'dist',label:'Length of the downhill',type:'range',min:1,max:10,step:0.5,def:5,unit:' mi',noGut:true},
  {id:'drop',label:'Your guess: how far the road drops',type:'range',min:50,max:6000,step:10,def:500,unit:' ft',help:'This is your pick.'}
 ],
 init(sim){sync(sim);return {};},step(){},onLevel(sim){sync(sim);},
 metrics:[
  {id:'rpct',label:'Your ramp’s slope (rise ÷ run)',unit:'%',d:1,min:0,max:30,get:sim=>rSlope(sim)*100},
  {id:'rdeg',label:'Your ramp’s angle',unit:'°',d:1,lvl:'honors',min:0,max:20,get:sim=>Math.atan(rSlope(sim))*DEG},
  {id:'rlegal',label:'Meets the 1:12 rule?',text:true,get:sim=>{if(gutPhase(sim))return lockMsg;const s=rSlope(sim);return s<=1/12+1e-9?'Yes: '+oneW(s):'No: '+oneW(s)+', too steep';}},
  {id:'rneed',label:'Shortest legal ramp',text:true,get:sim=>locked(sim)?f1(need(sim))+' ft'+(landings(sim)?` (${runs(sim)} runs, ${landings(sim)} landing${landings(sim)>1?'s':''})`:''):lockMsg},
  {id:'angle',label:'Roof angle',unit:'°',d:1,min:0,max:45,get:sim=>Math.atan(sim.p.pitch/12)*DEG},
  {id:'rafter',label:'Rafter length from the math',text:true,get:sim=>locked(sim)?f1(rafter(sim))+' ft':lockMsg},
  {id:'boards',label:'Boards to buy',text:true,get:sim=>locked(sim)?board(rafter(sim))+' ft long':lockMsg},
  {id:'gdeg',label:'Road angle',unit:'°',d:2,min:0,max:10,get:sim=>Math.atan(sim.p.grade/100)*DEG},
  {id:'gdrop',label:'Drop from the math',text:true,get:sim=>locked(sim)?com(drop(sim))+' ft':lockMsg}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);const kk=Math.min(k,1.4);
  if(sim.p.mode==='roof')return drawRoof(sim,ctx,k,kk);if(sim.p.mode==='road')return drawRoad(sim,ctx,k,kk);
  const rise=sim.p.rise/12,n=runs(sim),Lg=sim.p.run,G=sim.gutS,show=locked(sim),Ln=need(sim);
  const ext=Math.max(0,show?Ln-Lg:0,G&&G.g&&G.m&&G.g.mode==='ramp'?G.g.g-Lg:0);
  const totalW=Lg+ext+5+rise/0.583+2,s=Math.min(720/totalW,200/Math.max(rise,1)),GY=330,x0=40,X=f=>x0+(f+ext)*s,Y=f=>GY-f*s;
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,GY,800,450-GY);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,GY);ctx.lineTo(800,GY);ctx.stroke();
  /* porch and steps */
  const px=X(Lg),pw=5*s;ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(px,Y(rise),pw,rise*s);
  const ns=Math.max(1,Math.round(sim.p.rise/7)),sh=rise/ns,sd=0.583;for(let i=0;i<ns;i++){ctx.fillRect(px+pw+i*sd*s,Y(rise-i*sh),sd*s+1,(rise-i*sh)*s);}
  txt(ctx,'Door',px+pw/2,Y(rise)-8,{s:12*k,w:700,a:'center'});
  /* the student's ramp */
  const seg=(x,len,r)=>[x+len,r];let pts=[[0,0]],x=0,y=0;const runEach=slopeRun(sim)/n;
  for(let i=0;i<n;i++){x+=runEach;y+=rise/n;pts.push([x,y]);if(i<n-1){x+=5;pts.push([x,y]);}}
  const ok=rSlope(sim)<=1/12+1e-9,blind=gutPhase(sim),rc=blind?PAL['s2']:ok?PAL['s3']:PAL['s1'];
  ctx.fillStyle=rc;ctx.globalAlpha=.18;ctx.beginPath();ctx.moveTo(X(0),GY);pts.forEach(p=>ctx.lineTo(X(p[0]),Y(p[1])));ctx.lineTo(X(x),GY);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle=rc;ctx.lineWidth=4;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(X(p[0]),Y(p[1])):ctx.moveTo(X(p[0]),Y(p[1])));ctx.stroke();
  /* the legal minimum, once you have locked in */
  if(show&&Math.abs(Ln-Lg)>0.3){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(X(Lg-Ln),GY);let xx=Lg-Ln,yy=0;
   for(let i=0;i<n;i++){xx+=sim.p.rise/n;yy+=rise/n;ctx.lineTo(X(xx),Y(yy));if(i<n-1){xx+=5;ctx.lineTo(X(xx),Y(yy));}}ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Shortest legal ramp: '+f1(Ln)+' ft',X(Lg-Ln),GY+58*kk,{s:12*k,w:700,c:PAL['s3']});}
  /* labels */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(0),GY+16);ctx.lineTo(X(Lg),GY+16);ctx.stroke();[0,Lg].forEach(f=>{ctx.beginPath();ctx.moveTo(X(f),GY+10);ctx.lineTo(X(f),GY+22);ctx.stroke();});
  const rev=!!(G&&G.g&&G.m&&G.g.mode==='ramp');
  if(rev&&Math.abs(G.g.g-Lg)>0.3){const gl=G.g.g,gx0=Lg-gl,run1=Math.max(0.5,gl-5*(n-1))/n;let qx=gx0,qy=0;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(X(qx),Y(0));
   for(let i=0;i<n;i++){qx+=run1;qy+=rise/n;ctx.lineTo(X(qx),Y(qy));if(i<n-1){qx+=5;ctx.lineTo(X(qx),Y(qy));}}ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Your gut: '+fx(gl)+' ft',X(gx0)+6,Y(rise)-30*kk,{s:12*k,w:700,c:PAL['s4']});}
  txt(ctx,(rev?'The math: ':'Your ramp: ')+fx(Lg)+' ft along the ground',X(Lg/2),GY+36*kk,{s:13*k,w:700,a:'center'});
  txt(ctx,'Rise '+sim.p.rise+' in',px-8,Y(rise)-8,{s:13*k,w:700,a:'right'});
  if(blind)pill(ctx,'Your guess: '+fx(Lg)+' ft. Too steep? Lock in to find out.',400,34,PAL['s2'],'#fff',14*kk);
  else pill(ctx,(ok?'Legal: ':'Too steep: ')+oneW(rSlope(sim))+(atLeast('honors')?', '+f1(Math.atan(rSlope(sim))*DEG)+'°':''),400,34,ok?PAL['s3']:PAL['s1'],'#fff',14*kk);
  if(n>1)txt(ctx,`${n} runs of ${f1(sim.p.rise/n)} in, with ${n-1} landing${n>2?'s':''} of 5 ft`,400,64+(kk-1)*10,{s:12*k,c:PAL['cv-soft'],a:'center'});},
 narrate(sim){const m=sim.p.mode;
  if(m==='roof'&&!atLeast('honors'))return `This roof climbs ${sim.p.pitch} in for every foot across. Each rafter covers half the house, ${fx(sim.p.span/2)} ft across, so it climbs ${f1(sim.p.span/2*sim.p.pitch/12)} ft. <b>The rafter is the long, slanted side of a right triangle${locked(sim)?': '+f1(rafter(sim))+' ft':''}.</b>`;
  if(m==='roof')return `A ${sim.p.pitch}/12 pitch rises ${sim.p.pitch} in for every 12 in of run. Each rafter covers half the house, ${fx(sim.p.span/2)} ft of run, so it climbs ${f1(sim.p.span/2*sim.p.pitch/12)} ft. <b>The rafter is the hypotenuse${locked(sim)?': '+f1(rafter(sim))+' ft':''}.</b>`;
  if(m==='road')return `${an(sim.p.grade)} ${fx(sim.p.grade)}% grade drops ${fx(sim.p.grade)} ft for every 100 ft. That is an angle of only ${fmtNum(Math.atan(sim.p.grade/100)*DEG,1)}°, <b>but ${fx(sim.p.dist)} miles is ${com(sim.p.dist*5280)} ft of road</b>, so the drop adds up.`;
  const s=rSlope(sim);if(gutPhase(sim))return `Your ramp climbs ${sim.p.rise} in to the door over ${fx(sim.p.run)} ft of ground. Is that gentle enough for a wheelchair? Lock in your guess, and the math will check it.`;
  return s<=1/12+1e-9?`Your ramp rises ${sim.p.rise} in over ${f1(slopeRun(sim)*12)} in of slope: ${one(s)}. <b>That meets the 1 : 12 rule.</b>${landings(sim)?' Each run rises 30 in or less, with a 5 ft landing between.':''}`
   :`Your ramp rises ${sim.p.rise} in over only ${f1(slopeRun(sim)*12)} in of slope: ${one(s)}. <b>That is steeper than 1 : 12</b>, so it fails the ADA rule and is hard to push a wheelchair up.`;},
 gut:{better:'lower',
  get controls(){return [GUTC[CUR]];},
  get ask(){return ASK[CUR];},
  lock(sim){const m=sim.p.mode;
   if(m==='roof')return {mode:m,g:sim.p.raft,v:Math.abs(sim.p.raft-rafter(sim)),label:`${fx(sim.p.raft)} ft rafters`};
   if(m==='road')return {mode:m,g:sim.p.drop,v:Math.abs(sim.p.drop-drop(sim)),label:`a drop of ${com(sim.p.drop)} ft`};
   return {mode:m,g:sim.p.run,v:Math.abs(sim.p.run-need(sim)),ok:rSlope(sim)<=1/12+1e-9,slope:rSlope(sim),label:`${aft(sim.p.run)} ramp (${oneW(rSlope(sim))})`};},
  solve(sim){const m=sim.p.mode;
   if(m==='roof'){const r=rafter(sim);sim.p.raft=clamp(Math.round(r*2)/2,6,30);return {mode:m,g:r,v:0,label:`${f1(r)} ft rafters, so buy ${board(r)} ft boards`};}
   if(m==='road'){const d=drop(sim);sim.p.drop=clamp(Math.round(d/10)*10,50,6000);return {mode:m,g:d,v:0,label:`a drop of ${com(d)} ft`};}
   const n=need(sim);sim.p.run=clamp(Math.ceil(n*2-1e-9)/2,2,70);return {mode:m,g:n,v:0,label:`${an(n).toLowerCase()} ${f1(n)} ft ramp (${atLeast('honors')?'1 : 12':'1 in up per 12 in'}${landings(sim)?`, ${landings(sim)} landing${landings(sim)>1?'s':''}`:''})`};},
  how:{bio:'Ramp: 1 : 12 means 12 in of run for every inch of rise, so a ramp needs 1 ft of run per inch of rise. Above 30 in of rise, add a 5 ft landing for each extra run. Roof: the run (half the width) and the rise are the legs; the rafter is the hypotenuse. Road: 6% means 6 ft of drop per 100 ft.',
   honors:'Slope = rise ÷ run = tan θ. Ramp: run = rise ÷ (1/12) = 12 × rise, and θ = tan⁻¹(1/12) ≈ 4.8°. Roof: rafter = run · √(1 + (pitch/12)²). Road: drop = distance · sin(tan⁻¹ grade).'},
  compare(sim,g,m){const md=g.mode;
   if(md==='roof'){const r=m.g,bg=board(g.g),bt=board(r);
    if(g.v<=0.25)return `Your gut was right on: ${fx(g.g)} ft against ${f1(r)} ft. Buy ${bt} ft boards. Your eye already treats the rafter as a hypotenuse.`;
    if(bg<bt)return `Each rafter is <b>${f1(r)} ft</b>, so you need ${bt} ft boards. Your gut says ${fx(g.g)} ft, so you would buy ${bg} ft boards, and <b>every one would be too short</b>. Lumber comes in 2 ft steps, so that is a whole order returned.`;
    if(bg>bt)return `Each rafter is <b>${f1(r)} ft</b>, so ${bt} ft boards are enough. Your gut says ${fx(g.g)} ft, so you would buy ${bg} ft boards and cut ${bg-bt} ft or more off every one: wasted wood on every rafter.`;
    return `Each rafter is <b>${f1(r)} ft</b>; your gut said ${fx(g.g)} ft. You would still buy the right ${bt} ft boards, but measure and cut from the math, not the guess: you were ${f1(g.v)} ft off.`;}
   if(md==='road'){const d=m.g,deg=Math.atan(sim.p.grade/100)*DEG;
    if(g.v<=Math.max(30,d*0.05))return `Your gut was right on: ${com(g.g)} ft against ${com(d)} ft. Steep, long downgrades are why truck drivers shift to a low gear before the hill: riding the brakes the whole way can overheat them.`;
    return `The road drops <b>${com(d)} ft</b>, and your gut said ${com(g.g)} ft: ${com(g.v)} ft ${g.g>d?'too much':'too little'}. ${an(sim.p.grade)} ${fx(sim.p.grade)}% grade is only ${f1(deg)}°, but over ${fx(sim.p.dist)} miles it adds up. That is why trucks shift to a low gear before a long downgrade: riding the brakes the whole way can overheat them.`;}
   const n=m.g,d=g.g-n;
   if(Math.abs(d)<=0.5)return `Your gut was right on: ${fx(g.g)} ft against ${f1(n)} ft. You already know ramps are long: 1 ft of ramp for every inch of rise.`;
   if(d<0)return `Your ${fx(g.g)} ft ramp climbs ${atLeast('honors')?'at '+one(g.slope):'1 in for every '+f1(1/g.slope)+' in of ground'}, ${f1(g.slope*12)} times as steep as the rule allows. <b>It breaks the ${atLeast('honors')?'1 : 12 ':''}rule</b>, and it is hard or unsafe to push a wheelchair up. The shortest legal ramp is <b>${f1(n)} ft</b>: ${f1(-d)} ft longer than your gut.`;
   return `Your ${fx(g.g)} ft ramp is legal, but it is <b>${f1(d)} ft longer</b> than the ${f1(n)} ft the 1 : 12 rule needs: extra material and yard space you did not have to use.`;},
  again(sim){const p=sim.p,r=(a,b,st)=>Math.round((a+Math.random()*(b-a))/st)*st;
   if(p.mode==='roof'){p.span=r(20,36,1);p.pitch=r(3,12,1);p.raft=6;return;}
   if(p.mode==='road'){p.grade=r(4,8,0.5);p.dist=r(2,8,0.5);p.drop=50;return;}
   p.rise=r(1,8,1)*7;if(p.rise<6)p.rise=7;p.run=2;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A library door is 24 in above the sidewalk. A ramp may rise at most 1 in for every 12 in of run. What is the shortest ramp, measured along the ground?',choices:['2 ft','12 ft','24 ft'],correct:2,explain:'24 in of rise needs 24 × 12 = 288 in of run, and 288 in is 24 ft. The shortcut: 1 ft of ramp for every inch of rise. (24 in is under the 30 in limit, so one run with no landing works.)'},
  {lvl:'bio',instant:true,q:'A road sign says 6% grade. What does that mean?',choices:['The road tilts at 6°','The road drops 6 ft for every 100 ft','The road drops 6 ft for every mile'],correct:1,explain:'Grade is rise ÷ run as a percent: 6 ft down for every 100 ft along. That is an angle of only about 3.4°, much less than 6°, but on a long hill it adds up fast.'},
  {lvl:'honors',instant:true,q:'A roof has a 6/12 pitch. What angle does it make with the horizontal?',choices:['About 22.5°','About 26.6°','About 30°'],correct:1,explain:'Pitch 6/12 means tan θ = 6 ÷ 12 = 0.5, so θ = tan⁻¹(0.5) ≈ 26.6°. Half the rise per run does not mean half of 45°: the tangent is not proportional to the angle.'},
  {lvl:'honors',instant:true,q:'A doorway is 36 in up. One ramp run may rise at most 30 in, and landings are at least 5 ft long. What is the shortest ramp, measured along the ground?',choices:['36 ft','41 ft','46 ft'],correct:1,explain:'36 in of rise needs 36 ft of sloped run at 1 : 12. Because 36 in is more than 30 in, split it into two runs (18 in each) with a 5 ft level landing between: 36 + 5 = 41 ft. Landings are also required at the top and bottom of each run; this counts only the one in between.'},
  {lvl:'ap',instant:true,q:'To the nearest 0.1°, what angle is the steepest ramp the 1 : 12 rule allows?',choices:['4.8°','8.3°','12.0°'],correct:0,explain:'tan θ = 1/12 ≈ 0.0833, so θ = tan⁻¹(1/12) ≈ 4.76°. A slope of 1:12 sounds steep, but it is under 5°.'},
  {lvl:'ap',instant:true,q:'A house is 30 ft wide with an 8/12 roof pitch. Ignoring overhang, how long is each rafter?',choices:['15.0 ft','18.0 ft','20.0 ft','25.0 ft'],correct:1,explain:'Run = 15 ft and slope = 8/12, so the rafter is 15 · √(1 + (8/12)²) = 15 · √(1.444…) ≈ 15 × 1.202 ≈ 18.03 ft. That is just over 18 ft, so an 18 ft board is about a third of an inch short: buy 20 ft boards, which also leaves room for an overhang.'}
 ],
 tour:[
  {title:'The job',text:'Your grandmother’s front door is up 3 steps of 7 in each: a rise of 21 in. A ramp may rise at most 1 in for every 12 in of run. The ADA Standards require that at public buildings, and builders use the same rule for home ramps.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'ramp',rise:21,run:8})},
  {title:'Too short',text:'An 8 ft ramp looks reasonable, but it climbs 21 in over 96 in: a slope of about 1 : 4.6. That is far too steep to push a wheelchair up, and it fails the rule.',pause:true,focus:[[20,10,760,400]]},
  {title:'Rise over run',text:'At 1 : 12, every inch of rise needs 12 in of run, which is 1 ft. So 21 in of rise needs 21 ft of ramp along the ground.',pause:true,setup:sim=>BioLab.setValues(sim,{run:21})},
  {title:'Landings',text:'No single run may rise more than 30 in. For a 45 in rise, split it into two runs of 22.5 in with a level 5 ft landing between: 45 + 5 = 50 ft.',pause:true,setup:sim=>BioLab.setValues(sim,{rise:45,run:50})},
  {title:'Roof pitch',text:'Roofers use the same ratio. A 6/12 pitch rises 6 in per 12 in of run. On a 24 ft wide house, each rafter runs 12 ft and rises 6 ft, so it is √(12² + 6²) ≈ 13.4 ft long. Buy 14 ft boards, not 12.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'roof',span:24,pitch:6})},
  {title:'Road grade',text:'A 6% grade drops 6 ft for every 100 ft. That is only about 3.4°, but 5 miles of it drops about 1,581 ft.',pause:true,setup:sim=>BioLab.setValues(sim,{mode:'road',grade:6,dist:5})},
  {lvl:'honors',title:'The tangent',text:'Each of these is a right triangle, and rise ÷ run is the tangent of the angle. 1 : 12 is tan⁻¹(1/12) ≈ 4.8°, a 6/12 roof is tan⁻¹(0.5) ≈ 26.6°, and a 6% road is tan⁻¹(0.06) ≈ 3.4°.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How long must a ramp be?</p><ol><li>Set the rise to 7, 14, 21 and 28 in. For each, find the shortest ramp length that is still legal. Record a trial.</li><li>Look for the pattern between the rise in inches and the length in feet.</li></ol><p>Write the rule in one sentence.</p>',
  honors:'<p><b>Question:</b> How does pitch change the roof?</p><ol><li>Keep the house 24 ft wide. Record the roof angle and the rafter length for pitches of 3, 6, 9 and 12.</li><li>Does doubling the pitch double the angle?</li></ol>',
  ap:'<p><b>Question:</b> How good is grade × distance as an estimate of the drop?</p><ol><li>For grades of 2%, 6% and 10%, compute grade × distance and compare it with the drop from the tool.</li><li>Explain the difference using sin θ and tan θ.</li></ol><p><b>CER:</b> Claim, evidence, reasoning.</p>'},
 terms:[
  {t:'Slope',d:'Rise ÷ run. A 1 : 12 ramp rises 1 unit for every 12 units of run.'},
  {t:'Rise and run',d:'The vertical and horizontal legs of the right triangle under a slope.'},
  {t:'Pitch',d:'A roof’s slope, written as inches of rise per 12 in of run, like 6/12.'},
  {t:'Grade',d:'A road’s slope as a percent: feet of rise or drop per 100 ft.'},
  {t:'Tangent',d:'In a right triangle, opposite ÷ adjacent. Slope = tan θ.',lvl:'honors'},
  {t:'Inverse tangent',d:'tan⁻¹ turns a slope back into an angle: tan⁻¹(1/12) ≈ 4.8°.',lvl:'honors'}
 ],
 about:'<p><b>Ramp:</b> uses three rules from the 2010 ADA Standards for Accessible Design: running slope no steeper than 1 : 12, no single run rising more than 30 in, and level landings at least 60 in (5 ft) long. (Existing buildings with tight space may use slightly steeper ramps for rises of 6 in or less.) The length shown counts the sloped runs plus the landings between them. The rules also require landings at the top and bottom, handrails on taller ramps, edge protection and a minimum width, which this tool leaves out. This is a geometry model, not a design or legal review: check current codes with a building official.</p><p><b>Roof:</b> rafter = (half the house width) · √(1 + (pitch/12)²), from the top of the wall to the ridge, ignoring overhang and the thickness of the ridge board. Lumber is sold in 2 ft steps, so boards are rounded up to the next even length.</p><p><b>Road:</b> the distance is measured along the road, so the drop is distance · sin(tan⁻¹ grade). Grade × distance gives almost the same number, because the angle is small.</p>'
};
BioLab.register(SIM);
function drawRoof(sim,ctx,k,kk){const run=sim.p.span/2,rise=run*sim.p.pitch/12,wallH=9,show=locked(sim),G=sim.gutS;
 const s=Math.min(560/(sim.p.span+4),300/(rise+wallH+2)),GY=400,cx=400,X=f=>cx+f*s,Y=f=>GY-f*s;
 ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,GY,800,450-GY);
 ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(X(-run),Y(wallH),run*2*s,wallH*s);
 ctx.fillStyle=PAL['cv-soft'];ctx.globalAlpha=.25;ctx.beginPath();ctx.moveTo(X(-run),Y(wallH));ctx.lineTo(X(0),Y(wallH+rise));ctx.lineTo(X(run),Y(wallH));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(-run),Y(wallH));ctx.lineTo(X(0),Y(wallH+rise));ctx.lineTo(X(run),Y(wallH));ctx.stroke();
 /* rise and run legs on the right half */
 ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X(0),Y(wallH+rise));ctx.lineTo(X(0),Y(wallH));ctx.lineTo(X(run),Y(wallH));ctx.stroke();ctx.setLineDash([]);
 txt(ctx,'Run '+fx(run)+' ft (half the width)',X(run/2),Y(wallH)+20*kk,{s:12*k,w:700,c:PAL['s5'],a:'center'});
 txt(ctx,'Rise '+f1(rise)+' ft',X(0)-8,Y(wallH+rise/2),{s:12*k,w:700,c:PAL['s5'],a:'right'});
 /* your rafter, laid along the left slope from the wall top */
 const L=sim.p.raft,R=rafter(sim),ux=run/R,uy=rise/R,ex=-run+ux*L,ey=wallH+uy*L,ok=Math.abs(L-R)<=0.25;
 ctx.strokeStyle=ok?PAL['s3']:PAL['s4'];ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X(-run),Y(wallH));ctx.lineTo(X(ex),Y(ey));ctx.stroke();ctx.lineCap='butt';
 txt(ctx,'Your rafter: '+fx(L)+' ft',X(-run)+12,Y(wallH)+22*kk,{s:13*k,w:700,c:ok?PAL['s3']:PAL['s4']});
 txt(ctx,L<R-0.25?'Too short: does not reach the ridge':(L>R+0.25?'Too long: sticks past the ridge':'Reaches the ridge'),X(-run)+12,Y(wallH)+42*kk,{s:12*k,w:700,c:PAL['cv-ink']});
 pill(ctx,atLeast('honors')?sim.p.pitch+'/12 pitch, '+f1(Math.atan(sim.p.pitch/12)*DEG)+'°':'Climbs '+sim.p.pitch+' in per foot across',400,30,PAL['rj'],'#fff',14*kk);
 if(show)txt(ctx,'Rafter from the math: '+f1(R)+' ft. Buy '+board(R)+' ft boards.',400,60+(kk-1)*10,{s:13*k,w:700,c:PAL['s3'],a:'center'});
 txt(ctx,'House '+sim.p.span+' ft wide',400,GY+30*kk,{s:12*k,w:700,a:'center'});}
function drawRoad(sim,ctx,k,kk){const D=sim.p.dist*5280,dr=drop(sim),th=Math.atan(sim.p.grade/100),run=D*Math.cos(th),show=locked(sim),G=sim.gutS;
 const s=680/run,x0=60,y0=120,X=f=>x0+f*s,Y=f=>y0+f*s;
 ctx.fillStyle=PAL['cv-bg2'];ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(run),Y(dr));ctx.lineTo(X(run),450);ctx.lineTo(X(0),450);ctx.closePath();ctx.fill();
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(run),Y(dr));ctx.stroke();
 ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(run),Y(0));ctx.lineTo(X(run),Y(dr));ctx.stroke();ctx.setLineDash([]);
 const dly=Y(dr)+22*kk;txt(ctx,show?'Drop: '+com(dr)+' ft':'Drop: ? ft',X(run)-8,dly,{s:12*k,w:700,c:PAL['s5'],a:'right'});
 /* the gut's drop */
 if(G&&G.g&&G.g.mode==='road'&&Math.abs(G.g.g-dr)>5){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(run)-40,Y(G.g.g));ctx.lineTo(X(run)+10,Y(G.g.g));ctx.stroke();txt(ctx,'Your gut',X(run)-46,Math.abs(Y(G.g.g)+4-Y(dr)-22*kk)<18*kk?Y(dr)+22*kk+18*kk:Y(G.g.g)+4,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
 txt(ctx,fx(sim.p.dist)+' miles of road = '+com(D)+' ft',X(run/2),Y(0)-14,{s:13*k,w:700,a:'center'});
 /* a grade sign, drawn as a plain diamond */
 const sx=X(0)+40,sy=Y(0)-70;ctx.fillStyle='#e8b400';ctx.beginPath();ctx.moveTo(sx,sy-26);ctx.lineTo(sx+26,sy);ctx.lineTo(sx,sy+26);ctx.lineTo(sx-26,sy);ctx.closePath();ctx.fill();ctx.strokeStyle='#222';ctx.lineWidth=2;ctx.stroke();
 txt(ctx,fx(sim.p.grade)+'%',sx,sy+5,{s:14,w:800,c:'#111',a:'center'});ctx.strokeStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(sx,sy+26);ctx.lineTo(sx,Y(0)-2);ctx.stroke();
 pill(ctx,`${fx(sim.p.grade)}% grade = ${f1(th*DEG)}°, drawn to scale`,470,40,PAL['rj'],'#fff',13*kk);}
})();
