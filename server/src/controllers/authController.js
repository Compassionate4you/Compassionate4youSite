const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { isValidEmail, isValidPassword, getPasswordRequirements, generateResetToken } = require('../validators/authValidation');
const { sendValidationError } = require('../utils/errorResponse');
const { signToken, setSessionCookie, clearSessionCookie } = require('../utils/token');

async function signup(req, res) {
    const { email, password } = req.body;

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
        data: { email, password: hashedPassword },
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

async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!isValidEmail(email)) {
        return sendValidationError(res, 'Please enter a valid email address.', 'email');
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same generic response, whether or not the user exists
    const genericResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
    };

    if (!user) {
        return res.status(200).json(genericResponse);
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await prisma.user.update({
        where: { email },
        data: { resetToken, resetTokenExpiry },
    });

    // This is where you would usally email the token to the user here.
    // For now, logging it so you can test the flow manually.
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return res.status(200).json(genericResponse);
}
async function resetPassword(req, res) {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
        return sendValidationError(res, 'A valid reset token is required.', 'token');
    }

    if (!isValidPassword(newPassword)) {
        return sendValidationError(res, getPasswordRequirements(), 'newPassword');
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
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

    return res.status(200).json({ success: true, message: 'Your password has been updated successfully.' });
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

module.exports = { signup, login, forgotPassword, resetPassword, logout, me };