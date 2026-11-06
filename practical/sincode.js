BioLab.addPractical({
sincode:{
 hook:'In your coding class you are making a game with a swinging pendulum, on a device with no math library: just +, −, × and ÷. The pendulum swings 60° each way, and its 200-pixel arm puts the bob at 200 × sin(angle) pixels from the pivot. The polynomial x − x³/6 + x⁵/120 − … copies sin (x in radians). How many terms do you need so the bob is never more than half a pixel off?',
 answer:'3 terms: x − x³/6 + x⁵/120 is off by at most 0.05 px anywhere in the swing. 2 terms are off by up to 2.0 px at the ends of the swing, and 1 term (just x) by 36 px. If the code had to handle any angle up to 360°, it would need 10 terms, unless you fold the angle into −90° to 90° first; then 4 terms cover every angle.',
 uses:[
  'Computer math libraries: the widely used fdlibm library, which Java’s StrictMath is defined to match, computes sin by first reducing the angle to between −π/4 and π/4, then evaluating a polynomial of degree 13 whose coefficients are tuned to be slightly better than the Taylor ones.',
  'Calculators: polynomial approximations and CORDIC, a method built from additions, subtractions and bit shifts, are both common ways for calculators and small chips to compute sin and cos.',
  'Physics class: the small-angle approximation sin θ ≈ θ is just the first term of this series. It is off by under 1% for angles up to about 14°, and it is how the pendulum period formula T = 2π√(L/g) is derived.'
 ],
 takeaway:'A few terms of the Maclaurin series match sin almost perfectly near 0. Keep the angle small, by folding it first, and the error bound tells you exactly how few terms you can get away with.'
}
});
