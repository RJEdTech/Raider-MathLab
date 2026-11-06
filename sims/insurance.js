(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Phone protection plan vs. paying out of pocket, over the 2 years of the plan.
   Each year, independently: crack the screen (chance s), lose or wreck the phone (chance d), or nothing (1 − s − d).
   At most one event per year. Skip: $279 per screen, $900 per new phone. Plan: fee × 24 plus $29 per screen, $99 per phone. */
const SCR=279,REP=900,DS=29,DL=99,MONTHS=24,PRICE=900;
const CARE={careful:{s:0.10,d:0.04,l:'very careful'},average:{s:0.20,d:0.07,l:'about average'},rough:{s:0.35,d:0.12,l:'hard on phones'}};
const OUT=[{c:0,l:0,t:'Nothing happens'},{c:1,l:0,t:'1 cracked screen'},{c:0,l:1,t:'1 loss'},{c:2,l:0,t:'2 cracked screens'},{c:1,l:1,t:'1 crack, 1 loss'},{c:0,l:2,t:'2 losses'}];
const COL=['s3','s4','s1','s6','s5','s2'];
const care=sim=>CARE[sim.p.care]||CARE.average;
function probs(sim){const {s,d}=care(sim),q=1-s-d;return [q*q,2*s*q,2*d*q,s*s,2*s*d,d*d];}
const prem=sim=>sim.p.fee*MONTHS;
const costSkip=o=>o.c*SCR+o.l*REP;
const costPlan=(sim,o)=>prem(sim)+o.c*DS+o.l*DL;
function ev(sim,which){const P=probs(sim);return OUT.reduce((a,o,i)=>a+P[i]*(which==='skip'?costSkip(o):costPlan(sim,o)),0);}
function sd(sim,which){const P=probs(sim),m=ev(sim,which);return Math.sqrt(OUT.reduce((a,o,i)=>{const x=which==='skip'?costSkip(o):costPlan(sim,o);return a+P[i]*(x-m)*(x-m);},0));}
const better=sim=>ev(sim,'buy')<ev(sim,'skip')-1e-9?'buy':'skip';
const lost=(sim,ch)=>ev(sim,ch)-Math.min(ev(sim,'skip'),ev(sim,'buy'));
/* the monthly fee where the two choices cost the same on average */
function breakeven(sim){const P=probs(sim);let es=0,ed=0;OUT.forEach((o,i)=>{es+=P[i]*costSkip(o);ed+=P[i]*(o.c*DS+o.l*DL);});return (es-ed)/MONTHS;}
/* chance, over the 2 years, of at least one single bill bigger than your savings */
function bigHit(sim,which){const {s,d}=care(sim),q=1-s-d,sv=sim.p.save;
 const anyLoss=1-(1-d)*(1-d),anyEvent=1-q*q;
 if(which==='skip')return sv<SCR?anyEvent:sv<REP?anyLoss:0;
 return sv<DS?anyEvent:sv<DL?anyLoss:0;}
/* 100 people like you: whole-number counts that add to 100 (largest remainders) */
function counts(sim){const P=probs(sim).map(p=>p*100),f=P.map(Math.floor);let left=100-f.reduce((a,b)=>a+b,0);
 P.map((p,i)=>[p-f[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){f[i]++;left--;}});return f;}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g));
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toFixed(2);
const pct=(v,d)=>(v*100).toFixed(d===undefined?1:d)+'%';
const CH={buy:'buy the plan',skip:'skip the plan'};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const pick=(sim,ch)=>({v:lost(sim,ch),choice:ch,care:sim.p.care,fee:sim.p.fee,ev:ev(sim,ch),label:`${CH[ch]}: about ${$(ev(sim,ch))} over 2 years, on average`});

