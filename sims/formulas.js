(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
const money=v=>(v<-0.004?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const num=v=>v.toLocaleString('en-US',{maximumFractionDigits:2});
const cash=v=>{v=Math.round(v*100)/100;return Number.isInteger(v)?v.toLocaleString('en-US'):v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});};
const dec=r=>String(+(r/100).toFixed(4));            /* 8 -> "0.08" */
/* The four candidate formulas for the Total cell. Only c matches the shop's rule (tax on the whole order). */
const FORMS={
 a:{w:'Shirts, plus the fee with tax on the fee only',alg:'p × n + F × (1 + r)',xl:'=B1*B2+B3*(1+B4)',calc:(p,n,F,r)=>p*n+F*(1+r)},
 b:{w:'Shirts, plus the fee, plus tax on the shirts only',alg:'p × n + F + r × p × n',xl:'=B1*B2+B3+B4*B1*B2',calc:(p,n,F,r)=>p*n+F+r*p*n},
 c:{w:'Add the shirts and the fee first, then tax it all',alg:'(p × n + F) × (1 + r)',xl:'=(B1*B2+B3)*(1+B4)',calc:(p,n,F,r)=>(p*n+F)*(1+r)},
 d:{w:'Add the fee to every shirt, then tax it all',alg:'(p + F) × n × (1 + r)',xl:'=(B1+B3)*B2*(1+B4)',calc:(p,n,F,r)=>(p+F)*n*(1+r)}
};
const r2=v=>Math.round(v*100)/100;
const R=sim=>sim.p.r/100;
const totF=(sim,f,n)=>r2(FORMS[f].calc(sim.p.p,n===undefined?sim.p.n:n,sim.p.F,R(sim)));
const real=(sim,n)=>totF(sim,'c',n);
const yours=sim=>totF(sim,sim.p.f);
const most=sim=>Math.max(0,Math.floor((sim.p.B/(1+R(sim))-sim.p.F)/sim.p.p+1e-9));
/* Worked steps in the order the computer does them: [operation badge, expression]. */
function steps(sim,f){const p=sim.p.p,n=sim.p.n,F=sim.p.F,r=R(sim),g=1+r,pn=p*n,t=FORMS[f].calc(p,n,F,r);
 if(f==='a')return [['( )',`1 + ${dec(sim.p.r)} = ${String(+g.toFixed(4))}`],['×',`${cash(p)} × ${n} = ${cash(pn)}`],['×',`${cash(F)} × ${String(+g.toFixed(4))} = ${cash(F*g)}`],['+',`${cash(pn)} + ${cash(F*g)} = ${cash(t)}`]];
 if(f==='b')return [['×',`${cash(p)} × ${n} = ${cash(pn)}`],['×',`${dec(sim.p.r)} × ${cash(pn)} = ${cash(r*pn)}`],['+',`${cash(pn)} + ${cash(F)} + ${cash(r*pn)} = ${cash(t)}`]];
 if(f==='c')return [['( )',`${cash(p)} × ${n} = ${cash(pn)}`],['( )',`${cash(pn)} + ${cash(F)} = ${cash(pn+F)}`],['( )',`1 + ${dec(sim.p.r)} = ${String(+g.toFixed(4))}`],['×',`${cash(pn+F)} × ${String(+g.toFixed(4))} = ${cash(t)}`]];
 return [['( )',`${cash(p)} + ${cash(F)} = ${cash(p+F)}`],['( )',`1 + ${dec(sim.p.r)} = ${String(+g.toFixed(4))}`],['×',`${cash(p+F)} × ${n} = ${cash((p+F)*n)}`],['×',`${cash((p+F)*n)} × ${String(+g.toFixed(4))} = ${cash(t)}`]];}
function gapLine(sim,f){const r=R(sim);
 if(f==='a')return `The gap is the tax on the shirts, so it grows with every shirt: at 100 shirts it is ${money(r2(r*sim.p.p*100))}.`;
 if(f==='b')return `The gap is the tax on the setup fee, ${money(r2(r*sim.p.F))}, at every order size.`;
 if(f==='d')return `The gap grows with every shirt: at 100 shirts it is ${money(r2(totF(sim,'d',100)-real(sim,100)))}.`;
 return '';}
