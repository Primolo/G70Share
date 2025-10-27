import React, { useEffect } from 'react';
import { supabase } from './supabaseClient'; 

const SessionHandler = () => {
    useEffect(() => {
        // Nettoie l'URL des fragments de jeton après connexion
        if (window.location.hash) {
            // Regarde si le jeton est dans le hash (ex: #access_token=...)
            if (window.location.hash.includes('access_token')) {
                // Nettoie l'URL pour un affichage propre sans perdre la session.
                window.history.replaceState(null, null, window.location.pathname);
            }
        }
        
        // La fonction onAuthStateChange dans App.jsx gère l'état
        // après que le jeton est intercepté et nettoyé.
    }, []);

    return null; 
};

export default SessionHandler;
