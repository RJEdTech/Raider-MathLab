(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* One student, one college. Per year: net price = sticker − grants. The student borrows L a year (capped at the net price);
   the family pays the rest now. Loans: borrowed at the start of each year; simple interest builds until the student finishes
   (unsubsidized style, toggle at Deep dive) and is added to the balance; then a fixed monthly payment over the repayment term:
   M = B·i / (1 − (1 + i)^−n), i = APR/12, n = 12 × years to repay. */
function model(p){const S=Math.max(0,p.sticker),A=clamp(p.aid,0,S),net=S-A,N=Math.max(1,Math.round(p.years)),L=clamp(p.borrow,0,net),r=Math.max(0,p.rate)/100;
 const ins=p.school?L*r*N*(N+1)/2:0,B=L*N+ins,i=r/12,n=12*Math.max(1,p.term);
 const M=B<=0?0:(i>0?B*i/(1-Math.pow(1+i,-n)):B/n),rep=M*n,interest=Math.max(0,rep-L*N);
 return {S,A,net,N,L,r,i,n,disc:S>0?A/S:0,stickerT:S*N,netT:net*N,borrowed:L*N,ins,B,M,rep,interest,real:net*N+interest,now:(net-L)*N,first:B*i};}
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $2=v=>'$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=v=>fmtNum(100*v,1)+'%';
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(sim.gutS&&(sim.gutS.g||sim.gutS.m)));
const yrs=n=>n+' year'+(n===1?'':'s');
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
/* spread label y positions so none are closer than gap, inside [lo,hi] */
function spread(items,gap,lo,hi){items.sort((a,b)=>a.y-b.y);for(let i=0;i<items.length;i++){if(items[i].y<lo)items[i].y=lo;if(i&&items[i].y-items[i-1].y<gap)items[i].y=items[i-1].y+gap;}
 for(let i=items.length-1;i>=0;i--){if(items[i].y>hi)items[i].y=hi;if(i<items.length-1&&items[i+1].y-items[i].y<gap)items[i].y=items[i+1].y-gap;}return items;}
/* loan balance t years after the first day */
function balAt(m,t,school){const N=m.N;if(t<=N){let b=0;for(let y=0;y<N;y++){if(t>=y){b+=m.L*(1+(school?m.r*(Math.min(t,N)-y):0));}}return b;}
 const k=Math.min(m.n,(t-N)*12),g=Math.pow(1+m.i,k);return m.i>0?Math.max(0,m.B*g-m.M*(g-1)/m.i):Math.max(0,m.B-m.M*k);}
const pick=(sim,guess)=>{const m=model(sim.p);return {v:Math.abs(guess-m.real),guess,real:m.real,label:`${$(guess)} for ${yrs(m.N)}`};};

