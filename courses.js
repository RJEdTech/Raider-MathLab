/* Raider MathLab: course order comes from the RJ math teachers' Canvas modules (Fall 2026 shells for semester 1,
   Spring 2026 shells for semester 2). Each unit may carry a "why" card: {hook, problems:[...], uses:[...]}. */
BioLab.COURSES = [
 {id:'alg1',name:'Algebra 1',blurb:'Algebra 1 and Honors Algebra 1, in the order your class covers it. Honors chapter numbers are in each unit’s note.',
  units:[
   {n:'Unit 1',t:'Intro to algebra: expressions and variables',ids:['formulas'],note:'Honors: Chapter 1.'},
   {n:'Unit 2',t:'Multistep equations and proportions',ids:['scaleit','formulas'],note:'Honors: Chapter 1.'},
   {n:'Unit 3',t:'Functions',ids:['rideshare','formulas']},
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
   {n:'Unit 1',t:'Parent functions and transformations',ids:['photofilter']},
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
   {n:'Unit 1',t:'Function basics: composition and inverses',ids:['cipher','photofilter']},
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
   {n:'Unit 2B',t:'Logarithmic functions and inverses',ids:['decibels','passwords','cipher']},
   {n:'Unit 3A',t:'Trigonometric functions',ids:['daylight','noisecancel']},
   {n:'Unit 3B',t:'Polar functions and rotations',ids:['rotations']},
   {n:'Unit 4',t:'Functions involving parameters, vectors and matrices',ids:['matrices','windvectors','orbits'],note:'Not on the AP exam.'}
  ]}
];
BioLab.TOPIC_ORDER = {
 1:['formulas','scaleit'],2:['rideshare','breakeven','budget'],3:['areamodel','freethrow','ticketprice','dish','coaster','openbox'],
 4:['datasize','skidmarks','creditcard','caffeine','decibels','passwords','logscale'],5:['splitcost','sharedwork'],6:['photofilter','cipher','rotations'],
 7:['logic'],8:['screens','parking','truss','shadow','ramp','triangulate'],12:['tiling','packaging','sprites'],10:['gps','tires','shotangle'],
 9:['daylight','noisecancel'],11:['fontcurves','matrices','windvectors','orbits']};
BioLab.setSections({units:{},extra:{1:'Expressions, equations and proportions',2:'Linear functions and systems',3:'Quadratics and polynomials',4:'Exponents, radicals and logarithms',5:'Rational functions',6:'Functions, inverses and transformations',7:'Logic and reasoning',8:'Distance, angles and triangles',12:'Shapes, solids and motion',10:'Circles',9:'Trigonometry and waves',11:'Go further'},
 order:[1,2,3,4,5,6,7,8,12,10,9,11],further:11,unitPrefix:''});
(function(){const P={};Object.keys(BioLab.TOPIC_ORDER).forEach(k=>BioLab.TOPIC_ORDER[k].forEach(id=>P[id]=+k));
 BioLab.defs.forEach(d=>{if(P[d.id]!==undefined)d.apUnit=P[d.id];});
 const keep=new Set(BioLab.defs.map(d=>d.id));BioLab.defs.forEach(d=>{['prereq','next'].forEach(k=>{if(d[k])d[k]=d[k].filter(i=>keep.has(i));});});})();
