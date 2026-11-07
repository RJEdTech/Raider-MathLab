BioLab.addPractical({
checkout:{
 hook:{bio:'You are setting up your club’s online store for spirit wear. The carrier charges by box weight and takes boxes up to 10 lb. Four club members each typed up a shipping table for the checkout, and they all look reasonable. Which one can the checkout use, so that every box gets exactly one price?',
  honors:'You are setting up your club’s online store for spirit wear. The carrier charges by box weight x and takes boxes up to 10 lb. Four club members each typed up a shipping rule f(x) for the checkout. Which one is a function on the right domain, so that every box gets exactly one price?'},
 answer:{bio:'Rule C: “up to 1 lb, over 1 up to 2 lb, …, over 5 up to 10 lb.” Every box from 0.1 to 10 lb lands in exactly one row, and heavier boxes get no price, which is right because the carrier won’t take them. Rule A’s “1 to 2 lb” and “2 to 3 lb” both claim a 2.0 lb box, so 5 of last season’s 120 orders got two prices. Rule B left out boxes over 5 lb (11 orders with no price), and Rule D priced 2 boxes over 10 lb that the carrier refuses.',
  honors:'Rule C, the “weight not over” table. It passes the vertical line test (open dot on the left of each step, closed dot on the right) and its domain is exactly 0 < x ≤ 10. Rule A is not a function: f(2) is both $7.75 and $9.25, which stalled 5 of last season’s 120 orders. Rule B’s domain stops at 5 lb (11 orders got no price), and Rule D’s never stops (2 boxes over 10 lb got a price the carrier will not honor).'},
 uses:[
  'Shipping: postal and parcel rate tables are written as “weight not over” 1 lb, 2 lb, 3 lb and so on, with the weight rounded up, so every package lands in exactly one row: a function with a continuous domain and a handful of prices.',
  'Spreadsheets: a lookup formula such as VLOOKUP or XLOOKUP returns one value for each key. In exact-match mode (XLOOKUP’s default), if a key appears in two rows it quietly returns the first match, so a price list with a duplicate key can charge the wrong price without any error.',
  'Forms: online order forms limit a “quantity” box to whole numbers in a range, such as 1 to 8, with input validation. That limit is the function’s domain, written into the form so nobody can order −1 or 2.5 of something.'
 ],
 takeaway:'A function gives every input exactly one output, and its domain should be exactly the inputs that can really happen. Check the boundaries: that is where two rows can both claim the same input.'
}
});
