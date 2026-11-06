BioLab.addReview({
survey:{
 questions:[
  {id:'vol',kind:'real',lvl:'bio',
   q:'A club posts a poll on its social account: “Should we move meetings to Saturday?” 64 people vote and 80% say no. What is the main problem with using this to decide?',
   choices:['64 is too small a number to mean anything','Voluntary response: the people who chose to vote may not be like the members who did not','There is no problem: 80% is a clear answer'],correct:1,
   steps:['People decided for themselves whether to vote.','Members who feel strongly, or who check the account often, are overrepresented, so the 80% may lean one way.','A random sample of members would fix the bias.']},
  {id:'kind',kind:'test',lvl:'bio',
   q:'A teacher wants to know how long students spend on homework, so she asks the students sitting in the front row of each class. What kind of sample is this?',
   choices:['A simple random sample','A convenience sample','A stratified random sample'],correct:1,
   steps:['She picked whoever was easiest to reach, not names drawn by chance.','Students who choose the front row may study differently from the rest, so the sample could be biased.']},
  {id:'door',kind:'real',lvl:'honors',
   q:'In this school, asking the first 50 students through the main door missed the true share by about 16.8 percentage points on average. Out of 1,600 students, about how many students’ opinions is that like misjudging?',
   num:{ans:269,tol:2,unit:'students'},
   steps:['16.8 percentage points of 1,600 students is 0.168 × 1,600.','≈ 269 students.'],
   lab:{set:{method:'door',n:50,reveal:true},look:'Read <b>Your method: average miss over 100 surveys</b>.'},verify:[['miss',16.8,0.06]]},
  {id:'bigger',kind:'test',lvl:'honors',
   q:'Student council switches from the first 50 at the door to the first 200 at the door. Which statement is true?',
   choices:['The bias shrinks because the sample is four times bigger','The results vary less from day to day, but they still center on the wrong value','Both bias and variability stay exactly the same'],correct:1,
   steps:['A bigger sample from the same biased method still over-represents early arrivals and misses side-lot drivers.','In this school, the door’s average result is about 31% at n = 200, still far from the true 49.5%, while its spread drops.','Only a random method fixes bias.'],
   lab:{set:{method:'door',n:200,reveal:true},look:'Compare <b>Bias</b> and <b>Variability</b> at n = 50 and n = 200.'},verify:[['bias',-18.5,0.3]]},
  {id:'undercov',kind:'test',lvl:'honors',
   q:'A school surveys students by text, using a list of cell numbers parents gave the school. Some families never gave a number. What is this problem called?',
   choices:['Undercoverage','Voluntary response','Nonresponse'],correct:0,
   steps:['Students with no number on the list have no chance to be chosen.','That is undercoverage. (Nonresponse would be students who were chosen but did not reply.)']},
  {id:'sd',kind:'ap',lvl:'ap',
   q:'In this school the true share is p = 0.495. For a simple random sample of n = 50, what is the standard deviation of p̂, ignoring the finite-population correction?',
   num:{ans:0.0707,tol:0.0005,unit:''},
   steps:['σ = √(p(1 − p)/n) = √(0.495 × 0.505 / 50).','= √(0.0049995) ≈ 0.0707, about 7.1 percentage points.','The 100 simulated surveys give a standard deviation of about 6.9 points, close to the formula.'],
   lab:{set:{method:'srs',n:50,reveal:true},look:'Read <b>Variability</b> and the formula tile at Deep dive.'},verify:[['spread',6.9,0.1]]},
  {id:'strat',kind:'ap',lvl:'ap',
   q:'A school wants to estimate the share of students who want a later start. Opinions differ a lot between bus riders and everyone else, and the transportation office has a list of bus riders. Which design is most likely to give the smallest variability for the same sample size?',
   choices:['A simple random sample of the whole school','A stratified random sample: random samples from bus riders and from non-riders, in proportion to their sizes','A cluster sample of three whole homerooms'],correct:1,
   steps:['Stratifying removes the variation between the strata from the estimate.','That helps most when the strata differ a lot from each other and are similar inside, as bus riders and non-riders are here.','Cluster samples of a few homerooms usually increase variability, because students in one homeroom tend to be alike.']}
 ]
}
});
