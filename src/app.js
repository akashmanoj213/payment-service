const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./api/routes/payment');
const loggerMiddleware = require('./api/middlewares/loggerMiddleware');
const errorHandler = require('./api/middlewares/errorHandler');

const app = express();

//Application Middlewares
app.use(loggerMiddleware);

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send('Api is working properly!');
});

//Routes
app.use('/payment', paymentRoutes);

//Global Error handling
app.use(errorHandler);

module.exports = app;