/* ============================================================
   HAMMOND HOMESTEAD — Main App JS
   ============================================================ */

// ── SUPABASE CONFIG ──
// Replace these with your actual Supabase credentials from supabase.com
const SUPABASE_URL = 'https://mirprmehihimttgxdcvq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eYgxk4-ygfHs-0FNF2RPdg_T2tJFEdO';

// ── STRIPE CONFIG ──
// Replace with your Stripe publishable key from stripe.com/dashboard
const STRIPE_KEY = 'YOUR_STRIPE_PUBLISHABLE_KEY';

// ── CART STATE ──
let cart = JSON.parse(localStorage.getItem('hh_cart') || '[]');

function saveCart() {
  localStorage.setItem('hh_cart', JSON.stringify(cart));
  updateCartUI();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  openCart();
  showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCartItems();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCartItems();
}

function updateCartUI() {
  const count = cartCount();
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  const empty = document.getElementById('cart-empty');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (empty) empty.classList.remove('hidden');
    if (footer) footer.classList.add('hidden');
    return;
  }

  if (empty) empty.classList.add('hidden');
  if (footer) footer.classList.remove('hidden');

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.image
          ? `<img src="${item.image}" alt="${item.name}">`
          : '🛍️'}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
          <button onclick="updateQty('${item.id}', -1)" style="background:none;border:1px solid #E8DDD0;width:24px;height:24px;border-radius:3px;font-size:0.9rem;color:#8A7A65;cursor:pointer;">−</button>
          <span style="font-size:0.85rem;color:#2A1A0A;">${item.qty}</span>
          <button onclick="updateQty('${item.id}', 1)" style="background:none;border:1px solid #E8DDD0;width:24px;height:24px;border-radius:3px;font-size:0.9rem;color:#8A7A65;cursor:pointer;">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
      </div>
    </div>
  `).join('');

  const subtotalEl = document.getElementById('cart-subtotal');
  if (subtotalEl) subtotalEl.textContent = `$${cartTotal().toFixed(2)}`;
}

// ── CART DRAWER ──
function openCart() {
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── TOAST ──
function showToast(msg, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ── MOBILE MENU ──
function toggleMenu() {
  const menu = document.getElementById('mobile-menu');
  menu?.classList.toggle('open');
}

// ── NEWSLETTER ──
function submitNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  const msg = document.getElementById('newsletter-msg');
  if (!input?.value) return;
  if (msg) {
    msg.textContent = 'Thanks! You\'re on the list.';
    msg.style.color = '#27AE60';
  }
  input.value = '';
}

// ── PRODUCT CARD BUILDER ──
function buildProductCard(p) {
  const imgHtml = p.image_url
    ? `<img src="${p.image_url}" alt="${p.name}" loading="lazy">`
    : `<div class="product-card-placeholder">🛍️</div>`;

  const badgeHtml = p.badge
    ? `<span class="product-card-badge">${p.badge}</span>`
    : '';

  return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-card-img">
        ${imgHtml}
        ${badgeHtml}
      </div>
      <div class="product-card-body">
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-desc">${p.description || ''}</div>
        <div class="product-card-footer">
          <div class="product-card-price">$${parseFloat(p.price).toFixed(2)}</div>
          <button class="btn btn-dark btn-sm"
            onclick="addToCart({id:'${p.id}',name:'${p.name.replace(/'/g,"\\'")}',price:${p.price},image:'${p.image_url || ''}'})">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

// ── LOAD PRODUCTS FROM SUPABASE ──
async function loadProducts(containerId, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="text-center text-muted" style="padding:2rem;">Loading products...</p>';

  try {
    let url = `${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`;
    if (limit) url += `&limit=${limit}`;

    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) throw new Error('Failed to load products');
    const products = await res.json();

    if (products.length === 0) {
      container.innerHTML = '<p class="text-center text-muted" style="padding:2rem;">No products yet — check back soon!</p>';
      return;
    }

    container.innerHTML = products.map(buildProductCard).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="text-center text-muted" style="padding:2rem;">Could not load products. Please refresh.</p>';
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Cart overlay click to close
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  // Newsletter form
  document.getElementById('newsletter-form')?.addEventListener('submit', submitNewsletter);
});
