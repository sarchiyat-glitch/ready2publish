import { genres, packageTypes, sellers, audiences } from './data.js';

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const euro = n => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
export const num = n => new Intl.NumberFormat('de-DE').format(n);
export const date = d => new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });

export const genreLabel = id => genres.find(g => g.id === id)?.label ?? id;
export const packageLabel = id => packageTypes.find(p => p.id === id)?.label ?? id;
export const audienceLabel = id => audiences[id] ?? id;
export const sellerById = id => sellers.find(s => s.id === id);

/** Typografisches Buchcover in vier Stilen. */
export function cover(l, extraClass = '') {
  const c = l.cover || { bg: '#2B2824', fg: '#F7F4EE', accent: '#B23A1E', style: 'classic' };
  const style = `--bg:${c.bg};--fg:${c.fg};--ac:${c.accent}`;
  const title = esc(l.title || 'Dein Buchtitel');
  const author = esc(l.author || 'Autor:in');
  let inner;
  switch (c.style) {
    case 'frame':
      inner = `<div class="cover__mark">${esc(genreLabel(l.genre))}</div>
        <div class="cover__title">${title}</div>
        <div class="cover__ornament"></div>
        <div class="cover__author">${author}</div>`;
      break;
    case 'block':
      inner = `<div class="cover__title">${title}</div>
        <div class="cover__block"></div>
        <div class="cover__author">${author}</div>`;
      break;
    case 'type':
      inner = `<div class="cover__initial" aria-hidden="true">${title.charAt(0)}</div>
        <div class="cover__title">${title}</div>
        <div class="cover__author">${author}</div>`;
      break;
    default:
      inner = `<div class="cover__title">${title}</div>
        <div class="cover__rule"></div>
        <div class="cover__author">${author}</div>
        <div class="cover__mark">Roman</div>`;
  }
  return `<div class="cover cover--${c.style || 'classic'} ${extraClass}" style="${style}" role="img" aria-label="Cover: ${title} von ${author}">
    <div class="cover__inner">${inner}</div></div>`;
}

export function bookCard(l) {
  return `<a class="book" href="listing.html?id=${l.id}">
    ${cover(l)}
    <div>
      <div class="book__meta">${esc(genreLabel(l.genre))} · ${num(Math.round(l.words / 1000))} Tsd. Wörter</div>
      <h3 class="book__title">${esc(l.title)}</h3>
      <div class="book__author">${esc(l.author)}</div>
      <div class="book__foot">
        <span class="price">${euro(l.price)}</span>
        <span class="book__pkg">${esc(packageLabel(l.package))}</span>
      </div>
    </div>
  </a>`;
}

export function bookRow(l) {
  return `<a class="book-row" href="listing.html?id=${l.id}">
    ${cover(l)}
    <div>
      <div class="book__meta">${esc(genreLabel(l.genre))} · ${esc(packageLabel(l.package))}</div>
      <div class="book-row__title">${esc(l.title)}</div>
      <div class="book__author">${esc(l.author)}</div>
      <p class="book-row__pitch">${esc(l.pitch)}</p>
    </div>
    <div class="book-row__right">
      <div class="price">${euro(l.price)}</div>
      <div class="book__pkg">${num(l.words)} Wörter</div>
    </div>
  </a>`;
}
