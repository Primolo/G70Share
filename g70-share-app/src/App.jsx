import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import du client isolé et stable
import Booking from './Booking'; 
import SessionHandler from './SessionHandler';

const UL_ID_G70 = 1; // ID de l'ULM


// ----------------------------------------------------
// COMPOSANT AUTH : Page de connexion
// ----------------------------------------------------
const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({ 
        email: email, 
        options: { shouldCreateUser: true } 
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
// COMPOSANT DASHBOARD : Affichage principal
// ----------------------------------------------------
const Dashboard = ({ session }) => {
    const [pilote, setPilote] = useState(null);
    const [ulmStatus, setUlmStatus] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // 1. Récupère les données du pilote 
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
        
        // 3. Écouteur en temps réel sur la table ULM 
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
                <Booking piloteId={pilote.id} />
            )}
        </div>
    );
};


// ----------------------------------------------------
// COMPOSANT PRINCIPAL (App) : Gère le Routing de Session
// ----------------------------------------------------
function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tente de récupérer la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Mise en place d'un écouteur pour les changements d'état (connexion/déconnexion)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
        if (subscription) {
            subscription.unsubscribe();
        }
    };
  }, []);
  
  if (loading) {
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
