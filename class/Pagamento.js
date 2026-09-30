const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Pagamento extends Model {}

Pagamento.init({
    idPagamento: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    costoTotale: { type: DataTypes.FLOAT, allowNull: false },
    cartaDiCredito: { type: DataTypes.STRING, allowNull: false },
    idUtente: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { model: 'Utente', key: 'id' }
    },
    dataOrario: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { sequelize, modelName: 'Pagamento' });

module.exports = Pagamento;

