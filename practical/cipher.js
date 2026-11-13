BioLab.addPractical({
cipher:{
 hook:{bio:'Your team codes its play calls so the other team can’t read them. The rule: turn each letter into a number (A = 0, B = 1, … Z = 25), multiply by 3, add 5, and wrap around past 25, so 26 is back to A. A teammate signals ENS KAR HRLVSO YMFZ. You know the rule. How do you read it?',honors:'Your team codes its play calls so the other team can’t read them. The rule: turn each letter into a number (A = 0, B = 1, … Z = 25), multiply by 3, add 5, and wrap around past 25 (mod 26). A teammate signals ENS KAR HRLVSO YMFZ. You know the rule. How do you read it?'},
 answer:'Run the code backward: subtract 5 first, then multiply by 9, because 3 × 9 = 27 wraps around to 1. That decoder reads RUN THE SECOND PLAY. The obvious undo, subtract 5 and then divide by 3, reads only 6 of the 16 letters. The wrap-around leaves most codes minus 5 that are not multiples of 3, so dividing gives fractions, not letters.',
 uses:[
  '<b>Do:</b> only type passwords or card numbers on sites with the lock icon. <b>Why:</b> the lock means the connection is encrypted with functions that are fast to compute but, as far as anyone knows, impossible in practice to invert without a secret key. This affine code is the opposite: anyone can find its inverse in seconds.',
  '<b>Do:</b> convert °F to °C by undoing in reverse order: subtract 32, then divide by 1.8. <b>Why:</b> F = 1.8C + 32 and its inverse are the same “undo in reverse order” pair as your decoder: 77 °F is 25 °C.',
  '<b>Do:</b> when a code or a compressed file must come back exactly, check that no two inputs give the same output. <b>Why:</b> ZIP files and PNG images use one-to-one functions; if two files compressed to the same result, unzipping could not know which to give back. It is the same reason a = 2 fails as a code.'
 ],
 takeaway:'A function and its inverse undo each other, and the inverse undoes the steps in reverse order. A function that sends two inputs to the same output has no inverse.'
}
});
