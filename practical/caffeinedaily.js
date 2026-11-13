BioLab.addPractical({
caffeinedaily:{
 hook:'Your mom has one coffee with 100 mg of caffeine every morning at 7 AM, and she wonders if it is building up in her body. Some of yesterday’s caffeine is still in her when she has today’s, and a little from the day before that. You check with the math: after a week, how much caffeine is in her body right after her morning coffee? Does it keep growing?',
 answer:'About 104 mg, if her half-life is 5 hours. 24 hours is 4.8 half-lives, so only about 3.6% of each day’s caffeine is left the next morning. The morning total levels off at 100/(1 − 0.036) ≈ 103.7 mg by day 2 or 3 and does not keep growing. With a 7-hour half-life it levels off near 110 mg.',
 uses:[
  '<b>Do:</b> take a daily medicine at the same time each day, as the label says. <b>Why:</b> a once-a-day medicine builds up the way caffeine does here. Pharmacology calls 1/(1 − r) the accumulation ratio: with a 24-hour half-life, r = 1/2 each day, so it levels off at twice a single dose.',
  '<b>Do:</b> set up an automatic monthly transfer into savings. <b>Why:</b> the same amount with interest each month is a geometric series. The future-value formula banks use, P((1 + i)ⁿ − 1)/i, is the partial-sum formula with r = 1 + i.',
  '<b>Do:</b> in a music or video editor, keep a delay effect’s feedback below 100%. <b>Why:</b> feedback is r: each echo is that fraction as loud as the last. Below 100% the echoes fade and the total stays finite; at 100% or more they pile up.'
 ],
 takeaway:'When each day keeps the same share r of the day before, the totals form a geometric series. If r is less than 1, it levels off at D/(1 − r) instead of growing forever.'
}
});
