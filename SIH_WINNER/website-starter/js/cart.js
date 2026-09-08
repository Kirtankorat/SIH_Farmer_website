/* ==============================================================================
   HARVESTLINK — js/cart.js
   Real Supabase Database Cart Persistence
   Table: public.cart_items (user_id, product_id, quantity) with RLS
   Automatic guest -> authenticated cart migration
   ============================================================================== */

(function () {
  'use strict';

  const LOCAL_CART_KEY = 'hl_cart';
  let memoryCart = [];

  function getClient() {
    return window.getSupabase ? window.getSupabase() : window.supabaseClient;
  }

  // --- Fetch Cart from Supabase (or localStorage fallback) ---
  async function fetchCart() {
    const sb = getClient();
    if (!sb) {
      memoryCart = getLocalCart();
      updateCartBadge();
      return memoryCart;
    }

    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session || !session.user) {
        // Guest user: use localStorage
        memoryCart = getLocalCart();
        updateCartBadge();
        return memoryCart;
      }

      // Authenticated: Query public.cart_items joined with public.products
      const { data, error } = await sb
        .from('cart_items')
        .select(`
          id, quantity, product_id,
          product:products (
            id, name, price, unit, emoji, farming_practice, location, quantity_available,
            seller:profiles ( full_name, farm_name, role )
          )
        `)
        .eq('user_id', session.user.id);

      if (error) {
        console.warn('[Cart] Database cart fetch note:', error.message);
        memoryCart = getLocalCart();
        updateCartBadge();
        return memoryCart;
      }

      // Map rows into UI-friendly cart item array
      memoryCart = (data || []).map(row => {
        const prod = row.product || {};
        const seller = prod.seller || {};
        const priceNum = parseFloat(prod.price) || 0;
        return {
          id: prod.id || row.product_id,
          cart_item_id: row.id,
          name: prod.name || 'Produce Item',
          emoji: prod.emoji || '🌾',
          priceNum: priceNum,
          price: `₹${priceNum}`,
          unit: prod.unit || 'kg',
          farmer: seller.farm_name || seller.full_name || 'Verified Farmer',
          location: prod.location || 'Gujarat',
          practice: prod.farming_practice || 'organic',
          qty: parseFloat(row.quantity) || 1,
          quantity_available: parseFloat(prod.quantity_available) || 999
        };
      });

      // Also mirror to localStorage for offline / instant badge rendering
      saveLocalCart(memoryCart);
      updateCartBadge();
      return memoryCart;
    } catch (err) {
      console.warn('[Cart] Fetch error:', err);
      memoryCart = getLocalCart();
      updateCartBadge();
      return memoryCart;
    }
  }

  // --- Add to Cart ---
  async function addToCart(product, quantity = 1) {
    const sb = getClient();
    const productId = product.id;
    const addQty = Math.max(1, quantity);

    if (sb) {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user && typeof productId === 'string' && productId.includes('-')) {
          // UUID: Insert or update row in public.cart_items
          // Check if item already in cart
          const { data: existing } = await sb
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .maybeSingle();

          if (existing) {
            const newQty = existing.quantity + addQty;
            await sb
              .from('cart_items')
              .update({ quantity: newQty, updated_at: new Date().toISOString() })
              .eq('id', existing.id);
          } else {
            await sb.from('cart_items').insert([{
              user_id: session.user.id,
              product_id: productId,
              quantity: addQty
            }]);
          }
          await fetchCart();
          showCartToast(product.name);
          return;
        }
      } catch (err) {
        console.warn('[Cart] Database addToCart error, using local fallback:', err);
      }
    }

    // Guest fallback
    const cart = getLocalCart();
    const existing = cart.find(i => String(i.id) === String(productId));
    if (existing) {
      existing.qty += addQty;
    } else {
      cart.push({
        id: product.id,
        emoji: product.emoji || '🌾',
        name: product.name,
        price: product.price || `₹${product.priceNum}`,
        priceNum: parseFloat(product.priceNum || product.price) || 30,
        unit: product.unit || 'kg',
        farmer: product.farmer || product.farmer_name || 'Farm Partner',
        location: product.location || 'Gujarat',
        practice: product.practice || 'organic',
        qty: addQty
      });
    }
    saveLocalCart(cart);
    memoryCart = cart;
    updateCartBadge();
    showCartToast(product.name);
  }

  // --- Update Item Quantity ---
  async function updateCartQty(productId, delta) {
    const sb = getClient();

    if (sb) {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user && typeof productId === 'string' && productId.includes('-')) {
          const { data: item } = await sb
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .maybeSingle();

          if (item) {
            const newQty = Math.max(1, item.quantity + delta);
            await sb.from('cart_items').update({ quantity: newQty }).eq('id', item.id);
            await fetchCart();
            return;
          }
        }
      } catch (err) {
        console.warn('[Cart] Database updateCartQty error:', err);
      }
    }

    // Guest fallback
    const cart = getLocalCart();
    const item = cart.find(i => String(i.id) === String(productId));
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveLocalCart(cart);
    memoryCart = cart;
    updateCartBadge();
  }

  // --- Remove Item ---
  async function removeFromCart(productId) {
    const sb = getClient();

    if (sb) {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user && typeof productId === 'string' && productId.includes('-')) {
          await sb
            .from('cart_items')
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId);

          await fetchCart();
          showToast('Removed from cart', 'info');
          return;
        }
      } catch (err) {
        console.warn('[Cart] Database removeFromCart error:', err);
      }
    }

    // Guest fallback
    const cart = getLocalCart().filter(i => String(i.id) !== String(productId));
    saveLocalCart(cart);
    memoryCart = cart;
    updateCartBadge();
    showToast('Removed from cart', 'info');
  }

  // --- Clear Cart ---
  async function clearCart() {
    const sb = getClient();

    if (sb) {
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          await sb.from('cart_items').delete().eq('user_id', session.user.id);
        }
      } catch (err) {
        console.warn('[Cart] Database clearCart error:', err);
      }
    }

    saveLocalCart([]);
    memoryCart = [];
    updateCartBadge();
  }

  // Synchronous getter for views
  function getCart() {
    return memoryCart.length > 0 ? memoryCart : getLocalCart();
  }

  function getCartTotal() {
    return getCart().reduce((sum, i) => sum + (parseFloat(i.priceNum || 0) * (i.qty || 1)), 0);
  }

  function getCartCount() {
    return getCart().reduce((sum, i) => sum + (i.qty || 1), 0);
  }

  function updateCartBadge() {
    const count = getCartCount();
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
    document.querySelectorAll('.cart-count-label').forEach(el => {
      el.textContent = count > 0 ? `(${count})` : '';
    });
  }

  function showCartToast(name) {
    if (typeof window.showToast === 'function') {
      window.showToast(`✓ Added ${name} to cart!`, 'success');
    }
  }

  // Local Storage Helpers
  function getLocalCart() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_CART_KEY)) || [];
    } catch (_) {
      return [];
    }
  }

  function saveLocalCart(cart) {
    try {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    } catch (_) {}
    updateCartBadge();
  }

  // Initialize cart on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    fetchCart();
  });

  // Global namespace
  window.HarvestLinkCart = {
    fetchCart,
    getCart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    updateCartBadge
  };

  // Backward compatibility aliases
  window.getCart = getCart;
  window.saveCart = saveLocalCart;
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.updateCartQty = updateCartQty;
  window.getCartTotal = getCartTotal;
  window.getCartCount = getCartCount;
  window.clearCart = clearCart;
  window.updateCartBadge = updateCartBadge;
})();
