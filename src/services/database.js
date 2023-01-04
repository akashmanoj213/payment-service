const mysql = require('promise-mysql');
const {logger} = require('../api/middlewares/logger');

// Database Connection for Development

// let connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASS
// });

// logger.info("DB_HOST", process.env.DB_HOST);

//   connection.connect(function(err) {
//     if (err) {
//         logger.error(err, 'Error connecting: ' + err.stack);
//       throw err;
//     }
//     logger.info('Connected as thread id: ' + connection.threadId);
//   });

logger.info('UNIX SOCKET : ', process.env.INSTANCE_UNIX_SOCKET);

let pool = mysql.createPool({
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME, // e.g. 'my-database'
    socketPath: process.env.INSTANCE_UNIX_SOCKET // e.g. '/cloudsql/project:region:instance'
  });

  module.exports = pool;