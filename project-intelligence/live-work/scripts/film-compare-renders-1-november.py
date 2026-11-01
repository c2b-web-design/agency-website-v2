import subprocess, sys, threading, queue
import numpy as np
D=sys.argv[1]; R4=D+r"\film1-review-4.mp4 .mp4"; R5=D+r"\film1-review-5.mp4"
TW,TH=320,180; N=TW*TH*3
def pipe(path):
    return subprocess.Popen(["ffmpeg","-v","error","-i",path,"-map","0:v:0","-fps_mode","passthrough","-vf",f"scale={TW}:{TH}:flags=area:in_range=tv:out_range=pc:in_color_matrix=bt709:out_color_matrix=bt709","-f","rawvideo","-pix_fmt","rgb24","-"],stdout=subprocess.PIPE,bufsize=10**8)
p4,p5=pipe(R4),pipe(R5)
rows=[]; thumbs=[]
while True:
    a=p4.stdout.read(N); b=p5.stdout.read(N)
    if len(a)<N or len(b)<N:
        print("end", len(a), len(b)); break
    x=np.frombuffer(a,dtype=np.uint8).reshape(TH,TW,3).astype(np.float32); y=np.frombuffer(b,dtype=np.uint8).reshape(TH,TW,3).astype(np.float32)
    d=np.abs(x-y).max(axis=2)
    m=(x.max(axis=2)>60)&(x.max(axis=2)<215)
    g=float(y[m].sum()/max(x[m].sum(),1)) if m.sum()>20 else 0.0
    rows.append((d.mean(),(d>10).mean(),g,float(y.max()),float(y.mean())))
r=np.array(rows,dtype=np.float32); np.save('cmp5.npy',r); print(r.shape)
assert len(r)==15232, len(r)
print("done")
