(function(){
'use strict';
const {clamp,txt,pill,PAL,atLeast,fmtNum}=BioLab.h;
/* Where 1/ln b comes from (Nov 18, 2026, for Colin Downs's AP Precalculus log unit).
   Steepness of b^x at x = 0, measured with one tiny step h: (b^h − 1)/h → ln b. The base with steepness 1 is e.
   b^(x+h) − b^x = b^x (b^h − 1), so the slope anywhere is ln b × height. Mirrored across y = x, log_b x has slope 1/(x ln b). */
const H=sim=>Number(sim.p.h)||0.001;
const meas=(b,h)=>(Math.pow(b,h)-1)/h;
const cpend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g))&&!cpend(sim);
const f2=v=>fmtNum(v,2),f3=v=>fmtNum(v,3);
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

function drawGrow(sim,ctx,k,stg){const b=sim.p.b,kk=Math.min(k,1.5),sh=shown(sim);
 const L0=Math.round(50+20*kk),R0=780,T0=24,B0=400,xmin=-2.2,xmax=2.2,ymin=-0.4,ymax=5.5;
 const X=x=>L0+(x-xmin)/(xmax-xmin)*(R0-L0),Y=y=>B0-(y-ymin)/(ymax-ymin)*(B0-T0);
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;
 for(let x=-2;x<=2;x++){ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(X(x),T0);ctx.lineTo(X(x),B0);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(x),X(x),Y(0)+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
 for(let y=1;y<=5;y++){ctx.globalAlpha=.4;ctx.beginPath();ctx.moveTo(L0,Y(y));ctx.lineTo(R0,Y(y));ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(y),X(0)-8,Y(y)+4,{s:12*kk,c:PAL['cv-soft'],a:'right'});}
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L0,Y(0));ctx.lineTo(R0,Y(0));ctx.moveTo(X(0),T0);ctx.lineTo(X(0),B0);ctx.stroke();
 const line=(m,c,dash,w)=>{ctx.strokeStyle=c;ctx.lineWidth=w||2;ctx.setLineDash(dash||[]);ctx.beginPath();const xa=Math.max(xmin,(ymin-1)/m),xb=Math.min(xmax,(ymax-1)/m);ctx.moveTo(X(xa),Y(1+m*xa));ctx.lineTo(X(xb),Y(1+m*xb));ctx.stroke();ctx.setLineDash([]);};
 const curve=(bb,c,w,dash)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();let f=true;for(let i=0;i<=300;i++){const x=xmin+(xmax-xmin)*i/300,y=Math.pow(bb,x);if(y>ymax+0.5){f=true;continue;}f?ctx.moveTo(X(x),Y(y)):ctx.lineTo(X(x),Y(y));f=false;}ctx.stroke();ctx.setLineDash([]);};
 /* the target: slope exactly 1 through (0, 1) */
 if(stg>=4||stg===99){line(1,PAL['cv-soft'],[6,6],2);txt(ctx,'slope 1 through (0, 1)',X(1.35),Y(2.35)+26*kk,{s:12*kk,w:700,c:PAL['cv-soft'],a:'left'});}
 if(sh&&(stg===99||stg>=4))curve(Math.E,PAL['s3'],2,[3,4]);
 curve(b,PAL['s1'],3);
 txt(ctx,'y = '+f2(b)+'ˣ',X(-2.1),Y(Math.pow(b,-2.1))-14*kk,{s:14*kk,w:800,c:PAL['s1']});
 if(sh){const m=Math.log(b);line(m,PAL['s4'],[],2.5);
  /* the tiny step, drawn big enough to see */
  if(stg<=3||stg===99&&atLeast('honors')){const hv=stg<=3?0.6:Math.max(0.25,Math.min(0.6,H(sim)*60)),y1=Math.pow(b,hv);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(0),Y(1));ctx.lineTo(X(hv),Y(1));ctx.lineTo(X(hv),Y(y1));ctx.stroke();
   txt(ctx,'step h',X(hv/2)+4,Y(1)+18*kk,{s:12*kk,w:700,c:PAL['s5'],a:'left'});txt(ctx,'rise bʰ − 1',X(hv)+8,Y(y1)+12*kk,{s:12*kk,w:700,c:PAL['s5']});}
  if(stg===5){[0.8,1.4].forEach(x=>{const y=Math.pow(b,x);ctx.strokeStyle=PAL['s6'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(x-0.5),Y(y-0.5*m*y));ctx.lineTo(X(x+0.5),Y(y+0.5*m*y));ctx.stroke();ctx.fillStyle=PAL['s6'];ctx.beginPath();ctx.arc(X(x),Y(y),5,0,7);ctx.fill();
   txt(ctx,'height '+f2(y)+' → slope '+f2(m*y),X(x)+10,Y(y)+16*kk,{s:12*kk,w:800,c:PAL['s6']});});}
  pill(ctx,'steepness at x = 0: '+f3(meas(b,H(sim))),X(-1.15),Y(4.7),PAL['s4'],'#fff',13*kk);}
 else if(!cpend(sim))txt(ctx,'Make the red curve just touch the dashed line at (0, 1)',X(-1.1),Y(4.9),{s:13*kk,w:700,c:PAL['cv-ink'],a:'center'});
 if(!sh&&!(stg>=4))line(1,PAL['cv-soft'],[6,6],2);
 ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(X(0),Y(1),5,0,7);ctx.fill();txt(ctx,'(0, 1)',X(0)-8,Y(1)-10,{s:12*kk,w:700,a:'right'});
 if(sh&&(stg===99||stg>=4))txt(ctx,'green dots: base e ≈ 2.718',X(-1.15),Y(4.7)+26*kk,{s:12*kk,w:700,c:PAL['s3'],a:'center'});}

