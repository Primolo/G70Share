// ----------------------------------------------------
// ⚠️ VOS CLÉS D'API SUPABASE (UNIQUE PAR PROJET)
// ----------------------------------------------------
const supabaseUrl = 'https://ikileeetvexzkybwzuxv.supabase.co '
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraWxlZWV0dmV4emt5Ynd6dXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjE3ODYsImV4cCI6MjA3NjE5Nzc4Nn0._Zabpl-p9hMGyQUVZIeNAz40qmpqTt4QM2yQo7YV0Fg'  

// Le client est exporté pour être utilisé partout.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Stockage robuste pour la compatibilité (Firefox, mobile)
        storage: window.sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});
