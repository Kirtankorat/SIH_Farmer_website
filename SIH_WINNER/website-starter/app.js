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
const HL_LANG = 'hl_lang';

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
  localStorage.removeItem('hl_token');
  window.location.href = 'index.html';
}

function getDashboardUrl(role) {
  const map = {
    farmer: 'dashboard.html',
    fpo: 'dashboard-fpo.html',
    logistics: 'dashboard-logistics.html',
    bulk: 'dashboard-bulk.html'
  };
  return map[role] || 'index.html';
}

// ──────────────────────────────────────────────
// CART BADGE IN NAVBAR
// ──────────────────────────────────────────────
function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
  document.querySelectorAll('.cart-count-label').forEach(el => {
    el.textContent = count > 0 ? `(${count})` : '';
  });
}

// ──────────────────────────────────────────────
// MULTI-LANGUAGE SYSTEM (English, Hindi, Gujarati)
// ──────────────────────────────────────────────
const SUPPORTED_LANGUAGES = window.SUPPORTED_LANGUAGES || [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' }
];

function getCurrentLanguage() {
  if (typeof window.getCurrentLanguage === 'function') {
    return window.getCurrentLanguage();
  }
  return localStorage.getItem(HL_LANG) || 'en';
}

function getLanguageSwitcherHtml() {
  const currentLangCode = getCurrentLanguage();
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const optionsHtml = SUPPORTED_LANGUAGES.map(l => {
    const isActive = l.code === currentLangCode ? 'active' : '';
    return `
      <button type="button" class="lang-option ${isActive}" data-lang="${l.code}" onclick="setAppLanguage('${l.code}')">
        <span class="lang-opt-flag">${l.flag}</span>
        <span class="lang-opt-text">
          <span class="lang-opt-native">${l.native}</span>
          <span class="lang-opt-name">${l.name}</span>
        </span>
        ${isActive ? '<span class="lang-check">✓</span>' : ''}
      </button>
    `;
  }).join('');

  const chooseLangText = (typeof window.t === 'function') ? window.t('nav.choose_language', 'Choose Language') : 'Choose Language';
  const langCountText = (typeof window.t === 'function') ? window.t('nav.languages_count', 'Languages') : 'Languages';

  return `
    <div class="lang-switcher-wrap" id="langSwitcherWrap">
      <button type="button" class="lang-btn" id="langBtn" aria-label="Select Language" aria-expanded="false">
        <span class="lang-globe">🌐</span>
        <span class="lang-btn-text">
          <span class="lang-flag-small">${currentLang.flag}</span>
          <span class="lang-name-label">${currentLang.native}</span>
        </span>
        <span class="lang-caret">▾</span>
      </button>
      <div class="lang-dropdown" id="langDropdown">
        <div class="lang-dropdown-header">
          <span>🌐 <span data-i18n="nav.choose_language">${chooseLangText}</span></span>
          <span class="lang-count">${SUPPORTED_LANGUAGES.length} <span data-i18n="nav.languages_count">${langCountText}</span></span>
        </div>
        <div class="lang-options-grid">
          ${optionsHtml}
        </div>
      </div>
    </div>
  `;
}

function attachLanguageSwitcherListeners() {
  document.querySelectorAll('#langBtn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const wrap = btn.closest('.lang-switcher-wrap');
      const dd = wrap?.querySelector('#langDropdown');
      const isOpen = dd?.classList.contains('open');
      document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('#langBtn').forEach(b => b.setAttribute('aria-expanded', 'false'));
      if (!isOpen && dd) {
        dd.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    };
  });
function setAppLanguage(code) {
  if (typeof window.setAppLanguage === 'function' && window.setAppLanguage !== setAppLanguage) {
    window.setAppLanguage(code);
  } else {
    localStorage.setItem(HL_LANG, code);
    if (typeof window.applyTranslations === 'function') {
      window.applyTranslations(code);
    }
  }
  buildNavbarRight();
}

window.setAppLanguage = setAppLanguage;
window.changeLanguage = setAppLanguage;
window.getCurrentLanguage = getCurrentLanguage;

