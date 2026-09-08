-- =======================================================
-- HarvestLink - PostgreSQL Database Schema
-- =======================================================

-- Create custom timestamp update function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('farmer', 'fpo', 'bulk', 'logistics', 'consumer', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. FARMER PROFILES
CREATE TABLE IF NOT EXISTS profiles_farmer (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(150),
    village VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    farm_size_acres NUMERIC(8, 2),
    farming_practice VARCHAR(50) DEFAULT 'organic',
    primary_crops TEXT,
    monthly_produce_kg NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. FPO PROFILES
CREATE TABLE IF NOT EXISTS profiles_fpo (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fpo_name VARCHAR(150) NOT NULL,
    registration_number VARCHAR(100),
    member_count INTEGER DEFAULT 0,
    contact_person VARCHAR(100),
    state VARCHAR(100),
    district VARCHAR(100),
    primary_commodities TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BULK BUYER PROFILES
CREATE TABLE IF NOT EXISTS profiles_bulk (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(50),
    contact_person VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    gst_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. LOGISTICS PARTNER PROFILES
CREATE TABLE IF NOT EXISTS profiles_logistics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    fleet_type VARCHAR(150),
    capacity_tons NUMERIC(8, 2),
    primary_coverage_area VARCHAR(200),
    has_cold_storage VARCHAR(50) DEFAULT 'No',
    driver_count INTEGER DEFAULT 1,
    contact_person VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    emoji VARCHAR(20) DEFAULT '🌾',
    category VARCHAR(50) NOT NULL,
    farming_practice VARCHAR(50) NOT NULL,
    seller_type VARCHAR(30) NOT NULL DEFAULT 'farmer',
    price NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    farmer_name VARCHAR(150),
    location VARCHAR(100),
    rating NUMERIC(3, 2) DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    availability VARCHAR(30) DEFAULT 'available',
    stock_quantity NUMERIC(10, 2) DEFAULT 100.0,
    badge VARCHAR(50) DEFAULT 'Individual Farmer',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    buyer_name VARCHAR(150) NOT NULL,
    buyer_email VARCHAR(150),
    buyer_phone VARCHAR(30),
    delivery_address TEXT,
    delivery_city VARCHAR(100),
    delivery_state VARCHAR(100),
    status VARCHAR(50) DEFAULT 'placed',
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 40.0,
    discount NUMERIC(10, 2) DEFAULT 0.0,
    total_amount NUMERIC(10, 2) NOT NULL,
    expected_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    emoji VARCHAR(20),
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    seller_name VARCHAR(150),
    seller_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    line_total NUMERIC(10, 2) NOT NULL
);

-- 9. BULK PROCUREMENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS bulk_requests (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    business_name VARCHAR(150),
    business_type VARCHAR(50),
    contact_name VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(150),
    product_name VARCHAR(150) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(30) DEFAULT 'kg',
    frequency VARCHAR(50) DEFAULT 'Weekly',
    delivery_location VARCHAR(200) NOT NULL,
    required_date DATE,
    additional_notes TEXT,
    status VARCHAR(50) DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. DEMAND INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS demand_insights (
    id SERIAL PRIMARY KEY,
    crop_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    trend VARCHAR(30) NOT NULL,
    trend_label VARCHAR(50) NOT NULL,
    next_week VARCHAR(30) NOT NULL,
    avg_price VARCHAR(30) NOT NULL,
    stock VARCHAR(50) NOT NULL,
    recommendation TEXT NOT NULL,
    bars JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. LOGISTICS SHIPMENTS TABLE
CREATE TABLE IF NOT EXISTS logistics_shipments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    partner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(30),
    vehicle_number VARCHAR(50),
    origin VARCHAR(200),
    destination VARCHAR(200),
    route_steps JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    pickup_time VARCHAR(100),
    delivery_time VARCHAR(100),
    cargo_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CONTACT INQUIRIES TABLE
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(150) NOT NULL,
    role_type VARCHAR(100),
    message TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES FOR FASTER QUERIES
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_practice ON products(farming_practice);
CREATE INDEX IF NOT EXISTS idx_products_seller_type ON products(seller_type);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_bulk_requests_buyer_id ON bulk_requests(buyer_id);
