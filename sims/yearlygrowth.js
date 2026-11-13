(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* A price grows from A to B over n years at one steady yearly rate r.
   B = A(1 + r)ⁿ, so 1 + r = (B/A)^(1/n) = ⁿ√(B/A). The common wrong answer is the simple average:
   (total percent change) ÷ n, which compounds to more than B. Amounts are realistic illustrations. */
const CASE={rent:{l:'rent for a one-bedroom apartment',s:'Rent',A:1200,B:1900,n:8,u:'a month'},
  tuition:{l:'yearly tuition at a public university',s:'Tuition',A:9000,B:15000,n:12,u:'a year'},
  savings:{l:'money in an index fund',s:'Savings',A:1000,B:2000,n:10,u:''},
  sneakers:{l:'price of a pair of sneakers',s:'Sneakers',A:110,B:160,n:6,u:''}};
const ratio=sim=>sim.p.B/sim.p.A;
const fac=sim=>Math.pow(ratio(sim),1/sim.p.n);
const rate=sim=>(fac(sim)-1)*100;
const naive=sim=>(ratio(sim)-1)*100/sim.p.n;
const naiveEnd=sim=>sim.p.A*Math.pow(1+naive(sim)/100,sim.p.n);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g&&!(BioLab.calcPending&&BioLab.calcPending(sim))));
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const p2=v=>(Math.round(v*100)/100).toFixed(2)+'%';
const f4=v=>v.toFixed(4);
const sup=n=>String(n).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
const root=n=>n===2?'√':n===3?'∛':n===4?'∜':sup(n)+'√';
const cs=sim=>CASE[sim.p.cs]||CASE.rent;
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function setCase(sim){const C=cs(sim);BioLab.setValues(sim,{A:C.A,B:C.B,n:C.n});clearGut(sim);}
const calcAns=sim=>Math.round(rate(sim)*100)/100;

