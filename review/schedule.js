BioLab.addReview({
schedule:{
 questions:[
  {id:'rest',kind:'real',lvl:'bio',
   q:'You close the cafe at 10 pm and are scheduled to open at 5 am. How many hours are between your shifts?',
   num:{ans:7,tol:0,unit:'hours'},
   steps:['10 pm to midnight is 2 hours.','Midnight to 5 am is 5 more.','2 + 5 = 7 hours, before your commute and getting ready.']},
  {id:'banprice',kind:'real',lvl:'bio',
   q:'With 7 baristas and the football game on, what does the optimizer say banning clopening costs per week?',
   choices:['$0','About $50','About $150','About $400'],correct:0,
   steps:['The optimizer finds the cheapest week with clopening allowed: $3,968.','It finds the cheapest week with the 10-hour rule: also $3,968.','Price = $3,968 − $3,968 = $0. The same shifts are covered by different people.'],
   lab:{set:{staff:7,foot:true,rainDays:3,noclop:false,posted:false,min20:false,reveal:true},look:'Read <b>Price of no clopening</b> and <b>Clopenings this week</b>.'},verify:[['pban',0,0.5],['cost',3968,0.5]]},
  {id:'need',kind:'test',lvl:'bio',
   q:'At 8 am on a rainy Wednesday the forecast is 65 customers. One barista can serve 20 customers an hour. How many baristas does the cafe need that hour?',
   choices:['3','3.25','4','5'],correct:2,
   steps:['65 ÷ 20 = 3.25 baristas.','You can’t schedule a quarter of a person, so round up.','4 baristas.']},
  {id:'posted',kind:'real',lvl:'honors',
   q:'A week ahead, rain is possible Wednesday, Saturday and Tuesday. It only rains Wednesday. With 7 baristas at $16 an hour, what does posting the schedule 7 days ahead cost per week?',
   num:{ans:288,tol:1,unit:'dollars'},
   steps:['The posted schedule must cover the rain crowd on all three days.','The re-optimized schedule only covers Wednesday’s rain.','The difference is 18 labor hours × $16 = $288 a week.'],
   lab:{set:{staff:7,foot:true,rainDays:3,posted:false,noclop:false,min20:false,reveal:true},look:'Read <b>Price of posting 7 days ahead</b>.'},verify:[['ppost',288,0.5]]},
  {id:'short',kind:'real',lvl:'honors',
   q:'Cut the team from 7 baristas to 6. What happens to the price of no clopening?',
   choices:['It stays $0','It rises to $8 a week, because the Friday closers can’t take Saturday’s early shifts and the short team needs more overtime','It rises to more than $500 a week'],correct:1,
   steps:['Friday’s game keeps several baristas until 10 pm, and Saturday’s busy morning needs early starters.','Under the ban, the Friday closers can’t start early Saturday, and a team of 6 has few other people to use.','The cheapest schedule needs 1 more overtime hour, which costs an extra half wage: 1 × $8 = $8 a week.'],
   lab:{set:{staff:6,foot:true,rainDays:3,noclop:false,posted:false,min20:false,reveal:true},look:'Read <b>Price of no clopening</b>.'},verify:[['pban',8,0.5]]},
  {id:'feasible',kind:'test',lvl:'ap',
   q:'C(S) is the lowest cost over a set S of schedules. Adding a rule shrinks S to a subset S′. Which is always true?',
   choices:['C(S′) ≤ C(S)','C(S′) ≥ C(S)','C(S′) = C(S)','C(S′) = 2C(S)'],correct:1,
   steps:['Every schedule in S′ is also in S.','So the cheapest schedule in S′ is one of the options in S, and C(S) can be no higher than it.','C(S′) ≥ C(S): the price of a rule is never negative, and it is 0 when a cheapest schedule already obeys it.']}
 ]
}
});
