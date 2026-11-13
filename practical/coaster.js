BioLab.addPractical({
coaster:{
 hook:{bio:'You are building a roller coaster in a theme-park building game. The level fixes the marks for one section of track: start 90 ft up, partway down the first drop; dive into a tunnel 20 ft along; come out at 60 ft; then swoop down and skim the pond at 140 ft, touching the water without going in. Can one smooth curve do all of that?',
  honors:'You are building a roller coaster in a theme-park building game. The level fixes the marks for one section of track: it starts at (0, 90), partway down the first drop, enters a tunnel at x = 20, comes out at x = 60, and must skim the pond at x = 140: touch the water and rise again without going in. What single smooth curve does it?'},
 answer:'The quartic y = a(x − 20)(x − 60)(x − 140)² with a = 90/23,520,000 ≈ 3.83 × 10⁻⁶. The tunnel mouths are crossings, so each gets a single factor; the pond is a touch, so its factor is squared. Its dip is at x ≈ 36.3 (15.9 ft underground) and its hill at x ≈ 93.7 (20.4 ft up). A good eyeball track still misses by a few feet.',
 uses:[
  '<b>Do:</b> slow down before the crest of a hill when you drive. <b>Why:</b> engineers shape the road over a hill as a parabola called a vertical curve, sized so a driver can see far enough ahead to stop at the road’s design speed.',
  '<b>Do:</b> if you program a robot arm in robotics club, plan its motion with a polynomial that starts and stops at rest. <b>Why:</b> industrial arms commonly follow a cubic (or higher) polynomial in time for exactly that reason.',
  '<b>Do:</b> in a game or animation project, try “smoothstep” for motion that starts and ends gently. <b>Why:</b> it is the cubic 3u² − 2u³ = u²(3 − 2u). Its double zero at u = 0 is a bounce: the motion starts level, with zero speed.'
 ],
 takeaway:'Start from the zeros. A crossing gets a factor (x − r); a touch gets (x − r)². One known point then fixes the leading coefficient, and the degree and its sign tell you where the ends go.'
}
});
