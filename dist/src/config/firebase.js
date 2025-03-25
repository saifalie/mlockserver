import admin from 'firebase-admin';
import fs from 'fs';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// console.log('__filename:', __filename);
// console.log('__dirname:', __dirname);
// const serviceAccountPath = path.resolve(__dirname, '../../mlock-5e819-firebase-adminsdk-jxc0m-dd65bea5e2.json');
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
    throw new Error('Firebase service account path not set');
}
// console.log('serviceAccountPath:', serviceAccountPath);
// Verify file exists before initializing
if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Service account file not found at ${serviceAccountPath}`);
}
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
// console.log('serviceAccount:', serviceAccount);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
export default admin;
//# sourceMappingURL=firebase.js.map