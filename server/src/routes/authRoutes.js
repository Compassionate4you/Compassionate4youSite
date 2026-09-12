const express = require('express');
const router = express.Router();
const { signup, login, forgotPassword, resetPassword } = require('../controllers/authController');

router.post('/reset-password', resetPassword);
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

module.exports = router;