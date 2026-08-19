import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();

export const supabase = (supabaseUrl && supabasePublishableKey)
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;

if (supabase) {
  console.log(`🔌 [SUPABASE] Conectado exitosamente a: ${supabaseUrl}`);
} else {
  console.warn(
    "⚠️ [SUPABASE] Cliente no inicializado. Verificá que existan VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY en tu archivo .env / .env.local y reiniciá el servidor de desarrollo (npm run dev)."
  );
}


