import mongoose, { Document, Query, Schema, Types } from 'mongoose';
import { LockerStation } from './lockerStation.model.js';
import { NextFunction } from 'express';



interface RatingAndReview extends Document{
    rating:number;
    message:string;
    user:Types.ObjectId;
    lockerStation:Types.ObjectId;
    isVisible:boolean
}




const ratingAndReviewSchema = new Schema<RatingAndReview>(
    {
        rating:{
            type:Number,
            enum:[1,2,3,4,5]
        },
        message:{
            type:String,

        },
        user:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        lockerStation:{
            type:Schema.Types.ObjectId,
            ref:"LockerStation",
            required:true
        },
        isVisible:{
            type:Boolean,
            required:true,
            default:true
        }

    }
)



// Save Hook (works as-is)
ratingAndReviewSchema.post<RatingAndReview>(
    'save',
    async function (doc) {
        console.log(` save Updating average for station: ${doc.lockerStation}`);
      await LockerStation.updateAverageRating(doc.lockerStation);
    }
  );

// Fix for findOneAndUpdate (post-hook)
ratingAndReviewSchema.post<RatingAndReview>(
    'findOneAndUpdate',
    async function (doc: RatingAndReview | null) {
        
      if (doc) {
        console.log(`findoneandupdateg Updating average for station: ${doc.lockerStation}`);
        await LockerStation.updateAverageRating(doc.lockerStation);
      }
    }
  );
// Fix for deleteOne (pre-hook)
ratingAndReviewSchema.pre<Query<any, RatingAndReview>>(
    'deleteOne',
    async function (this: Query<any, RatingAndReview>, next) {
      const doc = await this.model.findOne(this.getFilter());
      if (doc) {
        console.log(`deleteone Updating average for station: ${doc.lockerStation}`);
        await LockerStation.updateAverageRating(doc.lockerStation);
      }
      next();
    }
  );

export const RatingAndReview = mongoose.model<RatingAndReview>('RatingAndReview',ratingAndReviewSchema);
