# Especificación 2: Propuesta Tecnológica, Arquitectura y Estrategia de Despliegue

## 1. Metodología SDD (Spec-Driven Development)
Para garantizar la máxima estabilidad, mantenibilidad y escalabilidad, el desarrollo de esta nueva versión aplicará la metodología **Spec-Driven Development (SDD)**:
1. **Fase de Especificación**: Cada funcionalidad (Autenticación por PIN, Búsqueda de Instrumentos, Registro Transaccional, Dashboard Metrológico) tendrá su documento de requerimientos e interfaces definido en la carpeta `/spec` antes de escribir código.
2. **Fase de Implementación**: El código de la aplicación se desarrollará exclusivamente en la carpeta `/app`, alineándose al 100% con la especificación previa.
3. **Fase de Verificación**: Cada módulo contará con pruebas automáticas o manuales de aceptación especificadas en el plan de verificación.

---

## 2. Stack Tecnológico Sugerido

### 2.1 Frontend & Aplicación Web Instalable (PWA)
- **Framework Core**: **React 18+ (con Vite)** o **Next.js (App Router)**.
  - *Ventaja*: Renderizado ultra rápido, arquitectura por componentes modulares y tipado fuerte con TypeScript.
- **Formato PWA (Progressive Web App)**:
  - **Web App Manifest (`manifest.json`)**: Configura la web para ser instalable como una aplicación nativa independiente en la tablet de Control de Calidad (sin barra de navegador, icono propio en la pantalla de inicio, modo Fullscreen/Standalone).
  - **Service Workers**: Estrategia de caché para recursos estáticos (CSS, JS, iconos) que garantiza carga instantánea (<100ms) en la tablet incluso si la red Wi-Fi sufre micro-cortes.
- **UI & UX**: Vanilla CSS / Tailwind CSS con un Design System industrial moderno, adaptado a interfaces táctiles (touch targets grandes de 48px+).

### 2.2 Backend & Capa de Datos
- **Opción A (Recomendada - Híbrida DB + Google Sheets Sync)**:
  - **Base de Datos Principal**: PostgreSQL (vía Supabase / Render / Docker local).
  - **API Backend**: Node.js (Express/Fastify) o Serverless Edge Functions.
  - **Motor de Sincronización**: Un worker en segundo plano que sincronice automáticamente las tablas relacionales con la Google Sheet del Metrólogo.
  - *Beneficio*: Transacciones instantáneas (<30ms) en la tablet con garantía de integridad ACID (evita robos/duplicaciones por carreras), manteniendo a la vez actualizada la hoja de cálculo que consulta el metrólogo.
- **Opción B (Integración Directa mediante Google Sheets API v4)**:
  - Backend Node.js utilizando la librería oficial `googleapis` con **Service Account Credentials** (reemplazando Google Apps Script).
  - *Beneficio*: Elimina Google Apps Script y mejora los tiempos de respuesta.

---

## 3. Estrategia y Opciones de Despliegue (PAAS vs Servidor Local)

Para cumplir con el requerimiento de **mantener una misma URL fija**, acceso desde la tablet y acceso remoto para superiores, se evalúan dos escenarios principales:

### Opción 1: Cloud PAAS (Vercel / Cloudflare Pages / Render / Supabase) — *RECOMENDADA*
- **URL Unica**: `https://custodia-instrumentos.micro.com` (o `https://custodia-micro.vercel.app`).
- **Arquitectura**:
  - Frontend PWA alojado en Vercel o Cloudflare Pages (CDN Global gratuita y ultra rápida).
  - Backend API & DB alojado en Supabase o Render.
- **Ventajas**:
  - Acceso universal: La tablet en planta y los supervisores/gerentes en sus laptops o móviles acceden por la misma URL desde cualquier red.
  - Certificado SSL HTTPS automático.
  - Despliegue continuo (CI/CD): Cada mejora en el código se despliega automáticamente en segundos.
  - Cero costo de mantenimiento de hardware en planta.
- **Desventajas**: Requiere que la tablet tenga salida a Internet (mitigado por el modo PWA offline fallback).

### Opción 2: Servidor de Red Interna (LAN / Docker en Planta)
- **URL Unica Interna**: `http://custodia.micro.local` o `http://192.168.X.X`.
- **Arquitectura**: Container Docker (Nginx + Node.js + PostgreSQL) corriendo en un servidor local dentro de la red de la fábrica.
- **Ventajas**:
  - 100% independiente de la conexión a Internet externa.
  - Máxima privacidad y velocidad de red local.
- **Desventajas**:
  - El gerente o superiores fuera de la planta necesitan VPN para consultar las estadísticas.
  - Requiere mantenimiento y respaldo del servidor local.

### Cuadro Comparativo de Plataformas PAAS

| Plataforma | Tipo | Nivel Gratuito / Costo | Ventajas Clave |
| :--- | :--- | :--- | :--- |
| **Vercel** | Frontend + Serverless | Gratuito para producción | Despliegue instantáneo, PWA nativo, dominio personalizado |
| **Cloudflare Pages** | Frontend CDN | Gratuito ilimitado | Máxima velocidad de carga, protección DDoS |
| **Supabase** | Backend + PostgreSQL | Tier gratuito generoso | DB PostgreSQL real, Auth con JWT, API REST/Realtime automática |
| **Render / Railway** | Fullstack Containers | Tier gratuito / ~$5 mes | Excelente para backend Node.js persistente y workers de sync |
