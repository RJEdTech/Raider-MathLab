/* Raider MathLab: course order comes from the RJ math teachers' Canvas modules (Statistics, AP Statistics and AP Calculus added Nov 6, 2026 from the 2025-26 and Fall 2026 shells) (Fall 2026 shells for semester 1,
   Spring 2026 shells for semester 2). Each unit may carry a "why" card: {hook, problems:[...], uses:[...]}. */
BioLab.COURSES = [
 {id:'alg1',name:'Algebra 1',blurb:'Algebra 1 and Honors Algebra 1, in the order your class covers it. Honors chapter numbers are in each unit’s note.',
  units:[
   {n:'Unit 1',t:'Intro to algebra: expressions and variables',ids:['formulas'],note:'Honors: Chapter 1.'},
   {n:'Unit 2',t:'Multistep equations and proportions',ids:['scaleit','formulas'],note:'Honors: Chapter 1.'},
   {n:'Unit 3',t:'Functions',ids:['checkout','rideshare','formulas'],note:'Honors: Chapter 3.'},
   {n:'Unit 4',t:'Writing and graphing linear equations',ids:['rideshare'],note:'Honors: Chapters 3 and 4.'},
   {n:'Unit 5',t:'Systems of equations and inequalities',ids:['breakeven','budget'],note:'Honors: Chapter 2 (inequalities) and Chapter 5 (systems).'},
   {n:'Unit 6',t:'Polynomials',ids:['areamodel'],note:'Honors: Chapter 7.'},
   {n:'Unit 7',t:'Graphing and solving quadratics',ids:['freethrow','ticketprice'],note:'Honors: Chapters 8 and 9.'},
   {n:'Unit 8',t:'Exponents and radicals',ids:['datasize','skidmarks'],note:'Honors: Chapter 6. Some sections take this unit before quadratics.'}
  ]},
 {id:'geo',name:'Geometry',blurb:'Geometry and Honors Geometry, in the order your class covers it.',
  units:[
   {n:'Unit 1',t:'Geometry basics: distance, midpoint and the Pythagorean theorem',ids:['screens']},
   {n:'Unit 2',t:'Logic and reasoning',ids:['logic']},
   {n:'Unit 3',t:'Parallel lines and angles',ids:['parking']},
   {n:'Triangles',t:'Congruence and similarity',ids:['truss','shadow'],note:'Honors: Units 5 and 6.'},
   {n:'Right triangles',t:'Right-triangle trigonometry',ids:['ramp'],note:'Honors: Unit 8. Geometry: the first spring unit.'},
   {n:'Polygons',t:'Polygons and quadrilaterals',ids:['tiling'],note:'Honors: Unit 9.'},
   {n:'Circles',t:'Circles: arcs, chords and inscribed angles',ids:['gps','tires','shotangle'],note:'Honors: Unit 10.'},
   {n:'Solids',t:'Surface area and volume',ids:['packaging'],note:'Honors: Unit 11.'},
   {n:'Transformations',t:'Transformations and coordinate geometry',ids:['sprites'],note:'Honors: transformations and Unit 13.'}
  ]},
 {id:'alg2',name:'Algebra 2',blurb:'Algebra 2 and Honors Algebra 2 / Trigonometry, in the order your class covers it.',
  further:['fontcurves'],
  units:[
   {n:'Unit 1',t:'Parent functions and transformations',ids:['pondday','photofilter']},
   {n:'Unit 2',t:'Quadratic functions',ids:['dish','ticketprice','freethrow']},
   {n:'Unit 3',t:'Polynomials',ids:['coaster','openbox']},
   {n:'Unit 4',t:'Radicals and rational exponents',ids:['skidmarks']},
   {n:'Unit 5',t:'Exponential and logarithmic functions',ids:['creditcard','caffeine','decibels','passwords'],note:'Honors: Chapter 6.'},
   {n:'Unit 6',t:'Rational functions',ids:['splitcost','sharedwork'],note:'Algebra 2 only.'},
   {n:'Trig',t:'Trigonometry',ids:['daylight','noisecancel'],note:'Honors Algebra 2 / Trig only.'}
  ]},
 {id:'precalc',name:'Precalculus',blurb:'Precalculus, in the order your class covers it.',
  further:['matrices','windvectors','orbits'],
  units:[
   {n:'Unit 0',t:'Complex numbers',ids:['rotations']},
   {n:'Unit 1',t:'Function basics: composition and inverses',ids:['checkout','pondday','cipher','photofilter']},
   {n:'Unit 2',t:'Polynomial and rational functions',ids:['coaster','splitcost']},
   {n:'Unit 3',t:'Triangle trigonometry',ids:['triangulate','ramp']},
   {n:'Unit 4',t:'Trigonometry and the unit circle',ids:['daylight']},
   {n:'Unit 5',t:'Graphing trigonometric functions',ids:['daylight','noisecancel']},
   {n:'Unit 6',t:'Exponents and logarithms',ids:['logscale','creditcard','decibels']}
  ]},
 {id:'apprecalc',name:'AP Precalculus',blurb:'AP Precalculus, by College Board unit. Unit 4 is taught at RJ but is not on the AP exam.',
  units:[
   {n:'Unit 1A',t:'Polynomial functions',ids:['coaster','openbox']},
   {n:'Unit 1B',t:'Rational functions',ids:['splitcost','sharedwork']},
   {n:'Unit 2A',t:'Exponential functions',ids:['creditcard','caffeine','logscale']},
   {n:'Unit 2B',t:'Logarithmic functions and inverses',ids:['decibels','passwords','logscale','cipher']},
   {n:'Unit 3A',t:'Trigonometric functions',ids:['daylight','noisecancel']},
   {n:'Unit 3B',t:'Polar functions and rotations',ids:['rotations']},
   {n:'Unit 4',t:'Functions involving parameters, vectors and matrices',ids:['matrices','windvectors','orbits'],note:'Not on the AP exam.'}
  ]},
 {id:'stats',name:'Statistics',blurb:'Probability & Statistics (fall) and Inferential Statistics (spring), in the order your class covers it.',
  further:['pollmargin'],
  units:[
   {n:'Chapter 1',t:'Analyzing one-variable data',ids:['busroute','babysit'],note:'Probability & Statistics (fall).'},
   {n:'Chapter 2',t:'Modeling one-variable data: percentiles, z-scores and the normal model',ids:['testchoice','hoodies'],note:'Probability & Statistics (fall).'},
   {n:'Chapter 3',t:'Analyzing two-variable data: scatterplots and regression',ids:['lawnjob'],note:'Probability & Statistics (fall).'},
   {n:'Chapter 5',t:'Probability',ids:['lunchcount','rapidtest'],note:'Probability & Statistics (fall).'},
   {n:'Chapter 4',t:'Collecting data: sampling and experiments',ids:['survey','warmup'],note:'Inferential Statistics (spring).'},
   {n:'Chapter 6',t:'Random variables: expected value and the binomial',ids:['insurance','rsvp'],note:'Inferential Statistics (spring).'},
   {n:'Chapter 7',t:'Sampling distributions',ids:['slump'],note:'Inferential Statistics (spring).'}
  ]},
 {id:'apstats',name:'AP Statistics',blurb:'AP Statistics, by College Board unit.',
  units:[
   {n:'Unit 1',t:'Exploring one-variable data',ids:['busroute','babysit','testchoice','hoodies']},
   {n:'Unit 2',t:'Exploring two-variable data',ids:['lunchcount','lawnjob']},
   {n:'Unit 3',t:'Collecting data',ids:['survey','warmup']},
   {n:'Unit 4',t:'Probability, random variables and probability distributions',ids:['lunchcount','rapidtest','insurance','rsvp']},
   {n:'Unit 5',t:'Sampling distributions',ids:['slump']},
   {n:'Unit 6',t:'Inference for categorical data: proportions',ids:['pollmargin']},
   {n:'Unit 7',t:'Inference for quantitative data: means',ids:['fryshort','studymethod']},
   {n:'Unit 8',t:'Inference for categorical data: chi-square',ids:['lootdrop']},
   {n:'Unit 9',t:'Inference for quantitative data: slopes',ids:['lawnjob'],note:'Use the Deep dive level.'}
  ]},
 {id:'calcab',name:'AP Calculus AB',blurb:'AP Calculus AB, by College Board unit, in the order your class covers it.',
  units:[
   {n:'Unit 1',t:'Limits and continuity',ids:['runpace']},
   {n:'Unit 2',t:'Differentiation: definition and basic rules',ids:['runpace','battery']},
   {n:'Unit 3',t:'The chain rule, implicit and inverse functions',ids:['camerapan']},
   {n:'Unit 4',t:'Contextual applications: motion, related rates and linearization',ids:['camerapan','battery']},
   {n:'Unit 5',t:'Analytical applications: extrema, concavity and optimization',ids:['shortcut','viewcurve']},
   {n:'Unit 6',t:'Integration and accumulation of change',ids:['speedlog','concession']},
   {n:'Unit 7',t:'Differential equations',ids:['cooling']},
   {n:'Unit 8',t:'Applications of integration: average value, motion, area and volume',ids:['concession','bottle']}
  ]},
 {id:'calcbc',name:'AP Calculus BC',blurb:'AP Calculus BC, in the order your class covers it: series in the fall, applications, parametric and polar, and differential equations in the spring.',
  units:[
   {n:'Fall 1',t:'Limits and continuity',ids:['runpace']},
   {n:'Fall 2',t:'Derivatives and derivative rules',ids:['runpace','battery','camerapan']},
   {n:'Fall 3',t:'Integrals, the Fundamental Theorem, and integrating exponential and log functions',ids:['speedlog','concession']},
   {n:'Fall 4',t:'Sequences and series',ids:['caffeinedaily']},
   {n:'Fall 5',t:'Taylor series and error',ids:['sincode']},
   {n:'Spring 1',t:'Applications of derivatives and optimization',ids:['shortcut','viewcurve','camerapan']},
   {n:'Spring 2',t:'Applications of integrals: area and volume',ids:['concession','bottle']},
   {n:'Spring 3',t:'Parametric equations and polar curves',ids:['leadpass','sprinkler']},
   {n:'Spring 4',t:'Differential equations, slope fields and Euler’s method',ids:['cooling']}
  ]}
];BioLab.TOPIC_ORDER = {
 1:['formulas','scaleit'],2:['rideshare','breakeven','budget'],3:['areamodel','freethrow','ticketprice','dish','coaster','openbox'],
 4:['datasize','skidmarks','creditcard','caffeine','decibels','passwords','logscale'],5:['splitcost','sharedwork'],6:['checkout','pondday','photofilter','cipher','rotations'],
 7:['logic'],8:['screens','parking','truss','shadow','ramp','triangulate'],12:['tiling','packaging','sprites'],10:['gps','tires','shotangle'],
 9:['daylight','noisecancel'],11:['fontcurves','matrices','windvectors','orbits'],
 13:['busroute','babysit','testchoice','hoodies','lawnjob'],14:['survey','warmup','lunchcount','rapidtest','insurance','rsvp'],15:['slump','pollmargin','fryshort','studymethod','lootdrop'],
 16:['runpace','battery','camerapan','shortcut','viewcurve'],17:['speedlog','concession','cooling','bottle'],18:['leadpass','sprinkler','caffeinedaily','sincode'],
 19:['stickernet','aidoptimizer','rankcolleges','carquote','valueadded','hotspot','beatbot','schedule','fairscore','onepercent'],
 20:['kidneyswap','schoolmatch','livessaved','costofliving','livingwage']};
BioLab.setSections({units:{},extra:{1:'Expressions, equations and proportions',2:'Linear functions and systems',3:'Quadratics and polynomials',4:'Exponents, radicals and logarithms',5:'Rational functions',6:'Functions, inverses and transformations',7:'Logic and reasoning',8:'Distance, angles and triangles',12:'Shapes, solids and motion',10:'Circles',9:'Trigonometry and waves',13:'Describing data',14:'Collecting data and probability',15:'Statistical inference',16:'Derivatives: rates of change',17:'Integrals: accumulation',18:'Calculus BC: motion, polar and series',19:'Who’s scoring you? The math deciding your life',20:'Math that works for people',11:'Go further'},
 order:[1,2,3,4,5,6,7,8,12,10,9,13,14,15,16,17,18,19,20,11],further:11,unitPrefix:''});
(function(){const P={};Object.keys(BioLab.TOPIC_ORDER).forEach(k=>BioLab.TOPIC_ORDER[k].forEach(id=>P[id]=+k));
 BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
 const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
