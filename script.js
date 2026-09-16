'use strict';

// Geometry from assets/paquimetro_grupos_animaveis.svg, in SVG units.
const UNITS_PER_MM = 12.6;
const FIXED_ZERO = 296.5;
const CLOSED_OFFSET = 264.33227 - 583.95619;
const MOVING_ZERO = FIXED_ZERO - CLOSED_OFFSET;
// 140 mm keeps the entire cursor housing on the original rail.
const MAX_MM = 140;
const STEP_MM = 0.05;
const cursor = document.querySelector('#cursor-movel');
const rearCursor = document.querySelector('#cursor-traseiro');
const caliper = document.querySelector('#caliper');
const reading = document.querySelector('#reading');
const readingButton = document.querySelector('#toggle-reading');
const zoomButton = document.querySelector('#toggle-zoom');
let millimeters = 25;
let showReading = true;
let zoomed = false;
let drag = null;
const metricTicks = [];
const inchTicks = [];
let fixedMetricHighlight;
let fixedInchHighlight;

function svgElement(tag, attributes, text) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  if (text !== undefined) element.textContent = text;
  return element;
}

// Replace the hand-drawn vernier ticks with exact spacing and align zero
// with the fixed scale when the external measuring faces touch.
function calibrateScales() {
  for (const id of ['path5937', 'path5943', 'path5947', 'text-inch-venier', 'path5972', 'path5978', 'text-cm-venier']) document.getElementById(id)?.remove();
  const metric = svgElement('g', {fill:'#111', 'font-family':'Arial', 'font-size':22, 'text-anchor':'middle'});
  for (let i = 0; i <= 20; i++) {
    const x = MOVING_ZERO + i * 1.95 * UNITS_PER_MM;
    const tick = svgElement('path', {d:`M ${x} 488 v ${i % 2 === 0 ? 40 : 26}`, stroke:'#111', 'stroke-width':1.5});
    metricTicks.push(tick);
    metric.append(tick);
    if (i % 2 === 0) metric.append(svgElement('text', {x, y:555}, i / 2));
  }
  metric.append(svgElement('text', {x:1155, y:574, 'font-size':18}, '0,05 mm'));
  cursor.append(metric);
  const imperial = svgElement('g', {fill:'#111', 'font-family':'Arial', 'font-size':22, 'text-anchor':'middle'});
  for (let i = 0; i <= 8; i++) {
    const x = MOVING_ZERO + i * (7 / 128) * 25.4 * UNITS_PER_MM;
    const tick = svgElement('path', {d:`M ${x} 330 v -${i % 4 === 0 ? 40 : 24}`, stroke:'#111', 'stroke-width':1.5});
    inchTicks.push(tick);
    imperial.append(tick);
    if (i % 4 === 0) imperial.append(svgElement('text', {x, y:277}, i));
  }
  imperial.append(svgElement('text', {x:900, y:275}, '1/128 inch'));
  cursor.append(imperial);
  // Original inch scale uses 320 units; exact conversion is 320.04.
  for (const id of ['scale-inch-1', 'scale-inch-16', 'scale-inch-8', 'text-inch']) {
    document.getElementById(id).setAttribute('transform', `translate(${FIXED_ZERO} 0) scale(${25.4 * UNITS_PER_MM / 320} 1) translate(${-FIXED_ZERO} 0)`);
  }
  fixedMetricHighlight = svgElement('path', {stroke:'#e02030', 'stroke-width':2.8, 'pointer-events':'none'});
  fixedInchHighlight = svgElement('path', {stroke:'#e02030', 'stroke-width':2.8, 'pointer-events':'none'});
  document.querySelector('#corpo-fixo').append(fixedMetricHighlight, fixedInchHighlight);
}

function highlightAlignment() {
  const metricIndex = Math.round(millimeters / STEP_MM) % 20;
  // Inch graduations use 1/128: highlight the nearest pair because the
  // metric 0.05 mm increments do not always coincide exactly in inches.
  const inchIndex = Math.round(millimeters / 25.4 * 128) % 8;
  for (const [ticks, selected] of [[metricTicks, metricIndex], [inchTicks, inchIndex]]) {
    ticks.forEach((tick, index) => {
      const active = showReading && index === selected;
      tick.setAttribute('stroke', active ? '#e02030' : '#111');
      tick.setAttribute('stroke-width', active ? 2.8 : 1.5);
    });
  }
  const mmMark = Math.round(millimeters + metricIndex * 1.95);
  const mmLength = mmMark % 10 === 0 ? 56 : mmMark % 5 === 0 ? 42.5 : 34;
  fixedMetricHighlight.setAttribute('d', `M ${FIXED_ZERO + mmMark * UNITS_PER_MM} ${490-mmLength} v ${mmLength}`);
  const inchMark = Math.round(millimeters / 25.4 * 16 + inchIndex * 7 / 8);
  const inchLength = inchMark % 16 === 0 ? 56 : inchMark % 2 === 0 ? 31.5 : 26.5;
  fixedInchHighlight.setAttribute('d', `M ${FIXED_ZERO + inchMark / 16 * 25.4 * UNITS_PER_MM} 327.6 v ${inchLength}`);
  for (const line of [fixedMetricHighlight, fixedInchHighlight]) line.setAttribute('visibility', showReading ? 'visible' : 'hidden');
}

