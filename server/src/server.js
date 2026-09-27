// Server entry point. Boots Express on PORT (default 4000).
require('dotenv').config();

const http = require('http');
const app = require('./app');

const PORT = Number(process.env.PORT) || 4000;
const server = http.createServer(app);

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(
            `Port ${PORT} is already in use. Stop the other process or set ` +
            `a different PORT in server/.env, then restart.`
        );
    } else {
        console.error('Server error:', err);
    }
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});

// Keep-alive interval (workaround for Node 24 event loop draining on bind).
const heartbeat = setInterval(() => {}, 1 << 30);

function shutdown(signal) {
    console.log(`\nReceived ${signal}, closing server...`);
    clearInterval(heartbeat);
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
    // Force-exit fallback if close hangs.
    setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
