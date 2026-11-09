(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Two fixed-rate mortgages on the same amount P. Monthly rate i = APR/1200, n months.
   Payment M = Pi / (1 − (1 + i)⁻ⁿ). Total interest = nM − P.
   An extra amount x each month on the 30-year loan: the balance B ← B(1 + i) − (M + x) until it reaches 0.
   Months to pay off with payment M′: n = −log(1 − Pi/M′) / log(1 + i). */
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>(Math.round(v*100)/100).toString()+'%';
const c2=v=>Math.round(v*100)/100;
const pay=(P,r,n)=>{const i=r/1200;return i>0?P*i/(1-Math.pow(1+i,-n)):P/n;};
const m30=sim=>c2(pay(sim.p.amt,sim.p.r30,360)),m15=sim=>c2(pay(sim.p.amt,sim.p.r15,180));
const I30=sim=>360*m30(sim)-sim.p.amt,I15=sim=>180*m15(sim)-sim.p.amt;
const saved=sim=>I30(sim)-I15(sim);
const extra=sim=>atLeast('honors')?sim.p.extra:0;
/* the 30-year loan with an extra payment each month: months and interest, by stepping the balance */
function withExtra(sim){if(!(extra(sim)>0))return {months:360,interest:I30(sim),bal:balances(sim.p.amt,sim.p.r30,360)};const i=sim.p.r30/1200,M=m30(sim)+extra(sim);let B=sim.p.amt,I=0,k=0;const bal=[B];while(B>5&&k<400){const it=B*i;I+=it;B=B+it-M;if(B<0)B=0;k++;bal.push(B);}return {months:k,interest:I,bal};}
const nLog=sim=>{const i=sim.p.r30/1200,M=m30(sim)+extra(sim);return -Math.log(1-sim.p.amt*i/M)/Math.log(1+i);};
function balances(P,r,n){const i=r/1200,M=c2(pay(P,r,n));let B=P;const out=[B];for(let k=1;k<=n;k++){B=Math.max(0,B*(1+i)-M);out.push(B);}return out;}
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(sim.gutS&&sim.gutS.g&&!pending(sim)));
const GS=sim=>touring(sim)?null:sim.gutS;
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const calcAns=sim=>c2(360*m30(sim)-180*m15(sim));

