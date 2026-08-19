# Custodia de Instrumentos · MiCRO Automatización (v0.0.1)

Sistema PWA (Progressive Web App) para la gestión ágil, control de custodia, inventario y calibración metrológica de instrumentos de medición en planta de producción.

---

## 🚀 Características Principales

* **Flujos de Operario Duales**:
  * **Retiro de Instrumentos**: Búsqueda interactiva en catálogo de 897 instrumentos, selección de máquina/celda destinataria y validación de seguridad por PIN.
  * **Devolución de Instrumentos**: Panel ágil con listado en tiempo real de instrumentos en poder del operario y entrega con un solo clic.
* **Seguridad y Control de PINs**:
  * Autenticación por PIN de 4 dígitos con hash en base de datos.
  * Bloqueo automático al 3er intento fallido y gestión/blanqueo desde el panel de administración.
  * **Cero almacenamiento local**: Ningún PIN se guarda en `localStorage`.
* **Panel de Administración Metrológica**:
  * Visualización en tiempo real de custodias activas (en uso).
  * Historial cronológico con filtros avanzados (operario, fecha, máquina, instrumento).
  * Monitoreo de vencimientos de calibración con ordenamiento dinámico por columnas y alertas por colores.
  * Gestión centralizada de PINs (creación, cambio y blanqueo con modal de confirmación).
* **Diseño Responsivo e Industrial**:
  * Interfaz optimizada para Tablets (ej. Lenovo Tab 11"), PCs de escritorio y dispositivos móviles Android/iOS.
  * Soporte completo de **Modo Claro** y **Modo Oscuro**.
  * Barra del marco de la PWA dinámica (`#01b2fe` en claro, `#009bde` en oscuro).
* **Capacidad PWA Standalone / Pantalla Completa**:
  * Instalable como aplicación nativa en Windows, macOS, Android e iOS.
  * Íconos oficiales integrados en múltiples resoluciones (`192x192`, `512x512`, `maskable`, `apple-touch-icon`, `favicon.ico`).
* **Arquitectura de Datos Resiliente (`AUTO`)**:
  * Prioriza **Supabase PostgreSQL** como base de datos transaccional en tiempo real.
  * Fallback automático a **Google Apps Script** para continuidad operativa de lectura.
  * Botón de **Sincronización manual (Refresh)** para volcado instantáneo de datos desde Google Sheets hacia Supabase.

---

## 🛠️ Stack Tecnológico

* **Frontend**: React 19 + TypeScript + Vite 8
* **Estilos**: Vanilla CSS modular con variables de diseño temáticas
* **PWA**: `vite-plugin-pwa` con Service Worker Workbox
* **Base de Datos Transaccional**: Supabase (PostgreSQL + RLS + API REST)
* **Fuente de Catálogo Maestro**: Google Sheets vía Webhook Google Apps Script

---

## 📦 Estructura del Proyecto

```
├── app/                        # Código fuente de la aplicación frontend PWA
│   ├── public/                 # Manifiesto PWA e íconos multi-resolución
│   ├── src/
│   │   ├── components/         # Componentes React (Header, Modales, Cards, Admin)
│   │   ├── services/           # Capa de datos desacoplada (dataService, syncService, supabaseClient)
│   │   ├── styles/             # Hojas de estilo CSS modulares
│   │   └── types/              # Definiciones TypeScript
│   ├── .env.example            # Plantilla de variables de entorno
│   ├── package.json            # Dependencias y scripts v0.0.1
│   ├── vercel.json             # Configuración de routing para despliegue en Vercel
│   └── vite.config.ts          # Configuración de Vite y PWA
├── spec/                       # Especificaciones funcionales y volcados técnicos
├── FUTURES_CHANGES.md          # Bitácora de funcionalidades futuras para coordinar con Metrología
├── schema.sql                  # Script DDL para creación de tablas en Supabase
└── README.md                   # Documentación general
```

---

## ⚙️ Configuración y Despliegue

### 1. Variables de Entorno
Copia `app/.env.example` a `app/.env` y configura tus credenciales:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TU_CLAVE_AQUI
VITE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
VITE_ADMIN_PASS=12345678
VITE_DATA_SOURCE_MODE=AUTO
VITE_ALLOW_RETIRO_VENCIDO=true
```

### 2. Base de Datos en Supabase
Ejecuta el script [`schema.sql`](schema.sql) en el **SQL Editor** de tu proyecto en Supabase para crear las tablas `instrumentos`, `movimientos`, `pines_operarios` y habilitar las políticas de seguridad RLS.

### 3. Desarrollo Local
```bash
cd app
npm install
npm run dev
```

### 4. Despliegue en Vercel (100% Gratuito)
1. Conecta el repositorio en [Vercel](https://vercel.com).
2. Configura el **Root Directory** en `app`.
3. Agrega las variables de entorno en la sección **Environment Variables** de Vercel.
4. Haz clic en **Deploy**.

---

## 📄 Licencia y Créditos

Desarrollado para **MiCRO Automatización** · Departamento de Metrología y Calidad (2026).
