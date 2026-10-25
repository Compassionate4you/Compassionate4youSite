const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/db');
const { isValidEmail, isValidPassword, getPasswordRequirements, generateResetToken } = require('../validators/authValidation');
const { sendValidationError } = require('../utils/errorResponse');
const { signToken, setSessionCookie, clearSessionCookie } = require('../utils/token');
const { sendEmail } = require('../services/notificationService');
const {
    renderResetPasswordEmailHtml,
    renderResetPasswordEmailText,
} = require('../services/templates/resetPasswordEmail');

// DT-765: reset links last one hour.
const RESET_TOKEN_TTL_MINUTES = 60;

// DT-765: only a hash of the reset token is stored, so a leaked database row
// cannot be used to reset someone's password.
function hashResetToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// DT-765: phone numbers are stored exactly as typed at signup, so compare
// digits only. A leading US country code is dropped so "+1 555..." matches
// "(555) ...".
function phoneDigits(value) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

function looksLikePhone(value) {
    return /^\+?[\d\s().-]{7,20}$/.test(value) && phoneDigits(value).length >= 7;
}

async function findUsersByPhone(phone) {
    const target = phoneDigits(phone);
    const candidates = await prisma.user.findMany({
        where: { phone: { not: null } },
        select: { id: true, email: true, name: true, phone: true },
    });
    return candidates.filter((u) => phoneDigits(u.phone) === target);
}

function buildResetUrl(token) {
    const origin = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
    return `${origin}/reset-password?token=${encodeURIComponent(token)}`;
}

// DT-765: finds the user a reset token belongs to, or null when the token is
// unknown or has expired.
async function findUserByResetToken(token) {
    if (!token || typeof token !== 'string') return null;
    const user = await prisma.user.findUnique({ where: { resetToken: hashResetToken(token) } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) return null;
    return user;
}

async function signup(req, res) {
    const { email, password, fullName, phone } = req.body;

    // DT-747: Make sure the user enters a full name
    if (typeof fullName !== 'string' || !fullName.trim()) {
        return sendValidationError(res, 'Full name is required.', 'fullName');
    }

    // DT-747: Make sure the user enters a valid phone number
    if (typeof phone !== 'string' || !/^\+?[\d\s().-]{7,20}$/.test(phone.trim())) {
        return sendValidationError(res, 'Please enter a valid phone number.', 'phone');
    }


    if (!isValidEmail(email)) {
        return sendValidationError(res, 'Please enter a valid email address.', 'email');
    }

    if (!isValidPassword(password)) {
        return sendValidationError(res, getPasswordRequirements(), 'password');
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return sendValidationError(res, 'An account with this email already exists.', 'email');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashedPassword, name: fullName.trim(), phone: phone.trim() },
    });

    setSessionCookie(res, signToken(user));

    return res.status(201).json({
        success: true,
        userId: user.id,
        user: { id: user.id, email: user.email },
    });
}

async function login(req, res) {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
        return sendValidationError(res, 'Please enter a valid email address.', 'email');
    }

    if (!password || typeof password !== 'string') {
        return sendValidationError(res, 'Password is required.', 'password');
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return sendValidationError(res, 'Invalid email or password.', null);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return sendValidationError(res, 'Invalid email or password.', null);
    }

    setSessionCookie(res, signToken(user));

    return res.status(200).json({
        success: true,
        userId: user.id,
        user: { id: user.id, email: user.email },
    });
}

// DT-765: accepts an email address or a phone number. The reset link always
// goes to the email address on the account.
async function forgotPassword(req, res, next) {
    try {
        const body = req.body || {};
        // `email` is still accepted for callers that predate the phone option.
        const identifier = String(body.identifier ?? body.email ?? '').trim();
        const confirmEmail = typeof body.confirmEmail === 'string' ? body.confirmEmail.trim() : '';

        // Always return the same generic response, whether or not the user exists
        const genericResponse = {
            success: true,
            message: 'If an account with that email or phone number exists, a password reset link has been sent.',
        };

        let user = null;

        if (isValidEmail(identifier)) {
            user = await prisma.user.findUnique({ where: { email: identifier } });
        } else if (looksLikePhone(identifier)) {
            const matches = await findUsersByPhone(identifier);

            if (matches.length > 1) {
                // DT-765: several accounts share this number, so the user has to
                // say which one by confirming its email address.
                if (!confirmEmail) {
                    return res.status(409).json({
                        success: false,
                        error: {
                            message: 'More than one account uses this phone number. Please also enter the email address on your account.',
                            field: 'confirmEmail',
                        },
                    });
                }
                if (!isValidEmail(confirmEmail)) {
                    return sendValidationError(res, 'Please enter a valid email address.', 'confirmEmail');
                }
                user = matches.find((u) => u.email.toLowerCase() === confirmEmail.toLowerCase()) || null;
            } else {
                user = matches[0] || null;
            }
        } else {
            return sendValidationError(res, 'Please enter a valid email address or phone number.', 'identifier');
        }

        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const resetToken = generateResetToken();
        const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken: hashResetToken(resetToken), resetTokenExpiry },
        });

        // DT-771: branded reset email with a link to the reset page.
        const resetUrl = buildResetUrl(resetToken);
        const emailContent = { name: user.name, resetUrl, expiresInMinutes: RESET_TOKEN_TTL_MINUTES };
        const result = await sendEmail({
            to: user.email,
            subject: 'Reset your Compassionate4You password',
            body: renderResetPasswordEmailText(emailContent),
            html: renderResetPasswordEmailHtml(emailContent),
        });

        // Without SendGrid credentials nothing is sent, so print the link to
        // let the flow be tested locally. Never logged in production.
        if (result.skipped && process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.log(`[password reset] link for ${user.email}: ${resetUrl}`);
        }

        // A failed send is logged by sendEmail. The response stays generic so
        // it never reveals whether the account exists.
        return res.status(200).json(genericResponse);
    } catch (err) {
        return next(err);
    }
}

// DT-781: lets the reset page check the link and show whose account it is
// before the user types a new password.
async function verifyResetToken(req, res, next) {
    try {
        const user = await findUserByResetToken(req.body?.token);
        if (!user) {
            return sendValidationError(res, 'This reset link is invalid or has expired.', 'token');
        }
        return res.status(200).json({
            success: true,
            user: { name: user.name, email: user.email },
        });
    } catch (err) {
        return next(err);
    }
}

async function resetPassword(req, res, next) {
    try {
        const { token, newPassword } = req.body || {};

        if (!token || typeof token !== 'string') {
            return sendValidationError(res, 'A valid reset token is required.', 'token');
        }

        if (!isValidPassword(newPassword)) {
            return sendValidationError(res, getPasswordRequirements(), 'newPassword');
        }

        const user = await findUserByResetToken(token);

        if (!user) {
            return sendValidationError(res, 'This reset link is invalid or has expired.', 'token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        });

        // DT-781: the email lets the login page pre-fill the form.
        return res.status(200).json({
            success: true,
            message: 'Your password has been updated successfully.',
            email: user.email,
        });
    } catch (err) {
        return next(err);
    }
}
function logout(req, res) {
    clearSessionCookie(res);
    return res.status(200).json({ success: true });
}

// Lets the client restore a session on page load.
function me(req, res) {
    if (!req.user) {
        return res.status(200).json({ user: null });
    }
    return res.status(200).json({ user: req.user });
}

module.exports = { signup, login, forgotPassword, verifyResetToken, resetPassword, logout, me, phoneDigits };