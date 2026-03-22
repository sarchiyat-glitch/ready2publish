import { listings, categories, wordRanges } from './data.js';
import { renderListingCard, genreBadge } from './components.js';
import { initNav, setActiveNavLink } from './main.js';

// State
let state = {
  search: '',
  genres: [],
  wordRanges: [],
  packageTypes: [],
  priceMin: '',
  priceMax: '',
  sort: 'featured',
  view: 'grid'
};

function readURLParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) state.genres = [params.get('category')];
  if (params.get('seller')) state.seller = params.get('seller');
  if (params.get('q')) state.search = params.get('q');
}

function writeURLParams() {
  const params = new URLSearchParams();
  if (state.genres.length === 1) params.set('category', state.genres[0]);
  if (state.search) params.set('q', state.search);
  history.replaceState(null, '', '?' + params.toString());
}

function filterListings() {
  return listings.filter(l => {
    if (state.seller && l.sellerId !== state.seller) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!l.title.toLowerCase().includes(q) &&
          !l.author.toLowerCase().includes(q) &&
          !l.description.toLowerCase().includes(q) &&
          !l.tags.some(t => t.toLowerCase().includes(q))) return false;
    }
    if (state.genres.length && !state.genres.includes(l.genre)) return false;
    if (state.wordRanges.length && !state.wordRanges.includes(l.wordRange)) return false;
    if (state.packageTypes.length && !state.packageTypes.includes(l.packageType)) return false;
    if (state.priceMin && l.price < Number(state.priceMin)) return false;
    if (state.priceMax && l.price > Number(state.priceMax)) return false;
    return true;
  });
}

function sortListings(list) {
  return [...list].sort((a, b) => {
    switch (state.sort) {
      case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      case 'newest': return new Date(b.listedDate) - new Date(a.listedDate);
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'words-desc': return b.wordCount - a.wordCount;
      default: return 0;
    }
  });
}

function renderResults() {
  const filtered = sortListings(filterListings());
  const container = document.getElementById('listingsContainer');
  const countEl = document.getElementById('resultCount');

  countEl.innerHTML = `<strong>${filtered.length}</strong> Listing${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 8a4 4 0 014-4h24l12 12v36a4 4 0 01-4 4H16a4 4 0 01-4-4V8z"/>
            <path d="M36 4l12 12H36V4z"/>
            <path d="M22 32h20M22 40h14"/>
          </svg>
        </div>
        <h3 class="empty-state__title">Keine Listings gefunden</h3>
        <p class="empty-state__text">Versuche andere Filter oder schau dir alle Listings an.</p>
        <button class="btn btn--primary" onclick="clearAllFilters()">Filter zurücksetzen</button>
      </div>`;
    return;
  }

  container.className = state.view === 'list' ? 'listings-list' : 'listings-grid';
  container.innerHTML = filtered.map(l => renderListingCard(l, state.view)).join('');
  renderActiveChips();
  writeURLParams();
}

function renderActiveChips() {
  const chipsEl = document.getElementById('activeFilters');
  const chips = [];
  state.genres.forEach(g => {
    const cat = categories.find(c => c.id === g);
    if (cat) chips.push({ label: cat.label, remove: () => { state.genres = state.genres.filter(x => x !== g); applyFilters(); } });
  });
  if (state.search) chips.push({ label: `"${state.search}"`, remove: () => { state.search = ''; document.getElementById('searchInput').value = ''; applyFilters(); } });

  chipsEl.innerHTML = chips.map((c, i) =>
    `<span class="chip chip--active" data-chip="${i}">${c.label} <span class="chip__remove">×</span></span>`
  ).join('');

  chipsEl.querySelectorAll('[data-chip]').forEach(el => {
    el.querySelector('.chip__remove').addEventListener('click', () => chips[+el.dataset.chip].remove());
  });

  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) clearBtn.classList.toggle('visible', chips.length > 0 || state.priceMin || state.priceMax || state.wordRanges.length || state.packageTypes.length);
}

function applyFilters() {
  syncCheckboxes();
  renderResults();
}

