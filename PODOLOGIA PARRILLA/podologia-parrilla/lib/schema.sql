-- ============================================================
-- SCHEMA SUPABASE - Centro de Podologia Parrilla
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- ─── EXTENSION UUID ───
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLA RESERVAS ───
CREATE TABLE IF NOT EXISTS reservas (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre        TEXT NOT NULL,
  apellidos     TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  email         TEXT NOT NULL,
  servicio      TEXT NOT NULL,
  fecha         DATE NOT NULL,
  hora          TIME NOT NULL,
  notas         TEXT DEFAULT '',
  precio        NUMERIC(10,2),
  estado        TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'realizada', 'cancelada')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA PACIENTES (vista derivada) ───
-- Los pacientes se crean automaticamente al reservar.
-- Si quieres un perfil extendido usa esta tabla:
CREATE TABLE IF NOT EXISTS pacientes (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre        TEXT NOT NULL,
  apellidos     TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  fecha_nac     DATE,
  notas         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA SERVICIOS ───
CREATE TABLE IF NOT EXISTS servicios (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre        TEXT NOT NULL,
  descripcion   TEXT DEFAULT '',
  precio        NUMERIC(10,2),
  duracion_min  INT DEFAULT 30,
  activo        BOOLEAN DEFAULT TRUE,
  orden         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TABLA HORARIOS ───
CREATE TABLE IF NOT EXISTS horarios (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dia_semana    INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Lunes
  activo        BOOLEAN DEFAULT TRUE,
  manana_inicio TIME,
  manana_fin    TIME,
  tarde_inicio  TIME,
  tarde_fin     TIME
);

-- ─── DATOS INICIALES ───

-- Servicios
INSERT INTO servicios (nombre, descripcion, precio, duracion_min, orden) VALUES
  ('Consulta Podologica', 'Exploracion y diagnostico del problema podologico. Incluye quiropodia.', 30, 30, 1),
  ('Quiropodia', 'Tratamiento de durezas, callos y patologias de la piel del pie.', 30, 30, 2),
  ('Exploracion Biomedanica', 'Estudio de la pisada mediante plataforma de presiones.', 50, 45, 3),
  ('Biomedanica + Plantillas', 'Exploracion biomedanica mas confeccion de plantillas personalizadas.', 170, 60, 4),
  ('Verruga plantar (1 lesion)', 'Diagnostico y tratamiento completo hasta resolucion.', 120, 45, 5),
  ('Verrugas (2 o mas lesiones)', 'Tratamiento multiple hasta resolucion completa.', 150, 60, 6),
  ('Podologia Deportiva', 'Atencion especializada para deportistas.', 50, 45, 7),
  ('Fisioterapia', 'Consultar segun tratamiento.', NULL, 45, 8),
  ('Osteopatia', 'Consultar segun tratamiento.', NULL, 45, 9);

-- Horarios (Lunes=0 a Domingo=6)
INSERT INTO horarios (dia_semana, activo, manana_inicio, manana_fin, tarde_inicio, tarde_fin) VALUES
  (0, true, '09:00', '14:00', '16:00', '20:00'),
  (1, true, '09:00', '14:00', '16:00', '20:00'),
  (2, true, '09:00', '14:00', '16:00', '20:00'),
  (3, true, '09:00', '14:00', '16:00', '20:00'),
  (4, true, '09:00', '14:00', '16:00', '20:00'),
  (5, false, NULL, NULL, NULL, NULL),
  (6, false, NULL, NULL, NULL, NULL);

-- ─── ROW LEVEL SECURITY ───
-- Las reservas solo las puede leer el admin autenticado,
-- pero cualquiera puede crearlas (para el formulario publico)

ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE horarios ENABLE ROW LEVEL SECURITY;

-- Politica: cualquiera puede insertar (formulario de reserva)
CREATE POLICY "public_can_insert_reservas"
  ON reservas FOR INSERT
  WITH CHECK (true);

-- Politica: solo admin puede leer y modificar reservas
-- (en produccion sustituir por autenticacion real)
CREATE POLICY "admin_can_read_reservas"
  ON reservas FOR SELECT
  USING (true); -- Cambiar a: auth.role() = 'authenticated'

CREATE POLICY "admin_can_update_reservas"
  ON reservas FOR UPDATE
  USING (true); -- Cambiar a: auth.role() = 'authenticated'

-- Servicios y horarios son publicos de lectura
CREATE POLICY "public_can_read_servicios"
  ON servicios FOR SELECT USING (true);

CREATE POLICY "public_can_read_horarios"
  ON horarios FOR SELECT USING (true);

-- ─── FUNCION: obtener slots ocupados ───
CREATE OR REPLACE FUNCTION get_slots_ocupados(p_fecha DATE)
RETURNS TABLE(hora TEXT) AS $$
BEGIN
  RETURN QUERY
    SELECT r.hora::TEXT
    FROM reservas r
    WHERE r.fecha = p_fecha
      AND r.estado NOT IN ('cancelada');
END;
$$ LANGUAGE plpgsql;

-- ─── INDICE para busquedas por fecha ───
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_email ON reservas(email);
CREATE INDEX IF NOT EXISTS idx_reservas_estado ON reservas(estado);
