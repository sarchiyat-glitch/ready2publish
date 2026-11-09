import { listings } from './data.js';
import { cover, bookCard, esc, euro, num, date, genreLabel, packageLabel, audienceLabel, sellerById } from './components.js';

const main = document.getElementById('content');
const id = new URLSearchParams(location.search).get('id');
const l = listings.find(x => x.id === id);

if (!l) {
  main.innerHTML = `<div class="wrap"><div class="empty" style="margin:80px 0">
    <h3>Projekt nicht gefunden</h3><p>Dieses Projekt gibt es nicht oder es wurde zurückgezogen.</p>
    <a class="btn" href="browse.html">Zum Marktplatz</a></div></div>`;
} else {
  document.title = `${l.title} – ReadyToPublish`;
  const s = sellerById(l.sellerId);
  const initials = s ? s.name.split(' ').map(p => p[0]).join('') : '?';
  const memberSince = s ? new Date(s.since + '-01').toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : '';
  const similar = listings.filter(x => x.id !== l.id && x.genre === l.genre)
    .concat(listings.filter(x => x.id !== l.id && x.genre !== l.genre && x.sellerId === l.sellerId))
    .slice(0, 4);

  main.innerHTML = `
  <div class="wrap">
    <nav class="crumbs" aria-label="Brotkrumen">
      <a href="browse.html">Marktplatz</a><span>/</span>
      <a href="browse.html?genre=${l.genre}">${esc(genreLabel(l.genre))}</a><span>/</span>
      ${esc(l.title)}
    </nav>

    <article class="detail">
      <div class="detail__cover">${cover(l)}</div>

      <div>
        <p class="kicker kicker--accent">${esc(genreLabel(l.genre))} · ${esc(packageLabel(l.package))}</p>
        <h1 class="display">${esc(l.title)}</h1>
        <p class="detail__author">von <a href="browse.html?verkaeufer=${l.sellerId}">${esc(l.author)}</a></p>
        <p class="detail__pitch">${esc(l.pitch)}</p>

        <div class="buybox">
          <div>
            <div class="price">${euro(l.price)}</div>
            <div class="buybox__note">${l.negotiable ? 'Preis verhandelbar' : 'Festpreis'} · inkl. aller Rechte</div>
          </div>
          <div class="buybox__actions">
            <button class="btn btn--ghost" type="button" data-demo>Frage stellen</button>
            <button class="btn btn--accent" type="button" data-demo>Projekt kaufen</button>
          </div>
        </div>

        <dl class="facts">
          <div><dt>Umfang</dt><dd>${num(l.words)} Wörter</dd></div>
          <div><dt>Zielgruppe</dt><dd>${esc(audienceLabel(l.audience))}</dd></div>
          <div><dt>Eingestellt</dt><dd>${date(l.listed)}</dd></div>
        </dl>

        <section class="detail-section">
          <h2>Über das Buch</h2>
          <div class="prose">${l.description.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}</div>
        </section>

        <section class="detail-section">
          <h2>Leseprobe</h2>
          <blockquote class="excerpt"><p>${esc(l.excerpt)}</p></blockquote>
        </section>

        <section class="detail-section">
          <h2>Im Paket enthalten</h2>
          <ul class="includes">${l.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        </section>

        <section class="detail-section">
          <h2>Schlagwörter</h2>
          <div class="tags">${l.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        </section>

        ${s ? `<section class="detail-section">
          <h2>Verkauft von</h2>
          <div class="seller">
            <div class="avatar" aria-hidden="true">${esc(initials)}</div>
            <div>
              <h3>${esc(s.name)}</h3>
              <div class="seller__meta">${esc(s.city)} · dabei seit ${memberSince} · antwortet ${esc(s.response)}</div>
              <p>${esc(s.bio)}</p>
              <a class="link" href="browse.html?verkaeufer=${s.id}">Alle Projekte von ${esc(s.name.split(' ')[0])} →</a>
            </div>
          </div>
        </section>` : ''}
      </div>
    </article>
  </div>

  ${similar.length ? `<section class="section section--tint">
    <div class="wrap">
      <div class="section-head"><div><p class="kicker">Weiterstöbern</p><h2 class="h2">Das könnte auch passen</h2></div></div>
      <div class="book-grid">${similar.map(bookCard).join('')}</div>
    </div>
  </section>` : ''}`;

  main.querySelectorAll('[data-demo]').forEach(b => b.addEventListener('click', () => {
    alert('Dies ist ein Prototyp – Käufe und Nachrichten sind noch nicht freigeschaltet.');
  }));
}
