BioLab.addReview({
openbox:{
 questions:[
  {id:'cut2',kind:'real',lvl:'bio',
   q:'You cut 2 in squares from each corner of a 12 in × 18 in sheet and fold up the sides. How many cubic inches does the box hold?',
   num:{ans:224,tol:0.5,unit:'in³'},
   steps:['The height is the cut: 2 in.','The floor is (18 − 2 × 2) by (12 − 2 × 2) = 14 in by 8 in.','V = 2 × 14 × 8 = 224 in³.'],
   lab:{set:{sheet:'p1218',x:2},look:'Read <b>Box holds</b>.'},verify:[['vol',224,0.01]]},
  {id:'square',kind:'real',lvl:'bio',
   q:'On a 12 in × 12 in sheet, a friend cuts 1 in squares. You cut 2 in squares. How much more does your box hold?',
   num:{ans:28,tol:0.5,unit:'in³'},
   steps:['Friend: 1 × 10 × 10 = 100 in³.','You: 2 × 8 × 8 = 128 in³.','128 − 100 = 28 in³ more, close to 2 more cups.'],
   lab:{set:{sheet:'sq12',x:2},look:'Read <b>Box holds</b>, then try a 1 in cut.'},verify:[['vol',128,0.01]]},
  {id:'model',kind:'test',lvl:'honors',
   q:'Which function gives the volume of the box made from an 8.5 in × 11 in sheet, and what is its domain?',
   choices:['V(x) = x(8.5 − x)(11 − x), 0 < x < 8.5','V(x) = x(8.5 − 2x)(11 − 2x), 0 < x < 4.25','V(x) = x(8.5 − 2x)(11 − 2x), 0 < x < 5.5','V(x) = 2x(8.5 − x)(11 − x), 0 < x < 4.25'],correct:1,
   steps:['Each cut removes x from both ends of a side, so the floor is (8.5 − 2x) by (11 − 2x). The height is x.','The short side runs out first: 8.5 − 2x > 0 means x < 4.25.','So V(x) = x(8.5 − 2x)(11 − 2x) for 0 < x < 4.25.']},
  {id:'expand',kind:'test',lvl:'honors',
   q:'Expand V(x) = x(12 − 2x)(18 − 2x), then use your expanded form to find V(2.5).',
   num:{ans:227.5,tol:0.05,unit:'in³'},
   steps:['(12 − 2x)(18 − 2x) = 216 − 60x + 4x².','So V(x) = 4x³ − 60x² + 216x.','V(2.5) = 4(15.625) − 60(6.25) + 216(2.5) = 62.5 − 375 + 540 = 227.5 in³. Check: 2.5 × 7 × 13 = 227.5.'],
   lab:{set:{sheet:'p1218',x:2.5},look:'Read <b>Box holds</b>.'},verify:[['vol',227.5,0.01]]},
  {id:'letter',kind:'real',lvl:'ap',
   q:'For an 8.5 in × 11 in sheet of paper, what cut gives the biggest box? Give x to the nearest 0.01 in.',
   num:{ans:1.59,tol:0.01,unit:'in'},
   steps:['V(x) = 4x³ − 39x² + 93.5x, so V′(x) = 12x² − 78x + 93.5.','x = [78 − √(78² − 4 × 12 × 93.5)] ÷ 24 = [78 − √1596] ÷ 24 ≈ (78 − 39.95) ÷ 24 ≈ 1.585 in.','The other root, about 4.91 in, is outside 0 < x < 4.25. The box holds about 66.1 in³.'],
   lab:{set:{sheet:'letter'},act:'best',look:'Read <b>Best cut</b> and <b>Box holds</b>.'},verify:[['xstar',1.585,0.002],['vol',66.15,0.02]]},
  {id:'zeros',kind:'test',lvl:'ap',
   q:'V(x) = x(12 − 2x)(18 − 2x). Which statement about its graph is true?',
   choices:['It has zeros at 0, 12 and 18','It has zeros at 0, 6 and 9, and V is negative for 6 < x < 9','It has exactly one turning point','It falls to the right because the leading coefficient is negative'],correct:1,
   steps:['Set each factor to 0: x = 0, 12 − 2x = 0 gives x = 6, and 18 − 2x = 0 gives x = 9.','For 6 < x < 9, one factor (12 − 2x) is negative and the other two are positive, so V < 0.','The leading term is 4x³, so it rises to the right, and a cubic with three real zeros has two turning points.']}
 ]
}
});
