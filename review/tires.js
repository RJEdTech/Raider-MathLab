BioLab.addReview({
tires:{
 questions:[
  {id:'factory',kind:'test',lvl:'honors',
   q:'How tall is a 265/70R17 tire, to the nearest 0.01 in? (1 in = 25.4 mm)',
   num:{ans:31.61,tol:0.01,unit:'in'},
   steps:['Sidewall = 265 mm × 0.70 = 185.5 mm = 185.5 ÷ 25.4 = 7.30 in.','The tire has a sidewall above and below the 17 in rim.','Diameter = 17 + 2 × 7.303 = 31.61 in.'],
   lab:{set:{veh:'truck'},look:'Read <b>Factory tire height</b>.'},verify:[['dF',31.606,0.005]]},
  {id:'speed',kind:'real',lvl:'bio',
   q:'The pickup now has 285/75R17 tires (33.83 in tall) instead of 265/70R17 (31.61 in). The dash says 65 mph. How fast is it really going, to the nearest 0.1 mph?',
   num:{ans:69.6,tol:0.1,unit:'mph'},
   steps:['Each turn covers π × diameter, so the new tire covers 33.83 ÷ 31.61 = 1.070 times as much road per turn.','The truck thinks it is going 65 mph, so it really goes 65 × 1.070 ≈ 69.6 mph.','That is about 4.6 mph faster than the dash shows.'],
   lab:{set:{veh:'truck',newt:'up2',dash:65},act:'calc',look:'Read <b>True speed</b>.'},verify:[['true',69.57,0.05]]},
  {id:'odo',kind:'real',lvl:'honors',
   q:'Same pickup and tires. The owner really drives 12,000 miles in a year. About how many miles does the odometer miss?',
   choices:['About 79','About 789','About 840','About 1,200'],correct:1,
   steps:['The odometer shows true miles ÷ 1.0704 = 12,000 ÷ 1.0704 ≈ 11,211 miles.','12,000 − 11,211 ≈ 789 miles missed.','That matters for oil changes, warranties and resale, which all go by the odometer.'],
   lab:{set:{veh:'truck',newt:'up2',miles:12000},act:'calc',look:'Read <b>Miles the odometer misses per year</b>.'},verify:[['odo',789,1]]},
  {id:'bike',kind:'real',lvl:'bio',
   q:'A bike wheel with its tire is 680 mm across. What circumference should you enter into a bike computer, to the nearest mm?',
   num:{ans:2136,tol:1,unit:'mm'},
   steps:['Circumference = π × diameter.','π × 680 ≈ 2,136 mm.','The computer multiplies this by the number of wheel turns it counts to get distance.']},
  {id:'rpm',kind:'test',lvl:'ap',
   q:'About how many turns per mile does a 285/75R17 tire (33.83 in tall) make? (1 mile = 63,360 in)',
   num:{ans:596,tol:1,unit:'turns'},
   steps:['One turn covers π × 33.83 ≈ 106.3 in.','63,360 ÷ 106.3 ≈ 596 turns per mile.','The factory tire makes about 638, so the truck sees 6.6% fewer turns per mile than it expects.'],
   lab:{set:{veh:'truck',newt:'up2'},look:'Read <b>Your tire: turns per mile</b>.'},verify:[['rpm',596.1,0.2]]},
  {id:'arc',kind:'test',lvl:'ap',
   q:'A wheel sensor reads a ring with 48 teeth. The tire is 31.61 in tall. How far does the truck roll each time one tooth passes the sensor, to the nearest 0.01 in?',
   num:{ans:2.07,tol:0.01,unit:'in'},
   steps:['One tooth is 1/48 of a full turn, an arc of 7.5°.','The tire rolls 1/48 of its circumference: π × 31.61 ÷ 48.','99.30 ÷ 48 ≈ 2.07 in per tooth.']}
 ]
}
});
