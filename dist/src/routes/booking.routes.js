import { Router } from "express";
import { errorHandler } from "../utils/error-handler.js";
import { cancelBooking, createBooking, directCheckout, fetchBookingDetails, processExtraTimePayment, verifyCheckoutPayment, verifyPayment } from "../controllers/booking/booking.controller.js";
import auth from "../middlewares/authentication.js";
const bookingRoutes = Router();
bookingRoutes.route('/create').post(errorHandler(auth), errorHandler(createBooking));
bookingRoutes.route('/verify').post(errorHandler(auth), errorHandler(verifyPayment));
bookingRoutes.route('/tracking').get(errorHandler(auth), errorHandler(fetchBookingDetails));
bookingRoutes.route('/cancel').post(errorHandler(auth), errorHandler(cancelBooking));
bookingRoutes.route('/extra-time-payment').post(errorHandler(auth), errorHandler(processExtraTimePayment));
bookingRoutes.route('/verify-checkout').post(errorHandler(auth), errorHandler(verifyCheckoutPayment));
bookingRoutes.route('/direct-checkout').post(errorHandler(auth), errorHandler(directCheckout));
export default bookingRoutes;
//# sourceMappingURL=booking.routes.js.map