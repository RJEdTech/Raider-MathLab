(function(){
'use strict';
const {clamp,txt,pill,rr,rng,binom,PAL,FONT,axes,legend,atLeast,serColor}=BioLab.h;
/* Every area has the same true behavior each week: 20 minor offenses and 3 serious ones.
   Serious incidents get reported and recorded no matter who is patrolling.
   A minor offense is written up only if a patrol sees it: chance 0.8 × (the area's share of patrols).
   Week 1 splits patrols evenly. After that, each area's share is proportional to (write-ups counted so far)^g,
   with an optional share r spread evenly no matter what. g = 1 proportional, 2 hot spot, 3 strong hot spot. */
const MINOR=20,SER=3,DET=0.8,WEEKS=20;
const PLACE={school:{H:2,area:'Hallway',areas:'hallways',unit:'monitor shifts',per:20,who:'monitors',wr:'write-ups',seed:34},
 city:{H:3,area:'Neighborhood',areas:'neighborhoods',unit:'patrol shifts',per:30,who:'patrol officers',wr:'recorded incidents',seed:18}};
const L3=['A','B','C'];
const G={prop:1,hot:2,strong:3};
const PL=sim=>PLACE[sim.p.place]||PLACE.school;
const gam=sim=>atLeast('honors')?G[sim.p.rule]:2;
const rho=sim=>atLeast('honors')?sim.p.rand/100:0;
const RC={};
function run(sim){const P=PL(sim),H=P.H,g=gam(sim),rr_=rho(sim),cnt=sim.p.count,key=[sim.p.place,cnt,g,rr_,sim.p.seed].join('|');if(RC[key])return RC[key];
 const r=rng((+sim.p.seed)*104729+7),share=[],minor=[],cum=[],tot=[];let C=Array(H).fill(0),T=Array(H).fill(0),s=Array(H).fill(1/H);
 for(let t=0;t<WEEKS;t++){share.push(s.slice());const m=s.map(si=>binom(MINOR,DET*si,r));minor.push(m);
  m.forEach((x,i)=>{T[i]+=x+SER;C[i]+=(cnt==='all'?x:0)+SER;});tot.push(T.slice());cum.push(C.slice());
  const w=C.map(c=>Math.pow(c,g)),sw=w.reduce((a,b)=>a+b);s=w.map(x=>rr_/H+(1-rr_)*x/sw);}
 return RC[key]={share,minor,tot,H};}
const wk=sim=>clamp(Math.round(sim.p.week),1,WEEKS)-1;
const shareAt=(sim,i,w)=>run(sim).share[w===undefined?wk(sim):w][i];
const ans=sim=>Math.round(100*shareAt(sim,0,WEEKS-1));
const totAt=(sim,i,w)=>{const R=run(sim);return i<R.H?R.tot[w===undefined?wk(sim):w][i]:null;};
const gain=sim=>{const H=PL(sim).H;return sim.p.count==='all'?gam(sim)*(1-rho(sim))*MINOR*DET/(MINOR*DET+SER*H):0;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(GS(sim)&&GS(sim).g);
const pc=v=>Math.round(100*v)+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* whole-number split of n units by shares (largest remainder) */
function units(sh,n){const f=sh.map(s=>Math.floor(s*n));let left=n-f.reduce((a,b)=>a+b,0);sh.map((s,i)=>[s*n-f[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){f[i]++;left--;}});return f;}
const areaCol=i=>[PAL['s1'],PAL['s2'],PAL['s3']][i];
function person(ctx,x,y,c,sz){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y-sz*1.1,sz*0.55,0,7);ctx.fill();rr(ctx,x-sz*0.6,y-sz*0.45,sz*1.2,sz*1.25,sz*0.4);ctx.fill();}
function car(ctx,x,y,c,sz){ctx.fillStyle=c;rr(ctx,x-sz,y-sz*0.5,sz*2,sz,sz*0.3);ctx.fill();ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x-sz*0.45,y-sz*0.35,sz*0.9,sz*0.3);}

const SIM={
 id:'hotspot',hash:'hotspot',apUnit:19,order:6,tab:'Hot spot loop',kind:'Simulation',
 card:'Guess where the patrols end up when two hallways behave exactly alike, then watch the write-ups feed the schedule week by week.',
 title:'The hot spot loop',
 lede:{bio:'Send patrols where the write-ups are. It sounds fair. But a minor offense only gets written up if someone is there to see it, so more patrols find more, and more write-ups bring more patrols.',
  honors:'Each week’s schedule depends on the write-ups so far: a recursive sequence. With a proportional rule the split only drifts. With a hot-spot rule, whoever gets lucky early pulls away. Counting only incidents that get reported anyway breaks the loop.',
  ap:'Near an even split, each week multiplies a small lead by a loop gain L = g(1 − r) × 16 ÷ (16 + 3H). If L > 1 the even split is an unstable equilibrium; if L < 1 the data pull it back.'},
 scale:{bio:'Two hallways (or three city neighborhoods) with identical behavior: 20 minor and 3 serious offenses each, every week, for 20 weeks.',honors:'Identical true behavior in every area. Detection of a minor offense = 0.8 × that area’s share of patrols, an assumption for illustration.'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The patrol schedule',
 controls:[
  {id:'guess',label:'Your gut: A’s share of the patrols in week 20',type:'range',min:0,max:100,step:1,def:50,unit:'%'},
  {id:'place',label:'Where',type:'seg',def:'school',noGut:true,options:[{v:'school',l:'School: 2 hallways'},{v:'city',l:'City: 3 neighborhoods'}],onChange(sim){sim.p.seed=PL(sim).seed;sim.p.week=1;if(sim.ui&&sim.ui.ctl){sim.ui.ctl.seed.set(sim.p.seed);sim.ui.ctl.week.set(1);}clearGut(sim);}},
  {id:'count',label:'What counts toward the hot spot?',type:'seg',def:'all',noGut:true,onChange:clearGut,options:[{v:'all',l:'Every write-up, minor ones too'},{v:'serious',l:'Only serious incidents (reported anyway)'}],help:'Serious incidents get reported whether or not anyone is patrolling. Minor ones get written up only when someone is there to see them.'},
  {id:'week',label:'Week',type:'range',min:1,max:20,step:1,def:1,noGut:true},
  {id:'rule',label:'Scheduling rule',type:'seg',lvl:'honors',def:'hot',noGut:true,onChange:clearGut,options:[{v:'prop',l:'Proportional: 2× write-ups, 2× patrols'},{v:'hot',l:'Hot spot: 2× write-ups, 4× patrols'},{v:'strong',l:'Strong: 2× write-ups, 8× patrols'}]},
  {id:'rand',label:'Share of patrols spread evenly no matter what',type:'range',lvl:'honors',min:0,max:50,step:5,def:0,unit:'%',noGut:true,onChange:clearGut},
  {id:'seed',label:'Run number (a random seed: same number, same luck)',type:'range',lvl:'honors',min:1,max:40,step:1,def:34,noGut:true,onChange:clearGut}
 ],
 actions:[{id:'next',label:'Next week',run(sim){BioLab.setValues(sim,{week:Math.min(WEEKS,Math.round(sim.p.week)+1)});}},
  {id:'end',label:'Jump to week 20',run(sim){BioLab.setValues(sim,{week:WEEKS});}},
  {id:'rerun',label:'New run',run(sim){BioLab.setValues(sim,{seed:sim.p.seed%40+1,week:1});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'shareA',label:'A’s share of patrols this week',unit:'%',d:0,min:0,max:100,get:sim=>100*shareAt(sim,0)},
  {id:'wA',label:'Write-ups so far: A',unit:'',d:0,min:0,max:null,get:sim=>totAt(sim,0)},
  {id:'wB',label:'Write-ups so far: B',unit:'',d:0,min:0,max:null,get:sim=>totAt(sim,1)},
  {id:'wC',label:'Write-ups so far: C (city only)',unit:'',d:0,min:0,max:null,get:sim=>totAt(sim,2)},
  {id:'trueN',label:'True offenses so far, in every area',unit:'',d:0,min:0,max:null,get:sim=>(wk(sim)+1)*(MINOR+SER)},
  {id:'ratio',label:'A’s write-ups ÷ B’s',unit:'times',d:2,min:0,max:null,get:sim=>totAt(sim,0)/totAt(sim,1)},
  {id:'off',label:'Your gut is off by',unit:'points',d:0,min:0,max:100,get:sim=>shown(sim)?Math.abs(sim.p.guess-ans(sim)):null},
  {id:'gain',label:'Loop gain L at an even split',unit:'',d:2,lvl:'ap',min:0,max:3,get:gain}
 ],
 graphs:[{id:'cum',label:'Write-ups so far vs. true offenses',custom:true}],defaultGraph:'cum',
 plot(sim,ctx,box){const R=run(sim),H=R.H,top=Math.ceil(Math.max(WEEKS*(MINOR+SER),...R.tot[WEEKS-1])/100)*100;
  const ax=axes(ctx,box,{xmin:0,xmax:WEEKS,ymin:0,ymax:top,xl:'Week',yl:'Total so far'});
  ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['muted'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(WEEKS),ax.Y(WEEKS*(MINOR+SER)));ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<H;i++){ctx.strokeStyle=areaCol(i);ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));R.tot.forEach((t,w)=>ctx.lineTo(ax.X(w+1),ax.Y(t[i])));ctx.stroke();}
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ax.X(wk(sim)+1),box.T);ctx.lineTo(ax.X(wk(sim)+1),box.T+box.H);ctx.stroke();
  legend(ctx,box.L+10,box.T+8,[...L3.slice(0,H).map((l,i)=>({label:'Write-ups in '+l,color:areaCol(i)})),{label:'True offenses (each)',color:PAL['muted'],dash:true}]);},
 draw(sim,ctx,vdt,k){const P=PL(sim),R=run(sim),H=R.H,w=wk(sim),sh=R.share[w],mi=R.minor[w],G=GS(sim),city=sim.p.place==='city';
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the areas */
  const gap=14,bw=(800-24-gap*(H-1))/H,by=12,bh=232,nU=city?6:P.per,U=units(sh,nU),mx=Math.max(1,...R.tot[w]);
  for(let i=0;i<H;i++){const bx=12+i*(bw+gap),col=areaCol(i),heat=R.tot[w][i]/mx;
   ctx.fillStyle=PAL['cv-bg2'];rr(ctx,bx,by,bw,bh,10);ctx.fill();
   ctx.fillStyle=col;ctx.globalAlpha=0.08+0.22*heat;rr(ctx,bx,by,bw,bh,10);ctx.fill();ctx.globalAlpha=1;
   ctx.strokeStyle=col;ctx.lineWidth=2;rr(ctx,bx,by,bw,bh,10);ctx.stroke();
   txt(ctx,P.area+' '+L3[i],bx+12,by+24*k,{s:14*k,w:700,c:col});
   txt(ctx,'Patrols: '+pc(sh[i])+(city?'':' ('+Math.round(sh[i]*P.per)+' of '+P.per+' shifts)'),bx+12,by+44*k,{s:12*k,c:PAL['cv-ink']});
   txt(ctx,'Written up so far: '+R.tot[w][i],bx+12,by+62*k,{s:12*k,w:700,c:PAL['cv-ink']});
   /* bottom strip: lockers with monitors in front, or a road with patrol cars */
   const sy=by+bh-34;
   if(city){ctx.fillStyle=PAL['line'];ctx.fillRect(bx+6,sy,bw-12,26);ctx.strokeStyle=PAL['cv-bg'];ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(bx+10,sy+13);ctx.lineTo(bx+bw-10,sy+13);ctx.stroke();ctx.setLineDash([]);
    for(let u=0;u<U[i];u++)car(ctx,bx+28+u*34,sy+13,PAL['cv-ink'],12);}
   else{ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let lx=bx+10;lx<bx+bw-14;lx+=16)ctx.strokeRect(lx,sy,12,26);
    for(let u=0;u<U[i];u++)person(ctx,bx+22+u*Math.min(17.5,(bw-36)/P.per),sy+24,PAL['cv-ink'],7.5);}
   /* this week's 23 offenses: identical in every area. Filled = written up. */
   const cols=12,ds=Math.min(24,(bw-24)/cols),gy=by+72*k+6,dotR=ds*0.36;
   for(let d=0;d<MINOR+SER;d++){const cx=bx+14+(d%cols)*ds+ds/2,cy=gy+Math.floor(d/cols)*ds+ds/2;if(cy+dotR>sy-4)break;const serious=d>=MINOR,hit=serious||d<mi[i];
    ctx.beginPath();if(serious){ctx.rect(cx-dotR,cy-dotR,dotR*2,dotR*2);}else ctx.arc(cx,cy,dotR,0,7);
    if(hit){ctx.fillStyle=serious?PAL['cv-ink']:col;ctx.fill();}else{ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.stroke();}}}
  txt(ctx,k>1.3?`Week ${w+1}: same offenses everywhere. Filled = written up.`:`Week ${w+1}: every ${P.area.toLowerCase()} had ${MINOR} minor offenses (circles) and ${SER} serious (squares). Filled = written up.`,12,by+bh+18*k,{s:12*k,c:PAL['cv-soft']});
  /* share over the weeks */
  const cL=56,cT=by+bh+30*k+8,cR=780,cB=440-14*k,X=t=>cL+(t-1)/(WEEKS-1)*(cR-cL-40*k),Y=v=>cB-(v)*(cB-cT);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,0.5,1].forEach(v=>{ctx.beginPath();ctx.moveTo(cL,Y(v));ctx.lineTo(X(WEEKS),Y(v));ctx.stroke();txt(ctx,Math.round(v*100)+'%',cL-6,Y(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});});
  txt(ctx,'Week 1',X(1),cB+14*k,{s:12*k,c:PAL['cv-soft']});[10,20].forEach(t=>txt(ctx,String(t),X(t),cB+14*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  if(G&&G.g){ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cL,Y(G.g.guess/100));ctx.lineTo(X(WEEKS),Y(G.g.guess/100));ctx.stroke();ctx.setLineDash([]);
   let bt=3,bd=-1;[3,7,11,15].forEach(t=>{let d=1;if(t-1<=w)for(let i=0;i<H;i++)d=Math.min(d,Math.abs(R.share[t-1][i]-G.g.guess/100));if(d>bd){bd=d;bt=t;}});
   txt(ctx,'Your gut',X(bt),Y(G.g.guess/100)+(G.g.guess>85?16*k:-5),{s:12*k,w:700,c:PAL['s4']});}
  const ends=[];for(let i=0;i<H;i++){ctx.strokeStyle=areaCol(i);ctx.lineWidth=2.5;ctx.beginPath();for(let t=0;t<=w;t++){const px=X(t+1),py=Y(R.share[t][i]);t?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
   ctx.fillStyle=areaCol(i);ctx.beginPath();ctx.arc(X(w+1),Y(sh[i]),4,0,7);ctx.fill();ends.push({i,y:Y(sh[i])});}
  ends.sort((a,b)=>a.y-b.y);for(let j=1;j<ends.length;j++)if(ends[j].y-ends[j-1].y<13*k)ends[j].y=ends[j-1].y+13*k;
  const over=ends[ends.length-1].y-(cB-2);if(over>0)ends.forEach(e=>{e.y-=over;});
  ends.forEach(e=>txt(ctx,L3[e.i],X(w+1)+8,e.y+4,{s:12*k,w:700,c:areaCol(e.i)}));},
 narrate(sim){const P=PL(sim),R=run(sim),w=wk(sim),a=R.tot[w][0],b=R.tot[w][1],s=R.share[w][0],tr=(w+1)*(MINOR+SER);
  if(sim.p.count==='serious')return `Week ${w+1}: A gets ${pc(s)} of the patrols. The schedule counts only serious incidents, which get reported whether or not anyone is watching, so <b>the data match reality</b> and every ${P.area.toLowerCase()} stays even. Minor write-ups so far: A ${a}, B ${b}.`;
  if(w===0)return `Week 1: patrols split evenly. Every ${P.area.toLowerCase()} had the same ${MINOR+SER} offenses, but chance decided how many minor ones a patrol happened to see: A ${a}, B ${b}${P.H>2?', C '+R.tot[0][2]:''} write-ups. <b>Next week’s schedule follows these numbers.</b>`;
  const lead=R.tot[w].indexOf(Math.max(...R.tot[w]));
  return `Week ${w+1}: A gets ${pc(s)} of the patrols. Every ${P.area.toLowerCase()} has had ${tr} offenses, but ${P.areas} with more patrols see more of the minor ones: <b>${L3[lead]} has ${Math.max(...R.tot[w])} write-ups, and more write-ups bring more patrols.</b>`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Every week, both hallways have exactly the same behavior. Week 1 is in the picture: patrols split evenly, and chance decided how many write-ups each got. Drag the slider here to the share of patrols you think Hallway A will get in week 20. Then lock it in.',
   honors:'Read week 1 in the picture, then set the slider here by feel: what share of the patrols will A get in week 20? Lock it in.'},
  lock(sim){const a=ans(sim);return {v:Math.abs(sim.p.guess-a),guess:sim.p.guess,label:`A gets ${sim.p.guess}% in week 20`};},
  solve(sim){const a=ans(sim);sim.p.week=WEEKS;return {v:0,guess:a,label:`A gets ${a}% in week 20`};},
  how:{bio:'The math does not guess. It plays the 20 weeks forward: each week it splits the patrols by the write-ups so far, rolls the chance of seeing each minor offense, and adds up the new write-ups.',
   honors:'A recursive sequence: share(t + 1) = (write-ups so far)^g ÷ the sum over all areas, and expected write-ups(t) = 16 × share(t) + 3. The simulation adds the chance of seeing each offense.'},
  compare(sim,g,m){const P=PL(sim),R=run(sim),T=R.tot[WEEKS-1],a=T[0],b=T[1],sh=R.share[WEEKS-1][0],sp=Math.round(sh*P.per),gs=Math.round(g.guess/100*P.per);
   const tail=sim.p.count==='serious'?` Counting only incidents that get reported anyway keeps the data honest: write-ups are A ${a}, B ${b}.`:` Over 20 weeks, ${P.area.toLowerCase()} A logged <b>${a} write-ups and B ${b}</b>${P.H>2?' (C '+T[2]+')':''}, for exactly the same behavior (${WEEKS*(MINOR+SER)} offenses each).`;
   if(g.v<=3)return `Your gut was right on: A ends up with ${m.guess}% of the patrols.${tail}`;
   return `Your gut was off by <b>${g.v} points</b>: A gets ${m.guess}% of the patrols in week 20, not ${g.guess}%.${P.H===2?` That is ${sp} of ${P.per} ${P.unit} instead of ${gs}.`:''}${tail}`;},
  again(sim){sim.p.seed=1+Math.floor(Math.random()*40);sim.p.week=1;sim.p.guess=50;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Both hallways behave exactly alike every week, and every write-up counts. After 20 weeks of “patrol where the write-ups are,” what does the schedule look like?',choices:['About 50/50: it evens out over time','Lopsided: whichever hallway got lucky early ends up with most of the patrols','It flips back and forth every week'],correct:1,explain:'In run 34, A gets 59% in week 2 and 90% by week 20, with 324 write-ups against 107 for B. Same behavior, very different records. More patrols find more minor offenses, and those write-ups bring more patrols.'},
  {lvl:'bio',instant:true,q:'Switch to counting only serious incidents, which get reported whether or not anyone patrols. What happens to the split?',choices:['It stays at 50/50','It still runs away to one hallway','Patrols go to the hallway with fewer write-ups'],correct:0,explain:'Every hallway has 3 serious incidents a week no matter who is watching, so the counts stay equal and so does the schedule. The minor offenses still get written up, but they no longer steer the patrols.'},
  {lvl:'honors',instant:true,q:'Use the proportional rule (2× the write-ups, 2× the patrols) in the school, run 34. Does the loop still run away?',choices:['Yes, just as fast','No: the split wanders but stays near even, because serious incidents pull it back','Patrols flip to B'],correct:1,explain:'With a proportional rule, a hallway with 55% of the patrols records 55% of the minor write-ups, but only 50% of the serious ones, so its new share of write-ups falls back toward 50%. In run 34, A ends week 20 with 54% of the patrols. A hot-spot rule exaggerates any lead, and then it runs away.'},
  {lvl:'honors',instant:true,q:'Keep the hot-spot rule but spread 30% of patrols evenly no matter what. In run 34, what happens to A’s week-20 share?',choices:['It still reaches about 90%','It drops to 63%, a much weaker lock','It drops to exactly 50%'],correct:1,explain:'Spreading 30% evenly caps how far the data can steer the schedule, and it keeps every hallway in the data. A ends at 63% instead of 90%. Spread 50% evenly and A ends at 54%: the loop is broken.'},
  {lvl:'ap',instant:true,q:'Two areas, hot-spot rule (g = 2), every write-up counted: L = 2 × 16 ÷ (16 + 6) ≈ 1.45. What does L > 1 tell you?',choices:['The even split is stable: small leads shrink','The even split is unstable: each week multiplies a small lead, so it grows','The patrols always split 50/50'],correct:1,explain:'Near an even split, the new write-up share’s gap from 50% is L times the old gap. With L ≈ 1.45, a 2-point lead in the data becomes about a 3-point lead in new write-ups, and the running total follows it.'},
  {lvl:'ap',instant:true,q:'Two areas, g = 2. What share of patrols spread evenly brings the loop gain down to exactly 1?',choices:['About 10%','About 31%','About 69%'],correct:1,explain:'Solve 2 × (1 − r) × 16 ÷ 22 = 1: 1 − r = 22 ÷ 32 = 0.6875, so r ≈ 0.31. Spread more than about 31% evenly and the even split becomes stable.'}
 ],
 tour:[
  {title:'Two hallways, same behavior',text:'Your student council helps schedule 4 hall monitors across two hallways. Every week, each hallway has the same 20 minor offenses (phones out, running, no pass) and 3 serious ones. The dots show them.',focus:[0,0,800,250],pause:true,setup:sim=>BioLab.setValues(sim,{place:'school',count:'all',week:1,seed:34,rule:'hot',rand:0})},
  {title:'Week 1: chance',text:'In week 1 the monitors split evenly. Serious incidents always get reported. A minor offense is written up only if a monitor happens to see it. That is chance, so one hallway ends up with a few more write-ups.',focus:[0,0,800,250],pause:true},
  {title:'The rule',text:'The proposal: schedule by write-ups. A hallway with twice the write-ups gets four times the monitor shifts. Watch week 2: A had 12 write-ups and B had 10, so A gets 59% of the shifts.',pause:true,setup:sim=>BioLab.setValues(sim,{week:2})},
  {title:'The loop',text:'More monitors in A see more of A’s minor offenses, so A logs more write-ups, so A gets even more monitors. By week 10 A has 85% of the shifts.',pause:true,setup:sim=>BioLab.setValues(sim,{week:10})},
  {title:'Locked in',text:'By week 20, A has 90% of the shifts and 324 write-ups, against 107 in B. Both hallways had exactly 460 offenses. The record says A is the problem hallway, and the record made itself.',pause:true,setup:sim=>BioLab.setValues(sim,{week:20})},
  {title:'A healthy rule',text:'Now count only serious incidents, which get reported whether or not anyone is watching. The data match reality, and the monitors stay split evenly every week.',pause:true,setup:sim=>BioLab.setValues(sim,{count:'serious',week:20})},
  {title:'The city version',text:'Same math with 3 neighborhoods and patrol officers. Predictive policing software like PredPol, used in Reading, Pennsylvania, in 2013, marked hot-spot squares about the size of two football fields. O’Neil argues that counting nuisance crimes creates exactly this loop.',pause:true,setup:sim=>BioLab.setValues(sim,{place:'city',count:'all',week:20})},
  {lvl:'ap',title:'Loop gain',text:'Near an even split, the share of new write-ups moves L times as far from even as the share of patrols did, with L = g(1 − r) × 16 ÷ (16 + 3H). The running share x obeys x(t+1) − ½ ≈ (x(t) − ½)(t + L) ÷ (t + 1): it grows when L > 1.',pause:true,setup:sim=>BioLab.setValues(sim,{place:'school',count:'all',week:20})}
 ],
 lab:{bio:'<p><b>Question:</b> Does “patrol where the write-ups are” find the problem hallway?</p><ol><li>Press <b>Jump to week 20</b> and record a trial.</li><li>Press <b>New run</b> five times, recording week 20 each time.</li><li>Switch to counting only serious incidents and repeat.</li></ol><p>Write one sentence: how often did one hallway end up with most of the patrols, and was it ever the worse-behaved one?</p>',
  honors:'<p><b>Question:</b> Which rules break the loop?</p><ol><li>For the proportional, hot-spot and strong rules, record A’s week-20 share for runs 1 to 5.</li><li>With the hot-spot rule, set the even share to 0%, 20%, 40%, and repeat.</li></ol><p>Explain in terms of the recursive rule why some settings lock in and others settle back to even.</p>',
  ap:'<p><b>Question:</b> When is an even split stable?</p><ol><li>Derive L = g(1 − r) × 16 ÷ (16 + 3H) for this model.</li><li>For two areas and g = 2, find the r that makes L = 1. Test r just below and just above it for 10 runs each.</li></ol><p><b>CER:</b> Claim when the loop runs away, with evidence from your runs and reasoning from the loop gain.</p>'},
 terms:[
  {t:'Feedback loop',d:'An output that feeds back in as an input. Here: write-ups decide patrols, and patrols decide write-ups.'},
  {t:'Hot spot',d:'A place flagged for extra patrols because of its record.'},
  {t:'Nuisance offense',d:'A minor offense, like a phone out in the hall, that gets recorded only when someone happens to see it.'},
  {t:'Recursive sequence',d:'A sequence where each term is built from earlier ones: next week’s patrol share is built from the write-ups so far.',lvl:'honors'},
  {t:'Pólya urn',d:'A model where each draw adds more of what was drawn, so early luck shapes the long run.',lvl:'honors'},
  {t:'Unstable equilibrium',d:'A balance point that small nudges move away from, like a ball on top of a hill.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> Every area has the same true behavior each week: 20 minor offenses and 3 serious ones. Serious incidents are always reported and recorded. Each minor offense is written up with chance 0.8 × that area’s share of patrols (an assumption for illustration). Week 1 splits patrols evenly. After that, each area’s share is proportional to (write-ups counted so far)<sup>g</sup>, with g = 1, 2 or 3, and an optional share spread evenly no matter what. Each run number is a fixed random seed. With g = 1 and no serious incidents this is a Pólya urn. A school would never use a rule this simple, and real policing depends on far more, but the loop is the same shape.</p><p><b>The cases.</b> Cathy O’Neil, <i>Weapons of Math Destruction</i> (2016), Ch. 5: police in Reading, Pennsylvania, began using PredPol in 2013; it predicted hot spots in squares about the size of two football fields. O’Neil argues that when a model includes nuisance crimes, more patrols produce more recorded crime in the same places, a feedback loop. She also reports, from NYCLU data on New York’s stop-and-frisk program, that about 85% of stops involved young Black or Latino men and only about 0.1% were linked to violent crime.</p><p>In Pasco County, Florida, the Tampa Bay Times reported in 2020 that the sheriff’s office kept lists of “prolific offenders,” many of them minors, and a school list of about 420 students. In December 2024 the case was settled: the sheriff admitted the program violated the Constitution and ended it (<a href="https://ij.org/press-release/case-closed-pasco-sheriff-admits-predictive-policing-program-violated-constitution/" target="_blank" rel="noopener">Institute for Justice</a>).</p><p><b>Both sides.</b> Supporters of hot-spot policing argue that serious crime clusters in small places, and that focusing limited patrols there can prevent it. Critics argue that counting offenses that depend on who is watching sends patrols back to the same places and builds a record that looks like proof. This tool tests one narrow piece of that debate: what a schedule does when the data depend on the schedule.</p>'
};
BioLab.register(SIM);
})();
