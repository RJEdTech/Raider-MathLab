BioLab.addPractical({
studymethod:{
 hook:'Your class of 30 tries an experiment before a 30-word vocabulary quiz. A random half quiz themselves with flashcards; the other half reread their notes. The flashcard group averages 21.6 words and the rereading group 18.5, but the scores overlap a lot. Did practice testing really help, or could a 3-word gap be chance?',
 answer:'Real, by the 5% rule. Only 2 of 100 random reshuffles of the same 30 scores made a gap that big, and the two-sample t-test agrees: t = 2.24, p = 0.021 with df = 14. A 90% confidence interval says flashcards add somewhere from about 0.7 to 5.5 words on average for students like these.',
 uses:[
  'New medicines are approved on the strength of randomized controlled trials: patients are randomly assigned to the drug or a placebo, and the trial asks whether the difference in outcomes is bigger than chance could produce.',
  'A/B tests: apps and websites randomly show users two versions of a page or feature and check whether the difference in clicks or sign-ups is bigger than chance before switching everyone over.',
  'Learning research: experiments on retrieval practice (testing yourself) have repeatedly found it helps long-term memory more than rereading. A 2013 review by Dunlosky and colleagues rated practice testing a high-utility study strategy and rereading a low-utility one. The scores in this tool are simulated, not from that research.'
 ],
 takeaway:'Random assignment plus a significance test lets you credit a gap to the method itself. The question is always: could reshuffling the same people into new groups make a gap this big?'
}
});
