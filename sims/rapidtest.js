(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* 10,000 people like you. prev = share sick before testing, sens = P(+ | sick), spec = P(− | not sick). All illustrative. */
const NPOP=10000;
const P=sim=>{const pv=sim.p.prev/100,se=sim.p.sens/100,sp=sim.p.spec/100;return {pv,se,sp};};
function counts(sim){const {pv,se,sp}=P(sim),S=NPOP*pv,H=NPOP-S;return {S,H,TP:S*se,FN:S*(1-se),FP:H*(1-sp),TN:H*sp};}
const two=sim=>!!(sim.p.second&&atLeast('ap'));
const post1=sim=>{const c=counts(sim);return c.TP/(c.TP+c.FP);};
/* chance you are sick given your result(s); a second positive uses the first answer as the new starting chance */
function post(sim){const p1=post1(sim);if(!two(sim))return p1;const {se,sp}=P(sim);return se*p1/(se*p1+(1-sp)*(1-p1));}
/* the group that got the same result(s) as you, per 10,000 */
function group(sim){const c=counts(sim);if(!two(sim))return {sick:c.TP,well:c.FP};const {se,sp}=P(sim);return {sick:c.TP*se,well:c.FP*(1-sp)};}
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||sim.st.peek>=3||(GS(sim)&&GS(sim).g));
const peekLv=sim=>shown(sim)?3:(sim.st.peek||0);
const f1=v=>v.toFixed(1),n0=v=>Math.round(v).toLocaleString('en-US');
const pct=v=>(v*100).toFixed(1)+'%';
const ctlPct=v=>(Math.round(v*10)/10).toString()+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function box(ctx,x,y,w,h,fill,stroke,lab,sub,k,fg){h=Math.max(h,(sub?36:24)*k);if(sub){ctx.font=(12*k)+'px '+FONT;w=Math.max(w,ctx.measureText(sub).width+12);}rr(ctx,x-w/2,y-h/2,w,h,8);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}
 txt(ctx,lab,x,y+(sub?-3*k:5*k),{s:14*k,w:700,c:fg||PAL['cv-ink'],a:'center'});if(sub)txt(ctx,sub,x,y+13*k,{s:12*k,c:fg||PAL['cv-soft'],a:'center'});}
function arrow(ctx,x1,y1,x2,y2,lab,k,col,side){ctx.strokeStyle=col||PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
 if(lab){const mx=(x1+x2)/2,my=(y1+y2)/2;txt(ctx,lab,mx+(side||0),my+(y2<y1?-6:14)*1,{s:12*k,c:PAL['cv-soft'],a:'center'});}}

