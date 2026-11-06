BioLab.addReview({
caffeinedaily:{
 questions:[
  {id:'week',kind:'real',lvl:'bio',
   q:'An adult drinks 100 mg of caffeine every morning, and their half-life is 5 hours. To the nearest tenth of a milligram, how much is in their body right after the drink on day 7?',
   num:{ans:103.7,tol:0.1,unit:'mg'},
   steps:['24 hours is 24/5 = 4.8 half-lives, so each morning (1/2)^4.8 ≈ 0.0359 of yesterday’s caffeine is left.','Day 7: 100(1 + 0.0359 + 0.0359² + … + 0.0359⁶).','= 100(1 − 0.0359⁷)/(1 − 0.0359) ≈ 103.7 mg. It has barely grown since day 2.'],
   lab:{set:{dose:100,day:7},act:'show',look:'Read <b>In her right after the coffee</b>.'},verify:[['morn',103.72,0.01]]},
  {id:'ratio',kind:'test',lvl:'honors',
   q:'If a person’s half-life is 6 hours, what is the common ratio r, the share of caffeine left after 24 hours?',
   num:{ans:0.0625,tol:0.0001,unit:''},
   steps:['24 hours is 24/6 = 4 half-lives.','r = (1/2)⁴ = 1/16 = 0.0625.'],
   lab:{set:{half:6},look:'Read <b>Common ratio r</b>.'},verify:[['ratio',0.0625,0.00001]]},
  {id:'limit',kind:'test',lvl:'honors',
   q:'Half-life 8 hours, 150 mg every morning. What level does the morning total settle at, to the nearest tenth?',
   num:{ans:171.4,tol:0.1,unit:'mg'},
   steps:['24 hours is 3 half-lives, so r = (1/2)³ = 1/8.','The total settles at D/(1 − r) = 150/(7/8) = 1200/7 ≈ 171.4 mg.'],
   lab:{set:{dose:150,half:8,day:30},act:'show',look:'Read <b>Level it settles at</b> and <b>In her right after the coffee</b>.'},verify:[['limit',171.43,0.01],['morn',171.43,0.01]]},
  {id:'medicine',kind:'real',lvl:'honors',
   q:'A medicine is taken once a day, and its half-life is 24 hours. Using the same model, the amount right after each dose levels off at about how many times a single dose?',
   choices:['1.5 times','2 times','24 times','It never levels off'],correct:1,
   steps:['After 24 hours, half is left: r = 1/2.','D/(1 − r) = D/(1/2) = 2D.','That is why doctors think about half-life when they set how often you take a medicine: a long half-life builds up more.']},
  {id:'sum',kind:'ap',lvl:'ap',
   q:'Find the sum of the series Σₖ₌₀^∞ 200(0.25)ᵏ, to the nearest tenth.',
   num:{ans:266.7,tol:0.1,unit:''},
   steps:['It is geometric with first term a = 200 and ratio r = 0.25.','|r| < 1, so it converges to a/(1 − r) = 200/0.75 ≈ 266.7.']},
  {id:'partial',kind:'test',lvl:'honors',
   q:'Find the partial sum S₅ = 100 + 50 + 25 + 12.5 + 6.25 using the formula a(1 − rⁿ)/(1 − r).',
   num:{ans:193.75,tol:0.01,unit:''},
   steps:['a = 100, r = 1/2, n = 5.','S₅ = 100(1 − 1/32)/(1/2) = 200 × 31/32 = 193.75.','The infinite sum would be 200, so S₅ is already within 6.25 of it.']},
  {id:'converge',kind:'ap',lvl:'ap',
   q:'Which series converges?',
   choices:['Σₖ₌₀^∞ 3(1.1)ᵏ','Σₖ₌₀^∞ 5(−0.9)ᵏ','Σₖ₌₀^∞ 2(−1)ᵏ','Σₖ₌₀^∞ (1.5)ᵏ/4'],correct:1,
   steps:['A geometric series converges exactly when |r| < 1.','The ratios are 1.1, −0.9, −1 and 1.5. Only |−0.9| < 1.','Σ 5(−0.9)ᵏ = 5/(1 + 0.9) ≈ 2.63. With r = −1 the partial sums bounce between 2 and 0 forever, so that series diverges.']}
 ]
}
});
