(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* Geometric probability: when every point is equally likely, P = favorable length (or area) ÷ total length (or area).
   Cornhole: a regulation board is 24 in × 48 in with a 6 in hole whose center is 9 in from the top (American Cornhole
   Association). If a bag lands at a random spot on the board, P(hole) = π(d/2)² ÷ (24 × 48).
   Crosswalk: a signal cycle of 90 s with a 25 s WALK phase (a typical timing, not a specific intersection).
   If you arrive at a random moment, P(WALK) = 25 ÷ 90. The simulation drops random points to compare
   the experimental relative frequency with the geometric probability. */
const BW=24,BH=48,HY=9,CYC=90;
const theo=sim=>sim.p.cs==='walk'?sim.p.walk/CYC:Math.PI*Math.pow(sim.p.hole/2,2)/(BW*BH);
const pct=v=>(v*100).toFixed(2)+'%';
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g&&!(BioLab.calcPending&&BioLab.calcPending(sim))));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function clearDrops(sim){if(sim.st){sim.st.pts=[];}}
function onCase(sim){const v=sim.vis||(sim.vis={});v.chg=0;v.prevP=null;v.prevSize=null;clearDrops(sim);clearGut(sim);}
function onSize(sim){const v=sim.vis||(sim.vis={}),now=sim.p.cs==='walk'?sim.p.walk:sim.p.hole;if(v.curCase!==sim.p.cs||v.curSize==null||v.curSize===now)return;v.prevP=v.curP;v.prevSize=v.curSize;v.chg=3.5;clearDrops(sim);clearGut(sim);}
function drop(sim,n){const st=sim.st,v=sim.vis||(sim.vis={}),now=v.clock||0,P=theo(sim);
  for(let i=0;i<n;i++){let pt;
    if(sim.p.cs==='walk'){const t=Math.random()*CYC;pt={t,hit:t<sim.p.walk};}
    else{const x=Math.random()*BW,y=Math.random()*BH,r=sim.p.hole/2;pt={x,y,hit:Math.hypot(x-BW/2,y-HY)<=r};}
    pt.born=now+(n>1?i*Math.min(0.03,3/n):0);st.pts.push(pt);}
  if(st.pts.length>3000)st.pts.splice(0,st.pts.length-3000);sim.infoDirty=true;}
const landed=sim=>{const now=(sim.vis&&sim.vis.clock)||0;return sim.st.pts.filter(p=>p.born<=now);};
const calcAns=sim=>Math.round(theo(sim)*10000)/100;

