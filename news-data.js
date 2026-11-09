/* Raider Labs: In the News (data for news.html).
   Newest week first. To add a week: put its stories at the TOP of the array.
   Each story: id, week (YYYY-MM-DD, the Sunday it was added), date (event date),
   title, summary, numbers[] (each with its source link and date), concept{title,html},
   hook{prompt, parts[{label, answer, tol, unit, signHint?}], worked}, hides, evidence,
   investigate, related[{href, label}].
   Rules: every number has a source and date; label company-reported figures;
   name agencies and programs, never parties; no em dashes. */
window.RAIDER_NEWS = [
 {
  "id": "flint-rxkids-2026",
  "week": "2026-11-08",
  "date": "2026-11-03",
  "title": "Newborn deaths in Flint fell by half after the Rx Kids cash program began",
  "summary": "Rx Kids gives families in Flint, Michigan, $1,500 during pregnancy and $500 a month during infancy. A peer-reviewed study in <i>JAMA Pediatrics</i> compared newborn deaths in Flint with the rest of Michigan, using state birth and death records from 2021 to 2025.",
  "numbers": [
   "Flint newborn (first 28 days) deaths: 10.2 per 1,000 live births before the program, 5.1 in 2025 (<a href=\"https://news-medical.net/news/20261103/Flint-newborn-deaths-fall-5025-after-launch-of-cash-support-program.aspx\" target=\"_blank\" rel=\"noopener\">Michigan State University release, Nov 3, 2026</a>).",
   "Rest of Michigan: 4.0 before, 3.9 in 2025 (<a href=\"https://news-medical.net/news/20261103/Flint-newborn-deaths-fall-5025-after-launch-of-cash-support-program.aspx\" target=\"_blank\" rel=\"noopener\">Michigan State University release, Nov 3, 2026</a>).",
   "Flint deaths in the first 7 days: 7.9 per 1,000 before, 2.0 after (<a href=\"https://news-medical.net/news/20261103/Flint-newborn-deaths-fall-5025-after-launch-of-cash-support-program.aspx\" target=\"_blank\" rel=\"noopener\">Michigan State University release, Nov 3, 2026</a>).",
   "Study: Hanna M, et al., \"Changes in neonatal mortality after prenatal and infant cash transfers,\" <i>JAMA Pediatrics</i>, 2026, DOI <a href=\"https://doi.org/10.1001/jamapediatrics.2026.4943\" target=\"_blank\" rel=\"noopener\">10.1001/jamapediatrics.2026.4943</a>."
  ],
  "concept": {
   "title": "Difference-in-differences: compared to what?",
   "html": "A drop in Flint alone does not prove the program helped: maybe every hospital in Michigan improved that year. <b>Difference-in-differences</b> subtracts the change in a comparison group from the change in the program group, so changes that hit everyone cancel out. Rates <b>per 1,000 live births</b> let you compare a city with a whole state."
  },
  "hook": {
   "prompt": "(a) Find the difference-in-differences for newborn deaths: (change in Flint) minus (change in the rest of Michigan), per 1,000 births. (b) By what percent did Flint's first-7-days rate fall?",
   "parts": [
    {
     "label": "(a) Difference-in-differences, per 1,000 births",
     "answer": -5.0,
     "tol": 0.05,
     "unit": "per 1,000",
     "signHint": "Check the sign: the rates went down, so each change is negative."
    },
    {
     "label": "(b) Percent drop in the first-7-days rate",
     "answer": 74.7,
     "tol": 0.6,
     "unit": "%"
    }
   ],
   "worked": "(a) Flint: 5.1 &minus; 10.2 = &minus;5.1. Rest of Michigan: 3.9 &minus; 4.0 = &minus;0.1. Difference-in-differences: &minus;5.1 &minus; (&minus;0.1) = <b>&minus;5.0 per 1,000 births</b>, about 5 fewer newborn deaths for every 1,000 babies born. (b) (7.9 &minus; 2.0) &divide; 7.9 = 0.747, a <b>74.7%</b> drop (reported as 74%)."
  },
  "hides": "One city has a small number of births, so its rate can swing a lot from year to year by chance. This is one year after the program began, and an observational study cannot rule out every other cause. The researchers say they will keep checking whether the drop lasts and repeats elsewhere (<a href=\"https://news-medical.net/news/20261103/Flint-newborn-deaths-fall-5025-after-launch-of-cash-support-program.aspx\" target=\"_blank\" rel=\"noopener\">Michigan State University release, Nov 3, 2026</a>). The release did not say how many months the $500 payments last.",
  "evidence": "Moderate. A peer-reviewed observational study. The early finding was first reported in June 2026; the November item is the published paper. The full paper was not read.",
  "investigate": "CDC WONDER has <a href=\"https://wonder.cdc.gov/lbd.html\" target=\"_blank\" rel=\"noopener\">infant death data</a> by state and year. Find Colorado's infant death rate for the last five years. Is the change from year to year bigger or smaller than Flint's?",
  "related": [
   {
    "href": "index.html#livessaved",
    "label": "Lives saved: an estimate, not a count"
   }
  ]
 },
 {
  "id": "keep-colorado-wild-2026",
  "week": "2026-11-08",
  "date": "2026-11-04",
  "title": "Colorado: Keep Colorado Wild Pass raises $43.2 million",
  "summary": "Coloradans can add an optional $29 Keep Colorado Wild Pass when they register a vehicle. Colorado Parks and Wildlife (CPW) announced the pass raised $43.2 million for state parks, wildlife conservation and county search and rescue teams.",
  "numbers": [
   "$43.2 million raised, announced Nov 4, 2026 (<a href=\"https://cpw.state.co.us/news\" target=\"_blank\" rel=\"noopener\">CPW news, Nov 4, 2026</a>; headline figure).",
   "$39.7 million in the first fiscal year (ended June 30, 2024) and $41 million in the second year; more than 1.5 million Coloradans bought the pass (<a href=\"https://cpw.state.co.us/news/09022025/keep-colorado-wild-pass-raises-41m-colorado-state-parks-search-and-rescue-volunteers\" target=\"_blank\" rel=\"noopener\">CPW, Sept 2, 2025</a>).",
   "The $29 pass is a 60% savings compared with the $80 annual state park pass (<a href=\"https://cpw.state.co.us/news/09022025/keep-colorado-wild-pass-raises-41m-colorado-state-parks-search-and-rescue-volunteers\" target=\"_blank\" rel=\"noopener\">CPW, Sept 2, 2025</a>).",
   "How the money flows: the first $32.5 million goes to state parks, the next $2.5 million to search and rescue, then $1 million to the Colorado Avalanche Information Center. Anything beyond $36 million goes to wildlife projects and outdoor education (<a href=\"https://cpw.state.co.us/news/09022025/keep-colorado-wild-pass-raises-41m-colorado-state-parks-search-and-rescue-volunteers\" target=\"_blank\" rel=\"noopener\">CPW, Sept 2, 2025</a>)."
  ],
  "concept": {
   "title": "A waterfall is a piecewise function",
   "html": "In a <b>waterfall</b> (tiered) budget, each bucket fills to its cap before money spills into the next one. The amount in the last bucket is a piecewise function of the total T: it is 0 when T &le; 36 (in millions), and T &minus; 36 when T &gt; 36. Because the first $36 million is fixed, a small percent rise in the total can mean a big percent rise in the last bucket."
  },
  "hook": {
   "prompt": "Assume the same waterfall rules as last year. (a) How much went to wildlife projects and outdoor education this year, in millions? (b) Last year the total was $41 million. By what percent did the wildlife-and-education bucket grow? (c) By what percent did the total grow?",
   "parts": [
    {
     "label": "(a) Wildlife and education this year",
     "answer": 7.2,
     "tol": 0.05,
     "unit": "$ million"
    },
    {
     "label": "(b) Percent growth in that bucket",
     "answer": 44,
     "tol": 0.6,
     "unit": "%"
    },
    {
     "label": "(c) Percent growth in the total",
     "answer": 5.4,
     "tol": 0.1,
     "unit": "%"
    }
   ],
   "worked": "(a) 43.2 &minus; 36 = <b>$7.2 million</b>. (b) Last year: 41 &minus; 36 = $5.0 million. (7.2 &minus; 5.0) &divide; 5.0 = <b>44%</b>. (c) (43.2 &minus; 41) &divide; 41 = <b>5.4%</b>. The last bucket grew about 8 times faster than the total, because the first $36 million is fixed."
  },
  "hides": "Only the headline of the Nov 4, 2026 release could be read, so the fiscal period, the number of passes sold, and whether the rules changed are not checked. This question assumes the 2025 rules. A total also hides where the money is spent: which parks, which projects.",
  "evidence": "Official state agency figures. The 2026 total is from the release headline; the rules are from CPW's 2025 release.",
  "investigate": "CPW publishes news releases and budget reports at <a href=\"https://cpw.state.co.us/news\" target=\"_blank\" rel=\"noopener\">cpw.state.co.us</a>. Find this year's release and check whether the waterfall rules stayed the same.",
  "related": []
 },
 {
  "id": "small-populations-2026",
  "week": "2026-11-08",
  "date": "2026-11-05",
  "title": "Tiny animal populations can bounce back with help",
  "summary": "Researchers at Monash University and the Zoological Society of London reviewed every bird and mammal species known to have fallen below 50 wild animals since 1950. With direct help, most of them grew back.",
  "numbers": [
   "141 bird and mammal species had enough tracked history to study; 51 got direct conservation action (<a href=\"https://newshub.medianet.com.au/2026/11/small-populations-big-potential-new-research-overturns-extinction-assumptions/180371/\" target=\"_blank\" rel=\"noopener\">Monash University release, Nov 5, 2026</a>).",
   "61% of the 51 helped species recovered to at least 100 individuals (<a href=\"https://newshub.medianet.com.au/2026/11/small-populations-big-potential-new-research-overturns-extinction-assumptions/180371/\" target=\"_blank\" rel=\"noopener\">Monash University release, Nov 5, 2026</a>).",
   "Of species with no direct help, 37% went extinct and only 2% reached 100 (<a href=\"https://newshub.medianet.com.au/2026/11/small-populations-big-potential-new-research-overturns-extinction-assumptions/180371/\" target=\"_blank\" rel=\"noopener\">Monash University release, Nov 5, 2026</a>).",
   "The Lord Howe woodhen grew from 23 birds in the late 1970s to more than 1,600 today (<a href=\"https://newshub.medianet.com.au/2026/11/small-populations-big-potential-new-research-overturns-extinction-assumptions/180371/\" target=\"_blank\" rel=\"noopener\">Monash University release, Nov 5, 2026</a>).",
   "Paper: <i>Proceedings of the Royal Society B</i>, 2026, DOI <a href=\"https://doi.org/10.1098/rspb.2026.2436\" target=\"_blank\" rel=\"noopener\">10.1098/rspb.2026.2436</a>."
  ],
  "concept": {
   "title": "Exponential growth, then a ceiling",
   "html": "Very small populations face extra risks: a few unlucky births or deaths can wipe them out, and they lose genetic variety. Once the threats are removed (predators controlled, habitat restored, animals bred and moved), a population can grow by a roughly constant <b>percent</b> each year at first. That is exponential growth: N = N<sub>0</sub> &times; (1 + r)<sup>t</sup>. Later, growth slows as the population nears what its habitat can support (logistic growth). To find an average yearly rate, take the <b>t-th root</b> of the growth factor."
  },
  "hook": {
   "prompt": "(a) About how many of the 51 helped species reached 100 individuals? (b) If the woodhen grew from 23 to 1,600 birds over 47 years (assume 1979 to 2026), what average yearly growth rate does that imply?",
   "parts": [
    {
     "label": "(a) Number of helped species that recovered",
     "answer": 31,
     "tol": 0.6,
     "unit": "species"
    },
    {
     "label": "(b) Average yearly growth rate, as a percent",
     "answer": 9.4,
     "tol": 0.2,
     "unit": "% per year"
    }
   ],
   "worked": "(a) 0.61 &times; 51 = 31.1, so about <b>31 species</b>. (b) Growth factor = 1,600 &divide; 23 = 69.6. Yearly factor = 69.6<sup>1/47</sup> = 1.094, so about <b>9.4% per year</b> on average. The real growth was faster early and slower later, because the island has a ceiling."
  },
  "hides": "\"Late 1970s\" is approximate, so the 47-year span is our assumption. Reaching 100 animals is a milestone, not safety: the co-author notes that genetic risks are real (<a href=\"https://newshub.medianet.com.au/2026/11/small-populations-big-potential-new-research-overturns-extinction-assumptions/180371/\" target=\"_blank\" rel=\"noopener\">Monash University release, Nov 5, 2026</a>). Species that got help may differ from those that did not, so the comparison shows a pattern, not proof that each action works.",
  "evidence": "Moderate to strong. A peer-reviewed review of every known case since 1950. The paper itself could not be opened, and the size of the no-help group was not in the release.",
  "investigate": "The <a href=\"https://www.iucnredlist.org/\" target=\"_blank\" rel=\"noopener\">IUCN Red List</a> shows population trends. Find a species with a rising trend and estimate its yearly growth rate from two counts.",
  "related": [
   {
    "href": "index.html#onepercent",
    "label": "1% apart: what a slightly higher rate really costs"
   }
  ]
 },
 {
  "id": "who-ntd-2026",
  "week": "2026-11-08",
  "date": "2026-11-04",
  "title": "63 countries have now eliminated at least one neglected tropical disease",
  "summary": "WHO's Global report on neglected tropical diseases 2026 tracks diseases such as sleeping sickness, Guinea worm and river blindness that mostly affect the world's poorest communities. Fewer people need treatment than at any point WHO has tracked.",
  "numbers": [
   "63 countries had eliminated at least one neglected tropical disease (NTD) by June 2026, up from 42 at the end of 2020 (<a href=\"https://allafrica.com/stories/202611050063.html\" target=\"_blank\" rel=\"noopener\">WHO release of Nov 4, 2026, as reprinted by allAfrica</a>).",
   "1.41 billion people required NTD interventions in 2024, down 36% since 2010 and 19% since 2020 (<a href=\"https://allafrica.com/stories/202611050063.html\" target=\"_blank\" rel=\"noopener\">WHO release of Nov 4, 2026, as reprinted by allAfrica</a>).",
   "Sleeping sickness cases are down 98% since 1999, and Guinea worm fell to a record low of 10 human cases in 2025 (<a href=\"https://allafrica.com/stories/202611050063.html\" target=\"_blank\" rel=\"noopener\">WHO release of Nov 4, 2026, as reprinted by allAfrica</a>).",
   "2030 goals: 90% fewer people needing interventions than in 2010, and 100 countries eliminating at least one NTD (<a href=\"https://allafrica.com/stories/202611050063.html\" target=\"_blank\" rel=\"noopener\">WHO release of Nov 4, 2026, as reprinted by allAfrica</a>)."
  ],
  "concept": {
   "title": "Breaking the cycle, and running a percent change backward",
   "html": "Many NTDs pass through a cycle: a parasite, often a carrier such as a fly or a water snail, and a human host. Breaking any link (medicine for whole communities, clean water, or controlling the carrier) can push the average number of new cases caused by each case below 1, and then the disease shrinks. To undo a percent drop, divide: if a number fell 36%, today's value is 64% of the old one, so <b>old = today &divide; 0.64</b>. Subtracting 36% of today's number is a common mistake."
  },
  "hook": {
   "prompt": "Use WHO's numbers. (a) How many people needed NTD interventions in 2010? (b) In 2020? (c) Countries went from 42 (end of 2020) to 63 (June 2026). How many new countries per year are needed to reach 100 by the end of 2030?",
   "parts": [
    {
     "label": "(a) 2010, in billions of people",
     "answer": 2.2,
     "tol": 0.03,
     "unit": "billion"
    },
    {
     "label": "(b) 2020, in billions of people",
     "answer": 1.74,
     "tol": 0.03,
     "unit": "billion"
    },
    {
     "label": "(c) Countries per year needed, June 2026 to end of 2030",
     "answer": 8.2,
     "tol": 0.2,
     "unit": "per year"
    }
   ],
   "worked": "(a) 1.41 &divide; (1 &minus; 0.36) = 1.41 &divide; 0.64 = <b>2.20 billion</b>. (b) 1.41 &divide; 0.81 = <b>1.74 billion</b>. The 90% goal from 2010 would be about 0.22 billion. (c) 100 &minus; 63 = 37 countries in 4.5 years = <b>8.2 per year</b>. The past pace was 21 countries in 5.5 years, about 3.8 per year, so the goal needs more than double the pace."
  },
  "hides": "A global total can hide where things are getting worse: dengue reached a record 15.1 million cases in 2024, and yaws eradication is off track. Funding for NTD programs is about 30% below pre-COVID levels, and nearly 80% of 2018 to 2024 aid came from a small number of donors (<a href=\"https://allafrica.com/stories/202611050063.html\" target=\"_blank\" rel=\"noopener\">WHO release of Nov 4, 2026, as reprinted by allAfrica</a>).",
  "evidence": "Strong. An official WHO monitoring report. The numbers here come from WHO's release text as reprinted by allAfrica; the full report was not read.",
  "investigate": "WHO's <a href=\"https://www.who.int/data/gho/data/themes/neglected-tropical-diseases\" target=\"_blank\" rel=\"noopener\">Global Health Observatory</a> has NTD data by country. Pick one disease and graph the number of people needing treatment over time.",
  "related": []
 }
];
