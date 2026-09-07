/* ================================================
   HARVESTLINK — app.js
   Shared frontend state: cart, auth, navbar, role
   ================================================ */

// ──────────────────────────────────────────────
// STATE KEYS
// ──────────────────────────────────────────────
const HL_CART = 'hl_cart';
const HL_USER = 'hl_user';
const HL_ROLE = 'hl_role';

// ──────────────────────────────────────────────
// CART STATE
// ──────────────────────────────────────────────
function getCart() {
  try { return JSON.parse(localStorage.getItem(HL_CART)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(HL_CART, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  // product = { id, emoji, name, price, priceNum, unit, farmer, location, practice, category }
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  showCartToast(product.name);
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}

function updateCartQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + (i.priceNum * i.qty), 0);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function clearCart() {
  saveCart([]);
}

// ──────────────────────────────────────────────
// AUTH STATE
// ──────────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem(HL_USER)) || null; }
  catch { return null; }
}

function getRole() {
  return localStorage.getItem(HL_ROLE) || null;
}

function setUser(user) {
  localStorage.setItem(HL_USER, JSON.stringify(user));
}

function setRole(role) {
  localStorage.setItem(HL_ROLE, role);
}

function logout() {
  localStorage.removeItem(HL_USER);
  localStorage.removeItem(HL_ROLE);
  window.location.href = 'index.html';
}

function getDashboardUrl(role) {
  const map = {
    farmer: 'dashboard.html',
    fpo: 'dashboard-fpo.html',
    logistics: 'dashboard-logistics.html',
    cooperative: 'dashboard-cooperative.html',
    entrepreneur: 'dashboard-entrepreneur.html',
    bulk: 'dashboard-bulk.html'
  };
  return map[role] || 'index.html';
}

// ──────────────────────────────────────────────
// CART BADGE IN NAVBAR
// ──────────────────────────────────────────────
function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge, .sidebar-cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? (el.classList.contains('sidebar-cart-badge') ? 'inline-flex' : 'flex') : 'none';
  });
  document.querySelectorAll('.cart-count-label').forEach(el => {
    el.textContent = count > 0 ? `(${count})` : '';
  });
}

// ──────────────────────────────────────────────
// PROFILE MENU IN NAVBAR
// ──────────────────────────────────────────────
function buildNavbarRight() {
  const user = getUser();
  const role = getRole();
  const containers = document.querySelectorAll('.nav-actions, .nav-actions-inject');

  if (!containers.length) return;

  // Cart icon injection — always shown
  const cartHtml = `
    <a href="cart.html" class="nav-cart-btn" id="navCartBtn" aria-label="Cart">
      <span class="cart-icon-wrap">
        🛒
        <span class="cart-badge" style="display:none">0</span>
      </span>
      <span class="cart-count-label"></span>
    </a>
  `;

  if (user) {
    const roleLabels = {
      farmer: 'Farmer', fpo: 'FPO', logistics: 'Logistics Partner',
      cooperative: 'Cooperative', entrepreneur: 'Agri Entrepreneur', bulk: 'Bulk Buyer'
    };
    const dashUrl = getDashboardUrl(role);
    const isSeller = ['farmer', 'fpo', 'cooperative', 'entrepreneur'].includes(role);
    const sellerMenu = isSeller ? `
      <a href="${dashUrl}">Dashboard</a>
      <a href="${dashUrl}#products">Products</a>
      <a href="${dashUrl}#orders">Orders</a>
    ` : `
      <a href="${dashUrl}">Dashboard</a>
      <a href="${dashUrl}#orders">My Orders</a>
    `;

    containers.forEach(c => {
      c.innerHTML = `
        ${cartHtml}
        <div class="profile-menu-wrap">
          <button class="profile-trigger" id="profileTrigger">
            <span class="profile-avatar">${(user.name || 'U')[0].toUpperCase()}</span>
            <span class="profile-name">${user.name?.split(' ')[0] || 'You'}</span>
            <span class="profile-caret">▾</span>
          </button>
          <div class="profile-dropdown" id="profileDropdown">
            <div class="pd-header">
              <div class="pd-name">${user.name || ''}</div>
              <div class="pd-role">${roleLabels[role] || role}</div>
            </div>
            <div class="pd-links">
              ${sellerMenu}
              <a href="cart.html">Cart <span class="cart-count-label pd-cart-count"></span></a>
              <a href="#" onclick="logout(); return false;" class="pd-logout">Logout</a>
            </div>
          </div>
        </div>
      `;
    });

    // Toggle profile dropdown
    document.querySelectorAll('#profileTrigger').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        document.querySelectorAll('#profileDropdown').forEach(d => d.classList.toggle('open'));
      });
    });

    document.addEventListener('click', () => {
      document.querySelectorAll('#profileDropdown').forEach(d => d.classList.remove('open'));
    });
  } else {
    // Guest state
    containers.forEach(c => {
      c.innerHTML = `
        ${cartHtml}
        <a href="login.html" class="nav-login">Login</a>
        <a href="role-select.html" class="btn-outline-sm">Join Free</a>
        <a href="marketplace.html" class="btn-primary-sm">Shop Produce</a>
      `;
    });
  }

  updateCartBadge();
}

