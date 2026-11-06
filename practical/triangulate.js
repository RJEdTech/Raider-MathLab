BioLab.addPractical({
triangulate:{
 hook:'Your family has a cabin in the Colorado mountains, in wildfire country. One summer afternoon the forest service posts a fire update: two lookout towers 12 km apart on a ridge road spotted the same smoke. Tower A sees it 48° from the line toward tower B, and tower B sees it 63° from the line toward tower A. Your cabin is 10 km east and 11 km north of tower A. Where is the fire, and is it within 5 km of the cabin?',
 answer:'The fire is 11.45 km from tower A along its sight line: about 7.66 km east and 8.51 km north of tower A. The angle at the fire is 180° − 48° − 63° = 69°, and the law of sines gives 12 · sin 63° ÷ sin 69° ≈ 11.45 km. That puts the fire about 3.4 km from the cabin, within 5 km. In a real fire, follow official alerts.',
 uses:[
  'Fire lookouts: lookouts in U.S. national forests still read the direction to smoke with a sighting instrument called an Osborne Fire Finder. When two lookouts report the same smoke, dispatchers cross the two lines on a map to place the fire.',
  'Radio direction finding: search-and-rescue teams and radio regulators track down a distress beacon or a jamming transmitter by measuring its direction from two or more places and crossing the lines, just as the towers do.',
  'Star distances: as Earth circles the Sun, a nearby star seems to shift a tiny bit against much farther stars. That shift and the size of Earth’s orbit make a long, thin triangle that gives the star’s distance. The European Space Agency’s Gaia spacecraft measured this shift for more than a billion stars.'
 ],
 takeaway:'Two directions from two known points pin down one location. The angle sum gives the third angle, and the law of sines turns angles into distances.'
}
});
