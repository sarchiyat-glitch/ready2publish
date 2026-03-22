import { initNav, setActiveNavLink } from './main.js';

let currentStep = 1;
const totalSteps = 4;

const formData = {
  title: '', genre: '', audience: '', wordCount: '',
  shortDesc: '', fullDesc: '', packageType: 'manuscript',
  price: '', negotiable: false, formats: [],
  deliveryTime: '', revisionPolicy: '', excerpt: ''
};

function updateStepIndicator() {
  for (let i = 1; i <= totalSteps; i++) {
    const el = document.querySelector(`[data-step-indicator="${i}"]`);
    const conn = document.querySelector(`[data-step-connector="${i}"]`);
    if (!el) continue;
    el.classList.remove('step--active', 'step--done');
    if (i < currentStep) el.classList.add('step--done');
    else if (i === currentStep) el.classList.add('step--active');
    if (conn) conn.classList.toggle('step-connector--done', i < currentStep);
  }
}

function showStep(step) {
  document.querySelectorAll('.sell-form-step').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-step="${step}"]`)?.classList.add('active');
  currentStep = step;
  updateStepIndicator();
  updatePreview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePreview() {
  const preview = document.getElementById('previewContent');
  const title = formData.title || 'Dein Buchtitel';
  const genre = formData.genre || 'Genre';
  const wordCount = formData.wordCount ? `${(formData.wordCount/1000).toFixed(0)}k Wörter` : '—';
  const price = formData.price ? `€${Number(formData.price).toLocaleString('de-DE')}` : '€—';
  const packageLabels = { manuscript: 'Nur Manuskript', cover: 'Manuskript + Cover', full: 'Komplettes Paket' };

  const genreColors = {
    fantasy: '#6B4EFF', romance: '#E91E8C', thriller: '#E74C3C',
    scifi: '#0097A7', nonfiction: '#2D7A4F', children: '#FF9800',
    business: '#1565C0', selfhelp: '#7B1FA2', mystery: '#37474F'
  };
  const coverBg = genreColors[formData.genre] || '#1A2A45';

  preview.innerHTML = `
    <div style="height:100px; background: linear-gradient(135deg, #0A1628, ${coverBg}); display:flex; align-items:center; justify-content:center; border-radius: var(--radius-lg); margin-bottom: var(--space-4)">
      <svg width="32" height="32" viewBox="0 0 48 48" fill="rgba(255,255,255,0.3)">
        <path d="M8 6a2 2 0 012-2h18l12 12v26a2 2 0 01-2 2H10a2 2 0 01-2-2V6z"/>
      </svg>
    </div>
    <div style="font-family: var(--font-serif); font-size: var(--text-lg); font-weight: 700; margin-bottom: var(--space-2)">${title}</div>
    <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-bottom: var(--space-3)">${genre} · ${wordCount}</div>
    <div style="display:flex; justify-content:space-between; align-items:center; padding-top: var(--space-3); border-top: 1px solid var(--color-border)">
      <div style="font-family: var(--font-mono); font-size: var(--text-xl); font-weight: 700; color: var(--color-navy)">${price}</div>
      <span class="badge badge--package">${packageLabels[formData.packageType]}</span>
    </div>
  `;
}

function collectStep1() {
  formData.title = document.getElementById('inputTitle').value;
  formData.genre = document.getElementById('inputGenre').value;
  formData.audience = document.getElementById('inputAudience').value;
  formData.wordCount = document.getElementById('inputWordCount').value;
  formData.shortDesc = document.getElementById('inputShortDesc').value;
  formData.fullDesc = document.getElementById('inputFullDesc').value;
}

function collectStep2() {
  formData.packageType = document.querySelector('[name="packageType"]:checked')?.value || 'manuscript';
  formData.price = document.getElementById('inputPrice').value;
  formData.negotiable = document.getElementById('inputNegotiable').checked;
}

function collectStep3() {
  formData.formats = [...document.querySelectorAll('[name="formats"]:checked')].map(el => el.value);
  formData.deliveryTime = document.getElementById('inputDelivery').value;
  formData.revisionPolicy = document.getElementById('inputRevision').value;
  formData.excerpt = document.getElementById('inputExcerpt').value;
}

function validateStep(step) {
  if (step === 1) {
    const title = document.getElementById('inputTitle').value.trim();
    const genre = document.getElementById('inputGenre').value;
    if (!title) { alert('Bitte gib einen Titel ein.'); return false; }
    if (!genre) { alert('Bitte wähle ein Genre.'); return false; }
    return true;
  }
  if (step === 2) {
    const price = document.getElementById('inputPrice').value;
    if (!price || Number(price) < 1) { alert('Bitte gib einen gültigen Preis ein.'); return false; }
    return true;
  }
  return true;
}

function buildReview() {
  const reviewEl = document.getElementById('reviewSummary');
  const packageLabels = { manuscript: 'Nur Manuskript', cover: 'Manuskript + Cover', full: 'Komplettes Paket' };
  reviewEl.innerHTML = `
    <div class="review-listing-card">
      <div class="review-listing-cover">
        <svg width="40" height="40" viewBox="0 0 48 48" fill="rgba(255,255,255,0.3)">
          <path d="M8 6a2 2 0 012-2h18l12 12v26a2 2 0 01-2 2H10a2 2 0 01-2-2V6z"/>
        </svg>
      </div>
      <div class="review-listing-body">
        <div style="font-family: var(--font-serif); font-size: var(--text-xl); font-weight:700; margin-bottom: var(--space-2)">${formData.title || '(Kein Titel)'}</div>
        <div style="font-size:var(--text-sm); color:var(--color-text-muted); margin-bottom: var(--space-4)">${formData.genre} · ${formData.wordCount ? (formData.wordCount/1000).toFixed(0) + 'k Wörter' : '—'} · ${formData.audience}</div>
        <div style="display:flex; gap: var(--space-3); align-items:center">
          <span style="font-family: var(--font-mono); font-size: var(--text-2xl); font-weight:700; color: var(--color-navy)">€${Number(formData.price || 0).toLocaleString('de-DE')}</span>
          ${formData.negotiable ? '<span class="chip">Verhandelbar</span>' : ''}
          <span class="badge badge--package">${packageLabels[formData.packageType]}</span>
        </div>
      </div>
    </div>
    <div style="font-size:var(--text-sm); color:var(--color-text-muted)">
      <p><strong>Kurzbeschreibung:</strong> ${formData.shortDesc || '—'}</p>
      <p style="margin-top: var(--space-3)"><strong>Formate:</strong> ${formData.formats.length ? formData.formats.join(', ') : '—'}</p>
      <p style="margin-top: var(--space-3)"><strong>Lieferzeit:</strong> ${formData.deliveryTime || '—'}</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  setActiveNavLink();

  // Package type card selection
  document.querySelectorAll('.package-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.package-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      card.querySelector('input[type="radio"]').checked = true;
    });
  });

  // Char counter for short description
  const shortDesc = document.getElementById('inputShortDesc');
  const charCount = document.getElementById('shortDescCount');
  if (shortDesc && charCount) {
    shortDesc.addEventListener('input', () => {
      charCount.textContent = `${shortDesc.value.length}/280`;
      shortDesc.maxLength = 280;
    });
  }

  // Navigation buttons
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validateStep(currentStep)) return;
      if (currentStep === 1) collectStep1();
      if (currentStep === 2) collectStep2();
      if (currentStep === 3) {
        collectStep3();
        buildReview();
      }
      showStep(currentStep + 1);
    });
  });

  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => showStep(currentStep - 1));
  });

  // Submit
  document.getElementById('submitBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    const terms = document.getElementById('acceptTerms');
    if (!terms?.checked) { alert('Bitte akzeptiere die AGB und Datenschutzbestimmungen.'); return; }
    document.getElementById('submitSuccess').style.display = 'block';
    document.getElementById('sell-form-card').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Form fields → live preview
  ['inputTitle', 'inputGenre', 'inputWordCount', 'inputPrice'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => {
      collectStep1();
      collectStep2();
      updatePreview();
    });
  });

  updatePreview();
  showStep(1);
});
