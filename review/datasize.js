BioLab.addReview({
datasize:{
 questions:[
  {id:'game50',kind:'real',lvl:'bio',
   q:'A 50 GB game downloads on a 100 Mbps plan at full speed. How many minutes does it take? Round to 0.1 min.',
   num:{ans:66.7,tol:0.1,unit:'min'},
   steps:['50 GB = 50,000 MB, and each byte is 8 bits: 400,000 megabits.','400,000 ÷ 100 megabits per second = 4,000 seconds.','4,000 ÷ 60 ≈ 66.7 minutes.'],
   lab:{set:{job:'game',size:50,speed:100,show:true},look:'Read <b>Download time</b>.'},verify:[['mins',66.667,0.01]]},
  {id:'gbmb',kind:'test',lvl:'bio',
   q:'How many megabytes are in 3 gigabytes (decimal units)?',
   choices:['30 MB','300 MB','3,000 MB','3,000,000 MB'],correct:2,
   steps:['Giga is 10⁹ and mega is 10⁶, so 1 GB = 10³ MB = 1,000 MB.','3 × 1,000 = 3,000 MB.']},
  {id:'divide',kind:'test',lvl:'honors',
   q:'Compute (6 × 10¹⁰) ÷ (2.5 × 10⁷).',
   choices:['2.4 × 10³','2.4 × 10¹⁷','3.5 × 10³','0.24 × 10³'],correct:0,
   steps:['Divide the front numbers: 6 ÷ 2.5 = 2.4.','Subtract the exponents: 10¹⁰ ÷ 10⁷ = 10³.','The answer is 2.4 × 10³ = 2,400. (0.24 × 10³ is not in scientific notation, and it equals 240.)']},
  {id:'photos64',kind:'real',lvl:'honors',
   q:'Your phone has 64 GB free and each photo is 4 MB. How many photos fit?',
   num:{ans:16000,tol:0.5,unit:'photos'},
   steps:['64 GB = 6.4 × 10¹⁰ bytes. One photo = 4 × 10⁶ bytes.','(6.4 × 10¹⁰) ÷ (4 × 10⁶) = 1.6 × 10⁴.','That is 16,000 photos.'],
   lab:{set:{job:'photos',free:64,psize:4,show:true},look:'Read <b>Photos that fit</b>.'},verify:[['photos',16000,0.01]]},
  {id:'sci450',kind:'test',lvl:'honors',
   q:'Write 450 MB in bytes, in scientific notation.',
   choices:['4.5 × 10⁸ bytes','4.5 × 10⁶ bytes','45 × 10⁷ bytes','4.5 × 10⁹ bytes'],correct:0,
   steps:['1 MB = 10⁶ bytes, so 450 MB = 450 × 10⁶ bytes.','450 = 4.5 × 10², so 450 × 10⁶ = 4.5 × 10²⁺⁶ = 4.5 × 10⁸ bytes.','45 × 10⁷ has the same value, but it is not in scientific notation because 45 is not between 1 and 10.']},
  {id:'gib',kind:'test',lvl:'ap',
   q:'A phone has 128 GB (128 × 10⁹ bytes). A computer that counts 1 “GB” as 2³⁰ bytes shows what size? Round to 0.1.',
   num:{ans:119.2,tol:0.1,unit:'GiB'},
   steps:['2³⁰ = 1,073,741,824 bytes.','128 × 10⁹ ÷ 1,073,741,824 ≈ 119.2.','Nothing is missing. The same bytes are counted in a unit about 7% bigger.']},
  {id:'real80',kind:'real',lvl:'ap',
   q:'A 100 GB game on a 500 Mbps plan, but you only get 80% of the plan speed. How many minutes does it take? Round to 0.1 min.',
   num:{ans:33.3,tol:0.1,unit:'min'},
   steps:['Real speed = 0.8 × 500 = 400 Mbps = 4 × 10⁸ bits per second.','100 GB = 10¹¹ bytes = 8 × 10¹¹ bits.','(8 × 10¹¹) ÷ (4 × 10⁸) = 2 × 10³ s = 2,000 s ≈ 33.3 min.'],
   lab:{set:{job:'game',size:100,speed:500,eff:80,show:true},look:'Read <b>Download time</b> at Deep dive.'},verify:[['mins',33.333,0.01]]}
 ]
}
});
