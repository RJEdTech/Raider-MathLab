BioLab.addReview({
budget:{
 questions:[
  {id:'check73',kind:'test',lvl:'bio',
   q:'Pizzas cost $12 and feed 4; trays of wings cost $18 and feed 5. Does 7 pizzas and 3 trays fit a $150 budget and a 10-box limit, and how many does it feed?',
   choices:['Yes: $138, 10 boxes, feeds 43','No: it costs $156','No: it needs 11 boxes','Yes: $138, 10 boxes, feeds 45'],correct:0,
   steps:['Cost: 7 × 12 + 3 × 18 = 84 + 54 = $138, under $150.','Boxes: 7 + 3 = 10, right at the limit.','People: 7 × 4 + 3 × 5 = 28 + 15 = 43.'],
   lab:{set:{p:7,w:3},look:'Read <b>Your order costs</b>, <b>Boxes</b> and <b>Your order feeds</b>.'},verify:[['cost',138,0],['boxes',10,0],['fed',43,0]]},
  {id:'perperson',kind:'real',lvl:'bio',
   q:'A $12 pizza feeds 4 and an $18 tray of wings feeds 5. If boxes were unlimited, which item gives more food per dollar?',
   choices:['Pizza, at $3.00 a person','Wings, at $3.60 a person','Wings, because a tray feeds more people'],correct:0,
   steps:['Pizza: $12 ÷ 4 people = $3.00 a person.','Wings: $18 ÷ 5 people = $3.60 a person.','Pizza is cheaper per person. The box limit is what makes wings worth adding.']},
  {id:'corner',kind:'test',lvl:'honors',
   q:'Solve the system 12p + 18w = 150 and p + w = 10. How many pizzas are at that corner?',
   num:{ans:5,tol:0,unit:'pizzas'},
   steps:['From the second equation, w = 10 − p.','Substitute: 12p + 18(10 − p) = 150, so 180 − 6p = 150.','p = 5 and w = 5. It feeds 4(5) + 5(5) = 45 people, the most of any order.'],
   lab:{set:{show:true},look:'Read <b>Pizzas in the math’s order</b> and <b>The math’s order feeds</b>.'},verify:[['bestP',5,0],['best',45,0]]},
  {id:'b120',kind:'real',lvl:'honors',
   q:'The budget drops to $120 (still $12 pizzas, $18 trays, at most 10 boxes). What is the most people you can feed?',
   num:{ans:40,tol:0,unit:'people'},
   steps:['All pizza: 10 pizzas cost $120 and fill 10 boxes, feeding 40.','Any tray of wings costs $6 more than a pizza, so swapping one in breaks the budget unless you drop a box, and then you lose people.','The best corner moved to (10, 0): 40 people.'],
   lab:{set:{B:120,show:true},look:'Read <b>The math’s order feeds</b>.'},verify:[['best',40,0],['bestP',10,0]]},
  {id:'b160',kind:'test',lvl:'ap',
   q:'With $160 and 10 boxes, the corner is at p ≈ 3.3, w ≈ 6.7. What is the most people a whole-number order can feed?',
   num:{ans:46,tol:0,unit:'people'},
   steps:['Rounding to 3 pizzas + 7 trays costs 36 + 126 = $162: over budget.','4 pizzas + 6 trays costs 48 + 108 = $156 and uses 10 boxes. It feeds 16 + 30 = 46.','No other whole order inside the region feeds more, so the answer is 46.'],
   lab:{set:{B:160,show:true},look:'Read <b>The math’s order feeds</b> and <b>Pizzas in the math’s order</b>.'},verify:[['best',46,0],['bestP',4,0]]},
  {id:'cheap30',kind:'real',lvl:'ap',
   q:'Change the goal: feed at least 30 people for as little as possible ($12 pizzas, $18 trays, at most 10 boxes). What is the lowest cost?',
   num:{ans:96,tol:0,unit:'$'},
   steps:['Pizza is cheaper per person ($3.00 against $3.60), so start with pizza: 8 pizzas feed 32 for $96.','7 pizzas feed only 28. Adding wings: 5 pizzas + 2 trays feeds exactly 30, also for $96.','No order that feeds 30 costs less than $96, which leaves $54 of a $150 budget.'],
   lab:{set:{goal:'cheap',show:true},look:'Read <b>The math’s order costs</b>.'},verify:[['bestCost',96,0]]}
 ]
}
});
