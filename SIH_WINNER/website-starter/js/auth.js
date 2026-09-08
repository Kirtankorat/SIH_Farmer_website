/* ==============================================================================
   HARVESTLINK — js/auth.js
   Real Supabase Authentication & Profile Management
   Supports: Real Signup, Real Login, Session Persistence, Role Authorization
   ============================================================================== */

(function () {
  'use strict';

  // Role to dashboard redirect map
  const ROLE_DASHBOARDS = {
    farmer: 'dashboard.html',
    fpo: 'dashboard-fpo.html',
    cooperative: 'dashboard-fpo.html',
    agri_entrepreneur: 'dashboard.html',
    individual_buyer: 'marketplace.html',
    bulk_buyer: 'dashboard-bulk.html',
    logistics: 'dashboard-logistics.html',
    admin: 'dashboard.html'
  };

  // In-memory cache of current profile
  let currentProfile = null;
  let authInitialized = false;

  function getClient() {
    return window.getSupabase ? window.getSupabase() : window.supabaseClient;
  }

  // --- Real Supabase Login ---
  async function signIn(email, password) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase client is not initialized.');

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      // Map error to user-friendly messages
      if (error.message.includes('Invalid login credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Please confirm your email address before signing in.');
      }
      throw new Error(error.message || 'Login failed.');
    }

    const user = data.user;
    const profile = await fetchProfile(user.id);
    currentProfile = profile;

    // Cache non-sensitive user metadata for synchronous layout paints
    localStorage.setItem('hl_user', JSON.stringify({
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.user_metadata?.full_name || 'HarvestLink User',
      role: profile?.role || user.user_metadata?.role || 'farmer'
    }));
    localStorage.setItem('hl_role', profile?.role || 'farmer');

    updateNavigationAuth();
    return { user, profile };
  }

  // --- Real Supabase Registration ---
  async function signUp(fields) {
    const sb = getClient();
    if (!sb) throw new Error('Supabase client is not initialized.');

    const { email, password, full_name, role, phone, ...extra } = fields;

    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    if (!full_name || full_name.trim().length === 0) {
      throw new Error('Please enter your full name.');
    }

    const validRoles = ['farmer', 'fpo', 'cooperative', 'agri_entrepreneur', 'individual_buyer', 'bulk_buyer'];
    const assignedRole = validRoles.includes(role) ? role : 'farmer';

    // 1. Supabase Auth Sign Up
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: full_name.trim(),
          phone: phone || null,
          role: assignedRole,
          ...extra
        }
      }
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        throw new Error('An account with this email already exists. Please login instead.');
      }
      throw new Error(error.message || 'Registration failed.');
    }

    const user = data.user;
    if (!user) {
      throw new Error('Registration failed. Please try again.');
    }

    // 2. Ensure profile in public.profiles exists
    try {
      const { error: profErr } = await sb.from('profiles').upsert({
        id: user.id,
        full_name: full_name.trim(),
        email: email.trim(),
        phone: phone || null,
        role: assignedRole,
        farm_name: extra.farm_name || null,
        business_name: extra.business_name || null,
        village: extra.village || null,
        state: extra.state || 'Gujarat',
        farming_practice: extra.farming_practice || 'organic',
        farm_size_acres: extra.farm_size_acres || null,
        primary_crops: extra.primary_crops || null,
        updated_at: new Date().toISOString()
      });
      if (profErr) {
        console.warn('[HarvestLink Auth] Profile upsert note:', profErr.message);
      }
    } catch (e) {
      console.warn('[HarvestLink Auth] Error creating profile row:', e);
    }

    const profile = await fetchProfile(user.id);
    currentProfile = profile;

    if (data.session) {
      localStorage.setItem('hl_user', JSON.stringify({
        id: user.id,
        email: user.email,
        name: full_name.trim(),
        role: assignedRole
      }));
      localStorage.setItem('hl_role', assignedRole);
      updateNavigationAuth();
    }

    return { user, session: data.session, profile };
  }

  // --- Real Supabase Sign Out ---
  async function signOut() {
    const sb = getClient();
    if (sb) {
      try {
        await sb.auth.signOut();
      } catch (e) {
        console.warn('Signout note:', e);
      }
    }
    currentProfile = null;
    localStorage.removeItem('hl_user');
    localStorage.removeItem('hl_role');
    localStorage.removeItem('harvestlink_auth_token');

    updateNavigationAuth();
    window.location.href = 'index.html';
  }

  // --- Fetch Profile from Database ---
  async function fetchProfile(userId) {
    const sb = getClient();
    if (!sb || !userId) return null;

    try {
      const { data, error } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[HarvestLink Auth] fetchProfile note:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('[HarvestLink Auth] Profile fetch error:', err);
      return null;
    }
  }

  // --- Get Active User & Profile ---
  async function getCurrentUser() {
    const sb = getClient();
    if (!sb) return null;

    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session || !session.user) return null;

      if (!currentProfile || currentProfile.id !== session.user.id) {
        currentProfile = await fetchProfile(session.user.id);
      }
      return {
        user: session.user,
        profile: currentProfile,
        role: currentProfile?.role || session.user.user_metadata?.role || 'farmer'
      };
    } catch (err) {
      return null;
    }
  }

  // --- Route to appropriate Dashboard by Role ---
  function getDashboardUrl(role) {
    return ROLE_DASHBOARDS[role] || 'dashboard.html';
  }

  // --- Page Guard: Require Authentication ---
  async function requireAuth(allowedRoles = []) {
    const sb = getClient();
    if (!sb) return;

    const { data: { session } } = await sb.auth.getSession();
    if (!session || !session.user) {
      const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `login.html?redirect=${currentUrl}`;
      return;
    }

    const profile = await fetchProfile(session.user.id);
    const userRole = profile?.role || session.user.user_metadata?.role || 'farmer';

    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      // User is logged in but role does not match this page: redirect to their own dashboard
      window.location.href = getDashboardUrl(userRole);
    }
  }

  // --- Update Navigation Bar Based on Auth State ---
  async function updateNavigationAuth() {
    const navInjects = document.querySelectorAll('.nav-actions-inject, .nav-actions');
    const sb = getClient();
    let session = null;

    if (sb) {
      try {
        const res = await sb.auth.getSession();
        session = res?.data?.session;
      } catch (_) {}
    }

    let userMeta = null;
    if (session?.user) {
      const prof = currentProfile || await fetchProfile(session.user.id);
      userMeta = {
        name: prof?.full_name || session.user.user_metadata?.full_name || 'My Account',
        role: prof?.role || session.user.user_metadata?.role || 'farmer'
      };
    } else {
      // Check cached localStorage user for fast initial render
      try {
        const cached = JSON.parse(localStorage.getItem('hl_user'));
        if (cached && cached.name) userMeta = cached;
      } catch (_) {}
    }

    navInjects.forEach(container => {
      // Preserve language switcher if present
      const langSwitcherHtml = window.HarvestLinkI18n ? window.HarvestLinkI18n.renderLanguageSwitcher() : '';

      if (session?.user || userMeta) {
        const role = userMeta?.role || 'farmer';
        const dashUrl = getDashboardUrl(role);
        const displayName = (userMeta?.name || 'Account').split(' ')[0];

        container.innerHTML = `
          ${langSwitcherHtml}
          <a href="cart.html" class="nav-cart-btn" aria-label="Cart">
            🛒 <span class="cart-badge" style="display:none">0</span>
          </a>
          <a href="${dashUrl}" class="btn-outline-sm" style="margin-left:4px">
            📊 ${displayName}
          </a>
          <button type="button" class="btn-outline-sm" onclick="window.HarvestLinkAuth.signOut()" style="margin-left:4px;cursor:pointer">
            Logout
          </button>
        `;
      } else {
        container.innerHTML = `
          ${langSwitcherHtml}
          <a href="cart.html" class="nav-cart-btn" aria-label="Cart">
            🛒 <span class="cart-badge" style="display:none">0</span>
          </a>
          <a href="login.html" class="btn-outline">Login</a>
          <a href="role-select.html" class="btn-primary">Join Free</a>
        `;
      }
    });

    if (window.HarvestLinkI18n) {
      window.HarvestLinkI18n.initLanguageSwitcherEvents();
      window.HarvestLinkI18n.translateDOM();
    }
    if (window.HarvestLinkCart) {
      window.HarvestLinkCart.updateCartBadge();
    }
  }

  // Listen to Auth State Changes
  function initAuthStateListener() {
    if (authInitialized) return;
    authInitialized = true;

    const sb = getClient();
    if (!sb) return;

    sb.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        currentProfile = await fetchProfile(session.user.id);
      } else {
        currentProfile = null;
      }
      updateNavigationAuth();
    });
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    initAuthStateListener();
    updateNavigationAuth();
  });

  // Global namespace
  window.HarvestLinkAuth = {
    signIn,
    signUp,
    signOut,
    fetchProfile,
    getCurrentUser,
    getDashboardUrl,
    requireAuth,
    updateNavigationAuth
  };

  // Backward compatibility aliases
  window.getUser = () => {
    try { return JSON.parse(localStorage.getItem('hl_user')) || null; } catch (_) { return null; }
  };
  window.getRole = () => localStorage.getItem('hl_role') || null;
  window.setUser = (u) => localStorage.setItem('hl_user', JSON.stringify(u));
  window.setRole = (r) => localStorage.setItem('hl_role', r);
  window.logout = signOut;
})();
