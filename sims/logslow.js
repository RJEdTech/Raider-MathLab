(function(){
'use strict';
const {clamp,txt,pill,PAL,atLeast,fmtNum}=BioLab.h;
/* Why a log slows down (Nov 18, 2026, for Colin Downs's AP Precalculus log unit).
   Milestone level as a function of time at a steady pace: L(t) = L1 + log_b(t / t1), with t1 = 1 time unit.
   Game: each level needs b times the total XP of the one before (b = 2 by default). Followers: each milestone is 10 times the followers. */
const CASES={
 game:{name:'Game levels',L1:5,Lt:10,u:'hours',u1:'hour',ua:'h',lab:L=>'Level '+Math.round(L),word:'level'},
 follow:{name:'Followers',L1:2,Lt:4,u:'weeks',u1:'week',ua:'wk',lab:L=>Math.round(Math.pow(10,L)).toLocaleString('en-US')+' followers',word:'milestone'}
};
const C=sim=>CASES[sim.p.case]||CASES.game;
const B=sim=>sim.p.case==='follow'?10:(atLeast('ap')?Number(sim.p.mult)||2:2);
const T=(sim,L)=>Math.pow(B(sim),L-C(sim).L1);                 /* time to reach milestone L */
const goal=sim=>T(sim,C(sim).Lt);
const lastStep=sim=>goal(sim)-goal(sim)/B(sim);
const ptT=sim=>Math.max(0.25,clamp(sim.p.pt,1,100)/100*goal(sim));
const slope=(sim,t)=>1/(t*Math.log(B(sim)));
const cpend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g))&&!cpend(sim);
const tf=(sim,t)=>fmtNum(t,t<10?1:0).replace(/\.0$/,'')+' '+(Math.abs(t-1)<1e-9?C(sim).u1:C(sim).u);
const bName=sim=>sim.p.case==='follow'?'10':String(B(sim));
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'logslow',hash:'logslow',apUnit:4,order:7.2,tab:'Why logs slow down',kind:'Simulation',
 skills:{bio:'Logarithmic growth and average rate of change · Precalculus Unit 6, AP Precalculus 2B',honors:'Logarithmic functions: rate of change proportional to 1/x · Precalculus Unit 6, AP Precalculus 2B',ap:'Rate of change of log_b x is 1/(x ln b) · AP Precalculus 2B, preview of AP Calculus'},
 prereq:['logscale'],next:['lnbase','decibels'],
 card:'Guess how long the next game level or follower milestone takes at a steady pace, then see why every step up takes longer than the last.',
 title:'Why does a log slow down?',
 lede:{bio:'In many games, each level needs twice the XP of the level before. Play at a steady pace and every new level takes twice as long. Your level is counting doublings, and that makes it a logarithm.',
  honors:'Level L(t) = L₁ + log₂ t, with t in hours. Every +1 in level needs one more doubling of time. The rise stays 1 while the run doubles, so the slope keeps shrinking. It shrinks like 1/t: slope × t never changes.',
  ap:'For L(t) = L₁ + log_b t, the rate of change is 1/(t ln b). The 1/t comes from the run growing with t. The 1/ln b comes from the base: base 2 gives 1/ln 2 ≈ 1.443, base 10 gives 1/ln 10 ≈ 0.434. The function increases forever with no horizontal asymptote, but its rate of change goes to 0.'},
 scale:'One player or one account at a steady pace: the same XP per hour, or the same new followers per week.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your climb',
 controls:[
  {id:'case',label:'What are you climbing?',type:'seg',def:'game',noGut:true,onChange:clearGut,options:[{v:'game',l:'Game levels'},{v:'follow',l:'Followers'}]},
  {id:'guess',label:'Your guess: time to the goal',type:'range',min:0,max:250,step:1,def:0,unit:'',help:'Hours for game levels, weeks for followers.'},
  {id:'pt',label:'Check the slope this far along',type:'range',min:1,max:100,step:1,def:25,unit:'%',lvl:'honors',noGut:true},
  {id:'mult',label:'Game: XP needed grows by this each level',type:'seg',def:2,lvl:'ap',noGut:true,onChange:clearGut,options:[{v:1.5,l:'× 1.5'},{v:2,l:'× 2'},{v:3,l:'× 3'}]}
 ],
 actions:[{id:'show',label:'Skip the guess and show the staircase',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'goal',label:'Time to the goal',unit:'',d:1,min:0,max:null,get:sim=>shown(sim)?goal(sim):null},
  {id:'last',label:'The last step alone takes',unit:'',d:1,min:0,max:null,get:sim=>shown(sim)?lastStep(sim):null},
  {id:'first',label:'Steps up per time unit, first step',unit:'',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?1/(T(sim,C(sim).L1+1)-T(sim,C(sim).L1)):null},
  {id:'slope',label:'Slope at the check point',unit:'per unit',d:3,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?slope(sim,ptT(sim)):null},
  {id:'kx',label:'Slope × time (never changes)',unit:'',d:3,lvl:'honors',min:0,max:3,get:sim=>shown(sim)?slope(sim,ptT(sim))*ptT(sim):null},
  {id:'lnb',label:'1 ÷ ln b',unit:'',d:3,lvl:'ap',min:0,max:3,get:sim=>1/Math.log(B(sim))}
 ],
 draw(sim,ctx,vdt,k){const c=C(sim),b=B(sim),sh=shown(sim),G=sim.gutS,kk=Math.min(k,1.5),stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L0=Math.round(60+26*kk),R0=780,T0=34,B0=392;
  const xmax=sh?Math.max(goal(sim)*1.08,(G&&G.g?G.g.t:0)*1.05,4):260;
  const ymin=c.L1-1,ymax=c.Lt+0.7;
  const X=t=>L0+t/xmax*(R0-L0),Y=L=>B0-(L-ymin)/(ymax-ymin)*(B0-T0);
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let L=c.L1;L<=c.Lt;L++){const y=Y(L);ctx.globalAlpha=.45;ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.globalAlpha=1;
   txt(ctx,sim.p.case==='follow'?(Math.pow(10,L)>=1000?Math.round(Math.pow(10,L)/1000)+'K':String(Math.pow(10,L))):String(L),L0-8,y+4,{s:12*kk,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,sim.p.case==='follow'?'Followers':'Level',L0-8,T0-8,{s:12*kk,w:700,c:PAL['cv-soft'],a:'right'});
  const nt=sh?(xmax>150?50:xmax>60?20:xmax>25?5:xmax>8?2:1):50;
  for(let t=0;t<=xmax;t+=nt){const x=X(t);txt(ctx,String(t),x,B0+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});ctx.globalAlpha=.3;ctx.beginPath();ctx.moveTo(x,T0);ctx.lineTo(x,B0);ctx.stroke();ctx.globalAlpha=1;}
  txt(ctx,(sim.p.case==='follow'?'Time posting (':'Time playing (')+c.u+')',R0,B0+36*kk,{s:12*kk,w:700,c:PAL['cv-soft'],a:'right'});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L0,T0);ctx.lineTo(L0,B0);ctx.lineTo(R0,B0);ctx.stroke();
  if(!sh){/* before the reveal: only the first two milestones and a question mark */
   const p1=T(sim,c.L1),p2=T(sim,c.L1+1);
   [[p1,c.L1],[p2,c.L1+1]].forEach(([t,L])=>{ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(X(t),Y(L),6,0,7);ctx.fill();});
   txt(ctx,c.lab(c.L1)+' after '+tf(sim,p1)+', '+c.lab(c.L1+1)+' after '+tf(sim,p2),L0+16,Y(c.L1+1)-14,{s:13*kk,w:700,c:PAL['s2']});
   txt(ctx,'Goal: '+c.lab(c.Lt)+'.   When?',L0+60*kk,Y(c.Lt)+26*kk,{s:15*kk,w:800,c:PAL['rj']});
   if(!cpend(sim))txt(ctx,'?',X(200),Y(c.Lt)+6,{s:34*kk,w:800,c:PAL['rj'],a:'center'});
  }else{
   /* curve */
   if(stg>=4){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2.5;ctx.beginPath();let first=true;for(let i=0;i<=400;i++){const t=Math.max(1/b,xmax*i/400);const L=c.L1+Math.log(t)/Math.log(b);if(L<ymin)continue;const x=X(t),y=Y(Math.min(L,ymax));first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}ctx.stroke();}
   /* staircase */
   const nSteps=c.Lt-c.L1,show=stg>=2?nSteps:1;
   for(let i=0;i<show;i++){const L=c.L1+i,a=T(sim,L),z=T(sim,L+1),hl=stg===3&&i===nSteps-1;
    ctx.strokeStyle=PAL['s1'];ctx.lineWidth=hl?6:3.5;ctx.beginPath();ctx.moveTo(X(a),Y(L));ctx.lineTo(X(z),Y(L));ctx.stroke();
    ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(X(z),Y(L));ctx.lineTo(X(z),Y(L+1));ctx.stroke();
    if(X(z)-X(a)>58*kk)txt(ctx,'run '+tf(sim,z-a),(X(a)+X(z))/2,Y(L)+16*kk,{s:12*kk,w:700,c:PAL['s1'],a:'center'});
    if(i>=nSteps-3)txt(ctx,'+1',X(z)+5,(Y(L)+Y(L+1))/2+4,{s:12*kk,w:800,c:PAL['s3']});}
   const g=goal(sim);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(g),Y(c.Lt),7,0,7);ctx.fill();
   pill(ctx,c.lab(c.Lt)+': '+tf(sim,g),Math.min(X(g),R0-90*kk),Y(c.Lt)-24*kk,PAL['rj'],'#fff',13*kk);
   if(stg===3){const a=T(sim,c.Lt-1);pill(ctx,'Last step: '+tf(sim,g-a)+', about '+Math.round(100*(g-a)/g)+'% of all the time',X((a+g)/2)-40*kk,Y(c.Lt-1)+40*kk,PAL['s1'],'#fff',12*kk);}
   /* tangent check at honors */
   if(atLeast('honors')&&(stg===99||stg>=5)){const t=ptT(sim),L=c.L1+Math.log(t)/Math.log(b),m=slope(sim,t),w=xmax*0.12;
    ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(X(Math.max(0,t-w)),Y(L-m*Math.min(t,w)));ctx.lineTo(X(t+w),Y(L+m*w));ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(X(t),Y(L),6,0,7);ctx.fill();
    pill(ctx,'slope '+fmtNum(m,3)+' per '+c.u1+' × '+fmtNum(t,1)+' '+c.u+' = '+fmtNum(m*t,3),L0+190*kk,T0+16*kk,PAL['s4'],'#fff',12*kk);}
   if(stg===8){pill(ctx,'1 ÷ ln '+bName(sim)+' = '+fmtNum(1/Math.log(b),3),L0+140*kk,T0+60*kk,PAL['s5'],'#fff',14*kk);}
  }
  /* gut */
  if(G&&G.g||sim.p.guess>0){const gt=G&&G.g?G.g.t:sim.p.guess,x=X(Math.min(gt,xmax));ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x,T0);ctx.lineTo(x,B0);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+tf(sim,gt),x+(x>R0-150?-6:6),T0+14*kk,{s:12*kk,w:800,c:PAL['s4'],a:x>R0-150?'right':'left'});}
 },
 narrate(sim){const c=C(sim),b=B(sim);
  if(cpend(sim))return 'Work it out: each step up takes '+bName(sim)+' times as long as the step before.';
  if(!shown(sim))return `At a steady pace, ${c.lab(c.L1)} took ${tf(sim,1)} and ${c.lab(c.L1+1)} took ${tf(sim,b)}. <b>Each step up needs ${bName(sim)} times the total</b>. Lock in your guess for ${c.lab(c.Lt)}.`;
  const g=goal(sim);
  if(atLeast('honors'))return `Every step up is a rise of 1, but the run keeps multiplying by ${bName(sim)}. At ${fmtNum(ptT(sim),1)} ${c.u} the slope is ${fmtNum(slope(sim,ptT(sim)),3)} per ${c.u1}; <b>slope × time is always ${fmtNum(1/Math.log(b),3)}</b>, which is 1 ÷ ln ${bName(sim)}.`;
  return `The steps take ${[0,1,2,3].map(i=>tf(sim,T(sim,c.L1+i+1)-T(sim,c.L1+i))).join(', ')}… Same rise each time, longer and longer runs. <b>${c.lab(c.Lt)} comes at ${tf(sim,g)}.</b>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to how long you think it takes to reach the goal at the same steady pace. The orange line moves with it. Then lock it in.',honors:'Before you see the staircase: drag the slider here to the time you think the goal takes, then lock it in.'},
  hint:'Lock your gut answer, then you will work it out yourself.',
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-goal(sim)),t:g,label:tf(sim,g)};},
  solve(sim){const g=goal(sim);sim.p.guess=Math.min(250,Math.round(g));return {v:0,t:g,label:tf(sim,g)};},
  how:{bio:'The math multiplies instead of adding. Each step up takes the base times as long, so the time to the goal is the first step’s time multiplied by the base once for every step.',
   honors:'Solve L₁ + log_b t = L for t: t = b^(L − L₁). The level is a log of the time, so the time is an exponential of the level.',
   ap:'L(t) = L₁ + log_b t, so t = b^(L − L₁) and L′(t) = 1/(t ln b).'},
  formula(sim){const c=C(sim);return `t = ${bName(sim)}^(${c.Lt} − ${c.L1}) = ${bName(sim)}^${c.Lt-c.L1} = ${fmtNum(goal(sim),goal(sim)<10?2:0)} ${c.u}`;},
  calc:{unit:'',d:3,tol:a=>Math.max(0.01,Math.abs(a)*0.02),
   prompt:{bio:sim=>{const c=C(sim);return `${c.lab(c.L1)} took <b>${tf(sim,1)}</b>. Each step up takes <b>${bName(sim)} times</b> as long as the last one in total. How many ${c.u} until <b>${c.lab(c.Lt)}</b>?`;},
    honors:sim=>{const c=C(sim),a=T(sim,c.Lt-1),g=goal(sim);return `${c.lab(c.Lt-1)} comes at ${tf(sim,a)} and ${c.lab(c.Lt)} at ${tf(sim,g)}. What is the <b>average rate of change</b> over that last step, in steps up per ${c.u1}?`;},
    ap:sim=>{const c=C(sim),t=goal(sim)/4;return `L(t) = ${c.L1} + log_${bName(sim)} t. Use L′(t) = 1/(t ln b) to find how fast you are climbing at t = ${fmtNum(t,2)} ${c.u}, in steps up per ${c.u1}.`;}},
   answer:sim=>{const c=C(sim),g=goal(sim);if(atLeast('ap')){const t=g/4;return 1/(t*Math.log(B(sim)));}if(atLeast('honors'))return 1/(g-T(sim,c.Lt-1));return g;},
   hint:{bio:'Write out the times step by step, multiplying each time.',honors:'Average rate = change in level ÷ change in time = 1 ÷ (length of the last step).',ap:'ln 2 ≈ 0.693 and ln 10 ≈ 2.303.'},
   steps(sim){const c=C(sim),b=B(sim),g=goal(sim);
    if(atLeast('ap')){const t=g/4;return [`L′(t) = 1/(t ln ${bName(sim)}).`,`At t = ${fmtNum(t,2)}: 1/(${fmtNum(t,2)} × ${fmtNum(Math.log(b),3)}) ≈ <b>${fmtNum(1/(t*Math.log(b)),3)}</b> steps up per ${c.u1}.`,`Check: slope × t = 1/ln ${bName(sim)} ≈ ${fmtNum(1/Math.log(b),3)} at every point.`];}
    if(atLeast('honors')){const a=T(sim,c.Lt-1);return [`Change in level: ${c.Lt} − ${c.Lt-1} = 1 step.`,`Change in time: ${fmtNum(g,2)} − ${fmtNum(a,2)} = ${fmtNum(g-a,2)} ${c.u}.`,`Average rate: 1 ÷ ${fmtNum(g-a,2)} ≈ <b>${fmtNum(1/(g-a),3)}</b> steps per ${c.u1}. The first step ran at ${fmtNum(1/(b-1),3)}.`];}
    const L=[];let t=1;for(let i=c.L1;i<=c.Lt;i++){L.push(c.lab(i)+': '+fmtNum(t,t<10?2:0).replace(/\.00$/,'')+' '+c.u);t*=b;}
    return [L.join(', '),`So <b>${fmtNum(g,g<10?2:0)} ${c.u}</b>: ${bName(sim)} multiplied by itself ${c.Lt-c.L1} times.`];}},
  compare(sim,g,m){const c=C(sim),off=Math.abs(g.t-m.t),last=lastStep(sim);
   const tail=` The last step alone takes <b>${tf(sim,last)}</b>, ${Math.round(100*last/m.t)}% of all the time.`;
   if(off<=Math.max(1,0.05*m.t))return `Your gut was right on: <b>${tf(sim,m.t)}</b> to ${c.lab(c.Lt)}. You already think in multiplying steps.`+tail;
   return `You guessed ${tf(sim,g.t)}; the steady-pace answer is <b>${tf(sim,m.t)}</b>, so you were off by <b>${tf(sim,off)}</b>. ${g.t<m.t?'Most people picture equal steps. Each step is '+bName(sim)+' times longer than the one before.':'You overshot: the time multiplies, but only once per step.'}`+tail;},
  again(sim){sim.peek=false;sim.p.guess=0;sim.p.case=Math.random()<0.5?'game':'follow';if(atLeast('ap'))sim.p.mult=[1.5,2,3][Math.floor(Math.random()*3)];}
 },
 onTourExit(sim){sim.peek=false;sim.tst=null;},
 challenges:[
  {kind:'num',lvl:'bio',q:'In a game, each level needs twice the total XP of the one before. You reach level 3 after 1 hour of steady play. How many hours until level 7?',answer:16,tol:0.01,unit:'hours',hint:'Double the time once for each level: 4, 5, 6, 7.',explain:'Level 4 at 2 h, level 5 at 4 h, level 6 at 8 h, level 7 at 16 h. That is 2⁴ = 16.'},
  {lvl:'bio',instant:true,q:'Same game. How does the time from level 9 to level 10 compare with the time from level 5 to level 6?',choices:['About the same','4 times as long','16 times as long','5 times as long'],correct:2,explain:'Each step is twice as long as the one before. From the 5→6 step to the 9→10 step is 4 doublings: 2⁴ = 16 times as long (1 hour vs. 16 hours).'},
  {lvl:'bio',instant:true,q:'Your level climbs more and more slowly. Does it ever stop going up at a steady pace?',choices:['Yes, it levels off at a maximum','No, it keeps going up forever, just more and more slowly','It goes down after a while'],correct:1,explain:'A log has no ceiling. Level 20 in this game would take 32,768 hours, but it does come. Slowing down is not stopping.'},
  {lvl:'honors',instant:true,q:'You gain followers at a steady pace: 100 at 1 week. Each milestone (100, 1,000, 10,000…) is 10 times the last. Which statement is true?',choices:['Each milestone takes 1 more week','Each milestone takes 10 times as long as the last','Each milestone takes 2 times as long','Each milestone takes the same time'],correct:1,explain:'At a steady pace, 10 times the followers takes 10 times the time: 1,000 at 10 weeks, 10,000 at 100 weeks. The milestone number is log₁₀ of the followers.'},
  {kind:'num',lvl:'honors',q:'Game levels with L(t) = 5 + log₂ t (t in hours). What is the average rate of change from t = 16 to t = 32, in levels per hour?',answer:0.0625,tol:0.001,unit:'levels per hour',hint:'One level in how many hours?',explain:'L(16) = 9 and L(32) = 10. Rate = 1 ÷ 16 = 0.0625 levels per hour, 16 times slower than the first step.'},
  {lvl:'honors',instant:true,q:'For L(t) = 5 + log₂ t, the slope at t = 4 h is about 0.361 levels per hour. About what is it at t = 16 h?',choices:['0.361','0.180','0.090','0.023'],correct:2,explain:'The slope is proportional to 1/t. Four times the time means a quarter of the slope: 0.361 ÷ 4 ≈ 0.090. Slope × t stays 1.443.'},
  {kind:'num',lvl:'ap',q:'Find the rate of change of f(t) = log₁₀ t at t = 50. Round to 4 decimal places.',answer:1/(50*Math.LN10),tol:0.00005,unit:'',hint:'f′(t) = 1/(t ln 10), and ln 10 ≈ 2.3026.',explain:'f′(50) = 1/(50 × 2.3026) ≈ 0.0087.'},
  {lvl:'ap',instant:true,q:'Why does log₂ t climb faster than log₁₀ t at every t > 0?',choices:['Because 2 < 10, so each step up is a smaller multiply and you reach more steps','Because log₂ t has a horizontal asymptote','It does not: they have the same slope','Because ln 2 > ln 10'],correct:0,explain:'log₂ t = log₁₀ t ÷ log₁₀ 2 ≈ 3.32 log₁₀ t. A smaller base means more doublings than tenfoldings, so the slope 1/(t ln 2) is 3.32 times 1/(t ln 10).'}
 ],
 tour:[
  {title:'The rule',text:'Each level needs <b>twice the total XP</b> of the level before. At a steady pace, that means twice the time. Level 5 came at 1 hour, level 6 at 2 hours.',pause:true,setup:sim=>{sim.tst=1;sim.peek=true;BioLab.setValues(sim,{case:'game',mult:2,pt:25,guess:0});}},
  {title:'Climb the staircase',text:'Orange runs are time, green rises are one level. The runs are <b>1, 2, 4, 8, 16 hours</b>. Level 10 comes at <b>32 hours</b>.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Same rise, longer run',text:'Slope = rise ÷ run. Every rise is 1, but the runs double, so the slopes go 1, 1/2, 1/4, 1/8, 1/16. The last level alone takes <b>16 hours, half of all the time</b>.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Slower, but never stopping',text:'The purple curve is L(t) = 5 + log₂ t. It bends flatter and flatter, but it never levels off: level 20 would come at 32,768 hours. <b>A log keeps climbing forever.</b>',pause:true,setup:sim=>{sim.tst=4;}},
  {lvl:'honors',title:'Slope × time stays the same',text:'The dashed line touches the curve at the yellow point. Move the check point and the slope changes, but <b>slope × time is always 1.443</b>. So the slope is 1.443 ÷ t: proportional to 1/t.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{pt:25});}},
  {lvl:'honors',title:'Followers work the same way',text:'At a steady pace, 100 followers took 1 week. 1,000 takes 10 weeks and 10,000 takes <b>100 weeks</b>: each milestone is 10 times the last. Now slope × time is <b>0.434</b>.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{case:'follow',pt:25});}},
  {lvl:'ap',title:'Where 1.443 and 0.434 come from',text:'1.443 = 1 ÷ ln 2 and 0.434 = 1 ÷ ln 10. For any base, L′(t) = 1/(t ln b). The <b>1/t</b> comes from the runs growing with t; the <b>1/ln b</b> comes from the base. The tool “Where does 1/ln b come from?” shows why.',pause:true,setup:sim=>{sim.tst=8;BioLab.setValues(sim,{case:'game',mult:2});}},
  {title:'Stop and wonder',text:'John Napier published logarithms in 1614 so astronomers could turn hard multiplying into easy adding. Four centuries later, a game designer who never says “logarithm” builds one into every level bar. <b>Counting multiplications is so useful that it shows up wherever growth multiplies.</b>',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{case:'game'});}}
 ],
 lab:{bio:'<p><b>Question:</b> How does the time for each level change?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Record the run for each level from 5 to 10.</li><li>Divide each run by the one before it.</li></ol><p>Write one sentence: what stays the same, the runs or their ratio?</p>',
  honors:'<p><b>Question:</b> How does the slope depend on time?</p><ol><li>Set the check point to 10%, 20%, 40% and 80% and record the slope each time.</li><li>Multiply each slope by its time.</li><li>Switch to Followers and repeat.</li></ol><p>Explain why doubling the time halves the slope.</p>',
  ap:'<p><b>Question:</b> How does the base change the rate of change?</p><ol><li>For XP growth × 1.5, × 2 and × 3, record slope × time.</li><li>Compare each with 1 ÷ ln b.</li></ol><p><b>CER:</b> Use L(t) = L₁ + log_b t to show L′(t) = 1/(t ln b), and explain each factor in words.</p>'},
 terms:[
  {t:'Logarithm',d:'The number of times you multiply the base to get a number. log₂ 32 = 5 because 2 × 2 × 2 × 2 × 2 = 32.'},
  {t:'Average rate of change',d:'Change in output ÷ change in input over an interval. For one step up: 1 ÷ the length of the step.'},
  {t:'Logarithmic growth',d:'Growth that keeps going but slows: each equal rise needs the input multiplied by the same factor.',lvl:'honors'},
  {t:'Proportional to 1/t',d:'Slope = constant ÷ t: double the time, half the slope.',lvl:'honors'},
  {t:'No horizontal asymptote',d:'A log increases without bound, even though its rate of change goes to 0.',lvl:'honors'},
  {t:'Derivative of log_b t',d:'The instantaneous rate of change, 1/(t ln b). AP Calculus proves it; here you can measure it.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Milestone L(t) = L₁ + log_b t, where t is time at a steady pace in units of the first milestone’s time. Game: each level needs b times the total XP of the level before (b = 2 unless you change it). Followers: each milestone is 10 times the last, with the same new followers every week.</p><p><b>Simplified on purpose.</b> Real games use many XP curves (some grow more slowly than doubling), and real accounts do not gain followers at a steady pace. Growth that multiplies, such as a video that gets shared, behaves very differently; see <a href="#logscale">Log scales and doubling</a>. For how apps are built to bring you back, see HealthLab’s <a href="https://rjedtech.github.io/Raider-HealthLab/#streaks" target="_blank" rel="noopener">Likes and streaks</a> tool.</p>'
};
BioLab.register(SIM);
})();
