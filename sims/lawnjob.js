(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,rng,randn}=BioLab.h;
/* Your 15 past jobs come from a hidden rule: 10 min of setup plus 6 min per 1,000 sq ft, and each job varies from that by a
   normal error with a standard deviation of 5 min (trees, slopes, flower beds). Sizes are spread from 2,000 to 12,000 sq ft. */
const N=15,A0=10,B0=6,SD0=5,TSTAR=2.160;   /* t* for 95% confidence with n − 2 = 13 degrees of freedom */
function jobs(seed){const r=rng(seed*7919+101),L=[];
 for(let i=0;i<N;i++){const x=Math.round((2000+(i+r())*10000/N)/100)*100;L.push({x,t:Math.max(8,Math.round(A0+B0*x/1000+SD0*randn(r)))});}
 return L;}
function fit(L){const n=L.length,xs=L.map(p=>p.x/1000),ys=L.map(p=>p.t),mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;
 let sxx=0,sxy=0,syy=0;for(let i=0;i<n;i++){sxx+=(xs[i]-mx)**2;sxy+=(xs[i]-mx)*(ys[i]-my);syy+=(ys[i]-my)**2;}
 const b=sxy/sxx,a=my-b*mx;let sse=0;for(let i=0;i<n;i++)sse+=(ys[i]-a-b*xs[i])**2;
 const s=Math.sqrt(sse/(n-2)),r=sxy/Math.sqrt(sxx*syy);
 return {n,a,b,mx,my,sxx,s,r,r2:r*r,seb:s/Math.sqrt(sxx),xmin:Math.min(...xs),xmax:Math.max(...xs)};}
function makeSt(seed){const L=jobs(seed);return {seed,jobs:L,F:fit(L)};}
const F=sim=>sim.st.F;
const X0=sim=>sim.p.size/1000;
const yhat=sim=>F(sim).a+F(sim).b*X0(sim);
/* spread of a single new job of this size around the line (prediction standard error) */
const sPred=sim=>{const f=F(sim),x=X0(sim);return f.s*Math.sqrt(1+1/f.n+(x-f.mx)**2/f.sxx);};
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2)),phi=z=>Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);
/* Average minutes off, across jobs like this one, if you plan for c minutes: E|c − Y| with Y normal around the line. */
function minOff(sim,c){const s=sPred(sim),d=Math.abs(c-yhat(sim))/s;return s*(2*phi(d)+d*(2*Phi(d)-1));}
const dollars=(sim,min)=>min*sim.p.rate/60;
const offD=(sim,c)=>dollars(sim,minOff(sim,c));
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.line||sim.st.peek||(GS(sim)&&GS(sim).g));
const beyond=sim=>X0(sim)>F(sim).xmax+0.05||X0(sim)<F(sim).xmin-0.05;
const f0=v=>Math.round(v).toString(),f1=v=>v.toFixed(1),f2=v=>v.toFixed(2);
const money=v=>'$'+v.toFixed(2),sq=x=>Math.round(x).toLocaleString('en-US');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* plot frame on the stage */
const PL=84,PR=780,PT=44,PB=386,XM=21;
const PX=x=>PL+x/XM*(PR-PL);
/* a label with a background box, so it stays readable over dots and grid lines */
function tag(ctx,s,x,y,c,a,k){ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(s).width,h=16*k,x0=a==='right'?x-w-4:x-4;ctx.globalAlpha=.85;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x0,y-12*k,w+8,h);ctx.globalAlpha=1;txt(ctx,s,x,y,{s:12*k,w:700,c,a});}
const yMax=sim=>{const f=F(sim),m=Math.max(140,sim.p.est,f.a+f.b*XM,...sim.st.jobs.map(j=>j.t));return Math.ceil((m+6)/20)*20;};

