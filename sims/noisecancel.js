(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,atLeast,fmtNum,RM}=BioLab.h;
/* Noise: N sin(2πft). Anti-noise: g sin(2πft + φ + e), where e is a timing wobble spread evenly over ±ε (ε = 360°·f·δ).
   Average leftover power: N² + g² + 2Ng cos φ · s, with s = sin ε / ε. Best: φ = 180°, g = N·s, leaving N²(1 − s²). */
const SRC={hum:{f:100,n:'Engine drone'},fan:{f:250,n:'Fan whir'},voice:{f:1000,n:'Chatter'},whine:{f:4000,n:'High whine'}};
const fq=sim=>SRC[sim.p.src].f;
const N=sim=>atLeast('honors')?sim.p.na:1;
const dl=sim=>atLeast('ap')?sim.p.jit:0.05;                    /* timing wobble, ms */
const epsR=sim=>2*Math.PI*fq(sim)*dl(sim)/1000;                 /* radians */
const sinc=x=>Math.abs(x)<1e-9?1:Math.sin(x)/x;
function power(sim,g,phDeg){const n=N(sim),s=sinc(epsR(sim));return Math.max(1e-12,n*n+g*g+2*n*g*Math.cos(phDeg*Math.PI/180)*s);}
const dB=(sim,g,ph)=>-10*Math.log10(power(sim,g,ph)/(N(sim)*N(sim)));
const cur=sim=>dB(sim,sim.p.amp,sim.p.ph);
const bestG=sim=>N(sim)*sinc(epsR(sim));
const bestDB=sim=>dB(sim,bestG(sim),180);
const scKey=sim=>[sim.p.src,N(sim),dl(sim)].join(',');
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2),f0=v=>fmtNum(v,0);
const half=sim=>500/fq(sim);
const per=sim=>1000/fq(sim);
const msTxt=v=>v>=1?f2(v)+' ms':fmtNum(v,3)+' ms';
const pw=d=>{const r=Math.pow(10,d/10);return r>=10?f0(r):f1(r);};

