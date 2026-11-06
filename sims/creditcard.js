(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
const FLOOR=25;
/* Month-by-month model. Each month: interest = balance × APR/12, then you pay. Minimum = max($25, interest + 1% of the balance).
   pay=null means "minimum only"; otherwise you pay the larger of your fixed amount and the minimum. */
function run(B0,apr,pay){const r=apr/1200;let B=B0,m=0,I=0,first=0;const bal=[B],ints=[],pays=[];
 while(B>0.005&&m<1200){const i=B*r,mn=Math.max(FLOOR,i+0.01*B);let p=pay==null?mn:Math.max(pay,mn);p=Math.min(p,B+i);if(!m)first=p;B=B+i-p;I+=i;m++;bal.push(Math.max(0,B));ints.push(i);pays.push(p);}
 return {m,I,first,bal,ints,pays};}
const money=v=>'$'+Math.round(v).toLocaleString('en-US');
const yrs=m=>fmtNum(m/12,1)+' years';
const minR=sim=>run(sim.p.bal,sim.p.apr,null),fixR=sim=>run(sim.p.bal,sim.p.apr,sim.p.pay);
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
const fv=(P,s,N)=>s>0?P*(Math.pow(1+s/1200,N)-1)/(s/1200):P*N;
const R0=590,T0=46,B0=388;let L0=74;
/* text on a soft background box, so it stays readable over lines */
function htxt(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+BioLab.h.FONT;const w=ctx.measureText(s).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s*0.85,w+6,o.s*1.1);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}

