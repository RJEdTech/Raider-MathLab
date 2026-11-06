BioLab.addPractical({
camerapan:{
 hook:'You are filming a teammate’s 100 m for the team’s highlight video, with your phone on a gimbal 20 m from her lane, level with the 50 m mark. How fast will you have to turn the phone, in degrees per second, as she runs past you?',
 answer:'About 25.7° per second. She passes you at about 8.97 m/s, and from 20 m away that is 8.97 ÷ 20 ≈ 0.448 radians per second, or 25.7°/s. Two seconds into the race you turn only about 4.1°/s, and as she crosses the finish about 3.6°/s. The fast part is the few seconds when she is within about 20 m of your spot.',
 uses:[
  'Phone gimbals with subject tracking find the subject in the frame many times a second and change how fast the motor turns to keep it centered. A subject passing close by needs the fastest turn.',
  'Ground antennas that track satellites in low orbit turn slowly while the satellite is near the horizon and fastest at its closest approach: the same speed-over-distance peak.',
  'A police radar gun measures only the part of a car’s speed aimed toward it, the rate the distance between them shrinks. Aimed from the side of the road it reads lower than the car’s true speed, a related-rates effect called the cosine effect.'
 ],
 takeaway:'Your camera angle depends on the runner’s position, so its rate of change is her speed times how much angle each meter is worth. Each meter is worth the most when she is closest, so that is when you pan fastest: about her speed divided by your distance.'
}
});
