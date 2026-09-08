/**
 * HarvestLink - Centralized i18n Translation Engine
 */
(function() {
  const HL_LANG = 'hl_lang';

  const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' }
  ];

  function getCurrentLanguage() {
    try {
      return localStorage.getItem(HL_LANG) || 'en';
    } catch(e) {
      return 'en';
    }
  }

  function getTranslation(key, lang, fallback) {
    if (!key) return fallback || '';
    const currentLang = lang || getCurrentLanguage();
    const dict = window.HL_TRANSLATIONS && window.HL_TRANSLATIONS[currentLang];
    const enDict = window.HL_TRANSLATIONS && window.HL_TRANSLATIONS.en;

    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback !== undefined ? fallback : key;
  }

  function t(key, fallback) {
    return getTranslation(key, getCurrentLanguage(), fallback);
  }

  function updateDropdownUI(lang) {
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

    // Update main button label & flag
    document.querySelectorAll('.lang-name-label').forEach(el => {
      el.textContent = langObj.native;
    });
    document.querySelectorAll('.lang-flag-small').forEach(el => {
      el.textContent = langObj.flag;
    });

    // Update active class on dropdown buttons
    document.querySelectorAll('.lang-option').forEach(btn => {
      const code = btn.getAttribute('data-lang');
      if (code === lang) {
        btn.classList.add('active');
        if (!btn.querySelector('.lang-check')) {
          const check = document.createElement('span');
          check.className = 'lang-check';
          check.textContent = '✓';
          btn.appendChild(check);
        }
      } else {
        btn.classList.remove('active');
        btn.querySelector('.lang-check')?.remove();
      }
    });
  }

  function applyTranslations(lang) {
    const activeLang = lang || getCurrentLanguage();
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = activeLang;
    }

    // 1. Text elements [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        const trans = getTranslation(key, activeLang, null);
        if (trans !== null) {
          el.textContent = trans;
        }
      }
    });

    // 2. HTML elements [data-i18n-html]
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        const trans = getTranslation(key, activeLang, null);
        if (trans !== null) {
          el.innerHTML = trans;
        }
      }
    });

    // 3. Placeholders [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        const trans = getTranslation(key, activeLang, null);
        if (trans !== null) {
          el.setAttribute('placeholder', trans);
        }
      }
    });

    // 4. Tooltips & Titles [data-i18n-title]
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        const trans = getTranslation(key, activeLang, null);
        if (trans !== null) {
          el.setAttribute('title', trans);
          if (el.hasAttribute('aria-label')) {
            el.setAttribute('aria-label', trans);
          }
        }
      }
    });

    // 5. Input Values [data-i18n-value]
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      if (key) {
        const trans = getTranslation(key, activeLang, null);
        if (trans !== null) {
          el.value = trans;
        }
      }
    });

    updateDropdownUI(activeLang);
  }

  function setAppLanguage(code, silent) {
    const valid = SUPPORTED_LANGUAGES.some(l => l.code === code);
    const targetCode = valid ? code : 'en';

    try {
      localStorage.setItem(HL_LANG, targetCode);
    } catch(e) {}

    applyTranslations(targetCode);

    // Close open dropdowns
    document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('#langBtn').forEach(b => b.setAttribute('aria-expanded', 'false'));

    // Dispatch event for dynamic page components
    if (typeof CustomEvent !== 'undefined') {
      const event = new CustomEvent('languageChanged', { detail: { lang: targetCode } });
      if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
        document.dispatchEvent(event);
      }
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(event);
      }
    }

    if (!silent && typeof window.showToast === 'function') {
      const toastMsg = getTranslation('toasts.lang_changed', targetCode, `Language set to ${targetCode}`);
      window.showToast(toastMsg, 'success');
    }
  }

  // Expose globally
  window.t = t;
  window.getTranslation = getTranslation;
  window.applyTranslations = applyTranslations;
  window.setAppLanguage = setAppLanguage;
  window.changeLanguage = setAppLanguage;
  window.getCurrentLanguage = getCurrentLanguage;
  window.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTranslations(getCurrentLanguage());
    });
  } else {
    applyTranslations(getCurrentLanguage());
  }
})();
