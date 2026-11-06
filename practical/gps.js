BioLab.addPractical({
gps:{
 hook:'You open a map app to meet up with friends, so your phone has to put you on the map. It hears timing signals from three towers at known spots, and each signal says when it was sent. Tower A’s took 11.8 microseconds to arrive, B’s took 17.4 and C’s took 15.0. Radio covers about 300 m every microsecond. Where are you?',
 answer:'Each time × the speed of light gives a distance: 3.54 km from A, 5.22 km from B and 4.50 km from C. Each distance is a circle around its tower, and all three circles meet at one point, (3.60, 3.40) km on the map. Solving the circle equations finds it to the meter; even a careful guess by eye is usually tens of meters off.',
 uses:[
  'GPS: every satellite broadcasts its position and the exact time. Your phone turns each signal’s travel time into a distance and solves for where those spheres meet. It needs at least four satellites, because it must also solve for its own clock error: one microsecond of clock error is about 300 m of distance.',
  'Earthquakes: seismologists find an epicenter the same way. The gap between when the faster P waves and the slower S waves arrive at a station tells its distance from the quake, and circles around three stations meet at the epicenter.',
  'Airplanes: distance measuring equipment (DME) on board times a radio pulse’s round trip to a ground station to get the distance to it. Navigation systems combine distances to two or more stations to fix the plane’s position.'
 ],
 takeaway:'A distance from a known point puts you on a circle. Three circles meet at one point, and subtracting their equations turns the problem into two lines you can solve.'
}
});
