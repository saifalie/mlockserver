import { NextFunction, Request, Response } from 'express';
import Razorpay from 'razorpay';
import razorpay from '../../config/razopay.js';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../utils/apiResponse.js';
import { Booking, PaymentStatus } from '../../models/booking.model.js';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../../../secrets.js';
import { Payment, PaymentType } from '../../models/payment.model.js';
import * as crypto from 'crypto';
import { InternalException } from '../../errors/internal-exception.js';
import { ErrorCode } from '../../errors/root.js';
import { NotFoundException } from '../../errors/not-found.js';
import mongoose, { Types } from 'mongoose';
import { User } from '../../models/user.model.js';
import { ILocker, Locker } from '../../models/locker.model.js';
import { log } from 'util';
import { LockerControllerService } from '../../mqtt/lockerController.service.js';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    const { amount, currency, lockerId, duration, rentalPrice,lockerStationId } = req.body;



    console.log('amount: ',amount,'currency: ', currency, 'lockerId: ',lockerId,'duration: ', duration,'rentailPrice:', rentalPrice,'lockerStationId: ',lockerStationId);
    console.log('userId: ',req.user.id);

    const options = {
        amount: amount * 100.0,
        currency,
        receipt: `receipt_${Date.now()}`
    };

    try {

        let bookingPayment;

        try {
            
           bookingPayment = await razorpay.orders.create(options);
        } catch (error) {
            console.log('razorpay booking payment error: ',error);
            
        }

        const booking = await Booking.create({
            user: req.user.id,
            locker:lockerId,
            lockerStation:lockerStationId,
            duration:1,
            rentalPrice,
            paymentStatus: PaymentStatus.PENDING
        });


        res.status(StatusCodes.CREATED).json(
            new ApiResponse(
                StatusCodes.CREATED,
                {
                    payment: bookingPayment,
                    booking: booking
                },
                'booking created'
            )
        );
    } catch (error) {
        console.log('Booking creating failed: ',error);
        next(new InternalException('Booking creation failed', ErrorCode.FILE_INTERNAL_EXCEPTION, error));
    }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
    console.log('verify payment called');
    const session = await  mongoose.startSession()
    session.startTransaction();

    const { orderId, paymentId, signature, amount, currency, status, method ,bookingId, lockerId,lockerStationId} = req.body;

    try {

     if (!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)) {
           throw new InternalException('Credentials not found', ErrorCode.SECRET_KEY_NOT_FOUND, { message: 'razopay credentials not found' });
        }

        const generateSignature = crypto.createHmac('sha256',RAZORPAY_KEY_SECRET).update(orderId+ '|' + paymentId)
        .digest('hex')

        if(generateSignature !== signature){
            console.log('signature not matched');
            throw new InternalException('Signature not matched!',ErrorCode.INVALID_TOKEN,{message:"signature not matched"})
            
        }

        const payment =  new Payment({
            orderId:orderId,
            paymentId:paymentId,
            signature:signature,
            amount,
            currency,
            status,
            method,
            paymentType:PaymentType.INITIAL
        })

        await payment.save({session})


        const booking = await Booking.findById(bookingId).session(session);
        const user = await User.findById(req.user.id).session(session);
        const locker = await Locker.findById(lockerId).session(session);

        if(!booking){
            throw new NotFoundException('Booking not found',ErrorCode.FILE_NOT_FOUND)
        }
        if(!user){
            throw new NotFoundException('User not found',ErrorCode.USER_NOT_FOUND)
        }
        if(!locker){
            throw new NotFoundException('Locker not found',ErrorCode.LOCKER_NOT_FOUND)
        }

        // Date handling
        const checkinTime = new Date() 
        // const checkoutTime = new Date(checkinTime.getTime() + booking.duration * 60 * 1000) 
        const checkoutTime = new Date(checkinTime.getTime() + 1 * 60 * 1000) 

        //update booking
        booking.checkinTime = checkinTime;
        booking.checkoutTime = checkoutTime;
        booking.paymentStatus = PaymentStatus.PAID;
        booking.payments.push(payment._id as Types.ObjectId);
        

        // Update user
        user.currentLocker = lockerId;
        user.history.push(booking._id as Types.ObjectId);

        // Update locker
        locker.currentUser = req.user.id;
        locker.checkinTime = checkinTime;
        locker.expectedCheckoutTime = checkoutTime;
        locker.status = 'BOOKED'


        await Promise.all([
            booking.save({session}),
            user.save({session}),
            locker.save({session})
        ])

        await session.commitTransaction();

        try {

            const lockerNumber =  (locker.lockerNumber).toString()

            await LockerControllerService.openLocker(lockerNumber);

            console.log(`Locker ${lockerNumber} opened for user ${user._id}`);
            
        } catch (lockerError) {
            console.error(`Failed to open locke, but transaction was successful: ${lockerError}`);
            
        }

        res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, {payment,booking}, 'payment successfully processed and booking updated'));


        
    } catch (error) {
        await session.abortTransaction()
        console.log('Payment verification failed error: ',error);
        throw new InternalException('Payment verification failed',ErrorCode.FILE_INTERNAL_EXCEPTION,error)

        
    }finally{
        session.endSession()
    }
    

};


