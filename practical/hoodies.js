BioLab.addPractical({
hoodies:{
 hook:'Your club is ordering 120 hoodies, and the shop needs the count in each size before anyone tries one on. The size chart goes by chest measurement: S under 37 in, M 37 to 41, L 41 to 45, XL 45 to 49, 2XL 49 and up. Chest sizes in your club average about 39 in, give or take about 4 in. How many of each size should you order?',
 answer:'About 37 S, 46 M, 29 L, 7 XL and 1 2XL. Each size gets 120 times its share of the area under the bell curve. Ordering 24 of every size would leave about 40 members without their size, while about 17 extra XL and 23 extra 2XL hoodies sit unused.',
 uses:[
  'Clothing and shoe stores order stock by size the same way: more of the middle sizes, fewer of the extremes, based on the spread of their customers’ sizes.',
  'Car and furniture designers use body-size data, often aiming to fit people from the 5th to the 95th percentile, so a seat or desk fits most people without trying to fit everyone.',
  'Factories use control charts: when a part’s measurement lands more than 3 standard deviations from the process average, the 68-95-99.7 rule says that is very unlikely by chance, so the machine gets checked.'
 ],
 takeaway:'A normal model turns “most people are near the middle” into numbers: the share in any range is an area under the curve, and 120 times that area is how many to order.'
}
});
