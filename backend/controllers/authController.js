const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendVerificationEmail , sendPasswordResetEmail} = require('../utils/emailUtils');

// Signup Function
const signup = async (req, res) => {
    try {
        const { email, password, prn, adminKey } = req.body;

        // Restrict email to @mitwpu.edu.in domain
        if (!email.endsWith('@mitwpu.edu.in')) {
            return res.status(400).json({ message: 'Only @mitwpu.edu.in emails are allowed' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const isAdmin = adminKey === process.env.ADMIN_KEY;

        // Generate the user first
        const user = new User({ email, password: hashedPassword, prn, isAdmin });
        await user.save();

        // Generate JWT token for email verification
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email
        try {
            await sendVerificationEmail(email, token);
        } catch (error) {
            console.error('Error sending verification email:', error);
            // Roll back user creation if email fails
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({ message: 'Failed to send verification email', error });
        }

        res.status(201).json({ message: 'User created. Please verify your email.' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Error signing up', error });
    }
};


// Resend Verification Email Function
const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await sendVerificationEmail(email, token);

        res.json({ message: 'Verification email resent successfully.' });
    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ message: 'Error resending verification email', error });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        // Create reset URL with token
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        // Send reset email
        await sendPasswordResetEmail(email, resetUrl);

        res.json({ 
            message: 'Password reset link sent successfully. Please check your email.',
            // Don't send the token in response for security
        });
    } catch (error) {
        console.error('Error during forgot password:', error.message);
        res.status(500).json({ message: 'Error during forgot password', error: error.message });
    }
};

// Validate Reset Token (New endpoint)
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'Invalid reset link' });
        }

        res.json({ message: 'Token is valid', email: user.email });
    } catch (error) {
        console.error('Error validating reset token:', error);
        res.status(400).json({ message: 'Invalid or expired reset link' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find the user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update the password
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }
        res.status(500).json({ message: 'Error resetting password', error: error.message });
    }
};
// Login Function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Restrict email to @mitwpu.edu.in domain
        if (!email.endsWith('@mitwpu.edu.in')) {
            return res.status(400).json({ message: 'Only @mitwpu.edu.in emails are allowed' });
        }

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email before logging in.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Use the decoded ID to find the user
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        user.isVerified = true;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};


module.exports = { signup, login, verifyEmail, resendVerificationEmail, forgotPassword , resetPassword ,validateResetToken };





