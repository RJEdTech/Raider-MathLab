BioLab.addPractical({
rotations:{
 hook:{bio:'You are programming your robotics team’s arm. Its controller moves the gripper with one multiplication, the same move your phone makes to turn Wi-Fi signals back. The gripper sits at 3 + i: 3 squares right of the base and 1 square up, with each square 10 cm. You send the command “multiply by 1 + i”. Where will the gripper end up?',honors:'You are programming your robotics team’s arm, and its controller works like your phone’s Wi-Fi chip: it turns things by multiplying by a complex number. The gripper sits at 3 + i on the complex plane, with the base at the origin and each square 10 cm. You multiply its position by 1 + i. Where does the gripper end up?'},
 answer:'At 2 + 4i. Multiplying by 1 + i stretches the arm by √2 ≈ 1.41 (from 31.6 cm to 44.7 cm) and turns it 45° counterclockwise (from an angle of 18.4° to 63.4°).',
 uses:[
  'Wi-Fi and phone signals: each burst of a signal is sent as a point in the complex plane, picked from a grid of points called a QAM constellation. Wi-Fi 6 can use 1024 points, so each one carries 10 bits. When the received points arrive turned, the receiver turns them back by multiplying by a complex number.',
  'AC circuits: electrical engineers write alternating voltages and currents as complex numbers called phasors (they write j instead of i). In a capacitor, the current runs a quarter cycle ahead of the voltage, which shows up as a factor of j: a 90° turn.',
  '3D graphics and spacecraft: game engines, animation software and spacecraft attitude systems rotate objects with quaternions, a four-part extension of complex numbers that William Rowan Hamilton invented in 1843 to do in 3D what multiplying by a complex number does in 2D.'
 ],
 takeaway:'Multiplying by a complex number turns and stretches in one step: lengths multiply and angles add. Multiplying by i is a quarter turn counterclockwise.'
}
});
