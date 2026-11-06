(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
const SPORT={soccer:{half:7.32/2,name:'soccer goal',posts:'goalposts',width:7.32},rugby:{half:5.6/2,name:'rugby posts',posts:'posts',width:5.6}};
const S=12,X0=256,Y0=34;                    /* 12 px per meter; goal center at (256,34) */
const PX=x=>X0+x*S,PY=y=>Y0+y*S;
const half=sim=>SPORT[sim.p.sport].half;
/* Angle (degrees) the goal fills from a point c m to the side of the goal's center and y m out from the goal line. */
function ang(c,y,a){if(y<=0)return 0;return (Math.atan((c+a)/y)-Math.atan((c-a)/y))*180/Math.PI;}
const best=(c,a)=>Math.sqrt(Math.max(0,c*c-a*a));
/* Shots on frame per 100, if a shot aimed at the middle of the window misses by a normal error with this spread (degrees). */
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const onFrame=(deg,sd)=>100*erf(deg/2/(sd*Math.SQRT2));
const cur=sim=>ang(sim.p.lane,sim.p.y,half(sim));
const f1=v=>fmtNum(v,1);
/* A new lane or sport is a new problem: drop any old gut and math answers. */
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}

const SIM={
 id:'shotangle',hash:'shotangle',apUnit:10,order:3,tab:'Best shooting angle',kind:'Simulation',
 card:'Pick where you would shoot from by feel, then let the circles find the spot that shows you the most goal.',
 title:'The best angle to shoot from',
 lede:{bio:'Running down the wing, when should you shoot? Too far out and the goal looks small. Too close and the posts squeeze together. Somewhere in between is the spot where the goal looks widest.',
  honors:'Every point on a circle through the two posts sees the goal at the same angle: that is the inscribed angle theorem. The best spot on your lane is where one of those circles just touches it.',
  ap:'For a lane c meters from the goal’s center and posts a meters from it, the window peaks at y* = √(c² − a²): the geometric mean of your distances to the near and far post, measured along the goal line.'},
 scale:'Seen from above. One grid square is 2 m. A soccer goal is 7.32 m wide; rugby posts are 5.6 m apart.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your run',
 controls:[
  {id:'sport',label:'Sport',type:'seg',def:'soccer',noGut:true,onChange:clearGut,options:[{v:'soccer',l:'Soccer'},{v:'rugby',l:'Rugby kick'}],help:'Rugby: after a try, the kicker may place the ball anywhere on a line straight back from where it was scored.'},
  {id:'lane',label:'Your lane: meters to the side of the goal’s center',type:'range',min:5,max:28,step:0.5,def:12,unit:' m',noGut:true,onChange:clearGut},
  {id:'y',label:'Shoot from: meters out from the goal line',type:'range',min:0.5,max:32,step:0.1,def:24,unit:' m'},
  {id:'circles',label:'Show the circles',type:'toggle',def:false,lvl:'honors',help:'Circles through both posts. Every point on one circle sees the goal at the same angle.'},
  {id:'sd',label:'Your aim wanders (1 standard deviation)',type:'range',min:2,max:10,step:0.5,def:5,unit:'°',lvl:'ap',help:'How far a shot typically strays from where you aim. 5° is an assumption for a solid shooter, not a measured value.'}
 ],
 actions:[{id:'best',label:'Move to the best spot',lvl:'honors',run(sim){BioLab.setValues(sim,{y:+best(sim.p.lane,half(sim)).toFixed(1)});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'deg',label:'Goal window',unit:'°',d:1,min:0,max:60,get:cur},
  {id:'frame',label:'Shots on frame per 100',unit:'',d:0,min:0,max:100,get:sim=>onFrame(cur(sim),atLeast('ap')?sim.p.sd:5)},
  {id:'ystar',label:'Best spot on this lane',unit:'m out',d:1,lvl:'honors',min:0,max:null,get:sim=>best(sim.p.lane,half(sim))},
  {id:'best',label:'Best possible window',unit:'°',d:1,lvl:'honors',min:0,max:60,get:sim=>{const a=half(sim);return ang(sim.p.lane,best(sim.p.lane,a),a);}}
 ],
 graphs:[{id:'curve',label:'Window vs. distance out',custom:true}],defaultGraph:'curve',
 plot(sim,ctx,box){const a=half(sim),c=sim.p.lane,ys=best(c,a),top=Math.max(10,Math.ceil(ang(c,ys,a)/5)*5);
  const ax=axes(ctx,box,{xmin:0,xmax:32,ymin:0,ymax:top,xl:'Meters out from the goal line',yl:'Goal window (°)'});
  ctx.strokeStyle=PAL['g-line'];ctx.lineWidth=2.5;ctx.beginPath();for(let y=0.2;y<=32;y+=0.2){const px=ax.X(y),py=ax.Y(ang(c,y,a));y<0.3?ctx.moveTo(px,py):ctx.lineTo(px,py);}ctx.stroke();
  const dot=(y,col,lab,up)=>{const v=ang(c,y,a);ctx.fillStyle=col;ctx.beginPath();ctx.arc(ax.X(y),ax.Y(v),6,0,7);ctx.fill();txt(ctx,lab,ax.X(y),ax.Y(v)+(up?-12:20),{s:12,w:700,c:col,a:'center'});};
  const G=sim.gutS;if(G&&G.g)dot(G.g.y,PAL['s4'],'Your gut',false);
  if(atLeast('honors')||(G&&G.m))dot(ys,PAL['s3'],'Best',true);
  dot(sim.p.y,PAL['rj'],'You',G&&G.g&&Math.abs(G.g.y-sim.p.y)<1.5?true:false);},
 draw(sim,ctx,vdt,k){const a=half(sim),c=sim.p.lane,y=sim.p.y,rug=sim.p.sport==='rugby';
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* grass stripes and a 2 m grid */
  for(let i=0;i<9;i++){if(i%2){ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,Y0+i*4*S,800,4*S);}}
  ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.globalAlpha=.45;for(let x=-20;x<=44;x+=2){ctx.beginPath();ctx.moveTo(PX(x),Y0);ctx.lineTo(PX(x),450);ctx.stroke();}for(let yy=0;yy<=36;yy+=2){ctx.beginPath();ctx.moveTo(0,PY(yy));ctx.lineTo(800,PY(yy));ctx.stroke();}ctx.globalAlpha=1;
  /* pitch markings */
  ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,Y0);ctx.lineTo(800,Y0);ctx.stroke();
  ctx.globalAlpha=.5;if(!rug){ctx.strokeRect(PX(-20.16),Y0,40.32*S,16.5*S);ctx.strokeRect(PX(-9.16),Y0,18.32*S,5.5*S);}else{ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(0,PY(22));ctx.lineTo(800,PY(22));ctx.stroke();ctx.setLineDash([]);txt(ctx,'22 m line',PX(-19),PY(22)-6,{s:12*k,c:PAL['cv-soft']});}ctx.globalAlpha=1;
  /* circles through both posts */
  const ys=best(c,a);
  if(sim.p.circles){ctx.lineWidth=1.5;[6,10,16,24].forEach(k2=>{const r=Math.hypot(a,k2);ctx.strokeStyle=PAL['cv-soft'];ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(PX(0),PY(k2),r*S,0,7);ctx.stroke();});ctx.globalAlpha=1;
   ctx.strokeStyle=PAL['s3'];ctx.lineWidth=3;ctx.beginPath();ctx.arc(PX(0),PY(ys),c*S,0,7);ctx.stroke();
   ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(PX(0),PY(ys),4,0,7);ctx.fill();
   ctx.setLineDash([4,4]);ctx.strokeStyle=PAL['s3'];ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(PX(0),PY(ys));ctx.lineTo(PX(c),PY(ys));ctx.stroke();ctx.setLineDash([]);
   const by=PY(ys)+c*S+18;if(by<444)txt(ctx,'This circle just touches your lane',PX(0),by,{s:12*k,w:700,c:PAL['s3'],a:'center'});else txt(ctx,'This circle just touches your lane',PX(c)+(c>16?-12:12),Math.min(440,PY(ys)+34),{s:12*k,w:700,c:PAL['s3'],a:c>16?'right':'left'});}
  /* lane */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(PX(c),Y0);ctx.lineTo(PX(c),450);ctx.stroke();ctx.setLineDash([]);
  txt(ctx,rug?'Kicking line':'Your lane',PX(c)+8,440,{s:12*k,w:700,c:PAL['s2'],b:'bottom'});
  /* gut marker */
  const G=sim.gutS;if(G&&G.g&&Math.abs(G.g.y-y)>0.4){ctx.strokeStyle=PAL['s4'];ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(PX(c),PY(G.g.y),9,0,7);ctx.stroke();txt(ctx,'Your gut',PX(c)-14,PY(G.g.y)+4,{s:12*k,w:700,c:PAL['s4'],a:'right'});}
  /* window wedge */
  const sx=PX(c),sy=PY(y),l=PX(-a),r=PX(a);
  ctx.fillStyle=PAL['rj'];ctx.globalAlpha=.18;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(l,Y0);ctx.lineTo(r,Y0);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['rj'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(l,Y0);ctx.lineTo(sx,sy);ctx.lineTo(r,Y0);ctx.stroke();
  /* posts */
  ctx.fillStyle=PAL['cv-ink'];[l,r].forEach(px=>{ctx.beginPath();ctx.arc(px,Y0,5,0,7);ctx.fill();});
  if(!rug){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(l,Y0);ctx.lineTo(l,Y0-12);ctx.lineTo(r,Y0-12);ctx.lineTo(r,Y0);ctx.stroke();}
  txt(ctx,rug?'Posts 5.6 m apart':'Goal 7.32 m wide',(l+r)/2,Y0-16,{s:12*k,w:700,a:'center'});
  /* shooter and angle label */
  ctx.fillStyle=PAL['rj'];ctx.beginPath();ctx.arc(sx,sy,8,0,7);ctx.fill();ctx.strokeStyle=PAL['card'];ctx.lineWidth=2;ctx.stroke();
  pill(ctx,f1(cur(sim))+'° of goal',sx+(c>16?-70:72),Math.min(430,sy+4),PAL['rj'],'#fff',13*Math.min(k,1.3));
  txt(ctx,f1(y)+' m out',sx+14,sy-12,{s:12*k,c:PAL['cv-soft']});},
 onClick(sim,x,y){const yy=clamp((y-Y0)/S,0.5,32);BioLab.setValues(sim,{y:+yy.toFixed(1)});},
 narrate(sim){const a=half(sim),c=sim.p.lane,y=sim.p.y,ys=best(c,a),d=cur(sim);
  if(Math.abs(y-ys)<0.6)return `<b>You are at the best spot.</b> From ${f1(y)} m out, the goal fills ${f1(d)}° of your view. Move either way along your lane and it shrinks.`;
  if(y>ys)return `From ${f1(y)} m out the goal fills ${f1(d)}°. <b>Getting closer still helps:</b> the two posts spread farther apart in your view.`;
  return `From ${f1(y)} m out the goal fills ${f1(d)}°. <b>You have gone past the best spot:</b> you are so close to the goal line that the posts are squeezed toward one side of your view.`;},
 gut:{better:'higher',controls:['y'],
  ask:{bio:'Where along your lane would you shoot from? Drag <b>Shoot from</b>, or click the field, to your gut spot. Then lock it in.',honors:'Before you show the circles: where along your lane would you shoot from? Set <b>Shoot from</b> by feel, then lock it in.'},
  lock(sim){const d=cur(sim);return {v:d,y:sim.p.y,label:`${f1(sim.p.y)} m out, a ${f1(d)}° window`};},
  solve(sim){const a=half(sim),ys=best(sim.p.lane,a);sim.p.y=+ys.toFixed(1);if(atLeast('honors'))sim.p.circles=true;const d=cur(sim);return {v:d,y:sim.p.y,label:`${f1(sim.p.y)} m out, a ${f1(d)}° window`};},
  how:{bio:'The math draws circles through both posts. Every spot on one circle sees the goal at the same angle, and smaller circles see it wider. The smallest circle that still reaches your lane touches it at exactly one spot, and that spot is the best one.',
   ap:'The circle through both posts that is tangent to x = c has radius c, so its center sits √(c² − a²) out from the goal line. The tangent point is at that same distance: y* = √(c² − a²).'},
  compare(sim,g,m){const sd=atLeast('ap')?sim.p.sd:5,fg=onFrame(g.v,sd),fm=onFrame(m.v,sd),gain=m.v-g.v;
   if(gain<0.15)return `Your gut was right on. You found the best spot within ${f1(Math.abs(g.y-m.y))} m: practice has already taught your eyes this geometry. On frame: about ${Math.round(fm)} shots out of 100 either way.`;
   return `The math spot shows you <b>${f1(gain)}° more goal</b> (${Math.round(gain/g.v*100)}% wider). With your aim wandering about ${f1(sd)}°, that is roughly <b>${Math.max(1,Math.round(fm-fg))} more shot${Math.max(1,Math.round(fm-fg))===1?'':'s'} on frame out of every 100</b> (${Math.round(fg)} → ${Math.round(fm)}). Your gut was ${f1(Math.abs(g.y-m.y))} m ${g.y>m.y?'too far out':'too close'}.`;},
  again(sim){const r=Math.random();sim.p.sport=r<0.3?'rugby':'soccer';sim.p.lane=Math.round((6+Math.random()*18)*2)/2;sim.p.y=26;sim.p.circles=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'You run straight down a lane 12 m to the side of the goal’s center. As you get closer to the goal line, what happens to how much goal you can see?',choices:['It keeps getting bigger the closer you get','It gets bigger, then shrinks again near the goal line','It stays about the same'],correct:1,explain:'Far out, getting closer spreads the posts apart: about 12° at 30 m, rising to 17.8° at 11.4 m. Past that, the posts squeeze toward one side, and right at the goal line the window falls to almost nothing.'},
  {lvl:'bio',instant:true,q:'Two wingers: one runs a lane 8 m from the goal’s center, the other 16 m. Whose best spot is farther from the goal line?',choices:['The 8 m lane','The 16 m lane','Both are the same distance out'],correct:1,explain:'The wider lane’s best spot is 15.6 m out, against 7.1 m for the 8 m lane. A wider lane needs a bigger circle to reach it, so the touching point sits farther out. The wider winger also gets a smaller best window: 13.2° against 27.2°.'},
  {lvl:'honors',instant:true,q:'You stand anywhere on one circle that passes through both posts (on the field side). How does the goal’s angle change as you walk along that circle?',choices:['It grows as you walk toward the middle','It stays exactly the same','It shrinks as you walk toward the middle'],correct:1,explain:'Inscribed angle theorem: every inscribed angle that intercepts the same arc is half that arc’s central angle, so the angle is identical everywhere on the circle. That is why circles are the right tool here.'},
  {lvl:'honors',instant:true,q:'Of all the circles through both posts that reach your lane, which one gives the best spot?',choices:['The biggest one','The one that just touches your lane at one point','The one whose center is on your lane'],correct:1,explain:'Smaller circles through the same two posts make bigger inscribed angles. The smallest circle that still reaches your lane touches it at exactly one point (it is tangent), so that point has the biggest angle on the lane.'},
  {lvl:'ap',instant:true,q:'Soccer posts are 3.66 m on each side of center. Your lane is 15 m from center. To the nearest 0.1 m, how far out is the best spot?',choices:['11.3 m','14.5 m','15.0 m','18.7 m'],correct:1,explain:'y* = √(c² − a²) = √(225 − 13.4) = √211.6 ≈ 14.5 m. It is always a little less than the lane distance, and it gets closer to it as the lane moves wider.'},
  {lvl:'ap',instant:true,q:'A rugby try is scored 20 m from the center of the posts (posts 2.8 m from center). The kicker moves back from 30 m out to the best spot. About how much bigger does the window get?',choices:['About 0.6°','About 3°','About 6°','It gets smaller'],correct:0,explain:'At 30 m: atan(22.8/30) − atan(17.2/30) ≈ 37.2° − 29.8° = 7.4°. At y* = √(400 − 7.84) ≈ 19.8 m: about 8.0°. That is only about 0.6° more (about 9% wider), and the kick is 10 m shorter. Out wide, the angle barely changes, so distance matters more.'}
 ],
 tour:[
  {title:'The goal and your lane',text:'You are seeing the field from above. The goal is at the top. The dashed line is your lane: you are running straight toward the goal line, 12 m to the side of the goal’s center.',focus:[[150,10,240,60],[370,34,40,416]],pause:true,setup:sim=>BioLab.setValues(sim,{lane:12,y:28,circles:false})},
  {title:'The window',text:'The red wedge is the part of your view the goal fills. Its angle is your shooting window: the bigger it is, the more room you have for error.',focus:sim=>[PX(-4)-10,Y0-20,PX(12)-PX(-4)+40,PY(28)-Y0+40],pause:true},
  {title:'Getting closer helps, at first',text:'Watch the window as you run in from 28 m to 12 m. The posts spread apart in your view, and the angle climbs.',pause:true,setup:sim=>BioLab.setValues(sim,{y:12})},
  {title:'Too close shrinks it',text:'Now keep going to 2 m out. You are almost on the goal line, so both posts are off to one side of you and squeezed together. The window has shrunk again.',pause:true,setup:sim=>BioLab.setValues(sim,{y:2})},
  {lvl:'honors',title:'Circles of equal angle',text:'Each faint circle passes through both posts. From every point on one circle, the goal looks exactly the same size. That is the inscribed angle theorem.',pause:true,setup:sim=>BioLab.setValues(sim,{y:2,circles:true})},
  {title:'The best spot',text:'The best spot is where a circle through both posts just touches your lane. Here, that is 11.4 m out, with a 17.8° window. Any other spot on your lane sits on a bigger circle, and bigger circles see the goal narrower.',pause:true,setup:sim=>BioLab.setValues(sim,{y:11.4,circles:true}),focus:sim=>[PX(12)-30,PY(11.4)-30,60,60]},
  {lvl:'ap',title:'The formula',text:'That touching circle has radius c (your lane distance), and its center sits on the goal’s centerline, so the best spot is y* = √(c² − a²), where a is half the goal width. For c = 12 and a = 3.66, y* = 11.4 m.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> How does the best spot change as your lane moves wider?</p><ol><li>Set your lane to 6 m. Move <b>Shoot from</b> until the window is as big as you can get it. Record a trial.</li><li>Repeat for lanes of 10, 14, 18 and 22 m.</li><li>Graph <b>Trials</b> with your lane on x and best distance on y.</li></ol><p>Write one sentence: what pattern do you see?</p>',
  honors:'<p><b>Question:</b> Does the tangent-circle rule always find the best spot?</p><ol><li>For four lanes, find the biggest window by hand, then press <b>Move to the best spot</b>.</li><li>Record both for each lane.</li><li>Turn on the circles and explain why the touching circle wins.</li></ol>',
  ap:'<p><b>Question:</b> Show that the window is greatest at y* = √(c² − a²).</p><ol><li>Record the window at five distances on either side of y* for one lane.</li><li>Use tan(α − β) to write tan θ = 2ay / (y² + c² − a²), then explain why it is largest when y² = c² − a².</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning from the circle or the algebra.</p>'},
 terms:[
  {t:'Inscribed angle',d:'An angle whose vertex is on a circle and whose sides pass through two other points on the circle. Here, the vertex is you and the two points are the posts.'},
  {t:'Inscribed angle theorem',d:'An inscribed angle is half the central angle of the arc it intercepts, so every inscribed angle on the same arc is equal.',lvl:'honors'},
  {t:'Tangent',d:'A line that touches a circle at exactly one point. It is perpendicular to the radius there.',lvl:'honors'},
  {t:'Geometric mean',d:'√(pq). The best distance is the geometric mean of (c − a) and (c + a), your sideways distances to the near and far post.',lvl:'ap'}
 ],
 about:'<p>The window is θ = atan((c + a)/y) − atan((c − a)/y), for a lane c meters from the goal’s center, with posts a meters from center and you y meters out. It peaks at y* = √(c² − a²). Goal widths: soccer 7.32 m, rugby posts 5.6 m.</p><p><b>Shots on frame</b> assumes you aim at the middle of the window and your shot strays by a normal error with the spread shown (5° unless you change it at Deep dive). That spread is an assumption for illustration, not a measured value. Real chances also depend on distance, the keeper, defenders and shot power, so the widest angle is the best place to <i>aim from</i>, not always the best place to shoot. Rugby conversions have no keeper, but a longer kick is harder, so kickers trade angle against distance.</p>'
};
BioLab.register(SIM);
})();
