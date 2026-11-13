(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Lender rules as a system of linear inequalities in H (housing payment) and C (car payment), income I and other debts S:
   rule of thumb 28/36:  H ≤ 0.28 I   and   H + S + C ≤ 0.36 I
   lender maximum (Fannie Mae automated underwriting):   H + S + C ≤ 0.50 I
   Largest H = the smallest of the right-hand sides. The loan that payment supports, after property tax and insurance T:
   L = (H − T) × (1 − (1 + i)⁻ⁿ)/i with i = rate/1200 and n = 360. */
const N=360;
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>(Math.round(v*100)/100).toString()+'%';
const rule=sim=>atLeast('honors')?sim.p.rule:'rot';
const rate=sim=>atLeast('honors')?sim.p.rate:7.18;
const TI=sim=>atLeast('ap')?sim.p.ti:500;
const factor=sim=>{const i=rate(sim)/1200;return (1-Math.pow(1+i,-N))/i;};
const fr=sim=>0.28*sim.p.inc, bk=sim=>(rule(sim)==='lender'?0.50:0.36)*sim.p.inc;
const backPct=sim=>rule(sim)==='lender'?50:36;
function maxH(sim,C){const b=bk(sim)-sim.p.debt-C;return Math.max(0,rule(sim)==='lender'?b:Math.min(fr(sim),b));}
const loan=(sim,H)=>Math.max(0,H-TI(sim))*factor(sim);
const H0=sim=>maxH(sim,0),H1=sim=>maxH(sim,sim.p.car);
const L0=sim=>loan(sim,H0(sim)),L1=sim=>loan(sim,H1(sim));
const diff=sim=>L0(sim)-L1(sim);
const kink=sim=>rule(sim)==='lender'?0:Math.max(0,bk(sim)-sim.p.debt-fr(sim));   /* car payments up to here cost no housing */
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(sim.gutS&&sim.gutS.g&&!pending(sim)));
const GS=sim=>touring(sim)?null:sim.gutS;
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
const CMAX=900;

