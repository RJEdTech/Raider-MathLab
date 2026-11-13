BioLab.addPractical({
datasize:{
 hook:'You start downloading a 60 GB game on your family’s 200 Mbps internet. Your friends are getting online in 10 minutes. Will the game be ready?',
 answer:'No. At full speed it takes about 40 minutes: 60 GB is 480,000 megabits, and 480,000 ÷ 200 = 2,400 seconds. Dividing 60,000 MB by 200 gives 5 minutes, 8 times too fast, because internet speeds count bits and file sizes count bytes.',
 uses:[
  '<b>Do:</b> compare your internet plan with a download speed by dividing Mbps by 8. <b>Why:</b> plans are sold in megabits per second, while many game launchers show megabytes per second.',
  '<b>Do:</b> when a 1 TB drive shows about 931 GB, don’t return it. <b>Why:</b> makers count 1 GB as 10⁹ bytes, while Windows counts a “GB” as 2³⁰ bytes. No space is missing; the units differ.',
  '<b>Do:</b> divide your data plan cap by a streaming app’s data per hour to see how many hours you get. <b>Why:</b> mobile plans cap data in gigabytes, and streaming apps list how much data an hour uses at each quality setting.'
 ],
 takeaway:'Put everything in the same unit before you divide. Kilo, mega, giga and tera are each 1,000 times the last, and a byte is 8 bits.'
}
});
