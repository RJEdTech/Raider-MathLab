BioLab.addReview({
parking:{
 questions:[
  {id:'straight',kind:'real',lvl:'bio',
   q:'A curb is 200 ft long. Straight-in (90°) stalls are 9 ft wide. How many stalls fit in one row?',
   num:{ans:22,tol:0,unit:'stalls'},
   steps:['At 90°, each stall uses exactly its width of curb: 9 ft.','200 ÷ 9 ≈ 22.2.','You cannot park part of a car, so round down: 22 stalls.'],
   lab:{set:{ang:90,L:200,depth:44},look:'Read <b>Stalls per row</b>.'},verify:[['perrow',22,0]]},
  {id:'corr',kind:'test',lvl:'honors',
   q:'Two parallel lines are cut by a transversal. One of the angles at the first intersection is 72°. What is the corresponding angle at the second intersection?',
   choices:['18°','72°','108°','144°'],correct:1,
   steps:['Corresponding angles sit in matching positions at the two intersections.','When the lines are parallel, corresponding angles are equal.','So the corresponding angle is 72°.']},
  {id:'ssi',kind:'test',lvl:'honors',
   q:'A stall line crosses the curb and the aisle edge, which are parallel. The stall line makes a 60° angle with the curb. What is the same-side interior angle at the aisle edge?',
   choices:['30°','60°','120°','180°'],correct:2,
   steps:['Same-side interior angles lie between the parallel lines, on the same side of the transversal.','They are supplementary: they add to 180°.','180° − 60° = 120°. (The alternate interior angle, on the other side of the stall line, is 60°.)']},
  {id:'cps60',kind:'real',lvl:'honors',
   q:'Stalls 9 ft wide are angled at 60° to the curb. To the nearest 0.1 ft, how much curb does each stall use?',
   num:{ans:10.4,tol:0.05,unit:'ft'},
   steps:['The stall is 9 ft wide measured perpendicular to its lines, but it meets the curb on a slant.','Curb per stall = 9 ÷ sin 60° = 9 ÷ 0.866.','≈ 10.4 ft.'],
   lab:{set:{ang:60},look:'At <b>Closer look</b>, read <b>Curb per stall</b>.'},verify:[['cps',10.392,0.002]]},
  {id:'lot240',kind:'real',lvl:'ap',
   q:'A lot is 240 ft along the curb and 56 ft deep. With 9 by 18 ft stalls at 45° and a 13 ft one-way aisle, how many spaces fit? (Straight-in stalls fit 26.)',
   num:{ans:34,tol:0,unit:'spaces'},
   steps:['Row depth = 18 sin 45° + 9 cos 45° ≈ 19.09 ft. Two rows plus the aisle: 2 × 19.09 + 13 ≈ 51.2 ft, which fits in 56 ft.','The slanted ends cost 19.09 ÷ tan 45° ≈ 19.09 ft of curb. Each stall uses 9 ÷ sin 45° ≈ 12.73 ft.','(240 − 19.09) ÷ 12.73 ≈ 17.4, so 17 per row and 2 × 17 = 34 spaces, 8 more than straight in.'],
   lab:{set:{ang:45,L:240,depth:56},look:'Read <b>Parking spaces</b>, then try 90°.'},verify:[['total',34,0],['rows',2,0]]},
  {id:'dep45',kind:'test',lvl:'ap',
   q:'A 9 ft by 18 ft rectangle is tilted so its long side makes a 45° angle with a line. To the nearest 0.1 ft, how far does it reach straight out from that line?',
   num:{ans:19.1,tol:0.05,unit:'ft'},
   steps:['The long side reaches 18 sin 45° ≈ 12.73 ft out.','The short side, tilted too, adds 9 cos 45° ≈ 6.36 ft.','Total ≈ 19.1 ft. This is the depth of a 45° parking row.'],
   lab:{set:{ang:45},look:'At <b>Closer look</b>, read <b>Row depth</b>.'},verify:[['dep',19.092,0.002]]}
 ]
}
});
