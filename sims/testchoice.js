(function(){
'use strict';
const {clamp,txt,pill,PAL,FONT,axes,legend,atLeast,fmtNum}=BioLab.h;
/* National figures: ACT composite mean 19.4, SD 5.9 (ACT national profile, class of 2024; class of 2025 mean also 19.4).
   SAT total mean 1029, SD 235 (College Board annual report, class of 2025). */
const DEF={am:19.4,as:5.9,sm:1029,ss:235};
/* Official ACT/SAT concordance (ACT and College Board, 2018): ACT composite -> [SAT single score, range low, range high]. */
const CONC={36:[1590,1570,1600],35:[1540,1530,1560],34:[1500,1490,1520],33:[1460,1450,1480],32:[1430,1420,1440],31:[1400,1390,1410],30:[1370,1360,1380],29:[1340,1330,1350],28:[1310,1300,1320],27:[1280,1260,1290],26:[1240,1230,1250],25:[1210,1200,1220],24:[1180,1160,1190],23:[1140,1130,1150],22:[1110,1100,1120],21:[1080,1060,1090],20:[1040,1030,1050],19:[1010,990,1020],18:[970,960,980],17:[930,920,950],16:[890,880,910],15:[850,830,870],14:[800,780,820],13:[760,730,770],12:[710,690,720]};
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const Phi=z=>0.5*(1+erf(z/Math.SQRT2));
const P=sim=>atLeast('ap')?{am:sim.p.am,as:sim.p.as,sm:sim.p.sm,ss:sim.p.ss}:DEF;
const zA=sim=>(sim.p.act-P(sim).am)/P(sim).as;
const zS=sim=>(sim.p.sat-P(sim).sm)/P(sim).ss;
const pctOf=(sim,t)=>100*Phi(t==='act'?zA(sim):zS(sim));
/* What the concordance table says: 'act', 'sat' or 'same'. */
function concSays(sim){const c=CONC[sim.p.act];if(!c)return null;if(sim.p.sat<c[1])return 'act';if(sim.p.sat>c[2])return 'sat';return 'same';}
const NAME={act:'ACT',sat:'SAT'};
const scoreTxt=(sim,t)=>t==='act'?`ACT ${sim.p.act}`:`SAT ${sim.p.sat}`;
const f1=v=>fmtNum(v,1),f2=v=>fmtNum(v,2);
const ord=v=>{const n=Math.round(v);return n+'%';};
const TOUR=sim=>!!(sim.tour&&sim.tour.on);
const GS=sim=>TOUR(sim)?null:sim.gutS;
const shown=sim=>!!(sim.p.show||(GS(sim)&&GS(sim).g));
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
const CX=400,PX=105;                              /* both curves share one ruler: the mean at x = 400, 105 px per SD */

const SIM={
 id:'testchoice',hash:'testchoice',apUnit:13,order:3,tab:'ACT or SAT?',kind:'Simulation',
 card:'Pick which test score to send by feel, then put both on one ruler with z-scores to see which one really stands out.',
 title:'Send the ACT or the SAT?',
 lede:{bio:'You took both tests. The ACT tops out at 36 and the SAT at 1600, so the raw numbers do not compare. What a college sees is how your score stacks up against everyone else who took that test.',
  honors:'A z-score, z = (score − mean) / SD, says how many standard deviations a score sits above or below the average. Standardizing puts two different scales on one ruler.',
  ap:'If scores are roughly normal, the percentile is the area under the normal curve to the left of the score: normalcdf(−1E99, score, μ, σ). Colleges also use the official ACT/SAT concordance table, built from students who took both tests.'},
 scale:'Each curve is a model of one test’s national scores. Both are drawn on one ruler: the averages line up, and one standard deviation is the same width for both.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Your scores',
 controls:[
  {id:'send',label:'The score you send',type:'seg',def:'sat',options:[{v:'act',l:'Send my ACT'},{v:'sat',l:'Send my SAT'}]},
  {id:'act',label:'Your ACT composite',type:'range',min:12,max:36,step:1,def:27,unit:'',noGut:true,onChange:clearGut},
  {id:'sat',label:'Your SAT total',type:'range',min:600,max:1600,step:10,def:1250,unit:'',noGut:true,onChange:clearGut},
  {id:'show',label:'Put both scores on one ruler',type:'toggle',def:false,noGut:true},
  {id:'am',label:'ACT national average',type:'range',min:17,max:22,step:0.1,def:19.4,unit:'',lvl:'ap',noGut:true,onChange:clearGut,help:'These figures change every year. Check the latest ACT and College Board reports.'},
  {id:'as',label:'ACT standard deviation',type:'range',min:4,max:7,step:0.1,def:5.9,unit:'',lvl:'ap',noGut:true,onChange:clearGut},
  {id:'sm',label:'SAT national average',type:'range',min:950,max:1100,step:1,def:1029,unit:'',lvl:'ap',noGut:true,onChange:clearGut},
  {id:'ss',label:'SAT standard deviation',type:'range',min:180,max:260,step:1,def:235,unit:'',lvl:'ap',noGut:true,onChange:clearGut}
 ],
 actions:[{id:'stronger',label:'Send the stronger score',lvl:'honors',run(sim){BioLab.setValues(sim,{send:zA(sim)>=zS(sim)?'act':'sat',show:true});}}],
 init(){return {};},step(){},
 metrics:[
  {id:'fracA',label:'ACT as a share of the top score (36)',unit:'%',d:1,min:0,max:100,get:sim=>100*sim.p.act/36},
  {id:'fracS',label:'SAT as a share of the top score (1600)',unit:'%',d:1,min:0,max:100,get:sim=>100*sim.p.sat/1600},
  {id:'pA',label:'ACT: test-takers you beat',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?pctOf(sim,'act'):null},
  {id:'pS',label:'SAT: test-takers you beat',unit:'%',d:1,min:0,max:100,get:sim=>shown(sim)?pctOf(sim,'sat'):null},
  {id:'zA',label:'ACT z-score',unit:'',d:2,lvl:'honors',min:-4,max:4,get:sim=>zA(sim)},
  {id:'zS',label:'SAT z-score',unit:'',d:2,lvl:'honors',min:-4,max:4,get:sim=>zS(sim)},
  {id:'conc',label:'Official ACT/SAT concordance',text:true,lvl:'honors',get:sim=>{const c=CONC[sim.p.act];return c?`ACT ${sim.p.act} ≈ SAT ${c[0]} (range ${c[1]} to ${c[2]})`:'No concordance below ACT 12';}},
  {id:'eqS',label:'SAT score with the same z as your ACT',unit:'',d:0,lvl:'ap',min:400,max:1800,get:sim=>{const p=P(sim);return p.sm+zA(sim)*p.ss;}}
 ],
 draw(sim,ctx,vdt,k){const sh=shown(sim),hon=atLeast('honors'),kk=k,p=P(sim),G=GS(sim),send=sim.p.send;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);
  const colA=PAL['s2'],colS=PAL['s5'];
  if(!sh){/* the raw numbers, as a share of each test's top score */
   txt(ctx,'Your two scores, as raw numbers',400,40,{s:15*kk,w:700,a:'center'});
   const bar=(y,lab,v,max,col,t)=>{const x0=80,w=640;txt(ctx,lab,x0,y-14,{s:14*kk,w:700,c:col});
    ctx.fillStyle=PAL['card'];ctx.fillRect(x0,y,w,34);ctx.strokeStyle=PAL['line'];ctx.lineWidth=1.5;ctx.strokeRect(x0,y,w,34);
    ctx.fillStyle=col;ctx.fillRect(x0,y,w*v/max,34);txt(ctx,`${v} out of ${max}`,x0+w*v/max-8,y+17,{s:13*kk,w:700,c:'#fff',a:'right',b:'middle'});
    if(send===t)pill(ctx,'Your pick',x0+w-50*kk,y-20*kk,PAL['rj'],'#fff',12*kk);};
   bar(130,'ACT composite',sim.p.act,36,colA,'act');bar(250,'SAT total',sim.p.sat,1600,colS,'sat');
   txt(ctx,'The two tests use different scales. To compare them, you need to know',400,350,{s:13*kk,c:PAL['cv-soft'],a:'center'});
   txt(ctx,'how each score compares with everyone else who took that test.',400,350+20*kk,{s:13*kk,c:PAL['cv-soft'],a:'center'});
   return;}
  /* two bell curves on one ruler */
  const curve=(base,h,mu,s,lo,hi,step,score,col,name,t)=>{const xz=z=>CX+z*PX,xv=v=>xz((v-mu)/s),yv=z=>base-h*Math.exp(-z*z/2);
   const zs=(score-mu)/s;
   /* shaded area left of the score */
   ctx.fillStyle=col;ctx.globalAlpha=.28;ctx.beginPath();ctx.moveTo(xz(-3.6),base);for(let z=-3.6;z<=zs+1e-9;z+=0.02)ctx.lineTo(xz(z),yv(z));ctx.lineTo(xz(zs),base);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
   ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let z=-3.6;z<=3.6;z+=0.02){z<-3.59?ctx.moveTo(xz(z),yv(z)):ctx.lineTo(xz(z),yv(z));}ctx.stroke();
   ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(30,base);ctx.lineTo(770,base);ctx.stroke();
   for(let v=lo;v<=hi;v+=step){const x=xv(v);if(x<30||x>770)continue;ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,base+5);ctx.stroke();txt(ctx,String(v),x,base+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
   txt(ctx,name,30,base-h-8,{s:14*kk,w:700,c:col});
   txt(ctx,`average ${t==='act'?f1(mu):Math.round(mu)}`,CX+6,base-h-8,{s:12*kk,c:PAL['cv-soft']});
   ctx.setLineDash([3,4]);ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(CX,base-h);ctx.lineTo(CX,base);ctx.stroke();ctx.setLineDash([]);
   const x=xz(clamp(zs,-3.6,3.6));ctx.strokeStyle=PAL['rj'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,base-h-4);ctx.lineTo(x,base);ctx.stroke();
   const pc=100*Phi(zs),lab=`${t==='act'?'ACT '+sim.p.act:'SAT '+sim.p.sat}: beats ${ord(pc)}`+(hon?` · z = ${f2(zs)}`:'');
   pill(ctx,lab,clamp(x,140*kk,800-140*kk),base-h*0.55,col,'#fff',13*kk);
   const tags=[];if(G&&G.g&&G.g.t===t)tags.push(['Your gut',PAL['s4']]);if(G&&G.m&&G.m.t===t)tags.push(['The math',PAL['s3']]);if(!tags.length&&!(G&&G.g)&&send===t)tags.push(['Your pick',PAL['rj']]);
   tags.forEach((g,i)=>pill(ctx,g[0],720-i*90*kk,base-h-14,g[1],'#fff',12*kk));};
  curve(176,120,p.am,p.as,0,36,3,sim.p.act,colA,'ACT composite','act');
  curve(366,120,p.sm,p.ss,400,1600,200,sim.p.sat,colS,'SAT total','sat');
  /* the shared ruler in standard deviations */
  const zy=420;ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(CX-3*PX,zy);ctx.lineTo(CX+3*PX,zy);ctx.stroke();
  for(let z=-3;z<=3;z++){const x=CX+z*PX;ctx.beginPath();ctx.moveTo(x,zy-4);ctx.lineTo(x,zy+4);ctx.stroke();txt(ctx,(z>0?'+':z<0?'−':'')+Math.abs(z),x,zy+18*kk,{s:12*kk,c:PAL['cv-soft'],a:'center'});}
  txt(ctx,hon?'z: standard deviations from the average':'Typical spreads (standard deviations) from the average',CX-3*PX,zy-9,{s:12*kk,c:PAL['cv-soft']});},
 narrate(sim){const fa=100*sim.p.act/36,fs=100*sim.p.sat/1600;
  if(!shown(sim))return `ACT ${sim.p.act} is ${f1(fa)}% of the top score and SAT ${sim.p.sat} is ${f1(fs)}%. <b>But the tests have different averages and spreads</b>, so that comparison can mislead.`;
  const a=zA(sim),s=zS(sim),pa=pctOf(sim,'act'),ps=pctOf(sim,'sat');
  if(Math.abs(pa-ps)<1)return `ACT ${sim.p.act} beats about ${ord(pa)} of test-takers and SAT ${sim.p.sat} about ${ord(ps)}. <b>Essentially a tie:</b> send whichever you like.`;
  const w=a>s?'act':'sat';
  return `ACT ${sim.p.act} sits ${f2(Math.abs(a))} standard deviations ${a>=0?'above':'below'} average; SAT ${sim.p.sat} sits ${f2(Math.abs(s))} ${s>=0?'above':'below'}. <b>The ${NAME[w]} stands out more:</b> it beats about ${ord(Math.max(pa,ps))} of test-takers, against ${ord(Math.min(pa,ps))}.`;},
 gut:{better:'higher',controls:['send'],
  ask:{bio:'You can send only one score. Look at the two scores in the picture, then pick here the one you think looks stronger to a college. Then lock it in.',
   honors:'Before you put the scores on one ruler: pick here the score you would send. Then lock it in.'},
  lock(sim){const t=sim.p.send,v=pctOf(sim,t);return {v,t,label:`${scoreTxt(sim,t)} (beats about ${ord(v)} of test-takers)`};},
  solve(sim){const a=pctOf(sim,'act'),s=pctOf(sim,'sat'),t=a>s?'act':s>a?'sat':sim.p.send;sim.p.send=t;sim.p.show=true;const v=pctOf(sim,t);return {v,t,label:`${scoreTxt(sim,t)} (beats about ${ord(v)} of test-takers)`};},
  how:{bio:'The math measures each score against its own test: how far above that test’s average it is, counted in that test’s typical spread. Then both scores sit on one ruler, and the one farther out beats more test-takers.',
   honors:'Standardize each score: z = (score − mean) / SD. The larger z is the stronger score, and the area under the normal curve to its left is its percentile.',
   ap:'z = (x − μ)/σ for each test, then percentile = normalcdf(−1E99, x, μ, σ). As a check, the official concordance table converts ACT to SAT directly.'},
  compare(sim,g,m){const c=concSays(sim),cc=CONC[sim.p.act];
   const note=c&&c!==m.t?` <b>Heads up:</b> the official concordance table ${c==='same'?`puts ACT ${sim.p.act} at SAT ${cc[1]} to ${cc[2]}, so it calls these about equal`:`calls this one the other way (ACT ${sim.p.act} ≈ SAT ${cc[0]})`}. When the two methods disagree, the scores are close: either is reasonable.`:(c?` The official concordance agrees: ACT ${sim.p.act} ≈ SAT ${cc[0]}.`:'');
   const d=m.v-g.v;
   if(g.t===m.t||d<0.05)return `Your gut was right on. ${scoreTxt(sim,m.t)} beats about ${ord(m.v)} of test-takers, against ${ord(pctOf(sim,m.t==='act'?'sat':'act'))} for the other score.${note}`;
   return `${scoreTxt(sim,m.t)} beats about <b>${ord(m.v)}</b> of test-takers; ${scoreTxt(sim,g.t)} beats about <b>${ord(g.v)}</b>. Sending the ${NAME[g.t]} gives up about <b>${fmtNum(d,1)} percentile points</b>. ${100*sim.p.sat/1600>100*sim.p.act/36&&g.t==='sat'?`The SAT looks bigger as a share of 1600, but that ignores how spread out each test’s scores are.`:''}${note}`;},
  again(sim){for(let tries=0;tries<50;tries++){const a=21+Math.floor(Math.random()*12),c=CONC[a],zeq=DEF.sm+DEF.ss*(a-DEF.am)/DEF.as;let s;
    if(Math.random()<0.5)s=Math.round((c[1]-30-Math.random()*90)/10)*10;else s=Math.round((Math.max(c[2],zeq)+30+Math.random()*90)/10)*10;
    if(s<600||s>1600)continue;sim.p.act=a;sim.p.sat=s;if(Math.abs(pctOf(sim,'act')-pctOf(sim,'sat'))>=2)break;}
   sim.p.send=Math.random()<0.5?'act':'sat';sim.p.show=false;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'ACT 27 is 75% of the top score (36). SAT 1250 is 78% of the top score (1600). Does that make the SAT score stronger?',choices:['Yes: 78% is more than 75%','Not necessarily: you have to compare each score with how everyone else did on that test','Yes: SAT scores are always worth more'],correct:1,explain:'Colleges compare you with other test-takers. In this model ACT 27 beats about 90% of ACT takers, while SAT 1250 beats about 83% of SAT takers. The share of the top score ignores each test’s average and spread.'},
  {lvl:'bio',instant:true,q:'One friend has ACT 30. Another has SAT 1350. Compared with other test-takers, who did better?',choices:['The ACT 30','The SAT 1350','Exactly the same'],correct:0,explain:'ACT 30 is 10.6 points above the ACT average of 19.4: about 1.8 typical spreads (5.9 points each). SAT 1350 is 321 above the SAT average of 1029: about 1.37 spreads of 235. ACT 30 beats about 96% of test-takers, SAT 1350 about 91%. The concordance table agrees: ACT 30 matches SAT 1360 to 1380.'},
  {lvl:'honors',instant:true,q:'The ACT composite has mean 19.4 and SD 5.9. What is the z-score of ACT 27?',choices:['0.75','1.29','4.58','7.6'],correct:1,explain:'z = (27 − 19.4) / 5.9 = 7.6 / 5.9 ≈ 1.29. The score is about 1.29 standard deviations above the national average. (7.6 is the distance in points, before dividing by the SD.)'},
  {lvl:'honors',instant:true,q:'SAT 1500 has z = (1500 − 1029) / 235 ≈ 2.0. By the 68-95-99.7 rule, about what share of SAT takers does it beat?',choices:['About 68%','About 95%','About 97.5%','About 99.7%'],correct:2,explain:'95% of a normal distribution lies within 2 SD of the mean, so 2.5% lies above +2 SD. A score at z = 2 beats about 50% + 47.5% = 97.5%.'},
  {lvl:'ap',instant:true,q:'Using a normal model, which calculator command gives the share of ACT takers below 27?',choices:['normalcdf(−1E99, 27, 19.4, 5.9) ≈ 0.90','normalpdf(27, 19.4, 5.9) ≈ 0.03','invNorm(0.27, 19.4, 5.9)','normalcdf(27, 1E99, 19.4, 5.9) ≈ 0.10'],correct:0,explain:'The share below a value is the area to its left: normalcdf(lower = −1E99, upper = 27, μ = 19.4, σ = 5.9) ≈ 0.901. normalpdf gives the height of the curve, not an area, and the last choice is the share above 27.'},
  {lvl:'ap',instant:true,q:'In this model, SAT 1332 has the same z-score as ACT 27, but the official concordance table matches ACT 27 with SAT 1280. What is the best explanation?',choices:['The concordance table is wrong','Different groups of students take each test, and the scores are not exactly normal, so z-scores against each national group are only approximate','The z-score formula only works for the SAT'],correct:1,explain:'The concordance was built by linking the scores of students who took both tests. The national ACT and SAT groups differ (some states test every student on one of them), and real score distributions are not perfectly normal. Use z-scores for the idea; trust the concordance for close calls.'}
 ],
 tour:[
  {title:'Two scores, two scales',text:'You got ACT 27 out of 36 and SAT 1250 out of 1600. As a share of the top score, the SAT looks a little better: 78% against 75%.',pause:true,setup:sim=>BioLab.setValues(sim,{act:27,sat:1250,show:false,send:'sat'})},
  {title:'Different averages, different spreads',text:'Colleges compare you with other test-takers. Recently the national average ACT composite has been 19.4, with a typical spread (standard deviation) of 5.9 points. The SAT average was 1029, with a spread of 235 points.',pause:true},
  {title:'One ruler',text:'Each curve shows how one test’s scores spread out. The curves are lined up at their averages and stretched so one typical spread is the same width. Now both scores sit on one ruler.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'How far out is each score?',text:'ACT 27 is 7.6 points above average: 7.6 ÷ 5.9 = 1.29 spreads. SAT 1250 is 221 points above: 221 ÷ 235 = 0.94 spreads. The ACT score is farther out.',pause:true,focus:[[20,40,760,150],[20,230,760,150]]},
  {title:'The share you beat',text:'The shaded area is the share of test-takers below you: about 90% for ACT 27 and about 83% for SAT 1250. Sending the ACT puts you about 7 percentile points higher.',pause:true},
  {lvl:'honors',title:'z-scores and the concordance check',text:'Those distances are z-scores: z = (score − mean) / SD. As a check, the official ACT/SAT concordance table matches ACT 27 with SAT 1260 to 1290. Your 1250 is below that range, so it agrees: send the ACT.',pause:true},
  {lvl:'ap',title:'normalcdf',text:'Percentile = normalcdf(−1E99, 27, 19.4, 5.9) ≈ 0.901 for the ACT and normalcdf(−1E99, 1250, 1029, 235) ≈ 0.827 for the SAT. ACT’s own national ranks put a 27 at the 88th percentile: real scores are only roughly normal.',pause:true}
 ],
 lab:{bio:'<p><b>Question:</b> When does “share of the top score” pick the wrong test?</p><ol><li>Turn on <b>Put both scores on one ruler</b>.</li><li>Keep ACT 27. Try SAT scores of 1200, 1250, 1300, 1350 and 1400. Record a trial for each.</li><li>Mark which ones the share-of-the-top-score method gets wrong.</li></ol><p>Write one sentence: why can the share of the top score mislead?</p>',
  honors:'<p><b>Question:</b> Do z-scores agree with the official concordance table?</p><ol><li>For ACT 22, 25, 28 and 31, find the SAT score with the same z (move the SAT slider until the z-scores match).</li><li>Compare each with the <b>Official ACT/SAT concordance</b> readout.</li></ol><p>Explain where the two methods agree and where they drift apart.</p>',
  ap:'<p><b>Question:</b> How sensitive is the answer to the national figures?</p><ol><li>Set ACT 27 and SAT 1300. Record both percentiles.</li><li>Change the SAT standard deviation from 200 to 260 and record again.</li><li>Find the SAT SD at which the decision flips.</li></ol><p><b>CER:</b> Claim how much a college’s decision should rely on z-scores, with evidence from your table and reasoning about the concordance table.</p>'},
 terms:[
  {t:'Average (mean)',d:'The center of a test’s scores. Recently about 19.4 for the ACT composite and 1029 for the SAT total.'},
  {t:'Standard deviation',d:'A typical distance of a score from the average. About 5.9 points on the ACT and 235 points on the SAT.'},
  {t:'Percentile',d:'The share of test-takers who scored at or below you.'},
  {t:'z-score',d:'z = (score − mean) / SD: how many standard deviations a score is above (+) or below (−) the mean.',lvl:'honors'},
  {t:'68-95-99.7 rule',d:'In a normal distribution, about 68%, 95% and 99.7% of values fall within 1, 2 and 3 SD of the mean.',lvl:'honors'},
  {t:'Concordance table',d:'The official table that matches ACT composite scores with SAT total scores, made by ACT and the College Board from students who took both tests.',lvl:'honors'},
  {t:'normalcdf',d:'normalcdf(lower, upper, μ, σ): the area under a normal curve between two values.',lvl:'ap'}
 ],
 about:'<p><b>The national figures are approximate and change every year.</b> This model uses an ACT composite mean of 19.4 with SD 5.9 (ACT’s national profile for the class of 2024; the class of 2025 average was also 19.4) and an SAT total mean of 1029 with SD 235 (College Board’s annual report for the class of 2025). You can change them at Deep dive.</p><p>The percentiles here come from a normal model of each test’s national scores, so they are close to, but not the same as, the official percentiles: ACT’s own national ranks put a 27 at the 88th percentile, where this model says about 90. The ACT and SAT are also taken by different groups of students, so comparing each score with its own national group is approximate.</p><p>Colleges that accept both tests usually compare them with the official ACT/SAT concordance table (ACT and the College Board, 2018), which is shown at Closer look. When z-scores and the concordance disagree, the two scores are close enough that either is a reasonable choice. Many colleges also weigh scores less than grades, courses and essays, or are test-optional. This is a model for learning about z-scores, not admissions advice.</p>'
};
BioLab.register(SIM);
})();
