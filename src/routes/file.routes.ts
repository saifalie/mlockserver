import { Router } from 'express';
import upload from '../config/multer.js';
import { uploadMedia } from '../controllers/file/upload.controller.js';
import { errorHandler } from '../utils/error-handler.js';

const fileRoutes: Router = Router();

fileRoutes.post('/upload', upload.single('image'), errorHandler(uploadMedia));

export default fileRoutes;
