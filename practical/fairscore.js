BioLab.addPractical({
fairscore:{
 hook:'Your school flags students who might fail a class and sends them to required after-school study hall. The risk score is equally accurate for two groups of students: a 30% score means a 30% chance of struggling in either group. But 15% of Group A would struggle and 35% of Group B would. If both groups are flagged at 30% or more, is that fair?',
 answer:'Not by every measure. With one cutoff, 45.5% of Group B students who would have been fine get flagged, against 9.7% in Group A, and 61.5% of Group A students who need help are missed, against 23.0% in Group B. Moving Group B’s cutoff to 50% nearly equalizes both error rates, but then a flag means a 41% chance of struggling in Group A and 61% in Group B. With different base rates, you cannot have both.',
 uses:[
  'Courtrooms: COMPAS risk scores are used in some U.S. courts. ProPublica (2016) found its false positive rates differed sharply by race in Broward County, Florida, while its maker, Northpointe, showed the score was calibrated. This tool’s math is why both claims held at once.',
  'Early-warning systems in schools flag students at risk of failing or dropping out from data such as grades and attendance. Every cutoff trades false flags for missed students, and the trade can land differently on different groups.',
  'Medical screening: a test cutoff that suits one group can over-flag or under-flag another group with a different base rate, which is why screening guidelines are argued over with false positive and false negative rates side by side.'
 ],
 takeaway:'A score can be accurate for everyone and still make different mistakes for different groups. When base rates differ, equal error rates and equal meaning cannot both hold, so choosing a cutoff is choosing which fairness to protect.'
}
});
