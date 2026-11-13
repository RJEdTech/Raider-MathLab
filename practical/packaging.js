BioLab.addPractical({
packaging:{
 hook:'Pick up any 12 fl oz drink can (21.66 in³). Someone chose its shape, and every can like it is made by the billion. Tall and skinny, short and wide, or somewhere in between: which shape uses the least aluminum, and is the difference worth caring about?',
 answer:'The least-metal closed can is as tall as it is wide: about 3.02 in by 3.02 in, using 43.0 in² of metal. A can 3 times as tall as it is wide needs 48.2 in², about 12% more. At an assumed $0.80 per 1,000 in², that gap is about $4,200 for every million cans.',
 uses:[
  '<b>Do:</b> pack shipments in a box close to the item’s size. <b>Why:</b> carriers price large, light boxes by dimensional weight, length × width × height ÷ a divisor (139 is common, for inches and pounds), so wasted space costs money.',
  '<b>Do:</b> before a 3D print, check the slicer’s estimate and adjust the infill. <b>Why:</b> the solid walls follow the model’s surface area and the inside is filled at the percentage you choose, so surface area and volume both drive the plastic and time.',
  '<b>Do:</b> when you design a container, compare heights and diameters for the capacity you need, then check other limits. <b>Why:</b> the steel in a tank adds up to its surface area, and designers also weigh limits like water pressure on the wall, which grows with depth.'
 ],
 takeaway:'With the volume fixed, surface area still changes with shape. For a closed can, the least material comes when the height equals the diameter; for a box, a cube.'
}
});
