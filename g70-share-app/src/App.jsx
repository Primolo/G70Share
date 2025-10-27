import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react'
import Booking from './Booking'; // Import du composant de réservation
import SessionHandler from './SessionHandler';
import { supabase } from './supabaseClient'; // <-- NOUVEL IMPORT
// ...
const UL_ID_G70 = 1; // Garder la ligne ID ULM
// ...

// REMPLACER PAR VOS CLÉS TROUVÉES DANS LE DASHBOARD SUPABASE
//const supabaseUrl = 'https://ikileeetvexzkybwzuxv.supabase.co '
//const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraWxlZWV0dmV4emt5Ynd6dXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjE3ODYsImV4cCI6MjA3NjE5Nzc4Nn0._Zabpl-p9hMGyQUVZIeNAz40qmpqTt4QM2yQo7YV0Fg' 

//export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
 //   auth: {
 //       storage: window.sessionStorage,
 //       autoRefreshToken: true,
 //       persistSession: true,
  //      detectSessionInUrl: true
  //  }
//})


// ----------------------------------------------------
// 2. COMPOSANT AUTH : Gère la page de connexion
// ----------------------------------------------------
const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Utilisation de signInWithOtp (OTP par email sur téléphone, ou lien magique)
    const { error } = await supabase.auth.signInWithOtp({ 
        email: email, 
        options: { 
            
            shouldCreateUser: true // Assure la création d'un utilisateur si nouveau pilote
        } 
    });

    if (error) {
      setMessage(`Erreur : ${error.message}`);
      setLoading(false);
    } else {
      setMessage('Lien de connexion ou code envoyé ! Vérifiez votre email.');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>G70 Share Pilot - Connexion</h1>
      <p>Entrez votre email pour recevoir votre lien ou code de connexion.</p>
      
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Votre adresse email de pilote"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: loading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          {loading ? 'Envoi...' : 'Recevoir le lien/code'}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '15px', color: message.startsWith('Erreur') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
};


// ----------------------------------------------------
// 3. COMPOSANT DASHBOARD : Affiche les données du G70 et le pilote
// ----------------------------------------------------
const Dashboard = ({ session }) => {
    const [pilote, setPilote] = useState(null);
    const [ulmStatus, setUlmStatus] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Récupère les données du pilote depuis la table 'pilotes'
            const { data: piloteData } = await supabase
                .from('pilotes')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            setPilote(piloteData);

            // 2. Récupère le statut de l'ULM
            const { data: ulmData } = await supabase
                .from('ulm_flotte')
                .select('*')
                .eq('id', UL_ID_G70)
                .single(); 

            setUlmStatus(ulmData);
            setLoadingData(false);
        };

        fetchData();
        
        // 3. Écouteur en temps réel sur la table ULM (mise à jour des heures/carburant)
        const ulmSubscription = supabase
            .channel('ulm_status_channel')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ulm_flotte' }, payload => {
                if(payload.new.id === UL_ID_G70) {
                    setUlmStatus(payload.new);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(ulmSubscription);
    }, [session.user.id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };
    
    if (loadingData) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Chargement des données du G70...</div>;
    }


    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
                <h1>Tableau de Bord G70</h1>
                <div>
                    <span style={{ marginRight: '15px' }}>Bonjour, 
                        <strong>{pilote ? pilote.nom_complet : session.user.email}</strong>
                    </span>
                    <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <section style={{ marginTop: '30px' }}>
                <h2>Statut du G70 ({ulmStatus ? ulmStatus.immatriculation : 'N/A'})</h2>
                
                {ulmStatus ? (
                    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', border: '1px solid #007bff', borderRadius: '8px', marginTop: '15px', textAlign: 'center' }}>
                        <div>
                            <strong>Heures Tachymétriques :</strong>
                            <p style={{ fontSize: '2em', margin: '5px 0' }}>{ulmStatus.heures_tachymetre.toFixed(1)} h</p>
                        </div>
                        <div>
                            <strong>Carburant Restant :</strong>
                            <p style={{ fontSize: '2em', margin: '5px 0' }}>{ulmStatus.carburant_restant.toFixed(1)} L</p>
                        </div>
                        <div>
                            <strong>Statut Technique :</strong>
                            <p style={{ fontSize: '2em', margin: '5px 0', color: ulmStatus.statut_technique === 'GO' ? 'green' : 'red' }}>
                                {ulmStatus.statut_technique}
                            </p>
                        </div>
                    </div>
                ) : <p>Impossible de charger le statut de l'ULM.</p>}
            </section>
            
            <section style={{ marginTop: '30px' }}>
                <h2>Votre Compte Pilote</h2>
                <p><strong>Solde Financier (Heures de Vol) :</strong> {pilote ? `${pilote.solde_financier.toFixed(2)} €` : 'N/A'}</p>
            </section>

            {/* Intégration du composant de Réservation */}
            {ulmStatus && pilote && (
                <Booking ulmId={ulmStatus.id} piloteId={pilote.id} />
            )}
        </div>
    );
};


// ----------------------------------------------------
// 4. COMPOSANT PRINCIPAL (App) : Gère la Session
// ----------------------------------------------------

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // ... (Reste inchangé)

  if (loading) {
    // Ajout du SessionHandler même pendant le chargement
    return (
        <>
            <SessionHandler /> 
            <div style={{ padding: '20px', textAlign: 'center' }}>Initialisation du système de navigation...</div>
        </>
    );
  }

  // Si une session existe, affiche le Dashboard
  if (session) {
    return (
        <>
            <SessionHandler /> 
            <Dashboard session={session} />
        </>
    );
  }

  // Sinon, affiche la page de connexion
  return (
        <>
            <SessionHandler /> 
            <Auth />
        </>
    );
}

export default App;
