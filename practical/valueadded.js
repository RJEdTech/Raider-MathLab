BioLab.addPractical({
valueadded:{
 hook:'Your school board is weighing a plan: rate every teacher by one year of their students’ test-score growth, and let go of the lowest 5%. The student council asks you to check it before the vote. Each teacher’s score would rest on one class of about 25 students. Out of every 100 teachers fired this way, how many would actually be average or better?',
 answer:'In this model, about 3 of every 100. That sounds reassuring until you see the rest: only about 37 of every 100 fired teachers are truly among the worst 5%. The other 63 are teachers who drew an unlucky class. A class average of 25 is off by about 2 points, as much as real teachers differ, so this year’s scores predict next year’s with a correlation of only about 0.5.',
 uses:[
  'Polls: the margin of error shrinks with the square root of the sample. A poll of 1,000 people is good to about ±3 points; a poll of 25 would be off by up to about ±20.',
  'Batting averages: a hitter can bat .400 over the first 25 at-bats of a season, but no major-league hitter has batted .400 over a full season since 1941. Small samples land at the extremes, then regress toward the mean.',
  'Teacher evaluations: in 2017 Houston teachers settled a federal lawsuit over value-added scores, and the district agreed not to fire teachers based on scores they cannot independently check.'
 ],
 takeaway:'A score built on a small sample is part signal and part luck. Before anyone acts on a ranking, ask how big the standard error is compared with the real differences, and whether the person rated can check the data.'
}
});
