BioLab.addPractical({
carhouse:{
 hook:'Your first job pays $6,000 a month before taxes, and you pay $300 a month on a student loan. A dealer shows you a car for $530 a month. In a few years you want to buy a condo. Lenders usually check two rules: housing at most 28% of income, and housing plus all other debts at most 36%. How much smaller does that car payment make the home loan you can get?',
 answer:'About $51,665. Without the car, rule 1 is the tighter limit: housing up to $1,680 a month. With it, rule 2 allows only $2,160 − $300 − $530 = $1,330, so the car takes $350 a month off what you can pay for a home. At 7.18% for 30 years, each $1 a month supports about $147.62 of loan, and $350 × $147.62 ≈ $51,665. If a lender allows total debt up to 50%, the same car costs about $78,236 of loan.',
 uses:[
  'Mortgage applications: Fannie Mae, which buys a large share of US home loans, caps total debt payments at 36% of gross income for manually reviewed loans, up to 45% with strong credit and savings, and up to 50% through its automated system. A loan officer runs this exact calculation on your application.',
  'Car shopping: dealers quote a monthly payment, and in early 2026 the average was $531 for a used car and $770 for a new one (Experian). Comparing that payment with your income, the way a lender will later, shows what the car really costs you.',
  'Renting: many landlords require gross income of about three times the monthly rent, which is the same kind of inequality: rent ≤ income ÷ 3.'
 ],
 takeaway:'Each lender rule is a linear inequality, and the housing payment you can have must pass both. Past the point where the two lines cross, every dollar of car payment is a dollar less for housing, and each monthly dollar is worth well over $100 of home loan.'
}
});
