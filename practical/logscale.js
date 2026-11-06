BioLab.addPractical({
logscale:{
 hook:'You write for your school’s news site. A new virus is spreading in the fictional country of Norvale, and two weeks in there are 3,073 reported cases. Your editor wants the headline to say when the total will pass 1,000,000. What day do you write?',
 answer:'Day 40. On a log axis the first two weeks make a straight line, growing about 26% a day (doubling about every 3 days). Following that line up to 1,000,000 gives day 40, which is 26 days of warning. Reading the regular chart as a steady climb at last week’s pace (about 352 new cases a day) would put a million cases about 7.8 years away.',
 uses:[
  'Pandemic dashboards: during COVID-19, many public-health dashboards and news charts plotted case counts on a log scale. A straight stretch meant steady exponential growth, and a line bending flatter showed the growth was slowing.',
  'Moore’s law: the number of transistors on computer chips roughly doubled about every two years for decades. Engineers plot that history on a log axis, where it is close to a straight line, to track the trend and plan future chips.',
  'Earthquakes and sound: earthquake magnitude and decibels are log scales. One step up in magnitude means about 32 times more energy released, and every 10 dB means 10 times more sound intensity.'
 ],
 takeaway:'If something grows by multiplying, put it on a log axis. A straight line means steady exponential growth, and its slope tells you the doubling time and when you will hit any number.'
}
});
