(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
const f1=v=>fmtNum(v,1),money=v=>(v<0?'−$':'$')+Math.abs(v).toFixed(2);
/* Last season's orders (made up). Shipping: box weights from the store's scale, to 0.1 lb. Tickets: what buyers typed in the "How many tickets?" box. */
const SHIP=[2.2,1.8,1.4,0.6,1.4,0.7,0.7,2.2,5.1,1.8,5.1,4.4,5.0,1.8,4.6,1.0,0.8,1.5,1.7,0.8,2.5,4.5,0.7,1.4,2.4,1.1,1.8,1.1,1.8,1.3,0.7,0.6,1.9,1.5,1.7,0.6,0.7,4.0,2.1,2.7,2.0,1.6,5.1,2.5,2.9,1.1,0.7,4.8,4.9,5.1,0.6,3.6,1.7,2.2,4.0,1.1,3.6,1.8,11.4,4.8,1.0,1.3,6.8,1.9,2.7,1.9,9.5,1.4,0.7,0.7,4.0,3.9,0.7,2.6,1.5,2.9,1.9,0.8,0.7,2.1,5.1,4.7,1.4,13.0,2.8,1.7,2.8,4.5,0.6,8.1,1.3,4.1,1.4,1.1,2.5,2.2,6.4,1.0,1.8,2.8,2.2,1.4,2.1,3.6,0.6,5.6,3.3,2.3,4.4,1.8,4.6,0.8,1.7,2.9,1.9,1.4,1.7,1.7,7.2,3.4];
const TIX=[2,2,12,6,5,5,2,0,5,1,2,1,4,4,2,3,2,3,5,5,3,1,3,2,2,3,1,2,2,0,4,4,2,3,6,10,4,7,3,2,2,6,2,4,2,1,4,1,3,6,3,4,3,2,8,2,2,4,4,5,2,3,2,2,4,2,2.5,2,2,1,7,-1,1.5,5,2,2,4,6,3,4,6,2,1,3,3,1,1,2,4,1,4,3,1,4,1,1,5,3,2,2];
/* Shipping rules: pieces [lo, hi, lo included, hi included, price]. The carrier bills "weight not over" and takes boxes up to 10 lb. */
const P5=[5.5,7.75,9.25,12.4,16.8];
const SR={A:[[0,1,0,1,5.5],[1,2,1,1,7.75],[2,3,1,1,9.25],[3,5,1,1,12.4],[5,10,1,1,16.8]],
 B:[[0,1,0,1,5.5],[1,2,0,1,7.75],[2,3,0,1,9.25],[3,5,0,1,12.4]],
 C:[[0,1,0,1,5.5],[1,2,0,1,7.75],[2,3,0,1,9.25],[3,5,0,1,12.4],[5,10,0,1,16.8]],
 D:[[0,1,0,1,5.5],[1,2,0,1,7.75],[2,3,0,1,9.25],[3,5,0,1,12.4],[5,Infinity,0,0,16.8]]};
const inP=(x,q)=>(x>q[0]||(q[2]&&Math.abs(x-q[0])<1e-9))&&(x<q[1]||(q[3]&&Math.abs(x-q[1])<1e-9));
const isWhole=x=>Math.abs(x-Math.round(x))<1e-9;
const tc=n=>12*n+3;
const TR={A:x=>[tc(x)],B:x=>isWhole(x)&&x>=1&&x<=8?[tc(x)]:[],C:x=>{if(!isWhole(x)||x<1||x>8)return [];return Math.round(x)===4?[51,45]:[tc(x)];},D:x=>x>=1-1e-9&&x<=8+1e-9?[tc(x)]:[]};
const CASES={ship:{tab:'Shipping',right:'C',orders:SHIP,unit:'lb',x0:0,x1:12,y0:0,y1:20,xt:1,xl:2,yt:5,xlab:'Box weight (lb)',ylab:'Shipping price ($)',xd:2.0,yd:9.25,
  samples:[0.8,2.0,2.7,5.0,6.4,11.4],samplesPh:[2.0,6.4,11.4]},
 tix:{tab:'Tickets',right:'B',orders:TIX,unit:'tickets',x0:-2,x1:10,y0:-40,y1:140,xt:1,xl:1,yt:20,xlab:'Tickets typed in one order',ylab:'Order total ($)',xd:4,yd:39,
  samples:[2,4,0,2.5,-1,10],samplesPh:[4,2.5,-1]}};
function outs(cs,rule,x){if(cs==='ship'){const r=[];SR[rule].forEach(q=>{if(inP(x,q))r.push(q[4]);});return r;}return TR[rule](x);}
const C=sim=>CASES[sim.p.case]||CASES.ship;
/* What goes wrong with one order under a rule, compared with the right rule. */
function judge(cs,rule,x){const o=outs(cs,rule,x),t=outs(cs,CASES[cs].right,x);
 if(o.length>=2)return {ok:false,kind:'two',o};
 if(o.length===0)return t.length?{ok:false,kind:'none',o}:{ok:true,kind:'refuse',o};
 if(!t.length)return {ok:false,kind:'bad',o};
 return Math.abs(o[0]-t[0])<1e-6?{ok:true,kind:'one',o}:{ok:false,kind:'wrong',o};}
const CACHE={};
function tally(cs,rule){const key=cs+rule;if(CACHE[key])return CACHE[key];const T={n:0,two:0,none:0,bad:0,wrong:0,ex:[]};
 CASES[cs].orders.forEach(x=>{const j=judge(cs,rule,x);if(!j.ok){T.n++;T[j.kind]++;if(T.ex.indexOf(x)<0)T.ex.push(x);}});T.ex.sort((a,b)=>a-b);return (CACHE[key]=T);}
const inTxt=(cs,x)=>cs==='ship'?f1(x)+' lb':(isWhole(x)?String(Math.round(x)).replace('-','−'):String(x))+' ticket'+(Math.abs(x-1)<1e-9?'':'s');
const fName=sim=>sim.p.case==='ship'?'f':'C';
function fxText(sim){const cs=sim.p.case,x=sim.p.x,o=outs(cs,sim.p.rule,x),F=fName(sim),xs=cs==='ship'?f1(x):(isWhole(x)?String(Math.round(x)):f1(x)).replace('-','−');
 const head=atLeast('honors')?`${F}(${xs})`:inTxt(cs,x);
 if(o.length>=2)return `${head}: two outputs, ${o.map(money).join(' and ')}. Not a function!`;
 if(!o.length)return `${head}: no output. ${cs==='ship'?(x>10?'Too heavy to ship.':x<=0?'Not a real box.':'The rule has no row for it.'):'Not allowed.'}`;
 return `${head} = ${money(o[0])}`;}
/* Every input that gives output y, as words. */
function sols(cs,rule,y){if(cs==='ship'){const parts=SR[rule].filter(q=>Math.abs(q[4]-y)<0.001).map(q=>q[1]===Infinity?`every weight over ${q[0]} lb`:`every weight ${q[2]?'from':'over'} ${q[0]} ${q[3]?'up to and including':'up to'} ${q[1]} lb`);return {txt:parts.length?parts.join(', and '):'none: no box costs '+money(y),one:null};}
 const ns=[];if(rule==='A'||rule==='D'){const n=(y-3)/12;if(rule==='A'||(n>=1-1e-9&&n<=8+1e-9))return {txt:`n = ${fmtNum(n,isWhole(n)?0:3)}${isWhole(n)?'':' (not a whole number of tickets)'}`,one:n};return {txt:'none in the allowed amounts',one:null};}
 for(let n=1;n<=8;n++)if(outs(cs,rule,n).some(v=>Math.abs(v-y)<0.001))ns.push(n);
 return {txt:ns.length?ns.map(n=>n+' ticket'+(n>1?'s':'')).join(' and '):`none: no order totals ${money(y)}`,one:ns.length===1?ns[0]:null};}
const DOM={ship:{A:'0 < x ≤ 10, but 1, 2, 3 and 5 lb each get two prices',B:'0 < x ≤ 5: boxes over 5 lb have no price',C:'0 < x ≤ 10: every box the carrier takes',D:'x > 0: even boxes the carrier refuses'},
 tix:{A:'every real number, even −1 and 2.5',B:'the whole numbers 1, 2, 3, …, 8',C:'the whole numbers 1 to 8, but 4 has two prices',D:'every number from 1 to 8, even 2.5'}};
const RNG={ship:{A:'$5.50, $7.75, $9.25, $12.40, $16.80',B:'$5.50, $7.75, $9.25, $12.40',C:'$5.50, $7.75, $9.25, $12.40, $16.80',D:'$5.50, $7.75, $9.25, $12.40, $16.80'},
 tix:{A:'every real number, even negative totals',B:'$15, $27, $39, …, $99 (steps of $12)',C:'$15, $27, $39, $45, $51, $63, $75, $87, $99',D:'every amount from $15 to $99'}};
const ISFN={ship:{A:'No: a 2.0 lb box gets two prices.',B:'Yes, but only up to 5 lb.',C:'Yes, for every box up to 10 lb.',D:'Yes, but it prices boxes the carrier will not take.'},
 tix:{A:'Yes, but on a domain that includes −1 and 2.5 tickets.',B:'Yes, on exactly the orders you can sell.',C:'No: 4 tickets gets two prices.',D:'Yes, but it sells parts of tickets.'}};
/* the rule cards on the stage */
const CARD={ship:{A:[['0 to 1 lb','$5.50'],['1 to 2 lb','$7.75'],['2 to 3 lb','$9.25'],['3 to 5 lb','$12.40'],['5 to 10 lb','$16.80']],
  B:[['Up to 1 lb','$5.50'],['Over 1, up to 2 lb','$7.75'],['Over 2, up to 3 lb','$9.25'],['Over 3, up to 5 lb','$12.40']],
  C:[['Up to 1 lb','$5.50'],['Over 1, up to 2 lb','$7.75'],['Over 2, up to 3 lb','$9.25'],['Over 3, up to 5 lb','$12.40'],['Over 5, up to 10 lb','$16.80']],
  D:[['Up to 1 lb','$5.50'],['Over 1, up to 2 lb','$7.75'],['Over 2, up to 3 lb','$9.25'],['Over 3, up to 5 lb','$12.40'],['Over 5 lb','$16.80']]},
 tix:{A:[['Total = $12 × number typed'],['+ $3 fee per order'],[''],['Any number can be typed.']],
  B:[['Total = $12 × tickets'],['+ $3 fee per order'],[''],['Tickets: whole numbers'],['from 1 to 8 only.']],
  C:[['1 ticket','$15'],['2 tickets','$27'],['3 tickets','$39'],['4 tickets','$51'],['Family 4-pack','$45'],['5 tickets','$63'],['6 tickets','$75'],['7 tickets','$87'],['8 tickets','$99']],
  D:[['Total = $12 × tickets'],['+ $3 fee per order'],[''],['Tickets: slide to any'],['amount from 1 to 8.']]}};
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const mathOn=sim=>{const S=sim.gutS;return !!(S&&S.m&&S.m.cs===sim.p.case);};
function caseChange(sim){const c=C(sim);sim.p.rule='A';sim.p.x=c.xd;sim.p.y=c.yd;if(sim.ui&&sim.ui.ctl)['rule','x','y'].forEach(id=>{if(sim.ui.ctl[id])sim.ui.ctl[id].set(sim.p[id]);});
 if(sim.gutS&&(sim.gutS.g||sim.gutS.m)&&!sim._gutBusy&&!(sim.guide&&sim.guide.keep)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* stage layout */
const GL=366,GR=782,GT=26,GB=292;
function gmap(c){return {X:x=>GL+(x-c.x0)/(c.x1-c.x0)*(GR-GL),Y:y=>GB-(y-c.y0)/(c.y1-c.y0)*(GB-GT)};}
function dot(ctx,x,y,filled,col){ctx.beginPath();ctx.arc(x,y,5.5,0,7);if(filled){ctx.fillStyle=col;ctx.fill();}else{ctx.fillStyle=PAL['cv-bg'];ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.stroke();}}
function drawRule(ctx,c,cs,rule,M,col){ctx.save();ctx.beginPath();ctx.rect(GL,GT-8,GR-GL,GB-GT+16);ctx.clip();
 if(cs==='ship'){SR[rule].forEach(q=>{const x2=q[1]===Infinity?c.x1:q[1];ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(M.X(q[0]),M.Y(q[4]));ctx.lineTo(M.X(x2),M.Y(q[4]));ctx.stroke();
   if(q[0]>0)dot(ctx,M.X(q[0]),M.Y(q[4]),q[2],col);else dot(ctx,M.X(0),M.Y(q[4]),false,col);if(q[1]!==Infinity)dot(ctx,M.X(q[1]),M.Y(q[4]),q[3],col);
   else{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(M.X(c.x1),M.Y(q[4]));ctx.lineTo(M.X(c.x1)-10,M.Y(q[4])-6);ctx.lineTo(M.X(c.x1)-10,M.Y(q[4])+6);ctx.closePath();ctx.fill();}});}
 else if(rule==='A'){ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(M.X(c.x0),M.Y(tc(c.x0)));ctx.lineTo(M.X(c.x1),M.Y(tc(c.x1)));ctx.stroke();}
 else if(rule==='D'){ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(M.X(1),M.Y(15));ctx.lineTo(M.X(8),M.Y(99));ctx.stroke();dot(ctx,M.X(1),M.Y(15),true,col);dot(ctx,M.X(8),M.Y(99),true,col);}
 else{for(let n=1;n<=8;n++)outs(cs,rule,n).forEach(v=>dot(ctx,M.X(n),M.Y(v),true,col));}
 ctx.restore();}

const SIM={
 id:'checkout',hash:'checkout',apUnit:6,order:0.5,tab:'Checkout rules: is it a function?',kind:'Simulation',next:['cipher','pondday'],
 card:'Pick the shipping table and ticket rule you would put on your club’s online store, then run last season’s orders through them and see which ones the checkout chokes on.',
 title:'Your club’s checkout: one price per order',
 lede:{bio:'A checkout turns every order into a price. Each order (the input) must get exactly one price (the output), and only real orders should get one at all. A rule that gives two prices, or prices an order that makes no sense, breaks the checkout.',
  honors:'A function assigns each input in its domain exactly one output. The vertical line test checks it on a graph: a vertical line at any input may cross the graph at most once. f(3) plugs in an input; f(x) = 9.25 asks which inputs give that output.',
  ap:'The domain is the set of inputs the rule should accept; the range is the outputs it actually produces. A function has an inverse, an undo, only if no two inputs share an output. Then the inverse’s domain is the original range, and its range is the original domain.'},
 scale:'Last season’s orders, made up but realistic: 120 boxes of spirit wear weighed to 0.1 lb, and 100 ticket orders exactly as buyers typed them.',
 aspect:16/9,timeless:true,trials:false,graph:true,
 controlsTitle:'The checkout',
 controls:[
  {id:'case',label:'What the checkout prices',type:'seg',def:'ship',noGut:true,onChange:caseChange,options:[{v:'ship',l:'Shipping by weight'},{v:'tix',l:'Event tickets'}]},
  {id:'rule',label:'The rule the checkout uses',type:'seg',def:'A',options:[{v:'A',l:'Rule A'},{v:'B',l:'Rule B'},{v:'C',l:'Rule C'},{v:'D',l:'Rule D'}]},
  {id:'x',label:'Test an input',type:'range',min:-2,max:14,step:0.1,def:2,unit:'',noGut:true,help:'Draws a vertical line at this input and reads off every output the rule gives.'},
  {id:'y',label:'Find an output',type:'range',min:0,max:130,step:0.05,def:9.25,unit:' $',noGut:true,lvl:'honors',help:'Draws a horizontal line at this price and finds every input that gives it.'}
 ],
 actions:[{id:'best',label:'Use the rule that works',lvl:'honors',run(sim){BioLab.setValues(sim,{rule:C(sim).right});}}],
 init(){return {};},step(){},
 onLevel(sim){const b=!atLeast('honors'),U=sim.ui.ctlW;if(!U)return;
  const set=(id,l,h)=>{const w=U[id];if(!w)return;const Lb=w.querySelector('label');if(Lb)Lb.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('x',b?'Try an order':'Test an input',b?'Draws a straight up-and-down line at this order and reads off every price the rule gives it.':'Draws a vertical line at this input and reads off every output the rule gives.');},
 metrics:[
  {id:'err',label:'Last season’s orders that go wrong',unit:'',d:0,min:0,max:null,get:sim=>tally(sim.p.case,sim.p.rule).n},
  {id:'fx',label:'Your test order',text:true,get:fxText},
  {id:'fxv',label:'Its one price',unit:'$',d:2,min:0,max:null,lvl:'honors',get:sim=>{const o=outs(sim.p.case,sim.p.rule,sim.p.x);return o.length===1?o[0]:null;}},
  {id:'isfn',label:'Is this rule a function?',text:true,get:sim=>ISFN[sim.p.case][sim.p.rule]},
  {id:'dom',label:'Domain: inputs this rule accepts',text:true,lvl:'honors',get:sim=>DOM[sim.p.case][sim.p.rule]},
  {id:'rng',label:'Range: outputs it gives',text:true,lvl:'honors',get:sim=>RNG[sim.p.case][sim.p.rule]},
  {id:'sol',label:'Inputs that give the output you picked',text:true,lvl:'honors',get:sim=>{const s=sols(sim.p.case,sim.p.rule,sim.p.y);return (atLeast('ap')?'Undo it: ':'')+s.txt;}},
  {id:'solv',label:'The one input that gives it',unit:'',d:2,lvl:'ap',min:null,max:null,get:sim=>sols(sim.p.case,sim.p.rule,sim.p.y).one}
 ],
 graphs:[{id:'errs',label:'Orders that go wrong, by rule',custom:true}],defaultGraph:'errs',
 plot(sim,ctx,box){const cs=sim.p.case,rs=['A','B','C','D'],v=rs.map(r=>tally(cs,r).n),top=Math.max(5,Math.ceil(Math.max(...v)/5)*5);
  const ax=axes(ctx,box,{xmin:0,xmax:4,ymin:0,ymax:top,xl:'Rule',xcats:rs.map(r=>'Rule '+r),yl:'Orders that go wrong (of '+C(sim).orders.length+')'});
  rs.forEach((r,i)=>{const x0=ax.X(i+0.2),x1=ax.X(i+0.8);ctx.fillStyle=r===sim.p.rule?PAL['rj']:PAL['s2'];ctx.globalAlpha=r===sim.p.rule?1:.6;ctx.fillRect(x0,ax.Y(v[i]),x1-x0,ax.Y(0)-ax.Y(v[i]));ctx.globalAlpha=1;
   txt(ctx,String(v[i]),(x0+x1)/2,ax.Y(v[i])-6,{s:13,w:700,c:PAL['cv-ink'],a:'center'});});},
 draw(sim,ctx,vdt,k){const cs=sim.p.case,c=C(sim),M=gmap(c),rule=sim.p.rule,gp=gutPhase(sim),G=sim.gutS,kk=Math.min(k,1.45);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* the rule card */
  const rows=CARD[cs][rule];ctx.fillStyle=PAL['card'];ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.rect(14,14,306,296);ctx.fill();ctx.stroke();
  txt(ctx,'Rule '+rule+(cs==='ship'?': shipping price':': order total'),26,40,{s:15*kk,w:700,c:PAL['rj']});
  let y=40+30*kk;const lh=Math.min(32*kk,(284-y)/Math.max(1,rows.length-1)),fs=Math.min(13*kk,lh-5);
  rows.forEach((r,i)=>{txt(ctx,r[0],26,y+i*lh,{s:fs,c:PAL['cv-ink']});if(r[1])txt(ctx,r[1],308,y+i*lh,{s:fs,w:700,c:PAL['cv-ink'],a:'right'});});
  txt(ctx,cs==='ship'?'The carrier takes boxes up to 10 lb.':'$12 a ticket, $3 fee, 8 per order max.',26,300,{s:12*kk,c:PAL['cv-soft']});
  /* graph */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.6;
  for(let x=Math.ceil(c.x0/c.xt)*c.xt;x<=c.x1+1e-9;x+=c.xt){ctx.beginPath();ctx.moveTo(M.X(x),GT);ctx.lineTo(M.X(x),GB);ctx.stroke();}
  for(let v=Math.ceil(c.y0/c.yt)*c.yt;v<=c.y1+1e-9;v+=c.yt){ctx.beginPath();ctx.moveTo(GL,M.Y(v));ctx.lineTo(GR,M.Y(v));ctx.stroke();}ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(M.X(Math.max(0,c.x0)),GT);ctx.lineTo(M.X(Math.max(0,c.x0)),GB);ctx.moveTo(GL,M.Y(Math.max(0,c.y0)));ctx.lineTo(GR,M.Y(Math.max(0,c.y0)));ctx.stroke();
  const xs=c.xl*(k>1.3&&cs==='tix'?2:1);for(let x=Math.ceil(c.x0/xs)*xs;x<=c.x1+1e-9;x+=xs)txt(ctx,String(x).replace('-','−'),M.X(x),GB+15*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  const ys=c.yt*(k>1.3?2:1);for(let v=Math.ceil(c.y0/ys)*ys;v<=c.y1+1e-9;v+=ys)txt(ctx,(v<0?'−$':'$')+Math.abs(v),GL-5,M.Y(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});
  if(k>1.3)txt(ctx,c.xlab,GR-4,GB-6,{s:12*k,w:700,c:PAL['cv-soft'],a:'right'});else txt(ctx,c.xlab,(GL+GR)/2,GB+31*k,{s:12*k,w:700,c:PAL['cv-soft'],a:'center'});
  if(cs==='ship'){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(M.X(10),GT);ctx.lineTo(M.X(10),GB);ctx.stroke();ctx.setLineDash([]);txt(ctx,'Carrier limit',M.X(10)-4,GT+14*k,{s:12*k,w:700,c:PAL['s1'],a:'right'});}
  drawRule(ctx,c,cs,rule,M,PAL['s2']);
  /* the test lines */
  if(!gp){const x=sim.p.x,o=outs(cs,rule,x),inW=x>=c.x0&&x<=c.x1;
   if(inW){ctx.strokeStyle=o.length>=2?PAL['s1']:PAL['rj'];ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(M.X(x),GT);ctx.lineTo(M.X(x),GB);ctx.stroke();ctx.setLineDash([]);
    o.forEach(v=>{if(v>=c.y0&&v<=c.y1){ctx.strokeStyle=o.length>=2?PAL['s1']:PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(M.X(x),M.Y(v),10,0,7);ctx.stroke();}});
    const lab=o.length>=2?'Two prices!':o.length?money(o[0]):'No price',right=M.X(x)>GR-120,vis=o.filter(v=>v>=c.y0&&v<=c.y1);
    const py=vis.length?vis.reduce((a,b)=>a+M.Y(b),0)/vis.length:(GT+GB)/2;
    pill(ctx,lab,clamp(M.X(x)+(right?-58:58),GL+50,GR-50),clamp(py-22*kk,GT+14,GB-14),o.length===1?PAL['rj']:PAL['s1'],'#fff',13*kk);}
   if(atLeast('honors')){const yv=sim.p.y;if(yv>=c.y0&&yv<=c.y1){ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(GL,M.Y(yv));ctx.lineTo(GR,M.Y(yv));ctx.stroke();ctx.setLineDash([]);
    txt(ctx,fName(sim)+(cs==='ship'?'(x)':'(n)')+' = '+money(yv),GR-4,M.Y(yv)-6,{s:12*k,w:700,c:PAL['s5'],a:'right'});}}}
  /* last season's orders */
  const sy=358,ph=k>1.3,SM=ph?c.samplesPh:c.samples;txt(ctx,gp?'Some of last season’s orders: which ones would this rule get wrong?':'Some of last season’s orders, run through Rule '+rule,14,sy-8,{s:12*k,w:700,c:PAL['cv-ink']});
  const n=SM.length,bw=(800-28-(n-1)*8)/n;
  SM.forEach((x,i)=>{const bx=14+i*(bw+8),j=judge(cs,rule,x);ctx.fillStyle=PAL['card'];ctx.strokeStyle=gp?PAL['line']:(j.ok?PAL['s3']:PAL['s1']);ctx.lineWidth=gp?1:2.5;ctx.beginPath();ctx.rect(bx,sy,bw,86);ctx.fill();ctx.stroke();
   txt(ctx,inTxt(cs,x),bx+bw/2,sy+(ph?30:21)*k,{s:14*Math.min(k,1.45),w:700,c:PAL['cv-ink'],a:'center'});
   let r1,r2;if(gp){r1='?';r2='';}else if(j.kind==='two'){r1=j.o.map(money).join(' / ');r2='Two prices!';}else if(j.kind==='none'){r1='No price';r2='Can’t check out';}else if(j.kind==='refuse'){r1=cs==='ship'?'Won’t ship':'Refused';r2='Correct';}else if(j.kind==='bad'){r1=money(j.o[0]);r2=cs==='ship'?'Carrier refuses':'Should refuse';}else if(j.kind==='wrong'){r1=money(j.o[0]);r2='Wrong price';}else{r1=money(j.o[0]);r2='OK';}
   if(ph){const r=gp?'?':(j.ok?r1:r2);txt(ctx,r,bx+bw/2,sy+66*Math.min(k,1.2),{s:12*k,w:700,c:gp?PAL['cv-ink']:(j.ok?PAL['s3']:PAL['s1']),a:'center'});}
   else{txt(ctx,r1,bx+bw/2,sy+45,{s:r1.length>12?12:13,c:PAL['cv-ink'],a:'center'});if(r2)txt(ctx,r2,bx+bw/2,sy+68,{s:12,w:700,c:j.ok?PAL['s3']:PAL['s1'],a:'center'});}});
  if(G&&G.g&&G.g.cs===cs&&G.g.rule!==rule&&!gp)txt(ctx,'Your gut: Rule '+G.g.rule,GR,GT-8,{s:12*k,w:700,c:PAL['s4'],a:'right'});},
 narrate(sim){const cs=sim.p.case,r=sim.p.rule,T=tally(cs,r),N=C(sim).orders.length,x=sim.p.x,o=outs(cs,r,x);
  if(o.length>=2)return `<b>${inTxt(cs,x)} gets two prices</b> from Rule ${r}: ${o.map(money).join(' and ')}. The vertical line at this input crosses the graph twice, so Rule ${r} is not a function and the checkout can’t pick a price.`;
  if(T.n===0)return `<b>Rule ${r} works.</b> Every one of last season’s ${N} orders gets exactly one ${cs==='ship'?'price, and boxes the carrier won’t take get none':'total, and every impossible entry is refused'}. That is a function on the right domain.`;
  const why=T.two?`${T.two} order${T.two>1?'s':''} get two prices`:T.none?`${T.none} real order${T.none>1?'s':''} get no price`:T.bad?`${T.bad} order${T.bad>1?'s':''} that should be refused get a price`:`${T.wrong} orders get the wrong price`;
  return `Rule ${r} gets <b>${T.n} of last season’s ${N} orders wrong</b>: ${why}. ${T.two?'Every input needs exactly one output.':'The rule’s domain does not match the orders that can really happen.'}`;},
 gut:{better:'lower',controls:['rule'],
  ask:{bio:'Four people wrote rules for your checkout. Click through Rule A to Rule D here and look at each one’s table and graph. Pick the one you think gives every real order exactly one price, then lock it in.',
   honors:'Pick the rule here that you think is a function on the right domain, by looking at the tables and graphs, without testing inputs. Then lock it in.'},
  lockLabel:'Lock in my rule',
  lock(sim){const T=tally(sim.p.case,sim.p.rule),N=C(sim).orders.length;return {v:T.n,cs:sim.p.case,rule:sim.p.rule,label:`Rule ${sim.p.rule}: ${T.n} of ${N} orders go wrong`};},
  solve(sim){const c=C(sim);sim.p.rule=c.right;const T=tally(sim.p.case,c.right);return {v:T.n,cs:sim.p.case,rule:c.right,label:`Rule ${c.right}: ${T.n} of ${c.orders.length} orders go wrong`};},
  how:{bio:'The math checks two things for every rule. First: does any order get two prices? Draw a straight up-and-down line at each possible order; if it ever hits the graph twice, the rule fails. Second: does the rule price exactly the orders that can really happen, no more and no fewer? Only one rule passes both.',
   honors:'Vertical line test: a relation is a function when every vertical line meets its graph at most once, so watch the open and closed dots at each boundary. Then compare the rule’s domain with the real domain: 0 < x ≤ 10 lb for boxes, the whole numbers 1 to 8 for tickets.',
   ap:'A function needs exactly one output per input on the right domain. For tickets, C(n) = 12n + 3 on {1, …, 8} is also one-to-one, so it has an inverse n = (C − 3)/12 whose domain is the range {15, 27, …, 99}. The shipping rule is not one-to-one, so it has no inverse.'},
  compare(sim,g,m){const cs=g.cs,N=CASES[cs].orders.length,T=tally(cs,g.rule);
   if(g.v===0)return `Your gut was right on: Rule ${g.rule} gives all ${N} of last season’s orders exactly one ${cs==='ship'?'price':'total'}. You already read the open and closed dots and the domain the way the math does.`;
   let d='';
   if(cs==='ship'){if(T.two)d=`<b>${T.two} of last season’s ${N} boxes</b> weighed exactly ${T.ex.map(x=>f1(x)).join(', ').replace(/, ([^,]*)$/,' or $1')} lb, where Rule ${g.rule} lists two prices. Those customers would have been stuck at checkout.`;
    else if(T.none)d=`Rule ${g.rule} has no price for boxes over 5 lb, so <b>${T.none} of last season’s ${N} orders</b> (the big team orders) could not check out at all.`;
    else if(T.bad)d=`Rule ${g.rule} never stops, so it charged shipping on <b>${T.bad} box${T.bad>1?'es':''} over 10 lb</b> (${T.ex.map(x=>f1(x)).join(' and ')} lb) that the carrier will not take. You would have to repack and pay to ship them again.`;}
   else{if(T.two)d=`<b>${T.two} of last season’s ${N} orders were for 4 tickets</b>, and Rule ${g.rule} lists two totals for 4: $51 and $45. The checkout can’t choose, and the family-pack deal belongs on its own line.`;
    else if(g.rule==='A')d=`Rule ${g.rule} accepts any number, so <b>${T.bad} impossible entries</b> went through: −1 ticket became a ${money(-tc(-1))} refund, two orders of 0 tickets paid the $3 fee for nothing, orders for 2.5 and 1.5 tickets went through, and orders of 10 and 12 broke the 8-ticket limit.`;
    else d=`Rule ${g.rule} lets the amount slide anywhere from 1 to 8, so <b>${T.bad} orders bought part of a ticket</b> (${T.ex.join(' and ')} tickets). Tickets only come in whole numbers: the domain is discrete.`;}
   return `With Rule ${m.rule}, all ${N} orders get exactly one ${cs==='ship'?'price':'total'}, and the impossible ones are refused. With your Rule ${g.rule}, <b>${g.v} go wrong</b>. ${d}`;},
  again(sim){sim.p.case=sim.p.case==='ship'?'tix':'ship';const c=C(sim);sim.p.rule='A';sim.p.x=c.xd;sim.p.y=c.yd;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A shipping table lists “1 to 2 lb: $7.75” and “2 to 3 lb: $9.25”. A box weighs exactly 2.0 lb. What happens at checkout?',choices:['It costs $7.75','It costs $9.25','It gets two prices, so the rule is not a function','It gets no price'],correct:2,explain:'“1 to 2” and “2 to 3” both include 2, so a 2.0 lb box matches two rows. A vertical line at 2 crosses the graph twice. Writing “over 1, up to 2” and “over 2, up to 3” gives every weight exactly one row.'},
  {lvl:'bio',instant:true,q:'Your ticket form asks “How many tickets?” Tickets are $12 each plus a $3 fee, at most 8 per order. Which inputs should the form accept?',choices:['Any number','Any number from 1 to 8, like 2.5','Whole numbers from 1 to 8','Whole numbers from 0 to 8'],correct:2,explain:'You can’t buy part of a ticket, a negative number of tickets, or more than the limit. An order of 0 tickets is not an order, and it would charge the $3 fee for nothing. So the domain is the whole numbers 1 to 8: a discrete domain.'},
  {lvl:'honors',instant:true,q:'f is the carrier’s shipping rule. What does the equation f(x) = 9.25 ask?',choices:['What a 9.25 lb box costs','Which box weights cost $9.25','What f times 9.25 is','The price of a 3 lb box'],correct:1,explain:'In f(x) = 9.25 the output is given and you solve for the input: every weight over 2 lb up to and including 3 lb. f(9.25) would be the price of a 9.25 lb box: $16.80. f(3) = 9.25 is one true fact; f(x) = 9.25 has a whole interval of answers.'},
  {lvl:'honors',instant:true,q:'A ticket table pairs 1 → $15, 2 → $27, 3 → $39, 4 → $51 and 4 → $45. Is it a function from tickets to total?',choices:['Yes: every total comes from only one ticket count','No: the input 4 has two outputs','Yes: it has a different output for each row','No: $45 is not a multiple of 12'],correct:1,explain:'A function can’t give one input two outputs. 4 tickets maps to both $51 and $45. Two different inputs sharing an output would be fine for a function; it would only stop the function from having an inverse.'},
  {lvl:'ap',instant:true,q:'C(n) = 12n + 3 for n in {1, 2, …, 8}. A payment of $60 comes in. What does the inverse say?',choices:['5 tickets','4.75 tickets','$60 is not in the domain of the inverse, so the payment is wrong','4 tickets'],correct:2,explain:'The inverse undoes C: n = (60 − 3)/12 = 4.75, which is not an allowed number of tickets. The inverse’s domain is C’s range, {15, 27, 39, 51, 63, 75, 87, 99}, and $60 is not in it. Flag the payment and ask the buyer.'},
  {lvl:'ap',instant:true,q:'Why does the shipping rule have no inverse?',choices:['It is not a function','Many different weights share each price, so a price can’t tell you the weight','Its domain is not all real numbers','Its graph has open dots'],correct:1,explain:'It is a function, but not one-to-one: every weight over 2 up to 3 lb costs $9.25. A horizontal line at $9.25 meets the graph along a whole segment, so “undo $9.25” has no single answer.'}
 ],
 tour:[
  {title:'The checkout’s job',text:{bio:'Your club sells spirit wear online. The checkout weighs each box (the input) and charges a shipping price (the output). Every box must get exactly one price.',honors:'Your club sells spirit wear online. The checkout weighs each box (the input x) and charges a shipping price f(x) (the output). A rule that gives every input exactly one output is a function.'},pause:true,setup:sim=>BioLab.setValues(sim,{case:'ship',rule:'A',x:0.8,y:9.25}),focus:[[8,8,330,308],[340,14,450,306]]},
  {title:'Rule A looks fine',text:'Rule A reads “1 to 2 lb” and “2 to 3 lb”, like most tables you have seen. Now test a box that weighs exactly 2.0 lb. The straight up-and-down line at 2.0 hits the graph twice: $7.75 and $9.25.',pause:true,setup:sim=>BioLab.setValues(sim,{rule:'A',x:2}),focus:sim=>{const M=gmap(CASES.ship);return [M.X(2)-40,GT-6,80,GB-GT+12];}},
  {title:'The vertical line test',text:{bio:'If any up-and-down line crosses a graph twice, some input gets two outputs, and the rule is not a function. Rule C says “over 1, up to 2”. The filled dot means “included”, the open dot means “not included”, so 2.0 lb gets only $7.75.',honors:'If any vertical line crosses a graph twice, some input has two outputs: not a function. In Rule C a filled dot means the endpoint is included and an open dot means it is not, so the line at x = 2 meets the graph once: f(2) = 7.75.'},pause:true,setup:sim=>BioLab.setValues(sim,{rule:'C',x:2})},
  {title:'The domain: which orders are real',text:{bio:'The carrier takes boxes over 0 lb and up to 10 lb. Rule B stops at 5 lb, so a 6.4 lb team order gets no price at all. Rule D never stops, so it prices an 11.4 lb box the carrier will refuse.',honors:'The carrier takes 0 < x ≤ 10 lb, so that is the domain the rule needs. Rule B’s domain stops at 5 lb: a 6.4 lb box has no output. Rule D’s domain never stops: it prices an 11.4 lb box the carrier will refuse.'},pause:true,setup:sim=>BioLab.setValues(sim,{rule:'B',x:6.4})},
  {title:'The range: only five prices',text:'Boxes can weigh any amount up to 10 lb, but Rule C only ever charges five prices: $5.50, $7.75, $9.25, $12.40 or $16.80. The inputs form a continuous interval; the outputs are just five values.',pause:true,setup:sim=>BioLab.setValues(sim,{rule:'C',x:3})},
  {title:'Read it both ways',text:{bio:'Go up from 3 lb to the graph: a 3 lb box costs $9.25. Now go the other way, across from $9.25: every box over 2 lb, up to 3 lb, costs $9.25. Same graph, two different questions.',honors:'f(3) = 9.25: plug in the input 3 and read the output. f(x) = 9.25 is the other question: which inputs give 9.25? The horizontal line at $9.25 meets the graph along a whole step: every x with 2 < x ≤ 3.'},pause:true,setup:sim=>BioLab.setValues(sim,{rule:'C',x:3,y:9.25})},
  {title:'Tickets come in whole numbers',text:{bio:'Now the ticket form: $12 a ticket plus a $3 fee, 8 per order at most. Rule B’s graph is just eight dots, because you can only buy 1, 2, 3, … 8 tickets. A line between the dots would sell 2.5 tickets.',honors:'C(n) = 12n + 3 on the domain {1, 2, …, 8} is a discrete function: its graph is eight dots, and its range is {15, 27, …, 99}. C(3) = 39, and C(n) = 39 means n = 3.'},pause:true,setup:sim=>BioLab.setValues(sim,{case:'tix',rule:'B',x:3,y:39})},
  {lvl:'ap',title:'Undo it: the inverse',text:'A buyer’s payment tells you their order: n = (C − 3)/12 undoes C(n) = 12n + 3, steps in reverse order. Its domain is C’s range, {15, 27, …, 99}, so a $60 payment is a mistake to flag: (60 − 3)/12 = 4.75 tickets. The shipping rule has no inverse: one price, many weights. The Codes and inverse functions tool goes further with undoing.',pause:true,setup:sim=>BioLab.setValues(sim,{case:'tix',rule:'B',x:3,y:60})}
 ],
 lab:{bio:'<p><b>Question:</b> What makes a checkout rule work?</p><ol><li>For each rule, move <b>Try an order</b> across the whole graph. Write down any order that gets two prices or no price.</li><li>Switch to <b>Event tickets</b> and try 0, −1, 2.5, 4 and 10.</li><li>Check your list against <b>Last season’s orders that go wrong</b>.</li></ol><p>Write one sentence: what two things must a rule get right?</p>',
  honors:'<p><b>Question:</b> Can you tell a function from its graph alone?</p><ol><li>For each rule, write its domain and range in your own notation, then compare with the readouts.</li><li>Use the vertical line test on every boundary of Rules A to D.</li><li>Pick three prices and use <b>Find an output</b> to solve f(x) = price. Which give one input, which give many, and which give none?</li></ol>',
  ap:'<p><b>Question:</b> Which rules have inverses?</p><ol><li>For the ticket rules, write C⁻¹ and its domain. Test it with payments of $39, $45 and $99.</li><li>Explain, using the horizontal line test, why the shipping rule has none.</li><li>Could you restrict the shipping rule’s domain so it does have an inverse? What would that domain be useful for?</li></ol><p><b>CER:</b> Claim, evidence from the readouts, and reasoning about one-to-one functions.</p>'},
 terms:[
  {t:'Input and output',d:'What you put in (a box’s weight, a ticket count) and what the rule gives back (a price, a total).'},
  {t:'Function',d:'A rule that gives every input in its domain exactly one output.'},
  {t:'Vertical line test',d:'A graph is a function if no vertical line crosses it more than once. Two crossings means one input has two outputs.'},
  {t:'Domain and range',d:'Domain: every input the rule should accept. Range: every output it actually gives.'},
  {t:'Discrete and continuous domains',d:'Discrete: separate values you can count, like 1, 2, 3 tickets; the graph is dots. Continuous: every value in an interval, like any weight up to 10 lb.'},
  {t:'Function notation',d:'f(3) is the output when the input is 3. f(x) = 3 asks which inputs give the output 3.',lvl:'honors'},
  {t:'One-to-one',d:'No two inputs share an output. It passes the horizontal line test.',lvl:'ap'},
  {t:'Inverse function',d:'The function that undoes another: f⁻¹(f(x)) = x. Its domain is f’s range and its range is f’s domain. Only one-to-one functions have one.',lvl:'ap'}
 ],
 about:'<p><b>Shipping:</b> the carrier’s rule is the “weight not over” table: up to 1 lb $5.50, over 1 up to 2 lb $7.75, over 2 up to 3 lb $9.25, over 3 up to 5 lb $12.40, over 5 up to 10 lb $16.80, and it refuses boxes over 10 lb. Real carriers round the weight up and bill by “weight not over” tables like this, but these prices and the 10 lb limit are made up. <b>Tickets:</b> $12 a ticket plus a $3 fee per order, whole numbers from 1 to 8. Made-up prices.</p><p>An order <b>goes wrong</b> when the rule gives it two outputs, gives no output to an order the right rule accepts, gives an output to an order that should be refused (a box over 10 lb, 0 or −1 tickets, 2.5 tickets, more than 8), or gives a different price. Last season’s 120 boxes and 100 ticket orders are made up for this tool, including a few typos in the ticket box. Simplified: real checkouts also handle sales tax, discounts and shipping zones. This is a model for learning, not business advice.</p>'
};
SIM.thumbSetup=sim=>{BioLab.setValues(sim,{case:'ship',rule:'A',x:2,y:9.25});};
BioLab.register(SIM);
})();
