const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    changePassword,
    logout,
    me,
} = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/reset-password', resetPassword);
// DT-781: checks a reset link before the new-password form is shown.
router.post('/reset-password/verify', verifyResetToken);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
// Change the password of the signed-in user (Customer Portal > Security).
router.post('/change-password', requireAuth, changePassword);
// DT-560: session handling.
router.post('/logout', logout);
router.get('/me', me);

module.exports = router;