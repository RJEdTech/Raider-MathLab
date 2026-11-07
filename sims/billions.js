(function(){
'use strict';
const {clamp,txt,rr,PAL,FONT,atLeast}=BioLab.h;
/* FY2026 federal budget, in billions of dollars: Treasury Monthly Treasury Statement, table 9, fiscal year ending Sep 30, 2026.
   Same numbers as the CivicsLab budget tool. "Everything else" is the remainder so the lines add to total outlays. */
const TOT=7395.8,REV=5403.3;
const POP=341.8e6;      /* U.S. resident population, July 1, 2025 (Census Bureau, Vintage 2025) */
const HH=134.79e6;      /* U.S. households, 2025 (Census Bureau, CPS ASEC, table HH-1) */
const GDP=31902;        /* CBO projection of FY2026 GDP, $ billions (Feb 2026 outlook, table 1-1) */
const DAYS=365;
const LINES=[
 {id:'ss',l:'Social Security',s:'Social Security',v:1667.1},
 {id:'mc',l:'Medicare',s:'Medicare',v:1072.6},
 {id:'int',l:'Net interest on the debt',s:'Net interest',v:1051.8},
 {id:'hl',l:'Health (mostly Medicaid)',s:'Health',v:1025.6},
 {id:'df',l:'National defense',s:'Defense',v:965.2},
 {id:'is',l:'Income security (includes SNAP)',s:'Income security',v:694.2},
 {id:'va',l:'Veterans',s:'Veterans',v:416.2},
 {id:'tr',l:'Transportation',s:'Transportation',v:142.9},
 {id:'ed',l:'Education, training and social services',s:'Education',v:107.6},
 {id:'ag',l:'Agriculture',s:'Agriculture',v:52.6},
 {id:'ia',l:'International affairs (all foreign aid plus State Dept.)',s:'International',v:48.0},
 {id:'ot',l:'Everything else',s:'Everything else',v:0}];
LINES[11].v=+(TOT-LINES.slice(0,11).reduce((a,b)=>a+b.v,0)).toFixed(1);
const L=id=>LINES.find(x=>x.id===id)||LINES[4];
const PICK=LINES.slice(0,11);
/* Unit costs: what one unit of a program costs. */
const PROG={
 snap:{l:'SNAP food benefits',unit:189.36*12,noun:'person-years of SNAP',what:'one person, one year, at the FY2025 average of $189.36 a month'},
 pell:{l:'Pell Grants',unit:7395,noun:'maximum Pell Grants',what:'one maximum Pell Grant, $7,395 (2026–27)'},
 f35:{l:'F-35 flying hours',unit:6.6e6,noun:'F-35 jet-years',what:'one Air Force F-35 flown for one year, about $6.6 million'}};
/* CBO's estimate of Public Law 119-21 (the 2025 reconciliation law), 2025–2034, relative to CBO's January 2025 baseline. */
const CBO={snap:-186.65,snapPeople:2.4e6,snapShift:41,def:149.5,yrs:10};
const SNAP_FY25=102.58;

/* ---------- the math ---------- */
const perYr=b=>b*1e9/POP;
const perDay=b=>perYr(b)/DAYS;
const hhMo=b=>b*1e9/HH/12;
const share=b=>b/TOT*100;
const lineA=sim=>L(sim.p.lineA),lineB=sim=>L(sim.p.lineB);
const truth=sim=>perDay(lineA(sim).v);
const hhScale=(sim,b)=>b/TOT*sim.p.hh;
const units=sim=>sim.p.chg*1e9/PROG[sim.p.prog].unit;

/* ---------- formatting ---------- */
const M=(v,d)=>(v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:d||0,maximumFractionDigits:d||0});
const B1=v=>(v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1})+'B';
const B0=v=>(v<0?'−':'')+'$'+Math.round(Math.abs(v)).toLocaleString('en-US')+'B';
const sB=v=>(v>0?'+':v<0?'−':'')+'$'+Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:2})+'B';
const cents=v=>Math.abs(v)<1?(v<0?'−':'')+(Math.abs(v)*100).toFixed(Math.abs(v)<0.1?1:0)+'¢':M(v,2);
const big=v=>{const a=Math.abs(v);return a>=1e9?(a/1e9).toFixed(2)+' billion':a>=1e6?(a/1e6).toFixed(2)+' million':Math.round(a).toLocaleString('en-US');};
const SUP={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','-':'⁻'};
const sup=n=>String(n).split('').map(c=>SUP[c]||c).join('');
function sci(dollars,d){const e=Math.floor(Math.log10(Math.abs(dollars)));return (dollars/Math.pow(10,e)).toFixed(d===undefined?2:d)+' × 10'+sup(e);}
const pct=(v,d)=>(v<0?'−':'')+Math.abs(v).toFixed(d===undefined?2:d)+'%';

/* ---------- state helpers ---------- */
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The per-person answers stay hidden before the lock (Guided) and while the student works them out ("Your turn"). */
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const hideAns=sim=>(sim.mode==='guided'&&!(sim.gutS&&sim.gutS.g))||pending(sim);
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function font(ctx,s,w){ctx.font=(w||400)+' '+s+'px '+FONT;}
function tw(ctx,s,sz,w){font(ctx,sz,w);return ctx.measureText(s).width;}
function wrap(ctx,s,x,y,maxW,lh,o){font(ctx,o.s,o.w);const words=s.split(' ');let line='',yy=y;
 words.forEach(w=>{const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){txt(ctx,line,x,yy,o);line=w;yy+=lh;}else line=t;});if(line)txt(ctx,line,x,yy,o);return yy;}
const W=800,H=500;

