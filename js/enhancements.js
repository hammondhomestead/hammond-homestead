/* ============================================================
   HAMMOND HOMESTEAD — UI Enhancements
   - Page transitions
   - Back to top button
   - Recently viewed products
   - Product image zoom
   - Hero parallax
   ============================================================ */


/* ─────────────────────────────────────────
   1. PAGE TRANSITIONS
───────────────────────────────────────── */

// Add fade overlay to body on load
function initPageTransitions() {
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.id = 'page-transition';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: #1A1710;
    z-index: 9999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.35s ease;
  `;
  document.body.appendChild(overlay);

  // Fade in on load
  requestAnimationFrame(() => {
    overlay.style.opacity = '0';
  });

  // Intercept all internal link clicks
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Only handle internal links
    if (
      href.startsWith('http') ||
      href.startsWith('mailto') ||
      href.startsWith('#') ||
      href.startsWith('tel') ||
      link.target === '_blank'
    ) return;

    e.preventDefault();
    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';

    setTimeout(() => {
      window.location.href = href;
    }, 350);
  });

  // Fade out when page loads
  window.addEventListener('pageshow', () => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
  });
}


/* ─────────────────────────────────────────
   2. BACK TO TOP BUTTON
───────────────────────────────────────── */

function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Back to top');
  btn.style.cssText = `
    position: fixed;
    bottom: 2rem;
    right: 1.5rem;
    width: 42px;
    height: 42px;
    background: #8A7A65;
    color: #FAF6EE;
    border: none;
    border-radius: 50%;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 800;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.3s ease, transform 0.3s ease, background 0.2s;
    box-shadow: 0 2px 12px rgba(26,23,16,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
  `;

  btn.addEventListener('mouseenter', () => btn.style.background = '#5C4E3C');
  btn.addEventListener('mouseleave', () => btn.style.background = '#8A7A65');
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.body.appendChild(btn);

  // Show/hide on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    } else {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(12px)';
    }
  }, { passive: true });
}


/* ─────────────────────────────────────────
   3. RECENTLY VIEWED PRODUCTS
───────────────────────────────────────── */

function trackRecentlyViewed(product) {
  let viewed = JSON.parse(localStorage.getItem('hh_recently_viewed') || '[]');
  // Remove if already exists
  viewed = viewed.filter(p => p.id !== product.id);
  // Add to front
  viewed.unshift(product);
  // Keep max 6
  viewed = viewed.slice(0, 6);
  localStorage.setItem('hh_recently_viewed', JSON.stringify(viewed));
}

function renderRecentlyViewed(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const viewed = JSON.parse(localStorage.getItem('hh_recently_viewed') || '[]');
  if (viewed.length === 0) {
    container.closest('.recently-viewed-section')?.remove();
    return;
  }

  container.innerHTML = viewed.map(p => `
    <div class="rv-card" onclick="window.location.href='product.html?id=${p.id}'" style="
      background: #fff;
      border: 0.5px solid #E8DDD0;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      min-width: 140px;
      flex-shrink: 0;
    "
    onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 16px rgba(138,122,101,0.12)'"
    onmouseleave="this.style.transform='';this.style.boxShadow=''">
      <div style="background:#F2EBE0;height:100px;display:flex;align-items:center;justify-content:center;font-size:2rem;">
        ${p.image
          ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">`
          : '🛍️'}
      </div>
      <div style="padding:8px 10px;">
        <div style="font-size:0.78rem;font-family:Georgia,serif;color:#2A1A0A;line-height:1.3;margin-bottom:4px;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.name}</div>
        <div style="font-size:0.82rem;font-weight:700;color:#5C4E3C;font-family:Arial,sans-serif;">$${parseFloat(p.price).toFixed(2)}</div>
      </div>
    </div>
  `).join('');
}

function injectRecentlyViewedSection() {
  const viewed = JSON.parse(localStorage.getItem('hh_recently_viewed') || '[]');
  if (viewed.length === 0) return;

  // Don't show on homepage or if section already exists
  if (document.getElementById('recently-viewed-container')) return;

  const section = document.createElement('div');
  section.className = 'recently-viewed-section';
  section.style.cssText = `
    background: #FAF6EE;
    padding: 40px 0;
    border-top: 1px solid #E8DDD0;
  `;
  section.innerHTML = `
    <div class="container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;">
        <div>
          <span class="eyebrow">Your History</span>
          <h3 style="font-family:Georgia,serif;color:#2A1A0A;font-size:1.2rem;">Recently Viewed</h3>
        </div>
      </div>
      <div id="recently-viewed-container" style="
        display:flex;
        gap:1rem;
        overflow-x:auto;
        padding-bottom:0.5rem;
        scrollbar-width:thin;
      "></div>
    </div>
  `;

  // Insert before footer
  const footer = document.querySelector('.site-footer');
  if (footer) footer.before(section);

  renderRecentlyViewed('recently-viewed-container');
}


/* ─────────────────────────────────────────
   4. PRODUCT IMAGE ZOOM (LIGHTBOX)
───────────────────────────────────────── */

function initImageZoom() {
  // Create lightbox
  const lightbox = document.createElement('div');
  lightbox.id = 'img-lightbox';
  lightbox.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(26,23,16,0.92);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    cursor: zoom-out;
    padding: 2rem;
  `;
  lightbox.innerHTML = `
    <button style="
      position:absolute;top:1rem;right:1.25rem;
      background:none;border:none;color:#FAF6EE;
      font-size:1.75rem;cursor:pointer;z-index:10001;
      opacity:0.7;transition:opacity 0.2s;
    " onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0.7'"
    onclick="closeLightbox()">✕</button>
    <img id="lightbox-img" style="
      max-width:90vw;
      max-height:85vh;
      object-fit:contain;
      border-radius:6px;
      transform:scale(0.95);
      transition:transform 0.3s ease;
      box-shadow:0 8px 48px rgba(0,0,0,0.4);
    " alt="Product zoom">
  `;
  document.body.appendChild(lightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(src, alt) {
  const lightbox = document.getElementById('img-lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lightbox || !img) return;

  img.src = src;
  img.alt = alt || 'Product image';
  lightbox.style.opacity = '1';
  lightbox.style.pointerEvents = 'all';
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => {
    img.style.transform = 'scale(1)';
  });
}

function closeLightbox() {
  const lightbox = document.getElementById('img-lightbox');
  const img = document.getElementById('lightbox-img');
  if (!lightbox) return;

  lightbox.style.opacity = '0';
  lightbox.style.pointerEvents = 'none';
  if (img) img.style.transform = 'scale(0.95)';
  document.body.style.overflow = '';
}

// Make product card images zoomable
function makeImagesZoomable() {
  document.querySelectorAll('.product-card-img img, .product-gallery-main img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLightbox(img.src, img.alt));
  });
}


/* ─────────────────────────────────────────
   5. HERO PARALLAX
───────────────────────────────────────── */

function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Add subtle floating animation to hero content
  const content = hero.querySelector('.hero-content');
  if (!content) return;

  // Parallax on scroll
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled > window.innerHeight) return;

    // Move content up slightly as you scroll
    const rate = scrolled * 0.25;
    content.style.transform = `translateY(${rate}px)`;
    content.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
  }, { passive: true });

  // Subtle floating animation on hero text
  const heading = hero.querySelector('h1');
  if (heading) {
    heading.style.animation = 'heroFloat 6s ease-in-out infinite';
  }

  // Inject keyframes
  if (!document.getElementById('parallax-styles')) {
    const style = document.createElement('style');
    style.id = 'parallax-styles';
    style.textContent = `
      @keyframes heroFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-6px); }
      }

      .hero-content {
        will-change: transform, opacity;
      }

      /* Subtle shimmer on hero rule */
      .hero-rule {
        position: relative;
        overflow: hidden;
      }
      .hero-rule::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(250,246,238,0.6), transparent);
        animation: shimmer 2.5s ease-in-out infinite;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* Fade in sections as they scroll into view */
      .scroll-reveal {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.6s ease, transform 0.6s ease;
      }
      .scroll-reveal.revealed {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }
}


/* ─────────────────────────────────────────
   6. SCROLL REVEAL (bonus)
───────────────────────────────────────── */

function initScrollReveal() {
  // Add scroll-reveal class to key sections
  const targets = document.querySelectorAll(
    '.product-card, .trust-item, .story-band-inner, .section-header, .admin-stat'
  );

  targets.forEach((el, i) => {
    el.classList.add('scroll-reveal');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}


/* ─────────────────────────────────────────
   7. INIT ALL
───────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initPageTransitions();
  initBackToTop();
  initImageZoom();
  initParallax();
  initScrollReveal();

  // Recently viewed — inject after products load with a short delay
  setTimeout(() => {
    injectRecentlyViewedSection();
    makeImagesZoomable();
  }, 1000);

  // Re-run zoom after dynamic product load
  const observer = new MutationObserver(() => {
    makeImagesZoomable();
  });
  const grids = document.querySelectorAll('.product-grid');
  grids.forEach(grid => observer.observe(grid, { childList: true }));
});
