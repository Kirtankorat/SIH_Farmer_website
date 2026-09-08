/* ==============================================================================
   HARVESTLINK — js/supabase.js
   Centralized Supabase Client Singleton
   Uses Supabase Auth + PostgreSQL + Row Level Security (RLS)
   ============================================================================== */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://qywdstxkrllvbozivgod.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mQQSelQfXSJviBJs9lANRg_rd1sFf16';

  let client = null;

  function initClient() {
    if (client) return client;
    if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storageKey: 'harvestlink_auth_token'
          }
        });
        window.supabaseClient = client;
        window.sb = client;
        return client;
      } catch (err) {
        console.error('[HarvestLink Supabase] Initialization error:', err);
        return null;
      }
    }
    return null;
  }

  // Attempt immediate init if Supabase script already loaded
  initClient();

  // If supabase script hasn't loaded yet, try on DOM ready or window load
  if (!client) {
    window.addEventListener('DOMContentLoaded', () => {
      initClient();
    });
  }

  // Export helper getter
  window.getSupabase = function () {
    if (!client) initClient();
    if (!client) {
      console.warn('[HarvestLink Supabase] Supabase JS SDK not yet available. Ensure @supabase/supabase-js@2 script tag is present.');
    }
    return client;
  };

  // Expose configuration (safe public publishable key only)
  window.HL_SUPABASE_CONFIG = {
    url: SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY
  };
})();
