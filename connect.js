const mysql = require('mysql');

const connection = mysql.createConnection({
host: 'localhost', 
user:'root', 
database:'namnueafeedstore', 
password:'' 
});

module.exports = connection;