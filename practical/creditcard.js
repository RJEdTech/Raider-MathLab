BioLab.addPractical({
creditcard:{
 hook:{bio:'You have $1,500 on your first credit card. It charges 24% interest a year (its APR), which is 2% of what you owe every month, and it only asks for a small minimum payment each month. If you pay just the minimum, how long until you are free of it, and how much extra will it cost you?',
  honors:'You have $1,500 on your first credit card at 24% APR, and the card only asks for a small minimum each month. If you pay just the minimum, how long until you are free of it, and how much extra will it cost you?'},
 answer:'About 9.5 years (114 months), with $1,887 in interest: more than the $1,500 you borrowed. Paying a fixed $100 a month clears it in 19 months with $301 in interest, saving $1,586.',
 uses:[
  'Your credit card statement: under the US Credit CARD Act of 2009, most monthly statements must show how long the balance will take to pay off with minimum payments only, what that will cost in total, and what monthly payment would clear it in 3 years. Banks compute those numbers by running the balance forward month by month, the same kind of model as this one.',
  'Car loans and mortgages: the monthly payment on a fixed-rate loan comes from the same formula, B(1 + r)ⁿ − P((1 + r)ⁿ − 1)/r = 0, solved for the payment P instead of the time n. Every loan calculator and payment schedule runs it.',
  'Savings accounts: US banks must state the annual percentage yield (APY), the yearly rate including compounding. Your savings grow by the same exponential rule, run in your favor.'
 ],
 takeaway:'Interest is charged on what you still owe. A payment that shrinks with the balance makes the debt decay slowly; a fixed payment well above the interest ends it fast.'
}
});
