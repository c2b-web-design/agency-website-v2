# Film 02's captions, clip by clip, timed to cut10.edl. Run with no argument to write the wording list for Carl and
# check each line's reading speed. Run with --srt only once he has approved the wording: an .srt re-imported after he
# has placed and faded the lines wipes that work.
import os, re, sys, textwrap

FILM = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners')
EDL = os.path.join(FILM, 'cut10.edl')
OUT_SRT = os.path.join(FILM, '07 Subtitles', 'film2.srt')
OUT_MD = os.path.join(os.path.dirname(__file__), '..', 'film02-captions-draft-1-november.md')
FPS = 30
LEAD = 0.2
GAP = 0.1
MAX_CPS = 17

LINES = [
    (['00A'], ['These are the boxes on our home page. Thin grey lines on a dark page.']),
    (['00B'], ['They held the words. They did not say anything.']),
    (['01A'], ['It started with a small request. Give the second section boxes too.',
               'Then the real idea. The boxes were fully closed in, and they needed to stand apart.',
               'Not a plain 90 degree line. The word was ornate.',
               'Gold for one section. Platinum blue for the other.',
               'Seven boxes, four corners each. Twenty eight pieces.']),
    (['01B'], ['The back of each corner stays straight. Everything ornate grows inward.',
               'Our tightest box had 48 pixels between its edge and its text. That was the space to design in.']),
    (['01C'], ['We looked at what others had made.']),
    (['01D'], ['Inspiration means something like this. We design our own.',
               'We left the material until the shape was right.',
               'Then a better idea. A different material for each section, chosen for its colour.']),
    (['03A'], ['Our first try, in clay. Thin rails, bent into scrolls.',
               'Our founder saw it straight away. Old, almost Victorian.']),
    (['03B'], ['Like a railing.']),
    (['03C'], ['Take two. Better, but not there.']),
    (['03D'], ['It needed more mass. More for the light to work with.']),
    (['03E'], ['So our founder went elsewhere for help.',
               'Another AI, Gemini, found the sort of thing we wanted on its seventh attempt.']),
    (['03F'], ['The corners were too big. The idea was right.']),
    (['03G'], ['Not every attempt landed.']),
    (['03H'], ['This one did. Carved leaves on a straight, mitred moulding.']),
    (['03J'], ['We took it for someone else\'s product. It was not.',
               'Our founder had made it. So we copied our own design.']),
    (['03K'], ['Take three. The bracket, rebuilt in 3D at our size.']),
    (['03L'], ['Now we were talking.',
               'There is even a face in the leaves, if you look closely.']),
    (['03M'], ['The picture gave us the shape. First the outline, then the mass.',
               'Then the carving, read from the picture\'s own light and shade.']),
    (['03N'], ['At its highest, the relief stands just 2.6 pixels off the page.',
               'At this size, a little depth goes a long way.']),
    (['03O'], ['A low light, raked across the clay.',
               'No colour yet. Only form.']),
    (['03P'], ['Then we inspected it, view by view.',
               'The mesh. About 24,000 triangles in each corner.',
               'Zebra stripes show how smoothly the surface flows.',
               'The normal map holds the fine carving for the light to catch.']),
    (['03Q'], ['The limit lines. The ornament stays clear of the text.']),
    (['03R'], ['Its long arm runs along the top, because our boxes are wider than they are tall.']),
    (['03S'], ['Our founder approved the shape.']),
    (['04A'], ['Now the material. Gold first.']),
    (['04B'], ['Too smooth, and it turns into a mirror.',
               'Too rough, and it goes dull.',
               'In between, satin.']),
    (['04C'], ['Satin gilt. The soft sheen of gold leaf.']),
    (['04D'], ['Our founder approved it. It differs from our logo\'s metal, and we kept that.']),
    (['04E'], ['Then the blue. As plain metal, it nearly vanished.']),
    (['04F'], ['There is no blue gilt.']),
    (['04G'], ['So we did what jewellers do. Blue enamel over bright metal.',
               'The metal leans towards platinum, and that lifts the blue.']),
    (['04H'], ['A clear, glassy coat follows the form, with a crisp highlight on each curve.',
               'The carving shows through underneath.']),
    (['04I'], ['The enamel blue. Still a little dark.']),
    (['04J'], ['Our founder approved it, trusting the light on the page to lift it.']),
    (['05A'], ['The shape and the materials were done. The harder question was next.',
               'Twenty eight pieces on one page. How do we draw them?']),
    (['05B'], ['It went to our Architect. Another pair of eyes.']),
    (['05C'], ['The corners would fade in, one box at a time, and then stay.',
               'And the old lines could go. The corners imply the box.']),
    (['06A'], ['On the page, in gold.']),
    (['06B'], ['One box at a time.']),
    (['06C'], ['And in platinum blue.']),
    (['06D'], ['At true size, beside the old border.',
               'Each corner reaches just 24 pixels into its box.',
               'Small enough to stay out of the words. Detailed enough to notice.']),
    (['06E'], ['Each box begins before the last has finished, at the pace of the cards on our enquiry page.',
               'Our first take ran a little fast, so we slowed it.',
               'They wake as each heading nears the top of the window.',
               'The page feels more active, more alive.']),
    (['06F'], ['They do the same when you arrive from the menu.',
               'Our founder approved the page.']),
    (['06G'], ['We measured the page against the bench.']),
    (['06H'], ['They agree.']),
    (['07A'], ['Then the light.',
               'We do not move the corners. We move the room they reflect.',
               'A slow, small circle, every twelve seconds.']),
    (['07B'], ['The corners grow lighter and darker.',
               'It is very subtle. That is the idea.']),
    (['07C'], ['Our rule: effects should feel caused by the world.',
               'They are not simply there. They are doing something.']),
    (['07D'], ['The room, turning round the gold.']),
    (['07E'], ['And round the blue.',
               'Twice the light on the blue cured the darkness we had carried from the material pass.']),
    (['07F'], ['Satin gilt, moving through the light.']),
    (['07G'], ['Enamel blue, the same.',
               'Our founder approved the light.']),
    (['08A'], ['If a device cannot draw the corners, the boxes are still framed.']),
    (['08B'], ['In gold, and in blue.']),
    (['08C'], ['This is where it started.', 'And this is what it became.']),
]


