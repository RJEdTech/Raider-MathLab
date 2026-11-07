(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* NCAA research, "Estimated probability of competing in college athletics" (high school 2024-25 NFHS survey; NCAA 2024-25 participation)
   and "Estimated probability of competing in professional athletics" (updated March 2026). Draft-eligible = NCAA participants / 4.5. */
const SPORT={
 mbb:{name:'men’s basketball',short:'Men’s basketball',league:'NBA',hs:540704,nc:19617,dr:43,other:906,draft:'2024 NBA Draft'},
 wbb:{name:'women’s basketball',short:'Women’s basketball',league:'WNBA',hs:356240,nc:16823,dr:30,other:309,draft:'2024 WNBA Draft'},
 fb:{name:'football',short:'Football',league:'NFL',hs:1029588,nc:83794,dr:257,other:null,draft:'2025 NFL Draft'},
 base:{name:'baseball',short:'Baseball',league:'MLB',hs:472598,nc:41580,dr:452,other:null,draft:'2025 MLB Draft'}};
const sp=sim=>SPORT[sim.p.sport]||SPORT.mbb;
const pCol=s=>s.nc/s.hs,elig=s=>s.nc/4.5,pPro=s=>s.dr/elig(s),pAll=s=>pCol(s)*pPro(s);
const per10k=s=>1e4*pAll(s),oneIn=s=>{const n=1/pAll(s);return n>1000?Math.round(n/10)*10:Math.round(n);};
const anyPro=s=>s.other===null?null:1e4*pCol(s)*(s.dr+s.other)/elig(s);
/* Aspen Institute Project Play, 2024 National Youth Sports Parent Survey (report March 2025): average yearly spending on the child's primary sport. */
const ASPEN=[{l:'Under $50,000',v:604.01,club:13.0,mo:4.98,days:2.56},{l:'$50,000 to $99,999',v:961.20,club:14.9,mo:5.70,days:2.67},{l:'$100,000 and up',v:1590.61,club:25.8,mo:6.07,days:2.77}];
/* Made-up counties to show how a per-100,000 rate works. Direction matches Stephens-Davidowitz (2013); sizes are invented. */
const RATES=[1.0,1.4,1.9,2.4,3.3],BOYS=2000000,PLAYERS=RATES.map(r=>r*BOYS/1e5),TOT=PLAYERS.reduce((a,b)=>a+b,0);
const FIFTH=['Poorest fifth','Second','Middle','Fourth','Richest fifth'];
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const rev=sim=>!!(sim.p.show||(sim.tour&&sim.tour.on)||(sim.gutS&&sim.gutS.g));
const f1=v=>fmtNum(v,1),f0=v=>Math.round(v).toLocaleString('en-US'),money=v=>'$'+Math.round(v).toLocaleString('en-US');
const pct=(v,d)=>(100*v).toFixed(d===undefined?1:d)+'%';
const hrs=sim=>sim.p.budget/sim.p.cost;
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function wrap(ctx,s,x,y,w,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='';
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,y,o);y+=lh;line=wd;}else line=t;});if(line){txt(ctx,line,x,y,o);y+=lh;}return y;}
/* A fixed shuffle of the 10,000 dots, so the same players light up every time. */
const ORDER=(()=>{const r=rng(2013),a=[];for(let i=0;i<10000;i++)a.push(i);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;})();
const ORDER2=(()=>{const r=rng(77),a=[];for(let i=0;i<10000;i++)a.push(i);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;})();
const GX=24,GY=66,PITCH=4,COLS=125,ROWS=80;
const dotXY=i=>[GX+(i%COLS)*PITCH,GY+Math.floor(i/COLS)*PITCH];

