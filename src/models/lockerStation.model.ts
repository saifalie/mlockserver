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
    const aggregateResult = await this.aggregate([
      // 1. Match the locker station by ID
      { $match: { _id: lockerStationId } },
  
      // 2. Join with ratingAndReviews collection
      {
        $lookup: {
          from: 'ratingandreviews',
          localField: 'ratingAndReviews',
          foreignField: '_id',
          as: 'reviews',
        },
      },
  
      // 3. Unwind reviews (safeguard against empty arrays)
      { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: false } },
  
      // 4. Validate rating is a number and project it
      {
        $project: {
          validRating: {
            $cond: {
              if: { $eq: [{ $type: '$reviews.rating' }, 'number'] },
              then: '$reviews.rating',
              else: null,
            },
          },
        },
      },
  
      // 5. Group and calculate average
      {
        $group: {
          _id: '$_id',
          averageRating: { $avg: '$validRating' },
        },
      },
    ]);
  
    // 6. Update the locker station's averageRating
    let averageRating = aggregateResult[0]?.averageRating ?? null;
    await this.findByIdAndUpdate(
      lockerStationId,
      { averageRating },
      { new: true }
    );
  };

// LockerStationSchema.statics.updateAverageRating = async function(
//     lockerStationId: Types.ObjectId
// ){
//     const aggregateResult = await this.aggregate([
//         {
//             $match:{
//                 _id:lockerStationId
//             }
//         },
//         {
//             $lookup:{
//                 from:'ratingandreviews',
//                 localField:'ratingAndReviews',
//                 foreignField:'_id',
//                 as:'reviews'
//             }
//         },
//         {
//             $unwind: '$reviews'
//         },
//         {
//             $group:{
//                 _id:'$_id',
//                 averageRating:{$avg :'$reviews.rating'}
//             }
//         }
//     ])

//     let averageRating = null;
//     if(aggregateResult.length >0){
//         averageRating =aggregateResult[0].averageRating
//     }

//     await this.findByIdAndUpdate(
//         lockerStationId,
//         {
//             averageRating:averageRating
//         },
//         {
//             new:true
//         }
//     )
// }

export const LockerStation = mongoose.model<LockerStation,LockerStationModel>('LockerStation', LockerStationSchema);

