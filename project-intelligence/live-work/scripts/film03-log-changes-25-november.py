"""Film 3 (the hero), logging step 2a: change detection on every discussion capture.

For each capture in `03 The hero\\01 Discussion\\` (the remux where one exists, the original for 9-11 November),
ffmpeg samples 2 fps at 480 px wide and keeps every frame whose scene score is over 0.015 (the films' standing
threshold, memory reference_film_edit_pipeline). Output, one CSV per capture in `03 The hero\\11 Log\\changes\\`:
`offset_s,score`. Step 2b (contact sheets) reads these.

Run:  python -I film03-log-changes-25-november.py   (4 captures at a time; ~25 min for the 52 h)
"""
import concurrent.futures as cf
import pathlib
import re
import subprocess
import sys

FILMS = pathlib.Path.home() / "Videos" / "C2B Films" / "03 The hero"
SRC = FILMS / "01 Discussion"
OUT = FILMS / "11 Log" / "changes"


def captures():
    names = sorted(p.name for p in SRC.glob("*.mkv"))
    keep = []
    for n in names:
        if n.endswith(".remux.mkv"):
            keep.append(n)
        elif n.replace(".mkv", ".remux.mkv") not in names:
            keep.append(n)
    return keep


def run(name):
    out = OUT / (name.split(".")[0] + ".csv")
    if out.exists() and out.stat().st_size > 0:
        return name, "kept"
    cmd = ["ffmpeg", "-hide_banner", "-nostats", "-i", str(SRC / name),
           "-vf", "fps=2,scale=480:-1,select='gt(scene,0.015)',showinfo", "-f", "null", "-"]
    p = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    rows = []
    for line in p.stderr.splitlines():
        m = re.search(r"pts_time:([\d.]+)", line)
        if m:
            rows.append(m.group(1))
    # showinfo does not print the score; the selected frames' times are what step 2b needs.
    tmp = out.with_suffix(".part")
    tmp.write_text("offset_s\n" + "\n".join(rows) + "\n", encoding="utf-8")
    tmp.replace(out)
    return name, f"{len(rows)} changes (exit {p.returncode})"


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    caps = captures()
    print(f"{len(caps)} captures", flush=True)
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for name, msg in ex.map(run, caps):
            print(name, msg, flush=True)
    sys.exit(0)
