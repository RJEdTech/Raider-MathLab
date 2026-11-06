BioLab.addReview({
areamodel:{
 questions:[
  {id:'grow4',kind:'real',lvl:'bio',
   q:'A square patio is 16 ft on each side. You make it 4 ft bigger in both directions. How many extra square feet of pavers do you need?',
   num:{ans:144,tol:0.5,unit:'sq ft'},
   steps:['The new patio is 20 ft by 20 ft: 400 sq ft. The old one is 16 × 16 = 256 sq ft.','Extra = 400 − 256 = 144 sq ft.','In pieces: two 4-by-16 strips (64 sq ft each) plus a 4-by-4 corner (16 sq ft): 64 + 64 + 16 = 144.'],
   lab:{set:{x:16,a:4,b:4,pieces:true},look:'Read <b>Extra area needed</b> and the pieces on the plan.'},verify:[['need',144,0.01]]},
  {id:'square5',kind:'test',lvl:'bio',
   q:'Which expression equals (x + 5)²?',
   choices:['x² + 25','x² + 10x + 25','x² + 5x + 25','2x + 10'],correct:1,
   steps:['(x + 5)² = (x + 5)(x + 5). The area model has four pieces: x², 5x, 5x and 25.','The strips combine: 5x + 5x = 10x. So (x + 5)² = x² + 10x + 25.','x² + 25 forgets both strips.']},
  {id:'expand47',kind:'test',lvl:'honors',
   q:'Expand (x + 4)(x + 7).',
   choices:['x² + 28','x² + 11x + 28','x² + 28x + 11','x² + 11x + 11'],correct:1,
   steps:['Pieces: x · x = x², 7 · x = 7x, 4 · x = 4x, 4 · 7 = 28.','Combine the strips: 7x + 4x = 11x.','(x + 4)(x + 7) = x² + 11x + 28.']},
  {id:'room',kind:'real',lvl:'honors',
   q:'A 12 ft by 12 ft room is enlarged: one wall moves out 5 ft and the other 2 ft. Flooring costs $6 per square foot. What does the new flooring cost?',
   num:{ans:564,tol:0.5,unit:'$'},
   steps:['New room: (12 + 5)(12 + 2) = 17 × 14 = 238 sq ft. Old room: 144 sq ft.','Extra area = 238 − 144 = 94 sq ft. As pieces: 5 × 12 + 2 × 12 + 5 × 2 = 60 + 24 + 10 = 94.','Cost = 94 × $6 = $564.'],
   lab:{set:{proj:'room',x:12,a:5,b:2,price:6,pieces:true},look:'Read <b>Extra area needed</b> and <b>Cost of the extra material</b>.'},verify:[['need',94,0.01],['cost',564,0.01]]},
  {id:'path',kind:'real',lvl:'honors',
   q:'A square garden bed is 10 ft on each side. You put a gravel path 2 ft wide around all four sides. How many square feet of gravel do you need?',
   num:{ans:96,tol:0.5,unit:'sq ft'},
   steps:['The path adds 2 ft on each side, so the outer square is 10 + 2 + 2 = 14 ft on a side.','Outer area: 14² = 196 sq ft. Garden: 100 sq ft.','Gravel = 196 − 100 = 96 sq ft. This is (x + 4)² − x² = 8x + 16 with x = 10.'],
   lab:{set:{proj:'lawn',x:10,a:4,b:4,pieces:true},look:'The path adds 4 ft to each side length. Read <b>Extra area needed</b>.'},verify:[['need',96,0.01]]},
  {id:'perfect',kind:'test',lvl:'ap',
   q:'x² + bx + 36 is a perfect square, (x + k)² with k > 0. What is b?',
   num:{ans:12,tol:0,unit:''},
   steps:['(x + k)² = x² + 2kx + k². The corner is k² = 36, so k = 6.','The two strips are each 6x, so b = 2k = 12.','x² + 12x + 36 = (x + 6)².']}
 ]
}
});
