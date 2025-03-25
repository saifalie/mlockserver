import { Document, model, Schema, Types } from 'mongoose';

export enum PaymentStatus {
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED'
}


interface Booking extends Document {
    user: Types.ObjectId;
    locker: Types.ObjectId;
    lockerStation:Types.ObjectId
    duration: number;
    checkinTime: Date;
    checkoutTime: Date;
    userCheckoutTime: Date;
    extraTime: number;
    isExpired: boolean;
    rentalPrice: number;
    payments: Types.ObjectId[];
    paymentStatus: PaymentStatus;
    notificationSent:boolean;
}

const bookingSchema = new Schema<Booking>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        locker: {
            type: Schema.Types.ObjectId,
            ref: 'Locker',
            required: true
        },
        lockerStation:{
            type: Schema.Types.ObjectId,
            ref:'LockerStation',
            required:true
        },
        isExpired:{
            type:Boolean,
            required:true,
            default:false
        },
        duration: {
            type: Number,
            required: true
        },
        checkinTime: {
            type: Date,
            // required: true
        },
        checkoutTime: {
            type: Date,
            // required: true
        },
        userCheckoutTime: {
            type: Date
        },
        extraTime: {
            type: Number,
            required: true,
            default: 0
        },
        rentalPrice: {
            type: Number,
            required: true
        },
        paymentStatus: {
            type: String,
            required: true,
            enum: Object.values(PaymentStatus),
            default: PaymentStatus.OVERDUE
        },
        payments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Payment'
            }
        ],
        notificationSent:{
            type:Boolean,
            default:false
        }
    },
    { timestamps: true }
);

bookingSchema.index({
    checkoutTime: 1,
    notificationSent: 1,
    isExpired: 1
  });

export const Booking = model<Booking>('Booking', bookingSchema);
