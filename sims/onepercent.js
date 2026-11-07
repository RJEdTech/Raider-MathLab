(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Two fixed-rate loans with the same amount and length: one at r, one at r + gap.
   Monthly rate i = APR/1200, n = 12 × years. Payment M = P·i / (1 − (1 + i)^−n). Total paid = M·n. */
const LOAN={car:{l:'car loan',amt:15000,yrs:5,rate:7},student:{l:'student loan',amt:30000,yrs:10,rate:5.5}};
const pay=(P,r,n)=>{const i=r/1200;return i>0?P*i/(1-Math.pow(1+i,-n)):P/n;};
const N=sim=>Math.round(sim.p.yrs*12);
const rB=sim=>sim.p.rate+(atLeast('honors')?sim.p.gap:1);
const gapNow=sim=>atLeast('honors')?sim.p.gap:1;
const mA=sim=>pay(sim.p.amt,sim.p.rate,N(sim)),mB=sim=>pay(sim.p.amt,rB(sim),N(sim));
const tA=sim=>mA(sim)*N(sim),tB=sim=>mB(sim)*N(sim);
const extra=sim=>tB(sim)-tA(sim);
const naive=sim=>sim.p.amt*gapNow(sim)/100*sim.p.yrs;
/* interest paid by the end of each month, for the cumulative graph */
function cumInt(P,r,n){const i=r/1200,M=pay(P,r,n);let B=P,I=0;const out=[0];for(let m=1;m<=n;m++){const it=B*i;I+=it;B=B+it-M;out.push(I);}return out;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g));
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>(Math.round(v*100)/100).toString()+'%';
const loanName=sim=>(LOAN[sim.p.loan]||LOAN.car).l;
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function setLoan(sim){const L=LOAN[sim.p.loan]||LOAN.car;BioLab.setValues(sim,{amt:L.amt,yrs:L.yrs,rate:L.rate});clearGut(sim);}

