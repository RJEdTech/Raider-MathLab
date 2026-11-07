BioLab.addReview({
hotspot:{
 questions:[
  {id:'wk10',kind:'real',lvl:'bio',
   q:'In the school, run 34, every write-up counts and the hot-spot rule is on. What share of the monitor shifts does Hallway A get in week 10? Round to the nearest percent.',
   num:{ans:85,tol:1,unit:'%'},
   steps:['Week 1 splits the monitors evenly. By chance, A gets 12 write-ups and B gets 10.','Each week the schedule follows the write-ups so far, and more monitors in A see more of A’s minor offenses.','By week 10, A has 146 write-ups and B has 62, so A gets about 85% of the shifts.'],
   lab:{set:{place:'school',count:'all',seed:34,week:10},look:'Read <b>A’s share of patrols this week</b>.'},verify:[['shareA',84.55,0.1]]},
  {id:'ratio20',kind:'real',lvl:'bio',
   q:'Same run, week 20. Both hallways had exactly 460 offenses. How many times as many write-ups does A have as B? Round to the nearest tenth.',
   num:{ans:3.0,tol:0.05,unit:'times'},
   steps:['Read the totals: A has 324 write-ups and B has 107.','324 ÷ 107 ≈ 3.03.','Students in A are written up about 3 times as often, for the same behavior.'],
   lab:{set:{place:'school',count:'all',seed:34,week:20},look:'Read <b>A’s write-ups ÷ B’s</b>.'},verify:[['ratio',3.03,0.01]]},
  {id:'serious',kind:'real',lvl:'bio',
   q:'Same school and run, but the schedule counts only serious incidents, which get reported whether or not anyone patrols. What share of the shifts does A get in week 20?',
   choices:['50%','About 70%','About 90%'],correct:0,
   steps:['Each hallway has exactly 3 serious incidents a week, and they get recorded no matter who is watching.','So the counted totals stay equal every week, and the schedule stays at 50/50.','Minor offenses still get written up, but they no longer steer the monitors.'],
   lab:{set:{place:'school',count:'serious',seed:34,week:20},look:'Read <b>A’s share of patrols this week</b>.'},verify:[['shareA',50,0.001]]},
  {id:'rule',kind:'test',lvl:'honors',
   q:'Under the hot-spot rule, an area’s share of patrols is (its write-ups)² ÷ the sum of every area’s write-ups squared. A has 60% of the write-ups so far and B has 40%. What share of patrols does A get? Round to the nearest tenth of a percent.',
   num:{ans:69.2,tol:0.1,unit:'%'},
   steps:['Squares: 0.6² = 0.36 and 0.4² = 0.16.','A’s share = 0.36 ÷ (0.36 + 0.16) = 0.36 ÷ 0.52 ≈ 0.692.','A gets about 69.2% of the patrols: the rule turns a 60% lead in the data into a bigger lead on the schedule.']},
  {id:'next',kind:'test',lvl:'honors',
   q:'Continue: A gets 69.2% of the patrols. Expected write-ups in an area this week = 16 × its patrol share + 3. What share of this week’s new write-ups do you expect from A? Round to the nearest tenth of a percent.',
   num:{ans:64.0,tol:0.1,unit:'%'},
   steps:['A: 16 × 0.692 + 3 ≈ 14.08. B: 16 × 0.308 + 3 ≈ 7.92.','The total is always 16 + 6 = 22.','A’s share = 14.08 ÷ 22 ≈ 64.0%, more than A’s 60% so far, so A’s lead in the data grows. That is the recursive loop.']},
  {id:'gain',kind:'real',lvl:'ap',
   q:'Two hallways, hot-spot rule (g = 2), every write-up counted, and 20% of the shifts spread evenly no matter what. What is the loop gain L = g(1 − r) × 16 ÷ (16 + 3H)?',
   num:{ans:1.16,tol:0.01,unit:''},
   steps:['g = 2, r = 0.20, H = 2.','L = 2 × 0.8 × 16 ÷ 22 = 25.6 ÷ 22 ≈ 1.16.','L > 1, so the even split is still unstable. It takes r above about 31% to bring L below 1.'],
   lab:{set:{place:'school',count:'all',rule:'hot',rand:20,seed:34,week:20},look:'Read <b>Loop gain L at an even split</b>.'},verify:[['gain',1.1636,0.001]]}
 ]
}
});
