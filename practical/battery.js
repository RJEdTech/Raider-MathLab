BioLab.addPractical({
battery:{
 hook:'It is 2:10 pm and your phone is at 38%. You need it until 6:30 pm to get a ride home. You logged the battery every 10 minutes since noon: it fell fast while you were gaming, and you have been on music and texts since about 1:40. If you keep doing that, when will it hit 0%?',
 answer:'At about 7:27 pm. Right now the battery is falling only 0.12% per minute, so 38% lasts about 317 minutes, and you have about 7% left at 6:30 pm. The average since noon, 0.34% per minute, would have said 4:02 pm, because it counts the gaming you already stopped.',
 uses:[
  'A laptop’s battery “time remaining” estimate divides the charge left by a recent drain rate, which is why it jumps when you start a game or dim the screen.',
  'A car’s “miles to empty” reading works the same way: fuel left divided by your recent rate of fuel use, so it drops quickly when you start towing or driving uphill.',
  'Download and upload progress bars estimate time left from the current transfer rate, and the estimate changes whenever the rate does.'
 ],
 takeaway:'To forecast, use the rate right now, not the average of the past. The tangent line at this moment is the forecast if nothing changes; when the rate itself is changing, the tangent line drifts away from the truth.'
}
});
