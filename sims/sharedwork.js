(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
const SC={fence:{a:180,b:300,job:'the neighbor’s fence',A:'You',B:'Your friend',C:'A third friend',S:['You','Friend','Friend 2'],verb:'paints'},
 printers:{a:30,b:60,job:'the print job',A:'Printer A',B:'Printer B',C:'Printer C',S:['A','B','C'],verb:'prints'},
 pumps:{a:240,b:360,job:'the flooded basement',A:'Pump A',B:'Pump B',C:'Pump C',S:['A','B','C'],verb:'pumps out'}};
/* Rates add: 1/a + 1/b (+ 1/c) = 1/t. */
const times=sim=>{const L=[sim.p.a,sim.p.b];if(sim.p.three&&atLeast('honors'))L.push(sim.p.c);return L;};
const together=sim=>1/times(sim).reduce((s,x)=>s+1/x,0);
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
const hm=m=>{if(m<60)return fmtNum(m,m%1?1:0)+' min';const h=Math.floor(m/60),r=m-60*h;return h+' h'+(r>0.05?' '+fmtNum(r,Math.abs(r-Math.round(r))>0.05?1:0)+' min':'');};
const nm=sim=>SC[sim.p.scen];
function htxt(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s*0.85,w+6,o.s*1.1);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}
const COL=()=>[PAL['s2'],PAL['s3'],PAL['s5']];

