-- ============================================
-- Registration Service - MySQL Init
-- Eventos de Bicicletas (Todo tipo)
-- ============================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';
ALTER DATABASE registration_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tipos de eventos de bicicleta
CREATE TABLE IF NOT EXISTS eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_evento VARCHAR(50) NOT NULL,
    distancia_km INT DEFAULT NULL,
    categoria VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    cupo_maximo INT DEFAULT 500,
    fecha_evento DATE NOT NULL,
    hora_inicio TIME DEFAULT '07:00:00',
    ubicacion VARCHAR(300) NOT NULL,
    imagen_url VARCHAR(500) DEFAULT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inscripciones de usuarios a eventos
CREATE TABLE IF NOT EXISTS inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    evento_id INT NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    estado ENUM('pendiente', 'validado', 'rechazado') DEFAULT 'pendiente',
    numero_competidor INT DEFAULT NULL,
    comprobante_url VARCHAR(500) DEFAULT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Tarjeta',
    monto_pagado DECIMAL(10,2) DEFAULT 0.00,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_validacion TIMESTAMP NULL,
    FOREIGN KEY (evento_id) REFERENCES eventos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inscripciones_user ON inscripciones(user_id);
CREATE INDEX idx_inscripciones_evento ON inscripciones(evento_id);
CREATE INDEX idx_inscripciones_estado ON inscripciones(estado);
CREATE INDEX idx_eventos_tipo ON eventos(tipo_evento);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_evento);

-- ============================================
-- Eventos Iniciales
-- ============================================

INSERT INTO eventos (nombre, descripcion, tipo_evento, distancia_km, categoria, precio, cupo_maximo, fecha_evento, hora_inicio, ubicacion) VALUES
('Gran Fondo 100K Elite', 'Carrera profesional de ciclismo de ruta. Recorrido por las montanas con ascensos desafiantes. Para ciclistas experimentados.', 'carrera', 100, 'adultos', 600.00, 300, '2026-06-15', '06:00:00', 'Parque Central, CDMX'),
('Carrera Infantil BMX', 'Carrera segura para ninos de 6 a 12 anos en circuito cerrado con supervision profesional.', 'carrera', 5, 'infantil', 250.00, 100, '2026-06-15', '09:00:00', 'Circuito Infantil, Parque Central'),
('Carrera Femenina 50K', 'Competencia exclusiva para mujeres. Recorrido urbano con paisajes espectaculares.', 'carrera', 50, 'damas', 500.00, 200, '2026-06-15', '07:00:00', 'Zocalo - Coyoacan, CDMX'),
('Carrera Sub-23 Criterium', 'Criterium de velocidad para jovenes ciclistas Sub-23. Circuito tecnico de 2km x 30 vueltas.', 'carrera', 60, 'sub23', 500.00, 150, '2026-06-14', '08:00:00', 'Autodromo Hermanos Rodriguez'),
('Carrera Master/Veteranos', 'Competencia para ciclistas mayores de 40 anos. Categorias Master y Veteranos.', 'carrera', 40, 'master', 450.00, 120, '2026-06-14', '07:30:00', 'Bosque de Chapultepec, CDMX'),
('Paseo Nocturno CDMX', 'Recorrido nocturno por las avenidas principales iluminadas de la Ciudad de Mexico. Ideal para toda la familia.', 'paseo', 25, 'todos', 150.00, 1000, '2026-06-20', '20:00:00', 'Angel de la Independencia, CDMX'),
('Ruta del Vino en Bici', 'Paseo turistico por los vinedos de Queretaro con degustacion de vinos. Terreno suave, apto para principiantes.', 'paseo', 35, 'adultos', 450.00, 80, '2026-07-05', '09:00:00', 'Vinedos La Redonda, Queretaro'),
('Bicicleteada Familiar', 'Paseo familiar por parques y ciclovias. Con estaciones de hidratacion y snacks para ninos.', 'paseo', 10, 'familiar', 100.00, 500, '2026-06-22', '08:00:00', 'Bosque de Tlalpan, CDMX'),
('Taller de Mecanica Basica', 'Aprende a reparar pinchazos, ajustar frenos y cambios. Incluye kit de herramientas basico.', 'taller', NULL, 'todos', 350.00, 30, '2026-06-10', '10:00:00', 'Centro Comunitario de Ciclismo, CDMX'),
('Clinica de Ciclismo de Montana', 'Tecnicas avanzadas de MTB: descenso, saltos y manejo en terreno tecnico. Nivel intermedio-avanzado.', 'taller', NULL, 'adultos', 800.00, 20, '2026-06-28', '08:00:00', 'Desierto de los Leones, CDMX'),
('Expo Bici & Movilidad 2026', 'La mayor exposicion de bicicletas y accesorios en Mexico. Stands, pruebas de bicicletas y conferencias.', 'exhibicion', NULL, 'todos', 200.00, 2000, '2026-07-12', '10:00:00', 'Centro Citibanamex, CDMX'),
('Festival Lowrider & Custom Bikes', 'Exhibicion de bicicletas customizadas, lowriders y arte sobre ruedas. Concurso de la mejor bici.', 'exhibicion', NULL, 'todos', 100.00, 500, '2026-07-19', '11:00:00', 'Explanada del Monumento a la Revolucion'),
('Tour Arquitectonico en Bici', 'Recorrido guiado por los edificios historicos y Art Deco del Centro de la CDMX.', 'tour', 15, 'adultos', 300.00, 25, '2026-06-08', '09:00:00', 'Palacio de Bellas Artes, CDMX'),
('Ruta de Murales en Bicicleta', 'Descubre los murales mas impresionantes de la ciudad pedaleando por barrios artisticos.', 'tour', 12, 'todos', 250.00, 30, '2026-06-29', '10:00:00', 'Museo Anahuacalli, Coyoacan'),
('Carrera Contrarreloj Individual', 'Prueba individual contrarreloj. Cada ciclista contra el cronometro en un circuito plano de 20km.', 'competencia', 20, 'adultos', 400.00, 100, '2026-07-01', '06:30:00', 'Circuito Exterior, CU'),
('Duatlon Bike & Run', 'Combinacion de ciclismo (30km) y carrera a pie (10km). Transicion cronometrada.', 'competencia', 30, 'adultos', 700.00, 200, '2026-07-15', '07:00:00', 'Xochimilco, CDMX');

