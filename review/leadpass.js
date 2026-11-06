BioLab.addReview({
leadpass:{
 questions:[
  {id:'tof',kind:'test',lvl:'honors',
   q:'You throw at 20 m/s and 17.8°, and the ball is caught at the height it left your hand. With g = 9.8 m/s², how long is it in the air, to the nearest hundredth of a second?',
   num:{ans:1.25,tol:0.01,unit:'s'},
   steps:['y(t) = 1.8 + 20 sin 17.8° · t − 4.9t². The ball is back at 1.8 m when 20 sin 17.8° · t − 4.9t² = 0.','Factor out t: t(20 sin 17.8° − 4.9t) = 0, so T = 2(20) sin 17.8° / 9.8.','sin 17.8° ≈ 0.3057, so T ≈ 40(0.3057)/9.8 ≈ 1.25 s.'],
   lab:{set:{arm:20,angle:17.8},look:'Read <b>Time in the air</b>.'},verify:[['tof',1.2477,0.002]]},
  {id:'land',kind:'test',lvl:'honors',
   q:'Same 20 m/s throw, but at 30°. How far downfield does the ball come down, to the nearest tenth of a meter?',
   num:{ans:35.3,tol:0.1,unit:'m'},
   steps:['T = 2(20)(sin 30°)/9.8 = 20/9.8 ≈ 2.041 s.','x(T) = 20 cos 30° · T ≈ 17.32 × 2.041 ≈ 35.3 m.','A receiver who started 15 m out at 7 m/s is only at 15 + 7(2.041) ≈ 29.3 m, so this pass sails about 6.1 m over him.'],
   lab:{set:{arm:20,angle:30,run:7,start:15},act:'show',look:'Read <b>Ball comes down at</b> and <b>Receiver is then at</b>.'},verify:[['land',35.348,0.01],['recv',29.286,0.01]]},
  {id:'lead',kind:'real',lvl:'bio',
   q:'Your receiver is 10 m downfield, running straight away at 6 m/s. Your pass will be in the air 1.2 s. Where should it come down?',
   choices:['10 m downfield, where he is now','16 m downfield','17.2 m downfield','22 m downfield'],correct:2,
   steps:['In 1.2 s he runs 6 × 1.2 = 7.2 m.','He will be at 10 + 7.2 = 17.2 m when the ball comes down, so that is where to throw it.']},
  {id:'angle',kind:'real',lvl:'honors',
   q:'Your receiver is 15 m out at 7 m/s, and you throw at 20 m/s. Which equation do you solve for the launch angle θ that completes the pass?',
   choices:['20 cos θ = 7','(40 sin θ / 9.8)(20 cos θ − 7) = 15','(40 sin θ / 9.8)(20 cos θ) = 15','20 sin θ − 9.8 = 0'],correct:1,
   steps:['The ball comes down at T = 2(20) sin θ / 9.8 = 40 sin θ / 9.8.','At that moment the ball is at 20 cos θ · T and the receiver at 15 + 7T. Set them equal: T(20 cos θ − 7) = 15.','The flatter solution is θ ≈ 17.8°. There is also a lob at about 54.9°, which hangs in the air 3.34 s.'],
   lab:{set:{arm:20,run:7,start:15},act:'best',look:'Read <b>Launch angle</b>, <b>Time in the air</b> and <b>Miss</b>.'},verify:[['angleNow',17.8,0.06],['miss',0,0.06]]},
  {id:'speed',kind:'ap',lvl:'ap',
   q:'A pass has r(t) = ⟨20 cos 30° · t, 1.8 + 20 sin 30° · t − 4.9t²⟩, in meters and seconds. What is the ball’s speed at t = 1 s, to the nearest tenth of a m/s?',
   num:{ans:17.3,tol:0.05,unit:'m/s'},
   steps:['r′(t) = ⟨20 cos 30°, 20 sin 30° − 9.8t⟩ = ⟨17.32, 10 − 9.8t⟩.','At t = 1: r′(1) = ⟨17.32, 0.2⟩.','Speed = |r′(1)| = √(17.32² + 0.2²) ≈ 17.3 m/s. The ball is almost at the top of its arc, so nearly all of its speed is sideways.']},
  {id:'top',kind:'test',lvl:'honors',
   q:'For the same 20 m/s, 30° pass, what is the ball’s speed at the very top of its arc?',
   choices:['0 m/s','10.0 m/s','17.3 m/s','20.0 m/s'],correct:2,
   steps:['At the top, y′(t) = 0.','x′(t) = 20 cos 30° ≈ 17.3 m/s never changes without air resistance.','So the velocity is ⟨17.3, 0⟩ and the speed is 17.3 m/s.'],
   lab:{set:{arm:20,angle:30},look:'Read <b>Speed at the top</b>.'},verify:[['vtop',17.32,0.01]]},
  {id:'arc',kind:'ap',lvl:'ap',
   q:'Set up and evaluate the length of the path of the 20 m/s, 30° pass, from release to catch (T = 20/9.8 s). Give your answer to the nearest tenth of a meter.',
   num:{ans:37.2,tol:0.1,unit:'m'},
   steps:['Arc length = ∫₀ᵀ √(x′(t)² + y′(t)²) dt = ∫₀^{2.041} √(17.32² + (10 − 9.8t)²) dt.','Evaluate with a calculator: about 37.2 m.','The ball comes down 35.3 m downfield, so its path is about 1.9 m longer than the straight distance, because it goes up and comes back down.'],
   lab:{set:{arm:20,angle:30},look:'Read <b>Length of the ball’s path</b>.'},verify:[['arc',37.224,0.01]]}
 ]
}
});
