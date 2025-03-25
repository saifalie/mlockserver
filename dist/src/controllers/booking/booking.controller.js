import razorpay from '../../config/razopay.js';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse } from '../../utils/apiResponse.js';
import { Booking, PaymentStatus } from '../../models/booking.model.js';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../../../secrets.js';
import { Payment } from '../../models/payment.model.js';
import * as crypto from 'crypto';
import { InternalException } from '../../errors/internal-exception.js';
import { ErrorCode } from '../../errors/root.js';
export const createBooking = async (req, res, next) => {
    const { amount, currency, locker, duration, rental_price } = req.body;
    const options = {
        amount: amount * 100,
        currency,
        receipt: `receipt_${Date.now()}`
    };
    try {
        const bookingPayment = await razorpay.orders.create(options);
        const booking = await Booking.create({
            user: req.user._id,
            locker,
            duration,
            rental_price,
            payment_status: PaymentStatus.PENDING
        });
        res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, {
            payment: bookingPayment,
            booking: booking
        }, 'booking created'));
    }
    catch (error) {
        console.log('Booking creating failed');
    }
};
export const verifyPayment = async (req, res, next) => {
    const { orderId, paymentId, signature, amount, currency, status, method } = req.body;
    if (!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)) {
        throw new InternalException('Credentials not found', ErrorCode.SECRET_KEY_NOT_FOUND, { message: 'razopay credentials not found' });
    }
    const generateSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(orderId + '|' + paymentId)
        .digest('hex');
    if (generateSignature === signature) {
        const payment = new Payment({
            order_id: orderId,
            payment_id: paymentId,
            signature: signature,
            amount,
            currency,
            status,
            method
        });
        try {
            await payment.save();
            res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, payment, 'payment successfully done'));
        }
        catch (error) {
            console.log('Payment verification failed');
            throw new InternalException('Payment verification failed', ErrorCode.INVALID_TOKEN, error);
        }
    }
    else {
        throw new InternalException('Payment verification failed', ErrorCode.INVALID_TOKEN, { error: 'error' });
    }
};
//# sourceMappingURL=booking.controller.js.map