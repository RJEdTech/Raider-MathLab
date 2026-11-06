BioLab.addReview({
scaleit:{
 questions:[
  {id:'map6',kind:'test',lvl:'bio',
   q:'A map scale says 1.5 in = 4 mi. Two towns are 6 in apart on the map. How far apart are they?',
   num:{ans:16,tol:0.01,unit:'mi'},
   steps:['Scale factor: 6 ÷ 1.5 = 4.','Multiply the miles by the same factor: 4 × 4 = 16 mi.'],
   lab:{set:{sc:'map',a:6,show:true},look:'Read <b>The math says</b>.'},verify:[['ans',16,0.001],['sf',4,0.001]]},
  {id:'pasta45',kind:'real',lvl:'bio',
   q:'A recipe for 6 servings uses 1.5 lb of pasta. The team dinner needs 45 servings. How many pounds of pasta?',
   num:{ans:11.25,tol:0.01,unit:'lb'},
   steps:['Scale factor: 45 ÷ 6 = 7.5.','1.5 × 7.5 = 11.25 lb.','Check with the unit rate: 1.5 ÷ 6 = 0.25 lb per serving, and 45 × 0.25 = 11.25 lb.'],
   lab:{set:{sc:'recipe',a:45,show:true},look:'Read <b>The math says</b>.'},verify:[['ans',11.25,0.001]]},
  {id:'pesos',kind:'real',lvl:'honors',
   q:'At an example rate of 18.50 pesos = $1, a pair of shoes costs 1,110 pesos. How many dollars is that?',
   num:{ans:60,tol:0.01,unit:'$'},
   steps:['Pesos over dollars on both sides: 18.50 / 1 = 1,110 / x.','Cross-multiply: 18.50x = 1,110.','x = 1,110 ÷ 18.50 = $60.'],
   lab:{set:{sc:'money',a:1110,show:true},look:'Read <b>The math says</b>.'},verify:[['ans',60,0.001]]},
  {id:'dose54',kind:'test',lvl:'honors',
   q:'Fictorex is a made-up medicine dosed at 5 mL per 20 kg of body weight. What is the dose for a 54 kg patient?',
   num:{ans:13.5,tol:0.01,unit:'mL'},
   steps:['kg over mL on both sides: 20 / 5 = 54 / x.','Cross-multiply: 20x = 5 × 54 = 270.','x = 270 ÷ 20 = 13.5 mL.'],
   lab:{set:{sc:'dose',a:54,show:true},look:'Read <b>The math says</b> and the cross-multiplying steps.'},verify:[['ans',13.5,0.001]]},
  {id:'pounds',kind:'test',lvl:'ap',
   q:'A patient weighs 130 lb. Using 1 kg ≈ 2.205 lb and Fictorex’s made-up rate of 5 mL per 20 kg, what is the dose to the nearest 0.1 mL?',
   num:{ans:14.7,tol:0.1,unit:'mL'},
   steps:['Chain the rates so units cancel: 130 lb × (1 kg / 2.205 lb) × (5 mL / 20 kg).','130 ÷ 2.205 ≈ 58.96 kg, and 58.96 × 0.25 mL per kg ≈ 14.7 mL.','Skipping the conversion would give 130 × 0.25 = 32.5 mL, more than twice the right dose.'],
   lab:{set:{sc:'dose',a:59,show:true},look:'59 kg is the nearest whole kilogram. Read <b>The math says</b>.'},verify:[['ans',14.75,0.001]]},
  {id:'blueprint',kind:'real',lvl:'honors',
   q:'A floor plan uses the scale 1/4 in = 1 ft. A bedroom wall measures 3.5 in on the plan. How long is the real wall?',
   choices:['3.5 ft','8.75 ft','14 ft','4.5 ft'],correct:2,
   steps:['Unit rate: 1 ft per 1/4 in is 4 ft per inch.','3.5 in × (4 ft / 1 in) = 14 ft.','4.5 ft comes from adding 1 to 3.5, and 8.75 from multiplying by 2.5. A scale always multiplies.']}
 ]
}
});
