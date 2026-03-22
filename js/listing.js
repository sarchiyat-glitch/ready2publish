import { listings } from './data.js';
import { renderListingCard, genreBadge, packageBadge, formatPrice, formatWordCount, sellerAvatar, getSellerById, starRating } from './components.js';
import { initNav, setActiveNavLink } from './main.js';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getAudienceLabel(audience) {
  const map = { adult: 'Erwachsene', ya: 'Young Adult', children: "Kinder", 'middle-grade': 'Middle Grade' };
  return map[audience] || audience;
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  setActiveNavLink();

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const listing = listings.find(l => l.id === id);

  if (!listing) {
    document.getElementById('listingContent').innerHTML = `
      <div class="container" style="padding-block: var(--space-20); text-align:center">
        <h2 style="font-family: var(--font-serif); font-size: var(--text-3xl); margin-bottom: var(--space-4)">Listing nicht gefunden</h2>
        <p style="color: var(--color-text-muted); margin-bottom: var(--space-8)">Dieses Listing existiert nicht oder wurde entfernt.</p>
        <a href="browse.html" class="btn btn--primary btn--lg">Zurück zur Übersicht</a>
      </div>`;
    return;
  }

  const seller = getSellerById(listing.sellerId);
  const gradient = `linear-gradient(160deg, ${listing.coverGradient.join(', ')})`;

  // Breadcrumb
  document.getElementById('breadcrumbGenre').textContent = listing.genre.charAt(0).toUpperCase() + listing.genre.slice(1);
  document.getElementById('breadcrumbTitle').textContent = listing.title;

  // Cover
  document.getElementById('listingCover').style.background = gradient;

  // Details
  document.getElementById('listingBadges').innerHTML = genreBadge(listing.genre) + packageBadge(listing.packageType);
  document.getElementById('listingDate').textContent = 'Eingestellt: ' + formatDate(listing.listedDate);
  document.getElementById('listingTitle').textContent = listing.title;
  document.getElementById('listingAuthor').textContent = 'von ' + listing.author;
  document.title = listing.title + ' — ReadyToPublish';

  // Price box
  document.getElementById('listingPrice').textContent = formatPrice(listing.price);
  document.getElementById('listingPriceNote').textContent = listing.negotiable ? 'Preis verhandelbar' : 'Festpreis';

  // Includes
  document.getElementById('listingIncludes').innerHTML = listing.includes.map(item => `
    <div class="listing-includes__item">
      <div class="listing-includes__check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <span>${item}</span>
    </div>
  `).join('');

  // Stats
  const genreLabels = {
    fantasy: 'Fantasy', romance: 'Romance', thriller: 'Thriller',
    scifi: 'Sci-Fi', nonfiction: 'Non-Fiction', children: "Children's",
    business: 'Business', selfhelp: 'Self-Help', mystery: 'Mystery'
  };
  document.getElementById('statWords').textContent = formatWordCount(listing.wordCount) + ' Wörter';
  document.getElementById('statGenre').textContent = genreLabels[listing.genre] || listing.genre;
  document.getElementById('statAudience').textContent = getAudienceLabel(listing.audience);
  document.getElementById('statLanguage').textContent = 'Englisch';
  document.getElementById('statPackage').innerHTML = packageBadge(listing.packageType);
  document.getElementById('statDate').textContent = formatDate(listing.listedDate);

  // Description
  document.getElementById('listingDescription').innerHTML = listing.description
    .split('\n\n').map(p => `<p>${p}</p>`).join('');

  // Excerpt
  document.getElementById('listingExcerpt').textContent = listing.excerpt;

  // Tags
  document.getElementById('listingTags').innerHTML = listing.tags.map(t =>
    `<span class="chip">${t}</span>`
  ).join('');

  // Seller card
  if (seller) {
    document.getElementById('sellerAvatar').innerHTML = sellerAvatar(seller, 'lg');
    document.getElementById('sellerName').textContent = seller.name;
    document.getElementById('sellerSince').textContent = 'Mitglied seit ' + new Date(seller.memberSince + '-01').toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    document.getElementById('sellerRating').innerHTML = starRating(seller.rating) + ` <span style="font-size:var(--text-xs); color:var(--color-text-muted)">${seller.rating}</span>`;
    document.getElementById('sellerListings').textContent = seller.listingsCount + ' Listings';
    document.getElementById('sellerResponse').textContent = seller.responseTime;
    document.getElementById('sellerBio').textContent = seller.bio;
    document.getElementById('sellerListingsLink').href = `browse.html?seller=${seller.id}`;
  }

  // Similar listings
  const similar = listings.filter(l => l.id !== listing.id && l.genre === listing.genre).slice(0, 3);
  const similarGrid = document.getElementById('similarListings');
  if (similar.length > 0) {
    similarGrid.innerHTML = similar.map(l => renderListingCard(l, 'grid')).join('');
  } else {
    document.querySelector('.similar-section').style.display = 'none';
  }
});
