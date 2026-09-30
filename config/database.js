/*const { Sequelize } = require('sequelize');

// Configurazione connessione database
const sequelize = new Sequelize('pissir', 'postgres', 'Soloyoelnegro23!', {
    host: 'localhost',
    dialect: 'postgres',  // Specifica che stai usando PostgreSQL
    logging: false,       // Evita di stampare le query nel terminale
});

// Funzione per verificare la connessione
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connessione al database riuscita.');
    } catch (error) {
        console.error('❌ Errore di connessione al database:', error);
    }
}

testConnection();  // Test della connessione

module.exports = sequelize;*/


const { Sequelize } = require("sequelize");



// Se Jest sta eseguendo i test, usa un database mock
const isTest = process.env.NODE_ENV === 'test';

const sequelize = isTest
    ? new Sequelize('sqlite::memory:', { logging: false }) // Database in memoria per i test
    : new Sequelize('pissir', 'postgres', 'Soloyoelnegro23!', {
        host: 'localhost',
        dialect: 'postgres',
        logging: false,
    });

/*nc () => {
    if (!sequelize) {
        throw new Error("❌ Sequelize non è stato inizializzato correttamente.");
    }
    await sequelize.sync({ force: true });
});
*/

module.exports = { sequelize };
