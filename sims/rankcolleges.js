(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Eight fictional colleges. Each metric is put on one scale (points: best college 100, worst 0; or z-scores),
   flipped where lower counts as better, then combined as a weighted average: score = Σ wⱼ·pⱼ / Σ wⱼ. */
const M=[
 {k:'grad',l:'Graduation rate',s:'Grad',u:'%',c:'s2'},
 {k:'pell',l:'Pell students’ graduation rate',s:'Pell',u:'%',c:'s6'},
 {k:'sat',l:'SAT median',s:'SAT',u:'',c:'s5'},
 {k:'accept',l:'Acceptance rate (lower counts as better)',s:'Admit',u:'%',c:'s1',low:true},
 {k:'giving',l:'Alumni who donate',s:'Give',u:'%',c:'s4'},
 {k:'spend',l:'Spending per student',s:'Spend',u:'k',c:'cv-glass'},
 {k:'net',l:'Net price (lower counts as better)',s:'Net',u:'k',c:'s3',low:true},
 {k:'earn',l:'Median earnings after college',s:'Earn',u:'k',c:'cv-h'}];
/* grad %, Pell grad %, SAT, accept %, giving %, spending $k, net price $k, earnings $k */
const COL=[
 ['Ashgrove',  93,85,1490, 8,21, 96,29,84],
 ['Bellwick',  91,76,1460,12,27,128,47,80],
 ['Cindervale',84,80,1330,58, 7, 31,17,71],
 ['Dunmere',   76,62,1240,49,11, 44,37,57],
 ['Emberline', 69,68,1120,84, 3, 19,12,53],
 ['Fernhollow',87,83,1410,31, 9, 52,24,90],
 ['Glasswater',89,81,1370,36,24, 68,39,61],
 ['Harrowmoor',61,52,1090,77, 4, 22,27,45]];
const GAMER=3,GAMED={sat:1360,accept:20,giving:20,spend:90};
const PRE={
 old:{grad:6,pell:0,sat:5,accept:4,giving:2,spend:4,net:0,earn:0},
 addnet:{grad:6,pell:0,sat:5,accept:4,giving:2,spend:4,net:6,earn:0},
 newer:{grad:6,pell:6,sat:2,accept:0,giving:1,spend:3,net:0,earn:3},
 equal:{grad:1,pell:1,sat:1,accept:1,giving:1,spend:1,net:1,earn:1}};
const W=(sim,j)=>Math.max(0,+sim.p['w_'+M[j].k]||0);
function raw(sim){return COL.map((r,i)=>M.map((m,j)=>(sim.p.game&&i===GAMER&&GAMED[m.k]!=null)?GAMED[m.k]:r[j+1]));}
function pts(sim){const X=raw(sim),z=sim.p.norm==='z',P=X.map(()=>[]);
 M.forEach((m,j)=>{const xs=X.map(r=>r[j]),mn=Math.min(...xs),mx=Math.max(...xs),mu=xs.reduce((a,b)=>a+b,0)/xs.length,sd=Math.sqrt(xs.reduce((a,b)=>a+(b-mu)*(b-mu),0)/xs.length)||1;
  X.forEach((r,i)=>{let p=z?(r[j]-mu)/sd:(mx>mn?100*(r[j]-mn)/(mx-mn):50);if(m.low)p=z?-p:100-p;P[i][j]=p;});});return P;}
function scores(sim){const P=pts(sim),Wt=M.reduce((a,m,j)=>a+W(sim,j),0),N=P.map(r=>r.reduce((a,p,j)=>a+W(sim,j)*p,0));
 const S=N.map(n=>Wt>0?n/Wt:0),order=S.map((s,i)=>i).sort((a,b)=>S[b]-S[a]||a-b),rank=[];order.forEach((i,r)=>rank[i]=r+1);
 return {P,Wt,N,S,order,rank,top:order[0]};}
/* Smallest change to one weight (keeping it in 0–10) that changes #1. Rankings depend only on N = Σ w·p, because Σ w is shared. */
function flips(sim,only){const r=scores(sim);if(r.Wt<=0)return [];const t=r.top,out=[];
 M.forEach((m,j)=>{if(only!=null&&j!==only)return;const w=W(sim,j);COL.forEach((c,i)=>{if(i===t)return;const den=r.P[i][j]-r.P[t][j];if(Math.abs(den)<1e-9)return;const d=(r.N[t]-r.N[i])/den,nw=w+d;
   if(nw<-1e-9||nw>10+1e-9)return;out.push({j,i,d,from:w,to:nw});});});
 return out.sort((a,b)=>Math.abs(a.d)-Math.abs(b.d));}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* While the student works out their pick's score ("Your turn"), the ranking stays hidden. */
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.show||(sim.gutS&&(sim.gutS.g||sim.gutS.m)))&&!pend(sim);
const ci=sim=>Math.max(0,COL.findIndex(c=>c[0]===sim.p.pick));
const nm=i=>COL[i][0];
const fmtV=(m,v)=>m.u==='k'?'$'+v+'k':m.u==='%'?v+'%':String(v);
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function preset(sim,key){const v={};M.forEach(m=>v['w_'+m.k]=PRE[key][m.k]);BioLab.setValues(sim,v);}
const isZ=sim=>sim.p.norm==='z';
const scoreTxt=(sim,v)=>isZ(sim)?f2(v):f1(v);
/* "Your turn": the weighted average for one college, from its points rounded as the prompt shows them */
const mn=t=>String(t).replace('-','−');
const ptTxt=(sim,v)=>mn(isZ(sim)?f2(v):f1(v));
const ptP=(sim,v)=>v<0&&ptTxt(sim,v)!=='−0.00'?'('+ptTxt(sim,v)+')':ptTxt(sim,v);
const ptR=(sim,v)=>isZ(sim)?Math.round(v*100)/100:Math.round(v*10)/10;
function wavg(sim,i){const r=scores(sim),js=M.map((m,j)=>j).filter(j=>W(sim,j)>0),num=js.reduce((a,j)=>a+W(sim,j)*ptR(sim,r.P[i][j]),0);return {js,num,den:r.Wt,v:r.Wt>0?num/r.Wt:0,r};}
const wN=v=>fmtNum(v,v%1?1:0);
function wExpr(sim,i){const w=wavg(sim,i);return `(${w.js.map(j=>wN(W(sim,j))+' × '+ptP(sim,w.r.P[i][j])).join(' + ')}) ÷ ${wN(w.den)}`;}
const calcAns=sim=>{const v=wavg(sim,ci(sim)).v;return isZ(sim)?Math.round(v*100)/100:Math.round(v*10)/10;};

