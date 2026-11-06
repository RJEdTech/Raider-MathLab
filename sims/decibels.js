(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,atLeast,fmtNum}=BioLab.h;
/* NIOSH recommended exposure limit: 85 dBA for 8 hours (480 min), and the time halves for every 3 dB more. */
const safe=L=>480/Math.pow(2,(L-85)/3);
const ratio=(a,b)=>Math.pow(10,(a-b)/10);
const U=()=>atLeast('honors')?' dBA':' dB';
const shown=sim=>!!(sim.peek||(sim.gutS&&sim.gutS.g));
const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const sci=v=>{const e=Math.floor(Math.log10(v)),m=v/Math.pow(10,e);return fmtNum(m,1)+' × 10'+String(e).split('').map(c=>SUP[c]).join('');};
const tm=m=>m>=120?fmtNum(m/60,m%60?1:0)+' hours':m>=10?Math.round(m)+' minutes':fmtNum(m,1)+' minutes';
const tms=m=>m>=120?fmtNum(m/60,m%60?1:0)+' h':m>=10?Math.round(m)+' min':fmtNum(m,1)+' min';
const xf=r=>r>=100?Math.round(r).toLocaleString('en-US'):r>=10?fmtNum(r,0):fmtNum(r,1);
function htxt(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s*0.85,w+6,o.s*1.1);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}

