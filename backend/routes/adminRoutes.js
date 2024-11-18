// routes/adminRoutes.js
const express = require('express');
const multer = require('multer');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { uploadQuestionPaper } = require('../controllers/questionPaperController');

const router = express.Router();
const upload = multer();

// Define the route with all middleware
router.post('/upload', 
    isAdmin, 
    upload.single('file'), 
    uploadQuestionPaper
);

module.exports = router;

