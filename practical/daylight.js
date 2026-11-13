BioLab.addPractical({
daylight:{
 hook:{bio:'You do yard work for neighbors after school: mowing in summer, raking in fall, shoveling in winter. You can only work while it is light, so you want to know the hours of daylight on any day. In Denver they run from about 9 h 20 min in late December to about 15 h in late June, and the pattern repeats every year. Can one smooth curve give the daylight for every day?',honors:'You do yard work for neighbors after school and can only work while it is light. Denver’s days run from about 9 h 20 min in late December to about 15 h in late June, and the pattern repeats every year. You want one equation that gives the hours of daylight on any day. Can a curve built from just four numbers do it?'},
 answer:{bio:'Almost exactly. A curve with a middle level of 12.17 hours and a swing of 2.82 hours, peaking on June 22, misses Denver’s real daylight by about 4 minutes on an average day and about 12 minutes on its worst day.',honors:'Almost exactly. y = 2.82 sin((2π/365)(t − 81.75)) + 12.17, with t the day of the year, misses Denver’s real daylight by about 4 minutes on an average day and about 12 minutes on its worst day.'},
 uses:[
  '<b>Do:</b> if your family looks at solar panels, ask for the month-by-month output estimate, not just the yearly total. <b>Why:</b> panels get far fewer hours of sun in winter. In Denver, a late-December day has about 5 h 38 min less daylight than a late-June day.',
  '<b>Do:</b> before you kayak or walk a tide flat, check NOAA’s tide table. <b>Why:</b> NOAA predicts tides by adding many sine waves, each with its own amplitude, period and phase shift. In many places the biggest repeats every 12.42 hours.',
  '<b>Do:</b> run big appliances outside the late-afternoon peak when your utility asks. <b>Why:</b> power use rises and falls in daily and yearly cycles, and grid operators forecast those patterns to decide which plants to run.'
 ],
 takeaway:{bio:'Anything that repeats smoothly can be modeled with a sine curve. The longest and shortest values give its middle level and its swing, and the length of one cycle and the date of the peak set its timing.',honors:'Anything that repeats smoothly can be modeled with y = A sin(B(t − C)) + D. The max and min give the amplitude and midline, the period gives B, and the timing of the peak gives C.'}
}
});
