BioLab.addPractical({
schedule:{
 hook:'You manage a small cafe with 7 baristas who earn $16 an hour. A week out, the forecast says rain, and a 30% bigger crowd, is possible on Tuesday, Wednesday and Saturday. If you post the schedule now, you have to staff all three days for rain. It rains only on Wednesday. What does posting the schedule a week ahead cost the cafe that week?',
 answer:'$288. The posted week staffs Tuesday and Saturday for rain that never comes: 11 + 7 = 18 extra barista-hours, and 18 × $16 = $288. Re-planned after the real forecast, the week costs $3,968; posted, $4,256. A second rule, banning “clopening” (closing at 10 pm and opening the next morning), costs $0 with 7 baristas: the optimizer only changes who opens.',
 uses:[
  '<b>Do:</b> if you work at a store or restaurant, ask how far ahead schedules are posted. <b>Why:</b> large chains use software that forecasts traffic hour by hour and builds shifts to match. What it is told to minimize decides what workers’ weeks look like.',
  '<b>Do:</b> know whether a fair workweek law covers your job. <b>Why:</b> Seattle’s 2017 secure scheduling ordinance requires covered employers to post schedules in advance. Shift Project researchers found that afterward more workers got two weeks’ notice and their sleep quality improved.',
  '<b>Do:</b> when you get your shifts, check the rest between a closing shift and the next opening. <b>Why:</b> how much rest and notice you get depends on which rules are added to the forecast, and each rule has a price someone has worked out.'
 ],
 takeaway:'Here the rest rule cost $0 and posting ahead cost $288: 18 barista-hours at $16. What would you want to know before calling a rule too expensive?'
}
});
