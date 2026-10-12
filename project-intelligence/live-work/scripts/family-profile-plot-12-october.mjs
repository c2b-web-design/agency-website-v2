import { chromium } from "playwright";
const CROWN=8.5,PLAT=0.15,GAT=0.62,GD=0.13,r=20.5,S=24,W=1440,H=520,ox=120,oy=380;
const ch=t=>{const a=Math.abs(t);if(a<=PLAT)return CROWN;const u=(a-PLAT)/(1-PLAT);const b=(1+Math.cos(u*Math.PI))/2;const d=(u-GAT)/0.13;return CROWN*Math.max(0,b-GD*Math.exp(-d*d));};
let pts=[];for(let i=0;i<=400;i++){const e=(i/400)*2*r;pts.push([ox+e*S,oy-ch(1-e/r)*S]);}
const path="M"+pts.map(p=>p.map(v=>v.toFixed(1)).join(",")).join(" L");
const x=e=>ox+e*S;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Geist, system-ui" >
<rect width="100%" height="100%" fill="#0a0a0a"/>
<rect x="${x(0)}" y="60" width="${6.62*S}" height="${oy-50}" fill="#1FB2C4" opacity="0.12"/>
<rect x="${x(2*r-6.62)}" y="60" width="${6.62*S}" height="${oy-50}" fill="#1FB2C4" opacity="0.12"/>
<line x1="${x(0)}" y1="${oy}" x2="${x(2*r)}" y2="${oy}" stroke="#444" stroke-width="1"/>
<path d="${path} Z" fill="#8a8a8a" stroke="#cfcfcf" stroke-width="2"/>
<line x1="${x(6.62)}" y1="70" x2="${x(6.62)}" y2="${oy+10}" stroke="#1FB2C4" stroke-dasharray="4 4"/>
<line x1="${x(2*r-6.62)}" y1="70" x2="${x(2*r-6.62)}" y2="${oy+10}" stroke="#1FB2C4" stroke-dasharray="4 4"/>
<text x="${x(3.3)}" y="52" fill="#9adfe8" font-size="15" text-anchor="middle">RIM 6.6 px</text>
<text x="${x(2*r-3.3)}" y="52" fill="#9adfe8" font-size="15" text-anchor="middle">RIM 6.6 px</text>
<text x="${x(r)}" y="52" fill="#aaa" font-size="15" text-anchor="middle">DOME, 8.5 px HIGH</text>
<text x="${x(6.62)}" y="${oy+32}" fill="#9adfe8" font-size="13" text-anchor="middle">groove</text>
<text x="${x(r)}" y="${oy+60}" fill="#777" font-size="14" text-anchor="middle">THE PILL CUT ACROSS ITS HEIGHT: 41 px, DRAWN 24 TIMES SIZE, FROM THE MESH'S OWN NUMBERS</text>
</svg>`;
const b=await chromium.launch({headless:true});const p=await (await b.newContext({viewport:{width:W,height:H}})).newPage();
await p.setContent(`<body style="margin:0;background:#0a0a0a">${svg}</body>`);await p.screenshot({path:process.argv[2]});await b.close();
