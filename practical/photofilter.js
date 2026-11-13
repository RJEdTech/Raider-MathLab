BioLab.addPractical({
photofilter:{
 hook:{bio:'Your photo of a mountain lake from a family trip came out too dark. Your phone stores every pixel’s brightness as a number from 0 (black) to 255 (white), and in this photo every number sits between 12 and 108. What edit makes it look its best without losing any detail?',
  honors:'Your photo of a mountain lake from a family trip came out too dark. Every value in it sits between 12 and 108, out of a possible 0 to 255. What edit makes it look its best without losing any detail?'},
 answer:'A levels stretch: contrast ×2.66 about the middle plus brightness +180, which is f(x) = 255(x − 12)/96. It sends 12 to 0 and 108 to 255, so the photo uses 100% of the range and no pixel is clipped. Brightness alone (+147) only slides the band up: it still uses just 38% of the range.',
 uses:[
  '<b>Do:</b> in a photo editor, set the black point and white point with Levels before you touch anything else. <b>Why:</b> Brightness, Contrast, Levels and Curves are each a function applied to every pixel value, and Levels is exactly the stretch in this tool.',
  '<b>Do:</b> if you see a CT image, ask what window and level it uses. <b>Why:</b> CT pixels run from about −1000 (air) to well over +1000 (dense bone), far more than a screen can show, so radiologists map one slice of that range onto black through white. A narrow window separates soft tissues; a wide one shows bone.',
  '<b>Do:</b> try your phone’s color-invert setting if light-on-dark text is easier for you to read. <b>Why:</b> it applies 255 − x to every pixel. In the standard sRGB system a value of 128 lights a pixel to only about a fifth of full brightness, not half, to match how your eyes sense light.'
 ],
 takeaway:'Brightness shifts, contrast stretches, invert reflects. To fix a dull photo, find its darkest and brightest values and stretch them to 0 and 255; go past that and you clip away detail.'
}
});
