BioLab.addReview({
fryshort:{
 questions:[
  {id:'post',kind:'real',lvl:'bio',
   q:'Your 12 boxes average 4.02 oz against a listed 4.1 oz. In a simulation, 15 of 100 honest restaurants came out as light as yours or lighter. Your friend wants to post “they’re shorting us” online. What is the fair conclusion?',
   choices:['They are shorting us: the average is under the label','Not enough evidence: honest restaurants look this light fairly often','They are definitely honest','The scale must be broken'],correct:1,
   steps:['An honest restaurant’s 12-box average lands at least this far under about 15 times in 100, just from scooping luck.','That is not rare, so luck is a reasonable explanation. You do not have convincing evidence of shorting.','That does not prove the restaurant is honest either: it only means these 12 boxes cannot tell.'],
   lab:{set:{},act:'show',look:'Read <b>Average of your 12 boxes</b> and <b>Honest restaurants (of 100) this light or lighter</b>.'},verify:[['avg',4.021,0.001],['light',15,0]]},
  {id:'tdef',kind:'test',lvl:'honors',
   q:'The 12 boxes in this tool have x̄ = 4.021 oz and s = 0.248 oz. To the nearest 0.01, what is the test statistic t for H₀: μ = 4.1?',
   num:{ans:-1.11,tol:0.01,unit:''},
   steps:['Standard error: s/√n = 0.248 ÷ √12 = 0.0716 oz.','t = (x̄ − 4.1) ÷ SE = (4.021 − 4.1) ÷ 0.0716 ≈ −1.11.','The average sits about 1.1 standard errors under the listed weight, not far enough to pass −1.80.'],
   lab:{set:{},act:'show',look:'Read <b>Test statistic t</b> and <b>Wobble of a 12-box average</b>.'},verify:[['t',-1.105,0.002],['se',0.0716,0.0002]]},
  {id:'tcalc',kind:'test',lvl:'honors',
   q:'Another group weighs 12 boxes: x̄ = 3.95 oz, s = 0.20 oz. To the nearest 0.01, what is t?',
   num:{ans:-2.60,tol:0.01,unit:''},
   steps:['SE = 0.20 ÷ √12 = 0.0577 oz.','t = (3.95 − 4.1) ÷ 0.0577 = −0.15 ÷ 0.0577 ≈ −2.60.','That is 2.6 standard errors under, past the −1.80 cutoff.']},
  {id:'pval',kind:'ap',lvl:'ap',
   q:'For that second group, t = −2.60 with df = 11 and Hₐ: μ < 4.1. Which statement is correct?',
   choices:['p ≈ 0.012, so reject H₀: convincing evidence that the mean weight is under 4.1 oz','p ≈ 0.012, so there is a 1.2% chance the restaurant is honest','p ≈ 0.988, so fail to reject H₀','p ≈ 0.025, so fail to reject H₀ at α = 0.05'],correct:0,
   steps:['p = P(t₁₁ ≤ −2.60) ≈ 0.012 (tcdf on a calculator).','0.012 < 0.05, so reject H₀.','The p-value is the probability of an average this low if μ = 4.1. It is not the probability that H₀ is true.']},
  {id:'ci',kind:'ap',lvl:'ap',
   q:'For x̄ = 3.95 oz, s = 0.20 oz and n = 12, which is the 90% confidence interval for μ? (t* = 1.796 for df = 11.)',
   choices:['3.85 to 4.05 oz','3.90 to 4.00 oz','3.82 to 4.08 oz','3.75 to 4.15 oz'],correct:0,
   steps:['Margin of error = t*·s/√n = 1.796 × 0.0577 = 0.104 oz.','3.95 ± 0.104 gives 3.846 to 4.054 oz.','4.1 is above the whole interval, which matches the one-sided test rejecting H₀ at α = 0.05.']},
  {id:'more',kind:'real',lvl:'honors',
   q:'Your average is 0.05 oz under the label with s = 0.24 oz. Your friend says, “Weigh more boxes; it will not change anything.” If you weigh 48 boxes and get the same average and spread, what happens?',
   choices:['t goes from about −0.72 to about −1.44: the same gap becomes stronger evidence','Nothing changes: the gap is still 0.05 oz','t gets closer to 0','The p-value goes up'],correct:0,
   steps:['With 12 boxes: SE = 0.24 ÷ √12 = 0.0693, so t = −0.05 ÷ 0.0693 ≈ −0.72.','With 48 boxes: SE = 0.24 ÷ √48 = 0.0346, so t ≈ −1.44.','More boxes shrink the wobble of the average, so the same gap counts for more. Here it is still not past −1.68, the cutoff for df = 47.']},
  {id:'type1',kind:'ap',lvl:'ap',
   q:'In context, what would a Type I error be for this test?',
   choices:['Concluding the restaurant is shorting boxes when it really fills them to 4.1 oz on average','Concluding the restaurant is honest when it really is shorting','Weighing the boxes wrong','Getting a p-value above 0.05'],correct:0,
   steps:['A Type I error rejects a true H₀.','Here H₀ says μ = 4.1 oz: the restaurant is honest.','So a Type I error is accusing an honest restaurant. At α = 0.05, the test does this to about 5 in 100 honest restaurants.']}
 ]
}
});
