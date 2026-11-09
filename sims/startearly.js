(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Two savers, same deposit each year. Sam deposits at the end of each year from age 22 until the stop age S, then stops.
   Alex deposits at the end of each year from S until 67. Each balance grows by r a year:
   B(y) = B(y − 1)(1 + r) + deposit. Sam at S: D[(1 + r)^n − 1]/r with n = S − 22, then × (1 + r)^(67 − S).
   Alex at 67: D[(1 + r)^m − 1]/r with m = 67 − S. D = 12 × monthly amount × (1 + match). */
const START=22,END=67;
const sup=n=>String(n).split('').map(c=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+c]).join('');
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const pc=v=>(Math.round(v*100)/100).toString()+'%';
const r=sim=>sim.p.rate/100,g=sim=>1+r(sim);
const stop=sim=>atLeast('honors')?sim.p.stop:32;
const match=sim=>atLeast('honors')?(+sim.p.match||0)/100:0;
const own=sim=>12*sim.p.amt;                       /* what the saver puts in each year */
const dep=sim=>own(sim)*(1+match(sim));            /* what lands in the account each year */
const nA=sim=>stop(sim)-START,nB=sim=>END-stop(sim);
const series=(D,rr,n)=>rr>0?D*(Math.pow(1+rr,n)-1)/rr:D*n;
const aAtStop=sim=>series(dep(sim),r(sim),nA(sim));
const a67=sim=>aAtStop(sim)*Math.pow(g(sim),nB(sim));
const b67=sim=>series(dep(sim),r(sim),nB(sim));
const both67=sim=>series(dep(sim),r(sim),END-START);
const putA=sim=>own(sim)*nA(sim),putB=sim=>own(sim)*nB(sim);
/* who has more at 67; within 3% counts as "about the same" */
function truth(sim){const A=a67(sim),B=b67(sim),rel=(A-B)/Math.max(A,B);return Math.abs(rel)<0.03?'tie':(A>B?'early':'late');}
const WHO={early:'Sam, the early starter',late:'Alex, the late starter',tie:'About the same'};
/* balance at the end of each year y = 1..45 (age 22 + y) */
function path(sim,who){const out=[0],G=g(sim),D=dep(sim),S=nA(sim);let b=0;for(let y=1;y<=END-START;y++){const on=who==='A'?y<=S:who==='B'?y>S:true;b=b*G+(on?D:0);out.push(b);}return out;}
/* "Your turn": Sam's balance at the stop age, rounded to the dollar as shown, grown for the rest of the years */
const c2=v=>Math.round(v*100)/100;
const calcAns=sim=>c2(Math.round(aAtStop(sim))*Math.pow(g(sim),nB(sim)));
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const touring=sim=>!!(sim.tour&&sim.tour.on);
const locked=sim=>!!(sim.gutS&&sim.gutS.g);
const shown=sim=>!!(sim.p.reveal||touring(sim)||(locked(sim)&&!pending(sim)));
const shownB=sim=>shown(sim)||locked(sim);
const GS=sim=>touring(sim)?null:sim.gutS;
const clear=sim=>{if(BioLab.gutClear)BioLab.gutClear(sim);};
/* the return at which the two friends tie, by bisection (Deep dive) */
function tieRate(sim){const n=nA(sim),m=nB(sim),f=x=>series(1,x,n)*Math.pow(1+x,m)-series(1,x,m);let lo=0.0001,hi=0.5;if(f(lo)>0)return null;for(let k=0;k<80;k++){const mid=(lo+hi)/2;if(f(mid)>0)hi=mid;else lo=mid;}return (lo+hi)/2*100;}