function drawMirror(sim,ctx,k){const b=sim.p.b,kk=Math.min(k,1.5),m=Math.log(b);
 const S=46,OX=400-2*S,OY=226+2*S,lo=-2,hi=5.5;const X=x=>OX+x*S,Y=y=>OY-y*S;
 ctx.save();ctx.beginPath();ctx.rect(X(lo),Y(hi-1.6),(hi-lo+2.6)*S,(hi-lo-1.0)*S);ctx.clip();
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let i=-4;i<=9;i++){ctx.globalAlpha=.35;ctx.beginPath();ctx.moveTo(X(i),Y(-4));ctx.lineTo(X(i),Y(9));ctx.moveTo(X(-4),Y(i));ctx.lineTo(X(9),Y(i));ctx.stroke();}ctx.globalAlpha=1;
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(-4),Y(0));ctx.lineTo(X(9),Y(0));ctx.moveTo(X(0),Y(-4));ctx.lineTo(X(0),Y(9));ctx.stroke();
 ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(X(-4),Y(-4));ctx.lineTo(X(9),Y(9));ctx.stroke();ctx.setLineDash([]);
 const path=(fn,a,z,c,w,dash)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();let f=true;for(let i=0;i<=400;i++){const x=a+(z-a)*i/400,y=fn(x);if(!isFinite(y)||y<-4||y>9){f=true;continue;}f?ctx.moveTo(X(x),Y(y)):ctx.lineTo(X(x),Y(y));f=false;}ctx.stroke();ctx.setLineDash([]);};
 path(x=>Math.pow(b,x),-4,9,PAL['s1'],3);path(x=>Math.log(x)/m,0.005,9,PAL['s5'],3);
 path(x=>1+m*x,-4,9,PAL['s1'],1.8,[7,4]);path(x=>(x-1)/m,-4,9,PAL['s5'],1.8,[7,4]);
 ctx.restore();
 ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(X(0),Y(1),6,0,7);ctx.fill();ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(1),Y(0),6,0,7);ctx.fill();
 txt(ctx,'bˣ: slope ln b = '+f3(m)+' at (0, 1)',X(-1.9),Y(5.0),{s:13*kk,w:800,c:PAL['s1']});
 txt(ctx,'log_b x: slope 1 ÷ ln b = '+f3(1/m)+' at (1, 0)',X(1.2),Y(-1.25),{s:13*kk,w:800,c:PAL['s5']});
 txt(ctx,'mirror line y = x',X(4.3),Y(4.3)+18*kk,{s:12*kk,w:700,c:PAL['cv-soft'],a:'center'});}

