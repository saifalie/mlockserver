import { model, Schema } from 'mongoose';
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PAID"] = "PAID";
    PaymentStatus["OVERDUE"] = "OVERDUE";
    PaymentStatus["PENDING"] = "PENDING";
})(PaymentStatus || (PaymentStatus = {}));
const bookingSchema = new Schema({
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
    duration: {
        type: Number,
        required: true
    },
    checkin_time: {
        type: Date,
        required: true
    },
    checkout_time: {
        type: Date,
        required: true
    },
    user_checkout_time: {
        type: Date
    },
    extra_time: {
        type: Number,
        required: true,
        default: 0
    },
    rental_price: {
        type: Number,
        required: true
    },
    payment_status: {
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
    ]
}, { timestamps: true });
export const Booking = model('Booking', bookingSchema);
//# sourceMappingURL=booking.model.js.map