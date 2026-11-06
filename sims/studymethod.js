(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,atLeast,fmtNum,rng,randn}=BioLab.h;
/* ---- stats library (shared copy) ---- */
function lgam(x){const c=[0.99999999999980993,676.5203681218851,-1259.1392167224028,771.32342877765313,-176.61502916214059,12.507343278686905,-0.13857109526572012,9.9843695780195716e-6,1.5056327351493116e-7];
 if(x<0.5)return Math.log(Math.PI/Math.sin(Math.PI*x))-lgam(1-x);x-=1;let a=c[0];const t=x+7.5;for(let i=1;i<9;i++)a+=c[i]/(x+i);return 0.5*Math.log(2*Math.PI)+(x+0.5)*Math.log(t)-t+Math.log(a);}
function betacf(a,b,x){const FP=1e-300;let qab=a+b,qap=a+1,qam=a-1,c=1,d=1-qab*x/qap;if(Math.abs(d)<FP)d=FP;d=1/d;let h=d;
 for(let m=1;m<=300;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<FP)d=FP;c=1+aa/c;if(Math.abs(c)<FP)c=FP;d=1/d;h*=d*c;
  aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<FP)d=FP;c=1+aa/c;if(Math.abs(c)<FP)c=FP;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-15)break;}return h;}
function ibeta(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(lgam(a+b)-lgam(a)-lgam(b)+a*Math.log(x)+b*Math.log(1-x));return x<(a+1)/(a+b+2)?bt*betacf(a,b,x)/a:1-bt*betacf(b,a,1-x)/b;}
function tcdf(t,nu){const p=0.5*ibeta(nu/(nu+t*t),nu/2,0.5);return t>0?1-p:p;}
function tinv(q,nu){let lo=-60,hi=60;for(let i=0;i<200;i++){const m=(lo+hi)/2;if(tcdf(m,nu)<q)lo=m;else hi=m;}return (lo+hi)/2;}
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
/* accurate normal cdf (erfc via continued fraction is overkill; use W. J. Cody style via series) */
function ncdf(z){if(z<-8)return 0;if(z>8)return 1;let s=0,t=z,k=1;const z2=z*z;/* series for |z|<3, else asymptotic */
 if(Math.abs(z)<3){let term=z;s=z;for(let n=1;n<200;n++){term*=z2/(2*n+1);s+=term;if(Math.abs(term)<1e-17*Math.abs(s))break;}return 0.5+s*Math.exp(-z2/2)/Math.sqrt(2*Math.PI);}
 const a=Math.abs(z);let f=0;for(let n=60;n>=1;n--)f=n/(a+f);const tail=Math.exp(-z2/2)/Math.sqrt(2*Math.PI)/(a+f);return z>0?1-tail:tail;}
function npdf(z){return Math.exp(-z*z/2)/Math.sqrt(2*Math.PI);}
/* noncentral t: integrate over the chi-square variable with Simpson's rule */
function nctGrid(nu){const W=nu+24*Math.sqrt(2*nu)+20,M=1200,h=W/M,g=[];const lc=(nu/2)*Math.log(2)+lgam(nu/2);
 for(let i=0;i<=M;i++){const w=i*h,f=w<=0?0:Math.exp((nu/2-1)*Math.log(w)-w/2-lc);g.push([w,f*(i===0||i===M?1:(i%2?4:2))*h/3]);}return g;}
const NCG={};function ng(nu){return NCG[nu]||(NCG[nu]=nctGrid(nu));}
function nctcdf(x,nu,d){let s=0;for(const [w,f] of ng(nu)){if(!f)continue;s+=f*ncdf(x*Math.sqrt(w/nu)-d);}return s;}
function nctpdf(x,nu,d){let s=0;for(const [w,f] of ng(nu)){if(!f)continue;const r=Math.sqrt(w/nu);s+=f*npdf(x*r-d)*r;}return s;}
/* tune the shortfall (noncentrality) so the 5% cutoff is exactly where the two density curves cross */
function tuneT(nu,c){let lo=0.5,hi=12;for(let i=0;i<80;i++){const m=(lo+hi)/2;if(nctpdf(c,nu,m)>nctpdf(c,nu,0))lo=m;else hi=m;}return (lo+hi)/2;}
/* chi-square */
function gammp(a,x){if(x<=0)return 0;const gl=lgam(a);if(x<a+1){let ap=a,sum=1/a,del=sum;for(let n=0;n<500;n++){ap++;del*=x/ap;sum+=del;if(Math.abs(del)<Math.abs(sum)*1e-16)break;}return sum*Math.exp(-x+a*Math.log(x)-gl);}
 let b=x+1-a,c=1/1e-300,d=1/b,h=d;for(let i=1;i<500;i++){const an=-i*(i-a);b+=2;d=an*d+b;if(Math.abs(d)<1e-300)d=1e-300;c=b+an/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<1e-16)break;}return 1-Math.exp(-x+a*Math.log(x)-gl)*h;}