const SIM={
 id:'decibels',hash:'decibels',apUnit:4,order:5,tab:'Decibels and safe listening',kind:'Simulation',
 card:'Guess how long you can safely listen at a given volume, then let logarithms show how fast the safe time shrinks.',
 title:'How long can you listen that loud?',
 lede:{bio:'Decibels do not count loudness like a ruler. Every 10 dB means 10 times the sound energy, and every 3 dB about doubles it. So a few decibels can cut your safe listening time in half.',
  honors:'Sound level is a logarithm: dB = 10 log₁₀(I/I₀). Hearing experts use a 3 dB exchange rate: since +3 dB is about twice the intensity, the safe time halves.',
  ap:'Safe time T(L) = 480 ÷ 2^((L − 85)/3) minutes, an exponential in L. Inverting it takes a logarithm: L = 85 + 3 log₂(480/T).'},
 scale:{bio:'Sound levels in decibels (dB), the unit for how loud a sound is. The safe limit is the one US hearing experts recommend: 85 dB for 8 hours a day.',honors:'Sound levels in dBA (decibels weighted to match human hearing). Limits follow the NIOSH recommendation: 85 dBA for 8 hours a day.'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your listening',
 controls:[
  {id:'level',label:'Volume at your ears (dBA)',type:'range',min:85,max:110,step:1,def:94,unit:' dBA',noGut:true,help:'Earbuds near full volume and loud concerts can reach 100 decibels or more.'},
  {id:'guess',label:'Your guess: safe listening minutes per day',type:'range',min:0,max:480,step:5,def:240,unit:' min'},
  {id:'comp',label:'Compare with another level (dBA)',type:'range',min:60,max:110,step:1,def:85,unit:' dBA',lvl:'honors',noGut:true,help:'Normal conversation is about 60 dBA.'}
 ],
 onLevel(sim){const c=SIM.controls[0],w=sim.ui.ctlW&&sim.ui.ctlW.level;c.unit=U();if(w){const l=w.querySelector('label');if(l)l.textContent=atLeast('honors')?'Volume at your ears (dBA)':'Volume at your ears (decibels)';}if(sim.ui.ctl&&sim.ui.ctl.level)sim.ui.ctl.level.set(sim.p.level);},
 actions:[{id:'show',label:'Skip the guess and show the answer',run(sim){sim.peek=true;sim.infoDirty=true;}}],
 init(){return {};},step(){},
 metrics:[
  {id:'safe',label:'Safe listening time per day',unit:'min',d:1,min:0,max:480,get:sim=>shown(sim)?safe(sim.p.level):null},
  {id:'hour',label:'Daily limit used by 1 hour',unit:'%',d:0,min:0,max:null,get:sim=>shown(sim)?100*60/safe(sim.p.level):null},
  {id:'x85',label:'Intensity compared with 85 dBA',unit:'×',d:1,lvl:'honors',min:0,max:null,get:sim=>ratio(sim.p.level,85)},
  {id:'xcomp',label:'Intensity compared with your other level',unit:'×',d:1,lvl:'honors',min:0,max:null,get:sim=>ratio(sim.p.level,sim.p.comp)},
  {id:'I',label:'Intensity at your ears',unit:'',lvl:'ap',text:true,noTrial:true,get:sim=>sci(1e-12*Math.pow(10,sim.p.level/10))+' W/m²'}
 ],
 graphs:[{id:'curve',label:'Safe time vs. volume',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:85,xmax:110,ymin:0,ymax:500,xl:'Volume ('+U().trim()+')',yl:'Safe minutes per day'});
  if(!shown(sim)){txt(ctx,'Lock in your gut answer to see this curve.',box.L+box.W/2,box.T+box.H/2,{s:14,c:PAL['muted'],a:'center',b:'middle'});return;}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let L=85;L<=110.001;L+=0.25){const x=ax.X(L),y=ax.Y(safe(L));L>85?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
  for(let L=85;L<=110;L+=3){ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(ax.X(L),ax.Y(safe(L)),4,0,7);ctx.fill();}
  const G=sim.gutS;if(G&&G.g){ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(ax.X(G.g.L),ax.Y(G.g.min),6,0,7);ctx.fill();txt(ctx,'Your gut',ax.X(G.g.L)+10,ax.Y(G.g.min)+4,{s:12,w:700,c:PAL['s4']});}
  const L=sim.p.level;ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(L),ax.Y(safe(L)),6,0,7);ctx.fill();txt(ctx,L+U()+': '+tms(safe(L)),ax.X(L)+10,ax.Y(safe(L))-10,{s:12,w:700,c:PAL['rj']});},
 draw(sim,ctx,vdt,k){const sh=shown(sim),G=sim.gutS,L=sim.p.level,hon=atLeast('honors');
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* left: intensity as area */
  const s0=16,r=ratio(L,85),side=s0*Math.sqrt(r),ox=34,oy=420;
  txt(ctx,hon?'Intensity, as area':'Sound energy, shown as area',ox,34,{s:13*k,w:700});
  ctx.fillStyle=PAL['s5'];ctx.globalAlpha=.3;ctx.fillRect(ox,oy-side,side,side);ctx.globalAlpha=1;ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.strokeRect(ox,oy-side,side,side);
  if(hon&&sim.p.comp!==85){const sc=s0*Math.sqrt(ratio(sim.p.comp,85));if(sc<330){ctx.strokeStyle=PAL['s2'];ctx.setLineDash([5,4]);ctx.strokeRect(ox,oy-sc,sc,sc);ctx.setLineDash([]);}}
  ctx.fillStyle=PAL['cv-ink'];ctx.fillRect(ox,oy-s0,s0,s0);
  txt(ctx,'85'+U(),ox+s0+6,oy-3,{s:12*k,w:700});
  const ly=Math.max(64*k,oy-side-12-18*k);htxt(ctx,L+U()+':',ox,ly,{s:12*k,w:700,c:PAL['s5']});htxt(ctx,xf(r)+(hon?' × the intensity of 85':' × the energy of 85 dB'),ox,ly+17*k,{s:12*k,w:700,c:PAL['s5']});
  if(hon&&sim.p.comp!==85)htxt(ctx,'Dashed: '+sim.p.comp+U(),ox,ly+34*k,{s:12*k,c:PAL['s2']});
  /* right: safe-time ladder */
  const x0=450,W=250,rows=sh?[85,88,91,94,97,100,103,106,109]:[85],rh=28;
  txt(ctx,hon?'Safe time per day (NIOSH)':'Safe time per day',x0-46,34,{s:13*k,w:700});
  const bar=(y,lev,min,col,label)=>{txt(ctx,lev+U(),x0-8,y+5,{s:12*k,a:'right',c:PAL['cv-soft']});const w=Math.max(2,min/480*W);ctx.fillStyle=col;ctx.fillRect(x0,y-rh*0.32,w,rh*0.64);
   if(label)txt(ctx,label,x0+w+6,y+5,{s:12*k,w:700,c:col});};
  rows.forEach((lev,i)=>{const y=62+i*rh;bar(y,lev,safe(lev),lev===L?PAL['rj']:PAL['cv-soft'],lev===85&&!sh?'8 hours':tms(safe(lev)));});
  const yU=62+rows.length*rh+10;
  ctx.strokeStyle=PAL['line'];ctx.beginPath();ctx.moveTo(x0-60,yU-rh*0.7);ctx.lineTo(x0+W,yU-rh*0.7);ctx.stroke();
  txt(ctx,'You: '+L+U(),x0-8,yU+5,{s:12*k,w:700,a:'right'});
  if(sh){const w=Math.max(2,safe(L)/480*W);ctx.fillStyle=PAL['rj'];ctx.fillRect(x0,yU-rh*0.32,w,rh*0.64);txt(ctx,tm(safe(L)),x0+w+8,yU+5,{s:12*k,w:700,c:PAL['rj']});}
  else txt(ctx,'?',x0+8,yU+8,{s:24*k,w:700,c:PAL['rj']});
  const gm=G&&G.g?G.g.min:sim.p.guess,gx=x0+gm/480*W;ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx,yU-rh*0.6);ctx.lineTo(gx,yU+rh*0.6);ctx.stroke();
  htxt(ctx,(G&&G.g?'Your gut: ':'Your guess: ')+tms(gm),clamp(gx,x0+70,x0+W-70),yU+rh*0.6+15*k,{s:12*k,w:700,c:PAL['s4'],a:'center'});},
 narrate(sim){const L=sim.p.level,r=ratio(L,85);
  const u=U();if(!shown(sim))return `85${u} is safe for 8 hours a day. At ${L}${u} the sound carries <b>${xf(r)} times the ${atLeast('honors')?'intensity':'sound energy'}</b>. Lock in your guess to see how much that cuts your safe time.`;
  const n=(L-85)/3;return `${L}${u} is ${L-85} dB above 85, or ${fmtNum(n,n%1?1:0)} steps of 3 dB. Each step halves the time: 480 ÷ 2^${fmtNum(n,n%1?2:0)} = <b>${tm(safe(L))} a day</b>.`;},
 gut:{better:'lower',
  controls:['guess'],
  ask:{bio:'85 dB is safe for 8 hours (480 minutes) a day, and your earbuds are louder. Drag the slider here to the minutes a day you think are safe at their volume. Then lock it in.',honors:'Before you look at the ladder: how many minutes a day is safe at this volume? Drag the slider here to your guess, then lock it in.'},
  lock(sim){const g=sim.p.guess;return {v:Math.abs(g-safe(sim.p.level)),min:g,L:sim.p.level,label:tm(g)+' a day'};},
  solve(sim){const T=safe(sim.p.level);sim.p.guess=Math.round(T/5)*5;return {v:0,min:T,L:sim.p.level,label:tm(T)+' a day at '+sim.p.level+U()};},
  how:{bio:'The math counts 3 dB steps above 85 dB. Each step about doubles the sound energy, so it halves the safe time: 8 hours, 4, 2, 1, 30 minutes, 15 minutes.',
   honors:'dB = 10 log₁₀(I/I₀), so +3 dB multiplies the intensity by 10^0.3 ≈ 2. Twice the energy reaches the same daily dose in half the time.',
   ap:'T(L) = 480 ÷ 2^((L − 85)/3) minutes. Every 10 dB multiplies intensity by 10 and divides the time by 2^(10/3) ≈ 10.1.'},
  compare(sim,g,m){const T=m.min,dose=100*g.min/T,L=sim.p.level,u=U();
   if(Math.abs(g.min-T)<=Math.max(5,0.15*T))return `Your gut was right on: about ${tm(T)} a day at ${L}${u}. You already sense how fast the safe time shrinks; the math shows why: each 3 dB doubles the energy.`;
   if(g.min>T)return `At ${L}${u} the limit is <b>${tm(T)} a day</b>. Listening for your guess of ${tm(g.min)} would be <b>${Math.round(dose)}% of the daily noise dose</b>, ${xf(dose/100)} times the limit. Most people guess like a ruler; decibels work like powers of 10.`;
   return `At ${L}${u} you actually have <b>${tm(T)} a day</b>, so your guess of ${tm(g.min)} was on the safe side by ${tm(T-g.min)}. Careful is fine, but the math tells you the real line.`;},
  again(sim){sim.peek=false;sim.p.level=[88,90,91,94,95,97,100,103,105][Math.floor(Math.random()*9)];sim.p.guess=240;}
 },
 onTourExit(sim){sim.peek=false;},
 challenges:[
  {lvl:'bio',instant:true,q:'How many times the sound intensity is 90 dB compared with 80 dB?',choices:['About 1.1 times (90 ÷ 80)','2 times','10 times','100 times'],correct:2,explain:'Every 10 dB is 10 times the intensity: 10^(10/10) = 10. Decibels are a logarithmic scale, so you cannot divide them like ordinary numbers.'},
  {lvl:'bio',instant:true,q:'85 dB is safe for 8 hours a day. How long is safe at 88 dB?',choices:['About 7 hours','About 6 hours','4 hours'],correct:2,explain:'+3 dB is about twice the sound energy, so you reach the same daily dose in half the time: 8 hours becomes 4.'},
  {lvl:'honors',instant:true,q:'One speaker plays at 80 dB. You add a second identical speaker playing the same kind of sound. About what is the level now?',choices:['80 dB','83 dB','90 dB','160 dB'],correct:1,explain:'Two speakers give twice the intensity. 10 log₁₀(2) ≈ 3, so the level rises about 3 dB, to 83 dB. Decibels do not add like ordinary numbers.'},
  {lvl:'honors',instant:true,q:'Using the 3 dB rule from 85 dBA for 8 hours, how long is safe at 100 dBA?',choices:['15 minutes','1 hour','2 hours','About 6 hours'],correct:0,explain:'100 − 85 = 15 dB, which is five 3 dB steps. 480 ÷ 2⁵ = 480 ÷ 32 = 15 minutes.'},
  {lvl:'ap',instant:true,q:'At what level does the safe time drop to 30 minutes? Use L = 85 + 3 log₂(480/T).',choices:['91 dBA','94 dBA','97 dBA','100 dBA'],correct:2,explain:'480/30 = 16 and log₂ 16 = 4, so L = 85 + 3 × 4 = 97 dBA.'},
  {lvl:'ap',instant:true,q:'A 110 dBA concert versus the 85 dBA limit: how many times the intensity?',choices:['About 25 times','About 32 times','About 316 times','About 2,500 times'],correct:2,explain:'25 dB above: 10^(25/10) = 10^2.5 ≈ 316. Safe time there is 480 ÷ 2^(25/3) ≈ 1.5 minutes.'}
 ],
 tour:[
  {title:'The starting rule',text:{bio:'US hearing experts recommend a limit: 85 dB, averaged over 8 hours a day. That is the gray bar at the top right.',honors:'Hearing experts at NIOSH set a recommended limit: 85 dBA, averaged over 8 hours a day. That is the gray bar at the top right.'},pause:true,setup:sim=>{sim.peek=false;BioLab.setValues(sim,{level:94,guess:240,comp:85});}},
  {title:'Decibels are logarithms',text:{bio:'Your earbuds play at 94 dB. That is only 9 dB more, but the purple square shows the sound energy: about 8 times the small solid 85 dB square.',honors:'Your earbuds play at 94 dBA. That is only 9 dB more, but the purple square shows the sound intensity: about 8 times the small solid 85 dBA square.'},pause:true},
  {title:'The 3 dB rule',text:'Every 3 dB about doubles the intensity. Twice the energy reaches the same daily dose in half the time. So each 3 dB step halves the safe time.',pause:true,setup:sim=>{sim.peek=true;}},
  {title:'Climb the ladder',text:{bio:'85 → 8 hours. 88 → 4 hours. 91 → 2 hours. 94 → 1 hour. Your earbuds at 94 dB use up a whole day’s limit in 60 minutes.',honors:'85 → 8 hours. 88 → 4 hours. 91 → 2 hours. 94 → 1 hour. Your earbuds at 94 dBA use up a whole day’s limit in 60 minutes.'},pause:true},
  {title:'Loud gets short fast',text:{bio:'At 100 dB, like a loud concert, the safe time is just 15 minutes. At 110 dB it is under 2 minutes.',honors:'At 100 dBA, like a loud concert, the safe time is just 15 minutes. At 110 dBA it is under 2 minutes.'},pause:true,setup:sim=>BioLab.setValues(sim,{level:100})},
  {lvl:'ap',title:'The formula',text:'T(L) = 480 ÷ 2^((L − 85)/3). To find the level for a given time, take a log: L = 85 + 3 log₂(480/T). For 15 minutes, log₂ 32 = 5, so L = 100.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does each 3 dB step change the safe time?</p><ol><li>Press <b>Skip the guess</b> if you have not locked in a guess.</li><li>Set the volume to 85, 88, 91, 94, 97 and 100 dB. Record a trial each time.</li><li>Graph <b>Trials</b> with volume on x and safe time on y.</li></ol><p>Write one sentence: what happens to the safe time every 3 dB?</p>',
  honors:'<p><b>Question:</b> Is the 3 dB rule the same as doubling the intensity?</p><ol><li>Set the volume to 88, 91 and 94 dBA and record the intensity compared with 85 dBA.</li><li>Divide each intensity by the one before.</li></ol><p>Explain why +3 dB gives about 2 times and +10 dB gives exactly 10 times.</p>',
  ap:'<p><b>Question:</b> Find the level for any safe time.</p><ol><li>Start from T = 480 ÷ 2^((L − 85)/3) and solve for L.</li><li>Find the level for 2 hours, 30 minutes and 5 minutes, then check them in the tool.</li></ol><p><b>CER:</b> Explain why the safe-time curve is exponential in decibels.</p>'},
 terms:[
  {t:'Decibel (dB)',d:'A logarithmic unit for sound level. Each 10 dB is 10 times the intensity.'},
  {t:'dBA',d:'Decibels weighted to match how human ears hear different pitches. Noise limits use dBA.',lvl:'honors'},
  {t:'Exchange rate',d:'How many dB it takes to halve the safe time. NIOSH uses 3 dB.',lvl:'honors'},
  {t:'Intensity',d:'Sound power per area, in watts per square meter. dB = 10 log₁₀(I/I₀), with I₀ = 10⁻¹² W/m², about the quietest sound a person can hear.',lvl:'honors'},
  {t:'Logarithm',d:'The inverse of an exponent: log₁₀(1000) = 3 because 10³ = 1000.',lvl:'ap'}
 ],
 about:'<p>Sound level is L = 10 log₁₀(I/I₀) with I₀ = 10⁻¹² W/m². Safe time follows the <b>NIOSH recommended exposure limit</b>: 85 dBA for 8 hours, halving for every 3 dB more, so T(L) = 480 ÷ 2^((L − 85)/3) minutes. That limit is for a whole day’s average, and it is a recommendation built to protect most people, not a guarantee for every person.</p><p>This is a simplified model for learning, not medical advice. It treats your listening as one steady level; real music rises and falls, and the level at your ears depends on your device, your earbuds and the fit. The legal US workplace limit from OSHA is different (90 dBA for 8 hours, halving every 5 dB).</p>'
};
BioLab.register(SIM);
})();
