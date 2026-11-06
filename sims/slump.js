(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Free-throw slump. Normal you makes each shot with chance PN; in a real slump (1 stretch in 5) the chance is PS.
   The tool simulates NN normal stretches and NSL slump stretches of n shots each, from a fixed seed.
   Your rule: call it a slump when the percent made in the stretch is at or below your line.
   Wrong calls per 100 stretches = (false alarms + missed slumps) / (NN + NSL) × 100, counted on the simulated stretches. */
const PN=0.75,PS=0.60,NN=800,NSL=200,TOT=NN+NSL,SIZES=[10,40,100,400],SEED=7301;
const LAST=[1,0,1,1,0,0,1,0,1,0];      /* your last 10: 5 made */
const cache=new Map();
function simulate(seed){if(cache.has(seed))return cache.get(seed);const D={};
 SIZES.forEach(n=>{const r=rng((seed*31+n*7919)|0),N=new Int16Array(NN),S=new Int16Array(NSL);
  for(let i=0;i<NN;i++){let m=0;for(let j=0;j<n;j++)if(r()<PN)m++;N[i]=m;}
  for(let i=0;i<NSL;i++){let m=0;for(let j=0;j<n;j++)if(r()<PS)m++;S[i]=m;}
  const cN=new Int32Array(n+1),cS=new Int32Array(n+1);N.forEach(m=>cN[m]++);S.forEach(m=>cS[m]++);
  const kN=new Int32Array(n+1),kS=new Int32Array(n+1);let a=0,b=0;for(let k=0;k<=n;k++){a+=cN[k];b+=cS[k];kN[k]=a;kS[k]=b;}
  D[n]={N,S,cN,cS,kN,kS};});
 if(cache.size>12)cache.clear();cache.set(seed,D);return D;}
const seedOf=sim=>sim.p.seed||SEED;
const dat=sim=>sim.st.data[sim.p.n];
const kmaxOf=(n,cut)=>Math.floor(cut*n/100+1e-9);
function rule(sim,cut){const n=sim.p.n,d=dat(sim),k=kmaxOf(n,cut),fa=d.kN[k],miss=NSL-d.kS[k];return {fa,miss,wrong:100*(fa+miss)/TOT,k};}
function bestCut(sim){let b=0,bv=1e9;for(let c=0;c<=75;c++){const w=rule(sim,c).wrong;if(w<bv-1e-9){bv=w;b=c;}}return b;}
/* exact binomial CDF */
const lch=[0];for(let i=1;i<=400;i++)lch[i]=lch[i-1]+Math.log(i);
const pmf=(n,p,k)=>Math.exp(lch[n]-lch[k]-lch[n-k]+k*Math.log(p)+(n-k)*Math.log(1-p));
const cdf=(n,p,k)=>{let s=0;for(let j=0;j<=k;j++)s+=pmf(n,p,j);return s;};
function phatStats(sim){const n=sim.p.n,d=dat(sim);let s=0,s2=0;d.N.forEach(m=>{const x=m/n;s+=x;s2+=x*x;});const mu=s/NN;return {mu,sd:Math.sqrt((s2-NN*mu*mu)/(NN-1))};}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g));
const f1=v=>v.toFixed(1);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const lineWords=(n,cut)=>{const k=kmaxOf(n,cut);return `slump at ${cut}% or less (${k} of ${n} or fewer)`;};
const ans=(sim,cut)=>{const r=rule(sim,cut);return {v:r.wrong,cut,n:sim.p.n,seed:seedOf(sim),fa:r.fa,miss:r.miss,label:`${lineWords(sim.p.n,cut)}: ${f1(r.wrong)} wrong calls per 100 stretches`};};