function chicdf(x,k){return gammp(k/2,x/2);}
function chipdf(x,k){return x<=0?0:Math.exp((k/2-1)*Math.log(x)-x/2-(k/2)*Math.log(2)-lgam(k/2));}
function ncxcdf(x,k,l){let s=0;for(let j=0;j<400;j++){const w=Math.exp(-l/2+j*Math.log(l/2)-lgam(j+1));s+=w*chicdf(x,k+2*j);if(j>l&&w<1e-17)break;}return s;}
function ncxpdf(x,k,l){let s=0;for(let j=0;j<400;j++){const w=Math.exp(-l/2+j*Math.log(l/2)-lgam(j+1));s+=w*chipdf(x,k+2*j);if(j>l&&w<1e-17)break;}return s;}
function chiinv(q,k){let lo=0,hi=200;for(let i=0;i<200;i++){const m=(lo+hi)/2;if(chicdf(m,k)<q)lo=m;else hi=m;}return (lo+hi)/2;}
function tuneX(k,c){let lo=0.1,hi=80;for(let i=0;i<80;i++){const m=(lo+hi)/2;if(ncxpdf(c,k,m)>chipdf(c,k))lo=m;else hi=m;}return (lo+hi)/2;}
/* ---- end stats library ---- */

/* A made-up class of 30, randomly split 15/15. 30-word vocabulary quiz. Rereading averages 18 words, SD 4 words in both groups (assumptions). */
const NG=15,MU=18,SIG=4,MAXQ=30,DF=NG-1,NSH=100,DEF_SEED=15,DEF_GAIN=4;
const TC=tinv(0.95,DF);                       /* one-sided 5% cutoff, conservative df = 14: 1.761 */
const MDF=2*NG-2;                             /* equal groups, equal spreads: the statistic is exactly t with df = 28 */
const DEL=tuneT(MDF,TC);                      /* real gain, in standard errors, where the df = 14 cutoff is the best possible standard */
const DGAIN=DEL*SIG*Math.sqrt(2/NG);          /* the same gain in words: about 5.2 */
function wrong(c){const fa=50*(1-tcdf(c,MDF)),miss=50*nctcdf(c,MDF,DEL);return {fa,miss,tot:fa+miss,c};}
const WT=wrong(TC);
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2),f3=v=>fmtNum(v,3);
const pfmt=p=>p<0.001?'less than 0.001':f3(p);
const mean=a=>a.reduce((x,y)=>x+y,0)/a.length,sdv=a=>{const m=mean(a);return Math.sqrt(a.reduce((x,y)=>x+(y-m)*(y-m),0)/(a.length-1));};
function gen(seed,gain,draw){const r=rng((seed+7919*(draw||0))|0),P=[],Q=[];
 for(let i=0;i<NG;i++)P.push(clamp(Math.round(MU+gain+SIG*randn(r)),0,MAXQ));
 for(let i=0;i<NG;i++)Q.push(clamp(Math.round(MU+SIG*randn(r)),0,MAXQ));
 const mP=mean(P),mQ=mean(Q),sP=sdv(P),sQ=sdv(Q),vP=sP*sP/NG,vQ=sQ*sQ/NG,se=Math.sqrt(vP+vQ),d=mP-mQ,t=d/se,p=1-tcdf(t,DF);
 const dfW=(vP+vQ)*(vP+vQ)/(vP*vP/(NG-1)+vQ*vQ/(NG-1)),pW=1-tcdf(t,dfW);
 /* shuffle test: deal the same 30 scores into two random groups of 15, 100 times */
 const all=P.concat(Q),r2=rng((seed*31+17+101*(draw||0))|0),sh=[];
 for(let j=0;j<NSH;j++){const a=all.slice();for(let i=a.length-1;i>0;i--){const k=Math.floor(r2()*(i+1));const x=a[i];a[i]=a[k];a[k]=x;}sh.push(mean(a.slice(0,NG))-mean(a.slice(NG)));}
 const cnt=sh.filter(x=>x>=d-1e-9).length;
 return {seed,gain,draw:draw||0,P,Q,mP,mQ,sP,sQ,se,d,t,p,dfW,pW,lo:d-TC*se,hi:d+TC*se,sh,cnt};}
