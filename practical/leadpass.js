BioLab.addPractical({
leadpass:{
 hook:'You are the quarterback. When you let go of the ball, your receiver is 15 m downfield and sprinting straight away at 7 m/s. You throw at 20 m/s, about 45 mph. How steeply should you throw so the ball comes down right on him?',
 answer:'At about 17.8°. The ball is in the air 1.25 s, he runs 8.7 m in that time, and both arrive 23.7 m downfield at the same moment. Throw to where he is now (10.8°) and the ball lands 5.3 m behind him; throw at 30° and it sails 6.1 m over him.',
 uses:[
  'Airdrops: a cargo plane dropping supplies lets go of the load well before it is over the target. Crews work out the release point, called the computed air release point, from the plane’s speed and height, the time the load takes to fall and the wind: the same match-the-position-at-the-same-time problem.',
  'Video games: many game engines move each thrown object with these equations, adding velocity × frame time to its position every frame, and game AI that throws at a moving player can solve this lead problem to aim.',
  'Sports tracking: pro football puts tracking chips in players’ shoulder pads and records every player’s position many times a second. A player’s speed is the length of his velocity vector, which is how a broadcast can show a receiver’s top speed in miles per hour.'
 ],
 takeaway:'Throw to where the receiver will be. Write the ball’s position and his position as functions of the same time t, and the pass works when they match at the moment the ball comes down.'
}
});
