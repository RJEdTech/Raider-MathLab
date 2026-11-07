(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,axes,atLeast}=BioLab.h;
/* Free lunch for every student in a fall sport or a club. Each grade is a fixed, made-up set of counts:
   N students, S on the fall-sport rosters, C on the club rosters, B on both. Dot positions in the Venn diagram
   come from a seeded generator, so the picture is the same every time. Juniors are built to be exactly independent. */
const PRICE=10;
const GRADES={
 soph:{l:'Sophomores',w:'sophomores',N:220,S:104,C:92,B:38,seed:22011},
 junior:{l:'Juniors',w:'juniors',N:200,S:90,C:80,B:36,seed:20023},
 fresh:{l:'Freshmen',w:'freshmen',N:240,S:130,C:98,B:62,seed:24037}
};
const GORDER=['soph','junior','fresh'];
function cntOf(g){const G=GRADES[g]||GRADES.soph,so=G.S-G.B,co=G.C-G.B,ne=G.N-G.S-G.C+G.B;
 return {G,N:G.N,S:G.S,C:G.C,B:G.B,so,co,ne,need:so+co+G.B,nS:G.N-G.S,nC:G.N-G.C};}
/* Venn geometry (logical px) */
const VX=410,VY=40,VW=378,VH=340,CL={x:545,y:210},CR={x:655,y:210},RAD=118;
const PILLS={so:[480,210],b:[600,210],co:[720,210],ne:[452,356]};
const KEEPOUT=[[446,176,514,244],[566,176,634,244],[686,176,754,244],[414,334,492,378],[600,348,788,380],[410,40,788,90]];
function regionAt(x,y){const l=Math.hypot(x-CL.x,y-CL.y)<RAD,r=Math.hypot(x-CR.x,y-CR.y)<RAD;return l&&r?'b':l?'so':r?'co':'ne';}
function okSpot(x,y){if(x<VX+8||x>VX+VW-8||y<VY+8||y>VY+VH-8)return false;
 if(Math.abs(Math.hypot(x-CL.x,y-CL.y)-RAD)<6||Math.abs(Math.hypot(x-CR.x,y-CR.y)-RAD)<6)return false;
 return !KEEPOUT.some(b=>x>b[0]&&x<b[2]&&y>b[1]&&y<b[3]);}
function makeSt(g){const c=cntOf(g),r=rng(c.G.seed),dots=[];
 const want={b:c.B,so:c.so,co:c.co,ne:c.ne},box={b:[CR.x-RAD,CL.y-RAD,CL.x+RAD,CL.y+RAD],so:[CL.x-RAD,CL.y-RAD,CL.x+RAD,CL.y+RAD],co:[CR.x-RAD,CR.y-RAD,CR.x+RAD,CR.y+RAD],ne:[VX,VY,VX+VW,VY+VH]};
 ['b','so','co','ne'].forEach(reg=>{let n=0,tries=0,D=11;const bx=box[reg];
  while(n<want[reg]){tries++;if(tries%3000===0)D=Math.max(6,D-1);if(tries>60000)break;
   const x=bx[0]+r()*(bx[2]-bx[0]),y=bx[1]+r()*(bx[3]-bx[1]);
   if(regionAt(x,y)!==reg||!okSpot(x,y))continue;
   if(dots.some(d=>(d.x-x)*(d.x-x)+(d.y-y)*(d.y-y)<D*D))continue;
   dots.push({x,y,reg});n++;}});
 return {grade:g,dots,peek:0};}
const st=sim=>{if(!sim.st||sim.st.grade!==sim.p.grade)sim.st=makeSt(sim.p.grade);return sim.st;};
const cnt=sim=>cntOf(sim.p.grade);
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
const shown=sim=>!!(sim.p.reveal||st(sim).peek>=2||(GS(sim)&&GS(sim).g));
const lvOf=sim=>shown(sim)?2:(st(sim).peek||0);
const pct=x=>(x*100).toFixed(1)+'%',d3=x=>x.toFixed(3);
/* The things you can highlight. reg: Venn regions; given: the restricted group for a conditional. */
const EV={
 sport:{reg:['so','b'],tot:['s','t'],num:c=>c.S,den:c=>c.N,known:true,w:'Fall sport',h:'P(sport)',a:'P(S)',kind:'Marginal: a row total over the grand total.',plain:'The whole Sport row, and the whole left circle.'},
 club:{reg:['b','co'],tot:['t','c'],num:c=>c.C,den:c=>c.N,known:true,w:'In a club',h:'P(club)',a:'P(C)',kind:'Marginal: a column total over the grand total.',plain:'The whole Club column, and the whole right circle.'},
 and:{reg:['b'],num:c=>c.B,den:c=>c.N,known:true,w:'Sport and club',h:'P(sport and club)',a:'P(S ∩ C)',kind:'Joint: one inside cell over the grand total.',plain:'One cell, and the middle of the Venn diagram.'},
 or:{reg:['so','b','co'],num:c=>c.need,den:c=>c.N,known:false,w:'Sport or club',h:'P(sport or club)',a:'P(S ∪ C)',kind:'Union: three cells, with the overlap counted once.',plain:'Everything inside the circles, the middle counted once.'},
 neither:{reg:['ne'],num:c=>c.ne,den:c=>c.N,known:false,w:'Neither',h:'P(neither)',a:'P(neither)',kind:'The complement of “sport or club”: 1 minus the union.',plain:'The one cell outside both circles.'},
 cgs:{reg:['b'],given:['so','b'],tot:['s','t'],num:c=>c.B,den:c=>c.S,known:true,w:'In a club, given a fall sport',h:'P(club | sport)',a:'P(C | S)',kind:'Conditional: only the Sport row counts.',plain:'Only the Sport row counts.'},
 sgc:{reg:['b'],given:['b','co'],tot:['t','c'],num:c=>c.B,den:c=>c.C,known:true,w:'In a fall sport, given a club',h:'P(sport | club)',a:'P(S | C)',kind:'Conditional: only the Club column counts.',plain:'Only the Club column counts.'}
};
const REGCELL={so:'s,x',b:'s,c',co:'n,c',ne:'n,x'};
const evOf=sim=>EV[sim.p.show]||null;
const evKnown=(sim,E)=>E.known||shown(sim);
function clearGut(sim){if(BioLab.gutClear)BioLab.gutClear(sim);}
/* wrap text into lines that fit maxW; returns the y after the last line */
function wrap(ctx,s,x,y,maxW,lh,o){ctx.font=(o.w||400)+' '+(o.s||13)+'px '+FONT;const words=s.split(' ');let line='';
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,y,o);y+=lh;line=wd;}else line=t;});
 if(line){txt(ctx,line,x,y,o);y+=lh;}return y;}