const SIM={
 id:'lnbase',hash:'lnbase',apUnit:4,order:7.3,tab:'Where 1/ln b comes from',kind:'Simulation',
 skills:{bio:'Exponential functions and rate of change · Precalculus Unit 6, AP Precalculus 2A',honors:'Natural base e, ln b, and inverse functions · AP Precalculus 2A–2B',ap:'Rates of change of bˣ and log_b x: ln b and 1/(x ln b) · AP Precalculus 2B, preview of AP Calculus'},
 prereq:['logslow'],next:['caffeine','yearlygrowth'],
 card:'Hunt for the one base whose curve climbs exactly as fast as its height, and find out why every log’s slope has a 1/ln b in it.',
 title:'Where does 1/ln b come from?',
 lede:{bio:'Your calculator has an “ln” button and Excel has EXP and LN. They all use a strange number, e ≈ 2.718, that nobody would pick by hand. Find it yourself: one base makes the curve climb exactly as fast as its height.',
  honors:'Measure how steep bˣ is at x = 0 with one tiny step h: (bʰ − 1) ÷ h. Every base has its own steepness, and that number is ln b. Because bˣ⁺ʰ − bˣ = bˣ(bʰ − 1), the slope anywhere is ln b × height. Mirror the graph across y = x and every slope flips to its reciprocal: log_b x has slope 1/(x ln b).',
  ap:'The steepness number turns multiplying bases into adding: (bc)ˣ = bˣcˣ, so steep(bc) = steep(b) + steep(c). A function that turns × into + is a logarithm, and the base where it equals 1 is e. So d/dx bˣ = bˣ ln b and d/dx log_b x = 1/(x ln b).'},
 scale:'A math picture: one curve near the point (0, 1), where every exponential bˣ crosses the y-axis.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your base',
 controls:[
  {id:'b',label:'Base b',type:'range',min:1.2,max:6,step:0.01,def:1.6,unit:''},
  {id:'view',label:'Picture',type:'seg',def:'grow',lvl:'honors',noGut:true,options:[{v:'grow',l:'bˣ near (0, 1)'},{v:'mirror',l:'Mirror: bˣ and log_b x'}]},
  {id:'h',label:'Tiny step h for measuring',type:'seg',def:0.001,lvl:'honors',noGut:true,options:[{v:0.1,l:'0.1'},{v:0.01,l:'0.01'},{v:0.001,l:'0.001'}]}
 ],
 actions:[{id:'show',label:'Skip the guess and show the steepness',run(sim){sim.peek=true;sim.infoDirty=true;}},{id:'e',label:'Snap to e',lvl:'honors',run(sim){sim.peek=true;BioLab.setValues(sim,{b:Math.round(Math.E*100)/100});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'steep',label:'Steepness of bˣ at x = 0 (measured)',unit:'',d:3,min:0,max:2,get:sim=>shown(sim)?meas(sim.p.b,H(sim)):null},
  {id:'ln',label:'ln b',unit:'',d:3,lvl:'honors',min:0,max:2,get:sim=>shown(sim)?Math.log(sim.p.b):null},
  {id:'inv',label:'Slope of log_b x at x = 1 (1 ÷ ln b)',unit:'',d:3,lvl:'honors',min:0,max:6,get:sim=>shown(sim)?1/Math.log(sim.p.b):null},
  {id:'dbl',label:'Time for bˣ to double',unit:'',d:3,lvl:'ap',min:0,max:4,get:sim=>shown(sim)?Math.LN2/Math.log(sim.p.b):null}
 ],
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(sim.p.view==='mirror'&&atLeast('honors')&&shown(sim))drawMirror(sim,ctx,k);else drawGrow(sim,ctx,k,stg);},
 narrate(sim){const b=sim.p.b;
  if(cpend(sim))return 'Work out the steepness from one tiny step. Then compare it with 1.';
  if(!shown(sim))return `The dashed line climbs 1 for every 1 across, the same as its height at (0, 1). <b>Slide the base until the red curve just touches it there</b>, then lock in your guess.`;
  const m=meas(b,H(sim));
  if(sim.p.view==='mirror'&&atLeast('honors'))return `Flip across y = x and rise and run trade places. bˣ climbs ${f3(Math.log(b))} at (0, 1), so log_b x climbs <b>1 ÷ ${f3(Math.log(b))} = ${f3(1/Math.log(b))}</b> at (1, 0).`;
  return `One step of h = ${H(sim)} raises ${f2(b)}ˣ from 1 to ${fmtNum(Math.pow(b,H(sim)),5)}, so the steepness is <b>${f3(m)}</b>. ${Math.abs(m-1)<0.01?'That is 1: this base is e.':m<1?'Less than 1: the curve is too flat. Try a bigger base.':'More than 1: too steep. Try a smaller base.'}`;},
 gut:{better:'lower',controls:['b'],
  ask:{bio:'Drag the slider here to change the base. Stop where the red curve just touches the dashed line at (0, 1), without crossing it. Then lock it in.',honors:'Before you measure anything: slide the base until bˣ looks tangent to the dashed slope-1 line at (0, 1), then lock it in.'},
  hint:'Lock your gut answer, then you will measure your base’s steepness yourself.',
  lock(sim){const b=sim.p.b;return {v:Math.abs(b-Math.E),b,label:'base '+f2(b)};},
  solve(sim){sim.p.b=Math.round(Math.E*100)/100;return {v:Math.abs(sim.p.b-Math.E),b:Math.E,label:'base e ≈ 2.718'};},
  how:{bio:'The math measures steepness with one tiny step: go a tiny h to the right and see how much the curve rises. Rise ÷ run is the steepness. The base whose steepness is exactly 1 is e ≈ 2.718.',
   honors:'Steepness of bˣ at 0 = (bʰ − 1) ÷ h for a tiny h. That number is ln b, and ln e = 1.',
   ap:'lim (h → 0) (bʰ − 1)/h = ln b, and e is the base with ln e = 1.'},
  formula(sim){return `(e^${H(sim)} − 1) ÷ ${H(sim)} = ${fmtNum(meas(Math.E,H(sim)),4)}  ≈ 1, so b = e ≈ 2.718`;},
  calc:{unit:'',d:3,tol:a=>Math.max(0.002,Math.abs(a)*0.01),
   prompt:{bio:sim=>`Your base is <b>${f2(sim.p.b)}</b>. Measure its steepness at x = 0 with one tiny step: compute (${f2(sim.p.b)}^0.001 − 1) ÷ 0.001.`,
    honors:sim=>`Your base ${f2(sim.p.b)} has steepness ln ${f2(sim.p.b)} ≈ ${f3(Math.log(sim.p.b))} at x = 0. Flip the graph across y = x. What is the slope of log_${f2(sim.p.b)} x at x = 1?`,
    ap:sim=>`Your base is ${f2(sim.p.b)}. Using its steepness ln b, how long does ${f2(sim.p.b)}ˣ take to double? (Solve bᵗ = 2.)`},
   answer:sim=>{const b=sim.p.b;if(atLeast('ap'))return Math.LN2/Math.log(b);if(atLeast('honors'))return 1/Math.log(b);return meas(b,0.001);},
   hint:{bio:'Use your calculator: raise the base to the 0.001 power first.',honors:'Mirroring swaps rise and run, so the slope becomes 1 ÷ the old slope.',ap:'t = ln 2 ÷ ln b, and ln 2 ≈ 0.693.'},
   steps(sim){const b=sim.p.b;
    if(atLeast('ap'))return [`bᵗ = 2, so t = ln 2 ÷ ln b.`,`ln 2 ÷ ln ${f2(b)} = 0.693 ÷ ${f3(Math.log(b))} ≈ <b>${f3(Math.LN2/Math.log(b))}</b>.`,'This is the “rule of 70”: for growth of r% a year, ln(1 + r/100) ≈ r/100, so doubling takes about 69.3 ÷ r years.'];
    if(atLeast('honors'))return [`At (0, 1), bˣ rises ${f3(Math.log(b))} for each 1 across.`,`The mirror point is (1, 0), where rise and run trade places.`,`Slope = 1 ÷ ${f3(Math.log(b))} ≈ <b>${f3(1/Math.log(b))}</b>.`];
    const y=Math.pow(b,0.001);return [`${f2(b)}^0.001 ≈ ${fmtNum(y,6)}.`,`Rise: ${fmtNum(y,6)} − 1 = ${fmtNum(y-1,6)}. Run: 0.001.`,`Steepness ≈ ${fmtNum(y-1,6)} ÷ 0.001 ≈ <b>${f3(meas(b,0.001))}</b>. ${meas(b,0.001)<1?'Less than 1, so e is bigger than your base.':'More than 1, so e is smaller than your base.'}`];}},
  compare(sim,g,m){const s=Math.log(g.b),pct=Math.abs(s-1)*100;
   if(Math.abs(g.b-Math.E)<0.06)return `Your gut was right on: base ${f2(g.b)} is within ${fmtNum(Math.abs(g.b-Math.E),2)} of <b>e ≈ 2.718</b>. Its steepness at (0, 1) is ${f3(s)}, almost exactly 1.`;
   return `You picked base ${f2(g.b)}, whose steepness at (0, 1) is ${f3(s)}: ${fmtNum(pct,0)}% ${s<1?'too flat':'too steep'}. The base that climbs exactly as fast as its height is <b>e ≈ 2.718</b>. A growth model using your base as if it were “natural” would be off by ${fmtNum(pct,0)}% per time unit.`;},
  again(sim){sim.peek=false;sim.p.b=[1.4,1.6,2,3.5,4,5][Math.floor(Math.random()*6)];}
 },
 onTourExit(sim){sim.peek=false;sim.tst=null;},
 challenges:[
  {kind:'num',lvl:'bio',q:'Measure the steepness of 10ˣ at x = 0 with one tiny step: (10^0.001 − 1) ÷ 0.001. Round to 3 decimal places.',answer:(Math.pow(10,0.001)-1)/0.001,tol:0.002,unit:'',hint:'10^0.001 ≈ 1.0023.',explain:'10^0.001 ≈ 1.002305, so the steepness is about 0.002305 ÷ 0.001 ≈ 2.305. That is close to ln 10 ≈ 2.303.'},
  {lvl:'bio',instant:true,q:'Which base makes bˣ climb at exactly the same rate as its height at (0, 1)?',choices:['2','e ≈ 2.718','3','10'],correct:1,explain:'2ˣ climbs 0.693 there (too flat) and 3ˣ climbs 1.099 (too steep). The base in between with steepness exactly 1 is e.'},
  {lvl:'bio',instant:true,q:'2ˣ has steepness 0.693 at x = 0, where its height is 1. At x = 3 its height is 8. About how steep is it there?',choices:['0.693','About 5.5','8','About 2.1'],correct:1,explain:'The rise over a tiny step is height × (2ʰ − 1), so the slope is always 0.693 × height: 0.693 × 8 ≈ 5.5. Rate of change proportional to the amount.'},
  {lvl:'honors',instant:true,q:'2ˣ has steepness 0.693 at x = 0. What is the steepness of 4ˣ there?',choices:['0.693','1.386','0.347','2.772'],correct:1,explain:'4ˣ = 2²ˣ: the same curve running twice as fast, so its steepness doubles to 1.386. Multiplying bases (2 × 2) adds steepness (0.693 + 0.693): that is a logarithm’s signature.'},
  {kind:'num',lvl:'honors',q:'What is the slope of log₁₀ x at x = 1? Round to 3 decimal places.',answer:1/Math.LN10,tol:0.001,unit:'',hint:'10ˣ has steepness ln 10 ≈ 2.303 at (0, 1). Mirror it.',explain:'The mirror swaps rise and run: 1 ÷ 2.303 ≈ 0.434.'},
  {lvl:'honors',instant:true,q:'Why does the slope of bˣ grow as the curve gets taller?',choices:['Because bˣ⁺ʰ − bˣ = bˣ(bʰ − 1): the rise over any tiny step is the height times the same factor','Because the curve is a parabola','It does not; the slope is constant','Because b is bigger than 1 only at large x'],correct:0,explain:'Factor out bˣ. The change over a step is the current height times (bʰ − 1), a number that depends only on b and h. So the rate of change is proportional to the amount.'},
  {kind:'num',lvl:'ap',q:'A savings account grows by a factor of 1.07 each year. Using logarithms, how many years until it doubles? Round to 2 decimal places.',answer:Math.LN2/Math.log(1.07),tol:0.01,unit:'years',hint:'t = ln 2 ÷ ln 1.07.',explain:'ln 2 ÷ ln 1.07 = 0.6931 ÷ 0.0677 ≈ 10.24 years. The “rule of 70” gives 70 ÷ 7 = 10, because ln 1.07 ≈ 0.07.'},
  {lvl:'ap',instant:true,q:'Which is d/dx of 5ˣ?',choices:['x · 5ˣ⁻¹','5ˣ','5ˣ ln 5','5ˣ ÷ ln 5'],correct:2,explain:'Slope = height × steepness at 0 = 5ˣ ln 5. The power rule does not apply when x is in the exponent.'}
 ],
 tour:[
  {title:'One tiny step',text:'How steep is 2ˣ at (0, 1)? Step a little to the right and see how much it rises: <b>(2ʰ − 1) ÷ h</b>. With h = 0.001 you get <b>0.693</b>. The purple triangle shows one step, drawn big so you can see it.',pause:true,setup:sim=>{sim.tst=1;sim.peek=true;BioLab.setValues(sim,{b:2,view:'grow',h:0.001});}},
  {title:'Every base has its own number',text:'Base 3 gives <b>1.099</b>. Base 10 would give 2.303. Every exponential has a built-in steepness at (0, 1). That number is called <b>ln b</b>.',pause:true,setup:sim=>{sim.tst=2;BioLab.setValues(sim,{b:3});}},
  {lvl:'honors',title:'Multiplying bases adds steepness',text:'4ˣ = 2²ˣ runs twice as fast as 2ˣ, so its steepness is <b>0.693 + 0.693 = 1.386</b>. 8ˣ gives 3 × 0.693 = 2.079. A function that turns multiplying into adding is a logarithm.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{b:4});}},
  {title:'The base with steepness 1',text:'Between 2 (0.693) and 3 (1.099) is a base whose curve climbs <b>exactly 1</b> at (0, 1), touching the dashed line. That base is <b>e ≈ 2.718</b>, and ln e = 1.',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{b:2.72});}},
  {title:'Why rate follows amount',text:'Over any tiny step, bˣ⁺ʰ − bˣ = <b>bˣ(bʰ − 1)</b>. The height factors out. So the slope anywhere is ln b × height: twice as tall, twice as steep. <b>Growth by multiplying always does this.</b>',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{b:2});}},
  {lvl:'honors',title:'Flip it across y = x',text:'log_b x is bˣ mirrored across y = x. The mirror swaps rise and run, so every slope flips to its reciprocal: <b>1 ÷ ln b at (1, 0)</b>, and 1/(x ln b) at x. That is where the 1/ln b in every log’s slope comes from.',pause:true,setup:sim=>{sim.tst=6;BioLab.setValues(sim,{b:2,view:'mirror'});}},
  {lvl:'ap',title:'The rule of 70',text:'Doubling time: bᵗ = 2, so t = ln 2 ÷ ln b. For r% growth, ln(1 + r/100) ≈ r/100, so t ≈ <b>69.3 ÷ r</b>. Bankers’ “rule of 70” (or 72) is ln 2 in disguise.',pause:true,setup:sim=>{sim.tst=7;BioLab.setValues(sim,{b:2,view:'grow'});}},
  {title:'Stop and wonder',text:'Jacob Bernoulli found e in 1683 by asking what happens to interest compounded more and more often. The same number runs caffeine leaving your blood, a pizza cooling and atoms decaying. None of them “knows” e. <b>Each changes in proportion to how much there is, and e is the base where that proportion is exactly 1.</b>',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{b:2.72,view:'grow'});}}
 ],
 lab:{bio:'<p><b>Question:</b> Which base has steepness 1?</p><ol><li>Press <b>Skip the guess</b>.</li><li>Set the base to 2, 2.5, 2.7, 2.8 and 3. Record the steepness each time.</li><li>Between which two bases does the steepness pass 1?</li></ol><p>Write one sentence: how close can you get to 1?</p>',
  honors:'<p><b>Question:</b> Does the tiny step matter?</p><ol><li>For base 2, record the steepness with h = 0.1, 0.01 and 0.001.</li><li>Compare each with ln 2 ≈ 0.6931.</li><li>Switch to the mirror and record 1 ÷ ln b for bases 2, e and 10.</li></ol><p>Explain why a smaller step gives a better answer.</p>',
  ap:'<p><b>Question:</b> Why is the slope of log_b x equal to 1/(x ln b)?</p><ol><li>Show that bˣ⁺ʰ − bˣ = bˣ(bʰ − 1).</li><li>Use the mirror to turn the slope of bʸ at height x into the slope of log_b x.</li></ol><p><b>CER:</b> Explain where the 1/x and the 1/ln b each come from.</p>'},
 terms:[
  {t:'Steepness at (0, 1)',d:'How fast bˣ climbs where it crosses the y-axis: (bʰ − 1) ÷ h for a tiny step h.'},
  {t:'e',d:'≈ 2.718. The base whose curve climbs exactly as fast as its height.'},
  {t:'Natural log, ln b',d:'The steepness of bˣ at x = 0. ln e = 1, ln 2 ≈ 0.693, ln 10 ≈ 2.303.',lvl:'honors'},
  {t:'Inverse function',d:'Its graph is the mirror image across y = x. Slopes at matching points are reciprocals.',lvl:'honors'},
  {t:'Proportional rate',d:'Slope = constant × amount. True for every bˣ: slope = ln b × bˣ.',lvl:'honors'},
  {t:'Change of base',d:'log_b x = ln x ÷ ln b, so every log is ln x stretched by 1 ÷ ln b.',lvl:'ap'}
 ],
 about:'<p><b>The model.</b> The steepness readout is measured, not looked up: (bʰ − 1) ÷ h with the step h you pick. As h shrinks, it approaches ln b. The mirror view graphs bˣ and log_b x with their tangent lines at (0, 1) and (1, 0).</p><p><b>What this shows and what it does not.</b> It shows numerically that the steepness of bˣ is ln b, that it adds when bases multiply, and that the inverse’s slope is the reciprocal. The proof that the limit exists is in AP Calculus. The pictures are drawn exactly from the formulas.</p>'
};
BioLab.register(SIM);
})();
