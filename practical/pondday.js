BioLab.addPractical({
pondday:{
 hook:'The pond by your house froze over on the evening of Dec 4. Each evening you drill a test hole and measure the ice: 1.3 in on Dec 5, 1.84 in on Dec 6, 2.25 in on Dec 7 and 2.6 in on Dec 8. Your friends want to skate on Saturday, Dec 12. The usual minimum for walking on new, clear ice is 4 inches. Will the ice reach 4 in by Saturday, and if not, when?',
 answer:{bio:'Not by Saturday. The dots fit a square-root curve that starts on Dec 4 and is stretched by 1.3. On Dec 12 it gives about 3.7 in. The model says it reaches 4 in, the minimum guideline for walking on new, clear ice, overnight between Dec 13 and Dec 14. A model can’t tell you ice is safe: thickness varies across a pond, and snow ice or white ice is weaker. A straight line through the first two dots says Dec 10, when the ice is really only 3.2 in.',
  honors:'Not by Saturday. The dots fit y = 1.3√(x − 4): the parent √x shifted right 4 and stretched vertically by 1.3. On Dec 12, y = 1.3√8 ≈ 3.7 in. Solving 1.3√(x − 4) = 4 gives x ≈ 13.47: the model says the ice reaches 4 in, the minimum guideline for walking on new, clear ice, overnight between Dec 13 and Dec 14. A model can’t tell you ice is safe: thickness varies across a pond, and snow ice or white ice is weaker. A straight line through the first two dots says Dec 10, when the ice is really only 3.2 in.'},
 uses:[
  'Ice forecasts: engineers who forecast lake and river ice use Stefan’s equation, in which ice thickness grows with the square root of the cold so far (the total of “freezing degree-days”). It is the same slid and stretched √x as this pond.',
  'Highways: road designers shape each hilltop and dip on a highway as a parabola, called a vertical curve. They set it from the two grades it joins and its length, then use the vertex to find the high or low point, just like y = a(x − h)² + k.',
  'Cricket reviews: when an umpire’s leg-before-wicket call is challenged, ball-tracking cameras fit a curve to the ball’s path and extend it past the batter’s leg to show whether it would have hit the stumps. It is the same job as finishing the sled jump from a clip that cuts off.'
 ],
 takeaway:'Pick the parent with the right shape, slide its vertex or starting point to the special point, and stretch it through one more point. Then the equation tells you what the dots can’t.'
}
});
