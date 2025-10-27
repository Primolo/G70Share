import { createClient } from '@supabase/supabase-js';

// ⚠️ REMPLACER PAR VOS CLÉS TROUVÉES DANS LE DASHBOARD SUPABASE
const supabaseUrl = 'https://ikileeetvexzkybwzuxv.supabase.co '
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraWxlZWV0dmV4emt5Ynd6dXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjE3ODYsImV4cCI6MjA3NjE5Nzc4Nn0._Zabpl-p9hMGyQUVZIeNAz40qmpqTt4QM2yQo7YV0Fg'  

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
