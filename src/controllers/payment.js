const axios = require('axios').default;
const config = require('config');
const paytmChecksum = require('paytmchecksum');
const { PubSub } = require('@google-cloud/pubsub');
const { models } = require('../services/database');

const moment = require('moment');
const { logger } = require('../api/middlewares/logger');

const PAYTM_MERCHENT_KEY = config.get("paytmMerchantKey");
const PAYTM_MERCHENT_ID = config.get("paytmMerchantId");
const PAYMENT_TOPIC = config.get("paymentTopic");

const pubSubClient = new PubSub();

const inititateTransaction = async (orderId, amount, customerId, customerPhoneNumber = null) => {
    let userInfo = { custId: customerId };

    if (customerPhoneNumber) {
        userInfo = {
            ...userInfo,
            mobile: customerPhoneNumber
        };
    }

    let requestBody = {
        body: {
            requestType: "Payment",
            mid: PAYTM_MERCHENT_ID,
            websiteName: "WEBSTAGING",
            orderId,
            callbackUrl: "https://paymentservice-4tspl6unya-el.a.run.app/payment/webhook",
            txnAmount: {
                value: amount,
                currency: "INR"
            },
            userInfo
        }
    }

    let signature;

    try {
        signature = await checkSum(requestBody.body, PAYTM_MERCHENT_KEY);
        logger.info("signature: " + signature);

        requestBody = {
            ...requestBody,
            head: {
                signature
            }
        };

        const result = await axios.post('https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction', requestBody, {
            params: {
                mid: PAYTM_MERCHENT_ID,
                orderId
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        logger.info({ result: result.data }, "Result - ");

        return result.data;
    } catch (err) {
        logger.error(err, "Error occured while initiating transaction.");
        throw err;
    }
}

const publishMessage = async (body) => {
    try {
        logger.info("Publishing message...");

        const data = JSON.stringify(body);
        const dataBuffer = Buffer.from(data);
        const messageId = await pubSubClient
            .topic(PAYMENT_TOPIC)
            .publishMessage({ data: dataBuffer });
        logger.info(`Message ${messageId} published.`);

        return messageId;
    } catch (err) {
        logger.error(err, "Received error while publishing.");
        throw err;
    }
}

const savePaymentInfo = async (data) => {
    try {
        const { ORDERID: orderId, TXNID: transactionId, TXNAMOUNT: transactionAmount, PAYMENTMODE: paymentMode, TXNDATETIME, STATUS: status, RESPMSG: responseMessage, GATEWAYNAME: gatewayName, BANKTXNID: bankTransactionId, BANKNAME: bankName } = data;
        const transactionDate = moment(TXNDATETIME).format('YYYY-MM-DD HH:mm:ss');

        const values = {
            orderId,
            transactionId,
            transactionAmount,
            paymentMode,
            transactionDate,
            status,
            responseMessage,
            gatewayName,
            bankTransactionId,
            bankName
        };

        const response = await models.PaymentHistory.create(values);

        logger.info("Data added successfully");
    } catch (err) {
        logger.error(err, "Error occured while saving payment to DB.");
        throw err;
    }
}

const checkSum = async (body, key) => {
    let requestBody = JSON.stringify(body);
    return await paytmChecksum.generateSignature(requestBody, key);
}

module.exports = {
    inititateTransaction,
    publishMessage,
    savePaymentInfo
}