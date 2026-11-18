// Draws the two charts as inline SVG, then starts Reveal.
// The drawings are styled from css/deck.css (classes + custom properties).

const SVG_NS = 'http://www.w3.org/2000/svg';

function svg(name, attrs = {}, parent = null, text = null) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== null) node.textContent = text;
  if (parent) parent.appendChild(node);
  return node;
}

const r1 = (n) => Math.round(n * 10) / 10;

/* ------------------------------------------------------------------ */
/* Chart 1: largest Lean project over time                             */
/* Data: plots/data/lean_mathlib.csv, lean_ai.csv, oss_reference.csv   */
/* ------------------------------------------------------------------ */

// [year, total lines]: max(mathlib3, mathlib4) at quarterly snapshots
const MATHLIB = [
  [2017.75, 32731], [2018.0, 46409], [2018.25, 54439], [2018.5, 67553], [2018.75, 87877],
  [2019.0, 111565], [2019.25, 134803], [2019.5, 158173], [2019.75, 181897],
  [2020.0, 204511], [2020.25, 236100], [2020.5, 298476], [2020.75, 387082],
  [2021.0, 448491], [2021.25, 518357], [2021.5, 584756], [2021.75, 654187],
  [2022.0, 738725], [2022.25, 835655], [2022.5, 903608], [2022.75, 980890],
  [2023.0, 1047472], [2023.25, 1082865], [2023.5, 1260365], [2023.75, 1336203],
  [2024.0, 1410557], [2024.25, 1480879], [2024.5, 1566416], [2024.75, 1523798],
  [2025.0, 1655237], [2025.25, 1767055], [2025.5, 1857393], [2025.75, 1936640],
  [2026.0, 2094250], [2026.25, 2232441], [2026.5, 2345640], [2026.75, 2426143],
  [2026.88, 2464552],
];

// AI-driven formalizations. `label` is omitted for the earlier Qin et al. release,
// which is drawn as the start of a short connector instead.
const AI = [
  { x: 2025.69, y: 28407, label: 'Strong PNT (Math Inc): 28k' },
  { x: 2026.17, y: 180661, label: 'Sphere packing (Math Inc): 0.18M' },
  { x: 2026.63, y: 13499380, label: 'Fermat’s Last Theorem (Claude, Aug 2026): 13.5M', strong: true },
  { x: 2026.69, y: 641332, label: 'Navier–Stokes (OpenAI): 0.64M' },
  { x: 2026.74, y: 4722013 },
  { x: 2026.76, y: 3061775, label: 'Poincaré (Zhang et al.): 3.1M', dy: -3 },
  { x: 2026.87, y: 7393782, label: 'Poincaré + geometrization (Qin et al.): 4.7M → 7.4M' },
];

const REFERENCE = [
  { y: 43920947, label: 'Linux kernel: 43.9M', side: 'above' },
  { y: 3123590, label: 'CPython: 3.1M', side: 'above' },
  { y: 2147254, label: 'FFmpeg: 2.1M', side: 'below' },
];

// Least-squares quadratic fit of log10(lines) vs t = year - 2026 over the AI points.
const FIT = { a: 5.0653, b: 2.0833, c: -0.0610 };