const SIM={
 id:'rankcolleges',hash:'rankcolleges',apUnit:19,order:3,tab:'Rank the colleges',kind:'Simulation',
 skills:{bio:'Weighted average: score = Σ w·p ÷ Σ w · Algebra 1 (Unit 2)',honors:'Weighted averages, min-max scaling and z-scores · Algebra 1 (Unit 2), Statistics (Ch. 2)',ap:'Weighted averages and linear break points (sensitivity) · Algebra 1 (Unit 2), Statistics (Ch. 2)'},
 card:'Guess which college a ranking formula puts at #1, then change the weights and watch the order, and the “best” college, change.',
 title:'Rank the colleges: who decides what “best” means?',
 lede:{bio:'A college ranking turns many numbers into one score. Someone has to decide which numbers count and how much. Change those choices and a different college comes out on top, even though nothing about the colleges changed.',
  honors:'Each metric is rescaled so they can be added: points from 0 to 100, or z-scores. The score is a weighted average, Σ w·p / Σ w. The weights are the opinion; the arithmetic just carries it out.',
  ap:'Because Σ w is shared by every college, the order depends only on Σ w·p, which is linear in each weight. So each weight has an exact break point where #1 changes: Δw = (gap in Σ w·p) ÷ (difference in that metric’s points).'},
 scale:'Eight made-up colleges with realistic-looking numbers. No real college, ranking or data.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your ranking formula',
 controls:[
  {id:'pick',label:'Your gut: which college is #1 under this formula?',type:'seg',def:'Cindervale',options:COL.map(c=>({v:c[0],l:c[0]}))},
  {id:'show',label:'Show the ranking',type:'toggle',def:false,noGut:true,help:'Off: you see only the raw numbers, so you can guess first.'},
  {id:'game',label:'Dunmere chases the formula',type:'toggle',def:false,noGut:true,onChange:clearGut,help:'Dunmere recruits more applicants to reject (acceptance 49% → 20%), reports a higher SAT median (1240 → 1360), gets more alumni to give a few dollars (11% → 20%) and builds new facilities ($44k → $90k per student). Its graduation rates, earnings and net price do not change.'},
  ...M.map(m=>({id:'w_'+m.k,label:'Weight: '+m.l,type:'range',min:0,max:10,step:0.5,def:PRE.old[m.k],unit:'',noGut:true,onChange:clearGut})),
  {id:'norm',label:'Put every metric on one scale with',type:'seg',def:'pts',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'pts',l:'Points: best 100, worst 0'},{v:'z',l:'z-scores'}]}
 ],
 actions:[
  {id:'old',label:'Old-style formula (no cost)',run(sim){preset(sim,'old');}},
  {id:'addnet',label:'Add net price',run(sim){preset(sim,'addnet');}},
  {id:'newer',label:'Newer-style formula',run(sim){preset(sim,'newer');}},
  {id:'equal',label:'Equal weights',run(sim){preset(sim,'equal');}}
 ],
 init(){return {ry:COL.map((c,i)=>i)};},
 step(){},
 metrics:[
  {id:'top',label:'Ranked #1',text:true,get:sim=>shown(sim)?nm(scores(sim).top):'Lock in your gut to see'},
  {id:'topscore',label:'Score of #1',unit:'',d:2,min:null,max:null,get:sim=>shown(sim)?scores(sim).S[scores(sim).top]:null},
  {id:'gap',label:'Lead of #1 over #2',unit:'',d:2,min:0,max:null,get:sim=>{if(!shown(sim))return null;const r=scores(sim);return r.S[r.order[0]]-r.S[r.order[1]];}},
  {id:'pickrank',label:'Rank of your pick',unit:'',d:0,min:1,max:8,get:sim=>shown(sim)?scores(sim).rank[ci(sim)]:null},
  {id:'pickscore',label:'Score of your pick',unit:'',d:2,min:null,max:null,get:sim=>shown(sim)?scores(sim).S[ci(sim)]:null},
  {id:'dunrank',label:'Dunmere’s rank',unit:'',d:0,min:1,max:8,get:sim=>shown(sim)?scores(sim).rank[GAMER]:null},
  {id:'netflip',label:'Net price weight where #1 changes',unit:'',d:2,lvl:'ap',min:0,max:10,get:sim=>{if(!shown(sim))return null;const f=flips(sim,6)[0];return f?f.to:null;}},
  {id:'sens',label:'Smallest single weight change that changes #1',text:true,lvl:'ap',get:sim=>{if(!shown(sim))return 'Lock in your gut to see';const f=flips(sim)[0];if(!f)return 'No single weight within 0 to 10 changes #1';return `${M[f.j].s} weight ${f2(f.from)} → ${f2(f.to)}: ${nm(f.i)} passes ${nm(scores(sim).top)}`;}}
 ],
 graphs:[{id:'scores',label:'Scores under this formula',custom:true},{id:'netw',label:'Scores as the net price weight changes',lvl:'honors',custom:true}],defaultGraph:'scores',
 plot(sim,ctx,box,id){
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see the scores.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  if(id==='netw'){const at=w=>{const o=sim.p.w_net;sim.p.w_net=w;const s=scores(sim).S;sim.p.w_net=o;return s;};
   const all=[];for(let w=0;w<=10;w+=0.5)all.push(at(w));const flat=[].concat(...all),lo=Math.floor(Math.min(...flat)/(isZ(sim)?0.5:10))*(isZ(sim)?0.5:10),hi=Math.ceil(Math.max(...flat)/(isZ(sim)?0.5:10))*(isZ(sim)?0.5:10);
   const ax=axes(ctx,box,{xmin:0,xmax:10,ymin:lo,ymax:hi,xl:'Net price weight',yl:isZ(sim)?'Score (z)':'Score (points)'});
   const cols=['s1','s2','s3','s4','s5','s6','cv-h','cv-glass'];
   COL.forEach((c,i)=>{ctx.strokeStyle=PAL[cols[i]];ctx.lineWidth=2;ctx.beginPath();all.forEach((s,j)=>{const x=ax.X(j*0.5),y=ax.Y(s[i]);j?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
    const last=all[all.length-1][i];txt(ctx,c[0],ax.X(10)-4,ax.Y(last)-4,{s:11,c:PAL[cols[i]],a:'right'});});
   const x0=ax.X(clamp(sim.p.w_net,0,10));ctx.strokeStyle=PAL['g-axis'];ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x0,box.T);ctx.lineTo(x0,box.T+box.H);ctx.stroke();ctx.setLineDash([]);return;}
  const r=scores(sim),lo=isZ(sim)?Math.min(0,Math.floor(Math.min(...r.S)*2)/2):0,hi=isZ(sim)?Math.max(0.5,Math.ceil(Math.max(...r.S)*2)/2):100;
  const ax=axes(ctx,box,{xmin:0,xmax:8,ymin:lo,ymax:hi,xl:'',yl:isZ(sim)?'Score (z)':'Score (points)',xcats:r.order.map(i=>nm(i).slice(0,5))});
  r.order.forEach((i,k)=>{const x=ax.X(k+0.15),w=ax.X(k+0.85)-x,y0=ax.Y(Math.max(lo,0)),y1=ax.Y(r.S[i]);ctx.fillStyle=i===ci(sim)?PAL['s4']:PAL['g-line'];ctx.fillRect(x,Math.min(y0,y1),w,Math.abs(y1-y0));});},
 draw(sim,ctx,vdt,k0){const k=Math.min(k0,1.8),big=k>1.3,fs=12*k,r=scores(sim),sh=shown(sim),G=GS(sim),pick=G&&G.g?G.g.pick:-1,st=sim.st||(sim.st={ry:COL.map((c,i)=>i)});
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const tgt=COL.map((c,i)=>sh?r.rank[i]-1:i),a=vdt>0?1-Math.exp(-10*vdt):1;st.ry=st.ry.map((y,i)=>Math.abs(y-tgt[i])<0.01?tgt[i]:y+(tgt[i]-y)*a);
  const X=raw(sim),rev=!!(G&&G.m&&r.Wt>0);let T=big?48:52,rh=(446-T-(rev?24*k:0))/8;
  if(!sh){T=8+1.3*(big?fs:13*k)+8+2.15*fs+4;rh=(446-T)/8;
   /* data view: the raw numbers, alphabetical. Weighted columns are bold. */
   let cols=M.map((m,j)=>j);if(big){const wj=cols.filter(j=>W(sim,j)>0);cols=(wj.length?wj:cols).slice(0,6);}
   const nameW=big?150:132,cw=(790-nameW)/cols.length;
   txt(ctx,big?'Which is #1? Bold columns count.':'Which college is #1 under this formula? Only the bold columns count; ×w is the weight.',12,8,{s:big?fs:13*k,w:700,b:'top'});
   cols.forEach((j,c)=>{const m=M[j],x=nameW+cw*(c+1)-8,on=W(sim,j)>0;txt(ctx,m.s,x,T-4-fs*1.05,{s:fs,w:on?700:400,c:on?PAL[m.c]:PAL['cv-soft'],a:'right',b:'bottom'});
    txt(ctx,on?'×'+fmtNum(W(sim,j),W(sim,j)%1?1:0):'×0',x,T-4,{s:fs,w:on?700:400,c:on?PAL['cv-ink']:PAL['cv-soft'],a:'right',b:'bottom'});});
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,T);ctx.lineTo(792,T);ctx.stroke();
   COL.forEach((row,i)=>{const y=T+st.ry[i]*rh,yc=y+rh/2;if(i%2){ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(8,y,784,rh);}
    if(i===pick){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;rr(ctx,6,y+2,788,rh-4,6);ctx.stroke();}
    txt(ctx,row[0],14,yc,{s:fs,w:700,b:'middle'});
    cols.forEach((j,c)=>{const m=M[j],on=W(sim,j)>0,gm=sim.p.game&&i===GAMER&&GAMED[m.k]!=null;txt(ctx,fmtV(m,X[i][j])+(gm?'*':''),nameW+cw*(c+1)-8,yc,{s:fs,w:on?700:400,c:gm?PAL['s1']:on?PAL['cv-ink']:PAL['cv-soft'],a:'right',b:'middle'});});});
   return;}
  /* ranked view: stacked contributions w·p / Σw, sorted by score */
  const used=M.map((m,j)=>j).filter(j=>W(sim,j)>0);
  let lx=12;const sw=12*Math.min(k,1.4);
  if(isZ(sim))txt(ctx,big?'Score in standard deviations (z)':'Each bar: the weighted average of z-scores, in standard deviations from the mean',12,10+sw/2,{s:fs,w:700,c:PAL['cv-soft'],b:'middle'});
  else used.forEach(j=>{const m=M[j],w=(m.s.length*0.6+0.4)*fs+sw+10;if(lx+w>792)return;ctx.fillStyle=PAL[m.c];rr(ctx,lx,10,sw,sw,3);ctx.fill();txt(ctx,m.s,lx+sw+5,10+sw/2,{s:fs,w:700,c:PAL[m.c],b:'middle'});lx+=w;});
  if(!used.length)txt(ctx,'Set at least one weight.',12,16,{s:fs,w:700,b:'middle'});
  const rx=12,nx=big?52:48,bx0=big?196:180,bx1=big?668:690,scx=big?740:748,z=isZ(sim);
  const zlo=z?Math.min(-1.5,...r.S):0,zhi=z?Math.max(1.5,...r.S):100,BX=v=>bx0+(bx1-bx0)*(v-zlo)/(zhi-zlo);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,T);ctx.lineTo(792,T);ctx.stroke();
  if(z){ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(BX(0),T);ctx.lineTo(BX(0),446);ctx.stroke();ctx.setLineDash([]);}
  COL.forEach((row,i)=>{const y=T+st.ry[i]*rh,yc=y+rh/2,bh=Math.min(rh*0.62,26);
   if(i===pick){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;rr(ctx,6,y+2,788,rh-4,6);ctx.stroke();txt(ctx,'gut',790,yc,{s:fs,w:700,c:PAL['s4'],a:'right',b:'middle'});}
   txt(ctx,'#'+r.rank[i],rx,yc,{s:fs,w:700,c:r.rank[i]===1?PAL['rj']:PAL['cv-ink'],b:'middle'});
   txt(ctx,row[0]+(sim.p.game&&i===GAMER?'*':''),nx,yc,{s:fs,w:700,c:sim.p.game&&i===GAMER?PAL['s1']:PAL['cv-ink'],b:'middle'});
   if(r.Wt>0){if(!z){let x=bx0;used.forEach(j=>{const w=(bx1-bx0)*W(sim,j)*r.P[i][j]/r.Wt/100;if(w>0.3){ctx.fillStyle=PAL[M[j].c];ctx.fillRect(x,yc-bh/2,w,bh);}x+=w;});}
    else{const x0=BX(0),x1=BX(r.S[i]);ctx.fillStyle=r.S[i]>=0?PAL['s2']:PAL['s1'];ctx.fillRect(Math.min(x0,x1),yc-bh/2,Math.abs(x1-x0),bh);}}
   txt(ctx,scoreTxt(sim,r.S[i]),scx,yc,{s:fs,w:700,a:'right',b:'middle'});});
  if(rev){const t=r.top;let line=`#1 ${nm(t)}: ${wExpr(sim,t)} = ${scoreTxt(sim,r.S[t])}`;ctx.font='700 '+fs+'px '+FONT;
   if(ctx.measureText(line).width>770)line=`#1 ${nm(t)}: Σ w·p ÷ Σ w = ${fmtNum(r.N[t],isZ(sim)?2:1)} ÷ ${wN(r.Wt)} = ${scoreTxt(sim,r.S[t])}`;
   txt(ctx,line,12,446-6*k,{s:fs,w:700,c:PAL['rj']});}},
 narrate(sim){const r=scores(sim);
  if(r.Wt<=0)return 'Every weight is 0, so every college scores the same. <b>A ranking needs someone to decide what counts.</b>';
  const used=M.filter((m,j)=>W(sim,j)>0).map(m=>m.s.toLowerCase());
  if(pend(sim))return `Your pick is locked. <b>Work out its score:</b> multiply each of its points by the weight, add, and divide by the total weight.`;
  if(!shown(sim))return `This formula counts ${used.length} of 8 numbers${W(sim,6)>0?'':', and <b>not the net price</b>'}. Read the bold columns and guess which college comes out on top.`;
  const t=r.top,n2=r.order[1],f=flips(sim)[0];
  let s=`Under these weights, <b>${nm(t)} is #1</b>, ${scoreTxt(sim,r.S[t]-r.S[n2])} ahead of ${nm(n2)}.`;
  if(W(sim,6)<=0)s+=` Cost is not in the formula: ${nm(t)}’s net price is $${raw(sim)[t][6]}k a year.`;
  if(f)s+=` Change the ${M[f.j].s.toLowerCase()} weight from ${f2(f.from)} to ${f2(f.to)} and ${nm(f.i)} takes over.`;
  if(sim.p.game)s+=` Dunmere is #${r.rank[GAMER]} after chasing the formula.`;
  return s;},
 gut:{better:'lower',controls:['pick'],
  ask:{bio:'Read the numbers. The formula counts only the bold columns, with the weights shown. Pick the college you think comes out #1 here, then lock it in.',
   honors:'Using only the bold columns and their weights, pick the college you think scores highest. Lock it in before you see the ranking.'},
  lock(sim){const i=ci(sim),r=scores(sim);return {v:r.rank[i],pick:i,label:nm(i)};},
  solve(sim){const r=scores(sim),t=r.top;sim.p.pick=nm(t);sim.p.show=true;return {v:1,pick:t,label:`${nm(t)}, with a score of ${scoreTxt(sim,r.S[t])}`};},
  hint:{bio:'Lock in your pick. Then you will work out its score yourself.'},
  calc:{d:2,tol:0.06,
   prompt(sim){const i=ci(sim),w=wavg(sim,i);if(!w.js.length)return `Every weight is 0. What score does ${nm(i)} get?`;
    const z=isZ(sim),list=w.js.map(j=>`${M[j].s} <b>${ptTxt(sim,w.r.P[i][j])}</b> (weight ${wN(W(sim,j))})`).join(', ');
    return `Your pick, ${nm(i)}, earns these ${z?'z-scores':'points (best college 100, worst 0)'}: ${list}. Its score is the weighted average: (sum of weight × ${z?'z-score':'points'}) ÷ (sum of weights). What is ${nm(i)}’s score?`;},
   answer:calcAns,
   hint:'Multiply each number by its weight and add. Then divide by the sum of the weights, not by how many numbers there are.',
   steps(sim){const i=ci(sim),w=wavg(sim,i);if(!w.js.length)return ['With every weight 0, nothing counts: the score is <b>0</b>.'];
    const prods=w.js.map(j=>W(sim,j)*ptR(sim,w.r.P[i][j]));
    return [`Weight × ${isZ(sim)?'z-score':'points'}: ${w.js.map((j,n)=>wN(W(sim,j))+' × '+ptP(sim,w.r.P[i][j])+' = '+mn(fmtNum(prods[n],isZ(sim)?2:1))).join('; ')}.`,
     `Add them: ${mn(fmtNum(w.num,isZ(sim)?2:1))}. Add the weights: ${w.js.map(j=>wN(W(sim,j))).join(' + ')} = ${wN(w.den)}.`,
     `Score = ${mn(fmtNum(w.num,isZ(sim)?2:1))} ÷ ${wN(w.den)} ≈ <b>${mn(isZ(sim)?f2(calcAns(sim)):f1(calcAns(sim)))}</b>.`];}},
  formula(sim){const r=scores(sim);if(r.Wt<=0)return 'Every weight is 0, so every score is 0.';const t=r.top,n2=r.order[1];
   return `Score = Σ w·p ÷ Σ w.<br>#1 ${nm(t)}: ${wExpr(sim,t)} = ${scoreTxt(sim,r.S[t])}.<br>#2 ${nm(n2)}: ${wExpr(sim,n2)} = ${scoreTxt(sim,r.S[n2])}.`;},
  how:{bio:'The math turns every number into points (the best college gets 100, the worst 0), multiplies each by its weight, adds them up and divides by the total weight. That is a weighted average. The highest average is #1.',
   honors:'Each metric is rescaled to points or z-scores, flipped where lower counts as better, and combined as Σ w·p / Σ w. Sorting those scores gives the ranking.',
   ap:'Score = Σ w·p / Σ w. Since Σ w is shared, the order depends only on Σ w·p, which is linear in each weight, so the break point for each weight is a single division.'},
  compare(sim,g,m){const r=scores(sim),X=raw(sim),gi=g.pick,ti=m.pick,f=flips(sim)[0];
   const sensT=f?` And it is fragile: change the ${M[f.j].s.toLowerCase()} weight from ${f2(f.from)} to ${f2(f.to)} and ${nm(f.i)} is #1 instead.`:'';
   if(gi===ti)return `Your gut was right on: ${nm(ti)} is #1 under this formula. You read the weights the way the formula does.${sensT}`;
   const dn=X[gi][6]-X[ti][6],cost=dn<0?` Your pick costs <b>$${-dn}k a year less</b> than ${nm(ti)} (net price $${X[gi][6]}k vs. $${X[ti][6]}k), about $${-4*dn}k over 4 years`+(W(sim,6)<=0?', and this formula never looks at cost.':'.'):dn>0?` ${nm(ti)} also costs $${dn}k a year less than your pick.`:'';
   return `Your pick, ${nm(gi)}, ranks <b>#${r.rank[gi]}</b> under this formula, ${scoreTxt(sim,r.S[ti]-r.S[gi])} ${isZ(sim)?'':'points '}behind ${nm(ti)}.${cost}${sensT}`;},
  again(sim){const ks=Object.keys(PRE),key=ks[Math.floor(Math.random()*ks.length)];M.forEach(m=>sim.p['w_'+m.k]=PRE[key][m.k]);sim.p.show=false;sim.p.game=false;sim.p.pick='Cindervale';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A new formula: count only graduation rate and net price, weighted equally (1 and 1). Cindervale earns 71.9 points for graduation rate and 85.7 for net price. What is its score?',answer:78.8,tol:0.1,d:1,unit:'',hint:'Weight × points for each, add, then divide by the sum of the weights.',explain:'(1 × 71.9 + 1 × 85.7) ÷ (1 + 1) = 157.6 ÷ 2 = 78.8. Under this formula Cindervale is #1.'},
  {lvl:'bio',instant:true,q:'Under the old-style formula (no cost), Ashgrove has the highest SAT median and the lowest acceptance rate. Which college is #1?',choices:['Ashgrove','Bellwick','Fernhollow','Cindervale'],correct:1,explain:'Bellwick scores 95.4 to Ashgrove’s 92.0. Bellwick spends $128k per student and has the most alumni donors, and this formula rewards both. Leading on the two numbers people talk about most is not enough.'},
  {lvl:'bio',instant:true,q:'Start from the old-style formula and give net price a weight of 6. What happens?',choices:['Nothing: the best colleges stay the best','Ashgrove passes Bellwick, and Bellwick falls to #2','Cindervale, the cheapest good college, jumps to #1'],correct:1,explain:'Bellwick has the highest net price ($47k a year), so it gets 0 net price points; Ashgrove ($29k) gets 51.4. Ashgrove becomes #1 with 83.0 to Bellwick’s 74.2. Fernhollow passes Glasswater for #3. Cindervale, the cheapest good college ($17k), stays #5: its score rises from 45.0 to 54.1, but the other weights still favor rich, selective colleges.'},
  {lvl:'bio',instant:true,q:'Old-style formula. Dunmere chases the formula: more rejected applicants, a higher reported SAT median, more alumni donors, new buildings. Its graduation rates, earnings and net price do not change. What happens to its rank?',choices:['It stays #6','It rises from #6 to #4','It rises to #1'],correct:1,explain:'Dunmere’s score rises from 38.6 to 64.7, passing Cindervale and Fernhollow. Nothing about what students learn, earn or pay changed. That is what gaming a proxy looks like.'},
  {lvl:'honors',instant:true,q:'Why rescale each metric to points before averaging, instead of adding the raw numbers?',choices:['Raw numbers are less accurate','Metrics use different units and ranges: SAT medians in the 1000s would swamp graduation rates in the 60s to 90s','Points make every college score higher'],correct:1,explain:'Adding a 1490 SAT to a 93% graduation rate lets the SAT decide almost everything. Rescaling puts every metric on the same 0 to 100 scale, so the weights, not the units, decide how much each counts.'},
  {lvl:'honors',instant:true,q:'Old-style formula. Switch from points to z-scores. Who is #1?',choices:['Still Bellwick, just ahead of Ashgrove','Ashgrove','Fernhollow'],correct:0,explain:'With z-scores Bellwick still leads, 1.27 to 1.17 standard deviations. The order of the top two holds, but a different (and equally reasonable) scaling changes every score. Even the scale is a choice.'},
  {lvl:'ap',instant:true,q:'Old-style formula. Bellwick leads Ashgrove by 71.4 weighted points (Σ w·p). On net price, Ashgrove earns 51.4 points and Bellwick 0. What net price weight makes Ashgrove #1?',choices:['About 0.5','About 1.4','About 6','About 14'],correct:1,explain:'Raising the net price weight by Δ adds 51.4Δ to Ashgrove’s total and 0 to Bellwick’s, so Ashgrove catches up when 51.4Δ = 71.4: Δ ≈ 1.39. A weight of 1.4 out of 10 on cost is enough to change #1.'},
  {lvl:'ap',instant:true,q:'Why does dividing by the total weight Σ w never change the order of the colleges?',choices:['Because Σ w is the same number for every college, so dividing by it keeps every comparison the same','Because Σ w is always 1','It does change the order'],correct:0,explain:'Every college’s score is its own Σ w·p over the same Σ w. Dividing by a positive constant keeps every inequality, so the order depends only on Σ w·p. That is why each weight’s break point is a simple linear equation.'}
 ],
 tour:[
  {title:'The raw numbers',text:'Eight made-up colleges and eight numbers about each one. A ranking formula has to boil these down to one score per college.',focus:[4,4,792,442],pause:true,setup:sim=>{preset(sim,'old');BioLab.setValues(sim,{show:false,game:false,norm:'pts'});}},
  {title:'Someone picks the weights',text:'This old-style formula counts graduation rate, SAT, acceptance rate, alumni giving and spending. It gives cost a weight of 0, as U.S. News’s original ranking left cost out. The weights are opinions.',focus:[120,24,676,44],pause:true},
  {title:'Points, then a weighted average',text:'Each number becomes points: the best college gets 100, the worst 0 (lower acceptance rate and net price count as better). Then score = (sum of weight × points) ÷ (sum of weights).',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'The #1 college',text:'Bellwick is #1 with 95.4, just ahead of Ashgrove’s 92.0. Each colored piece of a bar is what one metric adds. Bellwick wins on spending and alumni giving.',focus:[4,46,792,60],pause:true},
  {title:'Add the cost',text:'Give net price a weight of 6. Bellwick, the most expensive, drops to #2, and Ashgrove leads, 83.0 to 74.2. Same colleges, same numbers, a different #1.',pause:true,setup:sim=>preset(sim,'addnet')},
  {title:'Chasing the formula',text:'Back to the old formula, and let Dunmere game it: reject more applicants, report a higher SAT, get more alumni to donate and build. It jumps from #6 to #4. Nothing about its students changed.',pause:true,setup:sim=>{preset(sim,'old');BioLab.setValues(sim,{game:true,show:true});}},
  {lvl:'honors',title:'A newer-style formula',text:'Drop acceptance rate and weight how well Pell students graduate, as U.S. News now does (these weights are only illustrative). Ashgrove leads, Bellwick is #2 and Fernhollow #3. Dunmere’s gaming now buys it much less: it stays #6.',pause:true,setup:sim=>{preset(sim,'newer');BioLab.setValues(sim,{game:true,show:true});}},
  {lvl:'ap',title:'How fragile is #1?',text:'Under the old formula, Ashgrove trails Bellwick by 71.4 weighted points and beats it by 51.4 on net price, so a net price weight of 71.4 ÷ 51.4 ≈ 1.39 flips #1. Read the break point under <b>Smallest single weight change</b>.',pause:true,setup:sim=>{preset(sim,'old');BioLab.setValues(sim,{game:false,show:true});}}
 ],
 lab:{bio:'<p><b>Question:</b> Can you make the cheapest good college #1?</p><ol><li>Turn on <b>Show the ranking</b> and press <b>Old-style formula</b>. Record a trial.</li><li>Change the weights by feel until Cindervale (net price $17k, graduation rate 84%) is #1. Record your weights.</li><li>Compare with a classmate’s weights.</li></ol><p>Write two sentences: did you both get the same #1? Whose formula is “right”?</p>',
  honors:'<p><b>Question:</b> Does the way you rescale change the ranking?</p><ol><li>For each preset formula, record the top 3 using points.</li><li>Switch to z-scores and record the top 3 again.</li></ol><p>Where do the two methods disagree? Explain why using the mean and standard deviation of one metric.</p>',
  ap:'<p><b>Question:</b> Which weight is the ranking most sensitive to?</p><ol><li>From the old-style formula, read <b>Smallest single weight change</b>.</li><li>For three different weights, compute the break point by hand: Δw = (gap in Σ w·p) ÷ (difference in that metric’s points).</li><li>Check with the sliders.</li></ol><p><b>CER:</b> Claim whether this ranking is robust, with evidence from your break points.</p>'},
 terms:[
  {t:'Weighted average',d:'Multiply each value by its weight, add, and divide by the total weight: Σ w·x / Σ w.'},
  {t:'Proxy',d:'A number that stands in for something hard to measure, like SAT scores standing in for “quality.” A proxy can be gamed without changing the real thing.'},
  {t:'Min-max scaling',d:'Rescale a metric so the lowest value becomes 0 and the highest 100: 100(x − min) / (max − min).',lvl:'honors'},
  {t:'z-score',d:'How many standard deviations a value is from the mean: z = (x − μ) / σ.',lvl:'honors'},
  {t:'Pell Grant',d:'A federal grant for students from lower-income families. How well Pell students graduate is a common measure of social mobility.',lvl:'honors'},
  {t:'Sensitivity',d:'How much an output changes when one input changes. Here: how far a weight must move to change #1.',lvl:'ap'}
 ],
 about:'<p><b>The colleges and numbers are made up.</b> Each metric is rescaled (points: best 100, worst 0; or z-scores with the population standard deviation), flipped for acceptance rate and net price, and combined as score = Σ w·p / Σ w. The preset weights are illustrative, not any real ranking’s weights.</p>'+
 '<p><b>What is real.</b> Cathy O’Neil’s <i>Weapons of Math Destruction</i> argues that models are opinions embedded in math. Its Chapter 3 tells how the U.S. News college ranking’s original formula left cost out. She also describes colleges chasing the formula: Iona College admitted in 2011 that it had faked data, which had moved it from 50th to 30th among regional colleges; TCU climbed from 113th to 76th in seven years after a $434 million fundraising campaign and building; and Baylor paid admitted students to retake the SAT. Since then, U.S. News has dropped acceptance rate from its formula and gives more weight to how well Pell Grant students graduate (social mobility); its 2026 edition uses 17 measures.</p>'+
 '<p><b>For your own search:</b> a ranking is one opinion about what matters. Pick the numbers that matter to you (net price, graduation rates for students like you, earnings in your field) and compare colleges on those. The U.S. Department of Education’s College Scorecard publishes many of them.</p>'
};
BioLab.register(SIM);
})();
