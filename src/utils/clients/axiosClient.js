const axios = require('axios').default;
const FormData = require('form-data');
const { getTraceId } = require('../traceId')

const post = async (url, body, config = {}, includeTrace = false) => {
    const { params = null, headers = null } = config;

    if (includeTrace) {
        headers = addTraceId(headers);
    }

    const result = await axios.post(url, body, {
        params,
        headers
    });

    return result.data;
}

const postFile = async (url, fileBuffer, fileName, config = {}, includeTrace = false) => {
    let { params = null, headers = null } = config;

    if (includeTrace) {
        headers = addTraceId(headers);
    }

    const form = new FormData();
    form.append('document', fileBuffer, fileName);

    headers = {
        ...headers,
        ...form.getHeaders()
    }

    const result = await axios.post(url, form, {
        params,
        headers
    });

    return result.data;
}

const addTraceId = (headers) => {
    const traceId = getTraceId();
    headers = {
        ...headers,
        "trace-id": traceId
    }
    return headers;
}

module.exports = {
    post,
    postFile
}