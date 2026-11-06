BioLab.addPractical({
rapidtest:{
 hook:'You take a home rapid test before a family trip, just to be safe, and it says positive. Right now about 1 in 100 people has the illness. The test catches 80% of people who are sick, and it gives a false positive to 1% of people who are not. What is the chance you are really sick?',
 answer:'About 45% (44.7%). Out of 10,000 people like you, 100 are sick and the test flags 80 of them. It also flags 99 of the 9,900 healthy people. Only 80 of the 179 positives are really sick. That is still nearly 45 times your 1% chance before the test, so the positive matters: follow the test’s instructions and a doctor’s advice.',
 uses:[
  'Newborn screening: nearly every baby born in the US gets a heel-prick blood test for dozens of rare conditions. Because the conditions are so rare, most positive screens turn out to be false alarms, so every positive screen is followed up with more testing, such as a repeat screen or a diagnostic test.',
  'Card fraud alerts: almost every purchase is honest, so even a good fraud detector flags many honest purchases. That is one reason banks text you to confirm a flagged charge instead of simply treating it as fraud.',
  'Spam filters: Bayesian spam filters score each email by combining how common spam is with how much more often each of its words shows up in spam than in real mail, the same base-rate math.'
 ],
 takeaway:'A positive result means “sick” only as much as real cases outnumber false alarms. When the illness is rare, false alarms from the big healthy group can be most of the positives.'
}
});