/* ---------- view: the number line ---------- */
function drawScale(sim,ctx,k){const log=sim.p.axis==='log',x0=60,x1=760,ph=k>1.35,rs=24*k,ly=Math.round(Math.max(30*k+3*rs+16,170));
 txt(ctx,log?'Log scale: each step is 10 times the one before':(ph?'Linear scale: $0 to $8 trillion':'Linear scale: $0 to $8 trillion, evenly spaced'),400,24*k,{s:15*k,w:700,a:'center'});
 const X=log?(v=>x0+(Math.log10(v*1e9)-6)/7*(x1-x0)):(v=>x0+v/8000*(x1-x0));
 ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,ly);ctx.lineTo(x1,ly);ctx.stroke();
 const ticks=log?[6,7,8,9,10,11,12,13].map(e=>({v:Math.pow(10,e-9),l:'10'+sup(e)})):[0,1,2,3,4,5,6,7,8].map(t=>({v:t*1000,l:'$'+t+'T'}));
 ticks.forEach(t=>{const x=X(Math.max(t.v,1e-12));ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,ly-6);ctx.lineTo(x,ly+6);ctx.stroke();
  if(!(ph&&!log&&t.v%2000))txt(ctx,t.l,x,ly+22*k,{s:12*k,c:PAL['cv-soft'],a:'center'});});
 if(log){[[6,'$1 million'],[9,'$1 billion'],[12,'$1 trillion']].forEach(([e,w])=>txt(ctx,w,X(Math.pow(10,e-9)),ly+40*k,{s:12*k,c:PAL['cv-soft'],a:'center'}));}
 const A=lineA(sim);
 const pts=[{v:0.001,l:'$1 million',c:PAL['s5']},{v:1,l:'$1 billion',c:PAL['s5']},{v:L('ia').v,l:(ph?'Intl. ':'International ')+B0(L('ia').v),c:PAL['cv-ink']},
  {v:TOT,l:(ph?'Total ':'All spending ')+(ph?'$7.4T':'$7,395.8B'),c:PAL['rj']}];
 if(A.id!=='ia')pts.push({v:A.v,l:A.s+' '+B0(A.v),c:PAL['s2']});
 if(sim.p.save>0)pts.push({v:sim.p.save,l:(ph?'Saving ':'Claimed saving ')+B0(sim.p.save),c:PAL['s4']});
 if(!log){const near=pts.filter(p=>p.v<150),far=pts.filter(p=>p.v>=150);
  if(near.length>1){pts.length=0;pts.push(...far,{v:0,l:(ph?near.map(p=>'$'+(p.v<1?'1M':p.v===1?'1B':Math.round(p.v)+'B')).join(', ')+': all at $0':near.map(p=>p.l).join(', ')+': all here'),c:PAL['s5'],left:true});}}
 /* greedy label rows above the line; leaders first, then labels on a background box so leaders never cross text */
 const rows=[ly-rs,ly-2*rs,ly-3*rs],last=rows.map(()=>-1e9),sz=12*k,placed=[];
 pts.sort((a,b)=>X(a.v)-X(b.v)).forEach(p=>{const x=X(p.v),w=tw(ctx,p.l,sz,700)+10;const cx0=p.left?Math.max(x0-10+w/2,w/2+4):clamp(x,w/2+4,W-w/2-4);let r=rows.findIndex((ry,i)=>cx0-w/2>last[i]);if(r<0)r=rows.length-1;
  const cx=p.left?Math.max(x0-10+w/2,w/2+4):clamp(x,w/2+4,W-w/2-4);last[r]=cx+w/2;placed.push({p,x,cx,w,y:rows[r]});});
 placed.forEach(o=>{ctx.strokeStyle=o.p.c;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(o.x,ly);ctx.lineTo(o.x,o.y);ctx.stroke();});
 placed.forEach(o=>{ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(o.cx-o.w/2,o.y-sz*0.6-3,o.w,sz*1.2+4);txt(ctx,o.p.l,o.cx,o.y,{s:sz,w:700,c:o.p.c,a:'center',b:'middle'});});
 placed.forEach(o=>{ctx.fillStyle=o.p.c;ctx.beginPath();ctx.arc(o.x,ly,5,0,7);ctx.fill();});
 /* what linear hides */
 let ny=ly+(log?40:22)*k;
 if(!ph){const note=log?'Equal steps mean equal multiplications: $1 million to $1 billion is 3 steps, and $1 billion to $1 trillion is 3 more. Every budget line fits between 10¹⁰ and 10¹³.':`On this line, $1 billion is ${((x1-x0)/8000).toFixed(4)} px wide, less than a tenth of a pixel. $1 million and $1 billion both sit on top of $0.`;
  ny=wrap(ctx,note,x0,ny+26*k,x1-x0,17*k,{s:12*k,c:PAL['cv-soft']});}
 /* time analogy, with the division shown */
 const ty=Math.round(ny+(ph?30:36)*k),cw=236,gap=14,gx0=(W-3*cw-2*gap)/2,ch=Math.min(H-ty-14,(ph?72:96)*k);
 txt(ctx,'If every dollar were one second:',x0,ty-4,{s:13*k,w:700});
 [['$1 million','10⁶ s',(1e6/86400).toFixed(1)+' days','10⁶ ÷ 86,400 s a day'],['$1 billion','10⁹ s',(1e9/86400/365.25).toFixed(1)+' years','10⁹ ÷ 31,557,600 s a year'],['$1 trillion','10¹² s',(Math.round(1e12/86400/365.25/100)*100).toLocaleString('en-US')+' years','10¹² ÷ 31,557,600 s a year']].forEach((r,i)=>{
  const x=gx0+i*(cw+gap),y=ty+6;ctx.fillStyle=PAL['card'];rr(ctx,x,y,cw,ch,8);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,x,y,cw,ch,8);ctx.stroke();
  txt(ctx,ph?r[0]:r[0]+' = '+r[1],x+cw/2,y+20*k,{s:13*k,w:700,a:'center'});
  txt(ctx,r[2],x+cw/2,y+46*k,{s:17*k,w:700,c:PAL['rj'],a:'center'});
  if(!ph)txt(ctx,r[3],x+cw/2,y+72*k,{s:12*k,c:PAL['cv-soft'],a:'center'});});}

/* ---------- view: per person ---------- */
function drawPeople(sim,ctx,k){const hide=hideAns(sim),A=lineA(sim),G=GS(sim),ph=k>1.35;
 const rows=LINES.concat([{id:'tot',l:'All federal spending',s:'All spending',v:TOT}]);
 const top=Math.round(18+30*k),rh=(H-top-8)/rows.length,sz=Math.min(12*k,rh-6);
 const cx=[20,ph?385:360,ph?520:500,ph?650:640,780];
 txt(ctx,'Line (FY2026)',cx[0],top-12,{s:12*k,w:700,c:PAL['cv-soft']});
 [[ph?'$B':'$ billions',1],[ph?'Per yr':'Per person/yr',2],[ph?'Per day':'Per person/day',3],[ph?'Home/mo':'Household/mo',4]].forEach(([t,i])=>txt(ctx,t,cx[i],top-12,{s:12*k,w:700,c:PAL['cv-soft'],a:'right'}));
 const maxD=perDay(L('ss').v);
 rows.forEach((r,i)=>{const y=top+i*rh,mid=y+rh/2,isA=r.id===A.id,isT=r.id==='tot';
  if(isA){ctx.fillStyle=PAL['s2'];ctx.globalAlpha=.16;ctx.fillRect(10,y+1,W-20,rh-2);ctx.globalAlpha=1;}
  if(isT){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(14,y+1);ctx.lineTo(W-14,y+1);ctx.stroke();}
  if(!isT&&!hide){const bw=Math.max(1,perDay(r.v)/maxD*120);ctx.fillStyle=isA?PAL['s2']:PAL['line'];ctx.globalAlpha=isA?.45:.7;ctx.fillRect(cx[3]-bw,y+3,bw,rh-6);ctx.globalAlpha=1;}
  const o={s:sz,w:isA||isT?700:400,b:'middle'};
  txt(ctx,ph?r.s:r.l.replace(' (all foreign aid plus State Dept.)',''),cx[0],mid,o);
  txt(ctx,ph?B0(r.v):B1(r.v),cx[1],mid,Object.assign({a:'right'},o));
  if(hide){['?','?','?'].forEach((q,j)=>txt(ctx,q,cx[2+j],mid,Object.assign({a:'right',c:PAL['cv-soft']},o)));return;}
  txt(ctx,M(perYr(r.v),ph?0:2),cx[2],mid,Object.assign({a:'right'},o));
  txt(ctx,M(perDay(r.v),2),cx[3],mid,Object.assign({a:'right',c:isA?PAL['s2']:PAL['cv-ink']},o));
  txt(ctx,M(hhMo(r.v),ph?0:2),cx[4],mid,Object.assign({a:'right'},o));});
 const head=pending(sim)?'Work out the per-day cost in Your turn to fill in the columns.':hide?'Lock in your answer to fill in the columns.':(G&&G.m?`The math: ${B1(A.v)} ÷ 341.8 million ÷ 365 = ${M(truth(sim),2)} a day. Your answer: ${M(G.g.guess,2)}.`:G&&G.g?`Your answer for ${A.s}: ${M(G.g.guess,2)} a day. The math: ${M(truth(sim),2)}.`:`Per person = dollars ÷ 341.8 million people. Per day = that ÷ 365.`);
 txt(ctx,head,400,top-12-20*k,{s:Math.min(12*k,12*k*740/Math.max(1,tw(ctx,head,12*k,700))),w:700,c:G&&G.g&&!pending(sim)?PAL['s4']:PAL['cv-soft'],a:'center'});}

