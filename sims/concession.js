(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Time t = minutes after 6:00 PM (gates open), up to 9:30 PM. Fans join the line at A(t) people per minute;
   the stand serves S = volunteers × 1 person per minute. The line can't go below zero:
   L'(t) = A(t) − S while there is a line (or while A > S). */
const TMAX=210,DT=0.02,PER=1;
const A=t=>1.0+5.5*Math.exp(-Math.pow((t-48)/11,2))+9.0*Math.exp(-Math.pow((t-133)/7,2));
const cache={};
function line(S){if(cache[S])return cache[S];const n=Math.round(TMAX/DT),L=new Float64Array(n+1);let l=0,bi=0;
  for(let i=0;i<n;i++){l=Math.max(0,l+(A((i+.5)*DT)-S)*DT);L[i+1]=l;if(l>L[bi])bi=i+1;}
  /* the peak is where A falls back to S: refine it by bisection */
  let a=Math.max(0,bi*DT-1),b=Math.min(TMAX,bi*DT+1);if(A(a)>S&&A(b)<S){for(let k=0;k<50;k++){const m=(a+b)/2;A(m)>S?a=m:b=m;}}else{a=b=bi*DT;}
  return cache[S]={L,peakT:(a+b)/2,peakL:L[bi]};}
const Lat=(S,t)=>{const r=line(S),i=clamp(Math.round(t/DT),0,r.L.length-1);return r.L[i];};
const Sv=sim=>sim.p.vol*PER;
const peak=sim=>line(Sv(sim));
function fewest(target){for(let v=1;v<=20;v++)if(line(v*PER).peakL<=target)return v;return null;}
const clock=t=>{const m=Math.round(t),h=18+Math.floor(m/60),mm=m%60;return (h>12?h-12:h)+':'+String(mm).padStart(2,'0')+' PM';};
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
const ppl=v=>Math.round(v)+' '+(Math.round(v)===1?'person':'people');
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function htxt(ctx,s,x,y,o){ctx.save();ctx.font=(o.w||400)+' '+(o.s||13)+'px '+BioLab.h.FONT;ctx.textAlign=o.a||'left';ctx.textBaseline=o.b||'alphabetic';ctx.lineJoin='round';ctx.lineWidth=4;ctx.strokeStyle=PAL['cv-bg'];ctx.strokeText(s,x,y);ctx.restore();txt(ctx,s,x,y,o);}
/* the time slider reads as a clock */
function clockOut(sim){const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW.gt,o=w&&w.querySelector('output');if(o){const s=clock(sim.p.gt);if(o.textContent!==s)o.textContent=s;}}
let L0=70;const R0=780;
/* keep a label on the side it was asked for, unless it would run off the stage */
function fits(ctx,lab,x,fs,right){ctx.font='700 '+fs+'px '+BioLab.h.FONT;const w=ctx.measureText(lab).width+14;if(right&&x+w>796)return false;if(!right&&x-w<4)return true;return right;}

const SIM={
 id:'concession',hash:'concession',apUnit:17,order:2,tab:'When is the line longest?',kind:'Simulation',
 card:'You run the concession stand at a Friday night game. Guess when the line peaks, then let the rates in and out tell you.',
 title:'When is the concession line longest?',
 lede:{bio:'Fans join your line at a rate that changes all night. Your volunteers serve at a steady rate. While more people arrive than you serve, the line grows; once fewer arrive, it shrinks. So the line is longest at the moment arrivals drop back to your serving rate.',
  honors:'The line is an accumulation: L(t) adds up (arrival rate − service rate) over time. Its rate of change is L′(t) = A(t) − S, so it peaks where A(t) crosses S from above. That is the Fundamental Theorem of Calculus at work.',
  ap:'L(x) = L(a) + ∫ₐˣ (A(t) − S) dt. This “rate in, rate out” setup is one of the most common structures in AP Calculus free-response questions: find the amount from the rates, find when it is greatest, and decide how to change a rate to meet a target.'},
 scale:'One game night, 6:00 PM to 9:30 PM. Rates are in people per minute; the line is in people.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your stand',
 controls:[
  {id:'gt',label:'Your gut: the line is longest at',type:'range',min:0,max:210,step:1,def:90,unit:' min after 6 PM',onChange:clockOut,help:'Any time from 6:00 to 9:30 PM.'},
  {id:'gl',label:'Your gut: people in line then',type:'range',min:0,max:120,step:1,def:0,unit:' people'},
  {id:'vol',label:'Volunteers working',type:'range',min:2,max:8,step:1,def:4,unit:'',noGut:true,onChange:clearGut,help:'Each volunteer serves about 1 customer a minute (an assumption).'},
  {id:'target',label:'Keep the longest line under',type:'range',min:5,max:60,step:1,def:20,unit:' people',lvl:'honors',noGut:true}
 ],
 actions:[{id:'show',label:'Skip the guess and show the line',run(sim){sim.peek=true;sim.infoDirty=true;}},
  {id:'staff',label:'Staff for my target',lvl:'honors',run(sim){const v=fewest(sim.p.target);if(v!==null)BioLab.setValues(sim,{vol:clamp(v,2,8)});sim.peek=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'S',label:'You serve',unit:'people/min',d:0,min:0,max:null,get:Sv},
  {id:'when',label:'Longest line at',text:true,get:sim=>shown(sim)?clock(peak(sim).peakT):'?'},
  {id:'maxL',label:'Longest line',unit:'people',d:0,min:0,max:null,get:sim=>shown(sim)?peak(sim).peakL:null},
  {id:'wait',label:'Wait for the last person in it',unit:'min',d:0,min:0,max:null,get:sim=>shown(sim)?peak(sim).peakL/Sv(sim):null},
  {id:'need',label:'Fewest volunteers for your target',unit:'',d:0,lvl:'honors',min:0,max:null,get:sim=>fewest(sim.p.target)},
  {id:'rate',label:'L′ at your gut time',unit:'people/min',d:1,lvl:'ap',min:null,max:null,get:sim=>{if(!shown(sim))return null;const t=sim.p.gt,d=A(t)-Sv(sim);return Lat(Sv(sim),t)>0.01||d>0?d:0;}},
  {id:'tot',label:'Fans who join the line, 6:00 to 9:30',unit:'people',d:0,lvl:'ap',min:0,max:null,get:()=>{let s=0;const n=2100,h=TMAX/n;for(let i=0;i<n;i++)s+=A((i+.5)*h)*h;return s;}}
 ],
 graphs:[{id:'staffing',label:'Longest line vs. volunteers',custom:true}],defaultGraph:'staffing',
 plot(sim,ctx,box){const vs=[2,3,4,5,6,7,8],vals=vs.map(v=>line(v*PER).peakL);
  if(!shown(sim)){axes(ctx,box,{xmin:0,xmax:7,ymin:0,ymax:1,xticks:false,xl:'Volunteers',yl:'People'});txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const ax=axes(ctx,box,{xmin:0,xmax:7,ymin:0,ymax:Math.ceil(vals[0]/20)*20,xcats:vs.map(String),xl:'Volunteers working',yl:'Longest line (people)'});
  BioLab.h.bars(ctx,ax,vals,{colors:vs.map(v=>v===sim.p.vol?PAL['rj']:PAL['g-dot'])});
  if(atLeast('honors')){const y=ax.Y(sim.p.target);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(box.L,y);ctx.lineTo(box.L+box.W,y);ctx.stroke();ctx.setLineDash([]);txt(ctx,'Your target: '+sim.p.target,box.L+box.W-6,y-6,{s:12,w:700,c:PAL['s3'],a:'right'});}},
 draw(sim,ctx,vdt,k){clockOut(sim);const S=Sv(sim),sh=shown(sim),G=sim.gutS,P=peak(sim),fs=12*k;
  L0=Math.round(40+26*k);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const X=t=>L0+t/TMAX*(R0-L0);
  /* two panels: rates on top, the line below */
  const T1=40,B1=Math.round(196-6*k),T2=B1+Math.round(34*k)+8,B2=Math.round(440-36*k);
  const RMAX=12,LMAX=Math.max(60,Math.ceil(Math.max(sh?P.peakL:0,sim.p.gl,G&&G.g?G.g.l:0)*1.15/20)*20);
  const Y1=v=>B1-v/RMAX*(B1-T1),Y2=v=>B2-v/LMAX*(B2-T2);
  /* game markers */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X(130),T1,X(150)-X(130),B2-T1);
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(X(60),T1);ctx.lineTo(X(60),B2);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Kickoff',X(60)+5,Y1(9.5),{s:fs,w:700,c:PAL['cv-soft']});txt(ctx,'Halftime',X(140),T1-6,{s:fs,w:700,c:PAL['cv-soft'],a:'center'});
  /* grids */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
  for(let v=0;v<=RMAX;v+=4){const y=Y1(v);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(v),L0-6,y+4*k,{s:fs,c:PAL['cv-soft'],a:'right'});}
  const ls=LMAX>100?40:20;for(let v=0;v<=LMAX;v+=ls){const y=Y2(v);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L0,y);ctx.lineTo(R0,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(v),L0-6,y+4*k,{s:fs,c:PAL['cv-soft'],a:'right'});}
  const tk=k>1.35?60:30;for(let t=0;t<=TMAX;t+=tk){const x=X(t);txt(ctx,clock(t).replace(' PM',''),x,B2+16*k,{s:fs,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'Fans joining per minute',L0+4,T1-6,{s:fs,w:700,c:PAL['s2']});
  txt(ctx,'People in line',L0+4,T2-6,{s:fs,w:700,c:PAL['rj']});
  /* shading between A and S: grows (A>S) red, shrinks (A<S while a line exists) green */
  const n=420;for(let i=0;i<n&&sh;i++){const t=(i+.5)*TMAX/n,a=A(t),grow=a>S,hasLine=Lat(S,t)>0.01;if(!grow&&!hasLine)continue;
   ctx.fillStyle=grow?PAL['s1']:PAL['s3'];ctx.globalAlpha=.25;const x0=X(i*TMAX/n),x1=X((i+1)*TMAX/n);ctx.fillRect(x0,Math.min(Y1(a),Y1(S)),x1-x0+0.5,Math.abs(Y1(a)-Y1(S)));ctx.globalAlpha=1;}
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();for(let i=0;i<=n;i++){const t=i*TMAX/n,x=X(t),y=Y1(A(t));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(L0,Y1(S));ctx.lineTo(R0,Y1(S));ctx.stroke();
  htxt(ctx,'You serve '+S+' per minute',R0-4,Y1(S)-6,{s:fs,w:700,c:PAL['s3'],a:'right'});
  /* the line */
  if(sh){const r=line(S);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();const st=Math.max(1,Math.round(0.5/DT));for(let i=0;i<r.L.length;i+=st){const x=X(i*DT),y=Y2(r.L[i]);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
   ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.12;ctx.beginPath();ctx.moveTo(X(0),Y2(0));for(let i=0;i<r.L.length;i+=st)ctx.lineTo(X(i*DT),Y2(r.L[i]));ctx.lineTo(X(TMAX),Y2(0));ctx.closePath();ctx.fill();ctx.globalAlpha=1;}
  else txt(ctx,'?',X(105),(T2+B2)/2+10*k,{s:30*k,w:700,c:PAL['rj'],a:'center'});
  /* math marker */
  const mk=(t,l,col,lab,right)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X(t),T1);ctx.lineTo(X(t),B2);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=col;ctx.beginPath();ctx.arc(X(t),Y2(l),7,0,7);ctx.fill();right=fits(ctx,lab,X(t),fs,right);htxt(ctx,lab,X(t)+(right?10:-10),Y2(l)-10,{s:fs,w:700,c:col,a:right?'left':'right'});};
  const gtv=G&&G.g?G.g.t:sim.p.gt,glv=G&&G.g?G.g.l:sim.p.gl;
  const showM=sh&&(atLeast('honors')||(G&&G.m)||sim.peek);
  if(showM)mk(P.peakT,P.peakL,PAL['s3'],'Longest: '+ppl(P.peakL)+', '+clock(P.peakT),P.peakT<150);
  const near=showM&&Math.abs(X(gtv)-X(P.peakT))<150*k;
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(gtv),Y2(glv),9,0,7);ctx.stroke();
  ctx.strokeStyle=PAL['s4'];ctx.lineWidth=1.5;ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(X(gtv),T1);ctx.lineTo(X(gtv),B2);ctx.stroke();ctx.globalAlpha=1;
  const gl2=(G&&G.g?'Your gut: ':'Your guess: ')+ppl(glv)+', '+clock(gtv),gRight=fits(ctx,gl2,X(gtv),fs,near?gtv>=P.peakT:gtv<150);
  htxt(ctx,gl2,X(gtv)+(gRight?12:-12),Y2(glv)+(near&&Math.abs(Y2(glv)-Y2(P.peakL))<26*k?(Y2(glv)>Y2(P.peakL)?22*k:-26*k):-12),{s:fs,w:700,c:PAL['s4'],a:gRight?'left':'right'});},
 narrate(sim){const S=Sv(sim),P=peak(sim),t=sim.p.gt,a=A(t);
  if(!shown(sim))return `At ${clock(t)}, about ${fmtNum(a,1)} fans a minute join your line and your ${sim.p.vol} volunteers serve ${S} a minute. <b>${a>S?'More arrive than you serve, so the line is growing.':'Fewer arrive than you serve, so any line is shrinking.'}</b> Lock in your gut to see the line.`;
  return `With ${sim.p.vol} volunteers, the line peaks at <b>${ppl(P.peakL)} at ${clock(P.peakT)}</b>: the moment arrivals fall back to ${S} a minute. Before that, arrivals beat service and the line grows; after it, the line shrinks. The last person in that line waits about ${Math.round(P.peakL/S)} minutes.`;},
 gut:{better:'lower',controls:['gt','gl'],
  ask:{bio:'Look at the blue arrival rate and the green serving rate. Drag the first slider here to the time you think the line is longest, and the second to how many people you think are in it then. The orange ring moves on the empty line graph. Then lock it in.',
   honors:'Before you see the line: drag the sliders here to when you think it is longest and how long it gets, then lock it in.'},
  lock(sim){const P=peak(sim);return {v:Math.abs(sim.p.gt-P.peakT),t:sim.p.gt,l:sim.p.gl,label:ppl(sim.p.gl)+' at '+clock(sim.p.gt)};},
  solve(sim){const P=peak(sim);sim.p.gt=Math.round(P.peakT);sim.p.gl=Math.round(P.peakL);return {v:0,t:P.peakT,l:P.peakL,label:ppl(P.peakL)+' at '+clock(P.peakT)};},
  how:{bio:'The math tracks the difference between the two rates. Each minute the line changes by (people arriving − people served). It keeps growing until arrivals drop back to your serving rate, then shrinks. So the peak is where the blue curve falls back through the green line, and the line’s size there is everything that piled up before it.',
   honors:'L′(t) = A(t) − S. The line is longest where L′ changes from positive to negative: where A(t) crosses S going down. Its size is the area between the curves while A > S.',
   ap:'L(x) = ∫ₐˣ (A(t) − S) dt from the moment a the line last started. Candidates for the maximum: the endpoints and where L′(t) = A(t) − S = 0. The largest wins.'},
  compare(sim,g,m){const S=Sv(sim),off=g.t-m.t,atG=Lat(S,g.t),pm=Math.abs(g.l-m.l),wait=Math.round(m.l/S);
   const ppart=` You guessed ${ppl(g.l)} in line; it was <b>${ppl(m.l)}</b>${pm>3?`, so you were off by ${ppl(pm)}`:', right on'}.`;
   if(Math.abs(off)<=2)return `Your gut was right on: within ${Math.round(Math.abs(off))} minute${Math.round(Math.abs(off))===1?'':'s'} of the peak at ${clock(m.t)}.${ppart} The last person in that line waits about ${wait} minutes.`;
   const pre=g.t<75&&m.t>100?' You picked the pre-game rush, but the halftime line is the bigger one.':(off<0&&g.t>120?' Most people pick the moment arrivals peak, but the line keeps growing as long as more people arrive than you serve.':'');
   return `The line is longest at <b>${clock(m.t)}</b>, ${Math.round(Math.abs(off))} minutes ${off<0?'after':'before'} your pick. At your time it was ${ppl(atG)}.${pre}${ppart} If you plan breaks or restocking by your gut, you could be short-handed when ${ppl(m.l)} are waiting about ${wait} minutes each.`;},
  again(sim){sim.peek=false;const o=[3,4,5,6];sim.p.vol=o[(o.indexOf(sim.p.vol)+1)%o.length];sim.p.gt=90;sim.p.gl=0;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'With 4 volunteers, fans arrive fastest at 8:13 PM, about 10 a minute. When is the line longest?',choices:['At 8:13 PM, when arrivals peak','Later, when arrivals drop back to 4 a minute','At the end of halftime, whatever the rates'],correct:1,explain:'At 8:13 the line is still growing by about 6 people a minute. It keeps growing until arrivals fall to 4 a minute, at 8:20 PM, when it peaks at 52 people.'},
  {lvl:'bio',instant:true,q:'For one minute, 9 fans join your line and your stand serves 4. How does the line change that minute?',choices:['It grows by 9','It grows by 5','It shrinks by 4','It grows by 13'],correct:1,explain:'The change is people in minus people out: 9 − 4 = 5 more people in line.'},
  {lvl:'honors',instant:true,q:'You go from 4 volunteers to 6. What happens to the longest halftime line?',choices:['It drops by 2 people','It drops from about 52 to about 27 people','It disappears','It stays the same but comes earlier'],correct:1,explain:'Serving 2 more a minute shrinks the gap between the rates, and the line only grows while arrivals beat service. The peak drops from 52 to 27 people, and comes 2 minutes earlier (8:18 instead of 8:20).'},
  {lvl:'honors',instant:true,q:'L′(t) = A(t) − S. At the moment the line is longest (with a line already formed), what is L′?',choices:['Positive','Zero','Negative'],correct:1,explain:'Just before the peak L′ > 0 (arrivals beat service) and just after L′ < 0. At the peak L′ = 0: A(t) = S.'},
  {lvl:'ap',instant:true,q:'The line was empty at time a and has stayed above zero since. Which expression gives the number of people in line at time x?',choices:['A(x) − S','∫ₐˣ A(t) dt','∫ₐˣ (A(t) − S) dt','(A(x) − S)(x − a)'],correct:2,explain:'The line accumulates the net rate: everyone who arrived since a, minus everyone served since a. A(x) − S is how fast it is changing, not how long it is.'},
  {lvl:'ap',instant:true,q:'You want the longest halftime line to stay under 20 people. Each volunteer serves 1 customer a minute. What is the fewest volunteers that works?',choices:['5','6','7','10'],correct:2,explain:'Compute the peak for each staffing level: 5 volunteers give 39 people, 6 give 27, 7 give 17. Seven is the fewest that stays under 20.'}
 ],
 tour:[
  {title:'Two rates',text:'The blue curve is how many fans join your line each minute. It peaks before kickoff and again at halftime. The green line is how many your 4 volunteers serve: 4 a minute, all night.',pause:true,setup:sim=>{BioLab.setValues(sim,{vol:4,gt:133,gl:0});sim.peek=false;}},
  {title:'Growing',text:'Where blue is above green (red shading), more people join than you serve, so the line grows. At 8:13 PM about 10 join a minute and 4 are served: the line grows by about 6 people every minute.',pause:true,setup:sim=>{sim.peek=true;},focus:sim=>[X0f(sim,120),30,X0f(sim,152)-X0f(sim,120),200]},
  {title:'Not at the arrival peak',text:'Watch the red line below. At 8:13 PM, when arrivals peak, it is still climbing. It keeps climbing until the blue curve falls back to the green line.',pause:true},
  {title:'The longest line',text:'That happens at 8:20 PM. The line peaks at 52 people, and the last person in it waits about 13 minutes. After that, fewer join than you serve (green shading) and the line shrinks. It is gone by 8:40 PM.',pause:true,setup:sim=>BioLab.setValues(sim,{gt:140,gl:52})},
  {title:'The pre-game rush',text:'Before kickoff the line peaks too: 27 people at 6:57 PM, again right where blue falls back to green. The halftime rush is bigger, so that is the longest line of the night.',pause:true,setup:sim=>BioLab.setValues(sim,{gt:57,gl:27})},
  {lvl:'honors',title:'Add volunteers',text:'With 6 volunteers, you serve 6 a minute. Less of the blue curve rises above the green line, so the halftime peak drops to 27 people at 8:18 PM. The rule holds: L′(t) = A(t) − S, and the peak is where it turns from positive to negative.',pause:true,setup:sim=>BioLab.setValues(sim,{vol:6,gt:138,gl:27})},
  {lvl:'ap',title:'The accumulation function',text:'With 4 volunteers, the halftime line starts at 8:06 PM (t ≈ 125.7), where A first passes 4. Then L(x) = ∫ from 125.7 to x of (A(t) − 4) dt. At the peak, t ≈ 140.3, that integral is 52.2 people: the area of the red region.',pause:true,setup:sim=>BioLab.setValues(sim,{vol:4,gt:140,gl:52})}
 ],
 lab:{bio:'<p><b>Question:</b> How much do volunteers matter?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>For 2 through 8 volunteers, record a trial.</li><li>Graph <b>Trials</b> with volunteers on x and longest line on y.</li></ol><p>Write one sentence: does each extra volunteer help by the same amount?</p>',
  honors:'<p><b>Question:</b> What staffing meets your target?</p><ol><li>Pick a target for the longest line. Predict the fewest volunteers, then press <b>Staff for my target</b>.</li><li>Check that the peak happens where A(t) falls back to S.</li></ol><p>Explain why the peak gets earlier as you add volunteers.</p>',
  ap:'<p><b>Question:</b> Find the longest line from the rates alone.</p><ol><li>For 5 volunteers, find where A(t) = 5 near halftime (both crossings).</li><li>Estimate ∫ (A(t) − 5) dt between them and compare with <b>Longest line</b>.</li></ol><p><b>CER:</b> Justify that this is the absolute maximum, using the candidates test on L.</p>'},
 terms:[
  {t:'Rate',d:'How fast something changes: here, people per minute joining or leaving the line.'},
  {t:'Accumulation function',d:'A function that adds up a rate over time: L(x) = L(a) + ∫ₐˣ (rate in − rate out) dt.',lvl:'honors'},
  {t:'Fundamental Theorem of Calculus',d:'The rate of change of an accumulation function is the rate being added up: if L(x) = ∫ₐˣ r(t) dt, then L′(x) = r(x).',lvl:'honors'},
  {t:'Candidates test',d:'An absolute maximum on an interval happens at an endpoint or where the derivative is zero or undefined. Compare the function’s values there.',lvl:'ap'}
 ],
 about:'<p>Time runs from 6:00 PM (gates open) to 9:30 PM. In this model, kickoff is at 7:00 PM and halftime runs from about 8:10 to 8:30 PM. The arrival rate is a made-up smooth curve: A(t) = 1 + 5.5e^(−((t − 48)/11)²) + 9e^(−((t − 133)/7)²) people per minute, with t in minutes after 6:00, so about 429 fans visit the stand in all. Each volunteer serving 1 customer a minute is an assumption; real stands vary with the menu and how payment works.</p><p>The line can’t be negative: when it is empty and arrivals are slower than service, it stays at zero. While there is a line, L′(t) = A(t) − S. Real arrivals are random, so a real line jumps around this smooth average.</p><p><b>For teachers:</b> this is the “rate in, rate out” structure that appears again and again on AP Calculus free-response questions: an amount found by integrating the difference of two rates, its maximum found where the rates are equal, and a question about changing one rate to meet a target.</p>'
};
function X0f(sim,t){const k=1;const L=Math.round(40+26*k);return L+t/TMAX*(R0-L);}
BioLab.register(SIM);
})();
