BioLab.addPractical({
cipher:{
 hook:{bio:'Your team codes its play calls so the other team can’t read them. The rule: turn each letter into a number (A = 0, B = 1, … Z = 25), multiply by 3, add 5, and wrap around past 25, so 26 is back to A. A teammate signals ENS KAR HRLVSO YMFZ. You know the rule. How do you read it?',honors:'Your team codes its play calls so the other team can’t read them. The rule: turn each letter into a number (A = 0, B = 1, … Z = 25), multiply by 3, add 5, and wrap around past 25 (mod 26). A teammate signals ENS KAR HRLVSO YMFZ. You know the rule. How do you read it?'},
 answer:'Run the code backward: subtract 5 first, then multiply by 9, because 3 × 9 = 27 wraps around to 1. That decoder reads RUN THE SECOND PLAY. The obvious undo, subtract 5 and then divide by 3, reads only 6 of the 16 letters. The wrap-around leaves most codes minus 5 that are not multiples of 3, so dividing gives fractions, not letters.',
 uses:[
  'Secure websites: the lock icon in your browser means the connection is encrypted. That encryption depends on functions that are fast to compute but, as far as anyone knows, impossible in practice to invert without a secret key. This affine code is the opposite: anyone can find its inverse in seconds, which is why it is only a classroom code.',
  'Temperature: F = 1.8C + 32 and its inverse C = (F − 32) ÷ 1.8 are the same “undo in reverse order” pair as your decoder. To turn 77 °F into Celsius, subtract 32 first, then divide by 1.8: 25 °C.',
  'File compression: ZIP files and PNG images shrink data with a function that must be one-to-one. If two different files compressed to the same result, unzipping could not know which one to give back. It is the same reason a = 2 fails as a code.'
 ],
 takeaway:'A function and its inverse undo each other, and the inverse undoes the steps in reverse order. A function that sends two inputs to the same output has no inverse.'
}
});
