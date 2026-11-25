"""Film 3 (the hero), logging step 2b: read the chat panel of every discussion capture.

Why: the beats are recorded with Carl's words, verbatim. Those words are on screen in VS Code's chat panel, with the
time he sent them. Reading the panel lets each beat be found by searching for his words, not by scrubbing 52 hours.

For each capture: ffmpeg writes one frame every 15 s (frame-exact at 30 fps), cropped to the chat panel
(x 280-1900, y 60-900 of 1920 x 1080; the Explorer and the taskbar left out), grey. A frame is read by Tesseract
when the 15 s before it held a change (step 2a's CSV) or on every 2-minute mark. Output, one TSV per capture in
`03 The hero\\11 Log\\ocr\\`: `offset_s<TAB>text` (lines joined by " | "). The frames are deleted after reading.

Run (after step 2a):  python -I film03-log-ocr-25-november.py [capture-stem ...]
"""
import concurrent.futures as cf
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile

FILMS = pathlib.Path.home() / "Videos" / "C2B Films" / "03 The hero"
SRC = FILMS / "01 Discussion"
CHANGES = FILMS / "11 Log" / "changes"
OUT = FILMS / "11 Log" / "ocr"
TESS = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
STEP = 15          # seconds between sampled frames
EVERY = 120        # always read on this mark
WORKERS = 12


def source_for(stem):
    remux = SRC / f"{stem}.remux.mkv"
    return remux if remux.exists() else SRC / f"{stem}.mkv"


def wanted(stem):
    times = [float(x) for x in (CHANGES / f"{stem}.csv").read_text().split()[1:] if x]
    windows = {int(t // STEP) for t in times}
    return windows


def ocr(png):
    env = dict(os.environ, OMP_THREAD_LIMIT="1")
    p = subprocess.run([TESS, str(png), "-", "--psm", "4"], capture_output=True, text=True,
                       encoding="utf-8", errors="replace", env=env)
    lines = [l.strip() for l in p.stdout.splitlines() if l.strip()]
    return " | ".join(lines).replace("\t", " ")


def do(stem):
    out = OUT / f"{stem}.tsv"
    if out.exists() and out.stat().st_size > 0:
        print(stem, "kept", flush=True)
        return
    tmp = pathlib.Path(tempfile.mkdtemp(prefix=f"f3ocr-{stem}-"))
    try:
        vf = f"select='not(mod(n\\,{STEP * 30}))',crop=1620:840:280:60,format=gray"
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(source_for(stem)),
                        "-vf", vf, "-fps_mode", "passthrough", str(tmp / "%06d.png")], check=True)
        frames = sorted(tmp.glob("*.png"))
        windows = wanted(stem)
        jobs = []
        for i, f in enumerate(frames):
            t = i * STEP
            # the frame at t closes the window [t-STEP, t): read it if that window changed
            if (t // STEP - 1) in windows or t % EVERY == 0:
                jobs.append((t, f))
        with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
            texts = list(ex.map(lambda j: ocr(j[1]), jobs))
        rows = [f"{t}\t{txt}" for (t, _), txt in zip(jobs, texts)]
        part = out.with_suffix(".part")
        part.write_text("offset_s\ttext\n" + "\n".join(rows) + "\n", encoding="utf-8")
        part.replace(out)
        print(stem, f"{len(frames)} frames, {len(jobs)} read", flush=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    stems = sys.argv[1:] or sorted(p.stem for p in CHANGES.glob("*.csv"))
    for s in stems:
        do(s)
