BioLab.addPractical({
rsvp:{
 hook:'You are organizing your club’s service day at a food bank. You need at least 20 volunteers to show up, and the food bank can take at most 26. From past events, each person you invite shows up about 65% of the time. How many people should you invite?',
 answer:'Invite about 35. Then 20 to 26 people show up on about 79 days out of 100. Invite only 26 and you come up short on about 86 days out of 100; invite 45 and the food bank overflows on about 81.',
 uses:[
  'Airlines overbook: they sell more tickets than a flight has seats because some passengers never show up, and they choose how many extra to sell from no-show rates, the same way you chose your invite list.',
  'College admissions: schools admit more students than they have spots for, because only part of the admitted students enroll. They plan the size of the incoming class from that enrollment rate, called the yield.',
  'Medical clinics with many missed appointments book extra patients into some time slots, using their no-show rate to keep the day full without overloading it.'
 ],
 takeaway:'When each person has the same independent chance of coming, turnout follows a binomial distribution. Aim the mean, np, at the middle of the range you need, and expect some days to miss anyway.'
}
});
