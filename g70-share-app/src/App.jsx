import { createClient } from '@supabase/supabase-js'
import React, { useState } from 'react'

// ÉTAPE 4 : REMPLACER PAR VOS CLÉS TROUVÉES DANS LE DASHBOARD SUPABASE
const supabaseUrl = 'https://ikileeetvexzkybwzuxv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlraWxlZWV0dmV4emt5Ynd6dXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjE3ODYsImV4cCI6MjA3NjE5Nzc4Nn0._Zabpl-p9hMGyQUVZIeNAz40qmpqTt4QM2yQo7YV0Fg' 

const supabase = createClient(supabaseUrl, supabaseAnonKey)

function App() {
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
      <p>Entrez votre email pour recevoir votre lien de connexion.</p>
      
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Votre adresse email de pilote"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', margin: '10px 0' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: loading ? '#007bff' : '#ccc', 
            color: 'white', 
            border: 'none' 
          }}
        >
          {loading ? 'Envoi...' : 'Recevoir le lien magique'}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '15px', color: message.startsWith('Erreur') ? 'red' : 'green' }}>{message}</p>}
    </div>
  )
}

export default App
