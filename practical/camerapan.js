BioLab.addPractical({
camerapan:{
 hook:'You are filming a teammate’s 100 m for the team’s highlight video, with your phone on a gimbal 20 m from her lane, level with the 50 m mark. How fast will you have to turn the phone, in degrees per second, as she runs past you?',
 answer:'About 25.7° per second. She passes you at about 8.97 m/s, and from 20 m away that is 8.97 ÷ 20 ≈ 0.448 radians per second, or 25.7°/s. Two seconds into the race you turn only about 4.1°/s, and as she crosses the finish about 3.6°/s. The fast part is the few seconds when she is within about 20 m of your spot.',
 uses:[
  '<b>Do:</b> when you film a fast subject on a gimbal, expect the hardest moment to be when it passes closest. <b>Why:</b> subject tracking changes how fast the motor turns to keep the subject centered, and a subject passing close by needs the fastest turn.',
  '<b>Do:</b> watch a satellite pass on a tracking app and notice where it moves fastest across the sky. <b>Why:</b> ground antennas tracking low-orbit satellites turn slowly near the horizon and fastest at closest approach: the same speed-over-distance peak.',
  '<b>Do:</b> if you film or time a car from the side of the road, remember you are measuring only part of its speed. <b>Why:</b> a radar gun measures only the part of a car’s speed aimed toward it. From the side it reads lower than the true speed, a related-rates effect called the cosine effect.'
 ],
 takeaway:'Your camera angle depends on the runner’s position, so its rate of change is her speed times how much angle each meter is worth. Each meter is worth the most when she is closest, so that is when you pan fastest: about her speed divided by your distance.'
}
});
