BioLab.addReview({
passwords:{
 questions:[
  {id:'pin',kind:'real',lvl:'bio',
   q:'Your phone uses a 6-digit PIN. How many different PINs are possible?',
   choices:['60','10⁶ = 1,000,000','6¹⁰ ≈ 60 million','10,000'],correct:1,
   steps:['Each of the 6 positions can be any of 10 digits.','Multiply: 10 × 10 × 10 × 10 × 10 × 10 = 10⁶.','1,000,000 PINs. That is why phones limit wrong tries: a computer could test them all in a fraction of a second.']},
  {id:'longwins',kind:'test',lvl:'bio',
   q:'Which random password takes longer to guess: 10 characters from upper + lowercase letters, or 14 lowercase letters?',
   choices:['10 upper + lowercase','14 lowercase','The same'],correct:1,
   steps:['10 × log₂ 52 ≈ 10 × 5.70 = 57.0 bits.','14 × log₂ 26 ≈ 14 × 4.70 = 65.8 bits.','14 lowercase letters has about 8.8 more bits: about 450 times as many possibilities.'],
   lab:{set:{len:14,set:'lower'},look:'Read <b>Your password’s strength</b>, then switch to 10 characters of upper + lower.'},verify:[['bits',65.81,0.01]]},
  {id:'bits14',kind:'test',lvl:'honors',
   q:'How many bits of strength does a random 14-letter lowercase password have? Give one decimal place.',
   num:{ans:65.8,tol:0.05,unit:'bits'},
   steps:['Bits = L · log₂ N.','log₂ 26 ≈ 4.7004.','14 × 4.7004 ≈ 65.8 bits.'],
   lab:{set:{len:14,set:'lower'},look:'Read <b>Your password’s strength</b>.'},verify:[['bits',65.81,0.01]]},
  {id:'passphrase',kind:'real',lvl:'honors',
   q:'A passphrase is 5 words, each picked at random from a list of 7,776 words. How many bits is it? Give one decimal place.',
   num:{ans:64.6,tol:0.05,unit:'bits'},
   steps:['Each word is one of 7,776 equally likely choices, so treat each word like a character.','Bits = 5 × log₂ 7776 ≈ 5 × 12.925.','≈ 64.6 bits: stronger than 8 random keyboard symbols (52.4 bits), and much easier to remember.']},
  {id:'time12',kind:'test',lvl:'ap',
   q:'A random 12-character password uses letters and digits (62 symbols). At 10¹⁰ guesses a second, what is log₁₀ of the years needed to try every one? Give two decimal places.',
   num:{ans:4.01,tol:0.01,unit:''},
   steps:['Possibilities: 62¹² ≈ 3.23 × 10²¹.','Seconds: 3.23 × 10²¹ ÷ 10¹⁰ = 3.23 × 10¹¹. Years: ÷ 3.156 × 10⁷ ≈ 10,200.','log₁₀(10,200) ≈ 4.01.'],
   lab:{set:{len:12,set:'alnum',rate:10},look:'Read <b>Time to try every one, log₁₀ of years</b> at Deep dive.'},verify:[['logyr',4.0096,0.001]]},
  {id:'lockout',kind:'real',lvl:'ap',
   q:'A phone locks for good after 10 wrong tries on a 4-digit PIN. If someone tries 10 different PINs at random, what is the chance they get in?',
   choices:['0.1%','1%','10%','40%'],correct:0,
   steps:['There are 10⁴ = 10,000 PINs.','10 tries cover at most 10 of them.','10 ÷ 10,000 = 0.001 = 0.1%. Limiting tries protects a short PIN far better than its length alone could. (A PIN people commonly pick, like 1234, is riskier.)']},
  {id:'length100',kind:'test',lvl:'ap',
   q:'How many random characters from all 94 keyboard symbols do you need to reach at least 100 bits?',
   num:{ans:16,tol:0,unit:'characters'},
   steps:['L · log₂ 94 ≥ 100, and log₂ 94 ≈ 6.555.','L ≥ 100 ÷ 6.555 ≈ 15.26.','Round up: 16 characters.']}
 ]
}
});