const SIM={
 id:'onepercent',hash:'onepercent',apUnit:19,order:10,tab:'1% apart',kind:'Simulation',
 card:'Guess what one extra percentage point costs on a car or student loan, then let the payment formula count every dollar.',
 title:'1% apart: what a slightly higher rate really costs',
 lede:{bio:'Two people borrow the same amount for the same car. One gets 7%, the other 8%, maybe because a score put them in a lower tier. One point sounds tiny. How many dollars is it?',
  honors:'Each month the loan charges interest on what you still owe, and your payment covers that interest plus a bit of the balance. The payment formula comes from a geometric series, and a higher rate or a longer loan grows the total faster than you expect.',
  ap:'With monthly rate i and n payments, P(1 + i)ⁿ = M[(1 + i)ⁿ − 1]/i, so M = Pi / (1 − (1 + i)⁻ⁿ). The extra cost of a rate gap is n·(M₂ − M₁), and it grows with both n and P.'},
 scale:'One fixed-rate loan, paid monthly. Amounts and rates are realistic illustrations, not offers from any lender.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The loan',
 controls:[
  {id:'guess',label:'Your gut: the extra you pay over the whole loan at the higher rate',type:'range',min:0,max:5000,step:10,def:1000,unit:' dollars'},
  {id:'loan',label:'Loan',type:'seg',def:'car',noGut:true,onChange:setLoan,options:[{v:'car',l:'Car loan'},{v:'student',l:'Student loan'}]},
  {id:'amt',label:'Amount borrowed',type:'range',min:2000,max:60000,step:500,def:15000,unit:' dollars',noGut:true,onChange:clearGut},
  {id:'yrs',label:'Years to pay it back',type:'range',min:1,max:15,step:1,def:5,unit:' years',noGut:true,onChange:clearGut},
  {id:'rate',label:'Your rate (APR)',type:'range',min:2,max:16,step:0.25,def:7,unit:'%',d:2,noGut:true,onChange:clearGut,help:'APR is the yearly rate. The loan charges one twelfth of it each month.'},
  {id:'gap',label:'How much higher the second rate is',type:'range',min:0.25,max:8,step:0.25,def:1,unit:' points',d:2,lvl:'honors',noGut:true,onChange:clearGut,help:'A gap of a few points can come from a lower credit tier. The tiers here are illustrations.'},
  {id:'reveal',label:'Show the totals now',type:'toggle',def:false,help:'Normally the totals appear once you lock in your gut answer.'}
 ],
 actions:[{id:'tier',label:'Try a 4-point tier gap',lvl:'honors',run(sim){BioLab.setValues(sim,{gap:4,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'payA',label:'Monthly payment at your rate',unit:'dollars',d:2,min:0,max:null,get:mA},
  {id:'payB',label:'Monthly payment at the higher rate',unit:'dollars',d:2,min:0,max:null,get:mB},
  {id:'totA',label:'Total paid at your rate',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?tA(sim):null},
  {id:'totB',label:'Total paid at the higher rate',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?tB(sim):null},
  {id:'extra',label:'Extra paid over the loan',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?extra(sim):null},
  {id:'off',label:'Your gut is off by',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-extra(sim)):null},
  {id:'intA',label:'Interest at your rate',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?tA(sim)-sim.p.amt:null},
  {id:'growth',label:'Growth factor (1 + i)ⁿ',text:true,lvl:'ap',get:sim=>{const i=sim.p.rate/1200,n=N(sim);return `At ${pc(sim.p.rate)}: i = ${(+i.toFixed(6))}, n = ${n}, (1 + i)ⁿ = ${Math.pow(1+i,n).toFixed(4)}. At ${pc(rB(sim))}: ${Math.pow(1+rB(sim)/1200,n).toFixed(4)}.`;}}
 ],
 graphs:[{id:'len',label:'Extra paid vs. years of the loan',custom:true}],defaultGraph:'len',
 plot(sim,ctx,box){const P=sim.p.amt,r=sim.p.rate,g=gapNow(sim),f=y=>pay(P,r+g,y*12)*y*12-pay(P,r,y*12)*y*12;
  const top=Math.max(500,Math.ceil(f(15)/500)*500),sh=shown(sim);
  const ax=axes(ctx,box,{xmin:0,xmax:15,ymin:0,ymax:top,xl:'Years to pay it back',yl:'Extra paid ($)'});
  if(!sh){txt(ctx,'Lock in your gut to see the extra cost',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let y=1;y<=15;y+=0.25){const px=ax.X(y),py=ax.Y(f(y));y===1?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
  ctx.strokeStyle=PAL['s4'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(15),ax.Y(Math.min(top,P*g/100*15)));ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.yrs),ax.Y(f(sim.p.yrs)),6,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+8,[{label:'Real extra cost',color:PAL['g-line']},{label:'Gap × amount × years (a common guess)',color:PAL['s4'],dash:true}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),n=N(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const P=sim.p.amt,TA=tA(sim),TB=tB(sim),r1=sim.p.rate,r2=rB(sim);
  txt(ctx,(big?'':'Same ')+$(P)+' '+loanName(sim)+', '+sim.p.yrs+' year'+(sim.p.yrs===1?'':'s')+' ('+n+' payments)',24,32*Math.min(k,1.2),{s:15*k,w:700});
  /* two stacked bars: what you pay back at each rate */
  const x0=24,x1=776,W=x1-x0,sc=W/TB;
  const row=(y,r,M,T,col,lab)=>{txt(ctx,lab+' '+pc(r),x0,y-12*k,{s:13*k,w:700,c:col});
   txt(ctx,(big?'':'Payment ')+$2(M)+' a month',x1,y-12*k,{s:13*k,w:700,a:'right'});
   const h=30*Math.min(k,1.3);rr(ctx,x0,y,P*sc,h,4);ctx.fillStyle=PAL['s2'];ctx.fill();
   txt(ctx,big?$(P):$(P)+' borrowed',x0+10,y+h/2+5*k,{s:12*k,w:700,c:'#fff'});
   const iw=(T-P)*sc;rr(ctx,x0+P*sc,y,Math.max(2,iw),h,4);ctx.fillStyle=sh?PAL['s4']:PAL['line'];ctx.fill();
   const it=sh?'+'+$(T-P):'?';ctx.font='700 '+(12*k)+'px '+FONT;const tw=ctx.measureText(it).width;
   txt(ctx,it,tw+16<iw?x0+P*sc+iw/2:x1,tw+16<iw?y+h/2+5*k:y+h+16*k,{s:12*k,w:700,c:tw+16<iw?'#1b1b1b':PAL['cv-ink'],a:tw+16<iw?'center':'right'});
   return y+h;};
  const yA=78*Math.min(k,1.25)+10,endA=row(yA,r1,mA(sim),TA,PAL['s3'],'Your rate:');
  const yB=endA+48*k,endB=row(yB,r2,mB(sim),TB,PAL['s1'],'Higher rate:');
  if(sh){/* the extra: the slice of the higher bar beyond the lower total */const xa=x0+TA*sc,xb=x0+TB*sc,h=30*Math.min(k,1.3);
   ctx.fillStyle=PAL['s1'];rr(ctx,xa,yB,Math.max(3,xb-xa),h,3);ctx.fill();
   ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(xa,endA);ctx.lineTo(xa,yB);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Extra: '+$(TB-TA),xb,endB+16*k,{s:13*k,w:700,c:PAL['s1'],a:'right'});}
  /* cumulative interest over time */
  const gT=endB+(big?48:60)*k,gB=430,gL=big?92:80,gR=776;
  if(gB-gT>60){const cA=cumInt(P,r1,n),cB=cumInt(P,r2,n),ymax=Math.max(100,cB[n]),X=m=>gL+(gR-gL)*m/n,Y=v=>gB-(gB-gT)*v/ymax;
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gL,gT);ctx.lineTo(gL,gB);ctx.lineTo(gR,gB);ctx.stroke();
   txt(ctx,'Interest paid so far',gL+8,gT-6,{s:12*k,w:700,c:PAL['cv-soft']});
   txt(ctx,sh?$(ymax):'?',gL-6,gT+12*k,{s:12*k,c:PAL['cv-soft'],a:'right'});txt(ctx,'$0',gL-6,gB,{s:12*k,c:PAL['cv-soft'],a:'right'});
   txt(ctx,'Year '+sim.p.yrs,gR,gB+16*k>448?gB-6:gB+16*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
   if(sh){ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.16;ctx.beginPath();for(let m=0;m<=n;m++)ctx.lineTo(X(m),Y(cB[m]));for(let m=n;m>=0;m--)ctx.lineTo(X(m),Y(cA[m]));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    [[cA,PAL['s3']],[cB,PAL['s1']]].forEach(([c,col])=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let m=0;m<=n;m++){m?ctx.lineTo(X(m),Y(c[m])):ctx.moveTo(X(m),Y(c[m]));}ctx.stroke();});
    if(!big)txt(ctx,'Shaded: the extra, adding up month by month',X(n*0.5),Y(cB[Math.round(n*0.5)])-14,{s:12*k,c:PAL['cv-soft'],a:'right'});}
   else txt(ctx,big?'Lock in your gut to see':'Lock in your gut to see how the interest adds up',(gL+gR)/2,(gT+gB)/2,{s:13*k,c:PAL['cv-soft'],a:'center'});}
  if(G&&G.g&&gB-gT>60){pill(ctx,'Your gut: '+$(G.g.guess)+' extra',gR-80*k,gB-30*k,PAL['card2'],PAL['s4'],12*Math.min(k,1.4));}},
 narrate(sim){const n=N(sim),e=extra(sim);
  if(!shown(sim))return `Same ${$(sim.p.amt)} ${loanName(sim)}, same ${n} payments. One rate is ${pc(sim.p.rate)}, the other ${pc(rB(sim))}. The payments differ by only ${$2(mB(sim)-mA(sim))} a month. <b>How much is that over the whole loan?</b>`;
  return `The higher rate costs <b>${$(e)} more</b> over ${n} payments: ${$2(mB(sim)-mA(sim))} a month, every month. ${e<naive(sim)?`That is less than ${pc(gapNow(sim))} of ${$(sim.p.amt)} for each year (${$(naive(sim))}), because you owe less each month as you pay the loan down.`:'Here the extra is even more than the gap times the amount times the years, because interest builds on a balance that shrinks slowly.'}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Your friend got the same loan at a rate 1 point higher. Drag the slider here to how many extra dollars you think they pay over the whole loan. Then lock it in.',
   honors:'Before the formula: drag the slider here to your gut guess of the extra dollars the higher rate costs over the whole loan, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-extra(sim)),guess:sim.p.guess,label:`about ${$(sim.p.guess)} extra`};},
  solve(sim){const e=extra(sim);sim.p.guess=Math.round(e);return {v:Math.abs(sim.p.guess-e),guess:e,label:`${$(e)} extra (${$2(mB(sim)-mA(sim))} a month)`};},
  how:{bio:'The math finds each monthly payment from the loan formula, multiplies by the number of payments, and subtracts. Each month the loan charges interest only on what you still owe, so the extra builds up month by month.',
   ap:'M = Pi / (1 − (1 + i)⁻ⁿ) for each rate, then the extra is n·(M₂ − M₁).'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),n=N(sim),mo=mB(sim)-mA(sim),pm=mA(sim);
   const tail=` In real terms: the higher rate takes ${$2(mo)} out of every payment for ${n} months, about ${(m.guess/pm).toFixed(1)} extra monthly payments in all.`;
   if(off<=Math.max(25,0.05*m.guess))return `Your gut was right on: within ${$(off)}. You already sense how a small rate gap adds up.`+tail;
   const nv=naive(sim),near=Math.abs(g.guess-nv)<0.1*nv;
   return `Your gut was off by <b>${$(off)}</b>: you guessed ${$(g.guess)}, and the formula says <b>${$(m.guess)}</b>. ${g.guess>m.guess?(near?`Your guess is close to ${pc(gapNow(sim))} × ${$(sim.p.amt)} × ${sim.p.yrs} years. That would be right only if you owed the full amount the whole time; you pay it down, so the real extra is smaller.`:'You guessed high: you pay the balance down every month, so the extra interest shrinks as you go.'):'You guessed low: one point sounds tiny, but it is charged every month on what you still owe.'}`+tail;},
  again(sim){const ty=Math.random()<0.5?'car':'student';const R=a=>a[Math.floor(Math.random()*a.length)];
   sim.p.loan=ty;if(ty==='car'){sim.p.amt=R([8000,12000,15000,20000,25000]);sim.p.yrs=R([3,4,5,6]);sim.p.rate=R([5,6,7,8.5,10,12]);}
   else{sim.p.amt=R([10000,20000,30000,40000]);sim.p.yrs=10;sim.p.rate=R([4.5,5.5,6.5,7.5]);}
   sim.p.guess=1000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A $15,000 car loan for 5 years at 7% costs $17,821 in all. At 8% it costs $18,249. Why is the difference ($428) less than 1% of $15,000 for each of 5 years ($750)?',choices:['The bank rounds in your favor','You pay the balance down, so the extra 1% is charged on less and less money','The higher rate only applies in the first year'],correct:1,explain:'Interest is charged on what you still owe. That starts at $15,000 and falls to $0, so on average you owe a little more than half of it. The extra 1% lands on that shrinking balance.'},
  {lvl:'bio',instant:true,q:'Same 1-point gap, but now a $30,000 student loan paid over 10 years (5.5% vs 6.5%). Compared with the $428 on the car loan, the extra is…',choices:['About the same, since the gap is still 1 point','About twice as much','More than four times as much: about $1,808'],correct:2,explain:'Twice the money for twice as long, and interest stacks on interest: $40,877 − $39,069 ≈ $1,808. Bigger and longer loans magnify a small rate gap.'},
  {lvl:'honors',instant:true,q:'A score puts you 4 points higher (11% instead of 7%) on a $15,000, 5-year car loan. About how much more do you pay in total?',choices:['About $428, four times smaller than you think','About $1,750','About $3,000'],correct:1,explain:'At 11% the payment is $326.14 against $297.02, a $29.12 gap for 60 months: about $1,747. That is roughly four times the 1-point cost, a bit more because higher rates compound faster.'},
  {lvl:'honors',instant:true,q:'Which change raises the extra cost of a 1-point rate gap the most, starting from $15,000 for 5 years at 7%?',choices:['Lowering the starting rate to 6%','Stretching the loan to 10 years','Paying on the 1st of the month instead of the 15th'],correct:1,explain:'Over 10 years the extra is about $939, more than double the 5-year $428. The starting rate barely matters: at 6% vs 7% the 5-year extra is $422.'},
  {lvl:'ap',instant:true,q:'Each month you owe B(1 + i) − M. After n payments the balance must be 0. Which equation does the payment M satisfy?',choices:['P(1 + i)ⁿ = M·n','P(1 + i)ⁿ = M[(1 + i)ⁿ − 1]/i','P = M(1 + i)ⁿ'],correct:1,explain:'The loan grows to P(1 + i)ⁿ, and the payments, each growing from its own month, add to the geometric series M[1 + (1 + i) + … + (1 + i)ⁿ⁻¹] = M[(1 + i)ⁿ − 1]/i. Solving gives M = Pi / (1 − (1 + i)⁻ⁿ).'},
  {lvl:'ap',instant:true,q:'For a very long loan (n → ∞), what does the payment M approach?',choices:['0','P·i: just the monthly interest','P / n'],correct:1,explain:'As n grows, (1 + i)⁻ⁿ → 0, so M → Pi. You would pay the interest forever and never touch the balance. That is why long loans are so sensitive to the rate: almost all of each payment is interest at first.'}
 ],
 tour:[
  {title:'Same loan, two rates',text:'Two people each borrow $15,000 for a car and pay it back over 5 years: 60 monthly payments. One gets 7%. The other gets 8%.',pause:true,setup:sim=>BioLab.setValues(sim,{loan:'car',amt:15000,yrs:5,rate:7,gap:1,reveal:true})},
  {title:'The monthly payments',text:'The payment formula gives $297.02 a month at 7% and $304.15 at 8%. That is only $7.13 apart: easy to shrug off at the dealership.',pause:true,focus:[0,40,800,150]},
  {title:'What you pay back',text:'The blue part is the $15,000 you borrowed. The orange part is interest. At 7% you pay $2,821 in interest; at 8%, $3,249.',pause:true},
  {title:'Why it is not $750',text:'1% of $15,000 for 5 years would be $750. But each month you owe a little less, so the extra 1% lands on a shrinking balance. The real extra is $428.',pause:true},
  {title:'The gap grows every month',text:'The bottom graph adds up the interest paid so far. The shaded gap between the two lines is the extra cost building month by month.',pause:true,focus:[0,250,800,200]},
  {title:'A longer, bigger loan',text:'Now a $30,000 student loan over 10 years, at 5.5% and 6.5%. The same 1 point now costs $1,808: $15.07 a month for 120 months.',pause:true,setup:sim=>BioLab.setValues(sim,{loan:'student',amt:30000,yrs:10,rate:5.5,gap:1,reveal:true})},
  {lvl:'honors',title:'A lower tier',text:'Scores can move you several points, not just one. Back on the car loan, a 4-point gap (7% vs 11%) costs about $1,747.',pause:true,setup:sim=>BioLab.setValues(sim,{loan:'car',amt:15000,yrs:5,rate:7,gap:4,reveal:true})},
  {lvl:'ap',title:'Where the formula comes from',text:'The loan grows to P(1 + i)ⁿ while the payments grow to M[(1 + i)ⁿ − 1]/i, a geometric series. Set them equal and solve: M = Pi / (1 − (1 + i)⁻ⁿ).',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does a 1-point gap change with the size of the loan?</p><ol><li>Turn on <b>Show the totals now</b>. Keep 5 years and 7%.</li><li>Record a trial at $5,000, $10,000, $20,000 and $40,000.</li><li>Graph <b>Trials</b> with the amount on x and the extra paid on y.</li></ol><p>Write one sentence: what pattern do you see?</p>',
  honors:'<p><b>Question:</b> Which matters more for the extra cost: the length of the loan or the starting rate?</p><ol><li>At $15,000 and a 1-point gap, record the extra for 3, 5, 8 and 12 years at 7%.</li><li>Now hold 5 years and record it at 4%, 7%, 10% and 14%.</li></ol><p>Explain your results with the idea of interest charged on what you still owe.</p>',
  ap:'<p><b>Question:</b> Is the extra cost proportional to the gap?</p><ol><li>At $15,000, 5 years and 7%, record the extra for gaps of 1, 2, 4 and 8 points.</li><li>Divide each extra by its gap.</li></ol><p><b>CER:</b> Use the payment formula to explain why the ratio creeps up as the gap grows.</p>'},
 terms:[
  {t:'APR',d:'Annual percentage rate: the yearly interest rate. A loan charges one twelfth of it each month.'},
  {t:'Percentage point',d:'The plain difference between two rates. 7% to 8% is 1 percentage point, even though 8% is about 14% more than 7%.'},
  {t:'Amortization',d:'Paying a loan off with equal payments. Each payment covers that month’s interest, and the rest pays down the balance.',lvl:'honors'},
  {t:'Credit score tier',d:'A band of credit scores that a lender treats the same way. Moving down a tier can raise the rate you are offered.',lvl:'honors'},
  {t:'Geometric series',d:'A sum where each term is the last one times the same ratio: a + ar + ar² + … = a(rⁿ − 1)/(r − 1).',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> A fixed-rate loan with monthly payments. Monthly rate i = APR ÷ 1200 and n = 12 × years. Payment M = Pi / (1 − (1 + i)⁻ⁿ); total paid = M·n; the extra cost of the higher rate is n·(M₂ − M₁). Amounts, rates and tier gaps are realistic illustrations, not offers from any lender. Real loans can add fees, and lenders round payments to the cent.</p><p><b>Where scores come in.</b> Lenders often set your rate by your credit score, so a lower tier can mean a higher rate. In <i>Weapons of Math Destruction</i> (Ch. 8), Cathy O’Neil warns about “e-scores”: scores companies build from data such as your zip code. A zip code is a proxy: it says where you live, not how you pay your bills.</p><p><b>This is a simplified math model, not financial advice.</b> Before you sign a loan, compare the APR and the total you will repay, and ask a trusted adult or the lender to explain anything that is unclear.</p>'
};
BioLab.register(SIM);
})();
