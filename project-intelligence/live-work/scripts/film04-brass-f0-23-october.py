# FILM 04 PASS 2 - BRASS F0, THE SECOND SOURCE (23 October 2026). Derives brass reflectance at normal incidence, linear
# RGB, from MEASURED optical constants: M. R. Querry, Optical constants, CRDC-CR-85034 (1985), via refractiveindex.info (CC0):
#   curl -s https://refractiveindex.info/database/data/other/alloys/Cu-Zn/nk/Querry-Cu70Zn30.yml -o Cu70Zn30.yml   (and Cu90Zn10)
#   python -I film04-brass-f0-23-october.py Cu70Zn30.yml Cu90Zn10.yml
# Result: 70/30 brass (0.895, 0.782, 0.413) spectral; physicallybased.info lists (0.910, 0.778, 0.423) - agree within 0.015.
# NOT WATCHED: D65 (illuminant E is used, white-normalised) and the exact CIE tables (the Wyman 2013 fit) - each worth ~0.01-0.02.
import math, re, sys
# CIE 1931 2-degree CMFs: Wyman, Sloan & Shirley (2013) multi-lobe fit (JCGT 2(2))
def g(x, mu, s1, s2):
    t = (x - mu) / (s1 if x < mu else s2)
    return math.exp(-0.5 * t * t)
def xbar(l): return 1.056*g(l,599.8,37.9,31.0) + 0.362*g(l,442.0,16.0,26.7) - 0.065*g(l,501.1,20.4,26.2)
def ybar(l): return 0.821*g(l,568.8,46.9,40.5) + 0.286*g(l,530.9,16.3,31.1)
def zbar(l): return 1.217*g(l,437.0,11.8,36.0) + 0.681*g(l,459.0,26.0,13.8)
M = [[3.2404542,-1.5371385,-0.4985314],[-0.9692660,1.8760108,0.0415560],[0.0556434,-0.2040259,1.0572252]]
def rgb(X,Y,Z): return [M[i][0]*X+M[i][1]*Y+M[i][2]*Z for i in range(3)]
for f in sys.argv[1:]:
    rows = [tuple(map(float, l.split())) for l in open(f).read().split("data: |")[1].strip().splitlines() if re.match(r"\s*\d", l)]
    def nk(lam):  # linear interpolation, lam in um
        for (a,na,ka),(b,nb,kb) in zip(rows, rows[1:]):
            if a <= lam <= b:
                t = (lam-a)/(b-a); return na+t*(nb-na), ka+t*(kb-ka)
    def R(lam):
        n,k = nk(lam/1000); return ((n-1)**2+k*k)/((n+1)**2+k*k)
    S = [0,0,0]; W = [0,0,0]
    for l in range(380, 781, 5):
        c = (xbar(l), ybar(l), zbar(l)); r = R(l)
        for i in range(3): S[i] += c[i]*r; W[i] += c[i]
    s, w = rgb(*S), rgb(*W)
    spectral = [s[i]/w[i] for i in range(3)]
    single = [R(l) for l in (612, 549, 465)]
    print(f, "spectral (illuminant E, white-normalised):", [round(x,3) for x in spectral], " single-wavelength 612/549/465 nm:", [round(x,3) for x in single])
