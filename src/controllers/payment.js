const axios = require('axios').default;
const config = require('config');
const paytmChecksum = require('paytmchecksum');
const { PubSub } = require('@google-cloud/pubsub');
const pool = require('../services/database');
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

const savePaymentInfo = (data) => {
    const { ORDERID: order_id, TXNID: transaction_id, TXNAMOUNT: transaction_amount, PAYMENTMODE: payment_mode, TXNDATETIME, STATUS: status, RESPMSG: response_message, GATEWAYNAME: gateway_name, BANKTXNID: bank_transaction_id, BANKNAME: bank_name } = data;
    const transaction_date = moment(TXNDATETIME).format('YYYY-MM-DD HH:mm:ss');

    const values = {
        order_id,
        transaction_id,
        transaction_amount,
        payment_mode,
        transaction_date,
        status,
        response_message,
        gateway_name,
        bank_transaction_id,
        bank_name
    };

    const sql = 'INSERT INTO payment_history SET ?';

    return new Promise((resolve, reject) => {
        pool.query(sql, values, (err, response) => {
            if (err) {
                logger.error(err, "Database error !");
                reject(err);
            }
            // rows added
            logger.info({ response }, "Row inserted.");
            resolve(response.insertId);
        });
    })
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