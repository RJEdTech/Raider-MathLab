(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,bars,atLeast,fmtNum}=BioLab.h;
const f2=v=>fmtNum(v,2),fx=v=>String(+(+v).toFixed(2));
/* A 4-panel bridge truss, 32 ft long and 8 ft tall, with pin joints. Lengths in inches, forces in pounds. */
const BW=96,BH=96,EA=13.2e6,EAW=3000,CAP=12,FOLD=1;
const PANELS=['p1','p2','p3','p4'];
const NODES=(()=>{const N=[];for(let i=0;i<5;i++)N.push([i*BW,0]);for(let i=0;i<5;i++)N.push([i*BW,BH]);return N;})();
function members(cfg){const M=[];for(let i=0;i<4;i++){M.push({a:i,b:i+1,ea:EA,kind:'chord'});M.push({a:5+i,b:6+i,ea:EA,kind:'chord'});}
 for(let i=0;i<5;i++)M.push({a:i,b:5+i,ea:EA,kind:'vert'});
 cfg.forEach((c,i)=>{if(c==='up')M.push({a:i,b:6+i,ea:EA,kind:'brace'});else if(c==='down')M.push({a:5+i,b:i+1,ea:EA,kind:'brace'});
  else{M.push({a:i,b:6+i,ea:EAW,kind:'weak'});M.push({a:5+i,b:i+1,ea:EAW,kind:'weak'});}});return M;}
/* Direct stiffness method: pin at the bottom-left joint, roller at the bottom-right joint. */
function analyze(cfg,P,posFt,push){const M=members(cfg),nd=20,K=[],F=new Float64Array(nd);for(let i=0;i<nd;i++)K.push(new Float64Array(nd));
 M.forEach(m=>{const A=NODES[m.a],B=NODES[m.b],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy),c=dx/L,s=dy/L,k=m.ea/L;m.L=L;m.c=c;m.s=s;
  const id=[2*m.a,2*m.a+1,2*m.b,2*m.b+1],v=[-c,-s,c,s];for(let i=0;i<4;i++)for(let j=0;j<4;j++)K[id[i]][id[j]]+=k*v[i]*v[j];});
 const x=clamp(posFt*12/BW,0,4),i0=Math.min(3,Math.floor(x)),t=x-i0;F[2*i0+1]-=P*(1-t);F[2*(i0+1)+1]-=P*t;F[10]+=push;
 const free=[];for(let d=0;d<nd;d++)if(d!==0&&d!==1&&d!==9)free.push(d);
 const n=free.length,A=free.map(i=>free.map(j=>K[i][j])),b=free.map(i=>F[i]);
 for(let c=0;c<n;c++){let p=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[p][c]))p=r;const tA=A[c];A[c]=A[p];A[p]=tA;const tb=b[c];b[c]=b[p];b[p]=tb;
  for(let r=c+1;r<n;r++){const f=A[r][c]/A[c][c];if(!f)continue;for(let k=c;k<n;k++)A[r][k]-=f*A[c][k];b[r]-=f*b[c];}}
 const u=new Float64Array(n);for(let r=n-1;r>=0;r--){let s=b[r];for(let k=r+1;k<n;k++)s-=A[r][k]*u[k];u[r]=s/A[r][r];}
 const U=new Float64Array(nd);free.forEach((d,i)=>U[d]=u[i]);
 let mv=0;for(let i=0;i<10;i++)mv=Math.max(mv,Math.hypot(U[2*i],U[2*i+1]));
 M.forEach(m=>{const e=(U[2*m.b]-U[2*m.a])*m.c+(U[2*m.b+1]-U[2*m.a+1])*m.s;m.f=m.ea*e/m.L;});
 const sag=-(U[2*i0+1]*(1-t)+U[2*(i0+1)+1]*t);
 return {U,M,mv,sag,i0,t};}
