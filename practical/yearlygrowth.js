BioLab.addPractical({
yearlygrowth:{
 hook:'Rent on a one-bedroom went from $1,200 to $1,900 a month in 8 years. That is 58% in all. If it went up by the same percent every year, what was that percent? Most people divide 58% by 8 and say 7.3%. Is that right?',
 answer:'No: about 5.9% a year. A steady percent increase multiplies by the same factor every year, so the yearly factor is the 8th root of the total factor: ⁸√(1,900 ÷ 1,200) = 1.0591. Dividing by 8 ignores that each year’s increase lands on a higher rent; 7.3% a year would have ended near $2,100.',
 uses:[
  '<b>Do:</b> when someone says an investment “grew 100% in 10 years, so 10% a year,” take the root instead. <b>Why:</b> doubling in 10 years is ¹⁰√2 − 1 = 7.2% a year. Funds report this compound annual growth rate for the same reason.',
  '<b>Do:</b> compare a raise with how fast your costs grew. <b>Why:</b> if your pay went from $15 to $18 an hour in 4 years, that is ⁴√1.2 − 1 = 4.7% a year; if rent rose faster than that, your raise lost ground.',
  '<b>Do:</b> when you plan for college costs, project tuition with the yearly factor, not the total. <b>Why:</b> tuition that rose 4.35% a year will be about 1.0435⁴ ≈ 19% higher in four years, whatever the total looked like over the last decade.'
 ],
 takeaway:'The same percent every year means multiplying by the same factor every year. To find that factor from a start and an end, take the nth root of the total change: (B/A)^(1/n). Dividing the total by n always overshoots.'
}
});
