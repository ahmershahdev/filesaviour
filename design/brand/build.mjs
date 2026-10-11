// FileSaviour logo system builder. Source of truth for every brand asset.
// node build.mjs <outDir>
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = process.argv[2];
mkdirSync(out, { recursive: true });
const wm = JSON.parse(readFileSync(join(here, "wordmark.json"), "utf8"));
const round = (d) => d.replace(/-?\d+\.\d+/g, (n) => String(+(+n).toFixed(1)));

// ---- Geometry (64-unit grid) --------------------------------------------
// Shield: flat-shouldered heater shield, symmetric, built from two cubic curves.
const SHIELD = "M32 4C40 7.5 48 9 55 9V30C55 45 45.5 55 32 60C18.5 55 9 45 9 30V9C16 9 24 7.5 32 4Z";
// Folder (front plate) with a tab, sitting low in the shield like the original logo.
const FOLDER = "M17 29.5a2.5 2.5 0 0 1 2.5-2.5h7.2l2.6 3h15.2a2.5 2.5 0 0 1 2.5 2.5V45a3 3 0 0 1-3 3H20a3 3 0 0 1-3-3Z";
// Sheet peeking out of the folder, folded corner top-right.
const SHEET = "M22.5 14.5h11.5l6 6V31h-17.5Z";
const FOLD = "M34 14.5v6h6Z";

const defs = (id) => `
  <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4C86FF"/><stop offset="1" stop-color="#1641C8"/>
  </linearGradient>
  <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFD84D"/><stop offset="1" stop-color="#FFAE00"/>
  </linearGradient>
  <linearGradient id="${id}o" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#4FC3FF" stop-opacity=".25"/><stop offset=".5" stop-color="#4FC3FF"/><stop offset="1" stop-color="#2D6BFF"/>
  </linearGradient>`;

// Orbit ring (the logo's swoosh). Back half sits behind the shield, front half crosses it.
const ORBIT_T = "rotate(-16 32 40)";
const orbitBack = (id) => `<path d="M2 40A30 8 0 0 1 62 40" fill="none" stroke="url(#${id}o)" stroke-width="2.2" stroke-linecap="round" opacity=".55" transform="${ORBIT_T}"/>`;
const orbitFront = (id) => `<path d="M62 40A30 8 0 0 1 2 40" fill="none" stroke="url(#${id}o)" stroke-width="2.6" stroke-linecap="round" transform="${ORBIT_T}"/>`;

// Keyhole on the folder: reads as "secured", not as a camera lens.
const keyhole = (k) => {
  const r = 2.8 * k, cy = 37, w0 = 1.3 * k, w1 = 2.3 * k, y1 = 44.2 - (1 - k) * -1.5;
  return `<path d="M${32 - w0} ${cy + r * 0.55}L${32 - w1} ${y1}H${32 + w1}L${32 + w0} ${cy + r * 0.55}A${r} ${r} 0 1 0 ${32 - w0} ${cy + r * 0.55}Z" fill="#0A0E18"/>`;
};

function mark(id, { orbit = true, detail = true } = {}) {
  return `
  ${orbit ? orbitBack(id) : ""}
  <path d="${SHIELD}" fill="url(#${id}s)"/>
  <path d="${SHIELD}" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1" transform="translate(32 32) scale(.92) translate(-32 -32)"/>
  <path d="${SHEET}" fill="#F4F6FB"/>
  <path d="${FOLD}" fill="#B9C9EE"/>
  ${detail ? `<rect x="25.5" y="19" width="7" height="2" rx="1" fill="#2D6BFF"/><rect x="25.5" y="23" width="11" height="2" rx="1" fill="#2D6BFF"/>` : ""}
  <path d="${FOLDER}" fill="url(#${id}f)"/>
  ${keyhole(detail ? 1 : 1.25)}
  ${orbit ? orbitFront(id) : ""}`;
}

const svg = (viewBox, body, id, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${extra}><defs>${defs(id)}</defs>${body}</svg>`;

// ---- Files ----------------------------------------------------------------
const MARK_VB = "-1 0 66 64";
const files = {};
files["logo-mark.svg"] = svg(MARK_VB, mark("m"), "m", ' role="img" aria-label="FileSaviour"');
// Favicon: no orbit/lines, bigger dial: legible at 16px.
files["favicon.svg"] = svg("6 2 52 60", mark("f", { orbit: false, detail: false }), "f");

function lockup(fileColor, savColor, id) {
  const gap = 14, mw = 66;
  const x = mw + gap - 1, baseline = 32 + wm.cap / 2 + 1;
  const w = Math.ceil(x + wm.width + 2);
  const text = `<g transform="translate(${x} ${baseline})"><path d="${round(wm.file)}" fill="${fileColor}"/><path d="${round(wm.saviour)}" fill="${savColor}"/></g>`;
  return svg(`-1 0 ${w} 64`, mark(id) + text, id, ' role="img" aria-label="FileSaviour"');
}
files["logo-horizontal-dark.svg"] = lockup("#F4F6FB", "#FFC21A", "d"); // for dark backgrounds
files["logo-horizontal-light.svg"] = lockup("#05070D", "#D99A00", "l"); // for light backgrounds

for (const [name, data] of Object.entries(files)) writeFileSync(join(out, name), data.replace(/\s{2,}/g, " ").replace(/> </g, "><"));

// ---- Raster exports --------------------------------------------------------
const png = (svgStr, width, bg) =>
  new Resvg(svgStr, { fitTo: { mode: "width", value: width }, background: bg }).render().asPng();

// App icons: mark on the brand ink tile, padded for maskable safe zone (80%).
const tile = (pad) => svg(`${-1 - pad} ${-pad} ${66 + pad * 2} ${64 + pad * 2}`, `<rect x="${-1 - pad}" y="${-pad}" width="${66 + pad * 2}" height="${64 + pad * 2}" fill="#05070D"/>` + mark("t"), "t");
writeFileSync(join(out, "icon-192.png"), png(tile(10), 192));
writeFileSync(join(out, "icon-512.png"), png(tile(10), 512));
writeFileSync(join(out, "apple-touch-icon.png"), png(tile(7), 180));
writeFileSync(join(out, "logo.png"), png(files["logo-mark.svg"], 512)); // schema.org Organization.logo
// Intermediate PNGs for packing favicon.ico (16/32/48); kept out of the static dir.
const icoSrc = join(here, ".ico-src");
mkdirSync(icoSrc, { recursive: true });
for (const s of [16, 32, 48, 256]) writeFileSync(join(icoSrc, `favicon-${s}.png`), png(files["favicon.svg"], s));
console.log(Object.keys(files).map((f) => `${f} ${files[f].length}B`).join("\n"));
