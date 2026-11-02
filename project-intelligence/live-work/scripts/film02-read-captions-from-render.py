# Film 02: what Carl's placed captions are in film2-review.mp4, read by differencing against the clean clips. Read-only.
import csv, glob, io, json, os, re, subprocess
import numpy as np, cv2
FILM=os.path.expanduser('~/Videos/C2B Films/02 Ornate corners'); HERE=os.path.dirname(os.path.abspath(__file__))
TESS=r'C:\Program Files\Tesseract-OCR\tesseract.exe'; FPS=30; W,H=1920,1080
REVIEW=FILM+'/film2-review.mp4'
def srt():
    out=[]
    for b in open(FILM+'/07 Subtitles/film2.srt',encoding='utf8').read().strip().split('\n\n'):
        l=b.split('\n'); t=[int(a)*3600+int(m)*60+int(s)+int(d)/1000 for a,m,s,d in re.findall(r'(\d+):(\d+):(\d+),(\d+)',l[1])]
        out.append(dict(i=int(l[0]),a=t[0],b=t[1],lines=l[2:]))
    return out
L=open(FILM+'/cut10.edl',encoding='utf8',errors='replace').read().splitlines(); clips=[]
f_=lambda tc:(lambda h,mi,s,fr:(h-1)*3600*FPS+mi*60*FPS+s*FPS+fr)(*map(int,tc.split(':')))
for i,x in enumerate(L):
    m=re.match(r'\d{3}\s+\S+\s+V\s+C\s+\S+\s+\S+\s+(\S+)\s+(\S+)',x)
    if m: clips.append((next(y.split(': ')[1] for y in L[i+1:i+3] if 'FROM CLIP' in y)[:3],f_(m[1]),f_(m[2])))
files={os.path.basename(f)[:3]:f for f in glob.glob(FILM+'/09 Cut - 10 min/*.mov')}
assert len(clips)==55 and len(files)==55
def frame(p,t):
    r=subprocess.run(['ffmpeg','-v','error','-ss',f'{t:.4f}','-i',p,'-frames:v','1','-vf','format=bgr24','-f','rawvideo','-'],capture_output=True)
    assert len(r.stdout)==W*H*3,(p,t,len(r.stdout)); return np.frombuffer(r.stdout,np.uint8).reshape(H,W,3).copy()
out=[]
for s in srt():
    fr=round((s['a']+s['b'])/2*FPS); c=[k for k in clips if k[1]<=fr<k[2]][0]
    R=frame(REVIEW,(fr+.5)/FPS); S=frame(files[c[0]],(fr-c[1]+.5)/FPS)
    d=cv2.absdiff(R,S).max(axis=2).astype(np.int16)
    # caption pixels: bright in the render, clearly changed from the clean clip
    m=((R.min(axis=2)>170)&(d>40)).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((9,25),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(m)
    keep=[k for k in range(1,n) if st[k,cv2.CC_STAT_AREA]>400 and st[k,cv2.CC_STAT_HEIGHT]>=18]
    if not keep:
        out.append(dict(i=s['i'],clip=c[0],lines=s['lines'],found=False)); print(s['i'],c[0],'NOT FOUND'); continue
    x0=min(st[k,0] for k in keep); y0=min(st[k,1] for k in keep); x1=max(st[k,0]+st[k,2] for k in keep); y1=max(st[k,1]+st[k,3] for k in keep)
    pad=8; crop=R[max(0,y0-pad):y1+pad,max(0,x0-pad):x1+pad]
    g=255-cv2.resize(cv2.cvtColor(crop,cv2.COLOR_BGR2GRAY),None,fx=2,fy=2,interpolation=cv2.INTER_CUBIC)
    p=os.path.join(HERE,'_c.png'); cv2.imwrite(p,g)
    txt=subprocess.run([TESS,p,'stdout','--psm','6'],capture_output=True,text=True,encoding='utf8').stdout
    rows=[l.strip() for l in txt.splitlines() if l.strip()]
    prof=(m[y0:y1,x0:x1].sum(axis=1)>0).astype(int); nl=int(((prof[1:]==1)&(prof[:-1]==0)).sum()+prof[0])
    out.append(dict(i=s['i'],clip=c[0],lines=s['lines'],found=True,x0=int(x0),y0=int(y0),x1=int(x1),y1=int(y1),cy=int((y0+y1)/2),cx=int((x0+x1)/2),nl=nl,ocr=rows))
    print(s['i'],c[0],f'y {y0}-{y1} cy {(y0+y1)//2} x {x0}-{x1} lines {nl}',' / '.join(rows)[:80])
json.dump(out,open(os.path.join(HERE,'placed.json'),'w'),indent=0)
print('found',sum(o['found'] for o in out),'of',len(out))
