const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout,
    me,
} = require('../controllers/authController');

router.post('/reset-password', resetPassword);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// DT-560: session handling.
router.post('/logout', logout);
router.get('/me', me);

module.exports = router;
