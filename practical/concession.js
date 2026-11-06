BioLab.addPractical({
concession:{
 hook:'Your club is running the concession stand at Friday’s home football game, and you have 4 volunteers. Fans pour in before kickoff and again at halftime. When will the line be longest, and how long will it get?',
 answer:'At about 8:20 PM, with about 52 people in line, seven minutes after arrivals peak. The line keeps growing until fans arrive no faster than your 4 volunteers serve them.',
 uses:[
  'Emergency rooms and clinics plan nurse staffing from hourly arrival patterns: the waiting room fills whenever patients arrive faster than staff can see them, the same rate-in, rate-out balance.',
  'Traffic engineers time on-ramp meters and signals from car arrival rates: a queue grows whenever cars arrive faster than the road lets them through, and the backup is the accumulated difference.',
  'Water utilities track a reservoir or a storage tank as inflow minus outflow added up over time, and the level peaks exactly when outflow catches up with inflow.'
 ],
 takeaway:'An amount that adds up a rate in minus a rate out is greatest when the two rates are equal, with the rate in falling below the rate out. Not when the rate in peaks.'
}
});