const SIM={
 id:'startearly',hash:'startearly',apUnit:4,order:3.5,tab:'Start at 22 or 32?',kind:'Simulation',
 skills:{bio:'Exponential growth: y = a(1 + r)ᵗ · Algebra 2 (Unit 5)',honors:'Exponential growth and the sum of repeated deposits · Algebra 2 (Unit 5), Precalculus (Unit 6)',ap:'Geometric series and exponential growth · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2A)'},
 card:'Two friends save the same $200 a month for retirement. One starts at 22 and stops at 32; one starts at 32 and never stops. Guess who has more at 67.',
 title:'Start at 22 or 32? Ten early years against thirty-five later ones',
 lede:{bio:'Sam saves $200 a month from 22 to 32, then stops for good. Alex saves the same $200 a month from 32 all the way to 67. Alex puts in more than three times as much money. Who has more at 67?',
  honors:'Each year the account grows by the same percent, so a dollar deposited early gets more years of growth on top of growth. A 7% year multiplies the balance by 1.07, and 35 of those years multiply it by 1.07³⁵, more than 10.',
  ap:'Each friend’s deposits form a geometric series: D + D(1 + r) + … + D(1 + r)ⁿ⁻¹ = D[(1 + r)ⁿ − 1]/r. Sam’s sum then grows by (1 + r)ᵐ more. Who wins depends on r, and you can find the tie rate.'},
 scale:'One deposit at the end of each year, growing a fixed percent a year. Real accounts get a deposit every paycheck and returns that change every year.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The savers',
 controls:[
  {id:'who',label:'Your gut: who has more money at age 67?',type:'seg',def:'tie',options:[{v:'early',l:'Sam, the early starter'},{v:'late',l:'Alex, the late starter'},{v:'tie',l:'About the same'}]},
  {id:'amt',label:'Each friend saves, per month',type:'range',min:50,max:600,step:25,def:200,unit:' dollars',noGut:true,onChange:clear},
  {id:'rate',label:'Yearly return',type:'range',min:3,max:10,step:0.25,def:7,unit:'%',d:2,noGut:true,onChange:clear,help:'7% is about the long-run average yearly return of US stocks after inflation, 1928 to 2025. Real years swing far above and below it.'},
  {id:'stop',label:'Age when Sam stops and Alex starts',type:'range',min:25,max:45,step:1,def:32,unit:'',lvl:'honors',noGut:true,onChange:clear},
  {id:'match',label:'Employer match on every dollar saved',type:'seg',def:'0',lvl:'honors',noGut:true,onChange:clear,options:[{v:'0',l:'None'},{v:'50',l:'50¢ per $1'},{v:'100',l:'$1 per $1'}],help:'Many jobs add money to your retirement account when you save. The most common formula at Vanguard plans is 50 cents for each dollar, on the first 6% of pay.'},
  {id:'reveal',label:'Show the totals now',type:'toggle',def:false,help:'Normally the totals appear once you lock in your gut answer.'}
 ],
 actions:[{id:'six',label:'Try a 6% return',lvl:'honors',run(sim){BioLab.setValues(sim,{rate:6,reveal:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'putA',label:'Sam puts in',unit:'dollars',d:0,min:0,max:null,get:putA},
  {id:'putB',label:'Alex puts in',unit:'dollars',d:0,min:0,max:null,get:putB},
  {id:'a67',label:'Sam has at 67',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?a67(sim):null},
  {id:'b67',label:'Alex has at 67',unit:'dollars',d:0,min:0,max:null,get:sim=>shownB(sim)?b67(sim):null},
  {id:'gap',label:'Sam minus Alex at 67',unit:'dollars',d:0,min:null,max:null,get:sim=>shown(sim)?a67(sim)-b67(sim):null},
  {id:'perA',label:'Each dollar Sam put in became',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?a67(sim)/putA(sim):null},
  {id:'perB',label:'Each dollar Alex put in became',unit:'dollars',d:2,min:0,max:null,get:sim=>shownB(sim)?b67(sim)/putB(sim):null},
  {id:'both',label:'Saving every year, 22 to 67',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?both67(sim):null},
  {id:'free',label:'Match money in Sam’s account by 67',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?a67(sim)*match(sim)/(1+match(sim)):null},
  {id:'tie',label:'Return where they tie',text:true,lvl:'ap',get:sim=>{if(!shown(sim))return 'Lock in your gut first';const t=tieRate(sim);return t===null?'No tie: Sam wins at every return':`About ${t.toFixed(2)}% a year. Above it Sam wins; below it Alex wins.`;}}
 ],
 graphs:[{id:'byrate',label:'Money at 67 vs. yearly return',custom:true}],defaultGraph:'byrate',
 plot(sim,ctx,box){const S=stop(sim),D=dep(sim),fA=x=>series(D,x/100,S-START)*Math.pow(1+x/100,END-S),fB=x=>series(D,x/100,END-S);
  const top=Math.max(fA(10),fB(10))*1.05;const ax=axes(ctx,box,{xmin:3,xmax:10,ymin:0,ymax:top,xl:'Yearly return (%)',yl:'Money at 67 ($)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut to see the totals',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  [[fA,PAL['s3']],[fB,PAL['s2']]].forEach(([f,c])=>{ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.beginPath();for(let x=3;x<=10.001;x+=0.1){const px=ax.X(x),py=ax.Y(f(x));x===3?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();});
  const t=tieRate(sim);if(t!==null&&t>=3&&t<=10){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(t),ax.Y(fB(t)),5,0,7);ctx.fill();txt(ctx,'Tie near '+t.toFixed(1)+'%',ax.X(t)+8,ax.Y(fB(t))-8,{s:12,c:PAL['s4'],w:700});}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.rate),ax.Y(fA(sim.p.rate)),5,0,7);ctx.fill();
  legend(ctx,box.L+10,box.T+8,[{label:'Sam (stops at '+S+')',color:PAL['s3']},{label:'Alex (starts at '+S+')',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),shB=shownB(sim),G=GS(sim),big=k>1.3,S=stop(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const fs=Math.min(k,1.6);
  txt(ctx,$(sim.p.amt)+' a month ('+$(own(sim))+' a year)'+(match(sim)?' + match':'')+', growing '+pc(sim.p.rate)+' a year',24,30*Math.min(k,1.2),{s:15*fs,w:700});
  /* timeline of who saves when */
  const X0=big?24:30,X1=big?640:690,AX=a=>X0+(X1-X0)*(a-START)/(END-START);
  const rowH=20*Math.min(k,1.3),yA=52*Math.min(k,1.25),yB=yA+rowH+10*k;
  const band=(y,a0,a1,col,lab)=>{ctx.fillStyle=PAL['line'];rr(ctx,AX(START),y,AX(END)-AX(START),rowH,4);ctx.fill();ctx.fillStyle=col;rr(ctx,AX(a0),y,AX(a1)-AX(a0),rowH,4);ctx.fill();
   ctx.font='700 '+(12*fs)+'px '+FONT;const w=ctx.measureText(lab).width,inside=w+12<AX(a1)-AX(a0);
   txt(ctx,lab,inside?AX(a0)+6:AX(a1)+6,y+rowH/2+1,{s:12*fs,w:700,c:inside?'#fff':PAL['cv-ink'],b:'middle'});};
  band(yA,START,S,PAL['s3'],(big?'Sam: ':'Sam saves ')+'22 to '+S+', puts in '+$(putA(sim)));
  band(yB,S,END,PAL['s2'],(big?'Alex: ':'Alex saves ')+S+' to 67, puts in '+$(putB(sim)));
  /* balance curves by age */
  const gT=yB+rowH+(big?40:34)*k,gB=450-22*k,gL=X0+(big?54:58),gR=X1;
  const PA=path(sim,'A'),PB=path(sim,'B'),PW=path(sim,'W'),showW=sh&&atLeast('honors');
  const yraw=Math.max(1000,(showW?PW[45]:Math.max(PA[45],PB[45]))*1.05),yst=Math.pow(10,Math.floor(Math.log10(yraw)))/2,ymax=Math.ceil(yraw/yst)*yst;
  const X=a=>gL+(gR-gL)*(a-START)/(END-START),Y=v=>gB-(gB-gT)*v/ymax;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(gL,gT);ctx.lineTo(gL,gB);ctx.lineTo(gR,gB);ctx.stroke();
  txt(ctx,'Money in the account',gL+8,gT-6,{s:12*fs,w:700,c:PAL['cv-soft']});
  [22,32,42,52,67].filter(a=>!big||a!==42&&a!==52).filter(a=>a!==S).forEach(a=>txt(ctx,a===22?'Age 22':String(a),a===22?X(a)-4:X(a),gB+15*fs,{s:12*fs,c:PAL['cv-soft'],a:a===22?'left':'center'}));
  txt(ctx,String(S),X(S),gB+15*fs,{s:12*fs,w:700,c:PAL['cv-ink'],a:'center'});
  txt(ctx,sh?(big?'$'+(ymax>=1e6?(ymax/1e6)+'M':(ymax/1e3)+'K'):$(ymax)):'',gL-6,gT+12*fs,{s:12*fs,c:PAL['cv-soft'],a:'right'});txt(ctx,'$0',gL-6,gB,{s:12*fs,c:PAL['cv-soft'],a:'right'});
  const curve=(P,col,upTo)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();for(let y=0;y<=upTo;y++){const px=X(START+y),py=Y(P[y]);y?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();};
  if(showW){ctx.setLineDash([6,5]);curve(PW,PAL['s5'],45);ctx.setLineDash([]);}
  if(shB)curve(PB,PAL['s2'],45);
  curve(PA,PAL['s3'],sh?45:S-START);
  if(!sh){ctx.strokeStyle=PAL['s3'];ctx.setLineDash([4,6]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(S),Y(PA[S-START]));ctx.lineTo(X(END),Y(PA[S-START]));ctx.stroke();ctx.setLineDash([]);}
  /* end labels */
  const lab=(v,col,txtS,y)=>{ctx.font='700 '+(12*fs)+'px '+FONT;txt(ctx,txtS,gR+8,y,{s:12*fs,w:700,c:col,b:'middle'});};
  const yAe=Y(PA[45]),yBe=Y(PB[45]);let ya=sh?yAe:Y(PA[S-START]),yb=shB?yBe:gB-20;
  if(Math.abs(ya-yb)<18*fs){const mid=(ya+yb)/2,s=9*fs*(ya<=yb?1:-1);ya=mid-s;yb=mid+s;}
  if(!big||sh)lab(PA[45],PAL['s3'],sh?(big?$(PA[45]):'Sam '+$(PA[45])):'Sam ?',clamp(ya,gT,gB));
  lab(PB[45],PAL['s2'],shB?(big?$(PB[45]):'Alex '+$(PB[45])):'Alex ?',clamp(yb,gT,gB));
  if(showW&&!big)txt(ctx,'Every year: '+$(PW[45]),X(52),Y(PW[37])-10,{s:12*fs,w:700,c:PAL['s5'],a:'right'});
  /* the stop age marker and the status line */
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,4]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X(S),gT);ctx.lineTo(X(S),gB);ctx.stroke();ctx.setLineDash([]);
  if(!sh){const mine=G&&G.g;txt(ctx,mine?'Work out Sam’s total to see his curve':'Lock in your gut to see where the money ends up',(X(S)+gR)/2,gT+(gB-gT)*0.45,{s:13*fs,c:PAL['cv-soft'],a:'center'});}
  if(G&&G.g&&!big){pill(ctx,'Your gut: '+(G.g.label||''),gL+130*fs,gT+14*fs,PAL['card2'],PAL['s4'],12*Math.min(k,1.4));}},
 narrate(sim){const S=stop(sim);
  if(!shown(sim))return `Sam saves ${$(own(sim))} a year from 22 to ${S}: ${$(putA(sim))} in all. Alex saves the same from ${S} to 67: ${$(putB(sim))}. <b>Who has more at 67?</b>`;
  const A=a67(sim),B=b67(sim),T=truth(sim);
  return T==='early'?`Sam ends with <b>${$(A-B)} more</b> than Alex, after putting in ${$(putB(sim)-putA(sim))} less. Sam’s money had ${END-S} extra years to grow, and growth builds on growth: each dollar he put in became ${$2(A/putA(sim))}.`
   :T==='late'?`At ${pc(sim.p.rate)} a year, Alex ends with <b>${$(B-A)} more</b>, but needed ${$(putB(sim)-putA(sim))} more of his own money to get there. Each of Sam’s dollars became ${$2(A/putA(sim))}; each of Alex’s became ${$2(B/putB(sim))}.`
   :`They end within 3% of each other: Sam ${$(A)}, Alex ${$(B)}. Sam got there with ${$(putB(sim)-putA(sim))} less of his own money.`;},
 gut:{better:'higher',controls:['who'],
  ask:{bio:'Sam saves $200 a month from 22 to 32 ($24,000 in all), then never adds another dollar. Alex saves $200 a month from 32 to 67 ($84,000). Pick one here: who has more money at 67? Then lock it in.',
   honors:'Pick one here before any math: with these numbers, who has more money at 67? Then lock it in.'},
  lock(sim){const w=sim.p.who;return {v:w===truth(sim)?1:0,who:w,label:WHO[w]||w};},
  solve(sim){const t=truth(sim);sim.p.who=t;return {v:1,who:t,label:WHO[t]};},
  hint:{bio:'Lock in your gut. Then you will work out Sam’s money at 67 yourself.'},
  calc:{unit:'$',d:2,tol:a=>Math.max(50,0.01*a),
   prompt:{bio:sim=>`At ${stop(sim)}, Sam has <b>${$(aAtStop(sim))}</b> saved, and he never adds another dollar. It grows ${pc(sim.p.rate)} a year, so each year it is multiplied by ${(+g(sim).toFixed(4))}. How much does he have at 67, ${nB(sim)} years later?`,
    ap:sim=>`Sam deposits ${$(dep(sim))} at the end of each year for ${nA(sim)} years, at ${pc(sim.p.rate)} a year. Use D[(1 + r)ⁿ − 1]/r to find his balance at ${stop(sim)}, rounded to the dollar. Then grow it for ${nB(sim)} more years. How much does he have at 67?`},
   answer:calcAns,
   hint:'Multiply by the growth factor once for each year: that is the growth factor raised to the number of years.',
   steps(sim){const G=+g(sim).toFixed(4),m=nB(sim),f=Math.pow(g(sim),m),a=Math.round(aAtStop(sim)),out=[];
    if(atLeast('ap'))out.push(`At ${stop(sim)}: ${$(dep(sim))} × (${G}${sup(nA(sim))} − 1) ÷ ${(+r(sim).toFixed(4))} = ${$(a)}.`);
    out.push(`Growth factor for ${m} years: ${G}${sup(m)} = ${f.toFixed(4)}.`);
    out.push(`Sam at 67: ${$(a)} × ${f.toFixed(4)} = <b>${$2(calcAns(sim))}</b>.`);
    out.push(`Alex, saving every year from ${stop(sim)} to 67, ends with ${$(b67(sim))}. ${a67(sim)>b67(sim)?'Sam has more.':'Alex has more here, but he put in '+$(putB(sim)-putA(sim))+' more.'}`);
    return out;}},
  formula(sim){const G=+g(sim).toFixed(4),n=nA(sim),m=nB(sim),D=$(dep(sim)),rr=(+r(sim).toFixed(4));
   const a=`Sam: ${D} × (${G}${sup(n)} − 1) ÷ ${rr} = ${$(aAtStop(sim))} at ${stop(sim)}, then × ${G}${sup(m)} = ${$(a67(sim))}`;
   const b=`Alex: ${D} × (${G}${sup(m)} − 1) ÷ ${rr} = ${$(b67(sim))}`;
   return atLeast('honors')?a+'<br>'+b:`Sam: ${$(aAtStop(sim))} × ${G}${sup(m)} = ${$(a67(sim))}<br>Alex: ${$(b67(sim))}`;},
  how:{bio:'The math grows each year’s balance by the same percent. Sam’s early money gets 35 more years of that growth than Alex’s first dollar does, and growth on growth adds up fast.',
   ap:'Each friend’s deposits are a geometric series, D[(1 + r)ⁿ − 1]/r. Sam’s sum then grows by (1 + r)ᵐ for the years he does not save.'},
  compare(sim,g0,m){const A=a67(sim),B=b67(sim),T=m.who,K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out Sam’s total yourself, so you can grow any balance this way.':'';
   const real=` In real terms: Sam put in ${$(putA(sim))} and ends with ${$(A)}; Alex put in ${$(putB(sim))} and ends with ${$(B)}. Each of Sam’s dollars became ${$2(A/putA(sim))}; each of Alex’s became ${$2(B/putB(sim))}.`;
   if(g0.who===T)return `Your gut was right: ${T==='tie'?'they end about even':WHO[T]+' has more'}. ${T==='early'?'Most people pick Alex, because he puts in more than three times as much.':''}`+real+self;
   return `Your gut said <b>${WHO[g0.who]}</b>, and the math says <b>${WHO[T]}</b>${T==='early'?`, by ${$(A-B)}`:T==='late'?`, by ${$(B-A)}`:''}. ${g0.who==='late'?'Alex does put in far more, but Sam’s money starts growing 10 years sooner, and the last years of growth are the biggest ones.':T==='late'?`At ${pc(sim.p.rate)} a year growth is slower, so Alex’s extra deposits win. Try 7% or more.`:'Sam’s 10 early years nearly match Alex’s 35 later ones.'}`+real+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.amt=R([100,150,200,250,300,400]);sim.p.rate=R([6,6.5,7,7.5,8]);sim.p.who='tie';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'You have $5,000 saved at 25 and add nothing more. It grows 7% a year. How much is it at 45, 20 years later? (Multiply by 1.07 once for each year.)',answer:19348.42,tol:100,unit:'$',d:2,hint:'Find 1.07²⁰ first, then multiply by $5,000.',explain:'1.07²⁰ ≈ 3.8697, and $5,000 × 3.8697 ≈ $19,348. The money almost quadruples without a single new deposit.'},
  {lvl:'bio',instant:true,q:'Sam put in $24,000 and Alex put in $84,000, yet at 7% Sam ends with more. Why?',choices:['Sam got a better interest rate than Alex','Sam’s money had many more years to grow, and each year’s growth also grows','Alex paid more in fees'],correct:1,explain:'Both earn the same 7%. Sam’s deposits sit in the account for 35 to 45 years; Alex’s first deposit gets at most 35. Growth on growth makes those extra years the most valuable ones.'},
  {lvl:'bio',instant:true,q:'At 7% a year, about how long does it take money to double?',choices:['About 5 years','About 10 years','About 20 years'],correct:1,explain:'1.07¹⁰ ≈ 1.97, almost exactly double. So $33,159 at 32 doubles about 3.5 times by 67: × 10.68.'},
  {lvl:'honors',instant:true,q:'Both friends get a 50% employer match on every dollar they save. What happens at 67?',choices:['Alex now wins, because he gets more match money','Both totals rise by exactly 50%, so Sam still wins: about $531,045 to $497,653','The match only helps Sam'],correct:1,explain:'The match raises every deposit by the same 50%, and the formula is D times a growth factor, so both totals are multiplied by 1.5. Who wins stays the same.'},
  {lvl:'honors',instant:true,q:'At a 6% return instead of 7%, who has more at 67?',choices:['Sam, by even more','Alex: about $267,443 to Sam’s $243,141','They tie exactly'],correct:1,explain:'Slower growth makes the extra early years worth less, so Alex’s 35 deposits win. But each of Sam’s dollars still became about $10.13, and each of Alex’s about $3.18.'},
  {lvl:'ap',instant:true,q:'A deposit D at the end of each year for n years at rate r. Which expression is the balance right after the last deposit?',choices:['Dn(1 + r)','D[(1 + r)ⁿ − 1]/r','D(1 + r)ⁿ'],correct:1,explain:'The first deposit grows n − 1 years and the last grows 0, so the sum is D[1 + (1 + r) + … + (1 + r)ⁿ⁻¹], a geometric series equal to D[(1 + r)ⁿ − 1]/r.'},
  {lvl:'ap',kind:'num',q:'With a 10-year early saver and a 35-year late saver, they tie when (1 + r)⁴⁵ − 2(1 + r)³⁵ + 1 = 0. To the nearest tenth of a percent, what return r makes them tie?',answer:6.6,tol:0.1,unit:'%',d:1,hint:'Try 6% and 7% and see where the sign changes. Then narrow it down.',explain:'The root is r ≈ 0.0659, about 6.6% a year. Above it the early saver wins; below it the late saver wins. Set D[(1 + r)¹⁰ − 1]/r × (1 + r)³⁵ equal to D[(1 + r)³⁵ − 1]/r and multiply by r/D to get the equation.'}
 ],
 tour:[
  {title:'Two friends, same $200',text:'Sam and Alex each save $200 a month, $2,400 a year. Sam saves from 22 to 32 and stops. Alex starts at 32 and keeps going to 67.',pause:true,setup:sim=>BioLab.setValues(sim,{amt:200,rate:7,stop:32,match:'0',reveal:true}),focus:[0,0,800,130]},
  {title:'Who put in more?',text:'Sam put in 10 × $2,400 = $24,000. Alex put in 35 × $2,400 = $84,000, three and a half times as much.',pause:true,focus:[0,40,800,90]},
  {title:'Sam’s first 10 years',text:'By 32, Sam’s deposits plus growth add to $33,159. From here he never adds another dollar.',pause:true,focus:[0,130,400,320]},
  {title:'Growth on growth',text:'Each year the balance is multiplied by 1.07. Over 35 years that is 1.07³⁵ ≈ 10.68, so Sam’s $33,159 becomes $354,030.',pause:true,focus:[300,130,500,320]},
  {title:'Alex keeps saving',text:'Alex adds $2,400 every year for 35 years and ends with $331,769. That is a lot of money, but $22,261 less than Sam, after $60,000 more of his own.',pause:true},
  {title:'It depends on growth',text:'At 6% a year, Alex wins: $267,443 to $243,141. Early money matters most when growth is strong.',pause:true,setup:sim=>BioLab.setValues(sim,{rate:6,reveal:true})},
  {lvl:'honors',title:'The best plan',text:'Saving every year from 22 to 67 gives $685,798 at 7%: Sam’s total plus Alex’s total. The dashed line shows it.',pause:true,setup:sim=>BioLab.setValues(sim,{rate:7,reveal:true})},
  {lvl:'ap',title:'The tie rate',text:'Setting the two sums equal gives (1 + r)⁴⁵ − 2(1 + r)³⁵ + 1 = 0, with a root near r = 6.6%.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does the yearly return change who wins?</p><ol><li>Turn on <b>Show the totals now</b>. Keep $200 a month.</li><li>Record a trial at 4%, 5%, 6%, 7%, 8% and 9%.</li><li>Graph <b>Trials</b> with the return on x and <b>Sam minus Alex</b> on y.</li></ol><p>Write one sentence: at about what return does Sam start to win?</p>',
  honors:'<p><b>Question:</b> How many years late is too late?</p><ol><li>At 7%, set the stop age to 27, 32, 37 and 42, and record a trial at each.</li><li>For each one, record <b>Each dollar Sam put in became</b> and <b>Each dollar Alex put in became</b>.</li></ol><p>Explain the pattern with the growth factor 1.07ᵗ.</p>',
  ap:'<p><b>Question:</b> How does the tie rate depend on the stop age?</p><ol><li>Read <b>Return where they tie</b> for stop ages 27, 32, 37 and 42.</li><li>Graph the tie rate against the stop age.</li></ol><p><b>CER:</b> Use the two geometric series to explain the trend.</p>'},
 terms:[
  {t:'Exponential growth',d:'Growth by the same percent each period. After t years at rate r, an amount a becomes a(1 + r)ᵗ.'},
  {t:'Growth factor',d:'The number you multiply by each period: 1 + r. At 7% it is 1.07.'},
  {t:'Compound growth',d:'Growth that is added to the balance, so next year’s growth is figured on a bigger amount.'},
  {t:'Employer match',d:'Money an employer adds to your retirement account when you save, such as 50 cents for each dollar.',lvl:'honors'},
  {t:'Real return',d:'Growth after inflation is taken out. A real return keeps the totals in today’s dollars.',lvl:'honors'},
  {t:'Geometric series',d:'A sum where each term is the last one times the same ratio: a + ar + … + arⁿ⁻¹ = a(rⁿ − 1)/(r − 1).',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> One deposit at the end of each year, D = 12 × the monthly amount (× 1.5 or 2 with a match). Each year the balance is multiplied by 1 + r. Sam deposits for n = stop age − 22 years: D[(1 + r)ⁿ − 1]/r, then that grows (1 + r)ᵐ for m = 67 − stop age years. Alex deposits for m years: D[(1 + r)ᵐ − 1]/r. Monthly deposits would raise both totals a little; who wins does not change much.</p><p><b>Where 7% comes from.</b> US stocks (the S&amp;P 500 with dividends) grew about 10% a year from 1928 to 2025, and about 7% a year after inflation (Aswath Damodaran, NYU Stern, historical returns data). Using a return after inflation keeps the totals in today’s dollars.</p><p><b>What this number hides.</b> Real returns are not smooth: the S&amp;P 500 lost about 37% in 2008, counting dividends, and gained about 26% in 2023. Nobody earns the average every year, and the past does not promise the future. Fees, taxes and missed years all change the totals. At 6% a year, Alex comes out ahead, so the gut-vs-math answer depends on growth. What holds at every rate: early dollars grow more than late ones.</p><p><b>The match.</b> In Vanguard’s How America Saves report, the most common formula is 50 cents per dollar on the first 6% of pay, and the average promised match was 4.7% of pay in 2024 and 2025.</p><p><b>This is a simplified math model, not financial advice.</b></p>'
};
BioLab.register(SIM);
})();