const SIM={
 id:'noisecancel',hash:'noisecancel',apUnit:9,order:2,tab:'Noise-canceling sound',kind:'Simulation',
 card:'Tune an anti-noise wave by eye to cancel an engine drone, then let a half-period phase shift do it, and see why headphones beat low hum but not high whine.',
 title:'How noise-canceling headphones work',
 lede:{bio:'Sound is a wave of air pressure. Noise-canceling headphones play a second wave, the anti-noise, and the two waves add together at your ear. Get the anti-noise just right and they nearly cancel.',
  honors:'Shift a sine wave by half its period (a phase shift of 180°) and it becomes the same wave flipped upside down. If the amplitudes match, the sum is zero. The leftover noise in decibels is 20 log₁₀ of the leftover amplitude over the original.',
  ap:'N sin(ωt) + g sin(ωt + φ) is one sinusoid with amplitude √(N² + g² + 2Ng cos φ). A timing wobble of ±δ is a phase wobble of ±360°·f·δ, a much bigger slice of a short, high-pitched cycle, so the best possible cut falls as the frequency rises.'},
 scale:{bio:'Pressure at your ear over two cycles of the noise. The noise swings 1 unit above and below the middle.',honors:'Pressure at your ear over two cycles of the noise. The noise’s amplitude is 1 unless you change it at Closer look.'},
 aspect:16/9,timeless:true,animated:true,trials:true,graph:false,
 controlsTitle:'Your anti-noise',
 controls:[
  {id:'src',label:'The noise',type:'seg',def:'hum',options:[{v:'hum',l:'Drone 100 Hz'},{v:'fan',l:'Fan 250 Hz'},{v:'voice',l:'Chatter 1000 Hz'},{v:'whine',l:'Whine 4000 Hz'}],help:'Hz = cycles per second. Low numbers are low pitches.'},
  {id:'na',label:'Noise amplitude',type:'range',min:0.5,max:1.5,step:0.05,def:1,lvl:'honors',noGut:true},
  {id:'ph',label:'Phase shift of your anti-noise',type:'range',min:0,max:360,step:1,def:60,unit:'°',help:'360° is one whole cycle.'},
  {id:'amp',label:'Amplitude of your anti-noise',type:'range',min:0,max:2,step:0.01,def:0.5,help:' '},
  {id:'marks',label:'Mark half a period',type:'toggle',def:false,lvl:'honors'},
  {id:'jit',label:'Timing wobble of the electronics',type:'range',min:0.01,max:0.12,step:0.01,def:0.05,unit:' ms',lvl:'ap',noGut:true,help:'The anti-noise can arrive up to this much early or late. 0.05 ms is an assumption for illustration.'}
 ],
 onLevel(sim){const b=!atLeast('honors'),W=sim.ui.ctlW||{};
  const set=(id,l,h)=>{const w=W[id];if(!w)return;const L=w.querySelector('label');if(L)L.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('ph',b?'Slide your wave sideways':'Phase shift of your anti-noise',b?'360° slides it one whole cycle, back to where it started.':'360° is one whole cycle.');
  set('amp',b?'Height of your wave':'Amplitude of your anti-noise',b?'How far it swings up and down. The noise swings 1.':' ');},
 actions:[{id:'cancel',label:'Shift half a period and match',lvl:'honors',run(sim){BioLab.setValues(sim,{ph:180,amp:+bestG(sim).toFixed(2)});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'db',label:'Noise cut by',unit:'dB',d:1,min:0,max:40,get:cur},
  {id:'left',label:'Noise amplitude left over',unit:'%',d:0,min:0,max:200,get:sim=>Math.sqrt(power(sim,sim.p.amp,sim.p.ph))/N(sim)*100},
  {id:'half',label:'Half a period of this noise',unit:'ms',d:3,lvl:'honors',min:0,max:null,get:half},
  {id:'shift',label:'Your shift in time',unit:'ms',d:3,lvl:'honors',min:0,max:null,get:sim=>sim.p.ph/360*per(sim)},
  {id:'eps',label:'Wobble as a phase angle',unit:'°',d:1,lvl:'ap',min:0,max:180,get:sim=>epsR(sim)*180/Math.PI},
  {id:'best',label:'Best possible cut',unit:'dB',d:1,lvl:'ap',min:0,max:50,get:bestDB}
 ],
 draw(sim,ctx,vdt,k,t){const p=sim.p,n=N(sim),g=p.amp,ph=p.ph*Math.PI/180,e=epsR(sim),G=sim.gutS,kk=Math.min(k,1.6);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const L=24,Wd=800-L-24,cyc=2,sc=RM?0:((t||0)*0.25%1)*2*Math.PI,S=32;
  const rows=[{y:96,lab:'The noise',col:PAL['s2']},{y:218,lab:'Your anti-noise',col:PAL['rj']},{y:350,lab:k<1.5?'What you hear: the two added together':'What you hear',col:PAL['cv-ink']}];
  const wave=(row,fn,col,w,alpha,dash)=>{ctx.save();ctx.beginPath();ctx.rect(L,row.y-56,Wd,112);ctx.clip();ctx.globalAlpha=alpha||1;ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash||[]);ctx.beginPath();
   for(let i=0;i<=360;i++){const x=i/360,th=x*cyc*2*Math.PI-sc;const y=row.y-fn(th)*S;i?ctx.lineTo(L+x*Wd,y):ctx.moveTo(L+x*Wd,y);}ctx.stroke();ctx.restore();};
  rows.forEach((r,i)=>{ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(L,r.y);ctx.lineTo(L+Wd,r.y);ctx.stroke();
   txt(ctx,r.lab,L,r.y-62+(i?0:4),{s:16*k,w:700,c:r.col});});
  /* row 1: noise; row 2: anti-noise (with the gut's anti-noise ghosted); row 3: sum, with the wobble band */
  wave(rows[0],th=>n*Math.sin(th),PAL['s2'],3);
  const gk=G&&G.g&&G.g.key===scKey(sim)&&(Math.abs(G.g.ph-p.ph)>0.5||Math.abs(G.g.g-g)>0.005);
  if(gk)wave(rows[1],th=>G.g.g*Math.sin(th+G.g.ph*Math.PI/180),PAL['s4'],2,0.9,[6,5]);
  wave(rows[1],th=>g*Math.sin(th+ph),PAL['rj'],3);
  const flip=!!(G&&G.g);if(flip)wave(rows[1],th=>-n*Math.sin(th),PAL['cv-soft'],1.5,0.5,[3,5]);
  [-e,e].forEach(ee=>wave(rows[2],th=>n*Math.sin(th)+g*Math.sin(th+ph+ee),PAL['s4'],1.5,0.7));
  wave(rows[2],th=>n*Math.sin(th)+g*Math.sin(th+ph),PAL['cv-ink'],3);
  /* ghost of the noise alone in row 3 for comparison */
  wave(rows[2],th=>n*Math.sin(th),PAL['s2'],1.5,0.3,[3,5]);
  /* readout pill */
  const d=cur(sim);pill(ctx,d>=0?'Noise cut by '+f1(d)+' dB':'Noise louder by '+f1(-d)+' dB',800-24-100*k,rows[2].y-62,d>=10?'#2f7a4b':d>=0?'#8a6a1f':'#b0453f','#fff',14*k);
  /* half-period marks */
  if(p.marks&&atLeast('honors')){const x0=L+Wd*(0.25/cyc),x1=L+Wd*(0.75/cyc),yb=rows[0].y+n*S+14;ctx.strokeStyle=PAL['s5'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,yb-6);ctx.lineTo(x0,yb);ctx.lineTo(x1,yb);ctx.lineTo(x1,yb-6);ctx.stroke();
   txt(ctx,'half a period = '+msTxt(half(sim)),(x0+x1)/2,yb+14*kk,{s:12*k,w:700,c:PAL['s5'],a:'center'});}
  /* time axis */
  txt(ctx,'0 ms',L,442,{s:13*k,c:PAL['cv-soft']});txt(ctx,msTxt(2*per(sim))+(k<1.5?' (two cycles of a '+fq(sim)+' Hz '+SRC[p.src].n.toLowerCase()+')':''),L+Wd,442,{s:13*k,c:PAL['cv-soft'],a:'right'});
  if(k<1.5&&flip)txt(ctx,'Faint dashed line: the perfect flip',L+Wd,rows[1].y-62,{s:13*k,c:PAL['cv-soft'],a:'right'});},
 narrate(sim){const p=sim.p,d=cur(sim),b=bestDB(sim),f=fq(sim),pc=dl(sim)/per(sim)*100;
  if(!(sim.gutS&&sim.gutS.g))return `Your anti-noise adds to the noise at every moment, and the bottom wave is what reaches your ear. Right now it is <b>${d>=0?f1(d)+' dB quieter':f1(-d)+' dB louder'}</b> than the noise alone. Lock in your gut to see what the math does.`;
  if(d<0)return `<b>Your anti-noise is making it louder.</b> Its highs land near the noise’s highs, so the waves add. Shift it closer to half a cycle (180°).`;
  if(b-d<0.5)return `<b>That is as good as it gets for this noise:</b> ${f1(d)} dB quieter. ${f>=1000?`The electronics’ timing wobble is ${f1(pc)}% of each ${msTxt(per(sim))} cycle, so the waves can’t stay lined up.`:`The timing wobble is only ${f1(pc)}% of each ${msTxt(per(sim))} cycle, so the anti-noise stays lined up.`}`;
  if(Math.abs(p.ph-180)>20)return `Your anti-noise is shifted ${p.ph}°. <b>To cancel, its highs must meet the noise’s lows:</b> a shift of half a cycle, 180°. Right now the noise is ${f1(d)} dB quieter.`;
  return `The timing is close. Now <b>match the amplitude</b>: a wave that is too quiet leaves noise behind, and one that is too loud adds its own. Right now the noise is ${f1(d)} dB quieter.`;},
 gut:{better:'higher',
  controls:['ph','amp'],
  ask:{bio:'The red wave is your anti-noise. Use the two sliders here: slide your wave sideways, then set its height, until the bottom wave, what you hear, is as flat as you can make it. Then lock it in.',honors:'Tune the phase shift and amplitude with the sliders here, by eye, without calculating. Then lock it in.'},
  lock(sim){return {v:cur(sim),ph:sim.p.ph,g:sim.p.amp,key:scKey(sim),f:fq(sim),dl:dl(sim),label:atLeast('honors')?`a ${sim.p.ph}° shift at amplitude ${f2(sim.p.amp)}`:`slid ${sim.p.ph}°, height ${f2(sim.p.amp)}`};},
  solve(sim){const g=bestG(sim);sim.p.ph=180;sim.p.amp=g;return {v:cur(sim),ph:180,g,key:scKey(sim),f:fq(sim),dl:dl(sim),label:atLeast('honors')?`a 180° shift (half a period, ${msTxt(half(sim))}) at amplitude ${f2(g)}`:`slid 180° (half a cycle, ${msTxt(half(sim))}), height ${f2(g)}`};},
  how:{bio:'Slide the anti-noise by half a cycle (180°), so every high of the noise meets a low of the anti-noise, and give it the same height. Then the two waves add to nearly zero.',
   ap:'Half a period is 1/(2f), a phase shift of π. With a timing wobble spread evenly over ±ε, the average leftover power is N² + g² + 2Ng cos φ · (sin ε)/ε, smallest at φ = 180° and g = N(sin ε)/ε: just under a perfect amplitude match.'},
  compare(sim,g,m){const gap=m.v-g.v,f=m.f,pc=m.dl*m.f/1000*100;
   const why=f>=1000?` Even the math only gets ${f1(m.v)} dB here: the electronics’ ${fmtNum(m.dl,2)} ms timing wobble is ${f0(pc)}% of each cycle at ${f} Hz. That is why headphones cancel a low drone far better than a high whine.`:'';
   if(gap<1)return `Your gut was right on: your anti-noise cut the noise by ${f1(g.v)} dB, within 1 dB of the best possible ${f1(m.v)} dB. You found the half-cycle flip by eye. The math says why it works: every high meets a low.${why}`;
   const gtxt=g.v<0?`made the noise <b>${f1(-g.v)} dB louder</b>`:`cut the noise by <b>${f1(g.v)} dB</b>`;
   return `Your anti-noise ${gtxt}. The math cuts it by <b>${f1(m.v)} dB</b>: ${f1(gap)} dB more, about ${pw(gap)} times less sound power. Most people hear each 10 dB drop as roughly half as loud.${why}`;},
  again(sim){const ks=Object.keys(SRC);sim.p.src=Math.random()<0.5?'hum':ks[Math.floor(Math.random()*ks.length)];if(atLeast('honors'))sim.p.na=Math.round((0.5+Math.random())*20)/20;sim.p.ph=Math.round(Math.random()*90);sim.p.amp=0.5;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'An engine drone repeats every 10 ms (100 times a second). How far should the anti-noise be shifted in time to cancel it?',choices:['10 ms, a whole cycle','5 ms, half a cycle','1 ms','Not at all'],correct:1,explain:'Half a cycle later, every high of the noise meets a low of the anti-noise. Shifting by a whole cycle (10 ms) would line the highs up with highs and make the drone louder.'},
  {lvl:'bio',instant:true,q:'You shift a copy of the noise by a whole cycle (360°) and play it at the same amplitude. What happens?',choices:['Silence','The waves line up and the noise gets louder','Nothing changes'],correct:1,explain:'A whole-cycle shift puts the copy right back in step with the noise, so the highs add to highs. The amplitude doubles, about 6 dB louder. Set the phase shift to 360° to see it.'},
  {lvl:'honors',instant:true,q:'The anti-noise is perfectly timed (180°) but has only half the noise’s amplitude. How much quieter is the noise?',choices:['About 3 dB','About 6 dB','About 50 dB','It is silent'],correct:1,explain:'Half the amplitude is left over: 20 log₁₀(0.5) ≈ −6.0 dB. Timing alone is not enough; the amplitudes must match too.'},
  {lvl:'honors',instant:true,q:'The electronics can be off by 0.05 ms either way. Which noise can headphones cancel better?',choices:['A 100 Hz drone','A 4000 Hz whine','Both the same'],correct:0,explain:'0.05 ms is 0.5% of a 100 Hz cycle (10 ms) but 20% of a 4000 Hz cycle (0.25 ms). The same timing slip throws the high wave far out of step. Here the best cut is about 34.8 dB for the drone and about 3.7 dB for the whine.'},
  {lvl:'ap',instant:true,q:'A timing slip of 0.05 ms at 1000 Hz is what phase angle?',choices:['0.05°','1.8°','18°','180°'],correct:2,explain:'One cycle at 1000 Hz lasts 1 ms = 360°. So 0.05 ms is 0.05 × 360° = 18°.'},
  {lvl:'ap',instant:true,q:'The anti-noise has exactly the noise’s amplitude but is stuck 18° away from a perfect 180° shift. How much quieter is the noise?',choices:['About 3 dB','About 10 dB','About 18 dB','About 26 dB'],correct:1,explain:'The leftover amplitude is |1 + e^(i(180° + 18°))| = 2 sin(9°) ≈ 0.313, and 20 log₁₀(0.313) ≈ −10.1 dB. A small phase error leaves a lot of noise.'}
 ],
 tour:[
  {title:'The noise',text:'The top wave is an engine drone reaching your ear: air pressure rising and falling 100 times a second. Two cycles take 20 ms.',focus:[[16,20,770,130]],pause:true,setup:sim=>BioLab.setValues(sim,{src:'hum',na:1,ph:0,amp:0,marks:false,jit:0.05})},
  {title:'Add a copy in step',text:'Play a copy of the noise in step with it (no shift). The highs add to highs, and the bottom wave, what you hear, is twice as tall: 6 dB louder.',pause:true,setup:sim=>BioLab.setValues(sim,{ph:0,amp:1})},
  {title:'Shift it half a period',text:'Now shift the copy by half a period, 5 ms, which is 180°. Every high of the noise meets a low of the anti-noise, and the sum flattens almost to nothing.',pause:true,setup:sim=>BioLab.setValues(sim,{ph:180,amp:1})},
  {title:'Match the amplitude',text:'Timing is not enough. Turn the anti-noise down to half and the sum keeps half the noise: only about 6 dB quieter. The amplitudes must match.',pause:true,setup:sim=>BioLab.setValues(sim,{ph:180,amp:0.5})},
  {lvl:'honors',title:'Half a period, in time',text:'The purple bracket marks half a period: 5 ms for a 100 Hz drone, 0.5 ms for 1000 Hz chatter, 0.125 ms for a 4000 Hz whine. The higher the pitch, the less time the electronics have to get it right.',pause:true,setup:sim=>BioLab.setValues(sim,{ph:180,amp:1,marks:true})},
  {title:'Why high sounds are hard',text:'Switch to a 4000 Hz whine. The orange lines show the anti-noise arriving 0.05 ms early or late. That slip is 20% of a whine’s cycle, so even the best anti-noise cuts only about 4 dB.',pause:true,setup:sim=>BioLab.setValues(sim,{src:'whine',ph:180,amp:0.76,marks:false})},
  {lvl:'ap',title:'The leftover in decibels',text:'The leftover amplitude ratio r gives the cut: 20 log₁₀(1/r) dB. With a wobble of ±ε, the best average leftover power is 1 − (sin ε / ε)². For the drone, ε = 1.8° and the cut is about 34.8 dB.',pause:true,setup:sim=>BioLab.setValues(sim,{src:'hum',ph:180,amp:1})},
  {title:'Your turn',text:'Close this walkthrough and try the Gut vs. math box at the top: tune the anti-noise by eye, lock it in, then let the math take a turn.',pause:true,setup:sim=>BioLab.setValues(sim,{src:'hum',ph:60,amp:0.5,marks:false})}
 ],
 lab:{bio:'<p><b>Question:</b> How does the phase shift change what you hear?</p><ol><li>Choose the 100 Hz drone and set the amplitude to 1.00.</li><li>Set the phase shift to 0°, 45°, 90°, 135°, 180°, 270° and 360°. Record a trial each time.</li></ol><p>Write one sentence: which shift cancels best, and which makes the noise loudest?</p>',
  honors:'<p><b>Question:</b> Does the best amplitude depend on the noise?</p><ol><li>Set the noise amplitude to 0.6, 1.0 and 1.4.</li><li>At a 180° shift, find the anti-noise amplitude that gives the biggest cut. Record each.</li></ol><p>Explain why the anti-noise has to match the noise.</p>',
  ap:'<p><b>Question:</b> How does the best possible cut depend on frequency?</p><ol><li>For each noise, press <b>Shift half a period and match</b> and record <b>Best possible cut</b>.</li><li>Repeat with a timing wobble of 0.02 ms and 0.10 ms.</li></ol><p><b>CER:</b> Use ε = 360°·f·δ to explain your data.</p>'},
 terms:[
  {t:'Superposition',d:'When two waves meet, their values add at every moment.'},
  {t:'Phase shift',d:'How far a wave is slid along in time. Half a period (180°) turns a sine wave upside down.'},
  {t:'Amplitude',d:'How far a wave swings above and below its middle. For sound, bigger amplitude is louder.'},
  {t:'Frequency',d:'Cycles per second, in hertz (Hz). The period is 1 ÷ frequency.',lvl:'honors'},
  {t:'Decibel (dB)',d:'A log scale for loudness. Cutting the amplitude to a fraction r lowers the level by 20 log₁₀(1/r) dB; 10 dB is a tenfold cut in sound power.',lvl:'honors'},
  {t:'Destructive interference',d:'Waves adding to something smaller than either one, because highs meet lows.',lvl:'honors'}
 ],
 about:'<p>The noise is N sin(2πft) and the anti-noise is g sin(2πft + φ). Their sum is one sine wave with amplitude √(N² + g² + 2Ng cos φ). The cut in decibels is 20 log₁₀ of the noise amplitude over the leftover amplitude.</p><p><b>Simplified:</b> real noise mixes many frequencies, and real headphones also block sound with their ear cushions. Here the noise is one pure tone. The electronics’ timing wobble (0.05 ms unless you change it at Deep dive) is an assumption for illustration, not a measured value for any product; the anti-noise is modeled as arriving at a random moment within ±δ, which is why the best amplitude is a hair below a perfect match. The trend it shows, strong cancellation at low pitches and weak cancellation at high pitches, matches how real noise-canceling headphones behave.</p>'
};
BioLab.register(SIM);
})();