function drawLeanLoc(host) {
  const W = 840, H = 400, m = { top: 12, right: 20, bottom: 40, left: 62 };
  const x0 = 2017.5, x1 = 2027, y0 = 4, y1 = 8; // y in log10
  const px = (x) => m.left + ((x - x0) / (x1 - x0)) * (W - m.left - m.right);
  const py = (v) => m.top + ((y1 - Math.log10(v)) / (y1 - y0)) * (H - m.top - m.bottom);
  const right = W - m.right, bottom = H - m.bottom;

  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img',
    'aria-label': 'Lines of Lean per project over time, on a log scale' }, host);

  // reference codebases
  for (const ref of REFERENCE) {
    const y = r1(py(ref.y));
    svg('line', { class: 'c-ref', x1: m.left, x2: right, y1: y, y2: y }, root);
    svg('text', { class: 'c-label c-halo', x: m.left + 8, y: ref.side === 'above' ? y - 7 : y + 18 }, root, ref.label);
  }

  // axes
  svg('path', { class: 'c-axis', d: `M${m.left},${m.top} V${bottom} H${right}` }, root);
  [['10k', 1e4], ['100k', 1e5], ['1M', 1e6], ['10M', 1e7], ['100M', 1e8]].forEach(([label, v]) => {
    const y = r1(py(v));
    svg('line', { class: 'c-axis', x1: m.left - 5, x2: m.left, y1: y, y2: y }, root);
    svg('text', { class: 'c-tick', x: m.left - 10, y: y + 5, 'text-anchor': 'end' }, root, label);
  });
  for (let year = 2018; year <= 2026; year += 2) {
    const x = r1(px(year));
    svg('line', { class: 'c-axis', x1: x, x2: x, y1: bottom, y2: bottom + 5 }, root);
    svg('text', { class: 'c-tick', x, y: bottom + 24, 'text-anchor': 'middle' }, root, String(year));
  }
  const midY = (m.top + bottom) / 2;
  svg('text', { class: 'c-axis-title', x: 16, y: midY, 'text-anchor': 'middle',
    transform: `rotate(-90 16 ${midY})` }, root, 'Lines of Lean (log scale)');

  // mathlib: the largest Lean project until 2026
  const line = MATHLIB.map(([x, v], i) => `${i ? 'L' : 'M'}${r1(px(x))},${r1(py(v))}`).join('');
  svg('path', { class: 'c-line c-s1 c-draw', d: line, pathLength: 1 }, root);
  const ml = svg('text', { class: 'c-label c-strong c-halo c-late', x: px(2020.1), y: py(4.4e5) - 8, 'text-anchor': 'middle' }, root);
  svg('tspan', { x: r1(px(2019.35)) }, ml, 'mathlib');
  svg('tspan', { x: r1(px(2019.35)), dy: 18 }, ml, '(2.5M lines today)');
  svg('text', { class: 'c-label c-minor c-halo c-late', x: px(2023.4), y: py(1.25e6) - 8, 'text-anchor': 'end' }, root, 'Lean 4 port');

  // AI-driven formalizations
  const ai = svg('g', { class: 'c-after' }, root);
  let d = '';
  for (let i = 0; i <= 30; i++) {
    const x = 2025.69 + (i / 30) * (2027 - 2025.69), t = x - 2026;
    d += `${i ? 'L' : 'M'}${r1(px(x))},${r1(py(10 ** (FIT.a + FIT.b * t + FIT.c * t * t)))}`;
  }
  svg('path', { class: 'c-fit c-s2', d }, ai);
  svg('line', { class: 'c-link c-s2', x1: px(2026.74), y1: py(4722013), x2: px(2026.87), y2: py(7393782) }, ai);
  AI.forEach((p, i) => {
    const g = svg('g', { class: 'c-point', style: `--i:${i}` }, ai);
    if (p.label) {
      svg('text', { class: `c-label c-halo${p.strong ? ' c-strong' : ''}`, x: r1(px(p.x) - 11),
        y: r1(py(p.y) + 5 + (p.dy || 0)), 'text-anchor': 'end' }, g, p.label);
    }
    svg('circle', { class: 'c-dot c-s2', cx: r1(px(p.x)), cy: r1(py(p.y)), r: 5.5 }, g);
  });
}

/* ------------------------------------------------------------------ */
/* Chart 2: search interest, Lean vs. software verification            */
/* Data: plots/data/*-trends-smooth.csv (raw monthly value, LOWESS)    */
/* ------------------------------------------------------------------ */