const D=gen(DEF_SEED,DEF_GAIN,0);
const st=sim=>sim.st;
const testReal=S=>S.p<0.05;
function score(S,call){const u=S.t,c=call==='real'?(u>=TC?TC:u):(u<TC?TC:u),w=wrong(c);return Object.assign({call,v:w.tot},w);}
const CALL={real:'“Practice testing really helped”',chance:'“That gap could just be chance”'};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const shown=sim=>!!((sim.tour&&sim.tour.on)||(sim.st&&sim.st.shown)||(sim.gutS&&sim.gutS.g));
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const showTruth=sim=>!!(sim.p.peek||(GS(sim)&&GS(sim).m));
const words=v=>f1(v)+' words';
function fit(ctx,s,x,y,o,left){ctx.font=(o.w||400)+' '+(o.s||13)+'px '+FONT;const w=ctx.measureText(s).width;let a=left?'right':'left',xx=left?x-8:x+8;
 if(left&&xx-w<6){a='left';xx=Math.max(6,x+8);if(xx+w>794)xx=6;}else if(!left&&xx+w>794){a='right';xx=Math.min(794,x-8);if(xx-w<6){a='left';xx=6;}}
 txt(ctx,s,xx,y,Object.assign({},o,{a}));}
const newGain=()=>Math.random()<0.5?0:+(1+6*Math.random()).toFixed(1);

/* drawing frame */
let AX0=150;const AX1=770,S_LO=5,S_HI=30;
const XS=v=>AX0+(clamp(v,S_LO,S_HI)-S_LO)/(S_HI-S_LO)*(AX1-AX0);
const H_LO=-8,H_HI=8,BY=416;
const XH=v=>60+(clamp(v,H_LO,H_HI)-H_LO)/(H_HI-H_LO)*710;

