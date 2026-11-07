(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Three screens a job application can hit before a human sees it.
   1. A keyword screener: score = sum of the weights of the posting's keywords found in the resume text it can read.
   2. A personality test: test score X and future job performance Y are standard normal with correlation r.
      The test passes the top `pass` share of applicants. "Future stars" are the top 20% on Y.
   3. Seven employers: k of them use the same test (one shared verdict); the rest screen independently.
      Each screen passes a share p. P(at least one interview) = 1 − (1 − p)^(8 − k) for k ≥ 1. */
const JOBS={
 lifeguard:{t:'Pool lifeguard',lines:[['Swim team, 3 seasons','Swimming: swim team, 3 yrs'],['Lifeguard training course','Lifeguard certification'],['Babysat for 2 families','Babysat for 2 families'],['Festival booth volunteer','Customer service: festival']],side:['CPR · First aid · Sat & Sun','CPR · First aid · Weekends'],
  kw:[['lifeguard certification',4,'r'],['CPR',3,'p',1],['first aid',3,'p',1],['swimming',2,'r'],['customer service',2,'r'],['weekends',1,'r',1],['teamwork',1,'n']]},
 grocery:{t:'Grocery clerk',lines:[['Stocked shelves, food pantry','Stocking: food pantry'],['Ran a car wash cash box','Cash handling: car wash'],['Bagged at a food drive','Bagging: food drive'],['Helped shoppers at a fair','Customer service: fair']],side:['Reliable · Free weekends','Reliable · Free weekends'],
  kw:[['customer service',3,'r'],['cash handling',3,'r'],['stocking',2,'r'],['weekends',2,'p',1],['food safety',2,'n'],['teamwork',2,'n'],['bagging',1,'r'],['reliable',1,'p',1]]},
 cafe:{t:'Cafe barista',lines:[['Made drinks, coffee cart','Barista: school coffee cart'],['Handled bake sale cash','Cash handling: bake sale'],['Snack bar at busy games','Fast-paced snack bar'],['Choir, 2 years','Choir, 2 years']],side:['Customer service · Mornings','Customer service · Mornings'],
  kw:[['barista',3,'r'],['customer service',3,'p',1],['cash handling',2,'r'],['mornings',2,'p',1],['fast-paced',2,'r'],['food safety',2,'n'],['teamwork',2,'n']]},
 camp:{t:'Day camp counselor',lines:[['Babysat for 3 families','Childcare: 3 families'],['Led games, reading club','Leadership: kids’ club'],['Coached youth soccer','Youth sports coach'],['Camped every summer','Outdoors: camping']],side:['First aid · CPR','First aid · CPR'],
  kw:[['childcare',3,'r'],['first aid',3,'p',1],['CPR',2,'p',1],['leadership',2,'r'],['youth sports',2,'r'],['lesson planning',2,'n'],['outdoors',1,'r'],['teamwork',1,'n']]}
};
const job=sim=>JOBS[sim.p.job]||JOBS.lifeguard;
const kcut=sim=>atLeast('honors')?sim.p.kcut:10;
/* found: 'yes' read and matched; 'hidden' matched but in the unreadable sidebar; 'words' you have it, in other words; 'no' */
function kwState(sim,w){const [,,has,side]=w;const hid=side&&sim.p.fancy;
 if(has==='p')return hid?'hidden':'yes';if(has==='r')return sim.p.coach?(hid?'hidden':'yes'):'words';return 'no';}
const kscore=sim=>job(sim).kw.reduce((a,w)=>a+(kwState(sim,w)==='yes'?w[1]:0),0);
const kmax=sim=>job(sim).kw.reduce((a,w)=>a+w[1],0);
/* normal distribution helpers */
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const Phi=x=>0.5*(1+erf(x/Math.SQRT2)),phi=x=>Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
function inv(p){let lo=-9,hi=9;for(let i=0;i<70;i++){const m=(lo+hi)/2;if(Phi(m)<p)lo=m;else hi=m;}return (lo+hi)/2;}
const S_STAR=inv(0.8);
/* P(X < c and Y > s) for standard normals with correlation r (Simpson's rule) */
function rejStar(r,pass){const c=inv(1-pass),q=Math.sqrt(Math.max(1e-9,1-r*r)),a=-8,n=600,h=(c-a)/n;let S=0;
 for(let i=0;i<=n;i++){const x=a+i*h,f=phi(x)*(1-Phi((S_STAR-r*x)/q));S+=f*(i===0||i===n?1:i%2?4:2);}return Math.max(0,S*h/3);}
const passOf=sim=>sim.p.pass/100;
const starsRej=sim=>rejStar(sim.p.r,passOf(sim))/0.2;
const starsHired=sim=>(0.2-rejStar(sim.p.r,passOf(sim)))/passOf(sim);
const starsInRejected=sim=>rejStar(sim.p.r,passOf(sim))/(1-passOf(sim));
/* seven employers */
const share=sim=>atLeast('honors')?sim.p.share:7;
const pAny=(p,k)=>1-Math.pow(1-p,8-k);
const tDiff=sim=>pAny(passOf(sim),1),tSame=sim=>pAny(passOf(sim),7),tNow=sim=>pAny(passOf(sim),share(sim));
function pOffer(sim,k){const p=passOf(sim),h=sim.p.h/100;return 1-((1-p)+p*Math.pow(1-h,k))*Math.pow(1-p*h,7-k);}
/* sample applicants for the scatter: fixed, so the picture is stable */
const PTS=(()=>{let s=20261107;const R=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
 const out=[];for(let i=0;i<200;i++){const u=Math.max(1e-9,R()),v=R(),w=Math.max(1e-9,R()),z=R();out.push([Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v),Math.sqrt(-2*Math.log(w))*Math.cos(2*Math.PI*z)]);}return out;})();
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const pend=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g&&!pend(sim)));
/* "Your turn": the complement rule for 7 different screens, as a percent. */
const calcAns=sim=>Math.round(1000*tDiff(sim))/10;
const fmt3=v=>(+v.toFixed(3)).toString();
const formulaLine=sim=>{const q=(1-passOf(sim)).toFixed(2).replace(/0$/,''),n=Math.pow(1-passOf(sim),7);return `Different screens: 1 − ${q}⁷ = 1 − ${fmt3(n)} = ${pc(1-n)}. Same test: ${p0(passOf(sim))}.`;};
const pc=v=>(100*v).toFixed(1)+'%',p0=v=>Math.round(100*v)+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function btxt(ctx,str,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(str).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.88;ctx.fillRect(x0-3,y-o.s*0.9,w+6,o.s*1.2);ctx.globalAlpha=1;txt(ctx,str,x,y,o);}
const gutOff=(sim,gd,gs)=>Math.abs(gd-100*tDiff(sim))+Math.abs(gs-100*tSame(sim));

