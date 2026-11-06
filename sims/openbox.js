(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* Sheets: W = short side, L = long side, in inches. */
const SHEETS={p1218:{W:12,L:18,name:'12 in × 18 in poster board'},letter:{W:8.5,L:11,name:'8.5 in × 11 in paper'},sq12:{W:12,L:12,name:'12 in × 12 in square sheet'}};
const CUP=14.4375;                 /* one US cup = 231/16 cubic inches */
const sh=sim=>SHEETS[sim.p.sheet];
/* V(x) = x(W − 2x)(L − 2x): the raw cubic, valid as a box only for 0 < x < W/2. */
const Vraw=(x,W,L)=>x*(W-2*x)*(L-2*x);
const vol=(x,W,L)=>(x<=0||x>=W/2)?0:Vraw(x,W,L);
const best=(W,L)=>((W+L)-Math.sqrt(W*W-W*L+L*L))/6;
const cur=sim=>{const s=sh(sim);return vol(sim.p.x,s.W,s.L);};
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const fin=v=>String(+v.toFixed(2));
/* While the student is still choosing a cut in Guided, the picture does not say how much the box holds. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const big=()=>!atLeast('honors');

const SIM={
 id:'openbox',hash:'openbox',apUnit:3,order:6,tab:'Open box',kind:'Simulation',
 card:'Pick how big a square to cut from each corner of a sheet, then let a cubic find the cut that holds the most.',
 title:'The open box: cut, fold, fill',
 lede:{bio:'Cut the same square from each corner of a flat sheet and fold up the sides. A tiny cut makes a flat tray. A huge cut makes a tall, skinny tube. Somewhere in between, the box holds the most.',
  honors:'The volume is V(x) = x(W − 2x)(L − 2x): a cubic with zeros at 0, W/2 and L/2. Only 0 < x < W/2 makes a real box, and the turning point inside that domain is the biggest box.',
  ap:'Expand V(x) to get a cubic with leading term 4x³. Setting V′(x) = 0 gives x = [(W + L) − √(W² − WL + L²)] ÷ 6, the only critical point inside the domain.'},
 scale:'Left: the flat sheet, drawn to scale. Right: the folded box (not to scale). All lengths in inches.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your box',
 controls:[
  {id:'sheet',label:'Sheet',type:'seg',def:'p1218',options:[{v:'p1218',l:'12 × 18'},{v:'letter',l:'8.5 × 11'},{v:'sq12',l:'12 × 12'}],help:'Try the 8.5 × 11 one with a real sheet of paper and some tape.'},
  {id:'x',label:'Your cut: square size at each corner',type:'range',min:0.1,max:6,step:0.05,def:1,unit:' in',help:'The cut becomes the height of the box. You can also click the sheet.'}
 ],
 actions:[{id:'best',label:'Use the best cut',lvl:'honors',run(sim){const s=sh(sim);BioLab.setValues(sim,{x:best(s.W,s.L)});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'vol',label:'Box holds',unit:'in³',d:1,min:0,max:null,get:cur},
  {id:'cups',label:'That is about',unit:'cups',d:1,min:0,max:null,get:sim=>cur(sim)/CUP},
  {id:'base',label:'Box size (length × width × height)',text:true,get:sim=>{const s=sh(sim),x=sim.p.x;if(x>=s.W/2)return 'No box: the cuts meet';return `${f1(s.L-2*x)} × ${f1(s.W-2*x)} × ${f2(x)} in`;}},
  {id:'waste',label:'Sheet cut away',unit:'%',d:1,lvl:'honors',min:0,max:100,get:sim=>{const s=sh(sim),x=Math.min(sim.p.x,s.W/2);return 400*x*x/(s.W*s.L);}},
  {id:'bestv',label:'Biggest possible box',unit:'in³',d:1,lvl:'honors',min:0,max:null,get:sim=>{const s=sh(sim);return vol(best(s.W,s.L),s.W,s.L);}},
  {id:'xstar',label:'Best cut',unit:'in',d:2,lvl:'ap',min:0,max:null,get:sim=>{const s=sh(sim);return best(s.W,s.L);}}
 ],
 graphs:[{id:'curve',label:'Volume vs. cut size',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const s=sh(sim),W=s.W,L=s.L,xs=best(W,L),vm=vol(xs,W,L),hon=atLeast('honors');
  const xmax=hon?L/2+1:W/2,xmin=hon?-0.5:0,ymax=Math.ceil(vm*1.25/50)*50,ymin=hon?-Math.round(ymax*0.4/50)*50:0;
  const ax=axes(ctx,box,{xmin,xmax,ymin,ymax,xl:'Cut size x (in)',yl:'Volume (in³)'});
  ctx.save();ctx.beginPath();ctx.rect(box.L,box.T,box.W,box.H);ctx.clip();
  if(hon){ctx.fillStyle=PAL['g-fill'];ctx.fillRect(ax.X(0),box.T,ax.X(W/2)-ax.X(0),box.H);
   ctx.strokeStyle=PAL['muted'];ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();for(let x=xmin;x<=xmax+1e-9;x+=0.02){const px=ax.X(x),py=ax.Y(Vraw(x,W,L));x===xmin?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();ctx.setLineDash([]);}
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let x=0;x<=W/2+1e-9;x+=0.02){const px=ax.X(x),py=ax.Y(Vraw(x,W,L));x===0?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
  ctx.restore();
  if(hon){[0,W/2,L/2].forEach((z,i)=>{if(i===2&&L===W)return;ctx.fillStyle=PAL['cv-ink'];ctx.beginPath();ctx.arc(ax.X(z),ax.Y(0),4,0,7);ctx.fill();});
   txt(ctx,'domain: 0 < x < '+fin(W/2),ax.X(W/4),ax.Y(0)+18,{s:12,c:PAL['muted'],a:'center'});}
  const dot=(x,col,lab,up)=>{const v=vol(x,W,L);ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(x),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,ax.X(x),ax.Y(v)+(up?-12:20),{s:12,w:700,c:col,a:'center'});};
  const G=sim.gutS;if(G&&G.g&&G.g.sheet===sim.p.sheet)dot(G.g.x,PAL['s4'],'Your gut',false);
  if(hon||(G&&G.m))dot(xs,PAL['s3'],'Best',true);
  const nb=Math.abs(sim.p.x-xs)<0.4&&(hon||(G&&G.m));dot(Math.min(sim.p.x,W/2),PAL['rj'],nb?'':'You',G&&G.g&&Math.abs(G.g.x-sim.p.x)<0.4);},
 draw(sim,ctx,vdt,k){const s=sh(sim),W=s.W,L=s.L,x=Math.min(sim.p.x,W/2),ok=sim.p.x<W/2;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(400,20);ctx.lineTo(400,430);ctx.stroke();
  /* flat sheet: long side horizontal */
  const S=Math.min(330/L,290/W),sw=L*S,shh=W*S,sx=200-sw/2,sy=70+(290-shh)/2;
  txt(ctx,'Sheet: '+fin(W)+' × '+fin(L)+' in',200,34,{s:14*k,w:700,a:'center'});
  ctx.fillStyle='#d8b07a';ctx.fillRect(sx,sy,sw,shh);
  const c=x*S;ctx.fillStyle=PAL['cv-bg'];[[sx,sy],[sx+sw-c,sy],[sx,sy+shh-c],[sx+sw-c,sy+shh-c]].forEach(([a,b])=>ctx.fillRect(a,b,c,c));
  ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([5,4]);[[sx,sy],[sx+sw-c,sy],[sx,sy+shh-c],[sx+sw-c,sy+shh-c]].forEach(([a,b])=>ctx.strokeRect(a,b,c,c));ctx.setLineDash([]);
  if(ok){ctx.strokeStyle='#7a5527';ctx.lineWidth=1.5;ctx.setLineDash([3,4]);ctx.strokeRect(sx+c,sy+c,sw-2*c,shh-2*c);ctx.setLineDash([]);}
  ctx.strokeStyle='#7a5527';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(sx+c,sy);ctx.lineTo(sx+sw-c,sy);ctx.lineTo(sx+sw-c,sy+c);ctx.lineTo(sx+sw,sy+c);ctx.lineTo(sx+sw,sy+shh-c);ctx.lineTo(sx+sw-c,sy+shh-c);ctx.lineTo(sx+sw-c,sy+shh);ctx.lineTo(sx+c,sy+shh);ctx.lineTo(sx+c,sy+shh-c);ctx.lineTo(sx,sy+shh-c);ctx.lineTo(sx,sy+c);ctx.lineTo(sx+c,sy+c);ctx.closePath();ctx.stroke();
  if(c>22&&!big())txt(ctx,'x',sx+c/2,sy+c/2,{s:13*k,w:700,c:PAL['s1'],a:'center',b:'middle'});
  const Gm=sim.gutS&&sim.gutS.m&&sim.gutS.g&&sim.gutS.g.sheet===sim.p.sheet;
  txt(ctx,(big()?(Gm?'The math’s cut: ':'Your cut: '):'Cut x = ')+f2(sim.p.x)+' in',200,sy+shh+30,{s:13*k,w:700,c:PAL['s1'],a:'center'});
  if(ok){txt(ctx,(big()?'Floor length ':'L − 2x = ')+f1(L-2*x)+' in',200,sy+shh+30+20*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
   txt(ctx,(big()?'Floor width ':'W − 2x = ')+f1(W-2*x)+' in',200,sy-10,{s:12*k,c:PAL['cv-soft'],a:'center'});}
  /* folded box, oblique view */
  txt(ctx,'Folded box',600,34,{s:14*k,w:700,a:'center'});
  if(!ok){txt(ctx,'No box:',600,220,{s:15*k,w:700,c:PAL['s1'],a:'center'});txt(ctx,'the cuts meet',600,220+20*k,{s:15*k,w:700,c:PAL['s1'],a:'center'});return;}
  const l=L-2*x,w=W-2*x,h=x,cs=Math.cos(0.6)*0.5,sn=Math.sin(0.6)*0.5;
  const B=Math.min(26,320/(l+w*cs),220/(h+w*sn));
  const ox=600-(l+w*cs)*B/2,oy=245+(h+w*sn)*B/2;
  const P=(a,b,cc)=>[ox+a*B+b*cs*B,oy-cc*B-b*sn*B];
  const face=(pts,fill)=>{ctx.beginPath();pts.forEach((p,i)=>{const q=P(...p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);});ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle='#7a5527';ctx.lineWidth=1.5;ctx.stroke();};
  face([[0,0,0],[l,0,0],[l,w,0],[0,w,0]],'#b88a52');                 /* floor */
  face([[0,w,0],[l,w,0],[l,w,h],[0,w,h]],'#c99a5e');                 /* back wall */
  face([[0,0,0],[0,w,0],[0,w,h],[0,0,h]],'#c49559');                 /* left wall */
  face([[l,0,0],[l,w,0],[l,w,h],[l,0,h]],'#d4a76c');                 /* right wall */
  ctx.globalAlpha=.88;face([[0,0,0],[l,0,0],[l,0,h],[0,0,h]],'#e0b981');ctx.globalAlpha=1; /* front wall */
  const top=P(l/2,w,h);
  pill(ctx,gutPhase(sim)?'Holds how much? Lock in to find out.':'Holds '+f1(vol(x,W,L))+' in³',600,Math.max(60+8*k,top[1]-16-10*k),PAL['rj'],'#fff',14*k);
  txt(ctx,f1(l)+' × '+f1(w)+' × '+f2(h)+' in',600,oy+18+12*k,{s:13*k,c:PAL['cv-soft'],a:'center'});
  const G=sim.gutS;if(G&&G.g&&G.g.sheet===sim.p.sheet&&Math.abs(G.g.x-sim.p.x)>0.02)txt(ctx,'Your gut: '+f1(G.g.v)+' in³',600,436,{s:13*k,w:700,c:PAL['s4'],a:'center'});},
 onClick(sim,x,y){if(x<400){const s=sh(sim),S=Math.min(330/s.L,290/s.W),sx=200-s.L*S/2,sy=70+(290-s.W*S)/2;
   const d=Math.min(Math.abs(x-sx),Math.abs(sx+s.L*S-x),Math.abs(y-sy),Math.abs(sy+s.W*S-y));BioLab.setValues(sim,{x:clamp(Math.round(d/S/0.05)*0.05,0.1,6)});}},
 infoPanel(sim){const s=sh(sim),W=s.W,L=s.L,xs=best(W,L),hon=atLeast('honors');
  const rows=[];if(hon){const c=Math.round(xs*10)/10;for(let i=-3;i<=3;i++)rows.push(+(c+i*0.1).toFixed(1));}else{for(let i=1;i<W/2;i++)rows.push(i);if(W/2-Math.floor(W/2)>0.01&&!rows.includes(Math.floor(W/2)))rows.push(Math.floor(W/2));}
  const vals=rows.map(x=>vol(x,W,L)),mx=Math.max(...vals);
  return `<p class="p-h"><b>${hon?'Zoomed table near the top':'Table of volumes'}</b></p><table><thead><tr><th>Cut x (in)</th><th>V(x) (in³)</th></tr></thead><tbody>${rows.map((x,i)=>`<tr${vals[i]===mx?' style="font-weight:700"':''}><td>${hon?x.toFixed(1):x}</td><td>${f1(vals[i])}${vals[i]===mx?' ← biggest in this table':''}</td></tr>`).join('')}</tbody></table><p class="help">${hon?'Each row is 0.1 in apart. The true peak sits between rows, at x ≈ '+f2(xs)+' in.':'The volume climbs, peaks, then falls. Look between the two biggest rows for the best cut.'}</p>`;},
 narrate(sim){const s=sh(sim),W=s.W,L=s.L,x=sim.p.x,xs=best(W,L);
  if(x>=W/2)return `<b>No box.</b> A cut of ${f2(x)} in from each corner uses up the whole ${fin(W)} in side, so there is no floor left. The domain stops at x = ${fin(W/2)}.`;
  const v=vol(x,W,L);
  if(Math.abs(x-xs)<0.06)return `<b>This is the biggest box.</b> At x = ${f2(x)} in it holds ${f1(v)} in³. Cut a little more or a little less and the volume drops.`;
  if(x<xs)return `At x = ${f2(x)} in the box holds ${f1(v)} in³. <b>It is too shallow:</b> a deeper cut adds height faster than it shrinks the floor, so volume still goes up.`;
  return `At x = ${f2(x)} in the box holds ${f1(v)} in³. <b>The floor is shrinking too fast:</b> each extra inch of cut takes 2 in off both the length and the width.`;},
 gut:{better:'higher',
  controls:['x'],
  ask:{bio:'How big a square would you cut from each corner so the box holds the most? Drag the slider here and watch the box fold up on the right. Stop where it looks biggest to you, then lock it in.',honors:'Before you look at the table or graph: what cut size gives the biggest box? Drag the slider here by feel, then lock it in.'},
  lockLabel:'Lock in my cut',
  lock(sim){const v=cur(sim);return {v,x:sim.p.x,sheet:sim.p.sheet,label:`${big()?'a cut of ':'x = '}${f2(sim.p.x)} in, holding ${f1(v)} in³`};},
  solve(sim){const s=sh(sim),xs=best(s.W,s.L);sim.p.x=xs;const v=cur(sim);return {v,x:xs,label:`${big()?'a cut of ':'x = '}${f2(xs)} in, holding ${f1(v)} in³`};},
  how:{bio:'The math writes the volume as one function, V(x) = x(W − 2x)(L − 2x), then reads its table and graph. The volume rises, peaks, and falls back to zero when the cuts meet. The peak is the best cut.',
   honors:'V(x) is a cubic with zeros at 0, W/2 and L/2. Only 0 < x < W/2 builds a box, and the graph has exactly one turning point in that domain. Zooming the table to 0.1 in steps pins it down.',
   ap:'Expand V(x) = 4x³ − 2(W + L)x² + WLx. Then V′(x) = 12x² − 4(W + L)x + WL = 0, and the smaller root, x = [(W + L) − √(W² − WL + L²)] ÷ 6, is the maximum inside the domain.'},
  compare(sim,g,m){const gain=m.v-g.v;
   if(gain<1)return `Your gut was right on: your box holds ${f1(g.v)} in³, within 1 in³ of the best possible ${f1(m.v)} in³. Your eye balanced height against floor size just the way the cubic does.`;
   const cups=gain/CUP;
   return `The math box holds <b>${f1(gain)} in³ more</b> (${f1(g.v)} → ${f1(m.v)} in³, ${Math.round(gain/Math.max(g.v,0.01)*100)}% more) from the same sheet. That is about <b>${f1(cups)} more cup${Math.abs(cups-1)<0.05?'':'s'}</b> of popcorn in every box. Your cut was ${f2(Math.abs(g.x-m.x))} in ${g.x>m.x?'too big':'too small'}.`;},
  again(sim){const ks=Object.keys(SHEETS);sim.p.sheet=ks[Math.floor(Math.random()*ks.length)];sim.p.x=1;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A bigger corner cut makes a taller box. So does the biggest cut you can make give the biggest box?',choices:['Yes: taller always holds more','No: the volume rises, then falls as the floor shrinks','The cut size does not change the volume'],correct:1,explain:'On the 12 × 18 sheet, a 1 in cut holds 160 in³, a 3 in cut holds 216 in³, but a 5.5 in cut holds only 38.5 in³. Every inch of cut takes 2 in off the length and 2 in off the width.'},
  {lvl:'bio',instant:true,q:'On the 12 in × 18 in sheet, which cut makes the box that holds more: 1 in or 4 in?',choices:['1 in','4 in','They hold the same'],correct:2,explain:'V(1) = 1 × 10 × 16 = 160 in³ and V(4) = 4 × 4 × 10 = 160 in³. Same volume: one is a wide, shallow tray and the other a deep, narrow box. The best cut sits between them, at about 2.35 in.'},
  {lvl:'honors',instant:true,q:'V(x) = x(12 − 2x)(18 − 2x) has zeros at 0, 6 and 9. What is the domain for a real box?',choices:['0 < x < 6','0 < x < 9','6 < x < 9','All real numbers'],correct:0,explain:'At x = 6 the width 12 − 2x is already 0, so there is no floor. Between 6 and 9 the formula gives negative numbers, and past 9 it turns positive again, but neither describes a box.'},
  {lvl:'honors',instant:true,q:'Expanded, V(x) = 4x³ − 60x² + 216x. The graph climbs again for x > 9. Does a 10 in cut make a huge box?',choices:['Yes, V(10) = 160 in³','No: a 10 in cut is outside the domain, so V(10) means nothing for the box','Yes, but only a small one'],correct:1,explain:'V(10) = 10 × (−8) × (−2) = 160, a positive number, but you cannot cut 10 in squares from a 12 in side. End behavior (4x³ → ∞) describes the formula, not the box. Always check the domain.'},
  {lvl:'ap',instant:true,q:'For the 12 × 18 sheet, V′(x) = 12x² − 120x + 216 = 0 gives x = 5 ± √7. Which root is the biggest box?',choices:['x = 5 − √7 ≈ 2.35 in','x = 5 + √7 ≈ 7.65 in','Both','Neither'],correct:0,explain:'5 + √7 ≈ 7.65 is outside 0 < x < 6, and there V has a local minimum (V ≈ −68). The root 5 − √7 ≈ 2.354 is the only critical point in the domain, and V″ = 24x − 120 < 0 there, so it is a maximum: about 228.2 in³.'},
  {lvl:'ap',instant:true,q:'For a square sheet with side s, what cut gives the biggest box?',choices:['s/4','s/6','s/8','s/3'],correct:1,explain:'V = x(s − 2x)². V′ = (s − 2x)(s − 6x) = 0 gives x = s/2 (no box) or x = s/6. For the 12 × 12 sheet: x = 2 in and V = 2 × 8 × 8 = 128 in³.'}
 ],
 tour:[
  {title:'The flat sheet',text:'Start with one of your 12 in × 18 in sheets of poster board. You will cut the same size square from each corner (the red dashed squares) and fold up the four flaps.',focus:[20,20,360,410],pause:true,setup:sim=>BioLab.setValues(sim,{sheet:'p1218',x:1})},
  {title:'Fold it up',text:'The cut size x becomes the height. The floor is what is left: (18 − 2x) by (12 − 2x). With x = 1 in, that is a 16 × 10 × 1 tray holding 160 in³.',focus:[420,20,360,410],pause:true},
  {title:'Too shallow',text:'A tiny cut, x = 0.5 in, gives a big floor but almost no height: only 93.5 in³.',pause:true,setup:sim=>BioLab.setValues(sim,{x:0.5})},
  {title:'Too narrow',text:'A huge cut, x = 5.5 in, gives a tall box with a floor only 1 in wide: 38.5 in³. Every inch of cut takes 2 in off both floor sides.',pause:true,setup:sim=>BioLab.setValues(sim,{x:5.5})},
  {title:'The peak in between',text:'The volume rises, peaks, then falls. Its peak is at about x = 2.35 in, where the box holds about 228.2 in³. Check the graph below the stage.',pause:true,setup:sim=>BioLab.setValues(sim,{x:best(12,18)})},
  {lvl:'honors',title:'Zeros and domain',text:'V(x) = x(12 − 2x)(18 − 2x) is a cubic with zeros at 0, 6 and 9. Only 0 < x < 6 builds a box, so the graph you trust stops at 6.',pause:true},
  {lvl:'ap',title:'Calculus finds it exactly',text:'V(x) = 4x³ − 60x² + 216x, so V′(x) = 12x² − 120x + 216. Setting it to 0 gives x² − 10x + 18 = 0 and x = 5 − √7 ≈ 2.354 in.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does the cut size change how much the box holds?</p><ol><li>On the 12 × 18 sheet, set the cut to 1, 2, 3, 4 and 5 in. Record a trial each time.</li><li>Graph <b>Trials</b> with the cut on x and volume on y.</li></ol><p>Write one sentence: describe the shape of the graph and where it peaks.</p>',
  honors:'<p><b>Question:</b> Does the best cut depend on the sheet?</p><ol><li>For each sheet, find the biggest volume by hand, then press <b>Use the best cut</b>.</li><li>Record both. How close did you get?</li><li>For each sheet, write V(x) and its domain.</li></ol>',
  ap:'<p><b>Question:</b> Show where the biggest box is for any W × L sheet.</p><ol><li>Expand V(x) = x(W − 2x)(L − 2x) and find V′(x).</li><li>Solve V′(x) = 0 and decide which root is in the domain.</li><li>Check your formula against the tool for all three sheets.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the derivative.</p>'},
 terms:[
  {t:'Volume',d:'How much a box holds: length × width × height. Here, V(x) = x(W − 2x)(L − 2x).'},
  {t:'Domain',d:'The inputs that make sense. A cut must be more than 0 and less than half the short side, so 0 < x < W/2.'},
  {t:'Zero (root)',d:'An input where the function equals 0. V(x) has zeros at 0, W/2 and L/2.',lvl:'honors'},
  {t:'Turning point',d:'Where a graph switches from rising to falling (or the reverse). A cubic has at most two.',lvl:'honors'},
  {t:'End behavior',d:'What a function does as x grows very large or very negative. V(x) = 4x³ + … rises to the right.',lvl:'honors'},
  {t:'Critical point',d:'Where the derivative is 0 or undefined. Maximums and minimums of a smooth function happen there or at the ends of the domain.',lvl:'ap'}
 ],
 about:'<p>V(x) = x(W − 2x)(L − 2x) for a W × L sheet with squares of side x cut from each corner, valid for 0 < x < W/2. The best cut is x = [(W + L) − √(W² − WL + L²)] ÷ 6. One cup is 14.4375 in³ (231 in³ per gallon ÷ 16).</p><p>The model ignores the thickness of the sheet and any glue tabs. Real cardboard boxes fold their flaps instead of cutting the corners away, so they waste less material, but the trade-off between height and floor size is the same.</p>'
};
BioLab.register(SIM);
})();
