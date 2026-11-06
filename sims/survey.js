(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,bars,legend,atLeast,rng,randn}=BioLab.h;
/* A made-up school of 1,600 (400 per grade). Each student belongs to one group, and the chance they want a later start
   depends on the group and the grade. Every survey method is run 100 times with seeded randomness. */
const NS=1600,REPS=100,FRIENDS=12,CIRCLE=40,SALT=2;
const GR=[{id:'ath',l:'Athletes',s:'Athletes',share:0.28,yes:0.30,col:'s4',why:'a later start pushes practices and games later'},
 {id:'bus',l:'Long commuters',s:'Commuters',share:0.25,yes:0.75,col:'s2',why:'they get up earliest'},
 {id:'job',l:'After-school jobs',s:'Jobs',share:0.12,yes:0.30,col:'s5',why:'a later start cuts into work shifts'},
 {id:'oth',l:'Everyone else',s:'Others',share:0.35,yes:0.58,col:'s6',why:''}];
const GSHIFT=[0.08,0.03,-0.03,-0.08];        /* grades 9 to 12: younger students lean more toward a later start */
const METH={friends:{l:'Friends at lunch',s:'Friends'},online:{l:'Online poll',s:'Online poll'},door:{l:'First at the door',s:'Door'},srs:{l:'Random from the roster',s:'Roster'}};
const ORDER=['friends','online','door','srs'];
const methods=()=>ORDER.filter(m=>atLeast(METH[m].lvl||'bio'));
const hash=(...a)=>a.reduce((h,x)=>Math.imul(h^(x|0),0x9E3779B1)+0x7F4A7C15|0,0x2545F491);
function makeSt(seed){const r=rng(hash(seed,11)),P=[];
 for(let g=0;g<4;g++)for(let i=0;i<400;i++){let u=r(),gi=0;
  const sh=GR.map(x=>x.share);if(g>=2){sh[2]+=0.06;sh[3]-=0.06;}else{sh[2]-=0.06;sh[3]+=0.06;}   /* more jobs among juniors and seniors */
  while(gi<3&&u>sh[gi]){u-=sh[gi];gi++;}
  const p=clamp(GR[gi].yes+GSHIFT[g],0.02,0.98);
  P.push({g,gi,yes:r()<p?1:0,follow:r()<0.55,main:!(g>=2&&r()<0.5),arr:[-12,15,10,8][gi]+randn(r)});}
 /* sort for the picture: by group, then grade */
 P.sort((a,b)=>a.gi-b.gi||a.g-b.g);
 const yes=P.reduce((s,p)=>s+p.yes,0),truth=yes/NS;
 /* your friend circle: athletes and a few others in grades 10 and 11, who mostly share your view against a later start */
 const pool=[];P.forEach((p,i)=>{if((p.g===1||p.g===2)&&(p.gi===0||p.gi===3))pool.push(i);});
 /* 40 friends: 28 athletes and 12 others; 10 of the 40 want a later start */
 const circle=[],sh=pickK(pool,pool.length,r),want={'0|1':7,'0|0':21,'3|1':3,'3|0':9};
 sh.forEach(i=>{const key=P[i].gi+'|'+P[i].yes;if(want[key]>0){want[key]--;circle.push(i);}});
 return {seed,P,truth,circle,cache:{},cur:0};}
function pickK(arr,k,r){const a=arr.slice(),n=Math.min(k,a.length);for(let i=0;i<n;i++){const j=i+Math.floor(r()*(a.length-i));const t=a[i];a[i]=a[j];a[j]=t;}return a.slice(0,n);}
const ALL=[...Array(NS).keys()];
/* one survey: which students answered, and the share who said yes */
function runOne(st,m,rep,n){const P=st.P,r=rng(hash(st.seed,ORDER.indexOf(m)+1,rep+1,n,SALT));let idx;
 if(m==='friends')idx=pickK(st.circle,FRIENDS,r);
 else if(m==='online'){idx=[];P.forEach((p,i)=>{if(p.follow&&r()<(p.yes?0.14:0.05))idx.push(i);});}
 else if(m==='door'){const a=[];P.forEach((p,i)=>{if(p.main)a.push([p.arr+6*randn(r),i]);});a.sort((x,y)=>x[0]-y[0]);idx=a.slice(0,n).map(x=>x[1]);}
 else idx=pickK(ALL,n,r);
 const share=idx.length?idx.reduce((t,i)=>t+P[i].yes,0)/idx.length:0.5;return {idx,share};}
