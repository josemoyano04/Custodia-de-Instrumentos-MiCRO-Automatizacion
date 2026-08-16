# Especificación 4: Informe Detallado — Google Sheets API v4 vs. Google Apps Script

## 1. Introducción
El propósito de este informe es explicar de forma clara, didáctica y técnica cómo funciona **Google Sheets API v4**, compararla con la solución actual (**Google Apps Script - GAS**) y brindar los elementos para tomar una decisión informada respecto a la mantención y evolución del sistema.

---

## 2. ¿Qué es Google Sheets API v4?

**Google Sheets API v4** es la API oficial provista por Google Cloud para leer, escribir, crear y formatear hojas de cálculo en Google Drive de forma directa desde cualquier backend o aplicación externa.

A diferencia de **Google Apps Script (GAS)** —que es un entorno de código JavaScript alojado *dentro* de las herramientas de Google—, la **Sheets API v4** es un endpoint HTTP REST profesional con autenticación mediante tokens de seguridad (Service Accounts).

---

## 3. Cuadro Comparativo: Google Apps Script vs. Google Sheets API v4

| Aspecto | Google Apps Script (GAS) — *Actual* | Google Sheets API v4 — *API Oficial* |
| :--- | :--- | :--- |
| **Dónde corre el código** | En los servidores de Google Apps Script. | En tu propia aplicación (Vercel / Backend Node.js). |
| **Autenticación** | URL pública (`/exec`) o cuenta de Google. | Credenciales de Cuenta de Servicio (*Service Account JSON*). |
| **Velocidad y Latencia** | **Lenta (1.5s - 5s)** debido a *cold starts* de Google. | **Rápida (150ms - 400ms)** directo a la infraestructura Google Cloud. |
| **Concurrencia y Bloqueos** | Alta probabilidad de colisión o timeout con múltiples usuarios. | Soporta peticiones concurrentes y lotes (*batch updates*). |
| **Límites de Uso** | Límites severos por cuenta (ej: 20.000 llamadas/día, 6 min max). | 300 peticiones por minuto por proyecto (ampliable gratis). |
| **Mantenimiento y Simplicidad** | Requiere tocar código dentro del editor de Google Sheets. | Todo el código reside en el repositorio del proyecto (`/app`). |

---

## 4. ¿Cómo funciona la autenticación en Google Sheets API v4?

Para usar la API v4 de forma segura sin pedirle login a los usuarios de la tablet, se utiliza una **Cuenta de Servicio (Service Account)**:
1. En **Google Cloud Console** se crea una "Cuenta de Servicio" (es como un bot con un email ficticio, ej: `custodia-bot@proyecto.iam.gserviceaccount.com`).
2. Se descarga una clave secreta en formato JSON (`credentials.json`).
3. En la hoja de Google Sheets del metrólogo, se hace clic en **Compartir** y se agrega el email del bot con permiso de **Editor**.
4. La aplicación en Vercel usa esa clave JSON enviada en variables de entorno para leer/escribir automáticamente.

---

## 5. Ventajas y Desventajas para el Proyecto

### Ventajas de Google Sheets API v4
- **Confiabilidad Industrial**: Estabilidad del 99.99% garantizada por Google Cloud.
- **Sin sorpresas en URLs**: No depende de redespliegues manuales de Apps Script cada vez que se cambia una línea en la planilla.
- **Menor tiempo de respuesta**: Consultas y actualizaciones en fracciones de segundo.

### Desventajas / Desafíos iniciales
- Requiere un paso único de configuración inicial en Google Cloud Console (crear el proyecto y descargar la credencial JSON).

---

## 6. Recomendación para el Proyecto (Fase 1 vs. Fase 2)

Dada la premisa de **Simplicidad + Seguridad + Mantenibilidad**:

- **Fase 1 (Actual - Acordada)**: Continuaremos usando el webhook de **Google Apps Script** existente aplicado a la copia de Google Sheets, conectado con **Supabase PostgreSQL** como motor transaccional primario. Esto permite arrancar de inmediato sin tocar credenciales de Google Cloud.
- **Fase 2 (Recomendada a futuro)**: Cuando el sistema esté desplegado y estable en producción, la migración a **Google Sheets API v4** será sumamente sencilla, cambiando únicamente la capa de servicio de sync por el SDK oficial `@googleapis/sheets`.
