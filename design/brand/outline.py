"""Outline 'File' + 'Saviour' from Bricolage Grotesque into SVG path data (font units -> px)."""
import json, sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font = instantiateVariableFont(TTFont(sys.argv[1]), {"wght": 760, "opsz": 96, "wdth": 100})
gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
upm = font["head"].unitsPerEm
SIZE, TRACK = 40, -0.035  # px font size, tracking in em
scale = SIZE / upm

def run(text, x0):
    pen = SVGPathPen(gs)
    x = x0
    for ch in text:
        name = cmap[ord(ch)]
        gs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, 0)))
        x += hmtx[name][0] * scale + TRACK * SIZE
    return pen.getCommands(), x

file_d, x = run("File", 0)
sav_d, x = run("Saviour", x + 0.02 * SIZE)
cap = font["OS/2"].sCapHeight * scale
print(json.dumps({"file": file_d, "saviour": sav_d, "width": round(x, 2), "cap": round(cap, 2),
                  "desc": round(-font["OS/2"].sTypoDescender * scale, 2)}))
