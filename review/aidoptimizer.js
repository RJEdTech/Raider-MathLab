BioLab.addReview({
aidoptimizer:{
 questions:[
  {id:'shop20',kind:'real',lvl:'bio',
   q:'Comparison shoppers: 500 admitted, $60,000 tuition. With a $20,000 scholarship, half of them enroll. How much net tuition revenue does the college expect from this group, in millions of dollars?',
   num:{ans:10,tol:0.01,unit:'million dollars'},
   steps:['Students who enroll: 500 × 0.50 = 250.','Each pays $60,000 − $20,000 = $40,000.','Revenue: 250 × $40,000 = $10,000,000, or $10.00 million.'],
   lab:{set:{group:'shop',aid:20000,show:true},look:'Read <b>Net tuition revenue from this group</b>.'},verify:[['rev',10000000,1],['enroll',250,0.01]]},
  {id:'fans0',kind:'real',lvl:'bio',
   q:'First-choice fans: 300 admitted. With no scholarship, each has a 70.2% chance of enrolling. About how many enroll?',
   num:{ans:211,tol:1,unit:'students'},
   steps:['Expected students = admitted × chance = 300 × 0.702.','= 210.6, so about 211 students.','These are the students who would come with no scholarship at all. Any award the fans get goes to them too.'],
   lab:{set:{group:'fans',aid:0},look:'Read <b>Expected students who enroll from this group</b>.'},verify:[['enroll',210.62,0.05]]},
  {id:'offers',kind:'real',lvl:'bio',
   q:'Back in your own chair. College A: sticker $68,000, grants $36,000. College B: sticker $60,000, grants $24,000. Which costs your family less each year, and by how much?',
   choices:['College A, by $4,000','College B, by $8,000','College B, by $4,000','They cost the same'],correct:0,
   steps:['Net price A = $68,000 − $36,000 = $32,000.','Net price B = $60,000 − $24,000 = $36,000.','College A is $4,000 a year cheaper, even with the higher sticker. If B is your first choice, its offer is the one to ask about.']},
  {id:'ev',kind:'test',lvl:'honors',
   q:'A college admits 200 students. With a $15,000 scholarship on $50,000 tuition, each enrolls with probability 0.35. What is the expected net tuition revenue?',
   num:{ans:2450000,tol:1,unit:'dollars'},
   steps:['Expected students: 200 × 0.35 = 70.','Each pays $50,000 − $15,000 = $35,000.','Expected revenue: 70 × $35,000 = $2,450,000.']},
  {id:'anyway',kind:'real',lvl:'honors',
   q:'Fans get their revenue-maximizing award, about $7,155 each. About 210.6 fans would have enrolled with no scholarship. How much of the aid goes to them, in millions of dollars?',
   num:{ans:1.51,tol:0.01,unit:'million dollars'},
   steps:['Aid to students who would come anyway = (students who would come anyway) × award.','= 210.6 × $7,155 ≈ $1,507,000.','About $1.51 million, while the award changes only about 50 decisions.'],
   lab:{set:{group:'fans',show:true},act:'best',look:'Read <b>Aid to students who would have come anyway</b> and <b>Extra students the scholarship brings in</b>.'},verify:[['anyway',1507069,600],['moved',49.64,0.05]]},
  {id:'slope',kind:'test',lvl:'ap',
   q:'For a logistic yield curve with s = $7,000, the chance of enrolling is now P = 0.80. By about how many percentage points does $1,000 more aid raise it?',
   num:{ans:2.29,tol:0.02,unit:'percentage points'},
   steps:['P′(a) = P(1 − P)/s = 0.80 × 0.20 / 7,000 per dollar.','= 0.16 / 7,000 ≈ 0.0000229 per dollar.','Times $1,000: about 0.0229, or 2.29 percentage points. At the midpoint (P = 0.5) it would be 3.57.']},
  {id:'foc',kind:'test',lvl:'ap',
   q:'At the revenue-maximizing award for shoppers, P = 0.77629 and s = $7,000. Use S − a = s/(1 − P) to find what each student pays, to the nearest dollar.',
   num:{ans:31291,tol:2,unit:'dollars'},
   steps:['1 − P = 0.22371.','S − a = 7,000 / 0.22371 ≈ $31,291.','So the award is a = $60,000 − $31,291 = $28,709.'],
   lab:{set:{group:'shop',show:true},act:'best',look:'Read <b>What each of them pays</b> and <b>Revenue-maximizing scholarship for this group</b>.'},verify:[['net',31290.71,1],['astar',28709.29,1]]}
 ]
}
});
