/* ============================================================
   HAMMOND HOMESTEAD — Main App JS
   ============================================================ */

// ── SUPABASE CONFIG ──
const SUPABASE_URL = 'https://mirprmehihimttgxdcvq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcnBybWVoaWhpbXR0Z3hkY3ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxNzgyNzgsImV4cCI6MjA5Nzc1NDI3OH0.GKnX_tksrjKPS-Jyu7n7J1zT7jYIX5vvypP7jUkgczM';

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
  showToast(product.name + ' added to cart!', 'success');
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
  document.querySelectorAll('.cart-count').forEach(function(el) {
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

  var html = '';
  cart.forEach(function(item) {
    var imgHtml = item.image
      ? '<img src="' + item.image + '" alt="' + item.name + '">'
      : '🛍️';
    html += '<div class="cart-item">'
      + '<div class="cart-item-img">' + imgHtml + '</div>'
      + '<div class="cart-item-info">'
      + '<div class="cart-item-name">' + item.name + '</div>'
      + '<div class="cart-item-price">$' + (item.price * item.qty).toFixed(2) + '</div>'
      + '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">'
      + '<button onclick="updateQty(\'' + item.id + '\', -1)" style="background:none;border:1px solid #E8DDD0;width:24px;height:24px;border-radius:3px;font-size:0.9rem;color:#8A7A65;cursor:pointer;">−</button>'
      + '<span style="font-size:0.85rem;color:#2A1A0A;">' + item.qty + '</span>'
      + '<button onclick="updateQty(\'' + item.id + '\', 1)" style="background:none;border:1px solid #E8DDD0;width:24px;height:24px;border-radius:3px;font-size:0.9rem;color:#8A7A65;cursor:pointer;">+</button>'
      + '</div>'
      + '<button class="cart-item-remove" onclick="removeFromCart(\'' + item.id + '\')">Remove</button>'
      + '</div></div>';
  });
  container.innerHTML = html;

  var subtotalEl = document.getElementById('cart-subtotal');
  if (subtotalEl) subtotalEl.textContent = '$' + cartTotal().toFixed(2);
}

// ── CART DRAWER ──
function openCart() {
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}

function closeCart() {
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('cart-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── TOAST ──
function showToast(msg, type) {
  type = type || '';
  var toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'toast ' + type;
  setTimeout(function() { toast.classList.add('show'); }, 10);
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

// ── MOBILE MENU ──
function toggleMenu() {
  var menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('open');
}

// ── NEWSLETTER ──
function submitNewsletter(e) {
  e.preventDefault();
  var input = e.target.querySelector('input[type="email"]');
  var msg = document.getElementById('newsletter-msg');
  if (!input || !input.value) return;
  if (msg) {
    msg.textContent = "Thanks! You're on the list.";
    msg.style.color = '#27AE60';
  }
  input.value = '';
}

// ── RECENTLY VIEWED ──
function trackRecentlyViewed(product) {
  try {
    var viewed = JSON.parse(localStorage.getItem('hh_recently_viewed') || '[]');
    viewed = viewed.filter(function(p) { return p.id !== product.id; });
    viewed.unshift(product);
    viewed = viewed.slice(0, 6);
    localStorage.setItem('hh_recently_viewed', JSON.stringify(viewed));
  } catch(e) {
    console.log('Could not track recently viewed:', e);
  }
}

// ── PRODUCT CARD BUILDER ──
function buildProductCard(p) {
  var imgHtml = p.image_url
    ? '<img src="' + p.image_url + '" alt="' + p.name + '" loading="lazy">'
    : '<div class="product-card-placeholder">🛍️</div>';

  var badgeHtml = p.badge
    ? '<span class="product-card-badge">' + p.badge + '</span>'
    : '';

  var safeId = String(p.id);
  var safeName = p.name.replace(/'/g, "\\'");
  var safePrice = parseFloat(p.price);
  var safeImage = p.image_url || '';

  return '<div class="product-card" data-id="' + safeId + '">'
    + '<div class="product-card-img">' + imgHtml + badgeHtml + '</div>'
    + '<div class="product-card-body">'
    + '<div class="product-card-name">' + p.name + '</div>'
    + '<div class="product-card-desc">' + (p.description || '') + '</div>'
    + '<div class="product-card-footer">'
    + '<div class="product-card-price">$' + safePrice.toFixed(2) + '</div>'
    + '<button class="btn btn-dark btn-sm" onclick="'
    + 'trackRecentlyViewed({id:\'' + safeId + '\',name:\'' + safeName + '\',price:' + safePrice + ',image:\'' + safeImage + '\'});'
    + 'addToCart({id:\'' + safeId + '\',name:\'' + safeName + '\',price:' + safePrice + ',image:\'' + safeImage + '\'})'
    + '">Add to Cart</button>'
    + '</div></div></div>';
}

// ── LOAD PRODUCTS FROM SUPABASE ──
async function loadProducts(containerId, limit) {
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p class="text-center text-muted" style="padding:2rem;">Loading products...</p>';

  try {
    var url = SUPABASE_URL + '/rest/v1/products?select=*&active=eq.true&order=sort_order.asc,created_at.desc';
    if (limit) url += '&limit=' + limit;

    var res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });

    if (!res.ok) throw new Error('Failed to load products');
    var products = await res.json();

    if (products.length === 0) {
      container.innerHTML = '<p class="text-center text-muted" style="padding:2rem;">No products yet — check back soon!</p>';
      return;
    }

    // Ensure shipping_cost is available on each product
    products = products.map(p => ({ ...p, shipping_cost: parseFloat(p.shipping_cost) || 0 }));
    container.innerHTML = products.map(buildProductCard).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p class="text-center text-muted" style="padding:2rem;">Could not load products. Please refresh.</p>';
  }
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  updateCartUI();

  var overlay = document.getElementById('cart-overlay');
  if (overlay) overlay.addEventListener('click', closeCart);

  var newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) newsletterForm.addEventListener('submit', submitNewsletter);
});
