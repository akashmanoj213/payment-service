const { Sequelize } = require('sequelize');
const { logger } = require('./logger');

const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASS;

const config = {
    // 'connectionLimit' is the maximum number of connections the pool is allowed
    // to keep at once.
    connectionLimit: 5,
    // 'connectTimeout' is the maximum number of milliseconds before a timeout
    // occurs during the initial connection to the database.
    connectTimeout: 10000, // 10 seconds
    // 'acquireTimeout' is the maximum number of milliseconds to wait when
    // checking out a connection from the pool before a timeout error occurs.
    acquireTimeout: 10000, // 10 seconds
    // 'waitForConnections' determines the pool's action when no connections are
    // free. If true, the request will queued and a connection will be presented
    // when ready. If false, the pool will call back with an error.
    waitForConnections: true, // Default: true
    // 'queueLimit' is the maximum number of requests for connections the pool
    // will queue at once before returning an error. If 0, there is no limit.
    queueLimit: 0, // Default: 0
    //Unix socket path
    socketPath: process.env.INSTANCE_UNIX_SOCKET
};

const sequelize = new Sequelize(database, username, password, {
    dialect: 'postgres',
    host: process.env.INSTANCE_UNIX_SOCKET,
    dialectOptions: {
        ...config
    },
    pool: {
        max: 5
    },
    logging: msg => logger.debug(msg),
    define: {
        underscored: true
    }
});

const modelDefiners = [
	require('../models/database/PaymentHistory')
    // Add more models here...
	// require('./models/database/item'),
];


// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Connection has been established successfully.');
    } catch (err) {
        logger.error(err, 'Unable to connect to the database.');
        throw err;
    }
}

const createTables = async () => {
    try {
        await sequelize.sync();
        logger.info('All tables were created successfully');
    } catch (err) {
        logger.error(err, 'Error occured while syncing database.');
        throw err;
    }
}

module.exports = {
    sequelize,
    models: sequelize.models,
    testConnection,
    createTables
};