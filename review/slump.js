BioLab.addReview({
slump:{
 questions:[
  {id:'fiveof10',kind:'real',lvl:'bio',
   q:'You truly make 75% of your free throws. What is the chance of making 5 or fewer in a stretch of 10, just by luck? Give a percent to one decimal place.',
   num:{ans:7.8,tol:0.05,unit:'%'},
   steps:['Count the made shots: X ~ B(10, 0.75).','P(X ≤ 5) = P(0) + P(1) + … + P(5). The biggest pieces are P(5) ≈ 0.058 and P(4) ≈ 0.016.','The total is about 0.078: about 8 stretches in 100. A bad night like this is not rare.'],
   lab:{set:{n:10,show:true},look:'Read <b>Exact binomial chance of 50% or worse</b>.'},verify:[['exact',7.813,0.005]]},
  {id:'sd100',kind:'test',lvl:'honors',
   q:'p = 0.75 and n = 100. What is the standard deviation of the sampling distribution of p̂, in percentage points?',
   num:{ans:4.33,tol:0.01,unit:'points'},
   steps:['σ(p̂) = √(p(1 − p)/n) = √(0.75 × 0.25 / 100).','= √0.001875 ≈ 0.0433.','That is 4.33 percentage points.'],
   lab:{set:{n:100,show:true},look:'Read <b>Formula</b> and compare it with <b>Spread of p̂</b> from the simulation.'},verify:[['formula',4.33,0.005]]},
  {id:'howmany',kind:'real',lvl:'honors',
   q:'You want the typical swing in your free-throw percentage (the SD of p̂) to be at most 2 percentage points. If you are a true 75% shooter, how many shots do you need?',
   num:{ans:469,tol:1,unit:'shots'},
   steps:['Set √(0.75 × 0.25 / n) ≤ 0.02.','Square both sides: 0.1875 / n ≤ 0.0004, so n ≥ 0.1875 / 0.0004 = 468.75.','Round up: 469 shots.']},
  {id:'center',kind:'test',lvl:'honors',
   q:'A 75% shooter records p̂ for many stretches of 40 shots. Where is the center of the sampling distribution of p̂?',
   choices:['At 0.75','At the p̂ of the first stretch','At 0.50','It depends on how many stretches you record'],correct:0,
   steps:['p̂ is an unbiased estimator of p.','So its sampling distribution is centered at p = 0.75 for any stretch length.','More shots per stretch shrink the spread, not the center.']},
  {id:'zscore',kind:'ap',lvl:'ap',
   q:'A 75% shooter makes 60 of 100. How many standard deviations below the mean of the sampling distribution is p̂ = 0.60?',
   num:{ans:-3.46,tol:0.02},
   steps:['Large Counts: np = 75 and n(1 − p) = 25, both at least 10, so a normal model is fine.','σ = √(0.75 × 0.25 / 100) ≈ 0.0433.','z = (0.60 − 0.75) / 0.0433 ≈ −3.46. A normal 75% shooter almost never does this, so 60 of 100 is strong evidence of a real slump.']},
  {id:'conditions',kind:'ap',lvl:'ap',
   q:'For p = 0.75, which stretch length is the shortest that meets the Large Counts condition for the sampling distribution of p̂?',
   choices:['10 shots','20 shots','40 shots','100 shots'],correct:2,
   steps:['Large Counts needs np ≥ 10 and n(1 − p) ≥ 10.','The failures are the limit: n × 0.25 ≥ 10 means n ≥ 40.','At 40 shots, np = 30 and n(1 − p) = 10. At 10 or 20 shots, the sampling distribution is too skewed to call normal.']},
  {id:'long',kind:'real',lvl:'bio',
   q:'Why can you tell a real slump from bad luck with 400 shots but not with 10?',
   choices:['Over 400 shots luck averages out, so normal results stay close to 75% and slump results stay close to 60%','You get tired after 400 shots','The math only works for large numbers'],correct:0,
   steps:['Over 10 shots, normal results spread from about 30% to 100%, and slump results overlap them heavily.','Over 400 shots, the spread is only about 2 percentage points, so the two groups barely overlap.','A line between them makes almost no wrong calls.']}
 ]
}
});
