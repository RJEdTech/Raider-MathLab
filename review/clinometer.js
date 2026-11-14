BioLab.addReview({
clinometer:{
 questions:[
  {id:'tree',kind:'real',lvl:'bio',
   q:'Before a storm, your family wants to know if the cottonwood could hit the house. You stand 20 m from its base, your phone reads 38.5° to the top, and your eyes are 1.6 m up. How tall is the tree, to the nearest tenth of a meter?',
   num:{ans:17.5,tol:0.1,unit:'m'},
   steps:['Height above your eyes = 20 × tan 38.5° = 20 × 0.7954 = 15.9 m.','Add your eye height: 15.9 + 1.6 = 17.5 m.','If the house is closer than 17.5 m to the trunk, a fall could reach it.'],
   lab:{set:{obj:'tree',d:20,eye:1.6,reveal:true},look:'Read <b>Total height</b>.'},verify:[['H',17.51,0.03]]},
  {id:'forget',kind:'test',lvl:'bio',
   q:'You stand 15 m from the gym wall and read 28.7°. A friend says the wall is 15 × tan 28.7° = 8.2 m tall. What is wrong?',
   choices:['Nothing','They forgot to add the eye height; the wall is about 9.8 m','They should have used sin 28.7°','They should have divided by tan 28.7°'],correct:1,
   steps:['15 × tan 28.7° = 8.2 m is the height above your eyes.','The right triangle starts at eye level, not the ground.','Add about 1.6 m: 9.8 m.'],
   lab:{set:{obj:'gym',d:15,eye:1.6,reveal:true},look:'Compare <b>Total height</b> with <b>Answer if you forget your eye height</b>.'},verify:[['H',9.81,0.03]]},
  {id:'which',kind:'test',lvl:'bio',
   q:'In the triangle from your eye to the top of a pole, you know the distance along the ground and the angle. Which trig ratio gives the height?',
   choices:['tan θ = opposite ÷ adjacent','sin θ = opposite ÷ hypotenuse','cos θ = adjacent ÷ hypotenuse'],correct:0,
   steps:['The distance is next to the angle: the adjacent side.','The height is across from the angle: the opposite side.','The ratio that uses opposite and adjacent is tangent, so height = distance × tan θ.']},
  {id:'ladder',kind:'real',lvl:'honors',
   q:'A 16 ft ladder leans on a wall with its base 4 ft out. What angle does it make with the ground, to the nearest degree?',
   num:{ans:76,tol:0.6,unit:'°'},
   steps:['The ladder is the hypotenuse (16 ft) and the base is the adjacent side (4 ft).','cos θ = 4 ÷ 16 = 0.25.','θ = cos⁻¹(0.25) = 75.5°, about 76°: the 4-to-1 ladder rule.']},
  {id:'steep',kind:'test',lvl:'honors',
   q:'From 10 m away the top of a light tower is at 66°. A student estimates the height above their eyes as 10 × 66 ÷ 45 = 14.7 m, “because 45° means equal sides.” What is the real height above their eyes?',
   choices:['About 14.7 m','About 22.5 m','About 9.1 m','About 66 m'],correct:1,
   steps:['Angle and height are not proportional.','10 × tan 66° = 10 × 2.246 = 22.5 m.','tan grows faster and faster as the angle gets steep: 45° gives 10 m, but 66° gives 22.5 m, not 14.7.']},
  {id:'error',kind:'test',lvl:'ap',
   q:'You measure a pole from 20 m at 30°. Using ΔH ≈ d·sec²θ·Δθ, about how far off is your height if the reading is 2° too high?',
   num:{ans:0.93,tol:0.04,unit:'m'},
   steps:['sec²30° = 1 ÷ cos²30° = 1 ÷ 0.75 = 1.333.','Δθ = 2° = 0.0349 rad.','ΔH ≈ 20 × 1.333 × 0.0349 = 0.93 m too tall.']}
 ]
}
});
