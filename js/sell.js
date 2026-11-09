import { genres, packageTypes } from './data.js';
import { cover, esc, euro, num, genreLabel, packageLabel } from './components.js';

const $ = id => document.getElementById(id);
const steps = [...document.querySelectorAll('.form-step')];
const stepperItems = [...document.querySelectorAll('#stepper li')];
let current = 1;

// Cover-Farben je Genre für die Vorschau
const coverByGenre = {
  fantasy:  { bg: '#1F3A5F', fg: '#F3E9D2', accent: '#D9A441', style: 'frame' },
  liebe:    { bg: '#E8C9C1', fg: '#5A1F2A', accent: '#5A1F2A', style: 'classic' },
  thriller: { bg: '#0E0E0E', fg: '#F4F1EA', accent: '#E04A2F', style: 'block' },
  krimi:    { bg: '#3E4A3D', fg: '#EDE6D6', accent: '#C9A86A', style: 'frame' },
  scifi:    { bg: '#101418', fg: '#E6F1EE', accent: '#4FB3A9', style: 'block' },
  sachbuch: { bg: '#F2EFE8', fg: '#1A1A1A', accent: '#B23A1E', style: 'type' },
  ratgeber: { bg: '#C8553D', fg: '#FFF8EE', accent: '#FFF8EE', style: 'block' },
  kinder:   { bg: '#F6D57A', fg: '#2B3A55', accent: '#2B3A55', style: 'classic' },
};
const priceHints = {
  manuskript: 'Üblich: 800 – 1.500 €',
  cover: 'Üblich: 1.500 – 2.500 €',
  komplett: 'Üblich: 2.000 – 4.000 €',
};

$('genre').insertAdjacentHTML('beforeend', genres.map(g => `<option value="${g.id}">${g.label}</option>`).join(''));
$('packageOptions').innerHTML = packageTypes.map((p, i) => `
  <label class="option"><input type="radio" name="package" value="${p.id}"${i === 0 ? ' checked' : ''}>
    <div><strong>${p.label}</strong><span>${p.description}</span></div><em>${priceHints[p.id]}</em></label>`).join('');

function data() {
  return {
    title: $('title').value.trim(),
    author: $('author').value.trim(),
    genre: $('genre').value,
    words: Number($('words').value) || 0,
    pitch: $('pitch').value.trim(),
    package: document.querySelector('input[name="package"]:checked')?.value || 'manuskript',
    price: Number($('price').value) || 0,
    negotiable: $('negotiable').checked,
    description: $('description').value.trim(),
    excerpt: $('excerpt').value.trim(),
  };
}

function preview() {
  const d = data();
  $('previewCover').innerHTML = cover({ ...d, cover: coverByGenre[d.genre] });
  $('previewMeta').innerHTML = `
    <div class="book__meta" style="margin-top:18px">${d.genre ? esc(genreLabel(d.genre)) : 'Genre'}${d.words ? ` · ${num(Math.round(d.words / 1000))} Tsd. Wörter` : ''}</div>
    <div class="book__title">${esc(d.title || 'Dein Buchtitel')}</div>
    <div class="book__author">${esc(d.author || 'Autor:in')}</div>
    <div class="book__foot"><span class="price">${d.price ? euro(d.price) : '— €'}</span><span class="book__pkg">${esc(packageLabel(d.package))}</span></div>`;
  $('priceHint').textContent = priceHints[d.package];
  $('pitchCount').textContent = $('pitch').value.length;
}

function setError(id, on) { $(id).closest('.field').classList.toggle('has-error', on); return !on; }

function validate(step) {
  const d = data();
  if (step === 1) return [setError('title', !d.title), setError('author', !d.author), setError('genre', !d.genre)].every(Boolean);
  if (step === 2) return setError('price', d.price < 100);
  return true;
}

function summary() {
  const d = data();
  const rows = [
    ['Titel', d.title], ['Autor:in', d.author], ['Genre', genreLabel(d.genre)],
    ['Umfang', d.words ? `${num(d.words)} Wörter` : '—'], ['Paket', packageLabel(d.package)],
    ['Preis', `${euro(d.price)}${d.negotiable ? ' (verhandelbar)' : ''}`],
    ['Ein Satz', d.pitch || '—'], ['Leseprobe', d.excerpt ? `${d.excerpt.slice(0, 120)}${d.excerpt.length > 120 ? ' …' : ''}` : '—'],
  ];
  $('summary').innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('');
}

function show(step) {
  current = step;
  steps.forEach(s => s.classList.toggle('is-active', Number(s.dataset.step) === step));
  stepperItems.forEach(li => {
    const n = Number(li.dataset.step);
    li.classList.toggle('is-active', n === step);
    li.classList.toggle('is-done', n < step);
  });
  $('back').style.visibility = step === 1 ? 'hidden' : 'visible';
  $('next').textContent = step === steps.length ? 'Projekt einreichen' : 'Weiter →';
  $('next').classList.toggle('btn--accent', step === steps.length);
  if (step === steps.length) summary();
}

$('next').addEventListener('click', () => {
  if (!validate(current)) return;
  if (current < steps.length) { show(current + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
  if (!$('consent').checked) { $('consentError').style.display = 'block'; return; }
  $('sellForm').hidden = true;
  $('stepper').hidden = true;
  $('done').hidden = false;
});
$('back').addEventListener('click', () => show(Math.max(1, current - 1)));
$('consent').addEventListener('change', () => { $('consentError').style.display = 'none'; });

$('sellForm').addEventListener('input', e => {
  e.target.closest('.field')?.classList.remove('has-error');
  preview();
});
$('sellForm').addEventListener('change', preview);

preview();
show(1);
