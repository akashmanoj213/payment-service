const uuid = require('uuid');
const config = require('config');
// const crypto = require('crypto');
const { logger, LOGGING_TRACE_KEY } = require('../../utils/logger');
const { setTraceId } = require("../../utils/traceId");
const { retrieveTraceId } = require("../../utils/clients/pubSubClient")

const PROJECT_ID = config.get("projectId");

const traceLogger = (req, res, next) => {
    const requestStartMs = Date.now();
    const traceId = extractTraceId(req);

    setTraceId(traceId);
    const trace = `projects/${PROJECT_ID}/traces/${traceId}`;

    req.log = logger.child({[LOGGING_TRACE_KEY]: trace})

    res.on("finish", () => {
        const latencyMilliseconds = Date.now() - requestStartMs;
        const requestDetails = createRequest(req);
        const responseDetails = createResponse(res, latencyMilliseconds);
        // const spanId = crypto.randomBytes(8).toString("hex");

        const httpRequest = { ...requestDetails, ...responseDetails };
        logger.info({ httpRequest, [LOGGING_TRACE_KEY]: trace });
    });
    next();
}

const createRequest = (req) => {
    if (!req) return req;

    let requestUrl, protocol, requestMethod, remoteIp, serverIp, requestSize, userAgent, referer;

    requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    protocol = req.protocol;
    requestMethod = req.method ? req.method : null
    remoteIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    requestSize = (Number(req.headers['content-length'])) || 0;
    serverIp = req.connection.localAddress ? req.connection.localAddress : null;

    if (req.headers && req.headers['user-agent']) {
        req.headers['user-agent'] ? (userAgent = req.headers['user-agent']) : null;
        req.headers['referer'] ? (referer = req.headers['referer']) : null;
    }

    return {
        requestUrl,
        protocol,
        requestMethod,
        remoteIp,
        serverIp,
        requestSize,
        userAgent,
        referer
    }
}

const createResponse = (res, latencyMilliseconds) => {
    if (!res) return res;

    let status, responseSize, latency;

    status = res.statusCode ? res.statusCode : null;
    responseSize =
        (res.getHeader && Number(res.getHeader('Content-Length'))) || 0;

    latency = {
        seconds: Math.floor(latencyMilliseconds / 1e3),
        nanos: Math.floor((latencyMilliseconds % 1e3) * 1e6),
    };

    return {
        status,
        responseSize,
        latency
    }
}

const extractTraceId = (req) => {
    let traceId;
    try {
        traceId = req.headers['trace-id'] ? req.headers['trace-id'] : retrieveTraceId(req.body);
    } catch (err) {
        traceId = uuid.v4();
        logger.error(err, `Error occured while retrieving traceId. Using new traceId: ${traceId}`);
    }

    return traceId;
}

module.exports = traceLogger