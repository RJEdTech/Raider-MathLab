(function(){
'use strict';
const {clamp,txt,rr,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* Affine cipher on letters A=0 ... Z=25: E(x) = (a·x + b) mod 26. The decoder is D(y) = m·(y − s) mod 26.
   D undoes E for every letter exactly when s = b and a·m ≡ 1 (mod 26). */
const MSG=['RUN THE SECOND PLAY','MEET AT THE NORTH GATE','BRING YOUR CALCULATOR','THE BUS LEAVES AT NOON','PRACTICE MOVED TO GYM'];
const AOK=[1,3,5,7,9,11,15,17,19,21,23,25];
const md=x=>((x%26)+26)%26;
const L=x=>x===null?'?':String.fromCharCode(65+x);
const N=s=>s.charCodeAt(0)-65;
function inv(a){a=md(a);for(let m=1;m<26;m++)if((a*m)%26===1)return m;return null;}
/* the code actually applied (once or twice) as one affine map: y = A·x + B */
function codeMap(sim){const a=sim.p.a,b=sim.p.b;return sim.p.twice&&atLeast('honors')?{A:md(a*a),B:md((a+1)*b)}:{A:md(a),B:md(b)};}
const enc=(sim,x)=>{const c=codeMap(sim);return md(c.A*x+c.B);};
/* Big picture: the student picks one of four decoders written in plain words. Subtracting wraps (A − 1 is Z).
   Dividing by a gives a letter only when the number is a multiple of a; otherwise it is a fraction, not a letter, shown as ?.
   Closer look and Deep dive use the slider decoder: subtract s, then multiply by m, mod 26. */
const big=()=>!atLeast('honors');
const PICK={
 div:{f:(y,a,b)=>{const t=md(y-b);return t%a===0?t/a:null;},l:(a,b)=>`Subtract ${b}, then divide by ${a}`,ch:(a,b)=>['−'+b,'wrap','÷'+a]},
 rev:{f:(y,a,b)=>y%a===0?md(y/a-b):null,l:(a,b)=>`Divide by ${a}, then subtract ${b}`,ch:(a,b)=>['÷'+a,'−'+b,'wrap']},
 inv:{f:(y,a,b,ai)=>md(ai*(y-b)),l:(a,b,ai)=>ai===null?`Subtract ${b}, then multiply (no whole number works)`:`Subtract ${b}, then multiply by ${ai} (and wrap)`,ch:(a,b,ai)=>['−'+b,'×'+ai,'wrap']},
 sub:{f:(y,a,b)=>md(y-b),l:(a,b)=>`Only subtract ${b}`,ch:(a,b)=>['−'+b,'wrap']}};
const PORD=['div','rev','inv','sub'];
const pickLabel=(sim,k)=>{const c=codeMap(sim);return PICK[k].l(c.A,c.B,inv(c.A));};
const lc=s=>s.charAt(0).toLowerCase()+s.slice(1);
const sm=(s,m)=>y=>md(m*(y-s));
function decFn(sim){if(!big())return sm(sim.p.us,sim.p.um);const P=PICK[sim.p.pick],c=codeMap(sim),ai=inv(c.A);if(!P||(sim.p.pick==='inv'&&ai===null))return ()=>null;return y=>P.f(y,c.A,c.B,ai);}
/* keep the four decoder buttons in step with the current code */
function relabel(sim){const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW.pick;if(!w)return;const key=scKeyCode(sim);if(w._key===key)return;w._key=key;
  w.querySelectorAll('.seg button').forEach(b=>{if(PICK[b.dataset.v])b.textContent=pickLabel(sim,b.dataset.v);});}
const scKeyCode=sim=>[sim.p.a,sim.p.b].join(',');
const plain=sim=>MSG[sim.p.msg]||MSG[0];
const coded=sim=>plain(sim).split('').map(ch=>ch===' '?' ':L(enc(sim,N(ch)))).join('');
function decodedF(sim,f){return coded(sim).split('').map(ch=>ch===' '?' ':L(f(N(ch)))).join('');}
const nLetters=sim=>plain(sim).replace(/ /g,'').length;
function rightF(sim,f){const p=plain(sim),d=decodedF(sim,f);let n=0;for(let i=0;i<p.length;i++)if(p[i]!==' '&&p[i]===d[i])n++;return n;}
const rightCount=(sim,s,m)=>rightF(sim,sm(s,m));
function best(sim){const c=codeMap(sim),ai=inv(c.A);if(ai!==null)return {s:c.B,m:ai};
  let bs=0,bm=1,bn=-1;for(let m=1;m<26;m++)for(let s=0;s<26;s++){const n=rightCount(sim,s,m);if(n>bn){bn=n;bs=s;bm=m;}}return {s:bs,m:bm};}
const distinct=sim=>{const S=new Set();for(let x=0;x<26;x++)S.add(enc(sim,x));return S.size;};
const scKey=sim=>[sim.p.msg,sim.p.a,sim.p.b,sim.p.twice&&atLeast('honors')?1:0].join(',');
const revealed=sim=>sim.p.peek||(sim.gutS&&sim.gutS.g&&sim.gutS.g.key===scKey(sim));
const twiceOn=sim=>sim.p.twice&&atLeast('honors');

const SIM={
 id:'cipher',hash:'cipher',apUnit:6,order:2,tab:'Codes and inverse functions',kind:'Simulation',
 card:'Read a coded play call by guessing how to undo the code, then build the inverse function and read it in one step.',
 title:'Cracking your own team’s code',
 lede:{bio:'A code is a function: it turns each letter into a coded letter. To read the message you need the function that undoes it, its inverse. Undo the steps in reverse order: take away what was added, then undo the multiplying.',
  honors:'The code E(x) = (a·x + b) mod 26 has an inverse only if no two letters land on the same code letter (it must be one-to-one). That happens exactly when a shares no factor with 26. Coding twice is a composition, E(E(x)), and it needs its own inverse.',
  ap:'The inverse is D(y) = a⁻¹(y − b) mod 26, where a⁻¹ is the number with a·a⁻¹ ≡ 1 (mod 26). For a composition, (E∘E)⁻¹ = E⁻¹∘E⁻¹: undo the last step first.'},
 scale:{bio:'Letters are numbers: A = 0, B = 1, … Z = 25. Past 25 the numbers wrap around: 26 is A again, 27 is B.',honors:'Letters are numbers: A = 0, B = 1, … Z = 25. “mod 26” means wrap around: 26 is A again, 27 is B.'},
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The code and your decoder',
 controls:[
  {id:'msg',label:'Coded call',type:'select',def:0,options:MSG.map((m,i)=>({v:i,l:'Call '+(i+1)}))},
  {id:'a',label:'Code rule: multiply by a',type:'select',def:3,options:[...AOK.map(v=>({v,l:String(v)})),{v:2,l:'2 (try it)',lvl:'honors'},{v:13,l:'13 (try it)',lvl:'honors'}]},
  {id:'b',label:'Code rule: then add b',type:'range',min:0,max:25,step:1,def:5,noGut:true},
  {id:'twice',label:'The call was coded twice',type:'toggle',def:false,lvl:'honors',help:'The sender ran the code on the coded call again: E(E(x)).'},
  {id:'pick',label:'Your pick: the decoder that reads the call',type:'seg',def:'',options:PORD.map(k=>({v:k,l:PICK[k].l(3,5,9)})),help:'Subtracting past A wraps around to Z. If dividing gives a fraction, that is not a letter, so it shows as ?.'},
  {id:'us',label:'Your decoder: first subtract',type:'range',min:0,max:25,step:1,def:0,lvl:'honors'},
  {id:'um',label:'Your decoder: then multiply by',type:'range',min:1,max:25,step:1,def:1,lvl:'honors'},
  {id:'peek',label:'Show what my decoder reads',type:'toggle',def:false,help:'Leave this off until you lock in your gut.'},
  {id:'table',label:'Show the code table',type:'toggle',def:false,lvl:'honors',help:'Every letter and its code letter.'}
 ],
 actions:[{id:'inverse',label:'Build the inverse',lvl:'honors',run(sim){const b=best(sim);BioLab.setValues(sim,{us:b.s,um:b.m,peek:true});}}],
 onLevel(sim){const w=sim.ui&&sim.ui.ctlW&&sim.ui.ctlW.pick;if(w)w.hidden=!big();relabel(sim);},
 init(){return {};},step(){},
 metrics:[
  {id:'right',label:'Letters your decoder gets right',unit:'',d:0,min:0,max:null,get:sim=>revealed(sim)?rightF(sim,decFn(sim)):null},
  {id:'pct',label:'Share of the call you can read',unit:'%',d:0,min:0,max:100,get:sim=>revealed(sim)?rightF(sim,decFn(sim))/nLetters(sim)*100:null},
  {id:'check',label:'Code multiplier × yours, mod 26',unit:'',d:0,lvl:'honors',min:0,max:25,get:sim=>md(codeMap(sim).A*sim.p.um)},
  {id:'distinct',label:'Different code letters used',unit:'of 26',d:0,lvl:'honors',min:0,max:26,get:distinct},
  {id:'inv',label:'Inverse of the code multiplier, mod 26',unit:'',d:0,lvl:'ap',min:0,max:25,get:sim=>inv(codeMap(sim).A)}
 ],
 draw(sim,ctx,vdt,k){relabel(sim);const p=sim.p,pl=plain(sim),cd=coded(sim),show=revealed(sim),fn=decFn(sim),dd=decodedF(sim,fn),kk=Math.min(k,1.6);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const n=pl.length,bw=Math.min(36,760/n),x0=400-n*bw/2,fs=Math.min(19*k,bw*0.8);
  const row=(label,str,y,col,good)=>{txt(ctx,label,x0,y-8,{s:13*kk,w:700,c:PAL['cv-soft']});
   for(let i=0;i<n;i++){if(str[i]===' ')continue;const x=x0+i*bw;rr(ctx,x+2,y,bw-4,40,6);
    ctx.fillStyle=good?(good[i]===true?PAL['s3']:good[i]===false?PAL['s1']:PAL['card']):PAL['card'];ctx.globalAlpha=good&&good[i]!==null?.22:1;ctx.fill();ctx.globalAlpha=1;
    ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.stroke();txt(ctx,str[i],x+bw/2,y+21,{s:fs,w:700,c:col,a:'center',b:'middle'});}};
  row('Coded call',cd,44,PAL['cv-ink']);
  const good=show?pl.split('').map((ch,i)=>ch===' '?null:ch===dd[i]):null;
  if(show)row('Your decoder reads',dd,126,PAL['cv-ink'],good);
  else{row('Your decoder reads',pl.replace(/[A-Z]/g,'?'),126,PAL['cv-soft']);}
  /* function machines */
  const c=codeMap(sim),tw=twiceOn(sim);
  const chain=(y,label,parts,col)=>{txt(ctx,label,24,y+5,{s:14*kk,w:700,c:col,b:'middle'});ctx.font='700 '+(14*kk)+'px '+FONT;let x=24+ctx.measureText(label).width+14;
   parts.forEach((t,i)=>{ctx.font='700 '+(14*kk)+'px '+FONT;const w=ctx.measureText(t).width+18;if(i){txt(ctx,'→',x+2,y+5,{s:15*kk,c:PAL['cv-soft'],b:'middle'});x+=22*kk;}
    rr(ctx,x,y-12*kk,w,24*kk,12*kk);ctx.fillStyle=i===0||i===parts.length-1?PAL['card2']:col;ctx.fill();txt(ctx,t,x+w/2,y+1,{s:14*kk,w:700,c:i===0||i===parts.length-1?PAL['cv-ink']:'#fff',a:'center',b:'middle'});x+=w+4;});};
  const hb=atLeast('honors'),wr=hb?'mod 26':'wrap',xi=hb?'x':'letter',yo=hb?'y':'code';
  const cp=tw?[xi,'×'+p.a,'+'+p.b,'×'+p.a,'+'+p.b,wr,yo]:[xi,'×'+p.a,'+'+p.b,wr,yo];
  chain(212,'The code',cp,'#3f6fb0');
  const P=PICK[p.pick],dp=hb?['−'+p.us,'×'+p.um,wr]:P?P.ch(c.A,c.B,inv(c.A)):['pick one'];
  chain(264,'Your decoder',[yo,...dp,xi+'?'],'#b0453f');
  if(tw&&atLeast('honors'))txt(ctx,'Coded twice = one code: ×'+c.A+', +'+c.B+' (mod 26)',24,300,{s:13*kk,c:PAL['cv-soft']});
  /* code table and round trip */
  const cw=760/26,tx=20;let y=p.table&&atLeast('honors')?330:362;
  if(p.table&&atLeast('honors')){const cnt={};for(let x=0;x<26;x++){const e=enc(sim,x);cnt[e]=(cnt[e]||0)+1;}
   txt(ctx,'Letter',tx,y-10,{s:12*kk,w:700,c:PAL['cv-soft']});
   for(let x=0;x<26;x++){const e=enc(sim,x),dup=cnt[e]>1;txt(ctx,L(x),tx+x*cw+cw/2,y+8,{s:Math.min(14*k,cw*0.75),w:700,c:PAL['cv-ink'],a:'center',b:'middle'});
    txt(ctx,L(e),tx+x*cw+cw/2,y+30,{s:Math.min(14*k,cw*0.75),w:700,c:dup?PAL['s1']:PAL['s2'],a:'center',b:'middle'});}
   txt(ctx,distinct(sim)<26?'Red: two letters share one code letter, so no decoder can tell them apart.':'Code letters (each letter gets its own: the code is one-to-one)',tx,y+54,{s:12*kk,c:distinct(sim)<26?PAL['s1']:PAL['cv-soft']});
   y+=70;}
  txt(ctx,atLeast('honors')?'Round trip: decode(code(letter)) for every letter':'Round trip: every letter through the code, then your decoder',tx,y-8,{s:12*kk,w:700,c:PAL['cv-soft']});
  for(let x=0;x<26;x++){const r=fn(enc(sim,x)),ok=r===x;const X=tx+x*cw;
   rr(ctx,X+1,y,cw-2,30,5);ctx.fillStyle=show?(ok?PAL['s3']:PAL['s1']):PAL['card'];ctx.globalAlpha=show?.22:1;ctx.fill();ctx.globalAlpha=1;
   txt(ctx,show?L(r):'?',X+cw/2,y+16,{s:Math.min(14*k,cw*0.75),w:700,c:show?PAL['cv-ink']:PAL['cv-soft'],a:'center',b:'middle'});}
  if(!show)txt(ctx,'Lock in your gut to see what your decoder reads.',400,Math.min(446,y+54),{s:13*kk,c:PAL['cv-soft'],a:'center'});},
 narrate(sim){const p=sim.p,c=codeMap(sim),ai=inv(c.A),show=revealed(sim);
  if(ai===null)return `<b>No decoder can work:</b> multiplying by ${c.A} sends pairs of letters to the same code letter (only ${distinct(sim)} different code letters are used), so the code is not one-to-one and has no inverse.`;
  if(big()){const k=p.pick,top=Math.floor(25/c.A);
   if(!show||!PICK[k])return `The code multiplied each letter’s number by ${c.A}, added ${c.B}, and wrapped around past 25. Which decoder undoes that? Pick one and lock it in.`;
   if(k==='inv')return `<b>Your decoder is the inverse.</b> It takes away ${c.B}, then multiplies by ${ai}, and ${c.A} × ${ai} = ${c.A*ai}, which wraps around to 1. Every letter comes back to itself.`;
   if(k==='div')return c.A===1?`Dividing by 1 changes nothing, so this decoder works here.`:`<b>Dividing by ${c.A} trips on the wrap-around.</b> Only ${L(0)} through ${L(top)} come back, because ${c.A} × their number never passed 25. Every other letter wrapped, so its code minus ${c.B} is not a multiple of ${c.A}, and dividing gives a fraction: ?.`;
   if(k==='rev')return `<b>Wrong order.</b> The code added ${c.B} last, so the decoder has to take it off first. Dividing first also hits the wrap-around, so most letters give fractions: ?.`;
   return `<b>Half done.</b> Subtracting ${c.B} undoes the add, but every letter is still multiplied by ${c.A}.`;}
  const ok=p.us===c.B&&p.um===ai;
  if(ok&&show)return `<b>Your decoder is the inverse.</b> It takes away ${c.B}, then multiplies by ${ai}, and ${c.A} × ${ai} = ${c.A*ai}, which is 1 more than a multiple of 26. Every letter comes back to itself.`;
  return `Your decoder subtracts ${p.us}, then multiplies by ${p.um}. It undoes the code only if it subtracts ${c.B} and ${c.A} × ${p.um} = ${c.A*p.um} leaves remainder 1 when divided by 26 (it leaves <b>${md(c.A*p.um)}</b>).`;},
 gut:{better:'higher',
  get controls(){return big()?['pick']:['us','um'];},
  ask:{bio:'Which decoder reads the call? Pick one of the four here. Go with your gut, then lock it in to see what it reads.',honors:'Before you use any math: set your decoder with the two sliders here, then lock it in.'},
  lockLabel:'Lock in my decoder',
  lock(sim){const f=decFn(sim),base={v:rightF(sim,f),key:scKey(sim),gd:decodedF(sim,f),pl:plain(sim),tot:nLetters(sim),noInv:inv(codeMap(sim).A)===null};
   if(big())return Object.assign(base,{pick:sim.p.pick,label:PICK[sim.p.pick]?lc(pickLabel(sim,sim.p.pick)):'no pick yet'});
   return Object.assign(base,{s:sim.p.us,m:sim.p.um,label:`subtract ${sim.p.us}, then multiply by ${sim.p.um}`});},
  solve(sim){if(big()){const noInv=inv(codeMap(sim).A)===null;let bk='inv',bv=-1;['inv',...PORD].forEach(k=>{sim.p.pick=k;const v=rightF(sim,decFn(sim));if(v>bv){bv=v;bk=k;}});sim.p.pick=bk;
   return {v:bv,pick:bk,key:scKey(sim),pl:plain(sim),tot:nLetters(sim),noInv,label:noInv?`no inverse exists; the best of the four is “${lc(pickLabel(sim,bk))}”`:lc(pickLabel(sim,bk))};}
   const b=best(sim);sim.p.us=b.s;sim.p.um=b.m;return {v:rightCount(sim,b.s,b.m),s:b.s,m:b.m,key:scKey(sim),pl:plain(sim),tot:nLetters(sim),noInv:inv(codeMap(sim).A)===null,label:inv(codeMap(sim).A)===null?`no inverse exists; the best decoder subtracts ${b.s}, then multiplies by ${b.m}`:`subtract ${b.s}, then multiply by ${b.m}`};},
  how:{bio:'Undo the last step first: the code added a number, so subtract it. Then undo the multiplying with a whole number that wraps back around to 1. For ×3 that is ×9, because 3 × 9 = 27 = 26 + 1. Dividing by 3 can’t do this job: after the wrap-around, most codes are not multiples of 3.',
   ap:'Solve y ≡ ax + b for x: x ≡ a⁻¹(y − b) (mod 26). Find a⁻¹ by testing multiples of a, or with the extended Euclidean algorithm. A double code is ×a², +(a + 1)b, so its inverse subtracts (a + 1)b and multiplies by (a⁻¹)².'},
  compare(sim,g,m){const tot=g.tot,gd=g.gd;
   if(big()&&!m.noInv){const c=codeMap(sim),a=c.A,b=c.B,ai=inv(a),why=`Multiplying by ${ai} undoes multiplying by ${a}, because ${a} × ${ai} = ${a*ai}, which wraps around to 1.`;
    if(!g.pick)return `You did not pick a decoder, so you read 0 of ${tot} letters. The inverse, “${m.label}”, reads <b>all ${tot}</b>: “${m.pl}”. ${why}`;
    if(g.v>=tot)return `Your gut was right on: “${g.label}” reads all ${tot} letters. ${a===1?'':why}${g.pick==='inv'?` Most people pick “divide by ${a}” first, so your gut is ahead of the crowd.`:''}`;
    const r={div:`Dividing by ${a} fails because of the wrap-around. Once ${a} × a letter’s number passed 25, the code wrapped it, so most codes minus ${b} are not multiples of ${a}. Dividing gives a fraction, which is not a letter (?).`,
     rev:`It undoes the steps in the wrong order: ${b} was added last, so it has to come off first. Dividing first also runs into the wrap-around, so most letters give fractions (?).`,
     sub:`Subtracting ${b} undoes the add, but every letter is still multiplied by ${a}.`}[g.pick]||'';
    return `Your decoder read <b>${g.v} of ${tot} letters</b>: “${gd}”. ${r} ${why} So the inverse reads <b>all ${tot}</b>: “${m.pl}”.`;}
   if(m.noInv)return `This code has <b>no inverse</b>: it sends two different letters to the same code letter. Even the best decoder reads only ${m.v} of ${tot} letters. Your gut got ${g.v}. That is why the multiplier must share no factor with 26.`;
   if(g.v>=tot)return `Your gut was right on: your decoder reads all ${tot} letters. You already knew to undo the steps in reverse order. The math explains why your multiplier works: it wraps the code’s multiplier back around to 1.`;
   return `Your decoder read <b>${g.v} of ${tot} letters</b> right: “${gd}”. The inverse reads <b>all ${tot}</b>: “${m.pl}”. Guessing the multiplier one at a time could take up to 25 tries; the inverse gets it in one.`;},
  again(sim){const pool=atLeast('honors')?AOK.slice(1):[3,5,7,9,11];let msg;do{msg=Math.floor(Math.random()*MSG.length);}while(msg===sim.p.msg&&Math.random()<0.8);
   Object.assign(sim.p,{msg,a:pool[Math.floor(Math.random()*pool.length)],b:1+Math.floor(Math.random()*25),us:0,um:1,pick:'',peek:false});relabel(sim);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A simpler code just adds 3 to every letter (A → D, B → E, … X → A). What decoder undoes it?',choices:['Add 3 again','Subtract 3 (the same as adding 23)','Multiply by 3'],correct:1,explain:'The inverse of “add 3” is “subtract 3”. Because the letters wrap around 26, subtracting 3 is the same as adding 23. Adding 3 again would shift every letter 6 places.'},
  {lvl:'bio',instant:true,q:'The code multiplies by 3, then adds 5. Which order should your decoder use?',choices:['Undo the ×3 first, then subtract 5','Subtract 5 first, then undo the ×3','The order does not matter'],correct:1,explain:'An inverse undoes the steps in reverse order, like taking off shoes before socks. The 5 was added last, so it comes off first. Subtract 5, then multiply by 9, and the round trip returns every letter.'},
  {lvl:'bio',instant:true,q:'A code letter is K, which is 10. A teammate decodes it by subtracting 5, then dividing by 3. What does she get?',choices:['The letter B, rounding down','5 ÷ 3, a fraction, which is not a letter','The letter T'],correct:1,explain:'10 − 5 = 5, and 5 ÷ 3 is not a whole number, so it matches no letter. The code wrapped the real letter around past 25. Multiply by 9 instead: 9 × 5 = 45, which wraps to 19, the letter T. Check: 3 × 19 + 5 = 62, which wraps to 10, K.'},
  {lvl:'honors',instant:true,q:'Why can’t the code use a = 2?',choices:['2 is too small to hide the message','Two different letters get the same code letter, so the code is not one-to-one','Multiplying by 2 can’t wrap around 26'],correct:1,explain:'With a = 2, A (0) and N (13) both go to the same code letter, because 2 × 13 = 26 wraps to 0. Only 13 code letters are ever used, so a decoder seeing that letter can’t know which one was sent. A function needs to be one-to-one to have an inverse.'},
  {lvl:'honors',instant:true,q:'The code multiplies by 3. Which multiplier undoes it, mod 26?',choices:['3','9','13','23'],correct:1,explain:'3 × 9 = 27 = 26 + 1, so multiplying by 9 wraps 3x back to x. Check: 3 × 3 = 9, 3 × 13 = 39 = 26 + 13, and 3 × 23 = 69 = 52 + 17. None of those leave remainder 1.'},
  {lvl:'ap',instant:true,q:'What is the inverse of 5 mod 26?',choices:['5','21','15','There is none'],correct:1,explain:'5 × 21 = 105 = 4 × 26 + 1. So the decoder for E(x) = 5x + b is D(y) = 21(y − b) mod 26.'},
  {lvl:'ap',instant:true,q:'E(x) = (3x + 5) mod 26 is applied twice. What single code is E(E(x))?',choices:['9x + 10','9x + 20','6x + 10','3x + 10'],correct:1,explain:'E(E(x)) = 3(3x + 5) + 5 = 9x + 20 (mod 26). Its inverse subtracts 20, then multiplies by 9⁻¹ = 3, because 9 × 3 = 27 ≡ 1.'}
 ],
 tour:[
  {title:'The coded call',text:'Each letter of the play call became a number (A = 0 … Z = 25), went through the code, and came out as a new letter. The code is a function: multiply by 3, add 5, wrap around 26.',focus:[[20,20,760,70],[16,192,560,44]],pause:true,setup:sim=>BioLab.setValues(sim,{msg:0,a:3,b:5,twice:false,us:0,um:1,pick:'',peek:false,table:false})},
  {title:'Try the obvious decoder',text:{bio:'Undo each step: subtract 5, then divide by 3. Only H, E, E, C, D and A come back. Those are letters from A to I, where 3 × the number never passed 25. Every other letter wrapped around, so its code minus 5 is not a multiple of 3, and dividing gives a fraction: ?.',honors:'Undo the add: subtract 5. Undoing ×3 seems to need ÷3, but the decoder only multiplies by whole numbers. Try multiplying by 1: most letters come out wrong.'},pause:true,setup:sim=>BioLab.setValues(sim,atLeast('honors')?{us:5,um:1,peek:true}:{pick:'div',peek:true})},
  {title:'The round trip',text:'The bottom row runs every letter through the code and then your decoder. An inverse function brings every letter back to itself: A to A, B to B, all the way to Z. Red letters did not come back.',focus:[[14,340,772,60]],pause:true},
  {title:'Wrap around to 1',text:'Multiply by 9: 3 × 9 = 27, and 27 wraps around 26 to 1. So multiplying by 9 undoes multiplying by 3. Now the round trip is perfect and the call reads RUN THE SECOND PLAY.',pause:true,setup:sim=>BioLab.setValues(sim,atLeast('honors')?{us:5,um:9,peek:true}:{pick:'inv',peek:true})},
  {lvl:'honors',title:'Not every code has an inverse',text:'Switch to a = 2. Now A and N both code to the same letter (2 × 13 = 26 wraps to 0). The red letters in the code table share a code letter, so no decoder can tell which was sent. The code is not one-to-one.',focus:[[14,310,772,130]],pause:true,setup:sim=>BioLab.setValues(sim,{a:2,table:true})},
  {lvl:'ap',title:'Coding twice',text:'Coding twice is a composition: E(E(x)) = 3(3x + 5) + 5 = 9x + 20. Its inverse subtracts 20, then multiplies by 3, since 9 × 3 = 27 ≡ 1 (mod 26).',pause:true,setup:sim=>BioLab.setValues(sim,{a:3,twice:true,us:20,um:3,table:false})},
  {title:'Your turn',text:{bio:'Close this walkthrough and try the Gut vs. math box at the top: pick a decoder, lock it in, then let the inverse take its turn.',honors:'Close this walkthrough and try the Gut vs. math box at the top: set a decoder by feel, lock it in, then let the inverse take its turn.'},pause:true,setup:sim=>BioLab.setValues(sim,{msg:0,a:3,b:5,twice:false,us:0,um:1,pick:'',peek:false,table:false})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{twice:false,table:false});},
 lab:{bio:'<p><b>Question:</b> For each code multiplier, which decoder undoes it?</p><ol><li>Turn on <b>Show what my decoder reads</b>. Set the code to multiply by 3, then add 5.</li><li>Try all four decoders. Record a trial for each, and note which one turns the round trip all green.</li><li>Change the code to multiply by 5, then 7, then 11. Each time, find the decoder that reads the whole call and write down the number it multiplies by.</li></ol><p>Multiply each code multiplier by its decoder’s multiplier. What do the products have in common? Why does “divide” never read the whole call?</p>',
  honors:'<p><b>Question:</b> Which multipliers make a code you can undo?</p><ol><li>Turn on the code table. Try a = 2, 3, 13 and 15 and record <b>Different code letters used</b>.</li><li>For each a that uses all 26, press <b>Build the inverse</b>.</li></ol><p>Explain what the multipliers that fail have in common with 26.</p>',
  ap:'<p><b>Question:</b> Is the inverse of a composition the composition of the inverses?</p><ol><li>Turn on <b>coded twice</b> for a = 5, b = 8. Predict the single code ×a², +(a + 1)b mod 26 and its decoder.</li><li>Check with <b>Build the inverse</b>.</li></ol><p><b>CER:</b> Show that (E∘E)⁻¹ = E⁻¹∘E⁻¹ for this code, and explain why the order of undoing matters.</p>'},
 terms:[
  {t:'Function',d:'A rule that gives exactly one output for each input. Here the input is a letter and the output is its code letter.'},
  {t:'Inverse function',d:'The function that undoes another: f⁻¹(f(x)) = x for every input x.'},
  {t:'mod 26',d:'Keep only the remainder after dividing by 26, so the numbers wrap around: 27 mod 26 = 1.'},
  {t:'One-to-one',d:'No two inputs share an output. Only a one-to-one function can have an inverse.',lvl:'honors'},
  {t:'Composition',d:'Running one function on the output of another: (f∘g)(x) = f(g(x)). Its inverse is g⁻¹∘f⁻¹.',lvl:'honors'},
  {t:'Multiplicative inverse mod 26',d:'The number a⁻¹ with a·a⁻¹ ≡ 1 (mod 26). It exists only when a and 26 share no factor.',lvl:'ap'}
 ],
 about:'<p>Letters are numbers A = 0 … Z = 25. The code is E(x) = (a·x + b) mod 26. At Closer look and Deep dive your decoder is D(y) = m·(y − s) mod 26. At Big picture you pick one of four decoders in plain words. Subtracting wraps around (A − 1 is Z). Dividing gives a letter only when the number is a whole multiple of the divisor; otherwise the result is a fraction, which is not a letter, and it shows as ?. Letters read right are counted out of the letters in the call (16 for the first call). D is the inverse of E exactly when s = b and a·m ≡ 1 (mod 26). That needs a to share no factor with 26, so a can be 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23 or 25. Spaces are left alone.</p><p><b>Simplified, and not secure:</b> this is an affine cipher, a classroom code. Anyone can break it in seconds by trying all 312 keys or by counting letter frequencies. Real encryption is built very differently. When the code has no inverse (a = 2 or 13), “the math” shows the best any decoder of this form can do.</p>'
};
BioLab.register(SIM);
})();
