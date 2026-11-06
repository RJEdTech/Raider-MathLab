BioLab.addReview({
bottle:{
 questions:[
  {id:'cyl',kind:'real',lvl:'bio',
   q:'A straight bottle is 6.4 cm across inside and its straight part is 20 cm tall. How many mL does that straight part hold?',
   num:{ans:643,tol:1,unit:'mL'},
   steps:['Radius = 6.4 ÷ 2 = 3.2 cm.','Volume = π × 3.2² × 20 = π × 10.24 × 20 ≈ 643.4 cm³.','1 cm³ = 1 mL, so about 643 mL. Bottle A’s shoulder and neck add about 85 mL more.']},
  {id:'compare',kind:'real',lvl:'bio',
   q:'How much more does bottle B hold than bottle A, to the nearest 10 mL?',
   num:{ans:410,tol:10,unit:'mL'},
   steps:['Bottle B holds about 1,138 mL; bottle A holds about 729 mL.','1,138 − 729 = 409 mL, about 410 mL more.','B is shorter but wider, and volume grows with the radius squared.'],
   lab:{set:{bottle:'B'},act:'show',look:'Read <b>Holds (exact)</b>, then switch to bottle A.'},verify:[['V',1137.7,0.1]]},
  {id:'disks',kind:'test',lvl:'honors',
   q:'Estimate a vase’s volume with 3 disks, each 5 cm thick, using radii of 4, 5 and 3 cm at the middle of each slice.',
   num:{ans:785.4,tol:0.5,unit:'cm³'},
   steps:['Each disk holds π r² × 5.','Total = 5π(4² + 5² + 3²) = 5π(16 + 25 + 9) = 250π.','250π ≈ 785.4 cm³.']},
  {id:'washer',kind:'test',lvl:'honors',
   q:'An insulated cup’s inner wall is a cylinder of radius 3.5 cm, and its outer wall a cylinder of radius 4 cm, both 15 cm tall. How much space is between the walls?',
   num:{ans:176.7,tol:0.2,unit:'cm³'},
   steps:['Each slice is a washer: π(R² − r²)Δx.','V = π(4² − 3.5²) × 15 = π(16 − 12.25) × 15 = 56.25π.','56.25π ≈ 176.7 cm³. That is 176.7 mL you see from outside but can’t fill.']},
  {id:'wallB',kind:'real',lvl:'honors',
   q:'Bottle B gets a straight outer wall 0.5 cm beyond its widest point. How many mL of the outside size does the double wall take up?',
   num:{ans:408,tol:1,unit:'mL'},
   steps:['Inside the outer wall: ∫ π R(x)² dx ≈ 1,545.8 mL.','The inside holds ∫ π r(x)² dx ≈ 1,137.7 mL.','The wall space is the washer integral ∫ π(R² − r²) dx ≈ 408 mL.'],
   lab:{set:{bottle:'B',wall:true,gap:0.5},act:'show',look:'Read <b>The double wall takes up</b>.'},verify:[['wallV',408.06,0.1],['area',15.56,0.01]]},
  {id:'integral',kind:'ap',lvl:'ap',
   q:'The region under y = √x from x = 0 to x = 4 is spun around the x-axis to make a nose-cone shape (units in cm). What is its volume?',
   num:{ans:25.13,tol:0.02,unit:'cm³'},
   steps:['Disk method: V = ∫₀⁴ π(√x)² dx = π∫₀⁴ x dx.','= π[x²/2]₀⁴ = π × 8 = 8π.','8π ≈ 25.13 cm³.']},
  {id:'deg',kind:'test',lvl:'ap',
   q:'A cup’s inside radius is r(x) = 3 + 0.1x cm for 0 ≤ x ≤ 10. Find its volume.',
   num:{ans:387.5,tol:0.2,unit:'cm³'},
   steps:['V = ∫₀¹⁰ π(3 + 0.1x)² dx = π∫₀¹⁰ (9 + 0.6x + 0.01x²) dx.','= π[9x + 0.3x² + 0.01x³/3] from 0 to 10 = π(90 + 30 + 3.33) ≈ 123.33π.','≈ 387.5 cm³. Check: it is a frustum, πh(R² + Rr + r²)/3 = π × 10 × (16 + 12 + 9)/3 ≈ 123.33π.']}
 ]
}
});
