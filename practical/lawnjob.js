BioLab.addPractical({
lawnjob:{
 hook:'You run a summer lawn-mowing business and charge $25 an hour. You have timed your last 15 jobs, from small yards to big ones. A new customer has a 6,500 sq ft lawn. How many minutes should you plan on, and what should you quote?',
 answer:'Plan on about 50 minutes (the line says 49.9) and quote about $20.79. Your 15 jobs say each job takes about 10.7 minutes to get going plus about 6 minutes per 1,000 sq ft. A 30-minute guess would quote $12.50 and miss the real cost by about $8.29 on an average job like this one; the line’s quote misses by about $1.65.',
 uses:[
  '<b>Do:</b> in a chemistry lab, fit a least-squares line through your standards and read the unknown off it. <b>Why:</b> that is how a spectrophotometer finds an unknown concentration: Beer’s law says absorbance against concentration should be straight.',
  '<b>Do:</b> check how close your town’s forecast high came, a few days in a row. <b>Why:</b> the National Weather Service’s Model Output Statistics (MOS) uses regression equations, fit on years of past forecasts and what the weather actually did, to turn model output into the highs and lows for your town.',
  '<b>Do:</b> treat a website’s home-value estimate as a model’s guess, and look at recent sales of similar homes too. <b>Why:</b> appraisers compare recent sales of similar homes and adjust for differences such as square footage, and the automated estimates come from statistical models, more complex cousins of regression, fit on thousands of sales.'
 ],
 takeaway:'A least-squares line turns past jobs into a prediction for a new one. Trust it inside the range of your data, and check how tightly the data follow it.'
}
});
