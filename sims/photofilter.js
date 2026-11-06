(function(){
'use strict';
const {clamp,lerp,rng,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
const IW=192,IH=108,NP=IW*IH;                 /* the photo: 192 × 108 = 20,736 pixels */
const PHOTOS={dark:{lo:12,hi:108,name:'too dark'},hazy:{lo:96,hi:214,name:'hazy'},flat:{lo:58,hi:170,name:'dull and flat'}};
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2),r0=v=>String(Math.round(v));
const sgn=v=>(v<0?'− ':'+ ')+Math.abs(v).toFixed(Math.abs(v-Math.round(v))<0.05?0:1);

/* ---------- original procedural scenes, true colors 0–255 ---------- */
function mix(a,b,t){return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];}
function lakeAbove(u,v){
 let c=mix([30,70,150],[245,190,140],Math.pow(clamp(v/0.62,0,1),1.2));
 const sd=Math.hypot((u-0.76)*1.78,v-0.27);c=c.map((x,i)=>x+[70,45,10][i]*Math.exp(-sd/0.09));if(sd<0.05)c=[255,246,220];
 [[0.14,0.13,0.09,0.05],[0.22,0.11,0.08,0.06],[0.3,0.14,0.07,0.04],[0.5,0.07,0.07,0.04],[0.57,0.09,0.06,0.035]].forEach(([cx,cy,rx,ry])=>{const e=((u-cx)/rx)**2+((v-cy)/ry)**2;if(e<1)c=mix(c,[250,238,236],0.9*(1-e)*(1-e)+0.1*(1-e));});
 const r1=0.36+0.07*Math.sin(u*7+1)+0.04*Math.sin(u*17)+0.015*Math.sin(u*41);
 if(v>r1){c=mix([105,100,150],[70,72,115],clamp((v-r1)/0.2,0,1));const sn=clamp((0.33-r1)/0.03,0,1)*clamp(1-(v-r1)/0.05,0,1);if(sn>0)c=mix(c,[236,238,248],sn);}
 const r2=0.5+0.05*Math.sin(u*5+2)+0.02*Math.sin(u*23);
 if(v>r2)c=mix([60,100,65],[30,62,42],clamp((v-r2)/0.12,0,1));
 return c;}
function lake(u,v,R){let c;
 if(v<0.62)c=lakeAbove(u,v);
 else if(v<0.86){const vm=1.24-v,uu=u+0.006*Math.sin(v*260);c=mix(lakeAbove(uu,vm),[15,40,70],0.38+0.08*Math.sin(v*140));}
 else c=[64+20*Math.sin(u*90),104,46];
 [[0.04,0.3],[0.09,0.36],[0.14,0.27],[0.86,0.33],[0.92,0.4],[0.97,0.3]].forEach(([tx,th])=>{const base=0.93,top=base-th,hw=0.045*(v-top)/th;if(v>top&&v<base&&Math.abs(u-tx)<hw)c=[22,48,32];if(v>=base&&v<0.97&&Math.abs(u-tx)<0.006)c=[60,40,25];});
 return c.map(x=>x+(R()-0.5)*12);}
let CITY=null;
function cityData(){if(CITY)return CITY;const R=rng(7),b=[];let x=-0.01;while(x<1){const w=0.045+R()*0.06,h=0.25+R()*0.38;b.push({x,w,top:0.84-h,sh:R()*0.3,lit:R()});x+=w+0.004;}
 const stars=[];for(let i=0;i<40;i++)stars.push([R(),R()*0.35]);CITY={b,stars,seed:R};return CITY;}
function city(u,v,R){const D=cityData();let c=mix([35,25,85],[252,150,95],Math.pow(clamp(v/0.75,0,1),1.4));
 D.stars.forEach(([sx,sy])=>{if(Math.abs(u-sx)<0.003&&Math.abs(v-sy)<0.006)c=[250,250,255];});
 const md=Math.hypot((u-0.2)*1.78,v-0.17);if(md<0.045)c=[246,242,225];else c=c.map(x=>x+30*Math.exp(-md/0.05));
 D.b.forEach(B=>{if(u>=B.x&&u<B.x+B.w&&v>=B.top&&v<0.84){c=mix([38,34,58],[18,16,30],B.sh+(u-B.x)/B.w*0.4);
   const cu=(u-B.x-0.006)/0.014,cv=(v-B.top-0.02)/0.04;if(cu>0&&cv>0&&(cu%1)<0.55&&(cv%1)<0.5){const h=Math.sin(Math.floor(cu)*12.9898+Math.floor(cv)*78.233+B.lit*100)*43758.5453;if(h-Math.floor(h)<0.4)c=[255,214,125];}}});
 if(v>=0.84){c=[42,40,52];if(v>0.91&&v<0.925&&(u*24)%1<0.5)c=[230,220,190];}
 [0.1,0.35,0.6,0.85].forEach(lx=>{const d=Math.hypot((u-lx)*1.78,v-0.8);c=c.map((x,i)=>x+[120,95,40][i]*Math.exp(-d/0.035));if(Math.abs(u-lx)<0.003&&v>0.8&&v<0.86)c=[70,70,80];});
 return c.map(x=>x+(R()-0.5)*10);}
const CACHE={};
/* Raw photo for scene + problem: integers lo..hi in each channel, plus each pixel's darkest and brightest channel. */
function photo(scene,ph){const key=scene+'|'+ph;if(CACHE[key])return CACHE[key];
 const R=rng(scene==='lake'?11:23),raw=new Float32Array(NP*3);let mn=1e9,mx=-1e9;
 for(let j=0;j<IH;j++)for(let i=0;i<IW;i++){const u=(i+0.5)/IW,v=(j+0.5)/IH,c=scene==='lake'?lake(u,v,R):city(u,v,R),o=(j*IW+i)*3;for(let q=0;q<3;q++){raw[o+q]=c[q];mn=Math.min(mn,c[q]);mx=Math.max(mx,c[q]);}}
 const P=PHOTOS[ph],px=new Uint8Array(NP*3),pmin=new Uint8Array(NP),pmax=new Uint8Array(NP),hist=new Float64Array(256);
 for(let n=0;n<NP*3;n++){px[n]=Math.round(P.lo+(P.hi-P.lo)*(raw[n]-mn)/(mx-mn));hist[px[n]]++;}
 for(let n=0;n<NP;n++){const a=px[3*n],b=px[3*n+1],c=px[3*n+2];pmin[n]=Math.min(a,b,c);pmax[n]=Math.max(a,b,c);}
 return (CACHE[key]={px,pmin,pmax,hist,lo:P.lo,hi:P.hi});}
const cur=sim=>photo(sim.p.scene,sim.p.photo);
/* The filter: contrast a about the middle, then brightness k, then (optionally) invert. Clipping to 0–255 comes last. */
const F=(x,a,k)=>a*(x-128)+128+k;
function stats(sim,a,k){const D=cur(sim);a=a===undefined?sim.p.a:a;k=k===undefined?sim.p.k:k;
 const key=sim.p.scene+sim.p.photo+'|'+a+'|'+k;if(sim._sc&&sim._sc.key===key)return sim._sc;
 const y0=F(D.lo,a,k),y1=F(D.hi,a,k),range=(clamp(y1,0,255)-clamp(y0,0,255))/255*100;
 let cl=0,dark=0,bright=0;for(let n=0;n<NP;n++){const lo=F(D.pmin[n],a,k)<-0.5,hi=F(D.pmax[n],a,k)>255.5;if(lo)dark++;if(hi)bright++;if(lo||hi)cl++;}
 const clip=cl/NP*100,score=Math.round(range*(100-clip)/100*1e6)/1e6;
 return (sim._sc={key,y0,y1,range,clip,score,cl,dark,bright});}
const levels=D=>{const a=255/(D.hi-D.lo);return {a,k:a*(128-D.lo)-128};};
const gutKey=sim=>sim.p.scene+'|'+sim.p.photo;
/* While the student is still editing by eye in Guided, the picture shows the photo, not the score. */
const gutPhase=sim=>sim.mode==='guided'&&!!sim.guide&&sim.guide.phase==='gut';
const warnOn=sim=>sim.p.warn&&!gutPhase(sim);
let OFF=null;
function render(sim){if(!OFF){OFF=document.createElement('canvas');OFF.width=IW;OFF.height=IH;}
 const key=gutKey(sim)+'|'+sim.p.a+'|'+sim.p.k+'|'+sim.p.inv+'|'+warnOn(sim);if(OFF._key===key)return OFF;
 const D=cur(sim),c=OFF.getContext('2d'),im=c.createImageData(IW,IH),a=sim.p.a,k=sim.p.k,inv=sim.p.inv;
 for(let n=0;n<NP;n++){let hiC=false,loC=false;for(let q=0;q<3;q++){const y=F(D.px[3*n+q],a,k);if(y>255.5)hiC=true;if(y<-0.5)loC=true;im.data[4*n+q]=clamp(Math.round(inv?255-y:y),0,255);}
  if(warnOn(sim)&&(hiC||loC)){const col=hiC?[255,40,90]:[40,110,255];for(let q=0;q<3;q++)im.data[4*n+q]=col[q];}
  im.data[4*n+3]=255;}
 c.putImageData(im,0,0);OFF._key=key;return OFF;}
function outHist(sim,a,k,inv){const D=cur(sim),h=new Float64Array(256);for(let x=0;x<256;x++){if(!D.hist[x])continue;let y=clamp(Math.round(F(x,a,k)),0,255);if(inv)y=255-y;h[y]+=D.hist[x];}return h;}
function drawHist(ctx,x0,y0,w,hgt,hist,col,fill,bins){bins=bins||64;const per=256/bins,b=new Float64Array(bins);for(let x=0;x<256;x++)b[Math.min(bins-1,Math.floor(x/per))]+=hist[x];
 let mx=1;for(let i=1;i<bins-1;i++)mx=Math.max(mx,b[i]);mx=Math.max(mx,0.25*Math.max(b[0],b[bins-1]));const bw=w/bins;
 for(let i=0;i<bins;i++){const v=Math.min(1,b[i]/mx)*hgt;if(v<=0)continue;ctx.globalAlpha=fill?0.85:1;ctx.fillStyle=col;if(fill)ctx.fillRect(x0+i*bw,y0+hgt-v,bw-0.5,v);}
 ctx.globalAlpha=1;if(!fill){ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(x0,y0+hgt);for(let i=0;i<bins;i++){const v=Math.min(1,b[i]/mx)*hgt;ctx.lineTo(x0+i*bw,y0+hgt-v);ctx.lineTo(x0+(i+1)*bw,y0+hgt-v);}ctx.lineTo(x0+w,y0+hgt);ctx.stroke();ctx.globalAlpha=1;}return b;}

const SIM={
 id:'photofilter',hash:'photofilter',apUnit:6,order:1,tab:'Photo filters',kind:'Simulation',
 card:'Fix a dull photo by eye with brightness and contrast, then let one function stretch it to use every level from 0 to 255.',
 title:'Every photo filter is a function',
 lede:{bio:'A pixel’s brightness is a number from 0 (black) to 255 (white). A filter is a rule that turns every old number into a new one. Brightness adds to every number; contrast stretches the numbers away from the middle.',
  honors:'Brightness is a vertical shift, f(x) + k. Contrast is a vertical stretch about the middle, a(x − 128) + 128. Invert is a reflection, 255 − x. Anything pushed past 0 or 255 is clipped, and its detail is gone.',
  ap:'A “levels” stretch is the one linear map that sends the darkest pixel to 0 and the brightest to 255: a = 255/(hi − lo) and k = a(128 − lo) − 128. It is a composition of a shift and a stretch, and as long as nothing clips it has an inverse, so the edit can be undone exactly.'},
 scale:'An original 192 × 108 pixel scene: 20,736 pixels, each storing three numbers (red, green, blue) from 0 to 255. Every filter applies the same function to all three.',
 aspect:16/9,timeless:true,trials:true,graph:true,
 controlsTitle:'Your edit',
 controls:[
  {id:'photo',label:'The problem photo',type:'seg',def:'dark',options:[{v:'dark',l:'Too dark'},{v:'hazy',l:'Hazy'},{v:'flat',l:'Dull'}]},
  {id:'scene',label:'Scene',type:'seg',def:'lake',options:[{v:'lake',l:'Mountain lake'},{v:'city',l:'City at dusk'}]},
  {id:'k',label:'Brightness (adds k to every value)',type:'range',min:-200,max:200,step:1,def:0,unit:'',help:'A vertical shift: f(x) + k.'},
  {id:'a',label:'Contrast (stretches about the middle, 128)',type:'range',min:0.2,max:4,step:0.01,def:1,unit:'×',help:'A vertical stretch: a(x − 128) + 128.'},
  {id:'inv',label:'Invert (255 − x)',type:'toggle',def:false,lvl:'honors',help:'A reflection: black becomes white.'},
  {id:'warn',label:'Highlight clipped pixels',type:'toggle',def:true,help:'Red: pushed past 255, now flat white. Blue: pushed below 0, now flat black.'}
 ],
 actions:[{id:'levels',label:'Stretch to fit (levels)',lvl:'honors',run(sim){const L=levels(cur(sim));BioLab.setValues(sim,{a:L.a,k:L.k,inv:false});}},
  {id:'undo',label:'Undo all edits',run(sim){BioLab.setValues(sim,{a:1,k:0,inv:false});}}],
 init(){return {};},step(){},
 onLevel(sim){const b=!atLeast('honors'),U=sim.ui.ctlW;if(!U)return;
  const set=(id,l,h)=>{const w=U[id];if(!w)return;const L=w.querySelector('label');if(L)L.textContent=l;const H=w.querySelector('.help');if(H)H.textContent=h;};
  set('k',b?'Your brightness':'Brightness (adds k to every value)',b?'Lighter or darker: adds the same amount to every pixel.':'A vertical shift: f(x) + k.');
  set('a',b?'Your contrast':'Contrast (stretches about the middle, 128)',b?'Spreads the darks and the lights farther apart.':'A vertical stretch: a(x − 128) + 128.');},
 metrics:[
  {id:'range',label:'Range used (of 0–255)',unit:'%',d:0,min:0,max:100,get:sim=>stats(sim).range},
  {id:'clip',label:'Pixels clipped (detail lost)',unit:'%',d:1,min:0,max:100,get:sim=>stats(sim).clip},
  {id:'outlo',label:'Darkest pixel becomes',unit:'',d:0,lvl:'honors',min:0,max:255,get:sim=>{const s=stats(sim),v=clamp(s.y0,0,255);return sim.p.inv?255-v:v;}},
  {id:'outhi',label:'Brightest pixel becomes',unit:'',d:0,lvl:'honors',min:0,max:255,get:sim=>{const s=stats(sim),v=clamp(s.y1,0,255);return sim.p.inv?255-v:v;}},
  {id:'fx',label:'Your filter',text:true,lvl:'ap',get:sim=>`${sim.p.inv?'255 − [':''}${f2(sim.p.a)}(x − 128) + 128 ${sgn(sim.p.k)}${sim.p.inv?']':''}, clipped to 0–255`}
 ],
 graphs:[{id:'hist',label:'Histogram: before and after',custom:true}],defaultGraph:'hist',
 plot(sim,ctx,box){const D=cur(sim),after=outHist(sim,sim.p.a,sim.p.k,sim.p.inv);
  const b0=new Float64Array(64),b1=new Float64Array(64);for(let x=0;x<256;x++){b0[x>>2]+=D.hist[x];b1[x>>2]+=after[x];}
  let mx=1;for(let i=1;i<63;i++)mx=Math.max(mx,b0[i],b1[i]);const top=Math.ceil(mx/3/100)*100;
  const ax=axes(ctx,box,{xmin:0,xmax:256,ymin:0,ymax:top,xl:'Brightness value (0 = black, 255 = white)',yl:'Values per bin of 4 levels'});
  ctx.save();ctx.beginPath();ctx.rect(box.L,box.T,box.W,box.H);ctx.clip();
  const bw=ax.X(4)-ax.X(0);
  for(let i=0;i<64;i++){const v=Math.min(b1[i]/3,top*1.2);ctx.fillStyle=(i===0||i===63)&&b1[i]>0&&stats(sim).cl>0?PAL['s1']:PAL['s2'];ctx.globalAlpha=.8;ctx.fillRect(ax.X(i*4),ax.Y(v),bw-1,ax.Y(0)-ax.Y(v));}
  ctx.globalAlpha=1;ctx.strokeStyle=PAL['muted'];ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<64;i++){const v=Math.min(b0[i]/3,top*1.2);const y=ax.Y(v);i?ctx.lineTo(ax.X(i*4),y):ctx.moveTo(ax.X(0),y);ctx.lineTo(ax.X(i*4+4),y);}ctx.stroke();
  ctx.restore();legend(ctx,box.L+10,box.T+8,[{label:'Before (the problem photo)',color:PAL['muted']},{label:'After your filter',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){const D=cur(sim),S=stats(sim),a=sim.p.a,kk=sim.p.k,inv=sim.p.inv,G=sim.gutS,same=G&&G.g&&G.g.key===gutKey(sim);
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  /* photo */
  const off=render(sim);ctx.imageSmoothingEnabled=true;ctx.drawImage(off,16,14,432,243);ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;ctx.strokeRect(15.5,13.5,433,244);
  /* histogram under the photo */
  const hx=16,hy=290,hw=432,hh=112;
  txt(ctx,'Histogram after the filter',hx,hy-8,{s:12*k,w:700});
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(hx,hy,hw,hh);
  const bins=drawHist(ctx,hx,hy,hw,hh,outHist(sim,a,kk,inv),PAL['s2'],true);
  drawHist(ctx,hx,hy,hw,hh,D.hist,PAL['cv-ink'],false);
  if(S.cl>0){const L0=inv?S.bright:S.dark,R0=inv?S.dark:S.bright;ctx.fillStyle=PAL['s1'];if(L0)ctx.fillRect(hx,hy,4,hh);if(R0)ctx.fillRect(hx+hw-4,hy,4,hh);}
  txt(ctx,'0',hx,hy+hh+14*k,{s:12*k,c:PAL['cv-soft']});txt(ctx,'255',hx+hw,hy+hh+14*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  txt(ctx,'outline: before',hx+hw/2,hy+hh+14*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  /* function graph */
  const gx=530,gy=30,gs=236,X=v=>gx+v/255*gs,Y=v=>gy+gs-v/255*gs;
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(gx,gy,gs,gs);
  ctx.fillStyle=PAL['s4'];ctx.globalAlpha=.14;ctx.fillRect(X(D.lo),gy,X(D.hi)-X(D.lo),gs);ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.strokeRect(gx,gy,gs,gs);
  ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(X(0),Y(0));ctx.lineTo(X(255),Y(255));ctx.stroke();ctx.setLineDash([]);
  const curve=(A,K,I,col,lw,dash)=>{ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.setLineDash(dash||[]);ctx.beginPath();for(let x=0;x<=255;x+=1){let y=clamp(F(x,A,K),0,255);if(I)y=255-y;x?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y));}ctx.stroke();ctx.setLineDash([]);};
  if(same)curve(G.g.a,G.g.k,G.g.inv,PAL['s4'],2.5,[7,4]);
  if(G&&G.m&&G.m.key===gutKey(sim)){const L=levels(D);curve(L.a,L.k,false,PAL['s3'],2.5,[2,3]);}
  curve(a,kk,inv,PAL['rj'],3);
  txt(ctx,'0',gx-6,gy+gs+4,{s:12*k,c:PAL['cv-soft'],a:'right'});txt(ctx,'255',gx+gs,gy+gs+15*k,{s:12*k,c:PAL['cv-soft'],a:'right'});txt(ctx,'255',gx-6,gy+12*k,{s:12*k,c:PAL['cv-soft'],a:'right'});
  txt(ctx,atLeast('honors')?'old value x →':'old value →',gx+gs/2,gy+gs+15*k,{s:12*k,c:PAL['cv-soft'],a:'center'});
  ctx.save();ctx.translate(gx-10,gy+gs/2+20);ctx.rotate(-Math.PI/2);txt(ctx,'new value →',0,0,{s:12*k,c:PAL['cv-soft'],a:'center'});ctx.restore();
  txt(ctx,'photo’s values',clamp(X((D.lo+D.hi)/2),gx+50*k,gx+gs-50*k),gy+16*k,{s:12*k,c:PAL['s4'],a:'center',w:700});
  /* readout under the graph */
  const lh=18*k;let y=gy+gs+20+lh;
  if(atLeast('honors')){txt(ctx,'f(x) = '+(inv?'255 − [':'')+f2(a)+'(x − 128)',gx-14,y,{s:13*k,w:700,c:PAL['rj']});y+=lh;txt(ctx,'+ 128 '+sgn(kk)+(inv?']':''),gx+20,y,{s:13*k,w:700,c:PAL['rj']});y+=lh+4;}
  else{const who=G&&G.m&&G.m.key===gutKey(sim)?'The math: ':'Your ';txt(ctx,who+'brightness '+sgn(kk),gx-14,y,{s:13*k,w:700,c:PAL['rj']});y+=lh;txt(ctx,who+'contrast ×'+f2(a),gx-14,y,{s:13*k,w:700,c:PAL['rj']});y+=lh+4;}
  if(gutPhase(sim)){txt(ctx,'How good is it? Lock in to find out.',gx-14,y,{s:13*k,c:PAL['cv-soft']});return;}
  txt(ctx,'Range used '+r0(S.range)+'%',gx-14,y,{s:13*k,c:PAL['cv-ink']});y+=lh;txt(ctx,'Clipped '+f1(S.clip)+'%',gx-14,y,{s:13*k,c:S.clip>0.05?PAL['s1']:PAL['cv-ink']});
  if(same&&y+lh<448)txt(ctx,'Your gut: dashed orange',gx-14,y+lh,{s:12*k,c:PAL['s4'],w:700});},
 narrate(sim){const D=cur(sim),S=stats(sim),r=Math.round(S.range),c=S.clip;
  if(S.score>99.9)return `<b>A perfect stretch.</b> The darkest value (${D.lo}) now lands on 0 and the brightest (${D.hi}) on 255, so the photo uses the whole range and no pixel loses its detail.`;
  if(c>=0.05&&r>=95)return `The photo now spans ${r}% of the range, but <b>${f1(c)}% of the pixels are clipped</b>: they were pushed past 0 or 255, so they turned flat black or white and their detail is gone.`;
  if(c>=0.05)return `<b>${f1(c)}% of the pixels are clipped</b> and the photo still uses only ${r}% of the range. Brightness slides everything together; it cannot spread the values apart.`;
  if(r<60)return `The photo uses only <b>${r}% of the 0–255 range</b>: its values sit in a narrow band, so everything looks ${sim.p.photo==='dark'?'dim':'gray and washed out'}. Contrast spreads them apart.`;
  return `The photo uses ${r}% of the range with nothing clipped. <b>There is still room to stretch:</b> the darkest value lands at ${Math.round(clamp(S.y0,0,255))}, not 0, and the brightest at ${Math.round(clamp(S.y1,0,255))}, not 255.`;},
 gut:{better:'higher',
  controls:['k','a'],
  ask:{bio:'Fix this photo by eye. Drag the two sliders here: brightness makes it lighter or darker, and contrast spreads the darks and lights apart. Stop when it looks its best, then lock it in.',honors:'Fix the photo by eye with the brightness and contrast sliders here, without pressing <b>Stretch to fit</b>. Then lock it in.'},
  lockLabel:'Lock in my edit',
  lock(sim){const S=stats(sim);return {v:S.score,a:sim.p.a,k:sim.p.k,inv:sim.p.inv,range:S.range,clip:S.clip,cl:S.cl,key:gutKey(sim),label:`a photo using ${r0(S.range)}% of the range with ${f1(S.clip)}% of pixels clipped`};},
  solve(sim){const D=cur(sim),L=levels(D);sim.p.a=L.a;sim.p.k=L.k;sim.p.inv=false;const S=stats(sim);return {v:S.score,a:L.a,k:L.k,range:S.range,clip:S.clip,key:gutKey(sim),label:`contrast ×${f2(L.a)} and brightness ${sgn(L.k)}: ${r0(S.range)}% of the range, ${f1(S.clip)}% clipped`};},
  how:{bio:'The math reads the histogram: the darkest value is the lowest number in the photo and the brightest is the highest. It picks the one stretch and shift that sends the darkest to 0 (pure black) and the brightest to 255 (pure white). Every level in between spreads out evenly, and nothing gets pushed off the ends.',
   honors:'For values from lo to hi, the stretch must turn a gap of (hi − lo) into a gap of 255, so a = 255/(hi − lo). Then choose the shift k so that a(lo − 128) + 128 + k = 0.',
   ap:'Solve the system f(lo) = 0, f(hi) = 255 for f(x) = a(x − 128) + 128 + k: subtracting gives a(hi − lo) = 255, so a = 255/(hi − lo), and then k = a(128 − lo) − 128. Equivalently f(x) = 255(x − lo)/(hi − lo).'},
  compare(sim,g,m){if(m.v-g.v<0.5)return `Your gut was right on: your edit uses ${r0(g.range)}% of the range with ${f1(g.clip)}% clipped, matching the math. Your eye was already finding the darkest and brightest spots and stretching them to black and white.`;
   const parts=[];if(g.clip>=0.05)parts.push(`<b>${g.cl.toLocaleString('en-US')} pixels</b> (${f1(g.clip)}% of the photo) were clipped to flat ${g.inv?'colors':'black or white'}, so their detail is gone for good`);
   if(g.range<99.5)parts.push(`your photo used only <b>${r0(g.range)}% of the 0–255 range</b>, so it stays ${g.range<60?'dim and flat':'a little flat'}`);
   return `The math stretch uses <b>100% of the range and clips no pixels</b>. In your version, ${parts.join(', and ')}.${g.range<99.5&&g.range>0.5?` The math photo has ${f1(100/g.range)} times the spread between its darkest and brightest spots.`:''}`;},
  again(sim){const ps=Object.keys(PHOTOS);sim.p.photo=ps[Math.floor(Math.random()*ps.length)];sim.p.scene=Math.random()<0.5?'lake':'city';sim.p.a=1;sim.p.k=0;sim.p.inv=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A photo’s brightest pixel is 230. You raise the brightness by 50. What happens to every value above 205?',choices:['It becomes brighter and keeps its detail','It is pushed past 255, so it clips to 255 and its detail is lost','Nothing: brightness only changes dark pixels'],correct:1,explain:'Brightness adds 50 to every value. 206 + 50 = 256 and 230 + 50 = 280 are past 255, so they all become 255. A cloud with values from 206 to 230 turns into one flat white blob.'},
  {lvl:'bio',instant:true,q:'A dark photo’s values run from 12 to 108. Which edit uses the whole 0–255 range without losing any detail?',choices:['Brightness +147 only','Contrast alone, as high as it goes','A stretch and a shift together, so 12 becomes 0 and 108 becomes 255','Invert'],correct:2,explain:'Brightness +147 sends 108 to 255 but 12 only to 159, using 38% of the range. High contrast alone clips both ends. Only a stretch plus a shift can land both ends exactly on 0 and 255.'},
  {lvl:'honors',instant:true,q:'A contrast filter is f(x) = 2(x − 128) + 128. Which old values clip?',choices:['None','Values below 64 or above 191.5','Values below 128','Values above 128'],correct:1,explain:'f(x) = 0 at x = 64, and f(x) = 255 at x = 191.5. Below 64 the output is negative and clips to 0; above 191.5 it passes 255 and clips to 255.'},
  {lvl:'honors',instant:true,q:'You invert a photo with g(x) = 255 − x. What happens to its histogram?',choices:['It flips left to right','It shifts right by 255','It gets taller','Nothing changes'],correct:0,explain:'A value at 40 moves to 215 and one at 200 moves to 55: the histogram is reflected about the middle. The range used and the clipping do not change, because the reflection keeps every gap the same size.'},
  {lvl:'ap',instant:true,q:'A photo runs from 30 to 180. For f(x) = a(x − 128) + 128 + k to send 30 to 0 and 180 to 255, what are a and k?',choices:['a = 1.7, k = 38.6','a = 1.7, k = −30','a = 1.42, k = 0','a = 2.55, k = −128'],correct:0,explain:'a = 255/(180 − 30) = 1.7. Then 1.7(30 − 128) + 128 + k = 0 gives −166.6 + 128 + k = 0, so k = 38.6. Check: 1.7(52) + 128 + 38.6 = 255.'},
  {lvl:'ap',instant:true,q:'Order matters. Shift first, then stretch: g(x) = a((x + k) − 128) + 128. Stretch first, then shift: f(x) = a(x − 128) + 128 + k. How far apart are they?',choices:['They are equal','g(x) − f(x) = (a − 1)k','g(x) − f(x) = ak','g(x) − f(x) = k'],correct:1,explain:'g(x) = a(x − 128) + 128 + ak, so g − f = ak − k = (a − 1)k. Composition is not commutative: with a = 2 and k = 30, the two orders differ by 30 levels.'}
 ],
 tour:[
  {title:'A photo is a grid of numbers',text:'This photo came out too dark. Each of its 20,736 pixels stores three numbers from 0 to 255. Here every number is between 12 and 108, so nothing is truly black or truly white.',focus:[10,8,444,256],pause:true,setup:sim=>BioLab.setValues(sim,{photo:'dark',scene:'lake',a:1,k:0,inv:false,warn:true})},
  {title:'The histogram',text:'The histogram counts how many values sit at each brightness. They are all bunched in the left part: a narrow, dark band. The right side, the bright half of the range, is empty.',focus:[10,270,444,170],pause:true},
  {title:'The filter is a function',text:'The graph on the right is the filter: old value in, new value out. Doing nothing is the dashed line y = x. The shaded band shows where this photo’s values sit.',focus:[490,20,290,280],pause:true},
  {title:'Brightness is a shift',text:'Brightness +100 lifts the whole graph by 100. The photo gets lighter, but the values stay just as bunched together: the band is 96 levels wide either way, so it still uses only 38% of the range.',pause:true,setup:sim=>BioLab.setValues(sim,{k:100})},
  {title:'Too much clips',text:'Now contrast ×3 with brightness +200. Values at both ends are pushed past the limits: red pixels went past 255 and turned flat white, blue ones went below 0 and turned flat black. Their detail is gone.',pause:true,setup:sim=>BioLab.setValues(sim,{k:200,a:3})},
  {title:'The levels stretch',text:'The math sends the darkest value, 12, to 0 and the brightest, 108, to 255. That takes contrast ×2.66 and brightness +180. The photo now uses 100% of the range, and no pixel is clipped.',pause:true,setup:sim=>{const L=levels(cur(sim));BioLab.setValues(sim,{a:L.a,k:L.k});}},
  {lvl:'honors',title:'Invert is a reflection',text:'Invert applies 255 − x after everything else. The graph flips upside down, black becomes white, and the histogram flips left to right.',pause:true,setup:sim=>BioLab.setValues(sim,{inv:true})},
  {lvl:'ap',title:'Solving for the stretch',text:'f(12) = 0 and f(108) = 255 give a(108 − 12) = 255, so a = 255/96 ≈ 2.66, and k = a(128 − 12) − 128 ≈ 180.1. That is f(x) = 255(x − 12)/96.',pause:true,setup:sim=>BioLab.setValues(sim,{inv:false})}
 ],
 lab:{bio:'<p><b>Question:</b> Can brightness alone fix a dark photo?</p><ol><li>Choose <b>Too dark</b>. Set brightness to 0, 50, 100 and 150, with contrast at 1. Record a trial each time.</li><li>Now try to reach 100% range with no clipping. Record your best.</li></ol><p>Write one sentence: what does brightness change, and what can it not change?</p>',
  honors:'<p><b>Question:</b> Which settings fix each photo?</p><ol><li>For each problem photo, read the darkest and brightest values from the histogram.</li><li>Predict a and k with a = 255/(hi − lo) and k = a(128 − lo) − 128.</li><li>Check with <b>Stretch to fit</b>. Record both.</li></ol>',
  ap:'<p><b>Question:</b> How much detail does an over-stretched filter destroy?</p><ol><li>Apply the levels stretch to the <b>Hazy</b> photo. Then raise contrast in steps of 0.25, keeping the middle fixed.</li><li>Record range used and pixels clipped each time.</li><li>Find the inverse of the levels map and explain why clipped pixels cannot be restored by it.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning about functions that are not one-to-one.</p>'},
 terms:[
  {t:'Pixel value',d:'A number from 0 (none) to 255 (full) for one color channel of one pixel. 256 levels fit in one byte.'},
  {t:'Histogram',d:'A bar graph of how many values sit at each brightness level.'},
  {t:'Clipping',d:'When a filter pushes a value below 0 or above 255, it is stored as 0 or 255. Different old values become the same new value, so the detail between them is lost.'},
  {t:'Vertical shift',d:'Adding a constant: f(x) + k moves the graph up by k. In a photo editor, this is brightness.',lvl:'honors'},
  {t:'Vertical stretch',d:'Multiplying by a: a·f(x). Stretching about the middle, a(x − 128) + 128, is contrast.',lvl:'honors'},
  {t:'Reflection',d:'255 − x flips the graph upside down about the line y = 127.5. In a photo editor, this is invert.',lvl:'honors'},
  {t:'Inverse function',d:'The function that undoes another. Levels, 255(x − lo)/(hi − lo), has inverse lo + (hi − lo)y/255. Clipping has no inverse, because many inputs give the same output.',lvl:'ap'}
 ],
 about:'<p>The filter is f(x) = a(x − 128) + 128 + k, then 255 − f(x) if invert is on, then rounded and clipped to 0–255. It is applied the same way to the red, green and blue values of every pixel. <b>Range used</b> is how much of 0–255 the photo’s darkest and brightest values span after the filter. A pixel counts as <b>clipped</b> if any of its three values was pushed below 0 or above 255.</p><p>The scenes are drawn by code (no real photos), then squeezed into a narrow band of values to make the problem photos. Simplified: real editors work on a gamma-encoded brightness scale and often use curves rather than straight lines, but brightness, contrast, levels and invert are functions applied to every pixel, just like here.</p>'
};
BioLab.register(SIM);
})();
