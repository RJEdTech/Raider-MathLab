(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,atLeast,fmtNum,rng}=BioLab.h;
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

/* A made-up game. Posted odds for one crate: Common 60%, Rare 28%, Epic 10%, Legendary 2%. 400 logged openings. */
const NAMES=['Common','Rare','Epic','Legendary'],P0=[0.60,0.28,0.10,0.02],N=400,EXP=P0.map(p=>Math.round(p*N)),DF=3,NSIM=100,DEF_SEED=135;
const XC=chiinv(0.95,DF);                       /* 5% cutoff for chi-square, df 3: 7.815 */
const LAM=tuneX(DF,XC);                         /* rigging size (noncentrality) where that cutoff is the best possible standard */
const SUMSQ=0.12*0.12/0.60+0.10*0.10/0.10+0.02*0.02/0.02; /* Σ(Δp)²/p for a full cut, per unit f² */
const FSTAR=Math.sqrt(LAM/(N*SUMSQ));          /* share of Epic and Legendary drops quietly removed in the model's rigged games */
/* A rigged crate removes a share f of the Epic and Legendary chances and gives it to Common. */
const probs=f=>[0.60+0.12*f,0.28,0.10*(1-f),0.02*(1-f)];
const PSTAR=probs(FSTAR);
function wrong(c){const fa=50*(1-chicdf(c,DF)),miss=50*ncxcdf(c,DF,LAM);return {fa,miss,tot:fa+miss,c};}
const WT=wrong(XC);
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2),f3=v=>fmtNum(v,3),pc=v=>fmtNum(100*v,1)+'%';
const pfmt=p=>p<0.001?'less than 0.001':f3(p);
const chi=c=>c.reduce((s,o,i)=>s+(o-EXP[i])*(o-EXP[i])/EXP[i],0);
function open400(r,p){const c=[0,0,0,0];for(let i=0;i<N;i++){let u=r(),j=0;while(j<3&&u>=p[j]){u-=p[j];j++;}c[j]++;}return c;}
function gen(seed,f,draw){const r=rng((seed+7919*(draw||0))|0),c=open400(r,probs(f)),x=chi(c),p=1-chicdf(x,DF);
 const r2=rng((seed*31+17+101*(draw||0))|0),sims=[];for(let j=0;j<NSIM;j++)sims.push(chi(open400(r2,P0)));
 const cnt=sims.filter(v=>v>=x-1e-9).length;
 return {seed,f,draw:draw||0,c,x,p,sims,cnt,parts:c.map((o,i)=>(o-EXP[i])*(o-EXP[i])/EXP[i])};}
const D=gen(DEF_SEED,0,0);
const st=sim=>sim.st;
const testRig=S=>S.p<0.05;
function score(S,call){const u=S.x,c=call==='rig'?(u>=XC?XC:u):(u<XC?XC:u),w=wrong(c);return Object.assign({call,v:w.tot},w);}
const CALL={rig:'“The drop rates are rigged”',fair:'“The drop rates look honest”'};
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const shown=sim=>!!((sim.tour&&sim.tour.on)||(sim.st&&sim.st.shown)||(sim.gutS&&sim.gutS.g));
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const showTruth=sim=>!!(sim.p.peek||(GS(sim)&&GS(sim).m));
const newF=()=>Math.random()<0.5?0:+(0.2+0.5*Math.random()).toFixed(2);
function fit(ctx,s,x,y,o,left){ctx.font=(o.w||400)+' '+(o.s||13)+'px '+FONT;const w=ctx.measureText(s).width;let a=left?'right':'left',xx=left?x-8:x+8;
 if(left&&xx-w<6){a='left';xx=Math.max(6,x+8);if(xx+w>794)xx=6;}else if(!left&&xx+w>794){a='right';xx=Math.min(794,x-8);if(xx-w<6){a='left';xx=6;}}
 txt(ctx,s,xx,y,Object.assign({},o,{a}));}
const COL=['#7a7f88','#3f6fb0','#7b4fb0','#c08a12'];

