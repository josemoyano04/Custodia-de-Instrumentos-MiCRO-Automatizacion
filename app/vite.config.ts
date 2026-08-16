import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        id: "/",
        name: "Custodia de Instrumentos · MiCRO Automatización",
        short_name: "Custodia MiCRO",
        description: "Sistema de gestión de custodia e inventario de instrumentos de medición para planta de producción",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["fullscreen", "standalone", "minimal-ui"],
        orientation: "any",
        theme_color: "#01b2fe",
        background_color: "#d0eeff",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
