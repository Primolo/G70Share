import { createClient } from '@supabase/supabase-js';

// ⚠️ REMPLACER PAR VOS CLÉS TROUVÉES DANS LE DASHBOARD SUPABASE
const supabaseUrl = 'VOTRE_URL_SUPABASE'; 
const supabaseAnonKey = 'VOTRE_CLÉ_ANON_SUPABASE'; 

// Initialisation du client Supabase. EXPORTÉ SEUL.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Maintient la persistance de session sur la durée de vie du navigateur
        storage: window.sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
