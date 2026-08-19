# Especificaciones y Cambios Futuros (FUTURES_CHANGES.md)

Este documento registra los requerimientos, cambios de esquemas en bases de datos (PostgreSQL en Supabase) y nuevas funciones que se implementarán y acordarán en conjunto entre el **Metrólogo de Planta** y el **Desarrollador**.

---

## 1. 📋 Esquemas de Base de Datos Pendientes de Migración

### 1.1. Tabla `movimientos` — Registro de Observaciones y Estado de Devolución
- **Objetivo**: Permitir a los operarios ingresar una nota / observación al devolver instrumentos (notificar roturas, descalibraciones, caídas, desgaste o inconvenientes de uso).
- **Modificación de DDL requerida**:
  ```sql
  ALTER TABLE public.movimientos 
  ADD COLUMN IF NOT EXISTS nota_devolucion TEXT NULL;
  ```
- **Integración UI**:
  - En la ventana modal de confirmación de devolución (`ConfirmModal.tsx`), incorporar un campo `<textarea>` opcional ("Nota / Observación para Control de Calidad").
  - En el panel de administrador (`AdminDashboard.tsx`), mostrar la columna de observaciones en las pestañas de **Historial de Movimientos** y **En Uso**.

---

### 1.2. Tabla `operarios_habilitados` — Control de Acceso y Permisos de Retiro
- **Objetivo**: Garantizar que únicamente operarios formalmente capacitados y autorizados por el Departamento de Metrología / Calidad puedan retirar instrumentos de medición de alta precisión.
- **Creación de Tabla y RLS requerida**:
  ```sql
  CREATE TABLE IF NOT EXISTS public.operarios_habilitados (
    legajo INTEGER PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    sector VARCHAR(100),
    habilitado BOOLEAN DEFAULT TRUE NOT NULL,
    habilitado_por VARCHAR(100),
    fecha_habilitacion TIMESTAMPTZ DEFAULT NOW(),
    motivo_inhabilitacion TEXT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.operarios_habilitados ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Acceso lectura operarios habilitados" ON public.operarios_habilitados
  FOR SELECT USING (true);

  CREATE POLICY "Acceso modificación operarios habilitados" ON public.operarios_habilitados
  FOR ALL USING (true);
  ```
- **Flujo Operativo**:
  - Al ingresar un legajo no habilitado para retiro, el sistema bloquea la acción y despliega una ventana informativa modal:
    > *"⛔ Tu legajo no cuenta con habilitación para retirar instrumentos. Por favor, solicitá la autorización al Departamento de Metrología."*
  - Desde el panel de administración, el metrólogo dispone de una pestaña para habilitar/deshabilitar operarios con 1 clic.

---

## 2. ⚙️ Funcionalidades Futuras Acordadas

1. **Notificaciones Automáticas por Vencimiento**:
   - Envío de reporte periódico o alerta temprana al dpto. de Calidad cuando un instrumento alcance los 15 días previos a su vencimiento.
2. **Generación de Reportes PDF de Custodia**:
   - Exportación de actas firmadas digitalmente por lote de custodia entre turnos.
3. **Control de Historial de Calibraciones Externas**:
   - Tabla vinculada para adjuntar certificados de calibración trazables (INTI / laboratorios acreditados SAC).
4. **Revisión del Script de Google Apps Script y Origen de Fechas de Calibración**:
   - **Objetivo**: Revisar junto al metrólogo la estructura de las pestañas en la planilla de Google Sheets y el script de extracción (`getInstrumentos` vs `getVencimientos`) para asegurar que todos los instrumentos del inventario general (897+ items) expongan sus fechas exactas de última calibración y fecha de vencimiento calculada, permitiendo que el sistema calcule los días restantes sin requerir estimaciones.
5. **Regularización de Unicidad de Códigos de Instrumentos en Metrología**:
   - **Estado actual**: Se implementó una **Clave Primaria Compuesta `(codigo, nombre)`** con índices B-Tree dedicados en `codigo` y `nombre` para tolerar instrumentos con el mismo código asignado pero distinta denominación.
   - **Objetivo con Metrología**: Coordinar con el Departamento de Metrología / Calidad para que auditen la planilla de inventario maestro y definan un estándar de código único unívoco por instrumento físico (ej. agregando subíndices o sufijos de serie).

---

*Documento mantenido activamente para el proyecto CUSTODIA DE INSTRUMENTOS · MiCRO Automatización.*
