BioLab.addPractical({
budget:{
 hook:'The team dinner is on you. You have $150. A large pizza costs $12 and feeds 4 people; a tray of wings costs $18 and feeds 5. The shop delivers at most 10 boxes, and you need enough for at least 30 people. What should you order to feed as many people as you can?',
 answer:'5 pizzas and 5 trays of wings: exactly $150 and 10 boxes, enough for 45 people. All pizza runs out of boxes at 40 people, and all wings runs out of money at 40. A gut order of 6 pizzas and 2 trays feeds 34 for $108; the corner order uses the rest of the budget to feed 11 more people.',
 uses:[
  'Airlines build crew schedules with linear and integer programming: which pilots and flight attendants cover which flights, following rest rules, at the lowest cost.',
  'Oil refineries were among the first big businesses to use linear programming, in the 1950s, to decide how to blend crude oil into gasoline and other fuels within the limits of their equipment.',
  'Animal feed mills use linear programming to mix grains and supplements that meet an animal’s nutrition needs at the lowest cost. The industry calls it least-cost formulation.'
 ],
 takeaway:'Each limit is a linear inequality, and together they make a feasible region. The best order sits at a corner of that region, so you only have to check the corners.'
}
});
