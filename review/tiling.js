BioLab.addReview({
tiling:{
 questions:[
  {id:'pent',kind:'test',lvl:'bio',
   q:'What is the interior angle of a regular pentagon, and how big is the gap when three of them meet at a corner?',
   choices:['108°, with a 36° gap','108°, with no gap','120°, with no gap','72°, with a 144° gap'],correct:0,
   steps:['Interior angle = 180(n − 2)/n = 180 × 3 ÷ 5 = 108°.','Three pentagons use 3 × 108° = 324°.','360° − 324° = 36° is left over, and a fourth 108° pentagon will not fit. So regular pentagons cannot tile.'],
   lab:{set:{n:5},look:'Read <b>Interior angle</b> and look at the red gap on the left.'},verify:[['ang',108,0.01],['fit',3.333,0.01]]},
  {id:'deca',kind:'test',lvl:'honors',
   q:'A regular polygon has interior angles of 144°. How many sides does it have, and does it tile alone?',
   choices:['8 sides; it tiles','10 sides; it does not tile','10 sides; it tiles','12 sides; it does not tile'],correct:1,
   steps:['Set 180(n − 2)/n = 144. Then 180n − 360 = 144n, so 36n = 360 and n = 10.','360 ÷ 144 = 2.5, not a whole number, so it does not tile alone.'],
   lab:{set:{n:10},look:'Read <b>Copies that fit at a corner</b>.'},verify:[['ang',144,0.01],['fit',2.5,0.01]]},
  {id:'patio',kind:'real',lvl:'bio',
   q:'For the 20 m² patio with 100 cm² tiles, how many meters of grout lines do hexagon tiles need?',
   num:{ans:372.2,tol:0.5,unit:'m'},
   steps:['A regular hexagon with area 0.01 m² has perimeter P = 2√(6 × 0.01 × tan 30°) = 0.3722 m.','Each grout line is shared by two tiles, so each tile accounts for half its perimeter: 0.1861 m.','The patio holds 20 ÷ 0.01 = 2,000 tiles, so 2,000 × 0.1861 ≈ 372.2 m. Squares would need 400.0 m.'],
   lab:{set:{job:'patio',shape:'hex'},look:'Read <b>Edge material for the job</b>.'},verify:[['edge',372.24,0.05]]},
  {id:'save',kind:'real',lvl:'honors',
   q:'A beekeeper’s comb has 4,000 cells of 0.25 cm² each. To the nearest 0.1%, how much less wall do hexagon cells need than square cells?',
   num:{ans:6.9,tol:0.1,unit:'%'},
   steps:['Square cells: side 0.5 cm, so each cell accounts for half of 2.0 cm of wall: 1.0 cm. 4,000 cells need 40.0 m.','Hexagon cells: P = 2√(6 × 0.25 × tan 30°) = 1.861 cm, half is 0.931 cm, so 4,000 cells need 37.2 m.','1 − 37.22 ÷ 40.00 ≈ 0.069, about 6.9% less wax. The percent is the same for any area, because both perimeters scale with √a.'],
   lab:{set:{job:'comb',shape:'hex'},look:'Read <b>Saved compared with squares</b>.'},verify:[['save',6.94,0.05],['edge',37.22,0.05]]},
  {id:'oct',kind:'test',lvl:'honors',
   q:'A floor uses regular octagons and squares, with two octagons and one square at every corner. Why does this work?',
   choices:['135° + 135° + 90° = 360°','120° + 120° + 120° = 360°','Octagons tile alone, and squares are decoration','108° + 108° + 144° = 360°'],correct:0,
   steps:['An octagon’s interior angle is 180 × 6 ÷ 8 = 135°.','Two octagons use 270°, leaving 90°, exactly one square corner.','So the corner adds to 360° with no gap, even though regular octagons cannot tile alone.']},
  {id:'side',kind:'test',lvl:'ap',
   q:'A regular hexagon tile has an area of 100 cm². To the nearest 0.01 cm, how long is each side?',
   num:{ans:6.20,tol:0.01,unit:'cm'},
   steps:['A regular hexagon is six equilateral triangles: A = (3√3 ÷ 2)s².','s² = 100 ÷ 2.598 = 38.49, so s ≈ 6.20 cm.','Check with the perimeter formula: P = 2√(6 × 100 × tan 30°) = 37.22 cm, and 37.22 ÷ 6 = 6.20 cm.'],
   lab:{set:{job:'patio',shape:'hex'},look:'Read <b>Side of one tile</b>.'},verify:[['side',6.204,0.005]]}
 ]
}
});
