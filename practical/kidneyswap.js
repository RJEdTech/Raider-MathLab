BioLab.addPractical({
kidneyswap:{
 hook:'Your aunt needs a kidney transplant, and your mom wants to give her one. Their blood types would work, but your aunt has antibodies that would attack your mom’s kidney. The hospital’s kidney exchange has 8 pairs like them this month, and your family is Pair 1. If pairs trade donors, how many of the 8 patients can get a kidney, and which swaps should happen?',
 answer:'With 2-way swaps, at most 6 of the 8. The best plan sends your mom’s type O kidney to Pair 3’s type O patient, who can only take an O kidney, and Pair 3’s type AB donor gives to your aunt. The swaps 2 ⇄ 4 and 5 ⇄ 6 help four more. Swap Pair 1 with Pair 2 first instead and you top out at 4. Allow 3-way loops and 7 can be helped; add one altruistic type O donor and all 8 can.',
 uses:[
  '<b>Do:</b> learn your blood type at your next checkup or blood drive. <b>Why:</b> transfusions run on these ABO rules: a type AB patient can receive red cells of any ABO type, while a type O patient can receive only type O.',
  '<b>Do:</b> if someone you love needs a kidney and a willing donor doesn’t match, ask about a paired exchange. <b>Why:</b> the National Kidney Registry, one U.S. exchange, facilitated its first transplant in 2008 and its 10,000th living-donor transplant by January 2025, including 1,744 in 2024 (company-reported).',
  '<b>Do:</b> when a problem has too many plans to list, set it up as an optimization instead of checking plans one by one. <b>Why:</b> real exchanges have hundreds of pairs, so they solve this “most transplants” problem with integer programming, the method airlines also use to build crew schedules.'
 ],
 takeaway:'The first swap that works is not always part of the best plan: here, swapping Pair 1 with Pair 2 first caps the plan at 4, and checking every plan finds 6. Real exchanges also weigh tissue type, distance and time waited. Which of those would you add to the search, and how would you weigh them against the count?'
}
});
