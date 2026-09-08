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
// MULTI-LANGUAGE SYSTEM (English, Hindi, Gujarati, etc.)
// ──────────────────────────────────────────────
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' }
];

const HL_TRANSLATIONS = {
  // Navigation & Core Actions
  "Home": { hi: "होम", gu: "હોમ", mr: "मुख्यपृष्ठ", pa: "ਮੁੱਖ ਪੰਨਾ", bn: "হোম", ta: "முகப்பு", te: "హోమ్" },
  "Marketplace": { hi: "मार्केटप्लेस", gu: "માર્કેટપ્લેસ", mr: "बाजारपेठ", pa: "ਮਾਰਕੀਟਪਲੇਸ", bn: "মার্কেটপ্লেস", ta: "சந்தை", te: "మార్కెట్‌ప్લેస్" },
  "Farmers": { hi: "किसान", gu: "ખેડૂતો", mr: "शेतकरी", pa: "ਕਿਸਾਨ", bn: "কৃষক", ta: "விவசாயிகள்", te: "రైతులు" },
  "Businesses": { hi: "व्यापार", gu: "વેપાર", mr: "व्यवसाय", pa: "ਵਪਾਰ", bn: "ব্যবসা", ta: "வணிகங்கள்", te: "వ్యాపారాలు" },
  "How It Works": { hi: "यह कैसे काम करता है", gu: "તે કેવી રીતે કાર્ય કરે છે", mr: "हे कसे कार्य करते", pa: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ", bn: "এটি কীভাবে কাজ করে", ta: "இது எவ்வாறு செயல்படுகிறது", te: "ఇది ఎలా పనిచేస్తుంది" },
  "AI & Logistics": { hi: "एआई और लॉजिस्टिक्स", gu: "એઆઈ અને લોજિસ્ટિક્સ", mr: "एआय आणि लॉजिस्टिक्स", pa: "AI ਅਤੇ ਲੌਜਿਸਟਿਕਸ", bn: "এআই এবং লজিস্টিকস", ta: "AI & தளவாடங்கள்", te: "AI & లాజిస్టిక్స్" },
  "About": { hi: "हमारे बारे में", gu: "અમારા વિશે", mr: "आमच्याबद्दल", pa: "ਸਾਡੇ ਬਾਰੇ", bn: "আমাদের সম্পর্কে", ta: "எங்களைப் பற்றி", te: "మా గురించి" },
  "FAQ": { hi: "सामान्य प्रश्न", gu: "વારંવાર પૂછાતા પ્રશ્નો", mr: "नेहमी विचारले जाणारे प्रश्न", pa: "ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ", bn: "সাধারণ জিজ্ঞাসা", ta: "அடிக்கடி கேட்கப்படும் கேள்விகள்", te: "తరచుగా అడిగే ప్రశ్నలు" },
  "Menu": { hi: "मेनू", gu: "મેનુ", mr: "मेनू", pa: "ਮੀਨੂ", bn: "মেনু", ta: "மெனு", te: "మెనూ" },
  "Close": { hi: "बंद करें", gu: "બંધ કરો", mr: "बंद करा", pa: "ਬੰਦ ਕਰੋ", bn: "বন্ধ করুন", ta: "மூடு", te: "మూసివేయి" },
  "Cart": { hi: "कार्ट", gu: "કાર્ટ", mr: "कार्ट", pa: "ਕਾਰਟ", bn: "কার্ট", ta: "கார்ட்", te: "కార్ట్" },
  "Login": { hi: "लॉग इन", gu: "લોગિન", mr: "लॉगिन", pa: "ਲਾਗਇਨ", bn: "লগইন", ta: "உள்நுழைக", te: "లాగిన్" },
  "Join Free": { hi: "निःशुल्क जुड़ें", gu: "મફત જોડાઓ", mr: "विनामूल्य सामील व्हा", pa: "ਮੁਫਤ ਸ਼ਾਮਲ ਹੋਵੋ", bn: "বিনামূল্যে যোগ দিন", ta: "இலவசமாக இணையுங்கள்", te: "ఉచితంగా చేరండి" },
  "Shop Produce": { hi: "उपज खरीदें", gu: "તાજી ઉપજ ખરીદો", mr: "उत्पादने खरेदी करा", pa: "ਉਪਜ ਖਰੀਦੋ", bn: "পণ্য কিনুন", ta: "பொருட்களை வாங்கவும்", te: "ఉత్పత్తులను కొనండి" },
  "Shop Fresh Produce": { hi: "ताज़ा उत्पाद खरीदें", gu: "તાજી પેદાશ ખરીદો", mr: "ताजी उत्पादने खरेदी करा" },
  "Sell Your Produce": { hi: "अपनी उपज बेचें", gu: "તમારી ઉપજ વેચો", mr: "तुमची उत्पादने विका" },
  "Logout": { hi: "लॉगआउट", gu: "લૉગઆઉટ", mr: "लॉगआउट", pa: "ਲਾਗਆਉਟ", bn: "লগআউট", ta: "வெளியேறு", te: "లాగౌట్" },
  "Dashboard": { hi: "डैशबोर्ड", gu: "ડેશબોર્ડ", mr: "डॅशबोर्ड", pa: "ਡੈਸ਼ਬੋਰਡ", bn: "ড্যাশবোর্ড", ta: "டாஷ்போர்டு", te: "డ్యాష్‌బోర్డ్" },
  "Products": { hi: "उत्पाद", gu: "ઉત્પાદનો", mr: "उत्पादने", pa: "ਉਤਪਾਦ", bn: "পণ্যসমূহ", ta: "தயாரிப்புகள்", te: "ఉత్పత్తులు" },
  "Orders": { hi: "ऑर्डर", gu: "ઓર્ડર", mr: "ऑर्डर्स", pa: "ਆਰਡਰ", bn: "অর্ডার", ta: "ஆர்டர்கள்", te: "ఆర్డర్లు" },
  "My Orders": { hi: "मेरे ऑर्डर", gu: "મારા ઓર્ડર", mr: "माझे ऑर्डर्स", pa: "ਮੇਰੇ ਆਰਡਰ", bn: "আমার অর্ডার", ta: "எனது ஆர்டர்கள்", te: "నా ఆర్డర్లు" },

  // Roles & Badges
  "Farmer": { hi: "किसान", gu: "ખેડૂત", mr: "शेतकरी" },
  "FPO": { hi: "एफपीओ (किसान संगठन)", gu: "એફપીઓ (ખેડૂત સંગઠન)", mr: "एफपीओ" },
  "Logistics Partner": { hi: "लॉजिस्टिक्स पार्टनर", gu: "લોજિસ્ટિક્સ પાર્ટનર", mr: "लॉजिस्टिक्स भागीदार" },
  "Bulk Buyer": { hi: "थोक खरीदार", gu: "જથ્થાબંધ ખરીદદાર", mr: "घाऊक खरेदीदार" },
  "Individual Farmer": { hi: "व्यक्तिगत किसान", gu: "વ્યક્તિગત ખેડૂત", mr: "वैयक्तिक शेतकरी" },
  "Verified FPO": { hi: "सत्यापित एफपीओ", gu: "ચકાસાયેલ એફપીઓ", mr: "सत्यापित एफपीओ" },

  // Hero & Trust Badges
  "Agricultural Marketplace · India": { hi: "कृषि मार्केटप्लेस · भारत", gu: "કૃષિ માર્કેટપ્લેસ · ભારત", mr: "कृषी बाजारपेठ · भारत" },
  "Fresh produce.": { hi: "ताज़ी उपज।", gu: "તાજી પેદાશ.", mr: "ताजी उत्पादने." },
  "Fresh produce": { hi: "ताज़ी उपज", gu: "તાજી પેદાશ", mr: "ताजी उत्पादने" },
  "Direct from farmers.": { hi: "सीधे किसानों से।", gu: "સીધા ખેડૂતો પાસેથી.", mr: "थेट शेतकऱ्यांकडून." },
  "Direct from farmers": { hi: "सीधे किसानों से", gu: "સીધા ખેડૂતો પાસેથી", mr: "थेट शेतकऱ्यांकडून" },
  "Direct from Farmers": { hi: "सीधे किसानों से", gu: "સીધા ખેડૂતો પાસેથી", mr: "थेट शेतकऱ्यांकडून" },
  "Buy fresh produce directly from verified farmers and FPOs, while smarter demand planning and logistics help move food efficiently from farm to market.": {
    hi: "सत्यापित किसानों और एफपीओ से सीधे ताज़ा उत्पाद खरीदें, जबकि स्मार्ट मांग योजना और लॉजिस्टिक्स खेत से बाज़ार तक भोजन को कुशलतापूर्वक पहुँचाते हैं।",
    gu: "ચકાસાયેલ ખેડૂતો અને એફપીઓ પાસેથી સીધી તાજી પેદાશો ખરીદો, જ્યારે સ્માર્ટ માંગ આયોજન અને લોજિસ્ટિક્સ ખેતરથી બજાર સુધી કાર્યક્ષમ રીતે માલ પહોંચાડે છે.",
    mr: "सत्यापित शेतकरी आणि FPO कडून थेट ताजी उत्पादने खरेदी करा, तर स्मार्ट मागणी नियोजन आणि लॉजिस्टिक्स शेतातून बाजारात अन्न कार्यक्षमतेने पोहोचवण्यास मदत करतात."
  },
  "✓ Direct from Farmers": { hi: "✓ सीधे किसानों से", gu: "✓ સીધા ખેડૂતો પાસેથી", mr: "✓ थेट शेतकऱ्यांकडून" },
  "✓ Fairer Prices": { hi: "✓ उचित मूल्य", gu: "✓ વાજબી ભાવ", mr: "✓ रास्त भाव" },
  "✓ Smarter Delivery": { hi: "✓ स्मार्ट डिलीवरी", gu: "✓ સ્માર્ટ ડિલિવરી", mr: "✓ स्मार्ट डिलिव्हरी" },
  "Fairer Prices": { hi: "उचित मूल्य", gu: "વાજબી ભાવ", mr: "रास्त भाव" },
  "Smarter Delivery": { hi: "स्मार्ट डिलीवरी", gu: "સ્માર્ટ ડિલિવરી", mr: "स्मार्ट डिलिव्हरी" },
  "Farmers Listed": { hi: "सूचीबद्ध किसान", gu: "નોંધાયેલા ખેડૂતો", mr: "नोंदणीकृत शेतकरी" },
  "Orders Delivered": { hi: "ऑर्डर डिलीवर किए गए", gu: "ડિલિવર થયેલ ઓર્ડર", mr: "वितरित ऑर्डर्स" },

  // Problem / Solution & Sections
  "Why HarvestLink": { hi: "हार्वेस्टलिंक क्यों", gu: "હાર્વેસ્ટલિંક શા માટે", mr: "हार्वेस्टलिंक का" },
  "A better connection between farms and markets.": { hi: "खेतों और बाज़ारों के बीच एक बेहतर संबंध।", gu: "ખેતરો અને બજારો વચ્ચે શ્રેષ્ઠ જોડાણ.", mr: "शेत आणि बाजारपेठ यांच्यातील उत्तम जोडणी." },
  "Consumers": { hi: "उपभोक्ता", gu: "ગ્રાહકો", mr: "ग्राहक" },
  "Bulk Buyers": { hi: "थोक खरीदार", gu: "જથ્થાબંધ ખરીદદારો", mr: "घाऊक खरेदीदार" },
  "FPOs & Collectives": { hi: "एफपीओ और समूह", gu: "એફપીઓ અને મંડળીઓ", mr: "एफपीओ आणि शेतकरी गट" },
  "How HarvestLink Works": { hi: "हार्वेस्टलिंक कैसे काम करता है", gu: "હાર્વેસ્ટલિંક કેવી રીતે કાર્ય કરે છે", mr: "हार्वेस्टलिंक कसे कार्य करते" },
  "Browse Fresh Marketplace": { hi: "ताज़ा मार्केटप्लेस ब्राउज़ करें", gu: "તાજું માર્કેટપ્લેસ બ્રાઉઝ કરો", mr: "ताजी बाजारपेठ ब्राउझ करा" },
  "AI-Powered Demand & Logistics": { hi: "एआई-संचालित मांग और लॉजिस्टिक्स", gu: "એઆઈ-સંચાલિત માંગ અને લોજિસ્ટિક્સ", mr: "एआय-संचालित मागणी आणि लॉजिस्टिक्स" },
  "Farmers & FPOs on HarvestLink": { hi: "हार्वेस्टलिंक पर किसान और एफपीओ", gu: "હાર્વેસ્ટલિંક પર ખેડૂતો અને એફપીઓ", mr: "हार्वेस्टलिंकवरील शेतकरी आणि एफपीओ" },
  "Verified Agricultural Network": { hi: "सत्यापित कृषि नेटवर्क", gu: "ચકાસાયેલ કૃષિ નેટવર્ક", mr: "सत्यापित कृषी नेटवर्क" },
  "Ready to reshape the farm-to-table journey?": { hi: "खेत से थाली तक के सफर को बदलने के लिए तैयार हैं?", gu: "ખેતરથી થાળી સુધીની સફર બદલવા તૈયાર છો?", mr: "शेतातून ताटापर्यंतचा प्रवास बदलण्यासाठी तयार आहात का?" },
  "Join thousands of farmers, consumers, and businesses building a fairer, fresher agricultural supply chain.": {
    hi: "हजारों किसानों, उपभोक्ताओं और व्यवसायों के साथ जुड़ें जो एक निष्पक्ष और ताज़ा कृषि आपूर्ति श्रृंखला का निर्माण कर रहे हैं।",
    gu: "હજારો ખેડૂતો, ગ્રાહકો અને વ્યવસાયો સાથે જોડાઓ જેઓ વધુ ન્યાયી, તાજી કૃષિ પુરવઠા શૃંખલા બનાવી રહ્યા છે.",
    mr: "हजारो शेतकरी, ग्राहक आणि व्यवसायांमध्ये सामील व्हा जे एक न्याय्य, ताजी कृषी पुरवठा साखळी तयार करत आहेत."
  },
  "Get Started Today": { hi: "आज ही शुरू करें", gu: "આજે જ શરૂ કરો", mr: "आजच सुरू करा" },
  "Browse Products": { hi: "उत्पाद देखें", gu: "પેદાશો જુઓ", mr: "उत्पादने पहा" },

  // Marketplace & Filters
  "The Marketplace": { hi: "मार्केटप्लेस", gu: "માર્કેટપ્લેસ", mr: "बाजारपेठ" },
  "Fresh & Direct": { hi: "ताज़ा और प्रत्यक्ष", gu: "તાજું અને સીધું", mr: "ताजे आणि थेट" },
  "Source directly from farmers and FPOs across India. No middlemen.": {
    hi: "पूरे भारत के किसानों और एफपीओ से सीधे प्राप्त करें। कोई बिचौलिया नहीं।",
    gu: "સમગ્ર ભારતના ખેડૂતો અને એફપીઓ પાસેથી સીધું મેળવો. કોઈ વચેટિયા નહીં.",
    mr: "भारतातील शेतकरी आणि FPO कडून थेट खरेदी करा. मध्यस्थ नाहीत."
  },
  "Search for produce, farmers, or locations...": { hi: "उपज, किसान या स्थान खोजें...", gu: "ઉપજ, ખેડૂત અથવા સ્થળ શોધો...", mr: "उत्पादने, शेतकरी किंवा ठिकाण शोधा..." },
  "Search crops, fruits, grains...": { hi: "फसलें, फल, अनाज खोजें...", gu: "પાક, ફળો, અનાજ શોધો...", mr: "पिके, फळे, धान्य शोधा..." },
  "All Categories": { hi: "सभी श्रेणियां", gu: "બધી શ્રેણીઓ", mr: "सर्व श्रेणी" },
  "All Produce": { hi: "सभी उपज", gu: "બધી પેદાશો", mr: "सर्व उत्पादने" },
  "Vegetables": { hi: "सब्जियां", gu: "શાકભાજી", mr: "भाज्या" },
  "Fruits": { hi: "फल", gu: "ફળો", mr: "फळे" },
  "Grains": { hi: "अनाज", gu: "અનાજ", mr: "धान्य" },
  "Spices": { hi: "मसाले", gu: "મસાલા", mr: "मसाले" },
  "Pulses": { hi: "दालें", gu: "કઠોળ", mr: "डाळी" },
  "Dairy": { hi: "डेयरी", gu: "ડેરી", mr: "डेअरी" },
  "Organic": { hi: "जैविक", gu: "ઓર્ગેનિક (જૈવિક)", mr: "સेंद्रिय" },
  "Natural": { hi: "प्राकृतिक", gu: "કુદરતી (પ્રાકૃતિક)", mr: "नैसर्गिक" },
  "Conventional": { hi: "पारंपरिक", gu: "પરંપરાગત", mr: "पारंपरिक" },
  "In Stock": { hi: "स्टॉक में है", gu: "સ્ટોકમાં છે", mr: "स्टॉकमध्ये उपलब्ध" },
  "Limited Stock": { hi: "सीमित स्टॉक", gu: "મર્યાદિત સ્ટોક", mr: "मर्यादित स्टॉक" },
  "+ Cart": { hi: "+ कार्ट", gu: "+ કાર્ટ", mr: "+ कार्ट" },
  "View": { hi: "देखें", gu: "જુઓ", mr: "पहा" },
  "Reset Filters": { hi: "फ़िल्टर रीसेट करें", gu: "ફિલ્ટર્સ રીસેટ કરો", mr: "फिल्टर रीसेट करा" },
  "Sort by: Default": { hi: "क्रम: डिफ़ॉल्ट", gu: "ક્રમ: ડિફૉલ્ટ", mr: "क्रमवारी: डीफॉल्ट" },
  "Price: Low to High": { hi: "कीमत: कम से अधिक", gu: "કિંમત: ઓછી થી વધુ", mr: "किंमत: कमी ते जास्त" },
  "Price: High to Low": { hi: "कीमत: अधिक से कम", gu: "કિંમત: વધુ થી ઓછી", mr: "किंमत: जास्त ते कमी" },

  // Products
  "Fresh Tomatoes": { hi: "ताज़ा टमाटर", gu: "તાજા ટામેટા", mr: "ताजे टोमॅटो" },
  "Alphonso Mango": { hi: "हापुस आम (अल्फांसो)", gu: "હાફૂસ કેરી (આલ્ફાન્સો)", mr: "हापूस आंबा" },
  "Wheat (Lokwan)": { hi: "गेहूं (लोकवन)", gu: "ઘઉં (લોકવાન)", mr: "गहू (लोकवन)" },
  "Turmeric Powder": { hi: "हल्दी पाउडर", gu: "હળદર પાવડર", mr: "हळद पावडर" },
  "Onion": { hi: "प्याज", gu: "ડુંગળી", mr: "कांदा" },
  "Potato": { hi: "आलू", gu: "બટાકા", mr: "बटाटा" },
  "Toor Dal": { hi: "तूर दाल", gu: "તુવેર દાળ", mr: "तूर डाळ" },
  "Fresh Milk": { hi: "ताज़ा दूध", gu: "તાજું દૂધ", mr: "ताजे दूध" },
  "Red Chilli": { hi: "लाल मिर्च", gu: "લાલ મરચું", mr: "लाल मिरची" },
  "Banana (Robusta)": { hi: "केला (रोबस्टा)", gu: "કેળા (રોબસ્ટા)", mr: "केळी (रोबस्टा)" },
  "Okra (Bhindi)": { hi: "भिंडी", gu: "ભીંડા", mr: "भेंडी" },
  "Brinjal": { hi: "बैंगन", gu: "રીંગણ", mr: "वांगी" },
  "Bajra (Pearl Millet)": { hi: "बाजरा", gu: "બાજરી", mr: "बाजरी" },
  "Spinach": { hi: "पालक", gu: "પાલક", mr: "पालक" },
  "Papaya": { hi: "पपीता", gu: "પપૈયું", mr: "पपई" },
  "Mustard Oil": { hi: "सरसों का तेल", gu: "રાઈનું તેલ", mr: "मोहरीचे तेल" },
  "Chana Dal": { hi: "चना दाल", gu: "ચણા દાળ", mr: "हरभरा डाळ" },
  "Sweet Corn": { hi: "स्वीट कॉर्न", gu: "સ્વીટ કોર્ન", mr: "स्वीट कॉर्न" },
  "Garlic": { hi: "लहसुन", gu: "લસણ", mr: "लसूण" },
  "Lemon": { hi: "नींबू", gu: "લીંબુ", mr: "लिंबू" },

  // Cart & Checkout
  "Your Cart": { hi: "आपकी कार्ट", gu: "તમારી કાર્ટ", mr: "तुमची कार्ट" },
  "Your cart is empty.": { hi: "आपकी कार्ट खाली है।", gu: "તમારી કાર્ટ ખાલી છે.", mr: "तुमची कार्ट रिकामी आहे." },
  "Discover fresh produce directly from farmers.": { hi: "किसानों से सीधे ताज़ी उपज खोजें।", gu: "ખેડૂતો પાસેથી સીધી તાજી ઉપજ શોધો.", mr: "शेतकऱ्यांकडून थेट ताजी उत्पादने शोधा." },
  "Add your first item to get started.": { hi: "शुरू करने के लिए अपना पहला आइटम जोड़ें।", gu: "શરૂ કરવા માટે તમારી પ્રથમ વસ્તુ ઉમેરો.", mr: "सुरू करण्यासाठी तुमची पहिली वस्तू जोडा." },
  "Shop Produce →": { hi: "उपज खरीदें →", gu: "તાજી ઉપજ ખરીદો →", mr: "उत्पादने खरेदी करा →" },
  "Order Summary": { hi: "ऑर्डर सारांश", gu: "ઓર્ડર સારાંશ", mr: "ऑर्डर सारांश" },
  "Subtotal": { hi: "उप-योग", gu: "સબટોટલ", mr: "उपएकूण" },
  "Delivery": { hi: "डिलीवरी", gu: "ડિલિવરી", mr: "डिलिव्हरी" },
  "Discount": { hi: "छूट", gu: "ડિસ્કાઉન્ટ", mr: "सवलत" },
  "Total": { hi: "कुल", gu: "કુલ", mr: "एकूण" },
  "Proceed to Checkout →": { hi: "चेकआउट के लिए आगे बढ़ें →", gu: "ચેકઆઉટ આગળ વધો →", mr: "चेकआउटकडे पुढे जा →" },
  "← Continue Shopping": { hi: "← खरीदारी जारी रखें", gu: "← ખરીદી ચાલુ રાખો", mr: "← खरेदी सुरू ठेवा" },
  "Remove": { hi: "हटाएं", gu: "દૂર કરો", mr: "काढून टाका" },
  "Save for Later": { hi: "बाद के लिए सहेजें", gu: "પછી માટે સાચવો", mr: "नंतरसाठी जतन करा" },
  "Free delivery on orders above ₹800": { hi: "₹800 से अधिक के ऑर्डर पर मुफ्त डिलीवरी", gu: "₹800 થી વધુના ઓર્ડર પર મફત ડિલિવરી", mr: "₹800 पेक्षा जास्तच्या ऑर्डरवर मोफत डिलिव्हरी" },
  "Your Farmers": { hi: "आपके किसान", gu: "તમારા ખેડૂતો", mr: "तुमचे शेतकरी" },

  // Dashboard
  "Farmer Dashboard": { hi: "किसान डैशबोर्ड", gu: "ખેડૂત ડેશબોર્ડ", mr: "शेतकरी डॅशबोर्ड" },
  "FPO Dashboard": { hi: "एफपीओ डैशबोर्ड", gu: "એફપીઓ ડેશબોર્ડ", mr: "एफपीओ डॅशबोर्ड" },
  "Logistics Hub": { hi: "लॉजिस्टिक्स हब", gu: "લોજિસ્ટિક્સ હબ", mr: "लॉजिस्टिक्स केंद्र" },
  "Overview": { hi: "अवलोकन", gu: "ઝાંખી", mr: "आढावा" },
  "Demand Insights": { hi: "मांग अंतर्दृष्टि", gu: "માંગ વિશ્લેષણ", mr: "मागणी अंतर्दृष्टी" },
  "Logistics": { hi: "लॉजिस्टिक्स", gu: "લોજિસ્ટિક્સ", mr: "लॉजिस्टिक्स" },
  "Total Revenue": { hi: "कुल राजस्व", gu: "કુલ આવક", mr: "एकूण महसूल" },
  "Active Orders": { hi: "सक्रिय ऑर्डर", gu: "સક્રિય ઓર્ડર", mr: "सक्रिय ऑर्डर्स" },
  "Crops Listed": { hi: "सूचीबद्ध फसलें", gu: "નોંધાયેલ પાક", mr: "नोंदणीकृत पिके" },
  "Recent Orders": { hi: "हाल के ऑर्डर", gu: "તાજેતરના ઓર્ડર", mr: "नुकत्याच झालेल्या ऑर्डर्स" },
  "Add Product": { hi: "उत्पाद जोड़ें", gu: "ઉત્પાદન ઉમેરો", mr: "उत्पादन जोडा" },
  "Delivered": { hi: "डिलीवर किया गया", gu: "ડિલિવર થયેલ", mr: "वितरित" },
  "In Transit": { hi: "रास्ते में है", gu: "રસ્તામાં છે", mr: "मार्गावर" },
  "Pending": { hi: "लंबित", gu: "બાકી", mr: "प्रलंबित" },

  // Common UI & Authentication
  "Log In to HarvestLink": { hi: "हार्वेस्टलिंक में लॉग इन करें", gu: "હાર્વેસ્ટલિંકમાં લોગિન કરો", mr: "हार्वेस्टलिंकमध्ये लॉगिन करा" },
  "Join HarvestLink": { hi: "हार्वेस्टलिंक से जुड़ें", gu: "હાર્વેસ્ટલિંકમાં જોડાઓ", mr: "हार्वेस्टलिंकमध्ये सामील व्हा" },
  "Select Your Role": { hi: "अपनी भूमिका चुनें", gu: "તમારી ભૂમિકા પસંદ કરો", mr: "तुमची भूमिका निवडा" },
  "Email Address": { hi: "ईमेल पता", gu: "ઈમેલ સરનામું", mr: "ईमेल पत्ता" },
  "Password": { hi: "पासवर्ड", gu: "પાસવર્ડ", mr: "पासवर्ड" },
  "Sign In": { hi: "साइन इन करें", gu: "સાઇન ઇન કરો", mr: "साइन इन करा" },
  "Create Account": { hi: "खाता बनाएं", gu: "ખાતું બનાવો", mr: "खाते तयार करा" }
};

function getCurrentLanguage() {
  const stored = localStorage.getItem(HL_LANG);
  if (stored) return stored;
  const match = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  if (match && match[1]) {
    const code = match[1].toLowerCase();
    localStorage.setItem(HL_LANG, code);
    return code;
  }
  return 'en';
}

function getTranslation(text, code) {
  if (!text || code === 'en') return null;
  const trimmed = text.trim();
  if (HL_TRANSLATIONS[trimmed] && HL_TRANSLATIONS[trimmed][code]) {
    return HL_TRANSLATIONS[trimmed][code];
  }
  const lower = trimmed.toLowerCase();
  for (const [key, val] of Object.entries(HL_TRANSLATIONS)) {
    if (key.toLowerCase() === lower && val[code]) {
      return val[code];
    }
  }
  return null;
}

let isTranslating = false;
function applyNativeTranslation(code) {
  if (isTranslating) return;
  isTranslating = true;
  try {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.tagName.toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'noscript' || p.closest('.lang-switcher-wrap') || p.classList.contains('skiptranslate')) {
            return NodeFilter.FILTER_REJECT;
          }
          const t = node.textContent.trim();
          if (!t || t.length < 2) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    nodes.forEach(node => {
      const current = node.textContent;
      const trimmed = current.trim();
      if (!node._hlOrig) {
        node._hlOrig = trimmed;
      }
      const orig = node._hlOrig;
      if (code === 'en') {
        if (trimmed !== orig) {
          const lead = current.match(/^\s*/)[0];
          const trail = current.match(/\s*$/)[0];
          node.textContent = lead + orig + trail;
        }
      } else {
        const trans = getTranslation(orig, code);
        if (trans) {
          const lead = current.match(/^\s*/)[0];
          const trail = current.match(/\s*$/)[0];
          node.textContent = lead + trans + trail;
        }
      }
    });

    // Placeholders
    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
      if (!input._hlOrigPh) {
        input._hlOrigPh = input.getAttribute('placeholder');
      }
      if (code === 'en') {
        input.setAttribute('placeholder', input._hlOrigPh);
      } else {
        const trans = getTranslation(input._hlOrigPh.trim(), code);
        if (trans) input.setAttribute('placeholder', trans);
      }
    });

    document.documentElement.lang = code;
  } catch (err) {
    console.error('Translation error:', err);
  } finally {
    isTranslating = false;
  }
}

