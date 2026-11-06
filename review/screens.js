BioLab.addReview({
screens:{
 questions:[
  {id:'width55',kind:'real',lvl:'bio',
   q:'A 55-inch TV has a 16:9 screen. To the nearest 0.1 in, how wide is the screen?',
   num:{ans:47.9,tol:0.1,unit:'in'},
   steps:['The legs are 16 and 9 parts, so the diagonal is √(16² + 9²) = √337 ≈ 18.36 parts.','One part is 55 ÷ 18.36 ≈ 2.996 in.','Width = 16 parts ≈ 47.9 in. (Height = 9 parts ≈ 27.0 in.)'],
   lab:{set:{mode:'tv',asp:'169',diag:55},look:'Read <b>Screen width</b>.'},verify:[['sw',47.94,0.02]]},
  {id:'opening',kind:'real',lvl:'honors',
   q:'A wall space is 50 in wide and 30 in tall. To the nearest 0.1 in, what is the biggest 16:9 screen diagonal that fits?',
   num:{ans:57.4,tol:0.1,unit:'in'},
   steps:['Width limit: d·16/√337 ≤ 50, so d ≤ 50·√337/16 ≈ 57.4 in.','Height limit: d·9/√337 ≤ 30, so d ≤ 30·√337/9 ≈ 61.2 in.','Both must hold, so the smaller one wins: about 57.4 in. A 55-inch TV fits; a 65-inch does not.'],
   lab:{set:{mode:'tv',asp:'169',W:50,H:30},act:'best',look:'Read <b>Biggest diagonal that fits</b>.'},verify:[['dmax',57.37,0.02]]},
  {id:'dist',kind:'test',lvl:'honors',
   q:'Find the distance between (1, 1) and (7, 5), to the nearest hundredth.',
   num:{ans:7.21,tol:0.01,unit:''},
   steps:['Δx = 7 − 1 = 6 and Δy = 5 − 1 = 4.','d = √(6² + 4²) = √52.','√52 ≈ 7.21. On a street grid you would travel 6 + 4 = 10 instead.'],
   lab:{set:{mode:'drone',ax:1,ay:1,bx:7,by:5},look:'Read <b>Drone flight</b> and <b>Truck route</b>.'},verify:[['fly',7.211,0.002],['drive',10,0.001]]},
  {id:'mid',kind:'test',lvl:'bio',
   q:'What is the midpoint of the segment from (2, 0.5) to (6, 4.5)?',
   choices:['(4, 2)','(4, 2.5)','(8, 5)','(2, 2)'],correct:1,
   steps:['Average the x-coordinates: (2 + 6) ÷ 2 = 4.','Average the y-coordinates: (0.5 + 4.5) ÷ 2 = 2.5.','The midpoint is (4, 2.5).'],
   lab:{set:{mode:'drone',ax:2,ay:0.5,bx:6,by:4.5},look:'At <b>Closer look</b>, read <b>Halfway point</b>.'}},
  {id:'time',kind:'real',lvl:'ap',
   q:'A store is at (0, 0) and a home is at (6, 2.5), in miles. A drone flies straight at 30 mph. A truck drives the street grid at an average of 20 mph. How many minutes sooner does the drone arrive?',
   num:{ans:12.5,tol:0.1,unit:'min'},
   steps:['Drone: √(6² + 2.5²) = √42.25 = 6.5 mi. At 30 mph: 6.5 ÷ 30 × 60 = 13 min.','Truck: 6 + 2.5 = 8.5 mi. At 20 mph: 8.5 ÷ 20 × 60 = 25.5 min.','The drone arrives 25.5 − 13 = 12.5 min sooner.'],
   lab:{set:{mode:'drone',ax:0,ay:0,bx:6,by:2.5},look:'Read <b>Minutes the drone saves</b>.'},verify:[['fly',6.5,0.001],['save',12.5,0.01]]},
  {id:'deck',kind:'real',lvl:'bio',
   q:'You are building a deck frame 9 ft by 12 ft. To check that the corners are square, what should the diagonal measure?',
   choices:['13 ft','15 ft','21 ft','10.5 ft'],correct:1,
   steps:['The sides are the legs of a right triangle and the diagonal is the hypotenuse.','√(9² + 12²) = √(81 + 144) = √225 = 15 ft.','If the diagonal is longer or shorter than 15 ft, the corner is not 90°. This is the 3-4-5 rule scaled up by 3.']}
 ]
}
});