const SIM={
 id:'creditcard',hash:'creditcard',apUnit:4,order:3,tab:'Credit card payoff',kind:'Simulation',
 card:'Guess how long the minimum payment takes to clear a credit card, then let the exponential model show the real time and the real interest.',
 title:'Paying off a credit card',
 lede:{bio:'A credit card charges interest on whatever you still owe, every month. Pay only the minimum and the balance shrinks by a small percent each month, which takes far longer than most people expect.',
  honors:'While the minimum is interest plus 1% of the balance, the balance follows B(n) = B₀(0.99)ⁿ: exponential decay. A fixed payment beats it because more of every dollar goes to the balance.',
  ap:'A fixed payment P on balance B at monthly rate r pays off in n = −ln(1 − rB/P) ÷ ln(1 + r) months. If P is not bigger than the interest rB, the logarithm has no value and the debt never ends.'},
 scale:'One card, month by month. APR is the yearly rate; the card charges one twelfth of it each month (24% APR is 2% a month).',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your card',
 controls:[
  {id:'bal',label:'Balance on the card ($)',type:'range',min:500,max:5000,step:100,def:1500,unit:'',noGut:true},
  {id:'apr',label:'Interest rate (APR)',type:'range',min:10,max:30,step:0.5,def:24,unit:'%',noGut:true,help:'Many cards charge 20% to 30% a year. 24% APR means 2% a month.'},
  {id:'pay',label:'Your fixed payment ($ per month)',type:'range',min:25,max:400,step:5,def:100,unit:'',noGut:true,help:'If the minimum is ever higher, you pay the minimum.'},
  {id:'guess',label:'Your guess: years to pay it off at the minimum',type:'range',min:0.5,max:30,step:0.5,def:3,unit:' yr',help:'This is your pick. The orange line on the picture moves with it.'},
  {id:'srate',label:'Savings growth rate, for the flip side',type:'range',min:0,max:8,step:0.5,def:5,unit:'%',lvl:'honors',noGut:true,help:'A yearly rate for money you save instead. 5% is an assumption for illustration, not a promise.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the numbers',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'minM',label:'Months to pay off, minimum only',unit:'months',d:0,min:0,max:null,get:sim=>shown(sim)?minR(sim).m:null},
  {id:'minI',label:'Interest paid, minimum only',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?minR(sim).I:null},
  {id:'fixM',label:'Months at your fixed payment',unit:'months',d:0,min:0,max:null,get:sim=>shown(sim)?fixR(sim).m:null},
  {id:'saved',label:'Interest you save by paying more',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?minR(sim).I-fixR(sim).I:null},
  {id:'first',label:'First minimum payment',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:sim=>{const r=sim.p.apr/1200;return Math.min(sim.p.bal*(1+r),Math.max(FLOOR,sim.p.bal*(r+0.01)));}},
  {id:'save',label:'Saving your fixed payment for that long',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?fv(sim.p.pay,sim.p.srate,minR(sim).m):null}
 ],
 graphs:[{id:'split',label:'Where each minimum payment goes',custom:true},{id:'grow',label:'The flip side: saving that payment',lvl:'honors',custom:true}],defaultGraph:'split',
 plot(sim,ctx,box,id){
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const R=minR(sim);
  if(id==='grow'){const N=R.m,P=sim.p.pay,s=sim.p.srate,top=fv(P,s,N)*1.12;
   const ax=axes(ctx,box,{xmin:0,xmax:N/12,ymin:0,ymax:top,xl:'Years',yl:'Dollars'});
   ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.25;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));for(let n=0;n<=N;n++)ctx.lineTo(ax.X(n/12),ax.Y(fv(P,s,n)));ctx.lineTo(ax.X(N/12),ax.Y(0));ctx.fill();ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;ctx.beginPath();for(let n=0;n<=N;n++){const x=ax.X(n/12),y=ax.Y(fv(P,s,n));n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
   ctx.strokeStyle=PAL['s2'];ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(N/12),ax.Y(P*N));ctx.stroke();ctx.setLineDash([]);
   legend(ctx,box.L+12,box.T+10,[{label:'Balance with growth',color:PAL['s3']},{label:'Just your deposits',color:PAL['s2'],dash:true}]);return;}
  const ny=Math.ceil(R.m/12),I=[],Pr=[];for(let y=0;y<ny;y++){let a=0,b=0;for(let k=y*12;k<Math.min(R.m,y*12+12);k++){a+=R.ints[k];b+=R.pays[k]-R.ints[k];}I.push(a);Pr.push(b);}
  const top=Math.max(...I.map((v,i)=>v+Pr[i]))*1.25;const ax=axes(ctx,box,{xmin:0,xmax:ny,ymin:0,ymax:top,xl:'Year of paying the minimum',yl:'Dollars paid that year',xticks:false});
  const w=Math.max(2,(ax.X(1)-ax.X(0))*.7);for(let y=0;y<ny;y++){const x=ax.X(y+.5)-w/2;ctx.fillStyle=PAL['s1'];ctx.fillRect(x,ax.Y(I[y]),w,ax.Y(0)-ax.Y(I[y]));ctx.fillStyle=PAL['s2'];ctx.fillRect(x,ax.Y(I[y]+Pr[y]),w,ax.Y(I[y])-ax.Y(I[y]+Pr[y]));
   if(ny<=24||y%2===0)txt(ctx,String(y+1),ax.X(y+.5),box.T+box.H+16,{s:12,c:PAL['g-axis'],a:'center'});}
  legend(ctx,box.L+12,box.T+10,[{label:'Interest',color:PAL['s1']},{label:'Paying down the balance',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){L0=Math.round(44+30*k);const W=800,H=450,mn=minR(sim),fx=fixR(sim),sh=shown(sim),G=sim.gutS;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  const gm=sim.p.guess*12,xmaxM=Math.max(24,Math.ceil(Math.max(sh?mn.m:60,gm)*1.06/12)*12);
  const X=m=>L0+m/xmaxM*(R0-L0),Y=b=>B0-b/sim.p.bal*(B0-T0);
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const ys=xmaxM>240?5:xmaxM>96?2:1;
  for(let y=0;y<=xmaxM/12+1e-9;y+=ys){const x=X(y*12);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(x,T0);ctx.lineTo(x,B0);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(y),x,B0+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  for(let f=0;f<=1.001;f+=0.25){const y=Y(sim.p.bal*f);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,money(sim.p.bal*f),L0-8,y+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'Years',(L0+R0)/2,B0+40*k>446?446:B0+40*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  txt(ctx,'What you still owe',L0,T0-14,{s:13*k,w:700});
  /* curves */
  const curve=(arr,col,upto)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();arr.forEach((b,i)=>{if(i>upto)return;const x=X(i),y=Y(b);i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();};
  if(sh){curve(fx.bal,PAL['s2'],1e9);curve(mn.bal,PAL['s1'],1e9);}
  else{curve(mn.bal,PAL['s1'],12);ctx.setLineDash([3,6]);ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(12),Y(mn.bal[12]));ctx.lineTo(X(30),Y(mn.bal[12]*0.9));ctx.stroke();ctx.setLineDash([]);
   htxt(ctx,'The first year of minimums. Then?',X(2),Y(mn.bal[12])+26*k,{s:12*k,w:700,c:PAL['s1']});}
  /* gut line */
  {const locked=!!(G&&G.g),gmm=locked?G.g.months:gm,gx=X(gmm),right=gx>R0-130;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(gx,T0+4);ctx.lineTo(gx,B0);ctx.stroke();ctx.setLineDash([]);
   htxt(ctx,(locked?'Your gut: ':'Your guess: ')+fmtNum(gmm/12,1)+' yr',gx+(right?-6:6),T0+16,{s:12*k,w:700,c:PAL['s4'],a:right?'right':'left'});}
  /* end pills */
  if(sh){const ex=X(mn.m);ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(ex,B0,6,0,7);ctx.fill();
   pill(ctx,'Minimum: '+mn.m+' months',clamp(ex,L0+80,R0-70),B0-26,PAL['s1'],'#fff',12*Math.min(k,1.3));
   const fxx=X(fx.m);ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(fxx,B0,6,0,7);ctx.fill();
   pill(ctx,money(sim.p.pay)+' a month: '+fx.m+' months',clamp(fxx+70,L0+90,R0-90),Y(sim.p.bal*0.62),PAL['s2'],'#fff',12*Math.min(k,1.3));}
  /* interest bars */
  const kk=Math.min(k,1.6),bx=626,bw=52,gap=44,bt=110,bb=B0;txt(ctx,'Interest paid',bx+bw+gap/2,T0+4,{s:13*kk,w:700,a:'center'});txt(ctx,'on top of '+money(sim.p.bal),bx+bw+gap/2,T0+22*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  const topI=Math.max(mn.I,fx.I,1);[[mn,PAL['s1'],'Minimum'],[fx,PAL['s2'],money(sim.p.pay)]].forEach(([r,c,l],i)=>{const x=bx+i*(bw+gap),h=sh?r.I/topI*(bb-bt):0;
   ctx.fillStyle=c;ctx.fillRect(x,bb-h,bw,h);txt(ctx,l,x+bw/2,bb+18*kk,{s:12*kk,c:PAL['cv-ink'],a:'center',w:700});
   txt(ctx,sh?money(r.I):'?',x+bw/2,bb-h-8,{s:(sh?13:22)*kk,w:700,c:c,a:'center'});});
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(bx-10,bb);ctx.lineTo(bx+2*bw+gap+10,bb);ctx.stroke();},
 narrate(sim){const r=sim.p.apr/1200,b=sim.p.bal,i=b*r,mn=Math.max(FLOOR,i+0.01*b);
  if(!shown(sim))return `Each month the card adds ${fmtNum(sim.p.apr/12,1)}% interest (${money(i)} this month), then you pay. The minimum is ${money(mn)}, but <b>${money(Math.min(i,mn))} of it is interest</b>. Lock in your guess to see how long the minimum takes.`;
  const M=minR(sim),F=fixR(sim);
  if(F.m>=M.m)return `Your fixed payment is never more than the minimum here, so it changes nothing. <b>Raise it</b> and watch the blue line.`;
  return `At the minimum the card takes <b>${M.m} months (${yrs(M.m)})</b> and ${money(M.I)} in interest. Paying ${money(sim.p.pay)} a month takes ${F.m} months and ${money(F.I)}: <b>${money(M.I-F.I)} saved</b>, because more of each payment goes to the balance.`;},
 gut:{better:'lower',
  controls:['guess'],
  ask:{bio:'The red line shows what you still owe after one year of paying only the minimum. How many years until you owe nothing? Drag the slider here to your guess, then lock it in.',honors:'Before you look at the model: paying only the minimum, how many years until the balance is zero? Drag the slider here to your guess, then lock it in.'},
  lockLabel:'Lock in my guess',
  lock(sim){const m=sim.p.guess*12;return {v:Math.abs(m-minR(sim).m)/12,months:m,label:fmtNum(sim.p.guess,1)+' years'};},
  solve(sim){const R=minR(sim);sim.p.guess=Math.round(R.m/6)/2;return {v:0,months:R.m,label:`${R.m} months (${yrs(R.m)}), with ${money(R.I)} in interest`};},
  how:{bio:'The math runs the card one month at a time: add the interest, subtract the payment, repeat. Because the minimum shrinks as the balance shrinks, each month only knocks off about 1% of what is left.',
   honors:'While the minimum is interest plus 1%, each month leaves 99% of the balance: B(n) = B₀(0.99)ⁿ, exponential decay. At that rate, cutting the balance in half would take about 69 months. Once the minimum hits the $25 floor, the payment is fixed and the end comes faster.',
   ap:'Phase 1: B(n) = B₀(0.99)ⁿ until the minimum reaches $25. Phase 2: a fixed $25 payment, so n = −ln(1 − rB/25) ÷ ln(1 + r). The model also runs month by month (recursively) and the two agree.'},
  compare(sim,g,m){const M=minR(sim),F=fixR(sim),off=g.months-M.m,save=M.I-F.I;
   const tail=F.m<M.m?` Paying a fixed <b>${money(sim.p.pay)} a month</b> instead clears it in ${F.m} months and <b>saves ${money(save)} in interest</b>.`:` Your fixed payment is no bigger than the minimum, so raise it to see the savings.`;
   if(Math.abs(off)<9)return `Your gut was right on: within ${Math.max(1,Math.round(Math.abs(off)))} month${Math.round(Math.abs(off))===1?'':'s'}. Most people guess far shorter. The minimum costs ${money(M.I)} in interest on a ${money(sim.p.bal)} balance.`+tail;
   const yrsOff=fmtNum(Math.abs(off)/12,1);
   return `You guessed ${fmtNum(g.months/12,1)} years. The minimum really takes <b>${yrs(M.m)}</b>, ${yrsOff} years ${off<0?'longer than you expected':'shorter than you guessed'}, and costs <b>${money(M.I)} in interest</b> on top of the ${money(sim.p.bal)} you owed.`+tail;},
  again(sim){sim.peek=false;sim.p.bal=[800,1200,1500,2000,2500,3000,4000][Math.floor(Math.random()*7)];sim.p.apr=[18,20,22,24,26,28][Math.floor(Math.random()*6)];sim.p.pay=[50,75,100,150,200][Math.floor(Math.random()*5)];sim.p.guess=3;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'You owe $1,500 at 24% APR (2% a month). The minimum is the interest plus 1% of the balance. After your first minimum payment, what do you owe?',choices:['$1,455','$1,485','$1,500'],correct:1,explain:'Interest is 2% of $1,500 = $30. The minimum is $30 + $15 = $45. New balance: $1,500 + $30 − $45 = $1,485. Only $15 of your $45 went to the balance.'},
  {lvl:'bio',instant:true,q:'On that $1,500 card, you double your fixed payment from $100 to $200 a month. What happens to the time it takes?',choices:['It drops by less than half','It drops to about half','It drops by more than half'],correct:2,explain:'$100 a month takes 19 months; $200 takes 9 months. Doubling the payment more than halves the time, because interest keeps piling up on whatever is left. Interest falls from $301 to $142.'},
  {lvl:'honors',instant:true,q:'Paying interest plus 1% each month, the balance follows B(n) = 1500(0.99)ⁿ. What kind of function is that?',choices:['Linear: it drops $15 every month','Exponential decay: it keeps 99% each month','Exponential growth'],correct:1,explain:'Each month leaves 99% of the month before, so the drop gets smaller as the balance shrinks: $15 the first month, but only about $13.30 after a year. That shrinking drop is why minimum payments drag on.'},
  {lvl:'honors',instant:true,q:'The flip side: you save $100 a month for 10 years at 5% a year, compounded monthly. You deposit $12,000. About how much do you have?',choices:['$12,000','About $15,500','About $18,000','About $24,000'],correct:1,explain:'FV = 100 × ((1 + 0.05/12)¹²⁰ − 1) ÷ (0.05/12) ≈ $15,528. About $3,528 of it is growth you never deposited. Compound interest works for you when you save and against you when you owe.'},
  {lvl:'ap',instant:true,q:'A $1,500 balance at 2% a month. You pay a fixed $75 a month. Use n = −ln(1 − rB/P) ÷ ln(1 + r). How many monthly payments?',choices:['20','26','30','39'],correct:1,explain:'rB/P = 0.02 × 1500 ÷ 75 = 0.4. n = −ln(0.6) ÷ ln(1.02) ≈ 0.511 ÷ 0.0198 ≈ 25.8, so 26 payments, the last one smaller.'},
  {lvl:'ap',instant:true,q:'Same $1,500 at 2% a month, but you pay exactly $30 a month. What does the formula tell you?',choices:['About 50 months','About 100 months','It never gets paid off'],correct:2,explain:'Interest is 0.02 × 1500 = $30, so the payment only covers the interest. rB/P = 1, so ln(1 − 1) = ln(0) has no value: the balance stays at $1,500 forever. (A real card would make you pay at least its minimum.)'}
 ],
 tour:[
  {title:'The card',text:'You owe $1,500 at 24% APR. The card charges a twelfth of that each month: 2%. The red line will show what you still owe if you pay only the minimum.',pause:true,setup:sim=>{sim.peek=true;BioLab.setValues(sim,{bal:1500,apr:24,pay:100,guess:3});}},
  {title:'One month',text:'Month 1: interest is 2% of $1,500 = $30. The minimum here is the interest plus 1% of the balance: $45. So $30 of your $45 is interest, and the balance drops only $15, to $1,485.',pause:true},
  {title:'The minimum shrinks too',text:'Next month the balance is smaller, so the minimum is smaller. Every month you knock off just 1% of what is left: B(n) = 1500 × 0.99ⁿ. That is exponential decay, and it is slow: after a year you still owe $1,330.',pause:true},
  {title:'The $25 floor',text:'Once the balance drops below about $833, the minimum stops shrinking at a $25 floor. Now a fixed amount goes in each month and the end finally comes: 114 months in all, 9.5 years.',pause:true},
  {title:'The interest bill',text:'Over those 9.5 years you pay $1,887 in interest: more than the $1,500 you borrowed. The red bar on the right shows it.',pause:true},
  {title:'Pay a fixed amount',text:'The blue line pays a fixed $100 a month. It is done in 19 months with $301 in interest. That is $1,586 saved, and 95 months sooner.',pause:true},
  {lvl:'ap',title:'The formula',text:'For a fixed payment P, set the balance B(1 + r)ⁿ − P((1 + r)ⁿ − 1)/r equal to 0 and solve: n = −ln(1 − rB/P) ÷ ln(1 + r). For $100: n = −ln(0.7) ÷ ln(1.02) ≈ 18.0, so the 19th payment is tiny.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much does paying more each month save?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess yet.</li><li>Keep the balance at $1,500 and 24% APR. Set your fixed payment to 50, 75, 100, 150 and 200 dollars. Record a trial each time.</li><li>Graph <b>Trials</b> with the payment on x and months on y.</li></ol><p>Write one sentence: does doubling the payment halve the time?</p>',
  honors:'<p><b>Question:</b> How does the APR change the cost of paying only the minimum?</p><ol><li>Keep $1,500 and a $100 payment. Set the APR to 12, 18, 24 and 30. Record a trial each time.</li><li>Compare the interest paid at the minimum with the interest at $100 a month.</li></ol><p>Explain with B(n) = B₀(0.99)ⁿ why the minimum plan is slow at every APR: each month removes only 1% of what is left.</p>',
  ap:'<p><b>Question:</b> Derive the payoff time for a fixed payment.</p><ol><li>Write B(n+1) = (1 + r)B(n) − P and show B(n) = (1 + r)ⁿB₀ − P((1 + r)ⁿ − 1)/r.</li><li>Set B(n) = 0 and solve for n with logarithms.</li><li>Check your formula against the tool for three payments.</li></ol><p><b>CER:</b> Explain why the payment must be greater than rB₀.</p>'},
 terms:[
  {t:'APR',d:'Annual percentage rate: the yearly interest rate. A card charges about one twelfth of it each month.'},
  {t:'Minimum payment',d:'The least the card lets you pay each month. Here: the interest plus 1% of the balance, at least $25. Card terms vary.'},
  {t:'Exponential decay',d:'A quantity that keeps the same fraction each step, like B(n) = B₀(0.99)ⁿ.',lvl:'honors'},
  {t:'Recursive model',d:'A rule that finds each value from the one before: B(n+1) = (1 + r)B(n) − payment.',lvl:'honors'},
  {t:'Annuity formula',d:'The closed form for a balance with a fixed payment each period. Solving it for n needs a logarithm.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not financial advice.</b> Each month the card adds interest of APR ÷ 12 on the balance, then you pay. The minimum payment is <b>an assumption</b>: the interest plus 1% of the balance, or $25, whichever is more (or the whole balance if that is less). Real card terms vary, and real cards may compound daily, add fees, or change the rate. No new purchases are made.</p><p>With a fixed payment you pay your amount or the minimum, whichever is more. The fixed-payment time is n = −ln(1 − rB/P) ÷ ln(1 + r) with r = APR ÷ 12; the tool counts whole months, so a small last payment counts as a month.</p><p><b>The flip side</b> assumes you deposit your fixed payment at the end of each month, for as many months as the minimum plan takes, growing at the savings rate you set (5% is an assumption, not a promise): FV = P((1 + s/12)ⁿ − 1) ÷ (s/12).</p>'
};
BioLab.register(SIM);
})();
