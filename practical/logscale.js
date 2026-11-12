BioLab.addPractical({
logscale:{
 hook:'You write for your school’s news site. A new virus is spreading in the fictional country of Norvale, and two weeks in there are 3,073 reported cases. Your editor wants the headline to say when the total will pass 1,000,000. What day do you write?',
 answer:'Day 40. On a log axis the first two weeks make a straight line, growing about 26% a day (doubling about every 3 days). Following that line up to 1,000,000 gives day 40, which is 26 days of warning. Reading the regular chart as a steady climb at last week’s pace (about 352 new cases a day) would put a million cases about 7.8 years away.',
 uses:[
  '<b>Do:</b> when a news chart shows something growing (cases, prices, views), check whether the y-axis is regular or logarithmic before you judge how fast it is growing. <b>Why:</b> on a log axis, steady doubling is a straight line; on a regular axis, the same growth looks flat and then explodes. Many COVID-19 dashboards offered both views for this reason.',
  '<b>Do:</b> when something doubles on a schedule, count doublings instead of adding: 3,000 → 6,000 → 12,000… <b>Why:</b> about 10 doublings make 1,000 times as much, 20 make a million times. That is why a rumor, a group-chat screenshot or an outbreak can go from “a few” to “everywhere” in weeks.',
  '<b>Do:</b> protect your hearing by treating every 10 dB as 10 times the sound energy: use earplugs at concerts and keep earbuds low enough that you can still hear people next to you. <b>Why:</b> decibels are a log scale. The CDC notes that sounds at or above 85 dB can damage hearing over time, and a concert at 105 dB carries about 100 times the energy of 85 dB.'
 ],
 takeaway:'If something grows by multiplying, put it on a log axis. A straight line means steady exponential growth, and its slope tells you the doubling time and when you will hit any number.'
}
});
