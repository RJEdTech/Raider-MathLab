BioLab.addPractical({
tiling:{
 hook:'You are helping tile a 20 m² back patio, and every tile covers the same 100 cm². The store sells triangles, squares and hexagons. All three fit with no gaps. Which one needs the least grout, the cement that fills the lines between tiles?',
 answer:'Hexagons. All three shapes tile, but for the same area per tile hexagons need about 372 m of grout lines, against 400 m for squares and 456 m for triangles: about 7% less than squares and 18% less than triangles. Regular pentagons and regular octagons cannot tile on their own.',
 uses:[
  'Floor tiles and pavers: at every point where tiles meet, their corner angles must add up to exactly 360°. That is why square and hexagon tiles lay flat on their own, and why the classic octagon floor needs small square tiles in the gaps (135° + 135° + 90° = 360°).',
  'Screens: the pixels on a phone, laptop or TV sit in a grid of rows and columns, and digital photos are stored the same way. A square grid tiles with no gaps and makes every pixel easy to find by its row and column.',
  'Cell phone networks: engineers who plan where towers go often model coverage as a grid of hexagonal cells. Hexagons tile with no gaps, and of the shapes that tile, they come closest to the round area one tower covers.'
 ],
 takeaway:'A regular polygon tiles alone only when its interior angle divides 360°, which leaves triangles, squares and hexagons. Of those, the hexagon wraps the same area with the least edge.'
}
});
