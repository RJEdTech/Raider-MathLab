BioLab.addReview({
cooling:{
 questions:[
  {id:'first',kind:'real',lvl:'bio',
   q:'A slice at 190 °F sits in a 70 °F kitchen. In this model it cools 0.10 × (its temperature − 70) degrees per minute. How fast is it cooling at the start?',
   num:{ans:12,tol:0.05,unit:'°F per minute'},
   steps:['The gap is 190 − 70 = 120 °F.','0.10 × 120 = 12 °F per minute.','Later, at 130 °F, the gap is 60 °F and it cools only 6 °F per minute.']},
  {id:'ready',kind:'real',lvl:'bio',
   q:'Same slice: how many minutes until it is down to 130 °F, to the nearest tenth?',
   num:{ans:6.9,tol:0.05,unit:'min'},
   steps:['The gap halves every ln 2 ÷ 0.10 ≈ 6.9 minutes.','130 °F is a gap of 60 °F: half of the starting 120 °F.','So it takes one halving: about 6.9 minutes.'],
   lab:{set:{food:'pizza'},act:'show',look:'Read <b>Minutes to the target</b>.'},verify:[['tmin',6.93,0.01]]},
  {id:'deep',kind:'real',lvl:'honors',
   q:'Leftovers at 150 °F go into a 37 °F fridge in a deep pot (k = 0.006 per minute). To the nearest tenth of an hour, how long until they are down to 40 °F?',
   num:{ans:10.1,tol:0.05,unit:'h'},
   steps:['t = (1/k) ln((T₀ − T_fridge)/(T_target − T_fridge)) = (1/0.006) ln(113/3).','ln(37.67) ≈ 3.629, and 3.629 ÷ 0.006 ≈ 604.8 minutes.','604.8 ÷ 60 ≈ 10.1 hours. In a shallow container (k = 0.02) it takes about 3.0 hours.'],
   lab:{set:{food:'left',box:'deep'},act:'show',look:'Read <b>Reaches the target after</b>.'},verify:[['tmin',604.8,0.1]]},
  {id:'sep',kind:'test',lvl:'ap',
   q:'Solve dT/dt = −k(T − 70) with T(0) = 190. Which is T(t)?',
   choices:['T = 190e^(−kt)','T = 70 + 120e^(−kt)','T = 190 − 70kt','T = 70 + 190e^(−kt)'],correct:1,
   steps:['Separate: dT/(T − 70) = −k dt.','Integrate: ln|T − 70| = −kt + C, so T − 70 = Ae^(−kt).','T(0) = 190 gives A = 120: T = 70 + 120e^(−kt).']},
  {id:'euler',kind:'ap',lvl:'ap',
   q:'dT/dt = −0.1(T − 70), T(0) = 190. Use Euler’s method with two steps of h = 2 minutes to estimate T(4).',
   num:{ans:146.8,tol:0.05,unit:'°F'},
   steps:['Step 1: slope at (0, 190) is −0.1(120) = −12. T(2) ≈ 190 + 2(−12) = 166.','Step 2: slope at (2, 166) is −0.1(96) = −9.6. T(4) ≈ 166 + 2(−9.6) = 146.8.','The exact value is 70 + 120e^(−0.4) ≈ 150.4 °F. Euler runs low because the solution is concave up.']},
  {id:'field',kind:'test',lvl:'honors',
   q:'In the slope field for dT/dt = −0.1(T − 70), what is the slope of the segment at T = 50 °F?',
   num:{ans:2,tol:0.01,unit:'°F per minute'},
   steps:['dT/dt = −0.1(50 − 70) = −0.1(−20) = 2.','Positive: a drink colder than the room warms up toward 70 °F, by the same law.']}
 ]
}
});