/* drawing frame */
const BASE=178,H_LO=0,H_HI=20,BY=414;
const XH=v=>60+(clamp(v,H_LO,H_HI)-H_LO)/(H_HI-H_LO)*710;

const HIDDEN=S=>`You got <b>${S.c[3]} Legendaries</b> (8 expected) and <b>${S.c[2]} Epics</b> (40 expected). <b>Honest odds, or rigged?</b> Make your call, then lock it in to see the test.`;
const SIM={
 id:'lootdrop',hash:'lootdrop',apUnit:15,order:5,tab:'Is the drop rate honest?',kind:'Simulation',
 card:'Log 400 loot-crate openings, call the posted odds honest or rigged by feel, then run a chi-square goodness-of-fit test.',
 title:'Are the loot-crate odds honest?',
 lede:{bio:'A game posts the odds for its crate: Common 60%, Rare 28%, Epic 10%, Legendary 2%. In 400 openings you expect 240, 112, 40 and 8. Real counts always wander a little from those. How far off is too far off to blame luck?',
  honors:'The chi-square statistic χ² = Σ (observed − expected)²/expected adds up how far each count is from what the posted odds predict. Dividing by the expected count makes a gap of 4 Legendaries count far more than a gap of 4 Commons.',
  ap:'Chi-square goodness-of-fit test. H₀: the posted odds are correct (p_C = 0.60, p_R = 0.28, p_E = 0.10, p_L = 0.02). Hₐ: at least one is wrong. df = 4 − 1 = 3; reject H₀ at α = 0.05 when χ² > 7.815. Condition: every expected count is at least 5.'},
 scale:'Top: your 400 openings by rarity (bars) next to the counts the posted odds predict (outlines). Epic and Legendary are zoomed in. Bottom: how-far-off scores for 100 simulated honest games. The game and its odds are made up.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your call',
 controls:[
  {id:'call',label:'Your call',type:'seg',def:'rig',options:[{v:'rig',l:'The drop rates are rigged'},{v:'fair',l:'The drop rates look honest'}]},
  {id:'peek',label:'Show the truth',type:'toggle',def:false,help:'The tool knows whether this game quietly lowers Epic and Legendary drops. Peek only after you call it.'},
  {id:'parts',label:'Show each rarity’s part of the score',type:'toggle',def:true,lvl:'honors'}
 ],
 actions:[
  {id:'show',label:'Skip my call and show the test',run(sim){sim.st.shown=true;}},
  {id:'newg',label:'New game',primary:true,run(sim){sim.st=gen(Math.floor(Math.random()*1e9),newF(),0);BioLab.setValues(sim,{peek:false});clearGut(sim);}},
  {id:'more',label:'Log 400 new openings',lvl:'honors',run(sim){const S=st(sim);sim.st=gen(S.seed,S.f,S.draw+1);clearGut(sim);}}
 ],
 init(){return gen(DEF_SEED,0,0);},step(){},
 metrics:[
  {id:'leg',label:'Legendaries in 400 (8 expected)',unit:'',d:0,min:0,max:20,get:sim=>st(sim).c[3]},
  {id:'epic',label:'Epics in 400 (40 expected)',unit:'',d:0,min:0,max:80,get:sim=>st(sim).c[2]},
  {id:'off',label:'How-far-off score (χ²)',unit:'',d:2,min:0,max:30,get:sim=>st(sim).x},
  {id:'honest',label:'Honest games (of 100) this far off or farther',unit:'',d:0,min:0,max:100,get:sim=>shown(sim)?(st(sim).cnt):null},
  {id:'df',label:'Degrees of freedom',unit:'',d:0,lvl:'honors',min:0,max:3,get:()=>DF},
  {id:'p',label:'p-value (df = 3)',unit:'',d:3,lvl:'ap',min:0,max:1,get:sim=>shown(sim)?(st(sim).p):null},
  {id:'cond',label:'Large counts condition',text:true,lvl:'ap',get:()=>'Smallest expected count is 8, at least 5: met'},
  {id:'verdict',label:'The 5% test says',text:true,lvl:'honors',get:sim=>shown(sim)?(testRig(st(sim))?'Does not match the posted odds':'Not enough evidence against the posted odds'):null}
 ],
 graphs:[{id:'calls',label:'Wrong calls per 100 games',custom:true}],defaultGraph:'calls',
 plot(sim,ctx,box){const G=GS(sim),cols=[{n:'The 5% test',w:WT}];
  if(G&&G.g)cols.unshift({n:'Your gut’s standard',w:G.g});
  const ymax=Math.max(10,Math.ceil(Math.max(...cols.map(c=>c.w.tot))/10)*10);
  const ax=axes(ctx,box,{xmin:0,xmax:cols.length,ymin:0,ymax,xcats:cols.map(c=>c.n),yl:'Wrong calls per 100'});
  cols.forEach((c,i)=>{const x0=ax.X(i+0.3),x1=ax.X(i+0.7),y0=ax.Y(0),y1=ax.Y(c.w.fa),y2=ax.Y(c.w.tot);
   ctx.fillStyle=PAL['s1'];ctx.fillRect(x0,y1,x1-x0,y0-y1);ctx.fillStyle=PAL['s4'];ctx.fillRect(x0,y2,x1-x0,y1-y2);
   txt(ctx,f1(c.w.tot),(x0+x1)/2,y2-6,{s:13,w:700,c:PAL['fg'],a:'center'});});
  txt(ctx,'Red: honest games called rigged',box.L+12,box.T+12,{s:12,c:PAL['s1'],w:700});
  txt(ctx,`Amber: rigged games missed (Epic ${pc(PSTAR[2])}, Legendary ${pc(PSTAR[3])})`,box.L+12,box.T+30,{s:12,c:PAL['s4'],w:700});
  if(!(G&&G.g))txt(ctx,'Lock in your gut call to add your bar.',box.L+box.W-8,box.T+12,{s:12,c:PAL['muted'],a:'right'});},
 draw(sim,ctx,vdt,k){const S=st(sim),G=GS(sim),hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,244,800,206);
  txt(ctx,'Your 400 openings (Epic and Legendary zoomed in)',20,24,{s:14*k,w:700});
  /* two bar panels: Common and Rare on a 0 to 300 scale, Epic and Legendary zoomed to 0 to 70 */
  const panels=[{ids:[0,1],x0:60,x1:370,max:300,lab:''},{ids:[2,3],x0:450,x1:760,max:70,lab:''}];
  panels.forEach(pn=>{ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pn.x0,BASE);ctx.lineTo(pn.x1,BASE);ctx.stroke();
   if(pn.lab)txt(ctx,pn.lab+' (scale 0 to '+pn.max+')',pn.x0,52,{s:12*k,c:PAL['cv-soft']});
   const H=110,Y=v=>BASE-Math.min(v,pn.max)/pn.max*H,w=(pn.x1-pn.x0)/2;
   pn.ids.forEach((id,j)=>{const cx=pn.x0+w*(j+0.5),bw=Math.min(70,w*0.5),o=S.c[id],e=EXP[id];
    ctx.fillStyle=COL[id];ctx.fillRect(cx-bw/2,Y(o),bw,BASE-Y(o));
    ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.strokeRect(cx-bw/2-4,Y(e),bw+8,BASE-Y(e));ctx.setLineDash([]);
    txt(ctx,String(o),cx,Math.min(Y(o),Y(e))-7,{s:14*k,w:700,a:'center'});
    txt(ctx,NAMES[id],cx,BASE+16*k,{s:12*k,w:700,c:PAL['cv-ink'],a:'center'});
    const sub=hon&&sim.p.parts?`part: ${f2(S.parts[id])}`:`expected ${e}`;txt(ctx,sub,cx,BASE+31*k,{s:12*k,c:hon&&sim.p.parts?PAL['s5']:PAL['cv-soft'],a:'center'});});});
  /* pills */
  let py=20;const pr=(s,bg)=>{ctx.font='700 '+(12*Math.min(k,1.3))+'px '+FONT;const w=ctx.measureText(s).width+14*Math.min(k,1.3);pill(ctx,s,790-w/2,py,bg,'#fff',12*Math.min(k,1.3));py+=26*Math.min(k,1.3);};
  if(G&&G.g)pr('Your gut: '+(G.g.call==='rig'?'rigged':'honest'),'#a0640a');
  if(G&&G.m)pr('The test: '+(testRig(S)?'does not match':'not enough evidence'),'#2f6b3a');
  if(showTruth(sim))pr('Truth: '+(S.f<0.005?'honest odds':`Epic ${pc(probs(S.f)[2])}, Legendary ${pc(probs(S.f)[3])}`),'#5b4a8a');
  /* honest games */
  txt(ctx,hon?'Chi-square scores of 100 simulated honest games':'How-far-off scores of 100 simulated honest games',20,266,{s:13*k,w:700});
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(60,BY);ctx.lineTo(770,BY);ctx.stroke();
  for(let v=H_LO;v<=H_HI;v+=(k>1.3?4:2)){const x=XH(v);ctx.beginPath();ctx.moveTo(x,BY);ctx.lineTo(x,BY+5);ctx.stroke();txt(ctx,String(v),x,BY+18*k,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  if(!shown(sim)){fit(ctx,'Make your call and lock it in to see this test.',60,340,{s:13*k,w:700,c:PAL['cv-soft']},false);}
  else{
  const r=3.6,cols={};S.sims.forEach(v=>{const b=Math.round(clamp(v,H_LO,H_HI)/0.25),n=cols[b]||0;cols[b]=n+1;const x=XH(b*0.25),y=BY-r-1-n*(2*r+0.4);const hit=v>=S.x-1e-9;
   ctx.fillStyle=hit?PAL['s1']:PAL['cv-soft'];ctx.globalAlpha=hit?1:0.7;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.globalAlpha=1;});
  if(hon){const xc=XH(XC);ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(xc,266+50*k);ctx.lineTo(xc,BY);ctx.stroke();ctx.setLineDash([]);
   fit(ctx,'5% cutoff 7.81',xc,266+48*k,{s:12*k,w:700,c:PAL['s5']},false);}
  const xs=XH(S.x);ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(xs,266+28*k);ctx.lineTo(xs,BY);ctx.stroke();
  fit(ctx,`Your score ${f2(S.x)}: ${S.cnt} of 100 honest games were this far off or farther`,xs,266+24*k,{s:13*k,w:700,c:PAL['s1']},S.x>10);
  if(S.x>H_HI)fit(ctx,'Your score is off this scale, to the right',770,266+70*k,{s:12*k,c:PAL['rj']},true);
  }
 },
 narrate(sim){if(!shown(sim))return HIDDEN(st(sim));const S=st(sim),c=S.c;
  const base=`You got <b>${c[3]} Legendaries</b> (8 expected) and <b>${c[2]} Epics</b> (40 expected). `;
  if(atLeast('honors'))return base+`χ² = ${f2(S.x)} with df = 3. <b>${testRig(S)?'Honest games almost never land this far off, so the test says the counts do not match the posted odds.':'Honest games land this far off often enough that luck could explain it.'}</b>`;
  return base+`Your how-far-off score is ${f2(S.x)}, and ${S.cnt} of 100 honest games were this far off or farther. <b>${S.cnt<5?'Luck almost never does that.':S.cnt<20?'Luck does that now and then.':'Luck does that all the time.'}</b>`;},
 gut:{better:'lower',controls:['call'],lockLabel:'Lock in my call',
  ask:{bio:'Compare your bars with the dashed outlines, the counts the posted odds predict. Pick one here: is the game honest about its odds, or rigged? Go with your gut, then lock it in.',
   honors:'Before you look at χ²: pick one here. Honest, or rigged? Then lock it in.'},
  lock(sim){const S=st(sim),g=score(S,sim.p.call);g.label=CALL[sim.p.call];return g;},
  solve(sim){const S=st(sim),c=testRig(S)?'rig':'fair';sim.p.call=c;const m=score(S,c);
   m.label=(c==='rig'?'“These counts do not match the posted odds”':'“Not enough evidence: luck could explain these counts”')+(atLeast('honors')?` (χ² = ${f2(S.x)}, p = ${pfmt(S.p)})`:` (${S.cnt} of 100 honest games were this far off)`);return m;},
  how:{bio:'The math turns all four gaps into one how-far-off score: for each rarity, square the gap and divide by the count you expected, then add them up. Then it asks how often an honest game scores that high just by luck. Fewer than 5 times in 100 means the odds do not match.',
   honors:'χ² = Σ (O − E)²/E over the four rarities. Honest games’ scores follow a chi-square distribution with 3 degrees of freedom, and only 5 in 100 land above 7.81.',
   ap:'Chi-square goodness-of-fit test, df = 3, all expected counts at least 5. Reject H₀ (the posted odds) when χ² > 7.815, the same as p < 0.05.'},
  compare(sim,g,m){const S=st(sim),same=g.call===m.call,diff=g.tot-m.tot;
   const world=`Picture 100 games: 50 with honest odds and 50 that quietly cut Epic to ${pc(PSTAR[2])} and Legendary to ${pc(PSTAR[3])}.`,fair5=` In this picture (Epic cut to ${pc(PSTAR[2])}, Legendary to ${pc(PSTAR[3])}), the 5% rule is the best possible standard. Against other cuts a different cutoff could make fewer total mistakes, but the 5% rule always keeps false accusations to about 5 in 100 honest games.`;
   const tr=' The truth here: '+(S.f<0.005?'this game’s odds are honest.':`this game cut Epic to ${pc(probs(S.f)[2])} and Legendary to ${pc(probs(S.f)[3])}.`)+(testRig(S)&&S.f<0.005?' This is one of the honest games that looks off by luck. A 5% test wrongly flags about 5 in 100 honest games.':(!testRig(S)&&S.f>=0.005?' The test missed it here: in 400 openings, a modest cut can hide in the luck of the draw. Not enough evidence is not proof of honesty.':''));
   if(same)return `Your gut made the same call as the test. ${world} Used as a rule, the most generous version of your gut is the 5% test itself: about <b>${f1(m.tot)} wrong calls per 100 games</b> (${f1(m.fa)} honest games called rigged, ${f1(m.miss)} rigged games missed).`+fair5+tr;
   const rule=g.call==='rig'?'call it rigged whenever the counts are at least this far off':'call counts this far off luck, and only call it rigged when they are farther off';
   return `${world} Your gut’s standard (${rule}) makes about <b>${f1(g.tot)} wrong calls per 100 games</b>: ${f1(g.fa)} honest games called rigged and ${f1(g.miss)} rigged games missed. The 5% test makes ${f1(m.tot)}. That is <b>${f1(diff)} fewer wrong calls per 100 games</b>.`+fair5+tr;},
  again(sim){sim.st=gen(Math.floor(Math.random()*1e9),newF(),0);sim.p.call='rig';sim.p.peek=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The odds say 2% Legendary, so 8 in 400 openings. You got 4: half what you expected. Is that strong evidence the game is rigged?',choices:['Yes: getting half is way too few','Not by itself: with only 8 expected, counts of 4 or fewer happen about 1 time in 10 by luck','No: Legendary counts can never be off'],correct:1,explain:'Rare items have small counts, and small counts bounce around a lot. With a true 2% chance, about 1 in 10 groups of 400 openings gets 4 or fewer Legendaries. You need to look at how far off all the counts are together.'},
  {lvl:'bio',instant:true,q:'Which gap is more surprising: 10 more Commons than expected (250 instead of 240), or 10 more Epics than expected (50 instead of 40)?',choices:['The 10 extra Commons','The 10 extra Epics','They are equally surprising'],correct:1,explain:'Ten is a small gap next to 240 but a big gap next to 40. That is why the score divides each squared gap by the expected count: 10²/240 = 0.42, but 10²/40 = 2.5.'},
  {lvl:'honors',instant:true,q:'Counts 236, 120, 36, 8 against expected 240, 112, 40, 8. What is χ²?',choices:['About 1.04','About 4.0','About 16','About 0.10'],correct:0,explain:'(236 − 240)²/240 + (120 − 112)²/112 + (36 − 40)²/40 + (8 − 8)²/8 = 0.067 + 0.571 + 0.400 + 0 = 1.04. That is a very ordinary score for an honest game.'},
  {lvl:'honors',instant:true,q:'Why are there 3 degrees of freedom with 4 rarities?',choices:['Once three counts are known, the fourth is fixed because the counts must add to 400','Because Legendary does not count','Because df is always 3 for chi-square'],correct:0,explain:'The four counts must total 400, so only three of them are free to vary. df = number of categories − 1 = 3.'},
  {lvl:'ap',instant:true,q:'χ² = 9.4 with df = 3. What is the conclusion at α = 0.05?',choices:['Reject H₀: p ≈ 0.024, convincing evidence that at least one posted probability is wrong','Reject H₀: the Legendary rate is lower than 2%','Fail to reject H₀: p ≈ 0.24','Accept H₀: the odds are correct'],correct:0,explain:'P(χ²₃ ≥ 9.4) ≈ 0.024 < 0.05, so reject H₀. A goodness-of-fit test only says the whole set of odds does not fit. To see which rarity is off, look at the biggest parts of the score, then confirm with new data.'},
  {lvl:'ap',instant:true,q:'You only logged 200 openings. What goes wrong with the chi-square test?',choices:['The expected Legendary count is 4, below 5, so the chi-square approximation is not trustworthy','Nothing: chi-square works for any sample size','df changes to 199'],correct:0,explain:'2% of 200 is 4 expected Legendaries. The large counts condition needs every expected count to be at least 5. Log more openings, or combine Epic and Legendary into one category.'}
 ],
 tour:[
  {title:'What the posted odds predict',text:'The dashed outlines show what the posted odds predict in 400 openings: 240 Common, 112 Rare, 40 Epic and 8 Legendary. Epic and Legendary are zoomed in on the right so you can see them.',focus:[[0,30,800,212]],pause:true,setup:sim=>BioLab.setValues(sim,{peek:false})},
  {title:'What you actually got',text:`The bars are your log: ${D.c.join(', ')}. Only ${D.c[3]} Legendaries, half of the 8 expected. It feels rigged. But counts always wander from the prediction, and small counts wander the most.`,focus:[[0,30,800,212]],pause:true},
  {title:'One how-far-off score',text:`For each rarity, square the gap and divide by the expected count, then add up. Dividing by the expected count makes a gap in a rare item count for more. Your score is ${f2(D.x)}.`,pause:true},
  {title:'100 honest games',text:`The bottom panel shows the scores of 100 simulated honest games, each with 400 openings. ${D.cnt} of them were as far off as yours or farther, so a score like yours is ordinary for an honest game.`,focus:[[0,244,800,206]],pause:true},
  {lvl:'honors',title:'The chi-square statistic',text:`The how-far-off score is the chi-square statistic, χ² = Σ (O − E)²/E. Each rarity’s part is shown under its bar. With 4 rarities there are 3 degrees of freedom, and honest games pass 7.81 only 5 times in 100.`,pause:true,setup:sim=>BioLab.setValues(sim,{parts:true})},
  {lvl:'ap',title:'The formal test',text:`H₀: the posted odds are correct. Hₐ: at least one is wrong. Condition: every expected count is at least 5 (the smallest is 8). χ² = ${f2(D.x)}, df = 3, p = ${f3(D.p)}. Since p > 0.05, fail to reject H₀: no convincing evidence the odds are wrong.`,pause:true},
  {title:'Why use a rule instead of a hunch',text:`Picture 100 games: 50 honest, and 50 that quietly cut Epic to ${pc(PSTAR[2])} and Legendary to ${pc(PSTAR[3])}. The 5% rule makes about ${f1(WT.tot)} wrong calls per 100 games. In this picture (Epic cut to ${pc(PSTAR[2])}, Legendary to ${pc(PSTAR[3])}), the 5% rule is the best possible standard. Against other cuts a different cutoff could make fewer total mistakes, but the 5% rule always keeps false accusations to about 5 in 100 honest games. Lock in your own call and the tool shows how your gut’s standard compares.`,pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How far off do honest games get?</p><ol><li>Turn on <b>Show the truth</b> and press <b>New game</b> until you find an honest one.</li><li>Record the Legendary count and the how-far-off score.</li><li>Repeat for 10 honest games. What was the fewest Legendaries an honest game gave?</li></ol><p>Write one sentence: why is “we got fewer Legendaries than expected” not enough to say a game is rigged?</p>',
  honors:'<p><b>Question:</b> How big a cut can 400 openings reliably detect?</p><ol><li>Turn on <b>Show the truth</b> and find a rigged game.</li><li>Press <b>Log 400 new openings</b> ten times, recording χ² and the test’s verdict.</li><li>Compare a game with a small cut and one with a big cut.</li></ol><p>Which rarity contributes most to χ² when a game is rigged? Why?</p>',
  ap:'<p><b>Question:</b> Do the counts match the posted odds?</p><ol><li>State H₀ and Hₐ.</li><li>Check conditions: random openings, and every expected count at least 5.</li><li>Compute each (O − E)²/E, χ², df and the p-value.</li><li>Press <b>Log 400 new openings</b> and redo it.</li></ol><p><b>CER:</b> Claim, evidence and reasoning in context. If you reject H₀, which rarity is most out of line? If you fail to reject, does that prove the odds are honest?</p>'},
 terms:[
  {t:'Expected count',d:'What the posted odds predict: probability × number of openings. 2% of 400 is 8 Legendaries.'},
  {t:'How-far-off score',d:'For each category, (observed − expected)² ÷ expected, added up. Statisticians call it the chi-square statistic.'},
  {t:'Chi-square statistic χ²',d:'Σ (O − E)²/E. Large values mean the counts are far from what the claimed probabilities predict.',lvl:'honors'},
  {t:'Degrees of freedom',d:'For a goodness-of-fit test, the number of categories minus 1. Here 4 − 1 = 3.',lvl:'honors'},
  {t:'Goodness-of-fit test',d:'Tests whether one categorical variable’s distribution matches a claimed set of probabilities. Conditions: random, and every expected count at least 5.',lvl:'ap'}
 ],
 about:`<p>The game, its crate and its odds are made up. Each opening is an independent random draw with the game’s true chances. A new game is honest half the time; otherwise it quietly removes a random 20% to 70% of the Epic and Legendary chances and gives them to Common.</p><p><b>100 honest games</b> are simulated with the posted odds, 400 openings each; their share at or above your score is close to, but not exactly, the test’s p-value. <b>The test</b> is the chi-square goodness-of-fit test with df = 3 (cutoff 7.815 at α = 0.05), which uses the chi-square approximation; every expected count here is at least 8.</p><p><b>Wrong calls per 100</b> are computed from the chi-square distribution (honest games) and the noncentral chi-square approximation (rigged games) for 50 honest games and 50 that cut Epic to ${pc(PSTAR[2])} and Legendary to ${pc(PSTAR[3])}. That cut is chosen on purpose: it is the size of rigging for which the 5% cutoff is the best possible standard, so the two kinds of mistakes balance there. Against smaller cuts a looser standard would make fewer total wrong calls, but it would also accuse more honest games. Your gut’s standard is scored generously: the most forgiving rule that still matches your call on these counts, and the same score as the test if your call matches it.</p><p>This tool is a statistics model, not advice about any real game or about spending money on loot boxes.</p>`
};
SIM._core={gen,wrong,score,XC,LAM,FSTAR,PSTAR,WT,D,probs};
BioLab.register(SIM);
})();
