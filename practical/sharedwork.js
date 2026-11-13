BioLab.addPractical({
sharedwork:{
 hook:'A neighbor pays you and a friend to paint a fence. You could do it alone in 3 hours; your friend, newer at it, would take 5 hours. You start together at 9:00 AM. What time should you tell the neighbor you will be done?',
 answer:'At about 10:52 AM. Together you paint 1/3 + 1/5 = 8/15 of the fence per hour, so the job takes 15/8 hours, or 1 hour 52.5 minutes. Averaging the times gives 4 hours, which would have you planning for 1:00 PM, more than 2 hours too late.',
 uses:[
  '<b>Do:</b> when you run a stand or a help desk, divide arrivals per hour by what one person can serve. <b>Why:</b> managers add service rates: if each cashier checks out 30 an hour and 90 arrive, at least 3 registers must be open just to keep up.',
  '<b>Do:</b> don’t expect a 4-core computer to be exactly 4 times as fast. <b>Why:</b> core rates add for work that can be split, but the parts that cannot be split limit the speedup (Amdahl’s law).',
  '<b>Do:</b> when you fill a pool with two hoses, put them on separate faucets. <b>Why:</b> a 10-hour hose and a 15-hour hose fill it together in 6 hours only if each keeps its full flow; two hoses on one faucet will not.'
 ],
 takeaway:'Add rates, not times: 1/a + 1/b = 1/t. Together is always faster than the fastest worker alone, and much faster than averaging the two times suggests.'
}
});
