(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,bars,atLeast}=BioLab.h;
/* Area model: a square x ft on a side grows a ft one way and b ft the other way. New area (x + a)(x + b) = x² + ax + bx + ab. */
const PROJ={patio:{thing:'patio',mat:'pavers'},room:{thing:'room',mat:'flooring'},lawn:{thing:'lawn',mat:'sod'}};
const B=sim=>atLeast('honors')?sim.p.b:sim.p.a;
const need=sim=>{const x=sim.p.x,a=sim.p.a,b=B(sim);return (a+b)*x+a*b;};
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.pieces||(GS(sim)&&GS(sim).m));
const n0=v=>Math.round(v).toLocaleString('en-US');
const usd=v=>'$'+Math.round(v).toLocaleString('en-US');
const X0=96,Y0=86,WMAX=420,HMAX=330;
function geo(sim){const x=sim.p.x,a=sim.p.a,b=B(sim),s=Math.min(WMAX/(x+a),HMAX/(x+b),26);return {x,a,b,s,X:X0,Y:Y0,xs:x*s,as:a*s,bs:b*s};}

const SIM={
 id:'areamodel',hash:'areamodel',apUnit:3,order:1,tab:'Area models',kind:'Simulation',
 card:'Guess how much more material a bigger patio needs, then split the new area into pieces to see what your gut missed.',
 title:'How much more do you need?',
 lede:{bio:'Make a square patio 3 ft bigger each way and it feels like you need 3 × 3 = 9 more square feet. The area model shows the two long strips that guess leaves out.',
  honors:'Multiplying two binomials is finding the area of a rectangle cut into four pieces: (x + a)(x + b) = x² + ax + bx + ab.',
  ap:'The extra area is (a + b)x + ab. The strips grow with x, and only the corner stays fixed, so the bigger the original square, the worse the “just the corner” guess gets.'},
 scale:'Seen from above, drawn to scale. Lengths are in feet; areas in square feet (sq ft).',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your project',
 controls:[
  {id:'proj',label:'Project',type:'seg',def:'patio',options:[{v:'patio',l:'Patio'},{v:'room',l:'Room'},{v:'lawn',l:'Lawn'}]},
  {id:'x',label:'Side of the square now (x)',type:'range',min:8,max:24,step:1,def:12,unit:' ft',noGut:true},
  {id:'a',label:'Add this much one way (a)',type:'range',min:1,max:6,step:1,def:3,unit:' ft',noGut:true,help:'At Big picture, the square grows by the same amount both ways.'},
  {id:'b',label:'Add this much the other way (b)',type:'range',min:1,max:6,step:1,def:3,unit:' ft',noGut:true,lvl:'honors'},
  {id:'price',label:'Material price: dollars per square foot',type:'range',min:1,max:20,step:1,def:8,unit:'',noGut:true,lvl:'honors',help:'An assumption for illustration. Real prices vary a lot by material and place.'},
  {id:'order',label:'Your order: extra square feet',type:'range',min:0,max:400,step:1,def:20,unit:' sq ft'},
  {id:'pieces',label:'Show the area model',type:'toggle',def:false,help:'Splits the new area into the old square, two strips and a corner.'}
 ],
 init(){return {};},step(){},
 onLevel(sim){const h=atLeast('honors'),set=(id,t,hp)=>{const w=sim.ui.ctlW&&sim.ui.ctlW[id];if(!w)return;const L=w.querySelector('.lbl,label');if(L)L.textContent=t;const H=w.querySelector('.help');if(H&&hp!==undefined)H.textContent=hp;};
  set('x',h?'Side of the square now (x)':'Side of the square now');set('a',h?'Add this much one way (a)':'Add this much on each side',h?'At Big picture, the square grows by the same amount both ways.':'The square grows by the same amount both ways.');},
 metrics:[
  {id:'need',label:'Extra area needed',unit:'sq ft',d:0,min:0,max:null,get:sim=>shown(sim)?need(sim):null},
  {id:'total',label:'New total area',unit:'sq ft',d:0,min:0,max:null,lvl:'honors',get:sim=>shown(sim)?(sim.p.x+sim.p.a)*(sim.p.x+B(sim)):null},
  {id:'cost',label:'Cost of the extra material',unit:'dollars',d:0,min:0,max:null,lvl:'honors',get:sim=>shown(sim)?need(sim)*sim.p.price:null},
  {id:'off',label:'Your order is off by',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.order-need(sim))*sim.p.price:null},
  {id:'expand',label:'The area model',text:true,get:sim=>{if(!shown(sim))return 'Hidden until you lock in your gut or turn on the area model.';const x=sim.p.x,a=sim.p.a,b=B(sim);
   return `(${x} + ${a})(${x} + ${b}) = ${x*x} + ${a*x} + ${b*x} + ${a*b}`;}}
 ],
 graphs:[{id:'pieces',label:'Where the extra area goes',custom:true}],defaultGraph:'pieces',
 plot(sim,ctx,box){const x=sim.p.x,a=sim.p.a,b=B(sim),sh=shown(sim),N=need(sim);
  const vals=sh?[a*x,b*x,a*b,N,sim.p.order]:[NaN,NaN,NaN,NaN,sim.p.order];
  const top=Math.max(20,Math.ceil(Math.max(N,sim.p.order)*1.15/10)*10);
  const ax=axes(ctx,box,{xmin:0,xmax:5,ymin:0,ymax:top,xcats:['ax','bx','ab','Need','Order'],yl:'Square feet'});
  bars(ctx,ax,vals,{colors:[PAL['s2'],PAL['s3'],PAL['s5'],PAL['g-line'],PAL['s4']]});
  if(!sh)txt(ctx,'Lock in your gut first',box.L+box.W*0.4,box.T+box.H*0.3,{s:14,c:PAL['muted'],a:'center'});},
 draw(sim,ctx,vdt,k){const g=geo(sim),s=g.s,sh=shown(sim),P=PROJ[sim.p.proj],G=GS(sim),locked=!!(G&&G.g),N=need(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=g.X,T=g.Y,W=g.xs+g.as,H=g.xs+g.bs;
  /* the new outline */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L,T,W,H);
  /* order fill: covers the right strip top to bottom, then the bottom strip left to right */
  if(locked){let r=G.g.order;const fills=[[L+g.xs,T,g.as,H],[L,T+g.xs,g.xs,g.bs]];ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.45;
   fills.forEach((f,i)=>{const area=(f[2]/s)*(f[3]/s);if(r<=0||area<=0)return;const fr=Math.min(1,r/area);if(i===0)ctx.fillRect(f[0],f[1],f[2],f[3]*fr);else ctx.fillRect(f[0],f[1],f[2]*fr,f[3]);r-=area;});ctx.globalAlpha=1;}
  /* old square */
  ctx.fillStyle=PAL['card2'];ctx.fillRect(L,T,g.xs,g.xs);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.strokeRect(L,T,g.xs,g.xs);
  txt(ctx,'Old '+P.thing,L+g.xs/2,T+g.xs/2-4,{s:14*k,w:700,a:'center',c:PAL['cv-soft']});
  txt(ctx,sh?`${atLeast('honors')?'x² = ':''}${g.x*g.x} sq ft`:`${g.x} ft × ${g.x} ft`,L+g.xs/2,T+g.xs/2+16*k,{s:13*k,a:'center',c:PAL['cv-soft']});
  /* new outline, dashed */
  ctx.setLineDash([7,5]);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.strokeRect(L,T,W,H);ctx.setLineDash([]);
  /* pieces */
  if(sh){ctx.lineWidth=2;const pc=[[L+g.xs,T,g.as,g.xs,'s2',`ax = ${g.a*g.x}`],[L,T+g.xs,g.xs,g.bs,'s3',`bx = ${g.b*g.x}`],[L+g.xs,T+g.xs,g.as,g.bs,'s5',`ab = ${g.a*g.b}`]];
   if(!atLeast('honors')){pc[0][5]=`${g.a} × ${g.x} = ${g.a*g.x}`;pc[1][5]=`${g.x} × ${g.a} = ${g.a*g.x}`;pc[2][5]=`${g.a} × ${g.a} = ${g.a*g.a}`;}
   pc.forEach(q=>{ctx.strokeStyle=PAL[q[4]];ctx.strokeRect(q[0]+1,q[1]+1,q[2]-2,q[3]-2);});
   const fs=13*k;
   /* right strip label: inside if wide enough, else to the right */
   ctx.font='700 '+fs+'px sans-serif';const w0=ctx.measureText(pc[0][5]).width;
   if(g.as>w0+10)pill(ctx,pc[0][5],L+g.xs+g.as/2,T+g.xs/2,PAL['s2'],'#fff',fs);
   else{txt(ctx,pc[0][5],L+W+8,T+g.xs/2,{s:fs,w:700,c:PAL['s2'],b:'middle'});}
   if(g.bs>fs*1.9)pill(ctx,pc[1][5],L+g.xs/2,T+g.xs+g.bs/2,PAL['s3'],'#fff',fs);
   else txt(ctx,pc[1][5],L+g.xs/2,T+H+fs+4,{s:fs,w:700,c:PAL['s3'],a:'center'});
   const w2=ctx.measureText(pc[2][5]).width;
   if(g.as>w2+10&&g.bs>fs*1.9)pill(ctx,pc[2][5],L+g.xs+g.as/2,T+g.xs+g.bs/2,PAL['s5'],'#fff',fs);
   else txt(ctx,pc[2][5],L+W+8,Math.min(T+H+fs+4,440),{s:fs,w:700,c:PAL['s5'],b:g.bs>fs*1.9?'middle':'alphabetic'});}
  /* dimension labels */
  const fd=12*k;
  txt(ctx,`${atLeast('honors')?'x = ':''}${g.x} ft`,L+g.xs/2,T-10,{s:fd,w:700,a:'center',c:PAL['cv-ink']});
  txt(ctx,`${atLeast('honors')?'a = ':'+'}${g.a}${atLeast('honors')?'':' ft'}`,L+g.xs+g.as/2,T-10,{s:fd,w:700,a:'center',c:PAL['s2']});
  txt(ctx,`${atLeast('honors')?'x = ':''}${g.x} ft`,L-8,T+g.xs/2,{s:fd,w:700,a:'right',b:'middle',c:PAL['cv-ink']});
  txt(ctx,`${atLeast('honors')?'b = ':'+'}${g.b}${atLeast('honors')?'':' ft'}`,L-8,T+g.xs+g.bs/2,{s:fd,w:700,a:'right',b:'middle',c:PAL['s3']});
  txt(ctx,`New ${P.thing}: ${g.x+g.a} ft × ${g.x+g.b} ft`,L,T-14-22*k,{s:13*k,w:700,c:PAL['rj']});
  /* right panel: your order as a pile drawn at the same scale */
  const RX=560,RW=200,RT=82;
  txt(ctx,'Your order',RX,RT-14,{s:14*k,w:700,c:PAL['s4']});
  const ord=locked?G.g.order:sim.p.order,ar=ord*s*s;let pw=Math.min(RW,Math.sqrt(ar)),ph=pw>0?ar/pw:0;const cut=ph>250;ph=Math.min(ph,250);
  if(pw>0){ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.45;ctx.fillRect(RX,RT,pw,ph);ctx.globalAlpha=1;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.strokeRect(RX,RT,pw,ph);}
  let ty=RT+ph+20*k;
  if(cut){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(RX+pw/2-12,RT+ph+4);ctx.lineTo(RX+pw/2+12,RT+ph+4);ctx.lineTo(RX+pw/2,RT+ph+16);ctx.fill();ty+=10;}
  txt(ctx,`${n0(ord)} sq ft`,RX,ty,{s:13*k,w:700,c:PAL['cv-ink']});
  txt(ctx,cut?'more than fits here':'same scale',RX,ty+17*k,{s:12*k,c:PAL['cv-soft']});
  if(locked&&sh){const d=G.g.order-N;ty+=44*k;
   txt(ctx,Math.abs(d)<1?'Right on':d<0?`Short ${n0(-d)} sq ft`:`Leftover ${n0(d)} sq ft`,RX,Math.min(ty,440),{s:14*k,w:700,c:Math.abs(d)<1?PAL['s3']:PAL['s1']});}},
 narrate(sim){const g=geo(sim),P=PROJ[sim.p.proj],N=need(sim);
  if(!shown(sim))return `The ${P.thing} is ${g.x} ft by ${g.x} ft now and will be ${g.x+g.a} ft by ${g.x+g.b} ft. <b>How much new area is that?</b> Set your order by eye, then lock it in before you look at the pieces.`;
  const corner=g.a*g.b;return `The new area is two strips (${g.a*g.x} and ${g.b*g.x} sq ft) plus a corner (${corner} sq ft): <b>${N} sq ft of ${P.mat}</b>. The corner alone, ${g.a} × ${g.b} = ${corner}, is the trap: it leaves out both strips.`;},
 gut:{better:'lower',controls:['order'],
  ask:{bio:'Drag the slider here to the number of extra square feet you think you need. The orange square at the right of the picture shows your order at the same scale as the plan. Then lock it in.',honors:'Before you show the area model, drag the slider here to the extra square feet you think you need. Then lock it in.'},
  lock(sim){const N=need(sim),o=sim.p.order;return {v:Math.abs(o-N)*sim.p.price,order:o,label:`${n0(o)} sq ft`};},
  solve(sim){const N=need(sim);sim.p.order=N;sim.p.pieces=true;return {v:0,order:N,label:`${n0(N)} sq ft`};},
  how:{bio:'The math splits the new shape into pieces you can measure: the old square, two long strips and a small corner. Add the strips and the corner.',
   honors:'Expand (x + a)(x + b) = x² + ax + bx + ab. The old square is x², so the extra is ax + bx + ab.',
   ap:'Extra = (x + a)(x + b) − x² = (a + b)x + ab. The strips scale with x; only the corner ab does not.'},
  compare(sim,g,m){const P=PROJ[sim.p.proj],N=m.order,d=g.order-N,pr=sim.p.price,x=sim.p.x,a=sim.p.a,b=B(sim);
   if(Math.abs(d)<1)return `Your gut was right on: ${n0(N)} sq ft. Your eye already adds the strips and the corner, and the area model shows why that works.`;
   let trap='';if(Math.abs(g.order-a*b)<=1)trap=` You ordered just the corner, ${a} × ${b}: that is the (x + ${a})² = x² + ${a*a} trap.`;
   else if(Math.abs(g.order-a*x)<=1||Math.abs(g.order-b*x)<=1)trap=' You ordered about one strip and missed the rest.';
   if(d<0)return `You would run out <b>${n0(-d)} sq ft short</b> of ${P.mat}: about <b>${usd(-d*pr)}</b> more to buy at $${pr} per sq ft, plus a second trip. Your order covers only ${Math.round(g.order/N*100)}% of the new area.${trap}`;
   return `You would pay <b>${usd(d*pr)}</b> for <b>${n0(d)} sq ft of leftover ${P.mat}</b> at $${pr} per sq ft. You ordered ${Math.round(g.order/N*100)}% of what you need.${trap}`;},
  again(sim){const ks=Object.keys(PROJ);sim.p.proj=ks[Math.floor(Math.random()*3)];sim.p.x=8+Math.floor(Math.random()*17);sim.p.a=1+Math.floor(Math.random()*6);sim.p.b=1+Math.floor(Math.random()*6);sim.p.order=20;sim.p.pieces=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A 12 ft by 12 ft patio grows 3 ft each way, to 15 ft by 15 ft. How many more square feet of pavers do you need?',choices:['9 sq ft','36 sq ft','81 sq ft','225 sq ft'],correct:2,explain:'New area 15 × 15 = 225, old area 12 × 12 = 144, so 225 − 144 = 81. In pieces: two 3-by-12 strips (36 each) plus the 3-by-3 corner (9).'},
  {lvl:'bio',instant:true,q:'A friend says (x + 3)² = x² + 9. What does the area model show is missing?',choices:['Nothing: it is right','Two strips, each 3 by x, so 6x in all','One more 3-by-3 corner'],correct:1,explain:'(x + 3)² is a square with side x + 3. Cut it up and you get x², two 3-by-x strips, and a 3-by-3 corner: x² + 6x + 9. The 9 is only the corner.'},
  {lvl:'honors',instant:true,q:'Expand (x + 2)(x + 5).',choices:['x² + 10','x² + 7x + 10','x² + 7x + 7','x² + 10x + 7'],correct:1,explain:'The four pieces are x², 5x, 2x and 2 × 5 = 10. The two strips combine: 5x + 2x = 7x. So x² + 7x + 10.'},
  {lvl:'honors',instant:true,q:'Growing a 10 ft square patio by 2 ft each way adds 44 sq ft. If it grows 4 ft each way instead, how much does it add?',choices:['88 sq ft','96 sq ft','176 sq ft','52 sq ft'],correct:1,explain:'Extra = 2(4)(10) + 4² = 80 + 16 = 96 sq ft. Doubling the growth doubles the strips (40 → 80) but quadruples the corner (4 → 16), so the extra more than doubles.'},
  {lvl:'ap',instant:true,q:'You can add 6 ft in all to a 12 ft square patio, split between the two directions (a + b = 6). Which split adds the most area?',choices:['a = 1, b = 5','a = 3, b = 3','a = 0, b = 6','Every split adds the same'],correct:1,explain:'Extra = (a + b)x + ab = 6(12) + ab = 72 + ab. The strips are the same for every split; only the corner changes: 1 × 5 = 5, 3 × 3 = 9, 0 × 6 = 0. Equal sides give the biggest corner: 81 sq ft.'},
  {lvl:'ap',instant:true,q:'A rectangle’s area is x² + 8x + 15. Which side lengths could it have?',choices:['(x + 3) and (x + 5)','(x + 1) and (x + 15)','(x + 4) and (x + 4)','(x + 8) and (x + 7)'],correct:0,explain:'Factoring runs the area model backward: the corner must be 15 and the strips must add to 8x. 3 × 5 = 15 and 3 + 5 = 8. (x + 1)(x + 15) gives 16x, and (x + 4)² gives 16, not 15.'}
 ],
 tour:[
  {title:'The old patio',text:'Here is a square patio, 12 ft on each side, seen from above. That is 144 square feet of pavers already down.',pause:true,focus:[X0-10,Y0-10,230,230],setup:sim=>BioLab.setValues(sim,{proj:'patio',x:12,a:3,b:3,pieces:false,order:20})},
  {title:'The bigger patio',text:'You want it 3 ft bigger each way: 15 ft by 15 ft. The dashed red line is the new edge. The question is how much new area sits between the old edge and the new one.',pause:true},
  {title:'The tempting guess',text:'“3 more feet each way, so 3 × 3 = 9 more square feet.” The orange pile on the right is an order of 9 sq ft, drawn at the same scale. Compare it with the gap it has to fill.',pause:true,setup:sim=>BioLab.setValues(sim,{order:9})},
  {title:'Cut it into pieces',text:'The area model splits the new space into pieces you can measure: a 3-by-12 strip down the side, a 12-by-3 strip along the bottom, and a 3-by-3 corner.',pause:true,setup:sim=>BioLab.setValues(sim,{pieces:true})},
  {title:'Add the pieces',text:'36 + 36 + 9 = 81 sq ft. That is (x + 3)² = x² + 6x + 9 with x = 12. The guess of 9 was only the corner, short by 72 sq ft.',pause:true,setup:sim=>BioLab.setValues(sim,{order:81})},
  {lvl:'honors',title:'Different amounts each way',text:'Now add 5 ft one way and 2 ft the other: (x + 5)(x + 2) = x² + 5x + 2x + 10 = x² + 7x + 10. With x = 12, the extra is 60 + 24 + 10 = 94 sq ft.',pause:true,setup:sim=>BioLab.setValues(sim,{a:5,b:2,order:94,pieces:true})},
  {lvl:'ap',title:'Why the strips matter most',text:'The extra area is (a + b)x + ab. On a 24 ft patio grown 3 ft each way, the strips are 144 sq ft and the corner is still 9: the “just the corner” guess misses 94% of the job.',pause:true,setup:sim=>BioLab.setValues(sim,{x:24,a:3,b:3,order:153,pieces:true})}
 ],
 lab:{bio:'<p><b>Question:</b> When a square grows the same amount each way, how does the extra area change with the size of the square?</p><ol><li>Set <b>Add this much</b> to 2 ft and turn on the area model.</li><li>Record trials for squares of 8, 12, 16, 20 and 24 ft.</li><li>Graph <b>Trials</b> with the side x on the x-axis and the extra area on the y-axis.</li></ol><p>Write one sentence: why does a bigger square need more extra material for the same 2 ft?</p>',
  honors:'<p><b>Question:</b> Does (x + a)(x + b) always equal x² + (a + b)x + ab?</p><ol><li>Pick five different sets of x, a and b. For each, write the expansion before you turn on the area model.</li><li>Check each against the readout and record a trial.</li></ol><p>Explain which piece people most often forget, and why.</p>',
  ap:'<p><b>Question:</b> With a + b fixed, which split adds the most area?</p><ol><li>Set x = 12 and keep a + b = 6. Record the extra area for (1, 5), (2, 4), (3, 3), (4, 2) and (5, 1).</li><li>Write the extra as 6x + ab and explain the pattern using the corner piece.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the area model.</p>'},
 terms:[
  {t:'Binomial',d:'A sum of two terms, like x + 3.'},
  {t:'Area model',d:'A rectangle split into pieces whose side lengths are the terms. Adding the pieces’ areas multiplies the expressions.'},
  {t:'Distributive property',d:'a(b + c) = ab + ac. Each term in one factor multiplies each term in the other.',lvl:'honors'},
  {t:'Perfect square trinomial',d:'(x + a)² = x² + 2ax + a². The middle term 2ax is the two strips.',lvl:'honors'},
  {t:'Factoring',d:'Running the area model backward: finding the side lengths from the area.',lvl:'ap'}
 ],
 about:'<p>The old square is x by x. It grows a ft in one direction and b ft in the other (at Big picture, a ft both ways), so the new area is (x + a)(x + b) = x² + ax + bx + ab and the extra is (a + b)x + ab.</p><p>The material price is an assumption for illustration, not a quote. Real orders add extra for cuts and waste, which this model leaves out. A path or border of width w around all four sides adds 2w to each side, so it fits this model with a = b = 2w.</p>'
};
BioLab.register(SIM);
})();
