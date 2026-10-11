// DT-560: session tokens for the auth flow.
const jwt = require('jsonwebtoken');

const TOKEN_TTL = '7d';
const COOKIE_NAME = 'c4y_session';

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not set. Copy server/.env.example to server/.env.');
    }
    return secret;
}

function signToken(user) {
    return jwt.sign({ sub: user.id, email: user.email }, getSecret(), {
        expiresIn: TOKEN_TTL,
    });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, getSecret());
    } catch {
        return null;
    }
}

// httpOnly so client-side scripts cannot read the token.
function setSessionCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME);
}

module.exports = {
    signToken,
    verifyToken,
    setSessionCookie,
    clearSessionCookie,
    COOKIE_NAME,
};
