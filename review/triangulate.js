BioLab.addReview({
triangulate:{
 questions:[
  {id:'third',kind:'real',lvl:'bio',
   q:'Tower A reads 55° and tower B reads 65°. What angle do the two sight lines make where they meet at the fire?',
   num:{ans:60,tol:0,unit:'°'},
   steps:['The road and the two sight lines make a triangle.','Its angles add to 180°.','180° − 55° − 65° = 60°.'],
   lab:{set:{al:55,be:65},look:'Read <b>Angle at the fire</b>.'},verify:[['fang',60,0]]},
  {id:'sines',kind:'test',lvl:'honors',
   q:'The towers are 12 km apart. Tower A reads 48° and tower B reads 63°. To the nearest 0.01 km, how far is the fire from tower A?',
   num:{ans:11.45,tol:0.02,unit:'km'},
   steps:['The angle at the fire is 180° − 48° − 63° = 69°.','Law of sines: AF / sin 63° = 12 / sin 69°.','AF = 12 × 0.8910 ÷ 0.9336 ≈ 11.45 km.'],
   lab:{set:{al:48,be:63,d:12,lines:true},look:'Read <b>Tower A to the fire</b>.'},verify:[['af',11.45,0.01]]},
  {id:'river',kind:'real',lvl:'honors',
   q:'You need the width of a river. You mark two spots A and B on your bank, 100 m apart. A tree on the far bank is 70° from the bank line at A and 60° at B. How wide is the river, to the nearest meter?',
   num:{ans:106,tol:1,unit:'m'},
   steps:['The angle at the tree is 180° − 70° − 60° = 50°.','Law of sines: AT = 100 · sin 60° ÷ sin 50° ≈ 113.05 m.','The width is the tree’s distance straight out from your bank: 113.05 · sin 70° ≈ 106.2 m, so about 106 m.'],
   lab:{set:{d:10,al:70,be:60,lines:true},look:'Here the towers are 10 km apart: the same triangle shape, 100 times bigger. Read <b>Fire is this far north of the towers</b> (10.62 km) and scale it back down to 106.2 m.'},verify:[['north',10.62,0.01]]},
  {id:'cabin',kind:'real',lvl:'honors',
   q:'The fire is 7.66 km east and 8.51 km north of tower A. Your family’s cabin is 10 km east and 11 km north of tower A. How far is the fire from the cabin, to the nearest 0.1 km? Is that within 5 km?',
   num:{ans:3.4,tol:0.05,unit:'km'},
   steps:['East difference: 10 − 7.66 = 2.34 km. North difference: 11 − 8.51 = 2.49 km.','The two differences are the legs of a right triangle, so use the Pythagorean theorem: √(2.34² + 2.49²) = √(5.48 + 6.20) = √11.68.','√11.68 ≈ 3.4 km, which is within 5 km.'],
   lab:{set:{al:48,be:63,d:12,lines:true},look:'Read <b>Fire to your cabin</b>.'},verify:[['cabin',3.41,0.01]]},
  {id:'asa',kind:'test',lvl:'honors',
   q:'Why do two angles and the side between them (ASA) fix exactly one triangle?',
   choices:['Because every triangle is equilateral','Because the side fixes where the two angles start, and the two rays from its ends can cross at only one point','Because the angles must be equal','They don’t: two different triangles always fit'],correct:1,
   steps:['The known side sets the two endpoints.','Each known angle sets the direction of a ray from one endpoint.','Two rays that are not parallel cross at exactly one point, so the third corner, and the whole triangle, is fixed.']},
  {id:'heli',kind:'real',lvl:'ap',
   q:'Towers 12 km apart read 48° and 63°, so the fire is 11.45 km from tower A. The helibase is on the road 17 km east of tower A. How far is the flight from the helibase to the fire, to the nearest 0.01 km?',
   num:{ans:12.63,tol:0.02,unit:'km'},
   steps:['In the triangle tower A, helibase, fire, you know two sides (17 km and 11.45 km) and the angle between them, 48°.','Law of cosines: HF² = 17² + 11.45² − 2 · 17 · 11.45 · cos 48° ≈ 289 + 131.17 − 260.56 = 159.61.','HF ≈ √159.61 ≈ 12.63 km.'],
   lab:{set:{al:48,be:63,d:12,lines:true},look:'Read <b>Helicopter flight from the helibase</b>.'},verify:[['heli',12.63,0.01]]},
  {id:'hikers',kind:'test',lvl:'ap',
   q:'Two hikers leave camp on straight trails 70° apart. One walks 6 km and the other walks 10 km. How far apart are they, to the nearest 0.01 km?',
   num:{ans:9.74,tol:0.02,unit:'km'},
   steps:['Two sides and the angle between them (SAS) call for the law of cosines.','d² = 6² + 10² − 2 · 6 · 10 · cos 70° = 136 − 41.04 = 94.96.','d ≈ √94.96 ≈ 9.74 km.']}
 ]
}
});
