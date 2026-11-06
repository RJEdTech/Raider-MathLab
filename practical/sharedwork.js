BioLab.addPractical({
sharedwork:{
 hook:'A neighbor pays you and a friend to paint a fence. You could do it alone in 3 hours; your friend, newer at it, would take 5 hours. You start together at 9:00 AM. What time should you tell the neighbor you will be done?',
 answer:'At about 10:52 AM. Together you paint 1/3 + 1/5 = 8/15 of the fence per hour, so the job takes 15/8 hours, or 1 hour 52.5 minutes. Averaging the times gives 4 hours, which would have you planning for 1:00 PM, more than 2 hours too late.',
 uses:[
  'Staffing a store or a help line: managers decide how many registers or agents to open by adding service rates. If each cashier can check out 30 customers an hour and 90 arrive each hour, at least 3 registers must be open just to keep up.',
  'Multi-core computers: a processor splits work across its cores, so their rates add. Four cores can at best finish a fully splittable job in a quarter of the time. In practice the parts of a program that cannot be split limit the speedup (Amdahl’s law), so a 4-core chip is rarely exactly 4 times as fast.',
  'Pumps and hoses: draining a flooded basement with two pumps, or filling a pool with two hoses, works the same way. A hose that fills a pool in 10 hours and one that takes 15 fill it together in 6 hours, as long as each keeps its full flow (two hoses on one faucet will not).'
 ],
 takeaway:'Add rates, not times: 1/a + 1/b = 1/t. Together is always faster than the fastest worker alone, and much faster than averaging the two times suggests.'
}
});
