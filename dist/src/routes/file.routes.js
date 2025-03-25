import { Router } from 'express';
import upload from '../config/multer.js';
import { uploadMedia } from '../controllers/file/upload.controller.js';
import { errorHanlder } from '../utils/error-handler.js';
const fileRoutes = Router();
fileRoutes.post('/upload', upload.single('image'), errorHanlder(uploadMedia));
export default fileRoutes;
//# sourceMappingURL=file.routes.js.map