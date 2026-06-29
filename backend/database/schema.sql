-- =========================
-- DROP TABLES IF EXISTS
-- WARNING: This deletes all old tables and all old records.
-- =========================

DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS emergency_alerts CASCADE;
DROP TABLE IF EXISTS request_accepts CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS volunteer_availability CASCADE;
DROP TABLE IF EXISTS volunteer_docs CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;
DROP TABLE IF EXISTS disabled CASCADE;
DROP TABLE IF EXISTS supervisors CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- =========================
-- USERS TABLE
-- =========================

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,

    national_code CHAR(10) NOT NULL UNIQUE,

    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,

    phone CHAR(11) NOT NULL UNIQUE
        CHECK (phone ~ '^09[0-9]{9}$'),

    birth_date DATE,
    province VARCHAR(50),
    city VARCHAR(50),

    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('admin', 'disabled', 'supervisor', 'volunteer')),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);


-- =========================
-- REFRESH TOKENS TABLE
-- =========================

CREATE TABLE refresh_tokens (
    token_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    token_hash VARCHAR(255) NOT NULL UNIQUE,

    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,

    user_agent TEXT,
    ip_address VARCHAR(45),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================
-- SUPERVISORS TABLE
-- user 1 ---- 1 supervisor
-- =========================

CREATE TABLE supervisors (
    sup_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_supervisor_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


-- =========================
-- DISABLED TABLE
-- user 1 ---- 1 disabled
-- supervisor 1 ---- n disabled
-- =========================

CREATE TABLE disabled (
    dis_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,
    sup_id INT,

    accessibility_need TEXT,
    home_address TEXT NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_disabled_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_disabled_supervisor
        FOREIGN KEY (sup_id)
        REFERENCES supervisors(sup_id)
        ON DELETE SET NULL
);


-- =========================
-- VOLUNTEERS TABLE
-- user 1 ---- 1 volunteer
-- current location is used for matching
-- =========================

CREATE TABLE volunteers (
    vol_id SERIAL PRIMARY KEY,

    user_id INT NOT NULL UNIQUE,

    home_address TEXT NOT NULL,

    current_lat DECIMAL(10, 7),
    current_lng DECIMAL(10, 7),
    location_updated_at TIMESTAMP,

    is_online BOOLEAN NOT NULL DEFAULT FALSE,

    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected')),

    verified_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_volunteer_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT check_volunteer_current_lat
        CHECK (current_lat IS NULL OR current_lat BETWEEN -90 AND 90),

    CONSTRAINT check_volunteer_current_lng
        CHECK (current_lng IS NULL OR current_lng BETWEEN -180 AND 180),

    CONSTRAINT check_volunteer_current_location_pair
        CHECK (
            (current_lat IS NULL AND current_lng IS NULL)
            OR
            (current_lat IS NOT NULL AND current_lng IS NOT NULL)
        )
);


-- =========================
-- VOLUNTEER DOCUMENTS TABLE
-- volunteer 1 ---- n volunteer_docs
-- =========================

CREATE TABLE volunteer_docs (
    doc_id SERIAL PRIMARY KEY,

    vol_id INT NOT NULL,

    doc_type VARCHAR(30) NOT NULL
        CHECK (doc_type IN ('criminal_record', 'identity_image', 'other')),

    file_path VARCHAR(255) NOT NULL,

    review_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (review_status IN ('pending', 'approved', 'rejected')),

    reviewed_by_user_id INT,
    reviewed_at TIMESTAMP,

    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_volunteer_doc_volunteer
        FOREIGN KEY (vol_id)
        REFERENCES volunteers(vol_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_volunteer_doc_reviewer
        FOREIGN KEY (reviewed_by_user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);


-- =========================
-- VOLUNTEER AVAILABILITY TABLE
-- volunteer 1 ---- n volunteer_availability
-- weekday: 0 to 6
-- =========================

CREATE TABLE volunteer_availability (
    avail_id SERIAL PRIMARY KEY,

    vol_id INT NOT NULL,

    weekday SMALLINT NOT NULL
        CHECK (weekday BETWEEN 0 AND 6),

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_availability_volunteer
        FOREIGN KEY (vol_id)
        REFERENCES volunteers(vol_id)
        ON DELETE CASCADE,

    CONSTRAINT check_time_range
        CHECK (start_time < end_time)
);


-- =========================
-- SERVICE REQUESTS TABLE
-- disabled 1 ---- n service_requests
-- supervisor 1 ---- n service_requests
-- origin location is required
-- destination location is optional
-- =========================

CREATE TABLE service_requests (
    request_id SERIAL PRIMARY KEY,

    dis_id INT NOT NULL,
    sup_id INT,

    requester_user_id INT,

    request_type VARCHAR(30) NOT NULL
        CHECK (request_type IN ('medical', 'shopping', 'entertainment', 'administrative')),

    requested_time TIMESTAMP NOT NULL,

    origin_address TEXT,
    origin_lat DECIMAL(10, 7) NOT NULL,
    origin_lng DECIMAL(10, 7) NOT NULL,

    destination_address TEXT,
    destination_lat DECIMAL(10, 7),
    destination_lng DECIMAL(10, 7),

    description TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'in_progress', 'finished', 'cancelled')),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,

    CONSTRAINT fk_request_disabled
        FOREIGN KEY (dis_id)
        REFERENCES disabled(dis_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_request_supervisor
        FOREIGN KEY (sup_id)
        REFERENCES supervisors(sup_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_request_user
        FOREIGN KEY (requester_user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT check_origin_lat
        CHECK (origin_lat BETWEEN -90 AND 90),

    CONSTRAINT check_origin_lng
        CHECK (origin_lng BETWEEN -180 AND 180),

    CONSTRAINT check_destination_lat
        CHECK (destination_lat IS NULL OR destination_lat BETWEEN -90 AND 90),

    CONSTRAINT check_destination_lng
        CHECK (destination_lng IS NULL OR destination_lng BETWEEN -180 AND 180),

    CONSTRAINT check_destination_location_pair
        CHECK (
            (destination_lat IS NULL AND destination_lng IS NULL)
            OR
            (destination_lat IS NOT NULL AND destination_lng IS NOT NULL)
        )
);


-- =========================
-- REQUEST ACCEPTS TABLE
-- service_request 1 ---- 1 request_accept
-- volunteer 1 ---- n request_accept
-- estimated distance and duration are saved here
-- =========================

CREATE TABLE request_accepts (
    accept_id SERIAL PRIMARY KEY,

    request_id INT NOT NULL UNIQUE,
    vol_id INT NOT NULL,

    volunteer_lat_at_accept DECIMAL(10, 7),
    volunteer_lng_at_accept DECIMAL(10, 7),

    estimated_distance_meters INT,
    estimated_duration_seconds INT,
    route_provider VARCHAR(30),
    route_calculated_at TIMESTAMP,

    accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,

    status VARCHAR(20) NOT NULL DEFAULT 'accepted'
        CHECK (status IN ('accepted', 'started', 'finished', 'cancelled')),

    CONSTRAINT fk_accept_request
        FOREIGN KEY (request_id)
        REFERENCES service_requests(request_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_accept_volunteer
        FOREIGN KEY (vol_id)
        REFERENCES volunteers(vol_id)
        ON DELETE CASCADE,

    CONSTRAINT check_accept_lat
        CHECK (volunteer_lat_at_accept IS NULL OR volunteer_lat_at_accept BETWEEN -90 AND 90),

    CONSTRAINT check_accept_lng
        CHECK (volunteer_lng_at_accept IS NULL OR volunteer_lng_at_accept BETWEEN -180 AND 180),

    CONSTRAINT check_accept_location_pair
        CHECK (
            (volunteer_lat_at_accept IS NULL AND volunteer_lng_at_accept IS NULL)
            OR
            (volunteer_lat_at_accept IS NOT NULL AND volunteer_lng_at_accept IS NOT NULL)
        ),

    CONSTRAINT check_estimated_distance_positive
        CHECK (estimated_distance_meters IS NULL OR estimated_distance_meters >= 0),

    CONSTRAINT check_estimated_duration_positive
        CHECK (estimated_duration_seconds IS NULL OR estimated_duration_seconds >= 0)
);


-- =========================
-- EMERGENCY ALERTS TABLE
-- disabled 1 ---- n emergency_alerts
-- supervisor 1 ---- n emergency_alerts
-- emergency location is required
-- =========================

CREATE TABLE emergency_alerts (
    alert_id SERIAL PRIMARY KEY,

    dis_id INT NOT NULL,
    sup_id INT,

    requester_user_id INT,

    alert_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (alert_status IN ('pending', 'sent', 'resolved', 'cancelled')),

    alert_lat DECIMAL(10, 7) NOT NULL,
    alert_lng DECIMAL(10, 7) NOT NULL,

    address TEXT,

    triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,

    CONSTRAINT fk_emergency_disabled
        FOREIGN KEY (dis_id)
        REFERENCES disabled(dis_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emergency_supervisor
        FOREIGN KEY (sup_id)
        REFERENCES supervisors(sup_id)
        ON DELETE SET NULL,

    CONSTRAINT fk_emergency_user
        FOREIGN KEY (requester_user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT check_alert_lat
        CHECK (alert_lat BETWEEN -90 AND 90),

    CONSTRAINT check_alert_lng
        CHECK (alert_lng BETWEEN -180 AND 180)
);


-- =========================
-- INDEXES
-- =========================

CREATE INDEX idx_users_national_code ON users(national_code);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

CREATE INDEX idx_disabled_user_id ON disabled(user_id);
CREATE INDEX idx_disabled_sup_id ON disabled(sup_id);

CREATE INDEX idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX idx_volunteers_verification_status ON volunteers(verification_status);
CREATE INDEX idx_volunteers_is_online ON volunteers(is_online);
CREATE INDEX idx_volunteers_current_location ON volunteers(current_lat, current_lng);
CREATE INDEX idx_volunteers_location_updated_at ON volunteers(location_updated_at);

CREATE INDEX idx_volunteer_docs_vol_id ON volunteer_docs(vol_id);
CREATE INDEX idx_volunteer_docs_review_status ON volunteer_docs(review_status);

CREATE INDEX idx_volunteer_availability_vol_id ON volunteer_availability(vol_id);
CREATE INDEX idx_volunteer_availability_weekday ON volunteer_availability(weekday);
CREATE INDEX idx_volunteer_availability_active ON volunteer_availability(is_active);

CREATE INDEX idx_service_requests_dis_id ON service_requests(dis_id);
CREATE INDEX idx_service_requests_sup_id ON service_requests(sup_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_requested_time ON service_requests(requested_time);
CREATE INDEX idx_service_requests_origin_location ON service_requests(origin_lat, origin_lng);

CREATE INDEX idx_request_accepts_request_id ON request_accepts(request_id);
CREATE INDEX idx_request_accepts_vol_id ON request_accepts(vol_id);
CREATE INDEX idx_request_accepts_status ON request_accepts(status);

CREATE INDEX idx_emergency_alerts_dis_id ON emergency_alerts(dis_id);
CREATE INDEX idx_emergency_alerts_sup_id ON emergency_alerts(sup_id);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(alert_status);
CREATE INDEX idx_emergency_alerts_location ON emergency_alerts(alert_lat, alert_lng);