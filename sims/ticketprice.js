(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,legend,atLeast}=BioLab.h;
/* Linear demand: sales(p) = q0 − r(p − p0), never below 0. Revenue R(p) = p · sales(p), a downward parabola.
   At Deep dive, a cost c per ticket sold: money kept = (p − c) · sales(p). */
const PMIN=2,PMAX=30;
const P=sim=>({p0:sim.p.p0,q0:sim.p.q0,r:sim.p.r,c:atLeast('ap')?sim.p.cost:0});
const sales=(sim,p)=>{const m=P(sim);return Math.max(0,m.q0-m.r*(p-m.p0));};
const kept=(sim,p)=>(p-P(sim).c)*sales(sim,p);
const bestP=sim=>{const m=P(sim);return clamp((m.q0+m.r*m.p0+m.r*m.c)/(2*m.r),PMIN,PMAX);};
const zeroP=sim=>{const m=P(sim);return m.p0+m.q0/m.r;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).m));
const usd=v=>(v<0?'−':'')+'$'+Math.abs(Math.round(v)).toLocaleString('en-US');
const usd2=v=>'$'+v.toFixed(2);
const n0=v=>Math.round(v).toLocaleString('en-US');
const money=sim=>P(sim).c>0?'money kept':atLeast('honors')?'revenue':'money';
const vtx=()=>atLeast('honors')?'the vertex':'the best price';

