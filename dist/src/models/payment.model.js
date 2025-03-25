import { model, Schema } from 'mongoose';
var Currency;
(function (Currency) {
    Currency["INR"] = "INR";
})(Currency || (Currency = {}));
export var PaymentType;
(function (PaymentType) {
    PaymentType["INITIAL"] = "INITIAL";
    PaymentType["EXTRA_TIME"] = "EXTRA_TIME";
})(PaymentType || (PaymentType = {}));
const paymentSchema = new Schema({
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        enum: Object.values(Currency),
        default: Currency.INR
    },
    status: {
        type: String,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    paymentType: {
        type: String,
        required: true,
        enum: Object.values(PaymentType),
    },
    cardId: {
        type: String
    },
    bank: {
        type: String
    },
    wallet: {
        type: String
    }
}, { timestamps: true });
export const Payment = model('Payment', paymentSchema);
//# sourceMappingURL=payment.model.js.map