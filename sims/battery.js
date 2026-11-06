(function(){
'use strict';
const {clamp,rng,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Time t is minutes after noon. The phone drains at r(t) % per minute. Each change of activity ramps the rate
   smoothly over w minutes (a half-cosine ramp), so the battery B(t) = B0 − ∫r has an exact formula.
   From now (2:10 pm, t = 130) on, you keep doing what you are doing now, so the rate stays at r(130). */
const NOW=130,NEED=390,TEND=600;
const ACT={scroll:{l:'Scrolling social media',s:'Scrolling',r:0.25},game:{l:'Gaming',s:'Gaming',r:0.5},music:{l:'Music and texting',s:'Music',r:0.12},video:{l:'Streaming video',s:'Video',r:0.3},maps:{l:'Maps with GPS',s:'Maps',r:0.4},idle:{l:'Screen off in your pocket',s:'Idle',r:0.03}};
const ramp=(t,c,w)=>{const a=c-w/2;if(t<=a)return 0;if(t>=c+w/2)return 1;return (1-Math.cos(Math.PI*(t-a)/w))/2;};
const rampInt=(t,c,w)=>{const a=c-w/2,b=c+w/2;if(t<=a)return 0;if(t>=b)return w/2+(t-b);return (t-a)/2-w/(2*Math.PI)*Math.sin(Math.PI*(t-a)/w);};
function rateRaw(q,t){let r=ACT[q.acts[0]].r;q.sw.forEach((s,i)=>{r+=(ACT[q.acts[i+1]].r-ACT[q.acts[i]].r)*ramp(t,s,q.w);});return r;}
function usedRaw(q,t){let u=ACT[q.acts[0]].r*t;q.sw.forEach((s,i)=>{u+=(ACT[q.acts[i+1]].r-ACT[q.acts[i]].r)*rampInt(t,s,q.w);});return u;}
/* The past follows the ramps; after NOW the rate is held at its value right now. */
const rate=(q,t)=>rateRaw(q,Math.min(t,NOW));
const batt=(q,t)=>t<=NOW?q.b0-usedRaw(q,t):q.now-rateRaw(q,NOW)*(t-NOW);
function makeDay(seed){let q;
  if(seed===1)q={acts:['scroll','game','music'],sw:[40,102],w:12,now:38};
  else{const r=rng(seed*6151+3),pick=L=>L[Math.floor(r()*L.length)];
   for(let i=0;i<200;i++){const a=pick(['scroll','game','video','maps','idle','music']);let b=pick(['scroll','game','video','maps','music']);let c=pick(['scroll','game','video','maps','music']);if(b===a)continue;if(c===b)continue;
    q={acts:[a,b,c],sw:[30+Math.round(r()*30),85+Math.round(r()*25)],w:12,now:28+Math.round(r()*24)};
    const b0=q.now+usedRaw(q,NOW),die=NOW+q.now/rateRaw(q,NOW);if(b0<=100&&b0>=q.now+15&&die>=185&&die<=585)break;}}
  /* Default afternoon: nudge the end of the gaming stretch so the phone starts at exactly 82%, matching the log. */
  if(seed===1)q.sw[1]-=(usedRaw(q,NOW)-44)/(ACT.game.r-ACT.music.r);
  q.seed=seed;q.b0=q.now+usedRaw(q,NOW);q.die=NOW+q.now/rateRaw(q,NOW);
  q.log=[];for(let t=0;t<=NOW;t+=10)q.log.push([t,Math.round(batt(q,t))]);
  return q;}
const D=sim=>sim.st.day;
const nowRate=sim=>rateRaw(D(sim),NOW);
const avgRate=sim=>{const q=D(sim);return (q.b0-q.now)/NOW;};
const logAt=(sim,t)=>{const e=D(sim).log.find(p=>p[0]===t);return e?e[1]:null;};
const tableRate=sim=>(logAt(sim,110)-logAt(sim,130))/20;
const lastTwo=sim=>(logAt(sim,120)-logAt(sim,130))/10;
/* Deep dive: the tangent line at an earlier time a, used to predict the battery at 2:10. */
const tanAt=(sim,a)=>{const q=D(sim);return batt(q,a)-rate(q,a)*(NOW-a);};
const curv=(sim,a)=>{const q=D(sim),h=0.5;return -(rateRaw(q,a+h)-rateRaw(q,a-h))/(2*h);};
const shown=sim=>!!(sim.st.peek||(sim.gutS&&sim.gutS.g));
const clock=t=>{let m=Math.round(t);const h=12+Math.floor(m/60);m-=Math.floor(m/60)*60;const hh=h>12?h-12:h;return hh+':'+String(m).padStart(2,'0')+' '+(h>=12?'pm':'am');};
const f2=v=>fmtNum(v,2);
const mins=m=>{m=Math.round(Math.abs(m));const h=Math.floor(m/60),r=m-60*h;return h?h+' h '+r+' min':r+' min';};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)&&!(sim.guide&&sim.guide.keep)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function relabel(sim){[['guess',v=>clock(v)],['from',v=>clock(v)]].forEach(([id,f])=>{const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW[id];if(!w)return;const o=w.querySelector('output');if(!o)return;const s=f(sim.p[id]);if(o.textContent!==s)o.textContent=s;});}
const pctAt630=sim=>batt(D(sim),NEED);

const SIM={
 id:'battery',hash:'battery',apUnit:16,order:2,tab:'When will my phone die?',kind:'Simulation',prereq:['runpace'],next:['camerapan'],
 card:'Guess when your phone hits 0% from your battery log, then let the tangent line at “right now” predict it.',
 title:'When will my phone die?',
 lede:{bio:'Your battery log shows how fast the percentage has been falling. But what you were doing an hour ago does not drain your battery now. What matters is how fast it is falling right now.',
  honors:'The drain rate right now is the derivative of the battery curve, in percent per minute. If you keep doing the same thing, the tangent line at this moment is your forecast.',
  ap:'The tangent line is the local linearization L(t) = B(a) + B′(a)(t − a). Where the curve is concave up, the tangent line sits below it and underestimates; where it is concave down, it overestimates.'},
 scale:'One afternoon and evening, noon to 10 pm. Battery in percent. You logged the battery every 10 minutes, in whole percents, the way the phone shows it.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your afternoon',
 controls:[
  {id:'guess',label:'Your gut: your phone hits 0% at',type:'range',min:140,max:600,step:5,def:160,unit:' min after noon',help:'The orange dashed line runs from 38% now to your guess at 0%.'},
  {id:'avgline',label:'Show the average-rate line',type:'toggle',def:false,noGut:true,help:'A straight line from noon through right now: what you get if you assume the phone keeps draining at its average rate since noon.'},
  {id:'from',label:'Tangent line from an earlier time',type:'range',min:10,max:130,step:5,def:100,unit:' min after noon',lvl:'ap',noGut:true,onChange(sim){sim.st.showFrom=true;},help:'Draw the tangent line at this earlier time and see how well it predicts the battery at 2:10 pm.'}
 ],
 actions:[
  {id:'peek',label:'Skip the guess and show the math',run(sim){sim.st.peek=true;}},
  {id:'newday',label:'New afternoon',run(sim){sim.st={day:makeDay(2+Math.floor(Math.random()*1e6))};sim.st.peek=false;clearGut(sim);}}
 ],
 init(){return {day:makeDay(1)};},step(){},
 metrics:[
  {id:'rate',label:'Drain rate right now',unit:'% per min',d:2,min:0,max:1,get:sim=>shown(sim)?nowRate(sim):null},
  {id:'die',label:'Tangent line hits 0% at',unit:'',text:true,get:sim=>shown(sim)?clock(D(sim).die):'?'},
  {id:'at630',label:'Battery left at 6:30 pm',unit:'',text:true,get:sim=>{if(!shown(sim))return '?';const v=pctAt630(sim);return v>0?Math.round(v)+'%':'dead by '+clock(D(sim).die);}},
  {id:'avg',label:'Average drain since noon',unit:'% per min',d:2,min:0,max:1,get:avgRate},
  {id:'two',label:'Rate from the last two readings',unit:'% per min',d:2,lvl:'honors',min:0,max:1,get:sim=>shown(sim)?lastTwo(sim):null},
  {id:'sym',label:'Symmetric estimate at 2:00 pm',unit:'% per min',d:3,lvl:'honors',min:0,max:1,get:sim=>shown(sim)?tableRate(sim):null},
  {id:'lin',label:'Earlier tangent line predicts at 2:10 pm',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>shown(sim)?tanAt(sim,sim.p.from):null},
  {id:'linerr',label:'Prediction minus actual at 2:10 pm',unit:'points',d:1,lvl:'ap',min:-20,max:20,get:sim=>shown(sim)?tanAt(sim,sim.p.from)-D(sim).now:null}
 ],
 graphs:[{id:'rateg',label:'Drain rate over the afternoon (the derivative)',custom:true}],defaultGraph:'rateg',
 plot(sim,ctx,box){const q=D(sim);const ax=axes(ctx,box,{xmin:0,xmax:TEND,ymin:0,ymax:0.6,xl:'Minutes after noon',yl:'Drain rate (% per min)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=0;t<=NOW;t+=1){const x=ax.X(t),y=ax.Y(rate(q,t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(NOW),ax.Y(nowRate(sim)));ctx.lineTo(ax.X(q.die),ax.Y(nowRate(sim)));ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=PAL['s1'];ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(avgRate(sim)));ctx.lineTo(ax.X(NOW),ax.Y(avgRate(sim)));ctx.stroke();ctx.setLineDash([]);
  legend(ctx,box.L+10,box.T+12,[{label:'Rate (dashed: assumed from now on)',color:PAL['rj']},{label:'Average since noon',color:PAL['s1'],dash:true}]);},
 draw(sim,ctx,vdt,k){relabel(sim);const q=D(sim),sh=shown(sim),G=sim.gutS,fs=12*k;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=Math.round(30+30*k),R=784,T=Math.round(48+34*k),B=Math.round(450-24-24*k);
  const X=t=>L+t/TEND*(R-L),Y=b=>B-b/100*(B-T);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X(NOW),T,R-X(NOW),B-T);
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const hs=k>1.3?120:60;
  for(let t=0;t<=TEND;t+=hs){const x=X(t);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,B);ctx.stroke();ctx.globalAlpha=1;const h=12+t/60;txt(ctx,(h>12?h-12:h)+(t===0?' noon':' pm'),x,B+fs+4,{s:fs,c:PAL['cv-soft'],a:t===0?'left':(t===TEND?'right':'center')});}
  for(let b=0;b<=100;b+=20){const y=Y(b);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,b+'%',L-6,y+4,{s:fs,c:PAL['cv-soft'],a:'right'});}
  /* activity strip just under the top edge */
  const sy=T+3,sh2=Math.round(16*k),cols=['s5','s1','s6'];
  const edges=[0,q.sw[0],q.sw[1],NOW];for(let i=0;i<3;i++){const x0=X(edges[i]),x1=X(edges[i+1]);ctx.fillStyle=PAL[cols[i]];ctx.globalAlpha=.85;ctx.fillRect(x0,sy,x1-x0,sh2);ctx.globalAlpha=1;
   const lab=ACT[q.acts[i]].s;ctx.font='700 '+(11*k)+'px '+BioLab.h.FONT;if(ctx.measureText(lab).width<x1-x0-6)txt(ctx,lab,(x0+x1)/2,sy+sh2/2+1,{s:11*k,w:700,c:'#fff',a:'center',b:'middle'});}
  ctx.fillStyle=PAL[cols[2]];ctx.globalAlpha=.3;ctx.fillRect(X(NOW),sy,R-X(NOW),sh2);ctx.globalAlpha=1;
  txt(ctx,ACT[q.acts[2]].l+' from now on (assumed)',X(NOW)+6,sy+sh2/2+1,{s:11*k,w:700,c:PAL['cv-ink'],b:'middle'});
  /* need-until line */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(X(NEED),sy+sh2+4);ctx.lineTo(X(NEED),B);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Need it until 6:30',X(NEED)+5,sy+sh2+14*k,{s:fs,w:700});
  /* average line */
  if(sim.p.avgline){const ar=avgRate(sim),z=NOW+q.now/ar;ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.setLineDash([3,5]);ctx.beginPath();ctx.moveTo(X(0),Y(q.b0));ctx.lineTo(X(z),Y(0));ctx.stroke();ctx.setLineDash([]);}
  /* past curve and log */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=0;t<=NOW;t+=1){const x=X(t),y=Y(batt(q,t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.fillStyle=PAL['s2'];q.log.forEach(([t,b])=>{ctx.beginPath();ctx.arc(X(t),Y(b),3.6,0,7);ctx.fill();});
  /* ap: an earlier tangent line */
  if(sh&&atLeast('ap')&&sim.st.showFrom){const a=sim.p.from,ba=batt(q,a),ra=rate(q,a);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(Math.max(0,a-40)),Y(ba+ra*Math.min(40,a)));ctx.lineTo(X(NOW+20),Y(ba-ra*(NOW+20-a)));ctx.stroke();
   ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(a),Y(ba),5,0,7);ctx.fill();ctx.beginPath();ctx.arc(X(NOW),Y(tanAt(sim,a)),4.5,0,7);ctx.fill();}
  /* gut */
  const gv=G&&G.g?G.g.t:sim.p.guess;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(X(NOW),Y(q.now));ctx.lineTo(X(gv),Y(0));ctx.stroke();ctx.setLineDash([]);
  ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(gv),Y(0),8,0,7);ctx.stroke();
  /* math: tangent line at now */
  if(sh){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(NOW-30),Y(q.now+nowRate(sim)*30));ctx.lineTo(X(q.die),Y(0));ctx.stroke();ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(X(q.die),Y(0),6,0,7);ctx.fill();}
  else txt(ctx,'?',X((NOW+TEND)/2),Y(45),{s:34*k,w:700,c:PAL['rj'],a:'center'});
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(X(NOW),Y(q.now),6,0,7);ctx.fill();
  txt(ctx,q.now+'% at 2:10',X(NOW)+9,Y(q.now)-9,{s:fs,w:700});
  /* key pills */
  const ps=Math.min(13*k,20);ctx.font='700 '+ps+'px '+BioLab.h.FONT;const items=[[(G&&G.g?'Your gut: 0% at ':'Your guess: 0% at ')+clock(gv),PAL['s4']]];
  if(sh)items.push(['Tangent line: 0% at '+clock(q.die),PAL['s3']]);
  if(sim.p.avgline)items.push(['Average rate: 0% at '+clock(NOW+q.now/avgRate(sim)),PAL['s1']]);
  let x=R,row=0;const y0=Math.round(8+ps);items.forEach(([s,c])=>{const w=ctx.measureText(s).width+ps*1.1;if(x-w<8){row++;x=R;}pill(ctx,s,x-w/2,y0+row*ps*1.9,c,'#fff',ps);x-=w+8;});},
 narrate(sim){const q=D(sim);
  if(!shown(sim))return `Since noon your phone fell from ${Math.round(q.b0)}% to ${q.now}%. <b>But the rate has changed with what you were doing.</b> Drag your guess for when it hits 0%, then lock it in.`;
  const r=nowRate(sim),ar=avgRate(sim),v=pctAt630(sim);
  return `Right now the battery is falling ${f2(r)}% per minute, ${r<ar?'slower':'faster'} than its ${f2(ar)}% per minute average since noon. <b>Keep doing what you are doing and the tangent line hits 0% at ${clock(q.die)}</b>${v>0?`, with ${Math.round(v)}% left at 6:30 pm.`:', before 6:30 pm. Time for a charger.'}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'When will your phone hit 0%? Drag the slider here to the time you think. The orange dashed line shows your guess. Then lock it in.',honors:'Before you see the tangent line: drag the slider here to when you think the phone hits 0%, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-D(sim).die),t:g,label:'0% at '+clock(g)};},
  solve(sim){const q=D(sim);sim.st.peek=true;return {v:0,t:q.die,label:'0% at '+clock(q.die)};},
  how:{bio:'The math ignores the average since noon and asks how fast the battery is falling right now: the steepness of the curve at 2:10. If you keep doing the same thing, the battery keeps falling at that rate, so the line at that steepness (the tangent line) shows when it reaches 0%.',
   honors:'The derivative B′(2:10) is the slope of the tangent line, in % per minute. Time left = battery now ÷ drain rate.',
   ap:'L(t) = B(130) + B′(130)(t − 130) with t in minutes after noon. Setting L(t) = 0 gives t = 130 + B(130) / |B′(130)|.'},
  compare(sim,g,m){const off=g.t-m.t,need=v=>v>=NEED;const same=need(g.t)===need(m.t);
   if(Math.abs(off)<=10)return `Your gut was right on: within ${mins(off)}. The phone hits 0% at <b>${clock(m.t)}</b>${need(m.t)?', so you make it to 6:30 pm.':', before 6:30 pm.'}`;
   let s=`You were <b>${mins(off)} ${off<0?'too early':'too late'}</b>. `;
   if(!same&&need(m.t))s+=`Your gut said the phone would die before 6:30 pm, but at today’s rate it lasts until ${clock(m.t)}. You would have hunted for a charger or cut your plans short for nothing.`;
   else if(!same)s+=`Your gut said you would make it to 6:30 pm, but at today’s rate the phone dies at ${clock(m.t)}: <b>${mins(NEED-m.t)} before you need it</b>.`;
   else s+=`You made the right call about 6:30 pm, but the real 0% time is ${clock(m.t)}.`;
   return s+(off<0?' Your gut weighed the fast drain earlier in the day; the tangent line only uses the rate right now.':' Your gut underestimated how fast the battery is falling right now.');},
  again(sim){sim.st={day:makeDay(2+Math.floor(Math.random()*1e6))};sim.st.peek=false;sim.p.guess=160;sim.p.avgline=false;}
 },
 onTourExit(sim){sim.st.peek=false;sim.st.showFrom=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'Your phone fell from 82% at noon to 38% at 2:10, but you have only been listening to music for the last half hour. Which number best predicts the next hour?',choices:['The average since noon, 0.34% per minute','The rate right now, 0.12% per minute','Neither: batteries are random'],correct:1,explain:'The gaming earlier drained the battery fast, but you stopped. Right now it falls 0.12% per minute, so in the next hour it should lose about 7 points, not 20.'},
  {lvl:'bio',instant:true,q:'On the battery graph, how can you tell when the phone was draining fastest?',choices:['Where the curve is lowest','Where the curve is steepest','Where the curve is highest'],correct:1,explain:'Steepness is percent lost per minute. The curve is steepest during the gaming stretch, around 0.5% per minute.'},
  {lvl:'honors',instant:true,q:'Your log: 1:50 pm, 40%. 2:00 pm, 39%. 2:10 pm, 38%. What is the best estimate of the drain rate at 2:00 pm?',choices:['0.05% per minute','0.10% per minute','0.20% per minute','1% per minute'],correct:1,explain:'Use the readings on both sides: (40 − 38) ÷ 20 min = 0.10% per minute. The true rate is 0.12% per minute; the log rounds to whole percents, which makes any estimate from a few readings rough.'},
  {lvl:'honors',instant:true,q:'At 2:10 pm your battery is 38% and falling 0.12% per minute. If you keep doing the same thing, when does it hit 0%?',choices:['About 4:00 pm','About 5:20 pm','About 7:27 pm','About 9:00 pm'],correct:2,explain:'Time left = 38 ÷ 0.12 ≈ 317 minutes, or 5 h 17 min. 2:10 pm + 5 h 17 min ≈ 7:27 pm.'},
  {lvl:'ap',instant:true,q:'At 1:40 pm the drain rate is dropping as the gaming winds down, so the battery curve is concave up there. The tangent line at 1:40 predicts the battery at 2:10. The prediction is:',choices:['Too low: an underestimate','Too high: an overestimate','Exactly right'],correct:0,explain:'On a concave-up curve the tangent line sits below the curve, so it underestimates. Here it predicts 31.4% at 2:10 against the actual 38%: it assumes you keep draining at the 1:40 rate, but the rate kept slowing.'},
  {lvl:'ap',instant:true,q:'Around 12:40 pm you start gaming, so the drain rate is climbing and the curve is concave down. The tangent line at 12:40 predicts the battery 20 minutes later. That prediction is:',choices:['Too low','Too high','Exactly right'],correct:1,explain:'Concave down means the tangent line lies above the curve, so it overestimates the battery. It assumed the 12:40 drain rate would continue, but the rate kept rising toward 0.5% per minute.'}
 ],
 tour:[
  {title:'Your battery log',text:'Each dot is a reading you logged, every 10 minutes. The colored strip shows what you were doing: scrolling, then gaming, then music. The phone fell from 82% at noon to 38% at 2:10.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{avgline:false,from:100});sim.st.showFrom=false;}},
  {title:'The average misleads',text:'Since noon the phone lost 44 points in 130 minutes: 0.34% per minute on average. At that rate it would die at 4:02 pm. But most of that drain came from the gaming, and you stopped.',pause:true,setup:sim=>BioLab.setValues(sim,{avgline:true})},
  {title:'Steepness is the rate',text:'Look at how steep the curve is in each stretch. While gaming it fell about 0.5% per minute. Now, with music and texting, it falls only 0.12% per minute. The rate itself changed.',pause:true,setup:sim=>BioLab.setValues(sim,{avgline:false})},
  {title:'The tangent line forecasts',text:'The green line has the curve’s steepness right at 2:10: the tangent line. If you keep doing the same thing, the battery follows it: 38 ÷ 0.12 ≈ 317 minutes, so 0% at about 7:27 pm. You make it to 6:30 pm with about 7% left.',pause:true},
  {lvl:'honors',title:'Reading the rate from your log',text:'You can estimate the rate from the table. The readings on both sides of 2:00 pm give (40 − 38) ÷ 20 = 0.10% per minute: the symmetric difference. Whole-percent readings make it rough; over a longer stretch at the same activity it gets better.',pause:true},
  {lvl:'ap',title:'Over or under?',text:'The purple line is the tangent line at 1:40 pm, while the drain was still slowing. The curve is concave up there, so the tangent sits below it: it predicts 31.4% at 2:10 instead of 38%. An underestimate.',pause:true,setup:sim=>{BioLab.setValues(sim,{from:100});sim.st.showFrom=true;}}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the rate right now change the forecast?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Record a trial. Turn on the average-rate line and compare the two 0% times.</li><li>Press <b>New afternoon</b> three times and record each.</li></ol><p>Write one sentence: when does the average since noon give a forecast that is too early, and when too late?</p>',
  honors:'<p><b>Question:</b> How good is a rate read from the log?</p><ol><li>Compare <b>Rate from the last two readings</b>, the <b>symmetric estimate</b> and the true <b>Drain rate right now</b>.</li><li>Repeat for three new afternoons.</li></ol><p>Explain why whole-percent readings make a 10-minute estimate rough.</p>',
  ap:'<p><b>Question:</b> When does a tangent line overestimate?</p><ol><li>Move <b>Tangent line from an earlier time</b> through the afternoon. Record its prediction for 2:10 and the error.</li><li>Note whether the drain rate was rising or falling at that time.</li></ol><p><b>CER:</b> Connect the sign of the error to the concavity of B(t).</p>'},
 terms:[
  {t:'Rate of change',d:'How fast one quantity changes compared with another. Here: percent of battery per minute.'},
  {t:'Tangent line',d:'The line through a point on a curve with the curve’s steepness at that point. Used as a forecast, it assumes the rate stays the same.'},
  {t:'Derivative',d:'B′(t): the instantaneous rate of change of the battery. Negative here, because the battery falls.',lvl:'honors'},
  {t:'Symmetric difference',d:'Estimate of the derivative from a table using points on both sides: [B(t + h) − B(t − h)] ÷ 2h.',lvl:'honors'},
  {t:'Local linearization',d:'L(t) = B(a) + B′(a)(t − a): the tangent line used to approximate B near a.',lvl:'ap'},
  {t:'Concavity',d:'Concave up: the slope is increasing and tangent lines sit below the curve. Concave down: the slope is decreasing and tangent lines sit above it.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model, not a battery spec.</b> Each activity drains at a fixed rate, and the rate ramps smoothly over 12 minutes when you switch. The rates are assumptions for illustration: music and texting 0.12% per minute (about 7% an hour), scrolling 0.25, streaming video 0.3, maps with GPS 0.4, gaming 0.5, screen off 0.03. Real drain depends on the phone, its age, screen brightness, signal strength and temperature.</p><p><b>From 2:10 pm on, the model assumes you keep doing what you are doing now</b>, so the battery falls along the tangent line. Phones also report whole percents, and real readings can drop unevenly near the end. <b>New afternoon</b> picks new activities from a seeded random generator.</p>'
};
SIM._m={makeDay,batt,rate,rateRaw,nowRate,avgRate,tableRate,lastTwo,tanAt,curv,clock,NOW};
BioLab.register(SIM);
})();
