const Utente = require("../class/Utente");
const Prenotazione = require("../class/Prenotazione");
const Parcheggio = require("../class/Parcheggio");
const Posto = require("../class/Posto");
const Sosta = require("../class/Sosta")

class PrenotazioneService {
    // Creazione di una nuova prenotazione
    static async creaPrenotazione(idUtente, idPosto, targaAuto, orario, durata) {
    try 
    {
        const utente = await Utente.findByPk(idUtente);
        
        if (!utente)return Promise.reject(new Error("Utente non trovato.")); //  Lancia errore

        const posto = await Posto.findOne({ where: { id: idPosto, prenotabile: true, occupato: false } });


        if (!posto)  return Promise.reject(new Error("Posto non disponibile.")); // 🔹 Usa `Promise.reject`

        const prenotazioniAttuali = await Prenotazione.count ? await Prenotazione.count({ where: { id_posto: idPosto } }) : 0;
        if (prenotazioniAttuali >= 1) throw new Error("Limite prenotazioni raggiunto per questo posto.");

        posto.occupato = true;
        await posto.save();

        return await Prenotazione.create({
            dataPrenotazione: new Date(),
            targaAuto,
            orario,
            durata,
            id_utente: idUtente,
            id_posto: idPosto
        });

    } catch (error) {
        console.error("❌ Errore in creaPrenotazione:", error.message);
        throw error;  // 🔹 Usa `Promise.reject`
    }
}


    // Cancellazione di una prenotazione
    static async cancellaPrenotazione(idPrenotazione) 
    {
        const prenotazione = await Prenotazione.findByPk(idPrenotazione);
        if (!prenotazione) throw new Error("Prenotazione non trovata.");
        
        const posto = await Posto.findByPk(prenotazione.id_posto);
        if (posto) {
            posto.occupato = false;
            await posto.save();
        }
        
        await prenotazione.destroy();
        return { messaggio: "Prenotazione cancellata con successo." };
    }

    // Recupero delle prenotazioni di un utente
    static async getPrenotazioniUtente(idUtente) {
        return await Prenotazione.findAll({ where: { id_utente: idUtente } });
    }

    // Recupero di una singola prenotazione
    static async getPrenotazione(idPrenotazione) {
        return await Prenotazione.findByPk(idPrenotazione);
    }

}

module.exports = PrenotazioneService;
