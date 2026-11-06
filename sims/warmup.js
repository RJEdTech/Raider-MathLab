(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,bars,legend,atLeast,rng,randn}=BioLab.h;
/* A made-up team. Each player has a typical 40-yard dash time; on any test day, conditions (mostly wind) shift everyone's time,
   and each run adds a little noise. The new warm-up really saves TAU seconds. Every design is run 100 times with seeded randomness. */
const TAU=0.06,MU=5.40,SDP=0.25,SDDAY=0.18,SDRUN=0.08,TREND=0.03,REPS=100,ROSTER=40,NPERM=500,SALT=7;
const D={vol:{l:'Volunteers vs. the rest',s:'Volunteers'},week:{l:'This week vs. last week',s:'Week to week'},rand:{l:'Random half',s:'Random half'},pairs:{l:'Matched pairs',s:'Matched pairs',lvl:'ap'}};
const ORDER=['vol','week','rand','pairs'];
const designs=()=>ORDER.filter(m=>atLeast(D[m].lvl||'bio'));
const hash=(...a)=>a.reduce((h,x)=>Math.imul(h^(x|0),0x9E3779B1)+0x7F4A7C15|0,0x2545F491);
function makeSt(seed){const r=rng(hash(seed,23)),b=[];for(let i=0;i<ROSTER;i++)b.push(+(MU+SDP*randn(r)).toFixed(3));return {seed,b,cache:{},cur:0};}
function pickK(arr,k,r){const a=arr.slice();for(let i=0;i<k;i++){const j=i+Math.floor(r()*(a.length-i));const t=a[i];a[i]=a[j];a[j]=t;}return a.slice(0,k);}
const nOf=sim=>atLeast('honors')?sim.p.team:30;
const wind=c=>c>0.08?'headwind':c<-0.08?'tailwind':'calm';
/* one experiment: who got which warm-up, their times, and the estimated seconds saved (old − new) */
function runOne(st,m,rep,n){const r=rng(hash(st.seed,ORDER.indexOf(m)+1,rep+1,n,SALT)),b=st.b.slice(0,n),run=()=>SDRUN*randn(r);
 const day=SDDAY*randn(r),last=SDDAY*randn(r),P=[];
 if(m==='week'){b.forEach((x,i)=>{P.push({i,grp:'old',t:x+last+TREND+run()});P.push({i,grp:'new',t:x+day-TAU+run()});});}
 else if(m==='vol'){let vol;do{vol=b.map(x=>r()<0.05+0.9/(1+Math.exp((x-MU)/0.12)));}while(vol.filter(v=>v).length<3||vol.filter(v=>!v).length<3);
  b.forEach((x,i)=>P.push({i,grp:vol[i]?'new':'old',t:x+day-(vol[i]?TAU:0)+run()}));}
 else if(m==='rand'){const nw=new Set(pickK([...Array(n).keys()],n/2,r));b.forEach((x,i)=>P.push({i,grp:nw.has(i)?'new':'old',t:x+day-(nw.has(i)?TAU:0)+run()}));}
 else{/* pair players by last week's time, then flip a coin inside each pair */
  const lw=b.map((x,i)=>({i,t:x+run()})).sort((a,c)=>a.t-c.t),pairs=[];
  for(let k=0;k+1<lw.length;k+=2){const h=r()<0.5,a=lw[k].i,c=lw[k+1].i,nI=h?a:c,oI=h?c:a;pairs.push([nI,oI]);
   P.push({i:nI,grp:'new',t:b[nI]+day-TAU+run(),pair:k/2});P.push({i:oI,grp:'old',t:b[oI]+day+run(),pair:k/2});}}
 const N=P.filter(p=>p.grp==='new'),O=P.filter(p=>p.grp==='old'),mean=a=>a.reduce((s,p)=>s+p.t,0)/a.length;
 return {P,mN:mean(N),mO:mean(O),est:mean(O)-mean(N),day,last};}
