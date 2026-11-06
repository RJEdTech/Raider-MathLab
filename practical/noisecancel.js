BioLab.addPractical({
noisecancel:{
 hook:'On a long flight, the engines fill the cabin with a steady low drone. Your headphones can play any sound wave they like into your ears. What wave should they play to make the drone disappear?',
 answer:'The same wave flipped upside down: shifted by half a period (180°) with the same amplitude. Every high of the drone then meets a low of the anti-noise. In this model, with the electronics off by up to 0.05 ms, that cuts a 100 Hz drone by about 35 dB but a 4000 Hz whine by only about 4 dB.',
 uses:[
  'Noise-canceling headphones and earbuds: microphones on each ear cup pick up outside sound, and a chip plays it back flipped upside down. They work best on steady, low sounds like engine drone; the ear cushions do more of the work against high sounds.',
  'Cars and airplanes: some cars play anti-noise through their cabin speakers to cut low engine and road drone, and some propeller airliners use cabin microphones with speakers or shakers to cancel the propellers’ steady hum.',
  'Phone and video calls: phones, laptops and smart speakers with two or more microphones shift the microphones’ signals in time and add them, so your voice lines up and adds up while sound from other directions partly cancels.'
 ],
 takeaway:'A sine wave shifted by half its period, with the same amplitude, cancels the original. The faster the wave, the less time there is to get that shift right, which is why anti-noise works best on low, steady sounds.'
}
});
