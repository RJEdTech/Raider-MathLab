BioLab.addReview({
carhouse:{
 questions:[
  {id:'maxh',kind:'test',lvl:'bio',
   q:'You earn $6,000 a month, pay $300 on a student loan and $530 on a car. Under the 28/36 rules, what is the largest housing payment you can have?',
   num:{ans:1330,tol:1,unit:'dollars'},
   steps:['Rule 1: 0.28 × $6,000 = $1,680.','Rule 2: 0.36 × $6,000 = $2,160 for all debts; $2,160 − $300 − $530 = $1,330.','Both must hold, so the most is the smaller: $1,330.'],
   lab:{set:{inc:6000,debt:300,car:530,reveal:true},look:'Read <b>Most housing payment, with the car</b>.'},verify:[['h1',1330,0.5]]},
  {id:'loss',kind:'real',lvl:'bio',
   q:'Same budget. At 7.18% for 30 years, each $1 a month supports about $147.62 of loan. About how much smaller is the home loan you can get because of the $530 car payment?',
   choices:['About $6,400','About $51,700','About $78,200','About $122,500'],correct:1,
   steps:['Without the car the limit is $1,680; with it, $1,330.','The car takes $1,680 − $1,330 = $350 a month off the housing payment.','$350 × $147.62 ≈ $51,665 less loan.'],
   lab:{set:{inc:6000,debt:300,car:530,reveal:true},look:'Read <b>The car payment costs you, in home loan</b>.'},verify:[['diff',51665.49,1]]},
  {id:'small',kind:'test',lvl:'bio',
   q:'You earn $6,000 a month with no other debts. Under the 28/36 rules, which car payment would not lower the most you can pay for housing?',
   choices:['$300','$500','$600','$700'],correct:0,
   steps:['Rule 1 allows $1,680 no matter what.','Rule 2 allows $2,160 − C. It stays at or above $1,680 while C ≤ $480.','A $300 payment leaves rule 2 at $1,860, so $1,680 is still the limit. Each of the others is above $480, so it lowers the limit.']},
  {id:'lender',kind:'real',lvl:'honors',
   q:'A lender allows housing plus all other debts up to 50% of gross income. Income $6,000, student loan $300, car $530. How much does the car payment lower the home loan, at $147.62 of loan per $1 a month?',
   num:{ans:78236,tol:10,unit:'dollars'},
   steps:['With no flat 28% rule, the car takes its full $530 a month off the housing limit.','$3,000 − $300 = $2,700 without the car; $2,170 with it.','$530 × $147.62 ≈ $78,236.'],
   lab:{set:{inc:6000,debt:300,car:530,rule:'lender',reveal:true},look:'Read <b>The car payment costs you, in home loan</b>.'},verify:[['diff',78236.31,1]]},
  {id:'cross',kind:'test',lvl:'honors',
   q:'Under 28/36 with income I and other debts S, the two boundary lines H = 0.28I and H = 0.36I − S − C cross at which car payment C?',
   choices:['C = 0.08I − S','C = 0.64I − S','C = 0.28I + S','C = S − 0.08I'],correct:0,
   steps:['Set the two limits equal: 0.28I = 0.36I − S − C.','Solve for C: C = 0.36I − 0.28I − S = 0.08I − S.','With I = $6,000 and S = $300: C = $480 − $300 = $180.']},
  {id:'pv',kind:'test',lvl:'ap',
   q:'A housing payment of $1,180 a month (after tax and insurance) at 7.18% for 30 years. To the nearest dollar, what loan does it support?',
   num:{ans:174186,tol:5,unit:'dollars'},
   steps:['i = 0.0718 ÷ 12 ≈ 0.0059833, n = 360.','(1 − (1 + i)⁻³⁶⁰)/i ≈ 147.6157.','$1,180 × 147.6157 ≈ $174,186.'],
   lab:{set:{inc:6000,debt:300,car:530,rule:'rot',rate:7.18,ti:500,reveal:true},look:'Read <b>Home loan you can get, no car payment</b>.'},verify:[['l0',174186.5,1]]}
 ]
}
});
