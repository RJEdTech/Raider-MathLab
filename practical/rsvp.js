BioLab.addPractical({
rsvp:{
 hook:'You are organizing your club’s service day at a food bank. You need at least 20 volunteers to show up, and the food bank can take at most 26. From past events, each person you invite shows up about 65% of the time. How many people should you invite?',
 answer:'Invite about 35. Then 20 to 26 people show up on about 79 days out of 100. Invite only 26 and you come up short on about 86 days out of 100; invite 45 and the food bank overflows on about 81.',
 uses:[
  '<b>Do:</b> when you plan a party, invite more than you have room for, based on how many usually come. <b>Why:</b> airlines overbook from no-show rates the same way you chose your invite list.',
  '<b>Do:</b> if you get into a college, answer by the deadline either way. <b>Why:</b> schools admit more students than they have spots because only part enroll, and they plan the class from that enrollment rate, the yield.',
  '<b>Do:</b> show up for appointments or cancel ahead. <b>Why:</b> clinics with many missed appointments book extra patients into some slots, using their no-show rate to keep the day full without overloading it.'
 ],
 takeaway:'When each person has the same independent chance of coming, turnout follows a binomial distribution. Aim the mean, np, at the middle of the range you need, and expect some days to miss anyway.'
}
});