const SIM={
 id:'targetdrop',hash:'targetdrop',apUnit:14,order:2.5,tab:'Cornhole odds: geometric probability',kind:'Simulation',next:['lunchcount'],
 skills:{bio:'Geometric probability with lengths and areas · Geometry',honors:'Geometric probability, complements and independent trials · Honors Geometry (probability unit)'},
 card:'If your bag lands at a random spot on a cornhole board, what are the odds it drops in the hole? Guess, then compare areas and toss a few hundred bags.',
 title:'Cornhole odds and the crosswalk wait: geometric probability',
 lede:{bio:'When every spot is equally likely, the probability of landing in a region is its share of the whole: its area ÷ the total area, or its length ÷ the total length.',
  honors:'P(event) = favorable measure ÷ total measure. Check it against hundreds of random drops, then combine probabilities: what are the odds at least one of your four bags goes in?'},
 scale:'The cornhole board is drawn to scale: 24 in × 48 in, with a 6 in hole 9 in from the top. The crosswalk timeline is one 90-second signal cycle.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'The target',
 controls:[
  {id:'guess',label:'Your gut: the chance it lands in the target',type:'range',min:0,max:50,step:0.1,def:10,unit:'%',d:1},
  {id:'cs',label:'Target',type:'seg',def:'cornhole',noGut:true,onChange:onCase,options:[{v:'cornhole',l:'Cornhole hole (area)'},{v:'walk',l:'Crosswalk WALK (length)'}]},
  {id:'hole',label:'Cornhole: hole diameter',type:'range',min:3,max:12,step:0.5,def:6,unit:' in',noGut:true,onChange:onSize,help:'Regulation is 6 in. Only used for cornhole.'},
  {id:'walk',label:'Crosswalk: WALK time in each 90 s cycle',type:'range',min:5,max:60,step:1,def:25,unit:' s',noGut:true,onChange:onSize,help:'Only used for the crosswalk.'},
  {id:'reveal',label:'Show the answer now',type:'toggle',def:false,help:'Normally the answer appears once you lock in your gut guess.'}
 ],
 actions:[{id:'one',label:'Drop one',run(sim){drop(sim,1);}},{id:'hundred',label:'Drop 100',primary:true,run(sim){drop(sim,100);}},{id:'clear',label:'Clear the drops',run(sim){clearDrops(sim);}}],
 init(){return {pts:[]};},step(){},
 metrics:[
  {id:'p',label:'Geometric probability',unit:'%',d:2,min:0,max:100,get:sim=>shown(sim)?theo(sim)*100:null},
  {id:'n',label:'Drops so far',unit:'',d:0,min:0,max:null,get:sim=>landed(sim).length},
  {id:'hits',label:'Landed in the target',unit:'',d:0,min:0,max:null,get:sim=>landed(sim).filter(p=>p.hit).length},
  {id:'freq',label:'Experimental share',unit:'%',d:2,min:0,max:100,get:sim=>{const L=landed(sim);return L.length?100*L.filter(p=>p.hit).length/L.length:null;}},
  {id:'off',label:'Your gut is off by',unit:'points',d:2,min:0,max:null,get:sim=>shown(sim)?Math.abs(sim.p.guess-theo(sim)*100):null},
  {id:'four',label:'At least one of 4 tries hits',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>shown(sim)?100*(1-Math.pow(1-theo(sim),4)):null}
 ],
 graphs:[{id:'run',label:'Experimental share as drops add up',custom:true}],defaultGraph:'run',
 plot(sim,ctx,box){const L=landed(sim),P=theo(sim)*100,n=L.length,top=Math.max(10,Math.ceil(P*2.5/5)*5);
  const ax=axes(ctx,box,{xmin:0,xmax:Math.max(100,n),ymin:0,ymax:top,xl:'Number of drops',yl:'Share in the target (%)'});
  if(shown(sim)){ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(P));ctx.lineTo(ax.X(Math.max(100,n)),ax.Y(P));ctx.stroke();ctx.setLineDash([]);}
  if(!n){txt(ctx,'Press “Drop 100” to start',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center'});return;}
  let h=0;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.beginPath();L.forEach((p,i)=>{if(p.hit)h++;const X=ax.X(i+1),Y=ax.Y(clamp(100*h/(i+1),0,top));i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);});ctx.stroke();
  legend(ctx,box.L+10,box.T+8,[{label:'Experimental share',color:PAL['s4']}].concat(shown(sim)?[{label:'Geometric probability '+pct(P/100),color:PAL['g-line'],dash:true}]:[]));},
 draw(sim,ctx,vdt,k){const v=sim.vis||(sim.vis={});v.clock=(v.clock||0)+vdt;const now=v.clock,sh=shown(sim),G=GS(sim),tst=(sim.tour&&sim.tour.on)?(sim.tst||1):99,kk=Math.min(k,1.3);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);const P=theo(sim);v.curP=P;v.curSize=sim.p.cs==='walk'?sim.p.walk:sim.p.hole;v.curCase=sim.p.cs;
  const chg=v.chg>0?v.chg:0;if(chg)v.chg-=vdt;
  const L=sim.st.pts,pts=L.filter(p=>p.born<=now),hits=pts.filter(p=>p.hit).length;
  if(sim.p.cs!=='walk'){
   const S=7.6,X0=150,Y0=36,W=BW*S,H=BH*S,cx=X0+W/2,cy=Y0+HY*S,r=sim.p.hole/2*S;
   // board on its legs, drawn to scale
   ctx.fillStyle='#d9b382';rr(ctx,X0,Y0,W,H,4);ctx.fill();ctx.strokeStyle='#8a6a3f';ctx.lineWidth=3;ctx.stroke();
   ctx.strokeStyle='rgba(138,106,63,0.35)';ctx.lineWidth=1;for(let y=Y0+30;y<Y0+H;y+=30){ctx.beginPath();ctx.moveTo(X0+4,y);ctx.lineTo(X0+W-4,y);ctx.stroke();}
   ctx.fillStyle='#2b1d10';ctx.beginPath();ctx.arc(cx,cy,r,0,6.29);ctx.fill();
   if(chg&&v.prevSize&&v.prevSize!==sim.p.hole){ctx.save();ctx.globalAlpha=Math.min(1,chg);ctx.setLineDash([5,4]);ctx.strokeStyle='#c8102e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,v.prevSize/2*S,0,6.29);ctx.stroke();ctx.setLineDash([]);
     txt(ctx,'before: '+v.prevSize+' in',cx+v.prevSize/2*S+8,cy-6,{s:11*kk,w:700,c:'#c8102e'});ctx.restore();}
   // dimension lines
   txt(ctx,'24 in',cx,Y0+H+20*kk,{s:12*kk,w:700,a:'center',c:PAL['cv-soft']});
   ctx.save();ctx.translate(X0-14,Y0+H/2);ctx.rotate(-Math.PI/2);txt(ctx,'48 in',0,0,{s:12*kk,w:700,a:'center',c:PAL['cv-soft']});ctx.restore();
   txt(ctx,sim.p.hole+' in hole',cx+r+8,cy+14,{s:11*kk,w:700,c:PAL['cv-ink']});
   // bags
   for(const p of pts){const age=now-p.born,x=X0+p.x*S,y=Y0+p.y*S,s=age<0.35?1+(0.35-age)*3:1;
    ctx.globalAlpha=pts.length>300?0.55:0.9;ctx.fillStyle=p.hit?'#1b7a3a':(p.x+p.y)%2<1?'#c8102e':'#1f5fbf';rr(ctx,x-3.5*s,y-3.5*s,7*s,7*s,2);ctx.fill();}
   ctx.globalAlpha=1;
   // the area comparison
   const RX=420;txt(ctx,'If a bag lands at a random spot on the board:',RX,56,{s:13*kk,w:700});
   if(sh&&tst>=2){const A=Math.PI*Math.pow(sim.p.hole/2,2);
    pill(ctx,'Hole: π × '+(sim.p.hole/2)+'² = '+A.toFixed(1)+' in²',RX+150,94,'#2b1d10','#fff',13*kk);
    pill(ctx,'Board: 24 × 48 = 1,152 in²',RX+150,128,'#d9b382',PAL['cv-ink'],13*kk);
    if(tst>=3)pill(ctx,'P(hole) = '+A.toFixed(1)+' ÷ 1,152 = '+pct(P),RX+150,166,PAL['card2'],PAL['s1'],14*kk);
    if(chg&&v.prevP!=null&&Math.abs(v.prevP-P)>1e-6){ctx.globalAlpha=Math.min(1,chg);txt(ctx,'was '+pct(v.prevP)+' with a '+v.prevSize+' in hole',RX+150,192,{s:12*kk,w:700,c:'#c8102e',a:'center'});ctx.globalAlpha=1;}}
   else if(!sh)txt(ctx,'What share of the board is the hole?',RX,82,{s:13*kk,c:PAL['cv-soft']});
  }else{
   // crosswalk: one 90 s cycle as a timeline
   const X0=60,X1=740,Y=210,w=sim.p.walk,X=t=>X0+(X1-X0)*t/CYC;
   txt(ctx,'One signal cycle: 90 seconds',X0,60,{s:15*kk,w:700});
   txt(ctx,'You walk up at a random moment. What is the chance the WALK sign is already on?',X0,84,{s:12.5*kk,c:PAL['cv-soft']});
   rr(ctx,X(0),Y,X(w)-X(0),36,4);ctx.fillStyle='#1b7a3a';ctx.fill();rr(ctx,X(w),Y,X(CYC)-X(w),36,4);ctx.fillStyle='#b3261e';ctx.fill();
   txt(ctx,'WALK '+w+' s',(X(0)+X(w))/2,Y+23,{s:13*kk,w:800,c:'#fff',a:'center'});txt(ctx,"DON'T WALK "+(CYC-w)+' s',(X(w)+X(CYC))/2,Y+23,{s:13*kk,w:800,c:'#fff',a:'center'});
   if(chg&&v.prevSize&&v.prevSize!==w){ctx.save();ctx.globalAlpha=Math.min(1,chg);ctx.strokeStyle='#111';ctx.setLineDash([5,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(v.prevSize),Y-10);ctx.lineTo(X(v.prevSize),Y+46);ctx.stroke();ctx.setLineDash([]);txt(ctx,'before: '+v.prevSize+' s',X(v.prevSize),Y-14,{s:11*kk,w:700,a:'center'});ctx.restore();}
   for(let s=0;s<=CYC;s+=15)txt(ctx,s+' s',X(s),Y+60,{s:11*kk,c:PAL['cv-soft'],a:'center'});
   // arrivals: drop onto the timeline
   for(const p of pts){const age=now-p.born,x=X(p.t),yy=age<0.35?Y-60+age/0.35*48:Y-12;ctx.globalAlpha=pts.length>300?0.5:0.85;ctx.fillStyle=p.hit?'#1b7a3a':'#b3261e';ctx.beginPath();ctx.arc(x,yy-((p.t*7)%5)*3,3.2,0,6.29);ctx.fill();}
   ctx.globalAlpha=1;
   if(sh&&tst>=2){pill(ctx,'P(WALK) = '+w+' s ÷ 90 s = '+pct(P),400,320,PAL['card2'],PAL['s1'],14*kk);
    if(chg&&v.prevP!=null&&Math.abs(v.prevP-P)>1e-6){ctx.globalAlpha=Math.min(1,chg);txt(ctx,'was '+pct(v.prevP),400,350,{s:12*kk,w:700,c:'#c8102e',a:'center'});ctx.globalAlpha=1;}}
  }
  // running tally
  if(pts.length){const f=hits/pts.length;pill(ctx,hits+' of '+pts.length+' in the target = '+(f*100).toFixed(1)+'%',sim.p.cs==='walk'?400:570,sim.p.cs==='walk'?392:236,PAL.card,PAL['cv-ink'],13*kk);}
  if(atLeast('honors')&&sh&&tst>=4){const f4=1-Math.pow(1-P,4);pill(ctx,'At least 1 of 4 tries: 1 − (1 − '+P.toFixed(4)+')⁴ = '+(f4*100).toFixed(1)+'%',sim.p.cs==='walk'?400:570,sim.p.cs==='walk'?428:280,PAL['card2'],PAL['s1'],12*kk);}
  if(G&&G.g){txt(ctx,'Your gut: '+G.g.guess.toFixed(1)+'%',sim.p.cs==='walk'?740:780,sim.p.cs==='walk'?440:440,{s:12.5*kk,w:700,c:PAL['s4'],a:'right'});}},
 narrate(sim){const P=theo(sim),L=landed(sim),h=L.filter(p=>p.hit).length;
  if(!shown(sim))return sim.p.cs==='walk'?`The WALK sign is on for <b>${sim.p.walk} s</b> of every <b>90 s</b>. If you show up at a random moment, <b>what is the chance it is already on?</b>`:`A regulation board is 24 in × 48 in with a ${sim.p.hole} in hole. If a bag lands at a random spot on the board, <b>what is the chance it drops in?</b>`;
  let s=sim.p.cs==='walk'?`The WALK phase is ${sim.p.walk} of the 90 seconds, so P = ${sim.p.walk} ÷ 90 = <b>${pct(P)}</b>.`:`The hole covers ${(Math.PI*Math.pow(sim.p.hole/2,2)).toFixed(1)} of the board’s 1,152 square inches, so P = <b>${pct(P)}</b>.`;
  if(L.length)s+=` Your ${L.length} drops: ${h} hits, ${(100*h/L.length).toFixed(1)}%. More drops bring the share closer to the geometric probability.`;
  return s;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'Drag the slider to your guess for the chance, then lock it in.',honors:'Before any formulas: drag the slider to your gut guess for the probability, then lock it in.'},
  lock(sim){return {v:Math.abs(sim.p.guess-theo(sim)*100),guess:sim.p.guess,label:`about ${sim.p.guess.toFixed(1)}%`};},
  solve(sim){const P=theo(sim)*100;sim.p.guess=Math.round(P*10)/10;return {v:Math.abs(sim.p.guess-P),guess:P,label:pct(P/100)};},
  hint:{bio:'Lock in your gut. Then you will find the probability yourself from the area or length.'},
  calc:{unit:'%',d:2,tol:a=>0.05,
   prompt:{bio:sim=>sim.p.cs==='walk'?`The WALK sign is on for <b>${sim.p.walk} s</b> of a <b>90 s</b> cycle. What is the probability, in percent, that it is on when you arrive at a random moment?`:`The hole has a diameter of <b>${sim.p.hole} in</b>; the board is <b>24 in × 48 in</b>. Find the hole’s area and the board’s area. What is the probability, in percent, that a randomly landing bag goes in?`},
   answer:calcAns,
   hint:'Favorable area (or time) ÷ total area (or time), then × 100. A circle’s area is π r², with r = half the diameter.',
   steps(sim){if(sim.p.cs==='walk')return [`Favorable length: ${sim.p.walk} s. Total length: 90 s.`,`${sim.p.walk} ÷ 90 = ${(sim.p.walk/90).toFixed(4)}.`,`That is <b>${pct(theo(sim))}</b>.`];
    const r=sim.p.hole/2,A=Math.PI*r*r;return [`Hole radius: ${sim.p.hole} ÷ 2 = ${r} in. Area: π × ${r}² = ${A.toFixed(2)} in².`,`Board area: 24 × 48 = 1,152 in².`,`${A.toFixed(2)} ÷ 1,152 = ${(A/1152).toFixed(4)}, which is <b>${pct(theo(sim))}</b>.`];}},
  formula(sim){return sim.p.cs==='walk'?`P = ${sim.p.walk} s ÷ 90 s = ${pct(theo(sim))}`:`P = π(${sim.p.hole/2})² ÷ (24 × 48) = ${pct(theo(sim))}`;},
  how:{bio:'When every spot is equally likely, the chance of landing in a region is the region’s share of the whole: area ÷ area, or length ÷ length.',
   honors:'P = favorable measure ÷ total measure, assuming a uniform random point. Real throwers aim, so the true chance for a good player is much higher; this is the chance for a bag that lands at random.'},
  compare(sim,g,m){const off=Math.abs(g.guess-m.guess);const K=sim.ui.calc,self=K&&K.done&&K.correct?' And you found it yourself from the areas.':'';
   if(off<=0.5)return `Right on: within ${off.toFixed(2)} points of ${pct(m.guess/100)}.`+self;
   return `Your gut was off by <b>${off.toFixed(1)} points</b>: you guessed ${g.guess.toFixed(1)}%, and the ${sim.p.cs==='walk'?'lengths':'areas'} give <b>${pct(m.guess/100)}</b>. ${sim.p.cs==='walk'?'':g.guess>m.guess?'The hole looks big, but area grows with the square of the radius, and the board is 1,152 square inches.':''}`+self;},
  again(sim){const R=a=>a[Math.floor(Math.random()*a.length)];const c=R(['cornhole','walk']);sim.p.cs=c;sim.p.hole=R([4,5,6,8,10]);sim.p.walk=R([15,20,25,30,40]);sim.p.guess=10;sim.p.reveal=false;if(sim.st)sim.st.pts=[];}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A regulation cornhole board is 24 in × 48 in with a 6 in hole. A bag lands at a random spot on the board. What is the probability it goes in, in percent? (Two decimal places.)',answer:2.45,tol:0.02,unit:'%',d:2,hint:'π × 3² ÷ (24 × 48).',explain:'Hole area π × 3² = 28.27 in². Board area 1,152 in². 28.27 ÷ 1,152 = 0.0245, about 2.45%.'},
  {lvl:'bio',instant:true,q:'If the hole’s diameter doubled from 6 in to 12 in, the chance of a random bag going in would…',choices:['double','stay the same','quadruple'],correct:2,explain:'Area depends on the radius squared. Doubling the diameter multiplies the area by 2² = 4, so the probability goes from 2.45% to 9.8%.'},
  {lvl:'bio',instant:true,q:'A WALK signal is on for 25 s of every 90 s cycle. You arrive at a random time. What is the chance you can walk right away?',choices:['25%','About 28%','About 72%'],correct:1,explain:'Favorable length ÷ total length = 25 ÷ 90 ≈ 0.278, about 28%.'},
  {lvl:'bio',instant:true,q:'You drop 100 random bags and 4 go in, not 2.45. What does that tell you?',choices:['The formula is wrong','Random results vary; with more drops the share gets closer to 2.45%','The board is not regulation'],correct:1,explain:'A small sample bounces around the true probability. Drop a few thousand and the experimental share settles near 2.45%.'},
  {lvl:'honors',kind:'num',q:'Each of your 4 bags has a 2.45% chance of going in, independently. What is the probability that at least one goes in, in percent? (One decimal place.)',answer:9.45,tol:0.1,unit:'%',d:1,hint:'1 − P(none) = 1 − (1 − 0.0245)⁴.',explain:'P(none) = 0.9755⁴ ≈ 0.9055. P(at least one) = 1 − 0.9055 ≈ 0.0945, about 9.5%.'},
  {lvl:'honors',instant:true,q:'A bus comes every 12 minutes. You arrive at a random time. What is the probability you wait more than 8 minutes?',choices:['1/3','2/3','8/12'],correct:0,explain:'You wait more than 8 minutes only if you arrive in the first 4 minutes after a bus leaves: 4 ÷ 12 = 1/3.'}
 ],
 tour:[
  {title:'A bag that lands at random',text:'A regulation cornhole board is 24 in by 48 in, with a 6 in hole. Imagine a bag that lands on a random spot: every square inch equally likely. What is the chance it drops in?',pause:true,setup:sim=>{sim.tst=1;BioLab.setValues(sim,{cs:'cornhole',hole:6,reveal:true});sim.st.pts=[];}},
  {title:'Compare the areas',text:'The chance is the hole’s share of the board. The hole is π × 3² = 28.3 square inches. The board is 24 × 48 = 1,152 square inches.',pause:true,setup:sim=>{sim.tst=2;}},
  {title:'Divide',text:'P = 28.3 ÷ 1,152 = 2.45%. Only about 1 random bag in 40 goes in, which is why good players aim instead of hoping.',pause:true,setup:sim=>{sim.tst=3;}},
  {title:'Test it with 300 bags',text:'Watch 300 bags land at random spots. Green ones fell in. The share that went in lands near 2.45%; the graph shows it settling down as drops add up.',speed:1,setup:sim=>{sim.tst=3;sim.st.pts=[];drop(sim,300);}},
  {title:'Double the hole',text:'Now watch the hole grow from 6 in to 12 in. The dashed circle is the old hole. The area grows 4 times, so the chance becomes 9.8%, not 4.9%.',pause:true,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{hole:12});}},
  {title:'Lengths work the same way',text:'A WALK signal is on for 25 s of every 90 s. If you arrive at a random moment, the chance it is on is the green length’s share: 25 ÷ 90 ≈ 27.8%.',speed:1,setup:sim=>{sim.tst=3;BioLab.setValues(sim,{cs:'walk',walk:25,hole:6});drop(sim,150);}},
  {lvl:'honors',title:'At least one of four',text:'With four bags, the chance at least one random bag goes in is 1 − (chance none do) = 1 − 0.9755⁴ ≈ 9.5%.',pause:true,setup:sim=>{sim.tst=4;BioLab.setValues(sim,{cs:'cornhole',hole:6});}}
 ],
 onTourExit(sim){sim.tst=99;BioLab.setValues(sim,{reveal:false,cs:'cornhole',hole:6,walk:25});if(sim.st)sim.st.pts=[];},
 lab:{bio:'<p><b>Question:</b> How close does the experiment get to the geometric probability?</p><ol><li>Turn on <b>Show the answer now</b>. Use the regulation 6 in hole.</li><li>Drop 100 bags and record a trial. Repeat until you have 10 trials.</li><li>Record each trial’s experimental share.</li></ol><p>How far from 2.45% was your farthest trial? Then clear and drop 1,000. How close is it now?</p>',
  honors:'<p><b>Question:</b> How does the probability change with hole size?</p><ol><li>Record the geometric probability for hole diameters of 3, 6, 9 and 12 in.</li><li>Graph probability against diameter, then against diameter squared.</li></ol><p>Which graph is a straight line, and why? Then find the diameter that gives a 1 in 10 chance.</p>'},
 terms:[
  {t:'Geometric probability',d:'A probability found by comparing lengths or areas: favorable measure ÷ total measure.'},
  {t:'Uniform random point',d:'A point where every location in the region is equally likely.'},
  {t:'Experimental probability',d:'The share of trials where the event actually happened.'},
  {t:'Complement',d:'The event not happening. P(not A) = 1 − P(A).',lvl:'honors'},
  {t:'Independent events',d:'Events where one result doesn’t change the chance of the other, so P(A and B) = P(A) × P(B).',lvl:'honors'}
 ],
 about:'<p><b>Model.</b> Each drop is a uniform random point on the board (or in the 90 s cycle). The geometric probability is the target’s area (or length) divided by the total. The board is the American Cornhole Association regulation size: 24 in × 48 in with a 6 in hole centered 9 in from the top. Real throwers aim, so their chances are much better; this is the chance for a bag that lands at a random spot. The signal timing is a typical example, not a specific intersection.</p>'
};
BioLab.register(SIM);
})();