const nOf=sim=>atLeast('honors')?sim.p.n:50;
function results(sim,m,nn){const st=sim.st,n=nn||nOf(sim),key=m+'|'+n;if(st.cache[key])return st.cache[key];
 const v=[];let size=0;for(let k=0;k<REPS;k++){const o=runOne(st,m,k,n);v.push(o.share);size+=o.idx.length;}
 const mean=v.reduce((a,b)=>a+b,0)/REPS,sd=Math.sqrt(v.reduce((a,b)=>a+(b-mean)**2,0)/(REPS-1)),miss=100*v.reduce((a,b)=>a+Math.abs(b-st.truth),0)/REPS;
 return (st.cache[key]={v,mean,sd,miss,size:size/REPS});}
const best=sim=>methods().reduce((b,m)=>results(sim,m).miss<results(sim,b).miss?m:b,'srs');
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||sim.st.peek||(GS(sim)&&GS(sim).g));
const f1=v=>v.toFixed(1),pc=v=>(100*v).toFixed(1)+'%';
function mLabel(sim,m){const n=nOf(sim);return m==='door'?`first ${n} at the main door`:m==='srs'?`a simple random sample of ${n}`:m==='strat'?`a random sample of ${n} stratified by grade`:m==='friends'?`${FRIENDS} friends at lunch`:'an online poll';}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const GX=22,GY=70,CELL=7;   /* roster grid: 40 × 40, one square per student */

