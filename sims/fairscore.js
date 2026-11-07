(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Two groups of students. Each student has a risk score s (whole percent bins, s = 0.5%, 1.5%, ..., 99.5%).
   The score is calibrated in both groups: P(struggle | s) = s. Scores in group g follow a Beta shape with mean b_g
   (concentration 6), so the group's base rate is about b_g. A student is flagged when s >= the group's cutoff. */
const K=6;
const cache={};
function dist(b){const key=b.toFixed(3);if(cache[key])return cache[key];const a=b*K,be=(1-b)*K,m=[];let S=0;
 for(let i=0;i<100;i++){const s=(i+0.5)/100,v=Math.exp((a-1)*Math.log(s)+(be-1)*Math.log(1-s));m.push(v);S+=v;}return cache[key]=m.map(v=>v/S);}
function stats(b,t){const m=dist(b);let P=0,N=0,FP=0,FN=0,TP=0,fl=0;
 for(let i=0;i<100;i++){const s=(i+0.5)/100,f=i>=t;P+=m[i]*s;N+=m[i]*(1-s);if(f){FP+=m[i]*(1-s);TP+=m[i]*s;fl+=m[i];}else FN+=m[i]*s;}
 return {base:P,fpr:FP/N,fnr:FN/P,ppv:fl>1e-9?TP/fl:null,flag:fl};}
const tAof=sim=>atLeast('honors')?sim.p.tA:30;
const bAof=sim=>(atLeast('honors')?sim.p.bA:15)/100,bBof=sim=>(atLeast('honors')?sim.p.bB:35)/100;
const SA=sim=>stats(bAof(sim),tAof(sim)),SB=(sim,t)=>stats(bBof(sim),t===undefined?sim.p.tB:t);
const gapOf=(a,b)=>100*(Math.abs(a.fpr-b.fpr)+Math.abs(a.fnr-b.fnr));
const gapNow=sim=>gapOf(SA(sim),SB(sim));
function bestB(sim){const a=SA(sim);let best=null;for(let t=5;t<=95;t++){const g=gapOf(a,SB(sim,t));if(!best||g<best.g-1e-12)best={t,g};}return best;}
function matchB(sim,key){const a=SA(sim);let best=null;for(let t=5;t<=95;t++){const b=SB(sim,t);if(b[key]===null||a[key]===null)continue;const d=Math.abs(b[key]-a[key]);if(!best||d<best.d-1e-12)best={t,d};}return best?best.t:sim.p.tB;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* While the student works out Group B's false positive rate ("Your turn"), the rates stay hidden. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g))&&!pend(sim);
/* whole-student counts out of 1,000 in a group: fine, struggling, fine but flagged, struggling but missed, flagged, flagged who struggle */
function counts(S,n){n=n||1000;const fine=Math.round(n*(1-S.base)),str=n-fine,fp=Math.round(n*S.fpr*(1-S.base)),fn=Math.round(n*S.fnr*S.base),fl=Math.round(n*S.flag),tp=S.ppv===null?0:Math.round(n*S.ppv*S.flag);return {fine,str,fp,fn,fl,tp};}
const cm=v=>v.toLocaleString('en-US');
const calcAns=sim=>{const c=counts(SB(sim));return Math.round(1000*c.fp/c.fine)/10;};
const p1=v=>(100*v).toFixed(1)+'%',p0=v=>Math.round(100*v)+'%';
const per=v=>Math.round(1000*v);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const COL={A:'s2',B:'s5',bad:'s4',ok:'s6'};

const SIM={
 id:'fairscore',hash:'fairscore',apUnit:19,order:9,tab:'Can a score be fair to everyone?',kind:'Simulation',
 skills:{bio:'Conditional probability from a two-way table: false positive rate = P(flagged | fine) · Statistics (Ch. 5), AP Statistics (Unit 4)',honors:'Conditional probability: false positive rate, false negative rate and PPV · Statistics (Ch. 5), AP Statistics (Unit 4)',ap:'Conditional probability and the impossibility theorem for risk scores · Statistics (Ch. 5), AP Statistics (Unit 4)'},
 card:'Move one group’s cutoff to treat two groups the same, then watch the math show what you had to give up.',
 title:'Can a risk score be fair to everyone?',
 lede:{bio:'Your school uses a risk score to flag students who might fail a class, and flagged students must go to after-school study hall. The score is equally accurate for two groups of students. Can the flags still be unfair?',
  honors:'The score is calibrated: a 30% score means a 30% chance of struggling in either group. But when the groups have different base rates, one cutoff gives them different false positive and false negative rates. Moving a cutoff fixes one kind of fairness by breaking another.',
  ap:'Chouldechova (2017): for any flag, FPR = [b/(1 − b)]·[(1 − PPV)/PPV]·(1 − FNR). If the base rates b differ, you cannot have equal PPV, equal FPR and equal FNR all at once, unless the score is perfect.'},
 scale:'Two groups of students, pictured as 1,000 each. Risk scores run from 0% to 100%. Every number here is an illustration, not data from a real school.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The flag',
 controls:[
  {id:'tB',label:'Group B’s cutoff: flag students at this risk score or higher',type:'range',min:5,max:95,step:1,def:30,unit:'%'},
  {id:'tA',label:'Group A’s cutoff',type:'range',min:5,max:95,step:1,def:30,unit:'%',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'bA',label:'Group A: share of students who would struggle',type:'range',min:15,max:50,step:5,def:15,unit:'%',lvl:'honors',noGut:true,onChange:clearGut,help:'The base rate: how common struggling is in this group before anyone is scored.'},
  {id:'bB',label:'Group B: share of students who would struggle',type:'range',min:15,max:50,step:5,def:35,unit:'%',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'reveal',label:'Show the error rates now',type:'toggle',def:false,help:'Normally the error rates appear once you lock in your gut answer.'}
 ],
 actions:[
  {id:'same',label:'Use one cutoff for both groups',lvl:'honors',run(sim){BioLab.setValues(sim,{tB:sim.p.tA,reveal:true});}},
  {id:'eqfpr',label:'Match the false-flag rates',lvl:'honors',run(sim){BioLab.setValues(sim,{tB:matchB(sim,'fpr'),reveal:true});}},
  {id:'eqppv',label:'Make a flag mean the same in both groups',lvl:'honors',run(sim){BioLab.setValues(sim,{tB:matchB(sim,'ppv'),reveal:true});}},
  {id:'best',label:'Get both error rates as close as possible',lvl:'honors',run(sim){BioLab.setValues(sim,{tB:bestB(sim).t,reveal:true});}}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'fprA',label:'Fine, but flagged: Group A',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*SA(sim).fpr:null},
  {id:'fprB',label:'Fine, but flagged: Group B',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*SB(sim).fpr:null},
  {id:'fnrA',label:'Needed help, missed: Group A',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*SA(sim).fnr:null},
  {id:'fnrB',label:'Needed help, missed: Group B',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*SB(sim).fnr:null},
  {id:'gap',label:'Total error-rate gap',unit:'points',d:1,min:0,max:200,get:sim=>shown(sim)?gapNow(sim):null},
  {id:'ppvA',label:'A flag means this chance of struggling: Group A',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>{const v=SA(sim).ppv;return shown(sim)&&v!==null?100*v:null;}},
  {id:'ppvB',label:'A flag means this chance of struggling: Group B',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>{const v=SB(sim).ppv;return shown(sim)&&v!==null?100*v:null;}},
  {id:'ident',label:'Chouldechova’s identity, Group B',text:true,lvl:'ap',get:sim=>{const b=SB(sim);if(b.ppv===null)return 'Group B: no one is flagged, so a flag has no meaning to check.';
   const r=b.base/(1-b.base)*(1-b.ppv)/b.ppv*(1-b.fnr);return `FPR = [b/(1 − b)]·[(1 − PPV)/PPV]·(1 − FNR) = [${b.base.toFixed(3)}/${(1-b.base).toFixed(3)}]·[${(1-b.ppv).toFixed(3)}/${b.ppv.toFixed(3)}]·${(1-b.fnr).toFixed(3)} = ${r.toFixed(3)}, matching the FPR of ${b.fpr.toFixed(3)}.`;}}
 ],
 graphs:[{id:'cut',label:'Group B’s error rates vs. its cutoff',custom:true}],defaultGraph:'cut',
 plot(sim,ctx,box){const a=SA(sim),sh=shown(sim);
  const ax=axes(ctx,box,{xmin:0,xmax:100,ymin:0,ymax:100,xl:'Group B’s cutoff (risk score, %)',yl:'Rate (%)'});
  if(!sh){txt(ctx,'Lock in your gut to see the error rates',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  const line=(f,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,5]:[]);ctx.beginPath();for(let t=5;t<=95;t++){const v=f(SB(sim,t));const x=ax.X(t),y=ax.Y(100*v);t===5?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();ctx.setLineDash([]);};
  line(b=>b.fpr,PAL['s1']);line(b=>b.fnr,PAL['s2']);
  ctx.setLineDash([3,4]);ctx.lineWidth=1.5;[[a.fpr,PAL['s1']],[a.fnr,PAL['s2']]].forEach(([v,c])=>{ctx.strokeStyle=c;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(100*v));ctx.lineTo(ax.X(100),ax.Y(100*v));ctx.stroke();});ctx.setLineDash([]);
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(sim.p.tB),ax.Y(0));ctx.lineTo(ax.X(sim.p.tB),ax.Y(100));ctx.stroke();
  legend(ctx,box.L+10,box.T+8,[{label:'B: fine but flagged',color:PAL['s1']},{label:'B: needed help, missed',color:PAL['s2']}]);
  txt(ctx,'Dotted lines: Group A',box.L+box.W-8,box.T+14,{s:12,c:PAL['muted'],a:'right'});},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),big=k>1.3,ap=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const A=SA(sim),B=SB(sim),mA=dist(bAof(sim)),mB=dist(bBof(sim));
  /* 20 display bins of 5 points each */
  const bin=(m,j)=>{let s=0,ok=0;for(let i=5*j;i<5*j+5;i++){s+=m[i]*(i+0.5)/100;ok+=m[i]*(1-(i+0.5)/100);}return {s,ok};};
  let mx=0;[mA,mB].forEach(m=>{for(let j=0;j<20;j++){const q=bin(m,j);mx=Math.max(mx,q.s+q.ok);}});
  const histT=(big?58:50)*Math.min(k,1.3),histB=big?196:224;
  const panel=(x0,w,m,t,name,col,base)=>{
   txt(ctx,(big?name.replace('Group ','')+': ':name+': ')+Math.round(base*100)+(big?'% struggle':'% would struggle'),x0,26*Math.min(k,1.3),{s:14*k,w:700,c:PAL[col]});
   const bw=w/20,H=histB-histT;
   for(let j=0;j<20;j++){const q=bin(m,j),hs=H*q.s/mx,ho=H*q.ok/mx,x=x0+j*bw;
    ctx.fillStyle=PAL[COL.bad];ctx.fillRect(x+1,histB-hs,bw-2,hs);ctx.fillStyle=PAL[COL.ok];ctx.globalAlpha=.75;ctx.fillRect(x+1,histB-hs-ho,bw-2,ho);ctx.globalAlpha=1;}
   const cx=x0+w*t/100;ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.12;ctx.fillRect(cx,histT-6,x0+w-cx,histB-histT+6);ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(cx,histT-8);ctx.lineTo(cx,histB);ctx.stroke();
   const lab=(big?'':'Flag at ')+t+'%+';ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText(lab).width;
   txt(ctx,lab,cx+lw+8<x0+w?cx+6:cx-6,histT+6*k,{s:12*k,w:700,c:PAL['rj'],a:cx+lw+8<x0+w?'left':'right'});
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,histB);ctx.lineTo(x0+w,histB);ctx.stroke();
   txt(ctx,'0%',x0,histB+15*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'100%',x0+w,histB+15*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
   if(!big)txt(ctx,'risk score',x0+w/2,histB+15*k,{s:12*k,c:PAL['cv-soft'],a:'center'});};
  panel(20,370,mA,tAof(sim),'Group A',COL.A,bAof(sim));panel(410,370,mB,sim.p.tB,'Group B',COL.B,bBof(sim));
  /* key */
  const ky=histB+(big?40:36)*k;let kx=20;
  const key=(c,l)=>{ctx.fillStyle=PAL[c];ctx.fillRect(kx,ky-10*k,11*k,11*k);txt(ctx,l,kx+16*k,ky,{s:12*k,c:PAL['cv-ink']});ctx.font=(12*k)+'px '+FONT;kx+=16*k+ctx.measureText(l).width+18*k;};
  key(COL.bad,big?'would struggle':'would struggle without help');key(COL.ok,'would be fine');
  if(!big){ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.4;ctx.fillRect(kx,ky-10*k,11*k,11*k);ctx.globalAlpha=1;txt(ctx,'flagged',kx+16*k,ky,{s:12*k,c:PAL['cv-ink']});}
  /* the error rates, side by side */
  const rows=[['Fine, but flagged','fpr'],['Needed help, missed','fnr']];if(ap&&!big)rows.push(['A flag means','ppv']);
  const rT=ky+(big?14:20)*k,rH=(446-rT)/rows.length,LX=200,RX=big?680:690;
  rows.forEach(([lab,key2],i)=>{const y=rT+i*rH,top=big?y+18*k:y,bh=big?Math.min(13*k,(rH-18*k)/2-3):Math.min(16*k,rH/2-6),lx=big?44:LX;
   txt(ctx,lab,20,big?y+13*k:y+rH/2+4*k,{s:13*k,w:700,c:PAL['cv-ink']});
   [[A,'A',COL.A],[B,'B',COL.B]].forEach(([S,g,col],j)=>{const yy=top+3+j*(bh+4),v=S[key2];
    txt(ctx,g,lx-8,yy+bh-2,{s:12*k,w:700,c:PAL[col],a:'right'});
    ctx.fillStyle=PAL['card2'];ctx.fillRect(lx,yy,RX-lx,bh);
    if(sh&&v!==null){ctx.fillStyle=PAL[col];ctx.fillRect(lx,yy,(RX-lx)*v,bh);txt(ctx,p0(v),RX+8,yy+bh-2,{s:12*k,w:700,c:PAL['cv-ink']});
     if(G&&G.m&&!big&&bh>=12*k){const c=counts(S,10000),ct=key2==='fpr'?`${cm(c.fp)} of ${cm(c.fine)} fine`:key2==='fnr'?`${cm(c.fn)} of ${cm(c.str)} who struggle`:`${cm(c.tp)} of ${cm(c.fl)} flagged`;
      ctx.font=(12*k)+'px '+FONT;const tw=ctx.measureText(ct).width,fe=lx+(RX-lx)*v,inFill=fe>RX-tw-12;txt(ctx,ct,inFill?fe-6:RX-6,yy+bh-3*k,{s:12*k,c:inFill?'#fff':PAL['cv-soft'],a:'right'});}}
    else txt(ctx,'?',RX+8,yy+bh-2,{s:12*k,w:700,c:PAL['cv-soft']});});});
  if(G&&G.g&&!big)txt(ctx,'Your gut: Group B flags at '+G.g.t+'%+',780,ky,{s:12*k,w:700,c:PAL['s4'],a:'right'});},
 narrate(sim){const a=SA(sim),b=SB(sim),tA=tAof(sim),same=sim.p.tB===tA;
  if(!shown(sim))return `The score is just as accurate for both groups: a score of 30% means a 30% chance of struggling in Group A or Group B. ${same?'Both groups are flagged at '+tA+'% or higher. ':''}<b>Look at the shaded part of each picture: who gets flagged?</b>`;
  if(same)return `One cutoff for everyone. Fine students get flagged ${p0(b.fpr)} of the time in Group B but only ${p0(a.fpr)} in Group A, while struggling students are missed ${p0(a.fnr)} of the time in A and ${p0(b.fnr)} in B. <b>Group B has more middle scores, so the same rule lands on its fine students more often.</b>`;
  const ap=a.ppv,bp=b.ppv;
  return `With different cutoffs, the error-rate gap is ${gapNow(sim).toFixed(1)} points (false flags ${p0(a.fpr)} vs ${p0(b.fpr)}, misses ${p0(a.fnr)} vs ${p0(b.fnr)}). ${ap!==null&&bp!==null?`<b>But a flag now means ${p0(ap)} in Group A and ${p0(bp)} in Group B</b>, and two students with the same score can get different treatment.`:'<b>One group has no flags at all now.</b>'}`;},
 gut:{better:'lower',controls:['tB'],lockLabel:'Lock in Group B’s cutoff',
  ask:{bio:'Group A is flagged at a score of 30% or more. Drag Group B’s cutoff here to where you think both groups are treated the same: fine students wrongly flagged at the same rate, and struggling students missed at the same rate. Then lock it in.',
   honors:'Drag Group B’s cutoff here to equalize both error rates (false positive rate and false negative rate) by eye, then lock it in. Afterward, ask whether a flag still means the same thing.'},
  lock(sim){const g=gapNow(sim);return {v:g,t:sim.p.tB,label:`flag Group B at ${sim.p.tB}% or higher (error-rate gap ${g.toFixed(1)} points)`};},
  solve(sim){const b=bestB(sim);sim.p.tB=b.t;return {v:gapNow(sim),t:b.t,label:`flag Group B at ${b.t}% or higher (error-rate gap ${gapNow(sim).toFixed(1)} points)`};},
  hint:{bio:'Lock in your cutoff. Then you will work out Group B’s false-flag rate yourself from the counts.'},
  calc:{unit:'%',d:1,tol:0.6,
   prompt:{bio:sim=>{const c=counts(SB(sim));return `At your cutoff (${sim.p.tB}% or higher), picture 1,000 Group B students. <b>${c.fine}</b> of them would be fine, and <b>${c.fp}</b> of those fine students get flagged anyway. What percent of Group B’s fine students get flagged?`;},
    honors:sim=>{const c=counts(SB(sim));return `At your cutoff (${sim.p.tB}% or higher), out of 1,000 Group B students: ${c.str} would struggle and ${c.fine} would be fine. ${c.fl} are flagged: ${c.tp} who would struggle and ${c.fp} who would be fine. Find the false positive rate, P(flagged | fine), as a percent.`;}},
   answer:calcAns,
   hint:'Only the fine students count here. Divide the fine students who got flagged by all the fine students.',
   steps(sim){const c=counts(SB(sim)),out=[];
    out.push(`The condition is “fine,” so the whole is the ${c.fine} fine Group B students, not all 1,000.`);
    out.push(`Of those, ${c.fp} get flagged.`);
    out.push(`P(flagged | fine) = ${c.fp} ÷ ${c.fine} ≈ ${(c.fp/c.fine).toFixed(3)} = <b>${calcAns(sim).toFixed(1)}%</b>.`);
    if(atLeast('honors'))out.push(`Do not divide by the ${c.fl} flagged students: ${c.tp} ÷ ${c.fl} is the PPV, P(struggles | flagged), a different question.`);
    return out;}},
  formula(sim){const a=counts(SA(sim),10000),b=counts(SB(sim),10000),f=(x,n)=>`${cm(x)} ÷ ${cm(n)} = ${n?(100*x/n).toFixed(1):'0.0'}%`;
   return `False positive rate = P(flagged | fine) = fine students flagged ÷ all fine students. Out of 10,000 students in each group:<br>Group A (${tAof(sim)}%+): ${f(a.fp,a.fine)}. Group B (${sim.p.tB}%+): ${f(b.fp,b.fine)}.<br>False negative rate = P(missed | struggles): A ${f(a.fn,a.str)}, B ${f(b.fn,b.str)}.`;},
  how:{bio:'The math tries every cutoff for Group B. For each one it counts the fine students who get flagged and the struggling students who get missed, in both groups, and keeps the cutoff where the two groups come out closest.',
   ap:'Minimize |FPR_A − FPR_B| + |FNR_A − FNR_B| over Group B’s cutoff, with FPR = P(flag | fine) and FNR = P(no flag | struggles), each a sum over the score distribution.'},
  compare(sim,g,m){const a=SA(sim),bm=SB(sim,m.t),tA=tAof(sim);
   const head=g.v-m.v<1.5?`Your gut was right on: your cutoff (${g.t}%) is as close as the math gets, a gap of ${m.v.toFixed(1)} points.`:`Your cutoff (${g.t}%) left an error-rate gap of <b>${g.v.toFixed(1)} points</b>; the best cutoff (${m.t}%) gets it down to <b>${m.v.toFixed(1)}</b>.`;
   const ppv=(a.ppv!==null&&bm.ppv!==null)?` <b>The catch:</b> a flag now means a ${p0(a.ppv)} chance of struggling in Group A and ${p0(bm.ppv)} in Group B. With different base rates you can match the error rates or the meaning of a flag, not both; which to protect is a question of values.`:'';
   return head+` Fine students flagged, per 1,000 fine: A ${per(a.fpr)}, B ${per(bm.fpr)}.`+ppv;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.tB=R([20,30,40,60]);sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A new case: another school scores 1,000 students. 720 of them would be fine, and 108 of those fine students get flagged anyway. What is the false positive rate, P(flagged | fine), as a percent?',answer:15,tol:0.5,unit:'%',d:1,hint:'The condition is “fine,” so divide by the fine students only.',explain:'P(flagged | fine) = 108 ÷ 720 = 0.15 = 15%. Dividing by all 1,000 students (10.8%) answers a different question.'},
  {lvl:'bio',instant:true,q:'Both groups are flagged at a risk score of 30% or more, and the score is equally accurate for both. Which group’s fine students get wrongly flagged more often?',choices:['Neither: the same rule and an accurate score treat them the same','Group B, where more students struggle: 45% of its fine students are flagged, against 10% in Group A','Group A'],correct:1,explain:'Group B has more students with middle scores. Many of them would be fine, but their scores still clear 30%. Same rule, same accuracy, very different rates of false flags: 45.5% against 9.7%.'},
  {lvl:'bio',instant:true,q:'With that same 30% cutoff, which group’s struggling students are missed more often?',choices:['Group A: 61% of its struggling students are never flagged','Group B','They are missed equally'],correct:0,explain:'In Group A most scores are low, so even students who will struggle often score under 30%. They are missed 61.5% of the time, against 23.0% in Group B. Each group gets hurt by a different kind of mistake.'},
  {lvl:'honors',instant:true,q:'You move Group B’s cutoff to 50% and both error rates nearly match Group A’s. Is the flag still calibrated: does a flag mean the same chance of struggling in both groups?',choices:['Yes, the score itself has not changed','No: a flag now means about a 41% chance in Group A and 61% in Group B'],correct:1,explain:'The score is still calibrated, but the flag is not. Group B’s flagged students all have scores of 50% or more, so a flag there means a higher chance of struggling. Fixing one kind of fairness broke another.'},
  {lvl:'honors',instant:true,q:'Instead, you make a flag mean the same in both groups (about 41%). Where does Group B’s cutoff go, and what happens to its fine students?',choices:['Up to 50%, and fewer fine students are flagged','Down to 19%, and about 71% of Group B’s fine students get flagged','It stays at 30%'],correct:1,explain:'Group B’s flagged students must include more low scores to bring the flag’s meaning down to 41%, so the cutoff drops to 19% (a flag then means 41.2%). Now 71.3% of fine Group B students get flagged, against 9.7% in Group A.'},
  {lvl:'ap',instant:true,q:'Group B: base rate 0.35, a flag means 41.3% (PPV), and the miss rate (FNR) is 61.5%, the same as Group A. Use FPR = [b/(1 − b)]·[(1 − PPV)/PPV]·(1 − FNR). What must Group B’s FPR be?',choices:['About 9.7%, the same as Group A','About 29.5%','About 61.5%'],correct:1,explain:'(0.35/0.65)·(0.587/0.413)·(0.385) ≈ 0.538 × 1.421 × 0.385 ≈ 0.295. Group A, with b = 0.15, gets 9.7% from the same PPV and FNR. Different base rates force different false positive rates.'},
  {lvl:'ap',instant:true,q:'Kleinberg, Mullainathan and Raghavan (2016) proved calibration and equal error rates cannot all hold together. When is the impossibility escaped?',choices:['When the cutoff is 50%','Only when the groups have equal base rates, or the score predicts perfectly','When the groups are the same size'],correct:1,explain:'With equal base rates, or a perfect score (all scores 0% or 100%), every condition can hold. Real risk scores are neither, so a designer has to choose which fairness to give up.'}
 ],
 tour:[
  {title:'Two groups, one score',text:'Each bar is a slice of students with similar risk scores. Orange students would struggle without help; teal students would be fine. The score is calibrated: in both groups, 30% of the students scored 30% would struggle.',pause:true,setup:sim=>BioLab.setValues(sim,{tA:30,tB:30,bA:15,bB:35,reveal:true}),focus:[0,0,800,250]},
  {title:'Different base rates',text:'In Group A, 15% of students would struggle. In Group B, 35% would. So Group B has more middle and high scores.',pause:true,focus:[0,0,800,250]},
  {title:'One rule for everyone',text:'The school flags anyone scoring 30% or more, in both groups. Everything right of the red line gets flagged and sent to study hall.',pause:true},
  {title:'Fine, but flagged',text:'Group B’s fine students get flagged 45.5% of the time. Group A’s, only 9.7%. Same rule, same accurate score.',pause:true,focus:[0,250,800,200]},
  {title:'Needed help, missed',text:'The other mistake flips: Group A’s struggling students are missed 61.5% of the time, Group B’s 23.0%.',pause:true,focus:[0,250,800,200]},
  {title:'Change Group B’s rule',text:'Raise Group B’s cutoff to 50%. Now false flags are 9.7% vs 12.6% and misses 61.5% vs 62.6%. Nearly equal.',pause:true,setup:sim=>BioLab.setValues(sim,{tB:50,reveal:true})},
  {lvl:'honors',title:'The price',text:'Now a flag means a 41.3% chance of struggling in Group A but 61.5% in Group B, and a student scoring 40% is flagged in A but not in B. Equal error rates cost you equal meaning.',pause:true},
  {lvl:'honors',title:'The same math in court',text:'COMPAS scores defendants’ risk of re-offending. ProPublica (2016) found non-reoffending Black defendants labeled high risk 45% of the time, white defendants 23%. Northpointe answered that its score was calibrated. Both can be true at once.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does one cutoff treat two groups whose base rates differ?</p><ol><li>Turn on <b>Show the error rates now</b>.</li><li>Record a trial with Group B’s cutoff at 20%, 30%, 40%, 50% and 60%.</li><li>Graph <b>Trials</b> with the cutoff on x and Group B’s false-flag rate on y.</li></ol><p>Write one sentence: what does raising the cutoff do to each kind of mistake?</p>',
  honors:'<p><b>Question:</b> Can you get equal error rates and equal meaning at the same time?</p><ol><li>Press <b>Use one cutoff for both groups</b>, then <b>Match the false-flag rates</b>, then <b>Make a flag mean the same in both groups</b>.</li><li>Record all four error rates and both flag meanings each time.</li><li>Now set both base rates to 25% and repeat.</li></ol><p>Explain why the base rates decide whether all three can match.</p>',
  ap:'<p><b>Question:</b> Verify Chouldechova’s identity.</p><ol><li>For three cutoffs, record Group B’s base rate, PPV, FNR and FPR.</li><li>Compute [b/(1 − b)]·[(1 − PPV)/PPV]·(1 − FNR) and compare it with FPR.</li><li>Derive the identity from the four cells of a two-way table.</li></ol><p><b>CER:</b> Claim what must give when base rates differ; use your table as evidence.</p>'},
 terms:[
  {t:'Base rate',d:'How common the outcome is in a group before anyone is scored. Here, the share of students who would struggle.'},
  {t:'False positive',d:'Flagging someone who would have been fine.'},
  {t:'False negative',d:'Missing someone who really needed help.'},
  {t:'Calibrated score',d:'A score that means the same thing for everyone: of all students scored 30%, about 30% struggle, in every group.',lvl:'honors'},
  {t:'False positive rate (FPR)',d:'P(flagged | would be fine): the share of fine students who get flagged.',lvl:'honors'},
  {t:'False negative rate (FNR)',d:'P(not flagged | would struggle): the share of struggling students who get missed.',lvl:'honors'},
  {t:'Positive predictive value (PPV)',d:'P(would struggle | flagged): what a flag means. Equal PPV across groups is called predictive parity.',lvl:'honors'},
  {t:'Impossibility theorem',d:'Kleinberg, Mullainathan and Raghavan (2016) and Chouldechova (2017): with different base rates and an imperfect score, calibration and equal error rates cannot all hold.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Each group’s risk scores follow a smooth shape (a Beta distribution with concentration 6) whose average is the group’s base rate. Scores are rounded to whole percents, and the score is calibrated by design: a student scored s struggles with chance s, in either group. A student is flagged when the score is at or above the group’s cutoff. FPR = P(flag | fine), FNR = P(no flag | struggles), PPV = P(struggles | flag). The school, the groups and every number here are made up for illustration.</p><p><b>The real case.</b> COMPAS is a risk score used in some U.S. courts. ProPublica analyzed more than 10,000 criminal defendants in Broward County, Florida (2016): Black defendants who did not re-offend were labeled high risk 45% of the time, against 23% for white defendants, and white defendants who did re-offend were labeled low risk 48% of the time, against 28% for Black defendants (<a href="https://www.propublica.org/article/how-we-analyzed-the-compas-recidivism-algorithm" target="_blank" rel="noopener">ProPublica’s methodology</a>). Northpointe, the company behind COMPAS, argued that the score was fair because it was calibrated: a given score meant about the same chance of re-offending in both groups. Kleinberg, Mullainathan and Raghavan (2016) and Chouldechova (2017) showed that when base rates differ, both cannot be fully satisfied at once.</p><p><b>Two strong cases.</b> One side says fairness means equal error rates: no group should carry more false accusations. The other says fairness means a score must mean the same thing for everyone, and that using different cutoffs by group treats equal scores unequally. The math shows the trade-off; it cannot pick the side. Real schools that use early-warning flags also look at grades, attendance and teacher judgment, not only a score.</p>'
};
BioLab.register(SIM);
})();
