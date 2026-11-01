import glob, importlib.util, os, subprocess, sys, textwrap, json
import numpy as np, cv2
S=r"C:\Users\Carl Buckley\agency-website-v2\project-intelligence\live-work\scripts\film02-subtitles-build.py"
sp=importlib.util.spec_from_file_location("fb",S); fb=importlib.util.module_from_spec(sp); sys.argv=[S]; sp.loader.exec_module(fb)
rows=fb.rows; cl=fb.clips()
C=os.path.expanduser('~/Videos/C2B Films/02 Ornate corners/09 Cut - 10 min')
files={os.path.basename(f)[:3]:f for f in glob.glob(C+"/*.mov")}
W,H=1920,1080
N=set("03B 03C 03K 04A 04E 04F 06A 06B 06C 08C".split()); CHAT=set("01A 01B 01D 03A 03D 03E 03J 03L 03S 04D 04J 05A 05B 05C".split())
def crop_line(c): return 940 if c in N else 965 if c=="03G" else 1032 if c in CHAT else 1080
CANDS=[216,120,540,835,960]   # Resolve's Y, counted up from the bottom; first line's centre = 1080 - Y (film 01: Y 835 at y 245)
out=[]
cache={}
for i,(c,a,b,text) in enumerate(rows,1):
    lines=textwrap.wrap(text,42); n=len(lines); w=int(max(len(l) for l in lines)*26.5)
    s0=cl[c][0]; fr=[]
    for f in (0.2,0.5,0.8):
        t=max(0,(a+(b-a)*f)-s0)
        k=(c,round(t,1))
        if k not in cache:
            p=subprocess.run(["ffmpeg","-v","error","-ss",f"{t:.3f}","-i",files[c],"-frames:v","1","-vf","scale=in_range=tv:out_range=pc","-f","rawvideo","-pix_fmt","gray","-"],capture_output=True)
            g=np.frombuffer(p.stdout,dtype=np.uint8).reshape(H,W).copy(); g[crop_line(c):]=0
            cache[k]=g
        fr.append(cache[k])
    res={}
    for Y in CANDS:
        y0=1080-Y; top=max(0,y0-44); bot=min(H,y0-44+n*80+12)
        if y0-44+n*80+12>H+4: res[Y]=1.0; continue
        x0=max(0,960-w//2-10); x1=min(W,960+w//2+10)
        res[Y]=float(max((g[top:bot,x0:x1]>70).mean() for g in fr))
    out.append(dict(i=i,clip=c,at=fb.clock(a),n=n,text=text,res=res))
json.dump(out,open("f2/place.json","w"))
print(len(out))
