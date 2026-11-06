(function(){
'use strict';
const {clamp,txt,pill,PAL,axes,atLeast,fmtNum}=BioLab.h;
const VOL={c12:{v:21.656,l:'12 fl oz drink',unit:'can'},c16:{v:28.875,l:'16 fl oz drink',unit:'can'},gal:{v:231,l:'1 gallon',unit:'can'},cuft:{v:1728,l:'1 cubic foot',unit:'box'}};
const V=sim=>VOL[sim.p.vol].v;
const isBox=sim=>atLeast('honors')&&sim.p.shape==='box';
const open=sim=>atLeast('ap')&&sim.p.open;
const best=sim=>open(sim)?0.5:1;
/* q = height ÷ width (diameter for a can, base side for a box). */
function dims(sim,q){const v=V(sim);if(isBox(sim)){const s=Math.cbrt(v/q);return {w:s,h:q*s};}const r=Math.cbrt(v/(2*Math.PI*q));return {w:2*r,h:2*q*r};}
function parts(sim,q){const {w,h}=dims(sim,q),ends=open(sim)?1:2;
 if(isBox(sim))return {side:4*w*h,ends:ends*w*w,w,h};const r=w/2;return {side:2*Math.PI*r*h,ends:ends*Math.PI*r*r,w,h};}
const area=(sim,q)=>{const p=parts(sim,q);return p.side+p.ends;};
const cost=sim=>atLeast('honors')?sim.p.cost:0.8;           /* dollars per 1,000 in² */
const perMillion=(sim,a)=>a*cost(sim)*1000;                 /* a in² × ($/1000 in²) × 1,000,000 */
const word=sim=>isBox(sim)?'box':'can';
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const money=v=>'$'+Math.round(v).toLocaleString('en-US');
/* While the student is still shaping by eye in Guided, the picture does not count the material. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const clearGut=sim=>{if(sim.gutS&&sim.gutS.g){sim.gutS.g=null;sim.gutS.m=null;BioLab.gutRender(sim);}};
/* A fixed drawing scale for each volume and shape, so the pictures grow and shrink honestly as you drag. */
const SC={};
function scaleFor(sim){const key=sim.p.vol+(isBox(sim)?'b':'c');if(SC[key])return SC[key];let W=0,H=0;
 for(let q=0.25;q<=4.001;q+=0.05){const {w,h}=dims(sim,q);if(isBox(sim)){W=Math.max(W,4*w);H=Math.max(H,h+2*w);}else{W=Math.max(W,Math.PI*w);H=Math.max(H,h+2*w);}}
 return SC[key]=Math.min(420/W,330/H);}

const SIM={
 id:'packaging',hash:'packaging',apUnit:12,order:2,tab:'Least material package',kind:'Simulation',
 card:'Shape a can by eye, then use surface area and volume to find the design that uses the least aluminum.',
 title:'Design a can with the least metal',
 lede:{bio:'Every can holds a set amount. Make it tall and skinny or short and wide and it still holds the same, but the amount of metal changes. Across millions of cans, that difference is real money.',
  honors:'Volume fixes the size: V = πr²h. Surface area, 2πr² + 2πrh, is the material. For a closed can, the least material comes when the height equals the diameter (h = 2r). For a box with a square base, it is a cube.',
  ap:'Substitute h = V ÷ (πr²): A(r) = 2πr² + 2V/r. The minimum is at r = ∛(V ÷ 2π), which gives h = 2r. With no lid, A(r) = πr² + 2V/r and the minimum moves to h = r.'},
 scale:'Left: your container, drawn to scale. Right: the same container cut open and laid flat. Its area is the material you pay for.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your design',
 controls:[
  {id:'q',label:'Your shape: height ÷ width',type:'range',min:0.25,max:4,step:0.05,def:2.5,help:'Left is short and wide, right is tall and skinny. It always holds the same amount.'},
  {id:'vol',label:'It must hold',type:'select',def:'c12',noGut:true,onChange:clearGut,options:[{v:'c12',l:'12 fl oz (21.66 in³)'},{v:'c16',l:'16 fl oz (28.88 in³)'},{v:'gal',l:'1 gallon (231 in³)'},{v:'cuft',l:'1 cubic foot (1,728 in³)'}]},
  {id:'shape',label:'Container',type:'seg',def:'can',lvl:'honors',onChange:clearGut,options:[{v:'can',l:'Can (cylinder)'},{v:'box',l:'Box (square base)'}]},
  {id:'cost',label:'Material cost per 1,000 in² (an assumption)',type:'range',min:0.2,max:2,step:0.1,def:0.8,d:2,unit:' dollars',lvl:'honors',noGut:true,help:'A round number for illustration, not a market price.'},
  {id:'open',label:'Open top (no lid)',type:'toggle',def:false,lvl:'ap',onChange:clearGut,help:'Like a cup, a tray or a planter.'}
 ],
 actions:[{id:'best',label:'Use the least material',lvl:'honors',run(sim){BioLab.setValues(sim,{q:best(sim)});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'w',label:'Width',unit:'in',d:2,min:0,max:null,get:sim=>dims(sim,sim.p.q).w},
  {id:'h',label:'Height',unit:'in',d:2,min:0,max:null,get:sim=>dims(sim,sim.p.q).h},
  {id:'A',label:'Material (surface area)',unit:'in²',d:1,min:0,max:null,get:sim=>area(sim,sim.p.q)},
  {id:'Abest',label:'Least possible material',unit:'in²',d:1,lvl:'honors',min:0,max:null,get:sim=>area(sim,best(sim))},
  {id:'extra',label:'Extra material vs. the best',unit:'%',d:1,lvl:'honors',min:0,max:null,get:sim=>100*(area(sim,sim.p.q)/area(sim,best(sim))-1)},
  {id:'usd',label:'Material cost per million',unit:'dollars',d:0,lvl:'honors',min:0,max:null,get:sim=>perMillion(sim,area(sim,sim.p.q))}
 ],
 graphs:[{id:'curve',label:'Material vs. shape',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const b=area(sim,best(sim)),top=area(sim,0.25)>area(sim,4)?area(sim,0.25):area(sim,4);
  const ax=axes(ctx,box,{xmin:0,xmax:4,ymin:Math.floor(b*0.9/10)*10,ymax:Math.ceil(top*1.02/10)*10,xl:'Height ÷ width',yl:'Material (in²)'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let q=0.25;q<=4.0001;q+=0.025){const X=ax.X(q),Y=ax.Y(area(sim,q));q<0.26?ctx.moveTo(X,Y):ctx.lineTo(X,Y);}ctx.stroke();
  const G=sim.gutS||{},dot=(q,c,l,up)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(ax.X(q),ax.Y(area(sim,q)),6,0,7);ctx.fill();txt(ctx,l,ax.X(q),ax.Y(area(sim,q))+(up?-12:20),{s:12,w:700,c,a:'center'});};
  if(G.g)dot(G.g.q,PAL['s4'],'Your gut',false);
  if(atLeast('honors')||G.m)dot(best(sim),PAL['s3'],'Best',true);
  dot(sim.p.q,PAL['rj'],'You',!!(G.g&&Math.abs(G.g.q-sim.p.q)<0.3));},
 draw(sim,ctx,vdt,k){const sc=scaleFor(sim),P=parts(sim,sim.p.q),w=P.w*sc,h=P.h*sc,box=isBox(sim),op=open(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const metal=box?'#c79a5b':'#9aa7b4',edge=box?'#7d5a2b':'#5b6774';
  /* the container */
  const cx=165,base=330,ls=12.5*k;
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,base,330,6);
  if(box){const d=w*0.35;ctx.fillStyle=metal;ctx.strokeStyle=edge;ctx.lineWidth=2;
   ctx.beginPath();ctx.rect(cx-w/2-d/2,base-h,w,h);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.moveTo(cx+w/2-d/2,base);ctx.lineTo(cx+w/2+d/2,base-d*0.6);ctx.lineTo(cx+w/2+d/2,base-h-d*0.6);ctx.lineTo(cx+w/2-d/2,base-h);ctx.closePath();ctx.globalAlpha=.8;ctx.fill();ctx.globalAlpha=1;ctx.stroke();
   ctx.beginPath();ctx.moveTo(cx-w/2-d/2,base-h);ctx.lineTo(cx-w/2+d/2,base-h-d*0.6);ctx.lineTo(cx+w/2+d/2,base-h-d*0.6);ctx.lineTo(cx+w/2-d/2,base-h);ctx.closePath();ctx.fillStyle=op?PAL['cv-bg2']:'#d9b47c';ctx.fill();ctx.stroke();}
  else{const ry=w*0.16;ctx.fillStyle=metal;ctx.strokeStyle=edge;ctx.lineWidth=2;
   ctx.beginPath();ctx.ellipse(cx,base-ry,w/2,ry,0,0,Math.PI);ctx.lineTo(cx-w/2,base-h-ry);ctx.ellipse(cx,base-h-ry,w/2,ry,0,Math.PI,0,true);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.ellipse(cx,base-h-ry,w/2,ry,0,0,7);ctx.fillStyle=op?PAL['cv-bg2']:'#c3ccd5';ctx.fill();ctx.stroke();}
  txt(ctx,(gutPhase(sim)?'Your can: ':'')+f2(P.w)+' in wide × '+f2(P.h)+' in tall',cx,base+32,{s:ls,w:700,a:'center'});
  txt(ctx,'Holds '+VOL[sim.p.vol].l.replace(' drink',''),cx,base+32+ls+8,{s:ls,a:'center',c:PAL['cv-soft']});
  /* the net */
  const nx=575,ny=215;ctx.fillStyle=metal;ctx.strokeStyle=edge;ctx.lineWidth=1.5;
  if(box){const x0=nx-2*w,y0=ny-h/2;for(let i=0;i<4;i++){ctx.beginPath();ctx.rect(x0+i*w,y0,w,h);ctx.fill();ctx.stroke();}
   ctx.fillStyle='#d9b47c';ctx.beginPath();ctx.rect(x0+w,y0+h,w,w);ctx.fill();ctx.stroke();if(!op){ctx.beginPath();ctx.rect(x0+w,y0-w,w,w);ctx.fill();ctx.stroke();}}
  else{const L=Math.PI*w,x0=nx-L/2,y0=ny-h/2,r=w/2;ctx.beginPath();ctx.rect(x0,y0,L,h);ctx.fill();ctx.stroke();
   ctx.fillStyle='#c3ccd5';ctx.beginPath();ctx.arc(nx,y0+h+r,r,0,7);ctx.fill();ctx.stroke();if(!op){ctx.beginPath();ctx.arc(nx,y0-r,r,0,7);ctx.fill();ctx.stroke();}}
  if(gutPhase(sim)){txt(ctx,'The metal for your '+word(sim)+', cut open and laid flat',nx,400,{s:12*k,a:'center',c:PAL['cv-soft']});pill(ctx,'Least metal? Lock in to find out.',nx,430,PAL['s2'],'#fff',13*Math.min(k,1.4));}
  else{txt(ctx,'Side '+f1(P.side)+' in²  +  '+(op?'bottom ':'ends ')+f1(P.ends)+' in²',nx,400,{s:12*k,a:'center',c:PAL['cv-soft']});
  pill(ctx,'Material: '+f1(P.side+P.ends)+' in²',nx,430,PAL['rj'],'#fff',13*k);}
  const G=sim.gutS;if(G&&G.g&&G.m&&k<1.3)txt(ctx,'Your gut: '+f1(G.g.v)+' in²',cx,442,{s:12,w:700,c:PAL['s4'],a:'center'});},
 narrate(sim){const q=sim.p.q,b=best(sim),ex=100*(area(sim,q)/area(sim,b)-1),w=word(sim);
  if(Math.abs(q-b)<0.03)return `<b>This is the least-material ${w}.</b> ${open(sim)?'With no lid, the best height is half the width.':(isBox(sim)?'For a closed box with a square base, that is a cube.':'For a closed can, the height equals the diameter.')}`;
  return q>b?`This ${w} is tall and skinny, using ${f1(ex)}% more material than the best. <b>Its side wraps a lot of area</b> around a narrow middle.`:`This ${w} is short and wide, using ${f1(ex)}% more material than the best. <b>Its ${open(sim)?'bottom is':'top and bottom are'} huge</b> for how little height there is.`;},
 gut:{better:'lower',
  controls:['q'],
  ask:{bio:'The can always holds 12 fl oz. Drag the slider here to make it taller or wider, and stop where you think it uses the least metal. Then lock it in.',
   honors:'Without looking at the graph or the readouts: drag the slider here to the shape you think uses the least material, then lock it in.'},
  lockLabel:'Lock in my can',
  lock(sim){const a=area(sim,sim.p.q),d=dims(sim,sim.p.q);return {v:a,q:sim.p.q,label:`${f2(d.w)} in wide × ${f2(d.h)} in tall: ${f1(a)} in²`};},
  solve(sim){const q=best(sim);sim.p.q=q;const a=area(sim,q),d=dims(sim,q);return {v:a,q,label:`${f2(d.w)} in wide × ${f2(d.h)} in tall: ${f1(a)} in²`};},
  how:{bio:'The volume is fixed, so choosing the width also sets the height. The math computes the surface area for every shape and finds the lowest point on the graph. For a closed can, it is where the height equals the width.',
   honors:'With V fixed, h = V ÷ (πr²), so the material is A = 2πr² + 2V/r. The first term grows as the can gets wider and the second as it gets skinnier. The table and graph show they balance when h = 2r.',
   ap:'A(r) = 2πr² + 2V/r. Setting A′(r) = 4πr − 2V/r² = 0 gives V = 2πr³, and then h = V ÷ (πr²) = 2r. That uses calculus; the graph finds the same point without it. With no lid, A = πr² + 2V/r and h = r.'},
  compare(sim,g,m){const d=g.v-m.v,pc=100*d/g.v,w=word(sim),usd=perMillion(sim,d);
   if(pc<0.5)return `Your gut was right on: your ${w} uses only ${f2(pc)}% more than the best. Your eye already balances a wide ${w} against a tall one, and the math shows exactly where they balance.`;
   return `The math ${w} uses <b>${f1(d)} in² less material</b> than yours (${f1(pc)}% less). At an assumed $${cost(sim).toFixed(2)} per 1,000 in² of metal, that is about <b>${money(usd)} saved per million ${w}s</b>.`;},
  again(sim){const o=['c12','c16','gal','cuft'];sim.p.vol=o[Math.floor(Math.random()*4)];if(atLeast('honors'))sim.p.shape=Math.random()<0.5?'can':'box';sim.p.q=[0.4,2.5,3.5][Math.floor(Math.random()*3)];}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'Three cans each hold 12 fl oz. Which uses the least aluminum?',choices:['Tall and skinny: 3 times as tall as it is wide','As tall as it is wide','Short and wide: a third as tall as it is wide'],correct:1,explain:'For a closed can, the least material comes when the height equals the diameter: about 3.02 in by 3.02 in, using 43.0 in². The tall can uses 48.2 in² and the short, wide one 49.7 in².'},
  {lvl:'bio',instant:true,q:'A cube box and a long, thin box hold the same amount. Which needs less cardboard?',choices:['The cube','The long, thin box','They need the same'],correct:0,explain:'Same volume does not mean same surface area. For a box with a square base, the cube uses the least material. A 1 cubic foot cube needs 864 in²; a box 4 times as tall as it is wide needs about 1,029 in².'},
  {lvl:'honors',instant:true,q:'You double every dimension of a can. What happens to its volume and its material?',choices:['Both double','Volume × 8, material × 4','Volume × 4, material × 8','Both × 4'],correct:1,explain:'Volume depends on length × length × length, so it grows by 2³ = 8. Area depends on length × length, so it grows by 2² = 4. Bigger containers use less material per unit of volume.'},
  {lvl:'honors',instant:true,q:'For the least material, a closed can’s height should equal what?',choices:['Its radius','Its diameter','Its circumference','Twice its diameter'],correct:1,explain:'The minimum is at h = 2r, which is the diameter. Seen from the side, the best can is a square.'},
  {lvl:'ap',instant:true,q:'An open-top can (no lid) must hold a fixed volume. For the least material, how does its height compare with its radius?',choices:['h = r','h = 2r','h = r/2','h = 4r'],correct:0,explain:'A(r) = πr² + 2V/r, so A′(r) = 2πr − 2V/r² = 0 gives V = πr³. Then h = V ÷ (πr²) = r. With one end gone, it pays to make the can shorter and wider.'},
  {lvl:'ap',instant:true,q:'Suppose a can’s top and bottom cost twice as much per square inch as its wall, because they are made of thicker metal. Where is the cheapest can?',choices:['h = r','h = 2r','h = 4r, twice as tall as it is wide','h = 8r'],correct:2,explain:'Cost ∝ 2 × 2πr² + 2πrh = 4πr² + 2V/r. Setting the derivative 8πr − 2V/r² to 0 gives V = 4πr³, so h = V ÷ (πr²) = 4r. Costlier ends push the best can taller, one reason real drink cans are about twice as tall as they are wide.'}
 ],
 tour:[
  {title:'Same volume, different shapes',text:'This can holds 12 fl oz (21.66 in³), and so will every can you make here. Drag the shape and the width and height change together so the volume stays the same.',focus:[0,40,330,410],pause:true,setup:sim=>BioLab.setValues(sim,{vol:'c12',shape:'can',open:false,q:3})},
  {title:'Cut it open',text:'Unroll the side and it is a rectangle: the circumference (π × diameter) by the height. Add the top and bottom circles. Their total area is the metal you pay for.',focus:[340,0,460,450],pause:true},
  {title:'Too tall',text:'At 3 times as tall as it is wide, the side rectangle is huge: 48.2 in² in all.',pause:true},
  {title:'Too wide',text:'Squash it to a third as tall as it is wide and the top and bottom circles take over: 49.7 in².',pause:true,setup:sim=>BioLab.setValues(sim,{q:1/3})},
  {title:'The balance point',text:'In between, the material bottoms out at 43.0 in², when the height equals the diameter: 3.02 in by 3.02 in.',pause:true,setup:sim=>BioLab.setValues(sim,{q:1})},
  {title:'Why it matters',text:'Saving even 1 in² per can, at an assumed $0.80 per 1,000 in², saves $800 for every million cans. Drink makers fill billions of cans a year.',pause:true},
  {lvl:'ap',title:'The formula',text:'A(r) = 2πr² + 2V/r. The minimum is at r = ∛(V ÷ 2π) = ∛(21.66 ÷ 6.283) = 1.51 in, so h = 2r = 3.02 in.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> Which can shape uses the least metal?</p><ol><li>Set <b>Shape</b> to 0.5, 1, 1.5, 2, 3 and 4. Record a trial each time.</li><li>Graph Trials with shape on x and material on y.</li></ol><p>Write one sentence: where is the lowest point, and what does that can look like?</p>',
  honors:'<p><b>Question:</b> Does the best shape depend on the size?</p><ol><li>For each volume, press <b>Use the least material</b> and record width, height and material.</li><li>Repeat with Box.</li><li>What stays the same, and what changes?</li></ol>',
  ap:'<p><b>Question:</b> How does removing the lid change the best can?</p><ol><li>Write A(r) for a closed can and an open can with the same V.</li><li>Find each minimum with a table of values, then with A′(r) = 0.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the derivative.</p>'},
 terms:[
  {t:'Volume',d:'How much a container holds. For a cylinder, V = πr²h; for a box, length × width × height.'},
  {t:'Surface area',d:'The total area of all the faces. For a closed cylinder, 2πr² + 2πrh. It measures the material.'},
  {t:'Net',d:'A 3D shape cut open and laid flat. A cylinder’s net is a rectangle and two circles.'},
  {t:'Optimization',d:'Finding the best value of something, like the least material for a fixed volume.',lvl:'honors'},
  {t:'Derivative',d:'In calculus, the rate of change of a function. At a minimum of a smooth curve, it is zero.',lvl:'ap'}
 ],
 about:'<p><b>Model:</b> a closed cylinder has surface area 2πr² + 2πrh and volume πr²h; a box with a square base of side s has 2s² + 4sh and s²h. Open tops drop one end. Material is the surface area, as if the metal or cardboard were all the same thickness, with no seams, rims or overlaps.</p><p><b>Cost</b> uses an assumed price per area (you can change it at Closer look). It is a round number for illustration, not a market price.</p><p><b>Real cans are not exactly h = 2r</b>, for good reasons: the top and bottom are made of thicker metal than the thin wall, which pushes the cheapest shape taller; a narrower can is easier to hold; the bottom is domed and the top is necked in; and cans must fit machines, cartons and shelves. The volumes listed are the stated contents; real cans also leave a little headspace.</p>'
};
BioLab.register(SIM);
})();
