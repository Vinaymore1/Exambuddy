const mongoose = require('mongoose');

const questionPaperSchema = new mongoose.Schema({
    course: { type: String, required: true },
    year: { type: String, required: true },
    subject: { type: String, required: true },
    fileName: { type: String, required: true },
    azureBlobUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('QuestionPaper', questionPaperSchema);
