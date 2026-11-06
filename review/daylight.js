BioLab.addReview({
daylight:{
 questions:[
  {id:'midline',kind:'real',lvl:'bio',
   q:'Denver’s longest day has 14.99 hours of daylight and its shortest has 9.35 hours. What is the midline of the daylight curve, in hours?',
   num:{ans:12.17,tol:0.02,unit:'h'},
   steps:['The midline is the average of the max and the min.','(14.99 + 9.35) ÷ 2 = 24.34 ÷ 2 = 12.17 hours.','That is about 12 h 10 min: the daylight near the equinoxes.'],
   lab:{set:{case:'day',city:'denver'},act:'fit',look:'Read the midline on the <b>Midline D</b> slider and the fit’s error in <b>Your curve’s average error</b>.'},verify:[['errMin',4.29,0.05]]},
  {id:'amp',kind:'test',lvl:'bio',
   q:'In Seattle the longest day is about 16.0 hours and the shortest is about 8.4 hours. What is the amplitude of Seattle’s daylight curve?',
   num:{ans:3.8,tol:0.05,unit:'h'},
   steps:['The amplitude is half the distance from max to min.','(16.0 − 8.4) ÷ 2 = 7.6 ÷ 2 = 3.8 hours.','Denver’s amplitude is about 2.8 hours: farther from the equator, the seasons swing harder.']},
  {id:'wheel',kind:'test',lvl:'honors',
   q:'A Ferris wheel is 50 m across, its lowest seat is 3 m up, and one turn takes 10 min. You board at the bottom at t = 0. In h = 25 sin((2π/10)(t − C)) + 28, what is C, in minutes?',
   num:{ans:2.5,tol:0.01,unit:'min'},
   steps:['You reach the top halfway through a turn: t = 5 min.','A sine curve peaks a quarter period after it crosses the midline going up.','C = 5 − 10 ÷ 4 = 2.5 min. Check: at t = 0, 25 sin(−π/2) + 28 = 3 m.'],
   lab:{set:{case:'wheel',wA:25,wD:28,wC:2.5,wP:10},look:'Your curve lands on every dot: the average error reads 0.00 m.'},verify:[['errM',0,0.001]]},
  {id:'tide',kind:'real',lvl:'honors',
   q:'High tide is at 3:00 a.m. and the tide’s period is 12.42 hours. How many hours after midnight is the next high tide?',
   num:{ans:15.42,tol:0.02,unit:'h'},
   steps:['The next high tide is one period later.','3 + 12.42 = 15.42 hours after midnight.','0.42 h × 60 ≈ 25 min, so about 3:25 p.m.'],
   lab:{set:{case:'tide',tA:1.1,tD:1.6,tC:12.315,tP:12.42},look:'This curve matches the tide exactly. Find its second peak.'},verify:[['errM',0,0.001]]},
  {id:'bval',kind:'test',lvl:'ap',
   q:'A tide repeats every 12.42 hours. To the nearest 0.001, what is B in y = A sin(B(t − C)) + D, with t in hours?',
   num:{ans:0.506,tol:0.002,unit:''},
   steps:['The period is 2π ÷ B.','So B = 2π ÷ 12.42.','B ≈ 6.2832 ÷ 12.42 ≈ 0.506 radians per hour.'],
   lab:{set:{case:'tide',tA:1.1,tD:1.6,tC:12.315,tP:12.42},look:'Read <b>B = 2π ÷ your period</b>.'},verify:[['B',0.5059,0.0002]]},
  {id:'apr15',kind:'test',lvl:'ap',
   q:'Use the model y = 2.82 sin((2π/365)(t − 81.75)) + 12.17 to predict Denver’s daylight on April 15 (day 105), to the nearest 0.01 hour.',
   num:{ans:13.27,tol:0.02,unit:'h'},
   steps:['t − C = 105 − 81.75 = 23.25 days.','(2π/365) × 23.25 ≈ 0.400 radians, and sin 0.400 ≈ 0.389.','y ≈ 2.82 × 0.389 + 12.17 ≈ 13.27 hours, about 13 h 16 min. The CBM model gives 13.21 hours, so the sine fit is about 3 minutes high that day.']}
 ]
}
});
