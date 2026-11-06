(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* One drink of D mg every morning at 7 AM. After 24 h, a share r = (1/2)^(24/h) of what was in the body is still there (half-life h).
   Right after the drink on day n: Sₙ = D(1 + r + r² + … + r^(n−1)) = D(1 − rⁿ)/(1 − r), which levels off at D/(1 − r). */
const r=sim=>Math.pow(0.5,24/hl(sim));
const hl=sim=>atLeast('honors')?sim.p.half:5;
const Sn=(sim,n)=>{const q=r(sim);return sim.p.dose*(1-Math.pow(q,n))/(1-q);};
const lim=sim=>sim.p.dose/(1-r(sim));
const day=sim=>Math.round(sim.p.day);
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on&&sim.tshow));
const mg=v=>(v===0?'0':(v<10?fmtNum(v,1):Math.round(v)))+' mg';
const pct=v=>fmtNum(100*v,1)+'%';
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* caffeine in the body t hours after the first drink (t ≥ 0), counting drinks at 0, 24, 48, … up to day nmax */
const amt=(sim,t,nmax)=>{let s=0;for(let i=0;i<nmax;i++){const ti=24*i;if(t>=ti)s+=sim.p.dose*Math.pow(0.5,(t-ti)/hl(sim));}return s;};

