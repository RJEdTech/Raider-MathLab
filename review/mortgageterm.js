BioLab.addReview({
mortgageterm:{
 questions:[
  {id:'int30',kind:'test',lvl:'bio',
   q:'A $320,000 loan costs $2,167.79 a month for 360 months. How much interest is paid in all?',
   num:{ans:460404.4,tol:1,unit:'dollars'},
   steps:['Total paid: 360 × $2,167.79 = $780,404.40.','Interest = total paid − amount borrowed.','$780,404.40 − $320,000 = $460,404.40.'],
   lab:{set:{amt:320000,r30:7.18,r15:6.57,reveal:true},look:'Read <b>Total interest, 30-year</b>.'},verify:[['i30',460404.4,0.5]]},
  {id:'saved',kind:'real',lvl:'bio',
   q:'The same $320,000 as a 15-year loan costs $2,799.87 a month. About how much less interest does it pay than the 30-year loan?',
   choices:['About $76,000','About $138,000','About $276,000','About $460,000'],correct:2,
   steps:['15-year interest: 180 × $2,799.87 − $320,000 = $183,976.60.','30-year interest: $460,404.40.','Difference: about $276,428.'],
   lab:{set:{amt:320000,r30:7.18,r15:6.57,reveal:true},look:'Read <b>Interest the 15-year saves</b>.'},verify:[['saved',276427.8,0.5]]},
  {id:'first',kind:'test',lvl:'bio',
   q:'In the first month of the 30-year loan, how much of the $2,167.79 payment pays down the balance?',
   choices:['About $253','About $1,067','About $1,915','All of it'],correct:0,
   steps:['First month’s interest: $320,000 × 0.0718 ÷ 12 = $1,914.67.','The rest pays down the balance: $2,167.79 − $1,914.67 = $253.12.','Early payments on a long loan are mostly interest.']},
  {id:'extra',kind:'real',lvl:'honors',
   q:'The family keeps the 30-year loan but pays $200 extra each month. About how many years until it is paid off?',
   choices:['About 28','About 23','About 18','About 15'],correct:1,
   steps:['The payment becomes $2,367.79.','Each month the balance becomes B(1 + i) − $2,367.79, with i = 0.0718 ÷ 12.','It reaches $0 after 278 payments, about 23.1 years.'],
   lab:{set:{amt:320000,r30:7.18,extra:200,reveal:true},look:'Read <b>Months to pay off</b>.'},verify:[['xmonths',278,0.5]]},
  {id:'xsave',kind:'real',lvl:'honors',
   q:'To the nearest thousand dollars, how much interest does that $200 a month save?',
   num:{ans:124000,tol:1000,unit:'dollars'},
   steps:['Without the extra: $460,404 of interest.','With it, stepping the balance: about $336,317 of interest.','Saved: about $124,088.'],
   lab:{set:{amt:320000,r30:7.18,extra:200,reveal:true},look:'Read <b>Interest the extra payment saves</b>.'},verify:[['xsaved',124087.6,1]]},
  {id:'logn',kind:'test',lvl:'ap',
   q:'Which expression gives the number of months n for a loan P at monthly rate i with payment M?',
   choices:['n = P/M','n = log(M/P)/log(1 + i)','n = −log(1 − Pi/M)/log(1 + i)','n = (M − Pi)/i'],correct:2,
   steps:['Start with M = Pi/(1 − (1 + i)⁻ⁿ).','Then (1 + i)⁻ⁿ = 1 − Pi/M.','Take logs: −n·log(1 + i) = log(1 − Pi/M), so n = −log(1 − Pi/M)/log(1 + i).'],
   lab:{set:{amt:320000,r30:7.18,extra:200,reveal:true},look:'Read <b>n from the log formula</b>.'},verify:[['nlog',277.18,0.05]]}
 ]
}
});