const SIM={
 id:'carhouse',hash:'carhouse',apUnit:2,order:4,tab:'The car payment that costs you a house',kind:'Simulation',
 skills:{bio:'Systems of linear inequalities · Algebra 1 (Unit 5)',honors:'Systems of linear inequalities and percent of a whole · Algebra 1 (Unit 5)',ap:'Systems of inequalities and the loan payment formula · Algebra 1 (Unit 5), Algebra 2 (Unit 5)'},
 card:'Guess how much a car payment shrinks the home loan you can get later, then let two lender rules, graphed as inequalities, give the real number.',
 title:'The car payment that costs you a house',
 lede:{bio:'A lender checks two rules before it lends you money for a home. Each rule is an inequality. A car payment does not touch the first rule, but it eats into the second one, and every dollar of it is a dollar less you can pay for a home.',
  honors:'The two rules are a system of linear inequalities in H (the housing payment) and C (the car payment). The orders that pass both rules form a region, and the largest H for your car payment sits on its top edge. Lenders’ real limits vary, and some allow far more total debt.',
  ap:'The largest housing payment is H = min(0.28I, 0.36I − S − C). That payment supports a loan of (H − T)(1 − (1 + i)⁻ⁿ)/i, so one dollar a month of car payment costs (1 − (1 + i)⁻ⁿ)/i dollars of home loan.'},
 scale:'One person’s monthly budget, before taxes. Income, debts and costs are realistic illustrations, not an offer from any lender.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your budget',
 controls:[
  {id:'guess',label:'Your gut: how much smaller is the home loan you can get, because of this car payment?',type:'range',min:0,max:200000,step:1000,def:10000,unit:' dollars'},
  {id:'car',label:'Car payment, per month',type:'range',min:0,max:CMAX,step:10,def:530,unit:' dollars',noGut:true,onChange:clear,help:'The average used-car payment in early 2026 was $531 a month, and the average new-car payment was $770 (Experian).'},
  {id:'inc',label:'Your income, per month, before taxes',type:'range',min:3000,max:12000,step:250,def:6000,unit:' dollars',noGut:true,onChange:clear,help:'$6,000 a month is $72,000 a year, close to recent averages for new college graduates in business, math and science.'},
  {id:'debt',label:'Other debt payments (student loan, credit card), per month',type:'range',min:0,max:1000,step:10,def:300,unit:' dollars',noGut:true,onChange:clear},
  {id:'rule',label:'Which limit',type:'seg',def:'rot',lvl:'honors',noGut:true,onChange:clear,options:[{v:'rot',l:'28/36 rule of thumb'},{v:'lender',l:'Lender maximum: 50% total'}],help:'Fannie Mae’s automated underwriting can approve total debt up to 50% of income. Qualifying for a payment is not the same as being able to afford it.'},
  {id:'rate',label:'Mortgage rate (30 years)',type:'range',min:5,max:9,step:0.01,def:7.18,unit:'%',d:2,lvl:'honors',noGut:true,onChange:clear,help:'7.18% was the Freddie Mac average for a 30-year fixed mortgage on Nov 5, 2026.'},
  {id:'ti',label:'Property tax and insurance, per month',type:'range',min:200,max:900,step:25,def:500,unit:' dollars',lvl:'ap',noGut:true,onChange:clear},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut.'}
 ],
 actions:[{id:'new',label:'Try a new-car payment ($770)',lvl:'honors',run(sim){BioLab.setValues(sim,{car:770,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'r1',label:'Rule 1: housing at most 28% of income',unit:'dollars',d:0,min:0,max:null,get:fr},
  {id:'r2',label:'Rule 2: all debts at most',unit:'dollars',d:0,min:0,max:null,get:bk},
  {id:'h0',label:'Most housing payment, no car payment',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?H0(sim):null},
  {id:'h1',label:'Most housing payment, with the car',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?H1(sim):null},
  {id:'l0',label:'Home loan you can get, no car payment',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?L0(sim):null},
  {id:'l1',label:'Home loan you can get, with the car',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?L1(sim):null},
  {id:'diff',label:'The car payment costs you, in home loan',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?diff(sim):null},
  {id:'off',label:'Your gut is off by',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-diff(sim)):null},
  {id:'per',label:'Home loan per $1 of monthly payment',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:factor},
  {id:'free',label:'Car payment that costs no housing',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:kink}
 ],
 graphs:[{id:'bycar',label:'Home loan you can get vs. car payment',custom:true}],defaultGraph:'bycar',
 plot(sim,ctx,box){const f=c=>loan(sim,maxH(sim,c)),top=Math.max(50000,Math.ceil(f(0)/50000)*50000);
  const ax=axes(ctx,box,{xmin:0,xmax:CMAX,ymin:0,ymax:top,xl:'Car payment ($ a month)',yl:'Home loan ($)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the loan',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let c=0;c<=CMAX;c+=5){const px=ax.X(c),py=ax.Y(f(c));c?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.car),ax.Y(f(sim.p.car)),6,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+8,[{label:'Most you can borrow, '+backPct(sim)+'% rule',color:PAL['g-line']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=GS(sim),big=k>1.3,fs=Math.min(k,1.6),P=sim.p;
  /* Walkthrough stages: each step adds one layer, outlined in red when it is new (99 = everything). */
  const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,ring=(x,y,w,h)=>{ctx.save();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;rr(ctx,x,y,w,h,8);ctx.stroke();ctx.restore();};
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,$(P.inc)+' a month before taxes · other debts '+$(P.debt)+' · car '+$(P.car),20,28*Math.min(k,1.2),{s:14*fs,w:700});
  /* left: the inequality graph, car payment C across, housing payment H up */
  const gL=big?70:84,gR=big?470:480,gT=58*Math.min(k,1.25),gB=450-30*fs;
  const ymax=Math.max(500,Math.ceil(Math.max(bk(sim)-P.debt,fr(sim))*1.12/250)*250);
  const X=c=>gL+(gR-gL)*c/CMAX,Y=h=>gB-(gB-gT)*h/ymax;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gL,gT);ctx.lineTo(gL,gB);ctx.lineTo(gR,gB);ctx.stroke();
  [0,300,600,900].forEach(c=>txt(ctx,'$'+c,X(c),gB+15*fs,{s:12*fs,c:PAL['cv-soft'],a:'center'}));
  const ys=ymax>2500?1000:500;for(let h=ys;h<ymax;h+=ys)txt(ctx,'$'+h.toLocaleString('en-US'),gL-6,Y(h)+4,{s:12*fs,c:PAL['cv-soft'],a:'right'});
  txt(ctx,'Car payment →',gR,gB-6,{s:12*fs,w:700,c:PAL['cv-soft'],a:'right'});
  txt(ctx,'↑ Housing payment',gL+6,gT+4+10*fs,{s:12*fs,w:700,c:PAL['cv-soft']});
  sim.vis.graph=[gL-60,gT-10,gR-gL+70,gB-gT+40];
  if(sh){/* feasible region: H ≥ 0, C ≥ 0, H ≤ 0.28I (rule of thumb), H ≤ back − S − C */
   const b=bk(sim)-P.debt,lim=c=>maxH(sim,c);if(stg>=4){ctx.fillStyle=PAL['s3'];ctx.globalAlpha=stg===4?.3:.16;ctx.beginPath();ctx.moveTo(X(0),Y(0));for(let c=0;c<=CMAX;c+=5)ctx.lineTo(X(c),Y(Math.min(ymax,lim(c))));ctx.lineTo(X(CMAX),Y(0));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
    if(stg===4)ring(gL-4,Y(Math.min(ymax,lim(0)))-10,gR-gL+8,gB-Y(Math.min(ymax,lim(0)))+14);}
   if(rule(sim)==='rot'&&stg>=2){ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(0),Y(fr(sim)));ctx.lineTo(X(CMAX),Y(fr(sim)));ctx.stroke();
    txt(ctx,'Rule 1: H ≤ '+$(fr(sim)),X(CMAX)-4,Y(fr(sim))-6,{s:12*fs,w:700,c:PAL['s2'],a:'right'});
    if(stg===2)ring(gL-4,Y(fr(sim))-24*fs,gR-gL+8,32*fs);}
   const c1=Math.min(CMAX,b);if(stg>=3){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(0),Y(Math.min(ymax,b)));ctx.lineTo(X(c1),Y(Math.max(0,b-c1)));ctx.stroke();
   const lx=X(Math.min(CMAX*0.62,b*0.8)),ly=Y(Math.max(0,b-Math.min(CMAX*0.62,b*0.8)));
   txt(ctx,(big?'Rule 2':'Rule 2: H + '+$(P.debt)+' + C ≤ '+$(bk(sim))),lx+8,ly+16*fs,{s:12*fs,w:700,c:PAL['s1']});
   if(stg===3){const y0=Y(Math.min(ymax,b)),y1=Y(Math.max(0,b-c1));ring(gL-4,Math.min(y0,y1)-10,X(c1)-gL+8+(big?0:40),Math.abs(y1-y0)+40*fs);}}
   /* the two answers */
   if(stg>=4){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(X(0),Y(H0(sim)),6,0,7);ctx.fill();}
   if(stg>=5){
   ctx.strokeStyle=PAL['rj'];ctx.setLineDash([4,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(P.car),gB);ctx.lineTo(X(P.car),Y(H1(sim)));ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(P.car),Y(H1(sim)),6,0,7);ctx.fill();
   pill(ctx,$(H1(sim))+' a month',clamp(X(P.car),gL+50*fs,gR-50*fs),Math.max(gT+12,Y(H1(sim))-18*fs),PAL['card2'],PAL['rj'],12*Math.min(k,1.4));
    if(stg===5)ring(clamp(X(P.car),gL+50*fs,gR-50*fs)-70*fs,Math.max(gT+12,Y(H1(sim))-18*fs)-16*fs,140*fs,gB-Math.max(gT+12,Y(H1(sim))-18*fs)+20*fs);}
   if(stg>=4&&!big&&kink(sim)>0&&kink(sim)<CMAX)txt(ctx,'Free up to '+$(kink(sim)),X(kink(sim))+4,Y(fr(sim))+16,{s:12,c:PAL['cv-soft']});}
  else{ctx.strokeStyle=PAL['rj'];ctx.setLineDash([4,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(P.car),gB);ctx.lineTo(X(P.car),gT+20);ctx.stroke();ctx.setLineDash([]);
   const m=G&&G.g,lines=m?['Work out the most you can pay','for housing to see the graph']:['Rule 1: housing ≤ 28% of income','Rule 2: housing + all other debts','≤ '+backPct(sim)+'% of income'];
   lines.forEach((s,i)=>txt(ctx,s,(gL+gR)/2+20,gT+(gB-gT)*0.38+i*18*fs,{s:13*fs,c:PAL['cv-soft'],a:'center'}));}
  /* right: the two home loans */
  const bL=big?520:540,bR=780,bT=gT+12*fs,bB=gB,bw=(bR-bL)/2-18,top=Math.max(1,L0(sim))*1.08,BY=v=>bB-(bB-bT-34*fs)*v/top;
  [[L0(sim),PAL['s4'],big?'No car':'No car payment',bL],[L1(sim),PAL['rj'],big?'With car':'With '+$(P.car)+' car',bL+bw+36]].forEach(([v,col,l,x])=>{
   if(sh&&stg>=6){ctx.fillStyle=col;rr(ctx,x,BY(v),bw,bB-BY(v),5);ctx.fill();txt(ctx,$(v),x+bw/2,BY(v)-7,{s:13*fs,w:700,a:'center'});}
   else{ctx.strokeStyle=PAL['line'];ctx.lineWidth=2;ctx.setLineDash([5,4]);rr(ctx,x,bT+34*fs,bw,bB-bT-34*fs,5);ctx.stroke();ctx.setLineDash([]);txt(ctx,'?',x+bw/2,(bT+bB)/2+20,{s:26*fs,w:700,c:PAL['cv-soft'],a:'center'});}
   txt(ctx,l,x+bw/2,bB+15*fs,{s:12*fs,c:PAL['cv-soft'],a:'center'});});
  txt(ctx,'Home loan you can get',(bL+bR)/2,gT,{s:12*fs,w:700,c:PAL['cv-soft'],a:'center'});
  if(stg===6)ring(bL-10,bT-6,bR-bL+20,bB-bT+28*fs);
  if(sh&&stg>=6&&diff(sim)>0){txt(ctx,'−'+$(diff(sim)),bL+bw+36+bw/2,BY(L1(sim))-24*fs,{s:13*fs,w:700,c:PAL['rj'],a:'center'});}
  if(G&&G.g){const gy=BY(Math.max(0,L0(sim)-G.g.guess)),x2=bL+bw+36;
   if(sh&&stg>=6){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(x2-8,gy);ctx.lineTo(x2+bw+8,gy);ctx.stroke();ctx.setLineDash([]);
    if(!big&&Math.abs(gy-BY(L1(sim)))>40)txt(ctx,'Your gut',x2+bw/2,gy-6,{s:12*fs,w:700,c:PAL['s4'],a:'center'});}
   else if(!big&&!sh)pill(ctx,'Your gut: '+$(G.g.guess)+' less',(bL+bR)/2,bT+18*fs,PAL['card2'],PAL['s4'],12*Math.min(k,1.4));}},
 narrate(sim){const P=sim.p;
  if(!shown(sim))return `You earn ${$(P.inc)} a month before taxes and already pay ${$(P.debt)} a month on other debts. The lender’s rules: housing at most 28% of income, and housing plus all other debts at most ${backPct(sim)}%. <b>How much smaller is your home loan with a ${$(P.car)} car payment?</b>`;
  const d=diff(sim),dh=H0(sim)-H1(sim);
  if(d<1)return `Here the car payment costs no home loan at all: ${rule(sim)==='rot'?`rule 1 (28% of income, ${$(fr(sim))}) is the tighter limit, and car payments up to ${$(kink(sim))} fit under rule 2 without lowering it.`:'the payment still fits.'}`;
  return `The car payment lowers the most you can pay for housing by <b>${$(dh)} a month</b>, from ${$(H0(sim))} to ${$(H1(sim))}. At ${pc(rate(sim))} for 30 years, each dollar a month supports about ${$2(factor(sim))} of loan, so the car costs you <b>${$(d)}</b> of home loan.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'You earn $6,000 a month, pay $300 a month on a student loan, and are thinking about a $530 car payment. Drag the slider here to how many dollars smaller you think that makes the home loan you can get. Then lock it in.',
   honors:'Before any math: drag the slider here to how many dollars smaller you think this car payment makes the home loan you can get. Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-diff(sim)),guess:sim.p.guess,label:`about ${$(sim.p.guess)} less`};},
  solve(sim){const d=diff(sim);sim.p.guess=Math.round(d);return {v:Math.abs(sim.p.guess-d),guess:d,label:`${$(d)} less (${$(H0(sim)-H1(sim))} a month less for housing)`};},
  hint:{bio:'Lock in your gut. Then you will use the two rules to find the most you can pay for housing.'},
  calc:{unit:'$',d:0,tol:a=>Math.max(2,0.005*a),
   prompt:{bio:sim=>{const P=sim.p;return `You earn <b>${$(P.inc)}</b> a month. Rule 1: housing is at most 28% of income. Rule 2: housing plus all other debt payments is at most 36% of income. You pay <b>${$(P.debt)}</b> on a student loan and <b>${$(P.car)}</b> for the car. What is the largest housing payment that passes both rules?`;},
    honors:sim=>{const P=sim.p;return rule(sim)==='lender'?`You earn <b>${$(P.inc)}</b> a month. This lender allows housing plus all other debt payments up to 50% of income. You pay <b>${$(P.debt)}</b> on other debts and <b>${$(P.car)}</b> for the car. What is the largest housing payment it allows?`
     :`Income ${$(P.inc)} a month, other debts ${$(P.debt)}, car ${$(P.car)}. Solve both inequalities for H: H ≤ 0.28 × income and H + debts + car ≤ 0.36 × income. What is the largest H that passes both?`;}},
   answer:sim=>Math.round(H1(sim)*100)/100,
   hint:'Work out each rule’s limit on housing. The answer has to pass both, so take the smaller one.',
   steps(sim){const P=sim.p,b=bk(sim),out=[];
    if(rule(sim)==='rot')out.push(`Rule 1: 0.28 × ${$(P.inc)} = ${$(fr(sim))}.`);
    out.push(`Rule ${rule(sim)==='rot'?'2':''}: ${(backPct(sim)/100).toFixed(2)} × ${$(P.inc)} = ${$(b)} for all debts. Take away ${$(P.debt)} and ${$(P.car)}: ${$(b)} − ${$(P.debt+P.car)} = ${$(b-P.debt-P.car)}.`);
    out.push(rule(sim)==='rot'?`Both rules must hold, so take the smaller: <b>${$(H1(sim))}</b> a month.`:`The most for housing: <b>${$(H1(sim))}</b> a month.`);
    out.push(`With no car payment it would be ${$(H0(sim))}, so the car takes ${$(H0(sim)-H1(sim))} a month off what you can pay for a home.`);
    return out;}},
  formula(sim){const f=factor(sim),T=TI(sim);const a=`Housing: ${$(H0(sim))} with no car, ${$(H1(sim))} with it, ${$(H0(sim)-H1(sim))} a month less.`;
   const b=`Loan = (housing − ${$(T)} tax and insurance) × ${f.toFixed(2)}: ${$(L0(sim))} vs. ${$(L1(sim))}, a difference of ${$(diff(sim))}.`;
   return atLeast('ap')?a+'<br>'+b+`<br>${f.toFixed(2)} = (1 − (1 + i)⁻³⁶⁰)/i with i = ${pc(rate(sim))} ÷ 12.`:a+'<br>'+b;},
  how:{bio:'The math writes each lender rule as an inequality, takes the housing payment that passes both, and turns that monthly payment into a loan amount with the loan payment formula.',
   ap:'H = min(0.28I, 0.36I − S − C), then L = (H − T)(1 − (1 + i)⁻ⁿ)/i.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess),d=m.guess,dh=H0(sim)-H1(sim),K=sim.ui.calc,self=K&&K.done&&K.correct?' You found the housing limit yourself from the two rules.':'';
   const real=d>0?` In real terms: ${$(dh)} a month less for housing, every month for 30 years, and a home that costs about ${$(d)} less.`:'';
   if(off<=Math.max(2000,0.05*d))return `Your gut was right on: within ${$(off)}. You already sense how lenders count a car payment.`+real+self;
   return `Your gut was off by <b>${$(off)}</b>: you guessed ${$(g.guess)}, and the rules say <b>${$(d)}</b>. ${g.guess<d?'A car payment looks small next to a home price, but the lender turns each dollar a month into about '+$2(factor(sim))+' of loan.':d<1?'Here the 28% rule is the tighter limit, so this car payment does not change the loan.':'You guessed high: part of the car payment fits under rule 2 without lowering the housing limit.'}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.inc=R([4500,5000,5500,6000,6500,7000,8000]);sim.p.debt=R([200,250,300,350,400]);sim.p.car=R([350,450,530,600,770]);sim.p.guess=10000;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You earn $5,000 a month. Your student loan is $250 a month and your car payment is $450. Under the 28/36 rules, what is the largest housing payment you can have?',answer:1100,tol:1,unit:'$',d:0,hint:'Rule 1: 28% of $5,000. Rule 2: 36% of $5,000, minus both debts. Take the smaller.',explain:'Rule 1 allows 0.28 × $5,000 = $1,400. Rule 2 allows 0.36 × $5,000 − $250 − $450 = $1,800 − $700 = $1,100. Both must hold, so the most is $1,100.'},
  {lvl:'bio',instant:true,q:'You earn $6,000 a month and have no other debts. How does a $100 car payment change the most you can pay for housing under the 28/36 rules?',choices:['It lowers it by $100','It does not change it: rule 1 ($1,680) is still the tighter limit','It lowers it by $28'],correct:1,explain:'Rule 2 allows 0.36 × $6,000 − $100 = $2,060, more than rule 1’s $1,680. The smaller limit is still $1,680, so this small car payment costs no housing.'},
  {lvl:'bio',instant:true,q:'At 7.18% for 30 years, each $1 of monthly payment supports about $147.62 of home loan. A car payment takes $350 a month off your housing limit. About how much smaller is the loan you can get?',choices:['About $4,200','About $51,700','About $126,000'],correct:1,explain:'$350 × $147.62 ≈ $51,665. The common guess of $350 × 12 = $4,200 counts only one year, but the loan is paid for 360 months.'},
  {lvl:'honors',instant:true,q:'A lender allows housing plus all other debts up to 50% of income. You earn $6,000 a month and pay $300 plus a $530 car payment. What is the most housing payment it allows?',choices:['$1,680','$2,170','$3,000'],correct:1,explain:'0.50 × $6,000 = $3,000 for all debts, minus $830 leaves $2,170. That is far more than the 28/36 rule allows, so the bank may approve a payment that leaves little room for everything else.'},
  {lvl:'honors',kind:'num',q:'Under the 28/36 rules, you earn $6,000 a month and pay $300 on a student loan. Up to what car payment does your housing limit stay at $1,680?',answer:180,tol:1,unit:'$',d:0,hint:'Find where rule 2 equals rule 1: 0.36 × 6,000 − 300 − C = 0.28 × 6,000.',explain:'$2,160 − $300 − C = $1,680 gives C = $180. Up to $180 the car costs no housing; past it, every dollar of car payment is a dollar less for housing. That is where the two boundary lines cross.'},
  {lvl:'ap',kind:'num',q:'At 6% instead of 7.18%, (1 − (1 + i)⁻³⁶⁰)/i ≈ 166.79. A car payment lowers your housing limit by $350 a month. To the nearest dollar, how much less home loan can you get?',answer:58377,tol:5,unit:'$',d:0,hint:'Multiply the monthly drop by the factor.',explain:'$350 × 166.79 ≈ $58,377. A lower rate makes each monthly dollar support more loan, so the same car payment costs even more house.'},
  {lvl:'ap',instant:true,q:'Which expression is the loan L that a monthly payment M supports at monthly rate i for n months?',choices:['L = M·n','L = M(1 − (1 + i)⁻ⁿ)/i','L = M(1 + i)ⁿ'],correct:1,explain:'It is the loan payment formula M = Li/(1 − (1 + i)⁻ⁿ) solved for L: the present value of n equal payments.'}
 ],
 tour:[
  {title:'Your first job',text:'You earn $6,000 a month before taxes, $72,000 a year. You already pay $300 a month on a student loan.',pause:true,setup:sim=>{sim.tst=1;return BioLab.setValues(sim,{inc:6000,debt:300,car:530,rule:'rot',rate:7.18,ti:500,reveal:true});},focus:[0,0,800,48]},
  {title:'Rule 1',text:'Housing can be at most 28% of income: H ≤ 0.28 × $6,000 = $1,680. That is the flat blue line. A car payment does not change it.',pause:true,setup:sim=>{sim.tst=2;},focus:[0,40,500,410]},
  {title:'Rule 2',text:'Housing plus all other debts can be at most 36%: H + $300 + C ≤ $2,160. So H ≤ $1,860 − C, the red line that slopes down.',pause:true,setup:sim=>{sim.tst=3;},focus:[0,40,500,410]},
  {title:'Both rules at once',text:'The shaded region passes both rules. Its top edge is flat until a $180 car payment, where the lines cross. Past that, every dollar of car payment is a dollar less for housing.',pause:true,setup:sim=>{sim.tst=4;},focus:[0,40,500,410]},
  {title:'A $530 car payment',text:'At C = $530, rule 2 allows H ≤ $1,330, which is less than $1,680. So the most you can pay for housing drops by $350 a month.',pause:true,setup:sim=>{sim.tst=5;},focus:[0,40,500,410]},
  {title:'In home-loan dollars',text:'At 7.18% for 30 years, each $1 a month supports about $147.62 of loan. After $500 for tax and insurance, $1,180 supports $174,186 and $830 supports $122,521: $51,665 less.',pause:true,setup:sim=>{sim.tst=6;},focus:[500,40,300,410]},
  {lvl:'honors',title:'A lender’s maximum',text:'Some lenders allow total debt up to 50% of income. Then there is no flat part: the $530 car costs $530 a month of housing, about $78,236 of loan.',pause:true,setup:sim=>{sim.tst=7;return BioLab.setValues(sim,{rule:'lender',reveal:true});}},
  {lvl:'ap',title:'Where 147.62 comes from',text:'Solve M = Li/(1 − (1 + i)⁻ⁿ) for L: L = M(1 − (1 + i)⁻ⁿ)/i. With i = 7.18% ÷ 12 and n = 360, the factor is 147.62.',pause:true,setup:sim=>{sim.tst=8;return BioLab.setValues(sim,{rule:'rot',reveal:true});}}
 ],
 lab:{bio:'<p><b>Question:</b> How does the size of the car payment change the home loan you can get?</p><ol><li>Turn on <b>Show the answer now</b>. Keep $6,000 income and $300 of other debts.</li><li>Record a trial with car payments of $0, $100, $200, $300, $500 and $700.</li><li>Graph <b>Trials</b> with the car payment on x and the home loan with the car on y.</li></ol><p>Write one sentence: where does the graph start to fall, and why there?</p>',
  honors:'<p><b>Question:</b> How does the lender’s limit change the cost of a car payment?</p><ol><li>With a $530 car, record the home loan under the 28/36 rule and under the 50% lender maximum.</li><li>Repeat for incomes of $4,500, $6,000 and $8,000.</li></ol><p>Explain with the two inequalities why the car costs more house under one limit than the other.</p>',
  ap:'<p><b>Question:</b> How does the mortgage rate change the cost of a car payment?</p><ol><li>With a $530 car, record <b>The car payment costs you</b> at rates of 5%, 6%, 7% and 8%.</li><li>Divide each by the monthly drop in housing payment.</li></ol><p><b>CER:</b> Use (1 − (1 + i)⁻ⁿ)/i to explain why a lower rate makes the same car payment cost more loan.</p>'},
 terms:[
  {t:'Inequality',d:'A statement that one amount is at most (≤) or at least (≥) another. Its graph is a region, not just a line.'},
  {t:'System of inequalities',d:'Two or more inequalities that must all be true at once. The answers are the points in every region.'},
  {t:'Gross income',d:'Pay before taxes and other deductions. Lenders’ rules use gross income, so the payment is a bigger share of your take-home pay.'},
  {t:'Debt-to-income ratio (DTI)',d:'All monthly debt payments, including housing, divided by gross monthly income.',lvl:'honors'},
  {t:'Front-end and back-end ratios',d:'The front-end ratio counts housing only (28% in the rule of thumb). The back-end ratio counts all debts (36%).',lvl:'honors'},
  {t:'Present value',d:'What a stream of future payments is worth as one amount today. A loan is the present value of its payments.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> The most you can pay for housing (principal, interest, property tax and insurance) is H = min(0.28I, 0.36I − S − C) under the 28/36 rule of thumb, or H = 0.50I − S − C under a 50% total-debt limit. The loan that payment supports is (H − T)(1 − (1 + i)⁻³⁶⁰)/i for a 30-year fixed loan, with i = rate ÷ 12. No down payment, HOA fees or mortgage insurance are included.</p><p><b>Where the numbers come from.</b> The 28/36 rule is a common guideline, not a law. Fannie Mae, which buys many US mortgages, caps total debt at 36% for manually underwritten loans, up to 45% with strong credit and savings, and up to 50% through its automated system (Selling Guide B3-6-02). The 7.18% rate is Freddie Mac’s weekly average for a 30-year fixed mortgage, Nov 5, 2026. Experian reported average monthly car payments of $531 (used) and $770 (new) in early 2026. $6,000 a month is close to NACE’s Winter 2026 starting-salary projections for business ($68,873) and math and science ($74,184) graduates. A $300 student loan payment is about what $26,400 at the 2026–27 federal undergraduate rate (6.52%) costs over 10 years. $500 a month for property tax and insurance is an illustration: Colorado home insurance is among the most expensive in the US, and 2026 estimates of the state average range from about $2,400 to $5,500 a year.</p><p><b>What this number hides.</b> The rules use income before taxes, so a payment at 28% of gross pay is a bigger share of take-home pay. A lender counts the car payment only while it lasts: Fannie Mae counts loans with more than 10 months left. Qualifying for a loan is not the same as affording it: utilities, repairs, savings and everything else come out of what is left.</p><p><b>This is a simplified math model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
