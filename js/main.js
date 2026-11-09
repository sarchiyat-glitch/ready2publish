// Gemeinsamer Kopf- und Fußbereich für alle Seiten.

const page = document.body.dataset.page;
const link = (href, label, key) =>
  `<a href="${href}"${page === key ? ' aria-current="page"' : ''}>${label}</a>`;

const header = `
  <div class="demo-bar"><strong>Vorschau:</strong> Alle Bücher und Verkäufer auf dieser Seite sind Beispieldaten.</div>
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a href="index.html" class="logo">readyto<i>publish</i></a>
      <nav class="nav" aria-label="Hauptnavigation">
        ${link('browse.html', 'Marktplatz', 'browse')}
        ${link('index.html#so-gehts', 'So funktioniert’s', 'how')}
        ${link('index.html#autoren', 'Für Autor:innen', 'authors')}
      </nav>
      <a href="sell.html" class="btn btn--sm">Projekt verkaufen</a>
      <button class="menu-btn" aria-label="Menü" aria-expanded="false" aria-controls="mobile-nav"><span></span></button>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile Navigation">
      <a href="browse.html">Marktplatz</a>
      <a href="index.html#so-gehts">So funktioniert’s</a>
      <a href="index.html#autoren">Für Autor:innen</a>
      <a href="sell.html" class="btn">Projekt verkaufen</a>
    </nav>
  </header>`;

const footer = `
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <a href="index.html" class="logo">readyto<i>publish</i></a>
          <p>Der Marktplatz für fertige Buchprojekte – von Autor:innen für Verlage, Agenturen und Selfpublisher.</p>
        </div>
        <div>
          <h4>Marktplatz</h4>
          <ul>
            <li><a href="browse.html">Alle Projekte</a></li>
            <li><a href="browse.html?genre=fantasy">Fantasy</a></li>
            <li><a href="browse.html?genre=thriller">Thriller</a></li>
            <li><a href="browse.html?genre=sachbuch">Sachbuch</a></li>
          </ul>
        </div>
        <div>
          <h4>Verkaufen</h4>
          <ul>
            <li><a href="sell.html">Projekt einstellen</a></li>
            <li><a href="index.html#autoren">Für Autor:innen</a></li>
            <li><a href="index.html#so-gehts">So funktioniert’s</a></li>
          </ul>
        </div>
        <div>
          <h4>Rechtliches</h4>
          <ul>
            <li><a href="impressum.html">Impressum</a></li>
            <li><a href="impressum.html#datenschutz">Datenschutz</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ReadyToPublish</span>
        <span>Prototyp · Beispieldaten</span>
      </div>
    </div>
  </footer>`;

document.body.insertAdjacentHTML('afterbegin', header);
document.body.insertAdjacentHTML('beforeend', footer);

const btn = document.querySelector('.menu-btn');
const mobile = document.getElementById('mobile-nav');
btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', open);
  mobile.classList.toggle('is-open', open);
});
mobile.addEventListener('click', e => {
  if (e.target.closest('a')) { btn.setAttribute('aria-expanded', 'false'); mobile.classList.remove('is-open'); }
});
