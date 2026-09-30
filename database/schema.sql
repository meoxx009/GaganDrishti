-- ==============================================================================
-- GAGANDRISHTI MASTER DATABASE SCHEMA (POSTGRESQL / SQLITE COMPLIANT)
-- Weather Intelligence, Agronomic Decision & Disaster Early-Warning Platform
-- ==============================================================================

-- 1. INDIA_PINCODES TABLE (500,000+ Indian Post Offices & Village Coordinates)
CREATE TABLE IF NOT EXISTS INDIA_PINCODES (
    pincode VARCHAR(6) PRIMARY KEY,
    office_name VARCHAR(150) NOT NULL,
    pincode_type VARCHAR(20) DEFAULT 'Delivery',
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_meters NUMERIC(6, 2) DEFAULT 450.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. WEATHER_CACHE TABLE (2-Hour Multi-Tier Hyperlocal Weather Cache)
CREATE TABLE IF NOT EXISTS WEATHER_CACHE (
    cache_id SERIAL PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    city_name VARCHAR(100),
    temperature NUMERIC(4, 1) NOT NULL,
    humidity NUMERIC(4, 1) NOT NULL,
    rain_probability INTEGER NOT NULL,
    wind_speed NUMERIC(5, 2) NOT NULL,
    weather_code INTEGER NOT NULL,
    cloud_cover INTEGER DEFAULT 0,
    forecast_12h JSONB,
    forecast_7day JSONB,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    api_source VARCHAR(50) DEFAULT 'Open-Meteo',
    is_valid BOOLEAN DEFAULT TRUE,
    hit_count INTEGER DEFAULT 1
);

-- 3. FARMER_FEEDBACK TABLE (Crowdsourced Ground Truth & Crop Observations)
CREATE TABLE IF NOT EXISTS FARMER_FEEDBACK (
    feedback_id VARCHAR(50) PRIMARY KEY,
    farmer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    village_name VARCHAR(100) NOT NULL,
    crop_name VARCHAR(50) NOT NULL,
    crop_stage VARCHAR(50) NOT NULL,
    activity_today VARCHAR(50) NOT NULL,
    action_taken TEXT NOT NULL,
    weather_today TEXT NOT NULL,
    pest_observed BOOLEAN DEFAULT FALSE,
    pest_name VARCHAR(100),
    disease_observed BOOLEAN DEFAULT FALSE,
    disease_name VARCHAR(100),
    outcome_rating INTEGER CHECK (outcome_rating BETWEEN 1 AND 5),
    outcome_notes TEXT,
    photo_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE
);

-- 4. SMS_REGISTERED_FARMERS TABLE (Feature Phone SMS Registry)
CREATE TABLE IF NOT EXISTS SMS_REGISTERED_FARMERS (
    phone_number VARCHAR(15) PRIMARY KEY,
    farmer_name VARCHAR(100) NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'hi',
    primary_crop VARCHAR(50) DEFAULT 'Soybean',
    is_active BOOLEAN DEFAULT TRUE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_broadcast_sent TIMESTAMP WITH TIME ZONE
);

-- 5. CROP_STAGES TABLE (Agronomic Phenology & Growing Degree Days)
CREATE TABLE IF NOT EXISTS CROP_STAGES (
    stage_id SERIAL PRIMARY KEY,
    crop_name VARCHAR(50) NOT NULL,
    stage_name VARCHAR(50) NOT NULL,
    days_from_sowing INTEGER NOT NULL,
    base_temperature NUMERIC(4, 1) NOT NULL,
    gdd_threshold NUMERIC(6, 1) NOT NULL,
    water_requirement_mm NUMERIC(5, 1) NOT NULL,
    vulnerable_pests JSONB,
    spray_recommendations JSONB
);

-- 6. PEST_DISEASE_TRIGGERS TABLE (Epidemiological Micro-Climate Triggers)
CREATE TABLE IF NOT EXISTS PEST_DISEASE_TRIGGERS (
    trigger_id SERIAL PRIMARY KEY,
    crop_name VARCHAR(50) NOT NULL,
    pest_or_disease_name VARCHAR(100) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('PEST', 'DISEASE')),
    vulnerable_stage VARCHAR(50) NOT NULL,
    min_temp NUMERIC(4, 1) NOT NULL,
    max_temp NUMERIC(4, 1) NOT NULL,
    min_humidity NUMERIC(4, 1) NOT NULL,
    consecutive_rainy_days INTEGER DEFAULT 0,
    organic_treatment TEXT,
    chemical_treatment TEXT
);

-- 7. SYSTEM TELEMETRY & LOGGING TABLES
CREATE TABLE IF NOT EXISTS API_CALL_LOGS (
    log_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    api_name VARCHAR(50) NOT NULL,
    endpoint TEXT NOT NULL,
    pincode VARCHAR(6),
    response_time_ms NUMERIC(8, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    cache_hit BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS FORM_SUBMISSION_LOGS (
    log_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    form_name VARCHAR(50) NOT NULL,
    farmer_name_masked VARCHAR(50),
    pincode VARCHAR(6),
    status VARCHAR(20) NOT NULL,
    processing_time_ms NUMERIC(8, 2) NOT NULL,
    error_fields JSONB
);

CREATE TABLE IF NOT EXISTS SMS_LOGS (
    log_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    phone_number_masked VARCHAR(20) NOT NULL,
    direction VARCHAR(10) CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    message_type VARCHAR(30) NOT NULL,
    message_text TEXT NOT NULL,
    twilio_message_sid VARCHAR(100),
    status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS ERROR_LOGS (
    error_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    error_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT,
    route VARCHAR(100),
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    occurrences INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS PERFORMANCE_LOGS (
    log_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    page_route VARCHAR(100) NOT NULL,
    ttfb_ms NUMERIC(8, 2) NOT NULL,
    dom_load_ms NUMERIC(8, 2) NOT NULL,
    total_load_ms NUMERIC(8, 2) NOT NULL,
    network_type VARCHAR(20) DEFAULT '4g',
    device_type VARCHAR(20) DEFAULT 'mobile'
);

CREATE TABLE IF NOT EXISTS DB_QUERY_LOGS (
    log_id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    query_text TEXT NOT NULL,
    execution_time_ms NUMERIC(8, 2) NOT NULL,
    row_count INTEGER NOT NULL,
    used_index VARCHAR(100),
    is_slow BOOLEAN DEFAULT FALSE
);
