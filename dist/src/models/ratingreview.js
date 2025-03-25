import { Schema } from 'mongoose';
const ratingReviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    }
});
//# sourceMappingURL=ratingreview.js.map