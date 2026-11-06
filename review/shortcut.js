BioLab.addReview({
shortcut:{
 questions:[
  {id:'straight',kind:'real',lvl:'bio',
   q:'Your car is 120 m along the sidewalk and 40 m across a snowy field. You cut straight across from the door at 0.8 m/s. How long does it take, to the nearest 0.1 s?',
   num:{ans:158.1,tol:0.2,unit:'s'},
   steps:['Straight-line distance: √(120² + 40²) = √16,000 ≈ 126.5 m.','Time = 126.5 ÷ 0.8 ≈ 158.1 s.','The best route is longer but takes only 126.7 s.'],
   lab:{set:{field:'snow',D:120,W:40,x:0},act:'peek',look:'Read <b>Your walk takes</b>.'},verify:[['t',158.11,0.05]]},
  {id:'corner',kind:'real',lvl:'bio',
   q:'Same field. You walk the sidewalk 120 m at 1.4 m/s until you are straight across from the car, then 40 m of snow at 0.8 m/s. Total time?',
   num:{ans:135.7,tol:0.2,unit:'s'},
   steps:['Sidewalk: 120 ÷ 1.4 ≈ 85.7 s.','Snow: 40 ÷ 0.8 = 50.0 s.','Total ≈ 135.7 s: 9 s slower than turning at about 92 m.'],
   lab:{set:{field:'snow',D:120,W:40,x:120},act:'peek',look:'Read <b>Your walk takes</b>.'},verify:[['t',135.71,0.05]]},
  {id:'best',kind:'test',lvl:'honors',
   q:'T(x) = x/1.4 + √((120 − x)² + 40²)/0.8. Find the x that minimizes T, to the nearest meter.',
   num:{ans:92,tol:0.6,unit:'m'},
   steps:['T′(x) = 1/1.4 − (120 − x) / (0.8·√((120 − x)² + 1600)).','Set T′(x) = 0: (120 − x)/√((120 − x)² + 1600) = 0.8/1.4 ≈ 0.571.','Let u = 120 − x. Then u²/(u² + 1600) = 0.3265, so u² = 0.3265·1600/0.6735 ≈ 775.6 and u ≈ 27.9. So x ≈ 92.1 m.'],
   lab:{set:{field:'snow',D:120,W:40},act:'best',look:'Read <b>Best place to leave the sidewalk</b>.'},verify:[['xstar',92.15,0.05]]},
  {id:'mud',kind:'test',lvl:'honors',
   q:'The field is muddy grass at 1.0 m/s instead of snow. With the car 120 m along and 40 m across, where is the best place to leave the sidewalk?',
   choices:['About 66 m','About 79 m','About 92 m','About 106 m'],correct:1,
   steps:['sin φ = 1.0/1.4 ≈ 0.714, so tan φ = 0.714/√(1 − 0.510) ≈ 1.021.','120 − x* = 40 × 1.021 ≈ 40.8 m, so x* ≈ 79.2 m.','A faster field means you cut across sooner.'],
   lab:{set:{field:'mud',D:120,W:40},act:'best',look:'Read <b>Best place to leave the sidewalk</b>.'},verify:[['xstar',79.18,0.05]]},
  {id:'endpoint',kind:'ap',lvl:'ap',
   q:'The car is 60 m along and 40 m across a dry-grass field (1.3 m/s); the sidewalk is 1.4 m/s. On the closed interval 0 ≤ x ≤ 60, where is T(x) smallest?',
   choices:['At x = 0: cut across right away','At the critical point x ≈ 20 m','At x = 60 m','T has no minimum on this interval'],correct:0,
   steps:['The critical point solves 60 − x = 40·tan φ with sin φ = 1.3/1.4, so tan φ ≈ 2.50 and x ≈ 60 − 100 = −40 m. That is outside [0, 60].','T″(x) > 0 everywhere, so on [0, 60] T is increasing; compare the endpoints anyway: T(0) = √(60² + 40²)/1.3 ≈ 55.5 s and T(60) = 60/1.4 + 40/1.3 ≈ 73.6 s.','The minimum is at x = 0.'],
   lab:{set:{field:'grass',D:60,W:40},act:'best',look:'Read <b>Best place to leave the sidewalk</b> and the two endpoint times.'},verify:[['xstar',0,0.01],['t0',55.47,0.05]]},
  {id:'second',kind:'ap',lvl:'ap',
   q:'For T(x) = x/v₁ + √((D − x)² + W²)/v₂, T″(x) = W² / (v₂·((D − x)² + W²)^(3/2)). What does this tell you about the critical point?',
   choices:['It is a minimum, because T″ > 0 everywhere','It is a maximum, because T″ > 0','It could be either; you must check numbers','Nothing, because T″ does not depend on v₁'],correct:0,
   steps:['W² > 0 and the denominator is positive, so T″(x) > 0 for every x.','T is concave up everywhere, so any critical point is a minimum, and the only one.','This is why the closed interval method only ever has to compare that one critical point with the endpoints.']}
 ]
}
});