/* ---------- view: the household scale model ---------- */
function drawHouse(sim,ctx,k){const X=sim.p.hh,ph=k>1.35,sz=12*k;
 txt(ctx,ph?`As a household spending ${M(X)} a year`:`If the federal budget were a household spending ${M(X)} a year`,400,24*k,{s:15*k,w:700,a:'center'});
 const inc=REV/TOT*X,bor=X-inc,y1=Math.round(36*k+14),bh=Math.round(16*k+6),x0=20,bw=760;
 ctx.fillStyle='#2f7d5b';ctx.fillRect(x0,y1,bw*inc/X,bh);ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.85;ctx.fillRect(x0+bw*inc/X,y1,bw*bor/X,bh);ctx.globalAlpha=1;
 txt(ctx,`It earns ${M(inc)}`,x0+8,y1+bh/2+1,{s:sz,w:700,c:'#fff',b:'middle'});
 txt(ctx,`borrows ${M(bor)}`,x0+bw-8,y1+bh/2+1,{s:sz,w:700,c:'#fff',a:'right',b:'middle'});
 const top=y1+bh+16+8*k,rh=(H-top-6)/12,max=L('ss').v,lw=ph?170:300,bx=x0+lw,bmax=ph?360:260;
 LINES.forEach((r,i)=>{const y=top+i*rh,mid=y+rh/2,v=hhScale(sim,r.v),isA=r.id===sim.p.lineA;
  txt(ctx,ph?r.s:r.l.replace(' (all foreign aid plus State Dept.)',''),x0,mid,{s:Math.min(sz,rh-5),w:isA?700:400,b:'middle'});
  ctx.fillStyle=isA?PAL['s2']:'#3f6fb0';ctx.fillRect(bx,y+3,Math.max(1.5,r.v/max*bmax),rh-6);
  txt(ctx,`${M(v)} a year`+(ph?'':`, ${M(v/12)} a month`),W-20,mid,{s:Math.min(sz,rh-5),w:isA?700:400,a:'right',b:'middle'});});}

/* ---------- view: a claimed saving ---------- */
function drawClaim(sim,ctx,k){const S=sim.p.save,A=lineA(sim),ph=k>1.35;
 txt(ctx,'All FY2026 federal spending as 1,000 squares',20,22*k,{s:14*k,w:700});
 txt(ctx,`Each square is ${B1(TOT/1000)}. Orange: the claimed saving. Blue outline: ${A.s}.`,20,22*k+18*k,{s:12*k,c:PAL['cv-soft']});
 const cols=50,cs=ph?11:15,gx=(W-cols*cs)/2,gy=Math.round(22*k+30*k),n=S/(TOT/1000);
 for(let i=0;i<1000;i++){const r=Math.floor(i/cols),c=i%cols,x=gx+c*cs,y=gy+r*cs;
  ctx.fillStyle=PAL['line'];ctx.globalAlpha=.55;ctx.fillRect(x+1,y+1,cs-2,cs-2);ctx.globalAlpha=1;
  const f=clamp(n-i,0,1);if(f>0){ctx.fillStyle=PAL['s4'];ctx.fillRect(x+1,y+1,(cs-2)*f,cs-2);}}
 const aN=A.v/(TOT/1000);ctx.strokeStyle=PAL['s2'];ctx.lineWidth=ph?1.5:2;
 for(let i=Math.floor(1000-aN);i<1000;i++){const r=Math.floor(i/cols),c=i%cols;ctx.strokeRect(gx+c*cs+1.5,gy+r*cs+1.5,cs-3,cs-3);}
 const ty=gy+20*cs+24*k,lh=21*k;
 const L1=[[`Claimed saving: ${B1(S)} a year = ${pct(share(S),2)} of all spending`,{s:14*k,w:700,c:PAL['s4']}],
  [`= ${M(perYr(S),2)} per person a year (${cents(perDay(S))} a day) = ${M(hhMo(S),2)} per household a month`,{s:12*k}],
  [`= ${pct(S/A.v*100,1)} of ${A.s} (${B1(A.v)})`,{s:12*k,w:700,c:PAL['s2']}]];
 let y=ty;L1.forEach(([t,o])=>{y=wrap(ctx,t,20,y,W-40,18*k,o)+lh;});}

/* ---------- view: policy impact in human units ---------- */
function drawImpact(sim,ctx,k){const P=PROG[sim.p.prog],c=sim.p.chg,u=units(sim),ph=k>1.35,sz=12*k;
 txt(ctx,`Your change: ${sB(c)} a year to ${P.l}`,400,26*k,{s:15*k,w:700,a:'center',c:c<0?PAL['s1']:c>0?PAL['s3']:PAL['cv-ink']});
 const y0=Math.round(40*k+18);
 const sg=c>0?'+':'';const tiles=[[big(u),P.noun],[sg+cents(perDay(c)),'per American per day'],[sg+pct(share(c),3),'of FY2026 spending']];
 const tw3=(W-40-2*12)/3;tiles.forEach((t,i)=>{const x=20+i*(tw3+12);ctx.fillStyle=PAL['card'];rr(ctx,x,y0,tw3,62*k,8);ctx.fill();ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;rr(ctx,x,y0,tw3,62*k,8);ctx.stroke();
  txt(ctx,(c<0&&i===0?'−':'')+t[0],x+tw3/2,y0+26*k,{s:17*k,w:700,a:'center',c:PAL['rj']});txt(ctx,t[1],x+tw3/2,y0+48*k,{s:sz,a:'center',c:PAL['cv-soft']});});
 txt(ctx,`Unit: ${P.what}.`,20,y0+62*k+20*k,{s:sz,c:PAL['cv-soft']});
 /* CBO worked example, both sides in the same units */
 const cy=Math.round(y0+62*k+44*k);
 txt(ctx,ph?'CBO estimate, Public Law 119-21 (2025–2034)':'Worked example: CBO’s estimate of Public Law 119-21, the 2025 reconciliation law (2025–2034)',20,cy,{s:13*k,w:700});
 const cw=(W-52)/2,ch=H-cy-16;
 const S=CBO.snap/CBO.yrs,D=CBO.def/CBO.yrs;
 const cards=[
  {h:'Nutrition (mostly SNAP)',col:PAL['s1'],rows:[['10-year change',B1(CBO.snap)],['Average per year',B1(S)],['Per American per day',cents(perDay(S))],['Share of FY2026 spending',pct(share(S),2)],['People (average month)','about 2.4 million fewer']]},
  {h:'Defense (Title II)',col:PAL['s3'],rows:[['10-year change','+'+B1(CBO.def)],['Average per year','+'+B1(D)],['Per American per day','+'+cents(perDay(D))],['Share of FY2026 spending','+'+pct(share(D),2)],['People','not estimated by CBO']]}];
 cards.forEach((cd,i)=>{const x=20+i*(cw+12),y=cy+10;ctx.fillStyle=PAL['card'];rr(ctx,x,y,cw,ch,8);ctx.fill();ctx.strokeStyle=cd.col;ctx.lineWidth=2;rr(ctx,x,y,cw,ch,8);ctx.stroke();
  txt(ctx,cd.h,x+12,y+20*k,{s:13*k,w:700,c:cd.col});
  const rws=ph?[cd.rows[0],cd.rows[2],cd.rows[4]]:cd.rows;
  const rh=(ch-30*k)/rws.length;rws.forEach((r,j)=>{const ry=y+30*k+j*rh+rh/2;
   if(ph){txt(ctx,r[0],x+12,ry-7*k,{s:12*k,c:PAL['cv-soft'],b:'middle'});txt(ctx,r[1],x+12,ry+8*k,{s:12*k,w:700,b:'middle'});}
   else{txt(ctx,r[0],x+12,ry,{s:12*k,c:PAL['cv-soft'],b:'middle'});txt(ctx,r[1],x+cw-12,ry,{s:12*k,w:700,a:'right',b:'middle'});}});});}

