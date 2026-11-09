(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Student loan payment vs. pay.
   Federal loans first borrowed on or after July 1, 2026 are repaid on a standard plan whose length depends on the balance:
   under $25,000: 10 years; $25,000–$49,999: 15; $50,000–$99,999: 20; $100,000 or more: 25.
   Payment per dollar k = i / (1 − (1 + i)⁻ⁿ), so the payment is proportional to the debt within each tier: payment = k·D.
   A payment limit of L% of monthly pay gives the most you can borrow: D = (L/100 · S/12) / k. */
const MAJ={
 nursing:['Nursing',53000,67000,81000],cs:['Computer science',56000,83000,110000],mech:['Mechanical engineering',64000,81000,94000],
 acct:['Accounting',45000,62000,78000],fin:['Finance',50000,68000,89000],bus:['Business management',39000,53000,70000],
 mkt:['Marketing',41000,55000,71000],comm:['Communications',37000,49000,65000],psych:['Psychology',32000,43000,57000],
 bio:['Biology',32000,44000,60000],eled:['Elementary education',36000,46000,54000],crim:['Criminal justice',35000,47000,62000],
 eng:['English',33000,45000,60000],hist:['History',32000,46000,63000],poli:['Political science',39000,53000,70000],
 econ:['Economics',49000,69000,94000],math:['Mathematics',44000,61000,84000],fine:['Fine arts',31000,43000,59000],
 kin:['Physical fitness and recreation',30000,43000,58000],sw:['Social work',34000,43000,52000],theo:['Theology and religious vocations',29000,40000,51000]};
const TIERS=[[0,25000,10],[25000,50000,15],[50000,100000,20],[100000,1e9,25]];
const FEDCAP=31000;
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>(Math.round(v*10)/10).toString()+'%';
const c2=v=>Math.round(v*100)/100;
const rate=sim=>atLeast('honors')?sim.p.rate:6.52;
const lim=sim=>atLeast('honors')?sim.p.limit:10;
const kf=(r,y)=>{const i=r/1200;return i/(1-Math.pow(1+i,-12*y));};
const termOf=D=>TIERS.find(t=>D>=t[0]&&D<t[1])[2];
const per1000=(sim,y)=>c2(1000*kf(rate(sim),y));
const pay=(sim,D)=>c2(D*kf(rate(sim),termOf(D)));
const allowed=(sim,S)=>c2(lim(sim)/100*S/12);
function maxDebt(sim,S){const P=lim(sim)/100*S/12;let best=0,tier=10;TIERS.forEach(([lo,hi,y])=>{const d=P/kf(rate(sim),y);if(d>=lo){best=Math.min(d,hi-0.01);tier=y;}});return {d:best,y:tier};}
const M=sim=>MAJ[sim.p.major]||MAJ.psych;
const pays=sim=>{const m=M(sim);return [m[1],m[2],m[3]];};
const LBL=['Low','Typical','High'];
const share=(sim,S)=>pay(sim,sim.p.debt)/(S/12)*100;
const needPay=sim=>pay(sim,sim.p.debt)*12/(lim(sim)/100);
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(sim.gutS&&sim.gutS.g&&!pending(sim)));
const GS=sim=>touring(sim)?null:sim.gutS;
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
/* "Your turn": the most you can borrow at the typical pay, using the payment per $1,000 (rounded to the cent) for the right plan */
function calcParts(sim){const S=pays(sim)[1],P=allowed(sim,S),y=maxDebt(sim,S).y,kk=per1000(sim,y);return {S,P,y,kk,ans:c2(P/kk*1000)};}

