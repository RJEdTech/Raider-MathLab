BioLab.addReview({
fuel:{
 questions:[
  {id:'candy90',kind:'real',lvl:'bio',
   q:'In the model, a candy bar’s extra blood sugar peaks at 30 minutes. What share of that peak is left at 90 minutes? Round to the nearest percent.',
   num:{ans:44,tol:1,unit:'%'},
   steps:['After the peak the extra sugar halves about every 30 minutes, but the stomach still sends a little in.','The model gives 43.8% at 90 minutes.','About 44%: less than half of the spike is left at test time.'],
   lab:{set:{food:'candy',test:90},act:'show',look:'Read <b>Share of the peak at test time</b>.'},verify:[['left',43.75,0.2]]},
  {id:'halves',kind:'test',lvl:'bio',
   q:'Nicotine’s half-life is about 2 hours. A level of 8 ng/mL falls to what after 6 hours, ignoring any still being absorbed?',
   num:{ans:1,tol:0.01,unit:'ng/mL'},
   steps:['6 hours is 3 half-lives.','8 → 4 → 2 → 1.','1 ng/mL.']},
  {id:'meal',kind:'real',lvl:'bio',
   q:'At 90 minutes, which still has more of its own peak left: the candy bar or the balanced meal?',
   choices:['The candy bar','The balanced meal','They are the same'],correct:1,
   steps:['The candy bar is at about 44% of its peak.','The meal is at about 84% of its lower, later peak.','The meal’s slower inflow keeps the level steadier.'],
   lab:{set:{food:'meal',test:90},act:'show',look:'Read <b>Share of the peak at test time</b>.'},verify:[['left',84.4,0.3]]},
  {id:'c60',kind:'test',lvl:'honors',
   q:'C(t) = 180(e^(−0.0231t) − e^(−0.0462t)). Find C(120), to 1 decimal place.',
   num:{ans:10.5,tol:0.2,unit:'mg/dL'},
   steps:['e^(−0.0231 · 120) = e^(−2.772) ≈ 0.0626.','e^(−0.0462 · 120) = e^(−5.544) ≈ 0.0039.','180 × (0.0626 − 0.0039) ≈ 10.5 mg/dL.']},
  {id:'tail',kind:'test',lvl:'honors',
   q:'An inflow tank has half-time 45 minutes and the blood 30 minutes. Long after the peak, the level halves about every:',
   choices:['30 minutes','45 minutes','37.5 minutes','75 minutes'],correct:1,
   steps:['The faster exponential dies out first.','What is left is the slower one: e^(−k₁t) with half-time 45 minutes.','So the tail halves about every 45 minutes.']},
  {id:'tstar',kind:'ap',lvl:'ap',
   q:'For C(t) = A(e^(−k₁t) − e^(−k₂t)) with k₂ > k₁ > 0, which gives the time of the maximum?',
   choices:['t* = (k₂ − k₁)/ln(k₂/k₁)','t* = ln(k₂/k₁)/(k₂ − k₁)','t* = ln(k₁k₂)','t* = 1/(k₁ + k₂)'],correct:1,
   steps:['C′(t) = A(−k₁e^(−k₁t) + k₂e^(−k₂t)) = 0.','k₂/k₁ = e^((k₂ − k₁)t).','t* = ln(k₂/k₁)/(k₂ − k₁).']},
  {id:'pouchpk',kind:'ap',lvl:'ap',
   q:'For the pouch, k₁ = 0.00578 and k₂ = 0.08 per minute. When is the peak, to the nearest minute?',
   num:{ans:35,tol:1,unit:'minutes'},
   steps:['k₂/k₁ ≈ 13.85, and ln 13.85 ≈ 2.628.','k₂ − k₁ ≈ 0.0742.','2.628 ÷ 0.0742 ≈ 35 minutes.'],
   lab:{set:{food:'pouch'},act:'show',look:'Read <b>Peak comes at</b>.'},verify:[['tpk',35.4,0.3]]}
 ]
}
});
