import { InternalException } from '../../errors/internal-exception.js';
import { ErrorCode } from '../../errors/root.js';
import { LockerStation } from '../../models/lockerStation.model.js';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../utils/apiResponse.js';
import { NotFoundException } from '../../errors/not-found.js';
export const getAllLockerStations = async (req, res) => {
    try {
        const result = await LockerStation.find().populate({
            path: 'ratings',
            populate: {
                path: 'user',
                model: 'User'
            }
        });
        console.log(new Date());
        return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, result, 'success'));
    }
    catch (error) {
        console.log('Failed to get the lockerStations', error);
        throw new InternalException('Failed to get the all lockerStations', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};
export const getLockerStationNearMe = async (req, res) => {
    const { longitude, latitude } = req.query;
    try {
        const lockerStations = await LockerStation.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[latitude, longitude], 0.621371 / 3963.2]
                }
            }
        }).select('station_name status address ratings markedFavourite images location');
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
            path: 'ratings',
            select: 'rating user',
            populate: {
                path: 'user',
                select: 'name profile_picture'
            }
        })
            .populate({
            path: 'lockers',
            select: 'locker_number status size rental_price'
        })
            .populate('reviews')
            .exec();
        if (!lockerStation) {
            throw new NotFoundException('Locker Station not found', ErrorCode.LOCKER_NOT_FOUND);
        }
        return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, {
            lockerStation,
            ratings: lockerStation.ratings,
            lockers: lockerStation.lockers,
            opening_hours: lockerStation.opening_hours
        }, 'success'));
    }
    catch (error) {
        console.log('Failed to get lockerStaion', error);
        throw new InternalException('Failed to get the lockerStation', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
    }
};
//# sourceMappingURL=lockerStation.controller.js.map