const cfgOf=sim=>PANELS.map(id=>sim.p[id]);
const nBr=cfg=>cfg.filter(c=>c!=='none').length;
const loose=cfg=>cfg.map((c,i)=>c==='none'?i+1:0).filter(Boolean);
const push=sim=>atLeast('ap')?sim.p.push:50,load=sim=>atLeast('honors')?sim.p.P:1000;
let memo={key:'',r:null};
function run(sim,cfg){cfg=cfg||cfgOf(sim);const key=cfg.join()+'|'+load(sim)+'|'+sim.p.pos+'|'+push(sim);if(memo.key===key)return memo.r;const r=analyze(cfg,load(sim),sim.p.pos,push(sim));memo={key,r};return r;}
const cap=v=>Math.min(v,CAP);
const ARR={none:'none',up:'╱',down:'╲'};
const lp=L=>L.length>1?'panels '+L.slice(0,-1).join(', ')+' and '+L[L.length-1]:'panel '+L[0];
const pat=cfg=>cfg.map(c=>ARR[c]==='none'?'□':ARR[c]).join('');
function bestCfg(sim){const C=['none','up','down'];let best=null;
 for(let a=0;a<81;a++){const cfg=[0,1,2,3].map(k=>C[Math.floor(a/Math.pow(3,k))%3]);const r=analyze(cfg,load(sim),sim.p.pos,push(sim));const v=cap(r.mv);
  if(!best||v<best.v-1e-12||(Math.abs(v-best.v)<=1e-12&&nBr(cfg)<nBr(best.cfg)))best={cfg,v};}
 return best;}
