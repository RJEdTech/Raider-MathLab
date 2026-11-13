BioLab.addPractical({
noisecancel:{
 hook:'On a long flight, the engines fill the cabin with a steady low drone. Your headphones can play any sound wave they like into your ears. What wave should they play to make the drone disappear?',
 answer:'The same wave flipped upside down: shifted by half a period (180°) with the same amplitude. Every high of the drone then meets a low of the anti-noise. In this model, with the electronics off by up to 0.05 ms, that cuts a 100 Hz drone by about 35 dB but a 4000 Hz whine by only about 4 dB.',
 uses:[
  '<b>Do:</b> use noise-canceling headphones for steady low sounds like engine drone, and rely on a good seal for high sounds. <b>Why:</b> microphones pick up outside sound and a chip plays it back flipped upside down, which works best on steady, low sounds; the ear cushions do more against high sounds.',
  '<b>Do:</b> on a bus or plane, notice that the low hum fades while voices don’t. <b>Why:</b> some cars and propeller airliners play anti-noise through cabin speakers or shakers to cancel steady low drone and hum.',
  '<b>Do:</b> on a call, keep your phone’s microphones pointed toward your mouth. <b>Why:</b> phones and laptops with two or more microphones shift their signals in time and add them, so your voice lines up and adds up while sound from other directions partly cancels.'
 ],
 takeaway:'A sine wave shifted by half its period, with the same amplitude, cancels the original. The faster the wave, the less time there is to get that shift right, which is why anti-noise works best on low, steady sounds.'
}
});
