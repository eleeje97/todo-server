const mysql = require('mysql');
const dbConfig = require('./dbConfig');

const connection = mysql.createConnection({
    host: dbConfig.HOST,
    port: dbConfig.POST,
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB
});

connection.connect();

module.exports = connection;