const express = require('express');
const { success, error } = require('./util');
const { inititateTransaction, pushMessage, savePaymentInfo, testMessage } = require("../../controllers/payment");

const router = express.Router();

router.post('/initiate-transaction', async (req, res) => {
    const { orderId, amount, customerId } = req.body;
    req.log.info(`Transaction initiated for ${customerId} for amount - ${amount}`);

    try {
        const response = await inititateTransaction(orderId, amount, customerId);
        res.status(200).json(success(res.statusCode, "Transaction initiated.", response));
    } catch (err) {
        req.log.error(err, 'Error occured in /initiate-transaction');
        return res.status(500).json(error(res.statusCode, err.message));
    }
});

router.post('/webhook', async (req, res) => {
    const { body } = req;
    req.log.info({ body }, `webhook pinged !`);

    try {
        const messageId = await pushMessage(body);
        res.status(200).json(success(res.statusCode, "Webhook ping succesfull!", { messageId }));
    } catch (err) {
        req.log.error(err, 'Error occured in /webhook :');
        return res.status(500).json(error(res.statusCode, err.message));
    }
});

router.post('/consumer', async (req, res) => {
    req.log.info({ body: req.body }, `Message consumed !`);

    try {
        const { body: { message } } = req;

        const bufferObj = Buffer.from(message.data, "base64");
        const decodedData = bufferObj.toString("utf8");
        const jsonObj = JSON.parse(decodedData);

        const result = await savePaymentInfo(jsonObj);

        res.status(200).json(success(res.statusCode, `MessageId: ${message.messageId} processed successfully`, result));
    } catch (err) {
        req.log.error(err, 'Error occured in /consumer :');
        return res.status(500).json(error(res.statusCode, err.message));
    }
});

router.get('/test', async(req, res) => {
    try {
        const response = await testMessage({name: "Akash Manoj"});
        res.status(200).json(success(res.statusCode, `Test message is succesfull`, response));
    } catch (err) {
        return res.status(500).json(error(res.statusCode, err.message));
    }
})

module.exports = router;