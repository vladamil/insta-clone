// Stops the server at startup if a required variable is missing or empty
const REQUIRED = [
   'MONGO_URL',
   'JWT_SECRET',
   'CLIENT_URL',
   'RESEND_API_KEY',
   'CLOUDINARY_CLOUD_NAME',
   'CLOUDINARY_API_KEY',
   'CLOUDINARY_API_SECRET',
];

const missing = REQUIRED.filter((name) => !process.env[name]);

if (missing.length > 0) {
   console.error('Missing environment variables:', missing.join(', '));
   process.exit(1);
}