function triggerGoogleTranslateCombo(code) {
  try {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      let opt = Array.from(select.options).find(o => o.value.toLowerCase() === code.toLowerCase());
      if (!opt && code === 'en') {
        opt = Array.from(select.options).find(o => o.value === 'en' || o.value === '' || o.text.toLowerCase().includes('english'));
      }
      if (opt && select.value !== opt.value) {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
  } catch(e) {}
  return false;
}

function initGoogleTranslate() {
  if (window.googleTranslateElementInitDone) return;
  window.googleTranslateElementInitDone = true;

  let gtDiv = document.getElementById('google_translate_element');
  if (!gtDiv) {
    gtDiv = document.createElement('div');
    gtDiv.id = 'google_translate_element';
    gtDiv.style.cssText = 'display:none!important;visibility:hidden!important;height:0!important;width:0!important;position:absolute!important;top:-9999px!important;left:-9999px!important;pointer-events:none!important;';
    document.body.appendChild(gtDiv);
  }

  window.googleTranslateElementInit = function() {
    try {
      new window.google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi,gu,mr,pa,bn,ta,te',
        autoDisplay: false
      }, 'google_translate_element');

      const current = getCurrentLanguage();
      if (current && current !== 'en') {
        setTimeout(() => triggerGoogleTranslateCombo(current), 400);
      }
    } catch (e) {
      console.warn('Google Translate initialization:', e);
    }
  };

  // Prevent Google Translate from altering body top or position
  const resetBodyPosition = () => {
    if (document.body.style.top && document.body.style.top !== '0px') {
      document.body.style.top = '0px';
    }
    if (document.body.style.position && document.body.style.position !== 'static') {
      document.body.style.position = 'static';
    }
  };
  const bodyObserver = new MutationObserver(resetBodyPosition);
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

  if (location.protocol === 'http:' || location.protocol === 'https:') {
    const s = document.createElement('script');
    s.id = 'google-translate-script';
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }
}

