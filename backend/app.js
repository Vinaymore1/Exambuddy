const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');  
const adminRoutes = require('./routes/adminRoutes');
const connectDB = require('./config/dbConfig.js');
const previewRoutes = require('./routes/previewRoutes');

dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Use the auth routes
app.use('/api/auth', authRoutes);  
app.use('/api/admin', adminRoutes);  
app.use('/api/preview', previewRoutes);


app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