const SIM={
 id:'insurance',hash:'insurance',apUnit:14,order:4,tab:'Phone insurance: worth it?',kind:'Simulation',
 card:'Decide by feel whether a phone protection plan is worth it, then let expected value add up what each choice really costs.',
 title:'Is phone insurance worth it?',
 lede:{bio:'A protection plan costs money every month, whether or not you ever use it. Skipping it costs nothing, until the day your phone hits the sidewalk. Which one costs less over the 2 years?',
  honors:'Your 2-year cost is a random variable: it depends on what happens to the phone. List every outcome with its probability and cost, and the expected value tells you the long-run average cost of each choice.',
  ap:'E(X) = Σ x·P(x) compares the choices on average; the standard deviation σ = √(Σ (x − μ)²·P(x)) measures how much your actual cost can swing. Insurance trades a higher mean for a much smaller spread.'},
 scale:'A $900 phone, over the 2 years of the plan. Chances are per year and are illustrative, not measured.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your phone',
 controls:[
  {id:'care',label:'How careful are you with phones?',type:'seg',def:'average',noGut:true,onChange:clearGut,options:[{v:'careful',l:'Very careful'},{v:'average',l:'About average'},{v:'rough',l:'Hard on phones'}],help:'Changes the chance of cracking the screen or losing or wrecking the phone each year.'},
  {id:'choice',label:'Your call',type:'seg',def:'buy',options:[{v:'buy',l:'Buy the plan'},{v:'skip',l:'Skip it'}]},
  {id:'fee',label:'Plan fee (dollars per month, for 24 months)',type:'range',min:8,max:15,step:0.5,def:12,d:2,noGut:true,onChange:clearGut},
  {id:'show',label:'Show the average costs',type:'toggle',def:false,help:'Off: you decide by feel first.'},
  {id:'save',label:'Your emergency savings',type:'range',min:0,max:1200,step:50,def:500,unit:' dollars',lvl:'ap',noGut:true,help:'Money you could spend at once on a surprise bill.'}
 ],
 actions:[{id:'best',label:'Pick the cheaper choice on average',lvl:'honors',run(sim){BioLab.setValues(sim,{choice:better(sim),show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'evskip',label:'Skip it: average 2-year cost',unit:'dollars',d:2,min:0,max:500,get:sim=>shown(sim)?ev(sim,'skip'):null},
  {id:'evbuy',label:'Plan: average 2-year cost',unit:'dollars',d:2,min:0,max:500,get:sim=>shown(sim)?ev(sim,'buy'):null},
  {id:'lost',label:'Your call costs this much more on average',unit:'dollars',d:2,min:0,max:300,get:sim=>shown(sim)?lost(sim,sim.p.choice):null},
  {id:'fees',label:'Plan fees alone',unit:'dollars',d:0,min:0,max:400,get:prem},
  {id:'be',label:'The plan wins on average below this fee',unit:'dollars/month',d:2,lvl:'honors',min:0,max:20,get:sim=>shown(sim)?breakeven(sim):null},
  {id:'sdskip',label:'Skip it: standard deviation',unit:'dollars',d:2,lvl:'ap',min:0,max:500,get:sim=>shown(sim)?sd(sim,'skip'):null},
  {id:'sdbuy',label:'Plan: standard deviation',unit:'dollars',d:2,lvl:'ap',min:0,max:500,get:sim=>shown(sim)?sd(sim,'buy'):null},
  {id:'hitskip',label:'Skip it: chance of a bill bigger than your savings',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>100*bigHit(sim,'skip')},
  {id:'hitbuy',label:'Plan: chance of a bill bigger than your savings',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>100*bigHit(sim,'buy')}
 ],
 graphs:[{id:'fee',label:'Average cost vs. the monthly fee',custom:true}],defaultGraph:'fee',
 plot(sim,ctx,box){const sk=ev(sim,'skip'),f0=sim.p.fee,top=Math.max(450,Math.ceil(Math.max(sk,ev(sim,'buy'))/50)*50+50),sh=shown(sim);
  const ax=axes(ctx,box,{xmin:8,xmax:15,ymin:0,ymax:top,xl:'Plan fee (dollars per month)',yl:'Average 2-year cost ($)'});
  if(!sh){txt(ctx,'Lock in your gut to see the average costs',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  const planAt=f=>{const o=sim.p.fee;sim.p.fee=f;const v=ev(sim,'buy');sim.p.fee=o;return v;};
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(8),ax.Y(sk));ctx.lineTo(ax.X(15),ax.Y(sk));ctx.stroke();
  ctx.strokeStyle=PAL['g-line'];ctx.beginPath();ctx.moveTo(ax.X(8),ax.Y(planAt(8)));ctx.lineTo(ax.X(15),ax.Y(planAt(15)));ctx.stroke();
  const be=breakeven(sim);if(be>8&&be<15){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(ax.X(be),ax.Y(sk),6,0,7);ctx.fill();txt(ctx,'Break-even '+$2(be),ax.X(be),ax.Y(sk)-12,{s:12,w:700,c:PAL['s3'],a:'center'});}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(f0),ax.Y(planAt(f0)),6,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+8,[{label:'Skip it',color:PAL['s2']},{label:'Buy the plan',color:PAL['g-line']}]);},
 draw(sim,ctx,vdt,k0){const k=k0,P=probs(sim),N=counts(sim),sh=shown(sim),ap=atLeast('ap'),G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* 100 people like you */
  const gx=24,gy=46,cs=25;
  txt(ctx,'100 people like you',gx,30,{s:13*k,w:700});
  let idx=0;for(let i=0;i<6;i++)for(let j=0;j<N[i];j++){const r=Math.floor(idx/10),c=idx%10,x=gx+c*cs,y=gy+r*cs;
   ctx.fillStyle=PAL[COL[i]];rr(ctx,x+5,y+2,15,21,3);ctx.fill();ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(x+9,y+19,7,2);idx++;}
  txt(ctx,'after 2 years',gx,gy+10*cs+18*k,{s:12*k,c:PAL['cv-soft']});
  /* outcome table */
  const tx=300,rh=Math.max(27,16*k),cw=[tx+26,600,700,792],hy=30;
  txt(ctx,'What you pay over 2 years',tx,hy,{s:13*k,w:700});
  const row0=hy+rh;
  txt(ctx,'Outcome',cw[0],row0,{s:12*k,w:700,c:PAL['cv-soft']});txt(ctx,'Chance',cw[1],row0,{s:12*k,w:700,c:PAL['cv-soft'],a:'right'});
  txt(ctx,'Skip',cw[2],row0,{s:12*k,w:700,c:PAL['s2'],a:'right'});txt(ctx,'Plan',cw[3],row0,{s:12*k,w:700,c:PAL['g-line'],a:'right'});
  OUT.forEach((o,i)=>{const y=row0+rh*(i+1);ctx.fillStyle=PAL[COL[i]];rr(ctx,tx,y-12*Math.min(k,1.4),14,14*Math.min(k,1.4),3);ctx.fill();
   txt(ctx,o.t,cw[0],y,{s:12*k});txt(ctx,pct(P[i]),cw[1],y,{s:12*k,a:'right'});txt(ctx,$(costSkip(o)),cw[2],y,{s:12*k,a:'right'});txt(ctx,$(costPlan(sim,o)),cw[3],y,{s:12*k,a:'right'});});
  let y=row0+rh*7+4;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(tx,y-rh+8);ctx.lineTo(792,y-rh+8);ctx.stroke();
  txt(ctx,'Average',cw[0],y,{s:12*k,w:700});txt(ctx,sh?$(ev(sim,'skip')):'?',cw[2],y,{s:12*k,w:700,a:'right',c:PAL['s2']});txt(ctx,sh?$(ev(sim,'buy')):'?',cw[3],y,{s:12*k,w:700,a:'right',c:PAL['g-line']});
  if(ap&&sh){y+=rh;txt(ctx,'Standard deviation',cw[0],y,{s:12*k});txt(ctx,$(sd(sim,'skip')),cw[2],y,{s:12*k,a:'right',c:PAL['s2']});txt(ctx,$(sd(sim,'buy')),cw[3],y,{s:12*k,a:'right',c:PAL['g-line']});}
  /* the two averages as bars */
  const by=Math.max(338,y+16*k),bx=180,bw=520,scale=bw/500,bb=better(sim);
  if(!sh){txt(ctx,'Lock in your gut to see the average cost of each choice.',400,by+40,{s:13*k,c:PAL['cv-soft'],a:'center'});return;}
  const bh=Math.min(26,(444-by)/2-10);
  [['skip','Skip it','s2'],['buy','Buy the plan','g-line']].forEach(([ch,lab,col],i)=>{const yy=by+i*(bh+16*k*0.9),v=ev(sim,ch),w=clamp(v*scale,2,bw);
   txt(ctx,lab,24,yy+bh/2,{s:13*k,w:700,b:'middle'});ctx.fillStyle=PAL[col];rr(ctx,bx,yy,w,bh,4);ctx.fill();
   let tag=$(v)+(bb===ch?'  lower on average':'');txt(ctx,tag,bx+w+8,yy+bh/2,{s:12*k,w:700,c:bb===ch?PAL['s3']:PAL['cv-ink'],b:'middle'});
   const yours=G&&G.g&&G.g.choice===ch;if(yours){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;rr(ctx,bx-3,yy-3,w+6,bh+6,6);ctx.stroke();}});
  if(G&&G.g)txt(ctx,'Gold outline: your gut',24,446,{s:12*k,c:PAL['s4'],b:'bottom'});},
 narrate(sim){const c=care(sim),f=prem(sim);
  if(!shown(sim))return `The plan costs ${$2(sim.p.fee)} a month: <b>${$(f)} over 2 years before anything breaks</b>. Skip it and you pay nothing, unless something happens. Then a screen costs ${$(SCR)} and a new phone ${$(REP)}.`;
  const sk=ev(sim,'skip'),bu=ev(sim,'buy'),gap=Math.abs(sk-bu),hit=1-(1-c.d)*(1-c.d);
  if(gap<1)return `For someone ${c.l}, the two choices cost about the same on average: ${$(sk)} skipping, ${$(bu)} with the plan.`;
  return sk<bu?`For someone ${c.l}, skipping costs ${$(sk)} on average over 2 years and the plan ${$(bu)}. <b>Skipping saves about ${$(gap)} on average</b>, but ${pct(hit)} of people like you lose or wreck the phone at least once and pay ${$(REP)}.`
   :`For someone ${c.l}, the plan costs ${$(bu)} on average over 2 years and skipping ${$(sk)}. <b>The plan saves about ${$(gap)} on average</b>, because you are likely to need it.`;},
 gut:{better:'lower',controls:['care','choice'],
  ask:{bio:'First pick how careful you are with phones. Then pick here: buy the plan or skip it? Go with your gut, then lock it in.',honors:'Pick how careful you are, then buy or skip by feel. Lock it in before you look at the expected values.'},
  lock(sim){return pick(sim,sim.p.choice);},
  solve(sim){const b=better(sim);sim.p.choice=b;return pick(sim,b);},
  how:{bio:'The math lists everything that could happen in 2 years, how likely each one is, and what you would pay. Multiply each cost by its chance and add them up: that is the average cost of the choice, called its expected value. The lower one wins on average.',
   honors:'Each choice’s 2-year cost is a random variable X. E(X) = Σ x·P(x) over the six outcomes in the table. Compare E(X) for skipping and for the plan.',
   ap:'E(X) = Σ x·P(x) picks the lower average. σ = √(Σ (x − μ)²·P(x)) shows the risk: skipping has a far bigger spread, so it can still make sense to buy if a big bill would hurt you more than the extra average cost.'},
  compare(sim,g,m){const c=care(sim),gap=Math.abs(ev(sim,'skip')-ev(sim,'buy')),hit=1-(1-c.d)*(1-c.d);
   const risk=sim.p.save<REP?` Skipping also means a ${pct(hit)} chance of a ${$(REP)} bill. If you could not cover that, the plan’s steadier cost can be worth paying for.`:'';
   if(g.choice===m.choice)return `Your gut was right on. For someone ${c.l} at ${$2(sim.p.fee)} a month, ${m.choice==='skip'?'skipping':'the plan'} costs about <b>${$(gap)} less on average</b> over 2 years (${$(m.ev)} against ${$(ev(sim,m.choice==='skip'?'buy':'skip'))}). The expected value just puts a number on what your gut sensed.${m.choice==='skip'?risk:''}`;
   return `Your pick costs about <b>${$(g.v)} more on average</b> over 2 years: ${$(g.ev)} to ${CH[g.choice]} against ${$(m.ev)} to ${CH[m.choice]}. Over many people like you, that is ${$(g.v*100)} lost for every 100 phones.${m.choice==='skip'?risk:''}`;},
  again(sim){const ks=Object.keys(CARE);sim.p.care=ks[Math.floor(Math.random()*3)];sim.p.fee=8+0.5*Math.floor(Math.random()*15);sim.p.choice='buy';sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You skip the plan, and most people like you (53 of 100) never break anything in 2 years. So is skipping free on average?',choices:['Yes: most people pay $0','No: the people who crack or lose a phone pull the average up to about $238','No: skipping always costs more than the plan'],correct:1,explain:'The average counts everyone. The 47 people who crack a screen or lose a phone pay $279 to $1,800, so the average 2-year cost of skipping is about $238 for an average user.'},
  {lvl:'bio',instant:true,q:'At $12 a month, who comes out ahead on average by buying the plan?',choices:['A very careful person','An about-average person','Someone hard on phones'],correct:2,explain:'Someone hard on phones expects to need repairs: skipping costs them about $411 on average, the plan about $332. For an average user skipping wins ($238 vs. $313), and for a careful user it wins by more ($128 vs. $302).'},
  {lvl:'honors',instant:true,q:'For someone hard on phones, the plan’s expected 2-year cost is $332. What will they actually pay?',choices:['Exactly $332','One of the six amounts in the table; $332 is the long-run average over many people like them','At most $332'],correct:1,explain:'Expected value is a long-run average. Any one person pays one outcome: $288 if nothing happens, up to $486. Over many people like them, the average comes out near $332.'},
  {lvl:'honors',instant:true,q:'For an about-average user, below what monthly fee does the plan cost less on average than skipping?',choices:['About $4.75','About $8.84','About $12.00','About $15.30'],correct:1,explain:'Skipping costs $237.60 on average. The deductibles add $25.46 on average, so the plan wins when 24 × fee + $25.46 < $237.60: fee < $212.14 ÷ 24 ≈ $8.84 a month.'},
  {lvl:'ap',instant:true,q:'About-average user, $12 a month. Skipping: mean $238, standard deviation $341. Plan: mean $313, standard deviation $37. What does the standard deviation tell you?',choices:['The plan is cheaper','Skipping’s actual cost can swing far from its average; the plan’s cost is almost the same whatever happens','The two choices are equally risky'],correct:1,explain:'σ measures spread. Skipping usually costs $0 but sometimes $900 or more, so its σ is $341. With the plan you pay $288 to $486, so σ is only $37. The plan costs more on average but removes most of the risk.'},
  {lvl:'ap',instant:true,q:'You are about average with phones, the fee is $12, and you have $150 saved. Skipping is about $76 cheaper on average. When is buying the plan still reasonable?',choices:['Never: always pick the lower expected value','When a $900 bill would be a real hardship: there is a 13.5% chance you face one in 2 years','Only if you are hard on phones'],correct:1,explain:'Chance of at least one loss in 2 years: 1 − 0.93² ≈ 13.5%. Expected value is the right guide when you can absorb the bad outcomes. If you cannot, paying a known extra amount to avoid a big hit is the point of insurance.'}
 ],
 tour:[
  {title:'Two ways to pay',text:'The plan costs $12 a month for 24 months: $288 even if nothing ever happens. Then a cracked screen costs $29 and a lost or wrecked phone $99. Skip it, and you pay nothing unless something happens: then $279 for a screen or $900 for a new phone.',pause:true,focus:[296,8,500,286],setup:sim=>BioLab.setValues(sim,{care:'average',fee:12,show:false})},
  {title:'How likely is each outcome?',text:'For an about-average user, this model says each year has a 20% chance of a cracked screen and a 7% chance of losing or wrecking the phone (illustrative numbers). Over 2 years, 53 of 100 people like you have no trouble at all.',pause:true,focus:[16,10,270,300]},
  {title:'Cost is a random variable',text:'Your 2-year cost depends on what happens, so it is a random variable. The table is its probability distribution: every outcome, its chance, and what you pay under each choice.',pause:true,focus:[296,8,500,286]},
  {title:'The average cost: expected value',text:'Multiply each cost by its chance and add. Skipping: 0.533 × $0 + 0.292 × $279 + 0.102 × $900 + … = $237.60. The plan: $313.46. For an average user, skipping saves about $76 on average.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'How careful you are changes the answer',text:'Hard on phones: 35% a year for a crack, 12% for a loss. Now skipping averages $411.30 and the plan $332.06. The plan wins by about $79.',pause:true,setup:sim=>BioLab.setValues(sim,{care:'rough',show:true})},
  {lvl:'honors',title:'The break-even fee',text:'For an about-average user, the plan wins on average only if 24 × fee + $25.46 is less than $237.60: a fee under $8.84 a month. Watch the graph: the plan’s line rises with the fee and crosses the skip line there.',pause:true,setup:sim=>BioLab.setValues(sim,{care:'average',show:true})},
  {lvl:'ap',title:'Risk: the standard deviation',text:'σ = √(Σ (x − μ)²·P(x)). Skipping: σ ≈ $341, because you usually pay $0 but sometimes $900 or more. The plan: σ ≈ $37. Insurance costs more on average and buys you a predictable bill.',pause:true,setup:sim=>BioLab.setValues(sim,{care:'average',show:true})}
 ],
 lab:{bio:'<p><b>Question:</b> For whom is the plan worth it?</p><ol><li>Turn on <b>Show the average costs</b>.</li><li>For each level of care, record a trial with <b>Buy the plan</b> and one with <b>Skip it</b>.</li><li>Repeat at fees of $8 and $15.</li></ol><p>Write one sentence: who should buy the plan, and when?</p>',
  honors:'<p><b>Question:</b> What fee makes the plan a fair deal?</p><ol><li>For each level of care, compute E(X) for skipping by hand from the table.</li><li>Find the fee where the plan’s E(X) equals it, and check it against <b>The plan wins on average below this fee</b>.</li></ol><p>Explain why a fair-deal fee would leave the company no money for its own costs.</p>',
  ap:'<p><b>Question:</b> When does it make sense to pay more on average?</p><ol><li>For an about-average user, record E(X) and σ for both choices.</li><li>Change <b>Your emergency savings</b> from $0 to $1,200 and record the chance of a bill bigger than your savings.</li></ol><p><b>CER:</b> Make a claim about who should buy the plan, with evidence from E(X), σ and the chance of a big bill.</p>'},
 terms:[
  {t:'Random variable',d:'A number whose value depends on chance. Here: what you pay over 2 years.'},
  {t:'Probability distribution',d:'Every possible value of a random variable with its probability. The probabilities add to 1.'},
  {t:'Expected value',d:'The long-run average of a random variable: multiply each value by its probability and add. E(X) = Σ x·P(x).'},
  {t:'Deductible',d:'What you still pay each time you use the plan: here $29 for a screen and $99 for a new phone.'},
  {t:'Independent events',d:'One year’s luck does not change the next year’s chances. This model assumes that.',lvl:'honors'},
  {t:'Standard deviation',d:'How far a random variable typically lands from its mean: σ = √(Σ (x − μ)²·P(x)).',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not financial advice.</b> The phone costs $900. The plan costs the monthly fee for 24 months, plus $29 per screen repair and $99 per replacement when a phone is lost, stolen or wrecked. Without the plan, a screen repair costs $279 and a replacement $900. These prices are typical-looking numbers, not any one company’s terms; real plans add rules such as claim limits, and some do not cover loss at all.</p><p><b>The chances are illustrative, not measured.</b> Each year, independently, the model gives a chance of one cracked screen (10%, 20% or 35%) and a chance of losing or wrecking the phone (4%, 7% or 12%), and at most one of these per year. Over 2 years that gives six outcomes. The expected cost is E(X) = Σ x·P(x) and the spread is σ = √(Σ (x − μ)²·P(x)).</p><p>Real people also decide based on things the model leaves out: whether they would buy a cheaper phone after a loss, how much a big surprise bill would hurt, and peace of mind.</p>'
};
BioLab.register(SIM);
})();