-- ============================================
-- Inscripciones de ejemplo
-- ============================================

INSERT INTO inscripciones (user_id, evento_id, nombre_completo, email, telefono, direccion, estado, numero_competidor, fecha_validacion) VALUES
(2, 1, 'Carlos Mendoza Rios', 'carlos.mendoza@mail.com', '+52 555 101 2001', 'Av. Reforma 120, Col. Centro, CDMX', 'validado', 1, NOW()),
(3, 3, 'Maria Garcia Lopez', 'maria.garcia@mail.com', '+52 555 202 3002', 'Calle Juarez 45, Col. Roma, CDMX', 'validado', 2, NOW()),
(4, 1, 'Pedro Hernandez Vega', 'pedro.hernandez@mail.com', '+52 333 303 4003', 'Blvd. Vallarta 890, Guadalajara', 'pendiente', NULL, NULL),
(5, 3, 'Ana Lopez Martinez', 'ana.lopez@mail.com', '+52 222 404 5004', 'Calle 5 de Mayo 33, Puebla', 'validado', 3, NOW()),
(6, 4, 'Diego Torres Sanchez', 'diego.torres@mail.com', '+52 818 505 6005', 'Av. Universidad 567, Monterrey', 'pendiente', NULL, NULL),
(7, 6, 'Sofia Ramirez Cruz', 'sofia.ramirez@mail.com', '+52 555 606 7006', 'Insurgentes Sur 1200, CDMX', 'validado', 4, NOW()),
(8, 5, 'Luis Martinez Flores', 'luis.martinez@mail.com', '+52 442 707 8007', 'Blvd. Bernardo Quintana 400, Queretaro', 'validado', 5, NOW()),
(9, 11, 'Valentina Cruz Ortega', 'valentina.cruz@mail.com', '+52 999 808 9008', 'Calle 60 #120, Centro, Merida', 'pendiente', NULL, NULL),
(10, 13, 'Roberto Diaz Navarro', 'roberto.diaz@mail.com', '+52 614 909 1009', 'Av. Tecnologico 2500, Chihuahua', 'validado', 6, NOW()),
(11, 9, 'Camila Silva Moreno', 'camila.silva@mail.com', '+52 477 010 2010', 'Blvd. Lopez Mateos 350, Leon', 'rechazado', NULL, NOW()),
(2, 6, 'Carlos Mendoza Rios', 'carlos.mendoza@mail.com', '+52 555 101 2001', 'Av. Reforma 120, Col. Centro, CDMX', 'validado', 7, NOW()),
(3, 9, 'Maria Garcia Lopez', 'maria.garcia@mail.com', '+52 555 202 3002', 'Calle Juarez 45, Col. Roma, CDMX', 'pendiente', NULL, NULL);
