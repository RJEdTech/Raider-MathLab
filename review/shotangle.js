BioLab.addReview({
shotangle:{
 questions:[
  {id:'lane10',kind:'test',lvl:'honors',
   q:'A soccer goal is 7.32 m wide, so each post is 3.66 m from the center. You run a lane 10 m to the side of the goal’s center. How far out from the goal line is the best spot to shoot from?',
   num:{ans:9.31,tol:0.05,unit:'m'},
   steps:['The best spot is where a circle through both posts just touches your lane. That circle has radius 10 m (your lane distance), and its center is on the goal’s centerline.','Its center is √(10² − 3.66²) = √(100 − 13.40) = √86.60 out from the goal line.','So y* ≈ 9.31 m.'],
   lab:{set:{sport:'soccer',lane:10},act:'best',look:'Read <b>Best spot on this lane</b> and <b>Best possible window</b>.'},verify:[['ystar',9.31,0.02]]},
  {id:'window',kind:'test',lvl:'honors',
   q:'Same lane, 10 m from center, but you shoot from 20 m out. To the nearest 0.1°, how much of your view does the goal fill?',
   num:{ans:16.7,tol:0.1,unit:'°'},
   steps:['Angle to the far post: atan(13.66 ÷ 20) = 34.33°.','Angle to the near post: atan(6.34 ÷ 20) = 17.59°.','Window = 34.33° − 17.59° ≈ 16.7°. At the best spot (9.3 m out) it would be 21.5°.'],
   lab:{set:{sport:'soccer',lane:10,y:20},look:'Read <b>Goal window</b>.'},verify:[['deg',16.74,0.05]]},
  {id:'inscribed',kind:'test',lvl:'honors',
   q:'Two points on a circle mark an arc with a central angle of 80°. A third point on the circle, outside that arc, looks at the two points. What angle does it see?',
   choices:['20°','40°','80°','160°'],correct:1,
   steps:['An inscribed angle is half the central angle of the arc it intercepts.','80° ÷ 2 = 40°, from every point on the circle outside that arc. That is why the circles in this tool are circles of equal angle.']},
  {id:'rugby',kind:'real',lvl:'bio',
   q:'A rugby try is scored 25 m to the side of the posts’ center. The kicker must kick from somewhere on the line straight back from that spot. About where does the angle peak?',
   choices:['About 5 m back','About 12 m back','About 25 m back','The farther back, the better'],correct:2,
   steps:['The best spot is √(c² − a²) out: √(25² − 2.8²) ≈ 24.8 m.','Out wide, the posts are so close together compared with the lane distance that the best spot is almost exactly the lane distance.','Even there the window is only about 6.4°, which is why wide conversions are hard.'],
   lab:{set:{sport:'rugby',lane:25},act:'best',look:'Read <b>Best spot on this lane</b> and the window.'},verify:[['ystar',24.84,0.05]]},
  {id:'which',kind:'real',lvl:'bio',
   q:'You are on a lane 12 m from the goal’s center, 24 m out. A teammate yells “Shoot now!” Another yells “Keep going!” Using only the angle, who is right, and until when?',
   choices:['Shoot now: the window only shrinks from here','Keep going, but only until about 11 m out','Keep going all the way to the goal line','It makes no difference'],correct:1,
   steps:['At 24 m out the window is about 14.0°.','It grows as you run in, peaking at about 17.8° around 11.4 m out.','Past that it shrinks again: at 3 m out it is about 8.9°. So keep going, but not too far.'],
   lab:{set:{sport:'soccer',lane:12,y:24},look:'Drag <b>Shoot from</b> toward the goal and watch the window.'},verify:[['deg',13.96,0.05]]}
 ]
}
});
