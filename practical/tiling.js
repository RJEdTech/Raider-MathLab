BioLab.addPractical({
tiling:{
 hook:'You are helping tile a 20 m² back patio, and every tile covers the same 100 cm². The store sells triangles, squares and hexagons. All three fit with no gaps. Which one needs the least grout, the cement that fills the lines between tiles?',
 answer:'Hexagons. All three shapes tile, but for the same area per tile hexagons need about 372 m of grout lines, against 400 m for squares and 456 m for triangles: about 7% less than squares and 18% less than triangles. Regular pentagons and regular octagons cannot tile on their own.',
 uses:[
  '<b>Do:</b> when you plan a tile or paver pattern, check that the angles at every corner add to 360°. <b>Why:</b> that is why squares and hexagons lay flat on their own, and why the octagon floor needs small squares in the gaps (135° + 135° + 90° = 360°).',
  '<b>Do:</b> zoom far into a photo until you see the square pixel grid. <b>Why:</b> screens and digital photos are stored as rows and columns because a square grid tiles with no gaps and makes every pixel easy to find.',
  '<b>Do:</b> when you see a coverage map, picture hexagons. <b>Why:</b> engineers often model cell coverage as hexagonal cells: hexagons tile with no gaps and come closest to the round area one tower covers.'
 ],
 takeaway:'A regular polygon tiles alone only when its interior angle divides 360°, which leaves triangles, squares and hexagons. Of those, the hexagon wraps the same area with the least edge.'
}
});
