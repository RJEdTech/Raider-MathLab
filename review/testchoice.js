BioLab.addReview({
testchoice:{
 questions:[
  {id:'pick',kind:'real',lvl:'bio',
   q:'You have ACT 28 and SAT 1250. Using national averages (ACT 19.4, SAT 1029) and spreads (ACT 5.9, SAT 235), which score stands out more?',
   choices:['ACT 28','SAT 1250','They are the same'],correct:0,
   steps:['ACT: 28 − 19.4 = 8.6 points above average; 8.6 ÷ 5.9 ≈ 1.46 spreads.','SAT: 1250 − 1029 = 221 points above average; 221 ÷ 235 ≈ 0.94 spreads.','The ACT is farther above its average, so send it. The concordance agrees: ACT 28 matches SAT 1300 to 1320.'],
   lab:{set:{act:28,sat:1250,show:true},look:'Compare <b>ACT: test-takers you beat</b> and <b>SAT: test-takers you beat</b>.'},verify:[['zA',1.458,0.005],['zS',0.940,0.005]]},
  {id:'zact',kind:'test',lvl:'honors',
   q:'The ACT composite has mean 19.4 and SD 5.9. Find the z-score of ACT 31, to two decimal places.',
   num:{ans:1.97,tol:0.01,unit:''},
   steps:['z = (x − mean) / SD.','z = (31 − 19.4) / 5.9 = 11.6 / 5.9.','z ≈ 1.97: about 2 standard deviations above average.'],
   lab:{set:{act:31},look:'Read <b>ACT z-score</b>.'},verify:[['zA',1.966,0.005]]},
  {id:'below',kind:'test',lvl:'honors',
   q:'An SAT score has z = −1. With mean 1029 and SD 235, what is the score, and about what share of test-takers scored below it (68-95-99.7 rule)?',
   choices:['794: about 16%','794: about 32%','1264: about 84%','1029: about 50%'],correct:0,
   steps:['x = mean + z × SD = 1029 − 235 = 794.','68% of scores are within 1 SD, so 32% are outside, split evenly: 16% below −1 SD.','So about 16% of test-takers scored below 794.']},
  {id:'eq',kind:'real',lvl:'honors',
   q:'Under this model, what SAT score has the same z-score as ACT 24? Round to the nearest 10.',
   num:{ans:1210,tol:5,unit:''},
   steps:['z for ACT 24: (24 − 19.4) / 5.9 ≈ 0.780.','SAT score with that z: 1029 + 0.780 × 235 ≈ 1212.','Rounded: about 1210. (The official concordance table says ACT 24 ≈ SAT 1180, range 1160 to 1190: close, but not the same.)'],
   lab:{set:{act:24},look:'Read <b>SAT score with the same z as your ACT</b> at Deep dive.'},verify:[['eqS',1212.2,0.5]]},
  {id:'cdf',kind:'ap',lvl:'ap',
   q:'Using a normal model with mean 1029 and SD 235, what share of SAT takers scored below 1250? Give a decimal to three places.',
   num:{ans:0.827,tol:0.002,unit:''},
   steps:['normalcdf(−1E99, 1250, 1029, 235).','Equivalently z = (1250 − 1029)/235 ≈ 0.940, and the area left of z = 0.940 is about 0.827.','So about 82.7% of test-takers scored below 1250.'],
   lab:{set:{sat:1250,show:true},look:'Read <b>SAT: test-takers you beat</b>.'},verify:[['pS',82.65,0.1]]},
  {id:'frq',kind:'ap',lvl:'ap',
   q:'A student says: “My SAT 1300 is 81% of the top score and my ACT 27 is 75%, so the SAT is clearly stronger.” Which response is best?',
   choices:['Correct: the larger share of the top score wins','The share of the top score ignores each test’s mean and spread; z-scores (1.15 SAT, 1.29 ACT) favor the ACT, but the concordance (ACT 27 ≈ SAT 1260 to 1290) slightly favors the SAT, so this is a close call','The ACT always wins because its scale is smaller','The two scores cannot be compared at all'],correct:1,
   steps:['z for SAT 1300: (1300 − 1029)/235 ≈ 1.15. z for ACT 27: (27 − 19.4)/5.9 ≈ 1.29.','The concordance table puts ACT 27 at SAT 1260 to 1290, just below 1300.','The two methods disagree slightly, which means the scores are about equal. The share of the top score is the one method that is simply not valid.'],
   lab:{set:{act:27,sat:1300},look:'Read both z-scores and the concordance readout.'},verify:[['zS',1.153,0.005],['zA',1.288,0.005]]}
 ]
}
});
