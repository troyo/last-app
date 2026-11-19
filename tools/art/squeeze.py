# Shrinks the rendered PNGs: a 96-colour palette keeps flat drawings sharp at a fraction of the size.
import sys
from PIL import Image

for f in sys.argv[1:]:
    im = Image.open(f).convert('RGBA')
    q = im.quantize(colors=96, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)
    q.save(f, optimize=True)
