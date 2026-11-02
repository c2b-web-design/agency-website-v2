# Film 02's transparent caption layer, from film2-captions.ass (film02-captions-ass-build.py). ProRes 4444, 1920 x 1080, 30 fps.
# The captions are drawn white on opaque black and that picture IS the alpha, over a solid colour. Do not draw them straight onto
# a transparent frame (the ass filter's alpha=1): measured 1 November 2026, the fade is applied twice, so half way through a
# fade the alpha reads 72 of 255, not 128.
#   python film02-captions-layer-render.py straight|premultiplied SECONDS OUTPUT.mov
import json, os, subprocess, sys

SUB = os.path.expanduser('~/Videos/C2B Films/02 Ornate corners/07 Subtitles')
mode, secs, out = sys.argv[1], sys.argv[2], sys.argv[3]
assert mode in ('straight', 'premultiplied')
SIZE = f's=1920x1080:r=30:d={secs}'
rows = json.load(open(os.path.join(SUB, 'film2-captions-rows.json'), encoding='utf8'))
yellow = next(r for r in rows if r['i'] == 23)  # only this caption is on screen during its window, so the colour plane can change
graph = (
    f"color=c=black:{SIZE},format=gbrp,ass=film2-captions.ass:fontsdir=fonts,extractplanes=g[m];"
    f"color=c=white:{SIZE},format=rgba,"
    f"drawbox=x=0:y=0:w=iw:h=ih:color=yellow:t=fill:enable='between(n,{yellow['a']},{yellow['b'] - 1})',format=gbrap[c];"
    f"[c][m]alphamerge" + (',premultiply=inplace=1' if mode == 'premultiplied' else '') +
    ",scale=out_color_matrix=bt709:out_range=tv,format=yuva444p10le[v]"
)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-filter_complex', graph, '-map', '[v]', '-an',
                '-c:v', 'prores_ks', '-profile:v', '4444', '-alpha_bits', '8', '-vendor', 'apl0',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', out], cwd=SUB, check=True)
