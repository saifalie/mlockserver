import mongoose, { Schema } from 'mongoose';
const ratingSchema = new Schema({
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    locker_station: {
        type: Schema.Types.ObjectId,
        ref: 'LockerStation'
    }
}, { timestamps: true });
const reviewSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    locker_station: {
        type: Schema.Types.ObjectId,
        ref: 'LockerStation'
    },
    is_visible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
export const Rating = mongoose.model('Rating', ratingSchema);
export const Review = mongoose.model('Review', reviewSchema);
//# sourceMappingURL=rating&review.model.js.map