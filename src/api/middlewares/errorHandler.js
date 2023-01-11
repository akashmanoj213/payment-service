const { logger } = require("../../utils/logger");

const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    logger.error(err, "An unexpected error occured.");

    res.status(500).send("Error occured");
}

module.exports = errorHandler;