const SIM={
 id:'lawnjob',hash:'lawnjob',apUnit:13,order:5,tab:'Quote a lawn job',kind:'Simulation',
 card:'Guess how long a new customer’s lawn will take, then let a regression line on your past jobs set the quote.',
 title:'How much should you charge to mow this lawn?',
 lede:{bio:'You charge by the hour, so a good quote starts with a good time estimate. Your 15 past jobs already hold the answer: draw the line through them and read off the new lawn.',
  honors:'The least-squares regression line ŷ = a + bx makes the sum of the squared residuals as small as possible. The correlation r and r² tell you how tightly your jobs follow it.',
  ap:'The slope b is only an estimate from 15 jobs. A t-interval, b ± t*·SE_b with n − 2 degrees of freedom, gives a range of plausible true slopes and shows whether the data give convincing evidence of a real linear relationship.'},
 scale:'Lawn size in square feet (a typical suburban front and back yard is a few thousand sq ft). Time in minutes, including setup, mowing, trimming and cleanup.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The job',
 controls:[
  {id:'est',label:'Your time estimate for the new lawn',type:'range',min:5,max:180,step:1,def:30,unit:' min'},
  {id:'size',label:'New customer’s lawn',type:'range',min:1000,max:20000,step:100,def:6500,unit:' sq ft',noGut:true,onChange:clearGut,help:'Many county property websites list a lot’s size, and free online map tools can measure a yard. Subtract the house and driveway.'},
  {id:'rate',label:'Your hourly rate, dollars per hour',type:'range',min:15,max:40,step:1,def:25,unit:' $/h',noGut:true,onChange:clearGut},
  {id:'line',label:'Show the line now',type:'toggle',def:false,help:'Normally the line appears once you lock in your gut estimate.'},
  {id:'resid',label:'Show the residuals',type:'toggle',def:false,help:'Each job’s miss from the line: actual minutes minus predicted minutes.'},
  {id:'truth',label:'Show the hidden rule the jobs came from',type:'toggle',def:false,lvl:'ap',help:'In real life you never get to see this. Here you can check how close your line came.'}
 ],
 actions:[{id:'newdata',label:'New set of 15 past jobs',run(sim){const sd=(sim.st.seed||3)+1;sim.st=makeSt(sd);clearGut(sim);sim.infoDirty=true;}}],
 init(){return makeSt(3);},step(){},
 metrics:[
  {id:'quote',label:'Your quote ($)',unit:'',d:2,min:0,max:100,get:sim=>dollars(sim,sim.p.est)},
  {id:'pred',label:'The line predicts',unit:'min',d:1,min:0,max:200,get:sim=>shown(sim)?yhat(sim):null},
  {id:'lq',label:'The line’s quote ($)',unit:'',d:2,min:0,max:100,get:sim=>shown(sim)?dollars(sim,yhat(sim)):null},
  {id:'off',label:'Your quote: average dollars off',unit:'',d:2,min:0,max:30,get:sim=>shown(sim)?offD(sim,sim.p.est):null},
  {id:'r',label:'Correlation r',unit:'',d:3,lvl:'honors',min:-1,max:1,get:sim=>F(sim).r},
  {id:'r2',label:'r²',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>100*F(sim).r2},
  {id:'slope',label:'Slope b',unit:'min per 1,000 sq ft',d:2,lvl:'ap',min:0,max:12,get:sim=>F(sim).b},
  {id:'seb',label:'Standard error of the slope',unit:'',d:3,lvl:'ap',min:0,max:2,get:sim=>F(sim).seb},
  {id:'eq',label:'The line',text:true,lvl:'honors',get:sim=>{const f=F(sim);return `Predicted minutes = ${f1(f.a)} + ${f2(f.b)} × (sq ft ÷ 1,000)`;}},
  {id:'ci',label:'95% confidence interval for the true slope',text:true,lvl:'ap',get:sim=>{const f=F(sim),m=TSTAR*f.seb;return `${f2(f.b)} ± ${f2(m)}: from ${f2(f.b-m)} to ${f2(f.b+m)} min per 1,000 sq ft (t* = 2.160, df = 13)`;}}
 ],
 graphs:[{id:'miss',label:'Average dollars off vs. your estimate',custom:true},{id:'res',label:'Residual plot',lvl:'ap',custom:true}],defaultGraph:'miss',
 plot(sim,ctx,box,id){const f=F(sim),G=GS(sim);
  if(id==='res'){const R=sim.st.jobs.map(j=>({x:j.x/1000,e:j.t-(f.a+f.b*j.x/1000)})),m=Math.max(10,Math.ceil(Math.max(...R.map(q=>Math.abs(q.e)))/5)*5);
   const ax=axes(ctx,box,{xmin:0,xmax:14,ymin:-m,ymax:m,xl:'Lawn size (thousands of sq ft)',yl:'Residual (min)'});
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(14),ax.Y(0));ctx.stroke();
   R.forEach(q=>{ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(ax.X(q.x),ax.Y(q.e),5,0,7);ctx.fill();});
   legend(ctx,box.L+10,box.T+8,[{label:'No pattern around 0 means a line fits',color:PAL['rj']}]);return;}
  if(!shown(sim)){axes(ctx,box,{xmin:0,xmax:120,ymin:0,ymax:20,xl:'Your time estimate (min)',yl:'Average $ off'});txt(ctx,'Lock in your gut estimate to see this curve.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const yh=yhat(sim),lo=Math.max(0,Math.floor((yh-40)/10)*10),hi=lo+80,top=Math.max(5,Math.ceil(Math.max(offD(sim,lo),offD(sim,hi))/5)*5);
  const ax=axes(ctx,box,{xmin:lo,xmax:hi,ymin:0,ymax:top,xl:'Your time estimate for this lawn (min)',yl:'Average $ off'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let c=lo;c<=hi+1e-9;c+=0.5){const px=ax.X(c),py=ax.Y(offD(sim,c));c===lo?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
  const dot=(c,col,lab,up)=>{if(c<lo||c>hi)return;const v=offD(sim,c);ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(c),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,ax.X(c),ax.Y(v)+(up?-12:20),{s:12,w:700,c:col,a:'center'});};
  if(G&&G.g)dot(G.g.est,PAL['s4'],'Your gut',false);
  dot(yh,PAL['s3'],'The line',true);
  if(!(G&&G.m))dot(sim.p.est,PAL['rj'],'Now',G&&G.g&&Math.abs(G.g.est-sim.p.est)<4);},
 draw(sim,ctx,vdt,k){const f=F(sim),YM=yMax(sim),PY=y=>PB-y/YM*(PB-PT),sh=shown(sim),G=GS(sim),x0=X0(sim),hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* beyond the data */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(PL,PT,PX(f.xmin)-PL,PB-PT);ctx.fillRect(PX(f.xmax),PT,PR-PX(f.xmax),PB-PT);
  txt(ctx,'Beyond your data',(PX(f.xmax)+PR)/2,PB-10,{s:12*k,c:PAL['cv-soft'],a:'center'});
  /* grid and ticks */
  const xs=k>1.35?4:2,ys=k>1.35?40:20;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let x=0;x<=XM;x+=xs){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(PX(x),PT);ctx.lineTo(PX(x),PB);ctx.stroke();ctx.globalAlpha=1;txt(ctx,x===0?'0':sq(x*1000),PX(x),PB+17*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  for(let y=0;y<=YM;y+=ys){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(PL,PY(y));ctx.lineTo(PR,PY(y));ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(y),PL-8,PY(y)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PL,PT);ctx.lineTo(PL,PB);ctx.lineTo(PR,PB);ctx.stroke();
  txt(ctx,'Lawn size (sq ft)',PR,PB+36*k,{s:12*k,w:700,c:PAL['cv-ink'],a:'right'});
  txt(ctx,'Minutes',6,PT-14,{s:12*k,w:700,c:PAL['cv-ink'],a:'left'});
  /* hidden rule */
  if(sim.p.truth&&atLeast('ap')){ctx.setLineDash([3,5]);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(0),PY(A0));ctx.lineTo(PX(XM),PY(A0+B0*XM));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,k>1.3?'Purple: hidden rule':'Purple dashes: hidden rule, 10 + 6 per 1,000 sq ft',PR-8,PB-50*k,{s:12*k,w:700,c:PAL['s5'],a:'right'});}
  /* the line: solid over the data, dashed beyond it */
  if(sh){const L=x=>PY(f.a+f.b*x);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(PX(f.xmin),L(f.xmin));ctx.lineTo(PX(f.xmax),L(f.xmax));ctx.stroke();
   ctx.setLineDash([8,6]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(0),L(0));ctx.lineTo(PX(f.xmin),L(f.xmin));ctx.moveTo(PX(f.xmax),L(f.xmax));ctx.lineTo(PX(XM),L(XM));ctx.stroke();ctx.setLineDash([]);}
  /* residuals */
  if(sim.p.resid)sim.st.jobs.forEach(j=>{const x=j.x/1000;ctx.strokeStyle=j.t>f.a+f.b*x?PAL['s1']:PAL['s2'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PX(x),PY(j.t));ctx.lineTo(PX(x),PY(f.a+f.b*x));ctx.stroke();});
  /* the jobs */
  sim.st.jobs.forEach(j=>{ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(PX(j.x/1000),PY(j.t),6,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=1.5;ctx.stroke();});
  /* the new lawn */
  const cx=PX(x0);ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['s6'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,PT);ctx.lineTo(cx,PB);ctx.stroke();ctx.setLineDash([]);
  const right=cx<520;txt(ctx,'New lawn: '+sq(sim.p.size)+' sq ft',cx+(right?8:-8),PT+4+12*k,{s:12*k,w:700,c:PAL['s6'],a:right?'left':'right'});
  /* gut, estimate and the line's prediction on the new lawn */
  const yh=yhat(sim);
  if(G&&G.g&&Math.abs(G.g.est-sim.p.est)>0.6){const gy=PY(G.g.est);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,gy,9,0,7);ctx.stroke();tag(ctx,'Your gut: '+f0(G.g.est)+' min',cx+(right?14:-14),gy+4+(Math.abs(gy-PY(sim.p.est))<20*k?(G.g.est<sim.p.est?14*k:-14*k):0),PAL['s4'],right?'left':'right',k);}
  if(sh&&Math.abs(sim.p.est-yh)>0.6){const py=PY(yh);ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(cx,py,7,0,7);ctx.fill();tag(ctx,'Line: '+f0(yh)+' min',cx+(right?-14:14),py+4,PAL['s3'],right?'right':'left',k);}
  const ey=PY(sim.p.est),isM=G&&G.m;ctx.fillStyle=isM?PAL['s3']:PAL['s4'];ctx.beginPath();ctx.arc(cx,ey,8,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
  if(!(G&&G.g&&Math.abs(G.g.est-sim.p.est)>0.6&&!isM))tag(ctx,(isM?'The line: ':'Your estimate: ')+f0(sim.p.est)+' min',cx+(isM?(right?-14:14):(right?14:-14)),ey+(isM?4:-10),isM?PAL['s3']:PAL['s4'],isM?(right?'right':'left'):(right?'left':'right'),k);
  pill(ctx,'Quote: '+money(dollars(sim,sim.p.est))+' at $'+sim.p.rate+'/h',650,PT-18,PAL['rj'],'#fff',13*Math.min(k,1.3));
  if(hon&&sh)txt(ctx,'r = '+f2(f.r),PR-8,PB-30*k,{s:12*k,w:700,c:PAL['cv-ink'],a:'right'});},
 narrate(sim){const f=F(sim),yh=yhat(sim),x0=X0(sim);
  if(beyond(sim))return `<b>Careful: ${sq(sim.p.size)} sq ft is outside your data.</b> Your jobs ran from ${sq(f.xmin*1000)} to ${sq(f.xmax*1000)} sq ft. The line says ${f0(yh)} min, but nothing you have mowed tells you the pattern holds out there.`;
  if(!shown(sim))return `Bigger lawns take longer, but not in exact proportion: every job also has setup time. Your estimate of ${f0(sim.p.est)} min makes a quote of <b>${money(dollars(sim,sim.p.est))}</b>.`;
  const d=sim.p.est-yh;
  if(Math.abs(d)<1)return `<b>You are on the line.</b> It predicts ${f0(yh)} min for this lawn, a quote of ${money(dollars(sim,yh))}. Real jobs still scatter around it, so even this quote is off by about ${money(offD(sim,yh))} on an average job.`;
  return `The line predicts ${f0(yh)} min for this lawn. Your estimate is ${f0(Math.abs(d))} min ${d>0?'over':'under'}, so <b>${d>0?'you may price yourself out of the job':'you work those extra minutes for free'}</b>.`;},
 gut:{better:'lower',controls:['est'],lockLabel:'Lock in my estimate',
  ask:{bio:'How long will the new lawn take you? Look at your past jobs in the picture, then drag the slider here to your gut estimate. Your quote updates as you drag. Lock it in when it feels right.',
   honors:'Before you look at the line: drag the slider here to your gut estimate for the new lawn, then lock it in.'},
  lock(sim){return {v:offD(sim,sim.p.est),est:sim.p.est,yh:yhat(sim),label:`${f0(sim.p.est)} min, a ${money(dollars(sim,sim.p.est))} quote`};},
  solve(sim){const yh=yhat(sim);sim.p.est=yh;return {v:offD(sim,yh),est:yh,yh,label:`${f1(yh)} min, a ${money(dollars(sim,yh))} quote`};},
  how:{bio:'The math draws the one line that runs closest to all 15 jobs at once, then reads the new lawn’s size off that line. Every past job gets a say, not just the one or two that stick in your memory.',
   honors:'The least-squares line makes the sum of the squared residuals as small as possible: b = r·(s_y/s_x), and the line passes through (x̄, ȳ). The prediction is ŷ = a + b·x for the new lawn.',
   ap:'ŷ = a + b·x with b = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)². Jobs this size scatter around ŷ with a prediction standard error s·√(1 + 1/n + (x − x̄)²/Σ(x − x̄)²), so no quote can be exact, but ŷ keeps the average miss smallest.'},
  compare(sim,g,m){const dm=g.est-m.est,extra=g.v-m.v;
   if(Math.abs(dm)<1)return `Your gut was right on: within a minute of the line. Your eye already does what least squares does. Jobs still vary, so even this quote is off by about <b>${money(m.v)}</b> on an average job.`;
   const tail=beyond(sim)?' This lawn is outside your data, so both numbers lean on a pattern you have not tested.':'';
   return `Your gut was ${f0(Math.abs(dm))} min ${dm>0?'over':'under'} the line (a quote ${money(dollars(sim,Math.abs(dm)))} ${dm>0?'too high: a customer comparing prices may hire someone else':'too low: you would mow those minutes for free'}). Across jobs like this one, your quote is off by about <b>${money(g.v)}</b> on average, against <b>${money(m.v)}</b> for the line’s quote. That is <b>${money(extra)} more per job</b>, or about <b>$${Math.round(extra*30)}</b> over a summer of 30 jobs this far off.${tail}`;},
  again(sim){const r=Math.random();sim.p.size=Math.round((2500+r*9000)/100)*100;sim.p.est=30;sim.p.line=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Your line says: minutes = 10 + 6 × (lawn size in thousands of sq ft). A 4,000 sq ft lawn takes about 34 minutes. About how long should an 8,000 sq ft lawn take?',choices:['68 minutes: twice the lawn, twice the time','58 minutes','44 minutes'],correct:1,explain:'10 + 6 × 8 = 58 minutes. The 10 minutes of setup (unloading, gas, cleanup) happen once per job, so doubling the lawn adds 24 minutes, not 34.'},
  {lvl:'bio',instant:true,q:'Your past lawns ran from about 2,000 to 12,000 sq ft. A family asks you to mow 2 acres (87,120 sq ft). The same line says about 533 minutes. How much should you trust that?',choices:['Completely: the line works for any size','Not much: that is far beyond every lawn in your data','Not at all: a line can never predict anything'],correct:1,explain:'Using a line far outside the data is called extrapolation. Nothing in your 15 jobs tells you how a lawn seven times bigger goes: you might need a riding mower, or several trips to empty the bag. Quote it as a new kind of job.'},
  {lvl:'bio',instant:true,q:'One job took 52 minutes. The line predicted 46 minutes for that lawn. What is that job’s residual?',choices:['+6 minutes','−6 minutes','46 minutes'],correct:0,explain:'Residual = actual − predicted = 52 − 46 = +6 minutes. A positive residual means the dot sits above the line: the job ran longer than the line said.'},
  {lvl:'honors',instant:true,q:'Your line has r² = 0.90. What does that mean?',choices:['90% of your predictions will be exactly right','About 90% of the variation in job times is accounted for by the linear relationship with lawn size','Lawn size causes 90% of your mowing time'],correct:1,explain:'r² is the fraction of the variation in y that the line accounts for. The other 10% is the job-to-job scatter: trees, slopes, tall grass. No single prediction is promised to be exact.'},
  {lvl:'honors',instant:true,q:'Bigger lawns take longer, and your dots hug the line closely. Which correlation fits best?',choices:['r = −0.95','r = 0.95','r = 0.30'],correct:1,explain:'Positive, because time goes up as size goes up. Close to 1, because the dots stay near a straight line. r = 0.30 would be a loose cloud.'},
  {lvl:'ap',instant:true,q:'Suppose your slope came out to b = 5.9 minutes per 1,000 sq ft. Which interpretation is correct?',choices:['Every lawn takes 5.9 minutes','For each extra 1,000 sq ft, the predicted time goes up by about 5.9 minutes','A 1,000 sq ft lawn takes 5.9 minutes'],correct:1,explain:'The slope is the predicted change in y for a one-unit change in x. Here one unit is 1,000 sq ft, so each extra 1,000 sq ft adds about 5.9 minutes on average.'},
  {lvl:'ap',instant:true,q:'From 15 jobs: b = 6.0 min per 1,000 sq ft, with standard error SE_b = 0.40. Which is the 95% confidence interval for the true slope?',choices:['6.0 ± 0.78, using z* = 1.96','6.0 ± 0.86, using t* = 2.160 with 13 degrees of freedom','6.0 ± 0.40'],correct:1,explain:'For a slope, df = n − 2 = 13, so t* = 2.160. The margin is 2.160 × 0.40 = 0.864, giving about 5.14 to 6.86. The interval is nowhere near 0, so lawn size really does predict time.'},
  {lvl:'ap',instant:true,q:'Your residual plot shows a clear U shape: positive at both ends, negative in the middle. What does that tell you?',choices:['The line fits very well','The pattern is curved, so a straight line is not the right model','The correlation must be negative'],correct:1,explain:'A good linear fit leaves residuals scattered randomly around 0. A U shape means the line is too high in the middle and too low at both ends: the true pattern bends.'}
 ],
 tour:[
  {title:'Your 15 past jobs',text:'Each blue dot is one lawn you mowed: its size across the bottom, the minutes it took up the side. Bigger lawns take longer, but the dots do not line up perfectly. Every yard has its own trees, slopes and flower beds.',focus:[PL-10,PT-10,PR-PL+20,PB-PT+20],pause:true,setup:sim=>{BioLab.setValues(sim,{size:6500,est:30,line:false,resid:false,truth:false});sim.st.peek=false;}},
  {title:'The new lawn',text:'The dashed line is the new customer’s 6,500 sq ft lawn. Your time estimate is a dot somewhere on it, and your quote is that time at your hourly rate.',pause:true},
  {title:'One line through the middle',text:'The red line runs through the middle of all 15 dots: about 10.7 minutes to get started, plus 6.04 minutes for every 1,000 sq ft. It is called the least-squares regression line.',pause:true,setup:sim=>{sim.st.peek=true;}},
  {title:'Residuals: how far each job missed',text:'Each short stick is a residual: actual minutes minus what the line predicted. Red sticks ran long, blue sticks ran short. The least-squares line makes the total of the squared sticks as small as it can be.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{resid:true});}},
  {title:'Read off the new lawn',text:'At 6,500 sq ft the line says about 49.9 minutes. At $25 an hour that is a quote of about $20.79. Real jobs this size still scatter by several minutes, but this quote keeps your average miss smallest.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{resid:false,est:50});},focus:sim=>[PX(6.5)-60,PT,120,PB-PT]},
  {title:'Do not stretch the line',text:'Now the lawn is 18,000 sq ft. Your biggest job was 11,400 sq ft, so the line is dashed out here: you are guessing that the pattern keeps going. That is extrapolation. A lawn this big might need a different mower or a different plan.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{size:18000,est:119});}},
  {lvl:'honors',title:'How tight is the pattern?',text:'The correlation is r = 0.97, so r² = 0.94: about 94% of the variation in your job times is accounted for by lawn size. The rest is yard-to-yard scatter.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{size:6500,est:50,resid:true});}},
  {lvl:'ap',title:'Is the relationship real?',text:'From only 15 jobs, the slope is an estimate. Its 95% confidence interval is 6.04 ± 0.91, from 5.13 to 6.95 minutes per 1,000 sq ft. Zero is far outside it, so the data give convincing evidence of a positive linear relationship between lawn size and time. The hidden rule’s slope, 6, is inside it.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{truth:true,resid:false});}}
 ],
 lab:{bio:'<p><b>Question:</b> How much does a bad estimate cost you?</p><ol><li>Leave the lawn at 6,500 sq ft. Set your estimate 20 minutes under the line and record a trial. Then 10 under, on the line, 10 over and 20 over.</li><li>Look at <b>Your quote: average dollars off</b> for each.</li></ol><p>Write one sentence: does being 20 minutes off cost twice as much as being 10 minutes off?</p>',
  honors:'<p><b>Question:</b> How much do the residuals depend on which jobs you happened to do?</p><ol><li>Turn on the residuals and record r, r² and the equation.</li><li>Press <b>New set of 15 past jobs</b> four times, recording each.</li></ol><p>Explain why the line changes a little each time even though the hidden rule never changes.</p>',
  ap:'<p><b>Question:</b> Does the 95% interval for the slope really catch the true slope about 95% of the time?</p><ol><li>Turn on <b>Show the hidden rule</b> (slope 6).</li><li>Press <b>New set of 15 past jobs</b> 20 times. Each time, record whether the interval contains 6.</li></ol><p><b>CER:</b> Claim how often it caught 6, give your count as evidence, and explain what “95% confident” means.</p>'},
 terms:[
  {t:'Scatterplot',d:'A graph of two numbers for each case, here lawn size and minutes, one dot per job.'},
  {t:'Least-squares regression line',d:'The line that makes the sum of the squared residuals as small as possible. Written ŷ = a + bx.'},
  {t:'Residual',d:'Actual minus predicted: y − ŷ. Positive means the job ran longer than the line said.'},
  {t:'Extrapolation',d:'Using the line for x-values far outside the data. The pattern may not hold there.'},
  {t:'Correlation r',d:'A number from −1 to 1 that measures the direction and strength of a straight-line relationship.',lvl:'honors'},
  {t:'r²',d:'The fraction of the variation in y accounted for by the linear relationship with x.',lvl:'honors'},
  {t:'Slope b',d:'The predicted change in y for each one-unit increase in x.',lvl:'ap'},
  {t:'Confidence interval for the slope',d:'b ± t*·SE_b with n − 2 degrees of freedom: a range of plausible values for the true slope. If it leaves out 0, the data give strong evidence of a real linear relationship.',lvl:'ap'},
  {t:'Residual plot',d:'Residuals graphed against x. A random scatter around 0 means a line fits; a curve means it does not.',lvl:'ap'}
 ],
 about:'<p><b>The data.</b> Your 15 past jobs are made up by the tool from a hidden rule: 10 minutes of setup plus 6 minutes per 1,000 sq ft, and each job varies from that by a normal error with a standard deviation of 5 minutes. Those numbers are assumptions for illustration, roughly what a push mower, trimmer and cleanup might take. Real times depend on your mower, the grass and the yard.</p><p><b>The score.</b> No one knows exactly how long the next job will take. The tool treats jobs this size as scattering normally around the line, with the prediction standard error s·√(1 + 1/n + (x − x̄)²/Σ(x − x̄)²), and reports the average dollars your quote would be off across those jobs. Quoting the line’s prediction keeps that average as small as it can be. Dollars are minutes × your hourly rate ÷ 60.</p><p><b>The interval.</b> At Deep dive, the 95% confidence interval for the slope uses t* = 2.160 with 13 degrees of freedom. It assumes the conditions for regression inference: a linear pattern, independent jobs, and normal scatter with the same spread at every size.</p><p>This is a simplified model for practice, not business advice.</p>'
};
BioLab.register(SIM);
})();
