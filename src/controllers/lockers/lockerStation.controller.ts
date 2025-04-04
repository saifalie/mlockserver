import { NextFunction, Request, Response } from 'express';
import { InternalException } from '../../errors/internal-exception.js';
import { ErrorCode } from '../../errors/root.js';
import { LockerStation } from '../../models/lockerStation.model.js';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../utils/apiResponse.js';
import { NotFoundException } from '../../errors/not-found.js';
import { BadRequestException } from '../../errors/bad-request.js';
import { RatingAndReview } from '../../models/rating&review.model.js';
import { Types } from 'mongoose';
import { User } from '../../models/user.model.js';

export const getAllLockerStations = async (req: Request, res: Response) => {
    try {
        const result = await LockerStation.find().populate({
            path: 'ratingAndReviews',
            populate: {
                path: 'user',
                model: 'User'
            }
        });
        console.log(new Date());
        console.log(result);
        

        return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, result, 'success'));
    } catch (error) {
        console.log('Failed to get the lockerStations', error);
        throw new InternalException('Failed to get the all lockerStations', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};
export const getLockerStationNearMe = async (req: Request, res: Response) => {
    const { longitude, latitude } = req.query;
    console.log('long:',longitude,'lat: ',latitude);
    
    try {
        const lockerStations = await LockerStation.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[latitude, longitude], 0.621371 / 3963.2]
                }
            }
        }).select('stationName status address ratingAndReviews markedFavourite images location');
        console.log(lockerStations);

        return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, lockerStations, 'success'));
    } catch (error) {
        console.log('Failed to get the lockerStations', error);
        throw new InternalException('Failed to get the all lockerStations', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};

export const getLockerStationById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { lockerStationId } = req.params;
      

        if (!lockerStationId) {
            throw new NotFoundException('LockerId not found', ErrorCode.LOCKER_NOT_FOUND);
        }

        const lockerStation = await LockerStation.findById(lockerStationId)
            .populate({
                path: 'ratingAndReviews',
                select: 'user rating message isVisible',
                populate: {
                    path: 'user',
                    select: 'name profilePicture'
                }
            })
            .populate({
                path: 'lockers',
                select: 'lockerNumber status size rentalPrice doorStatus'
            })
            .exec();


            const user = await User.findById(req.user.id).select('currentLocker')

            console.log('hasActiveBooking: ',user?.currentLocker ? true:false);
            



        if (!lockerStation) {
            throw new NotFoundException('Locker Station not found', ErrorCode.LOCKER_NOT_FOUND);
        }

        console.log('detail Station:',lockerStation);
        console.log('average rating:',lockerStation.averageRating);

        const stationData = lockerStation.toJSON({virtuals:true})
        

        return res.status(StatusCodes.OK).json(
            new ApiResponse(
                StatusCodes.OK,
                {
                    lockerStation: stationData,
                    averageRating:lockerStation.averageRating,
                    hasActiveBooking:user?.currentLocker ?true:false

                    // RatingAndReviews: lockerStation.ratingAndReviews,
                    // lockers: lockerStation.lockers,
                    // openingHours: lockerStation.openingHours
                },
                'success'
            )
        );
    } catch (error) {
        console.log('Failed to get lockerStaion', error);
        throw new InternalException('Failed to get the lockerStation', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};


export const createRating = async(req:Request, res:Response,next:NextFunction) =>{
   try {
     const { rating, message, lockerStationId } = req.body;
     const userId =  req.user.id;
 
     if (!rating) {
         throw new BadRequestException('Rating is required', ErrorCode.RATING_NOT_FOUND);
     }
 
     // Check if user already rated this station
     const existingRating = await RatingAndReview.findOne({
         user: userId,
         lockerStation:lockerStationId
     });
 
    //  if (existingRating) {
    //      throw new InternalException('You have already rated this station',ErrorCode.ALREADY_RATED,{message:'You have already rated this station'});
    //  }
 
 
     const ratingDoc = await RatingAndReview.create({
         rating,
         message,
         user: userId,
         lockerStation:lockerStationId
     });

     const lockerStation = await LockerStation.findById(lockerStationId);

     if(!lockerStation){
        throw new NotFoundException('Not found lockerstation',ErrorCode.LOCKERSTATION_NOT_FOUND)
     }

     lockerStation.ratingAndReviews.push(ratingDoc._id as Types.ObjectId )
     await lockerStation.save();


     res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED,{success:true, data:ratingDoc}))
 
     
 
   } catch (error) {
    console.log('Creating rating error :',error);
    throw new InternalException('Creating rating error',ErrorCode.RATING_ERROR,error)
    
   }
}



export const toggleSaveStation = async (req: Request, res: Response) => {
    try {
        console.log('removing it ');
        
        const { lockerStationId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
        }

        const lockerStationObjectId = new Types.ObjectId(lockerStationId);
        
        const stationIndex = user.favourite.findIndex(id => id.equals(lockerStationObjectId));
        
        if (stationIndex === -1) {
            // Add to favorites
            user.favourite.push(lockerStationObjectId);
        } else {
            // Remove from favorites
            user.favourite.splice(stationIndex, 1);
        }

        await user.save();
        res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { isSaved: stationIndex === -1 }, 'Success'));

    } catch (error) {
        console.log('Toggle save error:', error);
        throw new InternalException('Failed to toggle save status', ErrorCode.INTERNAL_EXCEPTION, error); 
    }
}


export const checkStationSaved = async (req: Request, res: Response) => {
    try {
        const { lockerStationId } = req.params;
        const userId = req.user.id;

        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
        }

        const lockerStationObjectId = new Types.ObjectId(lockerStationId);
        const isSaved = user.favourite.some(id => id.equals(lockerStationObjectId));

        res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { isSaved }, 'Success'));
        
    } catch (error) {
        console.log('Check saved error:', error);
        throw new InternalException('Failed to check save status', ErrorCode.INTERNAL_EXCEPTION, error);
    }
}


export const getSavedStations = async (req: Request, res: Response) => {
    console.log('saved station callllgasldgllaagakgghghasdghghaisghaisghasdghasdghiosdahgiasdhgiadshga');
    
    try {
        const userId = req.user.id;
        console.log('saved stations userID:',req.user.id);
        
        
        const user = await User.findById(userId).select('favourite')
            .populate({
                path: 'favourite',
                select: 'stationName status address images location averageRating',
                // populate: {
                //     path: 'ratingAndReviews',
                //     select: 'rating'
                // }
            });

        if (!user) {
            throw new NotFoundException('User not found', ErrorCode.USER_NOT_FOUND);
        }

        console.log('savedStations:  ',user);
        

        res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, user.favourite, 'Saved stations retrieved')
        );
    } catch (error) {
        console.log('Error fetching saved stations:', error);
        throw new InternalException('Failed to get saved stations', ErrorCode.INTERNAL_EXCEPTION, error);
    }
};