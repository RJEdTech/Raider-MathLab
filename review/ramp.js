BioLab.addReview({
ramp:{
 questions:[
  {id:'legal20',kind:'real',lvl:'bio',
   q:'A contractor plans a ramp 20 ft long (along the ground) to a door 21 in up. Does it meet the 1 : 12 rule?',
   choices:['Yes: 20 ft is plenty','No: it is about 1 : 11.4, a little too steep','No: it is about 1 : 4, far too steep'],correct:1,
   steps:['Run = 20 ft = 240 in.','Slope = 21 ÷ 240 = 0.0875, or 1 : 11.4.','The rule allows at most 1 : 12 (0.0833), so this ramp is slightly too steep. It needs 21 ft.'],
   lab:{set:{mode:'ramp',rise:21,run:20},look:'Read <b>Your ramp’s slope</b> and <b>Meets the 1:12 rule?</b>'},verify:[['rpct',8.75,0.01]]},
  {id:'rise28',kind:'real',lvl:'bio',
   q:'A doorway is 28 in above the walkway. What is the shortest legal ramp, measured along the ground, in feet?',
   num:{ans:28,tol:0.01,unit:'ft'},
   steps:['At 1 : 12, the run is 12 times the rise: 28 × 12 = 336 in.','336 in ÷ 12 = 28 ft.','28 in is under the 30 in limit for one run, so no landing is needed in the middle.'],
   lab:{set:{mode:'ramp',rise:28,run:28},look:'Read <b>Your ramp’s slope</b>: 8.3% is exactly 1 : 12.'},verify:[['rpct',8.333,0.01]]},
  {id:'land',kind:'real',lvl:'honors',
   q:'A doorway is 48 in up. One ramp run may rise at most 30 in, and a level landing between runs must be at least 5 ft long. What is the shortest ramp, measured along the ground, counting the landing between the runs?',
   num:{ans:53,tol:0.01,unit:'ft'},
   steps:['48 in is more than 30 in, so it takes 2 runs, for example 24 in each.','Each run needs 24 ft at 1 : 12, so 48 ft of sloped ramp in all.','Add one 5 ft landing between them: 48 + 5 = 53 ft. (Landings at the top and bottom are required too.)'],
   lab:{set:{mode:'ramp',rise:48,run:53},look:'Read <b>Your ramp’s slope</b> and the note about landings.'},verify:[['rpct',8.333,0.01]]},
  {id:'pitch',kind:'test',lvl:'honors',
   q:'A roof has a 6/12 pitch. To the nearest 0.1°, what angle does it make with the horizontal?',
   num:{ans:26.6,tol:0.05,unit:'°'},
   steps:['Pitch is rise ÷ run: 6 ÷ 12 = 0.5.','tan θ = 0.5, so θ = tan⁻¹(0.5).','θ ≈ 26.6°.'],
   lab:{set:{mode:'roof',pitch:6},look:'Read <b>Roof angle</b>.'},verify:[['angle',26.565,0.01]]},
  {id:'rafter',kind:'real',lvl:'honors',
   q:'A house is 24 ft wide with a 6/12 roof. Ignoring overhang, how long is each rafter, and what length of board should you buy if lumber comes in 2 ft steps?',
   choices:['12 ft rafter, buy 12 ft boards','13.4 ft rafter, buy 14 ft boards','18 ft rafter, buy 18 ft boards'],correct:1,
   steps:['Each rafter covers half the width: a run of 12 ft.','It rises 6 in per foot, so 12 × 0.5 = 6 ft.','Rafter = √(12² + 6²) = √180 ≈ 13.4 ft. Twelve-foot boards are too short, so buy 14 ft.'],
   lab:{set:{mode:'roof',span:24,pitch:6,raft:13.5},look:'Lock in a gut answer, then read <b>Rafter length</b> and <b>Boards to buy</b>.'}},
  {id:'road',kind:'real',lvl:'ap',
   q:'A highway sign warns of an 8% grade for the next 3 miles of road. To the nearest foot, how far does the road drop?',
   num:{ans:1263,tol:6,unit:'ft'},
   steps:['3 miles = 3 × 5,280 = 15,840 ft of road.','The angle is tan⁻¹(0.08) ≈ 4.57°, so the drop is 15,840 × sin 4.57° ≈ 1,263 ft.','Grade × distance gives 0.08 × 15,840 ≈ 1,267 ft, almost the same, because for small angles sin θ ≈ tan θ.'],
   lab:{set:{mode:'road',grade:8,dist:3},look:'Read <b>Road angle</b>, then lock in a guess to see the drop.'},verify:[['gdeg',4.574,0.01]]}
 ]
}
});
