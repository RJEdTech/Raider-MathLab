(function(){
'use strict';
const {clamp,txt,rr,rng,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* ---------- The model: one worker's months, run twice on the same shocks ----------
   Pay is set so a normal month covers the basic budget with a small margin left over: pay = budget / (1 - margin).
   Each month: income (minus unpaid days), spending (budget + shocks + health + bank fees), interest on any debt.
   A surplus pays unpaid bills, then debt, then goes to savings. A shortfall uses savings, then borrows up to the
   lender's limit; anything past that becomes unpaid bills (behind). Sources and assumptions are in `about`. */
const HRS=40*52/12,DAYS=HRS/8;                       /* full-time month: 173.33 hours, 21.67 workdays of 8 hours */
const PL=0.4252;                                     /* Ecuador price level vs the U.S. (World Bank PPP conversion factor, 2025; Ecuador uses the dollar) */
const CITY={
 dallas:{name:'Dallas',basket:2895.83,pass:126,check:true,lr:34.14,lim:507,lname:'payday loan',fr:22.15/12,fname:'credit card',lowr:22.15/12,lowname:'credit card or credit union',copay:40,er:750,emerg:400,phone:150,sick:'Texas has no state paid sick leave law; this formal worker’s employer offers it.'},
 aurora:{name:'Aurora',basket:3116.08,pass:88,check:true,lr:3,lim:633,lname:'small loan under the 36% cap',fr:22.15/12,fname:'credit card',lowr:22.15/12,lowname:'credit card or credit union',copay:40,er:750,emerg:400,phone:150,sick:'Colorado law guarantees employees 1 hour of paid sick leave per 30 hours worked.'},
 quito:{name:'Quito',basket:562.50,pass:17.5,check:false,lr:1238/12,lim:230,lname:'chulco (informal moneylender)',fr:100*(Math.pow(1.1677,1/12)-1),fname:'consumer loan',lowr:100*(Math.pow(1.2823,1/12)-1),lowname:'cooperative microcredit',copay:0,er:60,emerg:400*PL,phone:150*PL,sick:'An employer pays the first 3 sick days; IESS pays from day 4 for affiliated workers.'}};
const CITIES=['dallas','aurora','quito'];
const SEED0=135;
/* chances per month (see about) */
const PS={sick:0.2,esc:0.5,slow:3.4/12,emerg:1-Math.pow(0.41,1/12),phone:1/24};
const CATS=[['lost','Lost pay','s1','bio'],['health','Health costs','s5','bio'],['bank','Bank-access fees','s4','bio'],['borrow','Borrowing costs','s2','bio'],['time','Time (hours × pay)','s6','bio']];
const PROT=[['none','None'],['sick','Sick pay'],['steady','Steady hours'],['insured','Health coverage'],['bank','A bank account'],['credit','Low-cost credit'],['fund','A $400 cushion']];
const PROTNAME={none:'no protection',sick:'paid sick days',steady:'steady hours',insured:'health coverage',bank:'a bank account',credit:'low-cost credit',fund:'a $400 savings cushion'};

const ap=()=>atLeast('ap'),hon=()=>atLeast('honors');
const C=sim=>CITY[sim.p.city]||CITY.dallas;
const P=(sim,id,d)=>{const c=(SIM.controls||[]).find(x=>x.id===id);if(!c||!c.lvl||atLeast(c.lvl))return sim.p[id];return d;};
const months=sim=>12*(ap()?(+sim.p.years||1):1);
const seedOf=sim=>(sim.st&&sim.st.seed)||SEED0;
function shocks(seed,N){const r=rng(seed),out=[];for(let m=0;m<N;m++){out.push({sick:r()<PS.sick,escU:r(),slow:r()<PS.slow,emerg:r()<PS.emerg,phone:r()<PS.phone,fare:m>=6});}return out;}
function inputs(sim,o){const c=C(sim);const x={city:sim.p.city in CITY?sim.p.city:'dallas',N:months(sim),seed:seedOf(sim),margin:P(sim,'margin',5)/100,lr:P(sim,'lrate',c.lr),cfee:P(sim,'cfee',2.2),hrs:2,psick:PS.sick,pesc:PS.esc,er:c.er,protect:sim.p.protect||'none',on:{}};
 CATS.forEach(([k])=>{x.on[k]=hon()?!!sim.p['c_'+k]:true;});
 return Object.assign(x,o||{});}
function run(x){const c=CITY[x.city],N=x.N,Pay=c.basket/(1-x.margin),wage=Pay/HRS,S=shocks(x.seed,N);
 const work=(fl,formal)=>{let B=fl.fund?c.emerg:0,D=0,U=0,esc=false,behind=0,indebt=0,nd=0,ner=0,ncop=0,paid=0;const cat={lost:0,health:0,bank:0,borrow:0,time:0},hist=[],cum=[];let tot=0;
  const r=x.on.borrow?(formal?c.fr:(fl.credit?c.lowr:x.lr))/100:0,lim=formal?Pay:c.lim;
  for(let m=0;m<N;m++){const s=S[m];let days=0;const sick=s.sick&&x.on.health;
   if(x.on.lost){if(sick&&!fl.sick)days+=2;if(esc&&!fl.insured&&!fl.sick)days+=2;if(s.slow&&!fl.steady)days+=6;}
   const inc=Pay*Math.max(0,1-days/DAYS);cat.lost+=Pay-inc;nd+=days;paid+=inc;
   let h=0;if(x.on.health){if(sick&&fl.insured){h+=c.copay;ncop++;}if(esc&&!fl.insured){h+=x.er;ner++;}}cat.health+=h;
   esc=sick&&!fl.insured&&s.escU<x.pesc;
   const fee=(x.on.bank&&!fl.bank&&c.check)?x.cfee/100*inc:0;cat.bank+=fee;
   if(x.on.time&&!fl.bank)cat.time+=x.hrs*wage;
   const spend=c.basket+(s.fare?c.pass/7:0)+(s.emerg?c.emerg:0)+(s.phone?c.phone:0)+h+fee;
   const it=D*r;cat.borrow+=it;
   let net=inc-spend-it;
   if(net>=0){const a=Math.min(U,net);U-=a;net-=a;const b=Math.min(D,net);D-=b;net-=b;B+=net;}
   else{let need=-net;const a=Math.min(B,need);B-=a;need-=a;const b=Math.min(Math.max(0,lim-D),need);D+=b;need-=b;U+=need;}
   if(U>0.005)behind++;if(D>0.005)indebt++;
   tot=cat.lost+cat.health+cat.bank+cat.borrow+cat.time;hist.push({B,D,U,net:B-D-U});cum.push(tot);}
  return {cat,B,D,U,behind,indebt,hist,cum,r,lim,nd,ner,ncop,paid};};
 const F=work({sick:1,steady:1,insured:1,bank:1,credit:0,fund:1},true);
 const fl={sick:0,steady:0,insured:0,bank:0,credit:0,fund:0};if(x.protect!=='none'&&x.protect in fl)fl[x.protect]=1;
 const I=work(fl,false);const g={};let tot=0;for(const k in I.cat){g[k]=I.cat[k]-F.cat[k];tot+=g[k];}
 return {F,I,g,tot,wage,Pay,S,N,c,margin:x.margin,x};}
let cacheK='',cacheV=null;
function model(sim,o){const x=inputs(sim,o),k=JSON.stringify(x);if(!o&&k===cacheK)return cacheV;const v=run(x);if(!o){cacheK=k;cacheV=v;}return v;}
/* the low and high ends of the uncertain inputs (see the quality table) */
function rangeOf(sim){const c=C(sim),q=c.check;
 const lo=model(sim,{cfee:q?1.1:0,hrs:1,psick:0.1,pesc:0.25,er:sim.p.city==='quito'?20:610,margin:Math.min(0.15,P(sim,'margin',5)/100+0.03)});
 const hi=model(sim,{cfee:q?3:0,hrs:4,psick:0.3,pesc:0.75,er:sim.p.city==='quito'?100:1500,margin:Math.max(0,P(sim,'margin',5)/100-0.03)});
 return [Math.min(lo.tot,hi.tot),Math.max(lo.tot,hi.tot)];}
/* money left over in a normal month, after the check casher's cut if unbanked */
function slack(sim){const R=model(sim),x=R.x,fee=(x.on.bank&&R.c.check&&x.protect!=='bank')?x.cfee/100*R.Pay:0;return R.Pay*R.margin-fee;}
/* The extra cost in pieces a student can compute by hand: used by "Your turn", the reveal formula and the canvas.
   Each piece's hand value (h) uses the rounded numbers shown in the prompt. */
const $c=v=>(v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const r2=v=>Math.round(v*100)/100;
function pieces(sim){const R=model(sim),x=R.x,I=R.I,F=R.F,c=R.c,N=R.N,day=r2(R.Pay/DAYS),wg=r2(R.wage),pay=r2(R.Pay),on=x.on,deep=ap(),out=[],n=I.nd-F.nd,paid=Math.round(I.paid);
 if(on.lost&&Math.abs(R.g.lost)>0.5){const h=r2(n*day);out.push({k:'lost',l:'Lost pay',h,
  t:deep?`Lost pay: ${n} unpaid days. Daily pay = ${$c(pay)} a month ÷ 21.67 workdays.`:`Lost pay: ${n} unpaid days × ${$c(day)} a day`,
  f:`${n} × ${$c(day)}`,s:`Lost pay: ${deep?`${$c(pay)} ÷ 21.67 ≈ ${$c(day)} a day, and `:''}${n} × ${$c(day)} = ${$c(h)}`});}
 if(on.bank&&Math.abs(R.g.bank)>0.5){const h=r2(x.cfee/100*paid);out.push({k:'bank',l:'Check cashing',h,
  t:`Check cashing: ${pc(x.cfee)} of the ${$(paid)} they were paid`,f:`${pc(x.cfee)} × ${$(paid)}`,s:`Check cashing: ${+(x.cfee/100).toFixed(4)} × ${$(paid)} = ${$c(h)}`});}
 if(on.health&&Math.abs(R.g.health)>0.5){const a=[],fz=[];
  if(I.ner){a.push(`${I.ner} emergency visit${I.ner===1?'':'s'} × ${$(x.er)}`);fz.push(`${I.ner} × ${$(x.er)}`);}
  if(I.ncop&&c.copay){a.push(`${I.ncop} copay${I.ncop===1?'':'s'} × ${$(c.copay)}`);fz.push(`${I.ncop} × ${$(c.copay)}`);}
  let t='Health: '+(a.length?a.join(' + '):'the informal worker paid $0'),f=fz.join(' + ')||'$0';
  if(F.ncop&&c.copay){t+=`, minus the formal worker’s ${F.ncop} copay${F.ncop===1?'':'s'} × ${$(c.copay)}`;f+=` − ${F.ncop} × ${$(c.copay)}`;}
  const h=r2(R.g.health);out.push({k:'health',l:'Health',h,t,f,s:`Health: ${f} = ${$c(h)}`});}
 if(on.borrow&&Math.abs(R.g.borrow)>0.5){const h=Math.round(R.g.borrow);out.push({k:'borrow',l:'Loan fees',h,
  t:`Extra loan fees (the model works these out month by month): ${$(h)}`,f:$(h),s:`Loan fees: ${$(h)}`});}
 if(on.time&&Math.abs(R.g.time)>0.5){const hrs=x.hrs*N,h=r2(hrs*wg);out.push({k:'time',l:'Time',h,
  t:deep?`Time on cash errands: ${x.hrs} hours a month for ${N} months. Hourly pay = ${$c(pay)} ÷ 173.33 hours.`:`Time on cash errands: ${x.hrs} hours × ${N} months × ${$c(wg)} an hour`,
  f:`${hrs} h × ${$c(wg)}`,s:`Time: ${deep?`${$c(pay)} ÷ 173.33 ≈ ${$c(wg)} an hour, and `:''}${x.hrs} × ${N} = ${hrs} hours, × ${$c(wg)} = ${$c(h)}`});}
 return out;}
function ranking(sim){return PROT.filter(p=>p[0]!=='none').map(([id,l])=>{const R=model(sim,{protect:id}),base=model(sim,{protect:'none'});return {id,l,cut:base.tot-R.tot,tot:R.tot};}).sort((a,b)=>b.cut-a.cut);}

/* ---------- Boots: cost per year of use (the "boots theory" from Pratchett's Men at Arms, 1993) ---------- */
const VIEW=sim=>sim.p.view||'year';
function boots(sim){const T=10,cp=sim.p.b_cheap,cl=sim.p.b_clife,gp=sim.p.b_good,gl=sim.p.b_glife;
 const nc=Math.ceil(T/cl-1e-9),ng=Math.ceil(T/gl-1e-9);return {T,cp,cl,gp,gl,nc,ng,tc:nc*cp,tg:ng*gp,yc:cp/cl,yg:gp/gl};}
/* ---------- Buying a home: mortgage insurance (Aurora example) ---------- */
const MRATE=7.18;                                     /* Freddie Mac PMMS 30-year average, week of Nov 5, 2026 (FRED) */
const HOMES=[['fha','FHA, 3.5% down'],['conv','Conventional, 5% down'],['d20','Saved 20% down'],['gift','20% down, a family gift']];
function mortgage(price,years,pmi,kind){const i=MRATE/1200,n=360;let down,L,uf=0,mi=0,ufInt=0,intT=0;
 if(kind==='fha'){down=0.035*price;const base=price-down;uf=0.0175*base;L=base+uf;}
 else if(kind==='conv'){down=0.05*price;L=price-down;}else{down=0.2*price;L=price-down;}
 const M=L*i/(1-Math.pow(1+i,-n));let B=L,first=0,miStop=null;
 for(let m=1;m<=Math.round(years*12);m++){let mm=0;
  if(kind==='fha')mm=0.0055/12*B;else if(kind==='conv'&&B>0.78*price+1e-6)mm=pmi/100/12*L;else if(kind==='conv'&&miStop===null)miStop=m;
  if(m===1)first=M+mm;mi+=mm;const it=B*i;intT+=it;ufInt+=it*uf/L;B-=M-it;}
 if(kind==='conv'&&miStop===null){let b=L,m=0;while(b>0.78*price+1e-6&&m<360){b-=M-b*i;m++;}miStop=m+1;}
 return {down,L,M,uf,mi,ufInt,first,miStop,own:kind==='gift'?0:down};}
const homeYears=sim=>P(sim,'hyears',10),homePrice=sim=>P(sim,'hprice',450000),homePmi=sim=>P(sim,'pmi',0.51);
function homes(sim){const o={};HOMES.forEach(([k])=>o[k]=mortgage(homePrice(sim),homeYears(sim),homePmi(sim),k));return o;}

const $=v=>(v<0?'−$':'$')+Math.round(Math.abs(v)).toLocaleString('en-US');
const $2=v=>'$'+(Math.round(v*100)/100).toFixed(2);
const f0=v=>Math.round(v).toLocaleString('en-US'),f1=v=>(Math.round(v*10)/10).toFixed(1);
const pc=v=>(Math.round(v*100)/100)+'%';
/* Totals stay hidden while the student works out the extra cost ("Your turn"). */
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.peek||(sim.tour&&sim.tour.on)||(sim.gutS&&(sim.gutS.m||(sim.gutS.g&&!pending(sim)))));
const yrsTxt=N=>N===12?'the year':(N/12)+' years';
function clearGut(sim){sim.peek=false;if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}sim.infoDirty=true;}
function setCity(sim){clearGut(sim);const c=C(sim);sim.p.lrate=c.lr;if(BioLab.setValues)BioLab.setValues(sim,{lrate:c.lr});}
function fit(ctx,s,max,size,w){ctx.font=(w||700)+' '+size+'px '+FONT;const m=ctx.measureText(s).width;return m>max?Math.max(12,size*max/m):size;}
/* abstract shock icons */
function icon(ctx,kind,x,y,z,col){ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();
 if(kind==='sick'){ctx.arc(x,y,z,0,7);ctx.fill();}
 else if(kind==='slow'){ctx.strokeRect(x-z,y-z,2*z,2*z);}
 else if(kind==='emerg'){ctx.moveTo(x,y-z*1.1);ctx.lineTo(x+z,y+z*0.8);ctx.lineTo(x-z,y+z*0.8);ctx.closePath();ctx.fill();}
 else if(kind==='phone'){rr(ctx,x-z*0.6,y-z,z*1.2,z*2,2);ctx.fill();}
 else if(kind==='esc'){ctx.arc(x,y,z,0,7);ctx.stroke();}}
const ICOL={sick:'s1',slow:'s4',emerg:'s5',phone:'s6',esc:'s1'};

function bootIcon(ctx,x,y,w,h,col){ctx.fillStyle=col;rr(ctx,x,y,w*0.45,h,3);ctx.fill();rr(ctx,x,y+h*0.62,w,h*0.38,3);ctx.fill();}
function drawBoots(sim,ctx,k){const b=boots(sim),ink=PAL['cv-ink'],soft=PAL['cv-soft'],X0=Math.round(70+40*k),X1=600,YW=(X1-X0)/b.T;
 const titY=8+13*k,subY=titY+6+13*k,top=subY+18,rh=44*Math.min(k,1.3),yC=top+10,yG=yC+rh+24,lb=yG+rh+8,yl=lb+14*k,yy=yl+14*k;
 const t='Boots theory: 10 years of boots, two ways';txt(ctx,t,20,titY,{s:fit(ctx,t,760,14*k),w:700});
 const sub='Each block is one pair, as long as it lasts. Its price is on it.';txt(ctx,sub,20,subY,{s:fit(ctx,sub,760,12*k,400),c:soft});
 const rows=[['Cheap',b.cp,b.cl,b.nc,PAL['s1'],yC],['Good',b.gp,b.gl,b.ng,PAL['s2'],yG]];
 for(let y=0;y<=b.T;y++){const x=X0+y*YW;ctx.strokeStyle=PAL['line'];ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,lb);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(y),x,yl,{s:12*k,c:soft,a:'center'});}
 txt(ctx,'Years',(X0+X1)/2,yy,{s:12*k,c:soft,a:'center'});
 rows.forEach(([l,p,life,n,col,y])=>{const h=rh;txt(ctx,l,X0-10,y+h/2+4,{s:13*k,w:700,a:'right'});
  for(let j=0;j<n;j++){const x=X0+j*life*YW,w=Math.min(life,b.T-j*life)*YW;ctx.fillStyle=col;ctx.globalAlpha=.22;ctx.fillRect(x+1,y,w-2,h);ctx.globalAlpha=1;ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.strokeRect(x+1,y,w-2,h);
   if(w>=20){bootIcon(ctx,x+5,y+6,Math.min(18,w-10),h-12,col);if(w>=56){const s=$(p);txt(ctx,s,x+w-5,y+h/2+5,{s:fit(ctx,s,w-30,12*k),w:700,a:'right',c:ink});}}}
  const tot=n*p,s1=`${n} pair${n===1?'':'s'}: ${$(tot)}`,s2=`${$2(p/life)} a year`;txt(ctx,s1,X1+16,y+h/2-2,{s:fit(ctx,s1,180,13*k),w:700,c:col});txt(ctx,s2,X1+16,y+h/2+15*k,{s:fit(ctx,s2,180,12*k,400),c:ink});});
 const c2Y=446-6*k,c1Y=c2Y-12*k-10,cT=yy+16,cB=c1Y-18*k-8;
 if(cB-cT>40){const mx=Math.max(b.tc,b.tg)*1.05,Yc=v=>cB-(cB-cT)*v/mx;ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(X0,cB);ctx.lineTo(X1,cB);ctx.stroke();
  txt(ctx,'Spent so far',X0-10,(cT+cB)/2+4,{s:fit(ctx,'Spent so far',X0-14,12*k,400),c:soft,a:'right'});
  [[b.cp,b.cl,PAL['s1']],[b.gp,b.gl,PAL['s2']]].forEach(([p,life,col])=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();let spent=0;ctx.moveTo(X0,cB);for(let j=0;j*life<b.T-1e-9;j++){const x=X0+j*life*YW;spent+=p;ctx.lineTo(x,Yc(spent-p));ctx.lineTo(x,Yc(spent));}ctx.lineTo(X1,Yc(spent));ctx.stroke();});
  txt(ctx,$(mx/1.05),X0+4,cT+10*k,{s:12*k,c:soft});}
 const diff=b.tc-b.tg,c1=diff>0?`The cheap boots cost ${$(diff)} more over 10 years.`:`Here the cheap boots win by ${$(-diff)}.`,c2=diff>0?`The catch: the good pair needs ${$(b.gp)} at once. If you only ever have ${$(b.cp)} to spare, you keep paying more.`:'Boots theory depends on the numbers: here the good pair does not last long enough to beat its price.';
 txt(ctx,c1,20,c1Y,{s:fit(ctx,c1,760,13*k),w:700,c:diff>0?PAL['s1']:ink});txt(ctx,c2,20,c2Y,{s:fit(ctx,c2,760,12*k,400),c:ink});}
