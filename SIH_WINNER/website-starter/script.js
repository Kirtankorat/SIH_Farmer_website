/* ============================
   HARVESTLINK — Main JS
   ============================ */

// =========================================
// NAVBAR: Scroll shadow & mobile menu
// =========================================
const navbar   = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
});

hamburger?.addEventListener('click', () => {
  mobileMenu?.classList.toggle('open');
});

// Close mobile menu when a link is clicked
mobileMenu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// =========================================
// SMOOTH SCROLL
// =========================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// =========================================
// PRODUCT DATA
// =========================================
const products = [
  {
    id: 1,
    emoji: '🍅',
    name: 'Fresh Tomatoes',
    price: '₹32',
    unit: 'kg',
    farmer: 'Shree Farms',
    location: 'Anand, Gujarat',
    practice: 'organic',
    practiceLabel: 'Organic',
    rating: '★★★★☆ 4.3',
    availability: 'available',
    availLabel: 'In Stock',
    category: 'vegetables'
  },
  {
    id: 2,
    emoji: '🥭',
    name: 'Alphonso Mango',
    price: '₹180',
    unit: 'kg',
    farmer: 'Konkan FPO',
    location: 'Maharashtra',
    practice: 'natural',
    practiceLabel: 'Natural',
    rating: '★★★★★ 4.8',
    availability: 'limited',
    availLabel: 'Limited Stock',
    category: 'fruits'
  },
  {
    id: 3,
    emoji: '🌾',
    name: 'Wheat (Lokwan)',
    price: '₹42',
    unit: 'kg',
    farmer: 'Kisan Collective',
    location: 'Mehsana, Gujarat',
    practice: 'conventional',
    practiceLabel: 'Conventional',
    rating: '★★★★☆ 4.1',
    availability: 'available',
    availLabel: 'In Stock',
    category: 'grains'
  },
  {
    id: 4,
    emoji: '🟡',
    name: 'Turmeric Powder',
    price: '₹145',
    unit: 'kg',
    farmer: 'Sahyog FPO',
    location: 'Anand, Gujarat',
    practice: 'organic',
    practiceLabel: 'Organic',
    rating: '★★★★★ 4.7',
    availability: 'available',
    availLabel: 'In Stock',
    category: 'spices'
  },
  {
    id: 5,
    emoji: '🧅',
    name: 'Onion',
    price: '₹28',
    unit: 'kg',
    farmer: 'Nashik Farmers',
    location: 'Nashik, Maharashtra',
    practice: 'conventional',
    practiceLabel: 'Conventional',
    rating: '★★★★☆ 4.0',
    availability: 'available',
    availLabel: 'In Stock',
    category: 'vegetables'
  },
  {
    id: 6,
    emoji: '🥔',
    name: 'Potato',
    price: '₹22',
    unit: 'kg',
    farmer: 'Agro FPO',
    location: 'Surat, Gujarat',
    practice: 'conventional',
    practiceLabel: 'Conventional',
    rating: '★★★★☆ 4.2',
    availability: 'available',
    availLabel: 'In Stock',
    category: 'vegetables'
  },
  {
    id: 7,
    emoji: '🫘',
    name: 'Toor Dal',
    price: '₹95',
    unit: 'kg',
    farmer: 'Vidarbha FPO',
    location: 'Nagpur, Maharashtra',
    practice: 'natural',
    practiceLabel: 'Natural',
    rating: '★★★★☆ 4.4',
    availability: 'available',
    availLabel: 'In Stock',
    category: 'pulses'
  },
  {
    id: 8,
    emoji: '🥛',
    name: 'Fresh Milk',
    price: '₹56',
    unit: 'litre',
    farmer: 'Amul Partner Dairy',
    location: 'Anand, Gujarat',
    practice: 'natural',
    practiceLabel: 'Natural',
    rating: '★★★★★ 4.9',
    availability: 'limited',
    availLabel: 'Limited Stock',
    category: 'dairy'
  }
];

// =========================================
// RENDER PRODUCT CARDS
// =========================================
function renderProducts(list) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:15px;">No products found.</div>';
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrap">
        <span>${p.emoji}</span>
        <span class="product-practice-tag tag-${p.practice}">${p.practiceLabel}</span>
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-price">${p.price} <span>/ ${p.unit}</span></div>
        <div class="product-farmer">${p.farmer}</div>
        <div class="product-location">📍 ${p.location}</div>
        <div class="product-rating">${p.rating}</div>
        <span class="product-availability avail-${p.availability === 'available' ? 'yes' : 'limited'}">${p.availLabel}</span>
        <button class="btn-add-cart" data-id="${p.id}" onclick="addToCart(this, '${p.name}')">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

// Initial render
renderProducts(products);

// =========================================
// CATEGORY FILTER
// =========================================
const categoryTabs = document.getElementById('categoryTabs');
categoryTabs?.querySelectorAll('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    categoryTabs.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
    renderProducts(filtered);
  });
});

// =========================================
// SEARCH FILTER
// =========================================
const searchInput = document.getElementById('searchInput');
searchInput?.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase().trim();
  const filtered = q
    ? products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.farmer.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    : products;
  renderProducts(filtered);
  // Reset category tabs
  categoryTabs?.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  categoryTabs?.querySelector('[data-cat="all"]')?.classList.add('active');
});

// =========================================
// CART & TOAST
// =========================================
let cart = [];
const cartToast = document.getElementById('cartToast');
const toastMsg  = document.getElementById('toastMsg');

function showToast(msg) {
  if (!cartToast) return;
  toastMsg.textContent = msg;
  cartToast.classList.add('show');
  setTimeout(() => cartToast.classList.remove('show'), 2800);
}

