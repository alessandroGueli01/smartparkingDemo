const { DataTypes, Model } = require("sequelize");
const { sequelize }= require("../config/database"); 

class Prenotazione extends Model {}

Prenotazione.init(
  {
    dataPrenotazione: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    targaAuto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    orario: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    durata: {
      type: DataTypes.INTEGER,
      allowNull: false, // Durata in minuti
    },
    id_utente: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Utente",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    id_posto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Posto",
        key: "id",
      },
      onDelete: "SET NULL",
    },
  },
  {
    sequelize, // Assicurati di passare la connessione giusta
    modelName: "Prenotazione",
    tableName: "Prenotazioni",
    timestamps: false,
  }
);

module.exports = Prenotazione;
