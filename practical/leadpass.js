BioLab.addPractical({
leadpass:{
 hook:'You are the quarterback. When you let go of the ball, your receiver is 15 m downfield and sprinting straight away at 7 m/s. You throw at 20 m/s, about 45 mph. How steeply should you throw so the ball comes down right on him?',
 answer:'At about 17.8°. The ball is in the air 1.25 s, he runs 8.7 m in that time, and both arrive 23.7 m downfield at the same moment. Throw to where he is now (10.8°) and the ball lands 5.3 m behind him; throw at 30° and it sails 6.1 m over him.',
 uses:[
  '<b>Do:</b> when you throw to a moving teammate, aim where they will be, not where they are. <b>Why:</b> cargo crews drop supplies well before the plane is over the target, working out the computed air release point from speed, height, fall time and wind: the same match-the-position-at-the-same-time problem.',
  '<b>Do:</b> if you code a game, move each thrown object by adding velocity × frame time to its position every frame. <b>Why:</b> many game engines do exactly that, and game AI that throws at a moving player can solve this lead problem to aim.',
  '<b>Do:</b> when a broadcast shows a player’s top speed, picture the length of a velocity vector. <b>Why:</b> pro football puts tracking chips in players’ shoulder pads and records every position many times a second; speed is the length of the velocity vector.'
 ],
 takeaway:'Throw to where the receiver will be. Write the ball’s position and his position as functions of the same time t, and the pass works when they match at the moment the ball comes down.'
}
});
