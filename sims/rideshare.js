(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const usd=v=>(v<-0.004?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const usd0=v=>Math.abs(v-Math.round(v))<1e-9?'$'+Math.round(v).toLocaleString('en-US'):usd(v);
const fm=v=>(Math.round(v*100)/100).toLocaleString('en-US',{maximumFractionDigits:2});
/* Two made-up companies (or plans): cost = fixed fee + rate × amount. */
const SC={
 ride:{A:'Velo',B:'Pronto',u:'mi',per:'a mile',fee:'to start',v:'m',aB:5,aR:1.5,bB:2,bR:2,x:9,xl:'Trip length (mi)',xLab:'Your trip',tLab:'Your guess: they cost the same at a trip of',pLab:'Your pick: which is cheaper for your trip?'},
 phone:{A:'Flex',B:'Steady',u:'GB',per:'per GB',fee:'a month',v:'g',aB:15,aR:8,bB:40,bR:3,x:8,xl:'Data used in a month (GB)',xLab:'Your data use each month',tLab:'Your guess: they cost the same at a data use of',pLab:'Your pick: which plan is cheaper for you?'}
};
const cs=sim=>SC[sim.p.sc]||SC.ride;
const fA=(sim,x)=>sim.p.aB+sim.p.aR*x, fB=(sim,x)=>sim.p.bB+sim.p.bR*x;
const isRide=sim=>sim.p.sc!=='phone';
const perMonth=sim=>isRide(sim)?sim.p.trips:1;          /* rides per month, or 1 bill per month */
const cost=(sim,who,x)=>(who==='A'?fA(sim,x):fB(sim,x))*perMonth(sim);
const best=sim=>fA(sim,sim.p.x)<=fB(sim,sim.p.x)+1e-9?'A':'B';
/* where the two lines cross; null when they never cross at a positive amount */
function tie(sim){const d=sim.p.aR-sim.p.bR;if(Math.abs(d)<1e-9)return null;const t=(sim.p.bB-sim.p.aB)/d;return t>0?t:null;}
const shown=sim=>!!sim.p.show;
const fee=(sim,w)=>w==='A'?sim.p.aB:sim.p.bB, rate=(sim,w)=>w==='A'?sim.p.aR:sim.p.bR;
const eq=(sim,w)=>`${w==='A'?'A':'B'}(${cs(sim).v}) = ${fm(fee(sim,w))} + ${fm(rate(sim,w))}${cs(sim).v}`;
const rule=(sim,w)=>`${usd0(fee(sim,w))} ${cs(sim).fee} + ${usd0(rate(sim,w))} ${cs(sim).per}`;
function relabel(sim){const c=cs(sim),u=sim.ui;if(!u||!u.ctlW)return;
 const lab=(id,t)=>{const w=u.ctlW[id];const l=w&&w.querySelector('label,.lbl');if(l)l.textContent=t;};
 lab('x',c.xLab);lab('tie',c.tLab);lab('pick',c.pLab);const D=sim.def.controls;['x','tie'].forEach(id=>{D.find(z=>z.id===id).unit=' '+c.u;if(u.ctl[id])u.ctl[id].set(sim.p[id]);});
 const w=u.ctlW.pick;if(w)w.querySelectorAll('button').forEach(b=>{b.textContent=b.dataset.v==='A'?c.A:c.B;});
 const t=u.tiles&&u.tiles.tie;if(t&&t.num){const s=t.num.parentNode.querySelector('.u');if(s)s.textContent=c.u;}}
function useCase(sim,key,x){const c=SC[key];Object.assign(sim.p,{sc:key,aB:c.aB,aR:c.aR,bB:c.bB,bR:c.bR,x:x===undefined?c.x:x,show:false});relabel(sim);
 if(sim.ui&&sim.ui.ctl)['sc','aB','aR','bB','bR','x','show'].forEach(id=>sim.ui.ctl[id]&&sim.ui.ctl[id].set(sim.p[id]));}
function niceMax(v){for(const s of [10,20,25,50,100,200,250,500])if(v<=s*6)return Math.ceil(v/s)*s;return Math.ceil(v/1000)*1000;}

const SIM={
 id:'rideshare',hash:'rideshare',apUnit:2,order:1,tab:'Which ride is cheaper?',kind:'Simulation',
 card:'Pick the cheaper rideshare or phone plan by feel, then graph both prices as lines and find where they tie.',
 title:'Which ride is cheaper?',
 lede:{bio:'One company starts cheap and charges more per mile. The other starts higher and charges less. Which one wins depends on how far you go, and a graph shows exactly where the answer flips.',
  honors:'Each fare is a linear function: f(m) = fixed fee + price per mile × m. The fixed fee is the y-intercept, and the price per mile is the slope.',
  ap:'Two lines with different slopes cross exactly once. Set the two functions equal and solve for the tie point; on one side of it the smaller intercept wins, on the other the smaller slope wins.'},
 scale:'Prices for made-up companies and plans. Each line is one price rule; the dashed line is you.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your trip',
 controls:[
  {id:'sc',label:'Case',type:'select',def:'ride',noGut:true,options:[{v:'ride',l:'Rides: two rideshare companies'},{v:'phone',l:'Phone plans: monthly fee + data'}],onChange(sim){useCase(sim,sim.p.sc);}},
  {id:'x',label:'Your trip',type:'range',min:0.5,max:25,step:0.5,def:9,unit:' mi'},
  {id:'pick',label:'Your pick: which is cheaper for your trip?',type:'seg',def:'B',options:[{v:'A',l:'Velo'},{v:'B',l:'Pronto'}]},
  {id:'tie',label:'Your guess: they cost the same at a trip of',type:'range',min:0,max:25,step:0.5,def:3,unit:' mi'},
  {id:'trips',label:'Rides per month',type:'range',min:2,max:60,step:2,def:20,unit:'',noGut:true,help:'Rides only. A phone plan bills once a month.'},
  {id:'show',label:'Show the graph',type:'toggle',def:false,help:'Draws both prices as lines. Lock in your gut first.'},
  {id:'aB',label:'A: fixed fee ($)',type:'range',min:0,max:60,step:0.5,def:5,unit:'',d:2,lvl:'honors',noGut:true},
  {id:'aR',label:'A: price per mile or GB ($)',type:'range',min:0.25,max:12,step:0.25,def:1.5,unit:'',d:2,lvl:'honors',noGut:true},
  {id:'bB',label:'B: fixed fee ($)',type:'range',min:0,max:60,step:0.5,def:2,unit:'',d:2,lvl:'honors',noGut:true},
  {id:'bR',label:'B: price per mile or GB ($)',type:'range',min:0.25,max:12,step:0.25,def:2,unit:'',d:2,lvl:'honors',noGut:true}
 ],
 init(sim){relabel(sim);return {};},step(){},
 onLevel(sim){relabel(sim);},
 metrics:[
  {id:'costA',label:'A costs (this trip)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?fA(sim,sim.p.x):NaN},
  {id:'costB',label:'B costs (this trip)',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?fB(sim,sim.p.x):NaN},
  {id:'save',label:'Cheaper pick saves per month',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?Math.abs(fA(sim,sim.p.x)-fB(sim,sim.p.x))*perMonth(sim):NaN},
  {id:'tie',label:'Tie point',unit:'mi',d:2,lvl:'honors',min:0,max:null,get:sim=>{const t=tie(sim);return shown(sim)&&t!==null?t:NaN;}}
 ],
 graphs:[{id:'diff',label:'A’s price minus B’s price',custom:true}],defaultGraph:'diff',
 plot(sim,ctx,box){const c=cs(sim),d=x=>fA(sim,x)-fB(sim,x),v0=d(0),v1=d(25),m=Math.max(5,Math.abs(v0),Math.abs(v1));
  const ax=axes(ctx,box,{xmin:0,xmax:25,ymin:-niceMax(m),ymax:niceMax(m),xl:c.xl,yl:`${c.A} − ${c.B} ($)`});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(25),ax.Y(0));ctx.stroke();
  if(!shown(sim)){txt(ctx,'Turn on Show the graph to see the difference.',box.L+box.W/2,box.T+box.H/2-20,{s:13,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(v0));ctx.lineTo(ax.X(25),ax.Y(v1));ctx.stroke();
  txt(ctx,`Above 0: ${c.B} is cheaper`,box.L+10,box.T+14,{s:12,c:PAL['cv-soft']});txt(ctx,`Below 0: ${c.A} is cheaper`,box.L+10,box.T+box.H-8,{s:12,c:PAL['cv-soft']});
  const t=tie(sim);if(t!==null&&t<=25){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(ax.X(t),ax.Y(0),6,0,7);ctx.fill();txt(ctx,'Tie: '+fm(t)+' '+c.u,ax.X(t)+8,ax.Y(0)-10,{s:12,w:700,c:PAL['s3']});}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.x),ax.Y(d(sim.p.x)),5,0,7);ctx.fill();},
 draw(sim,ctx,vdt,k0){const k=Math.max(k0,1.45),c=cs(sim),sh=shown(sim),G=sim.gutS||{},x=sim.p.x,t=tie(sim),bigK=k>=1.6;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the two price rules */
  const ch=Math.round(18+32*k);
  [['A',20,PAL['s2']],['B',410,PAL['s5']]].forEach(([w,cx,col])=>{rr(ctx,cx,10,370,ch,10);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();
   txt(ctx,w==='A'?c.A:c.B,cx+14,10+8+13*k,{s:15*k,w:700,c:col});
   const pk=G.g?G.g.pick===w&&G.g.sc===sim.p.sc:sim.p.pick===w;if(pk)pill(ctx,G.g?'Your gut':'Your pick',cx+356-40*k,10+8+8*k,PAL['s4'],'#111',12*k);
   txt(ctx,atLeast('honors')?eq(sim,w):rule(sim,w),cx+14,10+ch-10,{s:13*k,c:PAL['cv-ink']});});
  const GT=10+ch+Math.round(18+10*k),GB=Math.round(450-14-14*k),GL=Math.round(40+24*k),GR=770;
  sim.vis.plot=[GL-10,GT-10,GR-GL+20,GB-GT+20];
  if(!sh){const cy=(GT+GB)/2;
   txt(ctx,`${c.xLab}: ${fm(x)} ${c.u}`,400,cy-14*k,{s:18*k,w:700,a:'center',c:PAL['rj']});
   txt(ctx,'Which is cheaper, and where do they tie?',400,cy+10*k,{s:14*k,a:'center'});
   txt(ctx,G.g?'Turn on Show the graph to check.':'Lock in your gut to see the graph.',400,cy+34*k,{s:12*k,a:'center',c:PAL['cv-soft']});return;}
  /* axes */
  const ymax=niceMax(Math.max(fA(sim,25),fB(sim,25),10)),X=v=>GL+(GR-GL)*v/25,Y=v=>GB-(GB-GT)*v/ymax;
  const ys=ymax/5;ctx.lineWidth=1;
  for(let i=0;i<=5;i++){const y=Math.round(Y(i*ys))+.5;ctx.strokeStyle=PAL['line'];ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(GL,y);ctx.lineTo(GR,y);ctx.stroke();ctx.globalAlpha=1;
   if(!bigK||i%(ymax>=100?1:1)===0)txt(ctx,usd0(i*ys),GL-8,y,{s:12*k,c:PAL['cv-soft'],a:'right',b:'middle'});}
  for(let v=0;v<=25;v+=bigK?10:5){const xx=X(v);txt(ctx,v===25||(bigK&&v===20)?fm(v)+' '+c.u:fm(v),xx,GB+6+12*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(GL,GT);ctx.lineTo(GL,GB);ctx.lineTo(GR,GB);ctx.stroke();
  /* which is cheaper, along the axis */
  const band=(a,b,col)=>{ctx.fillStyle=col;ctx.globalAlpha=.55;ctx.fillRect(X(a),GB-7,X(b)-X(a),6);ctx.globalAlpha=1;};
  const cheapAt=v=>fA(sim,v)<=fB(sim,v)?PAL['s2']:PAL['s5'];
  if(t!==null&&t<25){band(0,t,cheapAt(t/2));band(t,25,cheapAt((t+25)/2));}else band(0,25,cheapAt(12.5));
  /* the two lines */
  const line=(f,col)=>{ctx.save();ctx.beginPath();ctx.rect(GL,GT-2,GR-GL,GB-GT+2);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(0),Y(f(0)));ctx.lineTo(X(25),Y(f(25)));ctx.stroke();ctx.restore();};
  line(v=>fA(sim,v),PAL['s2']);line(v=>fB(sim,v),PAL['s5']);
  let ya=Y(fA(sim,25))-8,yb=Y(fB(sim,25))-8;if(Math.abs(ya-yb)<16*k){if(ya<yb)yb=ya+16*k;else ya=yb+16*k;}
  const tx=X(x)>GR-200*k?GL+8:GR-4,al=X(x)>GR-200*k?'left':'right';
  if(al==='left'){ya=Y(fA(sim,0))-8;yb=Y(fB(sim,0))-8;if(Math.abs(ya-yb)<16*k){if(ya<yb)ya=yb-16*k;else yb=ya-16*k;}}
  txt(ctx,c.A,tx,clamp(ya,GT+12*k,GB-12),{s:13*k,w:700,c:PAL['s2'],a:al});txt(ctx,c.B,tx,clamp(yb,GT+12*k,GB-12),{s:13*k,w:700,c:PAL['s5'],a:al});
  /* tie point */
  if(t!==null&&t<=25){const tx2=X(t),ty=Y(fA(sim,t));ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(tx2,ty,7,0,7);ctx.fill();
   const lab=`Same price at ${fm(t)} ${c.u}`;ctx.font='700 '+(12*k)+'px '+FONT;const hw=ctx.measureText(lab).width/2+10*k,lx=clamp(Math.abs(X(x)-tx2)<hw+16*k?(X(x)>tx2?tx2-hw-8:tx2+hw+8):tx2,GL+hw+4,GR-hw),up=ty-14-8*k>GT+10;pill(ctx,lab,lx,up?ty-14-8*k:ty+16+8*k,PAL['s3'],'#fff',12*k);}
  /* your gut tie */
  if(G.g&&G.g.sc===sim.p.sc){const gx=X(clamp(G.g.tie,0,25));ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,GB-18);ctx.lineTo(gx,GB+4);ctx.stroke();
   txt(ctx,'Your gut tie',clamp(gx,60*k,740),GB-22,{s:12*k,w:700,c:PAL['s4'],a:'center'});}
  /* your trip */
  const xx=X(x);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(xx,GT);ctx.lineTo(xx,GB);ctx.stroke();ctx.setLineDash([]);
  const pa=fA(sim,x),pb=fB(sim,x);[[pa,PAL['s2']],[pb,PAL['s5']]].forEach(([v,col])=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(xx,Y(v),6,0,7);ctx.fill();});
  const side=xx>420?-1:1;let y1=Y(pa),y2=Y(pb);if(Math.abs(y1-y2)<24*k){const m=(y1+y2)/2;if(y1<y2){y1=m-12*k;y2=m+12*k;}else{y1=m+12*k;y2=m-12*k;}}
  ctx.font='700 '+(12*k)+'px '+FONT;const off=v=>side*(ctx.measureText(usd(v)).width/2+16*k);
  pill(ctx,usd(pa),xx+off(pa),clamp(y1,GT+10*k,GB-14*k),PAL['s2'],'#fff',12*k);pill(ctx,usd(pb),xx+off(pb),clamp(y2,GT+10*k,GB-14*k),PAL['s5'],'#fff',12*k);
  txt(ctx,`${fm(x)} ${c.u}`,xx+(side>0?6:-6),GT+12*k,{s:12*k,w:700,c:PAL['rj'],a:side>0?'left':'right'});
 },
 narrate(sim){const c=cs(sim),x=sim.p.x,a=fA(sim,x),b=fB(sim,x),t=tie(sim),w=a<=b?c.A:c.B,diff=Math.abs(a-b);
  if(!shown(sim))return `${c.A}: ${rule(sim,'A')}. ${c.B}: ${rule(sim,'B')}. <b>Which is cheaper for ${fm(x)} ${c.u}?</b> Lock in your gut to see the graph.`;
  const tieTxt=t===null?`The lines never cross at a positive amount, so <b>${a<=b?c.A:c.B} is always cheaper</b>.`:`The lines cross at <b>${fm(t)} ${c.u}</b>: below that the lower fixed fee wins, above it the lower ${isRide(sim)?'per-mile':'per-GB'} price wins.`;
  if(diff<0.005)return `At ${fm(x)} ${c.u} both cost ${usd(a)}: you are right at the tie point.`;
  return `At ${fm(x)} ${c.u}, ${c.A} costs ${usd(a)} and ${c.B} costs ${usd(b)}, so <b>${w} saves ${usd(diff)}</b>${isRide(sim)?' a ride':' a month'}. ${tieTxt}`;},
 gut:{better:'lower',controls:['pick','tie'],
  ask:{bio:'Read the two price rules at the top of the picture. Tap the one you think is cheaper for you, then drag the slider here to the trip length where you think they cost the same. Lock it in.',honors:'Before you graph: tap the cheaper option for your trip and drag the slider here to where you think the two lines cross. Then lock it in.'},
  lock(sim){const c=cs(sim),w=sim.p.pick,v=cost(sim,w,sim.p.x);return {v,pick:w,tie:sim.p.tie,x:sim.p.x,sc:sim.p.sc,n:perMonth(sim),P:{aB:sim.p.aB,aR:sim.p.aR,bB:sim.p.bB,bR:sim.p.bR},label:`${w==='A'?c.A:c.B}, tie at ${fm(sim.p.tie)} ${c.u}`};},
  solve(sim){const c=cs(sim),w=best(sim),t=tie(sim);sim.p.pick=w;sim.p.show=true;if(t!==null)sim.p.tie=Math.round(t*100)/100;
   return {v:cost(sim,w,sim.p.x),pick:w,label:`${w==='A'?c.A:c.B}${t!==null?`, tie at ${fm(t)} ${c.u}`:', no tie'}`};},
  how:{bio:'Graph each price as a line: it starts at the fixed fee and climbs by the price per mile. For your trip, the lower line is cheaper. Where the lines cross, both cost the same.',
   honors:'Write each price as a function, f(m) = fee + rate × m. Read your trip off the graph, and set the two functions equal to find the tie: fee₁ + rate₁·m = fee₂ + rate₂·m.',
   ap:'Tie point: m* = (fee₂ − fee₁) ÷ (rate₁ − rate₂). Past m*, the smaller slope wins; before it, the smaller intercept wins.'},
  compare(sim0,g,m){const sim={p:g.P},c=SC[g.sc],t=tie(sim),ride=g.sc!=='phone',unit=ride?'a ride':'a month';m={pick:fA(sim,g.x)<=fB(sim,g.x)+1e-9?'A':'B'};
   const pa=sim.p.aB+sim.p.aR*g.x,pb=sim.p.bB+sim.p.bR*g.x,gp=g.pick==='A'?pa:pb,mp=m.pick==='A'?pa:pb,nm=w=>w==='A'?c.A:c.B;
   let tieTxt='';if(t===null)tieTxt=` These lines never cross at a positive amount, so ${nm(m.pick)} always wins.`;
   else if(Math.abs(g.tie-t)<=0.5)tieTxt=` You also nailed the tie point: the lines cross at ${fm(t)} ${c.u}.`;
   else tieTxt=` You guessed they tie at ${fm(g.tie)} ${c.u}; the lines really cross at ${fm(t)} ${c.u}, where both cost ${usd(sim.p.aB+sim.p.aR*t)}.`;
   if(gp-mp<0.005)return `Your gut picked the cheaper one: ${nm(m.pick)} costs ${usd(mp)} for ${fm(g.x)} ${c.u}${Math.abs(pa-pb)>0.004?`, ${usd(Math.abs(pa-pb))} less than ${nm(m.pick==='A'?'B':'A')}`:', the same as the other'}.${tieTxt}`;
   const d=gp-mp;return `${nm(g.pick)} costs ${usd(gp)} for ${fm(g.x)} ${c.u}; ${nm(m.pick)} costs ${usd(mp)}. That is ${usd(d)} ${unit}${ride?`, <b>${usd(d*g.n)} a month</b> at ${g.n} rides, and ${usd(d*g.n*12)} a year`:`, <b>${usd(d*12)} a year</b>`}.${tieTxt}`;},
  again(sim){const r=Math.random(),key=r<0.6?'ride':'phone';useCase(sim,key,Math.round((2+Math.random()*20)*2)/2);
   if(atLeast('honors')&&Math.random()<0.5){const c=SC[key];sim.p.aB=c.aB+(Math.round(Math.random()*4)-2)*0.5;sim.p.bR=c.bR+(Math.round(Math.random()*2)-1)*0.25;}
   sim.p.pick=Math.random()<0.5?'A':'B';sim.p.tie=3;relabel(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Velo charges $5 plus $1.50 a mile. Pronto charges $2 plus $2 a mile. Which is cheaper for a 2 mi ride?',choices:['Velo','Pronto','They cost the same'],correct:1,explain:'Velo: 5 + 1.50 × 2 = $8.00. Pronto: 2 + 2 × 2 = $6.00. On short rides the lower starting fee matters most.'},
  {lvl:'bio',instant:true,q:'Same two companies. Which is cheaper for a 15 mi ride, and by how much?',choices:['Pronto, by $3.00','Velo, by $4.50','They cost the same'],correct:1,explain:'Velo: 5 + 1.50 × 15 = $27.50. Pronto: 2 + 2 × 15 = $32.00. Every mile costs $0.50 less with Velo, so on long rides that adds up and beats the $3 head start.'},
  {lvl:'honors',instant:true,q:'Velo’s fare is f(m) = 5 + 1.5m. What does the 1.5 tell you?',choices:['The fare to start the ride','The price of each extra mile','The fare for a 1 mi ride'],correct:1,explain:'1.5 is the slope: each extra mile adds $1.50. The 5 is the y-intercept, the fare before you go anywhere. A 1 mi ride costs 5 + 1.5 = $6.50.'},
  {lvl:'honors',instant:true,q:'At what distance do Velo (5 + 1.5m) and Pronto (2 + 2m) cost the same?',choices:['3 mi','6 mi','7 mi','3.5 mi'],correct:1,explain:'Set them equal: 5 + 1.5m = 2 + 2m. Subtract 1.5m and 2 from both sides: 3 = 0.5m, so m = 6 mi. Both cost $14.00 there.'},
  {lvl:'ap',instant:true,q:'Phone plans: Flex is $15 a month + $8 per GB; Steady is $40 a month + $3 per GB. Where do they tie, and which wins if you use 8 GB?',choices:['5 GB; Steady wins by $15 a month','5 GB; Flex wins by $15 a month','8 GB; they tie','3 GB; Steady wins by $5 a month'],correct:0,explain:'15 + 8g = 40 + 3g gives 5g = 25, so g = 5 GB ($55 each). At 8 GB: Flex 15 + 64 = $79, Steady 40 + 24 = $64. Steady saves $15 a month, $180 a year.'},
  {lvl:'ap',instant:true,q:'Velo raises its starting fee from $5 to $6 and keeps $1.50 a mile. Pronto stays at $2 + $2 a mile. Where is the new tie point?',choices:['Still 6 mi','7 mi','8 mi','4 mi'],correct:2,explain:'6 + 1.5m = 2 + 2m gives 4 = 0.5m, so m = 8 mi. Raising the intercept by $1 moves the tie by 1 ÷ 0.5 = 2 mi, because the slopes differ by only $0.50 a mile.'}
 ],
 tour:[
  {title:'Two price rules',text:'Velo charges $5 to start plus $1.50 a mile. Pronto charges $2 to start plus $2 a mile. Your trip is 9 mi. Pronto’s lower starting fee makes it look cheaper.',pause:true,setup:sim=>{useCase(sim,'ride',9);}},
  {title:'Each fare is a function',text:'For any trip length m, Velo’s fare is 5 + 1.5m and Pronto’s is 2 + 2m. For 9 mi: Velo is 5 + 13.50 = $18.50, and Pronto is 2 + 18 = $20.00.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true}),focus:sim=>sim.vis.plot},
  {title:'Intercept and slope',text:'Each line starts at its fixed fee on the left edge: that is the y-intercept. It climbs by its price per mile: that is the slope. Pronto starts lower but climbs faster.',pause:true},
  {title:'Where they tie',text:'The lines cross at 6 mi, where both fares are $14. For shorter trips Pronto is cheaper. For longer trips Velo is cheaper. The colored strip along the bottom shows which wins.',pause:true,setup:sim=>BioLab.setValues(sim,{x:6})},
  {title:'What it is worth',text:'Back to 9 mi: Velo saves $1.50 a ride. At 20 rides a month that is $30 a month, or $360 a year, from one graph.',pause:true,setup:sim=>BioLab.setValues(sim,{x:9})},
  {lvl:'honors',title:'Solve for the tie',text:'Set the functions equal: 5 + 1.5m = 2 + 2m. Subtract 1.5m and 2 from both sides: 3 = 0.5m, so m = 6 mi.',pause:true},
  {lvl:'ap',title:'Same math, phone plans',text:'Flex is $15 + $8 per GB, Steady is $40 + $3 per GB. 15 + 8g = 40 + 3g gives g = 5 GB. At 8 GB a month, Steady saves $15 a month, $180 a year.',pause:true,setup:sim=>{useCase(sim,'phone',8);BioLab.setValues(sim,{show:true});}}
 ],
 lab:{bio:'<p><b>Question:</b> For which trips is each company cheaper?</p><ol><li>Turn on Show the graph. Record trials at 2, 4, 6, 8, 10 and 15 mi.</li><li>For each trial, write which company is cheaper.</li></ol><p>Write one sentence: where does the answer flip, and why?</p>',
  honors:'<p><b>Question:</b> How do the fee and the price per mile move the tie point?</p><ol><li>Raise A’s fixed fee by $1 at a time and record the tie point.</li><li>Return it, then raise B’s price per mile by $0.25 at a time and record the tie point.</li></ol><p>Explain each pattern using the slopes and intercepts.</p>',
  ap:'<p><b>Question:</b> Prove the tie point formula.</p><ol><li>Solve a + bm = c + dm for m.</li><li>Check your formula against three settings of the sliders.</li><li>When does the formula fail, and what does the graph look like then?</li></ol><p><b>CER:</b> Claim, evidence from your trials, and reasoning from the algebra.</p>'},
 terms:[
  {t:'Function',d:'A rule that gives exactly one output for each input. Here: one fare for each trip length.'},
  {t:'Slope',d:'How much the output goes up for each 1 unit of input. Here: the price per mile.'},
  {t:'y-intercept',d:'The output when the input is 0. Here: the fixed fee you pay before you go anywhere.'},
  {t:'Point of intersection',d:'Where two lines cross. Both functions have the same output there: the tie point.',lvl:'honors'},
  {t:'Slope-intercept form',d:'y = mx + b, with slope m and y-intercept b.',lvl:'honors'}
 ],
 about:'<p>Each price is a linear function: cost = fixed fee + rate × amount. Velo, Pronto, Flex and Steady are made-up companies and plans, and their prices are made up for illustration.</p><p>Real rideshare fares also charge by the minute, add booking and airport fees, and change with demand, so a real fare is not a perfect line. Real phone plans often have data caps, throttling or unlimited tiers. This is a simplified model, not financial advice.</p>'
};
BioLab.register(SIM);
})();
