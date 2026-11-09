BioLab.addReview({
startearly:{
 questions:[
  {id:'grow35',kind:'test',lvl:'bio',
   q:'An account has $33,159 and grows 7% a year with no new deposits. To the nearest dollar, how much is in it after 35 years?',
   num:{ans:354030,tol:60,unit:'dollars'},
   steps:['Each year the balance is multiplied by 1.07.','After 35 years: 1.07³⁵ ≈ 10.6766.','$33,159 × 10.6766 ≈ $354,030.'],
   lab:{set:{amt:200,rate:7,reveal:true},look:'Read <b>Sam has at 67</b>.'},verify:[['a67',354029.84,1]]},
  {id:'who7',kind:'real',lvl:'bio',
   q:'Sam saves $200 a month from 22 to 32, then stops. Alex saves $200 a month from 32 to 67. At 7% a year, who has more at 67?',
   choices:['Alex, by about $60,000','Sam, by about $22,000','They tie exactly'],correct:1,
   steps:['Sam: $33,159 at 32, then × 1.07³⁵ ≈ $354,030.','Alex: $2,400 × (1.07³⁵ − 1) ÷ 0.07 ≈ $331,769.','Sam has about $22,261 more, after putting in $60,000 less.'],
   lab:{set:{amt:200,rate:7,reveal:true},look:'Read <b>Sam minus Alex at 67</b>.'},verify:[['gap',22261.33,1]]},
  {id:'double',kind:'test',lvl:'bio',
   q:'At 7% a year, money doubles in about how many years?',
   choices:['About 7','About 10','About 14','About 20'],correct:1,
   steps:['1.07¹⁰ ≈ 1.967, very close to 2.','So money at 7% doubles about every 10 years.','The rule of 72 gives the same estimate: 72 ÷ 7 ≈ 10.']},
  {id:'perdollar',kind:'real',lvl:'honors',
   q:'At 7%, Sam’s $24,000 becomes $354,030 and Alex’s $84,000 becomes $331,769. To the nearest cent, what did each dollar Sam put in become?',
   num:{ans:14.75,tol:0.02,unit:'dollars'},
   steps:['Divide what he ends with by what he put in.','$354,030 ÷ $24,000 ≈ $14.75.','For Alex: $331,769 ÷ $84,000 ≈ $3.95. Early dollars do almost four times the work.'],
   lab:{set:{amt:200,rate:7,reveal:true},look:'Read <b>Each dollar Sam put in became</b>.'},verify:[['perA',14.75,0.01]]},
  {id:'six',kind:'real',lvl:'honors',
   q:'Same two friends, but the return is 6% a year. Who has more at 67, and about how much?',
   choices:['Sam, about $243,000 to $267,000','Alex, about $267,000 to $243,000','Sam, about $354,000 to $332,000'],correct:1,
   steps:['Sam at 32: $2,400 × (1.06¹⁰ − 1) ÷ 0.06 ≈ $31,634; × 1.06³⁵ ≈ $243,141.','Alex: $2,400 × (1.06³⁵ − 1) ÷ 0.06 ≈ $267,443.','At slower growth, Alex’s extra deposits win.'],
   lab:{set:{amt:200,rate:6,reveal:true},look:'Read <b>Sam has at 67</b> and <b>Alex has at 67</b>.'},verify:[['b67',267443.47,1],['a67',243140.96,1]]},
  {id:'series',kind:'test',lvl:'ap',
   q:'A saver deposits $2,400 at the end of each year for 35 years at 7%. Which expression gives the balance right after the last deposit?',
   choices:['2400 × 35 × 1.07','2400(1.07³⁵ − 1)/0.07','2400 × 1.07³⁵','2400(1.07³⁵)/35'],correct:1,
   steps:['The first deposit grows 34 years and the last grows 0.','Total: 2400[1 + 1.07 + 1.07² + … + 1.07³⁴], a geometric series with ratio 1.07.','The sum is 2400(1.07³⁵ − 1)/(1.07 − 1) ≈ $331,769.']}
 ]
}
});
