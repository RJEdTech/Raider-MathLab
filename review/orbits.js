BioLab.addReview({
orbits:{
 questions:[
  {id:'gallery',kind:'real',lvl:'bio',
   q:'The two foci of an elliptical whispering gallery are 18 m apart. You whisper at one focus. Where should your friend stand to hear you best?',
   choices:['Right next to you','At the center of the room, 9 m away','At the other focus, 18 m away','Against the wall farthest from you'],correct:2,
   steps:['Sound leaving one focus bounces off the elliptical wall toward the other focus.','All the bounced paths meet there, so the whisper is clearest at the other focus.','The foci are 18 m apart, so your friend stands 18 m away, on the long axis.']},
  {id:'focus',kind:'real',lvl:'honors',
   q:'In the lab, choose the whispering room with e = 0.6 (a = 15 m, b = 12 m) and stand at the right-hand focus. About how much of the reflected whisper reaches you there?',
   choices:['About 25%','About 50%','About 75%','All of it (100%)'],correct:3,
   steps:['c = √(15² − 12²) = √81 = 9 m, so the focus is 9 m right of center: 9 ÷ 15 = 60% of the way to the end.','Every path from the whisper’s focus reflects through this point.','So 100% of the reflected whisper passes within 0.5 m of you. At the center of the room, only about 8% does.'],
   lab:{set:{mode:'room',e:0.6,gx:60,gy:0,rays:true},look:'Read <b>Reflected wave reaching your spot</b>.'},verify:[['pct',100,0.01],['e',0.6,0.001]]},
  {id:'c',kind:'test',lvl:'honors',
   q:'An ellipse has a = 13 and b = 5. How far from the center is each focus?',
   num:{ans:12,tol:0.01,unit:''},
   steps:['c² = a² − b² = 169 − 25 = 144.','c = √144 = 12.','The foci are at (−12, 0) and (12, 0), almost at the ends: this ellipse is long and thin.']},
  {id:'ecc',kind:'test',lvl:'ap',
   q:'Same ellipse (a = 13, b = 5, c = 12). What is its eccentricity, to two decimal places?',
   num:{ans:0.92,tol:0.005,unit:''},
   steps:['e = c ÷ a = 12 ÷ 13.','e ≈ 0.923, or 0.92.','Close to 1 means very stretched. A circle has e = 0.']},
  {id:'stone',kind:'real',lvl:'honors',
   q:'A shock wave reflector is half of an ellipse with a = 10 cm and b = 8 cm, with the spark at one focus. How far from the spark must the kidney stone be?',
   num:{ans:12,tol:0.05,unit:'cm'},
   steps:['c = √(a² − b²) = √(100 − 64) = √36 = 6 cm.','The foci are 2c = 12 cm apart.','So the stone must sit 12 cm from the spark, on the long axis. In the lab, the stone at that focus catches about 71% of the shock wave: every ray that hits the half-ellipse reflector.'],
   lab:{set:{mode:'litho',e:0.6,gx:60,gy:0,rays:true},look:'Read <b>Reflected wave reaching your spot</b>.'},verify:[['pct',70.56,0.05]]},
  {id:'perigee',kind:'real',lvl:'ap',
   q:'A satellite’s orbit around Earth has a = 30,000 km and e = 0.6. Earth’s radius is 6,371 km. How high above the surface is the satellite at its lowest point?',
   num:{ans:5629,tol:1,unit:'km'},
   steps:['Earth’s center is at a focus, c = ae = 30,000 × 0.6 = 18,000 km from the center of the orbit.','The closest point is at the end of the long axis near that focus: a − c = a(1 − e) = 12,000 km from Earth’s center.','Altitude = 12,000 − 6,371 = 5,629 km. At the far end it is a(1 + e) − 6,371 = 41,629 km up.'],
   lab:{set:{mode:'orbit',e:0.6,gx:-60,gy:0},look:'Read <b>Lowest point, if the planet were at your spot</b>.'},verify:[['alt',5629,0.5]]},
  {id:'earth',kind:'real',lvl:'ap',
   q:'Earth’s orbit around the Sun has a ≈ 149.6 million km and e ≈ 0.0167. About how much farther from the Sun is Earth at its farthest point than at its closest?',
   num:{ans:5.0,tol:0.1,unit:'million km'},
   steps:['Closest: a(1 − e). Farthest: a(1 + e).','Difference = a(1 + e) − a(1 − e) = 2ae = 2c.','2 × 149.6 × 0.0167 ≈ 5.0 million km. That sounds like a lot, but it is only about 3% of the distance, so Earth’s orbit is nearly a circle.']}
 ]
}
});
