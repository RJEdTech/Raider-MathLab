(function(){
'use strict';
const {clamp,txt,rr,PAL,FONT,axes,legend,atLeast}=BioLab.h;
/* ---------- the data ----------
   Every price is in the place's own currency, with its source key (see SRC) or null when I found no reliable price.
   Wages are pay per hour in the same currency. Sources, dates and assumptions are listed in `about`. */
const GAL=3.78541,LB=2.20462;                       /* liters per U.S. gallon; pounds per kg */
const FX={USD:1,EUR:1/1.1163,JPY:157.47,DKK:6.6946,MXN:18.7942,INR:94.94,KES:129.91,BDT:122.75};  /* local currency per U.S. dollar */
const CUR={USD:['$',''],EUR:['€',''],JPY:['¥',''],DKK:['',' kr'],MXN:['MX$',''],INR:['₹',''],KES:['KSh ',''],BDT:['Tk ','']};
const KDKK=6.6946*1.1163;                           /* kroner per euro, from the two Fed rates */
const FT=40*52/12;                                  /* a 40-hour week: 173.33 hours a month */
const KEH=52*52/12,BDH=48*52/12;                    /* Kenya 52-hour week (assumption), Bangladesh 48-hour week */
const KE_TYP=3275769.3e6/3315.0e3/12;               /* KNBS 2025: total wage bill ÷ wage employees ÷ 12 months */
const P=[
 {id:'aur',c:'Aurora, CO',n:'Aurora, CO',s:'Aurora',cur:'USD',geo:'U.S. city',
  w:{min:15.16,typ:28.12},wk:{min:'Colorado minimum wage, 2026',typ:'median, Denver-Aurora metro (May 2023)'},inf:'U.S.: no local figure; high-income countries average about 13% informal work (ILO)'},
 {id:'dal',c:'Dallas, TX',n:'Dallas, TX',s:'Dallas',cur:'USD',geo:'U.S. city',
  w:{min:7.25,typ:23.29},wk:{min:'federal minimum wage (Texas uses it)',typ:'median, Dallas-Fort Worth metro (May 2023)'},inf:'U.S.: no local figure; high-income countries average about 13% informal work (ILO)'},
 {id:'mem',c:'Memphis, TN',n:'Memphis, TN',s:'Memphis',cur:'USD',geo:'U.S. city',
  w:{min:7.25,typ:20.86},wk:{min:'federal minimum wage (Tennessee uses it)',typ:'median, Memphis metro (May 2023)'},inf:'U.S.: no local figure; high-income countries average about 13% informal work (ILO)'},
 {id:'eky',c:'Rural E. Kentucky',n:'Rural eastern Kentucky',s:'E. Kentucky',cur:'USD',geo:'U.S. rural',
  w:{min:7.25,typ:17.65},wk:{min:'federal minimum wage (Kentucky uses it)',typ:'median, East Kentucky nonmetro area (May 2023)'},inf:'U.S.: no local figure; high-income countries average about 13% informal work (ILO)'},
 {id:'muc',c:'Munich, Germany',n:'Munich, Germany',s:'Munich',cur:'EUR',geo:'European city',
  w:{min:13.90,typ:54066/2080},wk:{min:'German minimum wage, 2026',typ:'national median full-time pay ÷ 2,080 h (2025)'},inf:'Germany: about 2.5% informal work (ILO, 2022)'},
 {id:'tyo',c:'Tokyo, Japan',n:'Tokyo, Japan',s:'Tokyo',cur:'JPY',geo:'Asian city',
  w:{min:1280,typ:340600/FT},wk:{min:'Tokyo minimum wage from Oct 1, 2026',typ:'national mean for full-time workers ÷ 173.3 h'},inf:'Japan: not in the ILO list I used; high-income countries average about 13%'},
 {id:'cph',c:'Copenhagen',n:'Copenhagen, Denmark',s:'Copenhagen',cur:'DKK',geo:'European city',
  w:{min:null,typ:286.63},wk:{min:'no legal minimum wage: unions and employers set pay floors industry by industry',typ:'national median hourly pay (2024)'},inf:'Denmark: about 2.8% informal work (ILO, 2019)'},
 {id:'uio',c:'Quito, Ecuador',n:'Quito, Ecuador',s:'Quito',cur:'USD',geo:'Andean city',
  w:{min:482/FT,typ:657.40/FT},wk:{min:'Ecuador minimum, $482 a month ÷ 173.3 h (2026)',typ:'Quito mean labor income ÷ 173.3 h (2025)'},inf:'Quito: 25% of workers in the informal sector (2025); Ecuador overall about 53% (May 2026)'},
 {id:'ehi',c:'Rural Ecuador',n:'Rural highland Ecuador',s:'Rural Ecuador',cur:'USD',geo:'Andean rural',
  w:{min:482/FT,typ:365/FT},wk:{min:'Ecuador minimum, $482 a month ÷ 173.3 h (2026)',typ:'rural Ecuador mean labor income ÷ 173.3 h (May 2026)'},inf:'Rural Ecuador: 79% of workers informal (Dec 2023)'},
 {id:'mex',c:'Mexico City',n:'Mexico City',s:'Mexico City',cur:'MXN',geo:'Latin American city',
  w:{min:315.04*7/48,typ:673.1*7/48},wk:{min:'Mexico minimum, 315.04 pesos a day, paid 7 days for a 48-hour week',typ:'mean pay of IMSS-insured (formal) workers, national (Aug 2026)'},inf:'Mexico City: 45.3% of workers informal (Apr–Jun 2026)'},
 {id:'ker',c:'Kerala, India',n:'Kerala, India',s:'Kerala',cur:'INR',geo:'South Asian state',
  w:{min:401/8,typ:893.6/8},wk:{min:'rural jobs-guarantee wage, ₹401 a day ÷ 8 h (from Jul 2026)',typ:'rural construction workers’ average daily wage ÷ 8 h (2023–24)'},inf:'India: about 88% informal work (ILO, 2024)'},
 {id:'nbo',c:'Nairobi, Kenya',n:'Nairobi, Kenya',s:'Nairobi',cur:'KES',geo:'East African city',
  w:{min:18047/KEH,typ:KE_TYP/KEH},wk:{min:'Nairobi general laborer minimum, KSh 18,047 a month (May 2026) ÷ 225 h',typ:'mean pay of wage employees, national (2025) ÷ 225 h'},inf:'Kenya: about 86% informal work (ILO, 2019); 85% of jobs counted are not wage jobs (2025)'},
 {id:'dha',c:'Dhaka, Bangladesh',n:'Dhaka, Bangladesh',s:'Dhaka',cur:'BDT',geo:'South Asian city',
  w:{min:12500/BDH,typ:null},wk:{min:'garment-sector minimum, Tk 12,500 a month ÷ 208 h (Bangladesh has no single national minimum)',typ:'no recent published median or mean wage found'},inf:'Bangladesh: 84% of the labor force in informal work (2024)'}
];
const PI={};P.forEach((p,i)=>PI[p.id]=i);
/* Sources: n name, u URL, y date, t type (official, compiled, listing, news, law), g coverage */
const SRC={
 blsS:{n:'BLS Average Price Data, South region',u:'https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandsouth_table.htm',y:'Sep 2026',t:'official',g:'region'},
 blsW:{n:'BLS Average Price Data, West region',u:'https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandwest_table.htm',y:'Sep 2026',t:'official',g:'region'},
 blsUS:{n:'BLS Average Price Data, U.S. city average (no West figure)',u:'https://www.bls.gov/regions/mid-atlantic/data/averageretailfoodandenergyprices_usandwest_table.htm',y:'Sep 2026',t:'official',g:'national'},
 blsDen:{n:'BLS average gasoline price, Denver-Aurora metro (via FRED)',u:'https://fred.stlouisfed.org/series/APUS48B74714',y:'Sep 2026',t:'official',g:'city'},
 blsDal:{n:'BLS average gasoline price, Dallas-Fort Worth metro (via FRED)',u:'https://fred.stlouisfed.org/data/APUS37A74714',y:'Sep 2026',t:'official',g:'city'},
 blsDenE:{n:'BLS electricity price, Denver-Aurora metro (via FRED); the series stops in May 2024',u:'https://fred.stlouisfed.org/series/APUS48B72610',y:'May 2024',t:'official',g:'city'},
 mitA:{n:'MIT Living Wage Calculator, Arapahoe County (HUD Fair Market Rent, studio, utilities included)',u:'https://livingwage.mit.edu/counties/08005',y:'Feb 2026',t:'compiled',g:'county'},
 mitD:{n:'MIT Living Wage Calculator, Dallas County (HUD Fair Market Rent, studio, utilities included)',u:'https://livingwage.mit.edu/counties/48113',y:'Feb 2026',t:'compiled',g:'county'},
 mitM:{n:'MIT Living Wage Calculator, Shelby County (HUD Fair Market Rent, studio, utilities included)',u:'https://livingwage.mit.edu/counties/47157',y:'Feb 2026',t:'compiled',g:'county'},
 mitK:{n:'MIT Living Wage Calculator, Pike County, KY (HUD Fair Market Rent, studio, utilities included)',u:'https://livingwage.mit.edu/counties/21195',y:'Feb 2026',t:'compiled',g:'county'},
 rtd:{n:'RTD fares (3-hour pass; riders 19 and under ride free)',u:'https://www.rtd-denver.com/fares-passes/fares',y:'2026',t:'official',g:'city'},
 dart:{n:'DART fares (3-hour local pass)',u:'https://dart.org/fare/general-fares-and-overview/2025-fare-restructure',y:'Mar 2025',t:'official',g:'city'},
 mata:{n:'MATA fares (base fare; a zero-fare pilot was running)',u:'https://www.matatransit.com/fares/',y:'2026',t:'official',g:'city'},
 cb:{n:'College Board, average in-state tuition and fees, public 4-year, by state',u:'https://www.flbog.edu/wp-content/uploads/2025/11/College-Board-Charts-2025-26-in-state-table.pdf',y:'2025–26',t:'compiled',g:'state'},
 mvv:{n:'City of Munich: MVV single ticket, zone M',u:'https://www.muenchen.de/verkehr/aktuell/mvv-tickets-aktuelle-preise-fuer-fahrkarten-muenchen',y:'Jan 2026',t:'official',g:'city'},
 bdew:{n:'BDEW electricity price analysis (household, new-customer tariffs)',u:'https://www.bdew.de/media/documents/BDEW_Strompreisanalyse_102026_1.pdf',y:'2026',t:'compiled',g:'national'},
 adac:{n:'ADAC national average, Super E10 (press release)',u:'https://www.leinetal24.de/na-pressemitteilungen/benzin-und-diesel-etwas-guenstiger-preisniveau-aus-sicht-des-adac-zu-hoch-senkung-der-energiesteuer-ab-oktober-zr-94518014.html',y:'Sep 2026',t:'compiled',g:'national'},
 msp:{n:'Munich rent index (Mietspiegel 2025): €15.38 per m² before utilities, × 40 m² (assumption)',u:'https://stadt.muenchen.de/dam/jcr:1bcfd390-9f9a-4d65-88a4-3debda7c184f/Informationen%20zum%20Mietspiegel%202025%20Durchschnittsmieten.pdf',y:'2025',t:'official',g:'city'},
 daad:{n:'DAAD: generally no tuition for bachelor’s study at state universities; a €70–430 semester contribution is extra',u:'https://www.daad.de/en/studying-in-germany/living-in-germany/finances/',y:'2026',t:'official',g:'national'},
 jpRPS:{n:'Statistics Bureau of Japan, Retail Price Survey, Tokyo ku-area (reported by Financial Field)',u:'https://financial-field.com/household/entry-508548',y:'May 2026',t:'official',g:'city'},
 jpEgg:{n:'Statistics Bureau of Japan, Retail Price Survey handbook, Tokyo ku-area (one pack of 10, scaled to 12)',u:'https://www.stat.go.jp/data/kouri/handbook/pdf/hanashi08_2026.pdf',y:'Dec 2025',t:'official',g:'city'},
 jpGas:{n:'Japan national average regular gasoline, weekly government survey (reported by carview!)',u:'https://carview.yahoo.co.jp/news/detail/421970c137efa812c6e93c452124031d7294aee7/',y:'Aug 2026',t:'official',g:'national'},
 toei:{n:'Go Tokyo (Tokyo government): Toei Bus adult fare',u:'https://www.gotokyo.org/jp/plan/getting-around/buses/index.html',y:'2026',t:'official',g:'city'},
 mext:{n:'Japan national universities, standard tuition set by ministry ordinance (Obunsha summary)',u:'https://eic.obunsha.co.jp/file/educational_info/2026/0818_1.pdf',y:'2026',t:'law',g:'national'},
 dkEl:{n:'Denmark household electricity, 1,000–2,500 kWh a year, €0.3578/kWh (Statista)',u:'https://www.statista.com/statistics/418075/electricity-prices-for-households-in-denmark',y:'H2 2025',t:'compiled',g:'national'},
 dkUni:{n:'Study in Denmark: free for EU/EEA and Swiss students',u:'https://studyindenmark.dk/study-options/tuition-fees-scholarships',y:'2026',t:'official',g:'national'},
 ecBus:{n:'Quito bus fare (El Mercurio)',u:'https://elmercurio.com.ec/nacional/2026/09/08/aprueban-alza-del-precio-del-pasaje-en-quito/',y:'2026',t:'law',g:'city'},
 ecGas:{n:'Ecuador Extra and Ecopaís gasoline, $3.17 a gallon (Primicias)',u:'https://www.primicias.ec/economia/precios-gasolina-super-extra-diesel-guerra-medio-oriente-iran-134649/',y:'Oct 2026',t:'law',g:'national'},
 ecEl:{n:'Ecuador average electricity tariff, 10.61¢/kWh; ARCONEL cost 12.83¢ (El Diario)',u:'https://www.eldiario.ec/ecuador/costo-servicio-energia-electrica-2026-ecuador-09122025/',y:'2026',t:'official',g:'national'},
 ecRent:{n:'Quito rent, online listing average (Properati, via El Universo)',u:'https://www.eluniverso.com/noticias/economia/arriendos-viviendas-quito-salario-basico-informe-nota',y:'2024',t:'listing',g:'city'},
 ecUni:{n:'Ecuador Constitution, Art. 356: public higher education free through the third level (text not opened this session)',u:'',y:'2008',t:'law',g:'national'},
 mxTort:{n:'SNIIM (Ministry of Economy) tortilla price, Mexico City (TV Azteca)',u:'https://www.tvazteca.com/aztecanoticias/cuanto-cuesta-el-kilo-tortilla-en-mexico-en-julio-2026-lista-costos-por-estados/',y:'Jul 2026',t:'official',g:'city'},
 mxGas:{n:'Profeco national average, Magna gasoline (Por Esto)',u:'https://www.poresto.com/mexico/2026/4/27/precio-de-gasolina-hoy-magna-en-2367-pesos-y-diesel-en-2822-reporta-profeco.amp.html',y:'Apr 2026',t:'official',g:'national'},
 mxMetro:{n:'Mexico City Metro fare, 5 pesos (the city puts the real cost near 13) (adn40)',u:'https://www.adn40.mx/ciudad/2025-12-15/clara-brugada-confirma-precio-oficial-metro-cdmx-2026/',y:'2026',t:'law',g:'city'},
 inPet:{n:'Petrol price, Thiruvananthapuram (Kerala Kaumudi)',u:'https://keralakaumudi.com/en/india/general/fuel-prices-hiked-again-petrol-and-diesel-rates-rise-for-fourth-time-in-two-weeks-1753194',y:'May 2026',t:'news',g:'city'},
 knbs:{n:'KNBS Consumer Price Indices, average retail prices (national)',u:'https://www.knbs.or.ke/wp-content/uploads/2026/05/Kenya-Consumer-Price-Indices-and-Inflation-Rates-May-2026.pdf',y:'May 2026',t:'official',g:'national'},
 knbsN:{n:'KNBS Consumer Price Indices: city matatu fare, Nairobi CBD to Kasarani',u:'https://www.knbs.or.ke/wp-content/uploads/2026/05/Kenya-Consumer-Price-Indices-and-Inflation-Rates-May-2026.pdf',y:'May 2026',t:'official',g:'city'},
 epra:{n:'EPRA maximum pump price, super petrol, Nairobi (tech-ish)',u:'https://tech-ish.com/2026/10/14/petrol-rises-to-kes-226-96-in-nairobi-and-kerosene-jumps-kes-28-49/',y:'Oct 2026',t:'law',g:'city'},
 bdMkt:{n:'bdnews24 market survey, Karwan Bazar and Mohammadpur (a range; midpoint used)',u:'https://bdnews24.com/business/8f0b4157a8f0',y:'Aug 2026',t:'news',g:'city'},
 bdFuel:{n:'Bangladesh petrol price set by the Energy Division (bdnews24)',u:'https://bdnews24.com/business/qisn5cl4qg',y:'Nov 2026',t:'law',g:'national'}
};
const pr=(v,s,note)=>({v,s,note:note||''});
const NA=why=>({v:null,note:why||''});
const ITEMS=[
 {id:'ride',l:'One bus or metro ride',u:'one ride',q:{aur:pr(2.75,'rtd'),dal:pr(3.00,'dart'),mem:pr(1.00,'mata'),eky:NA('no fixed-route city bus fare found'),muc:pr(4.20,'mvv'),tyo:pr(210,'toei'),cph:NA('I could not confirm the 2026 fare'),uio:pr(0.35,'ecBus'),ehi:NA(),mex:pr(5,'mxMetro'),ker:NA(),nbo:pr(100,'knbsN','a matatu (minibus) ride on one route'),dha:NA()}},
 {id:'staple',l:'1 kg of the local staple',u:'1 kg',q:{aur:pr(2.115*LB,'blsW','white bread'),dal:pr(1.748*LB,'blsS','white bread'),mem:pr(1.748*LB,'blsS','white bread'),eky:pr(1.748*LB,'blsS','white bread'),muc:NA('no official average shop price for bread found'),tyo:pr(4870/5,'jpRPS','rice (Koshihikari, 5 kg bag)'),cph:NA('no official average shop price found'),uio:NA(),ehi:NA(),mex:pr(21.70,'mxTort','tortillas'),ker:NA('official daily prices exist, but I could not open them'),nbo:pr(159.12/2,'knbs','maize flour (2 kg packet)'),dha:pr(53.5,'bdMkt','coarse rice, Tk 52 to 55')}},
 {id:'eggs',l:'A dozen eggs',u:'12 eggs',q:{aur:pr(2.272,'blsUS'),dal:pr(2.368,'blsS'),mem:pr(2.368,'blsS'),eky:pr(2.368,'blsS'),muc:NA(),tyo:pr(316*1.2,'jpEgg'),cph:NA(),uio:NA(),ehi:NA(),mex:NA(),ker:NA(),nbo:NA(),dha:pr(152.5,'bdMkt','Tk 150 to 155')}},
 {id:'milk',l:'A liter of milk',u:'1 liter',q:{aur:pr(4.621/GAL,'blsW','sold by the gallon'),dal:pr(3.901/GAL,'blsS','sold by the gallon'),mem:pr(3.901/GAL,'blsS','sold by the gallon'),eky:pr(3.901/GAL,'blsS','sold by the gallon'),muc:NA(),tyo:NA(),cph:NA(),uio:NA(),ehi:NA(),mex:NA(),ker:NA('a price rise was pending; no current price confirmed'),nbo:NA(),dha:NA()}},
 {id:'gas',l:'A liter of gasoline',u:'1 liter',q:{aur:pr(4.200/GAL,'blsDen','sold by the gallon'),dal:pr(3.836/GAL,'blsDal','sold by the gallon'),mem:pr(3.997/GAL,'blsS','sold by the gallon'),eky:pr(3.997/GAL,'blsS','sold by the gallon'),muc:pr(2.258,'adac'),tyo:pr(170.1,'jpGas'),cph:NA(),uio:pr(3.17/GAL,'ecGas','sold by the gallon'),ehi:pr(3.17/GAL,'ecGas','sold by the gallon'),mex:pr(23.67,'mxGas'),ker:pr(115.32,'inPet'),nbo:pr(226.96,'epra'),dha:pr(160,'bdFuel')}},
 {id:'power',l:'A month of electricity (200 kWh)',u:'200 kWh',q:{aur:pr(0.158*200,'blsDenE'),dal:pr(0.163*200,'blsS'),mem:pr(0.163*200,'blsS'),eky:pr(0.163*200,'blsS'),muc:pr(0.373*200,'bdew'),tyo:pr(14533*200/402,'jpRPS','a 402 kWh bill, scaled to 200 kWh'),cph:pr(0.3578*KDKK*200,'dkEl'),uio:pr(0.1061*200,'ecEl'),ehi:pr(0.1061*200,'ecEl'),mex:NA('tiered, subsidized tariffs; no average price confirmed'),ker:NA('tiered tariffs; no average price confirmed'),nbo:pr(5535.22,'knbs'),dha:NA('tiered tariffs; no average price confirmed')}},
 {id:'rent',l:'A month of rent, modest small apartment',u:'1 month',q:{aur:pr(19748/12,'mitA','studio'),dal:pr(17805/12,'mitD','studio'),mem:pr(12810/12,'mitM','studio'),eky:pr(8419/12,'mitK','studio'),muc:pr(15.38*40,'msp','40 m², before utilities'),tyo:pr(9937*25/3.3,'jpRPS','¥9,937 per 3.3 m², × 25 m² (assumption)'),cph:NA(),uio:pr(447,'ecRent','listings, not signed leases'),ehi:NA(),mex:NA(),ker:NA(),nbo:pr(4212.89,'knbs','a single room, national average'),dha:NA()}},
 {id:'uni',l:'A year of public university tuition',u:'1 year',q:{aur:pr(13711,'cb','Colorado, tuition and fees'),dal:pr(11258,'cb','Texas, tuition and fees'),mem:pr(11742,'cb','Tennessee, tuition and fees'),eky:pr(12455,'cb','Kentucky, tuition and fees'),muc:pr(0,'daad','no tuition; €70–430 semester fee'),tyo:pr(535800,'mext','national universities, standard'),cph:pr(0,'dkUni','free for EU/EEA students'),uio:pr(0,'ecUni','free by law'),ehi:pr(0,'ecUni','free by law'),mex:NA(),ker:NA(),nbo:NA(),dha:NA()}},
 {id:'insulin',l:'A month of insulin',u:'1 month',q:{}}
];
P.forEach(p=>{const I=ITEMS[ITEMS.length-1];I.q[p.id]=NA('RAND compares insulin prices as ratios, not as prices for each place');});
const GS={aur:'Aurora',dal:'Dallas',mem:'Memphis',eky:'E. KY',muc:'Munich',tyo:'Tokyo',cph:'Copenh.',uio:'Quito',ehi:'Rural EC',mex:'Mex. City',ker:'Kerala',nbo:'Nairobi',dha:'Dhaka'};
const IT={};ITEMS.forEach(i=>IT[i.id]=i);
const WELL=['ride','staple','gas','power','rent','uni'];       /* items with enough data for a fresh scenario */
/* Baskets: [item, quantity] */
const BASK={food:[['staple',1],['eggs',1]],move:[['ride',40]],home:[['rent',1],['power',1]]};
const BNAME={none:'just this item',food:'the breakfast basket (1 kg staple + 12 eggs)',move:'a month of bus rides (40 rides)',home:'rent + electricity',mine:'your basket'};

/* ---------- the math ---------- */
const hon=()=>atLeast('honors'),ap=()=>atLeast('ap');
function basketList(sim){const b=hon()?sim.p.basket:'none';if(b==='none')return [[sim.p.item,1]];if(b==='mine')return (sim.bk&&sim.bk.length)?sim.bk:[];return BASK[b]||[[sim.p.item,1]];}
/* Cost of the current item or basket in one place, in its own currency (null if any price is missing). */
function cost(sim,pid){const L=basketList(sim);if(!L.length)return null;let t=0;for(const [iid,q] of L){const c=IT[iid].q[pid];if(!c||c.v===null)return null;t+=c.v*q;}return t;}
const wage=(sim,pid,w)=>P[PI[pid]].w[w||sim.p.worker];
/* Minutes of work = price ÷ pay per hour × 60. Both are in the same currency, so the currency cancels. */
function mins(sim,pid,w){const c=cost(sim,pid),h=wage(sim,pid,w);if(c===null||h===null||h===undefined)return null;return c/h*60;}
function usd(sim,pid){const c=cost(sim,pid);return c===null?null:c/FX[P[PI[pid]].cur];}
function all(sim){return P.map(p=>({p,m:mins(sim,p.id),c:cost(sim,p.id)}));}
function most(sim){let b=null;all(sim).forEach(r=>{if(r.m!==null&&(b===null||r.m>b.m))b=r;});return b;}
function fewest(sim){let b=null;all(sim).forEach(r=>{if(r.m!==null&&r.m>0&&(b===null||r.m<b.m))b=r;});return b;}
const shown=sim=>!!sim.p.show||!!(sim.gutS&&sim.gutS.m);
const val=(sim,pid)=>{const m=mins(sim,pid);return m===null?0:m;};   /* gut score: minutes at a place, 0 if no data */

/* ---------- formatting ---------- */
const f1=v=>(Math.round(v*10)/10).toFixed(1),f0=v=>Math.round(v).toLocaleString('en-US');
function work(m){if(m===null)return 'none';if(m===0)return '0 min: free to enroll';if(m<9.95)return f1(m)+' min';if(m<99.5)return Math.round(m)+' min';if(m<960)return f1(m/60)+' h';return f1(m/480)+' workdays';}
function workLong(m){if(m===null)return 'no figure';if(m<120)return `${m<9.95?f1(m):Math.round(m)} minutes`;const h=m/60;if(m<960)return `${f1(h)} hours`;return `${f1(h)} hours, or ${f1(m/480)} eight-hour workdays`;}
function money(cur,v){if(v===null)return 'none';const [a,b]=CUR[cur];const s=v<100?(Math.round(v*100)/100).toFixed(2):f0(v);return a+s+b;}
function fit(ctx,s,max,size,w){ctx.font=(w||700)+' '+size+'px '+FONT;const m=ctx.measureText(s).width;return m>max?Math.max(12,size*max/m):size;}
function clearGut(sim){if(sim.gutS&&(sim.gutS.g||sim.gutS.m)){sim.gutS.g=null;sim.gutS.m=null;if(BioLab.gutRender)BioLab.gutRender(sim);}}
function changed(sim){clearGut(sim);sim.infoDirty=true;}
const WNAME={min:'minimum-wage worker',typ:'typical worker'};
function title(sim){const b=hon()?sim.p.basket:'none';return b==='none'?IT[sim.p.item].l:BNAME[b].replace(/^./,c=>c.toUpperCase());}
function missWhy(sim,pid,nowage){if(!nowage&&wage(sim,pid)===null)return sim.p.worker==='min'?'no legal minimum wage':'no typical wage found';
 const L=basketList(sim);if(!L.length)return 'your basket is empty';for(const [iid] of L){const c=IT[iid].q[pid];if(!c||c.v===null)return L.length>1?'basket incomplete: no price for '+IT[iid].l.toLowerCase():'no reliable price found';}return '';}

/* What the headline number hides, for the place you picked. */
function hides(sim,pid){const p=P[PI[pid]],w=sim.p.worker,o=[];
 const L=basketList(sim);L.forEach(([iid])=>{const c=IT[iid].q[pid];if(c&&c.v!==null&&c.s){const S=SRC[c.s];if((S.g==='region'||S.g==='national')&&S.t!=='law')o.push(`<b>${IT[iid].l}:</b> a ${S.g==='region'?'regional':'national'} average (${S.n}). It averages away the difference between this place and others in the ${S.g==='region'?'region':'country'}.`);if(S.t==='listing')o.push(`<b>${IT[iid].l}:</b> from online listings, which miss informal rentals and long-standing leases.`);if(S.t==='news')o.push(`<b>${IT[iid].l}:</b> reporters’ market visits, not an official survey: one market, one day.`);if(S.y==='May 2024')o.push(`<b>${IT[iid].l}:</b> the newest Denver figure I found is from May 2024, more than two years old.`);if(c.v===0)o.push(`<b>${IT[iid].l}:</b> zero at the counter does not mean zero cost: taxes pay for it, and it may not cover everyone (for example, students from outside the EU).`);}
  else if(c&&c.note)o.push(`<b>${IT[iid].l}:</b> missing. ${c.note.replace(/^./,x=>x.toUpperCase())}.`);});
 const H={aur:'Riders 19 and under ride RTD free, so a student’s ride costs no work at all. Denver has its own, higher minimum wage, so a worker a few miles away earns more per hour.',
  dal:'The median hides the spread: half of workers earn less than $23.29, and 1.7% of Texas hourly workers earned $7.25 or less in 2024.',
  mem:'MATA was running a zero-fare pilot, so riders were not paying the $1.00 shown.',
  eky:'Food, gas and power here are South-region averages: no official survey prices rural eastern Kentucky separately. Without a city bus, getting to work means a car, which this ride item cannot show.',
  muc:'Germany’s median comes from full-time workers nationwide; Munich pays more, and part-time workers are left out. The rent index averages existing leases, which run below new ones.',
  tyo:'The typical wage is a national mean for full-time workers, so it hides Tokyo’s higher pay and part-time workers’ lower hourly pay.',
  cph:'With no legal minimum, the “minimum-wage worker” does not exist here: pay floors come from union agreements, sector by sector.',
  uio:'The mean is pulled up by high earners. Ecuador’s national median labor income was $397.80 a month, below the $482 minimum.',
  ehi:'The typical (mean) rural wage, $2.11 an hour, is below the legal minimum, $2.78: the minimum binds formal jobs, and 79% of rural workers were informal (Dec 2023). Rural prices are national averages: no rural price survey was found.',
  mex:'The typical wage counts only IMSS-insured (formal) workers; 45.3% of Mexico City’s workers were informal, and 41.2% earned up to one minimum wage (Apr–Jun 2026).',
  ker:'The typical wage is men’s rural construction pay, so it leaves out women, farm workers and city jobs. The minimum shown is a public-works wage, not a wage every employer must pay.',
  nbo:'The typical wage counts only the 3.3 million wage employees; about 85% of the 21.6 million jobs counted (outside small farms) are not wage jobs. The matatu fare is one route.',
  dha:'The minimum is for garment workers only. No recent typical wage was found, so the “typical worker” cannot be shown at all.'};
 o.push(H[pid]);return o;}

const SIM={
 id:'minutesofwork',hash:'minutesofwork',apUnit:20,order:7,tab:'Minutes of work',kind:'Simulation',
 card:'Guess where a bus ride, a liter of gas or a month of rent takes the most work, then divide price by pay to see life from 13 places.',
 title:'What life costs, in minutes of work',
 lede:{bio:'A bus ride costs ¥210 in Tokyo, KSh 100 in Nairobi and $3.00 in Dallas. Those numbers cannot be compared: they are in different currencies. Divide each price by what an hour of work pays there, and you get minutes of work, a unit that means the same thing everywhere.',
  honors:'Minutes of work = price ÷ hourly wage × 60. Price and wage are in the same currency, so the currency cancels: no exchange rate needed. Build a basket, compare places with an index, and ask which worker the wage describes and how good each number is.',
  ap:'Dividing basket costs in two places gives a purchasing power parity (PPP) factor. Compare it with the market exchange rate to see why dollars at exchange rates mislead, and test how much the answer depends on which wage you divide by.'},
 scale:'13 places, one row each. Prices are each place’s own currency and latest date I could source; gray rows have no reliable figure. A workday is 8 hours.',
 aspect:4/3,timeless:true,trials:false,graph:true,
 controlsTitle:'The comparison',
 controls:[
  {id:'pick',label:'Your gut: where does this take the most minutes of work?',type:'select',def:'muc',options:P.map(p=>({v:p.id,l:p.n}))},
  {id:'item',label:'What to buy',type:'select',def:'ride',noGut:true,onChange:changed,options:ITEMS.map(i=>({v:i.id,l:i.l}))},
  {id:'worker',label:'Which worker?',type:'seg',def:'min',noGut:true,onChange:changed,options:[{v:'min',l:'Minimum wage'},{v:'typ',l:'Typical wage'}],help:'Typical means the median where one is published, otherwise the mean. Each place’s readout says which.'},
  {id:'show',label:'Show minutes of work',type:'toggle',def:false,noGut:true,help:'Lock in your gut first.'},
  {id:'basket',label:'Price one item or a basket',type:'seg',def:'none',lvl:'honors',noGut:true,onChange:changed,options:[{v:'none',l:'Just this item'},{v:'food',l:'Breakfast'},{v:'move',l:'Month of rides'},{v:'home',l:'Rent + power'},{v:'mine',l:'My basket'}],help:'Breakfast: 1 kg staple + 12 eggs. Month of rides: 40 rides. My basket: add items with the buttons below. Your basket stays in this tab’s memory only.'},
  {id:'base',label:'Base place for the index (= 100)',type:'select',def:'aur',lvl:'honors',noGut:true,options:P.map(p=>({v:p.id,l:p.n}))},
  {id:'view',label:'Bars show',type:'seg',def:'min',lvl:'ap',noGut:true,options:[{v:'min',l:'Minutes of work'},{v:'usd',l:'U.S. dollars at exchange rates'}],help:'Dollars use market exchange rates (Federal Reserve, Oct 30, 2026; Kenya Nov 6; Bangladesh Jun 2).'}
 ],
 actions:[
  {id:'add',label:'Add this item to my basket',lvl:'honors',run(sim){sim.bk=sim.bk||[];const e=sim.bk.find(x=>x[0]===sim.p.item);if(e)e[1]+=1;else sim.bk.push([sim.p.item,1]);BioLab.setValues(sim,{basket:'mine'});}},
  {id:'clear',label:'Clear my basket',lvl:'honors',run(sim){sim.bk=[];changed(sim);}}
 ],
 init(sim){if(!sim.bk)sim.bk=[];return {};},step(){},
 metrics:[
  {id:'pmin',label:'Minutes of work at your pick',unit:'min',d:1,min:0,max:null,get:sim=>shown(sim)?mins(sim,sim.p.pick):null},
  {id:'pdays',label:'Eight-hour workdays at your pick',unit:'days',d:2,min:0,max:null,get:sim=>{const m=mins(sim,sim.p.pick);return shown(sim)&&m!==null?m/480:null;}},
  {id:'most',label:'Takes the most work',text:true,get:sim=>{if(!shown(sim))return 'Lock in your gut, or turn on Show minutes of work.';const b=most(sim);return b?`${b.p.n}: ${workLong(b.m)}`:'No place has both a price and a wage for this.';}},
  {id:'who',label:'Whose wage is this?',text:true,get:sim=>{const p=P[PI[sim.p.pick]],h=p.w[sim.p.worker];return `${p.n}: ${h===null?'':money(p.cur,h)+' an hour, '}${p.wk[sim.p.worker]}. ${p.inf}.`;}},
  {id:'spread',label:'Most work ÷ least work',unit:'times',d:1,lvl:'honors',min:0,max:null,get:sim=>{if(!shown(sim))return null;const a=most(sim),b=fewest(sim);return a&&b?a.m/b.m:null;}},
  {id:'idx',label:'Index at your pick (base place = 100)',unit:'',d:1,lvl:'honors',min:0,max:null,get:sim=>{if(!shown(sim))return null;const a=mins(sim,sim.p.pick),b=mins(sim,sim.p.base);return a!==null&&b?a/b*100:null;}},
  {id:'usdp',label:'Price at your pick in U.S. dollars',unit:'$',d:2,lvl:'ap',min:0,max:null,get:sim=>usd(sim,sim.p.pick)},
  {id:'ppp',label:'PPP: local currency per $ (vs. Aurora)',unit:'',d:3,lvl:'ap',min:0,max:null,get:sim=>{const a=cost(sim,sim.p.pick),b=cost(sim,'aur');return a!==null&&b?a/b:null;}},
  {id:'fx',label:'Market exchange rate: local currency per $',unit:'',d:3,lvl:'ap',min:0,max:null,get:sim=>FX[P[PI[sim.p.pick]].cur]},
  {id:'plevel',label:'Price level: PPP ÷ exchange rate (Aurora = 100)',unit:'',d:0,lvl:'ap',min:0,max:null,get:sim=>{const a=cost(sim,sim.p.pick),b=cost(sim,'aur');return a!==null&&b?a/b/FX[P[PI[sim.p.pick]].cur]*100:null;}},
  {id:'wratio',label:'Minutes at the minimum ÷ minutes at the typical wage',unit:'times',d:2,lvl:'ap',min:0,max:null,get:sim=>{const a=mins(sim,sim.p.pick,'min'),b=mins(sim,sim.p.pick,'typ');return a!==null&&b?a/b:null;}}
 ],
 graphs:[{id:'which',label:'Which worker? Minimum vs. typical wage',custom:true}],defaultGraph:'which',
 plot(sim,ctx,box){const rows=P.map(p=>({p,a:mins(sim,p.id,'min'),b:mins(sim,p.id,'typ')})).filter(r=>r.a!==null||r.b!==null);
  if(!shown(sim)||!rows.length){axes(ctx,box,{xmin:0,xmax:1,ymin:0,ymax:1,xl:'Minutes of work',yl:''});txt(ctx,shown(sim)?'No place has data for this.':'Lock in your gut to see this graph.',box.L+box.W/2,box.T+box.H/2,{s:13,c:PAL['muted'],a:'center'});return;}
  const top=Math.max(...rows.map(r=>Math.max(r.a||0,r.b||0)))*1.3||1,n=rows.length;
  const ax=axes(ctx,box,{xmin:0,xmax:n,ymin:0,ymax:top,xl:'',yl:'Minutes of work',xticks:false});
  rows.forEach((r,i)=>{const x=ax.X(i+0.5);if(r.a!==null&&r.b!==null){ctx.strokeStyle=PAL['g-axis'];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,ax.Y(r.a));ctx.lineTo(x,ax.Y(r.b));ctx.stroke();}
   if(r.a!==null){ctx.fillStyle=PAL['s1'];ctx.beginPath();ctx.arc(x,ax.Y(r.a),5,0,7);ctx.fill();}
   if(r.b!==null){ctx.fillStyle=PAL['s2'];ctx.beginPath();ctx.arc(x,ax.Y(r.b),5,0,7);ctx.fill();}
   txt(ctx,GS[r.p.id],x,box.T+box.H+(i%2?30:15),{s:12,c:PAL['g-axis'],a:'center'});});
  legend(ctx,box.L+10,box.T+12,[{label:'Minimum wage',color:PAL['s1']},{label:'Typical wage',color:PAL['s2']}]);},
 draw(sim,ctx,vdt,k){const W=800,H=600,G=sim.gutS||{},sh=shown(sim),usdv=ap()&&sim.p.view==='usd',compact=k>1.3;
  ctx.fillStyle=PAL['cv-bg'];ctx.fillRect(0,0,W,H);
  /* header */
  const t1=title(sim)+(usdv?': price in U.S. dollars':': '+WNAME[sim.p.worker]);
  txt(ctx,t1,14,8+15*k,{s:fit(ctx,t1,772,15*k),w:700});
  const key=compact?(usdv?'Bars: price ÷ exchange rate':(sh?'Bars: price ÷ pay per hour × 60':'Sticker prices. Lock in your gut.')):(usdv?'Bars: price ÷ exchange rate. One yardstick for money, but wages are left out.':(sh?'Bars: minutes of work = price ÷ pay per hour × 60. No exchange rate needed.':'Sticker prices in each place’s currency. Which takes the most work? Lock in your gut.'));
  txt(ctx,key,14,8+15*k+8+12*k,{s:fit(ctx,key,772,12*k,400),c:PAL['cv-soft']});
  const top=8+15*k+8+12*k+12,rowH=(H-top-6)/P.length,R=all(sim),mx=most(sim);sim._rows={top,rowH};
  const vals=R.map(r=>usdv?usd(sim,r.p.id):r.m),vmax=Math.max(1e-9,...vals.filter(v=>v!==null))*1.02;
  const nameW=compact?205:172,priceX=compact?0:268,barL=compact?nameW+8:282;
  const tagOf=p=>{const g=G.g&&G.g.pid===p.id,m=G.m&&G.m.pid===p.id;return g&&m?'Your gut = most work':m?'Most work':g?'Your gut':'';};
  ctx.font='700 '+(12*k)+'px '+FONT;const tagW=Math.max(0,...P.map(p=>{const t=tagOf(p);return t?Math.min(150,ctx.measureText(t).width)+20:0;}));
  const barR=W-10-tagW-(compact?165:120);
  P.forEach((p,i)=>{const y=top+i*rowH,cy=y+rowH/2,r=R[i],v=vals[i],isG=G.g&&G.g.pid===p.id,isM=G.m&&G.m.pid===p.id;
   if(i%2){ctx.fillStyle=PAL['cv-bg2'];ctx.fillRect(0,y,W,rowH);}
   if(sim.p.pick===p.id&&!G.g){ctx.strokeStyle=PAL['cv-soft'];ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.strokeRect(2,y+1,W-4,rowH-2);ctx.setLineDash([]);}
   if(isG){ctx.strokeStyle=PAL['cv-ink'];ctx.lineWidth=2.5;ctx.strokeRect(2,y+1,W-4,rowH-2);}
   /* name and wage */
   const nm=compact?p.s:p.c,ns=fit(ctx,nm,nameW-14,13*k);
   const two=!compact&&rowH>=34;
   txt(ctx,nm,14,two?cy-2:cy,{s:ns,w:700,b:two?'alphabetic':'middle'});
   if(two){const h=p.w[sim.p.worker],ws=h===null?(sim.p.worker==='min'?'no legal minimum':'no typical wage found'):money(p.cur,h)+'/h';txt(ctx,ws,14,cy+13,{s:12*k,c:PAL['cv-soft']});}
   /* sticker price */
   const c=r.c;
   if(!compact){const ps=c===null?'none':money(p.cur,c);txt(ctx,ps,priceX,cy,{s:fit(ctx,ps,90,12*k),w:600,a:'right',b:'middle',c:PAL['cv-soft']});}
   /* bar */
   const bh=Math.min(22,rowH*0.55);
   if(!sh&&!usdv){if(c!==null&&wage(sim,p.id)!==null){ctx.strokeStyle=PAL['line'];ctx.setLineDash([4,4]);ctx.lineWidth=1.2;ctx.strokeRect(barL,cy-bh/2,60,bh);ctx.setLineDash([]);txt(ctx,'?',barL+30,cy+1,{s:14*k,w:700,c:PAL['cv-soft'],a:'center',b:'middle'});
     if(compact){const ps=money(p.cur,c);txt(ctx,ps,barL+70,cy,{s:fit(ctx,ps,W-barL-80,12*k,600),w:600,c:PAL['cv-soft'],b:'middle'});}}
    else{const why=missWhy(sim,p.id);txt(ctx,why,barL,cy,{s:fit(ctx,why,W-barL-10,12*k,400),c:PAL['muted'],b:'middle'});}}
   else if(v===null){const why=missWhy(sim,p.id,usdv);ctx.fillStyle=PAL['line'];ctx.globalAlpha=.35;ctx.fillRect(barL,cy-bh/2,40,bh);ctx.globalAlpha=1;txt(ctx,why,barL+48,cy,{s:fit(ctx,why,W-barL-58,12*k,400),c:PAL['muted'],b:'middle'});}
   else{const len=Math.max(2,(barR-barL)*v/vmax);ctx.fillStyle=(mx&&mx.p.id===p.id&&!usdv)?PAL['g-line']:PAL['s2'];ctx.globalAlpha=(mx&&mx.p.id===p.id&&!usdv)?1:.75;ctx.fillRect(barL,cy-bh/2,len,bh);ctx.globalAlpha=1;
    const lab=usdv?'$'+(v<100?(Math.round(v*100)/100).toFixed(2):f0(v)):work(v),ls=fit(ctx,lab,W-10-(tagOf(p)?tagW:0)-(barL+len+6),12*k,700);txt(ctx,lab,barL+len+6,cy,{s:ls,w:700,b:'middle'});}
   /* tags */
   if(isG||isM){const tag=isG&&isM?'Your gut = most work':isM?'Most work':'Your gut';const ts=fit(ctx,tag,150,12*k);ctx.font='700 '+ts+'px '+FONT;const tw=ctx.measureText(tag).width+12,tx=W-tw-8;rr(ctx,tx,cy-ts*0.75,tw,ts*1.5,ts*0.75);ctx.fillStyle=isM?PAL['g-line']:PAL['cv-ink'];ctx.fill();txt(ctx,tag,tx+6,cy+1,{s:ts,w:700,c:isM?'#fff':PAL['cv-bg'],b:'middle'});}
  });},
 onClick(sim,x,y){const g=sim._rows||{top:55,rowH:41.5},i=Math.floor((y-g.top)/g.rowH);if(i>=0&&i<P.length&&!(sim.gutS&&sim.gutS.g))BioLab.setValues(sim,{pick:P[i].id});},
 infoPanel(sim){const p=P[PI[sim.p.pick]],L=basketList(sim);
  let h=`<p class="lab-h">What this number hides: ${p.n}</p><ul>`+hides(sim,p.id).map(s=>`<li>${s}</li>`).join('')+'</ul>';
  h+='<p class="lab-h">How good are the numbers? (your pick)</p><ul>';
  L.forEach(([iid,q])=>{const c=IT[iid].q[p.id];if(c&&c.v!==null&&c.s){const S=SRC[c.s];h+=`<li><b>${IT[iid].l}${q>1?' × '+q:''}:</b> ${money(p.cur,c.v)}${c.note?' ('+c.note+')':''}. ${S.n}, ${S.y}. Type: ${S.t}; covers: ${S.g}.</li>`;}else h+=`<li><b>${IT[iid].l}:</b> no reliable price found${c&&c.note?': '+c.note:''}.</li>`;});
  if(!L.length)h+='<li>Your basket is empty. Pick an item and press <b>Add this item to my basket</b>.</li>';
  const n=P.filter(q=>mins(sim,q.id)!==null).length;h+=`</ul><p>For this ${hon()&&sim.p.basket!=='none'?'basket':'item'}, ${n} of 13 places have both a price and a ${sim.p.worker==='min'?'legal minimum':'typical'} wage. Where no statistics are collected, the people living there drop out of the comparison.</p>`;
  return h;},
 narrate(sim){const sh=shown(sim),it=title(sim).toLowerCase(),w=WNAME[sim.p.worker];
  if(!sh){const qs=P.filter(p=>cost(sim,p.id)!==null),q=qs.length,nc=new Set(qs.map(p=>p.cur)).size;return `You can see ${q} sticker price${q===1?'':'s'} for ${it}, in ${nc} currenc${nc===1?'y':'ies'}. <b>A price alone cannot tell you how hard something is to afford.</b> You also need what an hour of work pays: divide, and the currency cancels.`;}
  const a=most(sim),b=fewest(sim);if(!a)return `<b>No place has both a price and a wage here.</b> That is a finding too: what is not measured cannot be compared.`;
  if(ap()&&sim.p.view==='usd')return `In dollars at exchange rates, prices look one way; in minutes of work, another. <b>Exchange rates convert money, not lives:</b> they leave out what people earn.`;
  return `For a ${w}, ${it} takes <b>${workLong(a.m)} in ${a.p.n}</b>${b&&b.p.id!==a.p.id?`, against ${workLong(b.m)} in ${b.p.n}: about ${f1(a.m/b.m)} times as long`:''}. The price is only half the ratio; the wage is the other half.`;},
 gut:{better:'higher',controls:['pick'],
  ask:{bio:'Look at the sticker prices. Pick the place here (or click its row) where you think this takes the <b>most minutes of work</b> for the worker named at the top of the picture. Then lock it in.',honors:'Before you show minutes: pick the place here (or click its row) where you think this item or basket takes the most minutes of work for the worker named at the top of the picture. Then lock it in.'},
  lock(sim){const pid=sim.p.pick,m=mins(sim,pid);return {v:val(sim,pid),pid,label:`${P[PI[pid]].n}: ${m===null?'no figure':workLong(m)}`};},
  solve(sim){const b=most(sim);if(b)sim.p.pick=b.p.id;sim.p.show=true;if(sim.ui&&sim.ui.ctl){sim.ui.ctl.pick.set(sim.p.pick);sim.ui.ctl.show.set(true);}const pid=sim.p.pick,m=mins(sim,pid);return {v:val(sim,pid),pid,label:b?`${b.p.n}: ${workLong(m)}`:'no place has data'};},
  how:{bio:'For each place, the math divides the price by what one hour of work pays there and multiplies by 60. Price and pay are in the same currency, so the currency cancels: the answer is in minutes, which mean the same thing in Tokyo and in Memphis.',
   ap:'minutes = (price in local currency ÷ wage in local currency per hour) × 60. The units of currency cancel, so no exchange rate enters. For a basket, add the costs first, then divide.'},
  compare(sim,g,m){const gp=P[PI[g.pid]],mp=P[PI[m.pid]];
   if(m.v===0)return 'No place has both a price and a wage for this, so there is nothing to rank. That is a finding: what is not measured cannot be compared.';
   if(g.pid===m.pid)return `Your gut was right on: <b>${mp.n}</b> takes the most work, ${workLong(m.v)}. You read past the currencies to the wages behind them.`;
   if(g.v===0)return `${gp.n} has no ${missWhy(sim,gp.id)}, so the math cannot score it. The most work is in <b>${mp.n}: ${workLong(m.v)}</b>.`;
   return `The most work is in <b>${mp.n}: ${workLong(m.v)}</b>. Your pick, ${gp.n}, takes ${workLong(g.v)}, so a worker in ${mp.n} works <b>${workLong(m.v-g.v)} longer</b> (${f1(m.v/g.v)} times as long) for the same thing.`;},
  again(sim){sim.p.item=WELL[Math.floor(Math.random()*WELL.length)];sim.p.worker=Math.random()<0.7?'min':'typ';sim.p.show=false;sim.p.basket='none';sim.p.pick=P[Math.floor(Math.random()*P.length)].id;}
 },
 challenges:[
  {lvl:'bio',instant:true,q:'A Mexico City metro ride costs 5 pesos. A Munich single ticket costs €4.20. Which takes more minutes of work for a minimum-wage worker?',choices:['Mexico City: 5 is a bigger number','Munich','You cannot tell without each place’s wage'],correct:2,explain:'Prices in different currencies cannot be compared directly. With the wages: Mexico City 5 ÷ 45.94 pesos an hour × 60 ≈ 6.5 minutes; Munich 4.20 ÷ 13.90 € an hour × 60 ≈ 18.1 minutes. Once you have the wages, you can tell: Munich.'},
  {lvl:'bio',instant:true,q:'A bus ride costs $3.00 in Dallas and $2.75 in Aurora. Which takes more minutes of minimum-wage work?',choices:['Aurora, because more things cost more there','Dallas, about twice as long','About the same: the prices are close'],correct:1,explain:'Dallas: 3.00 ÷ 7.25 × 60 ≈ 24.8 minutes. Aurora: 2.75 ÷ 15.16 × 60 ≈ 10.9 minutes. The prices are close, but Colorado’s minimum wage is more than twice Texas’s.'},
  {lvl:'bio',instant:true,q:'What this number hides: rural Ecuador’s typical (mean) wage works out to $2.11 an hour, but the legal minimum is $2.78. How can the typical worker earn less than the minimum?',choices:['It is a typing error','The minimum wage applies to formal jobs, and most rural workers work informally','Rural workers work more hours, so they are paid less per hour'],correct:1,explain:'In December 2023, 79% of rural workers in Ecuador were informal: farming their own land, selling, day labor. The minimum wage binds employers in formal jobs. A table that shows only the minimum wage would hide most rural workers.'},
  {lvl:'honors',instant:true,q:'In Aurora, rent + 200 kWh of power costs $1,677.27 a month; in Tokyo, ¥82,511. Without an exchange rate, can you say which takes more minimum-wage work?',choices:['No: you must convert yen to dollars first','Yes: divide each by its own wage per hour','Yes: the bigger number takes more work'],correct:1,explain:'Minutes = cost ÷ wage × 60, both in the same currency. Aurora: 1,677.27 ÷ 15.16 ≈ 110.6 hours. Tokyo: 82,511 ÷ 1,280 ≈ 64.5 hours. No exchange rate needed.'},
  {lvl:'honors',instant:true,q:'Mexico City’s typical wage here is the mean pay of IMSS-insured (formal) workers. If you used the median of all workers, formal and informal, what would most likely happen to minutes of work?',choices:['They would go up','They would go down','They would not change'],correct:0,explain:'A mean is pulled up by high earners, and the formal-worker figure leaves out informal workers, 45.3% of the city’s workers. In Apr–Jun 2026, 41.2% of Mexico City’s workers earned up to one minimum wage. A median of everyone would sit lower, so the same price would take more minutes.'},
  {lvl:'honors',instant:true,q:'The breakfast basket (1 kg staple + 12 eggs) takes 27.4 minutes of minimum-wage work in Aurora and 51.5 in Dallas. With Aurora as the base (= 100), what is Dallas’s index?',choices:['About 53','About 100','About 188'],correct:2,explain:'Index = 100 × 51.5 ÷ 27.4 ≈ 188. The same basket takes almost twice as long to earn in Dallas, even though its dollar price is lower there ($6.22 against $6.93).'},
  {lvl:'ap',instant:true,q:'Rent + power costs ¥82,511 in Tokyo and $1,677.27 in Aurora. The market rate is ¥157.47 per $. What is the basket PPP, and what is Tokyo’s price level (Aurora = 100)?',choices:['PPP ≈ 49.2 yen per $; price level ≈ 31','PPP ≈ 157.5 yen per $; price level = 100','PPP ≈ 0.02 yen per $; price level ≈ 3'],correct:0,explain:'PPP = 82,511 ÷ 1,677.27 ≈ 49.2 yen buy what $1 buys in Aurora. Price level = 49.2 ÷ 157.47 × 100 ≈ 31: at exchange rates, this basket is about 69% cheaper in Tokyo. One basket of two items is a narrow PPP, which is why the World Bank prices hundreds of goods.'},
  {lvl:'ap',instant:true,q:'For a Nairobi worker, a liter of petrol takes 170 minutes at the minimum wage. Switch to the typical wage (KSh 365.45 an hour against KSh 80.09). About how many minutes now?',choices:['About 37 minutes','About 170 minutes: the price did not change','About 776 minutes'],correct:0,explain:'Minutes scale as 1 ÷ wage: 170 × 80.09 ÷ 365.45 ≈ 37. The typical wage here counts only formal wage employees, about 15% of the jobs counted, so the answer depends on whose wage you divide by.'}
 ],
 tour:[
  {title:'Thirteen places, one thing to buy',text:'Each row is a place. On the left: what an hour of minimum-wage work pays there. In the middle: the sticker price of one bus or metro ride, in that place’s own currency.',pause:true,setup:sim=>BioLab.setValues(sim,{item:'ride',worker:'min',show:false,basket:'none',view:'min'})},
  {title:'Sticker prices do not compare',text:'¥210, KSh 100, $3.00, 5 pesos. These are different units, like comparing inches with centimeters. A bigger number does not mean a harder life.',pause:true,focus:[[150,40,140,560]]},
  {title:'Divide by the wage',text:'Minutes of work = price ÷ pay per hour × 60. In Dallas: 3.00 ÷ 7.25 × 60 ≈ 24.8 minutes. Both numbers are in dollars, so the dollars cancel and minutes are left.',pause:true,setup:sim=>BioLab.setValues(sim,{show:true})},
  {title:'Nairobi takes the most',text:'A matatu ride in Nairobi takes about 75 minutes of minimum-wage work. Dallas is next, at about 25: more than Munich (18), where the ticket price is higher but so is the wage.',pause:true},
  {title:'Which worker?',text:'Switch to the typical wage and every bar shrinks, by different amounts. In Nairobi the typical wage is about 4.6 times the minimum, so the ride drops to about 16 minutes. But that typical wage counts only formal wage jobs.',pause:true,setup:sim=>BioLab.setValues(sim,{worker:'typ'})},
  {title:'Gray rows are findings too',text:'Where no reliable price or wage exists, the row stays gray. Copenhagen has no legal minimum wage; rural eastern Kentucky has no city bus fare. What is not measured drops out of the comparison.',pause:true,setup:sim=>BioLab.setValues(sim,{worker:'min'})},
  {lvl:'honors',title:'Build a basket',text:'Rent + power puts two everyday costs together. Add the costs, then divide by the wage. An index compares each place with a base place set to 100.',pause:true,setup:sim=>BioLab.setValues(sim,{basket:'home',base:'aur'})},
  {lvl:'ap',title:'Dollars at exchange rates',text:'Switch the bars to U.S. dollars. Now Munich and Aurora look expensive and Nairobi looks cheap: the opposite of the minutes. Exchange rates convert money, but they leave out wages.',pause:true,setup:sim=>BioLab.setValues(sim,{view:'usd'})}
 ],
 onTourExit(sim){BioLab.setValues(sim,{view:'min',basket:'none',worker:'min',show:false});},
 lab:{bio:'<p><b>Question:</b> Does the place with the highest sticker price take the most work?</p><ol><li>For three items, write down the place whose sticker price looks biggest.</li><li>Turn on <b>Show minutes of work</b> and record which place really takes the most minutes.</li><li>Switch <b>Which worker?</b> to Typical wage. Does the answer change?</li></ol><p>Write one sentence: what do you need, besides a price, to compare places?</p>',
  honors:'<p><b>Question:</b> How does a basket change the comparison?</p><ol><li>Build your own basket of three items with <b>Add this item to my basket</b>.</li><li>Record the minutes in each place that has every price. Which places drop out, and why?</li><li>Set a base place and record each index.</li></ol><p>Explain which people your index leaves out.</p>',
  ap:'<p><b>Question:</b> When do exchange-rate dollars and minutes of work disagree?</p><ol><li>For Rent + power, record each place’s price in U.S. dollars and in minutes.</li><li>Compute PPP = local cost ÷ Aurora cost, and price level = PPP ÷ exchange rate.</li><li>Repeat with the typical wage.</li></ol><p><b>CER:</b> Claim, evidence from your table, and reasoning about what each unit measures.</p>'},
 terms:[
  {t:'Minutes of work',d:'Price ÷ pay per hour × 60. A way to compare prices across places and currencies using time instead of money.'},
  {t:'Minimum wage',d:'The lowest hourly pay an employer may legally pay. Not every place has one, and it binds only formal jobs.'},
  {t:'Median and mean',d:'The median is the middle value: half earn less. The mean is the total ÷ the count, pulled up by high earners.',lvl:'honors'},
  {t:'Informal work',d:'Work outside the legal and social-security system: no contract, no registered employer, no benefits.'},
  {t:'Index',d:'A ratio scaled so the base equals 100: index = 100 × value ÷ base value.',lvl:'honors'},
  {t:'Basket',d:'A fixed list of goods and quantities, priced the same way in every place so the totals can be compared.',lvl:'honors'},
  {t:'Exchange rate',d:'How much of one currency trades for one unit of another on the market.',lvl:'ap'},
  {t:'Purchasing power parity (PPP)',d:'The number of local currency units that buy what one dollar buys in the base place: local basket cost ÷ base basket cost.',lvl:'ap'},
  {t:'Price level',d:'PPP ÷ exchange rate × 100. Below 100 means the basket is cheaper there at market exchange rates.',lvl:'ap'}
 ],
 about:'<p><b>See also:</b> <a href="#costofliving">Cost of living</a> (a month of basics in Quito, Dallas and Aurora), <a href="#povertypremium">The poverty premium</a>, <a href="#livingwage">The living wage</a>, and CivicsLab’s <a href="https://rjedtech.github.io/Raider-CivicsLab/#northsouth" target="_blank" rel="noopener">The world in 100 people</a>.</p>'
 +'<p><b>The math.</b> Minutes of work = price ÷ hourly wage × 60, both in local currency, so no exchange rate enters. A basket adds item costs (price × quantity) before dividing; a place with any missing price gets no basket total. Index = 100 × minutes in a place ÷ minutes in the base place. PPP (local currency per $) = local basket cost ÷ Aurora basket cost; price level = PPP ÷ exchange rate × 100. Workdays are 8 hours. A month of rides is 40 single fares; monthly passes usually cost less (RTD’s is $88). Unit conversions: 1 U.S. gallon = 3.78541 liters; 1 kg = 2.20462 lb.</p>'
 +'<p><b>Hourly wages.</b> Monthly pay is converted with these weekly hours: 40 (U.S., Germany, Japan, Ecuador: 173.33 hours a month), 48 (Mexico, Bangladesh, India), and 52 for Kenya. <b>Assumptions:</b> Kenya’s 52-hour week is the normal maximum widely reported for its general wages order (I could not open the order); India’s daily wages are divided by 8 hours; Germany’s annual median is divided by 2,080 hours; Japan’s monthly mean by 173.33 hours. Mexico’s daily minimum is paid for all 7 days of a 48-hour week, so hourly pay = daily × 7 ÷ 48.</p>'
 +'<ul><li>Colorado $15.16 (2026); Texas, Tennessee and Kentucky use the federal $7.25 (<a href="https://www.dol.gov/agencies/whd/minimum-wage/state" target="_blank" rel="noopener">U.S. DOL</a>). Medians, all occupations, OEWS May 2023: Denver-Aurora $28.12 (<a href="https://www.bls.gov/oes/2023/may/oes_19740.htm" target="_blank" rel="noopener">BLS</a>), Dallas-Fort Worth $23.29 (<a href="https://www.bls.gov/oes/2023/may/oes_19100.htm" target="_blank" rel="noopener">BLS</a>), Memphis $20.86 (<a href="https://www.bls.gov/oes/2023/may/oes_32820.htm" target="_blank" rel="noopener">BLS</a>), East Kentucky nonmetropolitan area $17.65 (<a href="https://www.bls.gov/oes/2023/may/oes_2100004.htm" target="_blank" rel="noopener">BLS</a>). OEWS surveys employers and leaves out self-employed people. In 2024, 1.7% of Texas hourly workers earned $7.25 or less (<a href="https://www.bls.gov/opub/reports/minimum-wage/2024" target="_blank" rel="noopener">BLS</a>).</li>'
 +'<li>Germany: €13.90 an hour from Jan 1, 2026 (<a href="https://www.bundesregierung.de/breg-de/aktuelles/mindestlohn-steigt-2391010" target="_blank" rel="noopener">Bundesregierung</a>); median full-time annual pay €54,066 in 2025 (<a href="https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/04/PD26_113_621.html" target="_blank" rel="noopener">Destatis</a>).</li>'
 +'<li>Tokyo: ¥1,280 an hour from Oct 1, 2026 (<a href="https://www.city.suginami.tokyo.jp/s121/news/22206.html" target="_blank" rel="noopener">Suginami City</a>); national mean monthly wage of full-time (general) workers ¥340,600, Basic Survey on Wage Structure (<a href="https://www.kaiketsu-j.com/evaluation/21324/" target="_blank" rel="noopener">summary</a>).</li>'
 +'<li>Denmark: one of five EU countries with no national minimum wage (<a href="https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Minimum_wage_statistics" target="_blank" rel="noopener">Eurostat</a>); median hourly earnings DKK 286.63 in 2024, Statistics Denmark (as reported by <a href="https://www.ansogningshjaelpen.dk/en/average-salary-denmark-2026/" target="_blank" rel="noopener">Ansøgningshjælpen</a>).</li>'
 +'<li>Ecuador: minimum $482 a month in 2026 (<a href="https://nmslaw.com.ec/blog/2025/12/22/ecuador-salario-basico-unificado-2026/" target="_blank" rel="noopener">NMS Law</a>; formal workers also get a 13th and 14th payment, not counted here); Quito mean labor income $657.40, informal sector 25.08% (<a href="https://investigaciones.quito.gob.ec/wp-content/uploads/2026/04/Mercado-Laboral-Anual-2025.pdf" target="_blank" rel="noopener">Quito labor market report 2025</a>); rural mean $365, May 2026 (<a href="https://www.ecuadorencifras.gob.ec/institucional/ecuador-registra-86-mil-personas-menos-en-situacion-de-desempleo-en-mayo-de-2026-frente-a-mayo-de-2025/" target="_blank" rel="noopener">INEC</a>); rural informality 79%, Dec 2023 (<a href="https://primicias.ec/noticias/economia/empleo-informalidad-trabajo-seguridad-social-iess" target="_blank" rel="noopener">Primicias</a>). No rural highland figure is published separately, so rural Ecuador uses national rural data.</li>'
 +'<li>Mexico: 315.04 pesos a day in 2026 outside the northern border zone (<a href="https://www.garrigues.com/es_ES/noticia/mexico-acordado-incremento-salarios-minimos-2026" target="_blank" rel="noopener">Garrigues</a>); IMSS mean daily wage 673.1 pesos, Aug 2026 (<a href="https://www.imss.gob.mx/sites/all/statics/i2f_news/2026-8-31%20Boletin%20Afiliacion%20IMSS.pdf" target="_blank" rel="noopener">IMSS</a>); Mexico City informality 45.3% and 41.2% earning up to one minimum wage, Apr–Jun 2026 (<a href="https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/enoe/enoe2026_08_CdMx.pdf" target="_blank" rel="noopener">INEGI</a>).</li>'
 +'<li>Kerala: ₹401 a day under the rural jobs-guarantee act from Jul 1, 2026 (<a href="https://www.scconline.com/blog/post/2026/07/06/state-wise-wage-rates-revised-under-vb-g-ram-g-act/" target="_blank" rel="noopener">SCC Online</a>); ₹893.6 a day for rural construction workers, 2023–24, RBI Handbook of Statistics on Indian States (<a href="https://www.dtnext.in/news/tamilnadu/tamil-nadu-and-kerala-set-daily-wage-benchmarks-pay-rs-112-more-than-national-average-814985" target="_blank" rel="noopener">DT Next</a>). India sets minimum wages occupation by occupation, so no single figure fits.</li>'
 +'<li>Kenya: KSh 18,047 a month for the cities’ general-laborer category from May 1, 2026, a 12% rise (<a href="https://k24.digital/lifestyle/money/12-salary-increase-takes-effect-how-much-entry-level-workers-will-earn" target="_blank" rel="noopener">K24</a>); mean pay of wage employees = KSh 3,275,769.3 million ÷ 3.315 million ÷ 12 ≈ KSh 82,347 a month, my calculation from KNBS 2026 Facts and Figures (<a href="https://www.knbs.or.ke/wp-content/uploads/2026/04/2026-Facts-and-Figures.pdf" target="_blank" rel="noopener">KNBS</a>); 21.6 million jobs outside small-scale farming in 2025 (<a href="https://www.standardmedia.co.ke/business/amp/nairobi/article/2001546935/mwaura-nine-in-10-new-jobs-created-in-2025-were-informal" target="_blank" rel="noopener">The Standard</a>), so wage jobs are 3.315 ÷ 21.6 ≈ 15%.</li>'
 +'<li>Bangladesh: garment-sector minimum Tk 12,500 a month, set in 2023 (<a href="https://images.thedailystar.net/node/3463911" target="_blank" rel="noopener">Daily Star</a>); a new rate is due in January 2027 (<a href="https://fashionunited.fr/actualite/business/bangladesh-accord-sur-une-hausse-du-salaire-minimum-des-ouvriers-du-textile/2026110443457" target="_blank" rel="noopener">FashionUnited</a>). 84% of the labor force in informal employment, Labour Force Survey 2024 (<a href="https://thefinancialexpress.com.bd/views/columns/the-urgency-of-recognising-informal-workforce" target="_blank" rel="noopener">Financial Express</a>). No recent median or mean wage found.</li>'
 +'<li>Informal work shares for Germany, Denmark, India and Kenya: ILOSTAT, as listed on <a href="https://en.wikipedia.org/wiki/List_of_countries_by_informal_employment_rate" target="_blank" rel="noopener">Wikipedia</a>. High-income-country average 12.9% (<a href="https://www.ilo.org/sites/default/files/2025-05/World_Informality%20Regional%20statistical%20profile.pdf" target="_blank" rel="noopener">ILO, 2025</a>).</li></ul>'
 +'<p><b>Prices.</b> Each price’s source, date, type (official statistic, compiled by a reputable organization, online listing, news report, or a price set by law) and coverage (city, region or nation) is in the info panel for your pick. The full list:</p><ul>'+Object.keys(SRC).map(k=>{const S=SRC[k];return `<li>${S.u?`<a href="${S.u}" target="_blank" rel="noopener">${S.n}</a>`:S.n}, ${S.y}.</li>`;}).join('')+'</ul>'
 +'<p><b>Assumptions for illustration.</b> Electricity is priced at 200 kWh a month for every place (a fixed quantity, not each place’s typical use); Tokyo’s 402 kWh bill is scaled down proportionally, which ignores fixed charges. Rent: Munich 40 m² and Tokyo 25 m² are my choices of a modest apartment size; U.S. rents are HUD studio Fair Market Rents with utilities, Munich’s is before utilities, and Nairobi’s is a single room, so the rent row compares different kinds of homes. Dhaka prices are midpoints of a reported range. Free tuition counts as 0 minutes; taxes pay for it.</p>'
 +'<p><b>Insulin.</b> RAND compared insulin prices in the U.S. with 33 OECD countries (2017–2022 data): U.S. gross (list) prices averaged 9.71 times those in the other countries combined, and net prices, after rebates, 2.33 times (<a href="https://www.rand.org/pubs/periodicals/health-quarterly/issues/v11/n3/03.html" target="_blank" rel="noopener">RAND</a>). The report I could open gives ratios, not a price for each place, so the insulin row is empty. What a patient pays also depends on insurance and caps.</p>'
 +'<p><b>Not included.</b> A month of mobile data, a basic smartphone, a doctor visit without insurance, a year of school uniforms or supplies, and a pair of basic shoes: I found no comparable, sourced price for most of these places. That gap is itself a result.</p>'
 +'<p><b>How professionals do this.</b> The Economist’s Big Mac Index prices one identical item everywhere; the World Bank’s International Comparison Program prices hundreds of goods and services to compute PPPs. Other sources you will meet: crowd-sourced sites such as Numbeo, which none of these prices uses. Statistics Denmark, for example, reports that Danish bread and cereal prices were 136% of the EU average in 2024 (<a href="https://www.dst.dk/nyt/32756" target="_blank" rel="noopener">Statistics Denmark</a>), an index rather than a shop price.</p>'
 +'<p><b>Exchange rates</b> (local currency per $): euro 0.8958, yen 157.47, krone 6.6946, peso 18.7942, rupee 94.94 (<a href="https://www.federalreserve.gov/releases/h10/current/" target="_blank" rel="noopener">Federal Reserve H.10</a>, Oct 30, 2026); Kenya shilling 129.91 (<a href="https://www.centralbank.go.ke/" target="_blank" rel="noopener">Central Bank of Kenya</a>, Nov 6, 2026); taka 122.75 (Bangladesh Bank purchase rate, Jun 2, 2026, <a href="https://today.thefinancialexpress.com.bd/print/bb-buys-54m-more-to-stabilise-taka-1780337629" target="_blank" rel="noopener">Financial Express</a>).</p>'
 +'<p>This is a simplified math model, not financial advice. Places have different dates, sources and coverage, so treat small differences with caution. The tool compares numbers, not countries or the people in them: in every one of these places, people manage these costs with skill every day. A question to consider: <i>Rerum Novarum</i> (1891, §45) holds that “wages ought not to be insufficient to support a frugal and well-behaved wage-earner” (<a href="https://www.vatican.va/content/leo-xiii/en/encyclicals/documents/hf_l-xiii_enc_15051891_rerum-novarum.html" target="_blank" rel="noopener">Vatican</a>). Which of these numbers would help you test a wage against that standard, and which would hide the answer?</p>'
};
BioLab.register(SIM);
})();
