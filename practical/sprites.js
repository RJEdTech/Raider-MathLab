BioLab.addPractical({
sprites:{
 hook:{bio:'You are coding a game for a class project. Your character’s antenna tip sits at (−6, 6) on the grid, and the next move slides it 7 squares right and 3 squares down. Where will the tip land? And where would it land if the move flipped it across the y-axis, the up-down line through the center, instead?',
  honors:'You are coding a game for a class project. Your character’s antenna tip sits at (−6, 6) on the grid, and the next move slides it with the rule (x + 7, y − 3). Where will the tip land? And where would it land if the move flipped it across the y-axis instead?'},
 answer:'The slide puts the tip at (1, 3): add 7 to x and subtract 3 from y. A flip across the y-axis would send it to (6, 6) instead: keep y, change the sign of x. Guess by eye and you are often a square or two off, which is 16 to 32 pixels if each square is 16 pixels: enough to draw the character inside a wall.',
 uses:[
  '<b>Do:</b> in a game or animation project, give each object a transform: position, rotation and scale. <b>Why:</b> engines apply it to every point of the object every frame; moving, flipping and turning a character are exactly these coordinate rules, usually written as matrices.',
  '<b>Do:</b> when an app looks wrong sideways, check what it does with width and height. <b>Why:</b> turning your phone rotates the screen’s coordinate system by 90° and redraws everything, so width becomes height.',
  '<b>Do:</b> in CAD, draw half of a symmetric part and mirror it. <b>Why:</b> mirror across a line applies these rules and gives the other half exactly.'
 ],
 takeaway:'Every slide, flip, turn and resize is a rule on coordinates. Apply the rule and you know exactly where every point lands; do two in a row and the order matters.'
}
});
