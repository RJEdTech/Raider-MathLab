(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,atLeast,fmtNum}=BioLab.h;
/* Published figures only (Chetty, Hendren, Kline & Saez 2014 QJE, children born 1980-82, incomes at about age 30).
   Q: national quintile transition matrix, Table II. Row = parent quintile, entries = % of children in each child quintile.
   PL: Table III. aum = absolute upward mobility (expected child rank, parents at the 25th percentile), q15 = P(child Q5 | parent Q1) in %,
   slope = rank-rank slope. The U.S. aum is computed: the national OLS line passes through the mean ranks (50, 50). */
const Q=[[33.7,28.0,18.4,12.3,7.5],[24.2,24.2,21.7,17.6,12.3],[17.8,19.8,22.1,22.0,18.3],[13.4,16.0,20.9,24.4,25.4],[10.9,11.9,17.0,23.6,36.5]];
const PL={us:{l:'United States',s:'U.S.',aum:50-0.341*25,q15:7.5,slope:0.341},
 sl:{l:'Salt Lake City area',s:'Salt Lake',aum:46.2,q15:10.8,slope:0.264},
 sj:{l:'San Jose area',s:'San Jose',aum:44.7,q15:12.9,slope:0.235},
 se:{l:'Seattle area',s:'Seattle',aum:43.2,q15:10.9,slope:0.273},
 de:{l:'Denver area',s:'Denver',aum:42.2,q15:8.7,slope:0.294},
 chi:{l:'Chicago area',s:'Chicago',aum:39.4,q15:6.5,slope:0.393},
 at:{l:'Atlanta area',s:'Atlanta',aum:36.0,q15:4.5,slope:0.366},
 cl:{l:'Charlotte area',s:'Charlotte',aum:35.8,q15:4.4,slope:0.397}};
const KEYS=['us','sl','sj','se','de','chi','at','cl'];
const QN=['bottom','second','middle','fourth','top'];
const RATE=0.04,END=23;                   /* Chetty & Hendren 2018: about 4% of the gap per year of exposure, up to about age 23 */
const MTO={ctl:11270,gain:3477};          /* Chetty, Hendren & Katz 2016: under-13 movers, income in mid-twenties */
const pl=sim=>PL[sim.p.place]||PL.us;
const from=sim=>PL[sim.p.from]||PL.cl;
const share=sim=>RATE*clamp(END-sim.p.age,0,20);
const gainR=sim=>share(sim)*(pl(sim).aum-from(sim).aum);
const two=()=>Q[0].reduce((s,x,k)=>s+x/100*Q[k][4]/100,0);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* Numbers stay hidden until the gut is locked and the student has worked out the chance ("Your turn"). */
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(GS(sim)&&GS(sim).g&&!pending(sim)));
const US200=()=>counts(Q[0],200);
/* "Your turn": the U.S. row as counts of 200 children; areas as counts of 1,000 at the published rate */
function calcCase(sim){const P=pl(sim);if(sim.p.place==='us'){const c=US200();return {n:200,top:c[4],c,ans:100*c[4]/200};}return {n:1000,top:Math.round(P.q15*10),ans:Math.round(P.q15*10)/10};}
const f1=v=>fmtNum(v,1),n0=v=>Math.round(v).toLocaleString('en-US');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const qCol=i=>PAL[['s2','s6','s3','s4','rj'][i]];
/* largest-remainder rounding of a row to whole children out of tot */
function counts(row,tot){const raw=row.map(x=>x/100*tot),fl=raw.map(Math.floor);let left=tot-fl.reduce((a,b)=>a+b,0);
 raw.map((x,i)=>[x-fl[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){fl[i]++;left--;}});return fl;}
function kid(ctx,x,y,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y-s*0.28,s*0.2,0,7);ctx.fill();rr(ctx,x-s*0.26,y-s*0.04,s*0.52,s*0.42,s*0.12);ctx.fill();}
function view(sim){const v=sim.p.view;if((v==='expo'||v==='mto'||v==='dream')&&!atLeast('ap'))return 'kids';if(v==='line'&&!atLeast('honors'))return 'kids';return v;}

/* What this number hides. Figures from the sources in about. */
function hides(sim){const P=pl(sim),V=view(sim),L=[];
 if(V==='mto')L.push('<b>An average of movers.</b> The 31% gain is the average for children whose families used the low-poverty voucher. Individual children’s results varied around that average, and the average says nothing about why.','<b>Teens.</b> Children who moved after 13 saw no gain, so “moving helps” is true only for part of the group.');
 else if(V==='dream')L.push('<b>Income only.</b> “Earned more than their parents” compares household incomes at 30. It leaves out health, family, faith, service and careers that start later.');
 else if(V==='expo')L.push('<b>A straight line through ages it did not measure.</b> The 4% a year was estimated for moves between 9 and 23. Everything to the left of 9 is drawn dashed because it is an assumption.','<b>Who lives there.</b> Each area’s average mixes the place’s effect with differences in the families who live there.');
 else{L.push(sim.p.place==='us'?'<b>The whole country becomes one figure.</b> The U.S. 7.5 per 100 averages areas as different as the Charlotte area (4.4) and the San Jose area (12.9), and every neighborhood inside them.':`<b>Every neighborhood in the ${P.l}.</b> The ${f1(P.q15)} per 100 is one average for a whole commuting zone. In the Opportunity Atlas, for children of 25th-percentile parents, average income at 35 varies by about $5,000 a year (one standard deviation) between Census tracts inside the same county.`);
  L.push('<b>Children who are not in the data.</b> The study kept only U.S. citizens who could be linked to a parent in tax records, and whose parents had income above zero in 1996 to 2000. Children who could not be linked are not counted.');}
 if(V==='mto')L.push('<b>One age.</b> Income in the mid-twenties is early in a career. It is one snapshot of a life, and it leaves out health, family and service.');
 else L.push('<b>One birth year, one age.</b> These are children born 1980 to 1982, measured at about 30. Children growing up now face different places, and income at 30 is one snapshot of a life.');
 return L;}