function results(sim,m,nn){const st=sim.st,n=nn||nOf(sim),key=m+'|'+n;if(st.cache[key])return st.cache[key];
 const v=[];for(let k=0;k<REPS;k++)v.push(runOne(st,m,k,n).est);
 const miss=v.reduce((a,x)=>a+Math.abs(x-TAU),0)/REPS,far=v.filter(x=>Math.abs(x-TAU)>0.1).length,mean=v.reduce((a,x)=>a+x,0)/REPS;
 return (st.cache[key]={v,miss,far,mean});}
/* randomization test for one experiment: reshuffle who got the new warm-up (or flip inside pairs) and recompute the difference */
function permTest(sim){const st=sim.st,m=sim.p.design;if(m!=='rand'&&m!=='pairs')return null;const n=nOf(sim),key='perm|'+m+'|'+n+'|'+st.cur;if(st.cache[key])return st.cache[key];
 const E=runOne(st,m,st.cur,n),r=rng(hash(st.seed,99,st.cur,n)),out=[];
 if(m==='rand'){const t=E.P.map(p=>p.t),idx=[...Array(t.length).keys()];for(let k=0;k<NPERM;k++){const nw=new Set(pickK(idx,t.length/2,r));let a=0,c=0;t.forEach((x,i)=>{if(nw.has(i))a+=x;else c+=x;});out.push((c-a)/(t.length/2));}}
 else{const d=[];E.P.filter(p=>p.grp==='new').forEach(p=>{const o=E.P.find(q=>q.grp==='old'&&q.pair===p.pair);d.push(o.t-p.t);});for(let k=0;k<NPERM;k++){let s=0;d.forEach(x=>s+=r()<0.5?x:-x);out.push(s/d.length);}}
 const p=out.filter(x=>x>=E.est-1e-12).length/NPERM;return (st.cache[key]={out,obs:E.est,p});}
