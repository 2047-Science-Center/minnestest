# Lögndetektorn — scen-assets (PROMPTER, generera själv)

En immersiv scenbakgrund per R1-scenario som matchar minnet man återberättar. Samma varma,
filmiska men vardagliga **v3-stil** som andra sidan. **Inga synliga ansikten. 3:2.**
Bas-namn = `ld_laxa` (tutorial) + `ld_1_pixel … ld_5_utflykt` (ljudbilderna matchar; redan genererade).

**Så gör du:** gpt-image-1 **1536×1024** på bild-prompten → Runway **gen4_turbo** **1280:720**,
5 s, loop-vänligt på rörelse-prompten. Spara som `<bas>.png` resp. `<bas>.mp4`.

**v3-stilrad (ingår sist i varje BILD-prompt):**
> `Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.`

---

## ld_laxa — klassrummet (TUTORIAL: läxan)
**Bild (gpt-image-1):**
```
An ordinary present-day Scandinavian classroom in warm morning light, seen from the front of the room: a teacher's wooden desk with a neat stack of handed-in paper assignments and an open grade book, a conspicuous empty gap on the desk where one assignment is missing, rows of empty pupil desks behind, a whiteboard with faint marks, a wall clock, a schoolbag slumped on a chair. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway (gen4_turbo):**
```
Dust drifts in the warm window light, the clock's second hand ticks, the top page of the stack lifts and settles in a faint draft. subtle, slow, seamless loop
```

## ld_1_pixel — hemma med hunden
**Bild (gpt-image-1):**
```
A cozy ordinary Scandinavian living room in warm evening light, a dog lying on a rug by a sofa, a leash and a tennis ball on the floor, a lamp glowing, a window with soft dusk outside — a lived-in family home, the dog seen in profile. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway (gen4_turbo):**
```
The dog breathes slowly and an ear twitches, warm lamp light flickers gently, dust drifts in the window light. subtle, slow, seamless loop
```

## ld_2_youtuber — köpcentrum
**Bild (gpt-image-1):**
```
The interior of an ordinary modern shopping mall in warm light, shop fronts and signage glow, an escalator and a few distant blurred shoppers seen from behind as silhouettes far away, reflections on a polished floor, a planter and benches. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway (gen4_turbo):**
```
Distant shoppers drift slowly, the escalator moves, shop-sign light shimmers and reflections shift on the floor. subtle, slow, seamless loop
```

## ld_3_london — central Londongata
**Bild (gpt-image-1):**
```
A central London street at dusk, a red double-decker bus and black cab, wet pavement with warm reflections, classic lamp posts and brick facades, a few distant pedestrians as silhouettes, a hint of a landmark far off. Cinematic yet grounded photograph, present-day ordinary setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway (gen4_turbo):**
```
A red bus rolls slowly past, tail lights shimmer on wet pavement, distant figures drift, light haze moves. subtle, slow, seamless loop
```

## ld_4_jonglera — lugnt övningsrum
**Bild (gpt-image-1):**
```
A calm empty rehearsal or gymnastics practice room in warm low light, wooden floor, a mirror along one wall, juggling balls and clubs resting on a bench and on the floor, a single hanging lamp, soft dust in the air. Cinematic yet grounded photograph, present-day ordinary setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway (gen4_turbo):**
```
A hanging lamp sways slightly, dust floats through the warm light, a juggling ball rolls a few centimetres and settles. subtle, slow, seamless loop
```

## ld_5_utflykt — het sommarutflykt
**Bild (gpt-image-1):**
```
A hot summer outdoor excursion on a sunny field by a path, dry grass and shimmering heat haze over asphalt, backpacks and a dropped water bottle on the ground, a lone tree giving thin shade, harsh bright midday light. Cinematic yet grounded photograph, present-day ordinary Scandinavian setting with modern everyday recognizable objects, lit with warm atmospheric cinematic light — a soft amber-golden glow, gentle haze, moody shadows, subtle film grain, shallow depth of field. Dramatic but restrained and cohesive, evocative mood. No visible faces, no text.
```
**Runway (gen4_turbo):**
```
Heat haze shimmers over the ground, dry grass sways in a faint breeze, light flickers through the lone tree. subtle, slow, seamless loop
```
