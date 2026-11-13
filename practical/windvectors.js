BioLab.addPractical({
windvectors:{
 hook:'Your drone club is testing a delivery drop in a big park. The landing pad is 600 m straight ahead, close enough to keep the drone in sight the whole way. The park is 200 m wide, with a street and houses along each side. Your drone flies at 54 km/h, and a 16.2 km/h wind blows from the left. If you point the nose straight at the pad, where does the drone end up? Which way should you point it instead?',
 answer:'Pointed straight at the pad, the drone is carried 180 m sideways: it reaches the end of the park past the street, over the yards beyond. Flying back to the pad makes the trip 57 seconds. Pointed 17.5° into the wind (sin WCA = 16.2 ÷ 54 = 0.3), it flies a straight line up the park to the pad in 42 seconds: 15 seconds and about 0.8% of a battery saved, and it never leaves the park.',
 uses:[
  '<b>Do:</b> if you fly a drone, keep it within your own line of sight and check the wind first. <b>Why:</b> FAA rules for recreational flyers require visual line of sight, yours or a visual observer’s next to you, and wind changes how much battery a trip uses. Delivery drones keep adjusting their heading into the wind to track a straight line.',
  '<b>Do:</b> when you paddle across a river, aim partly upstream. <b>Why:</b> boats and ferries correct for the current’s push, which navigators call “set and drift,” so they land at the dock instead of downstream.',
  '<b>Do:</b> if you take flying lessons, work out the wind correction angle and ground speed for every leg. <b>Why:</b> pilots do this before every cross-country flight, so they know what heading to hold and how much fuel the trip needs.'
 ],
 takeaway:'Your motion over the ground is your own velocity plus the wind’s. To go straight, aim into the wind by the angle whose sine is crosswind ÷ your speed.'
}
});
