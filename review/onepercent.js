BioLab.addReview({
onepercent:{
 questions:[
  {id:'carpay',kind:'test',lvl:'honors',
   q:'You borrow $15,000 at 7% APR for 5 years (60 monthly payments). To the nearest cent, what is the monthly payment?',
   num:{ans:297.02,tol:0.02,unit:'dollars'},
   steps:['Monthly rate i = 7 ÷ 1200 = 0.0058333; n = 60.','(1 + i)⁻⁶⁰ = 1.0058333⁻⁶⁰ ≈ 0.70525.','M = Pi / (1 − (1 + i)⁻ⁿ) = 15,000 × 0.0058333 / 0.29475 ≈ $297.02.'],
   lab:{set:{loan:'car',amt:15000,yrs:5,rate:7,reveal:true},look:'Read <b>Monthly payment at your rate</b>.'},verify:[['payA',297.02,0.01]]},
  {id:'carextra',kind:'real',lvl:'bio',
   q:'Same $15,000, 5-year car loan. Your friend gets 8% instead of 7%. About how much more does your friend pay over the whole loan?',
   choices:['About $71','About $428','About $750','About $1,500'],correct:1,
   steps:['At 8% the payment is $304.15; at 7% it is $297.02.','The gap is $7.13 a month for 60 months.','60 × $304.15 − 60 × $297.02 = $18,248.75 − $17,821.08 ≈ $428.'],
   lab:{set:{loan:'car',amt:15000,yrs:5,rate:7,reveal:true},look:'Read <b>Extra paid over the loan</b>.'},verify:[['extra',427.68,0.05]]},
  {id:'student',kind:'real',lvl:'bio',
   q:'A $30,000 student loan is paid back over 10 years. One borrower gets 5.5%, another 6.5%. About how much more does the second borrower pay in all?',
   choices:['About $300','About $900','About $1,800','About $3,000'],correct:2,
   steps:['At 5.5%: M ≈ $325.58, so the total is 120 × $325.58 ≈ $39,069.','At 6.5%: M ≈ $340.64, so the total is about $40,877.','The difference is about $1,808: $15.07 a month for 120 months.'],
   lab:{set:{loan:'student',amt:30000,yrs:10,rate:5.5,reveal:true},look:'Read <b>Extra paid over the loan</b>.'},verify:[['extra',1807.81,0.05]]},
  {id:'whynot',kind:'test',lvl:'bio',
   q:'1% of $15,000 for 5 years is $750, but the real extra cost of a 1-point higher rate is $428. Why?',
   choices:['Interest is only charged in the first year','You owe less each month as you pay the loan down, so the extra 1% is charged on a shrinking balance','The lender gives a discount for paying on time'],correct:1,
   steps:['Each month, interest = (what you still owe) × i.','What you owe starts at $15,000 and falls to $0, so the extra 1% applies to a balance that is, on average, a little over half the loan.','That is why the real extra ($428) is a bit more than half of $750.']},
  {id:'tier',kind:'real',lvl:'honors',
   q:'A lower credit tier moves your car loan from 7% to 11% on $15,000 for 5 years. To the nearest dollar, how much more do you pay over the loan?',
   num:{ans:1747,tol:2,unit:'dollars'},
   steps:['At 11%: i = 0.0091667, and M = 15,000 × 0.0091667 / (1 − 1.0091667⁻⁶⁰) ≈ $326.14.','At 7%: M ≈ $297.02.','Extra = 60 × ($326.14 − $297.02) ≈ $1,747.'],
   lab:{set:{loan:'car',amt:15000,yrs:5,rate:7,gap:4,reveal:true},look:'Read <b>Extra paid over the loan</b>.'},verify:[['extra',1747.10,0.05]]},
  {id:'series',kind:'test',lvl:'ap',
   q:'A loan of P at monthly rate i is paid off by n equal payments M. Which expression is M?',
   choices:['P(1 + i)ⁿ / n','Pi / (1 − (1 + i)⁻ⁿ)','P / n + Pi','Pi(1 + i)'],correct:1,
   steps:['Unpaid, the loan would grow to P(1 + i)ⁿ.','Each payment grows from its month to the end, so the payments add to M[1 + (1 + i) + … + (1 + i)ⁿ⁻¹] = M[(1 + i)ⁿ − 1]/i.','Set them equal: M = Pi(1 + i)ⁿ / ((1 + i)ⁿ − 1) = Pi / (1 − (1 + i)⁻ⁿ).']}
 ]
}
});
