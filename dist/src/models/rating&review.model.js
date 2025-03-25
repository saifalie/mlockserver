import mongoose, { Schema } from 'mongoose';
import { LockerStation } from './lockerStation.model.js';
const ratingAndReviewSchema = new Schema({
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    message: {
        type: String,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lockerStation: {
        type: Schema.Types.ObjectId,
        ref: "LockerStation",
        required: true
    },
    isVisible: {
        type: Boolean,
        required: true,
        default: true
    }
});
// Save Hook (works as-is)
ratingAndReviewSchema.post('save', async function (doc) {
    console.log(` save Updating average for station: ${doc.lockerStation}`);
    await LockerStation.updateAverageRating(doc.lockerStation);
});
// Fix for findOneAndUpdate (post-hook)
ratingAndReviewSchema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
        console.log(`findoneandupdateg Updating average for station: ${doc.lockerStation}`);
        await LockerStation.updateAverageRating(doc.lockerStation);
    }
});
// Fix for deleteOne (pre-hook)
ratingAndReviewSchema.pre('deleteOne', async function (next) {
    const doc = await this.model.findOne(this.getFilter());
    if (doc) {
        console.log(`deleteone Updating average for station: ${doc.lockerStation}`);
        await LockerStation.updateAverageRating(doc.lockerStation);
    }
    next();
});
export const RatingAndReview = mongoose.model('RatingAndReview', ratingAndReviewSchema);
//# sourceMappingURL=rating&review.model.js.map