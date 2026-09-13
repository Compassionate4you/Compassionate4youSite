// Central error handler. Controllers call next(err) and land here.

function notFound(req, res) {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const status = err.status || err.statusCode || 500;

    // eslint-disable-next-line no-console
    console.error('API error:', err.message);

    res.status(status).json({
        error:
            status === 500
                ? 'Something went wrong on our end.'
                : err.message || 'Request failed.',
    });
}

module.exports = { notFound, errorHandler };
