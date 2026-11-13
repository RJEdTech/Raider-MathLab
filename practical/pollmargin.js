BioLab.addPractical({
pollmargin:{
 hook:'You are running a friend’s campaign for student council president in a two-candidate race. Your school has 2,000 students. You survey a random sample of 100 students, and 54 say they will vote for your candidate: 54%. Is your candidate a lock to win?',
 answer:'Not a lock. The 95% margin of error for 54 of 100 is about ±9.8 points, so plausible values for the true support run from about 44% to 64%, which includes losing. “95% confidence” means about 95 of every 100 polls like this make intervals that catch the truth. Even a poll of 200 students (±6.9 points, 47.1% to 60.9%) cannot rule out a loss. For 54% to clear 50%, the formula says you would need about 600 students, far past 10% of the school.',
 uses:[
  '<b>Do:</b> when a poll lead is smaller than about twice its margin of error, call it too close to tell. <b>Why:</b> for a poll of about 1,000 people the margin is around ±3 points, and for about 600 around ±4: the same formula, 1.96 √(p̂(1 − p̂)/n), applies to each candidate’s share.',
  '<b>Do:</b> when you look up county numbers in the American Community Survey, read the margin of error next to each one. <b>Why:</b> the Census Bureau publishes a 90% margin of error beside its estimates of income, commute times and more for every state and county.',
  '<b>Do:</b> when you read a medical study, look at the 95% confidence interval, not just the headline number. <b>Why:</b> it shows how precise an estimate is, such as how much a treatment lowers the risk of an illness.'
 ],
 takeaway:'A poll result is an estimate. Read it with its margin of error: if the interval includes 50%, the race is too close to call. Four times the sample gives half the margin.'
}
});
