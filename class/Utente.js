const { Model,DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sosta = require('./Sosta');
const Pagamento = require('./Pagamento');  // Importare il modello Pagamento
const Ricarica = require('./Ricarica');
const mqttClient = require('../config/mqtt');
const bcrypt = require('bcrypt');

class Utente extends Model 
{
    static async register(data) 
    {
        return await Utente.create(data);
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
        return await Utente.create(data);
    }

    static async login(username, password) {
        const user = await Utente.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Credenziali non valide.');
        }
        return user;
    }

    static async richiediRicarica(idUtente, livelloDesiderato) {
        const autoInCoda = await Ricarica.count({ where: { stato: 'in coda' } }); // potremmo memorizzarlo nel db
        const tempoStimato = autoInCoda * 30; // Esempio: 30 minuti per auto

        return {
            autoInCoda,
            tempoStimato,
            messaggio: `Ci sono ${autoInCoda} auto in coda. Tempo stimato: ${tempoStimato} minuti.`,
        };
    }

    static async accettaRicarica(idUtente, percentualeFinale, costoStimato) {
        return await Ricarica.create({
            utenteId: idUtente,
            percentualeFinale,
            costo: costoStimato,
            stato: 'in coda',
        });
    }

    static async inviaNotifica(idUtente, messaggio) {
        // Cerca l'utente
        const utente = await Utente.findByPk(idUtente);
        if (!utente) throw new Error('Utente non trovato.');

        // Configura il topic per MQTT
        const topic = `notifiche/utente/${idUtente}`;

        // Prova a inviare la notifica tramite MQTT
        if (mqttClient && mqttClient.connected) {
            mqttClient.publish(topic, messaggio, (error) => {
                if (error) {
                    console.error('Errore nell\'invio della notifica MQTT:', error);
                } else {
                    console.log(`Notifica inviata via MQTT a ${topic}: ${messaggio}`);
                }
            });
        } else {
            // Fallback: stampa email o telefono
            if (!utente.email && !utente.numeroTelefono) {
                throw new Error('Contatto utente non disponibile.');
            }
            console.log(`Notifica inviata a ${utente.email || utente.numeroTelefono}: ${messaggio}`);
        }
    }
    
    static async logout(idUtente) 
    {
        //FARE 
        // Potresti gestire l'invalidazione della sessione con un token (JWT o simili)
        console.log(`Utente ${idUtente} ha effettuato il logout.`);
        return { messaggio: 'Logout effettuato con successo.' };
    }

    static async cancellaAccount(idUtente) 
    {
        const utente = await Utente.findByPk(idUtente);
        if (!utente) throw new Error('Utente non trovato.');
        await utente.destroy();
        return { messaggio: 'Account eliminato con successo.' };
    }

}


class Premium extends Utente 
{
    // Funzioni specifiche per l'utente premium
    static async consultaDisponibilitaPosti() {
        const postiDisponibili = await Posto.findAll({ where: { prenotabile: true, occupato: false } });
        return postiDisponibili;
    }

    static async prenotaPosto(idUtente, idPosto, durata, costoOrario, cartaDiCredito) {
    const transaction = await sequelize.transaction();
    try {
        // 1. Blocca il posto (verifica se è prenotabile e non occupato)
        const posto = await Posto.findOne({
            where: { id: idPosto, prenotabile: true, occupato: false },
            lock: true, // Blocca la riga per evitare conflitti
            transaction,
        });

        if (!posto) {
            throw new Error('Posto non disponibile o già occupato.');
        }

        // Segna il posto come occupato
        posto.occupato = true;
        await posto.save({ transaction });

        // 2. Calcola il costo totale della sosta
        const oraInizio = new Date();
        const oraFine = new Date(oraInizio.getTime() + durata * 60000); // Aggiunge la durata in minuti
        const costoTotale = (durata / 60) * costoOrario; // Converti la durata in ore e calcola il costo

        // 3. Registra il pagamento
        const pagamento = await Pagamento.creaPagamento({
            costoTotale,
            cartaDiCredito,
            utenteId: idUtente,
            tipoPagamento: 'prenotazione',
        });

        // 4. Crea la sosta associata
        const nuovaSosta = await Sosta.creaSosta(
            oraInizio,    // Orario di inizio
            oraFine,      // Orario di fine
            costoTotale,  // Costo totale calcolato
            idPosto,      // ID del posto associato
            idUtente,     // ID dell'utente
            { transaction }
        );

        // 5. Commit della transazione
        await transaction.commit();

        return {
            messaggio: `Posto ${posto.numero} prenotato con successo.`,
            idPosto: posto.id,
            sostaId: nuovaSosta.id_sosta,
            pagamentoId: pagamento.idPagamento,
            oraInizio,
            oraFine,
            costoTotale,
        };
    } catch (error) {
        // Rollback della transazione in caso di errore
        await transaction.rollback();
        throw error;
    }
}


    static async gestisciCancellazioneAutomatica(idPrenotazione, tempoTolleranza) {
        const sosta = await Sosta.findByPk(idPrenotazione);
        if (!sosta) throw new Error('Prenotazione non trovata.');

        const tempoMassimo = new Date(sosta.orario_inizio.getTime() + tempoTolleranza * 60000);
        if (new Date() > tempoMassimo) {
            await sosta.destroy(); // Cancella la prenotazione
            return { messaggio: 'Prenotazione cancellata e addebitata.' };
        }

        return { messaggio: 'Prenotazione ancora valida.' };
    }
}

class Amministratore extends Utente 
{
    static async monitoraggioPosti() {
        return await Posto.findAll();
    }

    static async aggiornaCosti(nuoviCosti) {
    for (const [chiave, valore] of Object.entries(nuoviCosti)) {
        if (typeof valore !== 'number' || valore <= 0) {
            throw new Error(`Valore non valido per ${chiave}: ${valore}`);
        }
        await Costi.upsert({ nome: chiave, valore });
    }
}

    static async visualizzaPagamenti(intervallo) {
        const dataInizio = new Date(new Date().getTime() - intervallo * 86400000); // Intervallo in giorni
        return await Pagamento.findAll({ where: { createdAt: { [Op.gte]: dataInizio } } });
    }
}




// Definizione della tabella Utente
Utente.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    tipo: { type: DataTypes.ENUM('base', 'premium', 'amministratore'), allowNull: false },
}, { sequelize, modelName: 'Utente' });

module.exports = Utente;