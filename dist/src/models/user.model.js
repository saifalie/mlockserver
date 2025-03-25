import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_EXPIRY, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRY, REFRESH_TOKEN_SECRET } from '../../secrets.js';
import { InternalException } from '../errors/internal-exception.js';
import { ErrorCode } from '../errors/root.js';
// Define the user schema
const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    profile_picture: {
        type: String
    },
    current_locker: {
        type: Schema.Types.ObjectId,
        ref: 'Locker'
    },
    location: {
        type: { type: String, required: false },
        coordinates: []
    },
    favourite: [
        {
            type: Schema.Types.ObjectId,
            ref: 'LockerStation'
        }
    ],
    history: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Booking'
        }
    ]
}, { timestamps: true });
// Implement the createAccessToken method
userSchema.methods.createAccessToken = function () {
    // Check if the ACCESS_TOKEN_SECRET is defined
    if (!ACCESS_TOKEN_SECRET) {
        throw new InternalException('ACCESS_TOKEN_SECRET is not defined', ErrorCode.SECRET_KEY_NOT_FOUND, { message: 'accessTokenSecretNotFound' });
    }
    // Sign and return a JWT access token with user data and an expiry time
    return jwt.sign({
        id: this._id,
        full_name: this.name,
        email: this.email
    }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};
// Implement the createRefreshToken method
userSchema.methods.createRefreshToken = function () {
    // Check if the REFRESH_TOKEN_SECRET is defined
    if (!REFRESH_TOKEN_SECRET) {
        throw new InternalException('REFRESH_TOKEN_SECRET is not defined', ErrorCode.SECRET_KEY_NOT_FOUND, { message: 'refreshTokenSecretNotFound' });
    }
    // Sign and return a JWT refresh token with user data and an expiry time
    return jwt.sign({
        id: this._id,
        email: this.email
    }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    });
};
export const User = mongoose.model('User', userSchema);
//# sourceMappingURL=user.model.js.map