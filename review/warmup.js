BioLab.addReview({
warmup:{
 questions:[
  {id:'conf',kind:'real',lvl:'bio',
   q:'Your track coach notices that runners who stretch extra after practice have faster mile times. Can you conclude that extra stretching makes runners faster?',
   choices:['Yes: the stretchers are faster','No: runners who choose to stretch extra may differ in other ways, such as how hard they train','No: stretching always slows runners down'],correct:1,
   steps:['The runners chose for themselves, so stretching is mixed up with everything else about them.','Dedicated runners may both stretch more and train harder. Training is a confounding variable.','To test stretching itself, randomly assign who stretches extra.']},
  {id:'control',kind:'test',lvl:'bio',
   q:'In the random-half warm-up test, half the team does the new warm-up and half does the old one, on the same day. Which group is the control group?',
   choices:['The players who do the new warm-up','The players who do the old warm-up','The coach'],correct:1,
   steps:['The control group gets the usual treatment, here the old warm-up.','It gives you something fair to compare with: same day, same wind, same track.']},
  {id:'diff',kind:'real',lvl:'honors',
   q:'In one random-half test, the new warm-up group averages 5.33 s and the old warm-up group averages 5.41 s. What is the estimated effect of the new warm-up?',
   num:{ans:0.08,tol:0.001,unit:'s faster'},
   steps:['Effect = old average − new average = 5.41 − 5.33 = 0.08 s.','That is one run. Chance alone moves this estimate around, so one run is evidence, not proof.']},
  {id:'obs',kind:'test',lvl:'honors',
   q:'A researcher surveys 500 high school sprinters about their warm-up routines and their best times, and finds that dynamic warm-ups go with faster times. What kind of study is this, and what can it show?',
   choices:['An experiment; it shows dynamic warm-ups cause faster times','An observational study; it shows a link but cannot show cause','A randomized experiment, because 500 is a large sample'],correct:1,
   steps:['No one assigned the warm-ups; the researcher only recorded them. That makes it observational.','Faster sprinters may also have better coaches or more training. Only random assignment can show cause.']},
  {id:'vol',kind:'real',lvl:'honors',
   q:'On this team, the volunteers plan says on average that the warm-up saves about 0.36 s. The truth is 0.06 s. About how many times the real effect is that?',
   num:{ans:6.0,tol:0.1,unit:'times'},
   steps:['0.36 ÷ 0.06 = 6.0.','The volunteers were mostly faster players, so the comparison counted their head start as warm-up effect.'],
   lab:{set:{design:'vol',team:30,reveal:true},look:'Read <b>Your plan: average estimate over 100 runs</b>.'},verify:[['avg',0.3585,0.002]]},
  {id:'ptest',kind:'ap',lvl:'ap',
   q:'One random-half run estimates that the warm-up saves 0.089 s. Reshuffling the 30 players’ groups 500 times, 102 of the reshuffles give a difference at least that large. What is the P-value, and what do you conclude at α = 0.05?',
   choices:['P ≈ 0.204; this run is not convincing evidence that the warm-up helps','P ≈ 0.204; this run proves the warm-up does nothing','P ≈ 0.796; strong evidence the warm-up helps'],correct:0,
   steps:['P = 102 / 500 = 0.204.','0.204 > 0.05, so a difference this big happens often by chance alone. Fail to reject H₀.','That is not proof of no effect: the effect is small, and one run of 30 players is not precise enough to show it.'],
   lab:{set:{design:'rand',team:30},look:'At Deep dive, open the graph <b>Randomization distribution</b> and read the P-value tile.'},verify:[['pval',0.204,0.001],['est',0.089,0.001]]},
  {id:'pairs',kind:'ap',lvl:'ap',
   q:'Which plan is a matched pairs design for testing the warm-up?',
   choices:['Pair players with similar 40-yard times, then flip a coin in each pair to decide who does the new warm-up','Let each player pick a partner, and the faster partner does the new warm-up','Give the new warm-up to the 15 fastest players'],correct:0,
   steps:['Matched pairs: form pairs of similar subjects, then randomly assign the treatments inside each pair.','Similar speeds make the comparison inside each pair fair, and the coin flip prevents bias.','Choosing the faster partner or the fastest players builds in confounding.']}
 ]
}
});
