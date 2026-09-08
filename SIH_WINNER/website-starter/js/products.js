/* ==============================================================================
   HARVESTLINK — js/products.js
   Live Supabase Products & Catalog Integration
   Supports: Real-time queries, search, category/practice filtering, sorting, seller CRUD
   ============================================================================== */

(function () {
  'use strict';

  function getClient() {
    return window.getSupabase ? window.getSupabase() : window.supabaseClient;
  }

  // Format a database product row into UI card format
  function formatProduct(p) {
    const seller = p.seller || {};
    const priceNum = parseFloat(p.price) || 0;
    const isAvail = parseFloat(p.quantity_available) > 0 && p.status === 'active';
    const isFpo = seller.role === 'fpo' || seller.role === 'cooperative';

    return {
      id: p.id,
      emoji: p.emoji || '🌾',
      name: p.name,
      description: p.description || '',
      priceNum: priceNum,
      price: `₹${priceNum}`,
      unit: p.unit || 'kg',
      farmer: seller.farm_name || seller.business_name || seller.full_name || 'Verified Farmer',
      sellerType: seller.role || 'farmer',
      location: p.location || (seller.village ? `${seller.village}, ${seller.state || 'Gujarat'}` : 'Gujarat, India'),
      practice: p.farming_practice || 'organic',
      category: p.category || 'vegetables',
      rating: parseFloat(p.rating) || 4.5,
      availability: isAvail ? 'available' : 'limited',
      badge: isFpo ? 'Verified FPO' : 'Individual Farmer',
      quantity_available: parseFloat(p.quantity_available) || 0,
      minimum_order_quantity: parseFloat(p.minimum_order_quantity) || 1,
      image_url: p.image_url || null,
      seller_id: p.seller_id
    };
  }

  // --- Fetch Products with Filtering & Sorting ---
  async function fetchProducts(filters = {}) {
    const sb = getClient();
    if (!sb) {
      console.warn('[Products] Supabase client unavailable, using fallback dataset.');
      return filterLocalProducts(filters);
    }

    try {
      let query = sb
        .from('products')
        .select(`
          id, seller_id, name, description, category, subcategory,
          farming_practice, price, unit, quantity_available,
          minimum_order_quantity, image_url, emoji, location, status, rating,
          created_at,
          seller:profiles ( id, full_name, farm_name, business_name, role, village, state )
        `);

      // Search term
      if (filters.search && filters.search.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(`name.ilike.${term},description.ilike.${term}`);
      }

      // Category filter (single or array)
      if (filters.categories && filters.categories.length > 0 && !filters.categories.includes('all')) {
        query = query.in('category', filters.categories);
      } else if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Farming Practice filter
      if (filters.practices && filters.practices.length > 0 && !filters.practices.includes('all')) {
        query = query.in('farming_practice', filters.practices);
      } else if (filters.practice && filters.practice !== 'all') {
        query = query.eq('farming_practice', filters.practice);
      }

      // Max Price filter
      if (filters.max_price && Number(filters.max_price) > 0) {
        query = query.lte('price', Number(filters.max_price));
      }

      // Sorting
      switch (filters.sort) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[Products] Supabase fetch note:', error.message);
        return filterLocalProducts(filters);
      }

      if (!data || data.length === 0) {
        // If table exists but has no records, check local fallback
        return filterLocalProducts(filters);
      }

      let formatted = data.map(formatProduct);

      // Seller Type filter (performed client-side as seller is in joined profile)
      if (filters.seller_types && filters.seller_types.length > 0 && !filters.seller_types.includes('all')) {
        formatted = formatted.filter(p => filters.seller_types.includes(p.sellerType));
      } else if (filters.seller_type && filters.seller_type !== 'all') {
        formatted = formatted.filter(p => p.sellerType === filters.seller_type);
      }

      return formatted;
    } catch (err) {
      console.warn('[Products] Fetch exception:', err);
      return filterLocalProducts(filters);
    }
  }

  // --- Fetch Single Product by ID ---
  async function fetchProductById(productId) {
    const sb = getClient();
    if (!sb) return findLocalProduct(productId);

    try {
      const { data, error } = await sb
        .from('products')
        .select(`
          *,
          seller:profiles ( id, full_name, farm_name, business_name, role, village, state )
        `)
        .eq('id', productId)
        .maybeSingle();

      if (error || !data) {
        return findLocalProduct(productId);
      }

      return formatProduct(data);
    } catch (err) {
      return findLocalProduct(productId);
    }
  }

  // --- Seller: Create New Product ---
  async function createProduct(productData) {
    const sb = getClient();
    if (!sb) throw new Error('Database client not initialized');

    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) {
      throw new Error('You must be logged in as a seller to list products.');
    }

    const payload = {
      seller_id: session.user.id,
      name: productData.name,
      description: productData.description || '',
      category: productData.category || 'vegetables',
      subcategory: productData.subcategory || null,
      farming_practice: productData.farming_practice || 'organic',
      price: parseFloat(productData.price) || 0,
      unit: productData.unit || 'kg',
      quantity_available: parseFloat(productData.quantity_available || productData.stock_quantity) || 0,
      minimum_order_quantity: parseFloat(productData.minimum_order_quantity) || 1,
      image_url: productData.image_url || null,
      emoji: productData.emoji || getCategoryEmoji(productData.category),
      location: productData.location || 'Gujarat, India',
      status: 'active'
    };

    const { data, error } = await sb.from('products').insert([payload]).select().single();
    if (error) throw new Error(error.message);
    return formatProduct(data);
  }

  // --- Seller: Update Product ---
  async function updateProduct(id, updates) {
    const sb = getClient();
    if (!sb) throw new Error('Database client not initialized');

    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) throw new Error('Unauthorized');

    const { data, error } = await sb
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('seller_id', session.user.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return formatProduct(data);
  }

  // --- Seller: Delete Product ---
  async function deleteProduct(id) {
    const sb = getClient();
    if (!sb) throw new Error('Database client not initialized');

    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) throw new Error('Unauthorized');

    const { error } = await sb
      .from('products')
      .delete()
      .eq('id', id)
      .eq('seller_id', session.user.id);

    if (error) throw new Error(error.message);
    return true;
  }

  // --- Seller: Fetch Own Products ---
  async function fetchSellerProducts(sellerId) {
    const sb = getClient();
    if (!sb) return [];

    let targetId = sellerId;
    if (!targetId) {
      const { data: { session } } = await sb.auth.getSession();
      if (session?.user) targetId = session.user.id;
    }
    if (!targetId) return [];

    const { data, error } = await sb
      .from('products')
      .select('*')
      .eq('seller_id', targetId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Products] fetchSellerProducts note:', error.message);
      return [];
    }

    return (data || []).map(p => ({
      ...formatProduct(p),
      stock: `${p.quantity_available} ${p.unit} in stock`,
      meta: `${p.farming_practice.charAt(0).toUpperCase() + p.farming_practice.slice(1)} · ${p.category}`
    }));
  }

  // Category Emoji Helper
  function getCategoryEmoji(cat) {
    const map = {
      vegetables: '🍅',
      fruits: '🥭',
      grains: '🌾',
      pulses: '🫘',
      spices: '🟡',
      dairy: '🥛',
      cotton: '🌿'
    };
    return map[cat] || '🌾';
  }

  // Local fallback filters for development resilience
  function getCatalog() {
    if (window.PRODUCTS && window.PRODUCTS.length > 0) return window.PRODUCTS;
    return [
      { id: 1, emoji: '🍅', name: 'Fresh Tomatoes', priceNum: 32, price: '₹32', unit: 'kg', farmer: 'Shree Farms', sellerType: 'farmer', location: 'Gujarat', practice: 'organic', category: 'vegetables', rating: 4.3, availability: 'available', badge: 'Individual Farmer' },
      { id: 2, emoji: '🥭', name: 'Alphonso Mango', priceNum: 180, price: '₹180', unit: 'kg', farmer: 'Konkan FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'natural', category: 'fruits', rating: 4.8, availability: 'limited', badge: 'Verified FPO' },
      { id: 3, emoji: '🌾', name: 'Wheat (Lokwan)', priceNum: 42, price: '₹42', unit: 'kg', farmer: 'Gujarat Agri FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'conventional', category: 'grains', rating: 4.1, availability: 'available', badge: 'Verified FPO' },
      { id: 4, emoji: '🟡', name: 'Turmeric Powder', priceNum: 145, price: '₹145', unit: 'kg', farmer: 'Sahyog FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'organic', category: 'spices', rating: 4.7, availability: 'available', badge: 'Verified FPO' },
      { id: 5, emoji: '🧅', name: 'Onion', priceNum: 28, price: '₹28', unit: 'kg', farmer: 'Nashik Farms', sellerType: 'farmer', location: 'Maharashtra', practice: 'conventional', category: 'vegetables', rating: 4.0, availability: 'available', badge: 'Individual Farmer' },
      { id: 6, emoji: '🥔', name: 'Potato', priceNum: 22, price: '₹22', unit: 'kg', farmer: 'Agro FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'conventional', category: 'vegetables', rating: 4.2, availability: 'available', badge: 'Verified FPO' },
      { id: 7, emoji: '🫘', name: 'Toor Dal', priceNum: 95, price: '₹95', unit: 'kg', farmer: 'Vidarbha FPO', sellerType: 'fpo', location: 'Maharashtra', practice: 'natural', category: 'pulses', rating: 4.4, availability: 'available', badge: 'Verified FPO' },
      { id: 8, emoji: '🥛', name: 'Fresh Milk', priceNum: 56, price: '₹56', unit: 'litre', farmer: 'Anand Dairy FPO', sellerType: 'fpo', location: 'Gujarat', practice: 'natural', category: 'dairy', rating: 4.9, availability: 'limited', badge: 'Verified FPO' },
      { id: 9, emoji: '🌶️', name: 'Red Chilli', priceNum: 120, price: '₹120', unit: 'kg', farmer: 'Marwar Farms', sellerType: 'farmer', location: 'Rajasthan', practice: 'conventional', category: 'spices', rating: 4.2, availability: 'available', badge: 'Individual Farmer' },
      { id: 10, emoji: '🌿', name: 'Okra (Bhindi)', priceNum: 58, price: '₹58', unit: 'kg', farmer: 'Ramesh Patel', sellerType: 'farmer', location: 'Gujarat', practice: 'organic', category: 'vegetables', rating: 4.6, availability: 'available', badge: 'Individual Farmer' }
    ];
  }

  function filterLocalProducts(filters) {
    const local = getCatalog();
    return local.filter(p => {
      if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.categories && filters.categories.length && !filters.categories.includes(p.category)) return false;
      if (filters.category && filters.category !== 'all' && p.category !== filters.category) return false;
      if (filters.practices && filters.practices.length && !filters.practices.includes(p.practice)) return false;
      if (filters.practice && filters.practice !== 'all' && p.practice !== filters.practice) return false;
      if (filters.seller_types && filters.seller_types.length && !filters.seller_types.includes(p.sellerType)) return false;
      if (filters.max_price && p.priceNum > Number(filters.max_price)) return false;
      return true;
    });
  }

  function findLocalProduct(id) {
    const local = getCatalog();
    return local.find(p => String(p.id) === String(id)) || local[0] || null;
  }

  // Global namespace
  window.HarvestLinkProducts = {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchSellerProducts,
    formatProduct
  };
})();
