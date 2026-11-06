BioLab.addPractical({
passwords:{
 hook:'A website says your password must have 8 characters including a symbol, so you pick 8 random characters from all 94 keyboard symbols. Your friend picks 16 random lowercase letters. Card A is yours, card B is your friend’s, and C and D are two more random passwords. If someone steals the site’s password data and can test 10 billion guesses a second, which of the four holds out longest?',
 answer:{bio:'Your friend’s, card B, by far. Trying every possible password like yours takes about 7 days; like your friend’s, about 138,000 years. Card C (12 letters and digits) comes second at about 10,000 years, and card D (10 upper and lowercase letters) takes about 167 days. Each extra character multiplies the work; a fancier set of characters adds only a little.',honors:'Your friend’s, by far. Yours is 8 × log₂ 94 ≈ 52 bits: every possibility can be tried in about 7 days. Your friend’s is 16 × log₂ 26 ≈ 75 bits: about 138,000 years. Each extra character multiplies the work; a fancier character set adds only a little.'},
 uses:[
  'Password strength meters and rules: sign-up pages estimate how many guesses a password would take. The US National Institute of Standards and Technology (NIST) guidelines (SP 800-63B, revision 4) tell websites to require at least 15 characters when a password is the only sign-in step, to allow passwords of at least 64 characters, and not to force mixes of character types, because forced rules push people toward predictable patterns like “Password1!”.',
  'Encryption keys: secure websites and messaging apps protect data with keys of 128 bits or more. There are 2¹²⁸ ≈ 3.4 × 10³⁸ possible 128-bit keys; at 10 billion guesses a second, trying them all would take about 10²¹ years.',
  'PINs and lockouts: a 4-digit PIN has only 10,000 possibilities and a 6-digit PIN has 1,000,000, so phones and bank cards protect them by limiting wrong tries and adding delays. That shrinks the guess rate, the bottom of the time formula, to almost nothing.'
 ],
 takeaway:'Strength in bits is length × log₂(number of symbols). Length multiplies the work, so a long random password or passphrase beats a short complicated one.'
}
});
