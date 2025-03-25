import { InternalException } from '../../errors/internal-exception.js';
import { ErrorCode } from '../../errors/root.js';
import { LockerStation } from '../../models/lockerStation.model.js';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../utils/apiResponse.js';
import { NotFoundException } from '../../errors/not-found.js';
import { BadRequestException } from '../../errors/bad-request.js';
import { RatingAndReview } from '../../models/rating&review.model.js';
export const getAllLockerStations = async (req, res) => {
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
    }
    catch (error) {
        console.log('Failed to get the lockerStations', error);
        throw new InternalException('Failed to get the all lockerStations', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};
export const getLockerStationNearMe = async (req, res) => {
    const { longitude, latitude } = req.query;
    console.log('long:', longitude, 'lat: ', latitude);
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
    }
    catch (error) {
        console.log('Failed to get the lockerStations', error);
        throw new InternalException('Failed to get the all lockerStations', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};
export const getLockerStationById = async (req, res, next) => {
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
        if (!lockerStation) {
            throw new NotFoundException('Locker Station not found', ErrorCode.LOCKER_NOT_FOUND);
        }
        console.log('detail Station:', lockerStation);
        console.log('detail Station:', lockerStation.averageRating);
        const stationData = lockerStation.toJSON({ virtuals: true });
        return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, {
            lockerStation: stationData,
            averageRating: lockerStation.averageRating
            // RatingAndReviews: lockerStation.ratingAndReviews,
            // lockers: lockerStation.lockers,
            // openingHours: lockerStation.openingHours
        }, 'success'));
    }
    catch (error) {
        console.log('Failed to get lockerStaion', error);
        throw new InternalException('Failed to get the lockerStation', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};
export const createRating = async (req, res, next) => {
    try {
        const { rating, message, lockerStationId } = req.body;
        const userId = req.user.id;
        if (!rating) {
            throw new BadRequestException('Rating is required', ErrorCode.RATING_NOT_FOUND);
        }
        // Check if user already rated this station
        const existingRating = await RatingAndReview.findOne({
            user: userId,
            lockerStation: lockerStationId
        });
        //  if (existingRating) {
        //      throw new InternalException('You have already rated this station',ErrorCode.ALREADY_RATED,{message:'You have already rated this station'});
        //  }
        const ratingDoc = await RatingAndReview.create({
            rating,
            message,
            user: userId,
            lockerStation: lockerStationId
        });
        const lockerStation = await LockerStation.findById(lockerStationId);
        if (!lockerStation) {
            throw new NotFoundException('Not found lockerstation', ErrorCode.LOCKERSTATION_NOT_FOUND);
        }
        lockerStation.ratingAndReviews.push(ratingDoc._id);
        res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, { success: true, data: ratingDoc }));
    }
    catch (error) {
        console.log('Creating rating error :', error);
        throw new InternalException('Creating rating error', ErrorCode.RATING_ERROR, error);
    }
};
//# sourceMappingURL=lockerStation.controller.js.map