def frames(tc):
    h, m, s, f = map(int, tc.split(':'))
    return (h - 1) * 3600 * FPS + m * 60 * FPS + s * FPS + f


def clips():
    lines = open(EDL, encoding='utf8', errors='replace').read().splitlines()
    out = {}
    for i, line in enumerate(lines):
        m = re.match(r'\d{3}\s+\S+\s+V\s+C\s+\S+\s+\S+\s+(\S+)\s+(\S+)', line)
        if m:
            name = next(x.split(': ')[1] for x in lines[i + 1:i + 3] if 'FROM CLIP' in x)[:3]
            out[name] = (frames(m[1]) / FPS, frames(m[2]) / FPS)
    return out


def timed():
    c = clips()
    ids = [i for ids, _ in LINES for i in ids]
    assert sorted(ids) == sorted(c), set(c) ^ set(ids)
    rows = []
    for ids, texts in LINES:
        start = c[ids[0]][0] + LEAD
        end = c[ids[-1]][1] - GAP
        total = sum(len(t) for t in texts)
        span = end - start - GAP * (len(texts) - 1)
        t = start
        for text in texts:
            d = span * len(text) / total
            rows.append((ids[0], t, t + d, text))
            t += d + GAP
    return rows


def clock(s):
    return f'{int(s // 60)}:{int(s % 60):02d}'


def srt(s):
    ms = round(s * 1000)
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


rows = timed()
fast = [(r[0], round(len(r[3]) / (r[2] - r[1]), 1), r[3]) for r in rows if len(r[3]) / (r[2] - r[1]) > MAX_CPS]
print(len(rows), 'lines; over', MAX_CPS, 'chars a second:', len(fast))
for f in fast:
    print(' ', f)

md = ['# Film 02: captions, draft for Carl', '',
      f'{len(rows)} lines across 55 clips, 9:15:00. Times are where each line would start. Nothing is placed yet.', '',
      '| Clip | At | Line |', '|---|---|---|']
md += [f'| `{r[0]}` | {clock(r[1])} | {r[3]} |' for r in rows]
open(OUT_MD, 'w', encoding='utf8').write('\n'.join(md) + '\n')

if '--srt' in sys.argv:
    with open(OUT_SRT, 'w', encoding='utf8', newline='\n') as f:
        for i, r in enumerate(rows, 1):
            f.write(f'{i}\n{srt(r[1])} --> {srt(r[2])}\n' + '\n'.join(textwrap.wrap(r[3], 42)) + '\n\n')
    print('wrote', OUT_SRT)
