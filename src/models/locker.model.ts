import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILocker extends Document {
    lockerNumber: number;
    status: string;
    doorStatus: string;
    currentUser?: Types.ObjectId | null;
    size: string;
    checkinTime: Date | null;
    expectedCheckoutTime: Date| null;
    checkoutTime:Date | null;
    extraTime: number;
    rentalPrice: number;
    history: Types.ObjectId[];
}

const lockerSchema = new Schema<ILocker>({
    lockerNumber: {
        type: Number,
        required: true,
        unique: false,
     
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE'],
        default: 'AVAILABLE'
    },
    doorStatus: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'CLOSED'
    },
    currentUser: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default:null
    },
    size: {
        type: String,
        enum: ['SMALL', 'MEDIUM', 'LARGE'],
        default: 'MEDIUM'
    },
    checkinTime: {
        type: Date,
        default:null
    },
    expectedCheckoutTime: {
        type: Date,
        default:null
    },
    checkoutTime: {
        type: Date
    },
    extraTime: {
        type: Number
    },
    rentalPrice: {
        type: Number,
        required: true,
        default: 20
    },
    history: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Booking'
        }
    ]
},{timestamps:true});

lockerSchema.pre('save', function (next) {
    switch (this.size) {
        case 'SMALL':
            this.rentalPrice = 0.3;
            break;

        case 'MEDIUM':
            this.rentalPrice = 0.5;
            break;

        case 'LARGE':
            this.rentalPrice = 0.8;
            break;

        default:
            this.rentalPrice = 0.5;
    }

    next();
});

export const Locker = mongoose.model<ILocker>('Locker', lockerSchema);
