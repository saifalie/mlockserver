import { Document, model, Schema } from 'mongoose';

enum Currency {
    INR = 'INR'
}
export enum PaymentType{
   INITIAL = 'INITIAL',
   EXTRA_TIME = 'EXTRA_TIME'
}

interface Payment extends Document {
    orderId: string;
    paymentId: string;
    signature: string;
    amount: number;
    currency: Currency;
    status: string;
    method: string;
    cardId: string;
    bank: string;
    wallet: string;
    paymentType:PaymentType
}

const paymentSchema = new Schema<Payment>({
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
    paymentType:{
        type:String,
        required:true,
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
},{timestamps:true});

export const Payment = model<Payment>('Payment', paymentSchema);
