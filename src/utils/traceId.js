const {logger} = require("./logger");

let traceId;

setTraceId = (traceId) => {
    logger.info("Setting traceId: ", traceId);
    this.traceId = traceId;
}

getTraceId = () => {
    logger.info("Retrieving traceId: ", this.traceId);
    return this.traceId;
}

module.exports = {
    setTraceId,
    getTraceId
}