BioLab.addPractical({
windvectors:{
 hook:'Your drone club is testing a delivery drop in a big park. The landing pad is 600 m straight ahead, close enough to keep the drone in sight the whole way. The park is 200 m wide, with a street and houses along each side. Your drone flies at 54 km/h, and a 16.2 km/h wind blows from the left. If you point the nose straight at the pad, where does the drone end up? Which way should you point it instead?',
 answer:'Pointed straight at the pad, the drone is carried 180 m sideways: it reaches the end of the park past the street, over the yards beyond. Flying back to the pad makes the trip 57 seconds. Pointed 17.5° into the wind (sin WCA = 16.2 ÷ 54 = 0.3), it flies a straight line up the park to the pad in 42 seconds: 15 seconds and about 0.8% of a battery saved, and it never leaves the park.',
 uses:[
  'Pilots: before a cross-country flight, pilots work out a wind correction angle and a ground speed for each leg from the forecast winds, with a flight computer or an app, so they know what heading to hold and how much fuel the trip needs.',
  'Boats and ferries: to cross a river or a tidal current, a boat aims partly upstream so it lands at the dock across the water instead of being swept downstream. Navigators call the current’s push “set and drift” and correct for it the same way.',
  'Drones: a delivery drone’s autopilot uses GPS to keep adjusting its heading into the wind so it tracks a straight line, and wind changes how much battery each trip uses. Hobby flights stay short for another reason: FAA rules for recreational flyers require you to keep your drone within visual line of sight, yours or that of a visual observer standing next to you.'
 ],
 takeaway:'Your motion over the ground is your own velocity plus the wind’s. To go straight, aim into the wind by the angle whose sine is crosswind ÷ your speed.'
}
});