function formatInches(mm) {
  const inches = mm / 25.4;
  const ticks = Math.round(inches * 128);
  const whole = Math.floor(ticks / 128);
  let numerator = ticks % 128;
  let denominator = 128;
  while (numerator && numerator % 2 === 0) { numerator /= 2; denominator /= 2; }
  const fraction = numerator ? (whole ? whole + ' ' : '') + numerator + '/' + denominator : String(whole);
  return fraction + '″ - ' + inches.toLocaleString('pt-BR', {minimumFractionDigits:3, maximumFractionDigits:3}) + '″';
}

function updateCamera() {
  const {width, height} = caliper.getBoundingClientRect();
  if (!width || !height) return;
  // Frame the instrument, never the extending depth rod.
  const scale = Math.min(width / (zoomed ? 760 : 2840), height / (zoomed ? 540 : 1260));
  const viewWidth = width / scale;
  const viewHeight = height / scale;
  const centerX = zoomed ? FIXED_ZERO + millimeters * UNITS_PER_MM + 245 : 1420;
  const centerY = zoomed ? 420 : 510;
  caliper.setAttribute('viewBox', [centerX-viewWidth/2, centerY-viewHeight/2, viewWidth, viewHeight].join(' '));
}

function render() {
  const offset = CLOSED_OFFSET + millimeters * UNITS_PER_MM;
  cursor.setAttribute('transform', 'translate(' + offset + ' 0)');
  rearCursor.setAttribute('transform', 'translate(' + offset + ' 0)');
  updateCamera();
  highlightAlignment();
  reading.hidden = !showReading;
  document.querySelector('#metric-reading').textContent = showReading ? millimeters.toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2}) + 'mm' : '';
  document.querySelector('#inch-reading').textContent = showReading ? formatInches(millimeters) : '';
  if (showReading) cursor.setAttribute('aria-valuenow', millimeters.toFixed(2));
  else cursor.removeAttribute('aria-valuenow');
  cursor.setAttribute('aria-valuetext', showReading ? reading.textContent : 'Medida oculta');
}

function setMeasurement(value) {
  millimeters = Math.max(0, Math.min(MAX_MM, Math.round(value / STEP_MM) * STEP_MM));
  render();
}

function startDrag(event, surface, target) {
  if (drag || !event.isPrimary || event.button !== 0) return;
  event.preventDefault();
  cursor.focus({preventScroll:true});
  // Freeze the initial screen-to-SVG scale: the magnifier follows the cursor.
  drag = {id:event.pointerId, x:event.clientX, mm:millimeters, scale:surface.getScreenCTM().a, target};
  target.setPointerCapture(event.pointerId);
  document.body.classList.add('dragging');
}
cursor.addEventListener('pointerdown', event => startDrag(event, caliper, cursor));
rearCursor.addEventListener('pointerdown', event => startDrag(event, caliper, rearCursor));
document.addEventListener('pointermove', event => {
  if (drag?.id !== event.pointerId) return;
  setMeasurement(drag.mm + (event.clientX - drag.x) / drag.scale / UNITS_PER_MM);
});
function stopDrag(event) {
  if (drag?.id !== event.pointerId) return;
  const previous = drag;
  drag = null;
  if (previous.target.hasPointerCapture(event.pointerId)) previous.target.releasePointerCapture(event.pointerId);
  document.body.classList.remove('dragging');
  updateCamera();
}
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) document.addEventListener(name, stopDrag);
cursor.addEventListener('keydown', event => {
  const step = event.shiftKey ? 1 : STEP_MM;
  const values = {ArrowLeft:millimeters-step, ArrowDown:millimeters-step, ArrowRight:millimeters+step, ArrowUp:millimeters+step, Home:0, End:MAX_MM};
  if (!(event.key in values)) return;
  event.preventDefault();
  setMeasurement(values[event.key]);
});
readingButton.addEventListener('click', () => {
  showReading = !showReading;
  readingButton.setAttribute('aria-pressed', showReading);
  readingButton.querySelector('span').textContent = showReading ? 'Esconder medidas' : 'Mostrar medidas';
  render();
});
zoomButton.addEventListener('click', () => {
  zoomed = !zoomed;
  zoomButton.setAttribute('aria-pressed', zoomed);
  zoomButton.querySelector('span').textContent = zoomed ? 'Visão geral' : 'Ampliar nônio';
  updateCamera();
});
new ResizeObserver(updateCamera).observe(caliper);
const themeButton = document.querySelector('#toggle-theme');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-pressed', dark);
  themeButton.setAttribute('aria-label', dark ? 'Alternar para tema claro' : 'Alternar para tema escuro');
  themeButton.querySelector('span').textContent = dark ? 'Tema claro' : 'Tema escuro';
  try { localStorage.setItem('caliper-theme', theme); } catch { /* Storage may be unavailable for local files. */ }
}
let savedTheme;
try { savedTheme = localStorage.getItem('caliper-theme'); } catch { /* Default to synthwave. */ }
setTheme(savedTheme === 'light' ? 'light' : 'dark');
themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
calibrateScales();
cursor.setAttribute('role', 'slider');
cursor.setAttribute('tabindex', '0');
cursor.setAttribute('aria-label', 'Abertura do paquímetro');
cursor.setAttribute('aria-orientation', 'horizontal');
cursor.setAttribute('aria-valuemin', '0');
cursor.setAttribute('aria-valuemax', MAX_MM);
render();
