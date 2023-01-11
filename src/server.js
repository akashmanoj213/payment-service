const http = require('http');

//load environment variables from .env
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ override: "true" });
}

const app = require('./app');

// const { testConnection, createTables } = require('./services/database');
//Test db connection
// await testConnection();

//Initialise DB table - create tables if not present
// await createTables();

const port = parseInt(process.env.PORT) || 8080;

const server = http.createServer(app);

server.listen(port, () => console.log(`App listening on port: ${port}...`));