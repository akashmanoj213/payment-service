const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./api/routes/payment');
const lb = require('@google-cloud/logging-bunyan');
const uuid = require("uuid");

// const { logger } = require('./api/middlewares/logger');
// const uuid = require("uuid");

// const app = express();

// //Application Middlewares
// app.use((req, res, next) => {
//     req.log = logger.child({ req_id: uuid.v4() }, true);
//     req.log.info({
//         httpRequest: {
//             status: res.statusCode,
//             requestUrl: req.url,
//             requestMethod: req.method,
//         }
//     });
//     res.on("finish", () => req.log.info({ res }));
//     next();
// });

// app.use(express.json());
// app.use(cors());
// app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//     res.status(200).send('Hello, world!').end();
// });

// //Routes
// app.use('/payment', paymentRoutes);

// app.use((err, req, res, next) => {
//     req.log.error({ err });
//     return res.status(500).json("Internal Server Error");
// });

async function setMiddleWare() {
    const { logger, mw } = await lb.express.middleware({
        logName: 'payment_service',
    });
    const app = express();

    //Application Middlewares
    app.use(mw);

    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));

    app.get('/', (req, res) => {
        res.status(200).send('Api is working properly!');
    });

    //Routes
    app.use('/payment', paymentRoutes);

    //Global Error handling
    // app.use((err, req, res, next) => {
    //     req.log.error({ err });
    //     return res.status(500).json("Internal Server Error");
    // });

    return app;
}

module.exports = {
    setMiddleWare
};