(function(){
'use strict';
const {clamp,txt,pill,rr,rng,randn,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Synthetic population of 400 adults, built from orthonormal vectors so the regression results are exact.
   P = parents' schooling, I = family income, B = books at home (standardized), U = a hidden factor (e.g. a family's love of reading).
   Assumed correlations (for illustration): r(P,I) = 0.5, r(B,P) = 0.5, r(B,I) = 0.4; U is unrelated to P and I and linked to B by 0.6*a3.
   ln(books) = 4.0 + 1.4*B (about 55 books at the middle). Literacy L (in standard deviations):
   L = t*(lnB - 4) + gP*P + 0.1*I + gU*U + noise, with gP and gU solved so that
   books-only slope = 0.274 SD per ln-unit and the slope after controlling for P and I = 0.116 (Sikora, Evans & Kelley 2019).
   t is the hidden causal effect of books (a Deep dive setting). */
const N=400,LN2=Math.LN2,RAW=0.274,ADJ=0.116,MU=4.0,SB=1.4,GI=0.1,CU=0.6;
const A2=0.15/Math.sqrt(0.75),A3=Math.sqrt(1-0.25-A2*A2);
const dot=(a,b)=>{let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;};
function basis(n,k,seed){const r=rng(seed),V=[];for(let j=0;j<k;j++){let v=[];for(let i=0;i<n;i++)v.push(randn(r));const m=v.reduce((a,b)=>a+b,0)/n;v=v.map(x=>x-m);
  V.forEach(u=>{const d=dot(v,u)/n;v=v.map((x,i)=>x-d*u[i]);});const s=Math.sqrt(dot(v,v)/n);V.push(v.map(x=>x/s));}return V;}
const [E1,E2,E3,E4,E5]=basis(N,5,4242);
const P=E1,I=E1.map((v,i)=>0.5*v+Math.sqrt(0.75)*E2[i]),BZ=E1.map((v,i)=>0.5*v+A2*E2[i]+A3*E3[i]),U=E3.map((v,i)=>CU*v+Math.sqrt(1-CU*CU)*E4[i]);
const LNB=BZ.map(b=>MU+SB*b);
const WC={};
function world(t){if(WC[t])return WC[t];const gU=(ADJ-t)*SB*A3/CU,gP=((RAW-t-(ADJ-t)*A3*A3)*SB*SB-0.56*GI)/0.7;
 const sys=LNB.map((b,i)=>t*(b-MU)+gP*P[i]+GI*I[i]+gU*U[i]),v=dot(sys,sys)/N,sd=Math.sqrt(Math.max(0,1-v));
 return WC[t]={gP,gU,sd,L:sys.map((s,i)=>s+sd*E5[i])};}
/* OLS slope on the first regressor, with the others as controls (normal equations, small k). */
function ols(y,X){const k=X.length,n=y.length,mx=X.map(c=>c.reduce((a,b)=>a+b,0)/n),my=y.reduce((a,b)=>a+b,0)/n;
 const A=[],bv=[];for(let i=0;i<k;i++){A.push([]);for(let j=0;j<k;j++){let s=0;for(let q=0;q<n;q++)s+=(X[i][q]-mx[i])*(X[j][q]-mx[j]);A[i].push(s);}let s=0;for(let q=0;q<n;q++)s+=(X[i][q]-mx[i])*(y[q]-my);bv.push(s);}
 for(let c=0;c<k;c++){let p=c;for(let r=c+1;r<k;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;[A[c],A[p]]=[A[p],A[c]];[bv[c],bv[p]]=[bv[p],bv[c]];
  for(let r=0;r<k;r++){if(r===c)continue;const f=A[r][c]/A[c][c];for(let j=c;j<k;j++)A[r][j]-=f*A[c][j];bv[r]-=f*bv[c];}}
 return bv[0]/A[0][0];}
const truth=sim=>atLeast('ap')?+sim.p.truth:ADJ;
const ctrlOf=sim=>sim.p.ctrl;
const CC={};
function coef(sim,c){const t=truth(sim);c=c||ctrlOf(sim);const key=t+'|'+c;if(CC[key]!==undefined)return CC[key];const L=world(t).L;
 return CC[key]=c==='none'?ols(L,[LNB]):c==='ped'?ols(L,[LNB,P]):ols(L,[LNB,P,I]);}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const rev=sim=>!!(sim.p.show||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g));
const curShown=sim=>ctrlOf(sim)==='none'||rev(sim);
const ANS=100*ADJ/RAW;
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2));
const SPAN=Math.log(151/18);   /* from about 18 books (11-25) to about 151 (101-200), the study's category midpoints */
const pctl=c=>100*Phi(c*SPAN);
const f2=v=>fmtNum(v,2),f3=v=>fmtNum(v,3);
const view=sim=>atLeast('honors')?sim.p.view:'data';
/* Randomized giveaway: n people, half chosen at random get enough books to double their library. Reading scores start N(0,1). */
const TC={};
function trial(sim){if(!sim.st.seed)return null;const n=+sim.p.n,t=truth(sim),key=sim.st.seed+'|'+n+'|'+t;if(TC[key])return TC[key];
 const r=rng(sim.st.seed*7919+n),T=[],C=[];for(let i=0;i<n;i++){const y=randn(r);(r()<0.5?T:C).push(y);}
 const eff=t*LN2,Tm=T.map(v=>v+eff),m=a=>a.reduce((x,y)=>x+y,0)/a.length,vr=(a,mm)=>a.reduce((x,y)=>x+(y-mm)**2,0)/(a.length-1);
 const mt=m(Tm),mc=m(C),se=Math.sqrt(vr(Tm,mt)/Tm.length+vr(C,mc)/C.length);return TC[key]={T:Tm,C,mt,mc,est:mt-mc,se};}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function wrap(ctx,s,x,y,w,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='';
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,y,o);y+=lh;line=wd;}else line=t;});if(line){txt(ctx,line,x,y,o);y+=lh;}return y;}
/* Evidence ladder rows: effect sizes in standard deviations of a reading or literacy test. */
const LADDER=[
 {rung:'Randomized trial',c:'s3',rows:[['Allington 2010',0.14,'12 books a summer, 3 summers','0.14'],['Kim 2006',0.08,'8 books, one summer','0.08']]},
 {rung:'Comparison group',c:'s2',rows:[['Colorado 2025',0.125,'Imagination Library, kindergarten','0.125']]},
 {rung:'Correlation',c:'s4',rows:[['Sikora 2019, raw',RAW*LN2,'adults, per doubling',(RAW*LN2).toFixed(3)],['Sikora, adjusted',ADJ*LN2,'adults, after controls',(ADJ*LN2).toFixed(3)]]},
 {rung:'Anecdote',c:'s1',rows:[['One story',null,'cannot separate causes']]}];

