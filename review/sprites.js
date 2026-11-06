BioLab.addReview({
sprites:{
 questions:[
  {id:'refx',kind:'test',lvl:'bio',
   q:'Reflect the point (4, −3) across the x-axis. Where does it land?',
   choices:['(−4, −3)','(4, 3)','(−4, 3)','(−3, 4)'],correct:1,
   steps:['Reflecting across the x-axis keeps x and changes the sign of y: (x, y) → (x, −y).','(4, −3) → (4, 3).']},
  {id:'slide',kind:'real',lvl:'bio',
   q:'A game character’s tip is at (−6, 6). The game moves it with (x + 7, y − 3). Where does the tip land?',
   choices:['(1, 3)','(13, 3)','(1, 9)','(−13, 9)'],correct:0,
   steps:['Add 7 to x: −6 + 7 = 1.','Subtract 3 from y: 6 − 3 = 3.','The tip lands at (1, 3), and every other point of the sprite moves the same way.'],
   lab:{set:{move:'tr',sx:-6,sy:6},act:'show',look:'Read <b>Tip lands at x</b> and <b>y</b>.'},verify:[['ix',1,0.01],['iy',3,0.01]]},
  {id:'rot',kind:'test',lvl:'honors',
   q:'Rotate (3, 4) by 90° clockwise about the origin. Where does it land?',
   choices:['(−4, 3)','(4, −3)','(−3, −4)','(3, −4)'],correct:1,
   steps:['The rule for 90° clockwise is (x, y) → (y, −x).','(3, 4) → (4, −3).','Check: both points are 5 from the origin, and the point moved a quarter turn clockwise.'],
   lab:{set:{move:'r270',sx:3,sy:4},act:'show',look:'Read where the tip lands.'},verify:[['ix',4,0.01],['iy',-3,0.01]]},
  {id:'combo',kind:'real',lvl:'honors',
   q:'A character’s tip is at (−6, 6). It is reflected across the x-axis, then moved with (x + 5, y + 1). Where does the tip land, and where would it land in the other order?',
   choices:['(−1, −5); the other order gives (−1, −7)','(−1, −5); the other order gives the same','(1, −5); the other order gives (1, 5)','(−1, 7); the other order gives (−1, −5)'],correct:0,
   steps:['Reflect first: (−6, 6) → (−6, −6). Then translate: (−6 + 5, −6 + 1) = (−1, −5).','Translate first: (−1, 7). Then reflect: (−1, −7).','The two orders land 2 squares apart: 32 pixels at 16 pixels per square.'],
   lab:{set:{move:'c1',sx:-6,sy:6,swap:false},act:'show',look:'Read where the tip lands, then turn on <b>Swap the order</b> and apply the rule again.'},verify:[['ix',-1,0.01],['iy',-5,0.01]]},
  {id:'one',kind:'test',lvl:'ap',
   q:'Which single rule does the same as “rotate 90° counterclockwise about the origin, then reflect across the y-axis”?',
   choices:['(x, y) → (y, x)','(x, y) → (−y, −x)','(x, y) → (−x, y)','(x, y) → (y, −x)'],correct:0,
   steps:['Rotate: (x, y) → (−y, x).','Reflect across the y-axis: change the sign of the first coordinate: (−y, x) → (y, x).','That is a reflection across y = x.'],
   lab:{set:{move:'c2',sx:-6,sy:6,swap:false},act:'show',look:'The tip (−6, 6) should land at (6, −6).'},verify:[['ix',6,0.01],['iy',-6,0.01]]},
  {id:'dil',kind:'test',lvl:'ap',
   q:'The tip at (−6, 6) is dilated by ½ about the origin. To the nearest 0.01, how far from the origin is it afterward?',
   num:{ans:4.24,tol:0.01,unit:'units'},
   steps:['The rule is (x, y) → (x/2, y/2), so the tip lands at (−3, 3).','Its distance from the origin is √(3² + 3²) = √18 ≈ 4.24.','Before, it was √72 ≈ 8.49 away: exactly twice as far.'],
   lab:{set:{move:'half',sx:-6,sy:6},act:'show',look:'Read the distances from the origin before and after.'},verify:[['r1',4.243,0.005],['r0',8.485,0.005]]}
 ]
}
});
