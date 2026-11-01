"""Every frame of every clip in film 02's cut. Whole-frame stats per frame; the N by template in the lower left, every 6th frame."""
import glob, json, os, subprocess, sys
import numpy as np, cv2
C=sys.argv[1]; OUT="f2"; W,H=1920,1080
T0=cv2.resize(cv2.imread('n-template.png',0),(35,35),interpolation=cv2.INTER_AREA)
Ts=[cv2.resize(T0,None,fx=s,fy=s,interpolation=cv2.INTER_AREA) for s in (1.0,0.8,0.6)]
files=sorted(glob.glob(C+r"\*.mov")); assert len(files)==55,len(files)
res=[]
for fp in files:
    n=os.path.basename(fp)
    p=subprocess.Popen(["ffmpeg","-v","error","-i",fp,"-map","0:v:0","-fps_mode","passthrough","-f","rawvideo","-pix_fmt","gray","-"],stdout=subprocess.PIPE,bufsize=10**8)
    rows=[]; nsc=[]; i=0; N=W*H; mid=None
    while True:
        b=p.stdout.read(N)
        if len(b)<N: break
        a=np.frombuffer(b,dtype=np.uint8).reshape(H,W)
        rows.append((a.mean(),a.max(),(a>235).mean(),a[:,:6].mean(),a[:,-6:].mean(),a[:6,:].mean(),a[-6:,:].mean(),(a[:,:6]>200).mean(),(a[:,-40:]>200).mean(),(a[:40,:]>200).mean(),(a[-40:,:]>200).mean()))
        if i%6==0:
            reg=a[600:,:960]; best=0.0; loc=(0,0)
            for T in Ts:
                r=cv2.matchTemplate(reg,T,cv2.TM_CCOEFF_NORMED); _,mx,_,l=cv2.minMaxLoc(r)
                if mx>best: best=float(mx); loc=(l[0]+T.shape[1]//2,l[1]+T.shape[0]//2+600)
            nsc.append((i,best,loc[0],loc[1]))
        if i==75: mid=a.copy()
        i+=1
    p.wait()
    r=np.array(rows,dtype=np.float32); np.save(f"{OUT}/{n[:3]}.npy",r); np.save(f"{OUT}/{n[:3]}-n.npy",np.array(nsc,dtype=np.float32))
    res.append(n); print(n[:3],len(r),flush=True)
assert len(res)==55
print("done")
