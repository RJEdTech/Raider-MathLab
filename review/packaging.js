BioLab.addReview({
packaging:{
 questions:[
  {id:'area',kind:'test',lvl:'bio',
   q:'A closed can has radius 1.5 in and height 3 in. To the nearest 0.1 in², what is its surface area?',
   num:{ans:42.4,tol:0.1,unit:'in²'},
   steps:['Top and bottom: 2 × π × 1.5² = 4.5π ≈ 14.14 in².','Side: 2π × 1.5 × 3 = 9π ≈ 28.27 in².','Total ≈ 42.4 in². (It holds π × 1.5² × 3 ≈ 21.2 in³, a bit less than 12 fl oz.)']},
  {id:'best12',kind:'real',lvl:'honors',
   q:'A closed can must hold 21.66 in³ (12 fl oz). What diameter uses the least aluminum, to the nearest 0.01 in?',
   num:{ans:3.02,tol:0.01,unit:'in'},
   steps:['The best closed can has h = 2r, so V = πr² × 2r = 2πr³.','r³ = 21.66 ÷ (2π) = 3.447, so r = 1.511 in.','Diameter = 2r ≈ 3.02 in, and the height is also 3.02 in. It uses about 43.0 in².'],
   lab:{set:{vol:'c12',shape:'can'},act:'best',look:'Read <b>Width</b>, <b>Height</b> and <b>Least possible material</b>.'},verify:[['w',3.021,0.005],['h',3.021,0.005],['Abest',43.01,0.05]]},
  {id:'cube',kind:'real',lvl:'honors',
   q:'A box with a square base must hold 1 cubic foot (1,728 in³). What is the least cardboard it can use?',
   num:{ans:864,tol:1,unit:'in²'},
   steps:['For a closed box with a square base, the least material comes with a cube.','Side = ∛1728 = 12 in.','Surface area = 6 × 12² = 864 in².'],
   lab:{set:{vol:'cuft',shape:'box'},act:'best',look:'Read <b>Least possible material</b>.'},verify:[['Abest',864,0.5]]},
  {id:'dim',kind:'real',lvl:'bio',
   q:'A carrier figures dimensional weight as length × width × height ÷ 139, for inches and pounds. What is the dimensional weight of a 12 in × 12 in × 12 in box, to the nearest 0.1 lb?',
   num:{ans:12.4,tol:0.1,unit:'lb'},
   steps:['Volume = 12 × 12 × 12 = 1,728 in³.','1,728 ÷ 139 ≈ 12.4 lb.','If the box and its contents actually weigh less than that, the carrier can charge for 12.4 lb anyway, so empty space costs money.']},
  {id:'scale',kind:'test',lvl:'honors',
   q:'You make a can with every dimension 3 times as big. How many times as much material does it use, and how many times as much does it hold?',
   choices:['3 times the material, 3 times the volume','9 times the material, 27 times the volume','27 times the material, 9 times the volume','9 times the material, 9 times the volume'],correct:1,
   steps:['Area scales with the square of length: 3² = 9.','Volume scales with the cube: 3³ = 27.','So the big can holds 3 times as much per square inch of metal.']},
  {id:'open',kind:'test',lvl:'ap',
   q:'An open-top can (no lid) must hold 21.66 in³. For the least material, what is its height, to the nearest 0.01 in?',
   num:{ans:1.90,tol:0.01,unit:'in'},
   steps:['A(r) = πr² + 2V/r. A′(r) = 2πr − 2V/r² = 0 gives V = πr³.','r = ∛(21.66 ÷ π) = ∛6.894 ≈ 1.90 in.','The best open can has h = r ≈ 1.90 in, half as tall as it is wide.'],
   lab:{set:{vol:'c12',shape:'can',open:true},act:'best',look:'Read <b>Height</b>.'},verify:[['h',1.903,0.005]]}
 ]
}
});
