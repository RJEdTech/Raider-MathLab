(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,atLeast,fmtNum}=BioLab.h;
const VEH={truck:{name:'pickup',f:[265,70,17],up1:[275,70,17],up2:[285,75,17],up3:[315,70,17],down:[245,70,17]},
 suv:{name:'small SUV',f:[225,65,17],up1:[235,65,17],up2:[245,65,17],up3:[235,75,17],down:[215,60,17]},
 car:{name:'sedan',f:[205,55,16],up1:[215,55,16],up2:[225,55,17],up3:[225,60,17],down:[195,55,16]}};
/* Tire size W/AR R rim: sidewall = W mm × AR/100; diameter = rim + 2 × sidewall (in inches; 25.4 mm per inch). */
const diam=t=>t[2]+2*t[0]*t[1]/100/25.4;
const sizeStr=t=>`${t[0]}/${t[1]}R${t[2]}`;
/* Tire size codes wait until Closer look. */
const codes=()=>atLeast('honors');
const veh=sim=>VEH[atLeast('honors')?sim.p.veh:'truck'];
const fac=sim=>veh(sim).f;
const nt=sim=>{const v=sim.p.newt;if(v==='custom'&&atLeast('ap'))return [sim.p.w,sim.p.ar,sim.p.rim];if(v==='f'||v==='custom')return veh(sim).f;return veh(sim)[v];};
const ratio=sim=>diam(nt(sim))/diam(fac(sim));
const trueSp=sim=>sim.p.dash*ratio(sim);
const miles=sim=>atLeast('honors')?sim.p.miles:12000;
/* The car counts turns and multiplies by the factory circumference, so the odometer shows true miles ÷ ratio. */
const odoMiss=sim=>miles(sim)*(1-1/ratio(sim));
const rpm=t=>63360/(Math.PI*diam(t));
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const comma=v=>Math.round(v).toLocaleString('en-US');
const unsolve=sim=>{sim.st.solved=false;if(sim.gutS&&sim.gutS.g){sim.gutS.g=null;sim.gutS.m=null;BioLab.gutRender(sim);}};

function tire(ctx,cx,ground,t,sc,col){const D=diam(t)*sc,R=D/2,r=t[2]*sc/2,cy=ground-R;
 ctx.fillStyle='#2e2f33';ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();
 ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke();
 ctx.fillStyle='#a9b1ba';ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
 ctx.strokeStyle='#6d757e';ctx.lineWidth=3;for(let i=0;i<5;i++){const a=i*2*Math.PI/5-Math.PI/2;ctx.beginPath();ctx.moveTo(cx+r*.25*Math.cos(a),cy+r*.25*Math.sin(a));ctx.lineTo(cx+r*.85*Math.cos(a),cy+r*.85*Math.sin(a));ctx.stroke();}
 ctx.fillStyle='#6d757e';ctx.beginPath();ctx.arc(cx,cy,r*.22,0,7);ctx.fill();
 return {cy,R};}