function drawResume(sim,ctx,k,big){const J=job(sim),sc=kscore(sim),cut=kcut(sim),mx=kmax(sim);
 txt(ctx,(big?'':'Applying: ')+J.t,20,26*Math.min(k,1.3),{s:15*k,w:700});
 /* the resume */
 const L=20,W=360,T=44*Math.min(k,1.3),lh=(big?21:24)*k,fy=sim.p.fancy?20*k:0,sbH=24*k,H=fy+24*k+lh*4+sbH+10;
 rr(ctx,L,T,W,H,8);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
 let y=T+18*k+fy;
 if(sim.p.fancy){ctx.fillStyle=PAL['s5'];rr(ctx,L,T,W,20*k,8);ctx.fill();txt(ctx,big?'Fancy template':'Fancy two-column template',L+10,T+14*k,{s:12*k,w:700,c:'#fff'});}
 txt(ctx,'Your resume',L+10,y,{s:13*k,w:700,c:PAL['cv-soft']});y+=lh;
 J.lines.forEach(l=>{txt(ctx,'• '+(sim.p.coach?l[1]:l[0]),L+12,y,{s:12*k,c:PAL['cv-ink']});y+=lh;});
 const sy=y-15*k;ctx.fillStyle=sim.p.fancy?PAL['s5']:PAL['card2'];ctx.globalAlpha=sim.p.fancy?.22:1;rr(ctx,L+8,sy,W-16,sbH,6);ctx.fill();ctx.globalAlpha=1;
 txt(ctx,(sim.p.coach?J.side[1]:J.side[0]),L+16,sy+17*k,{s:12*k,c:PAL['cv-ink']});
 if(sim.p.fancy){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([5,4]);rr(ctx,L+8,sy,W-16,sbH,6);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,big?'Sidebar: not read':'Sidebar: the screener can’t read it',L+W,T+H+16*k,{s:12*k,w:700,c:PAL['s1'],a:'right'});}
 /* the posting's keywords */
 const X=410,mark={yes:['✓',PAL['s3']],hidden:['✗',PAL['s1']],words:['~',PAL['s4']],no:['✗',PAL['cv-soft']]};
 txt(ctx,big?'Posting keywords':'The posting’s keywords',X,T+16*k,{s:13*k,w:700,c:PAL['cv-soft']});txt(ctx,'points',780,T+16*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
 const rh=Math.min(26*k,(330-T-30*k)/J.kw.length);
 J.kw.forEach((w,i)=>{const st=kwState(sim,w),yy=T+16*k+rh*(i+1),[g,c]=mark[st];
  txt(ctx,g,X,yy,{s:14*k,w:700,c});txt(ctx,w[0],X+22*k,yy,{s:13*k,w:st==='yes'?700:400,c:st==='yes'?PAL['cv-ink']:PAL['cv-soft']});
  txt(ctx,(st==='yes'?'+':'')+w[1],780,yy,{s:13*k,w:700,c:st==='yes'?PAL['s3']:PAL['cv-soft'],a:'right'});});
 if(!big){const ly=T+16*k+rh*(J.kw.length+1)+4;txt(ctx,'✓ found   ~ you have it, in other words   ✗ not read',X,ly,{s:12*k,c:PAL['cv-soft']});}
 /* score bar */
 const ty=446-3*k,bh=22,by=ty-17*k-bh,bx=20,bw=760;ctx.fillStyle=PAL['card2'];rr(ctx,bx,by,bw,bh,6);ctx.fill();
 const pass=sc>=cut;ctx.fillStyle=pass?PAL['s3']:PAL['s1'];rr(ctx,bx,by,Math.max(6,bw*sc/mx),bh,6);ctx.fill();
 const cx=bx+bw*cut/mx;ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(cx,by-6);ctx.lineTo(cx,by+bh+4);ctx.stroke();
 txt(ctx,'Cutoff '+cut,cx,by-9,{s:12*k,w:700,a:'center'});
 txt(ctx,'Score '+sc+' of '+mx,bx,ty,{s:13*k,w:700});
 pill(ctx,pass?'A human sees it':'Rejected automatically',780-(big?92:80)*Math.min(k,1.4),ty-5*k,pass?PAL['s3']:PAL['s1'],'#fff',13*Math.min(k,1.4));}

