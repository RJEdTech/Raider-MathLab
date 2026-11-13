BioLab.addPractical({
concession:{
 hook:'Your club is running the concession stand at Friday’s home football game, and you have 4 volunteers. Fans pour in before kickoff and again at halftime. When will the line be longest, and how long will it get?',
 answer:'At about 8:20 PM, with about 52 people in line, seven minutes after arrivals peak. The line keeps growing until fans arrive no faster than your 4 volunteers serve them.',
 uses:[
  '<b>Do:</b> when you run a concession stand, add a second register before the halftime rush, not during it. <b>Why:</b> the line grows whenever people arrive faster than you serve them, and the backup is the accumulated difference. Emergency rooms plan nurse staffing from hourly arrival patterns the same way.',
  '<b>Do:</b> wait your turn at an on-ramp meter. <b>Why:</b> traffic engineers time meters and signals from car arrival rates: a queue grows whenever cars arrive faster than the road lets them through.',
  '<b>Do:</b> when you track anything that fills and drains (a tank, a budget, a line), find when outflow catches up with inflow. <b>Why:</b> water utilities track reservoirs as inflow minus outflow over time, and the level peaks exactly then.'
 ],
 takeaway:'An amount that adds up a rate in minus a rate out is greatest when the two rates are equal, with the rate in falling below the rate out. Not when the rate in peaks.'
}
});
