-- ============================================
-- Auth Service - PostgreSQL Init
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    rol VARCHAR(20) DEFAULT 'corredor' CHECK (rol IN ('admin', 'corredor', 'viewer')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_rol ON users(rol);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);

-- ============================================
-- Usuarios Iniciales
-- ADMIN -> email: admin@cycleracepro.com | password: LucarsTowers@05
-- CORREDORES -> password: Password123!
-- ============================================

INSERT INTO users (email, password_hash, nombre, telefono, direccion, rol) VALUES
('admin@cycleracepro.com', '$2b$10$YtXtmNpZpRr6W/cwryEAYuPY29Nme5hoUkSyNHkcxRg0ATIT5Xf/u', 'Admin', '+52 555 000 0001', 'Oficina Central CycleRace', 'admin'),
('carlos.mendoza@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Carlos Mendoza Rios', '+52 555 101 2001', 'Av. Reforma 120, Col. Centro, CDMX', 'corredor'),
('maria.garcia@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Maria Garcia Lopez', '+52 555 202 3002', 'Calle Juarez 45, Col. Roma, CDMX', 'corredor'),
('pedro.hernandez@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Pedro Hernandez Vega', '+52 333 303 4003', 'Blvd. Vallarta 890, Guadalajara', 'corredor'),
('ana.lopez@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Ana Lopez Martinez', '+52 222 404 5004', 'Calle 5 de Mayo 33, Puebla', 'corredor'),
('diego.torres@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Diego Torres Sanchez', '+52 818 505 6005', 'Av. Universidad 567, Monterrey', 'corredor'),
('sofia.ramirez@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Sofia Ramirez Cruz', '+52 555 606 7006', 'Insurgentes Sur 1200, CDMX', 'corredor'),
('luis.martinez@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Luis Martinez Flores', '+52 442 707 8007', 'Blvd. Bernardo Quintana 400, Queretaro', 'corredor'),
('valentina.cruz@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Valentina Cruz Ortega', '+52 999 808 9008', 'Calle 60 #120, Centro, Merida', 'corredor'),
('roberto.diaz@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Roberto Diaz Navarro', '+52 614 909 1009', 'Av. Tecnologico 2500, Chihuahua', 'corredor'),
('camila.silva@mail.com', '$2b$10$IEr6.PUKpexEH3Ey8kHItuMzNXZzkq1D5r0WOFhWXzqhZ.lR8GPhG', 'Camila Silva Moreno', '+52 477 010 2010', 'Blvd. Lopez Mateos 350, Leon', 'corredor');
