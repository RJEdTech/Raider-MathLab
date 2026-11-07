BioLab.addReview({
fairscore:{
 questions:[
  {id:'fprb',kind:'real',lvl:'bio',
   q:'Both groups are flagged at a risk score of 30% or more. In Group B (35% would struggle), what share of the students who would be fine get flagged anyway?',
   choices:['About 10%','About 23%','About 45%','About 70%'],correct:2,
   steps:['Look only at Group B’s fine students: the teal part of each bar.','Count the share of that teal area to the right of the 30% line.','It is 45.5%, against 9.7% for Group A’s fine students.'],
   lab:{set:{tA:30,tB:30,bA:15,bB:35,reveal:true},look:'Read <b>Fine, but flagged: Group B</b>.'},verify:[['fprB',45.5,0.1],['fprA',9.7,0.1]]},
  {id:'missa',kind:'real',lvl:'bio',
   q:'Same rule. Which group’s struggling students are missed more often, and why?',
   choices:['Group B, because more of its students struggle','Group A, because most of its scores are low, so even students who will struggle often score under 30%','Neither: the score is equally accurate for both'],correct:1,
   steps:['A miss is a struggling student who scores under the cutoff.','Group A’s scores bunch up near 0%, so many of its struggling students score under 30%.','Group A’s miss rate is 61.5%, Group B’s 23.0%.'],
   lab:{set:{tA:30,tB:30,bA:15,bB:35,reveal:true},look:'Read both <b>Needed help, missed</b> tiles.'},verify:[['fnrA',61.5,0.1],['fnrB',23.0,0.1]]},
  {id:'cond',kind:'test',lvl:'honors',
   q:'Of 1,000 Group B students, 350 would struggle and 650 would be fine. 296 of the fine students and 270 of the struggling students are flagged. Find the FPR, the FNR and the PPV.',
   choices:['FPR 45.5%, FNR 22.9%, PPV 47.7%','FPR 29.6%, FNR 77.1%, PPV 52.3%','FPR 45.5%, FNR 77.1%, PPV 47.7%','FPR 52.3%, FNR 22.9%, PPV 45.5%'],correct:0,
   steps:['FPR = P(flag | fine) = 296 / 650 ≈ 45.5%.','FNR = P(no flag | struggles) = (350 − 270) / 350 = 80 / 350 ≈ 22.9%.','PPV = P(struggles | flag) = 270 / (270 + 296) = 270 / 566 ≈ 47.7%.']},
  {id:'ppv',kind:'test',lvl:'honors',
   q:'Group B’s cutoff is raised to 50% while Group A stays at 30%. What does a flag mean in Group B now, to the nearest percent?',
   num:{ans:61,tol:1,unit:'%'},
   steps:['PPV = P(struggles | flagged). Group B’s flagged students all have scores of 50% or more.','Because the score is calibrated, PPV is the average score of the flagged students: about 61.5%.','In Group A a flag still means 41.3%, so the flag no longer means the same thing in both groups.'],
   lab:{set:{tA:30,tB:50,bA:15,bB:35,reveal:true},look:'Read both <b>A flag means</b> tiles.'},verify:[['ppvB',61.5,0.1],['ppvA',41.3,0.1]]},
  {id:'equal',kind:'real',lvl:'honors',
   q:'Set both groups’ base rates to 25%, with one cutoff of 30% for both. What happens to the gap in error rates?',
   choices:['It stays large','It disappears: equal base rates let one calibrated cutoff give equal error rates','Group A’s errors double'],correct:1,
   steps:['With equal base rates, both groups have the same score distribution in this model.','The same cutoff then gives the same FPR, FNR and PPV in both groups.','The impossibility only bites when base rates differ.'],
   lab:{set:{tA:30,tB:30,bA:25,bB:25,reveal:true},look:'Read <b>Total error-rate gap</b>.'},verify:[['gap',0,0.01]]},
  {id:'ident',kind:'test',lvl:'ap',
   q:'Prove from a two-way table that FPR = [b/(1 − b)]·[(1 − PPV)/PPV]·(1 − FNR), where b is the base rate. Which step is the key one?',
   choices:['TP = b(1 − FNR) and FP = (1 − b)·FPR, and PPV = TP/(TP + FP), so FP = TP(1 − PPV)/PPV','FPR + FNR = 1 for any cutoff','PPV = 1 − FPR'],correct:0,
   steps:['As shares of the whole group: true positives TP = b(1 − FNR), false positives FP = (1 − b)·FPR.','PPV = TP/(TP + FP) gives FP = TP·(1 − PPV)/PPV.','Substitute: (1 − b)·FPR = b(1 − FNR)(1 − PPV)/PPV, so FPR = [b/(1 − b)]·[(1 − PPV)/PPV]·(1 − FNR). If PPV and FNR match across groups but b does not, FPR cannot match.']},
  {id:'compas',kind:'real',lvl:'ap',
   q:'ProPublica found COMPAS labeled non-reoffending Black defendants high risk 45% of the time, against 23% for white defendants. Northpointe showed the score was calibrated. How can both be true?',
   choices:['One of them must have made an arithmetic error','When base rates of re-arrest differ between groups, a calibrated score with one cutoff gives different false positive rates','Calibration and error rates measure the same thing'],correct:1,
   steps:['Calibration is about what a score means: P(re-offend | score).','The false positive rate is about who gets labeled among people who did not re-offend: P(high risk | did not re-offend).','By the impossibility result, with different base rates both cannot be equal across groups, so the two analyses were measuring different kinds of fairness.']}
 ]
}
});