const SIM={
 id:'mortgageterm',hash:'mortgageterm',apUnit:4,order:3.6,tab:'30-year vs. 15-year mortgage',kind:'Simulation',
 skills:{bio:'Repeated payments and the loan payment formula · Algebra 2 (Unit 5)',honors:'The loan payment formula and total interest · Algebra 2 (Unit 5), Precalculus (Unit 6)',ap:'Solving for time with logarithms: n = −log(1 − Pi/M)/log(1 + i) · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2B)'},
 card:'Same home, same loan: guess how much interest a 15-year mortgage saves over a 30-year one, then let the payment formula count it.',
 title:'30-year vs. 15-year mortgage: what the shorter loan saves',
 lede:{bio:'A family borrows $320,000 for a home. A 30-year loan has the smaller monthly payment. A 15-year loan costs more each month but ends in half the time. How much interest does the shorter loan save?',
  honors:'Total interest is everything you pay minus what you borrowed: nM − P. Halving n does more than halve the interest, because early payments on a long loan are mostly interest. An extra amount each month goes straight to the balance.',
  ap:'With monthly rate i, M = Pi / (1 − (1 + i)⁻ⁿ). Solve the same equation for n and you get n = −log(1 − Pi/M)/log(1 + i): the number of months a payment of M takes to clear the loan.'},
 scale:'One fixed-rate home loan, paid monthly. Rates are Freddie Mac’s weekly averages for Nov 5, 2026; the loan amount is an illustration.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The loan',
 controls:[
  {id:'guess',label:'Your gut: how much less interest does the 15-year loan pay?',type:'range',min:0,max:500000,step:1000,def:50000,unit:' dollars'},
  {id:'amt',label:'Amount borrowed',type:'range',min:100000,max:600000,step:10000,def:320000,unit:' dollars',noGut:true,onChange:clear,help:'$320,000 is what a family borrows on a $400,000 home with 20% down.'},
  {id:'r30',label:'30-year rate',type:'range',min:4,max:9,step:0.01,def:7.18,unit:'%',d:2,noGut:true,onChange:clear,help:'Freddie Mac’s average for a 30-year fixed mortgage, Nov 5, 2026.'},
  {id:'r15',label:'15-year rate',type:'range',min:4,max:9,step:0.01,def:6.57,unit:'%',d:2,noGut:true,onChange:clear,help:'Freddie Mac’s average for a 15-year fixed mortgage, Nov 5, 2026. Shorter loans usually get a lower rate.'},
  {id:'extra',label:'Extra paid each month on the 30-year loan',type:'range',min:0,max:1500,step:50,def:0,unit:' dollars',lvl:'honors',noGut:true,onChange:clear},
  {id:'reveal',label:'Show the totals now',type:'toggle',def:false,help:'Normally the totals appear once you lock in your gut answer.'}
 ],
 actions:[{id:'x200',label:'Add $200 a month to the 30-year loan',lvl:'honors',run(sim){BioLab.setValues(sim,{extra:200,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'m30',label:'30-year monthly payment',unit:'dollars',d:2,min:0,max:null,get:m30},
  {id:'m15',label:'15-year monthly payment',unit:'dollars',d:2,min:0,max:null,get:m15},
  {id:'mdiff',label:'The 15-year costs more each month by',unit:'dollars',d:2,min:0,max:null,get:sim=>m15(sim)-m30(sim)},
  {id:'i30',label:'Total interest, 30-year',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?I30(sim):null},
  {id:'i15',label:'Total interest, 15-year',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?I15(sim):null},
  {id:'saved',label:'Interest the 15-year saves',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?saved(sim):null},
  {id:'off',label:'Your gut is off by',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-saved(sim)):null},
  {id:'xmonths',label:'Months to pay off the 30-year with the extra',unit:'months',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?withExtra(sim).months:null},
  {id:'xsaved',label:'Interest the extra payment saves',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?I30(sim)-withExtra(sim).interest:null},
  {id:'nlog',label:'n from the log formula',unit:'months',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?nLog(sim):null}
 ],
 graphs:[{id:'byrate',label:'Total interest vs. the 30-year rate',custom:true}],defaultGraph:'byrate',
 plot(sim,ctx,box){const P=sim.p.amt,gap=sim.p.r30-sim.p.r15,f30=r=>360*pay(P,r,360)-P,f15=r=>180*pay(P,Math.max(0.01,r-gap),180)-P;
  const top=Math.ceil(f30(9)/100000)*100000;const ax=axes(ctx,box,{xmin:4,xmax:9,ymin:0,ymax:top,xl:'30-year rate (%), with the 15-year rate the same amount lower',yl:'Total interest ($)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the totals',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  [[f30,PAL['s2']],[f15,PAL['s3']]].forEach(([f,c])=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();for(let r=4;r<=9.001;r+=0.05){const px=ax.X(r),py=ax.Y(f(r));r===4?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();});
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.r30),ax.Y(I30(sim)),5,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+8,[{label:'30-year',color:PAL['s2']},{label:'15-year',color:PAL['s3']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),big=k>1.3,fs=Math.min(k,1.6),P=sim.p.amt,X30=withExtra(sim),hx=extra(sim)>0;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,$(P)+' borrowed · 30 years at '+pc(sim.p.r30)+' or 15 years at '+pc(sim.p.r15),20,28*Math.min(k,1.2),{s:14*fs,w:700});
  /* left: what you still owe, year by year */
  const gL=big?62:76,gR=big?440:470,gT=62*Math.min(k,1.25),gB=450-30*fs,X=y=>gL+(gR-gL)*y/30,Y=v=>gB-(gB-gT)*v/P;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gL,gT);ctx.lineTo(gL,gB);ctx.lineTo(gR,gB);ctx.stroke();
  [0,10,15,20,30].filter(y=>!big||y!==20).forEach(y=>txt(ctx,String(y),X(y),gB+15*fs,{s:12*fs,c:PAL['cv-soft'],a:'center'}));
  txt(ctx,'Years →',gR,gB-6,{s:12*fs,w:700,c:PAL['cv-soft'],a:'right'});
  txt(ctx,'Still owed',gL+6,gT-6,{s:12*fs,w:700,c:PAL['cv-soft']});
  txt(ctx,big?'$'+Math.round(P/1000)+'K':$(P),gL-6,gT+10,{s:12*fs,c:PAL['cv-soft'],a:'right'});
  const line=(B,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash(dash?[7,5]:[]);ctx.beginPath();B.forEach((v,m)=>{const px=X(m/12),py=Y(v);m?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();ctx.setLineDash([]);};
  const b30=balances(P,sim.p.r30,360),b15=balances(P,sim.p.r15,180);
  line(b30,PAL['s2']);line(b15,PAL['s3']);if(hx&&sh)line(X30.bal,PAL['s5'],true);
  txt(ctx,'30-year',X(21),Y(b30[252])-10,{s:12*fs,w:700,c:PAL['s2']});
  txt(ctx,'15-year',X(9.5),Y(b15[114])+18*fs,{s:12*fs,w:700,c:PAL['s3'],a:'right'});
  if(hx&&sh&&!big)txt(ctx,'+'+$(extra(sim))+' a month: '+(X30.months/12).toFixed(1)+' years',X(X30.months/12)-4,gB-24,{s:12*fs,w:700,c:PAL['s5'],a:'right'});
  /* right: what each loan costs in all */
  const bL=big?480:510,bR=780,bT=gT+22*fs,bB=gB,bw=(bR-bL)/2-16,tot30=P+I30(sim),top=tot30*1.05,BY=v=>bB-(bB-bT)*v/top;
  txt(ctx,'Paid in all',(bL+bR)/2,gT,{s:12*fs,w:700,c:PAL['cv-soft'],a:'center'});
  [[I30(sim),'30-year',bL,m30(sim)],[I15(sim),'15-year',bL+bw+32,m15(sim)]].forEach(([I,l,x,M])=>{
   ctx.fillStyle=PAL['s2'];rr(ctx,x,BY(P),bw,bB-BY(P),4);ctx.fill();
   txt(ctx,big?'Loan':'Loan '+$(P),x+bw/2,(BY(P)+bB)/2,{s:12*fs,w:700,c:'#fff',a:'center',b:'middle'});
   if(sh){ctx.fillStyle=PAL['s4'];rr(ctx,x,BY(P+I),bw,BY(P)-BY(P+I),4);ctx.fill();txt(ctx,'+'+$(I),x+bw/2,BY(P+I)-6,{s:12*fs,w:700,a:'center'});if(!big)txt(ctx,'interest',x+bw/2,(BY(P+I)+BY(P))/2+4,{s:12*fs,c:'#1b1b1b',a:'center'});}
   else{ctx.strokeStyle=PAL['line'];ctx.setLineDash([5,4]);ctx.lineWidth=2;rr(ctx,x,BY(P)-60*fs,bw,60*fs,4);ctx.stroke();ctx.setLineDash([]);txt(ctx,'?',x+bw/2,BY(P)-24*fs,{s:22*fs,w:700,c:PAL['cv-soft'],a:'center'});}
   txt(ctx,l,x+bw/2,bB+15*fs,{s:12*fs,c:PAL['cv-soft'],a:'center'});
   if(!big)txt(ctx,$2(M)+'/mo',x+bw/2,bB+30,{s:12,c:PAL['cv-soft'],a:'center'});});
  if(!sh){const mine=G&&G.g;txt(ctx,mine?'Work out the interest saved':'Lock in your gut to see the interest',(bL+bR)/2,bT+10,{s:12*fs,c:PAL['cv-soft'],a:'center'});}
  if(G&&G.g&&!big)pill(ctx,'Your gut: '+$(G.g.guess)+' saved',(gL+gR)/2+40,gT+16,PAL['card2'],PAL['s4'],12*Math.min(k,1.4));},
 narrate(sim){if(!shown(sim))return `On ${$(sim.p.amt)}, the 30-year payment is ${$2(m30(sim))} and the 15-year payment is ${$2(m15(sim))}: ${$2(m15(sim)-m30(sim))} more each month. <b>How much interest does the shorter loan save?</b>`;
  const x=extra(sim)>0?` With ${$(extra(sim))} extra each month, the 30-year loan ends in ${(withExtra(sim).months/12).toFixed(1)} years and saves ${$(I30(sim)-withExtra(sim).interest)} of interest.`:'';
  return `The 30-year loan pays <b>${$(I30(sim))}</b> in interest and the 15-year pays <b>${$(I15(sim))}</b>: <b>${$(saved(sim))} less</b>, for ${$2(m15(sim)-m30(sim))} more each month.`+x;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Same $320,000 home loan. The 15-year payment is about $632 a month more than the 30-year payment. Drag the slider here to how much less interest you think the 15-year loan pays in all. Then lock it in.',
   honors:'Before the formula: drag the slider here to how much less interest you think the 15-year loan pays in all. Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-saved(sim)),guess:sim.p.guess,label:`about ${$(sim.p.guess)} less interest`};},
  solve(sim){const s=saved(sim);sim.p.guess=Math.round(s/1000)*1000;return {v:Math.abs(sim.p.guess-s),guess:s,label:`${$(s)} less interest`};},
  hint:{bio:'Lock in your gut. Then you will work out the interest from the two payments.'},
  calc:{unit:'$',d:2,tol:a=>Math.max(50,0.002*a),
   prompt:{bio:sim=>`Both loans borrow <b>${$(sim.p.amt)}</b>. The 30-year loan is <b>${$2(m30(sim))}</b> a month for 360 months. The 15-year loan is <b>${$2(m15(sim))}</b> a month for 180 months. How much less interest does the 15-year loan pay in all?`,
    ap:sim=>`Both loans borrow ${$(sim.p.amt)}. The 30-year payment is ${$2(m30(sim))} for 360 months. Use M = Pi / (1 − (1 + i)⁻ⁿ) with i = ${pc(sim.p.r15)} ÷ 12 and n = 180 to find the 15-year payment, rounded to the cent. Then find how much less interest the 15-year loan pays.`},
   answer:calcAns,
   hint:'Interest is everything you pay minus what you borrowed. Find it for each loan, then subtract.',
   steps(sim){const P=sim.p.amt,out=[];
    if(atLeast('ap')){const i=sim.p.r15/1200;out.push(`i = ${(i).toFixed(6)}, (1 + i)⁻¹⁸⁰ = ${Math.pow(1+i,-180).toFixed(6)}, so M = ${$(P)} × ${i.toFixed(6)} ÷ (1 − ${Math.pow(1+i,-180).toFixed(6)}) = ${$2(m15(sim))}.`);}
    out.push(`30-year: 360 × ${$2(m30(sim))} = ${$2(360*m30(sim))}, minus ${$(P)} borrowed = ${$2(I30(sim))} of interest.`);
    out.push(`15-year: 180 × ${$2(m15(sim))} = ${$2(180*m15(sim))}, minus ${$(P)} = ${$2(I15(sim))} of interest.`);
    out.push(`Difference: ${$2(I30(sim))} − ${$2(I15(sim))} = <b>${$2(calcAns(sim))}</b>.`);
    return out;}},
  formula(sim){const P=sim.p.amt;const a=`Interest = nM − P: 360 × ${$2(m30(sim))} − ${$(P)} = ${$(I30(sim))}, and 180 × ${$2(m15(sim))} − ${$(P)} = ${$(I15(sim))}. Saved: ${$(saved(sim))}.`;
   return atLeast('ap')?`M = Pi / (1 − (1 + i)⁻ⁿ) gives ${$2(m30(sim))} and ${$2(m15(sim))}.<br>`+a:a;},
  how:{bio:'The math finds each monthly payment with the loan formula, multiplies by the number of payments, and subtracts what was borrowed. What is left is interest.',
   ap:'M = Pi/(1 − (1 + i)⁻ⁿ) for each loan, then interest = nM − P.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),s=m.guess,mo=m15(sim)-m30(sim),K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the interest yourself from the two payments.':'';
   const real=` In real terms: ${$2(mo)} more each month for 15 years saves ${$(s)}, about ${(s/(m30(sim)*12)).toFixed(1)} years of 30-year payments.`;
   if(off<=Math.max(5000,0.05*s))return `Your gut was right on: within ${$(off)}.`+real+self;
   return `Your gut was off by <b>${$(off)}</b>: you guessed ${$(g.guess)}, and the formula says <b>${$(s)}</b>. ${g.guess<s?'The 30-year loan charges interest for twice as long on a balance that falls slowly at first, so its interest is far more than double.':'You guessed high: the 15-year loan still charges plenty of interest in its early years.'}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.amt=R([200000,250000,300000,320000,400000,450000]);const r=R([5.5,6,6.5,7,7.18,7.5]);sim.p.r30=r;sim.p.r15=Math.round((r-R([0.5,0.6,0.75]))*100)/100;sim.p.guess=50000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A $200,000 loan at 7.18% for 30 years: the payment is $1,354.87 a month for 360 months. How much interest does it pay in all?',answer:287753.2,tol:2,unit:'$',d:0,hint:'Multiply the payment by the number of payments, then subtract what was borrowed.',explain:'360 × $1,354.87 = $487,753.20. Minus the $200,000 borrowed leaves $287,753.20 of interest: more than the loan itself.'},
  {lvl:'bio',instant:true,q:'The 15-year loan lasts half as long as the 30-year loan. Its total interest is…',choices:['About half the 30-year interest','Much less than half: about $183,977 vs. $460,404 here','About the same, because the payment is bigger'],correct:1,explain:'The 30-year loan’s balance falls slowly at first, so it pays interest on a big balance for many years. The 15-year loan pays it down fast and also has a lower rate. Its interest is about 40% of the 30-year total.'},
  {lvl:'bio',instant:true,q:'In the first month of the 30-year loan ($320,000 at 7.18%), about how much of the $2,167.79 payment is interest?',choices:['About $180','About $1,915','About $2,100'],correct:1,explain:'Interest for one month is $320,000 × 0.0718 ÷ 12 ≈ $1,914.67. Only about $253 of the first payment goes to the balance.'},
  {lvl:'honors',instant:true,q:'Adding $200 a month to the 30-year payment ($2,367.79 in all) pays the loan off in about…',choices:['28 years','23 years','15 years'],correct:1,explain:'Stepping the balance month by month, it reaches $0 after 278 payments, about 23.1 years, and saves about $124,088 of interest.'},
  {lvl:'honors',instant:true,q:'Paying the 15-year amount ($2,799.87) on the 30-year loan at 7.18% would pay it off in about…',choices:['15 years exactly','About 16 years, because the 30-year rate is higher','About 20 years'],correct:1,explain:'The same payment clears the loan a little slower at the higher 30-year rate: about 194 months, a bit over 16 years.'},
  {lvl:'ap',kind:'num',q:'Solve for n: a $320,000 loan at 7.18% (i = 0.0059833) with payments of $2,367.79. Use n = −log(1 − Pi/M)/log(1 + i). Round to the nearest tenth of a month.',answer:277.2,tol:0.2,unit:'months',d:1,hint:'Pi/M = 320,000 × 0.0059833 ÷ 2,367.79. Then take logs.',explain:'Pi/M ≈ 0.80864, so 1 − Pi/M ≈ 0.19136. −log(0.19136)/log(1.0059833) ≈ 277.2 months. The 278th payment is a partial one.'},
  {lvl:'ap',instant:true,q:'Why does the formula for n need a logarithm?',choices:['Because n is an exponent in (1 + i)⁻ⁿ, and logs undo exponents','Because interest is charged yearly','Because the payment changes every month'],correct:0,explain:'From M = Pi/(1 − (1 + i)⁻ⁿ): (1 + i)⁻ⁿ = 1 − Pi/M. Taking logs brings n down: −n·log(1 + i) = log(1 − Pi/M).'}
 ],
 tour:[
  {title:'Same home, two loans',text:'A family borrows $320,000. A 30-year loan at 7.18% or a 15-year loan at 6.57%: Freddie Mac’s averages for Nov 5, 2026.',pause:true,setup:sim=>BioLab.setValues(sim,{amt:320000,r30:7.18,r15:6.57,extra:0,reveal:true}),focus:[0,0,800,50]},
  {title:'The monthly payments',text:'The loan formula gives $2,167.79 a month for 30 years and $2,799.87 for 15 years: $632.08 more each month.',pause:true},
  {title:'Watch the balance',text:'The 30-year balance falls slowly at first. In month 1, $1,914.67 of the payment is interest and only $253.12 pays down the loan.',pause:true,focus:[0,50,480,400]},
  {title:'Total interest',text:'360 × $2,167.79 − $320,000 = $460,404 of interest. 180 × $2,799.87 − $320,000 = $183,977.',pause:true,focus:[480,50,320,400]},
  {title:'The difference',text:'The 15-year loan saves $276,428 of interest, for $632.08 more each month.',pause:true},
  {lvl:'honors',title:'A middle path',text:'Keep the 30-year loan but pay $200 extra a month. It ends in 278 payments, about 23 years, and saves about $124,088.',pause:true,setup:sim=>BioLab.setValues(sim,{extra:200,reveal:true})},
  {lvl:'ap',title:'Solving for n',text:'Set M = Pi/(1 − (1 + i)⁻ⁿ) and solve: n = −log(1 − Pi/M)/log(1 + i) ≈ 277.2 months with $2,367.79 a month.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does the loan amount change the interest saved?</p><ol><li>Turn on <b>Show the totals now</b>. Keep both rates.</li><li>Record a trial at $150,000, $250,000, $350,000 and $450,000.</li><li>Graph <b>Trials</b> with the amount on x and <b>Interest the 15-year saves</b> on y.</li></ol><p>Write one sentence: what kind of relationship is it, and how do you know?</p>',
  honors:'<p><b>Question:</b> How much does each extra dollar a month save?</p><ol><li>On the 30-year loan, record trials with $0, $100, $200, $400 and $800 extra a month.</li><li>Record <b>Months to pay off</b> and <b>Interest the extra payment saves</b> for each.</li></ol><p>Is the interest saved proportional to the extra payment? Use your data.</p>',
  ap:'<p><b>Question:</b> How does the payment control the payoff time?</p><ol><li>Record <b>n from the log formula</b> for extra payments of $0, $250, $500, $1,000 and $1,500.</li><li>Graph n against the total payment M.</li></ol><p><b>CER:</b> Use n = −log(1 − Pi/M)/log(1 + i) to explain the shape, and what happens as M approaches Pi.</p>'},
 terms:[
  {t:'Mortgage',d:'A loan to buy a home, paid back in equal monthly payments over a set number of years.'},
  {t:'Total interest',d:'Everything you pay over the loan minus what you borrowed: nM − P.'},
  {t:'Amortization',d:'Paying a loan off with equal payments. Each payment covers that month’s interest, and the rest pays down the balance.',lvl:'honors'},
  {t:'Principal',d:'The amount borrowed, or the part of the balance still owed, not counting interest.',lvl:'honors'},
  {t:'Logarithm',d:'The exponent that turns a base into a number: log_b(x) = y means bʸ = x. Logs solve for an unknown exponent.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Fixed-rate loans with monthly payments rounded to the cent. Monthly rate i = APR ÷ 1200. Payment M = Pi/(1 − (1 + i)⁻ⁿ); total interest = nM − P. With an extra payment x, the balance steps B ← B(1 + i) − (M + x) until it reaches $0, and the last payment is smaller. Property tax, insurance and fees are not included.</p><p><b>Where the numbers come from.</b> Freddie Mac’s Primary Mortgage Market Survey averaged 7.18% for a 30-year fixed mortgage and 6.57% for a 15-year fixed mortgage on Nov 5, 2026. The $320,000 loan is an illustration: a $400,000 home with 20% down.</p><p><b>What this number hides.</b> The 15-year payment is $632 a month higher, and a lender has to approve that bigger payment against your income. Money that goes to the mortgage cannot go to savings or anything else, and a dollar paid years from now is worth less than a dollar today because of inflation. The interest saved is real, but it is not the only number that matters.</p><p><b>This is a simplified math model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