export const fetchBookingDetails =  async (req:Request, res:Response) =>{

    try {

        const booking = await Booking.findOne({user:req.user.id,paymentStatus:PaymentStatus.PAID || PaymentStatus.OVERDUE, isExpired:false})
        .sort({ createdAt: -1 }) 
        .populate({
            path:'locker',
            select:'lockerNumber doorStatus size rentalPrice'
        })
        .populate({
            path:'lockerStation',
            select:'stationName status location address openingHours'
        })

        if(!booking){
            return res.status(404).json(new ApiResponse(StatusCodes.NOT_FOUND,{message:'no booking found'},'success'))
        }

        console.log('fetchbookingdetails: ',booking);

        res.status(200).json(new ApiResponse(StatusCodes.OK,booking,'success'))
        
    } catch (error) {
        if (!(error instanceof NotFoundException)) {
            console.log('Unexpected error:', error);
            throw new InternalException('Failed to get booking', ErrorCode.FILE_INTERNAL_EXCEPTION, error);
        }
        
        // Re-throw NotFoundException to be handled by global handler
        throw error; 
    }
}


export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookingId,reason } = req.body;
        const userId = req.user.id;

        // 1. Find and validate booking
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) {
            throw new NotFoundException('Booking not found', ErrorCode.FILE_NOT_FOUND);
        }

        // 2. Verify ownership
        if (booking.user.toString() !== userId) {
            throw new InternalException('Unauthorized to cancel booking', ErrorCode.HTTP_UNAUTHORIZED,{message:'Unauthorized to cancel booking'});
        }

        // 3. Check current status
        if (booking.paymentStatus === PaymentStatus.CANCELLED) {
            throw new InternalException('Booking already cancelled', ErrorCode.INTERNAL_EXCEPTION,{message:'Booking already cancelled'});
        }

        // 4. Free resources only for PAID bookings
        if (booking.paymentStatus === PaymentStatus.PAID) {
            // Release locker
            const locker = await Locker.findById(booking.locker).session(session);
            if (locker) {
                locker.currentUser = null;
                locker.checkinTime = null;
                locker.expectedCheckoutTime = null;
                locker.status = 'AVAILABLE';
                await locker.save({ session });
            }

            // Clear user's current locker
            const user = await User.findById(userId).session(session);
            if (user?.currentLocker?.equals(booking.locker)) {
                user.currentLocker = null;
                await user.save({ session });
            }
        }

        // 5. Update booking status
        booking.paymentStatus = PaymentStatus.CANCELLED;
        await booking.save({ session });

        await session.commitTransaction();
        
        res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, { booking }, 'Booking cancelled successfully')
        );
    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};




export const processExtraTimePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingId, amount, extraTimeSeconds   } = req.body;
        const booking = await Booking.findById(bookingId);
        
        if (!booking) {
            throw new NotFoundException('Booking not found', ErrorCode.FILE_NOT_FOUND);
        }

        // Create Razorpay order without creating payment record
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: `extra_time_${Date.now()}`,
            notes: { bookingId,extraTimeSeconds: extraTimeSeconds.toString() }
        });

        res.status(StatusCodes.OK).json({
            payment: razorpayOrder,
            key: RAZORPAY_KEY_ID
        });

    } catch (error) {
        next(error);
    }
};

