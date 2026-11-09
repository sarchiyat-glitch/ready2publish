import { listings, genres, packageTypes, wordRanges } from './data.js';
import { bookCard, bookRow, esc, genreLabel, packageLabel, sellerById } from './components.js';

const params = new URLSearchParams(location.search);
const state = {
  q: params.get('q') || '',
  genre: params.getAll('genre'),
  package: params.getAll('paket'),
  words: params.getAll('umfang'),
  pmin: params.get('von') || '',
  pmax: params.get('bis') || '',
  seller: params.get('verkaeufer') || '',
  sort: params.get('sort') || 'empfohlen',
  view: 'grid',
};

const $ = id => document.getElementById(id);

function checkbox(group, value, label, count) {
  return `<label class="check"><input type="checkbox" data-group="${group}" value="${value}">
    ${esc(label)}${count != null ? `<span class="count">${count}</span>` : ''}</label>`;
}

$('fGenre').innerHTML = genres.map(g => checkbox('genre', g.id, g.label, listings.filter(l => l.genre === g.id).length)).join('');
$('fPackage').innerHTML = packageTypes.map(p => checkbox('package', p.id, p.label, listings.filter(l => l.package === p.id).length)).join('');
$('fWords').innerHTML = wordRanges.map(w => checkbox('words', w.id, w.label + ' Wörter')).join('');

function matches(l) {
  if (state.seller && l.sellerId !== state.seller) return false;
  if (state.q) {
    const q = state.q.toLowerCase();
    const hay = [l.title, l.author, l.pitch, l.description, genreLabel(l.genre), ...l.tags].join(' ').toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (state.genre.length && !state.genre.includes(l.genre)) return false;
  if (state.package.length && !state.package.includes(l.package)) return false;
  if (state.words.length && !state.words.some(id => {
    const r = wordRanges.find(w => w.id === id);
    return r && l.words >= r.min && l.words < r.max;
  })) return false;
  if (state.pmin !== '' && l.price < Number(state.pmin)) return false;
  if (state.pmax !== '' && l.price > Number(state.pmax)) return false;
  return true;
}

const sorters = {
  empfohlen: (a, b) => (b.featured - a.featured) || b.listed.localeCompare(a.listed),
  neu: (a, b) => b.listed.localeCompare(a.listed),
  'preis-auf': (a, b) => a.price - b.price,
  'preis-ab': (a, b) => b.price - a.price,
};

function activeChips() {
  const chips = [];
  if (state.q) chips.push({ label: `„${state.q}“`, clear: () => { state.q = ''; $('q').value = ''; } });
  if (state.seller) chips.push({ label: `Verkäufer:in: ${sellerById(state.seller)?.name ?? state.seller}`, clear: () => { state.seller = ''; } });
  state.genre.forEach(v => chips.push({ label: genreLabel(v), clear: () => { state.genre = state.genre.filter(x => x !== v); } }));
  state.package.forEach(v => chips.push({ label: packageLabel(v), clear: () => { state.package = state.package.filter(x => x !== v); } }));
  state.words.forEach(v => chips.push({ label: wordRanges.find(w => w.id === v)?.label + ' Wörter', clear: () => { state.words = state.words.filter(x => x !== v); } }));
  if (state.pmin !== '') chips.push({ label: `ab ${state.pmin} €`, clear: () => { state.pmin = ''; $('pmin').value = ''; } });
  if (state.pmax !== '') chips.push({ label: `bis ${state.pmax} €`, clear: () => { state.pmax = ''; $('pmax').value = ''; } });
  return chips;
}

function syncURL() {
  const p = new URLSearchParams();
  if (state.q) p.set('q', state.q);
  state.genre.forEach(v => p.append('genre', v));
  state.package.forEach(v => p.append('paket', v));
  state.words.forEach(v => p.append('umfang', v));
  if (state.pmin !== '') p.set('von', state.pmin);
  if (state.pmax !== '') p.set('bis', state.pmax);
  if (state.seller) p.set('verkaeufer', state.seller);
  if (state.sort !== 'empfohlen') p.set('sort', state.sort);
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function syncInputs() {
  document.querySelectorAll('input[data-group]').forEach(cb => { cb.checked = state[cb.dataset.group].includes(cb.value); });
  $('q').value = state.q;
  $('pmin').value = state.pmin;
  $('pmax').value = state.pmax;
  $('sort').value = state.sort;
}

function render() {
  const found = listings.filter(matches).sort(sorters[state.sort] || sorters.empfohlen);
  $('count').innerHTML = `<strong>${found.length}</strong> ${found.length === 1 ? 'Projekt' : 'Projekte'}`;

  const chips = activeChips();
  $('chips').innerHTML = chips.map((c, i) =>
    `<span class="chip">${esc(c.label)}<button type="button" data-chip="${i}" aria-label="${esc(c.label)} entfernen">×</button></span>`).join('');
  $('chips').querySelectorAll('[data-chip]').forEach(b => b.addEventListener('click', () => { chips[b.dataset.chip].clear(); update(); }));
  $('reset').classList.toggle('is-visible', chips.length > 0);

  const out = $('results');
  if (!found.length) {
    out.className = '';
    out.innerHTML = `<div class="empty"><h3>Keine Treffer</h3><p>Mit diesen Filtern gibt es gerade kein passendes Projekt.</p>
      <button class="btn btn--ghost" type="button" id="emptyReset">Filter zurücksetzen</button></div>`;
    $('emptyReset').addEventListener('click', resetAll);
  } else if (state.view === 'list') {
    out.className = 'book-list';
    out.innerHTML = found.map(bookRow).join('');
  } else {
    out.className = 'book-grid';
    out.innerHTML = found.map(bookCard).join('');
  }
  syncURL();
}

function update() { syncInputs(); render(); }

function resetAll() {
  Object.assign(state, { q: '', genre: [], package: [], words: [], pmin: '', pmax: '', seller: '' });
  update();
}

// Ereignisse
document.querySelector('.filters').addEventListener('change', e => {
  const cb = e.target.closest('input[data-group]');
  if (!cb) return;
  const list = state[cb.dataset.group];
  state[cb.dataset.group] = cb.checked ? [...list, cb.value] : list.filter(v => v !== cb.value);
  render();
});
$('pmin').addEventListener('input', e => { state.pmin = e.target.value; render(); });
$('pmax').addEventListener('input', e => { state.pmax = e.target.value; render(); });
$('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });
$('reset').addEventListener('click', resetAll);

let t;
$('q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { state.q = e.target.value.trim(); render(); }, 200); });
$('searchForm').addEventListener('submit', e => { e.preventDefault(); state.q = $('q').value.trim(); render(); });

document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => {
  state.view = b.dataset.view;
  document.querySelectorAll('[data-view]').forEach(x => x.setAttribute('aria-pressed', x === b));
  render();
}));

const filters = $('filters');
const toggleFilters = open => { filters.classList.toggle('is-open', open); document.body.classList.toggle('no-scroll', open); };
$('openFilters').addEventListener('click', () => toggleFilters(true));
$('closeFilters').addEventListener('click', () => toggleFilters(false));

update();
