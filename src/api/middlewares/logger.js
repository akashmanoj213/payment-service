const bunyan = require('bunyan');
const { LoggingBunyan, LOGGING_TRACE_KEY } = require('@google-cloud/logging-bunyan');

const loggingBunyan = new LoggingBunyan({
    serviceContext: {
        service: 'payment-service', // required to report logged errors
        // to the Google Cloud Error Reporting
        // console
        version: 'payment-service'
    },
    defaultCallback: err => {
        if (err) {
            console.log('Error occured: ' + err);
        }
    }
});

const streams = [loggingBunyan.stream('info')];

if (process.env.NODE_ENV !== "production") {
    streams.push({ stream: process.stdout, level: 'info' })
}

const logger = bunyan.createLogger({
    // The JSON payload of the log as it appears in Cloud Logging
    // will contain "name": "payment_service"
    name: 'payment_service',
    serializers: bunyan.stdSerializers,
    streams,
});

const logWithTrace = (traceId, ...args) => {
    if(typeof traceId !== "string") {
        throw new Error("Provide traceId used to track user through this request.");
    }
    
    logger.info({
        [LOGGING_TRACE_KEY]: traceId
      }, ...args);
}

module.exports = {
    logger,
    logWithTrace
}