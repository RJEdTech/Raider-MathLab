BioLab.addPractical({
lnbase:{
 hook:'Your calculator has two log buttons, “log” and “ln,” and Excel has EXP and LN. All of them are built around e ≈ 2.718, a number nobody would pick by hand. Slide the base: which one makes the curve climb exactly as fast as its height at (0, 1)?',
 answer:'e ≈ 2.718. Base 2 climbs 0.693 there (too flat) and base 3 climbs 1.099 (too steep). Every base b climbs ln b times its height, so its log climbs 1 ÷ ln b at x = 1, and 1/(x ln b) at x.',
 uses:[
  '<b>Do:</b> when you fit your lab data in Excel with an exponential trendline, read the number in the exponent as the growth rate, and find the doubling (or half-life) time as ln 2 ÷ that number. <b>Why:</b> Excel writes the exponential trendline as y = ae^(bx), in base e, because then b is the rate of change per unit compared with the amount. Practice it in <a href="excel.html">Excel basics</a>.',
  '<b>Do:</b> estimate how long savings or a loan balance takes to double with 70 ÷ the yearly percent. <b>Why:</b> doubling time is ln 2 ÷ ln(1 + r), ln 2 ≈ 0.693, and for small rates ln(1 + r) ≈ r. That is the “rule of 70” (many people use 72). See <a href="#yearlygrowth">What yearly rate did that?</a> and <a href="#startearly">Start at 22 or 32?</a>',
  '<b>Do:</b> turn a half-life into a rate with k = ln 2 ÷ half-life. <b>Why:</b> chemistry, medicine and physics write decay as A₀e^(−kt). Caffeine with a 5-hour half-life has k ≈ 0.139 per hour; see <a href="#caffeine">Caffeine at bedtime</a>.'
 ],
 takeaway:'Every exponential climbs at ln b times its height, because the height factors out of every step. Mirror it and the slope flips: log_b x climbs 1/(x ln b). The base where the factor is exactly 1 is e.'
}
});
