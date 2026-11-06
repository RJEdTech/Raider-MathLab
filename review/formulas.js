BioLab.addReview({
formulas:{
 questions:[
  {id:'total40',kind:'test',lvl:'bio',
   q:'Shirts cost $12 each. The club orders 40, the shop adds a $35 setup fee, and 8% sales tax applies to the whole order. What is the total?',
   num:{ans:556.2,tol:0.01,unit:'$'},
   steps:['Parentheses first: 12 × 40 = 480, then 480 + 35 = 515.','The tax multiplier is 1 + 0.08 = 1.08.','515 × 1.08 = $556.20.'],
   lab:{set:{f:'c',n:40},look:'Read <b>Your formula’s total</b> with formula C.'},verify:[['yours',556.2,0.01],['real',556.2,0.01]]},
  {id:'typed',kind:'test',lvl:'bio',
   q:'A cell holds =10*30+25*1.06. What number does it show?',
   num:{ans:326.5,tol:0.01,unit:'$'},
   steps:['Multiplication before addition: 10 × 30 = 300 and 25 × 1.06 = 26.50.','Then add: 300 + 26.50 = 326.50.','Only the $25 fee got taxed. If the shop taxes the whole order, the right total is (300 + 25) × 1.06 = $344.50.'],
   lab:{set:{f:'a',p:10,n:30,F:25,r:6},look:'Read <b>Your formula’s total</b> with formula A.'},verify:[['yours',326.5,0.01],['real',344.5,0.01]]},
  {id:'club60',kind:'real',lvl:'honors',
   q:'The soccer club orders 60 shirts at $9 each with a $40 setup fee and 7.5% tax on the whole order. The treasurer’s sheet uses p × n + F + r × p × n, which skips the tax on the fee. How much short will the club be?',
   num:{ans:3,tol:0.01,unit:'$'},
   steps:['Real bill: (9 × 60 + 40) × 1.075 = 580 × 1.075 = $623.50.','Treasurer’s sheet: 540 + 40 + 0.075 × 540 = 540 + 40 + 40.50 = $620.50.','Short by $623.50 − $620.50 = $3.00, which is the tax on the fee: 0.075 × 40.'],
   lab:{set:{f:'b',p:9,n:60,F:40,r:7.5},look:'Read <b>Real bill</b> and <b>Your formula is off by</b>.'},verify:[['real',623.5,0.01],['off',3,0.01]]},
  {id:'feeeach',kind:'real',lvl:'honors',
   q:'A student writes the total for 25 shirts as (p + F) × n × (1 + r), with p = $14, F = $30 and 8% tax. How much too much does that charge?',
   choices:['$30.00','$32.40','$777.60','$810.00'],correct:2,
   steps:['Wrong formula: (14 + 30) × 25 × 1.08 = 44 × 25 × 1.08 = $1,188.00.','Real bill: (14 × 25 + 30) × 1.08 = 380 × 1.08 = $410.40.','Difference: $1,188.00 − $410.40 = $777.60. The fee was charged 25 times instead of once: 24 extra fees of $30 with tax, 24 × 32.40 = $777.60.'],
   lab:{set:{f:'d',p:14,n:25,F:30,r:8},look:'Read <b>Your formula is off by</b>.'},verify:[['off',777.6,0.01]]},
  {id:'budget800',kind:'test',lvl:'ap',
   q:'With $12 shirts, a $35 setup fee and 8% tax, the club has $800. What is the largest order it can afford?',
   num:{ans:58,tol:0,unit:'shirts'},
   steps:['T(n) = (12n + 35) × 1.08 = 12.96n + 37.80.','12.96n + 37.80 ≤ 800, so 12.96n ≤ 762.20 and n ≤ 58.8.','Round down: 58 shirts cost $789.48, and 59 would cost $802.44.'],
   lab:{set:{f:'c',B:800},look:'Read <b>Most shirts the budget covers</b>.'},verify:[['most',58,0]]},
  {id:'slope',kind:'test',lvl:'ap',
   q:'For shirts at $15, a $50 setup fee and 6% tax, which is the total as a linear function of n?',
   choices:['T(n) = 15n + 53','T(n) = 15.90n + 50','T(n) = 15.90n + 53','T(n) = 65n × 1.06'],correct:2,
   steps:['T(n) = (15n + 50) × 1.06.','Distribute: 15 × 1.06 = 15.90 and 50 × 1.06 = 53.','T(n) = 15.90n + 53: each shirt adds $15.90, and the taxed fee adds $53 once.']}
 ]
}
});
