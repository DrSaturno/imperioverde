import { createClient } from '@supabase/supabase-js';

// Read variables from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export Supabase client. It will be null if variables are not defined.
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.log("Supabase Client: No se detectaron credenciales. Operando en MODO MOCK LOCAL.");
} else {
  console.log("Supabase Client: Conectado con éxito.");
}
