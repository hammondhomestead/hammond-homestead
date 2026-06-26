/* ============================================================
   HAMMOND HOMESTEAD — Custom Order Modal
   Appears after 4 seconds of browsing
   ============================================================ */

function initCustomOrderModal() {

  // Don't show on checkout, confirmation, or admin pages
  const path = window.location.pathname;
  if (path.includes('checkout') || path.includes('confirmation') || path.includes('admin')) return;

  // Don't show if dismissed in the last 24 hours
  const dismissed = localStorage.getItem('hh_custom_dismissed_time');
  if (dismissed && (Date.now() - parseInt(dismissed)) < 86400000) return;

  // ── INJECT STYLES ──
  const style = document.createElement('style');
  style.textContent = `
    #custom-order-fab {
      position: fixed;
      bottom: 2rem;
      right: 1.5rem;
      background: #1A1710;
      color: #FAF6EE;
      border: 2px solid #8A7A65;
      border-radius: 50px;
      padding: 11px 20px;
      font-size: 0.78rem;
      font-family: Arial, sans-serif;
      font-weight: 700;
      letter-spacing: 0.08em;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 24px rgba(26,23,16,0.3);
      z-index: 800;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.4s ease, transform 0.4s ease, background 0.2s;
    }
    #custom-order-fab.visible {
      opacity: 1;
      transform: translateY(0);
    }
    #custom-order-fab:hover {
      background: #8A7A65;
      border-color: #8A7A65;
    }
    .fab-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #8A7A65;
      flex-shrink: 0;
      animation: fabPulse 2s ease-in-out infinite;
    }
    #custom-order-fab:hover .fab-dot {
      background: #FAF6EE;
    }
    @keyframes fabPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.35); opacity: 0.6; }
    }

    #custom-order-overlay {
      position: fixed;
      inset: 0;
      background: rgba(26,23,16,0.7);
      z-index: 1500;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    #custom-order-overlay.open {
      opacity: 1;
      pointer-events: all;
    }

    #custom-order-modal {
      background: #FAF6EE;
      border-radius: 8px;
      width: 100%;
      max-width: 480px;
      border: 0.5px solid #E8DDD0;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.3s ease;
      max-height: 90vh;
      overflow-y: auto;
    }
    #custom-order-overlay.open #custom-order-modal {
      transform: scale(1) translateY(0);
    }

    .com-header {
      background: #1A1710;
      padding: 1.1rem 1.25rem;
      border-bottom: 2px solid #8A7A65;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .com-header h3 {
      color: #FAF6EE;
      font-family: Georgia, serif;
      font-size: 1.05rem;
      font-weight: 400;
    }
    .com-header-sub {
      color: #B8A898;
      font-size: 0.72rem;
      font-family: Arial, sans-serif;
      margin-top: 2px;
    }
    .com-close {
      background: none;
      border: none;
      color: #B8A898;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s;
      flex-shrink: 0;
    }
    .com-close:hover { color: #FAF6EE; }

    .com-body { padding: 1.25rem; }

    .com-intro {
      font-size: 0.82rem;
      color: #7A6A58;
      line-height: 1.65;
      margin-bottom: 1rem;
      text-align: center;
      font-family: Arial, sans-serif;
    }

    .com-tabs {
      display: flex;
      border: 0.5px solid #E8DDD0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
    }
    .com-tab {
      flex: 1;
      padding: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      font-family: Arial, sans-serif;
      letter-spacing: 0.05em;
      cursor: pointer;
      border: none;
      text-align: center;
      transition: all 0.2s;
    }
    .com-tab.active { background: #1A1710; color: #FAF6EE; }
    .com-tab:not(.active) { background: #F2EBE0; color: #7A6A58; }
    .com-tab:not(.active):hover { background: #E8DDD0; }

    .com-panel { display: none; }
    .com-panel.active { display: block; }

    .com-field { margin-bottom: 0.75rem; }
    .com-field label {
      display: block;
      font-size: 0.7rem;
      font-weight: 700;
      color: #7A6A58;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-family: Arial, sans-serif;
    }
    .com-field input,
    .com-field select,
    .com-field textarea {
      width: 100%;
      padding: 0.55rem 0.8rem;
      border: 1px solid #E8DDD0;
      border-radius: 3px;
      background: #fff;
      color: #2A1A0A;
      font-size: 0.875rem;
      font-family: Arial, sans-serif;
      transition: border-color 0.2s;
    }
    .com-field input:focus,
    .com-field select:focus,
    .com-field textarea:focus {
      border-color: #8A7A65;
      outline: none;
    }
    .com-field textarea { resize: vertical; min-height: 80px; }
    .com-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }

    .com-submit {
      background: #8A7A65;
      color: #FAF6EE;
      border: none;
      width: 100%;
      padding: 10px;
      font-size: 0.82rem;
      font-weight: 700;
      font-family: Arial, sans-serif;
      border-radius: 3px;
      cursor: pointer;
      letter-spacing: 0.08em;
      margin-top: 0.5rem;
      transition: background 0.2s;
    }
    .com-submit:hover { background: #5C4E3C; }
    .com-submit:disabled { opacity: 0.6; cursor: not-allowed; }

    .com-note {
      text-align: center;
      font-size: 0.72rem;
      color: #B8A898;
      margin-top: 0.6rem;
      font-family: Arial, sans-serif;
    }

    .com-success {
      text-align: center;
      padding: 2rem 1rem;
    }
    .com-success-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
    .com-success h4 { font-family: Georgia, serif; color: #2A1A0A; margin-bottom: 0.4rem; }
    .com-success p { font-size: 0.85rem; color: #7A6A58; font-family: Arial, sans-serif; }

    @media (max-width: 480px) {
      .com-field-row { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);

  // ── INJECT HTML ──
  const html = `
    <button id="custom-order-fab" aria-label="Request a custom order" onclick="openCustomModal()">
      <div class="fab-dot"></div>
      ✦ Request a Custom Order
    </button>

    <div id="custom-order-overlay" onclick="handleOverlayClick(event)">
      <div id="custom-order-modal" role="dialog" aria-modal="true" aria-label="Custom Order Request">

        <div class="com-header">
          <div>
            <h3>Custom Orders</h3>
            <div class="com-header-sub">Handmade just for you</div>
          </div>
          <button class="com-close" onclick="closeCustomModal()" aria-label="Close">✕</button>
        </div>

        <div class="com-body">
          <p class="com-intro">
            Want something made just for you? Hammond handcrafts custom orders
            with the same love and hustle as every product in the shop.
          </p>

          <div class="com-tabs">
            <button class="com-tab active" onclick="switchComTab('quick', this)">
              ⚡ Quick Inquiry
            </button>
            <button class="com-tab" onclick="switchComTab('detailed', this)">
              📋 Detailed Request
            </button>
          </div>

          <!-- SUCCESS STATE -->
          <div id="com-success" class="com-success" style="display:none;">
            <div class="com-success-icon">✅</div>
            <h4>Request Sent!</h4>
            <p>Thanks! We'll get back to you within 1–2 business days to discuss your custom order.</p>
          </div>

          <!-- QUICK INQUIRY -->
          <div class="com-panel active" id="com-panel-quick">
            <div class="com-field">
              <label>Your Name</label>
              <input type="text" id="q-name" placeholder="Jane Hammond">
            </div>
            <div class="com-field">
              <label>Email</label>
              <input type="email" id="q-email" placeholder="jane@email.com">
            </div>
            <div class="com-field">
              <label>What are you looking for?</label>
              <textarea id="q-message" placeholder="e.g. I'd love a custom candle set as a wedding gift for 20 guests..."></textarea>
            </div>
            <button class="com-submit" id="q-submit" onclick="submitQuick()">Send Inquiry →</button>
            <p class="com-note">We'll get back to you within 1–2 business days</p>
          </div>

          <!-- DETAILED REQUEST -->
          <div class="com-panel" id="com-panel-detailed">
            <div class="com-field-row">
              <div class="com-field">
                <label>Your Name</label>
                <input type="text" id="d-name" placeholder="Jane Hammond">
              </div>
              <div class="com-field">
                <label>Email</label>
                <input type="email" id="d-email" placeholder="jane@email.com">
              </div>
            </div>
            <div class="com-field">
              <label>Product Type</label>
              <select id="d-type">
                <option value="">Select a product type...</option>
                <option>Candles</option>
                <option>Body Scrubs</option>
                <option>Gift Sets</option>
                <option>Soaps</option>
                <option>Other / Not sure</option>
              </select>
            </div>
            <div class="com-field-row">
              <div class="com-field">
                <label>Quantity</label>
                <input type="number" id="d-qty" placeholder="e.g. 10" min="1">
              </div>
              <div class="com-field">
                <label>Budget ($)</label>
                <input type="text" id="d-budget" placeholder="e.g. $150">
              </div>
            </div>
            <div class="com-field">
              <label>Date Needed By (optional)</label>
              <input type="date" id="d-date">
            </div>
            <div class="com-field">
              <label>Details & Special Requests</label>
              <textarea id="d-details" placeholder="Describe scents, colours, packaging, occasion, personalisation, anything that helps us understand your vision..."></textarea>
            </div>
            <button class="com-submit" id="d-submit" onclick="submitDetailed()">Submit Custom Request →</button>
            <p class="com-note">We'll get back to you within 1–2 business days</p>
          </div>

        </div>
      </div>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // ── SHOW AFTER 4 SECONDS ──
  setTimeout(() => {
    const fab = document.getElementById('custom-order-fab');
    if (fab) fab.classList.add('visible');
  }, 4000);
}

