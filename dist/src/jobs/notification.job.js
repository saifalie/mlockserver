import cron from 'node-cron';
import { Booking } from '../models/booking.model.js';
import admin from '../config/firebase.js';
export class NotificationJob {
    static initialize() {
        // Check every 10 seconds (better for production)
        cron.schedule('*/10 * * * * *', () => {
            this.checkBookings();
            console.log('Cron job check initiated at', new Date().toISOString());
        });
    }
    static async checkBookings() {
        try {
            const now = new Date();
            const checkWindowEnd = new Date(now.getTime() + 11000); // 11 seconds ahead
            // Optimized query with projection and lean
            const bookings = await Booking.find({
                checkoutTime: {
                    $gte: now,
                    $lte: checkWindowEnd
                },
                notificationSent: false,
                isExpired: false
            })
                .select('_id checkoutTime user notificationSent') // Only get needed fields
                .populate({
                path: 'user',
                select: 'fcmToken', // Only get FCM token from user
                options: { lean: true }
            })
                .lean(); // Get plain JS objects instead of full documents
            console.log(`Found ${bookings.length} expiring bookings`);
            for (const booking of bookings) {
                const user = booking.user;
                if (user?.fcmToken) {
                    try {
                        await admin.messaging().send({
                            token: user.fcmToken,
                            notification: {
                                title: 'Booking Expiring Soon',
                                body: 'Your locker booking will expire in 10 seconds!'
                            }
                        });
                        // Update only the notificationSent field
                        await Booking.updateOne({ _id: booking._id }, { $set: { notificationSent: true } });
                        console.log(`Notification sent for booking ${booking._id}`);
                    }
                    catch (fcmError) {
                        console.error(`FCM failed for booking ${booking._id}:`, fcmError);
                    }
                }
            }
        }
        catch (error) {
            console.error('Cron job error:', error);
        }
    }
}
//# sourceMappingURL=notification.job.js.map