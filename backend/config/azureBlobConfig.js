// config/azureBlobConfig.js
const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
    throw new Error('Azure Storage Connection String is not configured');
}

// Create the BlobServiceClient using the connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerName = process.env.AZURE_CONTAINER_NAME;

if (!containerName) {
    throw new Error('Azure Container Name is not configured');
}

const containerClient = blobServiceClient.getContainerClient(containerName);

// Generate SAS URL for a specific blob
const generateSasUrl = async (blobName) => {
    const blobClient = containerClient.getBlobClient(blobName);
    const startsOn = new Date();
    const expiresOn = new Date(startsOn);
    expiresOn.setMinutes(startsOn.getMinutes() + 60);

    const sasUrl = await blobClient.generateSasUrl({
        permissions: 'r',
        expiresOn,
        contentType: 'application/pdf'
    });

    return sasUrl;
};

console.log('Azure Config Initialized for container:', containerName);

module.exports = {
    containerClient,
    generateSasUrl
};



