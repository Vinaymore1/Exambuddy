const { containerClient, generateSasUrl } = require('../config/azureBlobConfig');
const { addWatermark } = require('../utils/watermarkUtils');

// Helper function to extract PRN from email
function extractPRN(email) {
    return email.split('@')[0];
}
const previewQuestionPapers = async (req, res) => {
    const { course, year, subject, examType } = req.query; // Added examType
    const userId = req.user.id;
    const prn = extractPRN(req.user.email);

    try {
        console.log('Fetching papers for user:', userId);

        const exists = await containerClient.exists();
        if (!exists) {
            throw new Error('Container does not exist or is not accessible');
        }

        const blobList = [];
        const listBlobsResponse = containerClient.listBlobsFlat();

        for await (const blob of listBlobsResponse) {
            blobList.push(blob);
        }

        // Apply filters
        let filteredBlobs = blobList;
        if (course) {
            filteredBlobs = filteredBlobs.filter(blob =>
                blob.name.toLowerCase().includes(course.toLowerCase())
            );
        }
        if (year) {
            filteredBlobs = filteredBlobs.filter(blob =>
                blob.name.includes(year)
            );
        }
        if (examType) {
            filteredBlobs = filteredBlobs.filter(blob =>
                blob.name.toLowerCase().includes(examType.toLowerCase())
            );
        }
        if (subject) {
            filteredBlobs = filteredBlobs.filter(blob =>
                blob.name.toLowerCase().includes(subject.toLowerCase())
            );
        }

        const papers = await Promise.all(filteredBlobs.map(async (blob) => {
            const blobClient = containerClient.getBlobClient(blob.name);
            const downloadResponse = await blobClient.download();
            const pdfBuffer = await streamToBuffer(downloadResponse.readableStreamBody);

            const watermarkedPdfBuffer = await addWatermark(pdfBuffer, prn);
            const watermarkedBlobName = `watermarked/${userId}/${blob.name}`;
            const watermarkedBlobClient = containerClient.getBlockBlobClient(watermarkedBlobName);
            await watermarkedBlobClient.uploadData(watermarkedPdfBuffer, {
                blobHTTPHeaders: { blobContentType: 'application/pdf' }
            });

            const downloadUrl = await generateSasUrl(watermarkedBlobName);
            const pathParts = blob.name.split('/');

            return {
                name: blob.name,
                downloadUrl,
                course: pathParts[0] || 'Unknown',
                year: pathParts[1] || 'Unknown',
                examType: pathParts[2] || 'Unknown',
                subject: (pathParts[3] || '').split('-')[0] || 'Unknown',
                uploadedOn: blob.properties.createdOn,
                size: blob.properties.contentLength
            };
        }));

        res.status(200).json({
            success: true,
            count: papers.length,
            papers
        });

    } catch (error) {
        console.error('Error fetching papers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch papers.',
            error: error.message,
            details: error.details || {}
        });
    }
};


//working
// const previewQuestionPapers = async (req, res) => {
//     const { course, year, subject } = req.query;
//     const userId = req.user.id;
//     const prn = extractPRN(req.user.email);
    
//     try {
//         console.log('Fetching papers for user:', userId);
        
//         // Test container access
//         const exists = await containerClient.exists();
//         if (!exists) {
//             throw new Error('Container does not exist or is not accessible');
//         }
        
//         // List all blobs in the container
//         const blobList = [];
//         const listBlobsResponse = containerClient.listBlobsFlat();
        
//         for await (const blob of listBlobsResponse) {
//             blobList.push(blob);
//         }

//         // Apply filters
//         let filteredBlobs = blobList;
//         if (course) {
//             filteredBlobs = filteredBlobs.filter(blob => 
//                 blob.name.toLowerCase().includes(course.toLowerCase())
//             );
//         }
//         if (year) {
//             filteredBlobs = filteredBlobs.filter(blob => 
//                 blob.name.includes(year)
//             );
//         }
//         if (subject) {
//             filteredBlobs = filteredBlobs.filter(blob => 
//                 blob.name.toLowerCase().includes(subject.toLowerCase())
//             );
//         }

//         // Generate watermarked PDFs and SAS URLs for each paper
//         const papers = await Promise.all(filteredBlobs.map(async (blob) => {
//             // Download the original PDF
//             const blobClient = containerClient.getBlobClient(blob.name);
//             const downloadResponse = await blobClient.download();
//             const pdfBuffer = await streamToBuffer(downloadResponse.readableStreamBody);

//             // Add watermark with just the PRN
//             const watermarkedPdfBuffer = await addWatermark(pdfBuffer, prn);

