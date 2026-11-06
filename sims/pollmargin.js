(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Student council poll. A random sample of n students from a school of 2,000; your candidate gets p̂.
   The real margin of error is z*·√(p̂(1 − p̂)/n). The gut sets a plus-or-minus by feel; v = |gut − real| in points.
   100 more polls are simulated from a pretend true share, from a fixed seed, to show what the confidence level means. */
const SCHOOL=2000,SEED=4242,NP=100;
const Z={90:1.645,95:1.96,99:2.576};
const zOf=sim=>Z[atLeast('ap')?sim.p.conf:95]||1.96;
const confOf=sim=>atLeast('ap')?sim.p.conf:95;
const ph=sim=>(atLeast('honors')?sim.p.ph:54)/100;
const truth=sim=>(atLeast('honors')?sim.p.truth:51)/100;
const se=sim=>Math.sqrt(ph(sim)*(1-ph(sim))/sim.p.n);
const moe=sim=>100*zOf(sim)*se(sim);
const cache=new Map();
function polls(sim){const seed=sim.p.seed||SEED,n=sim.p.n,t=truth(sim),key=seed+'|'+n+'|'+t;if(cache.has(key))return cache.get(key);
 const r=rng((seed*131+n*7+Math.round(t*1000)*17)|0),out=[];
 for(let i=0;i<NP;i++){let c=0;for(let j=0;j<n;j++)if(r()<t)c++;out.push(c/n);}
 if(cache.size>40)cache.clear();cache.set(key,out);return out;}
function caught(sim,fixed){const t=truth(sim),z=zOf(sim),n=sim.p.n;return polls(sim).filter(p=>Math.abs(p-t)<=(fixed!==undefined?fixed/100:z*Math.sqrt(p*(1-p)/n))+1e-12).length;}
const needN=sim=>{const d=ph(sim)-0.5;return d>1e-9?Math.ceil(zOf(sim)**2*ph(sim)*(1-ph(sim))/(d*d)):null;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g));
const f1=v=>v.toFixed(1),pc=v=>(100*v).toFixed(0);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const ivl=(c,m)=>`${f1(c-m)}% to ${f1(c+m)}%`;
const ans=(sim,m)=>{const c=100*ph(sim),real=moe(sim);return {v:Math.abs(m-real),moe:m,real,n:sim.p.n,c,lock:c-m>50,label:`±${f1(m)} points: ${ivl(c,m)}`};};