function drawHome(sim,ctx,k){const H=homes(sim),y=homeYears(sim),ink=PAL['cv-ink'],soft=PAL['cv-soft'];
 const t=`An Aurora home at ${$(homePrice(sim))}, kept ${y} year${y===1?'':'s'} at ${MRATE}%`;txt(ctx,t,20,8+13*k,{s:fit(ctx,t,760,14*k),w:700});
 const cols=[[210,400,'Your own cash up front'],[425,615,`Mortgage insurance in ${y} yr`],[640,790,'First monthly payment']];
 const hy=14+30*k;cols.forEach(([a,b2,l])=>txt(ctx,l,a,hy,{s:fit(ctx,l,b2-a,12*k),w:700,c:soft}));
 const maxDown=Math.max(...HOMES.map(([kk])=>H[kk].own),1),maxMi=Math.max(...HOMES.map(([kk])=>H[kk].uf+H[kk].mi),1);
 const top=hy+14+6*k,rh=(430-top)/4;
 HOMES.forEach(([kk,l],j)=>{const h=H[kk],ry=top+j*rh,bh=Math.min(26,rh*0.4),mid=ry+rh/2;
  txt(ctx,l,20,mid+4,{s:fit(ctx,l,180,13*k),w:700});
  const w1=(cols[0][1]-cols[0][0])*h.own/maxDown;ctx.fillStyle=PAL['s4'];ctx.fillRect(cols[0][0],mid-bh/2,Math.max(2,w1),bh);
  const s1=kk==='gift'?'$0 (family paid '+$(h.down)+')':$(h.own);txt(ctx,s1,cols[0][0],mid+bh/2+14*k,{s:fit(ctx,s1,cols[0][1]-cols[0][0],12*k,400),c:ink});
  const miT=h.uf+h.mi,w2=(cols[1][1]-cols[1][0])*miT/maxMi;if(miT>0){ctx.fillStyle=PAL['s1'];ctx.fillRect(cols[1][0],mid-bh/2,Math.max(2,w2),bh);}
  const s2=miT>0?(kk==='fha'?`${$(miT)} (incl. ${$(h.uf)} upfront)`:`${$(miT)}${h.miStop&&h.miStop<=y*12?`, ends month ${h.miStop}`:''}`):'None';txt(ctx,s2,cols[1][0],mid+bh/2+14*k,{s:fit(ctx,s2,cols[1][1]-cols[1][0],12*k,400),c:ink});
  const s3=$(h.first);txt(ctx,s3,cols[2][0],mid+4,{s:fit(ctx,s3,cols[2][1]-cols[2][0],14*k),w:700});
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(20,ry+rh);ctx.lineTo(790,ry+rh);ctx.stroke();});
 const n='Same house, same rate. Payments are principal, interest and mortgage insurance only.';txt(ctx,n,20,446-4*k,{s:fit(ctx,n,760,12*k,400),c:soft});}

