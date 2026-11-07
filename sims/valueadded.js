(function(){
'use strict';
const {clamp,txt,pill,rr,rng,randn,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* 40 fictional teachers. True effect tau ~ N(0, 2 points). A class of n students grows by tau + noise,
   one student's noise ~ N(0, 10 points), so a class average is off by SE = 10/sqrt(n).
   Score = class average growth. Year 1 fires the lowest 2 (5%). Year 2 gives every teacher a new class.
   Each district is a fixed seed: the same standard-normal draws are rescaled when n changes, so you watch the same teachers. */
const NT=40,SDT=2,SDS=10,FIRE=2,MANY=2000;
const NS=[10,25,100,1000,10000];
const DC={};
function district(seed){seed=+seed;if(DC[seed])return DC[seed];const r=rng(seed*7919+13),T=[];
 for(let j=0;j<NT;j++)T.push({tau:SDT*randn(r),z1:randn(r),z2:randn(r)});
 let W=0;T.forEach((t,j)=>{if(Math.abs(t.tau-2)<Math.abs(T[W].tau-2))W=j;});
 const worst=[...T.keys()].sort((a,b)=>T[a].tau-T[b].tau).slice(0,FIRE);
 return DC[seed]={T,W,worst};}
const yrs=sim=>sim.p.healthy?3:1;
const se=sim=>SDS/Math.sqrt((+sim.p.n)*yrs(sim));
const xAmt=sim=>(sim.p.erase&&!sim.p.healthy)?sim.p.X:0;
function scores(sim){const D=district(sim.p.seed),s=se(sim),x=xAmt(sim);
 return {D,s1:D.T.map((t,j)=>t.tau+s*t.z1-(j===D.W?x:0)),s2:D.T.map(t=>t.tau+s*t.z2)};}
const low=(a,k)=>[...a.keys()].sort((i,j)=>a[i]-a[j]).slice(0,k);
const fired=sim=>low(scores(sim).s1,FIRE);
function corr(a,b){const n=a.length,ma=a.reduce((x,y)=>x+y)/n,mb=b.reduce((x,y)=>x+y)/n;let ab=0,aa=0,bb=0;for(let i=0;i<n;i++){ab+=(a[i]-ma)*(b[i]-mb);aa+=(a[i]-ma)**2;bb+=(b[i]-mb)**2;}return ab/Math.sqrt(aa*bb);}
const rthe=sim=>SDT*SDT/(SDT*SDT+se(sim)**2);
/* Out of 100 fired: run 2,000 districts (4,000 firings) with fixed seeds. */
const RC={};
function rates(sim){const n=+sim.p.n,y=yrs(sim),key=n+'|'+y;if(RC[key])return RC[key];const s=SDS/Math.sqrt(n*y);let f=0,avg=0,wst=0,ag=0;
 for(let d=0;d<MANY;d++){const r=rng(100000+d),T=[];for(let j=0;j<NT;j++)T.push({tau:SDT*randn(r),z1:randn(r),z2:randn(r)});
  const s1=T.map(t=>t.tau+s*t.z1),s2=T.map(t=>t.tau+s*t.z2),F=low(s1,FIRE),Wt=low(T.map(t=>t.tau),FIRE),Y2=low(s2,FIRE);
  F.forEach(i=>{f++;if(T[i].tau>=0)avg++;if(Wt.includes(i))wst++;if(Y2.includes(i))ag++;});}
 return RC[key]={avg:100*avg/f,worst:100*wst/f,again:100*ag/f};}
const ans=sim=>Math.round(rates(sim).avg);
function pctl(a){return a.map(v=>100*a.filter(w=>w<v).length/(a.length-1));}
function jump(sim){const {s1,s2}=scores(sim),p1=pctl(s1),p2=pctl(s2);let b=0;p1.forEach((v,i)=>{b=Math.max(b,p2[i]-v);});return b;}
const wRank=sim=>{const {s1,D}=scores(sim);return s1.filter(v=>v<s1[D.W]).length+1;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g&&!(BioLab.calcPending&&BioLab.calcPending(sim))));
const f1=v=>(v>=0?'+':'−')+Math.abs(v).toFixed(1);
const nfmt=n=>(+n).toLocaleString('en-US');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* wrap text to a width; returns the y after the last line */
function wrap(ctx,s,x,y,w,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='';
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,y,o);y+=lh;line=wd;}else line=t;});if(line){txt(ctx,line,x,y,o);y+=lh;}return y;}
const verb=sim=>sim.p.healthy?'flagged':'fired';
/* "Your turn": the standard error of one score (Big picture, Closer look) or the expected correlation (Deep dive). Hidden until it is checked. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const nEff=sim=>(+sim.p.n)*yrs(sim);
const calcAns=sim=>atLeast('ap')?Math.round(rthe(sim)*100)/100:Math.round(se(sim)*100)/100;
const seLine=sim=>sim.p.healthy?`SE = 10 ÷ √(3 × ${nfmt(sim.p.n)}) = ${se(sim).toFixed(2)} points`:`SE = 10 ÷ √${nfmt(sim.p.n)} = ${se(sim).toFixed(2)} points`;
const rLine=sim=>`r ≈ 4 ÷ (4 + ${(se(sim)**2).toFixed(2)}) = ${rthe(sim).toFixed(2)}`;

const SIM={
 id:'valueadded',hash:'valueadded',apUnit:19,order:5,tab:'Value-added roulette',kind:'Simulation',
 skills:{bio:'The standard error of an average, σ ÷ √n · Statistics (Ch. 7), AP Statistics (Unit 5)',honors:'Standard error σ ÷ √n and correlation · Statistics (Ch. 7), AP Statistics (Unit 5)',ap:'Reliability: Var(true) ÷ Var(score), from the standard error · AP Statistics (Unit 5)'},
 card:'Guess how many fired teachers were actually average or better, then watch 25 students’ scores rank 40 teachers twice.',
 title:'Can 25 students’ test scores rate a teacher?',
 lede:{bio:'A district ranks teachers by how much their students’ test scores grew in one year, and fires the lowest 5%. Each teacher’s score rests on one class: your class of about 25 students. Is that enough to tell good teachers from unlucky ones?',
  honors:'A class average of n students is off by about σ ÷ √n, where σ is how much one student’s growth varies. Compare that standard error with the real differences between teachers, about 2 points.',
  ap:'The year-to-year correlation of scores is the reliability: r ≈ σ²(teacher) ÷ (σ²(teacher) + σ²(student)/n) = 4 ÷ (4 + 100/n). It reaches 0.9 only at about 225 students per score.'},
 scale:'40 fictional teachers in one district, scored in points of test-score growth. Teacher effects and student noise are assumptions for illustration.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The rating system',
 controls:[
  {id:'guess',label:'Your gut: out of 100 fired teachers, how many are actually average or better?',type:'range',min:0,max:100,step:1,def:50,unit:''},
  {id:'n',label:'Students behind each teacher’s score',type:'seg',def:25,noGut:true,onChange:clearGut,options:NS.map(v=>({v,l:nfmt(v)}))},
  {id:'erase',label:'Erasures: Teacher W’s new class arrives with inflated scores',type:'toggle',def:false,noGut:true,onChange:clearGut,help:'Someone changed answers on last year’s tests, so the class looks like it already knows more than it does. Teacher W gets the blame for the “drop.”'},
  {id:'healthy',label:'3-year model: average 3 classes, check the data, flag instead of fire',type:'toggle',def:false,noGut:true,onChange:clearGut},
  {id:'show',label:'Show the answer now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut.'},
  {id:'X',label:'Inflation of Teacher W’s incoming scores',type:'range',lvl:'honors',min:0,max:15,step:1,def:6,unit:' points',noGut:true,onChange:clearGut},
  {id:'seed',label:'District number (a random seed: same number, same classes)',type:'range',lvl:'honors',min:1,max:30,step:1,def:11,noGut:true,onChange:clearGut}
 ],
 actions:[{id:'district',label:'New district',run(sim){BioLab.setValues(sim,{seed:sim.p.seed%30+1});}},
  {id:'big',label:'Score with 1,000 students',lvl:'honors',run(sim){BioLab.setValues(sim,{n:1000});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'r',label:'Year-to-year correlation, this district',unit:'',d:2,min:-1,max:1,get:sim=>{if(pend(sim))return null;const {s1,s2}=scores(sim);return corr(s1,s2);}},
  {id:'favg',label:'Fired teachers here who are average or better',unit:'of 2',d:0,min:0,max:2,get:sim=>{const {D}=scores(sim);return fired(sim).filter(i=>D.T[i].tau>=0).length;}},
  {id:'per100',label:'Out of 100 fired: average or better',unit:'teachers',d:0,min:0,max:100,get:sim=>shown(sim)?rates(sim).avg:null},
  {id:'off',label:'Your gut is off by',unit:'teachers',d:0,min:0,max:100,get:sim=>shown(sim)?Math.abs(sim.p.guess-ans(sim)):null},
  {id:'wrank',label:'Teacher W’s year-1 rank (1 = lowest of 40)',unit:'',d:0,min:1,max:40,get:wRank},
  {id:'se',label:'Standard error of one teacher’s score',unit:'points',d:2,lvl:'honors',min:0,max:4,get:sim=>pend(sim)?null:se(sim)},
  {id:'rth',label:'Expected correlation: 4 ÷ (4 + SE²)',unit:'',d:2,lvl:'honors',min:0,max:1,get:sim=>pend(sim)?null:rthe(sim)},
  {id:'worst',label:'Out of 100 fired: truly among the worst 5%',unit:'teachers',d:0,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?rates(sim).worst:null},
  {id:'again',label:'Out of 100 fired: bottom 5% again in year 2',unit:'teachers',d:0,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?rates(sim).again:null},
  {id:'jump',label:'Biggest rise in percentile, year 1 to year 2',unit:'points',d:0,lvl:'ap',min:0,max:100,get:jump}
 ],
 graphs:[{id:'rel',label:'Correlation vs. students per score',custom:true}],defaultGraph:'rel',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:1,xmax:4,ymin:0,ymax:1,xticks:false,xl:'Students per score (log scale)',yl:'Year-to-year correlation'});
  [[10,'10'],[100,'100'],[1000,'1,000'],[10000,'10,000']].forEach(([v,l])=>txt(ctx,l,ax.X(Math.log10(v)),box.T+box.H+16,{s:13,c:PAL['g-axis'],a:'center'}));
  const y=yrs(sim);ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let e=1;e<=4.0001;e+=0.02){const n=Math.pow(10,e),r=4/(4+100/(n*y));e<1.01?ctx.moveTo(ax.X(e),ax.Y(r)):ctx.lineTo(ax.X(e),ax.Y(r));}ctx.stroke();
  NS.forEach(n=>{const o=sim.p.n,s=sim.p.seed;sim.p.n=n;const {s1,s2}=scores(sim),r=corr(s1,s2);sim.p.n=o;ctx.fillStyle=+n===+sim.p.n?PAL['rj']:PAL['s2'];ctx.beginPath();ctx.arc(ax.X(Math.log10(n)),ax.Y(r),+n===+sim.p.n?7:5,0,7);ctx.fill();});
  legend(ctx,box.L+10,box.T+box.H-12,[{label:'Formula',color:PAL['g-line']},{label:'This district',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){const {D,s1,s2}=scores(sim),F=fired(sim),r=corr(s1,s2),hl=sim.p.healthy,sh=shown(sim),G=GS(sim),wOn=sim.p.erase;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(408,0,392,450);
  const FC=hl?PAL['s5']:PAL['s1'],WC=PAL['s6'];
  /* scatter: year 1 vs year 2 */
  const L=72,T=46,S=300,R=12,X=v=>L+(clamp(v,-R,R)+R)/(2*R)*S,Y=v=>T+S-(clamp(v,-R,R)+R)/(2*R)*S;
  txt(ctx,(G&&G.m&&k>1.3)?seLine(sim).replace(' points',''):'Each dot is one teacher',16,26*Math.min(k,1.3),{s:13*k,w:700,c:(G&&G.m&&k>1.3)?PAL['rj']:PAL['cv-ink']});
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[-10,-5,0,5,10].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),T);ctx.lineTo(X(v),T+S);ctx.stroke();ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(L+S,Y(v));ctx.stroke();});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(L,T,S,S);
  [-10,0,10].forEach(v=>{txt(ctx,String(v).replace('-','−'),X(v),T+S+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});txt(ctx,String(v).replace('-','−'),L-6,Y(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});});
  txt(ctx,'Year 1 score (points)',L+S/2,T+S+34*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.save();ctx.translate(18,T+S/2);ctx.rotate(-Math.PI/2);txt(ctx,'Year 2 score',0,0,{s:12*k,c:PAL['cv-soft'],a:'center'});ctx.restore();
  ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(X(-R),Y(-R));ctx.lineTo(X(R),Y(R));ctx.stroke();ctx.setLineDash([]);
  D.T.forEach((t,j)=>{const on=F.includes(j);ctx.fillStyle=on?FC:PAL['s2'];ctx.globalAlpha=on?1:0.75;ctx.beginPath();ctx.arc(X(s1[j]),Y(s2[j]),on?6.5:5,0,7);ctx.fill();ctx.globalAlpha=1;});
  if(wOn){ctx.strokeStyle=WC;ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(s1[D.W]),Y(s2[D.W]),10,0,7);ctx.stroke();txt(ctx,'W',X(s1[D.W])+(s1[D.W]>6?-14:14),Y(s2[D.W])-10,{s:13*k,w:700,c:WC,a:s1[D.W]>6?'right':'left'});}
  if(!pend(sim))pill(ctx,'r = '+r.toFixed(2),L+S-50*k,T+18*k,PAL['rj'],'#fff',13*Math.min(k,1.4));
  /* the formula with this case's numbers, once the math has run */
  if(G&&G.m&&k<=1.3)wrap(ctx,seLine(sim)+'; '+rLine(sim),16,T+S+56*k,392-16,15*k,{s:12*k,w:700,c:PAL['rj']});
  /* true effects on a number line */
  const rx=424,rw=360,NX=v=>rx+10+(clamp(v,-6,6)+6)/12*(rw-20),ly=150;
  ctx.font='700 '+(13*k)+'px '+FONT;const th=ctx.measureText('Their true effects (hidden in real life)').width<rw?'Their true effects (hidden in real life)':'True effects (hidden)';txt(ctx,th,rx,26*Math.min(k,1.3),{s:13*k,w:700});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(NX(-6),ly);ctx.lineTo(NX(6),ly);ctx.stroke();
  [-6,-4,-2,0,2,4,6].forEach(v=>{ctx.beginPath();ctx.moveTo(NX(v),ly);ctx.lineTo(NX(v),ly+5);ctx.stroke();});
  [-4,0,4].forEach(v=>txt(ctx,v===0?'0 = average':String(v).replace('-','−'),NX(v),ly+20*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));
  const bins={};const order=[...D.T.keys()].sort((a,b)=>D.T[a].tau-D.T[b].tau);
  order.forEach(j=>{const b=Math.round(clamp(D.T[j].tau,-6,6)/0.5);bins[b]=(bins[b]||0)+1;const h=bins[b]-1,x=NX(b*0.5),y=ly-8-h*11;const on=F.includes(j);
   ctx.fillStyle=on?FC:PAL['s2'];ctx.globalAlpha=on?1:0.75;ctx.beginPath();ctx.arc(x,y,on?6:4.5,0,7);ctx.fill();ctx.globalAlpha=1;
   if(wOn&&j===D.W){ctx.strokeStyle=WC;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,9,0,7);ctx.stroke();}});
  /* what happened */
  const v=verb(sim),fa=F.filter(i=>D.T[i].tau>=0).length,fw=F.filter(i=>D.worst.includes(i)).length,lh=17*k;let y=ly+46*k;const o={s:12*k,c:PAL['cv-ink']};
  y=wrap(ctx,`${hl?'Flagged for a closer look (purple dots)':'Fired after year 1 (red dots)'}: true effects ${F.map(i=>f1(D.T[i].tau)).join(' and ')}.`,rx,y,rw,lh,o);
  y=wrap(ctx,`Average or better: ${fa} of 2. Truly among the 2 worst: ${fw} of 2.`,rx,y+4,rw,lh,{s:12*k,w:700,c:fa?PAL['s1']:PAL['cv-ink']});
  if(wOn){const rk=wRank(sim);y=wrap(ctx,hl?`Teacher W (true effect ${f1(D.T[D.W].tau)}): the data check catches the erased tests, so W’s score is clean. Rank ${rk} of 40.`:`Teacher W (true effect ${f1(D.T[D.W].tau)}, better than most): year-1 rank ${rk} of 40${F.includes(D.W)?', fired':''}.`,rx,y+6,rw,lh,{s:12*k,c:WC,w:700});}
  if(y<430-lh){const p=rates(sim);y=wrap(ctx,sh?`Out of every 100 teachers ${v} this way, ${Math.round(p.avg)} are average or better and ${Math.round(p.worst)} are truly among the worst 5%.`:(G&&G.g?`Out of every 100 teachers ${v} this way, how many are average or better? Work out the standard error first.`:`Out of every 100 teachers ${v} this way, how many are average or better? Lock in your gut to see.`),rx,y+6,rw,lh,{s:12*k,c:PAL['cv-soft']});}
  if(G&&G.g&&y<444-lh)wrap(ctx,`Your gut: ${G.g.guess} of 100.`,rx,y+4,rw,lh,{s:12*k,w:700,c:PAL['s4']});},
 narrate(sim){const {D,s1,s2}=scores(sim),r=corr(s1,s2),F=fired(sim),fw=F.filter(i=>D.worst.includes(i)).length,n=+sim.p.n,hl=sim.p.healthy;
  if(pend(sim))return `Each score averages ${hl?'3 years of '+nfmt(n)+' students':nfmt(n)+' students'}, and one student’s growth swings by about 10 points. <b>Work out how far off one teacher’s score typically is.</b>`;
  const lead=hl?`With 3 years of ${nfmt(n)} students each, a score is off by about ${se(sim).toFixed(2)} points and year-to-year r = ${r.toFixed(2)}.`:`With ${nfmt(n)} students, a teacher’s score is off by about ${se(sim).toFixed(2)} points, and this year’s scores predict next year’s with r = ${r.toFixed(2)} (1 would be a perfect match, 0 no link at all).`;
  if(rthe(sim)<0.7)return `${lead} <b>The class list moves a score about as much as the teacher does.</b> Of the 2 teachers ${verb(sim)} here, ${fw} ${fw===1?'is':'are'} truly among the 2 worst.`;
  return `${lead} <b>Now the scores mostly measure the teacher</b>, so the ranking holds from year to year.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'The district fires the 2 lowest-scoring teachers out of 40 after one year. Drag the slider here: out of every 100 teachers fired this way, how many do you think are actually average or better? Then lock it in.',honors:'Set the slider here by feel: out of every 100 teachers fired on one year of scores, how many are average or better? Then lock it in.'},
  lock(sim){const a=ans(sim);return {v:Math.abs(sim.p.guess-a),guess:sim.p.guess,label:`${sim.p.guess} of every 100 fired`};},
  solve(sim){const a=ans(sim);return {v:0,guess:a,label:`${a} of every 100 fired`};},
  hint:'Lock in your gut answer. Then you will work out how far off one teacher’s score typically is.',
  calc:{unit:'',d:2,tol:a=>atLeast('ap')?0.015:Math.max(0.02,0.02*a),
   prompt:{bio:sim=>`One student’s growth swings by about <b>σ = 10 points</b>. Each teacher’s score averages <b>${sim.p.healthy?'3 × '+nfmt(sim.p.n)+' = '+nfmt(nEff(sim)):nfmt(sim.p.n)} students</b>. The standard error of an average is σ ÷ √n. How many points off is one teacher’s score, typically?`,
    ap:sim=>`True teacher effects have variance 4 (SD 2 points). One student’s growth has SD 10 points, and each score averages ${nfmt(nEff(sim))} students. Find the standard error, then the expected year-to-year correlation r = 4 ÷ (4 + SE²).`},
   answer:calcAns,
   hint:{bio:'Take the square root of the number of students first. Then divide 10 by it.',ap:'SE² = 100 ÷ n. Then put it into 4 ÷ (4 + SE²).'},
   steps(sim){const n=nEff(sim),out=[`√${nfmt(n)} = ${Math.sqrt(n).toFixed(2)}.`,`SE = 10 ÷ ${Math.sqrt(n).toFixed(2)} = <b>${se(sim).toFixed(2)} points</b>.`];
    if(atLeast('ap'))out.push(`SE² = 100 ÷ ${nfmt(n)} = ${(100/n).toFixed(2)}, so r = 4 ÷ (4 + ${(100/n).toFixed(2)}) = <b>${rthe(sim).toFixed(2)}</b>.`);
    else out.push(`Real teachers differ by about 2 points, so ${se(sim)>=1.5?'one class can move a score about as much as the teacher does':'the class list now moves a score less than the teacher does'}.`);
    return out;}},
  formula(sim){return seLine(sim)+'<br>Expected year-to-year '+rLine(sim);},
  how:{bio:'The math runs the whole system 2,000 times: 2,000 districts of 40 teachers, 4,000 firings. Then it checks each fired teacher’s true effect and counts.',
   honors:'Simulation: for each of 2,000 seeded districts, draw true effects τ ~ N(0, 2) and class averages τ + N(0, 10/√n), fire the 2 lowest, and tally whether τ ≥ 0 and whether τ was among the 2 lowest.'},
  compare(sim,g,m){const p=rates(sim),a=m.guess,wr=Math.round(100-p.worst),v=verb(sim);
   const tail=` The bigger miss is elsewhere: only <b>${Math.round(p.worst)} of every 100</b> ${v} teachers were truly among the worst 5%. The other ${wr} landed below the line partly because of which students they drew.`;
   const K=sim.ui.calc,self=K&&K.done&&K.correct?` You also found the standard error yourself: ${se(sim).toFixed(2)} points.`:'';
   if(g.v<=2)return `Your gut was right on: about ${a} of every 100 ${v} teachers are average or better.${p.worst<90?tail:''}`+self;
   return `Your gut was off by <b>${g.v} teacher${g.v===1?'':'s'} per 100</b>: the simulation finds ${a} of every 100 ${v} teachers are average or better, not ${g.guess}.${p.worst<90?tail:''}`+self;},
  again(sim){sim.p.seed=1+Math.floor(Math.random()*30);sim.p.n=[10,25,100][Math.floor(Math.random()*3)];sim.p.healthy=false;sim.p.erase=false;sim.p.guess=50;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Another school scores each teacher on a class of 16 students. One student’s growth swings by about 10 points. How many points off is a class average, typically? (SE = σ ÷ √n)',answer:2.5,tol:0.05,unit:'points',d:2,hint:'√16 = 4. Divide 10 by that.',explain:'SE = 10 ÷ √16 = 10 ÷ 4 = 2.5 points. That is more than the 2-point differences between real teachers, so a 16-student score is mostly class luck.'},
  {lvl:'bio',instant:true,q:'A teacher lands in the bottom 5% in year 1, scored on 25 students. What usually happens in year 2, with a new class?',choices:['They land in the bottom 5% again','They usually move toward the middle: only about 22 of every 100 land in the bottom 5% again','They jump to the top 5%'],correct:1,explain:'A year-1 score is part teacher and part luck of the class. Next year the luck is new, so most of the “worst” teachers drift back toward the middle: regression to the mean. In this model about 22 of every 100 fired teachers would land in the bottom 5% again.'},
  {lvl:'bio',instant:true,q:'Which change makes the rankings most trustworthy?',choices:['Score each teacher on 1,000 students instead of 25','Fire more teachers each year','Give harder tests'],correct:0,explain:'With 1,000 students a class average is off by only 10 ÷ √1,000 ≈ 0.32 points, much smaller than the 2-point differences between teachers. The expected correlation rises from 0.50 to 0.98.'},
  {lvl:'honors',instant:true,q:'One student’s growth varies by 10 points. How far off is a class average of 25 students, typically?',choices:['10 points','2 points','0.4 points'],correct:1,explain:'The standard error of a mean is σ ÷ √n = 10 ÷ √25 = 2 points. Real teachers differ by about 2 points too, so half the variation in scores is noise: r = 4 ÷ (4 + 4) = 0.5.'},
  {lvl:'honors',instant:true,q:'Teacher W helps students grow about 2 points more than average. In district 11, W’s new class arrives with prior scores inflated by 6 points. What does the system do?',choices:['Nothing: one class cannot move a teacher that much','W’s score drops 6 points, W ranks 2nd lowest of 40, and W is fired','W’s score goes up, because the class looks stronger'],correct:1,explain:'Growth = this year’s score − last year’s score. Inflate last year’s by 6 and the growth drops by 6. In district 11 that moves W from rank 30 to rank 2 of 40, inside the firing line, though W’s true effect beats 36 of the other 39 teachers.'},
  {lvl:'ap',instant:true,q:'How many students per score does it take for an expected year-to-year correlation of 0.9?',choices:['About 50','About 225','About 2,500'],correct:1,explain:'Solve 4 ÷ (4 + 100/n) = 0.9: 4 + 100/n = 4.444, so 100/n = 0.444 and n = 225. That is about 9 classes of 25, many years of one teacher’s work.'},
  {lvl:'ap',kind:'num',q:'Teacher effects have variance 4 and one student’s growth has variance 100. How many students per score give an expected year-to-year correlation of 0.75?',answer:75,tol:0.5,unit:'students',d:0,hint:'Set 4 ÷ (4 + 100/n) = 0.75 and solve for 100/n first.',explain:'4 ÷ (4 + 100/n) = 0.75 gives 4 + 100/n = 5.33, so 100/n = 1.33 and n = 75: three classes of 25. That is what the 3-year model uses.'}
 ],
 tour:[
  {title:'40 teachers, true effects',text:'On the right is each teacher’s true effect: how many more points their students grow than with an average teacher. In real life no one can see this. The scoring system is trying to estimate it.',focus:[408,0,392,180],pause:true,setup:sim=>BioLab.setValues(sim,{n:25,seed:11,erase:false,healthy:false,show:false})},
  {title:'One class, one score',text:'Each teacher gets about 25 students. The score is the class’s average growth. One student’s growth swings by about 10 points, so the class average is typically off by 10 ÷ √25 = 2 points: as big as the real differences between teachers.',focus:[0,0,408,450],pause:true},
  {title:'Year 1 against year 2',text:'Each dot is one teacher: year-1 score across, year-2 score up, with a new class. If the scores measured teachers, the dots would sit on the dashed line. Here the correlation is only r = 0.53.',focus:[0,0,408,450],pause:true},
  {title:'Fire the bottom 2',text:'The red dots are the 2 teachers fired after year 1. Their true effects are −4.4 and −0.3. One really is the weakest teacher in the district. The other is almost exactly average, while the second-weakest teacher (−2.7) ranked only 10th from the bottom.',focus:[408,0,392,260],pause:true},
  {title:'More students, steadier scores',text:'Now score each teacher on 1,000 students. The class average is off by only 0.32 points, the dots line up along the diagonal, and r = 0.98.',pause:true,setup:sim=>BioLab.setValues(sim,{n:1000})},
  {lvl:'honors',title:'Erasures',text:'Back to 25 students. Teacher W helps students grow about 2 points more than average. W’s new class arrives with last year’s scores inflated by 6 points, so W’s growth score drops by 6: from rank 30 to rank 2 of 40, and W is fired.',pause:true,setup:sim=>BioLab.setValues(sim,{n:25,erase:true,X:6})},
  {title:'Three years of data',text:'Average 3 years of classes, let teachers check the data (that catches the erasures), and flag the lowest for a closer look instead of firing. The score is off by 1.15 points, and r rises to 0.75 on average (0.76 in this district).',pause:true,setup:sim=>BioLab.setValues(sim,{n:25,erase:true,healthy:true})},
  {lvl:'ap',title:'Reliability',text:'Score = τ + noise, with Var(τ) = 4 and Var(noise) = 100/n. The correlation between two years is Var(τ) ÷ (Var(τ) + 100/n) = 4 ÷ (4 + 100/n). At n = 25 that is exactly 0.5; this district happened to land at 0.53.',pause:true,setup:sim=>BioLab.setValues(sim,{n:25,erase:false,healthy:false})}
 ],
 lab:{bio:'<p><b>Question:</b> How many students does a teacher score need?</p><ol><li>For each setting of <b>Students behind each teacher’s score</b>, record a trial.</li><li>Record the year-to-year correlation and how many fired teachers were truly among the 2 worst.</li><li>Press <b>New district</b> and repeat for 25 students three times.</li></ol><p>Write one sentence: when would you trust these scores?</p>',
  honors:'<p><b>Question:</b> How much damage can one erased class do?</p><ol><li>Turn on erasures. Set the inflation from 0 to 15 points in steps of 3.</li><li>Record Teacher W’s rank each time.</li><li>Repeat with the 3-year model on.</li></ol><p>Explain why W cannot fix this alone, and what would let W check the score.</p>',
  ap:'<p><b>Question:</b> Does the reliability formula predict real districts?</p><ol><li>For n = 10, 25 and 100, record r for districts 1 to 10.</li><li>Compare their mean with 4 ÷ (4 + 100/n).</li></ol><p><b>CER:</b> Claim how many students a fair score needs, with evidence from your table and reasoning from the standard error σ/√n.</p>'},
 terms:[
  {t:'Value-added score',d:'A rating of a teacher based on how much their students’ test scores grew, compared with what was expected.'},
  {t:'Noise',d:'Variation that has nothing to do with what you are measuring, like which students happened to be in the class.'},
  {t:'Correlation (r)',d:'How closely two sets of numbers move together, from −1 to 1. Here: does a teacher’s score this year predict next year’s?'},
  {t:'Regression to the mean',d:'Extreme results are partly luck, so the next measurement usually lands closer to the middle.'},
  {t:'Standard error',d:'How far an average typically lands from the true value: σ ÷ √n.',lvl:'honors'},
  {t:'Reliability',d:'The share of the variation in scores that comes from real differences: Var(true) ÷ Var(score).',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> 40 fictional teachers. Each has a true effect τ drawn from a normal distribution with mean 0 and standard deviation 2 points. One student’s growth is τ plus noise with standard deviation 10 points, so a class average of n students is τ plus noise with standard error 10/√n. The district fires the 2 lowest (5%) after year 1; year 2 gives every teacher a new class. “Out of 100 fired” comes from 2,000 seeded districts (4,000 firings). Teacher W is the teacher whose true effect is closest to +2 points; erasures subtract the inflation from W’s year-1 growth. The 3-year model averages 3 years of classes, removes the erased class after a data check, and flags rather than fires. These numbers are assumptions for illustration, not estimates from any real district, and real value-added models adjust for more than prior scores.</p><p><b>The cases.</b> Cathy O’Neil, <i>Weapons of Math Destruction</i> (2016), Introduction: Washington, D.C.’s IMPACT evaluation system, started in 2009, used value-added scores for half of some teachers’ evaluations. After the 2010–11 school year the district fired 206 teachers. Sarah Wysocki, a fifth-grade teacher with strong reviews, was among them. Investigations later found high erasure rates on tests at 41 district schools. O’Neil’s Conclusion reports that New York City teacher Tim Clifford scored 6 one year and 96 the next.</p><p>In Houston Federation of Teachers v. Houston ISD, a federal court found in 2017 that teachers had no meaningful way to verify their EVAAS scores. The October 2017 settlement bars the district from firing teachers based on scores they cannot independently check (<a href="https://www.aft.org/press-release/federal-suit-settlement-end-value-added-measures-teacher-termination-houston" target="_blank" rel="noopener">AFT press release</a>).</p>'
};
BioLab.register(SIM);
})();
