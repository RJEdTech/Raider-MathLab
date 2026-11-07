(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,legend,atLeast,fmtNum}=BioLab.h;
/* A fictional private college. Three groups of admitted students. For a scholarship a (dollars a year), a student pays S − a,
   and the chance a student in the group enrolls is logistic in that price: P(a) = 1 / (1 + e^((S − a − W)/s)),
   where W is the price at which half the group would enroll and s sets how quickly the chance changes.
   Expected net tuition revenue from the group: R(a) = N · P(a) · (S − a). */
const GR=[
 {v:'fans',name:'First-choice fans',short:'Fans',N:300,W:66000,who:'This college is their first choice.'},
 {v:'shop',name:'Comparison shoppers',short:'Shoppers',N:500,W:40000,who:'Strong students with other good offers.'},
 {v:'tight',name:'Tight budgets',short:'Tight budget',N:400,W:20000,who:'Families who cannot stretch far.'}];
const DEF_AID=10000;
const gi=sim=>Math.max(0,GR.findIndex(g=>g.v===sim.p.group));
const Sv=sim=>sim.p.sticker,sv=sim=>sim.p.spread;
function aidOf(sim,i){const st=sim.st||{};return i===gi(sim)?clamp(sim.p.aid,0,Sv(sim)):clamp((st.aids&&st.aids[i]!=null)?st.aids[i]:DEF_AID,0,Sv(sim));}
const P=(sim,i,a)=>1/(1+Math.exp((Sv(sim)-a-GR[i].W)/sv(sim)));
const R=(sim,i,a)=>GR[i].N*P(sim,i,a)*(Sv(sim)-a);
/* R is log-concave in a, so the best award is where d/da ln R = (1 − P)/s − 1/(S − a) crosses 0 */
function best(sim,i){const S=Sv(sim),s=sv(sim),d=a=>(1-P(sim,i,a))/s-1/(S-a);if(d(0)<=0)return 0;let lo=0,hi=S-1e-6;for(let k=0;k<80;k++){const m=(lo+hi)/2;d(m)>0?lo=m:hi=m;}return (lo+hi)/2;}
const anyway=(sim,i,a)=>GR[i].N*P(sim,i,0)*a;          /* aid dollars to students who would enroll with no scholarship */
const moved=(sim,i,a)=>GR[i].N*(P(sim,i,a)-P(sim,i,0));  /* extra students the scholarship brings in */
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(sim.gutS&&(sim.gutS.g||sim.gutS.m)));
const $=v=>'$'+Math.round(v).toLocaleString('en-US');
const $h=v=>'$'+(Math.round(v/100)*100).toLocaleString('en-US');
const $m=v=>'$'+(v/1e6).toFixed(2)+' million';
const pc=v=>(100*v).toFixed(1)+'%';
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function score(sim){const i=gi(sim),a=aidOf(sim,i);return {v:R(sim,i,a),i,aid:a,p:P(sim,i,a),label:`a ${$h(a)} scholarship: ${$m(R(sim,i,a))} from ${GR[i].name.toLowerCase()}`};}
function setAll(sim,aids){sim.st.aids=aids.slice();BioLab.setValues(sim,{aid:aids[gi(sim)],show:true});}

