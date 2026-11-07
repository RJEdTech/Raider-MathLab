BioLab.addReview({
stickernet:{
 questions:[
  {id:'net4',kind:'real',lvl:'bio',
   q:'A college’s sticker price is $64,000 a year. Your aid offer includes $38,500 a year in grants. What is your net price for all 4 years?',
   num:{ans:102000,tol:1,unit:'dollars'},
   steps:['Net price per year = sticker − grants = $64,000 − $38,500 = $25,500.','For 4 years: $25,500 × 4 = $102,000.','A student with no grants pays $64,000 × 4 = $256,000 for the same 4 years.'],
   lab:{set:{sticker:64000,aid:38500,years:4,show:true},look:'Read <b>Net price per year</b> and <b>Net price, all years</b>.'},verify:[['net',25500,0.5],['netT',102000,0.5]]},
  {id:'package',kind:'real',lvl:'bio',
   q:'Sticker price: $58,000. Your “aid package” lists $20,000 in grants, a $5,500 loan and $3,000 of work-study. A friend says, “Your aid is $28,500, so you only pay $29,500.” What is your net price?',
   choices:['$29,500','$32,500','$38,000','$58,000'],correct:2,
   steps:['Only grants and scholarships are money you never pay back.','The loan you repay with interest, and work-study is pay you earn by working.','Net price = $58,000 − $20,000 = $38,000. Your family still has to cover all of it, by paying, borrowing or working.'],
   lab:{set:{sticker:58000,aid:20000,show:true},look:'Read <b>Net price per year</b>.'},verify:[['net',38000,0.5]]},
  {id:'disc',kind:'test',lvl:'honors',
   q:'Same college: $38,500 in grants on a $64,000 sticker price. What is the discount rate, to the nearest 0.1%?',
   num:{ans:60.2,tol:0.1,unit:'%'},
   steps:['Discount rate = grants ÷ sticker = 38,500 ÷ 64,000.','= 0.6016 ≈ 60.2%.','You pay the other 39.8% of the sticker price.'],
   lab:{set:{sticker:64000,aid:38500},look:'Read <b>Discount rate</b>.'},verify:[['disc',60.16,0.01]]},
  {id:'pay5500',kind:'real',lvl:'honors',
   q:'You borrow $5,500 at the start of each of 4 years at 6.39%. Interest builds (simple interest) while you are in school, then you repay over 10 years. What is your monthly payment, to the nearest cent?',
   num:{ans:288.29,tol:0.02,unit:'dollars'},
   steps:['Interest in school: 5,500 × 0.0639 × (4 + 3 + 2 + 1) = $3,514.50. You finish owing B = $22,000 + $3,514.50 = $25,514.50.','Monthly rate i = 0.0639 ÷ 12 = 0.005325; n = 120 payments.','M = 25,514.50 × 0.005325 ÷ (1 − 1.005325⁻¹²⁰) ≈ $288.29. Over 10 years that is about $34,594: $12,594 more than you borrowed.'],
   lab:{set:{sticker:70000,aid:40000,borrow:5500,years:4,rate:6.39,term:10,school:true,show:true},look:'Read <b>Monthly loan payment</b> and <b>Interest you pay</b>.'},verify:[['pay',288.29,0.01],['bal',25514.5,0.5]]},
  {id:'firstmonth',kind:'test',lvl:'ap',
   q:'You owe $32,473 at 6.39% APR and pay $366.91 a month. In the first month, how much of your payment is interest?',
   num:{ans:172.92,tol:0.02,unit:'dollars'},
   steps:['Interest for one month = balance × APR ÷ 12 = 32,473 × 0.0639 ÷ 12.','= $172.92.','So only $366.91 − $172.92 = $193.99 of the first payment lowers what you owe. Each month the interest share shrinks a little, because the balance is smaller.'],
   lab:{set:{sticker:70000,aid:40000,borrow:7000,years:4,rate:6.39,term:10,school:true,show:true},look:'Read <b>Interest in the first month of repayment</b>.'},verify:[['first',172.92,0.01]]},
  {id:'subsidized',kind:'test',lvl:'ap',
   q:'You borrow $7,000 a year for 4 years at 6.39% and repay over 10 years. How much less is your monthly payment if no interest builds while you are in school?',
   num:{ans:50.54,tol:0.05,unit:'dollars'},
   steps:['No interest in school: B = $28,000, so M = 28,000 × 0.005325 ÷ (1 − 1.005325⁻¹²⁰) ≈ $316.37.','With interest building: B = $32,473, so M ≈ $366.91.','Difference: $366.91 − $316.37 = $50.54 a month, or about $6,065 over 120 months.'],
   lab:{set:{sticker:70000,aid:40000,borrow:7000,years:4,rate:6.39,term:10,school:false,show:true},look:'Read <b>Monthly loan payment</b>, then turn <b>Interest builds while you are in school</b> back on.'},verify:[['pay',316.37,0.01]]}
 ]
}
});