function fitText(ctx,s,x,y,o,maxW){let sz=o.s;ctx.font=(o.w||400)+' '+sz+'px '+(o.f||FONT);while(sz>12&&ctx.measureText(s).width>maxW){sz-=1;ctx.font=(o.w||400)+' '+sz+'px '+(o.f||FONT);}
 ctx.fillStyle=o.c||PAL['cv-ink'];ctx.textAlign=o.a||'left';ctx.textBaseline=o.b||'alphabetic';ctx.fillText(s,x,y);}
const MONO='Consolas,"Cascadia Mono",Menlo,"Courier New",monospace';
const big=()=>!atLeast('honors');
const showReal=sim=>atLeast('honors')||!!(sim.gutS&&sim.gutS.m);

const SIM={
 id:'formulas',hash:'formulas',apUnit:1,order:1,tab:'Order total formula',kind:'Simulation',
 card:'Pick the rule that totals a T-shirt order, then see how the order of the steps changes the bill.',
 title:'The right total for every order',
 lede:{bio:'A store totals every order with one rule. Do the steps in the right order and the rule is right for any order size. Do them in the wrong order and every bill comes out wrong.',
  honors:'Variables stand for the cells: price p, shirts n, setup fee F, tax rate r. The expression (p × n + F) × (1 + r) is the rule the shop uses. Each wrong formula breaks it in its own way.',
  ap:'Distribute and the total is a linear function of n: T(n) = (1 + r)p·n + (1 + r)F. The slope is the taxed price of one more shirt, and the intercept is the taxed setup fee. Solve T(n) ≤ budget to find the biggest order you can afford.'},
 scale:{bio:'One order: the price, the number of shirts, the setup fee, the tax and the total. Prices are made up.',honors:'One spreadsheet: four input cells and one Total cell. Prices are made up for illustration.'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The order',
 controls:[
  {id:'f',label:'Your formula for the Total cell',type:'seg',def:'a',options:[{v:'a',l:'A:  p × n + F × (1 + r)'},{v:'b',l:'B:  p × n + F + r × p × n'},{v:'c',l:'C:  (p × n + F) × (1 + r)'},{v:'d',l:'D:  (p + F) × n × (1 + r)'}],help:'p = price per shirt, n = shirts, F = setup fee, r = tax rate as a decimal.'},
  {id:'n',label:'Shirts ordered (n)',type:'range',min:1,max:150,step:1,def:40,unit:''},
  {id:'p',label:'Price per shirt, p ($)',type:'range',min:5,max:25,step:0.5,def:12,unit:'',d:2,lvl:'honors',noGut:true},
  {id:'F',label:'Setup fee, F ($)',type:'range',min:0,max:100,step:5,def:35,unit:'',d:2,lvl:'honors',noGut:true},
  {id:'r',label:'Sales tax rate, r',type:'range',min:2,max:10,step:0.1,def:8,unit:'%',lvl:'honors',noGut:true},
  {id:'B',label:'Club budget ($)',type:'range',min:200,max:2000,step:50,def:1000,unit:'',d:0,lvl:'ap',noGut:true,help:'Deep dive: the most shirts the club can afford.'}
 ],
 onLevel(sim){const w=sim.ui.ctlW&&sim.ui.ctlW.f;if(!w)return;const b=big();
  const L=w.querySelector('.lbl,label');if(L)L.textContent=b?'Your rule for the total':'Your formula for the Total cell';
  const h=w.querySelector('.help');if(h)h.textContent=b?'Pick the steps you think the shop uses.':'p = price per shirt, n = shirts, F = setup fee, r = tax rate as a decimal.';
  w.querySelectorAll('button[data-v]').forEach(o=>{const F=FORMS[o.dataset.v];if(F)o.textContent=o.dataset.v.toUpperCase()+': '+(b?F.w:F.alg);});},
 init(){return {};},step(){},
 metrics:[
  {id:'yours',label:'Your formula’s total',unit:'dollars',d:2,min:0,max:null,get:yours},
  {id:'each',label:'Your formula: cost per shirt',unit:'dollars',d:2,min:0,max:null,get:sim=>yours(sim)/sim.p.n},
  {id:'real',label:'Real bill (tax on everything)',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:sim=>real(sim)},
  {id:'off',label:'Your formula is off by',unit:'dollars',d:2,lvl:'honors',min:0,max:null,get:sim=>Math.abs(yours(sim)-real(sim))},
  {id:'most',label:'Most shirts the budget covers',unit:'shirts',d:0,lvl:'ap',min:0,max:null,get:most}
 ],
 graphs:[{id:'line',label:'Total vs. shirts ordered',custom:true}],defaultGraph:'line',
 plot(sim,ctx,box){const G=sim.gutS||{},both=!!(G.g&&G.m&&sim.p.f==='c'),fa=both?G.g.f:sim.p.f,sr=showReal(sim)||both;
  const top=Math.max(totF(sim,fa,150),sr?real(sim,150):0),ym=Math.ceil(top/500)*500;
  const ax=axes(ctx,box,{xmin:0,xmax:150,ymin:0,ymax:ym,xl:'Shirts ordered (n)',yl:'Order total ($)'});
  const line=(f,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.setLineDash(dash?[6,5]:[]);ctx.beginPath();for(let n=0;n<=150;n+=5){const x=ax.X(n),y=ax.Y(totF(sim,f,n));n?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);};
  const items=[];
  if(sr){line('c',PAL['g-line'],false);items.push({label:'Real bill',color:PAL['g-line']});}
  if(fa!=='c'||!sr){line(fa,PAL['s4'],true);items.push({label:both?'Your gut formula':'Your formula',color:PAL['s4'],dash:true});}
  const n=sim.p.n,dot=(v,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(n),ax.Y(v),5,0,7);ctx.fill();};
  if(fa!=='c'||!sr)dot(totF(sim,fa,n),PAL['s4']);if(sr)dot(real(sim,n),PAL['g-line']);
  legend(ctx,box.L+12,box.T+14,items);},
 draw(sim,ctx,vdt,k0){const k=Math.max(k0,1.45),P=sim.p,G=sim.gutS||{},both=!!(G.g&&G.m&&sim.p.f==='c'),sr=showReal(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* formula bar */
  const fb=14,fh=Math.round(22+16*k);
  rr(ctx,20,fb,760,fh,8);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
  if(big()){txt(ctx,'Your rule',34,fb+fh/2,{s:13*k,w:700,c:PAL['cv-soft'],b:'middle'});fitText(ctx,FORMS[P.f].w,34+86*k,fb+fh/2+1,{s:16*k,w:700,b:"middle"},760-86*k-30);}
  else{txt(ctx,'B5',34,fb+fh/2,{s:12*k,w:700,c:PAL['cv-soft'],b:'middle'});
  txt(ctx,'fx',34+34*k,fb+fh/2,{s:14*k,w:700,c:PAL['cv-soft'],b:'middle'});
  fitText(ctx,FORMS[P.f].xl,34+64*k,fb+fh/2+1,{s:17*k,w:700,f:MONO,b:'middle'},760-64*k-30);
  if(k<1.5)txt(ctx,'Total = '+FORMS[P.f].alg,766,fb+fh/2,{s:13*k,c:PAL['cv-soft'],a:'right',b:'middle'});}
  /* input cells */
  const gy=fb+fh+14,rh=Math.round(12+16*k),gx=20,gw=380;
  const rows=[['B1','Price per shirt',money(P.p)],['B2','Shirts ordered',String(P.n)],['B3','Setup fee',money(P.F)],['B4','Sales tax',num(P.r)+'%'],['B5','Total',money(yours(sim))]];
  rows.forEach((row,i)=>{const y=gy+i*rh,tot=i===4;
   ctx.fillStyle=tot?PAL['card2']:PAL['card'];ctx.fillRect(gx,y,gw,rh);ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(gx+.5,y+.5,gw,rh);
   ctx.beginPath();ctx.moveTo(gx+16+30*k,y);ctx.lineTo(gx+16+30*k,y+rh);ctx.stroke();
   if(!big())txt(ctx,row[0],gx+8,y+rh/2,{s:12*k,c:PAL['cv-soft'],b:'middle'});
   txt(ctx,row[1],gx+26+30*k,y+rh/2,{s:13*k,w:tot?700:400,b:'middle'});
   txt(ctx,row[2],gx+gw-12,y+rh/2,{s:14*k,w:700,a:'right',b:'middle',c:tot?(P.f==='c'?PAL['s3']:PAL['rj']):PAL['cv-ink']});});
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.strokeRect(gx+1,gy+4*rh+1,gw-2,rh-2);
  const L=sim.vis.L={bar:[14,fb-6,772,fh+12],grid:[14,gy-6,gw+12,5*rh+12]};
  /* order of operations steps */
  let sy=gy+5*rh+Math.round(10+12*k);
  txt(ctx,big()?'How it gets worked out':'How the computer reads it',gx,sy,{s:12*k,w:700,c:PAL['cv-soft']});
  const ls=Math.round(6+14*k);
  L.steps=[14,sy-14*k-6,gw+12,ls*4+14*k+16];
  steps(sim,P.f).forEach((s,i)=>{const y=sy+ls*(i+1)-2;pill(ctx,s[0],gx+18*k,y-5*k,PAL['card2'],PAL['cv-ink'],12*k);fitText(ctx,s[1],gx+40*k,y,{s:13*k},gw-40*k);});
  /* table: one formula, every order size */
  const tx=420,tw=360,c1=tx+8,c2=tx+tw*0.56,c3=tx+tw-8;
  txt(ctx,big()?'One rule, every order size':'One formula, every order size',tx,gy+rh*0.6,{s:13*k,w:700});
  const lefts=both?'Your gut':'Yours',rights=both?'The math':'Real bill',fa=both?G.g.f:P.f;
  const hy=gy+rh;ctx.fillStyle=PAL['card2'];ctx.fillRect(tx,hy,tw,rh);
  txt(ctx,'Shirts',c1,hy+rh/2,{s:12*k,w:700,c:PAL['cv-soft'],b:'middle'});
  txt(ctx,lefts,c2,hy+rh/2,{s:12*k,w:700,c:PAL['s4'],a:'right',b:'middle'});
  txt(ctx,rights,c3,hy+rh/2,{s:12*k,w:700,c:PAL['s3'],a:'right',b:'middle'});
  const ns=k>1.45?[10,25,50,100]:[10,25,50,100,150];
  ns.forEach((n,i)=>{const y=hy+(i+1)*rh;ctx.fillStyle=n===P.n?PAL['card2']:PAL['card'];ctx.fillRect(tx,y,tw,rh);ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(tx+.5,y+.5,tw,rh);
   const a=totF(sim,fa,n),b=real(sim,n),wrong=Math.abs(a-b)>0.004&&(sr||both);
   txt(ctx,String(n),c1,y+rh/2,{s:13*k,w:700,b:'middle'});
   txt(ctx,money(a),c2,y+rh/2,{s:13*k,a:'right',b:'middle',c:wrong?PAL['s1']:PAL['cv-ink']});
   txt(ctx,sr||both?money(b):'?',c3,y+rh/2,{s:13*k,w:700,a:'right',b:'middle',c:PAL['s3']});});
  L.table=[tx-6,gy-6,tw+12,(ns.length+2)*rh+12];
  let ay=hy+(ns.length+1)*rh+Math.round(14+12*k);
  if(atLeast('ap')){const sl=r2(P.p*(1+R(sim))),ic=r2(P.F*(1+R(sim)));
   fitText(ctx,`T(n) = ${cash(sl)}n + ${cash(ic)}`,tx,ay,{s:14*k,w:700,c:PAL['cv-ink']},tw);
   fitText(ctx,`Budget ${money(P.B).replace('.00','')}: up to ${most(sim)} shirts`,tx,ay+Math.round(8+16*k),{s:13*k,c:PAL['cv-soft']},tw);}
  else if(!sr&&!both)fitText(ctx,'Lock in your gut to see the real bill.',tx,ay,{s:12*k,c:PAL['cv-soft']},tw);
 },
 narrate(sim){const P=sim.p,y=yours(sim),t=real(sim),d=Math.abs(y-t);
  if(P.f==='c')return `<b>This is the shop’s rule.</b> The parentheses add the shirts and the setup fee first, then the whole subtotal gets taxed: ${P.n} shirts cost ${money(t)}.`;
  if(P.f==='a')return `<b>Multiplication comes before addition</b>, so (1 + r) multiplies only the setup fee. The shirts never get taxed, and this formula says ${money(y)}${atLeast('honors')?`, ${money(d)} short`:''}.`;
  if(P.f==='b')return `This formula taxes the shirts but <b>skips the tax on the setup fee</b>. It says ${money(y)}${atLeast('honors')?`, ${money(d)} short at any order size`:''}.`;
  return `This formula adds the setup fee to the price of <b>every shirt</b>, so the club pays the fee ${P.n} times. It says ${money(y)}${atLeast('honors')?`, ${money(d)} too much`:''}.`;},
 gut:{better:'lower',controls:['f'],
  ask:{bio:'Which rule gives the right total? Pick one here by feel, then lock it in.',honors:'Before you check the Real bill: which formula matches the shop’s rule, tax on the whole order? Pick it, then lock it in.'},
  lockLabel:'Lock in my formula',
  lock(sim){const y=yours(sim),t=real(sim);return {v:Math.abs(y-t),f:sim.p.f,n:sim.p.n,total:y,real:t,P:{p:sim.p.p,F:sim.p.F,r:sim.p.r},label:`formula ${sim.p.f.toUpperCase()}, ${money(y)} for ${sim.p.n} shirts`};},
  solve(sim){sim.p.f='c';const t=real(sim);return {v:Math.abs(yours(sim)-t),label:`formula C, (p × n + F) × (1 + r) = ${money(t)}`};},
  how:{bio:'Order of operations: parentheses first, then multiplication, then addition. Putting the shirts and the fee inside parentheses makes the computer add them before it applies the tax, so the whole order gets taxed.',
   ap:'Group the subtotal, then scale it: (p·n + F)(1 + r). Distributing gives (1 + r)p·n + (1 + r)F, a line in n, so one cell formula is right for every order size.'},
  compare(sim,g,m){if(g.v<0.005)return `Your gut was right on. You picked the formula a checkout page uses: the parentheses make the computer add the setup fee before the tax, so the whole order is taxed. It is right for every order size, not just ${g.n} shirts.`;
   const under=g.total<g.real;
   return `Your formula says <b>${money(g.total)}</b> for ${g.n} shirts, but the shop charges <b>${money(g.real)}</b>. The club would collect <b>${money(g.v)} too ${under?'little':'much'}</b>${under?' and come up short at pickup':' from its members'}. ${gapLine({p:g.P},g.f)}`;},
  again(sim){const pick=a=>a[Math.floor(Math.random()*a.length)];
   sim.p.p=pick([8,9.5,10,11,12.5,14,15,18]);sim.p.F=pick([20,25,30,40,45,50,60]);sim.p.r=pick([2.9,4,6.5,7,7.5,8,8.5]);sim.p.n=10+Math.floor(Math.random()*111);sim.p.f=pick(['a','b','d']);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The shop charges sales tax on the whole order, setup fee included. Which formula gives the right total?',choices:['p × n + F × (1 + r)','(p × n + F) × (1 + r)','(p + F) × n × (1 + r)'],correct:1,explain:'Parentheses go first, so (p × n + F) adds the shirts and the fee before anything gets taxed. Then × (1 + r) taxes the whole subtotal. For 40 shirts at $12 with a $35 fee and 8% tax: (480 + 35) × 1.08 = $556.20.'},
  {lvl:'bio',instant:true,q:'Someone types 12 × 40 + 35 × 1.08 into a calculator. What does it actually compute?',choices:['$556.20: tax on everything','$517.80: tax on only the $35 fee','$553.40: tax on only the shirts'],correct:1,explain:'Multiplication comes before addition. The computer does 12 × 40 = 480 and 35 × 1.08 = 37.80, then adds: $517.80. The shirts never got taxed, so the sheet is $38.40 short of the real $556.20.'},
  {lvl:'honors',instant:true,q:'A treasurer writes (p + F) × n × (1 + r). For 40 shirts at $12 with a $35 fee and 8% tax, what goes wrong?',choices:['Nothing: it is the same as (p × n + F) × (1 + r)','It charges the $35 fee for every shirt, giving $2,030.40','It forgets the tax, giving $515.00'],correct:1,explain:'(p + F) × n multiplies the fee by n too: (12 + 35) × 40 × 1.08 = $2,030.40. The fee belongs outside the × n because the shop charges it once per order.'},
  {lvl:'honors',instant:true,q:'A formula forgets to tax the setup fee: p × n + F + r × p × n. How does its error change as the order grows from 10 to 100 shirts?',choices:['It grows with every shirt','It stays the same: the missing tax on the fee','It shrinks toward zero'],correct:1,explain:'The only thing missing is r × F, the tax on the fee. With a $35 fee and 8% tax that is $2.80 for 10 shirts, for 100 shirts and for every order size. Compare formula A, which misses the tax on the shirts: its error grows by 8% of $12 = $0.96 with each shirt.'},
  {lvl:'ap',instant:true,q:'Write the real bill as a linear function T(n) = mn + b for $12 shirts, a $35 fee and 8% tax. What is the slope m?',choices:['$12.00 per shirt','$12.96 per shirt','$13.08 per shirt','$47.00 per shirt'],correct:1,explain:'Distribute: (12n + 35) × 1.08 = 12.96n + 37.80. Each extra shirt adds its price plus its tax, $12.96. The intercept, $37.80, is the setup fee with its tax, paid once.'},
  {lvl:'ap',instant:true,q:'The club has $1,000. With $12 shirts, a $35 fee and 8% tax, what is the biggest order it can afford?',choices:['74 shirts','77 shirts','80 shirts','83 shirts'],correct:0,explain:'Solve 12.96n + 37.80 ≤ 1,000: n ≤ 962.20 ÷ 12.96 ≈ 74.2, so 74 shirts ($996.84). 80 forgets the tax ((1,000 − 35) ÷ 12), and 83 forgets both the tax and the fee (1,000 ÷ 12). 75 shirts would cost $1,009.80.'}
 ],
 tour:[
  {title:'The order',text:{bio:'The club is ordering 40 shirts at $12 each. The shop adds a $35 setup fee, then 8% sales tax on the whole order, fee included. The left side shows those numbers.',honors:'The club is ordering 40 shirts at $12 each. The shop adds a $35 setup fee, then 8% sales tax on the whole order, fee included. Cells B1 to B4 hold those numbers.'},focus:sim=>sim.vis.L&&sim.vis.L.grid,pause:true,setup:sim=>BioLab.setValues(sim,{f:'a',n:40})},
  {title:{bio:'A rule, not a number',honors:'A formula, not a number'},text:{bio:'The top bar shows a rule: shirts, plus the fee with tax on the fee only. Change any number and the total updates on its own. The question is whether this rule matches what the shop does.',honors:'Cell B5 holds a formula: =B1*B2+B3*(1+B4). Change any input cell and the total updates on its own. The question is whether this formula matches the shop’s rule.'},focus:sim=>sim.vis.L&&sim.vis.L.bar,pause:true},
  {title:{bio:'How it gets worked out',honors:'How the computer reads it'},text:'Math works parentheses first, then multiplication, then addition. So (1 + 0.08) multiplies only the $35 fee, and the shirts never get taxed. This formula says $517.80.',focus:sim=>sim.vis.L&&sim.vis.L.steps,pause:true},
  {title:'Fix it with parentheses',text:'Group the shirts and the fee in parentheses: (12 × 40 + 35) × 1.08. Now the whole $515 subtotal is taxed: $556.20. The first formula was $38.40 short, exactly the missing tax on the shirts.',pause:true,setup:sim=>BioLab.setValues(sim,{f:'c'})},
  {title:'One formula, every order size',text:'Change the order to 100 shirts. You do not retype anything: the same formula gives $1,333.80. The table shows it working for every order size at once.',focus:sim=>sim.vis.L&&sim.vis.L.table,pause:true,setup:sim=>BioLab.setValues(sim,{f:'c',n:100})},
  {lvl:'honors',title:'Two more traps',text:'Formula D puts the fee inside the price of each shirt, so 40 shirts pay it 40 times: $2,030.40. Formula B taxes the shirts but not the fee, so it is $2.80 short at every order size.',pause:true,setup:sim=>BioLab.setValues(sim,{f:'d',n:40})},
  {lvl:'ap',title:'A linear function',text:'Distribute: T(n) = 1.08 × 12n + 1.08 × 35 = 12.96n + 37.80. With a $1,000 budget, 12.96n + 37.80 ≤ 1,000 gives n ≤ 74.2, so the club can afford 74 shirts.',pause:true,setup:sim=>BioLab.setValues(sim,{f:'c',n:74})}
 ],
 lab:{bio:'<p><b>Question:</b> Which formulas give the right total for every order size?</p><ol><li>Choose formula C. Record trials for 10, 40 and 100 shirts.</li><li>Choose formula A and record the same three orders.</li><li>Compare the totals for each order size.</li></ol><p>Write one sentence: why does one pair of parentheses change every total?</p>',
  honors:'<p><b>Question:</b> How does each wrong formula’s error depend on n?</p><ol><li>For formulas A, B and D, record <b>Your formula is off by</b> at n = 10, 50 and 100.</li><li>Graph Trials with n on x and the error on y.</li></ol><p>Explain which error stays the same, which grows, and why, using the expression for each.</p>',
  ap:'<p><b>Question:</b> How many shirts can the club afford?</p><ol><li>Write T(n) for the current price, fee and tax in the form mn + b.</li><li>Solve T(n) ≤ budget for n, and round the right way.</li><li>Check your answer against <b>Most shirts the budget covers</b> for three budgets.</li></ol><p><b>CER:</b> Claim, evidence from your trials, and reasoning from the inequality.</p>'},
 terms:[
  {t:'Variable',d:'A letter that stands for a number that can change, like n for the number of shirts. In a spreadsheet, a cell such as B2 plays the same role.'},
  {t:'Expression',d:'Numbers, variables and operations with no equals sign, like (p × n + F) × (1 + r).'},
  {t:'Order of operations',d:'Parentheses first, then exponents, then multiplication and division from left to right, then addition and subtraction from left to right. Every calculator and spreadsheet follows it.'},
  {t:'Coefficient',d:'The number that multiplies a variable. In 12.96n, the coefficient 12.96 is the cost of each shirt with tax.',lvl:'honors'},
  {t:'Distributive property',d:'a(b + c) = ab + ac. It turns (12n + 35) × 1.08 into 12.96n + 37.80.',lvl:'ap'},
  {t:'Linear function',d:'A function with a constant rate of change, written f(x) = mx + b.',lvl:'ap'}
 ],
 about:'<p>Real bill = (p × n + F) × (1 + r), with price per shirt p, n shirts, a setup fee F, and the tax rate r written as a decimal (8% = 0.08). This shop taxes the whole order, setup fee included. Totals round to the cent.</p><p>The prices, the fee and the 8% rate are made up for illustration. Real sales tax rates depend on where you buy, and states and cities have different rules about which fees get taxed, so a real checkout formula follows local rules. This is a simplified model, not tax or financial advice.</p>'
};
BioLab.register(SIM);
})();