// One entry per month from Nov 2024 to Sep 2026.
const TRENDS = [
  {
    name: '“software verification”', cls: 'c-s2',
    raw: [7, 6, 8, 10, 12, 11, 17, 33, 49, 51, 67, 49, 46, 42, 49, 74, 84, 75, 83, 100, 56, 21, 76],
    smooth: [5.49, 6.98, 8.55, 10.23, 12.19, 17.03, 24.16, 32.95, 42.26, 48.55, 50.98, 50.61, 50.12,
      52.6, 58.57, 65.54, 73.49, 78.15, 75.84, 73.82, 72.71, 70.98, 69.22],
  },
  {
    name: '“Lean programming language”', cls: 'c-s1',
    raw: [0, 0, 23, 0, 0, 28, 23, 50, 28, 40, 35, 0, 0, 28, 40, 33, 63, 43, 80, 75, 53, 65, 100],
    smooth: [0.17, 3.29, 6.67, 10.55, 14.4, 19.95, 26.46, 32.19, 33.91, 29.98, 23.64, 21.04, 20.8,
      23.68, 32.4, 42.06, 50.86, 58.21, 62.56, 66.73, 72.56, 77.98, 83.34],
  },
];

// Smooth curve through the points (Catmull-Rom spline as cubic Béziers).
function spline(points) {
  let d = `M${r1(points[0][0])},${r1(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)], p1 = points[i], p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, points.length - 1)];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)},${r1(p1[1] + (p2[1] - p0[1]) / 6)} `
       + `${r1(p2[0] - (p3[0] - p1[0]) / 6)},${r1(p2[1] - (p3[1] - p1[1]) / 6)} `
       + `${r1(p2[0])},${r1(p2[1])}`;
  }
  return d;
}

function drawTrends(host) {
  const W = 840, H = 400, m = { top: 12, right: 20, bottom: 40, left: 62 };
  const px = (i) => m.left + (i / 22) * (W - m.left - m.right);
  const py = (v) => m.top + ((105 - v) / 105) * (H - m.top - m.bottom);
  const right = W - m.right, bottom = H - m.bottom;

  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img',
    'aria-label': 'Monthly search interest for Lean and for software verification' }, host);

  for (const v of [0, 25, 50, 75, 100]) {
    const y = r1(py(v));
    if (v) svg('line', { class: 'c-grid', x1: m.left, x2: right, y1: y, y2: y }, root);
    svg('text', { class: 'c-tick', x: m.left - 10, y: y + 5, 'text-anchor': 'end' }, root, String(v));
  }
  svg('path', { class: 'c-axis', d: `M${m.left},${m.top} V${bottom} H${right}` }, root);
  ['Jan ’25', 'Apr ’25', 'Jul ’25', 'Oct ’25', 'Jan ’26', 'Apr ’26', 'Jul ’26'].forEach((label, k) => {
    const x = r1(px(2 + 3 * k));
    svg('line', { class: 'c-axis', x1: x, x2: x, y1: bottom, y2: bottom + 5 }, root);
    svg('text', { class: 'c-tick', x, y: bottom + 24, 'text-anchor': 'middle' }, root, label);
  });
  const midY = (m.top + bottom) / 2;
  svg('text', { class: 'c-axis-title', x: 16, y: midY, 'text-anchor': 'middle',
    transform: `rotate(-90 16 ${midY})` }, root, 'Search interest (peak = 100)');

  // raw monthly values, then the smoothed lines on top
  const dots = svg('g', { class: 'c-early' }, root);
  for (const s of TRENDS) {
    s.raw.forEach((v, i) => svg('circle', { class: `c-raw ${s.cls}`, cx: r1(px(i)), cy: r1(py(v)), r: 3.6 }, dots));
  }
  for (const s of TRENDS) {
    svg('path', { class: `c-line ${s.cls} c-draw`, pathLength: 1,
      d: spline(s.smooth.map((v, i) => [px(i), py(v)])) }, root);
  }
}

/* ------------------------------------------------------------------ */

// Slide numbers for the footer (CSS prints data-n).
function numberSlides() {
  document.querySelectorAll('.reveal .slides > section').forEach((section, i) => {
    const frame = section.querySelector('.frame');
    if (frame) frame.dataset.n = String(i + 1);
  });
}

drawLeanLoc(document.getElementById('chart-leanloc'));
drawTrends(document.getElementById('chart-trends'));
numberSlides();

Reveal.initialize({
  width: 1280,
  height: 720,
  margin: 0,
  minScale: 0.2,
  maxScale: 3,
  center: false,
  hash: true,
  controls: false,
  progress: false,
  transition: 'fade',
  transitionSpeed: 'fast',
  backgroundTransition: 'none',
  plugins: [RevealNotes],
});
