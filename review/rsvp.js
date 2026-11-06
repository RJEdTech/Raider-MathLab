BioLab.addReview({
rsvp:{
 questions:[
  {id:'mean30',kind:'real',lvl:'bio',
   q:'You invite 30 people, and each shows up 65% of the time. How many do you expect on an average day?',
   num:{ans:19.5,tol:0.05,unit:'people'},
   steps:['Expected turnout = (people invited) × (chance each comes).','30 × 0.65 = 19.5.','That is just under the 20 you need, so inviting 30 comes up short about half the time.'],
   lab:{set:{n:30,p:65,show:true},look:'Read <b>Expected turnout</b> and <b>Too few show up</b>.'},verify:[['mean',19.5,0.001],['short',49.2,0.1]]},
  {id:'exact20',kind:'test',lvl:'honors',
   q:'X ~ B(30, 0.65). Find P(X = 20), to three decimal places.',
   num:{ans:0.150,tol:0.001},
   steps:['P(X = 20) = C(30, 20)(0.65)²⁰(0.35)¹⁰.','C(30, 20) = 30,045,015; (0.65)²⁰ ≈ 0.00018125; (0.35)¹⁰ ≈ 0.000027585.','Multiply: ≈ 0.150. Exactly 20 people show up about 15 days out of 100.']},
  {id:'reliable',kind:'real',lvl:'honors',
   q:'Your club gets more reliable: each person now shows up 70% of the time. You invite 33. On how many days out of 100 do 20 to 26 people show up?',
   num:{ans:81.7,tol:0.1,unit:'days'},
   steps:['X ~ B(33, 0.70), with mean 23.1.','P(X ≤ 19) ≈ 0.088 and P(X ≥ 27) ≈ 0.094.','P(20 ≤ X ≤ 26) ≈ 1 − 0.088 − 0.094 ≈ 0.817: about 82 good days out of 100.'],
   lab:{set:{n:33,p:70,show:true},look:'Read <b>Good days per 100</b>.'},verify:[['good',81.72,0.05]]},
  {id:'meansd',kind:'test',lvl:'honors',
   q:'X ~ B(40, 0.6). What are the mean and standard deviation of X?',
   choices:['Mean 24, SD 3.10','Mean 24, SD 9.6','Mean 16, SD 3.10','Mean 40, SD 0.6'],correct:0,
   steps:['μ = np = 40 × 0.6 = 24.','σ = √(np(1 − p)) = √(40 × 0.6 × 0.4) = √9.6 ≈ 3.10.','9.6 is the variance; the standard deviation is its square root.'],
   lab:{set:{n:40,p:60,show:true},look:'Read <b>Expected turnout</b> and <b>Standard deviation</b>.'},verify:[['mean',24,0.001],['sd',3.098,0.001]]},
  {id:'largecounts',kind:'ap',lvl:'ap',
   q:'You invite 30 people who each come 75% of the time and want P(20 ≤ X ≤ 26). Should you trust the normal approximation here?',
   choices:['Yes: np = 22.5 is at least 10','Not fully: n(1 − p) = 7.5 is under 10, so use the exact binomial, about 0.857','No: the normal approximation never works for counts','Yes: n = 30 is large enough for any p'],correct:1,
   steps:['Large Counts needs np ≥ 10 and n(1 − p) ≥ 10.','np = 22.5 passes, but n(1 − p) = 30 × 0.25 = 7.5 fails: the distribution is skewed left.','The exact binomial gives P(20 ≤ X ≤ 26) ≈ 0.857; the normal estimate with continuity correction is 0.851. Close here, but the condition says not to count on it.'],
   lab:{set:{n:30,p:75,show:true,normal:true},look:'Compare <b>Good days per 100</b> with the <b>Normal approximation</b>.'},verify:[['good',85.68,0.05],['napprox',85.12,0.05]]},
  {id:'why',kind:'real',lvl:'bio',
   q:'You need 20 volunteers. Why is inviting exactly 20 a bad plan when people show up 65% of the time?',
   choices:['It is a fine plan','On average only 13 would come, and all 20 coming would almost never happen','The venue would overflow'],correct:1,
   steps:['Expected turnout: 20 × 0.65 = 13 people.','For 20 to come, every single person has to show: 0.65²⁰ ≈ 0.0002, about 2 days in 10,000.','You have to invite more people than you need.']}
 ]
}
});
