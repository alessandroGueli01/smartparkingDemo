const { DataTypes, Model } = require('sequelize'); 
const sequelize = require('../config/database');
const Posto = require('./Posto');  

class Parcheggio extends Model {
    // Funzione per monitorare lo stato dei posti auto
    static async monitoraggioPosti() {
        return await Posto.findAll();
    }
}

// Inizializzazione del modello Parcheggio
Parcheggio.init({
    numeroPosti: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    postiPrenotabili: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Parcheggio',
});

module.exports = Parcheggio;
