/**
 * The c2b mark, embedded as a packed 1-bit alpha bitmap.
 *
 * ⚠ EMBEDDED RATHER THAN LOADED FROM A FILE, and that is a constraint rather
 * than a convenience. `brand-assets/` sits outside `public/`, so Next.js cannot
 * serve it to the browser — using the PNG directly would mean copying a brand
 * asset into the web root and giving it two homes. Carl declined that:
 * `brand-assets/` stays the single source.
 *
 * ⚠ AND THE .svg MASTER IS NOT A VECTOR. `c2b-logo-gold-hero.svg` embeds a
 * base64 PNG inside an <image> element — its own <desc> says so: "This SVG
 * embeds a raster PNG to retain the metallic 3D finish." It contains zero
 * <path> elements, so there was no outline to lift.
 *
 * The shape is therefore traced from the alpha channel of
 * `c2b-flat-white-alpha-cleaned-1x.png` — a hard binary stencil with zero
 * partial alpha, which downsamples cleanly to 1 bit per pixel.
 *
 * 180 x 91 at 1 bit = 2732 base64 characters. The mark renders at ~104px tall,
 * so this already exceeds its display resolution; 360 wide would have cost
 * 10,860 characters for detail invisible through frosted glass.
 */
export const MARK_BITMAP_WIDTH = 180;
export const MARK_BITMAP_HEIGHT = 91;

/** 1 bit per pixel, row-major, packed 8 to a byte, then base64. */
export const MARK_BITMAP_PACKED =
  "AAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/+AAAAAAAAAAAAAAAAAAAAAAAAAAB///" +
  "wAAAP//gAAAAAAAAAAAAAAAAAAH///8AAAf//gAAAAAAAAAAAAAAAAAAf////AAAf//gAAAAAAAA" +
  "AAAAAAAAAA/////gAAf//gAAAAAAAAAAAAAAAAAD/////4AAf//gAAAAAAAAAAAAAAAAAH/////8" +
  "AAf//gAAAAAAAAAAAAAAAAAP/////+AAf//gAAAAAAAAAAAAAAAAAf//////AAf//gAAAAAAAAAA" +
  "AAAAAAA///////AAf//gAAAAAAAAAAAAAAAAB///////gAf//gAAAAAAAAAAAAAAAAD///////wA" +
  "f//gAAAAAAAAAAAAAAAAH///////wAf//gAAAAAAAAAAAAAAAAH///////4Af//gAAAAAAAAAAAA" +
  "AAAAP///////4Af//gAAAAAAAAAAAAAAAAP///////8Af//gAAAAAAAAAAAAAAAAf///A///8Af/" +
  "/gAAAAAAAAAAAAAAAA///4AP//+Af//gAAAAAAAAAAAAAAAA///gAH//+Af//gAAAAAAAAAAAAAA" +
  "AB///AAD//+Af//gAAAAAAAAAAAAAAAB//+AAB//+Af//gAAAAAAAAAAAAAAAB//8AAA//+Af//g" +
  "AAAAAAAAAAAAAAAD//4AAA///Af//gAAAAAAAAAAAAAAAD//4AAA///Af//gAAAAAAAAAAAAAAAD" +
  "//wAAA///Af//gAAAAAAAAAAAAAAAH//wAAAf//Af//gAAAAAAAAAAADAAAH//gAAAf//Af//gAA" +
  "AAAAAAAAP//wAH//gAAA///Af//h//AAAAAAAB///+AH//gAAA///Af/////8AAAAAAH////gH//" +
  "AAAA//+Af//////AAAAAAf////4AAAAAAA//+Af//////wAAAAB/////+AAAAAAB//+Af//////8" +
  "AAAAH//////AAAAAAD//+Af///////AAAAP//////gAAAAAD//8Af///////gAAAf//////wAAAA" +
  "AH//8Af///////wAAB///////4AAAAAP//8Af///////4AAD///////8AAAAAf//4Af///////8A" +
  "AH///////+AAAAA///4Af///////+AAP////////AAAAB///wAf////////AAP////////gAAAD/" +
  "//wAf////////gAf////////AAAAH///gAf////////gA/////////AAAAP///AAf////////wB/" +
  "///////8AAAAf///AAf////////wB////AH//4AAAA///+AAf///gf///4D///8AA//gAAAB///8" +
  "AAf//8AD///4D///wAAf/AAAAD///4AAf//wAA///8H///AAAH8AAAAH///wAAf//gAAf//8H//+" +
  "AAAD4AAAAP///gAAf//gAAP//+P//8AAABgAAAAf///AAAf//gAAH//+P//4AAAAAAAAA///+AAA" +
  "f//gAAD//+P//wAAAAAAAAB///8AAAf//gAAB///f//wAAAAAAAAD///4AAAf//gAAB///f//gAA" +
  "AAAAAAH///wAAAf//gAAA///f//gAAAAAAAAP///gAAAf//gAAA///f//AAAAAAAAA////AAAAf/" +
  "/gAAA///f//AAAAAAAAA///+AAAAf//gAAAf//f//AAAAAAAAB///8AAAAf//gAAAf//f//AAAAA" +
  "AAAD///4AAAAf//gAAAf/////AAAAAAAAP///wAAAAf//gAAAf/////AAAAAAAAf///gAAAAf//g" +
  "AAAf//f//AAAAAAAA////AAAAAf//gAAAf//f//AAAAAAAB///+AAAAAf//gAAAf//f//AAAAAAA" +
  "D///8AAAAAf//gAAA///f//AAAAAAAH///wAAAAAf//gAAA///f//gAAAAAAP///gAAAAAf//gAA" +
  "A///f//gAAAAAAf///AAAAAAf//gAAB///f//wAAAAAA////AAAAAAP//AAAB//+P//wAAAAAB//" +
  "/8AAAAAAAAAAAAD//+P//4AAAAAD///4AAAAAAAAAAAAH//+P//8AAAAAH///wAAAAAAAAAAAAH/" +
  "/+H//+AAAAAP///gAAAAAAAAAAAAf//8H///AAAAAf///gAAAAAAAAAAAA///8D///wAAAA////A" +
  "AAAAAAAAAAAB///4D///8AAAD////gAAAAAAAAAAAH///4B////wAA/////4AAAAAAAAAAB////w" +
  "B////////////////////////////wA////////////////////////////gAf//////////////" +
  "/////////////AAf//////////////////////////+AAP//////////////////////////+AAH" +
  "//////////////////////////8AAD//////////////////////////4AAB////////////////" +
  "//////////wAAAf/////////////////////////AAAAP////////////////////////+AAAAH/" +
  "///////////////////////8AAAAB///////wf///////////////wAAAAAf//////AH////////" +
  "///////AAAAAAD/////8AB//////////////4AAAAAAAf////gAAP/////////////AAAAA=";
