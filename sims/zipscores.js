(function(){
'use strict';
const {clamp,txt,pill,rng,randn,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* 150 synthetic districts built so the verified SEDA correlations hold exactly (Reardon 2019, RSF 5(2)):
   r(SES, grade-3 average) = 0.68, r(SES, growth grades 3-8) = 0.32, r(grade-3 average, growth) = -0.13,
   SD of grade-3 averages = 0.98 grade levels, SD of growth = 0.135 grade levels per year.
   Single measures (income, parents' schooling, wealth) are modeled as noisier versions of the composite:
   x = rho*z + sqrt(1-rho^2)*u, so r(x, outcome) = rho * r(z, outcome). The rho values are assumptions. */
const N=150,SDL=0.98,SDG=0.135,R1=0.68,RG=0.32,RLG=-0.13;
const S1=Math.sqrt(1-R1*R1),B2=(RLG-R1*RG)/S1,C2=Math.sqrt(1-RG*RG-B2*B2);
const MEAS={ses:{rho:1,l:'Family resources index (SES)',s:'family resources'},income:{rho:0.92,l:'Median family income only',s:'income'},educ:{rho:0.88,l:'Parents with a college degree only',s:'parents’ schooling'},wealth:{rho:0.80,l:'Family wealth only',s:'wealth'}};
const dot=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;};
function basis(n,k,seed){const r=rng(seed),V=[];for(let j=0;j<k;j++){let v=[];for(let i=0;i<n;i++)v.push(randn(r));const m=v.reduce((a,b)=>a+b,0)/n;v=v.map(x=>x-m);
  V.forEach(u=>{const d=dot(v,u)/n;v=v.map((x,i)=>x-d*u[i]);});const s=Math.sqrt(dot(v,v)/n);V.push(v.map(x=>x/s));}return V;}
const [Z,E,W,U1,U2,U3]=basis(N,6,20231);
const LEVEL=Z.map((z,i)=>SDL*(R1*z+S1*E[i]));
const GROW=Z.map((z,i)=>1+SDG*(RG*z+B2*E[i]+C2*W[i]));
const UM={ses:null,income:U1,educ:U2,wealth:U3};
const XC={};
function xs(m){if(XC[m])return XC[m];const rho=MEAS[m].rho,u=UM[m];return XC[m]=u?Z.map((z,i)=>rho*z+Math.sqrt(1-rho*rho)*u[i]):Z.slice();}
function stats(x,y){const n=x.length,mx=x.reduce((a,b)=>a+b,0)/n,my=y.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0,syy=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sxx+=(x[i]-mx)**2;syy+=(y[i]-my)**2;}
  const b=sxy/sxx,r=sxy/Math.sqrt(sxx*syy);return {b,a:my-b*mx,r,mx,my,sx:Math.sqrt(sxx/n),sy:Math.sqrt(syy/n)};}
/* Students inside districts (Deep dive). Assumptions for illustration: a student's own family resources vary around
   the district's by SD 1.5, a student's score rises 0.25 grade levels per unit of their own resources within the district,
   and everything else about a student moves their score with SD 2.2 grade levels. */
const SW=25,SA=1.5,BW=0.25,SE=2.2;
const STU=(()=>{const r=rng(777),a=[],e=[];for(let i=0;i<N*SW;i++){a.push(randn(r));e.push(randn(r));}return {a,e};})();
const SC={};
function students(m){if(SC[m])return SC[m];const x=xs(m),X=[],Y=[];for(let j=0;j<N;j++)for(let s=0;s<SW;s++){const k=j*SW+s;X.push(x[j]+SA*STU.a[k]);Y.push(LEVEL[j]+BW*SA*STU.a[k]+SE*STU.e[k]);}return SC[m]={X,Y,r:stats(X,Y).r};}
const meas=sim=>atLeast('honors')?sim.p.measure:'ses';
const isG=sim=>sim.p.outcome==='growth';
const ys=sim=>isG(sim)?GROW:LEVEL;
const fit=sim=>stats(xs(meas(sim)),ys(sim));
const stuOn=sim=>atLeast('ap')&&sim.p.students&&!isG(sim);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The data stay hidden until the gut is locked and the student has worked out r² ("Your turn"). */
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const rev=sim=>!!(sim.p.show||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g&&!pending(sim)));
const rR=sim=>Math.round(fit(sim).r*100)/100;          /* r as the prompt states it, to 2 decimals */
const r2P=sim=>100*rR(sim)*rR(sim);
const f2=v=>fmtNum(v,2),sg=(v,d)=>(v>=0?'+':'−')+Math.abs(v).toFixed(d===undefined?2:d);
/* real-terms gap for a 1-step (1 SD) difference in the measure */
const perStep=(sim,r)=>r*(isG(sim)?SDG:SDL);
const stepWords=(sim,r)=>isG(sim)?`${f2(perStep(sim,r))} grade levels more per year (${f2(perStep(sim,r)*5)} over grades 3 to 8)`:`${f2(perStep(sim,r))} grade levels higher`;
const ASK={level:{bio:'How tightly do family resources (income, parents’ schooling, jobs) and a district’s average 3rd-grade test score go together? Drag the slider here: 0 means no link, 1 means a perfect line. The amber dots show what your number looks like. Then lock it in.',
  honors:'Set the slider here to your gut value of r between family resources and district average 3rd-grade scores, then lock it in.'},
 growth:{bio:'How tightly do family resources (income, parents’ schooling, jobs) and a district’s growth go together? Growth is how many grade levels students gain per year from 3rd to 8th grade. Drag the slider here: 0 means no link, 1 means a perfect line. The amber dots show what your number looks like. Then lock it in.',
  honors:'Set the slider here to your gut value of r between family resources and growth (grade levels gained per year, grades 3 to 8), then lock it in.'}};
const pickLv=t=>atLeast('honors')?t.honors:t.bio;
const LBL=o=>`Your gut: the correlation between family resources and ${o==='growth'?'growth, grades 3 to 8':'average 3rd-grade scores'} (0 = no link, 1 = a perfect line)`;
const curSim=()=>BioLab.sims&&BioLab.sims.zipscores;
/* Keep the gut prompt and the guess label in step with the outcome toggle. */
function syncGut(sim){if(!sim||!sim.ui)return;const o=sim.p.outcome,w=sim.ui.ctlW&&sim.ui.ctlW.guess,l=w&&w.querySelector('label'),t=LBL(o);if(l&&l.textContent!==t)l.textContent=t;
 const dc=sim.ui.donecard,x=dc&&!dc.hidden&&dc.querySelector('.dc-x');if(x&&sim.guide&&sim.guide.phase==='gut'){const a=pickLv(ASK[o]);if(x.innerHTML!==a)x.innerHTML=a;}}
function onOutcome(sim){clearGut(sim);syncGut(sim);if(sim.mode!=='guided'&&BioLab.gutRender)BioLab.gutRender(sim);}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function defaultSel(){const x=xs('ses'),f=stats(x,LEVEL);let best=0,bv=-9;for(let i=0;i<N;i++){const res=LEVEL[i]-(f.a+f.b*x[i]);if(Math.abs(x[i])<0.8&&-Math.abs(res-0.6)>bv){bv=-Math.abs(res-0.6);best=i;}}return best;}
const SEL0=defaultSel();
function resid(sim,i){const f=fit(sim),x=xs(meas(sim));return ys(sim)[i]-(f.a+f.b*x[i]);}
const thr=sim=>isG(sim)?0.1:0.5;
/* SAT/ACT: Chetty, Deming & Friedman, Appendix Table 3, Panel C. Share of ALL children in each parent-income group
   (test takers and non-takers) in each score band. Groups with equal widths are averaged; the top 1% weights 99-99.9 by 0.9 and the top 0.1% by 0.1. */
const SAT_BINS=[['0–20',1,[0.0,0.1,0.4],75.9],['20–40',1,[0.1,0.2,0.7],66.4],['40–60',1,[0.1,0.4,1.4],56.3],['60–70',0,[0.3,0.8,2.4],45.6],['70–80',0,[0.4,1.3,3.6],36.4],['80–90',1,[0.8,2.2,5.6],25.8],['90–95',1,[1.7,3.8,8.3],16.9],
 ['95–96',0,[2.5,5.0,10.5],13.2],['96–97',0,[2.8,5.6,11.3],12.2],['97–98',0,[3.4,6.4,12.1],11.1],['98–99',0,[3.9,7.3,13.1],10.3],['99–99.9',0,[4.6,8.6,14.3],10.3],['top 0.1',0,[6.8,11.6,14.7],12.1]];
const s13=b=>b[2][0]+b[2][1]+b[2][2],tk=b=>100-b[3];
const SATG=(()=>{const B=SAT_BINS,g=(l,ix,w)=>({l,hi:ix.reduce((s,i,j)=>s+w[j]*s13(B[i]),0),took:ix.reduce((s,i,j)=>s+w[j]*tk(B[i]),0)});
 return [g('0–20',[0],[1]),g('20–40',[1],[1]),g('40–60',[2],[1]),g('60–80',[3,4],[.5,.5]),g('80–90',[5],[1]),g('90–95',[6],[1]),g('95–99',[7,8,9,10],[.25,.25,.25,.25]),g('Top 1%',[11,12],[.9,.1])];})();
/* Federal Reserve, Survey of Consumer Finances 2022, Tables 1 and 2: medians by percentile of income, thousands of 2022 dollars. */
const SCF=[['Bottom 20%',21.6,14.0],['20–40',44.8,71.0],['40–60',71.2,159.3],['60–80',115.7,307.2],['80–90',189.2,747.0],['Top 10%',378.3,2556.2]];

const SIM={
 id:'zipscores',hash:'zipscores',apUnit:21,order:1,tab:'Zip code and test scores',kind:'Simulation',
 card:'Guess how tightly family resources and district test scores go together, then see what growth tells you that averages hide.',
 title:'Zip code and test scores',
 skills:{bio:'Correlation r and r²: the share of the differences a line accounts for · Statistics (Chapter 3), AP Statistics (Unit 2)',honors:'Least-squares lines, r² and residuals · Statistics (Chapter 3), AP Statistics (Unit 2)',ap:'Regression, residuals, and averages vs. growth as two different outcomes · AP Statistics (Unit 2)'},
 lede:{bio:'A website ranks school districts by their average test scores. Before you trust that ranking, find out how much of a district’s average comes from the families who live there, and how much from what happens in its schools.',
  honors:'Researchers measure family resources with a socioeconomic status (SES) index and fit a least-squares line. The correlation r tells you how tightly the dots hug it, r² how much of the spread the line accounts for, and residuals show which districts beat their prediction.',
  ap:'The least-squares slope is b = r·s_y/s_x. Across about 11,000 U.S. districts, SES correlates 0.68 with 3rd-grade averages but only 0.32 with growth from grade 3 to 8. District averages also hide students: a link between averages is not the same link among individuals.'},
 scale:'Each dot is one school district. The dots are synthetic, built to match published national correlations; no real district or student is shown.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your study',
 controls:[
  {id:'guess',label:LBL('level'),type:'range',min:0,max:1,step:0.05,def:0.3,unit:''},
  {id:'outcome',label:'What you measure',type:'seg',def:'level',noGut:true,onChange:onOutcome,options:[{v:'level',l:'Average 3rd-grade score'},{v:'growth',l:'Growth, grades 3 to 8'}],help:'The average shows where students are by 3rd grade. Growth shows how fast they learn from 3rd to 8th grade.'},
  {id:'show',label:'Show the data now',type:'toggle',def:false,help:'Normally the data appear once you lock in your gut.'},
  {id:'measure',label:'Measure of family resources',type:'select',lvl:'honors',def:'ses',noGut:true,onChange:clearGut,options:[{v:'ses',l:'SES index (6 measures combined)'},{v:'income',l:'Median family income only'},{v:'educ',l:'Parents with a college degree only'},{v:'wealth',l:'Family wealth only'}],help:'The SES index combines income, parents’ education, poverty, unemployment, food-aid eligibility and single-parent households. The single measures here are illustrative assumptions.'},
  {id:'students',label:'Show students inside four districts',type:'toggle',lvl:'ap',def:false,noGut:true,help:'Synthetic students, with spreads chosen for illustration.'}
 ],
 actions:[{id:'next',label:'Pick another district',lvl:'honors',run(sim){sim.st.sel=(sim.st.sel*37+11)%N;BioLab.refresh(sim);}},
  {id:'beat',label:'Find the district that most beats the line',lvl:'honors',run(sim){let b=0,bv=-1e9;for(let i=0;i<N;i++){const v=resid(sim,i);if(v>bv){bv=v;b=i;}}sim.st.sel=b;BioLab.refresh(sim);}}],
 init(){return {sel:SEL0};},step(){},
 metrics:[
  {id:'r',label:'Correlation r',unit:'',d:2,min:-1,max:1,get:sim=>rev(sim)?fit(sim).r:null},
  {id:'r2',label:'r²: share of the spread the line accounts for',unit:'%',d:1,min:0,max:100,get:sim=>rev(sim)?100*fit(sim).r**2:null},
  {id:'gap',label:'Line’s gap for one step (1 SD) richer (growth: over 5 years)',unit:'grade levels',d:2,min:0,max:null,get:sim=>rev(sim)?perStep(sim,fit(sim).r)*(isG(sim)?5:1):null},
  {id:'off',label:'Your gut is off by',unit:'in r',d:2,min:0,max:1,get:sim=>{const G=GS(sim);return G&&G.g?Math.abs(G.g.guess-fit(sim).r):null;}},
  {id:'sel',label:'Selected district',text:true,lvl:'honors',get:sim=>{const i=sim.st.sel,f=fit(sim),x=xs(meas(sim))[i],y=ys(sim)[i],p=f.a+f.b*x,g=isG(sim);
    return `District ${i+1}: ${MEAS[meas(sim)].s} ${sg(x)} SD; ${g?'learns '+y.toFixed(2)+' grade levels a year, line predicts '+p.toFixed(2):'scores '+sg(y)+' grade levels, line predicts '+sg(p)}.`;}},
  {id:'resid',label:'Selected district: actual − predicted',unit:'grade levels',d:2,lvl:'honors',min:null,max:null,get:sim=>resid(sim,sim.st.sel)},
  {id:'nbeat',label:'Districts far above the line (by 0.5 grade levels; growth: 0.1 a year)',unit:'of 150',d:0,lvl:'honors',min:0,max:150,get:sim=>{let c=0;for(let i=0;i<N;i++)if(resid(sim,i)>thr(sim))c++;return c;}},
  {id:'slope',label:'Slope b',unit:'grade levels per SD',d:3,lvl:'ap',min:null,max:null,get:sim=>rev(sim)?fit(sim).b:null},
  {id:'icpt',label:'Intercept a',unit:'',d:2,lvl:'ap',min:null,max:null,get:sim=>rev(sim)?fit(sim).a:null},
  {id:'rlg',label:'Correlation of average with growth',unit:'',d:2,lvl:'ap',min:-1,max:1,get:()=>stats(LEVEL,GROW).r},
  {id:'rstu',label:'Student-level r (synthetic students)',unit:'',d:2,lvl:'ap',min:-1,max:1,get:sim=>stuOn(sim)?students(meas(sim)).r:null}
 ],
 graphs:[{id:'sat',label:'SAT/ACT 1300+ by parents’ income',custom:true},{id:'wealth',label:'Income gaps vs. wealth gaps',lvl:'honors',custom:true}],defaultGraph:'sat',
 plot(sim,ctx,box,id){
  if(id==='wealth'){const base=SCF[0],vals=SCF.map(s=>[s[1]/base[1],s[2]/base[2]]);
   const ax=axes(ctx,box,{xmin:0,xmax:SCF.length,ymin:0,ymax:200,xcats:SCF.map(s=>s[0]),yl:'Times the bottom 20% median'});
   vals.forEach((v,i)=>{const w=(ax.X(1)-ax.X(0))*0.32;[[v[0],PAL['s2'],-1],[v[1],PAL['s4'],0]].forEach(([y,c,o])=>{const x0=ax.X(i+.5)+o*w;ctx.fillStyle=c;ctx.fillRect(x0,ax.Y(y),w,ax.Y(0)-ax.Y(y));
     txt(ctx,y<10?y.toFixed(1)+'×':Math.round(y)+'×',x0+w/2,ax.Y(y)-5,{s:12,w:700,c:PAL['fg'],a:'center'});});});
   legend(ctx,box.L+12,box.T+10,[{label:'Median income',color:PAL['s2']},{label:'Median net worth (wealth)',color:PAL['s4']}]);return;}
  const ax=axes(ctx,box,{xmin:0,xmax:SATG.length,ymin:0,ymax:100,xcats:SATG.map(g=>g.l),xl:'Parents’ income percentile',yl:'% of all children'});
  SATG.forEach((g,i)=>{const w=(ax.X(1)-ax.X(0))*0.32;[[g.took,PAL['s2'],-1,0],[g.hi,PAL['rj'],0,1]].forEach(([y,c,o,d])=>{const x0=ax.X(i+.5)+o*w;ctx.fillStyle=c;ctx.fillRect(x0,ax.Y(y),w,ax.Y(0)-ax.Y(y));
    if(d)txt(ctx,y.toFixed(1),x0+w/2,ax.Y(y)-5,{s:12,w:700,c:PAL['fg'],a:'center'});});});
  legend(ctx,box.L+12,box.T+10,[{label:'Took the SAT or ACT',color:PAL['s2']},{label:'Scored 1300+ (ACT 29+)',color:PAL['rj']}]);},
 infoPanel(sim){return '<p><b>What this number hides</b></p><ul>'+
  '<li><b>Students inside a district.</b> One average stands for thousands of students. A district averaging +0.8 can still have about 36% of its students below the U.S. average.</li>'+
  '<li><b>Children who never tested.</b> In the SAT/ACT graph, 75.9% of children from the bottom 20% of parent income never took the test, so the 0.5% who scored 1300+ mixes “scored lower” with “never tested.”</li>'+
  '<li><b>Any one person.</b> r = 0.68 describes 11,315 districts. It says nothing certain about one family or one student.</li></ul><p style="font-size:13px">More in <b>About this model</b>.</p>';},
 draw(sim,ctx,vdt,k){syncGut(sim);const m=meas(sim),x=xs(m),g=isG(sim),y=ys(sim),f=fit(sim),R=rev(sim),G=GS(sim),st=stuOn(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=84,Rt=780,T=52,B=380,xr=st?5:3,ylo=st?-6:(g?0.6:-3),yhi=st?6:(g?1.4:3);
  const X=v=>L+(clamp(v,-xr,xr)+xr)/(2*xr)*(Rt-L),Y=v=>B-(clamp(v,ylo,yhi)-ylo)/(yhi-ylo)*(B-T);
  /* grid and axes */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const xt=st?[-4,-2,0,2,4]:[-2,-1,0,1,2],yt=g?[0.6,0.8,1,1.2,1.4]:(st?[-6,-3,0,3,6]:[-3,-2,-1,0,1,2,3]);
  xt.forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),T);ctx.lineTo(X(v),B);ctx.stroke();txt(ctx,v===0?'0':sg(v,0),X(v),B+17*k,{s:12*k,c:PAL['cv-soft'],a:'center'});});
  yt.forEach(v=>{ctx.beginPath();ctx.moveTo(L,Y(v));ctx.lineTo(Rt,Y(v));ctx.stroke();txt(ctx,g?v.toFixed(1):(v===0?'0':sg(v,0)),L-8,Y(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(L,T,Rt-L,B-T);
  ctx.font='400 '+(12*k)+'px '+FONT;const xl=`${MEAS[m].l}: SDs from the average district`,xl2=`${MEAS[m].s}, SDs from average`;
  txt(ctx,ctx.measureText(xl).width<Rt-L?xl:xl2,(L+Rt)/2,B+36*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.save();ctx.translate(20,(T+B)/2);ctx.rotate(-Math.PI/2);txt(ctx,g?'Grade levels learned per year':'3rd-grade average (grade levels vs. U.S.)',0,0,{s:12*k,c:PAL['cv-soft'],a:'center'});ctx.restore();
  /* title row */
  txt(ctx,R?(st?'Districts (blue) and synthetic students (purple)':'Each dot is one district (synthetic)'):'What your guess would look like',L,30*Math.min(k,1.3),{s:13*k,w:700});
  if(!R){/* the guess cloud: same districts, rebuilt at the guessed r */const gr=clamp(sim.p.guess,0,1),gs=Math.sqrt(1-gr*gr),sd=g?SDG:SDL,mu=g?1:0;
   ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.7;for(let i=0;i<N;i++){ctx.beginPath();ctx.arc(X(Z[i]),Y(mu+sd*(gr*Z[i]+gs*E[i])),4.5,0,7);ctx.fill();}ctx.globalAlpha=1;
   pill(ctx,'r = '+gr.toFixed(2)+' (your guess)',Rt-96*Math.min(k,1.4),T+20*Math.min(k,1.3),PAL['s4'],'#fff',13*Math.min(k,1.4));
   txt(ctx,G&&G.g?'Made-up dots. Work out r² to see the data.':'Made-up dots. Lock in your gut to see the data.',Rt-8,B-10,{s:12*k,c:PAL['cv-soft'],a:'right'});return;}
  /* students */
  if(st){const S=students(m),pick=[-1.5,-0.5,0.5,1.5].map(t=>{let b=0;for(let i=1;i<N;i++)if(Math.abs(x[i]-t)<Math.abs(x[b]-t))b=i;return b;});
   ctx.fillStyle=PAL['s5'];ctx.globalAlpha=.55;pick.forEach(j=>{for(let s=0;s<SW;s++){const kk=j*SW+s;if(Math.abs(S.X[kk])>xr||Math.abs(S.Y[kk])>yhi)continue;ctx.beginPath();ctx.arc(X(S.X[kk]),Y(S.Y[kk]),3.2,0,7);ctx.fill();}});ctx.globalAlpha=1;}
  /* districts */
  ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.8;for(let i=0;i<N;i++){ctx.beginPath();ctx.arc(X(x[i]),Y(y[i]),4.5,0,7);ctx.fill();}ctx.globalAlpha=1;
  /* gut line and fitted line */
  const line=(b,a,c,w,dash)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(X(-xr),Y(a-b*xr));ctx.lineTo(X(xr),Y(a+b*xr));ctx.stroke();ctx.setLineDash([]);};
  if(G&&G.g){const sd=g?SDG:SDL;line(G.g.guess*sd,g?1:0,PAL['s4'],2.5,[8,6]);}
  line(f.b,f.a,PAL['rj'],3);
  /* selected district and its residual (Closer look) */
  if(atLeast('honors')&&!st){const i=sim.st.sel,px=X(x[i]),py=Y(y[i]),pp=Y(f.a+f.b*x[i]),res=y[i]-(f.a+f.b*x[i]);
   ctx.strokeStyle=PAL['s3'];ctx.lineWidth=2.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(px,pp);ctx.lineTo(px,py);ctx.stroke();ctx.setLineDash([]);
   ctx.beginPath();ctx.arc(px,py,9,0,7);ctx.stroke();
   const lab=`District ${i+1}: ${Math.abs(res).toFixed(2)}${g?' a year':''} ${res>=0?'above':'below'} the line`,right=px<(L+Rt)/2;
   pill(ctx,lab,clamp(px+(right?1:-1)*(150*Math.min(k,1.4)),L+150*Math.min(k,1.4),Rt-150*Math.min(k,1.4)),clamp(py+(res>=0?-22:22)*Math.min(k,1.3),T+16,B-16),PAL['s3'],'#fff',12*Math.min(k,1.4));}
  /* r pill and legend */
  {const rl=(G&&G.m)?`r = ${f.r.toFixed(2)}, r² = ${(f.r*f.r).toFixed(2)}`:'r = '+f.r.toFixed(2),ps=13*Math.min(k,1.4);ctx.font='700 '+ps+'px '+FONT;const w=ctx.measureText(rl).width+ps*1.1;pill(ctx,rl,Rt-w/2-8,T+20*Math.min(k,1.3),PAL['rj'],'#fff',ps);
   if(G&&G.m&&!(sim.tour&&sim.tour.on))txt(ctx,`The line accounts for about ${Math.round(100*f.r*f.r)}% of the differences`,Rt-8,T+46*Math.min(k,1.3),{s:12*k,w:700,c:PAL['rj'],a:'right'});}
  if(k<1.35){const items=[{label:'Least-squares line',color:PAL['rj']}];if(G&&G.g)items.push({label:'Your gut',color:PAL['s4'],dash:true});legend(ctx,L+12,B-14,items);}},
 onClick(sim,cx,cy){if(!atLeast('honors')||!rev(sim)||stuOn(sim))return;const m=meas(sim),x=xs(m),y=ys(sim),g=isG(sim);const L=84,Rt=780,T=52,B=380,ylo=g?0.6:-3,yhi=g?1.4:3;
  let b=0,bd=1e9;for(let i=0;i<N;i++){const px=L+(clamp(x[i],-3,3)+3)/6*(Rt-L),py=B-(clamp(y[i],ylo,yhi)-ylo)/(yhi-ylo)*(B-T),d=Math.hypot(px-cx,py-cy);if(d<bd){bd=d;b=i;}}
  if(bd<30){sim.st.sel=b;BioLab.refresh(sim);}},
 narrate(sim){const f=fit(sim),g=isG(sim),m=meas(sim);
  if(!rev(sim))return `These amber dots are made up: they show what r = ${f2(sim.p.guess)} would look like. <b>${sim.gutS&&sim.gutS.g?'Work out r²':'Lock in your gut'}</b> to see how tightly ${g?'growth':'average scores'} and family resources really go together.`;
  if(stuOn(sim)){const s=students(m);return `District averages line up at r = ${f2(f.r)}, but students inside each district spread far more widely. Across all the synthetic students, r = ${f2(s.r)}. <b>A district’s average says little about any one student in it.</b>`;}
  if(g)return `Growth is a different story: r = ${f2(f.r)}. A district one step richer learns about ${stepWords(sim,f.r)}. <b>Many districts with fewer resources grow faster than richer ones.</b>`;
  const res=resid(sim,sim.st.sel),sel=atLeast('honors')?` District ${sim.st.sel+1} scores ${Math.abs(res).toFixed(2)} grade levels ${res>=0?'above':'below'} what the line predicts from its ${MEAS[m].s}.`:'';
  return `Richer districts start ahead: r = ${f2(f.r)}, and the line climbs ${f2(f.b)} grade levels for each step of ${MEAS[m].s}. <b>That accounts for about ${Math.round(100*f.r*f.r)}% of the differences in 3rd-grade averages</b>; the rest is everything else.${sel}`;},
 gut:{better:'lower',controls:['guess'],
  get ask(){const z=curSim();return ASK[z?z.p.outcome:'level'];},
  lock(sim){const r=fit(sim).r;return {v:Math.abs(sim.p.guess-r),guess:sim.p.guess,label:`r = ${f2(sim.p.guess)}`};},
  solve(sim){const r=fit(sim).r;return {v:0,guess:r,r,label:`r = ${f2(r)}`};},
  how:{bio:'The math computes the correlation r. For each district it multiplies how far it is from average in family resources by how far it is from average in scores (both in standard deviations), then averages those products. A perfect rising line gives 1; no pattern gives 0.',
   ap:'r = mean(z_x · z_y), using standardized values. The least-squares line through the means has slope b = r·s_y/s_x, so with x in SD units, each step in x moves the prediction r·s_y.'},
  hint:{bio:'Lock in your gut answer. Then you will use the real r to work out how much of the spread the line accounts for.'},
  calc:{unit:'%',d:1,tol:0.6,
   prompt(sim){const g=isG(sim),r=rR(sim);return `The data’s correlation between ${MEAS[meas(sim)].s} and ${g?'growth (grades 3 to 8)':'average 3rd-grade scores'} is <b>r = ${r.toFixed(2)}</b>. Square r to find the share of the differences between districts that the line accounts for. What percent is that?`;},
   answer:r2P,
   hint:'Multiply r by itself, then multiply by 100 to get a percent.',
   steps(sim){const r=rR(sim),q=r*r,P=r2P(sim);return [`r² = ${r.toFixed(2)} × ${r.toFixed(2)} = ${q.toFixed(4)}.`,`As a percent: ${q.toFixed(4)} × 100 = <b>${P.toFixed(2)}%</b>, about ${Math.round(P)}% of the differences between districts’ ${isG(sim)?'growth':'averages'}.`,`The other ${100-Math.round(P)}% is everything the line leaves out: schools, communities, choices and chance.`];}},
  formula(sim){const r=rR(sim);return `r² = ${r.toFixed(2)}² = ${(r*r).toFixed(4)}, so the line accounts for about ${Math.round(r2P(sim))}% of the differences between districts`;},
  compare(sim,g,m){const r=m.r,g1=isG(sim),real=perStep(sim,r),off=Math.abs(g.guess-r);
   const realTxt=g1?`${f2(real)} grade levels more per year (${f2(real*5)} over grades 3 to 8)`:`${f2(real)} grade levels higher by 3rd grade`;
   return (off<=0.05?`Your gut was right on: r = ${f2(r)}, and you said ${f2(g.guess)}.`:`You guessed r = ${f2(g.guess)}; the data say <b>r = ${f2(r)}</b>, off by ${f2(off)}.`)+` In real terms, a district one step richer in ${MEAS[meas(sim)].s} averages <b>${realTxt}</b>.`;},
  again(sim){sim.p.outcome=sim.p.outcome==='level'?'growth':'level';sim.p.guess=0.3;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'In another state, the correlation between family resources and district average scores is r = 0.5. What percent of the differences between districts does the line account for?',answer:25,tol:0.5,unit:'%',d:0,hint:'Square r, then turn it into a percent.',explain:'0.5² = 0.25, so the line accounts for 25% of the differences. Half of a perfect r leaves three quarters of the spread to everything else.'},
  {lvl:'bio',instant:true,q:'District A’s 3rd graders average 1.2 grade levels above the U.S. average. District B’s average 0.3 below. What does that tell you most reliably?',choices:['District A has better schools','District A’s families probably have more resources; to judge the schools, check growth too','District B’s teachers are weaker'],correct:1,explain:'Across U.S. districts, 3rd-grade averages correlate 0.68 with family resources, but growth from 3rd to 8th grade correlates only 0.32. A high average mostly reflects differences already in place before school starts; growth is closer to what the school years add.'},
  {lvl:'bio',instant:true,q:'Switch from average scores to growth (how fast students learn from 3rd to 8th grade). What happens to the link with family resources?',choices:['It gets stronger','It gets much weaker','It stays the same'],correct:1,explain:'r drops from 0.68 to 0.32. One step richer means 0.67 grade levels higher by 3rd grade, but only 0.04 grade levels more learning per year after that: about 0.22 grade levels over five years.'},
  {lvl:'bio',instant:true,q:'Only 0.5% of children from the bottom 20% of parent income scored 1300+. But 75.9% of them never took the SAT or ACT. What does the 0.5% hide?',choices:['Nothing: it shows they scored low','Most of these children were never tested, so the 0.5% can’t tell you what they would have scored','It shows the test was too hard for them'],correct:1,explain:'The figure counts every child, and a child who never tested counts as not scoring 1300+. Among the 24.1% who did test, about 2.1% scored 1300+ (0.5 ÷ 24.1). The headline number blends “scored lower” with “never had the chance or reason to test.”'},
  {lvl:'honors',instant:true,q:'r = 0.68 between the SES index and district averages. What share of the differences between districts does the straight line account for?',choices:['68%','About 46%','About 32%'],correct:1,explain:'Square r: 0.68² = 0.4624, so about 46%. The other 54% comes from everything the line leaves out. r itself is not a percentage.'},
  {lvl:'honors',instant:true,q:'The line is ŷ = 0.666x (x in SDs of SES, ŷ in grade levels). A district at x = +1.0 scores +1.2. What is its residual?',choices:['+1.2','About +0.53: it beats its prediction','About −0.53: it falls short'],correct:1,explain:'Residual = actual − predicted = 1.2 − 0.666 = 0.534 grade levels. A positive residual means the district does better than its family resources alone would predict.'},
  {lvl:'honors',instant:true,q:'In this synthetic set, swap the SES index for median family income alone. r falls from 0.68 to 0.63. Why does a single measure usually give a weaker r?',choices:['Income doesn’t matter','One measure is a noisier stand-in for a family’s resources than six measures combined','The districts changed'],correct:1,explain:'A composite averages out quirks of any one measure (a high-income area with high costs, a college town with low incomes). Noise in x pulls r toward 0: here r = 0.92 × 0.68 = 0.63. The 0.92 is an assumption for illustration.'},
  {lvl:'ap',instant:true,q:'District averages correlate 0.68 with SES. Does that mean a single student’s family resources predict that student’s score that well?',choices:['Yes, the same r applies to students','No: averaging removes most of the variation between individuals, so the student-level link is weaker','No: the student-level link is stronger'],correct:1,explain:'This is the ecological fallacy. A meta-analysis (Sirin 2005) found a medium SES-achievement link for individual students but a high one for schools. In this tool’s synthetic students, r falls to about 0.28.'},
  {lvl:'ap',instant:true,q:'Across districts, 3rd-grade averages and growth correlate at r = −0.13. Will the district with the highest 3rd-grade average probably also have the fastest growth?',choices:['Yes, high scores and fast growth go together','No: knowing one tells you almost nothing about the other','Yes, but only for rich districts'],correct:1,explain:'r² = 0.017: the 3rd-grade average accounts for under 2% of the differences in growth. Where students start and how fast they learn are different measures of opportunity.'},
  {lvl:'ap',instant:true,q:'For growth, r = 0.32, s_y = 0.135 grade levels per year, and x is in SDs. How much more does a district one SD richer learn over grades 3 to 8 (five years)?',choices:['About 0.04 grade levels','About 0.22 grade levels','About 0.68 grade levels'],correct:1,explain:'b = r·s_y/s_x = 0.32 × 0.135 = 0.0432 grade levels per year. Over five years: 0.0432 × 5 = 0.216, about a fifth of a grade level. Compare that with the 0.67-grade-level gap in the averages.'}
 ],
 tour:[
  {title:'One dot, one district',text:'Each dot is a school district. Left to right: family resources, from poorer to richer (0 is the average district). Bottom to top: the district’s average 3rd-grade score, in grade levels above or below the U.S. average. These 150 districts are synthetic, built to match a national study of about 11,000 real ones.',focus:[0,0,800,450],pause:true,setup:sim=>{BioLab.setValues(sim,{outcome:'level',measure:'ses',students:false});}},
  {title:'The least-squares line',text:'The red line is the least-squares line: of all straight lines, it makes the squared vertical misses smallest. It climbs 0.67 grade levels for each step of family resources.',pause:true},
  {title:'r and r²',text:'The correlation is r = 0.68: a strong link. Square it and r² = 0.46, so the line accounts for about 46% of the differences between district averages. The rest is everything the line leaves out.',focus:[620,50,180,50],pause:true},
  {lvl:'honors',title:'Beating the line',text:'The green ring marks one district. The dashed segment is its residual: actual score minus the line’s prediction. A positive residual means the district does better than its families’ resources predict.',pause:true,setup:sim=>{sim.st.sel=SEL0;BioLab.refresh(sim);}},
  {title:'Now measure growth',text:'Switch to growth: grade levels learned per year from 3rd to 8th grade. The cloud flattens. r = 0.32, and one step richer means only 0.04 grade levels more per year. Where students start depends on family resources far more than how fast they learn.',pause:true,setup:sim=>BioLab.setValues(sim,{outcome:'growth'})},
  {lvl:'honors',title:'Your measure changes your answer',text:'Back to averages, but measure family resources by income alone. In this synthetic set r falls to 0.63, because one measure is a noisier stand-in than the six-part SES index. The 0.92 link between income and the index is an assumption.',pause:true,setup:sim=>BioLab.setValues(sim,{outcome:'level',measure:'income'})},
  {lvl:'ap',title:'Districts are not students',text:'Purple dots are synthetic students inside four districts. They spread far more widely than the district averages. Across all synthetic students, r is about 0.28. A strong link between averages does not mean a strong link for each person.',pause:true,setup:sim=>BioLab.setValues(sim,{outcome:'level',measure:'ses',students:true})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{students:false,measure:'ses',outcome:'level'});},
 lab:{bio:'<p><b>Question:</b> Do average scores and growth tell the same story?</p><ol><li>With <b>Average 3rd-grade score</b> selected, record a trial.</li><li>Switch to <b>Growth, grades 3 to 8</b>. Record another.</li><li>Compare r and “One step richer means” for the two.</li></ol><p>Write two sentences: which measure would you use to judge a school, and why?</p>',
  honors:'<p><b>Question:</b> How does the way you measure family resources change r?</p><ol><li>For each measure, record r with averages, then with growth.</li><li>Use <b>Find the district that most beats the line</b> for each outcome. Is it the same district?</li></ol><p>Explain why a composite index usually gives a stronger r than one measure, and why residuals matter for judging schools.</p>',
  ap:'<p><b>Question:</b> When is a correlation between averages misleading?</p><ol><li>Record r for districts, then turn on students and record the student-level r.</li><li>Check b = r·s_y/s_x against the slope readout for both outcomes.</li></ol><p><b>CER:</b> Claim what a district average can and cannot tell you about one student, with evidence from both r values and reasoning about what averaging removes.</p>'},
 terms:[
  {t:'Scatter plot',d:'A graph with one dot per case (here, per district), placed by two measurements.'},
  {t:'Correlation (r)',d:'How tightly two measurements move together along a line, from −1 to 1. 0 means no straight-line link.'},
  {t:'Socioeconomic status (SES)',d:'A measure of a family’s or community’s resources: income, education, jobs and similar factors.'},
  {t:'Growth (learning rate)',d:'How many grade levels students gain per year. 1.0 is the U.S. average pace.'},
  {t:'Least-squares line',d:'The straight line that makes the sum of squared vertical misses as small as possible.',lvl:'honors'},
  {t:'r²',d:'The share of the spread in y that the line accounts for.',lvl:'honors'},
  {t:'Residual',d:'Actual value minus the value the line predicts. Positive means better than predicted.',lvl:'honors'},
  {t:'Composite index',d:'A single score built from several measures, often more reliable than any one of them.',lvl:'honors'},
  {t:'Ecological fallacy',d:'Assuming a pattern among group averages holds just as strongly for the individuals in those groups.',lvl:'ap'}
 ],
 about:'<p><b>The data behind the dots.</b> Sean F. Reardon, “Educational Opportunity in Early and Middle Childhood: Using Full Population Administrative Data to Study Variation by Place and Age,” <i>RSF: The Russell Sage Foundation Journal of the Social Sciences</i> 5(2), 2019 (<a href="https://www.rsfjournal.org/content/5/2/40" target="_blank" rel="noopener">rsfjournal.org/content/5/2/40</a>), built from the Stanford Education Data Archive: 11,315 districts, state tests from 2008–09 through 2014–15. Its SES index is the first principal component of six measures from the 2006–2010 American Community Survey: median family income, adults with a bachelor’s degree, poverty, unemployment, SNAP eligibility and single-mother households. Reported: r(SES, 3rd-grade average) = 0.68; r(SES, growth from grade 3 to 8) = 0.32; r(3rd-grade average, growth) = −0.13; standard deviation of district 3rd-grade averages 0.98 grade levels; of growth 0.135 grade levels per year.</p>'+
  '<p><b>What is synthetic.</b> The 150 districts are made up, generated so those three correlations and two standard deviations hold exactly; their means (0 grade levels and 1.00 grade levels per year) are assumptions. Reardon fit a curve, not a straight line, so the line here is a simplification. The single measures (income, parents with a college degree, wealth) are assumptions for illustration: each is modeled as a noisier version of the SES index, linked to it at 0.92, 0.88 and 0.80. SEDA’s index does not include wealth. The students inside districts are also assumptions (their own resources spread with SD 1.5 around the district’s; scores rise 0.25 grade levels per unit within a district; other differences have SD 2.2 grade levels). Their lower r follows the pattern in Selcuk Sirin, “Socioeconomic Status and Academic Achievement: A Meta-Analytic Review of Research,” <i>Review of Educational Research</i> 75(3), 2005 (doi:10.3102/00346543075003417): a medium link for students, a high one for schools.</p>'+
  '<p><b>SAT/ACT graph.</b> Raj Chetty, David Deming and John Friedman, “Diversifying Society’s Leaders? The Determinants and Causal Effects of Admission to Highly Selective Private Colleges,” Opportunity Insights working paper, 2023 (NBER w31492; <i>Quarterly Journal of Economics</i>, 2026), Appendix Table 3, Panel C (<a href="https://opportunityinsights.org/paper/collegeadmissions/" target="_blank" rel="noopener">opportunityinsights.org/paper/collegeadmissions</a>). Children in the 2011, 2013 and 2015 SAT/ACT cohorts, linked to parents’ tax records. Bars are shares of <i>all</i> children in each income group, including those who did not test; scores of 1300 and up on the SAT or 29 and up on the ACT. Some groups here combine the paper’s narrower groups, and the table rounds each score band to 0.1%. The same paper reports that SAT/ACT scores strongly predict later success, which is why debates over requiring the tests weigh both findings.</p>'+
  '<p><b>Income vs. wealth graph.</b> Federal Reserve Board, “Changes in U.S. Family Finances from 2019 to 2022: Evidence from the Survey of Consumer Finances,” October 2023 (<a href="https://www.federalreserve.gov/publications/October-2023-Changes-in-US-Family-Finances-from-2019-to-2022.htm" target="_blank" rel="noopener">federalreserve.gov</a>), Tables 1 and 2. All families: median income $70,300 (income for 2021), median net worth $192,900. By income group: the bottom 20% has a median income of $21,600 and median net worth of $14,000; the top 10%, $378,300 and $2,556,200. That is 17.5 times the income but about 183 times the wealth: wealth builds up over generations, so its gaps are far wider than income gaps.</p>'+
  '<p><b>What the averages hide, in more detail.</b> In this tool’s synthetic students, scores inside one district spread with a standard deviation of about 2.2 grade levels, so a district averaging +0.8 still has about 36% of its students below the U.S. average and about 10% more than 2 grade levels below it (if the spread is normal). Real gaps hide inside averages too: Reardon reports that in 3rd grade, poor students average 1.5 grade levels below nonpoor students. Among SAT/ACT-takers from the bottom 20% of parent income, about 2.1% scored 1300+. The SES index counts income, degrees, poverty, jobs, food aid and single-parent households; it can’t see a grandparent who reads with a child every night, a parent working night shifts, or a family that moved twice in one school year.</p>'+
  '<p><b>Your data.</b> This tool never asks for your family’s income or your scores, and nothing you enter leaves your browser.</p>'
};
BioLab.register(SIM);
})();
