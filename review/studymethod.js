BioLab.addReview({
studymethod:{
 questions:[
  {id:'shuffle',kind:'real',lvl:'bio',
   q:'The flashcard group averaged 21.6 words and the rereading group 18.5. In 100 random reshuffles of the same 30 scores, 2 made a gap of 3.07 words or more. What is the fair conclusion?',
   choices:['Chance rarely makes a gap this big, so practice testing probably helped','The gap is just chance because the scores overlap','Flashcards help every student by about 3 words','You cannot say anything without more students'],correct:0,
   steps:['If the method made no difference, the shuffles show the gaps luck alone produces.','A gap this big showed up in only 2 of 100 shuffles, fewer than 5 in 100.','So chance is a poor explanation, and because the groups were randomly assigned, the method is the likely cause. That is about the average, not every student.'],
   lab:{set:{},act:'show',look:'Read <b>Gap between the averages</b> and <b>Shuffles (of 100) with a gap this big or bigger</b>.'},verify:[['gap',3.067,0.001],['shuf',2,0]]},
  {id:'tdef',kind:'test',lvl:'honors',
   q:'Flashcards: x̄ = 21.6, s = 4.39. Rereading: x̄ = 18.53, s = 2.97. 15 students each. To the nearest 0.01, what is t?',
   num:{ans:2.24,tol:0.01,unit:''},
   steps:['SE = √(4.39²/15 + 2.97²/15) = √(1.284 + 0.589) = √1.873 ≈ 1.369 words.','t = (21.6 − 18.53) ÷ 1.369 ≈ 2.24.','The gap is about 2.2 standard errors, past the 1.76 cutoff for df = 14.'],
   lab:{set:{},act:'show',look:'Read <b>Standard error of the gap</b> and <b>Test statistic t</b>.'},verify:[['t',2.241,0.002],['se',1.369,0.002]]},
  {id:'calc',kind:'test',lvl:'honors',
   q:'Another class: group averages 20.0 and 18.0 words, standard deviations 5.0 and 5.0, 15 per group. What is t, and is the gap convincing at the 5% level (cutoff 1.76)?',
   choices:['t ≈ 1.10: not convincing','t ≈ 2.00: convincing','t ≈ 0.40: not convincing','t ≈ 3.10: convincing'],correct:0,
   steps:['SE = √(25/15 + 25/15) = √3.333 ≈ 1.826 words.','t = 2.0 ÷ 1.826 ≈ 1.10.','1.10 is below 1.76, so a 2-word gap with this much scatter could easily be chance.']},
  {id:'pval',kind:'ap',lvl:'ap',
   q:'For this tool’s class, t = 2.24 with df = 14 and Hₐ: μ_P − μ_R > 0. Which conclusion is correct at α = 0.05?',
   choices:['p ≈ 0.021 < 0.05: reject H₀; there is convincing evidence that practice testing raises the mean score for students like these','p ≈ 0.021: there is a 2.1% chance flashcards do not work','p ≈ 0.042: fail to reject H₀','p ≈ 0.979: fail to reject H₀'],correct:0,
   steps:['p = P(t₁₄ ≥ 2.24) ≈ 0.021.','0.021 < 0.05, so reject H₀.','Because the groups were randomly assigned, the evidence supports a cause-and-effect conclusion for students like the ones in this class. The p-value is not the probability that H₀ is true.']},
  {id:'ci',kind:'ap',lvl:'ap',
   q:'With x̄_P − x̄_R = 3.07, SE = 1.369 and t* = 1.761 (df = 14), which is the 90% confidence interval for μ_P − μ_R?',
   choices:['0.66 to 5.48 words','1.70 to 4.44 words','−0.20 to 6.34 words','2.40 to 3.74 words'],correct:0,
   steps:['Margin of error = 1.761 × 1.369 ≈ 2.41 words.','3.07 ± 2.41 gives about 0.66 to 5.48 words.','The whole interval is above 0, matching the one-sided test that rejects H₀ at α = 0.05.'],
   lab:{set:{},act:'show',look:'Read <b>90% confidence interval for μ_P − μ_R</b>.'}},
  {id:'cause',kind:'ap',lvl:'ap',
   q:'Suppose students had chosen their own study method instead of being randomly assigned, and the flashcard group scored higher. What could you conclude?',
   choices:['Only an association: students who chose flashcards might differ in other ways, such as motivation','The same cause-and-effect conclusion, since the test is the same','Nothing at all, because the test cannot be run','That rereading lowers scores'],correct:0,
   steps:['Random assignment is what balances everything else between the groups.','Without it, a confounding variable such as motivation or prior knowledge could explain the gap.','You can still run the test, but a significant result would only show an association.']},
  {id:'type2',kind:'real',lvl:'honors',
   q:'In a class where flashcards really do help a little, the test says “not enough evidence.” What happened?',
   choices:['A Type II error: a real effect was missed, which is common when the effect is small and the groups are small','A Type I error','The test proved flashcards do not work','The random assignment failed'],correct:0,
   steps:['Missing a real effect is a Type II error.','With 15 students per group and scores that vary by about 4 words, a 1- or 2-word gain hides easily in the scatter.','Not enough evidence is not evidence of no effect. A bigger experiment would have a better chance of detecting it.']}
 ]
}
});