// Global dropdown dismiss listeners
document.addEventListener('click', (e) => {
  if (!e.target.closest('.lang-switcher-wrap')) {
    document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('#langBtn').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('#langBtn').forEach(b => b.setAttribute('aria-expanded', 'false'));
  }
});

// ──────────────────────────────────────────────
// PROFILE MENU IN NAVBAR
// ──────────────────────────────────────────────
function buildNavbarRight() {
  const user = getUser();
  const role = getRole();
  const containers = document.querySelectorAll('#topHeader .top-header-actions, #topHeader .nav-actions-inject, .top-header-actions');

  if (!containers.length) return;

  const langHtml = getLanguageSwitcherHtml();

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
      bulk: 'Bulk Buyer'
    };
    const dashUrl = getDashboardUrl(role);
    const isSeller = ['farmer', 'fpo'].includes(role);
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
        ${langHtml}
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
        ${langHtml}
        ${cartHtml}
        <a href="login.html" class="nav-login">Login</a>
        <a href="role-select.html" class="btn-outline-sm">Join Free</a>
        <a href="marketplace.html" class="btn-primary-sm">Shop Produce</a>
      `;
    });
  }

  attachLanguageSwitcherListeners();
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
  { id: 3, emoji: '🌾', name: 'Wheat (Lokwan)', priceNum: 42, price: '₹42', unit: 'kg', farmer: 'Gujarat Agri FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'conventional', category: 'grains', rating: 4.1, availability: 'available', badge: 'Verified FPO' },
  { id: 4, emoji: '🟡', name: 'Turmeric Powder', priceNum: 145, price: '₹145', unit: 'kg', farmer: 'Sahyog FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'organic', category: 'spices', rating: 4.7, availability: 'available', badge: 'Verified FPO' },
  { id: 5, emoji: '🧅', name: 'Onion', priceNum: 28, price: '₹28', unit: 'kg', farmer: 'Nashik Farms', sellerType: 'farmer', location: 'Maharashtra', practice: 'conventional', category: 'vegetables', rating: 4.0, availability: 'available', badge: 'Individual Farmer' },
  { id: 6, emoji: '🥔', name: 'Potato', priceNum: 22, price: '₹22', unit: 'kg', farmer: 'Agro FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'conventional', category: 'vegetables', rating: 4.2, availability: 'available', badge: 'Verified FPO' },
  { id: 7, emoji: '🫘', name: 'Toor Dal', priceNum: 95, price: '₹95', unit: 'kg', farmer: 'Vidarbha FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'natural', category: 'pulses', rating: 4.4, availability: 'available', badge: 'Verified FPO' },
  { id: 8, emoji: '🥛', name: 'Fresh Milk', priceNum: 56, price: '₹56', unit: 'litre', farmer: 'Anand Dairy FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'natural', category: 'dairy', rating: 4.9, availability: 'limited', badge: 'Verified FPO' },
  { id: 9, emoji: '🌶️', name: 'Red Chilli', priceNum: 120, price: '₹120', unit: 'kg', farmer: 'Marwar Farms', sellerType: 'farmer', location: 'Rajasthan', practice: 'conventional', category: 'spices', rating: 4.2, availability: 'available', badge: 'Individual Farmer' },
  { id: 10, emoji: '🍌', name: 'Banana (Robusta)', priceNum: 35, price: '₹35', unit: 'dozen', farmer: 'Mysore Plantation', sellerType: 'farmer', location: 'Karnataka', practice: 'natural', category: 'fruits', rating: 4.5, availability: 'available', badge: 'Individual Farmer' },
  { id: 11, emoji: '🌿', name: 'Okra (Bhindi)', priceNum: 58, price: '₹58', unit: 'kg', farmer: 'Ramesh Patel', sellerType: 'farmer', location: 'Gujarat', practice: 'organic', category: 'vegetables', rating: 4.6, availability: 'available', badge: 'Individual Farmer' },
  { id: 12, emoji: '🍆', name: 'Brinjal', priceNum: 40, price: '₹40', unit: 'kg', farmer: 'Ramesh Patel', sellerType: 'farmer', location: 'Gujarat', practice: 'organic', category: 'vegetables', rating: 4.3, availability: 'limited', badge: 'Individual Farmer' },
  { id: 13, emoji: '🌾', name: 'Bajra (Pearl Millet)', priceNum: 36, price: '₹36', unit: 'kg', farmer: 'Rajasthan FPO', sellerType: 'fpo', location: 'Rajasthan', practice: 'conventional', category: 'grains', rating: 4.0, availability: 'available', badge: 'Verified FPO' },
  { id: 14, emoji: '🥬', name: 'Spinach', priceNum: 30, price: '₹30', unit: 'kg', farmer: 'Green Farms', sellerType: 'farmer', location: 'Punjab', practice: 'organic', category: 'vegetables', rating: 4.4, availability: 'available', badge: 'Individual Farmer' },
  { id: 15, emoji: '🍈', name: 'Papaya', priceNum: 45, price: '₹45', unit: 'kg', farmer: 'Karnataka Orchards', sellerType: 'farmer', location: 'Karnataka', practice: 'natural', category: 'fruits', rating: 4.3, availability: 'available', badge: 'Individual Farmer' },
  { id: 16, emoji: '🫚', name: 'Mustard Oil', priceNum: 165, price: '₹165', unit: 'litre', farmer: 'Rajasthan FPO', sellerType: 'fpo', location: 'Rajasthan', practice: 'conventional', category: 'spices', rating: 4.1, availability: 'available', badge: 'Verified FPO' },
  { id: 17, emoji: '🫘', name: 'Chana Dal', priceNum: 88, price: '₹88', unit: 'kg', farmer: 'Vidarbha FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'conventional', category: 'pulses', rating: 4.3, availability: 'available', badge: 'Verified FPO' },
  { id: 18, emoji: '🌽', name: 'Sweet Corn', priceNum: 48, price: '₹48', unit: 'kg', farmer: 'Punjab Farms', sellerType: 'farmer', location: 'Punjab', practice: 'conventional', category: 'vegetables', rating: 4.2, availability: 'limited', badge: 'Individual Farmer' },
  { id: 19, emoji: '🧄', name: 'Garlic', priceNum: 72, price: '₹72', unit: 'kg', farmer: 'Malwa FPO', sellerType: 'fpo', location: 'Madhya Pradesh', practice: 'conventional', category: 'vegetables', rating: 4.1, availability: 'available', badge: 'Verified FPO' },
  { id: 20, emoji: '🍋', name: 'Lemon', priceNum: 55, price: '₹55', unit: 'kg', farmer: 'Citrus FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'natural', category: 'fruits', rating: 4.6, availability: 'available', badge: 'Verified FPO' }
];

// ──────────────────────────────────────────────
// RENDER PRODUCT CARD (shared across pages)
// ──────────────────────────────────────────────
function renderProductCard(p, showViewBtn = true) {
  const lang = getCurrentLanguage();
  const practiceClass = { organic: 'tag-organic', natural: 'tag-natural', conventional: 'tag-conventional' }[p.practice] || 'tag-conventional';
  const rawPractice = p.practice.charAt(0).toUpperCase() + p.practice.slice(1);
  const practiceLabel = getTranslation(rawPractice, lang) || rawPractice;
  const availClass = p.availability === 'available' ? 'avail-yes' : 'avail-limited';
  const rawAvail = p.availability === 'available' ? 'In Stock' : 'Limited Stock';
  const availLabel = getTranslation(rawAvail, lang) || rawAvail;
  const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
  const sellerBadgeClass = {
    farmer: 'badge-farmer', fpo: 'badge-fpo'
  }[p.sellerType] || 'badge-farmer';
  const badgeLabel = getTranslation(p.badge, lang) || p.badge;
  const prodName = getTranslation(p.name, lang) || p.name;
  const addCartLabel = getTranslation('+ Cart', lang) || '+ Cart';
  const viewLabel = getTranslation('View', lang) || 'View';

  return `
    <div class="product-card" data-id="${p.id}" data-cat="${p.category}" data-loc="${p.location}" data-practice="${p.practice}" data-price="${p.priceNum}" data-seller="${p.sellerType}" data-availability="${p.availability}">
      <div class="product-img-wrap">
        <span>${p.emoji}</span>
        <span class="product-practice-tag ${practiceClass}">${practiceLabel}</span>
      </div>
      <div class="product-body">
        <div class="product-name">${prodName}</div>
        <div class="product-price">${p.price} <span>/ ${p.unit}</span></div>
        <div class="seller-badge ${sellerBadgeClass}">${badgeLabel}</div>
        <div class="product-farmer">${p.farmer}</div>
        <div class="product-location">📍 ${p.location}</div>
        <div class="product-rating">${stars} ${p.rating}</div>
        <span class="product-availability ${availClass}">${availLabel}</span>
        <div class="product-card-actions">
          <button class="btn-add-cart" onclick='appAddToCart(${JSON.stringify(p).replace(/'/g,"&#39;")})'>${addCartLabel}</button>
          ${showViewBtn ? `<a href="product.html?id=${p.id}" class="btn-view-product">${viewLabel}</a>` : ''}
        </div>
      </div>
    </div>
  `;
}

function appAddToCart(p) {
  addToCart(p);
}

// ──────────────────────────────────────────────
// TOP HEADER BAR & VERTICAL HOVER SIDEBAR
// ──────────────────────────────────────────────
function initNavigationSystem() {
  // 1. Ensure Top Header Bar exists
  let topHeader = document.getElementById('topHeader');
  if (!topHeader) {
    topHeader = document.createElement('header');
    topHeader.className = 'top-header';
    topHeader.id = 'topHeader';
    topHeader.innerHTML = `
      <div class="top-header-left">
        <button class="sidebar-toggle-btn" id="sidebarToggleBtn" aria-label="Open Navigation">
          <span class="st-icon">☰</span> Menu
        </button>
        <a href="index.html" class="top-header-logo">
          <span class="logo-leaf">⬟</span> HARVESTLINK
        </a>
      </div>
      <div class="top-header-actions nav-actions nav-actions-inject"></div>
    `;
    document.body.prepend(topHeader);
    buildNavbarRight();
  }

  // 2. Ensure Left Hover Trigger Zone exists
  let triggerStrip = document.getElementById('sidebarHoverTrigger');
  if (!triggerStrip) {
    triggerStrip = document.createElement('div');
    triggerStrip.className = 'sidebar-hover-trigger';
    triggerStrip.id = 'sidebarHoverTrigger';
    document.body.appendChild(triggerStrip);
  }

  // 3. Ensure Nav Backdrop Overlay exists
  let backdrop = document.getElementById('navBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.id = 'navBackdrop';
    document.body.appendChild(backdrop);
  }

  const navbar = document.getElementById('navbar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');

  // 4. Ensure Sidebar has a Header with Close Button
  if (navbar && !navbar.querySelector('.sidebar-header')) {
    const header = document.createElement('div');
    header.className = 'sidebar-header';
    header.innerHTML = `
      <a href="index.html" class="nav-logo">
        <span class="logo-leaf">⬟</span> HARVESTLINK
      </a>
      <button class="sidebar-close-btn" id="sidebarCloseBtn" aria-label="Close Navigation">✕</button>
    `;
    navbar.querySelector('.nav-container')?.prepend(header);

    // Remove any duplicate old standalone logo inside nav-container if header is present
    const oldLogos = navbar.querySelectorAll('.nav-container > a.nav-logo');
    oldLogos.forEach(l => l.remove());

    // Remove all action buttons from inside the sidebar
    navbar.querySelectorAll('.nav-actions, .nav-actions-inject, .mobile-actions, .mobile-menu, #hamburger').forEach(el => el.remove());
  }

  // Also strip action elements from navbar if header already exists
  navbar?.querySelectorAll('.nav-actions, .nav-actions-inject, .mobile-actions, .mobile-menu, #hamburger').forEach(el => el.remove());

  // Add Language Switcher section inside sidebar drawer
  if (navbar && !navbar.querySelector('.sidebar-lang-section')) {
    const langSec = document.createElement('div');
    langSec.className = 'sidebar-lang-section';
    langSec.style.cssText = 'padding: 16px 20px; border-top: 1px solid var(--border); margin-top: auto;';
    const cur = getCurrentLanguage();
    langSec.innerHTML = `
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; color: var(--text-secondary); margin-bottom: 8px;">🌐 Language / भाषा</div>
      <div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${SUPPORTED_LANGUAGES.map(l => `
          <button type="button" class="btn-outline-sm" style="padding: 4px 8px; font-size: 11.5px; border-radius: 4px; ${l.code === cur ? 'background: var(--green); color: #fff; border-color: var(--green);' : ''}" onclick="setAppLanguage('${l.code}')">
            ${l.flag} ${l.native}
          </button>
        `).join('')}
      </div>
    `;
    navbar.querySelector('.nav-container')?.appendChild(langSec);
  }

  // Add Join Free & Login action buttons to sidebar if guest
  if (!getUser() && navbar && !navbar.querySelector('.sidebar-auth-actions')) {
    const authSec = document.createElement('div');
    authSec.className = 'sidebar-auth-actions';
    authSec.style.cssText = 'padding: 14px 20px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px;';
    authSec.innerHTML = `
      <a href="role-select.html" class="btn-primary-full" style="padding: 11px; font-size: 14px; margin-bottom: 0; text-align: center;">Join Free</a>
      <a href="login.html" class="btn-outline-full" style="padding: 10px; font-size: 13.5px; margin-bottom: 0; text-align: center;">Login</a>
    `;
    navbar.querySelector('.nav-container')?.appendChild(authSec);
  }

  const closeBtn = document.getElementById('sidebarCloseBtn');

  let closeTimer = null;

  function openSidebar() {
    clearTimeout(closeTimer);
    navbar?.classList.add('open');
    backdrop?.classList.add('active');
  }

  function closeSidebar() {
    clearTimeout(closeTimer);
    navbar?.classList.remove('open');
    backdrop?.classList.remove('active');
  }

  // Auto-open when hovering left edge strip
  triggerStrip?.addEventListener('mouseenter', openSidebar);

  // Auto-open when hovering toggle button, and toggle on click
  toggleBtn?.addEventListener('mouseenter', openSidebar);
  toggleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navbar?.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Close on close button click
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeSidebar();
  });

  // Keep open while mouse is inside sidebar
  navbar?.addEventListener('mouseenter', () => {
    clearTimeout(closeTimer);
  });

  // Auto-close when mouse leaves sidebar
  navbar?.addEventListener('mouseleave', () => {
    closeTimer = setTimeout(() => {
      closeSidebar();
    }, 180);
  });

  // Mouse proximity detection (near left edge <= 25px)
  document.addEventListener('mousemove', (e) => {
    if (e.clientX <= 25 && !navbar?.classList.contains('open')) {
      openSidebar();
    }
  });

  // Close when clicking backdrop
  backdrop?.addEventListener('click', closeSidebar);

  // Close when clicking a nav link
  navbar?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  // Scroll effect on topbar
  window.addEventListener('scroll', () => {
    topHeader.classList.toggle('scrolled', window.scrollY > 15);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize topbar, hover proximity & sidebar
  initNavigationSystem();

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 74;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Highlight active navbar link
  highlightActiveNavLink();

  // Build top right corner action buttons (including language switcher)
  buildNavbarRight();

  // Initialize Language System and apply saved language
  const savedLang = getCurrentLanguage();
  if (typeof window.applyTranslations === 'function') {
    window.applyTranslations(savedLang);
  }

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

function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links .nav-link, .navbar a.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.split('#')[0];
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      if (!href.includes('#')) {
        link.classList.add('active');
      }
    } else if (linkPath && !href.startsWith('#')) {
      link.classList.remove('active');
    }
  });
}
