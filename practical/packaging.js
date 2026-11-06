BioLab.addPractical({
packaging:{
 hook:'Pick up any 12 fl oz drink can (21.66 in³). Someone chose its shape, and every can like it is made by the billion. Tall and skinny, short and wide, or somewhere in between: which shape uses the least aluminum, and is the difference worth caring about?',
 answer:'The least-metal closed can is as tall as it is wide: about 3.02 in by 3.02 in, using 43.0 in² of metal. A can 3 times as tall as it is wide needs 48.2 in², about 12% more. At an assumed $0.80 per 1,000 in², that gap is about $4,200 for every million cans.',
 uses:[
  'Shipping: major carriers price large, light boxes by dimensional weight, length × width × height ÷ a divisor (139 is a common one, for inches and pounds). A box with wasted space costs more to ship even if what is inside is light.',
  '3D printing: slicer software estimates how much plastic a print will use and how long it will take. The solid outer walls follow the model’s surface area, and the inside is filled at a percentage you choose, so surface area and volume both drive the cost.',
  'Storage tanks: the steel in a tank’s wall, roof and floor adds up to its surface area, so designers compare heights and diameters for the capacity they need. They also weigh other limits, like the water pressure on the wall, which grows with depth.'
 ],
 takeaway:'With the volume fixed, surface area still changes with shape. For a closed can, the least material comes when the height equals the diameter; for a box, a cube.'
}
});
