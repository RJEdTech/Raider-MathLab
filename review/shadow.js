BioLab.addReview({
shadow:{
 questions:[
  {id:'pole',kind:'real',lvl:'bio',
   q:'You are 6 ft tall and your shadow is 4 ft long. At the same moment, a flagpole’s shadow is 20 ft long. How tall is the flagpole?',
   num:{ans:30,tol:0.1,unit:'ft'},
   steps:['Your height ÷ your shadow = 6 ÷ 4 = 1.5.','The flagpole’s triangle is similar, so its height ÷ shadow is also 1.5.','Height = 1.5 × 20 = 30 ft.'],
   lab:{set:{method:'shadow',you:6,ys:4,ts:20},look:'Read the <b>Scale factor</b>, then lock in a guess to see the height.'},verify:[['ratio',1.5,0.001]]},
  {id:'prop',kind:'test',lvl:'bio',
   q:'Solve the proportion x ÷ 12 = 5 ÷ 3.',
   num:{ans:20,tol:0.01,unit:''},
   steps:['Multiply both sides by 12: x = 12 × 5 ÷ 3.','12 × 5 = 60, and 60 ÷ 3 = 20.','x = 20.']},
  {id:'mirror',kind:'real',lvl:'honors',
   q:'Your eyes are 5.2 ft above the ground. You see the top of a building in a mirror on the ground when you stand 2.6 ft from the mirror. The mirror is 35 ft from the building. How tall is the building?',
   num:{ans:70,tol:0.1,unit:'ft'},
   steps:['Light leaves the mirror at the same angle it arrives, so the two right triangles are similar (AA).','Eye height ÷ your distance = 5.2 ÷ 2.6 = 2.','Building = 2 × 35 = 70 ft.'],
   lab:{set:{method:'mirror',eye:5.2,a:2.6,b:35},look:'Read the <b>Scale factor</b>.'},verify:[['ratio',2,0.001]]},
  {id:'scale',kind:'test',lvl:'honors',
   q:'A right triangle has legs 3 and 4 and hypotenuse 5. A similar triangle has hypotenuse 15. What are its legs?',
   choices:['5 and 6','9 and 12','13 and 14','6 and 8'],correct:1,
   steps:['The scale factor is 15 ÷ 5 = 3.','Multiply every side by 3: 3 × 3 = 9 and 4 × 3 = 12.','Check: 9² + 12² = 81 + 144 = 225 = 15².']},
  {id:'earth',kind:'real',lvl:'ap',
   q:'Two cities are 800 km apart, one due north of the other. At noon on the same day, the sun’s rays meet the ground at angles that differ by 7.2°. Assuming Earth is a sphere, estimate its circumference in km.',
   num:{ans:40000,tol:1,unit:'km'},
   steps:['The sun’s rays are parallel, so the 7.2° difference equals the angle between the two cities at Earth’s center.','7.2° is 7.2 ÷ 360 = 1/50 of a circle, so 800 km is 1/50 of the circumference.','Circumference = 50 × 800 = 40,000 km.']},
  {id:'angle',kind:'test',lvl:'ap',
   q:'A 5.5 ft person casts a 4 ft shadow. To the nearest 0.1°, what is the sun’s angle above the horizon?',
   num:{ans:54.0,tol:0.05,unit:'°'},
   steps:['The person and the shadow are the legs of a right triangle.','tan θ = 5.5 ÷ 4 = 1.375.','θ = tan⁻¹(1.375) ≈ 54.0°.'],
   lab:{set:{method:'shadow',you:5.5,ys:4},look:'At <b>Closer look</b>, read <b>Angle above the ground</b>.'},verify:[['sun',53.973,0.01]]}
 ]
}
});
