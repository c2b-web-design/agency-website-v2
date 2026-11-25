"""Film 3 (the hero), logging step 2c: find each beat in the captures by Carl's words.

Reads step 2b's OCR (`03 The hero\\11 Log\\ocr\\*.tsv`) and, for each search phrase below, lists every capture and
offset where the phrase first appears on screen (then each later run of it, so a scrolled-back message is not mistaken
for the moment it was sent). Matching is on lower-case letters and digits only, so OCR punctuation slips do not matter.
Output: `03 The hero\\11 Log\\beat-hits.md`.

Run:  python -I film03-find-beats-25-november.py
"""
import pathlib
import re

FILMS = pathlib.Path.home() / "Videos" / "C2B Films" / "03 The hero"
OCR = FILMS / "11 Log" / "ocr"
OUT = FILMS / "11 Log" / "beat-hits.md"

# beat id, the capture day it should be in (a prefix of the stem), phrases (any may match)
BEATS = [
    ("D4", "2026-11-09", ["both y tips", "y tips on the floor", "tips of the y"]),
    ("D5", "2026-11-09_s2", ["we need a camera bench to build things with"]),
    ("D6", "2026-11-11", ["we will use the marching cubes", "we will not use the camera bench"]),
    ("T1", "2026-11-09", ["ever so subtle", "should be ice blue"]),
    ("T2", "2026-11-09_s2", ["still looks good"]),
    ("T3", "2026-11-11", ["this looks right to me", "bake the text"]),
    ("T4", "2026-11-11", ["wow", "dark courtyard"]),
    ("T5", "2026-11-16", ["scrap the html logo", "fade in of the logo is smooth", "too much of a gap between text and subtext"]),
    ("P1-1", "2026-11-09", ["the balance looks good", "i think the lean looks right"]),
    ("P1-2", "2026-11-09", ["the leaning logo is now not just a side on view", "change the lens back"]),
    ("P1-3", "2026-11-09_s3", ["family of metals"]),
    ("P1-3b", "2026-11-10", ["it does look a lot better. approved", "it does look a lot better"]),
    ("P1-4", "2026-11-10", ["blobs look, movement and behaviour look great", "movement and behaviour look great"]),
    ("P1-5", "2026-11-10", ["i didnt say turn it", "perfect"]),
    ("P1-6", "2026-11-13", ["refer to the sketch and orient the logo", "where it starts and ends phase 1"]),
    ("P1-7", "2026-11-13", ["jumps into the middle", "that is a good position to be starting from"]),
    ("P1-8", "2026-11-13", ["a viscous fluid would pool like that", "viscous fluid"]),
    ("P1-9", "2026-11-13", ["looks the best yet", "first the emission"]),
    ("P1-10", "2026-11-13_s2", ["nailed it", "fluid disc appears complete", "timing is slight off"]),
    ("P1-11", "2026-11-13_s2", ["the pre blob text is ice blue"]),
    ("P1-12", "2026-11-13_s2", ["outstanding", "slow the logo fill by 50", "last step in phase 1"]),
    ("P2-1", "2026-11-14", ["the rain will be local", "the rain starts just as the wobble ends"]),
    ("P2-2", "2026-11-14", ["best first", "fallback if we have to"]),
    ("P2-3", "2026-11-14", ["the drops look better", "from further away the rain"]),
    ("P2-4", "2026-11-14", ["helluva lot better", "the wash happens too fast", "let the rain wash the red"]),
    ("P2-5", "2026-11-14", ["they look good and are more pronounced", "why is the colour different"]),
    ("P2-6", "2026-11-16", ["the steam looks very good", "steam first"]),
    ("P2-7", "2026-11-16_s3", ["vast improvement", "its approved, commit and push"]),
    ("P2-8", "2026-11-18", ["steam is good and approved"]),
    ("P2-9", "2026-11-18", ["wheres the webs", "there are 3 positions"]),
    ("P2-10", "2026-11-18", ["excellent", "phase 2 is approved"]),
    ("P3-1", "2026-11-20", ["it looks great. approved", "clearly code", "not slow mo and not rain"]),
    ("P3-2", "2026-11-20", ["b is the best way to go", "make the cloth bigger", "all the parameters in the cloth are good"]),
    ("P3-3", "2026-11-20", ["a pass", "forward and a backward"]),
    ("P3-4", "2026-11-20_s2", ["unexpected bonus", "fully opaque"]),
    ("P3-5", "2026-11-20_s2", ["schrodinger", "schrdinger"]),
    ("P3-6", "2026-11-20_s2", ["gymnast", "half speed", "secondary to how it looks"]),
    ("P3-7", "2026-11-22", ["far better", "its looking far b"]),
    ("P3-8", "2026-11-22", ["good right out the gate", "looks more realistic"]),
    ("P3-9", "2026-11-22", ["a lot better. we can commit", "the passes have all be approved", "should do a 180"]),
    ("P3-10", "2026-11-22", ["good flow throughout the 4 passes", "both actions"]),
    ("P3-11", "2026-11-22", ["looks fantastic", "never see the transition", "thats got it"]),
    ("P4-1", "2026-11-23", ["natural flow to the story", "as soon as the logo is clear"]),
    ("P4-2", "2026-11-23", ["a definite improvement", "copy the code exactly", "the gpt image is better"]),
    ("P4-3", "2026-11-25", ["plinth looks great", "always be visible"]),
    ("P4-4", "2026-11-25", ["much smoother", "radial reveal"]),
]


def norm(s):
    return re.sub(r"[^a-z0-9]+", "", s.lower())


def load():
    caps = {}
    for f in sorted(OCR.glob("*.tsv")):
        rows = []
        for line in f.read_text(encoding="utf-8").splitlines()[1:]:
            off, _, txt = line.partition("\t")
            if off.strip():
                rows.append((int(float(off)), norm(txt)))
        caps[f.stem.replace("_discussion_screen", "")] = rows
    return caps


def hms(s):
    return f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}"


def runs(rows, key):
    """Offsets where `key` appears after a frame that did not show it: each new appearance."""
    hits, was = [], False
    for off, txt in rows:
        now = key in txt
        if now and not was:
            hits.append(off)
        was = now
    return hits


if __name__ == "__main__":
    caps = load()
    out = ["# Film 3: where each beat's words appear on screen", "",
           "From the chat panel's OCR (step 2b). Offsets are from the capture's start, each a new appearance.",
           "The day the record gives comes first; other days are listed where the words also appear.", ""]
    for bid, day, phrases in BEATS:
        out.append(f"## {bid}")
        found = False
        for ph in phrases:
            key = norm(ph)
            for stem, rows in caps.items():
                hits = runs(rows, key)
                if hits:
                    found = True
                    mark = "**" if stem == day else ""
                    out.append(f"- {mark}{stem}{mark}: \"{ph}\" at " + ", ".join(hms(h) for h in hits[:8])
                               + (f" (+{len(hits) - 8} more)" if len(hits) > 8 else ""))
        if not found:
            out.append("- not found on screen")
        out.append("")
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(OUT)
