BioLab.addPractical({
formulas:{
 hook:'Your club is ordering 40 custom T-shirts at $12 each. The shop adds a $35 setup fee, then 8% sales tax on the whole order, fee included. What rule gives the right total for this order, and for every order the club places after it?',
 answer:'Add the shirts and the fee first, then tax it all: (p × n + F) × (1 + r). For 40 shirts that is (480 + 35) × 1.08 = $556.20. Leave out the first pair of parentheses and you get $517.80, so the club comes up $38.40 short at pickup. The right formula is right for every order: 100 shirts cost $1,333.80.',
 uses:[
  'Build it yourself: <a href="excel.html#build-formulas">rebuild this T-shirt order in a spreadsheet</a>, one step at a time, then download it and open it in Excel.',
  '<b>Do:</b> in a spreadsheet, put parentheses around what should happen first. <b>Why:</b> Excel and Google Sheets follow the order of operations, so =B1*B2+B3*(1+B4) and =(B1*B2+B3)*(1+B4) give different answers. Budgets, grade books and payrolls all run on formulas like these.',
  '<b>Do:</b> check an online checkout total by hand: subtotal, shipping, then sales tax. <b>Why:</b> states set different rules about whether shipping is taxed, so the store’s formula has to group the right terms for where you live.',
  '<b>Do:</b> before you share a spreadsheet’s result, check that each formula covers the right range of cells. <b>Why:</b> in 2013, a graduate student checking a famous 2010 economics paper by Carmen Reinhart and Kenneth Rogoff found one formula averaged the wrong range and left five countries out. The paper had been cited in debates over government spending, and the mistake made news around the world.'
 ],
 takeaway:'A formula is a rule for every case, not one answer. Parentheses decide what gets added before it gets multiplied, so one misplaced pair makes every total wrong.'
}
});
