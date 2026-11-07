BioLab.addReview({
valueadded:{
 questions:[
  {id:'se25',kind:'test',lvl:'honors',
   q:'One student’s test-score growth varies with a standard deviation of 10 points. What is the standard error of a class average of 25 students?',
   num:{ans:2,tol:0.01,unit:'points'},
   steps:['The standard error of a mean is σ ÷ √n.','10 ÷ √25 = 10 ÷ 5 = 2 points.','Real teachers differ by about 2 points too, so a single class can move a score as much as the teacher does.'],
   lab:{set:{n:25,healthy:false},look:'Read <b>Standard error of one teacher’s score</b>.'},verify:[['se',2,0.001]]},
  {id:'n10',kind:'real',lvl:'bio',
   q:'A small school scores each teacher on only 10 students and fires the lowest 5%. Out of every 100 teachers fired, about how many are actually average or better?',
   choices:['About 0','About 10','About 50'],correct:1,
   steps:['With 10 students a score is off by 10 ÷ √10 ≈ 3.2 points, more than the 2-point differences between teachers.','The simulation runs 2,000 districts and checks each fired teacher’s true effect.','About 10 of every 100 fired teachers are average or better, against about 3 with 25 students.'],
   lab:{set:{n:10,show:true,healthy:false},look:'Read <b>Out of 100 fired: average or better</b>.'},verify:[['per100',10.43,0.05]]},
  {id:'regress',kind:'test',lvl:'bio',
   q:'A teacher scores in the bottom 5% one year, then near the middle the next, with no change in teaching. What explains it?',
   choices:['The teacher must have improved','Regression to the mean: part of the first score was luck, and the luck changed','The second test was easier for everyone'],correct:1,
   steps:['Every score is the teacher’s true effect plus noise from the class.','An extreme score usually has extreme noise in it. Next year the noise is new, so the score lands closer to the teacher’s true level.','In this model, only about 22 of every 100 teachers fired after year 1 would be in the bottom 5% again in year 2.']},
  {id:'erase',kind:'real',lvl:'honors',
   q:'In district 11, Teacher W’s true effect is about +2 points, better than 36 of the other 39 teachers. W’s new class arrives with prior scores inflated by 6 points. What is W’s year-1 rank (1 = lowest)?',
   num:{ans:2,tol:0,unit:''},
   steps:['Growth = this year’s score − last year’s score, so inflating last year’s scores by 6 lowers W’s measured growth by 6.','Without the erasures, W ranks 30th of 40 from the bottom.','With them, W drops to 2nd from the bottom, inside the firing line.'],
   lab:{set:{seed:11,n:25,erase:true,X:6,healthy:false},look:'Read <b>Teacher W’s year-1 rank</b>.'},verify:[['wrank',2,0]]},
  {id:'n80',kind:'test',lvl:'ap',
   q:'True teacher effects have variance 4 and one student’s growth has variance 100. How many students per score give an expected year-to-year correlation of 0.8?',
   num:{ans:100,tol:0,unit:'students'},
   steps:['Expected correlation = 4 ÷ (4 + 100/n).','Set 4 ÷ (4 + 100/n) = 0.8: 4 + 100/n = 5, so 100/n = 1.','n = 100 students, about 4 classes of 25.'],
   lab:{set:{n:100,healthy:false},look:'Read <b>Expected correlation</b>.'},verify:[['rth',0.8,0.0001]]},
  {id:'healthy',kind:'real',lvl:'honors',
   q:'The healthy model averages 3 years of 25-student classes. What is the expected year-to-year correlation now?',
   choices:['0.50','0.75','0.90'],correct:1,
   steps:['Three years of 25 students is 75 students, so the standard error is 10 ÷ √75 ≈ 1.15 points and its square is 100 ÷ 75 ≈ 1.33.','Expected correlation = 4 ÷ (4 + 1.33) = 0.75.','Better, but still far from certain, which is why the healthy model flags teachers for a closer look instead of firing them.'],
   lab:{set:{n:25,healthy:true},look:'Read <b>Expected correlation</b>.'},verify:[['rth',0.75,0.0001]]}
 ]
}
});
