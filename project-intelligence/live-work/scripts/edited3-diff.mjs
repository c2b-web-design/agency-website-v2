import sharp from "file:///C:/Users/Carl%20Buckley/agency-website-v2/node_modules/sharp/lib/index.js";
const M = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/office-image-3.jpg";
const E = "C:/Users/Carl Buckley/agency-website-v2/brand-assets/ChatGPT Image Sep 25, 2026, 11_12_06 AM.png";
// mapping measured by edited3-map.mjs
const KX = 2.3911, BX = 1.0, KY = 2.3848, BY = 3.8;
const e = await sharp(E).removeAlpha().greyscale().raw().toBuffer({ resolveWithObject: true }); const W = e.info.width, H = e.info.height;
const mm = await sharp(M).greyscale().raw().toBuffer({ resolveWithObject: true });
const bil = (d, w, h, x, y) => { if (x < 0 || y < 0 || x > w - 2 || y > h - 2) return NaN; const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0; return d[y0*w+x0]*(1-fx)*(1-fy) + d[y0*w+x0+1]*fx*(1-fy) + d[(y0+1)*w+x0]*(1-fx)*fy + d[(y0+1)*w+x0+1]*fx*fy; };
const Mv = (xe, ye) => { let s = 0, n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = bil(mm.data, 4000, 2250, KX*xe+BX+dx*0.8, KY*ye+BY+dy*0.8); if (!isNaN(v)) { s += v; n++; } } return n ? s/n : NaN; };
const signed = Buffer.alloc(W*H*3);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = Mv(x, y), b = e.data[y*W+x], i = (y*W+x)*3; if (isNaN(a)) { signed[i+1] = 90; continue; } const s = Math.max(-255, Math.min(255, (b-a)*3)); signed[i] = s > 0 ? s : 0; signed[i+2] = s < 0 ? -s : 0; }
await sharp(signed, { raw: { width: W, height: H, channels: 3 } }).png().toFile("C:/Users/Carl Buckley/AppData/Local/Temp/claude/c--Users-Carl-Buckley-agency-website-v2/92ee830b-ab55-4531-8f34-9f40aaae896f/scratchpad/edit3-signeddiff.png");
const regions = { "back wall, CA area (old TV)": [900,1000,2250,1640], "back wall, CB area (old shelf)": [1900,1000,2580,1450], "back wall above cabinet, left": [560,1300,1700,1500], "right wall above desk": [2700,700,3350,1150], "upper cabinets": [620,180,2500,420], "credenza drawers": [300,1600,1740,1900], "floor, centre": [900,2000,2000,2200], "left bookcase": [0,440,430,1200], "curtain, far right": [3780,300,3980,1200] };
console.log("region (master px)".padEnd(32), "master   edit   ratio  mean|diff|  >12");
for (const [k, [x0,y0,x1,y1]] of Object.entries(regions)) { let a=0,c=0,d=0,big=0,n=0; for (let y=y0;y<y1;y+=4) for (let x=x0;x<x1;x+=4) { const xe=(x-BX)/KX, ye=(y-BY)/KY; const mv=bil(mm.data,4000,2250,x,y), v=bil(e.data,W,H,xe,ye); if (isNaN(v)) continue; const dd=Math.abs(v-Mv(xe,ye)); a+=mv; c+=v; d+=dd; if (dd>12) big++; n++; } console.log(k.padEnd(32), (a/n).toFixed(1).padStart(6), (c/n).toFixed(1).padStart(6), (c/a).toFixed(2).padStart(7), (d/n).toFixed(1).padStart(9), (100*big/n).toFixed(1).padStart(6)+"%"); }
