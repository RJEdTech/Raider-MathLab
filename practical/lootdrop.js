BioLab.addPractical({
lootdrop:{
 hook:'A phone game you and your friends play (made up for this tool) posts the odds for its crate: Common 60%, Rare 28%, Epic 10%, Legendary 2%. You log 400 openings in a shared spreadsheet and get 244 Common, 117 Rare, 35 Epic and just 4 Legendary, half the 8 you expected. Is the game honest about its odds, or quietly rigged?',
 answer:'Not enough evidence that it is rigged. Small counts wander a lot: the how-far-off score (χ² = 2.91, df = 3) is one an honest game reaches about 40 times in 100 (p = 0.405), and 47 of 100 simulated honest games were at least this far off. Most of the score comes from the Legendaries, but 4 instead of 8 is well within luck.',
 uses:[
  '<b>Do:</b> before you buy a loot box, find the game’s posted odds and keep a log of what you get. <b>Why:</b> Apple’s App Store Review Guidelines have required apps with loot boxes to disclose the odds of each item type before purchase since late 2017. Checking those odds against your log is exactly this test.',
  '<b>Do:</b> if your log is far from the posted odds, run the chi-square test before you complain. <b>Why:</b> a small sample can look unfair by chance. China began requiring online games to publish the odds of winning items from random draws in 2017.',
  '<b>Do:</b> in AP Biology, use the same chi-square test on offspring counts. <b>Why:</b> biologists check whether counts fit a predicted ratio such as 3:1 or 9:3:3:1 with this goodness-of-fit test.'
 ],
 takeaway:'Compare every count with what the claimed odds predict, weight each gap by how big a count you expected, and ask how often an honest game would be that far off. Small counts, like rare drops, wander the most.'
}
});
