BioLab.addPractical({
matrices:{
 hook:'You are building a simple game for your coding class. Your character is this F, and one key press should turn it a quarter turn counterclockwise around the origin, (0, 0). The game stores only the corners. Where should the tip at (3, 5) end up, and how does the computer know?',
 answer:'At (−5, 3). The game multiplies the corner by the rotation matrix (top row 0, −1; bottom row 1, 0): 3 × (0, 1) + 5 × (−1, 0) = (−5, 3). It does the same for every corner, every frame, and connects the dots.',
 uses:[
  '<b>Do:</b> in a 3D design or game project, rotate and scale objects with a transform matrix. <b>Why:</b> the graphics chip in a console, computer or phone places every corner of every 3D shape by multiplying it by matrices that rotate, scale and move it, millions of times a second.',
  '<b>Do:</b> when you straighten or skew a photo, notice the corners move and the colors get filled in. <b>Why:</b> photo apps apply a matrix like these to the position of every pixel, then fill in the colors.',
  '<b>Do:</b> when you hear AI needs graphics chips, remember it is mostly multiplying matrices. <b>Why:</b> neural networks, including the models behind chatbots and image recognition, do most of their work as huge matrix multiplications, the same job games give those chips.'
 ],
 takeaway:'A matrix’s columns tell you where (1, 0) and (0, 1) go, and everything else follows. Two moves in a row is a matrix product, the order matters, and the determinant tells you the area scale and whether the shape flipped.'
}
});
