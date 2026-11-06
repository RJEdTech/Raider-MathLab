BioLab.addPractical({
bottle:{
 hook:'You want a water bottle that holds at least a liter (1,000 mL) for long practices, and the two in your kitchen lost their labels. Bottle B is 24 cm tall inside: a body about 7.4 cm across at the bottom, 8.6 cm in the middle and 8.0 cm at the top, then a shoulder and a 3.8 cm neck. How many mL does it hold?',
 answer:'About 1,138 mL, so it clears a liter. The slimmer bottle A, 6.4 cm across and 25 cm tall inside, holds only about 729 mL, even though it is taller.',
 uses:[
  'Engineers design tanks, silos and pressure vessels from their profile curves and compute capacity with the same slice-and-add volume integrals.',
  'Doctors estimate organ and tumor volumes from CT and MRI scans by adding up the cross-sectional area in each image slice times the slice thickness: the disk idea with real slices.',
  'Fuel gauges and tank charts for round or oddly shaped tanks convert a measured liquid height into gallons using a volume-by-slices calculation.'
 ],
 takeaway:'Slice a round object into thin disks, add π r² × thickness for each, and the total closes in on the integral of π r(x)². Width counts twice (it is squared), so a slightly wider bottle holds much more.'
}
});
