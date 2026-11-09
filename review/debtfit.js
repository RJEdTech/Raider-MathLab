BioLab.addReview({
debtfit:{
 questions:[
  {id:'limit',kind:'test',lvl:'bio',
   q:'A typical psychology job pays $43,000 a year. What is 10% of one month’s pay, to the cent?',
   num:{ans:358.33,tol:0.01,unit:'dollars'},
   steps:['One month of pay: $43,000 ÷ 12 = $3,583.33.','10% of that: $3,583.33 × 0.10 = $358.33.']},
  {id:'maxtyp',kind:'real',lvl:'bio',
   q:'At $8.72 a month per $1,000 borrowed (15 years at 6.52%), what is the most a $358.33 monthly payment repays, to the nearest hundred dollars?',
   choices:['About $3,100','About $31,500','About $41,100','About $50,000'],correct:2,
   steps:['Set up the proportion: $8.72 / $1,000 = $358.33 / D.','D = $358.33 ÷ $8.72 × 1,000 ≈ $41,093.','That is between $25,000 and $49,999, so the 15-year payment applies.'],
   lab:{set:{major:'psych',debt:29500,reveal:true},look:'Read <b>Most that fits, typical pay</b>.'},verify:[['mTyp',41083.51,15]]},
  {id:'share',kind:'real',lvl:'bio',
   q:'You borrow $29,500 and pay $257.30 a month. To the nearest tenth of a percent, what share of a $32,000-a-year paycheck is that?',
   num:{ans:9.6,tol:0.1,unit:'%'},
   steps:['Monthly pay: $32,000 ÷ 12 = $2,666.67.','$257.30 ÷ $2,666.67 ≈ 0.0965.','About 9.6% of pay.'],
   lab:{set:{major:'psych',debt:29500,reveal:true},look:'Read <b>Payment share of pay, low pay</b>.'},verify:[['sLow',9.65,0.05]]},
  {id:'prop',kind:'test',lvl:'bio',
   q:'In one repayment plan, $10,000 costs $113.65 a month. What does $20,000 cost in the same plan?',
   choices:['$113.65','$170.48','$227.30','$454.60'],correct:2,
   steps:['The payment is proportional to the debt: payment = k × debt.','Doubling the debt doubles the payment.','2 × $113.65 = $227.30.']},
  {id:'jump',kind:'test',lvl:'honors',
   q:'Under the new federal standard plan, why is the monthly payment on $25,000 lower than on $24,500?',
   choices:['$25,000 gets a lower interest rate','At $25,000 the plan lasts 15 years instead of 10, so each payment is smaller','Loans of $25,000 or more are partly forgiven'],correct:1,
   steps:['Under $25,000: 10 years, $11.37 per $1,000: $24,500 costs $278.44 a month.','$25,000 to $49,999: 15 years, $8.72 per $1,000: $25,000 costs $218.05 a month.','The payment is smaller, but 180 payments add up to more interest: about $14,249 vs. $8,913.'],
   lab:{set:{debt:25000,reveal:true},look:'Read <b>Monthly payment</b> and <b>Years to repay</b>.'},verify:[['pay',218.05,0.01]]},
  {id:'need',kind:'real',lvl:'honors',
   q:'A payment of $257.30 a month must be at most 10% of monthly pay. What is the lowest yearly pay that works?',
   num:{ans:30876,tol:5,unit:'dollars'},
   steps:['$257.30 ≤ 0.10 × S ÷ 12.','S ≥ $257.30 × 12 ÷ 0.10.','S ≥ $30,876 a year.'],
   lab:{set:{debt:29500,limit:10,reveal:true},look:'Read <b>Yearly pay this debt needs</b>.'},verify:[['need',30876,1]]}
 ]
}
});
