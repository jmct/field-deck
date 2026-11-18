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
/* Chart 1: human-written vs. AI-written Lean over time                */
/* Data: plots/data/lean_mathlib.csv, lean_ai.csv                      */
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

// AI-driven formalizations, by completion date: lines each one added to the
// running total. Qin et al. appears twice because the same repo grew between
// two releases (4.72M, then 7.39M).
const AI = [
  { x: 2025.69, lines: 28407 },     // Strong PNT (Math Inc)
  { x: 2026.17, lines: 180661 },    // Sphere packing (Math Inc)
  { x: 2026.63, lines: 13499380 },  // Fermat's Last Theorem (Claude)
  { x: 2026.69, lines: 641332 },    // Navier-Stokes (OpenAI)
  { x: 2026.74, lines: 4722013 },   // Poincare v0.1.3 (Qin et al.)
  { x: 2026.76, lines: 3061775 },   // Poincare (Zhang et al.)
  { x: 2026.87, lines: 2671769 },   // Poincare + geometrization (Qin et al.), growth since v0.1.3
];
const TODAY = 2026.88;

// The chart opens on Mathlib alone, on an axis that tops out at 3M. One click
// (a Reveal fragment) zooms the axis out to 26M, which is what it takes to fit
// the AI-written total.
function drawLeanLoc(host) {
  const W = 840, H = 500, m = { top: 16, right: 20, bottom: 40, left: 54 };
  const x0 = 2017.5, x1 = 2027, BEFORE = 3e6, AFTER = 26e6;
  const right = W - m.right, bottom = H - m.bottom, plotH = bottom - m.top;
  let yMax = BEFORE;
  const px = (x) => m.left + ((x - x0) / (x1 - x0)) * (right - m.left);
  const py = (v) => m.top + (1 - v / yMax) * plotH;
  const clamp = (n) => Math.max(0, Math.min(1, n));

  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart-svg', role: 'img',
    'aria-label': 'Total lines of Lean over time: Mathlib compared with AI-written formalizations' }, host);
  const clip = svg('clipPath', { id: 'leanloc-plot' }, svg('defs', {}, root));
  svg('rect', { x: m.left, y: 0, width: right - m.left + 12, height: bottom + 2 }, clip);

  // y ticks for both ends of the zoom; render() moves and fades them
  const ticks = [[1e6, 'near'], [2e6, 'near'], [3e6, 'near'],
    [5e6, 'far'], [10e6, 'far'], [15e6, 'far'], [20e6, 'far'], [25e6, 'far']].map(([v, when]) => {
    const g = svg('g', {}, root);
    svg('line', { class: 'c-grid', x1: m.left, x2: right, y1: 0, y2: 0 }, g);
    svg('text', { class: 'c-tick', x: m.left - 10, y: 5, 'text-anchor': 'end' }, g, `${v / 1e6}M`);
    return { v, when, g };
  });
  svg('text', { class: 'c-tick', x: m.left - 10, y: bottom + 5, 'text-anchor': 'end' }, root, '0');
  svg('path', { class: 'c-axis', d: `M${m.left},${m.top} V${bottom} H${right}` }, root);
  for (let year = 2018; year <= 2026; year += 2) {
    const x = r1(px(year));
    svg('line', { class: 'c-axis', x1: x, x2: x, y1: bottom, y2: bottom + 5 }, root);
    svg('text', { class: 'c-tick', x, y: bottom + 24, 'text-anchor': 'middle' }, root, String(year));
  }

  // Mathlib: the largest human-written Lean project
  const human = svg('path', { class: 'c-line c-s1 c-draw', pathLength: 1 }, root);
  const humanLabel = svg('text', { class: 'c-label c-strong c-halo c-late', x: r1(px(2026.25)),
    'text-anchor': 'end' }, root, 'Mathlib (human-written)');
  const lastHuman = MATHLIB[MATHLIB.length - 1][1];

  // AI-written: running total, stepping up as each project lands
  let total = 0, flt = null;
  const steps = AI.map((p) => {
    if (p.lines > 1e7) flt = { x: p.x, mid: total + p.lines / 2 };
    total += p.lines;
    return { x: p.x, total };
  });
  const ai = svg('g', { class: 'fragment zoom', 'data-fragment-index': 0 }, root);
  const aiLine = svg('path', { class: 'c-line c-s2', 'clip-path': 'url(#leanloc-plot)' }, ai);
  const aiNotes = svg('g', {}, ai);
  const aiDot = svg('circle', { class: 'c-dot c-s2', cx: r1(px(TODAY)), r: 5.5 }, aiNotes);
  const aiLabel = svg('text', { class: 'c-label c-strong c-halo', x: r1(px(TODAY) - 13),
    'text-anchor': 'end' }, aiNotes, 'AI-written formalizations');
  const fltLabel = svg('text', { class: 'c-label c-halo', x: r1(px(flt.x) - 12),
    'text-anchor': 'end' }, aiNotes, 'Fermat’s Last Theorem (Claude): 13.5M');

  // t = 0: zoomed in on Mathlib. t = 1: zoomed out to the AI total.
  function render(t) {
    yMax = BEFORE * (AFTER / BEFORE) ** t;
    for (const tick of ticks) {
      const y = py(tick.v);
      const fade = tick.when === 'near' ? clamp(1 - t * 2.5) : clamp((t - 0.45) / 0.4);
      tick.g.setAttribute('transform', `translate(0 ${r1(y)})`);
      tick.g.style.opacity = y < m.top - 1 ? 0 : fade;
    }
    human.setAttribute('d', MATHLIB.map(([x, v], i) => `${i ? 'L' : 'M'}${r1(px(x))},${r1(py(v))}`).join(''));
    humanLabel.setAttribute('y', r1(py(lastHuman) - 14));

    let d = `M${r1(px(AI[0].x))},${r1(py(0))}`;
    for (const s of steps) d += ` H${r1(px(s.x))} V${r1(py(s.total))}`;
    aiLine.setAttribute('d', `${d} H${r1(px(TODAY))}`);
    aiLine.style.opacity = clamp(t / 0.12);
    aiDot.setAttribute('cy', r1(py(total)));
    aiLabel.setAttribute('y', r1(py(total) + 5));
    fltLabel.setAttribute('y', r1(py(flt.mid) + 5));
    aiNotes.style.opacity = clamp((t - 0.8) / 0.2);
  }

  // Follow the fragment's state, whichever way Reveal gets there.
  let t = 0, frame = null;
  function zoomTo(target) {
    cancelAnimationFrame(frame);
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { t = target; render(t); return; }
    const from = t, start = performance.now(), duration = 1100 * Math.abs(target - from);
    if (!duration) return;
    const tick = (now) => {
      const k = clamp((now - start) / duration);
      const eased = k < 0.5 ? 4 * k * k * k : 1 - ((-2 * k + 2) ** 3) / 2;
      t = from + (target - from) * eased;
      render(t);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }
  new MutationObserver(() => zoomTo(ai.classList.contains('visible') ? 1 : 0))
    .observe(ai, { attributes: true, attributeFilter: ['class'] });
  render(0);
}

/* ------------------------------------------------------------------ */
/* Chart 2: search interest, Lean vs. software verification            */
/* Data: plots/data/*-trends-smooth.csv (the LOWESS-smoothed column)   */
/* ------------------------------------------------------------------ */

// One entry per month from Nov 2024 to Sep 2026.
const TRENDS = [
  {
    name: '“software verification”', cls: 'c-s2',
    smooth: [5.49, 6.98, 8.55, 10.23, 12.19, 17.03, 24.16, 32.95, 42.26, 48.55, 50.98, 50.61, 50.12,
      52.6, 58.57, 65.54, 73.49, 78.15, 75.84, 73.82, 72.71, 70.98, 69.22],
  },
  {
    name: '“Lean programming language”', cls: 'c-s1',
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
  const W = 840, H = 500, m = { top: 16, right: 20, bottom: 40, left: 62 };
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
