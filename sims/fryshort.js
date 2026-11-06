(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,atLeast,fmtNum,rng,randn,rr}=BioLab.h;
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

/* Made-up restaurant. Listed weight 4.1 oz, 12 boxes, hand-scooped boxes vary with SD 0.24 oz (an assumption), scale reads to 0.05 oz. */
const LW=4.1,N=12,DF=N-1,SIG=0.24,STEP=0.05,NSIM=100,DEF_SEED=111;
const TC=tinv(0.95,DF);                 /* one-sided 5% cutoff for t, df 11: 1.796 */
const DEL=tuneT(DF,TC);                 /* shortfall, in standard errors, where that cutoff is the best possible standard */
const DSHORT=DEL*SIG/Math.sqrt(N);      /* the same shortfall in ounces: about 0.25 oz */
/* Wrong calls per 100 restaurants (50 honest, 50 shorting by DSHORT) for the rule "call it shorting when the evidence u = (4.1 − average) ÷ (s/√12) is at least c". */
function wrong(c){const fa=50*(1-tcdf(c,DF)),miss=50*nctcdf(c,DF,DEL);return {fa,miss,tot:fa+miss,c};}
const WT=wrong(TC);
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2),f3=v=>fmtNum(v,3),oz=v=>f2(v)+' oz';
const pfmt=p=>p<0.001?'less than 0.001':f3(p);
function gen(seed,short,draw){const r=rng((seed+7919*(draw||0))|0),bx=[];
 for(let i=0;i<N;i++){const w=clamp(LW-short+SIG*randn(r),2.9,5.1);bx.push(+(Math.round(w/STEP)*STEP).toFixed(2));}
 const mean=bx.reduce((a,b)=>a+b,0)/N,s=Math.sqrt(bx.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(N-1)),se=s/Math.sqrt(N),t=(mean-LW)/se,p=tcdf(t,DF);
 const r2=rng((seed*31+17+101*(draw||0))|0),sims=[];for(let j=0;j<NSIM;j++){let a=0;for(let i=0;i<N;i++)a+=LW+s*randn(r2);sims.push(a/N);}
 const cnt=sims.filter(a=>a<=mean+1e-9).length;
 return {seed,short,draw:draw||0,bx,mean,s,se,t,u:-t,p,lo:mean-TC*se,hi:mean+TC*se,sims,cnt};}
const D=gen(DEF_SEED,0,0);              /* the default restaurant (used by the walkthrough and review) */
const st=sim=>sim.st;
const testShort=S=>S.p<0.05;
function score(S,call){const u=S.u,c=call==='short'?(u>=TC?TC:u):(u<TC?TC:u),w=wrong(c);return Object.assign({call,v:w.tot},w);}
const CALL={short:'“They’re shorting us”',fair:'“That’s just normal variation”'};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function truthWords(S){return S.short<0.005?'this restaurant was honest':`this restaurant was shorting every box by ${oz(S.short)} on average`;}
/* text placed beside x (to the left if left), kept inside the stage */
function fit(ctx,s,x,y,o,left){ctx.font=(o.w||400)+' '+(o.s||13)+'px '+FONT;const w=ctx.measureText(s).width;let a=left?'right':'left',xx=left?x-8:x+8;
 if(left&&xx-w<6){a='left';xx=Math.max(6,x+8);if(xx+w>794)xx=6;}else if(!left&&xx+w>794){a='right';xx=Math.min(794,x-8);if(xx-w<6){a='left';xx=6;}}
 txt(ctx,s,xx,y,Object.assign({},o,{a}));}
const shown=sim=>!!((sim.tour&&sim.tour.on)||(sim.st&&sim.st.shown)||(sim.gutS&&sim.gutS.g));
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const showTruth=sim=>!!(sim.p.peek||(GS(sim)&&GS(sim).m));

