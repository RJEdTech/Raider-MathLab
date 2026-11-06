BioLab.addReview({
matrices:{
 questions:[
  {id:'rot',kind:'test',lvl:'bio',
   q:'Rotate the point (4, 1) by 90° counterclockwise about the origin. Where does it land?',
   choices:['(−1, 4)','(1, −4)','(−4, −1)','(4, −1)'],correct:0,
   steps:['The rotation matrix has top row 0, −1 and bottom row 1, 0.','Multiply: (0 × 4 + (−1) × 1, 1 × 4 + 0 × 1) = (−1, 4).','Check: a quarter turn counterclockwise takes a point in the first quadrant to the second quadrant, and (−1, 4) is there.'],
   lab:{set:{first:'rot90',show:true},look:'Watch how the F’s corners move: (x, y) goes to (−y, x).'}},
  {id:'mult',kind:'test',lvl:'honors',
   q:'M has top row 2, 1 and bottom row 0, 1. Where does M send the tip (3, 5)?',
   choices:['(11, 5)','(6, 5)','(3, 11)','(8, 5)'],correct:0,
   steps:['M·(x, y) = (2x + 1y, 0x + 1y).','(2 × 3 + 5, 5) = (11, 5).','Another way: 3 × (first column) + 5 × (second column) = 3 × (2, 0) + 5 × (1, 1) = (6, 0) + (5, 5) = (11, 5).']},
  {id:'area',kind:'test',lvl:'honors',
   q:'A shape covers 8 square units. A matrix with top row 3, 1 and bottom row 2, 4 transforms it. What is the area of the image?',
   num:{ans:80,tol:0.5,unit:'square units'},
   steps:['det = ad − bc = 3 × 4 − 1 × 2 = 12 − 2 = 10.','The determinant is the area scale factor (positive, so no flip).','Image area = 8 × 10 = 80 square units.']},
  {id:'sprite',kind:'real',lvl:'honors',
   q:'A game stretches a sprite 2× sideways and then rotates it 90° counterclockwise. The sprite is the F, 8 squares. How many squares does it cover on screen?',
   num:{ans:16,tol:0.1,unit:'squares'},
   steps:['Combined matrix = (rotate)·(stretch) = (top row 0, −1; bottom row 1, 0)·(top row 2, 0; bottom row 0, 1) = top row 0, −1; bottom row 2, 0.','det = 0 × 0 − (−1) × 2 = 2. The rotation has det 1 and the stretch has det 2, and determinants multiply.','Area = 8 × 2 = 16 squares.'],
   lab:{set:{first:'wide',then:'rot90',show:true},look:'Read <b>Area of the image</b> and <b>Determinant</b>.'},verify:[['area',16,0.01],['det',2,0.001]]},
  {id:'combo',kind:'real',lvl:'ap',
   q:'A game reflects a sprite across the y-axis and then rotates it 180°. Which single transformation does the same thing?',
   choices:['A reflection across the x-axis','A rotation of 90°','Nothing: they cancel out','A reflection across y = x'],correct:0,
   steps:['Reflect across the y-axis: top row −1, 0; bottom row 0, 1. Rotate 180°: top row −1, 0; bottom row 0, −1.','Combined = (rotate)·(reflect) = top row 1, 0; bottom row 0, −1.','That matrix keeps x and flips y: a reflection across the x-axis. Its determinant is −1, so the sprite is a mirror image.'],
   lab:{set:{first:'refY',then:'rot180',show:true},look:'Compare the image with a plain reflection across the x-axis. Read the <b>Determinant</b>.'},verify:[['det',-1,0.001],['area',8,0.01]]},
  {id:'rot60',kind:'test',lvl:'ap',
   q:'Rotate the point (2, 0) by 60° counterclockwise. Where does it land, to two decimal places?',
   choices:['(1.00, 1.73)','(1.73, 1.00)','(2.00, 1.73)','(−1.73, 1.00)'],correct:0,
   steps:['Rotation by θ: (x cos θ − y sin θ, x sin θ + y cos θ).','(2 cos 60°, 2 sin 60°) = (2 × 0.5, 2 × 0.866) = (1.00, 1.73).','Check: the distance from the origin is √(1 + 3) = 2, unchanged.']}
 ]
}
});