const SIM={
 id:'opportunity',hash:'opportunity',apUnit:21,order:4,tab:'Where you grow up',kind:'Simulation',
 skills:{bio:'Conditional probability from counts: P(top fifth | bottom fifth) · Statistics (Chapter 5)',honors:'Percentile ranks and the slope of a line · Statistics (Chapter 5), AP Statistics (Unit 4)',ap:'Transition matrices and matrix multiplication · AP Statistics (Unit 4), AP Precalculus (Unit 4)'},
 card:'Guess how many children from the bottom fifth of incomes reach the top fifth, then see how much the place they grow up changes it.',
 title:'Where you grow up',
 lede:{bio:'Researchers used tax records for millions of children to answer an old question with numbers: how much does the family you are born into shape where you end up, and does the place you grow up change it?',
  honors:'Rank every parent and every child from 0 to 100 by income. The rank-rank slope says how much a parent’s rank predicts a child’s. A lottery for housing vouchers then tested whether moving to a new neighborhood causes a change.',
  ap:'E[child rank | parent rank p] ≈ a + b·p. A quintile transition matrix turns ranks into chances, and childhood exposure effects add about 4% of the difference between places for each year a child spends there.'},
 scale:'Children born in 1980 to 1982, with incomes measured at about age 30. Ranks are national percentiles: 0 is the lowest income, 100 the highest.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Where and who',
 controls:[
  {id:'guess',label:'Your gut: children out of 100 who climb from the bottom fifth to the top fifth',type:'range',min:0,max:50,step:1,def:25,unit:' of 100'},
  {id:'place',label:'Where they grew up',type:'select',def:'us',noGut:true,onChange:clearGut,options:KEYS.map(k=>({v:k,l:PL[k].l})),help:'Areas are commuting zones: a city and the towns people commute from.'},
  {id:'view',label:'Show',type:'seg',def:'kids',noGut:true,options:[{v:'kids',l:'Where children end up'},{v:'line',l:'Rank line',lvl:'honors'},{v:'dream',l:'Out-earning your parents',lvl:'ap'},{v:'mto',l:'The lottery',lvl:'ap'},{v:'expo',l:'Years in a place',lvl:'ap'}]},
  {id:'pq',label:'Parents’ income fifth',type:'seg',def:1,noGut:true,options:[{v:1,l:'Bottom'},{v:2,l:'2nd'},{v:3,l:'Middle'},{v:4,l:'4th'},{v:5,l:'Top'}],help:'Each fifth (quintile) holds 20% of families, ranked by income.'},
  {id:'from',label:'Moving from',type:'select',def:'cl',lvl:'ap',noGut:true,options:KEYS.map(k=>({v:k,l:PL[k].l})),help:'For Years in a place: the family moves from here to the place chosen above.'},
  {id:'age',label:'Child’s age at the move',type:'range',min:3,max:23,step:1,def:9,unit:' years',lvl:'ap',noGut:true},
  {id:'reveal',label:'Show the answers now',type:'toggle',def:false,noGut:true,help:'Normally the numbers appear once you lock in your gut answer.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'q15',label:'Bottom fifth to top fifth',unit:'of 100',d:1,min:0,max:20,get:sim=>shown(sim)?pl(sim).q15:null},
  {id:'even',label:'If parents’ income did not matter',unit:'of 100',d:0,min:0,max:20,get:()=>20},
  {id:'stay',label:'Top fifth staying on top (U.S.)',unit:'of 100',d:1,min:0,max:50,get:sim=>shown(sim)?Q[4][4]:null},
  {id:'off',label:'Your gut is off by',unit:'children per 100',d:1,min:0,max:50,get:sim=>{const G=GS(sim);return G&&G.g&&shown(sim)?Math.abs(G.g.guess-pl(sim).q15):null;}},
  {id:'slope',label:'Rank-rank slope',unit:'',d:3,lvl:'honors',min:0,max:1,get:sim=>pl(sim).slope},
  {id:'aum',label:'Expected rank, parents at the 25th percentile',unit:'',d:1,lvl:'honors',min:0,max:100,get:sim=>pl(sim).aum},
  {id:'gap2575',label:'Rank gap: parents at 75th vs. 25th',unit:'ranks',d:1,lvl:'ap',min:0,max:50,get:sim=>50*pl(sim).slope},
  {id:'two',label:'Bottom to top in two generations (if the table repeats)',unit:'of 100',d:1,lvl:'ap',min:0,max:20,get:()=>100*two()},
  {id:'share',label:'Share of the place difference picked up',unit:'%',d:0,lvl:'ap',min:0,max:100,get:sim=>100*share(sim)},
  {id:'gain',label:'Expected rank change from the move',unit:'ranks',d:1,lvl:'ap',min:-15,max:15,get:sim=>gainR(sim)}
 ],
 draw(sim,ctx,vdt,k){const P=pl(sim),big=k>1.3,on=shown(sim),G=GS(sim),V=view(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* right panel: bottom fifth to top fifth, by place */
  const RX=big?440:500;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,RX,8,800-RX-8,434,10);ctx.fill();
  txt(ctx,big?'Bottom to top, per 100':'Bottom fifth to top fifth, per 100',RX+12,30,{s:13*k,w:700,c:PAL['cv-ink']});
  ctx.font='700 '+(12*k)+'px '+FONT;const lw=Math.max(...KEYS.map(key=>ctx.measureText(big?PL[key].s:PL[key].l.replace(' area','')).width));
  const bx=RX+12+lw+10,bw=800-8-bx-(big?44:40),top=48+(big?14:6),rh=(400-top)/KEYS.length,X=v=>bx+v/20*bw;
  KEYS.forEach((key,i)=>{const p=PL[key],y=top+i*rh+rh/2,cur=key===sim.p.place;
   txt(ctx,big?p.s:p.l.replace(' area',''),RX+12,y+5,{s:12*k,w:cur?700:400,c:cur?PAL['cv-ink']:PAL['cv-soft']});
   if(on){ctx.fillStyle=cur?PAL['rj']:PAL['s2'];ctx.globalAlpha=cur?1:.6;rr(ctx,bx,y-8,Math.max(3,X(p.q15)-bx),16,4);ctx.fill();ctx.globalAlpha=1;
    txt(ctx,f1(p.q15),X(p.q15)+5,y+5,{s:12*k,w:cur?700:400,c:PAL['cv-ink']});}
   else{ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;rr(ctx,bx,y-8,bw*0.5,16,4);ctx.stroke();if(cur)txt(ctx,'?',bx+bw*0.25,y+5,{s:13*k,w:700,c:PAL['cv-soft'],a:'center'});}});
  if(on){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X(20),top-4);ctx.lineTo(X(20),top+KEYS.length*rh);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,big?'20':'20 = no link',X(20),436,{s:12*k,c:PAL['cv-soft'],a:'right'});}
  if(G&&G.g){const gx=X(clamp(G.g.guess,0,20));ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,top-4);ctx.lineTo(gx,top+KEYS.length*rh);ctx.stroke();
   txt(ctx,(big?'Gut ':'Your gut: ')+Math.round(G.g.guess)+(G.g.guess>20?' (off scale)':''),Math.min(gx,790),top-8,{s:12*k,w:700,c:PAL['s4'],a:gx>700?'right':'center'});}
  /* left area */
  const LW=RX-20;
  if(V==='kids'){const pq=sim.p.pq,row=Q[pq-1],useP=sim.p.place!=='us'&&pq===1,cnt=counts(row,200),topN=useP?Math.round(P.q15*2):cnt[4];
   txt(ctx,big?`200 kids, parents: ${QN[pq-1]} fifth`:`200 children whose parents were in the ${QN[pq-1]} fifth`,14,28,{s:13*k,w:700,c:PAL['cv-ink']});
   if(G&&G.m&&pq===1){const C=calcCase(sim);txt(ctx,`P(top | bottom) = ${n0(C.top)} ÷ ${n0(C.n)} = ${f1(C.ans)} per 100`+(big?'':'; 20 with no link'),14,28+18*k,{s:12*k,w:700,c:PAL['rj']});}
   else txt(ctx,big?(useP?P.s:'U.S.')+': adult income fifth':`Colored by their own income fifth as adults (${useP?P.l:'whole U.S.'})`,14,28+18*k,{s:12*k,c:PAL['cv-soft']});
   const cols=20,cs=Math.min(24,(LW-10)/cols),gx0=14,gy0=28+30*k+8;let idx=0;
   const colOf=i=>{if(!on)return PAL['line'];if(useP)return i<topN?qCol(4):PAL['line'];let c=0,acc=0;for(let q=4;q>=0;q--){acc+=cnt[q];if(i<acc){c=q;break;}}return qCol(c);};
   for(let r=0;r<10;r++)for(let c=0;c<cols;c++){kid(ctx,gx0+c*cs+cs/2,gy0+r*cs+cs/2,cs,colOf(idx));idx++;}
   const ly=gy0+10*cs+18*k;
   if(on){if(useP){txt(ctx,`${topN} of 200 reach the top fifth: ${f1(P.q15)} per 100`,14,ly,{s:13*k,w:700,c:PAL['rj']});if(!big)txt(ctx,'City tables give only the bottom-to-top share; gray is every other fifth.',14,ly+18*k,{s:12*k,c:PAL['cv-soft']});}
    else{let x=14,y=ly;const items=QN.map((n,i)=>[i,(big?['Bot','2nd','Mid','4th','Top'][i]:n[0].toUpperCase()+n.slice(1))+' '+cnt[i]]).reverse();ctx.font=(12*k)+'px '+FONT;
     items.forEach(([i,s])=>{const w=ctx.measureText(s).width+18*k;if(x+w>LW){x=14;y+=18*k;}ctx.fillStyle=qCol(i);ctx.fillRect(x,y-10*k,11*k,11*k);txt(ctx,s,x+15*k,y,{s:12*k,c:PAL['cv-ink'],w:i===4?700:400});x+=w+8;});}}
   else txt(ctx,G&&G.g?(big?'Work it out first.':'Work out the chance first, then see where they end up.'):(big?'Lock in your gut first.':'Lock in your gut to see where they end up.'),14,ly,{s:12*k,c:PAL['cv-soft']});}
  else if(V==='dream'){txt(ctx,big?'Out-earned their parents?':'Children who earned more than their parents at age 30',14,28,{s:13*k,w:700,c:PAL['cv-ink']});
   [[1940,92],[1984,50]].forEach(([yr,n],j)=>{const ox=14+j*(LW/2),cs=Math.min(19,(LW/2-24)/10),oy=56+12*k;
    txt(ctx,big?`${yr}: ${n} of 100`:`Born ${yr}: ${n} of 100`,ox,oy-6,{s:13*k,w:700,c:j?PAL['s4']:PAL['s3']});
    for(let i=0;i<100;i++){const r=Math.floor(i/10),c=i%10;kid(ctx,ox+c*cs+cs/2,oy+8+r*cs+cs/2,cs,i<n?(j?PAL['s4']:PAL['s3']):PAL['line']);}});
   if(!big)txt(ctx,'Colored: earned more than their parents did at the same age, adjusted for prices.',14,300,{s:12*k,c:PAL['cv-soft']});
   if(atLeast('honors')&&!big){txt(ctx,'For children born in 1980, the researchers estimate:',14,330,{s:12*k,w:700,c:PAL['cv-ink']});
    txt(ctx,'Faster growth, shared the same way: 62 of 100',14,350,{s:12*k,c:PAL['cv-ink']});txt(ctx,'Same growth, shared like 1940: 80 of 100',14,368,{s:12*k,c:PAL['cv-ink']});}}
  else if(V==='line'){const box={L:56,T:26,W:LW-76,H:big?300:330,cw:LW,ch:(big?300:330)+26+40};
   const ax=axes(ctx,box,{xmin:0,xmax:100,ymin:0,ymax:100,xl:'Parents’ income rank',yl:'Child’s expected rank'});
   const ln=(a,b,col,w,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(a));ctx.lineTo(ax.X(100),ax.Y(a+100*b));ctx.stroke();ctx.setLineDash([]);};
   ln(50,0,PAL['cv-soft'],1.5,[6,5]);ln(0,1,PAL['cv-soft'],1.5,[2,4]);
   const nat=PL.us;ln(nat.aum-25*nat.slope,nat.slope,PAL['s2'],2.5);
   if(sim.p.place!=='us')ln(P.aum-25*P.slope,P.slope,PAL['rj'],3);
   /* legend in the empty top-left corner */
   const lg=[[(big?'U.S. ':'U.S.: slope ')+nat.slope.toFixed(3),PAL['s2'],[]]];if(sim.p.place!=='us')lg.push([P.s+(big?' ':': slope ')+P.slope.toFixed(3),PAL['rj'],[]]);
   lg.push([big?'No link: 0':'No link: slope 0',PAL['cv-soft'],[6,5]]);lg.push([big?'Rank passed down: 1':'Rank passed down exactly: slope 1',PAL['cv-soft'],[2,4]]);
   lg.forEach(([s,col,dash],i)=>{const y=box.T+14+i*17*k;ctx.strokeStyle=col;ctx.lineWidth=dash.length?1.5:3;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(box.L+10,y-4);ctx.lineTo(box.L+34,y-4);ctx.stroke();ctx.setLineDash([]);
    txt(ctx,s,box.L+40,y,{s:12*k,w:i<2&&!dash.length?700:400,c:dash.length?PAL['cv-soft']:col});});
   ctx.strokeStyle=PAL['rj'];ctx.lineWidth=1.2;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(ax.X(25),ax.Y(0));ctx.lineTo(ax.X(25),ax.Y(P.aum));ctx.lineTo(ax.X(0),ax.Y(P.aum));ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(25),ax.Y(P.aum),6,0,7);ctx.fill();
   pill(ctx,(big?'':'Parents at 25th: child ')+f1(P.aum),ax.X(25)+(big?36:84)*Math.min(k,1.3),ax.Y(P.aum)+30,PAL['rj'],'#fff',12*Math.min(k,1.4));}
  else if(V==='mto'){txt(ctx,big?'Moving to Opportunity, 1994 to 1998':'Moving to Opportunity: a lottery, 1994 to 1998',14,28,{s:13*k,w:700,c:PAL['cv-ink']});
   const bx0=14,bw0=Math.min(150,(LW-40)/3);
   [['Low-poverty voucher',PAL['s3']],['Regular voucher',PAL['s2']],['No voucher',PAL['cv-soft']]].forEach(([s,col],i)=>{const x=bx0+i*(bw0+8);ctx.fillStyle=col;rr(ctx,x,48+8*k,bw0,30*k,6);ctx.fill();txt(ctx,big?['Low-pov.','Regular','None'][i]:s,x+bw0/2,48+8*k+20*k,{s:12*k,w:700,c:'#fff',a:'center'});});
   if(!big)txt(ctx,'About 4,600 families in public housing, sorted by chance into three groups.',14,48+8*k+30*k+20,{s:12*k,c:PAL['cv-soft']});
   const base=big?186:150,hmax=big?120:170,sc=hmax/16000,bw1=big?90:110,x1=60,x2=x1+bw1+60;
   txt(ctx,big?'Income in mid-20s, moved before 13':'Income in their mid-twenties, children who moved before age 13',14,base,{s:13*k,w:700,c:PAL['cv-ink']});
   const yb=base+hmax+30;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(30,yb);ctx.lineTo(LW,yb);ctx.stroke();
   [[MTO.ctl,'No voucher',PAL['cv-soft'],x1],[MTO.ctl+MTO.gain,'Moved, low-poverty',PAL['s3'],x2]].forEach(([v,lab,col,x])=>{const h=v*sc;ctx.fillStyle=col;rr(ctx,x,yb-h,bw1,h,5);ctx.fill();
    txt(ctx,'$'+n0(v),x+bw1/2,yb-h-6,{s:13*k,w:700,c:PAL['cv-ink'],a:'center'});txt(ctx,big?lab.split(',')[0]:lab,x+bw1/2,yb+16*k,{s:12*k,c:PAL['cv-soft'],a:'center'});});
   pill(ctx,'+31%',x2+bw1+40*Math.min(k,1.3),yb-(MTO.ctl+MTO.gain)*sc/2,PAL['rj'],'#fff',13*Math.min(k,1.4));
   txt(ctx,big?'Teens who moved: no gain.':'Teens who moved: no gain, or slightly worse.',14,Math.min(444,yb+38*k),{s:12*k,w:700,c:PAL['cv-ink']});}
  else{/* exposure */const box={L:56,T:40,W:LW-76,H:big?240:280,cw:LW,ch:40+(big?240:280)+40};
   txt(ctx,big?'Share of the difference picked up':'Share of the difference between places a child picks up',14,24,{s:13*k,w:700,c:PAL['cv-ink']});
   const ax=axes(ctx,box,{xmin:0,xmax:24,ymin:0,ymax:100,xl:'Age at the move',yl:'Share (%)'});
   ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(3),ax.Y(80));ctx.lineTo(ax.X(9),ax.Y(56));ctx.stroke();ctx.setLineDash([]);
   ctx.beginPath();ctx.moveTo(ax.X(9),ax.Y(56));ctx.lineTo(ax.X(23),ax.Y(0));ctx.stroke();
   if(!big){txt(ctx,'estimated',ax.X(15),ax.Y(34)-6,{s:12*k,c:PAL['s2']});txt(ctx,'extrapolated',ax.X(3),ax.Y(80)-12,{s:12*k,c:PAL['s2']});}
   const a=sim.p.age,s=100*share(sim);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(a),ax.Y(s),7,0,7);ctx.fill();
   pill(ctx,`${s.toFixed(0)}% at age ${a}`,clamp(ax.X(a)+60,90,LW-60),ax.Y(s)-22,PAL['rj'],'#fff',12*Math.min(k,1.4));
   const F=from(sim),g=gainR(sim);
   const t1=big?`${F.s} → ${P.s}: ${g>=0?'+':''}${f1(g)} ranks`:`${F.s} → ${P.s}: ${s.toFixed(0)}% × (${f1(P.aum)} − ${f1(F.aum)}) = ${g>=0?'+':''}${f1(g)} ranks`;
   txt(ctx,t1,14,box.T+box.H+40+26*k,{s:13*k,w:700,c:PAL['cv-ink']});}},
 infoPanel(sim){return '<h3>What this number hides</h3><ul>'+hides(sim).map(x=>'<li>'+x+'</li>').join('')+'</ul>';},
 narrate(sim){const P=pl(sim),V=view(sim),on=shown(sim);
  if(V==='dream')return `Of children born in 1940, 92 in 100 grew up to earn more than their parents. For those born in 1984, it was 50 in 100. <b>The researchers find that growth shared less evenly explains most of the fall; slower growth explains the rest.</b>`;
  if(V==='line')return `In ${sim.p.place==='us'?'the U.S. as a whole':'the '+P.l}, each 10 points of parent rank adds ${f1(10*P.slope)} points to a child’s expected rank. <b>A slope of 0 would mean parents’ income does not predict children’s; 1 would mean it decides everything.</b>`;
  if(V==='mto')return `A lottery decided which families got vouchers, so the groups were alike, on average, in everything else. <b>Children who moved to lower-poverty areas before 13 earned 31% more in their mid-twenties</b>; teens who moved did not gain.`;
  if(V==='expo'){const F=from(sim);return `Moving from ${F.s} to ${P.s} at age ${sim.p.age}: about ${(100*share(sim)).toFixed(0)}% of the gap between the two places, or ${f1(gainR(sim))} ranks. <b>Each year of childhood in a place adds about 4% of its effect.</b>`;}
  if(!on)return `Children whose parents were in the bottom fifth of incomes: where do they land as adults? <b>If parents’ income did not matter at all, 20 of every 100 would reach the top fifth.</b>`;
  return `In the ${P.l.replace(' area','')}${sim.p.place==='us'?'':' area'}, ${f1(P.q15)} of every 100 children from the bottom fifth reach the top fifth, against 20 if parents’ income did not matter. <b>Where a child grows up changes the odds: from 4.4 to 12.9 among these areas.</b>`;},
 gut:{better:'lower',controls:['guess'],lockLabel:'Lock in my guess',
  ask:{bio:'Picture 100 children whose parents were in the bottom fifth of incomes in the place named on the picture (the whole U.S. to start). Drag the slider here to how many of them you think reach the top fifth as adults. Then lock it in.',
   honors:'For the place shown, drag the slider here to your gut value of P(child in top fifth | parents in bottom fifth), out of 100. Then lock it in.'},
  hint:{bio:'Lock in your gut answer. Then you will work out the real chance yourself from counts of children.'},
  lock(sim){return {v:Math.abs(sim.p.guess-pl(sim).q15),guess:sim.p.guess,label:`${Math.round(sim.p.guess)} of 100`};},
  solve(sim){const q=pl(sim).q15;sim.p.guess=q;sim.p.view='kids';sim.p.pq=1;return {v:0,guess:q,label:`${f1(q)} of 100`};},
  calc:{unit:'of 100',d:1,tol:0.1,
   prompt(sim){const C=calcCase(sim),P=pl(sim);
    if(sim.p.place==='us')return `Picture <b>200</b> U.S. children whose parents were in the bottom fifth. As adults, <b>${C.c[0]}</b> are in the bottom fifth, <b>${C.c[1]}</b> in the second, <b>${C.c[2]}</b> in the middle and <b>${C.c[3]}</b> in the fourth. The rest reach the top fifth. How many of every 100 reach the top fifth?`;
    return `Picture <b>1,000</b> children in the ${P.l} whose parents were in the bottom fifth. At the published rate, <b>${n0(C.top)}</b> of them reach the top fifth as adults. How many of every 100 is that?`;},
   answer:sim=>calcCase(sim).ans,
   hint:'Find how many reach the top fifth, then scale that count to 100 children.',
   steps(sim){const C=calcCase(sim);
    if(sim.p.place==='us')return [`Top fifth: 200 − ${C.c[0]} − ${C.c[1]} − ${C.c[2]} − ${C.c[3]} = ${C.top} children.`,`Per 100: ${C.top} ÷ 200 × 100 = <b>${f1(C.ans)}</b>.`,`That is P(top fifth | parents in the bottom fifth) = 7.5%. If parents’ income did not matter, it would be 20.`];
    return [`Per 100: ${n0(C.top)} ÷ 1,000 × 100 = <b>${f1(C.ans)}</b>.`,`That is P(top fifth | parents in the bottom fifth) in this area. If parents’ income did not matter, it would be 20.`];},
   },
  formula(sim){const C=calcCase(sim);return `P(top fifth | bottom fifth) = ${n0(C.top)} ÷ ${n0(C.n)} = ${f1(C.ans)} per 100 (20 if parents’ income did not matter)`;},
  how:{bio:'Researchers ranked millions of children and their parents by income, from 0 to 100. Then they counted: of the children whose parents were in the bottom fifth, what share ended up in the top fifth as adults?',
   honors:'The answer is one cell of a quintile transition matrix: P(child in Q5 | parents in Q1), estimated from tax records for children born 1980 to 1982.',
   ap:'Each row of the transition matrix is a conditional distribution. The rank-rank slope summarizes the whole matrix in one number, and the matrix squared estimates two generations if the same chances repeat.'},
  compare(sim,g,m){const P=pl(sim),off=Math.abs(g.guess-m.guess),where=sim.p.place==='us'?'the U.S.':'the '+P.l;
   const head=off<1.5?`Your gut was right on: ${f1(m.guess)} of every 100 in ${where}, and you said ${Math.round(g.guess)}.`:`In ${where}, <b>${f1(m.guess)} of every 100</b> children from the bottom fifth reach the top fifth. You guessed ${Math.round(g.guess)}: off by <b>${f1(off)} children per 100</b>.`;
   return head+` With no link to parents’ income it would be 20; among these areas it runs from 4.4 (Charlotte) to 12.9 (San Jose).`;},
  again(sim){sim.p.place=KEYS[Math.floor(Math.random()*KEYS.length)];sim.p.guess=25;sim.p.view='kids';sim.p.pq=1;sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Now start at the other end. Picture 200 U.S. children whose parents were in the top fifth. As adults, 22 are in the bottom fifth, 24 in the second, 34 in the middle and 47 in the fourth. How many of every 100 stay in the top fifth?',answer:36.5,tol:0.1,unit:'of 100',d:1,hint:'Subtract to find how many are in the top fifth, then scale to 100.',explain:'200 − 22 − 24 − 34 − 47 = 73 stay on top, and 73 ÷ 200 × 100 = 36.5 per 100: almost twice the 20 you would see if parents’ income did not matter, and almost 5 times the 7.5 who climb from the bottom.'},
  {lvl:'bio',instant:true,q:'Suppose parents’ income had no effect at all on their children’s. Out of 100 children from the bottom fifth, how many would reach the top fifth?',choices:['0','7.5','20','50'],correct:2,explain:'With no link, every child would have the same 1-in-5 chance of landing in each fifth: 20 of 100. The real U.S. figure, 7.5, is well below that.'},
  {lvl:'bio',instant:true,q:'Around Charlotte, 4.4 of every 100 children from the bottom fifth reach the top fifth. Around San Jose, 12.9. In a group of 100 such children, how many more make the climb in San Jose?',choices:['About 3','About 8 or 9','About 30'],correct:1,explain:'12.9 − 4.4 = 8.5 more children per 100, nearly three times as many (12.9 ÷ 4.4 ≈ 2.9).'},
  {lvl:'bio',instant:true,q:'Around Denver, 8.7 of every 100 children from the bottom fifth reach the top fifth. What does that single number hide?',choices:['Nothing: it is measured from tax records, so it is exact for everyone','Differences between neighborhoods inside the area, and children who could not be linked to a parent in tax records','The difference between Denver and Charlotte'],correct:1,explain:'It is one average for a whole commuting zone. In the Opportunity Atlas, outcomes for similar children vary by about $5,000 a year between tracts in the same county, and the study left out children it could not link to parents.'},
  {lvl:'honors',kind:'num',q:'The U.S. rank line passes through (50, 50) with slope 0.341: expected child rank = 50 + 0.341 × (parent rank − 50). What is the expected rank of a child whose parents are at the 25th percentile? Round to one decimal.',answer:41.5,tol:0.1,unit:'',d:1,hint:'Parent rank − 50 is −25. Multiply by 0.341 and add to 50.',explain:'50 + 0.341 × (25 − 50) = 50 − 8.525 = 41.475, about 41.5. Around Denver the published value is 42.2; around Charlotte, 35.8.'},
  {lvl:'honors',instant:true,q:'The U.S. rank-rank slope is 0.341. Two children’s parents are 50 percentile ranks apart. About how far apart are the children’s expected ranks?',choices:['50 ranks','About 17 ranks','About 3 ranks'],correct:1,explain:'0.341 × 50 ≈ 17 ranks. A slope below 1 means children’s ranks are pulled toward the middle: parents’ position matters, but it does not decide everything.'},
  {lvl:'honors',instant:true,q:'The Denver area’s rank-rank slope is 0.294 and the Charlotte area’s is 0.397. Where does parents’ income predict children’s income more?',choices:['Denver','Charlotte','The same in both'],correct:1,explain:'A steeper slope means parents’ rank carries over more. Between parents at the 25th and 75th percentiles, the expected gap is 50 × 0.397 ≈ 19.9 ranks around Charlotte and 50 × 0.294 = 14.7 around Denver.'},
  {lvl:'ap',instant:true,q:'A family moves from the Charlotte area (expected rank 35.8 for children of 25th-percentile parents) to the San Jose area (44.7) when their child is 9. Using about 4% per year of exposure until age 23, what is the expected rank gain?',choices:['About 2.8 ranks','About 5.0 ranks','About 8.9 ranks'],correct:1,explain:'Exposure: 23 − 9 = 14 years × 4% = 56%. Gain: 0.56 × (44.7 − 35.8) = 0.56 × 8.9 ≈ 5.0 ranks.'},
  {lvl:'ap',instant:true,q:'Assume the U.S. transition matrix applies again to the next generation. What is the chance a grandchild of bottom-fifth grandparents reaches the top fifth?',choices:['7.5 × 7.5 = 0.6 in 100','About 15 in 100','20 in 100'],correct:1,explain:'Add up every path: Σ P(Q1→Qk)·P(Qk→Q5) = 0.337·0.075 + 0.280·0.123 + 0.184·0.183 + 0.123·0.254 + 0.075·0.365 ≈ 0.152. That is row 1 of the matrix squared. Mobility compounds, but the Markov assumption is a big one.'},
  {lvl:'ap',instant:true,q:'In the MTO experiment, why might children who moved as teenagers not gain?',choices:['The vouchers stopped working for older children','They had few years of exposure left, and a move can disrupt school and friendships, which may cancel the small benefit','Teenagers do not live with their families'],correct:1,explain:'At age 15, exposure until 23 is only 8 years × 4% = 32% of the place effect, and disruption costs come at once. The data show no gain or a slightly negative effect.'},
  {lvl:'ap',instant:true,q:'Of children born in 1940, 92 in 100 grew up to earn more than their parents had. What about children born in 1984?',choices:['About 90 in 100','About 50 in 100','About 10 in 100'],correct:1,explain:'Only 50 in 100. The researchers estimate that growth shared the way it was for the 1940 cohort would have raised it to 80, while faster growth shared the same way would have raised it only to 62.'},
  {lvl:'ap',instant:true,q:'Why is the Moving to Opportunity lottery stronger evidence than comparing families who chose to move with families who stayed?',choices:['Lotteries are fairer to families','A lottery makes the groups alike on average in everything else, such as motivation, so a difference in outcomes can be traced to the move','Families who move always earn more'],correct:1,explain:'Families who choose to move may differ in ways you cannot see. Random assignment balances those differences, which is why it is called a randomized experiment.'}
 ],
 tour:[
  {title:'Ranks, not dollars',text:'Researchers used de-identified tax records to rank every parent and every child from 0 to 100 by income. A rank compares people within their own generation, so prices and growth do not get in the way.',pause:true,setup:sim=>BioLab.setValues(sim,{place:'us',view:'kids',pq:1,age:9,from:'cl'}),focus:[0,0,520,450]},
  {title:'Where children from the bottom end up',text:'Of children whose parents were in the bottom fifth, 33.7% stayed in the bottom fifth as adults and 7.5% reached the top fifth. Here that is 200 children: 15 of them reach the top.',pause:true},
  {title:'Count it',text:'P(top fifth | bottom fifth) is a count divided by a group. Of 200 children, 67 + 56 + 37 + 25 = 185 land below the top fifth, so 200 − 185 = 15 reach it: 15 ÷ 200 = 7.5 per 100. With no link to parents’ income, it would be 40 of 200.',pause:true},
  {title:'From the top fifth',text:'Switch to parents in the top fifth: 36.5% of their children stay in the top fifth, and 10.9% fall to the bottom. If parents did not matter, every one of these numbers would be 20.',pause:true,setup:sim=>BioLab.setValues(sim,{pq:5})},
  {title:'Place changes the odds',text:'The right panel shows the bottom-to-top chance in seven large areas. Around Charlotte it is 4.4 in 100; around Denver 8.7; around San Jose 12.9. The children start in the same place on the income ladder; the area around them differs.',pause:true,setup:sim=>BioLab.setValues(sim,{pq:1,place:'de'}),focus:[492,0,308,450]},
  {lvl:'ap',title:'Out-earning your parents',text:'A second measure, absolute mobility, asks a simpler question. Of children born in 1940, 92 in 100 earned more than their parents at age 30. For children born in 1984, it was 50.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'dream'})},
  {lvl:'honors',title:'One number for the whole table',text:'The rank-rank slope is the slope of the line through every parent-child pair. Nationally it is 0.341, so a child of 25th-percentile parents expects rank 50 + 0.341 × (25 − 50) ≈ 41.5. Around Denver the slope is 0.294: parents’ rank carries over a bit less there.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'line',place:'de'})},
  {lvl:'ap',title:'A lottery as an experiment',text:'In Moving to Opportunity, about 4,600 families were sorted by lottery. Children whose families used a low-poverty voucher before they turned 13 earned $14,747 a year in their mid-twenties, against $11,270: 31% more.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'mto'})},
  {lvl:'ap',title:'Years in a place',text:'Families who move give a second test. Children pick up about 4% of the difference between places for each year they spend there, measured for moves between ages 9 and 23. A move at 9 captures about 56%.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'expo',place:'sj',from:'cl',age:9})}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the parents’ fifth change a child’s chances?</p><ol><li>Turn on <b>Show the answers now</b>.</li><li>For each parents’ fifth, from bottom to top, record how many of 200 children reach the top fifth.</li><li>Divide by 2 to get children per 100.</li></ol><p>Write one sentence: how far is each from 20, the number with no link?</p>',
  honors:'<p><b>Question:</b> Does a flatter rank line go with a better chance of climbing?</p><ol><li>For each of the seven areas, record the rank-rank slope and the bottom-to-top chance.</li><li>Plot slope on x and chance on y.</li></ol><p>Describe the pattern, then name one area that does not fit it perfectly and explain why two measures of mobility can disagree.</p>',
  ap:'<p><b>Question:</b> How much does the age of a move matter?</p><ol><li>In <b>Years in a place</b>, move from the Charlotte area to the San Jose area. Record the rank gain at ages 3, 9, 15 and 21.</li><li>Find the slope of gain against age.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning that names which part of the line was measured and which was extrapolated.</p>'},
 terms:[
  {t:'Percentile rank',d:'Where someone falls from 0 to 100 compared with everyone else: rank 25 means 25% of people have lower incomes.'},
  {t:'Quintile (fifth)',d:'One of five equal groups, each with 20% of families, ranked by income.'},
  {t:'Absolute mobility',d:'The share of children who earn more than their parents did at the same age, after adjusting for prices.'},
  {t:'Rank-rank slope',d:'The slope of the line predicting a child’s rank from the parents’ rank. 0 means no link; 1 means rank is passed down exactly.',lvl:'honors'},
  {t:'Transition matrix',d:'A table of conditional chances: row = parents’ quintile, entry = chance the child lands in each quintile. Each row adds to 100%.',lvl:'honors'},
  {t:'Randomized experiment',d:'A study where chance, such as a lottery, decides who gets the treatment, so the groups are alike in everything else.',lvl:'honors'},
  {t:'Natural experiment',d:'A study that uses a change nobody designed for research, such as families moving at different ages, as if it were random.',lvl:'ap'},
  {t:'Exposure effect',d:'How much of a place’s effect a child picks up per year spent there: about 4% per year in this research.',lvl:'ap'},
  {t:'Markov assumption',d:'Assuming the same transition chances apply in the next generation, so two generations = the matrix squared.',lvl:'ap'}
 ],
 about:'<p><b>Sources (all figures published):</b></p><ul>'+
  '<li><b>Chetty, Hendren, Kline &amp; Saez (2014),</b> “Where is the Land of Opportunity? The Geography of Intergenerational Mobility in the United States,” <i>Quarterly Journal of Economics</i> (<a href="https://economics.mit.edu/sites/default/files/2023-07/land%20of%20opp%20pub%20vers.pdf" target="_blank" rel="noopener">published version</a>). Children born 1980 to 1982; child income in 2011 to 2012 (about age 30); parent income 1996 to 2000. National rank-rank slope 0.341; bottom-to-top chance 7.5%; Table II is the transition matrix used here. Table III, 50 largest commuting zones (expected rank at the 25th percentile, bottom-to-top %, slope): Salt Lake City 46.2, 10.8, 0.264; San Jose 44.7, 12.9, 0.235; Seattle 43.2, 10.9, 0.273; Denver 42.2, 8.7, 0.294 (19th of 50); Chicago 39.4, 6.5, 0.393; Atlanta 36.0, 4.5, 0.366; Charlotte 35.8, 4.4, 0.397. The U.S. expected rank at the 25th percentile (41.5) is computed here, not published: the national line passes through the average ranks (50, 50).</li>'+
  '<li><b>Chetty, Hendren, Grusky, Hell, Manduca &amp; Narang (2017),</b> “The Fading American Dream: Trends in Absolute Income Mobility Since 1940,” <i>Science</i> 356(6336), 398 to 406 (<a href="https://opportunityinsights.org/paper/the-fading-american-dream/" target="_blank" rel="noopener">opportunityinsights.org</a>; <a href="https://www.nber.org/system/files/working_papers/w22910/w22910.pdf" target="_blank" rel="noopener">NBER w22910</a>). 92% of children born in 1940 earned more than their parents at age 30; 50% of those born in 1984. For the 1980 cohort, faster GDP growth with the same distribution gives 62%; 1940-style sharing of growth gives 80%.</li>'+
  '<li><b>Chetty, Hendren &amp; Katz (2016),</b> “The Effects of Exposure to Better Neighborhoods on Children: New Evidence from the Moving to Opportunity Experiment,” <i>American Economic Review</i> 106, 855 to 902 (<a href="https://lkatz.scholars.harvard.edu/publications/effects-exposure-better-neighborhoods-children-new-evidence-moving-opportunity" target="_blank" rel="noopener">abstract</a>; <a href="https://opportunityinsights.org/paper/newmto/" target="_blank" rel="noopener">summary</a>). About 4,600 families in high-poverty public housing in five cities, 1994 to 1998, randomly assigned to a voucher requiring a move to a tract with poverty below 10%, a regular voucher, or no voucher. Children under 13 whose families used the experimental voucher: $3,477 (31%) more a year in their mid-twenties, against a control mean of $11,270. Teens: no gain or slightly negative.</li>'+
  '<li><b>Chetty &amp; Hendren (2018),</b> “The Impacts of Neighborhoods on Intergenerational Mobility I: Childhood Exposure Effects,” <i>Quarterly Journal of Economics</i> 133(3), 1107 to 1162 (<a href="https://hendren.scholars.harvard.edu/publications/impacts-neighborhoods-intergenerational-mobility-i-childhood-exposure-effects" target="_blank" rel="noopener">abstract</a>). More than seven million families who moved. Outcomes converge to the new area’s at about 4% per year of exposure, estimated for moves between ages 9 and 23. A move at 9 captures about 56%; the authors’ 80% for 20 years extrapolates the 4% rate to younger ages, which they call a strong assumption. The tool draws ages below 9 dashed for that reason.</li>'+
  '<li><b>Chetty, Friedman, Hendren, Jones &amp; Porter,</b> “The Opportunity Atlas: Mapping the Childhood Roots of Social Mobility” (2018 working paper; <i>American Economic Review</i> 116(1), 2026) (<a href="https://opportunityinsights.org/paper/the-opportunity-atlas/" target="_blank" rel="noopener">opportunityinsights.org</a>). Outcomes by Census tract: for children of 25th-percentile parents, mean household income at 35 varies with a standard deviation of $5,000 across tracts within the same county. Explore Colorado tracts at opportunityatlas.org.</li></ul>'+
  '<p><b>Model notes.</b> The 200 children are the matrix row times 200, rounded so they add to 200. Areas other than the U.S. show only the bottom-to-top share, since that is what the area table reports. Moving gains use each area’s expected rank at the 25th percentile as its “place effect,” which mixes the place’s causal effect with differences in who lives there; the researchers’ own estimates separate the two. Two generations assume the same matrix repeats (a Markov assumption), which no one has measured.</p>'+
  '<p><b>How the research shaped policy.</b> In Seattle and King County, Creating Moves to Opportunity offered voucher families information, short-term financial help, landlord connections and one-on-one search help. In a randomized trial it raised the share who moved to high-mobility areas from 15% to 53% (Bergman, Chetty, DeLuca, Hendren, Katz &amp; Palmer, <i>American Economic Review</i>; <a href="https://opportunityinsights.org/paper/cmto/" target="_blank" rel="noopener">paper page, 2023</a>). HUD’s Community Choice Demonstration, funded with $50 million in the 2019 and 2020 appropriations acts, is testing mobility services for about 9,400 voucher families with children at 8 public housing agencies, with a randomized evaluation (<a href="https://hud.gov/program_offices/public_indian_housing/programs/hcv/communitychoicedemo" target="_blank" rel="noopener">hud.gov</a>).</p>'+
  '<p><b>School funding, with evidence on each side.</b> Jackson, Johnson &amp; Persico studied court-ordered school finance reforms: a 10% increase in per-pupil spending for all 12 school years led to 0.27 more years of school, 7.25% higher wages and 3.67 percentage points less adult poverty, with much larger effects for children from low-income families (<a href="https://www.nber.org/papers/w20847" target="_blank" rel="noopener">NBER w20847, 2015</a>; <i>QJE</i> 2016). Eric Hanushek argues that large increases in school resources have not produced much improvement in learning, and that teacher quality and incentives matter more than the amount spent (“The Failure of Input-Based Schooling Policies,” <i>Economic Journal</i>, 2003; <a href="https://hanushek.stanford.edu/publications/failure-input-based-schooling-policies" target="_blank" rel="noopener">hanushek.stanford.edu</a>). Both sides agree that how money is spent matters; they disagree about how much more money alone can do.</p>'+
  '<p><b>A note on this research.</b> None of it asks for or uses your family’s income. It describes chances, not destinies, and every area includes children who beat the odds. Catholic social teaching speaks of a preferential option for the poor. If you ran a housing-search program like Creating Moves to Opportunity, which number on this page would tell you where to start?</p>'
};
BioLab.register(SIM);
})();
