BioLab.addPractical({
coaster:{
 hook:{bio:'You are building a roller coaster in a theme-park building game. The level gives you four marks for one section of track: start 80 ft up on the first drop, go underground into a tunnel 30 ft along, come back out at 75 ft, and dive into a second tunnel at 150 ft. Can one smooth curve hit all four marks?',
  honors:'You are building a roller coaster in a theme-park building game. The level fixes four marks for one section of track: it passes 80 ft up on the first drop at x = 0, enters a tunnel 30 ft along, comes out at 75 ft, and dives into a second tunnel at 150 ft. What single smooth curve hits all four marks?'},
 answer:'The cubic y = a(x − 30)(x − 75)(x − 150) with a = −80/337,500 ≈ −0.000237. Its three zeros are the ground crossings, and a makes it 80 ft up at the start. Its dip is at x = 50 (about 11.9 ft underground) and its hill at x = 120 (28.8 ft up). A good eyeball track still misses by a few feet.',
 uses:[
  'Highway design: where a road goes over a hill or through a dip, engineers shape the road as a parabola called a vertical curve. They size it so a driver coming over the crest can see far enough ahead to stop.',
  'Robot arms: a robot moving a joint from one angle to another commonly follows a cubic (or higher) polynomial in time, chosen so the joint starts and stops at rest without a sudden jolt.',
  'Games and animation: graphics code blends smoothly between two values with “smoothstep”, the cubic 3u² − 2u³. It is the same curve this tool draws between your dip and your hill.'
 ],
 takeaway:'When you know where a curve crosses zero, start from factored form: one factor per zero, then one known point fixes the leading coefficient.'
}
});