const SIM={
 id:'aidoptimizer',hash:'aidoptimizer',apUnit:19,order:2,tab:'The Aid Optimizer',kind:'Simulation',
 card:'Run enrollment at a fictional college: guess the scholarship that brings in the most tuition, then see who the money really goes to.',
 title:'The Aid Optimizer: you set the price',
 lede:{bio:'Switch chairs. You run enrollment at a private college, and your job is to bring in tuition money. A bigger scholarship gets more students to say yes, but each one pays less. Somewhere in between is the award that brings in the most.',
  honors:'The chance a student enrolls follows a logistic curve in the price they pay. Revenue is that chance × the net price × the number admitted. The best award is where the next dollar of aid stops paying for itself: marginal revenue = 0.',
  ap:'R(a) = N·P(a)·(S − a) with P logistic, so P′ = P(1 − P)/s. Setting R′(a) = 0 gives S − a = s / (1 − P(a)): the price each student pays at the optimum depends on how many are still undecided.'},
 scale:'A fictional private college with $60,000 tuition and 1,200 admitted students in three groups. The groups and their curves are made up for illustration.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your aid office',
 controls:[
  {id:'group',label:'Which group are you pricing?',type:'seg',def:'shop',noGut:true,options:GR.map(g=>({v:g.v,l:g.name})),
   onChange(sim){clearGut(sim);const i=gi(sim);const a=(sim.st&&sim.st.aids)?sim.st.aids[i]:DEF_AID;if(Math.abs(sim.p.aid-a)>1e-9)BioLab.setValues(sim,{aid:a});}},
  {id:'aid',label:'Scholarship for this group ($ a year per student)',type:'range',min:0,max:60000,step:500,def:DEF_AID,unit:'',
   onChange(sim){if(sim.st&&sim.st.aids)sim.st.aids[gi(sim)]=sim.p.aid;},help:'Every student in the group gets the same award. Your pick for the gut answer.'},
  {id:'show',label:'Show the revenue',type:'toggle',def:false,noGut:true,help:'Off: you set the award by feel first.'},
  {id:'sticker',label:'Tuition sticker price ($ a year)',type:'range',min:40000,max:75000,step:1000,def:60000,unit:'',lvl:'honors',noGut:true,onChange:clearGut},
  {id:'spread',label:'Logistic scale s: how gradually families respond to price ($)',type:'range',min:3000,max:15000,step:500,def:7000,unit:'',lvl:'ap',noGut:true,onChange:clearGut,help:'Small s: a few dollars flip many decisions. Large s: families respond gradually.'}
 ],
 actions:[
  {id:'best',label:'Set this group to its best award',lvl:'honors',run(sim){const i=gi(sim),a=best(sim,i);sim.st.aids[i]=a;BioLab.setValues(sim,{aid:a,show:true});}},
  {id:'bestall',label:'Price every group at its best',lvl:'honors',run(sim){setAll(sim,GR.map((g,i)=>best(sim,i)));}},
  {id:'flat',label:`Same $${(DEF_AID/1000).toFixed(0)},000 for everyone`,run(sim){setAll(sim,GR.map(()=>DEF_AID));}}
 ],
 init(sim){return {aids:GR.map(()=>DEF_AID)};},step(){},
 metrics:[
  {id:'p',label:'Chance an admitted student in this group enrolls',unit:'%',d:1,min:0,max:100,get:sim=>{const i=gi(sim);return 100*P(sim,i,aidOf(sim,i));}},
  {id:'enroll',label:'Expected students who enroll from this group',unit:'students',d:0,min:0,max:null,get:sim=>{const i=gi(sim);return GR[i].N*P(sim,i,aidOf(sim,i));}},
  {id:'net',label:'What each of them pays',unit:'dollars',d:0,min:0,max:null,get:sim=>{const i=gi(sim);return Sv(sim)-aidOf(sim,i);}},
  {id:'rev',label:'Net tuition revenue from this group',unit:'dollars',d:0,min:0,max:null,get:sim=>{if(!shown(sim))return null;const i=gi(sim);return R(sim,i,aidOf(sim,i));}},
  {id:'total',label:'Net tuition revenue, all three groups',unit:'dollars',d:0,min:0,max:null,get:sim=>shown(sim)?GR.reduce((t,g,i)=>t+R(sim,i,aidOf(sim,i)),0):null},
  {id:'astar',label:'Revenue-maximizing scholarship for this group',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>shown(sim)?best(sim,gi(sim)):null},
  {id:'marg',label:'Revenue change from the next $1,000 of aid',unit:'dollars',d:0,lvl:'honors',min:null,max:null,get:sim=>{if(!shown(sim))return null;const i=gi(sim),a=aidOf(sim,i);return R(sim,i,Math.min(Sv(sim),a+1000))-R(sim,i,a);}},
  {id:'anyway',label:'Aid to students who would have come anyway',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>{const i=gi(sim);return anyway(sim,i,aidOf(sim,i));}},
  {id:'moved',label:'Extra students the scholarship brings in',unit:'students',d:1,lvl:'honors',min:0,max:null,get:sim=>{const i=gi(sim);return moved(sim,i,aidOf(sim,i));}}
 ],
 graphs:[{id:'yield',label:'Chance of enrolling vs. scholarship',custom:true},{id:'rev',label:'Revenue vs. scholarship, all three groups',custom:true}],defaultGraph:'yield',
 plot(sim,ctx,box,id){const S=Sv(sim),cols=[PAL['s5'],PAL['s2'],PAL['s6']];
  if(id==='rev'){if(!shown(sim)){txt(ctx,'Lock in your gut answer to see revenue.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
   let top=0;GR.forEach((g,i)=>{top=Math.max(top,R(sim,i,best(sim,i)));});top=Math.ceil(top/1e6/2)*2;
   const ax=axes(ctx,box,{xmin:0,xmax:S/1000,ymin:0,ymax:top,xl:'Scholarship ($1,000s a year)',yl:'Revenue ($ millions)'});
   GR.forEach((g,i)=>{ctx.strokeStyle=cols[i];ctx.lineWidth=i===gi(sim)?3:2;ctx.beginPath();for(let j=0;j<=120;j++){const a=S*j/120,x=ax.X(a/1000),y=ax.Y(R(sim,i,a)/1e6);j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
    const a=aidOf(sim,i);ctx.fillStyle=cols[i];ctx.beginPath();ctx.arc(ax.X(a/1000),ax.Y(R(sim,i,a)/1e6),5,0,7);ctx.fill();});
   legend(ctx,box.L+box.W-170,box.T+8,GR.map((g,i)=>({label:g.name,color:cols[i]})));return;}
  const ax=axes(ctx,box,{xmin:0,xmax:S/1000,ymin:0,ymax:100,xl:'Scholarship ($1,000s a year)',yl:'Chance of enrolling (%)'});
  GR.forEach((g,i)=>{ctx.strokeStyle=cols[i];ctx.lineWidth=i===gi(sim)?3:2;ctx.beginPath();for(let j=0;j<=120;j++){const a=S*j/120,x=ax.X(a/1000),y=ax.Y(100*P(sim,i,a));j?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
   const a=aidOf(sim,i);ctx.fillStyle=cols[i];ctx.beginPath();ctx.arc(ax.X(a/1000),ax.Y(100*P(sim,i,a)),5,0,7);ctx.fill();});
  legend(ctx,box.L+box.W-170,box.T+box.H-70,GR.map((g,i)=>({label:g.name,color:cols[i]})));},
 draw(sim,ctx,vdt,k0){const k=Math.min(k0,1.8),big=k>1.3,fs=12*k,S=Sv(sim),i=gi(sim),g=GR[i],a=aidOf(sim,i),sh=shown(sim),G=GS(sim),hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const cols=[PAL['s5'],PAL['s2'],PAL['s6']];
  /* ---- bottom: the three groups ---- */
  const cardH=12+fs*1.25*3+8,cy=446-cardH,cw=252;
  GR.forEach((gg,j)=>{const x=14+j*(cw+9),aj=aidOf(sim,j),on=j===i;ctx.fillStyle=PAL['card'];rr(ctx,x,cy,cw,cardH,8);ctx.fill();ctx.strokeStyle=on?PAL['rj']:cols[j];ctx.lineWidth=on?3:1.5;rr(ctx,x,cy,cw,cardH,8);ctx.stroke();
   let y=cy+8;txt(ctx,big?gg.short:gg.name,x+10,y,{s:fs,w:700,c:cols[j],b:'top'});txt(ctx,$h(aj),x+cw-10,y,{s:fs,w:700,a:'right',b:'top'});
   y+=fs*1.25;txt(ctx,`${Math.round(gg.N*P(sim,j,aj))} of ${gg.N} enroll`,x+10,y,{s:fs,b:'top'});
   y+=fs*1.25;txt(ctx,sh?(big?'$'+(R(sim,j,aj)/1e6).toFixed(2)+'M':$m(R(sim,j,aj))):'Revenue ?',x+10,y,{s:fs,w:700,c:sh?PAL['s3']:PAL['cv-soft'],b:'top'});});
  /* ---- left: the table for this group ---- */
  const top=10;txt(ctx,big?g.short:g.name+` (${g.N} admitted)`,16,top,{s:14*k,w:700,c:cols[i],b:'top'});
  if(!big)txt(ctx,`Half would enroll at a price of ${$(g.W)}. Revenue is in $ millions.`,16,top+14*k+4,{s:fs,c:PAL['cv-soft'],b:'top'});
  const hy=top+14*k+(big?8:8+fs+8);
  /* columns: [x, align, header, cell(r)] ; the phone drops "Each pays" */
  const C=big?[[16,'left','Award'],[262,'right','Enroll'],[404,'right','Rev. $M']]:[[16,'left','Scholarship'],[236,'right','Chance'],[326,'right','Each pays'],[416,'right','Revenue $M']];
  C.forEach(c=>txt(ctx,c[2],c[0],hy,{s:fs,w:700,c:PAL['cv-soft'],a:c[1],b:'top'}));
  const steps=(big?[0,20000,40000]:[0,10000,20000,30000,40000,50000]).filter(x=>x<=S);
  const rows=steps.map(x=>({a:x,t:$(x)}));rows.push({a,t:(big?'You ':'Yours ')+$h(a),c:PAL['rj'],w:700});
  if(G&&G.g&&G.g.i===i&&Math.abs(G.g.aid-a)>1)rows.push({a:G.g.aid,t:'Gut '+$h(G.g.aid),c:PAL['s4'],w:700});
  if(sh&&hon||(G&&G.m)){const b=best(sim,i);rows.push({a:b,t:'Best '+$h(b),c:PAL['s3'],w:700});}
  const y0=hy+fs*1.5,ymax=cy-10,rh=clamp((ymax-y0)/rows.length,fs*1.35,fs*1.9);let y=y0;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(16,y-4);ctx.lineTo(C[C.length-1][0],y-4);ctx.stroke();
  rows.forEach(r=>{if(y+fs>ymax)return;const c=r.c||PAL['cv-ink'],w=r.w||400,cells=big?[r.t,pc(P(sim,i,r.a)),sh?(R(sim,i,r.a)/1e6).toFixed(2):'?']:[r.t,pc(P(sim,i,r.a)),$(S-r.a),sh?(R(sim,i,r.a)/1e6).toFixed(2):'?'];
   cells.forEach((t,j)=>txt(ctx,t,C[j][0],y,{s:fs,w,c:(j===cells.length-1&&!sh)?PAL['cv-soft']:c,a:C[j][1],b:'top'}));y+=rh;});
  /* ---- right: the curve ---- */
  const X0=440,X1=786,T0=top+6,Y1=cy-16-fs*1.2,X=x=>X0+(X1-X0)*x/S;
  const rTop=Math.max(1,R(sim,i,best(sim,i)))*1.12,YP=p=>Y1-(Y1-T0-fs*1.6)*p,YR=r=>Y1-(Y1-T0-fs*1.6)*r/rTop;
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X0,T0);ctx.lineTo(X0,Y1);ctx.lineTo(X1,Y1);ctx.stroke();
  txt(ctx,'$0',X0,Y1+4,{s:fs,c:PAL['cv-soft'],a:'left',b:'top'});txt(ctx,$(S),X1,Y1+4,{s:fs,c:PAL['cv-soft'],a:'right',b:'top'});
  if(!big)txt(ctx,'scholarship →',(X0+X1)/2,Y1+4,{s:fs,c:PAL['cv-soft'],a:'center',b:'top'});
  ctx.strokeStyle=cols[i];ctx.lineWidth=2.5;ctx.setLineDash([7,5]);ctx.beginPath();for(let j=0;j<=100;j++){const x=S*j/100;j?ctx.lineTo(X(x),YP(P(sim,i,x))):ctx.moveTo(X(x),YP(P(sim,i,x)));}ctx.stroke();ctx.setLineDash([]);
  txt(ctx,big?'chance':'chance they enroll',X1,T0,{s:fs,w:700,c:cols[i],a:'right',b:'top'});
  if(sh){ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();for(let j=0;j<=100;j++){const x=S*j/100;j?ctx.lineTo(X(x),YR(R(sim,i,x))):ctx.moveTo(X(x),YR(R(sim,i,x)));}ctx.stroke();
   const b=best(sim,i);ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(X(b),YR(R(sim,i,b)),5,0,7);ctx.fill();
   const la=b<S*0.5?S*0.86:S*0.12,lx=X(la),ly=YR(R(sim,i,la));txt(ctx,'revenue',b<S*0.5?lx-6:lx+6,Math.min(Y1-4,ly+4),{s:fs,w:700,c:PAL['s3'],a:b<S*0.5?'right':'left',b:'bottom'});}
  const ux=X(a);
  if(G&&G.g&&G.g.i===i&&Math.abs(G.g.aid-a)>1){const gx=X(G.g.aid),gw=(big?3:8)*fs*0.6,rt=gx>ux?gx+5+gw<X1:gx-5-gw<X0+2;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(gx,T0+fs*1.4);ctx.lineTo(gx,Y1);ctx.stroke();ctx.setLineDash([]);
   txt(ctx,big?'gut':'your gut',rt?gx+5:gx-5,T0+fs*1.4,{s:fs,w:700,c:PAL['s4'],a:rt?'left':'right',b:'top'});}
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ux,T0+fs*1.4);ctx.lineTo(ux,Y1);ctx.stroke();
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ux,YP(P(sim,i,a)),6,0,7);ctx.fill();
  pill(ctx,big?pc(P(sim,i,a)):pc(P(sim,i,a))+' enroll',clamp(ux,X0+52*k,X1-52*k),Y1-fs*1.1,PAL['rj'],'#fff',fs);},
 narrate(sim){const i=gi(sim),g=GR[i],a=aidOf(sim,i),p=P(sim,i,a),S=Sv(sim);
  let s=`With a ${$h(a)} scholarship, each of the ${g.name.toLowerCase()} pays ${$(S-a)}, and about <b>${Math.round(g.N*p)} of ${g.N} enroll</b> (${pc(p)}).`;
  if(!shown(sim))return s+' More aid means more students, but each pays less. Which effect wins?';
  const d=R(sim,i,Math.min(S,a+1000))-R(sim,i,a),w=anyway(sim,i,a),top=Math.abs(a-best(sim,i))<750;
  s+=top?' <b>You are at the top:</b> the next $1,000 of aid barely changes revenue, and more would start to lower it.':d>0?` The next $1,000 of aid would <b>raise</b> revenue by ${$(d)}: it still brings in enough new students to pay for itself.`:` The next $1,000 of aid would <b>lower</b> revenue by ${$(-d)}: it mostly discounts students who were coming anyway.`;
  if(atLeast('honors')&&a>0)s+=` ${$m(w)} of this aid goes to students who would have enrolled with no scholarship.`;
  return s;},
 gut:{better:'higher',controls:['group','aid'],
  ask:{bio:'Pick a group here. Then drag <b>Scholarship</b> to the award you think brings in the most tuition money from that group. Too small and few enroll; too big and each pays too little. Lock it in.',
   honors:'Pick a group, then set the scholarship you think maximizes this group’s net tuition revenue. Lock it in before you show the revenue.'},
  lock(sim){return score(sim);},
  solve(sim){const i=gi(sim),b=best(sim,i);sim.p.aid=b;if(sim.st&&sim.st.aids)sim.st.aids[i]=b;sim.p.show=true;return score(sim);},
  how:{bio:'For each scholarship, the math multiplies three things: the number admitted, the chance each one enrolls, and what each one pays. Then it finds the award where that product is biggest. The table shows a few awards; the math checks every one.',
   honors:'Revenue R(a) = N·P(a)·(S − a). The math moves the award until the next dollar of aid adds nothing: the extra students it brings in just balance the discount given to everyone already coming.',
   ap:'With P logistic, P′(a) = P(1 − P)/s, so R′(a) = N[P′(a)(S − a) − P(a)] = 0 gives S − a = s / (1 − P(a)). The math solves this by bisection; ln R is concave, so the solution is the global maximum.'},
  compare(sim,g,m){const i=m.i,gg=GR[i],gain=m.v-g.v,dn=gg.N*(m.p-g.p),w=anyway(sim,i,m.aid),stay=Math.round(gg.N*P(sim,i,0)),tot=Math.round(gg.N*m.p);
   const twist=` Of the ${tot} who enroll at that award, <b>${stay} would have come with no scholarship at all</b>: ${$m(w)} of the aid goes to them.`;
   const flip=' Now flip chairs: this is why two students can get very different offers. Compare offers, run each college’s net price calculator, and ask about an appeal.';
   if(gain<Math.max(20000,0.005*m.v))return `Your gut was right on: within ${$(gain)} of the most this group can bring in. You sensed the trade-off between more students and lower prices.${twist}${flip}`;
   return `The math’s award (${$h(m.aid)}) brings in <b>${$(gain)} more</b> than yours (${$h(g.aid)}), with ${Math.abs(Math.round(dn))} ${dn>=0?'more':'fewer'} students enrolling. ${g.aid>m.aid?'Your award gave away more than the extra students paid back.':'Your award was too small to change many decisions.'}${twist}${flip}`;},
  again(sim){const j=Math.floor(Math.random()*3);sim.p.group=GR[j].v;sim.p.aid=DEF_AID;if(sim.st&&sim.st.aids)sim.st.aids=GR.map(()=>DEF_AID);sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Comparison shoppers, $60,000 tuition, 500 admitted. Which brings in more tuition money: no scholarship, or a $30,000 scholarship for every one of them?',choices:['No scholarship: every student pays full price','The $30,000 scholarship, by about $10 million','They bring in the same'],correct:1,explain:'With no scholarship, only 5.4% enroll: about 27 students × $60,000 ≈ $1.63 million. With $30,000 off, 80.7% enroll: about 403 students × $30,000 ≈ $12.10 million. A discount that changes decisions can raise revenue.'},
  {lvl:'bio',instant:true,q:'First-choice fans: 70% enroll even with no scholarship. The math says to give each of them about $7,200. Of the students who enroll at that award, who gets most of the aid money?',choices:['Students who only came because of the scholarship','Students who would have come anyway','It is split evenly'],correct:1,explain:'At $7,155, 86.8% enroll: about 260 of 300. But 211 of them (70.2%) would have enrolled with nothing. The award changes only about 50 decisions, yet everyone gets it. That is how a “merit scholarship” can go mostly to students who were coming anyway.'},
  {lvl:'honors',instant:true,q:'For comparison shoppers, the revenue-maximizing award is about $28,700. What happens to revenue if you add $1,000 more?',choices:['It rises by about $1,000 per student','It barely changes, then starts to fall','It drops by $500,000'],correct:1,explain:'At the maximum, marginal revenue is 0. The extra students that $1,000 brings in just pay for the $1,000 discount to everyone already enrolling. Past that point, the discount costs more than the new students bring.'},
  {lvl:'honors',instant:true,q:'The revenue-maximizing award for tight-budget families is about $42,700, so each pays about $17,300. About what share of them still do not enroll?',choices:['About 5%','About 40%','About 75%'],correct:1,explain:'At $42,702, P ≈ 59.5%, so about 40% (162 of 400) do not enroll. The algorithm maximizes revenue, not access: meeting more families’ need would bring in more students but less money.'},
  {lvl:'ap',instant:true,q:'P(a) = 1 / (1 + e^((S − a − W)/s)) with s = $7,000. At the midpoint, where P = 0.5, how fast does the chance of enrolling rise per $1,000 of aid?',choices:['About 1.4 percentage points','About 3.6 percentage points','About 7.1 percentage points','About 14.3 percentage points'],correct:1,explain:'P′(a) = P(1 − P)/s = 0.25 / 7,000 per dollar. Times $1,000: 0.0357, about 3.6 percentage points. This is the steepest point of the logistic curve.'},
  {lvl:'ap',instant:true,q:'At the revenue-maximizing award, which equation holds?',choices:['P(a) = 0.5','S − a = s / (1 − P(a))','a = S / 2'],correct:1,explain:'R′(a) = N[P′(a)(S − a) − P(a)] with P′ = P(1 − P)/s. Setting it to 0 and dividing by NP gives (1 − P)(S − a)/s = 1, so S − a = s/(1 − P). For shoppers: 7,000 / (1 − 0.77629) ≈ $31,291 = 60,000 − 28,709.'}
 ],
 tour:[
  {title:'You run enrollment',text:'This fictional college charges $60,000 tuition and admitted 1,200 students in three groups. Your job: set a scholarship for each group so the college brings in as much tuition as it can. Every group starts with the same $10,000 award.',focus:[8,330,790,118],pause:true,setup:sim=>{BioLab.setValues(sim,{sticker:60000,spread:7000,group:'shop',show:false});setAll(sim,GR.map(()=>DEF_AID));BioLab.setValues(sim,{show:false});}},
  {title:'The yield curve',text:'For comparison shoppers, half would enroll at a price of $40,000. The dashed S-shaped curve is the chance they enroll: it rises as the scholarship grows. With $10,000 off, 19.3% enroll.',focus:[436,30,360,300],pause:true},
  {title:'Revenue = students × price',text:'Revenue = 500 × chance × price. No scholarship: 5.4% × $60,000 → $1.63 million. $20,000 off: 50% × $40,000 → $10.00 million. $40,000 off: 94.6% × $20,000 → $9.46 million. Too little aid and too much aid both lose.',focus:[8,8,420,320],pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'Where the next dollar stops paying',text:'The best award for shoppers is about $28,700: 77.6% enroll, paying $31,291 each, for $12.15 million. Past that, each extra dollar of aid mostly discounts students who were already coming.',focus:[436,30,360,300],pause:true,setup:sim=>{const i=1;sim.st.aids[i]=best(sim,i);BioLab.setValues(sim,{group:'shop',aid:best(sim,i),show:true});}},
  {title:'Aid to students who would come anyway',text:'First-choice fans: 70.2% enroll with no scholarship. Their best award is about $7,200, which brings in only about 50 more students. About 211 fans who were coming anyway get it too: $1.51 million.',focus:[[8,8,420,320],[8,330,790,118]],pause:true,setup:sim=>{const i=0;sim.st.aids[i]=best(sim,i);BioLab.setValues(sim,{group:'fans',aid:best(sim,i),show:true});}},
  {lvl:'honors',title:'Price every group',text:'At their best awards, fans get about $7,200, shoppers $28,700 and tight-budget families $42,700. Total revenue: $30.02 million, against $18.72 million with $10,000 for everyone. Each group gets a different price for the same education.',focus:[8,330,790,118],pause:true,setup:sim=>setAll(sim,GR.map((g,i)=>best(sim,i)))},
  {lvl:'ap',title:'The calculus',text:'R′(a) = N[P′(a)(S − a) − P(a)] and P′ = P(1 − P)/s. Setting R′ = 0 gives S − a = s/(1 − P(a)). For shoppers: 7,000 / (1 − 0.77629) ≈ $31,291 = $60,000 − $28,709.',pause:true},
  {title:'Now flip chairs',text:'Real colleges use far richer models than this one. As a family, your best tools are information: run every college’s net price calculator, compare actual offers side by side, and ask the financial aid office whether an offer can be reviewed.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Does more aid always mean less money for the college?</p><ol><li>Choose <b>Comparison shoppers</b> and turn on <b>Show the revenue</b>.</li><li>Record a trial at scholarships of $0, $10,000, $20,000, $30,000, $40,000 and $50,000.</li><li>Repeat for <b>First-choice fans</b>.</li></ol><p>Write two sentences: where does each group’s revenue peak, and why are the peaks different?</p>',
  honors:'<p><b>Question:</b> Who does the aid actually move?</p><ol><li>For each group, press <b>Set this group to its best award</b>.</li><li>Record the award, <b>Extra students the scholarship brings in</b> and <b>Aid to students who would have come anyway</b>.</li></ol><p>For each group, what fraction of the aid dollars changes a decision? Which group would a need-based policy help most?</p>',
  ap:'<p><b>Question:</b> How does price sensitivity change the optimal award?</p><ol><li>For shoppers, record the best award at s = $3,000, $7,000 and $15,000.</li><li>Derive S − a = s/(1 − P(a)) from R(a) = N·P(a)·(S − a).</li><li>Check the condition with your recorded values.</li></ol><p><b>CER:</b> Claim how s affects the award, with evidence from your table and reasoning from the derivative.</p>'},
 terms:[
  {t:'Net tuition revenue',d:'The tuition a college actually collects after scholarships: students × what each pays.'},
  {t:'Yield',d:'The share of admitted students who enroll.'},
  {t:'Willingness to pay',d:'The most a family would pay for this college. Here, W is the price at which half the group would enroll.'},
  {t:'Logistic curve',d:'An S-shaped curve, 1 / (1 + e^(−x)), that rises from 0 to 1. Here it models the chance of enrolling.',lvl:'honors'},
  {t:'Marginal revenue',d:'How much revenue changes for one more unit, here one more dollar of aid. At the maximum it is 0.',lvl:'honors'},
  {t:'Financial aid leveraging',d:'The older name for using aid to shape who enrolls and what they pay. Today it is often called aid optimization.',lvl:'honors'},
  {t:'Log-concave',d:'A function whose logarithm is concave. Its maximum is unique, so solving R′ = 0 finds it.',lvl:'ap'}
 ],
 about:'<p><b>This is a fictional, simplified model for learning, not financial advice.</b> The college, its $60,000 tuition and its three groups are made up. In each group, a student enrolls with chance P(a) = 1 / (1 + e^((S − a − W)/s)), where a is the scholarship, S is tuition, W is the price at which half the group would enroll ($66,000, $40,000 and $20,000) and s = $7,000. Expected revenue is R(a) = N·P(a)·(S − a). “Would have come anyway” reads the curve as a spread of family limits: the N·P(0) students who enroll with no scholarship would enroll at any award. Real colleges also weigh need, housing, majors, budgets and many more variables, and families see one offer, not a curve.</p>'+
 '<p><b>What is real.</b> Colleges hire firms to do this math. EAB, which works with about 200 clients on aid optimization, has described the goal as awarding aid “in a way that results in the maximum total amount of net tuition revenue” (<a href="https://www.highereddive.com/news/colleges-enrollment-algorithms-aid-students/692601/" target="_blank" rel="noopener">Higher Ed Dive</a>). EAB and Ruffalo Noel Levitz are owned by private equity firms, and New York Times reporting by Ron Lieber (2025) describes models that use up to 200 variables for each admitted student (<a href="https://rethinking65.com/colleges-know-how-much-youre-willing-to-pay-heres-how" target="_blank" rel="noopener">summary</a>). The practice used to be called financial aid leveraging. On Oct. 1, 2025, the chairs of the House and Senate Judiciary Committees wrote to EAB, Ruffalo Noel Levitz, College Board, Oracle and Ellucian about tuition pricing algorithms and the data behind them, raising questions of “algorithmic collusion” (<a href="https://www.pymnts.com/?p=3089500" target="_blank" rel="noopener">PYMNTS</a>).</p>'+
 '<p><b>A pending case (allegations, as of June 2026).</b> In the “568 Presidents Group” antitrust case, students allege that 17 elite universities fixed financial aid through a shared formula. Settlements total about $320 million. Cornell, Georgetown, MIT, Notre Dame and Penn have not settled; the court denied their motion for summary judgment in January 2026 and certified a class in June 2026, and the defendants are appealing (<a href="https://bergermontague.com/568/" target="_blank" rel="noopener">plaintiffs’ counsel’s case page</a>). These are allegations, not findings. Check the current status before you teach it.</p>'+
 '<p>Cathy O’Neil’s <i>Weapons of Math Destruction</i> (Chapter 3) traces how models drive the race to get into college and what it costs families.</p>'
};
BioLab.register(SIM);
})();
