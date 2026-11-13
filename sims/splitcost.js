(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,bars,atLeast,fmtNum}=BioLab.h;
const SC={cabin:{F:1200,v:35,T:150,what:'cabin rental',per:'food',unit:'people',name:'Cabin weekend'},
 bus:{F:2400,v:20,T:70,what:'charter bus',per:'event ticket',unit:'riders',name:'Charter bus'},
 shirts:{F:150,v:8,T:12,what:'screen setup fee',per:'blank shirt and ink',unit:'shirts',name:'Club T-shirts'}};
/* Cost per person C(n) = (F + v·n)/n = v + F/n: a rational function with asymptotes n = 0 and C = v. */
const cost=(sim,n)=>sim.p.v+sim.p.F/n;
const nstar=sim=>sim.p.T>sim.p.v?Math.max(1,Math.ceil(sim.p.F/(sim.p.T-sim.p.v)-1e-9)):null;
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
const usd=v=>'$'+(Math.abs(v-Math.round(v))<0.005?Math.round(v).toLocaleString('en-US'):v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}));
const U=sim=>SC[sim.p.scen].unit;
function htxt(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s*0.85,w+6,o.s*1.1);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}

const SIM={
 id:'splitcost',hash:'splitcost',apUnit:5,order:1,tab:'Splitting a group cost',kind:'Simulation',
 card:'Guess how many people it takes to get a shared trip under budget, then solve the rational equation and see why extra people stop helping.',
 title:'How many people to split the cost?',
 lede:{bio:'Some costs are shared, like a cabin or a bus, and some are paid by each person, like food or tickets. Adding people shrinks everyone’s share of the big cost, but each new person helps a little less than the one before.',
  honors:'Cost per person is C(n) = (F + v·n)/n = v + F/n, a rational function. It has a vertical asymptote at n = 0 and a horizontal asymptote at C = v: no group is big enough to get below the per-person cost.',
  ap:'To hit a target T, solve (F + v·n)/n = T: n = F/(T − v), then round up. The savings from one more person, F/(n(n + 1)), shrink roughly like 1/n².'},
 scale:{bio:'Costs in dollars. The group splits the shared cost evenly, and each person also pays their own cost.',honors:'Costs in dollars. The shared cost F is split evenly; each person also pays their own cost v.'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The plan',
 controls:[
  {id:'scen',label:'What you are splitting',type:'seg',def:'cabin',noGut:true,options:[{v:'cabin',l:'Cabin'},{v:'bus',l:'Bus'},{v:'shirts',l:'T-shirts'}],
   onChange(sim){const s=SC[sim.p.scen];BioLab.setValues(sim,{F:s.F,v:s.v,T:s.T});}},
  {id:'n',label:'Your guess: group size',type:'range',min:1,max:80,step:1,def:4,unit:''},
  {id:'T',label:'Target: most each person should pay ($)',type:'range',min:5,max:300,step:1,def:150,unit:'',noGut:true},
  {id:'F',label:'Shared cost F ($)',type:'range',min:100,max:3000,step:50,def:1200,unit:'',lvl:'honors',noGut:true},
  {id:'v',label:'Each person’s own cost v ($)',type:'range',min:0,max:60,step:1,def:35,unit:'',lvl:'honors',noGut:true}
 ],
 actions:[{id:'show',label:'Skip the guess and show the costs',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'each',label:'Cost per person with this group',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?cost(sim,sim.p.n):null},
  {id:'nstar',label:'Smallest group that hits the target',unit:'',d:0,min:0,max:null,get:sim=>shown(sim)?nstar(sim):null},
  {id:'floor',label:'Lowest it can ever go',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:sim=>sim.p.v},
  {id:'dbl',label:'Saving each if the group doubles',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?cost(sim,sim.p.n)-cost(sim,2*sim.p.n):null}
 ],
 graphs:[{id:'next',label:'What each extra person saves everyone',custom:true}],defaultGraph:'next',
 plot(sim,ctx,box){if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const N=12,vals=[];for(let n=2;n<=N+1;n++)vals.push(cost(sim,n-1)-cost(sim,n));
  const ax=axes(ctx,box,{xmin:0,xmax:N,ymin:0,ymax:vals[0]*1.15,xl:'The person who joins (2nd, 3rd, …)',yl:'Saved per person ($)',xcats:vals.map((_,i)=>String(i+2))});
  bars(ctx,ax,vals,{colors:[PAL['s2']],d:vals[0]>=100?0:2,labels:true});},
 draw(sim,ctx,vdt,k){const stg=(sim.tour&&sim.tour.on)?(sim.tst||1):99,sh=shown(sim),G=sim.gutS,s=SC[sim.p.scen],n=sim.p.n,ns=nstar(sim),v=sim.p.v,T=sim.p.T,F=sim.p.F;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* people band */
  const shownN=Math.min(n,80),iw=Math.min(22,(760)/Math.max(shownN,1)),ok=sh&&cost(sim,n)<=T+1e-9;
  if(stg>=2){txt(ctx,n+' '+(n===1?U(sim).replace(/s$/,''):U(sim))+(sh?' · '+usd(cost(sim,n))+' each':' · ? each'),20,26*k,{s:14*k,w:700,c:ok?PAL['s3']:PAL['cv-ink']});
  for(let i=0;i<shownN;i++){const x=20+i*iw+iw/2,r=Math.max(3,iw*0.32);ctx.fillStyle=sh?(ok?PAL['s3']:PAL['s1']):PAL['cv-soft'];ctx.beginPath();ctx.arc(x,44*k,r,0,7);ctx.fill();ctx.beginPath();ctx.arc(x,44*k+r*2.4,r*1.3,Math.PI,0);ctx.fill();}}
  /* plot */
  const L0=Math.round(40+34*k),R0=780,T0=Math.round(64*k+40),B0=416-12*k;
  const xmax=Math.max(20,Math.ceil(Math.max(ns||0,n,G&&G.g?G.g.n:0)*1.6/10)*10),ymax=Math.max(T*2,v*2.2,20);
  const X=q=>L0+q/xmax*(R0-L0),Y=c=>B0-clamp(c,0,ymax)/ymax*(B0-T0);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const xs=xmax>60?20:xmax>30?10:5;
  for(let q=0;q<=xmax;q+=xs){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(X(q),T0);ctx.lineTo(X(q),B0);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(q),X(q),B0+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  const ystep=[5,10,20,25,50,100,200,500].find(c=>(B0-T0)*c/ymax>=24*k)||500;for(let c=0;c<=ymax+1e-9;c+=ystep){ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(L0,Y(c));ctx.lineTo(R0,Y(c));ctx.stroke();ctx.globalAlpha=1;txt(ctx,'$'+c,L0-6,Y(c)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'Cost per person vs. group size',L0,T0-10,{s:12*k,w:700,c:PAL['cv-soft']});
  /* target */
  ctx.strokeStyle=PAL['s3'];ctx.lineWidth=stg===1?4:2;ctx.setLineDash([8,5]);ctx.beginPath();ctx.moveTo(L0,Y(T));ctx.lineTo(R0,Y(T));ctx.stroke();ctx.setLineDash([]);
  htxt(ctx,'Target: '+usd(T),R0-4,Y(T)-6,{s:12*k,w:700,c:PAL['s3'],a:'right'});
  if(stg===2){const c=cost(sim,n);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(n),Y(c),7,0,7);ctx.fill();htxt(ctx,usd(F)+' ÷ '+n+' + '+usd(v)+' = '+usd(c)+' each',X(n)+14,Y(c)+5,{s:14*k,w:700,c:PAL['rj']});}
  if(sh&&stg>=3){/* asymptotes */
   if(stg>=5){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=stg===5?3:1.5;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(L0,Y(v));ctx.lineTo(R0,Y(v));ctx.stroke();ctx.setLineDash([]);
   htxt(ctx,(atLeast('honors')?'Horizontal asymptote: ':'Never below ')+usd(v)+' each',R0-4,Y(v)+16*k,{s:stg===5?14*k:12*k,w:700,c:PAL['s5'],a:'right'});}
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();let st=false;for(let q=0.3;q<=xmax;q+=0.1){const c=cost(sim,q);if(c>ymax*1.02){st=false;continue;}const x=X(q),y=Y(c);st?ctx.lineTo(x,y):ctx.moveTo(x,y);st=true;}ctx.stroke();
   for(let q=1;q<=xmax;q++){const c=cost(sim,q);if(c<=ymax){ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(X(q),Y(c),xmax>40?1.8:2.6,0,7);ctx.fill();}}
   if(ns&&ns<=xmax){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(X(ns),Y(cost(sim,ns)),7,0,7);ctx.fill();pill(ctx,ns+' '+U(sim)+': '+usd(cost(sim,ns)),clamp(X(ns)+70*k,L0+80*k,R0-80*k),Y(cost(sim,ns))-22*k,PAL['s3'],'#fff',12*Math.min(k,1.5));}
   if(stg===3&&ns){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(X(ns),Y(cost(sim,ns)),13,0,7);ctx.stroke();htxt(ctx,'35 + 1200/n = 150  →  n ≈ 10.4  →  round up to 11',L0+20,T0+44*k,{s:14*k,w:700,c:PAL['s3']});}
   if(stg===4){[[5,6],[11,12]].forEach(([a,b])=>{const ya=Y(cost(sim,a)),yb=Y(cost(sim,b)),xb=X(b);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(xb,ya);ctx.lineTo(xb,yb);ctx.stroke();ctx.beginPath();ctx.moveTo(X(a),ya);ctx.lineTo(xb,ya);ctx.stroke();htxt(ctx,(b===6?'The 6th person saves everyone ':'The 12th saves only ')+usd(cost(sim,a)-cost(sim,b)),xb+10,b===6?(ya+yb)/2+5:yb+30*k,{s:14*k,w:700,c:PAL['s4']});});}
   if(stg===6){const bx=L0+180,by=T0+20;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.94;ctx.fillRect(bx,by,330,86);ctx.globalAlpha=1;ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.strokeRect(bx,by,330,86);txt(ctx,'C(n) = v + F/n',bx+14,by+30,{s:15*k,w:700,c:PAL['s2']});txt(ctx,'C(n) = T  →  n = F/(T − v)',bx+14,by+62,{s:15*k,w:700,c:PAL['s2']});}}
  else if(!sh)txt(ctx,'?',X(xmax*0.3),Y(T*1.5),{s:34*k,w:700,c:PAL['rj']});
  /* gut */
  if(stg<99)return;
  const gn=G&&G.g?G.g.n:n,gx=X(gn);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(gx,T0);ctx.lineTo(gx,B0);ctx.stroke();ctx.setLineDash([]);
  htxt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+gn,gx+(gx>R0-120?-6:6),T0+16*k,{s:12*k,w:700,c:PAL['s4'],a:gx>R0-120?'right':'left'});},
 narrate(sim){const s=SC[sim.p.scen],v=sim.p.v,T=sim.p.T,F=sim.p.F,n=sim.p.n;
  if(T<=v)return `Your target of ${usd(T)} is at or below the ${usd(v)} each person pays on their own. <b>No group is big enough</b>: the cost per person only approaches ${usd(v)}.`;
  if(!shown(sim))return `Everyone pays their own ${usd(v)}, and the group splits the ${usd(F)} shared cost. <b>How big must the group be</b> for each share to be ${usd(T)} or less? Lock in your guess.`;
  const c=cost(sim,n);return `With ${n}, each pays ${usd(v)} + ${usd(F)} ÷ ${n} = <b>${usd(c)}</b>. ${c<=T?'That meets the target.':'That is over the target.'} One more person would save each of you only ${usd(c-cost(sim,n+1))}.`;},
 gut:{better:'lower',
  controls:['n'],
  ask:{bio:'Drag the slider here to the smallest group you think gets each person’s cost down to the target, the green dashed line. Go by feel, then lock it in.',honors:'Before you look at the curve: what is the smallest group that meets the target? Drag the slider here to your guess, then lock it in.'},
  lock(sim){const ns=nstar(sim),n=sim.p.n;return {v:ns?Math.abs(n-ns):0,n,label:n+' '+U(sim)};},
  solve(sim){const ns=nstar(sim);if(ns)sim.p.n=ns;return {v:0,n:sim.p.n,label:ns?ns+' '+U(sim)+', at '+usd(cost(sim,ns))+' each':'no group size is enough'};},
  how:{bio:'The math sets the cost per person equal to the target and solves for the group size: shared cost ÷ (target − own cost). Then it rounds up, because you cannot bring part of a person.',
   honors:'Solve v + F/n = T: F/n = T − v, so n = F/(T − v), rounded up. As n grows, F/n heads to 0 and the cost heads to the asymptote v.',
   ap:'n* = ⌈F/(T − v)⌉. One more person saves everyone F/n − F/(n + 1) = F/(n(n + 1)), which shrinks fast: diminishing returns.'},
  compare(sim,g,m){const ns=nstar(sim),cg=cost(sim,g.n),cm=cost(sim,ns||1),u=U(sim);
   if(!ns)return 'No group size reaches this target, because it is at or below the cost each person pays on their own. Raise the target.';
   if(g.n===ns)return `Your gut was right on: ${ns} ${u}, at ${usd(cm)} each. You already sense how a shared cost spreads out; the math shows exactly where it crosses the target.`;
   if(g.n<ns)return `With your ${g.n}, each pays <b>${usd(cg)}</b>, ${usd(cg-sim.p.T)} over the target. You need <b>${ns}</b>: then each pays ${usd(cm)}.`;
   return `You only need <b>${ns}</b> ${u}, at ${usd(cm)} each. Your ${g.n} bring it to ${usd(cg)}, but the last ${g.n-ns} ${g.n-ns===1?'person':'people'} only save each of you <b>${usd(cm-cg)}</b> more. That is diminishing returns: the cost can never drop below ${usd(sim.p.v)}.`;},
  again(sim){sim.peek=false;const keys=Object.keys(SC),key=keys[Math.floor(Math.random()*3)],s=SC[key];sim.p.scen=key;sim.p.F=s.F;sim.p.v=s.v;
   sim.p.T=Math.round(s.v+s.F/(5+Math.random()*40));if(sim.p.T<=s.v)sim.p.T=s.v+1;sim.p.n=2;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'A cabin costs $1,200 for the weekend, split evenly, and each person also pays $35 for food. With 8 people, what does each person pay?',choices:['$150','$185','$1,235'],correct:1,explain:'Each share of the cabin is $1,200 ÷ 8 = $150. Add $35 for food: $185 each.'},
  {lvl:'bio',instant:true,q:'Same cabin. Could a big enough group get everyone down to $30 each?',choices:['Yes, with about 40 people','Yes, with about 120 people','No, never'],correct:2,explain:'Each person still pays $35 for food, no matter how many share the cabin. The cost per person gets closer and closer to $35 but never below it.'},
  {lvl:'honors',instant:true,q:'What is the horizontal asymptote of C(n) = (1200 + 35n)/n?',choices:['C = 0','C = 35','C = 1200','There is none'],correct:1,explain:'C(n) = 35 + 1200/n. As n grows, 1200/n heads to 0, so C(n) heads to 35. The vertical asymptote is n = 0.'},
  {lvl:'honors',instant:true,q:'Cabin again ($1,200 shared, $35 each). Growing from 10 to 20 people saves each person $60. How much does growing from 20 to 40 save each person?',choices:['$60 again','$30','$120'],correct:1,explain:'C(10) = $155, C(20) = $95, C(40) = $65. Doubling the group again saves only $30: each doubling halves the shared part, so the savings keep shrinking.'},
  {lvl:'ap',instant:true,q:'A charter bus costs $2,400 and each rider’s ticket is $20. Solve (2400 + 20n)/n = 60 for the group size.',choices:['40','48','60','120'],correct:2,explain:'2400 + 20n = 60n, so 2400 = 40n and n = 60. Check: $2,400 ÷ 60 = $40, plus $20 = $60.'},
  {lvl:'ap',instant:true,q:'A business pays $5,000 to set up a product run, then $2 per unit. How many units must it make for the average cost to be $2.50 or less?',choices:['2,000','2,500','10,000','No number works'],correct:2,explain:'2 + 5000/n ≤ 2.50 means 5000/n ≤ 0.50, so n ≥ 10,000. Average cost can never fall below $2, the cost of one more unit.'}
 ],
 tour:[
  {title:'The trip',text:'A cabin costs $1,200 for the weekend. The group splits it evenly, and each person also pays $35 for food. The goal: $150 or less each.',pause:true,setup:sim=>{sim.tst=1;sim.peek=true;BioLab.setValues(sim,{scen:'cabin',n:4});}},
  {title:'A small group',text:'With 4 people, each pays $1,200 ÷ 4 = $300 for the cabin, plus $35: $335 each. Far over the target.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Solve for the group',text:'Set 35 + 1200/n = 150. Then 1200/n = 115 and n = 1200 ÷ 115 ≈ 10.4. You cannot bring 0.4 of a person, so round up: 11 people, at $144.09 each.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{n:11});}},
  {title:'Diminishing returns',text:'Going from 5 people to 6 saves everyone $40. Going from 11 to 12 saves only $9.09. Each new person helps less, and the bars in the graph below shrink fast.',pause:true,setup:sim=>{sim.tst=4;}},
  {title:'The floor',text:'Even with 20 people, each pays $95. The cost per person gets closer to $35, the food cost, but never reaches it. That line is the horizontal asymptote.',pause:true,setup:sim=>{sim.tst=5;BioLab.setValues(sim,{n:20});}},
  {lvl:'ap',title:'The algebra',text:'C(n) = (F + v·n)/n = v + F/n. Solving C(n) = T gives n = F/(T − v). If T ≤ v, there is no solution: the target is at or below the asymptote.',pause:true,setup:sim=>{sim.tst=6;}}
 ],
 lab:{bio:'<p><b>Question:</b> Does each new person save as much as the one before?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Set the group to 2, 4, 6, 8, 10, 15 and 20. Record a trial each time.</li><li>Graph <b>Trials</b> with group size on x and cost per person on y.</li></ol><p>Write one sentence about the shape of the graph.</p>',
  honors:'<p><b>Question:</b> How do the shared cost and the own cost shape the curve?</p><ol><li>Double the shared cost F and record how the group size needed changes.</li><li>Then raise the own cost v toward the target and record it again.</li></ol><p>Explain with n = F/(T − v) why the group size explodes as the target gets close to v.</p>',
  ap:'<p><b>Question:</b> How fast do the savings from one more person shrink?</p><ol><li>Show that C(n) − C(n + 1) = F/(n(n + 1)).</li><li>Check it for n = 5, 10 and 20 with the tool.</li></ol><p><b>CER:</b> Explain why a business’s average cost per unit approaches the cost of one more unit.</p>'},
 terms:[
  {t:'Fixed (shared) cost',d:'A cost that stays the same no matter how many people share it, like the cabin rental.'},
  {t:'Per-person cost',d:'A cost each person pays on their own, like food or a ticket.'},
  {t:'Rational function',d:'A function that is one polynomial divided by another, like C(n) = (F + v·n)/n.',lvl:'honors'},
  {t:'Asymptote',d:'A line a graph gets closer and closer to. Here: n = 0 (vertical) and C = v (horizontal).',lvl:'honors'},
  {t:'Diminishing returns',d:'Each extra unit of effort adds less benefit than the one before. Here, each new person saves everyone less.',lvl:'ap'}
 ],
 about:'<p>Cost per person is C(n) = (F + v·n)/n = v + F/n for a shared cost F and a per-person cost v. The smallest group that meets a target T is n = F/(T − v), rounded up. The three scenarios use example prices for illustration, not real quotes: a $1,200 cabin with $35 of food each, a $2,400 charter bus with $20 tickets, and a $150 screen-printing setup fee with $8 per shirt.</p><p>Real trips have extras this model leaves out: a cabin or bus has a maximum capacity, prices change with group size, and not every cost splits evenly.</p>'
};
BioLab.register(SIM);
})();