const SIM={
 id:'tires',hash:'tires',apUnit:10,order:2,tab:'Bigger tires, wrong speed',kind:'Simulation',
 card:'Guess your real speed on bigger tires, then use circumference to see how far off the speedometer and odometer are.',
 title:'Bigger tires: how fast are you really going?',
 lede:{bio:'Your car does not measure speed directly. It counts how fast the wheels turn and assumes every turn covers the factory tire’s circumference. Put on taller tires and each turn covers more road than the car thinks.',
  honors:'Circumference is πd, so it grows in the same ratio as the diameter. True speed = speedometer reading × (new diameter ÷ factory diameter), and the odometer is off by the same ratio.',
  ap:'A size like 265/70R17 means a 265 mm wide tire whose sidewall is 70% of that width, on a 17 in rim. Diameter = 17 in + 2 × (265 mm × 0.70) ÷ 25.4 mm per inch, and revolutions per mile = 63,360 in ÷ (π × diameter).'},
 scale:'Tires drawn to scale beside each other. The bars below show how far one full turn rolls each tire.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your car',
 controls:[
  {id:'gut',label:'Your guess: true speed',type:'range',min:15,max:95,step:0.5,def:65,unit:' mph',help:'This is your pick: how fast you think you are really going.'},
  {id:'dash',label:'The speedometer reads',type:'range',min:20,max:80,step:1,def:65,unit:' mph',noGut:true,onChange:unsolve},
  {id:'newt',label:'Tires you put on',type:'select',def:'up2',noGut:true,onChange:unsolve,options:[{v:'f',l:'Factory size'},{v:'down',l:'A smaller size'},{v:'up1',l:'A little bigger'},{v:'up2',l:'Bigger'},{v:'up3',l:'Much bigger'},{v:'custom',l:'Custom size (set below)',lvl:'ap'}]},
  {id:'veh',label:'Vehicle',type:'seg',def:'truck',lvl:'honors',onChange:unsolve,options:[{v:'truck',l:'Pickup'},{v:'suv',l:'Small SUV'},{v:'car',l:'Sedan'}]},
  {id:'miles',label:'Miles you really drive per year',type:'range',min:5000,max:20000,step:500,def:12000,lvl:'honors',noGut:true,unit:' mi',onChange:unsolve},
  {id:'w',label:'Custom tire width',type:'range',min:185,max:335,step:10,def:285,unit:' mm',lvl:'ap',noGut:true,onChange:unsolve,help:'Used when “Tires you put on” is Custom.'},
  {id:'ar',label:'Custom aspect ratio (sidewall % of width)',type:'range',min:40,max:85,step:5,def:75,unit:'%',lvl:'ap',noGut:true,onChange:unsolve},
  {id:'rim',label:'Custom rim diameter',type:'range',min:15,max:22,step:1,def:17,unit:' in',lvl:'ap',noGut:true,onChange:unsolve}
 ],
 actions:[{id:'calc',label:'Do the math',run(sim){sim.st.solved=true;}}],
 init(){return {solved:false};},step(){},
 metrics:[
  {id:'dF',label:'Factory tire height',unit:'in',d:2,min:0,max:null,get:sim=>diam(fac(sim))},
  {id:'dN',label:'Your tire height',unit:'in',d:2,min:0,max:null,get:sim=>diam(nt(sim))},
  {id:'cN',label:'Your tire: one turn covers',unit:'in',d:1,lvl:'honors',min:0,max:null,get:sim=>Math.PI*diam(nt(sim))},
  {id:'rpm',label:'Your tire: turns per mile',unit:'',d:1,lvl:'ap',min:0,max:null,get:sim=>rpm(nt(sim))},
  {id:'true',label:'True speed',unit:'mph',d:1,min:0,max:100,get:sim=>sim.st.solved?trueSp(sim):NaN},
  {id:'odo',label:'Miles the odometer misses per year',unit:'mi',d:0,lvl:'honors',min:null,max:null,get:sim=>sim.st.solved?odoMiss(sim):NaN}
 ],
 graphs:[{id:'line',label:'True speed vs. speedometer',custom:true}],defaultGraph:'line',
 plot(sim,ctx,box){const r=ratio(sim),G=sim.gutS||{};
  const ax=axes(ctx,box,{xmin:0,xmax:80,ymin:0,ymax:100,xl:'Speedometer reads (mph)',yl:'True speed (mph)'});
  ctx.strokeStyle=PAL['cv-soft'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(80),ax.Y(80));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,'Factory tires',ax.X(68),ax.Y(68)+18,{s:12,c:PAL['cv-soft'],a:'center'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(0));ctx.lineTo(ax.X(80),ax.Y(80*r));ctx.stroke();
  txt(ctx,'Your tires',ax.X(40),ax.Y(40*r)-10,{s:12,w:700,c:PAL['g-line'],a:'right'});
  const dot=(y,c,l,dy)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(ax.X(sim.p.dash),ax.Y(y),6,0,7);ctx.fill();txt(ctx,l,ax.X(sim.p.dash)+10,ax.Y(y)+dy,{s:12,w:700,c,a:'left'});};
  if(G.g)dot(G.g.v0,PAL['s4'],'Your gut',G.g.v0>trueSp(sim)?-6:14);
  if(sim.st.solved||G.m)dot(trueSp(sim),PAL['s3'],'True',G.g&&G.g.v0>trueSp(sim)?14:-6);},
 draw(sim,ctx,vdt,k){const F=fac(sim),N=nt(sim),G=sim.gutS||{},solved=sim.st.solved||!!G.m;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const sc=Math.min(5,190/Math.max(diam(F),diam(N))),ground=290;ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,ground,480,450-ground);
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,ground);ctx.lineTo(470,ground);ctx.stroke();
  const a=tire(ctx,125,ground,F,sc,PAL['cv-soft']),b=tire(ctx,340,ground,N,sc,PAL['rj']);
  const ls=12.5*k;
  txt(ctx,codes()?'Factory '+sizeStr(F):'Factory tire',125,ground-2*a.R-16-ls,{s:ls,w:700,a:'center',c:PAL['cv-soft']});txt(ctx,f1(diam(F))+' in tall',125,ground-2*a.R-10,{s:ls,a:'center',c:PAL['cv-soft']});
  txt(ctx,codes()?'Yours '+sizeStr(N):'Your new tire',340,ground-2*b.R-16-ls,{s:ls,w:700,a:'center',c:PAL['rj']});txt(ctx,f1(diam(N))+' in tall',340,ground-2*b.R-10,{s:ls,a:'center',c:PAL['rj']});
  /* one turn, unrolled */
  const cF=Math.PI*diam(F),cN=Math.PI*diam(N),bs=Math.min(3.6,440/Math.max(cF,cN)),x0=20,bl=12.5*k;
  txt(ctx,'One turn covers '+f1(cF)+' in (factory)',x0,ground+16+bl,{s:bl,c:PAL['cv-soft']});
  ctx.fillStyle=PAL['cv-soft'];ctx.fillRect(x0,ground+24+bl,cF*bs,10);
  txt(ctx,'One turn covers '+f1(cN)+' in (yours)',x0,ground+70+bl,{s:bl,w:700,c:PAL['rj']});
  ctx.fillStyle=PAL['rj'];ctx.fillRect(x0,ground+78+bl,Math.min(cN*bs,455),10);
  ctx.strokeStyle=PAL['cv-ink'];ctx.setLineDash([3,3]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0+cF*bs,ground+20+bl);ctx.lineTo(x0+cF*bs,ground+92+bl);ctx.stroke();ctx.setLineDash([]);
  /* speedometer: 0 to 100 mph across 240° */
  const cx=640,cy=200,R=135,ang=v=>(210-2.4*clamp(v,0,100))*Math.PI/180,P=(v,r)=>[cx+r*Math.cos(ang(v)),cy-r*Math.sin(ang(v))];
  ctx.fillStyle=PAL['card'];ctx.beginPath();ctx.arc(cx,cy,R+8,0,7);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle=PAL['cv-ink'];for(let v=0;v<=100;v+=5){const p1=P(v,R-(v%10?8:14)),p2=P(v,R);ctx.lineWidth=v%10?1:2;ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke();
   if(v%20===0){const p=P(v,R-32);txt(ctx,String(v),p[0],p[1],{s:12*k,w:700,a:'center',b:'middle'});}}
  txt(ctx,'mph',cx,cy+44,{s:Math.min(12*k,18),c:PAL['cv-soft'],a:'center'});
  const needle=(v,col,w,len)=>{const p=P(v,len);ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(p[0],p[1]);ctx.stroke();ctx.lineCap='butt';};
  if(G.g)needle(G.g.v0,PAL['s4'],4,R-22);else if(!solved&&Math.abs(sim.p.gut-sim.p.dash)>0.2){ctx.setLineDash([6,4]);needle(sim.p.gut,PAL['s4'],4,R-22);ctx.setLineDash([]);}
  if(solved)needle(trueSp(sim),PAL['s3'],5,R-12);
  needle(sim.p.dash,PAL['cv-ink'],4,R-40);ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(cx,cy,7,0,7);ctx.fill();
  const ts=13*k;let ty=cy+R+40;
  txt(ctx,'Dash says '+sim.p.dash+' mph',cx,ty,{s:ts,w:700,a:'center'});ty+=ts+8;
  if(solved){txt(ctx,'Really going '+f1(trueSp(sim))+' mph',cx,ty,{s:ts,w:700,c:PAL['s3'],a:'center'});if(G.g)txt(ctx,'Your gut: '+f1(G.g.v0)+' mph',cx,ty+ts+8,{s:ts,w:700,c:PAL['s4'],a:'center'});}
  else if(G.g)txt(ctx,'Your gut: '+f1(G.g.v0)+' mph',cx,ty,{s:ts,w:700,c:PAL['s4'],a:'center'});
  else txt(ctx,'Your guess: '+f1(sim.p.gut)+' mph',cx,ty,{s:ts,w:700,c:PAL['s4'],a:'center'});},
 narrate(sim){const r=ratio(sim),F=fac(sim),N=nt(sim),pc=Math.abs(r-1)*100;
  if(Math.abs(r-1)<1e-9)return `Your tires match the factory size, so <b>each turn covers exactly what the car expects</b>, and the speedometer is right.`;
  const big=r>1;return `Your ${codes()?sizeStr(N)+' ':''}tires are ${f2(diam(N))} in tall, against ${f2(diam(F))} in from the factory. Each turn covers ${f1(pc)}% ${big?'more':'less'} road, so <b>the speedometer reads ${big?'low':'high'}</b>${sim.st.solved?`: at ${sim.p.dash} mph on the dash you are really going ${f1(trueSp(sim))} mph`:''}.`;},
 gut:{better:'lower',
  controls:['gut'],
  ask:{bio:'The pickup now has taller tires, and the dash says <b>65 mph</b>. How fast do you think you are really going? Drag the slider here to your guess, then lock it in.',
   honors:'Look at the two tires and the speedometer. Drag the slider here to the speed you think you are really going, then lock it in.'},
  lockLabel:'Lock in my speed',
  lock(sim){return {v:Math.abs(sim.p.gut-trueSp(sim)),v0:sim.p.gut,label:f1(sim.p.gut)+' mph'};},
  solve(sim){const t=trueSp(sim);sim.p.gut=t;sim.st.solved=true;return {v:0,v0:t,label:f1(t)+' mph'};},
  how:{bio:'One turn of a tire covers its circumference, π × diameter. The car assumes the factory circumference, so the true speed is the dash reading × (your circumference ÷ factory circumference). The π cancels, so it is just the ratio of the diameters.',
   ap:'Diameter = rim + 2 × width × aspect ÷ 25.4, so 265/70R17 is 17 + 2 × 185.5 ÷ 25.4 = 31.61 in. True speed = dash × d_new ÷ d_factory, and true miles = odometer miles × the same ratio.'},
  compare(sim,g,m){const t=m.v0,d=t-sim.p.dash,err=Math.abs(g.v0-t),miss=odoMiss(sim),mi=miles(sim);
   const odo=Math.abs(miss)<1?'':` Over ${comma(mi)} real miles a year, the odometer ${miss>0?'misses':'adds'} about <b>${comma(Math.abs(miss))} miles</b>.`;
   const lead=Math.abs(d)<0.05?`With factory-size tires the dash is right: you are going ${sim.p.dash} mph.`:`You are really going <b>${f1(t)} mph</b> when the dash says ${sim.p.dash}: <b>${f1(Math.abs(d))} mph ${d>0?'faster':'slower'}</b> than you think.${d>0?' Radar measures your true speed, not your dashboard.':''}`;
   if(err<0.6)return `Your gut was right on, within ${f1(err)} mph. ${lead}${odo}`;
   return `${lead} Your gut was ${f1(err)} mph off.${odo}`;},
  again(sim){const o=['down','up1','up2','up3'];sim.p.newt=o[Math.floor(Math.random()*4)];if(atLeast('honors'))sim.p.veh=['truck','suv','car'][Math.floor(Math.random()*3)];sim.p.dash=[35,45,55,65,70,75][Math.floor(Math.random()*6)];sim.p.gut=sim.p.dash;sim.st.solved=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You put taller tires on a car and the speedometer says 60 mph. How fast are you really going?',choices:['Slower than 60 mph','Exactly 60 mph','Faster than 60 mph'],correct:2,explain:'Each turn of a taller tire covers more road. The car counts turns and assumes the factory size, so it thinks you covered less ground than you did. The speedometer reads low.'},
  {lvl:'bio',instant:true,q:'A car gets smaller tires than the factory size. What happens to the odometer?',choices:['It counts more miles than you really drove','It counts fewer miles','Nothing changes'],correct:0,explain:'A smaller tire turns more times per mile. The car credits every turn with the bigger factory circumference, so it adds up more miles than you really drove. On the sedan, a slightly smaller size makes the odometer add about 1.8%: about 213 extra miles on 12,000 real miles.'},
  {lvl:'honors',instant:true,q:'A tire is 5% taller (in diameter) than the factory tire. How much more road does one turn cover?',choices:['About 2.5% more','5% more','About 10% more','About 15.7% more (5% × π)'],correct:1,explain:'Circumference = πd. Multiply d by 1.05 and πd is multiplied by 1.05 too. π is in both circumferences, so it cancels in the ratio.'},
  {lvl:'honors',instant:true,q:'How tall is a 285/75R17 tire?',choices:['About 25.4 in','About 31.6 in','About 33.8 in','About 37.0 in'],correct:2,explain:'Sidewall = 285 mm × 0.75 = 213.75 mm = 8.42 in. There are two sidewalls, one above and one below the 17 in rim: 17 + 2 × 8.42 = 33.83 in.'},
  {lvl:'ap',instant:true,q:'About how many times does a 265/70R17 tire (31.61 in tall) turn in one mile?',choices:['About 319','About 638','About 2,004','About 3,186'],correct:1,explain:'One mile is 63,360 in. One turn covers π × 31.61 ≈ 99.3 in. 63,360 ÷ 99.3 ≈ 638 turns.'},
  {lvl:'ap',instant:true,q:'The pickup’s 265/70R17 tires are swapped for 285/75R17s. The owner really drives 12,000 miles. About what does the odometer show?',choices:['About 11,210 miles','About 12,000 miles','About 12,840 miles','About 11,600 miles'],correct:0,explain:'Ratio of diameters: 33.83 ÷ 31.61 = 1.070. The odometer shows 12,000 ÷ 1.070 ≈ 11,211 miles, so it misses about 789.'}
 ],
 tour:[
  {title:'Two tires, to scale',text:{bio:'Left: the tire this pickup came with from the factory. Right: the bigger tires your family put on. The new ones are 33.8 in tall instead of 31.6 in.',honors:'Left: the factory 265/70R17 tire on this pickup. Right: the bigger 285/75R17 tires your family put on. The new ones are 33.8 in tall instead of 31.6 in.'},focus:[0,40,480,260],pause:true,setup:sim=>{BioLab.setValues(sim,{veh:'truck',newt:'up2',dash:65,gut:65});}},
  {title:'One turn, unrolled',text:'Roll each tire one full turn and it covers its circumference, π × diameter. The factory tire covers 99.3 in. The new tire covers 106.3 in.',focus:[0,290,480,160],pause:true},
  {title:'What the car assumes',text:'The car counts how fast the wheels turn and multiplies by the factory 99.3 in. It has no idea the tires changed, so it credits every turn with too little distance.',pause:true},
  {title:'The speedometer reads low',text:'So when the dash says 65 mph, you are really going 65 × 33.83 ÷ 31.61 ≈ 69.6 mph. The green needle shows your true speed.',focus:[490,40,310,410],pause:true,setup:sim=>SIM.actions[0].run(sim)},
  {title:'The odometer too',text:'Every mile on the odometer is really 1.07 miles. Drive 12,000 real miles in a year and the odometer shows only about 11,211: it misses about 789.',pause:true},
  {lvl:'ap',title:'Reading the size',text:'285/75R17: the tire is 285 mm wide, the sidewall is 75% of that (213.75 mm, or 8.42 in), and the rim is 17 in. Diameter = 17 + 2 × 8.42 = 33.83 in.',focus:[0,40,480,260],pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How much does tire size change your true speed?</p><ol><li>With the dash at 65 mph, press <b>Do the math</b> for each tire choice and record a trial.</li><li>Graph Trials with your tire height on x and true speed on y.</li></ol><p>Write one sentence: what pattern do you see?</p>',
  honors:'<p><b>Question:</b> Is the speedometer error the same at every speed?</p><ol><li>With the bigger tires, record the true speed at 25, 45, 65 and 75 mph on the dash.</li><li>Find true ÷ dash each time, and the difference in mph.</li><li>Which stays the same: the ratio or the difference? Why does that matter on the highway?</li></ol>',
  ap:'<p><b>Question:</b> Can you find a size that fits a bigger look without fooling the speedometer much?</p><ol><li>Choose Custom. Find two different width and aspect combinations within 1% of the factory diameter.</li><li>Show the diameter calculation for each.</li></ol><p><b>CER:</b> Claim, evidence from your calculations, and reasoning with the ratio of circumferences.</p>'},
 terms:[
  {t:'Circumference',d:'The distance around a circle, C = πd. One full turn of a tire rolls it this far.'},
  {t:'Ratio',d:'How many times bigger one number is than another. True speed = dash reading × (new diameter ÷ factory diameter).'},
  {t:'Aspect ratio',d:'In a tire size like 265/70R17, the 70 means the sidewall height is 70% of the 265 mm width.',lvl:'honors'},
  {t:'Arc length',d:'Part of a circumference. If a sensor ring has 48 teeth, each tooth that passes means the wheel turned 1/48 of a turn and rolled 1/48 of the circumference.',lvl:'ap'}
 ],
 about:'<p><b>Model:</b> the car counts wheel turns and multiplies by the factory tire’s circumference. Diameter = rim + 2 × (width × aspect ÷ 100) ÷ 25.4 in. True speed = dash × d_new ÷ d_factory; the odometer shows true miles × d_factory ÷ d_new.</p><p>This uses each tire’s unloaded, brand-new diameter. Real tires squash a little under the car’s weight and wear down over time, so tire makers publish slightly different revolutions per mile. This is a simplified model for learning, not advice about any vehicle or about traffic law. The tire sizes are typical examples for each kind of vehicle.</p>'
};
BioLab.register(SIM);
})();