const SIM={
 id:'pollmargin',hash:'pollmargin',apUnit:15,order:2,tab:'Is 54% a lock?',kind:'Simulation',
 card:'Guess the plus-or-minus on a student council poll by feel, then build the margin of error and watch 100 more polls test it.',
 title:'Is 54% a lock?',
 lede:{bio:'A poll only asks some of the voters, so its result is a little off from the truth. How far off? That plus-or-minus, the margin of error, decides whether 54% means you are winning.',
  honors:'A confidence interval is p̂ ± margin of error. At 95% confidence, about 95 of every 100 polls built this way catch the true share. Bigger samples give smaller margins.',
  ap:'p̂ ± z*·√(p̂(1 − p̂)/n), with z* = 1.96 for 95%. Conditions: a random sample, n ≤ 10% of the population, and at least 10 successes and 10 failures.'},
 scale:'A school of 2,000 students and a two-candidate race. Each line below is one simulated poll.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your poll',
 controls:[
  {id:'moe',label:'Your plus-or-minus',type:'range',min:0.5,max:20,step:0.5,def:5,unit:' points'},
  {id:'n',label:'Students in the poll',type:'seg',def:100,noGut:true,onChange:clearGut,options:[{v:50,l:'50'},{v:100,l:'100'},{v:150,l:'150'},{v:200,l:'200'}],help:'A random sample from the school’s 2,000 students.'},
  {id:'ph',label:'Poll result for your candidate',type:'range',min:50,max:60,step:2,def:54,unit:'%',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'truth',label:'Pretend you know the true share',type:'range',min:40,max:60,step:1,def:51,unit:'%',lvl:'honors',noGut:true,help:'Only for the 100 simulated polls. In real life nobody knows this.'},
  {id:'conf',label:'Confidence level',type:'seg',def:95,lvl:'ap',noGut:true,onChange:clearGut,options:[{v:90,l:'90%'},{v:95,l:'95%'},{v:99,l:'99%'}]},
  {id:'show',label:'Show the math',type:'toggle',def:false,help:'Off: you decide by feel first.'}
 ],
 actions:[{id:'new',label:'Run 100 new polls',run(sim){sim.p.seed=((sim.p.seed||SEED)%100000)+1;sim.p.show=true;if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.show)sim.ui.ctl.show.set(true);}}],
 init(sim){if(sim.mode==='guided'&&sim.guide&&sim.guide.phase==='gut')sim.p.seed=SEED;return {};},step(){},
 metrics:[
  {id:'moe',label:'Margin of error',unit:'points',d:1,min:0,max:20,get:sim=>shown(sim)?moe(sim):null},
  {id:'lo',label:'Low end of the interval',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*ph(sim)-moe(sim):null},
  {id:'hi',label:'High end of the interval',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*ph(sim)+moe(sim):null},
  {id:'caught',label:'Simulated polls whose interval catches the truth',unit:'of 100',d:0,min:0,max:100,get:sim=>shown(sim)?caught(sim):null},
  {id:'se',label:'Standard error √(p̂(1 − p̂)/n)',unit:'points',d:2,lvl:'honors',min:0,max:10,get:sim=>shown(sim)?100*se(sim):null},
  {id:'need',label:'Poll size that would make this result a lock',unit:'students',d:0,lvl:'honors',min:0,max:3000,get:sim=>shown(sim)?needN(sim):null},
  {id:'zstar',label:'Critical value z*',unit:'',d:3,lvl:'ap',min:0,max:3,get:sim=>zOf(sim)}
 ],
 graphs:[{id:'curve',label:'Margin of error vs. poll size',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const p=ph(sim),z=zOf(sim),ax=axes(ctx,box,{xmin:0,xmax:400,ymin:0,ymax:25,xl:'Students in the poll',yl:'Margin of error (points)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the margin of error',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let n=20;n<=400;n+=2){const y=ax.Y(Math.min(25,100*z*Math.sqrt(p*(1-p)/n)));n===20?ctx.moveTo(ax.X(n),y):ctx.lineTo(ax.X(n),y);}ctx.stroke();
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(200),box.T);ctx.lineTo(ax.X(200),box.T+box.H);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'10% of the school',ax.X(200)+6,box.T+14,{s:12,c:PAL['muted']});
  const G=GS(sim);if(G&&G.g&&G.g.n===sim.p.n){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(sim.p.n),ax.Y(Math.min(25,G.g.moe)),6,0,7);ctx.fill();txt(ctx,'Your gut',ax.X(sim.p.n)+10,ax.Y(Math.min(25,G.g.moe))+4,{s:12,w:700,c:PAL['s4']});}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.n),ax.Y(moe(sim)),6,0,7);ctx.fill();txt(ctx,'Your poll',ax.X(sim.p.n)+10,ax.Y(moe(sim))-8,{s:12,w:700,c:PAL['rj']});},
 draw(sim,ctx,vdt,k){const n=sim.p.n,c=100*ph(sim),m=moe(sim),sh=shown(sim),G=GS(sim),L=40,R=760,lo=15,hi=90,X=v=>L+(clamp(v,lo,hi)-lo)/(hi-lo)*(R-L);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* number line */
  const AY=150;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,AY);ctx.lineTo(R,AY);ctx.stroke();
  for(let v=20;v<=90;v+=10){ctx.beginPath();ctx.moveTo(X(v),AY-4);ctx.lineTo(X(v),AY+4);ctx.stroke();txt(ctx,v+'%',X(v),AY+6,{s:12*k,c:PAL['cv-soft'],a:'center',b:'top'});}
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(50),30);ctx.lineTo(X(50),440);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'50%: a tie',X(50)-6,26,{s:12*k,w:700,c:PAL['cv-soft'],a:'right',b:'middle'});
  txt(ctx,`Poll: ${Math.round(c*n/100)} of ${n} (${c.toFixed(0)}%)`,X(50)+8,26,{s:13*k,w:700,b:'middle'});
  const bar=(y,half,col,lab,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=5;if(dash)ctx.setLineDash([8,5]);ctx.beginPath();ctx.moveTo(X(c-half),y);ctx.lineTo(X(c+half),y);ctx.stroke();ctx.setLineDash([]);
   ctx.lineWidth=3;[c-half,c+half].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),y-8);ctx.lineTo(X(v),y+8);ctx.stroke();});
   ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText(lab).width,rx=X(c+half)+10,lx=X(c-half)-10;
   if(rx+lw<796)txt(ctx,lab,rx,y,{s:12*k,w:700,c:col,b:'middle'});else if(lx-lw>4)txt(ctx,lab,lx,y,{s:12*k,w:700,c:col,b:'middle',a:'right'});else txt(ctx,lab,X(c),y-14*k,{s:12*k,w:700,c:col,b:'middle',a:'center'});};
  /* the gut interval (current slider while answering, the locked one after) */
  const gm=G&&G.g&&G.g.n===n?G.g.moe:sim.p.moe;
  const yG=64,yM=104;bar(yG,gm,PAL['s4'],(G&&G.g?'Your gut: ±':'Your ±')+f1(gm),true);
  if(sh)bar(yM,m,PAL['rj'],`${confOf(sim)}% margin: ±${f1(m)}`,false);
  ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(X(c),AY,7,0,7);ctx.fill();
  /* 100 more polls */
  const T=218,B=440;
  if(!sh){const msg='Lock in your gut to see 100 more polls.',my=(T+B)/2;ctx.font=(13*k)+'px '+FONT;const mw=ctx.measureText(msg).width+24;ctx.fillStyle=PAL['card'];rr(ctx,400-mw/2,my-14*k,mw,24*k,8);ctx.fill();txt(ctx,msg,400,my,{s:13*k,c:PAL['cv-soft'],a:'center',b:'middle'});return;}
  const t=100*truth(sim),P=polls(sim),z=zOf(sim),dy=(B-T)/NP;let hit=0;
  P.forEach((p,i)=>{const mm=100*z*Math.sqrt(p*(1-p)/n),ok=Math.abs(100*p-t)<=mm+1e-10;if(ok)hit++;const y=T+i*dy+dy/2;
   ctx.strokeStyle=ok?PAL['s2']:PAL['s1'];ctx.lineWidth=ok?Math.max(1.2,dy*0.6):2.6;ctx.globalAlpha=ok?0.7:1;ctx.beginPath();ctx.moveTo(X(100*p-mm),y);ctx.lineTo(X(100*p+mm),y);ctx.stroke();ctx.globalAlpha=1;});
  ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(t),T-6);ctx.lineTo(X(t),B);ctx.stroke();
  pill(ctx,`${hit} of 100 catch the truth (${t.toFixed(0)}%)`,clamp(X(t)+(t<50?-1:1)*0,150*k,800-150*k),T-16,PAL['s3'],'#fff',12*Math.min(k,1.4));
  txt(ctx,'100 more polls',L,T-16,{s:12*k,w:700,c:PAL['cv-soft'],b:'middle'});},
 narrate(sim){const c=100*ph(sim),n=sim.p.n;
  if(!shown(sim))return `${Math.round(c*n/100)} of ${n} students picked your candidate. <b>A different random ${n} would give a somewhat different number.</b> How far from the truth could ${c.toFixed(0)}% be?`;
  const m=moe(sim),lk=c-m>50;
  return `With ${n} students, the ${confOf(sim)}% margin of error is ±${f1(m)} points: we are ${confOf(sim)}% confident the true share is between ${ivl(c,m).replace(' to ',' and ')}. ${lk?'<b>Every plausible value is above 50%, so the poll gives convincing evidence your candidate is ahead.</b>':'<b>The interval includes 50%, so 54% is not a lock.</b>'.replace('54%',c.toFixed(0)+'%')}`;},
 gut:{better:'lower',controls:['moe'],
  ask:{bio:'News polls say “plus or minus” a few points. How far off could this poll be from the truth? Drag <b>Your plus-or-minus</b> here to your gut answer, then lock it in.',honors:'Set the plus-or-minus by feel for a 95% interval, then lock it in before you see the formula.',ap:'Set the plus-or-minus by feel for the confidence level shown below, then lock it in.'},
  lock(sim){return ans(sim,sim.p.moe);},
  solve(sim){const m=moe(sim);sim.p.moe=m;return ans(sim,m);},
  how:{bio:'The math uses the poll size and the result to measure how much polls like this one bounce around. About 95 of every 100 polls land within 2 of those bounces of the truth, so that is the plus-or-minus.',
   honors:'Standard error = √(p̂(1 − p̂)/n). The 95% margin of error is 1.96 standard errors.',
   ap:'Margin = z*·√(p̂(1 − p̂)/n), with z* = 1.645, 1.96 or 2.576 for 90%, 95% or 99% confidence.'},
  compare(sim,g,m){const fit=caught(sim,g.moe),c=g.c,lockTxt=m.lock?`Its interval, ${ivl(c,m.moe)}, stays above 50%: convincing evidence of a lead.`:`Its interval, ${ivl(c,m.moe)}, includes 50%: ${c.toFixed(0)}% is not a lock.`;
   if(g.v<0.5)return `Your gut was right on: ±${f1(g.moe)} against the real ±${f1(m.moe)}. ${lockTxt}`;
   const dir=g.moe<m.moe?'too small':'too big';
   let t=`Your ±${f1(g.moe)} was <b>${f1(g.v)} points ${dir}</b>. The real ${confOf(sim)}% margin is ±${f1(m.moe)}. ${lockTxt}`;
   t+=g.moe<m.moe?` In the 100 polls below, an interval as narrow as yours would catch the truth only <b>${fit} times out of 100</b>, not about ${confOf(sim)}.`:` An interval as wide as yours would catch the truth ${fit} times out of 100, but it is too vague to tell you much.`;
   if(g.lock!==m.lock)t+=g.lock?' Your gut would have called it a lock when it is not.':' Your gut would have missed convincing evidence of a lead.';
   return t;},
  again(sim){sim.p.n=[50,100,150,200][Math.floor(Math.random()*4)];if(atLeast('honors'))sim.p.ph=50+2*(1+Math.floor(Math.random()*5));sim.p.moe=5;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'54 of 100 students say they will vote for your candidate. The margin of error is about ±9.8 points. Is your candidate surely ahead?',choices:['Yes: 54% is more than 50%','No: plausible values for the true share run from about 44% to 64%, which includes losing','Yes, by exactly 4 points'],correct:1,explain:'54 ± 9.8 runs from 44.2% to 63.8%. Values below 50% are plausible, so the poll cannot rule out a loss.'},
  {lvl:'bio',instant:true,q:'You want a margin of error half as big. How many students should you poll instead of 100?',choices:['200','400','1,000'],correct:1,explain:'The margin shrinks with the square root of the sample size. Four times the students gives half the margin: about ±13.8 points at 50 students, ±6.9 at 200.'},
  {lvl:'honors',instant:true,q:'What does “95% confidence” mean here?',choices:['There is a 95% chance your candidate wins','If you took many random polls this way, about 95% of their intervals would catch the true share','95% of students answered honestly'],correct:1,explain:'The 95% describes the method: about 95 of every 100 intervals built this way capture the true share. Any one interval either catches it or not. In the simulation, count the blue lines.'},
  {lvl:'honors',instant:true,q:'Instead of a random sample, you poll the 150 students in your candidate’s clubs. Does the bigger sample make the result more trustworthy?',choices:['Yes: more students always means a smaller error','No: a biased sample stays biased, and the margin of error only covers random chance','Only if they answer honestly'],correct:1,explain:'The margin of error measures random sampling variability. It assumes a random sample. Friends of the candidate are not a random sample, so the result can be far off no matter how many you ask.'},
  {lvl:'ap',instant:true,q:'p̂ = 0.54, n = 150. What is the 95% margin of error?',choices:['About 4.1 points','About 8.0 points','About 9.8 points'],correct:1,explain:'SE = √(0.54 × 0.46 / 150) ≈ 0.0407. Margin = 1.96 × 0.0407 ≈ 0.080: about 8.0 points. The interval is 46.0% to 62.0%.'},
  {lvl:'ap',instant:true,q:'At this 2,000-student school, a poll of 300 students breaks which condition for this interval formula?',choices:['Random','10%: n should be at most 200','Large Counts'],correct:1,explain:'The 10% condition keeps n ≤ 10% of the population so the answers are close to independent. 300 is 15% of 2,000. Large Counts still holds: 300 × 0.54 = 162 and 300 × 0.46 = 138.'}
 ],
 tour:[
  {title:'The poll',text:'You surveyed a random sample of 100 of the school’s 2,000 students: 54 picked your candidate. The dot is 54%. The dashed line at 50% is a tie.',pause:true,setup:sim=>{sim.p.seed=SEED;BioLab.setValues(sim,{n:100,ph:54,truth:51,conf:95,show:false});}},
  {title:'The margin of error',text:'The 95% margin of error for this poll is ±9.8 points. We are 95% confident the true share is between 44.2% and 63.8%. “95% confident” describes the method: about 95 of every 100 polls like this make intervals that catch the truth.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true}),focus:[20,40,760,140]},
  {title:'Not a lock',text:'The interval reaches below 50%. Your candidate might be ahead, or might be behind; this poll cannot tell.',pause:true},
  {title:'What 95% means',text:'Pretend the truth is 51%. These are 100 more polls of 100 students, each with its own interval. Blue ones catch the truth, red ones miss. Here 94 of 100 catch it: close to 95, as promised.',pause:true,focus:[20,170,760,276]},
  {title:'Bigger polls',text:'Poll 200 students instead: the margin drops to ±6.9 points. At 50 students it was ±13.8. Four times the students, half the margin.',pause:true,setup:sim=>BioLab.setValues(sim,{n:200,show:true})},
  {lvl:'honors',title:'The formula',text:'Standard error = √(p̂(1 − p̂)/n) = √(0.54 × 0.46 / 100) ≈ 0.0498. The 95% margin is 1.96 × 0.0498 ≈ 0.098: ±9.8 points.',pause:true,setup:sim=>BioLab.setValues(sim,{n:100,show:true})},
  {lvl:'ap',title:'Conditions and confidence',text:'Check: a random sample; n = 100 is at most 10% of 2,000; 54 successes and 46 failures are both at least 10. A higher confidence level needs a bigger z*: 99% gives ±12.8 points.',pause:true,setup:sim=>BioLab.setValues(sim,{n:100,conf:99,show:true})}
 ],
 lab:{bio:'<p><b>Question:</b> How big a poll do you need?</p><ol><li>Turn on <b>Show the math</b>.</li><li>Record a trial for polls of 50, 100, 150 and 200 students.</li><li>Look at the margin of error each time.</li></ol><p>Write one sentence: what happens to the margin when you poll more students?</p>',
  honors:'<p><b>Question:</b> Do 95% of intervals really catch the truth?</p><ol><li>Set the true share to 51%. Press <b>Run 100 new polls</b> five times and record how many intervals catch it each time.</li><li>Repeat with a true share of 45%.</li></ol><p>Explain why the count is close to 95 but not always exactly 95.</p>',
  ap:'<p><b>Question:</b> How do confidence level and sample size trade off?</p><ol><li>For each confidence level, record the margin of error at n = 50 and n = 200.</li><li>Find how many students you would need for a 95% margin of ±4 points, and check it against the 10% condition.</li></ol><p><b>CER:</b> Claim how a campaign should size its poll, with evidence from your table and reasoning from the formula.</p>'},
 terms:[
  {t:'Sample',d:'The students you actually asked. The population is all 2,000 students.'},
  {t:'Margin of error',d:'The plus-or-minus. At 95% confidence, about 95 of every 100 random polls like this land within the margin of error of the truth. It covers random sampling only.'},
  {t:'Confidence interval',d:'Poll result ± margin of error: a range of plausible values for the true share.',lvl:'honors'},
  {t:'Confidence level',d:'The share of intervals, over many random samples, that would catch the true value: 90%, 95% or 99%.',lvl:'honors'},
  {t:'Standard error',d:'√(p̂(1 − p̂)/n): how much p̂ typically varies from sample to sample.',lvl:'honors'},
  {t:'Conditions',d:'Random sample; n ≤ 10% of the population (10% condition); at least 10 successes and 10 failures (Large Counts).',lvl:'ap'},
  {t:'Critical value z*',d:'The number of standard errors in the margin: 1.645 for 90%, 1.96 for 95%, 2.576 for 99%.',lvl:'ap'}
 ],
 about:'<p>The interval is p̂ ± z*·√(p̂(1 − p̂)/n), the standard one-proportion z interval, with z* = 1.96 at 95% unless you change it at Deep dive. The race has two candidates, so more than 50% wins.</p><p><b>The 100 simulated polls</b> each draw n students independently with the true share you pretend to know (51% unless you change it at Closer look), from a fixed random seed, so the same picture returns; <b>Run 100 new polls</b> draws a new set. Drawing independently is a close match to sampling without replacement as long as n is at most 10% of the school, which is why polls here stop at 200 of 2,000 students.</p><p>The margin of error covers only random sampling. It does not cover a biased sample, students who change their minds, or students who do not vote.</p>'
};
BioLab.register(SIM);
})();
