BioLab.addReview({
sharedwork:{
 questions:[
  {id:'printers',kind:'real',lvl:'bio',
   q:'Printer A prints the yearbook proofs in 30 minutes; printer B takes 60 minutes. Splitting the job, how many minutes do they take?',
   num:{ans:20,tol:0.01,unit:'minutes'},
   steps:['A does 1/30 of the job per minute; B does 1/60.','1/30 + 1/60 = 2/60 + 1/60 = 3/60 = 1/20 of the job per minute.','So the whole job takes 20 minutes.'],
   lab:{set:{scen:'printers',a:30,b:60},act:'show',look:'Read <b>Time working together</b>.'},verify:[['t',20,0.01]]},
  {id:'fence',kind:'real',lvl:'bio',
   q:'Painters who take 3 hours and 5 hours alone paint a fence together. About how long does it take?',
   choices:['4 hours','2.5 hours','About 1.9 hours','8 hours'],correct:2,
   steps:['Rates: 1/3 and 1/5 of the fence per hour.','1/3 + 1/5 = 8/15 per hour.','15/8 = 1.875 hours, about 1 hour 52.5 minutes. Not 4 hours: that is longer than A alone.'],
   lab:{set:{scen:'fence',a:180,b:300},act:'show',look:'Read <b>Time working together</b> in minutes.'},verify:[['t',112.5,0.01]]},
  {id:'pumps',kind:'real',lvl:'honors',
   q:'Two pumps drain a flooded basement. One would take 4 hours alone and the other 6 hours. How many minutes with both?',
   num:{ans:144,tol:0.1,unit:'minutes'},
   steps:['In minutes: 240 and 360.','1/240 + 1/360 = 3/720 + 2/720 = 5/720 = 1/144.','144 minutes, or 2 hours 24 minutes.'],
   lab:{set:{scen:'pumps',a:240,b:360},act:'show',look:'Read <b>Time working together</b>.'},verify:[['t',144,0.01]]},
  {id:'share',kind:'test',lvl:'honors',
   q:'Workers who take 180 and 300 minutes alone share a job. What percent of the job does the faster worker do?',
   num:{ans:62.5,tol:0.1,unit:'%'},
   steps:['Together: t = 180 × 300 ÷ 480 = 112.5 minutes.','The faster worker does 112.5/180 of the job.','= 0.625, or 62.5%. The slower one does 37.5%.'],
   lab:{set:{scen:'fence',a:180,b:300},act:'show',look:'Read <b>Share of the job A does</b>.'},verify:[['shareA',62.5,0.01]]},
  {id:'unknown',kind:'test',lvl:'ap',
   q:'A pump empties a tank alone in 240 minutes. With a second pump it takes 144 minutes. How many minutes would the second pump take alone?',
   num:{ans:360,tol:0.1,unit:'minutes'},
   steps:['1/240 + 1/b = 1/144.','1/b = 1/144 − 1/240 = 5/720 − 3/720 = 2/720 = 1/360.','b = 360 minutes.']},
  {id:'three',kind:'test',lvl:'ap',
   q:'Three workers take 180, 300 and 240 minutes alone. To the nearest tenth of a minute, how long do they take together?',
   num:{ans:76.6,tol:0.1,unit:'minutes'},
   steps:['1/180 + 1/300 + 1/240, with common denominator 3600: 20/3600 + 12/3600 + 15/3600 = 47/3600.','t = 3600/47.','≈ 76.6 minutes.'],
   lab:{set:{scen:'fence',a:180,b:300,three:true,c:240},act:'show',look:'Read <b>Time working together</b> at Closer look.'},verify:[['t',76.596,0.01]]},
  {id:'cashiers',kind:'real',lvl:'honors',
   q:'Each cashier can check out 30 customers an hour. About 100 customers reach the registers each hour. What is the fewest registers that can keep up?',
   choices:['3','4','5','10'],correct:1,
   steps:['Rates add: n cashiers check out 30n customers an hour.','30n ≥ 100 means n ≥ 3.33.','Round up: 4 registers. With 3, the line grows by about 10 customers every hour.']}
 ]
}
});
