BioLab.addReview({
rapidtest:{
 questions:[
  {id:'base',kind:'real',lvl:'bio',
   q:'2% of people have an illness right now. A test catches 80% of sick people and wrongly flags 1% of healthy people. Out of 10,000 people, how many test positive in all?',
   num:{ans:258,tol:1,unit:'people'},
   steps:['Sick: 2% of 10,000 = 200. Positives among them: 80% of 200 = 160.','Healthy: 9,800. False positives: 1% of 9,800 = 98.','All positives: 160 + 98 = 258.'],
   lab:{set:{prev:2,sens:80,spec:99,reveal:true},look:'Read <b>Positives out of 10,000</b> and <b>False positives among them</b>.'},verify:[['pos',258,0.01],['fp',98,0.01]]},
  {id:'ppv2',kind:'real',lvl:'bio',
   q:'Same illness and test (2% have it, 80% caught, 1% false positives). You test positive. To the nearest tenth of a percent, what is the chance you are really sick?',
   num:{ans:62.0,tol:0.1,unit:'%'},
   steps:['Real positives: 160. All positives: 258.','160 ÷ 258 ≈ 0.620, so about 62.0%.','Compare: at 1% prevalence the same test gives only 44.7%.'],
   lab:{set:{prev:2,sens:80,spec:99,reveal:true},look:'Read <b>Chance you are really sick</b>.'},verify:[['post',62.02,0.05]]},
  {id:'table',kind:'test',lvl:'honors',
   q:'A two-way table for 10,000 students: Sick and Test + = 45; Sick and Test − = 5; Not sick and Test + = 199; Not sick and Test − = 9,751. What is P(sick | positive)?',
   choices:['45 / 50 = 90%','45 / 244 ≈ 18.4%','45 / 10,000 = 0.45%','199 / 244 ≈ 81.6%'],correct:1,
   steps:['Condition on the Test + column: 45 + 199 = 244 positives.','P(sick | positive) = 45 / 244 ≈ 0.184.','45 / 50 = 90% is P(positive | sick), the sensitivity. The two are easy to swap and very different.']},
  {id:'indep',kind:'test',lvl:'honors',
   q:'In a school, 30% of students play a sport. Among students who ride the bus, 30% play a sport. What can you conclude about “plays a sport” and “rides the bus”?',
   choices:['They are independent: P(sport | bus) = P(sport)','They are dependent, because both are 30%','Nothing without a two-way table of every student'],correct:0,
   steps:['Two events are independent when P(A | B) = P(A).','P(sport | bus) = 30% = P(sport), so knowing a student rides the bus does not change the chance they play a sport.','A test result is useful exactly because it is not independent of being sick.']},
  {id:'spec',kind:'real',lvl:'honors',
   q:'At 1% prevalence and 80% sensitivity, how does P(sick | positive) change if specificity goes from 99% to 99.9%?',
   choices:['It barely changes','It rises from about 44.7% to about 89.0%','It falls'],correct:1,
   steps:['At 99%: false positives = 1% of 9,900 = 99, so 80 / 179 ≈ 44.7%.','At 99.9%: false positives = 0.1% of 9,900 = 9.9, so 80 / 89.9 ≈ 89.0%.','When an illness is rare, the false-positive rate controls the answer.'],
   lab:{set:{prev:1,sens:80,spec:99.9,reveal:true},look:'Read <b>Chance you are really sick</b>, then set specificity back to 99%.'},verify:[['post',88.99,0.05]]},
  {id:'bayes',kind:'ap',lvl:'ap',
   q:'Prevalence 5%, sensitivity 90%, specificity 95%. Use Bayes’ rule to find P(sick | positive), to three decimal places.',
   num:{ans:0.486,tol:0.001,unit:''},
   steps:['P(+) = P(+ | sick)P(sick) + P(+ | not sick)P(not sick) = 0.90(0.05) + 0.05(0.95) = 0.045 + 0.0475 = 0.0925.','P(sick | +) = 0.045 / 0.0925 ≈ 0.486.'],
   lab:{set:{prev:5,sens:90,spec:95,reveal:true},look:'Read <b>Chance you are really sick</b> and the Bayes’ rule line.'},verify:[['post',48.65,0.05]]},
  {id:'twice',kind:'ap',lvl:'ap',
   q:'At 1% prevalence, 80% sensitivity and 99% specificity, one positive gives P(sick | +) ≈ 0.447. Assuming two tests are independent given illness status, what is P(sick | two positives)?',
   choices:['About 0.894: double it','About 0.985','About 0.640: 0.80 × 0.80'],correct:1,
   steps:['Use 0.447 as the new starting chance.','P = 0.80 × 0.447 / (0.80 × 0.447 + 0.01 × 0.553) = 0.3576 / (0.3576 + 0.00553) ≈ 0.985.','Equivalently, per 10,000 people: 64 sick and about 1 healthy person test positive twice.'],
   lab:{set:{prev:1,sens:80,spec:99,second:true,reveal:true},look:'Read <b>Chance you are really sick</b>.'},verify:[['post',98.48,0.05]]}
 ]
}
});