function cellVal(c,r,col){const T={'s,c':c.B,'s,x':c.so,'s,t':c.S,'n,c':c.co,'n,x':c.ne,'n,t':c.nS,'t,c':c.C,'t,x':c.nC,'t,t':c.N};return T[r+','+col];}
function rowTot(c,r){return r==='s'?c.S:r==='n'?c.nS:c.N;}
function knownCell(lv,r,col){const key=r+','+col;if(lv>=2)return true;if(['s,c','s,t','t,c','t,t'].includes(key))return true;return lv>=1&&(key==='s,x'||key==='n,c');}
function clipCircle(ctx,C,out){ctx.beginPath();if(out)ctx.rect(VX,VY,VW,VH);ctx.arc(C.x,C.y,RAD,0,Math.PI*2);ctx.clip(out?'evenodd':'nonzero');}
function fillRegion(ctx,reg,col,a){ctx.save();ctx.beginPath();ctx.rect(VX,VY,VW,VH);ctx.clip();
 if(reg==='b'){clipCircle(ctx,CL);clipCircle(ctx,CR);}else if(reg==='so'){clipCircle(ctx,CL);clipCircle(ctx,CR,true);}
 else if(reg==='co'){clipCircle(ctx,CR);clipCircle(ctx,CL,true);}else{clipCircle(ctx,CL,true);clipCircle(ctx,CR,true);}
 ctx.globalAlpha=a;ctx.fillStyle=col;ctx.fillRect(VX,VY,VW,VH);ctx.restore();}
/* lunch bars: 0 to 250 lunches across the left panel */
const BX0=20,BX1=380,BMAX=250,BXs=v=>BX0+clamp(v,0,BMAX)/BMAX*(BX1-BX0);
function statement(sim,E){const c=cnt(sim),G=c.G;if(!E)return null;
 if(!evKnown(sim,E))return {l1:`${E.w}: ? of ${c.N} ${G.w}`,l2:'Lock in your gut answer to see this count.',v:null};
 const n=E.num(c),d=E.den(c),v=n/d;
 if(atLeast('ap')){let l2=E.kind;if(sim.p.show==='or')l2=`= P(S) + P(C) − P(S ∩ C) = ${d3(c.S/c.N)} + ${d3(c.C/c.N)} − ${d3(c.B/c.N)}`;
  else if(sim.p.show==='cgs')l2=`= P(S ∩ C) / P(S) = ${d3(c.B/c.N)} / ${d3(c.S/c.N)}`;else if(sim.p.show==='sgc')l2=`= P(S ∩ C) / P(C) = ${d3(c.B/c.N)} / ${d3(c.C/c.N)}`;
  else if(sim.p.show==='neither')l2=`= 1 − P(S ∪ C) = 1 − ${d3(c.need/c.N)}`;
  return {l1:`${E.a} = ${n}/${d} ≈ ${d3(v)}`,l2,v};}
 if(atLeast('honors'))return {l1:`${E.h} = ${n}/${d} ≈ ${pct(v)}`,l2:E.kind,v};
 return {l1:`${E.w}: ${n} of ${d} ${G.w} (${pct(v)})`,l2:E.plain,v};}
function indepText(sim){const c=cnt(sim),a=c.B/c.S,b=c.C/c.N,eq=c.B*c.N===c.S*c.C,G=c.G;
 if(atLeast('ap'))return `P(C | S) = ${d3(a)} ${eq?'=':'≠'} P(C) = ${d3(b)}, so S and C are ${eq?'':'not '}independent. Same check: P(S ∩ C) = ${d3(c.B/c.N)} ${eq?'=':'≠'} P(S)·P(C) = ${d3(c.S/c.N*b)}.`;
 return `Club, given sport: ${c.B}/${c.S} = ${pct(a)}. Club, whole grade: ${c.C}/${c.N} = ${pct(b)}. `+(eq?`Equal, so sport and club are independent for these ${G.w}.`:`Not equal, so they are not independent: athletes here are ${a<b?'less':'more'} likely to be in a club.`);}
function orderRef(sim){const G=GS(sim);return G&&G.g?G.g.order:sim.p.order;}

