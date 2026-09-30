const { sequelize } = require('../config/database');
const Utente = require('./Utente');
const Sosta = require('./Sosta');
const Parcheggio = require('./Parcheggio');
const Posto = require('./Posto');
const Pagamento = require('./Pagamento'); // Assicurati che questo sia il percorso corretto

// Associazioni
Utente.hasOne(Sosta, { foreignKey: 'id_utente' });
Sosta.belongsTo(Utente, { foreignKey: 'id_utente' });

Utente.hasMany(Pagamento, { foreignKey: 'idUtente' });
Pagamento.belongsTo(Utente, { foreignKey: 'idUtente' });

Parcheggio.hasMany(Posto, { foreignKey: 'id_parcheggio' });
Posto.belongsTo(Parcheggio, { foreignKey: 'id_parcheggio' });

Posto.hasOne(Sosta, { foreignKey: 'id_posto' });
Sosta.belongsTo(Posto, { foreignKey: 'id_posto' });

const syncDatabase = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log("✅ Database sincronizzato con i modelli.");
    } catch (error) {
        console.error("❌ Errore nella sincronizzazione del database:", error);
    }
};

module.exports = { sequelize, Utente, Sosta, Parcheggio, Posto, Pagamento };
