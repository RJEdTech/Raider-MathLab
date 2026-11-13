BioLab.addPractical({
viewcurve:{
 hook:'Your club posted a video for its fundraiser on Friday at 6 pm. Over the next 3 days its total views climbed slowly, then fast, then leveled off near 4,800. Before the club spends money boosting its next post, you want to know: when was this video gaining views fastest?',
 answer:'At hour 20, Saturday at 2 pm, when it was gaining about 360 views an hour and had 2,400 views, half of its final total. Before that, views per hour were rising every hour; after it, the total kept climbing but more slowly each hour.',
 uses:[
  '<b>Do:</b> in an outbreak, watch the daily count of new cases, not just the total. <b>Why:</b> when the daily count peaks, the total-cases curve is at its inflection point and growth has turned, even though the total still rises.',
  '<b>Do:</b> on your own posts or videos, look at views per hour next to total views. <b>Why:</b> creator dashboards show the derivative next to the function, so you can see when a post stops picking up speed.',
  '<b>Do:</b> when someone forecasts a final total from early sales, check whether weekly sales have peaked yet. <b>Why:</b> forecasters fit S-shaped models such as the logistic curve, and the estimate of the final total firms up once sales per week peak.'
 ],
 takeaway:'The fastest growth is where the rate peaks, not where the total is biggest. On the total curve it is the inflection point: the second derivative changes sign there.'
}
});
