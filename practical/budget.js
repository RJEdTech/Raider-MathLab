BioLab.addPractical({
budget:{
 hook:'The team dinner is on you. You have $150. A large pizza costs $12 and feeds 4 people; a tray of wings costs $18 and feeds 5. The shop delivers at most 10 boxes, and you need enough for at least 30 people. What should you order to feed as many people as you can?',
 answer:'5 pizzas and 5 trays of wings: exactly $150 and 10 boxes, enough for 45 people. All pizza runs out of boxes at 40 people, and all wings runs out of money at 40. A gut order of 6 pizzas and 2 trays feeds 34 for $108; the corner order uses the rest of the budget to feed 11 more people.',
 uses:[
  '<b>Do:</b> when a plan has a “most” or “least” and several limits (money, boxes, seats), write each limit as an inequality and check the corner orders before you guess. <b>Why:</b> the best answer of a linear problem sits at a corner of the region where every limit holds. Airlines build crew schedules the same way, with linear and integer programming, to cover every flight within rest rules at the lowest cost.',
  '<b>Do:</b> compare options by what one dollar buys: people fed per dollar, servings per dollar, miles per dollar. <b>Why:</b> a pizza feeds 4 for $12 ($3 a person) and wings feed 5 for $18 ($3.60 a person). Animal feed mills do this at scale; the industry calls it least-cost formulation, and it was one of the first big business uses of linear programming, along with blending fuels at oil refineries in the 1950s.',
  '<b>Do:</b> before you buy more of one thing, find which limit you hit first. <b>Why:</b> all pizza runs out of boxes at 40 people, and all wings runs out of money at 40. Mixing the two uses both limits fully and feeds 45. Loosening the limit that is not stopping you changes nothing.'
 ],
 takeaway:'Each limit is a linear inequality, and together they make a feasible region. The best order sits at a corner of that region, so you only have to check the corners.'
}
});
