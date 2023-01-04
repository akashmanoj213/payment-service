const mysql = require('mysql');
const {logger} = require('../api/middlewares/logger')

// Database Connection for Development

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASS
});

logger.info("DB_HOST", process.env.DB_HOST);

  connection.connect(function(err) {
    if (err) {
        logger.error(err, 'Error connecting: ' + err.stack);
      throw err;
    }
    logger.info('Connected as thread id: ' + connection.threadId);
  });

  module.exports = connection;