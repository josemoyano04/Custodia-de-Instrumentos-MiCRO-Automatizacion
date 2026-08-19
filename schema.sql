-- ====================================================================
-- ESQUEMA COMPLETO DE BASE DE DATOS SUPABASE POSTGRESQL
-- PROYECTO: Custodia de Instrumentos - MiCRO Automatización
-- ====================================================================

-- 1. TABLA: INSTRUMENTOS (Clave primaria compuesta: codigo + nombre)
CREATE TABLE IF NOT EXISTS public.instrumentos (
    codigo TEXT NOT NULL,
    nombre TEXT NOT NULL,
    sector TEXT,
    estado_calibracion TEXT DEFAULT 'CALIBRADO',
    fecha_ultima_calibracion DATE,
    fecha_vencimiento_calibracion DATE,
    dias_hasta_vencimiento INTEGER,
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (codigo, nombre)
);

-- Índices para búsqueda y filtrado de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_instrumentos_codigo ON public.instrumentos(codigo);
CREATE INDEX IF NOT EXISTS idx_instrumentos_nombre ON public.instrumentos(nombre);
CREATE INDEX IF NOT EXISTS idx_instrumentos_sector ON public.instrumentos(sector);
CREATE INDEX IF NOT EXISTS idx_instrumentos_estado ON public.instrumentos(estado_calibracion);

-- 2. TABLA: MOVIMIENTOS (Custodias / Retiros / Devoluciones)
CREATE TABLE IF NOT EXISTS public.movimientos (
    id BIGSERIAL PRIMARY KEY,
    codigo_instrumento TEXT NOT NULL,
    legajo_operario INTEGER NOT NULL,
    nombre_operario TEXT,
    sector_operario TEXT,
    descripcion_maquina TEXT,
    fecha_retiro DATE NOT NULL,
    hora_retiro TEXT NOT NULL,
    fecha_devolucion DATE,
    hora_devolucion TEXT,
    estado TEXT NOT NULL DEFAULT 'EN USO' CHECK (estado IN ('EN USO', 'DEVUELTO')),
    nota_devolucion TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_estado ON public.movimientos(estado);
CREATE INDEX IF NOT EXISTS idx_movimientos_codigo ON public.movimientos(codigo_instrumento);
CREATE INDEX IF NOT EXISTS idx_movimientos_legajo ON public.movimientos(legajo_operario);

-- 3. TABLA: PINES_OPERARIOS (Seguridad y Autenticación de Operarios)
CREATE TABLE IF NOT EXISTS public.pines_operarios (
    legajo INTEGER PRIMARY KEY,
    pin_hash TEXT NOT NULL,
    bloqueado BOOLEAN NOT NULL DEFAULT false,
    intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    ultimo_uso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABLA: OPERARIOS_HABILITADOS (Opcional / Habilitaciones por sector)
CREATE TABLE IF NOT EXISTS public.operarios_habilitados (
    legajo INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    sector TEXT NOT NULL,
    habilitado BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ====================================================================
-- HABILITACIÓN DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- Permite lectura/escritura pública con Anon Key para la PWA de Planta
-- ====================================================================

ALTER TABLE public.instrumentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pines_operarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operarios_habilitados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso público lectura/escritura instrumentos" ON public.instrumentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público lectura/escritura movimientos" ON public.movimientos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público lectura/escritura pines_operarios" ON public.pines_operarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso público lectura/escritura operarios_habilitados" ON public.operarios_habilitados FOR ALL USING (true) WITH CHECK (true);
