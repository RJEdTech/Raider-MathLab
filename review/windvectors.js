BioLab.addReview({
windvectors:{
 questions:[
  {id:'ferry',kind:'real',lvl:'bio',
   q:'A ferry moves at 18 km/h through the water and points straight across a 1.5 km river. The current flows downstream at 5.4 km/h. How far downstream of the far dock does it reach the other side?',
   num:{ans:450,tol:5,unit:'m'},
   steps:['Crossing takes 1.5 km ÷ 18 km/h = 1/12 hour (5 minutes). The current does not change that.','In that time the current carries it 5.4 km/h × 1/12 h = 0.45 km sideways.','0.45 km = 450 m downstream. To land at the dock, it must aim upstream.'],
   lab:{set:{craft:'boat',wpct:30,hdg:0},look:'Read <b>Your heading misses the target by</b> (in km).'},verify:[['miss',0.45,0.001]]},
  {id:'wca1',kind:'test',lvl:'honors',
   q:'A plane flies at 120 km/h. The wind blows straight across its course at 30 km/h. To the nearest 0.1°, how far into the wind must it point?',
   num:{ans:14.5,tol:0.1,unit:'°'},
   steps:['The plane’s own sideways speed must cancel the wind: 120 sin(WCA) = 30.','sin(WCA) = 30 ÷ 120 = 0.25.','WCA = arcsin 0.25 ≈ 14.5°.']},
  {id:'gs1',kind:'test',lvl:'honors',
   q:'Same plane (120 km/h, 30 km/h crosswind, pointed 14.5° into the wind). What is its speed over the ground, to the nearest 0.1 km/h?',
   num:{ans:116.2,tol:0.15,unit:'km/h'},
   steps:['Split the plane’s velocity: 120 sin 14.48° = 30 km/h sideways (cancels the wind) and 120 cos 14.48° forward.','A pure crosswind adds nothing forward, so ground speed = 120 cos 14.48°.','120 × 0.9682 ≈ 116.2 km/h. Fighting the crosswind costs some forward speed.']},
  {id:'drone',kind:'real',lvl:'honors',
   q:'In the lab, choose the drone (54 km/h, 600 m course) with the wind at 30% of its speed from 270°. What wind correction angle flies it straight to the landing pad, and how long does the trip take?',
   choices:['17.5° left, 0.70 min (42 s)','17.5° right, 0.70 min (42 s)','16.2° left, 0.67 min (40 s)','30° left, 0.95 min (57 s)'],correct:0,
   steps:['The wind is 0.30 × 54 = 16.2 km/h from the west, all of it crosswind, pushing right.','sin(WCA) = 16.2 ÷ 54 = 0.3, so WCA = 17.5°, turned left into the wind.','Ground speed = 54 cos 17.46° ≈ 51.5 km/h, so 0.6 km takes 0.6 ÷ 51.5 × 60 ≈ 0.70 minutes, about 42 seconds.'],
   lab:{set:{craft:'drone',wpct:30,wdir:270},look:'Read <b>Wind correction angle</b> and <b>Trip time with the right heading</b>.'},verify:[['wca',-17.46,0.01],['tbest',0.699,0.001]]},
  {id:'plane',kind:'real',lvl:'ap',
   q:'A small plane flies at 200 km/h to an airport due north. The wind is 40 km/h from 300°. Find the wind correction angle and the ground speed.',
   choices:['10.0° left, 177 km/h','10.0° right, 177 km/h','11.5° left, 200 km/h','10.0° left, 217 km/h'],correct:0,
   steps:['The wind blows toward 120°: east component 40 sin 120° ≈ 34.6 km/h, north component 40 cos 120° = −20 km/h (a headwind).','sin(WCA) = 34.6 ÷ 200 ≈ 0.173, so WCA ≈ 10.0°, turned left into the wind.','Ground speed = 200 cos 10.0° − 20 ≈ 197.0 − 20 ≈ 177 km/h.'],
   lab:{set:{craft:'plane',wpct:20,wdir:300},look:'Read <b>Wind correction angle</b>, <b>Crosswind component</b> and <b>Ground speed on the right heading</b>.'},verify:[['wca',-9.97,0.01],['gs',176.98,0.02],['cross',34.64,0.01]]},
  {id:'sum',kind:'test',lvl:'ap',
   q:'A plane heads due north at 100 km/h. The wind blows 20 km/h toward the east and 15 km/h toward the south. What is the plane’s ground speed, to the nearest 0.1 km/h?',
   num:{ans:87.3,tol:0.1,unit:'km/h'},
   steps:['Add components: east 0 + 20 = 20 km/h; north 100 − 15 = 85 km/h.','Ground speed = √(20² + 85²) = √7,625.','√7,625 ≈ 87.3 km/h, on a track about 13.2° east of north (arctan(20 ÷ 85)).']}
 ]
}
});
