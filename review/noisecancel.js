BioLab.addReview({
noisecancel:{
 questions:[
  {id:'halfp',kind:'test',lvl:'bio',
   q:'A fan whirs at 250 Hz (250 cycles per second). How many milliseconds should the anti-noise be shifted to cancel it?',
   num:{ans:2,tol:0.01,unit:'ms'},
   steps:['One cycle lasts 1 ÷ 250 s = 0.004 s = 4 ms.','Cancel it by shifting half a cycle.','4 ÷ 2 = 2 ms, a phase shift of 180°.'],
   lab:{set:{src:'fan',ph:180,amp:1},look:'Read <b>Half a period of this noise</b> at Closer look.'},verify:[['half',2,0.0001]]},
  {id:'which',kind:'real',lvl:'bio',
   q:'Which sound do noise-canceling headphones cancel best?',
   choices:['A baby crying nearby','The steady drone of a plane’s engines','A sudden door slam','A friend talking'],correct:1,
   steps:['Anti-noise works best on sounds that are steady, so the headphones can predict the next cycle.','It also works best on low sounds, where a tiny timing error is a small part of each cycle.','An engine drone is both steady and low. Crying, slams and voices are higher and change quickly.']},
  {id:'halfamp',kind:'test',lvl:'honors',
   q:'The anti-noise is perfectly timed but has half the noise’s amplitude, so half the amplitude is left. By how many decibels is the noise cut, to the nearest 0.1?',
   num:{ans:6.0,tol:0.1,unit:'dB'},
   steps:['The cut is 20 log₁₀(original amplitude ÷ leftover amplitude).','20 log₁₀(1 ÷ 0.5) = 20 log₁₀ 2.','≈ 20 × 0.301 = 6.0 dB.'],
   lab:{set:{src:'hum',ph:180,amp:0.5,jit:0.05},look:'Read <b>Noise cut by</b>.'},verify:[['db',6.02,0.02]]},
  {id:'tenpct',kind:'real',lvl:'honors',
   q:'Good headphones leave 10% of a drone’s amplitude. How many decibels quieter is the drone?',
   num:{ans:20,tol:0.1,unit:'dB'},
   steps:['The leftover amplitude ratio is 0.1.','20 log₁₀(1 ÷ 0.1) = 20 log₁₀ 10 = 20 dB.','That is 100 times less sound power, because power goes with amplitude squared.']},
  {id:'phaseerr',kind:'test',lvl:'ap',
   q:'The anti-noise matches the noise’s amplitude but is shifted 198° instead of 180°. How many decibels is the noise cut, to the nearest 0.1?',
   num:{ans:10.1,tol:0.1,unit:'dB'},
   steps:['The leftover amplitude is |1 + e^(i·198°)| = √(2 + 2 cos 198°) = 2 sin(9°) ≈ 0.313.','The cut is 20 log₁₀(1 ÷ 0.313).','≈ 10.1 dB. Only 18° off, and most of the cancellation is gone.']},
  {id:'best1000',kind:'test',lvl:'ap',
   q:'At 1000 Hz, the electronics can be off by up to 0.05 ms. To the nearest degree, what phase angle is that?',
   num:{ans:18,tol:0.5,unit:'°'},
   steps:['One cycle at 1000 Hz lasts 1 ms, which is 360°.','0.05 ms is 0.05 of a cycle.','0.05 × 360° = 18°. In this model, that limits the best possible cut to about 14.9 dB.'],
   lab:{set:{src:'voice',jit:0.05},act:'cancel',look:'Read <b>Wobble as a phase angle</b> and <b>Best possible cut</b>.'},verify:[['eps',18,0.01],['best',14.89,0.02]]}
 ]
}
});
