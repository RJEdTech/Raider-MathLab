BioLab.addReview({
lootdrop:{
 questions:[
  {id:'four',kind:'real',lvl:'bio',
   q:'In 400 openings you got 4 Legendaries when the posted 2% predicts 8. A friend says, “Half the Legendaries! It’s rigged.” What is the fair response?',
   choices:['Small counts wander a lot: about 1 group in 10 of 400 honest openings gets 4 or fewer Legendaries, so this alone is not convincing','The friend is right: half is too few','The friend is right only if Epics are also low','You can never test posted odds'],correct:0,
   steps:['With 8 expected, honest counts commonly range from about 3 to 13.','P(4 or fewer Legendaries in 400 at 2%) ≈ 0.097, about 1 in 10.','So one low count is not convincing on its own. Look at all four counts together.'],
   lab:{set:{},act:'show',look:'Read <b>Legendaries in 400</b> and <b>Honest games (of 100) this far off or farther</b>.'},verify:[['leg',4,0],['honest',47,0]]},
  {id:'score',kind:'test',lvl:'honors',
   q:'Your counts are 244, 117, 35 and 4 against expected 240, 112, 40 and 8. To the nearest 0.01, what is χ²?',
   num:{ans:2.91,tol:0.01,unit:''},
   steps:['Common: (244 − 240)²/240 = 0.067. Rare: (117 − 112)²/112 = 0.223.','Epic: (35 − 40)²/40 = 0.625. Legendary: (4 − 8)²/8 = 2.000.','χ² = 0.067 + 0.223 + 0.625 + 2.000 ≈ 2.91. The Legendary part is the biggest, but the total is small.'],
   lab:{set:{},act:'show',look:'Read <b>How-far-off score (χ²)</b> and each rarity’s part under its bar.'},verify:[['off',2.915,0.002]]},
  {id:'calc',kind:'test',lvl:'honors',
   q:'Another log: 260 Common, 112 Rare, 24 Epic, 4 Legendary (expected 240, 112, 40, 8). What is χ², and does it pass the 7.81 cutoff?',
   choices:['χ² ≈ 10.07: past the cutoff','χ² ≈ 3.10: below the cutoff','χ² ≈ 40: past the cutoff','χ² ≈ 7.00: below the cutoff'],correct:0,
   steps:['Common: (260 − 240)²/240 = 400/240 = 1.667. Rare: (112 − 112)²/112 = 0.','Epic: (24 − 40)²/40 = 256/40 = 6.400. Legendary: (4 − 8)²/8 = 2.000.','χ² = 1.667 + 0 + 6.400 + 2.000 ≈ 10.07, past the 7.81 cutoff, so this log does not match the posted odds. Most of it comes from the missing Epics.']},
  {id:'pval',kind:'ap',lvl:'ap',
   q:'For χ² = 2.91 with df = 3, which conclusion is correct at α = 0.05?',
   choices:['p ≈ 0.405 > 0.05: fail to reject H₀; no convincing evidence that the posted odds are wrong','p ≈ 0.405: there is a 40.5% chance the game is honest','p ≈ 0.04: reject H₀','The test proves the odds are correct'],correct:0,
   steps:['p = P(χ²₃ ≥ 2.91) ≈ 0.405.','0.405 > 0.05, so fail to reject H₀.','Failing to reject is not proof the odds are right; it means these 400 openings do not give convincing evidence that they are wrong.'],
   lab:{set:{},act:'show',look:'Read <b>p-value</b>.'},verify:[['p',0.405,0.001]]},
  {id:'cond',kind:'ap',lvl:'ap',
   q:'Which change would break the conditions for this chi-square goodness-of-fit test?',
   choices:['Logging only 200 openings, so the expected Legendary count is 4','Logging 800 openings','Having four friends share the log, if each opening is still a random draw','Using df = 3'],correct:0,
   steps:['Every expected count must be at least 5.','With 200 openings, 2% of 200 = 4 expected Legendaries, which is too small.','Fix it by logging more openings or combining Epic and Legendary into one category (df then drops to 2).']},
  {id:'which',kind:'ap',lvl:'ap',
   q:'A chi-square test on a big log rejects H₀ with χ² = 15.2. Its parts are Common 1.1, Rare 0.2, Epic 11.6, Legendary 2.3. What is the best follow-up statement?',
   choices:['The counts do not fit the posted odds, and Epic contributes most of the gap, so Epic is the rarity to look at','The test proves the Epic rate is exactly wrong by 11.6%','Common is the problem because it has the most openings','Nothing more can be said'],correct:0,
   steps:['Rejecting H₀ says the whole set of odds does not fit.','The biggest part of χ² points to where the mismatch is: Epic gives 11.6 of the 15.2.','Compare observed with expected for Epic to see whether there are too few or too many, and confirm with new data.']}
 ]
}
});
