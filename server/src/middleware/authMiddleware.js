// DT-560: reads the session cookie and attaches the user to the request.
const { verifyToken, COOKIE_NAME } = require('../utils/token');
const prisma = require('../config/db');

// Attaches req.user when a valid session cookie is present, otherwise leaves
// it null. Does not reject the request - use requireAuth for that.
function attachUser(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME];
    const payload = token ? verifyToken(token) : null;

    req.user = payload ? { id: payload.sub, email: payload.email } : null;
    return next();
}

function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: 'You must be signed in to do that.', field: null },
        });
    }
    return next();
}
async function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: { message: 'You must be signed in to do that.', field: null },
        });
    }

    try {
        const account = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { role: true },
        });

        if (!account || String(account.role).toLowerCase() !== 'admin') {
            return res.status(403).json({
                success: false,
                error: { message: 'You do not have permission to do that.', field: null },
            });
        }
        return next();
    } catch (err) {
        return next(err);
    }
}
module.exports = { attachUser, requireAuth, requireAdmin };
