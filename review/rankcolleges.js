BioLab.addReview({
rankcolleges:{
 questions:[
  {id:'wavg',kind:'test',lvl:'bio',
   q:'A ranking gives graduation rate a weight of 2 and net price a weight of 1. A college earns 80 points for graduation rate and 50 points for net price. What is its score?',
   num:{ans:70,tol:0.01,unit:'points'},
   steps:['Weighted average = (sum of weight × points) ÷ (sum of weights).','= (2 × 80 + 1 × 50) ÷ (2 + 1) = 210 ÷ 3.','= 70 points.']},
  {id:'twometrics',kind:'real',lvl:'bio',
   q:'You care about two things equally: graduation rate and net price. Cindervale earns 71.9 points for graduation rate and 85.7 for net price. What is its score, and where does it rank?',
   num:{ans:78.79,tol:0.05,unit:'points'},
   steps:['Score = (1 × 71.875 + 1 × 85.714) ÷ 2.','= 157.589 ÷ 2 ≈ 78.79.','That makes Cindervale #1 under your formula, while the old-style formula ranks it #5.'],
   lab:{set:{show:true,pick:'Cindervale',norm:'pts',game:false,w_grad:1,w_pell:0,w_sat:0,w_accept:0,w_giving:0,w_spend:0,w_net:1,w_earn:0},look:'Read <b>Score of your pick</b> and <b>Rank of your pick</b>.'},verify:[['pickscore',78.79,0.01],['pickrank',1,0.1]]},
  {id:'minmax',kind:'test',lvl:'honors',
   q:'SAT medians run from 1090 (lowest college) to 1490 (highest). With min-max scaling to 0–100, how many points does a college with a 1330 median get?',
   num:{ans:60,tol:0.01,unit:'points'},
   steps:['Points = 100 × (x − min) ÷ (max − min).','= 100 × (1330 − 1090) ÷ (1490 − 1090) = 100 × 240 ÷ 400.','= 60 points.']},
  {id:'zscore',kind:'test',lvl:'honors',
   q:'The eight SAT medians have mean 1313.75 and standard deviation 140.62. What is the z-score of Ashgrove’s 1490?',
   num:{ans:1.25,tol:0.01,unit:''},
   steps:['z = (x − μ) ÷ σ.','= (1490 − 1313.75) ÷ 140.62 = 176.25 ÷ 140.62.','≈ 1.25: Ashgrove’s SAT median is 1.25 standard deviations above the mean.'],
   lab:{set:{show:true,pick:'Ashgrove',norm:'z',game:false,w_grad:0,w_pell:0,w_sat:1,w_accept:0,w_giving:0,w_spend:0,w_net:0,w_earn:0},look:'With only the SAT weighted, <b>Score of your pick</b> is Ashgrove’s SAT z-score.'},verify:[['pickscore',1.2534,0.001]]},
  {id:'gaming',kind:'real',lvl:'honors',
   q:'Old-style formula. Dunmere rejects more applicants, reports a higher SAT median, gets more alumni to donate and builds new facilities. Its graduation rates, earnings and net price stay the same. Where does it rank?',
   choices:['Still #6','#4','#2','#1'],correct:1,
   steps:['Every input Dunmere changed is one the old formula rewards: acceptance rate, SAT, alumni giving, spending.','Its score rises from 38.6 to 64.7, passing Cindervale (45.0) and Fernhollow (63.7).','It is #4 without one more student graduating. Iona College admitted in 2011 that it had faked data, which had moved it from 50th to 30th among regional colleges.'],
   lab:{set:{show:true,game:true,norm:'pts',w_grad:6,w_pell:0,w_sat:5,w_accept:4,w_giving:2,w_spend:4,w_net:0,w_earn:0},look:'Read <b>Dunmere’s rank</b>, then turn <b>Dunmere chases the formula</b> off.'},verify:[['dunrank',4,0.1]]},
  {id:'breakpoint',kind:'test',lvl:'ap',
   q:'Old-style formula. Bellwick’s Σ w·p is 71.4 more than Ashgrove’s. On net price, Ashgrove earns 51.4 points and Bellwick 0. To the nearest 0.01, what net price weight makes Ashgrove #1?',
   num:{ans:1.39,tol:0.01,unit:''},
   steps:['Raising the net price weight by Δ adds 51.4Δ to Ashgrove’s Σ w·p and 0 to Bellwick’s.','Ashgrove catches Bellwick when 51.4Δ = 71.4, so Δ = 71.4 ÷ 51.4 ≈ 1.39.','No other college passes Bellwick sooner, so a net price weight of about 1.39 changes #1.'],
   lab:{set:{show:true,game:false,norm:'pts',w_grad:6,w_pell:0,w_sat:5,w_accept:4,w_giving:2,w_spend:4,w_net:0,w_earn:0},look:'Read <b>Net price weight where #1 changes</b>.'},verify:[['netflip',1.388,0.002]]}
 ]
}
});
