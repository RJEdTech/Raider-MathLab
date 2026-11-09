BioLab.addPractical({
mortgageterm:{
 hook:'A family buys a $400,000 home with 20% down and borrows $320,000. The bank offers a 30-year loan at 7.18% or a 15-year loan at 6.57% (Freddie Mac’s averages on Nov 5, 2026). The 15-year payment is $632.08 a month higher. How much less interest does the 15-year loan pay over its life?',
 answer:'About $276,428. The 30-year loan is $2,167.79 a month for 360 months: $780,404 in all, $460,404 of it interest. The 15-year loan is $2,799.87 a month for 180 months: $503,977 in all, $183,977 of it interest. Adding $200 a month to the 30-year loan ends it in 278 payments (about 23 years) and saves about $124,088.',
 uses:[
  'Loan Estimates: lenders must give homebuyers a standard Loan Estimate form, and it lists the Total Interest Percentage, the interest over the life of the loan as a percent of the amount borrowed. Here it is about 144% for the 30-year loan and 57% for the 15-year.',
  'Rate news: Freddie Mac publishes average 30-year and 15-year mortgage rates every Thursday. Families watching those rates are deciding when to buy or refinance with this exact formula.',
  'Any fixed-payment loan: car loans and student loans use the same formula. A shorter term means a bigger payment and less total interest, and solving for n with logs tells you when any loan will be paid off.'
 ],
 takeaway:'Total interest is nM − P. A long loan pays interest on a large balance for many years, so halving the term cuts the interest by much more than half. Solving the payment formula for n takes a logarithm.'
}
});
