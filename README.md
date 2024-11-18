Exambuddy
Exambuddy is a web application designed to facilitate the management and sharing of question papers for students. It allows users to upload, preview, and download question papers, while also providing functionalities for user authentication and email verification.

Features
User Authentication: Users can sign up, log in, and verify their email addresses.
Question Paper Management: Admin users can upload question papers categorized by course, year, subject, and exam type.
Preview and Download: Users can preview and download question papers with added watermarks for security.
Password Reset: Users can reset their passwords via email links.
Email Notifications: Users receive verification and password reset emails.
Technologies Used
Node.js: Server-side JavaScript runtime.
Express.js: Web framework for building APIs.
MongoDB: NoSQL database for storing user and question paper information.
Mongoose: ODM for MongoDB to define schemas and interact with the database.
Azure Blob Storage: For storing and managing question paper files.
JSON Web Tokens (JWT): For user authentication and authorization.
Nodemailer: For sending emails (verification and password reset).
PDF-lib: For manipulating PDF files (adding watermarks).
Installation
Clone the repository:

bash

Verify

Open In Editor
Edit
Copy code
git clone https://github.com/Vinaymore1/Exambuddy.git
cd Exambuddy
Install dependencies:

bash

Verify

Open In Editor
Edit
Copy code
npm install
Create a .env file in the root directory and add the following environment variables:

plaintext

Verify

Open In Editor
Edit
Copy code
PORT=your_port
MONGO_URI=your_mongo_uri
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
AZURE_CONTAINER_NAME=your_azure_container_name
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
ADMIN_KEY=your_admin_key
BASE_URL=your_base_url
FRONTEND_URL=your_frontend_url
JWT_SECRET=your_jwt_secret
Start the server:

bash

Verify

Open In Editor
Edit
Copy code
npm start
API Endpoints
Authentication
POST /api/auth/signup: Create a new user account.
POST /api/auth/login: Log in an existing user.
GET /api/auth/verify-email: Verify user email.
POST /api/auth/resend-verification: Resend verification email.
POST /api/auth/forgot-password: Request a password reset.
POST /api/auth/reset-password: Reset user password.
Question Papers
POST /api/admin/upload: Upload a new question paper (Admin only).
GET /api/preview/papers: Preview question papers based on filters (course, year, subject, exam type).
GET /api/preview/papers/download/:blobPath: Download a specific question paper.
GET /api/preview/courses: Get unique courses.
GET /api/preview/courses/:course/years: Get years for a specific course.
GET /api/preview/courses/:course/years/:year/subjects: Get subjects for a specific course and year.
Middleware
Auth Middleware: Protects routes requiring authentication.
Admin Middleware: Restricts access to admin-only routes.
Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.
