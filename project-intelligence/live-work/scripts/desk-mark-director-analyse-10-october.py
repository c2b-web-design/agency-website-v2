"""THE LIGHT, DIRECTED — the analysis of desk-mark-director-measure-10-october.mjs's frames (10 October 2026): per held
point, the mark's pixels (changed against the no-mark frame, the union of ON and OFF), their mean luminance and the
share brighter than 90/255, director OFF vs ON. Run from the frames' folder."""
import numpy as np
from PIL import Image
L = lambda f: np.asarray(Image.open(f).convert("RGB")).astype(np.int16)
bg = {"roles": L("bg-roles.png"), "examples": L("bg-examples.png")}
rows = []
for i in range(41):
    f = f"{i/40:.3f}"; view = "roles" if i/40 <= 0.875 else "examples"
    ims = [L(f"{c}-{f}.png") for c in ("off", "on")]
    m = (np.abs(ims[0] - bg[view]).sum(axis=2) > 45) | (np.abs(ims[1] - bg[view]).sum(axis=2) > 45)
    out = []
    for im in ims:
        lum = (0.2126*im[...,0] + 0.7152*im[...,1] + 0.0722*im[...,2])[m]
        out.append((lum.mean() if lum.size else 0, (lum > 90).mean() if lum.size else 0))
    rows.append((f, int(m.sum()), out))
print(" fall   px   OFF mean/lit%   ON mean/lit%")
for f, n, ((m0, l0), (m1, l1)) in rows:
    print(f"{f} {n:6d}   {m0:5.1f} {l0*100:4.0f}%   {m1:5.1f} {l1*100:4.0f}%{'   <<' if m1 < m0 - 3 else ''}{'   DARK' if l1 < 0.15 and n > 200 else ''}")
sel = [r for r in rows if r[1] > 200]
print(f"MEAN over frames with the mark: OFF {np.mean([r[2][0][0] for r in sel]):.1f} lit {np.mean([r[2][0][1] for r in sel])*100:.0f}%  |  ON {np.mean([r[2][1][0] for r in sel]):.1f} lit {np.mean([r[2][1][1] for r in sel])*100:.0f}%")
print(f"frames under 15% lit: OFF {sum(r[2][0][1] < 0.15 for r in sel)}/{len(sel)}  ON {sum(r[2][1][1] < 0.15 for r in sel)}/{len(sel)}")
