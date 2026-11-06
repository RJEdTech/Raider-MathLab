BioLab.addPractical({
cooling:{
 hook:'A pizza slice comes out of the oven at 190 °F, and your kitchen is 70 °F. Bite in too soon and you burn the roof of your mouth; wait too long and it is cold. If it is ready to eat at about 130 °F, how many minutes should you wait?',
 answer:'About 6.9 minutes. The gap between the slice and the room halves every 6.9 minutes, and 130 °F is exactly halfway from 190 °F to 70 °F. After 3 minutes it is still about 159 °F.',
 uses:[
  'Restaurant kitchens follow the FDA Food Code’s two-stage cooling rule: cooked food must drop from 135 °F to 70 °F within 2 hours, and to 41 °F within 6 hours in all. A deep pot cools slowly (small k) and the rule demands speed, so cooks use shallow pans and ice baths to raise k.',
  'Forensic investigators estimate time since death from body temperature with cooling models built on the same idea, adjusted for clothing, air temperature and body size.',
  'Weather forecast models can’t solve their equations exactly, so they step them forward a few minutes at a time from the current state: the same idea as Euler’s method, with more careful steps.'
 ],
 takeaway:'Things cool in proportion to how much hotter they are than their surroundings, so the gap shrinks by the same fraction every minute. Fast at first, slow at the end.'
}
});
