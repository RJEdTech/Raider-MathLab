/* Myth or fact (idea from Dr. Sandy Robertson's ENSO Explorer, Nov 17, 2026). See ENGINE.md.
   BioLab.addMyths({toolId:[{k,s,fact,why,lvl}]}): one graded try, then why. Mix in real facts. */
BioLab.addMyths({
unitcircle:[
 {k:'deg',s:'An angle of 1 radian is about 57 degrees.',fact:true,why:'A full turn is 2π radians = 360°, so 1 radian = 180°/π ≈ 57.3°.'},
 {k:'big',s:'Sine and cosine can be bigger than 1 for large angles.',fact:false,why:'On the unit circle they are the x and y of a point on a circle of radius 1, so they always stay between −1 and 1.'},
 {k:'cos',s:'cos 60° and sin 30° are the same number.',fact:true,why:'Both are 0.5. Cosine of an angle equals sine of its complement, because the two acute angles in a right triangle add to 90°.'}
]
});

/* Batch 2 (Nov 17, 2026): the rest of MathLab. Money tools share FinanceLab’s statements. */
BioLab.addMyths({
aidoptimizer:[
 {k:'equal',s:'Splitting a budget equally among programs always does the most good.',fact:false,why:'If programs differ in cost per result, shifting money to the cheaper ones does more with the same budget.'},
 {k:'cost',s:'Cost per result is the total cost divided by the number of results.',fact:true,why:'$10,000 for 500 nets is $20 per net.'},
 {k:'limit',s:'Real budget decisions also face limits like how much one program can absorb.',fact:true,why:'Those limits are constraints, the lines that box in the best choice.'}
],
areamodel:[
 {k:'double',s:'Doubling the length and width of a rectangle doubles its area.',fact:false,why:'Area multiplies both, so it becomes 4 times as large.'},
 {k:'expand',s:'(x + 3)² equals x² + 9.',fact:false,why:'The area model shows the two middle pieces: x² + 6x + 9.'},
 {k:'add',s:'An area model splits a product into rectangles you can add up.',fact:true,why:'23 × 14 = (20 + 3)(10 + 4) = 200 + 80 + 30 + 12 = 322.'}
],
babysit:[
 {k:'linear',s:'If you charge a flat fee plus an hourly rate, your pay over time makes a straight line.',fact:true,why:'Pay = fee + rate × hours, a linear function with the fee as the y-intercept.'},
 {k:'slope',s:'The y-intercept of that line is your hourly rate.',fact:false,why:'The hourly rate is the slope. The y-intercept is the flat fee at 0 hours.'},
 {k:'kids',s:'Charging more for each extra child adds to the slope or the intercept depending on how you set it.',fact:true,why:'A per-hour extra changes the slope; a flat extra changes the intercept.'}
],
battery:[
 {k:'linear',s:'A phone battery always drains at the same rate.',fact:false,why:'Screen brightness, signal and apps change the rate, so the graph bends.'},
 {k:'slope',s:'The slope of a battery-percent graph tells how fast it drains.',fact:true,why:'Percent lost per hour is the rate of change.'},
 {k:'predict',s:'You can estimate when the battery dies by extending the line to zero.',fact:true,why:'Solve for when the percent hits 0, if the rate stays about the same.'}
],
beatbot:[
 {k:'human',s:'Every job application is read by a person.',fact:false,why:'Many large employers use screening software that filters applications before a person sees them.'},
 {k:'cut',s:'Raising a screening cutoff always means fewer applications pass.',fact:true,why:'Fewer scores clear a higher bar.'},
 {k:'error',s:'A screening system can reject qualified applicants.',fact:true,why:'Any cutoff makes some false rejections and some false passes.'}
],
billions:[
 {k:'mill',s:'A billion is a thousand times a million.',fact:true,why:'A million seconds is about 11.6 days; a billion seconds is about 31.7 years.'},
 {k:'close',s:'A million and a billion are pretty close in size.',fact:false,why:'A billion is 1,000 times bigger. That gap is easy to underestimate.'},
 {k:'per',s:'Dividing a big number by the population makes it easier to understand.',fact:true,why:'$1 billion spread over 330 million Americans is about $3 each.'}
],
bookshome:[
 {k:'cause',s:'Having books at home causes kids to read better.',fact:false,why:'They are correlated, but families with many books may differ in other ways too. Correlation alone doesn’t show cause.'},
 {k:'corr',s:'A correlation can be strong even if it isn’t a cause.',fact:true,why:'A hidden third factor can drive both.'},
 {k:'r',s:'A correlation coefficient near 0 means little linear relationship.',fact:true,why:'r runs from −1 to 1; near 0 means the points don’t follow a line.'}
],
bottle:[
 {k:'cyl',s:'A cylinder’s volume is π r² h.',fact:true,why:'The area of the circle base times the height.'},
 {k:'double',s:'Doubling a bottle’s radius doubles how much it holds.',fact:false,why:'Volume depends on r², so it holds 4 times as much.'},
 {k:'ml',s:'One cubic centimeter holds one milliliter.',fact:true,why:'So a volume in cm³ is the same number in mL.'}
],
breakeven:[
 {k:'point',s:'The break-even point is where income equals costs.',fact:true,why:'On a graph, it is where the income line crosses the cost line.'},
 {k:'profit',s:'Selling more always means more profit.',fact:false,why:'Only past the break-even point, and only if each sale earns more than it costs.'},
 {k:'fixed',s:'Fixed costs stay the same no matter how many you sell.',fact:true,why:'Like a booth fee. Variable costs grow with each item.'}
],
budget:[
 {k:'ineq',s:'A budget limit is written with an inequality, like ≤.',fact:true,why:'You can spend up to the limit, not only exactly it.'},
 {k:'one',s:'There is only one combination of items that fits a budget.',fact:false,why:'Usually many combinations fit, the whole shaded region.'},
 {k:'corner',s:'The best choice often sits at a corner of the region that fits all the limits.',fact:true,why:'That is the key idea of linear programming.'}
],
busroute:[
 {k:'avg',s:'A bus that is on time on average is always on time.',fact:false,why:'Averages hide spread. Delays some days can still make you late.'},
 {k:'buffer',s:'Planning with the spread of travel times helps you arrive on time.',fact:true,why:'Leaving for the slow days, not the average, builds a buffer.'},
 {k:'dist',s:'Distance = rate × time.',fact:true,why:'Divide distance by speed to get time.'}
],
caffeine:[
 {k:'half',s:'Caffeine leaves your body at a steady number of milligrams per hour.',fact:false,why:'It decays by a percent per hour, an exponential curve with a half-life of about 5 hours.'},
 {k:'expo',s:'Each half-life cuts the remaining amount in half.',fact:true,why:'200 mg → 100 → 50 → 25.'},
 {k:'never',s:'In an exponential decay model, the amount never quite reaches zero.',fact:true,why:'It keeps halving. In practice it becomes too small to matter.'}
],
caffeinedaily:[
 {k:'pile',s:'A daily drink can build up to a higher steady level than one drink alone.',fact:true,why:'Each day adds a new dose on top of what is left from before.'},
 {k:'forever',s:'With a daily drink, the caffeine level keeps rising forever.',fact:false,why:'It levels off at a steady state, where what you add each day equals what decays.'},
 {k:'series',s:'That steady level comes from adding a geometric series.',fact:true,why:'Leftovers shrink by the same factor each day.'}
],
camerapan:[
 {k:'angle',s:'To follow a runner at constant speed, the camera must turn fastest when the runner is closest.',fact:true,why:'The angle changes fastest when the distance is smallest.'},
 {k:'steady',s:'A camera tracking a car at constant speed turns at a constant rate.',fact:false,why:'The turn rate changes with distance; it peaks as the car passes closest.'},
 {k:'tan',s:'Tangent connects the camera angle to the runner’s position.',fact:true,why:'tan θ = sideways distance ÷ straight-out distance.'}
],
checkout:[
 {k:'tax',s:'Adding 8% tax is the same as multiplying by 1.08.',fact:true,why:'Price + 0.08 × price = 1.08 × price.'},
 {k:'order',s:'Taking a 20% discount and then a 10% discount is the same as 30% off.',fact:false,why:'It is 0.8 × 0.9 = 0.72, which is 28% off.'},
 {k:'func',s:'A checkout total is a function of what is in the cart.',fact:true,why:'Each cart gives exactly one total.'}
],
cipher:[
 {k:'shift',s:'A shift cipher can be undone by shifting the other way.',fact:true,why:'Encoding adds k; decoding subtracts k (mod 26).'},
 {k:'safe',s:'A shift cipher is safe for secrets because there are so many letters.',fact:false,why:'There are only 25 shifts to try.'},
 {k:'freq',s:'In English text, E is usually the most common letter.',fact:true,why:'That is how frequency analysis cracks simple ciphers.'}
],
clinometer:[
 {k:'tan',s:'Height = distance × tan(angle of elevation), plus your eye height.',fact:true,why:'The tree, the ground and your sight line form a right triangle.'},
 {k:'double',s:'Doubling the angle of elevation doubles the height you calculate.',fact:false,why:'Tangent isn’t linear. tan 60° is about 3 times tan 30°.'},
 {k:'eye',s:'Forgetting your eye height makes the answer too short.',fact:true,why:'The triangle starts at your eyes, not the ground.'}
],
coaster:[
 {k:'zeros',s:'A polynomial’s zeros are where its graph crosses the x-axis.',fact:true,why:'Each factor (x − a) gives a zero at x = a.'},
 {k:'degree',s:'A degree-3 polynomial always has exactly three x-intercepts.',fact:false,why:'It has at most three. Some zeros can repeat or be complex.'},
 {k:'bounce',s:'A squared factor makes the graph touch the axis and turn back.',fact:true,why:'(x − 2)² is never negative, so the graph bounces at x = 2.'}
],
concession:[
 {k:'peak',s:'The longest line happens when people arrive faster than they are served.',fact:true,why:'The line grows while arrivals exceed service, and peaks when they balance.'},
 {k:'same',s:'Adding a second cashier cuts wait times in half exactly.',fact:false,why:'Waits often drop by much more than half, because a busy line is very sensitive to capacity.'},
 {k:'rate',s:'The rate a line grows is arrivals per minute minus service per minute.',fact:true,why:'A difference of rates.'}
],
cooling:[
 {k:'newton',s:'Hot food cools fastest when it is hottest.',fact:true,why:'Newton’s law of cooling: the rate depends on the gap from room temperature.'},
 {k:'linear',s:'Food cools by the same number of degrees every minute.',fact:false,why:'The gap shrinks by a percent each minute, so cooling slows down.'},
 {k:'room',s:'The food never goes below room temperature by cooling on the counter.',fact:true,why:'Room temperature is the asymptote.'}
],
datasize:[
 {k:'kb',s:'A gigabyte is about a thousand megabytes.',fact:true,why:'1 GB = 1,000 MB (or 1,024 in some uses).'},
 {k:'bits',s:'Internet speeds in Mbps and file sizes in MB use the same units.',fact:false,why:'Mbps is megabits per second; MB is megabytes. A byte is 8 bits, so divide by 8.'},
 {k:'video',s:'Higher video quality uses more data per minute.',fact:true,why:'More pixels and frames mean more bits.'}
],
daylight:[
 {k:'sine',s:'Daylight hours over a year follow a pattern close to a sine curve.',fact:true,why:'They rise and fall smoothly, repeating every 365 days.'},
 {k:'same',s:'Every place on Earth gets the same amount of daylight each day.',fact:false,why:'The swing is bigger farther from the equator.'},
 {k:'solstice',s:'In Denver, the longest day is around June 21.',fact:true,why:'The summer solstice, with a little under 15 hours of daylight.'}
],
decibels:[
 {k:'log',s:'Every 10-decibel increase means 10 times the sound intensity.',fact:true,why:'Decibels are a log scale.'},
 {k:'double',s:'90 dB is twice as intense as 45 dB.',fact:false,why:'45 dB more is 10^4.5, about 30,000 times the intensity.'},
 {k:'time',s:'Safe listening time drops quickly as volume rises.',fact:true,why:'NIOSH guidance halves the safe time for every 3 dB above 85 dB.'}
],
dish:[
 {k:'focus',s:'A parabolic dish reflects incoming parallel signals to one point, the focus.',fact:true,why:'That is why satellite dishes put the receiver there.'},
 {k:'any',s:'Any curved dish focuses signals to one point.',fact:false,why:'Only a parabola sends parallel rays to a single focus.'},
 {k:'flash',s:'Flashlights use the same shape in reverse.',fact:true,why:'A bulb at the focus sends light out in a parallel beam.'}
],
fairscore:[
 {k:'both',s:'A risk score can always be equally accurate and equally error-prone for every group.',fact:false,why:'When groups have different base rates, mathematicians showed some fairness measures can’t all hold at once.'},
 {k:'base',s:'Base rates matter when judging a test result.',fact:true,why:'The same score means different chances in groups with different base rates.'},
 {k:'choice',s:'Choosing which fairness measure to use is a values question, not just math.',fact:true,why:'Math shows the tradeoffs; people decide which matters most.'}
],
fontcurves:[
 {k:'bezier',s:'The curves in most computer fonts are Bézier curves.',fact:true,why:'Control points pull the curve, which can be scaled to any size without blur.'},
 {k:'pixels',s:'Fonts are stored as pictures made of pixels.',fact:false,why:'Most are stored as curves and drawn into pixels at whatever size you need.'},
 {k:'param',s:'A Bézier curve is a parametric curve.',fact:true,why:'x and y each depend on a parameter t from 0 to 1.'}
],
formulas:[
 {k:'ref',s:'In a spreadsheet, copying =A1*2 down a column changes it to =A2*2, =A3*2 and so on.',fact:true,why:'Relative references move with the formula.'},
 {k:'dollar',s:'The $ in $A$1 stands for money.',fact:false,why:'It locks the reference so it doesn’t move when copied.'},
 {k:'sum',s:'=SUM(B2:B10) adds every cell from B2 to B10.',fact:true,why:'The colon makes a range.'}
],
freethrow:[
 {k:'para',s:'A free throw follows a parabola, ignoring air.',fact:true,why:'Height is a quadratic function of distance.'},
 {k:'flat',s:'A flatter shot gives the ball a bigger target.',fact:false,why:'A steeper entry angle makes the hoop look bigger to the ball.'},
 {k:'vertex',s:'The highest point of the shot is the vertex of the parabola.',fact:true,why:'It sits halfway between two points at the same height.'}
],
fryshort:[
 {k:'one',s:'One light order proves the restaurant is shorting customers.',fact:false,why:'Portions vary. You need many orders to compare the average with the stated amount.'},
 {k:'mean',s:'Weighing many orders and averaging gives a fairer test.',fact:true,why:'Random variation averages out.'},
 {k:'spread',s:'Knowing the spread of weights helps decide if a difference is real.',fact:true,why:'A difference much bigger than the usual spread is less likely to be chance.'}
],
gps:[
 {k:'three',s:'Knowing your distance from three known points can pin down your location on a map.',fact:true,why:'Each distance is a circle; three circles meet at one point.'},
 {k:'one',s:'One satellite is enough for GPS to find you.',fact:false,why:'It needs at least four in 3D, including one to fix the clock error.'},
 {k:'time',s:'GPS finds distance from how long the signal takes to arrive.',fact:true,why:'Distance = speed of light × travel time.'}
],
hoodies:[
 {k:'equal',s:'Ordering the same number of every size wastes the fewest hoodies.',fact:false,why:'Sizes aren’t equally common. Order in proportion to a survey or past sales.'},
 {k:'prop',s:'If 30% of students wear medium, about 30% of the order should be medium.',fact:true,why:'Proportions scale from the sample to the order.'},
 {k:'round',s:'Rounding each size can make the total off by a few.',fact:true,why:'Check that the rounded counts add up to the order size.'}
],
hotspot:[
 {k:'loop',s:'A loop in code repeats steps until a condition says stop.',fact:true,why:'Like checking each square on a map for the hottest one.'},
 {k:'max',s:'To find the hottest spot, you must look at every reading at least once.',fact:true,why:'Any reading you skip could be the maximum.'},
 {k:'first',s:'The first reading you check is always the hottest.',fact:false,why:'Keep track of the best so far and update it as you go.'}
],
kidneyswap:[
 {k:'chain',s:'Kidney swaps let incompatible donor pairs trade so more patients get transplants.',fact:true,why:'Alvin Roth shared the 2012 Nobel Prize in economics partly for this matching work.'},
 {k:'pairs',s:'Kidney exchanges can only match two pairs at a time.',fact:false,why:'Longer cycles and chains started by a generous donor can match many more.'},
 {k:'graph',s:'Matching problems like this can be drawn as graphs of dots and arrows.',fact:true,why:'Dots are patients and donors; arrows show compatible matches.'}
],
lawnjob:[
 {k:'area',s:'Charging by square foot means a lawn twice as long and twice as wide costs four times as much.',fact:true,why:'Area grows with both dimensions.'},
 {k:'perim',s:'A lawn’s area and perimeter grow at the same rate when you scale it up.',fact:false,why:'Perimeter doubles when area quadruples.'},
 {k:'cutout',s:'To find the mowing area, subtract the house and patio from the yard.',fact:true,why:'Composite area: total minus the parts you don’t mow.'}
],
leadpass:[
 {k:'lead',s:'To hit a moving receiver, you throw to where they will be, not where they are.',fact:true,why:'The ball and the receiver must arrive at the same point at the same time.'},
 {k:'straight',s:'Throwing straight at the receiver works if you throw hard enough.',fact:false,why:'Any travel time means the receiver moves; you still need a lead.'},
 {k:'vector',s:'Leading a pass is a vector problem.',fact:true,why:'Add the receiver’s velocity times the ball’s travel time.'}
],
lifesim:[
 {k:'avg',s:'The average outcome of many simulated lives is the outcome every person gets.',fact:false,why:'Individual results spread widely around the average.'},
 {k:'random',s:'Running a simulation many times shows the range of possible outcomes.',fact:true,why:'That is a Monte Carlo approach.'},
 {k:'small',s:'Small differences early on can grow into big differences later.',fact:true,why:'Effects compound over time.'}
],
livessaved:[
 {k:'est',s:'A “lives saved” number is usually an estimate from a model.',fact:true,why:'You can’t count deaths that didn’t happen; you compare with what likely would have happened.'},
 {k:'exact',s:'Lives-saved numbers are exact counts.',fact:false,why:'They come with ranges because the comparison is modeled.'},
 {k:'range',s:'A wide range means more uncertainty in the estimate.',fact:true,why:'Report the range, not just the middle number.'}
],
logic:[
 {k:'conv',s:'If “if it rains, the game is canceled” is true, then “if the game is canceled, it rained” must also be true.',fact:false,why:'That is the converse. The game could be canceled for other reasons.'},
 {k:'contra',s:'A statement and its contrapositive are always both true or both false.',fact:true,why:'“If not canceled, then no rain” matches the original.'},
 {k:'spam',s:'A spam filter rule can catch real spam and still flag good emails.',fact:true,why:'Rules make false positives and false negatives.'}
],
logscale:[
 {k:'line',s:'On a log scale, steady exponential growth looks like a straight line.',fact:true,why:'Each doubling takes the same vertical distance.'},
 {k:'slow',s:'A flat-looking start on a regular graph means growth is slow.',fact:false,why:'Exponential growth looks flat early, then shoots up. A log scale shows it coming.'},
 {k:'equal',s:'On a log scale, equal spaces stand for equal multiples.',fact:true,why:'1 to 10 takes the same space as 10 to 100.'}
],
lootdrop:[
 {k:'due',s:'After many crates with no rare item, you are “due” for one.',fact:false,why:'If each crate is independent, the odds are the same every time (the gambler’s fallacy).'},
 {k:'expect',s:'With a 1% drop rate, you expect about one rare item per 100 crates on average.',fact:true,why:'Expected value = 100 × 0.01 = 1, though many players get none.'},
 {k:'test',s:'Opening many crates and counting can test whether stated odds are honest.',fact:true,why:'Compare the observed rate with the stated one, allowing for chance.'}
],
lunchcount:[
 {k:'add',s:'If 40 students want pizza and 30 want salad, you need 70 lunches.',fact:false,why:'Some may want both. Subtract the overlap: |A ∪ B| = |A| + |B| − |A ∩ B|.'},
 {k:'venn',s:'A Venn diagram shows how two groups overlap.',fact:true,why:'The middle region is counted only once.'},
 {k:'neither',s:'Students in neither group still need to be counted separately.',fact:true,why:'Total = both lists combined plus those in neither.'}
],
makethepros:[
 {k:'odds',s:'A tiny share of high school athletes reach the pros.',fact:true,why:'NCAA estimates are well under 1% for most sports.'},
 {k:'birth',s:'Birth month can affect who makes elite youth teams.',fact:true,why:'Players born just after an age cutoff are older and bigger, the relative age effect.'},
 {k:'talent',s:'Making the pros depends only on talent.',fact:false,why:'Age cutoffs, access to coaching and chance all play a part.'}
],
matrices:[
 {k:'move',s:'Multiplying a shape’s coordinates by a matrix can rotate, stretch or reflect it.',fact:true,why:'Computer graphics use matrices this way.'},
 {k:'order',s:'Rotating then reflecting gives the same result as reflecting then rotating.',fact:false,why:'Matrix multiplication usually isn’t commutative; order matters.'},
 {k:'det',s:'The determinant tells how much a matrix scales area.',fact:true,why:'A determinant of 2 doubles every area; a negative one flips orientation.'}
],
noisecancel:[
 {k:'wave',s:'Noise canceling works by adding a sound wave that is the opposite of the noise.',fact:true,why:'Peaks meet troughs and cancel, called destructive interference.'},
 {k:'block',s:'Noise-canceling headphones work only by blocking sound with padding.',fact:false,why:'Padding helps, but the active part makes an opposite wave.'},
 {k:'low',s:'Noise canceling works best on steady, low sounds.',fact:true,why:'Like engine hum. Sudden or high sounds are harder to predict and cancel.'}
],
openbox:[
 {k:'max',s:'Cutting bigger corner squares always makes a bigger box.',fact:false,why:'The box gets taller but the base shrinks. Volume peaks at one cut size.'},
 {k:'cubic',s:'The box’s volume is a cubic function of the cut size.',fact:true,why:'V = x(L − 2x)(W − 2x).'},
 {k:'domain',s:'The cut size can’t be more than half the shorter side.',fact:true,why:'Otherwise there is no base left.'}
],
opportunity:[
 {k:'where',s:'Research shows where a child grows up is linked to their adult income.',fact:true,why:'Raj Chetty’s Opportunity Atlas shows big differences even between nearby neighborhoods.'},
 {k:'same',s:'Children from similar families earn about the same as adults wherever they grow up.',fact:false,why:'Outcomes vary widely by neighborhood for kids from similar families.'},
 {k:'move',s:'Studies found children who moved to lower-poverty areas when young earned more as adults.',fact:true,why:'The Moving to Opportunity experiment found larger gains the younger the children moved.'}
],
orbits:[
 {k:'circle',s:'Planets orbit the Sun in perfect circles.',fact:false,why:'They move in ellipses, with the Sun at one focus (Kepler’s first law).'},
 {k:'focus',s:'A sound made at one focus of an elliptical room can be heard clearly at the other focus.',fact:true,why:'Reflections off an ellipse send sound from one focus to the other, as in whispering galleries.'},
 {k:'seasons',s:'Earth’s seasons are caused by its elliptical orbit.',fact:false,why:'Earth’s orbit is nearly circular; seasons come from its tilt.'}
],
packaging:[
 {k:'min',s:'For a can of a fixed volume, using the least metal happens when the height equals the diameter.',fact:true,why:'Calculus shows h = 2r minimizes surface area for a fixed volume.'},
 {k:'tall',s:'A taller, thinner can always uses less metal.',fact:false,why:'Past the best shape, the extra height adds more metal than the smaller lids save.'},
 {k:'real',s:'Real cans aren’t always the minimum-metal shape.',fact:true,why:'Grip, shelf space and branding also matter.'}
],
parking:[
 {k:'angle',s:'Angled parking can fit cars into a narrower aisle.',fact:true,why:'Cars turn less sharply to pull in.'},
 {k:'par',s:'Parking lines are parallel, so the angles they make with the curb are all equal.',fact:true,why:'Corresponding angles along a transversal are equal.'},
 {k:'more',s:'Angled parking always fits more cars than straight-in parking.',fact:false,why:'Straight-in often fits more cars in the same space, but needs a wider aisle.'}
],
photofilter:[
 {k:'func',s:'A brightness filter is a function from each old pixel value to a new one.',fact:true,why:'Each input value maps to one output value.'},
 {k:'add',s:'Adding the same amount to every pixel can push some to the maximum and lose detail.',fact:true,why:'Values cap at 255, so bright areas all become white.'},
 {k:'undo',s:'Every filter can be undone perfectly.',fact:false,why:'Clipped or rounded values can’t be recovered. Not every function has an inverse.'}
],
pollmargin:[
 {k:'lock',s:'A candidate at 54% in a poll is certain to win.',fact:false,why:'There is a margin of error, and polls can miss in ways the margin doesn’t cover.'},
 {k:'moe',s:'A margin of error of ±3 points means the true value is likely within 3 points of the poll.',fact:true,why:'Usually at 95% confidence, and only for sampling error.'},
 {k:'size',s:'Quadrupling the sample size cuts the margin of error about in half.',fact:true,why:'The margin shrinks with the square root of the sample size.'}
],
pondday:[
 {k:'shift',s:'Adding a number to x inside a function shifts its graph left or right.',fact:true,why:'f(x + 2) shifts the graph 2 units left.'},
 {k:'right',s:'f(x − 3) shifts the graph 3 units left.',fact:false,why:'It shifts it 3 units right.'},
 {k:'stretch',s:'Multiplying a function by 2 stretches its graph vertically.',fact:true,why:'Every output doubles.'}
],
ramp:[
 {k:'slope',s:'Slope is rise over run.',fact:true,why:'A ramp that rises 1 foot over 12 feet has slope 1/12.'},
 {k:'ada',s:'Wheelchair ramps can be as steep as builders want.',fact:false,why:'ADA standards limit most ramps to a slope of 1:12.'},
 {k:'grade',s:'A road grade of 6% rises 6 feet for every 100 feet.',fact:true,why:'Grade is slope written as a percent.'}
],
rankcolleges:[
 {k:'weights',s:'Changing the weights in a ranking can change which college comes first.',fact:true,why:'Rankings are a weighted sum, and the weights are choices.'},
 {k:'best',s:'A college ranking measures which school is objectively best for everyone.',fact:false,why:'It measures what its makers chose to count. The best fit depends on what matters to you.'},
 {k:'own',s:'You can build your own ranking with your own weights.',fact:true,why:'Score what matters to you and weight it.'}
],
rapidtest:[
 {k:'pos',s:'A positive result on a test that is 99% accurate means you are 99% likely to be sick.',fact:false,why:'If the illness is rare, false positives can outnumber true ones. It depends on the base rate (Bayes’ theorem).'},
 {k:'base',s:'The same test result means more when the illness is more common.',fact:true,why:'More true positives compared with false ones.'},
 {k:'retest',s:'A second positive test raises the chance you are really sick.',fact:true,why:'Two independent positives are much less likely by chance.'}
],
rideshare:[
 {k:'line',s:'A ride with a base fee plus per-mile cost makes a linear function.',fact:true,why:'Cost = base + rate × miles.'},
 {k:'always',s:'The ride with the lower per-mile rate is always cheaper.',fact:false,why:'A higher base fee can make it cost more for short trips. Find where the lines cross.'},
 {k:'cross',s:'The two lines’ intersection shows the trip length where both cost the same.',fact:true,why:'Solve the system of equations.'}
],
rotations:[
 {k:'i',s:'Multiplying by i rotates a point 90° counterclockwise in the complex plane.',fact:true,why:'1 → i → −1 → −i → 1.'},
 {k:'imag',s:'Imaginary numbers have no real-world use.',fact:false,why:'They are used in electronics, signal processing and robotics to describe rotations and waves.'},
 {k:'mult',s:'Multiplying complex numbers adds their angles.',fact:true,why:'And multiplies their lengths.'}
],
rsvp:[
 {k:'all',s:'Everyone you invite will come.',fact:false,why:'Use a past show-up rate. If 70% usually come, inviting 50 means about 35.'},
 {k:'expect',s:'Expected attendance = invitations × the chance each person comes.',fact:true,why:'Expected value of many yes/no events.'},
 {k:'spread',s:'Actual attendance will vary around the expected number.',fact:true,why:'Plan for a range, not just one number.'}
],
runpace:[
 {k:'inst',s:'Your average speed over a run is the same as your speed at every moment.',fact:false,why:'Speed changes. The slope at one moment is the instantaneous rate.'},
 {k:'pace',s:'Pace (minutes per mile) and speed (miles per hour) are reciprocals.',fact:true,why:'An 8-minute mile is 7.5 mph.'},
 {k:'tangent',s:'Instantaneous speed is the slope of the tangent line on a distance–time graph.',fact:true,why:'That is the idea of a derivative.'}
],
scaleit:[
 {k:'prop',s:'Doubling a recipe means doubling every ingredient.',fact:true,why:'Each amount scales by the same factor.'},
 {k:'add',s:'To scale a recipe from 4 servings to 6, add 2 of everything.',fact:false,why:'Multiply by 6/4 = 1.5, not add.'},
 {k:'time',s:'Doubling a recipe doesn’t always double the cooking time.',fact:true,why:'Cooking time depends on thickness and heat flow, not just amount.'}
],
schedule:[
 {k:'constraint',s:'Scheduling problems have to satisfy many rules at once.',fact:true,why:'Availability, hours and fairness rules are all constraints.'},
 {k:'free',s:'A fairer schedule never costs anything extra.',fact:false,why:'Fairness rules can limit the choices, which can raise costs. That is a tradeoff to weigh.'},
 {k:'hard',s:'Some scheduling problems get very hard to solve perfectly as they grow.',fact:true,why:'The number of possible schedules grows extremely fast.'}
],
schoolmatch:[
 {k:'truth',s:'In Denver’s school match, students do best by listing their real favorites in order.',fact:true,why:'Denver uses deferred acceptance, where ranking honestly is the best strategy.'},
 {k:'safe',s:'You should rank a “safe” school first to make sure you get in somewhere.',fact:false,why:'In deferred acceptance, a top choice you don’t get doesn’t cost you your next choice.'},
 {k:'nobel',s:'Matching systems like this earned a Nobel Prize.',fact:true,why:'Alvin Roth and Lloyd Shapley shared the 2012 Nobel in economics.'}
],
screens:[
 {k:'diag',s:'TV sizes are measured along the diagonal.',fact:true,why:'Use the Pythagorean theorem to find width and height.'},
 {k:'double',s:'A 64-inch TV has twice the screen area of a 32-inch TV.',fact:false,why:'Doubling every length makes the area 4 times as big.'},
 {k:'pyth',s:'For a right triangle, a² + b² = c².',fact:true,why:'The diagonal is the hypotenuse.'}
],
shadow:[
 {k:'similar',s:'At the same time of day, an object’s height and its shadow are in the same ratio for every object.',fact:true,why:'The sun’s rays make similar triangles.'},
 {k:'time',s:'The ratio stays the same all day.',fact:false,why:'As the sun moves, shadows lengthen or shorten.'},
 {k:'prop',s:'If a 6-foot person casts a 4-foot shadow, a tree with a 20-foot shadow is 30 feet tall.',fact:true,why:'6/4 = h/20, so h = 30.'}
],
sharedwork:[
 {k:'add',s:'If one person paints a room in 4 hours and another in 4 hours, together they take 8 hours.',fact:false,why:'They work at the same time: each does 1/4 of the room per hour, so together 1/2 per hour, 2 hours.'},
 {k:'rates',s:'In shared work problems, you add rates, not times.',fact:true,why:'1/a + 1/b = 1/t.'},
 {k:'faster',s:'Working together is faster than the faster person alone.',fact:true,why:'Adding any positive rate shortens the time.'}
],
shortcut:[
 {k:'straight',s:'The straight-line path is always the fastest.',fact:false,why:'If you are slower on grass than pavement, a bent path can be faster, like light refracting.'},
 {k:'pyth',s:'Cutting across a rectangular lot saves distance compared with walking two sides.',fact:true,why:'The diagonal is shorter than the sum of the sides.'},
 {k:'opt',s:'Finding the fastest path is an optimization problem.',fact:true,why:'You minimize total time over possible paths.'}
],
shotangle:[
 {k:'center',s:'The best angle to shoot at a goal is usually from in front, not the side.',fact:true,why:'The goal looks wider, so the angle you can score in is bigger.'},
 {k:'close',s:'Getting closer to the goal line always widens your shooting angle.',fact:false,why:'Off to the side, moving straight toward the goal line can shrink the angle. There is a best spot.'},
 {k:'circle',s:'Points on a circle through both goalposts see the goal at the same angle.',fact:true,why:'Inscribed angles on the same arc are equal.'}
],
sincode:[
 {k:'series',s:'Computers can compute sin(x) by adding up a series of simple terms.',fact:true,why:'sin x = x − x³/3! + x⁵/5! − …'},
 {k:'table',s:'Calculators look up sine in a giant table of every angle.',fact:false,why:'They use formulas, series or algorithms like CORDIC, not a table of every value.'},
 {k:'small',s:'For small angles in radians, sin x is close to x.',fact:true,why:'The higher terms are tiny when x is small.'}
],
skidmarks:[
 {k:'double',s:'Doubling your speed doubles your stopping distance.',fact:false,why:'Braking distance grows with the square of speed, so it quadruples.'},
 {k:'speed',s:'Investigators can estimate a car’s speed from its skid marks.',fact:true,why:'Speed ≈ √(2 × friction × g × distance).'},
 {k:'react',s:'Reaction time adds distance before you even start braking.',fact:true,why:'At 60 mph, a 1.5-second reaction covers about 130 feet.'}
],
slump:[
 {k:'streak',s:'A few bad games in a row prove a player is in a real slump.',fact:false,why:'Random variation produces streaks. Compare with how often chance alone would make one.'},
 {k:'sample',s:'Bigger samples give a more reliable batting average.',fact:true,why:'Over a few at-bats, luck dominates.'},
 {k:'regress',s:'After an unusually bad stretch, performance often moves back toward average.',fact:true,why:'That is regression to the mean.'}
],
speedlog:[
 {k:'area',s:'The area under a speed–time graph is the distance traveled.',fact:true,why:'Speed × time = distance, added up over each interval.'},
 {k:'avg',s:'Averaging the speed readings always gives the right average speed.',fact:false,why:'Only if they are equally spaced in time. Otherwise weight by time.'},
 {k:'rect',s:'Adding up thin rectangles can estimate the area under a curve.',fact:true,why:'Thinner rectangles give better estimates (a Riemann sum).'}
],
splitcost:[
 {k:'inverse',s:'Splitting a fixed cost among more people lowers each share, but less and less with each person.',fact:true,why:'Cost per person = total ÷ n, an inverse relationship.'},
 {k:'linear',s:'Doubling the number of people cuts each share by the same amount every time.',fact:false,why:'Each share halves, so the drop in dollars gets smaller.'},
 {k:'asym',s:'The cost per person can get close to zero but never reach it.',fact:true,why:'Total ÷ n approaches 0 as n grows.'}
],
sprinkler:[
 {k:'circle',s:'A sprinkler that sprays 10 feet waters about 314 square feet in a full circle.',fact:true,why:'Area = π r² = π × 100.'},
 {k:'double',s:'A sprinkler with twice the reach waters twice the area.',fact:false,why:'Area depends on r², so four times.'},
 {k:'sector',s:'A sprinkler that sweeps 90° waters one quarter of the circle.',fact:true,why:'A sector’s area is (angle ÷ 360°) × π r².'}
],
sprites:[
 {k:'coord',s:'In many game engines, y increases going down the screen.',fact:true,why:'Screen coordinates start at the top-left corner.'},
 {k:'add',s:'Moving a sprite is just adding to its x and y coordinates.',fact:true,why:'A translation adds the same vector to every point.'},
 {k:'angle',s:'To move a sprite at an angle, you add the same amount to x and y.',fact:false,why:'Use cos and sin of the angle to split the move into x and y parts.'}
],
studymethod:[
 {k:'reread',s:'Rereading notes is the most effective way to study.',fact:false,why:'Studies find practice testing and spacing out study beat rereading for long-term memory.'},
 {k:'test',s:'Practice testing helps memory even when you get answers wrong.',fact:true,why:'Retrieving, and then getting feedback, strengthens memory.'},
 {k:'control',s:'A fair study comparison gives both groups the same material and time.',fact:true,why:'Then the method is the only difference.'}
],
survey:[
 {k:'volunteer',s:'Asking whoever volunteers gives a fair picture of the whole school.',fact:false,why:'Volunteers often differ from everyone else. Random sampling avoids that bias.'},
 {k:'random',s:'A random sample gives every student an equal chance to be picked.',fact:true,why:'That makes the sample likely to look like the school.'},
 {k:'big',s:'A big biased sample is better than a small random one.',fact:false,why:'Bias doesn’t shrink with size. A small random sample is usually more trustworthy.'}
],
targetdrop:[
 {k:'area',s:'If a beanbag lands randomly on a board, the chance of hitting the hole is the hole’s area divided by the board’s area.',fact:true,why:'That is geometric probability.'},
 {k:'double',s:'Doubling the hole’s diameter doubles the chance of hitting it.',fact:false,why:'Area depends on r², so the chance quadruples.'},
 {k:'wait',s:'If a light is red 40 of every 60 seconds, a random arrival has a 2/3 chance of waiting.',fact:true,why:'Probability = red time ÷ total cycle time.'}
],
testchoice:[
 {k:'concord',s:'ACT and SAT scores can be compared with an official concordance table.',fact:true,why:'The College Board and ACT publish one.'},
 {k:'same',s:'A 30 on the ACT and a 1300 on the SAT are the same percentile.',fact:false,why:'A 30 ACT is closer to a 1390 SAT. Use the concordance table.'},
 {k:'pct',s:'Percentiles show how a score compares with other test takers.',fact:true,why:'The 80th percentile beats 80% of takers.'}
],
ticketprice:[
 {k:'max',s:'Raising the ticket price always brings in more money.',fact:false,why:'Fewer people buy. Revenue = price × tickets sold, which peaks at some price.'},
 {k:'quad',s:'If sales drop steadily as price rises, revenue makes a parabola.',fact:true,why:'Price × (a − b × price) is a quadratic.'},
 {k:'vertex',s:'The best price for revenue is at the vertex of that parabola.',fact:true,why:'Halfway between the two prices where revenue is zero.'}
],
tiling:[
 {k:'three',s:'Only three regular polygons tile a flat floor by themselves: triangles, squares and hexagons.',fact:true,why:'Their angles divide evenly into 360°.'},
 {k:'pent',s:'Regular pentagons tile a floor with no gaps.',fact:false,why:'Their 108° angles don’t divide 360° evenly, so gaps form.'},
 {k:'bees',s:'Hexagons enclose the most area for the least perimeter among shapes that tile.',fact:true,why:'That is one reason honeycombs are hexagonal.'}
],
tires:[
 {k:'fast',s:'With bigger tires, the speedometer shows a lower speed than you are really going.',fact:true,why:'Each turn of a bigger tire covers more ground: circumference = π d.'},
 {k:'same',s:'Changing tire size doesn’t change how far the car goes per wheel turn.',fact:false,why:'Distance per turn is the tire’s circumference.'},
 {k:'pct',s:'A tire 3% larger in diameter makes you go about 3% faster than the speedometer shows.',fact:true,why:'Circumference scales with diameter.'}
],
triangulate:[
 {k:'two',s:'Two lookout towers with compass bearings can locate a fire.',fact:true,why:'The two sight lines cross at the fire.'},
 {k:'law',s:'The law of sines can find the distance to the fire.',fact:true,why:'You know two angles and the side between the towers.'},
 {k:'one',s:'One tower with a bearing is enough to locate a fire.',fact:false,why:'One bearing gives a line; you need a second to find the point.'}
],
truss:[
 {k:'tri',s:'Triangles are used in bridges because they don’t change shape under load.',fact:true,why:'With fixed side lengths, a triangle’s angles are fixed. A square can fold into a rhombus.'},
 {k:'square',s:'A square frame is as rigid as a triangle.',fact:false,why:'Its joints can pivot, so it collapses sideways unless braced with a diagonal.'},
 {k:'forces',s:'In a truss, each beam is pushed or pulled along its length.',fact:true,why:'Compression or tension.'}
],
valueadded:[
 {k:'small',s:'Test scores from 25 students give a precise measure of a teacher’s effect.',fact:false,why:'With so few students, chance swings scores a lot; ratings can change a lot year to year.'},
 {k:'growth',s:'Value-added models compare students’ growth with what was predicted.',fact:true,why:'They try to separate the teacher’s effect from where students started.'},
 {k:'noise',s:'Small samples make averages noisier.',fact:true,why:'The standard error shrinks with the square root of the sample size.'}
],
viewcurve:[
 {k:'log',s:'Views that grow fast and then level off often follow a logistic curve.',fact:true,why:'Growth slows as fewer new people are left to reach.'},
 {k:'forever',s:'A viral video’s views keep growing exponentially forever.',fact:false,why:'There are only so many viewers, so growth levels off.'},
 {k:'inflect',s:'The point where growth starts slowing is the inflection point.',fact:true,why:'The curve changes from bending up to bending down.'}
],
warmup:[
 {k:'one',s:'One faster race after a new warm-up proves the warm-up works.',fact:false,why:'Race times vary. Compare many trials, ideally with a control.'},
 {k:'random',s:'Randomly assigning who tries the new warm-up makes the test fairer.',fact:true,why:'Random assignment balances other differences.'},
 {k:'placebo',s:'Believing something will help can improve performance by itself.',fact:true,why:'That is the placebo effect, which is why blinded comparisons help.'}
],
windvectors:[
 {k:'add',s:'A plane’s ground velocity is its air velocity plus the wind velocity.',fact:true,why:'Vectors add tip to tail.'},
 {k:'point',s:'To fly due north in a crosswind, a pilot points the plane due north.',fact:false,why:'The pilot must point partly into the wind so the sideways parts cancel.'},
 {k:'slow',s:'A crosswind correction lowers the plane’s ground speed.',fact:true,why:'Part of the plane’s velocity goes to fighting the wind.'}
],
wordgap:[
 {k:'30m',s:'The “30 million word gap” comes from a 1995 study of 42 families.',fact:true,why:'Hart and Risley’s study was small, so later researchers tested it with larger samples.'},
 {k:'settled',s:'Every later study has found the same 30-million-word gap.',fact:false,why:'Larger later studies found smaller and more varied gaps, depending on how words were counted.'},
 {k:'measure',s:'How you measure something like “words heard” changes the result.',fact:true,why:'Counting all speech versus only speech aimed at the child gives different numbers.'}
],
yearlygrowth:[
 {k:'avg',s:'If something grew 100% over 10 years, it grew 10% a year.',fact:false,why:'Growth compounds. Doubling in 10 years is about 7.2% a year: the 10th root of 2, minus 1.'},
 {k:'root',s:'The steady yearly rate comes from an nth root.',fact:true,why:'(end ÷ start)^(1/n) − 1.'},
 {k:'72',s:'The rule of 72 estimates doubling time: 72 ÷ rate.',fact:true,why:'At 8%, money doubles in about 9 years.'}
],
zipscores:[
 {k:'cause',s:'A zip code causes students’ test scores.',fact:false,why:'Zip codes are linked to income, school funding and other factors. The link isn’t the zip code itself.'},
 {k:'corr',s:'Average test scores are correlated with average family income by area.',fact:true,why:'Many studies find this pattern across the U.S.'},
 {k:'within',s:'Within any zip code, individual students’ scores vary widely.',fact:true,why:'An area average says little about one student.'}
],
carhouse:[
 {k:'monthly',s:'A low monthly payment means a car is affordable.',fact:false,why:'A longer loan lowers the payment but raises the total interest paid.'},
 {k:'invest',s:'Money that goes to car payments for years could grow if invested instead.',fact:true,why:'Compound growth over decades can turn steady payments into a large sum.'},
 {k:'value',s:'A new car loses value fastest in its first few years.',fact:true,why:'Many lose around 20% in the first year.'}
],
carquote:[
 {k:'color',s:'Red cars cost more to insure.',fact:false,why:'Insurers don’t price by color. Age, driving record, location and the car’s value and safety matter.'},
 {k:'teen',s:'Teen drivers usually pay much more for insurance than older drivers.',fact:true,why:'Teens have higher crash rates, so the risk priced in is higher.'},
 {k:'grades',s:'Good grades can lower a teen’s car insurance price.',fact:true,why:'Many insurers offer a good-student discount.'}
],
costofliving:[
 {k:'same',s:'A salary goes just as far in any city.',fact:false,why:'Housing, transportation and taxes vary a lot, so the same paycheck can buy very different lives.'},
 {k:'housing',s:'Housing is usually the biggest monthly cost for a household.',fact:true,why:'Rent or a mortgage often takes about a third of income or more.'},
 {k:'rule',s:'A common guideline is to spend no more than about 30% of income on housing.',fact:true,why:'Above that, households are often called cost-burdened.'}
],
creditcard:[
 {k:'min',s:'If you pay the minimum on a credit card every month, you pay no interest.',fact:false,why:'Interest is charged on any balance you carry past the due date. Only paying the full statement balance avoids it.'},
 {k:'full',s:'Paying your full statement balance by the due date means you usually pay no interest on purchases.',fact:true,why:'That grace period is how many people use a card for free and still build credit.'},
 {k:'apr',s:'A 24% APR means you pay 24% of your purchase once.',fact:false,why:'APR is a yearly rate charged on whatever you still owe, usually figured daily. Carry a balance for years and you can pay far more than 24% in total.'}
],
debtfit:[
 {k:'same',s:'Every major leads to about the same starting salary.',fact:false,why:'Starting pay varies widely by field, which changes how much student debt fits.'},
 {k:'rule',s:'A common guideline is to borrow no more in total than your expected first-year salary.',fact:true,why:'Then payments are more likely to fit a starting budget.'},
 {k:'interest',s:'Student loan interest can make the total repaid much bigger than the amount borrowed.',fact:true,why:'Interest builds over a typical 10-year plan or longer.'}
],
insurance:[
 {k:'always',s:'Insurance is always worth buying.',fact:false,why:'Insurers expect to collect more than they pay out on average. It is worth it when a loss would be hard to handle.'},
 {k:'deduct',s:'A higher deductible usually means a lower premium.',fact:true,why:'You agree to pay more yourself before the insurance pays.'},
 {k:'big',s:'Insurance matters most for losses you couldn’t afford on your own.',fact:true,why:'Like a car crash or a hospital stay.'}
],
livingwage:[
 {k:'min',s:'The federal minimum wage is the same as a living wage.',fact:false,why:'The federal minimum has been $7.25 since 2009. MIT estimates a living wage for one adult is well above that in every state.'},
 {k:'place',s:'A living wage depends on where you live and how many people you support.',fact:true,why:'Rent, child care and transportation costs vary.'},
 {k:'colo',s:'Colorado’s minimum wage is higher than the federal minimum.',fact:true,why:'Colorado sets its own, adjusted for inflation each year, and Denver’s is higher still.'}
],
minutesofwork:[
 {k:'hour',s:'Thinking of a price in hours of work can change whether something feels worth it.',fact:true,why:'A $60 purchase is about 4 hours at $15/hour, before taxes.'},
 {k:'tax',s:'At $15 an hour you take home $15 for every hour worked.',fact:false,why:'Taxes and deductions come out, so take-home is less.'},
 {k:'compare',s:'Prices measured in minutes of work let you compare across years and places.',fact:true,why:'It accounts for differences in wages.'}
],
mortgageterm:[
 {k:'save',s:'A 15-year mortgage usually costs much less total interest than a 30-year one.',fact:true,why:'You pay the loan off faster, often at a lower rate.'},
 {k:'pay',s:'A 15-year mortgage has a lower monthly payment.',fact:false,why:'The monthly payment is higher because you pay the loan off in half the time.'},
 {k:'early',s:'Early mortgage payments go mostly to interest.',fact:true,why:'Interest is charged on the large remaining balance.'}
],
onepercent:[
 {k:'small',s:'A 1% difference in interest rate makes almost no difference on a big loan.',fact:false,why:'On a long mortgage, 1% can add tens of thousands of dollars in interest.'},
 {k:'save',s:'A 1% higher return compounding for decades can grow savings a lot more.',fact:true,why:'Compounding magnifies small differences over time.'},
 {k:'fees',s:'Investment fees of 1% a year can cost a large share of long-term growth.',fact:true,why:'The fee comes out every year, and the money it takes can’t compound.'}
],
passwords:[
 {k:'long',s:'A long passphrase can be stronger than a short password with symbols.',fact:true,why:'Length multiplies the number of guesses needed.'},
 {k:'reuse',s:'Reusing one strong password on many sites is safe.',fact:false,why:'If one site leaks it, attackers try it everywhere. Use a password manager.'},
 {k:'mfa',s:'Turning on two-factor sign-in makes your bank account much safer.',fact:true,why:'A stolen password alone isn’t enough.'}
],
povertypremium:[
 {k:'fees',s:'People with less money often pay more for the same things.',fact:true,why:'Check-cashing fees, overdraft fees, higher-interest loans and buying in small sizes add up.'},
 {k:'bulk',s:'Everyone can save by buying in bulk.',fact:false,why:'Bulk buying needs cash up front, storage space and a car, which not everyone has.'},
 {k:'credit',s:'A lower credit score usually means higher interest rates.',fact:true,why:'Lenders charge more when they see more risk.'}
],
startearly:[
 {k:'early',s:'Someone who starts saving at 22 can end up with more than someone who saves twice as much starting at 35.',fact:true,why:'Compound growth needs time. Thirteen extra years of growth can beat a bigger monthly amount started later.'},
 {k:'rich',s:'You need a lot of money before investing is worth it.',fact:false,why:'Many accounts let you start with a few dollars. Starting small and early matters more than starting big.'},
 {k:'double',s:'At about 7% a year, money roughly doubles in about 10 years.',fact:true,why:'The rule of 72: 72 ÷ 7 ≈ 10 years. Returns vary year to year, so this is an average, not a promise.'}
],
stickernet:[
 {k:'sticker',s:'Most students pay a college’s full sticker price.',fact:false,why:'Many get grants and scholarships. The net price, after aid, is often much lower.'},
 {k:'calc',s:'Every college has a net price calculator on its website.',fact:true,why:'Federal law requires it, so you can estimate your cost before applying.'},
 {k:'grant',s:'Grants don’t have to be repaid, but loans do.',fact:true,why:'Compare the grant part of an aid offer, not just the total.'}
]
});
