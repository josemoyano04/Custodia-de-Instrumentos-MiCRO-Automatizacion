# Especificación 1: Análisis Técnico del HTML Original (`custodia_instrumentos.html`)

## 1. Contexto y Propósito
El archivo `custodia_instrumentos.html` fue creado como una prueba de concepto (PoC) / producto mínimo viable (MVP) por la gerencia para resolver la necesidad operativa en la planta de producción de **MiCRO Automatización**.
Su objetivo es permitir que los operarios preparadores de CNC y supervisores registren en una tablet táctil ubicada en el departamento de Control de Calidad el retiro y la devolución de los instrumentos de medición, manteniendo la trazabilidad por legajo, máquina asignada y estado de calibración.

Este documento sirve como la **especificación de requerimientos de partida (Base Spec)** para la migración a un sistema profesional, escalable y seguro.

---

## 2. Análisis Funcional (Features Implementadas)

### 2.1 Módulo Operario (Interfaz de Taller)
- **Identificación por Legajo**: El operario ingresa su número de legajo. El sistema busca en un listado interno el nombre, sector y avatar.
- **Búsqueda y Autocompletado de Instrumentos**: Campo de búsqueda inteligente (por código o nombre del instrumento) con filtrado en tiempo real sobre 897 instrumentos.
- **Alertas de Calibración**:
  - `CALIBRADO` (Verde): Permite el retiro normal.
  - `POR VENCER` (Amarillo): Muestra advertencia pero permite el retiro.
  - `VENCIDO` (Rojo): Bloquea el retiro del instrumento e inhabilita el formulario de máquina.
  - `NO APLICA`: Instrumentos de referencia.
- **Selección de Máquinas / Celdas CNC**: Autocompletado sobre 90 máquinas de planta (Tornos CNC, Centros de Mecanizado, Robots Colaborativos).
- **Validación de Disponibilidad**: Verifica si el instrumento ya fue retirado por otro operario, informando quién lo tiene, fecha, hora y máquina.
- **Seguridad por PIN de Operario**:
  - Si es la 1ª vez que opera, solicita la creación y confirmación de un PIN numérico de 4 dígitos.
  - En operaciones subsiguientes, valida el PIN tipeado con el backend (máximo 3 intentos antes de bloquear el legajo).
  - Incluye teclado numérico táctil optimizado para la pantalla de la tablet.

### 2.2 Módulo Administrador (Control & Metrología)
- **Acceso Restringido por Contraseña**: Requiere clave para ingresar al panel de administración.
- **Dashboard y Estadísticas**:
  - Muestra total de instrumentos en uso, total en inventario y movimientos del día.
  - Pestaña **En Uso**: Muestra tabla con instrumentos actualmente retirados, operario, máquina, sector y fecha/hora.
  - Pestaña **Historial**: Registro histórico de retiros y devoluciones con filtros dinámicos por legajo y código de instrumento.
  - Pestaña **Fuera de Plazo (No Devueltos)**: Alerta instrumentos en uso por más de 24 horas.
  - Pestaña **Vencimientos de Calibración**: Reporte de instrumentos vencidos o próximos a vencer.
  - Pestaña **Ranking de Uso**: Gráfico de barras de los 20 instrumentos más utilizados.
  - Pestaña **Gestión de PINs**: Muestra operarios con PIN activo o bloqueado, permitiendo el blanqueo por el administrador.
  - **Exportación CSV**: Descarga el historial filtrado por rango de fechas en formato UTF-8 CSV con BOM.

---

## 3. Ventajas y Fortalezas del MVP
1. **Claridad del Flujo de Trabajo**: Representa perfectamente la dinámica real del taller de mecanizado.
2. **Diseño Visual Cuidado**: Estética corporativa (colores MiCRO Automatización), interfaz clara y amigable.
3. **UX Adaptada a Tablet**: Teclados virtuales numéricos en pantalla, botones grandes y badges visuales de estado.
4. **Protección de Calidad**: Bloqueo preventivo de instrumentos con calibración vencida.

---

## 4. Deficiencias, Vulnerabilidades y Limitaciones Técnicas

| Área | Deficiencia / Problema Detectado | Impacto |
| :--- | :--- | :--- |
| **Seguridad** | Clave de administrador (`Micro12345`) en texto plano dentro del código JS cliente. | Cualquier usuario puede abrir la consola del navegador y ver o saltarse la autenticación. |
| **Seguridad PIN** | Los PINs de los operarios se envían en texto plano al backend (Google Apps Script) sin hash ni encriptación. | Riesgo de interceptación o lectura no autorizada. |
| **Datos Hardcodeados** | Listas de `LEGAJOS` (96 personas) y `MAQUINAS` (90 celdas) incrustadas directamente en el HTML. | Requiere modificar el código fuente para agregar o dar de baja operarios o máquinas. |
| **Rendimiento Backend** | Dependencia de Google Apps Script (`script.google.com`) mediante peticiones POST con tiempos de respuesta elevados (1.5s - 5s). | Respuestas lentas en la tablet y fallos por tiempos de espera (timeouts). |
| **Concurrencia** | Google Sheets no es una base de datos relacional; no posee bloqueos transaccionales (ACID). | Si dos operarios retiran el mismo instrumento al mismo tiempo, ocurre condición de carrera (*race condition*). |
| **Arquitectura** | Archivo único de 2476 líneas (HTML + CSS inline + JS en un solo bloque). | Muy difícil de mantener, testear y extender modularmente. |
| **Disponibilidad** | Sin soporte PWA (Service Workers / Web App Manifest). | Si se pierde la conexión Wi-Fi de la planta, la aplicación queda totalmente inoperativa. |