const SIM={
 id:'stickernet',hash:'stickernet',apUnit:19,order:1,tab:'Sticker vs. net price',kind:'Simulation',
 card:'Guess what college really costs by feel, then let the math subtract the aid and add up the loan, month by month.',
 title:'Sticker price vs. what you really pay',
 lede:{bio:'Two students live in the same dorm and take the same classes. One pays the full sticker price; the other pays less than half of it. What you pay is the sticker price minus grants, plus whatever interest your loans add.',
  honors:'Net price = sticker − grants, and the discount rate is grants ÷ sticker: a proportion. A loan does not lower the price; it moves part of it into the future, and interest makes that part grow.',
  ap:'A loan balance B repaid in n equal monthly payments at monthly rate i needs M = B·i / (1 − (1 + i)⁻ⁿ). The (1 + i)ⁿ inside is exponential growth, which is why stretching the term lowers the payment but raises the total.'},
 scale:'One student, one college: a year at a time and over all the years. Use your own college’s numbers if you like: they stay in this browser tab and are never saved or sent.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your college',
 controls:[
  {id:'sticker',label:'Sticker price per year ($): tuition, fees, room and board',type:'range',min:20000,max:100000,step:500,def:70000,unit:'',noGut:true,onChange:clearGut,help:'The posted cost of attendance. Find it on the college’s website.'},
  {id:'aid',label:'Grants and scholarships per year ($): money you never pay back',type:'range',min:0,max:100000,step:500,def:40000,unit:'',noGut:true,onChange:clearGut,help:'From your aid offer. Loans and work-study are not grants.'},
  {id:'borrow',label:'Loan you take each year ($)',type:'range',min:0,max:30000,step:500,def:7000,unit:'',noGut:true,onChange:clearGut,help:'Capped at the net price. Your family pays the rest of the net price from savings and income.'},
  {id:'years',label:'Years in college',type:'range',min:1,max:6,step:1,def:4,unit:' yr',noGut:true,onChange:clearGut},
  {id:'guess',label:'Your guess: what all the years really cost ($), counting loan interest',type:'range',min:0,max:600000,step:1000,def:100000,unit:'',help:'Your pick. Lock it in before you look at the answers.'},
  {id:'show',label:'Show the answers',type:'toggle',def:false,noGut:true,help:'Off: you guess by feel first.'},
  {id:'rate',label:'Loan interest rate (APR)',type:'range',min:1,max:12,step:0.01,def:6.39,d:2,unit:'%',lvl:'honors',noGut:true,onChange:clearGut,help:'6.39% is the fixed rate on federal Direct Loans for undergraduates first paid out from July 1, 2025 to June 30, 2026. A new rate is set each year; change it to match your loan.'},
  {id:'term',label:'Years to repay',type:'range',min:5,max:25,step:1,def:10,unit:' yr',lvl:'ap',noGut:true,onChange:clearGut},
  {id:'school',label:'Interest builds while you are in school',type:'toggle',def:true,lvl:'ap',noGut:true,onChange:clearGut,help:'On: like an unsubsidized loan. Off: like a loan with no interest until you finish.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'net',label:'Net price per year',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim.p).net},
  {id:'disc',label:'Discount rate (grants ÷ sticker)',unit:'%',d:1,min:0,max:100,get:sim=>100*model(sim.p).disc},
  {id:'stickerT',label:'Sticker price, all years',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim.p).stickerT},
  {id:'netT',label:'Net price, all years',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim.p).netT:null},
  {id:'borrowed',label:'Total you borrow',unit:'dollars',d:0,min:0,max:null,get:sim=>model(sim.p).borrowed},
  {id:'pay',label:'Monthly loan payment',unit:'dollars',d:2,min:0,max:null,get:sim=>shown(sim)?model(sim.p).M:null},
  {id:'repaid',label:'Total repaid on the loan',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim.p).rep:null},
  {id:'interest',label:'Interest you pay',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim.p).interest:null},
  {id:'real',label:'What it really costs: net price plus interest',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?model(sim.p).real:null},
  {id:'bal',label:'Loan balance when repayment starts',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?model(sim.p).B:null},
  {id:'first',label:'Interest in the first month of repayment',unit:'dollars',d:2,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?model(sim.p).first:null}
 ],
 graphs:[{id:'aid',label:'What it really costs vs. grants',custom:true},{id:'term',label:'Total interest vs. years to repay',lvl:'honors',custom:true}],defaultGraph:'aid',
 plot(sim,ctx,box,id){
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const m=model(sim.p);
  if(id==='term'){const at=t=>model(Object.assign({},sim.p,{term:t})),top=Math.ceil(Math.max(1000,at(25).interest)/5000)*5000/1000;
   const ax=axes(ctx,box,{xmin:5,xmax:25,ymin:0,ymax:top,xl:'Years to repay',yl:'Total interest ($1,000s)'});
   ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=5;t<=25;t++){const x=ax.X(t),y=ax.Y(at(t).interest/1000);t===5?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();
   const t0=clamp(sim.p.term,5,25),v=at(t0);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(t0),ax.Y(v.interest/1000),6,0,7);ctx.fill();
   txt(ctx,`${$(v.M)} a month`,ax.X(t0)+(t0>18?-10:10),ax.Y(v.interest/1000)-12,{s:12,w:700,c:PAL['rj'],a:t0>18?'right':'left'});return;}
  const S=m.S,at=a=>model(Object.assign({},sim.p,{aid:a})).real/1000,top=Math.ceil(Math.max(at(0),sim.gutS&&sim.gutS.g?sim.gutS.g.guess/1000:0,10)/50)*50;
  const ax=axes(ctx,box,{xmin:0,xmax:S/1000,ymin:0,ymax:top,xl:'Grants per year ($1,000s)',yl:'Real cost, all years ($1,000s)'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let j=0;j<=60;j++){const a=S*j/60,x=ax.X(a/1000),y=ax.Y(at(a));j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  const G=GS(sim);if(G&&G.g){const gy=ax.Y(clamp(G.g.guess/1000,0,top));ctx.strokeStyle=PAL['s4'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(0),gy);ctx.lineTo(ax.X(S/1000),gy);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,'Your gut',ax.X(S/1000)-6,gy-8,{s:12,w:700,c:PAL['s4'],a:'right'});}
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(m.A/1000),ax.Y(m.real/1000),6,0,7);ctx.fill();
  txt(ctx,'You',ax.X(m.A/1000)+(m.A>S*0.8?-10:10),ax.Y(m.real/1000)+18,{s:12,w:700,c:PAL['rj'],a:m.A>S*0.8?'right':'left'});},
 draw(sim,ctx,vdt,k0){const k=Math.min(k0,1.8),m=model(sim.p),sh=shown(sim),G=GS(sim),big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const fs=12*k,vs=18*Math.min(k,1.4);
  /* layout from the bottom up: totals row, captions, bars */
  const boxH=14+fs+6+vs+8+fs+6,by=446-boxH,base=by-12-2.1*fs,maxH=base-62;
  /* ---- left: one year, two students ---- */
  txt(ctx,big?'One year':'One year, same dorm',24,26,{s:14*k,w:700});
  if(atLeast('honors')&&!big)txt(ctx,'Discount rate '+pct(m.disc),380,26,{s:fs,w:700,c:PAL['s3'],a:'right'});
  const sc=maxH/Math.max(m.S,20000),bw=72,b1=28,b2=186;
  ctx.fillStyle=PAL['s1'];rr(ctx,b1,base-m.S*sc,bw,m.S*sc,4);ctx.fill();
  txt(ctx,$(m.S),b1+bw/2,base-m.S*sc-8,{s:fs,w:700,a:'center'});
  const hF=(m.net-m.L)*sc,hL=m.L*sc,hA=m.A*sc;let y=base;
  ctx.fillStyle=PAL['s2'];if(hF>0){rr(ctx,b2,y-hF,bw,hF,3);ctx.fill();}y-=hF;
  ctx.fillStyle=PAL['s4'];if(hL>0){ctx.fillRect(b2,y-hL,bw,hL);}y-=hL;
  if(hA>0){ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.28;ctx.fillRect(b2,y-hA,bw,hA);ctx.globalAlpha=1;ctx.strokeStyle=PAL['s3'];ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.strokeRect(b2+1,y-hA+1,bw-2,hA-2);ctx.setLineDash([]);}
  const labs=[];
  if(m.A>0)labs.push({y:base-hF-hL-hA/2,t:'Grants',v:$(m.A),c:PAL['s3'],sy:base-hF-hL-hA/2});
  if(m.L>0)labs.push({y:base-hF-hL/2,t:'Loan',v:$(m.L),c:PAL['s4'],sy:base-hF-hL/2});
  if(m.net-m.L>0)labs.push({y:base-hF/2,t:'Paid now',v:$(m.net-m.L),c:PAL['s2'],sy:base-hF/2});
  const lx=b2+bw+16;
  spread(labs,2.5*fs,44+fs,base-fs).forEach(l=>{ctx.strokeStyle=l.c;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(b2+bw+2,l.sy);ctx.lineTo(lx-4,l.y);ctx.stroke();
   txt(ctx,l.t,lx,l.y,{s:fs,w:700,c:l.c,b:'bottom'});txt(ctx,l.v,lx,l.y+1,{s:fs,w:700,c:l.c,b:'top'});});
  txt(ctx,'Next door',b1+bw/2,base+4+fs,{s:fs,w:700,a:'center'});txt(ctx,'no aid',b1+bw/2,base+6+2*fs,{s:fs,c:PAL['cv-soft'],a:'center'});
  txt(ctx,'You',b2+bw/2,base+4+fs,{s:fs,w:700,a:'center'});txt(ctx,'net '+$(m.net),b2+bw/2,base+6+2*fs,{s:fs,c:PAL['cv-soft'],a:'center'});
  /* ---- right: the loan over time ---- */
  const X0=436,X1=772,T0=44+1.2*fs,Y1=base,tmax=m.N+Math.max(1,sim.p.term),school=!!sim.p.school;
  txt(ctx,big?'Your loan balance':'Your loan balance, year by year',418,26,{s:14*k,w:700});
  const X=t=>X0+(X1-X0)*t/tmax;
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X(0),T0-fs-4,X(m.N)-X(0),Y1-T0+fs+4);
  txt(ctx,big?'College':'In college',X(0)+4,T0,{s:fs,c:PAL['cv-soft']});
  txt(ctx,'Repaying',X1,T0,{s:fs,c:PAL['cv-soft'],a:'right'});
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X0,Y1);ctx.lineTo(X1,Y1);ctx.stroke();
  [[0,'0'],[m.N,String(m.N)],[tmax,big?tmax+' years':String(tmax)]].forEach(([t,l])=>{ctx.beginPath();ctx.moveTo(X(t),Y1);ctx.lineTo(X(t),Y1+5);ctx.stroke();txt(ctx,l,t===tmax&&big?X(t)+4:X(t),Y1+6,{s:fs,c:PAL['cv-soft'],a:t===tmax&&big?'right':'center',b:'top'});});
  if(!big)txt(ctx,'years from your first day',(X(m.N)+X1)/2+10,Y1+6,{s:fs,c:PAL['cv-soft'],a:'center',b:'top'});
  if(m.B<=0){txt(ctx,'No loan: nothing',(X0+X1)/2,(T0+Y1)/2,{s:13*k,w:700,a:'center'});txt(ctx,'to repay later.',(X0+X1)/2,(T0+Y1)/2+16*k,{s:13*k,w:700,a:'center'});}
  else{const top=m.B,Y=b=>Y1-(Y1-T0-2.4*fs-14)*b/top;
   ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.22;ctx.beginPath();ctx.moveTo(X(0),Y1);for(let j=0;j<=200;j++){const t=tmax*j/200;ctx.lineTo(X(t),Y(balAt(m,t,school)));}ctx.lineTo(X(tmax),Y1);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();for(let j=0;j<=200;j++){const t=tmax*j/200,xx=X(t),yy=Y(balAt(m,t,school));j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();
   const px=X(m.N),py=Y(m.B);ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(px,py,5,0,7);ctx.fill();
   const ow=sh?'You owe '+$(m.B):'You owe ?',right=px>X0+(X1-X0)*0.55;txt(ctx,ow,right?px-8:px+8,py-8,{s:fs,w:700,a:right?'right':'left'});
   const pl=(sh?$(m.M):'?')+' a month',pw=pl.length*fs*0.62+fs*1.1,cx=clamp(X(m.N+(tmax-m.N)*0.62)+pw*0.1,X0+pw/2+4,X1-pw/2),cy=Math.max(py+2.2*fs,Y(balAt(m,m.N+(tmax-m.N)*0.62,school))-1.4*fs);
   pill(ctx,pl,cx,Math.min(cy,Y1-fs*1.2),PAL['s4'],'#1b1b1b',fs);}
  /* ---- bottom: the totals ---- */
  const L=big?['Sticker','Net price','Interest','Real cost']:['Sticker, '+yrs(m.N),'Net price, '+yrs(m.N),'Loan interest','What it really costs'];
  const bxs=[[L[0],$(m.stickerT),'s1'],[L[1],sh?$(m.netT):'?','s2'],[L[2],sh?$(m.interest):'?','s4'],[L[3],sh?$(m.real):'?','rj']];
  bxs.forEach(([l,v,c],i)=>{const x=16+i*193,bwid=185;ctx.fillStyle=PAL['card'];rr(ctx,x,by,bwid,boxH,8);ctx.fill();ctx.strokeStyle=PAL[c];ctx.lineWidth=i===3?3:1.5;rr(ctx,x,by,bwid,boxH,8);ctx.stroke();
   txt(ctx,l,x+10,by+10,{s:fs,c:PAL['cv-soft'],b:'top'});txt(ctx,v,x+10,by+16+fs,{s:vs,w:700,c:i===3?PAL['rj']:PAL['cv-ink'],b:'top'});});
  if(big)txt(ctx,'all '+yrs(m.N),16+193+10,by+boxH-6,{s:fs,c:PAL['cv-soft'],b:'bottom'});
  if(G&&G.g)txt(ctx,(big?'Gut: ':'Your gut: ')+$(G.g.guess),16+3*193+10,by+boxH-6,{s:fs,w:700,c:PAL['s4'],b:'bottom'});},
 narrate(sim){const m=model(sim.p),sh=shown(sim);
  if(m.A<=0)return `With no grants, you pay the full sticker price: <b>${$(m.S)} a year</b>, ${$(m.stickerT)} for ${yrs(m.N)}.`;
  let s=`The student next door pays ${$(m.S)} a year. Your grants cut that by ${pct(m.disc)}, so <b>your net price is ${$(m.net)} a year</b>.`;
  if(m.L<=0)return s+' You borrow nothing, so there is no interest to add.';
  if(!sh)return s+` You borrow ${$(m.L)} of it each year. <b>A loan does not lower the price:</b> you pay it later, with interest.`;
  return s+` Borrowing ${$(m.L)} a year means ${$(m.M)} a month for ${yrs(sim.p.term)} after you finish, and <b>${$(m.interest)} in interest</b> on top of the net price.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Read the picture: the sticker price, your grants and the loan you take each year. Drag <b>Your guess</b> here to what you think all the years really cost, counting what you pay back on the loan. Then lock it in.',
   honors:'Before any math: drag <b>Your guess</b> here to the total cost of all the years, net price plus every dollar of loan interest. Lock it in.'},
  lock(sim){return pick(sim,sim.p.guess);},
  solve(sim){const m=model(sim.p);sim.p.guess=m.real;sim.p.show=true;return {v:0,guess:m.real,real:m.real,label:`${$(m.real)}: ${$(m.netT)} in net price plus ${$(m.interest)} in loan interest`};},
  how:{bio:'Subtract the grants from the sticker price to get the net price, and multiply by the number of years. Then add the loan’s interest: the monthly payment times the number of months, minus what you borrowed.',
   honors:'Net price = sticker − grants. Total = net price × years + interest. The interest comes from the loan payment formula, because each month the balance grows by the monthly rate before your payment comes off.',
   ap:'Net price × N, plus interest = 12·T·M − (amount borrowed), where M = B·i / (1 − (1 + i)⁻¹²ᵀ) for a balance B, monthly rate i and T years to repay.'},
  compare(sim,g,m){const md=model(sim.p),err=g.guess-md.real,ab=Math.abs(err),tol=Math.max(2000,0.05*md.real);
   const loan=md.L>0?` The loan adds <b>${$(md.interest)} in interest</b>: ${$(md.M)} a month for ${yrs(sim.p.term)} after you finish.`:'';
   if(ab<=tol)return `Your gut was right on: within ${$(ab)} of the real cost, ${$(md.real)}. You already think in net price, not sticker price.${loan}`;
   const nearSticker=md.A>0&&Math.abs(g.guess-md.stickerT)<0.12*md.stickerT;
   let s=err>0?`Your guess was <b>${$(ab)} too high</b>. Plan with it, and you might cross off a college that costs ${$(ab)} less than you thought.`
    :`Your guess was <b>${$(ab)} too low</b>. Plan with it, and your family comes up ${$(ab)} short.`;
   if(nearSticker)s+=` You were close to the sticker total (${$(md.stickerT)}), but grants cut the price by ${pct(md.disc)}.`;
   return s+loan;},
  again(sim){const S=500*Math.round((30000+Math.random()*60000)/500),A=500*Math.round(Math.random()*0.7*S/500),net=S-A;
   sim.p.sticker=S;sim.p.aid=A;sim.p.borrow=500*Math.round(Math.min(net,3000+Math.random()*9000)/500);sim.p.years=Math.random()<0.8?4:5;sim.p.guess=100000;sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Same dorm, same sticker price: $70,000 a year. You get $40,000 a year in grants; your roommate gets none. Over 4 years, how much more does your roommate pay?',choices:['$40,000','$120,000','$160,000','$280,000'],correct:2,explain:'The grants are the whole difference: $40,000 a year × 4 years = $160,000. Your roommate pays $280,000; you pay $120,000.'},
  {lvl:'bio',instant:true,q:'College A has a $82,000 sticker price and offers you $52,000 in grants. College B has a $46,000 sticker price and offers $6,000. Which costs you less each year?',choices:['College A, by $10,000 a year','College B, by $36,000 a year','They cost the same'],correct:0,explain:'Net price = sticker − grants. A: $82,000 − $52,000 = $30,000. B: $46,000 − $6,000 = $40,000. The college with the scarier sticker price is $10,000 a year cheaper for you.'},
  {lvl:'honors',instant:true,q:'A college lists $70,000 and gives you $40,000 in grants. What is your discount rate?',choices:['40.0%','42.9%','57.1%','75.0%'],correct:2,explain:'Discount rate = grants ÷ sticker = 40,000 ÷ 70,000 ≈ 57.1%. (42.9% is the share you still pay.) NACUBO’s study projected 57.1% as the average for first-time, full-time students at private nonprofit colleges in 2025-26.'},
  {lvl:'honors',instant:true,q:'You owe $30,000 when repayment starts, at 6.39% APR over 10 years. About what is your monthly payment, and what do you repay in all?',choices:['$250 a month, $30,000 in all','$339 a month, about $40,700 in all','$500 a month, about $60,000 in all'],correct:1,explain:'i = 0.0639 ÷ 12 = 0.005325 and n = 120. M = 30,000 × 0.005325 ÷ (1 − 1.005325⁻¹²⁰) ≈ $338.97. Times 120 months ≈ $40,676: about $10,700 of interest. $250 a month is just $30,000 ÷ 120, which ignores interest.'},
  {lvl:'ap',instant:true,q:'You owe $32,473 at 6.39%. Stretching repayment from 10 years to 20 years does what?',choices:['Halves the payment and keeps the interest the same','Cuts the payment by about a third, and nearly doubles the total interest','Raises both the payment and the interest'],correct:1,explain:'10 years: $366.91 a month, $44,029 repaid. 20 years: $240.01 a month, $57,603 repaid. The payment drops 35%, but you pay interest on a big balance for twice as long, so the interest grows from $16,029 to $29,603 (on $28,000 borrowed).'},
  {lvl:'ap',instant:true,q:'You borrow $7,000 at the start of each of 4 years at 6.39%, and interest builds (simple interest) until you finish. How much interest has built up by then?',choices:['$1,789','$4,473','$7,156','$0: interest starts when you graduate'],correct:1,explain:'Year 1’s loan builds interest for 4 years, year 2’s for 3, and so on: 7,000 × 0.0639 × (4 + 3 + 2 + 1) = $4,473. With an unsubsidized loan, it is added to what you owe, so you start repaying $32,473, not $28,000.'}
 ],
 tour:[
  {title:'The sticker price',text:'The red bar is the sticker price: tuition, fees, room and board for one year, here $70,000. The student next door has no aid and pays all of it.',focus:[14,40,110,336],pause:true,setup:sim=>BioLab.setValues(sim,{sticker:70000,aid:40000,borrow:7000,years:4,rate:6.39,term:10,school:true,show:false})},
  {title:'Grants come off the top',text:'Grants and scholarships are money you never pay back. Yours are $40,000 a year, so your net price is $70,000 − $40,000 = $30,000. Same dorm, same classes, $40,000 a year less.',focus:[176,40,234,336],pause:true},
  {lvl:'honors',title:'The discount rate',text:'Grants ÷ sticker = 40,000 ÷ 70,000 ≈ 57.1%: that is your discount rate. NACUBO’s study projected exactly that, 57.1%, as the average for new full-time students at private nonprofit colleges in 2025-26, up from 48% in 2015-16.',focus:[236,6,152,30],pause:true},
  {title:'Multiply by the years',text:'Four years at the net price is $30,000 × 4 = $120,000, not the $280,000 sticker total. The bottom row adds it up.',focus:[8,356,394,92],pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'A loan moves cost into the future',text:'You borrow $7,000 of the net price each year: $28,000 in all. Interest builds while you are in school, so you finish owing $32,473.',focus:[410,8,386,350],pause:true},
  {title:'Paying it back',text:'Repaid over 10 years at 6.39%, that is $366.91 a month, $44,029 in all. The interest, $16,029, is part of what college really costs: $120,000 + $16,029 = $136,029.',focus:[[410,8,386,350],[588,356,206,92]],pause:true},
  {lvl:'ap',title:'The payment formula',text:'Each month the balance grows by i = 0.0639 ÷ 12, then your payment comes off. Setting the balance to 0 after n = 120 payments gives M = B·i / (1 − (1 + i)⁻ⁿ) = 32,473 × 0.005325 / (1 − 1.005325⁻¹²⁰) ≈ $366.91.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Does a bigger sticker price mean you pay more?</p><ol><li>Turn on <b>Show the answers</b>. Set the sticker to $80,000 and grants to $50,000. Record a trial.</li><li>Now set the sticker to $45,000 and grants to $5,000. Record a trial.</li><li>Try one more pair of your own, or your own college’s numbers.</li></ol><p>Write one sentence: which number should you compare between colleges, and why?</p>',
  honors:'<p><b>Question:</b> How much does a loan really cost?</p><ol><li>With grants fixed, set the loan to $0, $5,000, $10,000 and $15,000 a year. Record <b>Interest you pay</b> each time.</li><li>Repeat at an interest rate of 4% and of 8%.</li></ol><p>Is interest proportional to the amount borrowed? To the rate? Use your table to explain.</p>',
  ap:'<p><b>Question:</b> What does a longer repayment term really buy you?</p><ol><li>Fix a balance. Record the monthly payment and total interest for 5, 10, 15, 20 and 25 years to repay.</li><li>Derive M = B·i / (1 − (1 + i)⁻ⁿ) from the balance after n payments, B(1 + i)ⁿ − M((1 + i)ⁿ − 1)/i = 0.</li></ol><p><b>CER:</b> Claim when a longer term makes sense, with evidence from your table and reasoning from the formula.</p>'},
 terms:[
  {t:'Sticker price',d:'A college’s posted cost of attendance for a year: tuition, fees, room and board.'},
  {t:'Grant (or scholarship)',d:'Aid you never pay back. Loans and work-study are aid too, but they are not grants.'},
  {t:'Net price',d:'Sticker price − grants and scholarships: what your family actually pays or borrows.'},
  {t:'Discount rate',d:'Grants ÷ sticker price, as a percent. Colleges report the average across their students.',lvl:'honors'},
  {t:'APR',d:'Annual percentage rate. A loan at 6.39% APR charges 6.39% ÷ 12 ≈ 0.53% each month.',lvl:'honors'},
  {t:'Amortization',d:'Paying off a loan with equal payments, each covering that month’s interest plus some of the balance.',lvl:'honors'},
  {t:'Unsubsidized loan',d:'A loan that builds interest while you are still in school.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not financial advice.</b> Net price = sticker − grants. The loan you take each year is capped at the net price; your family pays the rest now. Each year’s loan is borrowed on your first day of that year. If interest builds in school, it is simple interest until you finish and is then added to the balance; repayment starts right when you finish (the model ignores any grace period). Then you pay a fixed amount every month: M = B·i / (1 − (1 + i)⁻ⁿ), i = APR ÷ 12, n = 12 × years to repay. Real loans have fees, other repayment plans and rules this leaves out, and colleges may change grants from year to year.</p>'+
 '<p><b>Real numbers used here.</b> 6.39% is the fixed interest rate on federal Direct Loans for undergraduates first paid out from July 1, 2025 to June 30, 2026 (U.S. Department of Education); the rate is reset each year for new loans. NACUBO’s Tuition Discounting Study projected the average discount rate for first-time, full-time undergraduates at private nonprofit colleges at 57.1% for 2025-26, up from 48% in 2015-16, with about 90% of first-time students receiving aid from the college (<a href="https://www.highereddive.com/news/tuition-discount-rate-reaches-57-for-private-nonprofits-nacubo-says/821554/" target="_blank" rel="noopener">Higher Ed Dive</a>).</p>'+
 '<p><b>Find your own numbers.</b> Every college has had to post a net price calculator since 2008 (Higher Education Opportunity Act), and the U.S. Department of Education’s College Scorecard shows each college’s average net price by family income. In Colorado, the <a href="https://www.ucdenver.edu/student-finances/financial-aid/colorado-promise" target="_blank" rel="noopener">Colorado Promise</a> lets Colorado residents at public colleges with family adjusted gross income of $90,000 or less have out-of-pocket tuition and fees refunded through a state tax credit (with a 2.5 GPA requirement), and CU Promise at CU Boulder covers tuition and fees for Pell-eligible Colorado residents. Check each program’s current rules before you count on it.</p>'
};
BioLab.register(SIM);
})();