// ──────────────────────────────────────────────
// TOAST NOTIFICATION
// ──────────────────────────────────────────────
function showCartToast(productName) {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-msg" id="toastMsg"></span>`;
    document.body.appendChild(toast);
  }
  document.getElementById('toastMsg').textContent = `${productName} added to cart`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function showToast(msg, type = 'success') {
  let toast = document.getElementById('cartToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'cartToast';
    toast.className = 'cart-toast';
    toast.innerHTML = `<span class="toast-icon">✓</span><span class="toast-msg" id="toastMsg"></span>`;
    document.body.appendChild(toast);
  }
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ──────────────────────────────────────────────
// SHARED PRODUCT DATASET (used by marketplace + search)
// ──────────────────────────────────────────────
const PRODUCTS = [
  { id: 1, emoji: '🍅', name: 'Fresh Tomatoes', priceNum: 32, price: '₹32', unit: 'kg', farmer: 'Shree Farms', sellerType: 'farmer', location: 'Gujarat', practice: 'organic', category: 'vegetables', rating: 4.3, availability: 'available', badge: 'Individual Farmer' },
  { id: 2, emoji: '🥭', name: 'Alphonso Mango', priceNum: 180, price: '₹180', unit: 'kg', farmer: 'Konkan FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'natural', category: 'fruits', rating: 4.8, availability: 'limited', badge: 'Verified FPO' },
  { id: 3, emoji: '🌾', name: 'Wheat (Lokwan)', priceNum: 42, price: '₹42', unit: 'kg', farmer: 'Kisan Collective', sellerType: 'cooperative', location: 'Gujarat', practice: 'conventional', category: 'grains', rating: 4.1, availability: 'available', badge: 'Cooperative' },
  { id: 4, emoji: '🟡', name: 'Turmeric Powder', priceNum: 145, price: '₹145', unit: 'kg', farmer: 'Sahyog FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'organic', category: 'spices', rating: 4.7, availability: 'available', badge: 'Verified FPO' },
  { id: 5, emoji: '🧅', name: 'Onion', priceNum: 28, price: '₹28', unit: 'kg', farmer: 'Nashik Farms', sellerType: 'farmer', location: 'Maharashtra', practice: 'conventional', category: 'vegetables', rating: 4.0, availability: 'available', badge: 'Individual Farmer' },
  { id: 6, emoji: '🥔', name: 'Potato', priceNum: 22, price: '₹22', unit: 'kg', farmer: 'Agro FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'conventional', category: 'vegetables', rating: 4.2, availability: 'available', badge: 'Verified FPO' },
  { id: 7, emoji: '🫘', name: 'Toor Dal', priceNum: 95, price: '₹95', unit: 'kg', farmer: 'Vidarbha FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'natural', category: 'pulses', rating: 4.4, availability: 'available', badge: 'Verified FPO' },
  { id: 8, emoji: '🥛', name: 'Fresh Milk', priceNum: 56, price: '₹56', unit: 'litre', farmer: 'Amul Partner', sellerType: 'cooperative', location: 'Gujarat', practice: 'natural', category: 'dairy', rating: 4.9, availability: 'limited', badge: 'Cooperative' },
  { id: 9, emoji: '🌶️', name: 'Red Chilli', priceNum: 120, price: '₹120', unit: 'kg', farmer: 'Spice Co-op', sellerType: 'cooperative', location: 'Rajasthan', practice: 'conventional', category: 'spices', rating: 4.2, availability: 'available', badge: 'Cooperative' },
  { id: 10, emoji: '🍌', name: 'Banana (Robusta)', priceNum: 35, price: '₹35', unit: 'dozen', farmer: 'Agri Ventures', sellerType: 'entrepreneur', location: 'Karnataka', practice: 'natural', category: 'fruits', rating: 4.5, availability: 'available', badge: 'Agri Entrepreneur' },
  { id: 11, emoji: '🌿', name: 'Okra (Bhindi)', priceNum: 58, price: '₹58', unit: 'kg', farmer: 'Ramesh Patel', sellerType: 'farmer', location: 'Gujarat', practice: 'organic', category: 'vegetables', rating: 4.6, availability: 'available', badge: 'Individual Farmer' },
  { id: 12, emoji: '🍆', name: 'Brinjal', priceNum: 40, price: '₹40', unit: 'kg', farmer: 'Ramesh Patel', sellerType: 'farmer', location: 'Gujarat', practice: 'organic', category: 'vegetables', rating: 4.3, availability: 'limited', badge: 'Individual Farmer' },
  { id: 13, emoji: '🌾', name: 'Bajra (Pearl Millet)', priceNum: 36, price: '₹36', unit: 'kg', farmer: 'Kisan Collective', sellerType: 'cooperative', location: 'Rajasthan', practice: 'conventional', category: 'grains', rating: 4.0, availability: 'available', badge: 'Cooperative' },
  { id: 14, emoji: '🥬', name: 'Spinach', priceNum: 30, price: '₹30', unit: 'kg', farmer: 'Green Farms', sellerType: 'farmer', location: 'Punjab', practice: 'organic', category: 'vegetables', rating: 4.4, availability: 'available', badge: 'Individual Farmer' },
  { id: 15, emoji: '🍈', name: 'Papaya', priceNum: 45, price: '₹45', unit: 'kg', farmer: 'Agri Ventures', sellerType: 'entrepreneur', location: 'Karnataka', practice: 'natural', category: 'fruits', rating: 4.3, availability: 'available', badge: 'Agri Entrepreneur' },
  { id: 16, emoji: '🫚', name: 'Mustard Oil', priceNum: 165, price: '₹165', unit: 'litre', farmer: 'Rajasthan FPO', sellerType: 'fpo', location: 'Rajasthan', practice: 'conventional', category: 'spices', rating: 4.1, availability: 'available', badge: 'Verified FPO' },
  { id: 17, emoji: '🫘', name: 'Chana Dal', priceNum: 88, price: '₹88', unit: 'kg', farmer: 'Vidarbha FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'conventional', category: 'pulses', rating: 4.3, availability: 'available', badge: 'Verified FPO' },
  { id: 18, emoji: '🌽', name: 'Sweet Corn', priceNum: 48, price: '₹48', unit: 'kg', farmer: 'Punjab Farms', sellerType: 'farmer', location: 'Punjab', practice: 'conventional', category: 'vegetables', rating: 4.2, availability: 'limited', badge: 'Individual Farmer' },
  { id: 19, emoji: '🧄', name: 'Garlic', priceNum: 72, price: '₹72', unit: 'kg', farmer: 'MP Collective', sellerType: 'cooperative', location: 'Madhya Pradesh', practice: 'conventional', category: 'vegetables', rating: 4.1, availability: 'available', badge: 'Cooperative' },
  { id: 20, emoji: '🍋', name: 'Lemon', priceNum: 55, price: '₹55', unit: 'kg', farmer: 'Citrus FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'natural', category: 'fruits', rating: 4.6, availability: 'available', badge: 'Verified FPO' }
];

// ──────────────────────────────────────────────
// RENDER PRODUCT CARD (shared across pages)
// ──────────────────────────────────────────────
function renderProductCard(p, showViewBtn = true) {
  const practiceClass = { organic: 'tag-organic', natural: 'tag-natural', conventional: 'tag-conventional' }[p.practice] || 'tag-conventional';
  const availClass = p.availability === 'available' ? 'avail-yes' : 'avail-limited';
  const availLabel = p.availability === 'available' ? 'In Stock' : 'Limited Stock';
  const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
  const sellerBadgeClass = {
    farmer: 'badge-farmer', fpo: 'badge-fpo',
    cooperative: 'badge-coop', entrepreneur: 'badge-entre'
  }[p.sellerType] || 'badge-farmer';

  return `
    <div class="product-card" data-id="${p.id}" data-cat="${p.category}" data-loc="${p.location}" data-practice="${p.practice}" data-price="${p.priceNum}" data-seller="${p.sellerType}" data-availability="${p.availability}">
      <div class="product-img-wrap">
        <span>${p.emoji}</span>
        <span class="product-practice-tag ${practiceClass}">${p.practice.charAt(0).toUpperCase() + p.practice.slice(1)}</span>
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${p.price} <span>/ ${p.unit}</span></div>
        <div class="seller-badge ${sellerBadgeClass}">${p.badge}</div>
        <div class="product-farmer">${p.farmer}</div>
        <div class="product-location">📍 ${p.location}</div>
        <div class="product-rating">${stars} ${p.rating}</div>
        <span class="product-availability ${availClass}">${availLabel}</span>
        <div class="product-card-actions">
          <button class="btn-add-cart" onclick='appAddToCart(${JSON.stringify(p).replace(/'/g,"&#39;")})'>+ Cart</button>
          ${showViewBtn ? `<a href="product.html?id=${p.id}" class="btn-view-product">View</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

function appAddToCart(p) {
  addToCart(p);
}

// ──────────────────────────────────────────────
// NAVBAR SCROLL EFFECT
// ──────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nb = document.getElementById('navbar');
  if (nb) nb.classList.toggle('scrolled', window.scrollY > 20);
});

// ──────────────────────────────────────────────
// LEFT SIDEBAR DRAWER & NAVIGATION
// ──────────────────────────────────────────────
function initLeftSidebar() {
  // 1. Inject sidebar toggle into navbar if not present
  const navContainer = document.querySelector('.nav-container');
  if (navContainer && !document.getElementById('leftSidebarToggle')) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'nav-sidebar-toggle';
    toggleBtn.id = 'leftSidebarToggle';
    toggleBtn.setAttribute('aria-label', 'Open navigation sidebar');
    toggleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
      <span>Menu</span>
    `;
    navContainer.insertBefore(toggleBtn, navContainer.firstChild);
  }

  // 2. Inject left sidebar & backdrop if not present
  if (!document.getElementById('leftSidebar')) {
    const user = getUser();
    const role = getRole();
    const roleLabels = {
      consumer: 'Consumer', farmer: 'Farmer', fpo: 'FPO Partner',
      logistics: 'Logistics Partner', cooperative: 'Cooperative',
      entrepreneur: 'Agri Entrepreneur', bulk: 'Bulk Buyer'
    };
    const userSectionHtml = user ? `
      <div class="sidebar-user-card">
        <div class="suc-avatar">${(user.name || 'U')[0].toUpperCase()}</div>
        <div class="suc-info">
          <div class="suc-name">${user.name || 'User'}</div>
          <div class="suc-role">${roleLabels[role] || 'Member'}</div>
        </div>
      </div>
      <div style="margin-top: 10px; display: flex; gap: 8px;">
        <a href="${getDashboardUrl(role)}" class="btn-primary-sm" style="flex:1; text-align:center; padding: 7px 12px; font-size:12px;">Dashboard</a>
        <a href="#" onclick="logout(); return false;" class="btn-outline-sm" style="padding: 7px 12px; font-size:12px;">Logout</a>
      </div>
    ` : `
      <div style="font-size: 13px; font-weight: 700; color: var(--brown); margin-bottom: 8px;">Welcome to HarvestLink</div>
      <div class="suc-guest-actions">
        <a href="login.html" class="btn-outline-sm" style="flex:1; text-align:center; padding: 7px 10px; font-size:12px;">Login</a>
        <a href="role-select.html" class="btn-primary-sm" style="flex:1; text-align:center; padding: 7px 10px; font-size:12px;">Join Free</a>
      </div>
    `;

    const sidebarHtml = `
      <div class="left-sidebar-backdrop" id="sidebarBackdrop"></div>
      <aside class="left-sidebar" id="leftSidebar" aria-label="Main sidebar navigation">
        <div class="sidebar-header">
          <a href="index.html" class="sidebar-logo">
            <span class="logo-leaf">⬟</span> HARVESTLINK
          </a>
          <button class="sidebar-close-btn" id="sidebarCloseBtn" aria-label="Close sidebar">✕</button>
        </div>

        <div class="sidebar-user-section" id="sidebarUserSection">
          ${userSectionHtml}
        </div>

        <div class="sidebar-nav-wrap">
          <div class="sidebar-section-title">Navigation</div>
          <ul class="sidebar-nav-list" id="sidebarNavList">
            <li>
              <a href="index.html" class="sidebar-nav-link" data-path="index.html">
                <span class="snl-icon">🏠</span>
                <span class="snl-text">Home</span>
              </a>
            </li>
            <li>
              <a href="marketplace.html" class="sidebar-nav-link" data-path="marketplace.html">
                <span class="snl-icon">🛒</span>
                <span class="snl-text">Marketplace</span>
                <span class="snl-badge">Fresh</span>
              </a>
            </li>
            <li>
              <a href="farmers.html" class="sidebar-nav-link" data-path="farmers.html">
                <span class="snl-icon">🌾</span>
                <span class="snl-text">Farmers</span>
              </a>
            </li>
            <li>
              <a href="businesses.html" class="sidebar-nav-link" data-path="businesses.html">
                <span class="snl-icon">🏢</span>
                <span class="snl-text">Businesses</span>
              </a>
            </li>
            <li>
              <a href="index.html#how-it-works" class="sidebar-nav-link" data-path="how-it-works">
                <span class="snl-icon">⚙️</span>
                <span class="snl-text">How It Works</span>
              </a>
            </li>
            <li>
              <a href="index.html#ai-logistics" class="sidebar-nav-link" data-path="ai-logistics">
                <span class="snl-icon">🚚</span>
                <span class="snl-text">AI & Logistics</span>
              </a>
            </li>
            <li>
              <a href="about.html" class="sidebar-nav-link" data-path="about.html">
                <span class="snl-icon">📖</span>
                <span class="snl-text">About</span>
              </a>
            </li>
            <li>
              <a href="faq.html" class="sidebar-nav-link" data-path="faq.html">
                <span class="snl-icon">❓</span>
                <span class="snl-text">FAQ</span>
              </a>
            </li>
          </ul>

          <div class="sidebar-section-title" style="margin-top: 18px;">Quick Access</div>
          <ul class="sidebar-nav-list">
            <li>
              <a href="order-tracking.html" class="sidebar-nav-link" data-path="order-tracking.html">
                <span class="snl-icon">📦</span>
                <span class="snl-text">Track Order</span>
              </a>
            </li>
            <li>
              <a href="cart.html" class="sidebar-nav-link" data-path="cart.html">
                <span class="snl-icon">🛍️</span>
                <span class="snl-text">My Cart</span>
                <span class="snl-badge sidebar-cart-badge" style="display:none;">0</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-footer-actions">
            <a href="marketplace.html" class="btn-primary-sm" style="width:100%; text-align:center; display:block; margin-bottom: 8px;">Explore Marketplace</a>
            <a href="role-select.html" class="btn-outline-sm" style="width:100%; text-align:center; display:block;">Join as Farmer / Buyer</a>
          </div>
          <div class="sidebar-tagline">HarvestLink — Direct Farm to Fork</div>
        </div>
      </aside>
    `;

    document.body.insertAdjacentHTML('beforeend', sidebarHtml);
  }

  // 3. Highlight current page link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#sidebarNavList .sidebar-nav-link').forEach(link => {
    const linkPath = link.getAttribute('data-path');
    if (linkPath && currentPath.includes(linkPath)) {
      link.classList.add('active');
    }
  });

  // 4. Bind events
  const sidebar = document.getElementById('leftSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const closeBtn = document.getElementById('sidebarCloseBtn');
  const toggleBtn = document.getElementById('leftSidebarToggle');
  const hamburger = document.getElementById('hamburger');

  function openSidebar() {
    sidebar?.classList.add('open');
    backdrop?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openSidebar();
  });

  hamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    openSidebar();
  });

  closeBtn?.addEventListener('click', closeSidebar);
  backdrop?.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  sidebar?.querySelectorAll('.sidebar-nav-link, .sidebar-footer a').forEach(a => {
    a.addEventListener('click', () => {
      closeSidebar();
    });
  });

  updateCartBadge();
}

// ──────────────────────────────────────────────
// HAMBURGER MENU & INIT
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileMenu');
  ham?.addEventListener('click', () => {
    // If mobileMenu exists and left sidebar is available, opening left sidebar provides superior experience
    if (mob && !document.getElementById('leftSidebar')) {
      mob.classList.toggle('open');
    }
  });
  mob?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Build navbar right section
  buildNavbarRight();

  // Initialize Left Sidebar navigation
  initLeftSidebar();

  // Scroll fade sections
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }});
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('section').forEach(s => {
    s.classList.add('fade-section');
    obs.observe(s);
  });

  // Add fade CSS if not present
  if (!document.getElementById('fadeStyle')) {
    const st = document.createElement('style');
    st.id = 'fadeStyle';
    st.textContent = `.fade-section{opacity:0;transform:translateY(18px);transition:opacity 0.5s ease,transform 0.5s ease}.fade-section.visible{opacity:1;transform:none}`;
    document.head.appendChild(st);
  }
});