/* ---------- view: compare two lines ---------- */
function drawCompare(sim,ctx,k){const A=lineA(sim),Bl=lineB(sim),r=A.v/Bl.v,ph=k>1.35,sz=12*k;
 const big2=Math.max(A.v,Bl.v),x0=20,bmax=W-40;
 txt(ctx,r>=1?`${A.s} is ${r.toFixed(r<10?2:1)} times ${Bl.s}`:`${A.s} is ${(r*100).toFixed(1)}% of ${Bl.s}`,400,26*k,{s:16*k,w:700,a:'center'});
 [[A,PAL['s2'],58*k],[Bl,PAL['s4'],58*k+48*k]].forEach(([ln,col,y])=>{ctx.fillStyle=col;ctx.fillRect(x0,y,Math.max(2,ln.v/big2*bmax),20*k);
  txt(ctx,`${ln.s}: ${B1(ln.v)}`,x0,y-5,{s:sz,w:700,c:col});});
 /* blocks: how many of the smaller line fit in the bigger one */
 const small=A.v<=Bl.v?A:Bl,bigL=A.v<=Bl.v?Bl:A,n=bigL.v/small.v,by=Math.round(58*k+100*k+18);
 txt(ctx,`${bigL.s} split into blocks the size of ${small.s}: ${n.toFixed(1)} blocks`,x0,by,{s:13*k,w:700});
 const per=Math.min(40,Math.ceil(n)),rowsN=Math.ceil(Math.ceil(n)/per),bs=Math.min(28,(W-40)/per-3),bh=Math.min(20*k,Math.max(8,(H-by-130*k)/Math.max(1,rowsN)-3));
 for(let i=0;i<Math.ceil(n)&&i<400;i++){const rr2=Math.floor(i/per),cc=i%per,f=Math.min(1,n-i);ctx.fillStyle=bigL===A?PAL['s2']:PAL['s4'];ctx.globalAlpha=.8;ctx.fillRect(x0+cc*(bs+3),by+10+rr2*(bh+3),bs*f,bh);ctx.globalAlpha=1;}
 const ty=Math.round(by+10+rowsN*(bh+3)+26*k),d=perYr(A.v)-perYr(Bl.v);
 if(pending(sim)){txt(ctx,'Per American: work out your line in Your turn first.',x0,ty,{s:13*k});return;}
 txt(ctx,`Per American per year: ${M(perYr(A.v),2)} vs ${M(perYr(Bl.v),2)}`,x0,ty,{s:13*k});
 txt(ctx,`Difference: ${M(d,2)} a year, ${M(d/DAYS,2)} a day, per person`,x0,ty+22*k,{s:13*k,w:700});
 if(atLeast('ap'))txt(ctx,`log₁₀(${B1(A.v)} ÷ ${B1(Bl.v)}) = ${Math.log10(r).toFixed(3)} factors of 10 apart`,x0,ty+44*k,{s:13*k,c:PAL['s5'],w:700});}

/* ---------- view: logs and GDP ---------- */
function drawDeep(sim,ctx,k){const ph=k>1.35,A=lineA(sim),Bl=lineB(sim);
 const rows=PICK.concat([{id:'tot',l:'All spending',s:'All spending',v:TOT}]),top=Math.round(20+30*k),rh=(H-top-30*k-8)/rows.length,sz=Math.min(12*k,rh-5);
 const cx=[20,ph?380:400,ph?500:520,ph?650:650,780];
 [['Dollars, scientific notation',1],['log₁₀',2],[ph?'% budget':'% of budget',3],[ph?'% GDP':'% of GDP',4]].forEach(([t,i])=>txt(ctx,t,cx[i],top-12,{s:12*k,w:700,c:PAL['cv-soft'],a:'right'}));
 txt(ctx,'Line',cx[0],top-12,{s:12*k,w:700,c:PAL['cv-soft']});
 rows.forEach((r,i)=>{const y=top+i*rh,mid=y+rh/2,on=r.id===A.id||r.id===Bl.id,o={s:sz,w:on?700:400,b:'middle',c:r.id===A.id?PAL['s2']:r.id===Bl.id?PAL['s4']:PAL['cv-ink']};
  txt(ctx,r.s,cx[0],mid,o);txt(ctx,sci(r.v*1e9,ph?2:3),cx[1],mid,Object.assign({a:'right'},o));
  txt(ctx,Math.log10(r.v*1e9).toFixed(ph?2:3),cx[2],mid,Object.assign({a:'right'},o));
  txt(ctx,pct(share(r.v),ph?1:2),cx[3],mid,Object.assign({a:'right'},o));txt(ctx,pct(r.v/GDP*100,2),cx[4],mid,Object.assign({a:'right'},o));});
 txt(ctx,ph?`GDP (CBO projection): ${sci(GDP*1e9,3)}. Spending = ${pct(TOT/GDP*100,1)} of it.`:`GDP (FY2026, CBO projection): ${sci(GDP*1e9,3)} dollars. Spending is ${pct(TOT/GDP*100,1)} of GDP.`,20,H-12,{s:12*k,c:PAL['cv-soft']});}

const VIEWS={scale:drawScale,people:drawPeople,house:drawHouse,claim:drawClaim,impact:drawImpact,compare:drawCompare,deep:drawDeep};
function draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
 const key=[sim.p.view,sim.p.lineA,sim.p.lineB,sim.p.save,sim.p.prog,sim.p.chg,sim.p.hh,sim.p.axis].join('|');if(key!==sim._key){sim._key=key;sim.infoDirty=true;}
 (VIEWS[sim.p.view]||drawPeople)(sim,ctx,k);}