const SIM={
 id:'rapidtest',hash:'rapidtest',apUnit:14,order:3,tab:'Is the positive real?',kind:'Simulation',
 card:'Your home test says positive. Guess the chance you are really sick, then let 10,000 imaginary people show you.',
 title:'Your rapid test says positive. Are you really sick?',
 lede:{bio:'A test that is right most of the time can still give lots of false alarms when the illness is rare. The trick is to picture 10,000 people like you and count who tests positive.',
  honors:'You want P(sick | positive), not P(positive | sick). A two-way table of 10,000 people turns the base rate, the sensitivity and the specificity into counts you can divide.',
  ap:'Bayes’ rule: P(sick | +) = P(+ | sick)·P(sick) / [P(+ | sick)·P(sick) + P(+ | not sick)·P(not sick)]. A second positive uses the first answer as the new starting chance.'},
 scale:'10,000 imaginary people who all take the test. Counts are rounded to whole people. Every test value here is illustrative, not the spec of a real test.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The test',
 controls:[
  {id:'guess',label:'Your gut: the chance you are really sick',type:'range',min:0,max:100,step:1,def:50,unit:'%'},
  {id:'prev',label:'How common the illness is right now (your chance before testing)',type:'range',min:0.5,max:30,step:0.5,def:1,unit:'%',noGut:true,onChange:clearGut,help:'With no symptoms and no known exposure, your chance before the test is about the share of people who have it right now. Symptoms or a sick contact raise it a lot.'},
  {id:'sens',label:'Test catches this share of sick people (sensitivity)',type:'range',min:50,max:99,step:1,def:80,unit:'%',noGut:true,onChange:clearGut},
  {id:'spec',label:'Test clears this share of healthy people (specificity)',type:'range',min:90,max:99.9,step:0.1,def:99,unit:'%',noGut:true,onChange:clearGut,help:'99% sounds perfect, but it means 1 in every 100 healthy people gets a false positive.'},
  {id:'view',label:'Show the counts as',type:'seg',def:'tree',lvl:'honors',noGut:true,options:[{v:'tree',l:'Tree diagram'},{v:'table',l:'Two-way table'}]},
  {id:'second',label:'You take a second test, and it is also positive',type:'toggle',def:false,lvl:'ap',noGut:true,onChange:clearGut,help:'Assumes the two results are independent once you know whether a person is sick.'},
  {id:'reveal',label:'Show the counts now',type:'toggle',def:false,help:'Normally the counts appear once you lock in your gut answer.'}
 ],
 init(){return {peek:0};},step(){},
 metrics:[
  {id:'post',label:'Chance you are really sick',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?100*post(sim):null},
  {id:'pos',label:'Positives out of 10,000',unit:'people',d:0,min:0,max:4000,get:sim=>shown(sim)?(()=>{const g=group(sim);return g.sick+g.well;})():null},
  {id:'fp',label:'False positives among them',unit:'people',d:0,min:0,max:1000,get:sim=>shown(sim)?group(sim).well:null},
  {id:'off',label:'Your gut is off by',unit:'points',d:1,min:0,max:100,get:sim=>shown(sim)?Math.abs(sim.p.guess-100*post(sim)):null},
  {id:'indep',label:'Independence check',text:true,lvl:'honors',get:sim=>{const p1=post1(sim);return `P(sick) = ${ctlPct(sim.p.prev)}, but P(sick | positive) = ${pct(p1)}. They differ, so “sick” and “tests positive” are not independent: the result tells you something.`;}},
  {id:'bayes',label:'Bayes’ rule',text:true,lvl:'ap',get:sim=>{const {pv,se,sp}=P(sim),num=se*pv,den=num+(1-sp)*(1-pv);return `P(sick | +) = (${se.toFixed(2)} × ${(+pv.toFixed(4))}) / (${se.toFixed(2)} × ${(+pv.toFixed(4))} + ${(+(1-sp).toFixed(4))} × ${(+(1-pv).toFixed(4))}) = ${num.toFixed(4)} / ${den.toFixed(4)} = ${(num/den).toFixed(3)}`+(two(sim)?`. After a second positive: ${post(sim).toFixed(3)}`:'');}}
 ],
 draw(sim,ctx,vdt,k){const c=counts(sim),lv=peekLv(sim),G=GS(sim),tab=atLeast('honors')&&sim.p.view==='table',kk=k,big=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(408,0,392,450);
  const SICK=PAL['s1'],WELL=PAL['s2'],q='?';
  if(!tab){/* tree diagram */
   const xr=62,x1=200,x2=338,ys=118,yh=332,sp=(Math.round(sim.p.prev*10)/10),fp=(Math.round((100-sim.p.spec)*10)/10);
   box(ctx,xr,225,100,54,PAL['card'],PAL['line'],'10,000','people',kk);
   arrow(ctx,xr+50,212,x1-50,ys+12);arrow(ctx,xr+50,238,x1-50,yh-12);
   box(ctx,x1,ys,100,54,SICK,null,n0(c.S),big?'sick':sp+'% sick',kk,'#fff');box(ctx,x1,yh,100,54,WELL,null,n0(c.H),big?'not sick':(Math.round((100-sim.p.prev)*10)/10)+'% not sick',kk,'#fff');
   const leaf=(x,y,n,lab,pos,on)=>{box(ctx,x,y,104,48,on?(pos?PAL['card']:PAL['cv-bg']):PAL['cv-bg'],pos?PAL['s4']:PAL['line'],on?n0(n):q,lab,kk);};
   arrow(ctx,x1+50,ys-10,x2-52,ys-56);arrow(ctx,x1+50,ys+10,x2-52,ys+56);arrow(ctx,x1+50,yh-10,x2-52,yh-56);arrow(ctx,x1+50,yh+10,x2-52,yh+56);
   leaf(x2,ys-62,c.TP,big?'test +':'test + ('+sim.p.sens+'%)',true,lv>=1);leaf(x2,ys+62,c.FN,big?'test −':'test − ('+(100-sim.p.sens)+'%)',false,lv>=1);
   leaf(x2,yh-62,c.FP,big?'false +':'false + ('+fp+'%)',true,lv>=2);leaf(x2,yh+62,c.TN,big?'test −':'test − ('+(Math.round(sim.p.spec*10)/10)+'%)',false,lv>=2);
   txt(ctx,big?'Tree: 10,000 people':'Tree: 10,000 people like you',20,24*kk,{s:13*kk,w:700,c:PAL['cv-ink']});}
  else{/* two-way table */
   const X=[24,140,236,322],Y=[70,130,190,250],cw=[110,90,86,80];
   txt(ctx,'Two-way table: 10,000 people',20,24*kk,{s:13*kk,w:700,c:PAL['cv-ink']});
   const cell=(i,j,s,col,b)=>txt(ctx,s,X[i]+(i?cw[i]/2:0),Y[j],{s:(j===0||i===0?13:15)*kk,w:b?700:400,c:col||PAL['cv-ink'],a:i?'center':'left'});
   cell(1,0,'Test +',PAL['s4'],1);cell(2,0,'Test −',null,1);cell(3,0,'Total',null,1);
   cell(0,1,'Sick',SICK,1);cell(0,2,'Not sick',WELL,1);cell(0,3,'Total',null,1);
   const sh1=lv>=1,sh2=lv>=2,all=lv>=2;
   cell(1,1,sh1?n0(c.TP):q,SICK,1);cell(2,1,sh1?n0(c.FN):q);cell(3,1,n0(c.S));
   cell(1,2,sh2?n0(c.FP):q,WELL,1);cell(2,2,sh2?n0(c.TN):q);cell(3,2,n0(c.H));
   cell(1,3,all?n0(c.TP+c.FP):q,PAL['s4'],1);cell(2,3,all?n0(c.FN+c.TN):q);cell(3,3,'10,000');
   ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;[100,160,220].forEach(y=>{ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(400,y);ctx.stroke();});
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;rr(ctx,X[1]+4,Y[0]-24,cw[1]-8,Y[3]-Y[0]+38,8);ctx.stroke();
   if(lv>=3)txt(ctx,'Your column: '+n0(c.TP)+' sick out of '+n0(c.TP+c.FP),24,310*1,{s:13*kk,w:700,c:PAL['cv-ink']});
   if(lv>=3)txt(ctx,'= '+pct(post1(sim))+' of positives are real',24,310+22*kk,{s:13*kk,c:PAL['cv-ink']});}
  /* everyone with your result */
  const g=group(sim),tot=g.sick+g.well,U=[1,2,5,10,20,50].find(u=>tot/u<=300)||50,ns=Math.round(g.sick/U),nw=Math.round(g.well/U),n=ns+nw;
  const cols=20,rows=Math.max(1,Math.ceil(n/cols)),sz=Math.min(17,Math.floor((big?220:300)/Math.max(rows,1))),gx=424,gy=big?104:96;
  txt(ctx,(big?(two(sim)?'Positive twice: ':'Tested positive: '):(two(sim)?'Everyone who tested positive twice: ':'Everyone who tested positive: '))+n0(tot),gx,30*kk,{s:13*kk,w:700,c:PAL['cv-ink']});
  txt(ctx,U===1?'Each square is 1 person':`Each square is ${U} people`,gx,30*kk+18*kk,{s:12*kk,c:PAL['cv-soft']});
  for(let i=0;i<n;i++){const r=Math.floor(i/cols),cc=i%cols,x=gx+cc*(sz+1),y=gy+r*(sz+1);
   if(lv>=3){ctx.fillStyle=i<ns?SICK:WELL;ctx.fillRect(x,y,sz,sz);}else{ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.7;ctx.fillRect(x,y,sz,sz);ctx.globalAlpha=1;}}
  const by=Math.min(gy+rows*(sz+1)+26*kk,404);
  if(lv>=3){ctx.fillStyle=SICK;ctx.fillRect(gx,by-11*kk,12*kk,12*kk);txt(ctx,'really sick: '+n0(g.sick),gx+18*kk,by,{s:12*kk,w:700,c:PAL['cv-ink']});
   const wx=big?gx:gx+180*kk,wy=big?by+18*kk:by;ctx.fillStyle=WELL;ctx.fillRect(wx,wy-11*kk,12*kk,12*kk);txt(ctx,'false alarm: '+n0(g.well),wx+18*kk,wy,{s:12*kk,w:700,c:PAL['cv-ink']});
   pill(ctx,(big?'Sick: ':'Really sick: ')+pct(post(sim)),big?650:600,436-8*kk,PAL['rj'],'#fff',14*Math.min(kk,1.5));}
  else txt(ctx,big?'Which are really sick?':'Which of these are really sick? Lock in your gut to see.',gx,by,{s:12*kk,c:PAL['cv-soft']});
  if(G&&G.g)txt(ctx,(big?'Gut: ':'Your gut: ')+Math.round(G.g.guess)+'%',gx,436-4*kk-(lv>=3&&!big?26*kk:0),{s:12*kk,w:700,c:PAL['s4']});},
 narrate(sim){const c=counts(sim),p=post(sim),g=group(sim);
  if(!shown(sim))return `Before the test, ${ctlPct(sim.p.prev)} of people have it. The test catches ${sim.p.sens}% of sick people and wrongly flags ${(Math.round((100-sim.p.spec)*10)/10)}% of healthy ones. <b>Your result is positive. How worried should you be?</b>`;
  if(two(sim))return `Two positives in a row: of the ${n0(g.sick+g.well)} people per 10,000 who would get that, about ${n0(g.sick)} are sick. <b>A second positive pushes the chance to ${pct(p)}</b>, because false alarms rarely repeat in this model.`;
  if(c.FP>c.TP)return `Of ${n0(c.TP+c.FP)} positives, only ${n0(c.TP)} are really sick: ${pct(p)}. <b>The healthy group is so big that its few false alarms outnumber the real cases.</b>`;
  return `Of ${n0(c.TP+c.FP)} positives, ${n0(c.TP)} are really sick: ${pct(p)}. <b>The illness is common enough that real cases outnumber false alarms.</b>`;},
 gut:{better:'lower',controls:['guess'],lockLabel:'Lock in my gut answer',
  ask:{bio:'Your test just said positive. Drag the slider here to the chance you think you are really sick, from 0% to 100%. Go with your first feeling, then lock it in.',
   honors:'Before you build the table: drag the slider here to your gut value of P(sick | positive), then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-100*post(sim)),guess:sim.p.guess,label:`${Math.round(sim.p.guess)}% chance I am sick`};},
  solve(sim){const p=100*post(sim);sim.p.guess=p;return {v:0,guess:p,label:`${f1(p)}%`};},
  how:{bio:'Picture 10,000 people like you. Find how many are sick and how many of them test positive. Then find how many healthy people get a false positive. Your chance is the real positives divided by all the positives.',
   honors:'Fill a two-way table of 10,000 people from the base rate, the sensitivity and the specificity. P(sick | positive) is the sick count in the Test + column divided by that column’s total.',
   ap:'Bayes’ rule: P(sick | +) = P(+ | sick)·P(sick) / P(+), where P(+) = P(+ | sick)·P(sick) + P(+ | not sick)·P(not sick).'},
  compare(sim,g,m){const gr=group(sim),tot=gr.sick+gr.well,off=Math.abs(g.guess-m.guess),gs=g.guess/100*tot,before=sim.p.prev;
   const tail=` Either way, the positive moved your chance from ${ctlPct(before)} to ${f1(m.guess)}%, so it matters: follow the test’s instructions and a doctor’s advice.`;
   if(off<3)return `Your gut was right on, within ${f1(off)} points. You already sense how the base rate and the false alarms trade off.`+tail;
   return `Your gut was off by <b>${f1(off)} percentage points</b>. Out of the ${n0(tot)} people per 10,000 with a result like yours, your gut expects about <b>${n0(gs)}</b> to be sick; the count says <b>${n0(gr.sick)}</b>. ${g.guess>m.guess?'Most people guess high because they forget how many healthy people take the test.':'You guessed low: when the illness is this common, most positives are real.'}`+tail;},
  again(sim){const pv=[0.5,1,2,3,5,10,15,20],sn=[65,70,75,80,85,90,95],spc=[97,98,98.5,99,99.5,99.8];const R=a=>a[Math.floor(Math.random()*a.length)];
   sim.p.prev=R(pv);sim.p.sens=R(sn);sim.p.spec=R(spc);sim.p.guess=50;sim.p.reveal=false;sim.p.second=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'An illness is rare: 1 person in 1,000 has it. A test is right 99% of the time for sick people and 99% of the time for healthy people. You test positive. What is the chance you are sick?',choices:['About 99%: the test is 99% accurate','About 50%','About 9%: most positives are false alarms when the illness is this rare'],correct:2,explain:'Out of 100,000 people, 100 are sick and 99 of them test positive. Of the 99,900 healthy people, 1% (999) also test positive. Only 99 of 1,098 positives are real: about 9%.'},
  {lvl:'bio',instant:true,q:'Same test (99% right both ways), but now it is the middle of a big outbreak: 20% of people have the illness. What happens to the chance a positive is real?',choices:['It drops','It stays about the same','It rises to about 96%'],correct:2,explain:'Out of 10,000 people, 2,000 are sick and 1,980 test positive. Of 8,000 healthy people, 80 get false positives. 1,980 of 2,060 positives are real: about 96%. The same test means more when the illness is common.'},
  {lvl:'bio',instant:true,q:'A test catches 80% of sick people. 100 sick people take it. How many of them are told they are negative?',choices:['0: a negative means you are healthy','20','80'],correct:1,explain:'It misses 20% of sick people: 20 false negatives. That is why a single negative test does not prove you are healthy.'},
  {lvl:'honors',instant:true,q:'The box says P(positive | sick) = 80%. Is P(sick | positive) also 80%?',choices:['Yes, conditional probabilities work both ways','No: it depends on how common the illness is, and here it is about 44.7%','No: it is always 20%'],correct:1,explain:'P(positive | sick) looks only at sick people. P(sick | positive) looks only at people who tested positive, a group that includes 99 false alarms per 10,000. With 1% prevalence and 99% specificity it is 80 / 179 ≈ 44.7%.'},
  {lvl:'honors',instant:true,q:'P(sick) = 1%, and P(sick | positive) = 44.7%. Are “being sick” and “testing positive” independent?',choices:['Yes, because both are probabilities about the same people','No: knowing the result changes the chance a lot, so they are not independent','You cannot tell without the specificity'],correct:1,explain:'Two events are independent when P(A | B) = P(A). Here 44.7% is far from 1%, so they are dependent. That is exactly what you want from a test.'},
  {lvl:'ap',instant:true,q:'Prevalence 5%, sensitivity 90%, specificity 95%. Use Bayes’ rule: what is P(sick | positive)?',choices:['90%','About 48.6%','4.5%','95%'],correct:1,explain:'P(+) = 0.90 × 0.05 + 0.05 × 0.95 = 0.045 + 0.0475 = 0.0925. P(sick | +) = 0.045 / 0.0925 ≈ 0.486.'},
  {lvl:'ap',instant:true,q:'With 1% prevalence, 80% sensitivity and 99% specificity, one positive gives 44.7% and a second positive gives about 98.5%. Why might the real chance after two positives be lower than 98.5%?',choices:['Two positives can never be more convincing than one','The math assumes the two results are independent given your illness status; if whatever caused a false positive can happen again, a second positive adds less','Sensitivity drops on the second test'],correct:1,explain:'The 98.5% treats the second test like a fresh coin flip for a healthy person. If something about you or your sample tends to trigger false positives, the two results are linked and the second one is less new information.'}
 ],
 tour:[
  {title:'Picture 10,000 people like you',text:'Imagine 10,000 people who all take this test. Right now 1% of people have the illness: that is 100 people. The other 9,900 do not.',pause:true,setup:sim=>{BioLab.setValues(sim,{prev:1,sens:80,spec:99,view:'tree',second:false,reveal:false,guess:50});sim.st.peek=0;}},
  {title:'The test on the sick',text:'The test catches 80% of sick people: 80 of the 100 test positive. The other 20 get a false negative.',pause:true,setup:sim=>{sim.st.peek=1;}},
  {title:'The test on the healthy',text:'The test clears 99% of healthy people. That sounds great, but 1% of 9,900 is 99 healthy people who get a false positive.',pause:true,setup:sim=>{sim.st.peek=2;}},
  {title:'Everyone who tested positive',text:'You are somewhere in this group: 80 sick people plus 99 false alarms, 179 positives in all. The red squares are really sick.',pause:true,setup:sim=>{sim.st.peek=3;},focus:[408,0,392,450]},
  {title:'Your chance',text:'80 out of 179 is 44.7%. A positive raised your chance from 1% to 44.7%, but it is still less likely than not that you are sick, because the healthy group is so much bigger.',pause:true,setup:sim=>{sim.st.peek=3;}},
  {title:'When the illness is common',text:'Now 10% of people have it: 1,000 sick, 800 true positives, and 90 false positives. 800 out of 890 is 89.9%. The same test means much more when the illness is common.',pause:true,setup:sim=>{sim.st.peek=3;BioLab.setValues(sim,{prev:10});}},
  {lvl:'honors',title:'The two-way table',text:'The same counts fit in a two-way table. Your result is the Test + column: P(sick | positive) is the sick count in that column divided by its total.',pause:true,setup:sim=>{sim.st.peek=3;BioLab.setValues(sim,{prev:1,view:'table'});}},
  {lvl:'ap',title:'A second positive',text:'Bayes’ rule again, now starting from 44.7%: 0.80 × 0.447 / (0.80 × 0.447 + 0.01 × 0.553) ≈ 98.5%. False alarms rarely happen twice in a row, if the two tests are independent.',pause:true,setup:sim=>{sim.st.peek=3;BioLab.setValues(sim,{prev:1,view:'tree',second:true});}}
 ],
 lab:{bio:'<p><b>Question:</b> How does the chance a positive is real depend on how common the illness is?</p><ol><li>Turn on <b>Show the counts now</b>. Keep the test at 80% and 99%.</li><li>Record a trial with the illness at 0.5%, 1%, 2%, 5%, 10% and 20%.</li><li>Graph <b>Trials</b> with how common it is on x and the chance you are sick on y.</li></ol><p>Write one sentence: when is a positive result most trustworthy?</p>',
  honors:'<p><b>Question:</b> Which matters more for a positive result: sensitivity or specificity?</p><ol><li>At 1% prevalence, raise sensitivity from 60% to 99% and record P(sick | positive) at each end.</li><li>Put sensitivity back to 80% and raise specificity from 95% to 99.9%. Record again.</li></ol><p>Use the two-way table to explain why one of them moves the answer far more.</p>',
  ap:'<p><b>Question:</b> How many positives in a row does it take to be 95% sure?</p><ol><li>At 1% prevalence, 80% sensitivity and 99% specificity, find P(sick | +) for one positive and for two.</li><li>Repeat at 0.5% prevalence and 97% specificity.</li></ol><p><b>CER:</b> Use Bayes’ rule as your reasoning, and name the assumption that makes the second step valid.</p>'},
 terms:[
  {t:'Base rate',d:'How common something is before you have any test result. Here, the share of people who have the illness right now.'},
  {t:'False positive',d:'A positive result for someone who does not have the illness.'},
  {t:'False negative',d:'A negative result for someone who does have the illness.'},
  {t:'Conditional probability',d:'P(A | B): the chance of A when you already know B happened. P(sick | positive) counts only the people who tested positive.',lvl:'honors'},
  {t:'Sensitivity',d:'P(positive | sick): the share of sick people the test catches.',lvl:'honors'},
  {t:'Specificity',d:'P(negative | not sick): the share of healthy people the test correctly clears.',lvl:'honors'},
  {t:'Two-way table',d:'A table of counts split two ways, here by illness and by test result.',lvl:'honors'},
  {t:'Independent events',d:'A and B are independent when P(A | B) = P(A): knowing B does not change the chance of A.',lvl:'honors'},
  {t:'Bayes’ rule',d:'P(A | B) = P(B | A)·P(A) / P(B). It turns the test’s accuracy into the chance you care about.',lvl:'ap'}
 ],
 about:'<p><b>Illustrative numbers only.</b> The prevalence, sensitivity and specificity here are made-up values in the general range reported for home rapid tests. They are not the specifications of any real test or illness. Real tests list their own numbers in their instructions.</p><p>The model pictures 10,000 people with the same chance of being sick before testing. Symptoms, a sick contact or a local outbreak raise your own starting chance, and the answer changes a lot with it. Counts are rounded to whole people; percentages use the exact values. The second test assumes the two results are independent once you know whether a person is sick, which repeat tests may not be.</p><p><b>This is a math model, not medical advice.</b> If you test positive, follow the test’s instructions and the advice of a doctor or your local public health guidance, not this tool.</p>'
};
BioLab.register(SIM);
})();
