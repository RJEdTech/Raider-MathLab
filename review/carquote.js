BioLab.addReview({
carquote:{
 questions:[
  {id:'quote16',kind:'real',lvl:'bio',
   q:'In this model the base rate is $470 a year. You are 16 (×2.6) with a clean record (×1.0), the policyholder has fair credit (×1.5), and your zip is average (×1.0). What is your yearly quote?',
   num:{ans:1833,tol:1,unit:'dollars'},
   steps:['Multiply the base by every factor: $470 × 2.6 × 1.0 × 1.5 × 1.0.','$470 × 2.6 = $1,222.','$1,222 × 1.5 = $1,833 a year, about $153 a month.'],
   lab:{set:{age:16,record:'clean',credit:'fair',zip:'avg',ed:false,good:false,healthy:false},look:'Read <b>Your quote</b>.'},verify:[['quote',1833,0.5]]},
  {id:'stack',kind:'test',lvl:'bio',
   q:'A 10% discount and a 15% discount both apply to the same price. What percent comes off in total?',
   choices:['25%','23.5%','22.5%','12.5%'],correct:1,
   steps:['Each discount is a multiplier: 10% off is × 0.90 and 15% off is × 0.85.','0.90 × 0.85 = 0.765, so you pay 76.5% of the price.','100% − 76.5% = 23.5% off. The second discount takes 15% of an already smaller price.']},
  {id:'florida17',kind:'real',lvl:'honors',
   q:'Run the Florida test for a 17-year-old (×2.3) in an average zip. Teen A: clean record, poor credit (×2.1532). Teen B: DUI (×1.8), excellent credit (×1.0). How much more does Teen A pay per year?',
   num:{ans:381.8,tol:1,unit:'dollars'},
   steps:['Both start at $470 × 2.3 = $1,081.','Teen A: $1,081 × 2.1532 = $2,327.60. Teen B: $1,081 × 1.8 = $1,945.80.','Teen A pays $2,327.60 − $1,945.80 = $381.80 more, with the cleaner record.'],
   lab:{set:{age:17,record:'clean',credit:'fair',zip:'avg',ed:false,good:false,healthy:false},look:'Read <b>Florida test</b>.'},verify:[['fl',381.8,0.5]]},
  {id:'poorfair',kind:'test',lvl:'honors',
   q:'The policyholder’s credit tier moves from poor (×2.1532) to fair (×1.5). By what percent does the quote drop, whatever the other factors are? Round to the nearest tenth.',
   num:{ans:30.3,tol:0.1,unit:'%'},
   steps:['Changing one multiplier scales the whole quote by new ÷ old: 1.5 ÷ 2.1532 ≈ 0.6966.','The quote drops by 1 − 0.6966 = 0.3034, about 30.3%.','For a 16-year-old in an average zip, that is $2,631 down to $1,833: $798 a year.']},
  {id:'shop',kind:'test',lvl:'honors',
   q:'Under price optimization, a customer who never shops around gets ×1.15 and one who compares quotes every year gets ×0.95. Same risk. How many times as much does the loyal customer pay?',
   choices:['1.10 times','About 1.21 times','1.20 times','About 0.83 times'],correct:1,
   steps:['Everything else is the same, so the ratio of the quotes is the ratio of the multipliers.','1.15 ÷ 0.95 ≈ 1.21.','The loyal customer pays about 21% more for the same risk.']},
  {id:'segments',kind:'real',lvl:'ap',
   q:'Split the pool of 2,000 imaginary drivers into 16 segments of 125 drivers each, and price each segment at its average cost. Use the lab to find the gap between the highest and lowest segment price.',
   num:{ans:1335,tol:5,unit:'dollars'},
   steps:['With 1 segment, everyone pays the pool average and the gap is $0.','With 16 segments sorted by the insurer’s score, the lowest-risk segment averages far less than the highest.','The lab reads a gap of about $1,335 a year. At 1,000 segments of 2 it is about $3,953, and much of that is chance.'],
   lab:{set:{segs:16},look:'Read <b>Highest minus lowest segment price</b>.'},verify:[['spread',1335,1]]}
 ]
}
});