const SIM={
 id:'slump',hash:'slump',apUnit:15,order:1,tab:'Is it really a slump?',kind:'Simulation',
 card:'Set by feel when you would call a shooting slump, then simulate 1,000 stretches of free throws to see how often that call is wrong.',
 title:'Is it really a slump?',
 lede:{bio:'A 75% free-throw shooter does not make exactly 3 of every 4. Over a short stretch, luck alone swings the results a lot. How bad does a stretch have to be before it means something is really wrong?',
  honors:'The percent made in a stretch is a sample proportion, p̂. Its sampling distribution is centered at your true rate p, and its spread shrinks as the stretch gets longer.',
  ap:'The sampling distribution of p̂ has mean p and standard deviation √(p(1 − p)/n). With independent shots and np ≥ 10 and n(1 − p) ≥ 10, it is approximately normal.'},
 scale:'Each block is one simulated stretch of free throws, stacked by the percent made. 800 normal stretches above the line, 200 real slumps below.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your slump rule',
 controls:[
  {id:'cut',label:'Your slump line: call it a slump at this percent made or less',type:'range',min:0,max:75,step:1,def:60,unit:'%'},
  {id:'n',label:'Free throws in each stretch',type:'seg',def:10,noGut:true,onChange:clearGut,options:[{v:10,l:'10'},{v:40,l:'40'},{v:100,l:'100'},{v:400,l:'400'}],help:'10 is one game or so. 100 or 400 means a week or two of practice.'},
  {id:'show',label:'Show the simulation',type:'toggle',def:false,help:'Off: you decide by feel first.'},
  {id:'curve',label:'Show the normal model',type:'toggle',def:false,lvl:'ap'}
 ],
 actions:[
  {id:'new',label:'New simulated stretches',run(sim){sim.p.seed=(seedOf(sim)%100000)+1;BioLab.reset(sim);}},
  {id:'best',label:'Use the math’s slump line',lvl:'honors',run(sim){BioLab.setValues(sim,{cut:bestCut(sim),show:true});}}
 ],
 init(sim){if(sim.mode==='guided'&&sim.guide&&sim.guide.phase==='gut')sim.p.seed=SEED;return {data:simulate(seedOf(sim)),nN:null,nS:null};},step(){},
 onTourExit(sim){sim.st.nN=null;sim.st.nS=null;},
 metrics:[
  {id:'wrong',label:'Wrong calls per 100 stretches',unit:'',d:1,min:0,max:50,get:sim=>shown(sim)?rule(sim,sim.p.cut).wrong:null},
  {id:'fa',label:'False alarms per 100 (you were fine)',unit:'',d:1,min:0,max:50,get:sim=>shown(sim)?100*rule(sim,sim.p.cut).fa/TOT:null},
  {id:'miss',label:'Missed slumps per 100',unit:'',d:1,min:0,max:20,get:sim=>shown(sim)?100*rule(sim,sim.p.cut).miss/TOT:null},
  {id:'bad',label:'Normal stretches at 50% made or worse',unit:'%',d:1,min:0,max:30,get:sim=>shown(sim)?100*dat(sim).kN[kmaxOf(sim.p.n,50)]/NN:null},
  {id:'exact',label:'Exact binomial chance of 50% or worse',unit:'%',d:2,lvl:'honors',min:0,max:30,get:sim=>shown(sim)?100*cdf(sim.p.n,PN,kmaxOf(sim.p.n,50)):null},
  {id:'center',label:'Center of p̂ for normal you (mean)',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?100*phatStats(sim).mu:null},
  {id:'spread',label:'Spread of p̂ for normal you (SD)',unit:'points',d:1,lvl:'honors',min:0,max:20,get:sim=>shown(sim)?100*phatStats(sim).sd:null},
  {id:'formula',label:'Formula: √(p(1 − p)/n)',unit:'points',d:2,lvl:'ap',min:0,max:20,get:sim=>100*Math.sqrt(PN*(1-PN)/sim.p.n)}
 ],
 graphs:[{id:'curve',label:'Wrong calls vs. your slump line',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:0,xmax:75,ymin:0,ymax:50,xl:'Your slump line (% made or less)',yl:'Wrong calls per 100'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the wrong calls',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let c=0;c<=75;c++){const y=ax.Y(Math.min(50,rule(sim,c).wrong));c===0?ctx.moveTo(ax.X(c),y):ctx.lineTo(ax.X(c),y);}ctx.stroke();
  const dot=(c,col,lab,dy)=>{const v=Math.min(50,rule(sim,c).wrong);ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(c),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,ax.X(c),ax.Y(v)+dy,{s:12,w:700,c:col,a:'center'});};
  const G=GS(sim);if(G&&G.g&&G.g.n===sim.p.n)dot(G.g.cut,PAL['s4'],'Your gut',20);
  if(atLeast('honors')||(G&&G.m))dot(bestCut(sim),PAL['s3'],'Best',-12);
  dot(sim.p.cut,PAL['rj'],'You',-26);},
 draw(sim,ctx,vdt,k){const labs=[],lab=(t,x,y,o)=>labs.push([t,x,y,o]);const n=sim.p.n,cut=sim.p.cut,d=dat(sim),sh=shown(sim),kk=kmaxOf(n,cut),G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=44,R=752,X=v=>L+v/100*(R-L),T=118,TB=262,BB=300,BOT=432;
  /* the stretch you are asking about */
  if(n===10){txt(ctx,'Your last 10 free throws',24,30,{s:13*k,w:700});
   const x0=24,cs=Math.min(34,30*k*0.95);LAST.forEach((m,i)=>{const x=x0+12+i*cs,y=56;ctx.lineWidth=3;
    if(m){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(x,y,11,0,7);ctx.fill();}
    else{ctx.strokeStyle=PAL['cv-soft'];ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.stroke();ctx.beginPath();ctx.moveTo(x-5,y-5);ctx.lineTo(x+5,y+5);ctx.moveTo(x+5,y-5);ctx.lineTo(x-5,y+5);ctx.stroke();}});
   txt(ctx,'5 of 10 made: 50%',x0+12+10*cs,62,{s:13*k,w:700,c:PAL['cv-ink']});}
  else txt(ctx,`Each stretch: ${n} free throws in a row`,24,40,{s:13*k,w:700});
  /* the line and the called-a-slump zone */
  const lx=X((kk+0.5)/n*100);
  ctx.fillStyle=PAL['s1'];ctx.globalAlpha=0.07;ctx.fillRect(L,T-10,lx-L,BOT-T+10);ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,TB);ctx.lineTo(R,TB);ctx.moveTo(L,BB);ctx.lineTo(R,BB);ctx.stroke();
  for(let v=0;v<=100;v+=10)txt(ctx,v+'%',X(v),(TB+BB)/2,{s:12*k,c:PAL['cv-soft'],a:'center',b:'middle'});
  if(n===10&&!sh){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(X(50),TB-2);ctx.lineTo(X(50)-8,TB-16);ctx.lineTo(X(50)+8,TB-16);ctx.fill();txt(ctx,'Your 5 of 10',X(50),TB-22,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  if(sh){
   const g=n===400?4:1,nb=Math.floor(n/g)+1,cN=new Array(nb).fill(0),cS=new Array(nb).fill(0),lN=sim.st.nN===null?NN:sim.st.nN,lS=sim.st.nS===null?NSL:sim.st.nS;
   for(let i=0;i<lN;i++)cN[Math.ceil(d.N[i]/g)]++;for(let i=0;i<lS;i++)cS[Math.ceil(d.S[i]/g)]++;
   let mx=0;for(let m=0;m<=n;m++)mx=Math.max(mx,d.cN[m]);if(g>1){mx=0;const all=new Array(nb).fill(0);d.N.forEach(m=>all[Math.ceil(m/g)]++);mx=Math.max(...all);}
   const sc=(TB-T)/mx,wpx=(R-L)*(g/n)*(n===10?0.55:0.8);
   for(let b=0;b<nb;b++){const kTop=b*g,ctr=X((b*g-(b>0?(g-1)/2:0))/n*100),called=kTop<=kk;
    if(cN[b]){ctx.fillStyle=PAL[called?'s1':'s2'];ctx.globalAlpha=called?1:0.75;const h=cN[b]*sc;ctx.fillRect(ctr-wpx/2,TB-h,wpx,h);}
    if(cS[b]){ctx.fillStyle=PAL[called?'s5':'s4'];ctx.globalAlpha=called?0.75:1;const h=Math.min(BOT-BB,cS[b]*sc);ctx.fillRect(ctr-wpx/2,BB,wpx,h);}
    ctx.globalAlpha=1;}
   if(sim.p.curve&&atLeast('ap'))[[PN,NN,TB,-1],[PS,NSL,BB,1]].forEach(([p,cnt,base,dir])=>{const s=Math.sqrt(p*(1-p)/n);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();
    for(let v=0;v<=1.0001;v+=0.0025){const e=cnt*(g/n)*Math.exp(-0.5*((v-p)/s)**2)/(s*Math.sqrt(2*Math.PI)),y=base+dir*Math.min(dir<0?TB-T+8:BOT-BB,e*sc);v===0?ctx.moveTo(X(v*100),y):ctx.lineTo(X(v*100),y);}ctx.stroke();});
   const r=rule(sim,cut);
   lab(`Normal you (75%): ${sim.st.nN===null?NN:sim.st.nN} stretches`,L+4,T+2,{s:12*k,w:700,c:PAL['s2'],b:'top'});
   lab(`False alarms: ${r.fa} of ${lN}`,L+4,T+6+16*k,{s:12*k,w:700,c:PAL['s1'],b:'top'});
   if(lS>0){lab(`Real slump (60%): ${lS} stretches`,L,BOT+12,{s:12*k,w:700,c:PAL['s5'],b:'bottom'});
    lab(`Missed slumps: ${r.miss} of ${lS}`,R,BOT+12,{s:12*k,w:700,c:PAL['s4'],a:'right',b:'bottom'});}}
  /* the line itself */
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(lx,T-10);ctx.lineTo(lx,BOT);ctx.stroke();
  if(!sh){const m='Lock in your gut to see 1,000 simulated stretches.',my=(BB+BOT)/2+10;ctx.font=(13*k)+'px '+FONT;const mw=ctx.measureText(m).width+24;ctx.fillStyle=PAL['card'];rr(ctx,400-mw/2,my-14*k,mw,24*k,8);ctx.fill();txt(ctx,m,400,my,{s:13*k,c:PAL['cv-soft'],a:'center',b:'middle'});}
  labs.forEach(([t,x,y,o])=>{ctx.font='700 '+o.s+'px '+FONT;const w=ctx.measureText(t).width,x0=o.a==='right'?x-w:x,y0=o.b==='top'?y:o.b==='bottom'?y-o.s:y-o.s*0.8;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=0.8;ctx.fillRect(x0-3,y0-2,w+6,o.s*1.15+4);ctx.globalAlpha=1;txt(ctx,t,x,y,o);});
  pill(ctx,`Slump: ${cut}% or less`,clamp(lx,90,710),T-30-(n===10?0:0),PAL['rj'],'#fff',12*Math.min(k,1.4));
  if(G&&G.g&&G.g.n===n&&G.g.cut!==cut){const gx=X((kmaxOf(n,G.g.cut)+0.5)/n*100);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(gx,T-10);ctx.lineTo(gx,BOT);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Your gut',gx+(gx<lx?-6:6),BOT-8,{s:12*k,w:700,c:PAL['s4'],a:gx<lx?'right':'left'});}},
 narrate(sim){const n=sim.p.n,cut=sim.p.cut,k=kmaxOf(n,cut);
  if(!shown(sim))return n===10?`Your rule calls a slump at ${k} of 10 made or fewer, so <b>it ${k>=5?'calls':'does not call'} your 5 of 10 a slump</b>. A 75% shooter averages 7.5 of 10, but no one makes exactly that every time.`:`Your rule calls a slump at ${k} of ${n} made or fewer. <b>Longer stretches give luck less room</b>: how far from 75% does a normal stretch wander?`;
  const r=rule(sim,cut);
  return `Your line makes <b>${f1(r.wrong)} wrong calls per 100 stretches</b>: ${f1(100*r.fa/TOT)} false alarms (you were fine) and ${f1(100*r.miss/TOT)} missed slumps. ${n===10?'With only 10 shots, the two piles overlap so much that every line makes a lot of mistakes.':n>=100?'With this many shots, the two piles barely overlap.':'Longer stretches pull the two piles apart.'}`;},
 gut:{better:'lower',controls:['cut'],
  ask:{bio:'You made 5 of your last 10. Drag <b>Your slump line</b> here: if you make that percent or less in a stretch, you call it a slump. Lock it in when it feels right.',honors:'Set your slump line by feel, then lock it in before you look at the simulated stretches.'},
  lock(sim){return ans(sim,sim.p.cut);},
  solve(sim){const c=bestCut(sim);sim.p.cut=c;return ans(sim,c);},
  how:{bio:'The math shoots 1,000 pretend stretches: 800 as normal you (75%) and 200 in a real slump (60%). Then it slides the line to the spot that makes the fewest wrong calls, counting both false alarms and missed slumps.',
   honors:'The percent made, p̂, has a sampling distribution for normal you and another for a real slump. The best line sits where moving it either way would add more wrong calls than it removes.',
   ap:'p̂ is centered at p with SD √(p(1 − p)/n). The best line falls where 0.8 × (density of p̂ for normal you) = 0.2 × (density for a real slump). As n grows, both SDs shrink and the wrong calls fall toward 0.'},
  compare(sim,g,m){const d=g.v-m.v,n=sim.p.n,hook=n===10?` A normal 75% shooter makes 5 of 10 or fewer in ${f1(100*dat(sim).kN[5]/NN)}% of these stretches, so ${kmaxOf(10,m.cut)>=5?'the math calls your 5 of 10 a slump':'the math does not call your 5 of 10 a slump: it is about as likely to be bad luck as a real slump'}.`:'';
   if(d<0.05)return `Your gut was right on: your line makes ${f1(g.v)} wrong calls per 100 stretches, as few as any line can with ${n} shots.${hook}`;
   return `Your line makes <b>${f1(g.v)} wrong calls per 100 stretches</b> (${f1(100*g.fa/TOT)} false alarms, ${f1(100*g.miss/TOT)} missed slumps). The math’s line, ${lineWords(n,m.cut)}, makes ${f1(m.v)}: <b>${f1(d)} fewer wrong calls per 100</b>.${hook}`;},
  again(sim){sim.p.n=SIZES[Math.floor(Math.random()*4)];sim.p.cut=60;sim.p.show=false;sim.p.seed=1+Math.floor(Math.random()*99999);sim.st=SIM.init(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You truly make 75% of your free throws. In a stretch of 10, how many will you make?',choices:['Exactly 7 or 8 every time','Usually 6 to 9, and sometimes 5 or fewer, just from luck','Never fewer than 7'],correct:1,explain:'Luck spreads short stretches out. For a true 75% shooter, 6 to 9 makes covers about 87% of stretches of 10, and 5 or fewer happens about 8 times in 100 (exact binomial: 7.8%).'},
  {lvl:'bio',instant:true,q:'You judge yourself on 100 free throws instead of 10. What happens to the spread of your percent made?',choices:['It gets bigger','It gets smaller, so a bad stretch means more','It stays the same'],correct:1,explain:'Longer stretches average out luck. For a 75% shooter the typical swing is about 13.7 points over 10 shots but only 4.3 points over 100.'},
  {lvl:'honors',instant:true,q:'What is the center of the sampling distribution of p̂ for a true 75% shooter taking stretches of 40?',choices:['75%','Whatever you shot in your last stretch','50%'],correct:0,explain:'p̂ is an unbiased estimator: its sampling distribution is centered at the true rate p = 75%, whatever the stretch length.'},
  {lvl:'honors',instant:true,q:'To cut the spread of p̂ in half, how much longer must your stretches be?',choices:['Twice as long','Four times as long','Ten times as long'],correct:1,explain:'The SD is √(p(1 − p)/n). Multiplying n by 4 divides the SD by √4 = 2: 6.8 points at 40 shots, 3.4 at 160.'},
  {lvl:'ap',instant:true,q:'p = 0.75 and n = 10. Can you model the sampling distribution of p̂ as normal?',choices:['Yes: n(1 − p) is at least 10','No: n(1 − p) = 2.5 is less than 10, so the Large Counts condition fails','Yes: every sampling distribution is normal'],correct:1,explain:'Large Counts needs np ≥ 10 and n(1 − p) ≥ 10. Here np = 7.5 and n(1 − p) = 2.5, so the distribution is skewed left and lumpy. At n = 40, np = 30 and n(1 − p) = 10: just enough.'},
  {lvl:'ap',instant:true,q:'p = 0.75 and n = 100. About how unusual is p̂ = 0.60 for a shooter who is not in a slump?',choices:['About 1 SD below the mean: common','About 3.5 SDs below the mean: very unusual','Impossible to say'],correct:1,explain:'SD = √(0.75 × 0.25/100) ≈ 0.0433. z = (0.60 − 0.75)/0.0433 ≈ −3.46. A normal 75% shooter almost never shoots 60% over 100 shots, so that result is strong evidence of a real slump.'}
 ],
 tour:[
  {title:'Your last 10',text:'You make 75% of your free throws. Tonight you made 5 of your last 10. Something wrong, or bad luck? First you need to see what normal looks like.',pause:true,setup:sim=>{sim.p.seed=SEED;BioLab.setValues(sim,{n:10,cut:60,show:false});BioLab.reset(sim);}},
  {title:'What normal looks like',text:'The computer shoots 800 stretches of 10 as a true 75% shooter. Each bar stacks the stretches that made that many. Even with nothing wrong, results spread from 30% to 100%, and 5 of 10 or worse happened in 60 of 800 stretches (7.5%).',pause:true,setup:sim=>{BioLab.setValues(sim,{show:true,cut:0});sim.st.nS=0;},focus:[40,90,750,180]},
  {title:'Add real slumps',text:'Now 200 stretches from a real slump, when you are truly shooting 60% (a sore wrist, say), hang below the line. In this model, 1 stretch in 5 is a real slump. The two piles overlap a lot.',pause:true,setup:sim=>{BioLab.setValues(sim,{show:true,cut:0});sim.st.nS=null;}},
  {title:'Your slump line',text:'A slump line at 60% calls every stretch of 6 of 10 or fewer a slump. Red bars are false alarms: normal stretches you wrongly called. Orange bars below are missed slumps. Together: 23.3 wrong calls per 100 stretches.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,cut:60})},
  {title:'Longer stretches',text:'Look at stretches of 40 shots. Both piles get narrower, so they overlap less. The best line, at 60% or less (24 of 40), makes 9.9 wrong calls per 100.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,n:40,cut:60})},
  {title:'400 shots',text:'With 400 shots, the two piles hardly overlap. The best line, at 67%, makes 1 wrong call in these 1,000 stretches: 0.1 per 100. Long stretches tell you the truth; short ones mostly tell you about luck.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,n:400,cut:67})},
  {lvl:'honors',title:'The sampling distribution of p̂',text:'The percent made is a sample proportion, p̂. Its sampling distribution is centered at p = 75%. Its spread is √(p(1 − p)/n): 13.7 points at n = 10, 6.8 at 40, 4.3 at 100 and 2.2 at 400. Four times the shots, half the spread.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,n:100,cut:65})},
  {lvl:'ap',title:'Conditions',text:'Normal model: shots must be independent (no hot or cold hand), and Large Counts needs np ≥ 10 and n(1 − p) ≥ 10. At n = 10, n(1 − p) = 2.5: the curve fits badly. The 10% condition is for sampling without replacement from a population; each new shot is a fresh trial, so it does not apply here.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,n:10,cut:40,curve:true})}
 ],
 lab:{bio:'<p><b>Question:</b> How many shots do you need before a bad stretch means something?</p><ol><li>Turn on <b>Show the simulation</b>.</li><li>For stretches of 10, move your slump line until wrong calls are as low as you can get them. Record a trial.</li><li>Repeat for 40, 100 and 400.</li></ol><p>Write one sentence: how does the length of the stretch change how often you are fooled?</p>',
  honors:'<p><b>Question:</b> How does the spread of p̂ depend on n?</p><ol><li>For each stretch length, record the <b>Spread of p̂</b>.</li><li>Multiply each spread by √n. What do you notice?</li></ol><p>Explain why 4 times the shots gives half the spread.</p>',
  ap:'<p><b>Question:</b> When is the normal model for p̂ good enough?</p><ol><li>Turn on the normal model. For each n, compare the curve with the bars and check np ≥ 10 and n(1 − p) ≥ 10.</li><li>Compare the simulated chance of 50% or worse with the exact binomial chance.</li></ol><p><b>CER:</b> Claim when you can use the normal model, with evidence from the picture and reasoning from the conditions.</p>'},
 terms:[
  {t:'Sampling variability',d:'Different stretches (samples) give different results, even when nothing has changed.'},
  {t:'Simulation',d:'Using random numbers to imitate a chance process many times, to see what usually happens.'},
  {t:'Sample proportion (p̂)',d:'The share of successes in a sample: here, the percent made in one stretch.',lvl:'honors'},
  {t:'Sampling distribution',d:'The distribution of a statistic, such as p̂, over all possible samples of the same size.',lvl:'honors'},
  {t:'Standard deviation of p̂',d:'√(p(1 − p)/n): how far p̂ typically lands from p.',lvl:'honors'},
  {t:'Large Counts condition',d:'np ≥ 10 and n(1 − p) ≥ 10. Then the sampling distribution of p̂ is approximately normal.',lvl:'ap'},
  {t:'10% condition',d:'When sampling without replacement, keep n at most 10% of the population so the observations are nearly independent.',lvl:'ap'}
 ],
 about:'<p><b>The slump numbers are illustrative.</b> Normal you makes each free throw with probability 0.75. In this model, 1 stretch in 5 is a real slump, when the chance drops to 0.60. Real slumps are not this tidy, and nobody knows how often they really happen; the point is to see how stretch length changes what you can tell.</p><p>Each shot is independent: no hot or cold hand. The tool simulates 800 normal stretches and 200 slump stretches of each length from a fixed random seed, so the same picture comes back after Reset; <b>New simulated stretches</b> draws a fresh set. Wrong calls are counted on these 1,000 stretches: false alarms (a normal stretch at or below your line) plus missed slumps (a slump stretch above it). The math’s line is the one, from 0% to 75%, with the fewest wrong calls.</p><p>The sampling distribution of p̂ has mean p and standard deviation √(p(1 − p)/n). The exact chance of 50% or worse uses the binomial distribution.</p>'
};
BioLab.register(SIM);
})();
