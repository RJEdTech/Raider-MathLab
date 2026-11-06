BioLab.addReview({
gps:{
 questions:[
  {id:'time',kind:'test',lvl:'bio',
   q:'A tower’s signal takes 12 microseconds to reach a phone. Radio travels 0.2998 km per microsecond. How far away is the tower, to the nearest 0.01 km?',
   num:{ans:3.60,tol:0.01,unit:'km'},
   steps:['Distance = speed × time.','0.2998 km/µs × 12 µs ≈ 3.60 km.','So the phone is somewhere on a circle of radius 3.60 km around the tower.']},
  {id:'algebra',kind:'test',lvl:'honors',
   q:'Towers stand at (0, 0), (6, 0) and (0, 8) km. The phone is 5 km from each one. Where is it?',
   choices:['(3, 4)','(4, 3)','(3, 3)','(5, 5)'],correct:0,
   steps:['Circles: x² + y² = 25, (x − 6)² + y² = 25 and x² + (y − 8)² = 25.','Subtract the first from the second: −12x + 36 = 0, so x = 3.','Subtract the first from the third: −16y + 64 = 0, so y = 4. Check: 3² + 4² = 25. The phone is at (3, 4).']},
  {id:'map1',kind:'real',lvl:'honors',
   q:'On map 1, towers A (1.0, 1.0), B (8.6, 4.9) and C (7.2, 0.7) km measure distances of 3.54, 5.22 and 4.50 km. Where is the phone?',
   choices:['(3.60, 3.40) km','(4.47, 1.71) km','(5.00, 2.80) km','(3.40, 3.60) km'],correct:0,
   steps:['Circles A and B cross at two points: about (3.60, 3.40) and (4.47, 1.71).','Check each against circle C: (3.60, 3.40) is 4.50 km from C, but (4.47, 1.71) is only 2.92 km from C.','So the phone is at (3.60, 3.40) km.'],
   lab:{set:{map:1},act:'fix',look:'Read <b>Math fix</b>. Turn on <b>Use only towers A and B</b> to see the second crossing point.'},verify:[['fx',3.6,0.005],['fy',3.4,0.005],['dC',4.5,0.005]]},
  {id:'quake',kind:'real',lvl:'honors',
   q:'Seismograph stations sit at (0, 0), (100, 0) and (0, 100) km. They are 50.0, 80.6 and 67.1 km from an earthquake. Where is the epicenter?',
   choices:['(30, 40) km','(40, 30) km','(50, 50) km','(25, 25) km'],correct:0,
   steps:['Circles: x² + y² = 2500, (x − 100)² + y² = 6500 and x² + (y − 100)² = 4500 (using 80.6² ≈ 6500 and 67.1² ≈ 4500).','Subtract the first from the second: −200x + 10000 = 4000, so x = 30.','Subtract the first from the third: −200y + 10000 = 2000, so y = 40. The epicenter is at (30, 40) km.']},
  {id:'clock',kind:'test',lvl:'ap',
   q:'A receiver’s clock is off by 0.5 microseconds. By how many meters does that stretch every measured distance?',
   num:{ans:150,tol:1,unit:'m'},
   steps:['Light travels 299,792,458 m/s, or about 299.8 m per microsecond.','0.5 µs × 299.8 m/µs ≈ 150 m.','Every distance is too long by the same 150 m, which is why the receiver can treat the clock error as one more unknown and solve for it.'],
   lab:{set:{map:1,clk:0.5},look:'Read <b>Clock error as distance</b> and <b>Three-circle fix is off by</b>.'},verify:[['bias',149.9,0.1],['naive',29.9,0.2]]},
  {id:'four',kind:'test',lvl:'ap',
   q:'Why does a GPS receiver need at least four satellites to find its position?',
   choices:['It solves for four unknowns: x, y, z and its own clock error','One satellite is always behind the Earth','Each satellite gives only half a distance','Three satellites give two answers, and the fourth picks one'],correct:0,
   steps:['Each satellite gives one equation: the distance from the receiver to that satellite.','The receiver does not know x, y, z or exactly how far off its clock is: four unknowns.','Four unknowns need four equations, so four satellites.']}
 ]
}
});
