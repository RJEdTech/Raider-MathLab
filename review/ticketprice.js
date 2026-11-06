BioLab.addReview({
ticketprice:{
 questions:[
  {id:'rev12',kind:'real',lvl:'bio',
   q:'At $10 the musical sells 300 tickets, and each $1 increase loses 20 sales. How much revenue does a $12 ticket bring in?',
   num:{ans:3120,tol:0.5,unit:'$'},
   steps:['$12 is $2 above $10, so you lose 2 × 20 = 40 sales: 260 tickets.','Revenue = 260 × $12 = $3,120.'],
   lab:{set:{price:12,show:true},look:'Read <b>Tickets sold</b> and <b>Revenue</b>.'},verify:[['sales',260,0.01],['rev',3120,0.01]]},
  {id:'sales15',kind:'test',lvl:'bio',
   q:'Tickets sold = 300 − 20(p − 10). How many tickets sell at p = $15?',
   choices:['100','200','280','400'],correct:1,
   steps:['p − 10 = 5.','300 − 20 × 5 = 300 − 100 = 200 tickets.'],
   lab:{set:{price:15},look:'Read <b>Tickets sold</b>.'},verify:[['sales',200,0.01]]},
  {id:'vertex',kind:'test',lvl:'honors',
   q:'Revenue is R(p) = −15p² + 450p. What price gives the most revenue?',
   num:{ans:15,tol:0.01,unit:'$'},
   steps:['The vertex of ap² + bp is at p = −b/(2a).','p = −450 / (2 × −15) = 15.','Check with the zeros: R = 0 at p = 0 and p = 30, and 15 is halfway between.']},
  {id:'newshow',kind:'real',lvl:'honors',
   q:'A concert sells 400 tickets at $8, and each $1 increase loses 25 sales. What is the best price, and how much does it bring in?',
   num:{ans:12,tol:0.01,unit:'$'},
   steps:['Sales = 400 − 25(p − 8) = 600 − 25p, so R(p) = p(600 − 25p) = −25p² + 600p.','The zeros are p = 0 and p = 24, so the vertex is p = $12.','At $12 you sell 600 − 300 = 300 tickets: 300 × $12 = $3,600.'],
   lab:{set:{p0:8,q0:400,r:25,cost:0},act:'best',look:'Read <b>Best price</b> and <b>Most money possible</b>.'},verify:[['bestp',12,0.001],['bestv',3600,0.01]]},
  {id:'zero',kind:'test',lvl:'honors',
   q:'With 300 sales at $10 and 20 lost per $1, at what price does revenue fall to $0 because nobody buys?',
   num:{ans:25,tol:0.01,unit:'$'},
   steps:['Set sales to zero: 300 − 20(p − 10) = 0.','20(p − 10) = 300, so p − 10 = 15.','p = $25.'],
   lab:{set:{price:25,show:true},look:'Read <b>Tickets sold</b> and <b>Revenue</b>.'},verify:[['sales',0,0.001],['rev',0,0.001]]},
  {id:'cost3',kind:'real',lvl:'ap',
   q:'Same musical (300 at $10, 20 lost per $1), but each ticket sold costs $3 for a program and printing. What price keeps the most money, and how much is kept?',
   num:{ans:14,tol:0.01,unit:'$'},
   steps:['Money kept = (p − 3)(500 − 20p). Its zeros are p = 3 and p = 25.','The vertex is halfway: (3 + 25)/2 = $14.','At $14: 500 − 280 = 220 tickets, and (14 − 3) × 220 = $2,420 kept.'],
   lab:{set:{cost:3},act:'best',look:'Read <b>Best price</b> and <b>Money kept after costs</b>.'},verify:[['bestp',14,0.001],['kept',2420,0.01]]}
 ]
}
});
