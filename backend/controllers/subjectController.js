// controllers/subjectController.js
const { containerClient } = require('../config/azureBlobConfig');

// Helper function to extract subject name from blob path
const extractSubjectName = (blobName) => {
    const parts = blobName.split('/');
    if (parts.length >= 3) {
        // Remove potential file suffixes or exam type indicators
        const subjectPart = parts[2];
        // Remove timestamp and file extension if present
        return subjectPart.split('-')[0].split('_')[0].trim();
    }
    return null;
};

const getSubjectsForCourseAndYear = async (req, res) => {
    try {
        const { course, year } = req.params;

        // Validate input parameters
        if (!course || !year) {
            return res.status(400).json({
                success: false,
                message: 'Course and year are required parameters'
            });
        }

        // Format the prefix to search in blob storage
        const prefix = `${course.toLowerCase()}/${year.toLowerCase()}/`;
        
        console.log(`Searching for blobs with prefix: ${prefix}`);

        // Get all blobs with the specified prefix
        const subjects = new Set(); // Using Set to avoid duplicates
        
        try {
            // List blobs with the specified prefix
            const blobsIterator = containerClient.listBlobsFlat({
                prefix: prefix
            });

            // Process each blob
            for await (const blob of blobsIterator) {
                const subjectName = extractSubjectName(blob.name);
                if (subjectName) {
                    subjects.add(subjectName);
                }
            }

            // Convert Set to Array and sort alphabetically
            const subjectList = Array.from(subjects).sort();

            // Log the results
            console.log(`Found ${subjectList.length} subjects for ${course}/${year}`);

            return res.status(200).json({
                success: true,
                data: {
                    course,
                    year,
                    subjects: subjectList,
                    count: subjectList.length
                }
            });

        } catch (storageError) {
            console.error('Azure Storage Error:', storageError);
            return res.status(500).json({
                success: false,
                message: 'Error accessing storage',
                error: storageError.message
            });
        }

    } catch (error) {
        console.error('Error in getSubjectsForCourseAndYear:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects',
            error: error.message
        });
    }
};

module.exports = {
    getSubjectsForCourseAndYear
};