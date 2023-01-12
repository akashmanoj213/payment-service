const config = require('config');
const paytmChecksum = require('paytmchecksum');
const moment = require('moment');
const { publishMessage } = require('../utils/clients/pubSubClient');
const { post } = require('../utils/clients/axiosClient');
const { logger } = require('../utils/logger');
const { savePaymentDetails } = require('../services/paymentService');

const PAYTM_MERCHENT_KEY = config.get("paytmMerchantKey");
const PAYTM_MERCHENT_ID = config.get("paytmMerchantId");
const PAYMENT_TOPIC = config.get("paymentTopic");
const NOTIFICATION_TOPIC = config.get("notificationTopic");

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

        const result = await post('https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction', requestBody, {
            params: {
                mid: PAYTM_MERCHENT_ID,
                orderId
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        logger.info({ result }, "Result:");

        return result;
    } catch (err) {
        logger.error(err, "Error occured while initiating transaction.");
        throw err;
    }
}

const publishPaymentComplete = async (body) => {
    try {
        logger.info("Publishing message to payment-complete topic...");

        const messageId = await publishMessage(body, PAYMENT_TOPIC);

        return messageId;
    } catch (err) {
        logger.error(err, "Error occured while publishing message!");
        throw err;
    }
}

const savePaymentInfo = async (data) => {
    try {
        const { ORDERID: orderId, CUSTID: customerId, TXNID: transactionId, TXNAMOUNT: transactionAmount, PAYMENTMODE: paymentMode, 
            TXNDATETIME, STATUS: status, RESPMSG: responseMessage, GATEWAYNAME: gatewayName, BANKTXNID: bankTransactionId, BANKNAME: bankName } = data;
        const transactionDate = moment(TXNDATETIME).format('YYYY-MM-DD HH:mm:ss');

        const values = {
            orderId,
            customerId,
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

        await savePaymentDetails(values);

        logger.info("Payment info saved successfully");
    } catch (err) {
        logger.error(err, "Error occured while saving payment to DB.");
        throw err;
    }
}

const publishNotification = async (body) => {
    try {
        logger.info("Publishing message to notification topic...");

        const attributes = {
            type: 'SMS'
        }

        //TO-DO: replace with code to retrive phone Number from user-management service
        const { TXNAMOUNT: txnAmount } = body;
        const messageBody = {
            body: `Payment completed for amount: ${txnAmount}`,
            receiverNumber: '+9972976940'
        }

        const messageId = await publishMessage(messageBody, NOTIFICATION_TOPIC, attributes);

        return messageId;
    } catch (err) {
        logger.error(err, "Error occured while publishing message to notification topic!");
        throw err;
    }
}

const checkSum = async (body, key) => {
    let requestBody = JSON.stringify(body);
    return await paytmChecksum.generateSignature(requestBody, key);
}

module.exports = {
    inititateTransaction,
    publishPaymentComplete,
    savePaymentInfo,
    publishNotification
}