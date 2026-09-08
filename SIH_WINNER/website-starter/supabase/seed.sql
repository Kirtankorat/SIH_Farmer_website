-- ==============================================================================
-- HARVESTLINK — SUPABASE SEED DATA
-- Realistic Indian Agricultural Produce & Verified Demo Sellers
-- Safe to execute in Supabase SQL Editor after schema.sql
-- ==============================================================================

DO $$
DECLARE
  v_seller1_id uuid := '11111111-1111-1111-1111-111111111111';
  v_seller2_id uuid := '22222222-2222-2222-2222-222222222222';
  v_buyer_id   uuid := '33333333-3333-3333-3333-333333333333';
BEGIN

  -- 1. DEMO AUTH USERS (Allows immediate login in development/testing)
  -- Password for all demo accounts: Farmer@123
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_seller1_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_seller1_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'ramesh.patel@harvestlink.org',
      crypt('Farmer@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Ramesh Patel","phone":"+91 98765 43210","role":"farmer","farm_name":"Patel Organic Farms","village":"Anand","state":"Gujarat","farming_practice":"organic","farm_size_acres":12}',
      now(),
      now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_seller2_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_seller2_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'anand.fpo@harvestlink.org',
      crypt('Farmer@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Anand Farmers Producer Co.","phone":"+91 98765 11223","role":"fpo","business_name":"Anand Krishi FPO","village":"Borsad","state":"Gujarat","farming_practice":"natural","farm_size_acres":85}',
      now(),
      now()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_buyer_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_buyer_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'priya.sharma@harvestlink.org',
      crypt('Farmer@123', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Priya Sharma","phone":"+91 98250 88990","role":"individual_buyer","address":"Flat 402, Green Meadows","city":"Anand","state":"Gujarat"}',
      now(),
      now()
    );
  END IF;

  -- 2. ENSURE PROFILES EXIST
  INSERT INTO public.profiles (
    id, full_name, email, phone, role, farm_name, village, state, farming_practice, farm_size_acres
  ) VALUES (
    v_seller1_id, 'Ramesh Patel', 'ramesh.patel@harvestlink.org', '+91 98765 43210', 'farmer',
    'Patel Organic Farms', 'Anand', 'Gujarat', 'organic', 12
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  INSERT INTO public.profiles (
    id, full_name, email, phone, role, business_name, village, state, farming_practice, farm_size_acres
  ) VALUES (
    v_seller2_id, 'Anand Farmers Producer Co.', 'anand.fpo@harvestlink.org', '+91 98765 11223', 'fpo',
    'Anand Krishi FPO', 'Borsad', 'Gujarat', 'natural', 85
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  INSERT INTO public.profiles (
    id, full_name, email, phone, role, address, city, state
  ) VALUES (
    v_buyer_id, 'Priya Sharma', 'priya.sharma@harvestlink.org', '+91 98250 88990', 'individual_buyer',
    'Flat 402, Green Meadows', 'Anand', 'Gujarat'
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  -- 3. SEED REALISTIC AGRICULTURAL PRODUCE
  -- Clear existing products seeded by this script if needed, or insert if not present
  DELETE FROM public.products WHERE seller_id IN (v_seller1_id, v_seller2_id);

  INSERT INTO public.products (
    id, seller_id, name, description, category, subcategory, farming_practice,
    price, unit, quantity_available, minimum_order_quantity, emoji, location, status, rating
  ) VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    v_seller1_id,
    'Fresh Tomatoes',
    'Farm-fresh desi tomatoes cultivated using 100% certified organic compost. Rich red, firm, and naturally sweet.',
    'vegetables',
    'tomatoes',
    'organic',
    32.00,
    'kg',
    350.00,
    1.00,
    '🍅',
    'Anand, Gujarat',
    'active',
    4.5
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    v_seller2_id,
    'Alphonso Mango (Gir Kesar)',
    'GI-tagged authentic Saurashtra Kesar mangoes with intensely sweet saffron aroma, harvested at peak maturity.',
    'fruits',
    'mango',
    'natural',
    180.00,
    'kg',
    240.00,
    2.00,
    '🥭',
    'Junagadh, Gujarat',
    'active',
    4.8
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    v_seller2_id,
    'Wheat (Lokwan Premium)',
    'Unpolished whole grain Lokwan wheat grown in black soil. Ideal for soft, golden rotis and parathas.',
    'grains',
    'wheat',
    'conventional',
    42.00,
    'kg',
    1200.00,
    5.00,
    '🌾',
    'Mehsana, Gujarat',
    'active',
    4.3
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    v_seller1_id,
    'Organic Turmeric Powder (Salem/Lakadong)',
    'Sun-dried and stone-ground pure turmeric with high curcumin content (>5%). No artificial dyes or starch additives.',
    'spices',
    'turmeric',
    'organic',
    145.00,
    'kg',
    180.00,
    0.50,
    '🟡',
    'Anand, Gujarat',
    'active',
    4.7
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    v_seller1_id,
    'Red Onion (Mahuva Special)',
    'Crisp, pungently flavorful medium red onions with excellent shelf life. Direct from Mahuva onion farmers.',
    'vegetables',
    'onion',
    'conventional',
    28.00,
    'kg',
    800.00,
    2.00,
    '🧅',
    'Bhavnagar, Gujarat',
    'active',
    4.2
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    v_seller2_id,
    'Potato (Deesa Kufri Pukhraj)',
    'High-starch golden potatoes from Deesa belt. Uniform shape, thin peel, ideal for household cooking and chips.',
    'vegetables',
    'potato',
    'conventional',
    22.00,
    'kg',
    1500.00,
    5.00,
    '🥔',
    'Banaskantha, Gujarat',
    'active',
    4.2
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    v_seller2_id,
    'Toor Dal (Gujarat Desi Unpolished)',
    'Split pigeon peas naturally processed without water or chemical polish. High protein and rich earthy taste.',
    'pulses',
    'toor dal',
    'natural',
    95.00,
    'kg',
    600.00,
    1.00,
    '🫘',
    'Vadodara, Gujarat',
    'active',
    4.4
  ),
  (
    'a0000000-0000-0000-0000-000000000008',
    v_seller2_id,
    'Fresh A2 Gir Cow Milk',
    'Raw, unadulterated A2 milk from indigenous free-grazing Gir cows. Delivered chilled in sealed glass bottles.',
    'dairy',
    'milk',
    'natural',
    56.00,
    'litre',
    90.00,
    1.00,
    '🥛',
    'Anand, Gujarat',
    'active',
    4.9
  ),
  (
    'a0000000-0000-0000-0000-000000000009',
    v_seller1_id,
    'Red Chilli (Guntur Teja)',
    'Bright red sun-dried spicy chillies with sharp heat and fiery color. Hand-picked and stem-trimmed.',
    'spices',
    'chilli',
    'conventional',
    120.00,
    'kg',
    300.00,
    1.00,
    '🌶️',
    'Palanpur, Gujarat',
    'active',
    4.3
  ),
  (
    'a0000000-0000-0000-0000-000000000010',
    v_seller1_id,
    'Okra (Fresh Bhindi)',
    'Tender, slender green bhindi harvested early morning. Tender pods with low fiber and excellent crunch.',
    'vegetables',
    'okra',
    'organic',
    58.00,
    'kg',
    180.00,
    1.00,
    '🌿',
    'Anand, Gujarat',
    'active',
    4.6
  ),
  (
    'a0000000-0000-0000-0000-000000000011',
    v_seller1_id,
    'Purple Brinjal (Ravaiya Ringan)',
    'Small round purple eggplants traditional to Gujarati stuffed ringna preparation. Tender flesh, seedless.',
    'vegetables',
    'brinjal',
    'organic',
    40.00,
    'kg',
    150.00,
    1.00,
    '🍆',
    'Anand, Gujarat',
    'active',
    4.3
  ),
  (
    'a0000000-0000-0000-0000-000000000012',
    v_seller2_id,
    'Pearl Millet (Desi Bajra)',
    'Nutrient-dense native pearl millet loaded with iron and magnesium. Ground fresh for winter rotla.',
    'grains',
    'millet',
    'conventional',
    36.00,
    'kg',
    850.00,
    2.00,
    '🌾',
    'Kutch, Gujarat',
    'active',
    4.1
  ),
  (
    'a0000000-0000-0000-0000-000000000013',
    v_seller2_id,
    'Cold-Pressed Mustard Oil',
    'Kachi ghani slow expeller-pressed mustard oil preserving vital antioxidants and traditional pungent aroma.',
    'spices',
    'oil',
    'conventional',
    165.00,
    'litre',
    400.00,
    1.00,
    '🫚',
    'Ahmedabad, Gujarat',
    'active',
    4.5
  ),
  (
    'a0000000-0000-0000-0000-000000000014',
    v_seller2_id,
    'Chana Dal (Desi Chickpea)',
    'Premium yellow gram harvested and dried under ambient sun. Rich nutty flavor and fine cooking consistency.',
    'pulses',
    'chana dal',
    'conventional',
    88.00,
    'kg',
    520.00,
    1.00,
    '🫘',
    'Rajkot, Gujarat',
    'active',
    4.3
  ),
  (
    'a0000000-0000-0000-0000-000000000015',
    v_seller2_id,
    'Garlic (White Saurashtra Bulbs)',
    'Tight-clove pungent white garlic with intense aroma and long storage life. Essential for kathiyawadi cooking.',
    'vegetables',
    'garlic',
    'conventional',
    72.00,
    'kg',
    320.00,
    0.50,
    '🧄',
    'Jamnagar, Gujarat',
    'active',
    4.4
  ),
  (
    'a0000000-0000-0000-0000-000000000016',
    v_seller2_id,
    'Kagzi Lemon',
    'Juicy thin-skin yellow kagzi lemons loaded with vitamin C. Tangy aroma, abundant juice per fruit.',
    'fruits',
    'lemon',
    'natural',
    55.00,
    'kg',
    210.00,
    0.50,
    '🍋',
    'Bhavnagar, Gujarat',
    'active',
    4.6
  );

  -- 4. SEED SAMPLE ORDER FOR BUYER (Priya Sharma)
  INSERT INTO public.orders (
    id, order_number, buyer_id, status, subtotal, delivery_charge, discount, total_amount,
    shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state
  ) VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'HL-1024',
    v_buyer_id,
    'in_transit',
    106.00,
    40.00,
    0.00,
    146.00,
    'Priya Sharma',
    '+91 98250 88990',
    'Flat 402, Green Meadows, Station Road',
    'Anand',
    'Gujarat'
  ) ON CONFLICT (order_number) DO NOTHING;

  INSERT INTO public.order_items (
    order_id, product_id, seller_id, product_name, quantity, unit_price, total_price
  ) VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    v_seller1_id,
    'Fresh Tomatoes',
    2.00,
    32.00,
    64.00
  ),
  (
    'f0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    v_seller2_id,
    'Wheat (Lokwan Premium)',
    1.00,
    42.00,
    42.00
  ) ON CONFLICT DO NOTHING;

END $$;
