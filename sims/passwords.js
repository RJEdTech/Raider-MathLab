(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,FONT,atLeast,fmtNum,axes}=BioLab.h;
const SETS={digits:{n:10,c:'0123456789',d:'digits only'},lower:{n:26,c:'abcdefghijklmnopqrstuvwxyz',d:'lowercase only'},
 mixed:{n:52,c:'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',d:'upper + lowercase'},
 alnum:{n:62,c:'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',d:'letters + digits'},
 all:{n:94,c:Array.from({length:94},(_,i)=>String.fromCharCode(33+i)).join(''),d:'all 94 keyboard symbols'}};
const bits=(L,set)=>L*Math.log2(SETS[set].n);
const rate=sim=>Math.pow(10,atLeast('ap')?sim.p.rate:10);
const secs=(b,r)=>Math.pow(2,b)/r;
const YR=365.25*86400;
const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const sci=v=>{const e=Math.floor(Math.log10(v)+1e-9),m=v/Math.pow(10,e);return fmtNum(m,1)+' × 10'+String(e).split('').map(c=>SUP[c]).join('');};
const big=n=>n<1e6?Math.round(n).toLocaleString('en-US'):sci(n);
function when(s){if(s<1)return 'under a second';if(s<120)return Math.round(s)+' seconds';if(s<7200)return Math.round(s/60)+' minutes';if(s<172800)return Math.round(s/3600)+' hours';
 const y=s/YR;if(y<1)return Math.round(s/86400)+' days';if(y<1e6){if(y<10)return fmtNum(y,1)+' years';const p=Math.pow(10,Math.floor(Math.log10(y))-2);return (Math.round(y/p)*p).toLocaleString('en-US')+' years';}if(y<1e9)return fmtNum(y/1e6,y<1e7?1:0)+' million years';if(y<1e12)return fmtNum(y/1e9,y<1e10?1:0)+' billion years';return sci(y)+' years';}
/* Example strings: a seeded generator, so the cards stay put between redraws. */
function rnd(seed){let s=seed>>>0;return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
const make=(L,set,seed)=>{const r=rnd(seed),c=SETS[set].c;let o='';for(let i=0;i<L;i++)o+=c[Math.floor(r()*c.length)];return o;};
const DEF=[{L:8,set:'all',s:'k7#Tq!2w'},{L:16,set:'lower',s:'mabtorqelfiswunp'},{L:12,set:'alnum',s:'r4Vn8Kq2Zt7e'},{L:10,set:'mixed',s:'pRxuQmEbtK'}];
const cands=sim=>sim.cands||(sim.cands=DEF.map(c=>Object.assign({},c)));
const RK=['rA','rB','rC','rD'],LET=['A','B','C','D'];
const pickI=sim=>LET.indexOf(sim.p.pick);
const bestI=sim=>{const C=cands(sim);let m=0;C.forEach((c,i)=>{if(bits(c.L,c.set)>bits(C[m].L,C[m].set))m=i;});return m;};
const preG=sim=>sim.mode==='guided'&&!(sim.gutS&&sim.gutS.g);
const trueRanks=sim=>{const C=cands(sim),o=C.map((c,i)=>i).sort((a,b)=>bits(C[a].L,C[a].set)-bits(C[b].L,C[b].set)),r=[];o.forEach((i,k)=>r[i]=k+1);return r;};
function wrongPairs(sim,ranks){const C=cands(sim);let w=0;for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const db=bits(C[i].L,C[i].set)-bits(C[j].L,C[j].set),dr=ranks[i]-ranks[j];if(!(dr*db>0))w++;}return w;}
const HUMAN={s:'Sunflower2024!',L:14,pat:Math.log2(1e5)+1+Math.log2(100)+Math.log2(10)};
const LX0=60,LX1=770,LMIN=-6,LMAX=30;
const LXs=s=>LX0+(clamp(Math.log10(Math.max(s,1e-9)),LMIN,LMAX)-LMIN)/(LMAX-LMIN)*(LX1-LX0);
function htxt(ctx,s,x,y,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const w=ctx.measureText(s).width,a=o.a||'left',x0=a==='right'?x-w:a==='center'?x-w/2:x;ctx.fillStyle=PAL['cv-bg'];ctx.globalAlpha=.85;ctx.fillRect(x0-3,y-o.s*0.85,w+6,o.s*1.1);ctx.globalAlpha=1;txt(ctx,s,x,y,o);}

