const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { isValidEmail, isValidPassword, getPasswordRequirements, generateResetToken } = require('../validators/authValidation');
const { sendValidationError } = require('../utils/errorResponse');

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

    return res.status(201).json({ success: true, userId: user.id });
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

    return res.status(200).json({ success: true, userId: user.id });
}

async function forgotPassword(req, res) {
    const { email } = req.body;

    if (!isValidEmail(email)) {
        return sendValidationError(res, 'Please enter a valid email address.', 'email');
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return the same generic response, whether or not the user exists
    // (prevents attackers from discovering which emails are registered)
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

    // In a real app, you'd email the token to the user here.
    // For now, logging it so you can test the flow manually.
    console.log(`Password reset token for ${email}: ${resetToken}`);

    return res.status(200).json(genericResponse);
}

module.exports = { signup, login, forgotPassword };