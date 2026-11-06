BioLab.addPractical({
sprites:{
 hook:{bio:'You are coding a game for a class project. Your character’s antenna tip sits at (−6, 6) on the grid, and the next move slides it 7 squares right and 3 squares down. Where will the tip land? And where would it land if the move flipped it across the y-axis, the up-down line through the center, instead?',
  honors:'You are coding a game for a class project. Your character’s antenna tip sits at (−6, 6) on the grid, and the next move slides it with the rule (x + 7, y − 3). Where will the tip land? And where would it land if the move flipped it across the y-axis instead?'},
 answer:'The slide puts the tip at (1, 3): add 7 to x and subtract 3 from y. A flip across the y-axis would send it to (6, 6) instead: keep y, change the sign of x. Guess by eye and you are often a square or two off, which is 16 to 32 pixels if each square is 16 pixels: enough to draw the character inside a wall.',
 uses:[
  'Video games and animation: an engine stores each object’s position, rotation and scale as a transform and applies it to every point of the object, every frame. Moving, flipping and turning a character are exactly these coordinate rules, usually written as matrices.',
  'Phone screens: when you turn your phone sideways, the system rotates the screen’s coordinate system by 90° and redraws everything, so what was the width becomes the height.',
  'Computer-aided design (CAD): engineers use move, rotate and mirror commands that apply these rules. For a symmetric part, a designer can draw one half and mirror it across a line to get the other half exactly.'
 ],
 takeaway:'Every slide, flip, turn and resize is a rule on coordinates. Apply the rule and you know exactly where every point lands; do two in a row and the order matters.'
}
});
