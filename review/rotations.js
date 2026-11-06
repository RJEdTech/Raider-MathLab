BioLab.addReview({
rotations:{
 questions:[
  {id:'timesi',kind:'test',lvl:'bio',
   q:'The gripper is at 2 + 3i. The controller multiplies by i. Where does it land?',
   choices:['2 + 4i','−3 + 2i','3 − 2i','2i + 3'],correct:1,
   steps:['Distribute: (2 + 3i) · i = 2i + 3i².','Use i² = −1: 2i + 3(−1) = −3 + 2i.','Check: both points are √13 ≈ 3.61 squares from the base, and −3 + 2i is a quarter turn counterclockwise from 2 + 3i.'],
   lab:{set:{za:2,zb:3,w:'i',wc:0,wd:1,gx:-3,gy:2},look:'<b>Your pick is off by</b> reads 0 cm: the pick is on the landing spot.'},verify:[['miss',0,0.01]]},
  {id:'wifi',kind:'real',lvl:'bio',
   q:'A Wi-Fi receiver finds that every point in the signal arrived turned a quarter turn clockwise. What should it multiply every point by to turn them back?',
   choices:['−i','i','−1','2'],correct:1,
   steps:['A quarter turn clockwise is the same as multiplying by −i.','To undo it, turn a quarter turn counterclockwise: multiply by i.','Check: (−i)(i) = −i² = 1, so the two turns cancel.']},
  {id:'product',kind:'test',lvl:'honors',
   q:'Multiply (3 − i)(1 + i).',
   choices:['3 − i²','4 + 2i','2 + 4i','4 − 2i'],correct:1,
   steps:['FOIL: 3 + 3i − i − i².','Combine and use i² = −1: 3 + 2i + 1 = 4 + 2i.','Check with polar form: |3 − i| = √10 and |1 + i| = √2, so the product has modulus √20 = |4 + 2i|.'],
   lab:{set:{za:3,zb:-1,w:'1i',wc:1,wd:1,gx:4,gy:2},look:'Turn on <b>Show where it lands</b>. Your pick sits on the green spot.'},verify:[['miss',0,0.01]]},
  {id:'design',kind:'real',lvl:'honors',
   q:'The gripper is at 4, which is 40 cm straight out to the right. You need it at 2i: 20 cm straight up. What single command w does that?',
   choices:['2i','0.5i','−0.5i','0.5'],correct:1,
   steps:['The reach must go from 40 cm to 20 cm, so |w| = 0.5.','The angle must go from 0° to 90°, so w’s angle is 90°.','w = 0.5(cos 90° + i sin 90°) = 0.5i. Check: 4 · 0.5i = 2i.'],
   lab:{set:{za:4,zb:0,wc:0,wd:0.5,gx:0,gy:2},look:'Read <b>Stretch |w|</b> and <b>Turn</b>, and check that the miss is 0 cm.'},verify:[['miss',0,0.01],['stretch',0.5,0.001],['turn',90,0.01]]},
  {id:'argsum',kind:'test',lvl:'ap',
   q:'What is the argument of (1 + i)(1 + √3 i), in degrees?',
   num:{ans:105,tol:0.5,unit:'°'},
   steps:['arg(1 + i) = 45°, because the real and imaginary parts are equal.','arg(1 + √3 i) = arctan(√3) = 60°.','Arguments add: 45° + 60° = 105°.']},
  {id:'power',kind:'test',lvl:'ap',
   q:'What is the modulus of (2 + i)⁴?',
   num:{ans:25,tol:0.01,unit:''},
   steps:['|2 + i| = √(4 + 1) = √5.','By De Moivre’s theorem, the modulus of the 4th power is (√5)⁴ = 25.','Its argument is 4 × 26.57° ≈ 106.3°, so (2 + i)⁴ ≈ −7 + 24i. Check: √(49 + 576) = 25.']}
 ]
}
});
