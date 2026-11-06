BioLab.addReview({
sincode:{
 questions:[
  {id:'oneterm',kind:'real',lvl:'bio',
   q:'Your pendulum swings 30° each way on a 200-pixel arm, and your code uses just sin x ≈ x. How many pixels off is the bob at the end of the swing, to the nearest tenth?',
   num:{ans:4.7,tol:0.1,unit:'px'},
   steps:['30° = π/6 ≈ 0.5236 radian, and sin 30° = 0.5.','The code gives 0.5236 instead of 0.5: off by 0.0236.','On a 200 px arm that is 200 × 0.0236 ≈ 4.7 px. Players would see the bob jump at the ends of the swing.'],
   lab:{set:{widest:30,terms:1},act:'show',look:'Read <b>Worst error on screen</b>.'},verify:[['err',4.72,0.01]]},
  {id:'three',kind:'test',lvl:'honors',
   q:'Use three terms, x − x³/6 + x⁵/120, to estimate sin(0.5). Give five decimal places.',
   num:{ans:0.47943,tol:0.00001,unit:''},
   steps:['0.5 − 0.125/6 + 0.03125/120 = 0.5 − 0.0208333 + 0.0002604.','≈ 0.4794271. The true value is sin(0.5) ≈ 0.4794255, so the error is about 0.0000016.']},
  {id:'bigger',kind:'real',lvl:'honors',
   q:'Your pendulum swings 45° each way, but you draw it with a 400-pixel arm. What is the fewest number of terms that keeps the bob within half a pixel?',
   choices:['1','2','3','4'],correct:2,
   steps:['With a 200 px arm, 2 terms are off by at most 0.49 px at 45°: just barely good enough.','A 400 px arm doubles every error, to 0.98 px, so 2 terms are no longer enough.','3 terms are off by at most 0.007 × 2 ≈ 0.01 px. The answer is 3.'],
   lab:{set:{widest:45,arm:400},act:'best',look:'Read <b>Fewest terms for under 0.5 px</b>.'},verify:[['need',3,0]]},
  {id:'fold',kind:'test',lvl:'honors',
   q:'Your code folds every angle into −90° to 90° before using the polynomial. What angle does it use for sin 250°?',
   choices:['70°','−70°','−110°','20°'],correct:1,
   steps:['Subtract 360°: sin 250° = sin(−110°).','−110° is outside −90° to 90°. Use sin x = sin(−180° − x): sin(−110°) = sin(−70°).','sin(−70°) ≈ −0.940, the same as sin 250°.']},
  {id:'bound',kind:'ap',lvl:'ap',
   q:'You use 2 terms, x − x³/6, for angles up to π/4 on a 200 px arm. Use the alternating series error bound to find the most the bob can be off, to the nearest hundredth of a pixel.',
   num:{ans:0.50,tol:0.01,unit:'px'},
   steps:['The first term left out is x⁵/5! = x⁵/120.','At x = π/4 ≈ 0.7854: 0.7854⁵/120 ≈ 0.002490.','× 200 px ≈ 0.50 px. The bound is just about half a pixel; the true worst error, 0.49 px, is a little less.'],
   lab:{set:{widest:45,terms:2},act:'show',look:'Read <b>Error bound: first term left out</b> and <b>Worst error on screen</b>.'},verify:[['bound',0.498,0.001]]},
  {id:'lagrange',kind:'ap',lvl:'ap',
   q:'You need |sin x − Pₙ(x)| < 0.0025 for every |x| ≤ 1. Using the Lagrange error bound with M = 1, what is the fewest number of terms that guarantees it?',
   choices:['2 terms (through x³)','3 terms (through x⁵)','4 terms (through x⁷)','5 terms (through x⁹)'],correct:1,
   steps:['With terms through x^(2n−1), the bound is |x|^(2n+1)/(2n+1)! ≤ 1/(2n+1)! for |x| ≤ 1.','2 terms: 1/5! = 1/120 ≈ 0.0083, too big.','3 terms: 1/7! = 1/5040 ≈ 0.0002, small enough. So 3 terms.']}
 ]
}
});
