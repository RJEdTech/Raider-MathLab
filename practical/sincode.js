BioLab.addPractical({
sincode:{
 hook:'In your coding class you are making a game with a swinging pendulum, on a device with no math library: just +, −, × and ÷. The pendulum swings 60° each way, and its 200-pixel arm puts the bob at 200 × sin(angle) pixels from the pivot. The polynomial x − x³/6 + x⁵/120 − … copies sin (x in radians). How many terms do you need so the bob is never more than half a pixel off?',
 answer:'3 terms: x − x³/6 + x⁵/120 is off by at most 0.05 px anywhere in the swing. 2 terms are off by up to 2.0 px at the ends of the swing, and 1 term (just x) by 36 px. If the code had to handle any angle up to 360°, it would need 10 terms, unless you fold the angle into −90° to 90° first; then 4 terms cover every angle.',
 uses:[
  '<b>Do:</b> in physics, use sin θ ≈ θ only for small angles, about 14° or less. <b>Why:</b> it is the first term of this series and is off by under 1% up to about 14°. The pendulum period formula T = 2π√(L/g) is derived from it.',
  '<b>Do:</b> if you write code that needs sin, call the math library instead of writing your own series. <b>Why:</b> the widely used fdlibm library, which Java’s StrictMath is defined to match, first reduces the angle to between −π/4 and π/4, then evaluates a degree-13 polynomial with coefficients tuned to be slightly better than Taylor’s.',
  '<b>Do:</b> in radian mode, compare your calculator’s sin of a small angle with the angle itself. <b>Why:</b> calculators and small chips compute sin and cos with polynomial approximations or CORDIC, a method built from additions, subtractions and bit shifts.'
 ],
 takeaway:'A few terms of the Maclaurin series match sin almost perfectly near 0. Keep the angle small, by folding it first, and the error bound tells you exactly how few terms you can get away with.'
}
});
