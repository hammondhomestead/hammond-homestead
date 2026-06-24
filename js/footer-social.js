/* ============================================================
   HAMMOND HOMESTEAD — Footer Social Links + Store Status
   Loads social links from Supabase and injects into footer
   Also checks if store is closed and shows closed page
   ============================================================ */

async function loadSocialLinks() {
  const footerCol = document.getElementById('footer-social-col');
  if (!footerCol) return;

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/social_links?select=*&order=sort_order.asc', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const links = await res.json();
    if (!links || links.length === 0) {
      footerCol.style.display = 'none';
      return;
    }

    const ICONS = {
      instagram: '📸', facebook: '👥', tiktok: '🎵',
      twitter: '🐦', youtube: '▶️', pinterest: '📌', etsy: '🛍️'
    };

    footerCol.innerHTML = '<h4>Follow Us</h4>'
      + links.map(s => `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer"
          style="display:flex;align-items:center;gap:7px;color:#7A6A58;font-family:Arial,sans-serif;font-size:.875rem;margin-bottom:.5rem;text-decoration:none;transition:color .2s;"
          onmouseenter="this.style.color='#B8A898'" onmouseleave="this.style.color='#7A6A58'">
          <span style="font-size:1rem;">${ICONS[s.platform] || '🔗'}</span>
          ${s.label || (s.platform.charAt(0).toUpperCase() + s.platform.slice(1))}
        </a>
      `).join('');

  } catch (err) {
    console.log('Could not load social links:', err);
    footerCol.style.display = 'none';
  }
}

async function checkStoreClosed() {
  // Skip check on admin pages
  if (window.location.pathname.includes('/admin')) return;

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/settings?key=eq.store_closed&select=value', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const data = await res.json();
    const isClosed = data && data[0] && data[0].value === 'true';

    if (isClosed) {
      // Don't show closed page on confirmation page
      if (window.location.pathname.includes('confirmation')) return;

      // Inject closed overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed;inset:0;background:#1A1710;z-index:9999;
        display:flex;align-items:center;justify-content:center;
        flex-direction:column;text-align:center;padding:2rem;
      `;
      overlay.innerHTML = `
        <div style="max-width:480px;">
          <div style="font-size:3rem;margin-bottom:1.5rem;">🌾</div>
          <h1 style="font-family:Georgia,serif;color:#FAF6EE;font-size:2rem;margin-bottom:.75rem;">
            We'll be back soon
          </h1>
          <p style="color:#B8A898;font-family:Arial,sans-serif;font-size:.95rem;line-height:1.7;margin-bottom:1.5rem;">
            Hammond Homestead is temporarily closed. We're taking a short break
            but will be back with more handmade goods very soon.
          </p>
          <p style="color:#8A7A65;font-family:Georgia,serif;font-style:italic;font-size:.9rem;">
            "Hustle and Motivation Makes Our Next Dream"
          </p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  } catch (err) {
    console.log('Could not check store status:', err);
  }
}

async function loadAnnouncementBar() {
  const bar = document.querySelector('.announcement-bar');
  if (!bar) return;

  try {
    const res = await fetch(SUPABASE_URL + '/rest/v1/settings?key=eq.announcement&select=value', {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
    });
    const data = await res.json();
    if (data && data[0] && data[0].value) {
      bar.textContent = data[0].value;
    }
  } catch (err) {
    console.log('Could not load announcement:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkStoreClosed();
  loadSocialLinks();
  loadAnnouncementBar();
});
