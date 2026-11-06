BioLab.addPractical({
pollmargin:{
 hook:'You are running a friend’s campaign for student council president in a two-candidate race. Your school has 2,000 students. You survey a random sample of 100 students, and 54 say they will vote for your candidate: 54%. Is your candidate a lock to win?',
 answer:'Not a lock. The 95% margin of error for 54 of 100 is about ±9.8 points, so plausible values for the true support run from about 44% to 64%, which includes losing. “95% confidence” means about 95 of every 100 polls like this make intervals that catch the truth. Even a poll of 200 students (±6.9 points, 47.1% to 60.9%) cannot rule out a loss. For 54% to clear 50%, the formula says you would need about 600 students, far past 10% of the school.',
 uses:[
  'Election polls in the news report a margin of error. For a poll of about 1,000 people it is around ±3 points, and for about 600 people around ±4: the same formula, √(p̂(1 − p̂)/n) times 1.96.',
  'The US Census Bureau’s American Community Survey publishes a margin of error, at 90% confidence, next to its estimates of things like income and commute times for every state and county.',
  'Medical studies report 95% confidence intervals for their results, such as how much a new treatment lowers the risk of an illness, so doctors can see how precise the estimate is.'
 ],
 takeaway:'A poll result is an estimate. Read it with its margin of error: if the interval includes 50%, the race is too close to call. Four times the sample gives half the margin.'
}
});
