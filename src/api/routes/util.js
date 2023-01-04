/**
 * @desc This file contain Success and Error response for sending to client / user
 */

/**
 * @desc Send any success response
 *
 * @param {number} statusCode
 * @param {string} message
 * @param {object | array} results
 */
exports.success = (statusCode, message = "Request processed succesfully.", result) => {
    let response = {
        error: false,
        statusCode,
        message
    }

    if (result) {
        response = {
            ...response,
            result
        }
    }
    return response;
};

/**
 * @desc Send any error response
 *
 * @param {string} message
 * @param {number} statusCode
 */
exports.error = (statusCode, message = "Error occurred while processing request.") => {
    // List of common HTTP request code
    const codes = [200, 201, 400, 401, 404, 403, 422, 500];

    // Get matched code
    const findCode = codes.find((code) => code === statusCode);

    if (!findCode) statusCode = 500;
    else statusCode = findCode;

    //log
    console.log("Error returned from API: ", message);

    return {
        error: true,
        statusCode,
        message
    };
};

/**
 * @desc Send any validation response
 *
 * @param {object | array} errors
 */
exports.validation = (message, errors) => {
    return {
        error: true,
        statusCode: 422,
        message,
        errors
    };
};