BioLab.addReview({
speedlog:{
 questions:[
  {id:'left8',kind:'real',lvl:'bio',
   q:'For an 8-minute stretch, the speed log reads 30, 45, 60, 60 and 50 mph at 0, 2, 4, 6 and 8 minutes. Use each reading as the speed for the next 2 minutes. About how far did the car go?',
   num:{ans:6.5,tol:0.05,unit:'mi'},
   steps:['2 minutes is 2/60 of an hour.','Four rectangles use the readings at 0, 2, 4 and 6 minutes: 30 + 45 + 60 + 60 = 195 mph.','195 × 2/60 = 6.5 miles. The last reading (50 mph at 8 minutes) starts a slice that is not part of this stretch, so a left sum skips it.']},
  {id:'trap8',kind:'test',lvl:'honors',
   q:'Same log: 30, 45, 60, 60 and 50 mph at 0, 2, 4, 6 and 8 minutes. Estimate the distance with four trapezoids.',
   num:{ans:6.83,tol:0.02,unit:'mi'},
   steps:['Trapezoid sum = Δt × (v₀/2 + v₁ + v₂ + v₃ + v₄/2).','= (2/60) × (15 + 45 + 60 + 60 + 25) = (2/60) × 205.','≈ 6.83 miles. It is the average of the left sum (6.50) and the right sum (7.17).']},
  {id:'trip',kind:'real',lvl:'bio',
   q:'On the tournament drive, keep making the rectangles thinner. What distance do the totals settle on, to the nearest tenth of a mile?',
   num:{ans:36.5,tol:0.05,unit:'mi'},
   steps:['10-minute rectangles give 32.19 mi, 2-minute rectangles 35.97 mi, 30-second rectangles 36.43 mi.','The totals settle on the area under the speed curve: 36.49 mi, or about 36.5 mi.'],
   lab:{set:{drive:'trip',w:0.5},act:'show',look:'Read <b>Distance (area under the curve)</b>, then try each width.'},verify:[['true',36.49,0.01]]},
  {id:'mtn',kind:'real',lvl:'honors',
   q:'For the mountain trip, use only the 2-minute log with trapezoids. What estimate do you get, and how far is it from the true distance?',
   num:{ans:21.48,tol:0.02,unit:'mi'},
   steps:['Trapezoids with Δt = 2 minutes use all 16 readings: 21.48 mi.','The area under the curve is 21.60 mi, so the log-only trapezoids are 0.12 mi under.','Left rectangles from the same log give only 20.34 mi: the car spends most of this drive speeding up, so the start of each slice is low.'],
   lab:{set:{drive:'mtn',w:2,method:'trap'},act:'show',look:'Read <b>Rectangles add up to</b> and <b>Distance</b>.'},verify:[['est',21.48,0.01],['true',21.60,0.01]]},
  {id:'limit',kind:'test',lvl:'ap',
   q:'A car’s speed is v(t) mph, t in hours, for 0 ≤ t ≤ 2. Which expression gives the exact distance traveled?',
   choices:['v(2) − v(0)','lim as n → ∞ of Σ v(tᵢ) Δt, with Δt = 2/n','v(1) × 2','(v(0) + v(2)) ÷ 2'],correct:1,
   steps:['Each term v(tᵢ) Δt is speed × time for one slice: the miles in that slice.','The limit of the sums as the slices get thinner is the definite integral ∫₀² v(t) dt, the exact distance.','v(2) − v(0) is a change in speed, not a distance.']},
  {id:'rank',kind:'ap',lvl:'ap',
   q:'On 0 ≤ t ≤ 10, v(t) is increasing and concave up. Which ordering of the estimates of ∫₀¹⁰ v(t) dt must be true?',
   choices:['Left < true < trapezoid < right','Right < true < left','Trapezoid < true < midpoint','Left < trapezoid < true < right'],correct:0,
   steps:['Increasing: left rectangles sit under the curve and right rectangles over it.','Concave up: the straight top of each trapezoid sits above the curve, so trapezoids overestimate.','Trapezoid = (left + right) ÷ 2, so it is still less than right: left < true < trapezoid < right.']}
 ]
}
});
