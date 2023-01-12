const { models } = require('../utils/database');
const { logger } = require('../utils/logger')

const savePaymentDetails = async (values) => {
    try {
        const response = await models.PaymentHistory.create(values);
        return response;
    } catch (err) {
        logger.error(err, "Error occured while writing to DB!");
        throw err;
    }
}

module.exports = {
    savePaymentDetails
}