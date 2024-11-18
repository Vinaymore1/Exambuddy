const express = require('express');
const { signup, login, verifyEmail, resendVerificationEmail, forgotPassword ,resetPassword ,validateResetToken } = require('../controllers/authController');

const router = express.Router();

// Signup Route
router.post('/signup', signup);

// Login Route
router.post('/login', login);

// Email Verification Route
router.get('/verify-email', verifyEmail);

// Resend Verification Email Route
router.post('/resend-verification', resendVerificationEmail);

// Forgot Password Route
router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);
router.get('/validate-reset-token/:token', validateResetToken);

module.exports = router;



