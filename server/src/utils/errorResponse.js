function sendValidationError(res, message, field = null) {
    return res.status(400).json({
        success: false,
        error: { message, field },
    });
}

module.exports = { sendValidationError };