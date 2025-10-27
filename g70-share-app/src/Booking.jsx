import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import du client isolé

const UL_ID_G70 = 1; // ID de l'ULM (Assumé ID 1)

const Booking = ({ piloteId }) => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDateTime = (isoString) => {
        return new Date(isoString).toLocaleString('fr-FR', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const fetchReservations = async () => {
        const today = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('reservations')
            .select(`*, pilotes (nom_complet)`)
            .eq('ulm_id', UL_ID_G70)
            .gte('fin_reservation', today) 
            .order('debut_reservation', { ascending: true });

        if (error) {
            console.error("Erreur de chargement des réservations:", error);
            setError("Erreur de chargement du calendrier.");
        } else {
            setReservations(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReservations();

        // 🟢 Écouteur en temps réel (pour l'évolutivité)
        const subscription = supabase
            .channel('reservations_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
                fetchReservations(); 
            })
            .subscribe();

        return () => {
            supabase.removeChannel(supabase.getChannelByTopic('reservations_channel'));
        }
    }, []);

    // ➡️ Fonction de test rapide pour réservation
    const handleNewReservation = async () => {
        const startInput = prompt("DÉBUT (AAAA-MM-JJ HH:MM:SS) : ");
        const endInput = prompt("FIN (AAAA-MM-JJ HH:MM:SS) : ");
        
        if (!startInput || !endInput) return;

        const { error } = await supabase
            .from('reservations')
            .insert([{ 
                ulm_id: UL_ID_G70, 
                pilote_id: piloteId,
                debut_reservation: new Date(startInput).toISOString(),
                fin_reservation: new Date(endInput).toISOString()
            }]);

        if (error) {
            alert(`Erreur: ${error.message}. Vérifiez le format (AAAA-MM-JJ HH:MM:SS).`);
        } else {
            alert("Réservation enregistrée !");
        }
    };

    if (loading) return <p>Chargement du Calendrier...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <section style={{ marginTop: '30px', border: '1px solid #007bff', padding: '20px', borderRadius: '8px' }}>
            <h2 style={{ borderBottom: '1px dashed #007bff', paddingBottom: '10px' }}>
                Calendrier de Réservation G70
                <button 
                    onClick={handleNewReservation} 
                    style={{ float: 'right', padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                >
                    Réserver un Vol (TEST)
                </button>
            </h2>
            {reservations.length === 0 ? (
                <p>Aucune réservation prévue pour le moment.</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {reservations.map((res) => (
                        <li key={res.id} style={{ padding: '10px', borderLeft: res.pilote_id === piloteId ? '5px solid #007bff' : '5px solid #ccc', marginBottom: '5px', backgroundColor: 'white', borderRadius: '4px' }}>
                            **{formatDateTime(res.debut_reservation)}** à **{formatDateTime(res.fin_reservation)}** — 
                            Réservé par: **{res.pilotes ? res.pilotes.nom_complet : "Pilote Inconnu"}**
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default Booking;
