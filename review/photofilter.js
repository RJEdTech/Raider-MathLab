BioLab.addReview({
photofilter:{
 questions:[
  {id:'bright',kind:'real',lvl:'bio',
   q:'A dark photo has values from 12 to 108. You raise the brightness by 147 and leave contrast alone. What percent of the 0–255 range does the photo use now?',
   num:{ans:37.6,tol:0.3,unit:'%'},
   steps:['Brightness adds 147 to every value: 12 becomes 159 and 108 becomes 255.','The photo now spans 255 − 159 = 96 levels, the same 96 it spanned before.','96 ÷ 255 ≈ 0.376, so it uses about 37.6% of the range. A shift moves the band; it cannot widen it.'],
   lab:{set:{photo:'dark',scene:'lake',k:147},look:'Read <b>Range used</b>.'},verify:[['range',37.65,0.05],['clip',0,0.001]]},
  {id:'hazy',kind:'real',lvl:'honors',
   q:'A hazy photo has values from 96 to 214. What contrast a stretches it to fill 0–255 exactly? (Give a to two decimal places.)',
   num:{ans:2.16,tol:0.01,unit:'×'},
   steps:['The photo spans 214 − 96 = 118 levels. The stretch must turn that into 255 levels.','a = 255 ÷ 118 ≈ 2.16.','Then k = a(128 − 96) − 128 = 2.161 × 32 − 128 ≈ −58.8: a hazy photo needs to get darker as well as stretched.'],
   lab:{set:{photo:'hazy',scene:'lake'},act:'levels',look:'Read the contrast slider and <b>Darkest pixel becomes</b> / <b>Brightest pixel becomes</b>.'},verify:[['outlo',0,0.01],['outhi',255,0.01],['range',100,0.01]]},
  {id:'evalf',kind:'test',lvl:'honors',
   q:'A filter is f(x) = 1.5(x − 128) + 128 + 20. What does it do to a pixel value of 100?',
   num:{ans:106,tol:0.01,unit:''},
   steps:['x − 128 = 100 − 128 = −28.','1.5 × (−28) = −42.','−42 + 128 + 20 = 106.']},
  {id:'which',kind:'test',lvl:'honors',
   q:'Which function doubles the contrast about the middle value 128, then darkens everything by 10?',
   choices:['f(x) = 2x − 10','f(x) = 2(x − 128) + 118','f(x) = 2(x − 10) + 128','f(x) = (x − 128)/2 + 118'],correct:1,
   steps:['Contrast about the middle: 2(x − 128) + 128.','Darkening by 10 is a vertical shift down: subtract 10.','2(x − 128) + 128 − 10 = 2(x − 128) + 118. Check: 128 maps to 118, so the middle moved down by 10.']},
  {id:'ct',kind:'real',lvl:'ap',
   q:'A radiologist views a CT scan with a window of width 400 and level 40: values from 40 − 200 = −160 to 40 + 200 = 240 are stretched linearly onto 0–255, and everything outside clips. What gray level shows tissue with a value of 100?',
   num:{ans:166,tol:1,unit:''},
   steps:['The map sends −160 to 0 and 240 to 255: g(v) = 255(v + 160)/400.','g(100) = 255 × 260 ÷ 400 = 165.75.','Rounded, the pixel shows gray level 166. Bone at +700 would clip to 255.']},
  {id:'inverse',kind:'test',lvl:'ap',
   q:'The levels stretch for the dark photo is f(x) = 255(x − 12)/96. After the edit, a pixel shows 200. What was its value before the edit?',
   num:{ans:87.3,tol:0.5,unit:''},
   steps:['Solve y = 255(x − 12)/96 for x: x = 12 + 96y/255. That is the inverse function.','x = 12 + 96 × 200 ÷ 255 = 12 + 75.3 = 87.3.','Stored pixels are whole numbers, so it was 87. Without clipping, every edit like this can be undone.']}
 ]
}
});
