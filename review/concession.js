BioLab.addReview({
concession:{
 questions:[
  {id:'tenmin',kind:'real',lvl:'bio',
   q:'At 8:10 PM there are 10 people in your line. For the next 10 minutes fans arrive at about 8 a minute, and your 4 volunteers serve 4 a minute. About how many people are in line at 8:20 PM?',
   num:{ans:50,tol:0.5,unit:'people'},
   steps:['Each minute the line changes by 8 − 4 = 4 people.','Over 10 minutes that is 4 × 10 = 40 more people.','10 + 40 = 50 people.']},
  {id:'wait',kind:'real',lvl:'bio',
   q:'Your line peaks at 52 people and your 4 volunteers serve 4 people a minute. About how long does the last person in that line wait?',
   num:{ans:13,tol:0.5,unit:'min'},
   steps:['Everyone ahead of them has to be served first: 52 people.','At 4 people a minute that takes 52 ÷ 4 = 13 minutes.']},
  {id:'deriv',kind:'test',lvl:'honors',
   q:'L(t) is the number of people in line, A(t) the arrival rate and S the service rate, in people per minute. At 8:25 PM, A = 2.4 and S = 4, and there is a line. Find L′ at 8:25 PM and say what it means.',
   num:{ans:-1.6,tol:0.05,unit:'people per minute'},
   steps:['While there is a line, L′(t) = A(t) − S.','L′ = 2.4 − 4 = −1.6.','The line is shrinking by about 1.6 people per minute at 8:25 PM.']},
  {id:'five',kind:'real',lvl:'honors',
   q:'You staff 5 volunteers instead of 4. How long does the longest line get, to the nearest person?',
   num:{ans:39,tol:0.5,unit:'people'},
   steps:['With S = 5 the line grows only while A(t) > 5.','The halftime line starts at about 8:07 PM and peaks when A falls back to 5, at about 8:19 PM.','The area between A(t) and 5 over that time is about 38.6, so about 39 people.'],
   lab:{set:{vol:5},act:'show',look:'Read <b>Longest line</b> and <b>Longest line at</b>.'},verify:[['maxL',38.59,0.1]]},
  {id:'cand',kind:'ap',lvl:'ap',
   q:'People wait in line for a ride. The line has 12 people at t = 0 and L(t) = 12 + ∫₀ᵗ (A(x) − S) dx for 0 ≤ t ≤ 60 minutes, and A(x) − S changes sign only at t = 15 (from positive to negative) and t = 40 (from negative to positive). Which values must you compare to find the longest line?',
   choices:['Only L(15)','L(0), L(15), L(40) and L(60)','L(0), L(15) and L(60)','Only L(60)'],correct:2,
   steps:['Candidates: the endpoints t = 0 and t = 60, and where L′ = A − S changes sign.','At t = 15, L′ changes from + to −: a local maximum. At t = 40, L′ changes from − to +: a local minimum, which can’t be the greatest value.','So compare L(0), L(15) and L(60). (Including L(40) does no harm, but it can’t win.)']},
  {id:'staff',kind:'test',lvl:'ap',
   q:'You want the longest halftime line under 20 people. Each volunteer serves 1 customer a minute. What is the fewest volunteers that works?',
   num:{ans:7,tol:0,unit:'volunteers'},
   steps:['Find the peak line for each staffing level: the area between A(t) and S while A > S.','5 volunteers: about 39 people. 6: about 27. 7: about 17.','Seven volunteers is the fewest that keeps the line under 20.'],
   lab:{set:{target:20},act:'staff',look:'Read <b>Fewest volunteers for your target</b> and <b>Longest line</b>.'},verify:[['need',7,0],['maxL',17.1,0.1]]}
 ]
}
});
