BioLab.addReview({
viewcurve:{
 questions:[
  {id:'steep',kind:'real',lvl:'bio',
   q:'Your club’s video had 2,400 views at hour 20 and 4,729 at hour 34. A friend says, “It was taking off most at hour 34, since that is when it had the most views.” What is wrong with that?',
   choices:['Nothing: more views means faster growth','Fastest growth means the most views gained per hour, which peaked at hour 20; by hour 34 growth had slowed a lot','Views cannot be compared across hours'],correct:1,
   steps:['How fast views grow is the steepness of the total-views curve, not its height.','At hour 20 the video was gaining about 360 views an hour. At hour 34 it was gaining only about 21 an hour.','The total is bigger at hour 34, but the takeoff was long over.'],
   lab:{set:{at:34},act:'peek',look:'Read <b>Views per hour at that hour</b>, then set the hour to 20.'},verify:[['rate',20.96,0.05]]},
  {id:'peakread',kind:'real',lvl:'bio',
   q:'Using the model, how many views per hour was the video gaining at its fastest?',
   num:{ans:360,tol:2,unit:'views per hour'},
   steps:['Look for the peak of the views-gained-each-hour bars, or the steepest point of the total-views curve.','It is at hour 20, about 360 views an hour.'],
   lab:{set:{},act:'peek',look:'Read <b>Fastest growth</b> and <b>Growing fastest at</b>.'},verify:[['peakr',360,0.5],['peakt',20,0.01]]},
  {id:'signs',kind:'test',lvl:'honors',
   q:'At hour 30, N′(30) ≈ 65 views per hour and N″(30) ≈ −17.7 views per hour per hour. Which describes the video at hour 30?',
   choices:['Total views falling, and falling faster','Total views rising, and rising faster','Total views rising, but rising more slowly','Total views falling, but more slowly'],correct:2,
   steps:['N′ > 0, so the total is still rising.','N″ < 0, so N′ is decreasing: each hour adds fewer views than the hour before.','So the total rises more slowly, and the curve is concave down.'],
   lab:{set:{at:30},act:'peek',look:'Read <b>Views per hour</b> and <b>Change in views per hour, per hour</b>.'},verify:[['rate',65.05,0.1],['acc',-17.67,0.05]]},
  {id:'table',kind:'test',lvl:'honors',
   q:'Total views at hours 0, 6, 12, 18, 24 and 30 were 12, 71, 399, 1,701, 3,689 and 4,572. In which 6-hour stretch did the video gain the most views?',
   choices:['0 to 6','12 to 18','18 to 24','24 to 30'],correct:2,
   steps:['Gains: 59, 328, 1,302, 1,988 and 883.','The biggest gain, 1,988, is from hour 18 to 24.','The inflection point, at hour 20, falls inside that stretch.']},
  {id:'half',kind:'ap',lvl:'ap',
   q:'A video’s total views follow N(t) = 9,000 / (1 + e^(−0.25(t − 30))), with t in hours. Find the time of fastest growth and the fastest rate.',
   choices:['t = 30 h, 562.5 views per hour','t = 30 h, 2,250 views per hour','t = 36 h, 562.5 views per hour','t = 0 h, 9,000 views per hour'],correct:0,
   steps:['For a logistic curve, N′ = rN(1 − N/K) is largest when N = K/2, which happens at t = t0 = 30 h.','The peak rate is rK/4 = 0.25 × 9,000 / 4 = 562.5 views per hour.']},
  {id:'deriv',kind:'ap',lvl:'ap',
   q:'Show that for N′ = rN(1 − N/K), the second derivative is N″ = rN′(1 − 2N/K). At what value of N is N″ = 0?',
   num:{ans:0.5,tol:0.001,unit:'× K'},
   steps:['Differentiate N′ = rN − (r/K)N² with respect to t, using the chain rule: N″ = rN′ − (2r/K)N·N′ = rN′(1 − 2N/K).','N′ > 0 while the views grow, so N″ = 0 only when 1 − 2N/K = 0, that is N = K/2.','N″ > 0 for N < K/2 (concave up) and N″ < 0 for N > K/2 (concave down), so N = K/2 is the inflection point.']}
 ]
}
});
