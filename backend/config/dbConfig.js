const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Remove the deprecated options
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
