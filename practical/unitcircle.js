BioLab.addPractical({
unitcircle:{
 hook:'You’re coding your robotics team’s arm. It is 50 cm from the shoulder pivot to the gripper. The game piece sits 25.0 cm behind the shoulder and 43.3 cm above it, so the arm has to reach up and over the back. What angle, measured counterclockwise from straight ahead, should your code send to the arm motor?',
 answer:'120°, or 2π/3 ≈ 2.09 radians. On the unit circle the piece is at (−25.0 ÷ 50, 43.3 ÷ 50) = (−0.5, 0.866). Those are cos 60° and sin 60° with the cosine flipped negative, so the reference angle is 60° and the piece is in quadrant II (behind and above): θ = 180° − 60° = 120°. Sending 60° instead would swing the arm forward and miss the piece by 50 cm.',
 uses:[
  '<b>Do:</b> on a robotics team, turn joint angles into gripper positions with x = L cos θ and y = L sin θ before you trust a reach. <b>Why:</b> FIRST teams often program with WPILib, whose Rotation2d class stores an angle and gives its cosine and sine, and whose arm feedforward multiplies by the cosine of the arm angle to hold the arm up against gravity.',
  '<b>Do:</b> when you code a game or animation, check whether sin and cos want degrees or radians. <b>Why:</b> Python’s math.cos and JavaScript’s Math.cos take radians, so cos(90) gives −0.448, not 0. Scratch’s sin and cos blocks take degrees.',
  '<b>Do:</b> use atan2(y, x), not plain arctangent, to turn a position back into an angle. <b>Why:</b> tan⁻¹(y ÷ x) gives −60° for both (−25, 43.3) and (25, −43.3), points on opposite sides of the circle. atan2 uses the signs of x and y to pick the right quadrant.'
 ],
 takeaway:'Anything that turns around a pivot keeps its tip on a circle. Divide by the radius and you are on the unit circle, where the point at angle θ is (cos θ, sin θ): the size comes from the reference angle, the signs from the quadrant.'
}
});