const SIM={
 id:'survey',hash:'survey',apUnit:14,order:1,tab:'A fair survey',kind:'Simulation',
 card:'Pick how student council should ask 1,600 students about a later start time, then run each survey 100 times to see which one tells the truth.',
 title:'Which survey tells you what the whole school thinks?',
 lede:{bio:'A survey only works if the people you ask look like the whole school. Ask the wrong people and you get the wrong answer, no matter how many you ask.',
  honors:'A biased method misses in the same direction every time. Random sampling removes the bias; a bigger sample shrinks the variability. They are different problems with different fixes.',
  ap:'A simple random sample gives every set of n students the same chance. Its sample proportion p̂ centers on the true p with standard deviation about √(p(1 − p)/n). Stratifying, sampling within groups that differ, can shrink that spread further.'},
 scale:'A made-up school of 1,600 students, 400 per grade. Each square in the grid is one student.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your survey',
 controls:[
  {id:'method',label:'How you run the survey',type:'seg',def:'friends',onChange(sim){sim.st.cur=0;},options:ORDER.map(m=>({v:m,l:METH[m].l,lvl:METH[m].lvl})),help:'Friends: the 12 people at your lunch table. Online poll: posted on the council’s social account; anyone who sees it can vote. Door: the first students through the main entrance one morning. Roster: names drawn at random from the full student list.'},
  {id:'n',label:'Sample size for the door and roster methods',type:'range',min:20,max:200,step:10,def:50,unit:' students',lvl:'honors',noGut:true,onChange(sim){sim.st.cur=0;clearGut(sim);}},
  {id:'reveal',label:'Show 100 surveys of each kind now',type:'toggle',def:false,help:'Normally these appear once you lock in your pick.'}
 ],
 actions:[{id:'another',label:'Run another survey',run(sim){sim.st.cur=(sim.st.cur+1)%REPS;}},
  {id:'school',label:'New school year (new students)',run(sim){sim.st=makeSt((sim.st.seed||1)+1);sim.vis.t0=0;clearGut(sim);}}],
 init(){return makeSt(1);},step(){},
 metrics:[
  {id:'one',label:'This one survey says',unit:'% yes',d:0,min:0,max:100,get:sim=>100*runOne(sim.st,sim.p.method,sim.st.cur,nOf(sim)).share},
  {id:'asked',label:'Students who answered',unit:'',d:0,min:0,max:200,get:sim=>runOne(sim.st,sim.p.method,sim.st.cur,nOf(sim)).idx.length},
  {id:'truth',label:'True share of all 1,600',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*sim.st.truth:null},
  {id:'miss',label:'Your method: average miss over 100 surveys',unit:'points',d:1,min:0,max:40,get:sim=>shown(sim)?results(sim,sim.p.method).miss:null},
  {id:'bias',label:'Bias: average result minus the truth',unit:'points',d:1,lvl:'honors',min:-40,max:40,get:sim=>shown(sim)?100*(results(sim,sim.p.method).mean-sim.st.truth):null},
  {id:'spread',label:'Variability: standard deviation of results',unit:'points',d:1,lvl:'honors',min:0,max:20,get:sim=>shown(sim)?100*results(sim,sim.p.method).sd:null},
  {id:'strat',label:'Stratified samples: spread from the formula',text:true,lvl:'ap',get:sim=>{const n=nOf(sim),P=sim.st.P,sd=key=>{let v=0;const grp={};P.forEach(p=>{const g=grp[p[key]]||(grp[p[key]]={c:0,y:0});g.c++;g.y+=p.yes;});Object.values(grp).forEach(g=>{const w=g.c/NS,q=g.y/g.c;v+=w*q*(1-q);});return 100*Math.sqrt(v/n);},p=sim.st.truth;return `Same n = ${n}: simple random ${(100*Math.sqrt(p*(1-p)/n)).toFixed(2)} points; stratified by grade ${sd('g').toFixed(2)}; stratified by group ${sd('gi').toFixed(2)} (proportional allocation, no finite-population correction)`;}},
  {id:'sdform',label:'Random sample: spread from the formula',text:true,lvl:'ap',get:sim=>{const p=sim.st.truth,n=nOf(sim),s=Math.sqrt(p*(1-p)/n),f=Math.sqrt((NS-n)/(NS-1));return `√(p(1 − p)/n) = √(${p.toFixed(3)} × ${(1-p).toFixed(3)} / ${n}) = ${(100*s).toFixed(1)} points (${(100*s*f).toFixed(1)} after the finite-population correction for 1,600 students)`;}}
 ],
 graphs:[{id:'bymethod',label:'Average miss by method',custom:true},{id:'bysize',label:'Average miss vs. sample size',lvl:'honors',custom:true}],defaultGraph:'bymethod',
 plot(sim,ctx,box,id){const M=methods();
  if(id==='bysize'){const ns=[];for(let n=20;n<=200;n+=20)ns.push(n);const R=['door','srs'].map(m=>ns.map(n=>results(sim,m,n).miss));
   const top=Math.max(10,Math.ceil(Math.max(...R[0],...R[1])/5)*5),ax=axes(ctx,box,{xmin:20,xmax:200,ymin:0,ymax:top,xl:'Students asked',yl:'Average miss (points)'});
   [[R[0],PAL['s4']],[R[1],PAL['s3']]].forEach(([v,c])=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();v.forEach((y,i)=>{const x=ax.X(ns[i]),yy=ax.Y(y);i?ctx.lineTo(x,yy):ctx.moveTo(x,yy);});ctx.stroke();v.forEach((y,i)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(ax.X(ns[i]),ax.Y(y),4,0,7);ctx.fill();});});
   legend(ctx,box.L+10,box.T+8,[{label:'First at the door',color:PAL['s4']},{label:'Random from the roster',color:PAL['s3']}]);return;}
  if(!shown(sim)){axes(ctx,box,{xmin:0,xmax:M.length,ymin:0,ymax:30,xcats:M.map(m=>METH[m].s),yl:'Average miss (points)'});txt(ctx,'Lock in your pick to run 100 of each survey.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const v=M.map(m=>results(sim,m).miss),ax=axes(ctx,box,{xmin:0,xmax:M.length,ymin:0,ymax:Math.max(10,Math.ceil(Math.max(...v)/5)*5),xcats:M.map(m=>METH[m].s),yl:'Average miss (points)'});
  bars(ctx,ax,v,{colors:M.map(m=>m===sim.p.method?PAL['s4']:m===best(sim)?PAL['s3']:PAL['g-line']),d:1});},
 draw(sim,ctx,vdt,k){const st=sim.st,P=st.P,sh=shown(sim),G=GS(sim),kk=k,big=k>1.3,n=nOf(sim),M=methods();
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the roster */
  const one=runOne(st,sim.p.method,st.cur,n),inS=new Uint8Array(NS);one.idx.forEach(i=>inS[i]=1);
  txt(ctx,big?one.idx.length+' answered: '+Math.round(100*one.share)+'% yes':'All 1,600 students: '+one.idx.length+' answered this survey',GX,22*kk,{s:13*kk,w:700,c:PAL['cv-ink']});
  if(!big)txt(ctx,METH[sim.p.method].l+': '+Math.round(100*one.share)+'% say yes',GX,22*kk+17*kk,{s:12*kk,c:PAL['cv-soft']});
  for(let i=0;i<NS;i++){const x=GX+(i%40)*CELL,y=GY+Math.floor(i/40)*CELL;ctx.fillStyle=PAL[GR[P[i].gi].col];ctx.globalAlpha=inS[i]?1:0.28;ctx.fillRect(x,y,CELL-1,CELL-1);}
  ctx.globalAlpha=1;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.2;one.idx.forEach(i=>{ctx.strokeRect(GX+(i%40)*CELL-.5,GY+Math.floor(i/40)*CELL-.5,CELL,CELL);});
  /* key */
  const two=kk<=1.3,ky=GY+40*CELL+16*kk;GR.forEach((g,j)=>{const x=GX+(j%2)*165,y=ky+Math.floor(j/2)*(two?34:18)*kk;ctx.fillStyle=PAL[g.col];ctx.fillRect(x,y-10*kk,11*kk,11*kk);
   const fr=P.filter(p=>p.gi===j),sh2=Math.round(100*fr.length/NS);txt(ctx,big?g.s:g.l,x+16*kk,y,{s:12*kk,w:700,c:PAL['cv-ink']});
   if(two)txt(ctx,sh2+'% of school'+(sh?', '+Math.round(100*fr.reduce((s,p)=>s+p.yes,0)/fr.length)+'% yes':''),x+16*kk,y+14*kk,{s:12*kk,c:PAL['cv-soft']});});
  /* 100 surveys of each kind */
  const L=372,R=784,X=v=>L+v*(R-L);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L-12,0,800-L+12,450);
  if(!sh){txt(ctx,big?'Close to the truth?':'Is this one survey close to the truth?',(L+R)/2,180,{s:15*kk,w:700,c:PAL['cv-ink'],a:'center'});
   txt(ctx,big?'Lock in to run each':'Lock in your pick, and each method',(L+R)/2,180+24*kk,{s:13*kk,c:PAL['cv-soft'],a:'center'});txt(ctx,big?'method 100 times.':'runs 100 times on the same school.',(L+R)/2,180+42*kk,{s:13*kk,c:PAL['cv-soft'],a:'center'});return;}
  const now=performance.now();if(!sim.vis.t0)sim.vis.t0=now;const nShow=BioLab.h.RM?REPS:clamp(Math.floor((now-sim.vis.t0)/6),1,REPS);
  const top=40*kk,bot=404,rowH=(bot-top)/M.length;
  txt(ctx,big?'100 of each (% yes)':'100 surveys of each kind (% yes)',L,24*kk,{s:13*kk,w:700,c:PAL['cv-ink']});
  M.forEach((m,j)=>{const res=results(sim,m),y0=top+j*rowH,base=y0+rowH-6,hi=rowH-22*kk;
   const isG=G&&G.g&&G.g.m===m,isB=sh&&G&&G.m&&G.m.m===m;
   if(m===sim.p.method){ctx.fillStyle=PAL['card'];rr(ctx,L-8,y0+2,R-L+16,rowH-4,6);ctx.fill();}
   txt(ctx,(big?METH[m].s:METH[m].l)+(isG?(big?': gut':' (your gut)'):'')+(isB?(big?': math':' (the math)'):''),L,y0+14*kk,{s:12*kk,w:700,c:isG?PAL['s4']:isB?PAL['s3']:PAL['cv-ink']});
   txt(ctx,(big?'miss ':'average miss ')+f1(res.miss),R,y0+14*kk,{s:12*kk,c:PAL['cv-soft'],a:'right'});
   const bins={},bw=0.02;let mx=1;res.v.slice(0,nShow).forEach(v=>{const b=Math.round(v/bw);bins[b]=(bins[b]||0)+1;mx=Math.max(mx,bins[b]);});
   const d=Math.min(6,(R-L)*bw-1),step=Math.min(d+1,hi/mx);ctx.fillStyle=m==='srs'?PAL['s3']:PAL['s1'];
   Object.keys(bins).forEach(b=>{const x=X(b*bw);for(let c=0;c<bins[b];c++){ctx.beginPath();ctx.arc(x,base-d/2-c*step,d/2,0,7);ctx.fill();}});
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,base+1);ctx.lineTo(R,base+1);ctx.stroke();});
  const tx=X(st.truth);for(let v=0;v<=1.0001;v+=0.25)if(Math.abs(X(v)-tx)>(big?118:66))txt(ctx,Math.round(v*100)+'%',X(v),bot+16*kk,{s:12*kk,c:PAL['cv-soft'],a:v>0.99?'right':v<0.01?'left':'center'});
ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(tx,top);ctx.lineTo(tx,bot);ctx.stroke();ctx.setLineDash([]);
  pill(ctx,'Truth: '+pc(st.truth),clamp(tx,L+50,R-50),bot+14*kk,PAL['rj'],'#fff',12*kk);},
 narrate(sim){const st=sim.st,m=sim.p.method,one=runOne(st,m,st.cur,nOf(sim));
  if(!shown(sim))return `This survey asked ${mLabel(sim,m)} and got <b>${Math.round(100*one.share)}% yes</b>. Press <b>Run another survey</b> to see how much one survey bounces around. Does it bounce around the truth, or around something else?`;
  const r=results(sim,m),b=100*(r.mean-st.truth);
  if(m==='srs')return `Random sampling: the 100 results center on ${pc(r.mean)}, right next to the truth (${pc(st.truth)}). One survey still misses by ${f1(r.miss)} points on average, <b>but the misses are just chance, on both sides, and they shrink as you ask more students.</b>`;
  const why={friends:'your friends are mostly athletes like you, so they share your view',online:'people who care most choose to vote, and they mostly want the change',door:'early arrivals are mostly athletes, and drivers who use the side lot never get asked'}[m];
  return `${METH[m].l}: the 100 results center on ${pc(r.mean)}, not the true ${pc(st.truth)}. <b>That is bias:</b> ${why}. Asking more of the same people does not fix it.`;},
 gut:{better:'lower',controls:['method'],lockLabel:'Lock in my survey',
  ask:{bio:'Which way of asking would tell student council what all 1,600 students really think? Pick one of the methods here, then lock it in. No math yet: go with what seems fair.',
   honors:'Pick the method you trust most here, then lock it in. Think about bias and about how much one survey bounces around.'},
  lock(sim){const m=sim.p.method;return {v:results(sim,m).miss,m,label:`${METH[m].l} (${mLabel(sim,m)})`};},
  solve(sim){const m=best(sim);sim.p.method=m;sim.st.cur=0;return {v:results(sim,m).miss,m,label:`${METH[m].l} (${mLabel(sim,m)})`};},
  how:{bio:'Draw names at random from the full roster. Then every student has the same chance to be asked, so no group gets left out or overcounted. The tool ran each method 100 times on the same school and measured how far each result landed from the truth.',
   honors:'A simple random sample has no bias: its results center on the true proportion. Each method was run 100 times; the average miss combines bias (where the results center) and variability (how widely they spread).',
   ap:'p̂ from an SRS is unbiased for p with SD ≈ √(p(1 − p)/n). A stratified random sample, a random sample within each grade or group, removes the between-group part of that variation.'},
  compare(sim,g,m){const st=sim.st,tr=pc(st.truth),gs=Math.round(g.v/100*NS),ms=Math.round(m.v/100*NS);
   if(g.m===m.m||g.v-m.v<0.05)return `Your gut was right on: ${METH[g.m].l.toLowerCase()} missed the true ${tr} by only ${f1(g.v)} points on average over 100 surveys. Randomness, used on purpose, is what makes a survey fair.`;
   const rnd=g.m==='srs';
   return `Over 100 surveys, ${mLabel(sim,g.m)} missed the true share (${tr}) by <b>${f1(g.v)} percentage points</b> on average: in a school of 1,600, that is like misjudging about <b>${gs} students</b>. ${METH[m.m].l} missed by <b>${f1(m.v)} points</b>, about <b>${ms} students</b>.${rnd?'':' A random sample can still miss by chance, but its misses fall on both sides of the truth instead of all on one side.'}`;},
  again(sim){sim.st=makeSt(Math.floor(2+Math.random()*500));sim.vis.t0=0;sim.p.method='friends';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The council’s online poll gets about 80 votes, and about 74% say yes to a later start. Why can’t you trust that number for the whole school?',choices:['80 votes is too few','Students chose whether to vote, and students who want the change are more likely to bother','Online polls always lean toward no'],correct:1,explain:'That is voluntary response bias. The people who choose to answer care more, and here the ones who care most want the change. Even 800 votes the same way would still lean the same way.'},
  {lvl:'bio',instant:true,q:'You switch from asking 50 students at the main door to asking 200 at the main door. What happens?',choices:['The bias goes away because the sample is bigger','The results bounce around less, but they still miss in the same direction','Nothing changes at all'],correct:1,explain:'More students shrinks the chance part of the miss, not the bias. Early arrivals at the main door are still mostly athletes, and drivers who park by the side entrance still never get asked.'},
  {lvl:'bio',instant:true,q:'Which method gives every one of the 1,600 students the same chance to be asked?',choices:['Your friends at lunch','The first 50 through the main door','50 names drawn at random from the full roster'],correct:2,explain:'Only the roster draw does. Friends, early arrivals and voters each over-represent some groups and leave others out.'},
  {lvl:'honors',instant:true,q:'A method’s 100 results all land between 30% and 40%, but the truth is about 50%. How would you describe it?',choices:['Low bias, high variability','High bias, low variability','Low bias, low variability'],correct:1,explain:'Tightly bunched means low variability. Centered far from the truth means high bias. Precise but wrong, like a scale that always reads 5 pounds light.'},
  {lvl:'honors',instant:true,q:'The first 50 students through the main door miss drivers who use the side lot entrance. What kind of bias is that?',choices:['Undercoverage: some students have no chance to be in the sample','Voluntary response','Response bias from a leading question'],correct:0,explain:'Undercoverage happens when part of the population can never be picked. Here the side-lot drivers, mostly juniors and seniors, are left out every time.'},
  {lvl:'ap',instant:true,q:'For a simple random sample of 50 from a school where p = 0.50, about what is the standard deviation of p̂?',choices:['About 0.071 (7.1 points)','About 0.010','About 0.250'],correct:0,explain:'√(0.50 × 0.50 / 50) = √0.005 ≈ 0.0707. With 1,600 students, the finite-population correction trims it slightly, to about 0.070.'},
  {lvl:'ap',instant:true,q:'When does stratifying by grade help the most, compared with a simple random sample of the same size?',choices:['When the grades have very different opinions, and students within each grade are similar','When every grade has the same opinion','Never: a random sample is always best'],correct:0,explain:'Stratifying removes the variation between strata. If grades differ a lot, that is a big chunk of the variation. In this school the grades differ only a little, so stratifying by grade barely helps; stratifying by group would help more.'}
 ],
 tour:[
  {title:'The whole school',text:'Each square is one of 1,600 students, colored by group: athletes, long commuters, students with after-school jobs, and everyone else. Groups feel differently about a later start, so who you ask matters.',pause:true,setup:sim=>{BioLab.setValues(sim,{method:'friends',n:50,reveal:false});sim.st.cur=0;sim.st.peek=false;},focus:[GX-8,GY-8,40*CELL+16,40*CELL+70]},
  {title:'Friends at lunch',text:'Your lunch table: 12 friends, mostly athletes like you. The dark-outlined squares are the students who answered. A whole school, and you heard from one corner of it.',pause:true,setup:sim=>{BioLab.setValues(sim,{method:'friends'});sim.st.cur=0;}},
  {title:'The online poll',text:'Anyone who follows the council’s account can vote, and they decide for themselves whether to bother. Students who want the change vote more often. That is voluntary response.',pause:true,setup:sim=>{BioLab.setValues(sim,{method:'online'});sim.st.cur=0;}},
  {title:'First 50 at the main door',text:'Easy, but the earliest arrivals are mostly athletes coming from morning workouts, and drivers who park by the side entrance are never asked. That is a convenience sample with undercoverage.',pause:true,setup:sim=>{BioLab.setValues(sim,{method:'door'});sim.st.cur=0;}},
  {title:'Random from the roster',text:'Draw 50 names at random from the full list. Every student has the same chance, so the sample is scattered across every group in about the right amounts.',pause:true,setup:sim=>{BioLab.setValues(sim,{method:'srs'});sim.st.cur=0;}},
  {title:'Run each survey 100 times',text:'Each dot is one survey’s result. The dashed line is the truth: 49.5% of all 1,600 want a later start. Friends land around 25%, the online poll around 74%, the door around 33%. Only the random samples land around the truth.',pause:true,setup:sim=>{sim.st.peek=true;},focus:[360,0,440,450]},
  {lvl:'honors',title:'Bigger is not the same as better',text:'Now every door and roster sample asks 200 students. The random results bunch tighter around the truth (average miss 2.4 points), but the door results bunch tighter around the wrong answer, about 31% (average miss 18.5). Size fixes variability, not bias.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{n:200});}},
  {lvl:'ap',title:'Stratified sampling',text:'A stratified sample takes a random sample within each grade (or group). It removes the variation between grades. For n = 50 the formula spread is 7.07 points for a simple random sample, 6.99 stratified by grade (the grades differ only a little) and 6.64 stratified by group (the groups differ a lot). The tiles show these at Deep dive.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{n:50,method:'srs'});}}
 ],
 lab:{bio:'<p><b>Question:</b> Does one survey tell you whether a method is fair?</p><ol><li>Pick <b>Friends at lunch</b> and press <b>Run another survey</b> five times. Record each result.</li><li>Do the same for <b>Random from the roster</b>.</li><li>Then turn on <b>Show 100 surveys of each kind now</b>.</li></ol><p>Write one sentence: why can’t one survey tell you whether a method is biased?</p>',
  honors:'<p><b>Question:</b> What does sample size fix, and what does it not fix?</p><ol><li>Turn on the 100 surveys. For sample sizes 20, 50, 100 and 200, record the bias and variability for <b>First at the door</b> and <b>Random from the roster</b>.</li><li>Open the graph <b>Average miss vs. sample size</b>.</li></ol><p>Explain the difference between bias and variability using your table.</p>',
  ap:'<p><b>Question:</b> Does the formula √(p(1 − p)/n) predict the spread of a simple random sample?</p><ol><li>For n = 20, 50, 100 and 200, record the simulated standard deviation for the roster sample and the formula value.</li><li>Read the stratified spreads from the formula tile at each n.</li></ol><p><b>CER:</b> Explain when stratifying beats a simple random sample, and by how much in this school.</p>'},
 terms:[
  {t:'Population',d:'Everyone you want to know about. Here, all 1,600 students.'},
  {t:'Sample',d:'The students you actually ask.'},
  {t:'Bias',d:'A method that misses in the same direction over and over. A bigger sample does not fix it.'},
  {t:'Simple random sample',d:'A sample where every group of n students has the same chance of being chosen, like drawing names from the full roster.'},
  {t:'Voluntary response',d:'People choose whether to answer. Those with strong feelings answer more, so the results lean their way.',lvl:'honors'},
  {t:'Convenience sample',d:'Asking whoever is easy to reach, like your friends or the first students through the door.',lvl:'honors'},
  {t:'Undercoverage',d:'Part of the population has no chance to be in the sample.',lvl:'honors'},
  {t:'Variability',d:'How much results bounce around from sample to sample. A bigger random sample shrinks it.',lvl:'honors'},
  {t:'Stratified random sample',d:'Split the population into groups (strata), such as grades, and take a random sample from each.',lvl:'ap'},
  {t:'Sampling distribution',d:'The pattern of a statistic, such as p̂, over many samples. The dot plots here are simulated sampling distributions.',lvl:'ap'}
 ],
 about:'<p><b>The school is made up.</b> The 1,600 students, their groups and their opinions are generated by the tool. Each student lands in a group by chance, with assumed rates for illustration: athletes about 28% (30% of them want a later start), long commuters about 25% (75%), after-school jobs about 12% (30%, more common in grades 11 and 12) and everyone else about 35% (58%), with younger grades leaning more toward a later start. The key under the grid shows the actual counts for this school. Your friend circle is 40 students in grades 10 and 11: 28 athletes and 12 others, and only 10 of the 40 want a later start. 55% of students follow the council’s account; followers who want the change vote 14% of the time and the rest 5%. Half the juniors and seniors drive and use the side entrance; at the main door, athletes arrive first.</p><p>Each method runs 100 times on the same school, with fixed random seeds, so the results are repeatable. The <b>average miss</b> is the average distance, in percentage points, between each survey’s result and the true share.</p>'
};
BioLab.register(SIM);
})();
