BioLab.addPractical({
kidneyswap:{
 hook:'Your aunt needs a kidney transplant, and your mom wants to give her one. Their blood types would work, but your aunt has antibodies that would attack your mom’s kidney. The hospital’s kidney exchange has 8 pairs like them this month, and your family is Pair 1. If pairs trade donors, how many of the 8 patients can get a kidney, and which swaps should happen?',
 answer:'With 2-way swaps, at most 6 of the 8. The best plan sends your mom’s type O kidney to Pair 3’s type O patient, who can only take an O kidney, and Pair 3’s type AB donor gives to your aunt. The swaps 2 ⇄ 4 and 5 ⇄ 6 help four more. Swap Pair 1 with Pair 2 first instead and you top out at 4. Allow 3-way loops and 7 can be helped; add one altruistic type O donor and all 8 can.',
 uses:[
  'Kidney exchanges: the National Kidney Registry, one U.S. exchange, facilitated its first transplant in 2008, its 5,000th in June 2021 and its 10,000th living-donor transplant by January 2025, including 1,744 in 2024 (company-reported).',
  'Blood transfusions run on the same ABO rules: a patient with type AB blood can receive red cells of any ABO type, while a patient with type O can receive only type O.',
  'Real exchanges have hundreds of pairs, far too many plans to list one by one, so they solve this same “most transplants” problem with integer programming, the optimization method airlines also use to build crew schedules.'
 ],
 takeaway:'The first swap that works is not always part of the best plan: here, swapping Pair 1 with Pair 2 first caps the plan at 4, and checking every plan finds 6. Real exchanges also weigh tissue type, distance and time waited. Which of those would you add to the search, and how would you weigh them against the count?'
}
});
