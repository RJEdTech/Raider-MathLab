BioLab.addPractical({
runpace:{
 hook:'You are running a community 5K with a running app on your phone. Nine minutes in, you are partway up the course’s one hill. The app only records where you are, once a second. How fast were you going right at 9:00?',
 answer:'About 2.72 m/s, a pace of 9:52 per mile. Averages over shorter and shorter intervals starting at 9:00 settle on it: 3.33 m/s over 4 minutes, 2.88 m/s over 1 minute, 2.73 m/s over 10 seconds and 2.72 m/s over 1 second. Your average for the whole race was 3.41 m/s (7:52 per mile), so the hill cost you a lot right then.',
 uses:[
  'Running watches and apps get “current pace” from GPS, either from how your position changes over the last few seconds or from the Doppler shift of the satellite signals, and they smooth it because each reading has some error.',
  'Average speed cameras on UK roads time each car between two cameras that can be kilometers apart and divide the distance by the time: an average over an interval. A police radar gun instead reads your speed at one moment from the Doppler shift.',
  'Map apps estimate how fast traffic is moving on each road from how quickly the positions of phones in cars are changing, and they use those speeds to predict your arrival time.'
 ],
 takeaway:'Speed right now is what averages over shorter and shorter intervals settle on. On a position graph, it is the steepness of the curve at that instant: the slope of the tangent line.'
}
});
