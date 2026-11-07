BioLab.addPractical({
lunchcount:{
 hook:'You are on student council, and the school is giving a free $10 boxed lunch to every sophomore who played a fall sport or was in a club this semester. The coaches’ rosters list 104 sophomores, the club moderators’ rosters list 92, and when you match names, 38 sophomores are on both lists. How many lunches should you order?',
 answer:{bio:'158 lunches. Adding the two rosters gives 196, but that counts the 38 sophomores on both lists twice: 196 − 38 = 158. In the table, 66 play only a fall sport, 54 are only in a club, and 38 do both. Order 196 and 38 lunches go to waste, $380 of food nobody eats.',
  honors:'158 lunches: 104 + 92 − 38, the addition rule. Ordering 196 wastes 38 lunches, $380. The same table answers a second question: 36.5% of athletes are in a club, against 41.8% of the whole grade, so for these sophomores sport and club are not independent.'},
 uses:[
  'Advertising reach: when a business runs the same ad on two platforms, it cannot add the two audiences to find how many different people saw it. Media planners subtract the people who saw it on both and call what is left the unduplicated reach.',
  'Poll crosstabs: election polls publish tables that split every answer by group, such as age or region. Each group’s row of percents is a conditional distribution: the share giving each answer, given that group.',
  'Medical studies: to see whether something like smoking is linked to a disease, researchers compare the disease rate among people who were exposed with the rate among people who were not. Those are two conditional probabilities, and the ratio between them is called the relative risk.'
 ],
 takeaway:'To count “this or that”, add the two groups and take the overlap out once. To ask whether two things are related, restrict to one row of the table, divide by that row’s total, and compare with the whole group.'
}
});
