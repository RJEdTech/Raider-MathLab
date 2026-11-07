(function(){
'use strict';
const {clamp,rng,txt,pill,rr,PAL,FONT,axes,bars,legend,atLeast,fmtNum}=BioLab.h;
/* ---------- the model ----------
   6 students, 3 schools with 2 seats each. Each school ranks applicants: students in its walk zone first, then by one
   shared lottery number (lower is better). Everyone except You turns in their true ranking. You's true ranking is
   Aspen > Birch > Cedar; the student chooses what to turn in.
   Boston (immediate acceptance): round r, every student without a seat applies to the r-th school on their list;
   schools fill their open seats by priority, and those seats are final.
   Deferred acceptance (student-proposing Gale-Shapley): every student not being held applies to the next school on
   their list; each school holds its best applicants so far, up to its seats, and turns down the rest. Repeat until
   no one is turned down.
   Anyone left without a listed school is placed by the district at Dogwood, a school across town nobody listed. */
const SCH=['Aspen','Birch','Cedar','Dogwood'],INI=['A','B','C','D'],SEATS=[2,2,2],NS=6;
const SET0=[{pref:[0,1,2],lot:4,zone:-1},{pref:[0,1,2],lot:1,zone:0},{pref:[0,1,2],lot:3,zone:-1},{pref:[2,1,0],lot:2,zone:-1},{pref:[1,0,2],lot:5,zone:-1},{pref:[1,2,0],lot:6,zone:0}];
const PERMS=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const cache={};
function makeSet(seed){if(cache['s'+seed])return cache['s'+seed];let S;
 if(!seed)S=SET0.map(x=>({pref:x.pref.slice(),lot:x.lot,zone:x.zone}));
 else{const R=rng(seed*104729+7);for(let t=0;t<200;t++){const lots=[1,2,3,4,5,6];for(let i=5;i>0;i--){const j=Math.floor(R()*(i+1));[lots[i],lots[j]]=[lots[j],lots[i]];}
   S=[];for(let i=0;i<NS;i++)S.push({pref:i===0?[0,1,2]:PERMS[Math.floor(R()*6)].slice(),lot:lots[i],zone:i===0?-1:(R()<0.35?Math.floor(R()*3):-1)});
   if(S.slice(1).filter(x=>x.pref[0]===0).length>=2)break;}}
 cache['s'+seed]=S;return S;}
const prio=(S,i,s)=>(S[i].zone===s?0:100)+S[i].lot;
function run(S,lists,rule){const held=[[],[],[]],rounds=[];const L=Math.max(...lists.map(l=>l.length));
 if(rule==='da'){const next=Array(NS).fill(0);let free=[...Array(NS).keys()];
  for(let r=0;r<12;r++){const props=[];free.forEach(i=>{if(next[i]<lists[i].length){props.push([i,lists[i][next[i]]]);next[i]++;}});if(!props.length)break;const rej=[];
   for(let s=0;s<3;s++){const pool=held[s].concat(props.filter(p=>p[1]===s).map(p=>p[0]));pool.sort((a,b)=>prio(S,a,s)-prio(S,b,s));held[s]=pool.slice(0,SEATS[s]);pool.slice(SEATS[s]).forEach(i=>rej.push([i,s]));}
   free=rej.map(x=>x[0]);rounds.push({props,held:held.map(h=>h.slice()),rej});}}
 else{const asg=Array(NS).fill(-1);
  for(let r=0;r<L;r++){const props=[];for(let i=0;i<NS;i++)if(asg[i]<0&&r<lists[i].length)props.push([i,lists[i][r]]);if(!props.length)break;const rej=[];
   for(let s=0;s<3;s++){const pool=props.filter(p=>p[1]===s).map(p=>p[0]).sort((a,b)=>prio(S,a,s)-prio(S,b,s)),room=SEATS[s]-held[s].length;
    pool.forEach((i,q)=>{if(q<room){held[s].push(i);asg[i]=s;}else rej.push([i,s]);});}
   rounds.push({props,held:held.map(h=>h.slice()),rej});}}
 const asg=Array(NS).fill(-1);held.forEach((h,s)=>h.forEach(i=>asg[i]=s));const listed=asg.map(a=>a>=0);const fin=held.map(h=>h.slice());fin.push([]);
 /* anyone left over is placed by the district at Dogwood, a school across town that nobody listed */
 [...Array(NS).keys()].filter(i=>asg[i]<0).sort((a,b)=>S[a].lot-S[b].lot).forEach(i=>{fin[3].push(i);asg[i]=3;});
 return {rounds,fin,asg,listed};}
/* place on the TRUE list: 1 = first choice ... 3 = third; 4 = Dogwood, which nobody wants */
const place=(S,i,s)=>s===3?4:S[i].pref.indexOf(s)+1;
function blocking(S,res){const out=[];for(let i=0;i<NS;i++){const a=res.asg[i];for(const s of S[i].pref){if(s===a)break;const f=res.fin[s];if(f.length<SEATS[s]||f.some(j=>prio(S,j,s)>prio(S,i,s)))out.push([i,s]);}}return out;}
/* rules in force */
const capOf=sim=>atLeast('ap')&&String(sim.p.cap)==='2'?2:3;
function yourList(sim,f,sc){const t=[0,1,2],a=f!==undefined?+f:+sim.p.first;let b=sc!==undefined?+sc:+sim.p.second;const l=[a];if(b!==a)l.push(b);t.forEach(s=>{if(!l.includes(s))l.push(s);});return l.slice(0,capOf(sim));}
function result(sim,list,rule){const S=makeSet(sim.p.seed|0),cap=capOf(sim),lists=S.map((x,i)=>i===0?list:x.pref.slice(0,cap));return {S,res:run(S,lists,rule||sim.p.rule),lists};}
function M(sim){const list=yourList(sim),key=(sim.p.seed|0)+'|'+sim.p.rule+'|'+capOf(sim)+'|'+list.join('');if(cache[key])return cache[key];const r=result(sim,list);r.key=key;r.list=list;r.R=r.res.rounds.length;cache[key]=r;return r;}
const listLabel=l=>l.map(s=>SCH[s]).join(' › ');
const ord=n=>['','1st','2nd','3rd','4th'][n]||n+'th';
const youGet=(S,res)=>{const s=res.asg[0];return {s,n:place(S,0,s),listed:res.listed[0]};};
const youText=(S,res)=>{const y=youGet(S,res);return y.s===3?'Dogwood, across town (placed by the district: not on your list)':`${SCH[y.s]}, your ${ord(y.n)} choice`;};
const firsts=(S,res)=>S.filter((x,i)=>res.asg[i]===x.pref[0]).length;
const top2=(S,res)=>S.filter((x,i)=>res.asg[i]<3&&x.pref.indexOf(res.asg[i])<2).length;
const unlisted=res=>res.listed.filter(x=>!x).length;
const ruleName=r=>r==='da'?'deferred acceptance':'the Boston rule';
function R(sim){const m=M(sim),st=sim.st;if(st.key!==m.key){st.key=m.key;st.r=0;}st.r=clamp(st.r,0,m.R);return st.r;}
const done=sim=>R(sim)>=M(sim).R;
/* best list for You under the current rule: try every list allowed; ties keep the honest list */
function bestList(sim,rule){const cap=capOf(sim),opts=[];PERMS.forEach(p=>{const l=p.slice(0,cap);if(!opts.some(o=>o.join()===l.join()))opts.push(l);});
 let best=null;const S=makeSet(sim.p.seed|0);opts.forEach(l=>{const r=result(sim,l,rule),v=place(S,0,r.res.asg[0]);if(!best||v<best.v-1e-9)best={v,l,r};});
 const hon=result(sim,[0,1,2].slice(0,cap),rule),hv=place(S,0,hon.res.asg[0]);if(hv<=best.v+1e-9)best={v:hv,l:[0,1,2].slice(0,cap),r:hon};return best;}
const score=(S,res)=>place(S,0,res.asg[0]);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function fixPair(sim,changed){if(+sim.p.first!==+sim.p.second)return;const other=changed==='first'?'second':'first',v=+sim.p[changed];const alt=[0,1,2].find(s=>s!==v);sim.p[other]=String(alt);if(sim.ui&&sim.ui.ctl&&sim.ui.ctl[other])sim.ui.ctl[other].set(String(alt));}
function setList(sim,l){sim.p.first=String(l[0]);sim.p.second=String(l[1]!==undefined?l[1]:[0,1,2].find(s=>s!==l[0]));if(sim.ui&&sim.ui.ctl){['first','second'].forEach(c=>{if(sim.ui.ctl[c])sim.ui.ctl[c].set(sim.p[c]);});}}

/* ---------- layout ---------- */
const PCX=[140,400,660],PW=232;
const tokR=k=>13*k+4;
function seatXY(s,q){return {x:PCX[s]-56+q*112,y:0};}
function layout(k){const top=46,nameY=top+20*k,seatsY=nameY+16*k,slotT=seatsY+8,tr=tokR(k),slotH=2*tr+12*k+14,pb=slotT+slotH+10,wy=Math.min(pb+44*k+18+tr,440-22*k-tr-44*k-10),wl=wy-tr-12;return {top,nameY,seatsY,slotT,tr,slotH,pb,wl,wy};}
function stateAt(m,r){if(r<=0)return {held:[[],[],[]],rej:[],props:[]};const R=m.res.rounds[r-1];return {held:R.held,rej:R.rej,props:R.props};}

const SIM={
 id:'schoolmatch',hash:'schoolmatch',apUnit:20,order:2,tab:'The school match',kind:'Simulation',
 card:'Rank three high schools, decide whether to list your true favorite first, then watch two matching rules play out round by round on the same lists.',
 title:'The school match: is it safe to tell the truth?',
 lede:{bio:'Many districts, including Denver, match students to schools with an algorithm. You rank schools; each school ranks applicants by its own priorities. The rule decides whether honesty is safe. Under the old Boston rule, listing a popular school first can cost you. Under deferred acceptance, it can’t.',
  honors:'A match is stable when there is no blocking pair: no student and school who would both rather be together than with what they got. Deferred acceptance always produces a stable match. The Boston rule often does not.',
  ap:'Student-proposing deferred acceptance (Gale and Shapley, 1962) is strategy-proof for students: no list does better than your true ranking. That guarantee needs you to rank every school. Cap the list at 2, as Denver’s old rule did, and strategy creeps back in.'},
 scale:'One small district: 6 students, 3 schools (Aspen, Birch and Cedar, all made up) with 2 seats each. Schools rank applicants by walk zone first, then one shared lottery number (#1 goes first).',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your list and the rules',
 controls:[
  {id:'first',label:'Your 1st choice',type:'seg',def:'0',options:[{v:'0',l:'Aspen'},{v:'1',l:'Birch'},{v:'2',l:'Cedar'}],onChange(sim){fixPair(sim,'first');clearGut(sim);}},
  {id:'second',label:'Your 2nd choice',type:'seg',def:'1',options:[{v:'0',l:'Aspen'},{v:'1',l:'Birch'},{v:'2',l:'Cedar'}],onChange(sim){fixPair(sim,'second');clearGut(sim);},help:'Your 3rd choice is whatever school is left.'},
  {id:'rule',label:'The district’s matching rule',type:'seg',def:'boston',noGut:true,options:[{v:'boston',l:'Boston rule'},{v:'da',l:'Deferred acceptance'}],onChange:clearGut,help:'Boston: seats filled in round 1 are final, so first choices go first. Deferred acceptance: every seat is only held until the last round.'},
  {id:'block',label:'Show blocking pairs',type:'toggle',def:false,lvl:'honors',noGut:true,help:'A student and a school who would both rather be together: the student prefers it, and it seated someone with lower priority (or has an empty seat).'},
  {id:'cap',label:'Each family may list',type:'seg',def:'3',lvl:'ap',noGut:true,options:[{v:'3',l:'All 3 schools'},{v:'2',l:'Only 2 schools'}],onChange:clearGut,help:'Denver’s old Boston rule let families list 2 schools; its deferred acceptance rule allows 5.'},
  {id:'seed',label:'Which district (set of students)',type:'range',min:0,max:99,step:1,def:0,noGut:true,onChange:clearGut,help:'District 0 is the one in the walkthrough. Other numbers shuffle the other students’ lists, lottery numbers and walk zones.'}
 ],
 actions:[
  {id:'next',label:'Next round',primary:true,run(sim){R(sim);sim.st.r=Math.min(M(sim).R,sim.st.r+1);}},
  {id:'back',label:'Back a round',run(sim){R(sim);sim.st.r=Math.max(0,sim.st.r-1);}},
  {id:'run',label:'Run every round',run(sim){R(sim);sim.st.r=M(sim).R;}},
  {id:'honest',label:'Use my true ranking',run(sim){setList(sim,[0,1,2]);clearGut(sim);}},
  {id:'newset',label:'New district',run(sim){BioLab.setValues(sim,{seed:1+Math.floor(Math.random()*99)});}}
 ],
 init(sim){return {key:null,r:0};},
 step(){},
 initVis(sim){sim.vis.pos=null;},
 metrics:[
  {id:'round',label:'Round',text:true,get:sim=>{const r=R(sim),n=M(sim).R;return r===0?`Lists are in (${n} rounds to go)`:`${r} of ${n}${r===n?': done':''}`;}},
  {id:'you',label:'Your school',text:true,get:sim=>done(sim)?youText(M(sim).S,M(sim).res):'Run every round to see'},
  {id:'place',label:'Your school’s place on your true list',unit:'',d:0,min:1,max:3,get:sim=>done(sim)?place(M(sim).S,0,M(sim).res.asg[0]):null},
  {id:'first1',label:'Students at their 1st choice',unit:'of 6',d:0,min:0,max:6,get:sim=>done(sim)?firsts(M(sim).S,M(sim).res):null},
  {id:'top2',label:'Students at one of their top 2',unit:'of 6',d:0,lvl:'honors',min:0,max:6,get:sim=>done(sim)?top2(M(sim).S,M(sim).res):null},
  {id:'bp',label:'Blocking pairs',unit:'',d:0,lvl:'honors',min:0,max:6,get:sim=>done(sim)?blocking(M(sim).S,M(sim).res).length:null},
  {id:'unl',label:'Placed at a school they didn’t list',unit:'of 6',d:0,lvl:'ap',min:0,max:6,get:sim=>done(sim)?unlisted(M(sim).res):null}
 ],
 graphs:[{id:'cmp',label:'Your school under each list',custom:true}],defaultGraph:'cmp',
 plot(sim,ctx,box){const S=makeSet(sim.p.seed|0),cap=capOf(sim),opts=[];PERMS.forEach(p=>{const l=p.slice(0,cap);if(!opts.some(o=>o.join()===l.join()))opts.push(l);});
  const cats=opts.map(l=>l.map(s=>INI[s]).join('')+(l.join('')==='012'.slice(0,cap)?' (true)':'')),bos=opts.map(l=>4-score(S,result(sim,l,'boston').res)),da=opts.map(l=>4-score(S,result(sim,l,'da').res));
  const ax=axes(ctx,box,{xmin:0,xmax:opts.length,ymin:0,ymax:3.6,xcats:cats,yl:'Your school (3 = 1st choice)',xticks:false,yd:0});
  const w=0.34;opts.forEach((l,i)=>{[[bos[i],PAL['s4'],-w/2-0.02],[da[i],PAL['s2'],w/2+0.02]].forEach(([v,c,o])=>{const x0=ax.X(i+.5+o-w/2),x1=ax.X(i+.5+o+w/2);ctx.fillStyle=c;ctx.fillRect(x0,ax.Y(v),x1-x0,ax.Y(0)-ax.Y(v));});});
  legend(ctx,box.L+10,box.T+8,[{label:'Boston rule',color:PAL['s4']},{label:'Deferred acceptance',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){const m=M(sim),S=m.S,r=R(sim),st=stateAt(m,r),Lo=layout(k),da=sim.p.rule==='da',fin=r>=m.R;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* targets */
  const tgt=[];st.held.forEach((h,s)=>h.forEach((i,q)=>{tgt[i]={x:PCX[s]-56+q*112,y:Lo.slotT+Lo.tr+6,s};}));
  const dog=fin&&r>0?m.res.fin[3]:[];
  for(let i=0;i<NS;i++)if(!tgt[i])tgt[i]={x:70+i*132,y:Lo.wy,s:-1,dog:dog.includes(i)};
  if(!sim.vis.pos||sim.vis.pos.length!==NS||(sim.tour&&sim.tour.on&&vdt===0))sim.vis.pos=tgt.map(t=>({x:t.x,y:t.y}));
  const a=1-Math.exp(-9*(vdt||0.016));sim.vis.pos.forEach((p,i)=>{p.x+=(tgt[i].x-p.x)*a;p.y+=(tgt[i].y-p.y)*a;});
  /* schools */
  for(let s=0;s<3;s++){const x=PCX[s]-PW/2;rr(ctx,x,Lo.top,PW,Lo.pb-Lo.top,12);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
   txt(ctx,SCH[s],PCX[s],Lo.nameY,{s:15*k,w:800,c:PAL['cv-ink'],a:'center'});
   txt(ctx,'2 seats',PCX[s],Lo.seatsY,{s:12*k,c:PAL['cv-soft'],a:'center'});
   for(let q=0;q<2;q++){const cx=PCX[s]-56+q*112;rr(ctx,cx-50,Lo.slotT,100,Lo.slotH,8);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.setLineDash(da&&!fin?[5,4]:[]);ctx.stroke();ctx.setLineDash([]);}}
  /* waiting area */
  txt(ctx,r===0?'Lists are in: every student’s ranking, best first':(fin?(dog.length?'Placed by the district at Dogwood (not listed)':''):'Still looking for a seat'),r===0?14:786,Lo.wl,{s:12*k,w:700,c:PAL['cv-soft'],a:r===0?'left':'right'});
  /* proposals this round: arrows from the waiting row up to the school */
  if(r>0&&!(sim.tour&&sim.tour.on&&false)){st.rej.forEach(([i,s])=>{const p=sim.vis.pos[i];ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(p.x,p.y-Lo.tr);ctx.lineTo(PCX[s],Lo.pb);ctx.stroke();ctx.setLineDash([]);});}
  /* blocking pairs */
  const bps=fin&&atLeast('honors')&&sim.p.block?blocking(S,m.res):[];
  bps.forEach(([i,s])=>{const p=sim.vis.pos[i];ctx.strokeStyle=PAL['cv-inc'];ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo((p.x+PCX[s])/2,Lo.pb+40,PCX[s],Lo.pb);ctx.stroke();ctx.setLineDash([]);});
  /* tokens */
  const rejNow=new Map(st.rej.map(([i,s])=>[i,s]));
  for(let i=0;i<NS;i++){const p=sim.vis.pos[i],you=i===0,t=tgt[i];
   ctx.fillStyle=you?PAL['rj']:PAL['s2'];ctx.beginPath();ctx.arc(p.x,p.y,Lo.tr,0,7);ctx.fill();
   if(t.dog){ctx.strokeStyle=PAL['cv-inc'];ctx.lineWidth=3;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(p.x,p.y,Lo.tr+3,0,7);ctx.stroke();ctx.setLineDash([]);}
   txt(ctx,you?'You':String(i),p.x,p.y+1,{s:(you?12:14)*k,w:800,c:'#fff',a:'center',b:'middle'});
   const tag=(t.s>=0&&S[i].zone===t.s)?'near '+INI[t.s]:'#'+S[i].lot;
   if(t.s>=0){txt(ctx,tag,p.x,p.y+Lo.tr+13*k,{s:12*k,w:600,c:PAL['cv-soft'],a:'center'});}
   else if(t.dog){txt(ctx,'Dogwood',p.x,p.y+Lo.tr+14*k,{s:12*k,w:800,c:PAL['cv-inc'],a:'center'});}
   else{const l=m.lists[i];txt(ctx,l.map(s=>INI[s]).join(' › '),p.x,p.y+Lo.tr+14*k,{s:12*k,w:700,c:you?PAL['rj']:PAL['cv-ink'],a:'center'});
    txt(ctx,'#'+S[i].lot,p.x,p.y+Lo.tr+29*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
    if(S[i].zone>=0)txt(ctx,'near '+INI[S[i].zone],p.x,p.y+Lo.tr+44*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
    if(rejNow.has(i))txt(ctx,'✕ '+INI[rejNow.get(i)],p.x+Lo.tr+2,p.y-Lo.tr+4,{s:12*k,w:800,c:PAL['s1']});}}
  /* header and footer */
  txt(ctx,(da?'Deferred acceptance':'Boston rule')+(r===0?'':` · round ${r} of ${m.R}`)+(fin&&r>0?' · done':''),400,26*Math.min(k,1.3),{s:14*Math.min(k,1.4),w:800,c:PAL['cv-ink'],a:'center'});
  if(fin&&r>0){const y=youGet(S,m.res);txt(ctx,y.s===3?'You: Dogwood (not on your list)':`You: ${SCH[y.s]} (your ${ord(y.n)} choice)`,14,440,{s:14*Math.min(k,1.4),w:800,c:PAL['rj']});
   txt(ctx,`${firsts(S,m.res)} of 6 at their 1st choice`,786,440,{s:12*k,w:700,c:PAL['cv-soft'],a:'right'});}
  else txt(ctx,'You turn in: '+listLabel(m.list),14,440,{s:13*Math.min(k,1.4),w:700,c:PAL['rj']});},
 infoPanel(sim){const m=M(sim),S=m.S;
  return `<p class="p-h"><b>Who applied, and how schools rank them</b></p><div style="overflow-x:auto"><table style="font-size:13px"><thead><tr><th>Student</th><th>List turned in</th><th>Lottery #</th><th>Walk zone</th></tr></thead><tbody>${S.map((x,i)=>`<tr${i===0?' style="font-weight:700"':''}><td>${i===0?'You':'Student '+i}</td><td>${listLabel(m.lists[i])}${i===0?` (true: ${listLabel([0,1,2])})`:''}</td><td>${x.lot}</td><td>${x.zone>=0?SCH[x.zone]:'none'}</td></tr>`).join('')}</tbody></table></div><p style="font-size:13px">Each school seats students in its walk zone first, then lower lottery numbers. Only you choose what to turn in; the other five turn in their true rankings.</p>`;},
 narrate(sim){const m=M(sim),S=m.S,r=R(sim),da=sim.p.rule==='da';
  if(r===0)return da?'Everyone has turned in a ranked list. <b>Under deferred acceptance</b>, each school will only <i>hold</i> its best applicants until the very end, so applying to a popular school first costs you nothing. Press <b>Next round</b>.':'Everyone has turned in a ranked list. <b>Under the Boston rule</b>, round 1 seats are final, so a school fills up with the students who ranked it first. Press <b>Next round</b>.';
  const R0=m.res.rounds[r-1],yp=R0.props.find(p=>p[0]===0),yr=R0.rej.find(p=>p[0]===0);
  let you='';if(yp)you=yr?` You applied to ${SCH[yp[1]]} and were turned down.`:` You applied to ${SCH[yp[1]]} and ${da?'are being held there for now':'got a seat'}.`;
  if(r<m.R)return (da?`<b>Round ${r}:</b> each student not being held applies to the next school on their list. Each school holds its best applicants so far (walk zone, then lottery) and turns down the rest, even students it held last round.`:`<b>Round ${r}:</b> each student without a seat applies to choice number ${r} on their list. Schools fill only the seats still open, and those seats are final.`)+you;
  const y=youGet(S,m.res);return `<b>Done after ${m.R} round${m.R===1?'':'s'}.</b> You get ${youText(S,m.res)}. ${firsts(S,m.res)} of 6 students are at their 1st choice${atLeast('honors')?`, and there ${blocking(S,m.res).length===1?'is 1 blocking pair':'are '+blocking(S,m.res).length+' blocking pairs'}`:''}.`+you;},
 gut:{better:'lower',controls:['first','second'],lockLabel:'Lock in my list',mathLabel:'Let the math try every list',
  ask:{bio:'You like <b>Aspen</b> best, then <b>Birch</b>, then <b>Cedar</b>. Aspen is the most popular school. Pick your 1st and 2nd choice here: do you put Aspen first, or play it safe? The district’s rule is named at the top of the picture. Then lock in your list.'},
  lock(sim){const l=yourList(sim),{S,res}=result(sim,l);return {v:score(S,res),l,label:`${listLabel(l)}: you get ${youText(S,res)}`};},
  solve(sim){const b=bestList(sim,sim.p.rule);setList(sim,b.l);sim.st.key=null;R(sim);sim.st.r=M(sim).R;const {S,res}=result(sim,b.l);return {v:score(S,res),l:b.l,label:`${listLabel(b.l)}: you get ${youText(S,res)}`};},
  how:{bio:'The math runs the match for every list you could turn in and keeps the one that gets you the school you like best. Under deferred acceptance it never has to search: your true ranking always does at least as well as any other list. Under the Boston rule, the best list depends on everyone else’s lists and lottery numbers. The math can see those. A real family can’t.',
   honors:'For each possible list, the math runs the rounds, finds your school, and checks for blocking pairs. Under deferred acceptance, your true list is always among the best, and the result is stable. Under the Boston rule, it often is neither.'},
  compare(sim,g,m){const rule=sim.p.rule,other=rule==='da'?'boston':'da',S=makeSet(sim.p.seed|0);
   const gO=result(sim,g.l,other).res,hon=[0,1,2].slice(0,capOf(sim)),hR=result(sim,hon,rule).res,hO=result(sim,hon,other).res,gR=result(sim,g.l,rule).res;
   let h=g.v<=m.v+1e-9?`Your gut was right on: under ${ruleName(rule)}, your list gets you <b>${youText(S,gR)}</b>, and no list does better.`:`Under ${ruleName(rule)}, your list gets you ${youText(S,gR)}. The best list, ${listLabel(m.l)}, gets you <b>${youText(S,result(sim,m.l,rule).res)}</b>.`;
   const gHon=g.l.join('')===hon.join('');h+=gHon?` Under ${ruleName(other)}, the same list would get you ${youText(S,gO)}.`:` Under ${ruleName(other)}, your list would get you ${youText(S,gO)}, and your true ranking would get you ${youText(S,hO)}.`;
   const hd=result(sim,hon,'da').res,bd=bestList(sim,'da');h+=score(S,hd)<=bd.v+1e-9?` <b>Under deferred acceptance, telling the truth is safe:</b> no list beats your true ranking.`:` With only ${capOf(sim)} schools allowed, even deferred acceptance can punish honesty: the best list here is ${listLabel(bd.l)}.`;
   h+=` Across all 6 students, with your list: Boston puts ${firsts(S,result(sim,g.l,'boston').res)} at their 1st choice and ${top2(S,result(sim,g.l,'boston').res)} in their top 2; deferred acceptance puts ${firsts(S,result(sim,g.l,'da').res)} and ${top2(S,result(sim,g.l,'da').res)}.`;
   return h;},
  again(sim){sim.p.seed=1+Math.floor(Math.random()*99);sim.p.first='0';sim.p.second='1';sim.st.key=null;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'District 0, Boston rule. You turn in your true ranking: Aspen, then Birch, then Cedar. Where do you end up?',choices:['Aspen','Birch','Cedar'],correct:2,explain:'Round 1: Aspen’s 2 seats go to Student 1 (walk zone) and Student 2 (lottery #3, ahead of your #4). Birch fills its 2 seats with students who ranked it first. In round 2 Birch is already full, so in round 3 you take a Cedar seat.'},
  {lvl:'bio',instant:true,q:'Same district, but now the rule is deferred acceptance. You turn in your true ranking. Where do you end up?',choices:['Aspen','Birch','Cedar'],correct:1,explain:'Aspen turns you down in round 1, just as before. But Birch’s seats were only held, not final. In round 2 you apply to Birch, and your lottery #4 beats Student 5’s #6, so Birch holds you and turns Student 5 down. You end at Birch, your 2nd choice.'},
  {lvl:'bio',instant:true,q:'Under deferred acceptance, could any list you turn in get you a better school than your true ranking?',choices:['Yes, if you guess right about the other students','No, your true ranking always does at least as well','Only if you rank Cedar first'],correct:1,explain:'This is strategy-proofness. A school only holds you until someone it ranks higher applies, and applying to a school you like more never uses up your chance at the next one. So putting a school first that you like less can only hurt.'},
  {lvl:'honors',instant:true,q:'District 0, Boston rule, true ranking: you get Cedar. Why is (You, Birch) a blocking pair?',choices:['You prefer Birch, and Birch seated Students 4 and 5, whose lottery numbers are worse than yours','Birch has an empty seat','You and Birch are in the same walk zone'],correct:0,explain:'You would rather have Birch than Cedar, and Birch would rather have you (lottery #4) than Student 4 (#5) or Student 5 (#6). Both sides would break the match, so it is unstable. They got the seats only because they ranked Birch first.'},
  {lvl:'honors',instant:true,q:'Which rule gives more students their 1st choice in district 0, when everyone turns in their true ranking?',choices:['Boston: 5 of 6, against 4 of 6','Deferred acceptance: 5 of 6, against 4 of 6','They tie'],correct:0,explain:'Boston puts 5 of 6 at their stated 1st choice, but only because you lose out for being honest. Deferred acceptance puts 4 at their 1st choice and all 6 in their top 2, with no blocking pairs. And once families learn to game Boston, its lists stop showing what people really want.'},
  {lvl:'ap',instant:true,q:'Families may list only 2 schools. Under deferred acceptance, is turning in your true top 2 always the best you can do?',choices:['Yes, deferred acceptance is always strategy-proof','No: if both of your top 2 are out of reach, listing a safer school could keep you from being placed at a school you never listed','Only under the Boston rule'],correct:1,explain:'Strategy-proofness needs a full list. With a cap, a student whose top 2 are both out of reach ends up unmatched and gets placed by the district, so listing a school you can surely get may beat honesty. That is one reason Denver allows 5 choices.'},
  {lvl:'ap',instant:true,q:'Under deferred acceptance, a school that held you in round 2 turns you down in round 3. Why?',choices:['A student it ranks higher applied in round 3 after being turned down somewhere else','Seats held in round 2 expire','You were placed by lottery'],correct:0,explain:'Holds are never final until the last round. A student turned down by a more popular school moves to their next choice, and if this school ranks them above you, it swaps you out. That is the “deferred” in deferred acceptance.'}
 ],
 tour:[
  {title:'The lists',text:'Six students, three schools, two seats each. Under each student is the ranking they turned in and their lottery number. Schools seat students in their walk zone first, then the lowest lottery numbers. You (red) turned in your true ranking: Aspen, Birch, Cedar.',pause:true,setup:sim=>{BioLab.setValues(sim,{seed:0,rule:'boston',first:'0',second:'1',cap:'3'});BioLab.reset(sim);}},
  {title:'Boston, round 1',text:'Everyone applies to their 1st choice, and those seats are final. Three students want Aspen. It takes Student 1 (walk zone) and Student 2 (#3). Your #4 loses. Birch fills both seats with students who ranked it first.',pause:true,setup:sim=>{BioLab.reset(sim);M(sim);R(sim);sim.st.r=1;}},
  {title:'Boston, rounds 2 and 3',text:'Now you apply to Birch, your 2nd choice. It is already full. In round 3 you get Cedar, your 3rd choice, even though Birch seated two students with worse lottery numbers than yours. Being honest cost you.',pause:true,setup:sim=>{R(sim);sim.st.r=M(sim).R;}},
  {title:'Deferred acceptance, round 1',text:'Same lists, new rule. Round 1 looks the same, but every seat is only <b>held</b> (dashed). Nothing is final yet.',pause:true,setup:sim=>{BioLab.setValues(sim,{rule:'da'});BioLab.reset(sim);R(sim);sim.st.r=1;}},
  {title:'Round 2: a school can change its mind',text:'Turned down by Aspen, you apply to Birch. Birch compares you with the two students it was holding. Your #4 beats Student 5’s #6, so Birch holds you and turns Student 5 down.',pause:true,setup:sim=>{R(sim);sim.st.r=2;}},
  {title:'Done: honesty was safe',text:'Student 5 moves on to Cedar, and no one else is turned down, so the match is final. You get Birch, your 2nd choice, without having to guess. Try any other list and you can’t do better.',pause:true,setup:sim=>{R(sim);sim.st.r=M(sim).R;}},
  {lvl:'honors',title:'Blocking pairs',text:'Back to Boston’s result. The red dashed line marks a blocking pair: you would rather have Birch, and Birch would rather have you than a student it seated. Deferred acceptance’s result has none: it is stable.',pause:true,setup:sim=>{BioLab.setValues(sim,{rule:'boston',block:true});BioLab.reset(sim);R(sim);sim.st.r=M(sim).R;}}
 ],
 onTourExit(sim){BioLab.setValues(sim,{block:false});BioLab.reset(sim);},
 lab:{bio:'<p><b>Question:</b> Under which rule does your list matter?</p><ol><li>Boston rule: try all 6 lists (pick your 1st and 2nd choice; the 3rd is what is left). Press <b>Run every round</b> and record a trial each time.</li><li>Switch to deferred acceptance and repeat.</li><li>Look at the graph: one bar per list under each rule.</li></ol><p>Write one sentence: under which rule is telling the truth safe?</p>',
  honors:'<p><b>Question:</b> Which rule leaves blocking pairs?</p><ol><li>For districts 0 to 5, turn in your true ranking and record <b>Blocking pairs</b> and <b>Students at one of their top 2</b> under each rule.</li><li>Turn on <b>Show blocking pairs</b> to see who they are.</li></ol><p>Explain why deferred acceptance never leaves a blocking pair.</p>',
  ap:'<p><b>Question:</b> When does a list cap bring strategy back?</p><ol><li>Set <b>Each family may list</b> to 2. For districts 0 to 20, compare your true top 2 with the best list under deferred acceptance (use the gut-vs-math panel, or the graph).</li><li>Record <b>Placed at a school they didn’t list</b> under both rules with a cap of 2 and with all 3.</li></ol><p><b>CER:</b> Claim when honesty stops being safe, evidence from your districts, and reasoning from how deferred acceptance works.</p>'},
 terms:[
  {t:'Deferred acceptance',d:'A matching rule (Gale and Shapley, 1962): students apply in order of their lists; schools hold their best applicants so far and turn down the rest; it repeats until no one is turned down.'},
  {t:'Boston rule (immediate acceptance)',d:'Students apply to their 1st choices first, and those seats are final; then 2nd choices compete for what is left, and so on.'},
  {t:'Strategy-proof',d:'No one can get a better result by turning in a false list. Deferred acceptance is strategy-proof for students who may list every school.'},
  {t:'Priority',d:'How a school ranks applicants. Here: walk zone first, then lottery number.'},
  {t:'Blocking pair',d:'A student and a school who would both rather be matched with each other than with what they got.',lvl:'honors'},
  {t:'Stable matching',d:'A matching with no blocking pairs. Deferred acceptance always finds one.',lvl:'honors'}
 ],
 about:'<p><b>The model.</b> 6 made-up students, 3 made-up schools with 2 seats each. A school ranks applicants by walk zone first, then one lottery number shared by every school. The other five students turn in their true rankings; only your list changes. Students left without any school on their list are placed by the district at Dogwood, a made-up school across town that nobody listed and that you like least. With every school listed, that never happens here. “Your school’s place” is its place on your true ranking. The math tries every list you could turn in (6 of them) under the rule in force and keeps the best, choosing your true ranking when it ties.</p><p><b>What is simplified.</b> Real districts have thousands of students, many schools, sibling and other priorities, and families who all strategize at once. The algorithm can’t create good seats: if strong schools are scarce, matching only shares out the scarcity, and priorities like walk zones are policy choices built into the inputs. This tool rates the matching rules, never real schools.</p><p><b>Why this counts as a good algorithm.</b> The rules are public, the same lists always give the same result, the result is stable, and honesty is safe, so families don’t need inside knowledge. Under the Boston rule, “sophisticated families who understand the rules of the game benefit” at others’ expense (<a href="https://www2.nber.org/reporter/2014number1/pathak.html" target="_blank" rel="noopener">Pathak, NBER Reporter, 2014</a>). Compare <a href="#beatbot">Will a human ever see my job application?</a>, where a hidden screener rewards whoever games its keywords.</p><p><b>Real numbers.</b> <b>New York City:</b> until 2003, about 30,000 students a year were assigned to a school that was nowhere on their list. After the switch to student-proposing deferred acceptance, in the first year (2003–04, for fall 2004 entry) only about 3,000 were, out of more than 90,000 applicants (<a href="https://stanford.edu/%7Ealroth/papers/nycAEAPP.pdf" target="_blank" rel="noopener">Abdulkadiroğlu, Pathak and Roth, 2005</a>). <b>Denver:</b> in 2012 Denver Public Schools moved from the Boston rule with 2 choices to deferred acceptance with 5 (<a href="https://www2.nber.org/reporter/2014number1/pathak.html" target="_blank" rel="noopener">Pathak, 2014</a>). An evaluation of 2012 to 2014 found about 80% of students matched to one of their choices, but gaps remained in participation and in families’ access to higher-performing schools, and demographics and location affected match success (<a href="https://crpe.org/an-evaluation-of-denvers-schoolchoice-process-2012-2014-is-the-school-enrollment-system-working-for-families/" target="_blank" rel="noopener">CRPE, 2015</a>). <b>Doctors:</b> the National Resident Matching Program adopted a redesigned algorithm by Alvin Roth and Elliott Peranson in 1997. Gale and Shapley published deferred acceptance in 1962, and Roth and Shapley shared the 2012 Nobel Prize in Economic Sciences (<a href="https://www.nobelprize.org/prizes/economic-sciences/2012/popular-information/" target="_blank" rel="noopener">Nobel Prize, 2012</a>).</p>'
};
BioLab.register(SIM);
})();