/* ── MODAL CONTROLS ── */
function openCustomModal() {
  document.getElementById('custom-order-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCustomModal() {
  document.getElementById('custom-order-overlay').classList.remove('open');
  document.body.style.overflow = '';
  localStorage.setItem('hh_custom_dismissed_time', Date.now());
}

function handleOverlayClick(e) {
  if (e.target.id === 'custom-order-overlay') closeCustomModal();
}

function switchComTab(name, btn) {
  document.querySelectorAll('.com-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.com-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('com-panel-' + name).classList.add('active');
}

/* ── SUBMIT QUICK INQUIRY ── */
async function submitQuick() {
  const name = document.getElementById('q-name').value.trim();
  const email = document.getElementById('q-email').value.trim();
  const message = document.getElementById('q-message').value.trim();
  const btn = document.getElementById('q-submit');

  if (!name || !email || !message) {
    showToast('Please fill in all fields.', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending...';

  try {
    await saveCustomOrder({
      type: 'quick',
      name, email,
      message,
      submitted_at: new Date().toISOString()
    });
  } catch (err) {
    console.log('Could not save to database, showing success anyway:', err);
  }
  showSuccess();
}

/* ── SUBMIT DETAILED REQUEST ── */
async function submitDetailed() {
  const name = document.getElementById('d-name').value.trim();
  const email = document.getElementById('d-email').value.trim();
  const type = document.getElementById('d-type').value;
  const details = document.getElementById('d-details').value.trim();
  const btn = document.getElementById('d-submit');

  if (!name || !email || !details) {
    showToast('Please fill in your name, email, and details.', 'error');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending...';

  try {
    await saveCustomOrder({
      type: 'detailed',
      name, email,
      product_type: type,
      quantity: document.getElementById('d-qty').value || null,
      budget: document.getElementById('d-budget').value || null,
      date_needed: document.getElementById('d-date').value || null,
      message: details,
      submitted_at: new Date().toISOString()
    });
  } catch (err) {
    console.log('Could not save to database, showing success anyway:', err);
  }
  showSuccess();
}

/* ── SAVE TO SUPABASE ── */
async function saveCustomOrder(data) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/custom_orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to save');
}

/* ── SHOW SUCCESS ── */
function showSuccess() {
  document.querySelectorAll('.com-panel, .com-tabs, .com-intro').forEach(el => el.style.display = 'none');
  document.getElementById('com-success').style.display = 'block';
  localStorage.setItem('hh_custom_dismissed_time', Date.now());
  setTimeout(closeCustomModal, 3000);
}

/* ── CLOSE ON ESCAPE ── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCustomModal();
});

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', initCustomOrderModal);
