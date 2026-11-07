BioLab.addPractical({
schedule:{
 hook:'You manage a small cafe with 7 baristas. Scheduling software builds the cheapest week that covers the customer forecast, including a rainy Wednesday and a Friday home football game. Its schedule has baristas closing at 10 pm and opening again before 8 am. What would it cost per week to ban that “clopening,” so everyone gets at least 10 hours between shifts?',
 answer:'$0. The cheapest week costs $3,968 either way: the optimizer only has to change who opens, and the shortest rest goes from 7 hours to at least 10. Clopening happened because nothing in the software’s goal said rest mattered. The rule that does cost money is posting the schedule a week ahead: $288 a week, because the cafe must cover rain on every day it might fall.',
 uses:[
  'Retail and restaurant scheduling: large chains use workforce-management software that forecasts customer traffic hour by hour and builds shifts to match. What the software is told to minimize decides what workers’ weeks look like.',
  'Fair workweek laws: Seattle’s 2017 secure scheduling ordinance requires covered employers to post schedules in advance. Shift Project researchers found that afterward more workers got two weeks’ notice and their sleep quality improved.',
  'Your own job: if you work at a store or restaurant, your shifts likely come from a forecast like this one. Knowing the rules you can ask for (rest between shifts, schedules posted ahead) starts with knowing what they cost.'
 ],
 takeaway:'An optimizer gives you exactly what its goal asks for. The price of a fairness rule is how much the cheapest schedule rises when you add it, and it is often far smaller than people assume.'
}
});
