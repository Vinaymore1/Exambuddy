const { containerClient, generateSasUrl } = require('../config/azureBlobConfig');

const uploadQuestionPaper = async (req, res) => {
    const { course, year, subject, examType } = req.body;

    if (!req.file || !course || !year || !subject || !examType) {
        return res.status(400).json({ 
            success: false,
            message: 'Missing file or metadata (course, year, subject, or examType).' 
        });
    }

    try {
        // Create blob name with folder structure
        const blobName = `${course}/${year}/${examType}/${subject}-${Date.now()}.pdf`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Upload the file
        await blockBlobClient.uploadData(req.file.buffer, {
            blobHTTPHeaders: { blobContentType: 'application/pdf' }
        });

        // Generate SAS URL for the uploaded file
        const downloadUrl = generateSasUrl(blobName);

        res.status(200).json({
            success: true,
            message: 'File uploaded successfully.',
            path: blobName,
            downloadUrl
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to upload file.',
            error: error.message 
        });
    }
};

module.exports = {
    uploadQuestionPaper
};



