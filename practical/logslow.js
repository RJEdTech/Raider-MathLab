BioLab.addPractical({
logslow:{
 hook:'In a game you play, each level needs twice the total XP of the level before. You hit level 5 after 1 hour. Playing at the same steady pace, how long until level 10?',
 answer:'32 hours, not 2. The levels come at 1, 2, 4, 8, 16 and 32 hours, so the last level alone takes 16 hours, half of all the time. Followers work the same way: if 100 followers took a week at a steady pace, 10,000 takes 100 weeks.',
 uses:[
  '<b>Do:</b> when a game, app or fitness tracker shows a level bar, estimate the next level by the ratio of the steps, not by how long the last one took. <b>Why:</b> when each level costs a fixed multiple of the last, your level is a logarithm of your time, and every level takes that multiple longer. Designers use rising XP curves on purpose so early levels hook you fast.',
  '<b>Do:</b> judge a channel or account by how fast it multiplies (how long to double), not by the milestones. <b>Why:</b> at a steady pace, each tenfold milestone (1K, 10K, 100K) takes ten times as long. Growth that keeps multiplying comes from attention: the 2024 onboarding guide leaked from MrBeast’s company tells staff that the numbers to watch are click-through rate, average view duration and average view percentage, and that the first minute of a video loses the most viewers. For how apps are built to keep that attention, see HealthLab’s <a href="https://rjedtech.github.io/Raider-HealthLab/#streaks" target="_blank" rel="noopener">Likes and streaks</a>.',
  '<b>Do:</b> in chemistry lab, read a pH change of 1 as ten times the acid, not “a little more.” <b>Why:</b> pH is a base-10 logarithm of the hydrogen-ion concentration, so pH 3 has 10 times the H⁺ of pH 4 and 100 times that of pH 5. Decibels work the same way for sound; see <a href="#decibels">Decibels and safe listening</a>.'
 ],
 takeaway:'A log counts multiplications. Each step up needs the input multiplied by the base, so the rise stays the same while the run keeps growing: the slope shrinks like 1/x, but the log never stops climbing.'
}
});
