(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,bars,atLeast,niceStep}=BioLab.h;
/* Decimal units throughout: 1 KB = 10³ bytes, 1 MB = 10⁶, 1 GB = 10⁹, 1 TB = 10¹². 1 byte = 8 bits; Mbps = 10⁶ bits per second. */
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
function sci(v,d){if(v===0)return '0';let e=Math.floor(Math.log10(Math.abs(v))),m=v/Math.pow(10,e);let ms=(+m.toFixed(d===undefined?2:d)).toString();if(+ms>=10){e++;ms=(+(v/Math.pow(10,e)).toFixed(d===undefined?2:d)).toString();}return ms+' × 10'+String(e).split('').map(c=>SUP[c]).join('');}
const n0=v=>Math.round(v).toLocaleString('en-US');
const n1=v=>(+v.toFixed(1)).toLocaleString('en-US');
const eff=sim=>atLeast('ap')?sim.p.eff/100:1;
const mins=sim=>sim.p.size*8e9/(sim.p.speed*1e6*eff(sim))/60;
const photos=sim=>Math.floor(sim.p.free*1e9/(sim.p.psize*1e6));
const isGame=sim=>sim.p.job==='game';
const truth=sim=>isGame(sim)?mins(sim):photos(sim);
const guess=sim=>isGame(sim)?sim.p.gmin:sim.p.gph;
const unitW=sim=>isGame(sim)?'min':'photos';
const fmtA=(sim,v)=>isGame(sim)?n1(v)+' min':n0(v)+' photos';
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).m));
/* controls tied to one job are hidden for the other */
function vis(sim){const W=sim.ui&&sim.ui.ctlW;if(!W)return;SIM.controls.forEach(c=>{if(!c.only||!W[c.id])return;W[c.id].hidden=!atLeast(c.lvl||'bio')||c.only!==sim.p.job;});}
function chain(sim){const hon=atLeast('honors');
 if(isGame(sim)){const s=sim.p.size,sp=sim.p.speed*eff(sim),bits=s*8e9,t=bits/(sp*1e6);
  if(!hon)return `${s} GB = ${n0(s*1000)} MB = ${n0(s*8000)} megabits (8 bits in every byte). ${n0(s*8000)} ÷ ${n1(sp)} megabits per second = ${n0(t)} s = ${n1(t/60)} min.`;
  return `${s} GB = ${sci(s*1e9)} bytes = ${sci(bits)} bits. ${n1(sp)} Mbps = ${sci(sp*1e6)} bits/s. (${sci(bits)}) ÷ (${sci(sp*1e6)}) = ${sci(t)} s = ${n1(t/60)} min.`;}
 const f=sim.p.free,ps=sim.p.psize;
 if(!hon)return `${f} GB = ${n0(f*1000)} MB. ${n0(f*1000)} MB ÷ ${ps} MB per photo = ${n0(photos(sim))} photos.`;
 return `${f} GB = ${sci(f*1e9)} bytes. One photo = ${sci(ps*1e6)} bytes. (${sci(f*1e9)}) ÷ (${sci(ps*1e6)}) = ${sci(f*1e9/(ps*1e6),3)} → ${n0(photos(sim))} whole photos.`;}

