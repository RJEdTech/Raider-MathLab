BioLab.addPractical({
lunchcount:{
 hook:'You are on student council, and the school is giving a free $10 boxed lunch to every sophomore who played a fall sport or was in a club this semester. The coaches’ rosters list 104 sophomores, the club moderators’ rosters list 92, and when you match names, 38 sophomores are on both lists. How many lunches should you order?',
 answer:{bio:'158 lunches. Adding the two rosters gives 196, but that counts the 38 sophomores on both lists twice: 196 − 38 = 158. In the table, 66 play only a fall sport, 54 are only in a club, and 38 do both. Order 196 and 38 lunches go to waste, $380 of food nobody eats.',
  honors:'158 lunches: 104 + 92 − 38, the addition rule. Ordering 196 wastes 38 lunches, $380. The same table answers a second question: 36.5% of athletes are in a club, against 41.8% of the whole grade, so for these sophomores sport and club are not independent.'},
 uses:[
  '<b>Do:</b> when you plan food or shirts for an event from two sign-up lists, match names first and subtract the people on both lists. <b>Why:</b> adding the lists counts those people twice. Here, 104 + 92 would order 38 extra $10 lunches: $380 wasted.',
  '<b>Do:</b> when a headline says “X% of people who did A also did B,” ask which group the percent is out of. <b>Why:</b> P(B given A) and P(A given B) use different circles. In this lunch, 37% of athletes are in clubs, but 41% of club members are athletes: same 38 students, different denominators.',
  '<b>Do:</b> when two ads, two apps or two newsletters “reach” an audience, don’t add the audiences to find how many different people they reached. <b>Why:</b> media planners subtract the overlap and call what is left the unduplicated reach. It is the same addition rule as this Venn diagram.'
 ],
 takeaway:'To count “this or that”, add the two groups and take the overlap out once. To ask whether two things are related, restrict to one row of the table, divide by that row’s total, and compare with the whole group.'
}
});
