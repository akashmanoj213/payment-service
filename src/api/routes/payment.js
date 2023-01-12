const express = require('express');
const { success, error } = require('./util');
const { inititateTransaction, publishPaymentComplete, savePaymentInfo, publishNotification } = require("../../controllers/payment");
const { formatMessageData } = require('../../utils/clients/pubSubClient')

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
        const messageId = await publishPaymentComplete(body);
        await publishNotification(body);
        res.status(200).json(success(res.statusCode, "Webhook ping succesfull!", { messageId }));
    } catch (err) {
        req.log.error(err, 'Error occured in /webhook :');
        return res.status(500).json(error(res.statusCode, err.message));
    }
});

router.post('/consumer', async (req, res) => {
    try {
        if (!(req.body && req.body.message && req.body.message.data)) {
            throw new Error("Malformed message received!");
        }

        req.log.info({ body: req.body }, `Message consumed !`);
        const { body: { message: { data, messageId } } } = req;
        const jsonObj = formatMessageData(data);
        const result = await savePaymentInfo(jsonObj);

        res.status(200).json(success(res.statusCode, `MessageId: ${messageId} processed successfully`, result));
    } catch (err) {
        req.log.error(err, 'Error occured in /consumer :');
        return res.status(500).json(error(res.statusCode, err.message));
    }
});

module.exports = router;