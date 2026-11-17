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
 ap:'Fit a line and read its leftovers, and see why a school’s average score and its students’ growth tell different stories.'}
});
