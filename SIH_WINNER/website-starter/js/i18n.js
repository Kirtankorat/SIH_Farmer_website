/* ==============================================================================
   HARVESTLINK — js/i18n.js
   Pure Dictionary-Based Translation Engine for English, Gujarati, and Hindi
   Zero Google Translate popups, frames, or DOM shifts
   ============================================================================== */

(function () {
  'use strict';

  const HL_LANG_KEY = 'hl_lang';

  // Strictly 3 supported languages
  const HL_LANGUAGES = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' }
  ];

  // Comprehensive translation dictionary for en, gu, hi
  const DICTIONARY = {
    // Navigation
    "Home": { en: "Home", gu: "હોમ", hi: "होम" },
    "Marketplace": { en: "Marketplace", gu: "માર્કેટપ્લેસ", hi: "मार्केटप्लेस" },
    "Farmers": { en: "Farmers", gu: "ખેડૂતો", hi: "किसान" },
    "Businesses": { en: "Businesses", gu: "વેપાર", hi: "व्यापार" },
    "How It Works": { en: "How It Works", gu: "તે કેવી રીતે કાર્ય કરે છે", hi: "यह कैसे काम करता है" },
    "AI & Logistics": { en: "AI & Logistics", gu: "એઆઈ અને લોજિસ્ટિક્સ", hi: "एआई और लॉजिस्टिक्स" },
    "About": { en: "About", gu: "અમારા વિશે", hi: "हमारे बारे में" },
    "FAQ": { en: "FAQ", gu: "વારંવાર પૂછાતા પ્રશ્નો", hi: "सामान्य प्रश्न" },
    "Login": { en: "Login", gu: "લોગિન", hi: "लॉग इन" },
    "Join Free": { en: "Join Free", gu: "મફત જોડાઓ", hi: "निःशुल्क जुड़ें" },
    "Shop Produce": { en: "Shop Produce", gu: "તાજી ઉપજ ખરીદો", hi: "उपज खरीदें" },
    "Logout": { en: "Logout", gu: "લૉગઆઉટ", hi: "लॉगआउट" },
    "Dashboard": { en: "Dashboard", gu: "ડેશબોર્ડ", hi: "डैशबोर्ड" },
    "My Orders": { en: "My Orders", gu: "મારા ઓર્ડર", hi: "मेरे ऑर्डर" },
    "Cart": { en: "Cart", gu: "કાર્ટ", hi: "कार्ट" },
    "Search": { en: "Search", gu: "શોધો", hi: "खोजें" },
    "Menu": { en: "Menu", gu: "મેનુ", hi: "मेनू" },
    "Close": { en: "Close", gu: "બંધ કરો", hi: "बंद करें" },

    // Core Hero & Headings
    "Agricultural Marketplace · India": {
      en: "Agricultural Marketplace · India",
      gu: "કૃષિ માર્કેટપ્લેસ · ભારત",
      hi: "कृषि मार्केटप्लेस · भारत"
    },
    "Fresh produce.": { en: "Fresh produce.", gu: "તાજી પેદાશ.", hi: "ताज़ी उपज।" },
    "Direct from farmers.": { en: "Direct from farmers.", gu: "સીધા ખેડૂતો પાસેથી.", hi: "सीधे किसानों से।" },
    "Buy fresh produce directly from verified farmers and FPOs, while smarter demand planning and logistics help move food efficiently from farm to market.": {
      en: "Buy fresh produce directly from verified farmers and FPOs, while smarter demand planning and logistics help move food efficiently from farm to market.",
      gu: "ચકાસાયેલ ખેડૂતો અને એફપીઓ પાસેથી સીધી તાજી પેદાશો ખરીદો, જ્યારે સ્માર્ટ માંગ આયોજન અને લોજિસ્ટિક્સ ખેતરથી બજાર સુધી કાર્યક્ષમ રીતે માલ પહોંચાડે છે.",
      hi: "सत्यापित किसानों और एफपीओ से सीधे ताज़ा उत्पाद खरीदें, जबकि स्मार्ट मांग योजना और लॉजिस्टिक्स खेत से बाज़ार तक भोजन को कुशलतापूर्वक पहुँचाते हैं।"
    },
    "✓ Direct from Farmers": { en: "✓ Direct from Farmers", gu: "✓ સીધા ખેડૂતો પાસેથી", hi: "✓ सीधे किसानों से" },
    "✓ Fairer Prices": { en: "✓ Fairer Prices", gu: "✓ વાજબી ભાવ", hi: "✓ उचित मूल्य" },
    "✓ Smarter Delivery": { en: "✓ Smarter Delivery", gu: "✓ સ્માર્ટ ડિલિવરી", hi: "✓ स्मार्ट डिलीवरी" },
    "Get Started Today": { en: "Get Started Today", gu: "આજે જ શરૂ કરો", hi: "आज ही शुरू करें" },
    "Browse Products": { en: "Browse Products", gu: "પેદાશો જુઓ", hi: "उत्पाद देखें" },
    "The Marketplace": { en: "The Marketplace", gu: "માર્કેટપ્લેસ", hi: "मार्केटप्लेस" },
    "Fresh & Direct": { en: "Fresh & Direct", gu: "તાજું અને સીધું", hi: "ताज़ा और प्रत्यक्ष" },
    "Source directly from farmers and FPOs across India. No middlemen.": {
      en: "Source directly from farmers and FPOs across India. No middlemen.",
      gu: "સમગ્ર ભારતના ખેડૂતો અને એફપીઓ પાસેથી સીધું મેળવો. કોઈ વચેટિયા નહીં.",
      hi: "पूरे भारत के किसानों और एफपीओ से सीधे प्राप्त करें। कोई बिचौलिया नहीं।"
    },

    // Categories & Filters
    "All Categories": { en: "All Categories", gu: "બધી શ્રેણીઓ", hi: "सभी श्रेणियां" },
    "Vegetables": { en: "Vegetables", gu: "શાકભાજી", hi: "सब्जियां" },
    "Fruits": { en: "Fruits", gu: "ફળો", hi: "फल" },
    "Grains": { en: "Grains", gu: "અનાજ", hi: "अनाज" },
    "Grains & Cereals": { en: "Grains & Cereals", gu: "અનાજ અને ધાન્ય", hi: "अनाज और धान्य" },
    "Pulses": { en: "Pulses", gu: "કઠોળ", hi: "दालें" },
    "Pulses & Dals": { en: "Pulses & Dals", gu: "કઠોળ અને દાળ", hi: "दालें और दलहन" },
    "Spices": { en: "Spices", gu: "મસાલા", hi: "मसाले" },
    "Dairy": { en: "Dairy", gu: "ડેરી", hi: "डेयरी" },
    "Cotton": { en: "Cotton", gu: "કપાસ", hi: "कपास" },
    "Farming Practice": { en: "Farming Practice", gu: "ખેતી પદ્ધતિ", hi: "खेती पद्धति" },
    "Organic": { en: "Organic", gu: "ઓર્ગેનિક (જૈવિક)", hi: "जैविक" },
    "Natural": { en: "Natural", gu: "કુદરતી (પ્રાકૃતિક)", hi: "प्राकृतिक" },
    "Conventional": { en: "Conventional", gu: "પરંપરાગત", hi: "पारंपरिक" },
    "In Stock": { en: "In Stock", gu: "સ્ટોકમાં છે", hi: "स्टॉक में है" },
    "Limited Stock": { en: "Limited Stock", gu: "મર્યાદિત સ્ટોક", hi: "सीमित स्टॉक" },
    "Out of Stock": { en: "Out of Stock", gu: "સ્ટોક ખલાસ", hi: "स्टॉक समाप्त" },
    "Seller Type": { en: "Seller Type", gu: "વિક્રેતા પ્રકાર", hi: "विक्रेता प्रकार" },
    "Individual Farmer": { en: "Individual Farmer", gu: "વ્યક્તિગત ખેડૂત", hi: "व्यक्तिगत किसान" },
    "Verified FPO": { en: "Verified FPO", gu: "ચકાસાયેલ એફપીઓ", hi: "सत्यापित एफपीओ" },
    "Price Range": { en: "Price Range", gu: "કિંમત શ્રેણી", hi: "कीमत सीमा" },
    "Sort by:": { en: "Sort by:", gu: "ક્રમબદ્ધ કરો:", hi: "क्रमबद्ध करें:" },
    "Recommended": { en: "Recommended", gu: "ભલામણ કરેલ", hi: "अनुशंसित" },
    "Price: Low to High": { en: "Price: Low to High", gu: "કિંમત: ઓછી થી વધુ", hi: "कीमत: कम से अधिक" },
    "Price: High to Low": { en: "Price: High to Low", gu: "કિંમત: વધુ થી ઓછી", hi: "कीमत: अधिक से कम" },
    "Highest Rated": { en: "Highest Rated", gu: "સૌથી વધુ રેટિંગ", hi: "उच्चतम रेटेड" },
    "Reset Filters": { en: "Reset Filters", gu: "ફિલ્ટર્સ રીસેટ કરો", hi: "फ़िल्टर रीसेट करें" },
    "Clear Filters": { en: "Clear Filters", gu: "ફિલ્ટર્સ સાફ કરો", hi: "फ़िल्टर साफ़ करें" },
    "+ Cart": { en: "+ Cart", gu: "+ કાર્ટ", hi: "+ कार्ट" },
    "Add to Cart": { en: "Add to Cart", gu: "કાર્ટમાં ઉમેરો", hi: "कार्ट में जोड़ें" },
    "View": { en: "View", gu: "જુઓ", hi: "देखें" },
    "Buy Now": { en: "Buy Now", gu: "હમણાં ખરીદો", hi: "अभी खरीदें" },
    "Buy in Bulk": { en: "Buy in Bulk", gu: "જથ્થાબંધ ખરીદો", hi: "थोक में खरीदें" },

    // Cart & Checkout
    "Your Cart": { en: "Your Cart", gu: "તમારી કાર્ટ", hi: "आपकी कार्ट" },
    "Your cart is empty.": { en: "Your cart is empty.", gu: "તમારી કાર્ટ ખાલી છે.", hi: "आपकी कार्ट खाली है।" },
    "Discover fresh produce directly from farmers.<br>Add your first item to get started.": {
      en: "Discover fresh produce directly from farmers.<br>Add your first item to get started.",
      gu: "ખેડૂતો પાસેથી સીધી તાજી પેદાશો શોધો.<br>શરૂ કરવા માટે તમારી પ્રથમ વસ્તુ ઉમેરો.",
      hi: "किसानों से सीधे ताज़ा उत्पाद खोजें।<br>शुरू करने के लिए अपना पहला आइटम जोड़ें।"
    },
    "Order Summary": { en: "Order Summary", gu: "ઓર્ડર સારાંશ", hi: "ऑर्डर सारांश" },
    "Subtotal": { en: "Subtotal", gu: "પેટાસરવાળો", hi: "उप-योग" },
    "Delivery": { en: "Delivery", gu: "ડિલિવરી", hi: "डिलीवरी" },
    "Discount": { en: "Discount", gu: "ડિસ્કાઉન્ટ", hi: "छूट" },
    "Total": { en: "Total", gu: "કુલ રકમ", hi: "कुल योग" },
    "Proceed to Checkout →": { en: "Proceed to Checkout →", gu: "ચેકઆઉટ આગળ વધો →", hi: "चेकआउट के लिए आगे बढ़ें →" },
    "Placing Order...": { en: "Placing Order...", gu: "ઓર્ડર મૂકી રહ્યા છીએ...", hi: "ऑर्डर दिया जा रहा है..." },
    "Continue Shopping": { en: "Continue Shopping", gu: "ખરીદી ચાલુ રાખો", hi: "खरीदारी जारी रखें" },
    "Remove": { en: "Remove", gu: "દૂર કરો", hi: "हटाएं" },

    // Orders & Tracking
    "Order Tracking": { en: "Order Tracking", gu: "ઓર્ડર ટ્રેકિંગ", hi: "ऑर्डर ट्रैकिंग" },
    "Delivery Status": { en: "Delivery Status", gu: "ડિલિવરી સ્થિતિ", hi: "डिलीवरी स्थिति" },
    "Order Placed": { en: "Order Placed", gu: "ઓર્ડર સફળ થયો", hi: "ऑर्डर दिया गया" },
    "Pending": { en: "Pending", gu: "બાકી", hi: "लंबित" },
    "Confirmed": { en: "Confirmed", gu: "કન્ફર્મ થયેલ", hi: "पुष्ट" },
    "Packed": { en: "Packed", gu: "પેક થયેલ", hi: "पैक किया गया" },
    "In Transit": { en: "In Transit", gu: "રસ્તામાં છે", hi: "मार्ग में" },
    "Delivered": { en: "Delivered", gu: "ડિલિવર થયેલ", hi: "वितरित" },
    "Cancelled": { en: "Cancelled", gu: "રદ થયેલ", hi: "रद्द" },

    // Roles
    "farmer": { en: "Farmer", gu: "ખેડૂત", hi: "किसान" },
    "fpo": { en: "FPO (Farmer Producer Org)", gu: "એફપીઓ (ખેડૂત સંગઠન)", hi: "एफपीओ (किसान संगठन)" },
    "cooperative": { en: "Cooperative", gu: "સહકારી મંડળી", hi: "सहकारी समिति" },
    "agri_entrepreneur": { en: "Agri Entrepreneur", gu: "કૃષિ ઉદ્યોગસાહસિક", hi: "कृषि उद्यमी" },
    "individual_buyer": { en: "Individual Buyer", gu: "વ્યક્તિગત ખરીદદાર", hi: "व्यक्तिगत खरीदार" },
    "bulk_buyer": { en: "Bulk Buyer", gu: "જથ્થાબંધ ખરીદદાર", hi: "थोक खरीदार" },

    // Auth & Forms
    "Welcome back.": { en: "Welcome back.", gu: "સ્વાગત છે.", hi: "वापसी पर स्वागत है।" },
    "Connect with farmers, buyers, and fresh produce.": {
      en: "Connect with farmers, buyers, and fresh produce.",
      gu: "ખેડૂતો, ખરીદદારો અને તાજી પેદાશો સાથે જોડાઓ.",
      hi: "किसानों, खरीदारों और ताज़ा उपज से जुड़ें।"
    },
    "Email / Phone Number": { en: "Email / Phone Number", gu: "ઇમેઇલ / ફોન નંબર", hi: "ईमेल / फ़ोन नंबर" },
    "Password": { en: "Password", gu: "પાસવર્ડ", hi: "पासवर्ड" },
    "Sign In →": { en: "Sign In →", gu: "સાઇન ઇન કરો →", hi: "साइन इन करें →" },
    "Signing in...": { en: "Signing in...", gu: "સાઇન ઇન થઈ રહ્યું છે...", hi: "साइन इन हो रहा है..." },
    "Don't have an account?": { en: "Don't have an account?", gu: "ખાતું નથી?", hi: "खाता नहीं है?" },
    "Join HarvestLink": { en: "Join HarvestLink", gu: "હાર્વેસ્ટલિંક સાથે જોડાઓ", hi: "हार्वेस्टलिंक से जुड़ें" },
    "Create Account": { en: "Create Account", gu: "ખાતું બનાવો", hi: "खाता बनाएं" },
    "Creating account...": { en: "Creating account...", gu: "ખાતું બની રહ્યું છે...", hi: "खाता बनाया जा रहा है..." },
    "Full Name": { en: "Full Name", gu: "પૂરું નામ", hi: "पूरा नाम" },
    "Phone Number": { en: "Phone Number", gu: "ફોન નંબર", hi: "फ़ोन नंबर" },
    "Select Role": { en: "Select Role", gu: "ભૂમિકા પસંદ કરો", hi: "भूमिका चुनें" },
    "Farm Name": { en: "Farm Name", gu: "ખેતરનું નામ", hi: "खेत का नाम" },
    "Village / Town": { en: "Village / Town", gu: "ગામ / શહેર", hi: "गाँव / शहर" },
    "State": { en: "State", gu: "રાજ્ય", hi: "राज्य" },

    // Notifications & Errors
    "Login successful!": { en: "Login successful!", gu: "લોગિન સફળ થયું!", hi: "लॉगिन सफल रहा!" },
    "Login failed. Please check your credentials.": {
      en: "Login failed. Please check your credentials.",
      gu: "લોગિન નિષ્ફળ. કૃપા કરીને વિગતો ચકાસો.",
      hi: "लॉगिन विफल। कृपया अपने क्रेडेंशियल जांचें।"
    },
    "Account created successfully!": { en: "Account created successfully!", gu: "ખાતું સફળતાપૂર્વક બન્યું!", hi: "खाता सफलतापूर्वक बन गया!" },
    "Please check your email to verify your account.": {
      en: "Please check your email to verify your account.",
      gu: "તમારું ખાતું ચકાસવા માટે ઇમેઇલ તપાસો.",
      hi: "कृपया अपना खाता सत्यापित करने के लिए ईमेल जांचें।"
    },
    "Added to cart": { en: "Added to cart", gu: "કાર્ટમાં ઉમેર્યું", hi: "कार्ट में जोड़ा गया" },
    "Removed from cart": { en: "Removed from cart", gu: "કાર્ટમાંથી દૂર કર્યું", hi: "कार्ट से हटा दिया गया" },
    "Order placed successfully!": { en: "Order placed successfully!", gu: "ઓર્ડર સફળતાપૂર્વક મૂકાયો!", hi: "ऑर्डर सफलतापूर्वक दिया गया!" },
    "Please login to proceed.": { en: "Please login to proceed.", gu: "કૃપા કરીને આગળ વધવા માટે લોગિન કરો.", hi: "कृपया आगे बढ़ने के लिए लॉग इन करें।" },
    "Product is currently out of stock.": {
      en: "Product is currently out of stock.",
      gu: "ઉત્પાદન હાલમાં સ્ટોકમાં નથી.",
      hi: "उत्पाद वर्तमान में स्टॉक में नहीं है।"
    },
    "Insufficient stock available.": {
      en: "Insufficient stock available.",
      gu: "પર્યાપ્ત સ્ટોક ઉપલબ્ધ નથી.",
      hi: "पर्याप्त स्टॉक उपलब्ध नहीं है।"
    },
    "Network error. Please try again.": {
      en: "Network error. Please try again.",
      gu: "નેટવર્ક ભૂલ. કૃપા કરીને ફરી પ્રયાસ કરો.",
      hi: "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।"
    },
    "Logged out successfully.": { en: "Logged out successfully.", gu: "સફળતાપૂર્વક લૉગઆઉટ થયા.", hi: "सफलतापूर्वक लॉगआउट हुए।" },

    // Products Seed Translations
    "Fresh Tomatoes": { en: "Fresh Tomatoes", gu: "તાજા ટામેટાં", hi: "ताज़ा टमाटर" },
    "Alphonso Mango (Gir Kesar)": { en: "Alphonso Mango (Gir Kesar)", gu: "ગીર કેસર કેરી", hi: "गीर केसर आम" },
    "Wheat (Lokwan Premium)": { en: "Wheat (Lokwan Premium)", gu: "ઘઉં (લોકવાન પ્રીમિયમ)", hi: "गेहूं (लोकवन प्रीमियम)" },
    "Wheat (Lokwan)": { en: "Wheat (Lokwan)", gu: "ઘઉં (લોકવાન)", hi: "गेहूं (लोकवन)" },
    "Organic Turmeric Powder (Salem/Lakadong)": { en: "Organic Turmeric Powder (Salem/Lakadong)", gu: "ઓર્ગેનિક હળદર પાવડર", hi: "जैविक हल्दी पाउडर" },
    "Turmeric Powder": { en: "Turmeric Powder", gu: "હળદર પાવડર", hi: "हल्दी पाउडर" },
    "Red Onion (Mahuva Special)": { en: "Red Onion (Mahuva Special)", gu: "લાલ ડુંગળી (મહુવા)", hi: "लाल प्याज (महुआ स्पेशल)" },
    "Onion": { en: "Onion", gu: "ડુંગળી", hi: "प्याज" },
    "Potato (Deesa Kufri Pukhraj)": { en: "Potato (Deesa Kufri Pukhraj)", gu: "બટાટા (ડીસા કુફરી)", hi: "आलू (डीसा कुफरी)" },
    "Potato": { en: "Potato", gu: "બટાટા", hi: "आलू" },
    "Toor Dal (Gujarat Desi Unpolished)": { en: "Toor Dal (Gujarat Desi Unpolished)", gu: "તુવેર દાળ (દેશી)", hi: "तूर दाल (गुजरात देसी)" },
    "Toor Dal": { en: "Toor Dal", gu: "તુવેર દાળ", hi: "तूर दाल" },
    "Fresh A2 Gir Cow Milk": { en: "Fresh A2 Gir Cow Milk", gu: "તાજું A2 ગીર ગાયનું દૂધ", hi: "ताज़ा A2 गीर गाय का दूध" },
    "Fresh Milk": { en: "Fresh Milk", gu: "તાજું દૂધ", hi: "ताज़ा दूध" },
    "Red Chilli (Guntur Teja)": { en: "Red Chilli (Guntur Teja)", gu: "લાલ મરચું (ગુંટુર)", hi: "लाल मिर्च (गुंटूर तेजा)" },
    "Red Chilli": { en: "Red Chilli", gu: "લાલ મરચું", hi: "लाल मिर्च" },
    "Okra (Fresh Bhindi)": { en: "Okra (Fresh Bhindi)", gu: "તાજા ભીંડા", hi: "ताज़ा भिंडी" },
    "Okra (Bhindi)": { en: "Okra (Bhindi)", gu: "ભીંડા", hi: "भिंडी" },
    "Purple Brinjal (Ravaiya Ringan)": { en: "Purple Brinjal (Ravaiya Ringan)", gu: "રવાઈયા રીંગણ", hi: "बैंगन" },
    "Brinjal": { en: "Brinjal", gu: "રીંગણ", hi: "बैंगन" },
    "Pearl Millet (Desi Bajra)": { en: "Pearl Millet (Desi Bajra)", gu: "દેશી બાજરી", hi: "देसी बाजरा" },
    "Bajra (Pearl Millet)": { en: "Bajra (Pearl Millet)", gu: "બાજરી", hi: "बाजरा" },
    "Cold-Pressed Mustard Oil": { en: "Cold-Pressed Mustard Oil", gu: "કાચી ઘાણી સરસવ તેલ", hi: "कच्ची घानी सरसों का तेल" },
    "Mustard Oil": { en: "Mustard Oil", gu: "રાઈ/સરસવનું તેલ", hi: "सरसों का तेल" },
    "Chana Dal (Desi Chickpea)": { en: "Chana Dal (Desi Chickpea)", gu: "ચણા દાળ", hi: "चना दाल" },
    "Chana Dal": { en: "Chana Dal", gu: "ચણા દાળ", hi: "चना दाल" },
    "Garlic (White Saurashtra Bulbs)": { en: "Garlic (White Saurashtra Bulbs)", gu: "સફેદ લસણ", hi: "सफ़ेद लहसुन" },
    "Garlic": { en: "Garlic", gu: "લસણ", hi: "लहसुन" },
    "Kagzi Lemon": { en: "Kagzi Lemon", gu: "કાગદી લીંબુ", hi: "कागज़ी नींबू" },
    "Lemon": { en: "Lemon", gu: "લીંબુ", hi: "नींबू" }
  };

  // Placeholders dictionary
  const PH_DICTIONARY = {
    "Search crops, fruits, grains...": {
      en: "Search crops, fruits, grains...",
      gu: "પાક, ફળો, અનાજ શોધો...",
      hi: "फसलें, फल, अनाज खोजें..."
    },
    "Search for produce, farmers, or locations...": {
      en: "Search for produce, farmers, or locations...",
      gu: "ઉપજ, ખેડૂત અથવા સ્થળ શોધો...",
      hi: "उपज, किसान या स्थान खोजें..."
    },
    "yourname@email.com or +91 00000 00000": {
      en: "yourname@email.com or +91 00000 00000",
      gu: "ઇમેઇલ અથવા ફોન નંબર",
      hi: "ईमेल या फ़ोन नंबर"
    },
    "Your password": {
      en: "Your password",
      gu: "તમારો પાસવર્ડ",
      hi: "आपका पासवर्ड"
    }
  };

  function getCurrentLanguage() {
    const saved = localStorage.getItem(HL_LANG_KEY);
    if (saved && ['en', 'gu', 'hi'].includes(saved.toLowerCase())) {
      return saved.toLowerCase();
    }
    return 'en';
  }

  function t(key, fallback = null) {
    if (!key) return '';
    const lang = getCurrentLanguage();
    const cleanKey = key.trim();
    if (DICTIONARY[cleanKey] && DICTIONARY[cleanKey][lang]) {
      return DICTIONARY[cleanKey][lang];
    }
    return fallback !== null ? fallback : key;
  }

  function tPh(key) {
    if (!key) return '';
    const lang = getCurrentLanguage();
    const cleanKey = key.trim();
    if (PH_DICTIONARY[cleanKey] && PH_DICTIONARY[cleanKey][lang]) {
      return PH_DICTIONARY[cleanKey][lang];
    }
    if (DICTIONARY[cleanKey] && DICTIONARY[cleanKey][lang]) {
      return DICTIONARY[cleanKey][lang];
    }
    return key;
  }

  // Translate all DOM nodes based on data-i18n, original data attribute, or text content
  function translateDOM(root = document) {
    const lang = getCurrentLanguage();

    // 1. Elements with data-i18n attribute
    const i18nElements = root.querySelectorAll('[data-i18n]');
    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (DICTIONARY[key] && DICTIONARY[key][lang]) {
        el.textContent = DICTIONARY[key][lang];
      }
    });

    // 2. Elements with data-i18n-ph (placeholders)
    const phElements = root.querySelectorAll('[data-i18n-ph]');
    phElements.forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      const val = tPh(key);
      if (val) el.setAttribute('placeholder', val);
    });

    // 3. Scan common navigation, buttons, and badges with static text
    const selectors = [
      '.nav-link', '.btn-outline-full', '.btn-primary-full', '.btn-green-full',
      '.btn-primary-lg', '.btn-primary-sm', '.btn-outline-sm',
      '.section-label', '.auth-heading', '.auth-sub', '.auth-btn-primary',
      '.cs-title', '.cs-label', '.cs-total-label', '.cart-header h1',
      'th', '.wh-title'
    ];

    root.querySelectorAll(selectors.join(',')).forEach(el => {
      // Store original English source text on first observation
      if (!el.hasAttribute('data-hl-orig')) {
        const txt = el.textContent.trim();
        if (txt && DICTIONARY[txt]) {
          el.setAttribute('data-hl-orig', txt);
        }
      }
      const orig = el.getAttribute('data-hl-orig');
      if (orig && DICTIONARY[orig] && DICTIONARY[orig][lang]) {
        el.textContent = DICTIONARY[orig][lang];
      }
    });

    // 4. Update input placeholders
    root.querySelectorAll('input[placeholder]').forEach(input => {
      if (!input.hasAttribute('data-hl-orig-ph')) {
        input.setAttribute('data-hl-orig-ph', input.getAttribute('placeholder'));
      }
      const origPh = input.getAttribute('data-hl-orig-ph');
      const transPh = tPh(origPh);
      if (transPh) input.setAttribute('placeholder', transPh);
    });

    // Update switcher display
    updateSwitcherUI();
  }

  function changeLanguage(langCode) {
    if (!['en', 'gu', 'hi'].includes(langCode)) langCode = 'en';
    localStorage.setItem(HL_LANG_KEY, langCode);

    // Apply translation to DOM
    translateDOM();

    // Dispatch global event for components (like marketplace and cart) to re-render
    window.dispatchEvent(new CustomEvent('hl-language-changed', { detail: { lang: langCode } }));
  }

  function updateSwitcherUI() {
    const lang = getCurrentLanguage();
    const currentObj = HL_LANGUAGES.find(l => l.code === lang) || HL_LANGUAGES[0];

    // Update dropdown button text and active class
    const btn = document.getElementById('langBtn');
    if (btn) {
      const label = btn.querySelector('.lang-name-label');
      if (label) label.textContent = currentObj.native;
      const flag = btn.querySelector('.lang-flag-small');
      if (flag) flag.textContent = currentObj.flag;
    }

    document.querySelectorAll('.lang-option').forEach(opt => {
      const isAct = opt.dataset.lang === lang;
      opt.classList.toggle('active', isAct);
      const check = opt.querySelector('.lang-check');
      if (isAct && !check) {
        opt.insertAdjacentHTML('beforeend', '<span class="lang-check">✓</span>');
      } else if (!isAct && check) {
        check.remove();
      }
    });
  }

  function renderLanguageSwitcher() {
    const currentLangCode = getCurrentLanguage();
    const currentLang = HL_LANGUAGES.find(l => l.code === currentLangCode) || HL_LANGUAGES[0];

    const optionsHtml = HL_LANGUAGES.map(l => {
      const isActive = l.code === currentLangCode ? 'active' : '';
      return `
        <button type="button" class="lang-option ${isActive}" data-lang="${l.code}" onclick="window.HarvestLinkI18n.changeLanguage('${l.code}')">
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
            <span>🌐 Select Language</span>
            <span class="lang-count">3 Languages</span>
          </div>
          <div class="lang-options-grid">
            ${optionsHtml}
          </div>
        </div>
      </div>
    `;
  }

  function initLanguageSwitcherEvents() {
    const wrap = document.getElementById('langSwitcherWrap');
    const btn = document.getElementById('langBtn');
    const dropdown = document.getElementById('langDropdown');

    if (!wrap || !btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) {
        dropdown.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Initialize on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    translateDOM();
    initLanguageSwitcherEvents();
  });

  // Global namespace
  window.HarvestLinkI18n = {
    languages: HL_LANGUAGES,
    getCurrentLanguage,
    changeLanguage,
    t,
    tPh,
    translateDOM,
    renderLanguageSwitcher,
    initLanguageSwitcherEvents
  };

  // Backward compatibility helpers
  window.getCurrentLanguage = getCurrentLanguage;
  window.changeLanguage = changeLanguage;
  window.getTranslation = (text, lang) => {
    if (!text) return '';
    const clean = text.trim();
    if (DICTIONARY[clean] && DICTIONARY[clean][lang || getCurrentLanguage()]) {
      return DICTIONARY[clean][lang || getCurrentLanguage()];
    }
    return text;
  };
})();