const cmpBooks=(sim,g,m)=>SIM.gut.compareCore(sim,g,m);
const SIM={
 id:'bookshome',hash:'bookshome',apUnit:21,order:3,tab:'Books on the shelf',kind:'Simulation',
 card:'Guess how much of the books-and-reading link survives once you account for family background, then see what experiments say.',
 title:'Books on the shelf',
 lede:{bio:'People who grew up with lots of books read better as adults. But homes full of books often have parents with more schooling and more money too. How much of the link is the books themselves?',
  honors:'Controlling for a variable means comparing people who match on it. When the books coefficient shrinks after you control for parents’ schooling and income, the part that disappeared was family background showing up through the books.',
  ap:'Even after controls, a hidden confounder can bias a regression. Only random assignment breaks every arrow into “books,” which is why randomized trials answer the causal question that correlations cannot.'},
 scale:'Each dot is one adult (synthetic). Books at home at age 16 run on a ratio scale: each grid step is 10 times as many books. Reading skill is in standard deviations (SD) from the average.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your analysis',
 controls:[
  {id:'guess',label:'Your gut: what percent of the books-reading link is left after accounting for family background?',type:'range',min:0,max:100,step:5,def:70,unit:'%'},
  {id:'ctrl',label:'Account for',type:'seg',def:'none',noGut:true,options:[{v:'none',l:'Books only'},{v:'ped',l:'+ parents’ schooling'},{v:'both',l:'+ schooling and income'}],help:'Controlling compares people with the same parents’ schooling (and income), so those can’t explain the books link.'},
  {id:'show',label:'Show the answer now',type:'toggle',def:false,help:'Normally the adjusted numbers appear once you lock in your gut.'},
  {id:'view',label:'View',type:'seg',lvl:'honors',def:'data',noGut:true,options:[{v:'data',l:'Data and causes'},{v:'ladder',l:'Evidence ladder'},{v:'trial',l:'Run an experiment',lvl:'ap'}]},
  {id:'truth',label:'Hidden true effect of books (unknowable from the data alone)',type:'seg',lvl:'ap',def:0.116,noGut:true,onChange:clearGut,options:[{v:0,l:'None'},{v:0.05,l:'Small'},{v:0.116,l:'All that’s left after controls'}],help:'An assumption you choose. The rest of the model is rebuilt so the observed links stay the same.'},
  {id:'n',label:'People in the experiment',type:'seg',lvl:'ap',def:2000,noGut:true,options:[{v:500,l:'500'},{v:2000,l:'2,000'},{v:10000,l:'10,000'}]}
 ],
 actions:[{id:'run',label:'Run a randomized giveaway',lvl:'ap',run(sim){sim.st.seed=(sim.st.seed||0)+1;BioLab.setValues(sim,{view:'trial'});}}],
 init(){return {seed:0};},step(){},
 metrics:[
  {id:'raw',label:'Books-only link, per doubling of books',unit:'SD',d:3,min:0,max:0.3,get:sim=>coef(sim,'none')*LN2},
  {id:'cur',label:'Link with your controls, per doubling',unit:'SD',d:3,min:0,max:0.3,get:sim=>curShown(sim)?coef(sim)*LN2:null},
  {id:'left',label:'Share of the link left',unit:'%',d:1,min:0,max:100,get:sim=>curShown(sim)?100*coef(sim)/coef(sim,'none'):null},
  {id:'off',label:'Your gut is off by',unit:'points',d:1,min:0,max:100,get:sim=>{const G=GS(sim);return G&&G.g?Math.abs(G.g.guess-ANS):null;}},
  {id:'pct',label:'18 → 151 books: a 50th-percentile reader moves to',unit:'th pct.',d:0,lvl:'honors',min:50,max:100,get:sim=>curShown(sim)?pctl(coef(sim)):null},
  {id:'rbp',label:'Correlation of books with parents’ schooling (assumed)',unit:'',d:2,lvl:'honors',min:-1,max:1,get:()=>dot(BZ,P)/N},
  {id:'tru',label:'Hidden true effect, per doubling',unit:'SD',d:3,lvl:'ap',min:0,max:0.3,get:sim=>truth(sim)*LN2},
  {id:'rct',label:'Experiment’s estimate, per doubling',unit:'SD',d:3,lvl:'ap',min:null,max:null,get:sim=>{const T=trial(sim);return T?T.est:null;}},
  {id:'rse',label:'Experiment’s standard error',unit:'SD',d:3,lvl:'ap',min:0,max:null,get:sim=>{const T=trial(sim);return T?T.se:null;}}
 ],
 graphs:[{id:'coef',label:'Books coefficient by controls',custom:true}],defaultGraph:'coef',
 plot(sim,ctx,box){const cats=['Books only','+ schooling','+ schooling, income'],keys=['none','ped','both'],T=trial(sim),show=rev(sim);
  if(atLeast('ap')){cats.push('Experiment');}
  const ax=axes(ctx,box,{xmin:0,xmax:cats.length,ymin:0,ymax:0.25,xcats:cats,yl:'SD per doubling of books'});
  keys.forEach((k,i)=>{const v=coef(sim,k)*LN2,hid=k!=='none'&&!show,x0=ax.X(i+.2),x1=ax.X(i+.8);
   if(hid){ctx.strokeStyle=PAL['g-axis'];ctx.setLineDash([5,4]);ctx.strokeRect(x0,ax.Y(0.12),x1-x0,ax.Y(0)-ax.Y(0.12));ctx.setLineDash([]);txt(ctx,'?',(x0+x1)/2,ax.Y(0.06),{s:18,w:700,c:PAL['g-axis'],a:'center',b:'middle'});return;}
   ctx.fillStyle=k===sim.p.ctrl?PAL['rj']:PAL['s2'];ctx.fillRect(x0,ax.Y(v),x1-x0,ax.Y(0)-ax.Y(v));txt(ctx,v.toFixed(3),(x0+x1)/2,ax.Y(v)-5,{s:12,w:700,c:PAL['fg'],a:'center'});});
  if(atLeast('ap')){const i=3,x0=ax.X(i+.2),x1=ax.X(i+.8);if(T){const v=T.est;ctx.fillStyle=PAL['s3'];ctx.fillRect(x0,ax.Y(Math.max(0,v)),x1-x0,Math.abs(ax.Y(0)-ax.Y(Math.max(0,v))));
    ctx.strokeStyle=PAL['fg'];ctx.lineWidth=2;const xm=(x0+x1)/2;ctx.beginPath();ctx.moveTo(xm,ax.Y(clamp(v-1.96*T.se,0,0.25)));ctx.lineTo(xm,ax.Y(clamp(v+1.96*T.se,0,0.25)));ctx.stroke();
    txt(ctx,v.toFixed(3),x1+4,ax.Y(clamp(v,0,0.25))-5,{s:12,w:700,c:PAL['fg']});}
   else txt(ctx,'not run',(x0+x1)/2,ax.Y(0.03),{s:12,c:PAL['g-axis'],a:'center'});
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([6,4]);const yt=ax.Y(truth(sim)*LN2);ctx.beginPath();ctx.moveTo(box.L,yt);ctx.lineTo(box.L+box.W,yt);ctx.stroke();ctx.setLineDash([]);
   legend(ctx,box.L+box.W-170,box.T+10,[{label:'Hidden truth',color:PAL['s4'],dash:true}]);}},
 infoPanel(sim){const hides='<p><b>What this number hides</b></p><ul>'+
  '<li><b>What the survey counted.</b> The study asked how many books were in your home at age 16. A home with 10 books and a grandparent who told stories every night, or a family that walked to the public library every Saturday, counts as a 10-book home. Borrowed library books and stories told aloud don’t show up.</li>'+
  '<li><b>One slope for everyone.</b> 0.116 SD per log step averages 162,955 adults in 31 societies. On a log scale, the same 45 extra books goes with 0.145 SD after controls in a home going from 18 to 63 books, but only about 0.01 SD in a home going from 500 to 545.</li>'+
  '<li><b>Who gains most.</b> Kim’s 0.08 SD overall hides 0.22 SD for Black students and 0.13 SD for students who owned fewer than 50 children’s books. Allington’s 0.14 overall hides 0.21 for students eligible for free lunch. A small average can include a bigger effect where books are scarce.</li></ul>';
  if(!atLeast('honors'))return '<p><b>What would prove that books cause better reading?</b> Correlations show books and reading go together. To learn whether giving books <i>causes</i> better reading, researchers give books to a randomly chosen group and compare. See <b>About this model</b> for the studies.</p>'+hides;
  return hides+'<p><b>The evidence ladder</b> (stronger designs higher up)</p><ul>'+
  '<li><b>Randomized trials.</b> Allington and colleagues (2010): about 1,300 1st and 2nd graders in 17 high-poverty Florida schools, 12 self-chosen books each summer for 3 summers. Effect 0.14 SD (50th to 56th percentile); 0.21 SD for students eligible for free lunch. Kim (2006): 552 4th graders in 10 schools, 8 books mailed in summer. Effect 0.08 SD overall (p = .059, just short of the usual cutoff), 0.22 SD for Black students, 0.13 SD for students who owned fewer than 50 children’s books. Reach Out and Read (High and colleagues, 2000): 205 families randomized at clinic visits; older toddlers had larger vocabularies, and the gain ran through more shared reading.</li>'+
  '<li><b>Comparison groups (not random).</b> Colorado’s 2025 evaluation of the Imagination Library: enrolled children scored 0.125 SD higher on an early-literacy test at kindergarten entry than non-participants in the same schools. Families chose to enroll, so some of the gap could be the families.</li>'+
  '<li><b>Correlations.</b> Evans and colleagues (2010), 27 countries: a 500-book home went with about 3.2 more years of schooling than a bookless one, after controls. Sikora and colleagues (2019), 31 societies: 0.274 SD per natural-log step in books, 0.116 after controls.</li>'+
  '<li><b>Anecdotes.</b> One family’s story can inspire, but it can’t separate books from everything else in that home.</li></ul>';},
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);const v=view(sim),R=rev(sim);
  if(v==='ladder')return drawLadder(sim,ctx,k);
  if(v==='trial')return drawTrial(sim,ctx,k);
  drawDag(sim,ctx,k,R);drawScatter(sim,ctx,k,R);},
 narrate(sim){const v=view(sim),raw=coef(sim,'none'),c=coef(sim),R=rev(sim);
  if(v==='ladder')return `The higher the rung, the better the design answers “does giving books <i>cause</i> better reading?” <b>The randomized trials find real but modest gains: 0.08 to 0.14 SD overall, more for children with few books.</b>`;
  if(v==='trial'){const T=trial(sim);if(!T)return 'Press <b>Run a randomized giveaway</b>. A coin flip decides who gets enough books to double their library, so the two groups match on everything else, seen or unseen.';
   return `The giveaway estimates ${f3(T.est)} SD per doubling (give or take ${f3(1.96*T.se)}). The hidden truth is ${f3(truth(sim)*LN2)}. <b>The observational links stay at ${f3(raw*LN2)} and ${f3(ADJ*LN2)} whatever the truth is; only the experiment tracks it.</b>`;}
  if(sim.p.ctrl==='none')return `Each doubling of books goes with ${f3(raw*LN2)} SD more reading skill. <b>But the blue dots (parents with more schooling) sit up and to the right:</b> family background could be behind both the books and the reading.`;
  if(!R)return `Now you are comparing people whose parents match on ${sim.p.ctrl==='ped'?'schooling':'schooling and income'}. <b>Lock in your gut</b> to see how much of the link survives.`;
  return `After controlling for ${sim.p.ctrl==='ped'?'parents’ schooling':'parents’ schooling and income'}, each doubling goes with ${f3(c*LN2)} SD: <b>${Math.round(100*c/raw)}% of the books-only link is left.</b> The rest was family background showing up through the books.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'People who grew up with more books read better as adults. Once you compare only people whose parents had the same schooling and income, how much of that link do you think is left? Drag the slider here, then lock it in.',
   honors:'Set the slider here: what percent of the books coefficient survives controls for family background? Then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-ANS),guess:sim.p.guess,label:`${sim.p.guess}% left`};},
  solve(sim){sim.p.ctrl='both';return {v:0,guess:ANS,label:`${ANS.toFixed(0)}% left`};},
  how:{bio:'The math fits a line through books and reading, then fits it again comparing only people with the same parents’ schooling and income. The books slope shrinks from 0.274 to 0.116: 0.116 ÷ 0.274 ≈ 42%.',
   ap:'Multiple regression: literacy = b₀ + b₁·ln(books) + b₂·parents’ schooling + b₃·income. b₁ is the books slope holding the others fixed. Here b₁ falls from 0.274 (books alone) to 0.116 SD per natural-log unit; 0.116 ÷ 0.274 = 0.423.'},
  compare(sim,g,m){return cmpBooks(sim,g,m)+' <b>What this number hides:</b> the survey counted only books in the home at age 16, so a home with 10 books and a grandparent who told stories every night counts as a 10-book home.';},
  compareCore(sim,g,m){const raw=RAW*SPAN,adj=ADJ*SPAN,you=raw*g.guess/100,p=z=>{const n=Math.round(100*Phi(z)),t=n%100;return n+((t>10&&t<14)?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th');};
   const real=`Compare a home with about 18 books and one with about 151. Before controls the reading gap is ${f2(raw)} SD: a 50th-percentile reader would move to about the ${p(raw)}. After controls it is <b>${f2(adj)} SD, about the ${p(adj)} percentile</b>.`;
   if(g.v<=5)return `Your gut was right on: about ${Math.round(ANS)}% of the link is left. ${real} Family background explains more than half, but not all.`;
   return `You guessed ${g.guess}%; the study found <b>about ${Math.round(ANS)}%</b>. ${real} Your guess would mean ${f2(you)} SD (about the ${p(you)} percentile). ${g.guess>ANS?'Family background explains more of the link than you guessed.':'More of the link survives the controls than you guessed.'}`;},
  again(sim){sim.p.guess=70;sim.p.ctrl='none';sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Kids from homes with more books read better. Which explanation can the correlation alone NOT rule out?',choices:['Parents who read a lot both buy books and read with their kids','Books are made of paper','Reading tests measure reading'],correct:0,explain:'That is a confounder: something that causes both more books and better reading. In the study, controlling for parents’ education and other background shrank the books link from 0.274 to 0.116 SD per log step.'},
  {lvl:'bio',instant:true,q:'Your club wants to know whether giving books causes better reading. What is the strongest test?',choices:['Survey readers about how many books they had','Flip a coin for each child: heads gets books, tails doesn’t, then compare reading scores','Ask teachers which kids read most'],correct:1,explain:'Random assignment makes the two groups alike in everything else, seen or unseen, so any difference comes from the books. Allington’s 3-summer trial found a 0.14 SD gain this way.'},
  {lvl:'honors',instant:true,q:'Adding parents’ schooling and income shrinks the books coefficient from 0.274 to 0.116. What does that tell you?',choices:['Books have no effect at all','Part of the books-only link was family background showing up through the books','The data were measured wrong'],correct:1,explain:'The coefficient that disappeared (0.158, or 58%) was explained by the controls. The 42% that remains might be books, or something the controls missed.'},
  {lvl:'honors',instant:true,q:'A randomized trial finds an effect of 0.14 SD. Where does a 50th-percentile reader land?',choices:['About the 51st percentile','About the 56th percentile','About the 64th percentile'],correct:1,explain:'The share of a normal curve below z = 0.14 is 0.556, so about the 56th percentile. That matches the What Works Clearinghouse summary of Allington’s study.'},
  {lvl:'honors',instant:true,q:'Kim’s summer-books trial reports 0.08 SD for all students. What can that single average hide?',choices:['Nothing: every student gained 0.08 SD','Bigger gains for some groups: 0.22 SD for Black students and 0.13 SD for students who owned fewer than 50 children’s books','That the books made reading worse'],correct:1,explain:'An average effect blends everyone together. In Kim (2006), students with few books at home gained more (0.13 SD), and Black students gained 0.22 SD. Allington found the same pattern: 0.14 overall, 0.21 for students eligible for free lunch.'},
  {lvl:'ap',instant:true,q:'In the experiment view, set the hidden truth to None. What happens to the books-only and after-controls coefficients?',choices:['They drop to zero too','They stay at 0.190 and 0.080 per doubling: observational data can’t tell the worlds apart','They become negative'],correct:1,explain:'The model rebuilds the hidden factor so the observed links stay the same in every world. Only the randomized experiment changes, landing near 0. That is why a correlation, even with controls, can’t settle a causal question.'},
  {lvl:'ap',instant:true,q:'Kim (2006) estimated 0.08 SD with a standard error of 0.04. What is a rough 95% interval, and what does it say?',choices:['0.04 to 0.12: clearly positive','About 0.00 to 0.16: probably helpful, but zero can’t quite be ruled out','−0.08 to 0.24: no information'],correct:1,explain:'0.08 ± 1.96 × 0.04 = 0.08 ± 0.078, about 0.002 to 0.158. The p-value was .059, just above .05. Bigger trials shrink the standard error, which is why Allington’s 3-year study of about 1,300 children is stronger evidence.'}
 ],
 tour:[
  {title:'One dot, one adult',text:'Each dot is a synthetic adult. Left to right: how many books were in their home at age 16 (each grid step is 10 times more). Bottom to top: their reading skill as an adult, in standard deviations from the average.',focus:[340,0,460,450],pause:true,setup:sim=>BioLab.setValues(sim,{ctrl:'none',view:'data',truth:0.116})},
  {title:'The books-only line',text:'The red line is the books-only fit. Each doubling of books goes with 0.190 SD more reading skill. In the 31-country study, that is 0.274 SD per natural-log step.',focus:[340,0,460,450],pause:true},
  {title:'Who has the books?',text:'Blue dots are people whose parents had more schooling; amber, less. Blue sits up and to the right. The diagram shows why: parents’ schooling and income can cause both more books and better reading. Those are confounders.',focus:[0,0,340,450],pause:true},
  {title:'Hold parents’ schooling fixed',text:'Now compare only people whose parents had the same schooling. The books link shrinks, because part of it was parents’ schooling showing up through the books.',pause:true,setup:sim=>BioLab.setValues(sim,{ctrl:'ped'})},
  {title:'Add income',text:'Hold income fixed too. The books slope falls to 0.080 SD per doubling, 42% of where it started. In the real study, the controls also included the person’s own education, job, age, sex and reading habits.',pause:true,setup:sim=>BioLab.setValues(sim,{ctrl:'both'})},
  {lvl:'honors',title:'The evidence ladder',text:'Correlations sit low on the ladder. Randomized trials sit at the top, because a coin flip, not the family, decides who gets books. The trials found 0.08 to 0.14 SD.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'ladder'})},
  {lvl:'ap',title:'Run the experiment',text:'A coin flip gives a random half of 10,000 people enough books to double their library. The experiment lands at 0.080 SD, right on the hidden truth. Change the truth and the experiment follows it; the observational numbers can’t move.',pause:true,setup:sim=>{sim.st.seed=2;BioLab.setValues(sim,{view:'trial',n:10000,truth:0.116});}}
 ],
 onTourExit(sim){BioLab.setValues(sim,{view:'data',ctrl:'none'});},
 lab:{bio:'<p><b>Question:</b> How much of the books link is family background?</p><ol><li>Record a trial with <b>Books only</b>.</li><li>Record one with <b>+ parents’ schooling</b>, then <b>+ schooling and income</b>.</li><li>Compare the link per doubling each time.</li></ol><p>Write two sentences: should your club’s book drive come with anything besides books? Use the numbers.</p>',
  honors:'<p><b>Question:</b> What kind of study could prove that books cause better reading?</p><ol><li>Open the <b>Evidence ladder</b>. For each rung, write what the design can and cannot rule out.</li><li>Convert each effect size to a percentile for a 50th-percentile reader.</li></ol><p>Explain why the randomized trials’ numbers are smaller than the books-only correlation.</p>',
  ap:'<p><b>Question:</b> Can a regression with controls recover a causal effect?</p><ol><li>For each hidden truth, record the books-only and adjusted coefficients.</li><li>Run the giveaway three times at each size: 500, 2,000 and 10,000. Record the estimate and standard error.</li></ol><p><b>CER:</b> Claim what controls can and cannot do, with evidence from your table and reasoning about confounders and random assignment.</p>'},
 terms:[
  {t:'Correlation',d:'Two measurements that tend to rise and fall together. It does not by itself show that one causes the other.'},
  {t:'Confounder',d:'A third factor that causes both things you are comparing, like parents’ schooling causing both more books and better reading.'},
  {t:'Randomized experiment',d:'A study where chance decides who gets the treatment, so the groups match on everything else.'},
  {t:'Controlling for a variable',d:'Comparing people who match on that variable, so it cannot explain the link you are studying.',lvl:'honors'},
  {t:'Effect size (SD)',d:'A difference measured in standard deviations. 0.14 SD moves a 50th-percentile student to about the 56th.',lvl:'honors'},
  {t:'Causal diagram',d:'A picture with arrows from causes to effects, used to spot confounders.',lvl:'honors'},
  {t:'Omitted variable bias',d:'When a confounder left out of a regression makes a coefficient too large or too small.',lvl:'ap'},
  {t:'Standard error',d:'How far an estimate typically lands from the truth because of which people happened to be in the sample.',lvl:'ap'}
 ],
 about:'<p><b>The correlations.</b> M.D.R. Evans, Jonathan Kelley, Joanna Sikora and Donald Treiman, “Family scholarly culture and educational success: Books and schooling in 27 nations,” <i>Research in Social Stratification and Mobility</i>, 2010 (doi:10.1016/j.rssm.2010.01.002; <a href="https://openresearch-repository.anu.edu.au/handle/1885/19165" target="_blank" rel="noopener">ANU repository</a>): over 70,000 people; after controls for parents’ education, occupation and class, a home with 500 books went with about 3.2 more years of schooling than a home with none, 2.4 years in the United States (<a href="https://www.unr.edu/nevada-today/news/2010/books-in-the-home-as-important-as-parents-education-level" target="_blank" rel="noopener">University of Nevada, Reno, 2010</a>). Joanna Sikora, M.D.R. Evans and Jonathan Kelley, “Scholarly culture: How books in adolescence enhance adult literacy, numeracy and technology skills in 31 societies,” <i>Social Science Research</i> 77, 2019, pp. 1–15 (doi:10.1016/j.ssresearch.2018.10.003): PIAAC data from 2011–2015, 162,955 adults. Books at 16 were asked in categories with midpoints 5, 18, 63, 151, 351 and 650, used as a natural log. Literacy rose 0.274 SD per log step before controls and 0.116 after controls for parents’ education, the person’s own education and job, age, sex and reading at home. About 80 books went with average literacy, and gains leveled off around 350. The authors call their estimate possibly optimistic, since cross-sectional data can hide other confounders.</p>'+
  '<p><b>The experiments and evaluations.</b> James Kim, “Effects of a Voluntary Summer Reading Intervention on Reading Achievement: Results From a Randomized Field Trial,” <i>Educational Evaluation and Policy Analysis</i>, 2006 (<a href="https://scholar.harvard.edu/sites/scholar.harvard.edu/files/jameskim/files/2006-eepa-kim-voluntarysummerreading10schoolrct_website.pdf" target="_blank" rel="noopener">PDF</a>). Richard Allington and colleagues, “Addressing Summer Reading Setback Among Economically Disadvantaged Elementary Students,” <i>Reading Psychology</i>, 2010, summarized by the What Works Clearinghouse (<a href="https://ies.ed.gov/ncee/wwc/Docs/QuickReview/sumread_092910.pdf" target="_blank" rel="noopener">WWC quick review</a>), which rated it a well-implemented randomized trial. Pamela High and colleagues, “Literacy promotion in primary care pediatrics: Can we make a difference?” <i>Pediatrics</i> 105(4), 2000 (<a href="https://reachoutandread.org/article/literacy-promotion-in-primary-care-pediatrics-can-we-make-a-difference/" target="_blank" rel="noopener">summary</a>). The UK’s Foundations guidebook rates Reach Out and Read 2+, “preliminary evidence,” based on a non-randomized 2001 study (<a href="https://foundations.org.uk/guidebook/reach-out-and-read" target="_blank" rel="noopener">Foundations</a>). Imagination Library of Colorado: Colorado Evaluation and Action Lab, University of Denver, reported by the Colorado Department of Early Childhood on September 2, 2025 (<a href="https://cdec.colorado.gov/press-release/new-study-shows-imagination-library-of-colorado-boosts-kindergarten-readiness" target="_blank" rel="noopener">CDEC</a>). A 2019 Regional Educational Laboratory Southeast response listed the Imagination Library research it found; none was a randomized trial, and one quasi-experimental study of a different book program found no significant effects (<a href="https://ies.ed.gov/ncee/edLabs/regions/southeast/aar/l_07-2019.asp" target="_blank" rel="noopener">REL Southeast</a>).</p>'+
  '<p><b>What is synthetic.</b> The 400 adults are made up. Their links are assumptions for illustration: books correlate 0.5 with parents’ schooling and 0.4 with income; schooling and income correlate 0.5; the natural log of books has mean 4.0 (about 55 books) and SD 1.4. The model is built so the books slope is exactly 0.274 alone and 0.116 after controls, matching the study, though the real study used more controls than these two. The hidden true effect and the hidden factor are also assumptions: in real life no one knows the truth, which is the point. The experiment draws reading scores from a normal curve and adds the hidden effect for the half that gets books. Percentiles assume a normal curve. This is a simplified model.</p>'+
  '<p><b>Why this matters at RJ.</b> If you grew up with full shelves and adults who read to you, that is a gift worth thanking someone for. Being men and women for others can start small: a book drive, or an hour reading with a younger student. This tool never asks about your own home.</p>'
};
function drawDag(sim,ctx,k,R){const c=sim.p.ctrl,ap=atLeast('ap'),raw=coef(sim,'none'),cur=coef(sim);
 const fx=k,fs=13*fx;
 txt(ctx,'Possible causes',16,26*Math.min(k,1.3),{s:13*k,w:700});
 const N2={P:{x:90,y:100,l:['Parents’','schooling']},I:{x:250,y:100,l:['Family','income']},B:{x:90,y:300,l:['Books','at home']},L:{x:250,y:300,l:['Reading','skill']},U:{x:170,y:405,l:['Hidden','factor']}};
 const held=id=>(id==='P'&&c!=='none')||(id==='I'&&c==='both');
 const bw=Math.max(118,64*fx+40),bh=2*fs+16;
 const arrow=(a,b,col,w,dash,al)=>{const A=N2[a],B=N2[b],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d;
  const tA=Math.min(bw/2/Math.abs(ux||1e-9),bh/2/Math.abs(uy||1e-9))+4,tB=Math.min(bw/2/Math.abs(ux||1e-9),bh/2/Math.abs(uy||1e-9))+8;
  const x0=A.x+ux*tA,y0=A.y+uy*tA,x1=B.x-ux*tB,y1=B.y-uy*tB;ctx.globalAlpha=al||1;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);
  ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();ctx.setLineDash([]);const h=10;ctx.beginPath();ctx.moveTo(x1+ux*6,y1+uy*6);ctx.lineTo(x1-ux*h-uy*h*0.6,y1-uy*h+ux*h*0.6);ctx.lineTo(x1-ux*h+uy*h*0.6,y1-uy*h-ux*h*0.6);ctx.closePath();ctx.fill();ctx.globalAlpha=1;};
 ['P','I'].forEach(s=>['B','L'].forEach(t=>arrow(s,t,PAL['cv-soft'],2,null,held(s)?0.25:0.9)));
 if(ap){arrow('U','B',PAL['s5'],2,[6,5],0.9);arrow('U','L',PAL['s5'],2,[6,5],0.9);}
 const bl=c==='none'?raw:cur,show=c==='none'||R;arrow('B','L',PAL['rj'],2+10*Math.max(0,bl),null,1);
 pill(ctx,show?'+'+(bl*LN2).toFixed(2)+' SD per doubling':'? per doubling',170,300-bh/2-16*Math.min(k,1.3),PAL['rj'],'#fff',12*Math.min(k,1.3));
 Object.entries(N2).forEach(([id,n])=>{if(id==='U'&&!ap)return;const h=held(id);rr(ctx,n.x-bw/2,n.y-bh/2,bw,bh,10);ctx.fillStyle=id==='U'?PAL['card2']:PAL['card'];ctx.fill();
  ctx.strokeStyle=h?PAL['s3']:(id==='U'?PAL['s5']:PAL['cv-ink']);ctx.lineWidth=h?3:1.5;ctx.setLineDash(id==='U'?[6,5]:[]);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,n.l[0],n.x,n.y-2,{s:fs,w:700,a:'center'});txt(ctx,n.l[1],n.x,n.y+fs,{s:fs,w:700,a:'center'});
  if(h)txt(ctx,'held fixed',n.x,n.y-bh/2-6,{s:12*k,w:700,c:PAL['s3'],a:'center'});});
 if(!ap&&k<1.35)wrap(ctx,'Gray arrows: background can cause both books and reading. Red: the link you are measuring.',16,385,300,17,{s:12*k,c:PAL['cv-soft']});}
function drawScatter(sim,ctx,k,R){const L0=380,Rt=784,T=48,B=376,xmin=0,xmax=7.6,c=sim.p.ctrl,W=world(truth(sim)),raw=coef(sim,'none'),cur=coef(sim);
 const X=v=>L0+(clamp(v,xmin,xmax)-xmin)/(xmax-xmin)*(Rt-L0),Y=v=>B-(clamp(v,-3.2,3.2)+3.2)/6.4*(B-T);
 txt(ctx,k<1.35?'Each dot is one adult (synthetic)':'Reading skill (SD) vs. books',L0,26*Math.min(k,1.3),{s:13*k,w:700});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[[0,'1'],[Math.log(10),'10'],[Math.log(100),'100'],[Math.log(1000),'1,000']].forEach(([v,l])=>{ctx.beginPath();ctx.moveTo(X(v),T);ctx.lineTo(X(v),B);ctx.stroke();txt(ctx,l,X(v),B+17*k,{s:12*k,c:PAL['cv-soft'],a:'center'});});
 [-2,0,2].forEach(v=>{ctx.beginPath();ctx.moveTo(L0,Y(v));ctx.lineTo(Rt,Y(v));ctx.stroke();txt(ctx,v===0?'0':(v>0?'+':'−')+Math.abs(v),L0-6,Y(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});});
 ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(L0,T,Rt-L0,B-T);
 txt(ctx,'Books at home at age 16',(L0+Rt)/2,B+36*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
 if(k<1.35){ctx.save();ctx.translate(L0-34,(T+B)/2);ctx.rotate(-Math.PI/2);txt(ctx,'Adult reading skill (SD)',0,0,{s:12*k,c:PAL['cv-soft'],a:'center'});ctx.restore();}
 for(let i=0;i<N;i++){const p=P[i];ctx.fillStyle=p>0.5?PAL['s2']:p<-0.5?PAL['s4']:PAL['cv-soft'];ctx.globalAlpha=p>0.5||p<-0.5?0.8:0.4;ctx.beginPath();ctx.arc(X(LNB[i]),Y(W.L[i]),3.6,0,7);ctx.fill();}ctx.globalAlpha=1;
 const line=(b,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash(dash||[]);ctx.beginPath();ctx.moveTo(X(0.8),Y(b*(0.8-MU)));ctx.lineTo(X(7.2),Y(b*(7.2-MU)));ctx.stroke();ctx.setLineDash([]);};
 line(raw,PAL['rj']);if(c!=='none'&&R)line(cur,PAL['s3'],[9,6]);
 if(k<1.35){const items=[{label:'Books only',color:PAL['rj']}];if(c!=='none'&&R)items.push({label:'After controls',color:PAL['s3'],dash:true});legend(ctx,L0+12,T+16,items);
  txt(ctx,'Blue: parents with more schooling. Amber: less.',L0+12,T+40,{s:12*k,c:PAL['cv-soft']});}}
function drawLadder(sim,ctx,k){const kk=k,lh=Math.max(34,22*kk),x0=270,x1=772,X=v=>x0+v/0.3*(x1-x0);let y=34*Math.min(k,1.3);
 txt(ctx,'Evidence ladder: effect on reading, in SD',16,y,{s:13*k,w:700});y+=14*kk;
 const top=y;ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[0,0.1,0.2,0.3].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),top);ctx.lineTo(X(v),430-16*kk);ctx.stroke();txt(ctx,v.toFixed(1),X(v),444-2,{s:12*k,c:PAL['cv-soft'],a:'center'});});
 LADDER.forEach(g=>{const col=PAL[g.c];y+=lh*0.8;txt(ctx,g.rung,16,y,{s:13*kk,w:700,c:col});y+=4;
  g.rows.forEach(r=>{y+=lh*0.82;txt(ctx,r[0],28,y,{s:12*kk,c:PAL['cv-ink']});
   if(r[1]===null){txt(ctx,'No number: '+r[2],x0+4,y,{s:12*kk,c:PAL['cv-soft']});return;}
   ctx.fillStyle=col;ctx.globalAlpha=.85;ctx.fillRect(x0,y-10*kk,X(r[1])-x0,12*kk);ctx.globalAlpha=1;
   txt(ctx,r[3]+(k<1.35?'  '+r[2]:''),X(r[1])+6,y,{s:12*kk,c:PAL['cv-ink']});});});}
function drawTrial(sim,ctx,k){const T=trial(sim),X=v=>60+(clamp(v,-3,3)+3)/6*680,kk=k;
 txt(ctx,'A randomized book giveaway',16,26*Math.min(k,1.3),{s:13*k,w:700});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;[-2,-1,0,1,2].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),60);ctx.lineTo(X(v),330);ctx.stroke();txt(ctx,v===0?'0':(v>0?'+':'−')+Math.abs(v),X(v),348,{s:12*k,c:PAL['cv-soft'],a:'center'});});
 txt(ctx,'Reading score (SD)',400,368+6*kk,{s:12*k,c:PAL['cv-soft'],a:'center'});
 if(!T){txt(ctx,'Press “Run a randomized giveaway.”',400,200,{s:15*kk,w:700,a:'center',c:PAL['cv-soft']});return;}
 const strip=(arr,yc,col,lab,m)=>{const r=rng(11);ctx.fillStyle=col;ctx.globalAlpha=.45;const n=Math.min(arr.length,220);for(let i=0;i<n;i++){ctx.beginPath();ctx.arc(X(arr[i]),yc+(r()-0.5)*70,3,0,7);ctx.fill();}ctx.globalAlpha=1;
  ctx.strokeStyle=col;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(X(m),yc-44);ctx.lineTo(X(m),yc+44);ctx.stroke();txt(ctx,lab,66,yc-48,{s:12*kk,w:700,c:col});};
 strip(T.T,128,PAL['s3'],`Got books, random half (${T.T.length.toLocaleString('en-US')})`,T.mt);strip(T.C,262,PAL['s2'],`No books (${T.C.length.toLocaleString('en-US')})`,T.mc);
 pill(ctx,`Difference: ${T.est>=0?'+':'−'}${Math.abs(T.est).toFixed(3)} SD (± ${(1.96*T.se).toFixed(3)})`,400,402,PAL['rj'],'#fff',13*Math.min(k,1.4));
 if(k<1.35)txt(ctx,`Hidden truth: ${(truth(sim)*LN2).toFixed(3)} SD per doubling`,400,436,{s:12*k,c:PAL['cv-soft'],a:'center'});}
BioLab.register(SIM);
})();
