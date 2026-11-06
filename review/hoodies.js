BioLab.addReview({
hoodies:{
 questions:[
  {id:'rule',kind:'real',lvl:'bio',
   q:'Chest sizes in your club average 39 in with a standard deviation of 4 in. Using the 68-95-99.7 rule, about how many of your 120 members have a chest between 31 and 47 in?',
   num:{ans:114,tol:1,unit:'members'},
   steps:['31 to 47 in is 39 ± 8 in: within 2 standard deviations of the average.','About 95% of a normal distribution lies within 2 SD.','0.95 × 120 = 114 members.']},
  {id:'even',kind:'real',lvl:'bio',
   q:'You order 24 hoodies in every size. Which size runs out worst?',
   choices:['S','M','L','2XL'],correct:1,
   steps:['The curve expects about 46 mediums, the most of any size.','With only 24 mediums, about 22 members who need M can’t get one.','Smalls run short too (about 37 expected, 13 short), while about 23 2XL hoodies go unused.'],
   lab:{set:{plan:'even',show:true},look:'Read the dashed bars and <b>Members without their size</b>.'},verify:[['wrong',39.98,0.05],['eM',45.95,0.05]]},
  {id:'zcut',kind:'test',lvl:'honors',
   q:'With mean 39 in and SD 4 in, find the z-scores of the L size range, 41 to 45 in.',
   choices:['0.5 and 1.5','1 and 2','41 and 45','−0.5 and 0.5'],correct:0,
   steps:['z = (x − μ)/σ.','(41 − 39)/4 = 0.5 and (45 − 39)/4 = 1.5.','So the L range runs from 0.5 to 1.5 SD above the mean.']},
  {id:'large',kind:'test',lvl:'honors',
   q:'The area under the standard normal curve between z = 0.5 and z = 1.5 is about 0.242. How many larges should you order out of 120?',
   num:{ans:29,tol:0.5,unit:'hoodies'},
   steps:['Expected larges = 120 × 0.242.','120 × 0.2417 ≈ 29.0.','Order 29 larges.'],
   lab:{set:{show:true},look:'Read <b>Model count: L</b>.'},verify:[['eL',29.01,0.05]]},
  {id:'xl',kind:'ap',lvl:'ap',
   q:'Use normalcdf to find the expected number of XL hoodies (45 to 49 in) when μ = 39 and σ = 4. Give one decimal place.',
   num:{ans:7.3,tol:0.1,unit:'hoodies'},
   steps:['normalcdf(45, 49, 39, 4) ≈ 0.0606.','120 × 0.0606 ≈ 7.27.','About 7.3, so order 7 XL.'],
   lab:{set:{mu:39,sd:4},look:'Read <b>Model count: XL</b>.'},verify:[['eXL',7.27,0.05]]},
  {id:'spread',kind:'ap',lvl:'ap',
   q:'Another club has the same average chest size, 39 in, but a larger SD, 5 in. What happens to the expected number of mediums (37 to 41 in)?',
   choices:['It goes down: a wider curve puts less area near the middle','It goes up: more spread means more people','It stays the same: the mean did not change'],correct:0,
   steps:['With σ = 5 the M range is z = −0.4 to 0.4, an area of about 0.311.','120 × 0.311 ≈ 37.3 mediums, down from about 46 with σ = 4.','The total area is always 1, so a wider curve is lower in the middle and puts more members in XL and 2XL.'],
   lab:{set:{mu:39,sd:5},look:'Read <b>Model count: M</b> at Closer look.'},verify:[['eM',37.30,0.05]]}
 ]
}
});
