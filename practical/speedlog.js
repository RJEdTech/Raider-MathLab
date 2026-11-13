BioLab.addPractical({
speedlog:{
 hook:'Your family drove you and two teammates to an away tournament, and the team’s travel form pays drivers by the mile. Nobody wrote down the odometer, but the car saved its speed every 2 minutes for the whole 40-minute drive. How many miles do you put on the form?',
 answer:'About 36.5 miles. The area under the speed curve is 36.49 mi. Adding just the 2-minute readings as trapezoids gives 36.21 mi, already within 0.3 mi.',
 uses:[
  '<b>Do:</b> estimate a trip’s distance from your speed every few minutes, then check it with the odometer. <b>Why:</b> inertial navigation in airliners and submarines adds measured acceleration over tiny time slices to track speed, then adds speed to track position: the same kind of sum, done twice.',
  '<b>Do:</b> if a doctor talks about a drug’s “AUC,” picture the trapezoids. <b>Why:</b> researchers measure total exposure to a medicine as the area under the blood-concentration curve, usually with the trapezoid rule on samples taken hours apart.',
  '<b>Do:</b> read your family’s energy use in kilowatt-hours on the utility app. <b>Why:</b> meters and solar inverters report energy by adding power readings over time: the area under the power curve.'
 ],
 takeaway:'On a speed graph, area is distance. Slice the time thin, add speed × time for each slice, and the total closes in on the integral.'
}
});
