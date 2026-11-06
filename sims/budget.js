(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const usd0=v=>(v<-0.004?'−':'')+'$'+Math.abs(Math.round(v*100)/100).toLocaleString('en-US',{maximumFractionDigits:2});
const fm1=v=>(Math.round(v*10)/10).toLocaleString('en-US',{maximumFractionDigits:1});
const PF=4,WF=5,PMAX=15,WMAX=12;                         /* a pizza feeds 4, a tray of wings feeds 5 */
const cost=(sim,p,w)=>sim.p.pp*p+sim.p.wp*w, fed=(p,w)=>PF*p+WF*w;
const fits=(sim,p,w)=>cost(sim,p,w)<=sim.p.B+1e-9&&p+w<=sim.p.L;
const cheapMode=sim=>sim.p.goal==='cheap';
/* Score in real terms. Most food: people fed (0 if the shop will not take the order).
   Cheapest: dollars left from the budget, if the order fits and feeds everyone (else 0). */
function score(sim,p,w){if(!fits(sim,p,w))return 0;if(cheapMode(sim))return fed(p,w)>=sim.p.N?sim.p.B-cost(sim,p,w):0;return fed(p,w);}
/* The math: check every whole-number order and keep the best (ties: cheaper, then more food). */
function bestOrder(sim){let b=null;for(let p=0;p<=PMAX;p++)for(let w=0;w<=WMAX;w++){const s=score(sim,p,w),c=cost(sim,p,w),f=fed(p,w);
  if(!b||s>b.s+1e-9||(Math.abs(s-b.s)<1e-9&&(c<b.c-1e-9||(Math.abs(c-b.c)<1e-9&&f>b.f))))b={p,w,s,c,f};}
 if(b.s<=0&&!fits(sim,b.p,b.w))b={p:0,w:0,s:0,c:0,f:0};return b;}
/* Feasible region: clip the plot rectangle by each half-plane a·p + b·w ≤ c. */
function halfPlanes(sim){return [[sim.p.pp,sim.p.wp,sim.p.B],[1,1,sim.p.L],[-PF,-WF,-sim.p.N]];}
function clip(poly,[a,b,c]){const out=[],inside=q=>a*q[0]+b*q[1]<=c+1e-9;for(let i=0;i<poly.length;i++){const P=poly[i],Q=poly[(i+1)%poly.length],ip=inside(P),iq=inside(Q);
  if(ip)out.push(P);if(ip!==iq){const t=(c-a*P[0]-b*P[1])/(a*(Q[0]-P[0])+b*(Q[1]-P[1]));out.push([P[0]+t*(Q[0]-P[0]),P[1]+t*(Q[1]-P[1])]);}}return out;}
function region(sim){let poly=[[0,0],[PMAX,0],[PMAX,WMAX],[0,WMAX]];halfPlanes(sim).forEach(h=>{if(poly.length)poly=clip(poly,h);});
 const out=[];poly.forEach(q=>{if(!out.some(r=>Math.hypot(r[0]-q[0],r[1]-q[1])<1e-6))out.push(q);});return out;}
const shown=sim=>!!sim.p.show;
function why(sim,p,w){const r=[],c=cost(sim,p,w);if(c>sim.p.B+1e-9)r.push(`costs ${usd0(c)}, ${usd0(c-sim.p.B)} over the budget`);if(p+w>sim.p.L)r.push(`needs ${p+w} boxes, ${p+w-sim.p.L} more than the shop delivers`);
 if(cheapMode(sim)&&fed(p,w)<sim.p.N)r.push(`feeds only ${fed(p,w)} of ${sim.p.N} people`);return r;}
const order=(p,w)=>`${p} pizza${p===1?'':'s'} + ${w} tray${w===1?'':'s'}`;

const SIM={
 id:'budget',hash:'budget',apUnit:2,order:3,tab:'Team dinner on a budget',kind:'Simulation',
 card:'Order pizzas and wings for the team by feel, then let a feasible region find the order that feeds the most people.',
 title:'Feed the team on a budget',
 lede:{bio:'Every limit you have, money, boxes, enough food, cuts the list of possible orders down. What is left is a shape on a graph, and the best order sits at one of its corners.',
  honors:'Each limit is a linear inequality in p (pizzas) and w (wing trays). The orders that satisfy all of them form the feasible region, and a linear goal like 4p + 5w is always largest at a corner.',
  ap:'This is linear programming. The corners come from solving pairs of boundary equations as systems. When a corner is not a whole number, the best real order is a nearby whole-number point inside the region, not the rounded corner.'},
 scale:'Each dot is one possible order. A large pizza feeds 4 people and a tray of wings feeds 5. Prices are made up.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The order',
 controls:[
  {id:'p',label:'Pizzas (p)',type:'range',min:0,max:PMAX,step:1,def:6,unit:''},
  {id:'w',label:'Trays of wings (w)',type:'range',min:0,max:WMAX,step:1,def:2,unit:''},
  {id:'show',label:'Show the math’s best order',type:'toggle',def:false,help:'Lock in your gut first.'},
  {id:'B',label:'Budget ($)',type:'range',min:60,max:300,step:10,def:150,unit:'',d:0,noGut:true},
  {id:'N',label:'People to feed',type:'range',min:10,max:60,step:1,def:30,unit:'',noGut:true},
  {id:'L',label:'Most boxes the shop delivers',type:'range',min:4,max:20,step:1,def:10,unit:'',lvl:'honors',noGut:true},
  {id:'pp',label:'Price of a pizza ($)',type:'range',min:8,max:24,step:1,def:12,unit:'',d:0,lvl:'honors',noGut:true},
  {id:'wp',label:'Price of a tray of wings ($)',type:'range',min:8,max:30,step:1,def:18,unit:'',d:0,lvl:'honors',noGut:true},
  {id:'goal',label:'Goal',type:'seg',def:'most',lvl:'ap',noGut:true,options:[{v:'most',l:'Feed the most people'},{v:'cheap',l:'Feed everyone for less'}]}
 ],
 init(){return {};},step(){},
 onLevel(sim){const h=atLeast('honors');[['p','Pizzas','Pizzas (p)'],['w','Trays of wings','Trays of wings (w)']].forEach(([id,a,b])=>{const w=sim.ui.ctlW&&sim.ui.ctlW[id];const L=w&&w.querySelector('.lbl,label');if(L)L.textContent='Your order: '+(h?b:a).toLowerCase();});},
 metrics:[
  {id:'cost',label:'Your order costs',unit:'dollars',d:0,min:0,max:null,get:sim=>cost(sim,sim.p.p,sim.p.w)},
  {id:'boxes',label:'Boxes',unit:'boxes',d:0,min:0,max:null,get:sim=>sim.p.p+sim.p.w},
  {id:'fed',label:'Your order feeds',unit:'people',d:0,min:0,max:null,get:sim=>fed(sim.p.p,sim.p.w)},
  {id:'best',label:'The math’s order feeds',unit:'people',d:0,min:0,max:null,get:sim=>shown(sim)?bestOrder(sim).f:NaN},
  {id:'bestCost',label:'The math’s order costs',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?bestOrder(sim).c:NaN},
  {id:'bestP',label:'Pizzas in the math’s order',unit:'pizzas',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?bestOrder(sim).p:NaN}
 ],
 graphs:[{id:'byp',label:'Most people fed for each number of pizzas',custom:true}],defaultGraph:'byp',
 plot(sim,ctx,box){const vals=[];for(let p=0;p<=PMAX;p++){let b=-1;for(let w=0;w<=WMAX;w++)if(fits(sim,p,w))b=Math.max(b,fed(p,w));vals.push(b);}
  const top=Math.max(10,Math.ceil(Math.max(...vals)/10)*10);
  const ax=axes(ctx,box,{xmin:-0.5,xmax:PMAX+0.5,ymin:0,ymax:top,xl:'Pizzas (best number of wing trays with them)',yl:'People fed',xd:0});
  vals.forEach((v,p)=>{if(v<0)return;const x0=ax.X(p-0.3),x1=ax.X(p+0.3);ctx.fillStyle=p===sim.p.p?PAL['rj']:PAL['g-line'];ctx.globalAlpha=p===sim.p.p?1:.55;ctx.fillRect(x0,ax.Y(v),x1-x0,ax.Y(0)-ax.Y(v));ctx.globalAlpha=1;});
  if(!cheapMode(sim)){ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['s2'];ctx.beginPath();ctx.moveTo(ax.X(-0.5),ax.Y(sim.p.N));ctx.lineTo(ax.X(PMAX+0.5),ax.Y(sim.p.N));ctx.stroke();ctx.setLineDash([]);txt(ctx,`${sim.p.N} people`,box.L+box.W-6,ax.Y(sim.p.N)-6,{s:12,c:PAL['s2'],a:'right'});}
  txt(ctx,'Bars stop where no order with that many pizzas fits',box.L+8,box.T+14,{s:12,c:PAL['cv-soft']});},
 draw(sim,ctx,vdt,k0){const k=Math.max(k0,1.45),P=sim.p,G=sim.gutS||{},sh=shown(sim),big=k>=1.6;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const GL=Math.round(28+16*k),GR=500,GT=16,GB=Math.round(450-14-16*k),X=v=>GL+(GR-GL)*v/PMAX,Y=v=>GB-(GB-GT)*v/WMAX;
  /* lattice of whole-number orders */
  for(let p=0;p<=PMAX;p++)for(let w=0;w<=WMAX;w++){const ok=fits(sim,p,w)&&fed(p,w)>=P.N;ctx.fillStyle=ok?PAL['s3']:PAL['cv-soft'];ctx.globalAlpha=ok?.7:.3;ctx.beginPath();ctx.arc(X(p),Y(w),ok?3:2.2,0,7);ctx.fill();}ctx.globalAlpha=1;
  /* feasible region */
  const R=region(sim);sim.vis.region=[GL-6,GT-6,GR-GL+12,GB-GT+12];
  if(R.length>2){ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.16;ctx.beginPath();R.forEach((q,i)=>i?ctx.lineTo(X(q[0]),Y(q[1])):ctx.moveTo(X(q[0]),Y(q[1])));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2;ctx.stroke();}
  /* axes */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(GL,GT);ctx.lineTo(GL,GB);ctx.lineTo(GR,GB);ctx.stroke();
  for(let p=0;p<=PMAX;p+=big?5:3)txt(ctx,String(p),X(p),GB+6+12*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  for(let w=0;w<=WMAX;w+=big?4:3)txt(ctx,String(w),GL-6,Y(w),{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});
  txt(ctx,'Pizzas →',GR,GB-6,{s:12*k,w:700,c:PAL['cv-soft'],a:'right'});txt(ctx,'↑ Wing trays',GL+6,GT+12*k,{s:12*k,w:700,c:PAL['cv-soft']});
  /* boundary lines, each labeled where it leaves the plot */
  const bl=(a,b,c,col,lab,dash,t0)=>{const pts=[];[[0,null],[PMAX,null],[null,0],[null,WMAX]].forEach(([p,w])=>{if(p!==null&&Math.abs(b)>1e-9){const ww=(c-a*p)/b;if(ww>=-1e-9&&ww<=WMAX+1e-9)pts.push([p,ww]);}
    if(w!==null&&Math.abs(a)>1e-9){const pp=(c-b*w)/a;if(pp>=-1e-9&&pp<=PMAX+1e-9)pts.push([pp,w]);}});
   if(pts.length<2)return;pts.sort((u,v)=>u[0]-v[0]);const A=pts[0],Z=pts[pts.length-1];ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[7,5]:[]);ctx.beginPath();ctx.moveTo(X(A[0]),Y(A[1]));ctx.lineTo(X(Z[0]),Y(Z[1]));ctx.stroke();ctx.setLineDash([]);
   const t=t0,lx=X(A[0]+(Z[0]-A[0])*t),ly=Y(A[1]+(Z[1]-A[1])*t);ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(lab).width;const x=clamp(lx+6,GL+4,GR-w-4),y=clamp(ly-8,GT+14*k,GB-8);
   ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x-3,y-12*k,w+6,15*k);ctx.globalAlpha=1;txt(ctx,lab,x,y,{s:12*k,w:700,c:col});};
  bl(P.pp,P.wp,P.B,PAL['s1'],`$${P.B} budget`,false,0.12);
  if(atLeast('honors')||P.L<PMAX+WMAX)bl(1,1,P.L,PAL['s5'],`${P.L} boxes`,false,0.82);
  bl(PF,WF,P.N,PAL['s2'],`Feeds ${P.N}`,true,0.45);
  /* corners, objective line and the math's order */
  const B0=sh?bestOrder(sim):null;
  if(sh&&atLeast('honors')&&!cheapMode(sim)&&B0.f>0){const c=B0.f;ctx.strokeStyle=PAL['g-line'];ctx.globalAlpha=.6;ctx.lineWidth=1.5;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X(0),Y(c/WF));ctx.lineTo(X(Math.min(PMAX,c/PF)),Y(Math.max(0,(c-PF*PMAX)/WF)));ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;}
  if(sh&&atLeast('ap')&&R.length>2){const cx=R.reduce((s,q)=>s+q[0],0)/R.length,cy=R.reduce((s,q)=>s+q[1],0)/R.length,placed=[[GR-90*k,GB-26*k,90*k,22*k],[GL,GT,120*k,18*k]];
   const hit=(a)=>placed.some(b=>a[0]<b[0]+b[2]&&b[0]<a[0]+a[2]&&a[1]<b[1]+b[3]&&b[1]<a[1]+a[3]);
   R.forEach(q=>{ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(X(q[0]),Y(q[1]),4,0,7);ctx.fill();});
   R.forEach(q=>{const vx=X(q[0]),vy=Y(q[1]),dx=vx-X(cx),dy=vy-Y(cy),d=Math.hypot(dx,dy)||1,lab=`(${fm1(q[0])}, ${fm1(q[1])}): ${fm1(cheapMode(sim)?cost(sim,q[0],q[1]):fed(q[0],q[1]))}`;
    ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(lab).width+8,h=16*k;
    const cands=[[vx+dx/d*22-w/2,vy+dy/d*22-h/2],[vx+8,vy-h-4],[vx+8,vy+6],[vx-w-8,vy-h-4],[vx-w-8,vy+6],[vx+dx/d*46-w/2,vy+dy/d*46-h/2]];
    for(const [x0,y0] of cands){const r=[clamp(x0,GL+2,GR-w),clamp(y0,GT,GB-h-2),w,h];if(!hit(r)){placed.push(r);ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(r[0],r[1],w,h);ctx.globalAlpha=1;txt(ctx,lab,r[0]+4,r[1]+h/2+1,{s:12*k,w:700,c:PAL['cv-ink'],b:'middle'});break;}}});}
  const mark=(p,w,col,ring)=>{ctx.beginPath();ctx.arc(X(p),Y(w),ring?11:8,0,7);if(ring){ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke();}else{ctx.fillStyle=col;ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();}};
  if(B0)mark(B0.p,B0.w,PAL['s3'],false);
  const gp=G.g?G.g.p:null,gw=G.g?G.g.w:null;
  if(G.g)mark(gp,gw,PAL['s4'],true);
  if(!(G.g&&gp===P.p&&gw===P.w)&&!(B0&&B0.p===P.p&&B0.w===P.w))mark(P.p,P.w,PAL['rj'],false);
  /* order summary */
  const RX=530,lh=Math.round(4+16*k);let y=GT+14*k;
  const block=(title,col,p,w)=>{txt(ctx,title,RX,y,{s:13*k,w:700,c:col});y+=lh;txt(ctx,order(p,w),RX,y,{s:13*k,w:700});y+=lh;
   const c=cost(sim,p,w),over=c>P.B+1e-9,bx=p+w>P.L,f=fed(p,w),low=f<P.N;
   txt(ctx,`${usd0(c)} of ${usd0(P.B)}`,RX,y,{s:13*k,c:over?PAL['s1']:PAL['cv-ink']});y+=lh;
   txt(ctx,`${p+w} of ${P.L} boxes`,RX,y,{s:13*k,c:bx?PAL['s1']:PAL['cv-ink']});y+=lh;
   txt(ctx,`Feeds ${f} people`,RX,y,{s:13*k,w:700,c:low?PAL['s1']:PAL['s3']});y+=lh*1.4;};
  if(G.g&&G.m&&B0&&B0.p===P.p&&B0.w===P.w)block('Your gut',PAL['s4'],gp,gw);else block('Your order',PAL['rj'],P.p,P.w);
  if(B0)block('The math',PAL['s3'],B0.p,B0.w);
  else if(!big){txt(ctx,'Each green dot is an order',RX,y,{s:12*k,c:PAL['cv-soft']});txt(ctx,'that fits every limit.',RX,y+lh,{s:12*k,c:PAL['cv-soft']});}
 },
 narrate(sim){const P=sim.p,c=cost(sim,P.p,P.w),f=fed(P.p,P.w),r=why(sim,P.p,P.w);
  if(r.length)return `${order(P.p,P.w)} ${r.join(' and ')}. <b>${atLeast('honors')?'That order is outside the feasible region.':'That order breaks a limit.'}</b>`;
  const base=`${order(P.p,P.w)} costs ${usd0(c)}, fills ${P.p+P.w} of ${P.L} boxes and feeds ${f} people${f<P.N?`, <b>short of the ${P.N} you need</b>`:''}.`;
  if(!shown(sim))return base+' <b>Every limit is a line;</b> the orders that fit all of them make the green region.';
  const B=bestOrder(sim);return base+` The best order sits at a corner of the region: <b>${order(B.p,B.w)}</b>, ${usd0(B.c)}, feeding ${B.f}.`;},
 gut:{better:'higher',controls:['p','w'],
  ask:{bio:'Drag the two sliders here to build an order; the red dot in the picture moves with it. Feed as many people as you can without going over the budget or the box limit, then lock it in.',
   ap:'Pick an order by feel for the current goal, then lock it in. With <b>Feed everyone for less</b>, your order must feed everyone and the score is the money left over.'},
  lock(sim){const p=sim.p.p,w=sim.p.w;return {v:score(sim,p,w),p,w,f:fed(p,w),c:cost(sim,p,w),why:why(sim,p,w),cheap:cheapMode(sim),N:sim.p.N,B:sim.p.B,label:`${order(p,w)}, ${usd0(cost(sim,p,w))}`};},
  solve(sim){const b=bestOrder(sim);sim.p.p=b.p;sim.p.w=b.w;sim.p.show=true;return {v:score(sim,b.p,b.w),p:b.p,w:b.w,f:b.f,c:b.c,label:`${order(b.p,b.w)}, ${usd0(b.c)}, feeds ${b.f}`};},
  how:{bio:'Each limit is a line, and the orders that fit all the limits make a region. The best order is always at a corner of that region, so the math only has to check the corners.',
   honors:'Write each limit as an inequality: 12p + 18w ≤ budget, p + w ≤ boxes, 4p + 5w ≥ people. Slide the goal line 4p + 5w = c outward until it last touches the region: that is a corner.',
   ap:'Solve the boundary equations in pairs to get the corners, evaluate the goal at each, and keep the best. If that corner is not whole numbers, check the whole-number orders around it that stay inside the region.'},
  compare(sim,g,m){
   if(g.cheap&&m.v<=0)return `No order fits every limit here: ${usd0(g.B)} and ${sim.p.L} boxes cannot feed ${g.N} people. The math can tell you that before you call the shop. Raise the budget or the box limit to find one.`;
   if(g.cheap){if(g.why.length)return `Your order ${g.why.join(' and ')}, so it does not work. The math’s order, ${order(m.p,m.w)}, feeds ${m.f} for ${usd0(m.c)} and leaves <b>${usd0(m.v)}</b> in the budget.`;
    if(m.v-g.v<0.005)return `Your gut was right on: ${order(g.p,g.w)} feeds everyone for ${usd0(g.c)}, the lowest price possible here.`;
    return `Your order feeds everyone for ${usd0(g.c)}. The math’s order, ${order(m.p,m.w)}, feeds ${m.f} for ${usd0(m.c)}: <b>${usd0(g.c-m.c)} saved</b> for the same job.`;}
   if(g.why.length)return `Your order ${g.why.join(' and ')}, so the shop will not take it. The math’s order, <b>${order(m.p,m.w)}</b>, fits every limit and feeds <b>${m.f} people</b> for ${usd0(m.c)}.`;
   if(m.v-g.v<0.5)return `Your gut was right on: ${order(g.p,g.w)} feeds ${g.f}, the most any order can here. You found the corner of the region by feel.`;
   return `Your order feeds ${g.f} people for ${usd0(g.c)}. The math’s order, ${order(m.p,m.w)}, feeds <b>${m.f} for ${usd0(m.c)}: ${m.f-g.f} more people</b> from the same budget${m.f>=g.N&&g.f<g.N?`, and now everyone eats`:''}.`;},
  again(sim){const pick=a=>a[Math.floor(Math.random()*a.length)];sim.p.B=pick([120,140,150,160,180,200]);sim.p.N=pick([24,28,30,32,36]);
   if(atLeast('honors')){sim.p.L=pick([8,9,10,11,12]);sim.p.pp=pick([10,11,12,13,14]);sim.p.wp=pick([15,16,18,20]);}
   sim.p.p=pick([2,4,6,8]);sim.p.w=pick([0,1,2,3]);sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A $12 pizza feeds 4 people. An $18 tray of wings feeds 5. Which feeds a person for less?',choices:['Pizza: $3.00 a person','Wings: $3.60 a person','They cost the same per person'],correct:0,explain:'Pizza: $12 ÷ 4 = $3.00 a person. Wings: $18 ÷ 5 = $3.60 a person. Pizza is the better deal per dollar, but wings feed more people per box.'},
  {lvl:'bio',instant:true,q:'You have $150 and the shop delivers at most 10 boxes. Which order feeds the most people?',choices:['10 pizzas: feeds 40','8 trays of wings: feeds 40','5 pizzas + 5 trays: feeds 45'],correct:2,explain:'All pizza runs out of boxes before money: 10 pizzas cost $120 and feed 40. All wings runs out of money: 8 trays cost $144 and feed 40. The mix uses all $150 and all 10 boxes and feeds 45. It sits at the corner where both limits meet.'},
  {lvl:'honors',instant:true,q:'For a goal like “feed the most people,” where in the feasible region is the best order?',choices:['At a corner of the region','Near the middle of the region','Anywhere along the budget line'],correct:0,explain:'The goal 4p + 5w is a family of parallel lines. Slide it outward to feed more people; the last point of the region it touches is a corner (or a whole edge, if the goal line is parallel to that edge).'},
  {lvl:'honors',instant:true,q:'The budget rises to $180. Prices stay $12 and $18, and the box limit stays at 10. What is the new best order?',choices:['10 trays of wings: feeds 50','5 pizzas + 5 trays: feeds 45','15 pizzas: feeds 60'],correct:0,explain:'With $180, ten trays (10 × $18 = $180) now fit, and each box feeds 5 instead of 4. 15 pizzas would feed 60 but needs 15 boxes. The corner moved: when a limit changes, the best order can jump to a different corner.'},
  {lvl:'ap',instant:true,q:'With $150 and 10 boxes, the corner where the budget and box lines meet solves 12p + 18w = 150 and p + w = 10. Where is it?',choices:['p = 5, w = 5','p = 10, w = 0','p = 0, w = 8.3','p = 4, w = 6'],correct:0,explain:'Substitute w = 10 − p: 12p + 18(10 − p) = 150, so 180 − 6p = 150 and p = 5, w = 5. Check: 60 + 90 = $150 and 10 boxes. It feeds 4(5) + 5(5) = 45.'},
  {lvl:'ap',instant:true,q:'With a $160 budget the corner is at p ≈ 3.3, w ≈ 6.7. Rounding gives 3 pizzas + 7 trays. What is wrong, and what is the best whole order?',choices:['3 + 7 costs $162, over budget; 4 pizzas + 6 trays feeds 46','Nothing: 3 + 7 feeds 47 and fits','Round down both: 3 + 6 feeds 42'],correct:0,explain:'3 × 12 + 7 × 18 = $162, which breaks the budget. Checking whole orders near the corner, 4 + 6 costs $156, uses 10 boxes and feeds 46, the most possible. 3 + 6 fits but feeds only 42.'}
 ],
 tour:[
  {title:'Every possible order',text:'Each dot is one order: pizzas across, wing trays up. A $12 pizza feeds 4 people and an $18 tray of wings feeds 5.',pause:true,setup:sim=>BioLab.setValues(sim,{show:false,p:6,w:2}),focus:sim=>sim.vis.region},
  {title:'The budget line',text:'The red line is every order that costs exactly $150: 12p + 18w = 150. Orders below it cost less. Orders above it are over budget.',pause:true},
  {title:'The box limit',text:'The purple line is 10 boxes: p + w = 10. The shop will not deliver an order above it.',pause:true},
  {title:'Enough food',text:'The dashed blue line is 4p + 5w = 30: enough for 30 people. You want to be on or above it.',pause:true},
  {title:'The feasible region',text:'The green shape is every order that fits all three limits. Your gut order, 6 pizzas and 2 trays, is inside it: $108, 8 boxes, 34 people. But it leaves money and boxes unused.',pause:true},
  {title:'The best order is a corner',text:'The order that feeds the most sits where the budget and box lines cross: 5 pizzas and 5 trays. It uses all $150 and all 10 boxes and feeds 45, eleven more people for the same budget.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,p:5,w:5})},
  {lvl:'honors',title:'Slide the goal line',text:'The dotted line is 4p + 5w = 45. Lines for bigger goals are parallel to it and farther out. The farthest one that still touches the region touches it at a corner.',pause:true},
  {lvl:'ap',title:'Corners from systems',text:'Each corner solves a system of two boundary equations. Here 12p + 18w = 150 and p + w = 10 give p = 5, w = 5. The labels show each corner and how many people it feeds.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Where are the best orders?</p><ol><li>Try five orders inside the green region and record each one.</li><li>Then turn on <b>Show the math’s best order</b> and record it.</li></ol><p>Write one sentence: where is the best order compared with the edges of the region?</p>',
  honors:'<p><b>Question:</b> When does the best corner move?</p><ol><li>Raise the budget from $120 to $200 in $20 steps. Record the math’s order each time.</li><li>Repeat with the box limit from 6 to 14.</li></ol><p>Explain each jump using which two lines meet at the best corner.</p>',
  ap:'<p><b>Question:</b> Is the best whole-number order always the rounded corner?</p><ol><li>For budgets of $150, $155, $160 and $170, find the corner by solving the system.</li><li>Round it, check it against every limit, and compare with the math’s order.</li></ol><p><b>CER:</b> Claim, evidence from your trials, and reasoning about the region.</p>'},
 terms:[
  {t:'Linear inequality',d:'Like an equation, but with ≤ or ≥. 12p + 18w ≤ 150 means “costs at most $150.”'},
  {t:'Constraint',d:'A limit the answer has to meet: the budget, the box limit, enough food.'},
  {t:'Feasible region',d:'The set of points that satisfy every constraint at once. On the graph, the shaded shape.'},
  {t:'Objective',d:'What you are trying to make as big (or small) as possible, like 4p + 5w people fed.',lvl:'honors'},
  {t:'Vertex (corner point)',d:'A corner of the feasible region, where two boundary lines cross.',lvl:'honors'},
  {t:'Linear programming',d:'Finding the best value of a linear objective over a feasible region made of linear constraints.',lvl:'ap'}
 ],
 about:'<p>Constraints: price of a pizza × p + price of a tray × w ≤ budget, p + w ≤ the box limit, and 4p + 5w ≥ people to feed, with p and w whole numbers from 0 to 15 and 0 to 12. A pizza feeds 4 people and a tray feeds 5: those servings and all prices are made up for illustration.</p><p><b>Feed the most people</b> scores an order by people fed, and an order the shop would not take (over the budget or the box limit) scores 0. <b>Feed everyone for less</b> scores the money left in the budget, and only orders that fit and feed everyone count. The math checks every whole-number order, so it always finds the true best one. Real orders also have tax, tips and delivery fees.</p>'
};
BioLab.register(SIM);
})();