const SIM={
 id:'lunchcount',hash:'lunchcount',apUnit:14,order:3,tab:'Lunches for two lists',kind:'Simulation',next:['rapidtest'],
 card:'Order lunches for everyone in a sport or a club by feel, then build the two-way table and Venn diagram to see who you counted twice.',
 title:'How many lunches? Counting two lists that overlap',
 lede:{bio:'Two rosters, one lunch per student. Some students are on both rosters, so adding the lists counts them twice. A two-way table and a Venn diagram put every student in exactly one spot.',
  honors:'A two-way table holds joint probabilities in its cells and marginal probabilities in its totals. “Or” uses the addition rule; “given” restricts you to one row or column; and two events are independent when P(A | B) = P(A).',
  ap:'General addition rule: P(A ∪ B) = P(A) + P(B) − P(A ∩ B). Conditional probability: P(A | B) = P(A ∩ B) / P(B). A and B are independent exactly when P(A | B) = P(A), or equivalently P(A ∩ B) = P(A)·P(B).'},
 scale:'One grade at a made-up high school, 200 to 240 students. Each dot in the Venn diagram is one student. The circles are not drawn to scale.',
 aspect:16/10,timeless:true,trials:true,graph:true,
 controlsTitle:'The lunch order',
 controls:[
  {id:'order',label:'Lunches to order',type:'range',min:50,max:250,step:1,def:100,unit:' lunches'},
  {id:'grade',label:'Which grade’s lunch',type:'seg',def:'soph',noGut:true,options:GORDER.map(g=>({v:g,l:GRADES[g].l})),onChange(sim){sim.st=makeSt(sim.p.grade);clearGut(sim);},help:'Each grade gets its own lunch. The counts are made up.'},
  {id:'show',label:'Highlight in both pictures',type:'seg',def:'none',noGut:true,options:[{v:'none',l:'Nothing'},{v:'sport',l:'Sport'},{v:'club',l:'Club'},{v:'and',l:'Sport and club'},{v:'or',l:'Sport or club'},{v:'neither',l:'Neither'},{v:'cgs',l:'Club, given sport',lvl:'honors'},{v:'sgc',l:'Sport, given club',lvl:'honors'}],help:'The same students light up in the table and in the Venn diagram.'},
  {id:'view',label:'The table shows',type:'seg',def:'count',lvl:'honors',noGut:true,options:[{v:'count',l:'Counts'},{v:'prop',l:'Share of grade'},{v:'row',l:'Row percents'}],help:'Share of grade: each count divided by the grade total (joint and marginal probabilities). Row percents: each count divided by its row total (the conditional distribution of club membership for each group).'},
  {id:'reveal',label:'Show every count now',type:'toggle',def:false,noGut:true,help:'Normally the missing counts appear once you lock in your gut answer.'}
 ],
 init(sim){return makeSt(sim.p.grade||'soph');},step(){},
 metrics:[
  {id:'need',label:'Students who get a lunch',unit:'students',d:0,min:0,max:250,get:sim=>shown(sim)?cnt(sim).need:null},
  {id:'off',label:'Your order is off by',unit:'lunches',d:0,min:0,max:200,get:sim=>shown(sim)?Math.abs(sim.p.order-cnt(sim).need):null},
  {id:'psel',label:'Highlighted probability',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>{const E=evOf(sim);if(!E||!evKnown(sim,E))return null;const c=cnt(sim);return 100*E.num(c)/E.den(c);}},
  {id:'indep',label:'Independence check',text:true,lvl:'honors',noTrial:true,get:indepText},
  {id:'addrule',label:'General addition rule',text:true,lvl:'ap',noTrial:true,get:sim=>{const c=cnt(sim);if(!shown(sim))return 'Lock in your gut answer to see the rule at work.';
   return `P(S ∪ C) = P(S) + P(C) − P(S ∩ C) = ${d3(c.S/c.N)} + ${d3(c.C/c.N)} − ${d3(c.B/c.N)} = ${d3(c.need/c.N)}. Times ${c.N} students: ${c.need} lunches.`;}}
 ],
 graphs:[{id:'share',label:'Share in a club, by group',custom:true}],defaultGraph:'share',
 plot(sim,ctx,box){const c=cnt(sim),sh=shown(sim);
  const ax=axes(ctx,box,{xmin:0,xmax:3,ymin:0,ymax:100,xl:'Group of students',yl:'In a club (%)',xcats:['Fall sport','No fall sport','Whole grade']});
  const vals=[100*c.B/c.S,sh?100*c.co/c.nS:null,100*c.C/c.N],y100=ax.Y(100),y0=ax.Y(0);
  vals.forEach((v,i)=>{const x0=ax.X(i+0.2),x1=ax.X(i+0.8);
   ctx.globalAlpha=.25;ctx.fillStyle=PAL['muted'];ctx.fillRect(x0,y100,x1-x0,y0-y100);ctx.globalAlpha=1;
   if(v===null){txt(ctx,'?',(x0+x1)/2,ax.Y(50),{s:16,w:700,c:PAL['cv-soft'],a:'center'});return;}
   ctx.fillStyle=i===2?PAL['s5']:PAL['s3'];ctx.fillRect(x0,ax.Y(v),x1-x0,y0-ax.Y(v));
   const inBar=v>=14;txt(ctx,v.toFixed(1)+'%',(x0+x1)/2,inBar?ax.Y(v/2)+5:ax.Y(v)-6,{s:13,w:700,c:inBar?'#fff':PAL['cv-ink'],a:'center'});});
  ctx.setLineDash([5,4]);ctx.strokeStyle=PAL['s5'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ax.X(0),ax.Y(vals[2]));ctx.lineTo(ax.X(3),ax.Y(vals[2]));ctx.stroke();ctx.setLineDash([]);},
 draw(sim,ctx,vdt,k){const c=cnt(sim),G=c.G,S=st(sim),lv=lvOf(sim),E=evOf(sim),big=k>1.3,sh=shown(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,500);
  const SP=PAL['s2'],CB=PAL['s3'],BO=PAL['s6'],HL=PAL['rj'];
  /* ---------- two-way table ---------- */
  txt(ctx,big?`Two-way table: ${c.N}`:`Two-way table: ${c.N} ${G.w}`,16,26,{s:14*k,w:700});
  const CX={c:166,x:258,t:346},RY={h:64,s:106,n:148,t:190},cw=88,ch=38;
  const hi=new Set(),given=E&&E.given?(sim.p.show==='cgs'?'row':'col'):null;
  const inGiven=(r,col)=>!given||(given==='row'?r==='s':col==='c');
  if(E){E.reg.forEach(r=>hi.add(REGCELL[r]));}
  ['s','n','t'].forEach(r=>['c','x','t'].forEach(col=>{const key=r+','+col;if(hi.has(key)){ctx.globalAlpha=.22;ctx.fillStyle=HL;rr(ctx,CX[col]-cw/2+3,RY[r]-ch/2,cw-6,ch,6);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=HL;ctx.lineWidth=2;ctx.stroke();}}));
  if(E&&E.tot){const [r,col]=E.tot;ctx.strokeStyle=HL;ctx.lineWidth=2;ctx.setLineDash([4,3]);rr(ctx,CX[col]-cw/2+3,RY[r]-ch/2,cw-6,ch,6);ctx.stroke();ctx.setLineDash([]);}
  if(given){ctx.strokeStyle=HL;ctx.lineWidth=2.5;ctx.setLineDash([7,5]);if(given==='row')rr(ctx,CX.c-cw/2-2,RY.s-ch/2-4,CX.t-CX.c+cw+4,ch+8,8);else rr(ctx,CX.c-cw/2-2,RY.s-ch/2-4,cw+4,RY.t-RY.s+ch+8,8);ctx.stroke();ctx.setLineDash([]);}
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;
  [[16,85,392,85],[16,169,392,169],[120,44,120,212],[302,44,302,212]].forEach(l=>{ctx.beginPath();ctx.moveTo(l[0],l[1]);ctx.lineTo(l[2],l[3]);ctx.stroke();});
  const hs=12*k;txt(ctx,'Club',CX.c,RY.h+5,{s:hs,w:700,c:CB,a:'center'});txt(ctx,'No club',CX.x,RY.h+5,{s:hs,w:700,a:'center'});txt(ctx,'Total',CX.t,RY.h+5,{s:hs,w:700,a:'center'});
  txt(ctx,'Sport',18,RY.s+5,{s:hs,w:700,c:SP});txt(ctx,'No sport',18,RY.n+5,{s:hs,w:700});txt(ctx,'Total',18,RY.t+5,{s:hs,w:700});
  const view=atLeast('honors')?sim.p.view:'count';
  ['s','n','t'].forEach(r=>['c','x','t'].forEach(col=>{const n=cellVal(c,r,col),kn=knownCell(lv,r,col);
   let s=kn?(view==='prop'?pct(n/c.N):view==='row'?pct(n/rowTot(c,r)):String(n)):'?';
   const isB=r==='s'&&col==='c',dim=given&&!inGiven(r,col);
   ctx.globalAlpha=dim?.35:1;txt(ctx,s,CX[col],RY[r]+6,{s:(view==='count'?15:13.5)*k,w:(isB||r==='t'||col==='t')?700:400,c:kn?(isB?BO:PAL['cv-ink']):PAL['cv-soft'],a:'center'});ctx.globalAlpha=1;}));
  /* ---------- lunch bars ---------- */
  const ls=12*k,yA=262,yB=324,bh=24,both=c.B;
  txt(ctx,big?`Add rosters: ${c.S} + ${c.C} = ${c.S+c.C}`:`Add the two rosters: ${c.S} + ${c.C} = ${c.S+c.C}`,BX0,yA-8,{s:ls,w:700});
  ctx.fillStyle=SP;ctx.fillRect(BXs(0),yA,BXs(c.S)-BXs(0),bh);ctx.fillStyle=CB;ctx.fillRect(BXs(c.S),yA,BXs(c.S+c.C)-BXs(c.S),bh);
  ctx.fillStyle=BO;ctx.fillRect(BXs(c.S-both),yA,BXs(c.S)-BXs(c.S-both),bh);ctx.fillRect(BXs(c.S),yA,BXs(c.S+both)-BXs(c.S),bh);
  ctx.strokeStyle=PAL['cv-bg'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(BXs(c.S),yA);ctx.lineTo(BXs(c.S),yA+bh);ctx.stroke();
  [c.S-both/2,c.S+both/2].forEach(v=>txt(ctx,String(both),BXs(v),yA+bh/2+1,{s:Math.min(12*k,17),w:700,c:'#fff',a:'center',b:'middle'}));
  const l2=lv>=2?(big?`Once each: ${c.so} + ${c.B} + ${c.co} = ${c.need}`:`Count each student once: ${c.so} + ${c.B} + ${c.co} = ${c.need}`):(big?'Once each: ?':'Count each student once: ?');
  txt(ctx,l2,BX0,yB-8,{s:ls,w:700});
  if(lv>=2){ctx.fillStyle=SP;ctx.fillRect(BXs(0),yB,BXs(c.so)-BXs(0),bh);ctx.fillStyle=BO;ctx.fillRect(BXs(c.so),yB,BXs(c.so+both)-BXs(c.so),bh);ctx.fillStyle=CB;ctx.fillRect(BXs(c.so+both),yB,BXs(c.need)-BXs(c.so+both),bh);
   txt(ctx,String(both),BXs(c.so+both/2),yB+bh/2+1,{s:Math.min(12*k,17),w:700,c:'#fff',a:'center',b:'middle'});}
  else{ctx.strokeStyle=PAL['line'];ctx.setLineDash([5,4]);ctx.lineWidth=1.5;ctx.strokeRect(BXs(0),yB,BXs(c.S+c.C)-BXs(0),bh);ctx.setLineDash([]);}
  const ya=360;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(BX0,ya);ctx.lineTo(BX1,ya);ctx.stroke();
  for(let v=0;v<=BMAX;v+=50){ctx.beginPath();ctx.moveTo(BXs(v),ya);ctx.lineTo(BXs(v),ya+5);ctx.stroke();txt(ctx,String(v),BXs(v),ya+8+11*k,{s:11*k,c:PAL['cv-soft'],a:'center'});}
  /* markers: your order (or locked gut) and, once shown, what you need */
  const Gs=GS(sim),go=orderRef(sim),gx=BXs(go),mx=BXs(c.need);
  const mark=(x,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash(dash?[6,4]:[]);ctx.beginPath();ctx.moveTo(x,yA-3);ctx.lineTo(x,yA+bh+3);ctx.moveTo(x,yB-3);ctx.lineTo(x,ya);ctx.stroke();ctx.setLineDash([]);};
  mark(gx,PAL['s4'],false);if(sh)mark(mx,HL,true);
  const lab=(s,x,y,col)=>{ctx.font='700 '+(12*k)+'px '+FONT;const w=ctx.measureText(s).width;txt(ctx,s,clamp(x,16+w/2,392-w/2),y,{s:12*k,w:700,c:col,a:'center'});};
  const yl1=ya+12+24*k,yl2=yl1+15*k;
  lab((Gs&&Gs.g?'Your gut: ':'Your order: ')+go,gx,yl1,PAL['s4']);
  if(sh)lab('You need: '+c.need,mx,Math.abs(gx-mx)<130?yl2:yl1,HL);
  if(sh){const d=go-c.need,s=d>0?`${d} extra: $${d*PRICE} wasted`:d<0?`${-d} student${d===-1?'':'s'} get no lunch`:'Exactly right: no waste';
   pill(ctx,s,204,476,d===0?PAL['s3']:HL,'#fff',13*Math.min(k,1.5));}
  /* ---------- Venn diagram ---------- */
  txt(ctx,'Venn diagram',VX,26,{s:14*k,w:700});
  ctx.fillStyle=PAL['cv-bg2'];rr(ctx,VX,VY,VW,VH,6);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.stroke();
  if(E){(E.given?['so','b','co','ne'].filter(r=>!E.given.includes(r)):[]).forEach(r=>fillRegion(ctx,r,PAL['cv-bg'],.75));
   E.reg.forEach(r=>fillRegion(ctx,r,HL,.25));}
  S.dots.forEach(d=>{const known=lv>=2||d.reg==='b'||(lv>=1&&(d.reg==='so'||d.reg==='co'));
   const col=!known?PAL['cv-soft']:d.reg==='b'?BO:d.reg==='so'?SP:d.reg==='co'?CB:PAL['muted'];
   const dim=E&&E.given&&!E.given.includes(d.reg);ctx.globalAlpha=(known?1:.45)*(dim?.3:1);ctx.fillStyle=col;ctx.beginPath();ctx.arc(d.x,d.y,3.4,0,7);ctx.fill();});
  ctx.globalAlpha=1;
  ctx.lineWidth=2.5;ctx.strokeStyle=SP;ctx.beginPath();ctx.arc(CL.x,CL.y,RAD,0,7);ctx.stroke();ctx.strokeStyle=CB;ctx.beginPath();ctx.arc(CR.x,CR.y,RAD,0,7);ctx.stroke();
  if(E&&E.given){const C=E.given.includes('so')?CL:CR;ctx.strokeStyle=HL;ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.beginPath();ctx.arc(C.x,C.y,RAD+4,0,7);ctx.stroke();ctx.setLineDash([]);}
  txt(ctx,`Fall sport: ${c.S}`,VX+12,70,{s:13*k,w:700,c:SP});txt(ctx,`Club: ${c.C}`,VX+VW-12,70,{s:13*k,w:700,c:CB,a:'right'});
  const ps=13*Math.min(k,1.6),pv={so:lv>=1?c.so:'?',b:c.B,co:lv>=1?c.co:'?',ne:lv>=2?c.ne:'?'};
  Object.keys(PILLS).forEach(r=>{const [x,y]=PILLS[r];pill(ctx,String(pv[r]),x,y,PAL['card'],r==='b'?BO:r==='so'?SP:r==='co'?CB:PAL['cv-ink'],ps);});
  txt(ctx,big?`All ${c.N}`:`All ${c.N} ${G.w}`,VX+VW-10,VY+VH-10,{s:12*k,c:PAL['cv-soft'],a:'right'});
  /* the highlighted probability, in words or symbols */
  const T=statement(sim,E);let y=404+4*k;
  if(T){y=wrap(ctx,T.l1,VX,y,VW,17*k,{s:13*k,w:700,c:HL});wrap(ctx,T.l2,VX,y,VW,16*k,{s:12*k,c:PAL['cv-soft']});}
  else wrap(ctx,big?'Pick a Highlight to light up the same students in both pictures.':'Pick something under Highlight: the same students light up in the table and in the Venn diagram.',VX,y,VW,16*k,{s:12*k,c:PAL['cv-soft']});},
 narrate(sim){const c=cnt(sim),G=c.G,s=sim.p.show;
  if(!shown(sim)){if(s==='cgs'||s==='sgc')return `${s==='cgs'?`Of the ${c.S} athletes, ${c.B} are in a club: ${pct(c.B/c.S)}`:`Of the ${c.C} club members, ${c.B} play a fall sport: ${pct(c.B/c.C)}`}. <b>“Given” means you look only at that group.</b> You still need the other counts to order lunches.`;
   return `The coaches’ rosters list ${c.S} ${G.w} in a fall sport, the club rosters list ${c.C}, and ${c.B} are on both. <b>How many different students is that?</b> Your order right now: ${sim.p.order} lunches.`;}
  if(s==='or')return `“Sport or club” means at least one of the two: everything inside the circles. ${c.S} + ${c.C} = ${c.S+c.C} counts the ${c.B} in the middle twice, so subtract them once: <b>${c.need} students</b>.`;
  if(s==='and')return `“Sport and club” means both at once: the middle of the Venn diagram and one cell of the table. <b>${c.B} of ${c.N}</b> ${G.w}.`;
  if(s==='sport')return `“Sport” is the whole Sport row and the whole left circle, overlap included: <b>${c.S} of ${c.N}</b>. ${c.B} of those ${c.S} are in the club circle too.`;
  if(s==='club')return `“Club” is the whole Club column and the whole right circle, overlap included: <b>${c.C} of ${c.N}</b>. ${c.B} of those ${c.C} are in the sport circle too.`;
  if(s==='neither')return `“Neither” is the one cell outside both circles: <b>${c.ne} of ${c.N}</b> ${G.w}. They get no lunch, which is right: they are on neither roster.`;
  if(s==='cgs')return `“Given sport” shrinks the world to the ${c.S} athletes. ${c.B} of them are in a club: <b>${pct(c.B/c.S)}</b>, against ${pct(c.C/c.N)} of the whole grade.`;
  if(s==='sgc')return `“Given club” shrinks the world to the ${c.C} club members. ${c.B} of them play a fall sport: <b>${pct(c.B/c.C)}</b>, against ${pct(c.S/c.N)} of the whole grade.`;
  return `Every student lands in exactly one cell of the table and one region of the Venn diagram: ${c.so} sport only, ${c.B} both, ${c.co} club only, ${c.ne} neither. <b>${c.so} + ${c.B} + ${c.co} = ${c.need} lunches.</b>`;},
 gut:{better:'lower',controls:['order'],lockLabel:'Lock in my order',mathLabel:'Show me the count',
  ask:{bio:'How many lunches should you order? Drag the slider here to your gut number, then lock it in. Every student on either roster gets exactly one lunch.',
   honors:'Before you fill in the table: drag the slider here to the number of lunches you would order, then lock it in. Every student on either roster gets exactly one.'},
  lock(sim){const c=cnt(sim),o=sim.p.order;return {v:Math.abs(o-c.need),order:o,label:`${o} lunches`};},
  solve(sim){const c=cnt(sim);sim.p.order=c.need;sim.p.show='or';return {v:0,order:c.need,label:`${c.need} lunches (${c.so} sport only + ${c.B} both + ${c.co} club only)`};},
  how:{bio:'Count each student once. Take the students on both rosters out of each roster to get “sport only” and “club only”. Then add sport only + both + club only. Adding the two rosters counts everyone on both lists twice.',
   honors:'The addition rule: students in a sport or a club = sport + club − both. As probabilities: P(sport or club) = P(sport) + P(club) − P(sport and club).',
   ap:'General addition rule: P(S ∪ C) = P(S) + P(C) − P(S ∩ C). Multiply by the number of students in the grade to get the count.'},
  compare(sim,g,m){const c=cnt(sim),d=g.order-c.need,sum=c.S+c.C;
   if(d===0)return `Your gut was right on: ${c.need} lunches, no waste and nobody left out. You already count the ${c.B} students on both rosters once, and the addition rule says why that works: ${c.S} + ${c.C} − ${c.B} = ${c.need}.`;
   if(d>0){let s=`You would order <b>${d} lunch${d===1?'':'es'} too many: $${d*PRICE} of food nobody eats</b>, at $${PRICE} a lunch.`;
    if(g.order===sum)s+=` That is exactly the ${c.B} students on both rosters, counted twice. Adding the two rosters is the classic mistake.`;
    else if(g.order>sum)s+=` That is more than even adding both rosters (${sum}), which already counts the ${c.B} on both lists twice.`;
    else s+=` The count is ${c.S} + ${c.C} − ${c.B} = ${c.need}: add the rosters, then take the ${c.B} on both lists out once.`;
    return s;}
   let s=`<b>${-d} student${d===-1?'':'s'} in a sport or a club would get no lunch.</b>`;
   if(g.order===c.need-c.B)s+=` You left out exactly the ${c.B} students on both rosters: they belong in the count once, not zero times.`;
   else if(g.order>=Math.max(c.S,c.C)-2&&g.order<=Math.max(c.S,c.C)+2)s+=` Ordering for one roster misses everyone who is only on the other one.`;
   else s+=` The count is ${c.S} + ${c.C} − ${c.B} = ${c.need}: add the rosters, then take the ${c.B} on both lists out once.`;
   return s;},
  again(sim){const i=GORDER.indexOf(sim.p.grade);sim.p.grade=GORDER[(i+1)%GORDER.length];sim.p.order=100;sim.p.reveal=false;sim.p.show='none';sim.st=makeSt(sim.p.grade);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'The band roster has 48 sophomores and the choir roster has 35. 12 students are in both. How many different students is that?',choices:['83','71','59'],correct:1,explain:'48 + 35 = 83 counts the 12 in both groups twice. 83 − 12 = 71: 36 band only, 23 choir only and 12 in both.'},
  {lvl:'bio',instant:true,q:'For the sophomores, how many play a fall sport but are not in a club?',choices:['104','66','38'],correct:1,explain:'104 − 38 = 66. The 104 on the coaches’ rosters include the 38 who are also in a club. In the Venn diagram, 66 is the part of the sport circle outside the overlap.'},
  {lvl:'bio',instant:true,q:'Add the four inside cells of the sophomore table: sport only, both, club only and neither. What do you get?',choices:['158, the students who get a lunch','220, every sophomore exactly once','196, the two rosters added'],correct:1,explain:'66 + 38 + 54 + 62 = 220. Each student lands in exactly one inside cell, which is what makes a two-way table a safe way to count.'},
  {lvl:'honors',instant:true,q:'Which of these is a joint probability for the sophomores?',choices:['P(sport) = 104/220','P(sport and club) = 38/220','P(club | sport) = 38/104'],correct:1,explain:'Joint means both at once: one inside cell over the grand total, 38/220 ≈ 17.3%. P(sport) = 104/220 ≈ 47.3% is marginal: a row total. P(club | sport) = 38/104 ≈ 36.5% is conditional: one cell over its row total.'},
  {lvl:'honors',instant:true,q:'What is P(club | sport) for the sophomores?',choices:['38/220 ≈ 17.3%','38/104 ≈ 36.5%','38/92 ≈ 41.3%'],correct:1,explain:'“Given sport” means you look only at the sport row: 104 students. 38 of them are in a club. 38/220 is the joint probability, and 38/92 is the reverse, P(sport | club).'},
  {lvl:'honors',instant:true,q:'Juniors: 90 of 200 play a fall sport, 80 are in a club, and 36 do both. Are “sport” and “club” independent for the juniors?',choices:['Yes: P(club | sport) = 36/90 = 40%, and P(club) = 80/200 = 40%','No: 36 is not equal to 80','No: the groups overlap, so they can’t be independent'],correct:0,explain:'Independent means knowing one does not change the chance of the other. 36/90 = 0.40 and 80/200 = 0.40, so being an athlete tells you nothing about club membership. Overlapping is not the same as being related.'},
  {lvl:'ap',instant:true,q:'P(A) = 0.5, P(B) = 0.4 and P(A ∪ B) = 0.7. Find P(A ∩ B). Are A and B independent?',choices:['0.2, and independent, since P(A)·P(B) = 0.2','0.2, and not independent, since they overlap','0.9, and not independent'],correct:0,explain:'P(A ∩ B) = P(A) + P(B) − P(A ∪ B) = 0.5 + 0.4 − 0.7 = 0.2. P(A)·P(B) = 0.5 × 0.4 = 0.2 = P(A ∩ B), so A and B are independent.'},
  {lvl:'ap',instant:true,q:'A and B are mutually exclusive, with P(A) = 0.3 and P(B) = 0.4. Are they independent?',choices:['Yes: mutually exclusive means independent','No: P(A ∩ B) = 0, but P(A)·P(B) = 0.12','You cannot tell without a table'],correct:1,explain:'Mutually exclusive means they can’t both happen, so P(A ∩ B) = 0 and P(A | B) = 0, not 0.3. Knowing B happened tells you A did not. Events with nonzero chances that are mutually exclusive are always dependent.'},
  {lvl:'ap',instant:true,q:'For the sophomores, P(S) = 104/220 and P(C) = 92/220. If sport and club were independent, about how many sophomores would do both?',choices:['38','About 43.5','About 92'],correct:1,explain:'Under independence, P(S ∩ C) = P(S)·P(C), so the count would be 220 × (104/220) × (92/220) = 104 × 92 / 220 ≈ 43.5. The real count is 38, so fewer athletes are in clubs than independence predicts.'}
 ],
 tour:[
  {title:'Two rosters',text:'The coaches’ rosters list 104 sophomores in a fall sport, and the club rosters list 92. Matching names, 38 sophomores are on both. That is all you know so far: the table has only those numbers, and the Venn diagram has 38 in the middle.',pause:true,setup:sim=>{BioLab.setValues(sim,{grade:'soph',show:'none',reveal:false,view:'count'});st(sim).peek=0;}},
  {title:'Sport only, club only',text:'The 104 athletes include the 38 who are also in a club, so 104 − 38 = 66 play a sport and are in no club. In the same way, 92 − 38 = 54 are in a club and play no fall sport. In the Venn diagram, those are the outer parts of the two circles.',pause:true,setup:sim=>{BioLab.setValues(sim,{grade:'soph',show:'none'});st(sim).peek=1;}},
  {title:'Fill in the rest',text:'220 − 104 = 116 sophomores play no fall sport. 54 of them are in a club, so 116 − 54 = 62 do neither: they sit outside both circles. Check: the No club column is 66 + 62 = 128, and 220 − 92 = 128 too.',pause:true,setup:sim=>{BioLab.setValues(sim,{grade:'soph',show:'neither'});st(sim).peek=2;}},
  {title:'Counting twice',text:'Adding the rosters, 104 + 92 = 196, counts the 38 students in the middle twice: once as athletes and once as club members. The two teal blocks in the top bar are those same 38 students. Order 196 lunches and 38 go to waste: $380.',pause:true,focus:[8,236,392,262],setup:sim=>{BioLab.setValues(sim,{grade:'soph',show:'or'});st(sim).peek=2;}},
  {title:'Each student once',text:{bio:'Count each student once: 66 + 38 + 54 = 158 lunches. That is the same as 104 + 92 − 38: add the two groups, then take the overlap out once. This is the addition rule.',
   ap:'Count each student once: 66 + 38 + 54 = 158 = 104 + 92 − 38. As probabilities, that is the general addition rule: P(S ∪ C) = P(S) + P(C) − P(S ∩ C) = 104/220 + 92/220 − 38/220 = 158/220 ≈ 0.718.'},pause:true,setup:sim=>{BioLab.setValues(sim,{grade:'soph',show:'or'});st(sim).peek=2;}},
  {lvl:'honors',title:'Joint and marginal',text:'P(sport and club) = 38/220 ≈ 17.3% is a joint probability: one inside cell, the middle of the Venn diagram. P(sport) = 104/220 ≈ 47.3% is a marginal probability: a row total, the whole sport circle.',pause:true,setup:sim=>{BioLab.setValues(sim,{grade:'soph',show:'and'});st(sim).peek=2;}},
  {lvl:'honors',title:'“Given” means restrict',text:'P(club | sport) asks about athletes only. Restrict to the 104 students in the Sport row, the sport circle. 38 of them are in a club: 38/104 ≈ 36.5%. Everyone outside that row drops out of the picture.',pause:true,setup:sim=>{BioLab.setValues(sim,{grade:'soph',show:'cgs'});st(sim).peek=2;}},
  {lvl:'honors',title:'Independent?',text:{honors:'In the whole grade, 92/220 ≈ 41.8% of sophomores are in a club, but only 36.5% of athletes are, so sport and club are not independent. Now look at the juniors: 36/90 = 40% of athletes are in a club, and 80/200 = 40% of all juniors. Knowing a junior plays a sport changes nothing: independent.',
   ap:'Sophomores: P(C | S) ≈ 0.365 but P(C) ≈ 0.418, so S and C are not independent. Juniors: P(C | S) = 36/90 = 0.40 = P(C) = 80/200. Independent, and the multiplication check agrees: P(S ∩ C) = 36/200 = 0.18 = 0.45 × 0.40.'},pause:true,setup:sim=>{BioLab.setValues(sim,{grade:'junior',show:'cgs'});st(sim).peek=2;}}
 ],
 onTourExit(sim){BioLab.setValues(sim,{grade:'soph',show:'none'});st(sim).peek=0;},
 thumbSetup(sim){sim.p.reveal=true;sim.p.show='or';},
 lab:{bio:'<p><b>Question:</b> How far off is adding the two rosters, and why?</p><ol><li>For each grade, record the sport roster, the club roster, the number on both, and <b>Students who get a lunch</b> (turn on <b>Show every count now</b>).</li><li>Work out sport + club for each grade and compare it with the real count.</li></ol><p>Write one sentence: how is the gap related to the number of students on both rosters?</p>',
  honors:'<p><b>Question:</b> In which grade are sport and club independent?</p><ol><li>For each grade, highlight <b>Club, given sport</b> and record the highlighted probability.</li><li>Highlight <b>Club</b> and record P(club) for the whole grade.</li><li>Repeat with <b>Sport, given club</b> and <b>Sport</b>.</li></ol><p>Explain how the two pairs of numbers tell the same story, and use the table’s Row percents to back it up.</p>',
  ap:'<p><b>Question:</b> Do the two independence checks always agree?</p><ol><li>For each grade, find P(C | S), P(C), P(S ∩ C) and P(S)·P(C).</li><li>Show algebraically that P(C | S) = P(C) exactly when P(S ∩ C) = P(S)·P(C).</li></ol><p><b>CER:</b> Claim which grades show independence, give evidence from your table, and reason from the definition of conditional probability. Then explain why two mutually exclusive events with nonzero chances can never be independent.</p>'},
 terms:[
  {t:'Two-way table',d:'A table of counts split two ways at once, here by fall sport (rows) and club (columns). Every student lands in exactly one inside cell.'},
  {t:'Venn diagram',d:'Overlapping circles inside a box that stands for everyone. The overlap holds the students in both groups; outside both circles is “neither”.'},
  {t:'Overlap (intersection)',d:'The students in both groups. In this tool, the 38 sophomores on both rosters.'},
  {t:'Double counting',d:'Counting the same person twice, as when you add two lists that overlap.'},
  {t:'Addition rule',d:'Number in A or B = number in A + number in B − number in both. In probability: P(A or B) = P(A) + P(B) − P(A and B).'},
  {t:'Joint probability',d:'The chance of two things at once, such as P(sport and club): one inside cell over the grand total.',lvl:'honors'},
  {t:'Marginal probability',d:'The chance of one thing, ignoring the other, such as P(sport): a row or column total over the grand total.',lvl:'honors'},
  {t:'Conditional probability',d:'P(A | B), the chance of A given that B happened: restrict to the B row or column, then divide by its total.',lvl:'honors'},
  {t:'Conditional distribution',d:'The percents across one row (or down one column) of a two-way table, such as the share of athletes in a club and not in a club.',lvl:'honors'},
  {t:'Independent events',d:'A and B are independent when P(A | B) = P(A): knowing B does not change the chance of A.',lvl:'honors'},
  {t:'Union and intersection',d:'A ∪ B means A or B (or both). A ∩ B means A and B.',lvl:'ap'},
  {t:'Complement',d:'A<sup>C</sup> means “not A”. P(A<sup>C</sup>) = 1 − P(A). “Neither” is the complement of S ∪ C.',lvl:'ap'},
  {t:'Mutually exclusive',d:'A and B cannot both happen: P(A ∩ B) = 0. Not the same as independent.',lvl:'ap'}
 ],
 about:'<p><b>Made-up counts.</b> The three grades and their rosters are invented for this tool, with sizes and percentages in a realistic range for one grade at a mid-size high school. The juniors are built to be exactly independent. The $10 boxed lunch is an illustrative price.</p><p>The model assumes every student on either roster gets exactly one lunch and that the rosters are complete and correct. Each dot in the Venn diagram is one student, placed at random inside its region by a fixed seed; the circles are not drawn to scale.</p><p>The independence check here is exact for these counts. With real survey data, a small gap between P(club | sport) and P(club) can happen by chance alone; deciding whether a gap is bigger than chance takes a chi-square test or a two-proportion test (Statistical inference).</p>'
};
BioLab.register(SIM);
})();
