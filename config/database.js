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


module.exports = { sequelize };
