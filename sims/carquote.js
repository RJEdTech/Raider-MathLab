(function(){
'use strict';
const {clamp,txt,pill,rr,rng,randn,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* A teen driver's yearly quote = base rate × one multiplier per rating factor.
   Base $470 and the poor-credit multiplier (1012/470) come from the Consumer Federation of America (2023).
   Every other multiplier is an illustrative assumption, sized so the CFA pattern holds: poor credit costs more than a DUI. */
const BASE=470,POOR=1012/470;
const AGE={16:2.6,17:2.3,18:2.0,19:1.8};
const REC={clean:{m:1,l:'Clean record'},ticket:{m:1.25,l:'One ticket'},dui:{m:1.8,l:'DUI'}};
const CRED={excellent:{m:1,l:'excellent'},good:{m:1.2,l:'good'},fair:{m:1.5,l:'fair'},poor:{m:POOR,l:'poor'}};
const UP={poor:'fair',fair:'good',good:'excellent',excellent:null};
const ZIP={low:{m:0.85,l:'lower-cost'},avg:{m:1,l:'average'},high:{m:1.3,l:'higher-cost'}};
const SHOP={often:{m:0.95,l:'compares every year'},some:{m:1,l:'sometimes compares'},never:{m:1.15,l:'never shops around'}};
const ED=0.90,GOOD=0.85;
const PICK={ed:'Take driver’s ed',grades:'Earn the good-student discount',credit:'Parent’s credit goes up one tier'};
const SEGS=[1,4,16,64,256,1000];
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const x2=v=>'×'+v.toFixed(2);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* While the student works out a saving ("Your turn"), the savings stay hidden. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g))&&!pend(sim);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* the rating factors, in order, for settings p (overrides o) */
/* Big picture fixes the driver at 16 in an average zip; Closer look lets you change both. */
const ageOf=sim=>atLeast('honors')?+sim.p.age:16;
function rows(sim,o){const p=Object.assign({},sim.p,o||{}),hon=atLeast('honors'),h=!!p.healthy,out=[],age=(o&&o.age!==undefined)?+o.age:ageOf(sim),zip=hon?p.zip:'avg';
 out.push({l:'Age '+age,m:AGE[age]||AGE[16]});
 out.push({l:REC[p.record].l,m:REC[p.record].m});
 out.push({l:'Driver’s ed: '+(p.ed?'yes':'no'),m:p.ed?ED:1});
 out.push({l:'Good student: '+(p.good?'yes':'no'),m:p.good?GOOD:1});
 out.push({l:h?'Credit: not used':'Credit: '+CRED[p.credit].l,m:h?1:CRED[p.credit].m,cr:!h});
 out.push({l:'Zip: '+ZIP[zip].l,m:ZIP[zip].m});
 if(hon&&p.app)out.push({l:'App: '+p.brakes+' hard brakes',m:0.8+0.05*p.brakes});
 if(hon)out.push({l:h?'Shop-around: off':'Shop-around score',m:h?1:SHOP[p.shop].m,sh:!h});
 return out;}
function quote(sim,o){return rows(sim,o).reduce((a,r)=>a*r.m,BASE);}
function save(sim,k,o){const p=Object.assign({},sim.p,o||{}),q=quote(sim,o);
 if(k==='ed')return p.ed?0:q-quote(sim,Object.assign({},o,{ed:true}));
 if(k==='grades')return p.good?0:q-quote(sim,Object.assign({},o,{good:true}));
 if(p.healthy||!UP[p.credit])return 0;return q-quote(sim,Object.assign({},o,{credit:UP[p.credit]}));}
const bestPick=sim=>['ed','grades','credit'].reduce((b,k)=>save(sim,k)>save(sim,b)+1e-9?k:b,'ed');
/* the same gap summed over every year until you turn 20 */
function yearsGap(sim,a,b){let s=0;for(let age=ageOf(sim);age<=19;age++)s+=save(sim,a,{age})-save(sim,b,{age});return s;}
const flA=sim=>quote(sim,{record:'clean',credit:'poor'}),flB=sim=>quote(sim,{record:'dui',credit:'excellent'});
/* Pool vs. segments: 2,000 imaginary drivers. True expected claim cost c (mean $1,000); the insurer sorts by a score s that is only partly related to c. */
let POP=null;
function pop(){if(POP)return POP;const r=rng(2016),a=[];for(let i=0;i<2000;i++){const z=randn(r),e=randn(r);a.push({c:1000*Math.exp(0.5*z-0.125),s:0.6*z+0.8*e});}a.sort((x,y)=>x.s-y.s);POP=a;return a;}
const SC={};
function segs(k){k=+k;if(SC[k])return SC[k];const a=pop(),n=a.length,out=[];for(let g=0;g<k;g++){const lo=Math.floor(g*n/k),hi=Math.floor((g+1)*n/k);let s=0;for(let i=lo;i<hi;i++)s+=a[i].c;out.push(s/(hi-lo));}SC[k]=out;return out;}
const spread=k=>{const s=segs(k);return Math.max(...s)-Math.min(...s);};
const ratio=k=>{const s=segs(k);return Math.max(...s)/Math.min(...s);};
const lab=(sim,k)=>{const s=save(sim,k);return `${PICK[k]}: saves ${$(s)} a year`;};
/* "Your turn": what one change saves. The credit step if it is open, else the good-student discount, else driver's ed, else the quote itself. */
const q0=sim=>Math.round(quote(sim));
function target(sim){const p=sim.p;
 if(!p.healthy&&UP[p.credit])return {k:'credit',old:CRED[p.credit].m,nw:CRED[UP[p.credit]].m,what:`your parent’s credit moving from ${CRED[p.credit].l} to ${CRED[UP[p.credit]].l}`};
 if(!p.good)return {k:'grades',old:1,nw:GOOD,what:'earning the good-student discount'};
 if(!p.ed)return {k:'ed',old:1,nw:ED,what:'taking driver’s ed'};return null;}
const f2=v=>v.toFixed(2),f4=v=>String(+v.toFixed(4));
function calcAns(sim){const T=target(sim);if(!T)return q0(sim);return Math.round(q0(sim)*(1-T.nw/T.old)*100)/100;}

const SIM={
 id:'carquote',hash:'carquote',apUnit:19,order:4,tab:'My first car insurance quote',kind:'Simulation',
 skills:{bio:'A base price times a stack of multipliers; savings = quote × (1 − new ÷ old) · Algebra 1 (Unit 2)',honors:'Multipliers and percent change: savings = quote × (1 − new ÷ old) · Algebra 1 (Unit 2)',ap:'Multipliers, and averages over smaller and smaller groups · Algebra 1 (Unit 2), Statistics (Ch. 7)'},
 card:'Guess which change lowers a teen driver’s quote the most, then take the quote apart one multiplier at a time.',
 title:'My first car insurance quote',
 lede:{bio:'Your quote is a base price multiplied by a stack of factors. Some are about how you drive. Some are not about driving at all, like your parent’s credit score. Which ones move the price most?',
  honors:'Multipliers multiply: two discounts of 10% and 15% take off 23.5%, not 25%. Price optimization adds one more factor: how likely you are to shop around, which has nothing to do with risk.',
  ap:'Pricing a whole pool at one average spreads risk across everyone. Cutting the pool into smaller and smaller segments makes prices spread out, and with tiny segments part of that spread is just chance.'},
 scale:'One teen driver’s yearly quote for state-minimum coverage, in dollars. Base rate from a 2023 study; every multiplier is an illustrative assumption.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your quote',
 controls:[
  {id:'pick',label:'Your gut: which one change lowers the quote most?',type:'seg',def:'ed',options:[{v:'ed',l:'Driver’s ed'},{v:'grades',l:'Good grades'},{v:'credit',l:'Parent’s credit up one tier'}]},
  {id:'age',label:'Your age',type:'seg',def:16,lvl:'honors',options:[{v:16,l:'16'},{v:17,l:'17'},{v:18,l:'18'},{v:19,l:'19'}],onChange:clearGut},
  {id:'record',label:'Your driving record',type:'seg',def:'clean',options:[{v:'clean',l:'Clean'},{v:'ticket',l:'One ticket'},{v:'dui',l:'DUI'}],onChange:clearGut},
  {id:'credit',label:'Credit tier of the policyholder (often a parent)',type:'seg',def:'fair',options:[{v:'excellent',l:'Excellent'},{v:'good',l:'Good'},{v:'fair',l:'Fair'},{v:'poor',l:'Poor'}],onChange:clearGut,help:'Many insurers use a credit-based insurance score of the person who owns the policy. California, Hawaii and Massachusetts ban using credit this way.'},
  {id:'zip',label:'Your zip code',type:'seg',def:'avg',lvl:'honors',options:[{v:'low',l:'Lower-cost'},{v:'avg',l:'Average'},{v:'high',l:'Higher-cost'}],onChange:clearGut},
  {id:'ed',label:'You took driver’s ed',type:'toggle',def:false,onChange:clearGut},
  {id:'good',label:'You get the good-student discount',type:'toggle',def:false,onChange:clearGut},
  {id:'healthy',label:'Driving-only model: price on record and place only',type:'toggle',def:false,onChange:clearGut,help:'Drops credit and the shop-around score. Every factor left is shown, and you can change most of them.'},
  {id:'show',label:'Show what each change saves',type:'toggle',def:false,help:'Off: you pick by feel first.'},
  {id:'shop',label:'Price optimization: how likely you are to shop around',type:'seg',lvl:'honors',def:'some',options:[{v:'often',l:'Compares every year'},{v:'some',l:'Sometimes'},{v:'never',l:'Never shops'}],onChange:clearGut,help:'Not about risk at all: it prices what a customer will put up with.'},
  {id:'app',label:'Use a driving app (telematics)',type:'toggle',lvl:'honors',def:false,onChange:clearGut},
  {id:'brakes',label:'Hard-braking events per 100 miles',type:'range',lvl:'honors',min:0,max:10,step:1,def:2,noGut:true,onChange:clearGut},
  {id:'segs',label:'Price segments in a pool of 2,000 drivers',type:'select',lvl:'ap',def:1,noGut:true,options:SEGS.map(k=>({v:k,l:k===1?'1 (everyone pays the pool price)':k.toLocaleString('en-US')+' segments of '+Math.round(2000/k)+' drivers'}))}
 ],
 actions:[{id:'best',label:'Pick the change that saves most',run(sim){BioLab.setValues(sim,{pick:bestPick(sim),show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'quote',label:'Your quote',unit:'dollars/year',d:0,min:0,max:null,get:sim=>quote(sim)},
  {id:'month',label:'Per month',unit:'dollars',d:0,min:0,max:null,get:sim=>quote(sim)/12},
  {id:'sed',label:'Driver’s ed saves',unit:'dollars/year',d:0,min:0,max:null,get:sim=>shown(sim)?save(sim,'ed'):null},
  {id:'sgr',label:'Good-student discount saves',unit:'dollars/year',d:0,min:0,max:null,get:sim=>shown(sim)?save(sim,'grades'):null},
  {id:'scr',label:'Credit up one tier saves',unit:'dollars/year',d:0,min:0,max:null,get:sim=>shown(sim)?save(sim,'credit'):null},
  {id:'fl',label:'Florida test: clean + poor credit minus DUI + excellent credit',unit:'dollars/year',d:0,min:null,max:null,get:sim=>flA(sim)-flB(sim)},
  {id:'crpen',label:'Credit penalty vs. excellent credit',unit:'dollars/year',d:0,lvl:'honors',min:0,max:null,get:sim=>quote(sim)-quote(sim,{credit:'excellent'})},
  {id:'shopadj',label:'Price optimization adds',unit:'dollars/year',d:0,lvl:'honors',min:null,max:null,get:sim=>quote(sim)-quote(sim,{shop:'some'})},
  {id:'spread',label:'Highest minus lowest segment price',unit:'dollars/year',d:0,lvl:'ap',min:0,max:null,get:sim=>spread(sim.p.segs)},
  {id:'ratio',label:'Highest segment price ÷ lowest',unit:'times',d:2,lvl:'ap',min:0,max:null,get:sim=>ratio(sim.p.segs)}
 ],
 graphs:[{id:'tiers',label:'Quote by credit tier: clean record vs. DUI',custom:true},{id:'seg',label:'Price spread vs. number of segments',lvl:'ap',custom:true}],defaultGraph:'tiers',
 plot(sim,ctx,box,id){
  if(id==='seg'){const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:Math.ceil(spread(1000)/500)*500,xticks:false,xl:'Number of segments (log scale): 1, 10, 100, 1,000',yl:'Highest − lowest price ($)'});
   [0,1,2,3].forEach(e=>txt(ctx,String(Math.pow(10,e)).replace('1000','1,000'),ax.X(e),box.T+box.H+16,{s:13,c:PAL['g-axis'],a:'center'}));
   ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();SEGS.forEach((k,i)=>{const X=ax.X(Math.log10(k)),Y=ax.Y(spread(k));i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});ctx.stroke();
   SEGS.forEach(k=>{ctx.fillStyle=+k===+sim.p.segs?PAL['rj']:PAL['g-line'];ctx.beginPath();ctx.arc(ax.X(Math.log10(k)),ax.Y(spread(k)),+k===+sim.p.segs?7:4,0,7);ctx.fill();});return;}
  const T=['poor','fair','good','excellent'],cl=T.map(c=>quote(sim,{credit:c,record:'clean'})),du=T.map(c=>quote(sim,{credit:c,record:'dui'})),top=Math.ceil(Math.max(...cl,...du)/500)*500;
  const ax=axes(ctx,box,{xmin:0,xmax:4,ymin:0,ymax:top,xcats:['Poor credit','Fair','Good','Excellent'],yl:'Yearly quote ($)'});
  const bw=(ax.X(1)-ax.X(0))*0.32;
  T.forEach((c,i)=>{const xc=ax.X(i+.5);[[cl[i],PAL['s2'],-1],[du[i],PAL['s1'],1]].forEach(([v,col,sgn])=>{const x0=sgn<0?xc-bw-2:xc+2;ctx.fillStyle=col;ctx.fillRect(x0,ax.Y(v),bw,ax.Y(0)-ax.Y(v));txt(ctx,$(v),x0+bw/2,ax.Y(v)-5,{s:12,w:600,c:PAL['fg'],a:'center'});});});
  legend(ctx,box.L+10,box.T+8,[{label:'Clean record',color:PAL['s2']},{label:'DUI',color:PAL['s1']}]);},
 draw(sim,ctx,vdt,k){const R=rows(sim),q=quote(sim),sh=shown(sim),G=GS(sim),hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(408,0,392,450);
  /* the receipt */
  const kk=k,xl=18,xm=312,xr=396;
  txt(ctx,'Your quote, line by line',xl,26,{s:14*kk,w:700});
  const rh=Math.min(Math.max(26,18*kk),(372-50)/(R.length+1));let y=52+rh*0.4;
  txt(ctx,'Base rate',xl,y,{s:12*kk});txt(ctx,$(BASE),xr,y,{s:12*kk,a:'right'});
  let run=BASE;R.forEach(r=>{y+=rh;run*=r.m;const col=r.cr||r.sh?PAL['s1']:PAL['cv-ink'],dim=Math.abs(r.m-1)<1e-9;
   txt(ctx,r.l,xl,y,{s:12*kk,c:dim?PAL['cv-soft']:col,w:r.cr&&r.m>1?700:400});txt(ctx,x2(r.m),xm,y,{s:12*kk,a:'right',c:dim?PAL['cv-soft']:col});txt(ctx,$(run),xr,y,{s:12*kk,a:'right',c:dim?PAL['cv-soft']:PAL['cv-ink']});});
  y+=10;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(xl,y);ctx.lineTo(xr,y);ctx.stroke();
  y+=24*kk;txt(ctx,'Your quote',xl,y,{s:14*kk,w:700});txt(ctx,$(q)+' / year',xr,y,{s:14*kk,w:700,a:'right',c:PAL['rj']});
  if(y+22*kk<446)txt(ctx,'about '+$(q/12)+' a month',xr,y+20*kk,{s:12*kk,a:'right',c:PAL['cv-soft']});
  if(!sim.p.healthy&&y+48*kk<446)txt(ctx,'Red rows are not about how you drive.',xl,442,{s:12*kk,c:PAL['s1']});
  /* which change saves most */
  const rx=424,bx=rx,bwMax=340;
  txt(ctx,'Which change saves most?',rx,26,{s:14*kk,w:700});
  const S=['ed','grades','credit'].map(key=>save(sim,key)),mx=Math.max(1,...S),bp=bestPick(sim),short={ed:'Driver’s ed',grades:'Good grades',credit:'Parent’s credit up 1 tier'};
  ['ed','grades','credit'].forEach((key,i)=>{const yy=50+i*(28*kk+8),v=S[i];
   txt(ctx,short[key],bx,yy+12*kk,{s:12*kk,w:700,c:PAL['cv-ink']});
   const by=yy+16*kk,bh=12*kk;
   if(sh){const w=clamp(v/mx*bwMax*0.62,v>0?3:0,bwMax);ctx.fillStyle=key==='credit'?PAL['s1']:PAL['s3'];rr(ctx,bx,by,Math.max(w,2),bh,3);ctx.fill();
    txt(ctx,v>0?'saves '+$(v):(key==='credit'&&sim.p.healthy?'credit not used':'already have it'),bx+Math.max(w,2)+8,by+bh-1,{s:12*kk,w:700,c:key===bp&&v>0?PAL['s3']:PAL['cv-soft']});}
   else txt(ctx,'saves ?',bx,by+bh-1,{s:12*kk,c:PAL['cv-soft']});
   if(G&&G.g&&G.g.pick===key){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;rr(ctx,bx-6,yy-4,bwMax+30,28*kk+8,6);ctx.stroke();}});
  const gy=50+3*(28*kk+8)+6*kk;
  if(G&&G.m&&sh&&save(sim,bp)>0.5){const o=bp==='credit'?CRED[sim.p.credit].m:1,nw=bp==='credit'?CRED[UP[sim.p.credit]].m:bp==='ed'?ED:GOOD;
   let line=`${{ed:'Driver’s ed',grades:'Good grades',credit:'Credit up 1 tier'}[bp]}: ${$(q)} × (1 − ${f2(nw)} ÷ ${f2(o)}) = ${$(save(sim,bp))}`;ctx.font='700 '+(12*kk)+'px '+FONT;if(ctx.measureText(line).width>350)line=`Saves ${$(q)} × ${f2(1-nw/o)} = ${$(save(sim,bp))}`;
   txt(ctx,line,rx,gy,{s:12*kk,w:700,c:PAL['s3']});}
  else if(G&&G.g)txt(ctx,'Gold box: your gut',rx,gy,{s:12*kk,c:PAL['s4']});
  /* the Florida test */
  const fy=Math.max(232,50+3*(28*kk+8)+24*kk),a=flA(sim),b=flB(sim),fm=Math.max(a,b);
  txt(ctx,sim.p.healthy?'Florida test, driving-only model':'The Florida test',rx,fy,{s:13*kk,w:700});
  [['Clean record, poor credit',a,PAL['s2']],['DUI, excellent credit',b,PAL['s1']]].forEach(([l,v,col],i)=>{const yy=fy+10*kk+i*(30*kk+4),w=v/fm*230;
   txt(ctx,l,rx,yy+11*kk,{s:12*kk,c:PAL['cv-ink']});ctx.fillStyle=col;rr(ctx,rx,yy+15*kk,w,12*kk,3);ctx.fill();txt(ctx,$(v),rx+w+8,yy+26*kk,{s:12*kk,w:700});});
  const ly=fy+10*kk+2*(30*kk+4)+14*kk;
  if(ly<446)txt(ctx,a>b?'The clean driver pays '+$(a-b)+' more.':'The DUI driver pays '+$(b-a)+' more.',rx,ly,{s:12*kk,w:700,c:a>b?PAL['s1']:PAL['s3']});},
 narrate(sim){const q=quote(sim),a=flA(sim),b=flB(sim),h=sim.p.healthy;
  if(h)return `With credit and shopping habits out, your quote is ${$(q)} a year, and <b>every factor left is about driving or place</b>. Now the DUI driver pays ${$(b-a)} more than the clean driver, which follows the record.`;
  const cp=q-quote(sim,{credit:'excellent'});
  if(cp>1)return `Your quote is ${$(q)} a year. <b>${$(cp)} of that is the policyholder’s credit tier</b>, which says nothing about how you drive. Same teen, clean record and poor credit: ${$(a)}. With a DUI and excellent credit: ${$(b)}.`;
  return `Your quote is ${$(q)} a year. Excellent credit adds nothing here, but a clean driver whose parent has poor credit would pay ${$(a)}, <b>more than a DUI driver with excellent credit</b> (${$(b)}).`;},
 gut:{better:'higher',controls:['pick'],
  ask:{bio:'Your quote is on the left. Pick one change here that you think lowers it the most: driver’s ed, good grades, or your parent’s credit moving up one tier. Then lock it in.',honors:'Before you look at the savings: which one change lowers this quote most? Pick it here, then lock it in.'},
  lock(sim){return {v:save(sim,sim.p.pick),pick:sim.p.pick,label:lab(sim,sim.p.pick)};},
  solve(sim){const b=bestPick(sim);sim.p.pick=b;sim.p.show=true;return {v:save(sim,b),pick:b,label:lab(sim,b)};},
  hint:{bio:'Lock in your pick. Then you will work out one saving yourself from the receipt.'},
  calc:{unit:'$',d:0,tol:a=>Math.max(2,0.01*a),
   prompt(sim){const T=target(sim),Q=$(q0(sim));
    if(!T)return `You already have every discount here, and the credit tier is already excellent or not used. Work out the quote from the receipt: ${$(BASE)} times every multiplier. What is the yearly quote?`;
    return `Your quote is <b>${Q}</b> a year. ${T.what[0].toUpperCase()+T.what.slice(1)} changes one multiplier from <b>×${f2(T.old)}</b> to <b>×${f2(T.nw)}</b>. How many dollars a year would that save?`;},
   answer:calcAns,
   hint:'Find new ÷ old. The quote keeps that fraction, so the saving is the quote times (1 − new ÷ old).',
   steps(sim){const T=target(sim),Q=q0(sim);
    if(!T)return [`Multiply ${$(BASE)} by every multiplier on the receipt: ${rows(sim).map(r=>f2(r.m)).join(' × ')}.`,`The quote is <b>${$(Q)}</b> a year.`];
    const r=T.nw/T.old;
    return [`One multiplier changes, so the whole quote scales by new ÷ old = ${f2(T.nw)} ÷ ${f2(T.old)} ${Math.abs(r-+f4(r))<1e-9?'=':'≈'} ${f4(r)}.`,`The quote keeps ${(100*r).toFixed(1)}% of itself, so it drops by 1 − ${f4(r)} = ${f4(1-r)}.`,`Saving = ${$(Q)} × ${f4(1-r)} ≈ <b>${$(calcAns(sim))}</b> a year.`];}},
  formula(sim){const Q=$(q0(sim)),p=sim.p,parts=[];
   if(!p.ed)parts.push(`Driver’s ed ${Q} × (1 − 0.90) = ${$(save(sim,'ed'))}`);
   if(!p.good)parts.push(`Good grades ${Q} × (1 − 0.85) = ${$(save(sim,'grades'))}`);
   if(!p.healthy&&UP[p.credit])parts.push(`Credit up one tier ${Q} × (1 − ${f2(CRED[UP[p.credit]].m)} ÷ ${f2(CRED[p.credit].m)}) = ${$(save(sim,'credit'))}`);
   return `Saving = quote × (1 − new ÷ old).`+(parts.length?'<br>'+parts.join('<br>'):' Nothing on the list is left to change here.');},
  how:{bio:'The math multiplies. Each factor is a multiplier on the whole price, so a change saves (1 − new ÷ old) of the quote. Driver’s ed takes off 10%, good grades 15%, and moving from fair to good credit changes ×1.50 to ×1.20, which takes off 20%.',
   honors:'Savings = quote × (1 − new multiplier ÷ old multiplier). Compare the three ratios: 0.90, 0.85, and the credit step (for example 1.20 ÷ 1.50 = 0.80). The smallest ratio saves most, whatever the rest of the quote is.'},
  compare(sim,g,m){const tot=yearsGap(sim,m.pick,g.pick),yrs=20-ageOf(sim);
   if(m.v<0.5)return 'Nothing on this list lowers this quote: you already have every discount here, and the credit tier is either already excellent or not used.';
   if(g.pick===m.pick)return `Your gut was right on. ${PICK[m.pick]} saves the most: <b>${$(m.v)} a year</b>.${m.pick==='credit'?' The biggest lever on this price is not about how you drive.':' Your gut already knows a percent off the whole price beats a smaller percent.'}`;
   return `The math’s pick saves <b>${$(m.v-g.v)} more a year</b> than yours (${$(m.v)} against ${$(g.v)}). Until you turn 20, that adds up to about <b>${$(tot)}</b> over ${yrs} year${yrs===1?'':'s'}.${m.pick==='credit'?' And the biggest lever is your parent’s credit, not your driving.':''}`;},
  again(sim){const pickOne=a=>a[Math.floor(Math.random()*a.length)];sim.p.age=pickOne([16,17,18,19]);sim.p.record=pickOne(['clean','clean','ticket']);sim.p.credit=pickOne(['poor','fair','good','fair']);sim.p.zip=pickOne(['low','avg','high']);sim.p.ed=Math.random()<0.3;sim.p.good=Math.random()<0.3;sim.p.pick='ed';sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A new case: a 17-year-old (×2.3) with one ticket (×1.25), and the policyholder has good credit (×1.2). Base rate $470, average zip (×1.0). What is the yearly quote?',answer:1621.5,tol:2,unit:'$',d:2,hint:'Multiply the base rate by every multiplier.',explain:'$470 × 2.3 = $1,081. $1,081 × 1.25 = $1,351.25. $1,351.25 × 1.2 = $1,621.50 a year. The order does not matter, because multiplication is commutative.'},
  {lvl:'bio',instant:true,q:'Two 16-year-olds, same car, same zip code. Teen A has a clean record and a parent with poor credit. Teen B has a DUI and a parent with excellent credit. In this model, who pays more?',choices:['Teen B, because a DUI is the biggest risk','Teen A, the clean driver','They pay the same'],correct:1,explain:'Teen A: $470 × 2.6 × 2.153 = $2,631 a year. Teen B: $470 × 2.6 × 1.8 = $2,200. The clean driver pays $432 more. The 2023 Consumer Federation of America report found the same pattern in most states.'},
  {lvl:'bio',instant:true,q:'You take driver’s ed (10% off) and earn the good-student discount (15% off). How much comes off your quote?',choices:['25%','23.5%','15%'],correct:1,explain:'Discounts multiply: 0.90 × 0.85 = 0.765, so you pay 76.5% of the price, which is 23.5% off. On a $1,833 quote that is $431 off, not $458.'},
  {lvl:'honors',instant:true,q:'Two drivers have exactly the same record, car and zip. One compares quotes every year; the other never shops around. Under price optimization, who pays more?',choices:['The one who compares, since switching costs the insurer money','The one who never shops around: the price follows what they will put up with','Neither: price follows risk'],correct:1,explain:'In this model the never-shops multiplier is 1.15 and the compares-every-year multiplier is 0.95, so the loyal customer pays 1.15 ÷ 0.95 ≈ 1.21 times as much: 21% more for the same risk. Consumer Federation of America alleged one insurer priced this way (Allstate disputed it).'},
  {lvl:'honors',instant:true,q:'Switch on the driving-only model (no credit, no shop-around score). In the Florida test, what happens?',choices:['The clean driver still pays more','The DUI driver now pays more, by the DUI multiplier','Both pay the same'],correct:1,explain:'With credit out, the only difference left is the record. A 16-year-old in an average zip: clean $1,222, DUI $1,222 × 1.8 = $2,200. The price now follows the driving record.'},
  {lvl:'ap',instant:true,q:'Your quote has multipliers 2.6, 1.0, 1.0, 1.0, 1.5 and 1.0 on a $470 base. Which change lowers the quote more: dropping the 1.5 to 1.2, or adding a 0.85 discount?',choices:['The credit step: 1.2 ÷ 1.5 = 0.80 is smaller than 0.85','The 0.85 discount, since 15% beats 0.3','They save the same'],correct:0,explain:'A multiplier change scales the whole quote by new ÷ old. 1.2 ÷ 1.5 = 0.80 takes off 20% ($367 of $1,833); the 0.85 discount takes off 15% ($275). Order does not matter, because multiplication is commutative.'},
  {lvl:'ap',instant:true,q:'A pool of 2,000 drivers is priced at one average. The insurer splits it into 1,000 segments of 2 drivers each. What happens to the gap between the highest and lowest segment price?',choices:['It shrinks, because prices get more accurate','It grows from $0 to about $3,950, partly because a 2-driver average is mostly chance','It stays about the same'],correct:1,explain:'One pool: everyone pays the same, so the gap is $0. With 4 segments the gap is $779; with 1,000 segments of 2 it is $3,953. A score that is only partly related to risk, averaged over 2 people, is mostly noise: the spread grows faster than the real information.'}
 ],
 tour:[
  {title:'The base rate',text:'A 2023 Consumer Federation of America study found a driver with state-minimum coverage, a clean record and excellent credit was quoted about $470 a year. That is the starting line. Everything else multiplies it.',focus:[10,8,392,64],pause:true,setup:sim=>BioLab.setValues(sim,{age:16,record:'clean',credit:'fair',zip:'avg',ed:false,good:false,healthy:false,show:false,app:false,shop:'some'})},
  {title:'Being 16',text:'New drivers crash more, so age is a big multiplier. In this model a 16-year-old is ×2.6 (an illustrative number), which takes $470 to $1,222.',focus:[10,40,392,70],pause:true},
  {title:'A factor you never chose',text:'The policyholder, often a parent, has fair credit: ×1.5. That adds $611 and takes your quote to $1,833. It says nothing about how you drive.',focus:[10,150,392,60],pause:true},
  {title:'Three ways to lower it',text:'Driver’s ed takes off 10% ($183). Good grades take off 15% ($275). Your parent’s credit going from fair to good changes ×1.5 to ×1.2: 20% off, $367. The biggest lever is the one you control least.',focus:[408,10,392,190],pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'The Florida test',text:'Same teen, two versions. Clean record and poor credit: $2,631. DUI and excellent credit: $2,200. O’Neil reports a Consumer Reports finding from Florida: clean drivers with poor credit paid $1,552 more, on average, than drivers with excellent credit and a drunk-driving conviction.',focus:[408,220,392,230],pause:true},
  {lvl:'honors',title:'Price optimization',text:'Now a factor based on whether you are likely to shop around. Never shopping: ×1.15, so $275 more for the same risk. It is invisible to you, and it targets loyalty, not driving.',pause:true,setup:sim=>BioLab.setValues(sim,{shop:'never',show:true})},
  {title:'Driving-only model',text:'Switch to a model that prices only on driving and place. Credit and shop-around are gone, every factor is visible, and the DUI driver pays more than the clean one. Colorado’s SB21-169 now requires auto insurers to test their models and data for unfair discrimination.',pause:true,setup:sim=>BioLab.setValues(sim,{shop:'some',healthy:true,show:true})},
  {lvl:'ap',title:'Pools and segments',text:'Insurance works by pooling. One pool of 2,000 drivers means one price. Cut it into 1,000 segments of 2 and the highest and lowest prices end up $3,953 apart. Open the graph “Price spread vs. number of segments.”',pause:true,setup:sim=>BioLab.setValues(sim,{healthy:false,segs:1000})}
 ],
 lab:{bio:'<p><b>Question:</b> Which factor moves a teen’s quote the most?</p><ol><li>Start at age 16, clean record, fair credit, average zip.</li><li>Change one factor at a time (record, credit, zip, driver’s ed, good grades) and record a trial each time.</li><li>For each trial, compute the dollar change from the starting quote.</li></ol><p>Write one sentence: which factor mattered most, and is it about driving?</p>',
  honors:'<p><b>Question:</b> When does poor credit cost more than a DUI?</p><ol><li>For each age from 16 to 19, record the Florida test result.</li><li>Find the DUI multiplier that would make the two drivers pay the same (hint: 2.15).</li><li>Turn on the driving-only model and repeat.</li></ol><p>Explain why the gap is a constant percent but not a constant number of dollars.</p>',
  ap:'<p><b>Question:</b> What does cutting a pool into segments do?</p><ol><li>Record the highest-minus-lowest price for 1, 4, 16, 64, 256 and 1,000 segments.</li><li>Graph the spread against log₁₀(segments).</li></ol><p><b>CER:</b> Claim whether finer segments always mean fairer prices, with evidence from your table and reasoning about how many drivers each segment price averages.</p>'},
 terms:[
  {t:'Multiplier',d:'A number the price is multiplied by. ×1.2 adds 20%; ×0.9 takes off 10%.'},
  {t:'Rating factor',d:'Anything an insurer uses to set your price: age, record, zip code, credit.'},
  {t:'Credit-based insurance score',d:'A score built from the policyholder’s credit report that many insurers use in pricing. It is not about driving.'},
  {t:'Price optimization',d:'Setting prices partly by how likely a customer is to switch, not only by risk.',lvl:'honors'},
  {t:'Telematics',d:'Data from a phone app or a plug-in device about how you drive, such as hard braking.',lvl:'honors'},
  {t:'Risk pool',d:'A group whose costs are shared. Smaller segments mean each price rests on fewer people.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not financial advice.</b> Quote = $470 × the multipliers shown. The $470 base and the poor-credit multiplier come from the Consumer Federation of America (July 31, 2023): with state-minimum coverage and a clean record, drivers with excellent credit were quoted about $470 a year and drivers with poor credit about $1,012 (115% more). CFA found that in most states a driver with poor credit and a perfect record pays more than one with a DUI, and that California, Hawaii and Massachusetts ban the practice (<a href="https://consumerfed.org/press_release/report-details-severe-credit-score-penalties-in-auto-insurance/" target="_blank" rel="noopener">CFA report</a>).</p><p><b>Every other multiplier is an illustrative assumption</b>, not any company’s rate: age 16 to 19 (×2.6, 2.3, 2.0, 1.8), one ticket ×1.25, DUI ×1.8, driver’s ed ×0.90, good student ×0.85, good and fair credit ×1.2 and ×1.5, zip ×0.85 to ×1.3, shop-around ×0.95 to ×1.15, and a driving app ×(0.80 + 0.05 × hard brakes per 100 miles). They are sized so the CFA pattern holds: poor credit (×2.15) costs more than a DUI (×1.8).</p><p>Cathy O’Neil, <i>Weapons of Math Destruction</i> (2016), Ch. 9, reports that Consumer Reports found Florida adults with clean records and poor credit paid on average $1,552 more than drivers with excellent credit and a drunk-driving conviction. She also reports that the Consumer Federation of America alleged Allstate priced partly by how likely customers were to shop around, with about 100,000 microsegments and adjustments from −90% to +800%. These were allegations as of 2016; Allstate disputed them.</p><p>Colorado’s SB21-169 requires insurers to test their algorithms and outside data for unfair discrimination; in 2025 the rules were extended to private passenger auto insurance, including telematics data (<a href="https://doi.colorado.gov/for-consumers/sb21-169-protecting-consumers-from-unfair-discrimination-in-insurance-practices" target="_blank" rel="noopener">Colorado Division of Insurance</a>).</p><p><b>Pools and segments:</b> 2,000 imaginary drivers, each with a true expected claim cost (lognormal, mean $1,000). The insurer sorts them by a score that is only partly related to that cost (correlation about 0.6) and prices each segment at its average cost. The driving-only model is our illustration of a price set only by record and place, not a law or a real product.</p>'
};
BioLab.register(SIM);
})();