function drawTest(sim,ctx,k,big){const r=sim.p.r,p=passOf(sim),c=inv(1-p),q=Math.sqrt(Math.max(0,1-r*r));
 const L=big?40:56,R=big?520:540,T=34,B=406,X=x=>L+(R-L)*(clamp(x,-3,3)+3)/6,Y=y=>B-(B-T)*(clamp(y,-3,3)+3)/6;
 ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L,T,X(c)-L,B-T);
 
 ctx.strokeStyle=PAL['s4'];ctx.lineWidth=1.5;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(L,Y(S_STAR));ctx.lineTo(R,Y(S_STAR));ctx.stroke();ctx.setLineDash([]);
 
 let nRS=0,nHS=0;
 PTS.forEach(([a,b],i)=>{const y=r*a+q*b,rej=a<c,star=y>S_STAR,aud=sim.p.audit&&atLeast('honors')&&rej&&i%10===0;
  if(rej&&star)nRS++;if(!rej&&star)nHS++;
  const px=X(a),py=Y(y);ctx.beginPath();ctx.arc(px,py,star?5:3.5,0,7);
  if(!rej||aud){ctx.fillStyle=star?PAL['s4']:PAL['s2'];ctx.fill();}else{ctx.strokeStyle=star?PAL['s4']:PAL['muted'];ctx.lineWidth=star?2:1.2;ctx.stroke();}});
 ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(c),T);ctx.lineTo(X(c),B);ctx.stroke();
 btxt(ctx,big?'Stars':'Future stars (top 20%)',R-6,Y(S_STAR)-7,{s:12*k,w:700,c:PAL['s4'],a:'right'});btxt(ctx,big?'Rejected':'Rejected by the test',L+6,B-8,{s:12*k,w:700,c:PAL['cv-soft']});btxt(ctx,'Cutoff',X(c)+6,B-8,{s:12*k,w:700,c:PAL['rj']});
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(L,T,R-L,B-T);
 txt(ctx,'Test score →',R,B+18*k>448?B-8:B+16*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
 ctx.save();ctx.translate(L-10,(T+B)/2);ctx.rotate(-Math.PI/2);txt(ctx,big?'How they’d do':'How well they’d do on the job →',0,0,{s:12*k,c:PAL['cv-soft'],a:'center'});ctx.restore();
 /* side panel */
 const SX=R+18,SW=780-SX;let y=T+14*k;const line=(s,o)=>{txt(ctx,s,SX,y,Object.assign({s:12*k,c:PAL['cv-ink']},o||{}));y+=(o&&o.gap||18)*k;};
 line(big?'200 applicants':'200 sample applicants',{w:700,s:13*k,gap:22});
 line(big?'r = '+r.toFixed(2):'Test predicts the job: r = '+r.toFixed(2),{gap:26});
 line(big?'Stars turned away:':'Future stars turned away:',{w:700,c:PAL['s4']});line(String(nRS)+' (hollow orange)',{gap:26});
 line('Stars hired: '+nHS,{w:700,gap:30});
 line('The employer sees',{w:700,c:PAL['cv-soft']});line(big?'only the hired.':'only the people it hired.');line(big?'Turned-away stars':'The stars it turned away');line(big?'are never seen.':'never show up in its data.',{gap:24});
 if(sim.p.audit&&atLeast('honors'))line(big?'Audit: 1 in 10':'Audit: 1 in 10 rejected hired',{w:700,c:PAL['s3']});}

