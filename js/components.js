import { sellers, categories } from './data.js';

export function formatPrice(price) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price);
}

export function formatWordCount(count) {
  if (count >= 1000) return (count / 1000).toFixed(1).replace('.0', '') + 'k';
  return count.toString();
}

export function getSellerById(id) {
  return sellers.find(s => s.id === id);
}

export function genreBadge(genre) {
  const labels = {
    fantasy: 'Fantasy', romance: 'Romance', thriller: 'Thriller',
    scifi: 'Sci-Fi', nonfiction: 'Non-Fiction', children: "Children's",
    business: 'Business', selfhelp: 'Self-Help', biography: 'Biography', mystery: 'Mystery'
  };
  return `<span class="badge badge--${genre}">${labels[genre] || genre}</span>`;
}

export function packageBadge(type) {
  const labels = { manuscript: 'Manuscript', cover: '+ Cover', full: 'Full Package' };
  return `<span class="badge badge--package">${labels[type] || type}</span>`;
}

export function starRating(rating) {
  const full = Math.floor(rating);
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<svg viewBox="0 0 20 20" fill="${i < full ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>`
  ).join('');
  return `<div class="star-rating">${stars}</div>`;
}

export function sellerAvatar(seller, size = '') {
  const sizeClass = size === 'lg' ? 'seller-avatar--lg' : '';
  return `<div class="seller-avatar ${sizeClass}" style="background:${seller.color}">${seller.initials}</div>`;
}

export function bookIcon(color = 'white') {
  return `<svg class="listing-card__cover-icon" viewBox="0 0 48 48" fill="${color}">
    <path d="M8 6a2 2 0 012-2h18l12 12v26a2 2 0 01-2 2H10a2 2 0 01-2-2V6z"/>
    <path d="M28 4l12 12H28V4z" opacity=".4"/>
    <rect x="14" y="22" width="20" height="2" rx="1" opacity=".5"/>
    <rect x="14" y="28" width="14" height="2" rx="1" opacity=".5"/>
    <rect x="14" y="34" width="16" height="2" rx="1" opacity=".5"/>
  </svg>`;
}

export function renderListingCard(listing, variant = 'grid') {
  const seller = getSellerById(listing.sellerId);
  const gradient = `linear-gradient(135deg, ${listing.coverGradient.join(', ')})`;

  if (variant === 'list') {
    return `
    <article class="listing-card listing-card--list" data-id="${listing.id}">
      <div class="listing-card__cover" style="background: ${gradient}">
        ${bookIcon(listing.coverAccent)}
      </div>
      <div class="listing-card__body">
        <div class="listing-card__meta">
          ${genreBadge(listing.genre)}
          ${packageBadge(listing.packageType)}
        </div>
        <h3 class="listing-card__title">${listing.title}</h3>
        <p class="listing-card__author">by ${listing.author}</p>
        <div class="listing-card__stats">
          <span class="listing-card__stat">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h16M4 12h16M4 18h8"/>
            </svg>
            ${formatWordCount(listing.wordCount)} words
          </span>
          <span>·</span>
          <span>${listing.audience}</span>
        </div>
        <div class="listing-card__footer">
          <div>
            <div class="listing-card__price">${formatPrice(listing.price)}</div>
            ${listing.negotiable ? '<div class="listing-card__price-note">Negotiable</div>' : ''}
          </div>
          <a href="listing.html?id=${listing.id}" class="btn btn--primary btn--sm">View Listing</a>
        </div>
      </div>
    </article>`;
  }

  return `
  <article class="listing-card" data-id="${listing.id}">
    <a href="listing.html?id=${listing.id}" class="listing-card__cover-link" style="display:block">
      <div class="listing-card__cover" style="background: ${gradient}">
        ${bookIcon(listing.coverAccent)}
        ${listing.featured ? '<span class="listing-card__featured-tag">Featured</span>' : ''}
      </div>
    </a>
    <div class="listing-card__body">
      <div class="listing-card__meta">
        ${genreBadge(listing.genre)}
        ${packageBadge(listing.packageType)}
      </div>
      <h3 class="listing-card__title">
        <a href="listing.html?id=${listing.id}">${listing.title}</a>
      </h3>
      <p class="listing-card__author">by ${listing.author}</p>
      <div class="listing-card__stats">
        <span class="listing-card__stat">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h8"/>
          </svg>
          ${formatWordCount(listing.wordCount)} words
        </span>
        <span>·</span>
        <span>${listing.audience === 'children' ? "Children's" : listing.audience.charAt(0).toUpperCase() + listing.audience.slice(1)}</span>
      </div>
      <div class="listing-card__footer">
        <div>
          <div class="listing-card__price">${formatPrice(listing.price)}</div>
          ${listing.negotiable ? '<div class="listing-card__price-note">Negotiable</div>' : ''}
        </div>
        <a href="listing.html?id=${listing.id}" class="btn btn--primary btn--sm">View</a>
      </div>
    </div>
  </article>`;
}

export function renderCategoryPills(activeId = null) {
  return categories.map(cat => `
    <a href="browse.html?category=${cat.id}" class="category-pill${activeId === cat.id ? ' category-pill--active' : ''}">
      <span>${cat.icon}</span>
      <span>${cat.label}</span>
      <span class="category-pill__count">${cat.count}</span>
    </a>
  `).join('');
}