const best=sim=>designs().reduce((b,m)=>results(sim,m).miss<results(sim,b).miss?m:b,'rand');
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||sim.st.peek||(GS(sim)&&GS(sim).g));
const f2=v=>v.toFixed(2),f3=v=>v.toFixed(3);
const sv=v=>(v>=0?'saves ':'costs ')+f2(Math.abs(v))+' s';
const yards=s=>s*40/MU;   /* seconds to yards, at a typical 5.4 s pace over 40 yards */
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'warmup',hash:'warmup',apUnit:14,order:2,tab:'Does the warm-up help?',kind:'Simulation',
 card:'Pick how your team should test a new warm-up, then run each plan 100 times and see which one finds the real effect.',
 title:'Does the new warm-up really make you faster?',
 lede:{bio:'Your coach wants to know if a new 5-minute dynamic warm-up cuts sprint times. How you set up the test decides whether you learn the truth or fool yourselves.',
  honors:'Comparing volunteers or comparing two different weeks mixes the warm-up up with other differences: those are confounding variables. Random assignment to a treatment group and a control group spreads them out evenly.',
  ap:'In a randomized experiment, the difference in mean times estimates the treatment effect. A randomization distribution, built by reshuffling the groups, shows how big a difference chance alone tends to make. Matched pairs remove most player-to-player variation.'},
 scale:'A made-up team. Times are for the 40-yard dash, about 5.4 s for a typical player here. The new warm-up truly saves 0.06 s, about half a yard.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your test plan',
 controls:[
  {id:'design',label:'How you test the warm-up',type:'seg',def:'vol',onChange(sim){sim.st.cur=0;},options:ORDER.map(m=>({v:m,l:D[m].l,lvl:D[m].lvl})),help:'Volunteers: anyone who wants to try it does; compare them with everyone else on the same day. Week to week: everyone does the old warm-up this week and the new one next week. Random half: flip a coin for each player; the rest do the old warm-up (the control group). Matched pairs (Deep dive): pair players with similar times, then flip a coin inside each pair.'},
  {id:'team',label:'Players on the team',type:'range',min:20,max:40,step:2,def:30,unit:' players',lvl:'honors',noGut:true,onChange(sim){sim.st.cur=0;clearGut(sim);}},
  {id:'reveal',label:'Show 100 runs of each plan now',type:'toggle',def:false,help:'Normally these appear once you lock in your plan.'}
 ],
 actions:[{id:'another',label:'Run the experiment again',run(sim){sim.st.cur=(sim.st.cur+1)%REPS;}},
  {id:'newteam',label:'New team',run(sim){sim.st=makeSt((sim.st.seed||1)+1);sim.vis.t0=0;clearGut(sim);}}],
 init(){return makeSt(1);},step(){},
 metrics:[
  {id:'est',label:'This experiment says the warm-up saves',unit:'s',d:2,min:-0.3,max:0.6,get:sim=>runOne(sim.st,sim.p.design,sim.st.cur,nOf(sim)).est},
  {id:'truth',label:'What it really saves',unit:'s',d:2,min:0,max:0.6,get:sim=>shown(sim)?TAU:null},
  {id:'miss',label:'Your plan: average error over 100 runs',unit:'s',d:3,min:0,max:0.4,get:sim=>shown(sim)?results(sim,sim.p.design).miss:null},
  {id:'far',label:'Runs off by more than 0.1 s (out of 100)',unit:'',d:0,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?results(sim,sim.p.design).far:null},
  {id:'avg',label:'Your plan: average estimate over 100 runs',unit:'s',d:3,lvl:'honors',min:-0.3,max:0.6,get:sim=>shown(sim)?results(sim,sim.p.design).mean:null},
  {id:'pval',label:'Randomization test P-value, this run',unit:'',d:3,lvl:'ap',min:0,max:1,get:sim=>{const t=permTest(sim);return t?t.p:null;}}
 ],
 graphs:[{id:'bydesign',label:'Average error by plan',custom:true},{id:'perm',label:'Randomization distribution (this run)',lvl:'ap',custom:true}],defaultGraph:'bydesign',
 plot(sim,ctx,box,id){const M=designs();
  if(id==='perm'){const t=permTest(sim);const ax=axes(ctx,box,{xmin:-0.3,xmax:0.3,ymin:0,ymax:Math.max(10,t?Math.ceil(Math.max(...(()=>{const h={};t.out.forEach(x=>{const k=Math.round(x/0.02);h[k]=(h[k]||0)+1;});return Object.values(h);})())/10)*10:10),xl:'Difference in mean times, old − new (s), if the warm-up did nothing',yl:'Reshuffles',xd:1});
   if(!t){txt(ctx,'Pick Random half or Matched pairs: a randomization test only makes sense when chance made the groups.',box.L+box.W/2,box.T+box.H/2,{s:13,c:PAL['muted'],a:'center',b:'middle'});return;}
   const h={};t.out.forEach(x=>{const k=Math.round(x/0.02);h[k]=(h[k]||0)+1;});Object.keys(h).forEach(k=>{const x=k*0.02;ctx.fillStyle=x>=t.obs-0.01?PAL['s1']:PAL['g-line'];ctx.globalAlpha=.8;ctx.fillRect(ax.X(x-0.009),ax.Y(h[k]),ax.X(0.018)-ax.X(0),ax.Y(0)-ax.Y(h[k]));ctx.globalAlpha=1;});
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ax.X(t.obs),box.T);ctx.lineTo(ax.X(t.obs),box.T+box.H);ctx.stroke();
   txt(ctx,'This run: '+f3(t.obs)+' s, P ≈ '+t.p.toFixed(3),ax.X(t.obs)+(t.obs>0.1?-6:6),box.T+14,{s:12,w:700,c:PAL['s4'],a:t.obs>0.1?'right':'left'});return;}
  if(!shown(sim)){axes(ctx,box,{xmin:0,xmax:M.length,ymin:0,ymax:0.3,xcats:M.map(m=>D[m].s),yl:'Average error (s)',yd:2});txt(ctx,'Lock in your plan to run each one 100 times.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const v=M.map(m=>results(sim,m).miss),ax=axes(ctx,box,{xmin:0,xmax:M.length,ymin:0,ymax:Math.max(0.1,Math.ceil(Math.max(...v)*20)/20),xcats:M.map(m=>D[m].s),yl:'Average error (s)',yd:2});
  bars(ctx,ax,v,{colors:M.map(m=>m===sim.p.design?PAL['s4']:m===best(sim)?PAL['s3']:PAL['g-line']),d:3});},
 draw(sim,ctx,vdt,k){const st=sim.st,sh=shown(sim),G=GS(sim),kk=k,big=k>1.3,n=nOf(sim),M=designs(),m=sim.p.design;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* one experiment */
  const E=runOne(st,m,st.cur,n),L0=40,R0=356,T0=4.8,T1=6.2,X=t=>L0+(clamp(t,T0,T1)-T0)/(T1-T0)*(R0-L0);
  txt(ctx,big?'One run: 40-yard times':'One run of your plan: 40-yard times',20,26*kk,{s:13*kk,w:700,c:PAL['cv-ink']});
  const rows=[{g:'new',y:150,l:m==='week'?'This week: new warm-up':'New warm-up'},{g:'old',y:290,l:m==='week'?'Last week: old warm-up':(m==='vol'?'Everyone else: old warm-up':'Control: old warm-up')}];
  if(m==='vol')rows[0].l='Volunteers: new warm-up';
  rows.forEach(rw=>{const pts=E.P.filter(p=>p.grp===rw.g),mean=rw.g==='new'?E.mN:E.mO,col=rw.g==='new'?PAL['s3']:PAL['s2'];
   const wd=m==='week'?wind(rw.g==='new'?E.day:E.last):'';
   if(big)txt(ctx,(m==='week'?(rw.g==='new'?'This week, ':'Last week, ')+wd:(rw.g==='new'?'New warm-up':'Old warm-up'))+': '+f2(mean)+' s',20,rw.y-70,{s:12*kk,w:700,c:col});
   else{txt(ctx,rw.l,20,rw.y-70,{s:12*kk,w:700,c:col});if(m==='week')txt(ctx,'Wind: '+wd,R0,rw.y-70,{s:12*kk,c:PAL['cv-soft'],a:'right'});}
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L0,rw.y);ctx.lineTo(R0,rw.y);ctx.stroke();
   const bins={};pts.forEach(p=>{const b=Math.round((p.t-T0)/0.03);const c=bins[b]=(bins[b]||0)+1;
    /* color each player by how fast they usually are: darker = faster */
    const fast=clamp((MU+0.4-st.b[p.i])/0.8,0,1);ctx.fillStyle=col;ctx.globalAlpha=0.35+0.65*fast;ctx.beginPath();ctx.arc(X(T0+b*0.03),rw.y-6-(c-1)*9,4.5,0,7);ctx.fill();ctx.globalAlpha=1;});
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(mean),rw.y+4);ctx.lineTo(X(mean),rw.y+18);ctx.stroke();
   if(!big)txt(ctx,'average '+f2(mean)+' s',X(mean),rw.y+34*kk,{s:12*kk,w:700,c:PAL['cv-ink'],a:'center'});});
  for(let t=5.0;t<=6.01;t+=0.5)txt(ctx,t.toFixed(1)+' s',X(t),352+8*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  txt(ctx,big?'Darker = usually faster':'Darker dots: players who are usually faster',20,380+8*kk,{s:12*kk,c:PAL['cv-soft']});
  pill(ctx,(big?'This run: ':'This run: the warm-up ')+sv(E.est),190,426,PAL['rj'],'#fff',13*Math.min(kk,1.4));
  /* 100 runs of each plan */
  const L=392,R=784,lo=-0.6,hi=0.8,XX=v=>L+(clamp(v,lo,hi)-lo)/(hi-lo)*(R-L);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L-12,0,800-L+12,450);
  if(!sh){txt(ctx,big?'Did it find the truth?':'Did this run find the truth?',(L+R)/2,180,{s:15*kk,w:700,c:PAL['cv-ink'],a:'center'});
   txt(ctx,big?'Lock in to run each':'Lock in your plan, and each plan',(L+R)/2,180+24*kk,{s:13*kk,c:PAL['cv-soft'],a:'center'});txt(ctx,big?'plan 100 times.':'runs 100 times on the same team.',(L+R)/2,180+42*kk,{s:13*kk,c:PAL['cv-soft'],a:'center'});return;}
  const now=performance.now();if(!sim.vis.t0)sim.vis.t0=now;const nShow=BioLab.h.RM?REPS:clamp(Math.floor((now-sim.vis.t0)/6),1,REPS);
  const top=40*kk,bot=404,rowH=(bot-top)/M.length;
  txt(ctx,big?'100 runs: seconds saved':'100 runs of each plan: seconds saved',L,24*kk,{s:13*kk,w:700,c:PAL['cv-ink']});
  M.forEach((d,j)=>{const res=results(sim,d),y0=top+j*rowH,base=y0+rowH-6,hh=rowH-22*kk,isG=G&&G.g&&G.g.d===d,isB=G&&G.m&&G.m.d===d;
   if(d===m){ctx.fillStyle=PAL['card'];rr(ctx,L-8,y0+2,R-L+16,rowH-4,6);ctx.fill();}
   txt(ctx,D[d].s+(isG?(big?': gut':' (your gut)'):'')+(isB?(big?': math':' (the math)'):''),L,y0+14*kk,{s:12*kk,w:700,c:isG?PAL['s4']:isB?PAL['s3']:PAL['cv-ink']});
   txt(ctx,(big?'':'avg error ')+f3(res.miss)+' s',R,y0+14*kk,{s:12*kk,c:PAL['cv-soft'],a:'right'});
   const bins={},bw=0.02;let mx=1;res.v.slice(0,nShow).forEach(v=>{const b=Math.round(clamp(v,lo,hi)/bw);bins[b]=(bins[b]||0)+1;mx=Math.max(mx,bins[b]);});
   const dd=Math.min(6,(R-L)*bw/(hi-lo)-1),step=Math.min(dd+1,hh/mx);ctx.fillStyle=d==='rand'||d==='pairs'?PAL['s3']:PAL['s1'];
   Object.keys(bins).forEach(b=>{const x=XX(b*bw);for(let c=0;c<bins[b];c++){ctx.beginPath();ctx.arc(x,base-dd/2-c*step,dd/2,0,7);ctx.fill();}});
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,base+1);ctx.lineTo(R,base+1);ctx.stroke();});
  const tx=XX(TAU);for(let v=-0.4;v<=0.61;v+=0.2)if(Math.abs(XX(v)-tx)>(big?118:92))txt(ctx,(Math.abs(v)<1e-9?'0':v.toFixed(1))+' s',XX(v),bot+16*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx,top);ctx.lineTo(tx,bot);ctx.stroke();ctx.setLineDash([]);
  pill(ctx,big?'Truth: 0.06 s':'Truth: saves 0.06 s',tx,bot+14*kk,PAL['rj'],'#fff',12*kk);},
 narrate(sim){const st=sim.st,m=sim.p.design,E=runOne(st,m,st.cur,nOf(sim));
  if(!shown(sim))return `This run says the new warm-up ${sv(E.est)}. Press <b>Run the experiment again</b> to see how much the answer changes. Is it bouncing around the truth, or around something else?`;
  const r=results(sim,m);
  if(m==='vol')return `Volunteers average ${f2(r.mean)} s saved, but the truth is 0.06 s. <b>The players who volunteer are mostly the fast ones</b>, so the comparison credits the warm-up for speed they already had. That is confounding.`;
  if(m==='week')return `Week to week, the runs scatter from ${f2(Math.min(...r.v))} to ${f2(Math.max(...r.v))} s. <b>Wind and turf change from one week to the next, and players get fitter</b>, so the weeks differ in more than the warm-up.`;
  if(m==='pairs')return `Matched pairs average ${f3(r.mean)} s with an average error of only ${f3(r.miss)} s. <b>Each pair has two players of about the same speed</b>, so the comparison is almost all warm-up.`;
  return `Random halves average ${f3(r.mean)} s saved, right around the true 0.06 s. <b>Chance spread fast and slow players across both groups</b>, and both ran in the same wind, so the only planned difference is the warm-up.`;},
 gut:{better:'lower',controls:['design'],lockLabel:'Lock in my plan',
  ask:{bio:'How should your team test the new warm-up? Pick one of the plans here, then lock it in. Go with the plan that seems fairest.',
   honors:'Pick the design you trust here, then lock it in. Think about what else, besides the warm-up, could differ between the groups.'},
  lock(sim){const d=sim.p.design;return {v:results(sim,d).miss,d,avg:results(sim,d).mean,label:D[d].l};},
  solve(sim){const d=best(sim);sim.p.design=d;sim.st.cur=0;return {v:results(sim,d).miss,d,avg:results(sim,d).mean,label:D[d].l};},
  how:{bio:'Flip a coin for each player: heads does the new warm-up, tails does the old one. Everyone runs the same day. Chance gives each group about the same mix of fast and slow players, so the difference in times comes from the warm-up.',
   honors:'Random assignment makes the treatment and control groups alike in every way on average, including ways you never measured. A control group running the same day removes the wind and the week. The tool ran each design 100 times and measured how far each estimate landed from the true 0.06 s.',
   ap:'With random assignment, the difference in means is an unbiased estimate of the effect. Matched pairs (pair by last week’s time, then randomize inside each pair) remove most player-to-player variation, so the estimate varies even less.'},
  compare(sim,g,m){const gy=yards(g.v),my=yards(m.v);
   if(g.d===m.d||g.v-m.v<0.0005)return `Your gut was right on: ${D[g.d].l.toLowerCase()} missed the true 0.06 s by only ${f3(g.v)} s on average. Random assignment is what lets you trust the comparison.`;
   const why=g.d==='vol'?' The volunteers were faster to begin with.':g.d==='week'?' The weeks differed in wind and fitness, not just the warm-up.':'';
   return `Your plan missed the real effect (0.06 s) by <b>${f3(g.v)} s</b> on average over 100 runs, about <b>${gy.toFixed(1)} yards</b> in a 40-yard dash.${g.d==='vol'?` On average it said the warm-up saves ${f2(g.avg)} s, about ${(g.avg/TAU).toFixed(1)} times the truth.`:''} ${D[m.d].l} missed by <b>${f3(m.v)} s</b>, about ${my.toFixed(1)} yards.${why} Your coach could change the whole team’s routine on that answer.`;},
  again(sim){sim.st=makeSt(Math.floor(2+Math.random()*500));sim.vis.t0=0;sim.p.design='vol';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The players who volunteered for the new warm-up ran 0.3 s faster than everyone else. Why can’t the coach credit the warm-up for all of that?',choices:['0.3 s is too small to matter','The volunteers were mostly faster players to begin with','The warm-up only works on volunteers'],correct:1,explain:'The groups differed before anyone warmed up. Faster, more eager players are more likely to volunteer, so their speed gets mixed up with the warm-up. That is confounding.'},
  {lvl:'bio',instant:true,q:'Last week (old warm-up) the team averaged 5.45 s. This week (new warm-up) it averaged 5.25 s. What else could explain the 0.2 s?',choices:['Nothing: everything else was the same','A tailwind this week, a headwind last week, or players getting fitter over a week','The stopwatch adds 0.2 s every week'],correct:1,explain:'The two weeks differ in wind, turf, temperature and fitness, not only the warm-up. A control group running on the same day removes all of those at once.'},
  {lvl:'bio',instant:true,q:'In the random-half plan, what does the control group do?',choices:['Nothing: they skip the test','The old warm-up, on the same day, so there is something fair to compare with','The new warm-up twice'],correct:1,explain:'The control group gets the usual treatment under the same conditions. Without it, you cannot tell the warm-up’s effect from everything else that day.'},
  {lvl:'honors',instant:true,q:'Is “compare this week’s times with last week’s” an experiment or an observational study, and what is its weakness?',choices:['An experiment, with no weakness','An experiment, but without a control group running at the same time, so the week is confounded with the warm-up','An observational study, because nobody imposed a treatment'],correct:1,explain:'The coach does impose the treatment, so it is an experiment, but a poorly designed one: every player gets the new warm-up in a different week from the old one, so the week’s conditions are confounded with the warm-up.'},
  {lvl:'honors',instant:true,q:'Players know which warm-up they did. How could you still blind part of the experiment?',choices:['You cannot blind anything','Have a timer who does not know which warm-up each player did','Tell players the new warm-up is better'],correct:1,explain:'Players cannot be blinded here, but the person with the stopwatch can be. Then the timer’s expectations cannot nudge the times. Telling players the new warm-up is better would add a placebo-style effect, not remove one.'},
  {lvl:'ap',instant:true,q:'Why do matched pairs (pairing players by last week’s time, then flipping a coin inside each pair) give a more precise estimate than a random half?',choices:['They use more players','Each comparison is between two players of about the same speed, so player-to-player differences mostly cancel','They remove the need for randomization'],correct:1,explain:'Matching removes most of the variation between players from each comparison. Randomizing inside each pair still protects against bias.'},
  {lvl:'ap',instant:true,q:'A randomization test reshuffles the 30 players into two groups 500 times. 120 of the 500 reshuffled differences are as large as the observed 0.06 s. What should you conclude?',choices:['P ≈ 0.24: one run of this size is not convincing evidence the warm-up helps','P ≈ 0.24: the warm-up does not help','P ≈ 0.76: strong evidence it helps'],correct:0,explain:'P = 120/500 = 0.24. Chance alone often makes a difference this big, so this one experiment is not convincing evidence. That is not proof of no effect: a small real effect needs a bigger or more precise design, like matched pairs.'}
 ],
 tour:[
  {title:'One run of a test',text:'Each dot is one player’s 40-yard time. Darker dots are players who are usually faster. The top row did the new warm-up; the bottom row did the old one. The black tick under each row is that group’s average.',pause:true,setup:sim=>{BioLab.setValues(sim,{design:'vol',team:30,reveal:false});sim.st.cur=0;sim.st.peek=false;},focus:[0,0,384,450]},
  {title:'Volunteers vs. the rest',text:'Here the volunteers did the new warm-up. Look at the colors: the volunteers are mostly the darker, faster players. Their lower average is partly speed they already had.',pause:true,setup:sim=>{BioLab.setValues(sim,{design:'vol'});sim.st.cur=0;}},
  {title:'This week vs. last week',text:'Here everyone did the old warm-up last week and the new one this week. Same players, but a different day: the wind, the turf and a week of training all changed too.',pause:true,setup:sim=>{BioLab.setValues(sim,{design:'week'});sim.st.cur=0;}},
  {title:'A random half, with a control group',text:'Here a coin flip picked who did the new warm-up, and the rest did the old one as a control group, on the same day. Fast and slow players land in both groups.',pause:true,setup:sim=>{BioLab.setValues(sim,{design:'rand'});sim.st.cur=0;}},
  {title:'Run each plan 100 times',text:'Each dot on the right is one run’s answer. The dashed line is the truth: 0.06 s. Volunteers land around 0.36 s, six times the truth, run after run. Week to week bounces all over. Random halves center on the truth.',pause:true,setup:sim=>{sim.st.peek=true;},focus:[380,0,420,450]},
  {lvl:'honors',title:'Random still varies',text:'A random half is fair, not perfect: with 30 players, single runs still miss by about 0.08 s on average. A bigger team narrows the spread; nothing but random assignment fixes the volunteers’ bias.',pause:true,setup:sim=>{sim.st.peek=true;}},
  {lvl:'ap',title:'Matched pairs',text:'Pair players by last week’s time, then flip a coin inside each pair. Each comparison is between two players of about the same speed, so the average error drops to about 0.04 s.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{design:'pairs'});sim.st.cur=0;}}
 ],
 lab:{bio:'<p><b>Question:</b> Can one run of a test tell you whether the plan is fair?</p><ol><li>Pick <b>Volunteers vs. the rest</b>. Press <b>Run the experiment again</b> five times and record what each run says.</li><li>Do the same for <b>Random half</b>.</li><li>Turn on <b>Show 100 runs of each plan now</b>.</li></ol><p>Write one sentence: which plan’s answers bounce around the truth, and which bounce around something else?</p>',
  honors:'<p><b>Question:</b> How does team size change each plan’s error?</p><ol><li>Show the 100 runs. For 16, 24, 32 and 40 players, record each plan’s average error.</li></ol><p>Explain why more players helps the random half but barely helps the volunteers plan.</p>',
  ap:'<p><b>Question:</b> How often does one random-half experiment give convincing evidence that the warm-up helps?</p><ol><li>Pick <b>Random half</b> and open the graph <b>Randomization distribution</b>.</li><li>Press <b>Run the experiment again</b> 20 times, recording the P-value each time.</li><li>Repeat with <b>Matched pairs</b>.</li></ol><p><b>CER:</b> Compare how often each design gets P &lt; 0.05, and explain why.</p>'},
 terms:[
  {t:'Experiment',d:'A study where you impose a treatment, such as a warm-up, and measure the response.'},
  {t:'Control group',d:'The group that gets the usual treatment (the old warm-up) under the same conditions, so you have a fair comparison.'},
  {t:'Random assignment',d:'Using chance, like a coin flip, to decide who gets which treatment.'},
  {t:'Confounding',d:'When something else that differs between the groups (being faster already, the week’s wind) is mixed up with the treatment.'},
  {t:'Observational study',d:'Watching and measuring without imposing a treatment. It can show a link but not prove cause.',lvl:'honors'},
  {t:'Blinding',d:'Keeping people from knowing who got which treatment. Here the players can’t be blinded, but the timer can.',lvl:'honors'},
  {t:'Placebo',d:'A fake treatment that looks real. Not possible for a warm-up, which is why a control group doing the old warm-up is used instead.',lvl:'honors'},
  {t:'Matched pairs',d:'Pair similar subjects, then randomly assign one in each pair to each treatment.',lvl:'ap'},
  {t:'Blocking',d:'Splitting subjects into groups that are alike (such as by speed or position), then randomizing within each group.',lvl:'ap'},
  {t:'Randomization distribution',d:'The differences you get by reshuffling the group labels many times. It shows how big a difference chance alone makes.',lvl:'ap'}
 ],
 about:'<p><b>The team is made up.</b> Each player’s typical 40-yard time is drawn from a normal distribution with mean 5.40 s and SD 0.25 s. On a test day, conditions shift everyone by a normal amount with SD 0.18 s (called wind here), and each run adds noise with SD 0.08 s. Over a week, players get 0.03 s faster from training. The new warm-up truly saves <b>0.06 s</b>. These are assumptions for illustration, not results from a real study.</p><p>Volunteering: faster players are more likely to volunteer (from about 5% for the slowest to about 95% for the fastest). Matched pairs sort players by last week’s time and pair neighbors. Each design runs 100 times with fixed random seeds, and the <b>average error</b> is the average distance between each run’s estimate and 0.06 s. The randomization test reshuffles one run 500 times. Seconds convert to yards at a 5.4 s pace (40 ÷ 5.4 ≈ 7.4 yards per second).</p>'
};
BioLab.register(SIM);
})();
