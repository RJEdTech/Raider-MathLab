(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* The "30 million word gap" as a measurement-design problem.
   Each design is a real study's design with that study's published averages:
   hr    Hart & Risley 1995: one observed hour a month; words the parents said to the child. 2,153 vs 616 words/hour.
   bb    Same counting rule, another community: Sperry, Sperry & Miller 2019 report 1,838 words/hour for Black Belt families.
   lena  Gilkerson et al. 2017: all-day (12 h) LENA recordings; every adult word near the child. 14,848 vs 11,975 words/day.
   lena2 Gilkerson et al. 2017: top 2% vs bottom 2% of the same families: about 20,500 words/day apart.
   wide  Sperry, Sperry & Miller 2019: every caregiver plus overheard talk; they report the gap "disappears entirely" (0 here).
   Headline = (words/hour gap) x waking hours x 365 x years, or (words/day gap) x 365 x years for all-day designs.
   Margin (95%) = 1.96 x sqrt((cv*A)^2/n + (cv*B)^2/n), scaled the same way. cv (how much families differ) is an assumption. */
const D={
 hr:{l:'Hart & Risley: 1 observed hour a month',s:'Hart & Risley',rec:'hour',A:2153,B:616,
  recT:'One observed hour a month, about 7 months to age 3',cntT:'Words the parents said to the child',grT:'13 professional vs. 6 welfare families',
  cite:'Hart & Risley 1995'},
 bb:{l:'Same counting rule, another community',s:'Black Belt',rec:'hour',A:2153,B:1838,lvl:'honors',
  recT:'Home recordings, counted the Hart & Risley way',cntT:'Words the main caregivers said to the child',grT:'H&R professional vs. Black Belt (low-income) families',
  cite:'Sperry, Sperry & Miller 2019'},
 lena:{l:'All-day recorder (LENA)',s:'LENA all day',rec:'day',A:14848,B:11975,
  recT:'A recorder the child wears for a 12-hour day',cntT:'Every adult word near the child',grT:'84 college-degree vs. 245 other mothers',
  cite:'Gilkerson et al. 2017'},
 lena2:{l:'All-day recorder, top 2% vs. bottom 2%',s:'Top vs. bottom 2%',rec:'day',gd:20500,lvl:'honors',
  recT:'A recorder the child wears for a 12-hour day',cntT:'Every adult word near the child',grT:'Top 2% vs. bottom 2% of 329 families (about 7 each)',
  cite:'Gilkerson et al. 2017'},
 wide:{l:'Count every caregiver and overheard talk',s:'Sperry et al.',rec:'obs',gd:0,lvl:'honors',
  recT:'Home observations in five communities',cntT:'Every caregiver, plus talk the child overhears',grT:'42 children, ages 18 to 48 months',
  cite:'Sperry, Sperry & Miller 2019'}
};
const ORDER=['hr','lena2','bb','lena','wide'];
const M=1e6;
const des=sim=>D[sim.p.design]||D.hr;
const wake=sim=>atLeast('honors')?sim.p.wake:14;
const yrs=sim=>atLeast('honors')?sim.p.years:4;
const boost=sim=>atLeast('ap')?sim.p.boost/100:0;
const cv=sim=>atLeast('ap')?sim.p.cv/100:0.4;
/* hours one observed hour stands for, per day, after the observer-effect correction */
function scale(sim,d){d=d||des(sim);return d.rec==='hour'?wake(sim)*(1-boost(sim)):1;}
function perDay(sim,d){d=d||des(sim);if(d.gd!=null)return d.gd;return (d.A-d.B)*scale(sim,d);}
const gapW=(sim,d)=>perDay(sim,d)*365*yrs(sim);
const gapM=(sim,d)=>gapW(sim,d)/M;
function marginM(sim,d){d=d||des(sim);if(d.A==null)return null;const n=sim.p.n,c=cv(sim);const se=Math.sqrt((c*d.A)**2/n+(c*d.B)**2/n);return 1.96*se*scale(sim,d)*365*yrs(sim)/M;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const f1=v=>fmtNum(v,1),n0=v=>Math.round(v).toLocaleString('en-US');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const visible=()=>ORDER.filter(k=>!D[k].lvl||atLeast(D[k].lvl));
function chain(sim){const d=des(sim),y=yrs(sim);
 if(d.rec==='hour'){const b=boost(sim);return [`(${n0(d.A)} − ${n0(d.B)}) words an hour`,`× ${f1(wake(sim))} h a day`+(b?` × ${(1-b).toFixed(2)}`:''),`× 365 days × ${y} years`];}
 if(d.gd===0)return ['Every caregiver and overheard talk count: the researchers report no gap'];
 return [d.A!=null?`(${n0(d.A)} − ${n0(d.B)}) words a day`:`${n0(d.gd)} words a day apart`,'(the recorder covers the day)',`× 365 days × ${y} years`];}
function wrap(ctx,s,maxW,size,w){ctx.font=(w||400)+' '+size+'px '+FONT;const out=[];let line='';s.split(' ').forEach(word=>{const t=line?line+' '+word:word;if(ctx.measureText(t).width>maxW&&line){out.push(line);line=word;}else line=t;});if(line)out.push(line);return out;}

/* What this number hides, per design. Every figure is from the studies cited in about. */
const HIDE={
 hr:['<b>6 families.</b> Every low-income family in the headline is represented by Hart and Risley’s 6 welfare families. Families inside each group differed, and that spread is averaged away.','<b>About 31 hours a family.</b> 1,318 one-hour observations across 42 families is about 31 hours each, standing in for 14 × 365 × 4 = 20,440 waking hours: about 0.15% of the time the headline describes.','<b>Year 4 was never recorded.</b> Observations stopped at age 3, so the last quarter of the headline is extrapolation.'],
 bb:['<b>Two studies, two cities.</b> This comparison mixes Hart and Risley’s professional families with families from a different study and community.','<b>Main caregivers only.</b> It still leaves out grandparents, siblings and neighbors who talk with the child, which is talk Sperry and colleagues argue should count.'],
 lena:['<b>Three groups become one.</b> 245 mothers without a degree are pooled, though their groups averaged 11,358, 12,239 and 11,969 words a day.','<b>Overlap.</b> The top half of the least-educated group averaged 451 conversational turns a day, more than the bottom half of the most-educated group (334). A group average hides those families.','<b>Who the words were for.</b> The recorder counts adult words near the child; it cannot tell talk to the child from talk between adults.'],
 lena2:['<b>The middle 96%.</b> Comparing the top 2% with the bottom 2% of 329 families uses about 13 homes and leaves the other 316 out entirely.'],
 wide:['<b>All words count the same.</b> A gap of 0 hides differences in who the talk was aimed at. Golinkoff and colleagues argue that directed talk matters most for learning, so this number and the 31.4 million each hide what the other one counts.']};
const ALLHIDE='<b>What no word count measures.</b> Gestures, pointing, songs, stories in a home language, warmth, patience, and whether a child got an answer all fall outside a tally of words.';
const SIM={
 id:'wordgap',hash:'wordgap',apUnit:21,order:2,tab:'The 30 million word gap',kind:'Simulation',
 card:'Guess the famous gap in words heard by age 4, then redesign the study and watch the number grow, shrink or vanish.',
 title:'The 30 million word gap: measuring a childhood',
 lede:{bio:'In 1995, two researchers recorded one hour a month in 42 homes and turned it into a headline: by age 4, children in poorer families hear 30 million fewer words. How much of that number comes from the families, and how much from the way it was measured?',
  honors:'A headline built by multiplying is only as good as each factor. Change the recording, the counting rule, the families compared or the waking hours, and the same kind of study gives anything from 0 to 30 million.',
  ap:'Headline = (words-per-hour gap) × hours a day × 365 × years. Its error has two parts: bias from the design and the extrapolation, and sampling error that shrinks like 1/√n.'},
 scale:'Two groups of families, compared by the average number of words a young child hears. The headline is in millions of words by age 4.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your study design',
 controls:[
  {id:'guess',label:'Your gut: the gap by age 4',type:'range',min:0,max:45,step:0.5,def:15,unit:' million words'},
  {id:'design',label:'Recording and counting rule',type:'select',def:'hr',noGut:true,onChange:clearGut,options:ORDER.map(k=>({v:k,l:D[k].l,lvl:D[k].lvl})),help:'Each choice is a real study’s design, with that study’s published averages.'},
  {id:'n',label:'Families in each group of your study',type:'seg',def:6,noGut:true,onChange:clearGut,options:[{v:6,l:'6'},{v:13,l:'13'},{v:50,l:'50'},{v:150,l:'150'}],help:'Hart & Risley’s smallest group had 6 families. Fewer families means a wider give-or-take.'},
  {id:'wake',label:'Waking hours a day that one observed hour stands for',type:'range',min:8,max:14,step:0.5,def:14,unit:' h',lvl:'honors',noGut:true,onChange:clearGut,help:'Hart & Risley assumed a 14-hour waking day. Naps, car rides and quiet time make a typical hour quieter than an observed one.'},
  {id:'years',label:'Years of childhood you add up',type:'seg',def:4,lvl:'honors',noGut:true,onChange:clearGut,options:[{v:3,l:'3 years (as far as they observed)'},{v:4,l:'4 years (the headline)'}]},
  {id:'boost',label:'Observer effect: families talk more while watched',type:'range',min:0,max:30,step:1,def:0,unit:'%',lvl:'ap',noGut:true,onChange:clearGut,help:'An assumption you set. One city program cut its first recordings by 15% for this reason.'},
  {id:'cv',label:'How much families differ inside a group (spread ÷ average)',type:'range',min:20,max:80,step:5,def:40,unit:'%',lvl:'ap',noGut:true,onChange:clearGut,help:'An assumption for illustration. Real studies report wide differences inside every income group.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'gap',label:'Measured gap by age 4',unit:'million words',d:1,min:0,max:45,get:sim=>gapM(sim)},
  {id:'perday',label:'Gap per day',unit:'words',d:0,min:0,max:25000,get:sim=>perDay(sim)},
  {id:'moe',label:'Give or take (95%)',unit:'million words',d:1,min:0,max:30,get:sim=>marginM(sim)},
  {id:'ratio',label:'Higher group hears this many times as many words',unit:'×',d:2,lvl:'honors',min:0,max:5,get:sim=>{const d=des(sim);return d.A!=null?d.A/d.B:null;}},
  {id:'hours',label:'Hours of talk the headline assumes per year',unit:'h',d:0,lvl:'ap',min:0,max:6000,get:sim=>des(sim).rec==='hour'?wake(sim)*365:null},
  {id:'off',label:'Your gut is off by',unit:'million words',d:1,min:0,max:45,get:sim=>{const G=GS(sim);return G&&G.g?Math.abs(G.g.guess-gapM(sim)):null;}},
  {id:'turns',label:'Conversational turns',text:true,lvl:'honors',get:()=>'All-day recordings: about 441 back-and-forth turns a day on average. Children of the most educated mothers had over 50% more turns than the least educated group, but the top half of that group (451 a day) out-talked the bottom half of the most educated group (334). Gilkerson et al. 2017.'},
  {id:'formula',label:'The arithmetic',text:true,lvl:'ap',get:sim=>{const d=des(sim),m=marginM(sim);return chain(sim).join(' ')+` = ${f1(gapM(sim))} million words`+(m!=null?`. Margin = 1.96 × √((${cv(sim).toFixed(2)}·${n0(d.A)})²/${sim.p.n} + (${cv(sim).toFixed(2)}·${n0(d.B)})²/${sim.p.n})`+(d.rec==='hour'?' words an hour':' words a day')+`, scaled the same way = ±${f1(m)} million.`:'. No group averages are given, so no margin is computed.');}}
 ],
 draw(sim,ctx,vdt,k){const d=des(sim),big=k>1.3,G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* panel 1: the design */
  ctx.fillStyle=PAL['cv-bg2'];rr(ctx,12,10,380,186,10);ctx.fill();
  txt(ctx,'Your study design',26,34*Math.min(k,1.2),{s:14*k,w:700,c:PAL['cv-ink']});
  const rows=big?[[d.s,1],[d.recT,0]]:[[d.s+' ('+d.cite.replace(/^.*?(\d{4})$/,'$1')+')',1],[d.recT,0],[d.cntT,0],[d.grT,0]];
  let yy=34*Math.min(k,1.2)+22*k;
  rows.forEach(([s,b])=>{wrap(ctx,s,350,(b?13:12)*k,b?700:400).slice(0,2).forEach(l=>{if(yy<190)txt(ctx,l,26,yy,{s:(b?13:12)*k,w:b?700:400,c:b?PAL['cv-ink']:PAL['cv-soft']});yy+=17*k;});yy+=2*k;});
  /* panel 2: what each group heard */
  ctx.fillStyle=PAL['cv-bg2'];rr(ctx,408,10,380,186,10);ctx.fill();
  const per=d.rec==='hour'?' an hour':d.rec==='day'?' a day':'';
  txt(ctx,big?'Words heard'+per:'What each group heard'+(per?','+per:''),422,34*Math.min(k,1.2),{s:14*k,w:700,c:PAL['cv-ink']});
  if(d.A!=null){const mx=d.rec==='hour'?2400:16000,bw=v=>clamp(v/mx,0,1)*(big?200:240);
   [[d.A,'Higher-income',PAL['s2']],[d.B,'Lower-income',PAL['s4']]].forEach(([v,lab,col],i)=>{const by=78+i*58*Math.min(k,1.25);
    txt(ctx,lab,422,by-6,{s:12*k,c:PAL['cv-soft']});ctx.fillStyle=col;rr(ctx,422,by,Math.max(4,bw(v)),20,5);ctx.fill();
    txt(ctx,n0(v),428+bw(v)+6,by+15,{s:13*k,w:700,c:PAL['cv-ink']});});}
  else{wrap(ctx,d.gd===0?'Once every caregiver and overheard talk count, the researchers report no gap at all in their communities. They give no per-hour totals to draw.':'The study reports only the difference between these two small groups: about 20,500 words a day.',350,12*k).slice(0,big?4:5).forEach((l,i)=>txt(ctx,l,422,70+i*17*k,{s:12*k,c:PAL['cv-soft']}));}
  /* the arithmetic */
  const ch=chain(sim),cy=222;
  if(big){txt(ctx,'= '+f1(gapM(sim))+' million words by age '+yrs(sim),20,cy,{s:15*k,w:700,c:PAL['rj']});}
  else{ctx.font='600 '+(13*k)+'px '+FONT;let x=20;ch.forEach(s=>{txt(ctx,s,x,cy,{s:13*k,w:600,c:PAL['cv-ink']});x+=ctx.measureText(s).width+10;});
   const res=`= ${f1(gapM(sim))} million words`;if(x+ctx.measureText(res).width+30<790)pill(ctx,res,x+ctx.measureText(res).width/2+18,cy-5,PAL['rj'],'#fff',13*k);else txt(ctx,res,20,cy+20*k,{s:13*k,w:700,c:PAL['rj']});}
  /* number line */
  const L=50,R=770,ly=big?372:362,X=v=>L+clamp(v,0,45)/45*(R-L);
  txt(ctx,big?'Same question, different designs':'Same question, different designs: the gap by age '+yrs(sim)+', in millions of words',20,big?262:268,{s:13*k,w:700,c:PAL['cv-ink']});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L,ly);ctx.lineTo(R,ly);ctx.stroke();
  for(let v=0;v<=45;v+=(big?15:5)){ctx.beginPath();ctx.moveTo(X(v),ly-4);ctx.lineTo(X(v),ly+4);ctx.stroke();txt(ctx,String(v),X(v),ly+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  /* margin whisker for the current design */
  const m=marginM(sim),gv=gapM(sim);
  if(m!=null){ctx.strokeStyle=PAL['rj'];ctx.globalAlpha=.35;ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(X(gv-m),ly);ctx.lineTo(X(gv+m),ly);ctx.stroke();ctx.globalAlpha=1;
   ctx.lineWidth=2;[gv-m,gv+m].forEach(v=>{if(v>=0&&v<=45){ctx.beginPath();ctx.moveTo(X(v),ly-9);ctx.lineTo(X(v),ly+9);ctx.stroke();}});}
  /* markers with lane-packed labels above the line */
  const lanes=[],lh=17*k,labs=[];
  const marks=visible().map(key=>({key,v:gapM(sim,D[key]),cur:key===sim.p.design}));
  marks.sort((a,b)=>(b.cur-a.cur)||a.v-b.v);
  marks.forEach(mk=>{const lab=mk.cur?(big?f1(mk.v):D[mk.key].s+': '+f1(mk.v)):(big?'':D[mk.key].s);
   ctx.fillStyle=mk.cur?PAL['rj']:PAL['cv-soft'];ctx.beginPath();ctx.arc(X(mk.v),ly,mk.cur?8:5,0,7);ctx.fill();
   if(!lab)return;ctx.font=(mk.cur?700:400)+' '+(12*k)+'px '+FONT;const w=ctx.measureText(lab).width;let x0=clamp(X(mk.v)-w/2,4,796-w);
   let lane=0;while(lane<4&&(lanes[lane]||[]).some(([a,b])=>x0<b+8&&x0+w>a-8))lane++;if(lane>=4)return;(lanes[lane]=lanes[lane]||[]).push([x0,x0+w]);
   const ty=ly-14-lane*lh;if(lane>0){ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X(mk.v),ly-8);ctx.lineTo(X(mk.v),ty+3);ctx.stroke();}
   labs.push([lab,x0,ty,w,mk.cur]);});
  labs.forEach(([lab,x0,ty,w,cur])=>{ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x0-2,ty-12*k,w+4,15*k);txt(ctx,lab,x0,ty,{s:12*k,w:cur?700:400,c:cur?PAL['rj']:PAL['cv-soft']});});
  /* gut marker below the line */
  if(G&&G.g){const gx=X(G.g.guess);ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(gx,ly+6);ctx.lineTo(gx-8,ly+20);ctx.lineTo(gx+8,ly+20);ctx.closePath();ctx.fill();
   const gl=(big?'Gut ':'Your gut: ')+f1(G.g.guess);ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(gl).width;txt(ctx,gl,clamp(gx-w/2,4,796-w),ly+38*k,{s:12*k,w:700,c:PAL['s4']});}
  if(m!=null&&!big)txt(ctx,`Shaded: give or take ${f1(m)} million with ${sim.p.n} families a group`,20,442,{s:12*k,c:PAL['cv-soft']});
  else if(m==null&&!big)txt(ctx,'No give-or-take shown: this study does not report both group averages.',20,442,{s:12*k,c:PAL['cv-soft']});},
 infoPanel(sim){const h=HIDE[sim.p.design]||HIDE.hr;return '<h3>What this number hides</h3><p>Math helps us see a pattern, and every number also leaves some families and experiences out of view. For <b>'+des(sim).s+'</b>:</p><ul>'+h.map(x=>'<li>'+x+'</li>').join('')+'<li>'+ALLHIDE+'</li></ul>';},
 narrate(sim){const d=des(sim),g=gapM(sim),m=marginM(sim),pd=perDay(sim);
  if(d.gd===0)return `<b>Count every caregiver and the talk a child overhears, and the gap disappears</b> in Sperry, Sperry and Miller’s five communities. Other researchers answer that words spoken <i>to</i> a child matter most for learning, so the counting rule is the argument.`;
  if(sim.p.design==='lena2')return `All-day recordings put the 30 million gap back, but only between the top 2% and bottom 2% of 329 families: about 7 families each. <b>Pick the extremes and you can make almost any gap look big.</b>`;
  if(d.rec==='day')return `A recorder worn all day finds a gap of about ${n0(pd)} words a day, or ${f1(g)} million by age ${yrs(sim)}${m!=null?`, give or take ${f1(m)} million with ${sim.p.n} families a group`:''}. <b>No one has to guess how a single hour stands for a whole day.</b>`;
  if(sim.p.design==='bb')return `Same counting rule as Hart and Risley, but a different low-income community: ${n0(d.B)} words an hour instead of ${n0(616)}. <b>The gap shrinks to ${f1(g)} million</b>, so income alone does not predict how much families talk.`;
  return `One observed hour becomes ${f1(wake(sim)*(1-boost(sim)))} hours a day, every day, for ${yrs(sim)} years: ${f1(g)} million words${m!=null?`, give or take ${f1(m)} million with ${sim.p.n} families a group`:''}. <b>Every factor in that product is a design choice.</b>`;},
 gut:{better:'lower',controls:['guess'],lockLabel:'Lock in my guess',
  ask:{bio:'Look at the study design on the picture (Hart and Risley’s, to start). Drag the slider here to how many <b>more</b> words, in millions, you think a child in the higher-income group hears by age 4 under that design. Then lock it in.',
   honors:'Under the design shown, drag the slider here to your gut size of the gap by age 4, in millions of words. Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-gapM(sim)),guess:sim.p.guess,label:`${f1(sim.p.guess)} million words`};},
  solve(sim){const g=gapM(sim);sim.p.guess=g;return {v:0,guess:g,label:`${f1(g)} million words`};},
  how:{bio:'Multiply it out: the difference in words per hour, times the waking hours that one hour stands for, times 365 days, times 4 years. Then ask how much each of those choices could be off.',
   honors:'The headline is a product of a measured rate and three extrapolation factors. Each factor scales the answer by the same percent it changes, and the measured rate depends on what you count and which families you compare.',
   ap:'Gap = (Ā − B̄)·h·365·y. Bias comes from the design (who counts, observer effect, extrapolation); sampling error is 1.96·√(s_A²/n + s_B²/n), scaled by h·365·y.'},
  compare(sim,g,m){const yr=yrs(sim),off=Math.abs(g.guess-m.guess),day=off*M/(365*yr),cur=sim.p.design;
   const others=visible().filter(k=>k!==cur).map(k=>`${D[k].s}: ${f1(gapM(sim,D[k]))} million`).join('; ');
   const mm=marginM(sim),mtxt=mm!=null?` With ${sim.p.n} families in each group, the honest answer is ${f1(m.guess)} ± ${f1(mm)} million.`:'';
   const head=off<1?`Your gut was right on: within ${f1(off)} million words of what this design measures (${f1(m.guess)} million).`:`Your gut was off by <b>${f1(off)} million words</b>, about <b>${n0(day)} words a day</b> for ${yr} years. This design measures ${f1(m.guess)} million.`;
   return head+mtxt+` But look what the design does to the same question. ${others}. <b>The choices behind a number can matter more than a good guess.</b><br><b>What this number hides:</b> ${(HIDE[cur]||HIDE.hr)[0]}`;},
  again(sim){const v=visible();sim.p.design=v[Math.floor(Math.random()*v.length)];sim.p.n=[6,13,50,150][Math.floor(Math.random()*4)];
   if(atLeast('honors')){sim.p.wake=[10,12,14][Math.floor(Math.random()*3)];sim.p.years=Math.random()<0.5?3:4;}sim.p.guess=15;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Hart and Risley turned one observed hour into a 14-hour waking day. If a typical toddler day really has only 10 hours like the observed one, what happens to the 31.4 million headline?',choices:['It stays the same: the families did not change','It drops to about 22.4 million','It drops to about 3 million'],correct:1,explain:'The headline is a product, so it scales with each factor: 31.4 × 10/14 ≈ 22.4 million. A 29% smaller factor gives a 29% smaller headline.'},
  {lvl:'bio',instant:true,q:'Your study has only 6 families in a group, like Hart and Risley’s smallest group. Why is the give-or-take so wide?',choices:['Small groups always give the wrong answer','With so few families, one or two unusually chatty or quiet homes can swing the group average a lot','Families talk less when there are fewer of them'],correct:1,explain:'Sampling error shrinks like 1/√n. Going from 6 to 150 families a group cuts the margin by a factor of √25 = 5, from about ±14.7 million to about ±2.9 million here.'},
  {lvl:'bio',instant:true,q:'A recorder worn all day found that children of college-educated mothers heard about 2,873 more adult words a day. About how big is that gap by age 4?',choices:['About 30 million','About 4.2 million','About 1 million'],correct:1,explain:'2,873 × 365 × 4 ≈ 4.2 million. The all-day study found a real gap, but about one seventh the size of the famous headline.'},
  {lvl:'bio',instant:true,q:'The 31.4 million headline treats Hart and Risley’s 6 welfare families as the low-income group. What does that one number hide?',choices:['Nothing: an average covers everyone in the group','How much low-income families differ from one another, and every family who was not among the six','The arithmetic used to build it'],correct:1,explain:'An average of 6 families stands in for millions of families. Within-group differences, and families who were never recorded, disappear from view. Sperry and colleagues later found a low-income community that averaged 1,838 words an hour, three times the 616 in the headline.'},
  {lvl:'honors',instant:true,q:'Sperry, Sperry and Miller counted the Hart and Risley way in a low-income Black Belt community and found 1,838 words an hour, not 616. What does that show?',choices:['Hart and Risley made an arithmetic mistake','Income alone does not predict how much families talk: communities with similar incomes can differ a lot','Low-income families always talk more'],correct:1,explain:'With the same counting rule, the gap against Hart and Risley’s professional families shrinks from 31.4 to about 6.4 million. Six welfare families could not stand for every low-income family.'},
  {lvl:'honors',instant:true,q:'All-day recordings found the 30 million gap only between the top 2% and bottom 2% of 329 families. Why is that a weak basis for a national headline?',choices:['2% of 329 is about 7 families per group, and choosing the extremes makes any gap look biggest','The recorder breaks for the top families','It is a strong basis, since it matches Hart and Risley'],correct:0,explain:'0.02 × 329 ≈ 6.6 families. Comparing the most extreme families answers a different question from comparing typical families in two income groups.'},
  {lvl:'honors',instant:true,q:'Romeo and colleagues recorded 36 children aged 4 to 6 and scanned their brains while they listened to a story. What predicted activity in Broca’s area, a language region, best?',choices:['The total number of adult words the child heard','Conversational turns: back-and-forth exchanges between the child and an adult','Family income alone'],correct:1,explain:'Turns tracked brain activity even after accounting for family income and education, and far better than the raw word count. What matters most is talking with a child, not just near one.'},
  {lvl:'ap',instant:true,q:'Three factors in the headline (waking hours, days counted, and how typical the observed hour is) are each 10% too high. By how much is the headline too high?',choices:['10%','30%','About 33%'],correct:2,explain:'Errors multiply in a product: 1.1 × 1.1 × 1.1 = 1.331, so the headline is about 33% too high. Small errors in several factors compound.'},
  {lvl:'ap',instant:true,q:'Keep the Hart and Risley design but assume families talked 15% more while observed, as one city program assumed for its first recordings. What is the new 4-year gap?',choices:['About 26.7 million','About 31.4 million','About 4.7 million'],correct:0,explain:'Multiply by (1 − 0.15): 31.4 × 0.85 ≈ 26.7 million. A bias moves the whole answer; a bigger sample would not fix it.'},
  {lvl:'ap',instant:true,q:'To halve the sampling margin of a study with 13 families a group, how many families a group do you need?',choices:['26','52','169'],correct:1,explain:'The margin is proportional to 1/√n, so halving it needs 4 times as many families: 4 × 13 = 52.'}
 ],
 tour:[
  {title:'The famous study',text:'In 1995 Hart and Risley recorded one hour a month in 42 homes, from when children were about 7 to 9 months old until age 3. Professional parents said about 2,153 words an hour to their child; welfare parents said about 616.',pause:true,setup:sim=>BioLab.setValues(sim,{design:'hr',n:6,wake:14,years:4,boost:0,cv:40}),focus:[[12,10,380,186],[408,10,380,186]]},
  {title:'From one hour to a childhood',text:'To get a headline, they multiplied: the 1,537-word hourly difference, times 14 waking hours, times 365 days, times 4 years. That is about 31.4 million words. Hart and Risley rounded to a 100-hour week and got about 32 million.',pause:true,focus:[0,196,800,44]},
  {title:'Small groups wobble',text:'Their welfare group had only 6 families. If families inside a group differ by about 40% (an assumption), the honest answer is 31.4 million give or take about 14.7 million. With 150 families a group, the margin drops to about 2.9 million.',pause:true,setup:sim=>BioLab.setValues(sim,{n:6}),focus:[0,250,800,200]},
  {title:'Record the whole day',text:'In 2017 a team put small recorders on 329 children for 12-hour days. Children of college-educated mothers heard about 2,873 more adult words a day: about 4.2 million by age 4. A real gap, but far smaller.',pause:true,setup:sim=>BioLab.setValues(sim,{design:'lena',n:150})},
  {lvl:'honors',title:'Who counts as a speaker?',text:'Sperry, Sperry and Miller counted every caregiver and the talk children overhear, in five communities. They report that the gap disappears. Their critics answer that words spoken directly to a child matter most. Both sides agree talk matters; they disagree about what to count.',pause:true,setup:sim=>BioLab.setValues(sim,{design:'wide'})},
  {lvl:'honors',title:'Which families you compare',text:'The same all-day data give about 29.9 million, but only between the top 2% and bottom 2% of families, about 7 homes each. Choosing extreme groups makes a gap look biggest.',pause:true,setup:sim=>BioLab.setValues(sim,{design:'lena2'})},
  {title:'Talk with, not just near',text:'A 2018 brain-imaging study of 36 children found that back-and-forth conversational turns tracked language skills and brain activity better than word counts. The lesson for any family, rich or poor: talk with children, and let them answer.',pause:true,setup:sim=>BioLab.setValues(sim,{design:'hr',n:6})}
 ],
 lab:{bio:'<p><b>Question:</b> Which design choice moves the headline most?</p><ol><li>Start at Hart and Risley with 6 families. Record a trial.</li><li>Change only the families per group to 13, 50 and 150. Record each.</li><li>Switch to the all-day recorder and repeat.</li></ol><p>Write one sentence: which changes the gap itself, and which only changes the give-or-take?</p>',
  honors:'<p><b>Question:</b> How sensitive is the headline to each assumption?</p><ol><li>At Hart and Risley, record the gap at 14, 12 and 10 waking hours.</li><li>Return to 14 hours and switch years from 4 to 3.</li><li>Try every design at 4 years.</li></ol><p>Rank the choices by how much they move the gap, and explain why the hours and years each change it by the same percent.</p>',
  ap:'<p><b>Question:</b> Can a bigger sample fix a biased design?</p><ol><li>Set an observer effect of 15% and record the gap with 6 and with 150 families.</li><li>Raise the spread between families from 40% to 80% and repeat.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning that separates bias (moves the center) from sampling error (moves the width).</p>'},
 terms:[
  {t:'Extrapolation',d:'Stretching a measurement beyond what was observed: here, from one hour a month to every waking hour for four years.'},
  {t:'Sample size (n)',d:'How many families are in each group. Small samples give averages that bounce around a lot.'},
  {t:'Margin of error',d:'The give-or-take around an estimate. At 95%, about 95 of every 100 studies run this way would land within it.'},
  {t:'Replication',d:'Running a study again, often with new families or methods, to see whether the result holds up.'},
  {t:'Conversational turn',d:'One back-and-forth exchange: the adult speaks and the child answers, or the other way around.',lvl:'honors'},
  {t:'Bias',d:'A design flaw that pushes every estimate the same way, such as families talking more while a researcher watches. More data does not remove it.',lvl:'honors'},
  {t:'Operational definition',d:'The exact rule for what gets counted. “Words a child hears” can mean words said to the child, or every word in earshot.',lvl:'honors'},
  {t:'Standard error',d:'The typical size of sampling error: s/√n for one mean, √(s_A²/n_A + s_B²/n_B) for a difference of two means.',lvl:'ap'}
 ],
 about:'<p><b>What each design uses (all published figures):</b></p><ul>'+
  '<li><b>Hart &amp; Risley (1995),</b> <i>Meaningful Differences in the Everyday Experience of Young American Children</i>; summarized in Hart &amp; Risley, “The Early Catastrophe,” <i>American Educator</i>, Spring 2003 (<a href="https://www.aft.org/periodical/american-educator/spring-2003/early-catastrophe" target="_blank" rel="noopener">aft.org</a>). 42 families (13 professional, 23 working-class, 6 welfare), observed one hour a month from about 7 to 9 months until age 3. Words heard per hour: 2,153, 1,251 and 616. Their extrapolation used a 100-hour week (a 14-hour waking day), 5,200 hours a year, for 4 years: about 45, 26 and 13 million words.</li>'+
  '<li><b>Gilkerson et al. (2017),</b> “Mapping the Early Language Environment Using All-Day Recordings and Automated Analysis,” <i>American Journal of Speech-Language Pathology</i> (<a href="https://pubs.asha.org/doi/10.1044/2016_AJSLP-15-0169" target="_blank" rel="noopener">pubs.asha.org</a>). 329 families, children 2 to 48 months, 3,213 recordings of 12 hours. Adult words a day: 14,848 for college-degree mothers (84) vs. 11,358, 12,239 and 11,969 for the other groups (combined mean 11,975, 245 mothers). The authors call this about a four-million-word gap by age 4, and find a 30-million-scale gap only between the top and bottom 2% of families (about 20,500 words a day). Conversational turns averaged about 441 a day.</li>'+
  '<li><b>Sperry, Sperry &amp; Miller (2019),</b> “Reexamining the Verbal Environments of Children From Different Socioeconomic Backgrounds,” <i>Child Development</i> 90(4), 1303 to 1318 (<a href="https://doi.org/10.1111/cdev.13072" target="_blank" rel="noopener">doi.org/10.1111/cdev.13072</a>). 42 children aged 18 to 48 months in five communities. They did not replicate the gap; counting all caregivers and bystander talk, they report it disappears. Black Belt primary caregivers directed 1,838 words an hour to children (from the authors’ reply, <i>Child Development</i>, 2018).</li>'+
  '<li><b>Golinkoff, Hoff, Rowe, Tamis-LeMonda &amp; Hirsh-Pasek (2019),</b> “Language Matters: Denying the Existence of the 30-Million-Word Gap Has Serious Consequences,” <i>Child Development</i> 90(3), 985 to 992 (<a href="https://doi.org/10.1111/cdev.13128" target="_blank" rel="noopener">doi.org/10.1111/cdev.13128</a>). They argue speech directed to children, not overheard speech, drives learning, and that dismissing the gap could cause harm.</li>'+
  '<li><b>Romeo et al. (2018),</b> “Beyond the 30-Million-Word Gap,” <i>Psychological Science</i> 29(5), 700 to 710 (<a href="https://doi.org/10.1177/0956797617742725" target="_blank" rel="noopener">doi.org/10.1177/0956797617742725</a>). 36 children aged 4 to 6; conversational turns, not word counts, were linked to Broca’s-area activity, independent of SES.</li></ul>'+
  '<p><b>The model.</b> Gap = (words-per-hour difference) × waking hours × 365 × years for the one-hour designs, and (words-per-day difference) × 365 × years for the all-day designs. Using 365 days gives 31.4 million for Hart and Risley; their 5,200-hour year gives 32.0 million. Comparing Hart and Risley’s professional families with Sperry’s Black Belt families mixes two studies, as Sperry and colleagues did in their reply. The Sperry design is shown as a gap of 0 because the authors report that it disappears; they do not give per-hour totals here.</p>'+
  '<p><b>Assumptions for illustration (not measured):</b> the give-or-take uses a spread between families of 40% of each group’s average (you can change it at Deep dive), so it shows how sample size works, not any study’s real margin. The observer effect is a knob you set. The 15% figure comes from the Providence Talks evaluation, which cut its first recordings by 15% for a possible Hawthorne effect (Wong, Thomas &amp; Boben, <i>Studies in Educational Evaluation</i> 64, 2020).</p>'+
  '<p><b>Why it matters for policy.</b> Providence, Rhode Island, won the $5 million grand prize in the 2013 Mayors Challenge from Bloomberg Philanthropies and built Providence Talks: coaches and word-counting recorders for families (<a href="https://bloombergcities.jhu.edu/news/new-evidence-helps-more-cities-adopt-providence-talks-model" target="_blank" rel="noopener">Bloomberg Cities, 2018</a>). Its evaluation used a comparison group from nearby cities, not a randomized one. Children who started below the 50th percentile in adult words rose from the 11th to the 42nd percentile with home visits, but the comparison group’s low starters also rose, from the 11th to the 35th: a pattern regression to the mean can produce (<a href="https://education.brown.edu/sites/g/files/dprerj366/files/2020-08/Wong_Thomas_Boben_Prov%20Talks_Ed%20Eval.pdf" target="_blank" rel="noopener">Wong et al. 2020</a>). The “Talking is Teaching: Talk, Read, Sing” campaign from Too Small to Fail works with pediatricians and has been adopted in more than a dozen U.S. communities (<a href="https://www.clintonfoundation.org/?p=4120" target="_blank" rel="noopener">program announcement</a>). Replication matters before a city scales a program, because a headline that shrinks more than sevenfold under a better design changes what a program should promise.</p>'+
  '<p><b>A note on respect.</b> The research is about the value of talking with young children, which any family can do. It is not a verdict on any family’s love or worth, and every income group in these studies includes families who talk a great deal.</p>'
};
BioLab.register(SIM);
})();
