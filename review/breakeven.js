BioLab.addReview({
breakeven:{
 questions:[
  {id:'be30',kind:'real',lvl:'bio',
   q:'Setup costs $240, each bottle costs $6, and the club sells bottles for $14. How many bottles does it need to sell to break even?',
   num:{ans:30,tol:0,unit:'bottles'},
   steps:['Each bottle pays down $14 − $6 = $8 of the setup.','$240 ÷ $8 = 30 bottles.','Check: 30 × $14 = $420 in, and $240 + 30 × $6 = $420 out.'],
   lab:{set:{show:true},look:'Read <b>Bottles to sell to not lose money</b>.'},verify:[['need',30,0],['be',30,0.001]]},
  {id:'sell45',kind:'test',lvl:'bio',
   q:'Same fundraiser ($240 setup, $6 a bottle, $14 price). What is the profit if the club sells 45 bottles?',
   num:{ans:120,tol:0.01,unit:'$'},
   steps:['Money in: 45 × $14 = $630.','Money out: $240 + 45 × $6 = $510.','Profit: $630 − $510 = $120. Or: 15 bottles past break-even × $8 = $120.'],
   lab:{set:{show:true,sold:45},look:'Read <b>Profit</b>.'},verify:[['profit',120,0.001]]},
  {id:'sub24',kind:'test',lvl:'honors',
   q:'Setup $180, cost $4.50 an item, price $12. Use substitution to find the break-even point.',
   num:{ans:24,tol:0,unit:'items'},
   steps:['C(n) = 180 + 4.5n and R(n) = 12n.','Substitute: 180 + 4.5n = 12n, so 180 = 7.5n.','n = 180 ÷ 7.5 = 24 items.'],
   lab:{set:{show:true,F:180,c:4.5,s:12},look:'Read <b>Break-even point</b>.'},verify:[['be',24,0.001]]},
  {id:'price40',kind:'real',lvl:'honors',
   q:'The club thinks it can sell 40 bottles. Setup $240, cost $6 a bottle. What is the lowest price that still breaks even at 40 bottles?',
   choices:['$6.00','$10.00','$12.00','$14.00'],correct:2,
   steps:['Break-even at 40 means R(40) = C(40): 40s = 240 + 6 × 40 = 480.','s = 480 ÷ 40 = $12.','Any price above $12 makes a profit at 40 bottles.'],
   lab:{set:{show:true,s:12},look:'Read <b>Break-even point</b>: it should be 40.'},verify:[['be',40,0.001]]},
  {id:'goal300',kind:'test',lvl:'ap',
   q:'Setup $240, cost $6, price $14. How many bottles reach a $300 profit goal?',
   num:{ans:68,tol:0,unit:'bottles'},
   steps:['Profit = R − C = 8n − 240.','8n − 240 = 300, so 8n = 540 and n = 67.5.','Round up: 68 bottles. 67 would leave you at $296.'],
   lab:{set:{show:true,goal:300},look:'Read <b>Bottles to reach your profit goal</b>.'},verify:[['goalN',68,0]]},
  {id:'elim',kind:'test',lvl:'ap',
   q:'Solve by elimination: y = 300 + 5n and y = 17n. What is n?',
   choices:['n = 25','n = 17.6','n = 60','n = 13.6'],correct:0,
   steps:['Subtract the first equation from the second: 0 = 17n − 300 − 5n.','0 = 12n − 300, so n = 25.','Check: 300 + 5 × 25 = 425 and 17 × 25 = 425.']}
 ]
}
});
