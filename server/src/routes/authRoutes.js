const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    logout,
    me,
} = require('../controllers/authController');

router.post('/reset-password', resetPassword);
// DT-781: checks a reset link before the new-password form is shown.
router.post('/reset-password/verify', verifyResetToken);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// DT-560: session handling.
router.post('/logout', logout);
router.get('/me', me);

module.exports = router;
