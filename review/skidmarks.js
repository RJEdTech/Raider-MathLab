BioLab.addReview({
skidmarks:{
 questions:[
  {id:'stop30',kind:'real',lvl:'bio',
   q:'A car is going 30 mph on dry pavement (f = 0.7), and the driver takes 1.5 s to react. What is the total stopping distance? Round to the nearest foot.',
   num:{ans:109,tol:1,unit:'ft'},
   steps:['30 mph = 30 × 1.467 = 44 ft per second. Reacting for 1.5 s covers 44 × 1.5 = 66 ft.','Braking: 30²/(30 × 0.7) = 900/21 ≈ 42.9 ft.','Total ≈ 66 + 42.9 = 108.9, about 109 ft.'],
   lab:{set:{mode:'stop',speed:30,surf:'dry',react:1.5,show:true},look:'Read <b>Reaction distance</b>, <b>Braking distance</b> and <b>Total stopping distance</b>.'},verify:[['react',66,0.01],['brake',42.857,0.01],['total',108.857,0.01]]},
  {id:'triple',kind:'test',lvl:'bio',
   q:'If a car’s speed triples, what happens to its braking distance on the same road?',
   choices:['It triples','It becomes 6 times as long','It becomes 9 times as long','It stays the same'],correct:2,
   steps:['Braking distance is S²/(30f): it grows with the square of the speed.','(3S)² = 9S², so the braking distance is 9 times as long.']},
  {id:'wet90',kind:'real',lvl:'honors',
   q:'Skid marks on a wet road (f = 0.5) are 90 ft long. About how fast was the car going when the brakes locked? Round to 0.1 mph.',
   num:{ans:36.7,tol:0.1,unit:'mph'},
   steps:['S = √(30 × d × f) = √(30 × 90 × 0.5).','30 × 90 × 0.5 = 1350.','√1350 ≈ 36.7 mph.'],
   lab:{set:{mode:'skid',skid:90,surf:'wet',show:true},look:'Read <b>Speed from the skid marks</b>.'},verify:[['skidspd',36.742,0.01]]},
  {id:'simplify',kind:'test',lvl:'honors',
   q:'Skid marks of 40 ft on dry pavement give S = √(30 × 40 × 0.7) = √840. Which is √840 in simplest radical form?',
   choices:['2√210','4√52.5','√420 + √420','28√30'],correct:0,
   steps:['Look for the biggest perfect-square factor: 840 = 4 × 210, and 210 = 2 × 3 × 5 × 7 has no square factor.','√840 = √4 × √210 = 2√210.','2√210 ≈ 29.0 mph.'],
   lab:{set:{mode:'skid',skid:40,surf:'dry',show:true},look:'Read <b>Speed from the skid marks</b>: it should be about 29.0.'},verify:[['skidspd',28.983,0.01]]},
  {id:'distracted',kind:'real',lvl:'ap',
   q:'At 50 mph on dry pavement, a driver looking at a phone takes 2.0 s to react instead of 1.0 s. How much farther does the car travel before stopping? Round to 0.1 ft.',
   num:{ans:73.3,tol:0.2,unit:'ft'},
   steps:['50 mph = 50 × 1.467 ≈ 73.3 ft per second.','One extra second of reacting is 73.3 ft more, all at full speed.','The braking distance (50²/21 ≈ 119 ft) does not change, so the total grows from about 192 ft to about 266 ft.'],
   lab:{set:{mode:'stop',speed:50,surf:'dry',react:2,show:true},look:'Read <b>Reaction distance</b>, then set the reaction time to 1.0 s and read it again.'},verify:[['react',146.667,0.01],['total',265.714,0.01]]},
  {id:'maxspeed',kind:'test',lvl:'ap',
   q:'A driver must be able to stop within 100 ft in total on dry pavement (f = 0.7), with a 1.5 s reaction. What is the fastest safe speed? Round to 0.1 mph.',
   num:{ans:28.2,tol:0.1,unit:'mph'},
   steps:['Total = 2.2S + S²/21 (since 1.467 × 1.5 = 2.2). Set it equal to 100: S²/21 + 2.2S − 100 = 0.','Multiply by 21: S² + 46.2S − 2100 = 0.','Quadratic formula: S = (−46.2 + √(46.2² + 8400))/2 = (−46.2 + √10534.44)/2 ≈ (−46.2 + 102.64)/2 ≈ 28.2 mph.']}
 ]
}
});
