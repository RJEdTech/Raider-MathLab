(function(){
'use strict';
const {clamp,txt,pill,rr,rng,PAL,FONT,atLeast,fmtNum}=BioLab.h;
/* One life, many lives: a Monte Carlo life simulator (Raider MathLab, Section 21).
   Every place figure comes from the research notes for this tool (Nov 2026) and carries a kind:
   local, state, nat(ional), model(ed from a sourced figure), proxy (another place's figure) or assume(d).
   The model and its tuned constants are computed in the browser; nothing is hard-coded from a fit. */
/* ---------- MODEL (pasted into sims/lifesim.js) ---------- */
function erf(x){const t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
const Phi=x=>0.5*(1+erf(x/Math.SQRT2)),phi=x=>Math.exp(-x*x/2)/2.5066282746310002;
function invPhi(p){p=Math.min(1-1e-9,Math.max(1e-9,p));const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];
 let q,r;if(p<0.02425){q=Math.sqrt(-2*Math.log(p));return(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 if(p>1-0.02425){q=Math.sqrt(-2*Math.log(1-p));return-(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 q=p-0.5;r=q*q;return(((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);}

/* Global assumptions: the same for every place, so differences come from the place data. All are for illustration. */
const A_={sdP:0.5,sdT:0.15,grow:0.02,stuntL:0.3,sec0:0.9,ter0:-0.6,terZ:0.3,formEdu:0.6,stay:0.92,
 ill:0.04,illLow:1.5,illCost:0.4,illMonths:2,jobMonths:3,uiShare:0.5,dis:0.01,disCost:0.5,
 cvF:0.33,cvI:0.55,dipMonths:2,repay:0.5,save:0.10,annY:15,old:0.6,work65:0.39,work65Pay:0.5,fullCareer:35,
 gB:0.085,capF:1,capI:0.15,lePct:0.1,die5Z:0.35,stuntZ:0.5,trapMin:0.02,readSD:0.3,cash:0.15,richOOP:12.27};
/* BLS 2025: median weekly earnings 770 / 966 / 1,578 (less than high school / high school / bachelor's), unemployment 6.1 / 4.3 / 2.8 (all 3.4). */
const EARN=[Math.log(770/966),0,Math.log(1578/966)],UNEMP=[6.1,4.3,2.8],UNEMP_ALL=3.4;
/* OECD PISA: an SES gap of g points between top and bottom quarters, on a scale with SD 100. Quarter means of a normal are ±φ(0.674)/0.25 = ±1.271 SD. */
const sesBeta=g=>g/100/(2*phi(0.6745)/0.25);

/* Place data. k: 'local' (county, city or province), 'state', 'nat' (whole country), 'model' (worked out from a sourced figure), 'proxy' (another place's figure), 'assume' (no figure: set for illustration). */
const F=(v,k,src,yr,note)=>({v,k,src,yr,note});
const US_COMMON=()=>({grp:'us',
 earn:F('770 / 966 / 1,578','nat','bls','2025','Median weekly pay, U.S. full-time workers 25+: less than high school / high school / bachelor’s.'),
 vol:F('0.33 / 0.55','nat','usfd','about 2012–13','Month-to-month swings (CV) for better-off and poor households in the U.S. Financial Diaries: 235 households in 4 regions, not a random sample.'),
 grad:F('0.1 a percentile','nat','chetty16','2001–14','Years of life per income percentile, the low end of the U.S. tax-record estimate. Not causal.'),
 u5:F(4.0,'proxy','wbu5','2024','Denmark’s value. No U.S. figure is in our notes.'),
 stunt:F(1.3,'proxy','wbst','2016','Germany’s value. No U.S. figure is in our notes.'),
 ses:F(93,'proxy','pisade','2022','OECD-average math gap between advantaged and disadvantaged students.'),
 inf:F(12.9,'proxy','ilo','2025','ILO average for high-income countries. The U.S. has no official informality rate.'),
 unemp:F(3.4,'nat','bls','2025','U.S. unemployment for ages 25+, used as the yearly chance of losing a job (6.1% without high school, 2.8% with a bachelor’s).'),
 oop:F(A_.richOOP,'proxy','oop','2023–24','For insured people: the average of Germany, Japan and Denmark. Uninsured people pay the whole bill in this model.'),
 access:F(94,'nat','shed','2025','Share of U.S. adults with a bank account. Having an account is not the same as being able to borrow cheaply.'),
 rf:F(20,'assume',null,'','No formal loan rate for the U.S. is in our notes.'),
 ri:F(390,'nat','cfpb','2014','$15 per $100 for two weeks: 15% × 26 = 390% a year (payday loan, simple rate).'),
 rr:F(50.5,'nat','pag','2023','OECD modeled net pension for a full-career average earner.'),
 minY:F(10,'assume',null,'','Years of formal work needed for any pension.'),
 tax:F(35.1,'proxy','tw','2025','OECD average tax wedge. No U.S. figure is in our notes.'),
 comp:F(0,'nat',null,'',''),
 le:F(77.5,'nat','cdc','2022','U.S. life expectancy at birth. No county figure is in our notes.'),
 mob:F(9.0,'nat','chetty14','1986 cohort','U.S. children from bottom-fifth parents who reach the top fifth (income at 26). No local figure is in our notes.'),
 read:F(60,'nat','naep','2024','U.S. 4th graders at or above NAEP Basic in reading (100% − 40% below Basic).')});
const EC_COMMON=()=>({grp:'ec',
 earn:F('770 / 966 / 1,578','proxy','bls','2025','U.S. pay by schooling, used as a proxy. This place’s own figures are not in our notes.'),
 vol:F('0.33 / 0.55','proxy','usfd','about 2012–13','U.S. diary figures used as a proxy. No comparable source for other countries was found.'),
 grad:F('0.1 a percentile','proxy','chetty16','2001–14','The U.S. income gradient in life expectancy, used as a proxy.'),
 u5:F(13.1,'proxy','wbu5','2024','Mexico’s value. No Ecuador figure is in our notes.'),
 stunt:F(12.5,'proxy','wbst','2022','Mexico’s value. No Ecuador figure is in our notes.'),
 ses:F(87,'nat','pisa25','2025','Ecuador’s gap between advantaged and disadvantaged students, PISA 2025 reading.'),
 oop:F(30.9,'nat','gho','2023','Share of all health spending Ecuador’s households pay out of pocket.'),
 access:F(65,'nat','findex','2024','Ecuadorian adults with an account (Findex). Formal borrowing: 16%.'),
 rf:F(28.23,'nat','bce','Nov 2026','Legal maximum for retail microcredit (effective annual rate).'),
 ri:F(80,'proxy','kmr','2007–10','A moneylender charging 5% a month: 1.05¹² ≈ 1.80, about 80% a year (India and the Philippines). Chulqueros in Ecuador have been documented charging up to 1,238% a year.'),
 rr:F(61.4,'proxy','pag','2023','OECD average replacement rate. No Ecuador replacement rate is in our notes.'),
 minY:F(30,'assume',null,'','IESS retirement rules were not retrieved.'),
 tax:F(9.45,'nat','iess','2026','Employee IESS contribution (employers add 11.15%). Income tax is not in our notes.'),
 comp:F(0,'nat',null,'',''),
 le:F(75.3,'proxy','wble','2024','Mexico’s value. No current Ecuador figure is in our notes.'),
 mob:F(0.6,'model','cedlas','cohorts to 1980s','Rank slope set to 0.6, from Ecuador’s education persistence (β ≈ 0.54 to 0.61). That measures schooling, not income.')});
const INTL=(o)=>Object.assign({grp:'intl',
 earn:F('770 / 966 / 1,578','proxy','bls','2025','U.S. pay by schooling, used as a proxy. This place’s own figures are not in our notes.'),
 vol:F('0.33 / 0.55','proxy','usfd','about 2012–13','U.S. diary figures used as a proxy. No comparable source for other countries was found.'),
 grad:F('0.1 a percentile','proxy','chetty16','2001–14','The U.S. income gradient in life expectancy, used as a proxy.'),
 ses:F(93,'proxy','pisade','2022','OECD-average math gap. This country’s own gap is not in our notes.'),
 rf:F(20,'assume',null,'','No formal loan rate is in our notes.'),
 ri:F(80,'proxy','kmr','2007–10','A moneylender charging 5% a month, about 80% a year (India and the Philippines).'),
 minY:F(20,'assume',null,'','Years of formal work needed for any pension.'),
 comp:F(0,'nat',null,'',''),
 mob:F(null,'assume',null,'','No measured mobility figure is in our notes, so the model uses its U.S. setting. Differences you see come from the other stages.')},o);
const PL={
 arap:Object.assign(US_COMMON(),{l:'Aurora and Denver, Colorado',s:'Aurora/Denver',ctry:'United States',
  pov:F(8.64,'local','dataUSA_arap','2024','Arapahoe County, official poverty rate. Denver County: 11.2%.'),
  unins:F(9.29,'local','dataUSA_arap','2024','Arapahoe County, all ages.'),
  read:F(65,'state','chalkbeat','2024','Colorado 4th graders at or above NAEP Basic (35% below). Denver: 58%.')}),
 dal:Object.assign(US_COMMON(),{l:'Dallas County, Texas',s:'Dallas',ctry:'United States',
  pov:F(13.9,'local','dataUSA_dal','2024','Dallas County, official poverty rate.'),
  unins:F(21.5,'local','dataUSA_dal','2024','Dallas County, all ages (23.6% under 65).'),
  comp:F(13,'state','tdi','2024','Texas private-sector employees whose employer opted out of workers’ compensation.')}),
 mem:Object.assign(US_COMMON(),{l:'Memphis, Tennessee (Shelby County)',s:'Memphis',ctry:'United States',
  pov:F(17.8,'local','dataUSA_mem','2024','Shelby County, official poverty rate (U.S. 12.5% on the same page).'),
  unins:F(12,'local','dataUSA_mem','2024','Shelby County.'),
  mob:F(5.4,'model','sycamore','2020','0.6 × the U.S. 9.0: in Tennessee about 6 in 100 low-income children reach the top fifth, against about 10 nationally.')}),
 perry:Object.assign(US_COMMON(),{l:'Perry County, Kentucky (Hazard area)',s:'Perry Co., KY',ctry:'United States',
  pov:F(26.8,'local','dataUSA_perry','2024','Perry County, official poverty rate.'),
  unins:F(2.37,'local','dataUSA_perry','2024','Perry County, all ages (6.61% under 65).'),
  le:F(65.4,'local','chr','2024','Perry County, the lowest in Kentucky (County Health Rankings).')}),
 owsley:Object.assign(US_COMMON(),{l:'Owsley County, Kentucky (small, extreme case)',s:'Owsley Co., KY',ctry:'United States',
  pov:F(36.1,'local','dataUSA_owsley','2024','Owsley County. Population 3,971, so samples are small and noisy.'),
  unins:F(4.78,'local','dataUSA_owsley','2024','Owsley County.'),
  le:F(65.8,'local','chr','2024','Owsley County (County Health Rankings).')}),
 quito:Object.assign(EC_COMMON(),{l:'Quito, Ecuador (Pichincha)',s:'Quito',ctry:'Ecuador',
  pov:F(11.2,'local','prim26','2025','Pichincha province, income poverty (yearly figure).'),
  read:F(38,'nat','pisa25','2025','Ecuador’s 15-year-olds at PISA Level 2 or above in reading. No Quito figure.'),
  inf:F(40,'nat','inec26','May 2026','Urban Ecuador, workers in businesses without a tax registration (RUC). No Quito figure.'),
  unemp:F(3.7,'nat','bloom','Mar 2026','Urban Ecuador unemployment.')}),
 andes:Object.assign(EC_COMMON(),{l:'Rural highlands, Ecuador (Chimborazo area)',s:'Rural highlands',ctry:'Ecuador',
  pov:F(37.6,'model','inec25','Dec 2025','Rural Ecuador income poverty, used as a floor. Chimborazo’s own rate is likely higher.'),
  read:F(26.6,'model','pisa25','2025','Ecuador’s 38%, shifted down by the 32-point urban-rural gap: Φ(Φ⁻¹(0.38) − 0.32) ≈ 26.6%.'),
  inf:F(76,'nat','inec26','May 2026','Rural Ecuador, informal sector.'),
  unemp:F(1.5,'nat','bloom','Mar 2026','Rural Ecuador unemployment (but underemployment is high).')}),
 munich:INTL({l:'Munich, Germany',s:'Munich',ctry:'Germany',
  pov:F(14.8,'nat','wbnat','2021','Germany, national line. It is a relative line (below a share of the typical income).'),
  u5:F(3.7,'nat','wbu5','2024',''),stunt:F(1.3,'nat','wbst','2016',''),
  read:F(84.6,'nat','lp','2021','100% − learning poverty of 15.4% (end of primary).'),
  ses:F(111,'nat','pisade','2022','Germany’s math gap between advantaged and disadvantaged students.'),
  inf:F(2.49,'nat','iloc','2022',''),unemp:F(3.4,'proxy','bls','2025','U.S. rates by education used as a proxy.'),
  oop:F(10.71,'nat','oop','2024',''),access:F(95,'assume',null,'','No figure in our notes.'),
  rr:F(55.3,'nat','pag','2023',''),tax:F(38.68,'nat','tw','2025','Employee side: income tax 17.22% + social contributions 21.46% (employers add 20.87%).'),
  le:F(80.8,'nat','wble','2024','')}),
 tokyo:INTL({l:'Tokyo, Japan',s:'Tokyo',ctry:'Japan',
  pov:F(13.6,'proxy','wbnat','2021','Average of Germany’s and Denmark’s relative-line rates. Japan’s own national-line rate is not in our notes; at the World Bank’s $8.30 a day it is 3.3%.'),
  u5:F(2.4,'nat','wbu5','2024',''),stunt:F(7.1,'nat','wbst','2010','Old survey (2010).'),
  read:F(96.4,'nat','lp','2019','100% − learning poverty of 3.6%.'),
  inf:F(12.9,'proxy','ilo','2025','ILO average for high-income countries; Japan is not in the country list.'),unemp:F(3.4,'proxy','bls','2025','U.S. rates by education used as a proxy.'),
  oop:F(12.24,'nat','oop','2023',''),access:F(95,'assume',null,'','No figure in our notes.'),
  rr:F(38.8,'nat','pag','2023',''),tax:F(35.1,'proxy','tw','2025','OECD average; Japan’s wedge is not in our notes.'),
  le:F(84.0,'nat','wble','2024','')}),
 cph:INTL({l:'Copenhagen, Denmark',s:'Copenhagen',ctry:'Denmark',
  pov:F(12.4,'nat','wbnat','2021','Denmark, national line. A relative line.'),
  u5:F(4.0,'nat','wbu5','2024',''),stunt:F(1.3,'proxy','wbst','2016','Germany’s value; no Denmark survey value.'),
  read:F(94.9,'nat','lp','2021','100% − learning poverty of 5.1%.'),
  inf:F(2.82,'nat','iloc','2019',''),unemp:F(3.4,'proxy','bls','2025','U.S. rates by education used as a proxy.'),
  oop:F(13.87,'nat','oop','2024',''),access:F(95,'assume',null,'','No figure in our notes.'),
  rr:F(77.3,'nat','pag','2023',''),tax:F(35.3,'nat','tw','2025','Income tax 35.30%; employee social contributions 0%.'),
  le:F(82.3,'nat','wble','2024',''),
  mob:F(11.7,'nat','chetty_t','','Danish children from bottom-fifth parents who reach the top fifth.')}),
 cdmx:INTL({l:'Mexico City, Mexico',s:'Mexico City',ctry:'Mexico',
  pov:F(29.6,'nat','wbnat','2024','Mexico, national line.'),
  u5:F(13.1,'nat','wbu5','2024',''),stunt:F(12.5,'nat','wbst','2022',''),
  read:F(52.4,'nat','lp','2019','100% − learning poverty of 47.6%.'),
  inf:F(44.1,'local','enoe','Q2 2025','Mexico City labor informality (TIL1). Mexico overall: about 55%.'),
  unemp:F(4.0,'local','enoe','Q2 2025','Mexico City.'),
  oop:F(41.24,'nat','oop','2023',''),access:F(50,'assume',null,'','No figure in our notes.'),
  rr:F(62.4,'nat','pag','2023','For a full career. Most Mexican workers have broken contribution records, so typical pensions are lower.'),
  tax:F(35.1,'proxy','tw','2025','OECD average; Mexico’s wedge is not in our notes.'),
  le:F(75.3,'nat','wble','2024','')}),
 kerala:INTL({l:'Kerala, India',s:'Kerala',ctry:'India',
  pov:F(21.9,'nat','wbnat','2011','India, an old (2011) national line. Kerala’s own rate is not in our notes.'),
  u5:F(26.6,'nat','wbu5','2024','All-India value. Kerala is widely reported as far lower; its own figure is not in our notes.'),
  stunt:F(35.5,'nat','wbst','2020','All-India value; Kerala’s own figure is not in our notes.'),
  read:F(43.9,'nat','lp','2017','All-India: 100% − learning poverty of 56.1%. Kerala’s adult literacy is 95.3%, so its children likely read better.'),
  inf:F(88.36,'nat','iloc','2024','All-India value.'),unemp:F(3.4,'proxy','bls','2025','U.S. rates by education used as a proxy.'),
  oop:F(43.89,'nat','oop','2023',''),access:F(6,'nat','pop','1999–2005','In Indian financial diaries, 94% of loans were informal (48 households, long ago).'),
  rr:F(61.4,'proxy','pag','2023','OECD average; India’s schemes cover mostly formal workers.'),tax:F(null,'assume',null,'','Not in our notes.'),
  le:F(74.9,'state','srs','2010–14','Kerala, the highest of India’s states.')}),
 nairobi:INTL({l:'Nairobi, Kenya',s:'Nairobi',ctry:'Kenya',
  pov:F(39.8,'nat','wbnat','2022','Kenya, national line.'),
  u5:F(38.8,'nat','wbu5','2024',''),stunt:F(17.6,'nat','wbst','2022',''),
  read:F(20.7,'nat','lp','2023','100% − learning poverty of 79.3%, much higher than earlier reports; may reflect a new test.'),
  inf:F(86.49,'nat','iloc','2019','All-Kenya value; likely lower in Nairobi.'),unemp:F(3.4,'proxy','bls','2025','U.S. rates by education used as a proxy.'),
  oop:F(24.25,'nat','oop','2023',''),access:F(50,'assume',null,'','No figure in our notes. Mobile money (M-Pesa) is widespread but is not credit.'),
  rr:F(61.4,'proxy','pag','2023','OECD average; Kenya’s NSSF covers mostly formal workers.'),tax:F(2.75,'nat','sha','2025','Health contribution (SHA) on salaries; income tax is not in our notes.'),
  le:F(63.8,'nat','wble','2024','')}),
 dhaka:INTL({l:'Dhaka, Bangladesh',s:'Dhaka',ctry:'Bangladesh',
  pov:F(18.7,'nat','wbnat','2022','Bangladesh, national line.'),
  u5:F(30.5,'nat','wbu5','2024',''),stunt:F(23.6,'nat','wbst','2022',''),
  read:F(48.8,'nat','lp','2022','100% − learning poverty of 51.2%.'),
  inf:F(84.19,'nat','iloc','2023',''),unemp:F(3.4,'proxy','bls','2025','U.S. rates by education used as a proxy.'),
  oop:F(79.31,'nat','oop','2023',''),access:F(12,'nat','pop','1999–2005','In Bangladeshi financial diaries, 88% of loans were informal (42 households, long ago).'),
  rr:F(61.4,'proxy','pag','2023','OECD average; Bangladesh’s pension scheme is new and mostly formal.'),tax:F(null,'assume',null,'','Not in our notes.'),
  le:F(74.9,'nat','wble','2024','')})
};
const KEYS=['arap','dal','mem','perry','owsley','quito','andes','munich','tokyo','cph','cdmx','kerala','nairobi','dhaka'];
/* hidden U.S. reference, used only to tune the family-wealth weight to the national 9.0 per 100 */
const USREF=Object.assign(US_COMMON(),{l:'U.S.',pov:F(10.6,'nat','p60','2024','')});
const pv=(P,f)=>P[f]?P[f].v:null;

/* ---------- one life ---------- */
const NCAL=200;  /* lives per fifth in each place's calibration sample */
function lifeSeed(pq,i){return (pq*1000003+i*7919+424242)|0;}
function nrm(r){const u=r()||1e-12,v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(6.283185307179586*v);}
/* Draw a life's childhood and schooling. Same seed, same draws, whatever the place or lever. */
function child(P,C,pq,i,lev){const r=rng(lifeSeed(pq,i));
 const u=(pq-1+r())/5,z=invPhi(u);
 const d5=r(),dst=r(),e1=nrm(r),us=r(),ut=r(),eta=nrm(r),f0=r(),ub=r(),ud=r(),u65=r();
 const die5=d5<C.u5*Math.exp(-A_.die5Z*z)/C.e5;
 const st=dst<C.st*Math.exp(-A_.stuntZ*z)/C.es;
 const b=C.beta,L=b*z+Math.sqrt(1-b*b)*e1-A_.stuntL*(st?1:0)+(lev&&lev.read||0);
 const dd=L-C.t,sec=us<Phi(A_.sec0+dd),ter=sec&&ut<Phi(A_.ter0+dd+A_.terZ*z),edu=ter?2:sec?1:0;
 const y30=EARN[edu]+C.w*z+A_.sdP*eta;
 return {r,u,z,eta,die5,st,L,prof:L>C.t,edu,y30,f0,ub,ud,u65};}
/* hazard multiplier from income rank (0-100): about 0.1 years of life per percentile */
const hz=pct=>Math.exp(-A_.lePct*A_.gB*(pct-50));
function deathAge(C,ch,pct,ud){if(ch.die5)return ud*5;
 /* Gompertz from age 5: H(a) = A·m/B·(e^{Ba} − e^{5B}); solve H = −ln(U) */
 const m=hz(pct),E=-Math.log(Math.max(1e-12,1-ud)),x=Math.exp(A_.gB*5)+E*A_.gB/(C.A*m);return Math.min(110,Math.log(x)/A_.gB);}
/* expected monthly shortfall within a year: income y (in poverty lines a year), CV c */
function dip(y,c){if(y<=0)return 1;const d=(1-y)/(c*y);return c*y*phi(d)+(1-y)*Phi(d);}
function pctOf(C,level){const a=C.cut;let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<level)lo=m+1;else hi=m;}return 100*lo/a.length;}
/* run one life's years. rec: array to fill with year records (or null). */
function lifeYears(P,C,ch,lev,pct,dAge,rec){const r=ch.r,edu=ch.edu,start=[16,18,22][edu];
 const pf=Phi(C.c+A_.formEdu*edu),hasBank=lev.bank||ch.ub<C.access,rD=(hasBank?C.rf:C.ri),cap=hasBank?A_.capF:A_.capI;
 let formal=ch.f0<pf,fy=0,B=0,D=0,hc=0,trap=false,sumY=0,nY=0,poorYears=0,wk=0,pov30=null,lastY=0,taxes=0,shocks=0,inc30=null;
 const o={trap:false,pov30:null,pov65:null,fy:0,taxes:0,poorYears:0,workYears:0,shocks:0,inc65:null,pension:0};
 for(let a=16;a<65;a++){const sw=r(),fr=r(),ui=r(),uj=r(),udis=r(),uun=r(),ucp=r(),nu=nrm(r);
  if(a<start||a>=dAge)continue;
  if(a>start&&sw>A_.stay)formal=fr<pf;
  const y=Math.exp(C.m+ch.y30+A_.grow*(Math.min(a,45)-30)+A_.sdT*nu+(lev.yAdd||0));
  const covered=(formal&&ucp>=C.comp)||lev.social,sick=covered||lev.sick;
  if(formal||lev.social)fy++;
  if(formal)taxes+=y*C.tax/(1-C.tax);
  const ill=ui<A_.ill*(edu===0?A_.illLow:1),job=uj<C.un[edu],dis=udis<A_.dis;
  const unins=C.unins>0&&!lev.health&&uun<C.unins;
  const oop=lev.health?Math.min(C.oop,A_.richOOP/100):(unins?1:C.oop);
  let lost=0,cost=0;
  if(ill){cost+=A_.illCost*oop;if(!sick)lost+=y*A_.illMonths/12;shocks++;}
  if(job){lost+=y*A_.jobMonths/12*(covered?1-A_.uiShare:1);shocks++;}
  if(dis){cost+=A_.disCost;shocks++;}
  let inc=y-lost;let tr=0;if(lev.cash&&inc<1)tr=lev.cash;inc+=tr;
  const cv=formal?A_.cvF:A_.cvI,dp=dip(inc,cv),dpU=Math.max(0,dp-B),dpCost=dpU*rD*A_.dipMonths/12;
  const intDue=D*rD,bills=cost+intDue+dpCost;
  const disp=inc-bills,poor=disp<1,room=Math.max(0,inc-1);
  /* bills come first from income above needs; a household below the line goes without rather than borrowing for daily needs */
  if(bills<=room){let left=room-bills;const pay=Math.min(D,A_.repay*left);D-=pay;left-=pay;B+=A_.save*left;}
  else{let x=bills-room;const fromB=Math.min(B,x);B-=fromB;x-=fromB;D=Math.min(cap,D+x);}
  if(!hasBank&&D>A_.trapMin){hc++;if(hc>=2)trap=true;}else hc=0;
  if(poor)poorYears++;wk++;sumY+=y;nY++;lastY=y;
  if(a===30){pov30=poor;inc30=disp;}
  if(rec)rec.push({a,y,inc,disp,poor,formal,ill,job,dis,D,B,unins,tr,cost,lost,intDue:intDue+dpCost});}
 o.trap=trap;o.pov30=pov30;o.fy=fy;o.taxes=taxes;o.poorYears=poorYears;o.workYears=wk;o.shocks=shocks;o.inc30=inc30;o.D=D;
 if(dAge>=65){const avg=nY?sumY/nY:0;const pen=fy>=C.minY?C.rr*avg*Math.min(1,fy/A_.fullCareer):0;
  const ann=B/A_.annY,work=pen===0&&ch.u65<A_.work65?A_.work65Pay*lastY:0;
  let i65=pen+ann+work-D*rD;let tr=0;if(lev.cash&&i65<A_.old)tr=lev.cash;i65+=tr;
  o.pension=pen;o.inc65=i65;o.pov65=i65<A_.old;o.ann=ann;o.work65=work;o.tr65=tr;}
 return o;}

/* ---------- calibration (once per place, cached) ---------- */
const CAL={},NW=1000;   /* NW lives per fifth for the reading line, the family-wealth weight and the rank cutoffs */
function quick(P){const C={beta:sesBeta(P.ses.v),u5:P.u5.v/1000,st:P.stunt.v/100,oop:P.oop.v/100,unins:P.unins?P.unins.v/100:0,comp:(P.comp.v||0)/100,
  access:P.access.v/100,rf:P.rf.v/100,ri:P.ri.v/100,rr:P.rr.v/100,minY:P.minY.v,tax:(P.tax.v||0)/100,
  un:UNEMP.map(x=>x/100*P.unemp.v/UNEMP_ALL),t:0,c:0,w:0,m:0,A:1e-4};
 /* normalize the gradients so the place average stays at the sourced rate */
 let s5=0,ss=0;for(let i=0;i<2000;i++){const z=invPhi((i+0.5)/2000);s5+=Math.exp(-A_.die5Z*z);ss+=Math.exp(-A_.stuntZ*z);}C.e5=s5/2000;C.es=ss/2000;return C;}
/* the w-free part of every sample child: background u, z, schooling, luck */
function base(P,C){C.t=0;let kids=[];for(let pq=1;pq<=5;pq++)for(let i=0;i<NW;i++)kids.push(child(P,C,pq,i,{}).L);
 const Ls=kids.slice().sort((a,b)=>a-b);C.t=Ls[Math.floor((1-P.read.v/100)*Ls.length)];
 kids=[];for(let pq=1;pq<=5;pq++)for(let i=0;i<NW;i++){const c=child(P,C,pq,i,{});kids.push({u:c.u,z:c.z,e:EARN[c.edu]+A_.sdP*c.eta,edu:c.edu});}return kids;}
function q15(kids,w){const ys=kids.map(c=>c.e+w*c.z),srt=Float64Array.from(ys).sort(),cut=srt[Math.floor(0.8*srt.length)];
 let n=0,k=0,mx=0,my=0;const rk=ys.map(v=>{let lo=0,hi=srt.length;while(lo<hi){const m=(lo+hi)>>1;if(srt[m]<v)lo=m+1;else hi=m;}return lo/srt.length;});
 kids.forEach((c,j)=>{if(c.u<0.2){n++;if(ys[j]>=cut)k++;}mx+=c.u;my+=rk[j];});mx/=kids.length;my/=kids.length;
 let sxy=0,sxx=0;kids.forEach((c,j)=>{sxy+=(c.u-mx)*(rk[j]-my);sxx+=(c.u-mx)*(c.u-mx);});return {q:100*k/n,slope:sxy/sxx,srt};}
function bisect(f,lo,hi,it){let flo=f(lo);for(let i=0;i<(it||40);i++){const mid=(lo+hi)/2,fm=f(mid);if((fm>0)===(flo>0)){lo=mid;flo=fm;}else hi=mid;}return (lo+hi)/2;}
let W_US=null;
function wUS(){if(W_US!==null)return W_US;const C=quick(USREF),kids=base(USREF,C);W_US=bisect(w=>q15(kids,w).q-USREF.mob.v,-1,2.5,24);return W_US;}
function calibrate(key){if(CAL[key])return CAL[key];const P=PL[key],C=quick(P),kids=base(P,C),mb=P.mob;
 if(mb.v===null||(mb.k==='nat'&&P.grp==='us'))C.w=wUS();
 else if(P.grp==='ec')C.w=bisect(w=>q15(kids,w).slope-mb.v,-1,3,24);
 else C.w=bisect(w=>q15(kids,w).q-mb.v,-1,3,24);
 const Q=q15(kids,C.w);C.q15=Q.q;C.slope=Q.slope;
 C.c=bisect(c=>{let s=0;kids.forEach(k=>s+=Phi(c+A_.formEdu*k.edu));return s/kids.length-(1-P.inf.v/100);},-6,6,30);
 C.formalShare=1-P.inf.v/100;
 /* Gompertz level so life expectancy at birth matches the place (income ranks spread evenly) */
 const le=A=>{let tot=0;for(let j=0;j<20;j++){const m=hz(2.5+5*j);let S=1-C.u5,e=C.u5*2.5+5*(1-C.u5);for(let a=5;a<110;a++){const h=1-Math.exp(-A*m/A_.gB*(Math.exp(A_.gB*(a+1))-Math.exp(A_.gB*a)));e+=S*(1-h/2);S*=1-h;}tot+=e;}return tot/20;};
 C.A=Math.exp(bisect(lA=>le(Math.exp(lA))-P.le.v,-20,-2,30));
 /* poverty: a level m so that the share of poor years at ages 25 to 64 matches the place (first NCAL lives of each fifth) */
 const pctY=v=>{const a=Q.srt;let lo=0,hi=a.length;while(lo<hi){const m=(lo+hi)>>1;if(a[m]<v)lo=m+1;else hi=m;}return 100*lo/a.length;};
 const sub=[];for(let pq=1;pq<=5;pq++)for(let i=0;i<NCAL;i++){const k=kids[(pq-1)*NW+i],pc=pctY(k.e+C.w*k.z),ch=child(P,C,pq,i,{});sub.push({pq,i,pc,dA:deathAge(C,ch,pc,ch.ud)});}
 const povAt=m=>{C.m=m;let py=0,n=0;sub.forEach(s=>{const ch=child(P,C,s.pq,s.i,{}),o=lifeYearsCount(P,C,ch,s.pc,s.dA);py+=o[0];n+=o[1];});return 100*py/n;};
 C.m=bisect(m=>P.pov.v-povAt(m),-0.6,2,12);
 C.cut=Array.from(Q.srt,v=>Math.exp(C.m+v));
 CAL[key]=C;return C;}
/* poor person-years at ages 25-64, baseline */
function lifeYearsCount(P,C,ch,pct,dA){const rec=[];lifeYears(P,C,ch,{},pct,dA,rec);let p=0,n=0;rec.forEach(x=>{if(x.a>=25){n++;if(x.poor)p++;}});return [p,n];}

/* ---------- run 1,000 lives ---------- */
const RUNS={};
function levOf(name,amt){const L={};if(name==='read')L.read=amt.readsd;else if(name==='bank')L.bank=true;else if(name==='health')L.health=true;else if(name==='sick')L.sick=true;else if(name==='social')L.social=true;else if(name==='cash')L.cash=amt.cash;return L;}
function run(key,pq,lname,amt,N){N=N||1000;const lev=levOf(lname,amt||{readsd:A_.readSD,cash:A_.cash});const id=[key,pq,lname,lev.read||0,lev.cash||0,N].join('|');if(RUNS[id])return RUNS[id];
 const P=PL[key],C=calibrate(key),t0=(typeof performance!=='undefined'?performance.now():Date.now());
 const lives=[];let top=0,a30=0,p30=0,a65=0,p65=0,trap=0,yrs=0,prof=0,sec=0,ter=0,d5=0,st=0,fy=0,pen=0,adults=0,fifth=[0,0,0,0,0];
 for(let i=0;i<N;i++){const ch=child(P,C,pq,i,lev);
  const lvl30=Math.exp(C.m+ch.y30),inc=lvl30+(lev.cash&&lvl30<1?lev.cash:0),pc=pctOf(C,inc);
  const dA=deathAge(C,ch,pc,ch.ud),o=lifeYears(P,C,ch,lev,pc,dA,null);
  const alive30=dA>30,f=Math.min(4,Math.floor(pc/20));
  const L={i,dA,pc,f:alive30?f:-1,edu:ch.edu,prof:ch.prof,st:ch.st,die5:ch.die5,trap:o.trap,pov30:o.pov30,pov65:o.pov65,fy:o.fy,pension:o.pension};
  lives.push(L);yrs+=dA;if(ch.die5)d5++;if(ch.st)st++;if(ch.prof)prof++;if(ch.edu>=1)sec++;if(ch.edu===2)ter++;
  if(alive30){a30++;fifth[f]++;if(f===4)top++;if(o.pov30)p30++;}
  if(dA>=18){adults++;if(o.trap)trap++;fy+=o.fy;}
  if(dA>=65){a65++;if(o.pov65)p65++;if(o.pension>0)pen++;}}
 const ms=(typeof performance!=='undefined'?performance.now():Date.now())-t0;
 const R={lives,N,top,a30,p30,a65,p65,trap,adults,years:yrs/N,prof,sec,ter,d5,st,fifth,pen,fyAvg:adults?fy/adults:0,ms,
  per:{top:1000*top/N,pov30:a30?1000*p30/a30:0,pov65:a65?1000*p65/a65:0,trap:1000*trap/N,alive65:1000*a65/N}};
 RUNS[id]=R;return R;}
function oneLife(key,pq,lname,amt,i){const lev=levOf(lname,amt||{readsd:A_.readSD,cash:A_.cash});const P=PL[key],C=calibrate(key),ch=child(P,C,pq,i,lev);
 const lvl30=Math.exp(C.m+ch.y30),inc=lvl30+(lev.cash&&lvl30<1?lev.cash:0),pc=pctOf(C,inc),dA=deathAge(C,ch,pc,ch.ud),rec=[];
 const o=lifeYears(P,C,ch,lev,pc,dA,rec);return {ch,pc,dA,rec,o};}

/* ---------- sources (all from the research notes for this tool, retrieved Nov 2026) ---------- */
const SRC={
 wbu5:['UN IGME via World Bank, under-5 mortality','https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SH.DYN.MORT?format=json&mrnev=1'],
 wbst:['World Bank, stunting (height-for-age)','https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SH.STA.STNT.ZS?format=json&mrnev=1'],
 wble:['UN WPP via World Bank, life expectancy','https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SP.DYN.LE00.IN?format=json&mrnev=1'],
 lp:['World Bank, learning poverty','https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SE.LPV.PRIM?format=json&mrnev=1'],
 wbnat:['World Bank, poverty at national lines','https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SI.POV.NAHC?format=json&mrnev=1'],
 oop:['WHO GHED via World Bank, out-of-pocket share','https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SH.XPD.OOPC.CH.ZS?format=json&mrnev=1'],
 pisade:['OECD PISA 2022 country note: Germany','https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/germany_1a2cf137-en.html'],
 pisa25:['El Comercio on PISA 2025, Ecuador','https://www.elcomercio.com/opinion/editorial/resultados-ecuador-lectura-pruebas-pisa-2025/'],
 ilo:['ILO, World informality profile (2025)','https://www.ilo.org/sites/default/files/2025-05/World_Informality%20Regional%20statistical%20profile.pdf'],
 iloc:['ILOSTAT list of informal employment rates','https://en.wikipedia.org/wiki/List_of_countries_by_informal_employment_rate'],
 bls:['BLS, earnings and unemployment by education','https://www.bls.gov/emp/tables/unemployment-earnings-education.htm'],
 shed:['Federal Reserve SHED 2025','https://www.federalreserve.gov/publications/2026-economic-well-being-of-us-households-in-2025-executive-summary.htm'],
 cfpb:['CFPB, payday lending data point (2014)','https://www.consumerfinance.gov/about-us/newsroom/cfpb-finds-four-out-of-five-payday-loans-are-rolled-over-or-renewed'],
 pag:['OECD Pensions at a Glance 2023 (summary)','https://www.pensionpolicyinternational.com/?p=73182'],
 tw:['OECD Taxing Wages (via RSM UK)','https://www.rsmuk.com/insights/employment-matters/employment-tax/employment-taxation-in-oecd-countries'],
 cdc:['CDC 2022, via County Health Rankings list','https://www.stacker.com/kentucky/counties-shortest-life-expectancy-kentucky'],
 chr:['County Health Rankings 2024 (via Stacker)','https://www.stacker.com/kentucky/counties-shortest-life-expectancy-kentucky'],
 chetty14:['Chetty et al. 2014, NBER w19844','https://www.nber.org/papers/w19844.pdf'],
 chetty_t:['Chetty, Senate testimony on mobility','https://www.budget.senate.gov/imo/media/doc/Chetty%20mobility%20testimony.pdf'],
 chetty16:['Chetty et al. 2016, JAMA','https://cutler.scholars.harvard.edu/resource/jsc160006pdf'],
 naep:['Education Next on NAEP 2024','https://educationnext.org/low-performing-students-fall-farther-behind-the-pack-naep-reading-achievement-levels/'],
 chalkbeat:['Chalkbeat Colorado on NAEP 2024','https://www.chalkbeat.org/colorado/2025/01/29/naep-national-test-score-results-denver-and-state-outperform-but-still-not-recovered'],
 dataUSA_arap:['Data USA, Arapahoe County (Census ACS)','https://datausa.io/profile/geo/arapahoe-county-co'],
 dataUSA_dal:['Data USA, Dallas County (Census ACS)','https://datausa.io/profile/geo/dallas-county-tx'],
 dataUSA_mem:['Data USA, Shelby County (Census ACS)','https://datausa.io/profile/geo/shelby-county-tn'],
 dataUSA_perry:['Data USA, Perry County (Census ACS)','https://datausa.io/profile/geo/perry-county-ky'],
 dataUSA_owsley:['Data USA, Owsley County (Census ACS)','https://datausa.io/profile/geo/owsley-county-ky'],
 tdi:['Texas Department of Insurance, 2024','https://tdi.texas.gov/wc/dwc/biennial24.html'],
 sycamore:['Sycamore Institute (Opportunity Atlas), 2020','https://sycamoretn.org/economic-opportunity-upward-mobility-tennessee'],
 prim26:['Primicias, Feb 2026 (INEC 2025)','https://www.primicias.ec/economia/pobreza-nacional-2025-ecuador-orellana-inec-116922/'],
 inec25:['INEC, ENEMDU December 2025','https://www.ecuadorencifras.gob.ec/institucional/inec-presenta-resultados-de-la-enemdu-diciembre-2025/'],
 inec26:['INEC, ENEMDU May 2026','https://www.ecuadorencifras.gob.ec/institucional/ecuador-registra-86-mil-personas-menos-en-situacion-de-desempleo-en-mayo-de-2026-frente-a-mayo-de-2025/'],
 bloom:['Bloomberg Línea, March 2026 (INEC)','https://www.bloomberglinea.com/latinoamerica/ecuador/desempleo-en-ecuador-se-redujo-en-marzo-de-2026-pero-aumento-la-informalidad-revela-el-inec/'],
 gho:['WHO GHED, Ecuador','https://ghoapi.azureedge.net/api/GHED_OOPSCHE_SHA2011?$filter=SpatialDim%20eq%20%27ECU%27'],
 findex:['El Universo on Global Findex 2025','https://www.eluniverso.com/opinion/columnistas/inclusion-financiera-retos-nota/'],
 bce:['Banco Central del Ecuador, rates','https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm'],
 kmr:['Karlan, Mullainathan & Roth, NBER w24272','https://www.nber.org/system/files/working_papers/w24272/revisions/w24272.rev0.pdf'],
 iess:['El Diario, IESS contributions 2026','https://eldiario.ec/ecuador/tipos-afiliacion-al-iess-aportes-mensuales-13072026/'],
 cedlas:['Neidhöfer, Serrano & Gasparini, CEDLAS WP 215','https://www.cedlas.econo.unlp.edu.ar/wp/wp-content/uploads/doc_cedlas215.pdf'],
 enoe:['INEGI ENOE, Mexico City, Q2 2025','https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2025/enoe/enoe2025_08_CdMx.pdf'],
 srs:['The News Minute on SRS 2010–14','https://www.thenewsminute.com/news/kerala-still-has-highest-life-expectancy-birth-cedes-ground-all-other-age-groups-51898'],
 pop:['Portfolios of the Poor, Brief 9','https://www.microsave.net/wp-content/uploads/2023/08/PoP_BN_9_Three_Country_Analysis.pdf'],
 sha:['Uasin Gishu News on Kenya SHA, Jan 2025','https://www.uasingishunews.co.ke/18-5-million-kenyans-have-registered-for-social-health-authority-ministry-of-health/'],
 usfd:['U.S. Financial Diaries (Hannagan & Morduch)','https://www.stlouisfed.org/~/media/Files/PDFs/Community%20Development/Econ%20Mobility/Sessions/MorduchPaper508.pdf'],
 p60:['Census P60-287 (2024 poverty)','https://www2.census.gov/library/publications/2025/demo/p60-287.pdf'],
 wbinf:['World Bank, The Long Shadow of Informality (blog)','https://blogs.worldbank.org/en/voices/five-reasons-be-concerned-about-shadow-economy'],
 ilo65:['Primicias on ILO, older adults in Ecuador','https://primicias.ec/economia/adultos-mayores-ecuador-ingresos-laborales-pension-oit-80116'],
 inecLit:['INEC, illiteracy in Censo 2022','https://www.ecuadorencifras.gob.ec/institucional/reduccion-del-analfabetismo-en-ecuador-mas-de-199-000-personas-libres-de-esta-condicion-desde-2010/'],
 mpesa:['IPA on M-Pesa (Suri & Jack 2016)','https://poverty-action.org/news/simple-access-mobile-money-lifted-two-percent-kenyan-households-out-poverty-finds-new-study'],
 chulco:['Primicias on chulqueros (Equifax, 2021)','https://primicias.ec/noticias/economia/chulco-creditos-tasas-interes-ecuador'],
 atlas:['Census, Opportunity Atlas data tables','https://cdn.www.census.gov/programs-surveys/ces/data/public-use-data/opportunity-atlas-data-tables.html'],
 mit:['MIT Living Wage Calculator','https://livingwage.mit.edu/counties/48113'],
 cfw:['BLS fatal work injuries 2024','https://www.bls.gov/news.release/archives/cfoi_02192026.pdf']
};
const aL=(k,t)=>{const s=SRC[k];return s?`<a href="${s[1]}" target="_blank" rel="noopener">${t||s[0]}</a>`:'';};

/* ---------- stages and the "How good is this number?" badges ---------- */
const STAGES=[
 {n:'Childhood',f:['u5','stunt']},
 {n:'Reading',f:['read','ses']},
 {n:'School',f:['school','earn']},
 {n:'Work',f:['pov','inf','mob','vol']},
 {n:'Shocks',f:['unins','oop','comp','access','rf','ri']},
 {n:'Taxes',f:['tax','ben']},
 {n:'Old age',f:['rr','minY']},
 {n:'Lifespan',f:['le','grad']}];
const GLOBAL_F={school:F('follows reading skill','assume',null,'','No completion data for any place is in our notes. The model assumes children who read better are more likely to finish secondary school and go on.'),
 ben:F('folded into the poverty rate','assume',null,'','Existing benefits are already inside each place’s measured poverty rate. The model does not add them separately.')};
const fld=(P,f)=>P[f]||GLOBAL_F[f]||null;
const RANKK={local:0,state:1,nat:1,model:2,proxy:2,assume:2};
const KINDW={local:'Local',state:'State',nat:'National',model:'Modeled',proxy:'Proxy',assume:'Assumption'};
/* 0 = local data, 1 = state or national data, 2 = estimate, proxy or assumption */
function stageMark(P,st){let w=0;st.f.forEach(f=>{const x=fld(P,f);if(!x||(f==='comp'&&!x.v)||(f==='unins'&&P.grp!=='us'))return;w=Math.max(w,RANKK[x.k]);});return w;}
const VAL={u5:v=>`${v} deaths before age 5 per 1,000 births`,stunt:v=>`${v}% of children under 5 stunted`,
 read:v=>`${v}% of children read at the minimum level`,ses:v=>`${v}-point test gap, rich vs. poor students`,school:v=>v,earn:v=>`$${v} a week`,
 pov:v=>`${v}% poor (sets the income level)`,inf:v=>`${v}% of workers informal`,mob:v=>v===null?'no measured figure':(v<1?`rank slope ${v}`:`${v} of 100 climb bottom to top fifth`),vol:v=>`swing (CV) ${v}, formal / informal`,
 unins:v=>`${v}% uninsured`,oop:v=>`${v}% of health spending paid out of pocket`,comp:v=>`${v}% of private workers lack workers’ comp`,access:v=>`${v}% with a bank account or formal access`,
 rf:v=>`formal loan ${v}% a year`,ri:v=>`high-cost loan ${v}% a year`,tax:v=>v===null?'not in our notes':`${v}% of a formal paycheck`,ben:v=>v,
 rr:v=>`pension = ${v}% of pay, full career`,minY:v=>`${v} formal years to qualify`,le:v=>`${v} years at birth`,grad:v=>`${v} of income rank`};
function markHTML(w){const st=w===0?'background:var(--good);border:2px solid var(--good)':w===1?'border:2.5px solid var(--s2)':'border:2px dashed var(--warn)';return `<span aria-hidden="true" style="display:inline-block;width:.8em;height:.8em;border-radius:50%;vertical-align:-1px;margin-right:4px;${st}"></span>`;}
function badge(x){const w=RANKK[x.k];return markHTML(w)+`<b>${KINDW[x.k]}</b>${x.yr?', '+x.yr:''}`;}
function qualityHTML(P){let h=`<p><b>How good is this number?</b> Every stage for <b>${P.l}</b>. ${markHTML(0)}local figure ${markHTML(1)}state or national figure ${markHTML(2)}modeled, proxy (another place’s figure) or assumption.</p>`;
 STAGES.forEach((st,j)=>{const items=st.f.map(f=>[f,fld(P,f)]).filter(([f,x])=>x&&!(f==='comp'&&!x.v)&&!(f==='unins'&&P.grp!=='us'));if(!items.length)return;
  h+=`<p style="margin:8px 0 2px"><b>${j+1}. ${st.n}</b></p><ul style="margin:0 0 4px;padding-left:1.2em">`+items.map(([f,x])=>`<li>${VAL[f](x.v)}: ${badge(x)}. ${x.note||''}${x.src?' '+aL(x.src,'Source')+'.':''}</li>`).join('')+'</ul>';});
 return h;}
/* What this number hides: the biggest blind spots for this place */
function hides(P){const L=[];
 if(P.grp==='us')L.push(`<b>A county is not a neighborhood.</b> ${P.s}’s poverty rate is one average. Within Memphis, the Opportunity Atlas puts the bottom-to-top climb near 16 in 100 in Midtown and under 1 in 100 in North Memphis.`);
 if(P.grp==='ec')L.push(`<b>Two ways to count reading.</b> Ecuador’s 2022 census found 3.7% of adults unable to read. PISA 2025 found 62% of 15-year-olds below minimum reading proficiency. The census asks if you can read at all; PISA tests reading for understanding. This tool uses the PISA figure (${aL('inecLit','INEC census')}).`);
 if(P.grp==='intl')L.push(`<b>One country, one number.</b> Most figures for ${P.s} are national averages for ${P.ctry}. A capital city and a village can differ a great deal, and our notes have city figures only for Mexico City and Kerala.`);
 if(P===PL.kerala)L.push('<b>Kerala is not all of India.</b> Child deaths, stunting and reading use all-India values, but Kerala’s adult literacy (95.3%) and life expectancy (74.9) are well above India’s. The model likely makes Kerala childhoods look harder than they are.');
 if(P===PL.owsley)L.push('<b>Tiny samples swing.</b> Owsley County’s median household income moved from $31,064 to $22,188 in one year. The notes call that almost certainly sampling noise, not a real collapse.');
 if(P===PL.dal)L.push('<b>Uninsured is a choice of age group.</b> Dallas County is 21.5% uninsured for all ages, 23.6% under 65. Same county, different denominator.');
 if(P===PL.andes)L.push('<b>A floor, not a measurement.</b> No Chimborazo poverty rate is in our notes, so the model uses rural Ecuador’s 37.6%. Chimborazo is heavily Indigenous with above-7% illiteracy, so the real rate is likely higher.');
 if(P===PL.tokyo)L.push('<b>Which poverty line?</b> At the World Bank’s $8.30 a day, Japan’s poverty rate is 3.3%. On relative lines like Germany’s (14.8%) and Denmark’s (12.4%), rates are far higher. The model borrows the relative-line average, so Tokyo is a proxy here.');
 L.push(`<b>Poverty lines differ by place.</b> ${P.pov.note} A “poor” life in one place and in another are not measured with the same ruler. On one world line ($8.30 a day, 2021 prices): Germany 1.6%, Mexico 21.4%, Kenya 90.1%.`);
 L.push('<b>People surveys miss.</b> People without a fixed address, undocumented workers and cash-only workers are the hardest to count, and they are often the people a number like this is about. In Ecuador, the census counted 231,686 Venezuelans; a UN-led estimate was 474,945.');
 return L;}
const QUESTIONS=['Who counted, and how?','Who is missing?','Average or median?','Per what? (per person, household, 1,000 births, worker?)','Compared to what?','What would change the answer?','What does this number hide?'];
function turnHTML(P){if(P.grp==='us')return `<p><b>Your turn: investigate.</b> Open the ${aL('atlas','Census Opportunity Atlas data tables')} and find the bottom-to-top-fifth rate for your own county or tract. Which number in this tool would you replace first, and how would the 1,000 lives change? The ${aL('mit','MIT Living Wage Calculator')} gives your county’s living wage to compare with.</p>`;
 if(P.grp==='ec')return `<p><b>Your turn: investigate.</b> INEC publishes ENEMDU poverty and job tables, including city tables for Quito (${aL('inec25','INEC ENEMDU')}). Find Quito’s own poverty rate, then decide: does the provincial 11.2% used here overstate or understate it?</p>`;
 return `<p><b>Your turn: investigate.</b> The World Bank API returns these indicators for any country. Open the ${aL('wbu5','under-5 mortality query')}, change one country code (for example ECU for Ecuador or USA), and see whether the proxy this tool uses was close.</p>`;}
const LINKS=[['bookshome','Books on the shelf'],['wordgap','The 30 million word gap'],['zipscores','Zip code and test scores'],['opportunity','Where you grow up'],['costofliving','Cost of living'],['livingwage','Build a living wage'],['minutesofwork','Minutes of work'],['povertypremium','The poverty premium']];
const EXT=[['Raider-CivicsLab','northsouth','CivicsLab: The world in 100 people'],['Raider-CivicsLab','measurewealth','CivicsLab: What counts as wealth?'],['Raider-HealthLab','cprclock','HealthLab: The cardiac arrest clock'],['Raider-HealthLab','herd','HealthLab: Measles and the herd']];
function linksHTML(all){const own=LINKS.filter(([id])=>all||!BioLab.sims||BioLab.sims[id]).map(([id,t])=>`<a href="#${id}">${t}</a>`);
 return `<p><b>Each stage draws on other tools.</b> ${own.join(' · ')} · ${EXT.map(([lab,id,t])=>`<a href="https://rjedtech.github.io/${lab}/#${id}" target="_blank" rel="noopener">${t}</a>`).join(' · ')}</p>`;}

/* ---------- helpers for the page ---------- */
const QN=['bottom','second','middle','fourth','top'],QS=['Bottom','2nd','Middle','4th','Top'];
const qCol=i=>PAL[['s2','s6','s3','s4','rj'][i]];
const LEVERS=[{v:'none',l:'Nothing (as measured)'},{v:'read',l:'Reading and school support'},{v:'bank',l:'Bank access for everyone'},{v:'health',l:'Health coverage for everyone'},{v:'sick',l:'Paid sick days for everyone'},{v:'social',l:'Social insurance for every worker'},{v:'cash',l:'A cash transfer below the line'}];
const LVN=v=>(LEVERS.find(o=>o.v===v)||LEVERS[0]).l;
const GS=sim=>(sim.tour&&sim.tour.on)?null:sim.gutS;
/* The count stays hidden while the student works it out ("Your turn"). */
const pending=sim=>!!(BioLab.calcPending&&BioLab.calcPending(sim));
const shown=sim=>!pending(sim)&&!!(sim.p.reveal||(sim.tour&&sim.tour.on)||(GS(sim)&&GS(sim).g));
const f1=v=>fmtNum(v,1),n0=v=>Math.round(v).toLocaleString('en-US');
const amt=sim=>({readsd:sim.p.readsd,cash:sim.p.cash});
const lev=sim=>atLeast('honors')?sim.p.lever:'none';
const cur=sim=>run(sim.p.place,sim.p.pq,lev(sim),amt(sim));
const baseR=sim=>run(sim.p.place,sim.p.pq,'none',amt(sim));
const view=sim=>(sim.p.view==='cmp'&&!atLeast('honors'))?'dist':sim.p.view;
const ok65=R=>R.a65-R.p65;
const target=(sim,R)=>sim.p.ask==='ok65'&&atLeast('honors')?ok65(R):R.top;
/* "Your turn": the law of total probability by schooling, from this run's own counts.
   P(hit) = Σ P(schooling group) × P(hit | group). Rates are rounded to 0.1% as the prompt shows them. */
const askOk=sim=>sim.p.ask==='ok65'&&atLeast('honors');
const isHit=(sim,lf)=>askOk(sim)?(lf.dA>=65&&lf.pov65===false):lf.f===4;
function groups(sim){const R=baseR(sim),G=atLeast('honors')?[{l:'leave school without a diploma',s:'no diploma',e:[0]},{l:'finish secondary school only',s:'secondary',e:[1]},{l:'finish college',s:'college',e:[2]}]:[{l:'finish college',s:'college',e:[2]},{l:'do not',s:'no college',e:[0,1]}];
 G.forEach(g=>{g.n=0;g.k=0;});R.lives.forEach(lf=>{const g=G.find(x=>x.e.includes(lf.edu));g.n++;if(isHit(sim,lf))g.k++;});
 G.forEach(g=>{g.p=g.n?Math.round(1000*g.k/g.n)/10:0;g.h=g.n*g.p/100;});return {R,G,hand:G.reduce((t,g)=>t+g.h,0),ans:target(sim,R)};}
const whatHit=sim=>askOk(sim)?'reach 65 and are not poor':'reach the top fifth by 30';
function calcPrompt(sim){const {G}=groups(sim),w=whatHit(sim),use=G.filter(g=>g.n>0);
 if(!atLeast('honors')){const c=G[0],o=G[1];return `Of these 1,000 children, <b>${n0(c.n)}</b> finish college and <b>${n0(o.n)}</b> do not. <b>${c.p}%</b> of the college graduates ${w}, and <b>${o.p}%</b> of the others do. How many of the 1,000 ${w}?`;}
 return `Of these 1,000 children: `+use.map((g,j)=>j?`<b>${n0(g.n)}</b> ${g.l} (<b>${g.p}%</b>)`:`<b>${n0(g.n)}</b> ${g.l}, and <b>${g.p}%</b> of them ${w}`).join('; ')+`. How many of the 1,000 ${w}?`;}
function calcSteps(sim){const {G,hand,ans}=groups(sim),use=G.filter(g=>g.n>0),out=use.map(g=>`${g.s[0].toUpperCase()+g.s.slice(1)}: ${n0(g.n)} × ${g.p}% = ${f1(g.h)}`);
 out.push(`Add the groups: ${use.map(g=>f1(g.h)).join(' + ')} = ${f1(hand)}, so <b>about ${n0(ans)} of 1,000</b>. (The exact count is ${n0(ans)}; rounding the percents moves the sum by less than 1.)`);
 if(!askOk(sim))out.push(`Compare: if parents’ income made no difference, it would be 1,000 ÷ 5 = 200.`);
 return out;}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function wrap(ctx,s,x,y,w,lh,o){ctx.font=(o.w||400)+' '+o.s+'px '+FONT;const words=s.split(' ');let line='';
 words.forEach(wd=>{const t=line?line+' '+wd:wd;if(ctx.measureText(t).width>w&&line){txt(ctx,line,x,y,o);y+=lh;line=wd;}else line=t;});if(line){txt(ctx,line,x,y,o);y+=lh;}return y;}
function mark(ctx,x,y,r,w){ctx.lineWidth=w===1?2.5:2;if(w===0){ctx.fillStyle=PAL['s3'];ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
 else{ctx.strokeStyle=w===1?PAL['s2']:PAL['s4'];ctx.setLineDash(w===2?[3,2.5]:[]);ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.stroke();ctx.setLineDash([]);}}
function fit(ctx,s,w,size,wt){ctx.font=(wt||400)+' '+size+'px '+FONT;if(ctx.measureText(s).width<=w)return s;while(s.length>3&&ctx.measureText(s+'…').width>w)s=s.slice(0,-1);return s+'…';}

/* the stage strip along the bottom of the 1,000-lives view */
function strip(ctx,P,x0,y,w,k,big){const n=STAGES.length,cw=w/n,kk=Math.min(k,1.5);
 STAGES.forEach((st,i)=>{const cx=x0+i*cw,m=stageMark(P,st);mark(ctx,cx+10*kk,y,6*kk,m);
  txt(ctx,big?String(i+1):(i+1)+' '+st.n,cx+20*kk,y+4.5*kk,{s:12*k,c:PAL['cv-ink'],w:600});});}
function stripKey(ctx,x,y,k,big){const kk=Math.min(k,1.5);const items=big?[[0,'local'],[1,'state/national'],[2,'estimate']]:[[0,'local data'],[1,'state or national data'],[2,'modeled, proxy or assumption']];let xx=x;
 txt(ctx,big?'Data:':'How good is each stage’s data?',xx,y,{s:12*k,w:700,c:PAL['cv-soft']});ctx.font='700 '+(12*k)+'px '+FONT;xx+=ctx.measureText(big?'Data:':'How good is each stage’s data?').width+12;
 items.forEach(([w,l])=>{mark(ctx,xx+6*kk,y-4*kk,5.5*kk,w);txt(ctx,l,xx+15*kk,y,{s:12*k,c:PAL['cv-soft']});ctx.font=(12*k)+'px '+FONT;xx+=ctx.measureText(l).width+28*kk;});}

/* ---------- drawing: 1,000 lives ---------- */
function drawDist(sim,ctx,k){const P=PL[sim.p.place],R=cur(sim),B=baseR(sim),on=shown(sim),big=k>1.3,L=lev(sim),useL=L!=='none',G=GS(sim);
 const title=big?`1,000 born in ${P.s}, ${QN[sim.p.pq-1]} fifth`:`1,000 children born in ${P.s} to parents in the ${QN[sim.p.pq-1]} fifth`;
 txt(ctx,fit(ctx,title,780,14*Math.min(k,1.3),700),14,24,{s:14*Math.min(k,1.3),w:700});
 const cols=40,pitch=big?8.6:10.6,gx=14,gy=big?44:42,r=big?3.4:4.1;
 const ord=on?R.lives.map((l,i)=>i).sort((a,b)=>(R.lives[b].f-R.lives[a].f)||(a-b)):null;
 for(let j=0;j<1000;j++){const i=on?ord[j]:j,lf=R.lives[i],bf=B.lives[i],x=gx+(j%cols)*pitch+pitch/2,y=gy+Math.floor(j/cols)*pitch+pitch/2;
  if(!on){ctx.fillStyle=PAL['line'];ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();continue;}
  if(lf.f<0){ctx.strokeStyle=PAL['muted'];ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,r-1,0,7);ctx.stroke();continue;}
  ctx.fillStyle=qCol(lf.f);ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();
  if(useL&&lf.f>bf.f){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,y,r+1.6,0,7);ctx.stroke();}}
 const gyEnd=gy+25*pitch;
 if(!on){txt(ctx,'?',gx+cols*pitch/2,gy+12.5*pitch+16,{s:44,w:800,c:PAL['cv-soft'],a:'center'});
  txt(ctx,pending(sim)?(big?'Work out the count first.':'Work out the count in Your turn, then each life gets its color.'):(big?'Lock in your gut to color them.':'Lock in your gut to color each life by its adult income fifth.'),gx,gyEnd+18*Math.min(k,1.3),{s:12*k,c:PAL['cv-soft']});}
 else{let x=gx,y=gyEnd+18*Math.min(k,1.3);ctx.font=(12*k)+'px '+FONT;
  const items=[[4,big?'Top':'Top fifth at 30'],[3,'4th'],[2,'Mid'],[1,'2nd'],[0,big?'Bot':'Bottom'],[-1,big?'Died':'Died before 30']];
  items.forEach(([f,l])=>{const w=ctx.measureText(l).width+16*k+10;if(x+w>gx+cols*pitch+4){x=gx;y+=17*k;}
   if(f>=0){ctx.fillStyle=qCol(f);ctx.fillRect(x,y-10*k,10*k,10*k);}else{ctx.strokeStyle=PAL['muted'];ctx.lineWidth=1;ctx.strokeRect(x+.5,y-10*k+.5,10*k-1,10*k-1);}
   txt(ctx,l,x+14*k,y,{s:12*k,c:PAL['cv-ink']});x+=w;});
  if(!big)txt(ctx,useL?'Sorted by fifth. Ringed: moved up a fifth with this change.':'Sorted by adult income fifth: each dot is one life.',gx,y+17*k,{s:12*k,c:PAL['cv-soft']});}
 /* outcome panel */
 const px=gx+cols*pitch+(big?18:24),pw=800-px-12,kk=Math.min(k,1.5);
 const rows=[['top','Reach the top fifth',R.top,B.top,1000,'of 1,000'],['pov30','Poor at 30',R.p30,B.p30,R.a30,'of '+n0(R.a30)+' alive'],['pov65','Poor at 65',R.p65,B.p65,R.a65,'of '+n0(R.a65)+' alive'],['trap','Ever in a debt trap',R.trap,B.trap,1000,'of 1,000'],['a65','Alive at 65',R.a65,B.a65,1000,'of 1,000']];
 if(sim.p.ask==='ok65'&&atLeast('honors'))rows.splice(1,0,['ok65','Reach 65, not poor',ok65(R),ok65(B),1000,'of 1,000']);
 const use=big?rows.filter(rw=>['top','ok65','pov65','trap'].includes(rw[0])):rows;
 const rh=big?Math.min(66,(330)/use.length):Math.min(52,300/use.length);let y=gy+6;
 use.forEach(([id,lab,v,b,den,unit])=>{const hid=(id==='top'||id==='ok65')&&!on;
  txt(ctx,lab,px,y+12*kk,{s:12*k,w:700,c:PAL['cv-ink']});
  const by=y+18*kk,bh=10*kk,X=t=>px+pw*Math.min(1,t/1000);
  ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(px,by,pw,bh);
  if(!hid){if(useL){ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.strokeRect(px,by,Math.max(1,X(b)-px),bh);}
   ctx.fillStyle=id==='top'||id==='ok65'||id==='a65'?PAL['s2']:PAL['s1'];ctx.globalAlpha=.85;ctx.fillRect(px,by+(useL?2:0),Math.max(1,X(v)-px),bh-(useL?4:0));ctx.globalAlpha=1;}
  if(G&&G.g&&((id==='top'&&G.g.ask==='top')||(id==='ok65'&&G.g.ask==='ok65'))){const gx2=X(G.g.guess);ctx.strokeStyle=PAL['s4'];ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(gx2,by-3);ctx.lineTo(gx2,by+bh+3);ctx.stroke();}
  const num=hid?'?':(n0(v)+(useL&&v!==b?` (${v>b?'+':''}${n0(v-b)})`:''));
  txt(ctx,num,px+pw,y+12*kk,{s:12*k,w:700,c:PAL['cv-ink'],a:'right'});
  if(!big)txt(ctx,unit,px,by+bh+13*kk,{s:12*k,c:PAL['cv-soft']});
  y+=rh;});
 txt(ctx,(big?'Avg. life: ':'Average years of life: ')+f1(R.years)+(useL&&Math.abs(R.years-B.years)>=0.05?` (${R.years>B.years?'+':''}${f1(R.years-B.years)})`:''),px,Math.min(y+(big?14:16)*kk,372),{s:13*kk,w:700,c:PAL['cv-ink']});
 /* stage strip */
 const sy=big?426:428;stripKey(ctx,14,sy-24*Math.min(k,1.3),k,big);strip(ctx,P,14,sy,772,k,big);
 /* at the reveal: the count as a sum over schooling groups */
 if(G&&G.m&&on&&!useL){const {G:gr,ans}=groups(sim),use=gr.filter(g=>g.n>0),ft=(askOk(sim)?(big?'Not poor at 65':'Reach 65, not poor'):(big?'Top fifth':'Top fifth by 30'))+` = ${use.map(g=>`${n0(g.n)} × ${g.p}%`).join(' + ')} ≈ ${n0(ans)}`;
  txt(ctx,fit(ctx,ft,772,13*Math.min(k,1.3),700),14,sy-24*Math.min(k,1.3)-22*Math.min(k,1.3),{s:13*Math.min(k,1.3),w:700,c:PAL['s2']});}}

/* ---------- drawing: follow one life ---------- */
const STAGE_AGE=[5,12,22,30,64,64,65,111];
function lifeData(sim){return oneLife(sim.p.place,sim.p.pq,lev(sim),amt(sim),Math.round(sim.p.life)-1);}
function stageLines(sim,D){const P=PL[sim.p.place],ch=D.ch,o=D.o,rec=D.rec,lines=[];const age=Math.round(D.dA);
 const st=ch.die5?`Died at age ${Math.max(0,Math.floor(D.dA))}, before 5.`:`Survived to 5${ch.st?', but stunted':''}.`;lines.push(st);
 if(ch.die5)return lines;
 lines.push(ch.prof?'Reads at the minimum level.':'Below the minimum reading level.');
 lines.push(['Left school before finishing secondary.','Finished secondary school.','Finished secondary and went on to college or university.'][ch.edu]);
 if(D.dA<20){lines.push(`Died at ${age}.`);return lines;}
 const fyrs=rec.filter(x=>x.formal).length;lines.push(`Work: formal ${fyrs} of ${rec.length} years. Income rank at 30: ${Math.round(D.pc)}th percentile (${QN[Math.min(4,Math.floor(D.pc/20))]} fifth).`);
 const ill=rec.filter(x=>x.ill).length,job=rec.filter(x=>x.job).length,dis=rec.filter(x=>x.dis).length,maxD=Math.max(0,...rec.map(x=>x.D));
 lines.push(`Shocks: ${ill} illness${ill===1?'':'es'}, ${job} job loss${job===1?'':'es'}, ${dis} disaster${dis===1?'':'s'}. ${o.trap?'Caught in a debt trap.':maxD>0.02?'Borrowed, never trapped.':'No lasting debt.'} Poor in ${o.poorYears} of ${o.workYears} working years.`);
 lines.push(PL[sim.p.place].tax.v===null?'Taxes: rates not in our notes.':`Taxes and contributions on formal pay: about ${f1(o.taxes)} years of the poverty line in all.`);
 if(D.dA>=65)lines.push(o.pension>0?`At 65: a pension of ${f1(o.pension)} poverty lines a year. ${o.pov65?'Still poor.':'Not poor.'}`:`At 65: no pension. ${o.work65>0?'Still working. ':''}${o.pov65?'Poor.':'Not poor.'}`);
 else lines.push(`Died at ${age}, before 65.`);
 lines.push(D.dA>=65?`Lived to ${age}.`:`Lived ${age} years.`);
 return lines;}
function drawOne(sim,ctx,k){const P=PL[sim.p.place],D=lifeData(sim),big=k>1.3,kk=Math.min(k,1.5),stg=Math.round(sim.p.stage),upTo=STAGE_AGE[stg-1];
 txt(ctx,fit(ctx,`Life ${Math.round(sim.p.life)} of 1,000: born in ${P.s}, parents in the ${QN[sim.p.pq-1]} fifth`,780,14*Math.min(k,1.3),700),14,24,{s:14*Math.min(k,1.3),w:700});
 const box={L:52,T:big?78:72,W:big?730:470,H:big?250:258};const xmax=75,ymax=4,X=a=>box.L+a/xmax*box.W,Y=v=>box.T+box.H-Math.min(ymax,Math.max(0,v))/ymax*box.H;
 /* axes */
 const dA0=D.dA;ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(X(0),Y(ymax),X(Math.min(dA0,16))-X(0),box.H);
 ctx.strokeStyle=PAL['line'];ctx.lineWidth=1;for(let v=0;v<=ymax;v++){ctx.beginPath();ctx.moveTo(box.L,Y(v));ctx.lineTo(box.L+box.W,Y(v));ctx.stroke();txt(ctx,String(v),box.L-8,Y(v)+4,{s:12*k,c:PAL['cv-soft'],a:'right'});}
 for(let a=0;a<=70;a+=big?20:10){txt(ctx,String(a),X(a),box.T+box.H+28*kk,{s:12*k,c:PAL['cv-soft'],a:'center'});}
 txt(ctx,big?'Income (poverty lines)':'Income, in poverty lines a year',box.L,box.T-10,{s:12*k,c:PAL['cv-soft']});
 txt(ctx,'Age',box.L-8,box.T+box.H+28*kk,{s:12*k,c:PAL['cv-soft'],a:'right'});
 ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(box.L,Y(1));ctx.lineTo(box.L+box.W,Y(1));ctx.stroke();ctx.setLineDash([]);
 txt(ctx,'poverty line',X(1.5),Y(1)-6,{s:12*k,c:PAL['s1'],w:700});
 /* childhood band */
 const ch=D.ch,dA=D.dA;
 if(stg>=1)txt(ctx,big?'Child':'Childhood',X(0)+6,Y(ymax)+16*kk,{s:12*k,c:PAL['cv-soft'],w:700});
 const dot=(a,col,lab,row)=>{const yy=Y(ymax)+36*kk+row*20*kk;ctx.fillStyle=col;ctx.beginPath();ctx.arc(X(a),yy,5*kk,0,7);ctx.fill();if(!big)txt(ctx,lab,X(a)+9*kk,yy+4*kk,{s:12*k,c:PAL['cv-ink']});};
 if(stg>=1)dot(Math.min(dA,5),ch.die5?PAL['muted']:(ch.st?PAL['s4']:PAL['s3']),ch.die5?'died':ch.st?'stunted':'age 5',0);
 if(stg>=2&&!ch.die5)dot(10,ch.prof?PAL['s3']:PAL['s4'],ch.prof?'reads':'reads below',1);
 if(stg>=3&&!ch.die5&&dA>16){const ea=[16,18,22][ch.edu];dot(Math.min(ea,dA),ch.edu?PAL['s3']:PAL['s4'],['no diploma','diploma','college'][ch.edu],2);}
 /* working years */
 const rec=D.rec.filter(x=>x.a<=upTo);
 if(stg>=4&&rec.length){
  /* formal / informal band under the axis */
  rec.forEach(x=>{ctx.fillStyle=x.formal?PAL['s3']:PAL['s4'];ctx.globalAlpha=.85;ctx.fillRect(X(x.a),box.T+box.H+4,X(x.a+1)-X(x.a)+.5,8*kk);ctx.globalAlpha=1;});
  /* debt area */
  ctx.fillStyle=PAL['s1'];ctx.globalAlpha=.22;ctx.beginPath();ctx.moveTo(X(rec[0].a),Y(0));rec.forEach(x=>ctx.lineTo(X(x.a+0.5),Y(x.D)));ctx.lineTo(X(rec[rec.length-1].a+1),Y(0));ctx.closePath();ctx.fill();ctx.globalAlpha=1;
  /* income line and poor years */
  ctx.strokeStyle=PAL['s2'];ctx.lineWidth=2.5;ctx.beginPath();rec.forEach((x,j)=>{const px=X(x.a+0.5),py=Y(x.disp);j?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();
  rec.forEach(x=>{if(x.poor){ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(X(x.a+0.5),Y(x.disp),3.5*kk,0,7);ctx.fill();}});
  if(stg>=5)rec.forEach(x=>{const px=X(x.a+0.5),py=Y(ymax)+8*kk;let row=0;
   if(x.ill){ctx.strokeStyle=PAL['s1'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px-4,py-4+row*12);ctx.lineTo(px+4,py+4+row*12);ctx.moveTo(px+4,py-4+row*12);ctx.lineTo(px-4,py+4+row*12);ctx.stroke();row++;}
   if(x.job){ctx.fillStyle=PAL['s5'];ctx.beginPath();ctx.moveTo(px-4.5,py-3+row*12);ctx.lineTo(px+4.5,py-3+row*12);ctx.lineTo(px,py+4+row*12);ctx.fill();row++;}
   if(x.dis){ctx.fillStyle=PAL['s6'];ctx.fillRect(px-3.5,py-3.5+row*12,7,7);}});}
 /* old age */
 if(stg>=7&&dA>=65&&D.o.inc65!==null){const v=D.o.inc65;ctx.fillStyle=D.o.pov65?PAL['s1']:PAL['s3'];ctx.globalAlpha=.8;ctx.fillRect(X(65.5),Y(Math.max(0,v)),X(70)-X(65.5),Y(0)-Y(Math.max(0,v)));ctx.globalAlpha=1;
  ctx.strokeStyle=PAL['s1'];ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(X(65),Y(0.6));ctx.lineTo(X(71),Y(0.6));ctx.stroke();ctx.setLineDash([]);
  txt(ctx,big?'65':'at 65',X(67.7),Y(Math.max(0,v))-6,{s:12*k,c:PAL['cv-ink'],a:'center',w:700});}
 if(stg>=8){const da=Math.min(dA,xmax);ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(da),Y(ymax));ctx.lineTo(X(da),Y(0));ctx.stroke();
  txt(ctx,dA>xmax?`lives to ${Math.round(dA)} →`:`dies at ${Math.round(dA)}`,Math.min(X(da)-6,box.L+box.W),Y(ymax)-6,{s:12*k,w:700,c:PAL['cv-ink'],a:'right'});}
 /* key */
 let ky=box.T+box.H+50*kk,kx=box.L;const ks=12*k;ctx.font=ks+'px '+FONT;
 const sh={sq:c=>(x,y)=>{ctx.fillStyle=c;ctx.fillRect(x,y-ks*.8,ks*.85,ks*.85);},dot:c=>(x,y)=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+ks*.4,y-ks*.35,ks*.33,0,7);ctx.fill();},
  area:c=>(x,y)=>{ctx.fillStyle=c;ctx.globalAlpha=.3;ctx.fillRect(x,y-ks*.8,ks*.85,ks*.85);ctx.globalAlpha=1;},
  x:c=>(x,y)=>{ctx.strokeStyle=c;ctx.lineWidth=2;const m=x+ks*.4,n=y-ks*.35,r=ks*.3;ctx.beginPath();ctx.moveTo(m-r,n-r);ctx.lineTo(m+r,n+r);ctx.moveTo(m+r,n-r);ctx.lineTo(m-r,n+r);ctx.stroke();},
  tri:c=>(x,y)=>{ctx.fillStyle=c;const m=x+ks*.4,n=y-ks*.35,r=ks*.38;ctx.beginPath();ctx.moveTo(m-r,n-r*.7);ctx.lineTo(m+r,n-r*.7);ctx.lineTo(m,n+r*.8);ctx.fill();}};
 const keys=[[sh.sq(PAL['s3']),'formal job'],[sh.sq(PAL['s4']),'informal'],[sh.dot(PAL['s1']),'poor year'],[sh.area(PAL['s1']),'debt owed'],[sh.x(PAL['s1']),'illness'],[sh.tri(PAL['s5']),'job loss'],[sh.sq(PAL['s6']),'disaster']];
 keys.forEach(([f,l])=>{const w=ctx.measureText(l).width+ks*1.3+14;if(kx+w>box.L+box.W+10){kx=box.L;ky+=ks*1.45;}f(kx,ky);txt(ctx,l,kx+ks*1.15,ky,{s:ks,c:PAL['cv-ink']});ctx.font=ks+'px '+FONT;kx+=w;});
 /* stage text panel (desktop only) */
 if(!big){const px=box.L+box.W+24,pw=800-px-10;let y=box.T-8;
  txt(ctx,`Stage ${stg} of 8: ${STAGES[stg-1].n}`,px,y,{s:13,w:700,c:PAL['rj']});y+=20;
  stageLines(sim,D).slice(0,stg).forEach((s,j)=>{if(y>436)return;y=wrap(ctx,(j+1)+'. '+s,px,y,pw,15,{s:12,c:j===stg-1?PAL['cv-ink']:PAL['cv-soft'],w:j===stg-1?700:400});y+=4;});}}

/* ---------- drawing: compare two places ---------- */
function drawCmp(sim,ctx,k){const big=k>1.3,kk=Math.min(k,1.5),L=lev(sim),keys=[sim.p.place,sim.p.place2];
 const Rs=keys.map(p=>run(p,sim.p.pq,L,amt(sim))),on=shown(sim);
 txt(ctx,fit(ctx,big?`Same 1,000 children, ${QN[sim.p.pq-1]} fifth, two places`:`The same 1,000 children (parents in the ${QN[sim.p.pq-1]} fifth), the same luck, born in two places`,780,14*Math.min(k,1.3),700),14,24,{s:14*Math.min(k,1.3),w:700});
 if(L!=='none')txt(ctx,fit(ctx,'Both places with: '+LVN(L),780,12*k),14,24+18*kk,{s:12*k,c:PAL['cv-soft']});
 const rows=[['Reach the top fifth',R=>R.top,1000,true],['Poor at 30, per 1,000 alive',R=>R.per.pov30,1000],['Poor at 65, per 1,000 alive',R=>R.per.pov65,1000],['Ever in a debt trap',R=>R.trap,1000],['Alive at 65',R=>R.a65,1000],['Read at the minimum level',R=>R.prof,1000],['Finish secondary school',R=>R.sec,1000]];
 const use=big?rows.slice(0,5):rows.slice(0,6),lx=14,bx=big?250:300,bw=800-bx-70,T=big?78:62,rh=big?62:40;
 {let hx=bx;keys.forEach((p,j)=>{ctx.fillStyle=j?PAL['s6']:PAL['s2'];ctx.fillRect(hx,T-26*kk,12*kk,12*kk);const nm=fit(ctx,PL[p].s,bw/2-30,13*kk,700);txt(ctx,nm,hx+17*kk,T-15*kk,{s:13*kk,w:700});ctx.font='700 '+(13*kk)+'px '+FONT;hx+=ctx.measureText(nm).width+40*kk;});}
 use.forEach(([lab,f,den,hide],i)=>{const y=T+i*rh;y&&0;
  if(big){txt(ctx,lab.replace(', per 1,000 alive',''),lx,y+14*kk,{s:12*k,w:700});}else txt(ctx,lab,lx,y+16,{s:12*k,w:700});
  keys.forEach((p,j)=>{const v=f(Rs[j]),hid=hide&&!on,y2=y+(big?22*kk:6)+j*(big?14*kk:15),X=bx+Math.min(1,v/den)*(bw-40);
   ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(bx,y2,bw-40,10*kk);
   if(!hid){ctx.fillStyle=j?PAL['s6']:PAL['s2'];ctx.fillRect(bx,y2,Math.max(1,X-bx),10*kk);}
   txt(ctx,hid?'?':n0(v),800-14,y2+9*kk,{s:12*k,w:700,a:'right'});});});
 const yy=T+use.length*rh+(big?4:8);
 txt(ctx,(big?'Avg. life: ':'Average years of life: ')+keys.map((p,j)=>PL[p].s+' '+f1(Rs[j].years)).join(big?', ':'  ·  '),lx,yy+12*kk,{s:12*k,w:700});
 if(!big){stripKey(ctx,14,yy+34,k,false);const cx0=130,cw=(800-cx0-10)/8;STAGES.forEach((st,i)=>txt(ctx,(i+1)+' '+st.n,cx0+i*cw+cw/2,yy+54,{s:12,c:PAL['cv-soft'],a:'center'}));
  keys.forEach((p,j)=>{const y=yy+70+j*17;txt(ctx,fit(ctx,PL[p].s,110,12,700),14,y+4,{s:12,w:700,c:j?PAL['s6']:PAL['s2']});STAGES.forEach((st,i)=>mark(ctx,cx0+i*cw+cw/2,y,5.5,stageMark(PL[p],st)));});}}

const PLACE_OPTS=KEYS.map(k=>({v:k,l:PL[k].l}));
const SIM={
 id:'lifesim',hash:'lifesim',apUnit:21,order:6,tab:'One life, many lives',kind:'Simulation',
 prereq:['opportunity'],
 skills:{bio:'Probability as a count out of 1,000, and combining groups (a weighted average) · Statistics (Chapter 5), AP Statistics (Unit 4)',honors:'Conditional probability and the law of total probability; Monte Carlo simulation · Statistics (Chapter 5), AP Statistics (Unit 4)',ap:'Simulation with calibrated models: inverse normal, bisection and Gompertz survival · AP Statistics (Unit 4), AP Precalculus (Unit 2A)'},
 card:'Guess how many of 1,000 children reach the top fifth, then follow them from birth to 65 through reading, school, work, shocks and old age.',
 title:'One life, many lives: a life simulator',
 lede:{bio:'Do where you are born and what your parents earn change the odds at each stage of a life? This tool follows 1,000 children from birth to 65 with random numbers, so you can count the outcomes and combine them with probability instead of guessing.',
  honors:'Each life is a chain of conditional probabilities: reading depends on family background, school on reading, the job on school, and what a shock costs on the job and the place. A Monte Carlo simulation runs that chain 1,000 times.',
  ap:'Every stage is a small model fitted to a sourced number: a normal latent score cut at the share of proficient readers, a probit for formal work, a lognormal income tuned so poverty matches the place, and a Gompertz hazard tuned to life expectancy.'},
 scale:'1,000 simulated lives from birth to 65 (then to death). Income is measured in poverty lines: 1.0 means exactly at this place’s poverty line for the household. Income fifths are ranked within each place.',
 aspect:16/9,timeless:true,trials:true,graph:false,
 controlsTitle:'Who and where',
 controls:[
  {id:'guess',label:'Your gut: how many of these 1,000 lives?',type:'range',min:0,max:1000,step:5,def:500,unit:' of 1,000'},
  {id:'ask',label:'What you are guessing',type:'seg',def:'top',lvl:'honors',noGut:true,onChange:clearGut,options:[{v:'top',l:'Reach the top fifth'},{v:'ok65',l:'Reach 65, not poor'}]},
  {id:'place',label:'Born in',type:'select',def:'arap',noGut:true,onChange:clearGut,options:PLACE_OPTS,help:'U.S. counties, two parts of Ecuador, and seven places around the world.'},
  {id:'pq',label:'Parents’ income fifth (in that place)',type:'seg',def:1,noGut:true,onChange:clearGut,options:[1,2,3,4,5].map(v=>({v,l:QS[v-1]})),help:'Each fifth holds 20% of families in the place, ranked by income.'},
  {id:'view',label:'Show',type:'seg',def:'dist',noGut:true,options:[{v:'dist',l:'1,000 lives'},{v:'one',l:'Follow one life'},{v:'cmp',l:'Compare two places',lvl:'honors'}]},
  {id:'lever',label:'Change one thing',type:'select',def:'none',lvl:'honors',noGut:true,options:LEVERS,help:'The same 1,000 lives with the same luck, with one change. The top-fifth line stays where it was.'},
  {id:'place2',label:'Compare with',type:'select',def:'cph',lvl:'honors',noGut:true,options:PLACE_OPTS},
  {id:'life',label:'Life to follow (number)',type:'range',min:1,max:1000,step:1,def:3,noGut:true},
  {id:'stage',label:'Stages shown for that life',type:'range',min:1,max:8,step:1,def:8,noGut:true},
  {id:'readsd',label:'Reading support: added reading skill',type:'range',min:0,max:0.6,step:0.05,def:A_.readSD,unit:' SD',lvl:'ap',noGut:true,help:'Size of the reading lever, in standard deviations of reading skill. 0.3 is an assumption for illustration.'},
  {id:'cash',label:'Cash transfer: share of the poverty line a year',type:'range',min:0,max:0.5,step:0.05,def:A_.cash,lvl:'ap',noGut:true,help:'Paid in any year income falls below the line. 0.15 is about Ecuador’s $55 a month base payment for a family of four.'},
  {id:'reveal',label:'Show the answers now',type:'toggle',def:false,noGut:true,help:'Normally the top-fifth count appears once you lock in your gut answer.'}
 ],
 actions:[
  {id:'nextlife',label:'Follow another life',run(sim){BioLab.setValues(sim,{view:'one',life:Math.round(sim.p.life)%1000+1,stage:1});}},
  {id:'nextstage',label:'Next stage',run(sim){BioLab.setValues(sim,{view:'one',stage:Math.round(sim.p.stage)%8+1});}},
  {id:'findtop',label:'Find a life that reached the top fifth',lvl:'honors',run(sim){const R=cur(sim),s=Math.round(sim.p.life);for(let j=1;j<=1000;j++){const i=(s-1+j)%1000;if(R.lives[i].f===4){BioLab.setValues(sim,{view:'one',life:i+1,stage:8});return;}}}},
  {id:'findtrap',label:'Find a life caught in a debt trap',lvl:'honors',run(sim){const R=cur(sim),s=Math.round(sim.p.life);for(let j=1;j<=1000;j++){const i=(s-1+j)%1000;if(R.lives[i].trap){BioLab.setValues(sim,{view:'one',life:i+1,stage:8});return;}}}}
 ],
 init(){return {};},step(){},
 metrics:[
  {id:'top',label:'Reach the top fifth by 30',unit:'of 1,000',d:0,min:0,max:1000,get:sim=>shown(sim)?cur(sim).top:null},
  {id:'ok65',label:'Reach 65 and are not poor',unit:'of 1,000',d:0,lvl:'honors',min:0,max:1000,get:sim=>shown(sim)?ok65(cur(sim)):null},
  {id:'pov30',label:'Poor at 30',unit:'per 1,000 alive',d:0,min:0,max:1000,get:sim=>cur(sim).per.pov30},
  {id:'pov65',label:'Poor at 65',unit:'per 1,000 alive',d:0,min:0,max:1000,get:sim=>cur(sim).per.pov65},
  {id:'trap',label:'Ever in a debt trap',unit:'of 1,000',d:0,min:0,max:1000,get:sim=>cur(sim).trap},
  {id:'a65',label:'Alive at 65',unit:'of 1,000',d:0,min:0,max:1000,get:sim=>cur(sim).a65},
  {id:'years',label:'Average years of life',unit:'years',d:1,min:0,max:100,get:sim=>cur(sim).years},
  {id:'pen',label:'Have a pension at 65',unit:'of those alive',d:0,lvl:'honors',min:0,max:1000,get:sim=>cur(sim).pen},
  {id:'lifeYrs',label:'This life lasted',unit:'years',d:0,min:0,max:110,get:sim=>lifeData(sim).dA},
  {id:'lever',label:'What the change did',text:true,lvl:'honors',get:sim=>{const L=lev(sim);if(L==='none')return 'Pick something under Change one thing.';const R=cur(sim),B=baseR(sim),d=(a,b)=>(a-b>=0?'+':'')+n0(a-b);
   return `${LVN(L)}: top fifth ${d(R.top,B.top)}, poor at 30 ${d(R.p30,B.p30)}, poor at 65 ${d(R.p65,B.p65)}, debt traps ${d(R.trap,B.trap)} (lives of 1,000)`;}},
  {id:'q15m',label:'Model: bottom fifth to top fifth, whole place',unit:'per 100',d:1,lvl:'ap',min:0,max:50,get:sim=>calibrate(sim.p.place).q15},
  {id:'slope',label:'Model rank-rank slope',unit:'',d:2,lvl:'ap',min:0,max:1,get:sim=>calibrate(sim.p.place).slope},
  {id:'formal',label:'Formal jobs (place input)',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>100-PL[sim.p.place].inf.v},
  {id:'oopm',label:'Out-of-pocket share (place input)',unit:'%',d:1,lvl:'ap',min:0,max:100,get:sim=>PL[sim.p.place].oop.v}
 ],
 draw(sim,ctx,vdt,k){ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,800,450);const V=view(sim);
  if(V==='one')drawOne(sim,ctx,k);else if(V==='cmp')drawCmp(sim,ctx,k);else drawDist(sim,ctx,k);},
 thumbSetup(sim){sim.p.reveal=true;},
 infoPanel(sim){const P=PL[sim.p.place],V=view(sim);let h='';
  h+=`<h3>What this number hides</h3><ul>${hides(P).map(x=>'<li>'+x+'</li>').join('')}</ul>`;
  h+=qualityHTML(P);
  if(V==='cmp'&&sim.p.place2!==sim.p.place)h+=qualityHTML(PL[sim.p.place2]);
  return h;},
 narrate(sim){const P=PL[sim.p.place],V=view(sim),R=cur(sim),B=baseR(sim),L=lev(sim),on=shown(sim),fq=QN[sim.p.pq-1];
  if(V==='one'){const D=lifeData(sim),stg=Math.round(sim.p.stage),ls=stageLines(sim,D);return `<b>Life ${Math.round(sim.p.life)}, stage ${stg} (${STAGES[stg-1].n}):</b> ${ls[Math.min(stg,ls.length)-1]} One life is one path through the chances. Press <b>Next stage</b> or <b>Follow another life</b> to see how different the paths are.`;}
  if(V==='cmp'){const R2=run(sim.p.place2,sim.p.pq,L,amt(sim)),P2=PL[sim.p.place2];
   return `The same 1,000 children with the same luck: ${on?`<b>${n0(R.top)} reach the top fifth in ${P.s} and ${n0(R2.top)} in ${P2.s}</b>, but each fifth is ranked within its own place. `:''}Poor at 65: ${n0(R.per.pov65)} per 1,000 alive in ${P.s}, ${n0(R2.per.pov65)} in ${P2.s}. Years of life: ${f1(R.years)} and ${f1(R2.years)}. Which differences come from local data, and which from proxies? Check the strips.`;}
  if(L!=='none'){const d=(a,b)=>(a-b>=0?'+':'')+n0(a-b);return `<b>${LVN(L)}:</b> the same 1,000 lives, the same luck. Top fifth ${d(R.top,B.top)}, poor at 30 ${d(R.p30,B.p30)}, poor at 65 ${d(R.p65,B.p65)}, debt traps ${d(R.trap,B.trap)}. The outline on each bar is the old value.`;}
  if(!on)return `Each dot is one child born in ${P.s} to parents in the ${fq} fifth. <b>If parents’ income made no difference, 200 of 1,000 would reach the top fifth.</b> ${pending(sim)?'Combine the groups in <b>Your turn</b> to get the count.':'Lock in your gut, then count.'}`;
  return `In ${P.s}, <b>${n0(R.top)} of 1,000</b> children of ${fq}-fifth parents reach the top fifth by 30; with no link to parents it would be 200. ${n0(R.per.pov30)} per 1,000 alive are poor at 30, ${n0(R.per.pov65)} at 65, and ${n0(R.trap)} are ever caught in a debt trap.`;},
 gut:{better:'lower',controls:['guess'],lockLabel:'Lock in my guess',
  ask:{bio:'Picture 1,000 babies born in the place shown on the picture, to parents in that place’s bottom fifth of incomes. Drag the slider here to how many you think reach the top fifth of adult incomes by age 30. Then lock it in.',
   honors:'For the place and parents’ fifth you picked, drag the slider here to your gut: of 1,000 lives, how many reach the top fifth by 30 (or, if you chose it, reach 65 and are not poor)? Then lock it in.'},
  hint:{bio:'Lock in your gut answer. Then you will combine the groups yourself to get the count.'},
  calc:{unit:'of 1,000',d:0,tol:2,prompt:calcPrompt,answer:sim=>groups(sim).ans,
   hint:{bio:'Find each group’s count: group size × its percent. Then add the groups.',honors:'Law of total probability: P(A) = Σ P(group) × P(A | group). In counts: Σ group size × percent.'},
   steps:calcSteps},
  formula(sim){const {G,ans}=groups(sim),use=G.filter(g=>g.n>0),w=askOk(sim)?'Reach 65, not poor':'Top fifth';
   return `${w} = Σ group size × P(${askOk(sim)?'not poor at 65':'top fifth'} | schooling) = ${use.map(g=>`${n0(g.n)} × ${g.p}%`).join(' + ')} ≈ ${n0(ans)} of 1,000`+(askOk(sim)?'':`<br>With no link to parents: 1,000 × 1/5 = 200`);},
  lock(sim){const a=target(sim,baseR(sim));return {v:Math.abs(sim.p.guess-a),guess:sim.p.guess,ask:atLeast('honors')?sim.p.ask:'top',label:`${n0(sim.p.guess)} of 1,000`};},
  solve(sim){const a=target(sim,baseR(sim));sim.p.guess=a;sim.p.view='dist';sim.p.lever='none';return {v:0,guess:a,ask:atLeast('honors')?sim.p.ask:'top',label:`${n0(a)} of 1,000`};},
  how:{bio:'The model follows each child through eight stages. At each one it draws a random number to decide what happens (surviving to 5, reading, finishing school, getting a formal job, an illness or a job loss), using chances set from real data for the place. Then it counts.',
   honors:'Each stage is a conditional probability that depends on the stages before it. Running the chain 1,000 times (a Monte Carlo simulation) turns those chances into a distribution, and the count is one bar of it.',
   ap:'Reading: L = βz + √(1 − β²)ε, proficient if L > t. School: Φ(0.9 + (L − t)). Income at 30: ln y = m + (pay for schooling) + wz + 0.5η, with w tuned so the U.S. bottom-to-top rate is 9.0 per 100 and m tuned so poverty matches the place. Ranks use fixed cutoffs from 5,000 lives born in the place.'},
  compare(sim,g,m){const P=PL[sim.p.place],off=Math.abs(g.guess-m.guess),what=g.ask==='ok65'?'reach 65 and are not poor':'reach the top fifth';
   const K=sim.ui&&sim.ui.calc,self=K&&K.done&&K.correct?' You also combined the groups yourself to get it.':'';
   const head=off<=15?`Your gut was right on: the model says ${n0(m.guess)} of 1,000 ${what}, and you said ${n0(g.guess)}.`:`The model says <b>${n0(m.guess)} of 1,000</b> ${what}. You guessed ${n0(g.guess)}: off by <b>${n0(off)} lives</b>, ${g.guess>m.guess?'that many more':'that many fewer'} people than the count.`;
   const top5=run(sim.p.place,5,'none',amt(sim)),bot=run(sim.p.place,1,'none',amt(sim));
   const ctx2=g.ask==='ok65'?` For parents in the top fifth of the same place: ${n0(ok65(top5))}; bottom fifth: ${n0(ok65(bot))}.`:` With no link to parents it would be 200. In the same place, children of top-fifth parents: ${n0(top5.top)}; bottom fifth: ${n0(bot.top)}.`;
   return head+self+ctx2+`<br><b>What this number hides:</b> ${hides(P)[0]}`;},
  again(sim){sim.p.place=KEYS[Math.floor(Math.random()*KEYS.length)];sim.p.pq=1+Math.floor(Math.random()*5);sim.p.guess=500;sim.p.view='dist';sim.p.lever='none';sim.p.reveal=false;}
 },
 challenges:[
  {lvl:'bio',kind:'num',q:'A different place: of 1,000 children, 300 finish college and 700 do not. 40% of the college graduates reach the top fifth by 30, and 10% of the others do. How many of the 1,000 reach the top fifth?',answer:190,tol:1,unit:'of 1,000',d:0,hint:'Find each group’s count (group size × percent), then add.',explain:'College: 300 × 40% = 120. Others: 700 × 10% = 70. Total: 120 + 70 = 190 of 1,000. That is the law of total probability: 0.3 × 0.4 + 0.7 × 0.1 = 0.19.'},
  {lvl:'bio',instant:true,q:'Suppose parents’ income made no difference at all. Of 1,000 children born to bottom-fifth parents, how many would reach the top fifth?',choices:['0','About 90','200','500'],correct:2,explain:'With no link, every child has the same 1-in-5 chance of each fifth: 1,000 ÷ 5 = 200. In Aurora and Denver the model counts 91, close to the measured U.S. rate of 9.0 per 100 it is tuned to.'},
  {lvl:'bio',kind:'num',q:'The same $1,000 illness bill arrives in Copenhagen and in Dhaka. Households pay 13.87% of health spending out of pocket in Denmark and 79.31% in Bangladesh. If each household pays that share of the bill, how many more dollars does the Dhaka household pay?',answer:654.4,tol:0.5,unit:'$',d:2,hint:'Find each share of $1,000, then subtract.',explain:'Dhaka: 0.7931 × $1,000 = $793.10. Copenhagen: 0.1387 × $1,000 = $138.70. Difference: $793.10 − $138.70 = $654.40. Same shock, different cushion: that is why the shock stage depends on the place.'},
  {lvl:'honors',instant:true,q:'A payday loan charges $15 per $100 for two weeks. What simple annual rate is that?',choices:['15%','30%','195%','390%'],correct:3,explain:'15% × 26 two-week periods = 390% a year. Roll a $300 loan over 10 times and the fees reach $450 while the $300 is still owed.'},
  {lvl:'honors',instant:true,q:'When you pull a lever, why does the tool keep the top-fifth line where it was instead of re-ranking everyone?',choices:['To make the lever look better','Ranks are zero-sum: if the line moved with everyone, one life could only rise by pushing another out, so a fixed line shows real change','It saves computer time'],correct:1,explain:'Exactly one fifth of any group is always in its own top fifth. A fixed line (today’s cutoff income) lets the count go up when lives really improve.'},
  {lvl:'honors',instant:true,q:'Across 18 studies, informal workers earn 19% less on average, but the gap becomes negligible after controlling for education and experience. What does that suggest?',choices:['Informal jobs pay the same as formal ones in every way','Much of the raw gap comes from who holds informal jobs (less schooling), a confounding variable, so the model gives informal work no extra pay penalty but no protection either','The studies must be wrong'],correct:1,explain:'Schooling affects both the job type and the pay. In this model, an informal job costs a life through missing sick pay, pensions and coverage, not through a lower wage at the same schooling.'},
  {lvl:'ap',instant:true,q:'A household earns 1.2 poverty lines a year with monthly swings CV = 0.55. With normal months, the expected shortfall below needs is c·y·φ(d) + (1 − y)·Φ(d), d = (1 − y)/(c·y). About how much is it?',choices:['0 (they are above the line)','About 0.18 poverty lines, roughly 2 months of needs','About 1.2 poverty lines'],correct:1,explain:'d = −0.2/0.66 ≈ −0.303, φ(d) ≈ 0.381, Φ(d) ≈ 0.381. Shortfall ≈ 0.66 × 0.381 − 0.2 × 0.381 ≈ 0.175 poverty lines, about 2.1 months of needs that must come from savings or a loan.'},
  {lvl:'ap',instant:true,q:'The model’s death rate grows like e^(0.085·age) (a Gompertz curve). About how often does the yearly risk of dying double?',choices:['Every 2 years','Every 8 years','Every 25 years'],correct:1,explain:'Doubling time = ln 2 ÷ 0.085 ≈ 8.2 years. A small change in the level of the curve shifts life expectancy by years, which is how place and income enter.'},
  {lvl:'ap',instant:true,q:'A rank-rank slope of 0.3 versus 0.6: how far apart are the expected ranks of children whose parents sit at the 25th and 75th percentiles?',choices:['15 ranks vs. 30 ranks','30 ranks vs. 60 ranks','The same in both'],correct:0,explain:'Gap = slope × 50 ranks: 0.3 × 50 = 15, 0.6 × 50 = 30. The Ecuador places use 0.6, a figure modeled from education persistence, not measured income ranks.'}
 ],
 tour:[
  {title:'1,000 lives, not one story',text:'Each dot is one child born in Aurora and Denver to parents in the bottom fifth of incomes there. The model follows every one from birth to 65 through eight stages and colors each by income fifth at 30.',pause:true,setup:sim=>BioLab.setValues(sim,{place:'arap',pq:1,view:'dist',lever:'none',life:3,stage:8}),focus:[0,30,470,330]},
  {title:'Count instead of guessing',text:'91 of the 1,000 reach the top fifth by 30. If parents’ income made no difference, 200 would. The model is tuned to the measured U.S. rate: 9.0 in 100.',pause:true,focus:sim=>[440,30,360,340]},
  {title:'Same place, top-fifth parents',text:'Switch to parents in the top fifth: 337 of 1,000 reach the top fifth themselves, and 41 per 1,000 are poor at 30, against 216 for the bottom fifth.',pause:true,setup:sim=>BioLab.setValues(sim,{pq:5})},
  {title:'How good is each number?',text:'The strip shows the data under each stage. A filled dot means a local figure; a ring, a state or national figure; a dashed ring, a modeled figure, a proxy from another place or an assumption. For Aurora and Denver, the poverty and uninsured rates are local, but every stage leans on at least one national figure or assumption. The full table is under the picture.',pause:true,setup:sim=>BioLab.setValues(sim,{pq:1}),focus:[0,385,800,65]},
  {title:'Follow one life',text:'The blue line is one person’s income each year, in poverty lines. Red dots are poor years, the band under the axis shows formal (green) and informal (amber) work, and the marks along the top are shocks. Press Next stage to walk it step by step.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'one',life:3,stage:8})},
  {lvl:'honors',title:'Change one thing',text:'A cash transfer of 0.15 poverty lines a year, paid whenever income falls below the line: poor at 30 goes from 216 to 157 per 1,000 alive. Any ringed dot moved up a fifth. The top-fifth line stays fixed, so the count can really change.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'dist',lever:'cash'})},
  {lvl:'honors',title:'Same children, two places',text:'The same 1,000 children with the same random luck, born in Aurora and Denver or in Copenhagen. Poor at 65: 170 vs. 179 per 1,000 alive. Years of life: 76.3 vs. 81.2. Check which differences rest on local data.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'cmp',lever:'none',place2:'cph'})},
  {lvl:'ap',title:'Under the hood',text:'Each place gets five tuned numbers: a reading cutoff from the inverse normal, a formal-work intercept, a family-wealth weight, an income level m found by bisection so poverty matches, and a Gompertz level for life expectancy. Everything else is the same for every place, so differences come from the data.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'dist'})}
 ],
 lab:{bio:'<p><b>Question:</b> How much does the parents’ fifth change the count?</p><ol><li>Turn on <b>Show the answers now</b>.</li><li>For your place, record <b>Reach the top fifth</b> and <b>Poor at 65</b> for each parents’ fifth, bottom to top.</li><li>Repeat for one place in another country.</li></ol><p>Write two sentences: what pattern do you see, and which stage’s data for that place is weakest (check the strip)?</p>',
  honors:'<p><b>Question:</b> Which single change moves the distribution most, and for which outcome?</p><ol><li>Pick a place and the bottom fifth. Record the four outcomes with <b>Change one thing</b> set to each option.</li><li>Repeat for a place in a different country.</li><li>Rank the changes by their effect on <b>Poor at 65</b>, then on <b>Ever in a debt trap</b>.</li></ol><p>Explain why the ranking differs by outcome and by place. Then name one assumption behind the lever that, if wrong, would change your ranking.</p>',
  ap:'<p><b>Question:</b> How sensitive is the result to an assumption?</p><ol><li>Set the bottom fifth and <b>Reading and school support</b>. Record <b>Reach the top fifth</b> with the support at 0, 0.15, 0.3, 0.45 and 0.6 SD.</li><li>Fit a line and report the slope in lives per 0.1 SD.</li><li>Repeat with <b>A cash transfer</b> from 0 to 0.5 for <b>Poor at 30</b>.</li></ol><p><b>CER:</b> Claim about which result depends most on an assumption, evidence from your tables, and reasoning that names what a real study would need to measure.</p>'},
 terms:[
  {t:'Distribution',d:'How outcomes are spread across many cases: here, 1,000 lives, not one average person.'},
  {t:'Income fifth (quintile)',d:'One of five equal groups, each 20% of families, ranked by income. The top fifth is the richest 20%.'},
  {t:'Poverty line',d:'An income below which a household counts as poor. Each place draws its line differently.'},
  {t:'Proxy',d:'A number from somewhere else used because the real one is missing, like Mexico’s child death rate standing in for Ecuador’s.'},
  {t:'Informal work',d:'Work not covered by social insurance, paid leave or registration, in law or in practice. A job can be informal inside a registered business.'},
  {t:'Out-of-pocket share',d:'The part of health spending a household pays directly, not through insurance or taxes.'},
  {t:'Debt trap',d:'Here: high-cost debt (payday or moneylender) still owed at the end of two years in a row.'},
  {t:'Conditional probability',d:'The chance of something given that something else happened, like finishing school given that you read well.',lvl:'honors'},
  {t:'Monte Carlo simulation',d:'Running a chance process many times with random numbers to see the spread of outcomes.',lvl:'honors'},
  {t:'Replacement rate',d:'A pension as a share of the pay it replaces. OECD figures assume a full career of formal work.',lvl:'honors'},
  {t:'Calibration',d:'Choosing a model’s free numbers so it reproduces a measured value, like tuning income levels until poverty matches.',lvl:'ap'},
  {t:'Gompertz law',d:'Adult death risk rising exponentially with age, about doubling every 8 years.',lvl:'ap'}
 ],
 about:'<p><b>What the model does.</b> Each run follows 1,000 children with seeded random numbers. Life number n gets the same random draws in every place and every setting, so two places or two settings compare the same children with the same luck (a paired comparison). Family background z is the normal score of the family’s percentile within its fifth of the place. Eight stages:</p><ol><li><b>Childhood.</b> Death before 5 at the place’s under-5 rate and stunting at the place’s rate, both higher for poorer families (the size of that tilt is an assumption; it is scaled so the place average equals the figure).</li><li><b>Reading.</b> A reading score L = βz + √(1 − β²)ε − 0.3 (if stunted). β comes from the PISA rich-poor gap: gap ÷ 100 ÷ 2.54 (the PISA scale has SD 100, and the top and bottom quarters of a normal are 2.54 SD apart). The cutoff t is set so the share above it matches the place’s reading figure. The figures come from different tests (NAEP Basic in 4th grade, PISA Level 2 at 15, World Bank learning poverty at the end of primary), so they are only roughly comparable.</li><li><b>School</b> (assumption for every place). P(finish secondary) = Φ(0.9 + (L − t)); P(college, given secondary) = Φ(−0.6 + (L − t) + 0.3z). Pay by schooling uses U.S. median weekly earnings ($770, $966, $1,578) everywhere.</li><li><b>Work and income.</b> P(formal job) = Φ(c + 0.6 × schooling level), with c tuned to the place’s informal share; each year there is an 8% chance of a new draw. Take-home income y, in poverty lines a year, is exp(m + pay for schooling + wz + 0.5η + 0.02 × (age − 30, capped at 45) + 0.15ν). The weight w (family wealth and connections) is tuned so the U.S. bottom-to-top rate is 9.0 per 100; Memphis is tuned to 5.4, Copenhagen to 11.7 and the Ecuador places to a rank slope of 0.6; other places keep the U.S. weight. The level m is found by bisection so the share of poor years at ages 25 to 64 matches the place’s poverty rate. Informal work pays the same as formal work at the same schooling: the World Bank finds the raw 19% gap “becomes negligible” after controls.</li><li><b>Shocks and borrowing</b> (rates are assumptions, the same everywhere, so the cushion differs, not the shock). Each year: illness 4% (6% without a diploma), costing 0.4 poverty lines × the out-of-pocket share (uninsured U.S. residents pay the whole bill) plus 2 months of pay without sick pay; job loss at the U.S. rate for your schooling, scaled by the place’s unemployment, costing 3 months of pay, half replaced if the job is covered; a disaster 1%, costing 0.5 poverty lines. Monthly swings use the expected shortfall of a normal month, cy·φ(d) + (1 − y)·Φ(d) with d = (1 − y)/(cy), CV c = 0.33 formal, 0.55 informal, covered by savings or borrowed for about 2 months. A year’s gap is covered by savings, then a loan at the formal rate (with bank access) or the high-cost rate. Half of any surplus repays debt and 10% of the rest is saved. A year is poor if income minus medical and disaster costs and interest is below 1 poverty line, much as the U.S. Supplemental Poverty Measure subtracts medical costs.</li><li><b>Taxes and benefits</b> (simplified). Incomes are take-home pay, and existing benefits are already inside each place’s measured poverty rate. The tax rate on formal pay is shown for one life only. The cash-transfer lever adds a payment in any year income falls below the line.</li><li><b>Old age.</b> A pension if formal years reach the minimum: replacement rate × average take-home × min(1, years ÷ 35). Savings pay out over 15 years. With no pension, 39% keep working at half their last pay (Ecuador’s participation rate for older adults, used everywhere). Needs fall to 0.6 poverty lines, assuming a smaller household.</li><li><b>Lifespan.</b> Death risk A·e^(0.085·age) × e^(−0.0085 × (income rank − 50)), about 0.1 years of life per percentile (the low end of the U.S. estimate), with A tuned so life expectancy at birth matches the place.</li></ol><p><b>Levers.</b> Reading and school support adds 0.3 SD of reading skill (assumption for illustration). Bank access gives every life the formal loan rate. Health coverage caps the out-of-pocket share at the rich-country average in our notes (12.3%) and covers the uninsured; in this model it changes what illness costs, not how long people live. Paid sick days keep pay during illness. Social insurance gives informal workers what formal workers get: sick pay, unemployment cover and pension years. The cash transfer pays 0.15 poverty lines a year below the line, about Ecuador’s $55 a month base payment for a family of four ($55 ÷ (4 × $92.40) ≈ 0.15).</p><p><b>Checks against measurements.</b> These are not tuned, so compare them with the model. U.S. poverty at 65 and older: 15.0% on the Supplemental Poverty Measure, 9.9% official (2024, <a href="https://www2.census.gov/library/publications/2025/demo/p60-287.pdf" target="_blank" rel="noopener">Census P60-287 (2024 poverty)</a>). Ecuador: 44% of older adults have neither labor income nor a pension (<a href="https://primicias.ec/economia/adultos-mayores-ecuador-ingresos-laborales-pension-oit-80116" target="_blank" rel="noopener">Primicias on ILO, older adults in Ecuador</a>). U.S. fatal work injuries: 3.3 per 100,000 full-time workers, 12.5 in transportation (<a href="https://www.bls.gov/news.release/archives/cfoi_02192026.pdf" target="_blank" rel="noopener">BLS fatal work injuries 2024</a>). At 3.3, about 1.3 of 1,000 workers would die on the job over 40 years, too rare to show here.</p><p><b>Left out.</b> Wealth and inheritance, housing, neighborhoods within a place, race and gender, migration, marriage and changing household size, discrimination, violence, disasters that differ by place, non-contributory pensions (such as Ecuador’s $100 a month Mis Mejores Años), the effect of health coverage on survival, and mobile money (in Kenya, M-Pesa users held consumption steady after a shock while non-users’ fell about 7%: <a href="https://poverty-action.org/news/simple-access-mobile-money-lifted-two-percent-kenyan-households-out-poverty-finds-new-study" target="_blank" rel="noopener">IPA on M-Pesa (Suri & Jack 2016)</a>). Japan, Germany, Mexico, India, Kenya and Bangladesh have no measured mobility figure in our notes. Chulqueros in Ecuador have been documented charging up to 1,238% a year (<a href="https://primicias.ec/noticias/economia/chulco-creditos-tasas-interes-ecuador" target="_blank" rel="noopener">Primicias on chulqueros (Equifax, 2021)</a>), far above the 80% proxy used.</p><p><b>Questions to ask any number.</b> '+QUESTIONS.join(' · ')+'</p><p><b>Investigate.</b> '+[turnHTML(PL.arap),turnHTML(PL.quito),turnHTML(PL.munich)].map(x=>x.replace(/<\/?p>/g,'').replace('<b>Your turn: investigate.</b> ','')).join(' ')+'</p>'+linksHTML(true)+'<p><b>A simplified model, not advice.</b> This is a teaching model for probability and simulation, not financial, medical or policy advice, and not a prediction for any real person. It does not ask for anything about you, and nothing leaves your browser.</p><p><b>For reflection.</b> Catholic social teaching names solidarity and the common good among its principles, and Jesuit schools describe their aim as forming men and women for others. A question to sit with: when 1,000 lives become one number, whose life is easiest to lose sight of?</p><p><b>Sources</b> (retrieved November 2026; each stage’s figure, year and kind are in the table under the picture): <a href="https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SH.DYN.MORT?format=json&mrnev=1" target="_blank" rel="noopener">UN IGME via World Bank, under-5 mortality</a>; <a href="https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SH.STA.STNT.ZS?format=json&mrnev=1" target="_blank" rel="noopener">World Bank, stunting (height-for-age)</a>; <a href="https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SP.DYN.LE00.IN?format=json&mrnev=1" target="_blank" rel="noopener">UN WPP via World Bank, life expectancy</a>; <a href="https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SE.LPV.PRIM?format=json&mrnev=1" target="_blank" rel="noopener">World Bank, learning poverty</a>; <a href="https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SI.POV.NAHC?format=json&mrnev=1" target="_blank" rel="noopener">World Bank, poverty at national lines</a>; <a href="https://api.worldbank.org/v2/country/DEU;JPN;DNK;MEX;IND;KEN;BGD/indicator/SH.XPD.OOPC.CH.ZS?format=json&mrnev=1" target="_blank" rel="noopener">WHO GHED via World Bank, out-of-pocket share</a>; <a href="https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/germany_1a2cf137-en.html" target="_blank" rel="noopener">OECD PISA 2022 country note: Germany</a>; <a href="https://www.elcomercio.com/opinion/editorial/resultados-ecuador-lectura-pruebas-pisa-2025/" target="_blank" rel="noopener">El Comercio on PISA 2025, Ecuador</a>; <a href="https://www.ilo.org/sites/default/files/2025-05/World_Informality%20Regional%20statistical%20profile.pdf" target="_blank" rel="noopener">ILO, World informality profile (2025)</a>; <a href="https://en.wikipedia.org/wiki/List_of_countries_by_informal_employment_rate" target="_blank" rel="noopener">ILOSTAT list of informal employment rates</a>; <a href="https://www.bls.gov/emp/tables/unemployment-earnings-education.htm" target="_blank" rel="noopener">BLS, earnings and unemployment by education</a>; <a href="https://www.federalreserve.gov/publications/2026-economic-well-being-of-us-households-in-2025-executive-summary.htm" target="_blank" rel="noopener">Federal Reserve SHED 2025</a>; <a href="https://www.consumerfinance.gov/about-us/newsroom/cfpb-finds-four-out-of-five-payday-loans-are-rolled-over-or-renewed" target="_blank" rel="noopener">CFPB, payday lending data point (2014)</a>; <a href="https://www.pensionpolicyinternational.com/?p=73182" target="_blank" rel="noopener">OECD Pensions at a Glance 2023 (summary)</a>; <a href="https://www.rsmuk.com/insights/employment-matters/employment-tax/employment-taxation-in-oecd-countries" target="_blank" rel="noopener">OECD Taxing Wages (via RSM UK)</a>; <a href="https://www.stacker.com/kentucky/counties-shortest-life-expectancy-kentucky" target="_blank" rel="noopener">CDC 2022, via County Health Rankings list</a>; <a href="https://www.stacker.com/kentucky/counties-shortest-life-expectancy-kentucky" target="_blank" rel="noopener">County Health Rankings 2024 (via Stacker)</a>; <a href="https://www.nber.org/papers/w19844.pdf" target="_blank" rel="noopener">Chetty et al. 2014, NBER w19844</a>; <a href="https://www.budget.senate.gov/imo/media/doc/Chetty%20mobility%20testimony.pdf" target="_blank" rel="noopener">Chetty, Senate testimony on mobility</a>; <a href="https://cutler.scholars.harvard.edu/resource/jsc160006pdf" target="_blank" rel="noopener">Chetty et al. 2016, JAMA</a>; <a href="https://educationnext.org/low-performing-students-fall-farther-behind-the-pack-naep-reading-achievement-levels/" target="_blank" rel="noopener">Education Next on NAEP 2024</a>; <a href="https://www.chalkbeat.org/colorado/2025/01/29/naep-national-test-score-results-denver-and-state-outperform-but-still-not-recovered" target="_blank" rel="noopener">Chalkbeat Colorado on NAEP 2024</a>; <a href="https://datausa.io/profile/geo/arapahoe-county-co" target="_blank" rel="noopener">Data USA, Arapahoe County (Census ACS)</a>; <a href="https://datausa.io/profile/geo/dallas-county-tx" target="_blank" rel="noopener">Data USA, Dallas County (Census ACS)</a>; <a href="https://datausa.io/profile/geo/shelby-county-tn" target="_blank" rel="noopener">Data USA, Shelby County (Census ACS)</a>; <a href="https://datausa.io/profile/geo/perry-county-ky" target="_blank" rel="noopener">Data USA, Perry County (Census ACS)</a>; <a href="https://datausa.io/profile/geo/owsley-county-ky" target="_blank" rel="noopener">Data USA, Owsley County (Census ACS)</a>; <a href="https://tdi.texas.gov/wc/dwc/biennial24.html" target="_blank" rel="noopener">Texas Department of Insurance, 2024</a>; <a href="https://sycamoretn.org/economic-opportunity-upward-mobility-tennessee" target="_blank" rel="noopener">Sycamore Institute (Opportunity Atlas), 2020</a>; <a href="https://www.primicias.ec/economia/pobreza-nacional-2025-ecuador-orellana-inec-116922/" target="_blank" rel="noopener">Primicias, Feb 2026 (INEC 2025)</a>; <a href="https://www.ecuadorencifras.gob.ec/institucional/inec-presenta-resultados-de-la-enemdu-diciembre-2025/" target="_blank" rel="noopener">INEC, ENEMDU December 2025</a>; <a href="https://www.ecuadorencifras.gob.ec/institucional/ecuador-registra-86-mil-personas-menos-en-situacion-de-desempleo-en-mayo-de-2026-frente-a-mayo-de-2025/" target="_blank" rel="noopener">INEC, ENEMDU May 2026</a>; <a href="https://www.bloomberglinea.com/latinoamerica/ecuador/desempleo-en-ecuador-se-redujo-en-marzo-de-2026-pero-aumento-la-informalidad-revela-el-inec/" target="_blank" rel="noopener">Bloomberg Línea, March 2026 (INEC)</a>; <a href="https://ghoapi.azureedge.net/api/GHED_OOPSCHE_SHA2011?$filter=SpatialDim%20eq%20%27ECU%27" target="_blank" rel="noopener">WHO GHED, Ecuador</a>; <a href="https://www.eluniverso.com/opinion/columnistas/inclusion-financiera-retos-nota/" target="_blank" rel="noopener">El Universo on Global Findex 2025</a>; <a href="https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm" target="_blank" rel="noopener">Banco Central del Ecuador, rates</a>; <a href="https://www.nber.org/system/files/working_papers/w24272/revisions/w24272.rev0.pdf" target="_blank" rel="noopener">Karlan, Mullainathan & Roth, NBER w24272</a>; <a href="https://eldiario.ec/ecuador/tipos-afiliacion-al-iess-aportes-mensuales-13072026/" target="_blank" rel="noopener">El Diario, IESS contributions 2026</a>; <a href="https://www.cedlas.econo.unlp.edu.ar/wp/wp-content/uploads/doc_cedlas215.pdf" target="_blank" rel="noopener">Neidhöfer, Serrano & Gasparini, CEDLAS WP 215</a>; <a href="https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2025/enoe/enoe2025_08_CdMx.pdf" target="_blank" rel="noopener">INEGI ENOE, Mexico City, Q2 2025</a>; <a href="https://www.thenewsminute.com/news/kerala-still-has-highest-life-expectancy-birth-cedes-ground-all-other-age-groups-51898" target="_blank" rel="noopener">The News Minute on SRS 2010–14</a>; <a href="https://www.microsave.net/wp-content/uploads/2023/08/PoP_BN_9_Three_Country_Analysis.pdf" target="_blank" rel="noopener">Portfolios of the Poor, Brief 9</a>; <a href="https://www.uasingishunews.co.ke/18-5-million-kenyans-have-registered-for-social-health-authority-ministry-of-health/" target="_blank" rel="noopener">Uasin Gishu News on Kenya SHA, Jan 2025</a>; <a href="https://www.stlouisfed.org/~/media/Files/PDFs/Community%20Development/Econ%20Mobility/Sessions/MorduchPaper508.pdf" target="_blank" rel="noopener">U.S. Financial Diaries (Hannagan & Morduch)</a>; <a href="https://www2.census.gov/library/publications/2025/demo/p60-287.pdf" target="_blank" rel="noopener">Census P60-287 (2024 poverty)</a>; <a href="https://blogs.worldbank.org/en/voices/five-reasons-be-concerned-about-shadow-economy" target="_blank" rel="noopener">World Bank, The Long Shadow of Informality (blog)</a>; <a href="https://primicias.ec/economia/adultos-mayores-ecuador-ingresos-laborales-pension-oit-80116" target="_blank" rel="noopener">Primicias on ILO, older adults in Ecuador</a>; <a href="https://www.ecuadorencifras.gob.ec/institucional/reduccion-del-analfabetismo-en-ecuador-mas-de-199-000-personas-libres-de-esta-condicion-desde-2010/" target="_blank" rel="noopener">INEC, illiteracy in Censo 2022</a>; <a href="https://poverty-action.org/news/simple-access-mobile-money-lifted-two-percent-kenyan-households-out-poverty-finds-new-study" target="_blank" rel="noopener">IPA on M-Pesa (Suri & Jack 2016)</a>; <a href="https://primicias.ec/noticias/economia/chulco-creditos-tasas-interes-ecuador" target="_blank" rel="noopener">Primicias on chulqueros (Equifax, 2021)</a>; <a href="https://cdn.www.census.gov/programs-surveys/ces/data/public-use-data/opportunity-atlas-data-tables.html" target="_blank" rel="noopener">Census, Opportunity Atlas data tables</a>; <a href="https://livingwage.mit.edu/counties/48113" target="_blank" rel="noopener">MIT Living Wage Calculator</a>; <a href="https://www.bls.gov/news.release/archives/cfoi_02192026.pdf" target="_blank" rel="noopener">BLS fatal work injuries 2024</a>.</p>'
};
BioLab.register(SIM);

})();