const SIM={
 id:'passwords',hash:'passwords',apUnit:4,order:6,tab:'Password strength',kind:'Simulation',
 card:'Rank four passwords from weakest to strongest by feel, then let logarithms count the guesses each one would take.',
 title:'Which password is actually strong?',
 lede:{bio:'A password is strong when there are so many possibilities that guessing them all would take forever. Each extra character multiplies the possibilities, so length matters more than you might think.',
  honors:'A random password of L characters from a set of N symbols has N^L possibilities. Its strength in bits is log₂(N^L) = L · log₂ N. Every extra bit doubles the guesses.',
  ap:'Time to try every possibility is 2^bits ÷ (guess rate). Solving for length is a logarithm problem: L = bits ÷ log₂ N.'},
 scale:{bio:'Times assume an attacker who can test 10 billion guesses a second against a stolen copy of the password data: a worst case defenders plan for.',honors:'Strength in bits. Times assume an attacker who can test 10 billion guesses a second against a stolen copy of the password data: a worst case defenders plan for.'},
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Pick, then explore',
 controls:[
  {id:'pick',label:'Your pick: the password that holds out longest',type:'seg',def:'',options:[{v:'A',l:'A'},{v:'B',l:'B'},{v:'C',l:'C'},{v:'D',l:'D'}],help:'Read the four cards, then pick one.'},
  {id:'len',label:'Build your own: length',type:'range',min:4,max:24,step:1,def:12,unit:' characters',noGut:true},
  {id:'set',label:'Build your own: characters allowed',type:'select',def:'lower',noGut:true,options:[{v:'digits',l:'Digits only (10)'},{v:'lower',l:'Lowercase (26)'},{v:'mixed',l:'Upper + lower (52)'},{v:'alnum',l:'Letters + digits (62)'},{v:'all',l:'Any keyboard symbol (94)'}]},
  {id:'human',label:'Show a password a person made up',type:'toggle',def:false,lvl:'honors',noGut:true},
  {id:'rate',label:'Guess rate: 10 to this power per second',type:'range',min:3,max:12,step:1,def:10,unit:'',lvl:'ap',noGut:true,help:'10 means 10¹⁰, or 10 billion a second. A login page that locks after a few wrong tries cuts this to almost nothing.'}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'bits',label:'Your password’s strength',unit:'bits',d:1,min:0,max:160,get:sim=>bits(sim.p.len,sim.p.set)},
  {id:'guess',label:'Possible passwords',text:true,noTrial:true,get:sim=>big(Math.pow(SETS[sim.p.set].n,sim.p.len))},
  {id:'time',label:'Time to try every one',text:true,noTrial:true,get:sim=>when(secs(bits(sim.p.len,sim.p.set),rate(sim)))},
  {id:'logyr',label:'Time to try every one, log₁₀ of years',unit:'',d:2,lvl:'ap',min:-20,max:null,get:sim=>Math.log10(secs(bits(sim.p.len,sim.p.set),rate(sim))/YR)}
 ],
 graphs:[{id:'len',label:'Bits vs. length for each character set',custom:true}],defaultGraph:'len',
 plot(sim,ctx,box){const ax=axes(ctx,box,{xmin:4,xmax:24,ymin:0,ymax:160,xl:'Length (characters)',yl:'Strength (bits)'});
  ['digits','lower','mixed','all'].forEach((s,i)=>{const col=[PAL['s6'],PAL['s3'],PAL['s2'],PAL['s5']][i];ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(ax.X(4),ax.Y(bits(4,s)));ctx.lineTo(ax.X(24),ax.Y(bits(24,s)));ctx.stroke();
   txt(ctx,SETS[s].d,ax.X(24)-4,ax.Y(bits(24,s))+(s==='mixed'?16:-6),{s:12,c:col,a:'right',w:700});});
  ctx.strokeStyle=PAL['muted'];ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(ax.X(4),ax.Y(128));ctx.lineTo(ax.X(24),ax.Y(128));ctx.stroke();ctx.setLineDash([]);txt(ctx,'128-bit encryption key',ax.X(4)+6,ax.Y(128)-6,{s:12,c:PAL['muted']});
  const b=bits(sim.p.len,sim.p.set);ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(ax.X(sim.p.len),ax.Y(b),6,0,7);ctx.fill();txt(ctx,'Yours: '+fmtNum(b,1)+' bits',ax.X(sim.p.len)+(sim.p.len>17?-10:10),ax.Y(b)-10,{s:12,w:700,c:PAL['rj'],a:sim.p.len>17?'right':'left'});},
 draw(sim,ctx,vdt,k){if(preG(sim)&&sim.cands&&sim.cands._rand)sim.cands=null;/* Guided always opens on the four cards the question describes */
  const C=cands(sim),G=sim.gutS,solved=!!(G&&G.m),tr=trueRanks(sim),r=rate(sim),ph=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const cw=380,gx=12,mx=14,ct=8,ch=ph?Math.min(205,12+80*k):96,gy=ph?12:8;
  C.forEach((c,i)=>{const x=mx+(i%2)*(cw+gx),top=ct+Math.floor(i/2)*(ch+gy),b=bits(c.L,c.set);
   rr(ctx,x,top,cw,ch,10);ctx.fillStyle=PAL['card'];ctx.fill();ctx.strokeStyle=solved&&tr[i]===4?PAL['s3']:PAL['line'];ctx.lineWidth=solved&&tr[i]===4?3:1.5;ctx.stroke();
   const y1=top+30*k;txt(ctx,LET[i],x+14,y1,{s:22*k,w:800});
   const gp=G&&G.g?G.g.pick:sim.p.pick,by=top+20*k,mine=gp===LET[i],best=solved&&tr[i]===4;let bx=x+cw-10;
   if(mine){ctx.font='800 '+(12*k)+'px '+FONT;const w=ctx.measureText(G&&G.g?'Your gut':'Your pick').width+14*k;bx-=w/2;pill(ctx,G&&G.g?'Your gut':'Your pick',bx,by,PAL['s4'],'#fff',12*k);bx-=w/2+6;}
   if(best){ctx.font='800 '+(12*k)+'px '+FONT;const w=ctx.measureText('Strongest').width+14*k;pill(ctx,'Strongest',bx-w/2,by,PAL['s3'],'#fff',12*k);}
   const sx=x+14+28*k,avail=cw-(sx-x)-(mine?(best?160:80):best?80:0)*k-8,ms=Math.min(16*k,avail/(c.L*0.62));ctx.font='600 '+ms+'px ui-monospace,Menlo,Consolas,monospace';ctx.fillStyle=PAL['cv-ink'];ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillText(c.s,sx,y1-2);
   txt(ctx,c.L+' chars · '+SETS[c.set].d,x+14,top+54*k,{s:12*k,c:PAL['cv-soft']});
   if(solved)txt(ctx,(atLeast('honors')?fmtNum(b,1)+' bits · ':'')+when(secs(b,r))+(atLeast('honors')?'':' to try them all'),x+14,top+76*k,{s:13*k,w:700,c:PAL['s3']});});
  const bot=ct+2*ch+gy;
  txt(ctx,solved?'Orange: your gut. Green: the strongest, by the math.':G&&G.g?'Locked in. Now let the math compare them.':'Which one holds out longest? Pick A, B, C or D.',400,bot+(ph?40:22),{s:(ph?11:12)*k,c:solved?PAL['cv-soft']:PAL['s4'],a:'center',w:700});
  if(ph)return;
  /* time scale */
  const ly=bot+92;
  txt(ctx,'Time to try every possibility (each tick is 10× the last)',LX0,ly-30,{s:13*k,w:700});
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(LX0,ly);ctx.lineTo(LX1,ly);ctx.stroke();
  [[1,'1 second'],[YR,'1 year'],[1e6*YR,'1 million years'],[13.8e9*YR,'age of the universe']].forEach(([s,l],i)=>{const x=LXs(s);ctx.strokeStyle=PAL['cv-ink'];ctx.beginPath();ctx.moveTo(x,ly-6);ctx.lineTo(x,ly+6);ctx.stroke();txt(ctx,l,x,ly+(i%2?36:20),{s:12*k,c:PAL['cv-soft'],a:'center'});});
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let e=LMIN;e<=LMAX;e+=1){const x=LXs(Math.pow(10,e));ctx.beginPath();ctx.moveTo(x,ly-3);ctx.lineTo(x,ly+3);ctx.stroke();}
  if(solved)C.forEach((c,i)=>{const x=LXs(secs(bits(c.L,c.set),r));ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(x,ly,5,0,7);ctx.fill();txt(ctx,LET[i],x,ly-10,{s:12*k,w:800,c:PAL['s3'],a:'center'});});
  if(sim.mode==='guided')return;
  const yx=LXs(secs(bits(sim.p.len,sim.p.set),r));ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.moveTo(yx,ly-3);ctx.lineTo(yx-7,ly-15);ctx.lineTo(yx+7,ly-15);ctx.closePath();ctx.fill();
  if(sim.p.human&&atLeast('honors')){const xf=LXs(secs(HUMAN.L*Math.log2(94),r)),xp=LXs(secs(HUMAN.pat,r));ctx.strokeStyle=PAL['s1'];ctx.setLineDash([4,4]);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(xp,ly+9);ctx.lineTo(xf,ly+9);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=PAL['s1'];[xf,xp].forEach(x=>{ctx.beginPath();ctx.arc(x,ly+9,5,0,7);ctx.fill();});
   htxt(ctx,'“'+HUMAN.s+'” by the formula',Math.min(xf,LX1-100),ly+56,{s:12*k,w:700,c:PAL['s1'],a:'center'});htxt(ctx,'its real pattern',xp,ly+56,{s:12*k,w:700,c:PAL['s1'],a:'center'});}
  else txt(ctx,'Red marker: the password you build with the sliders',LX0,ly+60,{s:12*k,c:PAL['rj']});},
 narrate(sim){const b=bits(sim.p.len,sim.p.set),N=SETS[sim.p.set].n;
  let s=`Your own password: ${sim.p.len} characters with ${N} choices each is ${N}^${sim.p.len} possibilities, or <b>${fmtNum(b,1)} bits</b>. Trying them all takes <b>${when(secs(b,rate(sim)))}</b>.`;
  if(sim.p.human&&atLeast('honors'))s+=` “${HUMAN.s}” scores ${fmtNum(HUMAN.L*Math.log2(94),1)} bits by the formula, but as a common word, a year and a symbol it is only about ${Math.round(HUMAN.pat)} bits.`;
  return s;},
 gut:{better:'higher',lockLabel:'Lock in my pick',
  controls:['pick'],
  ask:{bio:'Each card is a password a computer made at random. Read the cards, then pick the one you think holds out longest against a guessing computer. Go with your gut, then lock it in.',honors:'Before you work out any bits: which of A to D holds out longest? Pick it here, then lock it in.'},
  lock(sim){const C=cands(sim),i=pickI(sim);if(i<0){let w=0;C.forEach((c,j)=>{if(bits(c.L,c.set)<bits(C[w].L,C[w].set))w=j;});return {v:bits(C[w].L,C[w].set),pick:'',i:w,label:'no pick yet'};}
   return {v:bits(C[i].L,C[i].set),pick:LET[i],i,label:`${LET[i]}: ${C[i].L} characters, ${SETS[C[i].set].d}`};},
  solve(sim){const C=cands(sim),i=bestI(sim);sim.p.pick=LET[i];return {v:bits(C[i].L,C[i].set),pick:LET[i],i,label:`${LET[i]}: ${C[i].L} characters, ${SETS[C[i].set].d}`};},
  how:{bio:'The math counts possibilities. Every character multiplies them by the number of symbols allowed, so a longer password with simpler characters can beat a short one with every symbol.',
   honors:'Strength in bits is L · log₂ N. A lowercase letter adds log₂ 26 ≈ 4.70 bits; a keyboard symbol adds log₂ 94 ≈ 6.55. Twice the length doubles the bits; a fancier set only nudges them.',
   ap:'Compare L · log₂ N for each password. Time to try them all is 2^bits ÷ rate, so each extra bit doubles the time.'},
  compare(sim,g,m){const C=cands(sim),r=rate(sim),T=i=>secs(bits(C[i].L,C[i].set),r);const gi=g.i,mi=m.i,tr=trueRanks(sim);
   if(gi===mi)return `Your gut was right on: ${LET[mi]} is the strongest. Trying every possibility takes <b>${when(T(mi))}</b>, while the weakest falls in ${when(T(tr.indexOf(1)))}. You already sense that length counts; the bits show exactly how much.`;
   if(!g.pick)return `You did not pick one. The weakest, <b>${LET[gi]}</b>, could be cracked in <b>${when(T(gi))}</b>. The math’s pick, <b>${LET[mi]}</b>, holds out for <b>${when(T(mi))}</b>.`;
   return `You trusted <b>${LET[gi]}</b> most: it could be cracked in <b>${when(T(gi))}</b>. The math’s pick, <b>${LET[mi]}</b>, holds out for <b>${when(T(mi))}</b>, about ${big(T(mi)/T(gi))} times as long. ${C[mi].L>C[gi].L?'Length beat fancy symbols.':''}`;},
  again(sim){const S=['digits','lower','mixed','alnum','all'];let C;
   for(let tries=0;tries<200;tries++){C=[{L:14+Math.floor(Math.random()*5),set:'lower'},{L:7+Math.floor(Math.random()*3),set:'all'}];
    while(C.length<4){C.push({L:8+Math.floor(Math.random()*9),set:S[1+Math.floor(Math.random()*4)]});}
    const b=C.map(c=>bits(c.L,c.set)).sort((a,b)=>a-b);if(b[1]-b[0]>1&&b[2]-b[1]>1&&b[3]-b[2]>1)break;}
   C.sort(()=>Math.random()-0.5);C.forEach(c=>c.s=make(c.L,c.set,Math.floor(Math.random()*1e9)));C._rand=true;sim.cands=C;sim.p.pick='';}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Which is stronger against guessing: 8 random characters using every keyboard symbol, or 16 random lowercase letters?',choices:['8 characters with every symbol','16 lowercase letters','They are about the same'],correct:1,explain:'8 × log₂ 94 ≈ 52 bits, which falls in about a week at 10 billion guesses a second. 16 × log₂ 26 ≈ 75 bits takes about 138,000 years. Length wins.'},
  {lvl:'bio',instant:true,q:'You add one more random lowercase letter to a password. What happens to the number of possible passwords?',choices:['It goes up by 1','It goes up by 26','It is multiplied by 26'],correct:2,explain:'Each position can be any of 26 letters, so every extra letter multiplies the possibilities by 26. That multiplying is what makes length so powerful.'},
  {lvl:'honors',instant:true,q:'How many bits is a random 12-letter lowercase password? (log₂ 26 ≈ 4.70)',choices:['About 26 bits','About 56 bits','About 312 bits','About 4,700 bits'],correct:1,explain:'Bits = L · log₂ N = 12 × 4.70 ≈ 56.4 bits. That is 26¹² ≈ 9.5 × 10¹⁶ possibilities.'},
  {lvl:'honors',instant:true,q:'“Password1!” has 10 characters from a 94-symbol set, so the formula says about 66 bits. Why is it far weaker than that in real life?',choices:['The formula has an error','People pick predictable patterns, and attackers try common words and patterns first','Symbols do not count'],correct:1,explain:'The formula assumes every character is random. A common word with a capital first letter, a digit and a ! at the end is one of the first patterns tried, so it falls almost at once. The formula is an upper limit for human-made passwords.'},
  {lvl:'ap',instant:true,q:'How many random lowercase letters do you need to beat 8 random characters from all 94 symbols? Use L · 4.70 > 8 × 6.555.',choices:['9','10','12','16'],correct:2,explain:'8 × 6.555 ≈ 52.4 bits. L > 52.4 ÷ 4.70 ≈ 11.2, so 12 lowercase letters.'},
  {lvl:'ap',instant:true,q:'A 128-bit encryption key at 10 billion guesses a second: about how long to try every key?',choices:['About 10⁹ years','About 10¹⁵ years','About 10²¹ years','About 10³⁸ years'],correct:2,explain:'2¹²⁸ ≈ 3.4 × 10³⁸ keys ÷ 10¹⁰ per second ≈ 3.4 × 10²⁸ seconds ≈ 1.1 × 10²¹ years, about 80 billion times the age of the universe.'}
 ],
 tour:[
  {title:'Four passwords',text:'These four were made by a computer picking characters at random. A uses every keyboard symbol but is short. B is long but only lowercase. Which is strongest?',pause:true,setup:sim=>{sim.cands=null;BioLab.setValues(sim,{len:12,set:'lower',human:false});}},
  {title:'Count the possibilities',text:'For each position, count the choices. B has 26 choices in each of 16 spots: 26¹⁶ ≈ 4.4 × 10²² possible passwords. A has 94⁸ ≈ 6.1 × 10¹⁵.',pause:true},
  {title:'Bits: a log of the count',text:'Bits = log₂ of the count = length × log₂(choices). A: 8 × 6.55 ≈ 52 bits. B: 16 × 4.70 ≈ 75 bits. Each bit doubles the guesses.',pause:true},
  {title:'Length beats complexity',text:'Adding a character multiplies the count by the whole set size. Switching to a bigger set only raises log₂ N a little. That is why B beats A.',pause:true,setup:sim=>BioLab.setValues(sim,{len:16,set:'lower'})},
  {title:'Time to try them all',text:'Assume a stolen password file and 10 billion guesses a second. A: about 7 days. B: about 138,000 years. The red marker on the scale is your own build.',pause:true},
  {lvl:'honors',title:'People are predictable',text:'“Sunflower2024!” is 14 characters, so the formula says 92 bits. But it is a common word, a year and a symbol. Attackers try those patterns first, so it is really closer to 28 bits: a fraction of a second.',pause:true,setup:sim=>BioLab.setValues(sim,{human:true})},
  {lvl:'ap',title:'Solve for length',text:'How long must a lowercase password be to reach 80 bits? L = 80 ÷ log₂ 26 ≈ 17.0, so 18 letters to be safely past it.',pause:true,setup:sim=>BioLab.setValues(sim,{human:false,len:18})}
 ],
 lab:{bio:'<p><b>Question:</b> What helps more, a longer password or more kinds of characters?</p><ol><li>Set <b>characters allowed</b> to lowercase. Try lengths 8, 12, 16 and 20 and record each.</li><li>Set the length to 8. Try each character set and record each.</li><li>Graph <b>Trials</b> with length on x and bits on y.</li></ol><p>Write one sentence: which change added more bits?</p>',
  honors:'<p><b>Question:</b> How many bits does one more character add?</p><ol><li>For each character set, record the bits at 10 and 11 characters.</li><li>Subtract. Compare the difference with log₂ N.</li></ol><p>Explain why a person’s password can score high by the formula and still be weak.</p>',
  ap:'<p><b>Question:</b> How long must a password be?</p><ol><li>Pick a goal: 1 million years at 10¹⁰ guesses a second. Find the bits needed with logarithms.</li><li>Find the shortest length for each character set and check it in the tool.</li><li>Change the guess rate to 10³ (a login page that slows guessing) and repeat.</li></ol><p><b>CER:</b> Which defense helps more: a longer password, or slowing the guess rate?</p>'},
 terms:[
  {t:'Bits of entropy',d:'A measure of unpredictability: log₂ of the number of equally likely possibilities. Each extra bit doubles the guesses needed.'},
  {t:'Character set',d:'The symbols a password may use: 10 digits, 26 lowercase letters, 94 keyboard symbols, and so on.'},
  {t:'Logarithm base 2',d:'log₂ x is the power you raise 2 to in order to get x: log₂ 1024 = 10.',lvl:'honors'},
  {t:'Offline attack',d:'Guessing against a stolen copy of password data, where no login page can slow you down. Defenders plan for this worst case.',lvl:'honors'},
  {t:'Rate limiting',d:'Slowing or locking an account after wrong tries. It shrinks the guess rate, the bottom of the time formula.',lvl:'ap'}
 ],
 about:'<p>For a password whose characters are chosen <b>at random</b>, strength is L · log₂ N bits and there are 2^bits possibilities. The time shown is the time to try <b>every</b> possibility; on average a guesser finds it in about half that time. The rate of <b>10 billion guesses a second is an assumption</b> for a stolen copy of password data on fast hardware. Real rates vary enormously with how a site stores passwords, and a login page that limits tries is far slower.</p><p>The formula is an upper limit for passwords people make up, because people choose predictable words and patterns. The “Sunflower2024!” estimate is an illustration with stated assumptions: one of about 100,000 common words (17 bits), a capital first letter (1 bit), a year from the last 100 (7 bits) and one of 10 common symbols (3 bits), about 28 bits in all.</p><p>This tool is about protecting yourself: use long, random passwords or passphrases from a password manager, a different one for every site, and turn on two-step sign-in where you can.</p>'
};
BioLab.register(SIM);
})();
