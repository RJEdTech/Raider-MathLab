BioLab.addReview({
freethrow:{
 questions:[
  {id:'mirror',kind:'test',lvl:'bio',
   q:'A shot leaves the hands 7 ft high at the free-throw line. The top of its arc is 6 ft past the line. How far past the line is the ball 7 ft high again?',
   choices:['6 ft','12 ft','13 ft','14 ft'],correct:1,
   steps:['A parabola is symmetric about the vertical line through its top, x = 6.','The release is 6 ft before that line, so the matching point is 6 ft after it.','6 + 6 = 12 ft past the line.']},
  {id:'short',kind:'real',lvl:'bio',
   q:'Your arc tops out 13 ft high, 5.5 ft past the line, and you release at 7 ft. Where does the ball come down at rim height?',
   choices:['Through the center of the rim','About 4 ft short of the rim center','Long, off the backboard'],correct:1,
   steps:['Halfway to the rim is 6.875 ft, and your top is closer than that.','The ball starts 3 ft below the rim, so a top at or before halfway always comes down short.','The model puts it about 52 in short: more than 4 ft.'],
   lab:{set:{k:13,h:5.5,R:7,full:true},look:'Read <b>Miss at rim height</b>. Negative means short.'},verify:[['miss',-52.33,0.1]]},
  {id:'acoef',kind:'test',lvl:'honors',
   q:'A shot is released at (0, 7) and its vertex is (8, 14). Write the path as h(x) = a(x − 8)² + 14. What is a, to three decimal places?',
   num:{ans:-0.109,tol:0.001,unit:''},
   steps:['The release point is on the path: 7 = a(0 − 8)² + 14.','7 = 64a + 14, so 64a = −7.','a = −7/64 ≈ −0.109.'],
   lab:{set:{k:14,h:8,R:7},look:'Read <b>a in vertex form</b> at Deep dive.'},verify:[['a',-0.109375,0.0001]]},
  {id:'aim14',kind:'real',lvl:'honors',
   q:'You release at 7 ft and want a 14 ft arc. How far past the line must the top of the arc be for the ball to pass through the rim center (13.75, 10)?',
   num:{ans:7.83,tol:0.02,unit:'ft'},
   steps:['Both points fit h(x) = a(x − h)² + 14: 7 = ah² + 14 and 10 = a(13.75 − h)² + 14.','Divide: (13.75 − h)²/h² = 4/7, so (13.75 − h)/h = √(4/7) ≈ 0.756.','h = 13.75 / 1.756 ≈ 7.83 ft.'],
   lab:{set:{k:14,R:7,full:true},act:'aim',look:'Read <b>Top of the arc</b> in the controls, and check that the miss is 0 in.'},verify:[['miss',0,0.5],['launch',60.78,0.05]]},
  {id:'entry13',kind:'real',lvl:'ap',
   q:'A 13 ft arc released at 7 ft is aimed at the rim center, with its top 8.05 ft past the line. At what angle does it come down through rim height?',
   num:{ans:46.5,tol:0.3,unit:'°'},
   steps:['a = (7 − 13)/8.05² ≈ −0.0926.','The slope at x = 13.75 is 2a(13.75 − 8.05) ≈ 2(−0.0926)(5.70) ≈ −1.055.','The entry angle is arctan(1.055) ≈ 46.5° below horizontal.'],
   lab:{set:{k:13,R:7,full:true},act:'aim',look:'Read <b>Entry angle</b>.'},verify:[['entry',46.51,0.05]]},
  {id:'floor',kind:'test',lvl:'honors',
   q:'A path is h(x) = −0.2(x − 6)² + 14. If nothing were in the way, where would it hit the floor (a zero of h)? Round to 0.01 ft.',
   num:{ans:14.37,tol:0.02,unit:'ft'},
   steps:['Set h(x) = 0: −0.2(x − 6)² + 14 = 0, so (x − 6)² = 70.','x − 6 = ±√70 ≈ ±8.37.','The forward zero is x ≈ 14.37 ft. (The other, x ≈ −2.37, is behind the shooter, outside the path.)']}
 ]
}
});
