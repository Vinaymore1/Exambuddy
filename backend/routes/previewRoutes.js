const express = require('express');
const { previewQuestionPapers, downloadQuestionPaper , getUniqueCourses, getYearsForCourse, getSubjectsForCourseAndYear } = require('../controllers/previewController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/papers', authMiddleware, previewQuestionPapers);
router.get('/papers/download/:blobPath(*)', authMiddleware, downloadQuestionPaper);

router.get('/courses', authMiddleware, getUniqueCourses); // Fetch unique courses
router.get('/courses/:course/years', authMiddleware, getYearsForCourse); // Fetch years for a course
router.get('/courses/:course/years/:year/subjects', authMiddleware, getSubjectsForCourseAndYear);

module.exports = router;



// // routes/previewRoutes.js
// const express = require('express');
// const { previewQuestionPapers, downloadQuestionPaper } = require('../controllers/previewController');
// const authMiddleware = require('../middlewares/authMiddleware');

// const router = express.Router();

// router.get('/papers', authMiddleware, previewQuestionPapers);
// router.get('/papers/download/:blobPath(*)', authMiddleware, downloadQuestionPaper); // New download route

// module.exports = router;



// const express = require('express');
// const { previewQuestionPapers  } = require('../controllers/previewController');
// const authmiddleware = require('../middlewares/authmiddleware');

// const router = express.Router();

// // Protected route - only authenticated users can access
// router.get('/papers',  previewQuestionPapers);

// module.exports = router;