function syncCheckboxes() {
  document.querySelectorAll('[data-filter-genre]').forEach(cb => {
    cb.checked = state.genres.includes(cb.value);
  });
  document.querySelectorAll('[data-filter-wordrange]').forEach(cb => {
    cb.checked = state.wordRanges.includes(cb.value);
  });
  document.querySelectorAll('[data-filter-package]').forEach(cb => {
    cb.checked = state.packageTypes.includes(cb.value);
  });
}

window.clearAllFilters = function() {
  state.genres = [];
  state.wordRanges = [];
  state.packageTypes = [];
  state.priceMin = '';
  state.priceMax = '';
  state.search = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  syncCheckboxes();
  renderResults();
};

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  setActiveNavLink();
  readURLParams();

  // Build sidebar checkboxes
  const genreFilter = document.getElementById('genreFilter');
  genreFilter.innerHTML = categories.map(c => `
    <label class="checkbox-item">
      <input type="checkbox" value="${c.id}" data-filter-genre>
      <span class="checkbox-item__label">${c.label}</span>
      <span class="checkbox-item__count">${c.count}</span>
    </label>
  `).join('');

  const wordRangeFilter = document.getElementById('wordRangeFilter');
  const wRanges = [
    {id:'under-30k', label:'Unter 30.000'},
    {id:'30k-50k', label:'30.000 – 50.000'},
    {id:'50k-80k', label:'50.000 – 80.000'},
    {id:'80k-100k', label:'80.000 – 100.000'},
    {id:'100k+', label:'Über 100.000'}
  ];
  wordRangeFilter.innerHTML = wRanges.map(r => `
    <label class="checkbox-item">
      <input type="checkbox" value="${r.id}" data-filter-wordrange>
      <span class="checkbox-item__label">${r.label}</span>
    </label>
  `).join('');

  const packageFilter = document.getElementById('packageFilter');
  packageFilter.innerHTML = [
    {id:'manuscript', label:'Nur Manuskript'},
    {id:'cover', label:'Manuskript + Cover'},
    {id:'full', label:'Komplettes Paket'}
  ].map(p => `
    <label class="checkbox-item">
      <input type="checkbox" value="${p.id}" data-filter-package>
      <span class="checkbox-item__label">${p.label}</span>
    </label>
  `).join('');

  // Event: genre checkboxes
  genreFilter.addEventListener('change', e => {
    if (e.target.dataset.filterGenre !== undefined) {
      if (e.target.checked) state.genres.push(e.target.value);
      else state.genres = state.genres.filter(g => g !== e.target.value);
      applyFilters();
    }
  });

  wordRangeFilter.addEventListener('change', e => {
    if (e.target.dataset.filterWordrange !== undefined) {
      if (e.target.checked) state.wordRanges.push(e.target.value);
      else state.wordRanges = state.wordRanges.filter(w => w !== e.target.value);
      applyFilters();
    }
  });

  packageFilter.addEventListener('change', e => {
    if (e.target.dataset.filterPackage !== undefined) {
      if (e.target.checked) state.packageTypes.push(e.target.value);
      else state.packageTypes = state.packageTypes.filter(p => p !== e.target.value);
      applyFilters();
    }
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  searchInput.addEventListener('input', e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      renderResults();
    }, 300);
  });

  // Search form
  document.getElementById('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    state.search = searchInput.value.trim();
    renderResults();
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    state.sort = e.target.value;
    renderResults();
  });

  // View toggle
  document.querySelectorAll('.view-toggle__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-toggle__btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.view = btn.dataset.view;
      renderResults();
    });
  });

  // Price range
  document.getElementById('priceMin').addEventListener('change', e => {
    state.priceMin = e.target.value;
    renderResults();
  });
  document.getElementById('priceMax').addEventListener('change', e => {
    state.priceMax = e.target.value;
    renderResults();
  });

  // Clear all
  document.getElementById('clearFilters')?.addEventListener('click', clearAllFilters);

  // Mobile filter toggle
  document.getElementById('filterToggleBtn')?.addEventListener('click', () => {
    document.querySelector('.filter-sidebar').classList.toggle('mobile-open');
  });

  document.getElementById('closeSidebar')?.addEventListener('click', () => {
    document.querySelector('.filter-sidebar').classList.remove('mobile-open');
  });

  syncCheckboxes();
  renderResults();
});
