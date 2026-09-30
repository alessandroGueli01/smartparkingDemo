const { Model, DataTypes  } = require('sequelize');
const sequelize = require('../config/database');


class Sosta extends Model {
    // Funzione per creare una nuova sosta
    static async creaSosta(idUtente, idPosto, orarioInizio, durataMinuti) {
        const transaction = await sequelize.transaction();
        try {
            // 1. Verifica e blocco del posto
            const posto = await Posto.findOne({
                where: { id: idPosto, occupato: false },
                lock: true,
                transaction,
            });
            if (!posto) throw new Error('Posto non disponibile.');

            // Blocca il posto
            posto.occupato = true;
            await posto.save({ transaction });

            // 2. Creazione della sosta
            const orarioFine = new Date(orarioInizio.getTime() + durataMinuti * 60000);

            const nuovaSosta = await Sosta.create({
                id_posto: idPosto,
                id_utente: idUtente,
                orario_inizio: orarioInizio,
                orario_fine: orarioFine,
                costo: 1.50, // Costo iniziale, aggiornato in un secondo momento
                stato: 'attiva', // Stato della sosta
            }, { transaction });

            await transaction.commit();
            return nuovaSosta;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Altre funzioni come terminaSosta, getSostaId e confermaSosta rimangono invariate...
}


// Definizione della tabella Sosta
Sosta.init({
    id_sosta: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    orario_inizio: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    orario_fine: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    costo: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    stato: {
        type: DataTypes.ENUM('attiva', 'terminata', 'confermata'),
        allowNull: false,
        defaultValue: 'attiva',
    },
    id_posto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Posto',
            key: 'id',
        },
    },
    id_utente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Utente',
            key: 'id',
        },
    },
}, {
    sequelize,
    modelName: 'Sosta',
    tableName: 'Soste',
    timestamps: false,
});

module.exports = Sosta;

const Posto = require('./Posto');
const Utente = require('./Utente');

Sosta.belongsTo(Utente, { foreignKey: 'id_utente' });
Sosta.belongsTo(Posto, { foreignKey: 'id_posto' });


