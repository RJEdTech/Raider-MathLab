/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
unitcircle:[
 {k:'deg',s:'An angle of 1 radian is about 57 degrees.',fact:true,why:'A full turn is 2π radians = 360°, so 1 radian = 180°/π ≈ 57.3°.'},
 {k:'big',s:'Sine and cosine can be bigger than 1 for large angles.',fact:false,why:'On the unit circle they are the x and y of a point on a circle of radius 1, so they always stay between −1 and 1.'},
 {k:'cos',s:'cos 60° and sin 30° are the same number.',fact:true,why:'Both are 0.5. Cosine of an angle equals sine of its complement, because the two acute angles in a right triangle add to 90°.'}
]
});
