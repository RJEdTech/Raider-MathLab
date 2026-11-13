BioLab.addPractical({
studymethod:{
 hook:'Your class of 30 tries an experiment before a 30-word vocabulary quiz. A random half quiz themselves with flashcards; the other half reread their notes. The flashcard group averages 21.6 words and the rereading group 18.5, but the scores overlap a lot. Did practice testing really help, or could a 3-word gap be chance?',
 answer:'Real, by the 5% rule. Only 2 of 100 random reshuffles of the same 30 scores made a gap that big, and the two-sample t-test agrees: t = 2.24, p = 0.021 with df = 14. A 90% confidence interval says flashcards add somewhere from about 0.7 to 5.5 words on average for students like these.',
 uses:[
  '<b>Do:</b> quiz yourself instead of rereading your notes. <b>Why:</b> experiments on retrieval practice have repeatedly found it helps long-term memory more than rereading; a 2013 review by Dunlosky and colleagues rated practice testing high-utility and rereading low-utility. (The scores in this tool are simulated, not from that research.)',
  '<b>Do:</b> when you read that a medicine works, check whether it was tested in a randomized controlled trial. <b>Why:</b> patients are randomly assigned to the drug or a placebo, and the trial asks whether the difference in outcomes is bigger than chance could produce.',
  '<b>Do:</b> when you test two versions of anything, assign them at random and compare against chance. <b>Why:</b> apps and websites run A/B tests that way before switching everyone over.'
 ],
 takeaway:'Random assignment plus a significance test lets you credit a gap to the method itself. The question is always: could reshuffling the same people into new groups make a gap this big?'
}
});
