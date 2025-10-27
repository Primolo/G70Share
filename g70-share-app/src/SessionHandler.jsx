import React, { useEffect } from 'react';
import { supabase } from './supabaseClient'; // <-- NOUVEL IMPORT
// ...

const SessionHandler = () => {
    useEffect(() => {
        // Cette fonction intercepte le jeton et établit la session si elle est trouvée
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                // S'il y a une session (le jeton est valide), nous ne faisons rien.
                // Le composant App.jsx prendra le relais via l'écouteur onAuthStateChange.
            } else {
                // Si l'URL contient un jeton que getSession n'a pas pu traiter,
                // il peut y avoir un problème, mais généralement, l'écouteur suffit.
            }
        });
        
        // Nettoie l'URL des fragments de jeton pour éviter la confusion
        if (window.location.hash) {
            // Empêche la boucle en réécrivant l'URL propre
            if (window.location.hash.includes('access_token')) {
                // Redirige vers l'URL sans le jeton de sécurité
                window.history.replaceState(null, null, window.location.pathname);
            }
        }
        
    }, []);

    // Ce composant ne rend rien visible, il gère juste la logique
    return null;
};

export default SessionHandler;
