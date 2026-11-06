BioLab.addPractical({
matrices:{
 hook:'You are building a simple game for your coding class. Your character is this F, and one key press should turn it a quarter turn counterclockwise around the origin, (0, 0). The game stores only the corners. Where should the tip at (3, 5) end up, and how does the computer know?',
 answer:'At (−5, 3). The game multiplies the corner by the rotation matrix (top row 0, −1; bottom row 1, 0): 3 × (0, 1) + 5 × (−1, 0) = (−5, 3). It does the same for every corner, every frame, and connects the dots.',
 uses:[
  'Games and 3D graphics: the graphics chip (GPU) in a game console, computer or phone places every corner of every 3D shape on screen by multiplying it by matrices that rotate, scale and move it, millions of times a second.',
  'Photo and video apps: rotating, straightening, resizing or skewing a picture applies a matrix like these to the position of every pixel, then fills in the colors.',
  'Artificial intelligence: neural networks, including the models behind chatbots and image recognition, do most of their work as huge matrix multiplications. That is why they run on the same graphics chips games use.'
 ],
 takeaway:'A matrix’s columns tell you where (1, 0) and (0, 1) go, and everything else follows. Two moves in a row is a matrix product, the order matters, and the determinant tells you the area scale and whether the shape flipped.'
}
});
