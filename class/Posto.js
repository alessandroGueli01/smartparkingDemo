const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database'); 
class Posto extends Model {
    // 1. Creazione di un nuovo posto
    static async creaPosto(numeroPosto, prenotabile = true) {
        try {
            return await Posto.create({
                numero: numeroPosto,
                prenotabile,
                occupato: false,
            });
        } catch (error) {
            throw new Error('Errore nella creazione del posto: ' + error.message);
        }
    }

    // 2. Modifica disponibilità del posto
    static async modificaDisponibilita(idPosto, prenotabile) {
        try {
            const posto = await Posto.findByPk(idPosto);
            if (!posto) throw new Error('Posto non trovato.');

            posto.prenotabile = prenotabile;
            await posto.save();

            return { messaggio: `Disponibilità del posto ${posto.numero} aggiornata.`, posto };
        } catch (error) {
            throw new Error('Errore nella modifica della disponibilità: ' + error.message);
        }
    }

    // 3. Verifica posti disponibili (prenotabili e liberi)
    static async postiDisponibili() {
        try {
            return await Posto.findAll({
                where: { prenotabile: true, occupato: false },
            });
        } catch (error) {
            throw new Error('Errore nella verifica dei posti disponibili: ' + error.message);
        }
    }

    // 4. Elimina un posto dal sistema
    static async eliminaPosto(idPosto) {
        try {
            const posto = await Posto.findByPk(idPosto);
            if (!posto) throw new Error('Posto non trovato.');

            await posto.destroy();
            return { messaggio: `Posto ${posto.numero} eliminato con successo.` };
        } catch (error) {
            throw new Error('Errore nell\'eliminazione del posto: ' + error.message);
        }
    }
}

// Inizializzazione del modello Sequelize
Posto.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    numero: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    prenotabile: { type: DataTypes.BOOLEAN, defaultValue: true },
    occupato: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize,
    modelName: 'Posto',
    tableName: 'Posti',
    timestamps: false,
});

module.exports = Posto;
