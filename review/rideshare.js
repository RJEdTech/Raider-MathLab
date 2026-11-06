BioLab.addReview({
rideshare:{
 questions:[
  {id:'fare12',kind:'test',lvl:'bio',
   q:'Velo charges $5 to start plus $1.50 a mile. What is the fare for a 12 mi ride?',
   num:{ans:23,tol:0.01,unit:'$'},
   steps:['f(12) = 5 + 1.50 × 12.','1.50 × 12 = 18, and 5 + 18 = $23.00.'],
   lab:{set:{x:12,show:true},look:'Read <b>A costs (this trip)</b>.'},verify:[['costA',23,0.001]]},
  {id:'short4',kind:'real',lvl:'bio',
   q:'Your ride to practice is 4 mi, 20 times a month. Velo is $5 + $1.50 a mile; Pronto is $2 + $2 a mile. Which should you use, and how much does it save each month?',
   choices:['Velo, $20 a month','Pronto, $20 a month','Pronto, $1 a month','They cost the same'],correct:1,
   steps:['Velo: 5 + 1.50 × 4 = $11.00. Pronto: 2 + 2 × 4 = $10.00.','Pronto saves $1.00 a ride.','20 rides × $1.00 = $20 a month.'],
   lab:{set:{x:4,trips:20,show:true},look:'Read both costs and <b>Cheaper pick saves per month</b>.'},verify:[['save',20,0.001],['costB',10,0.001]]},
  {id:'tie4',kind:'test',lvl:'honors',
   q:'Company A charges $3 + $1.75 a mile. Company B charges $1 + $2.25 a mile. At what distance do they cost the same?',
   num:{ans:4,tol:0.01,unit:'mi'},
   steps:['Set them equal: 3 + 1.75m = 1 + 2.25m.','Subtract 1.75m and 1 from both sides: 2 = 0.5m.','m = 4 mi. Both cost 3 + 7 = $10.00 there.'],
   lab:{set:{aB:3,aR:1.75,bB:1,bR:2.25,show:true},look:'Read <b>Tie point</b> and find where the lines cross.'},verify:[['tie',4,0.001]]},
  {id:'phone8',kind:'real',lvl:'honors',
   q:'Flex costs $15 a month + $8 per GB. Steady costs $40 a month + $3 per GB. You use about 8 GB a month. How much does the cheaper plan save in a year?',
   num:{ans:180,tol:0.01,unit:'$'},
   steps:['Flex: 15 + 8 × 8 = $79. Steady: 40 + 3 × 8 = $64.','Steady saves $15 a month.','12 × $15 = $180 a year.'],
   lab:{set:{sc:'phone',aB:15,aR:8,bB:40,bR:3,x:8,show:true},look:'Read <b>Cheaper pick saves per month</b>, then multiply by 12.'},verify:[['save',15,0.001],['tie',5,0.001]]},
  {id:'tie5',kind:'test',lvl:'ap',
   q:'Company A charges $4 + $1.25 a mile. Company B charges $1.50 + $1.75 a mile. Find the tie point, and say which company wins a 12 mi ride.',
   choices:['5 mi; A wins','5 mi; B wins','2.5 mi; A wins','12 mi; they tie'],correct:0,
   steps:['4 + 1.25m = 1.50 + 1.75m gives 2.50 = 0.50m, so m = 5 mi.','Past the tie, the smaller slope wins: A charges $0.50 less per mile.','At 12 mi: A is 4 + 15 = $19.00 and B is 1.50 + 21 = $22.50.'],
   lab:{set:{aB:4,aR:1.25,bB:1.5,bR:1.75,x:12,show:true},look:'Read <b>Tie point</b> and both costs.'},verify:[['tie',5,0.001],['costA',19,0.001],['costB',22.5,0.001]]},
  {id:'formula',kind:'test',lvl:'ap',
   q:'Two prices are a + bm and c + dm, with b ≠ d. Which expression gives the tie point?',
   choices:['m = (c − a) ÷ (b − d)','m = (a − c) ÷ (b − d)','m = (c + a) ÷ (b + d)','m = (b − d) ÷ (c − a)'],correct:0,
   steps:['Set them equal: a + bm = c + dm.','Move the m terms to one side and the constants to the other: bm − dm = c − a.','Factor and divide: m = (c − a) ÷ (b − d). If b = d the lines are parallel and never tie.']}
 ]
}
});
