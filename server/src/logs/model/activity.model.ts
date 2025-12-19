import mongoose, { Schema, Document, Types } from 'mongoose';
import type {IActivityDocument,IBookingActivity,IFailedActivity,IGuests,IInventory,IPolicy,IPropertyActivity,IRateAmount,IRateplan,IRoomActivity,IUser} from "../types/types"
// Guest Schema
const GuestSchema = new Schema<IGuests>({
    firstName: {
        type: String,
        required: [true, 'Guest first name is required.'],
        trim: true,
        maxlength: [50, 'Guest first name cannot exceed 50 characters.']
    },
    lastName: {
        type: String,
        required: [true, 'Guest last name is required.'],
        trim: true,
        maxlength: [50, 'Guest last name cannot exceed 50 characters.']
    },
    dob: {
        type: Date,
        required: [true, 'Guest date of birth is required.'],
        validate: {
            validator: function(value: Date) {
                return value <= new Date();
            },
            message: 'Date of birth cannot be in the future.'
        }
    },
    type: {
        type: String,
        enum: {
            values: ["Adult", "Child"],
            message: 'Guest type must be either Adult or Child.'
        },
        required: [true, 'Guest type is required.']
    }
}, { _id: false });

// Booking Activity Schema
const BookingActivitySchema = new Schema<IBookingActivity>({
    property: {
        code: {
            type: String,
            required: [true, 'Property code is required for booking activity.'],
            trim: true,
            maxlength: [20, 'Property code cannot exceed 20 characters.']
        },
        id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Property ID is required for booking activity.'],
            ref: 'Property'
        }
    },
    room: {
        code: {
            type: String,
            required: [true, 'Room code is required for booking activity.'],
            trim: true,
            maxlength: [20, 'Room code cannot exceed 20 characters.']
        },
        id: {
            type: Schema.Types.ObjectId,
            required: [true, 'Room ID is required for booking activity.'],
            ref: 'Room'
        }
    },
    ratePlanCode: {
        type: String,
        required: [true, 'Rate plan code is required for booking activity.'],
        trim: true,
        maxlength: [50, 'Rate plan code cannot exceed 50 characters.']
    },
    amount: {
        type: Number,
        required: [true, 'Booking amount is required.'],
        min: [0, 'Booking amount cannot be negative.']
    },
    currencyCode: {
        type: String,
        required: [true, 'Currency code is required for booking activity.'],
        trim: true,
        length: [3, 'Currency code must be exactly 3 characters.'],
        uppercase: true
    },
    guests: {
        type: [GuestSchema],
        required: [true, 'At least one guest is required for booking.'],
        validate: {
            validator: function(guests: any[]) {
                return guests && guests.length > 0;
            },
            message: 'At least one guest must be provided for the booking.'
        }
    },
    bookingUserEmail: {
        type: String,
        required: [true, 'Booking user email is required.'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.']
    },
    bookingUserPhoneNo: {
        type: String,
        required: [true, 'Booking user phone number is required.'],
        trim: true,
        match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number.']
    },
    bookingDate: {
        type: Date,
        required: [true, 'Booking date is required.'],
        default: Date.now
    },
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required.'],
        validate: {
            validator: function(value: Date) {
                return value >= new Date(new Date().setHours(0, 0, 0, 0));
            },
            message: 'Check-in date cannot be in the past.'
        }
    },
    checkoutDate: {
        type: Date,
        required: [true, 'Checkout date is required.'],
        validate: {
            validator: function(this: any, value: Date) {
                return value > this.checkInDate;
            },
            message: 'Checkout date must be after check-in date.'
        }
    },
    paymentType: {
        type: String,
        required: [true, 'Payment type is required for booking activity.'],
        trim: true,
        maxlength: [50, 'Payment type cannot exceed 50 characters.']
    },
    bookingStatus: {
        type: String,
        enum: {
            values: ["Confirmed", "Pending", "Cancelled", "Modified"],
            message: 'Booking status must be one of: Confirmed, Pending, Cancelled, Modified.'
        },
        required: [true, 'Booking status is required.']
    },
    finalPrice: {
        type: Schema.Types.Mixed,
        required: [true, 'Final price is required for booking activity.']
    },
    bookingCode: {
        type: String,
        required: [true, 'Booking code is required.'],
        trim: true,
        unique: true,
        maxlength: [50, 'Booking code cannot exceed 50 characters.']
    },
    cancellationReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters.']
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for booking activity.']
    },
    message: {
        type: String,
        required: [true, 'Activity message is required for booking activity.'],
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// Property Activity Schema
const PropertyActivitySchema = new Schema<IPropertyActivity>({
    propertyName: {
        type: String,
        required: [true, 'Property name is required for property activity.'],
        trim: true,
        maxlength: [200, 'Property name cannot exceed 200 characters.']
    },
    creator: {
        firstName: {
            type: String,
            required: [true, 'Creator first name is required.'],
            trim: true,
            maxlength: [50, 'Creator first name cannot exceed 50 characters.']
        },
        lastName: {
            type: String,
            required: [true, 'Creator last name is required.'],
            trim: true,
            maxlength: [50, 'Creator last name cannot exceed 50 characters.']
        },
        email: {
            type: String,
            required: [true, 'Creator email is required.'],
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid creator email address.']
        },
        role: {
            type: String,
            required: [true, 'Creator role is required.'],
            trim: true,
            maxlength: [50, 'Creator role cannot exceed 50 characters.']
        }
    },
    address: {
        type: String,
        required: [true, 'Property address is required.'],
        trim: true,
        maxlength: [500, 'Property address cannot exceed 500 characters.']
    },
    propertyEmail: {
        type: String,
        required: [true, 'Property email is required.'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid property email address.']
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for property activity.']
    },
    field: {
        type: String,
        enum: {
            values: ["address", "propertyCatrgory", "destinationType", "propertyType", "propertyAddress", "propertyAmenities", "ratePlan"],
            message: 'Field must be one of: address, propertyCatrgory, destinationType, propertyType, propertyAddress, propertyAmenities, ratePlan.'
        },
        required: [true, 'Field is required for property activity.']
    },
    message: {
        type: String,
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// Room Activity Schema
const RoomActivitySchema = new Schema<IRoomActivity>({
    propertyName: {
        type: String,
        required: [true, 'Property name is required for room activity.'],
        trim: true,
        maxlength: [200, 'Property name cannot exceed 200 characters.']
    },
    propertyContactEmail: {
        type: String,
        required: [true, 'Property contact email is required for room activity.'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid property contact email address.']
    },
    roomName: {
        type: String,
        required: [true, 'Room name is required for room activity.'],
        trim: true,
        maxlength: [200, 'Room name cannot exceed 200 characters.']
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for room activity.']
    },
    isRoomActive: {
        type: Boolean,
        required: [true, 'Room active status is required.']
    },
    field: {
        type: String,
        enum: {
            values: ["room", "amenities"],
            message: 'Field must be one of: room, amenities.'
        },
        required: [true, 'Field is required for room activity.']
    },
    message: {
        type: String,
        required: [true, 'Activity message is required for room activity.'],
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// Policy Schema
const PolicySchema = new Schema<IPolicy>({
    policyName: {
        type: String,
        required: [true, 'Policy name is required.'],
        trim: true,
        maxlength: [200, 'Policy name cannot exceed 200 characters.']
    },
    type: {
        type: String,
        enum: {
            values: ["Deposit Policies", "Guarantee Policies", "Cancellation Policies"],
            message: 'Policy type must be one of: Deposit Policies, Guarantee Policies, Cancellation Policies.'
        },
        required: [true, 'Policy type is required.']
    },
    propertyCode: {
        type: String,
        required: [true, 'Property code is required for policy.'],
        trim: true,
        maxlength: [20, 'Property code cannot exceed 20 characters.']
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for policy.']
    },
    message: {
        type: String,
        required: [true, 'Activity message is required for policy.'],
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// Inventory Schema
const InventorySchema = new Schema<IInventory>({
    hotelName: {
        type: String,
        required: [true, 'Hotel name is required for inventory activity.'],
        trim: true,
        maxlength: [200, 'Hotel name cannot exceed 200 characters.']
    },
    propertyCode: {
        type: String,
        required: [true, 'Property code is required for inventory activity.'],
        trim: true,
        maxlength: [20, 'Property code cannot exceed 20 characters.']
    },
    roomTypeCode: {
        type: String,
        required: [true, 'Room type code is required for inventory activity.'],
        trim: true,
        maxlength: [50, 'Room type code cannot exceed 50 characters.']
    },
    availability: {
        type: String,
        required: [true, 'Availability is required for inventory activity.'],
        trim: true
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for inventory.']
    },
    message: {
        type: String,
        required: [true, 'Activity message is required for inventory.'],
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// User Schema
const UserSchema = new Schema<IUser>({
    firstName: {
        type: String,
        required: [true, 'User first name is required.'],
        trim: true,
        maxlength: [50, 'User first name cannot exceed 50 characters.']
    },
    lastName: {
        type: String,
        required: [true, 'User last name is required.'],
        trim: true,
        maxlength: [50, 'User last name cannot exceed 50 characters.']
    },
    role: {
        type: String,
        required: [true, 'User role is required.'],
        trim: true,
        maxlength: [50, 'User role cannot exceed 50 characters.']
    },
    level: {
        type: Number,
        required: [true, 'User level is required.'],
        min: [1, 'User level must be at least 1.'],
        max: [10, 'User level cannot exceed 10.']
    },
    email: {
        type: String,
        required: [true, 'User email is required.'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid user email address.']
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: [true, 'Creator ID is required for user activity.'],
        ref: 'User'
    },
    creatorLevel: {
        type: Number,
        required: [true, 'Creator level is required.'],
        min: [1, 'Creator level must be at least 1.'],
        max: [10, 'Creator level cannot exceed 10.']
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for user activity.']
    },
    message: {
        type: String,
        required: [true, 'Activity message is required for user activity.'],
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// Rate Amount Schema
const RateAmountSchema = new Schema<IRateAmount>({
    propertyCode: {
        type: String,
        required: [true, 'Property code is required for rate amount activity.'],
        trim: true,
        maxlength: [20, 'Property code cannot exceed 20 characters.']
    },
    hotelName: {
        type: String,
        required: [true, 'Hotel name is required for rate amount activity.'],
        trim: true,
        maxlength: [200, 'Hotel name cannot exceed 200 characters.']
    },
    daterange: {
        from: {
            type: Date,
            required: [true, 'From date is required for rate amount activity.']
        },
        to: {
            type: Date,
            required: [true, 'To date is required for rate amount activity.'],
            validate: {
                validator: function(this: any, value: Date) {
                    return value > this.daterange.from;
                },
                message: 'To date must be after from date.'
            }
        }
    },
    ratePlanCode: {
        type: String,
        required: [true, 'Rate plan code is required for rate amount activity.'],
        trim: true,
        maxlength: [50, 'Rate plan code cannot exceed 50 characters.']
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for rate amount.']
    },
    message: {
        type: String,
        required: [true, 'Activity message is required for rate amount.'],
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// Rate Plan Schema
const RatePlanSchema = new Schema<IRateplan>({
    propertyCode: {
        type: String,
        required: [true, 'Property code is required for rate plan activity.'],
        trim: true,
        maxlength: [20, 'Property code cannot exceed 20 characters.']
    },
    RatePlanName: {
        type: String,
        required: [true, 'Rate plan name is required.'],
        trim: true,
        maxlength: [200, 'Rate plan name cannot exceed 200 characters.']
    },
    activity: {
        type: String,
        enum: {
            values: ["Create", "Update", "Delete"],
            message: 'Activity type must be one of: Create, Update, Delete.'
        },
        required: [true, 'Activity type is required for rate plan.']
    },
    message: {
        type: String,
        required: [true, 'Activity message is required for rate plan.'],
        trim: true,
        maxlength: [1000, 'Activity message cannot exceed 1000 characters.']
    }
}, { _id: false });

// Failed Activity Schema
const FailedActivitySchema = new Schema<IFailedActivity>({
    failedActivityType: {
        type: String,
        required: [true, 'Failed activity type is required.'],
        trim: true,
        maxlength: [100, 'Failed activity type cannot exceed 100 characters.']
    },
    reason: {
        type: String,
        required: [true, 'Failure reason is required.'],
        trim: true,
        maxlength: [1000, 'Failure reason cannot exceed 1000 characters.']
    }
}, { _id: false });

// Main Activity Schema
const ActivitySchema = new Schema<IActivityDocument>({
    initiatedBy: {
        type: Schema.Types.ObjectId,
        required: [true, 'The user who initiated the activity is required.'],
        ref: 'User'
    },
    
    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        required: [true, 'Activity timestamp is required.']
    },

    // IP Address for tracking
    ipAddress: {
        type: String,
        trim: true,
        match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^(?:[a-fA-F0-9]*:){2,7}[a-fA-F0-9]*$/, 'Please provide a valid IP address.']
    },

    // User Agent for tracking
    userAgent: {
        type: String,
        trim: true,
        maxlength: [500, 'User agent cannot exceed 500 characters.']
    },

    // Activity Type for easy filtering
    activityType: {
        type: String,
        enum: {
            values: ['booking', 'property', 'room', 'policy', 'inventory', 'user', 'rateAmount', 'ratePlan', 'failed'],
            message: 'Activity type must be one of: booking, property, room, policy, inventory, user, rateAmount, ratePlan, failed.'
        },
        required: [true, 'Activity type is required for categorization.']
    },
    bookingActivity: BookingActivitySchema,
    propertyActivity: PropertyActivitySchema,
    roomActivity: RoomActivitySchema,
    policy: PolicySchema,
    inventory: InventorySchema,
    userActivity: UserSchema,
    rateAmount: RateAmountSchema,
    ratePlan: RatePlanSchema,
    failedActivity: FailedActivitySchema

}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'activities'
});

// Indexes for faster queries
ActivitySchema.index({ initiatedBy: 1, timestamp: -1 }); 
ActivitySchema.index({ activityType: 1, timestamp: -1 }); 
ActivitySchema.index({ timestamp: -1 }); // Recent activities
ActivitySchema.index({ 'bookingActivity.property.code': 1 }); 
ActivitySchema.index({ 'bookingActivity.bookingUserEmail': 1 }); 
ActivitySchema.index({ 'propertyActivity.propertyEmail': 1 }); 
ActivitySchema.index({ 'propertyActivity.creator.email': 1 }); 
ActivitySchema.index({ 'userActivity.email': 1 }); 
ActivitySchema.index({ 'policy.propertyCode': 1 }); 
ActivitySchema.index({ 'inventory.propertyCode': 1, 'inventory.roomTypeCode': 1 }); 
ActivitySchema.index({ 'rateAmount.propertyCode': 1, 'rateAmount.ratePlanCode': 1 }); 
ActivitySchema.index({ 'ratePlan.propertyCode': 1 }); 
ActivitySchema.index({ ipAddress: 1, timestamp: -1 });
ActivitySchema.index({ createdAt: -1 }); 
ActivitySchema.index({ updatedAt: -1 }); 

// Compound indexes for complex queries
ActivitySchema.index({ 
    activityType: 1, 
    'bookingActivity.bookingStatus': 1, 
    timestamp: -1 
}); // Booking status queries

ActivitySchema.index({
    'bookingActivity.property.code': 1,
    'bookingActivity.checkInDate': 1,
    'bookingActivity.checkoutDate': 1
}); // Property booking date range queries

// Pre-save validation to ensure only one activity type is populated
ActivitySchema.pre('save', function(next) {
    const activityFields = [
        'bookingActivity', 'propertyActivity', 'roomActivity', 
        'policy', 'inventory', 'userActivity', 
        'rateAmount', 'ratePlan', 'failedActivity'
    ];
    
    const populatedFields = activityFields.filter(field => this[field as keyof typeof this]);
    
    if (populatedFields.length !== 1) {
        return next(new Error('Exactly one activity type must be populated.'));
    }
    
    next();
});
export const Activity = mongoose.model<IActivityDocument>('Activity', ActivitySchema);

export default Activity;