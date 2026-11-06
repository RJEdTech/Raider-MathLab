BioLab.addPractical({
fontcurves:{
 hook:'Why does your school logo stay sharp on a phone screen and on a 10-foot banner? Saved as a vector file, its outline is stored as curves of just four points each, the same kind that draws many fonts: two ends that sit on the shape and two control points that pull the curve into shape. Try one: where do the two control points go for the round bowl of this letter D?',
 answer:'At (370, 55) and (370, 405) on this grid, well outside the letter. The bowl itself only reaches x = 312.5 at its widest, because at t = 1/2 the control points pull with only 3/8 of the weight each. By eye it is hard to get the gap all the way to zero; solved, it is exact.',
 uses:[
  'Fonts: every letter on your phone and computer is an outline made of curves like this one. TrueType fonts use quadratic Bézier curves, and PostScript and CFF-based OpenType fonts use cubic ones, the kind in this tool.',
  'Vector graphics: the pen tool in vector drawing apps and the “C” command in SVG, the format behind many web icons and logos, both draw cubic Bézier curves from four points. That is why a logo stays sharp at any size.',
  'Animation timing: CSS, the language that styles websites, sets how an animation speeds up and slows down with cubic-bezier(x₁, y₁, x₂, y₂), a cubic Bézier from (0, 0) to (1, 1) whose two middle points you choose. The built-in “ease” timing is cubic-bezier(0.25, 0.1, 0.25, 1).'
 ],
 takeaway:'A cubic Bézier is a weighted average of four points, so x(t) and y(t) are cubic polynomials in t. The ends lie on the curve; the middle two points steer it.'
}
});
