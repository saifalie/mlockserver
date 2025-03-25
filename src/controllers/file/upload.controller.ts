import { Request, Response } from 'express';
import { BadRequestException } from '../../errors/bad-request.js';
import { ErrorCode } from '../../errors/root.js';
import { InternalException } from '../../errors/internal-exception.js';
import cloudinary from '../../config/cloudinary.js';
import { Transform } from 'stream';
import streamifier from 'streamifier';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../utils/apiResponse.js';

export const uploadMedia = async (req: Request, res: Response) => {
    if (!req.file || !req.file.size) {
        throw new BadRequestException('No file or media type provided', ErrorCode.FIELDS_NOT_FOUND);
    }
    try {
        const streamUpload = (req: Request): Promise<any> => {
            return new Promise((resolve, reject) => {
                let uploadedBytes = 0;
                const totalBytes = req.file!.size;

                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'profile_pictures',
                        use_filename: false,
                        unique_filename: false,
                        overwrite: false,
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (result) {
                            console.log(result);
                            resolve(result);
                        } else {
                            console.error(error);
                            reject(error);
                        }
                    }
                );

                const progressStream = new Transform({
                    transform(chunk, encoding, callback) {
                        uploadedBytes += chunk.length;
                        const progress = totalBytes ? (uploadedBytes / totalBytes) * 100 : 0;
                        console.log(`Upload progress: ${progress.toFixed(2)}%`);
                        callback(null, chunk);
                    }
                });

                streamifier.createReadStream(req.file!.buffer).pipe(progressStream).pipe(uploadStream);
            });
        };

        const result = await streamUpload(req);
        res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                {
                    mediaUrl: result.secure_url
                },
                'Successfully uploaded the media file'
            )
        );
    } catch (error) {
        console.error('UPLOAD FILE: ', error);
        throw new InternalException('Media upload failed', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};
