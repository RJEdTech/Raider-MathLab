BioLab.addPractical({
sprinkler:{
 hook:'Your summer job is lawn care. A customer’s sprinkler sits next to the house and throws 25 ft straight out, but only a little to the sides, so its wet area is heart-shaped. You want to put down half an inch of water. How many square feet does it water, and how much water is that?',
 answer:'About 736 sq ft, using a cardioid r = 12.5(1 + cos θ) as the model of the pattern. Half an inch on 736 sq ft is about 229 gallons. A full 25 ft circle would be 1,963 sq ft, so treating the pattern as a circle would plan about 380 gallons too many.',
 uses:[
  'Irrigation design: the precipitation rate of a sprinkler zone, in inches per hour, is 96.3 × the flow in gallons per minute ÷ the area watered in square feet. Designers need each head’s area to set how long a zone runs.',
  'Matched-precipitation nozzles: a half-circle sprinkler nozzle is made to spray about half the water of a full-circle one, and a quarter-circle one about a quarter, because a sector with angle θ has area ½r²θ. That way every part of the lawn gets the same depth.',
  'Microphones: the most common directional microphone has a cardioid pickup pattern, r = ½(1 + cos θ): full sensitivity in front and almost none directly behind. Sound engineers read these polar plots to aim mics at a singer and away from the speakers.'
 ],
 takeaway:'To find the area of a polar curve, cut it into thin pie slices with area ½r²Δθ and add them up. Thinner slices close in on A = ½∫ r(θ)² dθ.'
}
});