/* ---------- "How good is this number?" ---------- */
const BADGE={law:['Law or rule','s3'],admin:['Records','s2'],survey:['Survey','s4'],model:['Modeled','s5'],press:['Press report','s6'],assume:['Assumption','s1']};
const QUAL=[
 ['Basic budget, Dallas and Aurora','$2,895.83 and $3,116.08 a month','model','MIT Living Wage Calculator, Feb 2026, built from government cost data','Typical costs for one adult, not what any real household spends'],
 ['Basic budget, Quito','$562.50 a month','assume','From the Cost of living tool: the official bus fare plus labeled assumptions','Rent and food are guesses; no official one-adult budget for Quito was found'],
 ['Money left in a normal month','5% of pay (range 0% to 15%)','assume','Set by you at Closer look','The most important unknown: it decides whether a debt can shrink'],
 ['Slow weeks with no work','about 3.4 a year','survey','U.S. Financial Diaries: poor households averaged 3.4 income dips a year (235 households, 12 months)','Not a random sample; U.S. households, applied here to Quito too'],
 ['Getting sick','20% chance a month, 2 days (range 10% to 30%)','assume','No source found for this exact rate','Real illness is far less even: some people are sick often, most rarely'],
 ['Delayed care gets worse','50% of uninsured illnesses (range 25% to 75%)','assume','Illustration','The tool cannot know who delays care or why'],
 ['Emergency room visit (U.S.)','$750 (range $610 to $1,500)','admin','AHRQ HCUP, 2021: average hospital cost of a treat-and-release visit; $610 for self-pay','Hospital cost, not the bill; the $1,500 high end is an assumption'],
 ['Out-of-pocket care (Quito)','$60 (range $20 to $100)','assume','Public care is free under Ecuador’s Constitution, Art. 362, yet households pay 30.9% of health spending out of pocket (WHO, 2023)','Mostly medicines and private visits during long public queues'],
 ['Family emergency','$400, 7.2% chance a month','survey','Fed SHED 2025: 59% had a major unexpected expense in a year; $400 is its benchmark','Size is an assumption; Quito uses $400 × 0.4252 (World Bank price level, 2025)'],
 ['Check-cashing fee (U.S.)','2.2% of each check (range 1.1% to 3%)','law','New York’s legal maximum, 2023; 1.1% (New York, 1998) and 3% (Chicago Fed, 2001)','No current Texas or Colorado figure was found'],
 ['Texas payday loan','$34.14 per $100 a month, up to $507','admin','Texas OCCC disclosure (2022 lender reports); average loan $507 (2023)','Lender reports show loans, not why people borrowed'],
 ['Colorado small loan','36% APR cap, up to $633','law','Proposition 111 (2018); average loan $633 (Colorado AG study, 2021 data)','A cap limits the price, not whether you get approved (64.9% were, 2021)'],
 ['Quito chulco','1,238% a year, $230 loan','press','Equifax survey of 113 people (2021), reported by Primicias and Expreso','Tiny sample, reported as the average in one article and the top in another'],
 ['Credit card and Ecuador caps','22.15% APR; 16.77% and 28.23%','admin','Federal Reserve G.19, Q2 2026; BCE legal maximums, Nov 2026','Averages and ceilings; your own rate can differ'],
 ['Time on cash errands','2 hours a month (range 1 to 4)','assume','Illustration','No survey of this was found']];
function qualHTML(){return '<p><b>How good is this number?</b> Each input, how it was measured and what it misses. A calculator is only as good as the numbers going in, and the people hardest to measure are often the ones it is about.</p><table class="ptab" style="width:100%;border-collapse:collapse;font-size:.9em"><tr><th align="left">Input</th><th align="left">Used</th><th align="left">Kind</th><th align="left">What it misses</th></tr>'+
 QUAL.map(([n,u,k,s,m])=>`<tr style="border-top:1px solid var(--line)"><td><b>${n}</b><br><span style="opacity:.8">${s}</span></td><td>${u}</td><td><span style="display:inline-block;padding:1px 6px;border-radius:8px;border:1px solid currentColor;white-space:nowrap">${BADGE[k][0]}</span></td><td>${m}</td></tr>`).join('')+'</table>';}
function hidesHTML(sim){const R=model(sim),c=R.c,Fm=R.F.hist,Im=R.I.hist;const low=Math.min(...Im.map(h=>h.net));
 return `<p><b>What this number hides.</b> The total adds up a whole ${R.N===12?'year':'run'} into one figure. It hides the month the informal worker reached ${$(low)} (savings minus debt and unpaid bills), the ${R.I.behind} month${R.I.behind===1?'':'s'} with bills left unpaid, and anyone whose pay is not counted at all. In ${c.name==='Quito'?'Ecuador, informal work and cash pay leave no payroll record, and counts of Venezuelan migrants disagree by half (474,945 estimated by the aid agencies’ working group, 231,686 counted by the 2022 census)':'the U.S., cash pay leaves no payroll record, and the IRS estimates $117 billion of business income from sole proprietors went unreported in 2022'}. A model built on averages also smooths away the person who gets sick three months in a row.${hon()?` And a headline mortgage rate hides what a small down payment adds: in the home example, ${$(homes(sim).fha.uf+homes(sim).fha.mi)} of FHA insurance in ${homeYears(sim)} years that never shows in the 7.18%.`:''}</p>`;}

