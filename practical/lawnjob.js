BioLab.addPractical({
lawnjob:{
 hook:'You run a summer lawn-mowing business and charge $25 an hour. You have timed your last 15 jobs, from small yards to big ones. A new customer has a 6,500 sq ft lawn. How many minutes should you plan on, and what should you quote?',
 answer:'Plan on about 50 minutes (the line says 49.9) and quote about $20.79. Your 15 jobs say each job takes about 10.7 minutes to get going plus about 6 minutes per 1,000 sq ft. A 30-minute guess would quote $12.50 and miss the real cost by about $8.29 on an average job like this one; the line’s quote misses by about $1.65.',
 uses:[
  'Chemistry labs: to find an unknown concentration with a spectrophotometer, you measure a few standard solutions, fit a least-squares line of absorbance against concentration (Beer’s law says it should be straight), and read the unknown off the line.',
  'Weather forecasts: the National Weather Service’s Model Output Statistics (MOS) uses regression equations, fit on years of past computer forecasts and what the weather actually did, to turn model output into the highs and lows for your town.',
  'Home prices: appraisers value a house by comparing recent sales of similar homes and adjusting for differences such as square footage, and the automated estimates on real-estate websites come from statistical models (more complex cousins of regression) fit on thousands of sales.'
 ],
 takeaway:'A least-squares line turns past jobs into a prediction for a new one. Trust it inside the range of your data, and check how tightly the data follow it.'
}
});
