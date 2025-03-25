import mongoose, { Schema } from 'mongoose';
var WeekDay;
(function (WeekDay) {
    WeekDay["MONDAY"] = "Mon";
    WeekDay["TUESDAY"] = "Tue";
    WeekDay["WEDNESDAY"] = "Wed";
    WeekDay["THURSDAY"] = "Thu";
    WeekDay["FRIDAY"] = "Fri";
    WeekDay["SATURDAY"] = "Sat";
    WeekDay["SUNDAY"] = "Sun";
})(WeekDay || (WeekDay = {}));
const LockerStationSchema = new Schema({
    station_name: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'MAINTENANCE'],
        default: 'CLOSED'
    },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
        }
    },
    address: { type: String, required: true },
    images: [
        {
            url: {
                type: String,
                required: true
            }
        }
    ],
    ratings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Rating'
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    lockers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Locker'
        }
    ],
    opening_hours: [
        {
            day: {
                type: String,
                enum: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
                default: 'Mon'
            },
            opens_at: {
                type: String,
                default: '06:00'
            },
            closes_at: {
                type: String,
                default: '22:00'
            },
            is_closed: {
                type: Boolean,
                default: false
            }
        }
    ],
    markedFavourite: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, { timestamps: true });
export const LockerStation = mongoose.model('LockerStation', LockerStationSchema);
//# sourceMappingURL=lockerStation.model.js.map