# Film 04's transparent caption layer, from film4-captions.ass (film04-captions-build.py). ProRes 4444, 1920 x 1080, 30 fps. Method as
# film02-captions-layer-render.py: the captions drawn white on opaque black, and that picture IS the alpha, over a solid colour.
# Do not draw them straight onto a transparent frame (the ass filter's alpha=1): the fade is applied twice.
#   python film04-captions-layer-render.py premultiplied|straight FRAMES OUTPUT.mov
import json, os, subprocess, sys

SUB = os.path.expanduser('~/Videos/C2B Films/04 Extruded lettering/10 Subtitles')
mode, frames, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
assert mode in ('straight', 'premultiplied')
SIZE = f's=1920x1080:r=30:d={frames / 30:.6f}'
rows = json.load(open(os.path.join(SUB, 'film4-captions-rows.json'), encoding='utf8'))
yellow = next(r for r in rows if r['dark'])  # only this caption is on screen during its window, so the colour plane can change
graph = (
    f"color=c=black:{SIZE},format=gbrp,ass=film4-captions.ass:fontsdir=fonts,extractplanes=g[m];"
    f"color=c=white:{SIZE},format=rgba,"
    f"drawbox=x=0:y=0:w=iw:h=ih:color=yellow:t=fill:enable='between(n,{yellow['a']},{yellow['b'] - 1})',format=gbrap[c];"
    f"[c][m]alphamerge" + (',premultiply=inplace=1' if mode == 'premultiplied' else '') +
    ",scale=out_color_matrix=bt709:out_range=tv,format=yuva444p10le[v]"
)
subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-filter_complex', graph, '-map', '[v]', '-an', '-frames:v', str(frames),
                '-c:v', 'prores_ks', '-profile:v', '4444', '-alpha_bits', '8', '-vendor', 'apl0',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', out], cwd=SUB, check=True)