const HIDDEN=S=>`The flashcard group averaged <b>${words(S.mP)}</b> and the rereading group <b>${words(S.mQ)}</b>: a gap of ${f2(S.d)} words. <b>Real difference, or chance?</b> Make your call, then lock it in to see the test.`;
const SIM={
 id:'studymethod',hash:'studymethod',apUnit:15,order:4,tab:'Does the new study method work?',kind:'Simulation',
 card:'Compare two randomly assigned study groups, call the gap real or chance by feel, then test it with a shuffle and a two-sample t-test.',
 title:'Does practice testing beat rereading?',
 lede:{bio:'Your class split at random into two groups for a 30-word vocabulary quiz. One group quizzed themselves with flashcards; the other reread their notes. Compare the two groups’ average scores. Scores vary a lot from student to student, so is a gap between the groups real, or just which students happened to land in which group?',
  honors:'Because the groups were assigned at random, you can ask: if the method made no difference, how often would shuffling the same 30 scores into two random groups make a gap this big? That is a randomization test. The two-sample t-test answers the same question with a formula.',
  ap:'H₀: μ_P − μ_R = 0 vs. Hₐ: μ_P − μ_R > 0. t = (x̄_P − x̄_R)/√(s_P²/n_P + s_R²/n_R). Use df = 14 (the smaller n minus 1, the conservative choice) or the calculator’s Welch df. The matching interval for μ_P − μ_R is a 90% confidence interval.'},
 scale:'Top: quiz scores out of 30 words, one dot per student, 15 per group. Bottom: the gap between group averages after each of 100 random shuffles of the same 30 scores. The class and scores are simulated.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your call',
 controls:[
  {id:'call',label:'Your call',type:'seg',def:'real',options:[{v:'real',l:'Practice testing really helped'},{v:'chance',l:'That gap could just be chance'}]},
  {id:'peek',label:'Show the truth',type:'toggle',def:false,help:'The tool knows how much the method really helps in this class. Peek only after you call it.'},
  {id:'ci',label:'Show the 90% confidence interval',type:'toggle',def:true,lvl:'ap'}
 ],
 actions:[
  {id:'show',label:'Skip my call and show the test',run(sim){sim.st.shown=true;}},
  {id:'newc',label:'New class',primary:true,run(sim){sim.st=gen(Math.floor(Math.random()*1e9),newGain(),0);BioLab.setValues(sim,{peek:false});clearGut(sim);}},
  {id:'again',label:'Run the experiment again',lvl:'honors',run(sim){const S=st(sim);sim.st=gen(S.seed,S.gain,S.draw+1);clearGut(sim);}}
 ],
 init(){return gen(DEF_SEED,DEF_GAIN,0);},step(){},
 metrics:[
  {id:'mP',label:'Practice testing average',unit:'words',d:1,min:0,max:30,get:sim=>st(sim).mP},
  {id:'mR',label:'Rereading average',unit:'words',d:1,min:0,max:30,get:sim=>st(sim).mQ},
  {id:'gap',label:'Gap between the averages',unit:'words',d:2,min:-10,max:10,get:sim=>st(sim).d},
  {id:'shuf',label:'Shuffles (of 100) with a gap this big or bigger',unit:'',d:0,min:0,max:100,get:sim=>shown(sim)?(st(sim).cnt):null},
  {id:'se',label:'Standard error of the gap',unit:'words',d:2,lvl:'honors',min:0,max:4,get:sim=>st(sim).se},
  {id:'t',label:'Test statistic t',unit:'',d:2,lvl:'honors',min:-6,max:6,get:sim=>shown(sim)?(st(sim).t):null},
  {id:'p',label:'p-value (df = 14)',unit:'',d:3,lvl:'ap',min:0,max:1,get:sim=>shown(sim)?(st(sim).p):null},
  {id:'welch',label:'Calculator (Welch) df and p-value',text:true,lvl:'ap',get:sim=>shown(sim)?(`df = ${f1(st(sim).dfW)}, p = ${pfmt(st(sim).pW)}`):null},
  {id:'ciT',label:'90% confidence interval for μ_P − μ_R',text:true,lvl:'ap',get:sim=>shown(sim)?(`${f2(st(sim).lo)} to ${f2(st(sim).hi)} words`):null},
  {id:'verdict',label:'The 5% test says',text:true,lvl:'honors',get:sim=>shown(sim)?(testReal(st(sim))?'Real: chance rarely makes a gap this big':'Not enough evidence: chance could explain it'):null}
 ],
 graphs:[{id:'calls',label:'Wrong conclusions per 100 classes',custom:true}],defaultGraph:'calls',
 plot(sim,ctx,box){const G=GS(sim),cols=[{n:'The 5% test',w:WT}];
  if(G&&G.g)cols.unshift({n:'Your gut’s standard',w:G.g});
  const ymax=Math.max(10,Math.ceil(Math.max(...cols.map(c=>c.w.tot))/10)*10);
  const ax=axes(ctx,box,{xmin:0,xmax:cols.length,ymin:0,ymax,xcats:cols.map(c=>c.n),yl:'Wrong conclusions per 100'});
  cols.forEach((c,i)=>{const x0=ax.X(i+0.3),x1=ax.X(i+0.7),y0=ax.Y(0),y1=ax.Y(c.w.fa),y2=ax.Y(c.w.tot);
   ctx.fillStyle=PAL['s1'];ctx.fillRect(x0,y1,x1-x0,y0-y1);ctx.fillStyle=PAL['s4'];ctx.fillRect(x0,y2,x1-x0,y1-y2);
   txt(ctx,f1(c.w.tot),(x0+x1)/2,y2-6,{s:13,w:700,c:PAL['fg'],a:'center'});});
  txt(ctx,'Red: “it works” when it does not',box.L+12,box.T+12,{s:12,c:PAL['s1'],w:700});
  txt(ctx,'Amber: missed a method that adds '+words(DGAIN),box.L+12,box.T+30,{s:12,c:PAL['s4'],w:700});
  if(!(G&&G.g))txt(ctx,'Lock in your gut call to add your bar.',box.L+box.W-8,box.T+12,{s:12,c:PAL['muted'],a:'right'});},
 draw(sim,ctx,vdt,k){const S=st(sim),G=GS(sim),hon=atLeast('honors'),ap=atLeast('ap');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,240,800,210);
  txt(ctx,'Quiz scores (words right out of 30)',20,24,{s:14*k,w:700});
  /* two rows of dots */
  const rows=[{lab:'Flashcards',sub:'quiz yourself',a:S.P,m:S.mP,y:120,c:PAL['s3']},{lab:'Rereading',sub:'notes',a:S.Q,m:S.mQ,y:196,c:PAL['s2']}];
  ctx.font='700 '+(13*k)+'px '+FONT;AX0=Math.max(130,Math.ceil(Math.max(ctx.measureText('Flashcards').width,ctx.measureText('Rereading').width))+40);
  const R=7;rows.forEach(rw=>{ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(AX0,rw.y);ctx.lineTo(AX1,rw.y);ctx.stroke();
   txt(ctx,rw.lab,20,rw.y-8,{s:13*k,w:700,c:rw.c});if(k<1.3)txt(ctx,rw.sub,20,rw.y+10*k,{s:12*k,c:PAL['cv-soft']});
   const stack={};rw.a.forEach(v=>{const n=stack[v]||0;stack[v]=n+1;ctx.fillStyle=rw.c;ctx.beginPath();ctx.arc(XS(v),rw.y-R-1-n*(2*R+1),R,0,7);ctx.fill();});
   const xm=XS(rw.m);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.moveTo(xm,rw.y+2);ctx.lineTo(xm-7,rw.y+13);ctx.lineTo(xm+7,rw.y+13);ctx.closePath();ctx.fill();});
  for(let v=S_LO;v<=S_HI;v+=5){const x=XS(v);txt(ctx,String(v),x,196+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  /* averages and the gap */
  const x1=XS(S.mP),x2=XS(S.mQ);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(x1,120);ctx.lineTo(x1,44);ctx.moveTo(x2,196);ctx.lineTo(x2,44);ctx.stroke();ctx.setLineDash([]);
  ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x2,44);ctx.lineTo(x1,44);ctx.stroke();
  fit(ctx,`Gap ${S.d>=0?'+':''}${f2(S.d)} words`,Math.max(x1,x2),49,{s:13*k,w:700,c:PAL['rj']},false);
  /* pills */
  let py=20;const pr=(s,bg)=>{ctx.font='700 '+(12*Math.min(k,1.3))+'px '+FONT;const w=ctx.measureText(s).width+14*Math.min(k,1.3);pill(ctx,s,790-w/2,py,bg,'#fff',12*Math.min(k,1.3));py+=26*Math.min(k,1.3);};
  if(G&&G.g)pr('Your gut: '+(G.g.call==='real'?'real':'chance'),'#a0640a');
  if(G&&G.m)pr('The test: '+(testReal(S)?'real':'not enough evidence'),'#2f6b3a');
  if(showTruth(sim))pr('Truth: '+(S.gain<0.05?'no real difference':'flashcards add '+words(S.gain)),'#5b4a8a');
  /* shuffle panel */
  txt(ctx,hon?'Randomization test: gaps (words) in 100 shuffles':'If it made no difference: gaps (words) in 100 reshuffles',20,262,{s:13*k,w:700});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(60,BY);ctx.lineTo(770,BY);ctx.stroke();
  for(let v=H_LO;v<=H_HI;v+=(k>1.3?4:2)){const x=XH(v);ctx.beginPath();ctx.moveTo(x,BY);ctx.lineTo(x,BY+5);ctx.stroke();txt(ctx,(v>0?'+':'')+v,x,BY+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  if(!shown(sim)){fit(ctx,'Make your call and lock it in to see this test.',60,340,{s:13*k,w:700,c:PAL['cv-soft']},false);}
  else{
  const r=2.8,BW=2/NG,cols={};S.sh.forEach(g=>{const b=Math.round(clamp(g,H_LO,H_HI)/BW),n=cols[b]||0;cols[b]=n+1;const x=XH(b*BW),y=BY-r-1-n*(2*r+0.4);const hit=g>=S.d-1e-9;
   ctx.fillStyle=hit?PAL['s1']:PAL['cv-soft'];ctx.globalAlpha=hit?1:0.7;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.globalAlpha=1;});
  const xd=XH(S.d);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(xd,262+28*k);ctx.lineTo(xd,BY);ctx.stroke();
  fit(ctx,`Your gap: ${S.cnt} of 100 shuffles were this big or bigger`,xd,262+24*k,{s:13*k,w:700,c:PAL['s1']},S.d>3);
  if(S.d>H_HI)fit(ctx,'Your gap is off this scale, to the right',770,262+44*k,{s:12*k,c:PAL['rj']},true);
  if(hon)fit(ctx,`t = ${f2(S.t)}`,xd,262+44*k,{s:12*k,w:700,c:PAL['s5']},S.d>3);
  if(ap&&sim.p.ci&&shown(sim)){const y=262+64*k,a=XH(S.lo),b=XH(S.hi);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(a,y);ctx.lineTo(b,y);ctx.stroke();[a,b].forEach(x=>{ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();});
   fit(ctx,`90% CI for μ_P − μ_R: ${f2(S.lo)} to ${f2(S.hi)}`,a,y+4,{s:12*k,w:700,c:PAL['s5']},true);}
  }
 },
 narrate(sim){if(!shown(sim))return HIDDEN(st(sim));const S=st(sim);
  const base=`The flashcard group averaged <b>${words(S.mP)}</b> and the rereading group <b>${words(S.mQ)}</b>: a gap of ${f2(S.d)} words. `;
  if(S.d<=0)return base+'<b>That is no evidence for flashcards at all:</b> the rereading group did as well or better.';
  if(atLeast('honors'))return base+`That is ${f2(S.t)} standard errors. <b>${testReal(S)?'Shuffling the same scores rarely makes a gap this big, so the test says the method made a real difference.':'Random shuffles make gaps this big often enough that chance could explain it.'}</b>`;
  return base+`${S.cnt} of 100 random reshuffles of the same scores made a gap this big or bigger. <b>${S.cnt<5?'Chance almost never does that.':S.cnt<20?'Chance does that now and then.':'Chance does that all the time.'}</b>`;},
 gut:{better:'lower',controls:['call'],lockLabel:'Lock in my call',
  ask:{bio:'Look at the two rows of scores. Pick one here: did practice testing really help, or could a gap like this be chance, from which students happened to land in which group? Then lock it in.',
   honors:'Before you look at the shuffles or t: pick one here. Real difference, or chance? Then lock it in.'},
  lock(sim){const S=st(sim),g=score(S,sim.p.call);g.label=CALL[sim.p.call];return g;},
  solve(sim){const S=st(sim),c=testReal(S)?'real':'chance';sim.p.call=c;const m=score(S,c);
   m.label=(c==='real'?'“Practice testing really helped”':'“Not enough evidence: the gap could be chance”')+(atLeast('honors')?` (t = ${f2(S.t)}, p = ${pfmt(S.p)})`:` (${S.cnt} of 100 shuffles made a gap this big)`);return m;},
  how:{bio:'The math asks: if the study method made no difference, the 30 scores would be the same no matter who was in which group. So shuffle the scores into two random groups over and over. If a gap as big as yours shows up fewer than 5 times in 100, call it real.',
   honors:'Randomization test: shuffle the 30 scores into two groups of 15 many times and see how often the gap matches yours. The two-sample t-test does the same job with a formula: t = gap ÷ standard error, and it calls the gap real when t is above 1.76.',
   ap:'Two-sample t-test, Hₐ: μ_P − μ_R > 0. With the conservative df = 14, reject H₀ when t > 1.761 (p < 0.05). That matches a 90% interval for μ_P − μ_R lying entirely above 0.'},
  compare(sim,g,m){const S=st(sim),same=g.call===m.call,diff=g.tot-m.tot;
   const world=`Picture 100 classes running this experiment: in 50 the method makes no difference, and in 50 flashcards add ${words(DGAIN)} on average.`,fair5=` In this picture (flashcards adding ${words(DGAIN)}), the 5% rule is the best possible standard. Against other effect sizes a different cutoff could make fewer total mistakes, but the 5% rule always keeps false claims that a useless method works to at most about 5 in 100 classes (${f1(2*WT.fa)} here, a bit fewer because df = 14 is conservative).`;
   const tr=` The truth in this class: `+(S.gain<0.05?'the method made no real difference.':`flashcards really add ${words(S.gain)} on average.`)+(testReal(S)&&S.gain<0.05?' This is one of the classes where chance alone made a big gap. A 5% test is fooled like this in about 5 of every 100 such classes.':(!testReal(S)&&S.gain>=0.05?' The test missed it here: with 15 students per group, a modest gain can hide in the scatter. Not enough evidence does not mean no effect.':''));
   if(same)return `Your gut made the same call as the test. ${world} Used as a rule, the most generous version of your gut is the 5% test itself: about <b>${f1(m.tot)} wrong conclusions per 100 classes</b> (${f1(m.fa)} times saying it works when it does not, ${f1(m.miss)} times missing a method that works).`+fair5+tr;
   const rule=g.call==='real'?'call it real whenever the gap is at least this big next to the scatter':'call a gap this big chance, and only call it real when the gap is bigger';
   return `${world} Your gut’s standard (${rule}) reaches about <b>${f1(g.tot)} wrong conclusions per 100 classes</b>: ${f1(g.fa)} times saying it works when it does not and ${f1(g.miss)} times missing a method that works. The 5% test reaches ${f1(m.tot)}. That is <b>${f1(diff)} fewer wrong conclusions per 100 classes</b>.`+fair5+tr;},
  again(sim){sim.st=gen(Math.floor(Math.random()*1e9),newGain(),0);sim.p.call='real';sim.p.peek=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Why does it matter that students were assigned to the two groups at random?',choices:['It makes the groups the same size','Any difference other than the study method is spread evenly by chance, so a big gap can be blamed on the method','It guarantees the flashcard group scores higher'],correct:1,explain:'If students chose their own method, the stronger students might all pick flashcards. Random assignment spreads ability, motivation and everything else evenly, by chance. Then a gap bigger than chance makes can be credited to the method itself.'},
  {lvl:'bio',instant:true,q:'If the study method makes no difference, what does shuffling the 30 scores into two random groups show you?',choices:['The gaps chance alone produces','The real effect of flashcards','Which students studied hardest'],correct:0,explain:'If the method does nothing, each student would have earned the same score in either group. Shuffling the scores into new random groups shows every gap that luck in the assignment could have produced.'},
  {lvl:'honors',instant:true,q:'Group averages 21.2 and 17.8 words, with standard deviations 4.0 and 4.3, 15 per group. What is t?',choices:['About 2.24','About 3.4','About 0.82','About 8.7'],correct:0,explain:'SE = √(4.0²/15 + 4.3²/15) = √(1.067 + 1.233) = √2.300 = 1.517 words. t = (21.2 − 17.8) ÷ 1.517 = 3.4 ÷ 1.517 ≈ 2.24.'},
  {lvl:'honors',instant:true,q:'In 100 random shuffles, 2 gave a gap as big as yours or bigger. What does that suggest?',choices:['Chance rarely makes a gap this big, so the method probably made a real difference','The method made a 2-word difference','There is a 2% chance the flashcard group is better'],correct:0,explain:'About 2 in 100 is the shuffle version of a p-value near 0.02. It says how rare your gap would be if the method did nothing. It is not the size of the effect and not the probability that the method works.'},
  {lvl:'ap',instant:true,q:'A 90% confidence interval for μ_P − μ_R is 0.6 to 6.2 words. Which conclusion is correct?',choices:['At α = 0.05 (one-sided), there is convincing evidence flashcards raise the mean score: 0 is below the whole interval','There is no evidence because the interval is wide','90% of students gained between 0.6 and 6.2 words'],correct:0,explain:'Every plausible value of the true difference is above 0, which matches rejecting H₀ in favor of Hₐ: μ_P − μ_R > 0 at α = 0.05. The interval describes the difference in mean scores, not individual students.'},
  {lvl:'ap',instant:true,q:'Your calculator’s 2-SampTTest reports df = 27.6, but your teacher says to use df = 14. Why?',choices:['df = smaller n − 1 is a conservative choice: it gives a slightly larger p-value, so you never overstate the evidence','The calculator is wrong','df must always equal n₁ + n₂'],correct:0,explain:'The calculator uses the Welch formula, which gives a df between the smaller n − 1 and n₁ + n₂ − 2. Using the smaller n − 1 makes t* a bit bigger and the p-value a bit bigger: safe, and accepted on the AP exam.'}
 ],
 tour:[
  {title:'Two random groups',text:'Each dot is one student’s score on a 30-word vocabulary quiz. The 30 students were split at random: 15 quizzed themselves with flashcards, 15 reread their notes.',focus:[[0,30,800,210]],pause:true,setup:sim=>BioLab.setValues(sim,{peek:false})},
  {title:'The gap',text:`The flashcard group averaged ${words(D.mP)} and the rereading group ${words(D.mQ)}: a gap of ${f2(D.d)} words. But look how much the dots overlap. Some rereaders beat most of the flashcard group.`,focus:[[0,30,800,210]],pause:true},
  {title:'What if the method did nothing?',text:'Then every student would have earned the same score in either group, and the gap would only reflect who landed where. So the tool deals the same 30 scores into two random groups of 15, 100 times, and records each gap.',focus:[[0,240,800,210]],pause:true},
  {title:'Is your gap unusual?',text:`Only ${D.cnt} of the 100 shuffles made a gap of ${f2(D.d)} words or more (the red dots). Chance rarely does that, so the method probably made a real difference.`,focus:[[0,240,800,210]],pause:true},
  {lvl:'honors',title:'The t statistic',text:`The two-sample t-test does the same job with a formula. Standard error of the gap: √(s_P²/15 + s_R²/15) = ${f2(D.se)} words. t = ${f2(D.d)} ÷ ${f2(D.se)} = ${f2(D.t)}. The test calls it real when t is above 1.76.`,pause:true},
  {lvl:'ap',focus:[[0,240,800,210]],title:'The formal test',text:`H₀: μ_P − μ_R = 0, Hₐ: μ_P − μ_R > 0. Conditions: random assignment, and no strong skew or outliers in either group of 15. With df = 14, p = ${f3(D.p)}. The calculator’s Welch df is ${f1(D.dfW)}, giving p = ${f3(D.pW)}. Reject H₀. 90% interval: ${f2(D.lo)} to ${f2(D.hi)} words.`,pause:true,setup:sim=>BioLab.setValues(sim,{ci:true})},
  {title:'Why use a rule instead of a hunch',text:`Picture 100 classes: in 50 the method does nothing, in 50 flashcards add ${words(DGAIN)}. The 5% rule reaches about ${f1(WT.tot)} wrong conclusions per 100 classes. In this picture (flashcards adding ${words(DGAIN)}), the 5% rule is the best possible standard. Against other effect sizes a different cutoff could make fewer total mistakes, but the 5% rule always keeps false claims that a useless method works to at most about 5 in 100 classes (${f1(2*WT.fa)} here, a bit fewer because df = 14 is conservative). Lock in your own call and the tool shows how your gut’s standard compares.`,pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How often does chance alone make a big gap?</p><ol><li>Turn on <b>Show the truth</b>. Press <b>New class</b> until you get a class where the method makes no real difference.</li><li>Record the gap and the number of shuffles with a gap that big.</li><li>Repeat for 10 such classes. How big was the biggest gap chance made?</li></ol><p>Write one sentence: why can a gap of 2 or 3 words come from chance alone?</p>',
  honors:'<p><b>Question:</b> How big a gain can 15 students per group reliably detect?</p><ol><li>Turn on <b>Show the truth</b> and find a class where flashcards really help.</li><li>Press <b>Run the experiment again</b> ten times, recording t and the test’s verdict each time.</li><li>Repeat for a class with a small gain and one with a large gain.</li></ol><p>Explain, using the standard error, why small gains slip past the test.</p>',
  ap:'<p><b>Question:</b> Does practice testing raise mean vocabulary scores more than rereading?</p><ol><li>State H₀ and Hₐ, defining μ_P and μ_R.</li><li>Check conditions: random assignment, and Normal/no strong skew in each group of 15.</li><li>Compute t, df (both ways) and the p-value, and the 90% interval for μ_P − μ_R.</li><li>Compare your p-value with the shuffle count.</li></ol><p><b>CER:</b> Claim, evidence and reasoning in context. Because this was a randomized experiment, can you claim the method caused the difference? For which students?</p>'},
 terms:[
  {t:'Random assignment',d:'Using chance to decide which subjects get which treatment. It balances everything else between the groups, so a big enough difference can be credited to the treatment.'},
  {t:'Randomization (shuffle) test',d:'Reshuffle the observed values into random groups many times to see how often chance alone makes a difference as big as the one observed.',lvl:'honors'},
  {t:'Standard error of the difference',d:'√(s₁²/n₁ + s₂²/n₂): how much the gap between two sample means typically wobbles from one experiment to the next.',lvl:'honors'},
  {t:'Two-sample t-test',d:'t = (x̄₁ − x̄₂)/√(s₁²/n₁ + s₂²/n₂), compared with a t distribution. df is the smaller n − 1 (conservative) or the calculator’s Welch df.',lvl:'ap'},
  {t:'Statistically significant',d:'A difference too big to be explained by chance at the chosen level (here α = 0.05). It says nothing about whether the difference is big enough to matter.',lvl:'ap'}
 ],
 about:`<p>The class, the students and their scores are simulated, not from a real study. Each score is Normal with standard deviation 4 words around 18 words (rereading) or 18 plus the class’s true gain (flashcards), rounded to a whole number from 0 to 30. A new class has no real difference half the time; otherwise flashcards add a random 1 to 7 words.</p><p>Research on retrieval practice (testing yourself) has repeatedly found it helps long-term memory more than rereading; a 2013 review by Dunlosky and colleagues rated practice testing as a high-utility study strategy and rereading as low-utility. This tool does not use their data, and real gains depend on the students, the material and the test.</p><p><b>The shuffle</b> deals the same 30 scores into two random groups of 15, 100 times. Its count is close to, but not exactly, the t-test’s p-value. <b>The t-test</b> uses the conservative df = 14 (cutoff t = 1.761, one-sided, α = 0.05); the readouts also show the calculator’s Welch df and p-value, which can differ slightly.</p><p><b>Wrong conclusions per 100</b> are computed for the test’s rule (t above 1.761, the df = 14 cutoff) in 50 classes with no real difference and 50 where flashcards add ${words(DGAIN)} (with a 4-word spread). With two equal groups and equal spreads the t statistic follows the t distribution with df = 28 exactly, so the rates come from the t and noncentral t distributions with df = 28. Under that model the df = 14 rule raises a false alarm in ${f1(100*(1-tcdf(TC,MDF)))}% of no-difference classes, a bit under 5% because df = 14 is conservative. That gain is chosen on purpose: it is the size of effect for which the 5% cutoff is the best possible standard, so the two kinds of mistakes balance there. Against smaller effects a looser standard would make fewer total mistakes, but it would also claim more methods work when they do not. Your gut’s standard is scored generously: the most forgiving rule that still matches your call on this class, and the same score as the test if your call matches it.</p>`
};
SIM._core={gen,wrong,score,TC,DEL,DGAIN,WT,D};
BioLab.register(SIM);
})();
