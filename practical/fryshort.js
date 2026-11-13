BioLab.addPractical({
fryshort:{
 hook:'The burger place near school (a made-up restaurant for this tool) lists a box of fries at 4.1 oz. Your friends swear the boxes look light lately, so you all weigh 12 boxes on a kitchen scale. They average 4.02 oz. Are they shorting you, or is that just normal variation?',
 answer:'Not enough evidence. Your average is 0.08 oz under, but honest boxes vary so much that an honest restaurant’s 12-box average lands this low about 15 times in 100 (t = −1.11, p = 0.146). With boxes this uneven, the average would need to be about 0.13 oz under before the 5% test calls it shorting.',
 uses:[
  '<b>Do:</b> weigh a few packages of a snack you buy often and compare with the label. <b>Why:</b> weights-and-measures inspectors follow NIST Handbook 133: they weigh a random sample and compare the average shortfall with a limit based on the sample’s standard deviation, the same idea as this test.',
  '<b>Do:</b> when you judge whether a machine or a process has drifted, use a sample average, not one item. <b>Why:</b> factories that fill cereal boxes and bottles pull samples off the line and check whether the average fill has drifted before the product ships.',
  '<b>Do:</b> in a lab report, test whether your gap from the accepted value is bigger than your scatter. <b>Why:</b> a one-sample t-test tells you whether a measured density or g differs from the accepted value by more than measurement scatter can explain.'
 ],
 takeaway:'An average under the label is not evidence by itself. Compare the gap with how much an average wobbles by luck, s/√n. Only a gap of many wobbles is convincing.'
}
});