export const verifyCheckoutPayment = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { orderId, paymentId, signature, bookingId, amount } = req.body;

           // Get Razorpay order to access notes
           const razorpayOrder = await razorpay.orders.fetch(orderId);
           const extraTimeSeconds = parseInt(
            razorpayOrder!.notes?.extraTimeSeconds?.toString() || "0" // Add optional chaining for `notes`
          );

        if (!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)) {
            throw new InternalException('Credentials not found', ErrorCode.SECRET_KEY_NOT_FOUND, { message: 'razopay credentials not found' });
         }
 

        // 1. Signature verification (same as initial booking)
        const generatedSignature = crypto
            .createHmac('sha256', RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        if (generatedSignature !== signature) {
            throw new InternalException('Invalid signature', ErrorCode.INVALID_TOKEN,{message:'signature invalid'});
        }

        // 2. Create payment record (like initial booking)
        const payment = new Payment({
            orderId,
            paymentId,
            signature,
            amount: Number(razorpayOrder.amount) / 100,
            currency: 'INR',
            status: 'PAID',
            method: 'razorpay',
            paymentType: PaymentType.EXTRA_TIME,
            booking: bookingId
        });


            // Get booking and store lockerNumber before modifications
            const booking = await Booking.findById(bookingId)
            .populate<{locker:ILocker}>('locker')
            .session(session);

            if (!booking) {
                throw new NotFoundException('Booking not found', ErrorCode.FILE_NOT_FOUND);
            }
            
            const lockerNumber = booking.locker.lockerNumber.toString();

        // 3. Update booking (same pattern as initial booking)
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                $push: { payments: payment._id },
                $inc: { extraTime: extraTimeSeconds }
               
            },
            { new: true, session }
        ).populate('locker lockerStation');

       

        // 4. Perform final checkout operations
        await performCheckout(booking, session, new Date());
        
        // 5. Save everything atomically
        await payment.save({ session });
        await session.commitTransaction();


             // After transaction success, open the locker
             try {
                await LockerControllerService.openLocker(lockerNumber);
                console.log(`Locker ${lockerNumber} opened for checkout after extra time payment`);
            } catch (lockerError) {
                console.error('Failed to open locker after extra time payment, but payment was successful:', lockerError);
                // Consider sending a notification to admin here
            }

        res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, { booking, payment }, 'Payment verified and checkout completed')
        );

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

export const directCheckout = async (req: Request, res: Response, next: NextFunction) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId)
        .populate<{locker:ILocker}>({
            path:'locker',
            select:'lockerNumber doorStatus size rentalPrice'
        })
        .populate({
            path:'lockerStation',
            select:'stationName status location address openingHours'
        })
        .session(session);
        
        if (!booking) throw new NotFoundException('Booking not found', ErrorCode.FILE_NOT_FOUND);


        const lockerNumber = (booking.locker as ILocker).lockerNumber.toString()
      


        await performCheckout(booking, session, new Date());
        await session.commitTransaction();



        // After successful checkout transaction, open the locker
        try {

            await LockerControllerService.openLocker(lockerNumber)
            console.log(`Locker ${lockerNumber} opened for checkout`);
        } catch (lockerError) {
            console.error('Failed to open locker for checkout, but checkout was successful:', lockerError);
            
        }

        res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, booking, 'Checkout completed successfully'));

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};


async function performCheckout(booking: any, session: mongoose.mongo.ClientSession, checkoutTime: Date) {
    // Update locker status
    const locker = await Locker.findById(booking.locker).session(session);

    if(!locker){
        throw new NotFoundException('Locker not found',ErrorCode.LOCKER_NOT_FOUND)
    }
    locker.status = 'AVAILABLE';
    locker.currentUser = null;
    locker.checkinTime = null;
    locker.expectedCheckoutTime = null;
    await locker.save({ session });

    // Update user
    const user = await User.findById(booking.user).session(session);

    if(!user){
        throw new NotFoundException('User not found',ErrorCode.USER_NOT_FOUND)
    }
    user.currentLocker = null;
    await user.save({ session });

    // Finalize booking
    booking.userCheckoutTime = checkoutTime;
    booking.paymentStatus = 'PAID';
    booking.isExpired =true;
    await booking.save({ session });
    
}

