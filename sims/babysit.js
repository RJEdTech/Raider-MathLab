(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* What 12 families pay a sitter now, in $ per hour. Each list has a 6th and 7th value that match, so the median is one of the rates. */
const AREAS={
 street:{name:'your street',rates:[17,18,19,19,20,20,20,21,21,22,24,40],odd:40,oddTxt:'pays a professional nanny'},
 across:{name:'across town',rates:[12,18,19,20,20,21,21,21,22,22,23,24],odd:12,oddTxt:'pays a younger sitter'},
 cousin:{name:'your cousin’s street',rates:[17,18,19,20,20,21,21,22,22,23,24,25],odd:null,oddTxt:''}
};
const HRS=4;                                       /* one 4-hour night per family per month */
const R0=12,R1=44,XL=60,XR=770,X=r=>XL+(r-R0)/(R1-R0)*(XR-XL);
const BASE=300;
const A=sim=>AREAS[sim.p.area];
const rates=sim=>A(sim).rates;
const K=sim=>atLeast('ap')?sim.p.nights:6;
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
const med=a=>{const b=a.slice().sort((x,y)=>x-y),n=b.length,h=n>>1;return n%2?b[h]:(b[h-1]+b[h])/2;};
const sd=a=>{const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)*(v-m),0)/(a.length-1));};
const nPay=(a,r)=>a.filter(t=>t>=r-1e-9).length;          /* families who pay at least r */
const nights=(sim,r)=>Math.min(K(sim),nPay(rates(sim),r));
const earn=(sim,r)=>HRS*r*nights(sim,r);
/* The best rate is always one of the listed rates: between two of them, raising the rate earns more and books the same families. */
function best(sim){let br=rates(sim)[0],be=-1;rates(sim).forEach(r=>{const e=earn(sim,r);if(e>be+1e-9||(Math.abs(e-be)<1e-9&&r>br)){be=e;br=r;}});return br;}
const money=v=>'$'+(Math.abs(v-Math.round(v))<0.005?String(Math.round(v)):v.toFixed(2));
const TOUR=sim=>!!(sim.tour&&sim.tour.on);
const GS=sim=>TOUR(sim)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'babysit',hash:'babysit',apUnit:13,order:2,tab:'What should I charge?',kind:'Simulation',
 card:'Set your babysitting rate by feel, then see why the middle of the list, not the average, fills your calendar.',
 title:'What should you charge for babysitting?',
 lede:{bio:'You asked 12 families what they pay a sitter. One number on the list is way out of line with the rest. Should your rate follow the average, or the middle of the list?',
  honors:'The median is resistant: one extreme value barely moves it. The mean is not. When a distribution is skewed, the mean is pulled toward the long tail, and the median is the better “typical” value.',
  ap:'With K free nights and families who book you only at or below what they pay now, the best rate is the K-th highest rate on the list. With 6 nights and 12 families, that is the median: the 50th percentile.'},
 scale:'Each dot is one family and the hourly rate it pays a sitter now. Each family wants one 4-hour night a month.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your rate',
 controls:[
  {id:'rate',label:'Your hourly rate',type:'range',min:12,max:44,step:0.5,def:14,unit:' $/h'},
  {id:'area',label:'Rates you collected',type:'seg',def:'street',noGut:true,onChange:clearGut,options:[{v:'street',l:'Your street'},{v:'across',l:'Across town'},{v:'cousin',l:'Your cousin’s street'}]},
  {id:'show',label:'Show the average, the median and who books you',type:'toggle',def:false,noGut:true},
  {id:'nights',label:'Free nights you have each month',type:'range',min:3,max:9,step:1,def:6,lvl:'ap',noGut:true,onChange:clearGut,help:'With school and practice, how many nights can you sit?'}
 ],
 actions:[{id:'best',label:'Charge the best rate',lvl:'honors',run(sim){BioLab.setValues(sim,{rate:best(sim),show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'earn',label:'You earn each month',unit:'$',d:0,min:0,max:null,get:sim=>shown(sim)?earn(sim,sim.p.rate):null},
  {id:'booked',label:'Nights booked',unit:'',d:0,min:0,max:9,get:sim=>shown(sim)?nights(sim,sim.p.rate):null},
  {id:'pay',label:'Families who pay at least your rate',unit:'of 12',d:0,min:0,max:12,get:sim=>shown(sim)?nPay(rates(sim),sim.p.rate):null},
  {id:'mean',label:'Average (mean) rate on the list',unit:'$/h',d:2,min:0,max:40,get:sim=>mean(rates(sim))},
  {id:'median',label:'Middle (median) rate on the list',unit:'$/h',d:2,min:0,max:40,get:sim=>med(rates(sim))},
  {id:'meanx',label:'Mean without the most extreme rate',unit:'$/h',d:2,lvl:'honors',min:0,max:40,get:sim=>{const a=rates(sim),o=A(sim).odd;if(o===null)return mean(a);const i=a.indexOf(o);return mean(a.filter((v,j)=>j!==i));}},
  {id:'sd',label:'Standard deviation of the rates',unit:'$/h',d:2,lvl:'ap',min:0,max:20,get:sim=>sd(rates(sim))},
  {id:'best',label:'Best rate for your free nights',unit:'$/h',d:2,lvl:'ap',min:0,max:40,get:sim=>best(sim)}
 ],
 graphs:[{id:'curve',label:'Monthly earnings vs. your rate',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const top=Math.max(100,Math.ceil(earn(sim,best(sim))*1.15/100)*100);
  const ax=axes(ctx,box,{xmin:R0,xmax:R1,ymin:0,ymax:top,xl:'Your hourly rate ($)',yl:'You earn each month ($)'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();let prev=null;for(let r=R0;r<=R1+1e-9;r+=0.05){const y=ax.Y(earn(sim,r));if(prev!==null&&Math.abs(prev-y)>30)ctx.moveTo(ax.X(r),y);else if(prev===null)ctx.moveTo(ax.X(r),y);else ctx.lineTo(ax.X(r),y);prev=y;}ctx.stroke();
  const dot=(r,col,lab,dy)=>{const y=ax.Y(earn(sim,r));ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(r),y,6,0,7);ctx.fill();txt(ctx,lab,ax.X(r)+8,y+dy,{s:12,w:700,c:col});};
  const G=GS(sim);if(G&&G.g)dot(G.g.r,PAL['s4'],'Your gut',18);
  dot(sim.p.rate,PAL['rj'],'You',-10);},
 draw(sim,ctx,vdt,k){const sh=shown(sim),hon=atLeast('honors'),a=rates(sim),r=sim.p.rate,kk=k,G=GS(sim),Kn=K(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* calendar of free nights */
  const n=nights(sim,r),cw=Math.min(64,520/Kn),cx0=400-cw*Kn/2;
  txt(ctx,`Your ${Kn} free nights this month`,400,22*kk,{s:13*kk,w:700,a:'center'});
  for(let i=0;i<Kn;i++){const x=cx0+i*cw+4,y=26*kk+6,w=cw-8,h=40;const on=sh&&i<n;
   ctx.fillStyle=on?PAL['s3']:PAL['card'];ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.rect(x,y,w,h);ctx.fill();ctx.stroke();
   txt(ctx,on?money(HRS*r):(sh?'open':'?'),x+w/2,y+h/2+1,{s:12*kk,w:700,c:on?'#fff':PAL['cv-soft'],a:'center',b:'middle'});}
  if(sh)pill(ctx,`${n} night${n===1?'':'s'} × ${HRS} h × ${money(r)} = ${money(earn(sim,r))} a month`,400,26*kk+6+40+18*kk,PAL['rj'],'#fff',13*kk);
  /* axis */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(XL,BASE+2);ctx.lineTo(XR,BASE+2);ctx.stroke();
  for(let v=R0;v<=R1;v+=2){const x=X(v);ctx.beginPath();ctx.moveTo(x,BASE+2);ctx.lineTo(x,BASE+7);ctx.stroke();if(v%4===0||kk<1.3)txt(ctx,'$'+v,x,BASE+22*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'What each family pays a sitter now, per hour',400,BASE+42*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});
  /* families as dots */
  const seen={},gap=24;a.forEach(t=>{seen[t]=(seen[t]||0)+1;const x=X(t),y=BASE-12-(seen[t]-1)*gap,books=sh&&t>=r-1e-9;
   ctx.fillStyle=sh?(books?PAL['s3']:PAL['muted']):PAL['s2'];ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.fill();});
  const o=A(sim).odd;if(o!==null){const x=X(o);txt(ctx,A(sim).oddTxt,clamp(x,XL+90*kk,XR-90*kk),BASE-34-12*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
  /* mean and median */
  if(sh){const mu=mean(a),m=med(a),xm=X(mu),xd=X(m),near=Math.abs(xm-xd)<140*kk;
   const vline=(x,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x,150);ctx.lineTo(x,BASE+2);ctx.stroke();ctx.setLineDash([]);};
   vline(xd,PAL['s5'],[]);vline(xm,PAL['s4'],[6,4]);
   const ml=(hon?'median ':'middle ')+money(m),al=(hon?'mean ':'average ')+money(mu);
   const left=xm<xd;
   txt(ctx,ml,xd+(left?6:-6),164,{s:12*kk,w:700,c:PAL['s5'],a:left?'left':'right'});
   txt(ctx,al,xm+(left?-6:6),near?164+18*kk:164,{s:12*kk,w:700,c:PAL['s4'],a:left?'right':'left'});
  }
  /* your rate */
  const xr=X(r);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(xr,150);ctx.lineTo(xr,BASE+2);ctx.stroke();
  const gx=G&&G.g&&Math.abs(G.g.r-r)>0.01?X(G.g.r):null;
  if(gx!==null){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(gx,150);ctx.lineTo(gx,BASE+2);ctx.stroke();ctx.setLineDash([]);}
  const ry=BASE+70*kk>440?440:BASE+70*kk;
  pill(ctx,(G&&G.m&&Math.abs(G.m.r-r)<0.01?'The math: ':'Your rate: ')+money(r)+' an hour',clamp(xr,110*kk,800-110*kk),ry,PAL['rj'],'#fff',13*kk);
  if(gx!==null)txt(ctx,'Your gut '+money(G.g.r),gx+(gx<xr?-6:6),BASE-100,{s:12*kk,w:700,c:PAL['s4'],a:gx<xr?'right':'left'});
  if(sh&&!hon&&kk<1.3)txt(ctx,'Green: would book you',12,56,{s:12*kk,c:PAL['s3'],w:700});},
 onClick(sim,x,y){const r=clamp(R0+(x-XL)/(XR-XL)*(R1-R0),R0,R1);BioLab.setValues(sim,{rate:Math.round(r*2)/2});},
 narrate(sim){const a=rates(sim),r=sim.p.rate,mu=mean(a),m=med(a),Kn=K(sim);
  if(!shown(sim))return `Twelve families, twelve rates, from ${money(Math.min(...a))} to ${money(Math.max(...a))}. <b>Which number is typical?</b> Set your rate where you think it belongs.`;
  const n=nPay(a,r),bk=nights(sim,r),b=best(sim);
  if(Math.abs(r-b)<0.01)return `<b>${money(r)} is the best rate.</b> ${n} families pay at least that, enough to fill all ${Kn} nights. ${Kn===6?`It is the median: half the list is at or above it.`:''}`;
  if(r>b)return `At ${money(r)} only ${n} famil${n===1?'y pays':'ies pay'} that much, so you fill ${bk} of ${Kn} nights. <b>Too high:</b> ${Math.abs(mu-m)>0.4&&r>=mu-0.01&&mu>m?`the average (${money(mu)}) is pulled up by one extreme rate.`:'lower it and more families book you.'}`;
  return `You fill all ${Kn} nights, but at ${money(r)} you <b>leave ${money(earn(sim,b)-earn(sim,r))} a month on the table</b>. More families pay ${money(b)} than you need.`;},
 gut:{better:'higher',controls:['rate'],
  ask:{bio:'Drag the slider here to the hourly rate you think is typical for these families: the rate you would charge. The red line in the picture moves with it. Then lock it in.',
   honors:'Before you look at the mean and median: drag the slider here to the rate you would charge. Then lock it in.'},
  lock(sim){const r=sim.p.rate;return {v:earn(sim,r),r,n:nights(sim,r),label:`${money(r)} an hour: ${money(earn(sim,r))} a month`};},
  solve(sim){const r=best(sim);sim.p.rate=r;sim.p.show=true;return {v:earn(sim,r),r,n:nights(sim,r),label:`${money(r)} an hour: ${money(earn(sim,r))} a month`};},
  how:{bio:'The math puts the 12 rates in order and finds the middle one. Half the families pay at least that much, enough to fill your 6 nights. The average is no help here: one extreme rate drags it away from the pack.',
   honors:'The median splits the list in half, so 6 of 12 families pay at least it. The mean is not resistant: one extreme rate pulls it toward the tail.',
   ap:'Booking you requires your rate ≤ what the family pays. To fill K nights you need K families at or above your rate, so the best rate is the K-th highest: the (1 − K/12) quantile of the list.'},
  compare(sim,g,m){const a=rates(sim),mu=mean(a),md=med(a),Kn=K(sim),d=m.v-g.v;
   const why=Math.abs(mu-md)>0.4?` The average on this list is ${money(mu)} and the median ${money(md)}: ${mu>md?'one high rate pulls the average up':'one low rate pulls the average down'}.`:'';
   if(d<0.5)return `Your gut was right on: ${money(g.r)} fills all ${Kn} nights and earns ${money(g.v)} a month, the most you can make here.${why}`;
   if(g.r>m.r)return `At ${money(g.r)} only ${nPay(a,g.r)} famil${nPay(a,g.r)===1?'y pays':'ies pay'} that much, so you fill ${g.n} of your ${Kn} nights: ${money(g.v)} a month. At ${money(m.r)} you fill all ${Kn}: ${money(m.v)}. That is <b>${Kn-g.n} lost job${Kn-g.n===1?'':'s'} and ${money(d)} less every month</b>.${why}`;
   return `At ${money(g.r)} you fill all ${Kn} nights, but you <b>leave ${money(d)} a month on the table</b>: ${money(m.r-g.r)} an hour less than these families already pay, over ${Kn*HRS} hours. ${money(m.r)} still fills every night and earns ${money(m.v)}.${why}`;},
  again(sim){const L=['street','across','cousin'];sim.p.area=L[(L.indexOf(sim.p.area)+1)%3];sim.p.rate=14;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'On your street, the average rate is $21.75 but the middle rate (median) is $20. Why is the average higher?',choices:['Most families pay more than $21','One family pays a professional nanny $40, which pulls the average up','The average is always higher than the middle'],correct:1,explain:'The 12 rates add to $261, and $261 ÷ 12 = $21.75. Without the $40 rate, the other 11 average $20.09. One extreme value drags the average toward it; the middle value stays at $20.'},
  {lvl:'bio',instant:true,q:'You charge about the average, $21.50. How many of the 12 families pay at least that much?',choices:['3','6','8','12'],correct:0,explain:'Only the families paying $22, $24 and $40 pay at least $21.50. You fill 3 of your 6 nights: 3 × 4 h × $21.50 = $258 a month, against $480 at $20.'},
  {lvl:'honors',instant:true,q:'The nanny family moves away, so the $40 rate drops off your list. What happens to the mean and the median?',choices:['Both drop by about the same amount','The mean drops to $20.09; the median stays $20','The median drops; the mean stays the same'],correct:1,explain:'The other 11 rates add to $221, and $221 ÷ 11 = $20.09, down from $21.75. The middle of 11 values is the 6th, still $20. The median is resistant to extreme values; the mean is not.'},
  {lvl:'honors',instant:true,q:'Across town, one family pays a younger sitter $12 and the rest pay $18 to $24. Which is true?',choices:['Skewed right: mean above median','Skewed left: mean ($20.25) below median ($21)','Symmetric: mean equals median'],correct:1,explain:'The long tail is on the low side, so the distribution is skewed left, and the $12 rate pulls the mean down to $20.25. The median stays $21. Charge the mean and you leave $18 a month on the table.'},
  {lvl:'ap',instant:true,q:'On your street, you only have 3 free nights a month. What rate earns the most?',choices:['$20, the median','$21.75, the mean','$22, the 3rd highest rate','$40, the highest rate'],correct:2,explain:'You need 3 families at or above your rate, so charge the 3rd highest rate: $22. That earns 3 × 4 × $22 = $264. At $40 only 1 family books you: $160. At $20 you earn 3 × 4 × $20 = $240.'},
  {lvl:'ap',instant:true,q:'For 12 families and K free nights, the best rate is the K-th highest rate. For K = 6, that is the median. Which statement explains why?',choices:['The median is the average of the high and low rates','At least half the values are at or above the median, so 6 of 12 families pay at least it','The median always equals the mean'],correct:1,explain:'By definition at least half the data are at or above the median. With 12 families that is 6, exactly enough to fill 6 nights. Fewer nights move the best rate up to a higher percentile; more nights move it down.'}
 ],
 tour:[
  {title:'Twelve families',text:'Each dot is one family on your street and the hourly rate it pays a sitter now. Each family wants a sitter for one 4-hour night a month, and you have 6 free nights.',pause:true,setup:sim=>BioLab.setValues(sim,{area:'street',rate:14,show:false,nights:6})},
  {title:'One rate is way off',text:'Eleven families pay $17 to $24. One family pays a professional nanny $40. A value far from the rest like this is an outlier.',pause:true,focus:sim=>[X(40)-60,BASE-80,120,90]},
  {title:'The average',text:'Add all 12 rates and divide by 12: $261 ÷ 12 = $21.75. The gold dashed line shows it. The $40 pulls it to the right of most of the dots.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true,rate:14})},
  {title:'The middle',text:'Put the rates in order. The 6th and 7th are both $20, so the middle rate, the median, is $20 (purple line). Half the families pay $20 or more.',pause:true},
  {title:'Charge the average',text:'Charge $21.50, about the average. Only 3 families pay that much (green), so you fill 3 of your 6 nights: $258 a month.',pause:true,setup:sim=>BioLab.setValues(sim,{rate:21.5,show:true})},
  {title:'Charge the median',text:'Charge $20. Eight families pay at least that, more than enough to fill all 6 nights: 6 × 4 h × $20 = $480 a month. Charge $19 and you still fill 6 nights but make only $456.',pause:true,setup:sim=>BioLab.setValues(sim,{rate:20,show:true})},
  {lvl:'honors',title:'Skewed the other way',text:'Across town, one family pays a younger sitter $12. Now the tail is on the low side: the distribution is skewed left, and the mean ($20.25) falls below the median ($21).',pause:true,setup:sim=>BioLab.setValues(sim,{area:'across',rate:21,show:true})},
  {lvl:'ap',title:'Fewer nights, a higher percentile',text:'Back on your street with only 3 free nights, you need just 3 families at or above your rate. The best rate is the 3rd highest, $22: 3 × 4 × $22 = $264 a month.',pause:true,setup:sim=>BioLab.setValues(sim,{area:'street',nights:3,rate:22,show:true})}
 ],
 lab:{bio:'<p><b>Question:</b> Which is the better rate to charge: the average or the middle value?</p><ol><li>Turn on <b>Show the average, the median and who books you</b>.</li><li>For each list of rates, set your rate to the average, record a trial, then set it to the median and record again.</li></ol><p>Write one sentence: on which list do the average and the median agree, and why?</p>',
  honors:'<p><b>Question:</b> How much does one extreme value move the mean and the median?</p><ol><li>For each list, record the mean, the median and the mean without the most extreme rate.</li><li>Press <b>Charge the best rate</b> and compare it with the mean and the median.</li></ol><p>Explain which measure of center is resistant, and describe each list’s shape (skewed right, skewed left or symmetric).</p>',
  ap:'<p><b>Question:</b> How does the best rate depend on how many nights you can work?</p><ol><li>On your street, set your free nights to 3, 4, 5, …, 9. Press <b>Charge the best rate</b> each time and record it.</li><li>For each, find the share of families paying at least that rate.</li></ol><p><b>CER:</b> Claim a rule linking free nights to a percentile of the list, with evidence from your table and reasoning from the definition of a percentile.</p>'},
 terms:[
  {t:'Mean (average)',d:'Add the values and divide by how many there are.'},
  {t:'Median',d:'The middle value when the data are in order. With 12 values, the average of the 6th and 7th.'},
  {t:'Outlier',d:'A value far from the rest of the data, like the $40 nanny rate.'},
  {t:'Resistant',d:'A statistic that extreme values cannot drag far. The median is resistant; the mean is not.',lvl:'honors'},
  {t:'Skewed right / left',d:'A long tail of high (right) or low (left) values. The mean is pulled toward the tail.',lvl:'honors'},
  {t:'Percentile',d:'The p-th percentile is a value with about p% of the data at or below it. The median is the 50th percentile.',lvl:'ap'}
 ],
 about:'<p><b>A simplified model, not financial advice.</b> The rates are made-up but in a realistic range for sitters in the Denver area in 2026. Each of the 12 families wants one 4-hour night a month, and a family books you only if your rate is at or below what it pays now. You earn rate × 4 hours × nights booked, where nights booked is the smaller of your free nights (6 unless you change it at Deep dive) and the number of families who pay at least your rate.</p><p>Under this model the best rate is always one of the listed rates: the K-th highest, where K is your free nights. With 6 nights and 12 families that is the median. Real families also weigh trust, experience, the number of kids and how they found you, so treat this as a way to think about “typical”, not a price list.</p>'
};
BioLab.register(SIM);
})();
