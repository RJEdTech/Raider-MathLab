BioLab.addPractical({
fairscore:{
 hook:'Your school flags students who might fail a class and sends them to required after-school study hall. The risk score is equally accurate for two groups of students: a 30% score means a 30% chance of struggling in either group. But 15% of Group A would struggle and 35% of Group B would. If both groups are flagged at 30% or more, is that fair?',
 answer:'Not by every measure. With one cutoff, 45.5% of Group B students who would have been fine get flagged, against 9.7% in Group A, and 61.5% of Group A students who need help are missed, against 23.0% in Group B. Moving Group B’s cutoff to 50% nearly equalizes both error rates, but then a flag means a 41% chance of struggling in Group A and 61% in Group B. With different base rates, you cannot have both.',
 uses:[
  '<b>Do:</b> when a score or app flags people, ask two separate questions: of the people who were fine, what share got flagged, and of the people flagged, what share really needed it? <b>Why:</b> those are different fractions. ProPublica (2016) found COMPAS, a risk score used in some U.S. courts, had very different false positive rates by race in Broward County, Florida, while its maker, Northpointe, showed the score was calibrated. Both held at once, for the reason this tool shows.',
  '<b>Do:</b> if a school early-warning system flags you or a friend, ask what data it uses (grades, attendance) and what happens when it is wrong. <b>Why:</b> every cutoff trades false flags for missed students, and the trade can land differently on groups with different base rates.',
  '<b>Do:</b> when you read about a screening test, look for its false positive and false negative rates and how common the condition is, not just “accuracy.” <b>Why:</b> a cutoff that suits one group can over-flag or under-flag another group with a different base rate. That is why screening guidelines are argued over with both error rates side by side.'
 ],
 takeaway:'A score can be accurate for everyone and still make different mistakes for different groups. When base rates differ, equal error rates and equal meaning cannot both hold, so choosing a cutoff is choosing which fairness to protect.'
}
});