/* ---------- info panel: view notes, what the number hides, questions to ask ---------- */
const QUESTIONS='<div class="qcard"><h3>Questions to ask any number</h3><ul><li>Who counted, and how?</li><li>Who is missing?</li><li>Average or median?</li><li>Per what?</li><li>Compared to what?</li><li>What would change the answer?</li><li>What does this number hide?</li></ul></div>';
function info(sim){const v=sim.p.view,A=lineA(sim);let h='';
 if(v==='scale')h+=`<h3>Three words, three sizes</h3><p>Million = 10⁶. Billion = 10⁹. Trillion = 10¹². Each word is 1,000 times the one before. On a linear line, ${B1(A.v)} and $1 billion look like the same dot near zero next to ${B1(TOT)}. On a log line, each step is a factor of 10, so all of them fit.</p>`;
 if(v==='people')h+=`<h3>Per person, per day, per household</h3><p>Per person per year = line ÷ 341.8 million people. Per day = that ÷ 365. Per household per month = line ÷ 134.79 million households ÷ 12. ${hideAns(sim)?(pending(sim)?'Work out your line in Your turn first.':'Work out one row yourself before you lock in.'):`For ${A.s}: ${B1(A.v)} ÷ 341.8 million = ${M(perYr(A.v),2)} a year, or ${M(perDay(A.v),2)} a day.`}</p>`;
 if(v==='house')h+=`<h3>A scale model</h3><p>Every line is multiplied by the same factor: your household’s yearly spending ÷ ${B1(TOT)}. A scale model keeps every ratio the same, so the borrowed share (${pct((TOT-REV)/TOT*100,1)}) stays the same at any size. The number you type stays in this browser tab; nothing is saved or sent.</p><p class="help">A government is not a household: it can borrow for decades and its spending changes the economy around it. The model shows sizes, not how a government should budget.</p>`;
 if(v==='claim')h+=`<h3>Checking a claimed saving</h3><p>A claim says something will cost ${B1(sim.p.save)} less a year. Convert it first: share of all spending, per person, and against one line. Then check it later with actual outlays: the Treasury’s <a href="https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/" target="_blank" rel="noopener">Monthly Treasury Statement</a> reports what each agency and line actually spent. Compare the same months a year apart, and ask what else changed (inflation, how many people were eligible, one-time costs).</p><p class="help">A saving is measured against a baseline: what would have happened without the change. That baseline is itself an estimate, so a saving can be real even when outlays rise, or claimed even when outlays do not fall. The tool shows the method; it does not judge any particular claim.</p>`;
 if(v==='impact')h+=`<h3>Dollars ÷ cost per unit = units</h3><p>${B1(Math.abs(sim.p.chg))} ÷ ${M(PROG[sim.p.prog].unit,PROG[sim.p.prog].unit<1e4?2:0)} = ${big(Math.abs(units(sim)))} ${PROG[sim.p.prog].noun}.</p>
  <p><b>The worked example.</b> In July 2025 the Congressional Budget Office (CBO) estimated that Public Law 119-21 lowers federal nutrition spending, mostly SNAP, by $186.65B and raises defense spending by about $149.5B over 2025–2034, relative to CBO’s January 2025 baseline. CBO also estimated its SNAP work-requirement provisions lower participation by roughly 2.4 million people in an average month.</p>
  <p><b>Try the division:</b> the yearly average SNAP change, ${B1(CBO.snap/10)}, ÷ $2,272.32 per person-year is ${big(Math.abs(CBO.snap/10)*1e9/PROG.snap.unit)} person-years. That is not the same as CBO’s 2.4 million people. Part of the federal change shifts costs to states (CBO: about $41B over 2028–2034), and part comes from smaller average benefits (CBO projects $213 a month in 2034 instead of $227), not fewer people.</p>
  <p>CBO’s estimate is a model, not a count; see <b>About this model</b>. Weighing the policy is a question of values, which this tool does not score.</p>`;
 if(v==='compare')h+=`<h3>Ratio and difference</h3><p>Ratio = ${B1(A.v)} ÷ ${B1(lineB(sim).v)} = ${(A.v/lineB(sim).v).toFixed(2)}. Difference per person = (${B1(A.v)} − ${B1(lineB(sim).v)}) ÷ 341.8 million = ${M(perYr(A.v)-perYr(lineB(sim).v),2)} a year. A ratio says “how many times”; a difference says “how much more.” Both are true; they answer different questions.</p>`;
 if(v==='deep')h+=`<h3>Logs and GDP</h3><p>log₁₀ counts factors of 10. log₁₀(A) − log₁₀(B) = log₁₀(A ÷ B). Share of budget divides by spending (${B1(TOT)}); percent of GDP divides by the whole economy (${B1(GDP)}, a CBO projection). The same line looks about ${(GDP/TOT).toFixed(2)} times smaller as a percent of GDP.</p>`;
 h+=`<div class="qcard"><h3>What this number hides</h3><ul><li>A total hides who receives it. ${B1(L('ss').v)} for Social Security goes to retirees, survivors and people with disabilities, not to every American.</li><li>A per-person average spreads money over everyone, but most programs pay some people and not others. ${M(perYr(L('ss').v),0)} per person a year is not what any one person gets.</li><li>Nominal dollars hide inflation: a dollar in FY2026 buys less than a dollar did ten years earlier, so compare years with care.</li><li>One year hides the trend, and a 10-year total hides which years the money moves.</li></ul></div>`+QUESTIONS;
 return h;}

