import mongoose, { Document, Schema, Types } from 'mongoose';

enum WeekDay {
    MONDAY = 'Mon',
    TUESDAY = 'Tue',
    WEDNESDAY = 'Wed',
    THURSDAY = 'Thu',
    FRIDAY = 'Fri',
    SATURDAY = 'Sat',
    SUNDAY = 'Sun'
}

interface LockerStationModel extends mongoose.Model<LockerStation>{
    updateAverageRating(lockerStationId: Types.ObjectId):Promise<void>
}

interface LockerStation extends Document {
    stationName: string;
    status: 'OPEN' | 'CLOSED' | 'MAINTENANCE';
    location: {
        type: string;
        coordinates: [];
    };
    address: string;
    images: { url: string }[];
    ratingAndReviews: Types.ObjectId[];
    averageRating:Number
    lockers: Types.ObjectId[];
    openingHours: {
        day: WeekDay;
        opensAt: string;
        closesAt: string;
        isClosed: boolean;
    }[];
    markedFavourite: Types.ObjectId[];
}

const LockerStationSchema = new Schema<LockerStation>(
    {
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
        averageRating:{
            type:Number,
            default:null
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
    },
    { timestamps: true }
);

LockerStationSchema.statics.updateAverageRating = async function (
    lockerStationId: Types.ObjectId
  ) {
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
  
      const updated = await this.findByIdAndUpdate(
        lockerStationId,
        { averageRating },
        { new: true }
      );
      
      console.log('Updated locker station with average rating:', updated?.averageRating);
      
      return updated;
    } catch (error) {
      console.error('Error updating average rating:', error);
      throw error;
    }
  };


export const LockerStation = mongoose.model<LockerStation,LockerStationModel>('LockerStation', LockerStationSchema);

