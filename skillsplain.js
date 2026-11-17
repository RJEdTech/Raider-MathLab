/* "What you'll learn" lines (Nov 17, 2026, from Jason: the "The math:" line was written in course terms only; he wants a student version too, with both shown).
   One plain-words line per tool and level, tied to the tool's own situation. The course-terms line (d.skills) still shows under it.
   Keys match d.skills levels: bio = Big picture, honors = Closer look, ap = Deep dive. */
BioLab.addPlain({
aidoptimizer:{
 bio:'Find the scholarship that brings in the most money: revenue is how many students enroll times what each one pays, and you test prices to find the top.',
 honors:'See how the share of students who enroll drops as the price rises (an S-shaped curve), and how much one more dollar of price adds to or takes from revenue.',
 ap:'Use the derivative to find the exact price where revenue peaks: the point where raising the price adds nothing more.'},
beatbot:{
 bio:'Find the chance you get rejected at least once: 1 minus the chance you pass every screen.',
 honors:'Use the same “at least once” rule, and see why it matters whether employers use different tests or the same one.',
 ap:'Chain the chances across many employers and see how the odds change when they all share one test.'},
billions:{
 bio:'Make huge numbers make sense by counting zeros and dividing a total by the number of people.',
 honors:'Write huge numbers in scientific notation so you can compare them, and tell “how many times bigger” from “how much more.”',
 ap:'Use logarithms to see how many powers of ten apart two numbers are, and choose what to divide by: per person, per day or per household.'},
bookshome:{
 bio:'Read the slope of a best-fit line, and work out how much of a link is left once you compare only people with similar family backgrounds.',
 honors:'Measure the books-and-reading link while holding parents’ schooling and income fixed, and see why a log scale counts every doubling of books the same.',
 ap:'See why a hidden cause can fool even a careful comparison, and how a coin-flip experiment, with its margin of error, shows what books really do.'},
carhouse:{
 bio:'Graph two lender rules as shaded regions and find the biggest home loan that fits both.',
 honors:'Graph the lender rules and use percents of your income to see how a car payment eats into the house you can afford.',
 ap:'Graph the lender rules, then use the loan payment formula to turn a monthly payment into the size of loan it can carry.'},
carquote:{
 bio:'Build an insurance quote by multiplying a base price by one factor at a time, and work out how much a change saves you.',
 honors:'Turn each factor into a percent change and find which one moves your quote the most.',
 ap:'Multiply factors together, and see why an average from a small group of drivers bounces around more than one from a big group.'},
clinometer:{
 bio:'Use an angle and a distance to find a height you can’t reach, with the tangent button on a calculator.',
 honors:'Measure an angle of elevation and use tangent (opposite side ÷ the side next to the angle) to find a height.',
 ap:'Find a height with tangent, and see how much a one-degree slip in the angle changes the answer.'},
costofliving:{
 bio:'Compare costs to pay: what share of a paycheck the basics take, and how many hours of work they cost.',
 honors:'Make the same comparisons, and see why the “typical” worker looks different when you use the middle value (median) instead of the average (mean).',
 ap:'Compare prices across places and years with price indexes, and run a year of uneven paychecks many times to see the range of outcomes.'},
debtfit:{
 bio:'Use percents of a paycheck to see how big a loan payment fits.',
 honors:'Use proportions to set a payment that grows with pay, and graph rules that change at a cutoff.',
 ap:'Use proportions and the loan payment formula to work back from an affordable payment to how much you could borrow.'},
fairscore:{
 bio:'Read a table of who got flagged to find how often people who were fine got flagged anyway.',
 honors:'Find the two kinds of mistakes a risk score makes, and how often a flag really means trouble.',
 ap:'See why, when two groups differ, no single risk score can be fair in every way at once.'},
hotspot:{
 bio:'Follow a pattern week by week, where each week’s patrol share comes from the week before.',
 honors:'Follow a week-by-week rule and see how squaring the numbers turns a small difference into a big one.',
 ap:'Find when a week-by-week loop settles down and when it runs away, and what makes the loop push harder.'},
kidneyswap:{
 bio:'List every possible plan, count how many patients each one helps, and keep the best.',
 honors:'Draw patients and donors as a map of arrows, find the loops that make a swap work, and check every plan.',
 ap:'Search every path and loop in the arrow map to be sure you have the plan that helps the most people.'},
lifesim:{
 bio:'Read chances as counts out of 1,000 children, and combine groups by weighting each one by its size.',
 honors:'Find chances that depend on what happened earlier, add them up across every path, and run many lives to see the spread.',
 ap:'Build a simulation from real data: turn percentiles into scores, home in on a rate that matches, and model the chance of surviving each year of age.'},
livessaved:{
 bio:'Scale numbers up or down in proportion, then subtract, to estimate lives saved.',
 honors:'Multiply rates together and run a disease-spread model with and without the vaccine.',
 ap:'Run the estimate thousands of times with uncertain inputs to get a range, and find which input moves the answer most.'},
livingwage:{
 bio:'Turn a yearly cost into an hourly wage by dividing by the hours in a work year, and compare two wages as “how many times.”',
 honors:'Build the hourly wage, then compare the living wage to the minimum wage as a multiple.',
 ap:'Build the hourly wage and test how much it moves when you change one input, like rent or child care.'},
makethepros:{
 bio:'Multiply the chance of each step (high school to college, college to the pros) to get the chance of the whole path.',
 honors:'Multiply chances along a path, and compare places fairly with a rate per 100,000 people.',
 ap:'Work with chances that depend on earlier steps, and use Bayes’ rule to flip a chance around: from “if A, how likely is B?” to “if B, how likely is A?”'},
minutesofwork:{
 bio:'Divide a price by pay per hour to see how many minutes of work it costs.',
 honors:'Find the minutes of work for a whole basket of things, and use an index number to compare places at a glance.',
 ap:'Compare money across countries by what it can buy, not just by the exchange rate.'},
mortgageterm:{
 bio:'See how monthly payments pay off a loan, and use the loan payment formula to find each payment.',
 honors:'Find the monthly payment and add up how much interest you pay over the whole loan.',
 ap:'Use logarithms to solve for how many months it takes to pay off a loan.'},
onepercent:{
 bio:'Tell a percentage point from a percent, and see how monthly payments add up.',
 honors:'Use the loan payment formula to see what one percentage point adds to each payment and to the total.',
 ap:'See where the loan payment formula comes from: adding up a pattern of payments that each grow by the same factor.'},
opportunity:{
 bio:'Find a chance from counts: of the kids who started in the bottom fifth, how many reached the top fifth?',
 honors:'Rank incomes by percentile and read the slope of a line that shows how much of parents’ rank carries over to their kids.',
 ap:'Use a table of chances (a transition matrix) and multiply it to follow families across generations.'},
povertypremium:{
 bio:'Add up a year of costs with unit rates and percents to compare two workers.',
 honors:'Follow a debt month by month, where each month starts from the last, and see how a loop makes it grow.',
 ap:'Model debt growing exponentially, use expected value for surprise costs, and find the point past which a debt can’t be paid down.'},
rankcolleges:{
 bio:'Build a ranking with a weighted average: each score counts as much as its weight says.',
 honors:'Put scores on the same scale before you average them, so one measure doesn’t swamp the rest.',
 ap:'Find exactly how much a weight has to change before two colleges trade places.'},
schedule:{
 bio:'Round up to whole shifts and find the cost as hours times the wage.',
 honors:'Price a fairness rule: the cheapest schedule with the rule minus the cheapest without it.',
 ap:'Find the cheapest schedule that meets every rule by searching the set of schedules that work.'},
schoolmatch:{
 bio:'Follow a matching rule step by step, round by round.',
 honors:'Follow the rule, then check whether any student and school would both rather have each other.',
 ap:'See why one matching rule makes telling the truth your best move, and the other doesn’t.'},
startearly:{
 bio:'See how money grows when it earns a percent every year: each year’s total is multiplied by the same amount.',
 honors:'Add up years of monthly deposits that each keep growing.',
 ap:'Add up the deposits as a pattern (a geometric series) to get one formula for the total.'},
stickernet:{
 bio:'Subtract grants from the sticker price, then multiply by the number of years.',
 honors:'Find the discount as a percent, and use the loan payment formula for what you borrow.',
 ap:'Use the loan payment formula, and see how interest grows a balance over time.'},
targetdrop:{
 bio:'Find a chance by comparing sizes: the hole’s area divided by the board’s area.',
 honors:'Find chances from areas, the chance of missing, and the chance of hitting at least once in several tosses.'},
unitcircle:{
 bio:'Find a point on a circle from its angle: cosine is how far across, sine is how far up.',
 honors:'Know the exact sine and cosine of the key angles, use a reference angle when the piece is behind or below the arm, and measure angles in radians.',
 ap:'Treat sine and cosine as functions of an angle in radians and see their wave shapes.'},
valueadded:{
 bio:'See why an average of only 25 scores bounces around: its typical error shrinks with the square root of the class size.',
 honors:'See why a small class’s average bounces around, and how closely a teacher’s rating one year matches the next.',
 ap:'Work out how much of a rating is the teacher and how much is noise.'},
wordgap:{
 bio:'Multiply rates together: words an hour × hours a day × days × years.',
 honors:'See how a small error in each number grows when you multiply them all together.',
 ap:'Tell a measurement that’s off in one direction (bias) from one that just bounces around, and see how the margin of error shrinks as the sample grows.'},
yearlygrowth:{
 bio:'Find the steady yearly rate that turns a starting amount into an ending amount, using an nth root.',
 honors:'Write an nth root as a fraction exponent (an 8th root is the 1/8 power) and use it to find a yearly rate.',
 ap:'Use fraction exponents to build exponential models of growth over time.'},
zipscores:{
 bio:'Measure how tightly two things go together (r), and what share of the differences a line explains (r²).',
 honors:'Fit the best line, read r², and use the leftovers (residuals) to spot districts that beat the line.',
 ap:'Fit a line and read its leftovers, and see why a school’s average score and its students’ growth tell different stories.'},
/* Nov 17, 2026: the 73 tools that had no math line. */
areamodel:{
 bio:'See why making a square bigger on each side adds more than just the little corner piece.',
 honors:'Multiply two binomials by cutting a rectangle into four pieces and adding their areas.',
 ap:'Expand the product and see why the long strips matter more and more as the square gets bigger.'},
babysit:{
 bio:'Decide whether the average or the middle of the list is the fairer “typical” rate when one number is way off.',
 honors:'See why one extreme value drags the average but barely moves the middle, and which one to trust when data are lopsided.',
 ap:'Use the ordered list to find the rate that earns you the most for the nights you have free.'},
battery:{
 bio:'Read how fast your battery is falling right now, not an hour ago, and use it to forecast when it dies.',
 honors:'Find the rate right now as the slope of the tangent line, and use that line to predict.',
 ap:'Use the tangent line as an estimate, and tell from the curve’s bend whether it guesses too high or too low.'},
bottle:{
 bio:'Find how much a bottle holds by cutting it into thin round coins and adding up their volumes.',
 honors:'Add up thin disks (and rings, for a two-wall bottle) to find a volume.',
 ap:'Turn the sum of thinner and thinner disks into an integral that gives the exact volume.'},
breakeven:{
 bio:'Find how many sales it takes before the money coming in covers what you spent.',
 honors:'Write cost and revenue as lines and find where they cross.',
 ap:'Combine the two lines into one profit line and solve for any profit goal.'},
budget:{
 bio:'See how every limit (money, boxes, food) cuts down your choices, and why the best order sits at a corner.',
 honors:'Graph each limit as an inequality, shade the orders that work, and test the corners.',
 ap:'Find the corners by solving pairs of equations, and pick the best whole-number order nearby.'},
busroute:{
 bio:'Compare two bus routes by the typical morning and by how bad the bad mornings get.',
 honors:'Measure the middle and the spread of your times, and read both on a boxplot.',
 ap:'Choose the right measures when the data are lopsided, and find how often you would be late.'},
caffeine:{
 bio:'Track how caffeine leaves your body by half every few hours, not all at once.',
 honors:'Model the caffeine left with an exponential decay formula and the half-life.',
 ap:'Rewrite the decay in other forms (per hour, base e) and see where the curve heads over time.'},
caffeinedaily:{
 bio:'Add up a little caffeine left from each earlier day, and see why the total stops growing.',
 honors:'Add a pattern where each day keeps the same share of the day before.',
 ap:'Find the total an endless pattern settles at, and prove it settles.'},
camerapan:{
 bio:'See why the camera barely moves when the runner is far away and swings fast as she passes.',
 honors:'Link how fast the angle changes to how fast the runner moves, one rate times another.',
 ap:'Differentiate the angle formula to find the exact turning speed at any moment.'},
checkout:{
 bio:'Check that every order gets exactly one price, and only real orders get a price at all.',
 honors:'Decide what makes a rule a function, test it on a graph, and read function notation.',
 ap:'Find which orders the rule should accept, and undo the rule to go from a price back to an order.'},
cipher:{
 bio:'Treat a code as a rule on letters, and undo it step by step in reverse order.',
 honors:'See which codes can be undone (no two letters land on the same code letter) and what coding twice does.',
 ap:'Build the exact decoding rule and undo a two-step code in the right order.'},
coaster:{
 bio:'Make one smooth curve go down, through tunnels and just touch a pond, by choosing where it meets the ground.',
 honors:'Use zeros the track passes through and zeros it only touches to build the formula.',
 ap:'Fix the scale from one point, find the turning points, and see how the degree changes the ends.'},
concession:{
 bio:'Find when the line is longest: the moment people stop arriving faster than you serve them.',
 honors:'Build the line length by adding up arrivals minus service over time.',
 ap:'Write the line as an integral of the rates, then find its biggest value.'},
cooling:{
 bio:'See why hot food cools fast at first and slower and slower after.',
 honors:'Write a rule for how fast food cools based on how much hotter it is than the room, and see it on a slope field.',
 ap:'Solve that rule for the temperature at any time, and check it with small straight-line steps.'},
creditcard:{
 bio:'See why paying only the minimum takes years longer than most people expect.',
 honors:'Model the shrinking balance month by month as exponential decay.',
 ap:'Use logarithms to find how many months a fixed payment takes, and when it never ends.'},
datasize:{
 bio:'Turn gigabytes and megabits into a real download time without getting fooled by the units.',
 honors:'Write file sizes and speeds in scientific notation and divide by subtracting exponents.',
 ap:'Build the full time formula and catch the two common traps.'},
daylight:{
 bio:'Capture a whole year of changing daylight with one wave-shaped curve.',
 honors:'Read the four numbers that set a sine curve’s height, middle, length and starting point.',
 ap:'Build the sine model from the longest day, the shortest day and the year, then check how well it fits.'},
decibels:{
 bio:'See why a few extra decibels can cut your safe listening time in half.',
 honors:'Use the decibel formula, a logarithm, to compare how loud sounds really are.',
 ap:'Model safe listening time as an exponential, and undo it with a logarithm.'},
dish:{
 bio:'See why a dish shaped like a parabola sends every signal to one point.',
 honors:'Find the dish’s formula from where it meets a meter stick and how deep it is.',
 ap:'Locate the focus and show why every incoming ray bounces to it.'},
fontcurves:{
 bio:'See how every letter on your screen is drawn from curves set by just four points.',
 honors:'Write the curve as a moving weighted average of its four points.',
 ap:'Find the two middle points that make a curve pass where you want it.'},
formulas:{
 bio:'Write one rule that totals every order correctly, and see how the wrong order of steps breaks it.',
 honors:'Use letters for the price, count, fee and tax, and build the expression a store uses.',
 ap:'Rewrite the total as a line and read what the slope and starting value mean.'},
freethrow:{
 bio:'Set the top of the arc so the ball comes down through the rim.',
 honors:'Write the ball’s path in vertex form and use its symmetry.',
 ap:'Solve for where the arc must peak to pass through the rim, and see why higher arcs help.'},
fryshort:{
 bio:'Decide whether fries that come in light are bad luck or a real short.',
 honors:'Measure how far your average is from 4.1 oz in units of the typical wobble of an average.',
 ap:'Run a full one-sample t-test and say what the p-value means.'},
gps:{
 bio:'See how three distances from known towers pin down exactly one spot.',
 honors:'Write each tower’s circle as an equation and subtract them to find where they meet.',
 ap:'See how a tiny clock error throws the circles off, and why a fourth signal fixes it.'},
hoodies:{
 bio:'Use a bell curve to decide how many hoodies of each size to order.',
 honors:'Find the share in each size range from the normal curve, using z-scores.',
 ap:'Turn normal-curve areas into counts that add up to exactly 120.'},
insurance:{
 bio:'Decide whether a protection plan costs less over two years than taking your chances.',
 honors:'List every outcome with its chance and cost, and find the long-run average.',
 ap:'Compare the plans on average and on how much your real cost can swing.'},
lawnjob:{
 bio:'Use your past jobs to predict how long a new lawn will take, and price it.',
 honors:'Fit the line that makes the squared misses smallest, and read how tightly your jobs follow it.',
 ap:'Find a range of believable true slopes from only 15 jobs.'},
leadpass:{
 bio:'Throw to where the receiver will be, not where he is now.',
 honors:'Write the ball’s path and the receiver’s path as functions of time and find when they meet.',
 ap:'Use vectors for position and velocity to find speed and the angle of the ball.'},
logic:{
 bio:'See why flipping a true if-then rule around can make it false.',
 honors:'Write the three rewrites of a rule and find the one that is always as true as the original.',
 ap:'Use truth tables to prove which statements say the same thing.'},
logscale:{
 bio:'See exponential growth coming while the numbers are still small.',
 honors:'Read a log axis, where steady growth becomes a straight line, and find the growth factor from its slope.',
 ap:'Fit a line to the logs and solve for when the growth hits a target.'},
lootdrop:{
 bio:'Decide whether a game’s loot-crate counts are too far from the posted odds to be luck.',
 honors:'Add up how far each count is from what the odds predict, scaled by what you expected.',
 ap:'Run a full chi-square test and say whether the posted odds hold up.'},
lunchcount:{
 bio:'Count students on two rosters without counting anyone twice.',
 honors:'Use a two-way table for “or” and “given” questions.',
 ap:'Use the addition and conditional probability rules, and test whether two groups are independent.'},
matrices:{
 bio:'See how a game turns a character by multiplying each corner by a small grid of numbers.',
 honors:'Read where a matrix sends the basic arrows, and combine two moves by multiplying.',
 ap:'Multiply matrices in the right order, and use the determinant to see how area changes.'},
noisecancel:{
 bio:'See how headphones cancel noise by adding a second, opposite sound wave.',
 honors:'Shift a sine wave by half its period to flip it, and see when two waves cancel.',
 ap:'Find the size of the leftover noise when the timing is a little off.'},
openbox:{
 bio:'Find the corner cut that makes a folded box hold the most.',
 honors:'Write the volume as a cubic, find the cuts that make a real box, and read the top of the graph.',
 ap:'Use the derivative to find the exact best cut.'},
orbits:{
 bio:'See how an ellipse’s two special points shape whispering walls and satellite orbits.',
 honors:'Find where the foci sit from the ellipse’s length and width.',
 ap:'Use eccentricity to find how close and how far an orbit gets from the planet.'},
packaging:{
 bio:'Design a can that holds the same amount with the least metal.',
 honors:'Use the volume and surface area formulas to compare tall and short cans.',
 ap:'Find the exact best radius with the derivative, with and without a lid.'},
parking:{
 bio:'Decide whether straight or angled parking fits more cars.',
 honors:'Use the angles made when the curb cuts across parallel stall lines.',
 ap:'Use trig to find how much curb and aisle each stall angle takes.'},
passwords:{
 bio:'See why adding characters makes a password far stronger than you might think.',
 honors:'Count the possible passwords and measure strength in bits.',
 ap:'Use logarithms to compare length and symbol choices, and find how long to crack.'},
photofilter:{
 bio:'See how brightness, contrast and invert each change every pixel’s number.',
 honors:'Match each filter to a shift, stretch or flip of a function.',
 ap:'Build the one straight-line rule that stretches a photo’s darkest and brightest pixels to the full range.'},
pollmargin:{
 bio:'Decide whether 54% in a poll really means you are winning.',
 honors:'Read a poll as a range, and see why bigger samples give smaller margins.',
 ap:'Build a 95% interval for a proportion and check the conditions.'},
pondday:{
 bio:'Slide and stretch a known shape until it fits your data, then use it to predict.',
 honors:'Use shifts and stretches of parent functions to match the dots.',
 ap:'Add horizontal stretches and flips to fit any curve.'},
ramp:{
 bio:'See why a wheelchair ramp is much longer than most people guess.',
 honors:'Turn a slope into an angle with inverse tangent.',
 ap:'Find the angle and the sloped length from any slope, and when small-angle shortcuts work.'},
rapidtest:{
 bio:'See why a positive test can still often be a false alarm when an illness is rare.',
 honors:'Use a two-way table to find the chance you are sick given a positive test.',
 ap:'Use Bayes’ rule, then update again after a second test.'},
rideshare:{
 bio:'Find the trip length where the cheaper ride flips from one company to the other.',
 honors:'Read each fare as a line: the fixed fee is where it starts and the price per mile is its slope.',
 ap:'Set the two fares equal and solve for the tie point.'},
rotations:{
 bio:'Move a robot gripper by multiplying its position by one number.',
 honors:'See how multiplying by a complex number stretches and turns every point.',
 ap:'Use polar form to predict any turn and stretch at once.'},
rsvp:{
 bio:'Pick how many people to invite so the right number shows up.',
 honors:'Model who shows up as a binomial, and find the expected number and the spread.',
 ap:'Find the chance the crowd lands in your range, and when a bell curve can stand in.'},
runpace:{
 bio:'See how your running app figures out your speed “right now.”',
 honors:'Shrink the time between two positions until the average speed becomes your speed at an instant.',
 ap:'Define speed at an instant as a limit, and see why GPS error makes it tricky.'},
scaleit:{
 bio:'Use one known pair to scale a recipe or order to any size.',
 honors:'Set two ratios equal and solve.',
 ap:'Find the rate for one unit and let the units guide the setup.'},
screens:{
 bio:'Turn a TV’s diagonal size into the width and height you need.',
 honors:'Find distances on a grid with the Pythagorean theorem.',
 ap:'Find any screen’s width and height from its size and shape, and compare straight-line and street-grid distances.'},
shadow:{
 bio:'Find a tree’s height from two shadows and your own height.',
 honors:'Show the two triangles are similar and set up the proportion.',
 ap:'Connect the shadow ratio to the sun’s angle, and see how a small measuring error grows.'},
sharedwork:{
 bio:'See why two people together always beat the faster one alone, and why averaging their times is wrong.',
 honors:'Add what each person does per minute and set up the equation.',
 ap:'Solve for the time together, add a third worker, or work back to an unknown rate.'},
shortcut:{
 bio:'Find the fastest path to the car when part of the way is slow snow.',
 honors:'Write the total time as a function and find where its derivative is zero.',
 ap:'Confirm the minimum and compare it with the endpoints.'},
shotangle:{
 bio:'Find the spot on your run where the goal looks biggest.',
 honors:'Use circles through the two posts, where every point sees the goal at the same angle.',
 ap:'Find the exact best spot with a formula.'},
sincode:{
 bio:'Build sin(x) from just +, −, × and ÷ for a game with no math library.',
 honors:'Use the Maclaurin polynomial for sin and see where it matches well.',
 ap:'Bound the error so you know how many terms you need.'},
skidmarks:{
 bio:'See why doubling your speed makes braking distance four times as long.',
 honors:'Use a square root to find a car’s speed from its skid marks.',
 ap:'Model the total stopping distance and solve for the fastest safe speed.'},
slump:{
 bio:'Decide how bad a cold stretch must be before it means something is really wrong.',
 honors:'See how a shooter’s percent bounces around in short stretches and settles in long ones.',
 ap:'Use the spread of sample proportions to judge a slump.'},
speedlog:{
 bio:'Find how far you drove when your speed kept changing.',
 honors:'Add up slices of the speed graph in different ways.',
 ap:'Turn the sums into an integral and see when they over- or underestimate.'},
splitcost:{
 bio:'See why adding people cuts each share less and less.',
 honors:'Write the cost per person as a rational function and read its asymptotes.',
 ap:'Solve for the group size that hits a target cost.'},
sprinkler:{
 bio:'Find how much lawn a sprinkler waters when its spray reaches different distances.',
 honors:'Describe the spray as a polar curve and add up thin slices.',
 ap:'Use the polar area integral, including the area between two curves.'},
sprites:{
 bio:'Predict where a game character lands after it slides, flips or turns.',
 honors:'Use coordinate rules for each move, and see how order changes the result.',
 ap:'Add scaling and see how lengths and areas change.'},
studymethod:{
 bio:'Test whether practice quizzing beats rereading for a vocab quiz.',
 honors:'Ask how often random shuffling would make a gap this big.',
 ap:'Run a two-sample t-test and decide what the evidence shows.'},
survey:{
 bio:'See why asking the wrong people gives the wrong answer no matter how many you ask.',
 honors:'Tell bias (missing in one direction) from variability (bouncing around), and fix each.',
 ap:'Use random sampling and the spread of sample proportions.'},
testchoice:{
 bio:'Decide whether your ACT or SAT score looks stronger to a college.',
 honors:'Use z-scores to put two tests on one ruler.',
 ap:'Turn a score into a percentile with the normal curve.'},
ticketprice:{
 bio:'Find the ticket price that brings in the most money.',
 honors:'Write revenue as a quadratic in the price and find its vertex.',
 ap:'Find the best price exactly, and see how a cost per ticket shifts it.'},
tiling:{
 bio:'See why only triangles, squares and hexagons tile a floor on their own.',
 honors:'Use interior angles to test which polygons tile.',
 ap:'Compare how much edge each shape needs for the same area.'},
tires:{
 bio:'See why bigger tires make your speedometer read slow.',
 honors:'Use circumference to find your true speed.',
 ap:'Decode a tire size and find the exact speedometer error.'},
triangulate:{
 bio:'Find a fire from two towers that only know its direction.',
 honors:'Use two angles and the side between them to find the distances.',
 ap:'Use the laws of sines and cosines to locate the fire exactly.'},
truss:{
 bio:'See why bridges are built from triangles.',
 honors:'Use SSS to show a triangle can’t change shape while a square can.',
 ap:'Count the bars a frame needs to be rigid.'},
viewcurve:{
 bio:'Find the moment a video’s views were coming in fastest.',
 honors:'Find where the rate peaks and the curve switches how it bends.',
 ap:'Use the logistic model to find exactly when and how fast views peak.'},
warmup:{
 bio:'Set up a test that tells whether a new warm-up really makes you faster.',
 honors:'Spot what else could explain the difference, and use random assignment to rule it out.',
 ap:'Estimate the effect and test it by reshuffling the results.'},
windvectors:{
 bio:'Find how much to aim a drone into the wind to fly straight.',
 honors:'Add your own velocity and the wind’s, and cancel the sideways parts.',
 ap:'Find the exact correction angle and ground speed.'}
});
/* Course-terms lines for those 73 tools (they had no d.skills). Course placement comes from courses.js. Merged into the tool only when it has none of its own. */
BioLab.addSkills({
 areamodel:{bio:'Multiplying binomials with an area model · Algebra 1 (Unit 6)',honors:'Multiplying binomials: (x + a)(x + b) = x² + (a + b)x + ab · Algebra 1 (Unit 6)',ap:'Expanding products and comparing terms as x grows · Algebra 1 (Unit 6)'},
 babysit:{bio:'Mean vs. median · Statistics (Chapter 1), AP Statistics (Unit 1)',honors:'Resistant measures: the median vs. the mean in skewed data · Statistics (Chapter 1), AP Statistics (Unit 1)',ap:'Order statistics: the best rate as the Kth-highest value · Statistics (Chapter 1), AP Statistics (Unit 1)'},
 battery:{bio:'Rate of change from a graph · AP Calculus AB (Units 2 and 4), AP Calculus BC (Fall 2), Applied Calculus (Units 4 and 5)',honors:'The derivative as an instantaneous rate; tangent line forecasts · AP Calculus AB (Units 2 and 4), AP Calculus BC (Fall 2), Applied Calculus (Units 4 and 5)',ap:'Local linearization and concavity · AP Calculus AB (Units 2 and 4), AP Calculus BC (Fall 2), Applied Calculus (Units 4 and 5)'},
 bottle:{bio:'Volume by slicing into disks · AP Calculus AB (Unit 8), AP Calculus BC (Spring 2)',honors:'The disk and washer methods: Σ πr²Δx · AP Calculus AB (Unit 8), AP Calculus BC (Spring 2)',ap:'Volume of a solid of revolution: V = ∫ πr(x)² dx · AP Calculus AB (Unit 8), AP Calculus BC (Spring 2)'},
 breakeven:{bio:'Linear cost and revenue; the break-even point · Algebra 1 (Unit 5), Applied Calculus (Unit 1)',honors:'Systems of linear equations: C(n) = R(n) · Algebra 1 (Unit 5), Applied Calculus (Unit 1)',ap:'Profit as a linear function; solving for any goal · Algebra 1 (Unit 5), Applied Calculus (Unit 1)'},
 budget:{bio:'Constraints as regions on a graph · Algebra 1 (Unit 5)',honors:'Systems of linear inequalities and the feasible region · Algebra 1 (Unit 5)',ap:'Linear programming: optimizing at the corners · Algebra 1 (Unit 5)'},
 busroute:{bio:'Center and spread · Statistics (Chapter 1), AP Statistics (Unit 1)',honors:'Median, IQR, standard deviation, boxplots and outliers · Statistics (Chapter 1), AP Statistics (Unit 1)',ap:'Skewed distributions and tail probabilities · Statistics (Chapter 1), AP Statistics (Unit 1)'},
 caffeine:{bio:'Halving again and again · Algebra 2 (Unit 5), AP Precalculus (Unit 2A), Applied Calculus (Unit 2)',honors:'Exponential decay: A(t) = A₀(1/2)^(t/h) · Algebra 2 (Unit 5), AP Precalculus (Unit 2A), Applied Calculus (Unit 2)',ap:'Equivalent exponential forms, base e and limits · Algebra 2 (Unit 5), AP Precalculus (Unit 2A), Applied Calculus (Unit 2)'},
 caffeinedaily:{bio:'Adding leftovers that keep shrinking · AP Calculus BC (Fall 4)',honors:'Geometric series and partial sums · AP Calculus BC (Fall 4)',ap:'Convergent geometric series and the ratio test · AP Calculus BC (Fall 4)'},
 camerapan:{bio:'How one rate depends on another · AP Calculus AB (Units 3 and 4), AP Calculus BC (Fall 2, Spring 1), Applied Calculus (Unit 4)',honors:'The chain rule and related rates · AP Calculus AB (Units 3 and 4), AP Calculus BC (Fall 2, Spring 1), Applied Calculus (Unit 4)',ap:'Related rates with inverse trig: dθ/dt · AP Calculus AB (Units 3 and 4), AP Calculus BC (Fall 2, Spring 1), Applied Calculus (Unit 4)'},
 checkout:{bio:'Input and output: one price per order · Algebra 1 (Unit 3), Precalculus (Unit 1)',honors:'Functions, domain, the vertical line test and function notation · Algebra 1 (Unit 3), Precalculus (Unit 1)',ap:'Domain, range and inverse functions · Algebra 1 (Unit 3), Precalculus (Unit 1)'},
 cipher:{bio:'Functions and their inverses · Precalculus (Unit 1), AP Precalculus (Unit 2B)',honors:'One-to-one functions, composition and inverses (mod 26) · Precalculus (Unit 1), AP Precalculus (Unit 2B)',ap:'Modular inverses; inverse of a composition · Precalculus (Unit 1), AP Precalculus (Unit 2B)'},
 coaster:{bio:'Shaping a curve with its zeros · Algebra 2 (Unit 3), Precalculus (Unit 2), AP Precalculus (Unit 1A)',honors:'Factored polynomials, zeros and multiplicity · Algebra 2 (Unit 3), Precalculus (Unit 2), AP Precalculus (Unit 1A)',ap:'Polynomial end behavior, degree and turning points · Algebra 2 (Unit 3), Precalculus (Unit 2), AP Precalculus (Unit 1A)'},
 concession:{bio:'Rates in and rates out · AP Calculus AB (Units 6 and 8), AP Calculus BC (Fall 3, Spring 2), Applied Calculus (Unit 7)',honors:'Accumulation of a rate; the Fundamental Theorem of Calculus · AP Calculus AB (Units 6 and 8), AP Calculus BC (Fall 3, Spring 2), Applied Calculus (Unit 7)',ap:'Accumulation functions: L(x) = L(a) + ∫ (A − S) dt · AP Calculus AB (Units 6 and 8), AP Calculus BC (Fall 3, Spring 2), Applied Calculus (Unit 7)'},
 cooling:{bio:'Cooling fastest when hottest · AP Calculus AB (Unit 7), AP Calculus BC (Spring 4)',honors:'Newton’s law of cooling as a differential equation; slope fields · AP Calculus AB (Unit 7), AP Calculus BC (Spring 4)',ap:'Separation of variables and Euler’s method · AP Calculus AB (Unit 7), AP Calculus BC (Spring 4)'},
 creditcard:{bio:'Interest on what you still owe · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2A), Applied Calculus (Unit 2)',honors:'Exponential decay and geometric sequences · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2A), Applied Calculus (Unit 2)',ap:'Solving for time with logarithms: n = −ln(1 − rB/P) ÷ ln(1 + r) · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2A), Applied Calculus (Unit 2)'},
 datasize:{bio:'Unit conversions with powers of ten · Algebra 1 (Unit 8)',honors:'Scientific notation and exponent rules · Algebra 1 (Unit 8)',ap:'Unit analysis: bits vs. bytes, decimal vs. binary units · Algebra 1 (Unit 8)'},
 daylight:{bio:'Patterns that repeat · Algebra 2 (Trig), Precalculus (Units 4 and 5), AP Precalculus (Unit 3A)',honors:'Sinusoids: amplitude, midline, period and phase shift · Algebra 2 (Trig), Precalculus (Units 4 and 5), AP Precalculus (Unit 3A)',ap:'Fitting a sinusoidal model from max, min and period · Algebra 2 (Trig), Precalculus (Units 4 and 5), AP Precalculus (Unit 3A)'},
 decibels:{bio:'Each 10 dB is 10 times the energy · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2B), Applied Calculus (Unit 2)',honors:'Logarithmic scales: dB = 10 log₁₀(I/I₀) · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2B), Applied Calculus (Unit 2)',ap:'Exponential models and their inverses: T(L) = 480 ÷ 2^((L − 85)/3) · Algebra 2 (Unit 5), Precalculus (Unit 6), AP Precalculus (Unit 2B), Applied Calculus (Unit 2)'},
 dish:{bio:'Why a parabola focuses signals · Algebra 2 (Unit 2)',honors:'Quadratics in factored and vertex form · Algebra 2 (Unit 2)',ap:'The focus of a parabola: p = 1 ÷ (4a), and the reflection property · Algebra 2 (Unit 2)'},
 fontcurves:{bio:'Curves pulled by control points',honors:'Cubic Bézier curves as weighted averages of points',ap:'Parametric cubics; solving a 2 × 2 system for control points'},
 formulas:{bio:'Order of operations in a real rule · Algebra 1 (Units 1, 2 and 3)',honors:'Variables and expressions: (p × n + F) × (1 + r) · Algebra 1 (Units 1, 2 and 3)',ap:'Linear functions: slope and intercept in context · Algebra 1 (Units 1, 2 and 3)'},
 freethrow:{bio:'The shape of a parabola · Algebra 1 (Unit 7), Algebra 2 (Unit 2), Applied Calculus (Unit 1)',honors:'Vertex form and the axis of symmetry · Algebra 1 (Unit 7), Algebra 2 (Unit 2), Applied Calculus (Unit 1)',ap:'Solving for the vertex from two points · Algebra 1 (Unit 7), Algebra 2 (Unit 2), Applied Calculus (Unit 1)'},
 fryshort:{bio:'Is a difference just luck? · AP Statistics (Unit 7)',honors:'The one-sample t statistic and standard error · AP Statistics (Unit 7)',ap:'One-sample t-test for a mean · AP Statistics (Unit 7)'},
 gps:{bio:'Distance as a circle · Geometry (Circles)',honors:'Equations of circles; subtracting to get lines · Geometry (Circles)',ap:'Systems of circle equations; clock error and a fourth signal · Geometry (Circles)'},
 hoodies:{bio:'The bell curve · Statistics (Chapter 2), AP Statistics (Unit 1)',honors:'Normal models and z-scores · Statistics (Chapter 2), AP Statistics (Unit 1)',ap:'Normal probabilities with normalcdf; rounding counts to a total · Statistics (Chapter 2), AP Statistics (Unit 1)'},
 insurance:{bio:'Average cost over many outcomes · Statistics (Chapter 6), AP Statistics (Unit 4)',honors:'Random variables and expected value · Statistics (Chapter 6), AP Statistics (Unit 4)',ap:'Expected value and standard deviation of a random variable · Statistics (Chapter 6), AP Statistics (Unit 4)'},
 lawnjob:{bio:'A best-fit line to predict · Statistics (Chapter 3), AP Statistics (Units 2 and 9)',honors:'Least-squares regression, r and r² · Statistics (Chapter 3), AP Statistics (Units 2 and 9)',ap:'Inference for slope: a t-interval for b · Statistics (Chapter 3), AP Statistics (Units 2 and 9)'},
 leadpass:{bio:'Throwing to where someone will be · AP Calculus BC (Spring 3)',honors:'Parametric equations for motion · AP Calculus BC (Spring 3)',ap:'Vector-valued functions: position, velocity and speed · AP Calculus BC (Spring 3)'},
 logic:{bio:'If-then statements · Geometry (Unit 2)',honors:'Conditionals: converse, inverse and contrapositive · Geometry (Unit 2)',ap:'Truth tables and logical equivalence · Geometry (Unit 2)'},
 logscale:{bio:'Spotting doubling early · Precalculus (Unit 6), AP Precalculus (Units 2A and 2B), Applied Calculus (Unit 2)',honors:'Log scales and exponential growth · Precalculus (Unit 6), AP Precalculus (Units 2A and 2B), Applied Calculus (Unit 2)',ap:'Linearizing with logs and solving N₀·bᵗ = target · Precalculus (Unit 6), AP Precalculus (Units 2A and 2B), Applied Calculus (Unit 2)'},
 lootdrop:{bio:'Do the counts match the posted odds? · AP Statistics (Unit 8)',honors:'The chi-square statistic · AP Statistics (Unit 8)',ap:'Chi-square goodness-of-fit test · AP Statistics (Unit 8)'},
 lunchcount:{bio:'Counting overlaps once · Geometry (Probability), Statistics (Chapter 5), AP Statistics (Units 2 and 4)',honors:'Two-way tables, the addition rule and conditional probability · Geometry (Probability), Statistics (Chapter 5), AP Statistics (Units 2 and 4)',ap:'The general addition rule, conditional probability and independence · Geometry (Probability), Statistics (Chapter 5), AP Statistics (Units 2 and 4)'},
 matrices:{bio:'A grid of numbers that moves a shape · AP Precalculus (Unit 4)',honors:'2×2 matrices as transformations; composition by multiplication · AP Precalculus (Unit 4)',ap:'Matrix multiplication, composition order and determinants · AP Precalculus (Unit 4)'},
 noisecancel:{bio:'Waves that add and cancel · Algebra 2 (Trig), Precalculus (Unit 5), AP Precalculus (Unit 3A)',honors:'Phase shifts and amplitude of sine waves · Algebra 2 (Trig), Precalculus (Unit 5), AP Precalculus (Unit 3A)',ap:'Sum of sinusoids; timing error as phase error · Algebra 2 (Trig), Precalculus (Unit 5), AP Precalculus (Unit 3A)'},
 openbox:{bio:'The biggest box from a flat sheet · Algebra 2 (Unit 3), AP Precalculus (Unit 1A), Applied Calculus (Unit 6)',honors:'Cubic functions, zeros and domain · Algebra 2 (Unit 3), AP Precalculus (Unit 1A), Applied Calculus (Unit 6)',ap:'Optimization with V′(x) = 0 · Algebra 2 (Unit 3), AP Precalculus (Unit 1A), Applied Calculus (Unit 6)'},
 orbits:{bio:'The ellipse and its two foci · AP Precalculus (Unit 4)',honors:'Ellipses: a, b and c² = a² − b² · AP Precalculus (Unit 4)',ap:'Eccentricity; closest and farthest points of an orbit · AP Precalculus (Unit 4)'},
 packaging:{bio:'Same volume, less material · Geometry (Solids), Applied Calculus (Unit 6)',honors:'Volume and surface area of cylinders · Geometry (Solids), Applied Calculus (Unit 6)',ap:'Optimization: minimizing A(r) = 2πr² + 2V/r · Geometry (Solids), Applied Calculus (Unit 6)'},
 parking:{bio:'Parallel lines and angles in a lot · Geometry (Unit 3)',honors:'Parallel lines cut by a transversal; corresponding angles · Geometry (Unit 3)',ap:'Trig with stall angles: curb length w ÷ sin θ · Geometry (Unit 3)'},
 passwords:{bio:'Counting possibilities · Algebra 2 (Unit 5), AP Precalculus (Unit 2B)',honors:'Counting principle and bits: N^L · Algebra 2 (Unit 5), AP Precalculus (Unit 2B)',ap:'Logarithms: bits = L·log₂ N, solving for length or symbols · Algebra 2 (Unit 5), AP Precalculus (Unit 2B)'},
 photofilter:{bio:'A filter is a rule on numbers · Algebra 2 (Unit 1), Precalculus (Unit 1)',honors:'Function transformations: shifts, stretches and reflections · Algebra 2 (Unit 1), Precalculus (Unit 1)',ap:'Building a linear map from two points · Algebra 2 (Unit 1), Precalculus (Unit 1)'},
 pollmargin:{bio:'Plus or minus: the margin of error · AP Statistics (Unit 6)',honors:'Confidence intervals for a proportion · AP Statistics (Unit 6)',ap:'One-proportion z-interval and its conditions · AP Statistics (Unit 6)'},
 pondday:{bio:'Fitting a shape to data · Algebra 2 (Unit 1), Precalculus (Unit 1)',honors:'Transformations of parent functions: a·f(x − h) + k · Algebra 2 (Unit 1), Precalculus (Unit 1)',ap:'Horizontal stretches and reflections: a·f(b(x − h)) + k · Algebra 2 (Unit 1), Precalculus (Unit 1)'},
 ramp:{bio:'Slope as rise over run · Geometry (Right triangles), Precalculus (Unit 3)',honors:'Slope as tangent; inverse tangent for angles · Geometry (Right triangles), Precalculus (Unit 3)',ap:'Slope, angle and length: run · √(1 + m²) · Geometry (Right triangles), Precalculus (Unit 3)'},
 rapidtest:{bio:'Picturing 10,000 people · Geometry (Probability), Statistics (Chapter 5), AP Statistics (Unit 4)',honors:'Conditional probability: base rate, sensitivity and specificity · Geometry (Probability), Statistics (Chapter 5), AP Statistics (Unit 4)',ap:'Bayes’ rule; updating with a second test · Geometry (Probability), Statistics (Chapter 5), AP Statistics (Unit 4)'},
 rideshare:{bio:'Comparing two pricing plans · Algebra 1 (Units 3 and 4), Applied Calculus (Unit 1)',honors:'Linear functions: slope and y-intercept · Algebra 1 (Units 3 and 4), Applied Calculus (Unit 1)',ap:'Solving for the intersection of two lines · Algebra 1 (Units 3 and 4), Applied Calculus (Unit 1)'},
 rotations:{bio:'Turning with one multiplication · Precalculus (Unit 0), AP Precalculus (Unit 3B)',honors:'Complex multiplication as a stretch and a rotation · Precalculus (Unit 0), AP Precalculus (Unit 3B)',ap:'Polar form: moduli multiply, arguments add · Precalculus (Unit 0), AP Precalculus (Unit 3B)'},
 rsvp:{bio:'How many show up? · Statistics (Chapter 6), AP Statistics (Unit 4)',honors:'Binomial distributions: mean np and SD √(np(1 − p)) · Statistics (Chapter 6), AP Statistics (Unit 4)',ap:'Binomial probabilities and the normal approximation · Statistics (Chapter 6), AP Statistics (Unit 4)'},
 runpace:{bio:'Speed from two positions · AP Calculus AB (Units 1 and 2), AP Calculus BC (Fall 1, Fall 2), Applied Calculus (Units 3 and 4)',honors:'Secant and tangent slopes · AP Calculus AB (Units 1 and 2), AP Calculus BC (Fall 1, Fall 2), Applied Calculus (Units 3 and 4)',ap:'The derivative as a limit of difference quotients · AP Calculus AB (Units 1 and 2), AP Calculus BC (Fall 1, Fall 2), Applied Calculus (Units 3 and 4)'},
 scaleit:{bio:'Scaling with proportions · Algebra 1 (Unit 2)',honors:'Proportions and cross-multiplication · Algebra 1 (Unit 2)',ap:'Unit rates and dimensional analysis · Algebra 1 (Unit 2)'},
 screens:{bio:'Right triangles and size · Geometry (Unit 1)',honors:'The distance formula as the Pythagorean theorem · Geometry (Unit 1)',ap:'Width and height from a diagonal and aspect ratio · Geometry (Unit 1)'},
 shadow:{bio:'Same shape, different size · Geometry (Triangles)',honors:'Similar triangles by AA; proportional sides · Geometry (Triangles)',ap:'Similarity and tangent; measurement error · Geometry (Triangles)'},
 sharedwork:{bio:'Working together · Algebra 2 (Unit 6), AP Precalculus (Unit 1B)',honors:'Work-rate problems and rational equations · Algebra 2 (Unit 6), AP Precalculus (Unit 1B)',ap:'Solving 1/a + 1/b = 1/t · Algebra 2 (Unit 6), AP Precalculus (Unit 1B)'},
 shortcut:{bio:'The fastest route · AP Calculus AB (Unit 5), AP Calculus BC (Spring 1), Applied Calculus (Unit 6)',honors:'Optimization: T′(x) = 0 · AP Calculus AB (Unit 5), AP Calculus BC (Spring 1), Applied Calculus (Unit 6)',ap:'The second-derivative test and endpoints · AP Calculus AB (Unit 5), AP Calculus BC (Spring 1), Applied Calculus (Unit 6)'},
 shotangle:{bio:'Where the goal looks widest · Geometry (Circles)',honors:'The inscribed angle theorem · Geometry (Circles)',ap:'Maximizing the angle: y* = √(c² − a²) · Geometry (Circles)'},
 sincode:{bio:'A polynomial that copies sin · AP Calculus BC (Fall 5)',honors:'Maclaurin polynomials · AP Calculus BC (Fall 5)',ap:'Alternating series error bounds and Lagrange error · AP Calculus BC (Fall 5)'},
 skidmarks:{bio:'Speed and stopping distance · Algebra 1 (Unit 8), Algebra 2 (Unit 4)',honors:'Square roots: S = √(30df) · Algebra 1 (Unit 8), Algebra 2 (Unit 4)',ap:'Quadratic models: total stopping distance · Algebra 1 (Unit 8), Algebra 2 (Unit 4)'},
 slump:{bio:'Luck in short stretches · Statistics (Chapter 7), AP Statistics (Unit 5)',honors:'Sampling distributions of a proportion · Statistics (Chapter 7), AP Statistics (Unit 5)',ap:'Mean and SD of p̂; the normal condition · Statistics (Chapter 7), AP Statistics (Unit 5)'},
 speedlog:{bio:'Distance from changing speed · AP Calculus AB (Unit 6), AP Calculus BC (Fall 3), Applied Calculus (Unit 7)',honors:'Riemann sums: left, right, midpoint and trapezoid · AP Calculus AB (Unit 6), AP Calculus BC (Fall 3), Applied Calculus (Unit 7)',ap:'The definite integral as a limit of Riemann sums · AP Calculus AB (Unit 6), AP Calculus BC (Fall 3), Applied Calculus (Unit 7)'},
 splitcost:{bio:'Splitting shared and personal costs · Algebra 2 (Unit 6), Precalculus (Unit 2), AP Precalculus (Unit 1B), Applied Calculus (Unit 1)',honors:'Rational functions and asymptotes: v + F/n · Algebra 2 (Unit 6), Precalculus (Unit 2), AP Precalculus (Unit 1B), Applied Calculus (Unit 1)',ap:'Solving rational equations; diminishing returns · Algebra 2 (Unit 6), Precalculus (Unit 2), AP Precalculus (Unit 1B), Applied Calculus (Unit 1)'},
 sprinkler:{bio:'Area from pie slices · AP Calculus BC (Spring 3)',honors:'Polar curves and polar Riemann sums · AP Calculus BC (Spring 3)',ap:'Polar area: ½∫ r(θ)² dθ · AP Calculus BC (Spring 3)'},
 sprites:{bio:'Moving points on a grid · Geometry (Transformations)',honors:'Translations, reflections and rotations as coordinate rules · Geometry (Transformations)',ap:'Dilations and compositions of transformations · Geometry (Transformations)'},
 studymethod:{bio:'Comparing two groups · AP Statistics (Unit 7)',honors:'Randomization and the difference of means · AP Statistics (Unit 7)',ap:'Two-sample t-test · AP Statistics (Unit 7)'},
 survey:{bio:'Who you ask matters · Statistics (Chapter 4), AP Statistics (Unit 3)',honors:'Bias vs. variability; random sampling · Statistics (Chapter 4), AP Statistics (Unit 3)',ap:'Simple random samples and the sampling distribution of p̂ · Statistics (Chapter 4), AP Statistics (Unit 3)'},
 testchoice:{bio:'Comparing scores on different scales · Statistics (Chapter 2), AP Statistics (Unit 1)',honors:'z-scores: standardizing · Statistics (Chapter 2), AP Statistics (Unit 1)',ap:'Percentiles from the normal curve · Statistics (Chapter 2), AP Statistics (Unit 1)'},
 ticketprice:{bio:'The price that brings in the most · Algebra 1 (Unit 7), Algebra 2 (Unit 2), Applied Calculus (Units 1 and 6)',honors:'Revenue as a quadratic; the vertex · Algebra 1 (Unit 7), Algebra 2 (Unit 2), Applied Calculus (Units 1 and 6)',ap:'Maximizing R(p) from zeros or the vertex formula · Algebra 1 (Unit 7), Algebra 2 (Unit 2), Applied Calculus (Units 1 and 6)'},
 tiling:{bio:'Shapes that fit with no gaps · Geometry (Polygons)',honors:'Interior angles of regular polygons · Geometry (Polygons)',ap:'Perimeter vs. area for regular polygons · Geometry (Polygons)'},
 tires:{bio:'Circumference and speed · Geometry (Circles)',honors:'Circumference and proportional change · Geometry (Circles)',ap:'Tire size codes and percent error · Geometry (Circles)'},
 triangulate:{bio:'Two directions, one spot · Precalculus (Unit 3)',honors:'ASA and the law of sines · Precalculus (Unit 3)',ap:'Law of sines and law of cosines · Precalculus (Unit 3)'},
 truss:{bio:'Why triangles are rigid · Geometry (Triangles)',honors:'SSS congruence and rigidity · Geometry (Triangles)',ap:'Counting bars for rigidity: 2j − 3 · Geometry (Triangles)'},
 viewcurve:{bio:'When growth is fastest · AP Calculus AB (Unit 5), AP Calculus BC (Spring 1), Applied Calculus (Unit 5)',honors:'First and second derivatives; inflection points · AP Calculus AB (Unit 5), AP Calculus BC (Spring 1), Applied Calculus (Unit 5)',ap:'The logistic model and its peak rate · AP Calculus AB (Unit 5), AP Calculus BC (Spring 1), Applied Calculus (Unit 5)'},
 warmup:{bio:'Designing a fair test · Statistics (Chapter 4), AP Statistics (Unit 3)',honors:'Confounding and random assignment · Statistics (Chapter 4), AP Statistics (Unit 3)',ap:'Randomized experiments and randomization distributions · Statistics (Chapter 4), AP Statistics (Unit 3)'},
 windvectors:{bio:'Aiming into the wind · AP Precalculus (Unit 4)',honors:'Adding vectors: ground = air + wind · AP Precalculus (Unit 4)',ap:'Wind correction angle and ground speed · AP Precalculus (Unit 4)'}
});