function drawFunnel(sim,ctx,k){const s=sp(sim),R=rev(sim),G=GS(sim),g=G&&G.g?G.g.guess:+sim.p.guess;
 txt(ctx,'10,000 high school '+s.name+' players',GX,40,{s:15*Math.min(k,1.4),w:700});
 const nCol=Math.round(1e4*pCol(s)),nPro=Math.max(1,Math.round(per10k(s)));
 const colSet=new Uint8Array(10000);if(R)for(let i=0;i<nCol;i++)colSet[ORDER[i]]=1;
 const gutSet=new Uint8Array(10000);for(let i=0;i<g;i++)gutSet[ORDER2[i]]=1;
 for(let i=0;i<10000;i++){const [x,y]=dotXY(i);
  if(gutSet[i]){ctx.fillStyle=PAL['s4'];ctx.globalAlpha=R?.6:1;}
  else if(colSet[i]){ctx.fillStyle=PAL['s2'];ctx.globalAlpha=1;}
  else{ctx.fillStyle=PAL['muted'];ctx.globalAlpha=.32;}
  ctx.fillRect(x,y,3,3);}
 ctx.globalAlpha=1;
 if(R){ctx.lineWidth=2.5;for(let i=0;i<nPro;i++){const [x,y]=dotXY(ORDER[i]);ctx.strokeStyle=PAL['s1'];ctx.beginPath();ctx.arc(x+1.5,y+1.5,7,0,7);ctx.stroke();ctx.fillStyle=PAL['s1'];ctx.fillRect(x-1,y-1,5,5);}}
 /* legend under the grid */
 const items=[[PAL['muted'],'High school player'],[PAL['s4'],'Your guess: drafted']];if(R){items.push([PAL['s2'],'Plays NCAA']);items.push([PAL['s1'],'Drafted (ring)']);}
 ctx.font='400 '+(12*k)+'px '+FONT;let lx=GX,ly=GY+ROWS*PITCH+22*Math.min(k,1.3);
 items.forEach(([c,l])=>{const w=ctx.measureText(l).width+16*k+18;if(lx+w>GX+COLS*PITCH+30&&lx>GX){lx=GX;ly+=17*k;}ctx.fillStyle=c;ctx.globalAlpha=c===PAL['muted']?.5:1;ctx.fillRect(lx,ly-9*k,10*k,10*k);ctx.globalAlpha=1;txt(ctx,l,lx+14*k,ly,{s:12*k,c:PAL['cv-soft']});lx+=w;});
 /* funnel panel */
 const px=GX+COLS*PITCH+26,pw=800-px-12,kk=Math.min(k,1.6);let y=GY+18*kk;
 const step=(num,label,col)=>{txt(ctx,num,px,y,{s:20*kk,w:800,c:col});y+=8*kk;y=wrap(ctx,label,px,y+14*kk,pw,15*kk,{s:12*k,c:PAL['cv-soft']});y+=16*kk;};
 step('10,000','high school players',PAL['cv-ink']);
 step(R?f0(1e4*pCol(s)):'?',R?pct(pCol(s))+' of them play NCAA':'play NCAA college sports',PAL['s2']);
 step(R?f1(per10k(s)):'?',R?pct(pPro(s))+' of draft-eligible NCAA players get drafted ('+s.league+')':'drafted into the '+s.league,PAL['s1']);
 if(y<GY+ROWS*PITCH+4){ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px,y-8*kk);ctx.lineTo(px+pw,y-8*kk);ctx.stroke();
  txt(ctx,'Your guess: '+f0(g),px,y+10*kk,{s:13*kk,w:700,c:PAL['s4']});}}