const SIM={
 id:'datasize',hash:'datasize',apUnit:4,order:1,tab:'Data and storage',kind:'Simulation',
 card:'Guess how long a game takes to download or how many photos fit on your phone, then let powers of ten and the factor of 8 check you.',
 title:'How long, how many?',
 lede:{bio:'Internet speeds are sold in megabits per second, but game sizes are in gigabytes. Each step up (kilo, mega, giga) is 1,000 times bigger, and every byte is 8 bits. Miss either one and your estimate is way off.',
  honors:'Every unit here is a power of ten: MB = 10⁶ bytes, GB = 10⁹ bytes. Writing sizes in scientific notation turns a scary division into dividing the front numbers and subtracting the exponents.',
  ap:'Time = (size × 8 bits per byte) ÷ (speed × 10⁶ bits per second). Watch the two traps: 8 bits per byte (a factor of 8) and decimal GB vs. binary GiB (a factor of about 1.07).'},
 scale:{bio:'Decimal units, as phone makers and internet providers use them: each step up (KB, MB, GB, TB) is 1,000 times bigger.',honors:'Decimal units, as phone makers and internet providers use them: 1 GB = 10⁹ bytes, 1 Mbps = 10⁶ bits per second.'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your question',
 controls:[
  {id:'job',label:'Question',type:'seg',def:'game',options:[{v:'game',l:'Download a game'},{v:'photos',l:'Photos that fit'}],onChange(sim){vis(sim);if(sim.mode!=='guided'&&BioLab.gutRender)BioLab.gutRender(sim);}},
  {id:'size',label:'Game size',type:'range',min:5,max:100,step:5,def:60,unit:' GB',noGut:true,only:'game'},
  {id:'speed',label:'Internet plan speed',type:'range',min:100,max:1000,step:25,def:200,unit:' Mbps',noGut:true,only:'game',help:'Mbps = megabits per second. A bit is one 0 or 1; a byte is 8 bits.'},
  {id:'eff',label:'Speed you actually get, as a percent of the plan',type:'range',min:50,max:100,step:5,def:100,unit:'%',lvl:'ap',noGut:true,only:'game',help:'Wi-Fi, busy servers and network overhead usually make real downloads slower than the plan.'},
  {id:'gmin',label:'Your guess: minutes to download',type:'range',min:1,max:300,step:1,def:10,unit:' min',only:'game'},
  {id:'free',label:'Free space on your phone',type:'range',min:8,max:128,step:8,def:40,unit:' GB',noGut:true,only:'photos'},
  {id:'psize',label:'Size of one photo',type:'range',min:2,max:6,step:0.5,def:3,unit:' MB',noGut:true,only:'photos',help:'Phone photos are often a few megabytes each. This is an assumption you can change.'},
  {id:'gph',label:'Your guess: photos that fit',type:'range',min:0,max:70000,step:100,def:2000,unit:' photos',only:'photos'},
  {id:'show',label:'Show the math',type:'toggle',def:false,help:'Leave it off until you have locked in your guess.'}
 ],
 onLevel:vis,
 init(){return {};},step(){},
 metrics:[
  {id:'mins',label:'Download time',unit:'min',d:1,min:0,max:null,get:sim=>shown(sim)&&isGame(sim)?mins(sim):null},
  {id:'mbs',label:'Speed in megabytes per second',unit:'MB/s',d:1,min:0,max:null,get:sim=>shown(sim)&&isGame(sim)?sim.p.speed*eff(sim)/8:null},
  {id:'photos',label:'Photos that fit',unit:'',d:0,min:0,max:null,get:sim=>shown(sim)&&!isGame(sim)?photos(sim):null},
  {id:'ratio',label:'The math ÷ your guess',unit:'×',d:1,min:0,max:null,get:sim=>{if(!shown(sim))return null;const g=guess(sim);return g>0?truth(sim)/g:null;}},
  {id:'chain',label:'The math, step by step',text:true,get:sim=>shown(sim)?chain(sim):'Hidden until you lock in your guess or turn on Show the math.'}
 ],
 graphs:[{id:'cmp',label:'Your guess vs. the math vs. the traps',custom:true}],defaultGraph:'cmp',
 plot(sim,ctx,box){const T=truth(sim),g=guess(sim),sh=shown(sim),game=isGame(sim);
  const trap=game?T/8:T*1000;const vals=sh?[g,T,game?trap:NaN]:[g,NaN,NaN];const cats=game?['Your guess','The math','Forgot the 8']:['Your guess','The math',''];
  const top=Math.max(...vals.filter(Number.isFinite),1)*1.18;
  const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:top,xcats:cats,yl:game?'Minutes':'Photos'});
  bars(ctx,ax,vals,{colors:[PAL['s4'],PAL['s3'],PAL['s1']],d:game?1:0});
  if(!sh)txt(ctx,'Lock in your guess first',box.L+box.W*0.6,box.T+box.H*0.3,{s:14,c:PAL['muted'],a:'center'});},
 draw(sim,ctx,vdt,k){const sh=shown(sim),game=isGame(sim),hon=atLeast('honors'),G=GS(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* powers-of-ten ladder */
  const U=[['KB','kilobyte',3],['MB','megabyte',6],['GB','gigabyte',9],['TB','terabyte',12]],used=game?['GB']:['MB','GB'];
  const bw=145,gap=60,lx=(800-(4*bw+3*gap))/2;
  U.forEach((u,i)=>{const x=lx+i*(bw+gap),on=used.includes(u[0]);ctx.fillStyle=on?PAL['s2']:PAL['cv-bg2'];rr(ctx,x,18,bw,58,10);ctx.fill();
   txt(ctx,u[0],x+bw/2,42,{s:20*Math.min(k,1.3),w:800,c:on?'#fff':PAL['cv-soft'],a:'center'});
   txt(ctx,hon?`10${SUP[String(u[2])[0]]}${u[2]>9?SUP[String(u[2])[1]]:''} bytes`:u[1],x+bw/2,68,{s:12*k,c:on?'#fff':PAL['cv-soft'],a:'center'});
   if(i<3)txt(ctx,'×1000',x+bw+gap/2,52,{s:11*k,w:400,c:PAL['cv-soft'],a:'center'});});
  if(game){/* the pipe: bits vs bytes */
   const sp=sim.p.speed*eff(sim);
   txt(ctx,`Game: ${sim.p.size} GB`,40,124,{s:16*k,w:800,c:PAL['cv-ink']});
   txt(ctx,`Internet: ${n1(sim.p.speed)} Mbps${eff(sim)<1?` (you get ${n1(sp)})`:''}`,40,124+24*k,{s:16*k,w:800,c:PAL['cv-ink']});
   txt(ctx,sh?`= ${n1(sp/8)} megabytes per second (8 bits per byte)`:'Mbps means megabits per second',40,124+46*k,{s:13*k,c:sh?PAL['s3']:PAL['cv-soft']});
   /* timeline */
   const T=mins(sim),g=sim.p.gmin,gl=G&&G.g&&G.g.job==='game'?G.g.ans:null,mx0=Math.max(sh?T:0,g,gl||0,5)*1.12,st=niceStep(mx0,5),mx=Math.ceil(mx0/st)*st;
   const L=60,R=740,Y=330,X=v=>L+(R-L)*v/mx;
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(L,Y);ctx.lineTo(R,Y);ctx.stroke();
   for(let v=0;v<=mx+1e-9;v+=st){ctx.beginPath();ctx.moveTo(X(v),Y-5);ctx.lineTo(X(v),Y+5);ctx.stroke();txt(ctx,n0(v),X(v),Y+22*Math.min(k,1.3),{s:12*k,c:PAL['cv-soft'],a:'center'});}
   txt(ctx,'minutes',R,Y+42*Math.min(k,1.3),{s:12*k,c:PAL['cv-soft'],a:'right'});
   if(sh){ctx.fillStyle=PAL['s3'];ctx.globalAlpha=.3;ctx.fillRect(L,Y-14,X(T)-L,14);ctx.globalAlpha=1;
    const mk=(v,col,lab,up)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(X(v),Y-2);ctx.lineTo(X(v)-7,Y-14);ctx.lineTo(X(v)+7,Y-14);ctx.fill();if(lab)txt(ctx,lab,clamp(X(v),L+50,R-50),Y-20-up,{s:13*k,w:700,c:col,a:'center'});};
    mk(T,PAL['s3'],`Math: ${n1(T)} min`,0);
    if(hon&&T/8<mx)mk(T/8,PAL['s1'],`Forgot the 8: ${n1(T/8)} min`,Math.abs(X(T/8)-X(T))<230*k?24*k+6:0);}
   const gv=gl===null?g:gl;ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.moveTo(X(gv),Y+2);ctx.lineTo(X(gv)-7,Y+14);ctx.lineTo(X(gv)+7,Y+14);ctx.fill();
   txt(ctx,`${gl===null?'Your guess':'Your gut'}: ${n0(gv)} min`,clamp(X(gv),L+70,R-70),Y+64*Math.min(k,1.3),{s:13*k,w:700,c:PAL['s4'],a:'center'});
  }else{const f=sim.p.free,ps=sim.p.psize,N=photos(sim),g=sim.p.gph;
   txt(ctx,`Free space: ${f} GB`,40,124,{s:16*k,w:800,c:PAL['cv-ink']});
   txt(ctx,`One photo: ${ps} MB`,40,124+24*k,{s:16*k,w:800,c:PAL['cv-ink']});
   /* storage bar */
   const L=60,R=740,Y=280,H=44;ctx.fillStyle=PAL['cv-bg2'];rr(ctx,L,Y,R-L,H,8);ctx.fill();ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;rr(ctx,L,Y,R-L,H,8);ctx.stroke();
   txt(ctx,`${f} GB free`,R,Y-8,{s:12*k,c:PAL['cv-soft'],a:'right'});
   const locked=G&&G.g&&G.g.job==='photos';
   if(locked||sh){const gg=locked?G.g.ans:g,used=gg*ps/1000,fr=used/f;ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.55;ctx.fillRect(L,Y,(R-L)*Math.min(1,fr),H);ctx.globalAlpha=1;
    txt(ctx,`Your guess of ${n0(gg)} photos fills ${n1(used)} GB${fr>1?': more than you have':''}`,L,Y+H+26*k,{s:13*k,w:700,c:fr>1?PAL['s1']:PAL['s4']});}
   else txt(ctx,`Your guess: ${n0(g)} photos. Lock it in to see how much space that is.`,L,Y+H+26*k,{s:13*k,w:700,c:PAL['s4']});
   if(sh)txt(ctx,`The math: ${n0(N)} photos fill it`,L,Y+H+50*k,{s:13*k,w:700,c:PAL['s3']});}},
 narrate(sim){const game=isGame(sim);
  if(!shown(sim))return game?`A ${sim.p.size} GB game on a ${sim.p.speed} Mbps plan. Mbps means megabits per second. <b>How long will it take?</b> Make your guess, then lock it in.`
   :`${sim.p.free} GB free and ${sim.p.psize} MB photos. <b>A gigabyte is 1,000 megabytes.</b> Make your guess, then lock it in.`;
  if(game){const T=mins(sim);const sp=sim.p.speed*eff(sim);return `<b>${n1(T)} minutes.</b> ${n1(sp)} megabits per second is only ${n1(sp/8)} megabytes per second, because each byte is 8 bits. Forget the 8 and you would say ${n1(T/8)} min.`;}
  return `<b>${n0(photos(sim))} photos.</b> ${sim.p.free} GB is ${n0(sim.p.free*1000)} MB, and each photo takes ${sim.p.psize} MB. Mix up MB and GB and you are off by a factor of 1,000.`;},
 gut:{better:'lower',controls:['gmin','gph'],
  get ask(){const s=BioLab.sims&&BioLab.sims.datasize,ph=!!(s&&s.p.job==='photos'),what=ph?'how many photos you think fit':'how many minutes you think the download takes';
   return {bio:`Drag the slider here to ${what}. Do not work it out: go by feel, then lock it in.`,honors:`Before any math, drag the slider here to ${what}. No calculator. Then lock it in.`};},
  lock(sim){const g=guess(sim),T=truth(sim);return {v:Math.abs(g-T),ans:g,job:sim.p.job,label:fmtA(sim,g)};},
  solve(sim){const T=truth(sim);if(isGame(sim))sim.p.gmin=T;else sim.p.gph=T;sim.p.show=true;return {v:0,ans:T,job:sim.p.job,label:fmtA(sim,T)};},
  how:{bio:'Turn everything into the same unit first. A gigabyte is 1,000 megabytes, and a byte is 8 bits, so a download takes (size in megabits) ÷ (megabits per second).',
   honors:'Write each amount as a power of ten, then divide: (a × 10ᵐ) ÷ (b × 10ⁿ) = (a ÷ b) × 10ᵐ⁻ⁿ.',
   ap:'t = 8S ÷ (vη), with S in bytes, v in bits per second and η the share of the plan speed you really get.'},
  compare(sim,g,m){const T=m.ans,G0=g.ans,game=g.job==='game',d=Math.abs(G0-T),rel=T>0?d/T:0;
   if(g.job!==sim.p.job)return 'You switched questions after locking in. Press Try another one to start fresh.';
   if(rel<0.05)return `Your gut was right on: ${fmtA(sim,G0)} against ${fmtA(sim,T)}. You already think in powers of ten.`;
   const f=G0>0?(G0>T?G0/T:T/G0):Infinity,fx=Number.isFinite(f)?`${f<10?n1(f):n0(f)}×`:'far';
   if(game){let t=G0<T?`You expected it done in ${n0(G0)} min, but it takes <b>${n1(T)} min</b>: you would be waiting <b>${n1(T-G0)} minutes longer</b> than you planned (${fx} too fast).`
     :`You planned on ${n0(G0)} min, but it takes only <b>${n1(T)} min</b>: <b>${n1(G0-T)} minutes</b> you did not need to set aside (${fx} too slow).`;
    if(Math.abs(G0-T/8)<Math.max(1,0.1*T/8))t+=' That guess is exactly what you get if you forget the 8 bits in every byte.';return t;}
   return G0<T?`You guessed ${n0(G0)} photos, but <b>${n0(T)}</b> fit: <b>${n0(T-G0)} more</b> than you thought (${fx} too few). You might delete photos you had room to keep.`
    :`You guessed ${n0(G0)} photos, but only <b>${n0(T)}</b> fit: <b>${n0(G0-T)} too many</b> (${fx}). Your phone would fill up well before you expected.`;},
  again(sim){const game=Math.random()<0.5;sim.p.job=game?'game':'photos';
   if(game){sim.p.size=5*(2+Math.floor(Math.random()*19));sim.p.speed=100+25*Math.floor(Math.random()*21);sim.p.gmin=10;}
   else{sim.p.free=8*(1+Math.floor(Math.random()*16));sim.p.psize=2+0.5*Math.floor(Math.random()*9);sim.p.gph=2000;}
   sim.p.show=false;vis(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Your internet plan is 200 Mbps. About how long does a 1 GB (1,000 MB) file take to download at full speed?',choices:['5 seconds','40 seconds','5 minutes','Less than a second'],correct:1,explain:'1,000 MB × 8 = 8,000 megabits, and 8,000 ÷ 200 = 40 seconds. If you forget the 8, you get 1,000 ÷ 200 = 5 seconds, 8 times too fast.'},
  {lvl:'bio',instant:true,q:'Your phone has 64 GB free, and each photo is about 4 MB. About how many photos fit?',choices:['16','1,600','16,000','160,000'],correct:2,explain:'64 GB = 64,000 MB, and 64,000 ÷ 4 = 16,000 photos. Forgetting that a GB is 1,000 MB gives 16, off by a factor of 1,000.'},
  {lvl:'honors',instant:true,q:'A cloud service stores 3 × 10⁹ photos, each 4 × 10⁶ bytes. How many bytes is that?',choices:['1.2 × 10¹⁶ bytes','7 × 10¹⁵ bytes','1.2 × 10⁵⁴ bytes','1.2 × 10¹⁵ bytes'],correct:0,explain:'Multiply the front numbers and add the exponents: 3 × 4 = 12 and 10⁹ × 10⁶ = 10¹⁵, so 12 × 10¹⁵ = 1.2 × 10¹⁶ bytes. That is 12 petabytes.'},
  {lvl:'honors',instant:true,q:'A 60 GB game is 4.8 × 10¹¹ bits. Your plan is 2 × 10⁸ bits per second. How many seconds does it take?',choices:['2.4 × 10³ s','2.4 × 10¹⁹ s','9.6 × 10¹⁹ s','2.4 × 10⁴ s'],correct:0,explain:'(4.8 × 10¹¹) ÷ (2 × 10⁸) = (4.8 ÷ 2) × 10¹¹⁻⁸ = 2.4 × 10³ seconds, which is 2,400 s or 40 minutes.'},
  {lvl:'ap',instant:true,q:'A phone box says 128 GB (128 × 10⁹ bytes). Some computers count a “GB” as 2³⁰ bytes. What size do they show?',choices:['About 119 GB','128 GB','About 137 GB','About 125 GB'],correct:0,explain:'128 × 10⁹ ÷ 2³⁰ = 128 × 10⁹ ÷ 1,073,741,824 ≈ 119.2. Nothing is missing: it is the same number of bytes counted in bigger “binary” gigabytes (GiB).'},
  {lvl:'ap',instant:true,q:'Your plan is 300 Mbps down but only 20 Mbps up. About how long does it take to upload a 2 GB video?',choices:['About 13 minutes','About 53 seconds','About 7 seconds','About 100 seconds'],correct:0,explain:'2 GB = 16,000 megabits. 16,000 ÷ 20 = 800 s ≈ 13.3 minutes. Using the download speed instead would give 16,000 ÷ 300 ≈ 53 s.'}
 ],
 tour:[
  {title:'The question',text:'A 60 GB game on a 200 Mbps internet plan. The game size is in gigabytes (bytes). The speed is in megabits (bits) per second.',pause:true,setup:sim=>{BioLab.setValues(sim,{job:'game',size:60,speed:200,eff:100,gmin:5,show:false});vis(sim);}},
  {title:'Powers of ten',text:'Each unit is 1,000 times the one before it: a kilobyte is 10³ bytes, a megabyte 10⁶, a gigabyte 10⁹. So 60 GB = 60,000 MB.',pause:true,focus:[40,10,720,74]},
  {title:'The tempting guess',text:'“60,000 MB at 200 per second is 300 seconds: 5 minutes.” That is the orange marker. It mixes megabytes with megabits.',pause:true},
  {title:'8 bits in every byte',text:'200 megabits per second is only 25 megabytes per second, because each byte is 8 bits. 60,000 MB ÷ 25 MB/s = 2,400 s = 40 minutes.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'Off by 8 times',text:'The 5-minute guess is exactly 8 times too fast. You would have planned for 5 minutes and waited 40.',pause:true},
  {title:'Photos work the same way',text:'40 GB free and 3 MB photos: 40,000 MB ÷ 3 MB ≈ 13,333 photos. Forget that a GB is 1,000 MB and you would say 13.',pause:true,setup:sim=>{BioLab.setValues(sim,{job:'photos',free:40,psize:3,gph:13300,show:true});vis(sim);}},
  {lvl:'honors',title:'Scientific notation',text:'4 × 10¹⁰ bytes ÷ 3 × 10⁶ bytes = 1.33 × 10⁴ photos. Divide the front numbers and subtract the exponents: 10 − 6 = 4.',pause:true},
  {lvl:'ap',title:'Real speeds',text:'Back to the game. If you only get 80% of your plan’s speed, the 40-minute download takes 50 minutes. Time is inversely proportional to speed.',pause:true,setup:sim=>{BioLab.setValues(sim,{job:'game',size:60,speed:200,eff:80,gmin:50,show:true});vis(sim);}}
 ],
 onTourExit(sim){vis(sim);},
 lab:{bio:'<p><b>Question:</b> How does download time change with internet speed?</p><ol><li>Choose <b>Download a game</b>, turn on <b>Show the math</b>, and set the game to 60 GB.</li><li>Record the download time for speeds of 100, 200, 400 and 800 Mbps.</li><li>Graph <b>Trials</b> with speed on x and time on y.</li></ol><p>Write one sentence: what happens to the time when the speed doubles?</p>',
  honors:'<p><b>Question:</b> Can you do these in your head with scientific notation?</p><ol><li>For five games and speeds, write the size in bits and the speed in bits per second in scientific notation.</li><li>Divide by hand, then check with <b>Show the math</b>.</li></ol><p>Explain the exponent rule you used.</p>',
  ap:'<p><b>Question:</b> How much do real-world speeds matter?</p><ol><li>For a 100 GB game on a 500 Mbps plan, record the time at 100%, 80%, 60% and 50% of the plan.</li><li>Write time as a function of the percent and name the type of function.</li></ol><p><b>CER:</b> Claim, evidence and reasoning about inverse variation.</p>'},
 terms:[
  {t:'Bit and byte',d:'A bit is one 0 or 1. A byte is 8 bits. Speeds are usually in bits per second; file sizes in bytes.'},
  {t:'Prefixes',d:'Kilo = 10³, mega = 10⁶, giga = 10⁹, tera = 10¹² (in the decimal system that phone makers and internet providers use).'},
  {t:'Scientific notation',d:'A number written as a × 10ⁿ with 1 ≤ a < 10, like 4.8 × 10¹¹.',lvl:'honors'},
  {t:'Exponent rules',d:'10ᵐ × 10ⁿ = 10ᵐ⁺ⁿ and 10ᵐ ÷ 10ⁿ = 10ᵐ⁻ⁿ.',lvl:'honors'},
  {t:'GiB (gibibyte)',d:'2³⁰ = 1,073,741,824 bytes, about 7% more than a decimal GB. Some computers label GiB as “GB”.',lvl:'ap'}
 ],
 about:'<p>This tool uses <b>decimal</b> units, as phone makers, drive makers and internet providers do: 1 KB = 10³ bytes, 1 MB = 10⁶, 1 GB = 10⁹, 1 TB = 10¹², and 1 Mbps = 10⁶ bits per second. Some computers (Windows, for example) report sizes in <b>binary</b> units, 1 GiB = 2³⁰ bytes, but still label them “GB”, so a 128 GB phone can show as about 119 GB. No bytes are missing; the unit is different.</p><p>Download time = size × 8 ÷ speed. Real downloads are usually slower than the plan speed (Wi-Fi, busy servers, network overhead); at Deep dive you can set the share of the plan speed you really get. Photo sizes vary with the camera and the scene; the size here is an assumption you can change. A phone also needs some free space to run, so you could not fill every last byte with photos.</p>'
};
BioLab.register(SIM);
})();
