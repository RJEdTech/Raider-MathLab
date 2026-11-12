BioLab.addPractical({
creditcard:{
 hook:{bio:'You have $1,500 on your first credit card. It charges 24% interest a year (its APR), which is 2% of what you owe every month, and it only asks for a small minimum payment each month. If you pay just the minimum, how long until you are free of it, and how much extra will it cost you?',
  honors:'You have $1,500 on your first credit card at 24% APR, and the card only asks for a small minimum each month. If you pay just the minimum, how long until you are free of it, and how much extra will it cost you?'},
 answer:'About 9.5 years (114 months), with $1,887 in interest: more than the $1,500 you borrowed. Paying a fixed $100 a month clears it in 19 months with $301 in interest, saving $1,586.',
 uses:[
  'Build it yourself: <a href="excel.html#build-creditcard">build this payoff month by month in a spreadsheet</a>, one step at a time, then download it and open it in Excel.',
  '<b>Do:</b> when you get a credit card statement, find the “Minimum Payment Warning” box and compare the minimum-only line with the 3-year line. <b>Why:</b> the Credit CARD Act of 2009 makes most card statements print both: how long minimums take and what they cost, next to the payment that clears it in 3 years. That box is this graph, for your own card.',
  '<b>Do:</b> if you carry a balance, pay a fixed amount every month instead of whatever the minimum says, and set it up as an automatic payment. <b>Why:</b> the minimum shrinks as the balance shrinks, so each month knocks off only about 1%. A fixed $100 cleared this $1,500 in 19 months instead of 114. The Consumer Financial Protection Bureau also warns that paying only the minimum keeps you in debt longer and costs more in interest.',
  '<b>Do:</b> when you open a savings account, compare banks by the APY, not the interest rate. <b>Why:</b> US banks must state the annual percentage yield, the yearly rate including compounding. It is the same exponential rule as the card, 1.02¹² ≈ 1.268, running in your favor.'
 ],
 takeaway:'Interest is charged on what you still owe. A payment that shrinks with the balance makes the debt decay slowly; a fixed payment well above the interest ends it fast.'
}
});
