BioLab.addPractical({
slump:{
 hook:'You make 75% of your free throws, but tonight you made only 5 of your last 10. Is it a slump, or just bad luck? Say that in 1 of every 5 stretches you really are in a slump (a sore wrist, a flaw in your form) and shoot 60%; the rest of the time you are your usual 75% self. When should you call it a slump?',
 answer:'Not from 10 shots. A 75% shooter makes 5 of 10 or fewer about 8 times in 100 stretches (7.8%) with nothing wrong at all. With 10 shots, even the best rule (call a slump at 4 of 10 or fewer) makes about 18 wrong calls per 100 stretches. Look at 100 shots and the best rule makes about 4; at 400 shots, almost none.',
 uses:[
  'Quality control in factories: inspectors test a sample from each batch and stop the line when the defect rate in the sample is too high. Setting that cutoff trades false alarms against missed problems, just like your slump line.',
  'Baseball analytics: a batting average over a couple of weeks swings a lot from luck alone, so analysts wait for hundreds of at-bats before deciding a hitter has really gotten better or worse.',
  'Medical screening tests: a lab picks the cutoff that counts as a positive result. A lower cutoff catches more real cases but flags more healthy people, the same trade-off between missed slumps and false alarms.'
 ],
 takeaway:'Short stretches mostly measure luck. The spread of a sample proportion shrinks like 1/√n, so judge yourself on many shots before deciding something has changed.'
}
});
