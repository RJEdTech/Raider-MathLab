(function(){
'use strict';
const {clamp,rng,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* 20 logged school mornings per route, door to door, in whole minutes.
   Route A: city bus plus one transfer. Most mornings 25 to 33 min; on 4 mornings the transfer was missed.
   Route B: one longer direct bus. Steady, 31 to 38 min, plus one slow-traffic morning. */
const DEF_A=[25,26,26,27,27,28,28,28,29,29,30,30,31,31,32,33,41,42,44,47];
const DEF_B=[31,32,32,33,33,33,34,34,34,34,35,35,35,36,36,36,37,37,38,41];
const DAYS=90;                                   /* school days in a semester */
const XMIN=20,XMAX=52,XL=150,XR=760,X=m=>XL+(m-XMIN)/(XMAX-XMIN)*(XR-XL);
const YA=150,YB=300,AX=362;                      /* dot baselines and the axis */
const sortN=a=>a.slice().sort((x,y)=>x-y);
const med=a=>{const n=a.length,h=n>>1;return n%2?a[h]:(a[h-1]+a[h])/2;};
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1));};
/* Quartiles as the TI-84 finds them: medians of the lower and upper halves (the median itself is left out when n is odd). */
function five(a0){const a=sortN(a0),n=a.length,h=n>>1,lo=a.slice(0,h),hi=a.slice(n%2?h+1:h),q1=med(lo),q3=med(hi),iqr=q3-q1,hf=q3+1.5*iqr,lf=q1-1.5*iqr;
 const inl=a.filter(v=>v<=hf&&v>=lf);return {min:a[0],max:a[n-1],q1,m:med(a),q3,iqr,hf,lf,wlo:inl[0],whi:inl[inl.length-1],out:a.filter(v=>v>hf||v<lf)};}
const late=(a,b)=>a.filter(v=>v>b).length;
const data=(sim,r)=>sim.st[r];
const lateOf=(sim,r)=>late(data(sim,r),sim.p.leave);
const clock=b=>{const m=50-b;return '7:'+String(m).padStart(2,'0');};
const per=n=>{const v=n*DAYS/20;return Number.isInteger(v)?String(v):`about ${Math.floor(v)} or ${Math.ceil(v)}`;};
const f1=v=>fmtNum(v,1);
/* The latest you can leave and be late at most once in the 20 logged mornings. */
const safeBuf=a=>{for(let b=15;b<=70;b++)if(late(a,b)<=1)return b;return 70;};
/* New logs come from a seeded generator, so the same data scores both answers. */
function gen(seed){const r=rng(seed*7919+13),nrm=()=>{const u=Math.max(r(),1e-9),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};const A=[],B=[];
 for(let i=0;i<20;i++){let a=28.5+2.3*nrm();if(r()<0.2)a+=9+6*r();A.push(clamp(Math.round(a),22,51));let b=34.5+1.8*nrm();if(r()<0.06)b+=4+3*r();B.push(clamp(Math.round(b),28,51));}
 return {A:sortN(A),B:sortN(B)};}
const TOUR=sim=>!!(sim.tour&&sim.tour.on);
const GS=sim=>TOUR(sim)?null:sim.gutS;
const shown=sim=>!!(sim.p.bell||(GS(sim)&&GS(sim).g));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const NAME={A:'Route A',B:'Route B'},DESC={A:'Bus + transfer',B:'Direct bus'};

