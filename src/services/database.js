const mysql = require('mysql');

// Database Connection for Development

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS
});

  connection.connect(function(err) {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      throw err;
    }
    console.log('Connected as thread id: ' + connection.threadId);
  });

  module.exports = connection;