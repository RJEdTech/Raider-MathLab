BioLab.addReview({
decibels:{
 questions:[
  {id:'earbuds97',kind:'real',lvl:'bio',
   q:'Your earbuds play at 97 dBA. Using 85 dBA for 8 hours and halving every 3 dB, how many minutes a day are safe?',
   num:{ans:30,tol:0.5,unit:'minutes'},
   steps:['97 − 85 = 12 dB, which is four 3 dB steps.','480 minutes ÷ 2⁴ = 480 ÷ 16.','30 minutes a day.'],
   lab:{set:{level:97},act:'show',look:'Read <b>Safe listening time per day</b>.'},verify:[['safe',30,0.01]]},
  {id:'ratio100',kind:'test',lvl:'bio',
   q:'How many times the sound intensity is 100 dB compared with 80 dB?',
   choices:['1.25 times','20 times','100 times','1,000 times'],correct:2,
   steps:['The difference is 20 dB.','Each 10 dB is 10 times the intensity.','10 × 10 = 100 times. In symbols: 10^(20/10) = 10² = 100.']},
  {id:'x91',kind:'test',lvl:'honors',
   q:'How many times the intensity of 85 dBA is 91 dBA? Give two decimal places.',
   num:{ans:3.98,tol:0.01,unit:'times'},
   steps:['The difference is 6 dB.','Ratio = 10^(6/10) = 10^0.6.','10^0.6 ≈ 3.98: two 3 dB steps, each about double.'],
   lab:{set:{level:91},look:'Read <b>Intensity compared with 85 dBA</b> at Closer look.'},verify:[['x85',3.981,0.001]]},
  {id:'game',kind:'real',lvl:'honors',
   q:'A basketball game in a loud gym averages 91 dBA. One hour there uses what percent of a day’s NIOSH noise limit?',
   num:{ans:50,tol:0.5,unit:'%'},
   steps:['At 91 dBA the safe time is 480 ÷ 2² = 120 minutes.','One hour is 60 of those 120 minutes.','60 ÷ 120 = 50% of the day’s limit.'],
   lab:{set:{level:91},act:'show',look:'Read <b>Daily limit used by 1 hour</b>.'},verify:[['hour',50,0.01]]},
  {id:'solveL',kind:'test',lvl:'ap',
   q:'Solve for the level L (in dBA) where the safe time is 2 hours, using T = 480 ÷ 2^((L − 85)/3) minutes.',
   num:{ans:91,tol:0.01,unit:'dBA'},
   steps:['120 = 480 ÷ 2^((L − 85)/3), so 2^((L − 85)/3) = 4.','Take log₂ of both sides: (L − 85)/3 = 2.','L = 85 + 6 = 91 dBA.']},
  {id:'loud106',kind:'real',lvl:'ap',
   q:'A loud concert measures 106 dBA near the speakers. How many minutes a day are safe there? Give two decimal places.',
   num:{ans:3.75,tol:0.01,unit:'minutes'},
   steps:['106 − 85 = 21 dB, which is seven 3 dB steps.','480 ÷ 2⁷ = 480 ÷ 128.','3.75 minutes. Earplugs that cut 20 dB would bring it back near 86 dBA.'],
   lab:{set:{level:106},act:'show',look:'Read <b>Safe listening time per day</b>.'},verify:[['safe',3.75,0.001]]},
  {id:'quake',kind:'test',lvl:'honors',
   q:'Each whole step of earthquake magnitude is 10 times the wave amplitude and about 32 times the energy. About how much more energy does a magnitude 7 release than a magnitude 5?',
   choices:['About 2 times','About 64 times','About 100 times','About 1,000 times'],correct:3,
   steps:['Two steps of magnitude.','Energy: about 32 × 32 ≈ 1,000 times (exactly 10^1.5 per step, so 10³ for two).','The amplitude is 10 × 10 = 100 times. Like decibels, each step multiplies.']}
 ]
}
});