const SIM={
 id:'ticketprice',hash:'ticketprice',apUnit:3,order:3,tab:'Ticket pricing',kind:'Simulation',
 card:'Pick a ticket price for the school musical by gut, then let the vertex of the revenue parabola find the price that earns the most.',
 title:'What should a ticket cost?',
 lede:{bio:'Raise the price and each ticket brings in more, but fewer people buy. Somewhere between too cheap and too pricey is the price that brings in the most money.',
  honors:'Revenue is price × tickets sold. When sales drop in a straight line as the price rises, revenue is a quadratic in the price, and its vertex is the best price.',
  ap:'R(p) = p(q₀ − r(p − p₀)) = −rp² + (q₀ + rp₀)p. The vertex is at p* = (q₀ + rp₀)/(2r), halfway between the two zeros. A cost c per ticket shifts it to p* + c/2.'},
 scale:'One school musical, all shows together. Each dot is one ticket sold (or more, when sales are large).',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your box office',
 controls:[
  {id:'price',label:'Your price: dollars a ticket',type:'range',min:PMIN,max:PMAX,step:0.25,def:10,unit:'',d:2},
  {id:'p0',label:'Starting price (dollars)',type:'range',min:5,max:20,step:1,def:10,unit:'',lvl:'honors',noGut:true},
  {id:'q0',label:'Tickets sold at the starting price',type:'range',min:100,max:500,step:10,def:300,unit:'',lvl:'honors',noGut:true},
  {id:'r',label:'Sales lost for each $1 increase',type:'range',min:5,max:50,step:1,def:20,unit:'',lvl:'honors',noGut:true,help:'In real life you would estimate this from a survey or past sales. Here it is an assumption you can change.'},
  {id:'cost',label:'Cost per ticket sold (dollars)',type:'range',min:0,max:5,step:0.5,def:0,unit:'',d:2,lvl:'ap',noGut:true,help:'For example, a printed program for each audience member.'},
  {id:'show',label:'Show the money',type:'toggle',def:false,help:'Shows revenue and the revenue graph. Leave it off until you have locked in your gut.'}
 ],
 actions:[{id:'best',label:'Go to the best price',lvl:'honors',run(sim){BioLab.setValues(sim,{price:bestP(sim),show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'sales',label:'Tickets sold',unit:'',d:0,min:0,max:null,get:sim=>sales(sim,sim.p.price)},
  {id:'rev',label:'Revenue',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?sim.p.price*sales(sim,sim.p.price):null},
  {id:'kept',label:'Money kept after costs',unit:'dollars',d:0,min:0,max:null,lvl:'ap',get:sim=>shown(sim)?kept(sim,sim.p.price):null},
  {id:'bestp',label:'Best price',unit:'dollars',d:2,min:0,max:null,lvl:'honors',get:sim=>shown(sim)?bestP(sim):null},
  {id:'bestv',label:'Most money possible',unit:'dollars',d:0,min:0,max:null,lvl:'honors',get:sim=>shown(sim)?kept(sim,bestP(sim)):null},
  {id:'eq',label:'The revenue function',text:true,lvl:'honors',get:sim=>{const m=P(sim),A=m.r,Bc=m.q0+m.r*m.p0;return `R(p) = p(${m.q0} − ${m.r}(p − ${m.p0})) = −${A}p² + ${Bc}p. Zeros at p = 0 and p = ${(+zeroP(sim).toFixed(2))}.`;}}
 ],
 graphs:[{id:'curve',label:'Money vs. ticket price',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const pb=bestP(sim),top=Math.max(100,Math.ceil(kept(sim,pb)*1.15/500)*500);
  const ax=axes(ctx,box,{xmin:0,xmax:PMAX,ymin:0,ymax:top,xl:'Ticket price (dollars)',yl:(P(sim).c>0?'Money kept':'Revenue')+' (dollars)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut, or turn on Show the money',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();let first=true;for(let p=0;p<=PMAX+1e-9;p+=0.1){const v=Math.max(0,kept(sim,p));const px=ax.X(p),py=ax.Y(v);first?ctx.moveTo(px,py):ctx.lineTo(px,py);first=false;}ctx.stroke();
  const dot=(p,col,lab,dy)=>{const v=Math.max(0,kept(sim,p));ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(p),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,ax.X(p),ax.Y(v)+dy,{s:12,w:700,c:col,a:'center'});};
  const G=GS(sim);if(G&&G.g)dot(G.g.p,PAL['s4'],'Your gut',20);
  if(Math.abs(sim.p.price-pb)<0.13)dot(pb,PAL['s3'],'You: best',-12);else{dot(pb,PAL['s3'],'Best',-12);dot(sim.p.price,PAL['rj'],'You',Math.abs(sim.p.price-pb)<4?20:-12);}},
 draw(sim,ctx,vdt,k){const m=P(sim),p=sim.p.price,q=sales(sim,p),sh=shown(sim),G0=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  txt(ctx,`At $${m.p0} you sell ${m.q0} tickets. Each $1 more loses ${m.r} sales.`,24,32,{s:15*k,w:700,c:PAL['cv-ink']});
  /* ticket */
  const TX=24,TY=70,TW=210,TH=110;ctx.fillStyle=PAL['rj'];rr(ctx,TX,TY,TW,TH,12);ctx.fill();
  ctx.fillStyle=PAL['cv-bg'];ctx.beginPath();ctx.arc(TX,TY+TH/2,12,0,7);ctx.arc(TX+TW,TY+TH/2,12,0,7);ctx.fill();
  txt(ctx,G0&&G0.m?'THE MATH’S PRICE':'YOUR PRICE',TX+TW/2,TY+28,{s:13,w:700,c:'#fff',a:'center'});
  txt(ctx,usd2(p),TX+TW/2,TY+80,{s:40,w:800,c:'#fff',a:'center'});
  /* sales and money */
  txt(ctx,`${n0(q)} tickets sold`,TX,TY+TH+36,{s:16*k,w:700,c:PAL['cv-ink']});
  if(atLeast('honors'))txt(ctx,`${m.q0} − ${m.r}(${+p.toFixed(2)} − ${m.p0})`,TX,TY+TH+36+22*k,{s:13*k,c:PAL['cv-soft']});
  const my=TY+TH+36+56*k;
  txt(ctx,atLeast('honors')?'Revenue':'Money brought in',TX,my,{s:13*k,w:700,c:PAL['cv-soft']});
  if(sh){const R=p*q;txt(ctx,usd(R),TX,my+26*k,{s:20*k,w:800,c:PAL['s3']});
   if(m.c>0){txt(ctx,'Kept after costs',TX,my+52*k,{s:13*k,w:700,c:PAL['cv-soft']});txt(ctx,usd(kept(sim,p)),TX,my+74*k,{s:16*k,w:800,c:PAL['cv-ink']});}}
  else txt(ctx,'?  Lock in first',TX,my+24*k,{s:15*k,w:700,c:PAL['cv-soft']});
  /* audience: stage and dots */
  const AX=290,AW=490;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,AX,62,AW,34,8);ctx.fill();txt(ctx,'STAGE',AX+AW/2,84,{s:13,w:700,c:PAL['cv-soft'],a:'center'});
  const cols=30,rows=18,cap=cols*rows,u=Math.max(1,Math.ceil(q/cap)),nd=Math.round(q/u),dx=AW/cols,dy=(430-112)/rows;
  for(let i=0;i<cap;i++){const c=i%cols,r=Math.floor(i/cols);ctx.fillStyle=i<nd?PAL['rj']:PAL['line'];ctx.beginPath();ctx.arc(AX+dx*(c+.5),112+dy*(r+.5),Math.min(dx,dy)*0.32,0,7);ctx.fill();}
  txt(ctx,u===1?'Each red dot is 1 ticket sold':`Each red dot is ${u} tickets sold`,AX+AW,444,{s:12*k,c:PAL['cv-soft'],a:'right'});
  const G=GS(sim);if(G&&G.g&&Math.abs(G.g.p-p)>0.01&&m.c===0)txt(ctx,`Your gut: ${usd2(G.g.p)}`,TX,438,{s:13*k,w:700,c:PAL['s4']});},
 narrate(sim){const p=sim.p.price,q=sales(sim,p),pb=bestP(sim);
  if(q<=0)return `At ${usd2(p)} nobody buys a ticket, so the show earns nothing. <b>Too high a price is as bad as giving tickets away.</b>`;
  if(!shown(sim))return `At ${usd2(p)} you sell ${n0(q)} tickets. <b>Raising the price earns more on each ticket but sells fewer.</b> Which effect wins? Lock in your price to find out.`;
  if(Math.abs(p-pb)<0.13)return `<b>This is ${vtx()}: ${usd2(pb)}.</b> ${n0(q)} tickets bring in ${usd(kept(sim,p))}. Move the price either way and the ${money(sim)} drops.`;
  return p<pb?`At ${usd2(p)} you sell ${n0(q)} tickets for ${usd(kept(sim,p))}. <b>Raising the price still helps:</b> the extra on each ticket outweighs the lost sales.`
   :`At ${usd2(p)} you sell ${n0(q)} tickets for ${usd(kept(sim,p))}. <b>The price is past ${vtx()}:</b> you lose so many sales that the higher price does not make up for it.`;},
 gut:{better:'higher',controls:['price'],
  ask:{bio:'Drag the slider here to the ticket price you think brings in the most money. Watch the seats fill or empty as you go, then lock it in.',honors:'Before you show the money, drag the slider here to the price you think earns the most. Then lock it in.'},
  lock(sim){const p=sim.p.price;return {v:kept(sim,p),p,q:sales(sim,p),label:`${usd2(p)} a ticket`};},
  solve(sim){const pb=bestP(sim);sim.p.price=pb;sim.p.show=true;return {v:kept(sim,pb),p:pb,q:sales(sim,pb),label:`${usd2(pb)} a ticket, ${vtx()}`};},
  how:{bio:'Revenue is zero if tickets are free and zero if the price is so high nobody buys. The graph of revenue is a parabola, and the best price sits exactly halfway between those two zeros.',
   honors:'R(p) = p(q₀ − r(p − p₀)) is a quadratic with a negative leading coefficient. Its vertex, p = −b/(2a), is halfway between its zeros.',
   ap:'Money kept = (p − c)(q₀ − r(p − p₀)). Its zeros are p = c and p = p₀ + q₀/r, so the vertex is their average: p* = (c + p₀ + q₀/r)/2.'},
  compare(sim,g,m){const d=m.v-g.v,w=money(sim);
   if(d<Math.max(1,0.002*m.v))return `Your gut was right on: ${usd2(g.p)} earns ${usd(g.v)}, the most possible. Your sense of the trade-off between price and sales is already doing this math.`;
   let t=`Your price brings in ${usd(g.v)} from ${n0(g.q)} tickets. ${atLeast('honors')?'The vertex price':'The math’s price'} brings in ${usd(m.v)} from ${n0(m.q)} tickets: <b>${usd(d)} more ${w}</b> for the same show.`;
   if(g.q>m.q)t+=` It sells ${n0(g.q-m.q)} <b>fewer</b> tickets and still earns more: the price that fills the most seats is not the price that earns the most.`;
   else if(g.q<m.q)t+=` It also sells ${n0(m.q-g.q)} more tickets, so more people see the show.`;
   return t;},
  again(sim){sim.p.p0=5+Math.floor(Math.random()*11);sim.p.q0=150+10*Math.floor(Math.random()*31);sim.p.r=8+Math.floor(Math.random()*30);
   if(bestP(sim)>PMAX-1||bestP(sim)<PMIN+1){sim.p.p0=10;sim.p.q0=300;sim.p.r=20;}sim.p.price=sim.p.p0;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'At $10 you sell 300 tickets: $3,000. Each $1 increase loses 20 sales. What does a $11 ticket bring in?',choices:['$2,980','$3,080','$3,300','$3,000'],correct:1,explain:'At $11 you sell 300 − 20 = 280 tickets, and 280 × $11 = $3,080. You sold fewer tickets but earned $80 more.'},
  {lvl:'bio',instant:true,q:'Same show. Does the cheapest price also earn the most money?',choices:['Yes: more tickets always means more money','No: at $5 you sell 400 tickets but earn only $2,000'],correct:1,explain:'At $5 you sell 300 + 5 × 20 = 400 tickets, but 400 × $5 = $2,000. The best price, $12.50, sells only 250 tickets and earns $3,125.'},
  {lvl:'honors',instant:true,q:'Revenue is R(p) = −20p² + 500p. Where is the vertex?',choices:['p = $12.50','p = $25','p = $10','p = $6.25'],correct:0,explain:'p = −b/(2a) = −500/(2 × −20) = $12.50. The zeros are p = 0 and p = 25, and the vertex is halfway between them.'},
  {lvl:'honors',instant:true,q:'The best price is $12.50. Compare raising the price to $15 with lowering it to $10.',choices:['Raising it loses more money','Lowering it loses more money','Both lose the same $125'],correct:2,explain:'A parabola is symmetric about its vertex, and $15 and $10 are both $2.50 from $12.50. R(15) = 15 × 200 = $3,000 and R(10) = 10 × 300 = $3,000, both $125 below $3,125.'},
  {lvl:'ap',instant:true,q:'Each audience member gets a printed program that costs $2. With 300 sales at $10 and 20 lost per $1, what price keeps the most money?',choices:['$12.50','$13.50','$14.50','$11.50'],correct:1,explain:'Money kept = (p − 2)(500 − 20p). The zeros are p = 2 and p = 25, so the vertex is (2 + 25)/2 = $13.50. A cost of c per ticket moves the best price up by c/2.'},
  {lvl:'ap',instant:true,q:'If each $1 increase loses 25 sales instead of 20 (still 300 sales at $10), what is the best price?',choices:['$11.00','$12.50','$14.00','$10.00'],correct:0,explain:'Sales hit zero at 10 + 300/25 = $22, so the vertex is halfway between 0 and 22: $11.00. When buyers are more sensitive to price, the best price is lower.'}
 ],
 tour:[
  {title:'The deal now',text:'At $10 a ticket, the musical sells 300 tickets across all its shows: 300 × $10 = $3,000. A survey says each $1 increase loses about 20 sales.',pause:true,setup:sim=>BioLab.setValues(sim,{price:10,p0:10,q0:300,r:20,cost:0,show:true})},
  {title:'Raise the price a little',text:'At $11 you sell 280 tickets: 280 × $11 = $3,080. Fewer tickets, more money. The extra dollar on each ticket outweighs the lost sales.',pause:true,setup:sim=>BioLab.setValues(sim,{price:11})},
  {title:'Too far',text:'At $20 you sell only 100 tickets: $2,000. Now the lost sales outweigh the higher price.',pause:true,setup:sim=>BioLab.setValues(sim,{price:20})},
  {title:'Cheap seats',text:'At $5 you sell 400 tickets, the fullest house yet, but earn only $2,000. The price that sells the most is not the price that earns the most.',pause:true,setup:sim=>BioLab.setValues(sim,{price:5})},
  {title:'The revenue parabola',text:'Revenue = price × tickets. It is $0 when tickets are free and $0 at $25, when nobody buys. In between it rises and falls: a parabola. Check the graph.',pause:true},
  {title:'The vertex',text:'The best price is halfway between the zeros: $12.50. You sell 250 tickets and earn $3,125, the most possible.',pause:true,setup:sim=>BioLab.setValues(sim,{price:12.5})},
  {lvl:'honors',title:'Symmetry',text:'R(p) = p(300 − 20(p − 10)) = −20p² + 500p. Prices the same distance from the vertex earn the same: $10 and $15 both bring in $3,000.',pause:true,setup:sim=>BioLab.setValues(sim,{price:15})},
  {lvl:'ap',title:'Costs move the vertex',text:'Add a $2 program for each ticket sold. Money kept = (p − 2)(500 − 20p), with zeros at $2 and $25, so the best price moves up to $13.50 and keeps $2,645.',pause:true,setup:sim=>BioLab.setValues(sim,{cost:2,price:13.5})}
 ],
 lab:{bio:'<p><b>Question:</b> Which price earns the most, and how many tickets does it sell?</p><ol><li>Turn on <b>Show the money</b>.</li><li>Record trials at $4, $8, $12, $16, $20 and $24.</li><li>Graph <b>Trials</b> with price on x and revenue on y. Then graph tickets sold on y.</li></ol><p>Write one sentence: why are the two graphs different shapes?</p>',
  honors:'<p><b>Question:</b> Is the best price always halfway between the zeros?</p><ol><li>Choose three different scenarios with the starting price, starting sales and sales lost per $1.</li><li>For each, find where revenue is zero, predict the vertex, then press <b>Go to the best price</b>.</li></ol><p>Explain your results using the symmetry of a parabola.</p>',
  ap:'<p><b>Question:</b> How does a cost per ticket move the best price?</p><ol><li>Record the best price for costs of $0, $1, $2, $3, $4 and $5.</li><li>Fit a line to best price vs. cost.</li></ol><p><b>CER:</b> Show from the zeros of (p − c)(q₀ − r(p − p₀)) why the slope is 1/2.</p>'},
 terms:[
  {t:'Revenue',d:'All the money that comes in: price × number sold.'},
  {t:'Vertex',d:'The highest point of a downward parabola. Here, the best price and the most revenue.'},
  {t:'Zeros',d:'The inputs that make a function equal 0. Revenue is zero at a free ticket and at a price nobody pays.',lvl:'honors'},
  {t:'Axis of symmetry',d:'The vertical line through the vertex. Prices the same distance from it earn the same revenue.',lvl:'honors'},
  {t:'Demand',d:'How many people buy at each price. Here it falls in a straight line as the price rises.',lvl:'ap'}
 ],
 about:'<p>Tickets sold fall in a straight line as the price rises: sales = q₀ − r(p − p₀), never below zero. Revenue is R(p) = p × sales. At Deep dive, a cost c for each ticket sold gives money kept = (p − c) × sales.</p><p>This is a simplified model for learning, not financial advice. Real demand is rarely a perfect straight line, the sales-lost number would come from a survey or past sales, and a real show also has fixed costs (rights, sets, costumes) that do not change the best price but do change whether the show breaks even.</p>'
};
BioLab.register(SIM);
})();