const SIM={
 id:'billions',hash:'billions',apUnit:4,order:8,tab:'Making sense of a billion',kind:'Simulation',
 prereq:['logscale'],
 skills:{bio:'Powers of ten and per-person rates: divide a total by a count · Algebra 1 (Unit 2)',honors:'Scientific notation, ratios and differences · Algebra 1 (Units 2 and 8)',ap:'Logarithms as orders of magnitude, and choosing a denominator · AP Precalculus (Unit 2B)'},
 card:'Guess what one part of the federal budget costs per American per day, then use powers of ten, log scales and per-person rates to see billions and trillions.',
 title:'Making sense of a billion',
 lede:{bio:'Million, billion, trillion: each is 1,000 times the last, but they all just sound like “a lot.” Turn them into dollars per person, per day, and per household, and you can see how big each one really is.',
  honors:'Scientific notation and per-person rates put every number on the same footing: 10⁹ dollars ÷ 3.418 × 10⁸ people ≈ $2.93 per person. Ratios and differences then compare any two lines fairly.',
  ap:'log₁₀ counts factors of 10, so log₁₀(A) − log₁₀(B) tells you how many orders of magnitude separate two numbers. Dividing by GDP instead of spending changes the denominator, and with it the story.'},
 scale:'The whole federal budget for FY2026 (Oct 1, 2025 to Sep 30, 2026), shared over 341.8 million U.S. residents and 134.79 million households.',
 aspect:1.6,timeless:true,trials:true,graph:false,
 controlsTitle:'Your numbers',
 controls:[
  {id:'view',label:'View',type:'seg',def:'people',noGut:true,options:[{v:'people',l:'Per person'},{v:'scale',l:'Number line'},{v:'house',l:'Household model'},{v:'claim',l:'A claimed saving'},{v:'impact',l:'Policy impact'},{v:'compare',l:'Compare two',lvl:'honors'},{v:'deep',l:'Logs and GDP',lvl:'ap'}]},
  {id:'guess',label:'Your answer: dollars per American per day',type:'range',min:0,max:20,step:0.05,def:1,unit:'',d:2,help:'For the highlighted line in the picture.'},
  {id:'lineA',label:'Budget line',type:'select',def:'df',noGut:true,onChange:clearGut,options:PICK.map(x=>({v:x.id,l:x.l}))},
  {id:'axis',label:'Number line',type:'seg',def:'lin',noGut:true,options:[{v:'lin',l:'Linear'},{v:'log',l:'Log'}],help:'Linear: equal steps add the same amount. Log: equal steps multiply by 10.'},
  {id:'hh',label:'Household model: yearly spending',type:'range',min:20000,max:200000,step:1000,def:80000,unit:'',d:0,noGut:true,help:'Use any number, even your family’s. It stays in this browser tab and is never saved or sent.'},
  {id:'save',label:'A claimed saving: billions of dollars a year',type:'range',min:1,max:500,step:1,def:50,unit:'',d:0,noGut:true},
  {id:'prog',label:'Policy impact: program',type:'seg',def:'snap',noGut:true,options:[{v:'snap',l:'SNAP'},{v:'pell',l:'Pell Grants'},{v:'f35',l:'F-35 flying'}]},
  {id:'chg',label:'Policy impact: change, billions of dollars a year',type:'range',min:-50,max:50,step:1,def:-10,unit:'',d:0,noGut:true},
  {id:'lineB',label:'Compare with',type:'select',def:'ia',noGut:true,lvl:'honors',options:PICK.map(x=>({v:x.id,l:x.l}))}
 ],
 actions:[
  {id:'cbosnap',label:'CBO example: SNAP change, yearly average',run(sim){BioLab.setValues(sim,{view:'impact',prog:'snap',chg:-19});}},
  {id:'cbodef',label:'CBO example: defense change, yearly average',run(sim){BioLab.setValues(sim,{view:'impact',prog:'f35',chg:15});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'peryr',label:'Chosen line per person, per year',unit:'$',d:2,min:0,max:null,get:sim=>pending(sim)?null:perYr(lineA(sim).v)},
  {id:'perday',label:'Chosen line per person, per day',unit:'$',d:2,min:0,max:null,get:sim=>pending(sim)?null:perDay(lineA(sim).v)},
  {id:'hhmo',label:'Chosen line per household, per month',unit:'$',d:2,min:0,max:null,get:sim=>pending(sim)?null:hhMo(lineA(sim).v)},
  {id:'share',label:'Chosen line, share of all spending',unit:'%',d:2,min:0,max:100,get:sim=>share(lineA(sim).v)},
  {id:'hhline',label:'Chosen line in the household model',unit:'$ a year',d:0,min:0,max:null,get:sim=>hhScale(sim,lineA(sim).v)},
  {id:'savshare',label:'Claimed saving, share of all spending',unit:'%',d:3,min:0,max:null,get:sim=>share(sim.p.save)},
  {id:'savpp',label:'Claimed saving per person, per year',unit:'$',d:2,min:0,max:null,get:sim=>perYr(sim.p.save)},
  {id:'units',label:'Policy change in program units',unit:'units',d:0,min:null,max:null,get:units},
  {id:'ratio',label:'Ratio: chosen line ÷ compared line',unit:'×',d:2,lvl:'honors',min:0,max:null,get:sim=>lineA(sim).v/lineB(sim).v},
  {id:'diffpp',label:'Difference per person, per year',unit:'$',d:2,lvl:'honors',min:null,max:null,get:sim=>pending(sim)?null:perYr(lineA(sim).v)-perYr(lineB(sim).v)},
  {id:'logdiff',label:'Factors of 10 apart (log₁₀ of the ratio)',unit:'',d:3,lvl:'ap',min:null,max:null,get:sim=>Math.log10(lineA(sim).v/lineB(sim).v)},
  {id:'gdp',label:'Chosen line, percent of GDP',unit:'%',d:2,lvl:'ap',min:0,max:null,get:sim=>lineA(sim).v/GDP*100}
 ],
 draw,infoPanel:info,
 narrate(sim){const v=sim.p.view,A=lineA(sim);
  if(v==='scale')return sim.p.axis==='log'?`<b>On a log line, equal steps multiply by 10.</b> ${A.s} (${B1(A.v)}) sits ${(Math.log10(A.v*1e9)-9).toFixed(2)} steps past $1 billion.`:`<b>On a linear line, $1 billion is a speck.</b> Next to all spending, ${B1(TOT)}, it takes up ${(1/TOT*100).toFixed(4)}% of the length.`;
  if(v==='people'){if(hideAns(sim))return `The highlighted line cost <b>${B1(A.v)}</b> in FY2026. Divide by 341.8 million people, then by 365 days, to find the cost per person per day.`;
   return `${A.s}: ${B1(A.v)} ÷ 341.8 million people = <b>${M(perYr(A.v),2)} per person a year</b>, or ${M(perDay(A.v),2)} a day.`;}
  if(v==='house')return `Scaled to a household spending ${M(sim.p.hh)} a year, ${A.s} is <b>${M(hhScale(sim,A.v))} a year</b>, and the household borrows ${M(sim.p.hh*(TOT-REV)/TOT)} of it.`;
  if(v==='claim')return `A ${B1(sim.p.save)} saving is <b>${pct(share(sim.p.save),2)} of all spending</b>: ${M(perYr(sim.p.save),2)} per person a year, ${pct(sim.p.save/A.v*100,1)} of ${A.s}.`;
  if(v==='impact'){const P=PROG[sim.p.prog];return sim.p.chg===0?'Move the change slider to turn dollars into units of a program.':`${sB(sim.p.chg)} a year ÷ ${M(P.unit,P.unit<1e4?2:0)} per unit = <b>${big(units(sim))} ${P.noun}</b> ${sim.p.chg<0?'fewer':'more'}, about ${cents(perDay(Math.abs(sim.p.chg)))} per American per day.`;}
  if(v==='compare'){const r=A.v/lineB(sim).v;return `<b>Ratio ${r.toFixed(2)}</b>, difference ${M(perYr(A.v)-perYr(lineB(sim).v),2)} per person a year. The ratio says how many times; the difference says how much more.`;}
  return `${A.s} is ${sci(A.v*1e9,3)} dollars, so log₁₀ = ${Math.log10(A.v*1e9).toFixed(3)}. It is <b>${pct(share(A.v),2)} of the budget</b> but only ${pct(A.v/GDP*100,2)} of GDP.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'The highlighted line in the picture shows what one part of the federal budget cost in FY2026. About 341.8 million people live in the U.S. What do you think it cost <b>per person, per day</b>? Set <b>Your answer</b> by feel, then lock it in.',
   honors:'The highlighted line shows one part of the FY2026 federal budget. Before any arithmetic, set <b>Your answer</b> to your gut for its cost in dollars per person per day. Then lock it in.'},
  hint:{bio:'Lock in your gut answer. Then you will divide it out yourself.'},
  calc:{unit:'$',d:2,tol:a=>Math.max(0.01,0.01*a),
   prompt:{bio:sim=>{const A=lineA(sim);return `${A.l} cost <b>${B1(A.v)}</b> in FY2026: $${(A.v*1e9).toLocaleString('en-US')}. About <b>341,800,000</b> people live in the U.S. Divide by the number of people, then by 365 days. What did it cost per person, per day?`;},
    honors:sim=>{const A=lineA(sim);return `${A.l} cost ${B1(A.v)} = ${sci(A.v*1e9,4)} dollars. The U.S. has 3.418 × 10⁸ people. Divide in scientific notation, then by 365 days. What is the cost per person, per day?`;}},
   answer:sim=>perDay(lineA(sim).v),
   hint:'First divide the dollars by 341,800,000 people to get dollars per person a year. Then divide by 365.',
   steps(sim){const A=lineA(sim),yr=perYr(A.v),out=[];
    if(atLeast('honors')){const a=A.v*1e9,e=Math.floor(Math.log10(a)),m=a/Math.pow(10,e);const q=m/3.418,nq=q<1?q*10:q,ne=q<1?e-9:e-8;out.push(`${sci(a,4)} ÷ (3.418 × 10⁸) = (${m.toFixed(4)} ÷ 3.418) × 10${sup(e-8)} = ${nq.toFixed(4)} × 10${sup(ne)} ≈ ${M(yr,2)} per person a year.`);}
    else out.push(`Per person per year: $${(A.v*1e9).toLocaleString('en-US')} ÷ 341,800,000 ≈ ${M(yr,2)}.`);
    out.push(`Per day: ${M(yr,2)} ÷ 365 ≈ <b>${M(yr/365,2)}</b> per person.`);
    return out;}},
  formula(sim){const A=lineA(sim);return atLeast('honors')?`${sci(A.v*1e9,4)} ÷ (3.418 × 10⁸ people) ÷ 365 days = ${M(perDay(A.v),2)} per person per day`:`${B1(A.v)} ÷ 341.8 million people ÷ 365 days = ${M(perDay(A.v),2)} per person per day`;},
  lock(sim){const g=sim.p.guess,t=truth(sim);return {v:Math.abs(g-t),guess:g,line:sim.p.lineA,label:`${M(g,2)} per person per day for ${lineA(sim).s}`};},
  solve(sim){const t=truth(sim);sim.p.guess=+t.toFixed(6);sim.p.view='people';return {v:Math.abs(sim.p.guess-t),guess:t,line:sim.p.lineA,label:`${M(t,2)} per person per day (${B1(lineA(sim).v)} ÷ 341.8 million ÷ 365)`};},
  how:{bio:'The math divides twice: the line ÷ 341.8 million people gives dollars per person per year, and ÷ 365 gives dollars per day.',
   honors:'In scientific notation: (line × 10⁹) ÷ (3.418 × 10⁸) ÷ 365. Dividing powers of ten subtracts exponents: 10⁹ ÷ 10⁸ = 10¹, so $1 billion is about $2.93 per person.'},
  compare(sim,g,m){const A=L(g.line),off=Math.abs(g.guess-m.guess),yr=off*DAYS,tot=off*DAYS*POP/1e9,ratio=g.guess/m.guess,K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You also divided it out yourself, so you can size any budget line this way.':'';
   if(off<0.05)return `Your answer was right on: ${M(g.guess,2)} against the real ${M(m.guess,2)} per person per day for ${A.s}. That is ${M(perYr(A.v),2)} per person a year, or ${M(hhMo(A.v),2)} per household a month.`+self;
   const near=LINES.filter(x=>x.v<=tot).sort((a,b)=>b.v-a.v)[0];
   return `You answered ${M(g.guess,2)} a day; the real figure is <b>${M(m.guess,2)}</b>, so you were ${g.guess>m.guess?ratio.toFixed(1)+' times too high':g.guess>0?(1/ratio).toFixed(1)+' times too low':'too low'}. A gap of ${M(off,2)} a day per person is ${M(yr,2)} per person a year, and across 341.8 million people it is <b>${B1(tot)} a year</b>${near?`, bigger than the whole ${near.s} line (${B1(near.v)})`:''}. Small per-person numbers add up to big totals.`+self;},
  again(sim){const o=PICK[Math.floor(Math.random()*PICK.length)];sim.p.lineA=o.id;sim.p.guess=1;sim.p.view='people';}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'Veterans’ programs cost $416.2 billion in FY2026, and 341.8 million people live in the U.S. What is that per person, per day, to the nearest cent?',answer:416.2e9/341.8e6/365,tol:0.01,unit:'$',d:2,hint:'Divide $416,200,000,000 by 341,800,000 people, then divide by 365 days.',explain:'$416,200,000,000 ÷ 341,800,000 ≈ $1,217.67 per person a year, and $1,217.67 ÷ 365 ≈ $3.34 a day.'},
  {lvl:'bio',instant:true,q:'If you counted one number every second, day and night, how long would it take to count to one billion?',choices:['About 11.6 days','About 3.2 years','About 31.7 years','About 317 years'],correct:2,explain:'1,000,000,000 ÷ 86,400 seconds a day ÷ 365.25 days a year ≈ 31.7 years. A million seconds is only 11.6 days: a billion is 1,000 times bigger, not a little bigger.'},
  {lvl:'bio',instant:true,q:'You draw all FY2026 federal spending ($7,395.8B) as a bar 700 pixels long. How wide is $1 billion on that bar?',choices:['About 0.09 pixels','About 1 pixel','About 9 pixels','About 95 pixels'],correct:0,explain:'700 ÷ 7,395.8 ≈ 0.095 pixels per billion. A screen cannot draw it. That is why a linear scale hides small numbers next to big ones, and why log scales exist.'},
  {lvl:'bio',instant:true,q:'A news story reports a claimed saving of $50 billion a year. What share of FY2026 federal spending is that?',choices:['About 0.68%','About 6.8%','About 50%'],correct:0,explain:'$50B ÷ $7,395.8B ≈ 0.0068, or 0.68%. Per person, it is about $146 a year, or 40 cents a day.'},
  {lvl:'honors',instant:true,q:'National defense was $965.2B and international affairs $48.0B. Which statement is true?',choices:['Defense is about 2 times international affairs','Defense is about 20 times international affairs, about $2,683 more per person a year','The two are within $100 per person a year'],correct:1,explain:'965.2 ÷ 48.0 ≈ 20.1. Per person: $965.2B ÷ 341.8 million ≈ $2,823.87 and $48.0B ÷ 341.8 million ≈ $140.43, a difference of about $2,683.44 a year.'},
  {lvl:'honors',instant:true,q:'Scale the budget to a household that spends $80,000 a year. About how much of that goes to net interest on the debt ($1,051.8B)?',choices:['About $1,138','About $11,377','About $21,553'],correct:1,explain:'$1,051.8B ÷ $7,395.8B ≈ 0.1422, and 0.1422 × $80,000 ≈ $11,377. ($21,553 is what that household would borrow.)'},
  {lvl:'ap',instant:true,q:'About how many factors of 10 separate $1 billion from Social Security ($1,667.1B)?',choices:['About 1.2','About 2.2','About 3.2','About 12.2'],correct:2,explain:'log₁₀(1,667.1 × 10⁹) ≈ 12.222 and log₁₀(10⁹) = 9, so they are 3.222 orders of magnitude apart: a factor of about 1,667.'},
  {lvl:'ap',instant:true,q:'National defense is 13.05% of FY2026 federal spending. Using CBO’s FY2026 GDP projection of $31,902B, what percent of GDP is it?',choices:['About 1.3%','About 3.0%','About 13.1%','About 30%'],correct:1,explain:'$965.2B ÷ $31,902B ≈ 3.03%. The line did not change; the denominator did. GDP is about 4.31 times total spending.'}
 ],
 tour:[
  {title:'Three words, three sizes',text:'Million = 10⁶, billion = 10⁹, trillion = 10¹². Each is 1,000 times the one before. Here they are on an ordinary, evenly spaced line from $0 to $8 trillion.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'scale',axis:'lin'})},
  {title:'Where did $1 billion go?',text:'On this line, $1 billion is less than a tenth of a pixel wide, and $1 million is a thousand times smaller still. They both sit on top of $0. A linear scale can show $7.4 trillion or $1 billion, not both.',pause:true,focus:[[10,90,260,110]]},
  {title:'Switch to a log line',text:'Now each step to the right multiplies by 10. $1 million to $1 billion is three steps; $1 billion to $1 trillion is three more. Every budget line fits on one line you can read.',pause:true,setup:sim=>BioLab.setValues(sim,{axis:'log'})},
  {title:'Seconds make it real',text:'Count one second per dollar: $1 million takes 11.6 days, $1 billion takes 31.7 years, and $1 trillion takes about 31,700 years.',pause:true,focus:[[20,255,760,150]]},
  {title:'Per person, per day',text:'$1,000,000,000 ÷ 341,800,000 ≈ $2.93 per person a year, less than one cent a day. Defense, $965.2B, is $2,823.87 per person a year, or $7.74 a day. The table does the same two divisions for every line.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'people',lineA:'df'})},
  {title:'A claimed saving, sized',text:'A $50 billion saving is 0.68% of all spending: about 7 of these 1,000 squares, or $146 per person a year. To check it later, compare actual outlays in the Monthly Treasury Statement.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'claim',save:50})},
  {title:'Dollars into people and things',text:'Divide a change by what one unit costs. CBO estimated that Public Law 119-21 lowers nutrition spending, mostly SNAP, by $186.65B over 10 years and raises defense by $149.5B. Per American per day, those are about 15¢ and 12¢.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'impact',prog:'snap',chg:-19})}
 ],
 lab:{bio:'<p><b>Question:</b> Which budget lines are bigger than they sound, and which are smaller?</p><ol><li>For three lines you have heard about, write your gut guess of the cost per person per day.</li><li>Work each one out on paper: line ÷ 341.8 million ÷ 365. Then pick that line under <b>Budget line</b> and record a trial to check yourself.</li><li>Switch the <b>Number line</b> view between Linear and Log.</li></ol><p>Write two sentences: which guess was farthest off, and which scale helped you see the lines better?</p>',
  honors:'<p><b>Question:</b> How do ratios and differences tell different stories about the same two numbers?</p><ol><li>In <b>Compare two</b>, pick two lines. Record the ratio and the difference per person.</li><li>Repeat for two pairs that have about the same ratio but very different differences.</li><li>Set a claimed saving and find which line it is closest to as a percent.</li></ol><p>Explain when a ratio is the fairer comparison and when a difference is. Use the questions card: compared to what?</p>',
  ap:'<p><b>Question:</b> How does the choice of denominator change what a number seems to say?</p><ol><li>In <b>Logs and GDP</b>, record log₁₀ for four lines and compute the factors of 10 between pairs.</li><li>Record each line as a share of spending and as a percent of GDP.</li><li>In <b>Policy impact</b>, convert CBO’s 10-year SNAP and defense changes to dollars per person per day and to shares of FY2026 spending.</li></ol><p><b>CER:</b> Claim which denominator best fits one question you choose, with evidence from your table and reasoning about what that denominator hides.</p>'},
 terms:[
  {t:'Order of magnitude',d:'A factor of 10. A billion (10⁹) is three orders of magnitude bigger than a million (10⁶).'},
  {t:'Scientific notation',d:'A number written as a × 10ⁿ with 1 ≤ a < 10. $965.2 billion = 9.652 × 10¹¹ dollars.'},
  {t:'Per capita',d:'Per person: a total divided by the number of people.'},
  {t:'Outlays',d:'Money the government actually spends in a year.'},
  {t:'Linear scale',d:'Equal distances mean equal amounts added.'},
  {t:'Log scale',d:'Equal distances mean equal multiplications, usually by 10.'},
  {t:'Ratio',d:'How many times one number is another: A ÷ B.',lvl:'honors'},
  {t:'Scale model',d:'A copy where every part is multiplied by the same factor, so all ratios stay the same.',lvl:'honors'},
  {t:'Baseline',d:'An estimate of what would happen with no change in law. Savings and costs are measured against it.',lvl:'honors'},
  {t:'Logarithm',d:'log₁₀(x) is the power of 10 that gives x. log₁₀(A) − log₁₀(B) = log₁₀(A ÷ B).',lvl:'ap'},
  {t:'Gross domestic product (GDP)',d:'The value of all goods and services produced in the country in a year.',lvl:'ap'}
 ],
 about:'<p><b>This is a simplified model for learning, not financial or policy advice.</b> It shows sizes; it does not say which choices are right. All arithmetic is done in this page.</p>'+
  '<p><b>FY2026 budget</b> (Oct 1, 2025 to Sep 30, 2026): outlays $7,395.8B and receipts $5,403.3B, with these lines: Social Security $1,667.1B, Medicare $1,072.6B, net interest $1,051.8B, Health (mostly Medicaid) $1,025.6B, national defense $965.2B, income security (SNAP, SSI, refundable credits, housing) $694.2B, veterans $416.2B, transportation $142.9B, education, training, employment and social services $107.6B, agriculture $52.6B, international affairs $48.0B. “Everything else” ($152.0B) is the remainder. Source: Treasury, Monthly Treasury Statement, table 9 (<a href="https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_9?filter=record_date:eq:2026-09-30" target="_blank" rel="noopener">Treasury Fiscal Data</a>), the same figures as the <a href="https://rjedtech.github.io/Raider-CivicsLab/#budget" target="_blank" rel="noopener">CivicsLab budget tool</a>.</p>'+
  '<p><b>People and households.</b> U.S. resident population 341.8 million on July 1, 2025 (Census Bureau, Vintage 2025 estimates, released Jan 27, 2026: <a href="https://www.census.gov/newsroom/press-releases/2026/population-growth-slows.html" target="_blank" rel="noopener">census.gov</a>). Households: 134.79 million in 2025 (Census Bureau, Current Population Survey, table HH-1: <a href="https://www.census.gov/data/tables/time-series/demo/families/households.html" target="_blank" rel="noopener">census.gov</a>). Per-person figures divide by residents, including children; per-day figures divide by 365.</p>'+
  '<p><b>GDP.</b> $31,902B for FY2026, CBO’s projection in <i>The Budget and Economic Outlook: 2026 to 2036</i>, table 1-1, Feb 2026 (<a href="https://www.cbo.gov/publication/61882" target="_blank" rel="noopener">cbo.gov</a>). It is a projection, not a final count.</p>'+
  '<p><b>Unit costs.</b> SNAP: average benefit $189.36 per person per month, 42.14 million people in an average month, total costs $102.58B, FY2025 (USDA Food and Nutrition Service, SNAP data tables, data as of Oct 9, 2026: <a href="https://www.fns.usda.gov/pd/supplemental-nutrition-assistance-program-snap" target="_blank" rel="noopener">fns.usda.gov</a>). Pell Grant: maximum award $7,395 for 2026–27 (Dept. of Education, GEN-26-01: <a href="https://fsapartners.ed.gov/knowledge-center/library/dear-colleague-letters/2026-01-30/2026-27-federal-pell-grant-maximum-and-minimum-award-amounts" target="_blank" rel="noopener">fsapartners.ed.gov</a>); about 7.26 million recipients with an average grant of $5,247 in 2024–25 (Dept. of Education, FY2026 budget justification, Student Financial Assistance: <a href="https://www.ed.gov/media/document/fy-2026-congressional-justification-student-financial-assistance-110145.pdf" target="_blank" rel="noopener">ed.gov</a>). F-35: about $6.6M per Air Force jet per year to operate (GAO-24-106703, the figure used in the CivicsLab budget tool). The tool has no per-service-member cost, because it found no single official figure to use. Units are for scale: real programs have overhead and rules.</p>'+
  '<p><b>CBO worked example.</b> CBO, <i>Estimated Budgetary Effects of Public Law 119-21</i>, July 21, 2025 (<a href="https://www.cbo.gov/publication/61570" target="_blank" rel="noopener">cbo.gov</a>), relative to CBO’s January 2025 baseline, 2025–2034: nutrition subtitle −$186.65B (as tabulated in CRS report R48552: <a href="https://www.everycrsreport.com/reports/R48552.html" target="_blank" rel="noopener">everycrsreport.com</a>); Title II defense provisions add about $149.5B to deficits (CRS Insight IN12580: <a href="https://www.congress.gov/crs_external_products/IN/PDF/IN12580/IN12580.4.pdf" target="_blank" rel="noopener">congress.gov</a>). Participation: roughly 2.4 million fewer SNAP participants in an average month from the work-requirement provisions; section 10105 shifts about $41B to states over 2028–2034; average benefit $213 instead of $227 in 2034 (CBO, Aug 11, 2025: <a href="https://www.cbo.gov/system/files/2025-08/61367-SNAP.pdf" target="_blank" rel="noopener">cbo.gov</a>). The yearly averages in this tool divide the 10-year totals by 10; CBO’s year-by-year amounts differ, and the CBO example buttons round them to whole billions.</p>'+
  '<p><b>A CBO estimate is a model.</b> It assumes how people and states will respond, it covers a fixed 10-year window, each provision is estimated alone, and CBO uses a range of possible state responses. Real outlays will differ. Supporters of these changes pointed to lower federal spending, work expectations and military needs; opponents pointed to people losing food help and the larger deficit. Weighing that is a question of values, which this tool does not score. For the policy side, try the <a href="https://rjedtech.github.io/Raider-CivicsLab/#budget" target="_blank" rel="noopener">CivicsLab budget tool</a>.</p>'+
  '<p><b>What the model leaves out.</b> Nominal dollars, not adjusted for inflation. One year of spending, with no effects on the economy. Per-person figures are averages: most programs pay some people and not others. The household model is a scale model, not a claim that a government should budget like a family.</p>'
};
BioLab.register(SIM);
})();
