BioLab.addPractical({
fryshort:{
 hook:'The burger place near school (a made-up restaurant for this tool) lists a box of fries at 4.1 oz. Your friends swear the boxes look light lately, so you all weigh 12 boxes on a kitchen scale. They average 4.02 oz. Are they shorting you, or is that just normal variation?',
 answer:'Not enough evidence. Your average is 0.08 oz under, but honest boxes vary so much that an honest restaurant’s 12-box average lands this low about 15 times in 100 (t = −1.11, p = 0.146). With boxes this uneven, the average would need to be about 0.13 oz under before the 5% test calls it shorting.',
 uses:[
  'Weights-and-measures inspectors check packaged food with the U.S. National Institute of Standards and Technology’s Handbook 133: they weigh a random sample of packages and compare the average shortfall with a limit based on the sample’s standard deviation, the same idea as this test.',
  'Factories that fill cereal boxes, chip bags and bottles pull samples off the line and check whether the average fill has drifted from the target before the product ships.',
  'Your own lab reports: when you compare a measured value, such as the density of a metal or the acceleration due to gravity, with the accepted value, a one-sample t-test tells you whether the gap is bigger than your measurement scatter can explain.'
 ],
 takeaway:'An average under the label is not evidence by itself. Compare the gap with how much an average wobbles by luck, s/√n. Only a gap of many wobbles is convincing.'
}
});
