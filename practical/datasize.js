BioLab.addPractical({
datasize:{
 hook:'You start downloading a 60 GB game on your family’s 200 Mbps internet. Your friends are getting online in 10 minutes. Will the game be ready?',
 answer:'No. At full speed it takes about 40 minutes: 60 GB is 480,000 megabits, and 480,000 ÷ 200 = 2,400 seconds. Dividing 60,000 MB by 200 gives 5 minutes, 8 times too fast, because internet speeds count bits and file sizes count bytes.',
 uses:[
  'Internet plans are sold in megabits per second (Mbps), while many game launchers and download managers show progress in megabytes per second (MB/s). Divide the plan speed by 8 to compare them.',
  'Storage labels: phone and drive makers count 1 GB as 10⁹ bytes, while Windows counts a “GB” as 2³⁰ bytes, so a 1 TB drive shows up as about 931 GB. No space is missing; the units differ.',
  'Data plans: mobile plans cap your data in gigabytes, and streaming apps list how much data an hour of video uses at each quality setting. Dividing the cap by the hourly use tells you how many hours you get.'
 ],
 takeaway:'Put everything in the same unit before you divide. Kilo, mega, giga and tera are each 1,000 times the last, and a byte is 8 bits.'
}
});
