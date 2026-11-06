BioLab.addReview({
splitcost:{
 questions:[
  {id:'six',kind:'real',lvl:'bio',
   q:'A $1,200 cabin is split evenly among 6 friends, and each also pays $35 for food. What does each person pay, in dollars?',
   num:{ans:235,tol:0.01,unit:'dollars'},
   steps:['Cabin share: $1,200 ÷ 6 = $200.','Add the food: $200 + $35.','$235 each.'],
   lab:{set:{scen:'cabin',F:1200,v:35,T:150,n:6},act:'show',look:'Read <b>Cost per person with this group</b>.'},verify:[['each',235,0.01]]},
  {id:'bus48',kind:'real',lvl:'bio',
   q:'A $2,400 charter bus is shared by 48 riders, and each rider’s event ticket is $20. What does each rider pay in all?',
   choices:['$50','$70','$120','$2,420'],correct:1,
   steps:['Bus share: $2,400 ÷ 48 = $50.','Add the ticket: $50 + $20 = $70.'],
   lab:{set:{scen:'bus',F:2400,v:20,T:70,n:48},act:'show',look:'Read <b>Cost per person with this group</b>.'},verify:[['each',70,0.01]]},
  {id:'shirts',kind:'real',lvl:'honors',
   q:'Your club orders T-shirts. The printer charges a $150 setup fee plus $8 per shirt. What is the smallest order that gets the cost to $12 a shirt or less?',
   num:{ans:38,tol:0,unit:'shirts'},
   steps:['Solve 8 + 150/n = 12: 150/n = 4, so n = 37.5.','You cannot order half a shirt, and 37 shirts would cost about $12.05 each, so round up.','38 shirts, at about $11.95 each.'],
   lab:{set:{scen:'shirts',F:150,v:8,T:12},act:'show',look:'Read <b>Smallest group that hits the target</b>.'},verify:[['nstar',38,0]]},
  {id:'asym',kind:'test',lvl:'honors',
   q:'What is the horizontal asymptote of C(n) = (900 + 12n)/n?',
   choices:['C = 0','C = 12','C = 75','C = 900'],correct:1,
   steps:['Split the fraction: C(n) = 900/n + 12.','As n grows, 900/n heads to 0.','So C(n) heads to 12: the horizontal asymptote is C = 12.']},
  {id:'bus50',kind:'test',lvl:'ap',
   q:'Solve (2400 + 20n)/n = 50 for n.',
   num:{ans:80,tol:0,unit:''},
   steps:['Multiply both sides by n: 2400 + 20n = 50n.','2400 = 30n.','n = 80.'],
   lab:{set:{scen:'bus',F:2400,v:20,T:50},act:'show',look:'Read <b>Smallest group that hits the target</b>.'},verify:[['nstar',80,0]]},
  {id:'carpool',kind:'real',lvl:'ap',
   q:'Gas and tolls for a trip cost $60, split evenly among the riders, and nobody has any other cost. How much does the 4th rider save each person, compared with 3 riders?',
   num:{ans:5,tol:0.01,unit:'dollars'},
   steps:['With 3 riders: $60 ÷ 3 = $20 each.','With 4 riders: $60 ÷ 4 = $15 each.','The 4th rider saves each person $5. The 2nd rider saved $30, so the savings shrink fast.']},
  {id:'double',kind:'test',lvl:'ap',
   q:'For C(n) = 35 + 1200/n, how much does each person save when the group doubles from 10 to 20?',
   num:{ans:60,tol:0.01,unit:'dollars'},
   steps:['C(10) = 35 + 120 = 155.','C(20) = 35 + 60 = 95.','155 − 95 = $60. In general, doubling from n saves F/(2n).'],
   lab:{set:{scen:'cabin',F:1200,v:35,T:150,n:10},act:'show',look:'Read <b>Saving each if the group doubles</b>.'},verify:[['dbl',60,0.01]]}
 ]
}
});
