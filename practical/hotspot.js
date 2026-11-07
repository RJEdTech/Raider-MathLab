BioLab.addPractical({
hotspot:{
 hook:'Your student council helps the dean schedule 4 hall monitors, 20 shifts a week, across two hallways. The proposal: put the monitors where the write-ups are. Both hallways really have the same behavior every week. In week 1 the monitors split evenly and, by chance, Hallway A got 12 write-ups and Hallway B got 10. If the schedule keeps following the write-ups, what share of the monitor shifts will A get in week 20?',
 answer:'About 90%: 18 of the 20 shifts. More monitors in A see more of A’s minor offenses, and those write-ups bring more monitors. After 20 weeks A has 324 write-ups and B has 107, for exactly the same 460 offenses each. Count only serious incidents, which get reported either way, and the split stays at 50/50.',
 uses:[
  'Predictive policing: software such as PredPol, which police in Reading, Pennsylvania, began using in 2013, flags small hot-spot squares for extra patrols based on past recorded crime. O’Neil argues that counting nuisance crimes turns that into this loop.',
  'Student lists: in December 2024, Florida’s Pasco County sheriff settled a lawsuit by admitting that a program built on lists of “prolific offenders,” many of them minors, and a school list of about 420 students violated the Constitution, and ended the program.',
  '“Most popular” lists: when a site ranks items by clicks and shows the top ones first, the top items get more clicks partly because they are on top. Statisticians model this rich-get-richer effect with Pólya urns, the same math as this tool.'
 ],
 takeaway:'When the data depend on where you look, a rule that follows the data can manufacture its own proof. Here, counting only serious incidents kept the split at 50/50, and spreading 30% of the shifts evenly held A to 63%. If you were on the council, which rule would you propose, and what would it miss?'
}
});