const SIM={
 id:'caffeinedaily',hash:'caffeinedaily',apUnit:18,order:3,tab:'Does daily caffeine pile up?',kind:'Simulation',prereq:['caffeine'],
 card:'Your mom has one coffee every morning. Guess how much caffeine builds up in her, then add up the leftovers as a geometric series.',
 title:'Does a daily drink pile up?',
 lede:{bio:'Each morning, a little of yesterday’s caffeine is still in her body, plus a smaller bit from the day before, and so on. Add up those leftovers and you get the total. The surprise is how fast it stops growing.',
  honors:'Each day keeps the same share r of what was there the day before, so the amounts form a geometric series: D + Dr + Dr² + … . Its partial sums are Sₙ = D(1 − rⁿ)/(1 − r).',
  ap:'Because 0 < r < 1, rⁿ → 0 and the series converges: Σ Drᵏ = D/(1 − r). The ratio test says the same thing: each term is r times the one before, and r < 1.'},
 scale:'One adult’s coffee every morning at 7 AM, for up to 30 days. Caffeine is in milligrams (mg). The model uses a half-life of 5 hours unless you change it.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Her daily coffee',
 controls:[
  {id:'guess',label:'Your guess: caffeine in her right after the coffee',type:'range',min:0,max:2000,step:5,def:0,unit:' mg'},
  {id:'dose',label:'Caffeine in her morning coffee (adult amounts)',type:'range',min:40,max:200,step:5,def:100,unit:' mg',noGut:true,onChange:clearGut,help:'Caffeine varies a lot by drink and size. The label or the maker’s website gives the real number.'},
  {id:'day',label:'Morning of day',type:'range',min:2,max:30,step:1,def:7,noGut:true,onChange:clearGut,help:'Day 1 is her first coffee. Day 7 is one week in; day 30 is about a month.'},
  {id:'half',label:'Half-life',type:'range',min:3,max:10,step:0.5,def:5,unit:' h',lvl:'honors',noGut:true,onChange:clearGut,help:'Usually about 3 to 7 hours in adults. It varies from person to person and can be longer, for example during pregnancy.'}
 ],
 actions:[{id:'show',label:'Skip the guess and show the build-up',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'morn',label:'In her right after the coffee',unit:'mg',d:1,min:0,max:null,get:sim=>shown(sim)?Sn(sim,day(sim)):null},
  {id:'left',label:'Left over from earlier days',unit:'mg',d:1,min:0,max:null,get:sim=>shown(sim)?Sn(sim,day(sim))-sim.p.dose:null},
  {id:'share',label:'Share still in her after 24 h',unit:'%',d:2,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?100*r(sim):null},
  {id:'limit',label:'Level it settles at',unit:'mg',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?lim(sim):null},
  {id:'ratio',label:'Common ratio r',unit:'',d:4,lvl:'ap',min:0,max:1,get:sim=>r(sim)}
 ],
 graphs:[{id:'partial',label:'Partial sums, day by day',custom:true}],defaultGraph:'partial',
 plot(sim,ctx,box){const n=day(sim),L=lim(sim),S=sim.gutS;
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const top=Math.ceil(Math.max(L,S&&S.g?S.g.mg:0)*1.15/50)*50;
  const ax=axes(ctx,box,{xmin:0.5,xmax:n+0.5,ymin:0,ymax:top,xl:'Morning of day n',yl:'Sₙ, mg right after the drink'});
  const bw=Math.max(2,(ax.X(1.5)-ax.X(0.5))*0.7);for(let i=1;i<=n;i++){const v=Sn(sim,i);ctx.fillStyle=i===n?PAL['rj']:PAL['g-line'];ctx.fillRect(ax.X(i)-bw/2,ax.Y(v),bw,ax.Y(0)-ax.Y(v));}
  const step=n>15?5:1;for(let i=1;i<=n;i+=step)txt(ctx,String(i),ax.X(i),box.T+box.H+16,{s:12,c:PAL['g-axis'],a:'center'});
  ctx.strokeStyle=PAL['s3'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0.5),ax.Y(L));ctx.lineTo(ax.X(n+0.5),ax.Y(L));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Settles at D/(1 − r) = '+mg(L),ax.X(n+0.5)-6,ax.Y(L)-8,{s:12,w:700,c:PAL['s3'],a:'right'});
  if(S&&S.g){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0.5),ax.Y(S.g.mg));ctx.lineTo(ax.X(n+0.5),ax.Y(S.g.mg));ctx.stroke();txt(ctx,'Your gut: '+mg(S.g.mg),ax.X(0.5)+6,ax.Y(S.g.mg)-6,{s:12,w:700,c:PAL['s4']});}},
 draw(sim,ctx,vdt,k){const n=day(sim),D=sim.p.dose,sh=shown(sim),S=sim.gutS,q=r(sim),L=lim(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L0=Math.round(30+30*k),R0=440,T0=Math.round(20+26*k),B0=372,span=24*(n-1)+12;
  const gv=S&&S.g?S.g.mg:sim.p.guess;
  const ymax=Math.max(100,Math.ceil(Math.max(L,Math.min(gv,4*L))*1.12/50)*50);
  const X=t=>L0+t/span*(R0-L0),Y=v=>B0-Math.min(v,ymax)/ymax*(B0-T0);
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const ys=ymax>400?100:(ymax>200?50:25);
  for(let v=0;v<=ymax;v+=ys){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(L0,Y(v));ctx.lineTo(R0,Y(v));ctx.stroke();ctx.globalAlpha=1;txt(ctx,v+' mg',L0-8,Y(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  const dstep=[1,2,5,10].find(d=>d*24/span*(R0-L0)>=56*k)||10;const ppd=24/span*(R0-L0);for(let i=1;i<=n;i++){const x=X(24*(i-1));ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(x,T0);ctx.lineTo(x,B0);ctx.stroke();ctx.globalAlpha=1;
   if(i===1||i===n||(i%dstep===0&&(i-1)*ppd>=56*k&&(n-i)*ppd>=56*k))txt(ctx,'Day '+i,x,B0+18*k,{s:12*k,c:PAL['cv-soft'],a:'center',w:i===n?700:400});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L0,B0);ctx.lineTo(R0,B0);ctx.stroke();
  /* the curve: day 1 only before the gut is locked */
  const tEnd=sh?span:24;ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();
  for(let t=0;t<=tEnd+1e-9;t+=Math.max(0.05,n/40)){const x=X(t),y=Y(amt(sim,t,sh?n:1));t===0?ctx.moveTo(x,Y(0)):0;ctx.lineTo(x,y);}ctx.stroke();
  if(sh){ctx.strokeStyle=PAL['s3'];ctx.setLineDash([6,5]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L0,Y(L));ctx.lineTo(R0,Y(L));ctx.stroke();ctx.setLineDash([]);}
  else{txt(ctx,'Day 2 and after: ?',(L0+R0)/2+20,Y(D*0.6),{s:15*k,w:700,c:PAL['rj'],a:'center'});}
  /* target marker on day n */
  const xn=X(24*(n-1));if(sh){const v=Sn(sim,n);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(xn,Y(v),6,0,7);ctx.fill();}
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(xn,Y(gv),9,0,7);ctx.stroke();
  const gy=Y(gv),close=sh&&Math.abs(gy-Y(Sn(sim,n)))<20*k;txt(ctx,(S&&S.g?'Your gut: ':'Your guess: ')+mg(gv)+(gv>ymax?' (off the chart)':''),xn-14,gy+(close||gy>B0-14?-14:5),{s:12*k,w:700,c:PAL['s4'],a:'right'});
  /* stacked bar: where today's total comes from */
  const BX=470,BW=60;txt(ctx,'Right after the',BX+BW/2,T0-22*k,{s:12*k,w:700,a:'center'});txt(ctx,'day '+n+' drink',BX+BW/2,T0-8*k,{s:12*k,w:700,a:'center'});
  if(sh){let base=0;const cols=[PAL['rj'],PAL['s2'],PAL['s5'],PAL['s6'],PAL['s4']];const labs=['Today','Yesterday','2 days ago','3 days ago','Earlier'];let ly=-1e9;
   for(let i=0;i<Math.min(n,5);i++){const v=i<4?D*Math.pow(q,i):Sn(sim,n)-Sn(sim,4);if(v<=0)continue;const y0=Y(base),y1=Y(base+v);ctx.fillStyle=cols[i];ctx.fillRect(BX,y1,BW,y0-y1);base+=v;
    const my=Math.min((y0+y1)/2,ly===-1e9?1e9:ly-17*k);if(i<3||(y0-y1)>6){txt(ctx,labs[i]+': '+mg(v),BX+BW+6,Math.max(T0+10,my+4),{s:12*k,c:cols[i]===PAL['rj']?PAL['cv-ink']:cols[i],w:i?400:700});ly=Math.max(T0+10,my);}}
   pill(ctx,'Day '+n+': '+mg(Sn(sim,n)),(L0+R0)/2,T0-18*Math.min(k,1.3),PAL['rj'],'#fff',13*Math.min(k,1.3));}
  else{ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([4,4]);ctx.strokeRect(BX,Y(D),BW,B0-Y(D));ctx.setLineDash([]);txt(ctx,'?',BX+BW/2,Y(D)-12,{s:28*k,w:700,c:PAL['rj'],a:'center'});}
  txt(ctx,'One drink: '+D+' mg each morning',L0,T0-18*Math.min(k,1.3)+(sh?24*Math.min(k,1.3):0),{s:12*k,c:PAL['cv-soft']});},
 narrate(sim){const n=day(sim),q=r(sim),h=hl(sim);
  if(!shown(sim))return `With a half-life of ${fmtNum(h,1)} hours, 24 hours is ${fmtNum(24/h,1)} half-lives. <b>Does each new drink stack on a big pile, or on a small one?</b> Lock in your guess to see.`;
  return `Each morning only <b>${pct(q)}</b> of yesterday’s caffeine is left. So on day ${n} she has ${sim.p.dose} mg from today, ${mg(sim.p.dose*q)} from yesterday, and less from each day before: <b>${mg(Sn(sim,n))} in all</b>. It levels off at ${mg(lim(sim))}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag <b>Your guess</b> here to how many milligrams (mg) of caffeine you think are in your mom’s body right after her coffee on the morning shown. The orange ring moves with it. Then lock it in.',
   honors:'Before you see the series: set <b>Your guess</b> for Sₙ, the caffeine in her right after the coffee on day n, then lock it in.'},
  lock(sim){const g=sim.p.guess,v=Sn(sim,day(sim));return {v:Math.abs(g-v),mg:g,label:mg(g)+' on day '+day(sim)};},
  solve(sim){const v=Sn(sim,day(sim));sim.peek=true;sim.p.guess=Math.round(v/5)*5;return {v:0,mg:v,label:mg(v)+' on day '+day(sim)};},
  how:{bio:'Each morning a fixed share of yesterday’s caffeine is left: here, a half-life of 5 hours means 24 hours is 4.8 half-lives. The math adds today’s drink, plus that share of yesterday’s, plus that share of that share from the day before, and so on.',
   honors:'Sₙ = D + Dr + Dr² + … + Drⁿ⁻¹ = D(1 − rⁿ)/(1 − r), with r = (1/2)^(24/h).',
   ap:'Sₙ = D(1 − rⁿ)/(1 − r) → D/(1 − r) as n → ∞, because |r| < 1. The partial sums climb toward that limit and never pass it.'},
  compare(sim,g,m){const off=g.mg-m.mg,n=day(sim),D=sim.p.dose,pile=D*n;
   if(Math.abs(off)<=5)return `Your gut was right on: within ${mg(Math.abs(off))}. You saw that a once-a-day drink barely stacks up when most of it is gone by the next morning.`;
   if(off>0)return `You guessed ${mg(g.mg)}, but only <b>${mg(m.mg)}</b> is in her on day ${n}: you were <b>${mg(Math.abs(off))} too high</b>. ${g.mg>=D*2?`If nothing ever left, ${n} drinks would be ${pile} mg. `:''}Each morning only ${pct(r(sim))} of yesterday’s caffeine is still there, so the total levels off at ${mg(lim(sim))}.`;
   return `You guessed ${mg(g.mg)}, but <b>${mg(m.mg)}</b> is in her right after the coffee: you were <b>${mg(Math.abs(off))} too low</b>. Today’s drink alone is ${D} mg, and the leftovers from earlier days add ${mg(m.mg-D)} on top.`;},
  again(sim){sim.peek=false;sim.p.dose=[60,80,100,120,150,200][Math.floor(Math.random()*6)];sim.p.day=[2,3,7,14,30][Math.floor(Math.random()*5)];sim.p.guess=0;
   if(atLeast('honors'))sim.p.half=[4,5,6,7,8,10][Math.floor(Math.random()*6)];}
 },
 onTourExit(sim){sim.peek=false;sim.tshow=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'She has 100 mg every morning, and her half-life is 5 hours. After a week, about how much is in her right after her coffee?',choices:['About 104 mg','About 200 mg','About 700 mg'],correct:0,explain:'24 hours is 4.8 half-lives, so only 3.6% of yesterday’s caffeine is left each morning. Day 7: 100 + 3.6 + 0.13 + … ≈ 103.7 mg. It stops growing after about two days.'},
  {lvl:'bio',instant:true,q:'Same drink, but now compare day 7 with day 30. What happens to the amount right after her coffee?',choices:['Day 30 is about four times day 7','Day 30 is a little more than day 7','They are essentially the same'],correct:2,explain:'Both are about 103.7 mg. Once the leftovers get tiny, adding more days changes almost nothing. The total has leveled off.'},
  {lvl:'honors',instant:true,q:'Your dad’s half-life is 8 hours. What share of each morning’s caffeine is still in him 24 hours later?',choices:['1/3','1/8','1/24'],correct:1,explain:'24 hours is 3 half-lives: (1/2)³ = 1/8, or 12.5%. That is the common ratio r of the series.'},
  {lvl:'honors',instant:true,q:'With r = 1/8 and 120 mg every morning, what level does the morning total settle at?',choices:['About 120 mg','About 137 mg','About 240 mg','It keeps growing'],correct:1,explain:'D/(1 − r) = 120/(7/8) ≈ 137.1 mg. Each day adds 120 mg, and 7/8 of the total leaves by the next morning, so it settles where those balance.'},
  {lvl:'ap',instant:true,q:'Which statement is true of Σₖ₌₀^∞ 100(0.2)ᵏ?',choices:['It diverges because there are infinitely many terms','It converges to 125','It converges to 120','It converges to 100'],correct:1,explain:'A geometric series with |r| < 1 converges to a/(1 − r) = 100/0.8 = 125. Infinitely many terms can still have a finite sum when they shrink fast enough.'},
  {lvl:'ap',instant:true,q:'For the series D + Dr + Dr² + …, the ratio test looks at |aₖ₊₁ / aₖ|. What is that ratio here, and what does it tell you?',choices:['r; the series converges when r < 1','D; the series converges when D < 1','1; the test tells you nothing','rᵏ; it depends on k'],correct:0,explain:'Each term is r times the one before, so the ratio is exactly r for every k. A limit below 1 means the series converges, which is why the morning total levels off.'}
 ],
 tour:[
  {title:'Day 1',text:'Your mom has 100 mg of caffeine at 7 AM. With a 5-hour half-life, it fades by half every 5 hours. By 7 AM the next day, 24 hours later, only 3.6 mg is left.',pause:true,setup:sim=>{sim.tshow=false;BioLab.setValues(sim,{dose:100,day:7,half:5,guess:0});}},
  {title:'Day 2',text:'Her second coffee lands on top of that 3.6 mg: 103.6 mg right after the drink. The new drink adds 100; yesterday’s adds 3.6.',pause:true,setup:sim=>{sim.tshow=true;BioLab.setValues(sim,{day:2});}},
  {title:'Day 3',text:'On day 3 she has today’s 100 mg, 3.6 mg from yesterday and 0.13 mg from the day before: 103.7 mg. Each day’s leftover is 3.6% of the one after it.',pause:true,setup:sim=>BioLab.setValues(sim,{day:3})},
  {title:'A week',text:'By day 7 the total is still 103.7 mg. Adding more days adds almost nothing, because the leftovers shrink so fast. The morning total does not keep growing.',pause:true,setup:sim=>BioLab.setValues(sim,{day:7})},
  {lvl:'honors',title:'A geometric series',text:'Each term is r = (1/2)^(24/5) ≈ 0.036 times the one before: Sₙ = 100(1 + r + r² + … + rⁿ⁻¹) = 100(1 − rⁿ)/(1 − r).',pause:true},
  {lvl:'honors',title:'A slower half-life',text:'With a 10-hour half-life, r = (1/2)^2.4 ≈ 0.19. Now the leftovers matter more: 100, 118.9, 122.5, 123.2 mg, settling near 123.4 mg.',pause:true,setup:sim=>BioLab.setValues(sim,{half:10,day:7})},
  {lvl:'ap',title:'The limit',text:'Because r < 1, rⁿ → 0, so Sₙ → D/(1 − r) = 100/(1 − 0.1895) ≈ 123.4 mg. The ratio test agrees: every term is 0.19 times the one before.',pause:true,setup:sim=>BioLab.setValues(sim,{day:30})}
 ],
 lab:{bio:'<p><b>Question:</b> How fast does the morning total stop growing?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Keep 100 mg. Set the day to 2, 3, 4, 7 and 30. Record a trial each time.</li><li>Write down how much each day adds to the day before.</li></ol><p>Write one sentence: after how many days does it stop changing to the nearest mg?</p>',
  honors:'<p><b>Question:</b> How does a person’s half-life change the level it settles at?</p><ol><li>Keep 100 mg and day 30.</li><li>Set the half-life to 3, 5, 7 and 10 hours. Record the share left after 24 h and the level each time.</li><li>Check one level with D/(1 − r).</li></ol><p>Explain why a longer half-life raises the level but does not make it grow forever.</p>',
  ap:'<p><b>Question:</b> How close to the limit is Sₙ?</p><ol><li>For a 10-hour half-life, find r and the limit D/(1 − r).</li><li>Show that the gap between the limit and Sₙ is Drⁿ/(1 − r).</li><li>Find the first day the gap is under 1 mg, and check it in the tool.</li></ol><p><b>CER:</b> Use the ratio test to explain why the total has to level off.</p>'},
 terms:[
  {t:'Half-life',d:'The time for half of the caffeine in a person’s body to be gone.'},
  {t:'Geometric series',d:'A sum where each term is the same number r times the one before: a + ar + ar² + … .',lvl:'honors'},
  {t:'Partial sum',d:'Sₙ, the sum of the first n terms: a(1 − rⁿ)/(1 − r).',lvl:'honors'},
  {t:'Convergence',d:'An infinite series converges when its partial sums approach a finite limit. A geometric series converges to a/(1 − r) when |r| < 1.',lvl:'ap'},
  {t:'Ratio test',d:'If |aₖ₊₁/aₖ| approaches a limit below 1, the series converges; above 1, it diverges.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not health advice.</b> It treats each morning’s drink as taken in all at once and lets caffeine fade by A(t) = A₀(1/2)^(t/h). After 24 hours a share r = (1/2)^(24/h) is left, so right after the drink on day n the body has Sₙ = D(1 − rⁿ)/(1 − r).</p><p><b>The half-life is an assumption.</b> The scenario is about an adult. In adults the half-life is usually about 3 to 7 hours, according to a safety review by Food Standards Australia New Zealand. The model uses 5 hours unless you change it. It varies from person to person and can be longer, for example during pregnancy. This model says nothing about whether daily caffeine is a good idea for teens: pediatric guidance urges teens to limit or avoid caffeine, and the American Academy of Pediatrics has said that the caffeine and other stimulants in energy drinks have no place in the diets of children and teens.</p>'
};
BioLab.register(SIM);
})();
