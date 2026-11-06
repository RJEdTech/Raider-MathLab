BioLab.addReview({
coaster:{
 questions:[
  {id:'planb',kind:'real',lvl:'bio',
   q:'Plan B: the track is 72 ft up at x = 0, enters a tunnel at 30 ft, comes out at 60 ft, and dives into a second tunnel at 150 ft. Which form should the track’s equation take?',
   choices:['y = a(x + 30)(x + 60)(x + 150)','y = a(x − 30)(x − 60)(x − 150)','y = a(x − 72)(x − 30)(x − 60)','y = 72x³ − 30x² − 60x − 150'],correct:1,
   steps:['The track is at ground level (y = 0) at x = 30, 60 and 150, so those are the zeros.','Each zero r gives a factor (x − r).','So y = a(x − 30)(x − 60)(x − 150), and the start height 72 ft will fix a.'],
   lab:{set:{design:'B'},act:'build',look:'Read <b>Track height at x = 0</b> and <b>Worst miss</b>.'},verify:[['start',72,0.001],['miss',0,0.001]]},
  {id:'h100',kind:'real',lvl:'honors',
   q:'For Plan A, y = a(x − 30)(x − 75)(x − 150) with a = −80/337,500. How high is the track 100 ft along? (This sets the height of the support post there.)',
   num:{ans:20.7,tol:0.1,unit:'ft'},
   steps:['Plug in x = 100: (100 − 30)(100 − 75)(100 − 150) = 70 × 25 × (−50) = −87,500.','Multiply by a: (−80/337,500) × (−87,500) ≈ 20.74.','The post at 100 ft must reach about 20.7 ft.'],
   lab:{set:{design:'A',probe:100},act:'build',look:'Read <b>Height at the reading point</b>.'},verify:[['hprobe',20.74,0.01]]},
  {id:'build',kind:'test',lvl:'honors',
   q:'A cubic has zeros at 20, 60 and 140 and passes through (0, 84). What is a in y = a(x − 20)(x − 60)(x − 140)?',
   choices:['0.0005','−0.0005','84','−0.5'],correct:1,
   steps:['At x = 0: a(−20)(−60)(−140) = 84.','(−20)(−60)(−140) = −168,000, so −168,000a = 84.','a = −84/168,000 = −0.0005.']},
  {id:'degree',kind:'test',lvl:'honors',
   q:'A track profile needs three hills and two dips, so five turning points. What is the lowest degree a single polynomial for it can have?',
   choices:['4','5','6','7'],correct:2,
   steps:['A polynomial of degree n has at most n − 1 turning points.','Five turning points need n − 1 ≥ 5.','So the degree must be at least 6.']},
  {id:'dip',kind:'test',lvl:'ap',
   q:'For Plan A, y′(x) = a(3x² − 510x + 18,000). The dip is at x = 50. How far below ground is the track there?',
   num:{ans:-11.9,tol:0.1,unit:'ft'},
   steps:['Check: 3(50)² − 510(50) + 18,000 = 7,500 − 25,500 + 18,000 = 0, so x = 50 is a turning point.','y(50) = a(20)(−25)(−100) = 50,000a.','50,000 × (−80/337,500) ≈ −11.85, so the track bottoms out about 11.9 ft underground.'],
   lab:{set:{design:'A',probe:50},act:'build',look:'Read <b>Height at the reading point</b>.'},verify:[['hprobe',-11.85,0.01]]},
  {id:'steep',kind:'real',lvl:'ap',
   q:'For Plan A, how steep is the steepest drop between x = 0 and x = 150, to the nearest 0.1°?',
   num:{ans:76.8,tol:0.1,unit:'°'},
   steps:['y′(x) = a(3x² − 510x + 18,000) with a < 0. It is a downward-opening parabola in x, so on 0 ≤ x ≤ 150 it is most negative at an endpoint.','y′(0) = 18,000a ≈ −4.27 and y′(150) = 9,000a ≈ −2.13 (at its vertex, x = 85, the track is climbing, not dropping).','The steepest drop is at x = 0: arctan(4.27) ≈ 76.8°.'],
   lab:{set:{design:'A'},act:'build',look:'Read <b>Steepest drop</b>.'},verify:[['steep',76.81,0.05]]}
 ]
}
});
