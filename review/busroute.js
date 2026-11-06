BioLab.addReview({
busroute:{
 questions:[
  {id:'semester',kind:'real',lvl:'bio',
   q:'Leaving at 7:10, Route A was late 4 of your 20 logged mornings. If the rest of the semester looks like your log, about how many late mornings would Route A give you in a 90-day semester?',
   num:{ans:18,tol:0.5,unit:'mornings'},
   steps:['4 late out of 20 is 4 ÷ 20 = 0.2, or 1 morning in 5.','0.2 × 90 = 18 late mornings.','Route B was late 1 of 20: 0.05 × 90 = 4.5, so about 4 or 5.'],
   lab:{set:{leave:40,bell:true},look:'Read <b>Route A: late mornings out of 20</b>.'},verify:[['lateA',4,0.01],['lateB',1,0.01]]},
  {id:'flip',kind:'real',lvl:'bio',
   q:'You start leaving at 7:15, 35 minutes before the bell. Which route is late less often now?',
   choices:['Route A','Route B','They tie'],correct:0,
   steps:['Count the mornings longer than 35 minutes on each route.','Route A: only the 4 missed-transfer mornings (41, 42, 44, 47).','Route B: 36, 36, 36, 37, 37, 38 and 41, so 7 mornings. With less time, Route B’s longer typical morning hurts more than Route A’s tail.'],
   lab:{set:{leave:35,bell:true},look:'Read both late counts.'},verify:[['lateA',4,0.01],['lateB',7,0.01]]},
  {id:'iqrB',kind:'test',lvl:'honors',
   q:'Route B’s 20 mornings in order: 31, 32, 32, 33, 33, 33, 34, 34, 34, 34, 35, 35, 35, 36, 36, 36, 37, 37, 38, 41. Find the IQR.',
   num:{ans:3,tol:0.01,unit:'min'},
   steps:['The lower half is the first 10 values: its median is the average of the 5th and 6th, (33 + 33) ÷ 2 = 33. So Q1 = 33.','The upper half is the last 10: the average of its 5th and 6th values, (36 + 36) ÷ 2 = 36. So Q3 = 36.','IQR = 36 − 33 = 3 minutes.'],
   lab:{set:{},look:'Read <b>Route B IQR</b>.'},verify:[['iqrB',3,0.01],['medB',34.5,0.01]]},
  {id:'fence',kind:'test',lvl:'honors',
   q:'Route A has Q1 = 27.5 min and Q3 = 32.5 min. Using the 1.5 × IQR rule, above how many minutes is a Route A morning an outlier?',
   num:{ans:40,tol:0.01,unit:'min'},
   steps:['IQR = 32.5 − 27.5 = 5 min.','Upper fence = Q3 + 1.5 × IQR = 32.5 + 7.5 = 40 min.','So the 41, 42, 44 and 47 minute mornings are outliers.'],
   lab:{set:{},look:'Read <b>Route A IQR</b> and look for the red × marks.'},verify:[['iqrA',5,0.01],['medA',29.5,0.01]]},
  {id:'skew',kind:'test',lvl:'honors',
   q:'A data set has mean 31.7 and median 29.5. Which shape is most likely?',
   choices:['Skewed right','Skewed left','Symmetric'],correct:0,
   steps:['The mean is pulled toward a long tail; the median is not.','Here the mean is above the median, so the tail is on the high side.','That is right skew, like Route A’s missed-transfer mornings.']},
  {id:'sdB',kind:'ap',lvl:'ap',
   q:'Route B’s mean is 34.8 min. Its sample standard deviation is closest to which value?',
   choices:['0.5 min','2.35 min','6.47 min','10 min'],correct:1,
   steps:['s = √(Σ(x − x̄)² ÷ (n − 1)). The squared deviations from 34.8 add up to 105.2.','105.2 ÷ 19 = 5.537, and √5.537 ≈ 2.35 min.','6.47 min is Route A’s SD: its tail of slow mornings makes it nearly three times as large.'],
   lab:{set:{},look:'Read <b>Route B standard deviation</b> at Deep dive.'},verify:[['sdB',2.353,0.005],['sdA',6.473,0.005]]},
  {id:'apfrq',kind:'ap',lvl:'ap',
   q:'A student summarizes both routes with the mean and SD only, and concludes “Route A is better because its mean is lower.” What is the best criticism?',
   choices:['The mean and SD are not resistant, and Route A is skewed right with outliers, so the median, IQR and the tail past the time allowed are better guides','The mean is always wrong','The SD should be divided by n, not n − 1','Nothing: the lower mean is the faster route on every morning'],correct:0,
   steps:['Route A has four high outliers that pull its mean up and inflate its SD.','The decision is about the right tail: the share of mornings longer than the time you allow.','Leaving at 7:10, that share is 4 in 20 for A and 1 in 20 for B, so the lower mean is the wrong pick.']}
 ]
}
});
