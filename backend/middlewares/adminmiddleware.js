const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const isAdmin = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = user; // Attach user data to the request
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or missing token' });
    }
};

module.exports = { isAdmin };

