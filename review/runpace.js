BioLab.addReview({
runpace:{
 questions:[
  {id:'tensec',kind:'real',lvl:'bio',
   q:'Your app logged you at 1,863.1 m along the course at 9:00 and at 1,890.3 m at 9:10. What was your average speed over those 10 seconds, to the nearest 0.01 m/s?',
   num:{ans:2.73,tol:0.02,unit:'m/s'},
   steps:['Average speed = distance covered ÷ time.','1,890.3 − 1,863.1 = 27.2 m in 10 s, so about 2.72 to 2.73 m/s (the unrounded positions give 2.73).','Over such a short interval, that is very close to your speed right at 9:00, which is 2.72 m/s.'],
   lab:{set:{when:'t9',win:10},act:'peek',look:'Read <b>Average speed over the interval</b>.'},verify:[['sec',2.73,0.01]]},
  {id:'pace3',kind:'test',lvl:'honors',
   q:'Your app says 3.0 m/s. What pace is that in minutes per mile? (1 mile = 1,609.344 m)',
   choices:['7:56','8:36','8:56','9:16'],correct:2,
   steps:['Seconds per mile = 1,609.344 ÷ 3.0 = 536.4 s.','536.4 s = 8 minutes and 56.4 seconds, so a pace of about 8:56 per mile.','Pace and speed are reciprocals: a higher speed means a smaller pace.']},
  {id:'symm',kind:'test',lvl:'honors',
   q:'The log shows 1,835.8 m at 8:50 and 1,890.3 m at 9:10. Use the readings on both sides of 9:00 to estimate your speed at 9:00.',
   num:{ans:2.72,tol:0.01,unit:'m/s'},
   steps:['A symmetric difference uses equal time on both sides: [s(9:10) − s(8:50)] ÷ 20 s.','(1,890.3 − 1,835.8) ÷ 20 = 54.5 ÷ 20 ≈ 2.72 m/s.','Centering the interval on the moment usually beats a one-sided interval of the same total length, because the speeding up and slowing down on the two sides partly cancel.']},
  {id:'water',kind:'real',lvl:'honors',
   q:'Over the 4 minutes after you pass the water stop, your average is 3.43 m/s. You slowed down to grab a cup right at the table. What was your speed right at the table?',
   num:{ans:2.23,tol:0.02,unit:'m/s'},
   steps:['Shrink the interval: 3.43 m/s over 240 s, 3.32 m/s over 60 s, 2.59 m/s over 10 s, 2.25 m/s over 2 s, 2.23 m/s over 1 s.','The averages settle on about 2.23 m/s, a pace of 12:02 per mile.','The 30-second slowdown is almost invisible in a 4-minute average.'],
   lab:{set:{when:'water'},act:'peek',look:'Read <b>Speed right at that moment</b>, then drag the interval from 240 s down to 1 s.'},verify:[['now',2.229,0.005]]},
  {id:'limdef',kind:'ap',lvl:'ap',
   q:'A runner’s position is s(t) = 2.8t + 0.0004t² meters, with t in seconds. Use the limit definition of the derivative to find the runner’s speed at t = 500 s.',
   num:{ans:3.2,tol:0.01,unit:'m/s'},
   steps:['s(500 + h) − s(500) = 2.8h + 0.0004[(500 + h)² − 500²] = 2.8h + 0.0004(1000h + h²) = 3.2h + 0.0004h².','Divide by h: 3.2 + 0.0004h.','Take the limit as h → 0: s′(500) = 3.2 m/s. The runner is speeding up, since s′(t) = 2.8 + 0.0008t grows with t.']},
  {id:'noise',kind:'ap',lvl:'ap',
   q:'Each GPS reading can be off by up to 4 m. You want the app’s speed to be off by at most 0.5 m/s, even in the worst case. What is the shortest interval the app can average over?',
   num:{ans:16,tol:0.5,unit:'s'},
   steps:['Worst case, the two readings are off by 4 m in opposite directions: 8 m of error in the distance.','Speed error = 8 ÷ h. Set 8 ÷ h ≤ 0.5, so h ≥ 16 s.','A longer interval tames the noise but mixes in more of your speed changing. Real apps balance the two.']}
 ]
}
});
