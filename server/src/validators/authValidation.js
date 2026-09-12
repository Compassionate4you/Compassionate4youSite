const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
    if (typeof email !== 'string') return false;
    return EMAIL_REGEX.test(email.trim());
}

// Password rules: min 8 chars, at least one uppercase, one lowercase,
// one number, one special character. Adjust to your product's requirements.
function isValidPassword(password) {
    if (typeof password !== 'string') return false;

    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    );
}

function getPasswordRequirements() {
    return "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.";
}
const crypto = require('crypto');

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}
module.exports = {
    isValidEmail,
    isValidPassword,
    getPasswordRequirements,
    generateResetToken
};