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
const caliper = document.querySelector('#caliper');
const zoom = document.querySelector('#zoom');
const reading = document.querySelector('#reading');
const readingButton = document.querySelector('#toggle-reading');
const unitButton = document.querySelector('#toggle-unit');
const zoomButton = document.querySelector('#toggle-zoom');
let millimeters = 25;
let showReading = true;
let inches = false;
let drag = null;

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
    metric.append(svgElement('path', {d:`M ${x} 488 v ${i % 2 === 0 ? 40 : 26}`, stroke:'#111', 'stroke-width':1.5}));
    if (i % 2 === 0) metric.append(svgElement('text', {x, y:555}, i / 2));
  }
  metric.append(svgElement('text', {x:1155, y:574, 'font-size':18}, '0,05 mm'));
  cursor.append(metric);
  const imperial = svgElement('g', {fill:'#111', 'font-family':'Arial', 'font-size':22, 'text-anchor':'middle'});
  for (let i = 0; i <= 8; i++) {
    const x = MOVING_ZERO + i * (7 / 128) * 25.4 * UNITS_PER_MM;
    imperial.append(svgElement('path', {d:`M ${x} 330 v -${i % 4 === 0 ? 40 : 24}`, stroke:'#111', 'stroke-width':1.5}));
    if (i % 4 === 0) imperial.append(svgElement('text', {x, y:277}, i));
  }
  imperial.append(svgElement('text', {x:900, y:275}, '1/128 inch'));
  cursor.append(imperial);
  // Original inch scale uses 320 units; exact conversion is 320.04.
  for (const id of ['scale-inch-1', 'scale-inch-16', 'scale-inch-8', 'text-inch']) {
    document.getElementById(id).setAttribute('transform', `translate(${FIXED_ZERO} 0) scale(${25.4 * UNITS_PER_MM / 320} 1) translate(${-FIXED_ZERO} 0)`);
  }
}

function render() {
  const offset = CLOSED_OFFSET + millimeters * UNITS_PER_MM;
  cursor.setAttribute('transform', `translate(${offset} 0)`);
  zoom.setAttribute('viewBox', `${FIXED_ZERO + millimeters * UNITS_PER_MM - 65} 250 720 350`);
  const value = (inches ? millimeters / 25.4 : millimeters).toLocaleString('pt-BR', {minimumFractionDigits:inches ? 4 : 2, maximumFractionDigits:inches ? 4 : 2});
  reading.replaceChildren(document.createTextNode(showReading ? value : '— —'));
  if (showReading) reading.append(Object.assign(document.createElement('small'), {textContent:inches ? 'pol' : 'mm'}));
  reading.setAttribute('aria-label', showReading ? `${value} ${inches ? 'polegadas' : 'milímetros'}` : 'Medida oculta');
  // Do not expose the answer through the accessible slider in practice mode.
  if (showReading) cursor.setAttribute('aria-valuenow', millimeters.toFixed(2));
  else cursor.removeAttribute('aria-valuenow');
  cursor.setAttribute('aria-valuetext', showReading ? reading.getAttribute('aria-label') : 'Medida oculta');
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
zoom.addEventListener('pointerdown', event => startDrag(event, zoom, zoom));
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
  readingButton.querySelector('span').textContent = showReading ? 'Esconder medida' : 'Mostrar medida';
  render();
});
unitButton.addEventListener('click', () => {
  inches = !inches;
  unitButton.querySelector('span').textContent = `Unidade: ${inches ? 'pol' : 'mm'}`;
  unitButton.setAttribute('aria-label', `Trocar leitura para ${inches ? 'milímetros' : 'polegadas'}`);
  document.querySelector('#unit-status').textContent = inches ? 'Polegadas decimais · conversão de mm' : 'Leitura métrica';
  render();
});
zoomButton.addEventListener('click', () => {
  const panel = document.querySelector('#zoom-panel');
  panel.hidden = !panel.hidden;
  zoomButton.setAttribute('aria-pressed', !panel.hidden);
  zoomButton.querySelector('span').textContent = panel.hidden ? 'Ampliar nônio' : 'Fechar lupa';
});
calibrateScales();
cursor.setAttribute('role', 'slider');
cursor.setAttribute('tabindex', '0');
cursor.setAttribute('aria-label', 'Abertura do paquímetro');
cursor.setAttribute('aria-orientation', 'horizontal');
cursor.setAttribute('aria-valuemin', '0');
cursor.setAttribute('aria-valuemax', MAX_MM);
render();
