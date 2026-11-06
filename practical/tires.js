BioLab.addPractical({
tires:{
 hook:{bio:'Your family’s pickup just got bigger tires: 33.8 in tall instead of the 31.6 in it came with. Nobody updated the truck’s computer. You are driving it on the highway, and the speedometer says 65 mph. How fast are you really going?',
  honors:'Your family’s pickup came from the factory with 265/70R17 tires. It just got bigger 285/75R17s, and nobody updated the truck’s computer. You are driving it on the highway, and the speedometer says 65 mph. How fast are you really going?'},
 answer:'About 69.6 mph. The new tires are 33.83 in tall instead of 31.61 in, so every turn covers 7.0% more road than the truck assumes. The speedometer reads low by about 4.6 mph at highway speed, and over 12,000 real miles the odometer misses about 789.',
 uses:[
  'Bike computers: many ask you to enter your wheel’s circumference, then count wheel turns with a small magnet and sensor. Enter the wrong number and every speed and distance it shows is off by the same ratio.',
  'Robots: robots track how far they have driven by counting wheel turns with sensors called encoders. Distance = number of turns × π × wheel diameter, so a wrong diameter in the code throws off every move.',
  'Speedometer calibration: after a change to a different tire size, a dealer or tire shop can often reprogram the tire size into the vehicle’s computer so the speedometer and odometer read correctly again.'
 ],
 takeaway:'A wheel covers its circumference, πd, every turn. Change the diameter and every speed and distance the car calculates is off by the ratio of the new diameter to the old one.'
}
});
