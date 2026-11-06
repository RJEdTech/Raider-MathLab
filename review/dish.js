BioLab.addReview({
dish:{
 questions:[
  {id:'homedish',kind:'real',lvl:'bio',
   q:'A dish is 60 cm wide and 8 cm deep. How far above its center should the receiver go?',
   num:{ans:28.1,tol:0.1,unit:'cm'},
   steps:['The focus of a dish of width w and depth d is p = w²/(16d) above the center.','p = 60² ÷ (16 × 8) = 3600 ÷ 128.','p ≈ 28.1 cm, well above the 8 cm rim.'],
   lab:{set:{w:60,d:8},act:'focus',look:'Read <b>Focus height</b> and <b>Signal caught</b>.'},verify:[['pf',28.125,0.001],['cap',100,0.01]]},
  {id:'cooker',kind:'real',lvl:'honors',
   q:'A solar cooker is a parabolic reflector 80 cm wide and 10 cm deep. Where should the pot sit so sunlight focuses on it?',
   num:{ans:40,tol:0.2,unit:'cm above the center'},
   steps:['The rim is at (40, 10), so 10 = a × 40² and a = 10/1600 = 0.00625.','p = 1/(4a) = 1/0.025 = 40 cm.','Check with p = w²/(16d) = 6400/160 = 40 cm.'],
   lab:{set:{w:80,d:10},act:'focus',look:'Read <b>Focus height</b>.'},verify:[['pf',40,0.001]]},
  {id:'eqfocus',kind:'test',lvl:'honors',
   q:'Where is the focus of y = 0.05x²?',
   choices:['(0, 0.2)','(0, 5)','(0, 20)','(5, 0)'],correct:1,
   steps:['For y = ax², the focus is (0, 1/(4a)).','1/(4 × 0.05) = 1/0.2 = 5.','The focus is (0, 5).']},
  {id:'fromfocus',kind:'test',lvl:'honors',
   q:'A reflector must have its focus 20 cm above its vertex. Which equation describes it (x and y in cm)?',
   choices:['y = 20x²','y = 0.05x²','y = 0.0125x²','y = 80x²'],correct:2,
   steps:['p = 1/(4a), so a = 1/(4p).','a = 1/(4 × 20) = 1/80 = 0.0125.','y = 0.0125x².']},
  {id:'offby',kind:'real',lvl:'ap',
   q:'On the 60 cm × 8 cm dish (focus 28.125 cm up), the receiver is mounted 4 cm too low, at 24 cm, and its opening is 5 cm wide. About what share of the signal does it catch?',
   choices:['About 90%','About 50%','About 27%','About 5%'],correct:2,
   steps:['A ray hitting the dish q cm from the center bounces toward the focus. At height 24 cm it is q × 4.125 ÷ (28.125 − q²/112.5) cm from the axis.','It hits the 5 cm opening if that is at most 2.5 cm, which holds for q up to about 15.7 cm.','A round dish’s area grows with q², so the share is (15.7/30)² ≈ 0.27: about 27% of the signal.'],
   lab:{set:{w:60,d:8,h:24,rs:5},look:'Read <b>Signal caught</b>, then press <b>Move it to the focus</b>.'},verify:[['cap',27.46,0.3]]},
  {id:'directrix',kind:'test',lvl:'ap',
   q:'The parabola y = x²/40 has its focus at (0, 10). What is its directrix?',
   choices:['y = −10','y = −40','x = −10','y = 0'],correct:0,
   steps:['For y = ax², a = 1/40, so p = 1/(4a) = 10.','The directrix is as far below the vertex as the focus is above it: y = −p.','So the directrix is y = −10. Every point on the parabola is equally far from (0, 10) and from that line.']}
 ]
}
});
