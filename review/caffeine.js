BioLab.addReview({
caffeine:{
 questions:[
  {id:'bedtime',kind:'real',lvl:'bio',
   q:'You drink 150 mg of caffeine at 3 PM. Your half-life is 5 hours. To the nearest milligram, how much is still in you at 10 PM?',
   num:{ans:57,tol:1,unit:'mg'},
   steps:['3 PM to 10 PM is 7 hours.','7 ÷ 5 = 1.4 half-lives.','150 × (1/2)^1.4 ≈ 150 × 0.379 ≈ 56.8, so about 57 mg.'],
   lab:{set:{dose:150,t1:7},act:'show',look:'Read <b>Caffeine in you at 10 PM</b>.'},verify:[['bed',56.84,0.05]]},
  {id:'twohalves',kind:'test',lvl:'bio',
   q:'A drink has 120 mg of caffeine. Your half-life is 5 hours. How much is left 10 hours later?',
   num:{ans:30,tol:0.5,unit:'mg'},
   steps:['10 hours is 2 half-lives.','120 → 60 → 30.','30 mg is left: a quarter, not zero.'],
   lab:{set:{dose:120,t1:10},act:'show',look:'Read <b>Caffeine in you at 10 PM</b>.'},verify:[['bed',30,0.01]]},
  {id:'twodrinks',kind:'real',lvl:'honors',
   q:'Half-life 5 hours. You drink 150 mg at 3 PM and 80 mg at 6 PM. To the nearest milligram, how much is in you at 10 PM?',
   num:{ans:103,tol:1,unit:'mg'},
   steps:['First drink: 7 hours, so 150 × (1/2)^(7/5) ≈ 56.8 mg.','Second drink: 4 hours, so 80 × (1/2)^(4/5) ≈ 45.9 mg.','The amounts add: 56.8 + 45.9 ≈ 103 mg.'],
   lab:{set:{dose:150,t1:7,two:true,dose2:80,t2:4},act:'show',look:'Read <b>Caffeine in you at 10 PM</b>.'},verify:[['bed',102.79,0.05]]},
  {id:'short',kind:'test',lvl:'honors',
   q:'Your half-life is 4 hours. You drink 200 mg 6 hours before bed. To the nearest milligram, how much is left at bedtime?',
   num:{ans:71,tol:1,unit:'mg'},
   steps:['6 ÷ 4 = 1.5 half-lives.','(1/2)^1.5 ≈ 0.354.','200 × 0.354 ≈ 70.7, so about 71 mg.'],
   lab:{set:{dose:200,t1:6,half:4},act:'show',look:'Read <b>Caffeine in you at 10 PM</b>.'},verify:[['bed',70.71,0.05]]},
  {id:'carbon',kind:'real',lvl:'honors',
   q:'Carbon-14 has a half-life of about 5,730 years. A bone has 1/4 of the carbon-14 it had when the animal died. About how old is it?',
   choices:['About 1,430 years','About 5,730 years','About 11,460 years','About 22,920 years'],correct:2,
   steps:['1/4 = (1/2)², so 2 half-lives have passed.','2 × 5,730 = 11,460 years.','It is the same model as caffeine, with years in place of hours.']},
  {id:'hourly',kind:'test',lvl:'ap',
   q:'Your half-life is 6 hours. What percent of the caffeine in your body is still there after one hour? Give one decimal place.',
   num:{ans:89.1,tol:0.1,unit:'%'},
   steps:['Each hour multiplies the amount by (1/2)^(1/6).','(1/2)^(1/6) = 2^(−1/6) ≈ 0.8909.','So 89.1% is left after each hour, and about 10.9% is cleared.'],
   lab:{set:{half:6},look:'Read <b>Fraction left after each hour</b> at Deep dive.'},verify:[['hour',89.09,0.01]]},
  {id:'solve',kind:'test',lvl:'ap',
   q:'Half-life 5 hours. You drink 150 mg. To the nearest tenth of an hour, when is it down to 25 mg?',
   num:{ans:12.9,tol:0.05,unit:'hours'},
   steps:['150(1/2)^(t/5) = 25, so (1/2)^(t/5) = 1/6.','Take logs: t/5 = log₂ 6 ≈ 2.585.','t ≈ 12.9 hours: a 3 PM drink is down to 25 mg just before 4 AM.']}
 ]
}
});
