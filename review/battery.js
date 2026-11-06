BioLab.addReview({
battery:{
 questions:[
  {id:'left',kind:'real',lvl:'bio',
   q:'At 2:10 pm your phone is at 38% and falling 0.12% per minute. If you keep doing the same thing, how many minutes until it hits 0%?',
   num:{ans:317,tol:2,unit:'min'},
   steps:['Time left = battery now ÷ drain rate.','38 ÷ 0.12 ≈ 316.7 minutes, about 5 h 17 min.','2:10 pm + 5 h 17 min ≈ 7:27 pm.'],
   lab:{set:{},act:'peek',look:'Read <b>Tangent line hits 0% at</b> and <b>Drain rate right now</b>.'},verify:[['rate',0.12,0.001]]},
  {id:'avg',kind:'real',lvl:'bio',
   q:'Your phone was at 82% at noon and 38% at 2:10 pm. What is its average drain rate over that time, to the nearest 0.01% per minute?',
   num:{ans:0.34,tol:0.01,unit:'% per min'},
   steps:['Average rate = change ÷ time = (82 − 38) ÷ 130 min.','44 ÷ 130 ≈ 0.34% per minute.','That average includes an hour of gaming, so it says nothing reliable about the rate right now.'],
   lab:{set:{},look:'Read <b>Average drain since noon</b>.'},verify:[['avg',0.3385,0.001]]},
  {id:'table',kind:'test',lvl:'honors',
   q:'Battery log: 12:50 pm, 67%. 1:00 pm, 62%. 1:10 pm, 57%. Estimate the derivative of the battery at 1:00 pm, in % per minute.',
   choices:['−0.25','−0.50','−5','+0.50'],correct:1,
   steps:['Symmetric difference: [B(1:10) − B(12:50)] ÷ 20 min.','(57 − 67) ÷ 20 = −10 ÷ 20 = −0.50% per minute.','The sign is negative because the battery is falling. This is the gaming stretch.']},
  {id:'lin',kind:'test',lvl:'honors',
   q:'At 3:00 pm a laptop is at 64% and B′(3:00) = −0.4% per minute. Use the tangent line to estimate the battery at 3:25 pm.',
   num:{ans:54,tol:0.1,unit:'%'},
   steps:['L(t) = B(a) + B′(a)(t − a).','L = 64 + (−0.4)(25) = 64 − 10 = 54%.','This forecast assumes the drain rate stays −0.4% per minute for those 25 minutes.']},
  {id:'concave',kind:'ap',lvl:'ap',
   q:'B(t) is the battery percent t minutes after noon. On an interval, B′(t) < 0 and B″(t) > 0. You use the tangent line at the start of the interval to estimate B later in the interval. Which is true?',
   choices:['The estimate is too high, because the curve is concave down','The estimate is too low, because the curve is concave up','The estimate is exact, because B is decreasing','You cannot tell without a formula'],correct:1,
   steps:['B″ > 0 means B is concave up: the slope is increasing (here, becoming less negative, so the drain is slowing).','A concave-up curve lies above its tangent lines.','So the tangent line underestimates the battery. In this tool, the tangent at 1:40 pm predicts 31.4% at 2:10 pm against the actual 38%.'],
   lab:{set:{from:100},act:'peek',look:'Read <b>Earlier tangent line predicts at 2:10 pm</b>.'},verify:[['lin',31.39,0.05]]},
  {id:'when',kind:'ap',lvl:'ap',
   q:'A phone at 52% at 4:00 pm drains at 0.2% per minute, and the rate is not changing. The tangent line gives the time it hits 0%. At what time is that, and is the forecast exact under these conditions?',
   choices:['8:20 pm, and exact, because a constant rate makes B linear','8:20 pm, but too early, because tangent lines always underestimate','6:36 pm, and exact','8:20 pm, but too late, because B is decreasing'],correct:0,
   steps:['Time left = 52 ÷ 0.2 = 260 minutes = 4 h 20 min, so 8:20 pm.','If B′ is constant, then B″ = 0 and B is a straight line, so the tangent line is the curve itself.','Tangent-line errors come from concavity, not from whether B is increasing or decreasing.']}
 ]
}
});
