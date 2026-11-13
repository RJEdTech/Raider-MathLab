(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const usd=v=>(v<-0.004?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=v=>Math.abs(v-Math.round(v))<1e-9?(v<0?'−':'')+'$'+Math.abs(Math.round(v)).toLocaleString('en-US'):usd(v);
const fm=v=>(Math.round(v*100)/100).toLocaleString('en-US',{maximumFractionDigits:2});
const P=sim=>sim.p;
const C=(sim,n)=>sim.p.F+sim.p.c*n, Rv=(sim,n)=>sim.p.s*n, prof=(sim,n)=>Rv(sim,n)-C(sim,n);
const margin=sim=>sim.p.s-sim.p.c;                       /* always > 0: price min 8 > cost max 7.5 */
const bep=sim=>sim.p.F/margin(sim);                      /* exact break-even */
const need=sim=>Math.ceil(bep(sim)-1e-9);                /* whole bottles */
const goalN=sim=>Math.ceil((sim.p.F+sim.p.goal)/margin(sim)-1e-9);
/* Gut score in dollars (lower is better): a goal short of break-even leaves this much loss; a goal past it
   means the club had already made this much profit before reaching your goal. Zero at the whole-bottle break-even. */
function miss(sim,g){return g<bep(sim)-1e-9?-prof(sim,g):margin(sim)*(g-need(sim));}
const shown=sim=>!!sim.p.show;
function niceMax(v){for(const s of [10,20,25,50,100,200,250,500,1000])if(v<=s*6)return Math.ceil(v/s)*s;return Math.ceil(v/2000)*2000;}

const SIM={
 id:'breakeven',hash:'breakeven',apUnit:2,order:2,tab:'Break-even fundraiser',kind:'Simulation',
 card:'Guess how many water bottles your club must sell to stop losing money, then let two lines find the exact break-even point.',
 title:'When does the fundraiser break even?',
 lede:{bio:'A fundraiser starts in the hole: you pay for the setup before you sell anything. Each sale climbs you out a little. The break-even point is where the money coming in finally equals the money going out.',
  honors:'Cost and revenue are both linear: C(n) = setup + cost per item × n and R(n) = price × n. Break-even is the solution of the system C(n) = R(n): the point where the two lines cross.',
  ap:'Subtract the equations and the n terms combine: R − C = (price − cost)n − setup. Break-even is where that profit line hits zero, and any profit goal is one more linear equation.'},
 scale:'Money in and money out for one sale. Prices are made up for illustration.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The fundraiser',
 controls:[
  {id:'guess',label:'Your guess: bottles to break even',type:'range',min:0,max:150,step:1,def:15,unit:' bottles'},
  {id:'show',label:'Show the cost and revenue lines',type:'toggle',def:false,help:'Lock in your gut first.'},
  {id:'sold',label:'Bottles you actually sell',type:'range',min:0,max:150,step:1,def:40,unit:'',noGut:true},
  {id:'s',label:'Selling price per bottle ($)',type:'range',min:8,max:30,step:0.5,def:14,unit:'',d:2,noGut:true},
  {id:'F',label:'Setup cost ($)',type:'range',min:0,max:400,step:10,def:240,unit:'',d:0,lvl:'honors',noGut:true,help:'Paid once, before you sell anything: the logo printing setup.'},
  {id:'c',label:'Cost per bottle ($)',type:'range',min:1,max:7.5,step:0.5,def:6,unit:'',d:2,lvl:'honors',noGut:true},
  {id:'goal',label:'Profit goal ($)',type:'range',min:0,max:1000,step:25,def:200,unit:'',d:0,lvl:'ap',noGut:true}
 ],
 init(){return {};},step(){},
 onLevel(sim){const w=sim.ui.ctlW&&sim.ui.ctlW.guess;if(!w)return;const L=w.querySelector('.lbl,label');if(L)L.textContent=atLeast('honors')?'Your guess: bottles to break even':'Your guess: bottles to stop losing money';},
 metrics:[
  {id:'cost',label:'Money out (cost)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?C(sim,sim.p.sold):NaN},
  {id:'rev',label:'Money in (revenue)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?Rv(sim,sim.p.sold):NaN},
  {id:'profit',label:'Profit (negative = loss)',unit:'dollars',d:2,min:null,max:null,get:sim=>shown(sim)?prof(sim,sim.p.sold):NaN},
  {id:'be',label:'Break-even point',unit:'bottles',d:1,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?bep(sim):NaN},
  {id:'need',label:'Bottles to sell to not lose money',unit:'bottles',d:0,min:0,max:null,get:sim=>shown(sim)?need(sim):NaN},
  {id:'goalN',label:'Bottles to reach your profit goal',unit:'bottles',d:0,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?goalN(sim):NaN}
 ],
 graphs:[{id:'profit',label:'Profit vs. bottles sold',custom:true}],defaultGraph:'profit',
 plot(sim,ctx,box){const xm=Math.max(60,Math.ceil(Math.max(bep(sim)*1.6,sim.p.sold,atLeast('ap')?goalN(sim):0)/10)*10),lo=-sim.p.F,hi=prof(sim,xm),m=niceMax(Math.max(Math.abs(lo),Math.abs(hi),20));
  const ax=axes(ctx,box,{xmin:0,xmax:xm,ymin:-m,ymax:m,xl:'Bottles sold',yl:'Profit ($)'});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(xm),ax.Y(0));ctx.stroke();
  if(!shown(sim)){txt(ctx,'Turn on Show the lines to see profit.',box.L+box.W/2,box.T+box.H/2-20,{s:13,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(lo));ctx.lineTo(ax.X(xm),ax.Y(hi));ctx.stroke();
  const b=bep(sim);ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(ax.X(b),ax.Y(0),6,0,7);ctx.fill();txt(ctx,'Break-even: '+fm(b),ax.X(b)+8,ax.Y(0)+18,{s:12,w:700,c:PAL['s3']});
  if(atLeast('ap')){const y=ax.Y(sim.p.goal);ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['s5'];ctx.beginPath();ctx.moveTo(ax.X(0),y);ctx.lineTo(ax.X(xm),y);ctx.stroke();ctx.setLineDash([]);txt(ctx,'Profit goal',box.L+8,y-6,{s:12,c:PAL['s5']});}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.sold),ax.Y(prof(sim,sim.p.sold)),5,0,7);ctx.fill();},
 draw(sim,ctx,vdt,k0){const k=Math.max(k0,1.45),p=sim.p,sh=shown(sim),G=sim.gutS||{},big=k>=1.6;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const ch=Math.round(18+32*k);
  const card=(x,w,col,t1,t2)=>{rr(ctx,x,10,w,ch,10);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
   txt(ctx,t1,x+14,10+8+13*k,{s:15*k,w:700,c:col});txt(ctx,t2,x+14,10+ch-10,{s:13*k});};
  const hon=atLeast('honors');
  card(20,370,PAL['s1'],'Money out',hon?`C(n) = ${fm(p.F)} + ${fm(p.c)}n`:`${usd0(p.F)} setup + ${usd0(p.c)} a bottle`);
  card(410,370,PAL['s2'],'Money in',hon?`R(n) = ${fm(p.s)}n`:`${usd0(p.s)} a bottle`);
  const GT=10+ch+Math.round(18+10*k),GB=Math.round(450-14-14*k),GL=Math.round(40+26*k),GR=770;
  sim.vis.plot=[GL-10,GT-10,GR-GL+20,GB-GT+20];
  if(!sh){const cy=(GT+GB)/2;
   txt(ctx,hon?'How many bottles to break even?':'How many bottles until the club stops losing money?',400,cy-24*k,{s:18*k,w:700,a:'center',c:PAL['rj']});
   if(!G.g)pill(ctx,`Your guess: ${p.guess} bottles`,400,cy+6*k,PAL['s4'],'#111',13*k);
   txt(ctx,G.g?'Turn on Show the lines to check.':'Lock in your guess to see the lines.',400,cy+34*k,{s:13*k,a:'center',c:PAL['cv-soft']});return;}
  const b=bep(sim),raw=Math.max(60,b*1.6,p.sold,atLeast('ap')?goalN(sim):0),xstep=[10,20,25,50,100,200].find(v=>raw/v<=(big?3:6))||500,xm=Math.ceil(raw/xstep)*xstep;
  const ym=niceMax(Math.max(C(sim,xm),Rv(sim,xm))),X=v=>GL+(GR-GL)*v/xm,Y=v=>GB-(GB-GT)*v/ym;
  sim.vis.be=[X(b)-40,Y(Rv(sim,b))-40,80,80];
  /* grid and axes */
  ctx.lineWidth=1;for(let i=0;i<=5;i++){const y=Math.round(Y(i*ym/5))+.5;ctx.strokeStyle=PAL['line'];ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(GL,y);ctx.lineTo(GR,y);ctx.stroke();ctx.globalAlpha=1;
   if(!big||i%2===0)txt(ctx,usd0(i*ym/5),GL-8,y,{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});}
  const nx=Math.round(xm/xstep);for(let i=0;i<=nx;i++){const v=i*xstep,end=i===nx;txt(ctx,fm(v)+(end?' bottles':''),end?GR:X(v),GB+6+12*k,{s:12*k,c:PAL['cv-soft'],a:end?'right':'center'});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(GL,GT);ctx.lineTo(GL,GB);ctx.lineTo(GR,GB);ctx.stroke();
  /* loss and profit regions between the lines */
  const region=(a,z,col)=>{ctx.fillStyle=col;ctx.globalAlpha=.16;ctx.beginPath();ctx.moveTo(X(a),Y(C(sim,a)));ctx.lineTo(X(z),Y(C(sim,z)));ctx.lineTo(X(z),Y(Rv(sim,z)));ctx.lineTo(X(a),Y(Rv(sim,a)));ctx.closePath();ctx.fill();ctx.globalAlpha=1;};
  region(0,Math.min(b,xm),PAL['s1']);if(b<xm)region(b,xm,PAL['s3']);
  if(b>8)txt(ctx,'Loss',X(b*0.35),(Y(C(sim,b*0.35))+Y(Rv(sim,b*0.35)))/2+5,{s:13*k,w:700,c:PAL['s1'],a:'center'});
  if(xm-b>8){const q=b+(xm-b)*0.72;txt(ctx,'Profit',X(q),(Y(C(sim,q))+Y(Rv(sim,q)))/2+5,{s:13*k,w:700,c:PAL['s3'],a:'center'});}
  /* lines */
  const line=(f,col)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(0),Y(f(0)));ctx.lineTo(X(xm),Y(f(xm)));ctx.stroke();};
  line(n=>C(sim,n),PAL['s1']);line(n=>Rv(sim,n),PAL['s2']);
  let yc=Y(C(sim,xm)),yr=Y(Rv(sim,xm));if(Math.abs(yc-yr)<18*k){if(yc<yr)yr=yc+18*k;else yc=yr+18*k;}
  txt(ctx,hon?'Cost':'Money out',GR-4,clamp(yc,GT+12*k,GB-6)+(yc>yr?16*k:-8),{s:13*k,w:700,c:PAL['s1'],a:'right'});
  txt(ctx,hon?'Revenue':'Money in',GR-4,clamp(yr,GT+12*k,GB-6)+(yr>=yc?16*k:-8),{s:13*k,w:700,c:PAL['s2'],a:'right'});
  /* your gut */
  if(G.g){const gx=X(clamp(G.g.g,0,xm)),gl=G.g.g>xm?'Your gut →':'Your gut';ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,GB-20);ctx.lineTo(gx,GB+4);ctx.stroke();
   txt(ctx,gl,clamp(gx,50*k,740),GB-24,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  /* bottles sold */
  const sx=X(p.sold),pf=prof(sim,p.sold);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(sx,GT);ctx.lineTo(sx,GB);ctx.stroke();ctx.setLineDash([]);
  const sideR=sx<GR-170*k,lbl=`Sell ${p.sold}: ${pf>=0?'+':''}${usd0(pf)}`;ctx.font='700 '+(12*k)+'px '+FONT;const lw=ctx.measureText(lbl).width;
  const eqT=atLeast('ap')&&!big?`R − C = ${fm(margin(sim))}n − ${fm(p.F)} = 0  →  n = ${fm(b)}`:'';ctx.font='700 '+(13*k)+'px '+FONT;const ew=eqT?ctx.measureText(eqT).width:0;
  if(eqT)txt(ctx,eqT,GL+12,GT+14*k,{s:13*k,w:700,c:PAL['cv-ink']});
  const px0=sx+(sideR?1:-1)*(lw/2+16*k),hit=eqT&&px0-lw/2-8<GL+12+ew;ctx.font='700 '+(12*k)+'px '+FONT;
  pill(ctx,lbl,px0,GT+14*k+(hit?30*k:0),pf>=0?PAL['s3']:PAL['s1'],'#fff',12*k);
  /* break-even point */
  ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(X(b),Y(Rv(sim,b)),8,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
  const bl=`Break-even: ${fm(b)} bottles, ${usd0(Rv(sim,b))}`;ctx.font='700 '+(12*k)+'px '+FONT;const bw=ctx.measureText(bl).width+16*k;
  pill(ctx,bl,clamp(X(b)-bw/2-12,GL+bw/2+4,GR-bw/2),Y(Rv(sim,b))-22*k,PAL['s3'],'#fff',12*k);
  /* Walkthrough: the substitution step writes the algebra on the graph, at the point it solves for. */
  if(sim.tour&&sim.tour.on&&sim.tst===6){const L=[`C(n) = R(n)`,`${fm(p.F)} + ${fm(p.c)}n = ${fm(p.s)}n`,`${fm(p.F)} = ${fm(margin(sim))}n`,`n = ${fm(b)} bottles`];
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(X(b),Y(Rv(sim,b)));ctx.lineTo(X(b),Y(0));ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'n = '+fm(b),X(b)+6,Y(0)-8,{s:13*k,w:800,c:PAL['rj']});
   ctx.font='700 '+(13*k)+'px '+FONT;const w=Math.max(...L.map(t=>ctx.measureText(t).width))+24,h=L.length*18*k+16,x0=GR-w-12,y0=Y(0)-h-8;
   rr(ctx,x0,y0,w,h,8);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.stroke();
   L.forEach((t,i)=>txt(ctx,t,x0+12,y0+8+15*k+i*18*k,{s:13*k,w:i===3?800:700,c:i===3?PAL['rj']:PAL['cv-ink']}));}
 },
 narrate(sim){const p=sim.p,b=bep(sim),pf=prof(sim,p.sold);
  if(!shown(sim))return `The setup costs ${usd0(p.F)} before you sell a thing. Each bottle costs ${usd(p.c)} and sells for ${usd(p.s)}. <b>How many bottles until the money in catches the money out?</b>`;
  return `Each sale brings in ${usd(p.s)} but costs ${usd(p.c)}, so <b>${usd(margin(sim))} of every sale pays down the ${usd0(p.F)} setup</b>. That takes ${fm(b)} bottles. Selling ${p.sold} ${pf>=0?`makes ${usd(pf)}`:`still loses ${usd(-pf)}`}.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider here to the number of bottles you think the club must sell before it stops losing money. Go by feel, then lock it in.',honors:'Before you show the lines, drag the slider here to your gut break-even point. Then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:miss(sim,g),g,b:bep(sim),nd:need(sim),m:margin(sim),pf:prof(sim,g),label:`${g} bottles`};},
  solve(sim){const n=need(sim);sim.p.show=true;sim.p.guess=n;return {v:miss(sim,n),label:Math.abs(bep(sim)-n)<1e-9?`${n} bottles`:`${n} bottles (break-even at ${fm(bep(sim))})`};},
  how:{bio:'Draw the money out and the money in as two lines. Money out starts at the setup cost; money in starts at zero but climbs faster. Where they cross, the club breaks even.',
   honors:'Solve the system by substitution: set C(n) = R(n), so setup + cost × n = price × n. Collect the n terms and divide.',
   ap:'Elimination: subtract C from R. The setup stays and the n terms combine: (price − cost)n − setup = 0, so n = setup ÷ (price − cost).'},
  compare(sim,g,m){if(g.v<0.005)return `Your gut was right on: ${g.g} bottles. The club breaks even at ${fm(g.b)}, and every bottle after that adds ${usd(g.m)} of profit.`;
   if(g.g<g.b)return `If the club stops at your goal of ${g.g} bottles, it still <b>loses ${usd(-g.pf)}</b>. It has to sell ${g.nd} to stop losing money, ${g.nd-g.g} more than your gut said.`;
   return `Your goal of ${g.g} bottles is safe, but ${g.g-g.nd} too high: by then the club has already made <b>${usd(g.v)} of profit</b>. Knowing the real break-even, ${g.nd} bottles, tells the club when every sale after that is profit.`;},
  again(sim){const pick=a=>a[Math.floor(Math.random()*a.length)];sim.p.F=pick([120,150,180,200,240,300,360]);sim.p.c=pick([3,4,4.5,5,6]);sim.p.s=pick([10,12,13,15,18,20]);sim.p.guess=15;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Setup is $240, each bottle costs $6, and you sell them for $14. What happens if the club sells 20 bottles?',choices:['It makes $40','It loses $80','It breaks even'],correct:1,explain:'Money in: 20 × $14 = $280. Money out: $240 + 20 × $6 = $360. $280 − $360 = −$80. The $40 answer forgets that every bottle costs $6 to make.'},
  {lvl:'bio',instant:true,q:'Same fundraiser, but the club raises the price from $14 to $18. What happens to the break-even point?',choices:['It drops to 20 bottles','It rises to 40 bottles','It stays at 30 bottles'],correct:0,explain:'Each sale now pays down $18 − $6 = $12 of the setup instead of $8, so 240 ÷ 12 = 20 bottles. The revenue line gets steeper and crosses the cost line sooner.'},
  {lvl:'honors',instant:true,q:'Setup $360, cost $5 a bottle, price $13. Solve C(n) = R(n). Where does the club break even?',choices:['45 bottles','72 bottles','28 bottles','20 bottles'],correct:0,explain:'360 + 5n = 13n, so 360 = 8n and n = 45. 72 divides by the cost (360 ÷ 5), 28 divides by the price (360 ÷ 13), and 20 adds them (360 ÷ 18).'},
  {lvl:'honors',instant:true,q:'A member says: “$240 ÷ $14 is about 17, so 17 bottles covers the setup.” What is wrong?',choices:['Nothing: 17 bottles is right','Each bottle also costs $6, so only $8 of each sale pays down the setup: 30 bottles','You should divide by the $6 cost: 40 bottles'],correct:1,explain:'At 17 bottles, money in is $238, but money out is $240 + 17 × $6 = $342. Only the margin, $14 − $6 = $8, pays down the setup, so 240 ÷ 8 = 30.'},
  {lvl:'ap',instant:true,q:'Setup $240, cost $6, price $14. The club wants $200 of profit. How many bottles must it sell?',choices:['30','45','55','25'],correct:2,explain:'Profit = 8n − 240. Set it to 200: 8n = 440, so n = 55. Check: 55 × 14 = $770 in, 240 + 55 × 6 = $570 out, $200 profit.'},
  {lvl:'ap',instant:true,q:'At $14 the club expects to sell 40 bottles; at $18 it expects to sell only 28. Setup $240, cost $6. Which price makes more money?',choices:['$18: $96 profit against $80','$14: it sells 12 more bottles','They make the same'],correct:0,explain:'At $14: 40 × 8 − 240 = $80. At $18: 28 × 12 − 240 = $96. Fewer sales can still win when each one pays down more of the setup.'}
 ],
 tour:[
  {title:'Money out, money in',text:'The printer charges $240 to set up your logo, plus $6 for each bottle. The club sells each bottle for $14. Before you sell anything, the club is already $240 in the hole.',pause:true,setup:sim=>{sim.tst=1;return BioLab.setValues(sim,{show:false,sold:40});}},
  {title:'Two lines',text:'Money out is a line that starts at $240 and climbs $6 a bottle. Money in starts at $0 and climbs $14 a bottle.',pause:true,setup:sim=>{sim.tst=2;return BioLab.setValues(sim,{show:true});},focus:sim=>sim.vis.plot},
  {title:'Loss, then profit',text:'Money in climbs faster, so it catches up. To the left of the crossing the club is losing money (red). To the right it is making money (green).',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'The break-even point',text:'The lines cross at 30 bottles. There the club has taken in 30 × $14 = $420 and spent $240 + 30 × $6 = $420. Not a dollar lost, not a dollar made.',pause:true,focus:sim=>sim.vis.be,setup:sim=>{sim.tst=4;}},
  {title:'Every bottle after that',text:'Each bottle past 30 adds $14 − $6 = $8 of profit. Sell 40 and the club makes $80. Sell only 20 and it loses $80.',pause:true,setup:sim=>{sim.tst=5;return BioLab.setValues(sim,{sold:40});}},
  {lvl:'honors',title:'Substitution',text:'Break-even means C(n) = R(n). Substitute: 240 + 6n = 14n. Subtract 6n: 240 = 8n. Divide: n = 30 bottles.',pause:true,setup:sim=>{sim.tst=6;}},
  {lvl:'ap',title:'Elimination and a profit goal',text:'Subtract the cost equation from the revenue equation: R − C = 14n − 6n − 240 = 8n − 240. Set it to 0 for break-even (n = 30), or to $200 for a profit goal: 8n = 440, n = 55.',pause:true,setup:sim=>{sim.tst=7;return BioLab.setValues(sim,{sold:55});}}
 ],
 lab:{bio:'<p><b>Question:</b> How does the price change the break-even point?</p><ol><li>Show the lines. Record the break-even for prices of $10, $12, $14, $18 and $24.</li><li>Graph Trials with price on x and bottles to break even on y.</li></ol><p>Write one sentence: why does a small price change matter so much near $6?</p>',
  honors:'<p><b>Question:</b> Which matters more, the setup cost or the cost per bottle?</p><ol><li>Double the setup cost and record the break-even point.</li><li>Reset it, then raise the cost per bottle by $2 and record it again.</li></ol><p>Explain both changes using the slopes and intercepts of the two lines.</p>',
  ap:'<p><b>Question:</b> How many bottles reach a profit goal?</p><ol><li>Write R − C as a single linear expression.</li><li>Solve it for three profit goals and check each against <b>Bottles to reach your profit goal</b>.</li></ol><p><b>CER:</b> Claim, evidence from your trials, and reasoning from elimination.</p>'},
 terms:[
  {t:'Fixed cost',d:'A cost you pay once no matter how many you sell, like the $240 setup.'},
  {t:'Variable cost',d:'A cost for each item, like $6 a bottle.'},
  {t:'Revenue',d:'All the money that comes in from sales: price × number sold.'},
  {t:'Break-even point',d:'Where revenue equals cost, so profit is $0. On the graph it is where the two lines cross.'},
  {t:'System of equations',d:'Two or more equations that share variables. Its solution makes all of them true at once.',lvl:'honors'},
  {t:'Substitution',d:'Solving a system by replacing one expression with an equal one, like putting 14n in for C.',lvl:'honors'},
  {t:'Elimination',d:'Solving a system by adding or subtracting the equations so one variable cancels.',lvl:'ap'}
 ],
 about:'<p>Cost C(n) = F + c·n and revenue R(n) = s·n, for a setup cost F, a cost c per bottle and a price s. Profit is R − C = (s − c)n − F, and break-even is n = F ÷ (s − c), rounded up to whole bottles.</p><p>The gut score is in dollars: a goal short of break-even is scored by the loss still left, and a goal past it by the profit the club would already have made before reaching your goal. The prices are made up for illustration. A real fundraiser also has unsold leftovers, sales tax rules and school policies. This is a simplified model, not financial advice.</p>'
};
BioLab.register(SIM);
})();
