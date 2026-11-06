BioLab.addReview({
truss:{
 questions:[
  {id:'four',kind:'real',lvl:'bio',
   q:'A bridge is made of 4 square panels in a row. What is the fewest diagonal braces that makes it rigid, and where do they go?',
   choices:['2, in the two end panels','4, one in every panel','1, in the middle','8, an X in every panel'],correct:1,
   steps:['A panel without a diagonal is a four-sided frame, and it can rack into a parallelogram.','If any one panel can rack, the whole bridge can fold.','So every panel needs one diagonal: 4 braces. In this tool, that bridge moves only about 0.05 in under a 1,000 lb load.'],
   lab:{set:{p1:'down',p2:'down',p3:'up',p4:'up',pos:16},look:'Read <b>Biggest movement of any joint</b>, then remove one brace.'},verify:[['move',0.0506,0.002]]},
  {id:'sss',kind:'test',lvl:'honors',
   q:'You cut three sticks 5, 7 and 9 inches long and join their ends with loose pins. How many differently shaped triangles can you make?',
   choices:['Exactly one','Two, mirror images that are not congruent','Infinitely many'],correct:0,
   steps:['SSS: two triangles with the same three side lengths are congruent.','A mirror image is still congruent, since you can flip it over.','So the three sticks make exactly one shape. That is why a triangle of bars is rigid.']},
  {id:'quad',kind:'test',lvl:'honors',
   q:'You join four sticks, each 4 inches long, into a loop with loose pins. How many different shapes can the loop take?',
   choices:['Exactly one: a square','Two: a square and a rhombus','Infinitely many rhombuses'],correct:2,
   steps:['Four fixed sides do not fix the angles of a quadrilateral.','The loop can be a square or any rhombus with sides of 4 in, with angles anywhere between almost 0° and almost 180°.','So there are infinitely many shapes. There is no SSSS congruence rule.']},
  {id:'double',kind:'real',lvl:'honors',
   q:'The braced bridge (Pratt pattern) sags about 0.05 in under a 1,000 lb load in the middle. In this model, what happens to the sag if the load doubles to 2,000 lb?',
   choices:['It stays about the same','It about doubles, to 0.10 in','It about quadruples, to 0.20 in','The bridge folds'],correct:1,
   steps:['In this model each bar stretches in proportion to the force on it, like a stiff spring.','Double every force and every stretch doubles, so the sag doubles.','About 0.10 in. Real bridges behave this way only until a bar or joint starts to fail.'],
   lab:{set:{p1:'down',p2:'down',p3:'up',p4:'up',pos:16,P:2000},act:'pratt',look:'Read <b>Sag under the load</b> at 1,000 lb and at 2,000 lb.'},verify:[['sag',0.1000,0.002]]},
  {id:'maxwell',kind:'test',lvl:'ap',
   q:'A pin-jointed frame has 6 joints and rests on a pin and a roller. What is the fewest bars it needs to be rigid?',
   num:{ans:9,tol:0,unit:'bars'},
   steps:['Each joint can move in x and y: 2 × 6 = 12 ways.','The pin and the roller remove 3 of them, leaving 9.','Each bar can lock one, so it needs at least 2j − 3 = 9 bars. (Four triangles in a row, like a short truss with 3 joints on top and 3 on the bottom, uses exactly 9.)']},
  {id:'miss',kind:'real',lvl:'ap',
   q:'Start from the braced Pratt bridge with 1,000 lb in the middle and a 50 lb sideways push. Remove the brace from panel 2 only. What happens?',
   choices:['It sags a little more, about 0.1 in','It folds: panel 2 racks and the bridge leans over','Nothing changes, because the other three panels are braced'],correct:1,
   steps:['Panel 2 is now a four-sided frame with pins at its corners, so it can rack.','Racking lets the joints move without any bar changing length, so the bars cannot stop it.','The model shows the movement past the 12 in cap: the bridge folds. One missing triangle undoes the whole truss.'],
   lab:{set:{p1:'down',p2:'none',p3:'up',p4:'up',pos:16,P:1000,push:50},look:'Read <b>Does it hold?</b> and <b>Biggest movement of any joint</b>.'},verify:[['move',12,0.001]]}
 ]
}
});