const SIM={
 id:'sharedwork',hash:'sharedwork',apUnit:5,order:2,tab:'Working together',kind:'Simulation',
 card:'Guess how long two workers take together, then add their rates and see how far off the usual guess is.',
 title:'How long does it take together?',
 lede:{bio:'When two people share a job, it is tempting to average their times. But the fast one does more of the work, and together they always beat the faster one alone. The trick is to add how much each does per hour, not the hours.',
  honors:'Work rates add: if A takes a minutes and B takes b, together they finish 1/a + 1/b of the job each minute. Setting that equal to 1/t gives a rational equation.',
  ap:'1/a + 1/b = 1/t solves to t = ab/(a + b). With a third worker, 1/t = 1/a + 1/b + 1/c. Working backward from t finds an unknown rate.'},
 scale:'Times in minutes. Each worker works at a steady rate and nobody gets in anyone’s way.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The job',
 controls:[
  {id:'scen',label:'The job',type:'seg',def:'fence',noGut:true,options:[{v:'fence',l:'Paint a fence'},{v:'printers',l:'Print a job'},{v:'pumps',l:'Pump a basement'}],
   onChange(sim){const s=SC[sim.p.scen];BioLab.setValues(sim,{a:s.a,b:s.b});}},
  {id:'a',label:'A alone (minutes)',type:'range',min:10,max:600,step:5,def:180,unit:' min',noGut:true},
  {id:'b',label:'B alone (minutes)',type:'range',min:10,max:600,step:5,def:300,unit:' min',noGut:true},
  {id:'guess',label:'Your guess: minutes with both working',type:'range',min:5,max:600,step:5,def:60,unit:' min'},
  {id:'three',label:'Add a third worker',type:'toggle',def:false,lvl:'honors',noGut:true},
  {id:'c',label:'C alone (minutes)',type:'range',min:10,max:600,step:5,def:240,unit:' min',lvl:'honors',noGut:true}
 ],
 actions:[{id:'show',label:'Skip the guess and show the answer',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'t',label:'Time working together',unit:'min',d:1,min:0,max:null,get:sim=>shown(sim)?together(sim):null},
  {id:'avgerr',label:'How far off averaging would be',unit:'min',d:1,min:0,max:null,get:sim=>{if(!shown(sim))return null;const T=times(sim);return T.reduce((s,x)=>s+x,0)/T.length-together(sim);}},
  {id:'shareA',label:'Share of the job A does',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?100*together(sim)/sim.p.a:null},
  {id:'rate',label:'Combined rate',unit:'jobs per hour',d:3,lvl:'honors',min:0,max:null,get:sim=>times(sim).reduce((s,x)=>s+60/x,0)}
 ],
 graphs:[{id:'work',label:'Share of the job done over time',custom:true}],defaultGraph:'work',
 plot(sim,ctx,box){if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const T=times(sim),t=together(sim),xmax=Math.max(...T)*1.05,c=COL(),L=['A','B','C'];
  const ax=axes(ctx,box,{xmin:0,xmax,ymin:0,ymax:1.2,xl:'Minutes',yl:'Fraction of the job done'});
  ctx.strokeStyle=PAL['muted'];ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(1));ctx.lineTo(ax.X(xmax),ax.Y(1));ctx.stroke();ctx.setLineDash([]);
  T.forEach((a,i)=>{ctx.strokeStyle=c[i];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(Math.min(a,xmax)),ax.Y(Math.min(a,xmax)/a));ctx.stroke();});
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(t),ax.Y(1));ctx.stroke();
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(t),ax.Y(1),6,0,7);ctx.fill();txt(ctx,'Together: '+hm(t),ax.X(t)+8,ax.Y(1)-10,{s:12,w:700,c:PAL['rj']});
  legend(ctx,box.L+12,box.T+10,[...T.map((_,i)=>({label:L[i]+' alone',color:c[i]})),{label:'Together',color:PAL['rj']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=sim.gutS,s=nm(sim),T=times(sim),t=together(sim),c=COL(),names=[s.A,s.B,s.C];
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the job bar: shares A | C | B */
  const jx=40,jw=720,jy=44*k,jh=Math.max(40,30*k);
  txt(ctx,'The job: '+s.job,jx,jy-12,{s:13*k,w:700});
  rr(ctx,jx,jy,jw,jh,6);ctx.fillStyle=PAL['cv-bg2'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
  if(sh){const sh2=T.map(a=>t/a),ord=T.length===3?[0,2,1]:[0,1];let x=jx;ord.forEach(i=>{const w=sh2[i]*jw;ctx.fillStyle=c[i];ctx.globalAlpha=.85;ctx.fillRect(x,jy,w,jh);ctx.globalAlpha=1;
    if(w>60*k)txt(ctx,s.S[i]+': '+Math.round(sh2[i]*100)+'%',x+w/2,jy+jh/2+1,{s:13*k,w:700,c:'#fff',a:'center',b:'middle'});x+=w;});}
  else{txt(ctx,s.S[0]+(s.S[0]==='You'?' start here →':' starts here →'),jx+8,jy+jh/2+1,{s:12*k,w:700,c:c[0],b:'middle'});txt(ctx,'← '+s.S[1]+' starts here',jx+jw-8,jy+jh/2+1,{s:12*k,w:700,c:c[1],a:'right',b:'middle'});}
  /* texture */
  ctx.strokeStyle=PAL['card'];ctx.globalAlpha=.5;ctx.lineWidth=1;if(sim.p.scen==='fence'){for(let x=jx+18;x<jx+jw;x+=18){ctx.beginPath();ctx.moveTo(x,jy);ctx.lineTo(x,jy+jh);ctx.stroke();}}
  else if(sim.p.scen==='printers'){for(let x=jx+48;x<jx+jw;x+=48){ctx.beginPath();ctx.moveTo(x,jy+4);ctx.lineTo(x,jy+jh-4);ctx.stroke();}}
  else{ctx.beginPath();for(let x=jx;x<=jx+jw;x+=4)ctx.lineTo(x,jy+8+3*Math.sin(x/12));ctx.stroke();}ctx.globalAlpha=1;
  /* timeline */
  const rows=T.map((a,i)=>({lab:names[i]+' alone',v:a,col:c[i]}));if(sh)rows.push({lab:'Average of the times',v:T.reduce((p,q)=>p+q,0)/T.length,col:PAL['cv-soft'],dash:true});rows.push({lab:'Both together',v:t,col:PAL['rj'],hide:!sh});
  const gv=G&&G.g?G.g.min:sim.p.guess,xmax=Math.ceil(Math.max(...T,gv)*1.08/30)*30;
  const L0=Math.round(150+60*k),R0=770,ty=jy+jh+54*k,rh=Math.min(56,Math.max(26,(420-ty)/(rows.length+0.5)));
  const X=m=>L0+m/xmax*(R0-L0);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const step=[15,30,60,120,180].find(q=>(R0-L0)*q/xmax>=50*k)||240;
  const by=ty+rows.length*rh;for(let m=0;m<=xmax;m+=step){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(X(m),ty-rh*0.5);ctx.lineTo(X(m),by-rh*0.3);ctx.stroke();ctx.globalAlpha=1;txt(ctx,m>=60&&m%60===0?(m/60)+' h':hm(m),X(m),by+8*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  rows.forEach((r,i)=>{const y=ty+i*rh;txt(ctx,r.lab,L0-10,y+5,{s:12*k,w:700,a:'right',c:r.col===PAL['cv-soft']?PAL['cv-soft']:r.col});
   if(r.hide){txt(ctx,'?',X(0)+8,y+9,{s:24*k,w:700,c:r.col});return;}
   if(r.dash){ctx.strokeStyle=r.col;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(X(0),y);ctx.lineTo(X(r.v),y);ctx.stroke();ctx.setLineDash([]);}
   else{ctx.fillStyle=r.col;ctx.fillRect(X(0),y-rh*0.25,X(r.v)-X(0),rh*0.5);}
   htxt(ctx,hm(r.v),X(r.v)+6,y+5,{s:12*k,w:700,c:r.col});});
  /* gut line */
  const gx=X(gv);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(gx,ty-rh*0.6);ctx.lineTo(gx,by-rh*0.3);ctx.stroke();ctx.setLineDash([]);
  htxt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+hm(gv),clamp(gx,L0+60*k,R0-60*k),ty-rh*0.6-6,{s:12*k,w:700,c:PAL['s4'],a:'center'});},
 narrate(sim){const T=times(sim),t=together(sim),s=nm(sim);
  if(!shown(sim))return `${s.A} alone: ${hm(T[0])}. ${s.B} alone: ${hm(T[1])}. Working together, both chip away at ${s.job} at once, so <b>the job must take less time than the faster one alone</b>. Lock in your guess.`;
  const r=T.map(a=>'1/'+a).join(' + ');return `Each minute they finish ${r} of the job. That adds to 1/${fmtNum(t,1)}, so together they need <b>${hm(t)}</b>, less than the fastest alone (${hm(Math.min(...T))}).`;},
 gut:{better:'lower',
  controls:['guess'],
  ask:{bio:'The bars show how long you and your friend each take alone. Drag the slider here to how long you think the job takes with both of you painting at once. Then lock it in.',honors:'Before you add any rates: how long will the job take with everyone working? Drag the slider here to your guess, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-together(sim)),min:g,label:hm(g)};},
  solve(sim){const t=together(sim);sim.p.guess=clamp(Math.round(t/5)*5,5,600);return {v:0,min:t,label:hm(t)+' working together'};},
  how:{bio:'The math adds what each one does per minute. A finishes 1/a of the job each minute and B finishes 1/b. Add those, and flip the answer to get the time.',
   honors:'1/a + 1/b = 1/t. Add the fractions with a common denominator, then take the reciprocal: t = ab/(a + b).',
   ap:'Σ 1/tᵢ = 1/t. The sum of rates is always more than the biggest single rate, so t is always less than the fastest worker’s time.'},
  compare(sim,g,m){const T=times(sim),t=m.min,avg=T.reduce((p,q)=>p+q,0)/T.length,off=g.min-t;
   if(Math.abs(off)<=Math.max(5,0.06*t))return `Your gut was right on: about ${hm(t)}. You already sense that the fast worker carries more of the load; the math adds the rates to show exactly how much.`;
   const nearAvg=Math.abs(g.min-avg)<=0.15*avg;
   if(off>0)return `Together they need only <b>${hm(t)}</b>. If you scheduled your ${hm(g.min)}, you would block out <b>${hm(off)} of extra time</b>. ${nearAvg?'Averaging the times is the most common mistake: the average is even longer than the faster worker alone.':(g.min>=Math.min(...T)?'Any guess longer than the faster worker alone cannot be right: adding a helper never slows the job down.':'')}`;
   return `Together they need <b>${hm(t)}</b>, so planning on ${hm(g.min)} would leave you <b>${hm(-off)} behind schedule</b>. The slower worker helps, but adds less than an equal partner would.`;},
  again(sim){sim.peek=false;const keys=Object.keys(SC),key=keys[Math.floor(Math.random()*3)];sim.p.scen=key;const base=SC[key];
   const f=[0.5,0.75,1,1.25,1.5][Math.floor(Math.random()*5)],r=[1.25,1.5,2,3,4][Math.floor(Math.random()*5)];sim.p.a=clamp(Math.round(base.a*f/5)*5,10,600);sim.p.b=clamp(Math.round(sim.p.a*r/5)*5,10,600);sim.p.guess=60;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'Printer A prints a job in 30 minutes; printer B takes 60 minutes. If they split the job, how long does it take?',choices:['45 minutes','30 minutes','20 minutes','90 minutes'],correct:2,explain:'A does 1/30 of the job each minute and B does 1/60. Together: 2/60 + 1/60 = 3/60 = 1/20 of the job each minute, so 20 minutes. A does two thirds of the pages.'},
  {lvl:'bio',instant:true,q:'Two painters each take 4 hours to paint a fence alone. How long together?',choices:['8 hours','4 hours','2 hours'],correct:2,explain:'Each paints 1/4 of the fence per hour, so together they paint 1/2 per hour: 2 hours. Equal workers halve the time; unequal ones don’t, which is why averaging fails.'},
  {lvl:'honors',instant:true,q:'Painter A takes 3 hours alone and painter B takes 5 hours. How long together?',choices:['4 hours','2 hours','1 hour 52.5 minutes','1 hour 30 minutes'],correct:2,explain:'1/3 + 1/5 = 8/15 of the fence per hour, so t = 15/8 = 1.875 hours = 1 hour 52.5 minutes. The average, 4 hours, is longer than A alone, so it cannot be right.'},
  {lvl:'honors',instant:true,q:'A fast worker takes 2 hours alone. A very slow helper would take 100 hours alone. About how long together?',choices:['About 1 hour','About 1.96 hours','About 51 hours'],correct:1,explain:'1/2 + 1/100 = 51/100 per hour, so t = 100/51 ≈ 1.96 hours. A very slow helper barely helps, but the time is still a little less than the fast worker alone.'},
  {lvl:'ap',instant:true,q:'A pump empties a tank alone in 6 hours. With a second pump helping, it takes 4 hours. How long would the second pump take alone?',choices:['2 hours','5 hours','10 hours','12 hours'],correct:3,explain:'1/6 + 1/b = 1/4, so 1/b = 1/4 − 1/6 = 3/12 − 2/12 = 1/12. The second pump alone would take 12 hours.'},
  {lvl:'ap',instant:true,q:'Three pumps alone would take 4, 6 and 12 hours. How long with all three?',choices:['2 hours','about 7.3 hours','22 hours','1 hour'],correct:0,explain:'1/4 + 1/6 + 1/12 = 3/12 + 2/12 + 1/12 = 6/12 = 1/2 of the tank per hour, so 2 hours.'}
 ],
 tour:[
  {title:'The job',text:'You can paint the fence alone in 3 hours. Your friend, newer at it, takes 5 hours. You will work at the same time, from opposite ends.',pause:true,setup:sim=>{sim.peek=false;BioLab.setValues(sim,{scen:'fence',three:false,guess:240});}},
  {title:'The trap',text:'Most people average: (3 + 5) ÷ 2 = 4 hours. But that is longer than you alone! Adding a helper cannot make the job slower, so the answer must be under 3 hours.',pause:true},
  {title:'Think in rates',text:'You paint 1/3 of the fence each hour. Your friend paints 1/5 each hour. Rates are amounts per hour, and rates add.',pause:true},
  {title:'Add the rates',text:'1/3 + 1/5 = 5/15 + 3/15 = 8/15 of the fence per hour. Flip it: the whole fence takes 15/8 hours.',pause:true,setup:sim=>{sim.peek=true;}},
  {title:'The answer',text:'15/8 hours = 1 hour 52.5 minutes. You paint 62.5% of the fence and your friend paints 37.5%. Planning on the average would have blocked out 2 hours 7.5 minutes too many.',pause:true},
  {lvl:'honors',title:'A third painter',text:'Add a third friend, who takes 4 hours alone. Now 1/3 + 1/5 + 1/4 = 47/60 per hour, so the job takes about 1 hour 16.6 minutes.',pause:true,setup:sim=>BioLab.setValues(sim,{three:true,c:240})},
  {lvl:'ap',title:'The formula',text:'For two workers, 1/a + 1/b = 1/t gives t = ab/(a + b). For a = 180 and b = 300 minutes: 54,000 ÷ 480 = 112.5 minutes.',pause:true,setup:sim=>BioLab.setValues(sim,{three:false})}
 ],
 lab:{bio:'<p><b>Question:</b> How much does a slow helper help?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Keep A at 180 minutes. Set B to 180, 300, 600 minutes and record the time together each time.</li><li>Compare each with A alone and with the average.</li></ol><p>Write one sentence: is the time together ever more than A alone?</p>',
  honors:'<p><b>Question:</b> How does a third worker change the job?</p><ol><li>Record the time for A and B together.</li><li>Turn on the third worker and try C at 120, 240 and 480 minutes.</li></ol><p>Explain with 1/t = 1/a + 1/b + 1/c why every extra worker helps, but a slow one helps less.</p>',
  ap:'<p><b>Question:</b> Find an unknown worker’s time.</p><ol><li>Pick a time for A and a time together that is shorter.</li><li>Solve 1/a + 1/b = 1/t for b, then check it in the tool.</li><li>What happens to b as t gets close to a?</li></ol><p><b>CER:</b> Explain why t must always be less than the fastest worker’s time.</p>'},
 terms:[
  {t:'Work rate',d:'How much of a job gets done per unit of time. A worker who takes 3 hours has a rate of 1/3 of the job per hour.'},
  {t:'Reciprocal',d:'1 divided by a number. Time and rate are reciprocals: 3 hours per job means 1/3 job per hour.'},
  {t:'Rational equation',d:'An equation with variables in denominators, like 1/a + 1/b = 1/t.',lvl:'honors'},
  {t:'Harmonic combination',d:'t = ab/(a + b): the time together. It is always less than the smaller of a and b.',lvl:'ap'}
 ],
 about:'<p>Each worker has a steady rate: 1/(time alone) of the job per minute. Rates add, so 1/a + 1/b (+ 1/c) = 1/t, and t = ab/(a + b) for two workers. The scenario times are examples for illustration.</p><p>The model assumes every worker keeps their full speed and nobody gets in anyone’s way. Real jobs are messier: two painters can bump into each other, two pumps on one pipe do not each keep their full flow, and computer chips spend time coordinating their cores. Real teams usually do a bit worse than the formula.</p>'
};
BioLab.register(SIM);
})();
