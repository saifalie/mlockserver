import { Request, Response } from 'express';
import { BadRequestException } from '../../errors/bad-request.js';
import { ErrorCode } from '../../errors/root.js';
import jwt from 'jsonwebtoken';
import { REFRESH_TOKEN_SECRET } from '../../../secrets.js';
import { User } from '../../models/user.model.js';
import { NotFoundException } from '../../errors/not-found.js';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../utils/apiResponse.js';
import { UnauthoirzedException } from '../../errors/unauthorized.js';
import admin from '../../config/firebase.js';
import { InternalException } from '../../errors/internal-exception.js';
import { profile } from 'console';

export const signInWithGoogle = async (req: Request, res: Response) => {
    const { name, profilePicture, idToken, fcmToken } = req.body;
    console.log(idToken);

    console.log('got the signin request');
    console.log(idToken,'idtoken');
    

    if (!idToken) {
        throw new UnauthoirzedException('ID token is required', ErrorCode.INVALID_TOKEN);
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        const verifiedEmail = decodedToken.email;

        if (!verifiedEmail) {
            throw new UnauthoirzedException('Invalid Token or expired', ErrorCode.SECRET_KEY_NOT_FOUND);
        }

        let user = await User.findOne({ email: verifiedEmail });

        if (user) {
            console.log('user is there');
               // Update FCM token if provided
        if (fcmToken) {
            user.fcmToken = fcmToken;
            await user.save();
        }

            const newAccessToken = user.createAccessToken() as string;
            const newRefreshToken = user.createRefreshToken() as string;

            console.log('access', newAccessToken);
            console.log('refresh', newRefreshToken);

            return res.status(StatusCodes.OK).json(
                new ApiResponse(
                    StatusCodes.OK,
                    {
                        user: {
                            name: user.name,
                            email: user.email,
                            profilePicture: user.profilePicture,
                            id: user._id
                        },
                        tokens: {
                            accessToken: newAccessToken,
                            refreshToken: newRefreshToken
                        }
                    },
                    'User logged In'
                )
            );
        }

        if (!name || !profilePicture) {
            throw new BadRequestException('Missing required fields for registeration: name, profilePicture', ErrorCode.FIELDS_NOT_FOUND);
        }

        user = new User({
            email: verifiedEmail,
            name: name || '',
            profilePicture: profilePicture || 'profilePicture',
            fcmToken:fcmToken || ''
        });

        await user.save();

        const accessToken = user.createAccessToken();
        const refreshToken = user.createRefreshToken();

        res.status(StatusCodes.CREATED).json(
            new ApiResponse(
                StatusCodes.CREATED,
                {
                    user: {
                        name: user.name,
                        id: user._id,
                        profilePicture: user.profilePicture,
                        email: user.email
                    },
                    tokens: {
                        accessToken: accessToken,
                        refreshToken: refreshToken
                    }
                },
                'SuccessFully register the user'
            )
        );
    } catch (error) {
        console.error('SIGNUP/LOGIN: ', error);

        throw new InternalException('Failed to Login/Signup the user', ErrorCode.AUTH_INTERNAL_EXCEPTION, error);
    }
};

export const refresthToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    console.log('refresh token: ',refreshToken);
    
    if (!refreshToken) {
        throw new BadRequestException('Refresh token is required', ErrorCode.SECRET_KEY_NOT_FOUND);
    }

    if (!REFRESH_TOKEN_SECRET) {
        throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }

    try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;

        const user = await User.findById(payload.id);

        if (!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
        }

        const newAccessToken = user.createAccessToken();
        const newRefreshToken = user.createRefreshToken();

        res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Refresh the tokens Successfully')
        );
    } catch (error) {
        console.log('REFRESH_TOKENS: ', error);
        throw new UnauthoirzedException('Invalid Refresh Token', ErrorCode.INVALID_TOKEN);
    }
};


export const getUser = async(req:Request, res:Response)=>{

    try {
        const user = await User.findById(req.user.id).select('name email currentLocker profilePicture location')

        console.log('user --- getuser: ',user);
        


        res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK,user));

    } catch (error) {
        console.log('GETUSER method auth.controller error: ',error);
        throw new InternalException('Failed to fetch the user data',ErrorCode.AUTH_INTERNAL_EXCEPTION,error);
        
    }
}

export const updateFcmToken = async (req: Request, res: Response) => {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
        throw new BadRequestException('FCM token is required', ErrorCode.FIELDS_NOT_FOUND);
    }
    
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
        }
        
        user.fcmToken = fcmToken;
        await user.save();
        
        res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                { message: 'FCM token updated successfully' },
                'FCM token updated'
            )
        );
    } catch (error) {
        console.error('UPDATE_FCM_TOKEN: ', error);
        throw new InternalException('Failed to update FCM token', ErrorCode.AUTH_INTERNAL_EXCEPTION, error);
    }
};