const SIM={
 id:'yearlygrowth',hash:'yearlygrowth',apUnit:4,order:3,tab:'What yearly rate did that?',kind:'Simulation',
 skills:{bio:'nth roots and steady growth · Algebra 2 (Unit 4)',honors:'Rational exponents: x^(1/n) = ⁿ√x · Honors Algebra 2/Trig (Chapter 3)',ap:'Rational exponents and exponential models · AP Precalculus (Unit 2A)'},
 card:'Rent went from $1,200 to $1,900 in 8 years. Guess the yearly increase, then let an nth root find the steady rate, and see why dividing by 8 gets it wrong.',
 title:'What yearly rate did that? nth roots and steady growth',
 lede:{bio:'A price that grows by the same percent every year is multiplied by the same number every year. To find that number from the start and the end, you need a root: for 8 years, the 8th root.',
  honors:'If B = A(1 + r)ⁿ, then 1 + r = (B/A)^(1/n) = ⁿ√(B/A). A rational exponent 1/n is an nth root, and dividing the total change by n always overestimates the steady rate.',
  ap:'Steady percent growth is exponential: f(t) = A·bᵗ with b = (B/A)^(1/n). The yearly factor is the nth root of the total factor, and the doubling time is ln 2 ÷ ln b.'},
 scale:'Amounts are realistic illustrations, not data for any real city, college or fund. Each bar is one year’s value.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The change',
 controls:[
  {id:'guess',label:'Your gut: the steady yearly increase',type:'range',min:0,max:20,step:0.1,def:5,unit:'%',d:1},
  {id:'cs',label:'What grew',type:'seg',def:'rent',noGut:true,onChange:setCase,options:[{v:'rent',l:'Rent'},{v:'tuition',l:'Tuition'},{v:'savings',l:'Savings'},{v:'sneakers',l:'Sneakers'}]},
  {id:'A',label:'Starting value',type:'range',min:50,max:20000,step:10,def:1200,unit:' dollars',noGut:true,onChange:clearGut},
  {id:'B',label:'Value at the end',type:'range',min:50,max:40000,step:10,def:1900,unit:' dollars',noGut:true,onChange:clearGut},
  {id:'n',label:'Years',type:'range',min:2,max:30,step:1,def:8,unit:' years',noGut:true,onChange:clearGut},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut guess.'}
 ],
 actions:[{id:'double',label:'Try: it doubled in 10 years',run(sim){BioLab.setValues(sim,{cs:'savings',A:1000,B:2000,n:10});clearGut(sim);}}],
 init(){return {};},step(){},
 metrics:[
  {id:'total',label:'Total change',unit:'%',d:1,min:null,max:null,get:sim=>(ratio(sim)-1)*100},
  {id:'factor',label:'Total growth factor B ÷ A',unit:'',d:4,min:0,max:null,get:ratio},
  {id:'yfac',label:'Yearly factor ⁿ√(B ÷ A)',unit:'',d:4,min:0,max:null,get:sim=>shown(sim)?fac(sim):null},
  {id:'rate',label:'Steady yearly increase',unit:'%',d:2,min:null,max:null,get:sim=>shown(sim)?rate(sim):null},
  {id:'naive',label:'Total change ÷ years (the common guess)',unit:'%',d:2,min:null,max:null,get:naive},
  {id:'off',label:'Your gut is off by',unit:'points',d:2,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-rate(sim)):null},
  {id:'dbl',label:'Years to double at this rate',unit:'years',d:1,lvl:'ap',min:0,max:null,get:sim=>shown(sim)&&fac(sim)>1?Math.log(2)/Math.log(fac(sim)):null}
 ],
 graphs:[{id:'curve',label:'Value vs. year',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const A=sim.p.A,n=sim.p.n,b=fac(sim),bn=1+naive(sim)/100,sh=shown(sim),top=Math.max(sim.p.B,sh?naiveEnd(sim):sim.p.B)*1.1;
  const ax=axes(ctx,box,{xmin:0,xmax:n,ymin:0,ymax:top,xl:'Year',yl:'Value ($)'});
  if(!sh){txt(ctx,'Lock in your gut to see the curve',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  const line=(f,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,5]:[]);ctx.beginPath();for(let t=0;t<=n;t+=n/120){const X=ax.X(t),Y=ax.Y(f(t));t?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();ctx.setLineDash([]);};
  line(t=>A*Math.pow(bn,t),PAL['s4'],true);line(t=>A*Math.pow(b,t),PAL['g-line'],false);
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(n),ax.Y(sim.p.B),6,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+8,[{label:'Steady '+p2(rate(sim))+' a year',color:PAL['g-line']},{label:p2(naive(sim))+' a year (total ÷ years)',color:PAL['s4'],dash:true}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),C=cs(sim),A=sim.p.A,B=sim.p.B,n=sim.p.n,b=fac(sim),big=k>1.3,tst=(sim.tour&&sim.tour.on)?(sim.tst||1):99;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,C.s+': '+$(A)+' → '+$(B)+' in '+n+' years',24,34*Math.min(k,1.2),{s:16*k,w:700});
  if(!big)txt(ctx,'One bar per year. Total change: '+((B/A-1)*100).toFixed(1)+'%',24,58*Math.min(k,1.2),{s:12.5*k,c:PAL['cv-soft']});
  const L=56,R=776,T=96,Bt=380,nb=n+1,gap=Math.max(2,Math.min(10,120/nb)),bw=(R-L-gap*(nb-1))/nb;
  const vmax=Math.max(B,(sh&&tst>=4)?naiveEnd(sim):B)*1.08,Y=v=>Bt-(Bt-T)*v/vmax;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,Bt);ctx.lineTo(R,Bt);ctx.stroke();
  for(let i=0;i<nb;i++){const x=L+i*(bw+gap),v=A*Math.pow(b,i),known=i===0||i===n;
   if(!known&&!sh){ctx.setLineDash([4,4]);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.strokeRect(x,Y(B*0.75),bw,Bt-Y(B*0.75));ctx.setLineDash([]);continue;}
   rr(ctx,x,Y(v),bw,Bt-Y(v),Math.min(4,bw/3));ctx.fillStyle=known?PAL['s2']:PAL['s3'];ctx.fill();
   if(nb<=16||i%Math.ceil(nb/12)===0||i===n)txt(ctx,String(i),x+bw/2,Bt+16*k,{s:11*k,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'year',R,Bt+32*k,{s:11*k,c:PAL['cv-soft'],a:'right'});
  txt(ctx,$(A),L+bw/2,Y(A)-8,{s:12*k,w:700,a:'center'});txt(ctx,$(B),L+n*(bw+gap)+bw/2,Y(B)-8,{s:12*k,w:700,a:'center'});
  if(!sh){txt(ctx,'The years in between are hidden: what steady yearly increase connects them?',(L+R)/2,T-10,{s:13*k,c:PAL['cv-soft'],a:'center'});}
  else{
   /* each year is the last one times b */
   if(tst>=2&&nb<=16){for(let i=1;i<=Math.min(n,3);i++){const x0=L+(i-1)*(bw+gap)+bw/2,x1=L+i*(bw+gap)+bw/2,y=Y(A*Math.pow(b,i))-24*k;
     ctx.strokeStyle=PAL['s1'];ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x0,y+6);ctx.quadraticCurveTo((x0+x1)/2,y-8,x1,y+6);ctx.stroke();
     if(i===1||bw>40)txt(ctx,'×'+f4(b),(x0+x1)/2,y-12,{s:11*k,w:700,c:PAL['s1'],a:'center'});}}
   if(tst>=3){const sx=atLeast('honors')?`(${(B/A).toFixed(4)})^(1/${n})`:`${root(n)}(${$(B)} ÷ ${$(A)})`;
    pill(ctx,sx+' = '+f4(b)+'  →  '+p2(rate(sim))+' a year',(L+R)/2,T-14,PAL['card2'],PAL['s1'],13*Math.min(k,1.3));}
   if(tst>=4){/* the common guess, compounded */const bn=1+naive(sim)/100;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.2;ctx.setLineDash([6,5]);ctx.beginPath();
    for(let i=0;i<nb;i++){const x=L+i*(bw+gap)+bw/2,y=Y(A*Math.pow(bn,i));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);
    const xe=L+n*(bw+gap)+bw/2,ye=Y(naiveEnd(sim));ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(xe,ye,5,0,7);ctx.fill();
    txt(ctx,p2(naive(sim))+' a year would end at '+$(naiveEnd(sim)),xe-10,ye-10,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
   if(tst>=5&&tst<99&&fac(sim)>1){const d=Math.log(2)/Math.log(fac(sim));pill(ctx,'Doubles in ln 2 ÷ ln '+f4(fac(sim))+' ≈ '+d.toFixed(1)+' years',L+170*Math.min(k,1.3),T+30,PAL['card2'],PAL['s1'],13*Math.min(k,1.3));}}
  if(G&&G.g){const g=G.g.guess,ge=A*Math.pow(1+g/100,n);txt(ctx,'Your gut: '+g.toFixed(1)+'% a year → '+$(ge)+' after '+n+' years',R,Bt+52*k>448?444:Bt+52*k,{s:12.5*k,w:700,c:PAL['s4'],a:'right'});}},
 narrate(sim){const C=cs(sim),A=sim.p.A,B=sim.p.B,n=sim.p.n;
  if(!shown(sim))return `The ${C.l} went from <b>${$(A)}</b> to <b>${$(B)}</b> in ${n} years, a total increase of ${((B/A-1)*100).toFixed(1)}%. If it rose by the same percent every year, <b>what was that yearly percent?</b>`;
  return `Growing ${p2(rate(sim))} a year means multiplying by ${f4(fac(sim))} each year: ${f4(fac(sim))}${sup(n)} = ${(B/A).toFixed(4)}, which takes ${$(A)} to ${$(B)}. Dividing the total by ${n} gives ${p2(naive(sim))}, too high, because each year’s increase builds on the last.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to the yearly increase you think it took, the same percent every year. Then lock it in.',
   honors:'Before any roots: drag the slider here to your gut guess for the steady yearly rate, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-rate(sim)),guess:sim.p.guess,label:`about ${sim.p.guess.toFixed(1)}% a year`};},
  solve(sim){const r=rate(sim);sim.p.guess=Math.round(r*10)/10;return {v:Math.abs(sim.p.guess-r),guess:r,label:`${p2(r)} a year (×${f4(fac(sim))} each year)`};},
  hint:{bio:'Lock in your gut. Then you will find the steady rate yourself with a root.'},
  calc:{unit:'%',d:2,tol:a=>0.05,
   prompt:{bio:sim=>`It went from <b>${$(sim.p.A)}</b> to <b>${$(sim.p.B)}</b> in <b>${sim.p.n}</b> years. Divide to get the total growth factor, take the ${sim.p.n}th root (or raise it to the 1/${sim.p.n} power) to get the yearly factor, then turn that into a percent. What is the steady yearly increase, in percent?`,
    honors:sim=>`Solve ${$(sim.p.B)} = ${$(sim.p.A)}(1 + r)${sup(sim.p.n)} for r. Give r as a percent to two decimal places.`},
   answer:calcAns,
   hint:'B ÷ A first. Then use the x^(1/n) key: on most calculators, type (B ÷ A)^(1 ÷ n). Subtract 1 and multiply by 100.',
   steps(sim){const A=sim.p.A,B=sim.p.B,n=sim.p.n;return [
    `Total growth factor: ${$(B)} ÷ ${$(A)} = ${(B/A).toFixed(4)}.`,
    `Yearly factor: ${root(n)}${(B/A).toFixed(4)} = (${(B/A).toFixed(4)})^(1/${n}) = ${f4(fac(sim))}.`,
    `${f4(fac(sim))} − 1 = ${(fac(sim)-1).toFixed(4)}, which is <b>${p2(rate(sim))}</b> a year.`,
    `Check: ${$(A)} × ${f4(fac(sim))}${sup(n)} = ${$(A*Math.pow(fac(sim),n))}. ✓`];}},
  formula(sim){return `1 + r = (B ÷ A)^(1/n) = ${root(sim.p.n)}(${(ratio(sim)).toFixed(4)}) = ${f4(fac(sim))}, so r = ${p2(rate(sim))}`;},
  how:{bio:'Growing by the same percent each year multiplies by the same factor each year. After n years that factor has been used n times, so the yearly factor is the nth root of the total factor.',
   honors:'B = A(1 + r)ⁿ. Divide by A and raise both sides to the 1/n power: 1 + r = (B/A)^(1/n).'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),nv=naive(sim),n=sim.p.n,A=sim.p.A,ge=A*Math.pow(1+g.guess/100,n);
   const K=sim.ui.calc,self=K&&K.done&&K.correct?' You also found it yourself with a root, so you can check any “prices rose X% in Y years” claim.':'';
   if(off<=0.25)return `Your gut was right on: within ${off.toFixed(2)} points of ${p2(m.guess)}. A steady ${p2(m.guess)} a year takes ${$(A)} to ${$(sim.p.B)}.`+self;
   const near=Math.abs(g.guess-nv)<0.3;
   return `Your gut was off by <b>${off.toFixed(2)} points</b>: you guessed ${g.guess.toFixed(1)}%, and the root gives <b>${p2(m.guess)}</b>. ${near?`Your guess is close to the total change divided by ${n} years (${p2(nv)}). That ignores compounding: each year’s increase is charged on a bigger number, so ${g.guess.toFixed(1)}% a year would end at ${$(ge)}, not ${$(sim.p.B)}.`:g.guess>m.guess?`At ${g.guess.toFixed(1)}% a year it would end at ${$(ge)}, more than ${$(sim.p.B)}.`:`At ${g.guess.toFixed(1)}% a year it would end at only ${$(ge)}.`}`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];const c=R(['rent','tuition','savings','sneakers']);sim.p.cs=c;const C=CASE[c];
   const n=R([4,5,6,8,10,12,15]),g=R([2,3,4,5,6,7,8])/100;sim.p.A=C.A;sim.p.n=n;sim.p.B=Math.round(C.A*Math.pow(1+g,n)/10)*10;sim.p.guess=5;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'An index fund grew from $1,000 to $2,000 in 10 years at a steady yearly rate. What was the yearly rate, in percent? (Two decimal places.)',answer:7.18,tol:0.02,unit:'%',d:2,hint:'2^(1/10), then subtract 1.',explain:'The total factor is 2, so the yearly factor is ¹⁰√2 = 2^(1/10) = 1.0718: 7.18% a year. That is the “rule of 72” in action: 72 ÷ 7.18 ≈ 10 years to double.'},
  {lvl:'bio',instant:true,q:'Rent rose 58% over 8 years. Is the steady yearly increase 58% ÷ 8 = 7.3%?',choices:['Yes, exactly','No: it is less, about 5.9%, because each year’s increase builds on a higher rent','No: it is more than 7.3%'],correct:1,explain:'7.3% a year compounded for 8 years multiplies by 1.073⁸ ≈ 1.76, a 76% increase, not 58%. The steady rate is ⁸√1.58 − 1 ≈ 5.9%.'},
  {lvl:'bio',instant:true,q:'Which is the same as the 4th root of x?',choices:['x⁴','x^(1/4)','4x','x ÷ 4'],correct:1,explain:'A rational exponent 1/n means the nth root: x^(1/4) = ∜x, because (x^(1/4))⁴ = x^(4/4) = x.'},
  {lvl:'honors',kind:'num',q:'Solve 1,900 = 1,200(1 + r)⁸ for r, as a percent to two decimal places.',answer:5.91,tol:0.02,unit:'%',d:2,hint:'Divide by 1,200, then raise both sides to the 1/8 power.',explain:'(1 + r)⁸ = 1.58333, so 1 + r = 1.58333^(1/8) = 1.0591, and r ≈ 5.91%.'},
  {lvl:'honors',instant:true,q:'Simplify 16^(3/4).',choices:['12','8','64','4'],correct:1,explain:'16^(3/4) = (⁴√16)³ = 2³ = 8. Take the root first: the numbers stay small.'},
  {lvl:'honors',instant:true,q:'Tuition grew by the same percent each year and doubled in 12 years. How long did it take to grow by 41% (a factor of about √2)?',choices:['About 3 years','About 6 years','About 8 years'],correct:1,explain:'Doubling in 12 years means a factor of 2^(t/12) after t years. √2 = 2^(1/2), so t/12 = 1/2 and t = 6 years.'},
  {lvl:'ap',instant:true,q:'If a quantity grows by a factor of b each year, what is its doubling time?',choices:['2 ÷ b','ln 2 ÷ ln b','b²'],correct:1,explain:'bᵗ = 2, so t ln b = ln 2 and t = ln 2 ÷ ln b. At 7.18% a year, ln 2 ÷ ln 1.0718 ≈ 10 years.'}
 ],
 tour:[
  {title:'The problem',text:'Rent on a one-bedroom went from $1,200 to $1,900 a month in 8 years. That is a 58% increase in all. What steady yearly increase would do that?',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{cs:'rent',A:1200,B:1900,n:8,reveal:true});}},
  {title:'Multiply each year',text:'“The same percent every year” means multiplying by the same number every year. Watch the arrows: each bar is the one before times 1.0591.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Eight multiplications make the total',text:'Multiplying by b eight times is b⁸. So b⁸ = 1,900 ÷ 1,200 = 1.5833, and b is the 8th root of 1.5833: 1.0591, or 5.91% a year.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Why 58% ÷ 8 is wrong',text:'Dividing gives 7.3% a year. But each year’s increase lands on a bigger rent, so 7.3% a year would end at about $2,100 (the dashed line), not $1,900.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'A doubling',text:'Savings that doubled from $1,000 to $2,000 in 10 years grew at ¹⁰√2 − 1 = 7.18% a year, not 10% a year.',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{cs:'savings',A:1000,B:2000,n:10,reveal:true});}},
  {lvl:'honors',title:'Rational exponents',text:'The nth root is the 1/n power: ⁿ√x = x^(1/n). So 1 + r = (B/A)^(1/n). On a calculator: (1900/1200)^(1/8).',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{cs:'rent',A:1200,B:1900,n:8,reveal:true});}},
  {lvl:'ap',title:'Doubling time',text:'At a yearly factor b, doubling takes ln 2 ÷ ln b years. For rent rising 5.91% a year: ln 2 ÷ ln 1.0591 ≈ 12.1 years.',pause:true,setup:sim=>{sim.tst=5;}}
 ],
 onTourExit(sim){sim.tst=99;BioLab.setValues(sim,{reveal:false});},
 lab:{bio:'<p><b>Question:</b> How far off is “total change ÷ years”?</p><ol><li>Turn on <b>Show the answer now</b>. Keep $1,000 at the start and 10 years.</li><li>Record a trial with the end value at $1,500, $2,000, $3,000 and $5,000.</li><li>For each, compare <b>Steady yearly increase</b> with <b>Total change ÷ years</b>.</li></ol><p>Write one sentence: when is the common guess most wrong?</p>',
  honors:'<p><b>Question:</b> How does the yearly rate depend on the number of years for the same total change?</p><ol><li>Keep $1,200 → $1,900. Record the yearly rate for 2, 4, 8, 16 and 30 years.</li><li>Write each as (1.5833)^(1/n).</li></ol><p>Explain what happens to the 1/n power as n grows.</p>',
  ap:'<p><b>Question:</b> Is the doubling time proportional to 1 ÷ rate?</p><ol><li>Pick end values so the yearly rate is about 2%, 4%, 6%, 9% and 12%.</li><li>Record the doubling time and multiply it by the rate in percent.</li></ol><p><b>CER:</b> Explain why the product stays near 70–72, using ln(1 + r) ≈ r.</p>'},
 terms:[
  {t:'Growth factor',d:'The number you multiply by. A 6% increase is a factor of 1.06.'},
  {t:'nth root',d:'ⁿ√x is the number that, multiplied by itself n times, gives x.'},
  {t:'Rational exponent',d:'x^(1/n) = ⁿ√x, and x^(m/n) = (ⁿ√x)ᵐ.',lvl:'honors'},
  {t:'Compound growth',d:'Growth where each period’s increase is figured on the new, larger amount.'},
  {t:'Doubling time',d:'How long a steadily growing amount takes to double: ln 2 ÷ ln b, or about 72 ÷ the percent rate.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> Steady percent growth: B = A(1 + r)ⁿ, so the yearly factor is (B/A)^(1/n) and r = (B/A)^(1/n) − 1. Real prices don’t rise by exactly the same percent each year; this rate is the steady rate that gives the same start and end, sometimes called the compound annual growth rate. Amounts are realistic illustrations, not data for any real place, college or fund.</p>'
};
BioLab.register(SIM);
})();
