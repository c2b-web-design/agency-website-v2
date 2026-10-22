import fs from "node:fs";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TTFLoader } from "three-stdlib";
const buf = fs.readFileSync(process.argv[2]);
const data = new TTFLoader().parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const font = new Font(data);
for (const ch of [..."hrBn"]) {
  console.log(`--- ${ch}  raw o: ${data.glyphs[ch].o.slice(0, 400)}`);
  for (const sh of font.generateShapes(ch, data.resolution)) {
    const { shape, holes } = sh.extractPoints(12);
    console.log(` shape ${shape.length} pts, ${holes.length} holes; area sign ${Math.sign(area(shape))}`);
  }
}
function area(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i].x*q.y-q.x*p[i].y;}return a/2;}
