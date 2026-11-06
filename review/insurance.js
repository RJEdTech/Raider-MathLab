BioLab.addReview({
insurance:{
 questions:[
  {id:'avgskip',kind:'real',lvl:'bio',
   q:'You are about average with phones: each year, a 20% chance of cracking the screen and a 7% chance of losing or wrecking the phone. If you skip the plan, what is your expected (average) cost over 2 years, to the nearest dollar?',
   num:{ans:238,tol:1,unit:'dollars'},
   steps:['Each year the expected cost is 0.20 × $279 + 0.07 × $900 = $55.80 + $63.00 = $118.80.','Over 2 years: 2 × $118.80 = $237.60.','The six-outcome table gives the same answer, because expected values add.'],
   lab:{set:{care:'average',fee:12,show:true},look:'Read <b>Skip it: average 2-year cost</b>.'},verify:[['evskip',237.6,0.01]]},
  {id:'rough15',kind:'real',lvl:'honors',
   q:'You are hard on phones (35% a year for a crack, 12% for a loss) and the plan costs $15 a month. Which choice is cheaper on average, and by how much? Give the difference in dollars.',
   num:{ans:7.24,tol:0.05,unit:'dollars'},
   steps:['Skip: 2 × (0.35 × $279 + 0.12 × $900) = 2 × ($97.65 + $108.00) = $411.30.','Plan: 24 × $15 = $360 in fees, plus 2 × (0.35 × $29 + 0.12 × $99) = 2 × ($10.15 + $11.88) = $44.06 in deductibles: $404.06.','The plan is cheaper by $411.30 − $404.06 = $7.24: nearly a tie at this price.'],
   lab:{set:{care:'rough',fee:15,show:true},look:'Compare <b>Skip it</b> and <b>Plan</b> average costs.'},verify:[['evskip',411.3,0.01],['evbuy',404.06,0.01]]},
  {id:'warranty',kind:'test',lvl:'honors',
   q:'A 2-year warranty on a $400 laptop costs $60 and covers repairs completely. Without it, there is a 12% chance of a $300 repair in those 2 years (and otherwise no cost). On average, how much more does the warranty cost than going without?',
   num:{ans:24,tol:0.01,unit:'dollars'},
   steps:['Without the warranty, X = $300 with probability 0.12 and $0 with probability 0.88.','E(X) = 0.12 × $300 + 0.88 × $0 = $36.','The warranty costs $60 for sure: $60 − $36 = $24 more on average.']},
  {id:'sdsimple',kind:'test',lvl:'ap',
   q:'X is your cost of skipping insurance on one item: $900 with probability 0.10, otherwise $0. Find the standard deviation of X.',
   num:{ans:270,tol:0.5,unit:'dollars'},
   steps:['μ = 0.10 × 900 = $90.','σ² = 0.10 × (900 − 90)² + 0.90 × (0 − 90)² = 0.10 × 656,100 + 0.90 × 8,100 = 65,610 + 7,290 = 72,900.','σ = √72,900 = $270: three times the mean, which is what a big, rare loss looks like.']},
  {id:'becareful',kind:'test',lvl:'ap',
   q:'A very careful user has a 10% chance per year of cracking the screen and a 4% chance of a loss. Below what monthly fee would the 24-month plan beat skipping on average? Give dollars and cents.',
   num:{ans:4.75,tol:0.01,unit:'dollars per month'},
   steps:['Skip: 2 × (0.10 × $279 + 0.04 × $900) = 2 × ($27.90 + $36.00) = $127.80.','Plan deductibles: 2 × (0.10 × $29 + 0.04 × $99) = 2 × ($2.90 + $3.96) = $13.72.','24 × fee + $13.72 < $127.80, so fee < $114.08 ÷ 24 ≈ $4.75 a month. Real plans cost more, so a careful user is better off skipping on average.'],
   lab:{set:{care:'careful',show:true},look:'Read <b>The plan wins on average below this fee</b>.'},verify:[['be',4.753,0.001]]},
  {id:'whymore',kind:'real',lvl:'bio',
   q:'For most customers, a protection plan costs more on average than it pays back. Why do companies set prices that way?',
   choices:['They make a mistake in their math','Fees must cover the expected claims plus the company’s own costs and profit','Phones break less often than people think, so the plan is free'],correct:1,
   steps:['The company can predict its average payout per customer: that is the expected value of the claims.','To stay in business, fees must cover that average plus the cost of running the plan.','So for the typical customer the plan costs more on average. People buy it anyway to avoid a big surprise bill.']}
 ]
}
});
