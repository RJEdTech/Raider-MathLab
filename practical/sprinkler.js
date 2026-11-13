BioLab.addPractical({
sprinkler:{
 hook:'Your summer job is lawn care. A customer’s sprinkler sits next to the house and throws 25 ft straight out, but only a little to the sides, so its wet area is heart-shaped. You want to put down half an inch of water. How many square feet does it water, and how much water is that?',
 answer:'About 736 sq ft, using a cardioid r = 12.5(1 + cos θ) as the model of the pattern. Half an inch on 736 sq ft is about 229 gallons. A full 25 ft circle would be 1,963 sq ft, so treating the pattern as a circle would plan about 380 gallons too many.',
 uses:[
  '<b>Do:</b> set each sprinkler zone’s run time from its precipitation rate. <b>Why:</b> the rate in inches per hour is 96.3 × flow in gallons per minute ÷ area watered in square feet, so designers need each head’s area.',
  '<b>Do:</b> use matched-precipitation nozzles when you mix full, half and quarter heads. <b>Why:</b> a half-circle nozzle sprays about half the water of a full one, and a quarter about a quarter, because a sector has area ½r²θ, so every part of the lawn gets the same depth.',
  '<b>Do:</b> aim a cardioid microphone at the singer and away from the speakers. <b>Why:</b> its pickup pattern is r = ½(1 + cos θ): full sensitivity in front and almost none directly behind. Sound engineers read these polar plots to aim mics.'
 ],
 takeaway:'To find the area of a polar curve, cut it into thin pie slices with area ½r²Δθ and add them up. Thinner slices close in on A = ½∫ r(θ)² dθ.'
}
});