function getLanguageSwitcherHtml() {
  const currentLangCode = getCurrentLanguage();
  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  const optionsHtml = SUPPORTED_LANGUAGES.map(l => {
    const isActive = l.code === currentLangCode ? 'active' : '';
    return `
      <button type="button" class="lang-option ${isActive}" data-lang="${l.code}" onclick="changeLanguage('${l.code}')">
        <span class="lang-opt-flag">${l.flag}</span>
        <span class="lang-opt-text">
          <span class="lang-opt-native">${l.native}</span>
          <span class="lang-opt-name">${l.name}</span>
        </span>
        ${isActive ? '<span class="lang-check">✓</span>' : ''}
      </button>
    `;
  }).join('');

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
          <span>🌐 Choose Language</span>
          <span class="lang-count">${SUPPORTED_LANGUAGES.length} Languages</span>
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
}

function changeLanguage(langCode, showFeedback = true) {
  if (!langCode) return;
  const target = langCode.trim();

  // 1. If switching back to default English, clear all Google Translate cookies and cleanly reload
  if (target === 'en') {
    localStorage.setItem(HL_LANG, 'en');

    // Thoroughly remove googtrans cookies across all path/domain combinations
    const host = window.location.hostname;
    const domains = ['', host, `.${host}`];
    if (host.includes('.')) {
      domains.push(`.${host.split('.').slice(-2).join('.')}`);
    }
    const paths = ['/', window.location.pathname, ''];

    domains.forEach(d => {
      paths.forEach(p => {
        const domPart = d ? `; domain=${d}` : '';
        const pathPart = p ? `; path=${p}` : '';
        document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC${pathPart}${domPart}`;
        document.cookie = `googtrans=; max-age=0${pathPart}${domPart}`;
      });
    });

    try {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.selectedIndex = 0;
        select.value = '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } catch (e) {}

    // Reload cleanly restores original DOM without Google Translate text mutations
    window.location.reload();
    return;
  }

  // 2. Non-English target language: save preference and set googtrans cookie
  localStorage.setItem(HL_LANG, target);
  const host = window.location.hostname;
  document.cookie = `googtrans=/en/${target}; path=/;`;
  if (host) {
    document.cookie = `googtrans=/en/${target}; domain=${host}; path=/;`;
    document.cookie = `googtrans=/en/${target}; domain=.${host}; path=/;`;
    if (host.includes('.')) {
      const rootDomain = host.split('.').slice(-2).join('.');
      document.cookie = `googtrans=/en/${target}; domain=.${rootDomain}; path=/;`;
    }
  }

  // 3. Trigger .goog-te-combo if present in DOM, retry if initializing
  if (!triggerGoogleTranslateCombo(target)) {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerGoogleTranslateCombo(target) || attempts >= 25) {
        clearInterval(interval);
      }
    }, 150);
  }

  // 4. Instant UI dictionary translation for headings & components
  applyNativeTranslation(target);

  // 5. Update top header navbar language indicator
  buildNavbarRight();

  // 6. User feedback toast
  if (showFeedback) {
    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === target) || { native: target };
    const toastMap = {
      en: 'Language set to English',
      hi: 'भाषा बदलकर हिन्दी कर दी गई',
      gu: 'ભાષા બદલીને ગુજરાતી કરવામાં આવી',
      mr: 'भाषा मराठी मध्ये बदलली',
      pa: 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲੀ ਗਈ',
      bn: 'ভাষা বাংলায় পরিবর্তিত হয়েছে',
      ta: 'மொழி தமிழுக்கு மாற்றப்பட்டது',
      te: 'భాష తెలుగులోకి మార్చబడింది'
    };
    showToast(toastMap[target] || `Language set to ${langObj.native}`, 'success');
  }
}

const setAppLanguage = changeLanguage;
window.changeLanguage = changeLanguage;
window.setAppLanguage = changeLanguage;
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
          <button type="button" class="btn-outline-sm" style="padding: 4px 8px; font-size: 11.5px; border-radius: 4px; ${l.code === cur ? 'background: var(--green); color: #fff; border-color: var(--green);' : ''}" onclick="changeLanguage('${l.code}')">
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
  if (savedLang && savedLang !== 'en') {
    applyNativeTranslation(savedLang);
  }
  initGoogleTranslate();

  // Dynamic observer to auto-translate any newly added product cards or items
  let mutTimer = null;
  const obsLang = new MutationObserver(() => {
    const cur = getCurrentLanguage();
    if (cur === 'en') return;
    clearTimeout(mutTimer);
    mutTimer = setTimeout(() => {
      applyNativeTranslation(cur);
    }, 60);
  });
  obsLang.observe(document.body, { childList: true, subtree: true });

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