//             // Upload watermarked version with a unique name
//             const watermarkedBlobName = `watermarked/${userId}/${blob.name}`;
//             const watermarkedBlobClient = containerClient.getBlockBlobClient(watermarkedBlobName);
//             await watermarkedBlobClient.uploadData(watermarkedPdfBuffer, {
//                 blobHTTPHeaders: { blobContentType: 'application/pdf' }
//             });

//             // Generate SAS URL for the watermarked version
//             const downloadUrl = await generateSasUrl(watermarkedBlobName);
//             const pathParts = blob.name.split('/');
            
//             return {
//                 name: blob.name,
//                 downloadUrl,
//                 course: pathParts[0] || 'Unknown',
//                 year: pathParts[1] || 'Unknown',
//                 subject: (pathParts[2] || '').split('-')[0] || 'Unknown',
//                 uploadedOn: blob.properties.createdOn,
//                 size: blob.properties.contentLength
//             };
//         }));

//         res.status(200).json({
//             success: true,
//             count: papers.length,
//             papers
//         });

//     } catch (error) {
//         console.error('Error fetching papers:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: 'Failed to fetch papers.',
//             error: error.message,
//             details: error.details || {}
//         });
//     }
// };

const downloadQuestionPaper = async (req, res) => {
    const blobName = req.params.blobPath;
    const userId = req.user.id;
    const prn = extractPRN(req.user.email);

    try {
        // Download the original PDF
        const blobClient = containerClient.getBlobClient(blobName);
        const downloadResponse = await blobClient.download();
        const pdfBuffer = await streamToBuffer(downloadResponse.readableStreamBody);

        // Add watermark with just the PRN
        const watermarkedPdfBuffer = await addWatermark(pdfBuffer, prn);

        // Upload watermarked version with a unique name
        const watermarkedBlobName = `watermarked/${userId}/${blobName}`;
        const watermarkedBlobClient = containerClient.getBlockBlobClient(watermarkedBlobName);
        await watermarkedBlobClient.uploadData(watermarkedPdfBuffer, {
            blobHTTPHeaders: { blobContentType: 'application/pdf' }
        });

        // Generate SAS URL for the watermarked version
        const downloadUrl = generateSasUrl(watermarkedBlobName);
        
        res.status(200).json({
            success: true,
            downloadUrl
        });

    } catch (error) {
        console.error('Error generating download URL:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to generate download URL.',
            error: error.message 
        });
    }
};

// Helper function to convert stream to buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}


const getUniqueCourses = async (req, res) => {
    try {
        const blobList = [];
        const listBlobsResponse = containerClient.listBlobsFlat();

        for await (const blob of listBlobsResponse) {
            const pathParts = blob.name.split('/');
            if (pathParts[0]) blobList.push(pathParts[0]);
        }

        const uniqueCourses = [...new Set(blobList)];
        res.status(200).json({ success: true, courses: uniqueCourses });
    } catch (error) {
        console.error('Error fetching unique courses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unique courses.',
            error: error.message
        });
    }
};

const getYearsForCourse = async (req, res) => {
    const { course } = req.query;

    try {
        const blobList = [];
        const listBlobsResponse = containerClient.listBlobsFlat();

        for await (const blob of listBlobsResponse) {
            const pathParts = blob.name.split('/');
            if (pathParts[0].toLowerCase() === course.toLowerCase() && pathParts[1]) {
                blobList.push(pathParts[1]);
            }
        }

        const uniqueYears = [...new Set(blobList)];
        res.status(200).json({ success: true, years: uniqueYears });
    } catch (error) {
        console.error('Error fetching years for course:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch years for course.',
            error: error.message
        });
    }
};

const getSubjectsForCourseAndYear = async (req, res) => {
    const { course, year } = req.query;

    try {
        const blobList = [];
        const listBlobsResponse = containerClient.listBlobsFlat();

        for await (const blob of listBlobsResponse) {
            const pathParts = blob.name.split('/');
            if (pathParts[0].toLowerCase() === course.toLowerCase() &&
                pathParts[1] === year && pathParts[3]) {
                blobList.push((pathParts[3] || '').split('-')[0]);
            }
        }

        const uniqueSubjects = [...new Set(blobList)];
        res.status(200).json({ success: true, subjects: uniqueSubjects });
    } catch (error) {
        console.error('Error fetching subjects for course and year:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects for course and year.',
            error: error.message
        });
    }
};


module.exports = {
    previewQuestionPapers,
    downloadQuestionPaper,
    getUniqueCourses,
    getYearsForCourse,
    getSubjectsForCourseAndYear
};