function addToCart(btn, name) {
  btn.classList.add('added');
  btn.textContent = '✓ Added';
  cart.push(name);
  showToast(`${name} added to cart`);
  setTimeout(() => {
    btn.classList.remove('added');
    btn.textContent = 'Add to Cart';
  }, 2000);
}

// =========================================
// AI DASHBOARD DATA
// =========================================
const cropData = {
  tomato: {
    name: '🍅 Tomato',
    trend: 'high',
    trendLabel: '↑ High Demand',
    nextWeek: '+18%',
    avgPrice: '₹32/kg',
    stock: '1,240 kg',
    recommendation: 'Prepare additional stock. Demand expected to spike next week due to seasonal demand.',
    bars: [55, 60, 52, 70, 68, 82, 90, 95, 88, 100, 92, 98, 110, 118]
  },
  onion: {
    name: '🧅 Onion',
    trend: 'stable',
    trendLabel: '→ Stable',
    nextWeek: '+3%',
    avgPrice: '₹28/kg',
    stock: '3,600 kg',
    recommendation: 'Maintain current supply. Demand is steady with no significant changes expected.',
    bars: [78, 80, 76, 82, 79, 81, 83, 80, 82, 84, 81, 83, 85, 83]
  },
  potato: {
    name: '🥔 Potato',
    trend: 'low',
    trendLabel: '↓ Moderate Drop',
    nextWeek: '-6%',
    avgPrice: '₹22/kg',
    stock: '4,200 kg',
    recommendation: 'Avoid overstocking. Demand is expected to moderate — plan supply accordingly.',
    bars: [90, 88, 85, 80, 75, 72, 68, 65, 63, 62, 60, 58, 56, 54]
  },
  wheat: {
    name: '🌾 Wheat',
    trend: 'stable',
    trendLabel: '→ Consistent',
    nextWeek: '+1%',
    avgPrice: '₹42/kg',
    stock: '12,000 kg',
    recommendation: 'Supply is aligned with demand. Continue regular production schedule.',
    bars: [72, 74, 73, 75, 74, 76, 75, 77, 76, 74, 75, 76, 77, 76]
  }
};

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const todayIdx = 6; // split past/forecast

function renderAIDashboard(cropKey) {
  const aiMain = document.getElementById('aiMain');
  if (!aiMain) return;

  const d = cropData[cropKey];
  const maxBar = Math.max(...d.bars);

  const barsHtml = d.bars.map((v, i) => {
    const heightPct = Math.round((v / maxBar) * 100);
    const isForecast = i > todayIdx;
    let barClass = isForecast ? 'bar bar-forecast' : 'bar bar-past';
    if (isForecast && d.trend === 'high') barClass = 'bar bar-high';
    return `
      <div class="bar-wrap">
        <div class="${barClass}" style="height:${heightPct}%"></div>
        <div class="bar-day">${days[i]}</div>
      </div>
    `;
  }).join('');

  aiMain.innerHTML = `
    <div class="ai-crop-header">
      <div class="ai-crop-name">${d.name}</div>
      <span class="ai-trend-badge trend-${d.trend}">${d.trendLabel}</span>
    </div>
    <div class="ai-chart">
      <div class="chart-label">Demand Index — Last 7 days + 7-day forecast</div>
      <div class="bar-chart">${barsHtml}</div>
    </div>
    <div class="ai-metrics">
      <div class="ai-metric-box">
        <div class="ambox-label">Next 7 Days</div>
        <div class="ambox-value ${d.trend === 'high' ? 'positive' : d.trend === 'low' ? 'negative' : 'neutral'}">${d.nextWeek}</div>
      </div>
      <div class="ai-metric-box">
        <div class="ambox-label">Avg. Price</div>
        <div class="ambox-value">${d.avgPrice}</div>
      </div>
      <div class="ai-metric-box">
        <div class="ambox-label">Current Stock</div>
        <div class="ambox-value">${d.stock}</div>
      </div>
    </div>
    <div class="ai-recommendation">
      <div class="ai-rec-label">Recommendation</div>
      <div class="ai-rec-text">${d.recommendation}</div>
    </div>
  `;
}

// AI nav switching
document.querySelectorAll('.ai-nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.ai-nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    renderAIDashboard(item.dataset.crop);
  });
});

// Initial render
renderAIDashboard('tomato');

// =========================================
// CONTACT FORM
// =========================================
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = document.getElementById('contactSubmit');
  if (!btn) return;
  btn.textContent = '✓ Message Sent!';
  btn.style.background = 'var(--terracotta)';
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    e.target.reset();
  }, 3000);
});

// =========================================
// INTERSECTION OBSERVER — fade in sections
// =========================================
const observerOptions = {
  threshold: 0.08,
  rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Add fade-in class to sections
document.querySelectorAll('section').forEach(section => {
  section.classList.add('fade-section');
  observer.observe(section);
});

// Add CSS for fade-in dynamically
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `
  .fade-section {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.55s ease, transform 0.55s ease;
  }
  .fade-section.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(fadeStyle);

// =========================================
// HERO IMAGE FALLBACK
// =========================================
const heroImg = document.getElementById('heroImg');
if (heroImg) {
  heroImg.onerror = () => {
    const wrap = heroImg.parentElement;
    const placeholder = document.createElement('div');
    placeholder.className = 'hero-img-placeholder';
    placeholder.innerHTML = `
      <span class="placeholder-icon">🌾</span>
      <span class="placeholder-text">Fresh produce, direct from farms</span>
    `;
    heroImg.replaceWith(placeholder);
  };
  heroImg.src = heroImg.src; // trigger onerror if image not found
}
