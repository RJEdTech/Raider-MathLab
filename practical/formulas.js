BioLab.addPractical({
formulas:{
 hook:'Your club is ordering 40 custom T-shirts at $12 each. The shop adds a $35 setup fee, then 8% sales tax on the whole order, fee included. What rule gives the right total for this order, and for every order the club places after it?',
 answer:'Add the shirts and the fee first, then tax it all: (p × n + F) × (1 + r). For 40 shirts that is (480 + 35) × 1.08 = $556.20. Leave out the first pair of parentheses and you get $517.80, so the club comes up $38.40 short at pickup. The right formula is right for every order: 100 shirts cost $1,333.80.',
 uses:[
  'Spreadsheets: every formula you type into Excel or Google Sheets follows the same order of operations, so =B1*B2+B3*(1+B4) and =(B1*B2+B3)*(1+B4) give different answers. Budgets, grade books and payrolls all run on cell formulas like these.',
  'Online checkout: the total on a checkout page comes from a formula for subtotal, shipping and sales tax. States set different rules about whether shipping is taxed, so the store’s formula has to group the right terms for where you live.',
  'In 2013, a graduate student checking a famous 2010 economics paper by Carmen Reinhart and Kenneth Rogoff found that one spreadsheet formula averaged the wrong range of cells and left five countries out. The paper had been cited in debates over government spending, and the mistake made news around the world.'
 ],
 takeaway:'A formula is a rule for every case, not one answer. Parentheses decide what gets added before it gets multiplied, so one misplaced pair makes every total wrong.'
}
});