const SIM={
 id:'povertypremium',hash:'povertypremium',apUnit:20,order:6,tab:'The cost of being poor',kind:'Simulation',next:['costofliving','livingwage'],
 skills:{bio:'Unit rates, percents and adding up a total · Algebra 1 (Unit 2), Algebra 2 (Unit 5)',honors:'A month-by-month recurrence and a reinforcing feedback loop · Algebra 2 (Unit 5)',ap:'Exponential growth, expected value and the debt-trap line D* = m ÷ r · Algebra 2 (Unit 5), Statistics (Chapter 6)'},
 card:'Run two workers through the same year of shocks, one formal and banked, one informal and unbanked, and guess how much more the year costs the one with less.',
 title:'Why it costs more to have less',
 lede:{bio:'Two workers earn the same pay per day and get the same bad luck: a sick day, a slow week, a family emergency, a broken phone. One has a steady job, sick pay, a bank account and health coverage. The other is paid only for the days worked. Use rates and percents to add up what the same shocks cost each one.',
  honors:'The extra costs feed each other. A missed week becomes a loan, the loan’s fee eats next month’s cushion, and the next shock lands harder. That is a reinforcing feedback loop. Switch cost categories on and off, and give the informal worker one protection at a time to see which one breaks the loop.',
  ap:'With monthly slack m and monthly rate r, a debt D can only shrink while rD < m. Above D* = m/r it is an absorbing state: a debt trap. Compare APR with fee per $100, compounding with rollovers, and the expected cost of a risk (probability × cost), then run the model with its uncertain inputs at their low and high ends.'},
 scale:'One adult, month by month, for one year (up to five at Deep dive). Dollars are U.S. dollars in all three cities; Ecuador uses the dollar.',
 aspect:16/9,timeless:true,trials:false,graph:true,
 controlsTitle:'The two workers',
 controls:[
  {id:'guess',label:'Your gut: how many more dollars does the year cost the informal worker?',type:'range',min:0,max:50000,step:50,def:1000,unit:'',d:0,help:'Both workers face exactly the same shocks. Count everything extra the informal worker loses or pays.'},
  {id:'view',label:'Look at',type:'seg',def:'year',noGut:true,onChange:sim=>{sim.infoDirty=true;},options:[{v:'year',l:'The same bad year'},{v:'boots',l:'Cheap boots'},{v:'home',l:'Buying a home',lvl:'honors'}],help:'The boots and the home are side examples. Your gut answer is about the year.'},
  {id:'city',label:'City',type:'seg',def:'dallas',noGut:true,onChange:setCity,options:[{v:'dallas',l:'Dallas'},{v:'aurora',l:'Aurora'},{v:'quito',l:'Quito'}]},
  {id:'protect',label:'Give the informal worker one protection',type:'seg',def:'none',noGut:true,onChange:clearGut,options:PROT.map(([v,l])=>({v,l})),help:'What breaks the loop? Try one at a time.'},
  {id:'quality',label:'How good is this number?',type:'toggle',def:false,noGut:true,help:'Shows how each input was measured and what it misses.',onChange:sim=>{sim.infoDirty=true;}},
  {id:'c_lost',label:'Count lost pay',type:'toggle',def:true,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'c_health',label:'Count health costs',type:'toggle',def:true,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'c_bank',label:'Count bank-access fees',type:'toggle',def:true,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'c_borrow',label:'Count borrowing costs',type:'toggle',def:true,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'c_time',label:'Count time (hours on cash errands × pay)',type:'toggle',def:true,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'margin',label:'Money left over in a normal month (% of pay)',type:'range',min:0,max:15,step:1,def:5,unit:'%',lvl:'honors',noGut:true,onChange:clearGut,help:'An assumption. Pay is set so a normal month covers the basic budget with this much to spare.'},
  {id:'years',label:'Years to run',type:'range',min:1,max:5,step:1,def:1,unit:' yr',lvl:'ap',noGut:true,onChange:clearGut},
  {id:'lrate',label:'Informal worker’s lender: percent per month',type:'range',min:1,max:110,step:0.01,def:34.14,unit:'%',lvl:'ap',noGut:true,onChange:clearGut,help:'Defaults: Texas payday 34.14% (OCCC), Colorado cap 3% (36% a year), Quito chulco 103.17% (1,238% a year ÷ 12).'},
  {id:'cfee',label:'Check-cashing fee (% of each paycheck, U.S.)',type:'range',min:1,max:3,step:0.1,def:2.2,unit:'%',lvl:'ap',noGut:true,onChange:clearGut},
  {id:'b_cheap',label:'Boots: price of the cheap pair ($)',type:'range',min:5,max:40,step:1,def:10,unit:'',d:0,noGut:true},
  {id:'b_clife',label:'Boots: years the cheap pair lasts',type:'range',min:0.5,max:5,step:0.5,def:1,unit:' yr',noGut:true},
  {id:'b_good',label:'Boots: price of the good pair ($)',type:'range',min:20,max:150,step:5,def:50,unit:'',d:0,noGut:true},
  {id:'b_glife',label:'Boots: years the good pair lasts',type:'range',min:2,max:15,step:1,def:10,unit:' yr',noGut:true},
  {id:'hprice',label:'Home: price ($)',type:'range',min:250000,max:700000,step:5000,def:450000,unit:'',d:0,lvl:'honors',noGut:true,help:'An example price for an Aurora home, not a measured median.'},
  {id:'hyears',label:'Home: years you keep the loan',type:'range',min:1,max:30,step:1,def:10,unit:' yr',lvl:'honors',noGut:true},
  {id:'pmi',label:'Home: private mortgage insurance rate (% of the loan a year)',type:'range',min:0.36,max:0.84,step:0.01,def:0.51,unit:'%',lvl:'ap',noGut:true,help:'Freddie Mac: about $30 to $70 a month per $100,000 borrowed (0.36% to 0.84% a year); its example uses 0.51%.'}
 ],
 actions:[
  {id:'show',label:'Skip the guess and show the totals',run(sim){sim.peek=true;sim.infoDirty=true;}},
  {id:'newyear',label:'New run of shocks',run(sim){sim.st.seed=1+Math.floor(Math.random()*100000);clearGut(sim);}},
  {id:'firstyear',label:'Back to the first run',run(sim){sim.st.seed=SEED0;clearGut(sim);}}
 ],
 init(){return {seed:SEED0};},step(){},
 metrics:[
  {id:'gap',label:'Extra cost for the informal worker',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim).tot:null},
  {id:'gaphrs',label:'The same, in hours of their work',unit:'hours',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim).tot/model(sim).wage:null},
  {id:'debt',label:'Informal worker: debt at the end',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim).I.D},
  {id:'behind',label:'Informal worker: months ending with unpaid bills',unit:'months',d:0,min:0,max:null,get:sim=>model(sim).I.behind},
  {id:'fsave',label:'Formal worker: savings at the end',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim).F.B},
  {id:'shares',label:'Where the extra cost comes from',lvl:'honors',text:true,get:sim=>{if(!shown(sim))return 'Lock in your gut first.';const R=model(sim),t=R.tot;return CATS.filter(([k,,,l])=>atLeast(l)).map(([k,l])=>`${l} ${$(R.g[k])}${Math.abs(t)>1?` (${Math.round(100*R.g[k]/t)}%)`:''}`).join(' · ');}},
  {id:'later',label:'Later in life: paying into social insurance',lvl:'honors',text:true,get:sim=>{const R=model(sim),Pay=R.Pay,w=R.wage;
   if(sim.p.city==='quito'){const vol=0.176*Math.max(482,Pay);return `Formal: 9.45% to IESS, ${$2(0.0945*Pay)} a month (employer adds 11.15%). Informal: $0, or join alone at 17.6%: ${$2(vol)} a month, ${f1(vol/w)} hours of work.`;}
   return `Formal: 7.65% withheld, ${$2(0.0765*Pay)} a month. Informal: 15.3% if reported as self-employment (${$2(0.153*Pay)}, ${f1(0.153*Pay/w)} hours); unreported cash work builds no record.`;}},
  {id:'trap',label:'Trap line: debt that can never shrink',unit:'dollars',d:0,lvl:'ap',min:0,max:null,get:sim=>{const R=model(sim),r=R.I.r;return r>0?Math.max(0,slack(sim))/r:null;}},
  {id:'apr',label:'Informal lender: APR (rate per month × 12)',unit:'%',d:1,lvl:'ap',min:0,max:null,get:sim=>12*P(sim,'lrate',C(sim).lr)},
  {id:'ear',label:'If unpaid fees were added every month: growth in a year',unit:'%',d:0,lvl:'ap',min:0,max:null,get:sim=>100*(Math.pow(1+P(sim,'lrate',C(sim).lr)/100,12)-1)},
  {id:'range',label:'Extra cost with the uncertain inputs at their low and high ends',lvl:'ap',text:true,get:sim=>{if(!shown(sim))return 'Lock in your gut first.';const [a,b]=rangeOf(sim);return `${$(a)} to ${$(b)} (this run: ${$(model(sim).tot)})`;}},
  {id:'bootsc',label:'Boots: 10 years of cheap pairs',unit:'dollars',d:0,min:0,max:null,get:sim=>boots(sim).tc},
  {id:'bootsg',label:'Boots: 10 years of good pairs',unit:'dollars',d:0,min:0,max:null,get:sim=>boots(sim).tg},
  {id:'mifha',label:'Home: mortgage insurance paid, FHA 3.5% down',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>{const h=homes(sim).fha;return h.uf+h.mi;}},
  {id:'miconv',label:'Home: mortgage insurance paid, 5% down',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>homes(sim).conv.mi},
  {id:'ufint',label:'Home: interest paid on the financed FHA upfront premium',unit:'dollars',d:0,lvl:'ap',min:0,max:null,get:sim=>homes(sim).fha.ufInt}
 ],
 graphs:[{id:'cum',label:'The gap growing, month by month',custom:true},{id:'roll',label:'Borrow $500 and roll it over',lvl:'honors',custom:true},{id:'chain',label:'Texas payday renewals: a chain',lvl:'ap',custom:true}],defaultGraph:'cum',
 plot(sim,ctx,box,id){const R=model(sim);
  if(id==='roll'){const q=sim.p.city==='quito',Ls=q?[['Chulco (103.17% a month)',1238/12,PAL['s1']],['Cooperative microcredit (28.23% a year)',100*(Math.pow(1.2823,1/12)-1),PAL['s3']],['Consumer loan cap (16.77% a year)',100*(Math.pow(1.1677,1/12)-1),PAL['s2']]]:[['Texas payday ($34.14 per $100 a month)',34.14,PAL['s1']],['Colorado cap (36% a year)',3,PAL['s4']],['Credit card (22.15% a year)',22.15/12,PAL['s2']]];
   const top=Math.max(...Ls.map(l=>500*l[1]/100*12))*1.12;const ax=axes(ctx,box,{xmin:0,xmax:12,ymin:0,ymax:top,xl:'Months rolled over (paying only the fee)',yl:'Fees paid on $500'});
   Ls.forEach(([l,r,col])=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let n=0;n<=12;n++){const y=500*r/100*n;n?ctx.lineTo(ax.X(n),ax.Y(y)):ctx.moveTo(ax.X(n),ax.Y(y));}ctx.stroke();
    if(ap()){ctx.setLineDash([5,4]);ctx.beginPath();for(let n=0;n<=12;n++){const y=Math.min(top,500*(Math.pow(1+r/100,n)-1));n?ctx.lineTo(ax.X(n),ax.Y(y)):ctx.moveTo(ax.X(n),ax.Y(y));}ctx.stroke();ctx.setLineDash([]);}});
   legend(ctx,box.L+10,box.T+12,Ls.map(l=>({label:l[0],color:l[2]})).concat(ap()?[{label:'Dashed: fees added to the debt (compounding)',color:PAL['cv-soft'],dash:true}]:[]));return;}
  if(id==='chain'){const ax=axes(ctx,box,{xmin:0,xmax:8,ymin:0,ymax:100,xl:'Number of renewals (n)',yl:'% of new borrowers renewing at least n times'});
   const pts=[[0,100],[1,42.5],[2,27.5],[5,10]];ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2.5;ctx.setLineDash([6,4]);ctx.beginPath();for(let n=2;n<=8;n+=0.1){const y=27.5*Math.pow(0.714,n-2);n===2?ctx.moveTo(ax.X(n),ax.Y(y)):ctx.lineTo(ax.X(n),ax.Y(y));}ctx.stroke();ctx.setLineDash([]);
   pts.forEach(([n,v])=>{ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(ax.X(n),ax.Y(v),6,0,7);ctx.fill();txt(ctx,v+'%',ax.X(n)+9,ax.Y(v)-8,{s:12,w:700,c:PAL['s1']});});
   legend(ctx,box.L+box.W*0.35,box.T+12,[{label:'Texas OCCC, 2022 lender reports',color:PAL['s1']},{label:'Geometric model: 71.4% renew again',color:PAL['s5'],dash:true}]);return;}
  const N=R.N,top=Math.max(10,...R.I.cum,...R.F.cum,(sim.gutS&&sim.gutS.g)?sim.gutS.g.guess:0)*1.1;
  const ax=axes(ctx,box,{xmin:0,xmax:N,ymin:0,ymax:top,xl:'Month',yl:'Running total of extra costs ($)'});
  if(!shown(sim)){txt(ctx,pending(sim)?'Work out the total to see the running totals.':'Lock in your gut to see the running totals.',box.L+box.W/2,box.T+box.H/2,{s:13,c:PAL['muted'],a:'center'});return;}
  const line=(arr,col)=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));arr.forEach((v,i)=>ctx.lineTo(ax.X(i+1),ax.Y(v)));ctx.stroke();};
  ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.15;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));R.I.cum.forEach((v,i)=>ctx.lineTo(ax.X(i+1),ax.Y(v)));for(let i=N-1;i>=0;i--)ctx.lineTo(ax.X(i+1),ax.Y(R.F.cum[i]));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  line(R.F.cum,PAL['s2']);line(R.I.cum,PAL['s1']);
  const G=sim.gutS;if(G&&G.g){const y=ax.Y(Math.min(top,G.g.guess+R.F.cum[N-1]));ctx.strokeStyle=PAL['s4'];ctx.setLineDash([6,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(N*0.6),y);ctx.lineTo(ax.X(N),y);ctx.stroke();ctx.setLineDash([]);txt(ctx,'Your gut',ax.X(N*0.6)-6,y+4,{s:12,w:700,c:PAL['s4'],a:'right'});}
  legend(ctx,box.L+10,box.T+12,[{label:'Informal worker',color:PAL['s1']},{label:'Formal worker',color:PAL['s2']},{label:'Shaded: the gap',color:PAL['s1']}]);},
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(VIEW(sim)==='boots')return drawBoots(sim,ctx,k);if(VIEW(sim)==='home'&&hon())return drawHome(sim,ctx,k);
  const R=model(sim),N=R.N,sh=shown(sim),G=sim.gutS||{};
  const X0=Math.round(30+34*k),X1=520,cw=(X1-X0)/N,ink=PAL['cv-ink'],soft=PAL['cv-soft'];
  const titY=8+13*k,keyY=titY+6+13*k;
  const t1=`Same shocks, two workers · ${R.c.name} · ${N===12?'12 months':N+' months'}`;txt(ctx,t1,X0-34*k+4,titY,{s:fit(ctx,t1,X1-20,13*k),w:700});
  /* line key */
  const fz=fit(ctx,'Formal, banked, insured   Informal, unbanked, uninsured',X1-X0+20,12*k,400);ctx.font='400 '+fz+'px '+FONT;
  let kx=X0-24;[['Formal, banked, insured',PAL['s2']],[sim.p.protect&&sim.p.protect!=='none'?'Informal + '+PROTNAME[sim.p.protect]:'Informal, unbanked, uninsured',PAL['s1']]].forEach(([l,c2])=>{ctx.fillStyle=c2;ctx.fillRect(kx,keyY-fz*0.45,18,4);txt(ctx,l,kx+22,keyY,{s:fz,c:ink,b:'middle'});kx+=ctx.measureText(l).width+40;});
  /* shock strip */
  const sy=keyY+14+10*k,iz=Math.max(3,Math.min(7*k,cw*0.32)),rows=['sick','slow','emerg','phone'];
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X0,sy-iz-4,X1-X0,4*(2*iz+3)+6);
  R.S.forEach((s,m)=>{const x=X0+(m+0.5)*cw;rows.forEach((kd,j)=>{if(s[kd])icon(ctx,kd,x,sy+j*(2*iz+3),iz,PAL[ICOL[kd]]);});});
  txt(ctx,'Shocks',X0-6,sy+iz*1.5,{s:12*k,c:soft,a:'right',b:'middle'});
  /* chart of savings minus debt and unpaid bills */
  const cT=sy+4*(2*iz+3)+16+16*k,cB=450-26-30*k;
  const all=R.F.hist.concat(R.I.hist).map(h=>h.net);let hi=Math.max(100,...all),lo=Math.min(-100,...all);const pad=(hi-lo)*0.08;hi+=pad;lo-=pad;
  const Y=v=>cT+(hi-v)/(hi-lo)*(cB-cT);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const step=[100,200,500,1000,2000,5000,10000,20000].find(s=>(hi-lo)/s<=5)||50000;
  for(let v=Math.ceil(lo/step)*step;v<=hi;v+=step){const y=Y(v);ctx.globalAlpha=.5;ctx.beginPath();ctx.moveTo(X0,y);ctx.lineTo(X1,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,$(v),X0-6,y+4,{s:12*k,c:soft,a:'right'});}
  ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X0,Y(0));ctx.lineTo(X1,Y(0));ctx.stroke();
  /* fare rise marker */
  const capY=cT-8,fx=X0+6*cw,lab='Savings minus debt and unpaid bills',cz=fit(ctx,lab,Math.max(150,fx-X0-10),12*k,400);ctx.font='400 '+cz+'px '+FONT;const lw=ctx.measureText(lab).width;
  txt(ctx,lab,X0,capY,{s:cz,c:soft});
  if(N>=7){ctx.strokeStyle=soft;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(fx,capY-10*k);ctx.lineTo(fx,cB);ctx.stroke();ctx.setLineDash([]);const fl='Bus fare rises',flx=Math.max(fx+4,X0+lw+14);txt(ctx,fl,flx,capY,{s:fit(ctx,fl,X1-flx-4,12*k,400),c:soft});}
  const path=(H,col)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X0,Y(H===R.F.hist?R.c.emerg:(sim.p.protect==='fund'?R.c.emerg:0)));H.forEach((h,i)=>ctx.lineTo(X0+(i+1)*cw,Y(h.net)));ctx.stroke();};
  path(R.F.hist,PAL['s2']);path(R.I.hist,PAL['s1']);
  /* month labels */
  const ev=N<=12?1:N<=24?3:12;for(let m=0;m<N;m+=ev){txt(ctx,String(m+1),X0+(m+0.5)*cw,cB+16*k,{s:12*k,c:soft,a:'center'});}
  txt(ctx,'Month',X0-8,cB+16*k,{s:12*k,c:soft,a:'right'});
  /* right panel: the extra cost */
  const PX=548,PW=232;let py=titY;const head=sh?'Extra cost for the informal worker':(pending(sim)?'Extra cost: work it out first':'Extra cost: lock in your gut first');txt(ctx,head,PX,py,{s:fit(ctx,head,PW,13*k),w:700});py+=10+14*k;
  const cats=CATS.filter(([kk,,,l])=>atLeast(l)),maxv=Math.max(1,...cats.map(([kk])=>Math.abs(R.g[kk])));
  const rowH=Math.min(46,(cB-py-70*k)/cats.length);
  cats.forEach(([kk,l,col])=>{const on=inputs(sim).on[kk];txt(ctx,l,PX,py+12*k,{s:fit(ctx,l,PW*0.62,12*k,700),c:on?ink:PAL['muted']});
   const v=R.g[kk],bw=(PW-4)*Math.abs(v)/maxv;
   if(sh){const s=on?$(v):'off';txt(ctx,s,PX+PW,py+12*k,{s:fit(ctx,s,PW*0.36,12*k),w:700,a:'right',c:on?ink:PAL['muted']});if(on){ctx.fillStyle=PAL[col];ctx.fillRect(PX,py+16*k,Math.max(2,bw),Math.max(6,rowH-22*k));}}
   else{txt(ctx,'?',PX+PW,py+12*k,{s:12*k,w:700,a:'right',c:soft});ctx.strokeStyle=PAL['line'];ctx.setLineDash([4,4]);ctx.strokeRect(PX,py+16*k,PW-4,Math.max(6,rowH-22*k));ctx.setLineDash([]);}
   py+=rowH;});
  py+=6;ctx.strokeStyle=ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PX,py);ctx.lineTo(PX+PW,py);ctx.stroke();py+=6+14*k;
  if(sh){const s1=`Total ${$(R.tot)}`;txt(ctx,s1,PX,py,{s:fit(ctx,s1,PW,15*k),w:700,c:PAL['s1']});py+=8+13*k;
   const s2=`= ${f0(R.tot/R.wage)} hours of work (${f1(R.tot/R.wage/HRS)} months)`;txt(ctx,s2,PX,py,{s:fit(ctx,s2,PW,12*k,400),c:ink});py+=8+13*k;}
  else{const s1='Total ?';txt(ctx,s1,PX,py,{s:15*k,w:700,c:soft});py+=8+13*k;}
  if(G.g){const s3=`Your gut: ${$(G.g.guess)}`;txt(ctx,s3,PX,py,{s:fit(ctx,s3,PW,12*k),w:700,c:PAL['s4']});py+=8+13*k;}
  /* at the reveal: each piece as a count × rate */
  if(G.m&&sh){const lh=6+12*k,lim=450-8-6*k-16*k;pieces(sim).filter(q=>q.k!=='borrow').forEach(q=>{if(py>lim)return;const s4=`${q.l} = ${q.f}`;txt(ctx,s4,PX,py,{s:fit(ctx,s4,PW,12*k,400),c:soft});py+=lh;});}
  /* icon legend */
  const legY=450-8-6*k;let lz=12*k;const items=[['sick','Sick'],['esc','Untreated, comes back'],['slow','Slow week'],['emerg','Emergency'],['phone','Broken phone']];
  ctx.font='400 '+lz+'px '+FONT;let tw=items.reduce((a,[,l])=>a+ctx.measureText(l).width+lz+20,0);if(tw>770){lz=Math.max(12,lz*770/tw);ctx.font='400 '+lz+'px '+FONT;tw=items.reduce((a,[,l])=>a+ctx.measureText(l).width+lz+20,0);}
  let lx=Math.max(8,400-tw/2);items.forEach(([kd,l])=>{icon(ctx,kd,lx+lz*0.45,legY-lz*0.3,lz*0.4,PAL[ICOL[kd]]);txt(ctx,l,lx+lz+4,legY,{s:lz,c:ink});lx+=ctx.measureText(l).width+lz+20;});
  /* mark months where an untreated illness came back */
  for(let m=1;m<N;m++){const s=R.S[m-1];if(s.sick&&s.escU<PS.esc&&inputs(sim).on.health&&sim.p.protect!=='insured'){const x=X0+(m+0.5)*cw;icon(ctx,'esc',x,sy,iz*0.75,PAL['s1']);}}},
 narrate(sim){if(VIEW(sim)==='boots'){const b=boots(sim);
   if(b.tc>b.tg)return `<b>Cheap boots cost more:</b> ${b.nc} pairs at ${$(b.cp)} is ${$(b.tc)} over 10 years, against ${$(b.tg)} for ${b.ng} good pair${b.ng===1?'':'s'}. That is ${$2(b.yc)} a year of use against ${$2(b.yg)}. The catch: the good pair needs ${$(b.gp)} all at once.`;
   return `With these prices the cheap boots really are cheaper: ${$(b.tc)} over 10 years against ${$(b.tg)}. The premium only appears when the better item lasts long enough to beat its price.`;}
  if(VIEW(sim)==='home'&&hon()){const H=homes(sim),y=homeYears(sim);return `Over ${y} year${y===1?'':'s'}, the 3.5%-down FHA buyer pays ${$(H.fha.uf+H.fha.mi)} in mortgage insurance and the 5%-down buyer ${$(H.conv.mi)}. <b>The buyer with 20% down, saved or given by family, pays none</b>, and the gift buyer paid ${$(0)} of their own. The insurance prices the extra risk of a small down payment; it is what makes those loans possible at all.`;}
  const R=model(sim),c=R.c,I=R.I,F=R.F,sh=shown(sim),m=slack(sim);
  const slow=R.S.filter(s=>s.slow).length,sick=R.S.filter(s=>s.sick).length,em=R.S.filter(s=>s.emerg).length;
  let s=`Over ${yrsTxt(R.N)} the same shocks hit both workers: ${sick} sick spell${sick===1?'':'s'}, ${slow} slow week${slow===1?'':'s'} and ${em} family emergenc${em===1?'y':'ies'}. `;
  if(I.D>0.5&&I.r*I.D>=m-0.01)s+=`<b>The informal worker is in a debt trap:</b> the ${c.name==='Quito'?'lender’s':'loan’s'} fee each month (${$(I.D*I.r)}) is bigger than the ${$(m)} left over in a normal month${R.c.check&&sim.p.protect!=='bank'?' after the check casher’s cut':''}, so the debt cannot shrink. `;
  else if(I.behind>0)s+=`<b>The informal worker ends ${I.behind} month${I.behind===1?'':'s'} behind on bills</b>, while the formal worker ends with ${$(F.B)} saved. `;
  else s+=`<b>Both workers get through without falling behind.</b> `;
  if(sh)s+=`In all, the informal worker pays ${$(R.tot)} more over ${yrsTxt(R.N)}: ${f0(R.tot/R.wage)} hours of their work.`;
  else s+=pending(sim)?'Add up the pieces in <b>Your turn</b> to see the total.':'Lock in your gut to see what it all adds up to.';
  if(sim.p.protect&&sim.p.protect!=='none'){const b=model(sim,{protect:'none'});{const dlt=b.tot-R.tot;s+=` Giving them ${PROTNAME[sim.p.protect]} ${dlt>=0?'cuts':'raises'} the extra cost by ${$(Math.abs(dlt))}.`;}}
  return s;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Look at the year above: the same shocks hit both workers. Drag the slider here to how many more dollars you think the year costs the informal worker in all (lost pay, health, fees and borrowing). Then lock it in.',
   honors:'Drag the slider here to your gut for the informal worker’s extra cost, with the categories and protection you have set. Then lock it in.'},
  hint:{bio:'Lock in your gut answer. Then you will add up the real number yourself from its pieces.'},
  lock(sim){const R=model(sim);return {v:Math.abs(sim.p.guess-R.tot),guess:sim.p.guess,label:$(sim.p.guess)};},
  calc:{unit:'$',d:0,tol:a=>Math.max(10,0.005*Math.abs(a)),
   prompt:sim=>{const R=model(sim),L=pieces(sim);if(!L.length)return 'Every cost category is switched off, so there is nothing to add. What is the extra cost?';
    return `Work out the informal worker’s extra cost for ${yrsTxt(R.N)} from its pieces:<br>`+L.map(q=>'• '+q.t).join('<br>')+'<br><b>What is the total, in dollars?</b>';},
   answer:sim=>model(sim).tot,
   hint:'Work out each piece (a count times a rate, or a percent of an amount), then add them all.',
   steps(sim){const R=model(sim),L=pieces(sim),out=L.map(q=>q.s);
    const sum=L.reduce((t,q)=>t+q.h,0);out.push(`Total: ${L.length?L.map(q=>$c(q.h)).join(' + ').replace(/\+ −/g,'− '):'$0'} = <b>${$c(sum)}</b>, about ${$(R.tot)}.`);
    if(R.tot>0)out.push(`In hours of their work: ${$(R.tot)} ÷ ${$c(R.wage)} an hour ≈ ${f0(R.tot/R.wage)} hours, about ${f1(R.tot/R.wage/HRS)} months of full-time pay.`);
    return out;}},
  formula(sim){const R=model(sim),L=pieces(sim),line=`Extra cost = ${L.length?L.map(q=>`${q.f} (${q.l.toLowerCase()})`).join(' + '):'$0'} = ${$(R.tot)}`;
   if(!ap())return line;const m=slack(sim),r=R.I.r;return r>0?line+`<br>Trap line: D* = m ÷ r = ${$c(Math.max(0,m))} ÷ ${(+r.toFixed(4))} = ${$(Math.max(0,m)/r)}`:line;},
  solve(sim){const R=model(sim);sim.peek=true;sim.infoDirty=true;return {v:0,guess:R.tot,label:`${$(R.tot)}, or ${f0(R.tot/R.wage)} hours of their work`};},
  how:{bio:'The math runs both workers month by month. Each month: pay earned (no work, no pay for the informal worker), minus spending and fees. A shortfall comes out of savings first, then a loan. Every extra dollar the informal worker loses or pays gets added up.',
   honors:'Each month the model updates savings S, debt D and unpaid bills U. Interest on D is charged first, so a shortfall this month raises next month’s costs: a reinforcing loop. The total is the sum over months of (lost pay + health + fees + interest + time) for the informal worker, minus the same for the formal worker.',
   ap:'The run is a recurrence: Dₙ₊₁ = Dₙ(1 + r) − paymentₙ + new borrowingₙ. When rDₙ is at least the monthly slack m, payments can never reduce Dₙ, so the state is absorbing. The total gap is Σ over months of each cost category’s difference.'},
  compare(sim,g,m){const R=model(sim),d=Math.abs(g.guess-R.tot),hrs=R.tot/R.wage,K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You also added it up yourself from the pieces.':'';
   if(d<=Math.max(100,0.1*R.tot))return `Your gut was close: ${$(g.guess)} against ${$(R.tot)}. That is ${f0(hrs)} hours of the informal worker’s pay, about ${f1(hrs/HRS)} months of full-time work.`+self;
   return `You guessed ${$(g.guess)}. The model adds up <b>${$(R.tot)}</b>, ${g.guess<R.tot?'more':'less'} than your gut by ${$(d)}. For this worker that extra cost is <b>${f0(hrs)} hours of work</b>, about ${f1(hrs/HRS)} months of full-time pay. ${(()=>{const top=CATS.filter(([kk])=>inputs(sim).on[kk]).reduce((a,c2)=>R.g[c2[0]]>R.g[a[0]]?c2:a);return `The biggest piece here is <b>${top[1].toLowerCase()}</b>: ${$(R.g[top[0]])}.`;})()}`+self;},
  again(sim){sim.st.seed=1+Math.floor(Math.random()*100000);sim.peek=false;sim.p.guess=1000;}
 },
 infoPanel(sim){if(sim.p.quality)return qualHTML();
  let h='';if(shown(sim)){const rk=ranking(sim);h+=`<p><b>What breaks the loop?</b> Each protection alone, given to the informal worker in ${C(sim).name} for this run:</p><ol>`+rk.map(r=>`<li>${r.l}: cuts the extra cost by <b>${$(r.cut)}</b></li>`).join('')+'</ol><p>Who could provide each one, and whether they should, is a values question; the math only says how much each one changes.</p>';}
  else h+='<p><b>What breaks the loop?</b> Lock in your gut, then this panel ranks the protections.</p>';
  return h+hidesHTML(sim)+'<p>Turn on <b>How good is this number?</b> to see how each input was measured.</p>';},
 challenges:[
  {lvl:'bio',kind:'num',q:'A different worker, a different year: 14 unpaid days at $120 a day, a check casher taking 2.2% of the $30,000 they were paid, and $450 in loan fees. What do these three pieces add up to?',answer:2790,tol:5,unit:'$',d:0,hint:'Multiply the days by the daily pay, take 2.2% of $30,000, then add the fees.',explain:'Lost pay: 14 × $120 = $1,680. Check cashing: 0.022 × $30,000 = $660. Total: $1,680 + $660 + $450 = $2,790.'},
  {lvl:'bio',instant:true,q:'Cheap boots cost $10 and last a year. Good boots cost $50 and last ten years. Over ten years, how do the cheap boots compare?',choices:['They save you $40','They cost the same','They cost $50 more','They cost $90 more'],correct:2,explain:'Ten cheap pairs cost 10 × $10 = $100. One good pair costs $50. That is $10 a year of use against $5. The catch is the up-front price: the good pair needs $50 at once.'},
  {lvl:'bio',instant:true,q:'A payday loan charges $15 for every $100 you borrow for two weeks. What yearly rate (APR) is that?',choices:['15% a year','About 30% a year','About 390% a year','About 1,500% a year'],correct:2,explain:'There are 26 two-week periods in a year, so the rate is 15% × 26 = 390% a year (the CFPB says “almost 400 percent”). A fee that sounds small is huge once you count how often it repeats.'},
  {lvl:'bio',instant:true,q:'In the first Dallas run, which extra cost is biggest for the informal worker?',choices:['Check-cashing fees','Payday-loan fees','Pay lost on days without work','Health costs'],correct:2,explain:'Lost pay is $3,658 of the $7,202: three slow weeks, three sick spells and two more days when an untreated illness came back, all with no pay. Fees on the payday loan come second at $1,768. “No work that day, no pay” is the biggest premium, and it is what pushes the worker into borrowing.'},
  {lvl:'bio',instant:true,q:'The headline says the informal worker’s year costs $7,202 more. What does that one number hide?',choices:['Nothing: it includes every cost','The months the worker was far behind on bills, and people whose pay is never recorded','Only the formal worker’s savings'],correct:1,explain:'A yearly total averages away the hard months: in this run the informal worker ends 9 of 12 months with unpaid bills. And income that is paid in cash never shows up in payroll records, so the people living this year are the hardest to count.'},
  {lvl:'honors',instant:true,q:'Give the Dallas informal worker one protection in the first run. Which cuts their extra cost the most?',choices:['A bank account','Health coverage','Steady hours','A $400 savings cushion'],correct:2,explain:'Steady hours cut the extra cost by $2,477, from $7,202 to $4,725. Low-cost credit cuts $1,678, sick pay $1,461, a bank account $1,309, health coverage $849 and a $400 cushion $383. The loop starts with lost income, so protecting income breaks it best here. In Quito the answer changes: low-cost credit cuts the most ($2,341), because the chulco’s rate dominates.'},
  {lvl:'honors',instant:true,q:'The FDIC (2023) estimates 6.5% of Texas households and 1.1% of Colorado households are unbanked. The 90% ranges are 5.5% to 7.7% for Texas and 0.2% to 6.5% for Colorado. What can you conclude?',choices:['Colorado is exactly six times better','Texas is probably higher, but Colorado’s survey sample is so small that its range overlaps Texas’s','The two are the same'],correct:1,explain:'A survey estimate comes with a margin. Colorado’s range runs up to 6.5%, which overlaps the bottom of Texas’s 5.5% to 7.7%. Smaller samples give wider ranges, and the households hardest to reach are often the unbanked ones.'},
  {lvl:'honors',instant:true,q:'A $450,000 Aurora home at 7.18%. Over 10 years, about how much mortgage insurance does the buyer with 3.5% down (FHA) pay, counting the 1.75% upfront premium?',choices:['About $7,600','About $15,000','About $30,400','About $60,000'],correct:2,explain:'Upfront: 1.75% × $434,250 = $7,599, added to the loan. Annual premium: 0.55% a year of the balance, about $203 a month at first, for the life of the loan: $22,834 in 10 years. Total about $30,434. The buyer with 20% down pays none. Insurance lets the lender accept a small down payment; without it, many of these buyers could not borrow at all.'},
  {lvl:'ap',instant:true,q:'Texas payday loans average $34.14 per $100 per month. If unpaid fees were added to the debt each month, how much would $100 grow to in a year?',choices:['About $510','About $1,410','About $3,400','About $9,400'],correct:2,explain:'(1.3414)¹² ≈ 33.9, so $100 grows to about $3,390. The APR, 34.14% × 12 ≈ 410%, does not count compounding; the effective annual growth is about 3,290%.'},
  {lvl:'ap',instant:true,q:'A Dallas worker has $152.41 left over in a normal month (5% of $3,048.24). The payday rate is 34.14% a month. Above what debt can the debt never shrink?',choices:['About $52','About $446','About $1,524','There is no such line'],correct:1,explain:'The debt shrinks only if the monthly fee rD is less than the slack m. D* = m ÷ r = 152.41 ÷ 0.3414 ≈ $446. The average Texas payday loan ($507) is already above the line. For the unbanked worker it is worse: the check casher’s 2.2% leaves $85.35, so D* ≈ $250, and the model’s $340 loan is trapped from month 1.'},
  {lvl:'ap',instant:true,q:'The uninsured worker has a 20% chance each month of getting sick, and half of those illnesses come back as a $750 emergency visit. What is the expected cost of that risk per year?',choices:['$150','$900','$1,800','$9,000'],correct:1,explain:'Expected cost = number of chances × probability × cost = 12 × 0.2 × 0.5 × $750 = $900 a year. Insurance turns that uncertain risk into a known price; without it the cost arrives in lumps, often in a month already short.'}
 ],
 tour:[
  {title:'Boots theory',text:'A cheap pair of boots costs $10 and lasts about a year. A good pair costs $50 and lasts ten. Over ten years the cheap boots cost 10 × $10 = $100 and the good ones $50. The good pair needs $50 at once; with $10 to spare, the cheap pair is the one you can buy. That gap is the poverty premium in one picture.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'boots',b_cheap:10,b_clife:1,b_good:50,b_glife:10})},
  {title:'Two workers, one set of shocks',text:'Both workers earn the same pay per day in Dallas. The blue line is the formal worker: steady job, sick pay, a bank account, health coverage and a $400 cushion. The red line is the informal worker: paid only for days worked, no bank account, no coverage, no cushion. Across the top, dots are sick spells, squares slow weeks, triangles family emergencies, the tall bar a broken phone: the same for both.',pause:true,setup:sim=>{BioLab.setValues(sim,{view:'year',city:'dallas',protect:'none'});sim.st.seed=SEED0;},focus:[[0,0,530,450]]},
  {title:'No work, no pay',text:'Month 1: a sick spell (2 unpaid days) and a broken phone. The formal worker is paid and covers the phone from savings. The informal worker loses $281 of pay, has no savings, and takes a $340 payday loan. Month 4: sick again plus a slow week, 8 days and $1,126 of pay gone.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'year',city:'dallas',protect:'none'})},
  {title:'The loan feeds itself',text:'The loan costs $34.14 per $100 a month: $116 on $340. After the check casher takes 2.2% of each paycheck, only $85 is left over in a normal month, less than the fee. So the debt grows even in quiet months: $412 by month 3, then the $507 limit in month 4. Every shock after that becomes unpaid bills.',pause:true},
  {title:'Adding it up',text:'Over the year the informal worker pays $7,202 more: $3,658 in lost pay, $1,768 in loan fees, $724 to cash checks, $630 more for health and $422 of time. That is 410 hours of their work, about 2.4 months of full-time pay.',pause:true,focus:[[540,0,260,450]]},
  {lvl:'honors',title:'What breaks the loop',text:'Give the informal worker steady hours: the extra cost falls to $4,725. Try each protection; the panel below ranks them. Then try Aurora: Colorado caps small loans at 36% a year (3% a month), so the borrowing cost is $176 instead of Dallas’s $1,768. The tradeoff: a cap sets the price, not whether a lender says yes.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'year',city:'dallas',protect:'steady'})},
  {lvl:'honors',title:'A home, and who pays to insure it',text:'Same Aurora house, same rate. With 3.5% down, an FHA buyer pays mortgage insurance for the life of the loan; with 5% down, private insurance until the loan reaches 78% of the price; with 20% down, none. A family gift of the 20% skips it entirely. Read the panel: the cost of a small down payment is invisible in the interest rate.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'home',hprice:450000,hyears:10})},
  {lvl:'ap',title:'The trap line',text:'With slack m and monthly rate r, the debt can only shrink while rD < m. In Dallas the unbanked worker keeps m = $152.41 − $67.06 (the check casher’s 2.2%) = $85.35, so D* = 85.35 ÷ 0.3414 ≈ $250. Above it the debt is absorbing. Give them a bank account and D* rises to $446; lower the rate or raise the margin and watch the trap line move.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'year',city:'dallas',protect:'none'})}
 ],
 lab:{bio:'<p><b>Question:</b> Which city makes the same bad year cost the most extra, in dollars and in hours?</p><ol><li>Lock in your gut for Dallas, then read the total in dollars and hours.</li><li>Switch to Aurora and Quito and write down both numbers for each.</li><li>Rank the cities both ways.</li></ol><p>Write one sentence: why can a city with smaller dollar costs have the larger cost in hours?</p>',
  honors:'<p><b>Question:</b> Which protection breaks the loop best, and does it depend on the city?</p><ol><li>For each city, try each protection and record the extra cost.</li><li>Turn the cost categories off one at a time. Which category feeds the others?</li><li>Change the money left over from 5% to 10%. Does the ranking change?</li></ol><p>Write two sentences: one on what the math shows, and one on who could provide the protection that helps most. The second is a values question.</p>',
  ap:'<p><b>Question:</b> When does a short-term loan become a debt trap?</p><ol><li>For Dallas, record the trap line and the debt at the end for margins of 3%, 5%, 8% and 12%.</li><li>Find the lender rate at which the Dallas worker escapes within a year.</li><li>Run 5 years and record the uncertainty range. Which assumption moves it most?</li><li>Model the Texas renewal data as a Markov chain: from “owing,” 71.4% renew again. Find the expected number of renewals after the second.</li></ol><p><b>CER:</b> Claim when the debt is absorbing, evidence from your table, and reasoning from D* = m/r. Say which inputs are sourced and which are assumptions.</p>'},
 terms:[
  {t:'Informal work',d:'Work without the protections of a formal job: no contract, no social insurance, no paid sick days. If you do not work that day, you do not get paid.'},
  {t:'Poverty premium',d:'The extra amount people with less money pay for the same things: fees to cash a check, higher loan rates, care that costs more because it was delayed.'},
  {t:'Unbanked',d:'Having no checking or savings account at a bank or credit union.'},
  {t:'APR',d:'Annual percentage rate: the yearly cost of a loan. A fee per period × the number of periods in a year.'},
  {t:'Rollover',d:'Paying only a loan’s fee and borrowing the same amount again for another period.'},
  {t:'Informal sector vs. informal employment',d:'Informal sector counts people in unregistered businesses. Informal employment counts unprotected jobs, including those inside registered businesses. They give different numbers.',lvl:'honors'},
  {t:'Reinforcing feedback loop',d:'A change that causes more of itself: a shortfall leads to a loan, whose fee causes the next shortfall.',lvl:'honors'},
  {t:'Margin of error',d:'The range around a survey estimate. A 90% range means the true value is very likely inside it.',lvl:'honors'},
  {t:'Expected value',d:'Probability × cost, summed over outcomes: the average cost of a risk over many tries.',lvl:'ap'},
  {t:'Absorbing state',d:'A state you cannot leave once you enter it. Here: a debt whose monthly fee is at least what you have left over.',lvl:'ap'},
  {t:'Effective annual rate',d:'(1 + r)¹² − 1 for a monthly rate r: the growth in a year when unpaid charges are added to the balance.',lvl:'ap'}
 ],
 about:''
};
SIM.about='<p><b>This is a simplified model for learning, not financial, medical or legal advice.</b> No numbers you enter leave this browser tab.</p>'+
 '<p><b>“It is expensive to be poor.”</b> Barbara Ehrenreich’s essay of that name (<a href="https://www.theatlantic.com/business/archive/2014/01/it-is-expensive-to-be-poor/282979/" target="_blank" rel="noopener"><i>The Atlantic</i>, January 2014</a>) and her book <i>Nickel and Dimed</i> (2001), in which she worked low-wage jobs for a year, made the idea widely known: people with little money often pay more for the same things. <b>Boots theory</b> comes from Terry Pratchett’s novel <i>Men at Arms</i> (1993): a city guard reasons that a $50 pair of boots lasts for years while $10 boots wear out in a season or two, so over ten years the poorer man spends about $100 and still has wet feet. In January 2022 the UK campaigner Jack Monroe named a proposed price index for budget groceries the Vimes Boots Index (<a href="https://fortune.com/2022/01/27/uk-inflation-figure-income-groups-anti-poverty-jack-monroe-terry-pratchett-vimes/" target="_blank" rel="noopener">Fortune</a>), and “boots theory” is now common shorthand for the poverty premium. The boots math: pairs bought in 10 years = ⌈10 ÷ lifespan⌉; total = pairs × price; cost per year of use = price ÷ lifespan. A UK study put the average poverty premium at about £490 a year per low-income household (<a href="https://www.bristol.ac.uk/media-library/sites/geography/pfrc/pfrc1614-poverty-premium-key-findings.pdf" target="_blank" rel="noopener">University of Bristol, 2016</a>), a modeled estimate weighted by how many households face each premium.</p>'+
 '<p><b>The model.</b> Pay is set so a normal month covers the basic budget with a margin left over (5% unless you change it): pay = budget ÷ (1 − margin). A full-time month is 173.33 hours, 21.67 workdays. Both workers earn the same pay per day, so the gap comes only from protections and prices. Each month: income = pay × (1 − unpaid days ÷ 21.67); spending = budget + shocks + health + fees; interest = debt × monthly rate. A surplus pays unpaid bills, then debt, then savings. A shortfall uses savings, then a loan up to the lender’s limit, then becomes unpaid bills. In real life unpaid bills bring late fees, shutoffs or eviction; the model only counts them, so over several years its unpaid-bill line grows in a way real life would not allow. The extra cost is the informal worker’s lost pay, health costs, check-cashing fees, interest and time, minus the formal worker’s. Shocks come from a seeded random draw, so the first run is the same every time.</p>'+
 '<p><b>Shocks.</b> Slow week (6 workdays lost) with chance 3.4/12 a month, calibrated to the <a href="https://www.stlouisfed.org/~/media/Files/PDFs/Community%20Development/Econ%20Mobility/Sessions/MorduchPaper508.pdf" target="_blank" rel="noopener">U.S. Financial Diaries</a> (Hannagan and Morduch): poor households averaged 3.4 income dips a year, a dip being a month below 75% of their own average. Sick spell: 2 days, 20% chance a month (assumption); half of uninsured spells come back next month worse, with 2 more days off and an emergency visit (assumption). Family emergency: $400 with a 7.2% monthly chance, from the <a href="https://www.federalreserve.gov/publications/2026-economic-well-being-of-us-households-in-2025-executive-summary.htm" target="_blank" rel="noopener">Fed SHED 2025</a> (59% of adults had a major unexpected expense in a year: 1 − 0.41^(1/12) ≈ 7.2%; 63% could cover $400 with cash). Broken phone: $150, once every two years on average (assumption). Quito’s emergency and phone costs are scaled by 0.4252, Ecuador’s price level relative to the U.S. (World Bank PPP conversion factor, 2025; because Ecuador uses the dollar, this equals the price level ratio). Bus fare: Quito’s council approved a rise from $0.35 to $0.40 from January 2027 (<a href="https://elmercurio.com.ec/nacional/2026/09/08/aprueban-alza-del-precio-del-pasaje-en-quito/" target="_blank" rel="noopener">El Mercurio</a>); the model applies the same 14.3% rise from month 7 in all three cities as an illustration (DART $126 and RTD $88 monthly passes).</p>'+
 '<p><b>Money and credit.</b> Basic budgets: MIT Living Wage Calculator, one adult, Feb 2026 (<a href="https://livingwage.mit.edu/counties/48113" target="_blank" rel="noopener">Dallas County</a>, <a href="https://livingwage.mit.edu/counties/08005" target="_blank" rel="noopener">Arapahoe County</a>); Quito from the <a href="#costofliving">Cost of living</a> tool (official fare plus labeled assumptions). Texas payday: average $34.14 per $100 a month and 415% APR, from 2022 lender reports (<a href="https://occc.texas.gov/sites/default/files/2024-03/cab-disclosure-payday-single-rev2024.pdf" target="_blank" rel="noopener">Texas OCCC disclosure</a>); of 10 new single-payment borrowers, 5¾ repay on time, 1½ renew once, 1¾ renew 2 to 4 times and 1 renews 5 or more times or never pays off; average payday loan $507 in 2023 (<a href="https://occc.texas.gov/sites/default/files/2024-12/2024_study_consumer_loan_products_0.pdf" target="_blank" rel="noopener">OCCC 2024 study</a>). Nationally, the CFPB says $15 per $100 is common, “almost 400 percent” for two weeks (<a href="https://www.consumerfinance.gov/ask-cfpb/what-are-the-costs-and-fees-for-a-payday-loan-en-1589/" target="_blank" rel="noopener">CFPB</a>), and found in 2014 that four of five payday loans are rolled over or renewed within 14 days. Credit cards: 22.15% APR on accounts assessed interest, Q2 2026 (<a href="https://www.federalreserve.gov/releases/g19/20260908/g19.pdf" target="_blank" rel="noopener">Federal Reserve G.19</a>). Ecuador legal maximums, Nov 2026: consumer credit 16.77%, retail microcredit 28.23% effective a year (<a href="https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm" target="_blank" rel="noopener">BCE</a>). Chulco: an Equifax survey of 113 people (2021) found informal lenders charging up to 1,238% a year (<a href="https://primicias.ec/noticias/economia/chulco-creditos-tasas-interes-ecuador" target="_blank" rel="noopener">Primicias</a>); one reported case was a $230 loan costing $237 in a month (<a href="https://www.primicias.ec/economia/prestamos-informales-chulco-chulqueros-tasas-intimidacion-violencia-denuncias-110347/" target="_blank" rel="noopener">Primicias, 2025</a>). This is a small press-reported sample, so try lower rates at Deep dive. Check cashing: New York’s legal maximum is 2.2% (<a href="https://www.dfs.ny.gov/industry_guidance/industry_letters/il20230130_max_check_casher_fee" target="_blank" rel="noopener">NY DFS, 2023</a>); older studies found 1.1% (<a href="https://www.newyorkfed.org/medialibrary/media/research/current_issues/ci4-6.html" target="_blank" rel="noopener">New York Fed, 1998</a>) and an average of 3% (<a href="https://www.chicagofed.org/-/media/publications/chicago-fed-letter/2001/cflfeb2001-162-pdf.pdf" target="_blank" rel="noopener">Chicago Fed, 2001</a>). No current Texas or Colorado figure was found. The model assumes the U.S. informal worker is paid by check; Quito’s is paid in cash, so no check fee.</p>'+
 '<p><b>Colorado’s 36% cap and the tradeoff.</b> Proposition 111 (2018, effective Feb 2019) capped payday loans at 36% APR. Before it, opponents said it could end payday lending in the state. The <a href="https://coag.gov/app/uploads/2023/01/Consumer-lending-study-Jan.-2023.pdf" target="_blank" rel="noopener">Colorado Attorney General’s 2023 study</a> found that lenders making these loans fell from 20 (2018) to 9 (2021), licensed locations fell about 30%, and borrowers fell from just under 200,000 (2018) to 170,867 (2019) and 95,747 (2021, a drop the study ties largely to the pandemic). It also found average finance charges of $104 on loans averaging $633 (2021), 64.9% of applicants approved, and concluded availability was not materially affected because large lenders lend online. Supporters of caps point to lower prices; critics point to fewer lenders and denied applicants. The model assumes the Aurora worker is approved.</p>'+
 '<p><b>Health.</b> Emergency visit: $750, the average hospital cost of a treat-and-release visit in 2021, $610 for self-pay (<a href="https://hcup-us.ahrq.gov/reports/statbriefs/sb311-ED-visit-costs-2021.pdf" target="_blank" rel="noopener">AHRQ HCUP</a>); this is cost, not the bill. Insured copay $40 (assumption). Uninsured, under 65: 24.2% in Dallas County (Census QuickFacts). Arapahoe County: 3.9% and Colorado 4.6% (2023 <a href="https://www.coloradohealthinstitute.org/sites/default/files/2024-02/15_Arapahoe_23CHASProfile.pdf" target="_blank" rel="noopener">Colorado Health Access Survey</a>), a different survey, so the two are not directly comparable. Medical debt: the CFPB found $88 billion on credit reports (June 2021). Ecuador: the Constitution (Art. 362) makes state public health services universal and free, yet households pay 30.9% of current health spending out of pocket (WHO, 2023) against 10.9% in the U.S. (World Bank, 2023). Quito’s $60 out-of-pocket cost per worsened illness is an assumption.</p>'+
 '<p><b>Sick pay and work injuries.</b> Colorado’s Healthy Families and Workplaces Act gives employees 1 hour of paid sick leave per 30 hours worked, up to 48 hours a year; independent contractors are not employees. Texas has no state requirement; a federal court struck down Dallas’s ordinance in 2021 (<a href="https://www.littler.com/news-analysis/asap/federal-court-strikes-down-dallas-paid-sick-leave-ordinance" target="_blank" rel="noopener">Littler</a>). Nationally, 63% of workers in the lowest-paid quarter had paid sick leave, against 95% in the top quarter (<a href="https://www.bls.gov/charts/employee-benefits/percent-access-paid-leave-by-wage.htm" target="_blank" rel="noopener">BLS, March 2026</a>). In Ecuador, an employer pays an affiliated worker’s first 3 sick days and IESS pays from day 4, after 180 days of contributions (Expreso). Texas lets private employers opt out of workers’ compensation: 24% of employers and 13% of private-sector employees were outside it in 2024 (<a href="https://tdi.texas.gov/wc/dwc/biennial24.html" target="_blank" rel="noopener">Texas Department of Insurance</a>). Supporters see employer choice; critics see injured workers without guaranteed benefits.</p>'+
 '<p><b>Social insurance and later life.</b> Ecuador: employees pay 9.45% to IESS and employers 11.15%; self-employed and voluntary members pay 17.6% of a base of at least $482, about $84.83 a month (<a href="https://eldiario.ec/ecuador/tipos-afiliacion-al-iess-aportes-mensuales-13072026/" target="_blank" rel="noopener">El Diario, 2026</a>). Only about 34% of employed people had contributory social security in 2022 (INEC, cited by the <a href="https://www.social-protection.org/gimi/ShowCountryProfile.action?iso=EC" target="_blank" rel="noopener">ILO</a>). The ILO reports that 44% of people 65 and older have neither a pension nor labor income (Primicias, 2024). U.S.: employees pay 6.2% for Social Security and 1.45% for Medicare; the self-employed pay 12.4% and 2.9% (<a href="https://www.ssa.gov/oact/progdata/taxRates.html" target="_blank" rel="noopener">SSA</a>). Workers without legal papers often cannot get formal jobs, accounts or coverage. SSA’s actuaries estimated that about 3.1 million unauthorized immigrants worked and paid Social Security taxes in 2010, contributing about $13 billion with their employers, while about $1 billion in benefits came from earnings in years a worker was unauthorized (<a href="https://ssa.gov/oact/NOTES/pdf_notes/note151.pdf" target="_blank" rel="noopener">SSA Actuarial Note 151, 2013</a>). In Ecuador, a 2024 World Bank note reports that 18% of Venezuelan migrants have access to the financial system, against 64% of Ecuadorians, with lack of regular status the main barrier, and that IESS contributions require a visa.</p>'+
 '<p><b>How hard it is to count.</b> Ecuador’s INEC counts 52.8% of workers in the informal sector, businesses of under 100 workers without a tax registration (RUC), May 2026; rural 76%, urban 40%. ILO-based estimates of informal employment, which also count unprotected jobs in registered firms, are near 70%. Mean labor income was $471 a month (May 2026), below the $482 minimum; a mean can be pulled by a few high earners, which is why a median is often better for income. The U.S. has no official informality rate: 13% of adults sold things and 9% did short-term tasks for pay in the gig or resale sectors (SHED 2024); 4.3% of workers were contingent and 7.4% independent contractors (BLS, July 2023); the IRS estimates $117 billion in unreported sole-proprietor income (2022). Unbanked households (<a href="https://fdic.gov/household-survey/2023-fdic-national-survey-unbanked-and-underbanked-households-appendix-tables" target="_blank" rel="noopener">FDIC, 2023</a>): 4.2% nationally, Texas 6.5% (90% range 5.5% to 7.7%), Dallas-Fort Worth 4.7% (2.9% to 7.5%), Colorado 1.1% (0.2% to 6.5%). Ecuador: 65% of adults have an account (Global Findex, 2024 survey, as reported by El Universo). Ecuador’s income poverty was 21.4% and multidimensional poverty 41.7% (December 2025): the answer depends on what you measure. Diaries, bank records and surveys each see a different slice, and the people this tool is about are the ones most often missed.</p>'+
 '<p><b>Buying a home: mortgage insurance.</b> The same $450,000 Aurora house (an example price, not a measured median; the city reports a median home value of $350,200 from the 2017 to 2021 ACS) at 7.18%, the 30-year average for the week of Nov 5, 2026 (<a href="https://fred.stlouisfed.org/series/MORTGAGE30US" target="_blank" rel="noopener">Freddie Mac PMMS via FRED</a>), on a 30-year fixed loan. FHA (<a href="https://archives.hud.gov/news/2024/2023-05hsgml.pdf" target="_blank" rel="noopener">HUD Mortgagee Letter 2023-05</a>): an upfront premium of 1.75% of the base loan, added to the loan here so interest accrues on it, and an annual premium of 0.55% for loans over 95% of the value (0.50% at 90% to 95%), for the life of the loan when the down payment is under 10% (11 years otherwise). The tool approximates the annual premium as 0.55% of each month’s balance ÷ 12. Conventional with 5% down: private mortgage insurance, which Freddie Mac says costs about $30 to $70 a month per $100,000 borrowed; its example uses 0.51% a year (<a href="https://myhome.freddiemac.com/buying/breaking-down-pmi" target="_blank" rel="noopener">Freddie Mac</a>). Under the Homeowners Protection Act of 1998 it ends automatically when the loan is scheduled to reach 78% of the original value, and a borrower may ask to cancel at 80% (<a href="https://files-prod.consumerfinance.gov/f/documents/201508_cfpb_compliance-bulletin_private-mortgage-insurance-cancellation-and-te_jpbfQUl.pdf" target="_blank" rel="noopener">CFPB</a>). Real PMI prices also depend on credit score. Is it a tax on having less? Not technically: FHA premiums go to the FHA’s insurance fund and PMI to private insurers, and they price the higher chance that a small-down-payment loan is not repaid. Without that insurance many of these buyers could not get a loan at all. The family-gift case shows the other side: a gift of the down payment removes the insurance cost entirely, so family wealth carries an advantage forward. Taxes, homeowners insurance and closing costs are left out.</p>'+
 '<p><b>Not modeled yet.</b> Education costs (Ecuador caps private-school supply and uniform costs at $482 a year from 2026–27; see <a href="#stickernet">sticker vs. net price</a> for college), deposits for renting without a credit history, car insurance priced by credit (<a href="#carquote">car quotes</a>), prepaid phone plans, distance to full grocery stores, ID fees (Texas $16, Colorado $14, Ecuador $16 to renew a cédula), and sending money home (<a href="https://rjedtech.github.io/Raider-CivicsLab/#remittances" target="_blank" rel="noopener">remittances in CivicsLab</a>).</p>'+
 '<p><b>Who provides a protection.</b> It differs: employers (steady hours, sick pay), laws and programs (sick-leave laws, rate caps, public health care, social insurance), banks, credit unions and cooperatives (accounts, small loans), and families and friends (a cushion).</p>'+
 '<p><b>Why this matters.</b> Financial-diary studies find that households with low, irregular income run many tools at once: side work, family loans, savings clubs and lenders (<a href="https://www.microsave.net/wp-content/uploads/2023/08/PoP_BN_9_Three_Country_Analysis.pdf" target="_blank" rel="noopener"><i>Portfolios of the Poor</i>, Brief 9</a>; Edin and Lein, <i>Making Ends Meet</i>, 1997). Managing that takes skill. Catholic teaching has long addressed lending at high rates to people in need. The Catechism (§2269) names “usurious and avaricious dealings” that lead to the hunger of others (<a href="https://www.vatican.va/archive/ENG0015/__P7Z.HTM" target="_blank" rel="noopener">Vatican</a>), and Pope Leo XIV said in 2025 that “usurious financial systems can bring entire peoples to their knees” (<a href="https://www.vatican.va/content/leo-xiv/en/speeches/2025/october/documents/20251018-consulta-antiusura.html" target="_blank" rel="noopener">Vatican</a>). A question to reflect on: when does a price for risk become something else, and who should decide? The tool does not answer that; it measures what each protection changes. If money stress at home weighs on you, RJ counseling is there to talk, or you can use Safe2Tell.</p>';
BioLab.register(SIM);
})();
