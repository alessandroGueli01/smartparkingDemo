const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Utente = require('./Utente'); // Importa il modello Utente

class Ricarica extends Model {

  // Funzione per aggiungere una ricarica in coda
  static async aggiungiInCoda(idUtente, percentualeFinale)
  {
    const utente = await Utente.findByPk(idUtente);
    if (!utente) throw new Error('Utente non trovato.');

    const priorita = utente.tipo === 'premium' ? 1 : 2; // Priorità per utenti premium

    return await Ricarica.create({
      utenteId: idUtente,
      percentualeFinale,
      stato: 'in coda',
      priorita,
    });
  }

  // Funzione per aggiornare lo stato della ricarica
  static async aggiornaStatoRicarica(idRicarica, nuovoStato)
  {
    const ricarica = await Ricarica.findByPk(idRicarica);
    if (!ricarica) throw new Error('Ricarica non trovata.');

    ricarica.stato = nuovoStato;
    await ricarica.save();
    return { messaggio: `Stato ricarica aggiornato a ${nuovoStato}.` };
  }
}

Ricarica.init({
  durata: { type: DataTypes.INTEGER, allowNull: false }, // Durata della ricarica in minuti
  percentualeIniziale: { type: DataTypes.FLOAT, allowNull: false },
  percentualeFinale: { type: DataTypes.FLOAT, allowNull: false },
  costo: { type: DataTypes.FLOAT, allowNull: false },
  stato: { type: DataTypes.STRING, defaultValue: 'in coda' }, // Stati: 'in coda', 'in corso', 'completata'
  priorita: { type: DataTypes.INTEGER, allowNull: false }, // Priorità della ricarica (1 per premium, 2 per base)
  utenteId: {
    type: DataTypes.INTEGER,
    references: { model: 'Utente', key: 'id' },
    unique: true, // Garantisce che un utente possa avere solo una ricarica
  },
}, {
  sequelize,
  modelName: 'Ricarica',
  tableName: 'Ricariche', // Definisce il nome della tabella
  timestamps: false,
});


Utente.hasOne(Ricarica, { foreignKey: 'utenteId' });
Ricarica.belongsTo(Utente, { foreignKey: 'utenteId' });

module.exports = Ricarica;
