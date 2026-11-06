(function(){
'use strict';
const {clamp,rng,txt,pill,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Total views t hours after posting follow a logistic curve: N(t) = K / (1 + e^(−r(t − t0))).
   N′(t) = r·N·(1 − N/K) (views per hour) peaks at t0, where N = K/2. N″(t) = r·N′·(1 − 2N/K) changes sign there. */
const HMAX=72;
function makeVid(seed){let q;
  if(seed===1)q={K:4800,r:0.3,t0:20};
  else{const R=rng(seed*4231+11);for(let i=0;i<200;i++){q={K:Math.round((1500+R()*7500)/100)*100,r:Math.round((0.15+R()*0.3)*100)/100,t0:Math.round((10+R()*30)*2)/2};if(q.r*q.t0>=3.5&&q.r*(HMAX-q.t0)>=4)break;}}
  q.seed=seed;return q;}
const V=sim=>sim.st.vid;
const N=(q,t)=>q.K/(1+Math.exp(-q.r*(t-q.t0)));
const N1=(q,t)=>{const n=N(q,t);return q.r*n*(1-n/q.K);};
const N2=(q,t)=>q.r*N1(q,t)*(1-2*N(q,t)/q.K);
const hourly=(q,h)=>Math.round(N(q,h));
const gain=(q,h)=>hourly(q,h)-hourly(q,h-1);
const shown=sim=>!!(sim.st.peek||(sim.gutS&&sim.gutS.g));
const DAYS=['Fri','Sat','Sun','Mon','Tue'];
const clock=h=>{const m=Math.round((18+h)*60),d=Math.floor(m/1440),mm=m-1440*d,hh=Math.floor(mm/60),mi=mm-60*hh,h12=hh%12===0?12:hh%12;return DAYS[d]+' '+h12+(mi?':'+String(mi).padStart(2,'0'):'')+' '+(hh<12?'am':'pm');};
const hrs=h=>'hour '+fmtNum(h,h%1?1:0);
const f0=v=>Math.round(v).toLocaleString('en-US');
function relabel(sim){[['guess'],['at']].forEach(([id])=>{const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW[id];if(!w)return;const o=w.querySelector('output');if(!o)return;const s=hrs(sim.p[id])+' ('+clock(sim.p[id])+')';if(o.textContent!==s)o.textContent=s;});}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)&&!(sim.guide&&sim.guide.keep)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'viewcurve',hash:'viewcurve',apUnit:16,order:5,tab:'When did the views stop taking off?',kind:'Simulation',prereq:['battery'],
 card:'Guess when your club’s fundraiser video was gaining views fastest, then let the first and second derivatives find the turning point.',
 title:'When did the views stop taking off?',
 lede:{bio:'Total views on a video climb slowly, then fast, then level off. The moment the views were coming in fastest is where the climb stops speeding up and starts slowing down.',
  honors:'Views per hour is the first derivative of total views. Where it peaks, the second derivative changes sign and the total-views curve switches from concave up to concave down: an inflection point.',
  ap:'For a logistic curve N = K / (1 + e^(−r(t − t0))), the rate N′ = rN(1 − N/K) is largest when N = K/2, at t = t0, and the peak rate is rK/4.'},
 scale:'Your club’s video, posted Friday at 6 pm, over its first 72 hours. Dots are the total views at each hour.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your video',
 controls:[
  {id:'guess',label:'Your gut: views were growing fastest at',type:'range',min:0,max:72,step:0.5,def:4,unit:' h',help:'Hours after posting. The orange line marks your answer on the graph.'},
  {id:'at',label:'Check one hour',type:'range',min:0,max:72,step:0.5,def:10,unit:' h',noGut:true,help:'Read the total, the views per hour and how that rate is changing at this hour. The purple line is the tangent there.'}
 ],
 actions:[
  {id:'peek',label:'Skip the guess and show the math',run(sim){sim.st.peek=true;}},
  {id:'newvid',label:'New video',run(sim){sim.st={vid:makeVid(2+Math.floor(Math.random()*1e6))};sim.st.peek=false;clearGut(sim);}}
 ],
 init(){return {vid:makeVid(1)};},step(){},
 metrics:[
  {id:'final',label:'Total views after 72 hours',unit:'views',d:0,min:0,max:null,get:sim=>hourly(V(sim),HMAX)},
  {id:'tot',label:'Total views at the hour you check',unit:'views',d:0,min:0,max:null,get:sim=>N(V(sim),sim.p.at)},
  {id:'rate',label:'Views per hour at that hour',unit:'per hour',d:0,min:0,max:null,get:sim=>shown(sim)?N1(V(sim),sim.p.at):null},
  {id:'acc',label:'Change in views per hour, per hour',unit:'per h²',d:1,lvl:'honors',min:-50,max:50,get:sim=>shown(sim)?N2(V(sim),sim.p.at):null},
  {id:'conc',label:'At that hour, growth is',unit:'',text:true,lvl:'honors',get:sim=>{if(!shown(sim))return '?';const a=N2(V(sim),sim.p.at),q=V(sim);if(Math.abs(a)<0.02*q.r*q.r*q.K/10)return 'at its fastest';return a>0?'speeding up (concave up)':'slowing down (concave down)';}},
  {id:'peakt',label:'Growing fastest at',unit:'h after posting',d:1,min:0,max:72,get:sim=>shown(sim)?V(sim).t0:null},
  {id:'peakr',label:'Fastest growth',unit:'views per hour',d:0,min:0,max:null,get:sim=>shown(sim)?V(sim).r*V(sim).K/4:null},
  {id:'half',label:'Views at the fastest moment',unit:'views',d:0,lvl:'ap',min:0,max:null,get:sim=>shown(sim)?N(V(sim),V(sim).t0):null}
 ],
 graphs:[{id:'second',label:'Views per hour and how fast it changes',custom:true}],defaultGraph:'second',
 plot(sim,ctx,box){const q=V(sim),pk=q.r*q.K/4;const ax=axes(ctx,box,{xmin:0,xmax:HMAX,ymin:-pk*0.5,ymax:pk*1.1,xl:'Hours after posting',yl:'Views per hour'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  const sc=pk/(q.r*q.r*q.K*0.0962);/* scale N″ so its peak shows at about half the height of N′ */
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let t=0;t<=HMAX;t+=0.25){const x=ax.X(t),y=ax.Y(N1(q,t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  if(atLeast('honors')){ctx.strokeStyle=PAL['s5'];ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.beginPath();for(let t=0;t<=HMAX;t+=0.25){const x=ax.X(t),y=ax.Y(N2(q,t)*sc*0.5);t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.setLineDash([]);}
  ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(ax.X(q.t0),ax.Y(pk),6,0,7);ctx.fill();
  const G=sim.gutS;if(G&&G.g){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(G.g.h),ax.Y(N1(q,G.g.h)),6,0,7);ctx.fill();}
  legend(ctx,box.L+10,box.T+12,atLeast('honors')?[{label:'Views per hour (N′)',color:PAL['g-line']},{label:'N″, scaled to fit',color:PAL['s5'],dash:true}]:[{label:'Views per hour',color:PAL['g-line']}]);},
 draw(sim,ctx,vdt,k){relabel(sim);const q=V(sim),sh=shown(sim),G=sim.gutS,fs=12*k,pk=q.r*q.K/4;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=Math.round(36+34*k),R=784,T1=Math.round(44+34*k),B2=Math.round(450-22-22*k),mid=Math.round(T1+(B2-T1)*0.55),B1=mid-Math.round(10*k),T2=mid+Math.round(16*k);
  const X=t=>L+t/HMAX*(R-L);const nmax=Math.ceil(q.K*1.05/500)*500,Y1=n=>B1-n/nmax*(B1-T1);const rmax=Math.ceil(pk*1.2/50)*50,Y2=v=>B2-v/rmax*(B2-T2);
  [[T1,B1],[T2,B2]].forEach(([a,b])=>{ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(L,a,R-L,b-a);});
  /* honors: concavity shading */
  if(sh&&atLeast('honors')){ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.10;ctx.fillRect(L,T1,X(q.t0)-L,B1-T1);ctx.fillStyle=PAL['s1'];ctx.fillRect(X(q.t0),T1,R-X(q.t0),B1-T1);ctx.globalAlpha=1;
   txt(ctx,'Speeding up',X(q.t0)-8,T1+fs+4,{s:fs,w:700,c:PAL['s2'],a:'right'});txt(ctx,'Slowing down',X(q.t0)+8,T1+fs+4,{s:fs,w:700,c:PAL['s1']});}
  /* grid */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;const hs=k>1.3?24:12;
  for(let h=0;h<=HMAX;h+=hs){const x=X(h);ctx.globalAlpha=.6;[[T1,B1],[T2,B2]].forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(x,a);ctx.lineTo(x,b);ctx.stroke();});ctx.globalAlpha=1;txt(ctx,String(h),x,B2+fs+4,{s:fs,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,'Hours after posting (Friday 6 pm)',(L+R)/2,B2+2*fs+8,{s:fs,c:PAL['cv-soft'],a:'center'});
  const ns=(nmax>6000||k>1.3)?2000:1000;for(let n=0;n<=nmax;n+=ns){const y=Y1(n);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,n>=1000?(n/1000)+'k':String(n),L-6,y+4,{s:fs,c:PAL['cv-soft'],a:'right'});}
  const rs=rmax>400?200:rmax>200?100:50;for(let v=0;v<=rmax;v+=rs){const y=Y2(v);ctx.globalAlpha=.6;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(R,y);ctx.stroke();ctx.globalAlpha=1;txt(ctx,String(v),L-6,y+4,{s:fs,c:PAL['cv-soft'],a:'right'});}
  txt(ctx,'Total views',L+6,T1-6,{s:fs,w:700});txt(ctx,'Views gained each hour',L+6,T2-4,{s:fs,w:700});
  /* ap: half the total */
  if(sh&&atLeast('ap')){ctx.strokeStyle=PAL['s3'];ctx.setLineDash([3,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,Y1(q.K/2));ctx.lineTo(R,Y1(q.K/2));ctx.stroke();ctx.setLineDash([]);txt(ctx,'Half of '+f0(q.K)+' = '+f0(q.K/2),R-6,Y1(q.K/2)+fs+4,{s:fs,c:PAL['s3'],a:'right'});}
  /* total views */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.beginPath();for(let t=0;t<=HMAX;t+=0.25){const x=X(t),y=Y1(N(q,t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  ctx.fillStyle=PAL['s2'];for(let h=0;h<=HMAX;h++){ctx.beginPath();ctx.arc(X(h),Y1(hourly(q,h)),2.6,0,7);ctx.fill();}
  /* gains per hour */
  if(sh){const bw=(R-L)/HMAX*0.75;for(let h=1;h<=HMAX;h++){const g=gain(q,h);ctx.fillStyle=Math.abs(h-0.5-q.t0)<0.51?PAL['s3']:PAL['s2'];ctx.globalAlpha=.75;ctx.fillRect(X(h-0.5)-bw/2,Y2(g),bw,B2-Y2(g));}ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2;ctx.beginPath();for(let t=0;t<=HMAX;t+=0.25){const x=X(t),y=Y2(N1(q,t));t?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  else txt(ctx,'Lock in your gut to see views per hour.',(L+R)/2,(T2+B2)/2+5,{s:fs+1,c:PAL['cv-soft'],a:'center'});
  /* tangent at the hour you check */
  if(sh){const a=sim.p.at,na=N(q,a),sl=N1(q,a),w=Math.min(10,HMAX);ctx.save();ctx.beginPath();ctx.rect(L,T1,R-L,B1-T1);ctx.clip();ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(a-w),Y1(na-sl*w));ctx.lineTo(X(a+w),Y1(na+sl*w));ctx.stroke();ctx.restore();ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.arc(X(a),Y1(na),4.5,0,7);ctx.fill();}
  /* marks: gut and math */
  const vline=(h,col,w,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash?[7,5]:[]);ctx.beginPath();ctx.moveTo(X(h),T1);ctx.lineTo(X(h),B1);ctx.moveTo(X(h),T2);ctx.lineTo(X(h),B2);ctx.stroke();ctx.setLineDash([]);};
  const gh=G&&G.g?G.g.h:sim.p.guess;
  if(sh&&(atLeast('honors')||(G&&G.m)))vline(q.t0,PAL['s3'],2.5,false);
  vline(gh,PAL['s4'],3,true);
  /* pills */
  const ps=Math.min(13*k,20);ctx.font='700 '+ps+'px '+BioLab.h.FONT;const items=[[(G&&G.g?'Your gut: ':'Your guess: ')+hrs(gh),PAL['s4']]];
  if(sh&&(atLeast('honors')||(G&&G.m)))items.push(['Fastest: '+hrs(q.t0)+', '+f0(pk)+' views/h',PAL['s3']]);
  let px=R,row=0;const y0=Math.round(8+ps);items.forEach(([s2,c])=>{const w=ctx.measureText(s2).width+ps*1.1;if(px-w<8){row++;px=R;}pill(ctx,s2,px-w/2,y0+row*ps*1.9,c,'#fff',ps);px-=w+8;});},
 narrate(sim){const q=V(sim),a=sim.p.at;
  if(!shown(sim))return `After 3 days the video has ${f0(hourly(q,HMAX))} views. <b>Where is the total-views curve steepest?</b> That is when views were coming in fastest. Drag your guess, then lock it in.`;
  const r1=N1(q,a),r2=N2(q,a);
  if(Math.abs(a-q.t0)<0.75)return `At ${hrs(a)} (${clock(a)}) the video gains about ${f0(r1)} views an hour: <b>its fastest</b>. Here the curve switches from bending upward to bending downward.`;
  return `At ${hrs(a)} (${clock(a)}) the video gains about ${f0(r1)} views an hour, and that rate is <b>${r2>0?'still rising':'falling'}</b>. ${r2>0?'Growth is still speeding up.':'The total still climbs, but the takeoff is over.'}`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'When were the views coming in fastest? Drag the slider here to that hour. The orange line marks your answer on the graph. Then lock it in.',honors:'Before you see views per hour: drag the slider here to the hour you think growth was fastest, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-V(sim).t0),h:g,label:`${hrs(g)} (${clock(g)})`};},
  solve(sim){const q=V(sim);sim.st.peek=true;sim.p.at=q.t0;return {v:0,h:q.t0,label:`${hrs(q.t0)} (${clock(q.t0)})`};},
  how:{bio:'The math looks at the views gained each hour instead of the total. Those climb, peak and fall. The peak is when the video was growing fastest; on the total-views curve it is the steepest point, where the curve stops bending upward and starts bending downward.',
   honors:'Views per hour is N′(t). Its peak is where N″(t) changes from positive to negative: the inflection point of N(t).',
   ap:'For the logistic N = K/(1 + e^(−r(t − t0))), N′ = rN(1 − N/K) is a downward parabola in N, largest at N = K/2. That happens at t = t0, with N′ = rK/4.'},
  compare(sim,g,m){const q=V(sim),rg=N1(q,g.h),pk=q.r*q.K/4,off=g.h-m.h;
   if(Math.abs(off)<=1)return `Your gut was right on: within ${fmtNum(Math.abs(off),1)} h of the fastest moment, ${hrs(m.h)} (${clock(m.h)}), when the video gained about ${f0(pk)} views an hour.`;
   return `You were <b>${fmtNum(Math.abs(off),1)} hours ${off<0?'early':'late'}</b>. At ${hrs(g.h)} the video was gaining about ${f0(rg)} views an hour; at its fastest, ${hrs(m.h)} (${clock(m.h)}), it gained about ${f0(pk)}. <b>Your pick catches ${Math.round(rg/pk*100)}% of the peak rate.</b> ${off<0?'The total was still small then, so the curve looked flat, but it was speeding up.':'By then the total looked big, but the views per hour were already falling.'}`;},
  again(sim){sim.st={vid:makeVid(2+Math.floor(Math.random()*1e6))};sim.st.peek=false;sim.p.guess=4;sim.p.at=10;}
 },
 onTourExit(sim){sim.st.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'After the moment the views were growing fastest, what happens to the total number of views?',choices:['It starts to go down','It keeps going up, but more slowly each hour','It stops changing'],correct:1,explain:'Views gained each hour fall after hour 20, but they are still positive, so the total keeps climbing: from 2,400 views at hour 20 to 4,729 at hour 34. It just climbs more slowly.'},
  {lvl:'bio',instant:true,q:'On the total-views graph, how can you spot when views were growing fastest?',choices:['Where the curve is highest','Where the curve is steepest','Where the curve starts'],correct:1,explain:'Steepness is views per hour. The curve is steepest in the middle of the S, at hour 20, even though it keeps getting higher after that.'},
  {lvl:'honors',instant:true,q:'Between hours 10 and 20, N″(t) > 0. What does that tell you about the video?',choices:['Total views are falling','Views per hour are increasing: growth is speeding up','Views per hour are decreasing'],correct:1,explain:'N″ is the rate of change of N′, the views per hour. Positive N″ means views per hour are rising, and the total-views curve is concave up.'},
  {lvl:'honors',instant:true,q:'Views gained in the hours ending at 18, 19, 20, 21 and 22 were 314, 342, 357, 357 and 342. When was growth fastest?',choices:['Around hour 18','Around hour 20, between the two 357 gains','Around hour 22','At hour 72, when the total is biggest'],correct:1,explain:'The gains climb to 357 in the hour before hour 20, match it in the hour after, then fall. The peak rate is at hour 20, the inflection point of the total-views curve.'},
  {lvl:'ap',instant:true,q:'A logistic model for total views has K = 4,800. How many views does the video have at the moment it is growing fastest?',choices:['1,200','2,400','3,600','4,800'],correct:1,explain:'N′ = rN(1 − N/K) is largest at N = K/2. Half of 4,800 is 2,400 views.'},
  {lvl:'ap',instant:true,q:'Same model, with r = 0.3 per hour. What is the fastest rate of growth?',choices:['90 views per hour','360 views per hour','720 views per hour','1,440 views per hour'],correct:1,explain:'At N = K/2, N′ = r(K/2)(1/2) = rK/4 = 0.3 × 4,800 / 4 = 360 views per hour.'}
 ],
 tour:[
  {title:'Total views',text:'Each dot is the video’s total views at one hour after posting. The total climbs slowly at first, then quickly, then levels off near 4,800: an S shape.',pause:true,setup:sim=>{sim.st.peek=true;BioLab.setValues(sim,{at:10});},focus:sim=>[20,30,770,265]},
  {title:'Views gained each hour',text:'The bars underneath show how many views the video gained in each hour: the rate of growth. They rise, peak and fall.',pause:true},
  {title:'The fastest hour',text:'The bars peak at hour 20, Saturday 2 pm, at about 360 views an hour. On the total-views curve, that is the steepest point.',pause:true,setup:sim=>BioLab.setValues(sim,{at:20})},
  {title:'Speeding up, then slowing down',text:'At hour 10 the video gains about 65 views an hour and that rate is rising. At hour 30, about 65 again, but falling. The total keeps climbing the whole time; only the speed of the climb turns around at hour 20.',pause:true,setup:sim=>BioLab.setValues(sim,{at:30})},
  {lvl:'honors',title:'The inflection point',text:'Before hour 20, N″ > 0: views per hour rise and the curve bends upward (concave up). After it, N″ < 0 and the curve bends downward. The point where concavity changes is the inflection point, and it is where N′ is largest.',pause:true,setup:sim=>BioLab.setValues(sim,{at:20})},
  {lvl:'ap',title:'The logistic model',text:'This curve is N = 4,800 / (1 + e^(−0.3(t − 20))). Its rate N′ = 0.3N(1 − N/4,800) is largest when N = 2,400, half the final total, at t = 20. The peak rate is 0.3 × 4,800 / 4 = 360 views an hour.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does the rate of growth change over the 3 days?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Set <b>Check one hour</b> to 5, 10, 15, 20, 25, 30 and 40. Record a trial each time.</li><li>Graph <b>Trials</b> with the hour on x and views per hour on y.</li></ol><p>Write one sentence: when does the rate peak, and what is the total doing then?</p>',
  honors:'<p><b>Question:</b> Where does the second derivative change sign?</p><ol><li>Record the change in views per hour, per hour, at hours 10, 15, 18, 20, 22, 25 and 30.</li><li>Find where it changes from positive to negative.</li></ol><p>Explain why that hour is the peak of views per hour.</p>',
  ap:'<p><b>Question:</b> Is the fastest moment always at half the final total?</p><ol><li>Press <b>New video</b> four times. Each time record the hour of fastest growth, the views then, and the total after 72 hours.</li></ol><p><b>CER:</b> Use N′ = rN(1 − N/K) to explain the pattern, and say why the 72-hour total is a little less than K for some videos.</p>'},
 terms:[
  {t:'Rate of growth',d:'How many views the video gains per hour. On the total-views graph, the steepness of the curve.'},
  {t:'Inflection point',d:'Where a curve switches from bending upward to bending downward, or the reverse. Here, the moment views were growing fastest.'},
  {t:'First derivative',d:'N′(t): views per hour. Positive while the total grows.',lvl:'honors'},
  {t:'Second derivative',d:'N″(t): how fast the views per hour are changing. Positive means growth is speeding up (concave up); negative means it is slowing down (concave down).',lvl:'honors'},
  {t:'Logistic model',d:'N = K / (1 + e^(−r(t − t0))): S-shaped growth that levels off at K. Its inflection point is at N = K/2.',lvl:'ap'}
 ],
 about:'<p>Total views follow a logistic curve, N(t) = K / (1 + e<sup>−r(t − t0)</sup>), with K = 4,800 views, r = 0.3 per hour and t0 = 20 hours on the default video. Dots are the model’s totals rounded to whole views. <b>New video</b> picks K, r and t0 from a seeded random generator.</p><p><b>This is a simplified model.</b> Real view counts have daily ups and downs (fewer views overnight), jumps when someone with a big following shares the post, and platform rules that change what people see. A logistic curve is a common first model for growth that spreads and then runs out of new people to reach, but it is not a prediction for any real post.</p>'
};
SIM._m={makeVid,N,N1,N2,hourly,gain,clock};
BioLab.register(SIM);
})();
