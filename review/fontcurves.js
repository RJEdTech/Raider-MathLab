BioLab.addReview({
fontcurves:{
 questions:[
  {id:'ends',kind:'real',lvl:'bio',
   q:'In a vector drawing app you draw one curve with the pen tool, from P₀ to P₃, with handles P₁ and P₂. Which points will the curve pass through?',
   choices:['All four','P₀ and P₃ only','P₁ and P₂ only','It depends on the app'],correct:1,
   steps:['At t = 0 the weights are 1, 0, 0, 0, so the curve is at P₀.','At t = 1 they are 0, 0, 0, 1, so it is at P₃.','In between, P₁ and P₂ each get at most 4/9 of the weight, so they pull the curve without it reaching them (except in special cases, like all four points on one line).']},
  {id:'mid',kind:'test',lvl:'honors',
   q:'A cubic Bézier has P₀ = (0, 0), P₁ = (0, 100), P₂ = (100, 100) and P₃ = (100, 0). What is the y-coordinate of B(1/2)?',
   num:{ans:75,tol:0.01,unit:''},
   steps:['At t = 1/2 the weights are 1/8, 3/8, 3/8, 1/8.','y = (0 + 3 × 100 + 3 × 100 + 0)/8 = 600/8.','y = 75, so B(1/2) = (50, 75). The curve gets only 3/4 of the way up to the control points.']},
  {id:'weight',kind:'test',lvl:'honors',
   q:'At t = 1/3, how much weight does P₁ get in B(t) = (1 − t)³P₀ + 3(1 − t)²t P₁ + 3(1 − t)t² P₂ + t³P₃? Give a decimal to 3 places.',
   num:{ans:0.444,tol:0.001,unit:''},
   steps:['P₁’s weight is 3(1 − t)²t.','3 × (2/3)² × (1/3) = 3 × 4/9 × 1/3 = 4/9.','4/9 ≈ 0.444, the most weight P₁ ever gets.']},
  {id:'bowl',kind:'real',lvl:'honors',
   q:'The bowl of the D in this tool has P₀ = (140, 60), P₁ = (370, 55), P₂ = (370, 405) and P₃ = (140, 400). How far right (what x) does the bowl reach at t = 1/2?',
   num:{ans:312.5,tol:0.1,unit:'px'},
   steps:['x(1/2) = (x₀ + 3x₁ + 3x₂ + x₃)/8.','= (140 + 1110 + 1110 + 140)/8 = 2500/8.','= 312.5 px. The handles sit 57.5 px outside the letter’s widest point.'],
   lab:{set:{glyph:'D'},act:'fit',look:'Read <b>Your curve’s x at t = 0.5</b> and <b>Average gap</b>.'},verify:[['xhalf',312.5,0.01],['gap',0,0.01]]},
  {id:'linear',kind:'test',lvl:'ap',
   q:'For x-coordinates x₀ = 10, x₁ = 40, x₂ = 70, x₃ = 100 (evenly spaced), what is x(t)?',
   choices:['x(t) = 10 + 90t','x(t) = 10 + 90t³','x(t) = 10 + 30t + 30t² + 30t³','x(t) = 10 + 90t − 90t²'],correct:0,
   steps:['Use x(t) = x₀ + 3(x₁ − x₀)t + 3(x₀ − 2x₁ + x₂)t² + (x₃ − 3x₂ + 3x₁ − x₀)t³.','3(40 − 10) = 90; 3(10 − 80 + 70) = 0; 100 − 210 + 120 − 10 = 0.','So x(t) = 10 + 90t: evenly spaced control points give constant speed.']},
  {id:'solve',kind:'real',lvl:'ap',
   q:'A curve’s x-coordinates run from x₀ = 0 to x₃ = 90. The designer wants x(1/3) = 40 and x(2/3) = 50. Solve for x₁.',
   num:{ans:75,tol:0.01,unit:''},
   steps:['27x(1/3) = 8x₀ + 12x₁ + 6x₂ + x₃ gives 12x₁ + 6x₂ = 1080 − 90 = 990.','27x(2/3) = x₀ + 6x₁ + 12x₂ + 8x₃ gives 6x₁ + 12x₂ = 1350 − 720 = 630.','Double the first and subtract the second: 18x₁ = 1980 − 630 = 1350, so x₁ = 75 (and x₂ = 15).']}
 ]
}
});
