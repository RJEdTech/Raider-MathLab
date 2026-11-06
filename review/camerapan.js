BioLab.addReview({
camerapan:{
 questions:[
  {id:'pass',kind:'real',lvl:'bio',
   q:'In this race, your teammate passes you at 8.97 m/s and you stand 20 m from the lane. How fast must you pan as she passes, in degrees per second?',
   num:{ans:25.7,tol:0.2,unit:'°/s'},
   steps:['As she passes, the pan rate is her speed ÷ your distance, in radians per second: 8.97 ÷ 20 ≈ 0.448 rad/s.','Convert: 0.448 × 180/π ≈ 0.448 × 57.3 ≈ 25.7°/s.'],
   lab:{set:{race:6.8,dist:20,spot:50},act:'peek',look:'Read <b>Pan rate as she passes you</b>.'},verify:[['pass',25.69,0.02]]},
  {id:'back',kind:'real',lvl:'bio',
   q:'To get a smoother shot, you move back to 40 m from the lane. About how fast must you pan as she passes now?',
   choices:['About 6.4°/s','About 12.8°/s','About 25.7°/s','About 51.4°/s'],correct:1,
   steps:['The pan rate as she passes is v/d. Doubling d halves it.','8.97 ÷ 40 ≈ 0.224 rad/s ≈ 12.8°/s.'],
   lab:{set:{race:6.8,dist:40,spot:50},act:'peek',look:'Read <b>Pan rate as she passes you</b>.'},verify:[['pass',12.85,0.02]]},
  {id:'before',kind:'test',lvl:'honors',
   q:'You stand 15 m from the lane. A runner is 10 m before your spot, running 8.5 m/s. What is your pan rate, in degrees per second?',
   num:{ans:22.5,tol:0.2,unit:'°/s'},
   steps:['dθ/dt = d·v / (d² + u²), with u = −10 m (the sign of u does not matter, since it is squared).','15 × 8.5 / (225 + 100) = 127.5 / 325 ≈ 0.392 rad/s.','0.392 × 57.3 ≈ 22.5°/s.']},
  {id:'chain',kind:'test',lvl:'honors',
   q:'θ = arctan(u/10), where u is in meters and changes at du/dt = 6 m/s. Find dθ/dt when u = 10 m.',
   choices:['0.15 rad/s','0.3 rad/s','0.6 rad/s','3 rad/s'],correct:1,
   steps:['dθ/du = 1 / (1 + (u/10)²) · (1/10) = 10 / (100 + u²).','At u = 10: 10 / 200 = 0.05 rad per meter.','dθ/dt = 0.05 × 6 = 0.3 rad/s, about 17.2°/s.']},
  {id:'maxat0',kind:'ap',lvl:'ap',
   q:'A runner moves at a constant speed v past a camera d meters from the lane. Why is the pan rate d·v / (d² + u²) largest at u = 0?',
   choices:['Because v is largest there','Because d² + u² is smallest when u = 0, and the numerator d·v does not change','Because the angle θ is largest there','Because the derivative of θ is zero there'],correct:1,
   steps:['With d and v fixed, only the denominator changes, and d² + u² is smallest at u = 0.','Formally, d/du [d·v / (d² + u²)] = −2u·d·v / (d² + u²)², which is zero only at u = 0 and changes from positive to negative there, so it is a maximum.','The angle θ itself is 0 there, not largest. When v is still changing, as near the start, the peak can shift slightly.']},
  {id:'focus',kind:'ap',lvl:'ap',
   q:'Your camera’s autofocus tracks the distance r from you to the runner, r = √(d² + u²). With d = 20 m, the runner is 15 m past your spot and running 9 m/s. How fast is r changing?',
   num:{ans:5.4,tol:0.05,unit:'m/s'},
   steps:['Differentiate r² = d² + u² with respect to time: 2r · dr/dt = 2u · du/dt, so dr/dt = (u/r) · du/dt.','r = √(400 + 225) = 25 m.','dr/dt = (15/25) × 9 = 5.4 m/s. As she passes (u = 0), r is not changing at all, even though she is at full speed.']}
 ]
}
});