const SIM={
 id:'busroute',hash:'busroute',apUnit:13,order:1,tab:'Which bus is faster?',kind:'Simulation',
 card:'Pick the bus route you would ride by feel, then compare center and spread to see which one gets you to the 7:50 bell on time.',
 title:'Which bus gets you there on time?',
 lede:{bio:'You logged 20 school mornings on each of two bus routes. One is faster on an average morning. The other is steadier. To beat the bell, what matters is not just the typical morning but how bad the bad mornings get.',
  honors:'Center (median, mean) tells you about a typical morning; spread (IQR, standard deviation) tells you how far mornings stray from it. A boxplot shows both at once, and the 1.5 × IQR rule flags the outliers.',
  ap:'For skewed data the median and IQR describe the center and spread better than the mean and SD, because the tail pulls on the mean and inflates the SD. Your real question is a tail question: how often is a morning longer than the time you allow?'},
 scale:'Each dot is one logged school morning, door to door, in minutes. First bell is at 7:50.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your commute',
 controls:[
  {id:'route',label:'Your route',type:'seg',def:'A',options:[{v:'A',l:'Route A: city bus with one transfer'},{v:'B',l:'Route B: longer direct bus'}]},
  {id:'leave',label:'You leave home this many minutes before the 7:50 bell',type:'range',min:30,max:50,step:1,def:40,unit:' min',noGut:true,onChange:clearGut,help:'40 minutes means you walk out the door at 7:10.'},
  {id:'bell',label:'Show the bell line and late mornings',type:'toggle',def:false,noGut:true}
 ],
 actions:[
  {id:'newlog',label:'Log 20 new mornings',run(sim){sim.st.seed=(sim.st.seed||0)+1;const g=gen(sim.st.seed);sim.st.A=g.A;sim.st.B=g.B;clearGut(sim);}},
  {id:'safe',label:'Find the latest safe time to leave',lvl:'honors',run(sim){const b=safeBuf(data(sim,sim.p.route));BioLab.setValues(sim,{leave:clamp(b,30,50),bell:true});}}
 ],
 init(){return {A:DEF_A.slice(),B:DEF_B.slice(),seed:0};},step(){},
 metrics:[
  {id:'lateA',label:'Route A: late mornings out of 20',unit:'',d:0,min:0,max:20,get:sim=>shown(sim)?lateOf(sim,'A'):null},
  {id:'lateB',label:'Route B: late mornings out of 20',unit:'',d:0,min:0,max:20,get:sim=>shown(sim)?lateOf(sim,'B'):null},
  {id:'meanA',label:'Route A average',unit:'min',d:1,min:0,max:60,get:sim=>mean(data(sim,'A'))},
  {id:'meanB',label:'Route B average',unit:'min',d:1,min:0,max:60,get:sim=>mean(data(sim,'B'))},
  {id:'medA',label:'Route A median',unit:'min',d:1,lvl:'honors',min:0,max:60,get:sim=>five(data(sim,'A')).m},
  {id:'medB',label:'Route B median',unit:'min',d:1,lvl:'honors',min:0,max:60,get:sim=>five(data(sim,'B')).m},
  {id:'iqrA',label:'Route A IQR',unit:'min',d:1,lvl:'honors',min:0,max:30,get:sim=>five(data(sim,'A')).iqr},
  {id:'iqrB',label:'Route B IQR',unit:'min',d:1,lvl:'honors',min:0,max:30,get:sim=>five(data(sim,'B')).iqr},
  {id:'sdA',label:'Route A standard deviation',unit:'min',d:2,lvl:'ap',min:0,max:20,get:sim=>sd(data(sim,'A'))},
  {id:'sdB',label:'Route B standard deviation',unit:'min',d:2,lvl:'ap',min:0,max:20,get:sim=>sd(data(sim,'B'))},
  {id:'safe',label:'Latest time to leave, late at most 1 morning in 20',text:true,lvl:'honors',get:sim=>`Route A: ${clock(safeBuf(data(sim,'A')))} · Route B: ${clock(safeBuf(data(sim,'B')))}`}
 ],
 graphs:[{id:'curve',label:'Late mornings vs. when you leave',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const A=data(sim,'A'),B=data(sim,'B');
  const ax=axes(ctx,box,{xmin:30,xmax:50,ymin:0,ymax:20,xl:'Minutes you leave before the 7:50 bell',yl:'Late mornings out of 20'});
  const line=(a,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,4]:[]);ctx.beginPath();for(let b=30;b<=50;b++){const y=ax.Y(late(a,b));b===30?ctx.moveTo(ax.X(b),y):ctx.lineTo(ax.X(b),y);if(b<50)ctx.lineTo(ax.X(b+1),y);}ctx.stroke();ctx.setLineDash([]);};
  line(A,PAL['s2'],false);line(B,PAL['s3'],true);
  const b=sim.p.leave;ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(b),ax.Y(0));ctx.lineTo(ax.X(b),ax.Y(20));ctx.stroke();
  txt(ctx,'You leave at '+clock(b),ax.X(b)+(b>44?-6:6),ax.Y(19),{s:12,w:700,c:PAL['rj'],a:b>44?'right':'left'});
  legend(ctx,box.L+box.W-210,box.T+box.H*0.38,[{label:'Route A',color:PAL['s2']},{label:'Route B',color:PAL['s3'],dash:true}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),hon=atLeast('honors'),ap=atLeast('ap'),b=sim.p.leave,G=GS(sim),kk=k;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* minute grid and axis */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let m=XMIN;m<=XMAX;m++){if(m%5)continue;ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(X(m),40);ctx.lineTo(X(m),AX);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(m),X(m),AX+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(XL-6,AX);ctx.lineTo(XR,AX);ctx.stroke();
  txt(ctx,'Minutes from your front door to the school door',(XL+XR)/2,AX+34*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  const panel=(r,y0,col)=>{const a=data(sim,r),F=five(a),cnt={};let mx=1;a.forEach(v=>{cnt[v]=(cnt[v]||0)+1;mx=Math.max(mx,cnt[v]);});
   const gap=Math.min(15,62/mx),seen={};
   /* name, with gut and math tags */
   txt(ctx,NAME[r],12,y0-50,{s:15*kk,w:700,c:col});txt(ctx,DESC[r],12,y0-50+17*kk,{s:12*kk,c:PAL['cv-soft']});
   const tags=[];if(sim.gutS&&!TOUR(sim)){if(sim.gutS.g&&sim.gutS.g.route===r)tags.push(['Your gut',PAL['s4']]);if(sim.gutS.m&&sim.gutS.m.route===r)tags.push(['The math',PAL['s3']]);}
   if(!tags.length&&sim.p.route===r&&!(sim.gutS&&sim.gutS.g))tags.push(['Your pick',PAL['rj']]);
   tags.forEach((t,i)=>pill(ctx,t[0],12+38*kk,y0-50+40*kk+i*24*kk,t[1],'#fff',12*kk));
   /* dots */
   a.forEach(v=>{seen[v]=(seen[v]||0)+1;const x=X(v),y=y0-(seen[v]-0.5)*gap,isL=sh&&v>b;ctx.fillStyle=isL?PAL['s1']:col;ctx.beginPath();ctx.arc(x,y,Math.min(6.5,gap/2),0,7);ctx.fill();if(isL){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.2;ctx.stroke();}});
   ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(XL-6,y0+1);ctx.lineTo(XR,y0+1);ctx.stroke();
   /* boxplot */
   const by=y0+26,bh=16;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.6;
   const wl=hon?F.wlo:F.min,wh=hon?F.whi:F.max;
   ctx.beginPath();ctx.moveTo(X(wl),by);ctx.lineTo(X(F.q1),by);ctx.moveTo(X(F.q3),by);ctx.lineTo(X(wh),by);ctx.moveTo(X(wl),by-6);ctx.lineTo(X(wl),by+6);ctx.moveTo(X(wh),by-6);ctx.lineTo(X(wh),by+6);ctx.stroke();
   ctx.fillStyle=PAL['card'];ctx.fillRect(X(F.q1),by-bh/2,X(F.q3)-X(F.q1),bh);ctx.strokeRect(X(F.q1),by-bh/2,X(F.q3)-X(F.q1),bh);
   ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(F.m),by-bh/2);ctx.lineTo(X(F.m),by+bh/2);ctx.stroke();
   if(hon)F.out.forEach(v=>{ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;const x=X(v);ctx.beginPath();ctx.moveTo(x-4,by-4);ctx.lineTo(x+4,by+4);ctx.moveTo(x+4,by-4);ctx.lineTo(x-4,by+4);ctx.stroke();});
   if(ap){ctx.setLineDash([2,3]);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(Math.min(F.hf,XMAX)),by-10);ctx.lineTo(X(Math.min(F.hf,XMAX)),by+10);ctx.stroke();ctx.setLineDash([]);}
   /* mean marker under the line */
   const mu=mean(a),mx2=X(mu);ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(mx2,y0+4);ctx.lineTo(mx2-6,y0+14);ctx.lineTo(mx2+6,y0+14);ctx.closePath();ctx.fill();
   txt(ctx,(hon?'mean ':'average ')+f1(mu),mx2+9,y0+15,{s:12*kk,w:700,c:PAL['s4']});
   /* late count */
   if(sh){const n=late(a,b);pill(ctx,`Late ${n} of 20`,700,y0-62,n?PAL['s1']:PAL['s3'],'#fff',13*kk);}
  };
  panel('A',YA,PAL['s2']);panel('B',YB,PAL['s3']);
  /* the bell line */
  const bx=X(b);
  if(sh){ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.setLineDash([8,5]);ctx.beginPath();ctx.moveTo(bx,46);ctx.lineTo(bx,AX);ctx.stroke();ctx.setLineDash([]);
   pill(ctx,`Bell at 7:50 if you leave ${clock(b)}`,clamp(bx,150,560),22,PAL['rj'],'#fff',13*kk);}
  else txt(ctx,`You leave at ${clock(b)}: ${b} minutes before the 7:50 bell`,(XL+XR)/2,24,{s:13*kk,w:700,c:PAL['cv-ink'],a:'center'});
  /* key, bottom */
  const key=hon?'Box: Q1 to Q3 · line: median · ▲: mean · ×: outlier':'Box: middle half of your mornings · line: middle morning · ▲: average';
  txt(ctx,key,12,447,{s:12*kk,c:PAL['cv-soft']});},
 narrate(sim){const A=data(sim,'A'),B=data(sim,'B'),b=sim.p.leave,la=late(A,b),lb=late(B,b),ma=mean(A),mb=mean(B);
  if(!shown(sim))return `Route A's average is ${f1(ma)} min and Route B's is ${f1(mb)} min. <b>The average is only the center.</b> Look at how far the dots spread out, too: you have ${b} minutes.`;
  const better=la<lb?'A':lb<la?'B':null;
  if(!better)return `Leaving at ${clock(b)}, both routes are late ${la} of 20 mornings. <b>A tie:</b> leave a minute earlier or later and the spread decides it.`;
  const lowAvg=ma<mb?'A':'B';
  if(better!==lowAvg)return `Leaving at ${clock(b)}, Route ${better} is late ${Math.min(la,lb)} of 20 mornings and Route ${lowAvg} ${Math.max(la,lb)}. <b>The lower average loses here:</b> its long tail of slow mornings crosses the bell line.`;
  return `Leaving at ${clock(b)}, Route ${better} is late ${Math.min(la,lb)} of 20 mornings and Route ${better==='A'?'B':'A'} ${Math.max(la,lb)}. <b>With this little time, the lower center wins:</b> the steady route's typical morning is already too long.`;},
 gut:{better:'lower',controls:['route'],
  ask:{bio:'Look at the 20 mornings you logged on each route. Pick the route here that you would ride to make the 7:50 bell, leaving at the time shown above the picture. Then lock it in.',
   honors:'Before you look at the bell line: pick the route here that will make you late least often, leaving at the time shown. Then lock it in.'},
  lock(sim){const r=sim.p.route,n=lateOf(sim,r);return {v:n,route:r,label:`${NAME[r]} (late ${n} of the 20 mornings)`};},
  solve(sim){const la=lateOf(sim,'A'),lb=lateOf(sim,'B'),r=la<lb?'A':lb<la?'B':sim.p.route;sim.p.route=r;sim.p.bell=true;const n=lateOf(sim,r);return {v:n,route:r,label:`${NAME[r]} (late ${n} of the 20 mornings)`};},
  how:{bio:'The math draws the bell line at the time you have, then counts the mornings on each route that land past it. The average cannot do that: it hides how far the slow mornings stray.',
   honors:'Compare the boxplots against the bell line. The box and median show the typical morning; the whisker and outliers show the bad ones. Count the mornings longer than the time you allow.',
   ap:'The question is P(commute > time allowed), estimated by the share of logged mornings past the line. Center alone cannot answer it; you need the right tail of each distribution.'},
  compare(sim,g,m){const b=sim.p.leave,ma=mean(data(sim,'A')),mb=mean(data(sim,'B')),lowAvg=ma<mb?'A':'B';
   if(g.route===m.route){const o=m.route==='A'?'B':'A',no=lateOf(sim,o);
    if(no===m.v)return `Your gut was right on, and here it is a tie: both routes are late ${m.v} of 20 mornings leaving at ${clock(b)}. Over a ${DAYS}-day semester that is ${per(m.v)} late mornings either way.`;
    return `Your gut was right on. ${NAME[m.route]} is late ${m.v} of 20 mornings; ${NAME[o]} is late ${no}. Over a ${DAYS}-day semester that is ${per(m.v)} late mornings instead of ${per(no)}. ${m.route===lowAvg?'Here the lower center wins.':'You looked past the lower average to the spread, which is exactly the point.'}`;}
   const d=g.v-m.v;
   return `${NAME[m.route]} is late <b>${m.v}</b> of 20 mornings, and ${NAME[g.route]} is late <b>${g.v}</b>. Over a ${DAYS}-day semester that is <b>${per(m.v)} late mornings instead of ${per(g.v)}</b>: ${per(d)} fewer. ${g.route===lowAvg?`${NAME[g.route]} has the lower average (${f1(g.route==='A'?ma:mb)} min against ${f1(g.route==='A'?mb:ma)}), but its slow mornings stray so far that they cross the bell line.`:`${NAME[g.route]} is steadier, but leaving at ${clock(b)} even its typical morning is too long.`}`;},
  again(sim){sim.st.seed=(sim.st.seed||0)+1;const g=gen(sim.st.seed);sim.st.A=g.A;sim.st.B=g.B;sim.p.leave=34+Math.floor(Math.random()*11);sim.p.route='A';sim.p.bell=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Route A’s average morning is 3.1 minutes shorter than Route B’s. Does that mean Route A makes you late less often?',choices:['Yes: a lower average always means fewer late mornings','Not necessarily: it depends on how spread out the mornings are and how much time you allow','No: the lower average always means more late mornings'],correct:1,explain:'Leaving at 7:10, Route A is late 4 of 20 mornings and Route B only 1, even though A’s average is lower (31.7 min against 34.8). Leaving at 7:15, it flips: A is late 4 times and B 7 times. The average alone cannot tell you.'},
  {lvl:'bio',instant:true,q:'Which route’s mornings are more spread out?',choices:['Route A: from 25 to 47 minutes','Route B: from 31 to 41 minutes','They are spread out the same'],correct:0,explain:'Route A’s mornings cover a range of 47 − 25 = 22 minutes; Route B’s cover 41 − 31 = 10 minutes. The missed transfers stretch A’s mornings far to the right.'},
  {lvl:'honors',instant:true,q:'For Route A, Q1 = 27.5 min and Q3 = 32.5 min. By the 1.5 × IQR rule, which of these mornings would be an outlier?',choices:['A 39-minute morning','A 41-minute morning','Both','Neither'],correct:1,explain:'IQR = 32.5 − 27.5 = 5 min. The upper fence is Q3 + 1.5 × IQR = 32.5 + 7.5 = 40 min. A 41-minute morning is past the fence; a 39-minute morning is not.'},
  {lvl:'honors',instant:true,q:'You add one more Route A morning: a 60-minute disaster. Which measure of center barely moves?',choices:['The mean','The median','Both move the same amount'],correct:1,explain:'With 21 mornings the median becomes the 11th value, 30 min (it was 29.5). The mean jumps from 31.7 to 33.0 min. The median is resistant: one extreme value cannot drag it far.'},
  {lvl:'ap',instant:true,q:'Now you can only leave at 7:15, 35 minutes before the bell. Which route makes you late less often?',choices:['Route A: late 4 of 20','Route B: late 7 of 20','They tie'],correct:0,explain:'With 35 minutes, Route A is late only on its 4 missed-transfer mornings, but Route B’s typical morning (median 34.5 min) is right at the line, so it is late 7 times. With little time, the lower center wins; with more time, the smaller spread wins.'},
  {lvl:'ap',instant:true,q:'Route A’s mean is 31.7 min and its median is 29.5 min. Why is the mean higher?',choices:['The data are skewed right: the long tail of slow mornings pulls the mean up','The data are skewed left','The mean is always higher than the median'],correct:0,explain:'The four missed-transfer mornings (41 to 47 min) sit far to the right. The mean adds them in at full size, so it moves toward the tail; the median only cares that they are above the middle. Right skew: mean > median.'}
 ],
 tour:[
  {title:'Your commute log',text:'Each dot is one school morning you logged, from your front door to the school door. The top row is Route A, a city bus with one transfer. The bottom row is Route B, one longer direct bus.',pause:true,setup:sim=>{BioLab.setValues(sim,{leave:40,bell:false,route:'A'});},focus:[[0,60,800,300]]},
  {title:'The averages',text:'The gold triangles mark each route’s average. Route A averages 31.7 minutes and Route B 34.8, so on an average morning A is about 3 minutes faster.',pause:true},
  {title:'The spread',text:'Now look at how far the dots spread out. Route B’s mornings stay between 31 and 41 minutes. Route A’s run from 25 all the way to 47: the four mornings past 40 are the days you missed the transfer.',pause:true},
  {title:'The bell line',text:'You leave at 7:10, so you have 40 minutes. Any morning longer than that is a late one, shown in red. Route A is late 4 of 20 mornings. Route B is late only 1.',pause:true,setup:sim=>BioLab.setValues(sim,{bell:true}),focus:[[400,8,400,360]]},
  {title:'Boxplots',text:'Each box holds the middle half of the mornings, and the thick line inside is the middle morning. Both boxes sit left of the bell line: on a typical day either bus makes it. The tail decides who is late.',pause:true,focus:[[140,165,620,30],[140,315,620,30]]},
  {lvl:'honors',title:'Outliers: the 1.5 × IQR rule',text:'Route A: Q1 = 27.5, Q3 = 32.5, so IQR = 5 min and the fence is 32.5 + 1.5 × 5 = 40 min. Its 41, 42, 44 and 47 minute mornings are outliers (red ×). Route B: IQR = 3, fence 40.5, so its 41-minute morning is one too.',pause:true},
  {title:'Leave later, and it flips',text:'Leave at 7:15 with 35 minutes instead. Route A is still late on its 4 slow mornings, but Route B’s typical morning is right at the line, so B is late 7 times. Now A is the better pick.',pause:true,setup:sim=>BioLab.setValues(sim,{leave:35,bell:true})},
  {lvl:'ap',title:'Mean and standard deviation',text:'Route A’s SD is 6.47 min, nearly three times Route B’s 2.35. Its skew pulls the mean (31.7) above the median (29.5). For skewed data like this, report the median and IQR, and look straight at the tail.',pause:true,setup:sim=>BioLab.setValues(sim,{leave:40,bell:true})}
 ],
 lab:{bio:'<p><b>Question:</b> When is the faster-on-average route the better pick?</p><ol><li>Turn on <b>Show the bell line</b>.</li><li>Set the time you leave to 30, 34, 38, 42 and 46 minutes before the bell. At each, record a trial with both late counts.</li><li>Find the leave time where the better route switches.</li></ol><p>Write one sentence: why does the answer depend on when you leave?</p>',
  honors:'<p><b>Question:</b> How much later can the steady route let you leave?</p><ol><li>Pick Route A and press <b>Find the latest safe time to leave</b>. Record the time.</li><li>Do the same for Route B.</li><li>Find each route’s median, IQR and outliers from the readouts and the boxplots.</li></ol><p>Explain, using spread, why one route lets you sleep later.</p>',
  ap:'<p><b>Question:</b> Do the mean and SD describe these commutes well?</p><ol><li>Record the mean, SD, median and IQR of each route.</li><li>Compute mean + 2 SD for each route and compare it with the latest safe leave time.</li><li>Press <b>Log 20 new mornings</b> three times and repeat.</li></ol><p><b>CER:</b> Claim which summary you would trust for a skewed route, with evidence from your table and reasoning about the tail.</p>'},
 terms:[
  {t:'Center',d:'A typical value for the data, such as the average (mean) or the middle value (median).'},
  {t:'Spread',d:'How far the values stray from each other or from the center, such as the range or IQR.'},
  {t:'Boxplot',d:'A picture of the five-number summary: minimum, Q1, median, Q3 and maximum. The box holds the middle half of the data.'},
  {t:'Median',d:'The middle value when the data are in order. With 20 values, the average of the 10th and 11th.',lvl:'honors'},
  {t:'Quartiles and IQR',d:'Q1 and Q3 are the medians of the lower and upper halves. IQR = Q3 − Q1, the spread of the middle half.',lvl:'honors'},
  {t:'Outlier (1.5 × IQR rule)',d:'A value more than 1.5 × IQR above Q3 or below Q1.',lvl:'honors'},
  {t:'Resistant',d:'A statistic that extreme values cannot drag far. The median and IQR are resistant; the mean and SD are not.',lvl:'honors'},
  {t:'Standard deviation',d:'s = √(Σ(x − x̄)² / (n − 1)): roughly the typical distance of a value from the mean.',lvl:'ap'},
  {t:'Skewed right',d:'A long tail of large values. It pulls the mean above the median.',lvl:'ap'}
 ],
 about:'<p>The 20 mornings per route are made-up but realistic logs, in whole minutes, door to door. Route A’s four slow mornings stand for days when you missed the transfer. You are <b>late</b> when a morning takes longer than the minutes you allow before the 7:50 bell. Late mornings per semester scale the 20 logged mornings up to a 90-day semester, which assumes future mornings look like the logged ones.</p><p>Quartiles use the method on the TI-84 and in most AP Statistics classes: Q1 and Q3 are the medians of the lower and upper halves of the data. Other software may give slightly different quartiles. The standard deviation is the sample SD (dividing by n − 1).</p><p><b>Log 20 new mornings</b> draws a new set from a simple model: Route A about 28.5 ± 2.3 min with a 20% chance of a missed transfer that adds 9 to 15 min; Route B about 34.5 ± 1.8 min with a 6% chance of slow traffic that adds 4 to 7 min. These are assumptions for illustration, not real bus data.</p>'
};
BioLab.register(SIM);
})();
