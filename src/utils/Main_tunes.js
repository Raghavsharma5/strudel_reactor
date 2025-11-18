export const stranger_tune = `setcps(<tempo_Number>140</tempo_Number>/60/4)
samples('github:algorave-dave/samples')
samples('https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json')
samples('https://raw.githubusercontent.com/Mittans/tidal-drum-machines/main/machines/tidal-drum-machines.json')

// High Energy EDM BEAT.
<p1_Radio>drums:
stack(
  s("bd:3").struct("[x ~ ~ ~]*2")
    .gain(1.2).speed(0.95).room(0.2),
  s("sd:5").struct("~ x ~ x")
    .gain(0.9).speed(1.1).room(0.3),
  s("tech:8").struct("x*8")
    .gain(0.4).speed(0.8).lpf(3000)
)

<p3_Checkbox>hihats:
stack(
  s("hh:2").struct("x*16")
    .gain("0.6 0.4!3").bank("RolandTR808")
    .speed(0.9).room(0.2),
  s("hh:4").struct("[~ x]*8")
    .gain(0.5).speed(1.2).hpf(8000)
)

<p2_Checkbox>bassline:
note("[[c2 ~!3]*4, [c2 eb2 f2 g2]/8]")
  .sound("sawtooth")
  .postgain(<volume_Slider>2</volume_Slider>)
  .lpf(sine.range(300, 800).slow(4))
  .lpenv(2.5)
  .room(0.3)

<p5_Checkbox>melody:
stack(
  note("<[c4 eb4 g4 bb4]*4 [f4 ab4 c5 eb5]*4>")
    .sound("square")
    .lpf(2000)
    .adsr("0:.05:.3:.2")
    .gain(<melody_Volume>1</melody_Volume>)
    .room(0.6),
  note("<c5 eb5 g5 bb5>")
    .sound("triangle")
    .gain(0.6)
    .delay(0.25)
    .delaytime(0.125)
)

<p6_Checkbox>percussion:
s("cp:2, rim:1").struct("[x ~!3 x ~!3]*2")
  .bank("RolandTR808")
  .gain(<percussion_Volume>0.5</percussion_Volume>)
  .speed("0.9 1.1")
  .room(0.4)

<p4_Checkbox>reverb_fx:
s("tech:12").struct("[~ ~ x ~]*2")
  .room(0.9)
  .delay(0.5)
  .gain(<reverb_Volume>0.3</reverb_Volume>)
  .speed(0.5)

// @version CYBER PULSE v1.0`;