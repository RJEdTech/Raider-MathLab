BioLab.addPractical({
cooling:{
 hook:'A pizza slice comes out of the oven at 190 °F, and your kitchen is 70 °F. Bite in too soon and you burn the roof of your mouth; wait too long and it is cold. If it is ready to eat at about 130 °F, how many minutes should you wait?',
 answer:'About 6.9 minutes. The gap between the slice and the room halves every 6.9 minutes, and 130 °F is exactly halfway from 190 °F to 70 °F. After 3 minutes it is still about 159 °F.',
 uses:[
  '<b>Do:</b> cool leftovers in shallow containers and get them in the fridge within 2 hours. <b>Why:</b> the FDA Food Code requires cooked food to drop from 135 °F to 70 °F within 2 hours, and to 41 °F within 6 hours in all. A deep pot cools slowly (small k), so kitchens use shallow pans and ice baths to raise k.',
  '<b>Do:</b> in a forensics unit, use cooling curves to estimate time since death, and list what would change k. <b>Why:</b> investigators use models built on the same idea, adjusted for clothing, air temperature and body size.',
  '<b>Do:</b> when a weather app updates its forecast, remember it is stepping forward a few minutes at a time. <b>Why:</b> forecast models can’t solve their equations exactly, so they step them forward from the current state: the same idea as Euler’s method, with more careful steps.'
 ],
 takeaway:'Things cool in proportion to how much hotter they are than their surroundings, so the gap shrinks by the same fraction every minute. Fast at first, slow at the end.'
}
});