/* drawing frame */
const AX0=60,AX1=770,A_LO=3.0,A_HI=4.8,AY=190;
const XA=v=>AX0+(clamp(v,A_LO,A_HI)-A_LO)/(A_HI-A_LO)*(AX1-AX0);
const B_LO=3.7,B_HI=4.5,BY=414;
const XB=v=>AX0+(clamp(v,B_LO,B_HI)-B_LO)/(B_HI-B_LO)*(AX1-AX0);

const HIDDEN=S=>`Your boxes average <b>${oz(S.mean)}</b>, ${oz(Math.abs(S.mean-LW))} ${S.mean<LW?'under':'over'} the listed 4.1 oz. <b>Is that shorting, or normal variation?</b> Make your call, then lock it in to see the test.`;
const SIM={
 id:'fryshort',hash:'fryshort',apUnit:15,order:3,tab:'Is the fry box short?',kind:'Simulation',
 card:'Weigh 12 boxes of fries, call shorting or normal variation by feel, then let a one-sample t-test make the call.',
 title:'Is the restaurant shorting your fries?',
 lede:{bio:'The menu says a box of fries weighs 4.1 oz. You and your friends weighed 12 boxes and the average came in a little light. Hand-scooped boxes always vary, so the real question is: is this lighter than an honest restaurant would ever look by luck?',
  honors:'A one-sample t-test measures how far your average is below 4.1 oz in units of the standard error s/√n, the typical wobble of a 12-box average. The farther under in those units, the harder it is to blame luck.',
  ap:'H₀: μ = 4.1 oz vs. Hₐ: μ < 4.1 oz, where μ is the true mean weight of all boxes this restaurant serves. t = (x̄ − 4.1)/(s/√n) with df = n − 1 = 11. Reject H₀ at α = 0.05 when p < 0.05; the matching interval is a 90% confidence interval for μ.'},
 scale:'Top: your 12 boxes, weighed in ounces on a kitchen scale that reads to 0.05 oz. Bottom: the 12-box averages of 100 simulated honest restaurants. The restaurant is made up.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your call',
 controls:[
  {id:'call',label:'Your call',type:'seg',def:'short',options:[{v:'short',l:'They’re shorting us'},{v:'fair',l:'That’s just normal variation'}]},
  {id:'peek',label:'Show the truth',type:'toggle',def:false,help:'The tool knows how much this restaurant really puts in a box. Peek only after you call it.'},
  {id:'wob',label:'Show the wobble ruler',type:'toggle',def:true,lvl:'honors',help:'Marks how many standard errors (wobbles) your average sits under 4.1 oz.'},
  {id:'ci',label:'Show the 90% confidence interval',type:'toggle',def:true,lvl:'ap'}
 ],
 actions:[
  {id:'show',label:'Skip my call and show the test',run(sim){sim.st.shown=true;}},
  {id:'newr',label:'New restaurant',primary:true,run(sim){const seed=Math.floor(Math.random()*1e9),sh=Math.random()<0.5?0:+(0.05+0.35*Math.random()).toFixed(2);sim.st=gen(seed,sh,0);BioLab.setValues(sim,{peek:false});clearGut(sim);}},
  {id:'more',label:'Weigh 12 new boxes here',lvl:'honors',run(sim){const S=st(sim);sim.st=gen(S.seed,S.short,S.draw+1);clearGut(sim);}}
 ],
 init(){return gen(DEF_SEED,0,0);},step(){},
 metrics:[
  {id:'avg',label:'Average of your 12 boxes',unit:'oz',d:2,min:3,max:5,get:sim=>st(sim).mean},
  {id:'gap',label:'Average minus the listed 4.1 oz',unit:'oz',d:2,min:-0.6,max:0.6,get:sim=>st(sim).mean-LW},
  {id:'light',label:'Honest restaurants (of 100) this light or lighter',unit:'',d:0,min:0,max:100,get:sim=>shown(sim)?(st(sim).cnt):null},
  {id:'s',label:'Spread of your boxes, s',unit:'oz',d:3,lvl:'honors',min:0,max:0.6,get:sim=>st(sim).s},
  {id:'se',label:'Wobble of a 12-box average, s/√12',unit:'oz',d:3,lvl:'honors',min:0,max:0.2,get:sim=>st(sim).se},
  {id:'t',label:'Test statistic t',unit:'',d:2,lvl:'honors',min:-6,max:6,get:sim=>shown(sim)?(st(sim).t):null},
  {id:'p',label:'p-value (df = 11)',unit:'',d:3,lvl:'ap',min:0,max:1,get:sim=>shown(sim)?(st(sim).p):null},
  {id:'ciT',label:'90% confidence interval for μ',text:true,lvl:'ap',get:sim=>shown(sim)?(`${f2(st(sim).lo)} to ${f2(st(sim).hi)} oz`):null},
  {id:'verdict',label:'The 5% test says',text:true,lvl:'honors',get:sim=>shown(sim)?(testShort(st(sim))?'Shorting: honest restaurants rarely look this light':'Not enough evidence: luck could explain it'):null}
 ],
 graphs:[{id:'calls',label:'Wrong calls per 100 restaurants',custom:true}],defaultGraph:'calls',
 plot(sim,ctx,box){const G=GS(sim),cols=[{n:'The 5% test',w:WT}];
  if(G&&G.g)cols.unshift({n:'Your gut’s standard',w:G.g});
  const ymax=Math.max(10,Math.ceil(Math.max(...cols.map(c=>c.w.tot))/10)*10);
  const ax=axes(ctx,box,{xmin:0,xmax:cols.length,ymin:0,ymax,xcats:cols.map(c=>c.n),yl:'Wrong calls per 100'});
  cols.forEach((c,i)=>{const x0=ax.X(i+0.3),x1=ax.X(i+0.7),y0=ax.Y(0),y1=ax.Y(c.w.fa),y2=ax.Y(c.w.tot);
   ctx.fillStyle=PAL['s1'];ctx.fillRect(x0,y1,x1-x0,y0-y1);ctx.fillStyle=PAL['s4'];ctx.fillRect(x0,y2,x1-x0,y1-y2);
   txt(ctx,f1(c.w.tot),(x0+x1)/2,y2-6,{s:13,w:700,c:PAL['fg'],a:'center'});});
  txt(ctx,'Red: honest restaurants accused',box.L+12,box.T+12,{s:12,c:PAL['s1'],w:700});
  txt(ctx,'Amber: cheaters missed (each shorts '+oz(DSHORT)+')',box.L+12,box.T+30,{s:12,c:PAL['s4'],w:700});
  if(!(G&&G.g))txt(ctx,'Lock in your gut call to add your bar.',box.L+box.W-8,box.T+12,{s:12,c:PAL['muted'],a:'right'});},
 draw(sim,ctx,vdt,k){const S=st(sim),G=GS(sim),hon=atLeast('honors'),ap=atLeast('ap');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,226,800,224);
  /* --- panel A: your boxes --- */
  txt(ctx,'Your 12 boxes (oz)',AX0-40,24,{s:14*k,w:700});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(AX0,AY);ctx.lineTo(AX1,AY);ctx.stroke();
  const tickA=k>1.3?0.4:0.2;for(let v=A_LO;v<=A_HI+1e-9;v+=tickA){const x=XA(v);ctx.beginPath();ctx.moveTo(x,AY);ctx.lineTo(x,AY+5);ctx.stroke();txt(ctx,v.toFixed(1),x,AY+19*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  /* listed weight and your average, labeled on opposite sides */
  const xm=XA(S.mean),aLeft=S.mean<LW;
  ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(XA(LW),62);ctx.lineTo(XA(LW),AY);ctx.stroke();ctx.setLineDash([]);
  fit(ctx,'Listed 4.1 oz',XA(LW),80,{s:12*k,w:700},!aLeft);
  /* dots */
  const R=8.5,stack={};S.bx.forEach(w=>{const key=w.toFixed(2),n=stack[key]||0;stack[key]=n+1;const x=XA(w),y=AY-R-2-n*(2*R+1);
   ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=1.5;ctx.stroke();});
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(xm,62);ctx.lineTo(xm,AY+8);ctx.stroke();
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.moveTo(xm,AY+2);ctx.lineTo(xm-7,AY+13);ctx.lineTo(xm+7,AY+13);ctx.closePath();ctx.fill();
  fit(ctx,'Your average '+oz(S.mean),xm,80,{s:13*k,w:700,c:PAL['rj']},aLeft);
  /* 90% CI */
  if(ap&&sim.p.ci&&shown(sim)){const y=104+6*(k-1),x0=XA(S.lo),x1=XA(S.hi);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
   [x0,x1].forEach(x=>{ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x,y+7);ctx.stroke();});
   fit(ctx,`90% CI ${f2(S.lo)} to ${f2(S.hi)}`,S.mean<LW?x0:x1,y+4,{s:12*k,w:700,c:PAL['s5']},S.mean<LW);}
  /* gut, test and truth pills */
  let py=20;const pr=(s,bg)=>{ctx.font='700 '+(12*Math.min(k,1.3))+'px '+FONT;const w=ctx.measureText(s).width+14*Math.min(k,1.3);pill(ctx,s,790-w/2,py,bg,'#fff',12*Math.min(k,1.3));py+=26*Math.min(k,1.3);};
  if(G&&G.g)pr('Your gut: '+(G.g.call==='short'?'shorting':'normal variation'),'#a0640a');
  if(G&&G.m)pr('The test: '+(testShort(S)?'shorting':'not enough evidence'),'#2f6b3a');
  if(showTruth(sim))pr('Truth: '+(S.short<0.005?'honest':'shorting '+oz(S.short)),'#5b4a8a');
  /* --- panel B: 100 honest restaurants --- */
  txt(ctx,'100 honest restaurants: their 12-box averages (oz)',AX0-40,250,{s:13*k,w:700});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(AX0,BY);ctx.lineTo(AX1,BY);ctx.stroke();
  const tickB=k>1.3?0.2:0.1;for(let v=B_LO;v<=B_HI+1e-9;v+=tickB){const x=XB(v);ctx.beginPath();ctx.moveTo(x,BY);ctx.lineTo(x,BY+5);ctx.stroke();txt(ctx,v.toFixed(1),x,BY+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  if(!shown(sim)){fit(ctx,'Make your call and lock it in to see this test.',60,330,{s:13*k,w:700,c:PAL['cv-soft']},false);}
  else{
  const r=3.8,cols={};S.sims.forEach(a=>{const b=Math.round(clamp(a,B_LO,B_HI)/0.01),n=cols[b]||0;cols[b]=n+1;const x=XB(b*0.01),y=BY-r-1-n*(2*r+0.6);
   ctx.fillStyle=a<=S.mean+1e-9?PAL['s1']:PAL['cv-soft'];ctx.globalAlpha=a<=S.mean+1e-9?1:0.7;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.globalAlpha=1;});
  ctx.setLineDash([6,5]);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(XB(LW),262+26*k);ctx.lineTo(XB(LW),BY);ctx.stroke();ctx.setLineDash([]);
  const xb=XB(S.mean);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(xb,258+10*k);ctx.lineTo(xb,BY);ctx.stroke();
  fit(ctx,`${S.cnt} of 100 as light as yours or lighter`,xb,258+20*k,{s:13*k,w:700,c:PAL['s1']},S.mean>4.25);
  if(S.mean<B_LO)fit(ctx,'Yours is off this scale, to the left',AX0,258+60*k,{s:12*k,c:PAL['rj']},false);
  /* wobble ruler */
  if(hon&&sim.p.wob&&shown(sim)){const y=258+40*k,x0=XB(LW),x1=XB(S.mean);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
   const nT=Math.floor(Math.abs(S.t));for(let i=1;i<=Math.min(nT,12);i++){const xx=XB(LW+Math.sign(S.mean-LW)*i*S.se);ctx.beginPath();ctx.moveTo(xx,y-6);ctx.lineTo(xx,y+6);ctx.stroke();}
   const lab=`t: ${f2(Math.abs(S.t))} standard errors ${S.t<0?'under':'over'}`;const left=S.mean<LW;
   fit(ctx,lab,left?Math.min(x0,x1):Math.max(x0,x1),y+4,{s:12*k,w:700,c:PAL['s5']},left);}
  }
 },
 narrate(sim){if(!shown(sim))return HIDDEN(st(sim));const S=st(sim),gap=S.mean-LW,under=gap<0;
  const base=`Your boxes average <b>${oz(S.mean)}</b>, ${oz(Math.abs(gap))} ${under?'under':'over'} the listed 4.1 oz. `;
  if(!under)return base+`<b>That is not evidence of shorting at all:</b> your average is at or above the listing.`;
  if(atLeast('honors')){const sig=testShort(S);return base+`That is ${f2(-S.t)} standard errors under (t = ${f2(S.t)}). <b>${sig?'Honest restaurants rarely land this far under by luck, so the test says shorting.':'Honest restaurants land this far under often enough that luck could explain it.'}</b>`;}
  return base+`${S.cnt} of 100 honest restaurants came out this light or lighter. <b>${S.cnt<5?'That almost never happens by luck.':S.cnt<20?'That happens by luck now and then.':'That happens by luck all the time.'}</b>`;},
 gut:{better:'lower',controls:['call'],lockLabel:'Lock in my call',
  ask:{bio:'Look at your 12 dots and the dashed 4.1 oz line. Pick one here: are they shorting us, or is that just normal variation? Go with your gut, then lock it in.',
   honors:'Before you look at t: pick one here. Shorting, or normal variation? Then lock it in.'},
  lock(sim){const S=st(sim),g=score(S,sim.p.call);g.label=CALL[sim.p.call];return g;},
  solve(sim){const S=st(sim),c=testShort(S)?'short':'fair';sim.p.call=c;const m=score(S,c);
   m.label=(c==='short'?'“They’re shorting us”':'“Not enough evidence: that could be normal variation”')+(atLeast('honors')?` (t = ${f2(S.t)}, p = ${pfmt(S.p)})`:` (${S.cnt} of 100 honest restaurants look this light)`);return m;},
  how:{bio:'The math asks one question: how often would an honest restaurant, with boxes that vary as much as yours, come out this light just by luck? If that happens fewer than 5 times in 100, call it shorting. If not, luck could explain it.',
   honors:'t = (x̄ − 4.1) ÷ (s/√12) counts how many wobbles (standard errors) your average sits under the listing. The test calls it shorting only when t is below −1.80, a spot honest restaurants reach fewer than 5 times in 100.',
   ap:'One-sample t-test, Hₐ: μ < 4.1, df = 11. Reject H₀ when p < 0.05, which is the same as t < −1.796, or as 4.1 oz lying above the 90% confidence interval.'},
  compare(sim,g,m){const S=st(sim),same=g.call===m.call,diff=g.tot-m.tot;
   const world=`Picture 100 restaurants: 50 honest and 50 that short every box by ${oz(DSHORT)}.`,fair5=` In this picture (cheaters shorting by ${oz(DSHORT)}), the 5% rule is the best possible standard. Against other cheat sizes a different cutoff could make fewer total mistakes, but the 5% rule always keeps false accusations to about 5 in 100 honest restaurants.`;
   const tr=` The truth here: ${truthWords(S)}.`+(testShort(S)&&S.short<0.005?' This is one of the honest restaurants that looks guilty by luck. A 5% test wrongly accuses about 5 in 100 honest restaurants, and that is the price of the rule.':(!testShort(S)&&S.short>=0.005?' The test missed it this time: 12 boxes cannot always reveal a small shortfall. Not enough evidence is not proof of honesty.':''));
   if(same)return `Your gut made the same call as the test. ${world} Used as a rule, the most generous version of your gut is the 5% test itself: about <b>${f1(m.tot)} wrong calls per 100</b> (${f1(m.fa)} honest restaurants accused, ${f1(m.miss)} cheaters missed). Your instinct is already weighing the gap against the scoop-to-scoop wobble.`+fair5+tr;
   const rule=g.call==='short'?'call it shorting whenever the average is at least this far under, measured against how much the boxes vary':'shrug off an average this far under, and call it shorting only when it is further under, measured against how much the boxes vary';
   return `${world} Your gut’s standard (${rule}) makes about <b>${f1(g.tot)} wrong calls per 100</b>: ${f1(g.fa)} honest restaurants accused and ${f1(g.miss)} cheaters missed. The 5% test makes ${f1(m.tot)}. That is <b>${f1(diff)} fewer wrong calls per 100 restaurants</b>.`+fair5+tr;},
  again(sim){const seed=Math.floor(Math.random()*1e9);sim.st=gen(seed,Math.random()<0.5?0:+(0.05+0.35*Math.random()).toFixed(2),0);sim.p.call='short';sim.p.peek=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'An honest restaurant puts exactly 4.1 oz in its boxes on average. You weigh 12 boxes. About how often will your 12-box average come out under 4.1 oz?',choices:['Almost never','About half the time','Every time'],correct:1,explain:'Honest boxes scatter on both sides of 4.1 oz, so the average lands a little under about half the time and a little over the other half. An average under the label, by itself, proves nothing.'},
  {lvl:'bio',instant:true,q:'Two groups each find a 12-box average 0.15 oz under the label. Group A’s boxes all weigh within 0.1 oz of each other. Group B’s boxes swing from 3.5 to 4.6 oz. Which group has stronger evidence of shorting?',choices:['Group A','Group B','Both the same: the gap is the same'],correct:0,explain:'Same gap, but Group A’s boxes barely vary, so their average barely wobbles. A 0.15 oz gap is huge next to a tiny wobble and ordinary next to a big one.'},
  {lvl:'honors',instant:true,q:'Your 12 boxes: x̄ = 3.98 oz, s = 0.24 oz. What is t?',choices:['−1.73','−0.50','−0.12','−6.00'],correct:0,explain:'s/√12 = 0.24 ÷ 3.464 = 0.0693 oz. t = (3.98 − 4.1) ÷ 0.0693 = −1.73: your average is 1.73 standard errors under the listing. That is just short of the −1.80 cutoff.'},
  {lvl:'honors',instant:true,q:'You weigh 48 boxes instead of 12 and get the same average (3.98 oz) and the same spread (s = 0.24 oz). What happens to t?',choices:['It stays the same','It doubles in size, to about −3.46','It is cut in half'],correct:1,explain:'The standard error is s/√n. Four times the boxes makes √n twice as big, so the wobble halves and t doubles: −0.12 ÷ (0.24/√48) = −3.46. More data makes the same gap more convincing.'},
  {lvl:'ap',instant:true,q:'Your test gives p = 0.03. Which conclusion is correct at α = 0.05?',choices:['Reject H₀: there is convincing evidence that the true mean weight is less than 4.1 oz','There is a 3% chance the restaurant is honest','Accept H₀: the restaurant is honest','The test proves the restaurant is shorting every box'],correct:0,explain:'p is the chance of an average this low or lower if μ = 4.1, not the chance that H₀ is true. Since 0.03 < 0.05, you reject H₀ and conclude there is convincing evidence that μ < 4.1 oz. A test never proves anything with certainty.'},
  {lvl:'ap',instant:true,q:'Your 90% confidence interval for μ is 3.92 to 4.08 oz. What does the one-sided test of H₀: μ = 4.1 vs. Hₐ: μ < 4.1 at α = 0.05 conclude?',choices:['Reject H₀: 4.1 lies above the whole interval','Fail to reject: 4.1 is close to the interval','You need a 95% interval to decide'],correct:0,explain:'A one-sided 5% test matches a 90% interval: 5% in each tail. Every plausible value of μ in the interval is below 4.1, so the data give convincing evidence that μ < 4.1.'}
 ],
 tour:[
  {title:'Your 12 boxes',text:'Each blue dot is one box of fries you weighed on a kitchen scale, after zeroing it with an empty box. The dashed line is the 4.1 oz the menu lists.',focus:[[0,0,800,224]],pause:true,setup:sim=>BioLab.setValues(sim,{peek:false})},
  {title:'The average is a little light',text:`Your boxes average ${oz(D.mean)}: ${oz(LW-D.mean)} under the listing. But hand-scooped boxes vary a lot. Would an honest restaurant ever come out this light?`,focus:[[0,60,800,166]],pause:true},
  {title:'100 honest restaurants',text:'The bottom panel imagines 100 honest restaurants whose boxes vary as much as yours. Each dot is one of their 12-box averages. Even honest averages spread out, just from luck in the scooping.',focus:[[0,226,800,224]],pause:true},
  {title:'How light is too light?',text:`${D.cnt} of those 100 honest restaurants came out as light as yours or lighter (the red dots). Boxes like yours are not rare for an honest restaurant, so luck could explain them.`,focus:[[0,226,800,224]],pause:true},
  {lvl:'honors',title:'The test statistic in plain words',text:`The typical wobble of a 12-box average is s/√12 = ${f3(D.se)} oz, called the standard error. Your average sits ${f2(-D.t)} wobbles under 4.1 oz, so t = ${f2(D.t)}. The test only blames the restaurant when t is below −1.80.`,focus:[[0,280,800,70]],pause:true,setup:sim=>BioLab.setValues(sim,{wob:true})},
  {title:'The 5% rule',text:'Statistics makes the call with a rule: say “shorting” only if honest restaurants come out this light fewer than 5 times in 100. Here that does not happen, so the test says there is not enough evidence. That is not the same as proving they are honest.',pause:true},
  {lvl:'ap',title:'The formal test',text:`H₀: μ = 4.1, Hₐ: μ < 4.1. Conditions: we treat the 12 boxes as a random sample of this restaurant’s boxes, the 12 are less than 10% of all boxes, and the dot plot shows no strong skew or outliers. t = ${f2(D.t)}, df = 11, p = ${f3(D.p)}. Since p > 0.05, fail to reject H₀. The 90% interval, ${f2(D.lo)} to ${f2(D.hi)} oz, contains 4.1.`,pause:true,setup:sim=>BioLab.setValues(sim,{ci:true}),focus:[[0,0,800,224]]},
  {title:'Why use a rule instead of a hunch',text:`Picture 100 restaurants: 50 honest and 50 that short every box by ${oz(DSHORT)}. The 5% rule makes about ${f1(WT.tot)} wrong calls per 100. In this picture (cheaters shorting by ${oz(DSHORT)}), the 5% rule is the best possible standard. Against other cheat sizes a different cutoff could make fewer total mistakes, but the 5% rule always keeps false accusations to about 5 in 100 honest restaurants. Lock in your own call and the tool shows how your gut’s standard compares.`,pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How often does an honest restaurant look guilty?</p><ol><li>Press <b>New restaurant</b> until <b>Show the truth</b> says honest (turn it on to check).</li><li>Record the number in <b>Honest restaurants (of 100) this light or lighter</b>.</li><li>Repeat for 10 honest restaurants. How many of them had an average under 4.1 oz?</li></ol><p>Write one sentence: why is “the average is under the label” not enough to accuse a restaurant?</p>',
  honors:'<p><b>Question:</b> How big a shortfall can 12 boxes reliably catch?</p><ol><li>Turn on <b>Show the truth</b> and press <b>New restaurant</b> until you find a restaurant that is shorting.</li><li>Press <b>Weigh 12 new boxes here</b> ten times, recording t and the test’s verdict each time.</li><li>Repeat for a restaurant that shorts by a lot and one that shorts by a little.</li></ol><p>Explain, using the standard error, why small shortfalls slip past the test.</p>',
  ap:'<p><b>Question:</b> Is the restaurant shorting its boxes?</p><ol><li>State H₀ and Hₐ in words and symbols.</li><li>Check the conditions: random, 10%, and Normal/large sample (use the dot plot).</li><li>Compute t, df and the p-value, and the 90% confidence interval.</li><li>Press <b>Weigh 12 new boxes here</b> and redo it. Do the two samples agree?</li></ol><p><b>CER:</b> Claim, evidence (t, p and the interval) and reasoning in context, including what a Type I and a Type II error would mean here.</p>'},
 terms:[
  {t:'Normal variation',d:'The box-to-box differences that happen even at an honest restaurant, because fries are scooped by hand.'},
  {t:'Standard error',d:'s/√n: how much a sample average typically wobbles from one sample to the next. Here it is the wobble of a 12-box average.',lvl:'honors'},
  {t:'Test statistic t',d:'(x̄ − 4.1)/(s/√n): how many standard errors the sample average sits from the listed weight.',lvl:'honors'},
  {t:'p-value',d:'If the restaurant is honest (μ = 4.1), the probability of a sample average this low or lower. It is not the probability that the restaurant is honest.',lvl:'ap'},
  {t:'Type I and Type II error',d:'Type I: accusing an honest restaurant. Type II: missing a restaurant that really is shorting. A 5% test keeps Type I errors to 5% of honest restaurants.',lvl:'ap'},
  {t:'Confidence interval',d:'x̄ ± t*·s/√n: the plausible values of μ. A 90% interval matches a one-sided test at α = 0.05.',lvl:'ap'}
 ],
 about:`<p>The restaurant, its fries and the listed 4.1 oz are made up. Each box weight is modeled as Normal around 4.1 oz minus the restaurant’s true shortfall, with a box-to-box standard deviation of 0.24 oz (an assumption for illustration) and a kitchen scale that rounds to 0.05 oz. A new restaurant is honest half the time; otherwise it shorts each box by a random 0.05 to 0.40 oz.</p><p><b>100 honest restaurants</b> are simulated with your boxes’ own spread s, so their count of averages at or below yours is close to, but not exactly, the t-test’s p-value. The test itself is the one-sample t-test with df = 11 (cutoff t = −1.796 at α = 0.05, one-sided).</p><p><b>Wrong calls per 100</b> are computed exactly from the t distribution (honest restaurants) and the noncentral t distribution (cheaters) for 50 honest restaurants and 50 that short every box by ${oz(DSHORT)}. That shortfall is chosen on purpose: it is the size of cheat for which the 5% cutoff is the best possible standard, so the two kinds of mistakes balance there. Against smaller cheats a looser standard would make fewer total wrong calls, but it would accuse more honest restaurants; the 5% level is a promise to accuse no more than about 5 in 100 honest ones. Your gut’s standard is scored generously: we use the most forgiving rule that still matches your call on these boxes, and if your call matches the test, it scores the same as the test.</p><p>This is a statistics model, not advice. If you think a restaurant is shorting you, the fair first step is to talk to the manager.</p>`
};
SIM._core={gen,wrong,score,TC,DEL,DSHORT,WT,D};
BioLab.register(SIM);
})();