const lbs=v=>Math.round(v).toLocaleString('en-US');
/* "How many braces?" places a sensible pattern; clicking a panel or its own control moves one, and the count follows. */
const PAT={0:['none','none','none','none'],1:['none','down','none','none'],2:['down','none','none','up'],3:['down','down','none','up'],4:['down','down','up','up']};
function setCount(sim){const n=+sim.p.nb;if(nBr(cfgOf(sim))===n)return;PAT[n].forEach((c,i)=>{sim.p[PANELS[i]]=c;if(sim.ui&&sim.ui.ctl&&sim.ui.ctl[PANELS[i]])sim.ui.ctl[PANELS[i]].set(c);});}
function syncCount(sim){const n=nBr(cfgOf(sim));if(+sim.p.nb===n)return;sim.p.nb=n;if(sim.ui&&sim.ui.ctl&&sim.ui.ctl.nb)sim.ui.ctl.nb.set(n);}
/* Guided, before the gut is locked: show the bridge and the load, but not whether it holds. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const rk=()=>atLeast('honors')?'rack':'lean over';
const SX=x=>80+x*640/384,SY=y=>318-y*640/384;

const SIM={
 id:'truss',hash:'truss',apUnit:8,order:4,tab:'Why bridges use triangles',kind:'Simulation',
 card:'Brace a small bridge by feel, load it, and see why every square needs a triangle to hold its shape.',
 title:'Why bridges are built from triangles',
 lede:{bio:'Push on the corner of a square frame with loose joints and it leans over into a parallelogram. A triangle cannot do that: once its three sides are set, its shape is set. Brace this bridge and load it.',
  honors:'SSS: three side lengths determine one triangle, so a triangle of fixed bars is rigid. A four-sided frame with the same side lengths can take many shapes, so it racks. One diagonal splits a square into two triangles and locks it.',
  ap:'For a pin-jointed frame on a pin and a roller, rigidity needs at least 2j − 3 bars for j joints. This bridge has 10 joints, so it needs 17 bars: 13 chords and posts, plus one diagonal in each of the 4 panels. The tool solves the stiffness equations K·u = F for the joint movements.'},
 scale:'A small footbridge 32 ft long and 8 ft tall, seen from the side: four square panels, 8 ft by 8 ft. Movements are drawn exaggerated so you can see them.',
 aspect:16/9,timeless:true,trials:true,graph:true,controlsTitle:'Your bridge',
 controls:[
  {id:'nb',label:'Your pick: diagonal braces to buy',type:'seg',def:0,options:[0,1,2,3,4].map(v=>({v,l:String(v)})),onChange:setCount,help:'The picture puts them in for you. Click a panel to move one.'},
  {id:'p1',label:'Panel 1 brace',type:'seg',def:'none',options:[{v:'none',l:'None'},{v:'up',l:'╱'},{v:'down',l:'╲'}],onChange:syncCount},
  {id:'p2',label:'Panel 2 brace',type:'seg',def:'none',options:[{v:'none',l:'None'},{v:'up',l:'╱'},{v:'down',l:'╲'}],onChange:syncCount},
  {id:'p3',label:'Panel 3 brace',type:'seg',def:'none',options:[{v:'none',l:'None'},{v:'up',l:'╱'},{v:'down',l:'╲'}],onChange:syncCount},
  {id:'p4',label:'Panel 4 brace',type:'seg',def:'none',options:[{v:'none',l:'None'},{v:'up',l:'╱'},{v:'down',l:'╲'}],onChange:syncCount,help:'You can also click a panel to change its brace.'},
  {id:'pos',label:'Where the load sits',type:'range',min:4,max:28,step:1,def:16,unit:' ft from the left',noGut:true},
  {id:'P',label:'Load',type:'range',min:200,max:3000,step:100,def:1000,unit:' lb',lvl:'honors',noGut:true},
  {id:'push',label:'Sideways push at the top corner',type:'range',min:0,max:200,step:10,def:50,unit:' lb',lvl:'ap',noGut:true,help:'Wind, or people leaning on the rail.'}
 ],
 actions:[{id:'pratt',label:'Pratt pattern ╲╲╱╱',lvl:'honors',run(sim){BioLab.setValues(sim,{p1:'down',p2:'down',p3:'up',p4:'up'});}},
  {id:'clear',label:'Remove all braces',run(sim){BioLab.setValues(sim,{p1:'none',p2:'none',p3:'none',p4:'none'});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'state',label:'Does it hold?',text:true,get:sim=>{const r=run(sim),L=loose(cfgOf(sim));if(r.mv>FOLD)return 'No: it folds';if(L.length)return 'Holds this load, but '+lp(L)+' can '+rk();return 'Yes: it is rigid';}},
  {id:'move',label:'Biggest movement of any joint',unit:'in',d:2,min:0,max:CAP,get:sim=>cap(run(sim).mv)},
  {id:'sag',label:'Sag under the load',unit:'in',d:2,min:0,max:CAP,get:sim=>clamp(run(sim).sag,-CAP,CAP)},
  {id:'braces',label:'Braces used',unit:'',d:0,min:0,max:4,get:sim=>nBr(cfgOf(sim))},
  {id:'fmax',label:'Biggest force in one bar',unit:'lb',d:0,lvl:'ap',min:0,max:null,get:sim=>Math.max(...run(sim).M.filter(m=>m.kind!=='weak').map(m=>Math.abs(m.f)))}
 ],
 graphs:[{id:'g',label:'Movement by number of braces',custom:true}],defaultGraph:'g',
 plot(sim,ctx,box){const cur=cfgOf(sim),vals=[0,1,2,3,4].map(n=>{const cfg=cur.slice();let need=n-nBr(cfg);
   for(let i=0;i<4&&need>0;i++)if(cfg[i]==='none'){cfg[i]=i<2?'down':'up';need--;}
   for(let i=3;i>=0&&need<0;i--)if(cfg[i]!=='none'){cfg[i]='none';need++;}
   return cap(analyze(cfg,load(sim),sim.p.pos,push(sim)).mv);});
  const ax=axes(ctx,box,{xmin:0,xmax:5,ymin:0,ymax:CAP+2,xcats:['0','1','2','3','4'],xl:'Braces (starting from your bridge)',yl:'Biggest movement (in)'});
  bars(ctx,ax,vals,{colors:vals.map((v,i)=>i===nBr(cur)?PAL['rj']:PAL['cv-soft']),d:2});},
 draw(sim,ctx,vdt,k){const cfg=cfgOf(sim),r=run(sim),kk=Math.min(k,1.4),ap=atLeast('ap'),fold=r.mv>FOLD;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);const hide=gutPhase(sim);
  /* banks */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,SY(0)+22,92,120);ctx.fillRect(708,SY(0)+22,92,120);
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,SY(0)+22);ctx.lineTo(92,SY(0)+22);ctx.moveTo(708,SY(0)+22);ctx.lineTo(800,SY(0)+22);ctx.stroke();
  const pxIn=640/384,amp=hide?0:fold?Math.min(38/(r.mv*pxIn),3):clamp(30/(Math.max(r.mv,1e-6)*pxIn),1,5000);
  const P=i=>[SX(NODES[i][0]+r.U[2*i]*amp),SY(NODES[i][1]+r.U[2*i+1]*amp)];
  /* ghost of the original shape */
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.setLineDash([5,5]);r.M.filter(m=>m.kind!=='weak').forEach(m=>{ctx.beginPath();ctx.moveTo(SX(NODES[m.a][0]),SY(NODES[m.a][1]));ctx.lineTo(SX(NODES[m.b][0]),SY(NODES[m.b][1]));ctx.stroke();});ctx.setLineDash([]);
  /* panels that can rack */
  if(!hide)loose(cfg).forEach(n=>{const i=n-1,a=P(i),b=P(i+1),c=P(i+6),d=P(i+5);ctx.fillStyle=PAL['s1'];ctx.globalAlpha=fold?.16:.08;ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.closePath();ctx.fill();ctx.globalAlpha=1;});
  /* bars */
  const fm=Math.max(1,...r.M.filter(m=>m.kind!=='weak').map(m=>Math.abs(m.f)));
  r.M.filter(m=>m.kind!=='weak').forEach(m=>{const a=P(m.a),b=P(m.b);let col=m.kind==='brace'?PAL['rj']:PAL['cv-ink'],w=m.kind==='brace'?5:4;
   if(ap&&!fold){col=m.f>1?PAL['s2']:(m.f<-1?PAL['s4']:PAL['cv-soft']);w=2+5*Math.abs(m.f)/fm;}
   ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();});
  for(let i=0;i<10;i++){const p=P(i);ctx.fillStyle=PAL['card'];ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.arc(p[0],p[1],5,0,7);ctx.fill();ctx.stroke();}
  /* supports */
  const s0=P(0),s4=P(4);ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(s0[0],s0[1]+5);ctx.lineTo(s0[0]-12,SY(0)+22);ctx.lineTo(s0[0]+12,SY(0)+22);ctx.closePath();ctx.fill();
  [-6,6].forEach(dx=>{ctx.beginPath();ctx.arc(s4[0]+dx,SY(0)+16,6,0,7);ctx.fill();});
  if(atLeast('honors')){txt(ctx,'pin',SX(0),SY(0)+40*kk,{s:12*k,c:PAL['cv-soft'],a:'center'});txt(ctx,'roller',SX(384),SY(0)+40*kk,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  /* panel labels */
  for(let i=0;i<4;i++){const nb=cfg[i]==='none';txt(ctx,'Panel '+(i+1)+(nb?': no brace':''),SX(i*BW+BW/2),SY(0)+66*kk,{s:12*k,w:700,c:nb&&!hide?PAL['s1']:PAL['cv-soft'],a:'center'});}
  /* load */
  const lx=r.i0,lp=[P(lx)[0]+(P(lx+1)[0]-P(lx)[0])*r.t,P(lx)[1]+(P(lx+1)[1]-P(lx)[1])*r.t];
  ctx.strokeStyle=PAL['s5'];ctx.fillStyle=PAL['s5'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(lp[0],lp[1]-62);ctx.lineTo(lp[0],lp[1]-12);ctx.stroke();ctx.beginPath();ctx.moveTo(lp[0],lp[1]-2);ctx.lineTo(lp[0]-8,lp[1]-14);ctx.lineTo(lp[0]+8,lp[1]-14);ctx.closePath();ctx.fill();
  pill(ctx,lbs(load(sim))+' lb',lp[0],lp[1]-72,PAL['s5'],'#fff',13*kk);
  /* sideways push */
  if(push(sim)>0){const t0=P(5);ctx.strokeStyle=PAL['s6'];ctx.fillStyle=PAL['s6'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(t0[0]-56,t0[1]);ctx.lineTo(t0[0]-12,t0[1]);ctx.stroke();ctx.beginPath();ctx.moveTo(t0[0]-4,t0[1]);ctx.lineTo(t0[0]-15,t0[1]-7);ctx.lineTo(t0[0]-15,t0[1]+7);ctx.closePath();ctx.fill();
   txt(ctx,push(sim)+' lb push',Math.max(4,t0[0]-58),t0[1]-12,{s:12*k,w:700,c:PAL['s6']});}
  /* status */
  if(hide){const n=nBr(cfg);pill(ctx,`Your pick: ${n} brace${n===1?'':'s'}`,400,30,PAL['s4'],'#111',15*kk);txt(ctx,'Lock it in to load the bridge.',400,30+26*kk,{s:13*k,c:PAL['cv-soft'],a:'center'});return;}
  const st=fold?`Folds: a panel ${rk()==='rack'?'racks':'leans over'} into a parallelogram`:(loose(cfg).length?`Holds this load, but ${lp(loose(cfg))} can ${rk()}`:`Holds: the joints move at most ${f2(r.mv)} in`);
  pill(ctx,st,400,30,fold?PAL['s1']:(loose(cfg).length?'#9a5d00':PAL['s3']),'#fff',14*kk);
  txt(ctx,fold?'Folding shown smaller than the model says':`Movement drawn ${Math.round(amp)}× larger`,792,442,{s:12*k,c:PAL['cv-soft'],a:'right'});
  if(ap&&!fold){txt(ctx,'Blue: stretched (tension)',8,410,{s:12*k,w:700,c:PAL['s2']});txt(ctx,'Amber: squeezed (compression)',8,428+(kk-1)*8,{s:12*k,w:700,c:PAL['s4']});}},
 onClick(sim,x,y){if(y<SY(BH)-10||y>SY(0)+10)return;const i=Math.floor((x-80)/(BW*640/384));if(i<0||i>3)return;const id=PANELS[i],nx={none:'up',up:'down',down:'none'}[sim.p[id]];BioLab.setValues(sim,{[id]:nx});},
 narrate(sim){const cfg=cfgOf(sim),r=run(sim),L=loose(cfg);
  if(gutPhase(sim)){const n=nBr(cfg);return `Your pick: ${n} brace${n===1?'':'s'}. The bridge will carry a ${lbs(load(sim))} lb load, and people will lean on the rail. <b>Will it hold?</b>`;}
  if(r.mv>FOLD)return `${lp(L).replace('p','P')} ${L.length>1?'are':'is'} only four bars with loose corners, so ${L.length>1?'they lean':'it leans'} over like a parallelogram. <b>The bridge folds.</b> One diagonal would split each square into two triangles.`;
  if(L.length)return `This load happens not to push ${lp(L)} sideways, so it holds for now. <b>But a four-sided panel can still ${rk()}:</b> move the load or push harder and it folds.`;
  return `Every panel is split into two triangles, and a triangle with fixed sides cannot change shape. <b>The bridge holds:</b> the joints move at most ${f2(r.mv)} in, just from the boards stretching and squeezing.`;},
 gut:{better:'lower',controls:['nb'],lockLabel:'Lock in my bridge',
  ask:{bio:'Each brace is another board to buy and cut. Tap how many braces you think the bridge needs; the picture puts them in. Then lock it in.',honors:'Tap how many braces you think the bridge needs, or click panels in the picture to place them yourself. Then lock it in.'},
  lock(sim){const cfg=cfgOf(sim),r=run(sim),n=nBr(cfg);return {v:cap(r.mv),n,cfg,fold:r.mv>FOLD,mv:r.mv,label:`${n} brace${n===1?'':'s'} (${pat(cfg)}): ${r.mv>FOLD?'it folds':'moves '+f2(r.mv)+' in'}`};},
  solve(sim){const b=bestCfg(sim);PANELS.forEach((id,i)=>sim.p[id]=b.cfg[i]);sim.p.nb=nBr(b.cfg);const r=run(sim);return {v:cap(r.mv),n:nBr(b.cfg),cfg:b.cfg,mv:r.mv,label:`${nBr(b.cfg)} braces (${pat(b.cfg)}): moves ${f2(r.mv)} in`};},
  how:{bio:'A triangle’s three sides lock its angles, so the math splits every square panel into two triangles with one diagonal each. Then it tests every way the four braces could lean and keeps the stiffest.',
   ap:'The math builds the stiffness matrix K from every bar (stiffness EA/L along the bar), solves K·u = F for the joint movements u, and searches all 3⁴ = 81 brace patterns for the smallest movement.'},
  compare(sim,g,m){const P=lbs(load(sim)),pu=push(sim);
   if(g.n===4)return `Your gut was right on: you braced every panel, so the bridge holds. It moves ${f2(g.mv)} in; the math’s best pattern (${pat(m.cfg)}) moves ${f2(m.mv)} in${g.mv-m.mv<0.0005?', the same':''}. Once every square is two triangles, which way the braces lean changes the sag by only hundredths of an inch.`;
   const L=loose(g.cfg),miss=4-g.n;
   if(!g.fold)return `Your ${g.n}-brace bridge happens to hold this exact load, moving ${f2(g.mv)} in, but ${lp(L)} can still ${rk()} into a parallelogram. Move the load or add a sideways push and it folds. ${miss} more brace${miss>1?'s':''} make${miss>1?'':'s'} it rigid for any load.`;
   return `With ${g.n} brace${g.n===1?'':'s'}, ${lp(L)} can ${rk()} into a parallelogram. Under ${P} lb${pu?` and a ${pu} lb sideways push`:''} your bridge <b>folds</b>: it does not just sag a little, it keeps leaning until something stops it. ${miss} more brace${miss>1?'s':''}, one in every panel, and it moves only <b>${f2(m.mv)} in</b>. That is the difference between a bridge and a pile of boards.`;},
  again(sim){PANELS.forEach(id=>sim.p[id]='none');sim.p.nb=0;sim.p.pos=4+Math.floor(Math.random()*25);}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You build two frames from wood strips with a single loose bolt at each corner: a square and a triangle. You push sideways on the top of each. Which one keeps its shape?',choices:['The square','The triangle','Both lean over the same way'],correct:1,explain:'The square racks into a parallelogram: its sides stay the same length while its angles change. The triangle cannot. With its three side lengths fixed, there is only one shape it can be.'},
  {lvl:'bio',instant:true,q:'This bridge has 4 square panels. What is the fewest diagonal braces that makes it rigid?',choices:['1, in the middle','2, one at each end','4, one in every panel','8, an X in every panel'],correct:2,explain:'Any panel without a diagonal is still a four-sided frame that can rack, and the whole bridge folds with it. One diagonal per panel splits each square into two triangles. A second diagonal (an X) shares the load but is not needed for rigidity.'},
  {lvl:'honors',instant:true,q:'Why does a triangle of three fixed bars hold its shape?',choices:['Three side lengths determine one triangle (SSS), so its angles cannot change','Triangles use stronger material','Its corners are glued, so the angles are locked'],correct:0,explain:'SSS congruence: any two triangles with the same three side lengths are congruent. So bars of fixed lengths allow exactly one shape, even with loose pins at the corners. A quadrilateral with fixed sides has many possible shapes.'},
  {lvl:'honors',instant:true,q:'A square panel already has one diagonal. You add the other diagonal to make an X. What does the second diagonal do?',choices:['It makes the panel rigid for the first time','It shares the load, but the panel was already rigid','It lets the panel rack'],correct:1,explain:'One diagonal already splits the square into two rigid triangles. The second is redundant: it carries some of the force, so the panel is stiffer and stronger, but it was already rigid. Builders add X-bracing when the brace can only take tension, like a steel cable or a thin rod.'},
  {lvl:'ap',instant:true,q:'A pin-jointed frame with j joints sits on a pin and a roller (3 support constraints). What is the fewest bars it needs to be rigid?',choices:['j + 1','2j − 3','2j','3j − 6'],correct:1,explain:'Each joint has 2 ways to move (x and y), so there are 2j unknowns. The supports remove 3, leaving 2j − 3 that bars must lock. For this bridge, 2(10) − 3 = 17 bars: 13 chords and posts plus 4 diagonals.'},
  {lvl:'ap',instant:true,q:'In the Pratt pattern (╲╲╱╱), the diagonals slope down toward the middle. With a load at the center, what are those diagonals doing?',choices:['Stretching (tension)','Squeezing (compression)','Carrying no force'],correct:0,explain:'In this model each Pratt diagonal carries about 500 × √2 ≈ 707 lb of tension under a 1,000 lb center load with no push. Flip them (╱╱╲╲) and they carry the same force in compression. Long steel bars are better in tension, because squeezed bars can buckle.'}
 ],
 tour:[
  {title:'A bridge of squares',text:'This footbridge is four square panels, 8 ft on a side, with a pin at every joint. It rests on a pin at the left and a roller at the right. A 1,000 lb load sits in the middle, and a 50 lb sideways push stands in for wind.',pause:true,setup:sim=>BioLab.setValues(sim,{p1:'none',p2:'none',p3:'none',p4:'none',pos:16,P:1000,push:50}),focus:[[60,150,690,230]]},
  {title:{bio:'Squares lean over',honors:'Squares rack'},text:'With no braces, every panel leans over into a parallelogram. The bars stay the same length; only the angles change. The bridge folds.',pause:true},
  {title:'One brace is not enough',text:'Add a diagonal to panel 1 only. That panel is now two triangles and holds its shape, but the other three panels can still lean over, so the bridge still folds.',pause:true,setup:sim=>BioLab.setValues(sim,{p1:'down'})},
  {title:'Brace every panel',text:'Put one diagonal in every panel. Now the whole bridge is triangles, and it holds. The joints move only about 0.05 in, from the wood stretching and squeezing.',pause:true,setup:sim=>BioLab.setValues(sim,{p1:'down',p2:'down',p3:'up',p4:'up'})},
  {title:'Miss one and it fails',text:'Take the brace out of panel 3. One four-sided panel is enough to make the whole bridge fold. That is why real trusses are triangles all the way across.',pause:true,setup:sim=>BioLab.setValues(sim,{p3:'none'})},
  {lvl:'honors',title:'SSS is the reason',text:'Three side lengths determine one triangle: that is SSS congruence. So a triangle of bars with loose pins has exactly one shape. A four-sided panel with the same bars can take infinitely many.',pause:true,setup:sim=>BioLab.setValues(sim,{p3:'up'})},
  {lvl:'ap',title:'Tension and compression',text:'At Deep dive, blue bars are stretched and amber bars are squeezed, and thicker means more force. In this Pratt pattern the diagonals are in tension and the top chord is in compression.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How many braces does the bridge need?</p><ol><li>Start with no braces. Add one brace at a time, in any panels you like. Record a trial after each.</li><li>Then move the load to 6 ft and 26 ft and check again.</li></ol><p>Write one sentence: what is the rule for bracing a bridge made of squares?</p>',
  honors:'<p><b>Question:</b> Does the direction of the braces matter?</p><ol><li>Brace every panel. Try at least four different patterns of ╱ and ╲.</li><li>Record the movement for each, with the load in the middle.</li></ol><p>How big are the differences compared with leaving one panel unbraced?</p>',
  ap:'<p><b>Question:</b> Which bars carry the most force?</p><ol><li>Use the Pratt pattern. Record <b>Biggest force in one bar</b> for loads of 500 to 3,000 lb.</li><li>Flip every brace and repeat.</li></ol><p><b>CER:</b> Claim, evidence from your trials, reasoning from tension and compression.</p>'},
 terms:[
  {t:'Truss',d:'A frame made of straight bars joined into triangles.'},
  {t:'Rack',d:'To lean from a rectangle into a parallelogram without any side changing length.'},
  {t:'SSS congruence',d:'If three sides of one triangle equal three sides of another, the triangles are congruent. So fixed sides mean a fixed shape.',lvl:'honors'},
  {t:'Tension and compression',d:'A bar in tension is being stretched; a bar in compression is being squeezed.',lvl:'ap'},
  {t:'Stiffness matrix',d:'The table K in K·u = F that links joint movements u to forces F.',lvl:'ap'}
 ],
 about:'<p>A pin-jointed truss: every joint is a frictionless pin, so bars only stretch or squeeze. Each bar has the stretch stiffness of a 2×6 wood board (E = 1.6 million psi, area 8.25 in²), an assumption for illustration. The left support is a pin and the right is a roller. The load is split between the two nearest bottom joints; a sideways push (50 lb unless you change it at Deep dive) acts at the top-left joint. The tool solves the stiffness equations K·u = F.</p><p>A panel with no brace has no stiffness against racking, so a pure pin model would give an infinite answer. To keep the numbers finite, each unbraced panel gets a very weak spring, standing in for the small grip of real bolts. Any movement over 1 in means the frame folds; readouts are capped at 12 in. Real bridges also need a deck, sideways bracing, joints sized for the forces and safety factors from building codes. This is a simplified model, not a design tool.</p>'
};
BioLab.register(SIM);
})();
