import { model, Schema } from 'mongoose';
var Currency;
(function (Currency) {
    Currency["INR"] = "INR";
})(Currency || (Currency = {}));
const paymentSchema = new Schema({
    order_id: {
        type: String,
        required: true
    },
    payment_id: {
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
    card_id: {
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