function drawCounty(sim,ctx,k){const share=sim.p.count==='players',kk=Math.min(k,1.5);
 txt(ctx,share?'Where the NBA players were born (made-up counties)':'NBA players per 100,000 boys born (made-up counties)',24,34,{s:15*Math.min(k,1.3),w:700});
 const L=56,T=72,W=410,H=Math.min(270,370-50*kk),vals=share?PLAYERS.map(p=>100*p/TOT):RATES,top=share?40:4;
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let v=0;v<=top;v+=share?10:1){const yy=T+H-v/top*H;ctx.beginPath();ctx.moveTo(L,yy);ctx.lineTo(L+W,yy);ctx.stroke();txt(ctx,share?v+'%':String(v),L-8,yy+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
 const bw=W/5;vals.forEach((v,i)=>{const x=L+i*bw+bw*.18,w=bw*.64,h=v/top*H;ctx.fillStyle=i===4?PAL['s3']:i===0?PAL['s4']:PAL['s2'];ctx.globalAlpha=.9;ctx.fillRect(x,T+H-h,w,h);ctx.globalAlpha=1;
  txt(ctx,share?Math.round(v)+'%':f1(v),x+w/2,T+H-h-6,{s:13*kk,w:700,a:'center'});
  const lab=FIFTH[i].split(' ');txt(ctx,lab[0],x+w/2,T+H+16*kk,{s:12*k,c:PAL['cv-soft'],a:'center'});if(lab[1])txt(ctx,lab[1],x+w/2,T+H+30*kk,{s:12*k,c:PAL['cv-soft'],a:'center'});});
 txt(ctx,'County income per person: poorer to richer',L+W/2,T+H+50*kk,{s:12*k,c:PAL['cv-soft'],a:'center'});
 /* method panel */
 const px=494,pw=294;let y=86;
 txt(ctx,'How the rate works',px,y,{s:14*kk,w:700});y+=22*kk;
 y=wrap(ctx,'Each fifth: '+f0(BOYS)+' boys born. Richest fifth: '+PLAYERS[4]+' NBA players.',px,y,pw,16*kk,{s:12*k,c:PAL['cv-soft']});y+=4;
 y=wrap(ctx,PLAYERS[4]+' ÷ '+f0(BOYS)+' × 100,000 = '+f1(RATES[4]),px,y,pw,16*kk,{s:12*k,w:700,c:PAL['s3']});y+=6;
 y=wrap(ctx,'Poorest fifth: '+PLAYERS[0]+' players, or '+f1(RATES[0])+' per 100,000.',px,y,pw,16*kk,{s:12*k,w:700,c:PAL['s4']});y+=8;
 y=wrap(ctx,share?'The poorest fifth still produces '+Math.round(100*PLAYERS[0]/TOT)+'% of the players. Those are the stories you hear.':'A boy in the richest fifth is '+f1(RATES[4]/RATES[0])+' times as likely to make it.',px,y,pw,16*kk,{s:12*k,c:PAL['cv-ink']});
 const note='Invented numbers. The direction (richer is higher) matches Stephens-Davidowitz, 2013.';ctx.font='400 '+(12*k)+'px '+FONT;const nl=Math.ceil(ctx.measureText(note).width/(pw*0.92)),ny=Math.max(y+8,446-nl*15*kk);
 if(ny+(nl-1)*15*kk<=446)wrap(ctx,note,px,ny,pw,15*kk,{s:12*k,c:PAL['muted']});}

function drawReps(sim,ctx,k){const kk=Math.min(k,1.5),c=sim.p.cost,ap=atLeast('ap');
 txt(ctx,'What a year of spending buys, at '+money(c)+' per coached hour',24,34,{s:15*Math.min(k,1.3),w:700});
 const rows=ASPEN.map(a=>({l:a.l,v:a.v,h:a.v/c,col:PAL['s2']})).concat([{l:'Your family’s budget',v:sim.p.budget,h:hrs(sim),col:PAL['rj']}]);
 const mx=Math.max(10,...rows.map(r=>r.h))*1.12,L=24,W=500,T=66,rh=Math.max(ap?66:80,12*k+30*kk+14);
 rows.forEach((r,i)=>{const y=T+i*rh;txt(ctx,r.l+': '+money(r.v)+' a year',L,y,{s:12*k,c:PAL['cv-soft']});
  const w=Math.max(2,r.h/mx*W);ctx.fillStyle=r.col;ctx.fillRect(L,y+8*kk,w,22*kk);
  const lab=f0(r.h)+' hours';ctx.font='700 '+(13*kk)+'px '+FONT;const tw=ctx.measureText(lab).width;
  if(w>tw+16)txt(ctx,lab,L+w-8,y+8*kk+16*kk,{s:13*kk,w:700,c:'#fff',a:'right'});else txt(ctx,lab,L+w+8,y+8*kk+16*kk,{s:13*kk,w:700});});
 const px=556,pw=232;let y=86;
 y=wrap(ctx,'Hours = dollars ÷ cost per hour',px,y,pw,16*kk,{s:12*k,w:700});y+=6;
 y=wrap(ctx,money(sim.p.budget)+' ÷ '+money(c)+' = '+f0(hrs(sim))+' hours a year',px,y,pw,16*kk,{s:12*k,c:PAL['rj'],w:700});y+=8;
 y=wrap(ctx,'Gap between the top and bottom income groups: '+f0((ASPEN[2].v-ASPEN[0].v)/c)+' hours a year.',px,y,pw,16*kk,{s:12*k,c:PAL['cv-soft']});y+=8;
 if(ap){y=wrap(ctx,'Same survey, time: '+ASPEN[0].mo+' vs. '+ASPEN[2].mo+' months a year of practice and games.',px,y,pw,16*kk,{s:12*k,c:PAL['cv-soft']});y+=8;}
 const note='Spending: Aspen Institute, 2024 survey. Cost per hour is your assumption.';ctx.font='400 '+(12*k)+'px '+FONT;const nl=Math.ceil(ctx.measureText(note).width/(pw*0.92)),ny=Math.max(y+4,446-nl*15*kk);
 if(ny+(nl-1)*15*kk<=446)wrap(ctx,note,px,ny,pw,15*kk,{s:12*k,c:PAL['muted']});}

const SIM={
 id:'makethepros',hash:'makethepros',apUnit:21,order:5,tab:'Who makes the pros?',kind:'Simulation',
 card:'Guess how many of 10,000 high school players get drafted, then see how money, reps and where you are born change the odds.',
 title:'Who makes the pros?',
 lede:{bio:'Sports are often called the way out of poverty. The numbers tell a harder story: very few players reach the pros, and kids born into more money have better odds, even in the NBA.',
  honors:'Long odds come from multiplying conditional probabilities: P(pro) = P(college | high school) × P(pro | college). To compare places fairly, you need a rate, players per 100,000 births, not a count of famous names.',
  ap:'The stories we hear are a selected sample: we see the players who made it, not the base rate. P(grew up poor | pro) can be large even when P(pro | grew up poor) is small, because many more kids grow up poor.'},
 scale:'Each dot is one high school player: 10,000 in all. Figures are national estimates from the NCAA for 2024-25.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'The odds',
 controls:[
  {id:'guess',label:'Your gut: of 10,000 high school players, how many get drafted after college?',type:'seg',def:100,options:[{v:1,l:'1'},{v:3,l:'3'},{v:10,l:'10'},{v:30,l:'30'},{v:100,l:'100'},{v:300,l:'300'},{v:1000,l:'1,000'}]},
  {id:'sport',label:'Sport',type:'seg',def:'mbb',noGut:true,onChange:clearGut,options:[{v:'mbb',l:'Men’s basketball'},{v:'wbb',l:'Women’s basketball'},{v:'fb',l:'Football'},{v:'base',l:'Baseball'}]},
  {id:'view',label:'Look at',type:'seg',def:'funnel',noGut:true,options:[{v:'funnel',l:'The odds'},{v:'county',l:'Where players are born'},{v:'reps',l:'What money buys'}]},
  {id:'show',label:'Show the real numbers now',type:'toggle',def:false,noGut:true,help:'Normally the real numbers appear once you lock in your gut.'},
  {id:'count',label:'Born where: show',type:'seg',def:'rate',noGut:true,options:[{v:'rate',l:'Rate per 100,000'},{v:'players',l:'Share of all players'}],help:'Used on the “Where players are born” view.'},
  {id:'budget',label:'Your family’s yearly budget for the sport ($)',type:'range',min:0,max:4000,step:50,def:1500,unit:'',noGut:true,help:'Used on the “What money buys” view. Kept in this page only; nothing is saved or sent.'},
  {id:'cost',label:'Cost of one coached hour ($, your assumption)',type:'range',min:10,max:80,step:5,def:25,unit:'',noGut:true,help:'A team fee divided by its practice hours, or the price of a lesson. $25 is an assumption for illustration.'}
 ],
 actions:[],
 init(){return {};},step(){},
 metrics:[
  {id:'col',label:'Play NCAA, of high school players',unit:'%',d:1,min:0,max:10,get:sim=>rev(sim)?100*pCol(sp(sim)):null},
  {id:'pro',label:'Drafted, of draft-eligible NCAA players',unit:'%',d:1,min:0,max:6,get:sim=>rev(sim)?100*pPro(sp(sim)):null},
  {id:'per10k',label:'Drafted per 10,000 high school players',unit:'',d:1,min:0,max:50,get:sim=>rev(sim)?per10k(sp(sim)):null},
  {id:'onein',label:'That is 1 in',unit:'players',d:0,min:0,max:null,get:sim=>rev(sim)?oneIn(sp(sim)):null},
  {id:'off',label:'Your gut was off by a factor of',unit:'×',d:1,min:1,max:null,get:sim=>{const G=GS(sim);if(!G||!G.g)return null;const a=per10k(sp(sim)),g=G.g.guess;return Math.max(g/a,a/g);}},
  {id:'hrs',label:'Coached hours your budget buys',unit:'h a year',d:0,min:0,max:null,get:hrs},
  {id:'gap',label:'Extra hours a year: $100K+ vs. under-$50K families',unit:'h',d:0,lvl:'honors',min:0,max:null,get:sim=>(ASPEN[2].v-ASPEN[0].v)/sim.p.cost},
  {id:'ratio',label:'Richest vs. poorest fifth (made-up counties)',unit:'× as likely',d:1,lvl:'honors',min:0,max:null,get:()=>RATES[4]/RATES[0]},
  {id:'any',label:'Any paid pro job, per 10,000 (basketball only)',unit:'',d:1,lvl:'ap',min:0,max:null,get:sim=>rev(sim)?anyPro(sp(sim)):null}
 ],
 infoPanel(sim){const s=sp(sim),v=sim.p.view;let h;
  if(v==='county')h=`<p>A county rate hides the individual child. A boy born in the “richest fifth” can grow up in a family with very little money, and a county average says nothing about his own home. It also hides the famous exception: each of the ${PLAYERS[0]} players from the poorest fifth beat a rate of ${f1(RATES[0])} in 100,000.</p>`;
  else if(v==='reps')h=`<p>An average of what families spend on a sport can only include kids who play it. A child who quit at 10 because club fees were more than the family could pay never shows up in the ${money(ASPEN[0].v)} or the ${money(ASPEN[2].v)}. And an hour of coaching hides what it took to get there: a ride, a parent off work, a safe gym.</p>`;
  else h=`<p>“${rev(sim)?f1(per10k(s)):'?'} per 10,000” counts only players on high school teams. It hides the kids who left the sport earlier because a club fee, gear or a ride was out of reach: they appear in no player database, so no rate can count them.${rev(sim)?` It also hides the other ${f0(1e4-per10k(s))} players, each with a story the draft never records.`:''}</p>`;
  return `<p class="dc-h"><b>What this number hides</b></p>${h}`;},
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const v=sim.p.view;if(v==='county')drawCounty(sim,ctx,k);else if(v==='reps')drawReps(sim,ctx,k);else drawFunnel(sim,ctx,k);},
 narrate(sim){const s=sp(sim),v=sim.p.view;
  if(v==='county'){if(sim.p.count==='players')return `Count where players were born and the poorest fifth still supplies about ${Math.round(100*PLAYERS[0]/TOT)}% of them. <b>Those stories are real, but they hide the rate:</b> ${f1(RATES[0])} per 100,000 boys there against ${f1(RATES[4])} in the richest fifth (made-up numbers).`;
   return `A rate divides by how many boys were born, so big and small places compare fairly. <b>In these made-up counties the richest fifth produces ${f1(RATES[4]/RATES[0])} times as many NBA players per boy as the poorest.</b> Stephens-Davidowitz found the same direction in real county data.`;}
  if(v==='reps'){const h=hrs(sim),gap=(ASPEN[2].v-ASPEN[0].v)/sim.p.cost;return `At ${money(sim.p.cost)} an hour, ${money(sim.p.budget)} a year buys about <b>${f0(h)} coached hours</b>. Families earning $100,000 or more spend ${money(ASPEN[2].v)} on a child’s main sport and families under $50,000 spend ${money(ASPEN[0].v)}: <b>a gap of about ${f0(gap)} hours a year</b>, or ${f0(gap*8)} hours over 8 years.`;}
  if(!rev(sim))return `The amber dots show your guess: ${f0(+sim.p.guess)} of 10,000 high school ${s.name} players drafted into the ${s.league}. <b>Lock in your gut</b> to see the real funnel.`;
  return `About ${f0(1e4*pCol(s))} of 10,000 play NCAA ${s.name} (${pct(pCol(s))}). Of those, about ${pct(pPro(s))} get drafted. <b>Multiply: ${pct(pCol(s))} × ${pct(pPro(s))} ≈ ${f1(per10k(s))} per 10,000</b>, or about 1 in ${oneIn(s).toLocaleString('en-US')}.`;},
 gut:{better:'lower',controls:['guess'],lockLabel:'Lock in my guess',
  ask:{bio:'Picture 10,000 high school players in the sport named on the picture. How many of them will play in college and then get drafted into the top pro league? Pick a number here. The amber dots show what your number looks like. Then lock it in.',
   honors:'Pick your gut count here: of 10,000 high school players in this sport, how many get drafted into the top pro league by way of NCAA college sports? Then lock it in.'},
  lock(sim){const a=per10k(sp(sim)),g=+sim.p.guess;return {v:Math.abs(Math.log10(g/a)),guess:g,label:`${f0(g)} of 10,000 drafted`};},
  solve(sim){const s=sp(sim),a=per10k(s);sim.p.view='funnel';return {v:0,guess:a,label:`about ${f1(a)} of 10,000: 1 in ${oneIn(s).toLocaleString('en-US')}`};},
  how:{bio:'The math follows the players one step at a time. First, what share of high school players play NCAA college sports? Then, what share of those college players get drafted? Multiply the two shares, then multiply by 10,000.',
   honors:'Chain the conditional probabilities: P(drafted) = P(NCAA | high school) × P(drafted | NCAA). Each step uses only the players who made the step before.',
   ap:'P(drafted) = P(NCAA | HS) × P(drafted | NCAA). The NCAA estimates one draft class as participants ÷ 4.5, so P(drafted | NCAA) = draft picks from the NCAA ÷ (NCAA players ÷ 4.5).'},
  compare(sim,g,m){const s=sp(sim),a=per10k(s),col=1e4*pCol(s),fac=Math.max(g.guess/a,a/g.guess);
   const good=` The good news for anyone who loves the game: about <b>${f0(col)} of those 10,000 play NCAA college sports</b>, and every one of them keeps getting coached, competing and learning.`;
   if(fac<1.6)return `Your gut was right on: about <b>${f1(a)} of 10,000</b> high school ${s.name} players get drafted into the ${s.league} after college, about 1 in ${oneIn(s).toLocaleString('en-US')}. Most people guess far higher.${good}`;
   if(g.guess>a)return `You pictured <b>${f0(g.guess)}</b> of 10,000 players drafted. The real number is <b>about ${f1(a)}</b>: 1 in ${oneIn(s).toLocaleString('en-US')}. Your guess was <b>${f1(fac)} times too high</b>, and that is normal: we hear about the players who made it, not the thousands who didn’t.${good}`;
   return `You pictured only <b>${f0(g.guess)}</b> of 10,000 drafted. The real number is <b>about ${f1(a)}</b>: 1 in ${oneIn(s).toLocaleString('en-US')}, so your guess was ${f1(fac)} times too low. Still, these are long odds for everyone.${good}`;},
  again(sim){const ks=Object.keys(SPORT);sim.p.sport=ks[Math.floor(Math.random()*ks.length)];sim.p.guess=100;sim.p.show=false;sim.p.view='funnel';}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Two boys are born the same year. One is born in a county with high income per person, the other in a low-income county. Who is more likely to reach the NBA?',choices:['The boy from the poorer county: he will be hungrier','The boy from the richer county','Neither: it is all talent'],correct:1,explain:'Seth Stephens-Davidowitz matched NBA players to the counties where they were born and found that growing up in a wealthier area was “a major, positive predictor of reaching the N.B.A.” for both Black and white men (The New York Times, 2013). Rags-to-riches stars are real, and remarkable, because they beat the odds.'},
  {lvl:'bio',instant:true,q:'Of 10,000 high school football players, about how many get drafted into the NFL after playing in college?',choices:['About 1','About 11','About 110','About 800'],correct:1,explain:'8.1% of high school football players play NCAA football, and about 1.4% of draft-eligible NCAA players get drafted. 0.081 × 0.0138 × 10,000 ≈ 11. The 800 is close to how many play in college: about 814.'},
  {lvl:'bio',instant:true,q:'You can name several NBA stars who grew up poor. Does that show kids who grow up poor have the best odds?',choices:['Yes: the famous examples prove it','No: you only see the players who made it, not how many kids from each background tried','Yes, as long as there are at least five examples'],correct:1,explain:'This is survivorship bias. To compare odds you need a rate: players divided by how many kids grew up in each kind of place. In the tool’s made-up counties, the poorest fifth still supplies 10% of the players, so you hear their stories, but the rate there is a third of the richest fifth’s.'},
  {lvl:'bio',instant:true,q:'The NCAA’s high school numbers count players on high school teams. Which kids can no count of players ever include?',choices:['Players on a high school team who never start a game','Kids who left the sport at 10 or 12 because club fees, gear or rides cost too much','Players who switched to a different sport in high school'],correct:1,explain:'A database of players only holds people who are still playing. Kids priced out early never reach a roster, so the 3.6 per 10,000 says nothing about them. That is what this number hides: the rate starts after cost has already sorted who is in the gym.'},
  {lvl:'honors',instant:true,q:'Women’s basketball: 4.7% of high school players play NCAA, and 0.8% of draft-eligible NCAA players are drafted into the WNBA. Out of 100,000 high school players, about how many get drafted?',choices:['About 38','About 470','About 3,800','About 55'],correct:0,explain:'Multiply the conditional probabilities: 0.047 × 0.008 = 0.000376, and 0.000376 × 100,000 ≈ 38. Adding the percentages (4.7% + 0.8%) would be wrong: each step only counts players who survived the step before.'},
  {lvl:'honors',instant:true,q:'Allison, Davis and Barranco (2018) matched 929 top-ranked college football recruits to their hometowns. What did they find about the ones later drafted into the NFL?',choices:['All drafted players came from richer hometowns','Black draftees came from more disadvantaged hometowns than Black recruits who weren’t drafted, while white draftees came from less disadvantaged ones','Hometown made no difference for anyone'],correct:1,explain:'The pattern depends on the sport and on race, so it has to be measured, not assumed. Football tells a different story from Stephens-Davidowitz’s NBA finding for Black players, but in both studies where a player starts out shows up in who makes it.'},
  {lvl:'honors',instant:true,q:'A travel team costs $1,500 a year. If one coached hour costs about $25 (an assumption), how many coached hours does the fee buy?',choices:['About 37','About 60','About 150','About 600'],correct:1,explain:'Hours = dollars ÷ dollars per hour = 1,500 ÷ 25 = 60 hours a year. The same math says the $987 yearly spending gap between families earning $100,000+ and those under $50,000 buys about 39 more hours a year.'},
  {lvl:'ap',instant:true,q:'Stephens-Davidowitz estimated that each additional inch of height almost doubles a man’s chances of making the NBA. Treat it as exactly double. How many times as likely is someone 3 inches taller?',choices:['3 times','6 times','8 times','9 times'],correct:2,explain:'Doubling three times multiplies: 2 × 2 × 2 = 2³ = 8. This is exponential growth, so small differences in height matter a lot. He linked height partly to childhood nutrition, one more way money shapes who makes it.'},
  {lvl:'ap',instant:true,q:'In the tool’s made-up counties (equal births in each fifth), the rates are 1.0, 1.4, 1.9, 2.4 and 3.3 per 100,000. What is P(born in the poorest fifth | NBA player)?',choices:['1.0%','10%','20%','33%'],correct:1,explain:'With equal births, each fifth’s share of players is its rate over the total: 1.0 ÷ (1.0 + 1.4 + 1.9 + 2.4 + 3.3) = 1.0 ÷ 10.0 = 10%. P(poorest | pro) = 10%, while P(pro | poorest) is only 1 in 100,000. Mixing up the two is the base-rate fallacy.'},
  {lvl:'ap',instant:true,q:'Count any paid pro basketball job (the draft, the G League, overseas or undrafted). The NCAA puts that at about 21.8% of draft-eligible men’s players. Out of 10,000 high school players, about how many?',choices:['About 4','About 22','About 79','About 218'],correct:2,explain:'0.0363 × 0.218 × 10,000 ≈ 79. How you define “making the pros” changes the answer by more than 20 times (79 against 3.6), so always check what a statistic counts.'}
 ],
 tour:[
  {title:'10,000 players',text:'Each tiny dot is one high school men’s basketball player: 10,000 in all. Nobody has made the team yet: these are just the players.',focus:[[GX-6,GY-6,COLS*PITCH+12,ROWS*PITCH+12]],pause:true,setup:sim=>BioLab.setValues(sim,{view:'funnel',sport:'mbb'})},
  {title:'Step 1: college',text:'The blue dots play NCAA college basketball: about 363 of 10,000, or 3.6%. That share comes from dividing NCAA players by high school players.',focus:[[530,40,262,160]],pause:true},
  {title:'Step 2: the draft',text:'Of the NCAA players eligible for one draft, about 1.0% get drafted into the NBA. Multiply: 3.6% × 1.0% ≈ 0.036%, about 3.6 players per 10,000. The red rings mark them.',focus:[[530,150,262,170]],pause:true},
  {title:'Another sport',text:'Football has bigger rosters and a bigger draft: 8.1% play NCAA, 1.4% of those are drafted, about 11 per 10,000. Still about 1 in 890.',pause:true,setup:sim=>BioLab.setValues(sim,{sport:'fb',view:'funnel'})},
  {title:'Rates, not names',text:'To compare places, divide players by boys born there and multiply by 100,000. These counties are made up to show the method; real data (Stephens-Davidowitz, 2013) point the same way: richer counties produce more NBA players per boy.',focus:[[40,60,470,340]],pause:true,setup:sim=>BioLab.setValues(sim,{view:'county',count:'rate',sport:'mbb'})},
  {title:'The stories we hear',text:'Now count players instead of rates. The poorest fifth still supplies 10% of the players, and their stories get told the most. That is survivorship bias: the famous few hide the base rate.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'county',count:'players'})},
  {title:'What money buys',text:'Families earning $100,000 or more spend about $1,591 a year on a child’s main sport; families under $50,000 spend about $604. At an assumed $25 per coached hour, that is about 64 hours against 24.',focus:[[16,56,540,330]],pause:true,setup:sim=>BioLab.setValues(sim,{view:'reps',budget:1500,cost:25})}
 ],
 lab:{bio:'<p><b>Question:</b> Which sport gives a high school player the best odds of being drafted after college?</p><ol><li>Pick each sport in turn with <b>Sport</b>, with the real numbers showing.</li><li>Record a trial for each: the share who play NCAA, the share drafted, and the number per 10,000.</li><li>Rank the four sports.</li></ol><p>Write one sentence: does the sport with the most college players also have the best pro odds? Why might baseball look so different?</p>',
  honors:'<p><b>Question:</b> How much coaching does a family’s income buy?</p><ol><li>Open <b>What money buys</b>. Set the cost per hour to $15, $25 and $50.</li><li>For each, record the hours a year for the bottom and top income groups and the gap.</li><li>Find the cost per hour at which the gap is 20 hours a year.</li></ol><p>Explain why the gap shrinks as the cost per hour rises, and why the ratio (2.6 times) does not.</p>',
  ap:'<p><b>Question:</b> When can P(poor | pro) be large while P(pro | poor) is tiny?</p><ol><li>On <b>Where players are born</b>, switch between the rate and the share of players.</li><li>Use Bayes’ rule to write P(poorest fifth | pro) from the five rates and equal births.</li><li>Now suppose the poorest fifth had twice as many births. Recompute the share by hand.</li></ol><p><b>CER:</b> Claim, evidence from your numbers, and reasoning about base rates and survivorship bias.</p>'},
 terms:[
  {t:'Conditional probability',d:'The chance of something given that something else already happened: P(drafted | plays NCAA) counts only NCAA players.'},
  {t:'Base rate',d:'How common something is in the whole group before you look at any one case: about 3.6 in 10,000 for high school basketball players reaching the NBA.'},
  {t:'Rate per 100,000',d:'A count divided by the size of the group, times 100,000, so big and small places can be compared fairly.'},
  {t:'Survivorship bias',d:'Drawing conclusions only from the cases that made it through (the stars) and ignoring the many that didn’t.'},
  {t:'Multiplication rule',d:'P(A and B) = P(A) × P(B | A). Each step of the funnel multiplies by the share who make the next step.',lvl:'honors'},
  {t:'Selection bias',d:'When the cases you see are not a random sample of everyone, so their pattern can mislead.',lvl:'honors'},
  {t:'Bayes’ rule',d:'P(A | B) = P(B | A) × P(A) ÷ P(B). It turns P(pro | poor) into P(poor | pro) using how common each group is.',lvl:'ap'}
 ],
 about:'<p><b>The odds.</b> NCAA Research, “Estimated probability of competing in college athletics,” high school counts from the NFHS 2024-25 participation survey and NCAA counts from the 2024-25 Sports Sponsorship and Participation Rates Report (<a href="https://www.ncaa.org/sports/2013/12/17/probability-of-competing-beyond-high-school.aspx" target="_blank" rel="noopener">ncaa.org</a>, page updated 2026). High school to NCAA: men’s basketball 540,704 to 19,617 (3.6%); women’s basketball 356,240 to 16,823 (4.7%); football 1,029,588 to 83,794 (8.1%); baseball 472,598 to 41,580 (8.8%); men’s soccer 484,908 to 28,746 (5.9%); women’s soccer 393,048 to 31,200 (7.9%). The NCAA divides one year’s counts, which assumes high school and college rosters turn over at about the same rate, and counts only high school teams, not club-only players. '+
  'NCAA Research, “Estimated probability of competing in professional athletics,” updated March 2026 (<a href="https://www.ncaa.org/about/resources/research/estimated-probability-competing-professional-sports" target="_blank" rel="noopener">ncaa.org</a>). Draft-eligible players are estimated as NCAA participants ÷ 4.5. NCAA players drafted: 43 of 58 picks in the 2024 NBA Draft (1.0%); 30 of 36 in the 2024 WNBA Draft (0.8%); 257 of 257 in the 2025 NFL Draft (1.4%); 452 of 615 in the 2025 MLB Draft (4.9%). Counting any paid pro job, including international leagues, the G League and undrafted players: men’s basketball 21.8%, women’s basketball 9.1%. The NCAA does not calculate pro odds for soccer, because players have many professional paths (such as MLS and USL). This tool multiplies the two steps, so it counts only the college route: many MLB picks come straight from high school, and some NBA picks are international players.</p>'+
  '<p><b>Where players are born.</b> Seth Stephens-Davidowitz, “In the N.B.A., ZIP Code Matters,” <i>The New York Times</i>, November 3, 2013 (<a href="https://www.nytimes.com/2013/11/03/opinion/sunday/in-the-nba-zip-code-matters.html" target="_blank" rel="noopener">nytimes.com</a>; reprinted by the <a href="https://www.startribune.com/rags-to-riches-isn-t-common-not-even-in-the-nba/230527961/" target="_blank" rel="noopener">Star Tribune</a>, November 4, 2013; discussed on WBUR’s <a href="https://www.wbur.org/onlyagame/2013/11/09/davidowitz-nba" target="_blank" rel="noopener">Only A Game</a>, November 9, 2013, and <a href="https://freakonomics.com/?p=105278" target="_blank" rel="noopener">Freakonomics</a>, 2013). He combined CDC birth data by county and race, player data from basketball-reference.com and census per capita income to compute the probability of reaching the NBA, by race, in every U.S. county. He found growing up in a wealthier neighborhood “a major, positive predictor” for both Black and white men, with similar results after removing sons of NBA players. Searching records on the parents of the 100 top-scoring Black players born in the 1980s, he estimated they were about 30% less likely than the average Black man to have been born to an unmarried or teenage mother. He estimated that “each additional inch almost doubles your chances,” and linked height partly to childhood nutrition. He described LeBron James, born to a low-income teenage mother, as a remarkable exception; on WBUR he described Michael Jordan as coming from a middle-class, two-parent home. <b>The county bars in this tool are invented</b> to show how a rate per 100,000 works; only their direction comes from his finding.</p>'+
  '<p><b>Football is different.</b> Richard Allison, Adrienne Davis and Raymond Barranco, “A comparison of hometown socioeconomics and demographics for black and white elite football players in the US,” <i>International Review for the Sociology of Sport</i> 53(5), 615–629, 2018 (<a href="https://doi.org/10.1177/1012690216674936" target="_blank" rel="noopener">doi.org/10.1177/1012690216674936</a>; summary at <a href="https://thesocietypages.org/engagingsports/2018/01/11/assessing-the-patterns-race-class-and-opportunities-in-american-football/" target="_blank" rel="noopener">The Society Pages</a>, 2018). They matched 929 Black and white players from ESPN’s top-ranked recruits (2007–2016) to 2000 Census data on their hometowns. Black players’ hometowns were more disadvantaged than the national average and white players’ less so. Black NFL draftees came from more disadvantaged hometowns than Black recruits who weren’t drafted; white draftees came from less disadvantaged hometowns than white recruits who weren’t. The link between money and making it is real but not the same in every sport, which is why it has to be measured.</p>'+
  '<p><b>What money buys.</b> Aspen Institute Project Play with Utah State University and Louisiana Tech University, 2024 National Youth Sports Parent Survey (1,848 parents, fielded November–December 2024; <a href="https://projectplay.org/news/2025/2/24/project-play-survey-family-spending-on-youth-sports-rises-46-over-five-years" target="_blank" rel="noopener">announcement</a>, 2025; <a href="https://aspeninstitute.org/wp-content/uploads/2025/03/National-Youth-Sports-Parent-Survey-FINAL.pdf" target="_blank" rel="noopener">full report</a>, 2025). Average yearly spending on a child’s primary sport: $1,016 overall, up 46% since 2019. By household income: $604 under $50,000; $961 for $50,000–$99,999; $1,591 for $100,000 and up (report’s income table). Share whose primary sport is played on a travel, elite or club team: 13.0%, 14.9% and 25.8%. Months a year of scheduled practices or games: 4.98, 5.70 and 6.07. Days a week in season did not differ significantly by income. Project Play’s State of Play 2024 reports that children from the lowest-income homes play sports at up to half the rate of those from the highest-income group (<a href="https://projectplay.org/state-of-play-2024-participation-trends" target="_blank" rel="noopener">projectplay.org</a>, 2024).</p>'+
  '<p><b>Assumptions.</b> The cost per coached hour ($25 to start) is an assumption for illustration: real costs vary widely, and money also buys travel, gear and camps, not only coaching. Reps also depend on time, rides, safe places to play and a parent’s work schedule, which this simple model leaves out. This is a simplified model, not financial advice. None of this says a dream is foolish: about 1 in 28 high school basketball players and 1 in 12 football players go on to play NCAA sports. The point is that opportunity is unequal, and that can be measured. Your budget stays in this page; nothing is saved or sent.</p>'+
  '<p><b>See also:</b> <a href="#zipscores">Test scores by ZIP code</a> and <a href="#opportunity">Measuring opportunity</a> in this section, and <a href="https://rjedtech.github.io/Raider-SportsMedLab/" target="_blank" rel="noopener">Raider SportsMedLab</a> for the body science of training, growth and injury.</p>'
};
BioLab.register(SIM);
})();