function drawSeven(sim,ctx,k,big){const p=passOf(sim),K=share(sim),sh=shown(sim),G=GS(sim);
 txt(ctx,(big?'':'You apply to ')+'7 jobs. Each screen passes '+Math.round(p*100)+'%.',20,26*Math.min(k,1.3),{s:15*k,w:700});
 const bw=100,gap=(760-7*bw)/6,T=44*Math.min(k,1.3),bh=54*Math.min(k,1.3);
 for(let i=0;i<7;i++){const x=20+i*(bw+gap),sameT=i<K&&K>1;rr(ctx,x,T,bw,bh,8);ctx.fillStyle=sameT?PAL['s5']:PAL['card'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
  txt(ctx,'Job '+(i+1),x+bw/2,T+20*Math.min(k,1.3),{s:13*k,w:700,c:sameT?'#fff':PAL['cv-ink'],a:'center'});
  txt(ctx,sameT?'Test A':'Own screen',x+bw/2,T+40*Math.min(k,1.3),{s:12*k,c:sameT?'#fff':PAL['cv-soft'],a:'center'});}
 const gy=T+bh+(big?42:34)*k;
 txt(ctx,'100 applicants like you',20,gy-10*k,{s:13*k,w:700,c:PAL['cv-soft']});
 const yes=Math.round(100*tNow(sim)),cs=big?17:25,cols=20,x0=20;
 for(let i=0;i<100;i++){const r=Math.floor(i/cols),c=i%cols,x=x0+c*(big?29:38),y=gy+r*(big?24:42);
  ctx.fillStyle=!sh?PAL['line']:(i<yes?PAL['s3']:PAL['muted']);rr(ctx,x,y,cs*0.85,cs*1.15,3);ctx.fill();}
 const rows=Math.ceil(100/cols),ly=gy+rows*(big?24:42)+16*k;
 if(sh){ctx.fillStyle=PAL['s3'];ctx.fillRect(20,ly-11*k,12*k,12*k);txt(ctx,(big?'Interview: ':'At least one interview: ')+yes,38*k,ly,{s:12*k,w:700});
  const sx=big?20:330;const sy=big?ly+20*k:ly;ctx.fillStyle=PAL['muted'];ctx.fillRect(sx,sy-11*k,12*k,12*k);txt(ctx,(big?'Shut out: ':'Shut out of all 7: ')+(100-yes),sx+18*k,sy,{s:12*k,w:700});
  if(G&&G.m){const fy=sy+(big?22:26)*k;if(fy<448)txt(ctx,formulaLine(sim),20,fy,{s:(big?12:13)*k,w:700,c:PAL['rj']});}}
 else txt(ctx,G&&G.g?(big?'Work it out first':'Who gets at least one interview? Work it out first.'):(big?'Lock in your gut to see':'Who gets at least one interview? Lock in your gut to see.'),20,ly,{s:12*k,c:PAL['cv-soft']});
 if(G&&G.g&&!big)txt(ctx,'Your gut: '+G.g.gd+'% (different) · '+G.g.gs+'% (same test)',780,ly,{s:12*k,w:700,c:PAL['s4'],a:'right'});}

const SIM={
 id:'beatbot',hash:'beatbot',apUnit:19,order:7,tab:'Will a human see my application?',kind:'Simulation',
 skills:{bio:'The complement rule, P(at least one) = 1 − P(none) · Statistics (Ch. 5), AP Statistics (Unit 4)',honors:'The complement rule; independent vs. dependent events · Statistics (Ch. 5), AP Statistics (Unit 4)',ap:'The complement rule and chained probabilities, 1 − (1 − p)^(8 − k) · AP Statistics (Unit 4), Algebra 2'},
 card:'Apply for a summer job, watch a keyword screener and a personality test sort you, and guess what happens when every employer uses the same test.',
 title:'Will a human ever see my job application?',
 lede:{bio:'Before a manager reads your application for a part-time job, software often scores it first. A keyword screener counts words from the job posting. A personality test sorts you by your answers. If you fail, you may never hear why, and the next employer may use the very same test.',
  honors:'Each screen is a model with a cutoff. A weak predictor rejects many people who would have done the job well, and because rejected applicants are never hired, the employer never sees its mistakes: selection without feedback. When many employers share one test, its errors stop being independent.',
  ap:'With k of 7 employers sharing one test that passes a share p, P(at least one interview) = 1 − (1 − p)^(8 − k). Add an interview-to-offer chance h and P(at least one offer) = 1 − [(1 − p) + p(1 − h)^k]·(1 − ph)^(7 − k).'},
 scale:'One student applying for part-time jobs. The keyword lists, scores, cutoffs and test numbers are illustrations, not any real company’s system.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your applications',
 controls:[
  {id:'gd',label:'Your gut: chance of at least one interview if the 7 jobs use 7 different screens',type:'range',min:0,max:100,step:1,def:50,unit:'%'},
  {id:'gs',label:'Your gut: chance of at least one interview if all 7 use the same test',type:'range',min:0,max:100,step:1,def:50,unit:'%'},
  {id:'stage',label:'Screen',type:'seg',def:'seven',noGut:true,options:[{v:'resume',l:'Resume screener'},{v:'test',l:'Personality test'},{v:'seven',l:'Seven employers'}]},
  {id:'job',label:'Job you apply for',type:'seg',def:'lifeguard',lvl:'honors',noGut:true,options:[{v:'lifeguard',l:'Lifeguard'},{v:'grocery',l:'Grocery'},{v:'cafe',l:'Cafe'},{v:'camp',l:'Camp counselor'}]},
  {id:'coach',label:'A counselor helps you use the posting’s words',type:'toggle',def:false,lvl:'honors',noGut:true,help:'Same real experience, described in the words the posting uses. Never claim something you did not do.'},
  {id:'fancy',label:'Use a fancy two-column template',type:'toggle',def:false,lvl:'honors',noGut:true,help:'In this model the screener cannot read text in the sidebar box.'},
  {id:'kcut',label:'Keyword cutoff (points to reach a human)',type:'range',min:4,max:16,step:1,def:10,lvl:'honors',noGut:true},
  {id:'pass',label:'Each screen passes this share of applicants',type:'range',min:10,max:90,step:5,def:30,unit:'%',noGut:true,onChange:clearGut},
  {id:'r',label:'How well the test predicts the job (correlation r)',type:'range',min:0,max:0.9,step:0.05,def:0.2,d:2,lvl:'honors',noGut:true,help:'0 means the test tells you nothing about job performance; 1 would be perfect. 0.2 is an assumption for illustration.'},
  {id:'audit',label:'Audit: hire 1 in 10 rejected applicants at random',type:'toggle',def:false,lvl:'honors',noGut:true},
  {id:'share',label:'How many of the 7 employers use the same test',type:'range',min:1,max:7,step:1,def:7,lvl:'honors',noGut:true,onChange:clearGut},
  {id:'h',label:'Chance an interview turns into an offer',type:'range',min:10,max:90,step:5,def:50,unit:'%',lvl:'ap',noGut:true},
  {id:'reveal',label:'Show who gets interviews now',type:'toggle',def:false,help:'Normally this appears once you lock in your gut answers.'}
 ],
 actions:[{id:'fix',label:'Plain one-column resume in the posting’s words',run(sim){BioLab.setValues(sim,{stage:'resume',coach:true,fancy:false});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'kscore',label:'Resume keyword score',unit:'points',d:0,min:0,max:16,get:kscore},
  {id:'kverdict',label:'The screener’s decision',text:true,get:sim=>kscore(sim)>=kcut(sim)?`${kscore(sim)} ≥ ${kcut(sim)}: a human sees it`:`${kscore(sim)} < ${kcut(sim)}: rejected automatically`},
  {id:'starsRej',label:'Future stars the test turns away',unit:'%',d:1,min:0,max:100,get:sim=>100*starsRej(sim)},
  {id:'starsHired',label:'Stars among the people hired',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>100*starsHired(sim)},
  {id:'starsAudit',label:'Stars among the rejected (only an audit shows this)',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>100*starsInRejected(sim)},
  {id:'pNow',label:'Chance of at least one interview, this setup',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*tNow(sim):null},
  {id:'pDiff',label:'At least one interview: 7 different screens',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*tDiff(sim):null},
  {id:'pSame',label:'At least one interview: the same test at all 7',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*tSame(sim):null},
  {id:'off',label:'Your gut is off by (both answers together)',unit:'points',d:1,min:0,max:200,get:sim=>shown(sim)?gutOff(sim,sim.p.gd,sim.p.gs):null},
  {id:'offer',label:'Chance of at least one job offer, this setup',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>shown(sim)?100*pOffer(sim,share(sim)):null}
 ],
 graphs:[{id:'share',label:'Interview chance vs. employers sharing one test',custom:true},{id:'valid',label:'Stars turned away vs. how well the test predicts',lvl:'honors',custom:true}],defaultGraph:'share',
 plot(sim,ctx,box,id){const p=passOf(sim);
  if(id==='valid'){const ax=axes(ctx,box,{xmin:0,xmax:0.9,ymin:0,ymax:100,xl:'Correlation r between test and job',yl:'Future stars turned away (%)'});
   ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let r=0;r<=0.9001;r+=0.025){const v=100*rejStar(r,p)/0.2;r===0?ctx.moveTo(ax.X(r),ax.Y(v)):ctx.lineTo(ax.X(r),ax.Y(v));}ctx.stroke();
   ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.r),ax.Y(100*starsRej(sim)),6,0,7);ctx.fill();return;}
  const ax=axes(ctx,box,{xmin:1,xmax:7,ymin:0,ymax:100,xl:'Employers (of 7) that use the same test',yl:'At least one interview (%)'});
  if(!shown(sim)){txt(ctx,pend(sim)?'Work out your chance first':'Lock in your gut to see the chances',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let k=1;k<=7;k++){const v=100*pAny(p,k);k===1?ctx.moveTo(ax.X(k),ax.Y(v)):ctx.lineTo(ax.X(k),ax.Y(v));}ctx.stroke();
  for(let k=1;k<=7;k++){ctx.fillStyle=k===share(sim)?PAL['rj']:PAL['g-line'];ctx.beginPath();ctx.arc(ax.X(k),ax.Y(100*pAny(p,k)),k===share(sim)?7:4,0,7);ctx.fill();}
  const G=sim.gutS;if(G&&G.g){ctx.fillStyle=PAL['s4'];[[1,G.g.gd],[7,G.g.gs]].forEach(([x,v])=>{ctx.beginPath();ctx.arc(ax.X(x),ax.Y(v),6,0,7);ctx.fill();});txt(ctx,'Your gut',ax.X(1)+10,ax.Y(G.g.gd)+16,{s:12,w:700,c:PAL['s4']});}},
 draw(sim,ctx,vdt,k){const big=k>1.3;ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  if(sim.p.stage==='resume')drawResume(sim,ctx,k,big);else if(sim.p.stage==='test')drawTest(sim,ctx,k,big);else drawSeven(sim,ctx,k,big);},
 narrate(sim){const st=sim.p.stage;
  if(st==='resume'){const sc=kscore(sim),cut=kcut(sim),J=job(sim),words=J.kw.filter(w=>kwState(sim,w)==='words').length,hid=J.kw.filter(w=>kwState(sim,w)==='hidden').length;
   if(sc>=cut)return `Your resume scores ${sc}, at or above the cutoff of ${cut}. <b>A human will see it.</b> The screener never judged you, only how many of the posting’s words it could read.`;
   return `Your resume scores ${sc}, under the cutoff of ${cut}, so it is rejected before anyone reads it. ${words?`<b>${words} of the posting’s keywords describe things you did, in different words.</b> `:''}${hid?`<b>${hid} sit in a sidebar the screener cannot read.</b>`:''}`;}
  if(st==='test')return `The test turns away <b>${pc(starsRej(sim))} of the applicants who would have been stars</b>. ${atLeast('honors')?`Yet ${pc(starsHired(sim))} of the people it does hire are stars, against 20% by chance, so it looks like it works. `:''}The rejected are never hired, so their stellar work never shows up in the employer’s data.`;
  if(pend(sim))return `Each screen passes ${sim.p.pass}%, so you fail each one with chance ${(1-passOf(sim)).toFixed(2)}. <b>Use the complement rule to work out your chance of at least one interview with 7 different screens.</b>`;
  if(!shown(sim))return `Each employer’s screen passes ${sim.p.pass}% of applicants. <b>If you apply to 7 jobs, how likely is at least one interview?</b> It depends on whether the 7 screens are different or the same.`;
  const k=share(sim),n=Math.round(100*tNow(sim));
  if(k===7)return `All 7 employers use the same test, so it gives you the same verdict 7 times. <b>Only ${n} of 100 applicants like you get any interview.</b> One test’s mistake follows you everywhere.`;
  if(k===1)return `Seven different screens give you seven separate chances: 1 − ${(1-passOf(sim)).toFixed(2)}⁷. <b>${n} of 100 applicants like you get at least one interview.</b>`;
  return `${k} employers share one test and ${7-k} screen on their own: ${8-k} separate chances. <b>${n} of 100 applicants like you get at least one interview.</b>`;},
 gut:{better:'lower',controls:['gd','gs'],lockLabel:'Lock in my two guesses',
  ask:{bio:'Each job’s screen lets through 30% of applicants. You apply to 7 jobs. Drag the two sliders here: your chance of at least one interview if the 7 jobs use 7 different screens, and if all 7 use the same test. Then lock it in.',
   honors:'Each screen passes 30% of applicants. Before any formula, set both sliders here by feel: P(at least one interview) with 7 independent screens, and with one shared test. Then lock it in.'},
  lock(sim){return {v:gutOff(sim,sim.p.gd,sim.p.gs),gd:sim.p.gd,gs:sim.p.gs,label:`${sim.p.gd}% with different screens, ${sim.p.gs}% with the same test`};},
  solve(sim){const d=100*tDiff(sim),s=100*tSame(sim);sim.p.gd=Math.round(d);sim.p.gs=Math.round(s);sim.p.stage='seven';
   return {v:0,d,s,label:`${d.toFixed(1)}% with different screens, ${s.toFixed(1)}% with the same test`};},
  hint:'Lock in your two guesses. Then you will work out the different-screens chance yourself.',
  calc:{unit:'%',d:1,tol:0.5,
   prompt:{bio:sim=>`Each screen passes <b>${sim.p.pass}%</b>, so you fail one screen with chance 1 − ${passOf(sim).toFixed(2)} = <b>${(1-passOf(sim)).toFixed(2)}</b>. To fail all 7 different screens, you fail 7 times in a row: multiply ${(1-passOf(sim)).toFixed(2)} by itself 7 times. Your chance of at least one interview is 100% minus that. What is it, as a percent?`,
    ap:sim=>`Each of 7 independent screens passes p = ${passOf(sim).toFixed(2)}. Use the complement rule to find P(at least one interview), as a percent.`},
   answer:calcAns,
   hint:'Raise your chance of failing one screen to the 7th power (the ^ key on a calculator). Subtract that from 1, then multiply by 100.',
   steps(sim){const q=1-passOf(sim),n=Math.pow(q,7);return [`P(fail one screen) = 1 − ${passOf(sim).toFixed(2)} = ${q.toFixed(2)}.`,`P(fail all 7) = ${q.toFixed(2)}⁷ = ${fmt3(n)}.`,`P(at least one interview) = 1 − ${fmt3(n)} = ${(1-n).toFixed(3)}, or <b>${pc(1-n)}</b>.`,`With one shared test it is just ${p0(passOf(sim))}: the same verdict 7 times.`];}},
  formula(sim){return formulaLine(sim).replace('Different screens: ','P(at least one), 7 different screens: ').replace('Same test: ','<br>One shared test: P = ');},
  how:{bio:'Find the chance of being turned down everywhere, then subtract from 100%. Different screens: you must fail 7 separate times, 0.7 × 0.7 × … seven times. The same test: one failure counts 7 times, so you are turned down everywhere 70% of the time.',
   ap:'Independent: P(no interview) = (1 − p)⁷. Shared: P(no interview) = 1 − p. So P(at least one) is 1 − (1 − p)⁷ against p.'},
  compare(sim,g,m){const d=m.d,s=m.s,off=g.v,outD=Math.round(100-d),outS=Math.round(100-s);
   const real=` Of 100 applicants like you, <b>${outD}</b> are shut out with 7 different screens and <b>${outS}</b> with one shared test.`;
   const K=sim.ui.calc,self=K&&K.done&&K.correct?' You worked out the different-screens chance yourself.':'';
   if(off<6)return `Your gut was right on, within ${off.toFixed(1)} points in all.`+real+self;
   return `Your two guesses were off by <b>${off.toFixed(1)} points</b> in all.`+real+(g.gs>s+5?' One shared test is one chance, not seven.':'')+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];sim.p.pass=R([20,25,30,40,50]);sim.p.share=7;sim.p.gd=50;sim.p.gs=50;sim.p.stage='seven';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different case: you apply to 5 jobs, each with its own screen that passes 40% of applicants. What is your chance of at least one interview, as a percent?',answer:92.2,tol:0.3,unit:'%',d:1,hint:'P(fail one) = 0.6. Multiply 0.6 by itself 5 times, then subtract from 1.',explain:'P(fail all 5) = 0.6⁵ = 0.07776, so P(at least one) = 1 − 0.07776 = 0.922, or 92.2%. If all 5 shared one test, it would be just 40%.'},
  {lvl:'bio',instant:true,q:'Your lifeguard resume scores 6 and the cutoff is 10. A counselor helps you describe the same experience in the posting’s words (“swimming” instead of “swim team”). What happens?',choices:['Nothing: the screener judges your experience, not your words','Your score jumps to 15 and a human sees it','The score drops, because you changed your resume'],correct:1,explain:'The screener only counts matching words. “Lifeguard certification” (+4), “swimming” (+2), “customer service” (+2) and “weekends” (+1) take you from 6 to 15. Your experience did not change; the match did.'},
  {lvl:'bio',instant:true,q:'Each of 7 employers uses the same personality test, which passes 30% of applicants. You failed it once. What is your chance at the other 6?',choices:['About 30% each, so you will probably pass one','Close to zero: the same test gives you the same answer','Better each time, since you have practiced'],correct:1,explain:'A shared test is not 7 coin flips. It is one verdict, copied. O’Neil tells the story of Kyle Behm, turned down by employer after employer that used the same test.'},
  {lvl:'honors',instant:true,q:'A test predicts job performance with r = 0.2 and hires the top 30%. The employer notices 27% of its hires are stars, above the 20% you would get by chance. What can it not see?',choices:['Nothing: 27% proves the test is working well','That it turned away about 60% of all the future stars, because rejected people are never hired and never measured','How many people applied'],correct:1,explain:'Selection without feedback: the employer only has data on the people it hired. The stars it turned away (about 60% of all stars here) never appear in its records, so the test never gets corrected.'},
  {lvl:'honors',instant:true,q:'Which change would let the employer discover its test is weak?',choices:['Make the cutoff stricter','Hire a random 1 in 10 of the rejected applicants and track how they do','Give the test to more applicants'],correct:1,explain:'An audit group breaks the feedback blind spot. Here it would show stars making up 17% of the rejected against 27% of the hired, a small gap for a test that rejects 70% of everyone.'},
  {lvl:'ap',instant:true,q:'Each screen passes p = 0.3. Four of the 7 employers share one test; the other 3 screen independently. What is P(at least one interview)?',choices:['1 − 0.7⁷ ≈ 91.8%','1 − 0.7⁴ ≈ 76.0%','0.3'],correct:1,explain:'The 4 shared employers count as one draw, plus 3 independent ones: 4 separate chances. 1 − 0.7⁴ = 1 − 0.2401 ≈ 76.0%.'},
  {lvl:'ap',instant:true,q:'All 7 employers share the test (p = 0.3), and each interview becomes an offer with h = 0.5. What is P(at least one offer)?',choices:['p = 30%','p(1 − 0.5⁷) ≈ 29.8%','1 − (1 − 0.15)⁷ ≈ 67.9%'],correct:1,explain:'You must pass the one shared test (0.3); then 7 independent interviews give 1 − 0.5⁷ ≈ 0.992. So 0.3 × 0.992 ≈ 29.8%. With 7 independent screens it would be 1 − 0.85⁷ ≈ 67.9%.'}
 ],
 tour:[
  {title:'The keyword screener',text:'You apply to be a pool lifeguard. Before anyone reads your resume, software counts which of the posting’s keywords it can find. Each one is worth points; you need 10 to reach a human. You score 6.',pause:true,setup:sim=>BioLab.setValues(sim,{stage:'resume',job:'lifeguard',coach:false,fancy:false,kcut:10})},
  {title:'Same experience, the posting’s words',text:'You were on a swim team and finished a lifeguard course, but the screener looks for “swimming” and “lifeguard certification.” A counselor helps you use those words. Now you score 15.',pause:true,setup:sim=>BioLab.setValues(sim,{stage:'resume',coach:true,fancy:false})},
  {title:'A fancy template',text:'A two-column template looks great to people. In this model, though, the screener cannot read the sidebar, so CPR, first aid and weekends vanish. You drop to 8 and are rejected.',pause:true,setup:sim=>BioLab.setValues(sim,{stage:'resume',coach:true,fancy:true})},
  {title:'The personality test',text:'Next screen: a personality test. Each dot is an applicant. Left to right is the test score; bottom to top is how well they would really do the job. The test predicts weakly (r = 0.2) and passes only the top 30%.',pause:true,setup:sim=>BioLab.setValues(sim,{stage:'test',r:0.2,pass:30,audit:false})},
  {title:'Stars turned away',text:'Orange dots are future stars, the top 20% at the job. The test turns away about 60% of them. Those people are never hired, so the employer never learns what it missed.',pause:true},
  {title:'The same test, seven times',text:'Now you apply to 7 jobs, and all 7 use the same test that passes 30%. It gives you the same verdict every time. Only 30 of 100 applicants like you get any interview.',pause:true,setup:sim=>BioLab.setValues(sim,{stage:'seven',pass:30,share:7,reveal:true})},
  {title:'Seven different screens',text:'If each job had its own screen, you would fail all 7 only 0.7⁷ ≈ 8.2% of the time. 92 of 100 get at least one interview. Independent mistakes cancel out; shared ones pile up.',pause:true,setup:sim=>BioLab.setValues(sim,{stage:'seven',pass:30,share:1,reveal:true})},
  {lvl:'ap',title:'From interviews to offers',text:'Add a 50% chance that an interview becomes an offer. Seven independent employers: 1 − 0.85⁷ ≈ 67.9%. One shared test: 0.3 × (1 − 0.5⁷) ≈ 29.8%.',pause:true,setup:sim=>BioLab.setValues(sim,{stage:'seven',pass:30,share:7,h:50,reveal:true})}
 ],
 lab:{bio:'<p><b>Question:</b> How much does sharing one test hurt applicants?</p><ol><li>Choose <b>Seven employers</b> and turn on <b>Show who gets interviews now</b>.</li><li>Record the two chances (different screens, same test) with each screen passing 20%, 30%, 50% and 70%.</li><li>Graph <b>Trials</b> with the pass rate on x.</li></ol><p>Write one sentence: when is the gap biggest?</p>',
  honors:'<p><b>Question:</b> Does a weak test fool the employer?</p><ol><li>Choose <b>Personality test</b>. Keep 30% passing.</li><li>For r = 0, 0.2, 0.4 and 0.6, record the stars turned away and the stars among the hired.</li><li>Turn on the audit and record the stars among the rejected.</li></ol><p>Explain why the employer’s own data makes a weak test look fine, and what the audit changes.</p>',
  ap:'<p><b>Question:</b> How fast does sharing a test erase your chances?</p><ol><li>For p = 0.3, record P(at least one interview) for 1 to 7 employers sharing the test.</li><li>Show the values fit 1 − (1 − p)^(8 − k).</li><li>Add h = 0.5 and derive P(at least one offer) for k = 7.</li></ol><p><b>CER:</b> Use independence to explain the gap.</p>'},
 terms:[
  {t:'Keyword screener',d:'Software that scores a resume by counting words from the job posting. Scores under a cutoff are rejected before a person reads them.'},
  {t:'Cutoff',d:'The score a screen requires. Everyone below it is rejected.'},
  {t:'Independent events',d:'Events where one result does not change the chances of the other. Seven different screens are close to independent; seven copies of one test are not.'},
  {t:'Correlation (r)',d:'A number from −1 to 1 for how closely two things move together. Here, the test score and real job performance.',lvl:'honors'},
  {t:'Selection without feedback',d:'A model only learns from the people it accepted, so its mistakes on the people it rejected are never seen or corrected.',lvl:'honors'},
  {t:'Complement rule',d:'P(at least one) = 1 − P(none). With 7 independent chances, P(none) = (1 − p)⁷.',lvl:'ap'}
 ],
 about:'<p><b>Model.</b> The keyword screener adds the points of every posting keyword it finds in the text it can read; the keywords, points and cutoff are made up for illustration. In this model a fancy template hides its sidebar box from the screener; whether a real screener can read a layout depends on the software. The personality test treats test score and job performance as normal with correlation r (0.2 is an assumption for illustration); “stars” are the top 20% at the job. For seven employers, each screen passes a share p; k employers sharing one test give one verdict, so P(at least one interview) = 1 − (1 − p)^(8 − k). The 200 dots are one fixed random sample; the percentages are computed exactly from the model.</p><p><b>From the book.</b> In <i>Weapons of Math Destruction</i> (Ch. 6), Cathy O’Neil cites an estimate that 72% of resumes are never seen by human eyes, and reports a meta-analysis by Frank Schmidt finding personality tests only one-third as predictive as cognitive exams. According to O’Neil, Kyle Behm, a college student on leave for treatment of bipolar disorder, was rejected for a part-time job at Kroger after a personality test from Kronos, and then by other employers that used the same test. His father planned a class-action suit naming Finish Line, Home Depot, Kroger, Lowe’s, PetSmart, Walgreen Co. and Yum Brands; as of the book’s 2016 publication it was pending, and its claims were allegations, not findings.</p><p><b>Since then.</b> In 2018 it was reported that Amazon scrapped an experimental resume screener that penalized resumes containing the word “women’s” after it was trained on 10 years of mostly male resumes. In <i>Mobley v. Workday</i> (N.D. Cal.), a job seeker alleges that Workday’s AI screening tools discriminated by age; on May 16, 2025 the court preliminarily certified a nationwide age-discrimination collective. As of that ruling the claims were allegations and the case was ongoing (<a href="https://clearinghouse.net/case/44074/" target="_blank" rel="noopener">Civil Rights Litigation Clearinghouse</a>).</p><p><b>Settings that change the math.</b> The audit toggle hires a random 1 in 10 rejected applicants, so the employer can measure the test’s misses. Using different screens at different employers turns one verdict into independent chances. Which of these would you want an employer to use, and what would each cost it? Job-search tips here are general; a school counselor can help with your real resume.</p>'
};
BioLab.register(SIM);
})();
