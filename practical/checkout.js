BioLab.addPractical({
checkout:{
 hook:{bio:'You are setting up your club’s online store for spirit wear. The carrier charges by box weight and takes boxes up to 10 lb. Four club members each typed up a shipping table for the checkout, and they all look reasonable. Which one can the checkout use, so that every box gets exactly one price?',
  honors:'You are setting up your club’s online store for spirit wear. The carrier charges by box weight x and takes boxes up to 10 lb. Four club members each typed up a shipping rule f(x) for the checkout. Which one is a function on the right domain, so that every box gets exactly one price?'},
 answer:{bio:'Rule C: “up to 1 lb, over 1 up to 2 lb, …, over 5 up to 10 lb.” Every box from 0.1 to 10 lb lands in exactly one row, and heavier boxes get no price, which is right because the carrier won’t take them. Rule A’s “1 to 2 lb” and “2 to 3 lb” both claim a 2.0 lb box, so 5 of last season’s 120 orders got two prices. Rule B left out boxes over 5 lb (11 orders with no price), and Rule D priced 2 boxes over 10 lb that the carrier refuses.',
  honors:'Rule C, the “weight not over” table. It passes the vertical line test (open dot on the left of each step, closed dot on the right) and its domain is exactly 0 < x ≤ 10. Rule A is not a function: f(2) is both $7.75 and $9.25, which stalled 5 of last season’s 120 orders. Rule B’s domain stops at 5 lb (11 orders got no price), and Rule D’s never stops (2 boxes over 10 lb got a price the carrier will not honor).'},
 uses:[
  '<b>Do:</b> before you mail a package, weigh it, and if it is just over a pound line (2.1 lb), take something out or split the order. <b>Why:</b> USPS rounds any fraction of a pound up to the next pound, so a 2.1 lb box is charged as 3 lb. Shipping rates are a step function, like Rule C.',
  '<b>Do:</b> before you look up prices in a spreadsheet with XLOOKUP or VLOOKUP, check that no key appears twice (COUNTIF of the key greater than 1). <b>Why:</b> Microsoft’s documentation says an exact-match lookup returns the first match it finds, so a duplicate key quietly gives one input two possible outputs, and you get whichever comes first.',
  '<b>Do:</b> when you build a sign-up or order form for your club in Google Forms or Microsoft Forms, add number validation: a whole number from 1 to the limit. <b>Why:</b> that rule is the function’s domain. Without it, someone can order −1 or 2.5 shirts, just like the broken ticket rules.'
 ],
 takeaway:'A function gives every input exactly one output, and its domain should be exactly the inputs that can really happen. Check the boundaries: that is where two rows can both claim the same input.'
}
});
