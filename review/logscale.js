BioLab.addReview({
logscale:{
 questions:[
  {id:'video',kind:'real',lvl:'bio',
   q:'A video has 2,000 views and its views double every 3 days. If that keeps up, about how many views will it have 30 days later?',
   choices:['About 22,000','About 200,000','About 2,000,000','About 2,000,000,000'],correct:2,
   steps:['30 days is 30 ÷ 3 = 10 doublings.','2¹⁰ = 1,024, so the views grow about 1,000 times.','2,000 × 1,024 = 2,048,000: about 2 million. Adding 2,000 every 3 days would give only 22,000.']},
  {id:'halfway',kind:'test',lvl:'honors',
   q:'On a log axis, a point sits exactly halfway between the 1,000 gridline and the 10,000 gridline. About what value does it show?',
   choices:['5,500','3,200','2,000','1,000'],correct:1,
   steps:['Halfway on a log axis is halfway in the exponent: between 10³ and 10⁴ is 10^3.5.','10^3.5 = √(10⁷) ≈ 3,162, so about 3,200.','On a log axis the middle of a decade is not the average (5,500). It is the value that multiplies by the same amount on each side: ×3.16 each way.']},
  {id:'solve',kind:'test',lvl:'honors',
   q:'A model says N = 500 · 1.2ᵗ, with t in days. To the nearest 0.1 day, when does N reach 1,000,000?',
   num:{ans:41.7,tol:0.1,unit:'days'},
   steps:['Set 500 · 1.2ᵗ = 1,000,000, so 1.2ᵗ = 2,000.','Take logs: t · log 1.2 = log 2,000, so t = log 2,000 / log 1.2.','t = 3.3010 / 0.07918 ≈ 41.7 days.']},
  {id:'labfit',kind:'real',lvl:'honors',
   q:'In the lab, choose the Outbreak with a true doubling time of 3 days and turn on the fitted line. To the nearest 0.1 day, at what time does the fitted line pass 1,000,000?',
   num:{ans:39.7,tol:0.1,unit:'days'},
   steps:['The fitted line through log₁₀(count) for days 0 to 14 is log₁₀ N ≈ 2.0795 + 0.09887t.','Set log₁₀ N = 6: t = (6 − 2.0795) / 0.09887 ≈ 39.65, or 39.7 to the nearest 0.1 day.','So the count first passes 1,000,000 on day 40, which is 26 days after day 14. The fit also gives a doubling time of log 2 / 0.09887 ≈ 3.04 days, close to the true 3.'],
   lab:{set:{case:'outbreak',dbl:3,axis:'log',fit:true},look:'Read <b>Fitted line passes 1,000,000 at</b> and <b>Doubling time</b>.'},verify:[['tp',39.65,0.02],['dbl',3.045,0.01]]},
  {id:'slope',kind:'test',lvl:'ap',
   q:'A line through log₁₀(count) against days has slope 0.0753. What is the doubling time, to the nearest 0.1 day?',
   num:{ans:4.0,tol:0.05,unit:'days'},
   steps:['Each day log₁₀ N rises by 0.0753. To double, it must rise by log₁₀ 2 = 0.30103.','Doubling time = 0.30103 / 0.0753 ≈ 4.0 days.','The growth factor is b = 10^0.0753 ≈ 1.19, about 19% a day.']},
  {id:'moore',kind:'real',lvl:'honors',
   q:'Transistor counts on chips roughly doubled every 2 years. By about how many times did they grow over 20 years?',
   choices:['About 20 times','About 100 times','About 1,000 times','About 1,000,000 times'],correct:2,
   steps:['20 years is 10 doublings.','2¹⁰ = 1,024, so about 1,000 times.','On a log axis that is 3 gridlines (10, 100, 1,000) in 20 years: a straight line rising 1.5 gridlines per decade.']},
  {id:'quake',kind:'test',lvl:'ap',
   q:'Each step of 1 in earthquake magnitude means about 10^1.5 ≈ 32 times more energy. About how many times more energy does a magnitude 7 earthquake release than a magnitude 5?',
   choices:['About 2 times','About 64 times','About 1,000 times','About 10,000 times'],correct:2,
   steps:['Two steps of magnitude multiply the energy twice: 10^1.5 × 10^1.5 = 10³.','10³ = 1,000 times more energy.','Multiplying (not adding) 32 twice is the same idea as doubling on a log axis.']}
 ]
}
});
