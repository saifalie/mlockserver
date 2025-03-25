import Razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from '../../secrets.js';
import { InternalException } from '../errors/internal-exception.js';
import { ErrorCode } from '../errors/root.js';

if (!(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET)) {
    throw new InternalException('Credentials not found', ErrorCode.SECRET_KEY_NOT_FOUND, { message: 'razopay credentials not found' });
}

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

export default razorpay;
