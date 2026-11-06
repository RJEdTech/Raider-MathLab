BioLab.addPractical({
speedlog:{
 hook:'Your family drove you and two teammates to an away tournament, and the team’s travel form pays drivers by the mile. Nobody wrote down the odometer, but the car saved its speed every 2 minutes for the whole 40-minute drive. How many miles do you put on the form?',
 answer:'About 36.5 miles. The area under the speed curve is 36.49 mi. Adding just the 2-minute readings as trapezoids gives 36.21 mi, already within 0.3 mi.',
 uses:[
  'Inertial navigation in airliners and submarines adds up measured acceleration over tiny time slices to track speed, then adds up speed to track position: the same kind of sum, done twice.',
  'Drug researchers and pharmacists measure a patient’s total exposure to a medicine as the area under the blood-concentration curve (AUC), usually with the trapezoid rule applied to blood samples taken hours apart.',
  'Utility meters and solar inverters report energy in kilowatt-hours by adding power readings over time. Energy is the area under the power curve.'
 ],
 takeaway:'On a speed graph, area is distance. Slice the time thin, add speed × time for each slice, and the total closes in on the integral.'
}
});
