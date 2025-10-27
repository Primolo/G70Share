import { createClient } from '@supabase/supabase-js'
import React, { useState, useEffect } from 'react'

// REMPLACER PAR VOS CLÉS TROUVÉES DANS LE DASHBOARD SUPABASE
const supabaseUrl = 'VOTRE_URL_SUPABASE' 
const supabaseAnonKey = 'VOTRE_CLÉ_ANON_SUPABASE' 

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ----------------------------------------------------
// NOUVEAU COMPOSANT : PAGE DE CONNEXION (Séparée pour la clarté)
// ----------------------------------------------------
const Auth = ({ setSession }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({ 
        email: email, 
        options: { emailRedirectTo: window.location.origin } 
    })

    if (error) {
      setMessage(`Erreur : ${error.message}`)
      setLoading(false)
    } else {
      setMessage('Lien de connexion envoyé ! Vérifiez votre email.')
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>G70 Share Pilot - Connexion</h1>
      <p>Entrez votre email pour recevoir votre lien magique.</p>
      
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
            cursor: 'pointer'
          }}
        >
          {loading ? 'Envoi...' : 'Recevoir le lien magique'}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '15px', color: message.startsWith('Erreur') ? 'red' : 'green' }}>{message}</p>}
    </div>
  )
}

// ----------------------------------------------------
// NOUVEAU COMPOSANT : TABLEAU DE BORD (Contenu temporaire)
// ----------------------------------------------------
const Dashboard = ({ session }) => {
    const handleLogout = async () => {
        await supabase.auth.signOut()
        // La page se rechargera et renverra à la page de connexion grâce à useEffect
    }

    // Affichons les infos de l'utilisateur pour vérifier la connexion
    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h1>✅ Connecté : Tableau de Bord G70</h1>
            <p>Bonjour, **{session.user.email}** ! Vous êtes bien connecté.</p>
            <p>UUID utilisateur : {session.user.id}</p>
            
            <button onClick={handleLogout} style={{ padding: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>
                Déconnexion
            </button>

            <h2 style={{ marginTop: '30px' }}>Prochaines étapes de codage :</h2>
            <ul>
                <li>Affichage des heures tachymétriques du G70.</li>
                <li>Système de réservation.</li>
                <li>Formulaire d'enregistrement de vol.</li>
            </ul>
        </div>
    )
}


// ----------------------------------------------------
// COMPOSANT PRINCIPAL : Gère la Session
// ----------------------------------------------------
function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Gérer l'URL de retour (au cas où le lien magique est utilisé)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 2. Mettre en place un écouteur de session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])
  
  if (loading) {
    return <div style={{ padding: '20px' }}>Chargement de l'application...</div>
  }

  // Si une session existe (utilisateur est connecté), affiche le Dashboard
  if (session) {
    return <Dashboard session={session} />
  }

  // Sinon (pas de session), affiche la page de connexion
  return <Auth setSession={setSession} />
}

export default App