const INV='<p><b>Your turn: investigate.</b> Ask two adults you know three questions: What did you study or train for? What work do you do now? What led you to that work? Do not ask about pay.</p><ol><li>Find each person’s major in this tool, or the closest one.</li><li>Read its three paychecks: low, typical and high.</li></ol><p>Write: What do the three numbers tell you about people with that major? What do they leave out about the people you talked to and how they chose their work?</p>';
const SIM={
 id:'debtfit',hash:'debtfit',apUnit:1,order:3,tab:'How much debt fits?',kind:'Simulation',
 skills:{bio:'Proportions and percents · Algebra 1 (Unit 2)',honors:'Proportional relationships and piecewise functions · Algebra 1 (Units 2 and 3)',ap:'Proportions and the loan payment formula · Algebra 1 (Unit 2), Algebra 2 (Unit 5)'},
 card:'One major leads to many jobs and many paychecks. Guess how much you could borrow, then use proportions to see what payment fits at low, typical and high pay.',
 title:'One degree, many paychecks: how much debt fits?',
 lede:{bio:'People with the same major end up in very different jobs, often outside their field, so they earn very different pay. A loan payment that is easy on one paycheck can be heavy on another. The math here is proportions: the payment grows in step with what you borrow.',
  honors:'Within one repayment plan, payment = k × debt, a proportional relationship. New federal loans set the plan’s length by the balance, so k changes at $25,000, $50,000 and $100,000, and the payment is a piecewise function of the debt.',
  ap:'k = i / (1 − (1 + i)⁻ⁿ) is the loan payment formula per dollar. A payment limit of L% of pay S gives the most you can borrow: D = (L/100)(S/12)/k. Longer plans make k smaller, so D grows, and so does the total interest.'},
 scale:'Pay is for full-time workers ages 22 to 26 with only a bachelor’s degree, in 2024 dollars (Georgetown CEW). Loans are federal student loans at the 2026–27 rate.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your plan',
 controls:[
  {id:'guess',label:'Your gut: the most you could borrow and keep the payment at 10% of typical pay',type:'range',min:0,max:120000,step:500,def:20000,unit:' dollars'},
  {id:'major',label:'Major',type:'select',def:'psych',noGut:true,onChange:clear,options:Object.keys(MAJ).map(k=>({v:k,l:MAJ[k][0]}))},
  {id:'debt',label:'What you plan to borrow in all',type:'range',min:0,max:100000,step:500,def:29500,unit:' dollars',noGut:true,onChange:clear,help:'Bachelor’s graduates who borrowed in 2023–24 owed $29,560 on average (College Board). About half of graduates borrow nothing.'},
  {id:'limit',label:'Your limit: payment as a share of monthly pay',type:'range',min:5,max:15,step:1,def:10,unit:'%',lvl:'honors',noGut:true,onChange:clear,help:'Keeping student loan payments under about 10% of pay before taxes is a common guideline.'},
  {id:'rate',label:'Loan rate',type:'range',min:4,max:9,step:0.01,def:6.52,unit:'%',d:2,lvl:'honors',noGut:true,onChange:clear,help:'6.52% is the federal rate for undergraduate loans first paid out July 1, 2026 to June 30, 2027.'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut.'}
 ],
 actions:[{id:'over',label:'Try borrowing $24,500, then $25,000',lvl:'honors',run(sim){BioLab.setValues(sim,{debt:sim.p.debt===24500?25000:24500,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'pay',label:'Monthly payment on what you plan to borrow',unit:'dollars',d:2,min:0,max:null,get:sim=>pay(sim,sim.p.debt)},
  {id:'yrs',label:'Years to repay on the standard plan',unit:'years',d:0,min:0,max:null,get:sim=>termOf(sim.p.debt)},
  {id:'sLow',label:'Payment share of pay, low pay',unit:'%',d:1,min:0,max:null,get:sim=>shown(sim)?share(sim,pays(sim)[0]):null},
  {id:'sTyp',label:'Payment share of pay, typical pay',unit:'%',d:1,min:0,max:null,get:sim=>shown(sim)?share(sim,pays(sim)[1]):null},
  {id:'sHigh',label:'Payment share of pay, high pay',unit:'%',d:1,min:0,max:null,get:sim=>shown(sim)?share(sim,pays(sim)[2]):null},
  {id:'mLow',label:'Most that fits, low pay',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?maxDebt(sim,pays(sim)[0]).d:null},
  {id:'mTyp',label:'Most that fits, typical pay',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?maxDebt(sim,pays(sim)[1]).d:null},
  {id:'mHigh',label:'Most that fits, high pay',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?maxDebt(sim,pays(sim)[2]).d:null},
  {id:'off',label:'Your gut is off by',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-maxDebt(sim,pays(sim)[1]).d):null},
  {id:'need',label:'Yearly pay this debt needs to fit your limit',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?needPay(sim):null},
  {id:'int',label:'Total interest on what you plan to borrow',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?pay(sim,sim.p.debt)*12*termOf(sim.p.debt)-sim.p.debt:null}
 ],
 graphs:[{id:'bypay',label:'Most you can borrow vs. yearly pay',custom:true}],defaultGraph:'bypay',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:20000,xmax:120000,ymin:0,ymax:140000,xl:'Yearly pay ($)',yl:'Most you can borrow ($)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the answer',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();let prev=null;for(let S=20000;S<=120000;S+=250){const d=Math.min(140000,maxDebt(sim,S).d),px=ax.X(S),py=ax.Y(d);if(prev!==null&&Math.abs(prev-d)>3000){ctx.stroke();ctx.beginPath();ctx.moveTo(px,py);}else if(prev===null)ctx.moveTo(px,py);else ctx.lineTo(px,py);prev=d;}ctx.stroke();
  pays(sim).forEach((S,j)=>{ctx.fillStyle=[PAL['s1'],PAL['s4'],PAL['s3']][j];ctx.beginPath();ctx.arc(ax.X(S),ax.Y(Math.min(140000,maxDebt(sim,S).d)),5,0,7);ctx.fill();});
  legend(ctx,box.L+10,box.T+8,[{label:'Most that keeps the payment at '+lim(sim)+'% of pay',color:PAL['g-line']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),big=k>1.3,fs=Math.min(k,1.6),P=sim.p,S3=pays(sim),COL=[PAL['s1'],PAL['s4'],PAL['s3']];
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,M(sim)[0]+': half of new graduates earn between '+$(S3[0])+' and '+$(S3[2]),20,28*Math.min(k,1.2),{s:14*fs,w:700});
  /* left: debt that fits vs. yearly pay */
  const gL=big?66:80,gR=big?470:480,gT=58*Math.min(k,1.25),gB=450-30*fs,YM=100000,X=S=>gL+(gR-gL)*(S-20000)/100000,Y=d=>gB-(gB-gT)*Math.min(d,YM)/YM;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gL,gT);ctx.lineTo(gL,gB);ctx.lineTo(gR,gB);ctx.stroke();
  [20000,60000,100000].forEach(S=>txt(ctx,'$'+S/1000+'K',X(S),gB+15*fs,{s:12*fs,c:PAL['cv-soft'],a:'center'}));
  [25000,50000,75000,100000].filter(d=>!big||d%50000===0).forEach(d=>txt(ctx,'$'+d/1000+'K',gL-6,Y(d)+4,{s:12*fs,c:PAL['cv-soft'],a:'right'}));
  txt(ctx,'Yearly pay →',gR,gB-6,{s:12*fs,w:700,c:PAL['cv-soft'],a:'right'});
  txt(ctx,'↑ Debt',gL+6,gT+4+8*fs,{s:12*fs,w:700,c:PAL['cv-soft']});
  /* federal limit for a dependent undergraduate */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(gL,Y(FEDCAP));ctx.lineTo(gR,Y(FEDCAP));ctx.stroke();ctx.setLineDash([]);
  if(!big)txt(ctx,'Federal loan limit $31,000',gR-4,Y(FEDCAP)+14,{s:11*fs,c:PAL['cv-soft'],a:'right'});
  if(sh){/* the region that fits, then its top edge */
   ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.14;ctx.beginPath();ctx.moveTo(X(20000),gB);for(let S=20000;S<=120000;S+=250)ctx.lineTo(X(S),Y(maxDebt(sim,S).d));ctx.lineTo(X(120000),gB);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;ctx.beginPath();let prev=null;for(let S=20000;S<=120000;S+=250){const d=maxDebt(sim,S).d,px=X(S),py=Y(d);if(prev===null||Math.abs(prev-d)>3000){ctx.stroke();ctx.beginPath();ctx.moveTo(px,py);}else ctx.lineTo(px,py);prev=d;}ctx.stroke();
   if(!big)txt(ctx,'Most that fits at '+lim(sim)+'%',X(70000)-8,Y(Math.min(maxDebt(sim,70000).d,YM))-12,{s:12*fs,w:700,c:PAL['s3'],a:'right'});}
  /* what you plan to borrow */
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(gL,Y(P.debt));ctx.lineTo(gR,Y(P.debt));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,(big?'':'You plan ')+$(P.debt),gL+6,Y(P.debt)-6,{s:12*fs,w:700,c:PAL['rj']});
  /* the three paychecks */
  S3.forEach((S,j)=>{ctx.strokeStyle=COL[j];ctx.lineWidth=1.5;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X(S),gB);ctx.lineTo(X(S),sh?Y(maxDebt(sim,S).d):gT+30);ctx.stroke();ctx.setLineDash([]);
   if(sh){ctx.fillStyle=COL[j];ctx.beginPath();ctx.arc(X(S),Y(maxDebt(sim,S).d),6,0,7);ctx.fill();}
   if(!big||j!==1)txt(ctx,LBL[j],X(S),gB-8-(j===1?14*fs:0),{s:12*fs,w:700,c:COL[j],a:'center'});});
  if(sh&&needPay(sim)>20000&&needPay(sim)<120000&&!big){const nx=X(needPay(sim));ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(nx,Y(P.debt),5,0,7);ctx.fill();}
  /* right: the payment as a share of each paycheck */
  const bL=big?500:520,bR=780,bT=gT+24*fs,bB=gB,bw=(bR-bL)/3-12,top=Math.max(16,lim(sim)*1.6),BY=v=>bB-(bB-bT)*Math.min(v,top)/top;
  txt(ctx,'Payment as % of pay',(bL+bR)/2,gT,{s:12*fs,w:700,c:PAL['cv-soft'],a:'center'});
  S3.forEach((S,j)=>{const x=bL+j*(bw+12),v=share(sim,S);
   if(sh){ctx.fillStyle=COL[j];rr(ctx,x,BY(v),bw,bB-BY(v),4);ctx.fill();txt(ctx,pc(v),x+bw/2,BY(v)-6,{s:12*fs,w:700,a:'center'});}
   else{ctx.strokeStyle=PAL['line'];ctx.setLineDash([5,4]);ctx.lineWidth=2;rr(ctx,x,bT+30,bw,bB-bT-30,4);ctx.stroke();ctx.setLineDash([]);txt(ctx,'?',x+bw/2,(bT+bB)/2+10,{s:22*fs,w:700,c:PAL['cv-soft'],a:'center'});}
   txt(ctx,LBL[j],x+bw/2,bB+15*fs,{s:12*fs,c:PAL['cv-soft'],a:'center'});});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(bL-4,BY(lim(sim)));ctx.lineTo(bR,BY(lim(sim)));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,lim(sim)+'%',bR,BY(lim(sim))-5,{s:12*fs,w:700,a:'right'});
  if(!sh){const mine=G&&G.g;txt(ctx,mine?'Work out the most you can borrow':'Lock in your gut to see the answer',(gL+gR)/2+20,gT+(gB-gT)*0.3,{s:13*fs,c:PAL['cv-soft'],a:'center'});}
  if(G&&G.g&&!big)pill(ctx,'Your gut: '+$(G.g.guess),X(S3[1]),Y(Math.min(G.g.guess,YM)),PAL['card2'],PAL['s4'],12*Math.min(k,1.4));},
 narrate(sim){const S3=pays(sim),m=M(sim)[0];
  if(!shown(sim))return `${m} graduates work in many different jobs, in and out of their field. A quarter earn under ${$(S3[0])} a year, half under ${$(S3[1])}, and a quarter over ${$(S3[2])}. <b>How much could you borrow and keep the payment at ${lim(sim)}% of typical pay?</b>`;
  const md=maxDebt(sim,S3[1]);
  return `At typical pay (${$(S3[1])}), ${lim(sim)}% is ${$2(allowed(sim,S3[1]))} a month, which repays <b>${$(md.d)}</b> over ${md.y} years. Borrowing ${$(sim.p.debt)} costs ${$2(pay(sim,sim.p.debt))} a month: <b>${pc(share(sim,S3[0]))}</b> of low pay, ${pc(share(sim,S3[1]))} of typical pay and ${pc(share(sim,S3[2]))} of high pay.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Half of young psychology graduates earn more than $43,000 a year and half earn less. Drag the slider here to the most you think you could borrow so the loan payment is at most 10% of that pay. Then lock it in.',
   honors:'Drag the slider here to the most you think you could borrow so the payment stays within your limit at typical pay for this major. Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-maxDebt(sim,pays(sim)[1]).d),guess:sim.p.guess,label:`about ${$(sim.p.guess)}`};},
  solve(sim){const d=maxDebt(sim,pays(sim)[1]).d;sim.p.guess=Math.round(d/500)*500;return {v:Math.abs(sim.p.guess-d),guess:d,label:`${$(d)} at typical pay`};},
  hint:{bio:'Lock in your gut. Then you will work out the answer with a proportion.'},
  calc:{unit:'$',d:0,tol:a=>Math.max(100,0.01*a),
   prompt:{bio:sim=>{const c=calcParts(sim);return `Typical pay for a young ${M(sim)[0].toLowerCase()} graduate is <b>${$(c.S)}</b> a year. ${lim(sim)}% of a month’s pay is ${$(c.S)} ÷ 12 × ${(lim(sim)/100).toFixed(2)} = <b>${$2(c.P)}</b>. A loan this size is repaid over ${c.y} years: <b>${$2(c.kk)}</b> a month for every $1,000 borrowed. What is the most you can borrow?`;},
    ap:sim=>{const c=calcParts(sim);return `Typical pay ${$(c.S)} a year, limit ${lim(sim)}% of monthly pay. The loan is at ${(+rate(sim).toFixed(2))}% for ${c.y} years. Use k = i/(1 − (1 + i)⁻ⁿ) for the payment per $1,000, rounded to the cent, then find the most you can borrow.`;}},
   answer:sim=>calcParts(sim).ans,
   hint:'Set up a proportion: $ per $1,000 borrowed = your monthly limit ÷ the amount borrowed. Or divide your limit by the payment per $1,000, then multiply by 1,000.',
   steps(sim){const c=calcParts(sim),out=[];
    out.push(`Monthly limit: ${$(c.S)} ÷ 12 × ${(lim(sim)/100).toFixed(2)} = ${$2(c.P)}.`);
    if(atLeast('ap')){const i=rate(sim)/1200;out.push(`k = ${i.toFixed(6)} ÷ (1 − ${(1+i).toFixed(6)}⁻${c.y*12}) = ${(kf(rate(sim),c.y)).toFixed(6)} per dollar, or ${$2(c.kk)} per $1,000.`);}
    out.push(`Proportion: ${$2(c.kk)} / $1,000 = ${$2(c.P)} / D, so D = ${$2(c.P)} ÷ ${$2(c.kk)} × 1,000 = <b>${$(c.ans)}</b>.`);
    out.push(`Check: ${$(c.ans)} is in the ${c.y}-year range, so the ${c.y}-year payment applies.`);
    return out;}},
  formula(sim){const S3=pays(sim),r=S3.map(S=>maxDebt(sim,S));
   const a=`Most you can borrow = (${lim(sim)}% × pay ÷ 12) ÷ payment per $1: low ${$(r[0].d)}, typical ${$(r[1].d)}, high ${$(r[2].d)}.`;
   const b=`Your ${$(sim.p.debt)} costs ${$2(pay(sim,sim.p.debt))} a month: ${pc(share(sim,S3[0]))}, ${pc(share(sim,S3[1]))} and ${pc(share(sim,S3[2]))} of the three paychecks.`;
   return a+'<br>'+b;},
  how:{bio:'The payment is proportional to what you borrow. The math finds the payment you can afford at each paycheck, then scales up from the payment on $1,000.',
   ap:'D = (L/100)(S/12)/k with k = i/(1 − (1 + i)⁻ⁿ), and n set by the balance.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),S3=pays(sim),r=S3.map(S=>maxDebt(sim,S).d),K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked it out yourself with a proportion.':'';
   const real=` In real terms: the same degree supports about ${$(r[0])} of debt at low pay and ${$(r[2])} at high pay, a gap of ${$(r[2]-r[0])}. And a quarter of these graduates earn more than the high number.`;
   if(off<=Math.max(1500,0.05*m.guess))return `Your gut was right on: within ${$(off)}.`+real+self;
   return `Your gut was off by <b>${$(off)}</b>: you guessed ${$(g.guess)}, and the math says <b>${$(m.guess)}</b> at typical pay. ${g.guess>m.guess?'You guessed high: a payment of 10% of pay is smaller than it sounds.':'You guessed low: a long repayment plan spreads the debt over many payments.'}`+real+self;},
  again(sim){const ks=Object.keys(MAJ);sim.p.major=ks[Math.floor(Math.random()*ks.length)];sim.p.guess=20000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A job pays $36,000 a year. You want the loan payment to be at most 10% of monthly pay. A loan of $25,000 to $49,999 costs $8.72 a month for every $1,000 borrowed. What is the most you can borrow?',answer:34403.67,tol:350,unit:'$',d:0,hint:'10% of $36,000 ÷ 12 is your monthly limit. Divide by $8.72 and multiply by 1,000.',explain:'$36,000 ÷ 12 × 0.10 = $300 a month. $300 ÷ $8.72 × 1,000 ≈ $34,404. That is in the $25,000 to $49,999 range, so the $8.72 rate applies.'},
  {lvl:'bio',instant:true,q:'You borrow $29,500 for a psychology degree, a payment of $257.30 a month. What share of monthly pay is that at low pay ($32,000 a year) and at high pay ($57,000)?',choices:['About 10% in both','About 9.6% and 5.4%','About 12% and 8%'],correct:1,explain:'$32,000 ÷ 12 = $2,666.67, and $257.30 ÷ $2,666.67 ≈ 9.6%. $57,000 ÷ 12 = $4,750, and $257.30 ÷ $4,750 ≈ 5.4%. Same degree, same debt, very different weight.'},
  {lvl:'bio',instant:true,q:'Within one repayment plan, you double what you borrow. The monthly payment…',choices:['Doubles','Goes up a little','Stays the same'],correct:0,explain:'Payment = (payment per $1,000) × (thousands borrowed). That is a proportional relationship, so doubling the debt doubles the payment.'},
  {lvl:'honors',instant:true,q:'At 6.52%, borrowing $24,500 means 10 years at $278.44 a month. Borrowing $25,000 means 15 years at $218.05 a month. Which is true?',choices:['The bigger loan costs less in all','The bigger loan has a smaller payment but about $14,249 of interest, vs. about $8,913','Both cost the same in interest'],correct:1,explain:'$278.44 × 120 − $24,500 ≈ $8,913 of interest. $218.05 × 180 − $25,000 ≈ $14,249. The payment drops at $25,000 because the plan gets 5 years longer, a jump in a piecewise function.'},
  {lvl:'honors',kind:'num',q:'You plan to borrow $29,500 ($257.30 a month). With a 10% limit, what yearly pay would you need for that payment to fit?',answer:30876,tol:5,unit:'$',d:0,hint:'Payment = 0.10 × pay ÷ 12. Solve for pay.',explain:'$257.30 = 0.10 × S ÷ 12, so S = $257.30 × 12 ÷ 0.10 = $30,876 a year.'},
  {lvl:'ap',kind:'num',q:'Find the payment per $1,000 on a 15-year loan at 6.52%: 1,000 × i/(1 − (1 + i)⁻¹⁸⁰) with i = 0.0652 ÷ 12. Round to the cent.',answer:8.72,tol:0.01,unit:'$',d:2,hint:'i ≈ 0.0054333. Find (1.0054333)⁻¹⁸⁰ first.',explain:'(1.0054333)⁻¹⁸⁰ ≈ 0.37706, so 1,000 × 0.0054333 ÷ 0.62294 ≈ $8.72 a month per $1,000.'},
  {lvl:'ap',instant:true,q:'Why does the most you can borrow jump up when pay is high enough for a debt of $50,000?',choices:['The rate goes down','The plan becomes 20 years, so k gets smaller and the same payment repays more','Federal loans are forgiven at $50,000'],correct:1,explain:'D = payment ÷ k. At $50,000 the plan switches from 15 to 20 years, so k falls from about 0.00872 to 0.00747 and the same payment covers more debt, at the cost of more interest.'}
 ],
 tour:[
  {title:'One degree, many jobs',text:'Psychology graduates work in many fields, and many work outside psychology. These numbers count all of them. Among full-time workers ages 22 to 26, a quarter earn under $32,000, half earn under $43,000, and a quarter earn over $57,000.',pause:true,setup:sim=>BioLab.setValues(sim,{major:'psych',debt:29500,limit:10,rate:6.52,reveal:true}),focus:[0,0,800,50]},
  {title:'Your limit',text:'A common guideline keeps a student loan payment under 10% of pay before taxes. At $43,000 a year that is $43,000 ÷ 12 × 0.10 = $358.33 a month.',pause:true},
  {title:'Payment is proportional to debt',text:'On a 15-year federal loan at 6.52%, every $1,000 borrowed costs $8.72 a month. So $358.33 repays $358.33 ÷ $8.72 × 1,000 ≈ $41,093.',pause:true,focus:[0,50,490,400]},
  {title:'Three paychecks, three answers',text:'Do the same for each paycheck: about $30,574 fits low pay and $63,609 fits high pay, over 20 years. A quarter of graduates earn even more than the high number.',pause:true,focus:[0,50,490,400]},
  {title:'Your plan',text:'Borrowing $29,500 costs $257.30 a month: 9.6% of low pay, 7.2% of typical pay, 5.4% of high pay.',pause:true,focus:[490,50,310,400]},
  {title:'The federal limit',text:'A dependent undergraduate can borrow at most $31,000 in federal loans in all. More than that means private or parent loans, which follow other rules.',pause:true},
  {lvl:'honors',title:'A jump in the function',text:'At $25,000 the plan grows from 10 to 15 years, so the payment drops from $278.44 to $218.05 while the interest goes up. The graph of the most you can borrow jumps there too.',pause:true,setup:sim=>BioLab.setValues(sim,{debt:25000,reveal:true})}
 ],
 lab:{bio:'<p><b>Question:</b> How does the major change the most you can borrow?</p><ol><li>Turn on <b>Show the answer now</b>. Keep 10% and $29,500.</li><li>Record a trial for five majors you are curious about.</li><li>For each, record <b>Most that fits</b> for the low and high jobs.</li></ol><p>Write one sentence: is the gap between low and high bigger than the gap between majors?</p>'+INV,
  honors:'<p><b>Question:</b> Is the payment proportional to the debt?</p><ol><li>Record the monthly payment for $5,000, $10,000, $15,000 and $20,000.</li><li>Then for $25,000, $30,000 and $40,000.</li></ol><p>Find the payment per $1,000 in each group. Explain the change at $25,000 with the new standard plan.</p>'+INV,
  ap:'<p><b>Question:</b> How does the rate change the most you can borrow?</p><ol><li>At typical pay, record <b>Most that fits</b> at rates of 4%, 5%, 6.52% and 8%.</li><li>Record the total interest on your plan at each rate.</li></ol><p><b>CER:</b> Use k = i/(1 − (1 + i)⁻ⁿ) to explain both results.</p>'+INV},
 terms:[
  {t:'Proportional relationship',d:'Two amounts whose ratio stays the same: y = kx. Double one and the other doubles.'},
  {t:'Percentile',d:'The value below which a given share of the data falls. The 25th percentile of pay is the pay that a quarter of workers earn less than. Here low, typical and high pay are the 25th, 50th and 75th percentiles.'},
  {t:'Median',d:'The middle value: half earn less and half earn more.'},
  {t:'Piecewise function',d:'A function with different rules on different intervals, like a loan plan whose length changes at $25,000.',lvl:'honors'},
  {t:'Standard repayment plan',d:'Fixed monthly payments until the loan is paid off. For new federal loans, the length depends on how much you owe.',lvl:'honors'}
 ],
 about:'<p><b>Model.</b> Federal student loans at one fixed rate, repaid on the standard plan for loans first borrowed on or after July 1, 2026: 10 years under $25,000, 15 years from $25,000 to $49,999, 20 years from $50,000 to $99,999 and 25 years at $100,000 or more. Payment = k × debt with k = i/(1 − (1 + i)⁻ⁿ). The most you can borrow keeps the payment at your limit: (limit × pay ÷ 12) ÷ k, in the longest plan that the result qualifies for.</p><p><b>Where the numbers come from.</b> Pay for each major: Georgetown University Center on Education and the Workforce, <i>The Major Payoff</i> (2025): earnings of full-time, full-year workers ages 22 to 26 with only a bachelor’s degree, at the 25th percentile, median and 75th percentile, from Census ACS data for 2009 to 2023 in 2024 dollars. Loan rate: 6.52% for undergraduate federal loans first paid out July 1, 2026 to June 30, 2027. Average debt: $29,560 for 2023–24 bachelor’s graduates who borrowed (College Board, <i>Trends in Student Aid</i>). The 10% limit is a common guideline, not a rule. A dependent undergraduate can borrow at most $31,000 in federal loans in all.</p><p><b>What this number hides.</b> Pay is counted by major, not by job: it includes everyone with that major, whatever work they do, so a theology major working in tech is in the theology numbers. The three paychecks are not a forecast for you. They describe people ages 22 to 26 who already graduated, in many jobs and places; a quarter earn more than the high number; people change fields; and pay grows with experience. People who went on to a graduate degree are not counted. A longer plan lowers the payment but adds years and interest. New federal borrowers can also choose the Repayment Assistance Plan, which sets the payment from a share of income. A major is not only a paycheck, and these numbers cannot say what a degree is worth to you.</p><p><b>This is a simplified math model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
