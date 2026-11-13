BioLab.addPractical({
runpace:{
 hook:'You are running a community 5K with a running app on your phone. Nine minutes in, you are partway up the course’s one hill. The app only records where you are, once a second. How fast were you going right at 9:00?',
 answer:'About 2.72 m/s, a pace of 9:52 per mile. Averages over shorter and shorter intervals starting at 9:00 settle on it: 3.33 m/s over 4 minutes, 2.88 m/s over 1 minute, 2.73 m/s over 10 seconds and 2.72 m/s over 1 second. Your average for the whole race was 3.41 m/s (7:52 per mile), so the hill cost you a lot right then.',
 uses:[
  '<b>Do:</b> trust your running watch’s average pace over “current pace.” <b>Why:</b> current pace comes from GPS position changes over the last few seconds or the Doppler shift of satellite signals, smoothed because each reading has some error.',
  '<b>Do:</b> know whether a speed check reads one moment or an interval. <b>Why:</b> UK average speed cameras time each car between two cameras that can be kilometers apart and divide distance by time; a radar gun reads one moment from the Doppler shift.',
  '<b>Do:</b> leave earlier when the map app shows red roads on your route. <b>Why:</b> map apps estimate traffic speed from how quickly phones in cars are moving, and use those speeds to predict your arrival time.'
 ],
 takeaway:'Speed right now is what averages over shorter and shorter intervals settle on. On a position graph, it is the steepness of the curve at that instant: the slope of the tangent line.'
}
});
