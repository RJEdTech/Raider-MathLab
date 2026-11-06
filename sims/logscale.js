(function(){
'use strict';
const {clamp,txt,pill,PAL,atLeast,fmtNum,niceStep}=BioLab.h;
/* Fictional cases. n0 = true count on day 0, K = where growth finally levels off (logistic ceiling). */
const CASES={
 outbreak:{n0:120,K:2e7,noun:'cases',what:'reported cases',place:'the fictional country of Norvale',ceil:'20 million'},
 viral:{n0:1500,K:4e7,noun:'views',what:'views',place:'a video from a fictional band, Static Pines',ceil:'40 million'}};
const TARGET=1e6,FIT=14,DAYS=90,SIG=0.05;
function mul(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function gauss(r){let u=0,v=0;while(u===0)u=r();while(v===0)v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
/* One scenario: a logistic curve with 5% day-to-day reporting noise, then a least-squares line through log10(count) for days 0 to 14. */
function make(cs,dbl,seed){const C=CASES[cs],r=Math.LN2/dbl,A=C.K/C.n0-1,R=mul(seed),d=[];
 for(let t=0;t<=DAYS;t++){const tru=C.K/(1+A*Math.exp(-r*t));let v=Math.round(tru*Math.exp(SIG*gauss(R)));if(t>0)v=Math.max(v,d[t-1]);d.push(v);}
 let sx=0,sy=0,sxx=0,sxy=0;const n=FIT+1;for(let t=0;t<=FIT;t++){const y=Math.log10(d[t]);sx+=t;sy+=y;sxx+=t*t;sxy+=t*y;}
 const m=(n*sxy-sx*sy)/(n*sxx-sx*sx),c=(sy-m*sx)/n,tp=(6-c)/m;
 return {d,m,c,b:Math.pow(10,m),dbl:Math.log10(2)/m,tp,mathDay:Math.ceil(tp),act:d.findIndex(v=>v>=TARGET)};}
/* Each case and doubling time gets a fixed noise seed, so the lab, the review and the tests all see the same data. */
const cache={};
function data(sim){const key=sim.p.case+'|'+sim.p.dbl;if(cache[key])return cache[key];
 let h=0;for(const ch of key)h=(h*31+ch.charCodeAt(0))|0;let D;for(let j=0;j<500;j++){D=make(sim.p.case,sim.p.dbl,h+j*7919);if(D.act>0&&D.mathDay===D.act)break;}
 return cache[key]=D;}
const C_=sim=>CASES[sim.p.case];
const com=v=>Math.round(v).toLocaleString('en-US');
const short=v=>v>=1e6?(+(v/1e6).toFixed(1))+'M':v>=1e3?(+(v/1e3).toFixed(1))+'k':String(Math.round(v));
const pace=D=>(D.d[14]-D.d[7])/7;
const paceYears=D=>(TARGET-D.d[14])/pace(D)/365;
const fitAt=(D,t)=>Math.pow(10,D.c+D.m*t);
const keyOf=sim=>sim.p.case+'|'+sim.p.dbl;
/* gut answers belong to one scenario; ignore them if the scenario has changed */
const gutG=sim=>{const G=sim.gutS;return G&&G.g&&G.g.key===keyOf(sim)?G.g:null;};
const solved=sim=>{const G=sim.gutS;return !!(G&&G.m&&G.m.key===keyOf(sim));};
const clearGut=sim=>{if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}};
const showFit=sim=>sim.p.fit||solved(sim);

/* chart frame on the stage */
const L=92,R=782,T=40,B=388;
function frame(sim){const D=data(sim),log=sim.p.axis==='log',after=sim.p.after;
 const X=t=>L+t/DAYS*(R-L);
 let Y,ticks=[],ymax;
 if(log){const lo=1,hi=8;Y=v=>B-(Math.log10(Math.max(v,1))-lo)/(hi-lo)*(B-T);for(let e=lo;e<=hi;e++)ticks.push(Math.pow(10,e));ymax=1e8;}
 else{const top=after?Math.max(...D.d)*1.08:Math.max(...D.d.slice(0,FIT+1))*1.25;const st=niceStep(top,5);ymax=Math.ceil(top/st)*st;Y=v=>B-v/ymax*(B-T);for(let v=0;v<=ymax+1e-9;v+=st)ticks.push(v);}
 return {D,log,after,X,Y,ticks,ymax};}

const SIM={
 id:'logscale',hash:'logscale',apUnit:4,order:7,tab:'Log scales and doubling',kind:'Simulation',
 card:'Guess from two weeks of data when an outbreak passes a million cases, then let logarithms find the day.',
 title:'Seeing exponential growth coming',
 lede:{bio:'Something that doubles every few days looks slow at first and then explodes. A log axis turns that growth into a straight line, so you can see where it is headed while the numbers are still small.',
  honors:'On a log axis, equal steps up mean equal multiplications. Steady exponential growth N = N₀·bᵗ becomes a straight line, and its slope tells you the growth factor b and the doubling time.',
  ap:'Taking logs linearizes the model: log N = log N₀ + t·log b. Fit a line to log N, then solve N₀·bᵗ = 1,000,000 for t = log(1,000,000/N₀) / log b.'},
 scale:'Fictional data. Each dot is one day’s running total. The first 14 days are what you know; days 15 to 90 are the future.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The data',
 controls:[
  {id:'case',label:'What is growing',type:'seg',def:'outbreak',onChange:clearGut,options:[{v:'outbreak',l:'Outbreak'},{v:'viral',l:'Viral video'}],help:'Both are fictional. The outbreak counts reported cases; the video counts views.'},
  {id:'guess',label:'Your guess: the day the count passes 1,000,000',type:'range',min:15,max:90,step:1,def:60,unit:'',help:'Day 0 is the first day of data. Today is day 14.'},
  {id:'axis',label:'Chart axis',type:'seg',def:'lin',options:[{v:'lin',l:'Regular'},{v:'log',l:'Log'}],help:'On the log axis, each gridline is 10 times the one below it.'},
  {id:'after',label:'Show what happened after day 14',type:'toggle',def:false},
  {id:'fit',label:'Show the fitted line',type:'toggle',def:false,lvl:'honors',help:'The best straight line through log(count) for days 0 to 14, extended into the future.'},
  {id:'dbl',label:'True doubling time at the start',type:'range',min:2,max:6,step:0.5,def:3,unit:' days',lvl:'honors',noGut:true,onChange:clearGut,help:'Changes the scenario. The fit has to find this from the noisy data.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'today',label:'Count on day 14',unit:'',d:0,min:0,max:null,get:sim=>data(sim).d[FIT]},
  {id:'pct',label:'Growth per day (from the fit)',unit:'%',d:1,min:0,max:50,get:sim=>(data(sim).b-1)*100},
  {id:'dbl',label:'Doubling time (from the fit)',unit:'days',d:2,lvl:'honors',min:0,max:8,get:sim=>data(sim).dbl},
  {id:'tp',label:'Fitted line passes 1,000,000 at',unit:'day',d:1,lvl:'honors',min:0,max:90,get:sim=>data(sim).tp},
  {id:'slope',label:'Slope of log₁₀(count)',unit:'per day',d:4,lvl:'ap',min:0,max:0.2,get:sim=>data(sim).m},
  {id:'bf',label:'Growth factor b',unit:'× per day',d:3,lvl:'ap',min:1,max:1.5,get:sim=>data(sim).b}
 ],
 graphs:[{id:'logline',label:'log₁₀(count) vs. day',custom:true}],defaultGraph:'logline',
 plot(sim,ctx,box){const D=data(sim),G=sim.gutS;
  const ax=axes0(ctx,box);
  /* 1,000,000 line */
  ctx.strokeStyle=PAL['muted'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(6));ctx.lineTo(ax.X(DAYS),ax.Y(6));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'1,000,000 (log = 6)',ax.X(DAYS)-4,ax.Y(6)-6,{s:12,c:PAL['muted'],a:'right'});
  if(showFit(sim)){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(D.c));const te=Math.min(DAYS,(8-D.c)/D.m);ctx.lineTo(ax.X(te),ax.Y(D.c+D.m*te));ctx.stroke();
   txt(ctx,`log₁₀ N = ${D.c.toFixed(2)} + ${D.m.toFixed(4)}t`,ax.X(2),box.T+14,{s:13,w:700,c:PAL['s3']});}
  for(let t=0;t<=(sim.p.after?DAYS:FIT);t++){const y=Math.log10(D.d[t]);ctx.beginPath();ctx.arc(ax.X(t),ax.Y(y),t<=FIT?4:3,0,7);if(t<=FIT){ctx.fillStyle=PAL['rj'];ctx.fill();}else{ctx.strokeStyle=PAL['s2'];ctx.lineWidth=1.5;ctx.stroke();}}
  const GG=gutG(sim);const vline=(t,col,lab,row)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(t),box.T);ctx.lineTo(ax.X(t),box.T+box.H);ctx.stroke();const right=ax.X(t)>box.L+box.W*0.75;txt(ctx,lab,ax.X(t)+(right?-5:5),box.T+box.H-8-row*16,{s:12,w:700,c:col,a:right?'right':'left'});};
  const gd=GG?GG.day:sim.p.guess;vline(gd,PAL['s4'],(GG?'Your gut: day ':'Your guess: day ')+gd,0);
  if(solved(sim))vline(D.mathDay,PAL['s3'],'Math: day '+D.mathDay,Math.abs(ax.X(gd)-ax.X(D.mathDay))<110?1:0);},
 draw(sim,ctx,vdt,k){const F=frame(sim),D=F.D,C=C_(sim),G=sim.gutS,X=F.X,Y=F.Y,fs=12*k;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the future */
  if(!F.after){ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X(FIT+0.5),T,R-X(FIT+0.5),B-T);txt(ctx,'The future: days 15 to 90',X(FIT+0.5)+10,B-10,{s:fs,c:PAL['cv-soft']});}
  /* grid and tick labels */
  ctx.lineWidth=1;F.ticks.forEach(v=>{const y=Math.round(Y(v))+.5;ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();txt(ctx,short(v),L-8,y,{s:fs,c:PAL['cv-soft'],a:'right',b:'middle'});});
  for(let t=0;t<DAYS;t+=(k>1.4?15:10)){const x=Math.round(X(t))+.5;ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,B);ctx.stroke();txt(ctx,String(t),x,B+16*k,{s:fs,c:PAL['cv-soft'],a:'center'});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,B);ctx.lineTo(R,B);ctx.stroke();
  txt(ctx,'Day',R,B+16*k,{s:fs,w:700,c:PAL['cv-ink'],a:'right',b:'bottom'});
  txt(ctx,(F.log?'Log axis: ':'Regular axis: ')+C.what,L,T-12,{s:13*k,w:700,c:PAL['cv-ink']});
  /* the 1,000,000 line */
  if(F.log||F.ymax>=TARGET){const y=Y(TARGET);ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'1,000,000',L+6,y-6,{s:fs,w:700,c:PAL['s1']});}
  else{const ratio=TARGET/F.ymax;pill(ctx,`1,000,000 is ${ratio>=10?Math.round(ratio/10)*10:ratio.toFixed(1)}× the top of this chart`,(X(FIT+0.5)+R)/2,T+(B-T)*0.42,PAL['card'],PAL['s1'],12.5*k);}
  /* fitted exponential (straight on the log axis) */
  if(showFit(sim)){ctx.save();ctx.beginPath();ctx.rect(L,T,R-L,B-T);ctx.clip();ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;ctx.setLineDash([10,6]);ctx.beginPath();
   for(let t=0;t<=DAYS;t+=0.5){const p=[X(t),Y(Math.min(fitAt(D,t),F.log?1e9:F.ymax*2))];t?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  /* data */
  const n=F.after?DAYS:FIT;for(let t=0;t<=n;t++){const x=X(t),y=Y(D.d[t]);ctx.beginPath();ctx.arc(x,y,t<=FIT?4.5:3.2,0,7);if(t<=FIT){ctx.fillStyle=PAL['rj'];ctx.fill();}else{ctx.strokeStyle=PAL['s2'];ctx.lineWidth=1.6;ctx.stroke();}}
  /* growth slows */
  if(F.after){let ts=-1;for(let t=FIT+1;t<=DAYS;t++)if(D.d[t]<fitAt(D,t)/3){ts=t;break;}
   if(ts>0&&ts<DAYS-6){txt(ctx,'Growth slows here',R-4,Math.min(B-12*k,Y(D.d[DAYS])+24*k),{s:fs,w:700,c:PAL['s2'],a:'right'});}}
  /* gut and math markers */
  const GG=gutG(sim),gd=GG?GG.day:sim.p.guess,mx=solved(sim)?X(D.mathDay):null;
  const vl=(x,col,lab,row)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,B);ctx.stroke();ctx.setLineDash([]);
   ctx.font='700 '+fs+'px '+BioLab.h.FONT;const w=ctx.measureText(lab).width,right=x+8+w>R;const tx=right?x-8:x+8,ty=T+18*k+row*22*k;
   ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(right?tx-w-3:tx-3,ty-fs,w+6,fs*1.35);ctx.globalAlpha=1;txt(ctx,lab,tx,ty,{s:fs,w:700,c:col,a:right?'right':'left'});};
  vl(X(gd),PAL['s4'],(GG?'Your gut: day ':'Your guess: day ')+gd,0);
  if(mx!==null)vl(mx,PAL['s3'],'Math: day '+D.mathDay,Math.abs(mx-X(gd))<170*k?1:0);
  if(F.after){const x=X(D.act),y=Y(D.d[D.act]);ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(x,y,6,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
   const lab='Passed 1,000,000 on day '+D.act;ctx.font='700 '+fs+'px '+BioLab.h.FONT;const w=ctx.measureText(lab).width;const lx=clamp(x+12,L+4,R-w-4),ly=F.log?y+24*k:Math.max(T+70*k,y-14);txt(ctx,lab,lx,ly,{s:fs,w:700,c:PAL['s1']});}},
 onClick(sim,x){const t=Math.round(clamp((x-L)/(R-L)*DAYS,15,90));BioLab.setValues(sim,{guess:t});},
 narrate(sim){const D=data(sim),C=C_(sim),log=sim.p.axis==='log';
  if(sim.p.after)return `The count passed 1,000,000 on <b>day ${D.act}</b>. The fitted line called it from day 14. ${log?'Later the dots bend below the straight line:':'Later the curve levels off near '+C.ceil+':'} <b>growth slows as there are fewer new people left to reach</b>, so the exponential model only works early on.`;
  if(log)return `On the log axis the first 14 days fall close to a <b>straight line</b>: the count grows by about ${fmtNum((D.b-1)*100,0)}% a day, doubling about every ${fmtNum(D.dbl,1)} days. Extend the line to 1,000,000 to see when it gets there.`;
  return `By day 14 there are ${com(D.d[FIT])} ${C.noun}. On a regular axis that looks slow: at last week’s pace of about ${com(pace(D))} new ${C.noun} a day, 1,000,000 would take ${fmtNum(paceYears(D),1)} more years. <b>But the count multiplies each day; it does not add.</b>`;},
 gut:{better:'lower',
  controls:['guess'],
  ask:{bio:'The red dots are the first two weeks. Drag the slider here, or click the shaded future on the chart, to the day you think the total passes 1,000,000. Then lock it in.',
   honors:'Before you switch to the log axis or show the fitted line: on what day will the count pass 1,000,000? Drag the slider here, then lock it in.'},
  lock(sim){const D=data(sim),g=sim.p.guess;return {v:Math.abs(g-D.act),day:g,key:keyOf(sim),label:'day '+g};},
  solve(sim){const D=data(sim);sim.p.guess=D.mathDay;sim.p.axis='log';sim.p.after=true;if(atLeast('honors'))sim.p.fit=true;
   return {v:Math.abs(D.mathDay-D.act),day:D.mathDay,key:keyOf(sim),act:D.act,yrs:paceYears(D),label:atLeast('honors')?`day ${D.mathDay}: the fitted line reaches 1,000,000 at t ≈ ${fmtNum(D.tp,1)}`:`day ${D.mathDay}: the straight line on the log chart reaches 1,000,000 at about day ${fmtNum(D.tp,1)}`};},
  how:{bio:'The math puts the first 14 days on a log axis, where they make a straight line, and extends that line until it reaches 1,000,000.',
   honors:'Fit a straight line to log(count) for days 0 to 14. Its slope is log b, so b is the daily growth factor. Follow the line up to log(1,000,000) = 6.',
   ap:'Least squares on log₁₀ N gives log₁₀ N = log₁₀ N₀ + t·log₁₀ b. Then t = log(1,000,000/N₀) / log b, and the first whole day after that is the answer.'},
  compare(sim,g,m){const D={act:m.act},w=m.act-FIT;
   if(g.day===D.act)return `Your gut was right on: day ${D.act}. You read the growth as multiplying, not adding, which is exactly what the log axis shows. The math confirms it from day 14, which gives <b>${w} days of warning</b>.`;
   if(g.day>D.act){const late=g.day-D.act;return `The count passed 1,000,000 on <b>day ${D.act}</b>. A headline built on day ${g.day} would be <b>${late} day${late===1?'':'s'} late</b>, and anyone planning from it, like hospitals adding beds, would not be ready in time. The math, using only the first 14 days, called day ${D.act} and gave <b>${w} days of warning</b>. (Reading the chart as a straight climb at last week’s pace would put it ${fmtNum(m.yrs,1)} years away.)`;}
   const early=D.act-g.day;return `Your headline would warn of a million <b>${early} day${early===1?'':'s'} too soon</b>, and anyone planning from it would spend money and people before they were needed. Early beats late, but the math called the exact day: <b>day ${D.act}</b>, with ${w} days of warning.`;},
  again(sim){sim.p.case=Math.random()<0.5?'outbreak':'viral';sim.p.dbl=2+0.5*Math.floor(Math.random()*9);sim.p.guess=60;sim.p.axis='lin';sim.p.after=false;sim.p.fit=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Something doubles every 3 days. On a log axis, what does its graph look like?',choices:['A curve that bends upward more and more','A straight line going up','A flat line'],correct:1,explain:'A log axis gives equal space to each multiplication: 10 to 100 takes the same height as 100 to 1,000. Doubling every 3 days is the same multiplication every day, so the graph climbs by the same height each day: a straight line.'},
  {lvl:'bio',instant:true,q:'An outbreak has 3,000 cases on day 14 and doubles every 3 days. About how many cases will there be 15 days later?',choices:['About 6,000','About 18,000','About 96,000','About 3,000,000'],correct:2,explain:'15 days is 5 doublings: 3,000 × 2⁵ = 3,000 × 32 = 96,000. Adding instead of multiplying (3,000 + 5 × 3,000 = 18,000) badly underestimates it.'},
  {lvl:'honors',instant:true,q:'On a log axis, how does the line for “doubles every 2 days” compare with “doubles every 4 days”?',choices:['It is twice as steep','It is the same steepness, just higher','It is four times as steep','It curves while the other is straight'],correct:0,explain:'The slope of log N is log b per day. Doubling every 2 days means log b = log 2 / 2; every 4 days means log 2 / 4. So the 2-day line is exactly twice as steep.'},
  {lvl:'honors',instant:true,q:'Turn on “Show what happened after day 14.” Why do the later dots fall below the straight line?',choices:['The math was done wrong','Growth slows because there are fewer new people left to reach','The log axis squashes big numbers','Reporting stops'],correct:1,explain:'Real growth is closer to logistic: it starts out exponential, then slows as it runs out of new people to infect or new viewers to reach. The straight-line model is only for the early phase.'},
  {lvl:'ap',instant:true,q:'A fit gives N₀ = 150 and b = 1.25 per day. On what whole day does the model first pass 1,000,000?',choices:['Day 27','Day 36','Day 40','Day 53'],correct:2,explain:'t = log(1,000,000/150) / log 1.25 = log(6,666.7) / log 1.25 = 3.8239 / 0.0969 ≈ 39.5. The first whole day past that is day 40.'},
  {lvl:'ap',instant:true,q:'The fitted line through log₁₀ N has slope 0.1 per day. What is the doubling time?',choices:['About 1.0 day','About 2.0 days','About 3.0 days','About 10 days'],correct:2,explain:'Doubling time = log 2 / slope = 0.30103 / 0.1 ≈ 3.0 days. The growth factor is b = 10^0.1 ≈ 1.259, so the count grows about 26% a day.'}
 ],
 tour:[
  {title:'Two weeks of data',text:'Each red dot is the running total of reported cases in a fictional outbreak, one dot per day. Today is day 14. The shaded area is the future.',focus:[[16,T-32,X0(null,FIT+0.5)-6,B-T+64]],pause:true,setup:sim=>BioLab.setValues(sim,{case:'outbreak',dbl:3,axis:'lin',after:false,fit:false,guess:60})},
  {title:'Where is 1,000,000?',text:'On a regular axis the data look gentle, and 1,000,000 is far off the top of the chart. If you read it as a steady climb, a million cases looks years away.',focus:sim=>[X0(sim,FIT+0.5)-10,T+40,R-X0(sim,FIT+0.5)+20,120],pause:true},
  {title:'Switch to a log axis',text:'Now each gridline is 10 times the one below it. Equal steps up mean equal multiplications, so steady doubling becomes a straight line.',pause:true,setup:sim=>BioLab.setValues(sim,{axis:'log'})},
  {lvl:'honors',title:'Fit the line',text:'The green line is the best straight line through the first 14 days. Its slope is the growth per day: about 26%, which means doubling about every 3 days.',pause:true,setup:sim=>BioLab.setValues(sim,{axis:'log',fit:true})},
  {title:'Follow it to 1,000,000',text:'Extend the straight line until it reaches the 1,000,000 gridline. It gets there between day 39 and day 40, so the first full day over a million is day 40. That is 26 days of warning from today.',pause:true,setup:sim=>BioLab.setValues(sim,{axis:'log',fit:true,guess:40})},
  {title:'What actually happened',text:'The blue circles are the days that came next. The count passed 1,000,000 on day 40, right on schedule. Later the dots bend below the line: growth slows as the outbreak runs out of people to infect. The straight line only works early.',pause:true,setup:sim=>BioLab.setValues(sim,{axis:'log',fit:true,after:true,guess:40})},
  {title:'Same data, regular axis',text:'On a regular axis the whole story is an S-shaped curve. The first two weeks are a flat smear near zero, which is why the log axis is the better tool for seeing it coming.',pause:true,setup:sim=>BioLab.setValues(sim,{axis:'lin',fit:true,after:true})},
  {lvl:'ap',title:'The formula',text:'With log₁₀ N = log₁₀ N₀ + t·log₁₀ b, setting N = 1,000,000 gives t = log(1,000,000/N₀) / log b. For this data that is t ≈ 39.7 days.',pause:true,setup:sim=>BioLab.setValues(sim,{axis:'log',fit:true,after:false})}
 ],
 onTourExit(sim){},
 lab:{bio:'<p><b>Question:</b> How does the doubling time change the day you pass 1,000,000?</p><ol><li>Choose <b>Outbreak</b>. Switch to the <b>Log</b> axis and record a trial.</li><li>Switch to <b>Viral video</b> and record another.</li><li>Compare the day-14 counts and growth per day.</li></ol><p>Write one sentence: which grows faster, and how can you tell on the log chart?</p>',
  honors:'<p><b>Question:</b> How does the doubling time set the slope of the log line?</p><ol><li>Turn on the fitted line. Set the true doubling time to 2, 3, 4, 5 and 6 days, recording a trial each time.</li><li>Graph <b>Trials</b>: doubling time on x, the day the line passes 1,000,000 on y.</li></ol><p>Is the pattern linear? Explain why using the slope of the log line.</p>',
  ap:'<p><b>Question:</b> Show that the day you pass 1,000,000 is t = log(1,000,000/N₀) / log b.</p><ol><li>For three doubling times, record the slope of log₁₀(count) and the day the line passes 1,000,000.</li><li>Compute N₀ = 10^(intercept) and check the formula against the readout.</li><li>Turn on “Show what happened” and find the day the real data fall to a third of the line.</li></ol><p><b>CER:</b> Claim about when the exponential model stops working, evidence from the chart, and reasoning about why growth slows.</p>'},
 terms:[
  {t:'Exponential growth',d:'Growth by the same factor each step: N = N₀·bᵗ. It looks slow at first and then very fast.'},
  {t:'Log axis',d:'An axis where each step up multiplies by the same amount (often 10). Exponential growth is a straight line on it.'},
  {t:'Doubling time',d:'How long it takes to double. For growth factor b per day, doubling time = log 2 / log b.',lvl:'honors'},
  {t:'Logarithm',d:'log₁₀ x is the power of 10 that gives x. log₁₀ 1,000,000 = 6.',lvl:'honors'},
  {t:'Linearizing',d:'Taking logs turns N = N₀·bᵗ into log N = log N₀ + t·log b: a line with slope log b.',lvl:'ap'},
  {t:'Logistic growth',d:'Growth that starts out exponential and then levels off at a ceiling, making an S-shaped curve.',lvl:'ap'}
 ],
 about:'<p>The data are fictional. Each scenario follows a logistic curve N(t) = K / (1 + (K/N₀ − 1)e^(−rt)), with r = ln 2 ÷ (doubling time), plus about 5% day-to-day reporting noise. The outbreak starts at 120 cases and levels off near 20 million; the video starts at 1,500 views and levels off near 40 million.</p><p>The “math” answer fits a least-squares line to log₁₀(count) for days 0 to 14 and solves for the day the line reaches 1,000,000. Each scenario uses a fixed noise pattern; with noisier data, the fit can miss by a day or so. Because 1,000,000 is still small next to the ceiling, the early exponential model works for this question. It would not work for predicting the final total. This is a simplified model for learning, not a public-health forecast.</p>'
};
function X0(sim,t){return L+t/DAYS*(R-L);}
function axes0(ctx,box){return BioLab.h.axes(ctx,box,{xmin:0,xmax:DAYS,ymin:0,ymax:8,xl:'Day',yl:'log₁₀(count)',yd:0});}
BioLab.register(SIM);
})();
