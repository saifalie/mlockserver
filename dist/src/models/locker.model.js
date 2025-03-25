import mongoose, { Schema } from 'mongoose';
const lockerSchema = new Schema({
    locker_number: {
        type: Number,
        required: true,
        unique: false
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE'],
        default: 'AVAILABLE'
    },
    door_status: {
        type: String,
        enum: ['OPEN', 'CLOSED'],
        default: 'CLOSED'
    },
    current_user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    size: {
        type: String,
        enum: ['SMALL', 'MEDIUM', 'LARGE'],
        default: 'MEDIUM'
    },
    checkin_time: {
        type: Date
    },
    expected_checkout_time: {
        type: Date
    },
    checkout_time: {
        type: Date
    },
    extra_time: {
        type: Number
    },
    rental_price: {
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
}, { timestamps: true });
lockerSchema.pre('save', function (next) {
    switch (this.size) {
        case 'SMALL':
            this.rental_price = 0.3;
            break;
        case 'MEDIUM':
            this.rental_price = 0.5;
            break;
        case 'LARGE':
            this.rental_price = 0.8;
            break;
        default:
            this.rental_price = 0.5;
    }
    next();
});
export const Locker = mongoose.model('Locker', lockerSchema);
//# sourceMappingURL=locker.model.js.map