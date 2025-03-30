import mongoose, { Schema } from 'mongoose';
var WeekDay;
(function (WeekDay) {
    WeekDay["MONDAY"] = "Mon";
    WeekDay["TUESDAY"] = "Tue";
    WeekDay["WEDNESDAY"] = "Wed";
    WeekDay["THURSDAY"] = "Thu";
    WeekDay["FRIDAY"] = "Fri";
    WeekDay["SATURDAY"] = "Sat";
    WeekDay["SUNDAY"] = "Sun";
})(WeekDay || (WeekDay = {}));
const LockerStationSchema = new Schema({
    stationName: {
        type: String,
        required: true,
        // unique: true
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'MAINTENANCE'],
        default: 'CLOSED'
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    address: { type: String, required: true },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    ratingAndReviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'RatingAndReview'
        }
    ],
    averageRating: {
        type: Number,
        default: null
    },
    lockers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Locker'
        }
    ],
    openingHours: [
        {
            day: {
                type: String,
                enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                default: 'Mon'
            },
            opensAt: {
                type: String,
                default: '06:00'
            },
            closesAt: {
                type: String,
                default: '22:00'
            },
            isClosed: {
                type: Boolean,
                default: false
            }
        }
    ],
    markedFavourite: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true });
LockerStationSchema.statics.updateAverageRating = async function (lockerStationId) {
    try {
        const aggregateResult = await this.aggregate([
            { $match: { _id: lockerStationId } },
            {
                $lookup: {
                    from: 'ratingandreviews', // Make sure this matches your collection name exactly
                    localField: 'ratingAndReviews',
                    foreignField: '_id',
                    as: 'reviews',
                },
            },
            { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$_id',
                    averageRating: { $avg: '$reviews.rating' },
                    count: { $sum: 1 }
                },
            },
        ]);
        console.log('Aggregate result:', aggregateResult);
        let averageRating = null;
        if (aggregateResult.length > 0 && aggregateResult[0].count > 0) {
            averageRating = aggregateResult[0].averageRating;
        }
        const updated = await this.findByIdAndUpdate(lockerStationId, { averageRating }, { new: true });
        console.log('Updated locker station with average rating:', updated?.averageRating);
        return updated;
    }
    catch (error) {
        console.error('Error updating average rating:', error);
        throw error;
    }
};
export const LockerStation = mongoose.model('LockerStation', LockerStationSchema);
//# sourceMappingURL=lockerStation.model.js.map