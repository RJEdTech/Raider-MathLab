(function(){
'use strict';
const {clamp,txt,pill,rr,PAL,axes,atLeast,fmtNum}=BioLab.h;
const f1=v=>fmtNum(v,1),fx=v=>String(+(+v).toFixed(1));
const isM=sim=>sim.p.method==='mirror';
const ratio=sim=>isM(sim)?sim.p.eye/sim.p.a:sim.p.you/sim.p.ys;   /* height per foot of ground, the same for both similar triangles */
const H=sim=>ratio(sim)*(isM(sim)?sim.p.b:sim.p.ts);
const locked=sim=>!!((sim.gutS&&sim.gutS.g)||(sim.tour&&sim.tour.on));
const MODEC={shadow:['you','ys','ts'],mirror:['eye','a','b']};
let CUR='shadow';
function sync(sim){CUR=sim.p.method;const ui=sim.ui;if(!ui||!ui.ctlW)return;const other=CUR==='mirror'?'shadow':'mirror';
 MODEC[other].forEach(id=>{const w=ui.ctlW[id];if(w)w.hidden=true;});
 MODEC[CUR].forEach(id=>{const w=ui.ctlW[id],c=SIM.controls.find(c=>c.id===id);if(w)w.hidden=!atLeast(c.lvl);});}
const reachTxt=(h,d)=>h>d?`reaches the house, with ${f1(h-d)} ft to spare`:`falls ${f1(d-h)} ft short of the house`;

const SIM={
 id:'shadow',hash:'shadow',apUnit:8,order:5,tab:'Measure with shadows',kind:'Simulation',
 card:'Guess a tree’s height by eye, then measure it with your own shadow and similar triangles.',
 title:'How tall is that tree? Similar triangles and shadows',
 lede:{bio:'The sun hits you and the tree at the same angle, so your shadow and the tree’s shadow make triangles with the same shape. Measure two shadows and your height, and one proportion gives the tree’s height.',
  honors:'The two triangles share a right angle at the ground and the same sun angle, so they are similar by AA. Corresponding sides are proportional: tree ÷ tree shadow = you ÷ your shadow. A mirror on the ground works too, because light leaves a mirror at the same angle it arrives.',
  ap:'The scale factor height ÷ shadow is tan of the sun’s elevation angle, so H = (tree shadow) · tan θ. Errors in your shadow measurement are magnified by the ratio of the two shadows.'},
 scale:{bio:'Side view, drawn to scale. Everything is in feet.'},
 aspect:16/9,timeless:true,trials:true,graph:false,controlsTitle:'What you measured',
 controls:[
  {id:'method',label:'Method',type:'seg',def:'shadow',options:[{v:'shadow',l:'Shadows'},{v:'mirror',l:'Mirror',lvl:'honors'}],onChange(sim){sync(sim);if(sim.guide&&sim.guide.keep)return;if(sim.gutS){sim.gutS.g=null;sim.gutS.m=null;}BioLab.gutRender(sim);}},
  {id:'you',label:'Your height',type:'range',min:4.5,max:6.5,step:0.1,def:5.5,unit:' ft',noGut:true},
  {id:'ys',label:'Your shadow',type:'range',min:2,max:12,step:0.1,def:4,unit:' ft',noGut:true},
  {id:'ts',label:'Tree’s shadow',type:'range',min:10,max:100,step:1,def:36,unit:' ft',noGut:true,help:'Measured at the same moment as your shadow.'},
  {id:'eye',label:'Your eye height',type:'range',min:4,max:6,step:0.1,def:5,unit:' ft',noGut:true},
  {id:'a',label:'You to the mirror',type:'range',min:2,max:10,step:0.1,def:3,unit:' ft',noGut:true,help:'Step back until you see the treetop in the mirror.'},
  {id:'b',label:'Mirror to the tree',type:'range',min:10,max:100,step:1,def:30,unit:' ft',noGut:true},
  {id:'house',label:'Tree to the house',type:'range',min:10,max:100,step:1,def:45,unit:' ft',noGut:true},
  {id:'guess',label:'Your guess: tree height',type:'range',min:10,max:150,step:1,def:30,unit:' ft',help:'This is your pick. The tree’s real height stays hidden until you lock in.'}
 ],
 init(sim){sync(sim);return {};},step(){},onLevel(sim){sync(sim);},
 metrics:[
  {id:'ratio',label:'Scale factor: height per foot of ground',unit:'',d:3,min:0,max:3,get:ratio},
  {id:'H',label:'Tree height from the math',text:true,get:sim=>locked(sim)?f1(H(sim))+' ft':'Lock in your gut first'},
  {id:'reach',label:'If it falls toward the house',text:true,get:sim=>locked(sim)?'It '+reachTxt(H(sim),sim.p.house):'Lock in your gut first'},
  {id:'sun',label:'Angle above the ground',unit:'°',d:1,lvl:'honors',min:0,max:90,get:sim=>Math.atan(ratio(sim))*180/Math.PI}
 ],
 draw(sim,ctx,vdt,k){const m=isM(sim),h=H(sim),kk=Math.min(k,1.4),show=locked(sim),G=sim.gutS;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const left=sim.p.house+26,right=m?sim.p.b+sim.p.a+3:sim.p.ts+8+sim.p.ys+3,top=Math.max(h,G&&G.g?G.g.guess:0,24);
  const s=Math.min(730/(left+right),300/top),GY=388,tx=34+left*s,X=f=>tx+f*s,Y=f=>GY-f*s;
  /* sun */
  ctx.fillStyle=PAL['s4'];ctx.beginPath();ctx.arc(40,40,16,0,7);ctx.fill();
  /* ground */
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,GY,800,450-GY);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,GY);ctx.lineTo(800,GY);ctx.stroke();
  /* house */
  const hx=X(-sim.p.house),hw=24*s,hh=16*s;ctx.fillStyle=PAL['cv-bench'];ctx.fillRect(hx-hw,GY-hh,hw,hh);ctx.fillStyle=PAL['cv-soft'];ctx.beginPath();ctx.moveTo(hx-hw-3,GY-hh);ctx.lineTo(hx-hw/2,GY-hh-9*s);ctx.lineTo(hx+3,GY-hh);ctx.closePath();ctx.fill();
  txt(ctx,'House',hx-hw/2,GY-hh/2+5,{s:12*k,w:700,c:'#3a2a10',a:'center'});
  /* distance to the house */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(hx,GY+16);ctx.lineTo(tx,GY+16);ctx.stroke();[hx,tx].forEach(x=>{ctx.beginPath();ctx.moveTo(x,GY+10);ctx.lineTo(x,GY+22);ctx.stroke();});
  txt(ctx,'House '+fx(sim.p.house)+' ft away',(hx+tx)/2,GY+36*kk,{s:12*k,w:700,a:'center'});
  /* fall arcs */
  if(show){const arc=(r,col,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=2;ctx.setLineDash(dash);ctx.beginPath();ctx.arc(tx,GY,r*s,Math.PI,Math.PI*1.5);ctx.stroke();ctx.setLineDash([]);};
   if(G&&G.g&&Math.abs(G.g.guess-h)>0.5)arc(G.g.guess,PAL['s4'],[4,5]);arc(h,h>sim.p.house?PAL['s1']:PAL['s3'],[8,5]);}
  /* tree */
  const th=h*s;ctx.fillStyle='#7a5532';ctx.fillRect(tx-Math.max(3,0.03*th),GY-th*0.55,Math.max(6,0.06*th),th*0.55);
  ctx.fillStyle=PAL['cv-leaf'];ctx.beginPath();ctx.ellipse(tx,GY-th*0.62,Math.max(10,th*0.2),th*0.38,0,0,7);ctx.fill();
  ctx.strokeStyle=PAL['cv-leaf2'];ctx.lineWidth=2;ctx.stroke();
  txt(ctx,show?'Tree: '+f1(h)+' ft':'Tree: ? ft',tx+Math.max(12,th*0.2)+6,Math.max(20,GY-th+14),{s:13*k,w:700,c:show?PAL['s3']:PAL['cv-ink']});
  const person=(px,ph)=>{const hs=ph*s;ctx.strokeStyle=PAL['s2'];ctx.fillStyle=PAL['s2'];ctx.lineWidth=Math.max(2,hs*0.08);ctx.lineCap='round';
   const hr=Math.max(3,hs*0.11);ctx.beginPath();ctx.arc(px,GY-hs+hr,hr,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(px,GY-hs+2*hr);ctx.lineTo(px,GY-hs*0.45);ctx.lineTo(px-hs*0.12,GY);ctx.moveTo(px,GY-hs*0.45);ctx.lineTo(px+hs*0.12,GY);ctx.moveTo(px-hs*0.15,GY-hs*0.7);ctx.lineTo(px+hs*0.15,GY-hs*0.7);ctx.stroke();};
  if(!m){/* shadows and sun rays */
   const ptx=X(sim.p.ts+8);
   ctx.fillStyle=PAL['cv-ink'];ctx.globalAlpha=.32;ctx.fillRect(tx,GY,sim.p.ts*s,7);ctx.fillRect(ptx,GY,sim.p.ys*s,7);ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(tx,GY-th);ctx.lineTo(X(sim.p.ts),GY);ctx.moveTo(ptx,Y(sim.p.you));ctx.lineTo(X(sim.p.ts+8+sim.p.ys),GY);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.12;ctx.beginPath();ctx.moveTo(tx,GY);ctx.lineTo(tx,GY-th);ctx.lineTo(X(sim.p.ts),GY);ctx.fill();ctx.beginPath();ctx.moveTo(ptx,GY);ctx.lineTo(ptx,Y(sim.p.you));ctx.lineTo(X(sim.p.ts+8+sim.p.ys),GY);ctx.fill();ctx.globalAlpha=1;
   person(ptx,sim.p.you);
   txt(ctx,'Tree’s shadow '+fx(sim.p.ts)+' ft',X(sim.p.ts/2),GY+56*kk,{s:12*k,w:700,a:'center'});
   txt(ctx,'You '+fx(sim.p.you)+' ft',ptx,Y(sim.p.you)-10,{s:12*k,w:700,c:PAL['s2'],a:'center'});
   txt(ctx,'Your shadow '+fx(sim.p.ys)+' ft',Math.min(ptx+sim.p.ys*s/2,700),GY+36*kk,{s:12*k,w:700,a:'center'});}
  else{const mx=X(sim.p.b),px=X(sim.p.b+sim.p.a);
   ctx.fillStyle=PAL['s6'];ctx.fillRect(mx-8,GY-3,16,4);
   ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(tx,GY-th);ctx.lineTo(mx,GY);ctx.lineTo(px,Y(sim.p.eye));ctx.stroke();ctx.setLineDash([]);
   person(px,sim.p.eye/0.93);
   txt(ctx,'Mirror',mx,GY+36*kk,{s:12*k,w:700,c:PAL['s6'],a:'center'});
   txt(ctx,'Mirror to tree '+fx(sim.p.b)+' ft',X(sim.p.b/2),GY+56*kk,{s:12*k,w:700,a:'center'});
   txt(ctx,'Eyes '+fx(sim.p.eye)+' ft up, '+fx(sim.p.a)+' ft from the mirror',Math.min(px,640),Y(sim.p.eye/0.93)-12,{s:12*k,w:700,c:PAL['s2'],a:'center'});}
  if(show)pill(ctx,'If it falls, it '+reachTxt(h,sim.p.house),400,24,h>sim.p.house?PAL['s1']:PAL['s3'],'#fff',13*kk);
  else pill(ctx,'Your guess: '+sim.p.guess+' ft tall',400,24,PAL['s4'],'#141414',13*kk);},
 narrate(sim){const r=ratio(sim);
  if(isM(sim))return `Light leaves the mirror at the same angle it hits it, so the triangle from your eyes and the triangle from the treetop are similar. Every foot along the ground gives ${fmtNum(r,3)} ft of height, so <b>the tree is ${fmtNum(r,3)} × ${fx(sim.p.b)} ft${locked(sim)?' = '+f1(H(sim))+' ft':''}</b>.`;
  return `Your height ÷ your shadow = ${fx(sim.p.you)} ÷ ${fx(sim.p.ys)} = ${fmtNum(r,3)}. The sun makes the same triangle shape for the tree, so <b>the tree is ${fmtNum(r,3)} × ${fx(sim.p.ts)} ft${locked(sim)?' = '+f1(H(sim))+' ft':''}</b>.`;},
 gut:{better:'lower',controls:['guess'],
  ask:{bio:'How tall is the tree? Compare it with the person in the picture, then drag the slider here to your guess in feet. Lock it in when it feels right.',
   honors:'How tall is the tree? Judge it by eye against the person in the picture. Drag the slider here to your guess, then lock it in.'},
  lockLabel:'Lock in my guess',
  lock(sim){const g=sim.p.guess,h=H(sim);return {v:Math.abs(g-h),guess:g,label:`${g} ft tall`};},
  solve(sim){const h=H(sim);sim.p.guess=clamp(Math.round(h),10,150);return {v:0,h,label:`${f1(h)} ft tall`};},
  how:{bio:'Shadows: you and the tree make triangles with the same shape, so height ÷ shadow is the same for both. Your height ÷ your shadow, times the tree’s shadow, is the tree’s height. Mirror: your eye height ÷ your distance to the mirror, times the mirror’s distance to the tree.',
   honors:'AA similarity: both triangles have a right angle at the ground and the same angle at the ground tip (the sun’s angle, or the mirror’s equal angles). So tree ÷ tree’s ground length = you ÷ your ground length.'},
  compare(sim,g,m){const h=m.h,d=sim.p.house,err=Math.abs(g.guess-h),pct=Math.round(err/h*100),gr=g.guess>d,tr=h>d;
   const fall=`If it falls toward the house, ${d} ft away, it ${reachTxt(h,d)}.`;
   if(err<=2)return `Your gut was right on: ${g.guess} ft against ${f1(h)} ft. Your eye already reads the shape of the triangle. ${fall}`;
   const dec=gr===tr?`Your guess points to the same answer about the house, but only by luck${Math.abs(g.guess-d)<Math.abs(h-d)?'':' of a wide margin'}.`:(tr?`<b>Your guess says the tree would miss the house. It would not.</b> That is the difference between ignoring a leaning tree and having it checked.`:`Your guess says the tree could hit the house, but it would fall ${f1(d-h)} ft short. That could save you the cost of taking down a tree that was never a danger.`);
   return `You guessed ${g.guess} ft; the tree is <b>${f1(h)} ft</b>, so your eye was ${f1(err)} ft ${g.guess>h?'too high':'too low'} (${pct}% off). ${fall} ${dec}`;},
  again(sim){const p=sim.p,r=(a,b,st)=>Math.round((a+Math.random()*(b-a))/st)*st;const h=r(25,85,0.5);p.house=r(25,80,1);p.guess=10;
   if(p.method==='mirror'){p.eye=r(4.5,5.8,0.1);p.a=r(2.5,6,0.1);p.b=clamp(Math.round(h*p.a/p.eye),10,100);}
   else{p.you=r(5,6.3,0.1);p.ys=r(3,8,0.1);p.ts=clamp(Math.round(h*p.ys/p.you),10,100);}}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Your shadow is half as long as you are tall. At the same moment, a flagpole’s shadow is 20 ft long. How tall is the flagpole?',choices:['10 ft','20 ft','40 ft'],correct:2,explain:'Same sun, same triangle shape: if a shadow is half the height for you, it is half the height for the pole. The pole is 2 × 20 = 40 ft tall.'},
  {lvl:'bio',instant:true,q:'You measure your shadow at 10 a.m. and the tree’s shadow at 3 p.m. Does the method still work?',choices:['Yes: your height and the tree’s height did not change','No: the sun’s angle changed, so the triangles are no longer the same shape','Only if it is sunny both times'],correct:1,explain:'The method depends on the sun hitting you and the tree at the same angle. Hours apart, the sun is at a different height, so shadow lengths change by different factors. Measure both shadows within a few minutes.'},
  {lvl:'honors',instant:true,q:'Why are the tree’s triangle and your triangle similar?',choices:['AA: each has a right angle at the ground and the same sun angle','SSS: their sides are equal','SAS: they share a side'],correct:0,explain:'Both stand straight up from flat ground, which makes a right angle, and the sun’s rays are parallel, which makes the same angle at each shadow tip. Two pairs of equal angles is enough: AA similarity.'},
  {lvl:'honors',instant:true,q:'Mirror method: your eyes are 5 ft up and you stand 4 ft from a mirror on the ground. The mirror is 40 ft from the tree. How tall is the tree?',choices:['32 ft','45 ft','50 ft','200 ft'],correct:2,explain:'Light leaves the mirror at the same angle it arrives, so the two triangles are similar. Height ÷ ground distance is 5 ÷ 4 = 1.25, so the tree is 1.25 × 40 = 50 ft.'},
  {lvl:'ap',instant:true,q:'Two cities are 800 km apart, one due north of the other. At noon on the same day, the sun’s rays meet the ground at angles that differ by 7.2°. Assuming Earth is a sphere, about how big around is it?',choices:['About 5,800 km','About 40,000 km','About 115,000 km'],correct:1,explain:'7.2° is 1/50 of a full 360° circle, so the 800 km between the cities is 1/50 of the way around: 50 × 800 = 40,000 km. This is the idea Eratosthenes used about 2,250 years ago, with shadows and a proportion.'},
  {lvl:'ap',instant:true,q:'You are 5.5 ft tall and the tree’s shadow is 36 ft. You measure your own shadow as 4.5 ft instead of the true 4 ft. What height do you get?',choices:['About 44 ft (5.5 ft too low)','About 49 ft (almost right)','About 55 ft (5.5 ft too high)'],correct:0,explain:'5.5 ÷ 4.5 × 36 = 44 ft instead of 49.5 ft. Half a foot of error on your short shadow became 5.5 ft of error on the tree, because the tree’s shadow is 9 times longer. Measure the short shadow carefully.'}
 ],
 tour:[
  {title:'The question',text:'This tree is 45 ft from the house. Its shadow is 36 ft long. You are 5.5 ft tall, and at the same moment your shadow is 4 ft long.',pause:true,setup:sim=>BioLab.setValues(sim,{method:'shadow',you:5.5,ys:4,ts:36,house:45})},
  {title:'Same sun, same shape',text:'The sun’s rays are parallel, so they hit the treetop and your head at the same angle. The yellow triangles, tree and shadow, you and your shadow, have the same shape. They are similar triangles.',pause:true,focus:[[180,40,600,400]]},
  {title:'One proportion',text:'For you, height ÷ shadow = 5.5 ÷ 4 = 1.375. The tree’s triangle has the same ratio, so its height is 1.375 × 36 = 49.5 ft. ',pause:true},
  {title:'Does it reach the house?',text:'A falling tree’s top lands as far from the trunk as the tree is tall. 49.5 ft is more than the 45 ft to the house, so it would reach the house with 4.5 ft to spare.',pause:true,setup:sim=>BioLab.setValues(sim,{guess:50})},
  {lvl:'honors',title:'The mirror method',text:'No sun? Lay a mirror on the ground 30 ft from the tree and step back until you see the treetop in it: here, 3 ft away with your eyes 5 ft up. Light leaves the mirror at the same angle it hits, so the tree is 5 ÷ 3 × 30 = 50 ft tall.',pause:true,setup:sim=>BioLab.setValues(sim,{method:'mirror',eye:5,a:3,b:30})},
  {lvl:'ap',title:'The ratio is a tangent',text:'Height ÷ shadow is the tangent of the sun’s angle above the ground. With 5.5 ÷ 4 = 1.375, the sun is about 54.0° up. That is how Eratosthenes turned shadow angles into the size of the Earth.',pause:true,setup:sim=>BioLab.setValues(sim,{method:'shadow'})}
 ],
 lab:{bio:'<p><b>Question:</b> Does the answer depend on how tall the person is?</p><ol><li>Keep the tree’s shadow at 36 ft. Set your height to 5.0 ft and adjust your shadow until the scale factor is 1.375. Record a trial.</li><li>Repeat for heights of 5.5 and 6.0 ft.</li></ol><p>Write one sentence: why does every person get the same tree height?</p>',
  honors:'<p><b>Question:</b> Do the shadow method and the mirror method agree?</p><ol><li>Find the tree height with shadows. Switch to the mirror and set the distances so you get the same height.</li><li>Record both setups.</li></ol><p>Explain which angles are equal in each method.</p>',
  ap:'<p><b>Question:</b> How sensitive is the answer to measurement error?</p><ol><li>Change your shadow by ±0.5 ft and record the tree height each time.</li><li>Repeat with a tree shadow twice as long.</li></ol><p><b>CER:</b> Claim, evidence from your trials, reasoning from the proportion.</p>'},
 terms:[
  {t:'Similar triangles',d:'Triangles with the same shape: equal angles and proportional sides.'},
  {t:'Proportion',d:'An equation saying two ratios are equal, like tree ÷ tree shadow = you ÷ your shadow.'},
  {t:'Scale factor',d:'The number you multiply by to go from one similar figure to the other.'},
  {t:'AA similarity',d:'If two angles of one triangle equal two angles of another, the triangles are similar.',lvl:'honors'},
  {t:'Law of reflection',d:'Light leaves a mirror at the same angle it arrives, measured from the mirror’s surface.',lvl:'honors'},
  {t:'Angle of elevation',d:'The angle up from the horizontal to a line of sight. Here, tan θ = height ÷ shadow.',lvl:'ap'}
 ],
 about:'<p>Tree height = (your height ÷ your shadow) × the tree’s shadow, or with a mirror, (your eye height ÷ your distance to the mirror) × the mirror’s distance to the tree. The model assumes flat, level ground, a tree that stands straight up, both shadows measured at the same moment, and distances measured to the point under the very top of the tree.</p><p>“Reaches the house” assumes the tree falls straight toward the house and pivots at its base, so its top lands as far away as the tree is tall. Real trees can break partway up or slide. This is a geometry model, not advice about tree safety: if a tree worries you, ask a certified arborist.</p>'
};
BioLab.register(SIM);
})();
